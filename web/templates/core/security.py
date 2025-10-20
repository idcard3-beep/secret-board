import os, hmac, hashlib, time, base64
from flask import request

SECRET = os.getenv("VIEW_TOKEN_SECRET", "dev-view-token-secret")
TTL = 1800  # 30 minutes

def issue_view_token(ticket_id: str) -> str:
    exp = int(time.time()) + TTL
    msg = f"{ticket_id}.{exp}".encode()
    sig = hmac.new(SECRET.encode(), msg, hashlib.sha256).digest()
    return base64.urlsafe_b64encode(msg + b'.' + sig).decode()

def verify_view_token(token: str, ticket_id: str) -> bool:
    try:
        raw = base64.urlsafe_b64decode(token.encode())
        parts = raw.split(b'.')
        msg = b'.'.join(parts[:2])
        sig = parts[2]
        if not hmac.compare_digest(sig, hmac.new(SECRET.encode(), msg, hashlib.sha256).digest()):
            return False
        tid, exp = msg.decode().split('.')
        return tid == ticket_id and int(exp) >= int(time.time())
    except Exception:
        return False
