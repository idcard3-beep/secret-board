class IntegratedNajiaSystem{constructor(){this.hexagram=[];this.movingLines=[];this.currentPosition=0;this.consultationInfo={};this.najiaResult=null;this.currentSaju=null;this.initializeEventListeners();this.loadCurrentSaju();const urlParams=new URLSearchParams(window.location.search);const ticketId=urlParams.get('ticket_id');if(ticketId){console.log('📋 URL에서 ticket_id 발견:',ticketId);window.currentTicketId=ticketId;this.loadTicketData(ticketId);}else{this.restoreY6Data();}}
getWuxingColor(branch){const wuxingMap={寅:'#2E7D32',卯:'#2E7D32',巳:'#C62828',午:'#C62828',辰:'#F57C00',戌:'#F57C00',丑:'#F57C00',未:'#F57C00',申:'#FF8F00',酉:'#FF8F00',子:'#1565C0',亥:'#1565C0',};return wuxingMap[branch]||'#333';}
simplifyKin(kin){if(!kin||typeof kin!=='string')return kin;const kinMap={兄弟:'兄',妻財:'財',官鬼:'官',子孫:'孫',父母:'父',};return kinMap[kin]||kin;}
simplifySpirit(spirit){if(!spirit||typeof spirit!=='string')return spirit;const spiritMap={青龍:'青',朱雀:'朱',勾陈:'勾',螣蛇:'螣',白虎:'白',玄武:'玄',};return spiritMap[spirit]||spirit;}
initializeEventListeners(){document.querySelectorAll('.coin-option').forEach((option)=>{option.addEventListener('click',()=>{const type=option.dataset.type;this.selectCoin(type);});});document.getElementById('resetBtn').addEventListener('click',()=>{this.resetHexagram();});document.getElementById('analyzeBtn').addEventListener('click',()=>{this.analyzeHexagram();});document.querySelectorAll('.line-slot').forEach((slot)=>{slot.addEventListener('click',(e)=>{const lineNumber=parseInt(slot.getAttribute('data-line'));if(lineNumber>=1&&lineNumber<=6){this.resetLineSlot(lineNumber);}});});document.getElementById('dbSaveBtn').addEventListener('click',()=>{this.handleDbSave();});document.getElementById('sendBtn').addEventListener('click',()=>{this.handleSend();});document.getElementById('dbViewBtn').addEventListener('click',()=>{this.handleDbView();});}
async loadCurrentSaju(){try{const response=await fetch('current-saju');const data=await response.json();if(data.success){this.currentSaju={month_branch:data.month_branch,day_stem:data.day_stem,day_branch:data.day_branch,saju:data.saju,formatted_time:data.formatted_time,};console.log('✅ 현재 시점 사주 정보 로딩 완료:',this.currentSaju);this.updatePillarValues(data.saju);}else{console.error('사주 정보 로딩 실패:',data.error);this.setDefaultSaju();}}catch(error){console.error('사주 정보 로딩 네트워크 오류:',error);this.setDefaultSaju();}}
updatePillarValues(saju){console.log('📝 updatePillarValues 호출됨:',saju);let retryCount=0;const maxRetries=10;const tryUpdate=()=>{const yearPillar=document.getElementById('yearPillar');const monthPillar=document.getElementById('monthPillar');const dayPillar=document.getElementById('dayPillar');const hourPillar=document.getElementById('hourPillar');if(!yearPillar||!monthPillar||!dayPillar||!hourPillar){retryCount++;if(retryCount<=maxRetries){console.log(`⚠️ pillar-value 요소들을 찾을 수 없음, 100ms 후 재시도... (${retryCount}/${maxRetries})`);setTimeout(tryUpdate,100);}else{console.error('❌ pillar-value 요소들을 찾을 수 없음 - 재시도 횟수 초과');}
return;}
yearPillar.textContent=saju.year||'--';monthPillar.textContent=saju.month||'--';dayPillar.textContent=saju.day||'--';hourPillar.textContent=saju.hour||'--';console.log('✅ pillar-value 요소들 업데이트 완료:',{year:saju.year,month:saju.month,day:saju.day,hour:saju.hour,});console.log('✅ 실제 DOM 값 확인:',{year:yearPillar.textContent,month:monthPillar.textContent,day:dayPillar.textContent,hour:hourPillar.textContent,});};tryUpdate();}
setDefaultSaju(){const now=new Date();this.currentSaju={month_branch:'子',day_stem:'甲',day_branch:'子',saju:{year:'--',month:'--',day:'--',hour:'--',},formatted_time:now.toLocaleString('ko-KR'),};console.log('⚠️ 기본 사주 정보로 설정됨');this.updatePillarValues(this.currentSaju.saju);}
async loadCurrentNajia(){try{const response=await fetch('/y6/current-najia');const data=await response.json();if(data.success){this.currentNajia=data;this.displayCurrentNajia(data);}else{console.error('Najia loading failed:',data.error);this.showNajiaError(data.error);}}catch(error){console.error('Network error:',error);this.showNajiaError('네트워크 오류가 발생했습니다.');}}
displayCurrentNajia(data){const{najia,formatted_time}=data;const yearPillar=document.getElementById('yearPillar');const monthPillar=document.getElementById('monthPillar');const dayPillar=document.getElementById('dayPillar');const hourPillar=document.getElementById('hourPillar');if(yearPillar)yearPillar.textContent=najia.year;if(monthPillar)monthPillar.textContent=najia.month;if(dayPillar)dayPillar.textContent=najia.day;if(hourPillar)hourPillar.textContent=najia.hour;const pillarContainer=document.querySelector('.pillar-container');if(pillarContainer){pillarContainer.style.opacity='0';setTimeout(()=>{pillarContainer.style.transition='opacity 0.5s ease';pillarContainer.style.opacity='1';},100);}}
showNajiaError(error){console.error('육효 로딩 실패:',error);}
selectCoin(type){const resultWrap=document.getElementById('resultWrap');if(resultWrap){resultWrap.classList.add('hidden');}
let targetPosition=-1;for(let i=0;i<6;i++){if(this.hexagram[i]===undefined){targetPosition=i;break;}}
if(targetPosition===-1){return;}
const lineSlot=document.querySelector(`.line-slot[data-line="${targetPosition + 1}"]`);if(!lineSlot){console.error(`Line slot not found for position ${targetPosition + 1}`);return;}
let number;switch(type){case'yang':number=7;lineSlot.className='line-slot filled yang-line';break;case'yin':number=8;lineSlot.className='line-slot filled yin-line';break;case'yang-moving':number=9;lineSlot.className='line-slot filled yang-moving-line';if(this.movingLines.indexOf(targetPosition)===-1){this.movingLines.push(targetPosition);}
break;case'yin-moving':number=6;lineSlot.className='line-slot filled yin-moving-line';if(this.movingLines.indexOf(targetPosition)===-1){this.movingLines.push(targetPosition);}
break;}
this.hexagram[targetPosition]=number;this.currentPosition=targetPosition+1;this.updateCurrentLineDisplay();this.updateNajiaPreview();if(this.currentPosition>=6){document.getElementById('analyzeBtn').disabled=false;document.getElementById('currentLineText').textContent='괘 완성! 자동 분석 중...';setTimeout(()=>{this.analyzeHexagram();},300);}}
async updateNajiaPreview(){if(!this.currentSaju||this.hexagram.length===0)return;try{const response=await fetch('/y6/calculate-najia',{method:'POST',headers:{'Content-Type':'application/json',},body:JSON.stringify({yao_input:this.hexagram.concat(Array(6-this.hexagram.length).fill(0)),yue_jian:this.currentSaju.month_branch,ri_gan:this.currentSaju.day_stem,ri_chen:this.currentSaju.day_branch,}),});const data=await response.json();if(data.success&&data.result.najia_info&&data.result.najia_info.length>0){for(let i=0;i<this.hexagram.length;i++){const lineSlot=document.querySelector(`[data-line="${i + 1}"]`);const najiaInfo=data.result.najia_info[i];if(lineSlot&&najiaInfo){const existingNajia=lineSlot.querySelector('.najia-label');if(existingNajia)existingNajia.remove();const najiaLabel=document.createElement('div');najiaLabel.className='najia-label';najiaLabel.textContent=najiaInfo['지지'];lineSlot.appendChild(najiaLabel);}}}}catch(error){console.error('Najia preview error:',error);}}
updateCurrentLineDisplay(){const lineNames=['초효','이효','삼효','사효','오효','상효'];let nextEmptyPosition=-1;for(let i=0;i<6;i++){if(this.hexagram[i]===undefined){nextEmptyPosition=i;break;}}
if(nextEmptyPosition!==-1){const nextLine=lineNames[nextEmptyPosition];document.getElementById('currentLineText').textContent=`${nextLine} (${
        nextEmptyPosition + 1
      }효)`;}else{document.getElementById('currentLineText').textContent='괘 완성!';}}
renderHexagram(){console.log('🎨 renderHexagram 시작');console.log('  hexagram 배열:',this.hexagram);console.log('  hexagram.length:',this.hexagram.length);for(let i=0;i<this.hexagram.length;i++){const lineSlot=document.querySelector(`.line-slot[data-line="${i + 1}"]`);if(!lineSlot){console.error(`  ❌ line-slot[data-line="${i + 1}"] 요소를 찾을 수 없음`);continue;}
const value=this.hexagram[i];console.log(`  🎲 효 ${i + 1}: 값=${value}`);let newClassName='line-slot';switch(value){case 7:newClassName='line-slot filled yang-line';console.log(`    → 소양 (7)`);break;case 8:newClassName='line-slot filled yin-line';console.log(`    → 소음 (8)`);break;case 9:newClassName='line-slot filled yang-moving-line';console.log(`    → 노양 (9) - 동효`);break;case 6:newClassName='line-slot filled yin-moving-line';console.log(`    → 노음 (6) - 동효`);break;default:console.warn(`    ⚠️ 알 수 없는 값: ${value}`);}
lineSlot.className=newClassName;console.log(`    ✅ className 적용: "${newClassName}"`);}
console.log('✅ renderHexagram 완료');}
updateAnalyzeButton(){const analyzeBtn=document.getElementById('analyzeBtn');const currentLineText=document.getElementById('currentLineText');if(this.hexagram.length===6){if(analyzeBtn)analyzeBtn.disabled=false;if(currentLineText)currentLineText.textContent='괘 완성!';}else{if(analyzeBtn)analyzeBtn.disabled=true;const lineNames=['초효','이효','삼효','사효','오효','상효'];if(currentLineText&&this.hexagram.length<6){const nextLine=lineNames[this.hexagram.length];currentLineText.textContent=`${nextLine} (${
          this.hexagram.length + 1
        }효)`;}}}
resetLineSlot(lineNumber){const arrayIndex=lineNumber-1;const lineSlot=document.querySelector(`.line-slot[data-line="${lineNumber}"]`);if(lineSlot){lineSlot.className='line-slot';const prefix=lineNumber.toString();for(let i=1;i<=15;i++){const extraSlot=document.querySelector(`.extra-slot${prefix}${i.toString().padStart(2, '0')}`);if(extraSlot){extraSlot.textContent='';extraSlot.innerHTML='';}}}
if(this.hexagram[arrayIndex]!==undefined){if(this.hexagram[arrayIndex]===6||this.hexagram[arrayIndex]===9){const movingIndex=this.movingLines.indexOf(arrayIndex);if(movingIndex!==-1){this.movingLines.splice(movingIndex,1);}}
delete this.hexagram[arrayIndex];}
let nextEmptyPosition=-1;for(let i=0;i<6;i++){if(this.hexagram[i]===undefined){nextEmptyPosition=i;break;}}
this.currentPosition=nextEmptyPosition!==-1?nextEmptyPosition:6;this.updateCurrentLineDisplay();const filledCount=this.hexagram.filter((v)=>v!==undefined).length;if(filledCount<6){document.getElementById('analyzeBtn').disabled=true;}
if(this.najiaResult){document.getElementById('analysisSection').style.display='none';this.najiaResult=null;const resultWrap=document.getElementById('resultWrap');if(resultWrap){resultWrap.classList.add('hidden');}}
const existingSummary=document.querySelector('.hexagram-summary');if(existingSummary){existingSummary.remove();}
if(lineSlot){const najiaLabel=lineSlot.querySelector('.najia-label');if(najiaLabel){najiaLabel.remove();}}}
resetHexagram(){this.hexagram=[];this.movingLines=[];this.currentPosition=0;this.najiaResult=null;this.consultationInfo={};document.querySelectorAll('.line-slot').forEach((slot)=>{slot.className='line-slot';slot.innerHTML='';});document.getElementById('questionType').value='';document.getElementById('questionText').value='';document.getElementById('consultantName').value='';document.getElementById('birthDate').value='';document.querySelectorAll('[class^="extra-slot"], [class*="extra-slot"]').forEach((slot)=>{slot.textContent='';slot.innerHTML='';});document.getElementById('analyzeBtn').disabled=true;document.getElementById('currentLineText').textContent='초효 (1효)';document.getElementById('analysisSection').style.display='none';const najiaContainer=document.getElementById('najiaResultContainer');if(najiaContainer){najiaContainer.innerHTML='';}
const resultWrap=document.getElementById('resultWrap');if(resultWrap){resultWrap.classList.add('hidden');}
const existingSummary=document.querySelector('.hexagram-summary');if(existingSummary){existingSummary.remove();}
const hexagramContainer=document.querySelector('.hexagram-container');if(hexagramContainer){const h3Element=hexagramContainer.querySelector('h3');if(h3Element){h3Element.textContent='괘 분석';h3Element.innerHTML='괘 분석';}}
const existingTable=document.querySelector('.professional-najia-table');if(existingTable){existingTable.remove();}
const hexagramName=document.getElementById('hexagramName');const hexagramMeaning=document.getElementById('hexagramMeaning');if(hexagramName){hexagramName.textContent='괘명';}
if(hexagramMeaning){hexagramMeaning.textContent='괘의 의미';}
this.loadCurrentSaju();console.log('✅ 괘 완전 초기화 완료');}
async analyzeHexagram(){try{this.getConsultationInfo();if(!this.currentSaju){console.log('⚠️ 사주 정보 없음 - 재로딩 시도');await this.loadCurrentSaju();if(!this.currentSaju){console.log('⚠️ 사주 정보 재로딩 실패 - 기본값 사용');this.setDefaultSaju();}}
const monthBranch=this.currentSaju.month_branch;const dayStem=this.currentSaju.day_stem;const dayBranch=this.currentSaju.day_branch;const response=await fetch('/y6/calculate-najia',{method:'POST',headers:{'Content-Type':'application/json',},body:JSON.stringify({yao_input:this.hexagram,yue_jian:monthBranch,ri_gan:dayStem,ri_chen:dayBranch,}),});const data=await response.json();if(data.success){this.najiaResult=data.result;this.displayNajiaResult();document.getElementById('analysisSection').style.display='block';const resultWrap=document.getElementById('resultWrap');if(resultWrap){resultWrap.classList.remove('hidden');}}else{alert(`분석 중 오류가 발생했습니다: ${data.error}`);}}catch(error){console.error('Analysis error:',error);alert(`분석 중 오류가 발생했습니다: ${error.message}`);}}
getConsultationInfo(){this.consultationInfo={questionType:document.getElementById('questionType').value||'일반',question:document.getElementById('questionText').value||'전반적인 운세',name:document.getElementById('consultantName').value||'',birthDate:document.getElementById('birthDate').value||'',time:new Date(),};}
displayNajiaResult(){if(this._displayNajiaResultExecuting){console.log('displayNajiaResult: 이미 실행 중, 중복 실행 방지');return;}
this._displayNajiaResultExecuting=true;let hexagramNameHtml=this.najiaResult.main_info.replace(/之/g,'<span style="font-size: 0.85rem;">之</span>');document.getElementById('hexagramName').innerHTML=hexagramNameHtml;document.getElementById('hexagramMeaning').textContent=`점시: 월건 ${this.najiaResult.base_info['월건']}, 일진 ${this.najiaResult.base_info['일진']}, 세효: ${this.najiaResult.base_info['세효']}효`;const hexagramContainer=document.querySelector('.hexagram-container');if(hexagramContainer){const h3Element=hexagramContainer.querySelector('h3');if(h3Element){let mainInfoWithRed=this.najiaResult.main_info.replace(/\(([^)]+)\)/g,'<span style="color: #dc2626; font-weight: 700; font-size: 1.2rem;">($1)</span>');mainInfoWithRed=mainInfoWithRed.replace(/之/g,'<span style="font-size: 0.9rem;">之</span>');h3Element.innerHTML=`
          <div class="base-info" style="text-align: center; padding: 1rem; background: var(--surface); border-radius: var(--radius-md); margin: 0;">
            <p> ${mainInfoWithRed}</p>
          </div>
        `;}}
const resultContainer=document.getElementById('najiaResultContainer');let mainInfoWithRed=this.najiaResult.main_info.replace(/\(([^)]+)\)/g,'<span style="color: #dc2626; font-weight: 700; font-size: 1.2rem;">($1)</span>');mainInfoWithRed=mainInfoWithRed.replace(/之/g,'<span style="font-size: 0.9rem;">之</span>');resultContainer.innerHTML=`
            <div class="professional-najia-section">
                <h4>📊 전문 납갑 계산 결과</h4>
                <div class="base-info">
                    <p><strong>괘명:</strong> ${mainInfoWithRed}</p>
                </div>
                
                // 특별 괘 분석
                <div class="special-hexagram-analysis">
                    <h5>🔮 특별 괘 분석</h5>
                    <div class="special-hexagram-grid">
                        <div class="original-special">
                            <h6>본괘 분석</h6>
                            <p><strong>괘상:</strong> ${this.formatTrigramDisplay(
                              this.najiaResult.special_analysis
                                ?.original_trigrams || '미상'
                            )}</p>
                            ${
                              this.najiaResult.special_analysis?.original_type
                                ? `<p><strong>특별 그룹:</strong><span class="special-type-badge ${this.najiaResult.special_analysis.original_type}">${this.najiaResult.special_analysis.original_type}</span></p><p class="special-meaning">${this.getSpecialMeaning(this.najiaResult.special_analysis.original_type,this.najiaResult.special_analysis.original_description)}</p>`
                                : '<p><strong>특별 그룹:</strong> 일반괘</p>'
                            }
                        </div>
                        <div class="changing-special">
                            <h6>변괘 분석</h6>
                            <p><strong>괘상:</strong> ${this.formatTrigramDisplay(
                              this.najiaResult.special_analysis
                                ?.changing_trigrams || '미상'
                            )}</p>
                            ${
                              this.najiaResult.special_analysis?.changing_type
                                ? `<p><strong>특별 그룹:</strong><span class="special-type-badge ${this.najiaResult.special_analysis.changing_type}">${this.najiaResult.special_analysis.changing_type}</span></p><p class="special-meaning">${this.getSpecialMeaning(this.najiaResult.special_analysis.changing_type,this.najiaResult.special_analysis.changing_description)}</p>`
                                : '<p><strong>특별 그룹:</strong> 일반괘</p>'
                            }
                        </div>
                    </div>
                </div>
                
                // 괘신 분석 -->
                ${
                  this.najiaResult.gua_shen
                    ? `<div class="gua-shen-analysis"><h5>🔮 괘신(卦身)분석</h5><div class="gua-shen-info"><div class="gua-shen-basic"><p><strong>괘신 지지:</strong>${this.najiaResult.gua_shen.괘신지지}</p><p><strong>괘신 효위:</strong>${this.najiaResult.gua_shen.괘신효위}효</p><p><strong>괘신 육친:</strong><span class="six-kin-badge ${this.najiaResult.gua_shen.괘신육친}">${this.najiaResult.gua_shen.괘신육친}</span></p><p><strong>괘신 왕약:</strong><span class="wang-shuai-badge ${this.najiaResult.gua_shen.괘신왕약}">${this.najiaResult.gua_shen.괘신왕약}</span></p></div><div class="gua-shen-meaning"><h6>괘신 의미</h6><p class="gua-shen-symbol">${this.najiaResult.gua_shen.괘신의미}</p><h6>괘신 작용</h6><p class="gua-shen-effect">${this.najiaResult.gua_shen.괘신작용}</p></div></div></div>`
                    : `<div class="gua-shen-analysis"><h5>🔮 괘신(卦身)분석</h5><p class="no-gua-shen">일진 ${this.najiaResult.base_info['일진'].charAt(1)}과 육합하는 지지가 괘에 없어 괘신이 없습니다.</p></div>`
                }
                
                // 공망 분석
                <div class="kong-wang-analysis">
                    <h5>🕳️ 공망(空亡) 분석</h5>
                    ${
                      this.najiaResult.kong_wang &&
                      this.najiaResult.kong_wang.공망수 > 0
                        ? `<div class="kong-wang-info"><div class="kong-wang-summary"><p><strong>공망 지지:</strong>${this.najiaResult.kong_wang.공망지지.join(', ')}</p><p><strong>공망 효 수:</strong>${this.najiaResult.kong_wang.공망수}개</p></div><div class="kong-wang-details">${this.najiaResult.kong_wang.공망효.map((kw)=>`
                                    <div class="kong-wang-yao">
                                        <span class="yao-position">${kw.효위}효</span>
                                        <span class="kong-wang-branch">${kw.지지}</span>
                                        <span class="kong-wang-kin">${kw.육친}</span>
                                        <p class="kong-wang-meaning">${kw.의미}</p>
                                    </div>
                                `).join('')}</div></div>`
                        : '<p class="no-kong-wang">현재 공망에 해당하는 효가 없습니다.</p>'
                    }
                </div>
                
                // 복신 분석
                <div class="fu-shen-analysis">
                    <h5>🛡️ 복신(伏神) 분석</h5>
                    ${
                      this.najiaResult.fu_shen &&
                      this.najiaResult.fu_shen.복신수 > 0
                        ? `<div class="fu-shen-info"><div class="fu-shen-summary"><p><strong>월건 복신 지지:</strong>${this.najiaResult.fu_shen.월건복신지지.join(', ')}</p><p><strong>복신 수:</strong>${this.najiaResult.fu_shen.복신수}개</p></div><div class="fu-shen-details">${this.najiaResult.fu_shen.복신목록.map((fs)=>`
                                    <div class="fu-shen-item">
                                        <span class="fu-shen-branch">${fs.복신지지}</span>
                                        <span class="fu-shen-kin">${fs.복신육친}</span>
                                        <p class="fu-shen-meaning">${fs.복신의미}</p>
                                        <p class="fu-shen-action">${fs.복신작용}</p>
                                    </div>
                                `).join('')}</div></div>`
                        : '<p class="no-fu-shen">현재 복신이 없습니다.</p>'
                    }
                </div>
                
                // 변효 상세 분석
                ${
                  this.najiaResult.changing_yao_detailed &&
                  this.najiaResult.changing_yao_detailed.length > 0
                    ? `<div class="changing-yao-detailed-analysis"><h5>🔄 변효 상세 분석</h5><div class="changing-yao-grid">${this.najiaResult.changing_yao_detailed.map((cyd)=>`
                                <div class="changing-yao-item">
                                    <div class="yao-header">
                                        <h6>${cyd.효위}효 변화</h6>
                                        <span class="change-nature">${cyd.변화성질}</span>
                                    </div>
                                    <div class="yao-transformation">
                                        <div class="original-state">
                                            <span class="label">원래</span>
                                            <span class="branch">${cyd.원지지}</span>
                                            <span class="kin">${cyd.원육친}</span>
                                        </div>
                                        <span class="arrow">→</span>
                                        <div class="changed-state">
                                            <span class="label">변화</span>
                                            <span class="branch">${cyd.변지지}</span>
                                            <span class="kin">${cyd.변육친}</span>
                                        </div>
                                    </div>
                                    <p class="change-meaning">${cyd.변효의미}</p>
                                </div>
                            `).join('')}</div></div>`
                    : ''
                }
                
                <table class="professional-najia-table">
                    <thead>
                        <tr>
                            <th>육신</th>
                            <th>득괘</th>
                            <th>육친</th>
                            <th>납갑 지지</th>
                            <th>효위</th>
                            <th>월건 강약</th>
                            <th>일진 관계</th>
                            <th>변효</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generateTableRows()}
                    </tbody>
                </table>
            </div>
            
            // 10단계 종합 분석 (필수) 
            <div class="comprehensive-analysis-section">
                <h3>🔮 10단계 종합 분석</h3>
                <div class="analysis-steps">
                    ${this.generateComprehensiveAnalysis()}
                </div>
            </div>
            
            <div class="saju-integration-note" style="background: #f0f9ff; border: 2px solid var(--saju-color); border-radius: var(--radius-lg); padding: var(--spacing-lg); margin-top: var(--spacing-lg);">
                <h4 style="color: var(--saju-color); margin-bottom: var(--spacing-md);">🎯 사주 연계 분석</h4>
                <div class="saju-najia-connection">
                    <p><strong>점사 시간과 사주의 연관성:</strong></p>
                    <ul style="margin: var(--spacing-md) 0; padding-left: var(--spacing-lg);">
                        <li><strong>월건(${
                          this.najiaResult.base_info['월건']
                        }):</strong> 현재 ${
      this.currentSaju.saju.month
    } 월주에서 추출</li>
                        <li><strong>일간(${this.najiaResult.base_info[
                          '일진'
                        ].charAt(0)}):</strong> 현재 ${
      this.currentSaju.saju.day
    } 일주에서 추출</li>
                        <li><strong>일지(${this.najiaResult.base_info[
                          '일진'
                        ].charAt(1)}):</strong> 현재 ${
      this.currentSaju.saju.day
    } 일주에서 추출</li>
                        <li><strong>시간:</strong> ${
                          this.currentSaju.formatted_time
                        } (${this.currentSaju.saju.hour} 시주)</li>
                    </ul>
                    <p class="integration-explanation" style="background: var(--surface); padding: var(--spacing-md); border-radius: var(--radius-sm); border-left: 4px solid var(--saju-color); font-style: italic;">
                        현재 시점의 사주가 자동으로 납갑 계산에 반영되어 정확한 월건 강약과 일진 관계를 계산했습니다.
                        이는 전통 육효학의 정법에 따른 것으로, 점사하는 순간의 시간적 에너지가 괘의 해석에 중요한 영향을 미칩니다.
                    </p>
                </div>
            </div>
        `;this.displayNajiaInHexagramArea();this.displaySummaryAboveResetButton();const updateNajiaBranchesFromTable=()=>{try{const table=document.querySelector('.professional-najia-table');if(table){const tbody=table.querySelector('tbody');if(tbody){const rows=tbody.querySelectorAll('tr');const slotMapping=[{rowIndex:0,spiritSlotId:'extra-slot101',branchSlotId:'extra-slot105',kinSlotId:'extra-slot104',changingKinSlotId:'extra-slot102',changingBranchSlotId:'extra-slot103',worldResponseSlotId:'extra-slot111',yaoName:'초효',},{rowIndex:1,spiritSlotId:'extra-slot201',branchSlotId:'extra-slot205',kinSlotId:'extra-slot204',changingKinSlotId:'extra-slot202',changingBranchSlotId:'extra-slot203',worldResponseSlotId:'extra-slot211',yaoName:'이효',},{rowIndex:2,spiritSlotId:'extra-slot301',branchSlotId:'extra-slot305',kinSlotId:'extra-slot304',changingKinSlotId:'extra-slot302',changingBranchSlotId:'extra-slot303',worldResponseSlotId:'extra-slot311',yaoName:'삼효',},{rowIndex:3,spiritSlotId:'extra-slot401',branchSlotId:'extra-slot405',kinSlotId:'extra-slot404',changingKinSlotId:'extra-slot402',changingBranchSlotId:'extra-slot403',worldResponseSlotId:'extra-slot411',yaoName:'사효',},{rowIndex:4,spiritSlotId:'extra-slot501',branchSlotId:'extra-slot505',kinSlotId:'extra-slot504',changingKinSlotId:'extra-slot502',changingBranchSlotId:'extra-slot503',worldResponseSlotId:'extra-slot511',yaoName:'오효',},{rowIndex:5,spiritSlotId:'extra-slot601',branchSlotId:'extra-slot605',kinSlotId:'extra-slot604',changingKinSlotId:'extra-slot602',changingBranchSlotId:'extra-slot603',worldResponseSlotId:'extra-slot611',yaoName:'상효',},];slotMapping.forEach(({rowIndex,spiritSlotId,branchSlotId,kinSlotId,changingKinSlotId,changingBranchSlotId,worldResponseSlotId,yaoName,})=>{if(rows[rowIndex]){const cells=rows[rowIndex].querySelectorAll('td');const calculatedYaoPos=rowIndex+1;const expectedDataLine=calculatedYaoPos;const lineSlotInHexagram=document.querySelector(`.hexagram-display .line-slot[data-line="${expectedDataLine}"]`);if(lineSlotInHexagram){const actualDataLine=parseInt(lineSlotInHexagram.getAttribute('data-line'),10);if(actualDataLine!==expectedDataLine){console.warn(`⚠️ ${yaoName} data-line 불일치: 예상=${expectedDataLine}, 실제=${actualDataLine}`);}}
const ensureSlotVisible=(slot,defaultStyles={})=>{if(slot){slot.style.setProperty('display','flex','important');slot.style.setProperty('visibility','visible','important');slot.style.setProperty('opacity','1','important');slot.style.setProperty('align-items','center','important');slot.style.setProperty('justify-content','center','important');Object.keys(defaultStyles).forEach((key)=>{slot.style.setProperty(key,defaultStyles[key],'important');});}};const allSlots=[{id:spiritSlotId,styles:{color:'#666','font-weight':'normal','font-size':'0.9rem',},},{id:branchSlotId,styles:{color:'#666','font-weight':'600','font-size':'1.3rem',},},{id:kinSlotId,styles:{color:'#666','font-weight':'bold','font-size':'0.8rem',},},{id:changingKinSlotId,styles:{color:'#666','font-weight':'bold','font-size':'0.8rem',},},{id:changingBranchSlotId,styles:{color:'#666','font-weight':'600','font-size':'1.3rem',},},{id:worldResponseSlotId,styles:{color:'#000','font-weight':'bold','font-size':'1.3rem',},},];allSlots.forEach(({id,styles})=>{const slot=document.querySelector('.'+id);ensureSlotVisible(slot,styles);});if(cells[0]){const spiritCell=cells[0];const spiritText=spiritCell.textContent.trim();const spiritSlot=document.querySelector('.'+spiritSlotId);ensureSlotVisible(spiritSlot,{color:'#333','font-weight':'normal','font-size':'0.9rem',});if(spiritSlot&&spiritText){spiritSlot.textContent=this.simplifySpirit(spiritText);console.log(`테이블에서 ${yaoName} 육신 추출 완료:`,spiritText);}else if(spiritSlot){spiritSlot.textContent='';}}else{const spiritSlot=document.querySelector('.'+spiritSlotId);ensureSlotVisible(spiritSlot,{color:'#333','font-weight':'normal','font-size':'0.9rem',});if(spiritSlot){spiritSlot.textContent='';}}
const worldResponseSlot=document.querySelector('.'+worldResponseSlotId);ensureSlotVisible(worldResponseSlot,{color:'#000','font-weight':'bold','font-size':'1.3rem',});if(cells[1]){const statusCell=cells[1];const statusText=statusCell.textContent.trim();let worldResponseText='';if(statusText.includes('世')){worldResponseText='世';}else if(statusText.includes('應')){worldResponseText='應';}
if(worldResponseSlot){if(worldResponseText){worldResponseSlot.textContent=worldResponseText;console.log(`테이블에서 ${yaoName} ${worldResponseText} 추출 완료`);}else{worldResponseSlot.textContent='';}}}else{if(worldResponseSlot){worldResponseSlot.textContent='';}}
const branchSlot=document.querySelector('.'+branchSlotId);ensureSlotVisible(branchSlot,{'font-weight':'600','font-size':'1.3rem',});let branchText='';let isKongWang=false;if(cells[3]){const branchCell=cells[3];branchText=branchCell.textContent.trim();isKongWang=branchText.includes('●');branchText=branchText.replace(/●/g,'').trim();if(branchSlot&&branchText){branchSlot.textContent=branchText;const wuxingColor=this.getWuxingColor(branchText);branchSlot.style.setProperty('color',wuxingColor,'important');console.log(`테이블에서 ${yaoName} 지지 추출 완료:`,branchText,'오행 색상:',wuxingColor);}else if(branchSlot){branchSlot.textContent='';}}else{if(branchSlot){branchSlot.textContent='';}}
const kinSlot=document.querySelector('.'+kinSlotId);ensureSlotVisible(kinSlot,{color:'#333','font-weight':'bold','font-size':'0.8rem',});if(cells[2]){const kinCell=cells[2];const strongTag=kinCell.querySelector('strong');const kinText=strongTag?strongTag.textContent.trim():kinCell.textContent.trim();if(kinSlot&&kinText){kinSlot.textContent=this.simplifyKin(kinText);kinSlot.style.position='relative';if(isKongWang){const existingDot=kinSlot.querySelector('.kong-wang-dot');if(existingDot){existingDot.remove();}
kinSlot.style.overflow='visible';const kongWangDot=document.createElement('span');kongWangDot.className='kong-wang-dot';kongWangDot.style.position='absolute';kongWangDot.style.top='0.2rem';kongWangDot.style.left='50%';kongWangDot.style.transform='translateX(-50%)';kongWangDot.style.width='0.6rem';kongWangDot.style.height='0.6rem';kongWangDot.style.borderRadius='50%';kongWangDot.style.border='2.5px solid red';kongWangDot.style.backgroundColor='transparent';kongWangDot.style.display='block';kongWangDot.style.pointerEvents='none';kongWangDot.style.zIndex='10';kinSlot.appendChild(kongWangDot);console.log(`테이블에서 ${yaoName} 육친 공망 표시 완료`);}else{const existingDot=kinSlot.querySelector('.kong-wang-dot');if(existingDot){existingDot.remove();}
kinSlot.style.overflow='';}
console.log(`테이블에서 ${yaoName} 육친 추출 완료:`,kinText);}else if(kinSlot){kinSlot.textContent='';}}else{if(kinSlot){kinSlot.textContent='';}}
const yaoPos=calculatedYaoPos;let isMovingYao=false;let changingBranchText='';let changingKinText='';if(cells[7]){const changingCell=cells[7];const changingCellText=changingCell.textContent.trim();if(changingCellText==='靜爻'||changingCellText.trim()==='靜爻'){isMovingYao=false;changingBranchText='';changingKinText='';console.log(`[${yaoName}] 테이블에서 靜爻 확인 (변효 아님): 효위=${yaoPos}, 텍스트="${changingCellText}"`);}
else if(changingCellText.includes('-&gt;')||changingCellText.includes('→')||changingCellText.includes('->')){isMovingYao=true;const match=changingCellText.match(/(?:-&gt;|→|->)\s*([^\s(]+)\s*\(([^)]+)\)/);if(match){changingBranchText=match[1].trim();changingKinText=match[2].trim();console.log(`[${yaoName}] 테이블에서 변효 확인: 효위=${yaoPos}, 변지지=${changingBranchText}, 변육친=${changingKinText}`);}else{const parts=changingCellText.replace(/(?:-&gt;|→|->)/g,'').trim().split(/\s+/);if(parts.length>=1){changingBranchText=parts[0].trim();if(parts.length>=2){changingKinText=parts[1].trim();}
console.log(`[${yaoName}] 테이블에서 변효 확인 (대체 형식): 효위=${yaoPos}, 변지지=${changingBranchText}, 변육친=${changingKinText}`);}}}else{isMovingYao=false;console.log(`[${yaoName}] 테이블에서 변효 정보 없음 (변효 아님으로 처리): 효위=${yaoPos}, 텍스트="${changingCellText}"`);}}
let changingYaoDetail=null;if(isMovingYao&&this.najiaResult&&this.najiaResult.changing_yao_detailed&&this.najiaResult.changing_yao_detailed.length>0){changingYaoDetail=this.najiaResult.changing_yao_detailed.find((cyd)=>cyd.효위===yaoPos);if(changingYaoDetail){if(changingYaoDetail.변지지){changingBranchText=changingYaoDetail.변지지;console.log(`[${yaoName}] changing_yao_detailed에서 변괘 납갑지지 사용: 효위=${yaoPos}, 변지지=${changingBranchText}`);}
if(changingYaoDetail.변육친){changingKinText=changingYaoDetail.변육친;console.log(`[${yaoName}] changing_yao_detailed에서 변괘 육친 사용: 효위=${yaoPos}, 변육친=${changingKinText}`);}}}
const lineSlot=rows[rowIndex]?rows[rowIndex].querySelector('[data-line]'):null;const dataLine=lineSlot?parseInt(lineSlot.getAttribute('data-line'),10):null;const expectedSlotId=`extra-slot${yaoPos}03`;if(changingBranchSlotId!==expectedSlotId){console.error(`❌ ${yaoName} 슬롯 ID 불일치: 효위=${yaoPos}, 예상 슬롯=${expectedSlotId}, 실제 슬롯=${changingBranchSlotId}`);}else{console.log(`✓ ${yaoName} 슬롯 ID 일치 확인: 효위=${yaoPos}, 슬롯=${changingBranchSlotId}`);}
const changingBranchSlot=document.querySelector('.'+changingBranchSlotId);ensureSlotVisible(changingBranchSlot,{'font-weight':'600','font-size':'1.3rem',});if(isMovingYao&&changingBranchText){changingBranchSlot.textContent=changingBranchText;const changingWuxingColor=this.getWuxingColor(changingBranchText);changingBranchSlot.style.setProperty('color',changingWuxingColor,'important');changingBranchSlot.style.setProperty('font-weight','600','important');changingBranchSlot.style.setProperty('display','flex','important');changingBranchSlot.style.setProperty('align-items','center','important');changingBranchSlot.style.setProperty('justify-content','center','important');changingBranchSlot.style.setProperty('font-size','1.3rem','important');changingBranchSlot.style.setProperty('visibility','visible','important');changingBranchSlot.style.setProperty('opacity','1','important');changingBranchSlot.style.setProperty('width','auto','important');changingBranchSlot.style.setProperty('height','auto','important');console.log(`✅ ${
                        changingYaoDetail
                          ? 'changing_yao_detailed에서'
                          : '테이블에서'
                      } ${yaoName} (효위=${yaoPos}) 변괘 납갑 지지 표시 완료:`,changingBranchText,'오행 색상:',changingWuxingColor,'slot:',changingBranchSlotId);}else{if(changingBranchSlot){changingBranchSlot.textContent='';}
if(!isMovingYao){console.log(`[${yaoName}] 본괘 변효 아님 (靜爻): 효위=${yaoPos}, slot=${changingBranchSlotId}`);}else{console.warn(`[${yaoName}] 변효이지만 변괘 납갑 지지 없음: 효위=${yaoPos}, slot=${changingBranchSlotId}`);}}
const changingKinSlot=document.querySelector('.'+changingKinSlotId);ensureSlotVisible(changingKinSlot,{color:'#333','font-weight':'bold','font-size':'0.8rem',});if(isMovingYao&&changingKinSlot&&changingKinText){changingKinSlot.textContent=this.simplifyKin(changingKinText);changingKinSlot.style.setProperty('color','#333','important');changingKinSlot.style.setProperty('font-weight','bold','important');changingKinSlot.style.setProperty('display','flex','important');changingKinSlot.style.setProperty('align-items','center','important');changingKinSlot.style.setProperty('justify-content','center','important');changingKinSlot.style.setProperty('font-size','0.8rem','important');changingKinSlot.style.setProperty('visibility','visible','important');changingKinSlot.style.setProperty('opacity','1','important');changingKinSlot.style.setProperty('position','relative','important');let isChangingKongWang=false;if(changingBranchText&&this.najiaResult&&this.najiaResult.kong_wang&&this.najiaResult.kong_wang.공망지지){isChangingKongWang=this.najiaResult.kong_wang.공망지지.includes(changingBranchText);}
if(isChangingKongWang){const existingDot=changingKinSlot.querySelector('.kong-wang-dot');if(existingDot){existingDot.remove();}
changingKinSlot.style.setProperty('overflow','visible','important');const kongWangDot=document.createElement('span');kongWangDot.className='kong-wang-dot';kongWangDot.style.position='absolute';kongWangDot.style.top='0.2rem';kongWangDot.style.left='50%';kongWangDot.style.transform='translateX(-50%)';kongWangDot.style.width='0.6rem';kongWangDot.style.height='0.6rem';kongWangDot.style.borderRadius='50%';kongWangDot.style.border='2.5px solid red';kongWangDot.style.backgroundColor='transparent';kongWangDot.style.display='block';kongWangDot.style.pointerEvents='none';kongWangDot.style.zIndex='10';changingKinSlot.appendChild(kongWangDot);console.log(`✅ ${
                          changingYaoDetail
                            ? 'changing_yao_detailed에서'
                            : '테이블에서'
                        } ${yaoName} 변괘 육친 공망 표시 완료`);}else{const existingDot=changingKinSlot.querySelector('.kong-wang-dot');if(existingDot){existingDot.remove();}
changingKinSlot.style.setProperty('overflow','','important');}
console.log(`✅ ${
                        changingYaoDetail
                          ? 'changing_yao_detailed에서'
                          : '테이블에서'
                      } ${yaoName} 변괘 육친 표시 완료:`,changingKinText,'slot:',changingKinSlotId);}else if(changingKinSlot){changingKinSlot.textContent='';const existingDot=changingKinSlot.querySelector('.kong-wang-dot');if(existingDot){existingDot.remove();}
if(!isMovingYao){console.log(`[${yaoName}] 본괘 변효 아님 (靜爻) - 변괘 육친 표시 안함: 효위=${yaoPos}, slot=${changingKinSlotId}`);}else{console.log(`[${yaoName}] 변효이지만 변괘 육친 없음: 효위=${yaoPos}, slot=${changingKinSlotId}`);}}}});}}}catch(error){console.error('납갑 지지 및 육친 업데이트 중 오류:',error);}};const updateChangingYaoFromMovingLinesInfo=()=>{try{const movingLinesInfo=document.querySelector('.moving-lines-info');if(movingLinesInfo){const movingLineItems=movingLinesInfo.querySelectorAll('.moving-line-item');const slotMapping={6:{branchSlotId:'extra-slot603',kinSlotId:'extra-slot602',yaoName:'상효',},5:{branchSlotId:'extra-slot503',kinSlotId:'extra-slot502',yaoName:'오효',},4:{branchSlotId:'extra-slot403',kinSlotId:'extra-slot402',yaoName:'사효',},3:{branchSlotId:'extra-slot303',kinSlotId:'extra-slot302',yaoName:'삼효',},2:{branchSlotId:'extra-slot203',kinSlotId:'extra-slot202',yaoName:'이효',},1:{branchSlotId:'extra-slot103',kinSlotId:'extra-slot102',yaoName:'초효',},};movingLineItems.forEach((item)=>{const text=item.textContent.trim();const match=text.match(/(\d+)효\s+\d+\s+→\s*->\s*([^\s(]+)\(([^)]+)\)/);if(match){const yaoPos=parseInt(match[1],10);const changingBranch=match[2];const changingKin=match[3];const mapping=slotMapping[yaoPos];if(mapping){const changingBranchSlot=document.querySelector('.'+mapping.branchSlotId);if(changingBranchSlot&&changingBranch){changingBranchSlot.textContent=changingBranch;const changingWuxingColor=this.getWuxingColor(changingBranch);changingBranchSlot.style.color=changingWuxingColor;changingBranchSlot.style.fontWeight='600';changingBranchSlot.style.display='flex';changingBranchSlot.style.alignItems='center';changingBranchSlot.style.justifyContent='center';changingBranchSlot.style.fontSize='1.3rem';changingBranchSlot.style.visibility='visible';changingBranchSlot.style.opacity='1';console.log(`동효 요약에서 ${mapping.yaoName} 변괘 납갑 지지 표시:`,changingBranch);}
const changingKinSlot=document.querySelector('.'+mapping.kinSlotId);if(changingKinSlot&&changingKin){changingKinSlot.textContent=this.simplifyKin(changingKin);changingKinSlot.style.color='#333';changingKinSlot.style.fontWeight='bold';changingKinSlot.style.display='flex';changingKinSlot.style.alignItems='center';changingKinSlot.style.justifyContent='center';changingKinSlot.style.fontSize='0.8rem';changingKinSlot.style.visibility='visible';changingKinSlot.style.opacity='1';changingKinSlot.style.position='relative';let isChangingKongWang=false;if(changingBranch&&this.najiaResult&&this.najiaResult.kong_wang&&this.najiaResult.kong_wang.공망지지){isChangingKongWang=this.najiaResult.kong_wang.공망지지.includes(changingBranch);}
if(isChangingKongWang){const existingDot=changingKinSlot.querySelector('.kong-wang-dot');if(existingDot){existingDot.remove();}
changingKinSlot.style.overflow='visible';const kongWangDot=document.createElement('span');kongWangDot.className='kong-wang-dot';kongWangDot.style.position='absolute';kongWangDot.style.top='0.2rem';kongWangDot.style.left='50%';kongWangDot.style.transform='translateX(-50%)';kongWangDot.style.width='0.6rem';kongWangDot.style.height='0.6rem';kongWangDot.style.borderRadius='50%';kongWangDot.style.border='2.5px solid red';kongWangDot.style.backgroundColor='transparent';kongWangDot.style.display='block';kongWangDot.style.pointerEvents='none';kongWangDot.style.zIndex='10';changingKinSlot.appendChild(kongWangDot);console.log(`동효 요약에서 ${mapping.yaoName} 변괘 육친 공망 표시 완료`);}else{const existingDot=changingKinSlot.querySelector('.kong-wang-dot');if(existingDot){existingDot.remove();}
changingKinSlot.style.overflow='';}
console.log(`동효 요약에서 ${mapping.yaoName} 변괘 육친 표시:`,changingKin);}}}});}}catch(error){console.error('동효 요약에서 변괘 정보 추출 중 오류:',error);}};setTimeout(updateNajiaBranchesFromTable,100);setTimeout(updateNajiaBranchesFromTable,300);setTimeout(updateNajiaBranchesFromTable,600);setTimeout(updateChangingYaoFromMovingLinesInfo,200);setTimeout(updateChangingYaoFromMovingLinesInfo,400);setTimeout(updateChangingYaoFromMovingLinesInfo,700);setTimeout(()=>{this._displayNajiaResultExecuting=false;},1000);}
displaySummaryAboveResetButton(){const hexagramControls=document.querySelector('.hexagram-controls');if(!hexagramControls)return;const existingSummary=document.querySelector('.hexagram-summary');if(existingSummary){existingSummary.remove();}
let summaryHTML='<div class="hexagram-summary">';if(this.najiaResult.kong_wang&&this.najiaResult.kong_wang.공망수>0){summaryHTML+=`<div class="summary-item kong-wang-summary">
        <strong>공망:</strong> ${this.najiaResult.kong_wang.공망지지.join(', ')}
      </div>`;}else{summaryHTML+=`<div class="summary-item kong-wang-summary">
        <strong>공망:</strong> 없음
      </div>`;}
if(this.najiaResult.special_analysis&&this.najiaResult.special_analysis.original_type){summaryHTML+=`<div class="summary-item original-special-summary">
        <strong>본괘:</strong> ${this.najiaResult.special_analysis.original_type}
      </div>`;}else{summaryHTML+=`<div class="summary-item original-special-summary">
        <strong>본괘:</strong> 일반괘
      </div>`;}
summaryHTML+=`<div class="hexagram-summary-arrow">▶</div>`;if(this.najiaResult.special_analysis&&this.najiaResult.special_analysis.changing_type){summaryHTML+=`<div class="summary-item changing-special-summary">
        <strong>변괘:</strong> ${this.najiaResult.special_analysis.changing_type}
      </div>`;}else{summaryHTML+=`<div class="summary-item changing-special-summary">
        <strong>변괘:</strong> 일반괘
      </div>`;}
if(this.najiaResult.gua_shen){summaryHTML+=`<div class="summary-item gua-shen-summary">
        <strong>괘신:</strong> ${this.najiaResult.gua_shen.괘신지지} (${this.najiaResult.gua_shen.괘신효위}효, ${this.najiaResult.gua_shen.괘신육친}, ${this.najiaResult.gua_shen.괘신왕약})
      </div>`;}else{const dayBranch=this.najiaResult.base_info['일진'].charAt(1);summaryHTML+=`<div class="summary-item gua-shen-summary">
        <strong>괘신:</strong> 없음 (일진 ${dayBranch}과 육합)
      </div>`;}
summaryHTML+='</div>';hexagramControls.insertAdjacentHTML('beforebegin',summaryHTML);}
displayNajiaInHexagramArea(){if(!this.najiaResult||!this.najiaResult.hexagram)return;this.najiaResult.hexagram.forEach((yao,index)=>{const lineNumber=index+1;const lineSlot=document.querySelector(`.line-slot[data-line="${lineNumber}"]`);if(lineSlot){const container=lineSlot.parentElement;const extraSlots=container.querySelectorAll('.extra-slot');const isMoving=yao.note.includes('動');const isKongWang=this.najiaResult.kong_wang&&this.najiaResult.kong_wang.공망지지.includes(yao.branch);const kongWangMarker=isKongWang?'●':'';const originalYaoValue=this.hexagram[index];let changingInfo=yao.changing_info;if(isMoving&&this.najiaResult.changing_yao_detailed){const changingDetail=this.najiaResult.changing_yao_detailed.find((cyd)=>cyd.효위===yao.yao_pos);if(changingDetail){changingInfo=`원: ${changingDetail.원지지} ${changingDetail.원육친} → 변: ${changingDetail.변지지} ${changingDetail.변육친} (${changingDetail.변왕약})`;}}
if(extraSlots.length>=11){extraSlots[0].textContent=this.simplifySpirit(yao.spirit);extraSlots[0].style.fontWeight='normal';extraSlots[0].style.color='#333';extraSlots[0].style.fontSize='0.9rem';const statusText=isMoving?`${yao.status} ${yao.note}`:`${yao.status} ${yao.note}`;extraSlots[1].textContent=statusText;extraSlots[1].style.fontSize='0.7rem';extraSlots[1].style.fontWeight=isMoving?'bold':'normal';extraSlots[1].style.color='#333';const originalKinSlotId=`extra-slot${yao.yao_pos}04`;const originalKinSlot=document.querySelector('.'+originalKinSlotId);if(originalKinSlot){originalKinSlot.textContent=this.simplifyKin(yao.six_kin);originalKinSlot.style.fontWeight='bold';originalKinSlot.style.color='#333';originalKinSlot.style.fontSize='0.8rem';originalKinSlot.style.display='flex';originalKinSlot.style.alignItems='center';originalKinSlot.style.justifyContent='center';originalKinSlot.style.visibility='visible';originalKinSlot.style.opacity='1';}
extraSlots[2].textContent=yao.six_kin;extraSlots[2].style.fontWeight='bold';extraSlots[2].style.color='#333';extraSlots[2].style.fontSize='0.8rem';extraSlots[3].textContent=yao.branch+(kongWangMarker?' '+kongWangMarker:'');extraSlots[3].style.fontWeight='600';extraSlots[3].style.color='var(--primary-color)';extraSlots[3].style.fontSize='0.9rem';extraSlots[4].textContent=`${yao.yao_pos}효${
            yao.note ? ' ' + yao.note : ''
          }${kongWangMarker ? ' ' + kongWangMarker : ''}`;extraSlots[4].style.fontSize='0.75rem';extraSlots[4].style.fontWeight='normal';extraSlots[4].style.color='#333';extraSlots[5].textContent=yao.wang_shuai;extraSlots[5].style.fontWeight='normal';extraSlots[5].style.color='#333';extraSlots[5].style.fontSize='0.75rem';extraSlots[6].textContent=yao.day_relation;extraSlots[6].style.fontSize='0.75rem';extraSlots[6].style.fontWeight='normal';extraSlots[6].style.color='#333';if(isMoving&&this.najiaResult.changing_yao_detailed){const changingDetail=this.najiaResult.changing_yao_detailed.find((cyd)=>cyd.효위===yao.yao_pos);if(changingDetail&&changingDetail.변육친){const changingKinSlotId=`extra-slot${yao.yao_pos}02`;const changingKinSlot=document.querySelector('.'+changingKinSlotId);if(changingKinSlot){changingKinSlot.textContent=this.simplifyKin(changingDetail.변육친);changingKinSlot.style.fontWeight='bold';changingKinSlot.style.color='#333';changingKinSlot.style.fontSize='0.8rem';changingKinSlot.style.display='flex';changingKinSlot.style.alignItems='center';changingKinSlot.style.justifyContent='center';changingKinSlot.style.visibility='visible';changingKinSlot.style.opacity='1';const isChangingKongWang=changingDetail.변지지&&this.najiaResult.kong_wang&&this.najiaResult.kong_wang.공망지지.includes(changingDetail.변지지);if(isChangingKongWang){changingKinSlot.style.position='relative';changingKinSlot.style.overflow='visible';const existingDot=changingKinSlot.querySelector('.kong-wang-dot');if(existingDot)existingDot.remove();const kongWangDot=document.createElement('span');kongWangDot.className='kong-wang-dot';kongWangDot.style.position='absolute';kongWangDot.style.top='0.2rem';kongWangDot.style.left='50%';kongWangDot.style.transform='translateX(-50%)';kongWangDot.style.width='0.6rem';kongWangDot.style.height='0.6rem';kongWangDot.style.borderRadius='50%';kongWangDot.style.border='2.5px solid red';kongWangDot.style.backgroundColor='transparent';kongWangDot.style.display='block';kongWangDot.style.pointerEvents='none';kongWangDot.style.zIndex='10';changingKinSlot.appendChild(kongWangDot);}else{const existingDot=changingKinSlot.querySelector('.kong-wang-dot');if(existingDot)existingDot.remove();}}}else{const changingKinSlotId=`extra-slot${yao.yao_pos}02`;const changingKinSlot=document.querySelector('.'+changingKinSlotId);if(changingKinSlot){changingKinSlot.textContent='';const existingDot=changingKinSlot.querySelector('.kong-wang-dot');if(existingDot)existingDot.remove();}}}else{const changingKinSlotId=`extra-slot${yao.yao_pos}02`;const changingKinSlot=document.querySelector('.'+changingKinSlotId);if(changingKinSlot){changingKinSlot.textContent='';const existingDot=changingKinSlot.querySelector('.kong-wang-dot');if(existingDot)existingDot.remove();}}
extraSlots[7].textContent=changingInfo;extraSlots[7].style.fontSize='0.65rem';extraSlots[7].style.fontWeight='normal';extraSlots[7].style.color='#666';extraSlots[7].style.whiteSpace='nowrap';extraSlots[7].style.overflow='hidden';extraSlots[7].style.textOverflow='ellipsis';}}});}
formatTrigramDisplay(trigramInfo){const matches=trigramInfo.match(/([^(]*)\(([^)]*)\)\s*\+\s*([^(]*)\(([^)]*)\)/);if(matches){const upperName=matches[1].trim();const upperSymbol=matches[2];const lowerName=matches[3].trim();const lowerSymbol=matches[4];return`<div class="trigram-stack">
                        <div class="upper-trigram">${upperSymbol}<span class="trigram-name">${upperName}</span></div>
                        <div class="lower-trigram">${lowerSymbol}<span class="trigram-name">${lowerName}</span></div>
                    </div>`;}
return trigramInfo;}
generateTableRows(){}
generateComprehensiveAnalysis(){return`
            <div class="analysis-step">
                <h4>🔍 1단계: 기본 괘 구조</h4>
                <div class="step-content">
                    ${this.displayCompleteHexagramNumbers()}
                </div>
            </div>
            
            <div class="analysis-step">
                <h4>👁️ 2단계: 육신 판정 & 납갑 분석</h4>
                <div class="step-content">
                    ${this.generateNajiaAnalysisSummary()}
                    ${this.analyzeLinePositions()}
                </div>
            </div>
            
            <div class="analysis-step">
                <h4>⚡ 3단계: 강약 분석</h4>
                <div class="step-content">
                    ${this.analyzeStrengthWeakness()}
                    ${this.analyzeMovingLinesStrength()}
                </div>
            </div>
            
            <div class="analysis-step">
                <h4>🔄 4단계: 동효와 변괘</h4>
                <div class="step-content">
                    ${this.analyzeHexagramTransformation()}
                    ${this.analyzeMovingLinesEffect()}
                    ${this.analyzeHexagramChange()}
                </div>
            </div>
            
            <div class="analysis-step">
                <h4>🤝 5단계: 용신/기신/원신</h4>
                <div class="step-content">
                    ${this.analyzeHelpingHinderingSpirits()}
                </div>
            </div>
            
            <div class="analysis-step">
                <h4>👻 6단계: 복신과 공망</h4>
                <div class="step-content">
                    ${this.analyzeHiddenSpiritsAndVoid()}
                </div>
            </div>
            
            <div class="analysis-step">
                <h4>⚖️ 7단계: 세응 관계</h4>
                <div class="step-content">
                    ${this.analyzeWorldResponseRelation()}
                </div>
            </div>
            
            <div class="analysis-step">
                <h4>⏰ 8단계: 응기 예측</h4>
                <div class="step-content">
                    ${this.predictTiming()}
                </div>
            </div>
            
            <div class="analysis-step">
                <h4>⚖️ 9단계: 종합 판단</h4>
                <div class="step-content">
                    ${this.generateJudgmentChecklist()}
                    ${this.makeFinalJudgment()}
                </div>
            </div>
            
            <div class="analysis-step">
                <h4>💡 10단계: 상담 및 조언</h4>
                <div class="step-content">
                    ${this.generateFinalAdvice()}
                </div>
            </div>
        `;}
