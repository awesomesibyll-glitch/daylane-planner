// Shared, read-only data for Scriptable widgets. No journal text, photos, notes or keys in the snapshot.
const DaylaneWidget=(()=>{
const categories={study:'Учёба',work:'Работа',personal:'Личное',rest:'Отдых'};
function snapshot(records,now=new Date()){
 const date=DaylaneHabits.day(now),clock=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
 const valid=records.filter(DaylaneModel.validRecord);
 const tasks=DaylaneModel.tasksForDates(valid,[date]).filter(e=>!e.done&&e.end>clock).sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title,'ru')).map(e=>({title:e.title,start:e.start,end:e.end,category:e.category}));
 const habits=valid.filter(e=>e.kind==='habit'&&!e.archived&&DaylaneHabits.scheduled(e,date)).map(e=>({title:e.title,done:DaylaneHabits.checked(valid,e.id,date)})).sort((a,b)=>Number(a.done)-Number(b.done)||a.title.localeCompare(b.title,'ru'));
 const queue=valid.filter(e=>e.kind==='inbox'&&!e.done).sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title,'ru')).map(e=>({title:e.title,category:e.category}));
 const categoryNames={...categories};for(const r of valid)if(r.kind==='category')categoryNames[r.key]=r.title;return {version:1,categoryNames,date,fetchedAt:now.toISOString(),tasks,habits,queue,alarms:DaylanePhonePlan.upcoming(valid,now)};
}
function validSnapshot(s){return s&&(!s.alarms||(Array.isArray(s.alarms)&&s.alarms.every(DaylanePhonePlan.valid)))&&s.version===1&&DaylaneModel.date(s.date)&&typeof s.fetchedAt==='string'&&!isNaN(Date.parse(s.fetchedAt))&&Array.isArray(s.tasks)&&s.tasks.every(e=>e&&typeof e.title==='string'&&typeof e.start==='string'&&typeof e.end==='string'&&DaylaneModel.category(e.category))&&Array.isArray(s.habits)&&s.habits.every(e=>e&&typeof e.title==='string'&&typeof e.done==='boolean')&&Array.isArray(s.queue)&&s.queue.every(e=>e&&typeof e.title==='string'&&categories[e.category])}
return {snapshot,validSnapshot,categories};
})();
