"""
API 직접 테스트 - couns-experts 엔드포인트
"""
import requests

# API 엔드포인트
BASE_URL = "http://localhost:5000"
ENDPOINT = "/secret/api/v1/admin/couns-experts"

def test_api():
    """API 직접 테스트"""
    try:
        url = BASE_URL + ENDPOINT
        print(f"🔍 API 호출: {url}")
        print("-" * 60)
        
        response = requests.get(url, timeout=10)
        
        print(f"📊 상태 코드: {response.status_code}")
        print(f"📋 응답 헤더: {dict(response.headers)}")
        print("-" * 60)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 성공! 전문가 수: {len(data)}명")
            print("\n전문가 목록:")
            for expert in data:
                print(f"  - {expert.get('expertname')} ({expert.get('experttitle')})")
        else:
            print(f"❌ 오류 발생")
            print(f"응답 내용: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ 요청 실패: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 couns-experts API 테스트")
    print("=" * 60)
    test_api()
    print("=" * 60)
