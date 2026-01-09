let selectedTicketId=null;document.addEventListener('DOMContentLoaded',()=>{console.log('🚀 MSSQL에서 게시글 목록 로딩 시작...');const adminLink=document.getElementById('adminLink');if(adminLink){adminLink.addEventListener('click',function(e){e.preventDefault();if(typeof window.getAdminSession==='function'){const adminSession=window.getAdminSession();if(adminSession&&adminSession.isLoggedIn&&adminSession.admin_id){console.log('✅ 관리자 로그인 상태 확인 - admin_list로 이동');location.href='/secret/admin_list';return;}}
console.log('⚠️ 관리자 로그인 필요 - admin_login으로 이동');location.href='/secret/admin_login?from=list';});}
loadTickets();});function loadTickets(){fetch('/secret/api/v1/tickets/').then((res)=>{console.log('📡 API 응답 상태:',res.status);return res.json().then((data)=>{if(!res.ok){const errorMsg=data.error||data.message||`HTTP error! status: ${res.status}`;console.error('❌ API 에러 응답:',errorMsg);throw new Error(errorMsg);}
return data;}).catch((jsonError)=>{if(!res.ok){throw new Error(`HTTP error! status: ${res.status}`);}
throw jsonError;});}).then((data)=>{console.log('📋 API에서 받은 데이터:',data);let items=Array.isArray(data)?data:[];console.log('📋 처리할 게시글 수:',items.length);if(items.length===0){showEmptyState();return;}
renderDesktopTable(items);renderMobileCards(items);console.log('✅ 데이터 표시 완료');}).catch((error)=>{console.error('❌ 데이터 로딩 실패:',error);console.error('   에러 상세:',error.message);showErrorState();});}
function renderDesktopTable(items){const tableBody=document.getElementById('ticketBody');tableBody.innerHTML='';items.forEach((ticket,idx)=>{console.log(`🎫 티켓 ${idx + 1}:`,ticket);const tr=document.createElement('tr');const title=ticket.title_masked||ticket.title||'';const maskedTitle=title.length>2?title.slice(0,2)+'****':'비밀글';tr.innerHTML=`
      <td><strong>${idx + 1}</strong></td>
      <td>
        <div style="font-weight: 500;">${maskedTitle}</div>
      </td>
      <td>
        <span class="status-badge ${getStatusClass(ticket.status)}">
          ${getStatusText(ticket.status)}
        </span>
      </td>
      <td>
        <span class="reply-badge ${
          ticket.has_admin_reply ? 'reply-yes' : 'reply-no'
        }">
          ${ticket.has_admin_reply ? 'Y' : 'N'}
        </span>
      </td>
      <td>
        <div style="font-size: 13px; color: #6c757d;">
          ${formatDate(ticket.created_at)}
        </div>
      </td>
    `;tr.onclick=()=>showPasswordModal(ticket.ticket_id);tableBody.appendChild(tr);});}
function renderMobileCards(items){const mobileContainer=document.getElementById('mobileCardView');mobileContainer.innerHTML='';items.forEach((ticket,idx)=>{const title=ticket.title_masked||ticket.title||'';const maskedTitle=title.length>2?title.slice(0,2)+'****':'비밀글';const cardElement=document.createElement('div');cardElement.className='ticket-card';cardElement.onclick=()=>showPasswordModal(ticket.ticket_id);cardElement.innerHTML=`
      <div class="card-header">
        <div class="card-number">#${idx + 1}</div>
        <span class="reply-badge ${
          ticket.has_admin_reply ? 'reply-yes' : 'reply-no'
        }">
          ${ticket.has_admin_reply ? 'Y' : 'N'}
        </span>
      </div>
      <div class="card-title">${maskedTitle}</div>
      <div class="card-meta">
        <span class="status-badge ${getStatusClass(ticket.status)}">
          ${getStatusText(ticket.status)}
        </span>
        <div class="card-date">${formatDate(ticket.created_at)}</div>
      </div>
    `;mobileContainer.appendChild(cardElement);});}
