from flask import Blueprint, request, jsonify, send_file, session
from core.security import verify_view_token
from config.settings import UPLOAD_ROOT, ALLOWED_EXT, MAX_FILE_MB
from adapters.repository_factory import get_repository
import os, uuid

bp = Blueprint('files', __name__)

# Repository를 지연 초기화 (DATABASE_URL이 설정된 후에 초기화되도록)
_repo = None
def get_repo():
    """Repository 인스턴스를 지연 초기화하여 반환"""
    global _repo
    if _repo is None:
        _repo = get_repository()
    return _repo

ADMIN_SESSION_KEY = 'admin_logged_in'

@bp.post('/upload-signature')
def upload_signature():
    """서명 이미지 업로드 (회원가입용)"""
    try:
        f = request.files.get('file')
        if not f:
            return jsonify({'ok': False, 'error': '파일이 없습니다.'}), 400
        
        # 서명 파일 저장 폴더
        sign_folder = os.path.join(UPLOAD_ROOT, 'sign_file')
        
        # 디렉토리 생성 및 쓰기 권한 설정 (cloudtype.io 호환)
        try:
            # 디렉토리 생성 (mode는 선택적, cloudtype.io에서는 무시될 수 있음)
            os.makedirs(sign_folder, exist_ok=True)
            
            # 디렉토리 쓰기 권한 확인
            if not os.access(sign_folder, os.W_OK):
                # 쓰기 권한이 없으면 /tmp 사용 시도
                if UPLOAD_ROOT.startswith('/tmp'):
                    # 이미 /tmp를 사용 중이면 다른 경로 시도
                    alt_folder = os.path.join(os.path.expanduser('~'), 'uploads', 'sign_file')
                    try:
                        os.makedirs(alt_folder, exist_ok=True)
                        if os.access(alt_folder, os.W_OK):
                            sign_folder = alt_folder
                            print(f"✅ 대체 경로 사용: {sign_folder}")
                        else:
                            raise PermissionError(f"대체 경로도 쓰기 불가: {alt_folder}")
                    except Exception as alt_e:
                        print(f"⚠️ 대체 경로 생성 실패: {alt_e}")
                        raise PermissionError(f"쓰기 가능한 디렉토리를 찾을 수 없습니다. 원본: {sign_folder}")
                else:
                    raise PermissionError(f"디렉토리 쓰기 권한 없음: {sign_folder}")
            
            # 권한 설정 시도 (실패해도 계속 진행)
            try:
                os.chmod(sign_folder, 0o755)
            except (PermissionError, OSError):
                pass  # chmod 실패는 무시 (이미 존재하는 디렉토리일 수 있음)
                
        except (PermissionError, OSError) as e:
            print(f"❌ 디렉토리 생성/권한 오류: {e}")
            print(f"   UPLOAD_ROOT: {UPLOAD_ROOT}")
            print(f"   sign_folder: {sign_folder}")
            return jsonify({
                'ok': False, 
                'error': f'디렉토리 생성 권한 오류: {str(e)}. 경로: {sign_folder}'
            }), 500
        
        # 파일명 확인 (sMem_id_sMem_name.png 형식)
        filename = f.filename
        if not filename:
            return jsonify({'ok': False, 'error': '파일명이 없습니다.'}), 400
        
        # 파일 저장
        file_path = os.path.join(sign_folder, filename)
        
        # 파일 저장 전 디렉토리 쓰기 권한 재확인
        if not os.access(sign_folder, os.W_OK):
            return jsonify({
                'ok': False, 
                'error': f'디렉토리 쓰기 권한 없음: {sign_folder}'
            }), 500
        
        try:
            # 파일 저장
            f.save(file_path)
            
            # 파일 저장 확인
            if not os.path.exists(file_path):
                return jsonify({
                    'ok': False, 
                    'error': f'파일 저장 실패: 파일이 생성되지 않았습니다. 경로: {file_path}'
                }), 500
            
            # 파일 읽기 권한 확인
            if not os.access(file_path, os.R_OK):
                print(f"⚠️ 저장된 파일 읽기 권한 없음: {file_path}")
            
            # 파일 권한 설정 시도 (실패해도 계속 진행)
            try:
                os.chmod(file_path, 0o644)
            except (PermissionError, OSError) as chmod_error:
                # chmod 실패해도 파일은 저장되었으므로 경고만 출력
                print(f"⚠️ 파일 권한 설정 실패 (파일은 저장됨): {chmod_error}")
                
        except PermissionError as pe:
            # 권한 오류 시 상세 정보 포함
            print(f"❌ 파일 저장 권한 오류: {pe}")
            print(f"   파일 경로: {file_path}")
            print(f"   디렉토리: {sign_folder}")
            print(f"   디렉토리 존재: {os.path.exists(sign_folder)}")
            print(f"   디렉토리 쓰기 가능: {os.access(sign_folder, os.W_OK) if os.path.exists(sign_folder) else 'N/A'}")
            return jsonify({
                'ok': False, 
                'error': f'파일 저장 권한 오류: {str(pe)}. 경로: {file_path}'
            }), 500
        except Exception as e:
            # 기타 오류
            print(f"❌ 파일 저장 오류: {e}")
            print(f"   파일 경로: {file_path}")
            print(f"   오류 타입: {type(e).__name__}")
            return jsonify({
                'ok': False, 
                'error': f'파일 저장 오류: {str(e)}. 경로: {file_path}'
            }), 500
        
        # 상대 경로 반환
        relative_path = os.path.join('uploads', 'sign_file', filename).replace('\\', '/')
        
        return jsonify({
            'ok': True,
            'path': relative_path,
            'message': '서명 이미지가 업로드되었습니다.'
        })
        
    except Exception as e:
        print(f"❌ 서명 이미지 업로드 오류: {e}")
        return jsonify({'ok': False, 'error': str(e)}), 500

