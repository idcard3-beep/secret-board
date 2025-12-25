// 도움말 버튼 클릭 시 모달 표시
document.addEventListener('DOMContentLoaded', function () {
  var helpBtn = document.getElementById('helpBtn');
  var helpModal = document.getElementById('helpModal');
  if (helpBtn && helpModal) {
    helpBtn.addEventListener('click', function () {
      helpModal.style.display = 'flex';
    });
  }

  // 닫기 버튼 클릭 시 화면 닫기
  var closeBtn = document.getElementById('closeBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      // iframe 내부에서 실행 중인지 확인
      if (window.self !== window.top) {
        // iframe 내부에서 실행 중: 부모 창으로 돌아가기
        window.parent.postMessage('closeIframe', '*');
      } else {
        // 독립 창에서 실행 중: 창 닫기
        window.close();
      }
    });
  }
});
/* =========================
   0) CONFIG — 사이드바 초기 기본 펼침
   ========================= */
function slugify(s) {
  return s
    .replace(/\s+/g, '')
    .replace(/[^0-9A-Za-z\u3131-\uD79D\(\)\.\·\-&]/g, '');
}
const SIDEBAR_DEFAULT_OPEN = [slugify('사주명리')]; // 필요시 ["주역"] 등으로 수정

/* =========================
   1) DATA — (전문가 심화++) 필요시 여기만 편집
   ========================= */
