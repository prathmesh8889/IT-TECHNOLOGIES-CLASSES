(()=>{
const db=window.itcyberDb;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const loginView=$("#loginView"), app=$("#adminApp"), loginForm=$("#loginForm"), loginMsg=$("#loginMsg");
let currentTab="dashboard";

function setAuthView(ok){
  loginView.hidden=ok;
  app.hidden=!ok;
  loginView.style.display=ok?"none":"grid";
  app.style.display=ok?"grid":"none";
}
function msg(el,text,ok=false){if(!el)return;el.textContent=text;el.className="form-message "+(ok?"ok":"err")}
async function isAuthorized(){
  const {data:{user}}=await db.auth.getUser(); if(!user)return false;
  let {data}=await db.from("admin_users").select("role").eq("user_id",user.id).maybeSingle();
  if(data)return true;
  if((user.email||"").toLowerCase()==="connect@itcyber.in"){
    const result=await db.functions.invoke("bootstrap-admin",{body:{}});
    if(!result.error){
      const retry=await db.from("admin_users").select("role").eq("user_id",user.id).maybeSingle();
      data=retry.data;
    }else{
      console.error("Admin bootstrap failed",result.error);
    }
  }
  return !!data;
}
async function boot(){
  const ok=await isAuthorized();
  setAuthView(ok);
  if(ok){bindNav();await loadAll();}
}
loginForm?.addEventListener("submit",async e=>{
  e.preventDefault(); msg(loginMsg,"Signing in…",true);
  const f=new FormData(loginForm);
  const {error}=await db.auth.signInWithPassword({email:f.get("email"),password:f.get("password")});
  if(error){msg(loginMsg,error.message);return}
  if(!(await isAuthorized())){await db.auth.signOut();msg(loginMsg,"This account is not authorized as an admin.");return}
  msg(loginMsg,"Signed in.",true);setAuthView(true);bindNav();await loadAll();
});
$("#logoutBtn")?.addEventListener("click",async()=>{await db.auth.signOut();location.reload()});

function bindNav(){
  $$(".admin-nav").forEach(b=>b.onclick=()=>showTab(b.dataset.tab,b.textContent.trim()));
  $$("[data-add]").forEach(b=>b.onclick=()=>openEditor(b.dataset.add));
  $("#modalClose").onclick=closeModal;
}
function showTab(tab,title){
  currentTab=tab;
  $$(".admin-nav").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  $$(".admin-tab").forEach(s=>s.classList.toggle("active",s.id==="tab-"+tab));
  $("#tabTitle").textContent=title;
}
async function loadAll(){
  await Promise.all([loadStats(),loadCourses(),loadBatches(),loadInternship(),loadAnnouncements(),loadMedia(),loadAdmissions()]);
}
async function loadStats(){
  const [c,b,a,n]=await Promise.all([
    db.from("courses").select("*",{count:"exact",head:true}),
    db.from("batches").select("*",{count:"exact",head:true}),
    db.from("admissions").select("*",{count:"exact",head:true}),
    db.from("announcements").select("*",{count:"exact",head:true})
  ]);
  $("#statCourses").textContent=c.count||0;$("#statBatches").textContent=b.count||0;$("#statAdmissions").textContent=a.count||0;$("#statAnnouncements").textContent=n.count||0;
}
function table(headers,rows){return '<div class="admin-table-wrap"><table class="admin-table"><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join("")+'</tr></thead><tbody>'+rows.join("")+'</tbody></table></div>'}
async function loadCourses(){
  const {data=[]}=await db.from("courses").select("*").order("position");
  $("#coursesTable").innerHTML=data.length?table(["Course","Category","Duration","Fee","Active","Actions"],data.map(x=>'<tr><td><strong>'+esc(x.title)+'</strong><br><small>'+esc(x.badge)+'</small></td><td>'+esc(x.category)+'</td><td>'+esc(x.duration)+'</td><td>₹'+Number(x.fee).toLocaleString("en-IN")+'</td><td>'+(x.active?"Yes":"No")+'</td><td><div class="admin-actions"><button class="edit-btn" data-edit-course="'+x.id+'">Edit</button><button class="delete-btn" data-delete-course="'+x.id+'">Delete</button></div></td></tr>')):'<div class="admin-empty">No courses</div>';
  $$("[data-edit-course]").forEach(b=>b.onclick=()=>openEditor("course",data.find(x=>x.id===b.dataset.editCourse)));
  $$("[data-delete-course]").forEach(b=>b.onclick=()=>remove("courses",b.dataset.deleteCourse,loadCourses));
}
async function loadBatches(){
  const {data=[]}=await db.from("batches").select("*").order("position");
  $("#batchesTable").innerHTML=data.length?table(["Batch","Time","Mode","Active","Actions"],data.map(x=>'<tr><td>'+esc(x.icon)+" "+esc(x.label)+'</td><td>'+esc(x.time_label)+'</td><td>'+esc(x.mode)+'</td><td>'+(x.active?"Yes":"No")+'</td><td><div class="admin-actions"><button class="edit-btn" data-edit-batch="'+x.id+'">Edit</button><button class="delete-btn" data-delete-batch="'+x.id+'">Delete</button></div></td></tr>')):'<div class="admin-empty">No batches</div>';
  $$("[data-edit-batch]").forEach(b=>b.onclick=()=>openEditor("batch",data.find(x=>x.id===b.dataset.editBatch)));
  $$("[data-delete-batch]").forEach(b=>b.onclick=()=>remove("batches",b.dataset.deleteBatch,loadBatches));
}
async function loadInternship(){
  const {data}=await db.from("internship_programs").select("*").order("created_at",{ascending:false}).limit(1).maybeSingle();
  $("#internshipEditor").innerHTML=data?'<div class="admin-panel"><h3>'+esc(data.title)+'</h3><p>'+esc(data.description)+'</p><p><strong>'+esc(data.practical_duration)+'</strong> Practical + <strong>'+esc(data.internship_duration)+'</strong> Internship · ₹'+Number(data.fee).toLocaleString("en-IN")+'</p><button class="btn primary" id="editInternship">Edit Program</button></div>':'<div class="admin-panel"><button class="btn primary" id="editInternship">Create Program</button></div>';
  $("#editInternship").onclick=()=>openEditor("internship",data||null);
}
async function loadAnnouncements(){
  const {data=[]}=await db.from("announcements").select("*").order("position");
  $("#announcementsTable").innerHTML=data.length?table(["Title","Message","Active","Actions"],data.map(x=>'<tr><td>'+esc(x.title)+'</td><td>'+esc(x.message)+'</td><td>'+(x.active?"Yes":"No")+'</td><td><div class="admin-actions"><button class="edit-btn" data-edit-ann="'+x.id+'">Edit</button><button class="delete-btn" data-delete-ann="'+x.id+'">Delete</button></div></td></tr>')):'<div class="admin-empty">No announcements</div>';
  $$("[data-edit-ann]").forEach(b=>b.onclick=()=>openEditor("announcement",data.find(x=>x.id===b.dataset.editAnn)));
  $$("[data-delete-ann]").forEach(b=>b.onclick=()=>remove("announcements",b.dataset.deleteAnn,loadAnnouncements));
}
async function loadMedia(){
  const {data=[]}=await db.from("media_items").select("*").order("key");
  const known=[["training_poster","Training Poster","image"],["training_video","Training Video","video"]];
  $("#mediaEditor").innerHTML='<div class="media-grid-admin">'+known.map(([key,title,type])=>{const x=data.find(m=>m.key===key);return '<div class="media-card"><h3>'+title+'</h3><p>'+(x?esc(x.url):"Not set")+'</p>'+(x&&type==="image"?'<img class="media-preview" src="'+attr(x.url)+'">':x&&type==="video"?'<video class="media-preview" controls src="'+attr(x.url)+'"></video>':"")+'<input type="file" data-media-key="'+key+'" data-media-type="'+type+'" accept="'+(type==="image"?"image/*":"video/mp4,video/webm")+'"><button class="btn primary full" data-upload="'+key+'">Upload & Publish</button></div>'}).join("")+'</div>';
  $$("[data-upload]").forEach(btn=>btn.onclick=()=>uploadMedia(btn.dataset.upload));
}
async function uploadMedia(key){
  const input=$('[data-media-key="'+key+'"]');const file=input?.files?.[0];if(!file){alert("Choose a file first.");return}
  const ext=(file.name.split(".").pop()||"bin").toLowerCase();const path=key+"/"+Date.now()+"."+ext;
  const {error}=await db.storage.from("site-media").upload(path,file,{upsert:false,cacheControl:"3600"});
  if(error){alert(error.message);return}
  const {data:{publicUrl}}=db.storage.from("site-media").getPublicUrl(path);
  const type=input.dataset.mediaType;
  const {error:e2}=await db.from("media_items").upsert({key,title:key==="training_video"?"Industrial Practical Training Video":"Industrial Practical Training Poster",media_type:type,url:publicUrl,alt_text:key.replaceAll("_"," "),active:true},{onConflict:"key"});
  if(e2){alert(e2.message);return}
  await loadMedia();alert("Media published. Live website will update automatically.");
}
async function loadAdmissions(){
  const {data=[]}=await db.from("admissions").select("*").order("created_at",{ascending:false});
  $("#admissionsTable").innerHTML=data.length?table(["Name","Phone","Course","Status","Date","Actions"],data.map(x=>'<tr><td><strong>'+esc(x.name)+'</strong><br><small>'+esc(x.email)+'</small></td><td>'+esc(x.phone)+'</td><td>'+esc(x.course)+'</td><td><select class="status-select" data-status="'+x.id+'">'+["new","contacted","qualified","enrolled","closed"].map(s=>'<option '+(s===x.status?"selected":"")+'>'+s+'</option>').join("")+'</select></td><td>'+new Date(x.created_at).toLocaleString()+'</td><td><a href="https://wa.me/'+String(x.phone).replace(/\D/g,"")+'" target="_blank">WhatsApp</a></td></tr>')):'<div class="admin-empty">No admissions yet</div>';
  $$("[data-status]").forEach(s=>s.onchange=async()=>{await db.from("admissions").update({status:s.value}).eq("id",s.dataset.status)});
}
function openEditor(type,row={}){
  const f=$("#editorForm");$("#modalTitle").textContent=(row?.id?"Edit ":"Add ")+type;
  const active=row?.active!==false;
  let html="";
  if(type==="course")html=`
    <input type="hidden" name="id" value="${attr(row?.id||"")}"><div class="modal-grid"><label>Title<input name="title" required value="${attr(row?.title||"")}"></label><label>Slug<input name="slug" required value="${attr(row?.slug||"")}"></label><label>Category<select name="category">${["development","cyber","data","design"].map(v=>'<option '+(row?.category===v?"selected":"")+'>'+v+'</option>').join("")}</select></label><label>Duration<input name="duration" required value="${attr(row?.duration||"")}"></label><label>Fee<input name="fee" type="number" min="0" value="${attr(row?.fee??0)}"></label><label>Mode<input name="mode" value="${attr(row?.mode||"Online")}"></label><label>Badge<input name="badge" value="${attr(row?.badge||"")}"></label><label>Position<input name="position" type="number" value="${attr(row?.position??0)}"></label></div><label>Description<textarea name="description" rows="3">${esc(row?.description||"")}</textarea></label><label>Features (one per line)<textarea name="features" rows="5">${esc((row?.features||[]).join("\n"))}</textarea></label><label><input type="checkbox" name="active" ${active?"checked":""}> Active</label>`;
  if(type==="batch")html=`<input type="hidden" name="id" value="${attr(row?.id||"")}"><div class="modal-grid"><label>Label<input name="label" required value="${attr(row?.label||"")}"></label><label>Time<input name="time_label" required value="${attr(row?.time_label||"")}"></label><label>Mode<input name="mode" value="${attr(row?.mode||"Online")}"></label><label>Icon<input name="icon" value="${attr(row?.icon||"🖥️")}"></label><label>Position<input name="position" type="number" value="${attr(row?.position??0)}"></label></div><label>Description<textarea name="description">${esc(row?.description||"")}</textarea></label><label><input type="checkbox" name="active" ${active?"checked":""}> Active</label>`;
  if(type==="announcement")html=`<input type="hidden" name="id" value="${attr(row?.id||"")}"><label>Title<input name="title" required value="${attr(row?.title||"")}"></label><label>Message<textarea name="message">${esc(row?.message||"")}</textarea></label><div class="modal-grid"><label>CTA Label<input name="cta_label" value="${attr(row?.cta_label||"")}"></label><label>CTA URL<input name="cta_url" value="${attr(row?.cta_url||"")}"></label><label>Position<input name="position" type="number" value="${attr(row?.position??0)}"></label></div><label><input type="checkbox" name="active" ${active?"checked":""}> Active</label>`;
  if(type==="internship")html=`<input type="hidden" name="id" value="${attr(row?.id||"")}"><label>Title<input name="title" required value="${attr(row?.title||"Industrial Practical Training + Internship")}"></label><div class="modal-grid"><label>Slug<input name="slug" value="${attr(row?.slug||"industrial-practical-training")}"></label><label>Fee<input name="fee" type="number" min="0" value="${attr(row?.fee??4999)}"></label><label>Practical Duration<input name="practical_duration" value="${attr(row?.practical_duration||"1 Month")}"></label><label>Internship Duration<input name="internship_duration" value="${attr(row?.internship_duration||"3 Months")}"></label><label>Start Date<input name="start_date" type="date" value="${attr(row?.start_date||"")}"></label><label>Form URL<input name="form_url" value="${attr(row?.form_url||"")}"></label></div><label>Description<textarea name="description" rows="3">${esc(row?.description||"")}</textarea></label><label>Eligibility<textarea name="eligibility">${esc(row?.eligibility||"")}</textarea></label><label>Benefits (one per line)<textarea name="benefits" rows="6">${esc((row?.benefits||[]).join("\n"))}</textarea></label><label><input type="checkbox" name="active" ${active?"checked":""}> Active</label>`;
  f.innerHTML=html+'<button class="btn primary full" type="submit">Save Changes</button><p id="editorMsg" class="form-message"></p>';
  f.dataset.type=type;f.onsubmit=saveEditor;$("#editorModal").hidden=false;
}
async function saveEditor(e){
  e.preventDefault();const f=e.currentTarget,type=f.dataset.type,d=Object.fromEntries(new FormData(f).entries()),id=d.id||null;delete d.id;d.active=f.querySelector('[name="active"]')?.checked??true;
  let tableName=type==="course"?"courses":type==="batch"?"batches":type==="announcement"?"announcements":"internship_programs";
  if(type==="course"){d.fee=Number(d.fee||0);d.position=Number(d.position||0);d.features=String(d.features||"").split("\n").map(x=>x.trim()).filter(Boolean);d.cover_theme=coverFromTitle(d.title);d.rating=4.9}
  if(type==="batch")d.position=Number(d.position||0);
  if(type==="announcement")d.position=Number(d.position||0);
  if(type==="internship"){d.fee=Number(d.fee||0);d.benefits=String(d.benefits||"").split("\n").map(x=>x.trim()).filter(Boolean);if(!d.start_date)d.start_date=null}
  const q=id?db.from(tableName).update(d).eq("id",id):db.from(tableName).insert(d);const {error}=await q;
  if(error){msg($("#editorMsg"),error.message);return}closeModal();await loadAll();
}
async function remove(tableName,id,reload){if(!confirm("Delete this item?"))return;const {error}=await db.from(tableName).delete().eq("id",id);if(error){alert(error.message);return}await reload();await loadStats()}
function closeModal(){$("#editorModal").hidden=true}
function coverFromTitle(t){t=(t||"").toLowerCase();return t.includes("java")?"java":t.includes("python")?"python":t.includes("cyber")?"cyber":t.includes("web")?"web":t.includes("sql")||t.includes("database")?"sql":"fullstack"}
function esc(v){const d=document.createElement("div");d.textContent=String(v??"");return d.innerHTML}
function attr(v){return esc(v).replace(/"/g,"&quot;")}
boot();
})();
