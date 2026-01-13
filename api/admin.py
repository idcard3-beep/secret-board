from flask import Blueprint, request, jsonify, session
from adapters.repository_factory import get_repository
import bcrypt, uuid
import psycopg2.extras
from datetime import datetime

bp = Blueprint('admin', __name__)

# Repository를 지연 초기화 (DATABASE_URL이 설정된 후에 초기화되도록)
_repo = None
def get_repo():
    """Repository 인스턴스를 지연 초기화하여 반환"""
    global _repo
    if _repo is None:
        _repo = get_repository()
    return _repo

ADMIN_SESSION_KEY = 'admin_logged_in'

def require_admin():
    return bool(session.get(ADMIN_SESSION_KEY))

def require_superadmin():
    """SUPERADMIN 권한 체크"""
    if not session.get(ADMIN_SESSION_KEY):
        return False
    admin_role = session.get('admin_role', '').upper()
    return admin_role == 'SUPERADMIN'

@bp.get('/check-role')
def check_role():
    """현재 세션의 role 확인"""
    admin_role = session.get('admin_role', 'USER')
    user_role = session.get('role', 'USER')
    is_admin = session.get(ADMIN_SESSION_KEY, False)
    
    # 관리자 세션이 활성화되어 있으면 admin_role 사용, 아니면 user_role 사용
    current_role = admin_role if is_admin else user_role
    
    print(f"🔍 권한 체크 요청 - admin_role: {admin_role}, user_role: {user_role}, is_admin: {is_admin}, current_role: {current_role}")
    
    return jsonify({
        'role': current_role,
        'is_admin': is_admin,
        'admin_role': admin_role,
        'user_role': user_role
    })

@bp.post('/login')
def login():
    d = request.get_json() or {}
    admin_id = d.get('admin_id', '').strip()
    password = d.get('password', '')
    
    # 입력값 검증
    if not admin_id:
        return jsonify({'ok': False, 'error': 'ID를 입력해주세요.'}), 400
    
    if not password:
        return jsonify({'ok': False, 'error': '비밀번호를 입력해주세요.'}), 400
    
    # 사용자 조회 (admin_id로 조회)
    user = get_repo().get_admin_user_by_id(admin_id)
    if not user:
        print(f"❌ 관리자 사용자를 찾을 수 없음: {admin_id}")
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
        print(f"❌ 비밀번호 불일치: {admin_id}")
        return jsonify({'ok': False, 'error': '비밀번호가 일치하지 않습니다.'}), 401

    # 로그인 성공
    username = user.get('username', '')
    admin_status = user.get('admin_status', 'OPEN')  # admin_status 가져오기
    print(f"✅ 관리자 로그인 성공: {admin_id} (username: {username}, status: {admin_status})")
    session[ADMIN_SESSION_KEY] = True
    session['admin_username'] = username  # 사용자명 저장
    session['admin_id'] = admin_id  # admin_id 저장
    session['admin_role'] = user.get('role', 'ADMIN')  # role 저장
    session['admin_status'] = admin_status  # admin_status 저장
    print(f"👤 세션에 저장된 정보 - admin_id: {session.get('admin_id')}, username: {username}, role: {session['admin_role']}, status: {admin_status}")
    
    # 클라이언트에 관리자 정보 반환
    return jsonify({
        'ok': True, 
        'message': '로그인 성공',
        'admin': {
            'admin_id': admin_id,
            'username': username,
            'role': user.get('role', 'ADMIN'),
            'admin_status': admin_status
        }
    })

@bp.post('/logout')
def logout():
    session.pop(ADMIN_SESSION_KEY, None)
    session.pop('admin_username', None)  # 사용자명도 제거
    session.pop('admin_id', None)  # admin_id도 제거
    session.pop('admin_role', None)  # role도 제거
    print(f"✅ 관리자 로그아웃 - 세션 정리 완료")
    return jsonify({'ok': True, 'message': '로그아웃 성공'})

@bp.get('/tickets')
def admin_list():
    if not require_admin(): return ('', 401)
    status = request.args.get('status')
    print(f"📋 관리자 목록 요청 - 상태 필터: {status}")
    
    try:
        # PostgreSQL에서 딕셔너리 형태로 데이터 가져오기
        rows = get_repo().list_tickets()
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
    r = get_repo().get_ticket(ticket_id)
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
    
    messages = get_repo().list_messages(ticket_id)
    return jsonify({"ticket": ticket, "messages": messages})