const DATA = [
  {
    category: '사주명리',
    desc: '음양오행·천간지지·십성/격국으로 기질·환경·타이밍을 모델링. ‘균형 보정’과 ‘행동 전략’으로 귀결.',
    chips: [
      '신강/신약',
      '대운/세운',
      '십성/격국',
      '합·충·형·파·해',
      '용신 전략',
      '사건 캘린더',
    ],
    subs: [
      {
        title: '기본 이론',
        note: '오행·천간지지·십성',
        sections: [
          {
            id: '개요',
            label: '개요',
            content:
              '사주의 네 기둥(년·월·일·시)에 오행·음양·천지 상호작용을 중첩하여 구조를 도출.',
          },
          {
            id: '모델',
            label: '모델/원리',
            content: [
              '십성: 비겁/식상/재성/관성/인성의 역할 스펙트럼',
              '격국: 기본격→변격 판단 시 합·충·형 우선순위 매트릭스',
              '보정: 용신(보완), 기신(억제)의 균형 복원',
            ],
          },
          {
            id: '알고리즘',
            label: '해석 절차(알고리즘)',
            content: [
              '① 신강/신약 판정 → ② 격/통용 → ③ 용/기 설정 → ④ 합·충·형 평가 → ⑤ 행동전략',
            ],
          },
          {
            id: '판정',
            label: '판정 기준(지표)',
            content: [
              '십성 편중≥40% → 우선 보정 대상',
              '합/충 연속 2주기 이상 중첩 → 경계 이벤트',
              '용신 요소가 운에서 >50% 출현 → 기회 창',
            ],
          },
          {
            id: '사례',
            label: '사례/적용',
            content: [
              '신약+재성 과잉: 성과압↑ → 관성/인성 보강 루틴',
              '신강+비겁 과잉: 자율↑·규범 충돌 → 제약·리뷰 체계',
            ],
          },
          {
            id: '리스크',
            label: '리스크/편향',
            content: [
              '결정론/후광효과 경계',
              '해석자 블라인드 체크(동료 피드백) 도입',
            ],
          },
          {
            id: '체크',
            label: '실무 체크리스트',
            content: [
              '핵심 가정 문서화 → 결과 비교(예측/실제)',
              '분파 차이는 주석 병기',
            ],
          },
        ],
      },
      {
        title: '대운·세운',
        note: '타이밍/흐름 판정',
        defaultOpen: true,
        sections: [
          {
            id: '개요2',
            label: '개요',
            content:
              '대운=구조(10년), 세운=미시(연/월). 구조→미시→행동 순으로 계획.',
          },
          {
            id: '절차2',
            label: '판독 절차',
            content: [
              '① 대운의 용/기 여부·합/충 평가로 ‘장르’ 파악',
              '② 연·월 세운으로 이벤트 창 세분화',
              '③ 준비(자금/네트워크/역량)→실행→검토(회고)',
            ],
          },
          {
            id: '윈도2',
            label: '기회/경계 윈도우',
            content: [
              '용신 대운 + 용신 연(월) → 공격적 확장',
              '기신 대운 + 충/형 중첩 → 보수·리스크 축소',
            ],
          },
          {
            id: '지표2',
            label: '운영 지표/로그',
            content: [
              '결정 로그: 가설·결과·교훈 기록',
              '캘린더 태깅: 합/충/형/파 이벤트 라벨',
            ],
          },
          {
            id: '체크2',
            label: '체크리스트',
            content: [
              '대운 전환 전후 6~18개월: 의사결정 보류·파일럿',
              '변곡 2~3주 전: 선행 과제 80% 이상 완료',
            ],
          },
        ],
      },
      {
        title: '용신·격국',
        note: '균형/보정 전략',
        sections: [
          {
            id: '원리3',
            label: '원리',
            content:
              '과부족 오행을 ‘환경·역할·습관’ 3축에서 보정. 억제가 아니라 균형 회복.',
          },
          {
            id: '전략3',
            label: '전략 설계',
            content: [
              '환경: 팀/도메인/거주/근무시간',
              '역할: 리더/팔로워, 제작/감독, 대외/대내',
              '습관: 수면/식/운동/학습(4주 스프린트)',
            ],
          },
          {
            id: '사례3',
            label: '사례',
            content: [
              '목·화 부족(신약형): 창의·대외 과제 배치, 멘토링',
              '금·수 과잉(신강형): 규정/데드라인 강화',
            ],
          },
          {
            id: '메트릭3',
            label: '모니터링 지표',
            content: ['루틴 준수율·피로도·성과 변동폭', '분기별 리밸런싱 세션'],
          },
        ],
      },
      {
        title: '관계·궁합',
        note: '합/충 패턴',
        sections: [
          {
            id: '프레임4',
            label: '프레임',
            content: '상생이면 생산성↑, 상극이면 피로↑. 대운 교차는 경계.',
          },
          {
            id: '매트릭스4',
            label: '진단 매트릭스(2×2)',
            content: [
              '과업 적합(기술/규범) × 정서 적합(신뢰/소통)',
              '합/충 이벤트를 주기·강도로 수치화',
            ],
          },
          {
            id: '개입4',
            label: '개입',
            content: [
              '역할·권한·피드백 주기 재설계',
              '세운 변곡과 겹치면 중재/쿨다운',
            ],
          },
          {
            id: '지표4',
            label: '관계 지표',
            content: [
              '갈등 빈도·해결 시간, 몰입/소진 스코어',
              '피드백 순환주기 준수율',
            ],
          },
        ],
      },
    ],
  },
  {
    category: '주역',
    desc: '괘·효·변괘로 ‘변화 방향’과 ‘적정 대응’을 설계. 질문 명료화로 예지편향 최소화.',
    chips: [
      '괘상 해석',
      '효사/괘사',
      '변괘·합괘',
      '질문 설계',
      '리스크 관리',
      '결정 로그',
    ],
    subs: [
      {
        title: '육효(六爻)',
        note: '시점별 판정',
        sections: [
          {
            id: '개요5',
            label: '개요',
            content:
              '시간성을 가진 의사결정 보조도구. 동/정, 응/세, 일진/공망을 통합 판독.',
          },
          {
            id: '절차5',
            label: '해석 절차',
            content: [
              '① 질문 단일화(조건/기한/성공 기준)',
              '② 효 판독(동·정, 생극/충극, 공망/일진)',
              '③ 응·세 축의 역동성(주도/타이밍)',
              '④ 변괘/합괘로 결과 경향 예측',
            ],
          },
          {
            id: '판정5',
            label: '판정 규칙(예시)',
            content: [
              '응 강·세 약 → 외부 변수 주도(추가 트리거 필요)',
              '공망+일진 충 → 지연/보류 가능성↑',
              '용신 효 생조 & 원신 방해 적음 → 추진 신호',
            ],
          },
          {
            id: '사례5',
            label: '사례/적용',
            content: [
              '프로젝트 Go/No-Go: 건→태 전환 구간에 자원 보강 후 추진',
              '채용: 재성 과잉이면 기대치·보상 재조정',
            ],
          },
          {
            id: '체크5',
            label: '체크/리스크',
            content: [
              '사후합리화 방지: 선행 가설 기록',
              '다중 질문 금지: 1질문 1판정',
            ],
          },
        ],
      },
      {
        title: '자미두수(紫微斗數)',
        note: '명반/궁성',
        defaultOpen: true,
        sections: [
          {
            id: '개요6',
            label: '개요',
            content:
              '주성(자미·천기·태양)+보좌성, 12궁 상호전이를 통합해 커리어/관계/건강 전략 설계.',
          },
          {
            id: '프레임6',
            label: '해석 프레임',
            content: [
              '주성(핵심 동력)↔부성(보정 장치) 상호작용',
              '궁간 이동과 운의 교차에서 역할 전환 포인트 식별',
            ],
          },
          {
            id: '판정6',
            label: '판정 기준',
            content: [
              '명궁·관록·재백·복덕 밸런싱 60/40 이내 → 안정',
              '대운: 명궁 보강 + 연운: 관록 강화 → 승진/전환 창',
            ],
          },
          {
            id: '체크6',
            label: '체크리스트',
            content: [
              '명궁-복덕 불균형: 회복탄력 루틴 도입',
              '형제/노복궁 과잉 개입: 경계·역할 정의',
            ],
          },
          {
            id: '주석6',
            label: '학파 차이/주석',
            content: '배치/해석 분파 차이는 주석 병기, 케이스에 병렬 표기.',
          },
        ],
      },
      {
        title: '기문둔갑',
        note: '전략·배치',
        sections: [
          {
            id: '개요7',
            label: '개요',
            content:
              '천·지·인반, 9궁 배치로 시공간 유불리를 평가. ‘배치×타이밍’의 곱이 효과를 좌우.',
          },
          {
            id: '모델7',
            label: '모델/원리',
            content: [
              '문/성/신 상호작용으로 경로비용 최소화',
              '길흉문 배치에 따른 좌석·동선·순서 최적화',
            ],
          },
          {
            id: '적용7',
            label: '적용',
            content: [
              '협상: 길문 방향 발표/착석, 흉문은 백업 경로',
              '출시: 시문 강한 시간대에 PR 집중',
            ],
          },
          {
            id: '체크7',
            label: '리스크/체크',
            content: [
              '상징 과도화 금지, 예산·시간 제약과 결합',
              '실험 계획: 사전 가설→실행→후검증',
            ],
          },
        ],
      },
      {
        title: '매화역수',
        note: '간명/직관',
        sections: [
          {
            id: '개요8',
            label: '개요',
            content:
              '시간·공간·숫자 신호에서 핵심 상징을 추출해 간명하게 판단.',
          },
          {
            id: '절차8',
            label: '절차/가이드',
            content: [
              '핵심 상징 2~3개만 제한(과적합 방지)',
              '유사사례 대조로 재현성 검토',
            ],
          },
          {
            id: '활용8',
            label: '활용',
            content: '짧은 의사결정·일상 선택·초심자 교육 프레임.',
          },
          {
            id: '체크8',
            label: '체크',
            content: [
              '확증편향 경계, 결과 기록',
              '상징 충돌 시 연결고리 없는 요소 제거',
            ],
          },
        ],
      },
      {
        title: '정역/체용',
        note: '이론 심화',
        sections: [
          {
            id: '프레임9',
            label: '체·용 프레임',
            content:
              '체(불변)와 용(가변)을 분리해 불확실성 하에서 옵션성 유지.',
          },
          {
            id: '현대9',
            label: '현대적 적용',
            content: [
              '시뮬레이션(what-if) + 실험적 접근',
              '오류 비용 큰 상황: 복수 옵션 병행',
            ],
          },
          {
            id: '체크9',
            label: '체크',
            content: [
              '체 가정 변경 시, 모든 용 시나리오 재평가',
              '용 시나리오 2개 이상 병행 운영',
            ],
          },
        ],
      },
    ],
  },
  {
    category: '관상·수상·풍수',
    desc: '형태·비율·배치를 편향 없이 관찰해 경향성을 추정. 목적은 상징 단정이 아닌 환경/행동 개선.',
    chips: [
      '비율/각도',
      '손금/형상',
      '배치/동선',
      '편향 최소화',
      '실용 결합',
      '측정 지표',
    ],
    subs: [
      {
        title: '관상(Physiognomy)',
        note: '이목구비/비율',
        sections: [
          {
            id: '개요10',
            label: '개요',
            content:
              '상·중·하정 비율·대칭성·각도/볼륨 지표로 에너지 분배 경향을 관찰(문화·생물 다양성 고려).',
          },
          {
            id: '진단10',
            label: '진단 포인트',
            content: [
              '상정(비전/인지)·중정(실행/소통)·하정(지지/지구력)의 균형',
              '비대칭 크면 보정: 포즈·조명·렌즈 왜곡·스트레스 변수 확인',
            ],
          },
          {
            id: '활용10',
            label: '활용',
            content: [
              '대외 이미지/소통 전략 조정',
              '피로/스트레스 신호 감지→자기관리 루틴',
            ],
          },
          {
            id: '윤리10',
            label: '윤리/편향',
            content: [
              '고정관념·차별 유발 금지',
              '추정은 경향성일 뿐 단정 금지',
            ],
          },
        ],
      },
      {
        title: '수상(Palmistry)',
        note: '생명/심장/두뇌선',
        sections: [
          {
            id: '개요11',
            label: '개요',
            content:
              '선(길이·깊이·분지·교차)+형태/온기 등 촉각 정보로 에너지/스트레스 경향 추정.',
          },
          {
            id: '판정11',
            label: '판정 기준',
            content: [
              '심장선 단절·분지 과다 → 정서 기복·대인 피로',
              '두뇌선 섬세·장거리 → 몰입/지연 경향(마감 관리)',
            ],
          },
          {
            id: '활용11',
            label: '활용',
            content: [
              '수면·호흡·운동 루틴 추천',
              '업무 배치(집중 vs 상호작용) 조정',
            ],
          },
          {
            id: '체크11',
            label: '체크/윤리',
            content: ['예언 금지, 생활디자인 보조 강조', '개인 민감정보 보호'],
          },
        ],
      },
      {
        title: '풍수(Feng Shui)',
        note: '채광/통풍/동선',
        sections: [
          {
            id: '개요12',
            label: '개요',
            content: '채광·통풍·소음·동선 품질을 개선해 집중/회복 기반 구축.',
          },
          {
            id: '알고리즘12',
            label: '개선 알고리즘',
            content: [
              '① 문제 정의(빛/공기/소음/동선)',
              '② 레이아웃 시뮬레이션(충돌/거리 최소)',
              '③ 미세 튜닝(식물·흡음·색온도·패브릭)',
            ],
          },
          {
            id: '지표12',
            label: '측정 지표',
            content: [
              '조도(lux)/환기(CO₂ ppm)/소음(dB)/동선 충돌(건·일)',
              '2주 간격 측정→개선',
            ],
          },
          {
            id: '체크12',
            label: '체크/주의',
            content: ['심미성>기능 역전 금지', '과도한 상징 해석 금지'],
          },
        ],
      },
    ],
  },
  {
    category: '심리상담 & 심리치유',
    desc: '진단–개입–평가를 표준화. 역학 해석은 상담 가설 보조로 제한. 안전·윤리 우선.',
    chips: [
      'CBT',
      '정신역동',
      'EMDR/노출',
      '평가도구',
      '윤리/안전',
      '성과 지표',
    ],
    subs: [
      {
        title: '인지행동치유(CBT)',
        note: '재구조화/노출/실험',
        sections: [
          {
            id: '개요13',
            label: '개요',
            content:
              '자동사고–핵심신념–행동의 연결을 가설화, 실험으로 검증/수정.',
          },
          {
            id: '기법13',
            label: '핵심 기법',
            content: [
              '인지 재구성(증거·대안·이득/손실 분석)',
              '행동 실험(예측→실행→측정→학습)',
              '노출/반응방지(회피 루프 해체)',
            ],
          },
          {
            id: '프로토콜13',
            label: '프로토콜/지표',
            content: [
              '세션 목표, 과제 이행률, 증상 점수(BDI/BAI 등)',
              '행동 활성화: 주당 활동량/만족도',
            ],
          },
          {
            id: '체크13',
            label: '리스크/주의',
            content: [
              '자가노출 시 안전계획·역치 관리',
              '복합 외상: 안정화→처리→통합 단계',
            ],
          },
        ],
      },
      {
        title: '정신역동적 치유',
        note: '패턴/통찰',
        defaultOpen: true,
        sections: [
          {
            id: '개요14',
            label: '개요',
            content:
              '초기 관계 경험과 반복 패턴 탐색. ‘느낌–의미–행동’ 연결 재구성.',
          },
          {
            id: '작업14',
            label: '핵심 작업',
            content: [
              '전이/역전이 인식·활용(여기-지금)',
              '방어기제 식별→적응적 방어로 전환',
              '정서명명·메타인지 확장',
            ],
          },
          {
            id: '지표14',
            label: '성과 지표',
            content: [
              '갈등 빈도·해결 시간, 자존감 변동폭',
              '세션 내 통찰/정서표현 빈도',
            ],
          },
          {
            id: '윤리14',
            label: '윤리/경계',
            content: [
              '역학 프레임과 치유 프레임 혼선 금지',
              '치유적 결정은 임상 기준 우선',
            ],
          },
        ],
      },
      {
        title: 'EMDR·노출치유',
        note: '외상/탈감작',
        sections: [
          {
            id: '단계15',
            label: '단계',
            content: '안정화→표적 선정→재처리→통합. 접촉·안전 신호 사전 구축.',
          },
          {
            id: '프로토콜15',
            label: '프로토콜/지표',
            content: [
              'SUDS/VOC 추적, 플래시백 빈도·강도',
              '노출 계층표 작성→점진적 상승',
            ],
          },
          {
            id: '체크15',
            label: '리스크/주의',
            content: [
              '재외상화 방지(진정 스킬 확보 후 진행)',
              '세션 종료 전 안정화 루틴 필수',
            ],
          },
        ],
      },
      {
        title: '평가도구/프로토콜',
        note: 'MMPI/BDI/DSM-5',
        sections: [
          {
            id: '도구16',
            label: '도구',
            content: '표준화 검사+임상면담+행동지표(다원적)로 진단·계획 보강.',
          },
          {
            id: '운영16',
            label: '운영 체크리스트',
            content: [
              '동의·비밀보장·경계 명시',
              '목표–지표–주기(2~4주) 설정·리뷰',
            ],
          },
          {
            id: '윤리16',
            label: '윤리/데이터',
            content: [
              '민감정보 최소 수집·보관주기 명시',
              '임상적 한계·의뢰 기준 투명화',
            ],
          },
        ],
      },
    ],
  },
];

