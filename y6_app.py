from flask import Flask, request, jsonify, render_template, session
from datetime import datetime, timedelta
import json
import os
import sys

# 시간대 처리를 위한 import
try:
    from zoneinfo import ZoneInfo  # Python 3.9+
    USE_ZONEINFO = True
except ImportError:
    # Python 3.8 이하를 위한 fallback - pytz 사용
    import pytz
    USE_ZONEINFO = False

# mainpillar.py 함수들 임포트
from mainpillar import calc_saju

app = Flask(__name__, 
            template_folder='web/y6/templates',
            static_folder='web/y6/static')

# 공통 static 파일 서빙 라우트 추가
@app.route('/common/static/<path:filename>')
def common_static(filename):
    """공통 static 파일 서빙 (member_session.js, admin_session.js, security.js, security.css 등)"""
    from flask import send_from_directory
    import os
    # y6_app.py는 프로젝트 루트에 있으므로 직접 경로 사용
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

# 납갑 시스템 데이터 (기존 정확한 구조 유지)
FIVE_ELEMENTS_BRANCH = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
}

# 정확한 납갑 지지 - 기존 정확한 구조 복원
NAJIA_BRANCHES = {
    '乾宮': ['子', '寅', '辰', '午', '申', '戌'], 
    '震宮': ['子', '寅', '辰', '午', '申', '戌'],
    '坤宮': ['未', '巳', '卯', '丑', '亥', '酉'],
    '巽宮': ['丑', '亥', '酉', '未', '巳', '卯'],
    '坎宮': ['寅', '辰', '午', '申', '戌', '子'], 
    '艮宮': ['辰', '午', '申', '戌', '子', '寅'], 
    '離宮': ['卯', '丑', '亥', '酉', '未', '巳'],
    '兌宮': ['巳', '卯', '丑', '亥', '酉', '未']
}

PALACE_INFO = {
    '乾宮': {'오행': '金'}, '兌宮': {'오행': '金'}, '離宮': {'오행': '火'}, 
    '震宮': {'오행': '木'}, '巽宮': {'오행': '木'}, '坎宮': {'오행': '水'}, 
    '艮宮': {'오행': '土'}, '坤宮': {'오행': '土'}
}

# 궁명 매핑 (표시용)
PALACE_DISPLAY_MAP = {
    '乾宮': '乾金宮', '兌宮': '兌金宮', '離宮': '離火宮',
    '震宮': '震木宮', '巽宮': '巽木宮', '坎宮': '坎水宮',
    '艮宮': '艮土宮', '坤宮': '坤土宮'
}

