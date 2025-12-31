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
document.getElementById('ganzi-close').onclick=function(){const popup=document.getElementById('ganzi-popup');popup.style.transition='all 0.2s ease';popup.style.opacity='0';popup.style.transform='translateY(-10px) scale(0.95)';setTimeout(()=>{popup.style.display='none';},200);};document.addEventListener('keydown',function(e){if(e.key==='Escape'){const popup=document.getElementById('ganzi-popup');if(popup.style.display==='block'){document.getElementById('ganzi-close').click();}}});document.addEventListener('click',function(e){const popup=document.getElementById('ganzi-popup');if(popup.style.display==='block'&&!popup.contains(e.target)&&!e.target.closest('.day-cell')){document.getElementById('ganzi-close').click();}});(function(){'use strict';function getTodayDate(){var now=new Date();return{year:now.getFullYear(),month:now.getMonth()+1,day:now.getDate()};}
function getDisplayYearMonth(){var headerText=document.querySelector('h1');if(headerText){var match=headerText.textContent.match(/(\d+)년\s*(\d+)월/);if(match){return{year:parseInt(match[1]),month:parseInt(match[2])};}}
return null;}
function navigateToToday(){var today=getTodayDate();var form=document.getElementById('today-form');if(form){var yearInput=document.getElementById('today-year');var monthInput=document.getElementById('today-month');if(yearInput)yearInput.value=today.year;if(monthInput)monthInput.value=today.month;var navInput=form.querySelector('input[name="nav"]');if(!navInput){navInput=document.createElement('input');navInput.type='hidden';navInput.name='nav';form.appendChild(navInput);}
navInput.value='today';form.submit();}}
function initPageLoad(){var today=getTodayDate();var displayDate=getDisplayYearMonth();var dayCells=document.querySelectorAll('.day-cell[data-year][data-month][data-day]');var todayCell=null;dayCells.forEach(function(cell){var year=parseInt(cell.getAttribute('data-year'));var month=parseInt(cell.getAttribute('data-month'));var day=parseInt(cell.getAttribute('data-day'));if(year===today.year&&month===today.month&&day===today.day){todayCell=cell;}});if(displayDate&&displayDate.year===today.year&&displayDate.month===today.month&&todayCell){todayCell.classList.add('today');function scrollToToday(){try{if(todayCell){todayCell.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});}}catch(e){try{if(todayCell){todayCell.scrollIntoView();}}catch(e2){}}}
setTimeout(scrollToToday,300);setTimeout(scrollToToday,800);setTimeout(scrollToToday,1500);setInterval(function(){if(!todayCell||todayCell.matches(':hover'))return;todayCell.style.transition='box-shadow 0.5s ease';todayCell.style.boxShadow='0 8px 32px rgba(245, 158, 11, 0.5)';setTimeout(function(){if(todayCell){todayCell.style.boxShadow='0 8px 32px rgba(245, 158, 11, 0.3)';}},500);},3000);}else if(todayCell){todayCell.classList.add('today');}}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',initPageLoad);}else{initPageLoad();}
window.addEventListener('load',function(){setTimeout(initPageLoad,100);});})();(function(){'use strict';function updateTodayButtonTime(){var now=new Date();var hour=now.getHours();var minute=now.getMinutes();var timeElement=document.getElementById('kst-time');if(timeElement){var hour_str=hour.toString().padStart(2,'0');var minute_str=minute.toString().padStart(2,'0');timeElement.innerHTML=now.getFullYear()+'년 '+(now.getMonth()+1)+'월 '+now.getDate()+'일 '+
hour_str+':'+minute_str;}
var todayYearInput=document.getElementById('today-year');var todayMonthInput=document.getElementById('today-month');if(todayYearInput)todayYearInput.value=now.getFullYear();if(todayMonthInput)todayMonthInput.value=now.getMonth()+1;}
function formatLunarInfo(){var lunarElements=document.querySelectorAll('.lunar-info[data-lunar-full]');if(lunarElements.length===0){if(typeof formatLunarInfo.retryCount==='undefined'){formatLunarInfo.retryCount=0;}
if(formatLunarInfo.retryCount<10){formatLunarInfo.retryCount++;setTimeout(formatLunarInfo,100);}
return;}
formatLunarInfo.retryCount=0;lunarElements.forEach(function(element){var lunarFull=element.getAttribute('data-lunar-full');if(lunarFull&&lunarFull.trim()!==''){var match=lunarFull.match(/(\d+)월\s*(\d+)일/);if(match){var month=match[1];var day=match[2];element.textContent=month+'.'+day;}else{element.textContent='';}}});}
function updateTodayHighlight(){var now=new Date();var today={year:now.getFullYear(),month:now.getMonth()+1,day:now.getDate()};var dayCells=document.querySelectorAll('.day-cell');dayCells.forEach(function(cell){var year=parseInt(cell.getAttribute('data-year'));var month=parseInt(cell.getAttribute('data-month'));var day=parseInt(cell.getAttribute('data-day'));cell.classList.remove('today');if(year===today.year&&month===today.month&&day===today.day){cell.classList.add('today');}});}
function navigateToTodayDate(){var now=new Date();var form=document.getElementById('today-form');if(form){var yearInput=document.getElementById('today-year');var monthInput=document.getElementById('today-month');if(yearInput)yearInput.value=now.getFullYear();if(monthInput)monthInput.value=now.getMonth()+1;var navInput=form.querySelector('input[name="nav"]');if(!navInput){navInput=document.createElement('input');navInput.type='hidden';navInput.name='nav';form.appendChild(navInput);}
navInput.value='today';try{form.submit();}catch(e){var formData=new FormData(form);fetch(form.action||'/mans/',{method:'POST',body:formData}).then(function(){window.location.reload();}).catch(function(){window.location.reload();});}}}
function initCalendarScripts(){var todayBtn=document.getElementById('today-btn');if(todayBtn){var newBtn=todayBtn.cloneNode(true);todayBtn.parentNode.replaceChild(newBtn,todayBtn);newBtn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();navigateToTodayDate();return false;});var form=document.getElementById('today-form');if(form){form.addEventListener('submit',function(e){if(newBtn.matches(':focus')||document.activeElement===newBtn){e.preventDefault();navigateToTodayDate();return false;}});}}
updateTodayButtonTime();updateTodayHighlight();formatLunarInfo();setInterval(updateTodayButtonTime,1000);setInterval(updateTodayHighlight,60000);}
function tryUpdateTime(){var timeElement=document.getElementById('kst-time');if(timeElement){updateTodayButtonTime();return true;}
return false;}
function runInitialization(){if(!tryUpdateTime()){setTimeout(function(){if(!tryUpdateTime()){setTimeout(tryUpdateTime,200);}},50);}
initCalendarScripts();setTimeout(formatLunarInfo,100);setTimeout(formatLunarInfo,300);setTimeout(formatLunarInfo,600);setTimeout(formatLunarInfo,1000);}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',runInitialization);}else if(document.readyState==='interactive'||document.readyState==='complete'){runInitialization();}else{setTimeout(runInitialization,0);}
window.addEventListener('load',function(){updateTodayButtonTime();formatLunarInfo();setTimeout(formatLunarInfo,100);setTimeout(formatLunarInfo,500);});if(typeof MutationObserver!=='undefined'){var observer=new MutationObserver(function(mutations){var shouldFormat=false;mutations.forEach(function(mutation){if(mutation.addedNodes.length>0){mutation.addedNodes.forEach(function(node){if(node.nodeType===1){if(node.classList&&node.classList.contains('lunar-info')){shouldFormat=true;}
if(node.querySelectorAll&&node.querySelectorAll('.lunar-info').length>0){shouldFormat=true;}}});}});if(shouldFormat){setTimeout(formatLunarInfo,50);}});if(document.body){observer.observe(document.body,{childList:true,subtree:true});}else{document.addEventListener('DOMContentLoaded',function(){if(document.body){observer.observe(document.body,{childList:true,subtree:true});}});}}})();(function(){'use strict';var touchStartX=0;var touchStartY=0;var touchEndX=0;var touchEndY=0;var minSwipeDistance=50;var maxVerticalDistance=100;function getCalendarTable(){return document.querySelector('.manse-calendar table');}
function goToPrevMonth(){var form=document.querySelector('.calendar-nav-form');if(form){var prevButton=form.querySelector('button[name="nav"][value="prev"]');if(prevButton){prevButton.click();}else{var navInput=document.createElement('input');navInput.type='hidden';navInput.name='nav';navInput.value='prev';form.appendChild(navInput);form.submit();}}}
function goToNextMonth(){var form=document.querySelector('.calendar-nav-form');if(form){var nextButton=form.querySelector('button[name="nav"][value="next"]');if(nextButton){nextButton.click();}else{var navInput=document.createElement('input');navInput.type='hidden';navInput.name='nav';navInput.value='next';form.appendChild(navInput);form.submit();}}}
function handleTouchStart(e){var touch=e.touches[0];touchStartX=touch.clientX;touchStartY=touch.clientY;}
function handleTouchEnd(e){if(!touchStartX||!touchStartY)return;var touch=e.changedTouches[0];touchEndX=touch.clientX;touchEndY=touch.clientY;var deltaX=touchEndX-touchStartX;var deltaY=touchEndY-touchStartY;var absDeltaX=Math.abs(deltaX);var absDeltaY=Math.abs(deltaY);if(absDeltaY>maxVerticalDistance){touchStartX=0;touchStartY=0;return;}
if(absDeltaX<minSwipeDistance){touchStartX=0;touchStartY=0;return;}
if(absDeltaX>absDeltaY){e.preventDefault();if(deltaX>0){goToPrevMonth();}else{goToNextMonth();}}
touchStartX=0;touchStartY=0;}
function initSwipeGesture(){var calendarTable=getCalendarTable();if(calendarTable){calendarTable.addEventListener('touchstart',handleTouchStart,{passive:true});calendarTable.addEventListener('touchend',handleTouchEnd,{passive:false});}}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',initSwipeGesture);}else{initSwipeGesture();}
if(typeof MutationObserver!=='undefined'){var observer=new MutationObserver(function(mutations){var calendarTable=getCalendarTable();if(calendarTable&&!calendarTable.hasAttribute('data-swipe-initialized')){calendarTable.setAttribute('data-swipe-initialized','true');calendarTable.addEventListener('touchstart',handleTouchStart,{passive:true});calendarTable.addEventListener('touchend',handleTouchEnd,{passive:false});}});if(document.body){observer.observe(document.body,{childList:true,subtree:true});}else{document.addEventListener('DOMContentLoaded',function(){if(document.body){observer.observe(document.body,{childList:true,subtree:true});}});}}})();