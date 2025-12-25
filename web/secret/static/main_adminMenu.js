// main_adminMenu.js
// 분리된 스크립트: main_adminMenu.html의 inline JS를 옮겼습니다.

// 오늘 날짜
(function () {
  const todayEl = document.getElementById('today');
  if (todayEl) {
    const d = new Date();
    todayEl.textContent = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(
      d.getHours()
    ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
})();

// 모바일 사이드바 토글 (기능 유지)
(function () {
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
  window.addEventListener('hashchange', () => {
    if (matchMedia('(max-width:900px)').matches && sidebar)
      sidebar.classList.remove('open');
  });
})();

// NAV active sync (기능 유지)
(function () {
  function syncNav() {
    const hash = location.hash || '#code';
    document.querySelectorAll('.nav-btn').forEach((a) => {
      a.removeAttribute('aria-current');
      if (a.getAttribute('href') === hash)
        a.setAttribute('aria-current', 'page');
    });
  }
  window.addEventListener('hashchange', syncNav);
  syncNav();
})();

// ===== 권한 체크 시스템 =====
(function () {
  // 페이지 로드 시 즉시 ADMIN 권한 체크 (가장 중요!)
  function checkPageAccess() {
    console.log('🔐 main_adminMenu.html 페이지 접근 권한 체크 시작...');
    
    // 1. admin_session.js 로드 확인
    if (typeof window.getAdminSession !== 'function') {
      console.error('❌ admin_session.js가 로드되지 않았습니다!');
      alert('❌ 세션 관리 스크립트 오류\n페이지를 새로고침해주세요.');
      window.location.href = '/secret/admin_login';
      return false;
    }
    
    // 2. 관리자 세션 확인
    const adminSession = window.getAdminSession();
    console.log('📋 관리자 세션 정보:', adminSession);
    
    // 3. 로그인 상태 확인
    if (!adminSession || !adminSession.isLoggedIn || !adminSession.admin_id) {
      console.warn('⚠️ 관리자 로그인 정보가 없습니다.');
      alert('❌ 관리자 로그인이 필요합니다.\n\n로그인 페이지로 이동합니다.');
      window.location.href = '/secret/admin_login';
      return false;
    }
    
    // 4. role이 정확히 "ADMIN"인지 철저하게 확인
    const currentRole = adminSession.role;
    console.log('🔍 현재 role 확인:', currentRole);
    console.log('🔍 role 타입:', typeof currentRole);
    console.log('🔍 role === "ADMIN":', currentRole === 'ADMIN');
    
    if (currentRole !== 'ADMIN') {
      console.error('❌ ADMIN 권한이 아닙니다!');
      console.error('   현재 role:', currentRole);
      console.error('   role 타입:', typeof currentRole);
      alert(
        `❌ 접근 권한이 없습니다.\n\n` +
        `🔒 요청 페이지: 관리자 시스템 관리 메뉴\n` +
        `👤 현재 권한: ${currentRole || '없음'}\n` +
        `✅ 필요 권한: ADMIN\n\n` +
        `관리자 권한(ADMIN)이 필요합니다.\n` +
        `현재 로그인한 계정은 이 페이지에 접근할 수 없습니다.\n\n` +
        `로그인 페이지로 이동합니다.`
      );
      window.location.href = '/secret/admin_login';
      return false;
    }
    
    // 5. 서버 측에서도 한번 더 확인
    console.log('🔄 서버 측 권한 확인 중...');
    fetch('/secret/api/v1/admin/check-role', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        console.log('📡 서버 응답 상태:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('📋 서버 응답:', data);
        
        const serverRole = data.role || data.admin_role;
        const isAdmin = data.is_admin;
        
        console.log('🔍 서버 role:', serverRole);
        console.log('🔍 서버 is_admin:', isAdmin);
        
        if (serverRole !== 'ADMIN' || !isAdmin) {
          console.error('❌ 서버 측에서도 ADMIN 권한이 아닙니다!');
          alert(
            `❌ 서버 권한 확인 실패\n\n` +
            `서버 측 권한: ${serverRole || '없음'}\n` +
            `관리자 권한(ADMIN)이 필요합니다.\n\n` +
            `로그인 페이지로 이동합니다.`
          );
          window.location.href = '/secret/admin_login';
          return false;
        }
        
        console.log('✅ 모든 권한 체크 통과 - 페이지 접근 허용');
      })
      .catch(error => {
        console.error('❌ 서버 권한 확인 중 오류:', error);
        console.error('   오류 타입:', error.name);
        console.error('   오류 메시지:', error.message);
        console.error('   오류 스택:', error.stack);
        
        // 네트워크 오류인 경우 더 자세한 정보 제공
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
          alert(
            `❌ 서버 연결 실패\n\n` +
            `서버에 연결할 수 없습니다.\n` +
            `다음을 확인해주세요:\n` +
            `- 서버가 실행 중인지 확인\n` +
            `- 네트워크 연결 상태 확인\n` +
            `- 브라우저 콘솔에서 자세한 오류 확인\n\n` +
            `로그인 페이지로 이동합니다.`
          );
        } else {
          alert(
            `❌ 권한 확인 중 오류가 발생했습니다.\n\n` +
            `오류: ${error.message}\n\n` +
            `로그인 페이지로 이동합니다.`
          );
        }
        window.location.href = '/secret/admin_login';
      });
    
    return true;
  }
  
  // 페이지 로드 시 즉시 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkPageAccess);
  } else {
    checkPageAccess();
  }
  
  // 현재 사용자의 권한(role) 확인 함수
  function getCurrentUserRole() {
    // 1. admin_session.js에서 관리자 로그인 상태 확인
    if (window.getAdminSession && window.getAdminSession().isLoggedIn) {
      const adminSession = window.getAdminSession();
      console.log('🔐 관리자 세션 감지:', adminSession);
      return adminSession.role || 'ADMIN';
    }

    // 2. member_session.js에서 회원 로그인 상태 확인 (있다면)
    if (
      window.getMemberSession &&
      window.isMemberLoggedIn &&
      window.isMemberLoggedIn()
    ) {
      const memberSession = window.getMemberSession();
      console.log('👤 회원 세션 감지:', memberSession);
      // 회원 세션에 role 정보가 있다면 사용
      return memberSession.role || 'USER';
    }

    // 3. 기본값
    return 'USER';
  }

  // ADMIN 권한 체크 함수
  function checkAdminPermission(actionName) {
    const currentRole = getCurrentUserRole();
    console.log(
      `🔍 권한 체크 - 작업: ${actionName}, 현재 권한: ${currentRole}`
    );

    if (currentRole !== 'ADMIN') {
      alert(
        `❌ 접근 권한이 없습니다.\n\n` +
          `🔒 요청 작업: ${actionName}\n` +
          `👤 현재 권한: ${currentRole}\n` +
          `✅ 필요 권한: ADMIN\n\n` +
          `관리자 권한(ADMIN)이 필요합니다.\n` +
          `관리자 로그인을 진행해주세요.`
      );
      return false;
    }

    console.log(`✅ 권한 승인 - ${actionName} 작업 허용`);
    return true;
  }

  // 카드의 "열기" 버튼 → 해당 섹션으로 스크롤 (기능 유지)
  document.querySelectorAll('[data-go]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-go');
      location.hash = '#' + id;
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // 데모 버튼 (기능 유지)
  document.querySelectorAll('[data-demo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const area = btn.getAttribute('data-demo');
      alert(`"${area}" 데모: 가이드/마법사/템플릿 모달 연결 위치입니다.`);
    });
  });

  // 페이지별 open 버튼 바인딩
  const mapBtnToAction = [
    ['openBcodeBtn', '/secret/sit005.html', '기초 코드관리'],
    ['openMemlistBtn', '/secret/a03_admin_memlist.html', '회원 비밀상담요청 관리'],
    ['openMemcardBtn', '/secret/a02_admin_memcard.html', '멤버회원 정보관리'],
    ['openMembatchBtn', '/secret/a05_admin_membatch.html', '일괄관리'],
    ['openAdminCardBtn', '/secret/a06_adminCard.html', '관리자 계정관리'],
    ['openAnswersBtn', '/secret/a03_admin_memlist.html', '관리자 답변관리'],
  ];

  mapBtnToAction.forEach(([id, href, action]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', () => {
        if (!checkAdminPermission(action)) return;
        console.log(`${action} 버튼 클릭됨!`);
        window.location.href = href;
      });
    }
  });

  // 닫기 버튼 - 권한 체크 없이 바로 화면 닫기
  const closeBtn = document.getElementById('closeBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      // 브라우저 탭/창 닫기 시도
      if (window.opener) {
        // 팝업창인 경우
        window.close();
      } else if (window.history.length > 1) {
        // 이전 페이지가 있는 경우
        window.history.back();
      } else {
        // 새 탭이거나 직접 접근한 경우
        window.close();
        // window.close()가 작동하지 않는 경우 홈으로 이동
        setTimeout(() => {
          window.location.href = '/secret/main_index.html';
        }, 100);
      }
    });
  }

  // 상단바 버튼(기존 하단바 기능 그대로)
  const homeBtn = document.getElementById('homeBtn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      location.hash = '#code';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      alert('로그아웃 API 연동 지점입니다.'); /* location.href='/logout' */
    });
  }
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      alert('설정 모달/페이지 연결 지점입니다.');
    });
  }

  // 업무 종료 & 자동저장 (기능 유지)
  const quitBtn = document.getElementById('quitBtn');
  if (quitBtn) {
    quitBtn.addEventListener('click', () => {
      if (
        confirm(
          '업무를 종료하시겠습니까?\n임시 저장 및 세션 정리를 수행한 뒤 로그아웃합니다.'
        )
      ) {
        alert('정상 종료되었습니다. 좋은 하루 되세요!');
        // location.href='/logout';
      }
    });
  }
  const autosaveBtn = document.getElementById('autosaveBtn');
  if (autosaveBtn) {
    autosaveBtn.addEventListener('click', () => {
      alert('자동저장 옵션을 설정하는 모달을 연결하세요.');
    });
  }

  // 테마 선택 (auto/light/dark/sepia/gray) (기능 유지)
  const THEME_KEY = 'admin-theme';
  const themeSelect = document.getElementById('themeSelect');
  function applyTheme(mode) {
    if (!themeSelect) return;
    if (mode === 'auto') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', mode);
    }
    localStorage.setItem(THEME_KEY, mode);
    themeSelect.value = mode;
  }
  if (themeSelect) {
    applyTheme(localStorage.getItem(THEME_KEY) || 'auto');
    themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));
  }

  // 맨 위로 (기능 유지)
  const toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 160) toTop.classList.add('show');
      else toTop.classList.remove('show');
    });
    toTop.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
  }
})();
