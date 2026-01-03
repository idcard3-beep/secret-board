import json
import os
from flask import Flask, render_template, request, jsonify, session
from lunarcalendar import Converter, Solar, Lunar
import datetime
import calendar
from typing import Tuple, Dict, Any






#app = Flask(__name__, template_folder='templates')
app = Flask(__name__, template_folder='web/mans/templates', static_folder='web/mans/static')

# 공통 static 파일 서빙 라우트 추가
@app.route('/common/static/<path:filename>')
def common_static(filename):
    """공통 static 파일 서빙 (member_session.js, admin_session.js, security.js, security.css 등)"""
    from flask import send_from_directory
    import os
    # mans_app.py는 프로젝트 루트에 있으므로 직접 경로 사용
    common_static_path = os.path.join(os.path.dirname(__file__), 'web', 'common', 'static')
    return send_from_directory(common_static_path, filename)

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

# ...existing code...

@app.route('/saju')
def saju():
    year = int(request.args.get('year', datetime.datetime.now().year))
    month = int(request.args.get('month', datetime.datetime.now().month))
    day = int(request.args.get('day', datetime.datetime.now().day))
    return render_template('saju.html', year=year, month=month, day=day)

@app.route('/mainpillar')
def mainpillar():
    return render_template('mainpillar.html')

# ...existing code...

@app.route('/get_saju')
def get_saju():
    year = request.args.get('year')
    month = request.args.get('month')
    day = request.args.get('day')
    hour = request.args.get('hour', '0')
    minute = request.args.get('minute', '0')
    birth_str = f"{year}-{str(month).zfill(2)}-{str(day).zfill(2)} {str(hour).zfill(2)}:{str(minute).zfill(2)}"
    try:
        from mainpillar import calc_saju
        result = calc_saju(birth_str, json_path='api/solar_terms.json')
    except Exception as e:
        result = {'year': '', 'month': '', 'day': '', 'hour': '', 'info': {'yearP': '', 'birth': birth_str}}
    return jsonify(result)

@app.route('/get_solar_terms')
def get_solar_terms():
    year = request.args.get('year')
    try:
        # solar_terms.json은 서버 코드와 같은 위치(프로젝트 루트)에 두는 것이 일반적
        json_path = os.path.join(os.path.dirname(__file__), 'api/solar_terms.json')
        with open(json_path, encoding='utf-8') as f:
            data = json.load(f)
        if year and year in data:
            return jsonify({year: data[year]})
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# solar_terms.json 로드 (앱 시작 시 1회)
SOLAR_TERMS_JSON_PATH = os.path.join(os.path.dirname(__file__), 'api/solar_terms.json')
with open(SOLAR_TERMS_JSON_PATH, encoding='utf-8') as f:
    SOLAR_TERMS_DATA = json.load(f)

# --- 핵심 상수 정의 ---
HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
# 오서둔일가(五鼠遁日歌): 일주 천간 인덱스 -> 子시 천간 인덱스
# 甲/己(0, 5) -> 甲(0), 乙/庚(1, 6) -> 丙(2), 丙/辛(2, 7) -> 戊(4), 丁/壬(3, 8) -> 庚(6), 戊/癸(4, 9) -> 壬(8)
ZI_HOUR_STEM_MAP = {0: 0, 5: 0, 1: 2, 6: 2, 2: 4, 7: 4, 3: 6, 8: 6, 4: 8, 9: 8}

# 년주 계산 기준: 1864년은 甲子年 (Index 0)
BASE_YEAR_GANZHI = 1864 
# 일주 계산 기준: 1900년 1월 1일이 辛卯日이 나오도록, BASE_DATE_GANZHI(1900-01-01)의 인덱스를 8 (壬申)로 최종 조정
BASE_DATE_GANZHI = datetime.date(1900, 1, 1)
BASE_INDEX_DAY = 10 
# 월주 계산 기준: 년간 인덱스 -> 寅月 천간 인덱스 (오호통변법)
IN_MONTH_STEM_INDEX = {0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0} 

# 24절기 이름 (순서대로)
SOLAR_TERMS = [
    "소한", "대한", "입춘", "우수", "경칩", "춘분", "청명", "곡우",
    "입하", "소만", "망종", "하지", "소서", "대서", "입추", "처서",
    "백로", "추분", "한로", "상강", "입동", "소설", "대설", "동지"
]

