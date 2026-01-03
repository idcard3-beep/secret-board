import random
import json
import os
#from flask import Flask, jsonify, request, abort, send_from_directory, render_template
from flask import Flask, jsonify, request, abort, render_template, session
from werkzeug.exceptions import HTTPException
from flask_cors import CORS 


#app = Flask(__name__)
# 클라이언트와의 통신을 위해 CORS를 허용합니다.
app = Flask(__name__, template_folder='web/tarot/templates', static_folder='web/tarot/static')

# 공통 static 파일 서빙 라우트 추가
@app.route('/common/static/<path:filename>')
def common_static(filename):
    """공통 static 파일 서빙 (member_session.js, admin_session.js, security.js, security.css 등)"""
    from flask import send_from_directory
    import os
    # tarot_app.py는 프로젝트 루트에 있으므로 직접 경로 사용
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

CORS(app)

# 78장 전체 카드 정보 반환 API
@app.route('/api/tarot/all-cards', methods=['GET'])
def all_cards():
    # 각 카드의 기본 정보만 반환
    cards = [
        {
            "card_id": card["id"] + 1,
            "en_name": card["en"],
            "kr_name": card["kr"],
            "type": card["type"],
            "suit": card.get("suit"),
            "num": card.get("num"),
        }
        for card in DECK
    ]
    return jsonify({"cards": cards, "count": len(cards)})

# ==============================================================================
# 1. 🃏 타로 덱 정의 및 키워드 데이터
# ==============================================================================

# Major Arcana (메이저 아르카나)
MAJOR_ARCANA = [
    {"en": "The Fool", "kr": "바보"},
    {"en": "The Magician", "kr": "마법사"},
    {"en": "The High Priestess", "kr": "여사제"},
    {"en": "The Empress", "kr": "여제"},
    {"en": "The Emperor", "kr": "황제"},
    {"en": "The Hierophant", "kr": "교황"},
    {"en": "The Lovers", "kr": "연인"},
    {"en": "The Chariot", "kr": "전차"},
    {"en": "Strength", "kr": "힘"},
    {"en": "The Hermit", "kr": "은둔자"},
    {"en": "Wheel of Fortune", "kr": "운명의 수레바퀴"},
    {"en": "Justice", "kr": "정의"},
    {"en": "The Hanged Man", "kr": "매달린 남자"},
    {"en": "Death", "kr": "죽음"},
    {"en": "Temperance", "kr": "절제"},
    {"en": "The Devil", "kr": "악마"},
    {"en": "The Tower", "kr": "탑"},
    {"en": "The Star", "kr": "별"},
    {"en": "The Moon", "kr": "달"},
    {"en": "The Sun", "kr": "태양"},
    {"en": "Judgement", "kr": "심판"},
    {"en": "The World", "kr": "세계"},
]
SUITS = [
    {"en": "Wands", "kr": "완드"},
    {"en": "Cups", "kr": "컵"},
    {"en": "Swords", "kr": "소드"},
    {"en": "Pentacles", "kr": "펜타클"},
]
MINOR = [
    'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 
    'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'
]
FACE_KO = {
    'Page': '페이지', 'Knight': '나이트', 'Queen': '퀸', 'King': '킹', 'Ace': '에이스'
}

DECK = []
# 메이저 아르카나 추가 (0-21)
for i, c in enumerate(MAJOR_ARCANA):
    DECK.append({
        "id": i, "en": c["en"], "kr": c["kr"], "type": "major"
    })
# 마이너 아르카나 추가 (22-77)
_idx = len(MAJOR_ARCANA)
for s in SUITS:
    for n in MINOR:
        DECK.append({
            "id": _idx,
            "en": f"{n} of {s['en']}",
            "kr": f"{s['kr']} {FACE_KO.get(n, n)}",
            "type": "minor",
            "suit": s["en"],
            "num": n,
        })
        _idx += 1


