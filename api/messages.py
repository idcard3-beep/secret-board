from flask import Blueprint, request, jsonify, session
from adapters.repository_factory import get_repository
from core.security import verify_view_token
from datetime import datetime
import uuid

bp = Blueprint('messages', __name__)

# Repository를 지연 초기화 (DATABASE_URL이 설정된 후에 초기화되도록)
_repo = None
def get_repo():
    """Repository 인스턴스를 지연 초기화하여 반환"""
    global _repo
    if _repo is None:
        _repo = get_repository()
    return _repo

def require_admin():
    """관리자 인증 확인"""
    return bool(session.get('admin_logged_in'))

@bp.get('/')
def list_all_messages():
    """모든 메시지 목록 반환 (관리자용)"""
    print("📋 모든 메시지 목록 요청")
    
    if not require_admin():
        print("❌ 관리자 인증 실패")
        return ('', 401)
    
    try:
        import psycopg2.extras
        
        # PostgreSQL에서 모든 메시지 가져오기
        with get_repo()._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT 
                        msg_id,
                        ticket_id,
                        role,
                        content_enc,
                        admin_id,
                        created_at
                    FROM thread_messages
                    ORDER BY created_at ASC
                """)
                
                rows = cursor.fetchall()
                messages = []
                
                for row in rows:
                    # created_at을 문자열로 변환
                    created_at = row['created_at']
                    if isinstance(created_at, datetime):
                        created_at_str = created_at.isoformat()
                    else:
                        created_at_str = str(created_at) if created_at else ""
                    
                    msg = {
                        'message_id': str(row['msg_id']) if row['msg_id'] else '',
                        'ticket_id': str(row['ticket_id']) if row['ticket_id'] else '',
                        'role': row['role'] if row['role'] else 'admin',
                        'content_enc': row['content_enc'] if row['content_enc'] else '',
                        'body': row['content_enc'] if row['content_enc'] else '',  # 표시용
                        'admin_id': row['admin_id'] if row['admin_id'] else '',
                        'created_at': created_at_str
                    }
                    messages.append(msg)
                
                print(f"✅ 메시지 목록 조회 완료: {len(messages)}개")
                if messages:
                    print(f"📊 첫 번째 메시지 샘플: {messages[0]}")
                
                return jsonify(messages)
                
    except Exception as e:
        print(f"❌ 메시지 목록 조회 오류: {e}")
        import traceback
        print(f"❌ 스택 트레이스: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@bp.post('/<ticket_id>')
def create_user_message(ticket_id):
    token = request.cookies.get('view_token')
    if not token or not verify_view_token(token, ticket_id):
        return ('', 403)
    d = request.get_json() or {}
    content = (d.get('content') or '').strip()
    if len(content) < 2:
        return jsonify({'ok':False,'error':'내용이 너무 짧습니다.'}), 400
    get_repo().create_message({
        'msg_id': str(uuid.uuid4()),
        'ticket_id': ticket_id,
        'role': 'USER',
        'content': content,
        'created_at': datetime.now().isoformat()
    })
    return jsonify({'ok': True})

@bp.put('/<msg_id>')
def update_message(msg_id):
    """메시지 수정 (관리자 전용)"""
    print(f"🔄 메시지 수정 API 호출: msg_id={msg_id}")
    
    if not require_admin():
        print("❌ 관리자 인증 실패")
        return jsonify({'error': '권한이 없습니다.'}), 403
    
    try:
        d = request.get_json() or {}
        content = (d.get('content') or '').strip()
        role = (d.get('role') or 'admin').strip()
        
        if len(content) < 1:
            return jsonify({'ok': False, 'error': '내용이 비었습니다.'}), 400
        
        import psycopg2.extras
        
        with get_repo()._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("""
                    UPDATE thread_messages
                    SET content_enc = %s, role = %s
                    WHERE msg_id = %s
                    RETURNING msg_id
                """, (content, role, msg_id))
                
                result = cursor.fetchone()
                conn.commit()
                
                if result:
                    print(f"✅ 메시지 수정 완료: msg_id={msg_id}")
                    return jsonify({'ok': True, 'message': '메시지가 수정되었습니다.'})
                else:
                    print(f"❌ 메시지를 찾을 수 없음: msg_id={msg_id}")
                    return jsonify({'ok': False, 'error': '메시지를 찾을 수 없습니다.'}), 404
                
    except Exception as e:
        print(f"❌ 메시지 수정 오류: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'ok': False, 'error': str(e)}), 500

@bp.delete('/<msg_id>')
def delete_message(msg_id):
    """메시지 삭제 (관리자 전용)"""
    print(f"🔄 메시지 삭제 API 호출: msg_id={msg_id}")
    
    if not require_admin():
        print("❌ 관리자 인증 실패")
        return jsonify({'error': '권한이 없습니다.'}), 403
    
    try:
        import psycopg2.extras
        
        with get_repo()._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("""
                    DELETE FROM thread_messages
                    WHERE msg_id = %s
                    RETURNING msg_id
                """, (msg_id,))
                
                result = cursor.fetchone()
                conn.commit()
                
                if result:
                    print(f"✅ 메시지 삭제 완료: msg_id={msg_id}")
                    return jsonify({'ok': True, 'message': '메시지가 삭제되었습니다.'})
                else:
                    print(f"❌ 메시지를 찾을 수 없음: msg_id={msg_id}")
                    return jsonify({'ok': False, 'error': '메시지를 찾을 수 없습니다.'}), 404
                
    except Exception as e:
        print(f"❌ 메시지 삭제 오류: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'ok': False, 'error': str(e)}), 500
