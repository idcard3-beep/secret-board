"""
통합 운세 서비스 메인 앱
6개의 독립 앱을 하나로 통합하여 포트 5000에서 실행
"""

from flask import Flask, render_template, redirect, url_for
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from werkzeug.serving import run_simple
import sys
import os

# 현재 디렉토리를 Python 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("\n" + "="*60)
print("🔮 심리상담 과 통합운세(나라톡톡) - 앱 로딩 시작")
print("="*60)

# 각 앱 임포트
app_list = []

# 1. 비밀게시판 (심리상담 센터)
try:
    from app import app as secret_app
    app_list.append(('secret', secret_app, '심리상담 센터 (비밀게시판)'))
    print("✅ 심리상담 센터 (비밀게시판) 로드 완료")
except Exception as e:
    secret_app = None
    print(f"⚠️  심리상담 센터 로드 실패: {e}")

# 2. 만세력
try:
    from mans_app import app as mans_app
    app_list.append(('mans', mans_app, '만세력'))
    print("✅ 만세력 앱 로드 완료")
except Exception as e:
    mans_app = None
    print(f"⚠️  만세력 앱 로드 실패: {e}")

# 3. 육효
try:
    from y6_app import app as y6_app
    app_list.append(('y6', y6_app, '육효'))
    print("✅ 육효 앱 로드 완료")
except Exception as e:
    y6_app = None
    print(f"⚠️  육효 앱 로드 실패: {e}")

# 4. 타로
try:
    from tarot_app import app as tarot_app
    app_list.append(('tarot', tarot_app, '타로카드'))
    print("✅ 타로카드 앱 로드 완료")
except Exception as e:
    tarot_app = None
    print(f"⚠️  타로카드 앱 로드 실패: {e}")

# 5. 토정비결
try:
    from toj_app import app as toj_app
    app_list.append(('toj', toj_app, '토정비결'))
    print("✅ 토정비결 앱 로드 완료")
except Exception as e:
    toj_app = None
    print(f"⚠️  토정비결 앱 로드 실패: {e}")

# 6. 사주
try:
    from saju_app import app as saju_app
    app_list.append(('saju', saju_app, '사주팔자'))
    print("✅ 사주팔자 앱 로드 완료")
except Exception as e:
    saju_app = None
    print(f"⚠️  사주팔자 앱 로드 실패: {e}")

print("="*60 + "\n")

# 메인 앱 생성 (메뉴 페이지용)
main_app = Flask(__name__, 
                 template_folder='web/templates',
                 static_folder='static')

main_app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-change-in-production')

@main_app.route('/main_index.html')
def main_index_redirect():
    """main_index.html을 /secret/main_index.html로 리다이렉트"""
    return redirect('/secret/main_index.html')

@main_app.route('/')
def index():
    """메인 메뉴 페이지"""
    services = [
        {
            'name': '심리상담 센터 홈', 
            'url': '/main_index.html', 
            'icon': '🏥',
            'desc': '현대 전문 심리상담 센터(나라톡톡).', 
            'available': secret_app is not None,
            'path': 'secret'
        },
        {
            'name': '비밀게시판', 
            'url': '/secret/', 
            'icon': '🔒', 
            'desc': '익명 게시판 서비스', 
            'available': secret_app is not None,
            'path': 'secret'
        },
        {
            'name': '만세력', 
            'url': '/mans/', 
            'icon': '📅', 
            'desc': '음양력 변환, 절기기 및 일진 확인', 
            'available': mans_app is not None,
            'path': 'mans'
        },
        {
            'name': '육효', 
            'url': '/y6/', 
            'icon': '☯', 
            'desc': '주역 점괘로 길흉 판단', 
            'available': y6_app is not None,
            'path': 'y6'
        },
        {
            'name': '타로카드', 
            'url': '/tarot/', 
            'icon': '🃏', 
            'desc': '타로 카드 운세', 
            'available': tarot_app is not None,
            'path': 'tarot'
        },
        {
            'name': '토정비결', 
            'url': '/toj/', 
            'icon': '📖', 
            'desc': '신년 운세 확인', 
            'available': toj_app is not None,
            'path': 'toj'
        },
        {
            'name': '사주팔자', 
            'url': '/saju/', 
            'icon': '🌟', 
            'desc': '생년월일시 운명 분석', 
            'available': saju_app is not None,
            'path': 'saju'
        },
    ]
    return render_template('main_menu.html', services=services)

@main_app.errorhandler(404)
def not_found(error):
    """404 에러 페이지"""
    return render_template('404.html'), 404

@main_app.errorhandler(500)
def internal_error(error):
    """500 에러 페이지"""
    return render_template('500.html'), 500

# 앱 통합 (DispatcherMiddleware 사용)
apps = {}
if secret_app:
    apps['/secret'] = secret_app
if mans_app:
    apps['/mans'] = mans_app
if y6_app:
    apps['/y6'] = y6_app
if tarot_app:
    apps['/tarot'] = tarot_app
if toj_app:
    apps['/toj'] = toj_app
if saju_app:
    apps['/saju'] = saju_app

# DispatcherMiddleware로 모든 앱 통합
application = DispatcherMiddleware(main_app, apps)

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🌟 심리상담 과 통합운세(나라톡톡)")
    print("="*60)
    print("📍 메인 메뉴: http://localhost:5000/")
    print("-" * 60)
    
    if secret_app:
        print("🏥 심리상담 센터: http://localhost:5000/")
    if secret_app:
        print("🏥 비밀게시판: http://localhost:5000/secret/")        
    if mans_app:
        print("📅 만세력: http://localhost:5000/mans/")
    if y6_app:
        print("☯️  육효: http://localhost:5000/y6/")
    if tarot_app:
        print("🃏 타로카드: http://localhost:5000/tarot/")
    if toj_app:
        print("📖 토정비결: http://localhost:5000/toj/")
    if saju_app:
        print("✨ 사주팔자: http://localhost:5000/saju/")
    
    print("="*60)
    print("© 2025 심리상담 과 통합운세(나라톡톡) url: naratt.kr")
    print("="*60 + "\n")
    
    # 서버 시작 설정
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    
    # 개발/프로덕션 모드 자동 감지
    debug_mode = os.environ.get('FLASK_ENV') != 'production'
    
    if debug_mode:
        print("🔧 개발 모드로 실행 중...")
        run_simple(host, port, application, 
                   use_reloader=True, 
                   use_debugger=True)
    else:
        print("🚀 프로덕션 모드로 실행 중...")
        run_simple(host, port, application, 
                   use_reloader=False, 
                   use_debugger=False)
