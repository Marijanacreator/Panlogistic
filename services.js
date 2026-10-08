/* Services only. One native-scroll timeline; no carousel, wheel listeners or nested pins. */
(() => {
  const section=document.querySelector('#services');
  if(!section||!window.gsap||!window.ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger);
  const stage=section.querySelector('.services-stage');
  const slides=[...stage.querySelectorAll('.service-slide')];
  const visuals=slides.map(el=>el.querySelector('.service-visual'));
  const contents=slides.map(el=>el.querySelector('.service-content'));
  const media=gsap.matchMedia();
  media.add({desktop:'(min-width: 0px)',mobile:'(max-width: 900px)',reduce:'(prefers-reduced-motion: reduce)'},context=>{
    const {desktop,mobile,reduce}=context.conditions;
    if(desktop&&!reduce){
      // ScrollTrigger temporarily resets scroll while measuring a pin. CSS
      // smooth scrolling must not animate that measurement reset.
      const root=document.documentElement;let savedScrollBehavior;
      function beginMeasure(){
        if(savedScrollBehavior===undefined)savedScrollBehavior=root.style.scrollBehavior;
        root.style.scrollBehavior='auto';
      }
      function endMeasure(){
        if(savedScrollBehavior!==undefined){root.style.scrollBehavior=savedScrollBehavior;savedScrollBehavior=undefined;}
      }
      ScrollTrigger.addEventListener('refreshInit',beginMeasure);
      ScrollTrigger.addEventListener('refresh',endMeasure);
      section.classList.add('services-enhanced');
      gsap.set(visuals,{opacity:0,scale:1.03});
      gsap.set(contents,{yPercent:100,opacity:0});
      gsap.set(visuals[0],{opacity:1,scale:1});
      gsap.set(contents[0],{yPercent:0,opacity:1});
      const state={position:0};let active=-1;
      function activate(){
        const next=state.position<.975?0:state.position<1.975?1:2;
        if(next===active)return;active=next;
        slides.forEach((slide,index)=>{
          const current=index===active;
          slide.classList.toggle('is-active',current);
          slide.setAttribute('aria-hidden',String(!current));slide.inert=!current;
        });
        section.dataset.activeService=String(active+1).padStart(2,'0');
      }
      const tl=gsap.timeline({defaults:{ease:'none',immediateRender:false},onUpdate:activate,scrollTrigger:{id:'services-sequence',trigger:stage,pin:stage,pinType:'fixed',refreshPriority:10,start:'top top',end:()=>`+=${innerHeight*3}`,scrub:true,anticipatePin:1}});
      tl.fromTo(state,{position:0},{position:3,duration:3},0).addLabel('service-01',0).addLabel('service-02',1).addLabel('service-03',2);
      for(let index=1;index<slides.length;index++){
        const at=index-.2;
        tl.fromTo(contents[index-1],{yPercent:0,opacity:1},{yPercent:-100,opacity:0,duration:.35},at)
          .fromTo(contents[index],{yPercent:100,opacity:0},{yPercent:0,opacity:1,duration:.35},at)
          .fromTo(visuals[index-1],{opacity:1,scale:1},{opacity:0,duration:.35},at)
          .fromTo(visuals[index],{opacity:0,scale:1.03},{opacity:1,scale:1,duration:.35},at);
      }
      activate();
      return ()=>{
        ScrollTrigger.removeEventListener('refreshInit',beginMeasure);
        ScrollTrigger.removeEventListener('refresh',endMeasure);endMeasure();
        section.classList.remove('services-enhanced');delete section.dataset.activeService;
        slides.forEach(slide=>{slide.classList.remove('is-active');slide.removeAttribute('aria-hidden');slide.inert=false;});
      };
    }
    // Native, readable stacked flow on mobile; reduced motion remains entirely static.
    if(mobile&&!reduce&&'IntersectionObserver' in window){
      contents.forEach(content=>content.classList.add('service-reveal-pending'));
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('service-reveal-visible');observer.unobserve(entry.target);}
      }),{threshold:.08});
      contents.forEach(content=>observer.observe(content));
      return ()=>{observer.disconnect();contents.forEach(content=>content.classList.remove('service-reveal-pending','service-reveal-visible'));};
    }
  });
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
})();


