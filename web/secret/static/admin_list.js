console.log('=== 관리자 목록 페이지 시작 (반응형 그리드) ===');
console.log('🗄️ 관리자 반응형 DB 그리드 모드로 실행 중...');

// ===== 관리자 로그인 확인 =====
(function checkAdminLogin() {
  console.log('🔐 관리자 로그인 상태 확인 중...');

  // admin_session.js의 전역 함수 사용
  if (typeof window.getAdminSession === 'function') {
    const adminSession = window.getAdminSession();
    console.log('📋 관리자 세션 정보:', adminSession);

    if (!adminSession || !adminSession.isLoggedIn || !adminSession.admin_id) {
      console.warn(
        '⚠️ 관리자 로그인 정보가 없습니다. 로그인 페이지로 이동합니다.'
      );
      alert('관리자 로그인이 필요합니다.');
      window.location.href = '/secret/admin_login';
      return;
    }

    console.log('✅ 관리자 로그인 확인 완료:', adminSession.admin_id);
  } else {
    console.error('❌ admin_session.js가 로드되지 않았습니다!');
    alert('세션 관리 스크립트 로드 오류. 페이지를 새로고침해주세요.');
    window.location.href = '/secret/admin_login';
  }
})();

// ===== 실시간 관리자 세션 감지 =====
function checkAdminSessionRealTime() {
  console.log('🔄 실시간 관리자 세션 확인 중...');

  if (typeof window.getAdminSession === 'function') {
    const adminSession = window.getAdminSession();

    if (!adminSession || !adminSession.isLoggedIn || !adminSession.admin_id) {
      console.warn(
        '⚠️ 관리자 세션이 만료되었습니다. 로그인 페이지로 이동합니다.'
      );
      alert('관리자 세션이 만료되었습니다. 다시 로그인해주세요.');
      window.location.href = '/secret/admin_login';
      return false;
    }

    console.log('✅ 관리자 세션 유효:', adminSession.admin_id);
    return true;
  }

  return false;
}

// 페이지 포커스 시 세션 재확인 (다른 탭에서 로그아웃 후 돌아올 때)
window.addEventListener('focus', () => {
  console.log('📄 페이지 포커스 - 세션 재확인');
  checkAdminSessionRealTime();
});

// localStorage 변경 감지 (다른 탭에서 로그아웃 시)
window.addEventListener('storage', function (e) {
  if (e.key === 'admin_session') {
    console.log('🔔 관리자 세션 변경 감지');
    setTimeout(() => {
      checkAdminSessionRealTime();
    }, 100);
  }
});

// 주기적 세션 확인 (30초마다)
setInterval(() => {
  checkAdminSessionRealTime();
}, 30000);

// ===== 관리자 세션 상태 확인 함수 (버튼용) =====
function checkAdminStatus() {
  console.log('🔍 관리자 세션 상태 수동 확인');

  if (typeof window.getAdminSession === 'function') {
    const adminSession = window.getAdminSession();
    console.log('📋 현재 관리자 세션:', adminSession);

    if (adminSession && adminSession.isLoggedIn && adminSession.admin_id) {
      alert(
        `✅ 관리자 세션 활성화\n\n` +
          `🆔 ID: ${adminSession.admin_id}\n` +
          `👤 사용자명: ${adminSession.username || '정보없음'}\n` +
          `🔑 권한: ${adminSession.role || 'ADMIN'}\n` +
          `⏰ 로그인 상태: 활성화`
      );
    } else {
      alert(
        `❌ 관리자 세션 없음\n\n` +
          `로그인이 필요합니다.\n` +
          `로그인 페이지로 이동하시겠습니까?`
      ) && (window.location.href = '/admin_login');
    }
  } else {
    alert('❌ 세션 관리 시스템 오류\nadmin_session.js가 로드되지 않았습니다.');
  }
}

// 전역 함수로 등록 (HTML에서 onclick으로 호출 가능)
window.checkAdminStatus = checkAdminStatus;

