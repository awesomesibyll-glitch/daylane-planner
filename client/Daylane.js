// Variables used by Scriptable.
// icon-color: deep-purple; icon-glyph: calendar-alt;
// Daylane: install instructions at widgets.html.
const DaylaneModel=(()=>{
const date=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(new Date(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
const id=s=>typeof s==='string'&&/^[a-zA-Z0-9_.-]{1,120}$/.test(s)&&!['__proto__','constructor','prototype'].includes(s);
const clock=s=>typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const category=s=>['study','work','personal','rest'].includes(s);
const reminder=n=>n===undefined||n===null||[0,5,10,15,30,60,120,1440].includes(n);
const short=s=>typeof s==='string'&&s.trim().length>0&&s.length<=150;
function validSubtasks(list){return list===undefined||(Array.isArray(list)&&list.length<=50&&new Set(list.map(s=>s?.id)).size===list.length&&list.every(s=>s&&id(s.id)&&short(s.title)&&typeof s.done==='boolean'))}
function validRepeat(r){return !r||(r&&['daily','weekly','monthly'].includes(r.frequency)&&(!r.until||date(r.until))&&(r.frequency!=='weekly'||(Array.isArray(r.days)&&r.days.length>0&&r.days.length<=7&&r.days.every(n=>Number.isInteger(n)&&n>=1&&n<=7))))}
function validAttachments(list){return list===undefined||(Array.isArray(list)&&list.length<=10&&new Set(list.map(a=>a?.id)).size===list.length&&list.every(validAttachment))}
function attachments(record){const result=new Map();const add=list=>{for(const a of list||[])result.set(a.id,a)};if(record.kind==='trash'&&record.record)return attachments(record.record);add(record.attachments);for(const x of Object.values(record.exceptions||{}))add(x.attachments);for(const item of record.items||[])add(item.attachments);return [...result.values()]}
function validAttachment(a){return a&&id(a.id)&&typeof a.name==='string'&&a.name.length<=255&&typeof a.mime==='string'&&a.mime.length<=100&&Number.isInteger(a.size)&&a.size>=0&&a.size<=5*1024*1024}
function validException(x){return x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).every(k=>['cancelled','date','done','title','start','end','category','notes','reminder','subtasks','attachments'].includes(k))&&validSubtasks(x.subtasks)&&validAttachments(x.attachments)&&reminder(x.reminder)&&(!('cancelled'in x)||typeof x.cancelled==='boolean')&&(!('date'in x)||date(x.date))&&(!('done'in x)||typeof x.done==='boolean')&&(!('title'in x)||short(x.title))&&(!('start'in x)||clock(x.start))&&(!('end'in x)||clock(x.end))&&(!('category'in x)||category(x.category))&&(!('notes'in x)||(typeof x.notes==='string'&&x.notes.length<=2000))&&(!(x.start&&x.end)||x.end>x.start)}
function validHabitDays(days){return Array.isArray(days)&&days.length>0&&days.length<=7&&new Set(days).size===days.length&&days.every(n=>Number.isInteger(n)&&n>=1&&n<=7)}
function validHabit(h){return short(h.title)&&h.title.length<=80&&validHabitDays(h.days)&&['lavender','sage','rose','sand','sky'].includes(h.colour)&&['leaf','book','water','moon','move','star'].includes(h.icon)&&typeof h.notes==='string'&&h.notes.length<=500&&typeof h.archived==='boolean'&&typeof h.updatedAt==='string'&&!isNaN(Date.parse(h.updatedAt))&&(!h.schedule||(Array.isArray(h.schedule)&&h.schedule.length>0&&h.schedule.length<=1000&&h.schedule.every((v,i)=>v&&date(v.from)&&v.from>=h.date&&validHabitDays(v.days)&&(!i||h.schedule[i-1].from<v.from))))}
function validRecord(e){if(!e||!id(e.id)||!date(e.date)||!validSubtasks(e.subtasks)||!validAttachments(e.attachments)||(e.deadline!==undefined&&e.deadline!==null&&!date(e.deadline)))return false;if(e.kind==='trash')return typeof e.deletedAt==='string'&&!isNaN(Date.parse(e.deletedAt))&&e.record&&(!e.record.kind||['task','inbox','journal','template'].includes(e.record.kind))&&validRecord(e.record)&&(!e.occurrenceDate||(date(e.occurrenceDate)&&!!e.record.repeat&&validException(e.afterException)&&e.afterException.cancelled===true));if(e.kind==='template')return short(e.title)&&[1,7].includes(e.span)&&typeof e.updatedAt==='string'&&!isNaN(Date.parse(e.updatedAt))&&Array.isArray(e.items)&&e.items.length>0&&e.items.length<=200&&e.items.every(t=>t&&Number.isInteger(t.offset)&&t.offset>=0&&t.offset<e.span&&Object.keys(t).every(k=>['offset','title','start','end','category','notes','reminder','subtasks','attachments'].includes(k))&&validRecord({...t,id:'template-item',date:e.date,kind:'task',done:false}));if(e.kind==='inbox')return short(e.title)&&category(e.category)&&typeof e.notes==='string'&&e.notes.length<=2000&&typeof e.done==='boolean'&&['none','week','month'].includes(e.horizon)&&(e.horizon==='none'?e.planDate===null:date(e.planDate)&&(e.horizon==='month'?e.planDate.endsWith('-01'):(new Date(e.planDate+'T12:00:00').getDay()===1)))&&typeof e.updatedAt==='string'&&!isNaN(Date.parse(e.updatedAt));if(e.kind==='habit')return validHabit(e);if(e.kind==='habit-check')return id(e.habitId)&&e.id==='hcheck-'+e.habitId+'-'+e.date&&typeof e.done==='boolean'&&typeof e.updatedAt==='string'&&!isNaN(Date.parse(e.updatedAt));if(e.kind==='journal')return typeof e.title==='string'&&e.title.length<=150&&typeof e.text==='string'&&e.text.length<=30000&&(e.mood===null||(Number.isInteger(e.mood)&&e.mood>=1&&e.mood<=5))&&Array.isArray(e.attachments)&&e.attachments.length<=10&&e.attachments.every(validAttachment)&&(e.text.trim()||e.title.trim()||e.mood||e.attachments.length)&&typeof e.updatedAt==='string'&&!isNaN(Date.parse(e.updatedAt));return (!e.kind||e.kind==='task')&&short(e.title)&&clock(e.start)&&clock(e.end)&&e.end>e.start&&category(e.category)&&typeof e.notes==='string'&&e.notes.length<=2000&&typeof e.done==='boolean'&&reminder(e.reminder)&&validRepeat(e.repeat)&&(!e.repeat?.until||e.repeat.until>=e.date)&&(!e.exceptions||(typeof e.exceptions==='object'&&!Array.isArray(e.exceptions)&&Object.keys(e.exceptions).length<=10000&&Object.entries(e.exceptions).every(([d,x])=>date(d)&&validException(x))))}
function applies(e,d){if((e.kind&&e.kind!=='task')||d<e.date||e.repeat?.until&&d>e.repeat.until)return false;if(!e.repeat)return d===e.date;const day=new Date(d+'T12:00:00').getDay()||7;if(e.repeat.frequency==='daily')return true;if(e.repeat.frequency==='weekly')return e.repeat.days.includes(day);return d.slice(8)===e.date.slice(8)}
function tasksForDates(records,days){const set=new Set(days.map(d=>typeof d==='string'?d:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)),out=[];for(const e of records){if(e.kind&&e.kind!=='task')continue;if(!e.repeat){if(set.has(e.date))out.push(e);continue}function occurrence(source,override={}){if(override.cancelled)return;const target=override.date||source;if(!set.has(target))return;out.push({...e,done:false,...(e.subtasks?{subtasks:e.subtasks.map(s=>({...s,done:false}))}:{}),...override,date:target,id:e.id+'@'+source,_seriesId:e.id,_occurrenceDate:source})}for(const d of set)if(applies(e,d)){const x=e.exceptions?.[d]||{};if(!x.date||x.date===d)occurrence(d,x)}for(const [source,x]of Object.entries(e.exceptions||{}))if(x.date&&x.date!==source)occurrence(source,x)}return out}
function changeOne(series,source,values){return {...series,exceptions:{...(series.exceptions||{}),[source]:{...(series.exceptions?.[source]||{}),...values}}}}
function moveTask(records,occurrence,targetDate,startMinute){
if(!date(targetDate)||!Number.isInteger(startMinute))return null;
const fresh=tasksForDates(records,[occurrence.date]).find(e=>e.id===occurrence.id);if(!fresh)return null;
const minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3)),duration=minutes(fresh.end)-minutes(fresh.start);
if(startMinute<0||startMinute+duration>1439)return null;
const clock=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0'),values={date:targetDate,start:clock(startMinute),end:clock(startMinute+duration)},base=records.find(e=>e.id===(fresh._seriesId||fresh.id));
const changed=fresh._seriesId?changeOne(base,fresh._occurrenceDate,values):{...base,...values};
return validRecord(changed)?records.map(e=>e.id===base.id?changed:e):null;
}
function allSubtasksDone(steps){return !!steps?.length&&steps.every(s=>s.done)}
return {allSubtasksDone,attachments,moveTask,date,id,validRecord,validAttachment,validRepeat,applies,tasksForDates,changeOne};
})();

