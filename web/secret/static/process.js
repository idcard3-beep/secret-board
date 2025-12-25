/**
 * 0201_process.html 전용 스크립트
 * 센터장 인사말 페이지 인터랙션 관리
 */
// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Theme toggle
(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem('ntt-theme');
  if (saved === 'dark') root.classList.add('dark');
  document.getElementById('themeToggle').addEventListener('click', () => {
    root.classList.toggle('dark');
    localStorage.setItem(
      'ntt-theme',
      root.classList.contains('dark') ? 'dark' : 'light'
    );
  });
})();

// Progress bar
const progress = document.getElementById('progress');
function setProgress() {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  progress.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
}
document.addEventListener('scroll', setProgress, { passive: true });
setProgress();

// 앵커 링크 클릭 이벤트 (최우선 - 섹션 이동)
const anchorLinks = document.querySelectorAll('a[href^="#"]');
console.log('📍 찾은 앵커 링크 수:', anchorLinks.length);

anchorLinks.forEach((a) => {
  const href = a.getAttribute('href');
  console.log('  - 등록 중:', href);

  a.addEventListener(
    'click',
    (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      console.log('🎯 클릭됨:', href);

      const t = document.querySelector(href);
      if (t) {
        console.log('  → 대상 요소 찾음:', t.id);

        // 방법 1: scrollIntoView 사용
        try {
          t.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
          console.log('  ✓ scrollIntoView 실행됨');

          // 70px 오프셋 보정
          setTimeout(() => {
            window.scrollBy({ top: -70, behavior: 'smooth' });
          }, 100);
        } catch (err) {
          console.error('  ✗ scrollIntoView 실패:', err);

          // 방법 2: 직접 스크롤 설정
          const offset = t.offsetTop - 70;
          document.documentElement.scrollTop = offset;
          document.body.scrollTop = offset; // Safari 대응
          console.log('  ✓ 직접 스크롤 설정:', offset);
        }
      } else {
        console.warn('  ✗ 대상 요소를 찾을 수 없음:', href);
      }

      return false;
    },
    true
  ); // useCapture = true로 최우선 실행
});
console.log('✓ 모든 앵커 링크 등록 완료');

// Scrollspy
const links = Array.from(document.querySelectorAll('.nav a'));
const secs = links
  .map((a) => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

if (links.length > 0) {
  function spy() {
    const y = window.scrollY + 120;
    let id = null;
    for (const s of secs) {
      if (s.offsetTop <= y) id = '#' + s.id;
    }
    links.forEach((a) =>
      a.classList.toggle('active', a.getAttribute('href') === id)
    );
  }
  document.addEventListener('scroll', spy, { passive: true });
  spy();
  console.log('✓ Scrollspy 등록 완료');
}

// Image uploads + notes (per step)
const KEY = 'ntt-process-simple-v1';
const imgBoxes = [...Array(8)].map((_, i) =>
  document.getElementById('imgBox' + (i + 1))
);
const notes = {};
document
  .querySelectorAll('.note')
  .forEach((n) => (notes[n.dataset.note] = n));

function loadImage(file, idx) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    imgBoxes[
      idx - 1
    ].innerHTML = `<img alt="절차 이미지 ${idx}" src="${e.target.result}">`;
    const data = JSON.parse(localStorage.getItem(KEY) || '{}');
    data['img' + idx] = e.target.result;
    localStorage.setItem(KEY, JSON.stringify(data));
  };
  reader.readAsDataURL(file);
}

document
  .querySelectorAll('input[type="file"][data-target]')
  .forEach((inp) => {
    inp.addEventListener('change', () =>
      loadImage(inp.files[0], parseInt(inp.dataset.target))
    );
  });

function save() {
  const data = JSON.parse(localStorage.getItem(KEY) || '{}');
  for (const k in notes) {
    data['note' + k] = notes[k].value;
  }
  localStorage.setItem(KEY, JSON.stringify(data));
}
function load() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    for (let i = 1; i <= 8; i++) {
      if (d['img' + i])
        imgBoxes[i - 1].innerHTML = `<img alt="절차 이미지 ${i}" src="${
          d['img' + i]
        }">`;
      if (d['note' + i] && notes[i]) notes[i].value = d['note' + i];
    }
  } catch (e) {}
}
function resetData() {
  if (confirm('저장된 이미지/메모를 초기화할까요?')) {
    localStorage.removeItem(KEY);
    location.reload();

// 비밀상담요청 링크 강제 설정 (naratt.kr 방지)
(function() {
  const CORRECT_URL = 'http://localhost:5000/secret/';
  
  function fixReserveLinks() {
    // 모든 비밀상담요청 관련 링크 찾기
    const selectors = [
      'a[aria-label*="비밀상담요청"]',
      'a[href*="secret"]',
      'a.btn-sm.primary[href]'
    ];
    
    const allLinks = document.querySelectorAll(selectors.join(', '));
    let fixedCount = 0;
    
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      const ariaLabel = link.getAttribute('aria-label') || '';
      
      // 비밀상담요청 관련 링크이고, naratt.kr이거나 올바른 URL이 아닌 경우
      if (ariaLabel.includes('비밀상담요청') || (href && href.includes('naratt.kr'))) {
        if (!href || href.includes('naratt.kr') || !href.includes('localhost:5000/secret')) {
          link.setAttribute('href', CORRECT_URL);
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener');
          fixedCount++;
        }
      }
    });
    
    if (fixedCount > 0) {
      console.log('✓ 비밀상담요청 링크 수정됨:', fixedCount, '개');
    }
  }
  
  // DOM 로드 후 즉시 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixReserveLinks);
  } else {
    fixReserveLinks();
  }
  
  // 주기적으로 확인 (1초마다)
  setInterval(fixReserveLinks, 1000);
  
  // MutationObserver로 변경사항 감지
  const observer = new MutationObserver(() => {
    fixReserveLinks();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href']
  });
  
  console.log('✓ 비밀상담요청 링크 보호 시스템 활성화');
})();
  }
}
document.getElementById('saveBtn').addEventListener('click', () => {
  save();
  alert('저장되었습니다. (브라우저 로컬 저장소)');
});
document.getElementById('resetBtn').addEventListener('click', resetData);

document.getElementById('closeBtn').addEventListener('click', () => {
  // iframe 내부에서 실행 중인지 확인
  if (window.self !== window.top) {
    // iframe 내부에서 실행 중: 부모 창으로 돌아가기
    window.parent.postMessage('closeIframe', '*');
  } else {
    // 독립 창에서 실행 중: 창 닫기
    window.close();
  }
});

load();