/* =========================
   2) RENDER & NAV
   ========================= */
const app = document.getElementById('app');
const sideNav = document.getElementById('sideNav');
const catPills = document.getElementById('catPills');

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function')
      el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  });
  children.flat().forEach((c) => {
    if (c == null) return;
    if (typeof c === 'string') el.appendChild(document.createTextNode(c));
    else el.appendChild(c);
  });
  return el;
}
function anchor(cat, sub) {
  return slugify(cat) + '-' + slugify(sub);
}

function renderContent() {
  app.innerHTML = '';
  DATA.forEach((cat) => {
    const box = h('div', {
      class: 'category',
      'data-cat': slugify(cat.category),
    });
    const head = h(
      'div',
      { class: 'cat-header', tabindex: '0' },
      h('div', { class: 'cat-title' }, cat.category),
      h('div', { class: 'muted' }, '— ', cat.desc.split('.')[0]),
      h('svg', {
        class: 'chev',
        width: '18',
        height: '18',
        viewBox: '0 0 24 24',
        html: '<path fill="currentColor" d="M6 9l6 6 6-6"/>',
      })
    );
    const panel = h('div', { class: 'cat-panel' });
    const desc = h('div', { class: 'cat-desc' }, cat.desc);
    const bar = h(
      'div',
      { class: 'toolbar' },
      ...(cat.chips || []).map((c) => h('span', { class: 'chip' }, c))
    );
    const subWrap = h('div', { class: 'sub' });

    (cat.subs || []).forEach((sub) => {
      const id = anchor(cat.category, sub.title);
      const btn = h('button', {
        class: 'sub-acc',
        id: 'a-' + id,
        'data-anchor': id,
      });
      btn.append(
        h('span', { class: 'sub-title' }, sub.title),
        h('span', { class: 'sub-note' }, sub.note || ''),
        h('svg', {
          class: 'sub-chevron',
          width: '16',
          height: '16',
          viewBox: '0 0 24 24',
          html: '<path fill="currentColor" d="M6 9l6 6 6-6"/>',
        })
      );
      if (sub.defaultOpen) btn.setAttribute('data-default-open', '');

      const sp = h('div', { class: 'sub-panel', 'data-anchor': id });
      const sc = h('div', { class: 'sub-content' });
      const toc = h('div', { class: 'toc' });
      sc.appendChild(toc);
      (sub.sections || []).forEach((sec) => {
        toc.appendChild(h('a', { href: '#' + slugify(sec.id) }, sec.label));
      });
      (sub.sections || []).forEach((sec) => {
        sc.appendChild(h('h4', { id: slugify(sec.id) }, sec.label));
        if (Array.isArray(sec.content)) {
          const ul = h(
            'ul',
            null,
            sec.content.map((x) => h('li', null, x))
          );
          sc.appendChild(ul);
        } else {
          sc.appendChild(h('p', null, sec.content));
        }
      });
      sp.appendChild(sc);
      subWrap.append(btn, sp);
    });

    panel.append(desc, bar, subWrap);
    box.append(head, panel);
    app.appendChild(box);
  });
}

