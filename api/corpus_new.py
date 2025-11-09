"""
주역 코퍼스 데이터 관리 API - 완전 수정 버전
- 코퍼스 백업 (localStorage → PostgreSQL)
- 코퍼스 복원 (PostgreSQL → 클라이언트)
"""

from flask import Blueprint, request, jsonify
import psycopg
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
            conn = psycopg.connect(DATABASE_URL, autocommit=True)
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

                    # JSONB로 직접 저장 (psycopg3 방식)
                    cursor.execute("""
                        INSERT INTO corpus_data (gua_no, gua_data, updated_at)
                        VALUES (%s, %s, NOW())
                        ON CONFLICT (gua_no) 
                        DO UPDATE SET gua_data = EXCLUDED.gua_data, updated_at = NOW()
                    """, (gua_no, json.dumps(gua_content)))
                    
                    success_count += 1
                    print(f"✅ 괘 {gua_no} 저장 성공")

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
    코퍼스 데이터 복원 (PostgreSQL → 클라이언트)
    """
    try:
        conn = psycopg.connect(DATABASE_URL)
        
        with conn.cursor() as cursor:
            cursor.execute("SELECT gua_no, gua_data FROM corpus_data ORDER BY gua_no")
            rows = cursor.fetchall()
            
        conn.close()

        if not rows:
            return jsonify({'success': False, 'error': '저장된 데이터가 없습니다'}), 404

        # 데이터 변환
        corpus_list = []
        for gua_no, gua_data in rows:
            item = json.loads(gua_data) if isinstance(gua_data, str) else gua_data
            item['gua_no'] = gua_no
            corpus_list.append(item)

        return jsonify({
            'success': True,
            'data': corpus_list,
            'message': f'{len(corpus_list)}개 괘 복원 완료'
        })

    except Exception as e:
        print(f"❌ 복원 오류: {e}")
        return jsonify({'success': False, 'error': f'복원 실패: {str(e)}'}), 500

@bp.route('/test-db', methods=['GET'])
def test_db():
    """DB 연결 테스트"""
    try:
        conn = psycopg.connect(DATABASE_URL)
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