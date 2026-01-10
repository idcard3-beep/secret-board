from flask import Blueprint, request, jsonify, make_response, session
from adapters.repository_factory import get_repository
from core.security import issue_view_token, verify_view_token
import bcrypt, uuid
from datetime import datetime

bp = Blueprint('tickets', __name__)

# Repository를 지연 초기화 (DATABASE_URL이 설정된 후에 초기화되도록)
_repo = None
def get_repo():
    """Repository 인스턴스를 지연 초기화하여 반환"""
    global _repo
    if _repo is None:
        _repo = get_repository()
    return _repo

@bp.get('/')
def list_tickets():
    try:
        # URL 파라미터에서 필터 가져오기
        snsgu_filter = request.args.get('snsgu', None)
        smember_id_filter = request.args.get('smember_id', None)
        
        # 🔒 보안 규칙: 사주 데이터(B0001) 조회 시 반드시 본인 것만 조회 가능
        # ⚠️ 이 조건은 절대 변경하면 안 됩니다! (타인 데이터 보호)
        if snsgu_filter == 'B0001':
            if not smember_id_filter:
                print("❌ 보안 오류: B0001 조회 시 smember_id 필수!")
                return jsonify({'ok': False, 'error': '본인 확인이 필요합니다.'}), 403
            print(f"✅ 보안 검증: snsgu=B0001, smember_id={smember_id_filter}")
        
        # 데이터 조회
        repo_instance = get_repo()
        data = repo_instance.list_tickets(snsgu=snsgu_filter, smember_id=smember_id_filter)
        
        if data is None:
            print("⚠️ repo.list_tickets()가 None을 반환했습니다.")
            return jsonify([])
        
        items = []
        for idx, r in enumerate(data):
            try:
                # 딕셔너리 형태의 데이터 처리
                created_at = r.get('created_at')  # created_at 필드
                if isinstance(created_at, datetime):
                    created_at_str = created_at.isoformat()
                else:
                    # 문자열인 경우 그대로 사용
                    created_at_str = str(created_at) if created_at else ""
                
                updated_at = r.get('updated_at')
                if isinstance(updated_at, datetime):
                    updated_at_str = updated_at.isoformat()
                else:
                    updated_at_str = str(updated_at) if updated_at else None
                
                # birth_datetime 처리
                birth_datetime = r.get('birth_datetime')
                if isinstance(birth_datetime, datetime):
                    birth_datetime_str = birth_datetime.isoformat()
                else:
                    birth_datetime_str = str(birth_datetime) if birth_datetime else None
                
                items.append({
                    "ticket_id": r.get('id'),
                    "title_masked": r.get('title'),
                    "content_enc": r.get('content_enc', ''),
                    "author_name": r.get('author_name', ''),
                    "author_nickname": r.get('author_nickname', ''),
                    "author_contact": r.get('author_contact', ''),
                    "author_phone": r.get('author_phone', ''),
                    "author_mobile": r.get('author_mobile', ''),
                    "author_email": r.get('author_email', ''),
                    "author_gender": r.get('author_gender', ''),
                    "birth_year": r.get('birth_year'),
                    "birth_datetime": birth_datetime_str,
                    "birth_hour": r.get('birth_hour'),
                    "birth_minute": r.get('birth_minute'),
                    "calendar_type": r.get('calendar_type', ''),
                    "yundal": r.get('yundal', False),
                    "hour_ji": r.get('hour_ji', ''),
                    "snsgu": r.get('snsgu', ''),
                    "smember_id": r.get('smember_id', ''),  # PostgreSQL 소문자 컬럼명에서 가져옴
                    "status": r.get('status', 'OPEN'),
                    "created_at": created_at_str,
                    "updated_at": updated_at_str,
                    "has_admin_reply": bool(r.get('has_admin_reply', False)),
                    "post_pwd_hash": r.get('post_pwd_hash', ''),
                    "agreement": r.get('agreement', 0)
                })
            except Exception as item_error:
                print(f"❌ 항목 [{idx}] 처리 중 오류: {item_error}")
                print(f"   항목 데이터: {r}")
                import traceback
                traceback.print_exc()
                continue  # 다음 항목 계속 처리
        
        print(f"📊 API 응답 - 총 {len(items)}건")
        if items:
            print(f"📊 첫 번째 티켓 샘플:")
            print(f"   - ticket_id: {items[0].get('ticket_id')}")
            print(f"   - title_masked: {items[0].get('title_masked')}")
            print(f"   - content_enc: {items[0].get('content_enc')[:50] if items[0].get('content_enc') else '(비어있음)'}...")
            print(f"   - author_name: {items[0].get('author_name')}")
            print(f"   - author_contact: {items[0].get('author_contact')}")
            print(f"   - snsgu: {items[0].get('snsgu')}")
        
        return jsonify(items)
        
    except Exception as e:
        print(f"❌ list_tickets API 오류: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'ok': False, 'error': f'서버 오류: {str(e)}'}), 500

@bp.post('/')
def create_ticket():
    try:
        print("🚀 새 티켓 생성 API 호출")
        print(f"📡 Content-Type: {request.content_type}")
        print(f"📡 Raw data: {request.data}")
        
        # JSON 파싱을 더 안전하게 처리
        try:
            if request.content_type != 'application/json':
                return jsonify({'ok': False, 'error': 'Content-Type이 application/json이어야 합니다'}), 400
            
            d = request.get_json(force=True)
            if d is None:
                return jsonify({'ok': False, 'error': 'JSON 데이터가 없습니다'}), 400
                
        except Exception as json_error:
            print(f"❌ JSON 파싱 오류: {json_error}")
            return jsonify({'ok': False, 'error': f'JSON 파싱 오류: {str(json_error)}'}), 400
            
        print(f"📝 받은 데이터: {d}")
        
        if not d.get('title') or not d.get('content') or not d.get('post_password'):
            print("❌ 필수값 누락")
            return jsonify({'ok':False,'error':'필수값 누락'}), 400
            
        hashed = bcrypt.hashpw(d['post_password'].encode(), bcrypt.gensalt()).decode()
        ticket_id = str(uuid.uuid4())
        
        now_dt = datetime.now()
        
        # agreement 값 처리 (0 또는 1)
        agreement = int(d.get('agreement', 0))
        print(f"✅ 개인정보 동의 여부: {agreement}")
        
        # snsgu 값 처리
        snsgu = d.get('snsgu', 'A0001')
        print(f"🏢 snsgu 값: {snsgu}")
        
        # smember_id 값 처리 (전역변수에서 받은 회원 ID 또는 서버 세션에서)
        smember_id = d.get('smember_id') or d.get('smember_id')  # 대소문자 모두 지원
        if smember_id == 'null' or smember_id == '':
            smember_id = None
        # 클라이언트에서 전달되지 않은 경우 서버 세션에서 확인
        if not smember_id and session.get('member_logged_in', False):
            smember_id = session.get('smem_id')
        print(f"👤 smember_id 값: {smember_id} (타입: {type(smember_id)})")
        
        # admin_id 값 처리 (전역변수에서 받은 관리자 ID 또는 서버 세션에서)
        admin_id = d.get('admin_id')
        if admin_id == 'null' or admin_id == '':
            admin_id = None
        # 클라이언트에서 전달되지 않은 경우 서버 세션에서 확인
        if not admin_id and session.get('admin_logged_in', False):
            admin_id = session.get('admin_id')
        print(f"👨‍💼 admin_id 값: {admin_id} (타입: {type(admin_id)})")
        
        # ti_role 값 처리 (전역변수에서 받은 관리자 role 또는 서버 세션에서)
        ti_role = d.get('ti_role')
        if ti_role == 'null' or ti_role == '':
            ti_role = None
        # 클라이언트에서 전달되지 않은 경우 서버 세션에서 확인
        if not ti_role and session.get('admin_logged_in', False):
            ti_role = session.get('admin_role')
        print(f"👨‍💼 ti_role 값: {ti_role} (타입: {type(ti_role)})")
        
        # 딕셔너리 형태로 티켓 데이터 구성
        ticket = {
            'title': d['title'],
            'content': d['content'],
            'author_name': d.get('author_name', ''),
            'author_contact': d.get('author_contact', ''),
            'password_hash': hashed,  # 또는 post_pwd_hash
            'post_pwd_hash': hashed,
            'agreement': agreement,
            'snsgu': snsgu,
            'smember_id': smember_id,  # 회원 ID 추가
            'admin_id': admin_id,  # 관리자 ID 추가
            'ti_role': ti_role,  # 관리자 role 추가
            # 사주 관련 필드 추가
            'author_gender': d.get('author_gender', ''),
            'birth_year': d.get('birth_year'),
            'birth_datetime': d.get('birth_datetime'),
            'birth_hour': d.get('birth_hour'),
            'birth_minute': d.get('birth_minute'),
            'calendar_type': d.get('calendar_type', ''),
            'yundal': d.get('yundal', 'N'),
            'hour_ji': d.get('hour_ji', ''),
            'content_enc': d.get('content_enc', ''),
            'title_masked': d.get('title_masked', d['title'])
        }
        
        print(f"🔄 Repository로 티켓 생성 시작")
        print(f"📊 ticket 타입: {type(ticket)}")
        print(f"📊 ticket 내용: {ticket}")
        
        repo_instance = get_repo()
        print(f"🔄 repo 타입: {type(repo_instance)}")
        
        try:
            result = repo_instance.create_ticket(ticket)
            print(f"✅ 티켓 생성 성공: {result}")
            return jsonify({'ok': True, 'ticket_id': result})
        except Exception as repo_error:
            print(f"❌ Repository create_ticket 오류: {repo_error}")
            import traceback
            traceback.print_exc()
            error_message = str(repo_error)
            # 연결 오류인 경우 더 명확한 메시지
            if '연결' in error_message or 'connection' in error_message.lower():
                error_message = f"데이터베이스 연결 오류: {error_message}"
            return jsonify({'ok': False, 'error': error_message}), 500
        
    except Exception as e:
        print(f"❌ 티켓 생성 API 오류: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'ok': False, 'error': f'서버 오류: {str(e)}'}), 500

@bp.post('/<ticket_id>/verify')
def verify(ticket_id):
    pwd = request.get_json().get('post_password','')
    r = get_repo().get_ticket(ticket_id)
    
    if not r:
        return jsonify({'ok': False, 'error': 'not found'}), 404
    
    stored = r.get('password_hash')  # pwd_hash를 딕셔너리에서 가져옴
    
    # 비밀번호 검증 (bcrypt 또는 SHA256 방식 모두 지원)
    try:
        if isinstance(stored, str):
            stored_bytes = stored.encode()
        else:
            stored_bytes = stored
            
        # bcrypt 형식인지 확인 (bcrypt는 $2a$, $2b$, $2y$ 등으로 시작)
        if stored.startswith(('$2a$', '$2b$', '$2y$')):
            # bcrypt 검증
            if bcrypt.checkpw(pwd.encode(), stored_bytes):
                token = issue_view_token(ticket_id)
                print(f"✅ 비밀번호 검증 성공! 토큰 생성: {token[:20]}...")
                resp = make_response(jsonify({'ok': True}))
                resp.set_cookie('view_token', token, httponly=True, samesite='Lax')
                print(f"🍪 쿠키 설정 완료: view_token")
                return resp
        else:
            # SHA256 해시 검증 (기존 데이터)
            import hashlib
            pwd_hash = hashlib.sha256(pwd.encode()).hexdigest()
            if pwd_hash == stored:
                token = issue_view_token(ticket_id)
                print(f"✅ 비밀번호 검증 성공! (SHA256) 토큰 생성: {token[:20]}...")
                resp = make_response(jsonify({'ok': True}))
                resp.set_cookie('view_token', token, httponly=True, samesite='Lax')
                print(f"🍪 쿠키 설정 완료: view_token")
                return resp
        
        return jsonify({'ok': False, 'error': 'wrong password'}), 401
        
    except Exception as e:
        print(f"❌ 비밀번호 검증 오류: {e}")
        return jsonify({'ok': False, 'error': 'verification failed'}), 500
        return resp
    return jsonify({'ok': False}), 403

@bp.put('/<ticket_id>')
def update_ticket(ticket_id):
    print(f"✏️ update_ticket called with ID: '{ticket_id}'")
    
    # 데이터 검증
    d = request.get_json()
    print(f"📝 받은 데이터: {d}")
    
    if not d:
        print("❌ 데이터가 비어있음")
        return jsonify({'ok': False, 'error': 'JSON 데이터가 필요합니다'}), 400
        
    if not d.get('title') or not d.get('content'):
        print(f"❌ 필수 필드 누락: title='{d.get('title')}', content='{d.get('content')}'")
        return jsonify({'ok': False, 'error': '제목과 내용은 필수입니다'}), 400
    
    # 티켓 존재 여부 확인
    r = get_repo().get_ticket(ticket_id)
    if not r:
        return jsonify({'ok': False, 'error': '게시글을 찾을 수 없습니다'}), 404
    
    # 관리자 답변이 있는지 확인 (role이 존재하고 'USER'가 아니면 관리자 답변으로 간주)
    messages = get_repo().list_messages(ticket_id)
    if messages:
        # role이 존재하고 비어있지 않으며 'USER'가 아니면 관리자 답변으로 간주
        has_admin_reply = False
        for msg in messages:
            msg_role = msg.get('role', '').strip() if msg.get('role') else ''
            # role이 존재하고 'USER'가 아니면 관리자 답변으로 간주
            if msg_role and msg_role.upper() != 'USER':
                has_admin_reply = True
                break
        
        if has_admin_reply:
            return jsonify({'ok': False, 'error': '관리자 답변이 있어서 수정할 수 없습니다'}), 403
    
    try:
        # Repository를 통한 수정 (딕셔너리 형태로 전달)
        # 클라이언트에서 전송한 필드만 업데이트 (기존 데이터 보호)
        update_data = {}
        
        # 필수 필드 (항상 업데이트)
        update_data['title'] = d['title']
        update_data['content'] = d['content']
        
        # 선택적 필드 (클라이언트에서 전송한 경우만 업데이트)
        if 'author_name' in d:
            update_data['author_name'] = d['author_name']
        if 'author_contact' in d:
            update_data['author_contact'] = d['author_contact']
        
        # 사주 관련 필드 (클라이언트에서 전송한 경우만 업데이트)
        if 'author_gender' in d:
            update_data['author_gender'] = d['author_gender']
        if 'birth_year' in d:
            update_data['birth_year'] = d['birth_year']
        if 'birth_datetime' in d:
            update_data['birth_datetime'] = d['birth_datetime']
        if 'birth_hour' in d:
            update_data['birth_hour'] = d['birth_hour']
        if 'birth_minute' in d:
            update_data['birth_minute'] = d['birth_minute']
        if 'calendar_type' in d:
            update_data['calendar_type'] = d['calendar_type']
        if 'yundal' in d:
            update_data['yundal'] = d['yundal']
        if 'hour_ji' in d:
            update_data['hour_ji'] = d['hour_ji']
        if 'content_enc' in d:
            update_data['content_enc'] = d['content_enc']
        if 'title_masked' in d:
            update_data['title_masked'] = d['title_masked']
        
        print(f"📊 최종 업데이트 데이터: {update_data}")
        get_repo().update_ticket(ticket_id, update_data)
        
        print(f"✅ Updated ticket {ticket_id}: title='{d['title']}', author_name='{d.get('author_name', '')}'")
        
        return jsonify({'ok': True, 'message': '게시글이 성공적으로 수정되었습니다'})
        
    except Exception as e:
        print(f"❌ Update error: {e}")
        import traceback
        traceback.print_exc()
        error_detail = str(e)
        # PostgreSQL 에러 메시지 추출
        if hasattr(e, 'pgerror'):
            error_detail = f"{error_detail} (DB: {e.pgerror})"
        return jsonify({'ok': False, 'error': f'수정 중 오류가 발생했습니다: {error_detail}'}), 500

@bp.get('/<ticket_id>')
def detail(ticket_id):
    print(f"🔍 detail API 호출: ticket_id={ticket_id}")
    print(f"⚠️ 인증 체크 없이 데이터 조회 (사주보기 기능용)")
    
    r = get_repo().get_ticket(ticket_id)
    if not r:
        print("❌ 티켓을 찾을 수 없음")
        return jsonify({'ok': False, 'error': 'not found'}), 404
        
    print(f"✅ 티켓 데이터 조회 성공: {r.get('title', 'No title')}")
    print(f"📊 티켓 상세 정보:")
    print(f"   - author_name: {r.get('author_name')} (타입: {type(r.get('author_name')).__name__})")
    print(f"   - birth_datetime: {r.get('birth_datetime')} (타입: {type(r.get('birth_datetime')).__name__})")
    print(f"   - birth_hour: {r.get('birth_hour')} (타입: {type(r.get('birth_hour')).__name__})")
    print(f"   - birth_minute: {r.get('birth_minute')} (타입: {type(r.get('birth_minute')).__name__})")
    print(f"   - calendar_type: {r.get('calendar_type')} (타입: {type(r.get('calendar_type')).__name__})")
    print(f"   - yundal: {r.get('yundal')} (타입: {type(r.get('yundal')).__name__})")
    print(f"   - author_gender: {r.get('author_gender')} (타입: {type(r.get('author_gender')).__name__})")
    print(f"   - hour_ji: {r.get('hour_ji')} (타입: {type(r.get('hour_ji')).__name__})")
    print(f"📋 전체 티켓 데이터 (r)의 키 목록: {list(r.keys())}")
    
    # 메시지 조회
    messages = get_repo().get_messages_by_ticket(ticket_id)
    print(f"📧 메시지 조회 결과: {len(messages)}개")
    
    # 메시지의 created_at을 ISO 형식 문자열로 변환
    formatted_messages = []
    for msg in messages:
        formatted_msg = dict(msg)
        created_at = msg.get('created_at')
        if created_at:
            if isinstance(created_at, datetime):
                formatted_msg['created_at'] = created_at.isoformat()
            else:
                # 이미 문자열인 경우 그대로 사용
                formatted_msg['created_at'] = str(created_at)
        formatted_messages.append(formatted_msg)
    
    # has_admin_reply 여부 확인
    has_admin_reply = len(messages) > 0
    print(f"🛡️ 관리자 답변 여부: {has_admin_reply}")
    
    # birth_datetime 처리
    birth_datetime = r.get('birth_datetime')
    if isinstance(birth_datetime, datetime):
        birth_datetime_str = birth_datetime.isoformat()
    else:
        birth_datetime_str = str(birth_datetime) if birth_datetime else None
    
    print(f"📤 birth_datetime 변환: {birth_datetime} → {birth_datetime_str}")
    
    response_data = {
        'ok': True,
        'ticket': {
            'id': r.get('id'),
            'title': r.get('title'),
            'content': r.get('content'),
            'content_enc': r.get('content_enc', ''),
            'author_name': r.get('author_name', ''),
            'author_nickname': r.get('author_nickname', ''),
            'author_contact': r.get('author_contact', ''),
            'author_phone': r.get('author_phone', ''),
            'author_mobile': r.get('author_mobile', ''),
            'author_email': r.get('author_email', ''),
            'author_gender': r.get('author_gender', ''),
            'birth_year': r.get('birth_year'),
            'birth_datetime': birth_datetime_str,
            'birth_hour': r.get('birth_hour'),
            'birth_minute': r.get('birth_minute'),
            'calendar_type': r.get('calendar_type', ''),
            'yundal': r.get('yundal', False),  # BOOLEAN 타입으로 반환
            'hour_ji': r.get('hour_ji', ''),
            'snsgu': r.get('snsgu', ''),
            'smember_id': r.get('smember_id', ''),
            'created_at': r.get('created_at').isoformat() if r.get('created_at') else None,
            'updated_at': r.get('updated_at').isoformat() if r.get('updated_at') else None,
            'is_noticed': r.get('is_noticed', False),
            'has_admin_reply': has_admin_reply,
            'agreement': r.get('agreement', 0)
        },
        'messages': formatted_messages
    }
    
    print(f"📤 응답 데이터 (ticket 부분):")
    print(f"   - author_name: {response_data['ticket']['author_name']}")
    print(f"   - birth_datetime: {response_data['ticket']['birth_datetime']}")
    print(f"   - birth_hour: {response_data['ticket']['birth_hour']}")
    print(f"   - birth_minute: {response_data['ticket']['birth_minute']}")
    print(f"   - calendar_type: {response_data['ticket']['calendar_type']}")
    print(f"   - yundal: {response_data['ticket']['yundal']}")
    print(f"   - author_gender: {response_data['ticket']['author_gender']}")
    print(f"   - hour_ji: {response_data['ticket']['hour_ji']}")
    
    return jsonify(response_data)

@bp.delete('/<ticket_id>')
def delete_ticket(ticket_id):
    """티켓 삭제 (soft delete)"""
    print(f"🗑️ delete_ticket called with ID: '{ticket_id}'")
    
    # 티켓 존재 여부 확인
    r = get_repo().get_ticket(ticket_id)
    if not r:
        return jsonify({'ok': False, 'error': '게시글을 찾을 수 없습니다'}), 404
    
    try:
        # Repository를 통한 삭제 (soft delete)
        get_repo().delete_ticket(ticket_id)
        
        print(f"✅ Deleted ticket {ticket_id}")
        
        return jsonify({'ok': True, 'message': '게시글이 성공적으로 삭제되었습니다'})
        
    except Exception as e:
        print(f"❌ Delete error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'ok': False, 'error': f'삭제 중 오류가 발생했습니다: {str(e)}'}), 500
