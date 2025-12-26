(function(){const STORAGE_KEY='SIT005';let rows=load()||demoSeed();let selection=null;let filter={text:'',sysref:null,secref:null};let editing=null;const gridBody=document.querySelector('#grid tbody');const statusText=document.getElementById('statusText');const searchInput=document.getElementById('searchInput');const btnSearch=document.getElementById('btnSearch');const btnClear=document.getElementById('btnClear');const treeContainer=document.getElementById('treeContainer');const btnExpandAll=document.getElementById('btnExpandAll');const btnCollapseAll=document.getElementById('btnCollapseAll');const btnAdd=document.getElementById('btnAdd');const btnEdit=document.getElementById('btnEdit');const btnDelete=document.getElementById('btnDelete');const form=document.getElementById('editForm');const fSEC=document.getElementById('fSEC');const fCD=document.getElementById('fCD');const fNM=document.getElementById('fNM');const fNO=document.getElementById('fNO');const fSYSREF=document.getElementById('fSYSREF');const fSECREF=document.getElementById('fSECREF');const btnSave=document.getElementById('btnSave');const btnCancel=document.getElementById('btnCancel');const themeSelect=document.getElementById('themeSelect');hydrateTheme();renderAll();btnSearch.addEventListener('click',()=>{filter.text=searchInput.value.trim();renderAll();});btnClear.addEventListener('click',()=>{searchInput.value='';filter.text='';filter.sysref=null;filter.secref=null;renderAll();highlightActiveNode();});searchInput.addEventListener('keydown',(e)=>{if(e.key==='Enter'){btnSearch.click();}});btnExpandAll.addEventListener('click',()=>toggleAll(true));btnCollapseAll.addEventListener('click',()=>toggleAll(false));btnAdd.addEventListener('click',()=>startAdd());btnEdit.addEventListener('click',()=>startEdit());btnDelete.addEventListener('click',()=>doDelete());btnSave.addEventListener('click',()=>saveForm());btnCancel.addEventListener('click',()=>cancelForm());themeSelect.addEventListener('change',(e)=>{const t=e.target.value;document.body.setAttribute('data-theme',t);localStorage.setItem('SIT005_THEME',t);});function renderAll(){renderTree();renderGrid();}
function renderGrid(){const filtered=applyFilter(rows,filter);const frag=document.createDocumentFragment();gridBody.innerHTML='';filtered.forEach((r)=>{const tr=document.createElement('tr');tr.tabIndex=0;tr.dataset.key=JSON.stringify({SEC:r.SEC,CD:r.CD});if(selection&&selection.SEC===r.SEC&&selection.CD===r.CD)
tr.classList.add('selected');tr.innerHTML=`
        <td>${esc(r.SEC)}</td>
        <td>${esc(r.CD)}</td>
        <td>${esc(r.NM)}</td>
        <td>${r.NO ?? ''}</td>
        <td>${esc(r.SECREF ?? '')}</td>
        <td>${esc(r.SYSREF ?? '')}</td>
      `;tr.addEventListener('click',()=>{gridBody.querySelectorAll('tr').forEach((el)=>el.classList.remove('selected'));tr.classList.add('selected');selection={SEC:r.SEC,CD:r.CD};});frag.appendChild(tr);});gridBody.appendChild(frag);statusText.textContent=`레코드 ${filtered.length}건 / 총 ${rows.length}건`;}
function renderTree(){const bySYS=groupBy(rows,(r)=>(r.SYSREF??'')||'(미지정)');const ulSYS=document.createElement('ul');Object.keys(bySYS).sort(localeSort).forEach((sys)=>{const sysNode=makeNode(sys,`SYSREF: ${sys}`,bySYS[sys].length);const ulSECREF=document.createElement('ul');const bySECREF=groupBy(bySYS[sys],(r)=>(r.SECREF??'')||'(미지정)');Object.keys(bySECREF).sort(localeSort).forEach((secref)=>{const secNode=makeNode(secref,`SECREF: ${secref}`,bySECREF[secref].length);const ulItems=document.createElement('ul');bySECREF[secref].slice().sort((a,b)=>localeSort(a.SEC+b.CD,b.SEC+b.CD)).forEach((r)=>{const li=document.createElement('li');const title=`${r.SEC}/${r.CD} — ${r.NM}`;const rowNode=makeLeaf(title,r);li.appendChild(rowNode);ulItems.appendChild(li);});const liSEC=document.createElement('li');liSEC.appendChild(secNode);liSEC.appendChild(ulItems);ulSECREF.appendChild(liSEC);});const liSYS=document.createElement('li');liSYS.appendChild(sysNode);liSYS.appendChild(ulSECREF);ulSYS.appendChild(liSYS);});treeContainer.innerHTML='';treeContainer.appendChild(ulSYS);treeContainer.querySelectorAll('ul ul').forEach((u)=>u.classList.add('hidden'));highlightActiveNode();}
function makeNode(key,label,count){const div=document.createElement('div');div.className='node';div.setAttribute('role','treeitem');div.innerHTML=`
      <span class="chev" aria-hidden="true">▸</span>
      <span><b>${esc(label)}</b></span>
      <span class="badge">${count}</span>
    `;div.addEventListener('click',(e)=>{e.stopPropagation();const ul=div.parentElement?.querySelector(':scope > ul');if(ul)ul.classList.toggle('hidden');if(label.startsWith('SYSREF: ')){filter.sysref=key==='(미지정)'?'':key;filter.secref=null;}else if(label.startsWith('SECREF: ')){const sysLabel=div.closest('li')?.parentElement?.previousElementSibling?.textContent||'';const sysKey=sysLabel.replace(/.*SYSREF:\s*/,'').trim();filter.sysref=sysKey==='(미지정)'?'':sysKey;filter.secref=key==='(미지정)'?'':key;}
renderGrid();highlightActiveNode();});return div;}
function makeLeaf(title,row){const div=document.createElement('div');div.className='node';div.innerHTML=`
      <span class="chev" aria-hidden="true">•</span>
      <span>${esc(title)}</span>
      <span class="badge">ITEM</span>
    `;div.addEventListener('click',(e)=>{e.stopPropagation();selection={SEC:row.SEC,CD:row.CD};filter.sysref=row.SYSREF??'';filter.secref=row.SECREF??'';renderGrid();highlightActiveNode();scrollToSelectedInGrid();});return div;}
function toggleAll(expand){treeContainer.querySelectorAll('ul ul').forEach((u)=>u.classList.toggle('hidden',!expand));}
function highlightActiveNode(){treeContainer.querySelectorAll('.node').forEach((n)=>n.classList.remove('active'));if(filter.sysref===null&&filter.secref===null&&!filter.text)
return;if(filter.sysref!==null){treeContainer.querySelectorAll('.node').forEach((n)=>{if(n.textContent?.includes(`SYSREF: ${filter.sysref || '(미지정)'}`)){n.classList.add('active');const ul=n.parentElement?.querySelector(':scope > ul');ul&&ul.classList.remove('hidden');}});}
if(filter.secref!==null){treeContainer.querySelectorAll('.node').forEach((n)=>{if(n.textContent?.includes(`SECREF: ${filter.secref || '(미지정)'}`)){n.classList.add('active');const ul=n.parentElement?.querySelector(':scope > ul');ul&&ul.classList.remove('hidden');}});}}
function scrollToSelectedInGrid(){const tr=gridBody.querySelector('tr.selected');if(tr)tr.scrollIntoView({block:'center'});}
function applyFilter(list,flt){let out=list.slice();if(flt.text){const q=flt.text.toLowerCase();out=out.filter((r)=>[r.SEC,r.CD,r.NM,r.SECREF||'',r.SYSREF||''].some((v)=>String(v).toLowerCase().includes(q)));}
if(flt.sysref!==null)
out=out.filter((r)=>(r.SYSREF||'')===(flt.sysref||''));if(flt.secref!==null)
out=out.filter((r)=>(r.SECREF||'')===(flt.secref||''));return out;}
function startAdd(){editing={mode:'add'};form.hidden=false;fSEC.value='';fCD.value='';fNM.value='';fNO.value='';fSYSREF.value=filter.sysref??'';fSECREF.value=filter.secref??'';fSEC.focus();}
function startEdit(){if(!selection){alert('수정할 행을 먼저 선택하세요.');return;}
const r=findByKey(selection.SEC,selection.CD);if(!r){alert('선택된 행을 찾을 수 없습니다.');return;}
editing={mode:'edit',key:{...selection}};form.hidden=false;fSEC.value=r.SEC;fCD.value=r.CD;fNM.value=r.NM;fNO.value=r.NO??'';fSYSREF.value=r.SYSREF??'';fSECREF.value=r.SECREF??'';fSEC.focus();}
function cancelForm(){editing=null;form.hidden=true;}
function saveForm(){const rec={SEC:fSEC.value.trim(),CD:fCD.value.trim(),NM:fNM.value.trim(),NO:fNO.value===''?null:Number(fNO.value),SYSREF:fSYSREF.value.trim()||'',SECREF:fSECREF.value.trim()||'',};if(!rec.SEC||!rec.CD||!rec.NM){alert('SEC, CD, NM 은 필수입니다.');return;}
if(editing?.mode==='add'){if(exists(rec.SEC,rec.CD)){alert('중복 키입니다. (SEC,CD) 조합은 고유해야 합니다.');return;}
rows.push(rec);}else if(editing?.mode==='edit'){if((rec.SEC!==editing.key.SEC||rec.CD!==editing.key.CD)&&exists(rec.SEC,rec.CD)){alert('수정된 키가 기존 레코드와 중복됩니다.');return;}
const idx=rows.findIndex((r)=>r.SEC===editing.key.SEC&&r.CD===editing.key.CD);if(idx>=0)rows[idx]=rec;else{alert('수정 대상이 사라졌습니다.');return;}
selection={SEC:rec.SEC,CD:rec.CD};}
persist();form.hidden=true;editing=null;renderAll();highlightActiveNode();}
function doDelete(){if(!selection){alert('삭제할 행을 먼저 선택하세요.');return;}
const r=findByKey(selection.SEC,selection.CD);if(!r){alert('선택된 행을 찾을 수 없습니다.');return;}
if(!confirm(`삭제하시겠습니까?\n- ${r.SEC}/${r.CD} ${r.NM}`))return;rows=rows.filter((x)=>!(x.SEC===r.SEC&&x.CD===r.CD));selection=null;persist();renderAll();}
function findByKey(SEC,CD){return rows.find((r)=>r.SEC===SEC&&r.CD===CD);}
function exists(SEC,CD){return rows.some((r)=>r.SEC===SEC&&r.CD===CD);}
function groupBy(arr,keyFn){return arr.reduce((m,x)=>{const k=keyFn(x);(m[k]||(m[k]=[])).push(x);return m;},{});}
function localeSort(a,b){return String(a).localeCompare(String(b),'ko-KR');}
function esc(s){return String(s).replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',}[m]));}
function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(rows));}
function load(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');}catch{return null;}}
function hydrateTheme(){const t=localStorage.getItem('SIT005_THEME')||'mint';document.body.setAttribute('data-theme',t);themeSelect.value=t;}
function demoSeed(){const seed=[{SEC:'A001',CD:'01',NM:'기본-1',NO:10.0,SYSREF:'ROOT-A',SECREF:'A-그룹-1',},{SEC:'A001',CD:'02',NM:'기본-2',NO:20.5,SYSREF:'ROOT-A',SECREF:'A-그룹-1',},{SEC:'A002',CD:'01',NM:'기본-3',NO:30.0,SYSREF:'ROOT-A',SECREF:'A-그룹-2',},{SEC:'B001',CD:'01',NM:'베타-1',NO:5.125,SYSREF:'ROOT-B',SECREF:'B-그룹-X',},{SEC:'B002',CD:'01',NM:'베타-2',NO:8.0,SYSREF:'ROOT-B',SECREF:'B-그룹-Y',},{SEC:'',CD:'01',NM:'미지정 루트',NO:0.0,SYSREF:'',SECREF:'',},];localStorage.setItem(STORAGE_KEY,JSON.stringify(seed));return seed;}})();