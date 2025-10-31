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
        const container = document.createElement('div');
        // 관리자 메시지 여부 판단 (USER가 아니면 모두 관리자로 간주)
        //const isAdminMessage = m.role && m.role.toUpperCase() !== 'USER';
        const isAdminMessage = m.role && m.role.toUpperCase() !== 'xUSER';

        container.className = `message-container ${
          isAdminMessage ? 'admin' : 'user'
        }`;
        container.setAttribute('data-msg-id', m.msg_id);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `<strong>${m.role}:</strong> <span class="msg-text">${m.content}</span>`;
        container.appendChild(contentDiv);

        // 관리자 메시지에 수정/삭제 버튼 추가 (권한에 따라)
        if (isAdminMessage) {
          // 전역 변수에서 현재 로그인한 관리자 정보 가져오기
          const currentAdminId = window.ADMIN_SESSION?.admin_id;
          const currentRole = window.ADMIN_SESSION?.role;

          console.log(
            `🔍 권한 체크 - 메시지: {admin_id: ${m.admin_id}, role: ${m.role}}, 현재 세션: {admin_id: ${currentAdminId}, role: ${currentRole}}`
          );

          // 권한 체크
          let canEdit = false;
          let canDelete = false;

          // 1. role이 'ADMIN'인 경우 무조건 수정/삭제 가능
          if (currentRole && currentRole.toUpperCase() === 'ADMIN') {
            canEdit = true;
            canDelete = true;
            console.log('✅ ADMIN 권한 - 모든 수정/삭제 가능');
          }
          // 2. role이 'ADMIN'이 아닌 경우
          else {
            // admin_id와 role이 모두 일치하는 경우에만 수정 가능
            if (
              m.admin_id &&
              currentAdminId &&
              m.admin_id === currentAdminId &&
              m.role &&
              currentRole &&
              m.role.toUpperCase() === currentRole.toUpperCase()
            ) {
              canEdit = true;
              console.log('✅ 본인 메시지 - 수정만 가능');
            } else {
              console.log('❌ 권한 없음 - 수정/삭제 불가');
            }
          }

          // 버튼 추가
          if (canEdit || canDelete) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';

            if (canEdit) {
              const editBtn = document.createElement('button');
              editBtn.className = 'btn-edit';
              editBtn.textContent = '수정';
              editBtn.onclick = () => enableEditMode(m.msg_id, m.content);
              actionsDiv.appendChild(editBtn);
            }

            if (canDelete) {
              const deleteBtn = document.createElement('button');
              deleteBtn.className = 'btn-delete';
              deleteBtn.textContent = '삭제';
              deleteBtn.onclick = () => deleteMessage(m.msg_id);
              actionsDiv.appendChild(deleteBtn);
            }

            container.appendChild(actionsDiv);
          }
        }

        box.appendChild(container);
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

  // 전역 변수에서 admin_id 가져오기
  const adminId = window.ADMIN_SESSION?.admin_id;
  console.log('👤 현재 로그인한 admin_id:', adminId);

  if (!adminId) {
    console.error('❌ admin_id를 찾을 수 없음 - 세션 확인 필요');
    alert('세션이 만료되었습니다. 다시 로그인해주세요.');
    location.href = '/admin_login';
    return;
  }

  const requestData = {
    content: content,
    admin_id: adminId,
  };

  console.log('📝 PostgreSQL에 관리자 답변 저장:', content);
  const url = `/api/v1/admin/tickets/${ticketId}/reply`;
  console.log('🚀 답변 등록 요청:', url);
  console.log('📤 요청 데이터:', requestData);

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
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

function enableEditMode(msgId, currentContent) {
  console.log('✏️ 수정 모드 활성화:', msgId);

  const container = document.querySelector(`[data-msg-id="${msgId}"]`);
  if (!container) return;

  const contentDiv = container.querySelector('.message-content');
  const actionsDiv = container.querySelector('.message-actions');

  // 텍스트 영역으로 변경
  const textarea = document.createElement('textarea');
  textarea.className = 'edit-textarea';
  textarea.value = currentContent;

  // 저장/취소 버튼 생성
  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn-save';
  saveBtn.textContent = '저장';
  saveBtn.onclick = () => saveMessage(msgId, textarea.value, currentContent);

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn-cancel';
  cancelBtn.textContent = '취소';
  cancelBtn.onclick = () => load(); // 페이지 새로고침하여 원래 상태로

  // DOM 업데이트
  contentDiv.innerHTML = '';
  contentDiv.appendChild(textarea);

  actionsDiv.innerHTML = '';
  actionsDiv.appendChild(saveBtn);
  actionsDiv.appendChild(cancelBtn);

  textarea.focus();
}

function saveMessage(msgId, newContent, originalContent) {
  console.log('💾 메시지 저장:', msgId);

  if (!newContent.trim()) {
    return alert('내용을 입력하세요');
  }

  if (newContent === originalContent) {
    console.log('⚠️ 내용이 변경되지 않음');
    return load();
  }

  const url = `/api/v1/admin/messages/${msgId}`;
  console.log('🚀 메시지 수정 요청:', url);

  fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: newContent }),
  })
    .then((r) => {
      console.log('✅ 응답 상태:', r.status);

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
      console.log('✅ 메시지 수정 성공:', result);
      alert('메시지가 수정되었습니다.');
      load(); // 페이지 새로고침
    })
    .catch((error) => {
      console.error('❌ 메시지 수정 에러:', error);
      alert('메시지 수정 중 오류가 발생했습니다: ' + error.message);
    });
}

function deleteMessage(msgId) {
  console.log('🗑️ 메시지 삭제 요청:', msgId);

  if (!confirm('정말로 이 메시지를 삭제하시겠습니까?')) {
    console.log('❌ 삭제 취소됨');
    return;
  }

  const url = `/api/v1/admin/messages/${msgId}`;
  console.log('🚀 메시지 삭제 요청:', url);

  fetch(url, {
    method: 'DELETE',
  })
    .then((r) => {
      console.log('✅ 응답 상태:', r.status);

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
      console.log('✅ 메시지 삭제 성공:', result);
      alert('메시지가 삭제되었습니다.');
      load(); // 페이지 새로고침
    })
    .catch((error) => {
      console.error('❌ 메시지 삭제 에러:', error);
      alert('메시지 삭제 중 오류가 발생했습니다: ' + error.message);
    });
}

document.addEventListener('DOMContentLoaded', load);