displayCompleteHexagramNumbers(){let html='<div class="complete-hexagram-display">';html+='<h5>완전한 괘 구조 (본괘 → 변괘)</h5>';html+='<div class="hexagram-comparison">';html+='<div class="original-hexagram">';html+='<h6>본괘 (原卦)</h6>';html+='<div class="hexagram-numbers-grid">';for(let i=0;i<6;i++){const yao=this.hexagram[i];const lineInfo=this.getLineInfo(yao);const isMoving=[6,9].includes(yao);const binaryValue=[7,9].includes(yao)?'1':'0';const koreanPosition=['초효','이효','삼효','사효','오효','상효'][i];html+=`
                <div class="hexagram-line-display ${isMoving ? 'moving' : ''}">
                    <span class="line-label">${koreanPosition}</span>
                    <div class="line-visual ${this.getLineVisualClass(
                      yao
                    )}"></div>
                    <span class="line-number-badge ${
                      isMoving ? 'moving' : ''
                    }">${yao}</span>
                    <span class="line-binary">${binaryValue}</span>
                    <span class="line-description">${lineInfo}</span>
                </div>
            `;}
html+='</div>';html+=`<p><strong>본괘 이진:</strong> ${this.hexagram
      .map((y) => ([7, 9].includes(y) ? '1' : '0'))
      .join('')}</p>`;html+='</div>';const movingLines=this.hexagram.filter((yao,index)=>[6,9].includes(yao));if(movingLines.length>0){html+='<div class="arrow-divider">→</div>';html+='<div class="changing-hexagram">';html+='<h6>변괘 (變卦)</h6>';html+='<div class="hexagram-numbers-grid">';for(let i=0;i<6;i++){const originalYao=this.hexagram[i];const isMoving=[6,9].includes(originalYao);let changedYao=originalYao;if(isMoving){changedYao=originalYao===6?7:originalYao===9?8:originalYao;}
const lineInfo=this.getLineInfo(changedYao);const binaryValue=[7,9].includes(changedYao)?'1':'0';const koreanPosition=['초효','이효','삼효','사효','오효','상효'][i];html+=`
                    <div class="hexagram-line-display ${
                      isMoving ? 'changed' : ''
                    }">
                        <span class="line-label">${koreanPosition}</span>
                        <div class="line-visual ${this.getLineVisualClass(
                          changedYao
                        )}"></div>
                        <span class="line-number-badge ${
                          isMoving ? 'changed' : ''
                        }">${changedYao}</span>
                        <span class="line-binary">${binaryValue}</span>
                        <span class="line-description">${lineInfo}</span>
                        ${
                          isMoving
                            ? '<span class="change-indicator">變</span>'
                            : ''
                        }
                    </div>
                `;}
html+='</div>';const changingBinary=this.hexagram.map((yao,index)=>{if([6,9].includes(yao)){return yao===6?'1':'0';}
return[7,9].includes(yao)?'1':'0';}).join('');html+=`<p><strong>변괘 이진:</strong> ${changingBinary}</p>`;html+='</div>';}
html+='</div>';html+='</div>';return html;}
generateNajiaAnalysisSummary(){const worldLine=this.najiaResult.hexagram.find((line)=>line.note.includes('世'));const movingLines=this.najiaResult.hexagram.filter((line)=>line.note.includes('動'));let html='<div class="najia-summary">';html+='<div class="world-line-info">';html+='<h6>세효 분석</h6>';if(worldLine){html+=`<p>위치: ${worldLine.yao_pos}효</p>`;html+=`<p>육친: ${worldLine.six_kin}</p>`;html+=`<p>지지: ${worldLine.branch}</p>`;html+=`<p>강약: ${worldLine.wang_shuai}</p>`;html+=`<p>일진관계: ${worldLine.day_relation}</p>`;}
html+='</div>';html+='<div class="moving-lines-info">';html+='<h6>동효 요약</h6>';html+=`<p>동효 개수: ${movingLines.length}개</p>`;movingLines.forEach((line)=>{html+=`<div class="moving-line-item">`;html+=`${line.yao_pos}효 ${line.status} → ${line.changing_info}`;html+=`</div>`;});html+='</div>';html+='<div class="strength-summary">';html+='<h6>강약 요약</h6>';const wangLines=this.najiaResult.hexagram.filter((l)=>l.wang_shuai==='旺').length;const xiangLines=this.najiaResult.hexagram.filter((l)=>l.wang_shuai==='相').length;const xiuLines=this.najiaResult.hexagram.filter((l)=>l.wang_shuai==='休').length;const qiuLines=this.najiaResult.hexagram.filter((l)=>l.wang_shuai==='囚').length;const siLines=this.najiaResult.hexagram.filter((l)=>l.wang_shuai==='死').length;html+=`<p>왕: ${wangLines}개, 상: ${xiangLines}개, 휴: ${xiuLines}개, 수: ${qiuLines}개, 사: ${siLines}개</p>`;html+='</div>';html+='</div>';return html;}
analyzeLinePositions(){let html='<div class="line-positions-grid">';this.najiaResult.hexagram.forEach((line,index)=>{const isMoving=line.note.includes('動');const positionMeaning=this.getPositionMeaning(line.yao_pos);const binaryValue=[7,9].includes(line.status)?'1':'0';html+=`
                <div class="line-position-analysis ${
                  isMoving ? 'moving-line' : ''
                }">
                    <div class="line-header">
                        <span class="position-name">${line.yao_pos}효</span>
                        <span class="line-number-large">${line.status}</span>
                        <span class="${
                          isMoving ? 'moving-badge' : 'static-badge'
                        }">${isMoving ? '動' : '靜'}</span>
                    </div>
                    <p><strong>의미:</strong> ${positionMeaning}</p>
                    <p><strong>이진:</strong> ${binaryValue} | <strong>육친:</strong> ${
        line.six_kin
      }</p>
                    <p><strong>지지:</strong> ${line.branch} (${
        line.wang_shuai
      })</p>
                </div>
            `;});html+='</div>';return html;}
