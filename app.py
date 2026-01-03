from flask import Flask, render_template, session, send_from_directory, request
from werkzeug.middleware.proxy_fix import ProxyFix
import os

# cloudtype.io 서버 정보를 가장 먼저 설정 (다른 모듈 import 전에)
# .env 파일이나 시스템 환경 변수 무시하고 무조건 cloudtype.io 서버로 설정
CLOUDTYPE_DB_URL = "postgresql://secretboard_user:xToIsayLLO9nFmeiAPChiF96d3khj8Eq@svc.sel3.cloudtype.app:32624/secretboard"
os.environ["DATABASE_URL"] = CLOUDTYPE_DB_URL

# .env 파일 로드 (하지만 override=False로 기존 환경 변수는 덮어쓰지 않음)
from dotenv import load_dotenv
load_dotenv(override=False)  # 기존 환경 변수(DATABASE_URL)를 덮어쓰지 않음

# 다시 한번 확실하게 설정
os.environ["DATABASE_URL"] = CLOUDTYPE_DB_URL

# 설정 확인 및 검증 (cloudtype.io 전용)
actual_db_url = os.environ.get("DATABASE_URL", "")
if "singapore-postgres.render.com" in actual_db_url or "dpg-d3nhsdadbo4c73d0dehg-a" in actual_db_url:
    print("=" * 80)
    print("[WARNING] ⚠️ 이전 Render.com 서버 정보가 감지되었습니다!")
    print(f"   현재 DATABASE_URL: {actual_db_url[:100]}...")
    print("   cloudtype.io 서버로 강제 변경합니다!")
    print("=" * 80)
    os.environ["DATABASE_URL"] = CLOUDTYPE_DB_URL

# cloudtype.io 서버로 최종 확인
if "cloudtype.app" not in os.environ.get("DATABASE_URL", ""):
    print("=" * 80)
    print("[ERROR] ⚠️ DATABASE_URL이 cloudtype.io 서버를 가리키지 않습니다!")
    print("   cloudtype.io 서버로 강제 설정합니다!")
    print("=" * 80)
    os.environ["DATABASE_URL"] = CLOUDTYPE_DB_URL

print("✅ DATABASE_URL 설정 완료 (cloudtype.io 전용)")
print(f"📋 서버: svc.sel3.cloudtype.app:32624/secretboard")

from api.tickets import bp as tickets_bp
from api.messages import bp as messages_bp
from api.admin import bp as admin_bp
from api.files import bp as files_bp
from api.smembers import bp as smembers_bp
from api.corpus import bp as corpus_bp
from config.settings import UPLOAD_ROOT

app = Flask(__name__, template_folder='web/secret/templates', static_folder='web/secret/static')

# cloudtype.io 프록시 환경에서 HTTPS 감지를 위한 ProxyFix 미들웨어
# X-Forwarded-Proto 헤더를 확인하여 실제 프로토콜 감지
app.wsgi_app = ProxyFix(
    app.wsgi_app,
    x_for=1,  # X-Forwarded-For 헤더 신뢰
    x_proto=1,  # X-Forwarded-Proto 헤더 신뢰 (HTTPS 감지)
    x_host=1,  # X-Forwarded-Host 헤더 신뢰
    x_port=1,  # X-Forwarded-Port 헤더 신뢰
)

# SECRET_KEY 설정 (환경 변수에서 읽거나 기본값 사용)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-change-in-production")

# 추가 Flask 설정
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv("MAX_FILE_MB", "10")) * 1024 * 1024  # 파일 업로드 크기 제한

# 세션 데이터를 모든 템플릿에 전역으로 전달하는 context processor
@app.context_processor
def inject_session_data():
    """모든 템플릿에서 사용할 수 있는 세션 데이터 전달"""
    member_data = None
    admin_data = None
    
    # 회원 세션 데이터
    if session.get('member_logged_in', False):
        member_data = {
            'sMem_id': session.get('sMem_id'),
            'sMem_name': session.get('sMem_name'),
            'sMem_nickname': session.get('sMem_nickname'),
            'sMem_status': session.get('sMem_status'),
            'adviser_role': session.get('adviser_role'),
        }
    
    # 관리자 세션 데이터
    if session.get('admin_logged_in', False):
        admin_data = {
            'admin_id': session.get('admin_id'),
            'username': session.get('username'),
            'role': session.get('admin_role'),
        }
    
    return {
        'member_session': member_data,
        'admin_session': admin_data,
    }

# 공통 static 파일 서빙 라우트 추가
@app.route('/common/static/<path:filename>')
def common_static(filename):
    """공통 static 파일 서빙 (member_session.js, admin_session.js, security.js, security.css 등)"""
    import os
    # app.py는 프로젝트 루트에 있으므로 직접 경로 사용
    common_static_path = os.path.join(os.path.dirname(__file__), 'web', 'common', 'static')
    return send_from_directory(common_static_path, filename)

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
app.register_blueprint(smembers_bp, url_prefix="/api/v1/smembers")
print("✅ smembers_bp 등록 완료")
app.register_blueprint(corpus_bp, url_prefix="/api/v1/corpus")
print("✅ corpus_bp 등록 완료")
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

@app.route("/test_messages_api")
def page_test_messages_api(): return render_template("test_messages_api.html")

# 추가 Pages - 회원가입, 로그인, 비밀번호 변경, 회원 탈퇴, 회원 정보 수정, 회원 정보 조회
#@app.route("/main_index")
#def page_main_index(): return render_template("main_index.html")

@app.route('/main_index.html')
def main_index(): return render_template('main_index.html')

@app.route("/0101_Center_intro.html")
def page_0101_Center_intro(): return render_template("0101_Center_intro.html")

