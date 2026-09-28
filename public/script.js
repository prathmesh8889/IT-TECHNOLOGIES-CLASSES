const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
if (menuBtn && navMenu) {
  menuBtn.addEventListener("click", () => navMenu.classList.toggle("open"));
  navMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navMenu.classList.remove("open")));
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const form = document.getElementById("enquiryForm");
const formMessage = document.getElementById("formMessage");
if(form){form.addEventListener("submit",(e)=>{e.preventDefault();const d=Object.fromEntries(new FormData(form).entries());const msg=`Hello IT Cyber Technology,%0A%0AI want to enquire about admission.%0A%0AName: ${encodeURIComponent(d.name||"")}%0APhone: ${encodeURIComponent(d.phone||"")}%0AEmail: ${encodeURIComponent(d.email||"-")}%0ACourse: ${encodeURIComponent(d.course||"")}%0AMode: ${encodeURIComponent(d.mode||"")}%0AMessage: ${encodeURIComponent(d.message||"-")}`;window.open("https://wa.me/919763897697?text="+msg,"_blank");if(formMessage){formMessage.textContent="Opening WhatsApp…";formMessage.className="form-message ok";}});}
document.querySelectorAll(".reveal").forEach(el=>{new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("visible")}),{threshold:.12}).observe(el)});
const current=(location.pathname.split("/").pop()||"index.html").toLowerCase();
document.querySelectorAll("#navMenu a").forEach(a=>{if((a.getAttribute("href")||"").toLowerCase()===current)a.classList.add("nav-active")});
