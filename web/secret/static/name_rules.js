const tabs=document.querySelectorAll('.pill[data-tab]');const sections={theory:document.getElementById('theory'),analyzer:document.getElementById('analyzer'),};tabs.forEach((p)=>{p.addEventListener('click',()=>{tabs.forEach((x)=>x.classList.remove('active'));p.classList.add('active');const t=p.getAttribute('data-tab');Object.keys(sections).forEach((k)=>(sections[k].style.display=k===t?'grid':'none'));window.scrollTo({top:0,behavior:'smooth'});});});document.getElementById('closeBtn').onclick=()=>{if(window.self!==window.top){window.parent.postMessage('closeIframe','*');}else{window.close();}};const themeMenu=document.getElementById('themeMenu');themeMenu.querySelector('.pill').addEventListener('click',()=>themeMenu.classList.toggle('open'));document.addEventListener('click',(e)=>{if(!themeMenu.contains(e.target))themeMenu.classList.remove('open');});const THEME_KEY='_naming_theme_mode';const ACCENT_KEY='_naming_theme_accent';const themeSelect=document.getElementById('themeSelect');const accentSelect=document.getElementById('accentSelect');function applyTheme(mode,accent){document.body.classList.remove('theme-auto','theme-light','theme-sepia','theme-dark','theme-oled');document.body.classList.add(mode||'theme-auto');document.body.style.setProperty('--accent',accent||'');}
function loadTheme(){const mode=localStorage.getItem(THEME_KEY)||'theme-auto';const accent=localStorage.getItem(ACCENT_KEY)||'#4f8cff';themeSelect.value=mode;accentSelect.value=accent;applyTheme(mode,accent);}
function saveTheme(){const mode=themeSelect.value,accent=accentSelect.value;localStorage.setItem(THEME_KEY,mode);localStorage.setItem(ACCENT_KEY,accent);applyTheme(mode,accent);alert('테마를 저장했습니다.');}
function resetTheme(){localStorage.removeItem(THEME_KEY);localStorage.removeItem(ACCENT_KEY);themeSelect.value='theme-auto';accentSelect.value='#4f8cff';applyTheme('theme-auto','#4f8cff');}
document.getElementById('saveTheme').onclick=saveTheme;document.getElementById('resetTheme').onclick=resetTheme;loadTheme();const searchInput=document.getElementById('searchInput');const searchBtn=document.getElementById('searchBtn');const clearBtn=document.getElementById('clearSearchBtn');const searchCount=document.getElementById('searchCount');const searchableRoots=[document.querySelector('.wrap')];function clearMarks(){searchableRoots.forEach((root)=>{root.querySelectorAll('mark.__hit').forEach((m)=>{const text=document.createTextNode(m.textContent);m.replaceWith(text);});});searchCount.textContent='0건';}
function escapeReg(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function highlightQuery(q){if(!q){clearMarks();return;}
clearMarks();const rx=new RegExp(escapeReg(q),'gi');let hits=0;searchableRoots.forEach((root)=>{const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){if(!node.nodeValue.trim())return NodeFilter.FILTER_REJECT;if(node.parentElement.closest('header,.toolbar,.menu-panel,.footer'))
return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT;},});const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach((node)=>{const parent=node.parentNode;const frag=document.createDocumentFragment();let text=node.nodeValue;let lastIdx=0;let matched=false;text.replace(rx,(m,idx)=>{const before=text.slice(lastIdx,idx);if(before)frag.appendChild(document.createTextNode(before));const mark=document.createElement('mark');mark.className='__hit';mark.textContent=m;frag.appendChild(mark);lastIdx=idx+m.length;hits++;matched=true;});const after=text.slice(lastIdx);if(matched){if(after)frag.appendChild(document.createTextNode(after));parent.replaceChild(frag,node);}});});searchCount.textContent=hits+'건';if(hits>0)
document.querySelector('mark.__hit')?.scrollIntoView({behavior:'smooth',block:'center'});}
searchBtn.onclick=()=>highlightQuery(searchInput.value.trim());clearBtn.onclick=()=>{searchInput.value='';clearMarks();};searchInput.addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();highlightQuery(searchInput.value.trim());}});const defaultCJ={'ㄱ,ㅋ':'木','ㄴ,ㄷ,ㅌ,ㄹ':'火','ㅁ,ㅂ,ㅍ':'水','ㅅ,ㅈ,ㅊ,ㅎ':'金',ㅇ:'土',};const defaultV={'ㅏ,ㅑ,ㅗ,ㅛ':'木','ㅐ,ㅒ,ㅔ,ㅖ':'金','ㅓ,ㅕ,ㅜ,ㅠ':'水',ㅡ:'土',ㅣ:'火',};const storeKey={cj:'_map_cj',v:'_map_v'};function loadMap(){const cj=JSON.parse(localStorage.getItem(storeKey.cj)||'null')||defaultCJ;const v=JSON.parse(localStorage.getItem(storeKey.v)||'null')||defaultV;return{cj,v};}
function saveMap(cj,v){localStorage.setItem(storeKey.cj,JSON.stringify(cj));localStorage.setItem(storeKey.v,JSON.stringify(v));}
function drawMapTables(){const{cj,v}=loadMap();const cjBody=document.querySelector('#cjTable tbody');const vBody=document.querySelector('#vTable tbody');cjBody.innerHTML='';vBody.innerHTML='';Object.entries(cj).forEach(([k,val])=>{const tr=document.createElement('tr');tr.innerHTML=`<td contenteditable="true" class="mono">${k}</td>
      <td><select><option ${
        val === '木' ? 'selected' : ''
      }>木</option><option ${val === '火' ? 'selected' : ''}>火</option>
      <option ${val === '土' ? 'selected' : ''}>土</option><option ${
            val === '金' ? 'selected' : ''
          }>金</option><option ${
            val === '水' ? 'selected' : ''
          }>水</option></select></td>`;cjBody.appendChild(tr);});Object.entries(v).forEach(([k,val])=>{const tr=document.createElement('tr');tr.innerHTML=`<td contenteditable="true" class="mono">${k}</td>
      <td><select><option ${
        val === '木' ? 'selected' : ''
      }>木</option><option ${val === '火' ? 'selected' : ''}>火</option>
      <option ${val === '土' ? 'selected' : ''}>土</option><option ${
            val === '金' ? 'selected' : ''
          }>金</option><option ${
            val === '水' ? 'selected' : ''
          }>水</option></select></td>`;vBody.appendChild(tr);});}