@bp.post('/tickets/<ticket_id>/reply')
def admin_reply(ticket_id):
    print(f"🔄 관리자 답변 등록 요청 - 티켓 ID: {ticket_id}")
    
    if not require_admin(): 
        print("❌ 관리자 인증 실패")
        return ('', 401)
    
    d = request.get_json() or {}
    content = d.get('content','')
    client_admin_id = d.get('admin_id')  # 클라이언트에서 전송한 admin_id
    print(f"📝 답변 내용: {content}")
    print(f"👤 클라이언트에서 전송한 admin_id: {client_admin_id}")
    
    if not content.strip():
        print("❌ 답변 내용이 비어있음")
        return jsonify({'error': '답변 내용을 입력해주세요.'}), 400
    
    try:
        print(f"🔄 관리자 답변 처리 시작 - 티켓: {ticket_id}")
        print(f"🔄 티켓 ID 타입: {type(ticket_id)}")
        
        # 1. 먼저 티켓이 존재하는지 확인
        existing_ticket = get_repo().get_ticket(ticket_id)
        if not existing_ticket:
            print(f"❌ 티켓을 찾을 수 없음: {ticket_id}")
            return jsonify({'error': '티켓을 찾을 수 없습니다.'}), 404
        
        print(f"✅ 티켓 존재 확인: {existing_ticket.get('title', 'No Title')}")
        
        # 2. admin_id 결정 (우선순위: 클라이언트 전송 > 세션 > DB 조회)
        try:
            # 클라이언트에서 전송한 admin_id를 최우선으로 사용
            admin_id = client_admin_id if client_admin_id else session.get('admin_id')
            print(f"👤 admin_id 1차 결정 (클라이언트 또는 세션): {admin_id}")
            
            # 관리자 계정의 최신 role은 DB의 admin_users 테이블에서 가져옵니다.
            username = session.get('admin_username')
            admin_role = None
            if username:
                try:
                    admin_user = get_repo().get_admin_user(username)
                    if admin_user and 'role' in admin_user:
                        admin_role = admin_user.get('role')
                        # admin_id가 아직 없는 경우에만 DB에서 가져오기
                        if not admin_id:
                            admin_id = admin_user.get('admin_id')
                            print(f"👤 DB에서 admin_id 가져옴: {admin_id}")
                        print(f"👤 DB에서 admin_users 정보 가져옴 - username={username}, role={admin_role}, admin_id={admin_id}")
                    else:
                        print(f"⚠️ admin 사용자 조회는 되었지만 role 필드 없음 - username={username}")
                except Exception as db_e:
                    print(f"❌ admin 사용자 조회 중 오류: {db_e}")

            # admin_id가 여전히 없으면 경고 (하지만 계속 진행)
            if not admin_id:
                print(f"⚠️ 경고: admin_id를 찾을 수 없습니다. NULL로 저장됩니다.")
            
            # 폴백: 세션에 저장된 값이나 기본 'ADMIN' 사용
            if admin_role is None:
                admin_role = session.get('admin_role', 'ADMIN')
                print(f"👤 DB에서 role을 못가져와 세션/기본값 사용: {admin_role}")
            # ensure it's a string (no transformation of case)
            admin_role = str(admin_role)
        except Exception as role_e:
            print(f"⚠️ 관리자 role/admin_id 결정 중 오류, 기본값 사용: {role_e}")
            admin_role = 'ADMIN'
            if not admin_id:
                admin_id = client_admin_id or session.get('admin_id')

        print(f"✅ 최종 결정된 admin_id: {admin_id}, role: {admin_role}")

        # 3. 메시지 생성 (admin_id 무조건 포함)
        message_data = {
            'ticket_id': ticket_id,
            'content': content,
            'role': admin_role,
            'admin_id': admin_id  # admin_id 추가
        }
        
        try:
            print(f"📨 메시지 생성 중... message_data.role={message_data.get('role')}")
            message_id = get_repo().create_message(message_data)
            print(f"✅ 메시지 생성 완료: {message_id}")
        except Exception as msg_e:
            print(f"❌ 메시지 생성 중 오류: {msg_e}")
            import traceback
            print(traceback.format_exc())
            return jsonify({'error': f'메시지 생성 중 오류: {str(msg_e)}'}), 500
        
        # 4. 강제로 상태 업데이트 재확인
        print("🔄 강제 상태 업데이트 실행...")
        get_repo().mark_has_admin_reply(ticket_id)
        
        # 5. 최종 상태 확인
        final_ticket = get_repo().get_ticket(ticket_id)
        if final_ticket:
            final_status = final_ticket.get('status', 'UNKNOWN')
            final_has_reply = final_ticket.get('has_admin_reply', False)
            print(f"🎯 최종 확인: status={final_status}, has_admin_reply={final_has_reply}")
            
            if final_status != 'ANSWERED':
                print(f"⚠️ 경고: 상태가 여전히 ANSWERED가 아님 - 현재: {final_status}")
                # 직접 SQL로 한번 더 시도
                try:
                    with get_repo()._get_connection() as conn:
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