function renderTopPills() {
  catPills.innerHTML = '';
  DATA.forEach((cat, idx) => {
    const p = h(
      'button',
      { class: 'pill', 'data-cat': slugify(cat.category) },
      cat.category
    );
    if (idx === 0) p.classList.add('active');
    p.addEventListener('click', () => {
      document
        .querySelectorAll('.pill')
        .forEach((x) => x.classList.remove('active'));
      p.classList.add('active');
      const box = document.querySelector(
        `.category[data-cat="${slugify(cat.category)}"]`
      );
      const head = box.querySelector('.cat-header');
      openPanel(box.querySelector('.cat-panel'), head);
      box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    catPills.appendChild(p);
  });
}

function openSidebarCat(catKey, exclusive = true) {
  const target = Array.from(document.querySelectorAll('.s-cat')).find(
    (c) => c.dataset.cat === catKey
  );
  if (!target) return;
  if (exclusive) {
    document.querySelectorAll('.s-cat').forEach((c) => {
      if (c !== target) c.classList.remove('open');
    });
  }
  target.classList.toggle('open');
}

function renderSideNav() {
  sideNav.innerHTML = '';
  DATA.forEach((cat) => {
    const catKey = slugify(cat.category);
    const wrap = h('div', { class: 's-cat', 'data-cat': catKey });
    const head = h(
      'div',
      { class: 's-cat-head', tabindex: '0', title: '중분류 보기/숨기기' },
      h('span', { class: 'dot' }),
      h('span', { class: 'label' }, cat.category),
      h('svg', {
        class: 'chev',
        width: '14',
        height: '14',
        viewBox: '0 0 24 24',
        html: '<path fill="currentColor" d="M9 6l6 6-6 6"/>',
      })
    );
    head.addEventListener('click', () => openSidebarCat(catKey, true));
    head.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openSidebarCat(catKey, true);
      }
    });

    const subs = h('div', { class: 's-sub' });
    (cat.subs || []).forEach((sub) => {
      const id = anchor(cat.category, sub.title);
      const link = h(
        'a',
        { href: '#', 'data-anchor': id, class: 's-link' },
        sub.title
      );
      link.addEventListener('click', (e) => {
        e.preventDefault();
        // 아코디언 유지: 해당 카테고리만 열기
        document
          .querySelectorAll('.s-cat')
          .forEach((c) => c.classList.remove('open'));
        wrap.classList.add('open');
        openByAnchor(id, true);
      });
      subs.appendChild(link);
    });
    wrap.append(head, subs);
    sideNav.appendChild(wrap);
  });
}