analyzeStrengthWeakness(){let html='<div class="strength-analysis">';html+='<h6>각 효의 왕상휴수사 분석</h6>';this.najiaResult.hexagram.forEach((line)=>{const description=this.getStrengthDescription(line.wang_shuai);html+=`<p><strong>${line.yao_pos}효 ${line.branch}:</strong> ${line.wang_shuai} - ${description}</p>`;});html+='</div>';return html;}
analyzeMovingLinesStrength(){const movingLines=this.najiaResult.hexagram.filter((line)=>line.note.includes('動'));if(movingLines.length===0)return'<p>동효가 없습니다.</p>';let html='<div class="moving-strength-analysis">';html+='<h6>동효 강약 특별 분석</h6>';movingLines.forEach((line)=>{const strength=line.wang_shuai;let analysis='';if(strength==='旺'||strength==='相'){analysis='동효가 강하므로 변화의 힘이 큽니다.';}else if(strength==='休'){analysis='동효가 중간 정도이므로 변화가 점진적입니다.';}else{analysis='동효가 약하므로 변화의 힘이 제한적입니다.';}
html+=`<p><strong>${line.yao_pos}효:</strong> ${analysis}</p>`;});html+='</div>';return html;}
analyzeHexagramTransformation(){const originalCode=this.hexagram.map((y)=>([7,9].includes(y)?'1':'0')).reverse().join('');const changingCode=this.getChangingHexagramCode();const originalInfo=this.najiaResult.special_analysis?.original_trigrams||'미상';const changingInfo=this.najiaResult.special_analysis?.changing_trigrams||'미상';const originalType=this.najiaResult.special_analysis?.original_type||null;const changingType=this.najiaResult.special_analysis?.changing_type||null;return`
            <div class="hexagram-transformation-analysis">
                <div class="hexagram-comparison">
                    <div class="original-hexagram-section">
                        <h6>📿 본괘</h6>
                        <div class="hexagram-display">
                            ${this.generateCoinDisplay(this.hexagram, '본괘')}
                        </div>
                        <div class="hexagram-details">
                            <p><strong>괘명:</strong> ${this.najiaResult.main_info
                              .split('之')[0]
                              .trim()
                              .replace(
                                /\(([^)]+)\)/g,
                                '<span style="color: #dc2626; font-weight: 700; font-size: 1.2rem;">($1)</span>'
                              )}</p>
                            <p><strong>2진 코드:</strong> ${originalCode}</p>
                            <p><strong>괘상:</strong> ${this.formatTrigramDisplay(
                              originalInfo
                            )}</p>
                            ${
                              originalType
                                ? `<p><strong>특별 그룹:</strong><span class="special-type-badge ${originalType}">${originalType}</span></p><p class="special-meaning">${this.getSpecialMeaning(originalType,this.najiaResult.special_analysis.original_description)}</p>`
                                : '<p><strong>특별 그룹:</strong> 일반괘</p>'
                            }
                        </div>
                    </div>
                    
                    <div class="transformation-arrow">
                        <div class="arrow-container">
                            <span class="arrow-symbol">→</span>
                            <span class="arrow-label">변화</span>
                        </div>
                    </div>
                    
                    <div class="changing-hexagram-section">
                        <h6>📿 변괘</h6>
                        <div class="hexagram-display">
                            ${this.generateCoinDisplay(
                              this.getChangingHexagram(),
                              '변괘'
                            )}
                        </div>
                        <div class="hexagram-details">
                            <p><strong>괘명:</strong> ${
                              this.najiaResult.main_info.split('之')[1]
                                ? this.najiaResult.main_info
                                    .split('之')[1]
                                    .trim()
                                    .replace(
                                      /\(([^)]+)\)/g,
                                      '<span style="color: #dc2626; font-weight: 700; font-size: 1.2rem;">($1)</span>'
                                    )
                                : '변괘 없음'
                            }</p>
                            <p><strong>2진 코드:</strong> ${changingCode}</p>
                            <p><strong>괘상:</strong> ${this.formatTrigramDisplay(
                              changingInfo
                            )}</p>
                            ${
                              changingType
                                ? `<p><strong>특별 그룹:</strong><span class="special-type-badge ${changingType}">${changingType}</span></p><p class="special-meaning">${this.getSpecialMeaning(changingType,this.najiaResult.special_analysis.changing_description)}</p>`
                                : '<p><strong>특별 그룹:</strong> 일반괘</p>'
                            }
                        </div>
                    </div>
                </div>
                
                <div class="transformation-analysis">
                    <h6>🔄 변화 분석</h6>
                    ${this.analyzeTransformationPattern()}
                </div>
            </div>
        `;}