@bp.put('/messages/<message_id>')
def update_message(message_id):
    """관리자 답변 메시지 수정"""
    print(f"✏️ 메시지 수정 요청 - 메시지 ID: {message_id}")
    print(f"🔍 message_id 타입: {type(message_id)}, 값: '{message_id}'")
    
    if not require_admin():
        print("❌ 관리자 인증 실패")
        return ('', 401)
    
    try:
        d = request.get_json() or {}
        print(f"📥 받은 JSON 데이터: {d}")
        
        content = d.get('content', '')
        role = d.get('role', None)  # role 추가
        print(f"📝 수정할 내용: {content[:50]}..." if len(content) > 50 else f"📝 수정할 내용: {content}")
        print(f"👤 수정할 역할: {role}")
        
        if not content.strip():
            print("❌ 수정할 내용이 비어있음")
            return jsonify({'error': '내용을 입력해주세요.'}), 400
        
        # Repository 타입 확인
        repo = get_repo()
        print(f"🔍 Repository 타입: {type(repo)}")
        print(f"🔍 Repository에 update_message 메서드 있는지: {hasattr(repo, 'update_message')}")
        
        # role이 제공된 경우 함께 업데이트
        if role:
            print(f"🔄 role과 함께 메시지 업데이트 시도...")
            try:
                with get_repo()._get_connection() as conn:
                    with conn.cursor() as cursor:
                        cursor.execute("""
                            UPDATE thread_messages 
                            SET content_enc = %s, role = %s
                            WHERE msg_id = %s::uuid
                        """, (content, role, str(message_id)))
                        conn.commit()
                        print(f"✅ role과 content 모두 업데이트 완료")
            except Exception as update_error:
                print(f"❌ role 업데이트 실패, content만 업데이트 시도: {update_error}")
                get_repo().update_message(message_id, content)
        else:
            # 메시지 수정 (content만)
            print(f"🔄 get_repo().update_message() 호출 전...")
            get_repo().update_message(message_id, content)
            print(f"✅ get_repo().update_message() 호출 후 - 메시지 수정 완료: {message_id}")
        
        return jsonify({
            'ok': True,
            'message': '메시지가 성공적으로 수정되었습니다.'
        })
        
    except AttributeError as attr_e:
        print(f"❌ AttributeError - Repository에 메서드가 없음: {attr_e}")
        import traceback
        print(f"❌ 스택 트레이스: {traceback.format_exc()}")
        return jsonify({'error': f'Repository에 update_message 메서드가 없습니다: {str(attr_e)}'}), 500
        
    except Exception as e:
        print(f"❌ 메시지 수정 오류: {e}")
        print(f"❌ 오류 타입: {type(e).__name__}")
        import traceback
        print(f"❌ 스택 트레이스: {traceback.format_exc()}")
        return jsonify({'error': f'메시지 수정 중 오류가 발생했습니다: {str(e)}'}), 500

