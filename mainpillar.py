import json
from datetime import datetime, timedelta

TEN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
TWELVE_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

# 일반 子時/朝子時용 맵 (오서둔법)
# 甲/己(0,5) → 甲子(0), 乙/庚(1,6) → 丙子(2), 丙/辛(2,7) → 戊子(4), 丁/壬(3,8) → 庚子(6), 戊/癸(4,9) → 壬子(8)
ZI_HOUR_STEM_MAP = {0: 0, 5: 0, 1: 2, 6: 2, 2: 4, 7: 4, 3: 6, 8: 6, 4: 8, 9: 8}

# 夜子時 전용 맵 (시주 천간이 2단계 앞으로)
# 甲/己(0,5) → 丙子(2), 乙/庚(1,6) → 戊子(4), 丙/辛(2,7) → 庚子(6), 丁/壬(3,8) → 壬子(8), 戊/癸(4,9) → 甲子(0)
NIGHT_ZI_HOUR_STEM_MAP = {0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0}

def load_solar_terms(year, json_path='api/solar_terms.json'):
    """해당 연도의 solar_terms.json 절기 데이터 로드"""
    with open(json_path, encoding='utf-8') as f:
        data = json.load(f)
    return data[str(year)]

def get_all_terms(birth_dt, json_path='api/solar_terms.json'):
    """입력 생년월일 기준 ±1년 절기 데이터 합침"""
    years = [birth_dt.year - 1, birth_dt.year, birth_dt.year + 1]
    all_terms = []
    for y in years:
        all_terms.extend(load_solar_terms(y, json_path))
    return all_terms

def find_last_term(all_terms, birth_dt, term_names):
    """입력일 이전의 마지막 해당 term 반환"""
    last = None
    for t in all_terms:
        term_dt = datetime.strptime(t['datetime_KST'], '%Y-%m-%d %H:%M:%S')
        if term_dt <= birth_dt and t['term'] in term_names:
            last = t
    return last

def calc_year_pillar(birth_dt, all_terms):
    """년주(입춘 기준) 계산"""
    lichuns = [t for t in all_terms if t['term'] == '입춘']
    selected = None
    for t in lichuns:
        dt = datetime.strptime(t['datetime_KST'], '%Y-%m-%d %H:%M:%S')
        if dt <= birth_dt:
            selected = t
    if not selected:
        return '', '입춘 데이터 없음'
    lichun_year = datetime.strptime(selected['datetime_KST'], '%Y-%m-%d %H:%M:%S').year
    base_year = 1864
    idx = (lichun_year - base_year) % 60
    gan_zhi = TEN_GAN[idx % 10] + TWELVE_ZHI[idx % 12]
    info = f'입춘 기준 연도: {lichun_year} / 입춘 시각: {selected["datetime_KST"]} / 간지: {gan_zhi}'
    return gan_zhi, info

def calc_month_pillar(birth_dt, all_terms):
    """월주(중기 절기, 오호상정법) 계산 - 만세력 기준"""
    # 중기 절기와 지지 매핑
    # 입춘(1월)=寅, 경칩(2월)=卯, 청명(3월)=辰, 입하(4월)=巳
    # 망종(5월)=午, 소서(6월)=未, 입추(7월)=申, 백로(8월)=酉
    # 한로(9월)=戌, 입동(10월)=亥, 대설(11월)=子, 소한(12월)=丑
    
    mid_terms_with_zhi = [
        ('입춘', 2),   # 寅 (1월 절기)
        ('경칩', 3),   # 卯 (2월 절기)
        ('청명', 4),   # 辰 (3월 절기)
        ('입하', 5),   # 巳 (4월 절기)
        ('망종', 6),   # 午 (5월 절기)
        ('소서', 7),   # 未 (6월 절기)
        ('입추', 8),   # 申 (7월 절기)
        ('백로', 9),   # 酉 (8월 절기)
        ('한로', 10),  # 戌 (9월 절기)
        ('입동', 11),  # 亥 (10월 절기)
        ('대설', 0),   # 子 (11월 절기)
        ('소한', 1)    # 丑 (12월 절기)
    ]
    
    mid_terms = [name for name, _ in mid_terms_with_zhi]
    last_mid = find_last_term(all_terms, birth_dt, mid_terms)
    
    if not last_mid:
        return ''
    
    term_dt = datetime.strptime(last_mid['datetime_KST'], '%Y-%m-%d %H:%M:%S')
    
    # 절기명으로 지지 찾기
    month_branch_idx = 2  # 기본값 寅
    for term_name, zhi_idx in mid_terms_with_zhi:
        if last_mid['term'] == term_name:
            month_branch_idx = zhi_idx
            break
    
    # 천간 계산 (오호상정법)
    year_stem_idx = (term_dt.year - 1864) % 10
    in_month_stem_idx = [2, 4, 6, 8, 0][year_stem_idx % 5]
    
    if month_branch_idx == 0:  # 子
        diff = in_month_stem_idx + 10
    elif month_branch_idx == 1:  # 丑
        diff = in_month_stem_idx + month_branch_idx + 8
    else:
        diff = in_month_stem_idx + month_branch_idx - 2
    
    stem_idx = diff % 10
    return TEN_GAN[stem_idx] + TWELVE_ZHI[month_branch_idx]

