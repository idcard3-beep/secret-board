/**
 * 0101_Center_intro.html 전용 스크립트
 * 센터 소개 페이지 인터랙션 관리
 */

(function () {
  console.log('🚀 center_intro 스크립트 로드 시작');

  // ================== Utilities ==================
  const $ = (sel) => document.querySelector(sel);
  const els = (sel) => Array.from(document.querySelectorAll(sel));

  // Year
  const yearEl = $('#year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
    console.log('✓ Year 설정 완료');
  }

  // Progress bar
  const progress = $('#progress');
  if (progress) {
    function setProgress() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
    }
    document.addEventListener('scroll', setProgress, { passive: true });
    setProgress();
    console.log('✓ Progress bar 등록 완료');
  }

  // Theme toggle
  (function () {
    const root = document.documentElement;
    const saved = localStorage.getItem('ntt-theme');
    if (saved === 'dark') root.classList.add('dark');
    const themeBtn = $('#themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        root.classList.toggle('dark');
        localStorage.setItem(
          'ntt-theme',
          root.classList.contains('dark') ? 'dark' : 'light'
        );
        console.log('✓ 테마 전환됨');
      });
      console.log('✓ 테마 토글 버튼 등록 완료');
    }
  })();

  // Accordion controls
  const expandAllBtn = $('#expandAll');
  const collapseAllBtn = $('#collapseAll');
  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      els('details').forEach((d) => (d.open = true));
      console.log('✓ 모든 아코디언 열림');
    });
    console.log('✓ 모두 열기 버튼 등록 완료');
  }
  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      els('details').forEach((d) => (d.open = false));
      console.log('✓ 모든 아코디언 닫힘');
    });
    console.log('✓ 모두 접기 버튼 등록 완료');
  }

  // 닫기 버튼 이벤트 핸들러
  const closeBtn = $('#closeBtn');
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
      console.log('✓ 닫기 버튼 클릭됨');
    });
    console.log('✓ 닫기 버튼 등록 완료');
  }

  // Form refs
  const F = {
    name: $('#centerName'),
    tag: $('#tagline'),
    sum: $('#summary'),
    phone: $('#phone'),
    reserve: $('#reserveUrl'),
    kakao: $('#kakaoUrl'),
    area: $('#area'),
    psych: $('#psych'),
    east: $('#east'),
    west: $('#west'),
    programs: $('#programs'),
    ethics: $('#ethics'),
    logo: $('#logo'),
    hero: $('#hero'),
    pc: $('#primaryColor'),
    sc: $('#secondaryColor'),
  };

  // Preview refs
  const P = {
    name: $('#p_name'),
    tag: $('#p_tag'),
    summary: $('#p_summary'),
    area: $('#p_area'),
    psych: $('#p_psych'),
    east: $('#p_east'),
    west: $('#p_west'),
    programs: $('#p_programs'),
    ethics: $('#p_ethics'),
    phoneBtn: $('#p_phone'),
    reserveBtn: $('#p_reserve'),
    kakaoBtn: $('#p_kakao'),
    phoneText: $('#p_phone_text'),
    reserveText: $('#p_reserve_text'),
    kakaoText: $('#p_kakao_text'),
    headline: $('#p_headline'),
    logoBox: $('#logoBox'),
    heroBox: $('#heroBox'),
  };

  // Counters
  const tagCnt = $('#tagCnt');
  if (tagCnt && F.tag) {
    const countTag = () => (tagCnt.textContent = String(F.tag.value.length));
    F.tag.addEventListener('input', countTag);
    countTag();
    console.log('✓ 태그라인 글자수 카운터 등록 완료');
  }

  // URL Host extractor
  function host(u) {
    try {
      return new URL(u).host.replace(/^www\./, '');
    } catch (e) {
      return u;
    }
  }

  // Image preview
  function loadImage(file, target) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (target === 'logo') {
        P.logoBox.innerHTML = `<img alt="로고" src="${e.target.result}">`;
        console.log('✓ 로고 이미지 미리보기 업데이트됨');
      } else {
        P.heroBox.innerHTML = `<img alt="히어로" src="${e.target.result}">`;
        console.log('✓ 히어로 이미지 미리보기 업데이트됨');
      }
    };
    reader.readAsDataURL(file);
  }

  if (F.logo) {
    F.logo.addEventListener('change', () =>
      loadImage(F.logo.files[0], 'logo')
    );
    console.log('✓ 로고 이미지 업로드 등록 완료');
  }
  if (F.hero) {
    F.hero.addEventListener('change', () =>
      loadImage(F.hero.files[0], 'hero')
    );
    console.log('✓ 히어로 이미지 업로드 등록 완료');
  }

  // Save/Load
  const KEY = 'ntt-center-intro-v1';

  function save() {
    const data = {
      name: F.name.value,
      tag: F.tag.value,
      sum: F.sum.value,
      phone: F.phone.value,
      reserve: F.reserve.value,
      kakao: F.kakao.value,
      area: F.area.value,
      psych: F.psych.value,
      east: F.east.value,
      west: F.west.value,
      programs: F.programs.value,
      ethics: F.ethics.value,
      pc: F.pc.value,
      sc: F.sc.value,
    };
    localStorage.setItem(KEY, JSON.stringify(data));
    console.log('✓ 데이터 저장됨:', KEY);
  }

  function load() {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      console.log('✓ 저장된 데이터 없음');
      return;
    }
    try {
      const d = JSON.parse(raw);
      Object.entries(d).forEach(([k, v]) => {
        // reserve 필드는 항상 올바른 URL로 강제 설정
        if (k === 'reserve') {
          if (F[k] && typeof F[k].value !== 'undefined') {
            F[k].value = window.location.origin + '/secret/';
          }
        } else if (F[k] && typeof F[k].value !== 'undefined') {
          F[k].value = v;
        }
      });
      console.log('✓ 저장된 데이터 로드됨:', KEY);
    } catch (e) {
      console.error('✗ 데이터 로드 실패:', e);
    }
  }

  function resetData() {
    localStorage.removeItem(KEY);
    console.log('✓ 데이터 초기화됨');
    location.reload();
  }

  // Apply to preview
  function apply() {
    console.log('🔄 미리보기 업데이트 시작');

    // colors
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(F.pc.value)) {
      document.documentElement.style.setProperty('--primary', F.pc.value);
      console.log('  → 메인 색상 적용:', F.pc.value);
    }
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(F.sc.value)) {
      document.documentElement.style.setProperty('--secondary', F.sc.value);
      console.log('  → 포인트 색상 적용:', F.sc.value);
    }

    P.name.textContent = F.name.value || '센터명';
    P.tag.textContent = F.tag.value || '';
    P.summary.textContent = F.sum.value || '';
    P.area.textContent = F.area.value || '';
    P.psych.textContent = F.psych.value || '';
    P.east.textContent = F.east.value || '';
    P.west.textContent = F.west.value || '';
    P.programs.textContent = F.programs.value || '';
    P.ethics.textContent = F.ethics.value || '';

    // Headline는 요약 첫 문장 또는 슬로건
    P.headline.textContent =
      F.tag.value.trim() || F.sum.value.split(/[.!?]\s/)[0] || '센터 소개';

    // 연락/링크
    const phoneClean = F.phone.value.replace(/[^0-9]/g, '');
    if (phoneClean.length >= 9) {
      P.phoneBtn.href = `tel:${F.phone.value}`;
      P.phoneText.textContent = F.phone.value;
    }
    // 비밀상담요청 링크는 항상 올바른 URL로 강제 설정 (현재 도메인 사용)
    const reserveUrl = window.location.origin + '/secret/';
    P.reserveBtn.href = reserveUrl;
    P.reserveText.textContent = 'www.naratt.kr';
    // 입력 필드도 올바른 값으로 설정
    if (F.reserve) {
      F.reserve.value = reserveUrl;
    }
    if (F.kakao.value) {
      P.kakaoBtn.href = F.kakao.value;
      P.kakaoText.textContent = host(F.kakao.value);
    }

    // Save
    save();
    console.log('✓ 미리보기 업데이트 완료');
  }

  // Live bind (debounced)
  let t;
  function deb(fn) {
    clearTimeout(t);
    t = setTimeout(fn, 120);
  }

  const formInputs = els(
    '#introForm input[type="text"], #introForm input[type="url"], #introForm input[type="tel"], #introForm textarea'
  );
  if (formInputs.length > 0) {
    formInputs.forEach((el) => {
      el.addEventListener('input', () => deb(apply));
    });
    console.log('✓ 폼 입력 실시간 업데이트 등록 완료:', formInputs.length, '개');
  }

  const applyBtn = $('#applyBtn');
  if (applyBtn) {
    applyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      apply();
      console.log('✓ 미리보기 반영 버튼 클릭됨');
    });
    console.log('✓ 미리보기 반영 버튼 등록 완료');
  }

  const saveBtn = $('#saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      save();
      alert('저장되었습니다. (브라우저 로컬 저장소)');
      console.log('✓ 저장 버튼 클릭됨');
    });
    console.log('✓ 저장 버튼 등록 완료');
  }

  const resetBtn = $('#resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetData);
    console.log('✓ 초기화 버튼 등록 완료');
  }

  // Init
  console.log('🔧 초기화 시작');
  load();
  apply();
  console.log('✅ center_intro.js 로드 완료 - 모든 이벤트 리스너 등록됨');
})();