@bp.post('/tickets/<ticket_id>/validate-status')
def validate_ticket_status(ticket_id):
    """admin_view 페이지를 떠날 때 티켓 상태 검증 및 업데이트"""
    if not require_admin(): 
        return ('', 401)
    
    print(f"🔍 티켓 상태 검증 요청 - 티켓 ID: {ticket_id}")
    
    try:
        # 티켓 정보 가져오기
        ticket = get_repo().get_ticket(ticket_id)
        if not ticket:
            print(f"❌ 티켓을 찾을 수 없음: {ticket_id}")
            return jsonify({'error': '티켓을 찾을 수 없습니다.'}), 404
        
        current_status = ticket.get('status', 'OPEN')
        current_has_admin_reply = bool(ticket.get('has_admin_reply', False))
        
        print(f"🔍 현재 상태: {current_status}, has_admin_reply: {current_has_admin_reply}")
        
        # 상태가 "답변완료"(ANSWERED)이고 답변여부가 "Y"인 경우, 실제 관리자 답변 확인
        if current_status == 'ANSWERED' and current_has_admin_reply:
            print(f"🔍 티켓 {ticket_id}: 상태가 ANSWERED이고 has_admin_reply=True - 실제 관리자 답변 확인 중...")
            
            # 해당 티켓의 메시지 목록 가져오기
            messages = get_repo().list_messages(ticket_id)
            print(f"🔍 티켓 {ticket_id}의 메시지 수: {len(messages)}")
            
            # 관리자 답변 확인 (role이 'ADMIN', 'STAFF', 'COUNSELOR' 등인 메시지)
            has_actual_admin_reply = False
            for msg in messages:
                msg_role = msg.get('role', '').upper() if msg.get('role') else ''
                if msg_role in ['ADMIN', 'STAFF', 'COUNSELOR']:
                    has_actual_admin_reply = True
                    print(f"✅ 티켓 {ticket_id}: 실제 관리자 답변 발견 (role: {msg_role})")
                    break
            
            # 실제 관리자 답변이 없으면 DB 업데이트
            if not has_actual_admin_reply:
                print(f"⚠️ 티켓 {ticket_id}: 실제 관리자 답변이 없음 - DB 업데이트 중...")
                try:
                    with get_repo()._get_connection() as conn:
                        with conn.cursor() as cursor:
                            cursor.execute("""
                                UPDATE tickets 
                                SET status = 'OPEN', 
                                    has_admin_reply = FALSE,
                                    updated_at = CURRENT_TIMESTAMP
                                WHERE ticket_id = %s::uuid
                            """, (str(ticket_id),))
                            conn.commit()
                            print(f"✅ 티켓 {ticket_id}: 상태를 OPEN으로, has_admin_reply를 FALSE로 업데이트 완료")
                            return jsonify({
                                'ok': True,
                                'updated': True,
                                'message': '티켓 상태가 업데이트되었습니다.'
                            })
                except Exception as update_error:
                    print(f"❌ 티켓 {ticket_id}: DB 업데이트 실패: {update_error}")
                    return jsonify({'error': f'DB 업데이트 실패: {str(update_error)}'}), 500
            else:
                print(f"✅ 티켓 {ticket_id}: 실제 관리자 답변이 있어 상태 유지")
                return jsonify({
                    'ok': True,
                    'updated': False,
                    'message': '티켓 상태가 정상입니다.'
                })
        else:
            print(f"✅ 티켓 {ticket_id}: 검증 불필요 (상태: {current_status}, has_admin_reply: {current_has_admin_reply})")
            return jsonify({
                'ok': True,
                'updated': False,
                'message': '검증이 필요하지 않습니다.'
            })
        
    except Exception as e:
        print(f"❌ 티켓 상태 검증 오류: {e}")
        import traceback
        print(f"❌ 스택 트레이스: {traceback.format_exc()}")
        return jsonify({'error': f'상태 검증 중 오류가 발생했습니다: {str(e)}'}), 500

@bp.delete('/messages/<message_id>')
def delete_message(message_id):
    """관리자 답변 메시지 삭제"""
    print(f"🗑️ 메시지 삭제 요청 - 메시지 ID: {message_id}")
    
    if not require_admin():
        print("❌ 관리자 인증 실패")
        return ('', 401)
    
    try:
        # 메시지 삭제
        get_repo().delete_message(message_id)
        print(f"✅ 메시지 삭제 완료: {message_id}")
        
        return jsonify({
            'ok': True,
            'message': '메시지가 성공적으로 삭제되었습니다.'
        })
        
    except Exception as e:
        print(f"❌ 메시지 삭제 오류: {e}")
        import traceback
        print(f"❌ 스택 트레이스: {traceback.format_exc()}")
        return jsonify({'error': f'메시지 삭제 중 오류가 발생했습니다: {str(e)}'}), 500

