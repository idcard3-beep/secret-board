from flask import Blueprint, request, jsonify
from adapters.repository_factory import get_repository
from core.security import verify_view_token
from datetime import datetime
import uuid

bp = Blueprint('messages', __name__)
repo = get_repository()

@bp.post('/<ticket_id>')
def create_user_message(ticket_id):
    token = request.cookies.get('view_token')
    if not token or not verify_view_token(token, ticket_id):
        return ('', 403)
    d = request.get_json() or {}
    content = (d.get('content') or '').strip()
    if len(content) < 2:
        return jsonify({'ok':False,'error':'내용이 너무 짧습니다.'}), 400
    repo.create_message({
        'msg_id': str(uuid.uuid4()),
        'ticket_id': ticket_id,
        'role': 'USER',
        'content': content,
        'created_at': datetime.now().isoformat()
    })
    return jsonify({'ok': True})
