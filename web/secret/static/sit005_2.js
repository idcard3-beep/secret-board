(function(){'use strict';const KEY='SIT005_data_v2';const KEY_THEME='SIT005_theme_v2';const state={data:[],sortKey:'SEC',sortDir:'asc',filter:'',editMode:'new',editKey:null,};const el=(id)=>document.getElementById(id);const tbody=el('tbody');function safe(fn,label){try{return fn();}catch(err){console.error(label||'ERR',err);failSelfTest(label+': '+err.message);}}
function initDemoIfEmpty(){const raw=localStorage.getItem(KEY);if(!raw){const demo=[{SEC:'COMM',CD:'LANG',NM:'언어',NO:'1',SECREF:'SYS',SYSREF:'BASE',},{SEC:'COMM',CD:'NATL',NM:'국가',NO:'2.000',SECREF:'SYS',SYSREF:'BASE',},{SEC:'APP',CD:'THEME',NM:'테마',NO:'10',SECREF:'UI',SYSREF:'SKIN',},{SEC:'APP',CD:'ROLE',NM:'권한',NO:'20.100',SECREF:'AUTH',SYSREF:'ACL',},];localStorage.setItem(KEY,JSON.stringify(demo));}}
function load(){try{state.data=JSON.parse(localStorage.getItem(KEY))||[];}catch{state.data=[];}}
function save(){localStorage.setItem(KEY,JSON.stringify(state.data));}
function number14_3(x){if(x===''||x==null)return'';const n=Number(x);if(Number.isNaN(n))return null;const abs=Math.abs(n);const intDigits=Math.floor(abs).toString().length;if(intDigits>14)return null;return n.toFixed(3).replace(/\.000$/,'');}
function setCount(){el('countPill').textContent=`${filtered().length}건`;}
function filtered(){const q=state.filter.trim().toLowerCase();let rows=state.data;if(q){rows=rows.filter((r)=>[r.SEC,r.CD,r.NM,r.NO,r.SECREF,r.SYSREF].some((v)=>(v??'').toString().toLowerCase().includes(q)));}
const key=state.sortKey;const dir=state.sortDir;rows=rows.slice().sort((a,b)=>{const va=(a[key]??'').toString();const vb=(b[key]??'').toString();if(va<vb)return dir==='asc'?-1:1;if(va>vb)return dir==='asc'?1:-1;return 0;});return rows;}
function render(){const rows=filtered();tbody.innerHTML='';for(const r of rows){const tr=document.createElement('tr');tr.innerHTML=`
      <td><input type="checkbox" class="ckRow" data-key="${r.SEC}::${
          r.CD
        }"></td>
      <td><span class="chip" title="Section">${escapeHtml(
        r.SEC
      )}</span></td>
      <td>${escapeHtml(r.CD)}</td>
      <td>${escapeHtml(r.NM)}</td>
      <td style="text-align:right">${escapeHtml(r.NO ?? '')}</td>
      <td>${escapeHtml(r.SECREF ?? '')}</td>
      <td>${escapeHtml(r.SYSREF ?? '')}</td>
      <td class="actions">
        <button class="btn" data-act="edit" data-key="${r.SEC}::${
          r.CD
        }">수정</button>
        <button class="btn danger" data-act="del" data-key="${r.SEC}::${
          r.CD
        }">삭제</button>
      </td>`;tbody.appendChild(tr);}
setCount();}
function findIndexByKey(key){const[SEC,CD]=key.split('::');return state.data.findIndex((r)=>r.SEC===SEC&&r.CD===CD);}
function openModal(mode,record){el('dlgTitle').textContent=mode==='new'?'신규 레코드':`레코드 수정 (SEC=${record.SEC}, CD=${record.CD})`;el('SEC').value=record?.SEC??'';el('CD').value=record?.CD??'';el('NM').value=record?.NM??'';el('NO').value=record?.NO??'';el('SECREF').value=record?.SECREF??'';el('SYSREF').value=record?.SYSREF??'';el('SEC').disabled=mode==='edit';el('CD').disabled=mode==='edit';el('err').textContent='';el('dlg').showModal();el('NM').focus();state.editMode=mode;state.editKey=mode==='edit'?`${record.SEC}::${record.CD}`:null;}
function onSave(){const SEC=el('SEC').value.trim();const CD=el('CD').value.trim();const NM=el('NM').value.trim();let NO=el('NO').value.trim();const SECREF=el('SECREF').value.trim();const SYSREF=el('SYSREF').value.trim();if(!SEC||!CD||!NM){return showErr('SEC, CD, NM은 필수입니다.');}
if(NO!==''&&number14_3(NO)===null){return showErr('NO는 숫자(최대 14자리 정수 + 소수 3자리) 형식이어야 합니다.');}
NO=number14_3(NO);if(state.editMode==='new'){const exists=state.data.some((r)=>r.SEC===SEC&&r.CD===CD);if(exists)
return showErr('동일한 기본키(SEC,CD)가 이미 존재합니다.');state.data.push({SEC,CD,NM,NO,SECREF,SYSREF});}else{const idx=findIndexByKey(state.editKey);if(idx>-1){state.data[idx]={SEC,CD,NM,NO,SECREF,SYSREF};}}
save();el('dlg').close();render();}
function showErr(msg){el('err').textContent=msg;return false;}
function delByKey(key){const idx=findIndexByKey(key);if(idx>-1){state.data.splice(idx,1);save();render();}}
function toCSV(arr){const head=['SEC','CD','NM','NO','SECREF','SYSREF'];const lines=[head.join(',')];for(const r of arr){const line=head.map((k)=>csvCell(r[k]??''));lines.push(line.join(','));}
return lines.join('\n');}
function csvCell(v){const s=(v??'').toString();if(/["\n,]/.test(s))return'"'+s.replace(/"/g,'""')+'"';return s;}
function download(filename,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8;'}));a.download=filename;a.click();URL.revokeObjectURL(a.href);}
function escapeHtml(s){return(s??'').toString().replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',}[m]));}
document.addEventListener('click',(e)=>{const t=e.target;if(t.matches('#btnAdd')){safe(()=>openModal('new'),'openModal(new)');}
if(t.matches('#btnSave')){safe(onSave,'onSave');}
if(t.matches('[data-act="edit"]')){const key=t.getAttribute('data-key');const idx=findIndexByKey(key);if(idx>-1)
safe(()=>openModal('edit',state.data[idx]),'openModal(edit)');}
if(t.matches('[data-act="del"]')){const key=t.getAttribute('data-key');if(confirm('해당 레코드를 삭제하시겠습니까?'))
safe(()=>delByKey(key),'delByKey');}
if(t.matches('#btnDeleteSel')){const cks=[...document.querySelectorAll('.ckRow:checked')];if(!cks.length)return alert('선택된 행이 없습니다.');if(!confirm(`${cks.length}건 삭제하시겠습니까?`))return;const keys=cks.map((x)=>x.getAttribute('data-key'));for(const k of keys)safe(()=>delByKey(k),'bulkDel');}
if(t.matches('#btnExport')){safe(()=>download(`SIT005_${new Date().toISOString().slice(0, 10)}.csv`,toCSV(filtered())),'exportCSV');}
if(t.matches('#btnReset')){if(confirm('데모 데이터를 재설정할까요? (현재 데이터가 초기화됩니다)')){localStorage.removeItem(KEY);safe(initDemoIfEmpty,'initDemo');safe(load,'load');safe(render,'render');}}
if(t.matches('#ckAll')){document.querySelectorAll('.ckRow').forEach((ch)=>(ch.checked=t.checked));}
if(t.closest('th[data-key]')){const th=t.closest('th[data-key]');const key=th.getAttribute('data-key');if(state.sortKey===key){state.sortDir=state.sortDir==='asc'?'desc':'asc';}else{state.sortKey=key;state.sortDir='asc';}
safe(render,'renderSort');}});el('q').addEventListener('input',(e)=>{state.filter=e.target.value;safe(render,'renderFilter');});const root=document.getElementById('app');const themeSel=document.getElementById('themeSel');const themeBtn=document.getElementById('btnTheme');const THEMES=['dark','dim','amoled','light','sepia','contrast'];function applyTheme(v){try{root.dataset.theme=v;localStorage.setItem(KEY_THEME,v);if(themeSel)themeSel.value=v;}catch(e){console.warn('theme store error',e);}}
function cycleTheme(){const cur=root.dataset.theme||'dark';const i=Math.max(0,THEMES.indexOf(cur));const next=THEMES[(i+1)%THEMES.length];applyTheme(next);}
const savedTheme=localStorage.getItem(KEY_THEME);const defaultTheme=savedTheme||(window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');applyTheme(defaultTheme);if(themeSel){themeSel.value=root.dataset.theme;themeSel.addEventListener('change',()=>applyTheme(themeSel.value));}
if(themeBtn){themeBtn.addEventListener('click',cycleTheme);}
function passSelfTest(msg){const s=el('selftest');if(s){s.textContent='테스트 OK';s.style.color='var(--good)';s.style.borderColor='var(--good)';}
if(msg)console.log('[SELFTEST]',msg);}
function failSelfTest(msg){const s=el('selftest');if(s){s.textContent='오류 감지';s.style.color='var(--bad)';s.style.borderColor='var(--bad)';}
if(msg)console.error('[SELFTEST]',msg);}
try{initDemoIfEmpty();load();render();setCount();passSelfTest('Init completed');}catch(err){failSelfTest(err.message);}})();