# --- 키워드 데이터 (핵심 로직) ---
# 메이저 아르카나 키워드
KWD_MAJOR = {
    'The Fool': {'up': ['대담한 시작', '신뢰의 점프', '초심의 자유'], 'rev': ['충동적 선택', '준비 미흡', '현실감 부족']},
    'The Magician': {'up': ['의지→현실화', '집중력', '자원 통합'], 'rev': ['기술 남용', '과장/속임', '의지 분산']},
    'The High Priestess': {'up': ['깊은 직관', '비밀의 문', '감정의 정적'], 'rev': ['신호 무시', '감정 둔감', '내면과 단절']},
    'The Empress': {'up': ['풍요/성장', '관계 양육', '창조성'], 'rev': ['과보호', '게으름', '경계 흐림']},
    'The Emperor': {'up': ['질서/규칙', '책임 리더십', '경계 설정'], 'rev': ['권위주의', '경직성', '융통성 결핍']},
    'The Hierophant': {'up': ['정통/멘토', '체계 학습', '제도적 안전'], 'rev': ['형식주의', '권위 반감', '틀에 갇힘']},
    'The Lovers': {'up': ['가치 정렬', '끌림/선택', '관계의 합'], 'rev': ['우유부단', '유혹/삼각', '가치 불일치']},
    'The Chariot': {'up': ['의지 승리', '방향 통제', '집중 전진'], 'rev': ['폭주/편향', '동력 분산', '통제 상실']},
    'Strength': {'up': ['부드러운 힘', '자기조절', '회복 탄력'], 'rev': ['억누른 분노', '불안/소진', '자책']},
    'The Hermit': {'up': ['내면 탐구', '현자/지도', '깊은 통찰'], 'rev': ['고립화', '과도한 신중', '행동 지연']},
    'Wheel of Fortune': {'up': ['변곡/전환', '운 흐름', '주기 인식'], 'rev': ['타이밍 악화', '기회 놓침', '반복 패턴']},
    'Justice': {'up': ['공정/균형', '사실 검증', '책임 수용'], 'rev': ['불균형', '책임 회피', '왜곡']},
    'The Hanged Man': {'up': ['관점 전환', '유보의 지혜', '의미 있는 희생'], 'rev': ['무기력한 정체', '헌신 후회', '지연만 반복']},
    'Death': {'up': ['단호한 종료', '정리/탈피', '새 국면'], 'rev': ['미련/저항', '끝 회피', '지연된 변신']},
    'Temperance': {'up': ['혼합/조율', '적당함', '치유 흐름'], 'rev': ['과유불급', '불균형', '절제 실패']},
    'The Devil': {'up': ['집착 인식', '유혹 점검', '의존 구조'], 'rev': ['끊어내기', '탈중독', '경계 회복']},
    'The Tower': {'up': ['충격적 진실', '허상 붕괴', '재구성'], 'rev': ['피해 최소화', '경고 신호', '연착륙']},
    'The Star': {'up': ['희망/회복', '정화', '영감의 빛'], 'rev': ['자신감 저하', '흐릿함', '신뢰 흔들림']},
    'The Moon': {'up': ['불확실성', '무의식', '상상/두려움'], 'rev': ['명료해짐', '오해 해소', '현실 점검']},
    'The Sun': {'up': ['명료/성취', '생기', '공개/투명'], 'rev': ['지연된 성공', '과도한 낙관', '주목 과부하']},
    'Judgement': {'up': ['소명/각성', '평가/정산', '재기회'], 'rev': ['자책 루프', '결정 미룸', '신호 무시']},
    'The World': {'up': ['완성/통합', '순환 종료', '다음 챕터'], 'rev': ['미완의 고리', '닫힌 세계', '스케일업 필요']},
}
# 마이너 아르카나 기본 키워드 (수트별)
SUIT_BASE = {
    'Wands': {'up': ['동기', '추진', '열정 실행'], 'rev': ['소진', '산만', '속도 과다']},
    'Cups': {'up': ['감정', '관계', '공감 교류'], 'rev': ['감정 과잉', '의존', '회피']},
    'Swords': {'up': ['이성', '판단', '명료 소통'], 'rev': ['과잉 비판', '갈등', '냉소']},
    'Pentacles': {'up': ['현실', '자원', '성과 축적'], 'rev': ['지연', '집착', '불안정']},
}
# 마이너 아르카나 기본 키워드 (랭크별)
RANK_BASE = {
    'Ace': {'up': ['기원', '원동력', '기회 창'], 'rev': ['지연', '시동 불량', '분산']},
    'Two': {'up': ['선택', '정렬', '균형'], 'rev': ['우유부단', '비대칭', '대립']},
    'Three': {'up': ['확장', '협업', '초기 성과'], 'rev': ['지연', '불협', '재조정']},
    'Four': {'up': ['안정', '구조', '정착'], 'rev': ['정체', '권태', '경직']},
    'Five': {'up': ['도전', '경쟁', '갈등'], 'rev': ['손실 축소', '재정비', '중재']},
    'Six': {'up': ['조화 회복', '인정', '진전'], 'rev': ['자리싸움', '허상 쇼', '지연']},
    'Seven': {'up': ['평가/수성', '방어', '선별'], 'rev': ['불안', '방어 과잉', '기준 혼선']},
    'Eight': {'up': ['속도/몰입', '이동', '집중'], 'rev': ['산만', '지체', '방향 재설정']},
    'Nine': {'up': ['인내/유지', '경계', '완주 직전'], 'rev': ['과부하', '고립', '회복 필요']},
    'Ten': {'up': ['완결/책임', '부담 종결'], 'rev': ['과중', '미완', '위임 필요']},
    'Page': {'up': ['학습/메신저', '탐색', '신호'], 'rev': ['유치함', '미성숙', '피상']},
    'Knight': {'up': ['추진/모험', '전개', '속도'], 'rev': ['경솔', '불안정', '충돌']},
    'Queen': {'up': ['숙련/돌봄', '내면 통찰'], 'rev': ['감정 편향', '소극', '폐쇄']},
    'King': {'up': ['통솔/전문', '의사결정'], 'rev': ['권위 남용', '경직', '독선']},
}