def calc_day_pillar(birth_dt):
    """일주(60갑자, 기준일 辛卯, 자시 23:30 기준) 계산"""
    base_dt = datetime(1900, 1, 1, 0, 0, 0)  # 辛卯일
    base_idx = 10  # 辛卯 인덱스
    day_diff = (birth_dt - base_dt).days
    day_idx = ((base_idx + day_diff) % 60 + 60) % 60
    return TEN_GAN[day_idx % 10] + TWELVE_ZHI[day_idx % 12]

def calc_hour_pillar(birth_dt, day_gan, time_type='normal'):
    """시주(자시 23:30~01:29 기준, 오서둔법) 계산
    
    time_type:
    - 'normal': 당일 일간 기준 (일반 맵)
    - 'night_zi': 당일 일간 기준 (夜子時 전용 맵 사용)
    - 'morning_zi': 전날 일간 기준 (일반 맵)
    
    주의: day_gan은 calc_saju에서 이미 적절히 선택되어 전달됨
    """
    hour = birth_dt.hour
    minute = birth_dt.minute
    
    # 자시~해시 구간별로 hour_idx 결정
    # 子時: 23:30~01:29
    if (hour == 23 and minute >= 30) or hour == 0 or (hour == 1 and minute <= 29):
        hour_idx = 0
    # 丑時: 01:30~03:29
    elif (hour == 1 and minute >= 30) or hour == 2 or (hour == 3 and minute <= 29):
        hour_idx = 1
    # 寅時: 03:30~05:29
    elif (hour == 3 and minute >= 30) or hour == 4 or (hour == 5 and minute <= 29):
        hour_idx = 2
    # 卯時: 05:30~07:29
    elif (hour == 5 and minute >= 30) or hour == 6 or (hour == 7 and minute <= 29):
        hour_idx = 3
    # 辰時: 07:30~09:29
    elif (hour == 7 and minute >= 30) or hour == 8 or (hour == 9 and minute <= 29):
        hour_idx = 4
    # 巳時: 09:30~11:29
    elif (hour == 9 and minute >= 30) or hour == 10 or (hour == 11 and minute <= 29):
        hour_idx = 5
    # 午時: 11:30~13:29
    elif (hour == 11 and minute >= 30) or hour == 12 or (hour == 13 and minute <= 29):
        hour_idx = 6
    # 未時: 13:30~15:29
    elif (hour == 13 and minute >= 30) or hour == 14 or (hour == 15 and minute <= 29):
        hour_idx = 7
    # 申時: 15:30~17:29
    elif (hour == 15 and minute >= 30) or hour == 16 or (hour == 17 and minute <= 29):
        hour_idx = 8
    # 酉時: 17:30~19:29
    elif (hour == 17 and minute >= 30) or hour == 18 or (hour == 19 and minute <= 29):
        hour_idx = 9
    # 戌時: 19:30~21:29
    elif (hour == 19 and minute >= 30) or hour == 20 or (hour == 21 and minute <= 29):
        hour_idx = 10
    # 亥時: 21:30~23:29
    elif (hour == 21 and minute >= 30) or hour == 22 or (hour == 23 and minute <= 29):
        hour_idx = 11
    else:
        hour_idx = ((hour + 1) % 24) // 2
    
    # 전달받은 day_gan 사용
    day_stem_idx = TEN_GAN.index(day_gan[0])
    
    # 夜子時는 전용 맵 사용
    if time_type == 'night_zi' and hour_idx == 0:
        zi_hour_stem_map = NIGHT_ZI_HOUR_STEM_MAP
    else:
        zi_hour_stem_map = ZI_HOUR_STEM_MAP
    
    first_hour_stem_idx = zi_hour_stem_map[day_stem_idx]
    hour_gan = TEN_GAN[(first_hour_stem_idx + hour_idx) % 10]
    hour_zhi = TWELVE_ZHI[hour_idx]
    return hour_gan + hour_zhi