/* =========================
   3) INTERACTIONS
   ========================= */
function togglePanel(panel, btn) {
  const isOpen = panel.style.maxHeight && panel.style.maxHeight !== '0px';
  if (isOpen) {
    closePanel(panel, btn);
  } else {
    openPanel(panel, btn);
  }
}
function openPanel(panel, btn) {
  if (panel) {
    panel.style.maxHeight = panel.scrollHeight + 'px';
  }
  if (btn) {
    btn.classList.add('open');
  }
}
function closePanel(panel, btn) {
  if (panel) {
    panel.style.maxHeight = null;
  }
  if (btn) {
    btn.classList.remove('open');
  }
}
function openDefaults() {
  console.log('📂 기본 펼침 항목 열기 시작');
  const defaultBtns = document.querySelectorAll('.sub-acc[data-default-open]');
  console.log(`🔍 기본 펼침 항목 개수: ${defaultBtns.length}`);

  defaultBtns.forEach((btn) => {
    const panel = btn.nextElementSibling;

    // 서브 아코디언 펼치기
    if (panel && panel.classList.contains('sub-panel')) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      btn.classList.add('open');
      const subChev = btn.querySelector('.sub-chevron');
      if (subChev) subChev.style.transform = 'rotate(180deg)';
    }

    // 상위 카테고리도 펼치기
    const catPanel = btn.closest('.cat-panel');
    if (catPanel) {
      const catHead = catPanel.previousElementSibling;
      if (catHead && catHead.classList.contains('cat-header')) {
        catPanel.style.maxHeight = catPanel.scrollHeight + 'px';
        catHead.classList.add('open');
        const chev = catHead.querySelector('.chev');
        if (chev) chev.style.transform = 'rotate(180deg)';
      }
    }
  });

  console.log('✅ 기본 펼침 항목 열기 완료');
}

