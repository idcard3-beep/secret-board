// 전역 변수
let ticketId = null;

// 전역 함수 - HTML의 onclick에서 접근 가능하도록
function cancelEdit() {
  if (!ticketId) {
    const urlParams = new URLSearchParams(window.location.search);
    ticketId = urlParams.get('id');
  }
  
  if (confirm('수정을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
    window.location.href = `/secret/view?id=${ticketId}`;
  }
}

document.addEventListener('DOMContentLoaded', function() {
      console.log('=== 게시글 수정 페이지 시작 (상태 양호) ===');

      // URL에서 ID 가져오기
      const urlParams = new URLSearchParams(window.location.search);
      ticketId = urlParams.get('id');

      console.log('✅ URL에서 가져온 ID:', ticketId);
      console.log('🗄️ 연결 모드로 실행 중...');

      if (!ticketId) {
        console.error('❌ ID가 없습니다!');
        showError('게시글 ID가 없습니다.');
      } else {
        // 게시글 정보 먼저 로드 (비밀번호 확인 전에)
        loadTicketInfo();
      }

      function loadTicketInfo() {
        const url = `/secret/api/v1/tickets/${ticketId}`;
        console.log('🚀 게시글 정보 로드:', url);

        fetch(url, {
          credentials: 'same-origin' // 쿠키 포함
        })
          .then((response) => {
            console.log('✅ 응답 상태:', response.status);
            if (!response.ok) {
              if (response.status === 401) {
                // 401 에러는 비밀번호 입력 필요
                showError('비밀번호를 입력해야 합니다. view 페이지로 돌아가서 비밀번호를 입력하세요.');
                return;
              }
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }
            return response.json();
          })
          .then((data) => {
            if (!data) return;
            
            console.log('✅ 받은 데이터:', data);

            // 관리자 답변이 있는지 확인
            const messages = data.messages || [];
            if (messages.length > 0) {
              showError('관리자 답변이 있어서 더 이상 수정할 수 없습니다.');
              return;
            }

            // 게시글 정보를 임시 저장하고 바로 수정 폼 표시
            window.ticketData = data.ticket;
            showEditForm();
          })
          .catch((error) => {
            console.error('❌ 에러:', error);
            showError(`데이터를 불러오는데 실패했습니다: ${error.message}`);
          });
      }

      function showEditForm() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('edit-form').style.display = 'block';

        // 폼에 기존 데이터 채우기
        const ticket = window.ticketData;
        document.getElementById('ticket-id').value =
          ticket.ticket_id || ticket.id;
        document.getElementById('author-name').value = ticket.author_name || '';
        document.getElementById('author-contact').value =
          ticket.author_contact || '';
        document.getElementById('title').value = ticket.title || '';
        document.getElementById('content').value = ticket.content || '';

        // 폼 제출 처리 (폼이 표시된 후에 이벤트 리스너 설정)
        const ticketForm = document.getElementById('ticketForm');
        if (ticketForm) {
          // 기존 리스너 제거 후 새로 추가
          const newForm = ticketForm.cloneNode(true);
          ticketForm.parentNode.replaceChild(newForm, ticketForm);
          
          newForm.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('📝 폼 제출 이벤트 발생');

            const formData = new FormData(newForm);
            const data = {
              author_name: formData.get('author_name'),
              author_contact: formData.get('author_contact'),
              title: formData.get('title'),
              content: formData.get('content'),
            };

            console.log('📝 수정 데이터:', data);
            console.log('🗄️ 수정 요청 전송 중...');

            fetch(`/secret/api/v1/tickets/${ticketId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'same-origin', // 쿠키 포함
              body: JSON.stringify(data),
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                  );
                }
                return response.json();
              })
              .then((result) => {
                console.log('✅ 수정 완료:', result);
                alert('게시글이 성공적으로 수정되었습니다!');
                window.location.href = `/secret/view?id=${ticketId}`;
              })
              .catch((error) => {
                console.error('❌ 수정 에러:', error);
                alert(`수정 중 오류가 발생했습니다: ${error.message}`);
              });
          });
        }
      }

      function showError(message) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error-message').textContent = message;
        document.getElementById('error').style.display = 'block';
      }
}); // DOMContentLoaded 종료