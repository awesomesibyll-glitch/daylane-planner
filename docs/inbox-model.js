const DaylaneInbox=(()=>{
function week(date){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-(d.getDay()+6)%7);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function period(date,horizon){return horizon==='week'?week(date):date.slice(0,7)+'-01'}
function matches(item,horizon,anchor){return item.kind==='inbox'&&item.horizon===horizon&&item.planDate===period(anchor,horizon)}
function schedule(item,date,start,end,reminder=null){if(!item||item.kind!=='inbox'||!DaylaneModel.validRecord(item))return null;const task={kind:'task',id:item.id,title:item.title,notes:item.notes,category:item.category,done:item.done,date,start,end,reminder,...(item.subtasks?{subtasks:item.subtasks}:{})};return DaylaneModel.validRecord(task)?task:null}
return {week,period,matches,schedule};
})();
