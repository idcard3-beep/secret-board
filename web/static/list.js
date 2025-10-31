let selectedTicketId = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 MSSQL에서 게시글 목록 로딩 시작...');
  loadTickets();
});

function loadTickets() {
  fetch('/api/v1/tickets/')
    .then((res) => {
      console.log('📡 API 응답 상태:', res.status);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log('📋 API에서 받은 데이터:', data);

      // 데이터가 배열인지 확인
      let items = Array.isArray(data) ? data : [];

      console.log('📋 처리할 게시글 수:', items.length);

      if (items.length === 0) {
        showEmptyState();
        return;
      }

      renderDesktopTable(items);
      renderMobileCards(items);
      console.log('✅ 데이터 표시 완료');
    })
    .catch((error) => {
      console.error('❌ 데이터 로딩 실패:', error);
      showErrorState();
    });
}

function renderDesktopTable(items) {
  const tableBody = document.getElementById('ticketBody');
  tableBody.innerHTML = '';

  items.forEach((ticket, idx) => {
    console.log(`🎫 티켓 ${idx + 1}:`, ticket);

    const tr = document.createElement('tr');
    // title_masked 또는 title 필드 사용
    const title = ticket.title_masked || ticket.title || '';
    const maskedTitle =
      title.length > 2 ? title.slice(0, 2) + '****' : '비밀글';

    tr.innerHTML = `
      <td><strong>${idx + 1}</strong></td>
      <td>
        <div style="font-weight: 500;">${maskedTitle}</div>
      </td>
      <td>
        <span class="status-badge ${getStatusClass(ticket.status)}">
          ${getStatusText(ticket.status)}
        </span>
      </td>
      <td>
        <span class="reply-badge ${
          ticket.has_admin_reply ? 'reply-yes' : 'reply-no'
        }">
          ${ticket.has_admin_reply ? 'Y' : 'N'}
        </span>
      </td>
      <td>
        <div style="font-size: 13px; color: #6c757d;">
          ${formatDate(ticket.created_at)}
        </div>
      </td>
    `;

    tr.onclick = () => showPasswordModal(ticket.ticket_id);
    tableBody.appendChild(tr);
  });
}

function renderMobileCards(items) {
  const mobileContainer = document.getElementById('mobileCardView');
  mobileContainer.innerHTML = '';

  items.forEach((ticket, idx) => {
    // title_masked 또는 title 필드 사용
    const title = ticket.title_masked || ticket.title || '';
    const maskedTitle =
      title.length > 2 ? title.slice(0, 2) + '****' : '비밀글';

    const cardElement = document.createElement('div');
    cardElement.className = 'ticket-card';
    cardElement.onclick = () => showPasswordModal(ticket.ticket_id);

    cardElement.innerHTML = `
      <div class="card-header">
        <div class="card-number">#${idx + 1}</div>
        <span class="reply-badge ${
          ticket.has_admin_reply ? 'reply-yes' : 'reply-no'
        }">
          ${ticket.has_admin_reply ? 'Y' : 'N'}
        </span>
      </div>
      <div class="card-title">${maskedTitle}</div>
      <div class="card-meta">
        <span class="status-badge ${getStatusClass(ticket.status)}">
          ${getStatusText(ticket.status)}
        </span>
        <div class="card-date">${formatDate(ticket.created_at)}</div>
      </div>
    `;

    mobileContainer.appendChild(cardElement);
  });
}

function getStatusClass(status) {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return 'status-open';
    case 'ANSWERED':
      return 'status-answered';
    case 'CLOSED':
      return 'status-closed';
    default:
      return 'status-open';
  }
}

function getStatusText(status) {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return '대기중';
    case 'ANSWERED':
      return '답변완료';
    case 'CLOSED':
      return '마감';
    default:
      return '대기중';
  }
}

function formatDate(dateString) {
  try {
    // 날짜 문자열이 없으면 현재 시간 사용
    if (!dateString) {
      console.warn('⚠️ 날짜 정보가 없습니다.');
      return '날짜 없음';
    }

    // MSSQL에서 온 날짜 문자열을 정확히 파싱
    const date = new Date(dateString);

    // 유효하지 않은 날짜 체크
    if (isNaN(date.getTime())) {
      console.warn('⚠️ 유효하지 않은 날짜:', dateString);
      return dateString; // 원본 문자열 반환
    }

    // 한국 시간 형식으로 날짜와 시간 표시
    // 예: 2024/01/15 오후 2:30
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // 오전/오후 표시
    });
  } catch (error) {
    console.error('❌ 날짜 포맷 오류:', error, '원본:', dateString);
    return dateString || '날짜 오류';
  }
}