# --- 프리셋 데이터 (타로 스프레드 정의) ---
PRESETS = {
    # 기본 스프레드
    'oneCard': {'title': '한 장 뽑기 (오늘의 조언)', 'count': 1, 'labels': ['오늘의 조언'], 'tips': ['핵심 기조·태도 1가지']},
    'threeCard': {'title': '3장 스프레드 (과거-현재-미래)', 'count': 3, 'labels': ['과거', '현재', '미래'], 'tips': ['기원/원인', '핵심 이슈', '전개 방향']},
    'cross': {'title': '십자가 스프레드', 'count': 4, 'labels': ['본질', '장애', '가능성', '결론'], 'tips': ['상황의 핵심', '극복할 난관', '성공 기회', '최종 예상 결과']},
    
    # 관계/연애
    'relationship_deep': {
        'title': '관계 심화 스프레드 (7장)',
        'count': 7,
        'labels': ['상대의 현재', '나의 현재', '관계 역학', '장애/갈등', '성장 포인트', '실천 조언', '단기 전망'],
        'tips': ['상대 감정·의도', '나의 욕구·경계', '힘의 균형/의존/거리', '갈등 촉발 요인', '관계 성숙의 열쇠', '즉시 적용할 한 가지', '1~3개월 분위기']
    },
    
    # 클래식 스프레드
    'celtic10': {
        'title': '켈틱 크로스 (10장)',
        'count': 10,
        'labels': ['현재상황', '교차/장애', '의식(의도)', '무의식(근원)', '과거', '미래', '자신의태도', '환경/타인', '희망/두려움', '결론'],
        'tips': ['핵심 테마', '즉시 장애', '겉 목표', '숨은 동인', '배경', '다가올 것', '내 태도', '주변 영향', '바람/우려', '최종 결론']
    },
}

# ==============================================================================
# 2. 🔀 타로 로직 함수
# ==============================================================================

