// menu overlay
const menuBtn=document.getElementById('menuBtn'),overlay=document.getElementById('menuOverlay');
menuBtn.addEventListener('click',()=>overlay.classList.add('open'));
document.getElementById('menuClose').addEventListener('click',()=>overlay.classList.remove('open'));
overlay.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>overlay.classList.remove('open')));

// play/pause videos as they enter view (8 videos on page — load lazily)
const vids=document.querySelectorAll('video');
const vio=new IntersectionObserver(es=>es.forEach(e=>{
  const v=e.target;
  if(e.isIntersecting){ if(v.preload==='none'){v.preload='auto';v.load();} v.play().catch(()=>{}); }
  else v.pause();
}),{rootMargin:'150px'});
vids.forEach(v=>vio.observe(v));

// why accordion
document.querySelectorAll('.why-item').forEach(it=>it.addEventListener('click',()=>{
  document.querySelectorAll('.why-item').forEach(o=>o.classList.remove('active'));
  it.classList.add('active');
}));

// "View Car" preselects the car in the booking form
document.querySelectorAll('[data-car]').forEach(a=>a.addEventListener('click',()=>{
  const cs=document.getElementById('carSelect');
  if(cs)cs.value=a.dataset.car; else localStorage.setItem('brx-car',a.dataset.car);
}));
const csInit=document.getElementById('carSelect');
if(csInit){const pre=localStorage.getItem('brx-car');if(pre){csInit.value=pre;localStorage.removeItem('brx-car');}}

// booking form -> FormSubmit relay (same endpoint as previous site)
const bookFormEl=document.getElementById('bookForm');
if(bookFormEl)bookFormEl.addEventListener('submit',async ev=>{
  ev.preventDefault();
  const f=ev.target,msg=document.getElementById('formMsg');
  if(!f.name.value||!f.phone.value||!f.email.value||!f.date.value||!f.car.value){
    msg.textContent='Please fill in all required fields.';msg.className='form-msg err';return;
  }
  const btn=f.querySelector('button[type=submit]');
  btn.disabled=true;btn.style.opacity=.6;msg.textContent='Sending…';msg.className='form-msg';
  try{
    const r=await fetch('https://formsubmit.co/ajax/9308ede8d622982865ddadee6b9842f0',{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({
        _subject:'New booking request - Black & Red Exotics',
        _template:'table',
        name:f.name.value,phone:f.phone.value,email:f.email.value,
        'rental date':f.date.value,duration:f.duration.value,car:f.car.value,
        notes:f.notes.value||'-'
      })
    });
    if(!r.ok)throw new Error();
    msg.textContent='Request received — we’ll reach out shortly to confirm your dates.';
    msg.className='form-msg ok';f.reset();
  }catch(e){
    msg.textContent='Something went wrong — please call or text (323) 422-4831.';
    msg.className='form-msg err';
  }finally{btn.disabled=false;btn.style.opacity=1;}
});

