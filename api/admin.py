from flask import Blueprint, request, jsonify, session
from adapters.repository_factory import get_repository
import bcrypt, uuid
from datetime import datetime

bp = Blueprint('admin', __name__)
repo = get_repository()

ADMIN_SESSION_KEY = 'admin_logged_in'

def require_admin():
    return bool(session.get(ADMIN_SESSION_KEY))

def get_current_admin():
    """현재 로그인한 관리자 정보 반환"""
    if not session.get(ADMIN_SESSION_KEY):
        return None
    
    username = session.get('admin_username')
    if not username:
        return None
    
    try:
        admin_user = repo.get_admin_user(username)
        return admin_user
    except Exception as e:
        print(f"❌ 현재 관리자 정보 조회 실패: {e}")
        return None

@bp.post('/login')
def login():
    d = request.get_json() or {}
    username = d.get('username', '').strip()
    password = d.get('password', '')
    
    # 입력값 검증
    if not username:
        return jsonify({'ok': False, 'error': 'ID를 입력해주세요.'}), 400
    
    if not password:
        return jsonify({'ok': False, 'error': '비밀번호를 입력해주세요.'}), 400
    
    # 사용자 조회
    user = repo.get_admin_user(username)
    if not user:
        print(f"❌ 관리자 사용자를 찾을 수 없음: {username}")
        return jsonify({'ok': False, 'error': '존재하지 않는 관리자 ID입니다.'}), 401

    # 비밀번호 확인 - 디버깅 로그 추가
    print(f"🔍 비밀번호 검증 시작:")
    print(f"   입력된 비밀번호: '{password}'")
    print(f"   저장된 해시: '{user['pwd_hash']}'")
    
    try:
        stored_hash = user['pwd_hash']
        if isinstance(stored_hash, str):
            stored_hash_bytes = stored_hash.encode()
        else:
            stored_hash_bytes = stored_hash
            
        password_valid = bcrypt.checkpw(password.encode(), stored_hash_bytes)
        print(f"   검증 결과: {password_valid}")
        
    except Exception as e:
        print(f"❌ 비밀번호 검증 오류: {e}")
        return jsonify({'ok': False, 'error': '인증 처리 중 오류가 발생했습니다.'}), 500
    
    if not password_valid:
        print(f"❌ 비밀번호 불일치: {username}")
        return jsonify({'ok': False, 'error': '비밀번호가 일치하지 않습니다.'}), 401

    # 로그인 성공
    print(f"✅ 관리자 로그인 성공: {username}")
    session[ADMIN_SESSION_KEY] = True
    session['admin_username'] = username  # 사용자명 저장
    return jsonify({'ok': True, 'message': '로그인 성공'})

@bp.post('/logout')
def logout():
    session.pop(ADMIN_SESSION_KEY, None)
    session.pop('admin_username', None)  # 사용자명도 제거
    return jsonify({'ok': True})

