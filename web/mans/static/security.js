// 복사 방지 보안 스크립트
console.log('🔒 보안 스크립트 로드됨');

// 우클릭 방지
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
  alert('우클릭이 비활성화되어 있습니다.');
  return false;
});

// 키보드 단축키 방지
document.addEventListener('keydown', function (e) {
  // Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+V, Ctrl+X 방지
  if (
    e.ctrlKey &&
    (e.keyCode === 67 ||
      e.keyCode === 65 ||
      e.keyCode === 83 ||
      e.keyCode === 86 ||
      e.keyCode === 88)
  ) {
    e.preventDefault();
    alert('복사/붙여넣기가 비활성화되어 있습니다.');
    return false;
  }
  // F12, Ctrl+Shift+I, Ctrl+U 방지
  if (
    e.keyCode === 123 ||
    (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
    (e.ctrlKey && e.keyCode === 85)
  ) {
    e.preventDefault();
    alert('개발자 도구 접근이 제한되어 있습니다.');
    return false;
  }
  // Ctrl+Shift+C (개발자도구 콘솔) 방지
  if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
    e.preventDefault();
    alert('개발자 도구 접근이 제한되어 있습니다.');
    return false;
  }
});

// 텍스트 드래그 방지 (입력 필드 제외)
document.addEventListener('selectstart', function (e) {
  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    return false;
  }
});

// 드래그앤드롭 방지
document.addEventListener('dragstart', function (e) {
  e.preventDefault();
  return false;
});

// 이미지 저장 방지
document.addEventListener('DOMContentLoaded', function () {
  const images = document.querySelectorAll('img');
  images.forEach(function (img) {
    img.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      return false;
    });
    img.style.pointerEvents = 'none';
    img.style.userSelect = 'none';
  });
});

// 개발자 도구 감지 (간단한 방법)
let devtools = { open: false, orientation: null };
setInterval(function () {
  if (
    window.outerHeight - window.innerHeight > 200 ||
    window.outerWidth - window.innerWidth > 200
  ) {
    //if (!devtools.open) {
    //  devtools.open = true;
    //  alert('개발자 도구가 감지되었습니다.');
    //  // 필요시 페이지 리다이렉트 또는 내용 숨기기 가능
    //  // window.location.href = '/';
    //}
    devtools.open = false;
  } else {
    devtools.open = false;
  }
}, 500);

// 인쇄 방지
window.addEventListener('beforeprint', function (e) {
  alert('인쇄가 비활성화되어 있습니다.');
  e.preventDefault();
  return false;
});

// Ctrl+P 방지
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.keyCode === 80) {
    e.preventDefault();
    alert('인쇄가 비활성화되어 있습니다.');
    return false;
  }
});

console.log('🔒 보안 기능 활성화 완료');