function showEmptyState() {
  const tableBody = document.getElementById('ticketBody');
  const mobileContainer = document.getElementById('mobileCardView');

  const emptyContent = `
    <div class="empty-state">
      <div class="empty-state-icon">📝</div>
      <h3>상담요청이 없습니다</h3>
      <p>첫 번째 상담요청을 작성해보세요!</p>
    </div>
  `;

  // 테이블 빈 상태
  tableBody.innerHTML = `
    <tr>
      <td colspan="5">${emptyContent}</td>
    </tr>
  `;

  // 모바일 빈 상태
  mobileContainer.innerHTML = emptyContent;
}

function showErrorState() {
  const tableBody = document.getElementById('ticketBody');
  const mobileContainer = document.getElementById('mobileCardView');

  const errorContent = `
    <div class="empty-state">
      <div class="empty-state-icon">⚠️</div>
      <h3>데이터를 불러올 수 없습니다</h3>
      <p>잠시 후 다시 시도해주세요.</p>
      <button class="grid-btn" onclick="loadTickets()" style="margin-top: 16px;">
        🔄 다시 시도
      </button>
    </div>
  `;

  // 테이블 에러 상태
  tableBody.innerHTML = `
    <tr>
      <td colspan="5">${errorContent}</td>
    </tr>
  `;

  // 모바일 에러 상태
  mobileContainer.innerHTML = errorContent;
}

function showPasswordModal(ticketId) {
  console.log('🚪 showPasswordModal 호출됨');
  console.log('🎫 받은 ticketId:', ticketId);
  console.log('🎫 ticketId type:', typeof ticketId);

  selectedTicketId = ticketId;
  console.log('✅ selectedTicketId 설정됨:', selectedTicketId);

  const modal = document.getElementById('passwordModal');
  const passwordInput = document.getElementById('modalPassword');
  const errorMessage = document.getElementById('modalErrorMessage');

  // 모달 초기화
  passwordInput.value = '';
  errorMessage.style.display = 'none';
  errorMessage.textContent = '';

  // 모달 표시
  modal.style.display = 'block';

  // 비밀번호 입력란에 포커스
  setTimeout(() => passwordInput.focus(), 100);
}

function closePasswordModal() {
  const modal = document.getElementById('passwordModal');
  modal.style.display = 'none';
  selectedTicketId = null;
}

function confirmPassword() {
  const password = document.getElementById('modalPassword').value;
  const errorMessage = document.getElementById('modalErrorMessage');

  console.log('🔐 confirmPassword 호출됨');
  console.log('🎫 selectedTicketId:', selectedTicketId);
  console.log('🔑 password length:', password.length);

  // 에러 메시지 초기화
  errorMessage.style.display = 'none';
  errorMessage.textContent = '';

  if (!password.trim()) {
    errorMessage.textContent = '비밀번호를 입력하세요.';
    errorMessage.style.display = 'block';
    return;
  }

  if (!selectedTicketId) {
    console.error('❌ selectedTicketId가 없음!');
    errorMessage.textContent = '티켓 ID가 없습니다. 다시 시도해주세요.';
    errorMessage.style.display = 'block';
    return;
  }

  // 비밀번호 확인 API 호출
  const ticketIdToVerify = selectedTicketId; // ID 미리 백업
  console.log('🔄 API 호출 전 ID 백업:', ticketIdToVerify);

  fetch(`/api/v1/tickets/${ticketIdToVerify}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_password: password }),
    credentials: 'same-origin', // 쿠키 포함
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.ok) {
        // 비밀번호가 맞으면 상세 페이지로 이동
        console.log('✅ 비밀번호 인증 성공! 이동할 ID:', ticketIdToVerify);
        closePasswordModal();
        console.log('🚀 페이지 이동:', `/view?id=${ticketIdToVerify}`);
        location.href = `/view?id=${ticketIdToVerify}`; // 백업된 ID 사용
      } else {
        // 비밀번호가 틀리면 에러 메시지 표시
        errorMessage.textContent = '비밀번호가 틀렸습니다. 다시 확인해주세요.';
        errorMessage.style.display = 'block';
        document.getElementById('modalPassword').value = '';
        document.getElementById('modalPassword').focus();
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      errorMessage.textContent = '비밀번호 확인 중 오류가 발생했습니다.';
      errorMessage.style.display = 'block';
    });
}

// 모달 외부 클릭 시 닫기
document.addEventListener('click', (event) => {
  const modal = document.getElementById('passwordModal');
  if (event.target === modal) {
    closePasswordModal();
  }
});
