// saju.js - 사주 세우기 페이지 JavaScript

// 간지 입력에서 시간 변환 함수
function ganjiToTime(ganjiValue) {
  if (!ganjiValue || ganjiValue === '') return null;
  
  // 간지별 시간 범위 매핑
  const ganjiTimeMap = {
    '子-夜': { hour: 23, minute: 45 },  // 23:30~00:29의 중간값
    '子-朝': { hour: 0, minute: 45 },   // 00:30~01:29의 중간값
    '子': { hour: 0, minute: 0 },       // 23:30~01:29의 중간값
    '丑': { hour: 2, minute: 0 },       // 01:30~03:29
    '寅': { hour: 4, minute: 0 },       // 03:30~05:29
    '卯': { hour: 6, minute: 0 },       // 05:30~07:29
    '辰': { hour: 8, minute: 0 },       // 07:30~09:29
    '巳': { hour: 10, minute: 0 },      // 09:30~11:29
    '午': { hour: 12, minute: 0 },      // 11:30~13:29
    '未': { hour: 14, minute: 0 },      // 13:30~15:29
    '申': { hour: 16, minute: 0 },      // 15:30~17:29
    '酉': { hour: 18, minute: 0 },      // 17:30~19:29
    '戌': { hour: 20, minute: 0 },      // 19:30~21:29
    '亥': { hour: 22, minute: 0 },      // 21:30~23:29
    '미상': null
  };
  
  return ganjiTimeMap[ganjiValue] || null;
}

// 사주 결과 표시 함수
function showResult(year, month, day, hour, minute, solarStr) {
  var resultDiv = document.getElementById('saju-result');
  
  // 서버에 사주 계산 요청
  fetch(`/mans/get_saju?year=${year}&month=${month}&day=${day}&hour=${hour}&minute=${minute}`)
    .then(function(res) {
      return res.json();
    })
    .then(function(result) {
      var year_gz = result.year || '';
      var month_gz = result.month || '';
      var day_gz = result.day || '';
      var hour_gz = result.hour || '';
      var info = result.info || {};
      
      // 시주 지지명 계산
      var hour_names = [
        '子시', '축시', '인시', '묘시', '진시', '사시',
        '오시', '미시', '신시', '유시', '술시', '해시',
      ];
      
      // 시간 지지 인덱스 계산 (자시=23:30~01:30 기준)
      var hour_branch_idx = 0;
      if ((hour === 23 && minute >= 30) || hour === 0 || (hour === 1 && minute < 30)) {
        hour_branch_idx = 0; // 자시
      } else if ((hour === 1 && minute >= 30) || hour === 2 || (hour === 3 && minute < 30)) {
        hour_branch_idx = 1; // 축시
      } else if ((hour === 3 && minute >= 30) || hour === 4 || (hour === 5 && minute < 30)) {
        hour_branch_idx = 2; // 인시
      } else if ((hour === 5 && minute >= 30) || hour === 6 || (hour === 7 && minute < 30)) {
        hour_branch_idx = 3; // 묘시
      } else if ((hour === 7 && minute >= 30) || hour === 8 || (hour === 9 && minute < 30)) {
        hour_branch_idx = 4; // 진시
      } else if ((hour === 9 && minute >= 30) || hour === 10 || (hour === 11 && minute < 30)) {
        hour_branch_idx = 5; // 사시
      } else if ((hour === 11 && minute >= 30) || hour === 12 || (hour === 13 && minute < 30)) {
        hour_branch_idx = 6; // 오시
      } else if ((hour === 13 && minute >= 30) || hour === 14 || (hour === 15 && minute < 30)) {
        hour_branch_idx = 7; // 미시
      } else if ((hour === 15 && minute >= 30) || hour === 16 || (hour === 17 && minute < 30)) {
        hour_branch_idx = 8; // 신시
      } else if ((hour === 17 && minute >= 30) || hour === 18 || (hour === 19 && minute < 30)) {
        hour_branch_idx = 9; // 유시
      } else if ((hour === 19 && minute >= 30) || hour === 20 || (hour === 21 && minute < 30)) {
        hour_branch_idx = 10; // 술시
      } else if ((hour === 21 && minute >= 30) || hour === 22 || (hour === 23 && minute < 30)) {
        hour_branch_idx = 11; // 해시
      }
      
      var hour_name = hour_names[hour_branch_idx];
      var hour_display = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${hour_name}`;
      
      // 결과 HTML 생성
      var html = '<div style="margin-top:20px;">';
      html += '<h2 style="color:#1e3a8a;margin-bottom:16px;">사주 결과</h2>';
      html += '<div style="background:rgba(255,255,255,0.9);padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">';
      html += `<div style="margin-bottom:16px;"><strong>${solarStr}</strong></div>`;
      html += '<div style="font-size:1.2rem;font-weight:600;margin:20px 0;color:#1e3a8a;">';
      html += `${year_gz}年 ${month_gz}月 ${day_gz}日 ${hour_gz}時`;
      html += '</div>';
      html += `<div style="margin-top:12px;color:#6b7280;">시각: ${hour_display}</div>`;
      
      if (info.yearP) {
        html += `<div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:0.9rem;color:#6b7280;">${info.yearP}</div>`;
      }
      
      if (result.lunar) {
        html += `<div style="margin-top:12px;font-size:0.9rem;color:#6b7280;">음력: ${result.lunar}</div>`;
      }
      
      html += '</div>';
      html += '</div>';
      
      resultDiv.innerHTML = html;
    })
    .catch(function(error) {
      resultDiv.innerHTML = '<div style="color:red;margin-top:20px;">사주 계산 중 오류가 발생했습니다: ' + error.message + '</div>';
    });
}