const q = document.getElementById('q');
function stripMarks(el) {
  el.querySelectorAll('mark').forEach((m) => {
    const parent = m.parentNode;
    parent.replaceChild(document.createTextNode(m.textContent), m);
    parent.normalize();
  });
}
function highlightText(el, term) {
  if (!term) return;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const p = n.parentNode?.tagName;
      if (p === 'SCRIPT' || p === 'STYLE') return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => {
    const t = n.nodeValue;
    if (!re.test(t)) return;
    const frag = document.createDocumentFragment();
    let last = 0;
    t.replace(re, (m, i) => {
      frag.appendChild(document.createTextNode(t.slice(last, i)));
      const mark = document.createElement('mark');
      mark.textContent = m;
      frag.appendChild(mark);
      last = i + m.length;
    });
    frag.appendChild(document.createTextNode(t.slice(last)));
    n.parentNode.replaceChild(frag, n);
  });
}
function setCount(text) {
  let c = document.querySelector('.top .count');
  if (!c) {
    c = document.createElement('div');
    c.className = 'count';
    document.querySelector('.top-inner').appendChild(c);
  }
  c.textContent = text;
}
function filter() {
  const term = q.value.trim();
  let shown = 0;
  document
    .querySelectorAll('.sub-content,.sub-acc,.cat-header,.cat-panel')
    .forEach((el) => el.classList.remove('hide'));
  document.querySelectorAll('.sub-content').forEach(stripMarks);
  if (!term) {
    document
      .querySelectorAll('.sub-acc:not([data-default-open])')
      .forEach((b) => closePanel(b.nextElementSibling, b));
    document.querySelectorAll('.category').forEach((cat) => {
      const p = cat.querySelector('.cat-panel');
      if (p && p.style.maxHeight) {
        p.style.maxHeight = p.scrollHeight + 'px';
      }
    });
    // setCount('전체 표시') 제거: 전체 표시 버튼 기능 삭제
    saveState();
    return;
  }
  document.querySelectorAll('.category').forEach((cat) => {
    let catHit = false;
    cat.querySelectorAll('.sub-acc').forEach((btn) => {
      const panel = btn.nextElementSibling;
      const hay = (btn.textContent + ' ' + panel.textContent).toLowerCase();
      const hit = hay.includes(term.toLowerCase());
      if (hit) {
        btn.classList.remove('hide');
        panel.classList.remove('hide');
        openPanel(panel, btn);
        highlightText(panel, term);
        highlightText(btn, term);
        catHit = true;
        shown++;
      } else {
        btn.classList.add('hide');
        panel.classList.add('hide');
        closePanel(panel, btn);
      }
    });
    const head = cat.querySelector('.cat-header');
    const p = cat.querySelector('.cat-panel');
    if (catHit) {
      head.classList.remove('hide');
      openPanel(p, head);
    } else {
      head.classList.add('hide');
      p.classList.add('hide');
      closePanel(p, head);
    }
  });
  setCount(shown ? `일치 항목: ${shown}개 중분류` : '일치 없음');
  saveState();
}
q.addEventListener('input', filter);
q.addEventListener('change', filter);
window.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    q.focus();
  }
});