# 완전히 통합된 HEXAGRAMS 구조 - 내부는 기존 궁명, 표시는 오행 포함
HEXAGRAMS = {
    # 乾宮八卦 (금)
    '111111': {
        '이름': '乾為天', '궁': '乾宮', '세효': 6, '궁1': '乾宮', '궁2': '乾宮',
        '상괘': '乾', '하괘': '乾', '상기호': '☰', '하기호': '☰', 
        '특별그룹': '육충괘', '그룹순서': 1, '그룹설명': '분산, 파열, 변화를 상징. 급격한 변화나 충돌 상황'
    },
    '111110': {
        '이름': '天風姤', '궁': '乾宮', '세효': 1, '궁1': '巽宮', '궁2': '乾宮',
        '상괘': '乾', '하괘': '巽', '상기호': '☰', '하기호': '☴', 
        '특별그룹': None, '그룹순서': 2, '그룹설명': None
    },
    '111100': {
        '이름': '天山遯', '궁': '乾宮', '세효': 2, '궁1': '艮宮', '궁2': '乾宮',
        '상괘': '乾', '하괘': '艮', '상기호': '☰', '하기호': '☶', 
        '특별그룹': None, '그룹순서': 3, '그룹설명': None
    },
    '111000': {
        '이름': '天地否', '궁': '乾宮', '세효': 3, '궁1': '坤宮', '궁2': '乾宮',
        '상괘': '乾', '하괘': '坤', '상기호': '☰', '하기호': '☷', 
        '특별그룹': '육합괘', '그룹순서': 4, '그룹설명': '결합, 안정, 성사를 상징. 느리지만 확실한 진전'
    },
    '110000': {
        '이름': '風地觀', '궁': '乾宮', '세효': 4, '궁1': '坤宮', '궁2': '巽宮',
        '상괘': '巽', '하괘': '坤', '상기호': '☴', '하기호': '☷', 
        '특별그룹': None, '그룹순서': 5, '그룹설명': None
    },
    '100000': {
        '이름': '山地剝', '궁': '乾宮', '세효': 5, '궁1': '坤宮', '궁2': '艮宮',
        '상괘': '艮', '하괘': '坤', '상기호': '☶', '하기호': '☷', 
        '특별그룹': None, '그룹순서': 6, '그룹설명': None
    },
    '101000': {
        '이름': '火地晉', '궁': '乾宮', '세효': 4, '궁1': '坤宮', '궁2': '離宮',
        '상괘': '離', '하괘': '坤', '상기호': '☲', '하기호': '☷', 
        '특별그룹': None, '그룹순서': 7, '그룹설명': None
    },
    '101111': {
        '이름': '火天大有', '궁': '乾宮', '세효': 3, '궁1': '乾宮', '궁2': '離宮',
        '상괘': '離', '하괘': '乾', '상기호': '☲', '하기호': '☰', 
        '특별그룹': '귀혼괘', '그룹순서': 8, '그룹설명': '끝맺음, 마무리, 귀결을 상징. 안정적 귀착이나 종결'
    },
    
    # 兌宮八卦 (금)
    '011011': {
        '이름': '兌為澤', '궁': '兌宮', '세효': 6, '궁1': '兌宮', '궁2': '兌宮',
        '상괘': '兌', '하괘': '兌', '상기호': '☱', '하기호': '☱', 
        '특별그룹': '육충괘', '그룹순서': 1, '그룹설명': '분산, 파열, 변화를 상징. 급격한 변화나 충돌 상황'
    },
    '011010': {
        '이름': '澤水困', '궁': '兌宮', '세효': 1, '궁1': '坎宮', '궁2': '兌宮',
        '상괘': '兌', '하괘': '坎', '상기호': '☱', '하기호': '☵', 
        '특별그룹': None, '그룹순서': 2, '그룹설명': None
    },
    '011000': {
        '이름': '澤地萃', '궁': '兌宮', '세효': 2, '궁1': '坤宮', '궁2': '兌宮',
        '상괘': '兌', '하괘': '坤', '상기호': '☱', '하기호': '☷', 
        '특별그룹': None, '그룹순서': 3, '그룹설명': None
    },
    '011100': {
        '이름': '澤山咸', '궁': '兌宮', '세효': 3, '궁1': '艮宮', '궁2': '兌宮',
        '상괘': '兌', '하괘': '艮', '상기호': '☱', '하기호': '☶', 
        '특별그룹': None, '그룹순서': 4, '그룹설명': None
    },
    '010100': {
        '이름': '水山蹇', '궁': '兌宮', '세효': 4, '궁1': '艮宮', '궁2': '坎宮',
        '상괘': '坎', '하괘': '艮', '상기호': '☵', '하기호': '☶', 
        '특별그룹': '육합괘', '그룹순서': 5, '그룹설명': '결합, 안정, 성사를 상징. 느리지만 확실한 진전'
    },
    '000100': {
        '이름': '地山謙', '궁': '兌宮', '세효': 5, '궁1': '艮宮', '궁2': '坤宮',
        '상괘': '坤', '하괘': '艮', '상기호': '☷', '하기호': '☶', 
        '특별그룹': None, '그룹순서': 6, '그룹설명': None
    },
    '001100': {
        '이름': '雷山小過', '궁': '兌宮', '세효': 4, '궁1': '艮宮', '궁2': '震宮',
        '상괘': '震', '하괘': '艮', '상기호': '☳', '하기호': '☶', 
        '특별그룹': None, '그룹순서': 7, '그룹설명': None
    },
    '001011': {
        '이름': '雷澤歸妹', '궁': '兌宮', '세효': 3, '궁1': '兌宮', '궁2': '震宮',
        '상괘': '震', '하괘': '兌', '상기호': '☳', '하기호': '☱', 
        '특별그룹': '귀혼괘', '그룹순서': 8, '그룹설명': '끝맺음, 마무리, 귀결을 상징. 안정적 귀착이나 종결'
    },
    
    # 離宮八卦 (화)
    '101101': {
        '이름': '離為火', '궁': '離宮', '세효': 6, '궁1': '離宮', '궁2': '離宮',
        '상괘': '離', '하괘': '離', '상기호': '☲', '하기호': '☲', 
        '특별그룹': '육충괘', '그룹순서': 1, '그룹설명': '분산, 파열, 변화를 상징. 급격한 변화나 충돌 상황'
    },
    '101100': {
        '이름': '火山旅', '궁': '離宮', '세효': 1, '궁1': '艮宮', '궁2': '離宮',
        '상괘': '離', '하괘': '艮', '상기호': '☲', '하기호': '☶', 
        '특별그룹': None, '그룹순서': 2, '그룹설명': None
    },
    '101110': {
        '이름': '火風鼎', '궁': '離宮', '세효': 2, '궁1': '巽宮', '궁2': '離宮',
        '상괘': '離', '하괘': '巽', '상기호': '☲', '하기호': '☴', 
        '특별그룹': None, '그룹순서': 3, '그룹설명': None
    },
    '101010': {
        '이름': '火水未濟', '궁': '離宮', '세효': 3, '궁1': '坎宮', '궁2': '離宮',
        '상괘': '離', '하괘': '坎', '상기호': '☲', '하기호': '☵', 
        '특별그룹': None, '그룹순서': 4, '그룹설명': None
    },
    '100010': {
        '이름': '山水蒙', '궁': '離宮', '세효': 4, '궁1': '坎宮', '궁2': '艮宮',
        '상괘': '艮', '하괘': '坎', '상기호': '☶', '하기호': '☵', 
        '특별그룹': None, '그룹순서': 5, '그룹설명': None
    },
    '110010': {
        '이름': '風水渙', '궁': '離宮', '세효': 5, '궁1': '坎宮', '궁2': '巽宮',
        '상괘': '巽', '하괘': '坎', '상기호': '☴', '하기호': '☵', 
        '특별그룹': None, '그룹순서': 6, '그룹설명': None
    },
    '111010': {
        '이름': '天水訟', '궁': '離宮', '세효': 4, '궁1': '坎宮', '궁2': '乾宮',
        '상괘': '乾', '하괘': '坎', '상기호': '☰', '하기호': '☵', 
        '특별그룹': None, '그룹순서': 7, '그룹설명': None
    },
    '111101': {
        '이름': '天火同人', '궁': '離宮', '세효': 3, '궁1': '離宮', '궁2': '乾宮',
        '상괘': '乾', '하괘': '離', '상기호': '☰', '하기호': '☲', 
        '특별그룹': '유혼괘', '그룹순서': 8, '그룹설명': '불안정, 떠돌아다님, 미정을 상징. 마음의 방황이나 불확실'
    },
    
    # 震宮八卦 (목)
    '001001': {
        '이름': '震為雷', '궁': '震宮', '세효': 6, '궁1': '震宮', '궁2': '震宮',
        '상괘': '震', '하괘': '震', '상기호': '☳', '하기호': '☳', 
        '특별그룹': '육충괘', '그룹순서': 1, '그룹설명': '분산, 파열, 변화를 상징. 급격한 변화나 충돌 상황'
    },
    '001000': {
        '이름': '雷地豫', '궁': '震宮', '세효': 1, '궁1': '坤宮', '궁2': '震宮',
        '상괘': '震', '하괘': '坤', '상기호': '☳', '하기호': '☷', 
        '특별그룹': None, '그룹순서': 2, '그룹설명': None
    },
    '001010': {
        '이름': '雷水解', '궁': '震宮', '세효': 2, '궁1': '坎宮', '궁2': '震宮',
        '상괘': '震', '하괘': '坎', '상기호': '☳', '하기호': '☵', 
        '특별그룹': None, '그룹순서': 3, '그룹설명': None
    },
    '001110': {
        '이름': '雷風恒', '궁': '震宮', '세효': 3, '궁1': '巽宮', '궁2': '震宮',
        '상괘': '震', '하괘': '巽', '상기호': '☳', '하기호': '☴', 
        '특별그룹': '유혼괘', '그룹순서': 4, '그룹설명': '불안정, 떠돌아다님, 미정을 상징. 마음의 방황이나 불확실'
    },
    '000110': {
        '이름': '地風升', '궁': '震宮', '세효': 4, '궁1': '巽宮', '궁2': '坤宮',
        '상괘': '坤', '하괘': '巽', '상기호': '☷', '하기호': '☴', 
        '특별그룹': None, '그룹순서': 5, '그룹설명': None
    },
    '010110': {
        '이름': '水風井', '궁': '震宮', '세효': 5, '궁1': '巽宮', '궁2': '坎宮',
        '상괘': '坎', '하괘': '巽', '상기호': '☵', '하기호': '☴', 
        '특별그룹': None, '그룹순서': 6, '그룹설명': None
    },
    '011110': {
        '이름': '澤風大過', '궁': '震宮', '세효': 4, '궁1': '巽宮', '궁2': '兌宮',
        '상괘': '兌', '하괘': '巽', '상기호': '☱', '하기호': '☴', 
        '특별그룹': None, '그룹순서': 7, '그룹설명': None
    },
    '011001': {
        '이름': '澤雷隨', '궁': '震宮', '세효': 3, '궁1': '震宮', '궁2': '兌宮',
        '상괘': '兌', '하괘': '震', '상기호': '☱', '하기호': '☳', 
        '특별그룹': None, '그룹순서': 8, '그룹설명': None
    },
    
    # 巽宮八卦 (목)
    '110110': {
        '이름': '巽為風', '궁': '巽宮', '세효': 6, '궁1': '巽宮', '궁2': '巽宮',
        '상괘': '巽', '하괘': '巽', '상기호': '☴', '하기호': '☴', 
        '특별그룹': '육충괘', '그룹순서': 1, '그룹설명': '분산, 파열, 변화를 상징. 급격한 변화나 충돌 상황'
    },
    '110111': {
        '이름': '風天小畜', '궁': '巽宮', '세효': 1, '궁1': '乾宮', '궁2': '巽宮',
        '상괘': '巽', '하괘': '乾', '상기호': '☴', '하기호': '☰', 
        '특별그룹': None, '그룹순서': 2, '그룹설명': None
    },
    '110101': {
        '이름': '風火家人', '궁': '巽宮', '세효': 2, '궁1': '離宮', '궁2': '巽宮',
        '상괘': '巽', '하괘': '離', '상기호': '☴', '하기호': '☲', 
        '특별그룹': None, '그룹순서': 3, '그룹설명': None
    },
    '110001': {
        '이름': '風雷益', '궁': '巽宮', '세효': 3, '궁1': '震宮', '궁2': '巽宮',
        '상괘': '巽', '하괘': '震', '상기호': '☴', '하기호': '☳', 
        '특별그룹': None, '그룹순서': 4, '그룹설명': None
    },
    '111001': {
        '이름': '天雷無妄', '궁': '巽宮', '세효': 4, '궁1': '震宮', '궁2': '乾宮',
        '상괘': '乾', '하괘': '震', '상기호': '☰', '하기호': '☳', 
        '특별그룹': None, '그룹순서': 5, '그룹설명': None
    },
    '101001': {
        '이름': '火雷噬嗑', '궁': '巽宮', '세효': 5, '궁1': '震宮', '궁2': '離宮',
        '상괘': '離', '하괘': '震', '상기호': '☲', '하기호': '☳', 
        '특별그룹': None, '그룹순서': 6, '그룹설명': None
    },
    '100001': {
        '이름': '山雷頤', '궁': '巽宮', '세효': 4, '궁1': '震宮', '궁2': '艮宮',
        '상괘': '艮', '하괘': '震', '상기호': '☶', '하기호': '☳', 
        '특별그룹': '유혼괘', '그룹순서': 7, '그룹설명': '불안정, 떠돌아다님, 미정을 상징. 마음의 방황이나 불확실'
    },
    '100110': {
        '이름': '山風蠱', '궁': '巽宮', '세효': 3, '궁1': '巽宮', '궁2': '艮宮',
        '상괘': '艮', '하괘': '巽', '상기호': '☶', '하기호': '☴', 
        '특별그룹': '귀혼괘', '그룹순서': 8, '그룹설명': '끝맺음, 마무리, 귀결을 상징. 안정적 귀착이나 종결'
    },
    
    # 坎宮八卦 (수)
    '010010': {
        '이름': '坎為水', '궁': '坎宮', '세효': 6, '궁1': '坎宮', '궁2': '坎宮',
        '상괘': '坎', '하괘': '坎', '상기호': '☵', '하기호': '☵', 
        '특별그룹': '육충괘', '그룹순서': 1, '그룹설명': '분산, 파열, 변화를 상징. 급격한 변화나 충돌 상황'
    },
    '010011': {
        '이름': '水澤節', '궁': '坎宮', '세효': 1, '궁1': '兌宮', '궁2': '坎宮',
        '상괘': '坎', '하괘': '兌', '상기호': '☵', '하기호': '☱', 
        '특별그룹': '유혼괘', '그룹순서': 2, '그룹설명': '불안정, 떠돌아다님, 미정을 상징. 마음의 방황이나 불확실'
    },
    '010001': {
        '이름': '水雷屯', '궁': '坎宮', '세효': 2, '궁1': '震宮', '궁2': '坎宮',
        '상괘': '坎', '하괘': '震', '상기호': '☵', '하기호': '☳', 
        '특별그룹': None, '그룹순서': 3, '그룹설명': None
    },
    '010101': {
        '이름': '水火既濟', '궁': '坎宮', '세효': 3, '궁1': '離宮', '궁2': '坎宮',
        '상괘': '坎', '하괘': '離', '상기호': '☵', '하기호': '☲', 
        '특별그룹': '귀혼괘', '그룹순서': 4, '그룹설명': '끝맺음, 마무리, 귀결을 상징. 안정적 귀착이나 종결'
    },
    '011101': {
        '이름': '澤火革', '궁': '坎宮', '세효': 4, '궁1': '離宮', '궁2': '兌宮',
        '상괘': '兌', '하괘': '離', '상기호': '☱', '하기호': '☲', 
        '특별그룹': None, '그룹순서': 5, '그룹설명': None
    },
    '001101': {
        '이름': '雷火豐', '궁': '坎宮', '세효': 5, '궁1': '離宮', '궁2': '震宮',
        '상괘': '震', '하괘': '離', '상기호': '☳', '하기호': '☲', 
        '특별그룹': None, '그룹순서': 6, '그룹설명': None
    },
    '000101': {
        '이름': '地火明夷', '궁': '坎宮', '세효': 4, '궁1': '離宮', '궁2': '坤宮',
        '상괘': '坤', '하괘': '離', '상기호': '☷', '하기호': '☲', 
        '특별그룹': None, '그룹순서': 7, '그룹설명': None
    },
    '000010': {
        '이름': '地水師', '궁': '坎宮', '세효': 3, '궁1': '坎宮', '궁2': '坤宮',
        '상괘': '坤', '하괘': '坎', '상기호': '☷', '하기호': '☵', 
        '특별그룹': None, '그룹순서': 8, '그룹설명': None
    },
    
    # 艮宮八卦 (토)
    '100100': {
        '이름': '艮為山', '궁': '艮宮', '세효': 6, '궁1': '艮宮', '궁2': '艮宮',
        '상괘': '艮', '하괘': '艮', '상기호': '☶', '하기호': '☶', 
        '특별그룹': '육충괘', '그룹순서': 1, '그룹설명': '분산, 파열, 변화를 상징. 급격한 변화나 충돌 상황'
    },
    '100101': {
        '이름': '山火賁', '궁': '艮宮', '세효': 1, '궁1': '離宮', '궁2': '艮宮',
        '상괘': '艮', '하괘': '離', '상기호': '☶', '하기호': '☲', 
        '특별그룹': None, '그룹순서': 2, '그룹설명': None
    },
    '100111': {
        '이름': '山天大畜', '궁': '艮宮', '세효': 2, '궁1': '乾宮', '궁2': '艮宮',
        '상괘': '艮', '하괘': '乾', '상기호': '☶', '하기호': '☰', 
        '특별그룹': None, '그룹순서': 3, '그룹설명': None
    },
    '100011': {
        '이름': '山澤損', '궁': '艮宮', '세효': 3, '궁1': '兌宮', '궁2': '艮宮',
        '상괘': '艮', '하괘': '兌', '상기호': '☶', '하기호': '☱', 
        '특별그룹': None, '그룹순서': 4, '그룹설명': None
    },
    '101011': {
        '이름': '火澤睽', '궁': '艮宮', '세효': 4, '궁1': '兌宮', '궁2': '離宮',
        '상괘': '離', '하괘': '兌', '상기호': '☲', '하기호': '☱', 
        '특별그룹': '육합괘', '그룹순서': 5, '그룹설명': '결합, 안정, 성사를 상징. 느리지만 확실한 진전'
    },
    '111011': {
        '이름': '天澤履', '궁': '艮宮', '세효': 5, '궁1': '兌宮', '궁2': '乾宮',
        '상괘': '乾', '하괘': '兌', '상기호': '☰', '하기호': '☱', 
        '특별그룹': None, '그룹순서': 6, '그룹설명': None
    },
    '110011': {
        '이름': '風澤中孚', '궁': '艮宮', '세효': 4, '궁1': '兌宮', '궁2': '巽宮',
        '상괘': '巽', '하괘': '兌', '상기호': '☴', '하기호': '☱', 
        '특별그룹': '유혼괘', '그룹순서': 7, '그룹설명': '불안정, 떠돌아다님, 미정을 상징. 마음의 방황이나 불확실'
    },
    '110100': {
        '이름': '風山漸', '궁': '艮宮', '세효': 3, '궁1': '艮宮', '궁2': '巽宮',
        '상괘': '巽', '하괘': '艮', '상기호': '☴', '하기호': '☶', 
        '특별그룹': '귀혼괘', '그룹순서': 8, '그룹설명': '끝맺음, 마무리, 귀결을 상징. 안정적 귀착이나 종결'
    },
    
    # 坤宮八卦 (토)
    '000000': {
        '이름': '坤為地', '궁': '坤宮', '세효': 6, '궁1': '坤宮', '궁2': '坤宮',
        '상괘': '坤', '하괘': '坤', '상기호': '☷', '하기호': '☷', 
        '특별그룹': '육충괘', '그룹순서': 1, '그룹설명': '분산, 파열, 변화를 상징. 급격한 변화나 충돌 상황'
    },
    '000001': {
        '이름': '地雷復', '궁': '坤宮', '세효': 1, '궁1': '震宮', '궁2': '坤宮',
        '상괘': '坤', '하괘': '震', '상기호': '☷', '하기호': '☳', 
        '특별그룹': '유혼괘', '그룹순서': 2, '그룹설명': '불안정, 떠돌아다님, 미정을 상징. 마음의 방황이나 불확실'
    },
    '000011': {
        '이름': '地澤臨', '궁': '坤宮', '세효': 2, '궁1': '兌宮', '궁2': '坤宮',
        '상괘': '坤', '하괘': '兌', '상기호': '☷', '하기호': '☱', 
        '특별그룹': None, '그룹순서': 3, '그룹설명': None
    },
    '000111': {
        '이름': '地天泰', '궁': '坤宮', '세효': 3, '궁1': '乾宮', '궁2': '坤宮',
        '상괘': '坤', '하괘': '乾', '상기호': '☷', '하기호': '☰', 
        '특별그룹': '육합괘', '그룹순서': 4, '그룹설명': '결합, 안정, 성사를 상징. 느리지만 확실한 진전'
    },
    '001111': {
        '이름': '雷天大壯', '궁': '坤宮', '세효': 4, '궁1': '乾宮', '궁2': '震宮',
        '상괘': '震', '하괘': '乾', '상기호': '☳', '하기호': '☰', 
        '특별그룹': None, '그룹순서': 5, '그룹설명': None
    },
    '011111': {
        '이름': '澤天夬', '궁': '坤宮', '세효': 5, '궁1': '乾宮', '궁2': '兌宮',
        '상괘': '兌', '하괘': '乾', '상기호': '☱', '하기호': '☰', 
        '특별그룹': None, '그룹순서': 6, '그룹설명': None
    },
    '010111': {
        '이름': '水天需', '궁': '坤宮', '세효': 4, '궁1': '乾宮', '궁2': '坎宮',
        '상괘': '坎', '하괘': '乾', '상기호': '☵', '하기호': '☰', 
        '특별그룹': None, '그룹순서': 7, '그룹설명': None
    },
    '010000': {
        '이름': '水地比', '궁': '坤宮', '세효': 3, '궁1': '坤宮', '궁2': '坎宮',
        '상괘': '坎', '하괘': '坤', '상기호': '☵', '하기호': '☷', 
        '특별그룹': None, '그룹순서': 8, '그룹설명': None
    }
}

