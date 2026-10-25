(function(){
function updateVisibleHeight(){const height=window.visualViewport?.height||window.innerHeight;document.documentElement.style.setProperty('--daylane-visible-height',Math.round(height)+'px')}
updateVisibleHeight();window.visualViewport?.addEventListener('resize',updateVisibleHeight);window.addEventListener('resize',updateVisibleHeight);
const timeline=$('scroll');let lastTimelinePosition=timeline.offsetParent!==null&&timeline.scrollTop>0?timeline.scrollTop:420;
timeline.addEventListener('scroll',()=>{if(timeline.offsetParent!==null&&timeline.scrollHeight>timeline.clientHeight)lastTimelinePosition=timeline.scrollTop},{passive:true});
const previousView=showDaylaneView;showDaylaneView=function(journal){previousView(journal);if(!journal&&timeline.scrollTop===0)timeline.scrollTop=lastTimelinePosition};
})();
