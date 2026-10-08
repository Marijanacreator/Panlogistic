/* Animation utilities for the existing content sections. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function initReveals(){
    if(reduced || !('IntersectionObserver' in window))return;
    document.body.classList.add('motion-enabled');
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  }
  function initTruckStories(){
    if(reduced||!window.gsap||!window.ScrollTrigger)return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add({wide:'(min-width:601px) and (min-height:501px), (min-width:901px)',compact:'(max-width:600px), (max-width:900px) and (max-height:500px)'},context=>{
      const company=document.querySelector('.company-story');
      const companyTruck=company.querySelector('.story-truck');
      const panels=company.querySelector('.story-panels');
      const cards=[...panels.children];
      const compact=context.conditions.compact;
      company.classList.add('company-horizontal');
      function measureCompanyClearance(){
        if(compact)return;
        const visual=company.querySelector('.story-visual');
        const top=visual.getBoundingClientRect().top;
        const bottom=Math.max(...[visual.querySelector('h2'),visual.querySelector('.company-copy')].map(el=>el.getBoundingClientRect().bottom-top));
        company.style.setProperty('--company-text-bottom',`${Math.ceil(bottom+28)}px`);
          company.style.setProperty('--company-track-height',`${Math.ceil(companyTruck.offsetHeight || company.clientWidth*.141)}px`);
      }
      measureCompanyClearance();
      ScrollTrigger.addEventListener('refreshInit',measureCompanyClearance);
      const cardContents=cards.map(card=>{
        const content=document.createElement('div');content.className='company-panel-content';
        content.append(...card.children);card.append(content);return content;
      });
      gsap.set(cardContents,{clipPath:'circle(0% at 0% 0%)'});
      gsap.set(companyTruck,{xPercent:0,x:-companyTruck.offsetWidth});
      const journey=gsap.timeline({defaults:{ease:'none',immediateRender:false},scrollTrigger:{id:'company-truck-journey',trigger:company,pin:company,pinType:'fixed',refreshPriority:5,start:'top top',end:()=>`+=${innerHeight*2.8}`,scrub:true,anticipatePin:1}});
      // Positive X is exclusively a left-to-right journey when scrolling down.
      journey.fromTo(companyTruck,{xPercent:0,x:()=>-companyTruck.offsetWidth},{x:()=>company.clientWidth+32,duration:2.5},0);
      if(compact)journey.fromTo(panels,{x:0},{x:()=>-company.clientWidth*2,duration:1.3},.8);
      cardContents.forEach((content,index)=>{
        journey.fromTo(content,{clipPath:'circle(0% at 0% 0%)'},{clipPath:'circle(150% at 0% 0%)',duration:.65},.3+index*.65);
      });
      const statement=document.querySelector('.statement');
      const headlineLines=[...statement.querySelectorAll('.statement-line-text')];
      const supporting=[statement.querySelector('.eyebrow'),statement.querySelector('.body-copy'),statement.querySelector('.note')].filter(Boolean);
      statement.querySelectorAll('.reveal').forEach(el=>el.classList.remove('reveal'));
      gsap.set(headlineLines,{yPercent:115});
      gsap.set(supporting,{y:35,opacity:0});
      const reveal=gsap.timeline({scrollTrigger:{trigger:statement,start:'top 65%',once:true}});
      reveal.to(headlineLines,{yPercent:0,duration:.8,stagger:.18,ease:'power3.out'},.1)
        .to(supporting,{y:0,opacity:1,duration:.7,stagger:.15,ease:'power2.out'},0);
      const typeTruck=document.querySelector('.type-truck');
      const intro=document.querySelector('.services-intro');
      const introParent=intro.parentElement;
      const heroScene=document.createElement('div');heroScene.className='hero-handoff';
      hero.before(heroScene);heroScene.append(hero,intro);
      const cover=document.createElement('div');cover.className='hero-handoff-cover';cover.setAttribute('aria-hidden','true');
      heroScene.insertBefore(cover,intro);
      const introLines=[...intro.querySelectorAll('.handoff-line>span')];
      gsap.set([intro,cover],{y:innerHeight});gsap.set(cover,{height:innerHeight});gsap.set(introLines,{yPercent:115});
      const motion=gsap.timeline({defaults:{ease:'none',immediateRender:false},onUpdate:updateNavigation,scrollTrigger:{trigger:heroScene,pin:true,pinType:'fixed',refreshPriority:20,start:'top top',end:()=>`+=${innerHeight*(compact?1.3:2.2)}`,scrub:true,anticipatePin:1}});
      // Compensate only the mobile word for the truck roof's measured approach rise.
      if(compact)motion.fromTo('.hero-motion .oversized',{y:0},{y:()=>-typeTruck.offsetHeight*.3,duration:.85,ease:'none'},0);
      motion.fromTo(typeTruck,{xPercent:compact?0:40,x:0,scale:1},{xPercent:0,x:0,scale:compact?1.3:1.65,duration:.85},0)
        .fromTo(typeTruck,{x:0},{x:()=>-(typeTruck.offsetLeft+typeTruck.offsetWidth*(compact?1.3:1.65)+40),duration:1.15},.65)
        .fromTo('.hero-motion .oversized',{scale:1},{scale:compact?2.3:3.8,duration:1.65,ease:'power1.in'},0)
        .fromTo('.hero-motion .oversized',{opacity:.72},{opacity:1,duration:.6},0)
        .to('.hero-motion .oversized',{opacity:0,duration:.4},1.25)
        .fromTo(compact?'.hero-copy > *,.hero-scroll':'.hero-copy,.hero-scroll',{y:0,opacity:1},{y:-24,opacity:0,duration:.45},.05)
        .fromTo(intro,{y:()=>innerHeight},{y:0,duration:1},compact?.65:.8)
        .fromTo(cover,{y:()=>innerHeight},{y:0,duration:1},compact?.65:.8)
        .fromTo(cover,{height:()=>innerHeight},{height:()=>intro.offsetHeight,duration:.4},1.4)
        .fromTo(hero,{opacity:1},{opacity:0,duration:.15},1.65)
        .fromTo(introLines,{yPercent:115},{yPercent:0,duration:.4,stagger:.14},1.1)
        ;
      return ()=>{ScrollTrigger.removeEventListener('refreshInit',measureCompanyClearance);company.style.removeProperty('--company-text-bottom');heroScene.before(hero);introParent.prepend(intro);heroScene.remove();company.classList.remove('company-horizontal');cardContents.forEach(content=>content.replaceWith(...content.children));};
    });
  }
  const header=document.querySelector('.header');
  const hero=document.querySelector('#home');
  const contact=document.querySelector('#contact');
  function updateNavigation(){
    header.classList.toggle('is-scrolled',scrollY>60);
    const contactBounds=contact.getBoundingClientRect();
    const overContact=contactBounds.top<header.offsetHeight&&contactBounds.bottom>0;
    const introBounds=document.querySelector('.services-intro').getBoundingClientRect();
    const overIntro=introBounds.top<header.offsetHeight&&introBounds.bottom>0;
    header.classList.toggle('on-paper',(overIntro||hero.getBoundingClientRect().bottom<header.offsetHeight)&&!overContact);
  }
  window.addEventListener('scroll',updateNavigation,{passive:true});
  updateNavigation();
  initReveals();initTruckStories();
})();












/* Cursor enhancement is independent of the scroll animation timelines. */
(() => {
  const media=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  let dispose;
  function update(){
    if(dispose){dispose();dispose=null;}
    if(!media.matches)return;
    const cursor=document.createElement('div');cursor.className='premium-cursor';cursor.setAttribute('aria-hidden','true');document.body.append(cursor);
    document.documentElement.classList.add('custom-cursor');
    function move(e){
      cursor.style.left=`${e.clientX}px`;cursor.style.top=`${e.clientY}px`;
      const target=e.target;
      const editing=target.closest('input,textarea,[contenteditable="true"]');
      cursor.classList.toggle('is-visible',!editing);
      cursor.classList.toggle('is-link',!!target.closest('a,button,summary,[role="button"]'));
      let surface=target,color;
      while(surface&&surface!==document.documentElement){
        color=getComputedStyle(surface).backgroundColor;
        if(color!=='rgba(0, 0, 0, 0)'&&color!=='transparent')break;
        surface=surface.parentElement;
      }
      const rgb=(color||'').match(/[\d.]+/g);
      cursor.classList.toggle('on-dark',!!rgb&&(.2126*Number(rgb[0])+.7152*Number(rgb[1])+.0722*Number(rgb[2]))<110);
    }
    function hide(){cursor.classList.remove('is-visible');}
    document.addEventListener('pointermove',move,{passive:true});
    document.documentElement.addEventListener('pointerleave',hide);
    window.addEventListener('blur',hide);
    dispose=()=>{document.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',hide);window.removeEventListener('blur',hide);cursor.remove();document.documentElement.classList.remove('custom-cursor');};
  }
  media.addEventListener('change',update);update();
})();

