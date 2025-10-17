// new_modal.js
// 기존 제출 로직 + 모달 열기/닫기 로직 통합

// ---- 제출 로직 (원본 new.js 기반) ----
document.getElementById('ticketForm').addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('🚀 MSSQL에 새 게시글 저장 시작...');

  // 개인정보 동의 체크 검증
  const agreementCheckbox = document.getElementById('agreement');
  if (!agreementCheckbox.checked) {
    alert('개인정보 수집·이용 및 서비스 이용약관에 동의해주세요.');
    agreementCheckbox.focus();
    return;
  }

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  // 동의 체크박스 값 처리
  data.agreement = agreementCheckbox.checked ? 1 : 0;

  // snsgu 필드에 'A0001' 값 추가
  data.snsgu = 'A0001';

  console.log('📝 저장할 데이터:', data);
  console.log('✅ 개인정보 동의 여부:', data.agreement);
  console.log('🏢 snsgu 값:', data.snsgu);

  fetch('/api/v1/tickets/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then((res) => {
      console.log('📡 저장 응답 상태:', res.status);
      console.log('📡 응답 헤더:', res.headers);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return res.json();
    })
    .then((r) => {
      console.log('✅ 서버 응답:', r);
      if (r.ok) {
        console.log('✅ 저장 성공!');
        alert('상담요청이 저장되었습니다.');
        location.href = '/list';
      } else {
        console.error('❌ 저장 실패:', r.error);
        alert(`저장 실패: ${r.error || '알 수 없는 오류'}`);
      }
    })
    .catch((error) => {
      console.error('❌ 연결 오류 상세:', error);
      console.error('❌ 오류 타입:', typeof error);
      console.error('❌ 오류 메시지:', error.message);
      console.error('❌ 전체 스택:', error.stack);
      alert(`데이터베이스 연결 오류: ${error.message || error}`);
    });
});

// ---- 모달 유틸 ----
(function () {
  const openButtons = document.querySelectorAll('[data-open-modal]');
  const closeSelectors = '[data-close-modal]';
  let lastFocused = null;

  function disableScroll() {
    document.body.dataset.prevOverflow = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';
  }
  function enableScroll() {
    document.body.style.overflow = document.body.dataset.prevOverflow || '';
    delete document.body.dataset.prevOverflow;
  }

  function trapFocus(modalEl) {
    const focusable = modalEl.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
  }

  function openModal(target) {
    const backdrop = document.querySelector(target);
    if (!backdrop) return;

    lastFocused = document.activeElement;
    backdrop.setAttribute('aria-hidden', 'false');
    disableScroll();
    // body 클릭 닫기
    backdrop.addEventListener('mousedown', onBackdropMouseDown);
    // ESC 닫기
    document.addEventListener('keydown', onKeydown);
    // 포커스 트랩
    setTimeout(() => trapFocus(backdrop), 0);
  }

  function closeModal(backdrop) {
    backdrop.setAttribute('aria-hidden', 'true');
    enableScroll();
    backdrop.removeEventListener('mousedown', onBackdropMouseDown);
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  function onBackdropMouseDown(e) {
    const backdrop = e.currentTarget;
    const dialog = backdrop.querySelector('.modal');
    const clickedInside = dialog.contains(e.target);
    if (!clickedInside) closeModal(backdrop);
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      const opened = document.querySelector('.modal-backdrop[aria-hidden="false"]');
      if (opened) closeModal(opened);
    }
  }

  // open 버튼
  openButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-open-modal');
      openModal(target);
    });
  });

  // close 버튼
  document.querySelectorAll(closeSelectors).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const backdrop = e.target.closest('.modal-backdrop');
      if (backdrop) closeModal(backdrop);
    });
  });
})();