def get_keywords(card, is_reversed):
    """
    주어진 카드 정보와 정/역위 여부에 따라 키워드를 반환합니다.
    """
    if card['type'] == 'major':
        keywords = KWD_MAJOR.get(card['en'])
        # 정위 키워드 또는 역위 키워드 반환
        return keywords['rev'] if is_reversed and keywords else keywords['up'] if keywords else []
    
    if card['type'] == 'minor':
        suit = card['suit']
        rank = card['num']
        
        # 정위/역위 키워드 결정
        s_keywords = SUIT_BASE.get(suit)['rev'] if is_reversed else SUIT_BASE.get(suit)['up']
        r_keywords = RANK_BASE.get(rank)['rev'] if is_reversed else RANK_BASE.get(rank)['up']
        
        # 키워드를 합치고 중복을 제거하며 최대 5개 반환
        combined_keywords = list(set(s_keywords + r_keywords))
        return combined_keywords[:5]
        
    return []

def shuffle_deck():
    """전체 덱 (0~77)의 인덱스를 무작위로 섞어 순서를 반환합니다."""
    deck_indices = list(range(len(DECK)))
    random.shuffle(deck_indices)
    return deck_indices

def generate_tarot_reading(preset_name):
    """특정 프리셋에 따라 카드를 뽑고 리딩 결과를 생성합니다."""
    preset = PRESETS.get(preset_name)
    if not preset:
        # 유효하지 않은 프리셋 이름일 경우 400 Bad Request 에러 발생
        abort(400, description="Invalid preset name. Available presets: " + ", ".join(PRESETS.keys()))

    num_cards = preset['count']
    deck_order = shuffle_deck()
    reading_result = []

    for i in range(num_cards):
        if i >= len(deck_order):
            break 
            
        card_index = deck_order[i]
        card_info = DECK[card_index]
        
        # 2. 정위/역위 무작위 결정 (50% 확률)
        is_reversed = random.random() < 0.5
        
        # 3. 키워드 검색
        keywords = get_keywords(card_info, is_reversed)
        
        # 4. 결과 구조화
        slot_label = preset['labels'][i]
        slot_tip = preset['tips'][i] if i < len(preset['tips']) else None # 팁은 선택 사항

        # 카드 ID는 1부터 78까지 사용 (DECK 인덱스 + 1)
        reading_result.append({
            "slot_number": i + 1,
            "slot_label": slot_label,
            "slot_tip": slot_tip,
            "card_id": card_info['id'] + 1, 
            "kr_name": card_info['kr'],
            "en_name": card_info['en'],
            "is_reversed": is_reversed,
            "keywords": keywords,
        })

    return {
        "preset_title": preset['title'],
        "preset_name": preset_name,
        "card_count": num_cards,
        "result": reading_result
    }

# ==============================================================================
# 3. 🌐 Flask API 엔드포인트
# ==============================================================================


# index.html 반환 라우트
#@app.route('/')
#def serve_index():
#    return send_from_directory(os.path.dirname(os.path.abspath(__file__)), 'tarot_index.html')

@app.route('/')
def index():
    return render_template('tarot_exec.html')

@app.route('/api/tarot/presets', methods=['GET'])
def list_presets():
    """사용 가능한 프리셋 목록을 반환합니다."""
    preset_meta = {
        name: {"title": p["title"], "count": p["count"], "labels": p["labels"]} 
        for name, p in PRESETS.items()
    }
    return jsonify(preset_meta)


@app.route('/api/tarot/draw/<preset_name>', methods=['GET'])
def draw_tarot(preset_name):
    """선택된 프리셋 이름에 따라 타로 리딩 결과를 생성하여 반환합니다."""
    try:
        result = generate_tarot_reading(preset_name)
        return jsonify(result)
    except HTTPException as e:
        # generate_tarot_reading에서 발생한 abort(400) 처리
        return jsonify({"error": "Invalid Preset", "message": str(e.description)}), e.code
    except Exception as e:
        # 기타 서버 내부 오류 처리
        app.logger.error(f"Server error for preset {preset_name}: {e}")
        return jsonify({"error": "Internal Server Error", "message": "서버 내부에서 오류가 발생했습니다."}), 500

if __name__ == '__main__':
    # 로컬 개발용 설정
    # 프로덕션에서는 gunicorn이 앱을 실행합니다
    #port = int(os.environ.get('PORT', 5000))
    #app.run(host='0.0.0.0', port=port, debug=False)
    app.run(host='127.0.0.1', port=5000, debug=True)