@bp.get('/tickets')
def admin_list():
    if not require_admin(): return ('', 401)
    status = request.args.get('status')
    print(f"📋 관리자 목록 요청 - 상태 필터: {status}")
    
    try:
        # PostgreSQL에서 딕셔너리 형태로 데이터 가져오기
        rows = repo.list_tickets()
        print(f"🔍 DB에서 가져온 행 수: {len(rows)}")
        
        items = []
        
        for i, r in enumerate(rows):
            print(f"🔍 [{i}] 행 데이터: {r}")
            print(f"🔍 [{i}] 행 타입: {type(r)}")
            
            # author_name과 author_contact 직접 확인
            author_name = r.get('author_name') if r.get('author_name') else ''
            author_contact = r.get('author_contact') if r.get('author_contact') else ''
            
            print(f"🔍 [{i}] author_name: '{author_name}'")
            print(f"🔍 [{i}] author_contact: '{author_contact}'")
            
            # created_at 필드를 ISO 형식 문자열로 변환
            created_at = r.get('created_at')
            if isinstance(created_at, datetime):
                created_at_str = created_at.isoformat()
            else:
                created_at_str = str(created_at) if created_at else ""
            
            it = {
                "ticket_id": r.get('id', ''), 
                "title": r.get('title', ''), 
                "status": r.get('status', 'OPEN'), 
                "has_admin_reply": bool(r.get('has_admin_reply', False)), 
                "author_contact": author_contact, 
                "author_name": author_name,
                "created_at": created_at_str,
                "snsgu": r.get('snsgu', 'A0001')
            }
            
            print(f"✅ [{i}] 최종 항목: {it}")
            
            # 상태 필터링
            if not status or it['status'] == status:
                items.append(it)
        
        print(f"✅ 필터링 후 반환할 항목 수: {len(items)}")
        
        # 첫 번째 항목의 데이터 상세 로그
        if items:
            print(f"🎯 첫 번째 항목 상세:")
            print(f"   - author_name: '{items[0].get('author_name')}'")
            print(f"   - author_contact: '{items[0].get('author_contact')}'")
        
        return jsonify(items)
        
    except Exception as e:
        print(f"❌ admin_list 오류: {e}")
        import traceback
        print(f"❌ 스택 트레이스: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@bp.get('/tickets/<ticket_id>')
def admin_view(ticket_id):
    if not require_admin(): return ('', 401)
    r = repo.get_ticket(ticket_id)
    if not r: return jsonify({'error':'not found'}), 404
    
    print(f"🔍 admin_view 디버깅 - 행 타입: {type(r)}")
    print(f"🔍 admin_view 디버깅 - 행 내용: {r}")
    
    # 딕셔너리 형태로 처리
    if isinstance(r, dict):
        # created_at 필드를 ISO 형식 문자열로 변환
        created_at = r.get('created_at')
        if isinstance(created_at, datetime):
            created_at_str = created_at.isoformat()
        else:
            created_at_str = str(created_at) if created_at else ""
        
        ticket = {
            "ticket_id": r.get('id'), 
            "title": r.get('title'), 
            "content": r.get('content'), 
            "author_name": r.get('author_name', ''), 
            "author_contact": r.get('author_contact', ''), 
            "status": r.get('status', 'OPEN'), 
            "created_at": created_at_str,
            "snsgu": r.get('snsgu', 'A0001')
        }
    else:
        # 튜플 형태로 처리 (하위 호환성)
        created_at = r[8] if len(r) > 8 else None
        if isinstance(created_at, datetime):
            created_at_str = created_at.isoformat()
        else:
            created_at_str = str(created_at) if created_at else ""
        
        ticket = {
            "ticket_id": r[0] if len(r) > 0 else "", 
            "title": r[1] if len(r) > 1 else "", 
            "content": r[2] if len(r) > 2 else "", 
            "author_name": r[3] if len(r) > 3 else "", 
            "author_contact": r[4] if len(r) > 4 else "", 
            "status": r[7] if len(r) > 7 else "OPEN", 
            "created_at": created_at_str,
            "snsgu": r[10] if len(r) > 10 else 'A0001'
        }
    
    messages = repo.list_messages(ticket_id)
    return jsonify({"ticket": ticket, "messages": messages})

@bp.post('/tickets/<ticket_id>/reply')
def admin_reply(ticket_id):
    print(f"🔄 관리자 답변 등록 요청 - 티켓 ID: {ticket_id}")
    
    if not require_admin(): 
        print("❌ 관리자 인증 실패")
        return ('', 401)
    
    d = request.get_json() or {}
    content = d.get('content','')
    print(f"📝 답변 내용: {content}")
    
    if not content.strip():
        print("❌ 답변 내용이 비어있음")
        return jsonify({'error': '답변 내용을 입력해주세요.'}), 400
    
    try:
        print(f"🔄 관리자 답변 처리 시작 - 티켓: {ticket_id}")
        print(f"🔄 티켓 ID 타입: {type(ticket_id)}")
        
        # 1. 먼저 티켓이 존재하는지 확인
        existing_ticket = repo.get_ticket(ticket_id)
        if not existing_ticket:
            print(f"❌ 티켓을 찾을 수 없음: {ticket_id}")
            return jsonify({'error': '티켓을 찾을 수 없습니다.'}), 404
        
        print(f"✅ 티켓 존재 확인: {existing_ticket.get('title', 'No Title')}")
        
        # 2. 현재 로그인한 관리자 정보 가져오기
        current_admin = get_current_admin()
        if not current_admin:
            print("❌ 현재 관리자 정보를 가져올 수 없음")
            return jsonify({'error': '관리자 정보를 확인할 수 없습니다.'}), 500
        
        admin_role = current_admin.get('role', 'ADMIN')  # 기본값 ADMIN
        print(f"👤 현재 관리자 role: {admin_role}")
        
        # 3. 메시지 생성 (관리자의 실제 role 사용)
        message_data = {
            'ticket_id': ticket_id,
            'content': content,
            'role': admin_role  # admin_users 테이블의 role 필드값 사용
        }
        
        print(f"📨 메시지 생성 중...")
        message_id = repo.create_message(message_data)
        print(f"✅ 메시지 생성 완료: {message_id}")
        
        # 4. 강제로 상태 업데이트 재확인
        print("🔄 강제 상태 업데이트 실행...")
        repo.mark_has_admin_reply(ticket_id)
        
        # 5. 최종 상태 확인
        final_ticket = repo.get_ticket(ticket_id)
        if final_ticket:
            final_status = final_ticket.get('status', 'UNKNOWN')
            final_has_reply = final_ticket.get('has_admin_reply', False)
            print(f"🎯 최종 확인: status={final_status}, has_admin_reply={final_has_reply}")
            
            if final_status != 'ANSWERED':
                print(f"⚠️ 경고: 상태가 여전히 ANSWERED가 아님 - 현재: {final_status}")
                # 직접 SQL로 한번 더 시도
                try:
                    with repo._get_connection() as conn:
                        with conn.cursor() as cursor:
                            cursor.execute("""
                                UPDATE tickets SET status = 'ANSWERED' 
                                WHERE ticket_id = %s::uuid
                            """, (str(ticket_id),))
                            conn.commit()
                            print(f"🔄 직접 SQL 업데이트 완료")
                except Exception as sql_error:
                    print(f"❌ 직접 SQL 업데이트 실패: {sql_error}")
        
        return jsonify({
            'ok': True, 
            'message': '답변이 성공적으로 등록되었습니다.',
            'final_status': final_status if final_ticket else 'UNKNOWN'
        })
        
    except Exception as e:
        print(f"❌ 관리자 답변 등록 오류: {e}")
        print(f"❌ 오류 타입: {type(e)}")
        import traceback
        print(f"❌ 스택 트레이스: {traceback.format_exc()}")
        return jsonify({'error': f'답변 등록 중 오류가 발생했습니다: {str(e)}'}), 500
