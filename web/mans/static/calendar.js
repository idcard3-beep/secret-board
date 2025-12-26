async function showGanziInfo(cell){window.lastClickedCell=cell;var year=cell.getAttribute('data-year');var month=cell.getAttribute('data-month');var day=cell.getAttribute('data-day');var lunar=cell.getAttribute('data-lunar');var now=new Date();var hour=now.getHours();var minute=now.getMinutes();let sajuResult={};try{const res=await fetch(`/mans/get_saju?year=${year}&month=${month}&day=${day}&hour=${hour}&minute=${minute}`);sajuResult=await res.json();}catch(e){sajuResult={year:'오류',month:'오류',day:'오류',hour:'오류',info:{birth:'',yearP:''},};}
var info=sajuResult.info||{};var year_gz=sajuResult.year||'';var month_gz=sajuResult.month||'';var day_gz=sajuResult.day||'';var hour_gz=sajuResult.hour||'';var hour_names=['子시','축시','인시','묘시','진시','사시','오시','미시','신시','유시','술시','해시',];var hour_branch_idx=calculateHourBranchIndex(hour,minute);var hour_name=hour_names[hour_branch_idx];var hour_str=hour.toString().padStart(2,'0');var minute_str=minute.toString().padStart(2,'0');var hour_display=`${hour_str}:${minute_str} ${hour_name}`;var currentTermName=cell.getAttribute('data-current-term-name')||'';var currentTermKst=cell.getAttribute('data-current-term-kst')||'';var jeolipKst=cell.getAttribute('data-jeolip-kst')||'';var jeolipTerm=cell.getAttribute('data-jeolip-term')||'';var junggiKst=cell.getAttribute('data-junggi-kst')||'';var junggiTerm=cell.getAttribute('data-junggi-term')||'';var nextJeolipKst=cell.getAttribute('data-next-jeolip-kst')||'';var nextJeolipTerm=cell.getAttribute('data-next-jeolip-term')||'';var newMoonKst=cell.getAttribute('data-new-moon-kst')||'';var fullMoonKst=cell.getAttribute('data-full-moon-kst')||'';var titleHtml=`${year}.${month}.${day}`;var dayNames=['일','월','화','수','목','금','토'];var dateObj=new Date(year,month-1,day);var dayName=dayNames[dateObj.getDay()];var contentHtml=`
    <div class="popup-section solar-section">
      <div class="compact-row">
        <span class="compact-label">양력</span>
        <span class="compact-value">${year}년 ${month}월 ${day}일 ${dayName}요일</span>
      </div>
      <div class="compact-row">
        <span class="compact-label">음력</span>
        <span class="compact-value">${lunar}</span>
      </div>
    </div>

    <div class="popup-section saju-section">
      <div class="section-header">🔮 사주</div>
      <div class="compact-row">
        <span class="compact-value" style="font-size:0.75rem;font-weight:600;white-space:nowrap;">${year_gz}年 ${month_gz}月 ${day_gz}日 ${hour_gz}時</span>
      </div>
      <div class="compact-row">
        <span class="compact-label">시각</span>
        <span class="compact-value">${hour_display}</span>
      </div>
    </div>`;if(currentTermName||jeolipKst||junggiKst||nextJeolipKst){contentHtml+=`
      <div class="popup-section term-section">
        <div class="section-header">🌅 절기</div>`;if(currentTermName&&currentTermKst&&currentTermName!=='None'){var termDate=formatDate(currentTermKst);contentHtml+=`
        <div class="compact-row">
          <span class="compact-label">현재절기</span>
          <span class="compact-value">${currentTermName} (${termDate})</span>
        </div>`;}
if(jeolipKst){var jeolipDate=formatDate(jeolipKst);var jeolipDisplayTerm=jeolipTerm&&jeolipTerm.trim()!==''?jeolipTerm:'';contentHtml+=`
        <div class="compact-row">
          <span class="compact-label">이달절입</span>
          <span class="compact-value">${jeolipDisplayTerm} (${jeolipDate})</span>
        </div>`;}
if(junggiKst){var junggiDate=formatDate(junggiKst);var junggiDisplayTerm=junggiTerm&&junggiTerm.trim()!==''?junggiTerm:'';contentHtml+=`
        <div class="compact-row">
          <span class="compact-label">이달중기</span>
          <span class="compact-value">${junggiDisplayTerm} (${junggiDate})</span>
        </div>`;}
if(nextJeolipKst){var nextDate=formatDate(nextJeolipKst);var nextJeolipDisplayTerm=nextJeolipTerm&&nextJeolipTerm.trim()!==''?nextJeolipTerm:'';contentHtml+=`
        <div class="compact-row">
          <span class="compact-label">다음절입</span>
          <span class="compact-value">${nextJeolipDisplayTerm} (${nextDate})</span>
        </div>`;}
contentHtml+=`</div>`;}
if(newMoonKst||fullMoonKst){contentHtml+=`
      <div class="popup-section moon-section">
        <div class="section-header">🌙 월상</div>`;if(newMoonKst){var newMoonDate=formatDateWithTime(newMoonKst);contentHtml+=`
        <div class="compact-row">
          <span class="compact-label">합삭</span>
          <span class="compact-value">${newMoonDate}</span>
        </div>`;}
if(fullMoonKst){var fullMoonDate=formatDateWithTime(fullMoonKst);contentHtml+=`
        <div class="compact-row">
          <span class="compact-label">망</span>
          <span class="compact-value">${fullMoonDate}</span>
        </div>`;}
contentHtml+=`</div>`;}
if(info.yearP||info.birth){contentHtml+=`
      <div class="popup-section" style="border-top:1px solid rgba(229,231,235,0.5);padding-top:4px;margin-top:4px;">`;if(info.yearP){contentHtml+=`
        <div class="compact-row">
          <span class="compact-label">입춘기준</span>
          <span class="compact-value" style="font-size:0.65rem;">${info.yearP}</span>
        </div>`;}
if(info.birth){contentHtml+=`
        <div class="compact-row">
          <span class="compact-label">계산시각</span>
          <span class="compact-value" style="font-size:0.65rem;">${info.birth}</span>
        </div>`;}
contentHtml+=`</div>`;}
const popup=document.getElementById('ganzi-popup');const title=document.getElementById('popup-title');const content=document.getElementById('ganzi-content');title.innerHTML=titleHtml;content.innerHTML=contentHtml;showPopupWithSmartPosition(popup,cell);}
function calculateHourBranchIndex(hour,minute){if((hour===23&&minute>=30)||hour===0||(hour===1&&minute<30)){return 0;}else if((hour===1&&minute>=30)||hour===2||(hour===3&&minute<30)){return 1;}else if((hour===3&&minute>=30)||hour===4||(hour===5&&minute<30)){return 2;}else if((hour===5&&minute>=30)||hour===6||(hour===7&&minute<30)){return 3;}else if((hour===7&&minute>=30)||hour===8||(hour===9&&minute<30)){return 4;}else if((hour===9&&minute>=30)||hour===10||(hour===11&&minute<30)){return 5;}else if((hour===11&&minute>=30)||hour===12||(hour===13&&minute<30)){return 6;}else if((hour===13&&minute>=30)||hour===14||(hour===15&&minute<30)){return 7;}else if((hour===15&&minute>=30)||hour===16||(hour===17&&minute<30)){return 8;}else if((hour===17&&minute>=30)||hour===18||(hour===19&&minute<30)){return 9;}else if((hour===19&&minute>=30)||hour===20||(hour===21&&minute<30)){return 10;}else if((hour===21&&minute>=30)||hour===22||(hour===23&&minute<30)){return 11;}else{return Math.floor(((hour+1)%24)/2);}}
function formatDate(dateStr){if(!dateStr)return'';var parts=dateStr.split(' ');if(parts.length>=2){var datePart=parts[0].split('-');var timePart=parts[1].substring(0,5);if(datePart.length>=3){return`${parseInt(datePart[1])}/${parseInt(datePart[2])} ${timePart}`;}}
return dateStr;}
function formatDateWithTime(dateStr){if(!dateStr)return'';var parts=dateStr.split(' ');if(parts.length>=2){var datePart=parts[0].split('-');var timePart=parts[1];if(datePart.length>=3){return`${parseInt(datePart[1])}월 ${parseInt(
        datePart[2]
      )}일 ${timePart}`;}}
return dateStr;}
function showPopupWithSmartPosition(popup,cell){const rect=cell.getBoundingClientRect();const popup_width=220;const popup_height=300;let left=rect.right+10;let top=rect.top+window.scrollY;if(left+popup_width>window.innerWidth){left=rect.left-popup_width-10;}
if(top+popup_height>window.innerHeight+window.scrollY){top=window.innerHeight+window.scrollY-popup_height-20;}
if(left<10){left=10;}
if(top<10){top=10;}
popup.style.left=left+'px';popup.style.top=top+'px';popup.style.right='auto';popup.style.display='block';popup.style.opacity='0';popup.style.transform='translateY(10px) scale(0.95)';requestAnimationFrame(()=>{popup.style.transition='all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';popup.style.opacity='1';popup.style.transform='translateY(0) scale(1)';});}
document.getElementById('ganzi-close').onclick=function(){const popup=document.getElementById('ganzi-popup');popup.style.transition='all 0.2s ease';popup.style.opacity='0';popup.style.transform='translateY(-10px) scale(0.95)';setTimeout(()=>{popup.style.display='none';},200);};document.addEventListener('keydown',function(e){if(e.key==='Escape'){const popup=document.getElementById('ganzi-popup');if(popup.style.display==='block'){document.getElementById('ganzi-close').click();}}});document.addEventListener('click',function(e){const popup=document.getElementById('ganzi-popup');if(popup.style.display==='block'&&!popup.contains(e.target)&&!e.target.closest('.day-cell')){document.getElementById('ganzi-close').click();}});document.addEventListener('DOMContentLoaded',function(){const todayCell=document.querySelector('.day-cell.today');if(todayCell){setInterval(()=>{if(todayCell.matches(':hover'))return;todayCell.style.transition='box-shadow 0.5s ease';todayCell.style.boxShadow='0 8px 32px rgba(245, 158, 11, 0.5)';setTimeout(()=>{todayCell.style.boxShadow='0 8px 32px rgba(245, 158, 11, 0.3)';},500);},3000);}});