def calc_saju(birth_str, json_path='api/solar_terms.json', time_type='normal'):
    """입력값(YYYY-MM-DD HH:MM)으로 사주 결과 반환
    
    time_type:
    - 'normal': 시각 입력 모드 기본
      * 23:30~23:59: 다음날 일주, 朝子時 조견표 (夜子時로 계산)
      * 00:00~01:29: 당일 일주, 朝子時 조견표 (朝子時로 계산)
    - 'zi_ganji': 간지 입력 - 子時 - 다음날 일주, 朝子時 조견표
    - 'night_zi': 간지 입력 - 夜子時 - 당일 일주, 夜子時 조견표
    - 'morning_zi': 간지 입력 - 朝子時 - 당일 일주, 朝子時 조견표
    """
    birth_dt = datetime.strptime(birth_str, '%Y-%m-%d %H:%M')
    hour = birth_dt.hour
    minute = birth_dt.minute
    
    # 子時 여부 확인
    is_zi_time = (hour == 23 and minute >= 30) or hour == 0 or (hour == 1 and minute <= 29)
    
    all_terms = get_all_terms(birth_dt, json_path)
    year_gz, year_info = calc_year_pillar(birth_dt, all_terms)
    month_gz = calc_month_pillar(birth_dt, all_terms)
    
    # 일주 계산 및 시주 계산
    if is_zi_time:
        if time_type == 'normal':
            # 시각 입력 모드: 23:30~23:59와 00:00~01:29를 구분
            if hour == 23 and minute >= 30:
                # 夜子時 (23:30~23:59): 다음날 일주, 朝子時 조견표
                day_dt = birth_dt + timedelta(days=1)
                day_gz = calc_day_pillar(day_dt)
                hour_gz = calc_hour_pillar(birth_dt, day_gz, 'morning_zi')
            else:
                # 朝子時 (00:00~01:29): 당일 일주, 朝子時 조견표
                day_gz = calc_day_pillar(birth_dt)
                hour_gz = calc_hour_pillar(birth_dt, day_gz, 'morning_zi')
        elif time_type == 'zi_ganji':
            # 간지 입력 - 子時: 다음날 일주, 朝子時 조견표
            day_dt = birth_dt + timedelta(days=1)
            day_gz = calc_day_pillar(day_dt)
            hour_gz = calc_hour_pillar(birth_dt, day_gz, 'morning_zi')
        elif time_type == 'night_zi':
            # 간지 입력 - 夜子時: 당일 일주, 夜子時 조견표
            day_gz = calc_day_pillar(birth_dt)
            hour_gz = calc_hour_pillar(birth_dt, day_gz, 'night_zi')
        elif time_type == 'morning_zi':
            # 간지 입력 - 朝子時: 당일 일주, 朝子時 조견표
            day_gz = calc_day_pillar(birth_dt)
            hour_gz = calc_hour_pillar(birth_dt, day_gz, 'morning_zi')
    else:
        # 자시 외 시간: 당일 일주, 일반 계산
        day_gz = calc_day_pillar(birth_dt)
        hour_gz = calc_hour_pillar(birth_dt, day_gz, 'normal')
    
    # 양력 -> 음력 변환 (lunarcalendar 보정 버전 사용)
    try:
        result_lunar = convert_solar_to_lunar(birth_dt.year, birth_dt.month, birth_dt.day)
        if result_lunar.get('error'):
            lunar_str = ''
        else:
            lunar_year = result_lunar['year']
            lunar_month = result_lunar['month']
            lunar_day = result_lunar['day']
            is_leap = result_lunar['is_leap']
            lunar_type = '윤달' if is_leap else '평달'
            lunar_str = f"{lunar_year}.{lunar_month}.{lunar_day} {lunar_type}"
    except Exception as e:
        lunar_str = ''
    
    return {
        'year': year_gz,
        'month': month_gz,
        'day': day_gz,
        'hour': hour_gz,
        'lunar': lunar_str,
        'info': {
            'yearP': year_info,
            'birth': birth_dt.strftime('%Y-%m-%d %H:%M'),
            'time_type': time_type
        }
    }