// ===== main_adminMenu.html 접근 권한 체크 =====
function goToAdminMenu() {
  console.log('🔐 main_adminMenu.html 접근 권한 체크 시작...');
  
  // 1. 관리자 로그인 확인
  if (typeof window.getAdminSession !== 'function') {
    console.error('❌ admin_session.js가 로드되지 않았습니다!');
    alert('❌ 세션 관리 스크립트 오류\n페이지를 새로고침해주세요.');
    return;
  }
  
  const adminSession = window.getAdminSession();
  console.log('📋 관리자 세션 정보:', adminSession);
  
  // 2. 로그인 상태 확인
  if (!adminSession || !adminSession.isLoggedIn || !adminSession.admin_id) {
    console.warn('⚠️ 관리자 로그인 정보가 없습니다.');
    alert('❌ 관리자 로그인이 필요합니다.\n\n로그인 페이지로 이동합니다.');
    window.location.href = '/secret/admin_login';
    return;
  }
  
  // 3. role이 "ADMIN"인지 철저하게 확인
  const currentRole = adminSession.role;
  console.log('🔍 현재 role 확인:', currentRole);
  console.log('🔍 role 타입:', typeof currentRole);
  console.log('🔍 role === "ADMIN":', currentRole === 'ADMIN');
  console.log('🔍 role !== "ADMIN":', currentRole !== 'ADMIN');
  
  // role이 정확히 "ADMIN"이 아니면 차단
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
      `현재 로그인한 계정은 이 페이지에 접근할 수 없습니다.`
    );
    return;
  }
  
  // 4. 서버 측에서도 한번 더 확인 (API 호출)
  console.log('🔄 서버 측 권한 확인 중...');
  fetch('/secret/api/v1/admin/check-role', {
    method: 'GET',
    credentials: 'same-origin'
  })
    .then(response => response.json())
    .then(data => {
      console.log('📋 서버 응답:', data);
      
      // 서버에서도 role 확인
      const serverRole = data.role || data.admin_role;
      const isAdmin = data.is_admin;
      
      console.log('🔍 서버 role:', serverRole);
      console.log('🔍 서버 is_admin:', isAdmin);
      
      // 서버에서도 ADMIN이 아니면 차단
      if (serverRole !== 'ADMIN' || !isAdmin) {
        console.error('❌ 서버 측에서도 ADMIN 권한이 아닙니다!');
        alert(
          `❌ 서버 권한 확인 실패\n\n` +
          `서버 측 권한: ${serverRole || '없음'}\n` +
          `관리자 권한(ADMIN)이 필요합니다.`
        );
        return;
      }
      
      // 모든 체크 통과 - 페이지 이동
      console.log('✅ 모든 권한 체크 통과 - main_adminMenu.html로 이동');
      window.location.href = 'main_adminMenu.html';
    })
    .catch(error => {
      console.error('❌ 서버 권한 확인 중 오류:', error);
      alert('❌ 권한 확인 중 오류가 발생했습니다.\n다시 시도해주세요.');
    });
}

// 전역 함수로 등록
window.goToAdminMenu = goToAdminMenu;

function load() {
  const status = document.getElementById('statusFilter').value;
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const url = '/secret/api/v1/admin/tickets' + q;
  console.log('🚀 관리자 티켓 목록 로드:', url);
  console.log('📋 선택된 상태 필터:', status);

  fetch(url)
    .then((r) => {
      if (r.status === 401) {
        alert('다시 로그인하세요');
        location.href = '/secret/admin_login';
        return;
      }
      return r.json();
    })
    .then((items) => {
      console.log('🔍 API 응답 전체:', items);
      console.log('🔍 응답 타입:', typeof items);
      console.log('🔍 항목 수:', items.length);

      if (items.length === 0) {
        showAdminEmptyState();
        return;
      }

      // 첫 번째 항목 상세 디버깅
      if (items[0]) {
        console.log('🎯 첫 번째 항목 상세:');
        console.log('   - author_name:', items[0].author_name);
        console.log('   - author_contact:', items[0].author_contact);
        console.log('   - 전체 객체:', items[0]);
      }

      renderAdminDesktopTable(items);
      renderAdminMobileCards(items);
      console.log('✅ 관리자 MSSQL 데이터 표시 완료');
    })
    .catch((error) => {
      console.error('❌ 관리자 MSSQL 데이터 로딩 실패:', error);
      showAdminErrorState();
    });
}

