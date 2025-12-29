/* 고급 만세력 달력 JavaScript - calendar.js */

// 컴팩트한 팝업으로 사주 정보 표시 (중기 정보 포함)
async function showGanziInfo(cell) {
  window.lastClickedCell = cell;
  var year = cell.getAttribute('data-year');
  var month = cell.getAttribute('data-month');
  var day = cell.getAttribute('data-day');
  var lunar = cell.getAttribute('data-lunar');

  // 클릭 시점의 컴퓨터 시간으로 시주 계산
  var now = new Date();
  var hour = now.getHours();
  var minute = now.getMinutes();

  let sajuResult = {};
  try {
    const res = await fetch(
      `/mans/get_saju?year=${year}&month=${month}&day=${day}&hour=${hour}&minute=${minute}`
    );
    sajuResult = await res.json();
  } catch (e) {
    sajuResult = {
      year: '오류',
      month: '오류',
      day: '오류',
      hour: '오류',
      info: { birth: '', yearP: '' },
    };
  }

  var info = sajuResult.info || {};
  var year_gz = sajuResult.year || '';
  var month_gz = sajuResult.month || '';
  var day_gz = sajuResult.day || '';
  var hour_gz = sajuResult.hour || '';

  // 시주 지지명 계산
  var hour_names = [
    '子시',
    '축시',
    '인시',
    '묘시',
    '진시',
    '사시',
    '오시',
    '미시',
    '신시',
    '유시',
    '술시',
    '해시',
  ];

  var hour_branch_idx = calculateHourBranchIndex(hour, minute);
  var hour_name = hour_names[hour_branch_idx];

  // 시각 포맷팅 (예: 12:14 오시)
  var hour_str = hour.toString().padStart(2, '0');
  var minute_str = minute.toString().padStart(2, '0');
  var hour_display = `${hour_str}:${minute_str} ${hour_name}`;

  // 절기 및 월상 정보 추출
  var currentTermName = cell.getAttribute('data-current-term-name') || '';
  var currentTermKst = cell.getAttribute('data-current-term-kst') || '';
  var jeolipKst = cell.getAttribute('data-jeolip-kst') || '';
  var jeolipTerm = cell.getAttribute('data-jeolip-term') || '';
  var junggiKst = cell.getAttribute('data-junggi-kst') || '';
  var junggiTerm = cell.getAttribute('data-junggi-term') || '';
  var nextJeolipKst = cell.getAttribute('data-next-jeolip-kst') || '';
  var nextJeolipTerm = cell.getAttribute('data-next-jeolip-term') || '';
  var newMoonKst = cell.getAttribute('data-new-moon-kst') || '';
  var fullMoonKst = cell.getAttribute('data-full-moon-kst') || '';

  // 디버깅용 (콘솔 확인용)
  // console.log('jeolipTerm:', jeolipTerm, 'junggiTerm:', junggiTerm, 'nextJeolipTerm:', nextJeolipTerm);

  // 컴팩트한 HTML 생성
  var titleHtml = `${year}.${month}.${day}`;

  // 요일 계산
  var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  var dateObj = new Date(year, month - 1, day);
  var dayName = dayNames[dateObj.getDay()];

  var contentHtml = `
    <div class="popup-section solar-section">
      <div class="compact-row">
        <span class="compact-label">양력</span>
        <span class="compact-value">${year}년 ${month}월 ${day}일 ${dayName}요일</span>
      </div>
      <div class="compact-row">
        <span class="compact-label">음력</span>
        <span class="compact-value">${lunar}</span>
      </div>
    </div>

    <div class="popup-section saju-section">
      <div class="section-header">🔮 사주</div>
      <div class="compact-row">
        <span class="compact-value" style="font-size:0.75rem;font-weight:600;white-space:nowrap;">${year_gz}年 ${month_gz}月 ${day_gz}日 ${hour_gz}時</span>
      </div>
      <div class="compact-row">
        <span class="compact-label">시각</span>
        <span class="compact-value">${hour_display}</span>
      </div>
    </div>`;

  // 절기 정보 섹션
  if (currentTermName || jeolipKst || junggiKst || nextJeolipKst) {
    contentHtml += `
      <div class="popup-section term-section">
        <div class="section-header">🌅 절기</div>`;

    if (currentTermName && currentTermKst && currentTermName !== 'None') {
      var termDate = formatDate(currentTermKst);
      contentHtml += `
        <div class="compact-row">
          <span class="compact-label">현재절기</span>
          <span class="compact-value">${currentTermName} (${termDate})</span>
        </div>`;
    }

    if (jeolipKst) {
      var jeolipDate = formatDate(jeolipKst);
      // 절입명칭 표시
      var jeolipDisplayTerm =
        jeolipTerm && jeolipTerm.trim() !== '' ? jeolipTerm : '';
      contentHtml += `
        <div class="compact-row">
          <span class="compact-label">이달절입</span>
          <span class="compact-value">${jeolipDisplayTerm} (${jeolipDate})</span>
        </div>`;
    }

    if (junggiKst) {
      var junggiDate = formatDate(junggiKst);
      // 중기명칭 표시
      var junggiDisplayTerm =
        junggiTerm && junggiTerm.trim() !== '' ? junggiTerm : '';
      contentHtml += `
        <div class="compact-row">
          <span class="compact-label">이달중기</span>
          <span class="compact-value">${junggiDisplayTerm} (${junggiDate})</span>
        </div>`;
    }

    if (nextJeolipKst) {
      var nextDate = formatDate(nextJeolipKst);
      // 다음절입명칭 표시
      var nextJeolipDisplayTerm =
        nextJeolipTerm && nextJeolipTerm.trim() !== '' ? nextJeolipTerm : '';
      contentHtml += `
        <div class="compact-row">
          <span class="compact-label">다음절입</span>
          <span class="compact-value">${nextJeolipDisplayTerm} (${nextDate})</span>
        </div>`;
    }

    contentHtml += `</div>`;
  }

  // 월상 정보 섹션
  if (newMoonKst || fullMoonKst) {
    contentHtml += `
      <div class="popup-section moon-section">
        <div class="section-header">🌙 월상</div>`;

    if (newMoonKst) {
      var newMoonDate = formatDateWithTime(newMoonKst);
      contentHtml += `
        <div class="compact-row">
          <span class="compact-label">합삭</span>
          <span class="compact-value">${newMoonDate}</span>
        </div>`;
    }

    if (fullMoonKst) {
      var fullMoonDate = formatDateWithTime(fullMoonKst);
      contentHtml += `
        <div class="compact-row">
          <span class="compact-label">망</span>
          <span class="compact-value">${fullMoonDate}</span>
        </div>`;
    }

    contentHtml += `</div>`;
  }

  // 추가 정보
  if (info.yearP || info.birth) {
    contentHtml += `
      <div class="popup-section" style="border-top:1px solid rgba(229,231,235,0.5);padding-top:4px;margin-top:4px;">`;

    if (info.yearP) {
      contentHtml += `
        <div class="compact-row">
          <span class="compact-label">입춘기준</span>
          <span class="compact-value" style="font-size:0.65rem;">${info.yearP}</span>
        </div>`;
    }

    if (info.birth) {
      contentHtml += `
        <div class="compact-row">
          <span class="compact-label">계산시각</span>
          <span class="compact-value" style="font-size:0.65rem;">${info.birth}</span>
        </div>`;
    }

    contentHtml += `</div>`;
  }

  // 팝업 표시
  const popup = document.getElementById('ganzi-popup');
  const title = document.getElementById('popup-title');
  const content = document.getElementById('ganzi-content');

  title.innerHTML = titleHtml;
  content.innerHTML = contentHtml;

  // 팝업 위치 계산
  showPopupWithSmartPosition(popup, cell);
}

