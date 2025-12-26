"""
Gunicorn 설정 파일
프로덕션 환경에서 사용
"""

import multiprocessing
import os
import sys

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

# 로깅 설정
# cloudtype.io 같은 클라우드 환경에서는 stdout/stderr 사용 권장
# 파일 로그는 로컬 환경이나 파일 시스템에 쓰기 권한이 있을 때만 사용
use_file_logging = os.environ.get('USE_FILE_LOGGING', 'false').lower() == 'true'

if use_file_logging:
    # 파일 로그 사용 (로컬 환경)
    try:
        # logs 디렉토리 자동 생성
        os.makedirs("logs", exist_ok=True)
        accesslog = "logs/access.log"
        errorlog = "logs/error.log"
    except (PermissionError, OSError):
        # 파일 생성 실패 시 stdout/stderr로 폴백
        accesslog = "-"  # stdout
        errorlog = "-"   # stderr
else:
    # stdout/stderr 사용 (클라우드 환경 권장)
    accesslog = "-"  # stdout
    errorlog = "-"   # stderr

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