generateCoinDisplay(hexagram,label){const coinImages={6:'⚪',7:'⚫',8:'⚪',9:'⚫',};const coinLabels={6:'음 동',7:'양 정',8:'음 정',9:'양 동',};return`
            <div class="coin-hexagram">
                ${hexagram
                  .map(
                    (yao, index) => `<div class="coin-line"data-position="${6 - index}효"><span class="coin-symbol ${[6,9].includes(yao)?'moving':'static'}">${coinImages[yao]}</span><span class="coin-label">${coinLabels[yao]}</span><span class="line-position">${6-index}효</span></div>`
                  )
                  .join('')}
            </div>
        `;}
getChangingHexagram(){return this.hexagram.map((yao)=>{if(yao===6)return 7;if(yao===9)return 8;return yao;});}
analyzeTransformationPattern(){const movingLines=this.hexagram.map((yao,index)=>([6,9].includes(yao)?6-index:null)).filter((x)=>x!==null);const movingCount=movingLines.length;let pattern='';let significance='';switch(movingCount){case 0:pattern='정괘 (無動)';significance='안정된 상황으로 현상 유지. 급격한 변화는 없으나 내재된 기운은 지속됨';break;case 1:pattern='단동 (一動)';significance=`${movingLines[0]}효 단독 변화. 명확한 방향성으로 해석이 용이하고 변화의 핵심이 뚜렷함`;break;case 2:pattern='이동 (二動)';significance=`${movingLines.join(
          '효, '
        )}효 변화. 복잡한 상황으로 양면성 존재, 신중한 판단 필요`;break;case 3:pattern='삼동 (三動)';significance=`${movingLines.join(
          '효, '
        )}효 변화. 역동적 변화로 기회와 위험이 공존`;break;case 4:pattern='사동 (四動)';significance=`${movingLines.join(
          '효, '
        )}효 변화. 대변혁의 시기로 근본적 변화 임박`;break;case 5:pattern='오동 (五動)';significance=`${movingLines.join(
          '효, '
        )}효 변화. 극도의 변화로 정적인 효가 핵심 역할`;break;case 6:pattern='육동 (六動)';significance='전체 변화로 완전한 전환. 기존 틀의 완전한 해체와 재구성';break;}
return`
            <div class="pattern-analysis">
                <p><strong>변화 패턴:</strong> ${pattern}</p>
                <p><strong>변화 의미:</strong> ${significance}</p>
                <p><strong>동효 위치:</strong> ${
                  movingLines.length > 0
                    ? movingLines.map((x) => `${x}효`).join(', ')
                    : '없음'
                }</p>
            </div>
        `;}
