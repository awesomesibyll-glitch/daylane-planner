const DaylaneRollover=(()=>{
function shift(date,n){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
const minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3));
function pending(records,today,minute,span=30){if(!DaylaneModel.date(today)||!Number.isInteger(minute)||minute<0||minute>1439||![7,30,90,365].includes(span))return [];const days=Array.from({length:span},(_,i)=>shift(today,-i));return DaylaneModel.tasksForDates(records,days).filter(t=>!t.done&&(t.date<today||minutes(t.end)<=minute)).sort((a,b)=>b.date.localeCompare(a.date)||a.start.localeCompare(b.start)||a.title.localeCompare(b.title,'ru'))}
function move(records,item,date,start,today,minute){if(!DaylaneModel.date(date)||!DaylaneModel.date(today)||date<today||!Number.isInteger(start)||date===today&&start<minute)return null;const fresh=DaylaneModel.tasksForDates(records,[item.date]).find(t=>t.id===item.id);if(!fresh||fresh.done||fresh.date>today||fresh.date===today&&minutes(fresh.end)>minute)return null;return DaylaneModel.moveTask(records,fresh,date,start)}
return{pending,move,shift};})();