SIX_SPIRITS = {
    '甲': '青龍', '乙': '青龍', '丙': '朱雀', '丁': '朱雀', '戊': '勾陈',
    '己': '螣蛇', '庚': '白虎', '辛': '白虎', '壬': '玄武', '癸': '玄武'
}

SIX_HARMONY = {
    '子': '丑', '丑': '子', '寅': '亥', '亥': '寅', '卯': '戌', '戌': '卯',
    '辰': '酉', '酉': '辰', '巳': '申', '申': '巳', '午': '未', '未': '午'
}

SIX_CLASH = {
    '子': '午', '午': '子', '丑': '未', '未': '丑', '寅': '申', '申': '寅',
    '卯': '酉', '酉': '卯', '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳'
}

# 괘신 계산을 위한 데이터
PALACE_TO_TRIGRAM = {
    '乾宮': '乾', '兌宮': '兌', '離宮': '離', '震宮': '震',
    '巽宮': '巽', '坎宮': '坎', '艮宮': '艮', '坤宮': '坤'
}

# 괘신 지지 계산 (궁별 괘신 지지)
GUA_SHEN_BRANCHES = {
    '乾宮': {'子': '丑', '寅': '卯', '辰': '巳', '午': '未', '申': '酉', '戌': '亥'},
    '兌宮': {'子': '丑', '寅': '卯', '辰': '巳', '午': '未', '申': '酉', '戌': '亥'},
    '離宮': {'子': '丑', '寅': '卯', '辰': '巳', '午': '未', '申': '酉', '戌': '亥'},
    '震宮': {'子': '丑', '寅': '卯', '辰': '巳', '午': '未', '申': '酉', '戌': '亥'},
    '巽宮': {'子': '丑', '寅': '卯', '辰': '巳', '午': '未', '申': '酉', '戌': '亥'},
    '坎宮': {'子': '丑', '寅': '卯', '辰': '巳', '午': '未', '申': '酉', '戌': '亥'},
    '艮宮': {'子': '丑', '寅': '卯', '辰': '巳', '午': '未', '申': '酉', '戌': '亥'},
    '坤宮': {'子': '丑', '寅': '卯', '辰': '巳', '午': '未', '申': '酉', '戌': '亥'}
}

