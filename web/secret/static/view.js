// view.js - 게시글 상세보기 페이지 스크립트

document.addEventListener('DOMContentLoaded', function () {
  // edit.html에서는 실행하지 않음
  if (document.getElementById('edit-form')) {
    console.log('⚠️ edit.html 페이지에서 view.js 실행 감지 - 무시합니다');
    return;
  }
  
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
  const contentElement = document.getElementById('ticket-content');
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

    const apiUrl = `/secret/api/v1/tickets/${ticketId}`;
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
      if (response.status === 401) {
        // 401 에러 처리
        // list.html에서 이미 비밀번호를 확인했다면 쿠키가 있을 수 있음
        // 하지만 토큰이 만료되었거나 유효하지 않을 수 있으므로 비밀번호 폼 표시
        const errorData = await response.json().catch(() => ({}));
        console.log('🔐 401 에러 - 비밀번호 입력 필요');
        console.log('   에러 상세:', errorData);
        
        // list.html에서 비밀번호 확인 후 바로 온 경우를 확인
        // 세션 스토리지에 플래그가 있으면 잠시 대기 후 재시도
        const fromList = sessionStorage.getItem('password_verified_' + ticketId);
        if (fromList) {
          console.log('⚠️ list.html에서 비밀번호 확인 후 온 경우 - 잠시 대기 후 재시도');
          sessionStorage.removeItem('password_verified_' + ticketId);
          // 쿠키 설정을 기다리기 위해 잠시 대기
          await new Promise(resolve => setTimeout(resolve, 500));
          // 재시도
          return loadContent(ticketId);
        }
        
        showPasswordForm(ticketId);
        return;
      }
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
      console.log('📧 메시지 데이터:', data.messages || []);
      displayContent(data.ticket, data.messages || []);
    } else {
      console.error('❌ data.ticket이 없음. 응답 구조:', Object.keys(data));
      throw new Error('티켓 데이터를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('💥 Error in loadContent:', error);
    console.error('💥 Error stack:', error.stack);
    
    // 401 에러는 이미 처리됨
    if (error.message.includes('401')) {
      return;
    }
    
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

function displayContent(ticket, messages = []) {
  console.log('🎨 displayContent 함수 시작', JSON.stringify(ticket, null, 2));
  console.log('📧 받은 메시지 개수:', messages.length);

  // DOM이 완전히 로드되었는지 확인
  if (document.readyState === 'loading') {
    console.warn('⚠️ DOM이 아직 로딩 중입니다. 잠시 후 다시 시도합니다.');
    setTimeout(() => displayContent(ticket, messages), 100);
    return;
  }

  const contentElement = document.getElementById('ticket-content');
  if (!contentElement) {
    console.error('❌ Content element (ticket-content) not found');
    console.error('   현재 DOM 상태:', {
      readyState: document.readyState,
      body: document.body ? '있음' : '없음',
      container: document.querySelector('.container') ? '있음' : '없음',
      allIds: Array.from(document.querySelectorAll('[id]')).map(el => el.id)
    });
    showError('페이지 요소를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
    return;
  }

  try {
    // 기본 정보 표시
    console.log('🎫 Received ticket data:', ticket);
    console.log('📞 author_contact value:', ticket.author_contact);

    const titleElement = document.getElementById('ticket-title');
    const authorElement = document.getElementById('ticket-author');
    const contactElement = document.getElementById('ticket-contact');
    const contentTextElement = document.getElementById('ticket-body');
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

    // 메시지(답변) 표시
    displayMessages(messages);

    // 수정 버튼 표시/숨김 처리
    const editDisabledMsg = document.getElementById('edit-disabled-message');
    const editButton = document.getElementById('edit-button');
    
    if (messages && messages.length > 0) {
      // 관리자 답변이 있으면 수정 불가
      if (editDisabledMsg) {
        editDisabledMsg.style.display = 'block';
      }
      if (editButton) {
        editButton.style.display = 'none';
      }
    } else {
      // 관리자 답변이 없으면 수정 버튼 표시
      if (editDisabledMsg) {
        editDisabledMsg.style.display = 'none';
      }
      if (editButton) {
        editButton.style.display = 'block';
      }
    }

    // 컨텐츠 영역 표시
    contentElement.style.display = 'block';
    console.log('✅ 컨텐츠 영역 표시');

    console.log('🎉 컨텐츠 표시 완료');
  } catch (error) {
    console.error('💥 Error displaying content:', error);
    showError('컨텐츠를 표시하는 데 실패했습니다: ' + error.message);
  }
}

function displayMessages(messages) {
  console.log('📧 displayMessages 함수 시작, 메시지 개수:', messages.length);

  const messagesListElement = document.getElementById('messages-list');
  if (!messagesListElement) {
    console.error('❌ messages-list 요소를 찾을 수 없습니다');
    return;
  }

  // 기존 내용 초기화
  messagesListElement.innerHTML = '';

  if (!messages || messages.length === 0) {
    console.log('📧 메시지가 없음 - "답변이 없습니다" 표시');
    messagesListElement.innerHTML = '<div class="no-messages">아직 답변이 없습니다.</div>';
    return;
  }

  console.log('📧 메시지 표시 시작:', messages);

  // 각 메시지를 표시
  messages.forEach((message, index) => {
    console.log(`📧 메시지 [${index}] 처리:`, message);
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'admin-message';

    const messageContent = message.content || message.message_content || message.reply_content || '내용 없음';
    const messageDate = message.created_at || message.reply_date || message.created_date || '';
    const adminName = message.admin_name || message.author_name || '관리자';

    messageDiv.innerHTML = `
      <div class="admin-message-header">
        <span>👤 ${adminName}</span>
      </div>
      <div class="admin-message-content">
        ${escapeHtml(messageContent).replace(/\n/g, '<br>')}
      </div>
      ${messageDate ? `<div class="admin-message-date">${formatDate(messageDate)}</div>` : ''}
    `;

    messagesListElement.appendChild(messageDiv);
    console.log(`✅ 메시지 [${index}] 추가 완료`);
  });

  console.log('✅ 모든 메시지 표시 완료');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showPasswordForm(ticketId) {
  console.log('🔐 비밀번호 입력 폼 표시:', ticketId);
  
  const loadingElement = document.getElementById('loading');
  const passwordFormElement = document.getElementById('password-form');
  const contentElement = document.getElementById('ticket-content');
  const errorElement = document.getElementById('error');
  
  // 로딩 화면 숨기기
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
  
  // 에러 숨기기
  if (errorElement) {
    errorElement.style.display = 'none';
  }
  
  // 컨텐츠 숨기기
  if (contentElement) {
    contentElement.style.display = 'none';
  }
  
  // 비밀번호 폼 표시
  if (passwordFormElement) {
    passwordFormElement.style.display = 'block';
    
    // 폼 제출 이벤트 리스너 추가
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
      // 기존 리스너 제거 후 새로 추가
      const newForm = passwordForm.cloneNode(true);
      passwordForm.parentNode.replaceChild(newForm, passwordForm);
      
      newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await verifyPassword(ticketId);
      });
    }
  } else {
    console.error('❌ password-form 요소를 찾을 수 없습니다');
  }
}

async function verifyPassword(ticketId) {
  console.log('🔐 비밀번호 검증 시작:', ticketId);
  
  const passwordInput = document.getElementById('post-password');
  const password = passwordInput ? passwordInput.value : '';
  
  if (!password) {
    alert('비밀번호를 입력하세요.');
    return;
  }
  
  const passwordFormElement = document.getElementById('password-form');
  const loadingElement = document.getElementById('loading');
  
  // 폼 숨기기
  if (passwordFormElement) {
    passwordFormElement.style.display = 'none';
  }
  
  // 로딩 표시
  if (loadingElement) {
    loadingElement.style.display = 'block';
  }
  
  try {
    const response = await fetch(`/secret/api/v1/tickets/${ticketId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin', // 쿠키 포함
      body: JSON.stringify({
        post_password: password
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.ok) {
      console.log('✅ 비밀번호 검증 성공, 토큰 생성됨');
      // 비밀번호 입력 필드 초기화
      if (passwordInput) {
        passwordInput.value = '';
      }
      // 다시 컨텐츠 로드
      await loadContent(ticketId);
    } else {
      console.error('❌ 비밀번호 검증 실패:', data.error);
      alert('비밀번호가 올바르지 않습니다.');
      // 폼 다시 표시
      if (passwordFormElement) {
        passwordFormElement.style.display = 'block';
      }
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
      if (passwordInput) {
        passwordInput.focus();
      }
    }
  } catch (error) {
    console.error('💥 비밀번호 검증 중 오류:', error);
    alert('비밀번호 검증 중 오류가 발생했습니다: ' + error.message);
    // 폼 다시 표시
    if (passwordFormElement) {
      passwordFormElement.style.display = 'block';
    }
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }
}

function showError(message) {
  console.error('Error:', message);

  const errorElement = document.getElementById('error');
  const errorMessageElement = document.getElementById('error-message');
  const contentElement = document.getElementById('ticket-content');
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
    // ISO 형식 문자열 또는 다른 형식의 날짜 문자열 파싱
    let date;
    
    // 이미 Date 객체인 경우
    if (dateString instanceof Date) {
      date = dateString;
    } else {
      // 문자열인 경우
      // PostgreSQL의 timestamp 형식도 처리
      // 예: "2024-12-20 15:30:45.123456" 또는 "2024-12-20T15:30:45.123456"
      // 공백을 T로 변환하여 ISO 형식으로 만들기
      let dateStr = String(dateString).trim();
      
      // PostgreSQL 형식: "2024-12-20 15:30:45.123456" -> "2024-12-20T15:30:45.123456"
      if (dateStr.includes(' ') && !dateStr.includes('T')) {
        dateStr = dateStr.replace(' ', 'T');
      }
      
      date = new Date(dateStr);
    }
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.warn('⚠️ 유효하지 않은 날짜:', dateString);
      return dateString; // 원본 반환
    }
    
    // 한국 시간대로 포맷팅
    // toLocaleString은 브라우저의 로컬 시간대를 사용하지만, 
    // timeZone 옵션을 명시적으로 지정하여 한국 시간대 사용
    const formatted = date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // 24시간 형식
      timeZone: 'Asia/Seoul' // 한국 시간대 명시
    });
    
    return formatted;
  } catch (error) {
    console.error('❌ Date formatting error:', error, '원본:', dateString);
    return dateString; // 오류 발생 시 원본 반환
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

// 수정하기 함수
function editTicket() {
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('id');
  
  if (!ticketId) {
    alert('티켓 ID가 없습니다.');
    return;
  }
  
  // 수정 페이지로 이동
  window.location.href = `/secret/edit?id=${ticketId}`;
}
