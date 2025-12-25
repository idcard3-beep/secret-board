// ========================================
// Flask API 클라이언트
// Python 만세력 함수를 API로 호출
// ========================================

// API 기본 URL - 상대 경로 사용 (현재 페이지의 origin 사용)
const API_BASE_URL = window.location.origin;

/**
 * 사주 계산 API 호출
 */
async function calcSajuAPI(
  birthDatetime,
  calendarType = 'solar',
  timeType = 'normal'
) {
  try {
    const response = await fetch(`${API_BASE_URL}/saju/api/calc-saju`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birth_datetime: birthDatetime,
        calendar_type: calendarType,
        time_type: timeType, // 시간 타입 추가
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    console.error('사주 계산 오류:', error);
    throw error;
  }
}

/**
 * 음력 -> 양력 변환 API 호출
 */
async function convertLunarToSolarAPI(year, month, day, isLeap = false) {
  try {
    const response = await fetch(`${API_BASE_URL}/saju/api/lunar-to-solar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        is_leap: isLeap,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    console.error('음력 변환 오류:', error);
    throw error;
  }
}

/**
 * 대운 계산 API 호출
 */
async function calcDaeunAPI(
  birthDatetime,
  gender,
  monthGan,
  monthZhi,
  calendarType = 'solar'
) {
  try {
    const response = await fetch(`${API_BASE_URL}/saju/api/calc-daeun`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birth_datetime: birthDatetime,
        gender: gender,
        month_gan: monthGan,
        month_zhi: monthZhi,
        calendar_type: calendarType,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    console.error('대운 계산 오류:', error);
    throw error;
  }
}

/**
 * 연운 계산 API 호출
 */
async function calcYeonunAPI(birthYear, currentYear = null, range = 10) {
  try {
    const response = await fetch(`${API_BASE_URL}/saju/api/calc-yeonun`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birth_year: parseInt(birthYear),
        current_year: currentYear || new Date().getFullYear(),
        range: range,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    console.error('연운 계산 오류:', error);
    throw error;
  }
}

/**
 * 월운 계산 API 호출
 */
async function calcWolunAPI(targetYear) {
  try {
    const response = await fetch(`${API_BASE_URL}/saju/api/calc-wolun`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_year: parseInt(targetYear),
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    console.error('월운 계산 오류:', error);
    throw error;
  }
}

/**
 * 절기 데이터 조회 API 호출
 */
async function getSolarTermsByYearAPI(year) {
  try {
    const response = await fetch(`${API_BASE_URL}/saju/api/solar-terms/${year}`);

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.terms;
  } catch (error) {
    console.error('절기 데이터 조회 오류:', error);
    throw error;
  }
}

// 전역으로 내보내기
if (typeof window !== 'undefined') {
  window.SajuAPI = {
    calcSaju: calcSajuAPI,
    convertLunarToSolar: convertLunarToSolarAPI,
    calcDaeun: calcDaeunAPI,
    calcYeonun: calcYeonunAPI,
    calcWolun: calcWolunAPI,
    getSolarTermsByYear: getSolarTermsByYearAPI,
  };
}
