"""
주역 코퍼스 데이터 관리 API - 완전 수정 버전
- 코퍼스 백업 (localStorage → PostgreSQL)
- 코퍼스 복원 (PostgreSQL → 클라이언트)
"""

from flask import Blueprint, request, jsonify
import psycopg2
import psycopg2.extras
import json
from datetime import datetime
from config.settings import DATABASE_URL
import traceback

bp = Blueprint('corpus', __name__)

@bp.route('/backup', methods=['POST'])
def backup_corpus():
    """
    코퍼스 데이터 백업 (localStorage → PostgreSQL) - 완전 수정 버전
    """
    try:
        print("🚀 코퍼스 백업 시작")
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': '요청 데이터가 없습니다'}), 400

        corpus_data = data.get('corpus_data', {})
        if not corpus_data:
            return jsonify({'success': False, 'error': '코퍼스 데이터가 비어있습니다'}), 400

        print(f"📊 받은 데이터: {len(corpus_data)}개 괘")

        # PostgreSQL 직접 연결 (autocommit 사용)
        try:
            conn = psycopg2.connect(DATABASE_URL)
            conn.autocommit = True
            print("✅ PostgreSQL 연결 성공")
        except Exception as e:
            print(f"❌ DB 연결 실패: {e}")
            return jsonify({'success': False, 'error': f'DB 연결 실패: {str(e)}'}), 500

        with conn.cursor() as cursor:
            # 테이블 생성 (JSONB로 간단하게)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS corpus_data (
                    gua_no INTEGER PRIMARY KEY,
                    gua_data JSONB,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """)
            print("✅ 테이블 준비 완료")

            success_count = 0
            error_count = 0

            # 각 괘별 저장
            for gua_no_str, gua_content in corpus_data.items():
                try:
                    gua_no = int(gua_no_str)
                    if not (1 <= gua_no <= 64):
                        continue

                    # 10개 필수 항목 추출하여 저장 (yao_case 포함)
                    filtered_data = {
                        'gua_orig': gua_content.get('gua_orig', ''),
                        'gua_tran_ko': gua_content.get('gua_tran_ko', ''),
                        'yao_orig': gua_content.get('yao_orig', ['', '', '', '', '', '']),
                        'yao_tran_ko': gua_content.get('yao_tran_ko', ['', '', '', '', '', '']),
                        'yao_psychology': gua_content.get('yao_psychology', ['', '', '', '', '', '']),
                        'yao_consult_ko': gua_content.get('yao_consult_ko', ['', '', '', '', '', '']),
                        'yao_advice': gua_content.get('yao_advice', ['', '', '', '', '', '']),
                        'yao_coaching': gua_content.get('yao_coaching', ['', '', '', '', '', '']),
                        'yao_case': gua_content.get('yao_case', ['', '', '', '', '', '']),
                        'modern_example': gua_content.get('modern_example', '')
                    }

                    print(f"💾 괘 {gua_no} 저장 중... 항목수: {len(filtered_data)}")
                    print(f"   - gua_orig: {len(str(filtered_data['gua_orig']))} chars")
                    print(f"   - yao_orig: {len(filtered_data['yao_orig'])} items")
                    print(f"   - yao_psychology: {len(filtered_data['yao_psychology'])} items")
                    print(f"   - yao_case: {len(filtered_data['yao_case'])} items")

                    # JSONB로 직접 저장 (psycopg3 방식)
                    cursor.execute("""
                        INSERT INTO corpus_data (gua_no, gua_data, updated_at)
                        VALUES (%s, %s, NOW())
                        ON CONFLICT (gua_no) 
                        DO UPDATE SET gua_data = EXCLUDED.gua_data, updated_at = NOW()
                    """, (gua_no, json.dumps(filtered_data)))
                    
                    success_count += 1
                    print(f"✅ 괘 {gua_no} 저장 성공 (10개 항목 완료: yao_case 포함)")

                except Exception as e:
                    print(f"❌ 괘 {gua_no_str} 저장 실패: {e}")
                    error_count += 1

        conn.close()
        print(f"🎉 백업 완료: 성공 {success_count}개, 실패 {error_count}개")

        return jsonify({
            'success': True,
            'message': f'코퍼스 백업 완료 (성공: {success_count}, 실패: {error_count})',
            'stats': {
                'success_count': success_count,
                'error_count': error_count,
                'total_guas': len(corpus_data)
            }
        })

    except Exception as e:
        print(f"❌ 백업 오류: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'백업 실패: {str(e)}'}), 500

@bp.route('/restore', methods=['GET'])
def restore_corpus():
    """
    코퍼스 데이터 복원 (PostgreSQL → 클라이언트) - 로그인 체크 없이 무조건 반환
    1102_6yao.html에서 필요한 10개 필드를 객체 형태로 반환 (yao_case 포함)
    """
    try:
        print("🔄 코퍼스 데이터 복원 시작 (로그인 체크 없음)")
        conn = psycopg2.connect(DATABASE_URL)
        
        with conn.cursor() as cursor:
            cursor.execute("SELECT gua_no, gua_data FROM corpus_data ORDER BY gua_no LIMIT 1")
            rows = cursor.fetchall()
            
        conn.close()
        print(f"📊 DB에서 {len(rows)}개 데이터 조회됨")

        if not rows:
            print("❌ DB에 저장된 데이터가 없습니다")
            # 데이터가 없어도 10개 필드 기본값으로 반환 (yao_case 포함)
            default_corpus = {
                'gua_orig': '기본 괘사',
                'gua_tran_ko': '기본 괘사 번역',
                'yao_orig': ['초효 원문', '이효 원문', '삼효 원문', '사효 원문', '오효 원문', '상효 원문'],
                'yao_tran_ko': ['초효 번역', '이효 번역', '삼효 번역', '사효 번역', '오효 번역', '상효 번역'],
                'yao_psychology': ['초효 심리', '이효 심리', '삼효 심리', '사효 심리', '오효 심리', '상효 심리'],
                'yao_consult_ko': ['초효 상담', '이효 상담', '삼효 상담', '사효 상담', '오효 상담', '상효 상담'],
                'yao_advice': ['초효 조언', '이효 조언', '삼효 조언', '사효 조언', '오효 조언', '상효 조언'],
                'yao_coaching': ['초효 코칭', '이효 코칭', '삼효 코칭', '사효 코칭', '오효 코칭', '상효 코칭'],
                'yao_case': ['초효 사례', '이효 사례', '삼효 사례', '사효 사례', '오효 사례', '상효 사례'],
                'modern_example': '현대적 예시'
            }
            print("✅ 기본값으로 10개 필드 반환 (yao_case 포함)")
            return jsonify(default_corpus)

        # 첫 번째 괘 데이터 사용 (1102_6yao.html은 단일 괘 표시용)
        gua_no, gua_data = rows[0]
        print(f"📖 괘 {gua_no} 데이터 처리 중...")
        
        # JSON 파싱
        if isinstance(gua_data, str):
            item = json.loads(gua_data)
        else:
            item = gua_data
        
        # 10개 필수 항목 확인 및 기본값 설정 (yao_case 포함, 로그인 체크 없이 무조건 반환)
        corpus_result = {
            'gua_orig': item.get('gua_orig', '괘사 원문'),
            'gua_tran_ko': item.get('gua_tran_ko', '괘사 번역'),
            'yao_orig': item.get('yao_orig', ['초효', '이효', '삼효', '사효', '오효', '상효']),
            'yao_tran_ko': item.get('yao_tran_ko', ['초효 번역', '이효 번역', '삼효 번역', '사효 번역', '오효 번역', '상효 번역']),
            'yao_psychology': item.get('yao_psychology', ['초효 심리', '이효 심리', '삼효 심리', '사효 심리', '오효 심리', '상효 심리']),
            'yao_consult_ko': item.get('yao_consult_ko', ['초효 상담', '이효 상담', '삼효 상담', '사효 상담', '오효 상담', '상효 상담']),
            'yao_advice': item.get('yao_advice', ['초효 조언', '이효 조언', '삼효 조언', '사효 조언', '오효 조언', '상효 조언']),
            'yao_coaching': item.get('yao_coaching', ['초효 코칭', '이효 코칭', '삼효 코칭', '사효 코칭', '오효 코칭', '상효 코칭']),
            'yao_case': item.get('yao_case', ['초효 사례', '이효 사례', '삼효 사례', '사효 사례', '오효 사례', '상효 사례']),
            'modern_example': item.get('modern_example', '현대적 예시 내용')
        }
        
        print("✅ 10개 필드 구성 완료 (yao_case 포함):")
        for key, value in corpus_result.items():
            if isinstance(value, list):
                print(f"   - {key}: {len(value)}개 항목")
            else:
                print(f"   - {key}: {len(str(value))} chars")
        
        return jsonify(corpus_result)

    except Exception as e:
        print(f"❌ 복원 오류: {e}")
        traceback.print_exc()
        # 오류가 발생해도 기본값으로 10개 필드 반환 (yao_case 포함)
        error_corpus = {
            'gua_orig': 'DB 연결 오류',
            'gua_tran_ko': 'DB 연결 실패로 기본값 표시',
            'yao_orig': ['오류', '오류', '오류', '오류', '오류', '오류'],
            'yao_tran_ko': ['DB 오류', 'DB 오류', 'DB 오류', 'DB 오류', 'DB 오류', 'DB 오류'],
            'yao_psychology': ['연결 실패', '연결 실패', '연결 실패', '연결 실패', '연결 실패', '연결 실패'],
            'yao_consult_ko': ['오류 상담', '오류 상담', '오류 상담', '오류 상담', '오류 상담', '오류 상담'],
            'yao_advice': ['오류 조언', '오류 조언', '오류 조언', '오류 조언', '오류 조언', '오류 조언'],
            'yao_coaching': ['오류 코칭', '오류 코칭', '오류 코칭', '오류 코칭', '오류 코칭', '오류 코칭'],
            'yao_case': ['오류 사례', '오류 사례', '오류 사례', '오류 사례', '오류 사례', '오류 사례'],
            'modern_example': f'오류 발생: {str(e)}'
        }
        return jsonify(error_corpus)

@bp.route('/get-all', methods=['GET'])
def get_all_corpus():
    """
    64괘 전체 코퍼스 데이터 조회 (로그인 체크 없음)
    1102_6yao.html에서 DB 그리드처럼 전체 데이터를 가져오기 위한 엔드포인트
    반환 형식: {"1": {9개 항목}, "2": {9개 항목}, ..., "64": {9개 항목}}
    """
    try:
        print("📖 64괘 전체 코퍼스 데이터 조회 시작 (로그인 체크 없음)")
        conn = psycopg2.connect(DATABASE_URL)
        
        with conn.cursor() as cursor:
            # 64괘 전체 조회
            cursor.execute("SELECT gua_no, gua_data FROM corpus_data WHERE gua_no BETWEEN 1 AND 64 ORDER BY gua_no")
            rows = cursor.fetchall()
            
        conn.close()
        print(f"📊 DB에서 {len(rows)}개 괘 데이터 조회됨")

        # 결과 딕셔너리 생성
        result = {}
        
        for gua_no, gua_data in rows:
            # JSON 파싱
            if isinstance(gua_data, str):
                item = json.loads(gua_data)
            else:
                item = gua_data
            
            # 10개 필수 항목 추출 (yao_case 포함)
            result[str(gua_no)] = {
                'gua_orig': item.get('gua_orig', ''),
                'gua_tran_ko': item.get('gua_tran_ko', ''),
                'yao_orig': item.get('yao_orig', ['', '', '', '', '', '']),
                'yao_tran_ko': item.get('yao_tran_ko', ['', '', '', '', '', '']),
                'yao_psychology': item.get('yao_psychology', ['', '', '', '', '', '']),
                'yao_consult_ko': item.get('yao_consult_ko', ['', '', '', '', '', '']),
                'yao_advice': item.get('yao_advice', ['', '', '', '', '', '']),
                'yao_coaching': item.get('yao_coaching', ['', '', '', '', '', '']),
                'yao_case': item.get('yao_case', ['', '', '', '', '', '']),
                'modern_example': item.get('modern_example', '')
            }
            
            # 첫 번째 괘의 상세 로그 출력 (디버깅용)
            if gua_no == 1:
                print(f"📝 괘 1번 데이터 상세 분석:")
                print(f"   - DB에 저장된 키들: {list(item.keys())}")
                for key in ['gua_orig', 'gua_tran_ko', 'yao_orig', 'yao_tran_ko', 
                           'yao_psychology', 'yao_consult_ko', 'yao_advice', 'yao_coaching', 'yao_case', 'modern_example']:
                    value = item.get(key)
                    if isinstance(value, list):
                        print(f"   - {key}: {len(value)}개 항목 (타입: list)")
                    elif value:
                        print(f"   - {key}: {len(str(value))} chars (타입: {type(value).__name__})")
                    else:
                        print(f"   - {key}: 없음 또는 빈 값")
        
        # 누락된 괘에 대해 기본값 추가 (10개 항목)
        for i in range(1, 65):
            if str(i) not in result:
                result[str(i)] = {
                    'gua_orig': '',
                    'gua_tran_ko': '',
                    'yao_orig': ['', '', '', '', '', ''],
                    'yao_tran_ko': ['', '', '', '', '', ''],
                    'yao_psychology': ['', '', '', '', '', ''],
                    'yao_consult_ko': ['', '', '', '', '', ''],
                    'yao_advice': ['', '', '', '', '', ''],
                    'yao_coaching': ['', '', '', '', '', ''],
                    'yao_case': ['', '', '', '', '', ''],
                    'modern_example': ''
                }
        
        print(f"✅ 64괘 전체 데이터 반환 준비 완료 (조회: {len(rows)}개, 전체: 64개)")
        return jsonify(result)

    except Exception as e:
        print(f"❌ 전체 조회 오류: {e}")
        traceback.print_exc()
        
        # 오류 발생 시 빈 64괘 데이터 반환 (10개 항목)
        error_result = {}
        for i in range(1, 65):
            error_result[str(i)] = {
                'gua_orig': f'DB 오류 (괘 {i})',
                'gua_tran_ko': 'DB 연결 실패',
                'yao_orig': ['오류', '오류', '오류', '오류', '오류', '오류'],
                'yao_tran_ko': ['오류', '오류', '오류', '오류', '오류', '오류'],
                'yao_psychology': ['오류', '오류', '오류', '오류', '오류', '오류'],
                'yao_consult_ko': ['오류', '오류', '오류', '오류', '오류', '오류'],
                'yao_advice': ['오류', '오류', '오류', '오류', '오류', '오류'],
                'yao_coaching': ['오류', '오류', '오류', '오류', '오류', '오류'],
                'yao_case': ['오류', '오류', '오류', '오류', '오류', '오류'],
                'modern_example': f'오류: {str(e)}'
            }
        return jsonify(error_result), 500

@bp.route('/test-db', methods=['GET'])
def test_db():
    """DB 연결 테스트"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'corpus_data'")
            table_exists = cursor.fetchone()[0] > 0
            
        conn.close()
        
        return jsonify({
            'success': True,
            'table_exists': table_exists,
            'message': 'DB 연결 성공'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@bp.route('/check-data/<int:gua_no>', methods=['GET'])
def check_data(gua_no):
    """특정 괘의 저장된 데이터 확인"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        with conn.cursor() as cursor:
            cursor.execute("SELECT gua_data FROM corpus_data WHERE gua_no = %s", (gua_no,))
            row = cursor.fetchone()
            
        conn.close()
        
        if not row:
            return jsonify({'success': False, 'error': f'괘 {gua_no} 데이터가 없습니다'}), 404
            
        gua_data = json.loads(row[0]) if isinstance(row[0], str) else row[0]
        
        # 10개 필수 항목 체크 (yao_case 포함)
        required_fields = [
            'gua_orig', 'gua_tran_ko', 'yao_orig', 'yao_tran_ko',
            'yao_psychology', 'yao_consult_ko', 'yao_advice',
            'yao_coaching', 'yao_case', 'modern_example'
        ]
        
        field_status = {}
        for field in required_fields:
            value = gua_data.get(field)
            if isinstance(value, list):
                field_status[field] = {
                    'exists': True,
                    'type': 'list',
                    'length': len(value),
                    'has_data': any(item and str(item).strip() for item in value)
                }
            elif value:
                field_status[field] = {
                    'exists': True,
                    'type': type(value).__name__,
                    'length': len(str(value)),
                    'has_data': bool(str(value).strip())
                }
            else:
                field_status[field] = {
                    'exists': False,
                    'type': 'None',
                    'length': 0,
                    'has_data': False
                }
        
        return jsonify({
            'success': True,
            'gua_no': gua_no,
            'data': gua_data,
            'fields_count': len(gua_data),
            'field_status': field_status,
            'has_all_10_fields': all(field in gua_data for field in required_fields),
            'all_fields_have_data': all(field_status[f]['has_data'] for f in required_fields)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500