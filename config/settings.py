import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
STORAGE = os.getenv("STORAGE", "POSTGRESQL")  # EXCEL | MSSQL | POSTGRESQL - PostgreSQL을 기본값으로 변경

UPLOAD_ROOT = os.getenv("UPLOAD_ROOT", os.path.join(BASE_DIR, "uploads"))
ALLOWED_EXT = {'.png','.jpg','.jpeg','.pdf','.txt','.doc','.docx'}
MAX_FILE_MB = int(os.getenv("MAX_FILE_MB", "10"))

VIEW_TOKEN_SECRET = os.getenv("VIEW_TOKEN_SECRET", "change-me")

# PostgreSQL 설정 (운영 서버)
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "dpg-d3mctk0gjchc73d1t57g-a")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "secretboard")
POSTGRES_USER = os.getenv("POSTGRES_USER", "secretboard_user")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "A7kKvXyBD9IYMi4zHhbNatctDNE5gYlA")

# Render.com PostgreSQL DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL", 
    "postgresql://secretboard_user:A7kKvXyBD9IYMi4zHhbNatctDNE5gYlA@dpg-d3mctk0gjchc73d1t57g-a/secretboard")

# MSxSQL (로컬 개발용 - 필요시에만 사용)
##MSxSQL_DRIVER = os.getenv("MSxSQL_DRIVER", "SQL Server")
#MSxSQL_SERVER = os.getenv("MSxSQL_SERVER", "isonan.net")
#MSxSQL_DB = os.getenv("MSxSQL_DB", "sonan")
#MSxSQL_USER = os.getenv("MSxSQL_USER", "sonan")
#MSxSQL_PWD = os.getenv("MSxSQL_PWD", "sonan")