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
    admin_id: formData.get('admin_id'),
    password: formData.get('password'),
  };

  console.log('🔑 로그인 시도:', { admin_id: data.admin_id, password: '***' });

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
        // admin_status 확인 (대소문자 구분 없이)
        const adminStatus = (result.admin?.admin_status || '').toUpperCase();
        console.log('📋 관리자 상태(admin_status):', adminStatus);

        // OPEN 상태만 로그인 허용
        if (adminStatus === 'OPEN') {
          console.log('✅ 로그인 성공! 관리자 페이지로 이동...');
          showSuccess('로그인 성공! 관리자 페이지로 이동합니다...');

          // 전역 변수에 관리자 정보 저장
          if (result.admin && typeof window.setAdminSession === 'function') {
            window.setAdminSession(result.admin);
            console.log('✅ 관리자 세션 전역 변수 설정 완료:', result.admin);
          } else {
            console.warn(
              '⚠️ admin_session.js가 로드되지 않았거나 관리자 정보가 없습니다.'
            );
          }

          // 1초 후 페이지 이동
          setTimeout(() => {
            location.href = '/admin_list';
          }, 1000);
        } else {
          // OPEN이 아닌 경우 - 상태에 따라 메시지 표시
          console.warn('⚠️ 로그인 불가 - 계정 상태:', adminStatus);

          let statusMessage = '';
          if (adminStatus === 'LOCKED') {
            statusMessage =
              '❌ 로그인할 수 없는 계정 상태입니다.\n계정 상태: 잠김(LOCKED)\n관리자에게 문의하세요.';
          } else if (adminStatus === 'DELETED') {
            statusMessage =
              '❌ 로그인할 수 없는 계정 상태입니다.\n계정 상태: 삭제됨(DELETED)\n관리자에게 문의하세요.';
          } else {
            statusMessage = `❌ 로그인할 수 없는 계정 상태입니다.\n계정 상태: ${adminStatus}\n관리자에게 문의하세요.`;
          }

          showError(statusMessage);

          // 전역 변수 초기화
          if (typeof window.clearAdminSession === 'function') {
            window.clearAdminSession();
            console.log('🔄 관리자 세션 전역 변수 초기화 완료');
          }
        }
      } else {
        // 실패인 경우 - 서버에서 제공하는 구체적인 에러 메시지 표시
        console.error('❌ 로그인 실패:', result.error);
        const errorMessage =
          result.error || '아이디 또는 비밀번호를 확인해주세요.';
        showError(errorMessage);

        // 전역 변수 초기화
        if (typeof window.clearAdminSession === 'function') {
          window.clearAdminSession();
          console.log('🔄 관리자 세션 전역 변수 초기화 완료');
        }

        // 해당 필드에 포커스
        if (errorMessage.includes('ID') || errorMessage.includes('관리자')) {
          document.querySelector('input[name="admin_id"]').focus();
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
