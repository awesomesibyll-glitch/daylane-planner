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
