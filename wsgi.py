"""
WSGI 엔트리포인트
Gunicorn, uWSGI 등 프로덕션 서버에서 사용
"""

from main_app import application

# Gunicorn이 사용할 WSGI 애플리케이션
if __name__ == "__main__":
    from werkzeug.serving import run_simple
    import os
    
    port = int(os.environ.get('PORT', 5000))
    run_simple('0.0.0.0', port, application)
