function toggleYundal(){const calendar=document.querySelector('input[name="calendar"]:checked').value;const yundalSection=document.getElementById('yundal-section');if(calendar==='lunar'){yundalSection.style.display='block';}else{yundalSection.style.display='none';document.getElementById('yundal').checked=false;}}
function toggleTimeInput(){const inputType=document.querySelector('input[name="timeInputType"]:checked').value;const timeSection=document.getElementById('time-input-section');const ganjiSection=document.getElementById('ganji-input-section');if(inputType==='time'){timeSection.style.display='block';ganjiSection.style.display='none';}else{timeSection.style.display='none';ganjiSection.style.display='block';}}
function getHourFromJiji(ji){const timeMap={子:0,丑:2,寅:4,卯:6,辰:8,巳:10,午:12,未:14,申:16,酉:18,戌:20,亥:22,미상:-1,};return timeMap[ji]!==undefined?timeMap[ji]:-1;}
function lunarToSolar(lunarYear,lunarMonth,lunarDay,isYundal){let solarYear=lunarYear;let solarMonth=lunarMonth+1;let solarDay=lunarDay;if(isYundal){solarMonth+=1;}
if(solarMonth>12){solarMonth-=12;solarYear+=1;}
if(solarDay>28){const daysInMonth=new Date(solarYear,solarMonth,0).getDate();if(solarDay>daysInMonth){solarDay=daysInMonth;}}
return{year:solarYear,month:solarMonth,day:solarDay,warning:'⚠️ 음력-양력 변환은 근사치입니다. 정확한 양력 날짜를 아신다면 양력을 직접 입력하세요.',};}
const CHEONGAN=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];const JIJI=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥',];const CHEONGAN_ELEMENT={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水',};const JIJI_ELEMENT={寅:'木',卯:'木',巳:'火',午:'火',辰:'土',戌:'土',丑:'土',未:'土',申:'金',酉:'金',亥:'水',子:'水',};const CHEONGAN_YINYANG={甲:'陽',乙:'陰',丙:'陽',丁:'陰',戊:'陽',己:'陰',庚:'陽',辛:'陰',壬:'陽',癸:'陰',};const JIJI_YINYANG={子:'陽',丑:'陰',寅:'陽',卯:'陰',辰:'陽',巳:'陰',午:'陽',未:'陰',申:'陽',酉:'陰',戌:'陽',亥:'陰',};const JIJANGGAN={子:[{gan:'壬',element:'水',strength:7,type:'초기'},{gan:'癸',element:'水',strength:23,type:'본기'},],丑:[{gan:'癸',element:'水',strength:9,type:'초기'},{gan:'辛',element:'金',strength:3,type:'중기'},{gan:'己',element:'土',strength:18,type:'정기'},],寅:[{gan:'戊',element:'土',strength:7,type:'초기'},{gan:'丙',element:'火',strength:7,type:'중기'},{gan:'甲',element:'木',strength:16,type:'정기'},],卯:[{gan:'甲',element:'木',strength:10,type:'초기'},{gan:'乙',element:'木',strength:20,type:'정기'},],辰:[{gan:'乙',element:'木',strength:9,type:'초기'},{gan:'癸',element:'水',strength:3,type:'중기'},{gan:'戊',element:'土',strength:18,type:'정기'},],巳:[{gan:'戊',element:'土',strength:7,type:'초기'},{gan:'庚',element:'金',strength:7,type:'중기'},{gan:'丙',element:'火',strength:16,type:'정기'},],午:[{gan:'丙',element:'火',strength:10,type:'초기'},{gan:'己',element:'土',strength:9,type:'중기'},{gan:'丁',element:'火',strength:11,type:'정기'},],未:[{gan:'丁',element:'火',strength:9,type:'초기'},{gan:'乙',element:'木',strength:3,type:'중기'},{gan:'己',element:'土',strength:18,type:'정기'},],申:[{gan:'戊',element:'土',strength:7,type:'초기'},{gan:'壬',element:'水',strength:7,type:'중기'},{gan:'庚',element:'金',strength:16,type:'정기'},],酉:[{gan:'庚',element:'金',strength:10,type:'초기'},{gan:'辛',element:'金',strength:20,type:'정기'},],戌:[{gan:'辛',element:'金',strength:9,type:'초기'},{gan:'丁',element:'火',strength:3,type:'중기'},{gan:'戊',element:'土',strength:18,type:'정기'},],亥:[{gan:'戊',element:'土',strength:7,type:'초기'},{gan:'甲',element:'木',strength:7,type:'중기'},{gan:'壬',element:'水',strength:16,type:'정기'},],};const SIBIUNTEONG={甲:{亥:'長生',子:'沐浴',丑:'冠帶',寅:'建祿',卯:'帝旺',辰:'衰',巳:'病',午:'死',未:'墓',申:'絶',酉:'胎',戌:'養',},乙:{午:'長生',巳:'沐浴',辰:'冠帶',卯:'建祿',寅:'帝旺',丑:'衰',子:'病',亥:'死',戌:'墓',酉:'絶',申:'胎',未:'養',},丙:{寅:'長生',卯:'沐浴',辰:'冠帶',巳:'建祿',午:'帝旺',未:'衰',申:'病',酉:'死',戌:'墓',亥:'絶',子:'胎',丑:'養',},丁:{酉:'長生',申:'沐浴',未:'冠帶',午:'建祿',巳:'帝旺',辰:'衰',卯:'病',寅:'死',丑:'墓',子:'絶',亥:'胎',戌:'養',},戊:{寅:'長生',卯:'沐浴',辰:'冠帶',巳:'建祿',午:'帝旺',未:'衰',申:'病',酉:'死',戌:'墓',亥:'絶',子:'胎',丑:'養',},己:{酉:'長生',申:'沐浴',未:'冠帶',午:'建祿',巳:'帝旺',辰:'衰',卯:'病',寅:'死',丑:'墓',子:'絶',亥:'胎',戌:'養',},庚:{巳:'長生',午:'沐浴',未:'冠帶',申:'建祿',酉:'帝旺',戌:'衰',亥:'病',子:'死',丑:'墓',寅:'絶',卯:'胎',辰:'養',},辛:{子:'長生',亥:'沐浴',戌:'冠帶',酉:'建祿',申:'帝旺',未:'衰',午:'病',巳:'死',辰:'墓',卯:'絶',寅:'胎',丑:'養',},壬:{申:'長生',酉:'沐浴',戌:'冠帶',亥:'建祿',子:'帝旺',丑:'衰',寅:'病',卯:'死',辰:'墓',巳:'絶',午:'胎',未:'養',},癸:{卯:'長生',寅:'沐浴',丑:'冠帶',子:'建祿',亥:'帝旺',戌:'衰',酉:'病',申:'死',未:'墓',午:'絶',巳:'胎',辰:'養',},};const SIBIUNTEONG_DESC={長生:'새로운 생명이 시작되는 시기. 왕성한 생명력과 발전 가능성',沐浴:'정화와 세척의 시기. 불안정하지만 변화의 가능성',冠帶:'성장하여 관(冠)을 쓰는 시기. 사회적 지위 상승',建祿:'가장 왕성한 활동력. 자립과 독립의 시기',帝旺:'최고의 전성기. 권력과 영향력이 절정',衰:'쇠퇴의 시작. 활력 감소, 신중함 필요',病:'질병과 어려움의 시기. 건강과 사업 주의',死:'죽음과 끝의 시기. 큰 변화나 위기',墓:'무덤에 들어가는 시기. 침체와 은둔',絶:'단절과 고립. 극복하면 새로운 시작',胎:'태아처럼 준비하는 시기. 내면 성장',養:'양육받는 시기. 도움을 받으며 성장',};const SIBIUNTEONG_SCORE={長生:4,沐浴:2,冠帶:3,建祿:5,帝旺:5,衰:2,病:1,死:0,墓:1,絶:0,胎:2,養:3,};const DAYMASTER_CHARACTERISTICS={甲:'큰 나무처럼 곧고 정직하며 리더십이 있습니다. 원칙을 중시하고 남을 돕는 것을 좋아하며 진취적입니다.',乙:'꽃이나 풀처럼 부드럽고 섬세하며 적응력이 뛰어납니다. 유연하고 친화력이 좋으며 예술적 감각이 있습니다.',丙:'태양처럼 밝고 열정적이며 사교적입니다. 남에게 온정을 베풀고 활발하며 낙천적입니다.',丁:'등불처럼 따뜻하고 세심하며 예의 바릅니다. 섬세하고 예술적 재능과 감수성이 풍부합니다.',戊:'큰 산처럼 중후하고 신뢰감이 있습니다. 포용력이 크고 인내심이 강하며 안정적이고 믿음직합니다.',己:'밭이나 정원처럼 섬세하고 배려심이 깊습니다. 실속을 챙기고 현실적이며 근면하고 성실합니다.',庚:'도끼나 칼처럼 강직하고 결단력이 있습니다. 정의감이 강하고 의리를 중시하며 용감하고 과단성이 있습니다.',辛:'보석처럼 세련되고 우아하며 미적 감각이 뛰어납니다. 품위가 있고 감성적이며 섬세합니다.',壬:'큰 바다처럼 포용력이 크고 지혜롭습니다. 융통성이 있고 통찰력이 뛰어나며 활동적이고 진취적입니다.',癸:'이슬이나 빗물처럼 섬세하고 지혜롭습니다. 직관력이 뛰어나고 사려 깊으며 조용하고 사색적입니다.',};const ELEMENT_DESC={木:'나무의 기운 - 생성과 성장을 상징. 인자하고 온화하며 창의적',火:'불의 기운 - 열정과 활동을 상징. 적극적이고 밝으며 사교적',土:'흙의 기운 - 포용과 신용을 상징. 성실하고 안정적이며 신뢰감',金:'쇠의 기운 - 결단과 강직함을 상징. 의지가 강하고 판단력 뛰어남',水:'물의 기운 - 지혜와 유연함을 상징. 총명하고 적응력이 뛰어남',};const ELEMENT_RELATIONS={생:{木:'火',火:'土',土:'金',金:'水',水:'木'},극:{木:'土',火:'金',土:'水',金:'木',水:'火'},};const CHEONGAN_HAP={甲己:{name:'중정지합',result:'土'},乙庚:{name:'인의지합',result:'金'},丙辛:{name:'위제지합',result:'水'},丁壬:{name:'음양지합',result:'木'},戊癸:{name:'무정지합',result:'火'},};const JIJI_YUKHAP={子丑:'土',寅亥:'木',卯戌:'火',辰酉:'金',巳申:'水',午未:'土',};const SAMHAP={寅午戌:{result:'火',name:'火局'},巳酉丑:{result:'金',name:'金局'},申子辰:{result:'水',name:'水局'},亥卯未:{result:'木',name:'木局'},};const JIJI_CHUNG={子午:true,丑未:true,寅申:true,卯酉:true,辰戌:true,巳亥:true,};const JIJI_HYUNG={寅巳申:'무은지형',丑戌未:'지세지형',子卯:'무례지형',};const JAHYUNG=['辰','午','酉','亥'];const JIJI_PA={子酉:true,丑辰:true,寅亥:true,卯午:true,巳申:true,未戌:true,};const JIJI_HAE={子未:true,丑午:true,寅巳:true,卯辰:true,申亥:true,酉戌:true,};const NAPEUM={甲子:'해중금',乙丑:'해중금',丙寅:'노중화',丁卯:'노중화',戊辰:'대림목',己巳:'대림목',庚午:'노방토',辛未:'노방토',壬申:'검봉금',癸酉:'검봉금',甲戌:'산두화',乙亥:'산두화',丙子:'간하수',丁丑:'간하수',戊寅:'성두토',己卯:'성두토',庚辰:'백랍금',辛巳:'백랍금',壬午:'양류목',癸未:'양류목',甲申:'정천수',乙酉:'정천수',丙戌:'옥상토',丁亥:'옥상토',戊子:'벽력화',己丑:'벽력화',庚寅:'송백목',辛卯:'송백목',壬辰:'장류수',癸巳:'장류수',甲午:'사중금',乙未:'사중금',丙辛:'산하화',丁酉:'산하화',戊戌:'평지목',己亥:'평지목',庚子:'벽상토',辛丑:'벽상토',壬寅:'금박금',癸卯:'금박금',甲辰:'불등화',乙巳:'불등화',丙午:'천하수',丁未:'천하수',戊申:'대역토',己酉:'대역토',庚戌:'차천금',申亥:'차천금',壬子:'상자목',癸丑:'상자목',甲寅:'대계수',乙卯:'대계수',丙辰:'사중토',丁巳:'사중토',戊午:'천상화',己未:'천상화',庚申:'석류목',辛酉:'석류목',壬戌:'대해수',癸亥:'대해수',};const NAPEUM_DESC={金:'단단하고 견고함. 신념이 확고하고 의지가 강함',木:'성장과 발전. 창의적이고 활동적이며 진취적',水:'지혜와 유연함. 적응력이 뛰어나고 통찰력이 있음',火:'열정과 명예. 밝고 적극적이며 사교성이 뛰어남',土:'신용과 포용. 믿음직하고 안정적이며 현실적',};const GONGMANG={甲子:['戌','亥'],甲戌:['申','酉'],甲申:['午','未'],甲午:['辰','巳'],甲辰:['寅','卯'],甲寅:['子','丑'],};const SINSAL={天乙貴人:{甲:['丑','未'],乙:['子','申'],丙:['亥','酉'],丁:['亥','酉'],戊:['丑','未'],己:['子','申'],庚:['丑','未'],辛:['子','申'],壬:['巳','卯'],癸:['巳','卯'],},天德貴人:{寅:'丁',卯:'申',辰:'壬',巳:'申',午:'壬',未:'丁',辛:'丁',酉:'申',戌:'壬',亥:'申',子:'壬',丑:'丁',},月德貴人:{寅:'病',卯:'甲',辰:'壬',巳:'庚',午:'病',未:'甲',辛:'庚',酉:'戊',戌:'壬',亥:'甲',子:'庚',丑:'戊',},學堂貴人:{甲:'死',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'墓',},桃花殺:{寅午戌:'墓',巳酉丑:'午',申子辰:'酉',亥卯未:'子',},驛馬殺:{寅午戌:'申',巳酉丑:'亥',申子辰:'寅',亥卯未:'死',},劫殺:{寅午戌:'死',巳酉丑:'申',申子辰:'亥',亥卯未:'寅',},華蓋殺:{寅午戌:'戌',巳酉丑:'丑',申子辰:'辰',亥卯未:'未',},白虎大殺:{寅午戌:'酉',巳酉丑:'子',申子辰:'墓',亥卯未:'午',},三災:{寅午戌:['子','丑','寅'],巳酉丑:['卯','辰','巳'],申子辰:['午','未','申'],亥卯未:['酉','戌','亥'],},};const SINSAL_DESC={天乙貴人:'가장 강력한 길신. 귀인의 도움과 위기 구제',天德貴人:'하늘의 덕으로 복록이 많고 재난 면함',月德貴人:'달의 덕으로 온화하고 덕망이 높음',學堂貴人:'학문과 예술에 재능, 명석한 두뇌',桃花殺:'이성운이 강하고 매력적이나 색난 주의',驛馬殺:'이동과 변화가 많음. 해외운과 활동성',劫殺:'재물 손실이나 도난 주의. 급격한 변화',華蓋殺:'예술과 종교적 재능. 고독하고 독특함',白虎大殺:'돌발사고와 혈광 주의. 충동적 행동 경계',三災:'3년간의 재난운. 모든 일에 신중함 필요',};const YUKCHIN_MALE={比劫:'형제',食傷:'자녀(아들)',財星:'처·재물',官星:'자녀(딸)',印星:'어머니',};const YUKCHIN_FEMALE={比劫:'자매',食傷:'자녀',財星:'아버지·재물',官星:'남편',印星:'어머니',};function getMonthJiji(month,day){const monthMap=[{start:[2,4],jiji:'寅'},{start:[3,6],jiji:'墓'},{start:[4,5],jiji:'辰'},{start:[5,6],jiji:'死'},{start:[6,6],jiji:'午'},{start:[7,7],jiji:'未'},{start:[8,8],jiji:'申'},{start:[9,8],jiji:'酉'},{start:[10,8],jiji:'戌'},{start:[11,7],jiji:'亥'},{start:[12,7],jiji:'子'},{start:[1,6],jiji:'丑'},];for(let item of monthMap){const[m,d]=item.start;if(month===m&&day>=d)return item.jiji;if(month===m-1||(month===12&&m===1))return item.jiji;}
return JIJI[(month+1)%12];}
function getHourJiji(hour,minute){if((hour===23&&minute>=30)||hour===0||(hour===1&&minute<=29)){return'子';}
else if((hour===1&&minute>=30)||hour===2||(hour===3&&minute<=29)){return'丑';}
else if((hour===3&&minute>=30)||hour===4||(hour===5&&minute<=29)){return'寅';}
else if((hour===5&&minute>=30)||hour===6||(hour===7&&minute<=29)){return'卯';}
else if((hour===7&&minute>=30)||hour===8||(hour===9&&minute<=29)){return'辰';}
else if((hour===9&&minute>=30)||hour===10||(hour===11&&minute<=29)){return'巳';}
else if((hour===11&&minute>=30)||hour===12||(hour===13&&minute<=29)){return'午';}
else if((hour===13&&minute>=30)||hour===14||(hour===15&&minute<=29)){return'未';}
else if((hour===15&&minute>=30)||hour===16||(hour===17&&minute<=29)){return'申';}
else if((hour===17&&minute>=30)||hour===18||(hour===19&&minute<=29)){return'酉';}
else if((hour===19&&minute>=30)||hour===20||(hour===21&&minute<=29)){return'戌';}
else if((hour===21&&minute>=30)||hour===22||(hour===23&&minute<=29)){return'亥';}
return'子';}
function getYearCheongan(year){return CHEONGAN[(year-1984)%10];}
function getYearJiji(year){return JIJI[(year-1984)%12];}
function getDayCheongan(year,month,day){const baseDate=new Date(2000,0,1);const targetDate=new Date(year,month-1,day);const daysDiff=Math.floor((targetDate-baseDate)/(1000*60*60*24));return CHEONGAN[((daysDiff%10)+16)%10];}
function getDayJiji(year,month,day){const baseDate=new Date(2000,0,1);const targetDate=new Date(year,month-1,day);const daysDiff=Math.floor((targetDate-baseDate)/(1000*60*60*24));return JIJI[((daysDiff%12)+16)%12];}
function getMonthCheongan(yearGan,monthJiji){const yearGanIndex=CHEONGAN.indexOf(yearGan);const jijiIndex=JIJI.indexOf(monthJiji);const monthOrder=[2,3,4,5,6,7,8,9,10,11,0,1,];const monthNum=monthOrder.indexOf(jijiIndex);if(monthNum===-1)return CHEONGAN[0];const yearGroup=yearGanIndex%5;const startGan=[2,4,6,8,0][yearGroup];const monthGanIndex=(startGan+monthNum)%10;return CHEONGAN[monthGanIndex];}
function getHourCheongan(dayGan,hourJiji){const jijiIndex=JIJI.indexOf(hourJiji);const dayGanIndex=CHEONGAN.indexOf(dayGan);const base={0:0,1:2,2:4,3:6,4:8,5:0,6:2,7:4,8:6,9:8};return CHEONGAN[(base[dayGanIndex]+jijiIndex)%10];}
function getNapeum(gan,ji){const ganjiKey=gan+ji;const napeumFull=NAPEUM[ganjiKey]||'';if(napeumFull.includes('金'))return{full:napeumFull,element:'金'};if(napeumFull.includes('木'))return{full:napeumFull,element:'木'};if(napeumFull.includes('水'))return{full:napeumFull,element:'水'};if(napeumFull.includes('火'))return{full:napeumFull,element:'火'};if(napeumFull.includes('土'))return{full:napeumFull,element:'土'};return{full:napeumFull,element:''};}
function getGongmang(yearGan,yearJi,targetJi){const ganIndex=CHEONGAN.indexOf(yearGan);const jiIndex=JIJI.indexOf(yearJi);const gapjaGroups=['甲子','甲戌','甲申','甲午','甲辰','甲寅'];let gapjaBase='';for(let i=0;i<6;i++){const testGan='갑';const testJi=JIJI[(jiIndex-(ganIndex%10)+i*2+12)%12];const key=testGan+testJi;if(gapjaGroups.includes(key)){gapjaBase=key;break;}}
if(!gapjaBase){const diff=(ganIndex%10)-(jiIndex%12);if(diff===0)gapjaBase='甲子';else if(diff===-10||diff===2)gapjaBase='甲戌';else if(diff===-8||diff===4)gapjaBase='甲申';else if(diff===-6||diff===6)gapjaBase='甲午';else if(diff===-4||diff===8)gapjaBase='甲辰';else gapjaBase='甲寅';}
const gongmangList=GONGMANG[gapjaBase]||[];return gongmangList.includes(targetJi);}
function getSipseong(dayGan,targetElement){const dayElement=CHEONGAN_ELEMENT[dayGan];const elements=['木','火','土','金','水'];const dayIndex=elements.indexOf(dayElement);const targetIndex=elements.indexOf(targetElement);const diff=(targetIndex-dayIndex+5)%5;const sipseongMap={0:'比劫',1:'食傷',2:'財星',3:'官星',4:'印星'};return sipseongMap[diff];}
function getSipseongDetailed(dayGan,targetGan){const dayElement=CHEONGAN_ELEMENT[dayGan];const targetElement=CHEONGAN_ELEMENT[targetGan];const elements=['木','火','土','金','水'];const dayIndex=elements.indexOf(dayElement);const targetIndex=elements.indexOf(targetElement);const diff=(targetIndex-dayIndex+5)%5;const dayYinYang=CHEONGAN_YINYANG[dayGan];const targetYinYang=CHEONGAN_YINYANG[targetGan];const sameYinYang=dayYinYang===targetYinYang;if(diff===0){return sameYinYang?'比肩':'劫財';}else if(diff===1){return sameYinYang?'食神':'傷官';}else if(diff===2){return sameYinYang?'偏財':'正財';}else if(diff===3){return sameYinYang?'偏官':'正官';}else if(diff===4){return sameYinYang?'偏印':'正印';}
return'未知';}
function getSipseongFromGan(dayGan,targetGan){const targetElement=CHEONGAN_ELEMENT[targetGan];return getSipseong(dayGan,targetElement);}
function getSipseongFromGanDetailed(dayGan,targetGan){return getSipseongDetailed(dayGan,targetGan);}
function analyzeSajuStrength(dayGan,saju){let score=0;const dayElement=CHEONGAN_ELEMENT[dayGan];const monthJi=saju.jiji.month;const sibiun=SIBIUNTEONG[dayGan][monthJi];score+=SIBIUNTEONG_SCORE[sibiun]*10;Object.values(saju.jiji).forEach((ji)=>{if(ji&&JIJANGGAN[ji]){JIJANGGAN[ji].forEach((item)=>{if(item.element===dayElement){score+=(item.strength/100)*10;}
const birthElement=ELEMENT_RELATIONS['생'][item.element];if(birthElement===dayElement){score+=(item.strength/100)*5;}});}});Object.values(saju.cheongan).forEach((gan)=>{if(gan&&CHEONGAN_ELEMENT[gan]===dayElement){score+=5;}});let level,desc;if(score>=45){level='太旺(태왕)';desc='일간이 극도로 강합니다. 설기(洩氣)가 필요하며, 식상과 재성을 용신으로 사용합니다. 지나친 고집과 독선을 경계해야 합니다.';}else if(score>=35){level='旺(왕)';desc='일간이 매우 강합니다. 식상, 재성, 관성으로 기운을 설기하는 것이 좋습니다. 자신감이 넘치나 타인을 배려해야 합니다.';}else if(score>=25){level='中和(중화)';desc='일간이 적당히 강합니다. 가장 이상적인 상태로 균형이 잘 잡혀 있습니다. 상황에 따라 유연하게 대처할 수 있습니다.';}else if(score>=15){level='弱(약)';desc='일간이 약합니다. 비겁과 인성으로 도움을 받아야 합니다. 과도한 식상, 재성, 관성은 부담이 됩니다. 자기관리와 건강에 주의가 필요합니다.';}else{level='太弱(태약)';desc='일간이 극도로 약합니다. 반드시 비겁과 인성의 도움이 필요합니다. 무리한 일은 피하고 휴식과 재충전이 중요합니다. 건강관리에 특히 유의해야 합니다.';}
return{score,level,desc};}
function analyzeGyeokguk(dayGan,saju,strength){const monthJi=saju.jiji.month;const monthGan=saju.cheongan.month;const dayElement=CHEONGAN_ELEMENT[dayGan];let monthJiElement=JIJI_ELEMENT[monthJi];let visibleElements=[];Object.values(saju.cheongan).forEach((gan)=>{visibleElements.push(CHEONGAN_ELEMENT[gan]);});const monthSipseong=getSipseong(dayGan,CHEONGAN_ELEMENT[monthGan]);let gyeokguk='';let gyeokgukDesc='';if(strength.level==='太弱(태약)'||strength.score<10){const elementCount={};visibleElements.forEach((el)=>{elementCount[el]=(elementCount[el]||0)+1;});if(elementCount[dayElement]===1){const dominantElement=Object.keys(elementCount).reduce((a,b)=>elementCount[a]>elementCount[b]?a:b);if(dominantElement!==dayElement){const dominantSipseong=getSipseong(dayGan,dominantElement);if(dominantSipseong==='財星'){gyeokguk='從財格(從財格)';gyeokgukDesc='재성을 따르는 격국입니다. 재물운이 강하고 사업가 기질이 있으나, 재물에 집착하지 않도록 주의해야 합니다. 재성을 키우는 식상이 용신입니다.';}else if(dominantSipseong==='官星'){gyeokguk='從殺格(從殺格)';gyeokgukDesc='관성(관살)을 따르는 격국입니다. 강한 상사나 환경에 순응하여 성공합니다. 조직생활에 적합하며, 재성이 용신입니다.';}else if(dominantSipseong==='食傷'){gyeokguk='從兒格(從兒格)';gyeokgukDesc='식상(자식)을 따르는 격국입니다. 예술, 창작, 교육 분야에 재능이 있습니다. 재성이 용신입니다.';}}}}
if(!gyeokguk){if(monthSipseong==='正官'||monthSipseong==='官星'){gyeokguk='正官格(정관격)';gyeokgukDesc='正官格은 명예와 지위를 중시하는 격국입니다. 공직이나 대기업에 적합하며, 원칙과 규칙을 잘 지킵니다. 재성이 관성을 생하므로 용신이 됩니다.';}else if(monthSipseong==='正財'||monthSipseong==='財星'){gyeokguk='正財格(정재격)';gyeokgukDesc='正財格은 재물 관리에 능하고 현실적입니다. 꾸준한 노력으로 재산을 축적합니다. 식상이 재성을 생하므로 용신이 됩니다.';}else if(monthSipseong==='正印'||monthSipseong==='印星'){gyeokguk='正印格(정인격)';gyeokgukDesc='正印格은 학문과 교육에 소질이 있습니다. 지혜롭고 사려 깊으며, 어머니의 덕이 있습니다. 관성이 인성을 생하므로 용신이 됩니다.';}else if(monthSipseong==='食神'||monthSipseong==='食傷'){gyeokguk='食神格(식신격)';gyeokgukDesc='食神格은 온화하고 복록이 있습니다. 예술, 요식업, 서비스업에 적합합니다. 재성이 식신의 기운을 받아 용신이 됩니다.';}else if(monthSipseong==='比劫'){gyeokguk='建祿格(건록격)';gyeokgukDesc='建祿格은 자립심이 강하고 독립적입니다. 창업이나 자영업에 적합하며, 형제의 도움이 있습니다. 식상과 재성이 용신입니다.';}else{gyeokguk='內外格(내외격)';gyeokgukDesc='특정 격국에 속하지 않는 복합적인 구조입니다. 다재다능하나 방향 설정이 중요합니다. 사주 전체의 균형을 보아 용신을 정해야 합니다.';}}
return{name:gyeokguk,desc:gyeokgukDesc};}
function analyzeYongsin(dayGan,saju,strength,gyeokguk){const dayElement=CHEONGAN_ELEMENT[dayGan];const elements=['木','火','土','金','水'];let yongsin='';let huisin='';let gisin='';let yongsinDesc='';if(gyeokguk.name.includes('從')){if(gyeokguk.name.includes('財')){yongsin='食傷';huisin='財星';gisin='印星·比劫';yongsinDesc='식상으로 재성을 생하는 것이 핵심입니다. 창작, 표현, 기술 분야에서 재물을 얻습니다.';}else if(gyeokguk.name.includes('殺')){yongsin='財星';huisin='食傷';gisin='印星·比劫';yongsinDesc='재성으로 관살을 생하는 것이 핵심입니다. 재물로 관계를 원활히 하고 지위를 얻습니다.';}else if(gyeokguk.name.includes('我')){yongsin='財星';huisin='食傷';gisin='印星·比劫';yongsinDesc='식상의 기운을 재성으로 이어가는 것이 핵심입니다.';}}
else{if(strength.level==='太旺(태왕)'||strength.level==='旺(왕)'){yongsin='食傷';huisin='財星';gisin='印星·比劫';yongsinDesc='일간이 강하므로 식상으로 기운을 설기하고, 재성으로 활용하는 것이 좋습니다. 창작, 표현, 사업 활동이 유리합니다.';}else if(strength.level==='太弱(태약)'||strength.level==='弱(약)'){yongsin='印星';huisin='比劫';gisin='食傷·財星·官星';yongsinDesc='일간이 약하므로 인성으로 생부하고 비겁으로 도와야 합니다. 학문, 기술, 자격증 취득이 중요하며, 협력자가 필요합니다.';}else{const monthJi=saju.jiji.month;const monthElement=JIJI_ELEMENT[monthJi];const monthSipseong=getSipseong(dayGan,monthElement);if(monthSipseong==='財星'){yongsin='食傷';huisin='財星';gisin='比劫';yongsinDesc='재성이 투출하므로 식상으로 재성을 생하는 것이 좋습니다. 사업과 재물 관리에 유리합니다.';}else if(monthSipseong==='官星'){yongsin='財星';huisin='印星';gisin='食傷';yongsinDesc='관성이 투출하므로 재성으로 관성을 생하고, 인성으로 균형을 맞춥니다. 명예와 지위를 추구합니다.';}else if(monthSipseong==='印星'){yongsin='官星';huisin='財星';gisin='食傷';yongsinDesc='인성이 투출하므로 관성으로 인성을 생하는 것이 좋습니다. 학문과 자격증이 도움이 됩니다.';}else{yongsin='食傷';huisin='財星';gisin='印星';yongsinDesc='균형잡힌 사주이므로 식상으로 재능을 발휘하고 재성으로 결실을 맺는 것이 좋습니다.';}}}
const sipseongToElement=(sipseong)=>{const dayIndex=elements.indexOf(dayElement);const offsets={比劫:0,食傷:1,財星:2,官星:3,印星:4};return elements[(dayIndex+offsets[sipseong])%5];};const yongsinElement=yongsin.includes('·')?yongsin:sipseongToElement(yongsin);const huisinElement=huisin.includes('·')?huisin:sipseongToElement(huisin);const gisinElement=gisin.includes('·')?gisin:sipseongToElement(gisin);return{yongsin:yongsinElement,huisin:huisinElement,gisin:gisinElement,desc:yongsinDesc,};}
function analyzeYukchin(dayGan,saju,gender){const yukchinMap=gender==='male'?YUKCHIN_MALE:YUKCHIN_FEMALE;const analysis={};const sipseongCount={};['比劫','食傷','財星','官星','印星'].forEach((s)=>(sipseongCount[s]=0));const sipseongDetailedCount={};['比肩','劫財','食神','傷官','偏財','正財','偏官','正官','偏印','正印',].forEach((s)=>(sipseongDetailedCount[s]=0));Object.values(saju.cheongan).forEach((gan)=>{if(gan){const sipseong=getSipseongFromGan(dayGan,gan);sipseongCount[sipseong]++;const sipseongDetailed=getSipseongFromGanDetailed(dayGan,gan);sipseongDetailedCount[sipseongDetailed]++;}});Object.values(saju.jiji).forEach((ji)=>{if(ji&&JIJANGGAN[ji]){const hongi=JIJANGGAN[ji].find((j)=>j.type==='본기'||j.type==='정기');if(hongi){const sipseong=getSipseongFromGan(dayGan,hongi.gan);sipseongCount[sipseong]++;const sipseongDetailed=getSipseongFromGanDetailed(dayGan,hongi.gan);sipseongDetailedCount[sipseongDetailed]++;}}});Object.entries(yukchinMap).forEach(([sipseong,relation])=>{const count=sipseongCount[sipseong];let desc='';if(relation.includes('형제')){if(count>=3)
desc='형제자매가 많거나 친구, 동료와의 인연이 깊습니다. 협력이 중요하나 경쟁도 있을 수 있습니다.';else if(count===0)
desc='형제자매가 적거나 인연이 약합니다. 독자적으로 일하는 것을 선호합니다.';else
desc='형제자매와 적당한 인연이 있습니다. 협력과 독립의 균형이 좋습니다.';}else if(relation.includes('자녀')){if(count>=3)
desc='자녀복이 많고 인연이 깊습니다. 표현력과 재능이 뛰어나며 창의적입니다.';else if(count===0)
desc='자녀와의 인연이 늦거나 약할 수 있습니다. 자기표현을 더 해야 합니다.';else desc='자녀운이 적당합니다. 창작과 표현 활동이 도움이 됩니다.';}else if(relation.includes('처')||relation.includes('재물')){if(count>=3)
desc='재물운이 강하고 배우자복이 있습니다. 다만 재물 관리에 주의가 필요합니다.';else if(count===0)
desc='재물과 배우자 인연이 약합니다. 검소한 생활과 인연 관리가 필요합니다.';else
desc='재물운과 배우자운이 적당합니다. 꾸준한 노력으로 재산을 모을 수 있습니다.';}else if(relation.includes('남편')||relation.includes('딸')){if(count>=3)
desc='남편복(관직운)이 강하거나 딸 복이 많습니다. 명예와 지위를 얻을 수 있습니다.';else if(count===0)
desc='남편(관직)과의 인연이 약합니다. 자유로운 직업이 맞을 수 있습니다.';else
desc='남편운(관직운)이 적당합니다. 안정적인 조직생활이 가능합니다.';}else if(relation.includes('어머니')){if(count>=3)
desc='어머니의 덕이 크고 학문운이 좋습니다. 지혜롭고 신중합니다.';else if(count===0)
desc='어머니와의 인연이 약하거나 일찍 독립합니다. 스스로 배우고 성장해야 합니다.';else
desc='어머니의 적당한 도움이 있습니다. 학문과 교육에서 성과를 낼 수 있습니다.';}
analysis[relation]={count,desc};});return analysis;}
function analyzeHyungChung(saju){const jijiList=Object.values(saju.jiji);const results={chung:[],hyung:[],pa:[],hae:[]};for(let i=0;i<jijiList.length;i++){for(let j=i+1;j<jijiList.length;j++){const pair=[jijiList[i],jijiList[j]].sort().join('');if(JIJI_CHUNG[pair]){results.chung.push({pair:`${jijiList[i]}-${jijiList[j]}`,positions:[i,j],});}}}
const hyungPatterns=Object.keys(JIJI_HYUNG);hyungPatterns.forEach((pattern)=>{const chars=pattern.split('');const found=chars.filter((c)=>jijiList.includes(c));if(found.length===chars.length){results.hyung.push({type:JIJI_HYUNG[pattern],chars:found.join('-')});}});JAHYUNG.forEach((ji)=>{const count=jijiList.filter((j)=>j===ji).length;if(count>=2){results.hyung.push({type:'자형',chars:`${ji}${ji}`});}});for(let i=0;i<jijiList.length;i++){for(let j=i+1;j<jijiList.length;j++){const pair=[jijiList[i],jijiList[j]].sort().join('');if(JIJI_PA[pair]){results.pa.push({pair:`${jijiList[i]}-${jijiList[j]}`,positions:[i,j],});}}}
for(let i=0;i<jijiList.length;i++){for(let j=i+1;j<jijiList.length;j++){const pair=[jijiList[i],jijiList[j]].sort().join('');if(JIJI_HAE[pair]){results.hae.push({pair:`${jijiList[i]}-${jijiList[j]}`,positions:[i,j],});}}}
return results;}
function analyzeHap(saju){const ganList=Object.values(saju.cheongan);const jijiList=Object.values(saju.jiji);const results={cheonganHap:[],jijiHap:[],samhap:[]};for(let i=0;i<ganList.length;i++){for(let j=i+1;j<ganList.length;j++){const pair=[ganList[i],ganList[j]].sort().join('');if(CHEONGAN_HAP[pair]){results.cheonganHap.push({pair:`${ganList[i]}-${ganList[j]}`,name:CHEONGAN_HAP[pair].name,result:CHEONGAN_HAP[pair].result,});}}}
for(let i=0;i<jijiList.length;i++){for(let j=i+1;j<jijiList.length;j++){const pair=[jijiList[i],jijiList[j]].sort().join('');if(JIJI_YUKHAP[pair]){results.jijiHap.push({pair:`${jijiList[i]}-${jijiList[j]}`,name:'육합',result:JIJI_YUKHAP[pair],});}}}
Object.entries(SAMHAP).forEach(([pattern,info])=>{const chars=pattern.split('');const found=chars.filter((c)=>jijiList.includes(c));if(found.length===3){results.samhap.push({pattern:found.join('-'),...info,complete:true,});}else if(found.length===2){results.samhap.push({pattern:found.join('-'),...info,complete:false,});}});return results;}
function analyzeSinsal(saju,yearGan,dayGan){const jijiList=Object.values(saju.jiji);const ganList=Object.values(saju.cheongan);const results={good:[],bad:[],special:[]};const cheonul=SINSAL['天乙貴人'][yearGan]||[];jijiList.forEach((ji)=>{if(cheonul.includes(ji)){results.good.push({name:'天乙貴人',desc:SINSAL_DESC['天乙貴人'],ji,});}});const cheondeok=SINSAL['天德貴人'][saju.jiji.month];ganList.forEach((gan)=>{if(gan===cheondeok){results.good.push({name:'天德貴人',desc:SINSAL_DESC['天德貴人']});}});const woldeok=SINSAL['月德貴人'][saju.jiji.month];ganList.forEach((gan)=>{if(gan===woldeok){results.good.push({name:'月德貴人',desc:SINSAL_DESC['月德貴人']});}});const hakdang=SINSAL['學堂貴人'][dayGan];jijiList.forEach((ji)=>{if(ji===hakdang){results.good.push({name:'學堂貴人',desc:SINSAL_DESC['學堂貴人']});}});const getJijiGroup=()=>{for(let[pattern,_]of Object.entries(SINSAL['桃花殺'])){const chars=pattern.split('');if(chars.some((c)=>jijiList.includes(c))){return pattern;}}
return null;};const jijiGroup=getJijiGroup();if(jijiGroup){const dohwa=SINSAL['桃花殺'][jijiGroup];if(jijiList.includes(dohwa)){results.bad.push({name:'桃花殺',desc:SINSAL_DESC['桃花殺']});}}
if(jijiGroup){const yeokma=SINSAL['驛馬殺'][jijiGroup];if(jijiList.includes(yeokma)){results.special.push({name:'驛馬殺',desc:SINSAL_DESC['驛馬殺']});}}
if(jijiGroup){const geop=SINSAL['劫殺'][jijiGroup];if(jijiList.includes(geop)){results.bad.push({name:'劫殺',desc:SINSAL_DESC['劫殺']});}}
if(jijiGroup){const hwagae=SINSAL['華蓋殺'][jijiGroup];if(jijiList.includes(hwagae)){results.special.push({name:'華蓋殺',desc:SINSAL_DESC['華蓋殺']});}}
if(jijiGroup){const baekho=SINSAL['白虎大殺'][jijiGroup];if(jijiList.includes(baekho)){results.bad.push({name:'白虎大殺',desc:SINSAL_DESC['白虎大殺']});}}
if(jijiGroup){const samjae=SINSAL['三災'][jijiGroup];const hasSamjae=samjae.some((ji)=>jijiList.includes(ji));if(hasSamjae){results.bad.push({name:'三災',desc:SINSAL_DESC['三災']});}}
results.good=Array.from(new Set(results.good.map(JSON.stringify))).map(JSON.parse);results.bad=Array.from(new Set(results.bad.map(JSON.stringify))).map(JSON.parse);results.special=Array.from(new Set(results.special.map(JSON.stringify))).map(JSON.parse);return results;}
function calculateDaeun(birthYear,gender,yearGan,monthGan,monthJiji){const isYangMale=gender==='male'&&CHEONGAN_YINYANG[yearGan]==='陽';const isYinFemale=gender==='female'&&CHEONGAN_YINYANG[yearGan]==='陰';const isForward=isYangMale||isYinFemale;const startAge=3;const ganIndex=CHEONGAN.indexOf(monthGan);const jijiIndex=JIJI.indexOf(monthJiji);const daeunList=[];for(let i=0;i<15;i++){const age=startAge+i*10;let newGanIndex,newJijiIndex;if(isForward){newGanIndex=(ganIndex+i+1)%10;newJijiIndex=(jijiIndex+i+1)%12;}else{newGanIndex=(ganIndex-i-1+10)%10;newJijiIndex=(jijiIndex-i-1+12)%12;}
daeunList.push({age:age,endAge:Math.min(age+9,151),gan:CHEONGAN[newGanIndex],jiji:JIJI[newJijiIndex],year:birthYear+age-1,});}
return daeunList;}
function calculateYeonun(birthYear){const yeonunList=[];for(let age=1;age<=111;age++){const year=birthYear+age-1;const yearGan=getYearCheongan(year);const yearJi=getYearJiji(year);yeonunList.push({age:age,year:year,gan:yearGan,ji:yearJi,});}
return yeonunList;}
function calculateWolun(currentYear){const wolunList=[];for(let yearOffset=-1;yearOffset<=1;yearOffset++){const year=currentYear+yearOffset;const yearGan=getYearCheongan(year);for(let month=1;month<=12;month++){const monthGan=getMonthCheongan(yearGan,month);const monthJi=JIJI[(month+1)%12];wolunList.push({year:year,month:month,gan:monthGan,zhi:monthJi,});}}
return wolunList;}
function calculateSewun(){const currentYear=new Date().getFullYear();const yearGan=getYearCheongan(currentYear);const yearJi=getYearJiji(currentYear);return{year:currentYear,gan:yearGan,ji:yearJi,napeum:getNapeum(yearGan,yearJi),};}
function analyzeElements(saju){const elements={木:0,火:0,土:0,金:0,水:0};Object.values(saju.cheongan).forEach((gan)=>{if(gan&&CHEONGAN_ELEMENT[gan]){elements[CHEONGAN_ELEMENT[gan]]+=2;}});Object.values(saju.jiji).forEach((ji)=>{if(ji&&JIJI_ELEMENT[ji]){elements[JIJI_ELEMENT[ji]]+=3;}});Object.values(saju.jiji).forEach((ji)=>{if(ji&&JIJANGGAN[ji]){JIJANGGAN[ji].forEach((item)=>{elements[item.element]+=item.strength/100;});}});return elements;}
function analyzeYinYang(saju){let yang=0,yin=0;Object.values(saju.cheongan).forEach((gan)=>{if(gan&&CHEONGAN_YINYANG[gan]){CHEONGAN_YINYANG[gan]==='陽'?yang++:yin++;}});Object.values(saju.jiji).forEach((ji)=>{if(ji&&JIJI_YINYANG[ji]){JIJI_YINYANG[ji]==='陽'?yang++:yin++;}});return{yang,yin};}
function analyzeSipseong(dayGan,saju){const counts={比劫:0,食傷:0,財星:0,官星:0,印星:0};const detailedCounts={比肩:0,劫財:0,食神:0,傷官:0,偏財:0,正財:0,偏官:0,正官:0,偏印:0,正印:0,};const cheonganValues=Object.values(saju.cheongan).filter((v)=>v!==null);const jijiValues=Object.values(saju.jiji).filter((v)=>v!==null);cheonganValues.forEach((gan)=>{if(gan){const sipseong=getSipseongFromGan(dayGan,gan);counts[sipseong]++;const sipseongDetailed=getSipseongFromGanDetailed(dayGan,gan);detailedCounts[sipseongDetailed]++;}});jijiValues.forEach((ji)=>{if(ji&&JIJANGGAN[ji]){const hongi=JIJANGGAN[ji].find((j)=>j.type==='본기'||j.type==='정기');if(hongi){const sipseong=getSipseongFromGan(dayGan,hongi.gan);counts[sipseong]++;const sipseongDetailed=getSipseongFromGanDetailed(dayGan,hongi.gan);detailedCounts[sipseongDetailed]++;}}});return{counts,detailedCounts};}
function analyzeSibiun(dayGan,saju){const data=SIBIUNTEONG[dayGan];return{year:saju.jiji.year?data[saju.jiji.year]:null,month:saju.jiji.month?data[saju.jiji.month]:null,day:saju.jiji.day?data[saju.jiji.day]:null,hour:saju.jiji.hour?data[saju.jiji.hour]:null,};}
function analyzeSaju(){const name=document.getElementById('name').value.trim();if(!name){alert('성명을 입력해주세요.');return;}
const gender=document.querySelector('input[name="gender"]:checked').value;const calendar=document.querySelector('input[name="calendar"]:checked').value;const isYundal=document.getElementById('yundal').checked;let year=parseInt(document.getElementById('year').value);let month=parseInt(document.getElementById('month').value);let day=parseInt(document.getElementById('day').value);if(!year||!month||!day){alert('생년월일을 모두 입력해주세요.');return;}
if(year<1900||year>2100||month<1||month>12||day<1||day>31){alert('올바른 범위의 생년월일을 입력해주세요.');return;}
const timeInputType=document.querySelector('input[name="timeInputType"]:checked').value;let hour=-1;let minute=0;let hourJi='';let hasHourInfo=false;let timeType='normal';if(timeInputType==='ganji'){const selectedJi=document.getElementById('hour-ji-select').value;console.log('🔍 간지 입력 모드 활성화');console.log('   선택된 지지:',selectedJi);console.log('   선택된 지지 타입:',typeof selectedJi);console.log('   빈 문자열 체크:',selectedJi==='');console.log('   미상 체크:',selectedJi==='미상');if(selectedJi&&selectedJi!=='미상'){console.log('✅ 유효한 지지 선택됨');if(selectedJi==='子'){hourJi='子';hour=23;minute=30;timeType='zi_ganji';console.log('→ 子時 (간지입력) 선택: hour=23, minute=30, timeType=zi_ganji');}else if(selectedJi==='子-夜'){hourJi='子';hour=23;minute=30;timeType='night_zi';console.log('→ 夜子時 선택: hour=23, minute=30, timeType=night_zi');}else if(selectedJi==='子-朝'){hourJi='子';hour=0;minute=30;timeType='morning_zi';console.log('→ 朝子時 선택: hour=0, minute=30, timeType=morning_zi');}else{hourJi=selectedJi;hour=getHourFromJiji(selectedJi);minute=30;timeType='normal';console.log('→ 기타 지지 선택:',selectedJi,'hour=',hour);}
hasHourInfo=true;console.log('✅ hasHourInfo = true 설정 완료');}else{console.log('❌ 지지가 선택되지 않음 또는 미상');}}else if(timeInputType==='time'){const hourInput=document.getElementById('hour').value;const minuteInput=document.getElementById('minute').value;if(hourInput!==''){hour=parseInt(hourInput);minute=minuteInput?parseInt(minuteInput):0;if(hour<0||hour>23||minute<0||minute>59){alert('시각은 0-23시, 분은 0-59분 사이로 입력해주세요.');return;}
hasHourInfo=true;timeType='normal';}}
if(!hasHourInfo){const confirmMsg='출생시각 정보가 없습니다.\n시주(時柱) 분석은 제외되지만, 나머지 분석은 가능합니다.\n계속하시겠습니까?';if(!confirm(confirmMsg)){return;}
hour=12;minute=0;timeType='normal';}
if(timeInputType==='time'&&hasHourInfo){const isZiTime=(hour==23&&minute>=30)||hour==0||(hour==1&&minute<=29);if(isZiTime&&!timeType){timeType='normal';}else if(!timeType){timeType='normal';}}
const birthDatetime=`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;console.log('📅 생성된 birthDatetime:',birthDatetime);console.log('⏰ hour:',hour,'minute:',minute);console.log('🔧 timeType:',timeType);let calendarType='solar';if(calendar==='lunar'){calendarType=isYundal?'leap':'lunar';}
console.log('📋 API 호출 파라미터:');console.log('   birth_datetime:',birthDatetime);console.log('   calendar_type:',calendarType);console.log('   time_type:',timeType);SajuAPI.calcSaju(birthDatetime,calendarType,timeType).then((apiResult)=>{console.log('Python API 사주 결과:',apiResult);console.log('시간 타입:',timeType);const yearGan=apiResult.year[0];const yearJi=apiResult.year[1];const monthGan=apiResult.month[0];const monthJi=apiResult.month[1];const dayGan=apiResult.day[0];const dayJi=apiResult.day[1];const hourGan=hasHourInfo?apiResult.hour[0]:null;const hourJi=hasHourInfo?apiResult.hour[1]:null;const saju={name:name,gender:gender,calendar:calendar,isYundal:isYundal,hasHourInfo:hasHourInfo,birthDate:{year,month,day,hour:hasHourInfo?hour:null,minute:hasHourInfo?minute:null,},cheongan:{year:yearGan,month:monthGan,day:dayGan,hour:hourGan,},jiji:{year:yearJi,month:monthJi,day:dayJi,hour:hourJi},lunar:apiResult.lunar||'',solarConverted:apiResult.solar_converted||'',apiInfo:apiResult.info||{},};const strength=analyzeSajuStrength(dayGan,saju);const gyeokguk=analyzeGyeokguk(dayGan,saju,strength);const yongsin=analyzeYongsin(dayGan,saju,strength,gyeokguk);const elements=analyzeElements(saju);const yinyang=analyzeYinYang(saju);const sipseongResult=analyzeSipseong(dayGan,saju);const sibiun=analyzeSibiun(dayGan,saju);const yukchin=analyzeYukchin(dayGan,saju,gender);const hap=analyzeHap(saju);const hyungchung=analyzeHyungChung(saju);const sinsal=analyzeSinsal(saju,yearGan,dayGan);const sipseong=sipseongResult.counts;const sipseongDetailed=sipseongResult.detailedCounts;const hyungchungEnhanced=window.SajuSinsalExtended.analyzeHyungChungEnhanced(saju);const sibiSinsal=window.SajuSinsalExtended.analyzeSibiSinsal(saju);const gilsin=window.SajuSinsalExtended.analyzeGilsin(saju,dayGan);const extraSinsal=window.SajuSinsalExtended.analyzeExtraSinsal(saju,dayGan);const sewun=calculateSewun();document.getElementById('result-section').classList.remove('hidden');const resultWrap=document.getElementById('resultWrap');if(resultWrap){resultWrap.classList.remove('hidden');}
displayUserInfo(saju,'');displayBasicSaju(saju,sibiun,yearGan,yearJi,dayGan,hap,hyungchung,sinsal,hyungchungEnhanced,sibiSinsal,gilsin,extraSinsal);displayDayMaster(dayGan);displayStrength(strength);displayGyeokguk(gyeokguk);displayYongsin(yongsin);displayElements(elements);displayYinYang(yinyang);displayJijanggan(saju);displaySipseong(sipseong,sipseongDetailed);displaySibiunDetail(sibiun);displayYukchin(yukchin);displayHap(hap);displayHyungChungEnhanced(hyungchungEnhanced);displaySinsal(sinsal);displayGongmangDetail(saju,yearGan,yearJi);displaySpecialSinsal(sinsal);displaySibiSinsal(sibiSinsal);displayGilsin(gilsin);displayExtraSinsal(extraSinsal);displaySewun(sewun,dayGan);displayComprehensive(saju,dayGan,strength,gyeokguk,yongsin,elements,sibiun);displayGaewun(yongsin,strength);let daeuBirthDatetime=birthDatetime;if(calendarType!=='solar'&&apiResult.info&&apiResult.info.birth){daeuBirthDatetime=apiResult.info.birth;console.log('🔄 대운 계산: 음력→양력 변환된 날짜 사용:',daeuBirthDatetime);}else{console.log('✅ 대운 계산: 양력 날짜 그대로 사용:',daeuBirthDatetime);}
const currentDate=new Date();const currentYear=currentDate.getFullYear();const yearRange=110;Promise.allSettled([SajuAPI.calcDaeun(daeuBirthDatetime,gender,monthGan,monthJi,'solar'),SajuAPI.calcYeonun(year,year+55,yearRange),SajuAPI.calcWolun(currentYear)]).then((serverResults)=>{const[daeunResult,yeonunResult,wolunResult]=serverResults;if(daeunResult.status==='rejected'){console.error('대운 계산 오류:',daeunResult.reason);}
if(yeonunResult.status==='rejected'){console.error('연운 계산 오류:',yeonunResult.reason);}
if(wolunResult.status==='rejected'){console.error('월운 계산 오류:',wolunResult.reason);}
const daeun=daeunResult.status==='fulfilled'?daeunResult.value:[];const yeonun=yeonunResult.status==='fulfilled'?yeonunResult.value:[];const wolun=wolunResult.status==='fulfilled'?wolunResult.value:[];window.lastYeonunResult=yeonun;console.log('✅ 전역 변수에 년운 데이터 저장:',yeonun.length,'개');console.log('Python API 대운 결과:',daeun);console.log('Python API 연운 결과:',yeonun);console.log('Python API 월운 결과:',wolun);console.log('월운 데이터 타입:',typeof wolun);if(wolun&&wolun.length>0){console.log('첫 번째 월운 gan:',wolun[0].gan,'zhi:',wolun[0].zhi);}
displayDaeun(daeun,dayGan,saju.birthDate.year);const existingYeonun=document.querySelector('.yeonun-container');const existingWolun=document.getElementById('wolun-container');if(existingYeonun)existingYeonun.remove();if(existingWolun)existingWolun.remove();const yeonunHTML=displayYeonun(yeonun);const wolunHTML=displayWolun(wolun);document.getElementById('daeun-summary').insertAdjacentHTML('afterend',yeonunHTML+wolunHTML);autoTriggerDaeun(saju.birthDate.year,daeun);});}).catch((error)=>{console.error('사주 계산 오류:',error);let errorMessage='사주 계산 중 오류가 발생했습니다.\n\n';if(error.message.includes('시간 초과')||error.message.includes('timeout')||error.message.includes('TIMED_OUT')){errorMessage+='⏰ 서버 응답 시간 초과\n\n';errorMessage+='서버가 응답하는 데 시간이 너무 오래 걸렸습니다.\n';errorMessage+='다음을 확인해주세요:\n';errorMessage+='1. 서버가 정상적으로 실행 중인지\n';errorMessage+='2. 네트워크 연결 상태\n';errorMessage+='3. 잠시 후 다시 시도\n\n';}else if(error.message.includes('Failed to fetch')||error.message.includes('네트워크')){errorMessage+='🌐 네트워크 오류\n\n';errorMessage+='서버에 연결할 수 없습니다.\n';errorMessage+='Flask 서버가 실행 중인지 확인해주세요.\n\n';}else{errorMessage+='오류 내용: '+error.message+'\n\n';errorMessage+='Flask 서버가 실행 중인지 확인해주세요.';}
alert(errorMessage);});}
function displayUserInfo(saju,calendarWarning){const genderText=saju.gender==='male'?'남자 (乾命)':'여자 (坤命)';const inputCalendarText=saju.calendar==='solar'?'양력 (陽曆)':`음력 (陰曆)${saju.isYundal ? ' - 윤달' : ''}`;const inputBirthDateText=`${saju.birthDate.year}년 ${saju.birthDate.month}월 ${saju.birthDate.day}일`;let lunarInfoText='';let solarInfoText='';if(saju.calendar==='solar'){if(saju.lunar){lunarInfoText=saju.lunar;}}else{if(saju.solarConverted){solarInfoText=saju.solarConverted;}}
const hourText=saju.hasHourInfo?saju.birthDate.hour!==null?`${saju.birthDate.hour}시 ${
          saju.birthDate.minute !== null ? saju.birthDate.minute + '분' : ''
        }`:`${saju.jiji.hour}시`:'시각 미상';const today=new Date();const currentYear=today.getFullYear();let age=currentYear-saju.birthDate.year+1;const resultSection=document.getElementById('result-section');const existingInfo=document.getElementById('user-info-display');if(existingInfo){existingInfo.remove();}
let warningHTML='';if(calendarWarning){warningHTML=`
            <div style="background:#ffebee;padding:15px;border-radius:10px;margin-top:15px;border-left:4px solid #f44336;">
                <p style="color:#c62828;font-weight:700;margin:0;">${calendarWarning}</p>
            </div>
        `;}
let hourWarningHTML='';if(!saju.hasHourInfo){hourWarningHTML=`
            <div style="background:#e3f2fd;padding:15px;border-radius:10px;margin-top:15px;border-left:4px solid #2196F3;">
                <p style="color:#1565c0;font-weight:700;margin:0;">ℹ️ 출생시각 정보가 없어 시주(時柱) 분석은 제외되었습니다.</p>
            </div>
        `;}
let calendarInfoHTML='';if(saju.calendar==='solar'){calendarInfoHTML=`
            <div style="background:white;padding:12px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <div style="color:#6c757d;font-size:0.85em;margin-bottom:4px;">陽曆 (입력)</div>
                <div style="font-weight:700;font-size:1em;color:#2a5298;">${inputBirthDateText}</div>
            </div>
            ${
              lunarInfoText
                ? `<div style="background:white;padding:12px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><div style="color:#6c757d;font-size:0.85em;margin-bottom:4px;">陰曆(변환)</div><div style="font-weight:700;font-size:1em;color:#2a5298;">${lunarInfoText}</div></div>`
                : ''
            }
        `;}else{calendarInfoHTML=`
            <div style="background:white;padding:12px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <div style="color:#6c757d;font-size:0.85em;margin-bottom:4px;">陰曆 (입력)</div>
                <div style="font-weight:700;font-size:1em;color:#2a5298;">${inputBirthDateText}${
      saju.isYundal ? ' 윤달' : ''
    }</div>
            </div>
            ${
              solarInfoText
                ? `<div style="background:white;padding:12px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><div style="color:#6c757d;font-size:0.85em;margin-bottom:4px;">陽曆(변환)</div><div style="font-weight:700;font-size:1em;color:#2a5298;">${solarInfoText}</div></div>`
                : ''
            }
        `;}
const infoHTML=`
        <div id="user-info-display" style="background:linear-gradient(135deg,#fff9e6 0%,#fff3cd 100%);padding:20px;border-radius:15px;margin-bottom:30px;border:3px solid #ffc107;box-shadow:0 8px 25px rgba(255,193,7,0.3);max-width:900px;margin-left:auto;margin-right:auto;">
            <div style="text-align:center;">
                <h3 style="font-size:1.8em;color:#f57c00;margin-bottom:12px;font-weight:900;">${saju.name} (${age}세)</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:15px;">
                    <div style="background:white;padding:12px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                        <div style="color:#6c757d;font-size:0.85em;margin-bottom:4px;">性別</div>
                        <div style="font-weight:700;font-size:1em;color:#2a5298;">${genderText}</div>
                    </div>
                    ${calendarInfoHTML}
                    <div style="background:white;padding:12px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                        <div style="color:#6c757d;font-size:0.85em;margin-bottom:4px;">出生時刻</div>
                        <div style="font-weight:700;font-size:1em;color:#2a5298;">${hourText}</div>
                    </div>
                </div>
            </div>
            ${warningHTML}
            ${hourWarningHTML}
        </div>
    `;resultSection.insertAdjacentHTML('afterbegin',infoHTML);}
function getElementClass(element){const map={木:'wood',火:'fire',土:'earth',金:'metal',水:'water'};return map[element]||'';}
function displayBasicSaju(saju,sibiun,yearGan,yearJi,dayGan,hap,hyungchung,sinsal,hyungchungEnhanced,sibiSinsal,gilsin,extraSinsal){const pillars=saju.hasHourInfo?['year','month','day','hour']:['year','month','day'];const ganList=Object.values(saju.cheongan).filter((g)=>g!==null);const jiList=Object.values(saju.jiji).filter((j)=>j!==null);pillars.forEach((pillar,idx)=>{const gan=ganList[idx];const ji=jiList[idx];let ganSipseong='';let ganElement='';if(gan&&gan!==dayGan){ganSipseong=getSipseongFromGanDetailed(dayGan,gan);ganElement=CHEONGAN_ELEMENT[gan];}else if(gan===dayGan){if(pillar==='day'){ganSipseong='日干';}else{ganSipseong='比肩';}
ganElement=CHEONGAN_ELEMENT[gan];}
let jiSipseong='';let jiElement='';if(ji&&JIJANGGAN[ji]){const hongi=JIJANGGAN[ji].find((j)=>j.type==='본기'||j.type==='정기');if(hongi){const mainGan=hongi.gan;jiElement=JIJI_ELEMENT[ji];if(mainGan!==dayGan){jiSipseong=getSipseongFromGanDetailed(dayGan,mainGan);}else{jiSipseong='比肩';}}}
const ganLabel=ganSipseong?`${ganSipseong}(${ganElement})`:'';const jiLabel=jiSipseong?`${jiSipseong}(${jiElement})`:'';const ganEl=document.getElementById(`${pillar}-gan`);if(ganEl&&gan){ganEl.innerHTML=`
                <div style="font-size:0.5em;color:#555;font-weight:600;margin-bottom:3px;line-height:1.2;">${ganLabel}</div>
                <div style="font-size:1.5em;">${gan}</div>
            `;ganEl.className='gan-box '+getElementClass(CHEONGAN_ELEMENT[gan]);}
const jiEl=document.getElementById(`${pillar}-ji`);if(jiEl&&ji){jiEl.innerHTML=`
                <div style="font-size:1.5em;">${ji}</div>
                <div style="font-size:0.5em;color:#555;font-weight:600;margin-top:3px;line-height:1.2;">${jiLabel}</div>
            `;jiEl.className='ji-box '+getElementClass(JIJI_ELEMENT[ji]);}
const sibiunEl=document.getElementById(`${pillar}-sibiun`);if(sibiunEl&&sibiun[pillar]){sibiunEl.textContent=sibiun[pillar];}
const napeumEl=document.getElementById(`${pillar}-napeum`);if(napeumEl&&gan&&ji){const napeum=getNapeum(gan,ji);napeumEl.textContent=napeum.full;}
const gongmangEl=document.getElementById(`${pillar}-gongmang`);if(gongmangEl&&ji){const isGongmang=getGongmang(yearGan,yearJi,ji);gongmangEl.textContent=isGongmang?'⚠️ 공망':'✓';gongmangEl.className=isGongmang?'gongmang-info':'gongmang-info empty';}});if(!saju.hasHourInfo){const hourCard=document.querySelector('.pillar-card:first-child');if(hourCard){hourCard.style.opacity='0.3';hourCard.style.pointerEvents='none';const hourTitle=hourCard.querySelector('.pillar-title');if(hourTitle){hourTitle.innerHTML='時柱 (시주)<br><small style="font-size:0.7em;color:#e53935;">시각 미상</small>';}}}
const elementCount={木:0,火:0,土:0,金:0,水:0};ganList.forEach((gan)=>{if(gan){const element=CHEONGAN_ELEMENT[gan];elementCount[element]++;}});jiList.forEach((ji)=>{if(ji){const element=JIJI_ELEMENT[ji];elementCount[element]++;}});const elementSummary=Object.keys(elementCount).map((el)=>`${el}(${elementCount[el]})`).join(', ');const pillarNames={year:'년주',month:'월주',day:'일주',hour:'시주',};const pillarOrder=['hour','day','month','year'];let jijangganSummary='';pillarOrder.forEach((pillar)=>{const idx=pillars.indexOf(pillar);if(idx!==-1){const ji=jiList[idx];if(ji&&JIJANGGAN[ji]){const jijangganList=JIJANGGAN[ji];const ganStr=jijangganList.map((item)=>item.gan).join('');jijangganSummary+=`${pillarNames[pillar]}: ${ganStr}　`;}}});const summaryEl=document.getElementById('pillar-element-summary');if(summaryEl){let additionalInfo='';additionalInfo+=`<div id="element-summary-header" style="margin-bottom:8px;cursor:pointer;padding:5px;border-radius:5px;transition:background 0.2s;" onmouseover="this.style.background='#e3f2fd'" onmouseout="this.style.background='transparent'" onclick="document.getElementById('element-summary-details').style.display = document.getElementById('element-summary-details').style.display === 'none' ? 'block' : 'none';">
      <span style="color:#666;">🔍 오행:</span> ${elementSummary} <span style="color:#999;font-size:0.8em;">(클릭:神殺보기)</span>
    </div>`;additionalInfo+=`<div id="element-summary-details" style="display:none;padding-left:10px;border-left:3px solid #e0e0e0;">`;additionalInfo+=`<div style="margin-bottom:8px;font-size:0.9em;color:#888;"><span style="color:#666;">지장간:</span> ${jijangganSummary}</div>`;if(hap){let hapSummary='';let hapDetails=[];if(hap.cheonganHap&&hap.cheonganHap.length>0){hap.cheonganHap.forEach((h)=>{hapDetails.push(`${h.pair} → ${h.result}`);});}
if(hap.jijiHap&&hap.jijiHap.length>0){hap.jijiHap.forEach((h)=>{hapDetails.push(`${h.name}(${h.pair})`);});}
if(hap.samhap&&hap.samhap.length>0){hap.samhap.forEach((s)=>{if(s.pattern){const completeText=s.complete?'완성':'반합';hapDetails.push(`${s.type || '삼합'}(${s.pattern}) ${completeText}`);}});}
if(hapDetails.length>0){hapSummary=hapDetails.join(', ');additionalInfo+=`<div style="margin-bottom:8px;font-size:0.9em;"><span style="color:#666;">合 (합):</span> <span style="color:#4caf50;">${hapSummary}</span></div>`;}else{additionalInfo+=`<div style="margin-bottom:8px;font-size:0.9em;color:#999;"><span style="color:#666;">合 (합):</span> 없음</div>`;}}
if(hyungchungEnhanced){if(hyungchungEnhanced.chung.length===0&&hyungchungEnhanced.hyung.length===0&&hyungchungEnhanced.pa.length===0&&hyungchungEnhanced.hae.length===0&&hyungchungEnhanced.wongjin.length===0){additionalInfo+=`<div style="margin-bottom:8px;font-size:0.9em;color:#999;"><span style="color:#666;">刑沖破害:</span> 없음 (안정적)</div>`;}else{const items=[];if(hyungchungEnhanced.chung.length>0){const chungItems=hyungchungEnhanced.chung.map((c)=>c.name).join(', ');items.push(`<span style="color:#d32f2f;">충(沖): ${chungItems}</span>`);}
if(hyungchungEnhanced.hyung.length>0){const hyungItems=hyungchungEnhanced.hyung.map((h)=>h.name).join(', ');items.push(`<span style="color:#c62828;">형(刑): ${hyungItems}</span>`);}
if(hyungchungEnhanced.pa.length>0){const paItems=hyungchungEnhanced.pa.map((p)=>p.name).join(', ');items.push(`<span style="color:#e64a19;">파(破): ${paItems}</span>`);}
if(hyungchungEnhanced.hae.length>0){const haeItems=hyungchungEnhanced.hae.map((h)=>h.name).join(', ');items.push(`<span style="color:#f57c00;">해(害): ${haeItems}</span>`);}
if(hyungchungEnhanced.wongjin.length>0){const wonjinItems=hyungchungEnhanced.wongjin.map((w)=>w.pair).join(', ');items.push(`<span style="color:#5d4037;">원진(怨嗔): ${wonjinItems}</span>`);}
if(items.length>0){additionalInfo+=`<div style="margin-bottom:8px;font-size:0.9em;"><span style="color:#666;">刑沖破害:</span> ${items.join(
            ' / '
          )}</div>`;}}}
if(sinsal){let sinsalSummary='';if(sinsal.good.length>0){sinsalSummary+='길신: '+sinsal.good.map((s)=>s.name).join(', ');}
if(sinsal.bad.length>0){if(sinsalSummary)sinsalSummary+=' / ';sinsalSummary+='흉신: '+sinsal.bad.map((s)=>s.name).join(', ');}
if(sinsalSummary){additionalInfo+=`<div style="margin-bottom:8px;font-size:0.9em;"><span style="color:#666;">神殺:</span> ${sinsalSummary}</div>`;}}
const gongmangJi=[];jiList.forEach((ji)=>{if(ji){const isGongmang=getGongmang(yearGan,yearJi,ji);if(isGongmang){gongmangJi.push(ji);}}});if(gongmangJi.length>0){additionalInfo+=`<div style="margin-bottom:8px;font-size:0.9em;"><span style="color:#666;">空亡:</span> <span style="color:#ff9800;">${gongmangJi.join(
        ', '
      )}</span></div>`;}else{additionalInfo+=`<div style="margin-bottom:8px;font-size:0.9em;color:#999;"><span style="color:#666;">空亡:</span> 없음</div>`;}
if(sinsal){const specialSinsal=[];sinsal.good.forEach((s)=>{if(['天乙貴人','學堂貴人'].includes(s.name)){specialSinsal.push(s.name);}});sinsal.bad.forEach((s)=>{if(['桃花殺','驛馬殺','三災','白虎大殺'].includes(s.name)){specialSinsal.push(s.name);}});if(specialSinsal.length>0){additionalInfo+=`<div style="margin-bottom:8px;font-size:0.9em;"><span style="color:#666;">특수 神殺:</span> ${specialSinsal.join(
          ', '
        )}</div>`;}}
if(hyungchungEnhanced){additionalInfo+=generateHyungChungSummary(hyungchungEnhanced);}
if(sibiSinsal&&sibiSinsal.length>0){additionalInfo+=generateSibiSinsalSummary(sibiSinsal);}
if(gilsin&&gilsin.length>0){additionalInfo+=generateGilsinSummary(gilsin);}
if(extraSinsal&&extraSinsal.length>0){additionalInfo+=generateExtraSinsalSummary(extraSinsal);}
additionalInfo+=`</div>`;summaryEl.innerHTML=additionalInfo;}}
function displayDayMaster(dayGan){const el=CHEONGAN_ELEMENT[dayGan];const html=`
        <div class="daymaster-info">
            <div class="daymaster-title">
                <span class="gan-box ${getElementClass(
                  el
                )}" style="display:inline-block;padding:10px 20px;margin-right:10px;">${dayGan}</span>
                일간 (본인의 핵심)
            </div>
            <div class="daymaster-desc">
                <p><strong>▶ 기본 특성:</strong> ${
                  DAYMASTER_CHARACTERISTICS[dayGan]
                }</p>
                <p><strong>▶ 오행:</strong> ${el}(${getElementClass(el)}) - ${
    ELEMENT_DESC[el]
  }</p>
                <p><strong>▶ 음양:</strong> ${CHEONGAN_YINYANG[dayGan]} - ${
    CHEONGAN_YINYANG[dayGan] === '陽'
      ? '적극적이고 외향적인 기질'
      : '차분하고 내면적인 기질'
  }</p>
            </div>
        </div>
    `;document.getElementById('daymaster-analysis').innerHTML=html;}
function displayStrength(strength){const html=`
        <div class="strength-result">
            <div class="strength-level">${strength.level}</div>
            <div class="strength-desc">${strength.desc}</div>
        </div>
        <div class="strength-detail">
            <p><strong>▶ 강약 점수:</strong> ${strength.score.toFixed(
              1
            )}점 / 60점</p>
            <p><strong>▶ 해석:</strong> ${
              strength.score >= 35
                ? '일간이 강하여 자신감과 추진력이 있으나, 독선적이지 않도록 주의해야 합니다.'
                : strength.score >= 25
                ? '일간이 균형 잡혀 있어 가장 이상적입니다. 다양한 분야에서 능력을 발휘할 수 있습니다.'
                : '일간이 약하여 도움이 필요합니다. 협력자를 만나고 자기계발에 힘써야 합니다.'
            }</p>
        </div>
    `;document.getElementById('strength-analysis').innerHTML=html;}
function displayGyeokguk(gyeokguk){const html=`
        <div class="gyeokguk-result">
            <div class="gyeokguk-name">${gyeokguk.name}</div>
            <div class="gyeokguk-desc">${gyeokguk.desc}</div>
        </div>
    `;document.getElementById('gyeokguk-analysis').innerHTML=html;}
function displayYongsin(yongsin){const html=`
        <div class="yongsin-result">
            <div class="yongsin-item yongsin">
                <div class="yongsin-label">用神 (용신)</div>
                <div class="yongsin-value">${yongsin.yongsin}</div>
                <div class="yongsin-meaning">가장 필요한 기운</div>
            </div>
            <div class="yongsin-item huisin">
                <div class="yongsin-label">喜神 (희신)</div>
                <div class="yongsin-value">${yongsin.huisin}</div>
                <div class="yongsin-meaning">용신을 돕는 기운</div>
            </div>
            <div class="yongsin-item gisin">
                <div class="yongsin-label">忌神 (기신)</div>
                <div class="yongsin-value">${yongsin.gisin}</div>
                <div class="yongsin-meaning">피해야 할 기운</div>
            </div>
        </div>
        <div class="yongsin-detail">
            <p><strong>▶ 용신 활용법:</strong> ${yongsin.desc}</p>
            <p><strong>▶ 실생활 적용:</strong></p>
            <ul style="margin-top:10px;line-height:1.8;">
                <li>용신(${yongsin.yongsin})에 해당하는 색상, 방향, 직업을 선택하세요</li>
                <li>희신(${yongsin.huisin})으로 용신을 보조하면 더욱 좋습니다</li>
                <li>기신(${yongsin.gisin})은 가능한 피하거나 최소화하세요</li>
            </ul>
        </div>
    `;document.getElementById('yongsin-analysis').innerHTML=html;}
function displayElements(elements){const total=Object.values(elements).reduce((a,b)=>a+b,0);const names={木:'木(목)',火:'火(화)',土:'土(토)',金:'金(금)',水:'水(수)',};let chartHTML='';Object.keys(elements).forEach((el)=>{const count=elements[el].toFixed(1);const pct=total>0?((elements[el]/total)*100).toFixed(1):0;chartHTML+=`
            <div class="element-bar">
                <div class="element-label">${names[el]}</div>
                <div class="element-bar-bg">
                    <div class="element-bar-fill ${getElementClass(
                      el
                    )}" style="width:${pct}%">${count}</div>
                </div>
            </div>
        `;});const max=Object.keys(elements).reduce((a,b)=>elements[a]>elements[b]?a:b);const min=Object.keys(elements).reduce((a,b)=>elements[a]<elements[b]?a:b);const summaryHTML=`
        <strong>▶ 분포:</strong> ${names[max]}이(가) ${elements[max].toFixed(
    1
  )}로 가장 많고, 
        ${names[min]}이(가) ${elements[min].toFixed(1)}로 가장 적습니다.<br><br>
        <strong>▶ 특성:</strong> ${ELEMENT_DESC[max]}
    `;document.getElementById('element-chart').innerHTML=chartHTML;document.getElementById('element-summary').innerHTML=summaryHTML;}
function displayYinYang(yinyang){const total=yinyang.yang+yinyang.yin;const yangPct=((yinyang.yang/total)*100).toFixed(1);const chartHTML=`
        <div class="yinyang-circle yang-circle">
            <div class="yinyang-label">陽(양)</div>
            <div class="yinyang-count">${yinyang.yang}</div>
        </div>
        <div class="yinyang-circle yin-circle">
            <div class="yinyang-label">陰(음)</div>
            <div class="yinyang-count">${yinyang.yin}</div>
        </div>
    `;let summary=`<strong>▶ 비율:</strong> 陽 ${yangPct}% / 陰 ${(
    100 - yangPct
  ).toFixed(1)}%<br><br>`;if(yinyang.yang>yinyang.yin+2){summary+='양의 기운이 강하여 적극적, 활동적, 외향적입니다. 리더십과 추진력이 뛰어나나 성급함을 경계해야 합니다.';}else if(yinyang.yin>yinyang.yang+2){summary+='음의 기운이 강하여 차분하고 내향적이며 사려 깊습니다. 인내심과 포용력이 뛰어나나 소극적이지 않도록 주의해야 합니다.';}else{summary+='음양의 균형이 잘 잡혀 있습니다. 상황에 따라 적극적이거나 신중할 수 있으며 조화로운 성격입니다.';}
document.getElementById('yinyang-chart').innerHTML=chartHTML;document.getElementById('yinyang-summary').innerHTML=summary;}
function displayJijanggan(saju){const pillars=['hour','day','month','year'];const names=['시지','일지','월지','년지'];let html='';pillars.forEach((p,idx)=>{const ji=saju.jiji[p];if(ji&&JIJANGGAN[ji]){const list=JIJANGGAN[ji];let ganHTML='';list.forEach((item)=>{ganHTML+=`
                    <div class="jijanggan-gan">
                        <span class="jijanggan-gan-name">${item.gan}</span>
                        <span class="jijanggan-gan-element ${getElementClass(
                          item.element
                        )}">${item.element}</span>
                    </div>
                `;});html+=`
                <div class="jijanggan-item">
                    <div class="jijanggan-title">${names[idx]} ${ji}</div>
                    <div class="jijanggan-gan-list">${ganHTML}</div>
                </div>
            `;}});document.getElementById('jijanggan-analysis').innerHTML=html;}
function displaySipseong(sipseong,sipseongDetailed){const meanings={比劫:'형제·친구·동료·경쟁',食傷:'표현·재능·자식·창의성',財星:'재물·배우자·실리·현실',官星:'직장·명예·권위·사회성',印星:'학문·어머니·지혜·학습',比肩:'형제·동료·평등·협력',劫財:'경쟁·분쟁·탈취·손실',食神:'재능·여유·복록·자식(딸)',傷官:'표현·예술·비판·자식(아들)',偏財:'유동재산·사업·활동·투자',正財:'고정재산·월급·안정·절약',偏官:'권력·승부·도전·군인·경찰',正官:'명예·직장·법·공무원·질서',偏印:'특수학문·예술·종교·의학',正印:'정규학문·어머니·명예·자격증',};if(sipseongDetailed){let itemHTML='';const groups={'比劫 (비겁)':['比肩','劫財'],'食傷 (식상)':['食神','傷官'],'財星 (재성)':['偏財','正財'],'官星 (관성)':['偏官','正官'],'印星 (인성)':['偏印','正印'],};Object.entries(groups).forEach(([groupName,stars])=>{const groupTotal=stars.reduce((sum,star)=>sum+(sipseongDetailed[star]||0),0);if(groupTotal>0){itemHTML+=`<div class="sipseong-group">`;itemHTML+=`<div class="sipseong-group-title">${groupName} (총 ${groupTotal}개)</div>`;stars.forEach((star)=>{const count=sipseongDetailed[star]||0;if(count>0){itemHTML+=`
              <div class="sipseong-item">
                  <div class="sipseong-name">${star}</div>
                  <div class="sipseong-count">${count}</div>
                  <div class="sipseong-meaning">${meanings[star]}</div>
              </div>
            `;}});itemHTML+=`</div>`;}});const maxStar=Object.keys(sipseongDetailed).reduce((a,b)=>sipseongDetailed[a]>sipseongDetailed[b]?a:b);const summary=`
      <strong>▶ 십성 분포:</strong> ${maxStar}이(가) ${
      sipseongDetailed[maxStar]
    }개로 가장 많습니다.<br><br>
      <strong>▶ 해석:</strong> ${getDetailedSipseongInterpretation(
        maxStar,
        sipseongDetailed
      )}
    `;document.getElementById('sipseong-analysis').innerHTML=itemHTML;document.getElementById('sipseong-summary').innerHTML=summary;}else{let itemHTML='';Object.keys(sipseong).forEach((star)=>{itemHTML+=`
              <div class="sipseong-item">
                  <div class="sipseong-name">${star}</div>
                  <div class="sipseong-count">${sipseong[star]}</div>
                  <div class="sipseong-meaning">${meanings[star]}</div>
              </div>
          `;});const max=Object.keys(sipseong).reduce((a,b)=>sipseong[a]>sipseong[b]?a:b);const summary=`
          <strong>▶ 십성 분포:</strong> ${max}이(가) ${
      sipseong[max]
    }개로 가장 많습니다.<br><br>
          <strong>▶ 해석:</strong> ${
            max === '比劫'
              ? '형제, 친구, 동료와의 인연이 깊고 경쟁 의식이 강합니다. 협력과 독립의 균형이 중요합니다.'
              : max === '食傷'
              ? '표현력과 재능이 뛰어나고 창의적입니다. 예술, 교육, 창작 분야에 적합합니다.'
              : max === '財星'
              ? '재물운이 강하고 현실적입니다. 사업이나 재테크에 관심이 많고 실속을 챙깁니다.'
              : max === '官星'
              ? '명예와 지위를 중시하고 조직생활에 적합합니다. 책임감이 강하고 원칙을 지킵니다.'
              : '학문과 지혜를 중시하고 어머니의 덕이 있습니다. 공부와 자격증 취득에 유리합니다.'
          }
    `;document.getElementById('sipseong-analysis').innerHTML=itemHTML;document.getElementById('sipseong-summary').innerHTML=summary;}}
function getDetailedSipseongInterpretation(maxStar,sipseongDetailed){const interpretations={比肩:'형제, 동료와의 인연이 깊고 독립심이 강합니다. 자존심이 강하고 협력보다는 독자적인 행동을 선호합니다.',劫財:'경쟁심이 강하고 활동력이 뛰어납니다. 재물의 유출입이 많고 변화를 추구하는 성향이 있습니다.',食神:'재능이 뛰어나고 여유로우며 복록이 있습니다. 평화를 좋아하고 봉사정신이 강합니다.',傷官:'표현력과 예술적 재능이 뛰어납니다. 창의적이고 독창적이나 때로 비판적일 수 있습니다.',偏財:'유동재산이 많고 사업 수완이 뛰어납니다. 활동적이고 사교성이 좋으며 투자에 관심이 많습니다.',正財:'고정적인 수입이 안정적이고 절약 정신이 강합니다. 성실하고 근면하며 재물 관리를 잘합니다.',偏官:'권력 지향적이고 승부욕이 강합니다. 도전을 즐기고 강한 추진력이 있으나 충동적일 수 있습니다.',正官:'명예와 지위를 중시하고 원칙을 지킵니다. 책임감이 강하고 조직생활에 매우 적합합니다.',偏印:'특수한 학문이나 예술, 종교, 의학 분야에 재능이 있습니다. 독창적이고 직관력이 뛰어납니다.',正印:'정규 학문에 뛰어나고 어머니의 덕이 큽니다. 품위있고 학습능력이 뛰어나며 자격증 취득에 유리합니다.',};return interpretations[maxStar]||'균형있는 십성 분포를 가지고 있습니다.';}
function displaySibiunDetail(sibiun){const pillars=['year','month','day','hour'];const names=['년주','월주','일주','시주'];let gridHTML='';pillars.forEach((p,idx)=>{if(sibiun[p]){gridHTML+=`
                <div class="sibiun-detail-item">
                    <div class="sibiun-name">${sibiun[p]}</div>
                    <div class="sibiun-pillar">${names[idx]}</div>
                    <div class="sibiun-desc">${
                      SIBIUNTEONG_DESC[sibiun[p]] || '정보 없음'
                    }</div>
                </div>
            `;}});const dayState=sibiun.day;const summary=`
        <div class="sibiunteong-summary">
            <strong>▶ 일주 십이운성:</strong> ${dayState} (가장 중요)<br><br>
            ${
              ['長生', '冠帶', '建祿', '帝旺'].includes(dayState)
                ? '현재 생명력이 왕성하고 활동력이 강합니다. 적극적으로 일을 추진하기 좋은 상태입니다.'
                : ['衰', '病', '死', '墓'].includes(dayState)
                ? '조심하고 신중해야 하는 시기입니다. 무리한 확장보다는 내실을 기하는 것이 좋습니다.'
                : '준비와 변화의 시기입니다. 새로운 시작을 위한 기반을 다지는 때입니다.'
            }
        </div>
    `;document.getElementById('sibiun-detail-analysis').innerHTML=gridHTML+summary;}
function displayYukchin(yukchin){let gridHTML='';Object.entries(yukchin).forEach(([relation,data])=>{gridHTML+=`
            <div class="yukchin-item">
                <div class="yukchin-title">${relation}</div>
                <div class="yukchin-content">
                    <p><strong>개수:</strong> ${data.count}개</p>
                    <p>${data.desc}</p>
                </div>
            </div>
        `;});const summary=`
        <div class="yukchin-summary">
            <strong>▶ 육친 종합:</strong><br>
            육친은 사주에서 인간관계를 나타냅니다. 
            각 육친의 개수가 적당하면 좋으나, 너무 많거나 없으면 그에 따른 특징이 나타납니다. 
            부족한 육친은 노력으로 보완하고, 많은 육친은 잘 활용하되 균형을 유지해야 합니다.
        </div>
    `;document.getElementById('yukchin-analysis').innerHTML=gridHTML+summary;}
function displayHap(hap){if(hap.cheonganHap.length===0&&hap.jijiHap.length===0&&hap.samhap.length===0){document.getElementById('hap-analysis').innerHTML='<div class="no-hap">사주에 특별한 합이 없습니다</div>';return;}
let html='';if(hap.cheonganHap.length>0){html+=`
            <div class="hap-section">
                <div class="hap-type">🤝 천간합(天干合)</div>
                <div class="hap-items">
                    ${hap.cheonganHap
                      .map(
                        (h) =>
                          `<div class="hap-item">${h.pair}(${h.name})→ ${h.result}</div>`
                      )
                      .join('')}
                </div>
                <div class="hap-desc">
                    천간이 합하여 조화와 협력의 기운이 있습니다. 인간관계가 원만하고 협력이 잘 됩니다. 
                    합이 되면 새로운 오행(${
                      hap.cheonganHap[0].result
                    })으로 변화합니다.
                </div>
            </div>
        `;}
if(hap.jijiHap.length>0){html+=`
            <div class="hap-section">
                <div class="hap-type">💫 지지 육합(地支六合)</div>
                <div class="hap-items">
                    ${hap.jijiHap
                      .map(
                        (h) =>
                          `<div class="hap-item">${h.pair}→ ${h.result}</div>`
                      )
                      .join('')}
                </div>
                <div class="hap-desc">
                    지지가 합하여 새로운 기운을 생성합니다. 변화와 발전의 계기가 될 수 있으며, 
                    결혼운이나 사업 파트너십에 유리합니다.
                </div>
            </div>
        `;}
if(hap.samhap.length>0){html+=`
            <div class="hap-section">
                <div class="hap-type">⭐ 三合(삼합)</div>
                <div class="hap-items">
                    ${hap.samhap
                      .map(
                        (h) =>
                          `<div class="hap-item">${h.pattern}→ ${h.name}${h.complete?'(완성)':'(반합)'}</div>`
                      )
                      .join('')}
                </div>
                <div class="hap-desc">
                    삼합은 가장 강력한 합의 기운입니다. ${
                      hap.samhap[0].result
                    } 오행의 힘이 크게 강화되어 
                    해당 분야에서 큰 성취가 가능합니다. ${
                      hap.samhap[0].complete
                        ? '완전한 삼합으로 매우 강력합니다.'
                        : '반합으로 완성되지 않았으나 영향력은 있습니다.'
                    }
                </div>
            </div>
        `;}
document.getElementById('hap-analysis').innerHTML=html;}
function displayHyungChungEnhanced(hyungchung){const container=document.getElementById('hyungchung-analysis');if(hyungchung.chung.length===0&&hyungchung.hyung.length===0&&hyungchung.pa.length===0&&hyungchung.hae.length===0&&hyungchung.wongjin.length===0){container.innerHTML=`
      <div style="text-align:center;padding:30px;background:linear-gradient(135deg,#e8f5e9 0%,#c8e6c9 100%);border-radius:15px;">
        <div style="font-size:3em;margin-bottom:10px;">✅</div>
        <div style="font-size:1.3em;font-weight:700;color:#2e7d32;">${hyungchung.summary}</div>
      </div>
    `;return;}
let html=`
    <div style="background:#fff3cd;padding:15px;border-radius:10px;margin-bottom:20px;border-left:4px solid #ff9800;">
      <div style="font-weight:700;font-size:1.1em;color:#e65100;">${hyungchung.summary}</div>
    </div>
  `;if(hyungchung.chung.length>0){html+=`
      <div style="margin-bottom:25px;background:white;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <div style="font-size:1.4em;font-weight:700;color:#d32f2f;margin-bottom:15px;border-bottom:3px solid #d32f2f;padding-bottom:10px;">
          ⚡ 충(沖) - 충돌과 변동
        </div>
        ${hyungchung.chung
          .map(
            (c) => `<div style="background:#ffebee;padding:15px;border-radius:10px;margin-bottom:12px;border-left:4px solid #d32f2f;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div style="font-size:1.2em;font-weight:700;color:#b71c1c;">${c.name}</div><div style="background:${c.severity==='중요'?'#d32f2f':'#ff9800'};color:white;padding:4px 12px;border-radius:20px;font-size:0.85em;">${c.severity}</div></div><div style="font-size:0.95em;color:#555;margin-bottom:8px;">${c.desc}</div>${c.impact?`<div style="background:#fff;padding:10px;border-radius:8px;color:#d32f2f;font-weight:600;">📍 ${c.impact}</div>`:''}<div style="margin-top:8px;color:#666;font-size:0.9em;">위치:${c.positions.map((p)=>{const names={year:'년주',month:'월주',day:'일주',hour:'시주',};return names[p];}).join(', ')}</div></div>`
          )
          .join('')}
      </div>
    `;}
if(hyungchung.hyung.length>0){html+=`
      <div style="margin-bottom:25px;background:white;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <div style="font-size:1.4em;font-weight:700;color:#c62828;margin-bottom:15px;border-bottom:3px solid #c62828;padding-bottom:10px;">
          ⚠️ 형(刑) - 형벌과 재난
        </div>
        ${hyungchung.hyung
          .map(
            (h) => `<div style="background:#ffe5e5;padding:15px;border-radius:10px;margin-bottom:12px;border-left:4px solid #c62828;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div style="font-size:1.2em;font-weight:700;color:#b71c1c;">${h.name}</div><div style="background:${h.severity==='심각'?'#c62828':'#ff6f00'};color:white;padding:4px 12px;border-radius:20px;font-size:0.85em;">${h.severity}</div></div><div style="font-size:0.95em;color:#555;margin-bottom:8px;">${h.type}:${h.desc}</div><div style="background:#fff;padding:10px;border-radius:8px;color:#c62828;font-weight:600;">${h.complete?'🔴 완전형성':'🟡 부분형성'}-${h.found}</div></div>`
          )
          .join('')}
        <div style="background:#ffebee;padding:12px;border-radius:8px;margin-top:12px;color:#b71c1c;font-size:0.95em;">
          ⚠️ 형은 충보다 더 흉한 작용을 합니다. 법적 문제, 사고, 질병, 가족 간 불화에 특히 주의하세요.
        </div>
      </div>
    `;}
if(hyungchung.pa.length>0){html+=`
      <div style="margin-bottom:25px;background:white;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <div style="font-size:1.4em;font-weight:700;color:#e64a19;margin-bottom:15px;border-bottom:3px solid #e64a19;padding-bottom:10px;">
          💥 파(破) - 파괴와 손실
        </div>
        ${hyungchung.pa
          .map(
            (p) => `<div style="background:#fff3e0;padding:15px;border-radius:10px;margin-bottom:12px;border-left:4px solid #e64a19;"><div style="font-size:1.1em;font-weight:700;color:#d84315;margin-bottom:8px;">${p.name}</div><div style="font-size:0.95em;color:#555;margin-bottom:8px;">${p.desc}</div><div style="background:#fff;padding:10px;border-radius:8px;color:#e64a19;font-size:0.9em;">💡 ${p.impact}</div></div>`
          )
          .join('')}
      </div>
    `;}
if(hyungchung.hae.length>0){html+=`
      <div style="margin-bottom:25px;background:white;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <div style="font-size:1.4em;font-weight:700;color:#f57c00;margin-bottom:15px;border-bottom:3px solid #f57c00;padding-bottom:10px;">
          🔥 해(害) - 해침과 방해
        </div>
        ${hyungchung.hae
          .map(
            (h) => `<div style="background:#ffe0b2;padding:15px;border-radius:10px;margin-bottom:12px;border-left:4px solid #f57c00;"><div style="font-size:1.1em;font-weight:700;color:#e65100;margin-bottom:8px;">${h.name}</div><div style="font-size:0.95em;color:#555;margin-bottom:8px;">${h.desc}</div><div style="background:#fff;padding:10px;border-radius:8px;color:#f57c00;font-size:0.9em;">📍 영향:${h.impact}</div></div>`
          )
          .join('')}
      </div>
    `;}
if(hyungchung.wongjin.length>0){html+=`
      <div style="margin-bottom:25px;background:white;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <div style="font-size:1.4em;font-weight:700;color:#5d4037;margin-bottom:15px;border-bottom:3px solid #5d4037;padding-bottom:10px;">
          😤 원진(怨嗔) - 원망과 분노
        </div>
        ${hyungchung.wongjin
          .map(
            (w) => `<div style="background:#efebe9;padding:15px;border-radius:10px;margin-bottom:12px;border-left:4px solid #5d4037;"><div style="font-size:1.1em;font-weight:700;color:#3e2723;margin-bottom:8px;">${w.pair}</div><div style="font-size:0.95em;color:#555;">${w.desc}</div></div>`
          )
          .join('')}
      </div>
    `;}
container.innerHTML=html;}
function displayHyungChung(hyungchung){displayHyungChungEnhanced(hyungchung);}
function displaySinsal(sinsal){let html='<div class="sinsal-grid">';sinsal.good.forEach((s)=>{html+=`
            <div class="sinsal-item sinsal-good">
                <div class="sinsal-name">✨ ${s.name}</div>
                <div class="sinsal-desc">${s.desc}</div>
            </div>
        `;});sinsal.bad.forEach((s)=>{html+=`
            <div class="sinsal-item sinsal-bad">
                <div class="sinsal-name">⚠️ ${s.name}</div>
                <div class="sinsal-desc">${s.desc}</div>
            </div>
        `;});sinsal.special.forEach((s)=>{html+=`
            <div class="sinsal-item" style="background:linear-gradient(135deg,#fff9e6 0%,#fff3cd 100%);border-color:#ffc107;">
                <div class="sinsal-name" style="color:#f57c00;">⭐ ${s.name}</div>
                <div class="sinsal-desc">${s.desc}</div>
            </div>
        `;});html+='</div>';if(sinsal.good.length===0&&sinsal.bad.length===0&&sinsal.special.length===0){html='<div style="text-align:center;color:#757575;">사주에 특별한 神殺(신살)이 확인되지 않았습니다</div>';}
document.getElementById('sinsal-analysis').innerHTML=html;}
function displayGongmangDetail(saju,yearGan,yearJi){const jijiList=Object.values(saju.jiji);const pillars=['年支','月支','日支','時支'];let html='<div style="line-height:2;">';html+='<p><strong>▶ 空亡(공망)이란?</strong> 60갑자 순환에서 빠진 지지로, 그 위치의 기운이 약하거나 공허함을 의미합니다.</p><br>';html+='<p><strong>▶ 각 기둥의 空亡(공망) 여부:</strong></p><ul style="margin-top:10px;">';jijiList.forEach((ji,idx)=>{const isGongmang=getGongmang(yearGan,yearJi,ji);html+=`<li style="padding:8px 0;">${pillars[idx]} ${ji}: ${
      isGongmang
        ? '<strong style="color:#c62828;">空亡 ⚠️</strong> - 이 분야가 약하거나 공허할 수 있습니다'
        : '<strong style="color:#2e7d32;">정상 ✓</strong>'
    }</li>`;});html+='</ul><br>';html+='<p><strong>▶ 대처법:</strong> 空亡(공망)이 있는 기둥은 노력으로 보완해야 합니다. 해당 육친이나 분야에 더욱 신경 쓰고 준비하세요.</p>';html+='</div>';document.getElementById('gongmang-detail-analysis').innerHTML=html;}
function displaySpecialSinsal(sinsal){let html='<div style="line-height:2;">';const hasSpecial=sinsal.good.some((s)=>['天乙貴人','學堂貴人'].includes(s.name))||sinsal.bad.some((s)=>['桃花殺','驛馬殺','三災','白虎大殺'].includes(s.name));if(!hasSpecial){html+='<p style="text-align:center;color:#757575;">특별히 주목할 만한 神殺(신살)이 없습니다</p>';}else{html+='<p><strong>▶ 주요 神殺(신살) 상세 해석:</strong></p><br>';sinsal.good.forEach((s)=>{if(['天乙貴人','學堂貴人'].includes(s.name)){html+=`<p style="margin-bottom:15px;">• <strong>${s.name}:</strong> ${s.desc}</p>`;}});sinsal.bad.forEach((s)=>{if(['桃花殺','驛馬殺','三災','白虎大殺'].includes(s.name)){html+=`<p style="margin-bottom:15px;">• <strong>${s.name}:</strong> ${s.desc}</p>`;}});}
html+='</div>';document.getElementById('special-sinsal-analysis').innerHTML=html;}
function displayDaeun(daeunList,dayGan,birthYear){let itemsHTML='';const reversedDaeun=[...daeunList].reverse();reversedDaeun.forEach((daeun)=>{const ganEl=CHEONGAN_ELEMENT[daeun.gan];const jiEl=JIJI_ELEMENT[daeun.jiji];const daeunStartYear=birthYear+daeun.age;itemsHTML+=`
            <div class="daeun-item" onclick="scrollToYeonun(${daeunStartYear})" style="cursor:pointer;" title="클릭하여 ${daeunStartYear}년 (만 ${
      daeun.age
    }세) 연운 보기">
                <div class="daeun-age">${daeun.age}-${daeun.endAge}세</div>
                <div class="gan-box ${getElementClass(ganEl)}">${
      daeun.gan
    }</div>
                <div class="ji-box ${getElementClass(jiEl)}">${daeun.jiji}</div>
            </div>
        `;});const chartHTML=`
        <div class="daeun-scroll">
            ${itemsHTML}
        </div>
    `;const summary=``;document.getElementById('daeun-chart').innerHTML=chartHTML;document.getElementById('daeun-summary').innerHTML=summary;setTimeout(()=>{const daeunScroll=document.querySelector('.daeun-scroll');if(daeunScroll){const currentYear=new Date().getFullYear();const currentAge=currentYear-birthYear;const currentDaeun=daeunList.find((d)=>currentAge>=d.age&&currentAge<=d.endAge);if(currentDaeun){const daeunItems=document.querySelectorAll('.daeun-item');let targetItem=null;daeunItems.forEach((item)=>{const title=item.getAttribute('title');if(title&&title.includes(`만 ${currentDaeun.age}세`)){targetItem=item;}});if(targetItem){const itemLeft=targetItem.offsetLeft;const itemWidth=targetItem.offsetWidth;const scrollWidth=daeunScroll.offsetWidth;const targetScroll=itemLeft-scrollWidth/2+itemWidth/2;daeunScroll.scrollTo({left:targetScroll,behavior:'smooth'});targetItem.style.background='linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%)';targetItem.style.border='3px solid #ffc107';targetItem.style.boxShadow='0 4px 12px rgba(255, 193, 7, 0.3)';}}else{const scrollWidth=daeunScroll.scrollWidth;const clientWidth=daeunScroll.clientWidth;const centerScroll=(scrollWidth-clientWidth)/2;daeunScroll.scrollTo({left:centerScroll,behavior:'smooth'});}}},100);}
function displayYeonun(yeonunList){const filteredYeonun=yeonunList.filter((yeonun)=>yeonun.age>=1);let chartHTML='<div class="yeonun-container" style="margin-top:30px;"><h3 style="display:none;">📅 年運 (연운) - 60甲子 年柱 <span style="font-size:0.8em;color:#666;">(클릭하여 월운 보기)</span></h3><div class="yeonun-scroll" style="display:flex;flex-direction:row-reverse;overflow-x:auto;padding:10px 0;gap:8px;">';filteredYeonun.forEach((yeonun)=>{const ganEl=CHEONGAN_ELEMENT[yeonun.gan];const jiEl=JIJI_ELEMENT[yeonun.ji];chartHTML+=`
            <div class="yeonun-item" data-year="${
              yeonun.year
            }" onclick="scrollToYeonun(${
      yeonun.year
    });" style="cursor:pointer;" title="클릭하여 ${yeonun.year}년 월운 보기">
                <div class="yeonun-year">${yeonun.age}세 · ${yeonun.year}</div>
                <div class="yeonun-ganzhi">
                    <div class="gan-box ${getElementClass(ganEl)}">${
      yeonun.gan
    }</div>
                    <div class="ji-box ${getElementClass(jiEl)}">${
      yeonun.ji
    }</div>
                </div>
            </div>
        `;});chartHTML+='</div></div>';return chartHTML;}
function displayWolun(wolunList){let chartHTML='<div class="wolun-container" id="wolun-container" style="margin-top:30px;"><h3 style="display:none;">📆 月運 (월운) - 前年·現在年·次年 月柱 (36개월)</h3>';const monthNames=['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月',];const years=[...new Set(wolunList.map((w)=>w.year))].sort((a,b)=>a-b);if(years.length===0){chartHTML+='<div style="padding:20px;text-align:center;color:#666;">월운 데이터가 없습니다.</div></div>';return chartHTML;}
const prevYear=years[0];const currentYear=years[1]||prevYear;const nextYear=years[2]||years[1]||prevYear;chartHTML+=`
        <div style="display:none;">
            <strong style="color:#1976d2;">익년도 ${nextYear}년 12개월 → 당년도 ${currentYear}년 12개월 → 전년도 ${prevYear}년 12개월</strong>
            <div style="font-size:0.85em;color:#666;margin-top:5px;">각 연도마다 12월→11월→...→2월→1월 순서 (왼쪽에서 오른쪽으로)</div>
        </div>
    `;chartHTML+='<div class="wolun-scroll" style="display:flex;overflow-x:auto;padding:15px 0;gap:8px;">';[nextYear,currentYear,prevYear].forEach((year,yearIdx)=>{const yearLabel=yearIdx===0?'익년도':yearIdx===1?'당년도':'전년도';const yearColor=yearIdx===0?'#ff9800':yearIdx===1?'#2196f3':'#4caf50';for(let month=12;month>=1;month--){const wolun=wolunList.find((w)=>w.year===year&&w.month===month);if(wolun){const ganEl=CHEONGAN_ELEMENT[wolun.gan];const jiEl=JIJI_ELEMENT[wolun.zhi];chartHTML+=`
                    <div class="wolun-month-item" data-year="${
                      wolun.year
                    }" data-month="${
          wolun.month
        }" style="min-width:70px;padding:8px;background:#f8f9fa;border-radius:6px;text-align:center;transition:all 0.3s;">
                        <div style="font-size:0.65em;color:#666;margin-bottom:2px;">${yearLabel}</div>
                        <div style="font-size:0.7em;color:#333;font-weight:600;margin-bottom:4px;">${year}.${month}월</div>
                        <div style="margin:3px 0;">
                            <div class="gan-box ${getElementClass(
                              ganEl
                            )}" style="display:block;padding:4px 6px;font-size:0.9em;font-weight:700;margin-bottom:2px;">${
          wolun.gan
        }</div>
                            <div class="ji-box ${getElementClass(
                              jiEl
                            )}" style="display:block;padding:4px 6px;font-size:0.9em;font-weight:700;">${
          wolun.zhi
        }</div>
                        </div>
                    </div>
                `;}}
if(yearIdx<2){chartHTML+=`
                <div style="width:3px;background:linear-gradient(to bottom, transparent, #666, transparent);margin:0 5px;min-height:120px;align-self:center;"></div>
            `;}});chartHTML+='</div></div>';setTimeout(()=>{const wolunScroll=document.querySelector('.wolun-scroll');if(wolunScroll){const currentYearItems=document.querySelectorAll(`.wolun-month-item[data-year="${currentYear}"]`);if(currentYearItems.length>0){const currentMonth=new Date().getMonth()+1;let targetItem=Array.from(currentYearItems).find((item)=>parseInt(item.getAttribute('data-month'))===currentMonth);if(!targetItem){targetItem=Array.from(currentYearItems).find((item)=>parseInt(item.getAttribute('data-month'))===6);}
if(!targetItem&&currentYearItems.length>0){targetItem=currentYearItems[Math.floor(currentYearItems.length/2)];}
if(targetItem){const itemLeft=targetItem.offsetLeft;const itemWidth=targetItem.offsetWidth;const scrollWidth=wolunScroll.offsetWidth;const targetScroll=itemLeft-scrollWidth/2+itemWidth/2;wolunScroll.scrollLeft=targetScroll;}}}},50);return chartHTML;}
function displaySewun(sewun,dayGan){const ganEl=CHEONGAN_ELEMENT[sewun.gan];const jiEl=JIJI_ELEMENT[sewun.ji];const html=`
        <div class="sewun-current">
            <div class="sewun-year">${sewun.year}년</div>
            <div class="sewun-ganja">
                <span class="gan-box ${getElementClass(
                  ganEl
                )}" style="display:inline-block;padding:12px 20px;margin:5px;">${
    sewun.gan
  }</span>
                <span class="ji-box ${getElementClass(
                  jiEl
                )}" style="display:inline-block;padding:12px 20px;margin:5px;">${
    sewun.ji
  }</span>
            </div>
            <div style="margin:15px 0;font-size:1em;color:#5d4037;">
                납음: ${sewun.napeum.full}
            </div>
            <div class="sewun-desc">
                <strong>▶ ${sewun.year}년 운세:</strong><br>
                올해는 ${sewun.gan}${sewun.ji}년으로, ${
    sewun.napeum.element
  } 기운이 강합니다. 
                ${
                  sewun.napeum.element === CHEONGAN_ELEMENT[dayGan]
                    ? '일간과 같은 오행이므로 기운이 강해집니다. 적극적으로 활동하기 좋은 해입니다.'
                    : `일간(${CHEONGAN_ELEMENT[dayGan]})과 ${getSipseong(dayGan,sewun.napeum.element)}관계입니다.이에 맞는 전략이 필요합니다.`
                }
            </div>
        </div>
    `;document.getElementById('sewun-analysis').innerHTML=html;}
function displayComprehensive(saju,dayGan,strength,gyeokguk,yongsin,elements,sibiun){const dayEl=CHEONGAN_ELEMENT[dayGan];const maxEl=Object.keys(elements).reduce((a,b)=>elements[a]>elements[b]?a:b);const html=`
        <div class="comprehensive-section">
            <div class="section-subtitle">🎭 성격과 기질</div>
            <div class="section-content">
                ${DAYMASTER_CHARACTERISTICS[dayGan]}<br><br>
                오행 중 <span class="highlight-text">${maxEl}</span>의 기운이 가장 강하며, 
                사주는 <span class="highlight-text">${
                  strength.level
                }</span> 상태입니다.
            </div>
        </div>
        
        <div class="comprehensive-section">
            <div class="section-subtitle">💼 적성과 진로</div>
            <div class="section-content">
                ${gyeokguk.name} 격국으로, ${
    gyeokguk.name.includes('正官')
      ? '공직, 대기업, 교육계가 적합합니다. 안정과 명예를 추구합니다.'
      : gyeokguk.name.includes('正財')
      ? '재무, 회계, 사업 분야가 적합합니다. 꾸준한 재산 축적이 가능합니다.'
      : gyeokguk.name.includes('正印')
      ? '교육, 연구, 학문 분야가 적합합니다. 자격증과 학위가 도움됩니다.'
      : gyeokguk.name.includes('食神')
      ? '예술, 요식업, 서비스업이 적합합니다. 사람들에게 즐거움을 주는 일이 좋습니다.'
      : gyeokguk.name.includes('建祿')
      ? '자영업, 창업이 적합합니다. 독립적으로 일하는 것을 선호합니다.'
      : gyeokguk.name.includes('從')
      ? '전문기술, 특수 분야가 적합합니다. 한 분야에 집중하면 성공합니다.'
      : '다양한 분야에 적응할 수 있습니다. 자신의 강점을 찾아 특화하는 것이 좋습니다.'
  }<br><br>
                용신 <span class="highlight-text">${
                  yongsin.yongsin
                }</span>과 관련된 직업이나 활동이 유리합니다.
            </div>
        </div>
        
        <div class="comprehensive-section">
            <div class="section-subtitle">💪 건강과 주의사항</div>
            <div class="section-content">
                ${
                  strength.level === '太弱(태약)' || strength.level === '弱(약)'
                    ? '일간이 약하므로 체력 관리에 신경 써야 합니다. 과로를 피하고 충분한 휴식이 필요합니다.'
                    : '기본적으로 건강한 편이나, 과신하지 말고 꾸준한 운동과 건강 관리를 해야 합니다.'
                }<br><br>
                ${
                  dayEl === '木'
                    ? '간, 담낭, 신경계를 주의하세요.'
                    : dayEl === '火'
                    ? '심장, 혈압, 소화기를 주의하세요.'
                    : dayEl === '土'
                    ? '위장, 비장, 소화기를 주의하세요.'
                    : dayEl === '金'
                    ? '폐, 호흡기, 피부를 주의하세요.'
                    : '신장, 방광, 생식기를 주의하세요.'
                }
            </div>
        </div>
        
        <div class="comprehensive-section">
            <div class="section-subtitle">🌟 현재 운세와 조언</div>
            <div class="section-content">
                일주의 십이운성이 <span class="highlight-text">${
                  sibiun.day
                }</span>로, 
                ${
                  ['長生', '冠帶', '建祿', '帝旺'].includes(sibiun.day)
                    ? '현재 활동력이 왕성합니다. 적극적으로 기회를 잡고 목표를 추진하세요.'
                    : ['衰', '病', '巳', '卯'].includes(sibiun.day)
                    ? '신중하게 행동해야 하는 시기입니다. 무리하지 말고 차근차근 준비하세요.'
                    : '준비와 학습의 시기입니다. 내면을 키우고 다음 단계를 준비하세요.'
                }
            </div>
        </div>
        
        <div class="comprehensive-section">
            <div class="section-subtitle">📝 인생 전략</div>
            <div class="section-content">
                1. <strong>용신 활용:</strong> ${
                  yongsin.yongsin
                } 오행을 적극 활용하세요. 이와 관련된 색상, 방향, 직업을 선택하면 좋습니다.<br>
                2. <strong>기신 회피:</strong> ${
                  yongsin.gisin
                } 오행은 가능한 피하거나 최소화하세요.<br>
                3. <strong>육친 관리:</strong> 부족한 육친은 노력으로 보완하고, 많은 육친은 잘 활용하되 균형을 유지하세요.<br>
                4. <strong>형충파해 주의:</strong> 해당 시기나 상황에서는 특히 신중하게 행동하세요.<br>
                5. <strong>지속적 발전:</strong> 사주는 타고난 잠재력일 뿐, 노력과 선택으로 운명을 개척할 수 있습니다.
            </div>
        </div>
    `;document.getElementById('comprehensive-analysis').innerHTML=html;}
function displayGaewun(yongsin,strength){const yongsinEl=yongsin.yongsin;const elementInfo={木:{color:'녹색, 청색',direction:'동쪽',number:'3, 8',season:'봄',job:'교육, 문화, 출판, 원예',},火:{color:'빨강, 주황, 보라',direction:'남쪽',number:'2, 7',season:'여름',job:'영업, 마케팅, 방송, 연예',},土:{color:'노랑, 갈색, 베이지',direction:'중앙, 서남, 동북',number:'5, 10',season:'환절기',job:'부동산, 건설, 금융, 농업',},金:{color:'흰색, 은색, 금색',direction:'서쪽',number:'4, 9',season:'가을',job:'법률, 의료, 공학, 금융',},水:{color:'검정, 남색, 회색',direction:'북쪽',number:'1, 6',season:'겨울',job:'IT, 연구, 무역, 물류',},};const info=elementInfo[yongsinEl]||elementInfo['木'];const html=`
        <div class="gaewun-grid">
            <div class="gaewun-item">
                <div class="gaewun-title">🎨 開運(개운) 색상</div>
                <div class="gaewun-content">
                    <p><strong>${info.color}</strong></p>
                    <p style="margin-top:10px;font-size:0.95em;">옷, 소품, 인테리어에 이 색상을 활용하세요. 명함, 휴대폰 케이스, 지갑 등 자주 보는 물건에 적용하면 좋습니다.</p>
                </div>
            </div>
            
            <div class="gaewun-item">
                <div class="gaewun-title">🧭 開運(개운) 방향</div>
                <div class="gaewun-content">
                    <p><strong>${info.direction}</strong></p>
                    <p style="margin-top:10px;font-size:0.95em;">집이나 사무실에서 이 방향을 활용하세요. 책상을 이 방향으로 향하게 하거나, 이 방향으로 이사, 여행을 가면 좋습니다.</p>
                </div>
            </div>
            
            <div class="gaewun-item">
                <div class="gaewun-title">🔢 開運(개운) 숫자</div>
                <div class="gaewun-content">
                    <p><strong>${info.number}</strong></p>
                    <p style="margin-top:10px;font-size:0.95em;">전화번호, 차량번호, 비밀번호 등에 이 숫자를 포함하면 좋습니다. 중요한 결정을 이 날짜에 하는 것도 좋습니다.</p>
                </div>
            </div>
            
            <div class="gaewun-item">
                <div class="gaewun-title">📅 開運(개운) 계절</div>
                <div class="gaewun-content">
                    <p><strong>${info.season}</strong></p>
                    <p style="margin-top:10px;font-size:0.95em;">이 계절에 중요한 일을 시작하거나 계획하면 좋습니다. 이 시기에 활동량을 늘리고 적극적으로 행동하세요.</p>
                </div>
            </div>
            
            <div class="gaewun-item">
                <div class="gaewun-title">💼 開運(개운) 직업</div>
                <div class="gaewun-content">
                    <p><strong>${info.job}</strong></p>
                    <p style="margin-top:10px;font-size:0.95em;">이와 관련된 직업이나 부업을 추천합니다. 직접 종사하지 않더라도 관련 분야에 투자하거나 공부하면 도움이 됩니다.</p>
                </div>
            </div>
            
            <div class="gaewun-item">
                <div class="gaewun-title">📿 추가 開運(개운)법</div>
                <div class="gaewun-content">
                    <ul class="gaewun-list">
                        <li>용신에 해당하는 오행의 물건을 소지하세요</li>
                        <li>긍정적인 마음가짐과 감사하는 태도를 유지하세요</li>
                        <li>선행과 봉사활동으로 덕을 쌓으세요</li>
                        <li>자기계발과 학습을 게을리하지 마세요</li>
                        <li>건강 관리와 규칙적인 생활을 하세요</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div style="margin-top:25px;padding:20px;background:#fff9e6;border-left:4px solid #ffc107;border-radius:10px;">
            <p style="font-size:1.05em;line-height:1.9;">
                <strong>💡 開運(개운)의 핵심:</strong><br>
                開運(개운)은 단순히 물건이나 색상만으로 이루어지는 것이 아닙니다. 
                용신을 이해하고 자신의 강약을 파악하여, 
                부족한 부분은 보완하고 강한 부분은 활용하는 <strong>균형 잡힌 삶의 태도</strong>가 가장 중요합니다. 
                ${
                  strength.level === '太弱(태약)' || strength.level === '弱(약)'
                    ? '일간이 약하므로 무리하지 말고 꾸준히 노력하며, 협력자를 찾아 함께 성장하세요.'
                    : strength.level === '太旺(태왕)' ||
                      strength.level === '旺(왕)'
                    ? '일간이 강하므로 독선적이지 않도록 주의하며, 타인을 배려하고 나누는 자세가 필요합니다.'
                    : '균형 잡힌 사주이므로 현재 상태를 잘 유지하며 발전시켜 나가세요.'
                }
            </p>
        </div>
    `;document.getElementById('gaewun-guide').innerHTML=html;}
function scrollToYeonun(year){const yeonunItem=document.querySelector(`.yeonun-item[data-year="${year}"]`);if(yeonunItem){document.querySelectorAll('.yeonun-item').forEach((item)=>{item.style.background='#f8f9fa';item.style.transform='scale(1)';item.style.boxShadow='none';});yeonunItem.style.background='linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)';yeonunItem.style.transform='scale(1.1)';yeonunItem.style.boxShadow='0 4px 12px rgba(255, 152, 0, 0.3)';yeonunItem.style.border='2px solid #ff9800';const yeonunScroll=yeonunItem.closest('.yeonun-scroll');if(yeonunScroll){const itemLeft=yeonunItem.offsetLeft;const itemWidth=yeonunItem.offsetWidth;const scrollLeft=yeonunScroll.scrollLeft;const scrollWidth=yeonunScroll.offsetWidth;const targetScroll=itemLeft-scrollWidth/2+itemWidth/2;yeonunScroll.scrollTo({left:targetScroll,behavior:'smooth'});}
setTimeout(()=>{autoTriggerWolun(year);},200);}}
function scrollToWolun(year){console.log('🔍 scrollToWolun 호출 - 연도:',year);document.querySelectorAll('.yeonun-item').forEach((item)=>{item.style.background='#f8f9fa';item.style.transform='scale(1)';item.style.boxShadow='none';item.style.border='none';});SajuAPI.calcWolun(year).then((wolunList)=>{console.log('📊 scrollToWolun - Python API 월운 응답:',wolunList);if(wolunList&&wolunList.length>0){console.log('📊 scrollToWolun - 첫 월운 gan:',wolunList[0].gan,'zhi:',wolunList[0].zhi);}
const wolunHTML=displayWolun(wolunList);const existingWolunContainer=document.getElementById('wolun-container');if(existingWolunContainer){const tempDiv=document.createElement('div');tempDiv.innerHTML=wolunHTML;const newWolunContainer=tempDiv.firstChild;existingWolunContainer.parentNode.replaceChild(newWolunContainer,existingWolunContainer);}else{const yeonunContainer=document.querySelector('.yeonun-container');if(yeonunContainer){yeonunContainer.insertAdjacentHTML('afterend',wolunHTML);}}
setTimeout(()=>{const wolunItems=document.querySelectorAll(`.wolun-month-item[data-year="${year}"]`);if(wolunItems.length>0){wolunItems.forEach((item)=>{item.style.background='linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)';item.style.transform='scale(1.1)';item.style.boxShadow='0 6px 16px rgba(255, 152, 0, 0.4)';item.style.border='3px solid #ff9800';});const currentMonth=new Date().getMonth()+1;let targetMonthItem=Array.from(wolunItems).find((item)=>parseInt(item.getAttribute('data-month'))===currentMonth);if(!targetMonthItem){targetMonthItem=Array.from(wolunItems).find((item)=>parseInt(item.getAttribute('data-month'))===6);}
if(!targetMonthItem&&wolunItems.length>0){targetMonthItem=wolunItems[Math.floor(wolunItems.length/2)];}
if(targetMonthItem){const wolunScroll=targetMonthItem.closest('.wolun-scroll');if(wolunScroll){const itemLeft=targetMonthItem.offsetLeft;const itemWidth=targetMonthItem.offsetWidth;const scrollWidth=wolunScroll.offsetWidth;const targetScroll=itemLeft-scrollWidth/2+itemWidth/2;wolunScroll.scrollTo({left:targetScroll,behavior:'smooth'});}}}},300);}).catch((error)=>{console.error('❌ scrollToWolun 월운 계산 오류:',error);alert('월운 계산 중 오류가 발생했습니다.');});}
function autoTriggerDaeun(birthYear,daeunList){const currentYear=new Date().getFullYear();const currentAge=currentYear-birthYear;console.log('🎯 autoTriggerDaeun 호출 - birthYear:',birthYear,'currentYear:',currentYear,'currentAge:',currentAge);const currentDaeun=daeunList.find((daeun)=>currentAge>=daeun.age&&currentAge<=daeun.endAge);if(currentDaeun){console.log('✅ 현재 대운 찾음:',currentDaeun);setTimeout(()=>{console.log('⏰ autoTriggerDaeun setTimeout 실행 (3초 후)');const daeunItems=document.querySelectorAll('.daeun-item');daeunItems.forEach((item)=>{const ageText=item.querySelector('.daeun-age').textContent;const ageRange=ageText.split('-').map((a)=>parseInt(a.replace('세','')));if(currentAge>=ageRange[0]&&currentAge<=ageRange[1]){console.log('✅ 대운 하이라이트:',ageRange[0],'-',ageRange[1]);item.style.background='linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)';item.style.transform='scale(1.1)';item.style.boxShadow='0 8px 16px rgba(255, 152, 0, 0.4)';item.style.border='3px solid #ff9800';const daeunScroll=item.closest('.daeun-scroll');if(daeunScroll){const itemLeft=item.offsetLeft;const itemWidth=item.offsetWidth;const scrollWidth=daeunScroll.offsetWidth;const targetScroll=itemLeft-scrollWidth/2+itemWidth/2;daeunScroll.scrollTo({left:targetScroll,behavior:'smooth'});}
const daeunStartYear=birthYear+ageRange[0];console.log('🔄 연운 트리거 예약 - daeunStartYear:',daeunStartYear,'currentYear:',currentYear);setTimeout(()=>{console.log('▶️ 연운 트리거 실행!');autoTriggerYeonun(daeunStartYear,currentYear);},1500);}});},3000);}else{console.log('❌ 현재 대운을 찾지 못함');}}
function autoTriggerYeonun(daeunStartYear,targetYear){console.log('🔍 autoTriggerYeonun 호출됨 - targetYear:',targetYear);let attempts=0;const maxAttempts=50;const checkAndExecute=()=>{attempts++;console.log('🔄 연운 항목 확인 시도:',attempts);const yeonunItems=document.querySelectorAll('.yeonun-item');console.log('📊 연운 항목 개수:',yeonunItems.length);if(yeonunItems.length>=10){console.log('✅ 연운 항목 준비 완료! 실행 시작');yeonunItems.forEach((item)=>{item.style.background='#f8f9fa';item.style.transform='scale(1)';item.style.boxShadow='none';item.style.border='none';});let targetYeonunItem=null;yeonunItems.forEach((item)=>{const year=parseInt(item.getAttribute('data-year'));if(year===targetYear){console.log('✅ 목표 연도 찾음:',year);targetYeonunItem=item;item.style.background='linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)';item.style.transform='scale(1.1)';item.style.boxShadow='0 6px 16px rgba(255, 152, 0, 0.4)';item.style.border='3px solid #ff9800';}});if(!targetYeonunItem){console.log('❌ 목표 연도를 찾지 못함:',targetYear);}
if(targetYeonunItem){const yeonunScroll=targetYeonunItem.closest('.yeonun-scroll');if(yeonunScroll){const itemLeft=targetYeonunItem.offsetLeft;const itemWidth=targetYeonunItem.offsetWidth;const scrollWidth=yeonunScroll.offsetWidth;const targetScroll=itemLeft-scrollWidth/2+itemWidth/2;console.log('📍 중앙 스크롤 실행:',targetScroll);yeonunScroll.scrollTo({left:targetScroll,behavior:'smooth'});}
setTimeout(()=>{console.log('🌙 월운 자동 트리거 실행');autoTriggerWolun(targetYear);},500);}}else if(attempts<maxAttempts){console.log('⏳ 연운 항목 준비 중... 200ms 후 재시도');setTimeout(checkAndExecute,200);}else{console.log('❌ 연운 항목 로드 실패 (타임아웃)');}};setTimeout(checkAndExecute,500);}
function autoTriggerWolun(year){console.log('🔍 autoTriggerWolun 호출 - 연도:',year);SajuAPI.calcWolun(year).then((wolunList)=>{console.log('📊 Python API 월운 응답:',wolunList);console.log('📊 첫 번째 월운:',wolunList[0]);if(wolunList&&wolunList.length>0){console.log('📊 첫 월운 gan:',wolunList[0].gan,'zhi:',wolunList[0].zhi);}
const wolunHTML=displayWolun(wolunList);const existingWolunContainer=document.getElementById('wolun-container');if(existingWolunContainer){const tempDiv=document.createElement('div');tempDiv.innerHTML=wolunHTML;const newWolunContainer=tempDiv.firstChild;existingWolunContainer.parentNode.replaceChild(newWolunContainer,existingWolunContainer);}
setTimeout(()=>{const wolunItems=document.querySelectorAll(`.wolun-month-item[data-year="${year}"]`);if(wolunItems.length>0){wolunItems.forEach((item)=>{item.style.background='linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)';item.style.transform='scale(1.05)';item.style.boxShadow='0 4px 12px rgba(33, 150, 243, 0.3)';item.style.border='3px solid #2196f3';});const currentMonth=new Date().getMonth()+1;let targetMonthItem=Array.from(wolunItems).find((item)=>parseInt(item.getAttribute('data-month'))===currentMonth);if(!targetMonthItem){targetMonthItem=Array.from(wolunItems).find((item)=>parseInt(item.getAttribute('data-month'))===6);}
if(targetMonthItem){const wolunScroll=targetMonthItem.closest('.wolun-scroll');if(wolunScroll){const itemLeft=targetMonthItem.offsetLeft;const itemWidth=targetMonthItem.offsetWidth;const scrollWidth=wolunScroll.offsetWidth;const targetScroll=itemLeft-scrollWidth/2+itemWidth/2;wolunScroll.scrollTo({left:targetScroll,behavior:'smooth'});}}}},300);}).catch((error)=>{console.error('월운 계산 오류:',error);alert('월운 계산 중 오류가 발생했습니다.');});}
document.addEventListener('DOMContentLoaded',function(){console.log('✅ DOM 로드 완료 - 이벤트 리스너 등록');const analyzeBtn=document.getElementById('analyze-btn');if(analyzeBtn){analyzeBtn.addEventListener('click',analyzeSaju);console.log('✅ 분석 버튼 이벤트 등록 완료');}
const timeInputRadios=document.querySelectorAll('input[name="timeInputType"]');timeInputRadios.forEach((radio)=>{radio.addEventListener('change',toggleTimeInput);});console.log('✅ 시각 입력 방식 라디오 버튼 이벤트 등록 완료');toggleTimeInput();console.log('✅ 초기 시각 입력 방식 UI 설정 완료');const calendarRadios=document.querySelectorAll('input[name="calendar"]');calendarRadios.forEach((radio)=>{radio.addEventListener('change',toggleYundal);});console.log('✅ 역법 라디오 버튼 이벤트 등록 완료');});function generateHyungChungSummary(hyungchungEnhanced){return'';}
function generateSibiSinsalSummary(sibiSinsal){const goodSinsal=sibiSinsal.filter((s)=>s.type==='good');const badSinsal=sibiSinsal.filter((s)=>s.type==='bad');let html='<div style="margin-top:5px;">';const items=[];if(goodSinsal.length>0){items.push(`<span style="color:#4caf50;">길신: ${goodSinsal
        .map((s) => s.name)
        .join(', ')}</span>`);}
if(badSinsal.length>0){items.push(`<span style="color:#f44336;">흉신: ${badSinsal
        .map((s) => s.name)
        .join(', ')}</span>`);}
if(items.length>0){html+=`<div style="font-weight:700;color:#5e35b1;font-size:0.9em;">十二神殺: <span style="font-size:0.9em;font-weight:400;">${items.join(
      ' / '
    )}</span></div>`;}
html+='</div>';return html;}
function generateGilsinSummary(gilsin){let html='<div style="margin-top:5px;">';const names=gilsin.map((g)=>g.name).join(', ');html+=`<div style="font-weight:700;color:#f57f17;font-size:0.9em;">吉神類: <span style="color:#f9a825;font-size:0.9em;font-weight:400;">${names}</span></div>`;html+='</div>';return html;}
function generateExtraSinsalSummary(extraSinsal){const goodSinsal=extraSinsal.filter((s)=>s.type==='good');const warningSinsal=extraSinsal.filter((s)=>s.type==='warning');const badSinsal=extraSinsal.filter((s)=>s.type==='bad');let html='<div style="margin-top:5px;">';const items=[];if(goodSinsal.length>0){items.push(`<span style="color:#4caf50;">긍정: ${goodSinsal
        .map((s) => s.name)
        .join(', ')}</span>`);}
if(warningSinsal.length>0){items.push(`<span style="color:#ff9800;">주의: ${warningSinsal
        .map((s) => s.name)
        .join(', ')}</span>`);}
if(badSinsal.length>0){items.push(`<span style="color:#f44336;">부정: ${badSinsal
        .map((s) => s.name)
        .join(', ')}</span>`);}
if(items.length>0){html+=`<div style="font-weight:700;color:#0288d1;font-size:0.9em;">其他神殺: <span style="font-size:0.9em;font-weight:400;">${items.join(
      ' / '
    )}</span></div>`;}
html+='</div>';return html;}
function displaySibiSinsal(sibiSinsal){const container=document.getElementById('sibi-sinsal-analysis');if(!sibiSinsal||sibiSinsal.length===0){container.innerHTML=`
      <div style="text-align:center;padding:30px;background:#f5f5f5;border-radius:12px;">
        <div style="font-size:1.1em;color:#666;">사주에 십이신살이 없습니다.</div>
      </div>
    `;return;}
const goodSinsal=sibiSinsal.filter((s)=>s.type==='good');const badSinsal=sibiSinsal.filter((s)=>s.type==='bad');let html=`
    <div style="background:#e3f2fd;padding:15px;border-radius:10px;margin-bottom:20px;border-left:4px solid #1976d2;">
      <div style="font-weight:700;color:#0d47a1;margin-bottom:8px;">
        💡 십이신살은 일지(日支)를 기준으로 사주 내 다른 지지와의 관계로 판단합니다.
      </div>
      <div style="color:#1565c0;font-size:0.95em;">
        총 ${sibiSinsal.length}개 발견 (길신 ${goodSinsal.length}개, 흉신 ${badSinsal.length}개)
      </div>
    </div>
  `;if(goodSinsal.length>0){html+=`
      <div style="margin-bottom:25px;background:white;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <div style="font-size:1.3em;font-weight:700;color:#388e3c;margin-bottom:15px;border-bottom:3px solid #388e3c;padding-bottom:10px;">
          🌟 길신(吉神)
        </div>
        ${goodSinsal
          .map(
            (s) => `<div style="background:#e8f5e9;padding:15px;border-radius:10px;margin-bottom:12px;border-left:4px solid #388e3c;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div style="font-size:1.1em;font-weight:700;color:#1b5e20;">${s.name}</div><div style="background:#4caf50;color:white;padding:4px 12px;border-radius:20px;font-size:0.85em;">${s.position}</div></div><div style="font-size:0.95em;color:#555;">${s.desc}</div></div>`
          )
          .join('')}
      </div>
    `;}
if(badSinsal.length>0){html+=`
      <div style="margin-bottom:25px;background:white;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <div style="font-size:1.3em;font-weight:700;color:#d32f2f;margin-bottom:15px;border-bottom:3px solid #d32f2f;padding-bottom:10px;">
          ⚠️ 흉신(凶神)
        </div>
        ${badSinsal
          .map(
            (s) => `<div style="background:#ffebee;padding:15px;border-radius:10px;margin-bottom:12px;border-left:4px solid #d32f2f;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div style="font-size:1.1em;font-weight:700;color:#b71c1c;">${s.name}</div><div style="background:#f44336;color:white;padding:4px 12px;border-radius:20px;font-size:0.85em;">${s.position}</div></div><div style="font-size:0.95em;color:#555;">${s.desc}</div></div>`
          )
          .join('')}
      </div>
    `;}
container.innerHTML=html;}
function displayGilsin(gilsin){const container=document.getElementById('gilsin-analysis');if(!gilsin||gilsin.length===0){container.innerHTML=`
      <div style="text-align:center;padding:30px;background:#f5f5f5;border-radius:12px;">
        <div style="font-size:1.1em;color:#666;">사주에 특별한 길신이 없습니다.</div>
      </div>
    `;return;}
let html=`
    <div style="background:#fff9c4;padding:15px;border-radius:10px;margin-bottom:20px;border-left:4px solid#fbc02d;">
      <div style="font-weight:700;color:#f57f17;margin-bottom:8px;">
        ⭐ 길신류는 일간(日干) 또는 월지(月支)를 기준으로 판단하는 특별한 귀인성(貴人星)입니다.
      </div>
      <div style="color:#f9a825;font-size:0.95em;">
        총 ${gilsin.length}개의 길신이 발견되었습니다. 이는 복록과 귀인의 도움을 의미합니다.
      </div>
    </div>
  `;html+=`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:15px;">
      ${gilsin
        .map(
          (g) => `<div style="background:linear-gradient(135deg,#fff9e6 0%,#fffbf0 100%);padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);border:2px solid #ffc107;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div style="font-size:1.2em;font-weight:700;color:#e65100;">✨ ${g.name}</div><div style="background:#ffc107;color:#fff;padding:5px 12px;border-radius:20px;font-size:0.85em;font-weight:600;">${g.position}</div></div><div style="font-size:0.95em;color:#555;line-height:1.6;">${g.desc}</div></div>`
        )
        .join('')}
    </div>
  `;container.innerHTML=html;}
function displayExtraSinsal(extraSinsal){const container=document.getElementById('extra-sinsal-analysis');if(!extraSinsal||extraSinsal.length===0){container.innerHTML=`
      <div style="text-align:center;padding:30px;background:#f5f5f5;border-radius:12px;">
        <div style="font-size:1.1em;color:#666;">사주에 추가 신살이 없습니다.</div>
      </div>
    `;return;}
const goodSinsal=extraSinsal.filter((s)=>s.type==='good');const warningSinsal=extraSinsal.filter((s)=>s.type==='warning');const badSinsal=extraSinsal.filter((s)=>s.type==='bad');let html=`
    <div style="background:#e1f5fe;padding:15px;border-radius:10px;margin-bottom:20px;border-left:4px solid #0288d1;">
      <div style="font-weight:700;color:#01579b;margin-bottom:8px;">
        📌 그외 신살은 사주의 특수한 작용과 영향을 나타냅니다.
      </div>
      <div style="color:#0277bd;font-size:0.95em;">
        총 ${extraSinsal.length}개 발견 (길신 ${goodSinsal.length}개, 주의 ${warningSinsal.length}개, 흉신 ${badSinsal.length}개)
      </div>
    </div>
  `;if(goodSinsal.length>0){html+=`
      <div style="margin-bottom:25px;background:white;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <div style="font-size:1.3em;font-weight:700;color:#388e3c;margin-bottom:15px;border-bottom:3px solid #388e3c;padding-bottom:10px;">
          ✅ 긍정적 신살
        </div>
        ${goodSinsal
          .map(
            (s) => `<div style="background:#e8f5e9;padding:15px;border-radius:10px;margin-bottom:12px;border-left:4px solid #388e3c;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div style="font-size:1.1em;font-weight:700;color:#1b5e20;">${s.name}</div><div style="background:#4caf50;color:white;padding:4px 12px;border-radius:20px;font-size:0.85em;">${s.position}</div></div><div style="font-size:0.95em;color:#555;">${s.desc}</div></div>`
          )
          .join('')}
      </div>
    `;}
if(warningSinsal.length>0){html+=`
      <div style="margin-bottom:25px;background:white;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <div style="font-size:1.3em;font-weight:700;color:#f57c00;margin-bottom:15px;border-bottom:3px solid #f57c00;padding-bottom:10px;">
          ⚠️ 주의해야 할 신살
        </div>
        ${warningSinsal
          .map(
            (s) => `<div style="background:#fff3e0;padding:15px;border-radius:10px;margin-bottom:12px;border-left:4px solid #f57c00;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div style="font-size:1.1em;font-weight:700;color:#e65100;">${s.name}</div><div style="background:#ff9800;color:white;padding:4px 12px;border-radius:20px;font-size:0.85em;">${s.position}</div></div><div style="font-size:0.95em;color:#555;">${s.desc}</div></div>`
          )
          .join('')}
      </div>
    `;}
if(badSinsal.length>0){html+=`
      <div style="margin-bottom:25px;background:white;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <div style="font-size:1.3em;font-weight:700;color:#d32f2f;margin-bottom:15px;border-bottom:3px solid #d32f2f;padding-bottom:10px;">
          🚫 부정적 신살
        </div>
        ${badSinsal
          .map(
            (s) => `<div style="background:#ffebee;padding:15px;border-radius:10px;margin-bottom:12px;border-left:4px solid #d32f2f;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div style="font-size:1.1em;font-weight:700;color:#b71c1c;">${s.name}</div><div style="background:#f44336;color:white;padding:4px 12px;border-radius:20px;font-size:0.85em;">${s.position}</div></div><div style="font-size:0.95em;color:#555;">${s.desc}</div></div>`
          )
          .join('')}
      </div>
    `;}
container.innerHTML=html;}