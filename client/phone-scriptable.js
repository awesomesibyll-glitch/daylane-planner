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
