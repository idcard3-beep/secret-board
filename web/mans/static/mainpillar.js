// mainpillar.js
// 모든 JS 기능 분리: 절기 fetch, 사주 계산, UI 이벤트

console.log('mainpillar.js loaded');

// --- 절기 데이터 fetch (서버 API)
let solarTermsData = {};
const solarTermsUrl = function getSolarTermsApiUrl(year) {
  return `/mans/get_solar_terms?year=${year}`;
};
async function loadSolarTerms(year) {
  if (solarTermsData[year]) {
    //console.log(`[캐시] year=${year}, data=`, solarTermsData[year]);
    return solarTermsData[year];
  }
  try {
    const apiUrl = solarTermsUrl(year);
    //console.log(`[API 요청] year=${year}, url=${apiUrl}`);
    const res = await fetch(apiUrl);
    if (!res.ok)
      throw new Error(`/get_solar_terms API fetch 실패! status: ${res.status}`);
    const json = await res.json();
    //console.log(`[API 응답] year=${year}, json=`, json);
    solarTermsData[year] = json[year];
    return solarTermsData[year];
  } catch (e) {
    alert(
      `/get_solar_terms API에서 절기 데이터를 불러올 수 없습니다.\n에러: ${e.message}`
    );
    return [];
  }
}

// 12지 및 천간/지지
const tenGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const twelveZhi = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
];

(function fillTZ() {
  const select = document.getElementById('tzselect');
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const opts = [
      tz,
      'UTC',
      'Asia/Seoul',
      'Asia/Tokyo',
      'Europe/London',
      'America/Los_Angeles',
      'Asia/Shanghai',
    ];
    opts.forEach((z) => {
      const o = document.createElement('option');
      o.value = z;
      o.textContent = z;
      select.appendChild(o);
    });
    select.value = tz;
  } catch (e) {}
})();

// Julian Day 계산, 태양 황경, 기타 계산 함수 ... (생략)
// ...existing code...

