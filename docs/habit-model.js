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
