/* Services: original desktop scroll timeline and a native mobile swipe carousel. */
(() => {
  const section=document.querySelector('#services');
  if(!section||!window.gsap||!window.ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger);
  const stage=section.querySelector('.services-stage');
  const slides=[...stage.querySelectorAll('.service-slide')];
  const visuals=slides.map(el=>el.querySelector('.service-visual'));
  const contents=slides.map(el=>el.querySelector('.service-content'));
  const media=gsap.matchMedia();
  media.add({desktop:'(min-width: 768px)',mobile:'(max-width: 767px)',reduce:'(prefers-reduced-motion: reduce)'},context=>{
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
    if(mobile){
      section.classList.add('services-carousel');
      let active=0,gesture=null,busy=false,disposed=false,frame,refreshTimer,suppressClickUntil=0;
      const duration=reduce?0:420,animations=[];
      const controls=document.createElement('div');controls.className='services-carousel-controls';
      const count=document.createElement('span');count.className='services-carousel-progress';count.setAttribute('aria-live','polite');count.setAttribute('aria-atomic','true');
      const bars=document.createElement('span');bars.className='services-carousel-bars';bars.setAttribute('aria-hidden','true');
      const indicators=slides.map(()=>{const bar=document.createElement('span');bars.append(bar);return bar;});
      controls.append(count,bars);stage.after(controls);
      const oldTabindex=stage.getAttribute('tabindex');stage.tabIndex=0;
      function labels(){
        const sr=document.documentElement.lang==='sr-Latn';
        stage.setAttribute('aria-label',sr?'Usluge — prevucite levo ili desno':'Services — swipe left or right');
      }
      function measure(){
        cancelAnimationFrame(frame);
        frame=requestAnimationFrame(()=>{
          if(disposed)return;
          const height=slides[active].offsetHeight;
          if(Math.abs(stage.offsetHeight-height)<1)return;
          stage.style.height=`${height}px`;
          clearTimeout(refreshTimer);
          refreshTimer=setTimeout(()=>{if(!disposed)ScrollTrigger.refresh();},duration+40);
        });
      }
      function sync(){
        slides.forEach((slide,i)=>{const current=i===active;slide.setAttribute('aria-hidden',String(!current));slide.inert=!current;slide.classList.toggle('is-active',current);});
        indicators.forEach((bar,i)=>bar.classList.toggle('is-active',i===active));
        count.textContent=`${String(active+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
        section.dataset.activeService=String(active+1).padStart(2,'0');labels();
      }
      async function go(index){
        if(disposed||busy||index<0||index>=slides.length||index===active)return;
        busy=true;const old=slides[active],direction=index>active?1:-1;active=index;
        const current=slides[active];current.hidden=false;sync();measure();
        if(duration){
          const leave=old.animate([{transform:'translateX(0)',opacity:1},{transform:`translateX(${-direction*12}%)`,opacity:0}],{duration,easing:'cubic-bezier(.22,.61,.36,1)'});
          const enter=current.animate([{transform:`translateX(${direction*12}%)`,opacity:0},{transform:'translateX(0)',opacity:1}],{duration,easing:'cubic-bezier(.22,.61,.36,1)'});
          animations.push(leave,enter);await Promise.allSettled([leave.finished,enter.finished]);
        }
        if(disposed)return;
        slides.forEach((slide,i)=>slide.hidden=i!==active);animations.length=0;busy=false;measure();
      }
      function prev(){go(active-1);}function advance(){go(active+1);}
      function down(e){if(e.isPrimary&&e.button===0)gesture={x:e.clientX,y:e.clientY,id:e.pointerId};}
      function up(e){
        if(!gesture||e.pointerId!==gesture.id)return;
        const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture=null;
        if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.4){suppressClickUntil=Date.now()+200;go(active+(dx<0?1:-1));}
      }
      function cancel(){gesture=null;}
      function click(e){if(Date.now()<suppressClickUntil){e.preventDefault();e.stopPropagation();}}
      function key(e){if(e.target.closest('input,textarea,summary'))return;if(e.key==='ArrowLeft'){e.preventDefault();prev();}else if(e.key==='ArrowRight'){e.preventDefault();advance();}}
      stage.addEventListener('pointerdown',down);stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',cancel);stage.addEventListener('click',click,true);section.addEventListener('keydown',key);
      slides.forEach((slide,i)=>slide.hidden=i!==active);sync();measure();
      const observer=new ResizeObserver(measure);slides.forEach(slide=>observer.observe(slide));
      const languageObserver=new MutationObserver(()=>{labels();measure();});languageObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
      return ()=>{
        disposed=true;observer.disconnect();languageObserver.disconnect();cancelAnimationFrame(frame);clearTimeout(refreshTimer);animations.forEach(a=>a.cancel());
        stage.removeEventListener('pointerdown',down);stage.removeEventListener('pointerup',up);stage.removeEventListener('pointercancel',cancel);stage.removeEventListener('click',click,true);section.removeEventListener('keydown',key);
        controls.remove();stage.style.removeProperty('height');stage.removeAttribute('aria-label');if(oldTabindex===null)stage.removeAttribute('tabindex');else stage.setAttribute('tabindex',oldTabindex);
        section.classList.remove('services-carousel');delete section.dataset.activeService;
        slides.forEach(slide=>{slide.hidden=false;slide.inert=false;slide.removeAttribute('aria-hidden');slide.classList.remove('is-active');});
      };
    }
  });
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
})();


