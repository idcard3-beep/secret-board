import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
STORAGE = os.getenv("STORAGE", "POSTGRESQL")  # EXCEL | MSSQL | POSTGRESQL - PostgreSQL을 기본값으로 변경

# cloudtype.io 환경을 위한 업로드 경로 설정
# 환경 변수가 설정되어 있으면 사용, 없으면 cloudtype.io 환경 감지
if os.getenv("UPLOAD_ROOT"):
    UPLOAD_ROOT = os.getenv("UPLOAD_ROOT")
    print(f"📁 UPLOAD_ROOT (환경 변수): {UPLOAD_ROOT}")
else:
    # cloudtype.io 환경 감지
    # cloudtype.io에서는 /tmp/uploads 사용 (쓰기 권한 보장)
    upload_path = os.path.join(BASE_DIR, "uploads")
    
    # cloudtype.io 환경 감지 (환경 변수나 경로로 판단)
    is_cloudtype = (
        os.getenv("CLOUDTYPE") == "true" or
        "cloudtype" in os.getenv("HOSTNAME", "").lower() or
        os.path.exists("/tmp") and os.access("/tmp", os.W_OK)
    )
    
    if is_cloudtype:
        # cloudtype.io 환경: /tmp/uploads 사용
        UPLOAD_ROOT = "/tmp/uploads"
        try:
            os.makedirs(UPLOAD_ROOT, exist_ok=True)
            # 쓰기 권한 확인
            if os.access(UPLOAD_ROOT, os.W_OK):
                print(f"✅ UPLOAD_ROOT (cloudtype.io): {UPLOAD_ROOT}")
            else:
                print(f"⚠️ UPLOAD_ROOT 쓰기 불가, 로컬 경로 사용: {upload_path}")
                UPLOAD_ROOT = upload_path
        except Exception as e:
            print(f"⚠️ /tmp/uploads 생성 실패: {e}, 로컬 경로 사용: {upload_path}")
            UPLOAD_ROOT = upload_path
    else:
        # 로컬 개발 환경
        UPLOAD_ROOT = upload_path
        print(f"📁 UPLOAD_ROOT (로컬): {UPLOAD_ROOT}")
ALLOWED_EXT = {'.png','.jpg','.jpeg','.pdf','.txt','.doc','.docx'}
MAX_FILE_MB = int(os.getenv("MAX_FILE_MB", "10"))

VIEW_TOKEN_SECRET = os.getenv("VIEW_TOKEN_SECRET", "change-me")

# PostgreSQL 설정 (Render.com 운영 서버)
#POSTGRES_HOST = os.getenv("POSTGRES_HOST", "dpg-d3nhsdadbo4c73d0dehg-a.singapore-postgres.render.com")
#POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
#POSTGRES_DB = os.getenv("POSTGRES_DB", "secretboard_fyqs")
#POSTGRES_USER = os.getenv("POSTGRES_USER", "secretboard_user")
#POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "xToIsayLLO9nFmeiAPChiF96d3khj8Eq")
#
## Render.com PostgreSQL DATABASE_URL (새 서버)
#DATABASE_URL = os.getenv("DATABASE_URL", 
#    "postgresql://secretboard_user:xToIsayLLO9nFmeiAPChiF96d3khj8Eq@dpg-d3nhsdadbo4c73d0dehg-a.singapore-postgres.render.com/secretboard_fyqs")


# PostgreSQL 설정 (cloudtype.io 운영 서버)
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "svc.sel3.cloudtype.app")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "32624")
POSTGRES_DB = os.getenv("POSTGRES_DB", "secretboard")
POSTGRES_USER = os.getenv("POSTGRES_USER", "secretboard_user")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "xToIsayLLO9nFmeiAPChiF96d3khj8Eq")

# cloudtype.io PostgreSQL DATABASE_URL (무조건 cloudtype.io 서버만 사용)
# 환경 변수 무시하고 cloudtype.io 서버로 강제 설정
DATABASE_URL = "postgresql://secretboard_user:xToIsayLLO9nFmeiAPChiF96d3khj8Eq@svc.sel3.cloudtype.app:32624/secretboard"
# 환경 변수도 함께 설정
os.environ["DATABASE_URL"] = DATABASE_URL
   

# MSxSQL (로컬 개발용 - 필요시에만 사용)
##MSxSQL_DRIVER = os.getenv("MSxSQL_DRIVER", "SQL Server")
#MSxSQL_SERVER = os.getenv("MSxSQL_SERVER", "isonan.net")
#MSxSQL_DB = os.getenv("MSxSQL_DB", "sonan")
#MSxSQL_USER = os.getenv("MSxSQL_USER", "sonan")
#MSxSQL_PWD = os.getenv("MSxSQL_PWD", "sonan")