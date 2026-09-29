const menuBtn=document.getElementById("menuBtn"),navMenu=document.getElementById("navMenu");
if(menuBtn&&navMenu){
  const closeMenu=()=>{navMenu.classList.remove("open");menuBtn.setAttribute("aria-expanded","false");menuBtn.textContent="☰"};
  menuBtn.setAttribute("aria-expanded","false");
  menuBtn.setAttribute("aria-controls","navMenu");
  menuBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();const open=navMenu.classList.toggle("open");menuBtn.setAttribute("aria-expanded",String(open));menuBtn.textContent=open?"✕":"☰"});
  navMenu.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
  document.addEventListener("click",e=>{if(navMenu.classList.contains("open")&&!navMenu.contains(e.target)&&e.target!==menuBtn)closeMenu()});
  window.addEventListener("resize",()=>{if(window.innerWidth>900)closeMenu()});
}
const year=document.getElementById("year");if(year)year.textContent=new Date().getFullYear();
const form=document.getElementById("enquiryForm"),formMessage=document.getElementById("formMessage");if(form){form.addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries(new FormData(form).entries());const msg=`Hello IT Cyber Technology,%0A%0AI want to enquire about admission.%0A%0AName: ${encodeURIComponent(d.name||"")}%0APhone: ${encodeURIComponent(d.phone||"")}%0AEmail: ${encodeURIComponent(d.email||"-")}%0ACourse: ${encodeURIComponent(d.course||"")}%0AMode: ${encodeURIComponent(d.mode||"")}%0AMessage: ${encodeURIComponent(d.message||"-")}`;window.open("https://wa.me/919763897697?text="+msg,"_blank");if(formMessage){formMessage.textContent="Opening WhatsApp…";formMessage.className="form-message ok"}})}
const revealEls=document.querySelectorAll(".reveal");
if(revealEls.length){
  if("IntersectionObserver" in window){
    const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");o.unobserve(e.target)}}),{threshold:.05,rootMargin:"0px 0px 40px 0px"});
    revealEls.forEach(e=>o.observe(e));
    setTimeout(()=>revealEls.forEach(e=>e.classList.add("visible")),1200);
  }else revealEls.forEach(e=>e.classList.add("visible"));
}
const current=(location.pathname.split("/").pop()||"index.html").toLowerCase();document.querySelectorAll("#navMenu a").forEach(a=>{if((a.getAttribute("href")||"").toLowerCase()===current)a.classList.add("nav-active")});
function safeText(v){return String(v??"")}


/* Premium interaction layer */
(()=>{
  const reduceMotion=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const progress=document.getElementById("scrollProgress");
  const updateProgress=()=>{
    if(!progress)return;
    const max=document.documentElement.scrollHeight-window.innerHeight;
    progress.style.width=(max>0?Math.min(100,(window.scrollY/max)*100):0)+"%";
  };
  updateProgress();
  window.addEventListener("scroll",updateProgress,{passive:true});
  window.addEventListener("resize",updateProgress,{passive:true});

  if(reduceMotion)return;

  const hero=document.querySelector(".hero");
  if(hero&&window.matchMedia("(pointer:fine)").matches){
    let raf=0;
    hero.addEventListener("pointermove",e=>{
      if(raf)return;
      raf=requestAnimationFrame(()=>{
        const r=hero.getBoundingClientRect();
        const x=((e.clientX-r.left)/r.width)*100;
        const y=((e.clientY-r.top)/r.height)*100;
        hero.style.setProperty("--mx",x+"%");
        hero.style.setProperty("--my",y+"%");
        raf=0;
      });
    },{passive:true});
  }

  if(window.matchMedia("(pointer:fine)").matches){
    document.querySelectorAll("[data-tilt], .feature-card, .course-card, .schedule-card, .info-card, .process-step").forEach(el=>{
      let frame=0;
      const reset=()=>{el.style.transform="";};
      el.addEventListener("pointermove",e=>{
        if(frame)return;
        frame=requestAnimationFrame(()=>{
          const r=el.getBoundingClientRect();
          const px=(e.clientX-r.left)/r.width-.5;
          const py=(e.clientY-r.top)/r.height-.5;
          const rx=(-py*4).toFixed(2);
          const ry=(px*5).toFixed(2);
          el.style.transform=`perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
          frame=0;
        });
      },{passive:true});
      el.addEventListener("pointerleave",reset,{passive:true});
    });
  }

  const counters=document.querySelectorAll(".impact-grid strong");
  if("IntersectionObserver" in window&&counters.length){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.animate(
            [{opacity:.2,transform:"translateY(12px) scale(.96)"},{opacity:1,transform:"translateY(0) scale(1)"}],
            {duration:650,easing:"cubic-bezier(.22,1,.36,1)",fill:"both"}
          );
          io.unobserve(entry.target);
        }
      });
    },{threshold:.35});
    counters.forEach(el=>io.observe(el));
  }
})();


/* Course catalog filtering */
(()=>{
  const buttons=[...document.querySelectorAll(".category-link")];
  const cards=[...document.querySelectorAll(".course-pro-card")];
  if(!buttons.length||!cards.length)return;
  buttons.forEach(btn=>btn.addEventListener("click",()=>{
    buttons.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const filter=btn.dataset.filter||"all";
    cards.forEach(card=>{
      const cats=(card.dataset.category||"").split(/\s+/);
      const show=filter==="all"||cats.includes(filter);
      card.classList.toggle("is-hidden",!show);
      if(show&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
        card.animate([{opacity:0,transform:"translateY(12px)"},{opacity:1,transform:"translateY(0)"}],{duration:320,easing:"ease-out"});
      }
    });
  }));
})();
