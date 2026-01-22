const TOTAL=50;const GROUPS={'심리 · 정서':['우울','불안','번아웃','스트레스 관리','자기조절/감정조절','트라우마','애착','중독',],'관계 · 발달':['대인관계/의사소통','부부/커플','가족/양육','청소년/학업','진로/커리어',],'전문 기법':['CBT','ACT','DBT','마음챙김'],'동 · 서양 역학':['사주명리','주역/육효','만세력','서양점성(천궁도)','시기/전환기',],};const ROLES=['심리상담전문가','동양역학전문가','서양역학전문가','통합상담전문가','수퍼바이저',];let currentEditingId=null;let expertsData=[];let isAdmin=false;document.addEventListener('DOMContentLoaded',()=>{checkAdminPermission();loadExperts();setupEventListeners();});async function checkAdminPermission(){try{const response=await fetch('/secret/api/v1/admin/check-role');const data=await response.json();isAdmin=data.is_admin&&data.admin_role&&data.admin_role.toUpperCase()==='SUPERADMIN';const addBtn=document.getElementById('addExpertBtn');if(!isAdmin){addBtn.style.display='none';}}catch(error){console.error('권한 확인 오류:',error);isAdmin=false;}}
function setupEventListeners(){document.getElementById('addExpertBtn').addEventListener('click',()=>{openModal();});document.getElementById('modalCloseBtn').addEventListener('click',closeModal);document.getElementById('cancelBtn').addEventListener('click',closeModal);document.getElementById('expertForm').addEventListener('submit',handleSubmit);document.getElementById('closeBtn').addEventListener('click',()=>{if(window.self!==window.top){window.parent.postMessage('closeIframe','*');}else{window.close();}});}
async function loadExperts(){try{const response=await fetch('/secret/api/v1/admin/couns-experts');if(!response.ok)throw new Error('Failed to load experts');expertsData=await response.json();renderExperts();}catch(error){console.error('전문가 로드 오류:',error);alert('전문가 정보를 불러오는데 실패했습니다.');}}
function renderExperts(){const expertsEl=document.getElementById('experts');expertsEl.innerHTML='';expertsData.forEach((expert,idx)=>{const card=makeExpertCard(expert,idx+1);expertsEl.appendChild(card);});}
function makeExpertCard(expert,displayNum){const wrap=document.createElement('article');wrap.className='card panel expert';wrap.dataset.id=expert.id;const photoPath=expert.expertphoto?`/secret/uploads/images/couns/${expert.expertphoto}`:'';const photoHTML=photoPath?`<img src="${photoPath}" alt="${expert.expertname}" style="width:100%;height:100%;object-fit:cover;">`:`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`;const tags=expert.experttags?expert.experttags.split(',').map((t)=>`<span class="tag">${t.trim()}</span>`).join(''):'';wrap.innerHTML=`
    <div class="expert-head">
      <div class="expert-title">
        <span class="num">${displayNum}</span>
        <strong>${expert.expertname || '이름 없음'}</strong>
      </div>
      <span class="muted">${expert.experttitle || ''}</span>
    </div>
    
    <div class="col-2">
      <div>
        <div class="photo">${photoHTML}</div>
      </div>
      
      <div>
        <div class="field">
          <label>한줄 소개</label>
          <div style="color: var(--fg); font-size: 14px;">${
            expert.expertintro || '-'
          }</div>
        </div>
      </div>
    </div>
    
    <div class="field" style="margin-top: 12px;">
      <label>소개</label>
      <div style="color: var(--muted); font-size: 13px; line-height: 1.6;">${
        expert.expertdetail || '-'
      }</div>
    </div>
    
    ${
      tags
        ? `<div class="field"style="margin-top: 12px;"><label>태그</label><div class="chip-flow">${tags}</div></div>`
        : ''
    }
    
    ${
      expert.expertcontact
        ? `<div class="field"style="margin-top: 12px;"><label>연락처</label><div style="color: var(--muted); font-size: 13px;">${expert.expertcontact}</div></div>`
        : ''
    }
    
    ${
      isAdmin
        ? `<div class="action-btns"><button class="btn btn-save btn-edit"data-id="${expert.id}">수정</button><button class="btn btn-delete btn-del"data-id="${expert.id}">삭제</button></div>`
        : ''
    }
  `;if(isAdmin){wrap.querySelector('.btn-edit').addEventListener('click',()=>{openModal(expert);});wrap.querySelector('.btn-del').addEventListener('click',()=>{deleteExpert(expert.id);});}
return wrap;}
function openModal(expert=null){const modal=document.getElementById('expertModal');const form=document.getElementById('expertForm');const modalTitle=document.getElementById('modalTitle');form.reset();currentEditingId=null;if(expert){modalTitle.textContent='전문가 수정';currentEditingId=expert.id;document.getElementById('expertId').value=expert.id;document.getElementById('expertName').value=expert.expertname||'';document.getElementById('expertTitle').value=expert.experttitle||'';document.getElementById('expertPhoto').value=expert.expertphoto||'';document.getElementById('expertIntro').value=expert.expertintro||'';document.getElementById('expertDetail').value=expert.expertdetail||'';document.getElementById('expertTags').value=expert.experttags||'';document.getElementById('expertContact').value=expert.expertcontact||'';document.getElementById('expertOrder').value=expert.expertorder||'';}else{modalTitle.textContent='전문가 추가';document.getElementById('expertOrder').value=expertsData.length+1;}
modal.classList.add('show');}
function closeModal(){document.getElementById('expertModal').classList.remove('show');currentEditingId=null;}
async function handleSubmit(e){e.preventDefault();const formData={expertName:document.getElementById('expertName').value.trim(),expertTitle:document.getElementById('expertTitle').value,expertPhoto:document.getElementById('expertPhoto').value.trim(),expertIntro:document.getElementById('expertIntro').value.trim(),expertDetail:document.getElementById('expertDetail').value.trim(),expertTags:document.getElementById('expertTags').value.trim(),expertContact:document.getElementById('expertContact').value.trim(),expertOrder:parseInt(document.getElementById('expertOrder').value)||0,};if(currentEditingId){formData.id=currentEditingId;}
try{const url=currentEditingId?`/secret/api/v1/admin/couns-experts/${currentEditingId}`:'/secret/api/v1/admin/couns-experts';const method=currentEditingId?'PUT':'POST';const response=await fetch(url,{method:method,headers:{'Content-Type':'application/json',},body:JSON.stringify(formData),});if(!response.ok){const error=await response.json();throw new Error(error.error||'Failed to save');}
const result=await response.json();if(result.ok){alert(currentEditingId?'수정되었습니다.':'추가되었습니다.');closeModal();loadExperts();}else{throw new Error(result.error||'Failed to save');}}catch(error){console.error('저장 오류:',error);alert('저장에 실패했습니다: '+error.message);}}
async function deleteExpert(id){if(!confirm('정말 삭제하시겠습니까?'))return;try{const response=await fetch(`/secret/api/v1/admin/couns-experts/${id}`,{method:'DELETE',});if(!response.ok){const error=await response.json();throw new Error(error.error||'Failed to delete');}
const result=await response.json();if(result.ok){alert('삭제되었습니다.');loadExperts();}else{throw new Error(result.error||'Failed to delete');}}catch(error){console.error('삭제 오류:',error);alert('삭제에 실패했습니다: '+error.message);}}