// --- UI interactions ---
document.getElementById('calc').addEventListener('click', async () => {
  const birthInput = document.getElementById('birth').value;
  const year = parseInt(document.getElementById('year').value, 10);
  // 입력값과 실제 생년월일의 연도 비교 디버깅
  console.log('입력된 year 값:', year);
  const birthLocal = new Date(birthInput);
  console.log('birthLocal.getFullYear():', birthLocal.getFullYear());
  const tz = document.getElementById('tzselect').value;
  const dayMode = document.getElementById('dayMode').value;
  const precision = parseInt(document.getElementById('precision').value, 10);
  const termsDiv = document.getElementById('terms');
  const resDiv = document.getElementById('result');
  if (!termsDiv || !resDiv) {
    alert(
      '결과 영역(div#terms, div#result)이 HTML에 없습니다. mainpillar.html 구조를 확인하세요.'
    );
    return;
  }
  if (!birthInput) {
    alert('생년월일 시각을 입력하세요.');
    termsDiv.innerHTML = '';
    resDiv.innerHTML = '';
    return;
  }
  // solar_terms.json 기준으로 절기 데이터 불러오기
  // 반드시 실제 생년월일의 연도를 기준으로 3년치 데이터를 불러옴
  //const termsThis = await loadSolarTerms(year);
  //const termsPrev = await loadSolarTerms(year - 1);
  //const termsNext = await loadSolarTerms(year + 1);

  const termsPrev = await loadSolarTerms(birthLocal.getFullYear() - 1);
  const termsThis = await loadSolarTerms(birthLocal.getFullYear());
  const termsNext = await loadSolarTerms(birthLocal.getFullYear() + 1);
  const allTerms = [].concat(termsPrev, termsThis, termsNext);
  // 년주: solar_terms.json의 입춘 기준
  // --- 년주 계산 ---
  const lichuns = allTerms.filter((t) => t.term === '입춘'); // 모든 절기 중 '입춘'만 추출
  let selectedLichun = null; // 기준이 될 입춘 절기 객체
  for (let i = 0; i < lichuns.length; i++) {
    const lichunDate = new Date(lichuns[i].datetime_KST.replace(/-/g, '/')); // 입춘 절기 시각을 Date로 변환
    if (lichunDate <= birthLocal) {
      selectedLichun = lichuns[i]; // 입력일 이전의 입춘 중 가장 최근 것 선택
    }
  }
  // 甲子년(1864) 기준으로 년주 인덱스 산출
  let yearGanZhi = '';
  let yearP = '';
  if (selectedLichun) {
    const lichunDate = new Date(selectedLichun.datetime_KST.replace(/-/g, '/')); // 선택된 입춘의 날짜 객체
    const baseYear = 1864; // 甲子년 기준
    const lichunYear = lichunDate.getFullYear(); // 입춘이 속한 연도
    let yearIdx = (lichunYear - baseYear) % 60; // 60갑자 인덱스 계산
    if (yearIdx < 0) yearIdx += 60; // 음수 보정
    yearGanZhi = tenGan[yearIdx % 10] + twelveZhi[yearIdx % 12]; // 년주: 천간+지지
    yearP = `입춘 기준 연도: ${lichunYear} / 입춘 시각: ${selectedLichun.datetime_KST} / 간지: <b>${yearGanZhi}</b>`; // 년주 정보 문자열
  } else {
    yearP = '입춘 데이터 없음'; // 입춘 데이터가 없을 경우 안내
  }
  // 월주: solar_terms.json의 중기(입동, 동지, 입춘, ...) 기준
  // 중기 절기만 추출
  const midTerms = [
    '입춘',
    '경칩',
    '청명',
    '입하',
    '망종',
    '소서',
    '입추',
    '백로',
    '한로',
    '입동',
    '대설',
    '소한',
  ];
  let lastMidTerm = null;
  for (let i = 0; i < allTerms.length; i++) {
    const t = allTerms[i];
    const termDate = new Date(t.datetime_KST.replace(/-/g, '/'));
    if (termDate <= birthLocal && midTerms.includes(t.term)) {
      lastMidTerm = t;
    }
  }
  let monthGanZhi = '';
  if (lastMidTerm) {
    // --- 월주 계산: 짝수번째 절기만 사용 ---
    // 짝수번째 절기명 배열
    const evenTerms = [
      '입춘',
      '경칩',
      '청명',
      '입하',
      '망종',
      '소서',
      '입추',
      '백로',
      '한로',
      '입동',
      '대설',
      '소한',
    ];
    // allTerms에서 짝수번째 절기만 필터링
    const filteredTerms = allTerms.filter((t) => evenTerms.includes(t.term));
    // 입력일 이전의 짝수번째 절기 중 가장 최근 것 선택
    let selectedTerm = null;
    for (let i = 0; i < filteredTerms.length; i++) {
      const termDate = new Date(
        filteredTerms[i].datetime_KST.replace(/-/g, '/')
      );
      if (termDate <= birthLocal) {
        selectedTerm = filteredTerms[i];
      }
    }
    if (selectedTerm) {
      const termDate = new Date(selectedTerm.datetime_KST.replace(/-/g, '/'));
      const baseDate = new Date('1864/01/01 00:00:00');
      const msPerDay = 24 * 60 * 60 * 1000;
      let dayIdx = Math.floor((termDate - baseDate) / msPerDay);
      let yearStemIdx = (termDate.getFullYear() - 1864) % 10;
      // 월지 인덱스 (1월:丑, 2월:寅, ..., 12월:子)
      const monthBranchIndexMap = {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 10,
        11: 11,
        12: 0,
      };
      let monthBranchIdx = monthBranchIndexMap[termDate.getMonth() + 1];

      // 오호통변법 적용: 寅월 천간 인덱스
      //const inMonthStemIdx = [2, 4, 6, 8, 0][yearStemIdx % 5];
      //--let diff = (monthBranchIdx - 2 + 12) % 12;
      //--let stemIdx = (inMonthStemIdx + diff) % 10;
      //---
      //const tenGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      //const twelveZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
      //--- IGNORE ---
      //alert('오통1-' + yearStemIdx);
      //---
      const inMonthStemIdx = [2, 4, 6, 8, 0][yearStemIdx % 5];

      let diff = 0;
      if (monthBranchIdx == 0) {
        diff = inMonthStemIdx + 10;
      } else if (monthBranchIdx == 1) {
        diff = inMonthStemIdx + monthBranchIdx + 8;
      } else {
        diff = inMonthStemIdx + monthBranchIdx - 2;
      }

      stemIdx = diff;
      if (diff >= 10) {
        stemIdx = diff % 10;
      }
      //--- IGNORE ---
      //alert('오통6-' + stemIdx);
      //test /     stemIdx = inMonthStemIdx;
      //--let diff = (monthBranchIdx - 2 + 12) % 12;
      //--let stemIdx = (inMonthStemIdx + diff) % 10;
      //---- IGNORE ---
      monthGanZhi = tenGan[stemIdx] + twelveZhi[monthBranchIdx];
    }
  }
  // 일주: solar_terms.json의 절기 시각 기준으로 산출
  // --- 일주 계산 ---
  // 기준일: 1900-01-01 辛卯일(60갑자 인덱스 28), KST 적용
  const baseDate = new Date('1900-01-01T00:00:00+09:00'); // 일주 기준 시작일(辛卯일)
  const msPerDay = 24 * 60 * 60 * 1000; // 하루를 밀리초로 환산
  let baseIdx = 10; // 辛卯 인덱스(60갑자 중 11번째)
  let dayDiff = Math.floor((birthLocal - baseDate) / msPerDay); // 기준일부터 입력일까지의 일수 차이 계산
  let dayIdx = (((baseIdx + dayDiff) % 60) + 60) % 60; // 60갑자 인덱스(음수일 경우 보정)
  const dayGan = tenGan[dayIdx % 10]; // 일주 천간(60갑자 인덱스의 십간)
  const dayZhi = twelveZhi[dayIdx % 12]; // 일주 지지(60갑자 인덱스의 십이지)
  // 시주: 자시(23:30~01:30) 기준, 일주 천간에 따라 시주 천간 결정(오서둔법)
  // --- 시주 계산 ---
  const hour = birthLocal.getHours(); // 입력 시각의 '시' 추출
  const minute = birthLocal.getMinutes(); // 입력 시각의 '분' 추출
  let hourIdx = 0; // 시주 지지 인덱스 초기화
  // 자시~해시 구간별로 hourIdx 결정 (자시 23:30~01:30 기준)
  if (
    (hour === 23 && minute >= 30) ||
    hour === 0 ||
    (hour === 1 && minute < 30)
  ) {
    hourIdx = 0; // 자시(子)
  } else if (
    (hour === 1 && minute >= 30) ||
    hour === 2 ||
    (hour === 3 && minute < 30)
  ) {
    hourIdx = 1; // 축시(丑)
  } else if (
    (hour === 3 && minute >= 30) ||
    hour === 4 ||
    (hour === 5 && minute < 30)
  ) {
    hourIdx = 2; // 인시(寅)
  } else if (
    (hour === 5 && minute >= 30) ||
    hour === 6 ||
    (hour === 7 && minute < 30)
  ) {
    hourIdx = 3; // 묘시(卯)
  } else if (
    (hour === 7 && minute >= 30) ||
    hour === 8 ||
    (hour === 9 && minute < 30)
  ) {
    hourIdx = 4; // 진시(辰)
  } else if (
    (hour === 9 && minute >= 30) ||
    hour === 10 ||
    (hour === 11 && minute < 30)
  ) {
    hourIdx = 5; // 사시(巳)
  } else if (
    (hour === 11 && minute >= 30) ||
    hour === 12 ||
    (hour === 13 && minute < 30)
  ) {
    hourIdx = 6; // 오시(午)
  } else if (
    (hour === 13 && minute >= 30) ||
    hour === 14 ||
    (hour === 15 && minute < 30)
  ) {
    hourIdx = 7; // 미시(未)
  } else if (
    (hour === 15 && minute >= 30) ||
    hour === 16 ||
    (hour === 17 && minute < 30)
  ) {
    hourIdx = 8; // 신시(申)
  } else if (
    (hour === 17 && minute >= 30) ||
    hour === 18 ||
    (hour === 19 && minute < 30)
  ) {
    hourIdx = 9; // 유시(酉)
  } else if (
    (hour === 19 && minute >= 30) ||
    hour === 20 ||
    (hour === 21 && minute < 30)
  ) {
    hourIdx = 10; // 술시(戌)
  } else if (
    (hour === 21 && minute >= 30) ||
    hour === 22 ||
    (hour === 23 && minute < 30)
  ) {
    hourIdx = 11; // 해시(亥)
  } else {
    hourIdx = Math.floor(((hour + 1) % 24) / 2); // 예외 처리(2시간 단위)
  }
  const hourZhi = twelveZhi[hourIdx]; // 시주 지지 결정
  // 오서둔법: 일주 천간 인덱스에 따라 자시 천간 결정
  const ziHourStemMap = {
    0: 0,
    5: 0,
    1: 2,
    6: 2,
    2: 4,
    7: 4,
    3: 6,
    8: 6,
    4: 8,
    9: 8,
  }; // 일주 천간별 자시 천간 인덱스 매핑
  const dayStemIdx = dayIdx % 10; // 일주 천간 인덱스
  const firstHourStemIdx = ziHourStemMap[dayStemIdx]; // 자시 천간 인덱스 결정
  const hourGan = tenGan[(firstHourStemIdx + hourIdx) % 10]; // 시주 천간 결정

  // 4주 결과를 json 객체로 산출
  const sajuResult = {
    year: yearGanZhi,
    month: monthGanZhi,
    day: dayGan + dayZhi,
    hour: hourGan + hourZhi,
    info: {
      yearP,
      monthTerm: lastMidTerm ? lastMidTerm.term : '',
      monthTermStart: lastMidTerm ? lastMidTerm.datetime_KST : '',
      birth: birthLocal.toLocaleString(),
      hour: `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`,
      tz,
    },
  };

  // 음력 날짜 가져오기
  const solarYear = birthLocal.getFullYear();
  const solarMonth = birthLocal.getMonth() + 1;
  const solarDay = birthLocal.getDate();

  let lunarStr = '';
  try {
    const lunarRes = await fetch(
      `/convert_solar_to_lunar?year=${solarYear}&month=${solarMonth}&day=${solarDay}`
    );
    const lunarData = await lunarRes.json();
    if (!lunarData.error) {
      const lunarType = lunarData.is_leap ? '윤달' : '평달';
      lunarStr = `${lunarData.year}.${lunarData.month}.${lunarData.day} ${lunarType}`;
    }
  } catch (e) {
    console.error('음력 변환 오류:', e);
  }

  // 결과 테이블 출력
  let rhtml = '<table><tbody>';
  rhtml += `<tr><th>입력 시각 (로컬)</th><td>${sajuResult.info.birth} (${sajuResult.info.tz})</td></tr>`;
  if (lunarStr) {
    rhtml += `<tr><th>음력</th><td>${lunarStr}</td></tr>`;
  }
  rhtml += `<tr><th>년주</th><td><b>${sajuResult.year}</b></td></tr>`;
  rhtml += `<tr><th>월주</th><td><b>${sajuResult.month}</b></td></tr>`;
  rhtml += `<tr><th>일주</th><td><b>${sajuResult.day}</b></td></tr>`;
  rhtml += `<tr><th>시주</th><td><b>${sajuResult.hour}</b> (시간: ${sajuResult.info.hour})</td></tr>`;
  rhtml += '</tbody></table>';
  rhtml +=
    '<pre style="background:#f8f8f8;padding:8px;border-radius:4px">' +
    JSON.stringify(sajuResult, null, 2) +
    '</pre>';
  rhtml +=
    '<p class="note">모든 절기 및 시간은 135°E 서울 기준으로 계산됩니다. 일주/시주는 근사값입니다.</p>';
  resDiv.innerHTML = rhtml;
});

// auto fill birth with now
(function () {
  const now = new Date();
  const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  document.getElementById('birth').value = localISO;
  document.getElementById('year').value = now.getFullYear();
})();
