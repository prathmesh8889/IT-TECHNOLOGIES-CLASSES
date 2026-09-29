const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "site-data.json");
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!ADMIN_PASSWORD || !SESSION_SECRET) {
  console.warn("ADMIN_PASSWORD and SESSION_SECRET must be set before using the admin panel.");
}

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: "ict_admin",
  secret: SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 8 * 60 * 60 * 1000 }
}));
app.use((req,res,next)=>{
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options","DENY");
  res.setHeader("Permissions-Policy","camera=(), microphone=(), geolocation=()");
  next();
});

const defaultData = {
  courses: [
    {id:"full-stack",name:"Full Stack Development",description:"Frontend, backend, database, REST APIs and deployment with complete projects.",duration:"4 Months",fee:"₹18,000",icon:"💻",active:true},
    {id:"java",name:"Java Development",description:"Core Java, OOP, JDBC, Spring Boot, REST API and database integration.",duration:"3 Months",fee:"₹14,000",icon:"☕",active:true},
    {id:"python",name:"Python Programming",description:"Python fundamentals, OOP, automation basics and project-based learning.",duration:"2 Months",fee:"₹10,000",icon:"🐍",active:true},
    {id:"cyber",name:"Cyber Security Basics",description:"Security fundamentals, networking concepts, safe lab practice and cyber awareness.",duration:"2 Months",fee:"₹12,000",icon:"🛡️",active:true},
    {id:"web-design",name:"Web Design",description:"HTML, CSS, Bootstrap, responsive design and modern landing pages.",duration:"6 Weeks",fee:"₹7,500",icon:"🌐",active:true},
    {id:"sql",name:"SQL & Database",description:"MySQL/PostgreSQL basics, queries, joins, schema design and CRUD practice.",duration:"1 Month",fee:"₹6,000",icon:"🗄️",active:true}
  ],
  batches: [
    {id:"morning",name:"Morning",time:"8:00 AM – 10:00 AM",note:"Learn live from anywhere.",icon:"🌅",active:true},
    {id:"afternoon",name:"Afternoon",time:"1:00 PM – 3:00 PM",note:"Focused practical learning slot.",icon:"☀️",active:true},
    {id:"evening",name:"Evening",time:"6:00 PM – 8:00 PM",note:"Flexible online learning.",icon:"🌆",active:true},
    {id:"online",name:"Online",time:"Live Interactive Batch",note:"Join remotely with live doubt support.",icon:"🖥️",active:true}
  ],
  settings:{phone:"+91 97638 97697",whatsapp:"919763897697",email:"connect@itcyber.in",nextBatch:"Full Stack Development"}
};

function ensureData(){
  fs.mkdirSync(path.dirname(DATA_FILE),{recursive:true});
  if(!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE,JSON.stringify(defaultData,null,2));
}
function readData(){ ensureData(); return JSON.parse(fs.readFileSync(DATA_FILE,"utf8")); }
function writeData(data){
  const tmp=DATA_FILE+".tmp";
  fs.writeFileSync(tmp,JSON.stringify(data,null,2));
  fs.renameSync(tmp,DATA_FILE);
}
function auth(req,res,next){ if(req.session && req.session.admin) return next(); return res.status(401).json({error:"Unauthorized"}); }
function clean(v,max=200){ return String(v??"").trim().slice(0,max); }
function safeId(v){ return clean(v,80).toLowerCase().replace(/[^a-z0-9-]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"") || crypto.randomUUID(); }

const attempts = new Map();
app.post("/api/admin/login",(req,res)=>{
  const ip=req.ip; const now=Date.now(); const row=attempts.get(ip)||{count:0,until:0};
  if(row.until>now) return res.status(429).json({error:"Too many attempts. Try again later."});
  const user=clean(req.body.username,80), pass=String(req.body.password||"");
  const okUser=user===ADMIN_USER;
  const expected=Buffer.from(String(ADMIN_PASSWORD||""));
  const supplied=Buffer.from(pass);
  const okPass=expected.length===supplied.length && expected.length>0 && crypto.timingSafeEqual(expected,supplied);
  if(!okUser || !okPass){
    row.count++; if(row.count>=5){row.until=now+15*60*1000;row.count=0;} attempts.set(ip,row);
    return res.status(401).json({error:"Invalid login"});
  }
  attempts.delete(ip); req.session.admin=true; req.session.save(()=>res.json({ok:true,username:ADMIN_USER}));
});
app.post("/api/admin/logout",auth,(req,res)=>req.session.destroy(()=>{res.clearCookie("ict_admin");res.json({ok:true});}));
app.get("/api/admin/me",(req,res)=>res.json({authenticated:!!req.session?.admin,username:req.session?.admin?ADMIN_USER:null}));
app.get("/api/site-data",(req,res)=>res.json(readData()));
app.get("/api/admin/data",auth,(req,res)=>res.json(readData()));

app.put("/api/admin/data",auth,(req,res)=>{
  const body=req.body||{};
  const courses=Array.isArray(body.courses)?body.courses.slice(0,50).map(c=>({
    id:safeId(c.id||c.name),name:clean(c.name,100),description:clean(c.description,500),duration:clean(c.duration,60),fee:clean(c.fee,60),icon:clean(c.icon,10),active:c.active!==false
  })).filter(c=>c.name):[];
  const batches=Array.isArray(body.batches)?body.batches.slice(0,30).map(b=>({
    id:safeId(b.id||b.name),name:clean(b.name,100),time:clean(b.time,100),note:clean(b.note,300),icon:clean(b.icon,10),active:b.active!==false
  })).filter(b=>b.name):[];
  const s=body.settings||{};
  const data={courses,batches,settings:{phone:clean(s.phone,40),whatsapp:clean(s.whatsapp,30).replace(/\D/g,""),email:clean(s.email,120),nextBatch:clean(s.nextBatch,100)}};
  writeData(data); res.json({ok:true,data});
});

app.use(express.static(path.join(__dirname,"public"),{index:"index.html"}));
app.listen(PORT,()=>console.log("ICT website running on port "+PORT));