drawMapTables();document.getElementById('saveMap').onclick=()=>{const cjRows=[...document.querySelectorAll('#cjTable tbody tr')];const vRows=[...document.querySelectorAll('#vTable tbody tr')];const cj={},v={};cjRows.forEach((tr)=>{const key=tr.children[0].innerText.trim().replace(/\s+/g,'');const val=tr.children[1].querySelector('select').value;if(key)cj[key]=val;});vRows.forEach((tr)=>{const key=tr.children[0].innerText.trim().replace(/\s+/g,'');const val=tr.children[1].querySelector('select').value;if(key)v[key]=val;});saveMap(cj,v);alert('매핑 테이블을 저장했습니다.');};document.getElementById('resetMap').onclick=()=>{localStorage.removeItem(storeKey.cj);localStorage.removeItem(storeKey.v);drawMapTables();alert('매핑 테이블을 기본값으로 되돌렸습니다.');};const CHO=['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ',];const JUNG=['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ',];const JONG=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ',];function decomposeHangul(ch){const code=ch.charCodeAt(0)-0xac00;if(code<0||code>11171)return null;const iCho=Math.floor(code/588);const iJung=Math.floor((code%588)/28);const iJong=code%28;const cho=CHO[iCho];const jung=JUNG[iJung];const jong=JONG[iJong]||'';let jungBase=jung;let jungSecondary='';if(jung==='ㅘ'){jungBase='ㅗ';jungSecondary='ㅏ';}
else if(jung==='ㅙ'){jungBase='ㅗ';jungSecondary='ㅐ';}
else if(jung==='ㅚ'){jungBase='ㅗ';jungSecondary='ㅣ';}
else if(jung==='ㅝ'){jungBase='ㅜ';jungSecondary='ㅓ';}
else if(jung==='ㅞ'){jungBase='ㅜ';jungSecondary='ㅔ';}
else if(jung==='ㅟ'){jungBase='ㅜ';jungSecondary='ㅣ';}
else if(jung==='ㅢ'){jungBase='ㅡ';jungSecondary='ㅣ';}
let jongBase=jong;let jongSecondary='';if(jong==='ㄳ'){jongBase='ㄱ';jongSecondary='ㅅ';}
else if(jong==='ㄵ'){jongBase='ㄴ';jongSecondary='ㅈ';}
else if(jong==='ㄶ'){jongBase='ㄴ';jongSecondary='ㅎ';}
else if(jong==='ㄺ'){jongBase='ㄹ';jongSecondary='ㄱ';}
else if(jong==='ㄻ'){jongBase='ㄹ';jongSecondary='ㅁ';}
else if(jong==='ㄼ'){jongBase='ㄹ';jongSecondary='ㅂ';}
else if(jong==='ㄽ'){jongBase='ㄹ';jongSecondary='ㅅ';}
else if(jong==='ㄾ'){jongBase='ㄹ';jongSecondary='ㅌ';}
else if(jong==='ㄿ'){jongBase='ㄹ';jongSecondary='ㅍ';}
else if(jong==='ㅀ'){jongBase='ㄹ';jongSecondary='ㅎ';}
else if(jong==='ㅄ'){jongBase='ㅂ';jongSecondary='ㅅ';}
return{cho,jung,jungBase,jungSecondary,jong,jongBase,jongSecondary};}
function expandMap(obj){const m={};Object.entries(obj).forEach(([group,val])=>{group.split(',').map((s)=>s.trim()).forEach((g)=>{if(g)m[g]=val;});});return m;}
function elemFromPhonetics({cho,jung,jungBase,jungSecondary,jong,jongBase,jongSecondary},map){const cjMap=expandMap(map.cj);const vMap=expandMap(map.v);let e=null;if(cho&&cjMap[cho]){e=cjMap[cho];}
if(!e){if(jungSecondary&&vMap[jungSecondary]){const mainElem=vMap[jungBase]||vMap[jung];if(mainElem){e=mainElem;}else if(vMap[jungSecondary]){e=vMap[jungSecondary];}}else if(jungBase&&vMap[jungBase]){e=vMap[jungBase];}else if(jung&&vMap[jung]){e=vMap[jung];}}
if(!e){if(jongBase&&cjMap[jongBase]){e=cjMap[jongBase];}else if(jong&&cjMap[jong]){e=cjMap[jong];}}
return e||'土';}
const lettersBox=document.getElementById('lettersBox');const lastName=document.getElementById('lastName');const firstName=document.getElementById('firstName');const methodSel=document.getElementById('method');const manualBox=document.getElementById('manualBox');function rebuildLetterCards(){lettersBox.innerHTML='';const name=(lastName.value+firstName.value).trim();if(!name)return;for(const ch of name){const d=decomposeHangul(ch);const card=document.createElement('div');card.className='card';let decompInfo='';if(d){decompInfo=`초:${d.cho || '-'}`;if(d.jungSecondary){decompInfo+=` · 중:${d.jungBase}+${d.jungSecondary}(${d.jung})`;}else{decompInfo+=` · 중:${d.jung || '-'}`;}
if(d.jong){if(d.jongSecondary){decompInfo+=` · 종:${d.jongBase}+${d.jongSecondary}(${d.jong})`;}else{decompInfo+=` · 종:${d.jong}`;}}else{decompInfo+=` · 종:없음`;}}else{decompInfo='초:- · 중:- · 종:-';}
card.innerHTML=`
      <div class="row" style="justify-content:space-between; align-items:center">
        <div>
          <div style="font-size:20px;font-weight:800">${ch}</div>
          <div class="small muted">${decompInfo}</div>
        </div>
        <div class="row" style="min-width:280px">
          <div>
            <label class="small">오행
              <select class="selElem">
                <option>木</option><option>火</option><option>土</option><option>金</option><option>水</option>
              </select>
            </label>
          </div>
          <div>
            <label class="small">획수(임의)
              <input type="number" class="strokes" min="1" step="1" placeholder="예: 12" />
            </label>
          </div>
          <div class="small">음양: <span class="yy">-</span></div>
        </div>
      </div>`;lettersBox.appendChild(card);}
if(methodSel.value==='phonetic'){const map=loadMap();[...lettersBox.children].forEach((card,i)=>{const ch=(lastName.value+firstName.value)[i];const d=decomposeHangul(ch);const e=d?elemFromPhonetics(d,map):'土';card.querySelector('.selElem').value=e;});}}
[lastName,firstName].forEach((el)=>el.addEventListener('input',rebuildLetterCards));methodSel.addEventListener('change',()=>{manualBox.style.display=methodSel.value==='manual'?'block':'none';rebuildLetterCards();});const SHENG={木:'火',火:'土',土:'金',金:'水',水:'木'};const KE={木:'土',土:'水',水:'火',火:'金',金:'木'};function chip(text){return`<span class="tag">${text}</span>`;}
function analyze(){const name=(lastName.value+firstName.value).trim();if(!name){alert('성명(성+이름)을 입력하세요.');return;}
const letters=[...lettersBox.children].map((card,idx)=>{const ch=name[idx];const elem=card.querySelector('.selElem').value;const strokes=parseInt(card.querySelector('.strokes').value||'0',10);const yy=strokes?(strokes%2===0?'陰(짝)':'陽(홀)'):'-';card.querySelector('.yy').textContent=yy;const decomp=decomposeHangul(ch);return{ch,elem,strokes,yy,decomp};});const dist={木:0,火:0,土:0,金:0,水:0};letters.forEach((l)=>dist[l.elem]++);const arr=Object.values(dist);const avg=arr.reduce((a,b)=>a+b,0)/5;const varc=arr.reduce((a,b)=>a+Math.pow(b-avg,2),0)/5;let score=Math.max(0,100-Math.sqrt(varc)*30);const mode=document.getElementById('shengCheck').value;const flow=[];let shengOk=0,keCnt=0,neutral=0;for(let i=0;i<letters.length-1;i++){const a=letters[i].elem,b=letters[i+1].elem;if(SHENG[a]===b){shengOk++;flow.push(`(${a}→${b}) 상생`);}else if(KE[a]===b){keCnt++;flow.push(`(${a}→${b}) 상극`);}else{neutral++;flow.push(`(${a}→${b}) 중립`);}}
if(mode==='strict'){score-=keCnt*15;score+=shengOk*4;}
if(mode==='soft'){score-=keCnt*8;score+=shengOk*2;}
score=Math.max(0,Math.min(100,Math.round(score)));const yyStats={yin:0,yang:0,unset:0};letters.forEach((l)=>{if(!l.strokes)yyStats.unset++;else if(l.strokes%2===0)yyStats.yin++;else yyStats.yang++;});const distBox=document.getElementById('distBox');distBox.innerHTML='';Object.entries(dist).forEach(([k,v])=>distBox.insertAdjacentHTML('beforeend',chip(`${k}:${v}`)));document.getElementById('balanceBar').style.width=`${score}%`;document.getElementById('balanceHint').textContent=`밸런스 점수(0~100): ${score}`;document.getElementById('flowBox').innerHTML=flow.map((x)=>chip(x)).join('');let hint=`상생 ${shengOk} · 상극 ${keCnt} · 중립 ${neutral}`;if(keCnt>0)hint+=' — 상극 구간은 설기·완화 글자 고려';document.getElementById('flowHint').textContent=hint;document.getElementById('yyBox').innerHTML=chip(`陽(홀): ${yyStats.yang}`)+
chip(`陰(짝): ${yyStats.yin}`)+
chip(`미설정: ${yyStats.unset}`);document.getElementById('yyHint').textContent='※ 획수는 임의 입력값 기준 (신자획/옛자획 등 차 존재)';const c=document.getElementById('commentBox');c.innerHTML='';const need=Object.entries(dist).sort((a,b)=>a[1]-b[1])[0][0];const over=Object.entries(dist).sort((a,b)=>b[1]-a[1])[0][0];const tips=[];tips.push(`✅ 부족 오행은 <b>${need}</b> 입니다. 해당 계열 한자/발음을 검토하세요.`);tips.push(`✅ 과다 오행은 <b>${over}</b> 입니다. 설기(洩氣)·중화 글자로 완화하세요.`);if(keCnt>0)
tips.push(`✅ 상극 구간(${keCnt}) 개선: 중간 글자 오행 변경 또는 순서 조정.`);if(score>=80)
tips.push(`✅ 밸런스 양호(점수 ${score}). 의미·자형·청감·컬러 콘셉트까지 정합성 점검.`);else
tips.push(`✅ 점수 ${score}. 1~2글자 오행 수정으로 상생 연결을 늘려보세요.`);c.innerHTML=tips.map((t)=>`<div class="small">${t}</div>`).join('');const logBox=document.getElementById('log');const lines=[];lines.push('■ 한글 분해 및 오행 분석');letters.forEach((l)=>{let line=`- ${l.ch} : 오행=${l.elem} / 획수=${l.strokes || '-'} / ${l.yy}`;if(l.decomp){line+=`\n  └ 초성:${l.decomp.cho || '-'}`;if(l.decomp.jungSecondary){line+=` / 중성:${l.decomp.jungBase}+${l.decomp.jungSecondary}(${l.decomp.jung})`;}else{line+=` / 중성:${l.decomp.jung || '-'}`;}
if(l.decomp.jong){if(l.decomp.jongSecondary){line+=` / 종성:${l.decomp.jongBase}+${l.decomp.jongSecondary}(${l.decomp.jong})`;}else{line+=` / 종성:${l.decomp.jong}`;}}else{line+=` / 종성:없음`;}}else{line+=`\n  └ (한글이 아님)`;}
lines.push(line);});lines.push('\n■ 오행분포 '+JSON.stringify(dist));lines.push(`■ 상생:${shengOk} · 상극:${keCnt} · 중립:${neutral}`);lines.push(`■ 밸런스 점수: ${score}`);logBox.textContent=lines.join('\n');}
document.getElementById('analyzeBtn').onclick=analyze;document.getElementById('resetBtn').onclick=()=>{lastName.value='';firstName.value='';lettersBox.innerHTML='';document.getElementById('log').textContent='';document.getElementById('distBox').innerHTML='';document.getElementById('flowBox').innerHTML='';document.getElementById('yyBox').innerHTML='';document.getElementById('flowHint').textContent='';document.getElementById('yyHint').textContent='';document.getElementById('balanceHint').textContent='';document.getElementById('balanceBar').style.width='0%';};[firstName,lastName].forEach((i)=>i.addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();analyze();}}));