@app.route("/0102_greet.html")
def page_0102_greet(): return render_template("0102_greet.html")

@app.route("/0103_couns_expert.html")
def page_0103_couns_expert(): return render_template("0103_couns_expert.html")

@app.route("/0104_map.html")
def page_0104_map(): return render_template("0104_map.html")

@app.route("/0201_process.html")
def page_0201_process(): return render_template("0201_process.html")

@app.route("/0301_main_psychol.html")
def page_0301_main_psychol(): return render_template("0301_main_psychol.html")

@app.route("/0302_main_life.html")
def page_0302_main_life(): return render_template("0302_main_life.html")

@app.route("/0303_name_rules.html")
def page_0303_name_rules(): return render_template("0303_name_rules.html")

@app.route("/0304_color_counguide.html")
def page_0304_color_counguide(): return render_template("0304_color_counguide.html")

@app.route("/0305_color_psychology120.html")
def page_0305_color_psychology120(): return render_template("0305_color_psychology120.html")

@app.route("/0306_color_psychology1202.html")
def page_0306_color_psychology1202(): return render_template("0306_color_psychology1202.html")

@app.route("/1102_6yao.html")
@app.route("/1102_6yao")
def page_1102_6yao(): 
    # 로그인 체크 없이 바로 페이지 반환 (코퍼스 데이터는 API에서 직접 가져옴)
    return render_template("1102_6yao.html")

@app.route("/corpus_debug")
@app.route("/corpus_debug.html")
def page_corpus_debug():
    """코퍼스 데이터 디버깅 페이지"""
    return render_template("corpus_debug.html")

@app.route("/1102_6yao_test.html")
def page_1102_6yao_test(): return render_template("1102_6yao_test.html")

@app.route("/1102_6yao_debug.html")
def page_1102_6yao_debug(): return render_template("1102_6yao_debug.html")

#def page_1102_6yao(): 
#    # 세션에서 사용자 정보 확인
#    user_role = session.get('role', 'USER')  # 기본값은 'USER'
#    is_admin = user_role == 'ADMIN'
#    return render_template("1102_6yao.html", user_role=user_role, is_admin=is_admin)




@app.route("/1101_tarot_cards.html")
def page_1101_tarot_cards(): return render_template("1101_tarot_cards.html")

@app.route("/1103_4Pillar.html")
def page_1103_4Pillar(): return render_template("1103_4Pillar.html")    

@app.route("/1104_tosecret.html")
def page_1104_tosecret(): return render_template("1104_tosecret.html")



@app.route("/6101_tarot_exec.html")
def page_6101_tarot_exec(): return render_template("6101_tarot_exec.html")

@app.route("/6102_6yao_exec.html")
def page_6102_6yao_exec(): return render_template("6102_6yao_exec.html")    

@app.route("/6103_4Pillar_exec.html")
def page_6103_4Pillar_exec(): return render_template("6103_4Pillar_exec.html")    

@app.route("/6104_tosecret_exec.html")
def page_6104_tosecret_exec(): return render_template("6104_tosecret_exec.html")




@app.route("/member_login.html")
def page_member_login(): return render_template("member_login.html")

@app.route("/member_cardup.html")
def page_member_cardup(): return render_template("member_cardup.html")

@app.route("/main_adminMenu.html")
def page_main_adminMenu():
    """관리자 시스템 관리 메뉴 - ADMIN role만 접근 가능"""
    # 1. 관리자 로그인 확인
    if not session.get('admin_logged_in', False):
        print("❌ main_adminMenu.html 접근 시도 - 관리자 로그인 없음")
        from flask import redirect
        return redirect('/admin_login')
    
    # 2. role이 정확히 "ADMIN"인지 철저하게 확인
    admin_role = session.get('admin_role', '')
    print(f"🔍 main_adminMenu.html 접근 시도 - admin_role: '{admin_role}', 타입: {type(admin_role)}")
    print(f"   admin_role == 'ADMIN': {admin_role == 'ADMIN'}")
    print(f"   admin_role != 'ADMIN': {admin_role != 'ADMIN'}")
    
    if admin_role != 'ADMIN':
        print(f"❌ main_adminMenu.html 접근 차단 - role이 ADMIN이 아님: '{admin_role}'")
        from flask import redirect
        return redirect('/admin_login')
    
    print("✅ main_adminMenu.html 접근 허용 - ADMIN 권한 확인됨")
    return render_template("main_adminMenu.html")

@app.route("/sit005.html")
def page_sit005(): return render_template("sit005.html")

@app.route("/a02_admin_memcard.html")
def page_a02_admin_memcard(): return render_template("a02_admin_memcard.html")


@app.route("/a03_admin_memlist.html")
def page_a03_admin_memlist(): return render_template("a03_admin_memlist.html")

@app.route("/a05_admin_membatch.html")
def page_a05_admin_membatch(): return render_template("a05_admin_membatch.html")

@app.route("/a06_adminCard.html")
def page_a06_adminCard(): return render_template("a06_adminCard.html")

# uploads 폴더 정적 파일 서빙
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    """uploads 폴더의 파일을 서빙합니다 (이미지, 첨부파일 등)"""
    uploads_dir = os.path.join(app.root_path, 'uploads')
    return send_from_directory(uploads_dir, filename)

#-----



if __name__ == "__main__":
    os.makedirs(UPLOAD_ROOT, exist_ok=True)
    
    # Render.com 환경에서는 PORT 환경변수 사용
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    debug = os.getenv("FLASK_ENV") != "production"
    
    print(f"🚀 Flask 서버 시작 (포트 {port})")
    if debug:
        print(f"🌐 브라우저에서 https://127.0.0.1:{port} 접속하세요")
    
    
    app.run(debug=debug, host=host, port=port)
    #app.run(debug=True, port=5009)
