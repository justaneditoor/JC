const SB=window.FB||{},H={apikey:SB.key,Authorization:"Bearer "+SB.key};
const sb=(p,o={})=>fetch(SB.url+"/rest/v1/"+p,{...o,headers:{...H,"Content-Type":"application/json",...(o.headers||{})}});
const fkey=(k,f)=>k+"/"+f.replace(/^\d+-?/,"");
async function versions(dir,f){try{const{o,r}=repo(),j=await(await fetch("https://api.github.com/repos/"+o+"/"+r+"/contents/"+dir+"/"+encodeURIComponent(f))).json();
 return[1,...j.filter(x=>x.type==="dir"&&/^v\d+$/.test(x.name)).map(x=>+x.name.slice(1))].sort((a,b)=>a-b)}catch(e){return[1]}}
function vbar(vs,cur,href){const w=el("div","vbar");vs.forEach(n=>{const l=n===vs.length&&vs.length>1,a=el("a","vb"+(n===cur?" on":"")+(l?" last":""));a.href=href(n);a.textContent="V"+n+(l?" · LATEST":"");w.append(a)});return w}
async function rec(kind,btn,send){
 if(btn.r){btn.r.stop();return}
 let s;try{s=await navigator.mediaDevices.getUserMedia({audio:true,video:kind==="video"})}catch(e){return alert("Allow microphone/camera access to record.")}
 const m=new MediaRecorder(s),c=[];btn.r=m;btn.classList.add("on");m.ondataavailable=e=>c.push(e.data);
 m.onstop=async()=>{s.getTracks().forEach(t=>t.stop());btn.r=null;btn.classList.remove("on");
  const b=new Blob(c,{type:m.mimeType}),nm=Date.now()+Math.random().toString(36).slice(2)+(/mp4/.test(b.type)?".mp4":".webm");
  await fetch(SB.url+"/storage/v1/object/fb/"+nm,{method:"POST",headers:{...H,"Content-Type":b.type},body:b});send("",nm,kind)};
 m.start()}
function thread(key,ver,o={}){
 const w=el("div","card fbx");w.id="fb";const h=el("h2","px"),list=el("div","fbl"),cmp=el("div","fbc");h.textContent="Feedback · V"+ver;w.append(h,list,cmp);
 let n=-1;const draw=async()=>{try{const rows=await(await sb("fb?item=eq."+encodeURIComponent(key)+"&ver=eq."+ver+"&order=id")).json();if(rows.length===n)return;n=rows.length;list.innerHTML="";
  if(!rows.length){const p=el("p","note");p.textContent="No feedback yet.";list.append(p)}
  rows.forEach(m=>{const a=m.role==="admin",d=el("div","fbm"+(a?" adm":"")),b=el("b","px");b.textContent=a?(m.name+" · Admin"):m.name;d.append(b);
   if(m.body){const p=el("p");p.textContent=m.body;d.append(p)}
   if(m.media){const x=el(m.mtype==="video"?"video":"audio");x.controls=true;x.src=SB.url+"/storage/v1/object/public/fb/"+m.media;d.append(x)}list.append(d)})}catch(e){}};
 const who=()=>o.admin?"Admin":(localStorage.fbname||(localStorage.fbname=(prompt("Your name?")||"").trim()||"Client"));
 const send=async(body,media,mtype)=>{const name=who();
  if(o.admin)await sb("rpc/fb_admin_post",{method:"POST",body:JSON.stringify({k:o.key(),i:key,v:ver,n:name,b:body,m:media||null,mt:mtype||null})});
  else await sb("fb",{method:"POST",body:JSON.stringify({item:key,ver,role:"client",name,body,media:media||null,mtype:mtype||null,title:o.title,sno:o.sno})});
  n=-1;draw()};
 const t=el("textarea");t.rows=3;t.placeholder=o.admin?"Reply as Admin...":"Type your feedback...";
 const bs=el("button","btn mini");bs.type="button";bs.textContent="Send";bs.onclick=()=>{const v=t.value.trim();if(v){who();send(v);t.value=""}};
 const ba=el("button","back mini");ba.type="button";ba.textContent="Record audio";ba.onclick=()=>{who();rec("audio",ba,send)};
 const bv=el("button","back mini");bv.type="button";bv.textContent="Record video";bv.onclick=()=>{who();rec("video",bv,send)};
 const r=el("div","fbar");r.append(bs,ba,bv);cmp.append(t,r);draw();setInterval(draw,15000);return w}
