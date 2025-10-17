from flask import Flask, render_template
from dotenv import load_dotenv
import os

# .env 파일 로드
load_dotenv()

# 서버 DATABASE_URL 강제 설정 (로컬에서 서버 DB 사용)
if not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "postgresql://secretboard_user:xToIsayLLO9nFmeiAPChiF96d3khj8Eq@dpg-d3nhsdadbo4c73d0dehg-a.singapore-postgres.render.com/secretboard_fyqs"
    print("🔧 DATABASE_URL 환경변수 강제 설정 완료")

from api.tickets import bp as tickets_bp
from api.messages import bp as messages_bp
from api.admin import bp as admin_bp
from api.files import bp as files_bp
from config.settings import UPLOAD_ROOT

app = Flask(__name__, template_folder='web/templates', static_folder='web/static')

# SECRET_KEY 설정 (환경 변수에서 읽거나 기본값 사용)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-change-in-production")

# 추가 Flask 설정
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv("MAX_FILE_MB", "10")) * 1024 * 1024  # 파일 업로드 크기 제한

# Register APIs
print("🔧 API Blueprint 등록 중...")
app.register_blueprint(tickets_bp, url_prefix="/api/v1/tickets")
print("✅ tickets_bp 등록 완료")
app.register_blueprint(messages_bp, url_prefix="/api/v1/messages")
print("✅ messages_bp 등록 완료")
app.register_blueprint(admin_bp, url_prefix="/api/v1/admin")
print("✅ admin_bp 등록 완료")
app.register_blueprint(files_bp, url_prefix="/api/v1/files")
print("✅ files_bp 등록 완료")
print("✅ 모든 Blueprint 등록 완료")

# Pages
print("🚀 Flask 앱이 시작되었습니다!")
@app.route("/")
def home(): return render_template("list.html")

@app.route("/list")
def page_list(): return render_template("list.html")

@app.route("/new")
def page_new(): return render_template("new.html")

@app.route("/view")
def page_view(): return render_template("view.html")

@app.route("/edit")
def page_edit(): return render_template("edit.html")

@app.route("/admin_login")
def page_admin_login(): return render_template("admin_login.html")

@app.route("/admin_list")
def page_admin_list(): return render_template("admin_list.html")

@app.route("/admin_view")
def page_admin_view(): return render_template("admin_view.html")

if __name__ == "__main__":
    os.makedirs(UPLOAD_ROOT, exist_ok=True)
    
    # Render.com 환경에서는 PORT 환경변수 사용
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    debug = os.getenv("FLASK_ENV") != "production"
    
    print(f"🚀 Flask 서버 시작 (포트 {port})")
    if debug:
        print(f"🌐 브라우저에서 http://127.0.0.1:{port} 접속하세요")
    
    app.run(debug=debug, host=host, port=port)
