console.log('=== 관리자 목록 페이지 시작 (반응형 그리드) ===');
console.log('🗄️ 관리자 반응형 DB 그리드 모드로 실행 중...');

function load() {
  const status = document.getElementById('statusFilter').value;
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const url = '/api/v1/admin/tickets' + q;
  console.log('🚀 관리자 티켓 목록 로드:', url);
  console.log('📋 선택된 상태 필터:', status);

  fetch(url)
    .then((r) => {
      if (r.status === 401) {
        alert('다시 로그인하세요');
        location.href = '/admin_login';
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

    tr.onclick = () => (location.href = `/admin_view?id=${ticket.ticket_id}`);
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
      (location.href = `/admin_view?id=${ticket.ticket_id}`);

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
  console.log('🚪 MSSQL에서 관리자 로그아웃 요청');
  fetch('/api/v1/admin/logout', { method: 'POST' }).then(
    () => (location.href = '/admin_login')
  );
}
