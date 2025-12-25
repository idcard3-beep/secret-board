      // ===============
      // 2) 반응형/테마/검색/아코디언 유틸 (PC/태블릿/모바일 공통)
      // ===============
      const $ = (s, el = document) => el.querySelector(s);
      const $$ = (s, el = document) => [...el.querySelectorAll(s)];

      // 테마 토글 (기본 라이트)
      const themeLight = $('#themeLight');
      const themeDark = $('#themeDark');
      const root = document.documentElement;
      function setTheme(mode) {
        document.body.setAttribute('data-theme', mode);
        themeLight.setAttribute('aria-pressed', String(mode === 'light'));
        themeDark.setAttribute('aria-pressed', String(mode === 'dark'));
        localStorage.setItem('tjb_theme', mode);
      }
      themeLight.addEventListener('click', () => setTheme('light'));
      themeDark.addEventListener('click', () => setTheme('dark'));
      // 초기 테마 로드
      setTheme(localStorage.getItem('tjb_theme') || 'light');

      // 메뉴 검색(좌측)
      const q = $('#q');
      const menu = $('#menu');
      q.addEventListener('input', () => {
        const term = q.value.toLowerCase();
        $$('#menu a', menu).forEach((a) => {
          const text = a.textContent.toLowerCase();
          a.style.display = text.includes(term) ? '' : 'none';
        });
      });

      // 모두 열기/접기
      const btnExpand = $('#btnExpand');
      const btnCollapse = $('#btnCollapse');
      btnExpand.addEventListener('click', () => {
        $$('details').forEach((d) => (d.open = true));
      });
      btnCollapse.addEventListener('click', () => {
        $$('details').forEach((d) => (d.open = false));
      });

      // 맨위
      $('#btnTop').addEventListener('click', () =>
        window.scrollTo({ top: 0, behavior: 'smooth' })
      );

      // 닫기
      $('#btnClose').addEventListener('click', () => {
        window.close();
        // window.close()가 작동하지 않는 경우 (팝업이 아닌 경우) 이전 페이지로 이동
        setTimeout(() => {
          if (!window.closed) {
            window.history.back();
          }
        }, 100);
      });

      // 내부 앵커 스무스 스크롤
      $$('#menu a').forEach((a) => {
        a.addEventListener('click', (e) => {
          const id = a.getAttribute('href');
          if (id && id.startsWith('#')) {
            e.preventDefault();
            document
              .querySelector(id)
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });