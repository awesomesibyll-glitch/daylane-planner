const DaylaneReminders=(()=>{
const offsets=[0,5,10,15,30,60,120,1440];
function day(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function dateTime(e){return new Date(e.date+'T'+e.start+':00').getTime()}
function occurrenceKey(e){return [e._seriesId||e.id,e._occurrenceDate||e.date,e.date,e.start,e.reminder].join('|')}
function candidates(records,now){const anchor=new Date(now),days=[];for(let i=-1;i<=2;i++){const d=new Date(anchor);d.setDate(d.getDate()+i);days.push(day(d))}return DaylaneModel.tasksForDates(records,days).filter(e=>!e.done&&offsets.includes(e.reminder)).map(e=>({...e,at:dateTime(e)-e.reminder*60000,startAt:dateTime(e),key:occurrenceKey(e)})).sort((a,b)=>a.at-b.at)}
function due(records,now,seen={}){return candidates(records,now).filter(e=>e.at<=now&&now-e.at<=600000&&new Date(e.date+'T'+e.end+':00').getTime()>now&&!seen[e.key])}
function upcoming(records,now){return candidates(records,now).filter(e=>e.at>now).slice(0,8)}
function escape(s){return String(s).replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,')}
function fold(line){const rows=[];let value='',bytes=0;for(const ch of line){const length=new TextEncoder().encode(ch).length;if(bytes+length>75){rows.push(value);value=' ';bytes=1}value+=ch;bytes+=length}rows.push(value);return rows.join('\r\n')}
function stamp(d,t){return d.replaceAll('-','')+'T'+t.replace(':','')+'00'}
function firstDay(e){if(!e.repeat)return e.date;const d=new Date(e.date+'T12:00:00');for(let i=0;i<8;i++){const s=day(d);if(DaylaneModel.applies(e,s))return s;d.setDate(d.getDate()+1)}return null}
function calendar(records,now=new Date()){const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Daylane//Personal Planner//RU','CALSCALE:GREGORIAN','X-WR-CALNAME:Daylane Planner'];const created=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');let count=0;
function event(e,uid,recurrence=null,rule=null,excluded=[]){lines.push('BEGIN:VEVENT','UID:'+escape(uid),'DTSTAMP:'+created);if(recurrence)lines.push('RECURRENCE-ID:'+recurrence);lines.push('DTSTART:'+stamp(e.date,e.start),'DTEND:'+stamp(e.date,e.end),'SUMMARY:'+escape(e.title));if(e.notes)lines.push('DESCRIPTION:'+escape(e.notes));if(rule)lines.push('RRULE:'+rule);if(excluded.length)lines.push('EXDATE:'+excluded.join(','));if(!e.done&&offsets.includes(e.reminder))lines.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+escape(e.title),'TRIGGER:'+(e.reminder===0?'PT0M':'-PT'+e.reminder+'M'),'END:VALARM');lines.push('END:VEVENT');count++}
for(const e of records){if(e.kind==='journal')continue;const first=firstDay(e);if(!first)continue;const uid=e.id+'@daylane';let rule=null;if(e.repeat){rule='FREQ='+e.repeat.frequency.toUpperCase();if(e.repeat.frequency==='weekly')rule+=';BYDAY='+e.repeat.days.map(n=>['MO','TU','WE','TH','FR','SA','SU'][n-1]).join(',');if(e.repeat.until)rule+=';UNTIL='+e.repeat.until.replaceAll('-','')+'T235959'}const cancelled=Object.entries(e.exceptions||{}).filter(([d,x])=>x.cancelled&&DaylaneModel.applies(e,d)).map(([d])=>stamp(d,e.start));event({...e,date:first},uid,null,rule,cancelled);if(e.repeat)for(const [source,x]of Object.entries(e.exceptions||{})){if(x.cancelled||!DaylaneModel.applies(e,source))continue;event({...e,done:false,...x,date:x.date||source},uid,stamp(source,e.start))}}
lines.push('END:VCALENDAR');return {text:lines.map(fold).join('\r\n')+'\r\n',count}}
return {offsets,day,dateTime,occurrenceKey,candidates,due,upcoming,calendar};
})();
