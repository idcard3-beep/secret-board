"""
통합 운세 서비스 메인 앱
6개의 독립 앱을 하나로 통합하여 포트 5000에서 실행
"""

from flask import Flask, render_template, redirect, url_for, jsonify, send_from_directory
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from werkzeug.middleware.proxy_fix import ProxyFix
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
    app_list.append(('saju', saju_app, '사주보기'))
    print("✅ 사주보기 앱 로드 완료")
except Exception as e:
    saju_app = None
    print(f"⚠️  사주보기 앱 로드 실패: {e}")

print("="*60 + "\n")

# 메인 앱 생성 (메뉴 페이지용)
main_app = Flask(__name__, 
                 template_folder='web/common/templates',
                 static_folder='static')

main_app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-change-in-production')

# cloudtype.io 프록시 환경에서 HTTPS 감지를 위한 ProxyFix 미들웨어
# X-Forwarded-Proto 헤더를 확인하여 실제 프로토콜 감지
main_app.wsgi_app = ProxyFix(
    main_app.wsgi_app,
    x_for=1,  # X-Forwarded-For 헤더 신뢰
    x_proto=1,  # X-Forwarded-Proto 헤더 신뢰 (HTTPS 감지)
    x_host=1,  # X-Forwarded-Host 헤더 신뢰
    x_port=1,  # X-Forwarded-Port 헤더 신뢰
)

@main_app.route('/favicon.ico')
def favicon():
    """favicon.ico 요청 처리 - 404 오류 방지"""
    # favicon 파일이 없어도 204 No Content로 응답하여 콘솔 오류 방지
    return '', 204

@main_app.route('/health')
def health_check():
    """헬스체크 엔드포인트 - cloudtype.io에서 사용"""
    return jsonify({
        'status': 'healthy',
        'service': 'secret-board',
        'version': '1.0.0'
    }), 200

@main_app.route('/main_index.html')
def main_index_redirect():
    """main_index.html을 /secret/main_index.html로 리다이렉트"""
    return redirect('/secret/main_index.html')

@main_app.route('/common/static/<path:filename>')
def common_static(filename):
    """공통 static 파일 서빙 (member_session.js, admin_session.js 등)"""
    import os
    common_static_path = os.path.join(os.path.dirname(__file__), 'web', 'common', 'static')
    return send_from_directory(common_static_path, filename)

########################################################
# SEO 설정
########################################################
@main_app.route('/robots.txt')
def robots_txt():
    """robots.txt 파일 서빙"""
    import os
    robots_path = os.path.join(os.path.dirname(__file__), 'robots.txt')
    if os.path.exists(robots_path):
        return send_from_directory(os.path.dirname(__file__), 'robots.txt')
    else:
        # 기본 robots.txt 내용 반환
        return """User-agent: *
Allow: /
Sitemap: https://naratt.kr/sitemap.xml
""", 200, {'Content-Type': 'text/plain'}

@main_app.route('/sitemap.xml')
def sitemap_xml():
    """sitemap.xml 파일 서빙"""
    import os
    sitemap_path = os.path.join(os.path.dirname(__file__), 'sitemap.xml')
    if os.path.exists(sitemap_path):
        return send_from_directory(os.path.dirname(__file__), 'sitemap.xml'), 200, {'Content-Type': 'application/xml'}
    else:
        # 기본 sitemap.xml 내용 반환
        from flask import request
        base_url = request.scheme + '://' + request.host
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{base_url}/</loc>
    <lastmod>2026-01-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>{base_url}/secret/main_index.html/</loc>
    <lastmod>2026-01-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>{base_url}/secret/</loc>
    <lastmod>2026-01-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>{base_url}/mans/</loc>
    <lastmod>2026-01-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>{base_url}/y6/</loc>
    <lastmod>2026-01-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>{base_url}/tarot/</loc>
    <lastmod>2026-01-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>{base_url}/toj/</loc>
    <lastmod>2026-01-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>{base_url}/saju/</loc>
    <lastmod>2026-01-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
