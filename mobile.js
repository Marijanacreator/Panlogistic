/* Mobile layout is assembled before the existing scroll scenes are measured. */
(() => {
 const query='(max-width:600px), (max-width:900px) and (max-height:500px)';
 const media=matchMedia(query);
 const nav=document.querySelector('#mobile-navigation'),open=document.querySelector('.menu-toggle'),close=nav.querySelector('.menu-close');
 const main=document.querySelector('main'),header=document.querySelector('.header');
 let active=false,saved,composition;
 function shut(restore=true){
  if(!active)return;active=false;nav.hidden=true;open.setAttribute('aria-expanded','false');
  document.documentElement.style.overflow=saved.root;document.body.style.overflow=saved.body;
  main.inert=saved.main;header.querySelector('.wordmark').inert=saved.logo;
  if(restore)open.focus();
 }
 open.addEventListener('click',()=>{
  if(!media.matches)return;
  saved={root:document.documentElement.style.overflow,body:document.body.style.overflow,main:main.inert,logo:header.querySelector('.wordmark').inert};
  active=true;nav.hidden=false;open.setAttribute('aria-expanded','true');main.inert=true;header.querySelector('.wordmark').inert=true;
  document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';close.focus();
 });
 close.addEventListener('click',()=>shut());
 nav.addEventListener('click',e=>{
  const link=e.target.closest('a');
  if(link){shut(false);const target=document.querySelector(link.getAttribute('href'));if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}}
  else if(e.target.closest('[data-language]'))shut();
 });
 document.addEventListener('keydown',e=>{
  if(!active)return;
  if(e.key==='Escape'){e.preventDefault();shut();}
  if(e.key==='Tab'){
   const items=[...nav.querySelectorAll('button,a')],first=items[0],last=items[items.length-1];
   if(e.shiftKey&&(document.activeElement===first||!nav.contains(document.activeElement))){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 });
 const hero=document.querySelector('#home');
 const parts=[hero.querySelector('.hero-copy'),hero.querySelector('.oversized'),hero.querySelector('.type-truck'),hero.querySelector('.hero-scroll')];
 const mapAttributes=new Map();
 document.querySelectorAll('.markets-map,.routes-map').forEach(map=>mapAttributes.set(map,map.getAttribute('preserveAspectRatio')));
 function fit(){
  if(!composition)return;
  const word=hero.querySelector('.oversized');
  const style=getComputedStyle(word),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  ctx.font=`${style.fontWeight} 100px ${style.fontFamily}`;
  const text=word.textContent.trim(),advance=ctx.measureText(text).width-5*(text.length-1);
  const available=composition.clientWidth-parseFloat(getComputedStyle(composition).paddingLeft)-parseFloat(getComputedStyle(composition).paddingRight);
  composition.style.setProperty('--word-fit',`${available/advance*100*.97}px`);
 }
 function adapt(){
  shut(false);
  header.querySelector('#site-navigation').inert=media.matches;
  if(media.matches&&!composition){
   composition=document.createElement('div');composition.className='mobile-hero-composition';hero.append(composition);parts.forEach(el=>composition.append(el));
   mapAttributes.forEach((original,map)=>map.setAttribute('preserveAspectRatio','xMidYMid meet'));
  }else if(!media.matches&&composition){parts.forEach(el=>hero.append(el));composition.remove();composition=null;mapAttributes.forEach((original,map)=>map.setAttribute('preserveAspectRatio',original));}
  fit();
 }
 const observer=new MutationObserver(()=>{fit();if(media.matches&&window.ScrollTrigger)requestAnimationFrame(()=>ScrollTrigger.refresh());});
 observer.observe(hero.querySelector('.oversized'),{childList:true,characterData:true,subtree:true});
 media.addEventListener('change',adapt);window.addEventListener('resize',fit,{passive:true});
 adapt();document.fonts.ready.then(()=>{fit();if(window.ScrollTrigger)ScrollTrigger.refresh();});window.addEventListener('load',()=>{fit();if(window.ScrollTrigger)ScrollTrigger.refresh();},{once:true});
})();