// 시간 지지 인덱스 계산
function calculateHourBranchIndex(hour, minute) {
  if (
    (hour === 23 && minute >= 30) ||
    hour === 0 ||
    (hour === 1 && minute < 30)
  ) {
    return 0; // 子시
  } else if (
    (hour === 1 && minute >= 30) ||
    hour === 2 ||
    (hour === 3 && minute < 30)
  ) {
    return 1; // 丑시
  } else if (
    (hour === 3 && minute >= 30) ||
    hour === 4 ||
    (hour === 5 && minute < 30)
  ) {
    return 2; // 寅시
  } else if (
    (hour === 5 && minute >= 30) ||
    hour === 6 ||
    (hour === 7 && minute < 30)
  ) {
    return 3; // 卯시
  } else if (
    (hour === 7 && minute >= 30) ||
    hour === 8 ||
    (hour === 9 && minute < 30)
  ) {
    return 4; // 辰시
  } else if (
    (hour === 9 && minute >= 30) ||
    hour === 10 ||
    (hour === 11 && minute < 30)
  ) {
    return 5; // 巳시
  } else if (
    (hour === 11 && minute >= 30) ||
    hour === 12 ||
    (hour === 13 && minute < 30)
  ) {
    return 6; // 午시
  } else if (
    (hour === 13 && minute >= 30) ||
    hour === 14 ||
    (hour === 15 && minute < 30)
  ) {
    return 7; // 未시
  } else if (
    (hour === 15 && minute >= 30) ||
    hour === 16 ||
    (hour === 17 && minute < 30)
  ) {
    return 8; // 申시
  } else if (
    (hour === 17 && minute >= 30) ||
    hour === 18 ||
    (hour === 19 && minute < 30)
  ) {
    return 9; // 酉시
  } else if (
    (hour === 19 && minute >= 30) ||
    hour === 20 ||
    (hour === 21 && minute < 30)
  ) {
    return 10; // 戌시
  } else if (
    (hour === 21 && minute >= 30) ||
    hour === 22 ||
    (hour === 23 && minute < 30)
  ) {
    return 11; // 亥시
  } else {
    return Math.floor(((hour + 1) % 24) / 2); // 기본값
  }
}