@bp.get('/users')
def get_all_admin_users():
    """모든 관리자 계정 조회"""
    print("📋 모든 관리자 계정 조회 요청")
    
    if not require_admin():
        print("❌ 관리자 인증 실패")
        return ('', 401)
    
    try:
        # PostgreSQL에서 모든 admin_users 조회
        with get_repo()._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute("""
                    SELECT admin_id, username, pwd_hash, role, admin_status, created_at
                    FROM admin_users
                    ORDER BY created_at DESC
                """)
                
                rows = cursor.fetchall()
                users = [dict(row) for row in rows]
                
                # created_at을 문자열로 변환
                for user in users:
                    if user.get('created_at'):
                        user['created_at'] = user['created_at'].isoformat()
                
                print(f"✅ 관리자 계정 조회 완료: {len(users)}개")
                
                return jsonify({
                    'ok': True,
                    'users': users
                })
                
    except Exception as e:
        print(f"❌ 관리자 계정 조회 오류: {e}")
        import traceback
        print(f"❌ 스택 트레이스: {traceback.format_exc()}")
        return jsonify({'error': f'계정 조회 중 오류가 발생했습니다: {str(e)}'}), 500

@bp.post('/users')
def create_admin_user():
    """관리자 계정 생성"""
    print("👤 관리자 계정 생성 요청")
    
    if not require_admin():
        print("❌ 관리자 인증 실패")
        return ('', 401)
    
    try:
        d = request.get_json() or {}
        admin_id = d.get('admin_id', '').strip()
        username = d.get('username', '').strip()
        pwd_hash = d.get('pwd_hash', '').strip()
        role = d.get('role', 'AGENT').strip()
        admin_status = d.get('admin_status', 'OPEN').strip()
        
        print(f"📥 받은 데이터: admin_id={admin_id}, username={username}, role={role}, admin_status={admin_status}")
        
        if not admin_id or not username or not pwd_hash:
            print("❌ 필수 필드 누락")
            return jsonify({'error': '모든 필드를 입력해주세요.'}), 400
        
        # admin_id 중복 확인만 수행
        existing = get_repo().get_admin_user_by_id(admin_id)
        if existing:
            print(f"❌ admin_id 중복: {admin_id}")
            return jsonify({'error': 'admin_id가 이미 존재합니다.'}), 409
        
        # 관리자 계정 생성
        result_id = get_repo().create_admin_user(username, pwd_hash, admin_id)
        
        if not result_id:
            print("❌ 관리자 계정 생성 실패")
            return jsonify({'error': '계정 생성에 실패했습니다.'}), 500
        
        # role과 admin_status 업데이트 (항상 수행)
        get_repo().update_admin_user(admin_id, role=role, admin_status=admin_status)
        
        print(f"✅ 관리자 계정 생성 완료: {result_id}, role={role}, admin_status={admin_status}")
        
        return jsonify({
            'ok': True,
            'message': '관리자 계정이 성공적으로 생성되었습니다.',
            'admin_id': result_id
        }), 201
        
    except Exception as e:
        print(f"❌ 관리자 계정 생성 오류: {e}")
        import traceback
        print(f"❌ 스택 트레이스: {traceback.format_exc()}")
        return jsonify({'error': f'계정 생성 중 오류가 발생했습니다: {str(e)}'}), 500

@bp.put('/users/<admin_id>')
def update_admin_user_endpoint(admin_id):
    """관리자 계정 정보 수정"""
    print(f"✏️ 관리자 계정 수정 요청 - admin_id: {admin_id}")
    
    if not require_admin():
        print("❌ 관리자 인증 실패")
        return ('', 401)
    
    try:
        d = request.get_json() or {}
        username = d.get('username', '').strip() or None
        pwd_hash = d.get('pwd_hash', '').strip() or None
        role = d.get('role', '').strip() or None
        admin_status = d.get('admin_status', '').strip() or None
        
        print(f"📥 받은 데이터: username={username}, role={role}, admin_status={admin_status}, pwd_hash={'***' if pwd_hash else None}")
        
        # 계정 존재 확인
        existing = get_repo().get_admin_user_by_id(admin_id)
        if not existing:
            print(f"❌ 계정을 찾을 수 없음: {admin_id}")
            return jsonify({'error': '계정을 찾을 수 없습니다.'}), 404
        
        # 계정 정보 수정
        success = get_repo().update_admin_user(admin_id, username=username, password_hash=pwd_hash, role=role, admin_status=admin_status)
        
        if not success:
            print("❌ 관리자 계정 수정 실패")
            return jsonify({'error': '계정 수정에 실패했습니다.'}), 500
        
        print(f"✅ 관리자 계정 수정 완료: {admin_id}")
        
        return jsonify({
            'ok': True,
            'message': '관리자 계정이 성공적으로 수정되었습니다.'
        })
        
    except Exception as e:
        print(f"❌ 관리자 계정 수정 오류: {e}")
        import traceback
        print(f"❌ 스택 트레이스: {traceback.format_exc()}")
        return jsonify({'error': f'계정 수정 중 오류가 발생했습니다: {str(e)}'}), 500

