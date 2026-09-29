const express=require("express");
const crypto=require("crypto");
const path=require("path");
const app=express();

app.disable("x-powered-by");
app.use((req,res,next)=>{
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options","DENY");
  if(req.path.startsWith("/admin")||req.path.startsWith("/api/admin")) res.setHeader("Cache-Control","no-store");
  next();
});
app.use(express.json({limit:"10kb"}));
app.use(express.static(path.join(__dirname,"public"),{index:"index.html"}));

const sessions=new Map();
const attempts=new Map();
const secure=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)};
const cookie=req=>Object.fromEntries((req.headers.cookie||"").split(";").filter(Boolean).map(v=>{const i=v.indexOf("=");return[decodeURIComponent(v.slice(0,i).trim()),decodeURIComponent(v.slice(i+1))]}));
function auth(req,res,next){
  const s=cookie(req).ict_admin_session;
  const session=s&&sessions.get(s);
  if(!session||Date.now()-session.created>8*60*60e3){if(s)sessions.delete(s);return res.redirect("/admin")}
  next();
}

app.get("/admin",(req,res)=>res.sendFile(path.join(__dirname,"public/admin.html")));
app.post("/api/admin/login",(req,res)=>{
  const ip=req.ip,now=Date.now(),a=attempts.get(ip)||{n:0,t:now};
  if(now-a.t>15*60e3){a.n=0;a.t=now}
  if(a.n>=5)return res.status(429).json({error:"Too many attempts. Try again later."});
  const u=process.env.ADMIN_USERNAME,p=process.env.ADMIN_PASSWORD;
  if(!u||!p)return res.status(503).json({error:"Admin authentication not configured"});
  if(!secure(String(req.body?.username||"").trim().toLowerCase(),String(u).trim().toLowerCase())||!secure(req.body?.password,p)){
    a.n++;attempts.set(ip,a);return res.status(401).json({error:"Invalid credentials"})
  }
  attempts.delete(ip);
  const token=crypto.randomBytes(32).toString("hex");
  sessions.set(token,{created:now});
  setTimeout(()=>sessions.delete(token),8*60*60e3).unref();
  res.setHeader("Set-Cookie",`ict_admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`);
  res.json({ok:true});
});

app.get("/admin/dashboard",auth,(req,res)=>res.sendFile(path.join(__dirname,"public/admin-dashboard.html")));

app.post("/api/admin/logout",auth,(req,res)=>{
  const s=cookie(req).ict_admin_session;
  sessions.delete(s);
  res.setHeader("Set-Cookie","ict_admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0");
  res.redirect("/admin");
});

app.get("/api/admin/overview",auth,(req,res)=>res.json({
  courses:[
    {name:"Full Stack Development",duration:"4 Months",fee:"₹18,000"},
    {name:"Java Development",duration:"3 Months",fee:"₹14,000"},
    {name:"Python Programming",duration:"2 Months",fee:"₹10,000"},
    {name:"Cyber Security Basics",duration:"2 Months",fee:"₹12,000"},
    {name:"Web Design",duration:"6 Weeks",fee:"₹7,500"},
    {name:"SQL & Database",duration:"1 Month",fee:"₹6,000"}
  ],
  batches:["Morning 8–10","Afternoon 1–3","Evening 6–8","Online Live"],
  contact:{phone:"+91 97638 97697",email:"connect@itcyber.in"},
  note:"This admin dashboard is protected. Public website content remains unchanged."
}));

app.listen(process.env.PORT||3000,()=>console.log("ICT web service running"));