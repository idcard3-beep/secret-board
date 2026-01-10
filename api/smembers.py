from flask import Blueprint, request, jsonify
from adapters.repository_factory import get_repository
import bcrypt
from datetime import datetime

bp = Blueprint('smembers', __name__)

# Repository를 지연 초기화 (DATABASE_URL이 설정된 후에 초기화되도록)
_repo = None
def get_repo():
    """Repository 인스턴스를 지연 초기화하여 반환"""
    global _repo
    if _repo is None:
        _repo = get_repository()
    return _repo

def clean_member_data(data):
    """회원 데이터 정리: 빈 문자열을 적절한 값으로 변환"""
    cleaned = {}
    
    # 정수형 필드 목록
    integer_fields = [
        'smem_birth_year', 'smem_choice1', 'smem_choice2', 'smem_choice3', 
        'smem_choice4', 'smem_choice5', 'smem_choice6', 'smem_choice7', 
        'smem_choice8', 'smem_choice9', 'smem_choice10', 'smem_choice11', 
        'smem_choice12', 'smem_agreement', 'smem_agree'
    ]
    
    print(f"🔍 clean_member_data - 입력 데이터 키: {list(data.keys())}")
    print(f"🔍 clean_member_data - is_leap_month: {data.get('is_leap_month')}, 타입: {type(data.get('is_leap_month'))}")
    print(f"🔍 clean_member_data - signature_file: {data.get('signature_file')}")
    
    for key, value in data.items():
        # is_leap_month는 boolean으로 변환 (smem_yundal)
        if key == 'is_leap_month':
            if value == '' or value is None:
                cleaned[key] = False
                print(f"🔍 is_leap_month: 빈 값 -> False")
            else:
                # 이미 boolean이면 그대로 사용
                if isinstance(value, bool):
                    cleaned[key] = value
                # 0, '0', False는 False, 그 외는 True
                else:
                    cleaned[key] = bool(value) and value != 0 and str(value).lower() not in ('0', 'false', '')
                print(f"🔍 is_leap_month 변환: {value} (타입: {type(value)}) -> {cleaned[key]} (타입: {type(cleaned[key])})")
        # 정수형 필드 처리
        elif key in integer_fields:
            if value == '' or value is None:
                cleaned[key] = 0  # 빈 문자열이나 None은 0으로
            else:
                try:
                    cleaned[key] = int(value)
                except (ValueError, TypeError):
                    cleaned[key] = 0
        # 문자열 필드 처리 (signature_file 포함)
        else:
            if value == '':
                cleaned[key] = None  # 빈 문자열은 NULL로
            else:
                cleaned[key] = value
                # signature_file 디버깅
                if key == 'signature_file':
                    print(f"📁 clean_member_data - signature_file 처리: {value}")
    
    print(f"✅ clean_member_data - 정리된 데이터 키: {list(cleaned.keys())}")
    print(f"✅ clean_member_data - is_leap_month 최종값: {cleaned.get('is_leap_month')}, 타입: {type(cleaned.get('is_leap_month'))}")
    print(f"✅ clean_member_data - signature_file 최종값: {cleaned.get('signature_file')}")
    
    return cleaned

@bp.get('/')
def get_all_members():
    """모든 회원 조회"""
    try:
        members = get_repo().get_smembers()
        return jsonify({'ok': True, 'data': members})
    except Exception as e:
        print(f"❌ 회원 목록 조회 실패: {e}")
        return jsonify({'ok': False, 'error': str(e)}), 500

