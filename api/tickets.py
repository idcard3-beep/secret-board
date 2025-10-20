from flask import Blueprint, request, jsonify, make_response
from adapters.repository_factory import get_repository
from core.security import issue_view_token, verify_view_token
import bcrypt, uuid
from datetime import datetime

bp = Blueprint('tickets', __name__)
repo = get_repository()

@bp.get('/')
def list_tickets():
    data = repo.list_tickets()
    items = []
    for r in data:
        # 딕셔너리 형태의 데이터 처리
        created_at = r.get('created_at')  # created_at 필드
        if isinstance(created_at, datetime):
            created_at_str = created_at.isoformat()
        else:
            # 문자열인 경우 그대로 사용
            created_at_str = str(created_at) if created_at else ""
        
        items.append({
            "ticket_id": r.get('id'), 
            "title": r.get('title'), 
            "status": r.get('status', 'OPEN'), 
            "created_at": created_at_str,
            "has_admin_reply": bool(r.get('has_admin_reply', False))
        })
    
    print(f"📊 API 응답 예시 - created_at: {items[0]['created_at'] if items else 'N/A'}")
    return jsonify(items)

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
        
        # 딕셔너리 형태로 티켓 데이터 구성
        ticket = {
            'title': d['title'],
            'content': d['content'],
            'author_name': d.get('author_name', ''),
            'author_contact': d.get('author_contact', ''),
            'password_hash': hashed,  # 또는 post_pwd_hash
            'post_pwd_hash': hashed,
            'agreement': agreement,
            'snsgu': snsgu
        }
        
        print(f"🔄 Repository로 티켓 생성 시작")
        print(f"📊 ticket 타입: {type(ticket)}")
        print(f"📊 ticket 내용: {ticket}")
        print(f"🔄 repo 타입: {type(repo)}")
        
        result = repo.create_ticket(ticket)
        
        print(f"✅ 티켓 생성 성공: {result}")
        return jsonify({'ok': True, 'ticket_id': result})
        
    except Exception as e:
        print(f"❌ 티켓 생성 API 오류: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'ok': False, 'error': f'서버 오류: {str(e)}'}), 500

@bp.post('/<ticket_id>/verify')
def verify(ticket_id):
    pwd = request.get_json().get('post_password','')
    r = repo.get_ticket(ticket_id)
    
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
    r = repo.get_ticket(ticket_id)
    if not r:
        return jsonify({'ok': False, 'error': '게시글을 찾을 수 없습니다'}), 404
    
    # 관리자 답변이 있는지 확인
    messages = repo.list_messages(ticket_id)
    if messages:
        return jsonify({'ok': False, 'error': '관리자 답변이 있어서 수정할 수 없습니다'}), 403
    
    try:
        # Repository를 통한 수정 (딕셔너리 형태로 전달)
        update_data = {
            'title': d['title'],
            'content': d['content'],
            'author_name': d.get('author_name', ''),
            'author_contact': d.get('author_contact', '')
        }
        repo.update_ticket(ticket_id, update_data)
        
        print(f"✅ Updated ticket {ticket_id}: title='{d['title']}', author_name='{d.get('author_name', '')}'")
        
        return jsonify({'ok': True, 'message': '게시글이 성공적으로 수정되었습니다'})
        
    except Exception as e:
        print(f"❌ Update error: {e}")
        return jsonify({'ok': False, 'error': f'수정 중 오류가 발생했습니다: {str(e)}'}), 500

@bp.get('/<ticket_id>')
def detail(ticket_id):
    print(f"🔍 detail API 호출: ticket_id={ticket_id}")
    
    # 쿠키에서 view_token 확인
    view_token = request.cookies.get('view_token')
    print(f"🍪 쿠키에서 가져온 view_token: {view_token}")
    print(f"🍪 모든 쿠키: {dict(request.cookies)}")
    
    if not view_token:
        print("❌ view_token이 없음")
        return jsonify({'ok': False, 'error': 'unauthorized - no token'}), 401
        
    # 토큰 검증
    token_valid = verify_view_token(view_token, ticket_id)
    print(f"🔐 토큰 검증 결과: {token_valid}")
    
    if not token_valid:
        print("❌ 토큰 검증 실패")
        return jsonify({'ok': False, 'error': 'unauthorized - invalid token'}), 401
    
    print("✅ 토큰 검증 성공")
    
    r = repo.get_ticket(ticket_id)
    if not r:
        print("❌ 티켓을 찾을 수 없음")
        return jsonify({'ok': False, 'error': 'not found'}), 404
        
    print(f"✅ 티켓 데이터 조회 성공: {r.get('title', 'No title')}")
    
    # 메시지 조회
    messages = repo.get_messages_by_ticket(ticket_id)
    print(f"📧 메시지 조회 결과: {len(messages)}개")
    
    # has_admin_reply 여부 확인
    has_admin_reply = len(messages) > 0
    print(f"🛡️ 관리자 답변 여부: {has_admin_reply}")
    
    return jsonify({
        'ok': True,
        'ticket': {
            'id': r.get('id'),
            'title': r.get('title'),
            'content': r.get('content'),
            'author_name': r.get('author_name', ''),
            'author_contact': r.get('author_contact', ''),
            'created_at': r.get('created_at').isoformat() if r.get('created_at') else None,
            'is_noticed': r.get('is_noticed', False),
            'has_admin_reply': has_admin_reply
        },
        'messages': messages
    })
