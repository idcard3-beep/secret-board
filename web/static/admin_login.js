console.log('=== 관리자 로그인 페이지 시작 ===');

// 메시지 표시 함수들
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  const successDiv = document.getElementById('success-message');

  // 기존 메시지 숨기기
  successDiv.style.display = 'none';

  // 에러 메시지 표시
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';

  // 3초 후 자동 숨김
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

function showSuccess(message) {
  const errorDiv = document.getElementById('error-message');
  const successDiv = document.getElementById('success-message');

  // 기존 메시지 숨기기
  errorDiv.style.display = 'none';

  // 성공 메시지 표시
  successDiv.textContent = message;
  successDiv.style.display = 'block';
}

function hideMessages() {
  document.getElementById('error-message').style.display = 'none';
  document.getElementById('success-message').style.display = 'none';
}

document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // 기존 메시지 숨기기
  hideMessages();

  const formData = new FormData(e.target);
  const data = {
    username: formData.get('username'),
    password: formData.get('password'),
  };

  console.log('🔑 로그인 시도:', { username: data.username, password: '***' });

  fetch('/api/v1/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      console.log('✅ 응답 상태:', response.status);
      console.log('✅ 응답 헤더:', response.headers.get('content-type'));

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return response.text().then((text) => {
          console.error('❌ JSON이 아닌 응답:', text);
          throw new Error(
            `서버에서 HTML 응답을 반환했습니다. 상태: ${response.status}`
          );
        });
      }

      // 성공/실패 상관없이 JSON 파싱해서 반환 (401 에러도 JSON 응답 처리)
      return response.json().then((data) => {
        return { ...data, status: response.status, ok: response.ok };
      });
    })
    .then((result) => {
      console.log('✅ 응답 데이터:', result);

      // 성공인 경우
      if (result.ok) {
        console.log('✅ 로그인 성공! 관리자 페이지로 이동...');
        showSuccess('로그인 성공! 관리자 페이지로 이동합니다...');

        // 1초 후 페이지 이동
        setTimeout(() => {
          location.href = '/admin_list';
        }, 1000);
      } else {
        // 실패인 경우 - 서버에서 제공하는 구체적인 에러 메시지 표시
        console.error('❌ 로그인 실패:', result.error);
        const errorMessage =
          result.error || '아이디 또는 비밀번호를 확인해주세요.';
        showError(errorMessage);

        // 해당 필드에 포커스
        if (errorMessage.includes('ID') || errorMessage.includes('관리자')) {
          document.querySelector('input[name="username"]').focus();
        } else if (errorMessage.includes('비밀번호')) {
          document.querySelector('input[name="password"]').focus();
        }
      }
    })
    .catch((error) => {
      console.error('❌ 로그인 에러:', error);
      console.error('❌ 에러 스택:', error.stack);
      showError('로그인 중 오류가 발생했습니다: ' + error.message);
    });
});
