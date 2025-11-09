/**
 * 관리자 세션 전역 변수 관리
 * 모든 HTML 페이지에서 사용 가능한 전역 변수
 */

// 전역 변수 선언
window.ADMIN_SESSION = {
  admin_id: null,
  username: null,
  role: null,
  isLoggedIn: false,
};

/**
 * 관리자 세션 정보 설정
 * @param {Object} adminData - 관리자 정보 {admin_id, username, role}
 */
window.setAdminSession = function (adminData) {
  console.log('🔐 관리자 세션 설정:', adminData);

  if (adminData) {
    window.ADMIN_SESSION.admin_id = adminData.admin_id || null;
    window.ADMIN_SESSION.username = adminData.username || null;
    window.ADMIN_SESSION.role = adminData.role || null;
    window.ADMIN_SESSION.isLoggedIn = true;

    // localStorage에도 저장 (페이지 새로고침 시 유지)
    try {
      localStorage.setItem(
        'admin_session',
        JSON.stringify(window.ADMIN_SESSION)
      );
      console.log('✅ 관리자 세션 localStorage 저장 완료');
    } catch (e) {
      console.warn('⚠️ localStorage 저장 실패:', e);
    }
  }
};

/**
 * 관리자 세션 정보 초기화 (완전 초기화)
 */
window.clearAdminSession = function () {
  console.log('🔓 관리자 세션 완전 초기화 시작...');

  // 1. 전역 변수 완전 재생성
  window.ADMIN_SESSION = {
    admin_id: null,
    username: null,
    role: null,
    isLoggedIn: false,
  };
  console.log('   ✓ 전역 변수 초기화 완료');

  // 2. localStorage 완전 삭제
  try {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('adminData'); // 기존 adminData도 제거
    localStorage.removeItem('mock_admin_token'); // 토큰도 제거
    localStorage.removeItem('admin_id'); // 개별 항목도 제거
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    console.log('   ✓ localStorage 완전 삭제 완료');
  } catch (e) {
    console.warn('   ⚠️ localStorage 삭제 실패:', e);
  }

  // 3. sessionStorage 관리자 관련 데이터도 제거 (혹시 모를 경우 대비)
  try {
    sessionStorage.removeItem('admin_session');
    sessionStorage.removeItem('adminData');
    sessionStorage.removeItem('mock_admin_token');
    console.log('   ✓ sessionStorage 정리 완료');
  } catch (e) {
    console.warn('   ⚠️ sessionStorage 정리 실패:', e);
  }

  console.log('✅ 관리자 세션 완전 초기화 완료');
  console.log('   최종 상태:', window.ADMIN_SESSION);
};

/**
 * 관리자 세션 정보 가져오기
 * @returns {Object} 관리자 세션 정보
 */
window.getAdminSession = function () {
  return window.ADMIN_SESSION;
};

/**
 * localStorage에서 세션 정보 복원
 */
window.restoreAdminSession = function () {
  try {
    const saved = localStorage.getItem('admin_session');
    if (saved) {
      const data = JSON.parse(saved);
      window.ADMIN_SESSION = data;
      console.log('✅ localStorage에서 관리자 세션 복원:', data);
      return true;
    }
  } catch (e) {
    console.warn('⚠️ localStorage 세션 복원 실패:', e);
  }
  return false;
};

// 페이지 로드 시 세션 복원 시도
window.restoreAdminSession();

console.log('✅ admin_session.js 로드 완료 - 전역 변수 준비됨');
