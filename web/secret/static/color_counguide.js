const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const themeBtn = $('#theme');
const closeBtn = $('#close');
const content = $('#content');
const q = $('#q');
const nav = $('#sidenav');
const menuToggle = $('#menuToggle');
const navLinks = $$('#navList a');

let dark = false;
themeBtn.addEventListener('click', () => {
  dark = !dark;
  document.documentElement.setAttribute(
    'data-theme',
    dark ? 'dark' : 'light'
  );
  themeBtn.textContent = '테마' + (dark ? '(다크)' : '(라이트)');
});

closeBtn.addEventListener('click', () => {
  const hidden = content.classList.toggle('hidden');
  closeBtn.textContent = hidden ? '열기' : '닫기';
});

// 페이지 닫기 버튼
const pagecloseBtn = $('#closeBtn');
if (pagecloseBtn) {
  pagecloseBtn.addEventListener('click', () => {
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

// 모바일: 메뉴 토글
menuToggle.addEventListener('click', () => {
  nav.classList.toggle('hidden');
});

// 검색: 섹션 필터
q.addEventListener('input', (e) => {
  const term = e.target.value.trim().toLowerCase();
  const secs = $$('main section.card');
  if (!term) {
    secs.forEach((s) => (s.style.display = ''));
    return;
  }
  secs.forEach((s) => {
    const hay = (s.dataset.section + ' ' + s.textContent).toLowerCase();
    s.style.display = hay.includes(term) ? '' : 'none';
  });
});

// 스크롤스파이
const sections = $$('main section.card');
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((a) => {
          a.classList.toggle('active', a.dataset.target === id);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 }
);
sections.forEach((sec) => obs.observe(sec));

// 내비 클릭 시 부드러운 스크롤 + 모바일 메뉴 닫기
navLinks.forEach((a) => {
  a.addEventListener('click', () => {
    if (window.innerWidth <= 980) {
      nav.classList.add('hidden');
    }
  });
});

// 키보드 단축키
document.addEventListener('keydown', (ev) => {
  if (ev.key === '/' && document.activeElement !== q) {
    ev.preventDefault();
    q.focus();
  }
  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') {
    ev.preventDefault();
    themeBtn.click();
  }
});