# 24절기 날짜 근사치 (달력 표시용)
SOLAR_TERM_DATES_APPROX = [
    (1, 6), (1, 20), (2, 4), (2, 19), (3, 6), (3, 21), (4, 5), (4, 20),
    (5, 6), (5, 21), (6, 6), (6, 21), (7, 7), (7, 23), (8, 8), (8, 23),
    (9, 8), (9, 23), (10, 8), (10, 23), (11, 7), (11, 22), (12, 7), (12, 22)
]

def get_solar_terms_for_year(year: int) -> Dict[datetime.date, str]:
    """해당 연도의 24절기 날짜 dict 반환 (solar_terms.json 기준)."""
    terms = {}
    year_str = str(year)
    if year_str in SOLAR_TERMS_DATA:
        for entry in SOLAR_TERMS_DATA[year_str]:
            # datetime_KST: 'YYYY-MM-DD HH:MM:SS'
            dt = entry['datetime_KST']
            try:
                dt_obj = datetime.datetime.strptime(dt, '%Y-%m-%d %H:%M:%S').date()
                terms[dt_obj] = entry['term']
            except:
                continue
    return terms

def get_day_gānzhī(year: int, month: int, day: int) -> str:
    """일주(日柱) 간지(干支)를 60갑자 순환으로 계산합니다. (최종 기준 인덱스 수정)"""
    try:
        target_date = datetime.date(year, month, day)
    except ValueError:
        return "N/A"
        
    delta_days = (target_date - BASE_DATE_GANZHI).days
    
    # BASE_INDEX_DAY (8) 사용
    idx = (BASE_INDEX_DAY + delta_days) % 60
    stem = HEAVENLY_STEMS[idx % 10]
    branch = EARTHLY_BRANCHES[idx % 12]
    return f"{stem}{branch}"