const DaylaneHabits=(()=>{
const day=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const shift=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return day(d)};
function week(s){const d=new Date(s+'T12:00:00');d.setDate(d.getDate()-(d.getDay()+6)%7);return Array.from({length:7},(_,i)=>shift(day(d),i))}
function daysAt(h,date){let days=h.days;for(const entry of h.schedule||[])if(entry.from<=date)days=entry.days;return days}
function scheduled(h,date){return date>=h.date&&daysAt(h,date).includes(new Date(date+'T12:00:00').getDay()||7)}
const checkId=(id,date)=>'hcheck-'+id+'-'+date;
function checked(records,id,date){return records.some(e=>e.kind==='habit-check'&&e.id===checkId(id,date)&&e.done)}
function progress(h,records,days,today){const planned=days.filter(d=>scheduled(h,d));return{planned:planned.length,done:planned.filter(d=>d<=today&&checked(records,h.id,d)).length}}
function streak(h,records,today){let d=today,total=0;if(!checked(records,h.id,d))d=shift(d,-1);for(let guard=0;d>=h.date&&guard<36600;guard++,d=shift(d,-1)){if(!scheduled(h,d))continue;if(!checked(records,h.id,d))break;total++}return total}
function editSchedule(previous,days,today){const from=today<previous.date?previous.date:today;const history=previous.schedule?.length?previous.schedule:[{from:previous.date,days:previous.days}];return [...history.filter(e=>e.from<from),{from,days}].sort((a,b)=>a.from.localeCompare(b.from))}
return{day,shift,week,daysAt,scheduled,checked,checkId,progress,streak,editSchedule};
})();

