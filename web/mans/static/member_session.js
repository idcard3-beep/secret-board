/**
 * 회원 세션 전역 변수 관리
 * 모든 HTML 페이지에서 사용 가능한 전역 변수
 */

// 전역 변수 선언
window.MEMBER_SESSION = {
  sMem_id: null,
  sMem_name: null,
  sMem_nickname: null,
  sMem_status: null,
  adviser_role: null,
  isLoggedIn: false,
};

/**
 * 회원 세션 정보 설정
 * @param {Object} memberData - 회원 정보 {sMem_id, sMem_name, sMem_nickname, sMem_status, adviser_role}
 */
window.setMemberSession = function (memberData) {
  console.log('🔐 회원 세션 설정:', memberData);

  if (memberData) {
    window.MEMBER_SESSION.sMem_id = memberData.sMem_id || null;
    window.MEMBER_SESSION.sMem_name = memberData.sMem_name || null;
    window.MEMBER_SESSION.sMem_nickname = memberData.sMem_nickname || null;
    window.MEMBER_SESSION.sMem_status = memberData.sMem_status || null;
    window.MEMBER_SESSION.adviser_role = memberData.adviser_role || null;
    window.MEMBER_SESSION.isLoggedIn = true;

    console.log(
      '📋 회원 상태(sMem_status):',
      window.MEMBER_SESSION.sMem_status
    );
    console.log(
      '👤 상담사 역할(adviser_role):',
      window.MEMBER_SESSION.adviser_role
    );

    // sessionStorage에 저장 (브라우저 닫으면 삭제)
    try {
      sessionStorage.setItem(
        'member_session',
        JSON.stringify(window.MEMBER_SESSION)
      );
      console.log('✅ 회원 세션 sessionStorage 저장 완료');
    } catch (e) {
      console.warn('⚠️ sessionStorage 저장 실패:', e);
    }
  }
};

/**
 * 회원 세션 정보 초기화 (완전 초기화)
 */
window.clearMemberSession = function () {
  console.log('🔓 회원 세션 완전 초기화 시작...');

  // 1. 전역 변수 초기화
  window.MEMBER_SESSION = {
    sMem_id: null,
    sMem_name: null,
    sMem_nickname: null,
    sMem_status: null,
    adviser_role: null,
    isLoggedIn: false,
  };
  console.log('   ✓ 전역 변수 초기화 완료');

  // 2. sessionStorage 완전 삭제
  try {
    sessionStorage.removeItem('member_session');
    sessionStorage.removeItem('memberData'); // 기존 memberData도 제거
    sessionStorage.removeItem('mock_access_token'); // 토큰도 제거
    sessionStorage.removeItem('sMem_id'); // 개별 항목도 제거
    sessionStorage.removeItem('sMem_name');
    sessionStorage.removeItem('sMem_nickname');
    console.log('   ✓ sessionStorage 완전 삭제 완료');
  } catch (e) {
    console.warn('   ⚠️ sessionStorage 삭제 실패:', e);
  }

  // 3. localStorage 회원 관련 데이터도 제거 (혹시 모를 경우 대비)
  try {
    localStorage.removeItem('member_session');
    localStorage.removeItem('memberData');
    localStorage.removeItem('mock_access_token');
    console.log('   ✓ localStorage 정리 완료');
  } catch (e) {
    console.warn('   ⚠️ localStorage 정리 실패:', e);
  }

  console.log('✅ 회원 세션 완전 초기화 완료');
  console.log('   최종 상태:', window.MEMBER_SESSION);
};

/**
 * 회원 세션 정보 가져오기
 * @returns {Object} 회원 세션 정보
 */
window.getMemberSession = function () {
  return window.MEMBER_SESSION;
};

/**
 * sessionStorage에서 세션 정보 복원
 */
window.restoreMemberSession = function () {
  try {
    const saved = sessionStorage.getItem('member_session');
    if (saved) {
      const data = JSON.parse(saved);
      window.MEMBER_SESSION = data;
      console.log('✅ sessionStorage에서 회원 세션 복원:', data);
      return true;
    }

    // 기존 memberData도 확인 (하위 호환성)
    const memberData = sessionStorage.getItem('memberData');
    if (memberData) {
      const data = JSON.parse(memberData);
      window.MEMBER_SESSION.sMem_id = data.sMem_id;
      window.MEMBER_SESSION.sMem_name = data.sMem_name;
      window.MEMBER_SESSION.sMem_nickname = data.sMem_nickname;
      window.MEMBER_SESSION.sMem_status = data.sMem_status;
      window.MEMBER_SESSION.adviser_role = data.adviser_role;
      window.MEMBER_SESSION.isLoggedIn = true;
      console.log('✅ memberData에서 회원 세션 복원:', data);
      return true;
    }
  } catch (e) {
    console.warn('⚠️ sessionStorage 세션 복원 실패:', e);
  }
  return false;
};

/**
 * 회원 로그인 여부 확인
 * @returns {boolean} 로그인 여부
 */
window.isMemberLoggedIn = function () {
  return (
    window.MEMBER_SESSION.isLoggedIn && window.MEMBER_SESSION.sMem_id !== null
  );
};

// 페이지 로드 시 세션 복원 시도
window.restoreMemberSession();

console.log('✅ member_session.js 로드 완료 - 전역 변수 준비됨');
