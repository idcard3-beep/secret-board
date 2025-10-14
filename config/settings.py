import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
STORAGE = os.getenv("STORAGE", "POSTGRESQL")  # EXCEL | MSSQL | POSTGRESQL - PostgreSQL을 기본값으로 변경

UPLOAD_ROOT = os.getenv("UPLOAD_ROOT", os.path.join(BASE_DIR, "uploads"))
ALLOWED_EXT = {'.png','.jpg','.jpeg','.pdf','.txt','.doc','.docx'}
MAX_FILE_MB = int(os.getenv("MAX_FILE_MB", "10"))

VIEW_TOKEN_SECRET = os.getenv("VIEW_TOKEN_SECRET", "change-me")

# PostgreSQL (기본 데이터베이스)
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "secretboard")
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "rich")
# Render.com에서는 DATABASE_URL 환경변수로 제공됨
DATABASE_URL = os.getenv("DATABASE_URL", None)

# MSxSQL (로컬 개발용 - 필요시에만 사용)
##MSxSQL_DRIVER = os.getenv("MSxSQL_DRIVER", "SQL Server")
#MSxSQL_SERVER = os.getenv("MSxSQL_SERVER", "isonan.net")
#MSxSQL_DB = os.getenv("MSxSQL_DB", "sonan")
#MSxSQL_USER = os.getenv("MSxSQL_USER", "sonan")
#MSxSQL_PWD = os.getenv("MSxSQL_PWD", "sonan")