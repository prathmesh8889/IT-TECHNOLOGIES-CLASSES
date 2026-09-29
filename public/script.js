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
