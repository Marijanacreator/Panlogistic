/* Numbers only: native scroll selects a single editorial statistic. */
(() => {
  const section=document.querySelector('#numbers');
  if(!section||!window.gsap||!window.ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger);
  const states=[...section.querySelectorAll('.number-state')];
  const index=[...section.querySelectorAll('.numbers-index li')];
  const media=gsap.matchMedia();
  media.add({desktop:'(min-width:0px)',reduce:'(prefers-reduced-motion:reduce)'},context=>{
    if(context.conditions.reduce)return;
    if(!context.conditions.desktop){
      states.forEach(state=>gsap.fromTo(state,{y:35,opacity:0},{y:0,opacity:1,duration:.75,ease:'power2.out',scrollTrigger:{trigger:state,start:'top 85%',once:true}}));
      return;
    }
    section.classList.add('numbers-enhanced');
    const position={value:0};let active=-1;
    function activate(){
      const current=Math.min(3,Math.floor(position.value+.025));
      if(current===active)return;active=current;
      index.forEach((item,i)=>{item.classList.toggle('is-active',i===current);if(i===current)item.setAttribute('aria-current','true');else item.removeAttribute('aria-current');});
      states.forEach((state,i)=>{state.setAttribute('aria-hidden',String(i!==current));state.inert=i!==current;});
    }
    gsap.set(states,{opacity:0,y:80});gsap.set(states[0],{opacity:1,y:0});
    const tl=gsap.timeline({defaults:{ease:'none',immediateRender:false},onUpdate:activate,scrollTrigger:{id:'numbers-sequence',trigger:section,pin:section,pinType:'fixed',start:'top top',end:()=>`+=${innerHeight*4}`,scrub:true,anticipatePin:1}});
    tl.fromTo(position,{value:0},{value:4,duration:4},0);
    for(let i=1;i<states.length;i++){
      tl.fromTo(states[i-1],{y:0,opacity:1},{y:-60,opacity:0,duration:.16},i-.2)
        .fromTo(states[i],{y:80,opacity:0},{y:0,opacity:1,duration:.16},i-.04);
    }
    states.forEach((state,i)=>{
      const geography=state.querySelector('.route-geography');
      if(geography){
        gsap.set(geography,{opacity:0});
        tl.fromTo(geography,{opacity:0},{opacity:1,duration:.28},i+.05);
        const routes=[...state.querySelectorAll('.route-connections path')];
        routes.forEach((path,route)=>{
          const length=path.getTotalLength();
          gsap.set(path,{strokeDasharray:length,strokeDashoffset:length});
          tl.fromTo(path,{strokeDashoffset:length},{strokeDashoffset:0,duration:.26},i+.24+route*(.48/Math.max(1,routes.length-1)));
        });
      }
      const paths=[...state.querySelectorAll('.visual-lines path,.visual-lines circle')];
      paths.forEach(path=>{
        const length=path.getTotalLength();
        gsap.set(path,{strokeDasharray:length,strokeDashoffset:length});
        tl.fromTo(path,{strokeDashoffset:length},{strokeDashoffset:0,duration:.55},i+.05);
      });
      const points=state.querySelectorAll('.market-points circle');
      if(points.length){gsap.set(points,{opacity:0});tl.fromTo(points,{opacity:0},{opacity:1,duration:.12,stagger:.035},i+.15);}
    });
    activate();
    return ()=>{section.classList.remove('numbers-enhanced');states.forEach(state=>{state.removeAttribute('aria-hidden');state.inert=false;});index.forEach((item,i)=>{item.classList.toggle('is-active',i===0);item.removeAttribute('aria-current');});};
  });
  ScrollTrigger.sort();ScrollTrigger.refresh();
})();

