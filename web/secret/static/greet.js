/**
 * 0102_greet.html 전용 스크립트
 * 센터장 인사말 페이지 인터랙션 관리
 */

(function () {
  console.log('🚀 greet 스크립트 즉시 실행 시작');

  // Year 설정
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
    console.log('✓ Year 설정 완료');
  }

  // Theme toggle
  const root = document.documentElement;
  const saved = localStorage.getItem('ntt-theme');
  if (saved === 'dark') root.classList.add('dark');
  const themeBtn = document.getElementById('themeToggle');
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

  // 닫기 버튼 이벤트 핸들러
  const closeBtn = document.getElementById('closeBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (window.self !== window.top) {
        window.parent.postMessage('closeIframe', '*');
      } else {
        window.close();
      }
      console.log('✓ 닫기 버튼 클릭됨');
    });
    console.log('✓ 닫기 버튼 등록 완료');
  }

  // Progress bar
  const progress = document.getElementById('progress');
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

  // ...existing code...

  // 앵커 링크 클릭 이벤트 (최우선)
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

  // Image uploads (avatar & signature)
  const avatarInput = document.getElementById('avatarInput');
  const signInput = document.getElementById('signInput');
  const avatarBox = document.getElementById('avatarBox');
  const signBox = document.getElementById('signBox');

  function loadImage(file, target) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (target === 'avatar') {
        avatarBox.innerHTML = `<img alt="프로필" src="${e.target.result}">`;
      } else {
        signBox.src = e.target.result;
        signBox.alt = '서명';
      }
    };
    reader.readAsDataURL(file);
  }

  if (avatarInput) {
    avatarInput.addEventListener('change', () =>
      loadImage(avatarInput.files[0], 'avatar')
    );
    console.log('✓ 아바타 업로드 등록 완료');
  }
  if (signInput) {
    signInput.addEventListener('change', () =>
      loadImage(signInput.files[0], 'sign')
    );
    console.log('✓ 서명 업로드 등록 완료');
  }

  // Scroll to Top 버튼 클릭 이벤트 (가장 마지막에 등록, 충돌 방지)
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔝 맨 위로 가기 버튼 클릭됨');

      // 여러 방법으로 시도하여 브라우저 호환성 확보
      try {
        // 방법 1: window.scrollTo with behavior
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log('  → scrollTo 실행됨');
      } catch (err) {
        console.warn('  → scrollTo 실패, 직접 설정 시도');
        // 방법 2: 직접 scrollTop 설정
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0; // Safari 대응
      }

      // 추가 확인: 0.1초 후에도 스크롤이 안됐다면 강제로 설정
      setTimeout(() => {
        if (window.pageYOffset > 0 || document.documentElement.scrollTop > 0) {
          console.warn('  → 스크롤 미완료, 강제 설정');
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          window.pageYOffset = 0;
        }
      }, 100);
    }, false);
    console.log('✅ Scroll to Top 버튼 클릭 이벤트 등록 완료 (최종)');
  } else {
    console.error('❌ Scroll to Top 버튼을 찾을 수 없습니다!');
  }

  console.log('✅ greet.js 로드 완료 - 모든 이벤트 리스너 등록됨');
})();