analyzeMovingLinesEffect(){const movingCount=this.najiaResult.hexagram.filter((line)=>line.note.includes('動')).length;let interpretation='';switch(movingCount){case 0:interpretation='정괘 - 안정된 상황, 변화가 적음';break;case 1:interpretation='단동 - 명확한 방향성, 해석이 용이함';break;case 2:interpretation='이동 - 복잡한 상황, 양면성 존재';break;case 3:interpretation='삼동 - 혼란스러운 상황, 신중한 판단 필요';break;case 4:interpretation='사동 - 큰 변화, 전환점';break;case 5:interpretation='오동 - 극도의 변화, 혁신적 전환';break;case 6:interpretation='육동 - 완전한 변화, 새로운 시작';break;}
return`<div class="moving-effect"><h6>동효 개수에 따른 해석</h6><p><strong>${movingCount}개 동효:</strong> ${interpretation}</p></div>`;}
analyzeHexagramChange(){const changeDirection=this.getChangeDirection();return`<div class="change-analysis"><h6>변화의 성격</h6><p>${changeDirection}</p><p><strong>변화 내용:</strong> ${this.getChangeDescription()}</p></div>`;}
analyzeHelpingHinderingSpirits(){const questionType=this.consultationInfo.questionType||'일반';const primarySpirit=this.getPrimarySpirit(questionType);const helpingSpirit=this.getHelpingSpirit(primarySpirit);const hinderingSpirit=this.getHinderingSpirit(primarySpirit);let html='<div class="spirit-analysis">';html+=`<h6>용신/기신/원신 분석 (${questionType} 질문)</h6>`;html+=`<p><strong>용신(主神):</strong> ${primarySpirit}</p>`;html+=`<p><strong>원신(助神):</strong> ${helpingSpirit}</p>`;html+=`<p><strong>기신(克神):</strong> ${hinderingSpirit}</p>`;html+='<div class="spirit-presence">';html+='<h6>괘 내 육친 현황</h6>';const spiritPresence=this.checkSpiritPresence();spiritPresence.forEach((spirit)=>{html+=`<p>${spirit}</p>`;});html+='</div>';html+='</div>';return html;}
analyzeHiddenSpiritsAndVoid(){let html='<div class="hidden-void-analysis">';html+='<div class="hidden-spirits">';html+='<h6>🛡️ 복신 분석</h6>';if(this.najiaResult.fu_shen&&this.najiaResult.fu_shen.복신수>0){html+=`<p><strong>복신 개수:</strong> ${this.najiaResult.fu_shen.복신수}개</p>`;html+='<div class="fu-shen-list">';this.najiaResult.fu_shen.복신목록.forEach((fs)=>{html+=`<div class="fu-shen-detail">`;html+=`<span class="fu-shen-branch-badge">${fs.복신지지}</span>`;html+=`<span class="fu-shen-kin-badge">${fs.복신육친}</span>`;html+=`<p>${fs.복신의미} - ${fs.복신작용}</p>`;html+=`</div>`;});html+='</div>';html+='<p class="fu-shen-summary"><strong>복신 작용:</strong> 잠재된 도움이나 영향으로 적절한 때에 나타나 상황을 돕습니다.</p>';}else{html+='<p class="no-fu-shen">현재 복신이 없어 잠재된 도움이 제한적입니다.</p>';}
html+='</div>';html+='<div class="void-calculation">';html+='<h6>🕳️ 공망 분석</h6>';if(this.najiaResult.kong_wang&&this.najiaResult.kong_wang.공망수>0){html+=`<p><strong>공망 지지:</strong> ${this.najiaResult.kong_wang.공망지지.join(
        ', '
      )}</p>`;html+=`<p><strong>공망 효수:</strong> ${this.najiaResult.kong_wang.공망수}개</p>`;html+='<div class="kong-wang-effects">';this.najiaResult.kong_wang.공망효.forEach((kw)=>{html+=`<div class="kong-wang-effect">`;html+=`<span class="kong-wang-yao">${kw.효위}효</span>`;html+=`<span class="kong-wang-branch-badge">${kw.지지}</span>`;html+=`<span class="kong-wang-kin-badge">${kw.육친}</span>`;html+=`<p>${kw.의미}</p>`;html+=`</div>`;});html+='</div>';const worldLine=this.najiaResult.hexagram.find((line)=>line.note.includes('世'));const responseLine=this.najiaResult.hexagram.find((line)=>line.note.includes('應'));if(worldLine&&this.najiaResult.kong_wang.공망지지.includes(worldLine.branch)){html+='<p class="critical-void">⚠️ <strong>세효가 공망</strong>: 자신의 능력이 현재 발휘되지 못함</p>';}
if(responseLine&&this.najiaResult.kong_wang.공망지지.includes(responseLine.branch)){html+='<p class="critical-void">⚠️ <strong>응효가 공망</strong>: 상대방이나 목표가 현실성 부족</p>';}}else{html+='<p class="no-kong-wang">현재 공망에 해당하는 효가 없어 모든 효가 정상적으로 작용합니다.</p>';}
html+='</div>';html+='</div>';return html;}
analyzeWorldResponseRelation(){const worldLine=this.najiaResult.hexagram.find((line)=>line.note.includes('世'));const responseLine=this.najiaResult.hexagram.find((line)=>line.note.includes('應'));let html='<div class="world-response-analysis">';html+='<h6>⚖️ 세효와 응효의 관계</h6>';if(worldLine&&responseLine){html+='<div class="world-line-info">';html+=`<h7>🏠 세효 (${worldLine.yao_pos}효)</h7>`;html+=`<p><strong>지지:</strong> ${worldLine.branch} | <strong>육친:</strong> ${worldLine.six_kin} | <strong>왕약:</strong> ${worldLine.wang_shuai}</p>`;if(this.najiaResult.kong_wang&&this.najiaResult.kong_wang.공망지지.includes(worldLine.branch)){html+='<p class="world-void">⚠️ 세효가 공망 상태입니다</p>';}
html+='</div>';html+='<div class="response-line-info">';html+=`<h7>🤝 응효 (${responseLine.yao_pos}효)</h7>`;html+=`<p><strong>지지:</strong> ${responseLine.branch} | <strong>육친:</strong> ${responseLine.six_kin} | <strong>왕약:</strong> ${responseLine.wang_shuai}</p>`;if(this.najiaResult.kong_wang&&this.najiaResult.kong_wang.공망지지.includes(responseLine.branch)){html+='<p class="response-void">⚠️ 응효가 공망 상태입니다</p>';}
html+='</div>';html+='<div class="world-response-relation">';html+='<h7>🔗 세응 관계 분석</h7>';const relation=this.analyzeElementRelation(worldLine.branch,responseLine.branch);const harmonyRelation=this.analyzeHarmonyRelation(worldLine.branch,responseLine.branch);html+=`<p><strong>오행 관계:</strong> ${relation}</p>`;html+=`<p><strong>합충 관계:</strong> ${harmonyRelation}</p>`;let overall='';if(harmonyRelation.includes('합')){overall='🤝 세응이 서로 조화롭고 협력적인 관계입니다';}else if(harmonyRelation.includes('충')){overall='⚡ 세응이 서로 충돌하고 대립적인 관계입니다';}else if(relation.includes('생')){overall='🌱 세응이 서로 도움을 주는 관계입니다';}else if(relation.includes('극')){overall='⚔️ 세응이 서로 견제하는 관계입니다';}else{overall='⚖️ 세응이 평행한 관계입니다';}
html+=`<p class="overall-relation"><strong>종합:</strong> ${overall}</p>`;html+='</div>';}else{html+='<p>세효나 응효를 찾을 수 없습니다.</p>';}
html+='</div>';return html;}
analyzeElementRelation(branch1,branch2){const elements={子:'水',亥:'水',寅:'木',卯:'木',巳:'火',午:'火',申:'金',酉:'金',辰:'土',戌:'土',丑:'土',未:'土',};const elem1=elements[branch1];const elem2=elements[branch2];if(elem1===elem2)return`동일 오행 (${elem1})`;const generates={水:'木',木:'火',火:'土',土:'金',金:'水',};const destroys={水:'火',火:'金',金:'木',木:'土',土:'水',};if(generates[elem1]===elem2)return`${elem1}이 ${elem2}를 생`;if(generates[elem2]===elem1)return`${elem2}이 ${elem1}를 생`;if(destroys[elem1]===elem2)return`${elem1}이 ${elem2}를 극`;if(destroys[elem2]===elem1)return`${elem2}이 ${elem1}를 극`;return'비화 관계';}
analyzeHarmonyRelation(branch1,branch2){const harmony={子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午',};const clash={子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳',};if(harmony[branch1]===branch2)return`${branch1}과 ${branch2}가 육합`;if(clash[branch1]===branch2)return`${branch1}과 ${branch2}가 육충`;return'일반 관계';}
predictTiming(){const movingLines=this.najiaResult.hexagram.filter((line)=>line.note.includes('動'));let html='<div class="timing-prediction">';html+='<h6>응기(應期) 예측</h6>';if(movingLines.length===0){html+='<p>동효가 없어서 응기 예측이 어렵습니다.</p>';}else{const timingDistance=this.getTimingDistance(movingLines);html+=`<p><strong>예상 시기:</strong> ${timingDistance}</p>`;html+='<div class="detailed-timing">';html+='<h6>상세 응기</h6>';movingLines.forEach((line)=>{const monthTiming=this.getBranchTiming(line.branch);html+=`<p>${line.yao_pos}효 ${line.branch}: ${monthTiming}</p>`;});html+='</div>';}
html+='</div>';return html;}
generateJudgmentChecklist(){let html='<div class="judgment-checklist">';html+='<h6>판단 체크리스트</h6>';html+='<ul>';html+=`<li>괘명: ${this.najiaResult.main_info}</li>`;html+=`<li>동효 개수: ${
      this.najiaResult.hexagram.filter((l) => l.note.includes('動')).length
    }개</li>`;const worldLine=this.najiaResult.hexagram.find((line)=>line.note.includes('世'));if(worldLine){html+=`<li>세효 상태: ${worldLine.yao_pos}효 ${worldLine.wang_shuai}</li>`;}
const responseLine=this.najiaResult.hexagram.find((line)=>line.note.includes('應'));if(responseLine){html+=`<li>응효 상태: ${responseLine.yao_pos}효 ${responseLine.wang_shuai}</li>`;}
html+='</ul>';html+='</div>';return html;}
makeFinalJudgment(){const score=this.calculateJudgmentScore();const level=this.getJudgmentLevel(score);const probability=this.getJudgmentProbability(level);return`
            <div class="final-judgment">
                <h6>최종 판단</h6>
                <p><strong>종합 점수:</strong> ${score}점</p>
                <p><strong>판단:</strong> <span class="judgment-level ${level.toLowerCase()}">${level}</span></p>
                <p><strong>성공 확률:</strong> ${probability}</p>
            </div>
        `;}
generateFinalAdvice(){const level=this.getJudgmentLevel(this.calculateJudgmentScore());let html='<div class="final-advice">';html+='<h6>상담 및 조언</h6>';html+='<div class="advice-sections">';html+='<div class="situation-diagnosis">';html+='<h6>상황 진단</h6>';html+=this.getSituationDiagnosis();html+='</div>';html+='<div class="positive-advice">';html+='<h6>긍정적 조언</h6>';html+=this.getPositiveAdvice(level);html+='</div>';html+='<div class="negative-advice">';html+='<h6>주의사항</h6>';html+=this.getNegativeAdvice(level);html+='</div>';html+='<div class="timing-advice">';html+='<h6>타이밍 조언</h6>';html+=this.getTimingAdvice();html+='</div>';html+='<div class="najia-specific-advice">';html+='<h6>납갑 맞춤 조언</h6>';html+=this.getNajiaSpecificAdvice();html+='</div>';html+='</div>';html+='</div>';return html;}
getSpecialMeaning(specialType,description){if(description){return description;}
const meanings={육충괘:'분산, 파열, 변화를 상징. 급격한 변화나 충돌 상황',육합괘:'결합, 안정, 성사를 상징. 느리지만 확실한 진전',귀혼괘:'끝맺음, 마무리, 귀결을 상징. 안정적 귀착이나 종결',유혼괘:'불안정, 떠돌아다님, 미정을 상징. 마음의 방황이나 불확실',};return meanings[specialType]||'';}
generateTableRows(){let html='';this.najiaResult.hexagram.forEach((yao,index)=>{const isMoving=yao.note.includes('動');const statusHtml=isMoving?`<strong>${yao.status} ${yao.note}</strong>`:`${yao.status} ${yao.note}`;const originalYaoValue=this.hexagram[index];const isKongWang=this.najiaResult.kong_wang&&this.najiaResult.kong_wang.공망지지.includes(yao.branch);const kongWangMarker=isKongWang?'<span class="kong-wang-marker">●</span>':'';let changingInfo=yao.changing_info;if(isMoving&&this.najiaResult.changing_yao_detailed){const changingDetail=this.najiaResult.changing_yao_detailed.find((cyd)=>cyd.효위===yao.yao_pos);if(changingDetail){changingInfo=`
                        <div class="changing-yao-detail">
                            <div class="original-info">
                                <strong>원:</strong> ${changingDetail.원지지} ${changingDetail.원육친}
                            </div>
                            <div class="arrow">→</div>
                            <div class="changed-info">
                                <strong>변:</strong> ${changingDetail.변지지} ${changingDetail.변육친}
                            </div>
                            <div class="wang-shuai-info">
                                <small>(${changingDetail.변왕약})</small>
                            </div>
                        </div>
                    `;}}
html+=`
                <tr ${isMoving ? 'data-moving="true"' : ''} ${
        isKongWang ? 'data-kong-wang="true"' : ''
      }>
                    <td>${this.simplifySpirit(yao.spirit)}</td>
                    <td>${statusHtml}</td>
                    <td><strong>${yao.six_kin}</strong></td>
                    <td style="color: var(--primary-color); font-weight: 600;">
                        ${yao.branch}
                        ${kongWangMarker}
                    </td>
                    <td>
                        <div class="yao-position-cell">
                            <div class="line-visual ${this.getLineVisualClass(
                              originalYaoValue
                            )}"></div>
                            <span class="yao-pos-text">${yao.yao_pos}효${
        yao.note ? ' ' + yao.note : ''
      }</span>
                            ${kongWangMarker}
                        </div>
                    </td>
                    <td>${yao.wang_shuai}</td>
                    <td>${yao.day_relation}</td>
                    <td>${changingInfo}</td>
                </tr>
            `;});return html;}
