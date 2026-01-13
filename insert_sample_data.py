"""
couns_expert 샘플 데이터 삽입 스크립트
"""
import psycopg2

# 데이터베이스 연결 정보
DB_CONFIG = {
    'host': 'svc.sel3.cloudtype.app',
    'port': 32624,
    'database': 'secretboard',
    'user': 'secretboard_user',
    'password': 'xToIsayLLO9nFmeiAPChiF96d3khj8Eq'
}

def insert_sample_data():
    """샘플 데이터 삽입"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # 샘플 데이터
        sample_data = [
            {
                'expertName': '김상담',
                'expertTitle': '심리상담전문가',
                'expertPhoto': 'slide1.jpg',
                'expertIntro': '불안·우울·스트레스 전문',
                'expertDetail': '임상심리전문가 자격증 보유. 10년 이상의 상담 경력으로 불안, 우울, 스트레스 관리를 전문으로 합니다. CBT 기법을 활용한 체계적인 상담을 제공합니다.',
                'expertTags': '심리상담,CBT,불안,우울,스트레스관리',
                'expertContact': 'counselor1@naratalk.com',
                'expertOrder': 1
            },
            {
                'expertName': '이역학',
                'expertTitle': '동양역학전문가',
                'expertPhoto': 'slide2.jpg',
                'expertIntro': '사주명리·주역 전문',
                'expertDetail': '30년 경력의 동양역학 전문가. 사주명리와 주역을 통한 인생 상담을 제공합니다. 전통 역학과 현대 심리학을 접목한 통합 상담이 특징입니다.',
                'expertTags': '사주명리,주역,육효,만세력',
                'expertContact': 'fortune@naratalk.com',
                'expertOrder': 2
            },
            {
                'expertName': '박타로',
                'expertTitle': '서양역학전문가',
                'expertPhoto': 'slide3.jpg',
                'expertIntro': '타로·천궁도 전문',
                'expertDetail': '15년 경력의 타로 전문가. 타로카드와 서양 점성술을 통해 내면의 목소리를 듣고 방향을 제시합니다.',
                'expertTags': '타로카드,서양점성,천궁도',
                'expertContact': 'tarot@naratalk.com',
                'expertOrder': 3
            },
            {
                'expertName': '최통합',
                'expertTitle': '통합상담전문가',
                'expertPhoto': 'slide4.jpg',
                'expertIntro': '심리·역학 통합 상담',
                'expertDetail': '심리상담과 동서양 역학을 통합한 전인적 상담을 제공합니다. 내담자의 심리적 문제와 운세를 함께 분석합니다.',
                'expertTags': '통합상담,심리상담,사주,타로',
                'expertContact': 'integrated@naratalk.com',
                'expertOrder': 4
            },
            {
                'expertName': '정센터장',
                'expertTitle': '수퍼바이저',
                'expertPhoto': 'slide5.jpg',
                'expertIntro': '나라톡톡 센터장',
                'expertDetail': '나라톡톡 심리상담센터 센터장. 20년 이상의 상담 및 교육 경력. 전문 상담사 교육 및 수퍼비전을 담당합니다.',
                'expertTags': '수퍼비전,상담교육,센터운영',
                'expertContact': 'director@naratalk.com',
                'expertOrder': 5
            }
        ]
        
        for data in sample_data:
            cur.execute("""
                INSERT INTO couns_expert 
                (expertName, expertTitle, expertPhoto, expertIntro, expertDetail, expertTags, expertContact, expertOrder)
                VALUES (%(expertName)s, %(expertTitle)s, %(expertPhoto)s, %(expertIntro)s, 
                        %(expertDetail)s, %(expertTags)s, %(expertContact)s, %(expertOrder)s)
            """, data)
        
        conn.commit()
        print(f"✅ 샘플 데이터 {len(sample_data)}건 삽입 완료")
        
        # 삽입된 데이터 확인
        cur.execute("SELECT id, expertName, expertTitle FROM couns_expert ORDER BY expertOrder")
        rows = cur.fetchall()
        print("\n📋 삽입된 데이터:")
        for row in rows:
            print(f"  - ID {row[0]}: {row[1]} ({row[2]})")
        
        cur.close()
        conn.close()
        
        return True
    except Exception as e:
        print(f"❌ 샘플 데이터 삽입 오류: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("📝 couns_expert 샘플 데이터 삽입")
    print("=" * 60)
    insert_sample_data()
    print("=" * 60)