// Future system notifications. Same occurrence ID is reused when an event is edited.
const DaylanePhonePlan=(()=>{
function upcoming(records,now=new Date()){
 const time=now.getTime(),until=time+14*86400000,days=[];
 for(let i=0;i<16;i++){const d=new Date(now);d.setDate(d.getDate()+i);days.push(DaylaneHabits.day(d))}
 return DaylaneModel.tasksForDates(records.filter(DaylaneModel.validRecord),days).filter(e=>!e.done&&[0,5,10,15,30,60,120,1440].includes(e.reminder)).map(e=>({id:'daylane-phone-'+(e._seriesId||e.id)+'-'+(e._occurrenceDate||e.date),title:e.title,date:e.date,start:e.start,end:e.end,at:new Date(e.date+'T'+e.start+':00').getTime()-e.reminder*60000})).filter(e=>e.at>time&&e.at<=until).sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id));
}
function valid(a){return a&&typeof a.id==='string'&&a.id.startsWith('daylane-phone-')&&typeof a.title==='string'&&a.title.length<=150&&DaylaneModel.date(a.date)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(a.start)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(a.end)&&Number.isFinite(a.at)}
return{upcoming,valid};
})();

// Shared, read-only data for Scriptable widgets. No journal text, photos, notes or keys in the snapshot.
const DaylaneWidget=(()=>{
const categories={study:'Учёба',work:'Работа',personal:'Личное',rest:'Отдых'};
function snapshot(records,now=new Date()){
 const date=DaylaneHabits.day(now),clock=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
 const valid=records.filter(DaylaneModel.validRecord);
 const tasks=DaylaneModel.tasksForDates(valid,[date]).filter(e=>!e.done&&e.end>clock).sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title,'ru')).map(e=>({title:e.title,start:e.start,end:e.end,category:e.category}));
 const habits=valid.filter(e=>e.kind==='habit'&&!e.archived&&DaylaneHabits.scheduled(e,date)).map(e=>({title:e.title,done:DaylaneHabits.checked(valid,e.id,date)})).sort((a,b)=>Number(a.done)-Number(b.done)||a.title.localeCompare(b.title,'ru'));
 const queue=valid.filter(e=>e.kind==='inbox'&&!e.done).sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title,'ru')).map(e=>({title:e.title,category:e.category}));
 return {version:1,date,fetchedAt:now.toISOString(),tasks,habits,queue,alarms:DaylanePhonePlan.upcoming(valid,now)};
}
function validSnapshot(s){return s&&(!s.alarms||(Array.isArray(s.alarms)&&s.alarms.every(DaylanePhonePlan.valid)))&&s.version===1&&DaylaneModel.date(s.date)&&typeof s.fetchedAt==='string'&&!isNaN(Date.parse(s.fetchedAt))&&Array.isArray(s.tasks)&&s.tasks.every(e=>e&&typeof e.title==='string'&&typeof e.start==='string'&&typeof e.end==='string'&&categories[e.category])&&Array.isArray(s.habits)&&s.habits.every(e=>e&&typeof e.title==='string'&&typeof e.done==='boolean')&&Array.isArray(s.queue)&&s.queue.every(e=>e&&typeof e.title==='string'&&categories[e.category])}
return {snapshot,validSnapshot,categories};
})();