# 음력/윤달 → 양력 변환 함수
def convert_lunar_to_solar(year, month, day, is_leap):
    """음력/윤달 날짜를 양력으로 변환"""
    try:
        # 입력값 검증
        if year is None or month is None or day is None:
            return {'error': 'year, month, day 파라미터가 필요합니다.'}
        
        try:
            year = int(year)
            month = int(month)
            day = int(day)
        except (ValueError, TypeError):
            return {'error': f'year, month, day는 정수여야 합니다. (받은 값: year={year}, month={month}, day={day})'}
        
        # 유효한 날짜 범위 검증
        if year < 1900 or year > 2100:
            return {'error': f'년도는 1900-2100 사이여야 합니다. (받은 값: {year})'}
        if month < 1 or month > 12:
            return {'error': f'월은 1-12 사이여야 합니다. (받은 값: {month})'}
        if day < 1 or day > 31:
            return {'error': f'일은 1-31 사이여야 합니다. (받은 값: {day})'}
        
        from lunarcalendar import Converter, Lunar
        lunar = Lunar(year, month, day, isleap=is_leap)
        solar = Converter.Lunar2Solar(lunar)
        return {
            'year': solar.year,
            'month': solar.month,
            'day': solar.day,
            'error': None
        }
    except ValueError as e:
        # 존재하지 않는 윤달 등의 경우
        error_msg = str(e)
        if is_leap:
            return {'error': f'{year}년 {month}월에는 윤달이 없습니다. 윤달 체크를 해제하고 다시 시도해주세요. (상세: {error_msg})'}
        else:
            return {'error': f'유효하지 않은 음력 날짜입니다: {year}년 {month}월 {day}일 (상세: {error_msg})'}
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        return {'error': f'음력 변환 중 오류가 발생했습니다: {str(e)}'}


# 양력 → 음력 변환 함수
def convert_solar_to_lunar(year, month, day):
    """
    양력 날짜를 음력으로 변환
    """
    try:
        from lunarcalendar import Converter, Solar
        solar = Solar(int(year), int(month), int(day))
        lunar = Converter.Solar2Lunar(solar)
        
        return {
            'year': lunar.year,
            'month': lunar.month,
            'day': lunar.day,
            'is_leap': lunar.isleap,
            'error': None
        }
    except Exception as e:
        return {'error': str(e)}



if __name__ == '__main__':
    # 터미널에서 입력값 받기
    #birth_str = input('생년월일 시각을 입력하세요 (예: 2031-02-23 23:45): ')
    #-----------------------------------------------
    #print('--- 사주 입력 ---')
    #cal_type = input('양력 구분을 입력하세요 (양력/음력/윤달): ').strip()
    #birth_str = input('생년월일 시각을 입력하세요 (예: 2031-02-23 23:45): ').strip()
    #------------------------
    # 한 줄에서 구분과 날짜/시간을 입력받음
    user_input = input('양력.음력 구분과 생년월일 시각을 입력하세요 (예: 양력 2031-02-23 23:45 또는 음력 2031-02-23 23:45): ').strip()
    # 입력값 파싱: 첫 단어가 구분, 나머지가 날짜/시간
    try:
        cal_type, birth_str = user_input.split(' ', 1)
    except ValueError:
        print('입력 형식 오류: "양력 2031-02-23 23:45" 또는 "음력 2031-02-23 23:45" 형식으로 입력하세요.')
        exit(1)
    # 음력/윤달 입력 시 lunarcalendar로 양력 변환
    if cal_type in ['음력', '윤달']:
        birth_dt = datetime.strptime(birth_str, '%Y-%m-%d %H:%M')
        result_conv = convert_lunar_to_solar(birth_dt.year, birth_dt.month, birth_dt.day, cal_type == '윤달')
        if result_conv.get('error'):
            print(f"음력 변환 오류: {result_conv['error']}")
            exit(1)
        birth_str = f"{result_conv['year']}-{str(result_conv['month']).zfill(2)}-{str(result_conv['day']).zfill(2)} {birth_dt.hour:02d}:{birth_dt.minute:02d}"
        print(f"입력된 음력/윤달을 양력으로 변환: {birth_str}")
    result = calc_saju(birth_str, json_path='api/solar_terms.json')
    print(json.dumps(result, ensure_ascii=False, indent=2))