def get_hour_gānzhī(year: int, month: int, day: int, hour: int = 0, minute: int = 0) -> str:
    """시주(時柱) 간지 계산: 천간은 일일천간 기준, 지지는 시간/분 기준(자시=23:30~01:30)."""
    day_gz = get_day_gānzhī(year, month, day)
    if day_gz == "N/A":
        return "N/A"
    day_stem = day_gz[0]
    try:
        day_stem_idx = HEAVENLY_STEMS.index(day_stem)
    except ValueError:
        return "N/A"
    
    

    
    # 시주 지지 결정 (자시=23:30~01:30만 子, 나머지는 2시간 단위)
    if (hour == 23 and minute >= 30) or (hour == 0) or (hour == 1 and minute < 30):
        hour_branch_idx = 0  # 자시(子)
    elif (hour == 1 and minute >= 30) or (hour == 2) or (hour == 3 and minute < 30):
        hour_branch_idx = 1  # 축시(丑)
    elif (hour == 3 and minute >= 30) or (hour == 4) or (hour == 5 and minute < 30):
        hour_branch_idx = 2  # 인시(寅)
    elif (hour == 5 and minute >= 30) or (hour == 6) or (hour == 7 and minute < 30):
        hour_branch_idx = 3  # 묘시(卯)
    elif (hour == 7 and minute >= 30) or (hour == 8) or (hour == 9 and minute < 30):
        hour_branch_idx = 4  # 진시(辰)
    elif (hour == 9 and minute >= 30) or (hour == 10) or (hour == 11 and minute < 30):
        hour_branch_idx = 5  # 사시(巳)
    elif (hour == 11 and minute >= 30) or (hour == 12) or (hour == 13 and minute < 30):
        hour_branch_idx = 6  # 오시(午)
    elif (hour == 13 and minute >= 30) or (hour == 14) or (hour == 15 and minute < 30):
        hour_branch_idx = 7  # 미시(未)
    elif (hour == 15 and minute >= 30) or (hour == 16) or (hour == 17 and minute < 30):
        hour_branch_idx = 8  # 신시(申)
    elif (hour == 17 and minute >= 30) or (hour == 18) or (hour == 19 and minute < 30):
        hour_branch_idx = 9  # 유시(酉)
    elif (hour == 19 and minute >= 30) or (hour == 20) or (hour == 21 and minute < 30):
        hour_branch_idx = 10 # 술시(戌)
    elif (hour == 21 and minute >= 30) or (hour == 22) or (hour == 23 and minute < 30):
        hour_branch_idx = 11 # 해시(亥)
    else:
        hour_branch_idx = (hour // 2) % 12  # 예외 방지
    branch = EARTHLY_BRANCHES[hour_branch_idx]
    # 시주 천간 결정 (오서둔일가: 일일천간 기준)
    first_hour_stem_idx = ZI_HOUR_STEM_MAP.get(day_stem_idx, 0)
    stem_idx = (first_hour_stem_idx + hour_branch_idx) % 10
    stem = HEAVENLY_STEMS[stem_idx]
    return f"{stem}{branch}"

def get_year_gānzhī(year: int, month: int, day: int) -> str:
    """만세력 기준의 년주(年柱) 간지를 계산합니다 (입춘 기준)."""
    try:
        # 1. 라이브러리 사용 (정확한 입춘 기준)
        gz_indices: Tuple[int, int] = Converter.get_year_gānzhī(year, month, day)
        return HEAVENLY_STEMS[gz_indices[0]] + EARTHLY_BRANCHES[gz_indices[1]]
    except:
        # 2. 라이브러리 실패 시 폴백 (입춘 기준 적용)
        # 입춘 기준: 입춘일(2월 4일)까지는 전년도, 입춘일 다음날(2월 5일)부터 해당 연도
        if (month, day) <= (2, 4):
            idx = (year - 1 - BASE_YEAR_GANZHI) % 60
        else:
            idx = (year - BASE_YEAR_GANZHI) % 60
        return HEAVENLY_STEMS[idx % 10] + EARTHLY_BRANCHES[idx % 12]

def get_month_gānzhī(year: int, month: int, day: int) -> str:
    """만세력 기준의 월주(月柱) 간지를 계산합니다 (절기 기준)."""
    try:
        # 1. 라이브러리 사용 (정확한 절기 기준)
        gz_indices: Tuple[int, int] = Converter.get_month_gānzhī(year, month, day)
        return HEAVENLY_STEMS[gz_indices[0]] + EARTHLY_BRANCHES[gz_indices[1]]
    except:
        # 2. 라이브러리 실패 시 폴백 (오호통변법 사용 - 대략적인 계산)
        year_gz = get_year_gānzhī(year, month, day)
        if year_gz == "N/A": return "N/A"
        year_stem_idx = HEAVENLY_STEMS.index(year_gz[0])
        
        # 월지 인덱스 (1월:丑, 2월:寅, ..., 12월:子)
        month_branch_index_map = {1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10, 11:11, 12:0}
        month_branch_idx = month_branch_index_map.get(month, 0)
        
        # 오호통변법 적용: 寅月 천간 인덱스
        in_month_stem_idx = IN_MONTH_STEM_INDEX.get(year_stem_idx, 4) 
        
        # 寅(2)에서 현재 월지(month_branch_idx)까지의 지지 인덱스 차이
        diff = (month_branch_idx - 2 + 12) % 12
        stem_idx = (in_month_stem_idx + diff) % 10
        
        return HEAVENLY_STEMS[stem_idx] + EARTHLY_BRANCHES[month_branch_idx]


# --- Flask 라우트 설정 ---

@app.route('/', methods=['GET', 'POST'])
def manse_calendar():
    # 오늘 날짜를 시스템 현재 시간 기준으로 설정
    now = datetime.datetime.now()
    today = now.date()
    year = today.year
    month = today.month

    if request.method == 'POST':
        # 폼에서 연월을 받아옵니다.
        year = int(request.form.get('year', today.year))
        month = int(request.form.get('month', today.month))
        nav = request.form.get('nav', None)
        if nav == 'prev':
            if month == 1:
                month = 12
                year -= 1
            else:
                month -= 1
        elif nav == 'next':
            if month == 12:
                month = 1
                year += 1
            else:
                month += 1
        elif nav == 'today':
            year = today.year
            month = today.month
    
    # 캘린더 데이터 생성
    calendar.setfirstweekday(calendar.SUNDAY)
    cal_data = calendar.monthcalendar(year, month)
    # 헤더 표시용 년주 계산 (매년 2월 15일 기준, 팝업 로직과 동일한 함수 사용)
    # 헤더 표시용 월주 계산 (매월 15일 기준, 팝업 로직과 동일한 함수 사용)
    try:
        representative_date = datetime.date(year, month, 15)
        month_gānzhī_display = get_month_gānzhī(representative_date.year, representative_date.month, representative_date.day)
    except:
        month_gānzhī_display = "N/A"
    
    # 절기 목록 가져오기 (달력 표시용)
    term_dates = get_solar_terms_for_year(year)
    # 1월인 경우 전년도 절기(소한, 대한)도 포함
    if month == 1:
        prev_year_terms = get_solar_terms_for_year(year - 1)
        term_dates.update(prev_year_terms)

    # 24절기 json에서 이번달 절입/중기/다음달 절입 추출 (성능 최적화: 미리 파싱)
    year_str = str(year)
    jeolgi_entries = SOLAR_TERMS_DATA.get(year_str, [])
    # 1월인 경우 전년도 절기 엔트리도 포함
    if month == 1:
        prev_year_str = str(year - 1)
        prev_year_entries = SOLAR_TERMS_DATA.get(prev_year_str, [])
        jeolgi_entries = prev_year_entries + jeolgi_entries
    # 다음달이 다음 연도인 경우 (12월 -> 1월) 다음 연도 절기도 포함
    next_month = (month % 12) + 1
    if next_month == 1:  # 다음달이 1월이면 다음 연도
        next_year_str = str(year + 1)
        next_year_entries = SOLAR_TERMS_DATA.get(next_year_str, [])
        if next_year_entries:
            # 중복 제거를 위해 이미 포함되어 있는지 확인 (datetime_KST의 연도로 확인)
            has_next_year = any(e['datetime_KST'].startswith(next_year_str) for e in jeolgi_entries)
            if not has_next_year:
                jeolgi_entries = jeolgi_entries + next_year_entries
    
    # 성능 최적화: 절기 데이터를 미리 파싱하여 datetime 객체로 변환 (strptime 반복 호출 방지)
    parsed_jeolgi_entries = []
    for e in jeolgi_entries:
        try:
            dt = datetime.datetime.strptime(e['datetime_KST'], '%Y-%m-%d %H:%M:%S')
            parsed_jeolgi_entries.append((e, dt))
        except:
            continue
    
    # 이번달 절입/중기 (절입=홀수절기, 중기=짝수절기)
    # term_index_in_cycle: 1,3,5... = 절입(節入), 2,4,6... = 중기(中氣)
    this_month_terms = [e for e, dt in parsed_jeolgi_entries if dt.month == month and dt.year == year]
    next_month = (month % 12) + 1
    next_month_year = year if next_month > month else year + 1  # 다음달이 1월이면 연도 +1
    next_month_terms = [e for e, dt in parsed_jeolgi_entries if dt.month == next_month and dt.year == next_month_year]
    
    # 이번달 절입 (홀수 인덱스)
    jeolip = next((e for e in this_month_terms if e.get('term_index_in_cycle', 0) % 2 == 1), None)
    # 이번달 중기 (짝수 인덱스)
    junggi = next((e for e in this_month_terms if e.get('term_index_in_cycle', 0) % 2 == 0), None)
    # 다음달 절입 (홀수 인덱스)
    next_jeolip = next((e for e in next_month_terms if e.get('term_index_in_cycle', 0) % 2 == 1), None)
    # JST 변환 (성능 최적화: datetime 객체를 받도록 수정)
    def kst_to_jst(dt_obj):
        try:
            if isinstance(dt_obj, str):
                dt_obj = datetime.datetime.strptime(dt_obj, '%Y-%m-%d %H:%M:%S')
            dt_jst = dt_obj - datetime.timedelta(minutes=30)
            return dt_jst.strftime('%Y-%m-%d %H:%M')
        except:
            return None
    # 합삭/망일시 - ephem 라이브러리로 정확한 천문학적 계산
    def get_new_full_moon(year, month):
        import ephem
        
        # 해당 월의 시작일과 종료일
        start_date = datetime.datetime(year, month, 1)
        if month == 12:
            end_date = datetime.datetime(year + 1, 1, 1)
        else:
            end_date = datetime.datetime(year, month + 1, 1)
        
        new_moon = None
        full_moon = None
        
        try:
            # 합삭(신월, New Moon) 계산
            new_moon_ephem = ephem.next_new_moon(start_date)
            new_moon_dt = ephem.Date(new_moon_ephem).datetime()
            # UTC를 KST로 변환 (+9시간)
            new_moon_kst = new_moon_dt + datetime.timedelta(hours=9)
            # 해당 월에 속하는지 확인
            if start_date <= new_moon_kst < end_date:
                new_moon = new_moon_kst
            
            # 망(보름달, Full Moon) 계산
            full_moon_ephem = ephem.next_full_moon(start_date)
            full_moon_dt = ephem.Date(full_moon_ephem).datetime()
            # UTC를 KST로 변환 (+9시간)
            full_moon_kst = full_moon_dt + datetime.timedelta(hours=9)
            # 해당 월에 속하는지 확인
            if start_date <= full_moon_kst < end_date:
                full_moon = full_moon_kst
        except Exception as e:
            pass
        
        return new_moon, full_moon
    new_moon_kst, full_moon_kst = get_new_full_moon(year, month)
    if new_moon_kst:
        new_moon_jst = new_moon_kst - datetime.timedelta(minutes=30)
    else:
        new_moon_jst = None
    if full_moon_kst:
        full_moon_jst = full_moon_kst - datetime.timedelta(minutes=30)
    else:
        full_moon_jst = None
    
    calendar_weeks = []
    
    # 시주 계산을 위한 시간대 설정 (실제 PC/모바일 현재 시간 기준)
    now_dt = datetime.datetime.now()
    current_hour_for_gz = now_dt.hour
    current_minute_for_gz = now_dt.minute
    
    # 성능 최적화: entries를 루프 밖에서 한 번만 계산하고 미리 파싱
    year_entries = SOLAR_TERMS_DATA.get(str(year), [])
    prev_year_entries_for_loop = SOLAR_TERMS_DATA.get(str(year - 1), []) if month <= 2 else []
    all_entries_for_loop = prev_year_entries_for_loop + year_entries
    next_year_entries_for_loop = SOLAR_TERMS_DATA.get(str(year + 1), [])
    all_entries_with_dt = []
    for e in all_entries_for_loop + next_year_entries_for_loop:
        try:
            dt = datetime.datetime.strptime(e['datetime_KST'], '%Y-%m-%d %H:%M:%S')
            all_entries_with_dt.append((e, dt))
        except:
            continue
    
    for week in cal_data:
        week_data = []
        for day in week:
            cell_info = {}
            if day == 0:
                cell_info = {'day': None, 'lunar': None, 'gānzhī': None, 'term': None, 'is_today': False,
                             'year_gz': None, 'month_gz': None, 'day_gz': None, 'hour_gz': None,
                             'lunar_type': None}
            else:
                date_obj = datetime.date(year, month, day)
                solar_date_obj = Solar(year, month, day)
                lunar_date_obj: Lunar = Converter.Solar2Lunar(solar_date_obj)
                
                cell_info['day'] = day
                lunar_month = lunar_date_obj.month
                lunar_day = lunar_date_obj.day
                is_leap = getattr(lunar_date_obj, 'isleap', False)
                
                # 음력 대월/소월 판별 (해당 음력 월의 일수 계산)
                try:
                    # 해당 음력 월의 마지막 날짜 찾기 (30일부터 역순으로 확인)
                    max_day = 29  # 기본값은 소월(29일)
                    # 30일 존재 여부 확인
                    try:
                        test_lunar_30 = Lunar(lunar_date_obj.year, lunar_month, 30, isleap=is_leap)
                        test_solar_30 = Converter.Lunar2Solar(test_lunar_30)
                        # 30일이 유효하면 대월
                        max_day = 30
                    except (ValueError, AttributeError, Exception):
                        # 30일이 없으면 29일이 최대 (소월)
                        max_day = 29
                    
                    # 평달/윤달 표기 유지, 대월/소월 추가
                    base_type = '윤달' if is_leap else '평달'
                    if max_day == 30:
                        month_type = '대월'
                    else:
                        month_type = '소월'
                    
                    lunar_type = f"{base_type} {month_type}"
                except Exception as e:
                    # 예외 발생 시 기본값으로 평달 소월
                    lunar_type = ('윤달 ' if is_leap else '평달 ') + '소월'
                    
                lunar_str = f"{lunar_month}월 {lunar_day}일 {lunar_type}"
                cell_info['lunar'] = lunar_str
                cell_info['lunar_type'] = lunar_type
                
                # 만세력 4주 계산
                cell_info['year_gz'] = get_year_gānzhī(year, month, day)
                cell_info['month_gz'] = get_month_gānzhī(year, month, day)
                cell_info['day_gz'] = get_day_gānzhī(year, month, day)
                
                if date_obj == today:
                    # 오늘은 실시간 시간 기준으로 시주 계산
                    cell_info['hour_gz'] = get_hour_gānzhī(year, month, day, current_hour_for_gz, current_minute_for_gz)
                else:
                    # 오늘이 아닌 날짜는 항상 0시 0분(자시) 기준으로 시주 계산
                    cell_info['hour_gz'] = get_hour_gānzhī(year, month, day, 0, 0)
                    
                cell_info['gānzhī'] = cell_info['day_gz']
                cell_info['term'] = term_dates.get(date_obj, None)
                # 클라이언트 로컬 시간 기준으로 오늘 날짜 판단하므로 서버에서는 False로 설정
                # JavaScript에서 클라이언트 시간 기준으로 today 클래스를 추가/제거함
                cell_info['is_today'] = False
                # 해당 일자가 속한 절기 정보 추출 (성능 최적화: 파싱된 데이터 사용)
                # 해당 일자 이전의 절기 중 가장 최근 절기 찾기
                term_for_day = None
                for entry, dt in all_entries_with_dt:
                    if dt.date() <= date_obj:
                        term_for_day = entry
                    else:
                        break
                if term_for_day:
                    cell_info['current_term_name'] = term_for_day['term']
                    cell_info['current_term_kst'] = term_for_day['datetime_KST']
                    # 성능 최적화: datetime 객체 재사용
                    term_dt = next((dt for e, dt in all_entries_with_dt if e == term_for_day), None)
                    if term_dt:
                        cell_info['current_term_jst'] = kst_to_jst(term_dt)
                    else:
                        cell_info['current_term_jst'] = kst_to_jst(term_for_day['datetime_KST'])
                else:
                    # 절기 데이터가 없을 경우 전년도 마지막 절기 사용
                    if prev_year_entries_for_loop:
                        last_term = prev_year_entries_for_loop[-1]
                        cell_info['current_term_name'] = last_term['term']
                        cell_info['current_term_kst'] = last_term['datetime_KST']
                        cell_info['current_term_jst'] = kst_to_jst(last_term['datetime_KST'])
                    else:
                        cell_info['current_term_name'] = None
                        cell_info['current_term_kst'] = None
                        cell_info['current_term_jst'] = None
                # 선택한 날짜 기준으로 같거나 큰 절기 3개 추출 (성능 최적화: 파싱된 데이터 사용)
                next_terms = []
                for entry, dt in all_entries_with_dt:
                    if dt.date() >= date_obj:
                        next_terms.append({'term': entry['term'], 'datetime_KST': entry['datetime_KST']})
                        if len(next_terms) == 3:
                            break
                cell_info['next_3_terms'] = next_terms
                     # 합삭/망일시는 기존 방식 유지
                cell_info['new_moon_kst'] = new_moon_kst.strftime('%Y-%m-%d %H:%M') if new_moon_kst else None
                cell_info['new_moon_jst'] = new_moon_jst.strftime('%Y-%m-%d %H:%M') if new_moon_jst else None
                cell_info['full_moon_kst'] = full_moon_kst.strftime('%Y-%m-%d %H:%M') if full_moon_kst else None
                cell_info['full_moon_jst'] = full_moon_jst.strftime('%Y-%m-%d %H:%M') if full_moon_jst else None
	            # 이번달 절입/중기/다음달 절입 정보 추출 (절입=홀수절기, 중기=짝수절기)
                # 성능 최적화: 이미 파싱된 데이터 사용 (루프 밖에서 계산된 this_month_terms, next_month_terms 재사용)
                # 이번달 절입 (홀수 인덱스)
                jeolip = next((e for e in this_month_terms if e.get('term_index_in_cycle', 0) % 2 == 1), None)
                # 이번달 중기 (짝수 인덱스)
                junggi = next((e for e in this_month_terms if e.get('term_index_in_cycle', 0) % 2 == 0), None)
                # 다음달 절입 (홀수 인덱스)
                next_jeolip = next((e for e in next_month_terms if e.get('term_index_in_cycle', 0) % 2 == 1), None)
                cell_info['jeolip_kst'] = jeolip['datetime_KST'] if jeolip else None
                # 성능 최적화: datetime 객체 재사용
                if jeolip:
                    jeolip_dt = next((dt for e, dt in parsed_jeolgi_entries if e == jeolip), None)
                    cell_info['jeolip_jst'] = kst_to_jst(jeolip_dt) if jeolip_dt else kst_to_jst(jeolip['datetime_KST'])
                else:
                    cell_info['jeolip_jst'] = None
                cell_info['jeolip_term'] = jeolip['term'] if jeolip else None
                cell_info['junggi_kst'] = junggi['datetime_KST'] if junggi else None
                if junggi:
                    junggi_dt = next((dt for e, dt in parsed_jeolgi_entries if e == junggi), None)
                    cell_info['junggi_jst'] = kst_to_jst(junggi_dt) if junggi_dt else kst_to_jst(junggi['datetime_KST'])
                else:
                    cell_info['junggi_jst'] = None
                cell_info['junggi_term'] = junggi['term'] if junggi else None
                cell_info['next_jeolip_kst'] = next_jeolip['datetime_KST'] if next_jeolip else None
                if next_jeolip:
                    next_jeolip_dt = next((dt for e, dt in parsed_jeolgi_entries if e == next_jeolip), None)
                    cell_info['next_jeolip_jst'] = kst_to_jst(next_jeolip_dt) if next_jeolip_dt else kst_to_jst(next_jeolip['datetime_KST'])
                else:
                    cell_info['next_jeolip_jst'] = None
                cell_info['next_jeolip_term'] = next_jeolip['term'] if next_jeolip else None
            week_data.append(cell_info)
        calendar_weeks.append(week_data)

    return render_template('calendar.html', 
                           year=year, 
                           month=month, 
                           month_gānzhī=month_gānzhī_display, 
                           calendar_weeks=calendar_weeks,
                           today=today)

###s##########saju.html- mancal.py에 변환 API 추가/ "음력","윤달"을 -> "양력"으로 변환
@app.route('/convert_lunar_to_solar')
def convert_lunar_to_solar():
    year = int(request.args.get('year'))
    month = int(request.args.get('month'))
    day = int(request.args.get('day'))
    is_leap = request.args.get('is_leap', 'false').lower() == 'true'
    try:
        lunar = Lunar(year, month, day, isleap=is_leap)
        solar = Converter.Lunar2Solar(lunar)
        return jsonify({'year': solar.year, 'month': solar.month, 'day': solar.day})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# "양력"을 -> "음력","윤달"로 변환
@app.route('/convert_solar_to_lunar')
def convert_solar_to_lunar():
    """양력 날짜를 음력으로 변환"""
    year = int(request.args.get('year'))
    month = int(request.args.get('month'))
    day = int(request.args.get('day'))
    try:
        solar = Solar(year, month, day)
        lunar = Converter.Solar2Lunar(solar)
        
        return jsonify({
            'year': lunar.year,
            'month': lunar.month,
            'day': lunar.day,
            'is_leap': lunar.isleap
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
###e##########saju.html
    
    
    
if __name__ == '__main__':
    # 로컬 개발용
    #app.run(debug=True, port=5000)
    app.run(host='127.0.0.1', port=5000, debug=True)
else:
    # 프로덕션 배포용 (cloudtype.io 등)
    # Gunicorn이 자동으로 app 객체를 실행
    pass