@bp.post('/<ticket_id>/upload')
def upload(ticket_id):
    token = request.cookies.get('view_token')
    is_user = token and verify_view_token(token, ticket_id)
# 권한 변경/ 잠시대기------    
    #is_admin = session.get(ADMIN_SESSION_KEY, False)
    #if not (is_user or is_admin):
    #    return ('', 403)
    #-----
    is_admin = session.get(ADMIN_SESSION_KEY, False)
    if not (is_admin):
        return ('', 403)
#---------------------
    f = request.files.get('file')
    if not f: return jsonify({'ok':False,'error':'파일 없음'}), 400
    ext = os.path.splitext(f.filename)[1].lower()
    if ext not in ALLOWED_EXT: return jsonify({'ok':False,'error':'허용되지 않는 확장자'}), 400
    f.seek(0, os.SEEK_END); size = f.tell(); f.seek(0)
    if size > MAX_FILE_MB*1024*1024: return jsonify({'ok':False,'error':'파일이 너무 큼'}), 400
    folder = os.path.join(UPLOAD_ROOT, ticket_id)
    os.makedirs(folder, exist_ok=True)
    file_id = str(uuid.uuid4()) + ext
    path = os.path.join(folder, file_id)
    f.save(path)
    try:
        get_repo().create_attachment(ticket_id, path, f.filename, f.mimetype, size)
    except Exception:
        pass
    return jsonify({'ok': True, 'file_id': file_id})

@bp.get('/<ticket_id>/download/<file_id>')
def download(ticket_id, file_id):
    token = request.cookies.get('view_token')
    is_user = token and verify_view_token(token, ticket_id)
    is_admin = session.get(ADMIN_SESSION_KEY, False)
    if not (is_user or is_admin):
        return ('', 403)
    path = os.path.join(UPLOAD_ROOT, ticket_id, file_id)
    if not os.path.exists(path): return jsonify({'error':'not found'}), 404
    return send_file(path, as_attachment=True)