function getStatusClass(status){switch(status?.toUpperCase()){case'OPEN':return'status-open';case'ANSWERED':return'status-answered';case'CLOSED':return'status-closed';default:return'status-open';}}
function getStatusText(status){switch(status?.toUpperCase()){case'OPEN':return'대기중';case'ANSWERED':return'답변완료';case'CLOSED':return'마감';default:return'대기중';}}
function formatDate(dateString){try{if(!dateString){console.warn('⚠️ 날짜 정보가 없습니다.');return'날짜 없음';}
const date=new Date(dateString);if(isNaN(date.getTime())){console.warn('⚠️ 유효하지 않은 날짜:',dateString);return dateString;}
return date.toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:true,});}catch(error){console.error('❌ 날짜 포맷 오류:',error,'원본:',dateString);return dateString||'날짜 오류';}}
function showEmptyState(){const tableBody=document.getElementById('ticketBody');const mobileContainer=document.getElementById('mobileCardView');const emptyContent=`
    <div class="empty-state">
      <div class="empty-state-icon">📝</div>
      <h3>상담요청이 없습니다</h3>
      <p>첫 번째 상담요청을 작성해보세요!</p>
    </div>
  `;tableBody.innerHTML=`
    <tr>
      <td colspan="5">${emptyContent}</td>
    </tr>
  `;mobileContainer.innerHTML=emptyContent;}
function showErrorState(){const tableBody=document.getElementById('ticketBody');const mobileContainer=document.getElementById('mobileCardView');const errorContent=`
    <div class="empty-state">
      <div class="empty-state-icon">⚠️</div>
      <h3>데이터를 불러올 수 없습니다</h3>
      <p>잠시 후 다시 시도해주세요.</p>
      <button class="grid-btn" onclick="loadTickets()" style="margin-top: 16px;">
        🔄 다시 시도
      </button>
    </div>
  `;tableBody.innerHTML=`
    <tr>
      <td colspan="5">${errorContent}</td>
    </tr>
  `;mobileContainer.innerHTML=errorContent;}
function showPasswordModal(ticketId){console.log('🚪 showPasswordModal 호출됨');console.log('🎫 받은 ticketId:',ticketId);console.log('🎫 ticketId type:',typeof ticketId);selectedTicketId=ticketId;console.log('✅ selectedTicketId 설정됨:',selectedTicketId);const modal=document.getElementById('passwordModal');const passwordInput=document.getElementById('modalPassword');const errorMessage=document.getElementById('modalErrorMessage');passwordInput.value='';errorMessage.style.display='none';errorMessage.textContent='';modal.style.display='block';setTimeout(()=>passwordInput.focus(),100);}
function closePasswordModal(){const modal=document.getElementById('passwordModal');modal.style.display='none';selectedTicketId=null;}
function confirmPassword(){const password=document.getElementById('modalPassword').value;const errorMessage=document.getElementById('modalErrorMessage');console.log('🔐 confirmPassword 호출됨');console.log('🎫 selectedTicketId:',selectedTicketId);console.log('🔑 password length:',password.length);errorMessage.style.display='none';errorMessage.textContent='';if(!password.trim()){errorMessage.textContent='비밀번호를 입력하세요.';errorMessage.style.display='block';return;}
if(!selectedTicketId){console.error('❌ selectedTicketId가 없음!');errorMessage.textContent='티켓 ID가 없습니다. 다시 시도해주세요.';errorMessage.style.display='block';return;}
const ticketIdToVerify=selectedTicketId;console.log('🔄 API 호출 전 ID 백업:',ticketIdToVerify);fetch(`/secret/api/v1/tickets/${ticketIdToVerify}/verify`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({post_password:password}),credentials:'same-origin',}).then((res)=>res.json()).then((result)=>{if(result.ok){console.log('✅ 비밀번호 인증 성공! 이동할 ID:',ticketIdToVerify);sessionStorage.setItem('password_verified_'+ticketIdToVerify,'true');closePasswordModal();console.log('🚀 페이지 이동:',`/view?id=${ticketIdToVerify}`);location.href=`/secret/view?id=${ticketIdToVerify}`;}else{errorMessage.textContent='비밀번호가 틀렸습니다. 다시 확인해주세요.';errorMessage.style.display='block';document.getElementById('modalPassword').value='';document.getElementById('modalPassword').focus();}}).catch((error)=>{console.error('Error:',error);errorMessage.textContent='비밀번호 확인 중 오류가 발생했습니다.';errorMessage.style.display='block';});}
document.addEventListener('click',(event)=>{const modal=document.getElementById('passwordModal');if(event.target===modal){closePasswordModal();}});