document.getElementById('btn-expand').onclick = expandAll;
document.getElementById('btn-collapse').onclick = collapseAll;
document.getElementById('btn-reset').onclick = function () {
  console.log('🔄 기본 펼침으로 리셋 시작');

  // 1. 먼저 모두 접기
  collapseAll();

  // 2. 잠시 대기 후 기본 펼침 적용
  setTimeout(() => {
    openDefaults();
    console.log('✅ 기본 펼침 완료');
  }, 100);

  // 3. 검색어 초기화
  q.value = '';

  // 4. URL 해시 제거
  history.pushState(
    '',
    document.title,
    window.location.pathname + window.location.search
  );

  // 5. 상태 저장
  setTimeout(() => {
    saveState();
  }, 150);
};

/* 사이드바 컨트롤: 본문 모두 펼치기/접기 */
document.getElementById('sideExpand').onclick = expandAll;
document.getElementById('sideCollapse').onclick = collapseAll;

function expandAll() {
  console.log('🔓 모두 펼치기 시작');
  document.querySelectorAll('.category').forEach((cat) => {
    const catPanel = cat.querySelector('.cat-panel');
    const catHeader = cat.querySelector('.cat-header');

    // 카테고리 펼치기
    if (catPanel && catHeader) {
      catPanel.style.maxHeight = catPanel.scrollHeight + 'px';
      catHeader.classList.add('open');
      const chev = catHeader.querySelector('.chev');
      if (chev) chev.style.transform = 'rotate(180deg)';
    }

    // 모든 서브 아코디언 펼치기
    cat.querySelectorAll('.sub-acc').forEach((btn) => {
      const panel = btn.nextElementSibling;
      if (panel && panel.classList.contains('sub-panel')) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.classList.add('open');
        const subChev = btn.querySelector('.sub-chevron');
        if (subChev) subChev.style.transform = 'rotate(180deg)';
      }
    });
  });
  console.log('✅ 모두 펼치기 완료');
  saveState();
}

function collapseAll() {
  console.log('🔒 모두 접기 시작');
  document.querySelectorAll('.category').forEach((cat) => {
    const catPanel = cat.querySelector('.cat-panel');
    const catHeader = cat.querySelector('.cat-header');

    // 모든 서브 아코디언 먼저 접기
    cat.querySelectorAll('.sub-acc').forEach((btn) => {
      const panel = btn.nextElementSibling;
      if (panel && panel.classList.contains('sub-panel')) {
        panel.style.maxHeight = '0';
        btn.classList.remove('open');
        const subChev = btn.querySelector('.sub-chevron');
        if (subChev) subChev.style.transform = 'rotate(0deg)';
      }
    });

    // 카테고리 접기
    if (catPanel && catHeader) {
      catPanel.style.maxHeight = '0';
      catHeader.classList.remove('open');
      const chev = catHeader.querySelector('.chev');
      if (chev) chev.style.transform = 'rotate(0deg)';
    }
  });
  console.log('✅ 모두 접기 완료');
  saveState();
}

/* 딥링크 */
function openByHash() {
  const h = decodeURIComponent(location.hash || '').replace(/^#/, '');
  if (!h) return false;
  return openByAnchor(h, true, true);
}
function openByAnchor(id, scroll, updateHash) {
  const btn = document.querySelector(`.sub-acc[data-anchor="${id}"]`);
  if (!btn) return false;
  const catPanel = btn.closest('.cat-panel');
  const catHead = catPanel.previousElementSibling;
  openPanel(catPanel, catHead);
  openPanel(btn.nextElementSibling, btn);
  if (scroll) {
    document.getElementById('sidebar')?.classList.remove('open');
    scrollInto(btn);
  }
  if (updateHash) location.hash = '#' + id;
  // 사이드바 아코디언: 현재 카테고리만 펼침
  const catKey = id.split('-')[0];
  document
    .querySelectorAll('.s-cat')
    .forEach((c) => c.classList.toggle('open', c.dataset.cat === catKey));
  saveState();
  setActiveAnchor(id);
  return true;
}
function scrollInto(el) {
  const topPad = 130;
  const r = el.getBoundingClientRect();
  window.scrollTo({
    top: window.scrollY + r.top - topPad,
    behavior: 'smooth',
  });
}
window.addEventListener('hashchange', () => {
  if (openByHash()) saveState();
});

/* 사이드바 & 상단 활성 표시 (스크롤스파이 연동) */
let currentAnchor = '';
function setActiveAnchor(id) {
  currentAnchor = id;
  document
    .querySelectorAll('.s-link')
    .forEach((l) => l.classList.toggle('active', l.dataset.anchor === id));
  if (id) {
    const catKey = id.split('-')[0];
    document.querySelectorAll('.s-cat').forEach((c) => {
      c.classList.toggle('active', c.dataset.cat === catKey);
      // 아코디언: 선택된 것만 open
      c.classList.toggle('open', c.dataset.cat === catKey);
    });
    document
      .querySelectorAll('.pill')
      .forEach((p) => p.classList.toggle('active', p.dataset.cat === catKey));
    document
      .querySelectorAll('.sub-acc')
      .forEach((b) => b.classList.toggle('focus', b.dataset.anchor === id));
  }
}
function highlightActiveNav() {
  setActiveAnchor(
    currentAnchor || decodeURIComponent(location.hash || '').replace(/^#/, '')
  );
}

/* 테마 토글 */
const themeBtn = document.getElementById('themeBtn');
const THEME_KEY = 'lifetree_theme_v1';
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch (e) {}
}
function nextTheme(cur) {
  const order = ['light', 'dark', 'pastel'];
  const i = Math.max(0, order.indexOf(cur));
  return order[(i + 1) % order.length];
}
themeBtn.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(nextTheme(cur));
});