getLineInfo(yaoNumber){const lineTypes={6:'老陰 (변음)',7:'少陽 (정양)',8:'少陰 (정음)',9:'老陽 (변양)',};return lineTypes[yaoNumber]||'알 수 없음';}
getLineVisualClass(yaoNumber){const classes={6:'yin-moving-visual',7:'yang-visual',8:'yin-visual',9:'yang-moving-visual',};return classes[yaoNumber]||'yang-visual';}
getPositionMeaning(position){const meanings={1:'초효 - 시작, 기초, 준비 단계',2:'이효 - 발전, 진행, 실행 단계',3:'삼효 - 전환, 위기, 선택의 기로',4:'사효 - 접근, 기회, 결과 도출',5:'오효 - 성취, 권력, 최고조',6:'상효 - 완성, 종료, 새로운 시작',};return meanings[position]||'일반적 의미';}
getStrengthDescription(strength){const descriptions={旺:'최강 - 매우 유리한 상태',相:'강함 - 유리한 상태',休:'보통 - 중립적 상태',囚:'약함 - 불리한 상태',死:'최약 - 매우 불리한 상태',};return descriptions[strength]||'알 수 없음';}
getChangingHexagramCode(){return this.hexagram.map((yao)=>{if(yao===6)return'1';if(yao===9)return'0';return[7,9].includes(yao)?'1':'0';}).reverse().join('');}
getHexagramName(code){const simpleNames={111111:'乾','000000':'坤','010001':'屯',100010:'蒙',111010:'訟','010111':'需','010000':'師','000010':'比',};return simpleNames[code]||'미정의괘';}
getChangeDirection(){const movingCount=this.najiaResult.hexagram.filter((line)=>line.note.includes('動')).length;if(movingCount<=2)return'점진적 변화 - 안정적 전환';if(movingCount<=4)return'중간 변화 - 주의깊은 대응 필요';return'급격한 변화 - 큰 전환점';}
getChangeDescription(){const movingLines=this.najiaResult.hexagram.filter((line)=>line.note.includes('動'));return movingLines.map((line)=>`${line.yao_pos}효: ${line.status} → ${
            line.changing_info.split('→')[1] || '변화'
          }`).join(', ');}