function renderAdminDesktopTable(items) {
  const tableBody = document.getElementById('rows');
  tableBody.innerHTML = '';

  items.forEach((ticket, idx) => {
    console.log(`🔍 데스크톱 테이블 렌더링 [${idx}]:`, ticket);
    console.log(`🔍 [${idx}] author_name:`, ticket.author_name);
    console.log(`🔍 [${idx}] author_contact:`, ticket.author_contact);
    console.log(`🔍 [${idx}] snsgu 값:`, ticket.snsgu);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${idx + 1}</strong></td>
      <td>
        <div style="font-weight: 600; color: #495057;">${ticket.title}</div>
      </td>
      <td>
        <span class="admin-status-badge-small ${getAdminStatusClass(
          ticket.status
        )}">
          ${getAdminStatusText(ticket.status)}
        </span>
      </td>
      <td>
        <span class="admin-reply-badge ${
          ticket.has_admin_reply ? 'admin-reply-yes' : 'admin-reply-no'
        }">
          ${ticket.has_admin_reply ? 'Y' : 'N'}
        </span>
      </td>
      <td>
        <div style="font-size: 13px; color: #495057; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${ticket.author_name || '미등록'}
        </div>
      </td>
      <td>
        <div style="font-size: 13px; color: #6c757d; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${ticket.author_contact || '미등록'}
        </div>
      </td>
      <td>
        <span class="snsgu-badge">${ticket.snsgu || 'A0001'}</span>
      </td>
      <td>
        <div style="font-size: 12px; color: #6c757d;">
          ${formatAdminDate(ticket.created_at)}
        </div>
      </td>
    `;

    tr.onclick = () => (location.href = `/secret/admin_view?id=${ticket.ticket_id}`);
    tableBody.appendChild(tr);
  });
}

function renderAdminMobileCards(items) {
  const mobileContainer = document.getElementById('adminMobileCardView');
  mobileContainer.innerHTML = '';

  items.forEach((ticket, idx) => {
    const cardElement = document.createElement('div');
    cardElement.className = 'admin-ticket-card';
    cardElement.onclick = () =>
      (location.href = `/secret/admin_view?id=${ticket.ticket_id}`);

    cardElement.innerHTML = `
      <div class="admin-card-header">
        <div class="admin-card-number">#${idx + 1}</div>
        <span class="admin-reply-badge ${
          ticket.has_admin_reply ? 'admin-reply-yes' : 'admin-reply-no'
        }">
          ${ticket.has_admin_reply ? 'Y' : 'N'}
        </span>
      </div>
      <div class="admin-card-title">${ticket.title}</div>
      <div class="admin-card-meta">
        <div class="admin-meta-item">
          <div class="admin-meta-label">상태</div>
          <div class="admin-meta-value">
            <span class="admin-status-badge-small ${getAdminStatusClass(
              ticket.status
            )}">
              ${getAdminStatusText(ticket.status)}
            </span>
          </div>
        </div>
        <div class="admin-meta-item">
          <div class="admin-meta-label">자료구분</div>
          <div class="admin-meta-value">
            <span class="snsgu-badge">${ticket.snsgu || 'A0001'}</span>
          </div>
        </div>
        <div class="admin-meta-item">
          <div class="admin-meta-label">이름</div>
          <div class="admin-meta-value">${ticket.author_name || '미등록'}</div>
        </div>
        <div class="admin-meta-item">
          <div class="admin-meta-label">메모란</div>
          <div class="admin-meta-value">${
            ticket.author_contact || '미등록'
          }</div>
        </div>
        <div class="admin-meta-item">
          <div class="admin-meta-label">등록일</div>
          <div class="admin-meta-value">${formatAdminDate(
            ticket.created_at
          )}</div>
        </div>
      </div>
    `;

    mobileContainer.appendChild(cardElement);
  });
}

function getAdminStatusClass(status) {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return 'admin-status-open';
    case 'ANSWERED':
      return 'admin-status-answered';
    case 'CLOSED':
      return 'admin-status-closed';
    default:
      return 'admin-status-open';
  }
}

function getAdminStatusText(status) {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return '🔴 대기중';
    case 'ANSWERED':
      return '🟢 답변완료';
    case 'CLOSED':
      return '🟡 마감';
    default:
      return '🔴 대기중';
  }
}

function formatAdminDate(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return (
        '🕐 오늘 ' +
        date.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    } else if (diffDays === 2) {
      return (
        '📅 어제 ' +
        date.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    } else if (diffDays <= 7) {
      return `📆 ${diffDays - 1}일 전`;
    } else {
      return (
        '📋 ' +
        date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      );
    }
  } catch (error) {
    return dateString;
  }
}

function showAdminEmptyState() {
  const tableBody = document.getElementById('rows');
  const mobileContainer = document.getElementById('adminMobileCardView');

  const emptyContent = `
    <div class="admin-empty-state">
      <div class="admin-empty-state-icon">📋</div>
      <h3>상담요청이 없습니다</h3>
      <p>현재 선택한 필터에 해당하는 상담요청이 없습니다.</p>
    </div>
  `;

  // 테이블 빈 상태
  tableBody.innerHTML = `
    <tr>
      <td colspan="7">${emptyContent}</td>
    </tr>
  `;

  // 모바일 빈 상태
  mobileContainer.innerHTML = emptyContent;
}

function showAdminErrorState() {
  const tableBody = document.getElementById('rows');
  const mobileContainer = document.getElementById('adminMobileCardView');

  const errorContent = `
    <div class="admin-empty-state">
      <div class="admin-empty-state-icon">⚠️</div>
      <h3>데이터를 불러올 수 없습니다</h3>
      <p>네트워크 연결을 확인하고 다시 시도해주세요.</p>
      <button class="admin-logout-btn" onclick="load()" style="margin-top: 16px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);">
        🔄 다시 시도
      </button>
    </div>
  `;

  // 테이블 에러 상태
  tableBody.innerHTML = `
    <tr>
      <td colspan="7">${errorContent}</td>
    </tr>
  `;

  // 모바일 에러 상태
  mobileContainer.innerHTML = errorContent;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('statusFilter').addEventListener('change', load);
  load();
});

function logout() {
  console.log('🚪 관리자 로그아웃 시작...');

  fetch('/secret/api/v1/admin/logout', { method: 'POST' })
    .then((r) => r.json())
    .then((result) => {
      console.log('✅ 로그아웃 API 응답:', result);

      // 전역 변수 완전 초기화
      if (typeof window.clearAdminSession === 'function') {
        window.clearAdminSession();
        console.log('✅ 관리자 세션 전역 변수 완전 초기화 완료');
      }

      // 최종 상태 확인
      console.log('🔍 로그아웃 후 전역 변수 상태:', window.ADMIN_SESSION);
      console.log('   isLoggedIn:', window.ADMIN_SESSION?.isLoggedIn);

      // 로그인 페이지로 이동
      location.href = '/secret/admin_login';
    })
    .catch((error) => {
      console.error('❌ 로그아웃 API 오류:', error);

      // 오류가 발생해도 전역 변수 초기화 및 로그인 페이지로 이동
      if (typeof window.clearAdminSession === 'function') {
        window.clearAdminSession();
        console.log('⚠️ API 오류 발생 - 전역 변수 강제 초기화 완료');
      }

      console.log('🔍 로그아웃 후 전역 변수 상태:', window.ADMIN_SESSION);
      location.href = '/secret/admin_login';
    });
}