@bp.get('/check/<smem_id>')
def check_member_id(smem_id):
    """회원 ID 중복 확인 - DB 테이블에서 실제 존재 여부 확인"""
    try:
        print(f"🔍 ID 중복 확인 요청: {smem_id}")
        members = get_repo().get_smembers()
        
        # 입력한 ID와 정확히 일치하는 회원이 있는지 확인 (대소문자 구분 없이)
        exists = any(
            (member.get('smem_id') or member.get('smem_id') or '').strip().lower() == smem_id.strip().lower()
            for member in members
        )
        
        print(f"✅ 중복 여부: {exists} (확인한 ID: {smem_id})")
        return jsonify({'exists': exists})
    except Exception as e:
        print(f"❌ ID 중복 확인 실패: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'exists': False, 'error': str(e)}), 500

@bp.get('/<int:sm_id>')
def get_member(sm_id):
    """특정 회원 조회"""
    try:
        member = get_repo().get_smember_by_id(sm_id)
        if member:
            return jsonify({'ok': True, 'data': member})
        else:
            return jsonify({'ok': False, 'error': '회원을 찾을 수 없습니다.'}), 404
    except Exception as e:
        print(f"❌ 회원 조회 실패: {e}")
        return jsonify({'ok': False, 'error': str(e)}), 500

@bp.post('/')
def create_member():
    """새 회원 생성"""
    try:
        data = request.get_json() or {}
        
        # 필수 필드 검증
        if not data.get('smem_id'):
            return jsonify({'ok': False, 'error': '회원 ID는 필수입니다.'}), 400
        
        if not data.get('smem_pwdHash'):
            return jsonify({'ok': False, 'error': '비밀번호는 필수입니다.'}), 400
        
        # 데이터 정리
        data = clean_member_data(data)
        
        # 비밀번호 해시 처리 (이미 해시된 경우가 아니라면)
        if data.get('smem_pwdHash') and not data['smem_pwdHash'].startswith('$2'):
            # bcrypt 해시 생성 (salt는 해시에 포함됨)
            salt = bcrypt.gensalt()
            pwd_hash = bcrypt.hashpw(data['smem_pwdHash'].encode(), salt)
            data['smem_pwdHash'] = pwd_hash.decode()
            # salt를 별도로 저장 (선택사항, bcrypt는 salt를 해시에 포함하지만 별도 저장도 가능)
            if not data.get('smem_pwd_salt'):
                import base64
                data['smem_pwd_salt'] = base64.b64encode(salt).decode('utf-8')
        
        # 회원 생성
        new_member = get_repo().create_smember(data)
        return jsonify({'ok': True, 'data': new_member}), 201
        
    except Exception as e:
        print(f"❌ 회원 생성 실패: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'ok': False, 'error': str(e)}), 500

@bp.put('/<int:sm_id>')
def update_member(sm_id):
    """회원 정보 수정"""
    try:
        data = request.get_json() or {}
        
        # 데이터 정리
        data = clean_member_data(data)
        
        # 비밀번호가 있고 해시되지 않은 경우 해시 처리
        if data.get('smem_pwdHash') and not data['smem_pwdHash'].startswith('$2'):
            # bcrypt 해시 생성 (salt는 해시에 포함됨)
            salt = bcrypt.gensalt()
            pwd_hash = bcrypt.hashpw(data['smem_pwdHash'].encode(), salt)
            data['smem_pwdHash'] = pwd_hash.decode()
            # salt를 별도로 저장 (선택사항, bcrypt는 salt를 해시에 포함하지만 별도 저장도 가능)
            if not data.get('smem_pwd_salt'):
                import base64
                data['smem_pwd_salt'] = base64.b64encode(salt).decode('utf-8')
        
        # 회원 수정
        updated_member = get_repo().update_smember(sm_id, data)
        
        if updated_member:
            return jsonify({'ok': True, 'data': updated_member})
        else:
            return jsonify({'ok': False, 'error': '회원을 찾을 수 없습니다.'}), 404
            
    except Exception as e:
        print(f"❌ 회원 수정 실패: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'ok': False, 'error': str(e)}), 500

@bp.delete('/<int:sm_id>')
def delete_member(sm_id):
    """회원 삭제"""
    try:
        success = get_repo().delete_smember(sm_id)
        
        if success:
            return jsonify({'ok': True, 'message': '회원이 삭제되었습니다.'})
        else:
            return jsonify({'ok': False, 'error': '회원을 찾을 수 없습니다.'}), 404
            
    except Exception as e:
        print(f"❌ 회원 삭제 실패: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'ok': False, 'error': str(e)}), 500

@bp.post('/login')
def login():
    """회원 로그인 - bcrypt 비밀번호 검증"""
    try:
        data = request.get_json() or {}
        
        # 필수 필드 검증
        login_id = data.get('smem_id', '').strip()
        password = data.get('password', '')
        
        print(f"🔐 로그인 시도: ID={login_id}, 비밀번호 길이={len(password)}")
        
        if not login_id:
            print("❌ 아이디 없음")
            return jsonify({'ok': False, 'error': '아이디를 입력하세요.'}), 400
        
        if not password:
            print("❌ 비밀번호 없음")
            return jsonify({'ok': False, 'error': '비밀번호를 입력하세요.'}), 400
        
        # 모든 회원 조회
        members = get_repo().get_smembers()
        print(f"📊 DB에서 {len(members)}명의 회원 조회")
        
        # 첫 번째 회원의 키 확인 (디버깅용)
        if members:
            print(f"🔍 첫 번째 회원의 키 목록: {list(members[0].keys())}")
        
        # 입력한 ID와 일치하는 회원 찾기 (대소문자 구분 없이 비교, 하지만 입력 그대로 유지)
        member = None
        for i, m in enumerate(members):
            # PostgreSQL은 컬럼명을 소문자로 저장할 수 있음
            db_id = m.get('smem_id') or m.get('smem_id', '')
            
            # 대소문자 구분 없이 비교 (입력값 그대로 사용, 비교만 lower()로)
            if str(db_id).strip().lower() == str(login_id).strip().lower():
                member = m
                print(f"✅ 회원 찾음: DB ID={db_id}, 입력 ID={login_id}")
                break
            else:
                # 디버그: 비교 실패한 경우
                if i < 3:  # 처음 3명만 로그 출력
                    print(f"   비교 실패 [{i+1}]: DB='{db_id}', 입력='{login_id}'")
        
        if not member:
            print(f"❌ 회원 못 찾음: '{login_id}'")
            print(f"   첫 번째 회원 키 목록: {list(members[0].keys()) if members else 'N/A'}")
            return jsonify({'ok': False, 'error': '아이디 또는 비밀번호가 올바르지 않습니다.'}), 401
        
        # 회원 상태 확인 (OPEN만 로그인 가능)
        member_status = member.get('smem_status') or member.get('smem_status', '')
        print(f"📋 회원 상태: {member_status}")
        
        if str(member_status).upper() != 'OPEN':
            status_messages = {
                'LOCKED': '계정이 잠금 상태입니다. 관리자에게 문의하세요.',
                'DELETED': '탈퇴한 계정입니다.',
            }
            error_msg = status_messages.get(str(member_status).upper(), f'로그인할 수 없는 상태입니다. (상태: {member_status})')
            print(f"❌ 로그인 차단: 상태={member_status}")
            return jsonify({'ok': False, 'error': error_msg}), 403
        
        # 비밀번호 검증
        stored_hash = member.get('smem_pwdHash') or member.get('smem_pwdhash', '')
        
        print(f"🔑 저장된 해시: {stored_hash[:30] if stored_hash else 'None'}...")
        print(f"🔑 해시 형식: bcrypt={stored_hash.startswith('$2') if stored_hash else False}")
        
        if not stored_hash:
            print("❌ 저장된 비밀번호 해시 없음")
            return jsonify({'ok': False, 'error': '아이디 또는 비밀번호가 올바르지 않습니다.'}), 401
        
        # bcrypt 해시 검증
        try:
            is_valid = bcrypt.checkpw(password.encode(), stored_hash.encode())
            print(f"🔐 비밀번호 검증 결과: {is_valid}")
            
            if is_valid:
                # 로그인 성공 - 사용자가 입력한 ID 그대로 반환 (대소문자 유지)
                safe_member = {k: v for k, v in member.items() if k not in ['smem_pwdHash', 'smem_pwdhash', 'smem_pwd_salt', 'smem_pwd_salt']}
                
                # 입력한 ID 그대로 smem_id에 저장 (대소문자 그대로)
                safe_member['smem_id'] = login_id
                
                # 🔧 필드명을 소문자로 정규화 (sMem_id → smem_id)
                normalized_member = {}
                for key, value in safe_member.items():
                    # 키를 소문자로 변환
                    normalized_key = key.lower()
                    normalized_member[normalized_key] = value
                
                print(f"✅ 로그인 성공: 입력 ID={login_id}, DB ID={member.get('smem_id') or member.get('sMem_id')}")
                print(f"   반환 데이터: smem_id={normalized_member.get('smem_id')}, smem_name={normalized_member.get('smem_name')}")
                print(f"   정규화된 키 목록: {list(normalized_member.keys())[:10]}")  # 처음 10개만 출력
                return jsonify({'ok': True, 'data': normalized_member})
            else:
                print("❌ 비밀번호 불일치")
                return jsonify({'ok': False, 'error': '아이디 또는 비밀번호가 올바르지 않습니다.'}), 401
        except Exception as e:
            print(f"❌ bcrypt 검증 오류: {e}")
            print(f"   - 입력 비밀번호: {password}")
            print(f"   - 저장된 해시: {stored_hash}")
            return jsonify({'ok': False, 'error': '아이디 또는 비밀번호가 올바르지 않습니다.'}), 401
            
    except Exception as e:
        print(f"❌ 로그인 실패: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'ok': False, 'error': str(e)}), 500

@bp.post('/reset-password')
def reset_password():
    """비밀번호 재설정 (임시 비밀번호 발급)"""
    try:
        data = request.get_json()
        login_id = data.get('smem_id', '').strip()
        email = data.get('smem_email', '').strip()
        
        print(f"🔄 비밀번호 재설정 요청: ID={login_id}, Email={email}")
        
        if not login_id or not email:
            return jsonify({'ok': False, 'error': '아이디와 이메일을 모두 입력해주세요.'}), 400
        
        # 회원 조회
        members = get_repo().get_smembers()
        
        # 대소문자 구분 없이 ID와 이메일 확인
        member = None
        for m in members:
            db_id = str(m.get('smem_id') or m.get('smem_id', '')).strip()
            db_email = str(m.get('smem_email') or m.get('smem_email', '')).strip()
            
            if (db_id.lower() == login_id.lower() and 
                db_email.lower() == email.lower()):
                member = m
                break
        
        if not member:
            print(f"❌ 회원 못 찾음: ID={login_id}, Email={email}")
            return jsonify({'ok': False, 'error': '입력한 정보와 일치하는 회원을 찾을 수 없습니다.'}), 404
        
        # 임시 비밀번호 생성 (8자리)
        import random
        import string
        temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        
        # bcrypt로 해시 생성
        hashed = bcrypt.hashpw(temp_password.encode(), bcrypt.gensalt())
        
        # DB 업데이트
        sm_id = member.get('sM_id') or member.get('sm_id')
        
        update_data = {
            'smem_pwdHash': hashed.decode('utf-8'),
            'smem_lastPwdChange': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        success = get_repo().update_smember(sm_id, update_data)
        
        if success:
            print(f"✅ 임시 비밀번호 발급 성공: ID={login_id}, 임시PW={temp_password}")
            return jsonify({
                'ok': True, 
                'data': {
                    'tempPassword': temp_password,
                    'message': '임시 비밀번호가 발급되었습니다. 로그인 후 반드시 비밀번호를 변경해주세요.'
                }
            })
        else:
            print(f"❌ DB 업데이트 실패")
            return jsonify({'ok': False, 'error': '비밀번호 재설정에 실패했습니다.'}), 500
            
    except Exception as e:
        print(f"❌ 비밀번호 재설정 오류: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'ok': False, 'error': '서버 오류가 발생했습니다.'}), 500