// 날짜 포맷팅 함수
function formatDate(dateStr) {
  if (!dateStr) return '';

  // "2024-12-15 14:30:00" -> "12/15 14:30"
  var parts = dateStr.split(' ');
  if (parts.length >= 2) {
    var datePart = parts[0].split('-');
    var timePart = parts[1].substring(0, 5); // HH:MM만
    if (datePart.length >= 3) {
      return `${parseInt(datePart[1])}/${parseInt(datePart[2])} ${timePart}`;
    }
  }

  return dateStr;
}

// 합삭/망 시각용 정확한 시간 표시 함수
function formatDateWithTime(dateStr) {
  if (!dateStr) return '';

  // "2024-12-15 14:30" -> "12월 15일 14:30"
  var parts = dateStr.split(' ');
  if (parts.length >= 2) {
    var datePart = parts[0].split('-');
    var timePart = parts[1];
    if (datePart.length >= 3) {
      return `${parseInt(datePart[1])}월 ${parseInt(
        datePart[2]
      )}일 ${timePart}`;
    }
  }

  return dateStr;
}

// 스마트 팝업 위치 계산
function showPopupWithSmartPosition(popup, cell) {
  const rect = cell.getBoundingClientRect();
  const popup_width = 220;
  const popup_height = 300;

  let left = rect.right + 10;
  let top = rect.top + window.scrollY;

  // 화면 경계 확인 및 조정
  if (left + popup_width > window.innerWidth) {
    left = rect.left - popup_width - 10;
  }
  if (top + popup_height > window.innerHeight + window.scrollY) {
    top = window.innerHeight + window.scrollY - popup_height - 20;
  }
  if (left < 10) {
    left = 10;
  }
  if (top < 10) {
    top = 10;
  }

  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
  popup.style.right = 'auto';
  popup.style.display = 'block';

  // 애니메이션 효과
  popup.style.opacity = '0';
  popup.style.transform = 'translateY(10px) scale(0.95)';

  requestAnimationFrame(() => {
    popup.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    popup.style.opacity = '1';
    popup.style.transform = 'translateY(0) scale(1)';
  });
}

// 팝업 닫기 기능
document.getElementById('ganzi-close').onclick = function () {
  const popup = document.getElementById('ganzi-popup');
  popup.style.transition = 'all 0.2s ease';
  popup.style.opacity = '0';
  popup.style.transform = 'translateY(-10px) scale(0.95)';

  setTimeout(() => {
    popup.style.display = 'none';
  }, 200);
};