// 시간 입력 방식 전환 함수
function checkTimeType(type) {
  var timeCheckbox = document.getElementById('check-time');
  var ganjiCheckbox = document.getElementById('check-ganji');
  var timeInputGroup = document.getElementById('time-input-group');
  var ganjiInputGroup = document.getElementById('ganji-input-group');
  var ganjiInput = document.getElementById('ganji-input');
  
  if (type === 'time') {
    ganjiCheckbox.checked = false;
    timeInputGroup.querySelectorAll('input').forEach(function(input) {
      input.disabled = false;
    });
    ganjiInput.disabled = true;
  } else if (type === 'ganji') {
    timeCheckbox.checked = false;
    timeInputGroup.querySelectorAll('input').forEach(function(input) {
      input.disabled = true;
    });
    ganjiInput.disabled = false;
  }
}

// 폼 제출 처리
document.getElementById('saju-form').onsubmit = function(e) {
  e.preventDefault(); // 1. 폼의 기본 제출 동작(페이지 새로고침)을 막음
  
  // 2. 폼에서 입력된 값들을 변수에 저장
  var year = this.year.value;
  var month = this.month.value;
  var day = this.day.value;
  var calendarType = this.calendar_type.value;
  
  // 3. 시각 입력 방식 확인 (시분입력 vs 간지입력)
  var timeInput = document.getElementById('check-time');
  var ganjiInput = document.getElementById('check-ganji');
  var hour = 0;
  var minute = 0;
  
  if (timeInput && timeInput.checked) {
    // 시분 입력 방식
    hour = parseInt(this.hour.value) || 0;
    minute = parseInt(this.minute.value) || 0;
  } else if (ganjiInput && ganjiInput.checked) {
    // 간지 입력 방식
    var ganjiValue = document.getElementById('ganji-input').value;
    var ganjiTime = ganjiToTime(ganjiValue);
    if (ganjiTime) {
      hour = ganjiTime.hour;
      minute = ganjiTime.minute;
    } else if (ganjiValue === '미상') {
      // 시각 미상인 경우
      hour = 12;
      minute = 0;
    }
  }
  
  var solarStr = `양력: ${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
  
  // 4. 입력된 달력이 '음력'이면, 서버에 음력을 양력으로 변환 요청
  if (calendarType === '음력') {
    var isLeap = document.getElementById('is_leap').checked;
    fetch(`/mans/convert_lunar_to_solar?year=${year}&month=${month}&day=${day}&is_leap=${isLeap}`)
      .then(function(res) {
        return res.json(); // 5. 서버에서 변환된 양력 결과를 받아옴
      })
      .then(function(solar) {
        if (solar.error) {
          // 6. 변환 오류가 있으면 결과 영역에 오류 메시지 표시
          document.getElementById('saju-result').innerHTML =
            '<span style="color:red;">음력 변환 오류: ' + solar.error + '</span>';
          return;
        }
        // 7. 변환된 양력 날짜로 변수 업데이트
        year = solar.year;
        month = solar.month;
        day = solar.day;
        solarStr = `양력: ${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
        // 8. 사주 결과를 보여주는 함수 호출
        showResult(year, month, day, hour, minute, solarStr);
      })
      .catch(function(error) {
        document.getElementById('saju-result').innerHTML =
          '<span style="color:red;">음력 변환 중 오류가 발생했습니다: ' + error.message + '</span>';
      });
  } else {
    // 9. 양력 입력이면 바로 사주 결과 함수 호출
    showResult(year, month, day, hour, minute, solarStr);
  }
};







