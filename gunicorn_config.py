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

# 워커 프로세스 설정
# cloudtype.io 같은 클라우드 환경에서는 메모리 제한이 있으므로 워커 수를 제한
# 환경 변수 GUNICORN_WORKERS로 설정 가능, 기본값은 1 (메모리 절약 및 빠른 시작)
# 각 워커가 모든 앱을 로드하므로 메모리 사용량이 큼
gunicorn_workers_env = os.environ.get('GUNICORN_WORKERS')

if gunicorn_workers_env:
    # 환경 변수로 명시적으로 설정된 경우
    workers = int(gunicorn_workers_env)
else:
    # 환경 변수가 없는 경우: 클라우드 환경에 적합한 기본값 사용
    # 로컬 환경에서 더 많은 워커가 필요한 경우 환경 변수로 설정
    default_workers = 1  # 클라우드 환경에 적합한 기본값 (메모리 절약 및 빠른 시작)
    workers = default_workers

# preload_app: 애플리케이션을 마스터 프로세스에서 미리 로드
# 메모리는 더 사용하지만 워커 시작 시간 단축 및 메모리 공유로 전체 메모리 사용량 감소
preload_app = True

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
