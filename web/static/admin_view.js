console.log('=== 관리자 상세보기 시작 (상태 양호) ===');

const ticketId = new URLSearchParams(location.search).get('id');
console.log('✅ 티켓 ID:', ticketId);
console.log('🗄️ 연결 상태 양호 모드로 실행 중...');

function load() {
  const url = `/api/v1/admin/tickets/${ticketId}`;
  console.log('🚀 관리자 티켓 데이터 로드:', url);

  fetch(url)
    .then((r) => {
      if (r.status === 401) {
        alert('세션 만료');
        location.href = '/admin_login';
        return;
      }
      return r.json();
    })
    .then((d) => {
      if (!d) return;
      document.getElementById('meta').innerText = `제목: ${
        d.ticket.title
      } / 작성자: ${d.ticket.author_name || '미등록'} / 메모란: ${
        d.ticket.author_contact || '미등록'
      } / 자료구분: ${d.ticket.snsgu || 'A0001'} / 상태: ${
        d.ticket.status
      } / 생성: ${d.ticket.created_at}`;
      document.getElementById('content').innerText = d.ticket.content;
      const box = document.getElementById('thread');
      box.innerHTML = '';
      d.messages.forEach((m) => {
        const div = document.createElement('div');
        div.className = `msg ${m.role === 'ADMIN' ? 'admin' : 'user'}`;
        div.innerText = `${m.role}: ${m.content}`;
        box.appendChild(div);
      });
    });
}
function sendAdminReply() {
  console.log('🔄 sendAdminReply 함수 호출됨');

  const content = document.getElementById('adminReply').value.trim();
  console.log('📝 입력된 내용:', content);

  if (!content) {
    console.log('❌ 내용이 비어있음');
    return alert('내용을 입력하세요');
  }

  console.log('📝 MSSQL에 관리자 답변 저장:', content);
  const url = `/api/v1/admin/tickets/${ticketId}/reply`;
  console.log('🚀 답변 등록 요청:', url);
  console.log('📤 요청 데이터:', { content });

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
    .then((r) => {
      console.log('✅ 응답 상태:', r.status);
      console.log('✅ 응답 헤더:', r.headers.get('content-type'));

      if (r.status === 401) {
        console.log('❌ 세션 만료');
        alert('세션 만료');
        location.href = '/admin_login';
        return;
      }

      if (!r.ok) {
        console.error('❌ HTTP 에러:', r.status, r.statusText);
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }

      return r.json();
    })
    .then((result) => {
      console.log('✅ 답변 등록 성공:', result);
      document.getElementById('adminReply').value = '';
      alert('답변이 등록되었습니다.');
      load(); // 페이지 새로고침
    })
    .catch((error) => {
      console.error('❌ 답변 등록 에러:', error);
      console.error('❌ 에러 스택:', error.stack);
      alert('답변 등록 중 오류가 발생했습니다: ' + error.message);
    });
}
document.addEventListener('DOMContentLoaded', load);
