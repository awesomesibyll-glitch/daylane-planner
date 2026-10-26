(function(){
function updateVisibleHeight(){const height=window.visualViewport?.height||window.innerHeight;document.documentElement.style.setProperty('--daylane-visible-height',Math.round(height)+'px')}
const touchDevice=()=>navigator.maxTouchPoints>0||window.matchMedia('(pointer: coarse)').matches;
if(touchDevice())document.documentElement.classList.add('daylane-touch');
function stopZoom(event){if(touchDevice()&&event.cancelable)event.preventDefault()}
for(const name of ['gesturestart','gesturechange'])document.addEventListener(name,stopZoom,{passive:false});
function stopPinch(event){if(event.touches?.length>1)stopZoom(event)}
document.addEventListener('click',event=>{if(window.innerWidth<=720&&event.target?.closest?.('.app-tabs button'))document.querySelector('.layout')?.scrollTo({top:0,behavior:'instant'})});
document.addEventListener('touchstart',stopPinch,{passive:false});document.addEventListener('touchmove',stopPinch,{passive:false});
updateVisibleHeight();window.visualViewport?.addEventListener('resize',updateVisibleHeight);window.addEventListener('resize',updateVisibleHeight);
const timeline=$('scroll');let lastTimelinePosition=timeline.offsetParent!==null&&timeline.scrollTop>0?timeline.scrollTop:420;
timeline.addEventListener('scroll',()=>{if(timeline.offsetParent!==null&&timeline.scrollHeight>timeline.clientHeight)lastTimelinePosition=timeline.scrollTop},{passive:true});
const previousView=showDaylaneView;showDaylaneView=function(journal){previousView(journal);if(!journal&&timeline.scrollTop===0)timeline.scrollTop=lastTimelinePosition};
})();
