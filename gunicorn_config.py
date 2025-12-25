"""
Gunicorn 설정 파일
프로덕션 환경에서 사용
"""

import multiprocessing
import os

# logs 디렉토리 자동 생성
os.makedirs("logs", exist_ok=True)

# 서버 소켓 (cloudtype.io는 PORT 환경 변수 제공)
port = int(os.environ.get('PORT', 5000))
bind = f"0.0.0.0:{port}"
backlog = 2048

# 워커 프로세스
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
timeout = 120  # 사주 계산 등 시간이 걸릴 수 있음
keepalive = 2

# 로깅
accesslog = "logs/access.log"
errorlog = "logs/error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# 프로세스 네이밍
proc_name = "naratt_fortune"

# 데몬 모드 (systemd 사용 시 False)
daemon = False

# 디렉토리
pythonpath = os.path.dirname(os.path.abspath(__file__))

# 보안
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# 재시작 설정
graceful_timeout = 30