// Optional Scriptable local notifications; no server or extra network endpoint.
const DAYLANE_PHONE_KEY='daylane-phone-enabled-v1';
async function daylaneClearPhone(){const pending=await Notification.allPending();const ids=pending.filter(n=>n.identifier?.startsWith('daylane-phone-')).map(n=>n.identifier);if(ids.length)await Notification.removePending(ids)}
async function daylaneSyncPhone(snapshot){
 const now=Date.now(),pending=await Notification.allPending(),ours=pending.filter(n=>n.identifier?.startsWith('daylane-phone-')&&n.identifier!=='daylane-phone-test'),others=pending.length-ours.length,capacity=Math.max(0,Math.min(40,60-others));
 const candidates=(snapshot.alarms||[]).filter(DaylanePhonePlan.valid).filter(a=>a.at>now).sort((a,b)=>a.at-b.at),selected=candidates.slice(0,capacity),wanted=new Set(selected.map(a=>a.id));
 const obsolete=ours.filter(n=>!wanted.has(n.identifier)).map(n=>n.identifier);if(obsolete.length)await Notification.removePending(obsolete);
 const existing=new Map(ours.map(n=>[n.identifier,n]));let changed=0;
 for(const a of selected){const signature=JSON.stringify([a.title,a.date,a.start,a.end,a.at]);if(existing.get(a.id)?.userInfo?.daylaneSignature===signature)continue;
  const n=new Notification();n.identifier=a.id;n.title=a.title;n.subtitle='Daylane · '+a.start+'–'+a.end;n.body=new Date(a.date+'T12:00:00').toLocaleDateString('ru',{day:'numeric',month:'long'});n.sound='default';n.threadIdentifier='daylane';n.openURL=DAYLANE_URL+'?view=planner&day='+a.date;n.userInfo={daylaneSignature:signature};n.setTriggerDate(new Date(a.at));await n.schedule();changed++;
 }
 return {count:selected.length,total:candidates.length,changed,last:selected.length?selected[selected.length-1].at:null};
}
async function daylanePhoneMenu(){
 const enabled=Keychain.contains(DAYLANE_PHONE_KEY),menu=new Alert();menu.title='Напоминания на iPhone / iPad';menu.message='Система будет показывать заранее назначенные уведомления, даже если Daylane и Scriptable закрыты. Загружаются до 40 ближайших напоминаний на 14 дней. После переноса, отмены или выполнения дел обнови их здесь. Виджет тоже обновляет их при своей загрузке, но iOS выбирает время обновления.';
 menu.addAction(enabled?'Обновить напоминания':'Включить напоминания');menu.addAction('Проверить уведомление');if(enabled)menu.addAction('Отключить напоминания');menu.addCancelAction('Назад');const choice=await menu.presentSheet();if(choice<0)return;
 if(choice===2&&enabled){Keychain.remove(DAYLANE_PHONE_KEY);await daylaneClearPhone();await daylaneMessage('Напоминания отключены','Ожидающие уведомления Daylane удалены. Другие сценарии Scriptable не затронуты.');return}
 if(choice===1){const n=new Notification();n.identifier='daylane-phone-test';n.title='Daylane · проверка';n.body='Напоминания телефона подключены.';n.sound='default';n.openURL=DAYLANE_URL;n.setTriggerDate(new Date(Date.now()+10000));try{await n.schedule();await daylaneMessage('Проверка через 10 секунд','Разреши уведомления Scriptable в настройках iPhone/iPad. Режим «Фокусирование», беззвучный режим и сводка могут влиять на показ и звук.')}catch{await daylaneMessage('Не удалось включить уведомления','Проверь разрешение для Scriptable: Настройки → Уведомления.')}return}
 try{const snapshot=await daylaneRead(Keychain.get(DAYLANE_KEY)),result=await daylaneSyncPhone(snapshot);Keychain.set(DAYLANE_PHONE_KEY,'yes');daylaneSave(snapshot);await daylaneMessage('Напоминания переданы системе','Назначено: '+result.count+(result.total>result.count?' из '+result.total:'')+'. '+(result.last?'Последнее — '+new Date(result.last).toLocaleString('ru',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+'. ':'')+'Проверь разрешение уведомлений для Scriptable. Если задач нет, выбери «Напомнить» у дела в Daylane и обнови здесь. После изменений и не реже раза в неделю обновляй этот список.')}
 catch{await daylaneMessage('Напоминания не обновлены','Проверь связь, ключ GitHub и разрешение уведомлений Scriptable. Ранее назначенные уведомления могли сохраниться; после восстановления связи обнови список.')}
}

// Daylane widget for Scriptable on iPhone / iPad.
// Network: GET only, fixed GitHub repository. Secret: Scriptable Keychain only.
const DAYLANE_URL='https://awesomesibyll-glitch.github.io/daylane-planner/';
const DAYLANE_API='https://api.github.com/repos/awesomesibyll-glitch/daylane-data/contents/planner.json';
const DAYLANE_KEY='daylane-widget-read-token-v1';
async function daylaneRead(token){
 const request=new Request(DAYLANE_API);request.method='GET';request.timeoutInterval=12;
 request.headers={Accept:'application/vnd.github.raw+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'};
 request.onRedirect=()=>null;
 const raw=await request.loadString(),status=request.response?.statusCode;
 if(status===401||status===403)throw Error('auth');if(status===404)throw Error('missing');if(status!==200)throw Error('network');
 const state=JSON.parse(raw);if(!state||!state.events||Array.isArray(state.events)||typeof state.events!=='object')throw Error('format');
 return DaylaneWidget.snapshot(Object.values(state.events));
}
function daylaneCache(){const fm=FileManager.local();return {fm,path:fm.joinPath(fm.libraryDirectory(),'daylane-widget-snapshot-v1.json')}}
function daylaneSave(snapshot){try{const {fm,path}=daylaneCache();fm.writeString(path,JSON.stringify(snapshot))}catch{}}
function daylaneCached(){try{const {fm,path}=daylaneCache();if(!fm.fileExists(path))return null;const s=JSON.parse(fm.readString(path));return DaylaneWidget.validSnapshot(s)?s:null}catch{return null}}
async function daylaneMessage(title,message){const alert=new Alert();alert.title=title;alert.message=message;alert.addAction('Понятно');await alert.presentAlert()}
async function daylaneConnect(){
 const alert=new Alert();alert.title='Подключить Daylane';alert.message='Сначала включи синхронизацию в Daylane. Для виджета создай отдельный ключ GitHub: только daylane-data, Contents: Read-only. Ключ сохраняется в защищённом хранилище Scriptable и используется только для чтения GitHub.';
 alert.addSecureTextField('Ключ GitHub');alert.addAction('Подключить');alert.addCancelAction('Отмена');if(await alert.presentAlert()<0)return null;
 const token=alert.textFieldValue(0).trim();if(!token)return null;
 try{const s=await daylaneRead(token);Keychain.set(DAYLANE_KEY,token);daylaneSave(s);return s}catch(error){await daylaneMessage('Не удалось подключить',error.message==='missing'?'Файл пока не найден. Открой Daylane, подключи синхронизацию и дождись надписи «Сохранено в облаке».':'Проверь связь, срок действия ключа и разрешение Contents: Read-only для daylane-data.');return null}
}
function daylaneText(widget,value,size=12,colour='6f5b7f',bold=false){const text=widget.addText(String(value));text.font=bold?Font.semiboldSystemFont(size):Font.systemFont(size);text.textColor=new Color(colour);text.lineLimit=1;text.minimumScaleFactor=0.8;return text}
function daylaneRender(snapshot,kind,status=''){
 const w=new ListWidget();w.backgroundColor=new Color('f6f1fa');w.setPadding(14,16,12,16);w.url=DAYLANE_URL+'?view='+(kind==='habits'?'habits':kind==='queue'?'inbox':'planner');w.refreshAfterDate=new Date(Date.now()+30*60*1000);
 const family=config.widgetFamily||'medium',small=family==='small',limit=small?1:family==='large'?6:family==='extraLarge'?10:3;
 daylaneText(w,'daylane  /  '+(kind==='habits'?'привычки':kind==='queue'?'на полях':'сегодня'),12,'9b82b0',true);w.addSpacer(6);
 if(!snapshot){daylaneText(w,'Подключи планер',small?14:17,'6f5b7f',true);w.addSpacer(6);const t=daylaneText(w,'Открой Daylane в Scriptable и добавь ключ GitHub.',12,'9684a3');t.lineLimit=3;return w}
 const date=new Date(snapshot.date+'T12:00:00'),dateLabel=date.toLocaleDateString('ru',{day:'numeric',month:'short'});
 const list=kind==='habits'?snapshot.habits:kind==='queue'?snapshot.queue:snapshot.tasks;
 const summary=kind==='habits'?snapshot.habits.filter(e=>e.done).length+' / '+list.length+' выполнено':kind==='queue'?list.length+' ждут времени':list.length+' впереди';
 daylaneText(w,summary+(small?'':' · '+dateLabel),small?14:16,'6f5b7f',true);w.addSpacer(8);
 for(const item of list.slice(0,limit)){
  const row=w.addStack();row.spacing=7;
  const mark=kind==='habits'?(item.done?'✓':'○'):kind==='queue'?'◇':item.start;
  const badge=row.addText(mark);badge.font=Font.semiboldSystemFont(11);badge.textColor=new Color(kind==='habits'&&item.done?'7b9a86':'a58abd');badge.lineLimit=1;
  const title=row.addText(item.title);title.font=Font.systemFont(12);title.textColor=new Color('65566f');title.lineLimit=1;title.minimumScaleFactor=0.8;
  if(!small&&kind==='queue'){row.addSpacer();const category=row.addText(DaylaneWidget.categories[item.category]);category.font=Font.systemFont(10);category.textColor=new Color('9b88a6');category.lineLimit=1}
  w.addSpacer(6);
 }
 if(!list.length){const t=daylaneText(w,kind==='habits'?'Сегодня привычек нет':kind==='queue'?'Всё распределено':'Свободное время',13,'8b7997');t.lineLimit=2}
 w.addSpacer();
 const stamp=new Date(snapshot.fetchedAt).toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'}),old=snapshot.date!==DaylaneHabits.day(new Date());
 daylaneText(w,old?'Копия за '+dateLabel:status||('Обновлено '+stamp),9,'a291ad');
 return w;
}
async function daylaneMain(){
 let kind=String(args.widgetParameter||'today').trim().toLowerCase();if(!['today','habits','queue'].includes(kind))kind='today';let snapshot=null;
 if(config.runsInApp){
  if(!Keychain.contains(DAYLANE_KEY)){snapshot=await daylaneConnect();if(!snapshot){Script.complete();return}}
  const menu=new Alert();menu.title='Daylane — виджеты';menu.message='Выбери предпросмотр. Для экрана «Домой» добавь виджет Scriptable и укажи этот сценарий.';
  for(const label of ['Дела на сегодня','Трекер привычек','На полях','Сменить ключ','Отключить виджеты','Напоминания телефона'])menu.addAction(label);menu.addCancelAction('Закрыть');const choice=await menu.presentSheet();if(choice<0){Script.complete();return}
  if(choice===5){await daylanePhoneMenu();Script.complete();return}
  if(choice===4){if(Keychain.contains(DAYLANE_PHONE_KEY)){await daylaneClearPhone();Keychain.remove(DAYLANE_PHONE_KEY)}Keychain.remove(DAYLANE_KEY);try{const {fm,path}=daylaneCache();if(fm.fileExists(path))fm.remove(path)}catch{}await daylaneMessage('Отключено','Ключ и сохранённая копия виджета удалены из Scriptable. Данные планера сохранены.');Script.complete();return}
  if(choice===3){snapshot=await daylaneConnect();if(!snapshot){Script.complete();return}kind='today'}else kind=['today','habits','queue'][choice];
 }
 let status='';if(Keychain.contains(DAYLANE_KEY))try{snapshot=await daylaneRead(Keychain.get(DAYLANE_KEY));daylaneSave(snapshot);if(Keychain.contains(DAYLANE_PHONE_KEY)){try{await daylaneSyncPhone(snapshot)}catch{status='Напоминания не обновлены'}}}catch(error){snapshot=snapshot||daylaneCached();status=error.message==='auth'?'Обнови ключ в Scriptable':error.message==='missing'?'Дождись синхронизации':'Нет связи · сохранённая копия'}
 const widget=daylaneRender(snapshot,kind,status);Script.setWidget(widget);if(config.runsInApp)await widget.presentMedium();Script.complete();
}
await daylaneMain();