# 일지에 의한 공망표 (旬空)
KONG_WANG_TABLE = {
    # 갑자순 (甲子旬)
    '甲子': ['戌', '亥'], '乙丑': ['戌', '亥'], '丙寅': ['戌', '亥'], '丁卯': ['戌', '亥'], '戊辰': ['戌', '亥'],
    '己巳': ['戌', '亥'], '庚午': ['戌', '亥'], '辛未': ['戌', '亥'], '壬申': ['戌', '亥'], '癸酉': ['戌', '亥'],
    
    # 갑술순 (甲戌旬)  
    '甲戌': ['申', '酉'], '乙亥': ['申', '酉'], '丙子': ['申', '酉'], '丁丑': ['申', '酉'], '戊寅': ['申', '酉'],
    '己卯': ['申', '酉'], '庚辰': ['申', '酉'], '辛巳': ['申', '酉'], '壬午': ['申', '酉'], '癸未': ['申', '酉'],
    
    # 갑신순 (甲申旬)
    '甲申': ['午', '未'], '乙酉': ['午', '未'], '丙戌': ['午', '未'], '丁亥': ['午', '未'], '戊子': ['午', '未'],
    '己丑': ['午', '未'], '庚寅': ['午', '未'], '辛卯': ['午', '未'], '壬辰': ['午', '未'], '癸巳': ['午', '未'],
    
    # 갑오순 (甲午旬)
    '甲午': ['辰', '巳'], '乙未': ['辰', '巳'], '丙申': ['辰', '巳'], '丁酉': ['辰', '巳'], '戊戌': ['辰', '巳'],
    '己亥': ['辰', '巳'], '庚子': ['辰', '巳'], '辛丑': ['辰', '巳'], '壬寅': ['辰', '巳'], '癸卯': ['辰', '巳'],
    
    # 갑진순 (甲辰旬)
    '甲辰': ['寅', '卯'], '乙巳': ['寅', '卯'], '丙午': ['寅', '卯'], '丁未': ['寅', '卯'], '戊申': ['寅', '卯'],
    '己酉': ['寅', '卯'], '庚戌': ['寅', '卯'], '辛亥': ['寅', '卯'], '壬子': ['寅', '卯'], '癸丑': ['寅', '卯'],
    
    # 갑인순 (甲寅旬)
    '甲寅': ['子', '丑'], '乙卯': ['子', '丑'], '丙辰': ['子', '丑'], '丁巳': ['子', '丑'], '戊午': ['子', '丑'],
    '己未': ['子', '丑'], '庚申': ['子', '丑'], '辛酉': ['子', '丑'], '壬戌': ['子', '丑'], '癸亥': ['子', '丑']
}

