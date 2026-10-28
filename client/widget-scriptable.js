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
  if(!small&&kind==='queue'){row.addSpacer();const category=row.addText(snapshot.categoryNames?.[item.category]||DaylaneWidget.categories[item.category]||'Категория');category.font=Font.systemFont(10);category.textColor=new Color('9b88a6');category.lineLimit=1}
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
