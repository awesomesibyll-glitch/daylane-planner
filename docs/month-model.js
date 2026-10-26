const DaylaneMonth=(()=>{
const day=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function grid(anchor){const d=new Date(anchor+'T12:00:00');d.setDate(1);d.setDate(d.getDate()-(d.getDay()+6)%7);return Array.from({length:42},(_,i)=>{const cell=new Date(d);cell.setDate(cell.getDate()+i);return day(cell)})}
function shift(anchor,delta){const d=new Date(anchor+'T12:00:00'),last=new Date(d.getFullYear(),d.getMonth()+delta+1,0,12).getDate();return day(new Date(d.getFullYear(),d.getMonth()+delta,Math.min(d.getDate(),last),12))}
function data(records,anchor){const days=grid(anchor),month=anchor.slice(0,7),tasks=DaylaneModel.tasksForDates(records,days).sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title,'ru')),deadlines=records.filter(e=>(!e.kind||['task','inbox'].includes(e.kind))&&e.deadline&&days.includes(e.deadline)).sort((a,b)=>Number(a.done)-Number(b.done)||a.title.localeCompare(b.title,'ru'));return{days,tasks,deadlines,monthTasks:tasks.filter(e=>e.date.startsWith(month)),monthDeadlines:deadlines.filter(e=>e.deadline.startsWith(month))}}
return{grid,shift,data};
})();