# 복신 계산을 위한 월건별 복신 지지
FU_SHEN_TABLE = {
    '寅': ['申', '巳', '亥'],  # 정월
    '卯': ['酉', '午', '子'],  # 이월  
    '辰': ['戌', '未', '丑'],  # 삼월
    '巳': ['亥', '申', '寅'],  # 사월
    '午': ['子', '酉', '卯'],  # 오월
    '未': ['丑', '戌', '辰'],  # 육월
    '申': ['寅', '亥', '巳'],  # 칠월
    '酉': ['卯', '子', '午'],  # 팔월
    '戌': ['辰', '丑', '未'],  # 구월
    '亥': ['巳', '寅', '申'],  # 십월
    '子': ['午', '卯', '酉'],  # 십일월
    '丑': ['未', '辰', '戌']   # 십이월
}

def calculate_kong_wang(day_stem, day_branch, hexagram_yao):
    """공망 계산"""
    try:
        day_ganzhi = day_stem + day_branch
        kong_wang_branches = KONG_WANG_TABLE.get(day_ganzhi, [])
        
        kong_wang_yao = []
        for yao in hexagram_yao:
            if yao['branch'] in kong_wang_branches:
                kong_wang_yao.append({
                    '효위': yao['yao_pos'],
                    '지지': yao['branch'],
                    '육친': yao['six_kin'],
                    '공망유형': '旬空',
                    '의미': '현재 힘을 발휘하지 못하나 충실시 응기됨'
                })
        
        return {
            '공망지지': kong_wang_branches,
            '공망효': kong_wang_yao,
            '공망수': len(kong_wang_yao)
        }
        
    except Exception as e:
        return {'공망지지': [], '공망효': [], '공망수': 0}

def calculate_fu_shen(month_branch, hexagram_yao, palace):
    """복신 계산"""
    try:
        # 월건에 따른 복신 지지 
        fu_shen_branches = FU_SHEN_TABLE.get(month_branch, [])
        
        # 괘에 없는 지지 중 복신 찾기
        hexagram_branches = [yao['branch'] for yao in hexagram_yao]
        missing_branches = []
        
        # 해당 궁의 전체 납갑 지지
        palace_branches = NAJIA_BRANCHES.get(palace, NAJIA_BRANCHES['乾宮'])
        
        for branch in palace_branches:
            if branch not in hexagram_branches:
                missing_branches.append(branch)
        
        # 복신 = 월건의 복신 지지 & 괘에 없는 지지
        fu_shen_list = []
        palace_element = PALACE_INFO.get(palace, {'오행': '金'})['오행']
        
        for branch in missing_branches:
            if branch in fu_shen_branches:
                branch_element = FIVE_ELEMENTS_BRANCH[branch]
                six_kin = calculate_six_kin(palace_element, branch_element)
                fu_shen_list.append({
                    '복신지지': branch,
                    '복신육친': six_kin,
                    '복신의미': get_fu_shen_meaning(six_kin),
                    '복신작용': '잠재된 도움, 때가 되면 나타남'
                })
        
        return {
            '복신목록': fu_shen_list,
            '복신수': len(fu_shen_list),
            '월건복신지지': fu_shen_branches
        }
        
    except Exception as e:
        return {'복신목록': [], '복신수': 0, '월건복신지지': []}

def get_fu_shen_meaning(six_kin):
    """복신 육친별 의미"""
    meanings = {
        '妻財': '잠재된 재물이나 이익, 숨겨진 수입원',
        '官鬼': '잠재된 권력이나 지위, 숨겨진 장애물',  
        '父母': '잠재된 도움이나 후원, 숨겨진 문서',
        '兄弟': '잠재된 경쟁이나 방해, 숨겨진 동료',
        '子孫': '잠재된 안전이나 기쁨, 숨겨진 해결책'
    }
    return meanings.get(six_kin, '잠재된 영향')

def analyze_yao_change_nature(original_yao):
    """효의 변화 성질 분석"""
    if original_yao == 6:  # 음동 → 양정
        return '음에서 양으로 전환 (陰變陽)'
    elif original_yao == 9:  # 양동 → 음정
        return '양에서 음으로 전환 (陽變陰)'
    else:
        return '변화 없음'

