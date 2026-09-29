(()=>{
const db=window.itcyberDb;if(!db)return;
const fmtFee=v=>"₹"+Number(v||0).toLocaleString("en-IN");

async function loadHero(){
  const {data}=await db.from("site_content").select("value").eq("key","hero").maybeSingle();
  if(!data?.value)return;
  const hero=document.querySelector(".hero");
  if(!hero)return;
  const eyebrow=hero.querySelector(".eyebrow"),title=hero.querySelector("h1"),desc=hero.querySelector("p");
  if(eyebrow&&data.value.eyebrow)eyebrow.textContent=data.value.eyebrow;
  if(title&&data.value.title)title.textContent=data.value.title;
  if(desc&&data.value.description)desc.textContent=data.value.description;
}

async function loadAnnouncements(){
  const {data}=await db.from("announcements").select("*").order("position").limit(1);
  let bar=document.getElementById("liveAnnouncement");
  if(!data?.length){bar?.remove();return;}
  const a=data[0];
  if(!bar){
    bar=document.createElement("div");bar.id="liveAnnouncement";bar.className="live-announcement";
    const header=document.querySelector(".site-header");header?.insertAdjacentElement("afterend",bar);
  }
  bar.innerHTML='<div class="container announcement-inner"><strong>'+escapeHtml(a.title)+'</strong><span>'+escapeHtml(a.message)+'</span>'+(a.cta_url?'<a target="_blank" rel="noopener" href="'+escapeAttr(a.cta_url)+'">'+escapeHtml(a.cta_label||"Learn More")+' →</a>':"")+'</div>';
}

async function loadCourses(){
  const {data,error}=await db.from("courses").select("*").order("position");
  if(error||!data)return;
  const home=document.querySelector("#courses .cards");
  if(home){
    home.innerHTML=data.map(c=>'<article class="course-card reveal visible"><span class="course-icon">'+iconFor(c.category)+'</span><h3>'+escapeHtml(c.title)+'</h3><p>'+escapeHtml(c.description)+'</p><div class="meta"><span>'+escapeHtml(c.duration)+'</span><span>'+fmtFee(c.fee)+'</span></div></article>').join("");
  }
  const grid=document.getElementById("courseGrid");
  if(grid){
    grid.innerHTML=data.map(c=>'<article class="course-pro-card reveal visible" data-category="'+escapeAttr(c.category)+'"><div class="course-cover cover-'+escapeAttr(c.cover_theme||"fullstack")+'"><span class="cover-tag">'+escapeHtml(c.badge||"COURSE")+'</span><div class="cover-art"><b>'+coverSymbol(c.cover_theme)+'</b><span>'+escapeHtml((c.features||[]).slice(0,2).join(" • "))+'</span></div></div><div class="course-body"><h3>'+escapeHtml(c.title)+'</h3><p>'+escapeHtml(c.description)+'</p><ul class="course-checks">'+(c.features||[]).slice(0,3).map(f=>'<li>'+escapeHtml(f)+'</li>').join("")+'</ul><div class="course-rating"><span>★ '+Number(c.rating||4.9).toFixed(1)+'</span><small>Live practical training</small></div><div class="course-footer"><strong>'+fmtFee(c.fee)+'</strong><a href="admission.html">VIEW MORE →</a></div></div></article>').join("");
    window.dispatchEvent(new Event("courses:rendered"));
  }
  document.querySelectorAll('select[name="course"]').forEach(sel=>{
    const first=sel.querySelector('option[value=""]')?.outerHTML||'<option value="">Select course</option>';
    sel.innerHTML=first+data.map(c=>'<option>'+escapeHtml(c.title)+'</option>').join("");
  });
  const tbody=document.querySelector("#fees .fee-table tbody");
  if(tbody)tbody.innerHTML=data.map(c=>'<tr><td>'+escapeHtml(c.title)+'</td><td>'+escapeHtml(c.duration)+'</td><td>'+escapeHtml(c.mode)+'</td><td>'+fmtFee(c.fee)+'</td></tr>').join("");
}

async function loadBatches(){
  const {data}=await db.from("batches").select("*").order("position");
  const grid=document.querySelector("#batches .schedule-grid");
  if(!grid||!data)return;
  grid.innerHTML=data.map(b=>'<div class="schedule-card reveal visible"><span>'+escapeHtml(b.icon||"🖥️")+'</span><h3>'+escapeHtml(b.label)+'</h3><strong>'+escapeHtml(b.time_label)+'</strong><p>'+escapeHtml(b.description)+'</p></div>').join("");
}

async function loadInternship(){
  const {data}=await db.from("internship_programs").select("*").order("created_at",{ascending:false}).limit(1).maybeSingle();
  if(!data)return;
  document.querySelectorAll("[data-program-fee]").forEach(e=>e.textContent=fmtFee(data.fee));
  document.querySelectorAll("[data-program-practical]").forEach(e=>e.textContent=data.practical_duration);
  document.querySelectorAll("[data-program-internship]").forEach(e=>e.textContent=data.internship_duration);
  document.querySelectorAll('a[href*="forms.gle"]').forEach(a=>{if(data.form_url)a.href=data.form_url});
}

async function loadMedia(){
  const {data}=await db.from("media_items").select("*");
  if(!data)return;
  const map=Object.fromEntries(data.map(x=>[x.key,x]));
  const video=document.querySelector(".video-shell video");
  if(video&&map.training_video?.url){
    const src=video.querySelector("source");if(src&&src.getAttribute("src")!==map.training_video.url){src.src=map.training_video.url;video.load();}
  }
  document.querySelectorAll('img[src="industrial-training-poster.png"]').forEach(img=>{if(map.training_poster?.url)img.src=map.training_poster.url});
}

async function init(){
  await Promise.allSettled([loadHero(),loadAnnouncements(),loadCourses(),loadBatches(),loadInternship(),loadMedia()]);
  subscribe();
}
function subscribe(){
  ["courses","batches","internship_programs","announcements","media_items","site_content"].forEach(table=>{
    db.channel("public-"+table).on("postgres_changes",{event:"*",schema:"public",table},()=> {
      ({courses:loadCourses,batches:loadBatches,internship_programs:loadInternship,announcements:loadAnnouncements,media_items:loadMedia,site_content:loadHero}[table])();
    }).subscribe();
  });
}
function iconFor(c){return c==="cyber"?"🛡️":c==="data"?"🗄️":c==="design"?"🌐":"💻"}
function coverSymbol(t){return t==="java"?"☕":t==="python"?"PY":t==="cyber"?"⛨":t==="web"?"UI":t==="sql"?"DB":"</>"}
function escapeHtml(v){const d=document.createElement("div");d.textContent=String(v??"");return d.innerHTML}
function escapeAttr(v){return String(v??"").replace(/"/g,"&quot;")}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
