// view.js - 게시글 상세보기 페이지 스크립트

document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 View page loaded - DOMContentLoaded');

  // URL에서 ticket ID 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('id');

  console.log('🔍 현재 URL:', window.location.href);
  console.log('🔍 URL params:', window.location.search);
  console.log('🎫 Ticket ID from URL:', ticketId);
  console.log('🎫 Ticket ID type:', typeof ticketId);

  if (!ticketId || ticketId === 'null' || ticketId === 'undefined') {
    console.error('❌ 티켓 ID가 없거나 유효하지 않음:', ticketId);
    alert('올바르지 않은 접근입니다. 티켓 ID가 필요합니다.');
    window.location.href = '/';
    return;
  }

  console.log('✅ 티켓 ID 확인됨:', ticketId);

  // 페이지 로드 시 컨텐츠 불러오기
  console.log('📞 loadContent 호출 시작');
  loadContent(ticketId);
});

async function loadContent(ticketId) {
  console.log('🚀 loadContent 함수 시작. Ticket ID:', ticketId);

  const loadingElement = document.getElementById('loading');
  const contentElement = document.getElementById('content');
  const errorElement = document.getElementById('error');

  console.log('📍 DOM 요소 확인:', {
    loading: loadingElement ? '찾음' : '없음',
    content: contentElement ? '찾음' : '없음',
    error: errorElement ? '찾음' : '없음',
  });

  try {
    console.log('🔄 try 블록 시작');

    // 로딩 상태 표시
    if (loadingElement) {
      loadingElement.style.display = 'block';
      console.log('✅ 로딩 화면 표시됨');
    }
    if (contentElement) {
      contentElement.style.display = 'none';
      console.log('✅ 컨텐츠 숨김');
    }
    if (errorElement) {
      errorElement.style.display = 'none';
      console.log('✅ 에러 숨김');
    }

    const apiUrl = `/api/v1/tickets/${ticketId}`;
    console.log('📡 API URL 생성:', apiUrl);

    console.log('🌐 fetch 시작...');

    // API 호출
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin', // 쿠키 포함
    });

    console.log('📨 fetch 완료! 응답 상태:', response.status);
    console.log('📨 응답 헤더들:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 에러 응답:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log('📦 JSON 파싱 시작...');
    const data = await response.json();
    console.log('📦 JSON 파싱 완료:', JSON.stringify(data, null, 2));

    // 컨텐츠 표시 - API 응답에서 ticket 속성 추출
    if (data.ticket) {
      console.log('✅ 티켓 데이터 발견, displayContent 호출');
      displayContent(data.ticket);
    } else {
      console.error('❌ data.ticket이 없음. 응답 구조:', Object.keys(data));
      throw new Error('티켓 데이터를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('💥 Error in loadContent:', error);
    console.error('💥 Error stack:', error.stack);
    showError('게시글을 불러오는 데 실패했습니다: ' + error.message);
  } finally {
    console.log('🏁 finally 블록 실행');
    // 로딩 상태 숨기기
    if (loadingElement) {
      loadingElement.style.display = 'none';
      console.log('✅ 로딩 화면 숨김 완료');
    }
  }
}

function displayContent(ticket) {
  console.log('🎨 displayContent 함수 시작', JSON.stringify(ticket, null, 2));

  const contentElement = document.getElementById('content');
  if (!contentElement) {
    console.error('❌ Content element not found');
    return;
  }

  try {
    // 기본 정보 표시
    console.log('🎫 Received ticket data:', ticket);
    console.log('📞 author_contact value:', ticket.author_contact);

    const titleElement = document.getElementById('ticket-title');
    const authorElement = document.getElementById('ticket-author');
    const contactElement = document.getElementById('ticket-contact');
    const contentTextElement = document.getElementById('ticket-content');
    const createdAtElement = document.getElementById('ticket-date');

    console.log('📍 개별 요소 확인:', {
      title: titleElement ? '찾음' : '없음',
      author: authorElement ? '찾음' : '없음',
      contact: contactElement ? '찾음' : '없음',
      content: contentTextElement ? '찾음' : '없음',
      createdAt: createdAtElement ? '찾음' : '없음',
    });

    if (titleElement) {
      titleElement.textContent = ticket.title || '제목 없음';
      console.log('✅ 제목 설정:', ticket.title);
    }
    if (authorElement) {
      authorElement.textContent = ticket.author_name || '작성자 없음';
      console.log('✅ 작성자 설정:', ticket.author_name);
    }
    if (contactElement) {
      contactElement.textContent = ticket.author_contact || '연락처 없음';
      console.log('✅ 연락처 설정:', ticket.author_contact);
      console.log('📞 Contact element:', contactElement);
      console.log('📞 Contact element content:', contactElement.textContent);
    } else {
      console.log('❌ Contact element not found!');
    }
    if (contentTextElement) {
      contentTextElement.textContent = ticket.content || '내용 없음';
      console.log('✅ 내용 설정:', ticket.content);
    }
    if (createdAtElement) {
      const formattedDate = formatDate(ticket.created_at);
      createdAtElement.textContent = formattedDate;
      console.log('✅ 작성일 설정:', formattedDate);
    }

    // 관리자 응답 표시
    displayAdminResponse(ticket);

    // 컨텐츠 영역 표시
    contentElement.style.display = 'block';
    console.log('✅ 컨텐츠 영역 표시');

    console.log('🎉 컨텐츠 표시 완료');
  } catch (error) {
    console.error('💥 Error displaying content:', error);
    showError('컨텐츠를 표시하는 데 실패했습니다: ' + error.message);
  }
}

function displayAdminResponse(ticket) {
  console.log('displayAdminResponse 함수 시작');

  const adminResponseSection = document.getElementById(
    'admin-response-section'
  );
  const adminResponseContent = document.getElementById(
    'admin-response-content'
  );
  const adminResponseDate = document.getElementById('admin-response-date');

  if (!adminResponseSection) {
    console.log('Admin response section not found');
    return;
  }

  if (ticket.admin_response && ticket.admin_response.trim()) {
    // 관리자 응답이 있는 경우
    if (adminResponseContent) {
      adminResponseContent.textContent = ticket.admin_response;
    }
    if (adminResponseDate && ticket.admin_response_date) {
      adminResponseDate.textContent = formatDate(ticket.admin_response_date);
    }
    adminResponseSection.style.display = 'block';
    console.log('관리자 응답 표시됨');
  } else {
    // 관리자 응답이 없는 경우
    adminResponseSection.style.display = 'none';
    console.log('관리자 응답 없음');
  }
}

function showError(message) {
  console.error('Error:', message);

  const errorElement = document.getElementById('error');
  const errorMessageElement = document.getElementById('error-message');
  const contentElement = document.getElementById('content');
  const loadingElement = document.getElementById('loading');

  if (errorElement) {
    errorElement.style.display = 'block';
  }

  if (errorMessageElement) {
    errorMessageElement.textContent = message;
  }

  if (contentElement) {
    contentElement.style.display = 'none';
  }

  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
}

function formatDate(dateString) {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
}

// 뒤로 가기 함수
function goBack() {
  window.history.back();
}

// 목록으로 가기 함수
function goToList() {
  window.location.href = '/';
}
