      /* =========================
   0) 컬러 의미 사전 (간결 키워드)
   ========================= */
   const COLOR_MEANINGS = {
    '#4A90E2': '신뢰/집중/차분',
    '#1F3A93': '전문성/안정',
    '#30475E': '차분/지성',
    '#5B8DEF': '평온/집중',
    '#A8C3D1': '평온/조화',
    '#B5A5E5': '명상/창의',
    '#8AAEE0': '신뢰/편안',
    '#9ED2B2': '회복/수용',
    '#2E7D32': '자연/안정',
    '#30CFCF': '신선/소통',
    '#6BAA75': '균형/안정',
    '#99D98C': '회복/휴식',
    '#2F9E44': '성장/자립',
    '#FFD93D': '낙관/창의',
    '#FFB85C': '활력/동기',
    '#D4A017': '머스타드/독창',
    '#C84B31': '열정/자기주장',
    '#FF7F50': '사회성/따뜻함',
    '#C8B8E2': '차분/명상',
    '#8E7DBE': '통찰/사색',
    '#E7A9B0': '친밀/자기수용',
    '#9D4EDD': '영감/상상',
    '#B197FC': '부드러움/안정',
    '#FFFFFF': '청결/개방',
    '#D8CAB8': '편안/중립',
    '#B0B0B0': '중립/정돈',
    '#4A4A4A': '성찰/세련',
    '#1B1F24': '권위/집중',
    '#7E5E3B': '신뢰/토대',
    '#8D6E63': '안정/따뜻함',
    '#00A8E8': '맑음/집중',
    '#00C2A8': '청량/안정',
    '#F7B267': '온기/사교',
    '#F4845F': '활동/표현',
    '#6C757D': '중립/균형',
    '#343A40': '중후/집중',
    '#84A59D': '차분/안심',
    '#F6BD60': '낙관/활력',
    '#F28482': '감정표현/관계',
    '#84DCC6': '회복/청량',
    '#A8DADC': '휴식/평온',
    '#457B9D': '신뢰/깊이',
    '#1D3557': '집중/권위',
    '#E07A5F': '따뜻함/적극',
    '#81B29A': '안정/균형',
    '#F2CC8F': '부드러움/낙관',
    '#3D405B': '차분/전문',
    '#E9C46A': '활력/창의',
    '#2A9D8F': '회복/소통',
    '#264653': '집중/차분',
    '#F94144': '열정/결단',
    '#F3722C': '동기/행동',
    '#90BE6D': '성장/희망',
    '#577590': '신뢰/사색',
    '#277DA1': '맑음/신뢰',
    '#43AA8B': '회복/균형',
    '#F8961E': '활력/낙관',
    '#F9844A': '표현/교류',
    '#F9C74F': '밝음/긍정',
    '#90CAF9': '평온/집중',
    '#80CBC4': '안정/청량',
    '#CE93D8': '사색/유연',
    '#A5D6A7': '회복/완화',
    '#FFE082': '온화/희망',
    '#BDBDBD': '중립/완충',
  };

  /* =========================
1) 120개 팔레트 데이터
========================= */
  const PALETTES = [
    {
      title: '안정 블루 + 화이트',
      colors: ['#4A90E2', '#FFFFFF'],
      tags: ['안정', '집중', '상담실', '앱UI'],
    },
    {
      title: '딥 네이비 + 에너지 오렌지',
      colors: ['#1F3A93', '#FFB85C'],
      tags: ['동기', '집중', '코칭'],
    },
    {
      title: '슬레이트 블루 + 로즈 핑크',
      colors: ['#5B8DEF', '#E7A9B0'],
      tags: ['관계', '신뢰', '수용'],
    },
    {
      title: '라벤더 블루 + 차콜',
      colors: ['#B5A5E5', '#4A4A4A'],
      tags: ['명상', '사색', '심층상담'],
    },
    {
      title: '터쿼이즈 + 브라운',
      colors: ['#30CFCF', '#7E5E3B'],
      tags: ['소통', '안정', '청소년'],
    },
    {
      title: '머스타드 + 차콜블루',
      colors: ['#D4A017', '#30475E'],
      tags: ['브랜딩', '자아탐색'],
    },
    {
      title: '미스티 블루 + 아이보리',
      colors: ['#A8C3D1', '#FFFFFF'],
      tags: ['평온', '개방', '대기실'],
    },
    {
      title: '네이비 + 스카이',
      colors: ['#1F3A93', '#8AAEE0'],
      tags: ['신뢰', '밝음'],
    },
    {
      title: '오션 + 민트',
      colors: ['#00A8E8', '#9ED2B2'],
      tags: ['청량', '회복'],
    },
    {
      title: '차콜 + 라이트블루',
      colors: ['#1B1F24', '#5B8DEF'],
      tags: ['권위', '집중', '성인상담'],
    },

    {
      title: '회복 민트 + 라벤더',
      colors: ['#9ED2B2', '#C8B8E2'],
      tags: ['회복', '이완', '트라우마'],
    },
    {
      title: '포레스트 그린 + 베이지',
      colors: ['#2E7D32', '#D8CAB8'],
      tags: ['안전', '자기탐색'],
    },
    {
      title: '그린 + 아이보리',
      colors: ['#6BAA75', '#FFFFFF'],
      tags: ['안정', '편안'],
    },
    {
      title: '민트 + 차분 그레이',
      colors: ['#9ED2B2', '#B0B0B0'],
      tags: ['수용', '정돈'],
    },
    {
      title: '청록 + 웜그레이',
      colors: ['#00C2A8', '#CFCFCF'],
      tags: ['안정', '중립'],
    },
    {
      title: '올리브그린 + 크림',
      colors: ['#2F9E44', '#FFE082'],
      tags: ['회복', '따뜻함'],
    },
    {
      title: '민트 + 브라운',
      colors: ['#84DCC6', '#8D6E63'],
      tags: ['안심', '토대'],
    },
    {
      title: '세이지 + 아이보리',
      colors: ['#84A59D', '#FFFFFF'],
      tags: ['차분', '안심'],
    },
    {
      title: '티얼 + 라이트그레이',
      colors: ['#80CBC4', '#BDBDBD'],
      tags: ['이완', '균형'],
    },
    {
      title: '그린그레이 + 베이지',
      colors: ['#81B29A', '#D8CAB8'],
      tags: ['온화', '안정'],
    },

    {
      title: '밝은 옐로우 + 그레이',
      colors: ['#FFD93D', '#B0B0B0'],
      tags: ['창의', '낙관', '집단'],
    },
    {
      title: '선샤인 + 네이비',
      colors: ['#F6BD60', '#1F3A93'],
      tags: ['낙관', '전문'],
    },
    {
      title: '옐로우 + 민트',
      colors: ['#F9C74F', '#9ED2B2'],
      tags: ['긍정', '회복'],
    },
    {
      title: '옐로우 + 터쿼이즈',
      colors: ['#FFD93D', '#30CFCF'],
      tags: ['활력', '소통'],
    },
    {
      title: '머스타드 + 세이지',
      colors: ['#D4A017', '#84A59D'],
      tags: ['온기', '차분'],
    },
    {
      title: '골드 + 차콜',
      colors: ['#E9C46A', '#3D405B'],
      tags: ['존재감', '안정'],
    },
    {
      title: '라이트옐로우 + 블루',
      colors: ['#FFE082', '#90CAF9'],
      tags: ['유연', '집중'],
    },
    {
      title: '옐/오렌지 + 네이비',
      colors: ['#F8961E', '#30475E'],
      tags: ['창의', '집중'],
    },
    {
      title: '옐로우 + 블랙',
      colors: ['#F9C74F', '#1B1F24'],
      tags: ['대비', '주의집중'],
    },
    {
      title: '크림 + 터쿼이즈',
      colors: ['#F2CC8F', '#2A9D8F'],
      tags: ['부드러움', '신선'],
    },

    {
      title: '에너지 오렌지 + 딥블루',
      colors: ['#FFB85C', '#30475E'],
      tags: ['동기', '집중', '코칭'],
    },
    {
      title: '코랄 + 네이비',
      colors: ['#FF7F50', '#1F3A93'],
      tags: ['사교', '전문'],
    },
    {
      title: '테라코타 + 그린',
      colors: ['#F4845F', '#90BE6D'],
      tags: ['표현', '성장'],
    },
    {
      title: '오렌지 + 차콜',
      colors: ['#F7B267', '#343A40'],
      tags: ['활력', '안정'],
    },
    {
      title: '오렌지 + 민트',
      colors: ['#F8961E', '#A5D6A7'],
      tags: ['활력', '회복'],
    },
    {
      title: '코랄 + 세이지',
      colors: ['#F28482', '#84A59D'],
      tags: ['감정표현', '안심'],
    },
    {
      title: '탠저린 + 딥네이비',
      colors: ['#F3722C', '#264653'],
      tags: ['행동', '집중'],
    },
    {
      title: '브라이트 오렌지 + 블루',
      colors: ['#F9844A', '#277DA1'],
      tags: ['표현', '신뢰'],
    },
    {
      title: '웜옐로우 + 스틸블루',
      colors: ['#F2CC8F', '#577590'],
      tags: ['온기', '사색'],
    },
    {
      title: '오렌지 + 차콜그레이',
      colors: ['#FFB85C', '#4A4A4A'],
      tags: ['활동', '균형'],
    },

    {
      title: '딥 레드 + 골드',
      colors: ['#C84B31', '#D4A017'],
      tags: ['존재감', '성취', '브랜딩'],
    },
    {
      title: '레드 + 차콜',
      colors: ['#F94144', '#1B1F24'],
      tags: ['결단', '집중'],
    },
    {
      title: '버건디 + 골드',
      colors: ['#8E7DBE', '#D4AF37'],
      tags: ['품격', '자신감'],
    },
    {
      title: '네이비 + 골드',
      colors: ['#1F3A93', '#E9C46A'],
      tags: ['권위', '신뢰'],
    },
    {
      title: '딥블루 + 블랙',
      colors: ['#30475E', '#1B1F24'],
      tags: ['전문', '권위'],
    },
    {
      title: '레드오렌지 + 네이비',
      colors: ['#F3722C', '#1F3A93'],
      tags: ['파워', '안정'],
    },
    {
      title: '버건디 + 아이보리',
      colors: ['#C84B31', '#FFFFFF'],
      tags: ['존재감', '개방'],
    },
    {
      title: '자주 + 차콜',
      colors: ['#8E7DBE', '#3D405B'],
      tags: ['통찰', '권위'],
    },
    {
      title: '레드 + 그레이',
      colors: ['#F94144', '#6C757D'],
      tags: ['강조', '균형'],
    },
    {
      title: '딥레드 + 베이지',
      colors: ['#C84B31', '#D8CAB8'],
      tags: ['강렬/완충', '성인'],
    },

    {
      title: '라벤더 + 차콜',
      colors: ['#C8B8E2', '#4A4A4A'],
      tags: ['명상', '사색'],
    },
    {
      title: '플럼바이올렛 + 네이비',
      colors: ['#8E7DBE', '#1F3A93'],
      tags: ['통찰', '집중'],
    },
    {
      title: '슬레이트 + 아이보리',
      colors: ['#3D405B', '#FFFFFF'],
      tags: ['차분', '개방'],
    },
    {
      title: '보라 + 민트',
      colors: ['#9D4EDD', '#9ED2B2'],
      tags: ['상상', '회복'],
    },
    {
      title: '라일락 + 세이지',
      colors: ['#B197FC', '#84A59D'],
      tags: ['유연', '안심'],
    },
    {
      title: '네이비 + 라벤더',
      colors: ['#30475E', '#B5A5E5'],
      tags: ['깊이', '완화'],
    },
    {
      title: '보라 + 그레이',
      colors: ['#CE93D8', '#B0B0B0'],
      tags: ['사색', '정돈'],
    },
    {
      title: '인디고 + 민트',
      colors: ['#1D3557', '#A5D6A7'],
      tags: ['성찰', '회복'],
    },
    {
      title: '보라 + 아이보리',
      colors: ['#9D4EDD', '#FFFFFF'],
      tags: ['영감', '개방'],
    },
    {
      title: '라벤더 + 세미블랙',
      colors: ['#B5A5E5', '#1B1F24'],
      tags: ['사색', '권위'],
    },

    {
      title: '웜그레이 + 블루',
      colors: ['#CFCFCF', '#5B8DEF'],
      tags: ['균형', '전문'],
    },
    {
      title: '라이트그레이 + 민트',
      colors: ['#BDBDBD', '#9ED2B2'],
      tags: ['정돈', '회복'],
    },
    {
      title: '그레이 + 옐로우',
      colors: ['#6C757D', '#FFD93D'],
      tags: ['중립/포인트', '창의'],
    },
    {
      title: '차콜 + 옐로우',
      colors: ['#343A40', '#F9C74F'],
      tags: ['집중/경고', '낙관'],
    },
    {
      title: '그레이 + 터쿼이즈',
      colors: ['#B0B0B0', '#30CFCF'],
      tags: ['정돈', '소통'],
    },
    {
      title: '스틸블루 + 아이보리',
      colors: ['#577590', '#FFFFFF'],
      tags: ['전문', '개방'],
    },
    {
      title: '네이비 + 그레이',
      colors: ['#30475E', '#6C757D'],
      tags: ['권위', '중립'],
    },
    {
      title: '블랙 + 베이지',
      colors: ['#1B1F24', '#D8CAB8'],
      tags: ['집중', '완충'],
    },
    {
      title: '차콜 + 민트',
      colors: ['#3D405B', '#80CBC4'],
      tags: ['차분', '이완'],
    },
    {
      title: '네이비 + 세이지',
      colors: ['#1F3A93', '#84A59D'],
      tags: ['전문', '차분'],
    },

    {
      title: '로즈핑크 + 슬레이트',
      colors: ['#E7A9B0', '#5B8DEF'],
      tags: ['친밀', '신뢰'],
    },
    {
      title: '코랄 + 세이지',
      colors: ['#F28482', '#84A59D'],
      tags: ['표현', '수용'],
    },
    {
      title: '핑크 + 아이보리',
      colors: ['#E7A9B0', '#FFFFFF'],
      tags: ['따뜻함', '개방'],
    },
    {
      title: '핑크 + 네이비',
      colors: ['#E7A9B0', '#30475E'],
      tags: ['친밀/균형', '전문'],
    },
    {
      title: '핑크 + 민트',
      colors: ['#E7A9B0', '#9ED2B2'],
      tags: ['관계회복', '안심'],
    },
    {
      title: '코랄 + 라이트블루',
      colors: ['#FF7F50', '#90CAF9'],
      tags: ['사교', '안정'],
    },
    {
      title: '피치 + 라벤더',
      colors: ['#F7B267', '#C8B8E2'],
      tags: ['온기', '이완'],
    },
    {
      title: '핑크 + 그레이',
      colors: ['#E7A9B0', '#B0B0B0'],
      tags: ['감성', '정돈'],
    },
    {
      title: '살몬 + 세이지',
      colors: ['#F3722C', '#84A59D'],
      tags: ['표현', '수용'],
    },
    {
      title: '핑크 + 차콜',
      colors: ['#E7A9B0', '#4A4A4A'],
      tags: ['따뜻/차분', '균형'],
    },

    {
      title: '스카이 + 화이트',
      colors: ['#90CAF9', '#FFFFFF'],
      tags: ['맑음', '가독', '앱UI'],
    },
    {
      title: '티얼 + 화이트',
      colors: ['#80CBC4', '#FFFFFF'],
      tags: ['청량', '청결'],
    },
    {
      title: '스카이 + 민트',
      colors: ['#90CAF9', '#A5D6A7'],
      tags: ['맑음', '회복'],
    },
    {
      title: '아쿠아 + 그레이',
      colors: ['#00A8E8', '#B0B0B0'],
      tags: ['집중', '정돈'],
    },
    {
      title: '블루 + 라이트그레이',
      colors: ['#5B8DEF', '#CFCFCF'],
      tags: ['전문', '균형'],
    },
    {
      title: '티얼 + 아이보리',
      colors: ['#80CBC4', '#FFE082'],
      tags: ['청량', '온화'],
    },
    {
      title: '터쿼이즈 + 차콜',
      colors: ['#30CFCF', '#3D405B'],
      tags: ['신선', '차분'],
    },
    {
      title: '민트 + 스틸블루',
      colors: ['#9ED2B2', '#577590'],
      tags: ['회복', '전문'],
    },
    {
      title: '아쿠아 + 네이비',
      colors: ['#00A8E8', '#1F3A93'],
      tags: ['맑음', '권위'],
    },
    {
      title: '스카이 + 세이지',
      colors: ['#90CAF9', '#84A59D'],
      tags: ['맑음', '차분'],
    },

    {
      title: '옐로우 + 스틸블루',
      colors: ['#F9C74F', '#577590'],
      tags: ['집단활성', '안정진행'],
    },
    {
      title: '민트 + 네이비',
      colors: ['#A5D6A7', '#30475E'],
      tags: ['안정', '리드'],
    },
    {
      title: '코랄 + 네이비',
      colors: ['#F3722C', '#30475E'],
      tags: ['참여', '질서'],
    },
    {
      title: '라이트옐로우 + 차콜',
      colors: ['#FFE082', '#343A40'],
      tags: ['밝음', '집중'],
    },
    {
      title: '민트 + 그레이',
      colors: ['#A5D6A7', '#6C757D'],
      tags: ['안심', '중립'],
    },
    {
      title: '블루 + 베이지',
      colors: ['#5B8DEF', '#D8CAB8'],
      tags: ['신뢰', '완충'],
    },
    {
      title: '옐로우 + 세이지',
      colors: ['#E9C46A', '#84A59D'],
      tags: ['낙관', '차분'],
    },
    {
      title: '터쿼이즈 + 아이보리',
      colors: ['#30CFCF', '#FFFFFF'],
      tags: ['소통', '개방'],
    },
    {
      title: '오렌지 + 그레이',
      colors: ['#F8961E', '#B0B0B0'],
      tags: ['활성', '정돈'],
    },
    {
      title: '핑크 + 스틸블루',
      colors: ['#E7A9B0', '#577590'],
      tags: ['친밀', '진행'],
    },

    {
      title: '인디고 + 머스타드',
      colors: ['#1D3557', '#D4A017'],
      tags: ['깊이', '포인트'],
    },
    {
      title: '인디고 + 민트',
      colors: ['#1D3557', '#A5D6A7'],
      tags: ['집중', '완화'],
    },
    {
      title: '딥블루 + 세이지',
      colors: ['#264653', '#84A59D'],
      tags: ['차분', '균형'],
    },
    {
      title: '네이비 + 브라운',
      colors: ['#30475E', '#7E5E3B'],
      tags: ['중후', '신뢰'],
    },
    {
      title: '네이비 + 골드',
      colors: ['#30475E', '#E9C46A'],
      tags: ['권위', '온기'],
    },
    {
      title: '차콜 + 베이지',
      colors: ['#3D405B', '#D8CAB8'],
      tags: ['집중', '완충'],
    },
    {
      title: '블랙 + 골드',
      colors: ['#1B1F24', '#E9C46A'],
      tags: ['권위', '고급'],
    },
    {
      title: '인디고 + 라벤더',
      colors: ['#1D3557', '#B5A5E5'],
      tags: ['깊이', '사색'],
    },
    {
      title: '스틸블루 + 브라운',
      colors: ['#577590', '#8D6E63'],
      tags: ['전문', '안정'],
    },
    {
      title: '차콜 + 코랄',
      colors: ['#343A40', '#F28482'],
      tags: ['진지+따뜻', '관계'],
    },

    {
      title: '티얼 + 머스타드',
      colors: ['#2A9D8F', '#D4A017'],
      tags: ['신선', '포인트', '브랜드'],
    },
    {
      title: '민트 + 머스타드',
      colors: ['#9ED2B2', '#D4A017'],
      tags: ['회복', '강조'],
    },
    {
      title: '터쿼이즈 + 플럼',
      colors: ['#30CFCF', '#8E7DBE'],
      tags: ['소통', '통찰'],
    },
    {
      title: '스카이 + 플럼',
      colors: ['#90CAF9', '#8E7DBE'],
      tags: ['맑음', '깊이'],
    },
    {
      title: '민트 + 핑크',
      colors: ['#A5D6A7', '#E7A9B0'],
      tags: ['수용', '관계'],
    },
    {
      title: '옐로우 + 플럼',
      colors: ['#F9C74F', '#8E7DBE'],
      tags: ['창의', '사색'],
    },
    {
      title: '티얼 + 코랄',
      colors: ['#80CBC4', '#F28482'],
      tags: ['청량', '표현'],
    },
    {
      title: '스카이 + 코랄',
      colors: ['#90CAF9', '#F28482'],
      tags: ['맑음', '사교'],
    },
    {
      title: '민트 + 오렌지',
      colors: ['#A5D6A7', '#F8961E'],
      tags: ['수용', '동기'],
    },
    {
      title: '터쿼이즈 + 옐로우',
      colors: ['#2A9D8F', '#F9C74F'],
      tags: ['신선', '낙관'],
    },
  ];
  if (PALETTES.length !== 120) {
    console.warn('팔레트 개수:', PALETTES.length);
  }

  /* =========================
2) HEX→HSL 변환 & 색상군 분류 (휴리스틱)
========================= */
  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
      ? {
          r: parseInt(m[1], 16),
          g: parseInt(m[2], 16),
          b: parseInt(m[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }
  function rgbToHsl({ r, g, b }) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }
  function paletteStats(colors) {
    const hsls = colors.map((c) => rgbToHsl(hexToRgb(c)));
    const avg = (k) =>
      Math.round(hsls.reduce((a, c) => a + c[k], 0) / hsls.length);
    const H = avg('h'),
      S = avg('s'),
      L = avg('l');
    return { H, S, L };
  }
  function classifyPalette(p) {
    const st = paletteStats(p.colors);
    const groups = new Set();
    const anyNeutral = p.colors.some((c) =>
      [
        '#B0B0B0',
        '#BDBDBD',
        '#6C757D',
        '#343A40',
        '#3D405B',
        '#4A4A4A',
        '#1B1F24',
        '#FFFFFF',
        '#D8CAB8',
        '#CFCFCF',
      ].includes(c)
    );
    if (st.L >= 72 && st.S <= 55) groups.add('pastel');
    if (st.L <= 30) groups.add('dark');
    if (st.H >= 330 || st.H <= 60) groups.add('warm');
    if (st.H >= 120 && st.H <= 270) groups.add('cool');
    if (st.S <= 15 || anyNeutral) groups.add('neutral');
    if (st.H >= 90 && st.H <= 150) groups.add('greenish');
    if (st.H >= 195 && st.H <= 245) groups.add('bluish');
    if (st.H >= 20 && st.H <= 50) groups.add('orangish');
    if ((st.H >= 300 && st.H <= 340) || (st.H >= 330 && st.H < 360))
      groups.add('pinkish');
    if ((st.S <= 25 && st.L >= 25 && st.L <= 60) || anyNeutral)
      groups.add('professional');
    return { stats: st, groups };
  }

  /* =========================
3) 설명 생성기
========================= */
  function meanings(hexes) {
    return hexes
      .map((h) => COLOR_MEANINGS[h] || '')
      .filter(Boolean)
      .join(' · ');
  }
  function buildPsych(hexes, tags) {
    const m = meanings(hexes);
    const base = `이 조합은 ${m || '조화로운'} 특성을 결합해 `;
    let tail = '내담자의 긴장 완화와 안정된 대화를 돕습니다.';
    if (tags?.some((t) => ['동기', '행동', '코칭'].includes(t)))
      tail = '동기·행동 유발과 목표집중을 촉진합니다.';
    if (tags?.some((t) => ['관계', '친밀', '수용', '관계회복'].includes(t)))
      tail = '관계적 따뜻함과 수용감을 높여 자기표현을 촉진합니다.';
    if (tags?.includes('브랜딩'))
      tail =
        '브랜드의 신뢰·존재감을 높이되 과장 없이 세련된 인상을 남깁니다.';
    if (tags?.some((t) => ['명상', '사색', '심층상담'].includes(t)))
      tail = '내면 주의집중과 사색을 유도해 심층 탐색에 유리합니다.';
    return base + tail;
  }
  function buildUsage(tags) {
    const map = {
      상담실: '개인상담실 배경/가구 포인트',
      대기실: '접수/대기 공간 벽·사인',
      앱UI: '상담 앱/웹 UI 배경·버튼',
      코칭: '리더십/청년 코칭 슬라이드·배너',
      트라우마: '회복/안정 중심 치료실',
      브랜딩: '상담센터 로고·명함·웹컬러',
      집단: '집단상담/워크숍 룸',
      명상: '명상·이완 공간',
    };
    let list = [];
    (tags || []).forEach((t) => {
      if (map[t]) list.push(map[t]);
    });
    if (list.length === 0)
      list = ['상담실/대기실 인테리어', '디지털 화면(UI)'];
    return '추천 활용: ' + list.join(', ');
  }
  function buildCaution(hexes) {
    const strong = [
      '#C84B31',
      '#F94144',
      '#FFD93D',
      '#F8961E',
      '#FFB85C',
      '#F9844A',
      '#F3722C',
      '#F7B267',
      '#D4A017',
    ];
    const darks = [
      '#1B1F24',
      '#3D405B',
      '#30475E',
      '#343A40',
      '#264653',
      '#1D3557',
      '#4A4A4A',
    ];
    if (hexes.some((h) => strong.includes(h)))
      return '주의: 고채도 색은 20~30% 내로 사용해 과자극을 방지하세요.';
    if (hexes.some((h) => darks.includes(h)))
      return '주의: 어두운 톤 과다 시 무거울 수 있어 아이보리/크림으로 완충하세요.';
    return '주의: 문화·개인차에 따라 반응이 다를 수 있어 선호도 확인을 권장합니다.';
  }

  /* =========================
4) 렌더링 & 상호작용
========================= */
  const grid = document.getElementById('grid');
  const shownCount = document.getElementById('shownCount');
  const q = document.getElementById('q');
  const clearBtn = document.getElementById('clear');
  const filters = document.getElementById('filters');
  const themeBtn = document.getElementById('theme');

  let activeGroups = new Set();
  let annotated = PALETTES.map((p) => ({ ...p, cls: classifyPalette(p) }));

  function makeCard(p, idx) {
    const card = document.createElement('article');
    card.className = 'card';

    const grad = `linear-gradient(90deg, ${p.colors[0]} 0%, ${
      p.colors[p.colors.length - 1]
    } 100%)`;
    const sw = document.createElement('div');
    sw.className = 'swatch';
    sw.style.background = grad;
    sw.setAttribute('title', p.colors.join(' → '));
    card.appendChild(sw);

    const body = document.createElement('div');
    body.className = 'body';

    const h = document.createElement('h3');
    h.className = 'ttl';
    h.textContent = `${String(idx + 1).padStart(3, '0')}. ${p.title}`;
    body.appendChild(h);

    const hex = document.createElement('div');
    hex.className = 'hex';
    hex.textContent = p.colors.join('   ');
    body.appendChild(hex);

    const chips = document.createElement('div');
    chips.className = 'chips';
    (p.tags || []).forEach((t) => {
      const c = document.createElement('span');
      c.className = 'chip';
      c.textContent = t;
      chips.appendChild(c);
    });
    p.cls.groups.forEach((g) => {
      const c = document.createElement('span');
      c.className = 'chip';
      c.textContent = `#${g}`;
      chips.appendChild(c);
    });
    body.appendChild(chips);

    const p1 = document.createElement('p');
    p1.textContent = buildPsych(p.colors, p.tags);
    body.appendChild(p1);
    const p2 = document.createElement('p');
    p2.textContent = buildUsage(p.tags);
    body.appendChild(p2);

    const det = document.createElement('details');
    const sum = document.createElement('summary');
    sum.textContent = '자세히/주의';
    det.appendChild(sum);
    const caution = document.createElement('div');
    caution.className = 'hint';
    caution.textContent = buildCaution(p.colors);
    det.appendChild(caution);

    card.appendChild(body);
    card.appendChild(det);
    return card;
  }

  function matchesText(p, term) {
    if (!term) return true;
    const hay = [
      p.title,
      ...(p.tags || []),
      ...(p.colors || []),
      buildPsych(p.colors, p.tags),
      buildUsage(p.tags),
    ]
      .join(' ')
      .toLowerCase();
    return hay.includes(term.toLowerCase());
  }
  function matchesGroups(p) {
    if (activeGroups.size === 0) return true;
    for (const g of activeGroups) {
      if (p.cls.groups.has(g)) return true;
    }
    return false;
  }
  function currentList() {
    const term = q.value.trim();
    return annotated.filter(
      (p) => matchesText(p, term) && matchesGroups(p)
    );
  }
  function render(list) {
    // 성능: 대량 DOM 추가 전 fragment 구성
    const frag = document.createDocumentFragment();
    list.forEach((p, i) => frag.appendChild(makeCard(p, i)));
    grid.innerHTML = '';
    grid.appendChild(frag);
    shownCount.textContent = `${list.length}/120`;
  }
  render(currentList());

  /* --------- 이벤트 --------- */
  q.addEventListener('input', () => render(currentList()));
  clearBtn.addEventListener('click', () => {
    q.value = '';
    render(currentList());
  });

  function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('color-psy-theme', mode);
    themeBtn.textContent = mode === 'dark' ? '🌞 라이트' : '🌗 다크';
  }
  setTheme(localStorage.getItem('color-psy-theme') || 'light');
  themeBtn.addEventListener('click', () => {
    const cur =
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'light'
        : 'dark';
    setTheme(cur);
  });

  // 페이지 닫기 버튼
  const closeBtn = document.getElementById('closeBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
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

  // 터치 스크롤 중 클릭 오작동 감소
  let touchMoving = false;
  document.addEventListener(
    'touchmove',
    () => {
      touchMoving = true;
    },
    { passive: true }
  );
  document.addEventListener(
    'touchend',
    () => {
      setTimeout(() => (touchMoving = false), 50);
    },
    { passive: true }
  );

  // 필터 버튼 동작 (다중 선택, 초기화 지원)
  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.fbtn');
    if (!btn || touchMoving) return;
    const key = btn.dataset.group;
    if (key === 'reset') {
      activeGroups.clear();
      [...filters.querySelectorAll('.fbtn')].forEach((b) =>
        b.classList.remove('active')
      );
      render(currentList());
      return;
    }
    btn.classList.toggle('active');
    if (btn.classList.contains('active')) activeGroups.add(key);
    else activeGroups.delete(key);
    render(currentList());
  });