getPrimarySpirit(questionType){const spiritMap={재물:'妻財',직업:'官鬼',건강:'世爻',학업:'父母',연애:'妻財',가족:'父母',자녀:'子孫',친구:'兄弟',소송:'官鬼',일반:'世爻',};return spiritMap[questionType]||'世爻';}
getHelpingSpirit(primarySpirit){const helpMap={妻財:'子孫',官鬼:'父母',父母:'官鬼',子孫:'兄弟',兄弟:'妻財',世爻:'원신',};return helpMap[primarySpirit]||'원신';}
getHinderingSpirit(primarySpirit){const hinderMap={妻財:'兄弟',官鬼:'子孫',父母:'妻財',子孫:'官鬼',兄弟:'父母',世爻:'기신',};return hinderMap[primarySpirit]||'기신';}
checkSpiritPresence(){const allKins=this.najiaResult.hexagram.map((line)=>line.six_kin);const uniqueKins=[...new Set(allKins)];return uniqueKins.map((kin)=>`${kin}: ${allKins.filter((k) => k === kin).length}개`);}
calculateVoid(){const dayBranch=this.najiaResult.base_info['일진'].charAt(1);const branchIndex=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥',].indexOf(dayBranch);const voidIndex1=(branchIndex+10)%12;const voidIndex2=(branchIndex+11)%12;const branches=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥',];return[branches[voidIndex1],branches[voidIndex2]];}
getWorldResponseRelation(worldLine,responseLine){const worldBinary=[7,9].includes(worldLine.status)?1:0;const responseBinary=[7,9].includes(responseLine.status)?1:0;if(worldBinary===responseBinary){return'세응비화 - 조화로운 관계';}else{return'세응상충 - 대립적 관계';}}
getTimingDistance(movingLines){const positions=movingLines.map((line)=>line.yao_pos);const nearCount=positions.filter((pos)=>pos<=3).length;const farCount=positions.filter((pos)=>pos>3).length;if(nearCount>farCount)return'1-3개월 (가까운 시기)';if(farCount>nearCount)return'6-12개월 (먼 시기)';return'3-6개월 (중간 시기)';}
getBranchTiming(branch){const timing={子:'11월(자월)',丑:'12월(축월)',寅:'1월(인월)',卯:'2월(묘월)',辰:'3월(진월)',巳:'4월(사월)',午:'5월(오월)',未:'6월(미월)',申:'7월(신월)',酉:'8월(유월)',戌:'9월(술월)',亥:'10월(해월)',};return timing[branch]||'미정';}
calculateJudgmentScore(){let score=0;const movingCount=this.najiaResult.hexagram.filter((line)=>line.note.includes('動')).length;if(movingCount===0)score+=5;else if(movingCount===1)score+=15;else if(movingCount<=3)score+=10;else score-=5;const yangCount=this.hexagram.filter((y)=>[7,9].includes(y)).length;if(yangCount>=2&&yangCount<=4)score+=10;const worldLine=this.najiaResult.hexagram.find((line)=>line.note.includes('世'));if(worldLine){if(['旺','相'].includes(worldLine.wang_shuai))score+=10;else if(worldLine.wang_shuai==='死')score-=10;}
const strongSpirits=this.najiaResult.hexagram.filter((line)=>['旺','相'].includes(line.wang_shuai)).length;if(strongSpirits>=3)score+=15;else if(strongSpirits<=1)score-=10;return score;}
getJudgmentLevel(score){if(score>=25)return'대길';if(score>=15)return'길';if(score>=5)return'평';if(score>=-5)return'흉';return'대흉';}
getJudgmentProbability(level){const probabilities={대길:'85-95%',길:'70-85%',평:'50-70%',흉:'25-50%',대흉:'5-25%',};return probabilities[level]||'50%';}
getSituationDiagnosis(){const movingCount=this.najiaResult.hexagram.filter((line)=>line.note.includes('動')).length;if(movingCount===0)
return'<p>현재 상황이 안정적이며 큰 변화가 없는 시기입니다.</p>';if(movingCount===1)
return'<p>명확한 변화의 방향이 보이는 시기입니다.</p>';if(movingCount<=3)
return'<p>복잡한 상황이지만 관리 가능한 범위입니다.</p>';return'<p>급변하는 시기로 신중한 대응이 필요합니다.</p>';}
getPositiveAdvice(level){const advice={대길:'<p>적극적으로 행동하세요. 좋은 결과를 얻을 가능성이 높습니다.</p>',길:'<p>계획을 실행에 옮기기 좋은 시기입니다.</p>',평:'<p>신중하게 접근하면 무난한 결과를 얻을 수 있습니다.</p>',흉:'<p>현상 유지에 집중하고 새로운 시도는 미루세요.</p>',대흉:'<p>방어적 자세를 취하고 손실을 최소화하세요.</p>',};return advice[level]||'<p>균형잡힌 접근이 필요합니다.</p>';}
getNegativeAdvice(level){const warnings={대길:'<p>과도한 자신감은 금물입니다.</p>',길:'<p>안주하지 말고 지속적인 노력이 필요합니다.</p>',평:'<p>성급한 판단을 피하세요.</p>',흉:'<p>위험한 투자나 결정을 피하세요.</p>',대흉:'<p>모든 행동을 신중히 재검토하세요.</p>',};return warnings[level]||'<p>주의깊은 관찰이 필요합니다.</p>';}
getTimingAdvice(){const movingLines=this.najiaResult.hexagram.filter((line)=>line.note.includes('動'));if(movingLines.length===0)
return'<p>급하지 않으니 충분히 준비하세요.</p>';const nearPositions=movingLines.filter((line)=>line.yao_pos<=3).length;if(nearPositions>movingLines.length/2){return'<p>가까운 시일 내에 행동하세요.</p>';}
return'<p>좀 더 기다린 후 행동하는 것이 좋겠습니다.</p>';}
getNajiaSpecificAdvice(){let html='<div class="najia-advice">';const worldLine=this.najiaResult.hexagram.find((line)=>line.note.includes('世'));if(worldLine){if(['旺','相'].includes(worldLine.wang_shuai)){html+='<p><strong>세효 강함:</strong> 자신의 의지대로 상황을 이끌 수 있습니다.</p>';}else{html+='<p><strong>세효 약함:</strong> 외부 도움을 구하거나 시기를 기다리세요.</p>';}}
const strongLines=this.najiaResult.hexagram.filter((line)=>['旺','相'].includes(line.wang_shuai));const weakLines=this.najiaResult.hexagram.filter((line)=>['囚','死'].includes(line.wang_shuai));if(strongLines.length>weakLines.length){html+='<p><strong>전체적 강세:</strong> 적극적인 접근이 유리합니다.</p>';}else{html+='<p><strong>전체적 약세:</strong> 보수적 접근이 안전합니다.</p>';}
const kinCounts={};this.najiaResult.hexagram.forEach((line)=>{kinCounts[line.six_kin]=(kinCounts[line.six_kin]||0)+1;});const dominantKin=Object.keys(kinCounts).reduce((a,b)=>kinCounts[a]>kinCounts[b]?a:b);html+=`<p><strong>주요 육친 ${dominantKin}:</strong> 이 영역에 집중하여 대응하세요.</p>`;html+='</div>';return html;}
checkMemberLogin(){if(typeof getMemberSession==='function'){const memberSession=getMemberSession();if(memberSession&&memberSession.isLoggedIn&&memberSession.smem_id){return true;}}
return false;}
saveY6Data(){const y6Data={hexagram:this.hexagram,movingLines:this.movingLines,currentPosition:this.currentPosition,consultationInfo:this.consultationInfo,najiaResult:this.najiaResult,timestamp:Date.now(),};sessionStorage.setItem('y6Data',JSON.stringify(y6Data));console.log('💾 육효 분석 데이터 저장 완료:',y6Data);}
restoreY6Data(){const savedData=sessionStorage.getItem('y6Data');if(!savedData)return;try{const y6Data=JSON.parse(savedData);const elapsed=Date.now()-y6Data.timestamp;if(elapsed>30*60*1000){console.log('⏰ 저장된 육효 데이터가 만료됨 (30분 초과)');sessionStorage.removeItem('y6Data');return;}
console.log('🔄 육효 분석 데이터 복원 시작:',y6Data);this.hexagram=y6Data.hexagram||[];this.movingLines=y6Data.movingLines||[];this.currentPosition=y6Data.currentPosition||0;this.consultationInfo=y6Data.consultationInfo||{};this.najiaResult=y6Data.najiaResult||null;setTimeout(()=>{if(this.hexagram.length>0){this.restoreHexagramUI();}
if(this.najiaResult){this.displayNajiaResult();document.getElementById('analysisSection').style.display='block';const resultWrap=document.getElementById('resultWrap');if(resultWrap){resultWrap.classList.remove('hidden');}}
if(this.consultationInfo.questionType){document.getElementById('questionType').value=this.consultationInfo.questionType;}
if(this.consultationInfo.question){document.getElementById('questionText').value=this.consultationInfo.question;}
if(this.consultationInfo.name){document.getElementById('consultantName').value=this.consultationInfo.name;}
console.log('✅ 육효 분석 데이터 복원 완료');alert('✅ 이전 육효 분석 결과가 복원되었습니다.');},500);sessionStorage.removeItem('y6Data');}catch(error){console.error('❌ 육효 데이터 복원 오류:',error);sessionStorage.removeItem('y6Data');}}
restoreHexagramUI(){this.hexagram.forEach((value,index)=>{const lineNumber=index+1;const lineSlot=document.querySelector(`[data-line="${lineNumber}"]`);if(!lineSlot)return;lineSlot.innerHTML='';const coin=document.createElement('div');coin.className='coin';if(value===9){coin.classList.add('yang-moving-coin');lineSlot.className='line-slot filled yang-moving-line';}else if(value===6){coin.classList.add('yin-moving-coin');lineSlot.className='line-slot filled yin-moving-line';}else if(value===7){coin.classList.add('yang-coin');lineSlot.className='line-slot filled yang-line';}else if(value===8){coin.classList.add('yin-coin');lineSlot.className='line-slot filled yin-line';}
const coinFace=document.createElement('div');coinFace.className='coin-face';coin.appendChild(coinFace);lineSlot.appendChild(coin);});this.currentPosition=6;this.updateCurrentLineDisplay();if(this.hexagram.length===6){document.getElementById('analyzeBtn').disabled=false;document.getElementById('currentLineText').textContent='괘 완성!';}}
hasAnalysisResult(){return this.najiaResult!==null&&this.hexagram.length===6;}
validateBeforeAction(actionName){if(!this.hasAnalysisResult()){alert('⚠️ 육효 분석을 먼저 진행해주세요.\n\n동전 6번을 선택하고 "육효분석" 버튼을 클릭하세요.');return false;}
if(!this.checkMemberLogin()){const confirmLogin=confirm(`⚠️ ${actionName} 기능은 로그인이 필요합니다.\n\n로그인 페이지로 이동하시겠습니까?`);if(confirmLogin){this.saveY6Data();sessionStorage.setItem('returnUrl',window.location.href);window.location.href='/secret/member_login.html';}
return false;}
return true;}
async handleDbSave(){console.log('=====================================');console.log('💾 DB저장 버튼 클릭됨');console.log('=====================================');if(!this.validateBeforeAction('DB저장')){return;}
console.log('2️⃣ 회원 로그인 체크 시작...');const memberId=this.checkMemberLogin();if(!memberId){console.log('❌ 로그인되지 않음');this.redirectToLogin('회원 로그인이 필요합니다.\n로그인 페이지로 이동합니다.\n\n로그인 페이지로 이동하시겠습니까?');return;}
console.log('✅ 로그인 확인 완료 - memberId:',memberId);this.saveY6FormData();console.log('💾 현재 화면 데이터 저장 완료 (DB저장 전)');try{const consultantName=document.getElementById('consultantName')?.value.trim()||'';const questionType=document.getElementById('questionType')?.value||'';const questionText=document.getElementById('questionText')?.value.trim()||'';console.log('3️⃣ 필수 항목 유효성 검사 시작...');console.log('  - questionType:',questionType);console.log('  - questionText:',questionText);console.log('  - consultantName:',consultantName);const missingFields=[];if(!questionType){missingFields.push('질문 분야');}
if(!questionText){missingFields.push('구체적 질문');}
if(!consultantName){missingFields.push('성명');}
if(missingFields.length>0){const message=`❌ 다음 항목을 입력해주세요:\n\n${missingFields
          .map((field) => `• ${field}`)
          .join('\n')}`;console.log(message);alert(message);return;}
console.log('✅ 필수 항목 검증 완료');console.log('✅ 필수 항목 검증 완료');const birthDate=document.getElementById('birthDate')?.value||'';const contentText=this.generateY6ShareTextPlain();const yearPillar=document.getElementById('yearPillar')?.textContent||'';const monthPillar=document.getElementById('monthPillar')?.textContent||'';const dayPillar=document.getElementById('dayPillar')?.textContent||'';const hourPillar=document.getElementById('hourPillar')?.textContent||'';const sajuDateTime=`${yearPillar} ${monthPillar} ${dayPillar} ${hourPillar}`.trim()||null;console.log('📅 사주 시각 생성:',{yearPillar,monthPillar,dayPillar,hourPillar,sajuDateTime,});console.log('📊 hexagram 배열:',this.hexagram);const upperHand=this.hexagram.map((value)=>{if(value===7||value===9)return'陽';if(value===6||value===8)return'陰';return'';}).join('');const lowerHand=this.hexagram.map((value)=>{if(value===9)return'陰';if(value===6)return'陽';if(value===7)return'陽';if(value===8)return'陰';return'';}).join('');console.log('🎯 본괘/변괘 생성:',{upperHand,lowerHand,upperHandType:typeof upperHand,lowerHandType:typeof lowerHand,upperHandLength:upperHand.length,lowerHandLength:lowerHand.length,});const titleText=questionText||'일반육효보기';const ticketData={title:titleText,content:contentText,post_password:'y6_2024',snsgu:'C0001',title_masked:titleText,content_enc:contentText,author_name:consultantName,author_contact:questionType,author_gender:null,calendar_type:'양력',yundal:false,birth_date:birthDate||null,birth_datetime:birthDate?`${birthDate}T00:00:00`:null,birth_hour:null,birth_minute:null,hour_ji:null,timeInputType:'none',gwdate_time:sajuDateTime||null,upper_hand:upperHand,lower_hand:lowerHand,choice1:this.hexagram[0]||null,choice2:this.hexagram[1]||null,choice3:this.hexagram[2]||null,choice4:this.hexagram[3]||null,choice5:this.hexagram[4]||null,choice6:this.hexagram[5]||null,smember_id:memberId,agreement:1,status:'OPEN',};console.log('🔍 육효 필드 확인 (서버 전송 전):',{gwdate_time:ticketData.gwdate_time,upper_hand:ticketData.upper_hand,lower_hand:ticketData.lower_hand,gwdate_time_type:typeof ticketData.gwdate_time,upper_hand_type:typeof ticketData.upper_hand,lower_hand_type:typeof ticketData.lower_hand,upper_hand_length:ticketData.upper_hand?ticketData.upper_hand.length:0,lower_hand_length:ticketData.lower_hand?ticketData.lower_hand.length:0,});let url='/y6/api/v1/y6_tickets';let method='POST';let shouldResetTicketId=false;console.log('🔍 window.currentTicketId 확인:',window.currentTicketId);if(window.currentTicketId){console.log('✅ currentTicketId 존재 - 수정/추가 확인창 표시');const userChoice=confirm('기존 데이터가 있습니다.\n\n'+'[확인] = 수정하기 (기존 데이터 업데이트)\n'+'[취소] = 추가하기 (새로운 데이터 생성)\n\n'+'어떻게 하시겠습니까?');if(userChoice){url=`/y6/api/v1/y6_tickets/${window.currentTicketId}`;method='PUT';shouldResetTicketId=true;console.log('🔄 사용자 선택: 기존 티켓 수정');}else{method='POST';console.log('➕ 사용자 선택: 새 티켓 생성');}}else{console.log('➕ ticket_id 없음 - 새 티켓 생성 (확인창 없음)');}
console.log('🌐 API 호출:',{method,url});console.log('📤 서버로 전송할 데이터:',ticketData);const response=await fetch(url,{method:method,headers:{'Content-Type':'application/json'},body:JSON.stringify(ticketData),});if(!response.ok){let errorMessage=`HTTP ${response.status}`;try{const errorData=await response.json();console.error('❌ 서버 에러 응답:',errorData);errorMessage=errorData.message||errorData.error||errorMessage;}catch(e){const errorText=await response.text();console.error('❌ 서버 에러 텍스트:',errorText);}
throw new Error(errorMessage);}
const result=await response.json();console.log('✅ 서버 응답 성공:',result);if(result.ticket_id){const savedTicketId=result.ticket_id;console.log('✅ 저장 완료. ticket_id:',savedTicketId);if(method==='POST'){window.currentTicketId=savedTicketId;console.log('✅ 새 ticket_id 설정:',window.currentTicketId);alert('✅ 새 데이터로 저장되었습니다!');}else if(method==='PUT'){alert('✅ 기존 데이터가 수정되었습니다!');console.log('🔄 수정 완료 - ticket_id 초기화:',window.currentTicketId,'→ null');window.currentTicketId=null;const url=new URL(window.location.href);url.searchParams.delete('ticket_id');window.history.replaceState({},'',url.toString());console.log('✅ URL에서 ticket_id 파라미터 제거 완료');}}}catch(error){console.error('💥 저장 실패:',error);alert(`❌ 저장에 실패했습니다.\n\n${error.message}`);}}
handleSend(){console.log('=====================================');console.log('📤 보내기 버튼 클릭됨');console.log('=====================================');if(!this.validateBeforeAction('보내기')){return;}
console.log('2️⃣ 회원 로그인 체크 시작...');const memberId=this.checkMemberLogin();if(!memberId){console.log('❌ 로그인되지 않음');this.redirectToLogin('회원 로그인이 필요합니다.\n로그인 페이지로 이동합니다.\n\n로그인 페이지로 이동하시겠습니까?');return;}
console.log('✅ 로그인 확인 완료 - memberId:',memberId);this.saveY6FormData();console.log('💾 현재 화면 데이터 저장 완료 (보내기 전)');const shareText=this.generateY6ShareText();if(!shareText){alert('공유할 데이터를 생성하는데 실패했습니다.');return;}
this.showShareOptions(shareText);}
handleDbView(){console.log('=====================================');console.log('🔍 DB보기 버튼 클릭됨');console.log('=====================================');console.log('1️⃣ 회원 로그인 체크 시작...');const memberId=this.checkMemberLogin();if(!memberId){console.log('❌ 로그인되지 않음');this.redirectToLogin('회원 로그인이 필요합니다.\n로그인 페이지로 이동합니다.\n\n로그인 페이지로 이동하시겠습니까?');return;}
console.log('✅ 로그인 확인 완료 - memberId:',memberId);this.saveY6FormData();console.log('💾 현재 화면 데이터 저장 완료 (DB보기 이동 전)');console.log('🔒 필터 조건:',{snsgu:'B0002',smember_id:memberId,});window.location.href=`/y6/y6_tickboard?snsgu=C0001&smember_id=${memberId}`;}
checkMemberLogin(){if(window.MEMBER_SESSION&&window.MEMBER_SESSION.smem_id){return window.MEMBER_SESSION.smem_id;}
return null;}
async loadTicketData(ticketId){try{console.log('📥 티켓 데이터 로딩 시작:',ticketId);const response=await fetch(`/y6/api/v1/y6_tickets/${ticketId}`);if(!response.ok){throw new Error(`HTTP ${response.status}`);}
const data=await response.json();console.log('✅ 티켓 데이터 로드 성공:',data);const ticket=data.ticket||data;console.log('📋 ticket 객체:',ticket);console.log('🔍 choice 값 확인:');for(let i=1;i<=6;i++){console.log(`  choice${i}:`,ticket[`choice${i}`],`(type: ${typeof ticket[`choice${i}`]})`);}
if(ticket.author_name){const consultantNameEl=document.getElementById('consultantName');if(consultantNameEl){consultantNameEl.value=ticket.author_name;console.log('✅ consultantName 설정:',ticket.author_name);}}
if(ticket.author_contact){const questionTypeEl=document.getElementById('questionType');if(questionTypeEl){questionTypeEl.value=ticket.author_contact;console.log('✅ questionType 설정:',ticket.author_contact);}}
if(ticket.title_masked||ticket.title){const questionTextEl=document.getElementById('questionText');if(questionTextEl){questionTextEl.value=ticket.title_masked||ticket.title;console.log('✅ questionText 설정:',ticket.title_masked||ticket.title);}}
if(ticket.gwdate_time){console.log('📅 gwdate_time 복원:',ticket.gwdate_time);this.restoreSajuPillars(ticket.gwdate_time);}
this.hexagram=[];this.movingLines=[];console.log('🔍 upper_hand:',ticket.upper_hand);console.log('🔍 lower_hand:',ticket.lower_hand);let hasChoiceData=false;for(let i=0;i<6;i++){const choiceValue=ticket[`choice${i + 1}`];console.log(`🎲 choice${i + 1} 처리:`,choiceValue,`(null/undefined: ${
            choiceValue === null || choiceValue === undefined
          })`);if(choiceValue!==null&&choiceValue!==undefined&&choiceValue!==0){const intValue=parseInt(choiceValue);this.hexagram[i]=intValue;hasChoiceData=true;if(intValue===6||intValue===9){this.movingLines.push(i);console.log(`  ✅ 동효 발견: ${i + 1}효 (값: ${intValue})`);}
console.log(`  ✅ hexagram[${i}] = ${intValue}`);}}
if(!hasChoiceData&&ticket.upper_hand&&ticket.lower_hand){console.log('💡 choice 데이터 없음 - upper_hand/lower_hand에서 복원 시작');this.restoreHexagramFromHands(ticket.upper_hand,ticket.lower_hand);}
console.log('📋 복원된 hexagram 배열:',this.hexagram);console.log('🔄 복원된 movingLines 배열:',this.movingLines);if(this.hexagram.length>0){this.currentPosition=this.hexagram.length;console.log('🎨 renderHexagram 호출 (currentPosition:',this.currentPosition,')');this.renderHexagram();this.updateAnalyzeButton();console.log('📊 렌더링 완료 후 DOM 상태 확인');for(let i=0;i<this.hexagram.length;i++){const lineSlot=document.querySelector(`.line-slot[data-line="${i + 1}"]`);console.log(`  line-slot[${i + 1}] className:`,lineSlot?lineSlot.className:'NOT FOUND');}
if(this.hexagram.length===6){console.log('✅ 6효 완성 - 500ms 후 자동 분석 시작');setTimeout(()=>{this.analyzeHexagram();},500);}}else{console.warn('⚠️ hexagram 데이터가 비어있습니다!');}
console.log('✅ 티켓 데이터 복원 완료');}catch(error){console.error('❌ 티켓 데이터 로드 실패:',error);console.error('Error stack:',error.stack);alert(`티켓 데이터를 불러오는데 실패했습니다.\n\n${error.message}`);}}
restoreHexagramFromHands(upperHand,lowerHand){try{console.log('🔄 upper_hand/lower_hand에서 hexagram 복원 시작');console.log('  upper_hand:',upperHand);console.log('  lower_hand:',lowerHand);if(upperHand.length!==6||lowerHand.length!==6){console.error('❌ upper_hand 또는 lower_hand 길이가 6이 아닙니다');return;}
this.hexagram=[];this.movingLines=[];for(let i=0;i<6;i++){const upperYao=upperHand.charAt(i);const lowerYao=lowerHand.charAt(i);console.log(`  효 ${i + 1}: upper="${upperYao}", lower="${lowerYao}"`);let value;if(upperYao===lowerYao){if(upperYao==='陽'){value=7;console.log(`    → 소양 (7): 정효 陽`);}else if(upperYao==='陰'){value=8;console.log(`    → 소음 (8): 정효 陰`);}}else{if(upperYao==='陽'&&lowerYao==='陰'){value=9;this.movingLines.push(i);console.log(`    → 노양 (9): 동효 陽→陰`);}else if(upperYao==='陰'&&lowerYao==='陽'){value=6;this.movingLines.push(i);console.log(`    → 노음 (6): 동효 陰→陽`);}}
this.hexagram[i]=value;}
console.log('✅ hexagram 복원 완료:',this.hexagram);console.log('✅ movingLines 복원 완료:',this.movingLines);}catch(error){console.error('❌ hexagram 복원 오류:',error);console.error('Error stack:',error.stack);}}
restoreSajuPillars(gwdateTime){try{console.log('📅 사주 기둥 복원 시작:',gwdateTime);const pillars=gwdateTime.trim().split(/\s+/);if(pillars.length===4){const[year,month,day,hour]=pillars;console.log('📅 파싱된 사주:',{year,month,day,hour});const updatePillars=()=>{const yearPillar=document.getElementById('yearPillar');const monthPillar=document.getElementById('monthPillar');const dayPillar=document.getElementById('dayPillar');const hourPillar=document.getElementById('hourPillar');console.log('🔍 pillar 요소 찾기:',{yearPillar:yearPillar?'✅':'❌',monthPillar:monthPillar?'✅':'❌',dayPillar:dayPillar?'✅':'❌',hourPillar:hourPillar?'✅':'❌',});if(yearPillar){yearPillar.textContent=year;console.log(`  ✅ yearPillar.textContent = "${year}" (실제값: "${yearPillar.textContent}")`);}else{console.error('  ❌ yearPillar 요소를 찾을 수 없음');}
if(monthPillar){monthPillar.textContent=month;console.log(`  ✅ monthPillar.textContent = "${month}" (실제값: "${monthPillar.textContent}")`);}else{console.error('  ❌ monthPillar 요소를 찾을 수 없음');}
if(dayPillar){dayPillar.textContent=day;console.log(`  ✅ dayPillar.textContent = "${day}" (실제값: "${dayPillar.textContent}")`);}else{console.error('  ❌ dayPillar 요소를 찾을 수 없음');}
if(hourPillar){hourPillar.textContent=hour;console.log(`  ✅ hourPillar.textContent = "${hour}" (실제값: "${hourPillar.textContent}")`);}else{console.error('  ❌ hourPillar 요소를 찾을 수 없음');}
return yearPillar&&monthPillar&&dayPillar&&hourPillar;};if(!updatePillars()){console.warn('⚠️ pillar 요소를 찾지 못함 - 100ms 후 재시도');setTimeout(()=>{if(!updatePillars()){console.error('❌ 재시도에도 pillar 요소를 찾지 못함');}},100);}
console.log('✅ 사주 기둥 pillar-value 업데이트 완료');this.updateLineRElements(year,month,day,hour);this.currentSaju={month_branch:month.charAt(1),day_stem:day.charAt(0),day_branch:day.charAt(1),saju:{year,month,day,hour},formatted_time:gwdateTime,};console.log('✅ currentSaju 업데이트 완료:',this.currentSaju);}else{console.warn('⚠️ gwdate_time 형식이 올바르지 않음:',gwdateTime);console.warn('  기대 형식: "乙巳 己丑 庚寅 甲申" (4개의 공백으로 구분된 한자)');console.warn(`  실제 파싱 결과: ${pillars.length}개 - [${pillars.join(', ')}]`);}}catch(error){console.error('❌ 사주 기둥 복원 오류:',error);console.error('Error stack:',error.stack);}}
updateLineRElements(year,month,day,hour){try{console.log('🎨 line-r* 요소 업데이트 시작:',{year,month,day,hour});const lineR5=document.querySelector('.line-r5');const lineR4=document.querySelector('.line-r4');const lineR3=document.querySelector('.line-r3');const lineR2=document.querySelector('.line-r2');console.log('🔍 line-r* 요소 찾기:',{lineR5:lineR5?'✅':'❌',lineR4:lineR4?'✅':'❌',lineR3:lineR3?'✅':'❌',lineR2:lineR2?'✅':'❌',});if(lineR5){const html=`<span class="pillar-char">${year.charAt(
          0
        )}</span><span class="pillar-char">${year.charAt(
          1
        )}</span><span class="pillar-label">年</span>`;lineR5.innerHTML=html;console.log(`  ✅ line-r5 innerHTML 설정: "${html}"`);console.log(`     실제 innerHTML: "${lineR5.innerHTML}"`);}else{console.error('  ❌ line-r5 요소를 찾을 수 없음');}
if(lineR4){const html=`<span class="pillar-char">${month.charAt(
          0
        )}</span><span class="pillar-char">${month.charAt(
          1
        )}</span><span class="pillar-label">月</span>`;lineR4.innerHTML=html;console.log(`  ✅ line-r4 innerHTML 설정: "${html}"`);console.log(`     실제 innerHTML: "${lineR4.innerHTML}"`);}else{console.error('  ❌ line-r4 요소를 찾을 수 없음');}
if(lineR3){const html=`<span class="pillar-char">${day.charAt(
          0
        )}</span><span class="pillar-char">${day.charAt(
          1
        )}</span><span class="pillar-label">日</span>`;lineR3.innerHTML=html;console.log(`  ✅ line-r3 innerHTML 설정: "${html}"`);console.log(`     실제 innerHTML: "${lineR3.innerHTML}"`);}else{console.error('  ❌ line-r3 요소를 찾을 수 없음');}
if(lineR2){const html=`<span class="pillar-char">${hour.charAt(
          0
        )}</span><span class="pillar-char">${hour.charAt(
          1
        )}</span><span class="pillar-label">時</span>`;lineR2.innerHTML=html;console.log(`  ✅ line-r2 innerHTML 설정: "${html}"`);console.log(`     실제 innerHTML: "${lineR2.innerHTML}"`);}else{console.error('  ❌ line-r2 요소를 찾을 수 없음');}
console.log('✅ line-r* 요소들 업데이트 완료');}catch(error){console.error('❌ line-r* 요소 업데이트 오류:',error);console.error('Error stack:',error.stack);}}
redirectToLogin(message){if(!confirm(message)){return;}
this.saveY6FormData();sessionStorage.setItem('returnAfterLogin','true');sessionStorage.setItem('returnUrl',window.location.href);window.location.href='/secret/member_login.html';}
saveY6FormData(){const formData={hexagram:this.hexagram,movingLines:this.movingLines,consultationInfo:{questionType:document.getElementById('questionType')?.value,questionText:document.getElementById('questionText')?.value,consultantName:document.getElementById('consultantName')?.value,birthDate:document.getElementById('birthDate')?.value,},najiaResult:this.najiaResult,};sessionStorage.setItem('y6FormData',JSON.stringify(formData));console.log('💾 y6FormData 저장 완료');}
restoreY6Data(){const returnAfterLogin=sessionStorage.getItem('returnAfterLogin');const y6FormDataStr=sessionStorage.getItem('y6FormData');if(returnAfterLogin==='true'&&y6FormDataStr){console.log('🔄 로그인 후 돌아옴 - 데이터 복원 시작');try{const formData=JSON.parse(y6FormDataStr);this.hexagram=formData.hexagram||[];this.movingLines=formData.movingLines||[];if(formData.consultationInfo){if(formData.consultationInfo.questionType){document.getElementById('questionType').value=formData.consultationInfo.questionType;}
if(formData.consultationInfo.questionText){document.getElementById('questionText').value=formData.consultationInfo.questionText;}
if(formData.consultationInfo.consultantName){document.getElementById('consultantName').value=formData.consultationInfo.consultantName;}
if(formData.consultationInfo.birthDate){document.getElementById('birthDate').value=formData.consultationInfo.birthDate;}}
this.najiaResult=formData.najiaResult;console.log('✅ 데이터 복원 완료');sessionStorage.removeItem('returnAfterLogin');if(this.hexagram.length===6){this.updateHexagramDisplay();if(this.najiaResult){this.displayNajiaAnalysis(this.najiaResult);}}}catch(error){console.error('❌ 데이터 복원 실패:',error);sessionStorage.removeItem('y6FormData');}}}
generateY6ShareText(){const hexagramContainer=document.querySelector('.hexagram-container');if(!hexagramContainer){console.error('❌ .hexagram-container를 찾을 수 없습니다.');return null;}
const container=hexagramContainer.cloneNode(true);const baseUrl=window.location.origin;container.querySelectorAll('img').forEach((img)=>{if(img.src&&!img.src.startsWith('http')){img.src=new URL(img.src,baseUrl).href;}});const htmlContent=container.outerHTML;console.log('📦 추출된 HTML 길이:',htmlContent.length);return htmlContent;}
async loadHtml2Canvas(){if(typeof html2canvas!=='undefined'){return true;}
return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';script.onload=()=>resolve(true);script.onerror=()=>reject(new Error('html2canvas 로드 실패'));document.head.appendChild(script);});}
async downloadAsImage(){const hexagramSection=document.querySelector('.hexagram-section');if(!hexagramSection){alert('❌ 괘 분석 영역을 찾을 수 없습니다.');return;}
try{await this.loadHtml2Canvas();console.log('🖼️ 이미지를 Canvas base64로 변환 시작...');const images=hexagramSection.querySelectorAll('img');for(const img of images){try{const src=img.src;console.log('🔄 Canvas 변환 중:',src);const newImg=new Image();newImg.crossOrigin='anonymous';await new Promise((resolve,reject)=>{newImg.onload=resolve;newImg.onerror=reject;newImg.src=src;});const canvas=document.createElement('canvas');canvas.width=newImg.naturalWidth||newImg.width;canvas.height=newImg.naturalHeight||newImg.height;const ctx=canvas.getContext('2d');ctx.drawImage(newImg,0,0);const base64=canvas.toDataURL('image/png');img.setAttribute('data-original-src',src);img.src=base64;console.log('✅ Canvas 변환 완료:',src);}catch(error){console.warn('⚠️ 이미지 Canvas 변환 실패:',img.src,error);}}
console.log('✅ 모든 이미지 Canvas base64 변환 완료');await new Promise((resolve)=>setTimeout(resolve,500));const canvas=await html2canvas(hexagramSection,{backgroundColor:'#ffffff',scale:2,logging:true,useCORS:false,allowTaint:true,foreignObjectRendering:false,imageTimeout:0,removeContainer:false,});images.forEach((img)=>{const originalSrc=img.getAttribute('data-original-src');if(originalSrc){img.src=originalSrc;img.removeAttribute('data-original-src');}});canvas.toBlob((blob)=>{const url=URL.createObjectURL(blob);const link=document.createElement('a');const consultantName=document.getElementById('consultantName')?.value||'이름없음';const now=new Date();const timestamp=now.toISOString().replace(/[:.]/g,'-').slice(0,-5);const memberId=window.MEMBER_SESSION?.smem_id||'guest';const safeName=consultantName.replace(/[<>:"/\\|?*]/g,'_');link.download=`${safeName}_육효_${memberId}_${timestamp}.png`;link.href=url;link.click();URL.revokeObjectURL(url);alert('✅ 이미지가 다운로드되었습니다!');});}catch(error){console.error('이미지 생성 실패:',error);alert('❌ 이미지 생성에 실패했습니다.\n페이지를 새로고침한 후 다시 시도해주세요.');}}
generateY6ShareSectionHtml(){const hexagramSection=document.querySelector('.hexagram-section');if(!hexagramSection){console.error('❌ .hexagram-section을 찾을 수 없습니다.');return null;}
const section=hexagramSection.cloneNode(true);const baseUrl=window.location.origin;section.querySelectorAll('img').forEach((img)=>{if(img.src&&!img.src.startsWith('http')){img.src=new URL(img.src,baseUrl).href;}});const htmlContent=section.outerHTML;console.log('📦 추출된 .hexagram-section HTML 길이:',htmlContent.length);return htmlContent;}
generateY6ShareTextPlain(){let result='━━━━━━━━━━━━━━━━━━━━\n';result+='🔮 육효 점괘 분석 결과\n';result+='━━━━━━━━━━━━━━━━━━━━\n\n';const questionType=document.getElementById('questionType')?.value;const questionText=document.getElementById('questionText')?.value;const consultantName=document.getElementById('consultantName')?.value;if(consultantName)result+=`👤 성명: ${consultantName}\n`;if(questionType)result+=`📌 분야: ${questionType}\n`;if(questionText)result+=`❓ 질문: ${questionText}\n\n`;const baseInfo=document.querySelector('.base-info p');if(baseInfo){result+=baseInfo.textContent.trim()+'\n';}
for(let i=5;i>=0;i--){const linePosition=document.querySelector(`.line-position[data-position="${i}"]`);if(!linePosition)continue;const label=linePosition.querySelector('.line-label')?.textContent.trim();const slot1=linePosition.querySelector(`.extra-slot${i + 1}01`)?.textContent.trim();const slot2=linePosition.querySelector(`.extra-slot${i + 1}02`)?.textContent.trim();const slot3=linePosition.querySelector(`.extra-slot${i + 1}05`)?.textContent.trim();const slot4=linePosition.querySelector(`.extra-slot${i + 1}04`)?.textContent.trim();const slot5=linePosition.querySelector(`.extra-slot${i + 1}05`)?.textContent.trim();const slot6=linePosition.querySelector(`.extra-slot${i + 1}11`)?.textContent.trim();let line=label||'';if(slot1)line+=' '+slot1;if(slot2)line+=' '+slot2;if(slot3)line+=' '+slot3;if(slot4)line+=' '+slot4;if(slot5&&slot5!==slot3)line+=' '+slot5;if(slot6)line+=' '+slot6;result+=line.trim()+'\n';}
const yearPillar=document.querySelector('.line-r5')?.textContent.trim();const monthPillar=document.querySelector('.line-r4')?.textContent.trim();const dayPillar=document.querySelector('.line-r3')?.textContent.trim();const hourPillar=document.querySelector('.line-r2')?.textContent.trim();if(yearPillar||monthPillar||dayPillar||hourPillar){result+=`${yearPillar || ''} ${monthPillar || ''} ${dayPillar || ''} ${
          hourPillar || ''
        }\n`.trim()+'\n';}
const summaryItems=document.querySelectorAll('.hexagram-summary .summary-item');let summaryText='';summaryItems.forEach((item,index)=>{const text=item.textContent.trim();if(text){summaryText+=text+' ';if(index===1){const arrow=document.querySelector('.hexagram-summary-arrow')?.textContent.trim();if(arrow)summaryText+=arrow+' ';}}});if(summaryText){result+=summaryText.trim()+'\n';}
result=result.replace(/다시 시작|분석하기/g,'').trim();result+='\n\n━━━━━━━━━━━━━━━━━━━━\n';result+='※ 육효는 참고자료입니다.\n';result+='   실제 선택과 노력이 더 중요합니다.\n';result+='━━━━━━━━━━━━━━━━━━━━\n';return result;}
showShareOptions(htmlContent){const sectionHtmlContent=this.generateY6ShareSectionHtml();const textContent=this.generateY6ShareTextPlain();const modal=document.createElement('div');modal.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;const modalContent=document.createElement('div');modalContent.style.cssText=`
      background: white;
      padding: 30px;
      border-radius: 15px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    `;const isMobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);modalContent.innerHTML=`
      <h3 style="margin-top:0;color:#333;text-align:center;">📤 공유 방법 선택</h3>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:20px;">
        <button id="downloadImageBtn" style="padding:15px;font-size:15px;border:2px solid #E91E63;background:#E91E63;color:white;border-radius:8px;cursor:pointer;font-weight:600;">
          🖼️ 이미지 다운로드
        </button>
        <button id="copyTextBtn" style="padding:15px;font-size:15px;border:2px solid #9C27B0;background:#9C27B0;color:white;border-radius:8px;cursor:pointer;font-weight:600;">
          📝 괘+동전 (텍스트)
        </button>
        ${
          isMobile
            ? `<button id="shareSMSBtn"style="padding:15px;font-size:15px;border:2px solid #FF9800;background:#FF9800;color:white;border-radius:8px;cursor:pointer;font-weight:600;">💬 문자(SMS)로 공유</button><button id="shareWebBtn"style="padding:15px;font-size:15px;border:2px solid #2196F3;background:#2196F3;color:white;border-radius:8px;cursor:pointer;font-weight:600;">🌐 카톡등 기타 앱으로 공유</button>`
            : ''
        }
        <button id="viewHtmlBtn" style="padding:15px;font-size:15px;border:2px solid #2196F3;background:#2196F3;color:white;border-radius:8px;cursor:pointer;font-weight:600;">
          👁️ 미리보기
        </button>
        <button id="closeModalBtn" style="padding:15px;font-size:15px;border:2px solid #ccc;background:white;color:#666;border-radius:8px;cursor:pointer;margin-top:10px;">
          취소
        </button>
      </div>
    `;modal.appendChild(modalContent);document.body.appendChild(modal);document.getElementById('downloadImageBtn').addEventListener('click',()=>{this.downloadAsImage();document.body.removeChild(modal);});document.getElementById('copyTextBtn').addEventListener('click',()=>{this.copyToClipboard(textContent);document.body.removeChild(modal);});if(isMobile){document.getElementById('shareSMSBtn').addEventListener('click',()=>{this.shareToSMS(textContent);document.body.removeChild(modal);});document.getElementById('shareWebBtn').addEventListener('click',()=>{this.shareViaWeb(textContent);document.body.removeChild(modal);});}
document.getElementById('viewHtmlBtn').addEventListener('click',()=>{const previewWindow=window.open('','_blank','width=800,height=600');const baseUrl=window.location.origin;previewWindow.document.write('<html><head><title>육효 분석 결과</title>');previewWindow.document.write('<meta charset="utf-8">');previewWindow.document.write(`<link rel="stylesheet" href="${baseUrl}/y6/static/y6_style.css">`);previewWindow.document.write(`
        <style>
          body { padding: 20px; background: #f5f5f5; }
          img { max-width: 100%; height: auto; }
        </style>
      `);previewWindow.document.write('</head><body>');previewWindow.document.write(htmlContent);previewWindow.document.write('</body></html>');previewWindow.document.close();document.body.removeChild(modal);});document.getElementById('closeModalBtn').addEventListener('click',()=>{document.body.removeChild(modal);});modal.addEventListener('click',(e)=>{if(e.target===modal){document.body.removeChild(modal);}});}
copyToClipboard(text){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(()=>{alert('✅ 텍스트가 클립보드에 복사되었습니다!\n\n원하는 곳에 붙여넣기(Ctrl+V)하세요.');}).catch((err)=>{console.error('클립보드 복사 실패:',err);this.fallbackCopyToClipboard(text);});}else{this.fallbackCopyToClipboard(text);}}
fallbackCopyToClipboard(text){const textArea=document.createElement('textarea');textArea.value=text;textArea.style.position='fixed';textArea.style.left='-999999px';document.body.appendChild(textArea);textArea.select();try{document.execCommand('copy');alert('✅ 텍스트가 복사되었습니다!');}catch(err){alert('❌ 복사에 실패했습니다. 수동으로 복사해주세요.');prompt('아래 텍스트를 복사하세요:',text);}
document.body.removeChild(textArea);}
shareToSMS(text){console.log('📱 SMS 공유 시도...');const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent);const smsUrl=isIOS?`sms:&body=${encodeURIComponent(text)}`:`sms:?body=${encodeURIComponent(text)}`;window.location.href=smsUrl;}
shareViaWeb(text){console.log('📱 웹 공유 API 시도...');if(navigator.share){navigator.share({title:'🔮 육효 점괘 분석 결과',text:text,}).then(()=>{console.log('✅ 웹 공유 완료');}).catch((error)=>{if(error.name==='AbortError'){console.log('ℹ️ 사용자가 공유를 취소했습니다.');}else{console.error('❌ 웹 공유 실패:',error);if(confirm('공유에 실패했습니다.\n\n텍스트를 복사하시겠습니까?')){this.copyToClipboard(text);}}});}else{alert('이 브라우저는 웹 공유를 지원하지 않습니다.\n텍스트 복사 기능을 사용해주세요.');this.copyToClipboard(text);}}}
document.addEventListener('DOMContentLoaded',()=>{function createHiddenPillarElements(){const currentSajuSection=document.getElementById('currentSajuSection');if(currentSajuSection){currentSajuSection.remove();}
document.querySelectorAll('.current-saju-section, .saju-container, .saju-pillars, .pillar-container, .pillar').forEach((el)=>{el.remove();});if(!document.getElementById('yearPillar')){const yearPillar=document.createElement('div');yearPillar.className='pillar-value';yearPillar.id='yearPillar';yearPillar.textContent='--';yearPillar.style.display='none';document.body.appendChild(yearPillar);}
if(!document.getElementById('monthPillar')){const monthPillar=document.createElement('div');monthPillar.className='pillar-value';monthPillar.id='monthPillar';monthPillar.textContent='--';monthPillar.style.display='none';document.body.appendChild(monthPillar);}
if(!document.getElementById('dayPillar')){const dayPillar=document.createElement('div');dayPillar.className='pillar-value';dayPillar.id='dayPillar';dayPillar.textContent='--';dayPillar.style.display='none';document.body.appendChild(dayPillar);}
if(!document.getElementById('hourPillar')){const hourPillar=document.createElement('div');hourPillar.className='pillar-value';hourPillar.id='hourPillar';hourPillar.textContent='--';hourPillar.style.display='none';document.body.appendChild(hourPillar);}}
createHiddenPillarElements();console.log('📌 pillar-value 요소 생성 완료');const yearPillar=document.getElementById('yearPillar');const monthPillar=document.getElementById('monthPillar');const dayPillar=document.getElementById('dayPillar');const hourPillar=document.getElementById('hourPillar');if(yearPillar&&monthPillar&&dayPillar&&hourPillar){console.log('📌 pillar-value 요소 확인 완료, MutationObserver 설정 시작...');const pillars=[{id:'yearPillar',element:yearPillar,label:'年',lineRClass:'line-r5',},{id:'monthPillar',element:monthPillar,label:'月',lineRClass:'line-r4',},{id:'dayPillar',element:dayPillar,label:'日',lineRClass:'line-r3',},{id:'hourPillar',element:hourPillar,label:'時',lineRClass:'line-r2',},];const updateLineRDisplay=()=>{console.log('🔄 updateLineRDisplay 호출됨');pillars.forEach((pillar)=>{const lineRContainer=document.querySelector('.line-r-container');const lineRElement=lineRContainer?lineRContainer.querySelector('.'+pillar.lineRClass):document.querySelector('.'+pillar.lineRClass);if(lineRElement){const newText=pillar.element.textContent;console.log(`📝 ${pillar.label} (${pillar.lineRClass}) 값:`,newText);lineRElement.innerHTML='';if(newText&&newText.length>0&&newText!=='--'){const chars=newText.split('');chars.forEach((char)=>{const charSpan=document.createElement('span');charSpan.className='pillar-char';charSpan.textContent=char;lineRElement.appendChild(charSpan);});}
if(pillar.label){const labelSpan=document.createElement('span');labelSpan.className='pillar-label';labelSpan.textContent=pillar.label;lineRElement.appendChild(labelSpan);}}else{console.warn(`❌ ${pillar.lineRClass} 요소를 찾을 수 없음`);}});};const observer=new MutationObserver(()=>{console.log('👁️ MutationObserver 감지: pillar-value 변경됨');updateLineRDisplay();});pillars.forEach((pillar)=>{observer.observe(pillar.element,{childList:true,characterData:true,subtree:true,});console.log(`✅ MutationObserver 설정 완료: ${pillar.id}`);});console.log('🎬 초기 updateLineRDisplay 실행');updateLineRDisplay();}else{console.error('❌ pillar-value 요소를 찾을 수 없음');}
setTimeout(()=>{console.log('🚀 IntegratedNajiaSystem 초기화 시작...');new IntegratedNajiaSystem();},100);});