from flask import Blueprint, request, jsonify, send_file, session
from core.security import verify_view_token
from config.settings import UPLOAD_ROOT, ALLOWED_EXT, MAX_FILE_MB
from adapters.repository_factory import get_repository
import os, uuid

bp = Blueprint('files', __name__)
repo = get_repository()

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
        os.makedirs(sign_folder, exist_ok=True)
        
        # 파일명 확인 (sMem_id_sMem_name.png 형식)
        filename = f.filename
        if not filename:
            return jsonify({'ok': False, 'error': '파일명이 없습니다.'}), 400
        
        # 파일 저장
        file_path = os.path.join(sign_folder, filename)
        f.save(file_path)
        
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
        repo.create_attachment(ticket_id, path, f.filename, f.mimetype, size)
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