// ===== interactivity layer (GSAP + Lenis) =====
(function(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced||typeof gsap==='undefined')return;
  document.documentElement.classList.add('has-motion');
  gsap.registerPlugin(ScrollTrigger);

  // buttery smooth scroll
  let lenis=null;
  if(typeof Lenis!=='undefined'){
    lenis=new Lenis({lerp:.09,wheelMultiplier:1.05});
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(t=>lenis.raf(t*1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
      const t=document.querySelector(a.getAttribute('href'));
      if(t){e.preventDefault();lenis.scrollTo(t,{offset:0,duration:1.4});}
    }));
  }

  // fixed nav: glass after hero, hide on scroll down / show on up
  const header=document.querySelector('header');
  header.classList.add('fixed-nav');
  let lastY=0;
  ScrollTrigger.create({
    start:0,end:'max',
    onUpdate(self){
      const y=self.scroll();
      header.classList.toggle('scrolled',y>90);
      header.classList.toggle('hidden',y>500&&y>lastY+2);
      lastY=y;
    }
  });

  // hero entrance: mask-reveal each headline line, then CTAs
  const h1=document.querySelector('.hero h1');
  if(h1){
  h1.innerHTML=h1.innerHTML.split('<br>').map(l=>`<span class="line"><span>${l}</span></span>`).join('');
  gsap.timeline({defaults:{ease:'power4.out'}})
    .fromTo('.hero h1 .line>span',{yPercent:110},{yPercent:0,duration:1.1,stagger:.12,delay:.15})
    .fromTo('.hero .cta a',{y:26,opacity:0},{y:0,opacity:1,duration:.7,stagger:.1,clearProps:'transform,opacity'},'-=.5')
    .fromTo('header',{y:-30,opacity:0},{y:0,opacity:1,duration:.7,clearProps:'transform,opacity'},'-=.8');

  // hero parallax on scroll
  gsap.to('.hero video',{yPercent:16,scale:1.12,ease:'none',
    scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero-inner',{yPercent:-18,opacity:.15,ease:'none',
    scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  } else {
    gsap.fromTo('header',{y:-30,opacity:0},{y:0,opacity:1,duration:.7,clearProps:'transform,opacity'});
    gsap.utils.toArray('.page-hero h1, .page-hero .car-price, .page-hero .cta a').forEach((el,i)=>
      gsap.fromTo(el,{y:40,opacity:0},{y:0,opacity:1,duration:.9,delay:.15+i*.1,ease:'power3.out',clearProps:'transform,opacity'}));
  }

  // scroll reveals
  const rise=(els,vars={})=>gsap.utils.toArray(els).forEach((el,i)=>{
    gsap.from(el,{y:56,opacity:0,duration:1,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 88%'},...vars});
  });
  rise('.sec-head, .how h2, .why h2, .occ h2, .book h2, .book .sub');
  gsap.utils.toArray('.fleet-grid .car').forEach((el,i)=>gsap.from(el,{y:80,opacity:0,duration:1.1,ease:'power3.out',delay:(i%2)*.12,scrollTrigger:{trigger:el,start:'top 90%'}}));
  gsap.from('.how-grid>div',{y:60,opacity:0,duration:.9,ease:'power3.out',stagger:.12,scrollTrigger:{trigger:'.how-grid',start:'top 85%'}});
  gsap.from('.why-item',{x:-40,opacity:0,duration:.8,ease:'power3.out',stagger:.1,scrollTrigger:{trigger:'.why-list',start:'top 85%'}});
  gsap.from('.why-img',{scale:.92,opacity:0,duration:1.1,ease:'power3.out',scrollTrigger:{trigger:'.why-img',start:'top 85%'}});
  gsap.from('.occ-tile',{y:70,opacity:0,duration:1,ease:'power3.out',stagger:.12,scrollTrigger:{trigger:'.occ-grid',start:'top 88%'}});
  gsap.from('#bookForm .field, #bookForm button',{y:30,opacity:0,duration:.7,ease:'power3.out',stagger:.07,scrollTrigger:{trigger:'#bookForm',start:'top 85%'}});
  gsap.from('.foot-grid>*',{y:40,opacity:0,duration:.9,ease:'power3.out',stagger:.1,scrollTrigger:{trigger:'footer',start:'top 90%'}});

  // fleet card 3D tilt
  document.querySelectorAll('.car').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      gsap.to(card,{rotateY:x*5,rotateX:-y*5,transformPerspective:900,duration:.5,ease:'power2.out'});
    });
    card.addEventListener('mouseleave',()=>gsap.to(card,{rotateX:0,rotateY:0,duration:.7,ease:'power3.out'}));
  });

  // magnetic buttons
  document.querySelectorAll('.pill').forEach(b=>{
    b.addEventListener('mousemove',e=>{
      const r=b.getBoundingClientRect();
      gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.35,duration:.4});
    });
    b.addEventListener('mouseleave',()=>gsap.to(b,{x:0,y:0,duration:.5,ease:'elastic.out(1,.5)'}));
  });

  // custom cursor
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.documentElement.classList.add('has-cursor');
    const dot=document.createElement('div'),ring=document.createElement('div');
    dot.className='cursor-dot';ring.className='cursor-ring';
    document.body.append(dot,ring);
    const rx=gsap.quickTo(ring,'left',{duration:.35,ease:'power3'}),ry=gsap.quickTo(ring,'top',{duration:.35,ease:'power3'});
    addEventListener('mousemove',e=>{
      dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';
      rx(e.clientX);ry(e.clientY);
    });
    document.querySelectorAll('a,button,select,input,.why-item').forEach(el=>{
      el.addEventListener('mouseenter',()=>ring.classList.add('hovering'));
      el.addEventListener('mouseleave',()=>ring.classList.remove('hovering'));
    });
  }
})();