def analyze_changing_yao_detailed(yao_input, palace, palace_element, month_branch, hexagram_info, original_branches):
    """변효의 상세 분석 - 납갑, 육친, 괘신 등 (정확한 규칙)"""
    changing_yao_analysis = []
    
    # 변괘의 괘 코드 계산
    changing_code = get_changing_hexagram(yao_input)
    changing_info = HEXAGRAMS.get(changing_code, {})
    changing_palace = changing_info.get('궁', palace)
    changing_palace1 = changing_info.get('궁1', palace)  
    changing_palace2 = changing_info.get('궁2', palace)
    
    # 변괘의 납갑 지지 (정확한 규칙)
    changing_branches1 = NAJIA_BRANCHES.get(changing_palace1, NAJIA_BRANCHES['乾宮'])
    changing_branches2 = NAJIA_BRANCHES.get(changing_palace2, NAJIA_BRANCHES['乾宮']) 
    changing_branches = changing_branches1[:3] + changing_branches2[3:]  # 초효부터 상효까지 순서 (배열 그대로 유지)
    
    # 육친 계산은 본괘의 궁 오행(palace_element)으로만 한다 (변괘의 궁 오행은 사용하지 않음)
    
    for i in range(6):
        if yao_input[i] in [6, 9]:  # 동효만 분석
            yao_pos = i + 1  # 효위 (1~6, 초효부터 상효 순서)
            
            # 메인 계산과 동일한 방식으로 인덱스 계산
            yao_index = i  # 메인 계산과 동일한 인덱스 (초효부터 상효 순서)
            
            # 원효의 정보 (본괘 기준) - 메인 계산에서 전달받은 branches 사용
            original_branch = original_branches[yao_index]
            original_branch_element = FIVE_ELEMENTS_BRANCH[original_branch]
            # 본괘의 육친: 본괘의 궁 오행(palace_element)과 본괘의 납갑지지(original_branch_element)로 산출
            original_six_kin = calculate_six_kin(palace_element, original_branch_element)
            
            # 변효의 정보 (변괘 기준) 
            changing_branch = changing_branches[yao_index]
            changing_branch_element = FIVE_ELEMENTS_BRANCH[changing_branch]
            # 변괘의 육친: 본괘의 궁 오행(palace_element)과 변괘의 납갑지지(changing_branch_element)로 산출
            changing_six_kin = calculate_six_kin(palace_element, changing_branch_element)
            
            # 변효의 왕쇠 (현재 월건 기준)
            changing_wang_shuai = calculate_wang_shuai(month_branch, changing_branch_element)
            
            # 변화 성질 분석 
            change_nature = analyze_yao_change_nature(yao_input[i])
            change_meaning = get_changing_yao_meaning(yao_input[i], original_six_kin, changing_six_kin)
            
            changing_yao_analysis.append({
                '효위': yao_pos,
                '원지지': original_branch,
                '변지지': changing_branch, 
                '원육친': original_six_kin,
                '변육친': changing_six_kin,
                '변왕약': changing_wang_shuai,
                '변화성질': change_nature,
                '변효의미': change_meaning,
                '원효상태': f"{original_branch} {original_six_kin}",
                '변효상태': f"{changing_branch} {changing_six_kin}"
            })
    
    return changing_yao_analysis

def get_changing_yao_meaning(original_yao, original_kin, changing_kin):
    """변효의 의미 (육친 변화 중심)"""
    change_types = {
        6: '음동 → 양정',
        9: '양동 → 음정'
    }
    
    kin_change_meanings = {
        ('妻財', '妻財'): '재물 상황 유지되나 형태 변화',
        ('妻財', '官鬼'): '재물이 관재나 장애로 변화',
        ('妻財', '父母'): '재물이 문서나 부동산으로 변화',
        ('妻財', '兄弟'): '재물이 경쟁이나 분산으로 변화',
        ('妻財', '子孫'): '재물이 안전이나 기쁨으로 변화',
        
        ('官鬼', '妻財'): '장애나 관재가 재물 기회로 변화',
        ('官鬼', '官鬼'): '관재 상황 지속되나 성질 변화',
        ('官鬼', '父母'): '장애가 학습이나 후원으로 변화',
        ('官鬼', '兄弟'): '관재가 경쟁 상황으로 변화',
        ('官鬼', '子孫'): '장애가 해소되어 안정으로 변화',
        
        ('父母', '妻財'): '문서나 학습이 실질적 이익으로 변화',
        ('父母', '官鬼'): '후원이 압박이나 장애로 변화',
        ('父母', '父母'): '문서나 학습 상황 지속',
        ('父母', '兄弟'): '후원이 경쟁으로 변화',
        ('父母', '子孫'): '학습이나 후원이 성과로 변화',
        
        ('兄弟', '妻財'): '경쟁이나 분산이 이익으로 변화',
        ('兄弟', '官鬼'): '경쟁이 장애나 압박으로 변화',
        ('兄弟', '父母'): '분산이 집중이나 학습으로 변화',
        ('兄弟', '兄弟'): '경쟁 상황 지속',
        ('兄弟', '子孫'): '경쟁이 해소되어 안정으로 변화',
        
        ('子孫', '妻財'): '안정이나 기쁨이 실질적 이익으로 변화',
        ('子孫', '官鬼'): '안정이 깨져 장애나 압박으로 변화',
        ('子孫', '父母'): '기쁨이 학습이나 성장으로 변화',
        ('子孫', '兄弟'): '안정이 경쟁 상황으로 변화',
        ('子孫', '子孫'): '안정 상황 지속되나 형태 변화'
    }
    
    yao_type = change_types.get(original_yao, '변화 없음')
    kin_meaning = kin_change_meanings.get((original_kin, changing_kin), '일반적인 변화')
    
    return f"{yao_type} - {kin_meaning}"

def calculate_gua_shen(palace, day_branch, hexagram_yao):
    """괘신 계산 - 일진 지지와 육합하는 지지가 괘에 있으면 그 효가 괘신"""
    try:
        # 일진 지지 검증
        if not day_branch or day_branch not in SIX_HARMONY:
            return None
        
        # 일진 지지와 육합하는 지지 찾기
        harmony_branch = SIX_HARMONY.get(day_branch)
        if not harmony_branch:
            return None
        
        # 괘에서 해당 지지를 가진 효 찾기 (정확한 매칭)
        for yao in hexagram_yao:
            # branch 필드가 정확히 일치하는지 확인
            if yao.get('branch') == harmony_branch:
                return {
                    '괘신지지': harmony_branch,
                    '괘신효위': yao['yao_pos'],
                    '괘신육친': yao['six_kin'],
                    '괘신왕약': yao['wang_shuai'],
                    '괘신의미': get_gua_shen_meaning(yao['six_kin']),
                    '괘신작용': analyze_gua_shen_effect(yao['six_kin'], yao['wang_shuai'])
                }
        
        # 해당 지지가 괘에 없으면 None 반환 (괘신 없음)
        return None
        
    except Exception as e:
        return None

def get_gua_shen_meaning(six_kin):
    """괘신 육친별 의미"""
    meanings = {
        '妻財': '물질, 소유, 이익, 아내, 재물 문제',
        '官鬼': '직장, 명예, 관재, 질병, 남편, 공명',
        '父母': '문서, 계약, 학문, 부모, 윗사람',
        '兄弟': '경쟁자, 방해물, 동료, 형제',
        '子孫': '안정, 해악 제거, 기쁨, 자녀, 아랫사람'
    }
    return meanings.get(six_kin, '기타')

def analyze_gua_shen_effect(six_kin, wang_shuai):
    """괘신 작용 분석"""
    base_effects = {
        '妻財': '재물 획득의 용이성이나 결과적 이익',
        '官鬼': '일의 성패나 장애 유무',
        '父母': '근본적인 배경이나 문서 관련 성사 여부',
        '兄弟': '장애나 경쟁의 유무',
        '子孫': '재난이나 근심을 덜어주는 안정성'
    }
    
    wang_effects = {
        '旺': '활력 있고 내면적으로 강하며, 일이 순조롭게 풀릴 기반이 튼튼함',
        '相': '적당한 도움과 지원이 있어 안정적임',
        '休': '보통 수준의 영향력으로 큰 변화는 없음',
        '囚': '제약이 있어 영향력이 제한적임',
        '死': '허약하고 정서적 불안정, 실속이 없거나 쉽게 무산될 수 있음'
    }
    
    base = base_effects.get(six_kin, '일반적 영향')
    wang = wang_effects.get(wang_shuai, '보통')
    
    return f"{base} - {wang}"

# 납갑 계산 함수들
def get_hexagram_code(yao_input):
    """득괘 입력을 괘 코드로 변환"""
    code = ""
    for i in range(len(yao_input) - 1, -1, -1):
        yao = yao_input[i]
        if yao in [7, 9]:
            code += '1'
        elif yao in [6, 8]:
            code += '0'
    return code

