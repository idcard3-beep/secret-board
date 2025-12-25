      // =============================
      // 접근성 고려: 현재 섹션 하이라이트
      // =============================
      const navLinks = document.querySelectorAll('nav a');
      const sections = [...navLinks].map((a) =>
        document.querySelector(a.getAttribute('href'))
      );
      const setActive = () => {
        let y = window.scrollY + 120; // 헤더 여백 보정
        let activeIdx = sections.findIndex((s, i) => {
          const top = s.offsetTop;
          const nextTop = sections[i + 1]?.offsetTop ?? Infinity;
          return y >= top && y < nextTop;
        });
        navLinks.forEach((a) => a.classList.remove('active'));
        if (activeIdx >= 0) navLinks[activeIdx].classList.add('active');
      };
      document.addEventListener('scroll', setActive, { passive: true });
      window.addEventListener('load', setActive);

      // =============================
      // 모두 열기 / 모두 접기 — 확실히 동작
      // =============================
      const openAllBtn = document.getElementById('btnOpenAll');
      const closeAllBtn = document.getElementById('btnCloseAll');
      const closeBtn = document.getElementById('btnClose');

      function getAllDetails() {
        return Array.from(document.querySelectorAll('.section-body details'));
      }
      openAllBtn.addEventListener('click', () => {
        getAllDetails().forEach((d) => {
          d.setAttribute('open', '');
        });
        openAllBtn.blur();
      });
      closeAllBtn.addEventListener('click', () => {
        getAllDetails().forEach((d) => {
          d.removeAttribute('open');
        });
        closeAllBtn.blur();
      });

      // 닫기 버튼 — 창 닫기
      closeBtn?.addEventListener('click', () => {
        window.close();
        // window.close()가 작동하지 않는 경우 (팝업이 아닌 경우) 이전 페이지로 이동
        setTimeout(() => {
          if (!window.closed) {
            window.history.back();
          }
        }, 100);
      });

      // 키보드 사용성 보조: Space/Enter로 nav 바로가기
      const navEl = document.querySelector('nav');
      if (navEl) {
        navEl.addEventListener('keydown', (e) => {
          if ((e.key === ' ' || e.key === 'Enter') && e.target.matches('a')) {
            e.preventDefault();
            e.target.click();
          }
        });
      }

      // =============================
      // 테마 토글 (라이트/다크) — 상단 버튼
      // =============================
      const themeBtn = document.getElementById('btnTheme');
      function applyTheme(mode) {
        document.documentElement.setAttribute('data-theme', mode);
        localStorage.setItem('theme', mode);
        if (themeBtn) {
          const themeTxt = themeBtn.querySelector('.txt');
          if (themeTxt)
            themeTxt.textContent = mode === 'dark' ? '다크' : '라이트';
          themeBtn.setAttribute('aria-pressed', String(mode === 'dark'));
          themeBtn.setAttribute(
            'title',
            `테마 전환 (${mode === 'dark' ? '다크' : '라이트'})`
          );
          themeBtn.setAttribute(
            'aria-label',
            `테마 전환 (${mode === 'dark' ? '다크' : '라이트'})`
          );
        }
      }

      (function initTheme() {
        const saved =
          localStorage.getItem('theme') ||
          (window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light');
        applyTheme(saved);
      })();

      themeBtn?.addEventListener('click', () => {
        const next =
          localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });

      // =============================
      // ✅ 내장 테스트 (기존 테스트 유지 + 추가)
      // =============================
      (function runSmokeTests() {
        try {
          console.assert(
            document.getElementById('btnTheme'),
            '[TEST] btnTheme 존재'
          );
          console.assert(
            document.getElementById('btnOpenAll'),
            '[TEST] btnOpenAll 존재'
          );
          console.assert(
            document.getElementById('btnCloseAll'),
            '[TEST] btnCloseAll 존재'
          );

          const details = getAllDetails();
          console.assert(details.length > 0, '[TEST] details 섹션 수 > 0');

          // 모두 접기 동작 테스트
          document.getElementById('btnCloseAll').click();
          const anyOpenAfterClose = details.some((d) => d.hasAttribute('open'));
          console.assert(
            !anyOpenAfterClose,
            '[TEST] 모두 접기 후 모든 details 닫힘'
          );

          // 모두 열기 동작 테스트
          document.getElementById('btnOpenAll').click();
          const allOpenAfterOpen = details.every((d) => d.hasAttribute('open'));
          console.assert(
            allOpenAfterOpen,
            '[TEST] 모두 열기 후 모든 details 열림'
          );

          // 테마 토글 텍스트 테스트(라이트↔다크)
          const txtBefore = themeBtn.querySelector('.txt')?.textContent;
          themeBtn.click();
          const txtAfter = themeBtn.querySelector('.txt')?.textContent;
          console.assert(
            txtBefore !== txtAfter,
            '[TEST] 테마 토글 시 텍스트 변경'
          );

          // 🔹 추가 테스트: aria-pressed 토글 확인
          const pressedAfter = themeBtn.getAttribute('aria-pressed');
          themeBtn.click(); // 다시 원복
          const pressedRestored = themeBtn.getAttribute('aria-pressed');
          console.assert(
            pressedAfter !== pressedRestored,
            '[TEST] 테마 토글 시 aria-pressed 변경'
          );

          // 🔹 추가 테스트: 버튼이 상단 툴바 내부에 존재
          console.assert(
            themeBtn.closest('.topbar-inner'),
            '[TEST] 테마 버튼이 상단 툴바에 존재'
          );
          console.assert(
            document.getElementById('btnOpenAll').closest('.topbar-inner'),
            '[TEST] 모두 열기 버튼이 상단 툴바에 존재'
          );
          console.assert(
            document.getElementById('btnCloseAll').closest('.topbar-inner'),
            '[TEST] 모두 접기 버튼이 상단 툴바에 존재'
          );
        } catch (err) {
          console.error('[TEST] 실패:', err);
        }
      })();