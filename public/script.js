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
async function loadManagedContent(){try{const r=await fetch("/api/site-data?t="+Date.now(),{cache:"no-store",headers:{"Cache-Control":"no-cache"}});if(!r.ok)throw new Error("Site data HTTP "+r.status);const d=await r.json(),courses=(d.courses||[]).filter(x=>x.active!==false),batches=(d.batches||[]).filter(x=>x.active!==false);
const cards=document.querySelector(".cards");if(cards)cards.innerHTML=courses.map(c=>`<article class="course-card"><span class="course-icon"></span><h3></h3><p></p><div class="meta"><span></span><span></span></div></article>`).join("");
if(cards)cards.querySelectorAll(".course-card").forEach((el,i)=>{const c=courses[i];if(!c)return;el.querySelector(".course-icon").textContent=safeText(c.icon);el.querySelector("h3").textContent=safeText(c.name);el.querySelector("p").textContent=safeText(c.description);const m=el.querySelectorAll(".meta span");m[0].textContent=safeText(c.duration);m[1].textContent=safeText(c.fee)});
const grid=document.querySelector(".feature-grid");if(grid&&location.pathname.toLowerCase().includes("courses")){grid.innerHTML="";courses.forEach(c=>{const a=document.createElement("article");a.className="feature-card reveal visible";const h=document.createElement("h3"),p=document.createElement("p"),m=document.createElement("div"),s1=document.createElement("span"),s2=document.createElement("span");h.textContent=(c.icon?c.icon+" ":"")+c.name;p.textContent=c.description;m.className="meta";s1.textContent=c.duration;s2.textContent=c.fee;m.append(s1,s2);a.append(h,p,m);grid.append(a)})}
const sg=document.querySelector(".schedule-grid");if(sg&&batches.length){sg.innerHTML="";batches.forEach(b=>{const x=document.createElement("div");x.className="schedule-card";const i=document.createElement("span"),h=document.createElement("h3"),st=document.createElement("strong"),p=document.createElement("p");i.textContent=b.icon;h.textContent=b.name;st.textContent=b.time;p.textContent=b.note;x.append(i,h,st,p);sg.append(x)})}
const select=document.querySelector('select[name="course"]');if(select&&courses.length){select.innerHTML='<option value="">Select course</option>';courses.forEach(c=>{const o=document.createElement("option");o.textContent=c.name;select.append(o)})}
if(d.settings){document.querySelectorAll('a[href^="tel:"]').forEach(a=>{a.href="tel:"+d.settings.phone.replace(/\s/g,"");a.textContent="📞 "+d.settings.phone});document.querySelectorAll('a[href^="mailto:"]').forEach(a=>{a.href="mailto:"+d.settings.email;a.textContent="✉️ "+d.settings.email});document.querySelectorAll(".whatsapp-float").forEach(a=>{a.href="https://wa.me/"+d.settings.whatsapp+"?text=Hello%20IT%20Cyber%20Technology%2C%20I%20want%20course%20details."});const nb=document.querySelector(".hero-card h3");if(nb&&d.settings.nextBatch)nb.textContent=d.settings.nextBatch}}
}catch(e){console.warn("Using built-in website content",e)}}
loadManagedContent();