""", 200, {'Content-Type': 'application/xml'}

########################################################
# 메인 메뉴 페이지
########################################################    
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
            'name': '사주보기', 
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
    # 서버 시작 설정
    port = int(os.environ.get('PORT', 5000))
    
    # 호스트 설정: 환경변수 > cloudtype.io 감지 > 기본값(로컬)
    # cloudtype.io 환경 감지 (환경변수나 호스트명으로 판단)
    is_cloudtype = (
        os.environ.get('CLOUDTYPE') == 'true' or
        'cloudtype' in os.environ.get('HOSTNAME', '').lower() or
        os.environ.get('PORT') and not os.environ.get('HOST')  # PORT는 있는데 HOST가 없으면 클라우드 가능성
    )
    
    # HOST 환경변수가 명시적으로 설정되어 있으면 그것을 사용
    if os.environ.get('HOST'):
        host = os.environ.get('HOST')
    elif is_cloudtype:
        # cloudtype.io나 클라우드 환경: 0.0.0.0 사용 (외부 접근 가능)
        host = '0.0.0.0'
    else:
        # 로컬 개발 환경: 127.0.0.1 사용 (로컬만 접근 가능, 더 안전)
        host = '127.0.0.1'
    
    # 개발/프로덕션 모드 자동 감지
    debug_mode = os.environ.get('FLASK_ENV') != 'production'
    
    # 프로토콜 결정: 모든 환경에서 HTTPS만 사용 (HTTP 사용 금지)
    protocol = 'https'
    
    # SSL 설정 (로컬 개발 환경) - HTTPS 필수
    ssl_context = None
    if not is_cloudtype:
        try:
            # pyOpenSSL 사용 (Flask의 adhoc SSL과 유사)
            from OpenSSL import SSL
            import tempfile
            from OpenSSL.crypto import TYPE_RSA, X509, X509Extension, PKey
            from OpenSSL.crypto import dump_privatekey, dump_certificate, FILETYPE_PEM
            
            # 임시 파일 경로
            cert_dir = os.path.join(os.path.dirname(__file__), 'certs')
            os.makedirs(cert_dir, exist_ok=True)
            cert_file = os.path.join(cert_dir, 'localhost.crt')
            key_file = os.path.join(cert_dir, 'localhost.key')
            
            # 인증서가 이미 있으면 재사용
            if os.path.exists(cert_file) and os.path.exists(key_file):
                ssl_context = (cert_file, key_file)
                print(f"✅ SSL 인증서 로드: {cert_file}")
                print(f"   인증서 파일 확인: {os.path.exists(cert_file)}")
                print(f"   키 파일 확인: {os.path.exists(key_file)}")
            else:
                # 새 인증서 생성
                print("🔐 SSL 인증서 생성 중...")
                key = PKey()
                key.generate_key(TYPE_RSA, 2048)
                
                cert = X509()
                cert.get_subject().CN = "localhost"
                cert.get_subject().O = "Development"
                cert.set_serial_number(1000)
                cert.gmtime_adj_notBefore(0)
                cert.gmtime_adj_notAfter(365*24*60*60)  # 1년
                cert.set_issuer(cert.get_subject())
                cert.set_pubkey(key)
                cert.sign(key, 'sha256')
                
                # 파일로 저장
                with open(cert_file, 'wb') as f:
                    f.write(dump_certificate(FILETYPE_PEM, cert))
                with open(key_file, 'wb') as f:
                    f.write(dump_privatekey(FILETYPE_PEM, key))
                
                ssl_context = (cert_file, key_file)
                print(f"✅ SSL 인증서 생성 완료")
                print(f"   인증서: {cert_file}")
                print(f"   개인키: {key_file}")
            
            # SSL 컨텍스트 확인
            if ssl_context and isinstance(ssl_context, tuple) and len(ssl_context) == 2:
                print(f"✅ SSL 컨텍스트 설정 완료: (인증서, 키) 튜플 형식")
            else:
                print(f"❌ SSL 컨텍스트 형식 오류: {type(ssl_context)}")
                
        except ImportError:
            print("\n" + "="*60)
            print("❌ 오류: pyOpenSSL이 설치되지 않았습니다.")
            print("="*60)
            print("⚠️  HTTPS는 필수입니다. HTTP는 사용할 수 없습니다.")
            print("\n📦 설치 방법:")
            print("   pip install pyOpenSSL")
            print("\n또는:")
            print("   pip install -r requirements.txt")
            print("="*60 + "\n")
            sys.exit(1)
        except Exception as e:
            print("\n" + "="*60)
            print(f"❌ SSL 인증서 생성 실패: {e}")
            print("="*60)
            print("⚠️  HTTPS는 필수입니다. 서버를 시작할 수 없습니다.")
            print("="*60 + "\n")
            import traceback
            traceback.print_exc()
            sys.exit(1)
    
    print("\n" + "="*60)
    print("🌟 심리상담 과 통합운세(나라톡톡)")
    print("="*60)
    if is_cloudtype:
        print(f"☁️  클라우드 환경으로 실행 중")
        print(f"📍 메인 메뉴: {protocol}://your-app.cloudtype.app/")
    else:
        print(f"🔒 로컬 개발 환경 (HTTPS 전용)")
        print(f"📍 메인 메뉴: {protocol}://localhost:{port}/ 또는 {protocol}://127.0.0.1:{port}/")
        print(f"⚠️  브라우저에서 '고급' > '안전하지 않음으로 이동' 클릭 필요 (self-signed 인증서)")
        print(f"🚫 HTTP는 사용할 수 없습니다. 반드시 HTTPS로 접속하세요!")
    print("-" * 60)
    
    # 서비스별 URL 표시 (항상 HTTPS)
    base_url = f"{protocol}://{host}:{port}" if not is_cloudtype else f"{protocol}://your-app.cloudtype.app"
    
    if secret_app:
        print(f"🏥 심리상담 센터: {base_url}/")
    if secret_app:
        print(f"🏥 비밀게시판: {base_url}/secret/")        
    if mans_app:
        print(f"📅 만세력: {base_url}/mans/")
    if y6_app:
        print(f"☯️  육효: {base_url}/y6/")
    if tarot_app:
        print(f"🃏 타로카드: {base_url}/tarot/")
    if toj_app:
        print(f"📖 토정비결: {base_url}/toj/")
    if saju_app:
        print(f"✨ 사주보기: {base_url}/saju/")
    
    print("="*60)
    print("🔒 HTTPS 전용 서버 (HTTP 사용 불가)")
    if is_cloudtype:
        print("✅ cloudtype.io에서 자동 HTTPS 처리")
    else:
        print("✅ 로컬 개발 환경: HTTPS (self-signed 인증서)")
        # SSL 컨텍스트 최종 검증
        if ssl_context and isinstance(ssl_context, tuple) and len(ssl_context) == 2:
            cert_file, key_file = ssl_context
            if os.path.exists(cert_file) and os.path.exists(key_file):
                print(f"✅ SSL 인증서 확인: {cert_file}")
            else:
                print(f"❌ SSL 인증서 파일 누락!")
                sys.exit(1)
        else:
            print(f"❌ SSL 컨텍스트 설정 실패!")
            sys.exit(1)
    print("="*60)
    print("© 2025 심리상담 과 통합운세(나라톡톡) url: naratt.kr")
    print("="*60 + "\n")
    
    try:
        if debug_mode:
            print(f"🔧 개발 모드로 실행 중... (포트: {port}, 호스트: {host}, 프로토콜: {protocol.upper()})")
            print(f"\n" + "="*60)
            print(f"🌐 브라우저 접속 안내:")
            print(f"   ✅ 올바른 접속: https://localhost:{port}/")
            print(f"   ✅ 또는: https://127.0.0.1:{port}/")
            print(f"   ❌ 잘못된 접속: http://localhost:{port}/ (사용 불가)")
            print(f"   ❌ 잘못된 접속: http://127.0.0.1:{port}/ (사용 불가)")
            print(f"="*60 + "\n")
            run_simple(host, port, application, 
                       use_reloader=True, 
                       use_debugger=True,
                       threaded=True,
                       ssl_context=ssl_context)  # SSL 컨텍스트 추가
        else:
            print(f"🚀 프로덕션 모드로 실행 중... (포트: {port}, 호스트: {host}, 프로토콜: {protocol.upper()})")
            print(f"\n" + "="*60)
            print(f"🌐 브라우저 접속 안내:")
            print(f"   ✅ 올바른 접속: https://localhost:{port}/")
            print(f"   ✅ 또는: https://127.0.0.1:{port}/")
            print(f"   ❌ 잘못된 접속: http://localhost:{port}/ (사용 불가)")
            print(f"   ❌ 잘못된 접속: http://127.0.0.1:{port}/ (사용 불가)")
            print(f"="*60 + "\n")
            run_simple(host, port, application, 
                       use_reloader=False, 
                       use_debugger=False,
                       threaded=True,
                       ssl_context=ssl_context)  # SSL 컨텍스트 추가
    except OSError as e:
        if "Address already in use" in str(e) or "포트가 이미 사용 중" in str(e):
            print(f"\n❌ 오류: 포트 {port}가 이미 사용 중입니다.")
            print(f"다음 중 하나를 시도하세요:")
            print(f"1. 다른 포트 사용: PORT=5001 python main_app.py")
            print(f"2. 사용 중인 프로세스 종료")
            sys.exit(1)
        else:
            print(f"\n❌ 서버 시작 오류: {e}")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⏹️  서버를 종료합니다...")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ 예상치 못한 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