@bp.delete('/users/<admin_id>')
def delete_admin_user_endpoint(admin_id):
    """관리자 계정 삭제"""
    print(f"🗑️ 관리자 계정 삭제 요청 - admin_id: {admin_id}")
    
    if not require_admin():
        print("❌ 관리자 인증 실패")
        return ('', 401)
    
    try:
        # 계정 존재 확인
        existing = get_repo().get_admin_user_by_id(admin_id)
        if not existing:
            print(f"❌ 계정을 찾을 수 없음: {admin_id}")
            return jsonify({'error': '계정을 찾을 수 없습니다.'}), 404
        
        # 계정 삭제
        with get_repo()._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    DELETE FROM admin_users
                    WHERE admin_id = %s
                """, (admin_id,))
                conn.commit()
                
                if cursor.rowcount == 0:
                    print(f"❌ 계정 삭제 실패: {admin_id}")
                    return jsonify({'error': '계정 삭제에 실패했습니다.'}), 500
        
        print(f"✅ 관리자 계정 삭제 완료: {admin_id}")
        
        return jsonify({
            'ok': True,
            'message': '관리자 계정이 성공적으로 삭제되었습니다.'
        })
        
    except Exception as e:
        print(f"❌ 관리자 계정 삭제 오류: {e}")
        import traceback
        print(f"❌ 스택 트레이스: {traceback.format_exc()}")
        return jsonify({'error': f'계정 삭제 중 오류가 발생했습니다: {str(e)}'}), 500

# ====================================
# 상담 전문가 관리 API
# ====================================

@bp.get('/couns-experts')
def list_couns_experts():
    """상담 전문가 목록 조회"""
    try:
        experts = get_repo().list_couns_experts()
        return jsonify(experts)
    except Exception as e:
        print(f"❌ 전문가 목록 조회 오류: {e}")
        return jsonify({'error': str(e)}), 500

@bp.get('/couns-experts/<int:expert_id>')
def get_couns_expert(expert_id):
    """상담 전문가 단일 조회"""
    try:
        expert = get_repo().get_couns_expert(expert_id)
        if expert:
            return jsonify(expert)
        else:
            return jsonify({'error': '전문가를 찾을 수 없습니다.'}), 404
    except Exception as e:
        print(f"❌ 전문가 조회 오류: {e}")
        return jsonify({'error': str(e)}), 500

@bp.post('/couns-experts')
def create_couns_expert():
    """상담 전문가 추가"""
    if not require_superadmin():
        return jsonify({'ok': False, 'error': 'SUPERADMIN 권한이 필요합니다.'}), 401
    
    try:
        data = request.get_json() or {}
        new_expert = get_repo().create_couns_expert(data)
        return jsonify({'ok': True, 'expert': new_expert})
    except Exception as e:
        print(f"❌ 전문가 추가 오류: {e}")
        return jsonify({'ok': False, 'error': str(e)}), 500

@bp.put('/couns-experts/<int:expert_id>')
def update_couns_expert(expert_id):
    """상담 전문가 수정"""
    if not require_superadmin():
        return jsonify({'ok': False, 'error': 'SUPERADMIN 권한이 필요합니다.'}), 401
    
    try:
        data = request.get_json() or {}
        updated_expert = get_repo().update_couns_expert(expert_id, data)
        if updated_expert:
            return jsonify({'ok': True, 'expert': updated_expert})
        else:
            return jsonify({'ok': False, 'error': '전문가를 찾을 수 없습니다.'}), 404
    except Exception as e:
        print(f"❌ 전문가 수정 오류: {e}")
        return jsonify({'ok': False, 'error': str(e)}), 500

@bp.delete('/couns-experts/<int:expert_id>')
def delete_couns_expert(expert_id):
    """상담 전문가 삭제"""
    if not require_superadmin():
        return jsonify({'ok': False, 'error': 'SUPERADMIN 권한이 필요합니다.'}), 401
    
    try:
        success = get_repo().delete_couns_expert(expert_id)
        if success:
            return jsonify({'ok': True, 'message': '삭제되었습니다.'})
        else:
            return jsonify({'ok': False, 'error': '전문가를 찾을 수 없습니다.'}), 404
    except Exception as e:
        print(f"❌ 전문가 삭제 오류: {e}")
        return jsonify({'ok': False, 'error': str(e)}), 500