/* 상태 저장 */
const LS_KEY = 'lifetree_state_v8';
function saveState() {
  const openSubs = Array.from(document.querySelectorAll('.sub-acc.open')).map(
    (b) => b.dataset.anchor
  );
  const openCats = Array.from(document.querySelectorAll('.cat-header.open'))
    .map((h) => h.parentElement.querySelector('.cat-title').textContent.trim())
    .map(slugify);
  const theme = document.documentElement.getAttribute('data-theme');
  const qVal = q.value;
  const openSideCats = Array.from(document.querySelectorAll('.s-cat.open')).map(
    (el) => el.dataset.cat
  );
  try {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        openSubs,
        openCats,
        q: qVal,
        theme,
        anchor: currentAnchor,
        openSideCats,
      })
    );
  } catch (e) {}
}
function restoreState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      // 저장 상태 없으면 기본 펼침 적용
      document.querySelectorAll('.s-cat').forEach((c) => {
        c.classList.toggle(
          'open',
          SIDEBAR_DEFAULT_OPEN.includes(c.dataset.cat)
        );
      });
      return false;
    }
    const st = JSON.parse(raw);
    setTheme('light');
    if (st.q) q.value = st.q;
    document.querySelectorAll('.category').forEach((cat) => {
      closePanel(
        cat.querySelector('.cat-panel'),
        cat.querySelector('.cat-header')
      );
      cat
        .querySelectorAll('.sub-acc')
        .forEach((b) => closePanel(b.nextElementSibling, b));
    });
    if (st.openCats?.length) {
      document.querySelectorAll('.category').forEach((cat) => {
        const title = slugify(
          cat.querySelector('.cat-title').textContent.trim()
        );
        if (st.openCats.includes(title))
          openPanel(
            cat.querySelector('.cat-panel'),
            cat.querySelector('.cat-header')
          );
      });
    }
    if (st.openSubs?.length) {
      document.querySelectorAll('.sub-acc').forEach((b) => {
        if (st.openSubs.includes(b.dataset.anchor))
          openPanel(b.nextElementSibling, b);
      });
    }
    // 사이드바 펼침 상태 복원 (아코디언이므로 첫번째만 유지)
    if (st.openSideCats?.length) {
      const first = st.openSideCats[0];
      document
        .querySelectorAll('.s-cat')
        .forEach((c) => c.classList.toggle('open', c.dataset.cat === first));
    }
    filter();
    setActiveAnchor(st.anchor || '');
    return true;
  } catch (e) {
    return false;
  }
}

/* MENU (모바일 사이드바) */
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
menuToggle?.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

/* 클릭/키보드 토글 와이어링 */
function wireToggles() {
  document.querySelectorAll('[data-cat] .cat-header').forEach((h) => {
    h.addEventListener('click', () => {
      togglePanel(h.nextElementSibling, h);
      saveState();
    });
    h.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePanel(h.nextElementSibling, h);
        saveState();
      }
    });
  });
  document.querySelectorAll('.sub-acc').forEach((btn) => {
    btn.addEventListener('click', () => {
      togglePanel(btn.nextElementSibling, btn);
      if (btn.classList.contains('open')) {
        openByAnchor(btn.dataset.anchor, true, true);
      } else {
        saveState();
      }
    });
  });
}

/* ============ SCROLL SPY ============ */
let spyObserver = null;
function initScrollSpy() {
  if (spyObserver) {
    spyObserver.disconnect();
    spyObserver = null;
  }
  const options = {
    root: null,
    rootMargin: '-30% 0px -50% 0px',
    threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
  };
  spyObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible.length) {
      const id = visible[0].target.getAttribute('data-anchor');
      if (id && id !== currentAnchor) {
        setActiveAnchor(id);
      }
    }
  }, options);

  document
    .querySelectorAll('.sub-panel')
    .forEach((p) => spyObserver.observe(p));
}

/* INIT */
renderContent();
renderTopPills();
renderSideNav();
wireToggles();
openDefaults();
const byHash = openByHash();
if (!byHash) restoreState();
// if (!q.value?.trim()) setCount('전체 표시'); 전체 표시 버튼 기능 삭제
highlightActiveNav();
initScrollSpy();