// ESC 키로 팝업 닫기
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const popup = document.getElementById('ganzi-popup');
    if (popup.style.display === 'block') {
      document.getElementById('ganzi-close').click();
    }
  }
});

// 팝업 외부 클릭시 닫기
document.addEventListener('click', function (e) {
  const popup = document.getElementById('ganzi-popup');
  if (
    popup.style.display === 'block' &&
    !popup.contains(e.target) &&
    !e.target.closest('.day-cell')
  ) {
    document.getElementById('ganzi-close').click();
  }
});

// 페이지 로드 후 초기화
document.addEventListener('DOMContentLoaded', function () {
  // 오늘 날짜 특별 효과
  const todayCell = document.querySelector('.day-cell.today');
  if (todayCell) {
    setInterval(() => {
      if (todayCell.matches(':hover')) return;

      todayCell.style.transition = 'box-shadow 0.5s ease';
      todayCell.style.boxShadow = '0 8px 32px rgba(245, 158, 11, 0.5)';

      setTimeout(() => {
        todayCell.style.boxShadow = '0 8px 32px rgba(245, 158, 11, 0.3)';
      }, 500);
    }, 3000);
  }
});

// ============================================
// "오늘" 버튼 시간 업데이트 및 음력 표시 초기화
// ============================================

(function() {
  'use strict';
  
  // "오늘" 버튼 시각 업데이트 (팝업과 정확히 동일한 방식)
  function updateTodayButtonTime() {
    // 팝업과 정확히 동일한 방식으로 시간 가져오기
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    
    var timeElement = document.getElementById('kst-time');
    if (timeElement) {
      // 팝업과 동일한 포맷팅 방식: hour.toString().padStart(2, '0')
      var hour_str = hour.toString().padStart(2, '0');
      var minute_str = minute.toString().padStart(2, '0');
      timeElement.innerHTML = now.getFullYear() + '년 ' + (now.getMonth() + 1) + '월 ' + now.getDate() + '일 ' +
                             hour_str + ':' + minute_str;
    }
    
    // hidden input도 업데이트
    var todayYearInput = document.getElementById('today-year');
    var todayMonthInput = document.getElementById('today-month');
    if (todayYearInput) todayYearInput.value = now.getFullYear();
    if (todayMonthInput) todayMonthInput.value = now.getMonth() + 1;
  }

  // 음력 정보를 "10.12" 형식으로 변환
  function formatLunarInfo() {
    var lunarElements = document.querySelectorAll('.lunar-info[data-lunar-full]');
    if (lunarElements.length === 0) {
      // 요소가 없으면 잠시 후 다시 시도 (최대 10번)
      if (typeof formatLunarInfo.retryCount === 'undefined') {
        formatLunarInfo.retryCount = 0;
      }
      if (formatLunarInfo.retryCount < 10) {
        formatLunarInfo.retryCount++;
        setTimeout(formatLunarInfo, 100);
      }
      return;
    }
    
    // 재시도 카운터 리셋
    formatLunarInfo.retryCount = 0;
    
    lunarElements.forEach(function(element) {
      var lunarFull = element.getAttribute('data-lunar-full');
      if (lunarFull && lunarFull.trim() !== '') {
        // "10월 12일 평달 대월" 형식에서 월과 일 추출
        var match = lunarFull.match(/(\d+)월\s*(\d+)일/);
        if (match) {
          var month = match[1];
          var day = match[2];
          element.textContent = month + '.' + day;
        } else {
          // 매칭 실패 시 빈 문자열로 설정
          element.textContent = '';
        }
      }
    });
  }

  // 클라이언트 로컬 시간 기준으로 오늘 날짜 표시
  function updateTodayHighlight() {
    // 팝업과 정확히 동일한 방식으로 시간 가져오기
    var now = new Date();
    var today = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
    
    var dayCells = document.querySelectorAll('.day-cell');
    dayCells.forEach(function(cell) {
      var year = parseInt(cell.getAttribute('data-year'));
      var month = parseInt(cell.getAttribute('data-month'));
      var day = parseInt(cell.getAttribute('data-day'));
      
      // 서버에서 설정한 today 클래스 제거
      cell.classList.remove('today');
      
      // 클라이언트 로컬 시간 기준으로 오늘인지 확인 (팝업과 정확히 동일한 방식)
      if (year === today.year && month === today.month && day === today.day) {
        cell.classList.add('today');
      }
    });
  }

  // DOM이 완전히 로드된 후 실행 (서버 환경 대응)
  function initCalendarScripts() {
    // "오늘" 버튼 클릭 이벤트 (팝업과 정확히 동일한 방식)
    var todayBtn = document.getElementById('today-btn');
    if (todayBtn) {
      // 기존 이벤트 리스너 제거 후 추가 (중복 방지)
      var newBtn = todayBtn.cloneNode(true);
      todayBtn.parentNode.replaceChild(newBtn, todayBtn);
      
      newBtn.addEventListener('click', function() {
        // 팝업과 정확히 동일한 방식으로 시간 가져오기
        var now = new Date();
        var form = document.getElementById('today-form');
        if (form) {
          document.getElementById('today-year').value = now.getFullYear();
          document.getElementById('today-month').value = now.getMonth() + 1;
          
          // form에 nav=today hidden input 추가
          var navInput = form.querySelector('input[name="nav"]');
          if (!navInput) {
            navInput = document.createElement('input');
            navInput.type = 'hidden';
            navInput.name = 'nav';
            form.appendChild(navInput);
          }
          navInput.value = 'today';
          
          form.submit();
        }
      });
    }
    
    // 초기 실행
    updateTodayButtonTime();
    updateTodayHighlight();
    formatLunarInfo();
    
    // 1초마다 시각 업데이트
    setInterval(updateTodayButtonTime, 1000);
    
    // 날짜가 바뀔 수 있으므로 1분마다 오늘 날짜 표시 확인
    setInterval(updateTodayHighlight, 60000);
  }

  // 즉시 실행: "로딩 중..." 텍스트를 빠르게 업데이트
  function tryUpdateTime() {
    var timeElement = document.getElementById('kst-time');
    if (timeElement) {
      updateTodayButtonTime();
      return true;
    }
    return false;
  }

  // 여러 시점에서 실행 보장
  function runInitialization() {
    // 시간 업데이트 시도
    if (!tryUpdateTime()) {
      // 요소가 없으면 재시도
      setTimeout(function() {
        if (!tryUpdateTime()) {
          setTimeout(tryUpdateTime, 200);
        }
      }, 50);
    }
    
    // 초기화 실행
    initCalendarScripts();
    
    // 음력 정보 포맷팅 재시도 (여러 시점)
    setTimeout(formatLunarInfo, 100);
    setTimeout(formatLunarInfo, 300);
    setTimeout(formatLunarInfo, 600);
    setTimeout(formatLunarInfo, 1000);
  }

  // DOM 로드 상태 확인 및 실행
  if (document.readyState === 'loading') {
    // DOM이 아직 로딩 중
    document.addEventListener('DOMContentLoaded', runInitialization);
  } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    // DOM이 이미 로드됨
    runInitialization();
  } else {
    // 예외 상황 대비
    setTimeout(runInitialization, 0);
  }

  // window.onload도 추가하여 모든 리소스 로드 후 실행
  window.addEventListener('load', function() {
    updateTodayButtonTime();
    formatLunarInfo();
    // 추가 재시도
    setTimeout(formatLunarInfo, 100);
    setTimeout(formatLunarInfo, 500);
  });

  // MutationObserver를 사용하여 DOM 변경 감지 (음력 정보 포맷팅)
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function(mutations) {
      var shouldFormat = false;
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
              if (node.classList && node.classList.contains('lunar-info')) {
                shouldFormat = true;
              }
              if (node.querySelectorAll && node.querySelectorAll('.lunar-info').length > 0) {
                shouldFormat = true;
              }
            }
          });
        }
      });
      if (shouldFormat) {
        setTimeout(formatLunarInfo, 50);
      }
    });

    // DOM이 준비되면 observer 시작
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        if (document.body) {
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        }
      });
    }
  }
})();
