"""
Flask 기반 사주팔자 만세력 서버
Python mainpillar.py 함수를 REST API로 제공
"""

from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import json
from datetime import datetime
import os

# mainpillar.py 함수들 임포트
from mainpillar import (
    calc_saju, 
    convert_lunar_to_solar,
    convert_solar_to_lunar,
    calc_year_pillar,
    calc_month_pillar,
    calc_day_pillar,
    calc_hour_pillar,
    get_all_terms,
    load_solar_terms,
    TEN_GAN,
    TWELVE_ZHI
)

#app = Flask(__name__, static_folder='static')
#app = Flask(__name__, static_folder='.', template_folder='.')
app = Flask(__name__, template_folder='web/saju/templates', static_folder='web/saju/static')
CORS(app)  # CORS 허용

# 절기 데이터 전역 로드
SOLAR_TERMS_PATH = 'api/solar_terms.json'

@app.route('/')
def index():
    """메인 HTML 페이지 제공"""
    #return send_from_directory('static', 'saju-complete.html')
    return render_template('saju_exec.html')
    
    #return render_template('final-test.html')

@app.route('/api/solar-terms/<int:year>', methods=['GET'])
def get_solar_terms_by_year(year):
    """특정 연도의 절기 데이터 반환"""
    try:
        terms = load_solar_terms(year, SOLAR_TERMS_PATH)
        return jsonify({
            'success': True,
            'year': year,
            'terms': terms
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/calc-saju', methods=['POST'])
def calculate_saju():
    """
    사주 계산 API
    POST /api/calc-saju
    {
        "birth_datetime": "2025-12-04 12:30",
        "calendar_type": "solar" | "lunar" | "leap",
        "time_type": "normal" | "night_zi" | "morning_zi"  // 옵션
    }
    """
    try:
        data = request.get_json()
        birth_str = data.get('birth_datetime')
        calendar_type = data.get('calendar_type', 'solar')
        time_type = data.get('time_type', 'normal')  # 시간 타입 추가
        
        # 디버깅 로그
        print(f"\n=== API 요청 수신 ===")
        print(f"birth_datetime: {birth_str}")
        print(f"calendar_type: {calendar_type}")
        print(f"time_type: {time_type}")
        print(f"==================\n")
        
        if not birth_str:
            return jsonify({
                'success': False,
                'error': '생년월일 시각이 필요합니다.'
            }), 400
        
        # 양력 변환 정보 저장
        solar_converted = None
        
        # 음력/윤달 처리
        if calendar_type in ['lunar', 'leap']:
            birth_dt = datetime.strptime(birth_str, '%Y-%m-%d %H:%M')
            is_leap = (calendar_type == 'leap')
            
            result_conv = convert_lunar_to_solar(
                birth_dt.year, 
                birth_dt.month, 
                birth_dt.day, 
                is_leap
            )
            
            if result_conv.get('error'):
                return jsonify({
                    'success': False,
                    'error': f"음력 변환 오류: {result_conv['error']}"
                }), 400
            
            # 양력 변환 정보 저장
            solar_converted = f"{result_conv['year']}.{result_conv['month']}.{result_conv['day']}"
            
            birth_str = f"{result_conv['year']}-{str(result_conv['month']).zfill(2)}-{str(result_conv['day']).zfill(2)} {birth_dt.hour:02d}:{birth_dt.minute:02d}"
        
        # 사주 계산 (time_type 전달)
        result = calc_saju(birth_str, SOLAR_TERMS_PATH, time_type)
        
        # 음력 입력인 경우 양력 변환 정보 추가
        if solar_converted:
            result['solar_converted'] = solar_converted
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/lunar-to-solar', methods=['POST'])
def lunar_to_solar_api():
    """
    음력 -> 양력 변환 API
    POST /api/lunar-to-solar
    {
        "year": 2025,
        "month": 1,
        "day": 15,
        "is_leap": false
    }
    """
    try:
        data = request.get_json()
        year = data.get('year')
        month = data.get('month')
        day = data.get('day')
        is_leap = data.get('is_leap', False)
        
        result = convert_lunar_to_solar(year, month, day, is_leap)
        
        if result.get('error'):
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/solar-to-lunar', methods=['POST'])
def solar_to_lunar_api():
    """
    양력 -> 음력 변환 API (lunarcalendar 보정 버전)
    POST /api/solar-to-lunar
    {
        "year": 1949,
        "month": 4,
        "day": 12
    }
    """
    try:
        data = request.get_json()
        year = data.get('year')
        month = data.get('month')
        day = data.get('day')
        
        result = convert_solar_to_lunar(year, month, day)
        
        if result.get('error'):
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/calc-daeun', methods=['POST'])
def calculate_daeun():
    """
    대운 계산 API
    POST /api/calc-daeun
    {
        "birth_datetime": "2025-12-04 12:30",
        "gender": "male" | "female",
        "month_gan": "甲",
        "month_zhi": "子",
        "calendar_type": "solar" | "lunar" | "leap"  // 옵션
    }
    """
    try:
        data = request.get_json()
        birth_str = data.get('birth_datetime')
        gender = data.get('gender')
        month_gan = data.get('month_gan')
        month_zhi = data.get('month_zhi')
        calendar_type = data.get('calendar_type', 'solar')  # 기본값: 양력
        
        print(f"\n=== 대운 API 요청 수신 ===")
        print(f"birth_datetime: {birth_str}")
        print(f"gender: {gender}")
        print(f"month_gan: {month_gan}, month_zhi: {month_zhi}")
        print(f"calendar_type: {calendar_type}")
        print(f"========================\n")
        
        # 음력/윤달 처리 (사주 계산과 동일한 로직)
        if calendar_type in ['lunar', 'leap']:
            birth_dt = datetime.strptime(birth_str, '%Y-%m-%d %H:%M')
            is_leap = (calendar_type == 'leap')
            
            result_conv = convert_lunar_to_solar(
                birth_dt.year, 
                birth_dt.month, 
                birth_dt.day, 
                is_leap
            )
            
            if result_conv.get('error'):
                return jsonify({
                    'success': False,
                    'error': f"음력 변환 오류: {result_conv['error']}"
                }), 400
            
            # 양력으로 변환된 날짜로 업데이트
            birth_str = f"{result_conv['year']}-{str(result_conv['month']).zfill(2)}-{str(result_conv['day']).zfill(2)} {birth_dt.hour:02d}:{birth_dt.minute:02d}"
            print(f"음력->양력 변환: {birth_str}\n")
        
        birth_dt = datetime.strptime(birth_str, '%Y-%m-%d %H:%M')
        
        # 사주 년도 계산 (입춘 기준)
        all_terms = get_all_terms(birth_dt, SOLAR_TERMS_PATH)
        year_gan, year_zhi = calc_year_pillar(birth_dt, all_terms)
        
        # 년주에서 실제 사주 년도 추출 (입춘 기준)
        lichuns = [t for t in all_terms if t['term'] == '입춘']
        saju_year = birth_dt.year
        for t in lichuns:
            lichun_dt = datetime.strptime(t['datetime_KST'], '%Y-%m-%d %H:%M:%S')
            if lichun_dt <= birth_dt:
                saju_year = lichun_dt.year
        
        print(f"양력 생년: {birth_dt.year}, 사주 생년 (입춘 기준): {saju_year}")
        
        # 대운 계산 (사주 년도 사용)
        daeun_list = calc_daeun_python(
            saju_year,  # 입춘 기준 사주 년도
            birth_dt.month,
            birth_dt.day,
            birth_dt.hour,
            birth_dt.minute,
            gender,
            month_gan,
            month_zhi
        )
        
        return jsonify({
            'success': True,
            'data': daeun_list
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/calc-yeonun', methods=['POST'])
def calculate_yeonun():
    """
    연운 계산 API
    POST /api/calc-yeonun
    {
        "birth_year": 1990,
        "current_year": 2025,
        "range": 10
    }
    """
    try:
        data = request.get_json()
        birth_year = data.get('birth_year')
        current_year = data.get('current_year', datetime.now().year)
        range_years = data.get('range', 10)
        
        yeonun_list = calc_yeonun_python(birth_year, current_year, range_years)
        
        return jsonify({
            'success': True,
            'data': yeonun_list
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/calc-wolun', methods=['POST'])
def calculate_wolun():
    """
    월운 계산 API
    POST /api/calc-wolun
    {
        "target_year": 2025
    }
    """
    try:
        data = request.get_json()
        target_year = data.get('target_year')
        
        wolun_list = calc_wolun_python(target_year, SOLAR_TERMS_PATH)
        
        return jsonify({
            'success': True,
            'data': wolun_list
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ========================================
# Python 함수들
# ========================================

def calc_daeun_python(birth_year, birth_month, birth_day, birth_hour, birth_minute, gender, month_gan, month_zhi):
    """대운 계산 (10년 주기) - 정확한 시작 나이 계산"""
    from mainpillar import get_all_terms, find_last_term
    
    # 양남음녀: 남자(양력) 양년생, 여자 음년생 -> 순행
    # 음남양녀: 남자 음년생, 여자 양년생 -> 역행
    
    year_stem_idx = (birth_year - 1864) % 10
    is_yang_year = year_stem_idx % 2 == 0  # 양년생 (甲丙戊庚壬)
    
    if gender == 'male':
        is_forward = is_yang_year  # 양남: 순행
    else:
        is_forward = not is_yang_year  # 음녀: 순행
    
    month_gan_idx = TEN_GAN.index(month_gan)
    month_zhi_idx = TWELVE_ZHI.index(month_zhi)
    
    daeun_list = []
    
    # 대운 시작 나이 계산 (출생일로부터 다음/이전 절기까지의 일수)
    try:
        birth_dt = datetime(birth_year, birth_month, birth_day, birth_hour, birth_minute)
        json_path = 'api/solar_terms.json'
        all_terms = get_all_terms(birth_dt, json_path)
        
        # 24절기 중 절기(홀수 번째)만 사용 - 대운 계산용
        # 절기: 입춘(1), 경칩(3), 청명(5), 입하(7), 망종(9), 소서(11)
        #       입추(13), 백로(15), 한로(17), 입동(19), 대설(21), 소한(23)
        major_terms = [
            '입춘', '경칩', '청명', '입하', '망종', '소서',
            '입추', '백로', '한로', '입동', '대설', '소한'
        ]
        
        # 디버깅: 출생일 전후 절기 확인
        print(f"\n=== 대운 계산 시작 ===")
        print(f"출생: {birth_year}년 {birth_month}월 {birth_day}일 {birth_hour:02d}:{birth_minute:02d}")
        print(f"생년 천간 인덱스: {year_stem_idx}, 양년생: {is_yang_year}")
        print(f"성별: {gender}, 순행: {is_forward}")
        print(f"\n출생일 전후 절기:")
        for t in all_terms:
            term_dt = datetime.strptime(t['datetime_KST'], '%Y-%m-%d %H:%M:%S')
            if abs((term_dt - birth_dt).days) <= 30 and t['term'] in major_terms:
                diff = (term_dt - birth_dt).days
                print(f"  {t['term']}: {t['datetime_KST']} ({diff:+d}일)")
        
        # 출생일 이후의 첫 번째 절기 찾기 (순행)
        # 또는 출생일 이전의 마지막 절기 찾기 (역행)
        target_term = None
        
        if is_forward:
            # 순행: 출생일 이후 첫 절기
            for t in all_terms:
                if t['term'] in major_terms:
                    term_dt = datetime.strptime(t['datetime_KST'], '%Y-%m-%d %H:%M:%S')
                    if term_dt > birth_dt:
                        target_term = t
                        break
        else:
            # 역행: 출생일 이전 마지막 절기
            for t in reversed(all_terms):
                if t['term'] in major_terms:
                    term_dt = datetime.strptime(t['datetime_KST'], '%Y-%m-%d %H:%M:%S')
                    if term_dt < birth_dt:
                        target_term = t
                        break
        
        if target_term:
            term_dt = datetime.strptime(target_term['datetime_KST'], '%Y-%m-%d %H:%M:%S')
            
            # 정확한 시간 차이 계산 (abs 사용하여 항상 양수로)
            time_diff = abs((term_dt - birth_dt).total_seconds())
            day_diff = time_diff / 86400  # 초를 일수로 변환
            
            # 3일 = 1년 환산 (반올림 처리)
            start_age = round(day_diff / 3)
            
            # 디버깅 로그
            print(f"\n=== 대운 시작 나이 최종 계산 ===")
            print(f"기준 절기: {target_term['term']} ({target_term['datetime_KST']})")
            print(f"출생 시각: {birth_dt.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"시간 차이: {time_diff:.0f}초 = {day_diff:.4f}일")
            print(f"계산: {day_diff:.4f}일 ÷ 3 = {day_diff/3:.4f}")
            print(f"반올림 처리: round({day_diff/3:.4f}) = {start_age}세")
            
            # 대운 시작이 0세가 될 수 있음 (절기 바로 근처 출생)
            if start_age < 1:
                print(f"최소값 적용: {start_age}세 → 1세")
                start_age = 1
            
            print(f"최종 대운 시작 나이: {start_age}세")
            print(f"===================================\n")
        else:
            print(f"경고: 대운 계산을 위한 절기를 찾지 못했습니다.")
            start_age = 3  # 기본값
    except Exception as e:
        print(f"대운 시작 나이 계산 오류: {e}")
        import traceback
        traceback.print_exc()
        start_age = 3  # 오류 시 기본값
    
    # 151세까지 대운 생성 (16개 대운) - 0~9, 10~19, ... 150~159
    for i in range(16):
        if is_forward:
            # 순행: 월주의 다음 간지부터
            gan_idx = (month_gan_idx + i + 1) % 10
            zhi_idx = (month_zhi_idx + i + 1) % 12
        else:
            # 역행: 월주의 이전 간지부터
            gan_idx = (month_gan_idx - i - 1) % 10
            zhi_idx = (month_zhi_idx - i - 1) % 12
        
        age = start_age + (i * 10)
        end_age = age + 9
        
        daeun_list.append({
            'age': age,
            'endAge': end_age,
            'gan': TEN_GAN[gan_idx],
            'jiji': TWELVE_ZHI[zhi_idx]
        })
    
    return daeun_list

def calc_yeonun_python(birth_year, current_year, range_years):
    """연운 계산 (60갑자 순환)"""
    start_year = current_year - range_years
    end_year = current_year + range_years
    yeonun_list = []
    
    for year in range(start_year, end_year + 1):
        idx = (year - 1864) % 60
        gan = TEN_GAN[idx % 10]
        zhi = TWELVE_ZHI[idx % 12]
        age = year - birth_year + 1
        
        yeonun_list.append({
            'year': year,
            'age': age,
            'gan': gan,
            'ji': zhi
        })
    
    return yeonun_list

def calc_wolun_python(target_year, json_path):
    """월운 계산 (전년/당년/익년 36개월) - mainpillar.py 사용"""
    from mainpillar import calc_month_pillar, get_all_terms
    
    wolun_list = []
    
    for year_offset in [-1, 0, 1]:
        year = target_year + year_offset
        
        for month in range(1, 13):
            # 각 월의 1일 정오를 기준으로 월주 계산
            birth_dt = datetime(year, month, 15, 12, 0)  # 월 중간 날짜 사용
            
            try:
                # 절기 데이터 가져오기
                all_terms = get_all_terms(birth_dt, json_path)
                
                # 정확한 월주 계산
                month_ganzhi = calc_month_pillar(birth_dt, all_terms)
                
                if month_ganzhi and len(month_ganzhi) >= 2:
                    gan = month_ganzhi[0]
                    zhi = month_ganzhi[1]
                else:
                    # 실패 시 기본값
                    gan = '?'
                    zhi = '?'
            except Exception as e:
                print(f"월운 계산 오류 ({year}년 {month}월): {e}")
                gan = '?'
                zhi = '?'
            
            wolun_list.append({
                'year': year,
                'month': month,
                'gan': gan,
                'zhi': zhi
            })
    
    return wolun_list

# ========================================
# 서버 실행
# ========================================

if __name__ == '__main__':
    #print("=" * 50)
    #print("🌟 사주팔자 만세력 서버 시작")
    #print("=" * 50)
    #print("📍 주소: https://localhost:5000")
    #print("📍 API 엔드포인트:")
    #print("   • POST /api/calc-saju - 사주 계산")
    #print("   • POST /api/lunar-to-solar - 음력→양력 변환")
    #print("   • POST /api/calc-daeun - 대운 계산")
    #print("   • POST /api/calc-yeonun - 연운 계산")
    #print("   • POST /api/calc-wolun - 월운 계산")
    #print("   • GET  /api/solar-terms/<year> - 절기 데이터")
    #print("=" * 50)
    
    #app.run(host='0.0.0.0', port=5000, debug=True)
    #app.run(host='0.0.0.0', port=5000, debug=True)
    app.run(host='127.0.0.1', port=5000, debug=True)