def get_changing_hexagram(yao_input):
    """변괘 계산"""
    changing_yao = []
    for yao in yao_input:
        if yao == 6:
            changing_yao.append(7)
        elif yao == 9:
            changing_yao.append(8)
        else:
            changing_yao.append(yao)
    return get_hexagram_code(changing_yao)

def calculate_six_kin(palace_element, branch_element):
    """육친 계산
    - palace_element: 본괘의 궁 오행 (육친 계산 기준)
    - branch_element: 납갑지지의 오행 (본괘 또는 변괘의 납갑지지)
    """
    if palace_element == branch_element:
        return '兄弟'
    
    if ((palace_element == '木' and branch_element == '土') or
        (palace_element == '火' and branch_element == '金') or
        (palace_element == '土' and branch_element == '水') or
        (palace_element == '金' and branch_element == '木') or
        (palace_element == '水' and branch_element == '火')):
        return '妻財'
    
    if ((branch_element == '木' and palace_element == '土') or
        (branch_element == '火' and palace_element == '金') or
        (branch_element == '土' and palace_element == '水') or
        (branch_element == '金' and palace_element == '木') or
        (branch_element == '水' and palace_element == '火')):
        return '官鬼'
    
    if ((palace_element == '木' and branch_element == '火') or
        (palace_element == '火' and branch_element == '土') or
        (palace_element == '土' and branch_element == '金') or
        (palace_element == '金' and branch_element == '水') or
        (palace_element == '水' and branch_element == '木')):
        return '子孫'
    
    if ((branch_element == '木' and palace_element == '火') or
        (branch_element == '火' and palace_element == '土') or
        (branch_element == '土' and palace_element == '金') or
        (branch_element == '金' and palace_element == '水') or
        (branch_element == '水' and palace_element == '木')):
        return '父母'
    
    return '未定'

def calculate_wang_shuai(month_branch, branch_element):
    """왕쇠강약 계산"""
    month_element = FIVE_ELEMENTS_BRANCH[month_branch]
    
    if month_element == branch_element:
        return '旺'
    
    generate_map = {'木': '火', '火': '土', '土': '金', '金': '水', '水': '木'}
    if generate_map[month_element] == branch_element:
        return '相'
    
    if generate_map[branch_element] == month_element:
        return '休'
    
    dominate_map = {'木': '土', '火': '金', '土': '水', '金': '木', '水': '火'}
    if dominate_map[month_element] == branch_element:
        return '囚'
    
    if dominate_map[branch_element] == month_element:
        return '死'
    
    return '休'

def calculate_day_relation(day_branch, branch):
    """일진 관계 계산"""
    if day_branch == branch:
        return '値日'
    
    if SIX_HARMONY.get(day_branch) == branch:
        return '合日'
    
    if SIX_CLASH.get(day_branch) == branch:
        return '沖日'
    
    return '無關'

# Flask 라우트들
@app.route('/')
def index():
    return render_template('y6_exec.html')

@app.route('/current-saju')
def current_saju():
    """현재 시점의 사주 계산 (mainpillar.py 사용) - 정확한 시각 기준 (한국 시간대)"""
    try:
        # 한국 시간대(KST, UTC+9)로 현재 시각 가져오기
        if USE_ZONEINFO:
            # zoneinfo 사용 (Python 3.9+)
            kst = ZoneInfo('Asia/Seoul')
            now_utc = datetime.now(ZoneInfo('UTC'))
            now = now_utc.astimezone(kst)
        else:
            # pytz 사용 (Python 3.8 이하)
            kst = pytz.timezone('Asia/Seoul')
            now_utc = datetime.now(pytz.UTC)
            now = now_utc.astimezone(kst)
        
        # 시주 계산을 위한 정확한 시간 문자열 (분까지, 초는 반올림하여 분에 반영)
        # 예: 14:35:45 → 14:36 (초가 30 이상이면 분에 반올림)
        hour = now.hour
        minute = now.minute
        second = now.second
        
        # 초가 30 이상이면 분에 반올림 (정확한 시각 계산)
        if second >= 30:
            minute += 1
            if minute >= 60:
                minute = 0
                hour += 1
                if hour >= 24:
                    hour = 0
        
        # 정확한 시간 문자열 생성 (시주 계산용, naive datetime으로 변환)
        current_time = now.strftime('%Y-%m-%d') + f' {hour:02d}:{minute:02d}'
        
        # mainpillar.py의 calc_saju 함수 사용 (time_type='normal'로 정확한 시각 계산)
        saju_result = calc_saju(current_time, json_path='api/solar_terms.json', time_type='normal')
        
        # 현재 월지와 일간지 추출 (납갑 계산용)
        month_branch = saju_result['month'][1]  # 월지
        day_stem = saju_result['day'][0]        # 일간
        day_branch = saju_result['day'][1]      # 일지
        
        # 표시용 정확한 시각 (초 포함, 한국 시간대)
        formatted_time = now.strftime('%Y년 %m월 %d일 %H시 %M분 %S초 (KST)')
        
        return jsonify({
            'success': True,
            'saju': saju_result,
            'current_time': current_time,
            'month_branch': month_branch,
            'day_stem': day_stem,
            'day_branch': day_branch,
            'formatted_time': formatted_time
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/calculate-najia', methods=['POST'])
def calculate_najia():
    """수정된 납갑 계산 - 정확한 지지 계산과 상하괘 표시"""
    try:
        data = request.json
        yao_input = data.get('yao_input', [])
        yue_jian = data.get('yue_jian', '寅')
        ri_gan = data.get('ri_gan', '甲')
        ri_chen = data.get('ri_chen', '子')
        
        if not yao_input or len(yao_input) != 6:
            return jsonify({'success': False, 'error': '6개의 효가 필요합니다.'})
        
        # 괘 코드 및 정보 추출
        original_code = get_hexagram_code(yao_input)
        hexagram_info = HEXAGRAMS.get(original_code, {
            '이름': '알 수 없음', '궁': '乾宮', '세효': 3, 
            '궁1': '乾宮', '궁2': '乾宮',
            '상괘': '乾', '하괘': '乾', '상기호': '☰', '하기호': '☰',
            '특별그룹': None, '그룹순서': 1, '그룹설명': None
        })
        
        palace = hexagram_info['궁']
        palace1 = hexagram_info['궁1']
        palace2 = hexagram_info['궁2']
        
        # 표시용 궁명 (오행 포함)
        display_palace = PALACE_DISPLAY_MAP.get(palace, palace)
        
        # 정확한 납갑 지지 계산 (기존 구조 사용)
        # 육친 계산은 본괘의 궁 오행으로만 한다
        palace_element = PALACE_INFO.get(palace, {'오행': '金'})['오행']  # 본괘의 궁 오행 (육친 계산 기준)
        branches1 = NAJIA_BRANCHES.get(palace1, NAJIA_BRANCHES['乾宮'])
        branches2 = NAJIA_BRANCHES.get(palace2, NAJIA_BRANCHES['乾宮'])
        branches = branches1[:3] + branches2[3:]  # 초효부터 상효까지 순서 (배열 그대로 유지)
        
        se_yao_pos = hexagram_info['세효']
        
        # 변괘 정보
        changing_code = get_changing_hexagram(yao_input)
        changing_info = HEXAGRAMS.get(changing_code, hexagram_info)
        changing_display_palace = PALACE_DISPLAY_MAP.get(changing_info['궁'], changing_info['궁'])
        
        # 변괘의 궁 정보 (본괘와 동일한 구조)
        changing_palace = changing_info['궁']
        changing_palace1 = changing_info.get('궁1', changing_palace)
        changing_palace2 = changing_info.get('궁2', changing_palace)
        
        # 변괘의 납갑 지지 (본괘와 동일한 규칙 적용)
        changing_branches1 = NAJIA_BRANCHES.get(changing_palace1, NAJIA_BRANCHES['乾宮'])
        changing_branches2 = NAJIA_BRANCHES.get(changing_palace2, NAJIA_BRANCHES['乾宮'])
        changing_branches = changing_branches1[:3] + changing_branches2[3:]  # 초효부터 상효까지 순서 (배열 그대로 유지)
        
        # 육친 계산은 본괘의 궁 오행(palace_element)으로만 한다 (변괘의 궁 오행은 사용하지 않음)
        
        # 육신 배정
        start_spirit = SIX_SPIRITS.get(ri_gan, '青龍')
        spirit_order = ['青龍', '朱雀', '勾陈', '螣蛇', '白虎', '玄武']
        spirit_start_index = spirit_order.index(start_spirit)
        six_spirits_assigned = []
        for i in range(6):
            six_spirits_assigned.append(spirit_order[(spirit_start_index + i) % 6])
        
        # 변효의 육친 계산 (정확한 변괘 납갑 지지 사용)
        changing_yao_results = []
        
        for i in range(6):
            if yao_input[i] in [6, 9]:  # 동효만 처리
                yao_index = i  # 초효부터 상효까지의 인덱스 (메인 계산과 동일)
                changing_branch = changing_branches[yao_index]
                changing_branch_element = FIVE_ELEMENTS_BRANCH[changing_branch]
                # 변괘의 육친: 본괘의 궁 오행(palace_element)과 변괘의 납갑지지(changing_branch_element)로 산출
                changing_kin = calculate_six_kin(palace_element, changing_branch_element)
                changing_yao_results.append({
                    '효위_idx': yao_index,
                    '변지': changing_branch,
                    '변육친': changing_kin
                })
        
        # 최종 결과 생성 (초효부터 상효 순서)
        final_hexagram = []
        
        for i in range(6):
            yao_index = i  # 초효부터 상효까지
            yao_pos = i + 1    # 1효부터 6효까지
            
            status = yao_input[yao_index]
            branch = branches[yao_index]
            branch_element = FIVE_ELEMENTS_BRANCH[branch]
            
            wang_shuai = calculate_wang_shuai(yue_jian, branch_element)
            day_relation = calculate_day_relation(ri_chen, branch)
            # 본괘의 육친: 본괘의 궁 오행(palace_element)과 본괘의 납갑지지(branch_element)로 산출
            six_kin = calculate_six_kin(palace_element, branch_element)
            
            # 비고 (세효, 응효, 동효)
            note = ''
            if yao_pos == se_yao_pos:
                note += '世'
            
            # 응효 계산
            if se_yao_pos <= 3 and yao_pos == se_yao_pos + 3:
                note += '應'
            elif se_yao_pos > 3 and yao_pos == se_yao_pos - 3:
                note += '應'
            elif se_yao_pos == 6 and yao_pos == 3:
                note += '應'
            
            if status in [6, 9]:
                note += '動'
            
            # 변효 정보 (정확한 변괘 납갑 지지와 육친 사용)
            changing_info_str = ""
            if status in [6, 9]:  # 동효인 경우
                # changing_yao_results에서 해당 효 찾기
                found_changing = False
                for change in changing_yao_results:
                    if change['효위_idx'] == yao_index:
                        # 변괘의 납갑 지지와 육친 표시
                        changing_info_str = f"-> {change['변지']}({change['변육친']})"
                        found_changing = True
                        break
                # 매칭되는 변효 정보가 없으면 변괘의 납갑 지지 직접 계산
                if not found_changing:
                    changing_branch = changing_branches[yao_index]
                    changing_branch_element = FIVE_ELEMENTS_BRANCH[changing_branch]
                    # 변괘의 육친: 본괘의 궁 오행(palace_element)과 변괘의 납갑지지(changing_branch_element)로 산출
                    changing_kin = calculate_six_kin(palace_element, changing_branch_element)
                    changing_info_str = f"-> {changing_branch}({changing_kin})"
            else:
                changing_info_str = "靜爻"
            
            final_hexagram.append({
                'yao_pos': yao_pos,
                'status': status,
                'note': note,
                'six_kin': six_kin,
                'branch': branch,
                'spirit': six_spirits_assigned[yao_index],
                'wang_shuai': wang_shuai,
                'day_relation': day_relation,
                'changing_info': changing_info_str
            })
        
        # 상하괘 표시 (위아래 2층 구조)
        original_symbols = f"{hexagram_info['상기호']}\n{hexagram_info['하기호']}"
        changing_symbols = f"{changing_info['상기호']}\n{changing_info['하기호']}"
        
        # 괘신 계산 추가
        gua_shen = calculate_gua_shen(palace, ri_chen, final_hexagram)
        
        # 공망 계산 추가
        kong_wang = calculate_kong_wang(ri_gan, ri_chen, final_hexagram)
        
        # 복신 계산 추가
        fu_shen = calculate_fu_shen(yue_jian, final_hexagram, palace)
        
        # 변효 상세 분석 추가 (원괘 정보 전달)
        changing_yao_detailed = analyze_changing_yao_detailed(
            yao_input, palace, palace_element, yue_jian, 
            hexagram_info, branches
        )
        
        result = {
            'main_info': f"{original_symbols} {hexagram_info['이름']} ({display_palace}) 之 {changing_symbols} {changing_info['이름']}",
            'base_info': {
                '월건': yue_jian,
                '일진': f'{ri_gan}{ri_chen}',
                '세효': hexagram_info['세효'],
                '본괘코드': original_code,
                '변괘코드': changing_code
            },
            'hexagram': final_hexagram,
            'gua_shen': gua_shen,  # 괘신 정보
            'kong_wang': kong_wang,  # 공망 정보 추가
            'fu_shen': fu_shen,  # 복신 정보 추가  
            'changing_yao_detailed': changing_yao_detailed,  # 변효 상세 분석 추가
            'special_analysis': {
                'original_type': hexagram_info['특별그룹'],
                'original_description': hexagram_info['그룹설명'],
                'changing_type': changing_info['특별그룹'],
                'changing_description': changing_info['그룹설명'],
                'original_trigrams': f"{hexagram_info['상괘']}({hexagram_info['상기호']}) + {hexagram_info['하괘']}({hexagram_info['하기호']})",
                'changing_trigrams': f"{changing_info['상괘']}({changing_info['상기호']}) + {changing_info['하괘']}({changing_info['하기호']})"
            }
        }
        
        return jsonify({'success': True, 'result': result})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    #app.run(debug=True, host='0.0.0.0', port=5000)
    app.run(host='127.0.0.1', port=5000, debug=True)
