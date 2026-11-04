/* a link's page stem; on the desk links read view.html#p=<stem> */
function hstem(h){ h=h||''; const m=h.match(/^view\.html#(?:.*&)?p=([^&]+)/); if(m) return decodeURIComponent(m[1]); return h.replace(/#.*$/,'').replace(/\.html?$/,''); }
/* rung.js: the shared machinery of the new ladder's pages.
   Load order at the end of <body>: katex (in <head>), then rung.js, then the page's own script, then tray.js.
   Provides window.Rung = { tex, col, stepper, plane, ready }.
   Markup it understands:
     [data-tex]          display TeX         [data-tex-inline]   inline TeX
     <pre class="lines" data-k="ember|teal|plain" data-label="…">  one move per line:  TeX @@ note
     <div class="brkkey"></div>   filled with the colour legend for bars
     <div class="phkey"></div>    filled with the legend for question phases
     .qid (questions) and li>.n (ladder rows) toggle ✓ on click; marks save per page title.
   The desk (☰): the page's questions beside you, and a grapher. Injected automatically. */
/* the page's name: its file name, or the name the desk viewer gives it (window.LADDER_PAGE) */
window.ladderPage=function(){ return window.LADDER_PAGE||((location.pathname.split('/').pop()||'index.html').replace(/\.html?$/,''))||'index'; };
/* The ladder record: one versioned object on this device holding everything the ladder remembers,
   kept under the single key 'ladder:record'. Nothing leaves the device unless sync is on.
   Sections: progress.pages (step reports), marks (ticks per page), certs, games, desk, cards, prefs,
   stats, reports, sync (tick times), and the not-yet-filled tutor, index, counts and welfare records.
   Pages read and write it through LS, which keeps the old storage names: each old name is a path here.
   LadderRecord.get() returns the object, .export() saves it as a file, .import(obj) replaces it. */
(function(){
const RK='ladder:record', V=1;
const blank=()=>({schema:'ladder-record',v:V,created:Date.now(),updated:Date.now(),
  progress:{pages:{}},steps:{},marks:{},certs:{},games:{},desk:{},cards:{},prefs:{},stats:{},reports:[],sync:{},
  tutor:{ticks:{},notes:[]},notes:{},index:{},counts:{},welfare:{},meta:{},other:{}});
let raw=null, rec=null, mem=null;
const store=(()=>{ try{ const t='__ladder_t'; localStorage.setItem(t,'1'); localStorage.removeItem(t); return localStorage; }catch(e){ return null; } })();
function load(){
  if(!store){ if(!mem) mem=blank(); return mem; }
  let r=null; try{ r=store.getItem(RK); }catch(e){}
  if(r!==null&&r===raw&&rec) return rec;
  let o=null; try{ o=r?JSON.parse(r):null; }catch(e){ o=null; }
  if(!o||o.schema!=='ladder-record'){ o=blank(); migrate(o); raw=null; rec=o; save(); return rec; }
  const b=blank(); for(const k in b) if(!(k in o)) o[k]=b[k];
  raw=r; rec=o; return rec;
}
function save(){ if(!store) return; rec.updated=Date.now(); const s=JSON.stringify(rec);
  try{ store.setItem(RK,s); raw=s; }catch(e){} }
/* each old storage name is a place in the record */
function where(k){ let m;
  if(/:t$/.test(k)) return ['sync',k];
  if(k==='pages:done') return ['progress','pages'];
  if((m=k.match(/^steps:([\s\S]+)$/))) return ['steps',m[1]];
  if((m=k.match(/^marks:([\s\S]+)$/))) return ['marks',m[1]];
  if((m=k.match(/^cert:([\s\S]+)$/))) return ['certs',m[1]];
  if((m=k.match(/^mg:([\s\S]+)$/))) return ['games',m[1]];
  if((m=k.match(/^desk:([\s\S]+)$/))) return ['desk',m[1]];
  if((m=k.match(/^cards:([\s\S]+)$/))) return ['cards',m[1]];
  if((m=k.match(/^note:([\s\S]+)$/))) return ['notes',m[1]];
  if(k==='ladder:stats') return ['stats',null];
  if(k==='ladder:reports') return ['reports',null];
  if(k==='ladder:reset') return ['meta','reset'];
  if((m=k.match(/^ladder:([\s\S]+)$/))) return ['prefs',m[1]];
  if(k==='mathkeys-line') return ['prefs','mathkeys-line'];
  return ['other',k];
}
function name(sec,sub){ return ({sync:sub,marks:'marks:'+sub,certs:'cert:'+sub,games:'mg:'+sub,desk:'desk:'+sub,cards:'cards:'+sub,notes:'note:'+sub,
  steps:'steps:'+sub,prefs:sub==='mathkeys-line'?sub:'ladder:'+sub,meta:'ladder:'+sub,other:sub})[sec]; }
const parse=v=>{ try{ return JSON.parse(v); }catch(e){ return String(v); } };
const show=v=>typeof v==='string'?v:JSON.stringify(v);
function migrate(o){ if(!store) return; const old=[];
  for(let i=0;i<store.length;i++){ const k=store.key(i); if(k&&k!==RK&&!/^__/.test(k)) old.push(k); }
  old.forEach(k=>{ const [s,u]=where(k), v=parse(store.getItem(k)); if(u===null) o[s]=v; else o[s][u]=v; });
  o.meta.migrated=old.length; rec=o; raw=null;
  try{ store.setItem(RK,JSON.stringify(o)); old.forEach(k=>store.removeItem(k)); }catch(e){} }
function keys(){ const r=load(), out=[];
  if(r.progress.pages&&Object.keys(r.progress.pages).length) out.push('pages:done');
  if(r.stats&&Object.keys(r.stats).length) out.push('ladder:stats');
  if(r.reports&&r.reports.length) out.push('ladder:reports');
  ['sync','steps','marks','certs','games','desk','cards','notes','prefs','other'].forEach(s=>Object.keys(r[s]||{}).forEach(u=>out.push(name(s,u))));
  if(r.meta.reset!==undefined) out.push('ladder:reset');
  return out; }
window.LS={
  getItem(k){ const r=load(), [s,u]=where(k); const v=u===null?r[s]:(r[s]||{})[u];
    if(u===null&&((s==='stats'&&!Object.keys(v||{}).length)||(s==='reports'&&!(v||[]).length))) return null;
    return v===undefined?null:show(v); },
  setItem(k,v){ const r=load(), [s,u]=where(k), p=parse(v); if(u===null) r[s]=p; else r[s][u]=p; save(); },
  removeItem(k){ const r=load(), [s,u]=where(k); if(u===null) r[s]=blank()[s]; else delete r[s][u]; save(); },
  key(i){ return keys()[i]||null; },
  get length(){ return keys().length; }
};
window.LadderRecord={
  get(){ return load(); },
  export(){ const s=JSON.stringify(load(),null,1), a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([s],{type:'application/json'}));
    a.download='ladder-record-'+new Date().toISOString().slice(0,10)+'.json'; document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500); },
  import(o){ if(!o||o.schema!=='ladder-record') throw new Error('not a ladder record');
    const b=blank(); for(const k in b) if(!(k in o)) o[k]=b[k]; rec=o; save(); }
};
addEventListener('storage',e=>{ if(e.key===RK){ raw=null; } });
})();

/* Progress reset: when RESET changes, this browser forgets its question ticks and page reports once
   (the database copies are cleared at the same publish), so the learner can rerun every question. */
(function(){ const RESET='2026-10-28-keyed'; try{
  if(LS.getItem('ladder:reset')===RESET) return;
  const drop=[]; for(let i=0;i<LS.length;i++){ const k=LS.key(i);
    if(/^marks:/.test(k)||k==='pages:done'||k==='ladder:stats') drop.push(k); }
  drop.forEach(k=>LS.removeItem(k)); LS.setItem('ladder:reset',RESET);
}catch(e){} })();

(function(){
'use strict';
const KO={throwOnError:false,strict:false,trust:true};
function tex(el,t,disp){ if(t==null) t=el.getAttribute('data-tex')||el.getAttribute('data-tex-inline')||el.textContent;
  if(window.katex){ try{ katex.render(t,el,Object.assign({},KO,{displayMode:!!disp})); return; }catch(e){} } el.textContent=t; }
const CS=()=>getComputedStyle(document.documentElement);
function col(n){ return CS().getPropertyValue(n.startsWith('--')?n:'--'+n).trim(); }

/* worked lines */
function buildLines(root){
  root.querySelectorAll('pre.lines').forEach(pre=>{
    const label=pre.dataset.label||'';
    /* a wrong proof (illegal moves, a move that fails) is always red, never the colour of a valid move */
    const k=(pre.dataset.wrong!==undefined||/not allowed|illegal/i.test(label))?'wrong':(pre.dataset.k||'teal');
    const brk=document.createElement('div'); brk.className='brk brk-'+k; if(label) brk.dataset.label=label;
    const rows=document.createElement('div'); rows.className='rows'; brk.appendChild(rows);
    pre.textContent.split('\n').map(s=>s.trim()).filter(Boolean).forEach(line=>{
      const [t,n]=line.split('@@').map(s=>(s||'').trim());
      const row=document.createElement('div'); row.className='row'+(/htmlClass\{new\}/.test(t)?' new':'');
      const m=document.createElement('div'); m.className='m'; m.setAttribute('data-tex',t);
      const nn=document.createElement('div'); nn.className='n'; nn.innerHTML=n||'';
      row.append(m,nn); rows.appendChild(row);
    });
    pre.replaceWith(brk);
  });
}
function renderAll(root){
  root=root||document;
  buildLines(root);
  root.querySelectorAll('[data-tex]').forEach(el=>{ if(el.closest('#desk')&&!el.closest('#dq')) return;
    /* a proof line renders inline in display style, so a long line breaks at its relations and operators instead of scrolling sideways */
    if(el.matches('.rows .row .m')){ tex(el,'\\displaystyle '+el.getAttribute('data-tex'),false); return; }
    tex(el,el.getAttribute('data-tex'),true); });
  root.querySelectorAll('[data-tex-inline]').forEach(el=>tex(el,el.getAttribute('data-tex-inline'),false));
  root.querySelectorAll('.brkkey:empty').forEach(el=>el.innerHTML='<span class="ke">ember bar: this page’s trick</span><span class="kt">teal bar: a trick you have passed</span><span class="kp">dotted: a trick further up the ladder</span><span class="kw">red bar: a wrong proof, not allowed</span><span>orange in a line: the move being made · teal in a line: what is carried</span>');
  root.querySelectorAll('.phkey:empty').forEach(el=>el.innerHTML='The questions come in kinds: <span><span class="ph understand">understand</span>what the footing laid down, in your own words</span><span><span class="ph do">do</span>run it forward</span><span><span class="ph undo">undo</span>run it backward from the result</span><span><span class="ph bend">bend</span>change a piece, predict, find where it breaks</span><span><span class="ph make">make</span>the last set: harder, built on your own making, optional, and needed for the rung’s star</span>');
}

/* slides: any number per page. container = <section class="slides"> (empty or with an eyebrow) */
let activeStepper=null;
function stepper(container,steps,opts){
  if(typeof container==='string') container=document.querySelector(container);
  opts=opts||{};
  if(!container.querySelector('.eyebrow')){ const e=document.createElement('div'); e.className='eyebrow'; e.textContent=opts.title||'The steps · advance or return, one at a time'; container.appendChild(e); }
  const sl=document.createElement('div'); sl.className='slide';
  const ctl=document.createElement('div'); ctl.className='ctl';
  ctl.innerHTML='<button class="b">← back</button><button class="f">next →</button><span class="m pos"></span><div class="dots"></div>';
  container.append(ctl,sl);
  const back=ctl.querySelector('.b'), next=ctl.querySelector('.f'), pos=ctl.querySelector('.pos'), dots=ctl.querySelector('.dots');
  let i=0;
  steps.forEach((s,k)=>{ const d=document.createElement('i'); d.tabIndex=0; d.setAttribute('role','button'); d.setAttribute('aria-label','step '+(k+1)); d.onclick=()=>show(k); d.onkeydown=e=>{ if(e.key==='Enter'||e.key===' ') show(k); }; dots.appendChild(d); });
  function show(k){ i=Math.max(0,Math.min(steps.length-1,k)); const s=steps[i];
    const sk=(s.k&&(s.wrong||/\b(illegal|fake|tempting)\b|not allowed/i.test(s.kl||'')))?'wrong':s.k;
    sl.className='slide'+(sk?' brk-'+sk:''); sl.innerHTML='';
    if(s.k){ const l=document.createElement('div'); l.className='brkl'; l.textContent=s.kl||''; sl.appendChild(l); }
    if(s.t){ const m=document.createElement('div'); m.className='math'; sl.appendChild(m); tex(m,s.t,true); }
    if(s.n){ const p=document.createElement('p'); p.className='note'; p.innerHTML=s.n; sl.appendChild(p); renderAll(p); }
    [...dots.children].forEach((d,j)=>d.classList.toggle('on',j===i)); back.disabled=i===0; next.disabled=i===steps.length-1; pos.textContent='';
    if(opts.onshow) opts.onshow(i,s); }
  const api={show,get i(){return i;},container};
  back.onclick=()=>{activeStepper=api; show(i-1);}; next.onclick=()=>{activeStepper=api; show(i+1);};
  container.addEventListener('pointerdown',()=>activeStepper=api);
  if(!activeStepper) activeStepper=api;
  (window.__steppers=window.__steppers||[]).push(api);
  show(0); return api;
}
document.addEventListener('keydown',e=>{ if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||!activeStepper) return; if(e.key==='ArrowRight') activeStepper.show(activeStepper.i+1); if(e.key==='ArrowLeft') activeStepper.show(activeStepper.i-1); });

/* a coordinate plane on a canvas, sharp on any screen, redrawn on theme change and resize.
   const P=Rung.plane(canvas,{x:[-5,5],y:[-5,5],grid:1,draw:(P)=>{ P.axes(); P.fn(x=>x*x,'--ember'); }}); P.redraw(); */
function plane(cv,o){
  o=Object.assign({x:[-5,5],y:[-5,5],grid:1,labels:true,aspect:1},o||{});
  const P={o}; let W=0,H=0,dpr=1; const c=cv.getContext('2d'); P.ctx=c;
  function size(){ dpr=window.devicePixelRatio||1; W=cv.clientWidth||cv.width; H=Math.round(W*(o.aspect||1)); cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); cv.style.height=H+'px'; c.setTransform(dpr,0,0,dpr,0,0); P.W=W; P.H=H; }
  const pad=()=>o.labels?22:6;
  P.X=x=>pad()+(W-pad()-6)*(x-o.x[0])/(o.x[1]-o.x[0]);
  P.Y=y=>(H-pad())-(H-pad()-6)*(y-o.y[0])/(o.y[1]-o.y[0]);
  P.IX=px=>o.x[0]+(px-pad())*(o.x[1]-o.x[0])/(W-pad()-6);
  P.IY=py=>o.y[0]+((H-pad())-py)*(o.y[1]-o.y[0])/(H-pad()-6);
  P.col=n=>col(n);
  P.clear=()=>{ c.clearRect(0,0,W,H); c.fillStyle=col('--card'); c.fillRect(0,0,W,H); };
  P.axes=()=>{ const g=o.grid; c.lineWidth=1; c.strokeStyle=col('--grid'); c.beginPath();
    if(g){ for(let x=Math.ceil(o.x[0]/g)*g;x<=o.x[1]+1e-9;x+=g){ c.moveTo(P.X(x),P.Y(o.y[0])); c.lineTo(P.X(x),P.Y(o.y[1])); }
      for(let y=Math.ceil(o.y[0]/g)*g;y<=o.y[1]+1e-9;y+=g){ c.moveTo(P.X(o.x[0]),P.Y(y)); c.lineTo(P.X(o.x[1]),P.Y(y)); } }
    c.stroke(); c.strokeStyle=col('--muted'); c.lineWidth=1.3; c.beginPath();
    if(o.y[0]<=0&&o.y[1]>=0){ c.moveTo(P.X(o.x[0]),P.Y(0)); c.lineTo(P.X(o.x[1]),P.Y(0)); }
    if(o.x[0]<=0&&o.x[1]>=0){ c.moveTo(P.X(0),P.Y(o.y[0])); c.lineTo(P.X(0),P.Y(o.y[1])); } c.stroke();
    if(o.labels&&g){ c.fillStyle=col('--muted'); c.font='11px IBM Plex Mono, monospace'; c.textAlign='center'; const ly=Math.min(H-6,Math.max(12,P.Y(0)+14));
      const step=g*Math.max(1,Math.round((o.x[1]-o.x[0])/g/10));
      for(let x=Math.ceil(o.x[0]/step)*step;x<=o.x[1]+1e-9;x+=step){ if(Math.abs(x)<1e-9) continue; c.fillText(+x.toFixed(6),P.X(x),ly); }
      c.textAlign='right'; const lx=Math.max(20,Math.min(W-4,P.X(0)-5)); const stepy=g*Math.max(1,Math.round((o.y[1]-o.y[0])/g/10));
      for(let y=Math.ceil(o.y[0]/stepy)*stepy;y<=o.y[1]+1e-9;y+=stepy){ if(Math.abs(y)<1e-9) continue; c.fillText(+y.toFixed(6),lx,P.Y(y)+4); } } };
  P.fn=(f,color,w,dash)=>{ c.strokeStyle=col(color||'--ember'); c.lineWidth=w||2.4; c.setLineDash(dash||[]); c.beginPath(); let pen=false,py=null;
    for(let px=P.X(o.x[0]);px<=P.X(o.x[1]);px+=1){ let y; try{ y=f(P.IX(px)); }catch(e){ y=NaN; } const sy=P.Y(y);
      if(!isFinite(y)||Math.abs(sy)>H*20){ pen=false; continue; } if(pen&&py!==null&&Math.abs(sy-py)>H*1.5) pen=false;
      if(!pen){ c.moveTo(px,sy); pen=true; } else c.lineTo(px,sy); py=sy; }
    c.stroke(); c.setLineDash([]); };
  P.line=(x1,y1,x2,y2,color,w,dash)=>{ c.strokeStyle=col(color||'--ink'); c.lineWidth=w||1.6; c.setLineDash(dash||[]); c.beginPath(); c.moveTo(P.X(x1),P.Y(y1)); c.lineTo(P.X(x2),P.Y(y2)); c.stroke(); c.setLineDash([]); };
  P.poly=(pts,color,fill,w,close)=>{ c.beginPath(); pts.forEach(([x,y],i)=>i?c.lineTo(P.X(x),P.Y(y)):c.moveTo(P.X(x),P.Y(y))); if(close!==false) c.closePath(); if(fill){ c.fillStyle=fill.startsWith('--')?col(fill):fill; c.fill(); } if(color){ c.strokeStyle=col(color); c.lineWidth=w||1.8; c.stroke(); } };
  P.dot=(x,y,color,r)=>{ c.fillStyle=col(color||'--ember'); c.beginPath(); c.arc(P.X(x),P.Y(y),r||4.5,0,7); c.fill(); };
  P.circle=(x,y,rad,color,w,fill)=>{ c.beginPath(); c.ellipse(P.X(x),P.Y(y),Math.abs(P.X(x+rad)-P.X(x)),Math.abs(P.Y(y+rad)-P.Y(y)),0,0,7); if(fill){ c.fillStyle=fill.startsWith('--')?col(fill):fill; c.fill(); } if(color){ c.strokeStyle=col(color); c.lineWidth=w||1.8; c.stroke(); } };
  P.text=(s,x,y,color,align,size)=>{ c.fillStyle=col(color||'--ink'); c.font=(size||13)+'px IBM Plex Mono, monospace'; c.textAlign=align||'left'; c.fillText(s,P.X(x),P.Y(y)); };
  P.redraw=()=>{ if(!W) size(); P.clear(); if(o.draw) o.draw(P); };
  P.point=e=>{ const r=cv.getBoundingClientRect(); return {x:P.IX(e.clientX-r.left),y:P.IY(e.clientY-r.top),px:e.clientX-r.left,py:e.clientY-r.top}; };
  new ResizeObserver(()=>{ size(); P.redraw(); }).observe(cv);
  if(window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>P.redraw());
  size(); return P;
}



/* question groups tick themselves; a page with every question ticked reports itself done to the ladder */
const PAGE=ladderPage();
function progress(){
  const boxes=[...document.querySelectorAll('.sayback')], box=document.querySelector('.themecert')||boxes[0];
  /* special challenges tick like questions; they are never needed for the step, only for the angel wings (Andrew, 2026-11-04) */
  const chs=[...document.querySelectorAll('section.challenge .chid')].filter(el=>!el.closest('#desk'));
  const CH={n:chs.length,d:chs.filter(el=>el.classList.contains('done')).length};
  if(box){
    const vars=boxes.flatMap(b=>[...b.querySelectorAll('.qid')]).filter(el=>/^(?:[^.\s]+\.\d+\.\d+|\d+[a-z]+\d+\.\d+)$/.test(el.textContent.trim()));
    boxes.flatMap(b=>[...b.querySelectorAll('.qid.auto')]).forEach(g=>{
      const id=g.textContent.trim(); const mine=vars.filter(v=>v.textContent.trim().startsWith(id+'.'));
      const full=mine.length>0&&mine.every(v=>v.classList.contains('done'));
      g.classList.toggle('done',full); const li=g.closest('li'); if(li) li.classList.toggle('complete',full);
    });
    /* optional questions (li.opt) are not needed to complete the page; they are needed for the rung's star */
    const req=vars.filter(v=>!v.closest('li.opt')), opt=vars.filter(v=>v.closest('li.opt'));
    const all=req.length>0&&req.every(v=>v.classList.contains('done'));
    const any=vars.some(v=>v.classList.contains('done'));
    const optAll=opt.every(v=>v.classList.contains('done'));
    const hasOpt=opt.length>0;
    certify(box,all);
    if(window.MarksSync&&MarksSync.reportPage) MarksSync.reportPage(PAGE,all,any,optAll,hasOpt,CH);
    else { try{ const m=JSON.parse(LS.getItem('pages:done')||'{}'); m[PAGE]={v:all,a:any,o:optAll,h:hasOpt,cn:CH.n,cd:CH.d,t:Date.now()}; LS.setItem('pages:done',JSON.stringify(m)); }catch(e){} }
  } else if(/^r\d\d[a-z]+$/.test(PAGE)&&!/concl$/.test(PAGE)&&document.querySelector('header.top .tags .tag')&&!document.querySelector('.qid')){
    /* a step with no questions (1a, from 2026-10-29) ticks itself once it has been read */
    if(window.MarksSync&&MarksSync.reportPage) MarksSync.reportPage(PAGE,true,true,true,false);
    else { try{ const m=JSON.parse(LS.getItem('pages:done')||'{}'); m[PAGE]={v:true,a:true,o:true,h:false,t:Date.now()}; LS.setItem('pages:done',JSON.stringify(m)); }catch(e){} }
  }
  placeHere();
  if(window.__barStats) window.__barStats();
}
/* certification (Andrew, 2026-10-29): one kind, replacing quiz, test and exam. A gold button shows once the
   required questions (x.1 to x.3) are ticked; sat under a proctor it becomes a green check, sat on your own a gold star.
   The sitting itself (fresh questions from the randomizer) is not built yet; the record is cert:<page> = 'proctor' | 'self'. */
function certRead(key){ try{ return JSON.parse(LS.getItem('cert:'+(key||PAGE))||'null'); }catch(e){ return null; } }
const CERTTXT={rung:'This is the rung’s last step, so its certification is the rung’s: one short sitting of fresh questions on the whole rung, this step’s among them.',step:'A certification is one short sitting of fresh questions on this step, drawn from the laundry.',floor:'The floor’s certification is one fresh question a rung, about an hour in all.'};
function certFill(w,key,open,what){
  const rec=certRead(key);
  if(!open&&!rec){ w.innerHTML=''; w.hidden=true; return; }
  w.hidden=false;
  if(rec&&rec.by==='proctor'){ w.innerHTML='<span class="certdone proctor" title="certified under a proctor">✓ certified</span>'; return; }
  if(rec&&rec.by==='self'){ w.innerHTML='<span class="certdone self" title="certified on your own">★ certified</span>'; return; }
  w.innerHTML='<button type="button" class="certbtn">'+(what==='rung'?'rung certification':what==='floor'?'floor certification':'certification')+'</button><div class="certpanel" hidden><p>'+CERTTXT[what||'step']+' Sit it under a proctor and it becomes a green check. Sit it on your own and it becomes a gold star.</p><p class="certsoon">The sitting is still being built; this button is where it will open.</p></div>';
  const b=w.querySelector('.certbtn'), p=w.querySelector('.certpanel'); b.onclick=e=>{ e.preventDefault(); e.stopPropagation(); p.hidden=!p.hidden; };
}
window.LadderCert={read:certRead,fill:(el,key,open)=>{ if(!el) return; el.classList.add('certwrap'); certFill(el,key,open,'floor'); }};
/* the last in a series folds into the larger one (Andrew, 2026-10-29 18:32): a rung's last core step carries the rung's
   certification; the last step of a floor's last rung carries none, since the floor's certification covers it */
function certify(box,all){
  let w=box.querySelector(':scope>.certwrap');
  if(!w){ w=document.createElement('div'); w.className='certwrap'; box.appendChild(w); }
  const m=(document.querySelector('meta[name="ladder-cert"]')||{}).content||'';
  if(/^floor:/.test(m)){ const n=m.split(':')[1]; w.hidden=!all;
    w.innerHTML=all?'<p class="certnote">This is the floor’s last step, so its certification is the floor’s: <a href="floor'+n+'concl.html#cert">beside the floor conclusion</a>.</p>':''; return; }
  certFill(w,PAGE,all,m==='rung'?'rung':'step');
}
/* on the ladder: beside each floor conclusion row, its certification (once the floor conclusion has opened) */
function floorCerts(){
  const rows=[...document.querySelectorAll('.rungs li.k-concl')].filter(li=>{ const a=li.querySelector('.t a'); return a&&/^floor\d+concl$/.test(hstem(a.getAttribute('href'))); });
  if(!rows.length) return;
  let pages={}; try{ pages=JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){}
  rows.forEach(li=>{ const stem=hstem(li.querySelector('.t a').getAttribute('href'));
    let w=li.querySelector('.certrow'); if(!w){ w=document.createElement('a'); w.className='certrow'; w.href=stem+'.html#cert'; li.querySelector('.t').appendChild(w); }
    const rec=certRead(stem), open=!!(pages[stem]&&pages[stem].v);
    if(rec&&rec.by==='proctor'){ w.textContent='✓ certified'; w.className='certrow proctor'; }
    else if(rec&&rec.by==='self'){ w.textContent='★ certified'; w.className='certrow self'; }
    else if(open){ w.textContent='certification'; w.className='certrow'; }
    else { w.textContent='certification'; w.className='certrow wait'; w.title='opens once every step of the floor is ticked'; } });
}
/* on the ladder: a step row can be ticked only once its page reports every question ticked; integer rungs are self-report */
async function gateLadder(localOnly){
  const rows=[...document.querySelectorAll('li.autorow')];
  if(!rows.length) return;
  let pages={}; try{ pages=JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){}
  if(!localOnly){ try{ if(window.MarksSync&&MarksSync.pages) pages=await MarksSync.pages(); }catch(e){} }
  rows.forEach(li=>{
    const a=li.querySelector('.t a'); if(!a) return;
    const stem=hstem(a.getAttribute('href'));
    li.classList.toggle('passed',!!(pages[stem]&&pages[stem].v));
    li.classList.toggle('started',!!(pages[stem]&&pages[stem].a));
    li.classList.toggle('starred',!!(pages[stem]&&pages[stem].v&&pages[stem].o!==false));
    li.classList.toggle('starcleared',!!(pages[stem]&&pages[stem].h&&pages[stem].o));
  });
  /* integer rungs are opened by the button at the foot of the rung's own page ("open:<stem>");
     a rung ticked on the ladder under the old way still counts until its page says otherwise */
  const L=window.__ladderMarks;
  document.querySelectorAll('li.k-theory.built').forEach(li=>{
    const a=li.querySelector('.t a'); if(!a) return;
    const stem=hstem(a.getAttribute('href'));
    const r=pages['open:'+stem]; const lab=(li.querySelector(':scope>.n')||{}).textContent||'';
    li.classList.toggle('passed', r ? !!r.v : !!(L&&L.st['L:'+lab.trim()]));
  });
  placeHere();
}
function theoryHint(li){
  let h=li.querySelector('.lockhint'); if(h) return;
  h=document.createElement('span'); h.className='lockhint'; h.textContent=li.classList.contains('passed')?'open: you opened it at the foot of its page':'open the rung with the button at the foot of its page';
  (li.querySelector(':scope>.t')||li).appendChild(h); setTimeout(()=>h.remove(),2600);
}
function lockedHint(li){
  let h=li.querySelector('.lockhint'); if(h) return;
  h=document.createElement('span'); h.className='lockhint'; h.textContent=li.classList.contains('passed')?'ticked itself: every question on this page is ticked':'ticks itself when every question on this page is ticked';
  (li.querySelector(':scope>.t')||li).appendChild(h); setTimeout(()=>h.remove(),2600);
}


/* On the ladder, an integer rung's steps stay packed under it until the rung is ticked; ticking it unpacks them
   (a short staggered unfolding, skipped for reduced motion). Unticking packs them again. */
let openSeen=new Set(), openSeeded=true;
try{ const raw=LS.getItem('ladder:openSeen'); if(raw===null) openSeeded=false; else openSeen=new Set(JSON.parse(raw)||[]); }catch(e){}
function saveOpenSeen(){ try{ LS.setItem('ladder:openSeen',JSON.stringify([...openSeen])); }catch(e){} }
function packLadder(){
  /* the "open it at the foot" cue shows only on the lowest rung not yet opened (Andrew, 2026-10-31) */
  let lowest=Infinity;
  document.querySelectorAll('section.rung li.k-theory.built:not(.passed)').forEach(th=>{ const v=parseFloat(((th.querySelector(':scope>.n')||{}).textContent||'').trim()); if(!isNaN(v)&&v<lowest) lowest=v; });
  document.querySelectorAll('section.rung').forEach(sec=>{
    const th=sec.querySelector('li.k-theory.built'); if(!th) return;
    const subs=[...sec.querySelectorAll('ol.ladder>li')].filter(li=>li!==th);
    if(!subs.length) return;
    let cue=th.querySelector('.unpackcue');
    if(!cue){ cue=document.createElement('span'); cue.className='unpackcue'; (th.querySelector(':scope>.t')||th).appendChild(cue); }
    const open=th.classList.contains('passed');
    const lab=((th.querySelector(':scope>.n')||{}).textContent||'').trim();
    if(open&&!openSeen.has(lab)){ openSeen.add(lab); saveOpenSeen(); if(openSeeded){ sec.classList.add('packed'); unpack(sec,true); } }
    if(!open){ sec.classList.add('packed'); cue.textContent=parseFloat(lab)===lowest?'open it at the foot of its page to unpack its '+(subs.length>1?'steps':'step'):''; }
    else if(sec.classList.contains('packed')&&!sec.dataset.unpacking){ sec.classList.remove('packed'); cue.textContent=''; }
    else cue.textContent='';
    const built=subs.filter(li=>li.classList.contains('built'));
    /* STEM annexes are gifts: the crown needs the rest; finishing the annexes too puts a royal crown on the star */
    const ANNEX=['phys','chem','bio','comp','stat','now','econ','logi','eng','crypt','nav'].map(k=>'k-'+k);
    const isAnnex=li=>ANNEX.some(k=>li.classList.contains(k));
    const done=li=>li.classList.contains('passed')&&(!li.classList.contains('autorow')||li.classList.contains('starred'));
    built.forEach(li=>li.classList.toggle('annexrow',isAnnex(li)));
    const core=built.filter(li=>!isAnnex(li)), annex=built.filter(isAnnex);
    const complete=open&&core.length>0&&core.every(done);
    const royal=complete&&annex.length>0&&annex.every(done);
    sec.classList.toggle('complete',complete);
    sec.classList.toggle('royal',royal);
    if(complete) crown(sec,th,core,royal);
    else { sec.classList.remove('folded'); const c=th.querySelector('.crown'); if(c) c.remove(); }
  });
}
/* a finished rung folds into a teal star and its emblem (the rung's claim in the marks it taught);
   the first time the ladder sees it finished, the folding plays; a small arrow opens it again */
function crown(sec,th,built,royal){
  const label=th.querySelector(':scope>.n').textContent.trim();
  let c=th.querySelector('.crown');
  if(!c){
    c=document.createElement('div'); c.className='crown';
    const star=document.createElement('span'); star.className='star'; star.textContent='★';
    const emb=document.createElement('span'); emb.className='emblem';
    const tex=th.getAttribute('data-emblem')||'';
    if(tex&&window.katex){ try{ katex.render(tex,emb,{throwOnError:false,trust:true}); }catch(e){ emb.textContent=tex; } } else emb.textContent=tex;
    const arrow=document.createElement('button'); arrow.className='crownarrow'; arrow.type='button';
    arrow.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); sec.classList.toggle('folded'); arrow.textContent=sec.classList.contains('folded')?'▸ open':'▾ fold'; arrow.setAttribute('aria-expanded',String(!sec.classList.contains('folded'))); });
    const wrap=document.createElement('span'); wrap.className='starwrap'; wrap.append(star);
    c.append(wrap,emb,arrow); const tt=th.querySelector(':scope>.t')||th; tt.insertBefore(c,tt.firstChild);
    sec.classList.add('folded'); arrow.textContent='▸ open'; arrow.setAttribute('aria-expanded','false');
  }
  const L=window.__ladderMarks; const key='C:'+label;
  if(L&&!L.st[key]){
    L.st[key]=true; L.save(key);
    const calm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!calm){
      sec.classList.remove('folded'); sec.classList.add('crowning');
      built.forEach((li,i)=>{ li.style.animationDelay=((built.length-1-i)*90)+'ms'; li.classList.add('foldaway'); });
      setTimeout(()=>{ sec.classList.add('folded'); sec.classList.remove('crowning'); built.forEach(li=>{ li.classList.remove('foldaway'); li.style.animationDelay=''; }); c.classList.add('arrive'); setTimeout(()=>c.classList.remove('arrive'),1400); },built.length*90+520);
    }
  }
  const wrap=c.querySelector('.starwrap'); let rc=wrap&&wrap.querySelector('.royalcrown');
  if(royal&&wrap&&!rc){
    rc=document.createElement('span'); rc.className='royalcrown'; rc.textContent='\u{1F451}'; rc.setAttribute('aria-label','royal crown: every annex finished too'); rc.title='every annex finished too';
    wrap.appendChild(rc);
    const rkey='R:'+label;
    if(L&&!L.st[rkey]){ L.st[rkey]=true; L.save(rkey); const calm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches; if(!calm){ rc.classList.add('drop'); setTimeout(()=>rc.classList.remove('drop'),2600); } }
  } else if(!royal&&rc) rc.remove();
}
function unpack(sec,animate){
  if(!sec) return;
  const th=sec.querySelector('li.k-theory'); const subs=[...sec.querySelectorAll('ol.ladder>li')].filter(li=>li!==th);
  const calm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  sec.classList.remove('packed'); const cue=th&&th.querySelector('.unpackcue'); if(cue) cue.textContent='';
  if(!animate||calm) return;
  sec.dataset.unpacking='1';
  subs.forEach((li,i)=>{ li.classList.remove('unfold'); void li.offsetWidth; li.style.animationDelay=(i*110)+'ms'; li.classList.add('unfold'); });
  if(th){ th.classList.remove('popped'); void th.offsetWidth; th.classList.add('popped'); }
  setTimeout(()=>{ delete sec.dataset.unpacking; subs.forEach(li=>{ li.classList.remove('unfold'); li.style.animationDelay=''; }); },subs.length*110+900);
}

/* "you are here": on the ladder, the first built row not yet ticked; on a page, the first question not yet ticked.
   It moves as marks change (here, or synced in from another device). The same marks will drive the unlocks. */
function placeHere(){
  packLadder(); ladderStats();
  document.querySelectorAll('.here').forEach(h=>h.remove());
  document.querySelectorAll('.pagedone').forEach(h=>h.remove());
  const tag=(text,cls)=>{ const h=document.createElement('span'); h.className='here'+(cls?' '+cls:''); h.textContent=text; return h; };
  const rows=[...document.querySelectorAll('li.built')].filter(li=>li.querySelector(':scope>.n'));
  if(rows.length){
    const done=li=>li.classList.contains('passed');
    const first=rows.findIndex(li=>!done(li));
    if(first<0) return;
    rows.forEach((li,i)=>{
      if(done(li)) return;
      const jumped=i>first&&(done(rows[i-1])||li.classList.contains('started'));
      if(i===first) (li.querySelector(':scope>.t')||li).appendChild(tag('you are here'));
      else if(jumped) (li.querySelector(':scope>.t')||li).appendChild(tag('you are also here','also'));
    });
    return;
  }
  const qs=[...document.querySelectorAll('.qid')].filter(el=>!el.closest('#desk')&&/^(?:[^.\s]+\.\d+\.\d+|\d+[a-z]+\d+\.\d+)$/.test(el.textContent.trim()));
  if(!qs.length) return;
  const dn=el=>el.classList.contains('done');
  const first=qs.findIndex(el=>!dn(el));
  if(first<0){ const box=document.querySelector('.sayback'); if(box){ const d=document.createElement('p'); d.className='pagedone'; d.textContent='Every question on this page is ticked, and its row on the ladder has ticked itself.'; const h2=box.querySelector('h2'); (h2||box).insertAdjacentElement('afterend',d); } return; }
  qs.forEach((q,i)=>{
    if(dn(q)) return;
    if(i===first) q.insertAdjacentElement('afterend',tag('you are here'));
    else if(dn(qs[i-1])) q.insertAdjacentElement('afterend',tag('you are also here','also'));
  });
}

/* marks: click a question number or a ladder row number to toggle ✓; mirrored to the artifact's record by sync.js */
function marks(){
  const KEY='marks:'+(document.title||location.pathname);
  let st={}; try{ st=JSON.parse(LS.getItem(KEY)||'{}'); }catch(e){ st={}; }
  /* rung 1's steps moved one letter on (2026-10-25: the boxes page became 1a): carry old marks across */
  const RL=(PAGE.match(/^r01([a-h])$/)||[])[1]; const OLD=RL?'1'+RL:null, NEW=RL?'1'+String.fromCharCode(RL.charCodeAt(0)+1):null;
  const relabel=()=>{ if(!OLD) return false; let ch=false; Object.keys(st).forEach(k=>{ if(k.startsWith('q:'+OLD+'.')){ const nk='q:'+NEW+k.slice(2+OLD.length); if(!(nk in st)){ st[nk]=st[k]; ch=true; } } }); return ch; };
  if(OLD&&!Object.keys(st).length){ try{ const old=JSON.parse(LS.getItem('marks:'+(document.title||'').replace(new RegExp('^'+NEW+'\\b'),OLD))||'{}'); Object.assign(st,old); }catch(e){} }
  if(relabel()){ try{ LS.setItem(KEY,JSON.stringify(st)); }catch(e){} }
  const save=id=>{ try{ LS.setItem(KEY,JSON.stringify(st)); }catch(e){} if(window.MarksSync) MarksSync.push(KEY,st,id); };
  if(document.querySelector('li.built')) window.__ladderMarks={st,save};
  const items=[];
  const VAR=/^(?:[^.\s]+\.\d+\.\d+|\d+[a-z]+\d+\.\d+)$/;
  document.querySelectorAll('.qid').forEach(el=>{ if(el.closest('#desk')) return; if(!VAR.test(el.textContent.trim())){ el.classList.add('auto'); el.title='ticks itself when every question in this group is ticked; tap for prompt or report'; return; } items.push({el,id:'q:'+el.textContent.trim(),on:()=>el.classList.contains('done'),set:v=>el.classList.toggle('done',v)}); });
  document.querySelectorAll('section.challenge .chid').forEach(el=>{ if(el.closest('#desk')) return; el.title='tap when you have cleared this challenge'; items.push({el,id:'c:'+el.textContent.trim(),on:()=>el.classList.contains('done'),set:v=>el.classList.toggle('done',v)}); });
  document.querySelectorAll('li>.n').forEach(el=>{ const li=el.parentElement;
    if(li.classList.contains('built')&&!li.classList.contains('k-theory')&&!li.classList.contains('k-gate')){ li.classList.add('autorow'); el.title='ticks itself when every question on this page is ticked'; el.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); lockedHint(li); }); return; }
    items.push({el,id:'L:'+el.textContent.trim(),on:()=>li.classList.contains('passed'),set:v=>li.classList.toggle('passed',v)}); });
  items.forEach(it=>{ if(it.id in st) it.set(!!st[it.id]);
    const tick=()=>{ const li=it.el.parentElement;
      if(li&&li.classList&&li.classList.contains('k-theory')){ theoryHint(li); return; }
      const v=!it.on(); it.set(v); st[it.id]=v; save(it.id); progress();
      if(it.id.startsWith('L:')&&li.classList.contains('k-theory')&&v) unpack(li.closest('section.rung'),true); };
    it.el.__tick=tick;
    it.el.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation();
      if(it.id.startsWith('q:')&&window.__qMenu) window.__qMenu(it.el,()=>tick(),it.on()); else tick(); }); });
  document.querySelectorAll('.qid.auto').forEach(el=>el.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); if(window.__qMenu) window.__qMenu(el,null,false); }));
  progress(); gateLadder(true);
  const go=()=>{ if(window.MarksSync){ const r=MarksSync.init(KEY,st,items); const after=()=>{ if(relabel()){ try{ LS.setItem(KEY,JSON.stringify(st)); }catch(e){} items.forEach(it=>{ if(it.id in st){ it.set(!!st[it.id]); if(it.id.startsWith('q:'+NEW+'.')) MarksSync.push(KEY,st,it.id); } }); } progress(); gateLadder(); }; if(r&&r.then) r.then(after,after); else after(); } };
  if(window.MarksSync) go(); else { const s=document.createElement('script'); s.src='sync.js'; s.onload=go; document.head.appendChild(s); }
  /* pull again whenever the page comes back into view, so a ✓ made on another device shows up without a reload */
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) go(); });
  window.addEventListener('pageshow',e=>{ if(e.persisted) go(); });
  if(items.length&&document.querySelector('.qid')){ const p=document.createElement('p'); p.className='marknote'; p.textContent='Tap a question’s label to tick it ✓, prompt from it, or report it. Marks save in this browser and sync to the ladder’s record; I say in chat when one is earned.'; document.body.appendChild(p); }
}

/* desk */
function deskHTML(){
  const b=document.createElement('button'); b.id='deskbtn'; b.setAttribute('aria-label','open the desk: questions and a grapher'); b.textContent='☰ desk';
  const d=document.createElement('div'); d.id='desk'; d.setAttribute('role','dialog'); d.setAttribute('aria-label','desk');
  const qs=!!document.querySelector('.sayback');
  d.innerHTML='<div class="dtabs">'+(qs?'<button data-p="qs">Questions</button>':'')+'<button data-p="graph">Graph</button><button data-p="moves">Reference</button><button data-p="rand">Laundry</button><button data-p="rec">Record</button><button type="button" class="dkeys" aria-label="the math keys">⌨ Keys</button><a class="dshare" href="install.html">Share the ladder</a><button class="x" aria-label="close">✕</button></div>'
    +(qs?'<div class="dpane" id="dp-qs"><p class="dnote">The page’s questions, here so you can read them beside the class.</p><div class="dq" id="dq"></div></div>':'')
    +'<div class="dpane" id="dp-graph"><div id="dmg"></div><p class="dnote" style="margin-top:10px">Type it as on paper: x^2, 2sin(x), e^x, ln x, √x, |x|, x!. a, b, c and k get sliders.</p></div>'
    +'<div class="dpane" id="dp-moves"><p class="dnote" id="dmnote">The techs this step uses and builds: what each is called, what it does in words, and the line in symbols.</p><div id="dmoves"></div><p><a class="dlink" href="moves.html">every tech you have earned →</a></p></div>'
    +'<div class="dpane" id="dp-rand"><p class="dnote">Practice drawn from the pools your steps have opened, with no repeats.</p></div>'
    +'<div class="dpane" id="dp-rec"><p class="dnote">Everything the ladder remembers about your climb is one record, kept on this device. Save it as a file to keep a copy or to carry it to another device, and open that file there.</p><p><button type="button" class="dlink recx">save my record as a file</button></p><p><label class="dlink">open a record file <input type="file" accept=".json,application/json" class="reci" hidden></label></p><p class="dnote" id="recnote"></p></div>';
  document.body.append(b,d);
}

/* An integer rung is opened at the foot of its own page: an orange button that turns teal. */
function openRungButton(){
  const m=PAGE.match(/^r(\d+)$/); if(!m||!document.querySelector('header.top .tag.theory')) return;
  const stem=PAGE, lab=String(+m[1]), id='open:'+stem;
  const box=document.createElement('div'); box.className='openrung';
  const b=document.createElement('button'); b.type='button'; b.className='openbtn';
  const note=document.createElement('span'); note.className='opennote';
  box.append(b,note);
  const nav=document.querySelector('nav.nextrung'); if(nav) nav.parentNode.insertBefore(box,nav); else (document.querySelector('.wrap')||document.body).appendChild(box);
  const legacy=()=>{ try{ const st=JSON.parse(LS.getItem('marks:The Ladder')||'{}'); return !!st['L:'+lab]; }catch(e){ return false; } };
  const local=()=>{ try{ return JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){ return {}; } };
  let on=false;
  const show=()=>{ b.classList.toggle('on',on); b.textContent=on?'the rung is open':'open the rung'; b.setAttribute('aria-pressed',String(on));
    note.textContent=on?'its steps are unpacked on the ladder; click again to close it':'opens its steps on the ladder'; };
  const fromPages=p=>{ const r=p[id]; on=r?!!r.v:legacy(); show(); };
  fromPages(local());
  const withSync=f=>{ if(window.MarksSync) return f(); let n=0; const t=setInterval(()=>{ if(window.MarksSync||++n>40){ clearInterval(t); if(window.MarksSync) f(); } },150); };
  withSync(()=>{ if(MarksSync.pages) MarksSync.pages().then(fromPages,()=>{}); });
  b.addEventListener('click',()=>{ on=!on; show();
    if(window.MarksSync&&MarksSync.reportPage) MarksSync.reportPage(id,on,on,true,false);
    else { try{ const p=local(); p[id]={v:on,a:on,o:true,h:false,t:Date.now()}; LS.setItem('pages:done',JSON.stringify(p)); }catch(e){} } });
  if(stem==='r00'){ try{ LS.setItem('ladder:introFolded','1'); }catch(e){} }
}
/* On the ladder, the introduction folds away once rung 0 has been clicked for the first time. */
function introFold(){
  const intro=document.getElementById('intro'); if(!intro) return;
  const btn=document.createElement('button'); btn.type='button'; btn.className='introtoggle';
  intro.parentNode.insertBefore(btn,intro);
  let folded=false; try{ folded=LS.getItem('ladder:introFolded')==='1'; }catch(e){}
  const set=v=>{ intro.classList.toggle('folded',v); btn.hidden=!folded; btn.textContent=v?'▸ about the ladder':'▾ fold the introduction'; btn.setAttribute('aria-expanded',String(!v)); };
  set(folded);
  btn.addEventListener('click',()=>set(!intro.classList.contains('folded')));
  document.querySelectorAll('a[href="r00.html"]').forEach(a=>a.addEventListener('click',()=>{ try{ LS.setItem('ladder:introFolded','1'); }catch(e){} }));
}

/* Beside the ladder: an orange ladder with the furthest rung with a certification or a floor passed,
   and a teal star with the number of rungs crowned. */
function ladderStats(){
  const rungs=document.querySelector('.rungs'); if(!rungs) return;
  let box=document.querySelector('.ladderstats');
  if(!box){
    box=document.createElement('div'); box.className='ladderstats'; box.setAttribute('role','status');
    box.innerHTML='<span class="ls ls-far" title="the furthest rung with a certification or a floor passed"><svg viewBox="0 0 20 28" width="18" height="25" aria-hidden="true"><path d="M5 1v26M15 1v26M5 6h10M5 12h10M5 18h10M5 24h10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><b class="ls-n">–</b><span class="ls-l">furthest rung passed</span></span><span class="ls ls-star" title="rungs crowned with the star"><span class="ls-s" aria-hidden="true">★</span><b class="ls-n">0</b><span class="ls-l">rungs starred</span></span>';
    rungs.parentNode.insertBefore(box,rungs);
  }
  let pages={}; try{ pages=JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){}
  let far=-1;
  document.querySelectorAll('li.k-gate,li.k-quiz,li.k-test').forEach(li=>{
    const lab=((li.querySelector(':scope>.n')||{}).textContent||'').trim(); const n=parseInt(lab,10); if(isNaN(n)) return;
    const a=li.querySelector('.t a'); const kind=(lab.split('·')[1]||'').trim()||'gate';
    const stem=a?hstem(a.getAttribute('href')):('r'+String(n).padStart(2,'0')+kind);
    if((pages[stem]&&pages[stem].v)||li.classList.contains('passed')) far=Math.max(far,n);
  });
  for(let i=0;i<LS.length;i++){ const k=LS.key(i)||''; const m=k.match(/^cert:r(\d\d)/); if(m) far=Math.max(far,+m[1]); }
  floorCerts();
  box.querySelector('.ls-far .ls-n').textContent=far<0?'–':String(far);
  box.querySelector('.ls-star .ls-n').textContent=String(document.querySelectorAll('section.rung.complete').length);
  try{ LS.setItem('ladder:stats',JSON.stringify({far,stars:document.querySelectorAll('section.rung.complete').length})); }catch(e){}
  if(window.__barStats) window.__barStats();
}

/* The bar's three counts (Andrew, 2026-11-04 18:38):
   blue stars = steps with every footing question cleared + rungs with every step starred + floors with every rung starred;
   gold stars = steps certified + rungs certified + floors certified;
   angel wings = rungs and floors with their blue star, their gold star and every challenge cleared.
   The shape of the ladder comes from ladmap.js (made from ladder.tsv). A rung's certification is its last core step's;
   the last rung of a floor is certified by the floor's certification. */
function starCounts(){
  const M=window.LADMAP; if(!M) return null;
  let pages={}; try{ pages=JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){}
  const cert=k=>!!certRead(k), P=s=>pages[s]||{};
  const blueStep=s=>!!P(s).v, starStep=s=>!!(P(s).v&&P(s).o!==false), cleared=([s,n])=>!n||(+P(s).cd||0)>=n;
  let blue=0,gold=0,wings=0;
  M.forEach(([fl,rungs])=>{ let fB=rungs.length>0,fC=true; const fG=cert('floor'+fl+'concl');
    rungs.forEach(([r,core,annex],i)=>{
      core.concat(annex).forEach(([s])=>{ if(blueStep(s)) blue++; if(cert(s)) gold++; });
      const rB=core.every(([s])=>starStep(s)), rG=i===rungs.length-1?fG:cert(core[core.length-1][0]), rC=core.every(cleared);
      if(rB) blue++; if(rG) gold++; if(rB&&rG&&rC) wings++;
      fB=fB&&rB; fC=fC&&rC; });
    if(fB) blue++; if(fG) gold++; if(fB&&fG&&fC) wings++; });
  return {blue,gold,wings};
}
const ICON_L='<svg class="lb-L" viewBox="104 92 308 328" aria-hidden="true"><path d="M222,132 L384,358" stroke="#5fd13a" stroke-width="16" stroke-linecap="round"/><path fill="currentColor" d="M112,100 L262,100 L262,108 C238,108 225,112 223,136 L222,360 L360,360 C384,359 397,342 398,294 L405,294 L400,412 L112,412 L112,404 C134,404 149,399 150,378 L150,136 C149,112 136,108 112,108 Z"/><path d="M222,318 L264,318 L264,360" fill="none" stroke="#e8703a" stroke-width="16"/></svg>';
const WINGS='<svg viewBox="0 0 28 14" width="22" height="11" aria-hidden="true"><path fill="currentColor" d="M13.4 9.2C11 3.6 6.4.9.8.8c1 3 2.4 5 4.4 6.2-1 .5-1.7 1.1-2.2 1.9 1.9.9 3.8 1 5.2.7-.6 1-.8 2-.5 3.2 1.4.4 3.4-.2 5.7-3.6z"/><path fill="currentColor" transform="matrix(-1 0 0 1 28 0)" d="M13.4 9.2C11 3.6 6.4.9.8.8c1 3 2.4 5 4.4 6.2-1 .5-1.7 1.1-2.2 1.9 1.9.9 3.8 1 5.2.7-.6 1-.8 2-.5 3.2 1.4.4 3.4-.2 5.7-3.6z"/></svg>';

/* The ladder bar: sticky along the foot of every page. The ladder (home, with how far you have climbed),
   the keys, and the tray (the page's questions, a grapher, the quick moves, the randomizer). */
function ladderBar(){
  if(document.getElementById('lbar')) return;
  const home=!!document.querySelector('.rungs');
  const bar=document.createElement('nav'); bar.id='lbar'; bar.setAttribute('aria-label','the ladder bar');
  bar.innerHTML=(home?'<button type="button" class="lb lb-ladder"':'<a class="lb lb-ladder" href="index.html"')+' title="the ladder"><span class="lb-l" aria-label="Ladder">'+ICON_L+'<span class="lb-w">adder</span></span>'+(home?'</button>':'</a>')
    +'<span class="lb-counts" role="status"><span class="lc lc-blue" title="blue stars: steps with every footing question cleared, rungs with every step starred, floors with every rung starred"><span aria-hidden="true">★</span><b>0</b><span class="vh"> blue stars</span></span><span class="lc lc-gold" title="gold stars: steps, rungs and floors certified"><span aria-hidden="true">★</span><b>0</b><span class="vh"> gold stars</span></span><span class="lc lc-wing" title="angel wings: rungs and floors with their blue star, their gold star and every challenge cleared">'+WINGS+'<b>0</b><span class="vh"> angel wings</span></span></span>'
    +'<span class="lb-gap"></span>'+'<button type="button" class="lb lb-keys" aria-label="the keys" hidden>⌨ <span class="lb-l">keys</span></button>'+'<button type="button" class="lb lb-tray" aria-label="the toolbox">☰ <span class="lb-l">toolbox</span></button>';
  document.body.appendChild(bar); document.body.classList.add('hasbar');
  const stats=()=>{ const v=starCounts(); if(!v) return;
    bar.querySelector('.lc-blue b').textContent=v.blue; bar.querySelector('.lc-gold b').textContent=v.gold; bar.querySelector('.lc-wing b').textContent=v.wings; };
  window.__barStats=stats;
  if(window.LADMAP) stats(); else { const sc=document.createElement('script'); sc.src='ladmap.js'; sc.onload=stats; document.head.appendChild(sc); }
  addEventListener('storage',e=>{ if(!e.key||e.key==='ladder:record') setTimeout(stats,0); });
  if(home) bar.querySelector('.lb-ladder').onclick=()=>climbTo(true);
  const kb=bar.querySelector('.lb-keys'); if(kb) kb.onclick=()=>{ const b=document.querySelector('#mk-tray .mk-btn'); if(b) b.click(); };
  bar.querySelector('.lb-tray').onclick=()=>{ const b=document.getElementById('deskbtn'); if(b) b.click(); };
  const sync=()=>{ const t=document.getElementById('mk-tray'), d=document.getElementById('desk');
    if(kb){ kb.hidden=!!d||!t; kb.classList.toggle('on',!!(t&&t.classList.contains('open'))); }
    const dk=document.querySelector('#desk .dkeys'); if(dk) dk.classList.toggle('on',!!(t&&t.classList.contains('open')));
    bar.querySelector('.lb-tray').classList.toggle('on',!!(d&&d.classList.contains('open'))); };
  new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']}); sync();
}
/* On the ladder, rung 0 is at the foot and the page opens where you are standing. */
function climbTo(smooth){
  const h=document.querySelector('.rungs .here')||document.querySelector('.rungs section.rung');
  if(h) h.scrollIntoView({block:'center',behavior:smooth?'smooth':'auto'});
}

function ready(f){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',f); else f(); }
window.Rung={tex,col,stepper,plane,ready,renderAll,_desk:deskHTML};
ready(()=>{ renderAll(document);
  [...document.querySelectorAll('.wrap h2,.wrap h3')].forEach((h,i)=>{ if(!h.id) h.id='sec-'+(i+1); });
  // marks run after the page script has had its turn
  setTimeout(marks,0);
  // deep links: #slide-N (first slides), #pic, #sec-N
  function jump(){ const m=(location.hash||'').match(/^#(slide-(\d+)|pic|sec-\d+)$/); if(!m) return;
    setTimeout(()=>{ let el; const S=(window.__steppers||[])[0];
      if(m[2]&&S){ S.show(+m[2]-1); el=S.container; } else if(m[1]==='pic') el=document.querySelector('section.pic'); else el=document.getElementById(m[1]);
      if(el) el.scrollIntoView({block:'start'}); },250); }
  window.addEventListener('hashchange',jump); jump();
  openRungButton(); introFold();
  /* a fresh page starts at its top. Inside the claude.ai frame the host can keep the old scroll offset
     when the frame moves to a new page, which landed readers halfway down; scrollIntoView also moves
     the frame's ancestors, so the top of the new page comes into view. Deep links (#…) keep their jump. */
  if(!location.hash){ try{ if('scrollRestoration' in history) history.scrollRestoration='manual'; }catch(e){}
    const top=()=>{ try{ window.scrollTo(0,0); const h=document.querySelector('header.top')||document.body; h.scrollIntoView({block:'start'}); }catch(e){} };
    if(document.querySelector('.rungs')){ [60,400,1200].forEach(t=>setTimeout(()=>climbTo(false),t)); }
    else { top(); setTimeout(top,60); } }
  ladderBar();
});
})();

/* ---- MathGraph (shared grapher) ---- */
/* MathGraph: a small function grapher for the lesson pages. Type a function of x the way you'd
   write it (x^2, 2sin(x), e^x, ln x, (1+1/x)^x, √x, |x|, x!), up to three at once; drag to pan,
   pinch or scroll to zoom; touch or hover to trace; sliders appear for a, b, c, k. */
(function(){
'use strict';
const SUP={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-','⁺':'+','ⁿ':'n','ˣ':'x','½':'(1/2)'};
function normalize(s){
  s=s.replace(/[×·∙⋅]/g,'*').replace(/÷/g,'/').replace(/[−–]/g,'-').replace(/π/g,'pi').replace(/θ/g,'x').replace(/∛/g,'cbrt').replace(/√/g,'sqrt').replace(/eˣ/g,'e^x');
  s=s.replace(/^\s*(?:y|f\s*\(\s*x\s*\))\s*=\s*/,'');
  // superscript runs -> ^(…)
  s=s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ⁿˣ]+/g,m=>'^('+[...m].map(c=>SUP[c]).join('')+')');
  s=s.replace(/½/g,'(1/2)').replace(/⅓/g,'(1/3)').replace(/¼/g,'(1/4)').replace(/¾/g,'(3/4)').replace(/⅔/g,'(2/3)');
  return s;
}
const FN={sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,arcsin:Math.asin,arccos:Math.acos,arctan:Math.atan,
  sec:x=>1/Math.cos(x),csc:x=>1/Math.sin(x),cot:x=>1/Math.tan(x),sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh,
  sqrt:Math.sqrt,cbrt:Math.cbrt,ln:Math.log,log:Math.log10,exp:Math.exp,abs:Math.abs,floor:Math.floor,ceil:Math.ceil,round:Math.round,sign:Math.sign};
function gamma(z){ if(z<0.5) return Math.PI/(Math.sin(Math.PI*z)*gamma(1-z)); z-=1; const g=7,c=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7]; let x=c[0]; for(let i=1;i<g+2;i++) x+=c[i]/(z+i); const t=z+g+0.5; return Math.sqrt(2*Math.PI)*Math.pow(t,z+0.5)*Math.exp(-t)*x; }
const fact=v=>gamma(v+1);
const PARAMS=['a','b','c','k'];
function tokenize(s){
  const t=[]; let i=0;
  while(i<s.length){ const ch=s[i];
    if(/\s/.test(ch)){i++;continue;}
    if(/[0-9.]/.test(ch)){ let j=i; while(j<s.length&&/[0-9.]/.test(s[j])) j++; t.push({k:'num',v:parseFloat(s.slice(i,j))}); i=j; continue; }
    if(/[a-zA-Z]/.test(ch)){ let j=i; while(j<s.length&&/[a-zA-Z]/.test(s[j])) j++; let w=s.slice(i,j); i=j;
      // split runs like "xsin" or "2pix": greedy longest known word, else single letters
      while(w.length){ let m=null; for(const name of [...Object.keys(FN),'pi','e','x','n','t'].concat(PARAMS).sort((p,q)=>q.length-p.length)){ if(w.startsWith(name)){ m=name; break; } }
        if(!m) throw new Error('unknown name “'+w+'”'); t.push({k:FN[m]?'fn':'id',v:m}); w=w.slice(m.length); }
      continue; }
    if('+-*/^()!|,'.includes(ch)){ t.push({k:'op',v:ch}); i++; continue; }
    throw new Error('unexpected “'+ch+'”');
  }
  return t;
}
function parse(src){
  const toks=tokenize(normalize(src)); let p=0; const used=new Set();
  const peek=()=>toks[p], next=()=>toks[p++];
  const isOp=(v)=>peek()&&peek().k==='op'&&peek().v===v;
  const startsPrimary=()=>{ const q=peek(); return q && (q.k==='num'||q.k==='id'||q.k==='fn'||(q.k==='op'&&(q.v==='('||q.v==='|'))); };
  function expr(){ let a=term(); while(isOp('+')||isOp('-')){ const o=next().v, b=term(), A=a; a= o==='+'? (e=>A(e)+b(e)) : (e=>A(e)-b(e)); } return a; }
  function term(){ let a=unary(); for(;;){ if(isOp('*')||isOp('/')){ const o=next().v, b=unary(), A=a; a= o==='*'?(e=>A(e)*b(e)):(e=>A(e)/b(e)); }
      else if(startsPrimary() && !(peek().k==='op'&&peek().v==='|'&&absDepth>0)){ const b=unary(), A=a; a=e=>A(e)*b(e); } else break; } return a; }
  function unary(){ if(isOp('-')){ next(); const a=unary(); return e=>-a(e); } if(isOp('+')){ next(); return unary(); } return power(); }
  function power(){ const b=postfix(); if(isOp('^')){ next(); const ex=unary(); return e=>Math.pow(b(e),ex(e)); } return b; }
  function postfix(){ let a=primary(); while(isOp('!')){ next(); const A=a; a=e=>fact(A(e)); } return a; }
  let absDepth=0;
  function primary(){ const q=next(); if(!q) throw new Error('the expression ends too soon');
    if(q.k==='num'){ const v=q.v; return ()=>v; }
    if(q.k==='op'&&q.v==='('){ const a=expr(); if(!isOp(')')) throw new Error('a “(” is never closed'); next(); return a; }
    if(q.k==='op'&&q.v==='|'){ absDepth++; const a=expr(); absDepth--; if(!isOp('|')) throw new Error('a “|” is never closed'); next(); return e=>Math.abs(a(e)); }
    if(q.k==='fn'){ const f=FN[q.v]; let arg;
      if(isOp('(')){ next(); arg=expr(); if(!isOp(')')) throw new Error('a “(” is never closed'); next(); }
      else arg=power();  // ln x, sin 2x reads as sin(2)·x? no: sin takes the next power term
      let fn=e=>f(arg(e));
      if(isOp('^')){ next(); const ex=unary(), F=fn; fn=e=>Math.pow(F(e),ex(e)); }   // sin^2(x) written sin(x)^2
      return fn; }
    if(q.k==='id'){ const n=q.v;
      if(n==='x'||n==='n'||n==='t') return e=>e.x;
      if(n==='pi') return ()=>Math.PI;
      if(n==='e') return ()=>Math.E;
      used.add(n); return e=>e[n]; }
    throw new Error('unexpected “'+q.v+'”');
  }
  const f=expr(); if(p<toks.length) throw new Error('unexpected “'+(toks[p].v)+'”');
  return {f,params:[...used]};
}

function MathGraph(host,opts){
  opts=Object.assign({lines:3,height:320,seed:['x^2','',''],key:'graph'},opts||{});
  const col=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim()||'#888';
  const COLORS=['--ember','--teal','--gold'];
  host.classList.add('mgraph');
  host.innerHTML=`<div class="mg-rows"></div><div class="mg-params"></div>
   <div class="mg-wrap"><canvas class="mg-c"></canvas></div>
   <div class="mg-bar"><span class="mg-read">touch or hover the graph to trace</span>
   <span class="mg-btns"><label class="mg-ck"><input type="checkbox" class="mg-slope"> slope curve</label><button class="mg-in" aria-label="zoom in">＋</button><button class="mg-out" aria-label="zoom out">－</button><button class="mg-home">reset view</button></span></div>`;
  const rows=host.querySelector('.mg-rows'), pbox=host.querySelector('.mg-params'), cv=host.querySelector('.mg-c'), read=host.querySelector('.mg-read');
  let st={}; try{ st=JSON.parse(LS.getItem('mg:'+opts.key)||'{}'); }catch(e){}
  const save=()=>{ try{ LS.setItem('mg:'+opts.key,JSON.stringify(st)); }catch(e){} };
  st.src=st.src||opts.seed.slice(); st.p=st.p||{a:1,b:1,c:0,k:1}; st.view=st.view||{cx:0,cy:0,s:40};
  const fns=[null,null,null], inputs=[];
  for(let i=0;i<opts.lines;i++){
    const r=document.createElement('div'); r.className='mg-row';
    r.innerHTML=`<span class="mg-sw" style="background:var(${COLORS[i]})"></span><span class="mg-y">y =</span><input class="mg-in-${i}" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="${i===0?'x^2':i===1?'2sin(x)':'(1+1/x)^x'}"><span class="mg-err"></span>`;
    rows.appendChild(r); const inp=r.querySelector('input'); inp.value=st.src[i]||''; inputs.push(inp);
    inp.addEventListener('input',()=>{ st.src[i]=inp.value; save(); compile(); draw(); });
  }
  function compile(){
    const need=new Set();
    inputs.forEach((inp,i)=>{ const err=inp.parentElement.querySelector('.mg-err'); err.textContent=''; fns[i]=null;
      if(!inp.value.trim()) return;
      try{ const r=parse(inp.value); fns[i]=r.f; r.params.forEach(p=>need.add(p)); }catch(e){ err.textContent=e.message; } });
    pbox.innerHTML='';
    [...need].sort().forEach(p=>{ const l=document.createElement('label'); l.className='mg-p';
      l.innerHTML=`<span>${p}</span><input type="range" min="-5" max="5" step="0.1" value="${st.p[p]??1}"><output>${(+(st.p[p]??1)).toFixed(1)}</output>`;
      const r=l.querySelector('input'), o=l.querySelector('output'); r.oninput=()=>{ st.p[p]=+r.value; o.textContent=(+r.value).toFixed(1); save(); draw(); }; pbox.appendChild(l); });
  }
  let W=0,H=0,dpr=1;
  function size(){ dpr=window.devicePixelRatio||1; W=cv.clientWidth; H=opts.height; cv.style.height=H+'px'; cv.width=W*dpr; cv.height=H*dpr; }
  const X=x=>W/2+(x-st.view.cx)*st.view.s, Y=y=>H/2-(y-st.view.cy)*st.view.s, IX=px=>st.view.cx+(px-W/2)/st.view.s, IY=py=>st.view.cy-(py-H/2)/st.view.s;
  function niceStep(){ const raw=70/st.view.s, p=Math.pow(10,Math.floor(Math.log10(raw))), m=raw/p; return (m<=1?1:m<=2?2:m<=5?5:10)*p; }
  function env(x){ return Object.assign({x},st.p); }
  let trace=null;
  function draw(){
    if(!W) size(); const c=cv.getContext('2d'); c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,W,H);
    c.fillStyle=col('--card'); c.fillRect(0,0,W,H);
    const step=niceStep(); c.lineWidth=1; c.font='11px IBM Plex Mono, monospace'; c.fillStyle=col('--muted');
    c.strokeStyle=col('--grid'); c.beginPath();
    for(let gx=Math.ceil(IX(0)/step)*step; gx<=IX(W); gx+=step){ c.moveTo(X(gx),0); c.lineTo(X(gx),H); }
    for(let gy=Math.ceil(IY(H)/step)*step; gy<=IY(0); gy+=step){ c.moveTo(0,Y(gy)); c.lineTo(W,Y(gy)); }
    c.stroke();
    c.strokeStyle=col('--muted'); c.lineWidth=1.3; c.beginPath(); c.moveTo(0,Y(0)); c.lineTo(W,Y(0)); c.moveTo(X(0),0); c.lineTo(X(0),H); c.stroke();
    const fmt=v=>{ const r=Math.round(v/step)*step; return Math.abs(r)<1e-9?'0':(+r.toPrecision(6)).toString(); };
    c.textAlign='center'; const ly=Math.min(H-4,Math.max(12,Y(0)+13));
    for(let gx=Math.ceil(IX(0)/step)*step; gx<=IX(W); gx+=step){ if(Math.abs(gx)<step/2) continue; c.fillText(fmt(gx),X(gx),ly); }
    c.textAlign='left'; const lx=Math.min(W-40,Math.max(4,X(0)+5));
    for(let gy=Math.ceil(IY(H)/step)*step; gy<=IY(0); gy+=step){ if(Math.abs(gy)<step/2) continue; c.fillText(fmt(gy),lx,Y(gy)-3); }
    const slope=host.querySelector('.mg-slope').checked;
    fns.forEach((f,i)=>{ if(!f) return;
      const plot=(g,dash)=>{ c.strokeStyle=col(COLORS[i]); c.lineWidth=dash?1.6:2.6; c.setLineDash(dash?[5,4]:[]); c.beginPath(); let pen=false, py=null;
        for(let px=0; px<=W; px+=1){ const x=IX(px); let y; try{ y=g(x); }catch(e){ y=NaN; }
          const sy=Y(y); if(!isFinite(y)||Math.abs(sy)>H*20){ pen=false; py=null; continue; }
          if(pen && py!==null && Math.abs(sy-py)>H*1.5){ pen=false; }
          if(!pen){ c.moveTo(px,sy); pen=true; } else c.lineTo(px,sy); py=sy; }
        c.stroke(); c.setLineDash([]); };
      plot(x=>f(env(x)),false);
      if(slope){ const h=1e-4; plot(x=>(f(env(x+h))-f(env(x-h)))/(2*h),true); }
    });
    if(trace!==null){ const x=IX(trace); c.strokeStyle=col('--muted'); c.setLineDash([3,3]); c.beginPath(); c.moveTo(trace,0); c.lineTo(trace,H); c.stroke(); c.setLineDash([]);
      const parts=['x = '+(+x.toFixed(3))];
      fns.forEach((f,i)=>{ if(!f) return; const y=f(env(x)); if(!isFinite(y)) { parts.push('—'); return; }
        c.fillStyle=col(COLORS[i]); c.beginPath(); c.arc(trace,Y(y),5,0,7); c.fill();
        const h=1e-4, d=(f(env(x+h))-f(env(x-h)))/(2*h);
        // tangent
        c.strokeStyle=col(COLORS[i]); c.globalAlpha=.55; c.lineWidth=1.4; c.beginPath(); const dx=60/st.view.s; c.moveTo(X(x-dx),Y(y-d*dx)); c.lineTo(X(x+dx),Y(y+d*dx)); c.stroke(); c.globalAlpha=1;
        parts.push(['ember','teal','gold'][i]+': y = '+(+y.toFixed(4))+', slope '+(isFinite(d)?(+d.toFixed(4)):'—')); });
      read.textContent=parts.join(';  ');
    }
  }
  // interaction
  let drag=null, pinch=null;
  const pos=e=>{ const r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
  cv.addEventListener('pointerdown',e=>{ cv.setPointerCapture(e.pointerId); drag={p:pos(e),cx:st.view.cx,cy:st.view.cy,moved:false,id:e.pointerId}; });
  cv.addEventListener('pointermove',e=>{ const p=pos(e); trace=p.x;
    if(drag&&drag.id===e.pointerId&&!pinch){ const dx=p.x-drag.p.x, dy=p.y-drag.p.y; if(Math.abs(dx)+Math.abs(dy)>4) drag.moved=true;
      if(drag.moved){ st.view.cx=drag.cx-dx/st.view.s; st.view.cy=drag.cy+dy/st.view.s; } }
    draw(); });
  cv.addEventListener('pointerup',()=>{ drag=null; save(); });
  cv.addEventListener('pointerleave',e=>{ if(e.pointerType==='mouse'){ trace=null; draw(); } });
  cv.addEventListener('wheel',e=>{ e.preventDefault(); const p=pos(e), x0=IX(p.x), y0=IY(p.y); const f=Math.exp(-e.deltaY*0.0015); zoomAt(x0,y0,p,f); },{passive:false});
  function zoomAt(x0,y0,p,f){ st.view.s=Math.min(5000,Math.max(0.5,st.view.s*f)); st.view.cx=x0-(p.x-W/2)/st.view.s; st.view.cy=y0+(p.y-H/2)/st.view.s; save(); draw(); }
  cv.addEventListener('touchstart',e=>{ if(e.touches.length===2){ const [a,b]=e.touches; pinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),s:st.view.s}; } },{passive:true});
  cv.addEventListener('touchmove',e=>{ if(pinch&&e.touches.length===2){ e.preventDefault(); const [a,b]=e.touches, d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY); const r=cv.getBoundingClientRect(); const p={x:(a.clientX+b.clientX)/2-r.left,y:(a.clientY+b.clientY)/2-r.top}; const x0=IX(p.x),y0=IY(p.y); st.view.s=pinch.s; zoomAt(x0,y0,p,d/pinch.d); } },{passive:false});
  cv.addEventListener('touchend',()=>{ pinch=null; });
  host.querySelector('.mg-in').onclick=()=>zoomAt(st.view.cx,st.view.cy,{x:W/2,y:H/2},1.5);
  host.querySelector('.mg-out').onclick=()=>zoomAt(st.view.cx,st.view.cy,{x:W/2,y:H/2},1/1.5);
  host.querySelector('.mg-home').onclick=()=>{ st.view={cx:0,cy:0,s:40}; save(); draw(); };
  host.querySelector('.mg-slope').onchange=draw;
  new ResizeObserver(()=>{ size(); draw(); }).observe(cv);
  compile(); size(); draw();
  return { set(i,src){ inputs[i].value=src; st.src[i]=src; save(); compile(); draw(); }, redraw(){ size(); draw(); } };
}
window.MathGraph=MathGraph; window.MathGraph.parse=parse;
})();

/* ---- desk controller ---- */
window.__deskInit=function(){
  const btn=document.getElementById('deskbtn'), desk=document.getElementById('desk');
  const K='desk:'+(document.title||'');
  let st={}; try{ st=JSON.parse(LS.getItem(K)||'{}'); }catch(e){}
  const save=()=>{ try{ LS.setItem(K,JSON.stringify(st)); }catch(e){} };
  let bookDone=false;
  function renderBook(){ if(bookDone) return; const tpl=document.getElementById('dbooktpl'); if(!tpl) return; const b=document.getElementById('dbook'); b.appendChild(tpl.content.cloneNode(true));
    if(window.katex) b.querySelectorAll('.bm').forEach(el=>{ try{ katex.render(el.dataset.t,el,{throwOnError:false,strict:false,trust:true,displayMode:el.classList.contains('bd')}); }catch(e){} });
    bookDone=true; const p=document.getElementById('dp-book'); if(st.bookTop) setTimeout(()=>p.scrollTop=st.bookTop,30);
    p.addEventListener('scroll',()=>{ st.bookTop=p.scrollTop; clearTimeout(save.t); save.t=setTimeout(save,300); }); }
  const origQ=t=>[...document.querySelectorAll('.qid,.id')].find(o=>!o.closest('#desk')&&o.textContent.trim()===t);
  function syncQs(){ document.querySelectorAll('#dq .qid,#dq .id').forEach(el=>{ const o=origQ(el.textContent.trim()); if(o) el.classList.toggle('done',o.classList.contains('done')); }); }
  function fillQs(){ const q=document.getElementById('dq'); if(q.dataset.done){ syncQs(); return; } const stq=[...document.querySelectorAll('section.step:not([hidden]) .sayback ol')]; const src=stq.length?null:document.querySelector('.sayback ol, #qs ol, section.sayback'); if(stq.length){ stq.forEach(o=>{ const c=o.cloneNode(true); c.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id')); q.appendChild(c); }); } if(src){ const c=src.cloneNode(true); c.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id')); q.appendChild(c);
    q.querySelectorAll('.qid,.id').forEach(el=>{ el.style.cursor='pointer'; el.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); const o=origQ(el.textContent.trim()); if(o&&o.__tick){ o.__tick(); el.classList.toggle('done',o.classList.contains('done')); } }); }); }
    q.dataset.done=1; syncQs(); }
  function show(p){ desk.querySelectorAll('.dtabs [data-p]').forEach(b=>b.classList.toggle('on',b.dataset.p===p)); desk.querySelectorAll('.dpane').forEach(d=>d.classList.toggle('on',d.id==='dp-'+p)); if(p==='book') renderBook(); if(p==='qs') fillQs(); if(p==='moves') fillMoves(); if(p==='graph') initGraph(); if(p==='rand') loadRand(); else if(window.MathKeys) MathKeys.limit(null); st.tab=p; save(); }
  function loadRand(){ if(window.LadderRandomizer){ const bx=desk.querySelector('#dp-rand .rzbox'); if(bx) LadderRandomizer.render(bx); return; } const s=document.createElement('script'); s.src='randomizer.js'; document.head.appendChild(s); }
  function open(v){ if(!v&&window.MathKeys) MathKeys.limit(null); desk.classList.toggle('open',v); document.body.classList.toggle('deskopen',v); btn.textContent=v?'✕ desk':'☰ desk'; st.open=v; save(); if(v) show(st.tab&&desk.querySelector('.dtabs [data-p="'+st.tab+'"]')?st.tab:desk.querySelector('.dtabs [data-p]').dataset.p); }
  let movesDone=false;
  function fillMoves(){ if(movesDone) return; movesDone=true; const box=document.getElementById('dmoves'), note=document.getElementById('dmnote');
    const page=ladderPage();
    const draw=()=>{ const M=window.LADDER_MOVES; if(!M){ box.textContent=''; return; } const ids=M.apply[page];
      if(page==='index'){ note.textContent='Every tech you have earned, in ladder order, with its line in symbols.'; return; }
      /* the axioms earned so far always show, after the page's own techs: every axiom the main ladder has laid down at or before this page (0.0.449) */
      const ord=M.order||[], at=ord.indexOf(page), MAIN=/^r\d\d[a-z]?$/;
      const own=new Set(ids||[]);
      const ax=at<0?[]:M.moves.map((m,i)=>[m,i]).filter(([m,i])=>m.kind==='axiom'&&/axiom|principle|line$/.test(m.name)&&MAIN.test(m.file)&&ord.indexOf(m.file)<=at&&!own.has(i));
      if((!ids||!ids.length)&&!ax.length){ note.textContent='This page builds and uses no named tech. The whole catalogue of what you have earned is a tap away.'; return; }
      if(!ids||!ids.length) note.textContent='This step builds and uses no named tech of its own. Below are the axioms you have earned so far, which every step stands on.';
      const card=m=>'<div class="dmv'+(m.file===page?' here':'')+'"><b>'+m.name+(m.accepted?' <span class="acc">('+m.accepted+')</span>':'')+'</b> <span class="kd">'+m.kind+(m.file===page?' · built here':' · '+m.tag)+'</span>'+(m.tex?'<div class="mt" data-t="'+m.tex.replace(/"/g,'&quot;')+'"></div>':'')+'<div class="mw">'+m.words+'</div>'+(m.pid?'<a class="mwhere" href="'+(m.file===page?'':m.file+'.html')+'#'+m.pid+'">'+(m.file===page?'where it is built, on this page':'where it is built')+' →</a>':'')+'</div>';
      box.innerHTML=(ids||[]).map(i=>card(M.moves[i])).join('')+(ax.length?'<h4 class="dax">The axioms earned so far</h4>'+ax.map(([m])=>card(m)).join(''):'');
      if(false) box.innerHTML=ids.map(i=>M.moves[i]).map(m=>'<div class="dmv'+(m.file===page?' here':'')+'"><b>'+m.name+(m.accepted?' <span class="acc">('+m.accepted+')</span>':'')+'</b> <span class="kd">'+m.kind+(m.file===page?' · built here':' · '+m.tag)+'</span>'+(m.tex?'<div class="mt" data-t="'+m.tex.replace(/"/g,'&quot;')+'"></div>':'')+'<div class="mw">'+m.words+'</div></div>').join('');
      if(window.katex) box.querySelectorAll('.mt').forEach(el=>{ try{ katex.render(el.dataset.t,el,{throwOnError:false,strict:false,trust:true,displayMode:false}); }catch(e){ el.textContent=el.dataset.t; } }); };
    if(window.LADDER_MOVES) draw(); else { const s=document.createElement('script'); s.src='moves-data.js'; s.onload=draw; s.onerror=()=>{ box.textContent='The moves could not load.'; }; document.head.appendChild(s); } }
  btn.onclick=()=>open(!desk.classList.contains('open'));
  /* a tech cited in a lesson (a.techref, data-tech = the move's name) opens the tray on that tech's card instead of leaving the page;
     the card's own link goes on to the paragraph that built it. If the page's Reference has no such card, follow the link (0.1.18) */
  document.addEventListener('click',e=>{ const a=e.target.closest&&e.target.closest('a.techref'); if(!a||!a.dataset.tech) return;
    e.preventDefault(); open(true); show('moves'); const want=a.dataset.tech.trim().toLowerCase(); let tries=0;
    const go=()=>{ const c=[...document.querySelectorAll('#dmoves .dmv')].find(d=>{ const b=d.querySelector('b'); return b&&b.textContent.trim().toLowerCase().startsWith(want); });
      if(c){ document.querySelectorAll('#dmoves .dmv.hit').forEach(x=>x.classList.remove('hit')); c.classList.add('hit'); c.scrollIntoView({block:'center'}); setTimeout(()=>c.classList.remove('hit'),4000); }
      else if(window.LADDER_MOVES||tries>12){ location.href=a.href; } else { tries++; setTimeout(go,250); } };
    setTimeout(go,50); });
  document.addEventListener('click',e=>{ const a=e.target.closest&&e.target.closest('#dmoves a.mwhere'); if(a&&a.getAttribute('href').startsWith('#')) open(false); });
  desk.querySelector('.x').onclick=()=>open(false);
  const dkb=desk.querySelector('.dkeys'); if(dkb) dkb.onclick=()=>{ const b=document.querySelector('#mk-tray .mk-btn'); if(b) b.click(); };
  desk.querySelectorAll('.dtabs [data-p]').forEach(b=>b.onclick=()=>show(b.dataset.p));
  const rx=desk.querySelector('.recx'), ri=desk.querySelector('.reci'), rn=desk.querySelector('#recnote');
  if(rx) rx.onclick=()=>LadderRecord.export();
  if(ri) ri.onchange=()=>{ const f=ri.files[0]; if(!f) return; f.text().then(t=>{ const o=JSON.parse(t);
    if(!confirm('Replace the record on this device with the one in this file?')) return;
    LadderRecord.import(o); rn.textContent='Record opened. Reloading…'; setTimeout(()=>location.reload(),400); }).catch(()=>{ rn.textContent='That file is not a ladder record.'; }); };
  let G=null; function initGraph(){ if(G){ G.redraw(); return; } if(window.MathGraph) G=MathGraph(document.getElementById('dmg'),{key:'desk',height:280}); }
  if(st.open) open(true);
};
/* inject the desk now (before tray.js looks for it) */
if(!document.getElementById('desk')){ Rung._desk(); window.__deskInit(); }

/* ---- the page's wrapper: tag-first titles, prev / return / next buttons top and bottom,
   paragraph addresses with their four buttons, and the non-skid key on the ladder ---- */
(function(){
'use strict';
const ready=f=>{ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',f); else f(); };
const KIND={theory:'Theory',proof:'Proof',support:'Support',technique:'Technique','call back':'Call back',physics:'Physics',applied:'Applied',chemistry:'Chemistry',biology:'Biology',computing:'Computing',newsflash:'Newsflash',statistics:'Statistics',floor:'Floor',exam:'Exam',test:'Test',quiz:'Quiz',conclusion:'Conclusion'};
function tagInfo(){
  const t=document.querySelector('header.top .tags .tag'); if(!t) return null;
  const txt=t.textContent.trim(), i=txt.indexOf(' · ');
  const label=(i<0?txt:txt.slice(0,i)).replace(/^Rung\s+/,'').replace(/^Floor\s+/,'F');
  let kind=(i<0?'':txt.slice(i+3)).trim().replace(/ to .*$/,'');
  return {label,kind:KIND[kind]||(kind?kind[0].toUpperCase()+kind.slice(1):'')};
}
function titles(info){
  const h=document.querySelector('header.top h1'); if(!h||!info.kind||h.querySelector('.h1tag')) return;
  const s=document.createElement('span'); s.className='h1tag'; s.textContent=info.kind; h.prepend(s);
}
function pn(){
  const bottom=document.querySelector('nav.nextrung'); if(!bottom) return;
  const as=[...bottom.querySelectorAll('a')];
  const prev=as.find(a=>/←/.test(a.textContent)&&!/index\.html$/.test(a.getAttribute('href')||''));
  const next=as.find(a=>/→/.test(a.textContent));
  const clean=t=>t.replace(/[←→]/g,'').replace(/^\s*next:\s*/,'').trim();
  const cards=!!document.querySelector('.qid');
  const mk=foot=>{ const n=document.createElement('div'); n.className='pn';
    const b=(a,cls,k)=>a?'<a class="pnb '+cls+'" href="'+a.getAttribute('href')+'"><span class="pk">'+k+'</span><span class="pl">'+clean(a.textContent)+'</span></a>':'<span class="pnb '+cls+' none"></span>';
    const home='<a class="pnb home" href="index.html"><span class="pk">return to</span><span class="pl">the ladder</span></a>';
    /* the step's flash cards: at the foot only, between previous and next, below the questions and above the basement */
    const mid=foot&&cards?'<div class="pnmid">'+home+'<button type="button" class="pnb cards"><span class="pk">study</span><span class="pl">flash cards</span></button></div>':home;
    n.innerHTML=b(prev,'prev','← previous')+mid+b(next,'next','next →');
    const c=n.querySelector('.cards'); if(c) c.addEventListener('click',()=>{ if(window.LadderCards) LadderCards.open(); else toast('flash cards are loading'); });
    return n; };
  bottom.innerHTML=''; bottom.appendChild(mk(true)); bottom.classList.add('pnwrap');
  const top=document.querySelector('header.top p.home');
  if(top){ const n=mk(); n.classList.add('pntop'); top.replaceWith(n); }
}
let menu=null, cur=null;
function toast(msg){ let t=document.getElementById('patoast'); if(!t){ t=document.createElement('div'); t.id='patoast'; t.setAttribute('role','status'); document.body.appendChild(t); }
  t.textContent=msg; t.classList.add('on'); clearTimeout(toast.h); toast.h=setTimeout(()=>t.classList.remove('on'),Math.max(2200,msg.length*70)); }
const copy=s=>{ try{ navigator.clipboard.writeText(s).then(()=>{},()=>{}); }catch(e){} };
function addresses(info){
  const ps=[...document.querySelectorAll('header.top > p[data-pid], section.class p[data-pid]')]; if(!ps.length) return;
  const per={};
  ps.forEach((p,i)=>{ const top=!!p.closest('header.top'), st=p.closest('section.step'), k=top?info.label+'.top':(st?st.dataset.step:info.label); per[k]=(per[k]||0)+1; const ad=top?k+'.'+per[k]:k+'.0.'+per[k]; p.dataset.addr=ad; p.id=p.id||'p-'+p.dataset.pid;
    const b=document.createElement('button'); b.type='button'; b.className='pa'; b.textContent=ad; b.setAttribute('aria-label','paragraph '+ad+': prompt, report or leave a note');
    b.addEventListener('click',e=>{ e.stopPropagation(); openMenu(p,b); }); p.appendChild(document.createTextNode(' ')); p.appendChild(b); });
  menu=document.createElement('div'); menu.className='pamenu'; menu.hidden=true;
  menu.innerHTML='<button type="button" data-a="prompt">prompt from</button><button type="button" data-a="report">report</button><button type="button" data-a="note">leave a note</button>';
  document.body.appendChild(menu);
  menu.addEventListener('click',e=>{ const a=e.target.dataset.a; if(!a||!cur) return; const ad=cur.dataset.addr;
    const text=[...cur.childNodes].filter(n=>!(n.classList&&n.classList.contains('pa'))).map(n=>n.textContent).join('').trim();
    if(a==='prompt'){ copy('About paragraph '+ad+' of the ladder, which reads: “'+text+'”\n\n'); toast('paragraph '+ad+' and its words are copied: paste them to your assistant and ask'); }
    if(a==='edit'){ menu.hidden=true; startEdit(cur); return; }
    if(a==='note'){ menu.hidden=true; noteEdit(cur); return; }
    if(a==='report'){ menu.hidden=true; report({kind:'paragraph',where:ad,pid:cur.dataset.pid,text}); return; }
    menu.hidden=true; });
  document.addEventListener('click',e=>{ if(menu&&!menu.hidden&&!menu.contains(e.target)) menu.hidden=true; });
  ps.forEach(noteShow);
}

/* Learner notes (Andrew, 2026-10-31): a private note on any paragraph. It lives in the learner's record on
   this device (notes, one object per page, keyed by paragraph pid), travels with the saved copy, and is never sent. */
const NPG=ladderPage();
function noteAll(){ try{ return JSON.parse(LS.getItem('note:'+NPG)||'{}')||{}; }catch(e){ return {}; } }
function notePut(pid,text){ const o=noteAll(); if(text) o[pid]={text,at:Date.now()}; else delete o[pid];
  if(Object.keys(o).length) LS.setItem('note:'+NPG,JSON.stringify(o)); else LS.removeItem('note:'+NPG); }
function noteBox(p){ const n=p.nextElementSibling; return n&&n.classList.contains('lnote')?n:null; }
function noteShow(p){ let box=noteBox(p); const n=noteAll()[p.dataset.pid];
  if(!n){ if(box) box.remove(); return; }
  if(!box){ box=document.createElement('div'); box.className='lnote'; p.after(box); }
  box.innerHTML='<span class="lk">my note</span><div class="lt"></div><button type="button" class="le">change</button>';
  box.querySelector('.lt').textContent=n.text; box.querySelector('.le').onclick=()=>noteEdit(p); }
function noteEdit(p){ const old=noteBox(p); if(old) old.remove(); const n=noteAll()[p.dataset.pid];
  const box=document.createElement('div'); box.className='lnote editing';
  box.innerHTML='<span class="lk">my note · only on this device</span><textarea rows="3" placeholder="what you want to remember about this paragraph"></textarea><div class="lb"><button type="button" data-n="save">save</button>'+(n?'<button type="button" data-n="del">delete</button>':'')+'<button type="button" data-n="cancel">cancel</button></div>';
  p.after(box); const ta=box.querySelector('textarea'); ta.value=n?n.text:''; ta.focus();
  box.querySelector('.lb').addEventListener('click',e=>{ const k=e.target.dataset.n; if(!k) return;
    if(k==='save'){ notePut(p.dataset.pid,ta.value.trim()); toast(ta.value.trim()?'note saved on this device':'note removed'); }
    if(k==='del'){ notePut(p.dataset.pid,''); toast('note removed'); }
    box.remove(); noteShow(p); }); }

/* Reports (Andrew, 2026-10-31): a report opens an email to the author, titled "LADDER REPORT (subject)",
   with where it was sent from (page, paragraph or question) above the learner's words. A copy stays on this device. */
const REPORT_TO='ajkowalski89@gmail.com';
let repBox=null, repMeta=null;
function report(meta){ repMeta=meta||{kind:'page'};
  if(!repBox){ repBox=document.createElement('div'); repBox.className='repbox'; repBox.hidden=true; repBox.setAttribute('role','dialog'); repBox.setAttribute('aria-label','send a report');
    repBox.innerHTML='<div class="repcard"><h3>Report to the author</h3><p class="repwhere"></p><label>Subject<input type="text" class="repsub" maxlength="120" placeholder="a short title"></label><label>What did you notice?<textarea class="repbody" rows="6" placeholder="a mistake, a confusing line, a question that seems wrong, an idea"></textarea></label><div class="repbtns"><button type="button" class="repsend">open the email</button><button type="button" class="repcancel">cancel</button></div><p class="repnote">This opens your email app with the report filled in. Nothing is sent until you press send there. With no connection, most email apps keep it in the outbox and send it later.</p></div>';
    document.body.appendChild(repBox);
    repBox.querySelector('.repcancel').onclick=()=>{ repBox.hidden=true; };
    repBox.addEventListener('click',e=>{ if(e.target===repBox) repBox.hidden=true; });
    repBox.querySelector('.repsend').onclick=()=>{ const m=repMeta, sub=repBox.querySelector('.repsub').value.trim()||'no subject', body=repBox.querySelector('.repbody').value.trim();
      const page=ladderPage()+'.html';
      const tag=(document.querySelector('header.top .tags .tag')||{}).textContent||'';
      const meta=['page: '+page+(tag?' ('+tag.trim()+')':''),'where: '+(m.kind==='page'?'the page as a whole':m.kind+' '+m.where)+(m.pid?' · pid '+m.pid:''),(m.text?'it reads: '+m.text.slice(0,300)+(m.text.length>300?'…':''):''),'sent: '+new Date().toISOString(),'screen: '+window.innerWidth+'×'+window.innerHeight].filter(Boolean).join('\n');
      const mail='mailto:'+REPORT_TO+'?subject='+encodeURIComponent('LADDER REPORT ('+sub+')')+'&body='+encodeURIComponent(meta+'\n\n---\n'+body+'\n');
      try{ const r=JSON.parse(LS.getItem('ladder:reports')||'[]'); r.push({page,where:m.where||'',pid:m.pid||'',sub,body,t:Date.now()}); LS.setItem('ladder:reports',JSON.stringify(r)); }catch(err){}
      repBox.hidden=true; repBox.querySelector('.repsub').value=''; repBox.querySelector('.repbody').value='';
      location.href=mail; toast('your email app should open with the report'); }; }
  repBox.querySelector('.repwhere').textContent='From '+(repMeta.kind==='page'?'this page':repMeta.kind==='laundry'?'this laundry question (its seed.link travels with the report)':repMeta.kind+' '+repMeta.where)+'.';
  repBox.hidden=false; setTimeout(()=>repBox.querySelector('.repsub').focus(),30); }
window.__report=report;
/* A question's label is its address (Andrew, 2026-10-31): tapping it opens tick, prompt, copy and report,
   the same way a paragraph's number does. The bar keeps no report button except on the about page. */
let qmenu=null;
function qMenu(q,tick,on){
  if(!qmenu){ qmenu=document.createElement('div'); qmenu.className='pamenu qmenu'; qmenu.hidden=true; document.body.appendChild(qmenu);
    document.addEventListener('click',e=>{ if(!qmenu.hidden&&!qmenu.contains(e.target)) qmenu.hidden=true; }); }
  const ad=q.textContent.replace(/\s*✓\s*$/,'').trim(), li=q.closest('li');
  const text=li?li.textContent.replace(ad,'').trim():'';
  qmenu.innerHTML=(tick?'<button type="button" data-a="tick">'+(on?'take off the ✓':'tick ✓')+'</button>':'')+'<button type="button" data-a="prompt">prompt from</button><button type="button" data-a="report">report</button>';
  qmenu.onclick=e=>{ const a=e.target.dataset.a; if(!a) return; qmenu.hidden=true;
    if(a==='tick') tick();
    if(a==='prompt'){ copy('About question '+ad+' of the ladder, which asks: “'+text+'”\n\n'); toast('question '+ad+' and its words are copied: paste them to your assistant and ask'); }
    if(a==='report') report({kind:'question',where:ad,text}); };
  const r=q.getBoundingClientRect(); qmenu.hidden=false; const w=qmenu.offsetWidth||220;
  qmenu.style.left=Math.max(8,Math.min(window.innerWidth-w-8,r.left))+'px'; qmenu.style.top=(r.bottom+window.scrollY+6)+'px'; }
window.__qMenu=qMenu;
function reportQuestions(){}

/* Paragraph edits: the artifact's owner can rewrite a prose paragraph in place. The edit is kept in
   the site's database, edits/<pid> {pid, page, html, at}, shown to every reader at once, and folded
   into the page's source at the next publish. Paragraphs with typeset maths are left alone. */
const ED={db:null,owner:false,page:ladderPage()};
function edWait(){ return Promise.resolve(false); return new Promise(res=>{ let n=0; (function t(){ if(window.claude&&typeof window.claude.use==='function') return res(true); if(++n>40) return res(false); setTimeout(t,250); })(); }); }
function editable(p){ return !p.querySelector('[data-tex],[data-tex-inline],.katex,code'); }
const ED_OK={B:1,STRONG:1,I:1,EM:1,A:1,SUP:1,SUB:1,BR:1};
function edClean(node){ const out=document.createElement('div');
  (function walk(src,dst){ src.childNodes.forEach(n=>{
    if(n.nodeType===3){ dst.appendChild(document.createTextNode(n.textContent)); return; }
    if(n.nodeType!==1||(n.classList&&n.classList.contains('pa'))||/^(SCRIPT|STYLE|TEMPLATE)$/.test(n.tagName)) return;
    if(ED_OK[n.tagName]){ const e=document.createElement(n.tagName.toLowerCase()); if(n.tagName==='A'){ const h=n.getAttribute('href')||''; if(/^(https?:|[\w.-]+\.html)/.test(h)) e.setAttribute('href',h); } dst.appendChild(e); walk(n,e); }
    else walk(n,dst); }); })(node,out);
  return out.innerHTML.replace(/\s+/g,' ').trim(); }
function edApply(p,html){ const b=p.querySelector('button.pa'); const tmp=document.createElement('div'); tmp.innerHTML=html;
  p.innerHTML=edClean(tmp); if(b){ p.appendChild(document.createTextNode(' ')); p.appendChild(b); } p.classList.add('pedited'); }
function edClearPending(pid){ try{ const k='ladder:pending-edits', m=JSON.parse(localStorage.getItem(k)||'{}'); delete m[pid]; localStorage.setItem(k,JSON.stringify(m)); }catch(_){} }
async function edFolded(){ const f={}; try{ const s=await ED.db.collection('folded').get(); s.docs.forEach(d=>{ const v=d.data()||{}; f[v.pid||d.id]=v.at||''; }); }catch(_){ return null; } return f; }
/* The owner check runs once at load; if the host was slow to answer then, check again when a menu opens. */
async function edRecheck(){ try{ if(!window.claude||typeof window.claude.use!=='function') return false; if(!ED.db) ED.db=await window.claude.use('db'); if(!ED.db) return false; const u=await window.claude.use('user'); ED.owner=u?!!(await u.isOwner()):false; if(ED.owner) document.body.classList.add('ed-owner'); }catch(e){} return ED.owner; }
async function edInit(){
  if(!document.querySelector('header.top > p[data-pid], section.class p[data-pid]')) return;
  if(!(await edWait())) return;
  let db=null,user=null; try{ db=await window.claude.use('db'); }catch(e){} if(!db) return; ED.db=db;
  try{ user=await window.claude.use('user'); ED.owner=user?!!(await user.isOwner()):false; }catch(e){ ED.owner=false; }
  if(ED.owner) document.body.classList.add('ed-owner');
  const FOLD=await edFolded(), stale=r=>!!FOLD&&!!FOLD[r.pid]&&String(FOLD[r.pid])>=String(r.at||'');
  try{ const snap=await db.collection('edits').where('page','==',ED.page).get();
    snap.docs.forEach(d=>{ const v=d.data()||{}; if(stale({pid:v.pid||d.id,at:v.at})) return; const p=document.querySelector('p[data-pid="'+(v.pid||d.id)+'"]'); if(p&&typeof v.html==='string'&&editable(p)) edApply(p,v.html); }); }catch(e){}
  if(FOLD) try{ const k='ladder:pending-edits', m=JSON.parse(localStorage.getItem(k)||'{}'); let sent=0;
    for(const pid in m){ const r=m[pid]; if(stale(r)){ delete m[pid]; try{ const dm=JSON.parse(localStorage.getItem('ladder:edit-drafts')||'{}'); delete dm[pid]; localStorage.setItem('ladder:edit-drafts',JSON.stringify(dm)); }catch(_){} continue; }
      try{ const w=ED.db.doc('edits/'+pid).set(r); w.then(()=>edClearPending(pid),()=>{}); await Promise.race([w,new Promise((_,rj)=>setTimeout(()=>rj(0),10000))]); delete m[pid]; sent++; try{ const dm=JSON.parse(localStorage.getItem('ladder:edit-drafts')||'{}'); delete dm[pid]; localStorage.setItem('ladder:edit-drafts',JSON.stringify(dm)); }catch(_){} const p=r.page===ED.page&&document.querySelector('p[data-pid="'+pid+'"]'); if(p&&editable(p)) edApply(p,r.html); }catch(_){ } }
    localStorage.setItem(k,JSON.stringify(m)); if(sent) toast(sent+' edit'+(sent>1?'s':'')+' saved that had been waiting on this device'); }catch(_){}
  try{ const m=JSON.parse(localStorage.getItem('ladder:edit-drafts')||'{}'); let n=0;
    for(const pid in m){ const d=m[pid]; if(d.page!==ED.page) continue; if(FOLD[pid]&&Number(new Date(FOLD[pid]))>=Number(d.at||0)) continue; const p=document.querySelector('p[data-pid="'+pid+'"]'); if(!p||!editable(p)) continue;
      startEdit(p); p.innerHTML=d.html; n++; }
    if(n) toast('your unsaved edit'+(n>1?'s are':' is')+' back, still open: press save when ready'); }catch(_){}
}
function startEdit(p){ if(!ED.db||!ED.owner||!editable(p)||p.isContentEditable) return;
  const b=p.querySelector('button.pa'); if(b) b.remove(); const before=p.innerHTML;
  p.contentEditable='true'; p.classList.add('pediting'); p.focus();
  const bar=document.createElement('div'); bar.className='pebar';
  bar.innerHTML='<button type="button" data-e="save">save</button><button type="button" data-e="cancel">cancel</button><span class="pehint">prose only · bold with '+(/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent)?'⌘B':'Ctrl+B')+'</span>';
  p.after(bar);
  const DK='ladder:edit-drafts', dset=v=>{ try{ const m=JSON.parse(localStorage.getItem(DK)||'{}'); if(v==null) delete m[p.dataset.pid]; else m[p.dataset.pid]={page:ED.page,html:v,at:Date.now()}; localStorage.setItem(DK,JSON.stringify(m)); }catch(_){} };
  let dt=0; p.addEventListener('input',()=>{ clearTimeout(dt); dt=setTimeout(()=>dset(p.innerHTML),400); });
  const done0=()=>{ p.contentEditable='false'; p.classList.remove('pediting'); bar.remove(); if(b){ p.appendChild(document.createTextNode(' ')); p.appendChild(b); } };
  const done=()=>{ clearTimeout(dt); dset(null); done0(); };
  bar.addEventListener('click',async e=>{ const k=e.target.dataset.e; if(!k) return;
    if(k==='cancel'){ p.innerHTML=before; done(); return; }
    const html=edClean(p); e.target.disabled=true;
    const rec={pid:p.dataset.pid,page:ED.page,html,at:new Date().toISOString()}; let err=null;
    for(const wait of [0,1500,4000,9000]){ if(wait){ toast('the database is busy; trying again…'); await new Promise(r=>setTimeout(r,wait)); }
      try{ const w=ED.db.doc('edits/'+p.dataset.pid).set(rec); w.then(()=>edClearPending(rec.pid),()=>{}); await Promise.race([w, new Promise((_,rj)=>setTimeout(()=>rj({code:'no answer in 10 seconds'}),10000))]); err=null; break; }catch(x){ err=x; } }
    if(!err){ try{ const k='ladder:pending-edits', m=JSON.parse(localStorage.getItem(k)||'{}'); delete m[p.dataset.pid]; localStorage.setItem(k,JSON.stringify(m)); }catch(_){}
      p.innerHTML=html; p.classList.add('pedited'); done(); toast('saved: every reader sees it now, and it goes into the page at the next publish'); }
    else{ try{ const k='ladder:pending-edits', m=JSON.parse(localStorage.getItem(k)||'{}'); m[p.dataset.pid]=rec; localStorage.setItem(k,JSON.stringify(m)); }catch(_){}
      e.target.disabled=false; toast('not saved yet ('+((err&&err.code)||'the database refused it')+'). Your words are kept on this device and will be sent when the database answers.'); } });
}
function openMenu(p,b){ cur=p; const r=b.getBoundingClientRect(); const eb=menu.querySelector('[data-a=edit]'); if(eb){ eb.hidden=!(ED.owner&&editable(p)); if(!ED.owner&&editable(p)) edRecheck().then(ok=>{ if(ok&&cur===p) eb.hidden=false; }); } menu.hidden=false;
  const w=menu.offsetWidth||220; menu.style.left=Math.max(8,Math.min(window.innerWidth-w-8,r.left+r.width/2-w/2))+'px';
  menu.style.top=(r.bottom+window.scrollY+6)+'px'; }
/* the non-skid key: the annex tags show or hide their annexes; the geometry-transform mark waits for the geometry floor */
const ANNEX=['stat','phys','chem','bio','comp','econ','logi','eng','crypt','nav','now'];
function nonskid(){
  const key=document.querySelector('.ladderkey'), rungs=document.querySelector('.rungs'); if(!key||!rungs) return;
  /* by default every annex but statistics is hidden: the learner finds the rest by being curious (Andrew, 2026-10-31) */
  let hide=ANNEX.filter(k=>k!=='stat'); try{ const v=LS.getItem('ladder:hide'); if(v) hide=JSON.parse(v); }catch(e){}
  const apply=()=>{ ANNEX.concat(['gt']).forEach(k=>rungs.classList.toggle('hide-'+k,hide.includes(k)));
    key.querySelectorAll('[data-k]').forEach(b=>{ const off=hide.includes(b.dataset.k); b.classList.toggle('off',off); b.setAttribute('aria-pressed',String(!off)); });
    try{ LS.setItem('ladder:hide',JSON.stringify(hide)); }catch(e){} };
  key.querySelectorAll('.legend .tag').forEach(t=>{ const k=ANNEX.find(a=>t.classList.contains(a)); if(!k) return;
    const b=document.createElement('button'); b.type='button'; b.className=t.className+' tagbtn'; b.dataset.k=k; b.textContent=t.textContent; b.title='show or hide these annexes';
    b.onclick=()=>{ hide=hide.includes(k)?hide.filter(x=>x!==k):hide.concat([k]); apply(); }; t.replaceWith(b); });
  const gt=key.querySelector('.gtkey');
  if(gt){ let far=-1; try{ far=(JSON.parse(LS.getItem('ladder:stats')||'{}').far); }catch(e){}
    if(!(far>=16)) gt.hidden=true;
    else { const b=gt.querySelector('button'); if(b){ b.dataset.k='gt'; b.onclick=()=>{ hide=hide.includes('gt')?hide.filter(x=>x!=='gt'):hide.concat(['gt']); apply(); }; } } }
  apply();
}
/* every Greek letter on the page, named with its case, under the header (Andrew, 2026-10-28) */
function greek(){
  const top=document.querySelector('header.top'); if(!top||document.querySelector('.greekkey')) return;
  const N={α:'alpha',β:'beta',γ:'gamma',δ:'delta',ε:'epsilon',ζ:'zeta',η:'eta',θ:'theta',ι:'iota',κ:'kappa',λ:'lambda',μ:'mu',ν:'nu',ξ:'xi',π:'pi',ρ:'rho',σ:'sigma',τ:'tau',υ:'upsilon',φ:'phi',χ:'chi',ψ:'psi',ω:'omega'};
  const T={alpha:'α',beta:'β',gamma:'γ',delta:'δ',epsilon:'ε',varepsilon:'ε',zeta:'ζ',eta:'η',theta:'θ',kappa:'κ',lambda:'λ',mu:'μ',nu:'ν',xi:'ξ',pi:'π',rho:'ρ',sigma:'σ',tau:'τ',phi:'φ',varphi:'φ',chi:'χ',psi:'ψ',omega:'ω',Gamma:'Γ',Delta:'Δ',Theta:'Θ',Lambda:'Λ',Xi:'Ξ',Pi:'Π',Sigma:'Σ',Phi:'Φ',Psi:'Ψ',Omega:'Ω'};
  const main=[...document.querySelectorAll('header.top,section.class,section.pic,section.slides,section.sayback,section.qs,section.questions,section.star')];
  let txt=main.map(e=>e.textContent).join(' ');
  document.querySelectorAll('[data-tex],[data-tex-inline]').forEach(e=>{ txt+=' '+(e.getAttribute('data-tex')||'')+' '+(e.getAttribute('data-tex-inline')||''); });
  txt=txt.replace(/\\([A-Za-z]+)/g,(m,w)=>T[w]?' '+T[w]+' ':m).replace(/ϕ/g,'φ').replace(/ϵ/g,'ε');
  const seen=[];
  for(const ch of txt){ const lo=ch.toLowerCase(); if(N[lo]&&!seen.includes(ch)) seen.push(ch); }
  if(!seen.length) return;
  seen.sort((a,b)=>txt.indexOf(a)-txt.indexOf(b));
  const k=document.createElement('p'); k.className='greekkey';
  k.textContent='Greek letters on this page: '+seen.map(ch=>{ const lo=ch.toLowerCase(); return ch+' '+(ch===lo?'small ':'capital ')+N[lo]; }).join(' · ');
  top.appendChild(k);
}
/* every curly capital on the page, named by its shape: "curly P" (Andrew, 2026-10-30) */
function curly(){
  const top=document.querySelector('header.top'); if(!top||document.querySelector('.curlykey')) return;
  const U='𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵', A=[...U];
  const main=[...document.querySelectorAll('header.top,section.class,section.pic,section.slides,section.sayback,section.qs,section.questions,section.star')];
  let txt=main.map(e=>e.textContent).join(' ');
  document.querySelectorAll('[data-tex],[data-tex-inline]').forEach(e=>{ txt+=' '+(e.getAttribute('data-tex')||'')+' '+(e.getAttribute('data-tex-inline')||''); });
  txt=txt.replace(/\\mathcal\s*\{?\s*([A-Z])/g,(m,c)=>' '+A[c.charCodeAt(0)-65]+' ');
  const seen=[];
  for(const ch of txt){ const i=A.indexOf(ch); if(i>=0&&!seen.includes(ch)) seen.push(ch); }
  if(!seen.length) return;
  seen.sort((a,b)=>txt.indexOf(a)-txt.indexOf(b));
  const k=document.createElement('p'); k.className='greekkey curlykey';
  k.textContent='Curly letters on this page: '+seen.map(ch=>ch+' curly '+String.fromCharCode(65+A.indexOf(ch))).join(' · ');
  top.appendChild(k);
}
/* a table too wide for the screen, other than a truth table, stacks: each row becomes a card, each cell under its column's name */
function stackTables(){
  document.querySelectorAll('table').forEach(t=>{
    if(t.classList.contains('stack')||t.closest('.pic,.slides,#lbar,.lbar')) return;
    const box=t.closest('.tablewrap')||t.parentElement; if(!(t.scrollWidth>box.clientWidth+2)) return;
    const cells=[...t.querySelectorAll('td')].map(td=>td.textContent.trim());
    if(!cells.length||cells.filter(c=>/^(T|F|0|1|)$/.test(c)).length>cells.length/2) return;
    const hr=[...t.querySelectorAll('tr')].find(r=>r.querySelector('th')&&!r.querySelector('td')); if(!hr) return;
    const heads=[...hr.children].map(th=>th.textContent.trim());
    t.querySelectorAll('tr').forEach(r=>{ if(r===hr) return; [...r.children].forEach((c,i)=>{ if(heads[i]) c.setAttribute('data-h',heads[i]); }); });
    hr.classList.add('stackhead'); t.classList.add('stack');
  });
}
/* an inline formula too long for its line gets a line of its own, instead of breaking mid-formula */
function liftLong(){
  document.querySelectorAll('.katex').forEach(k=>{
    if(k.closest('.katex-display,.rows,.texline,.katex .katex,#lbar,.lbar')) return;
    const host=k.closest('[data-tex-inline],.m,.mt,.bm')||k;
    const tops=new Set([...k.getClientRects()].filter(r=>r.width>0).map(r=>Math.round(r.top/6)));
    if(tops.size>1&&k.textContent.length>12) host.classList.add('texline');
  });
}
/* One gesture per footing (design committee, 2026-10-30; Andrew 2026-10-30: the page is the step, its sections are footings). A theme page (0a, 1c, ...) holds its steps in order as
   <section class="class step" data-step="0a4">. Each step hides the ones after it until its "next footing" button is
   pressed; the furthest step opened is kept in the record (steps:<page>). Anything marked .themeend (the challenges,
   the certification) waits for the last step. The header pill says how many steps the theme has. */
function steps(){
  const ss=[...document.querySelectorAll('section.step')]; if(!ss.length) return;
  const page=ladderPage(), K='steps:'+page;
  let open=1; try{ open=Math.max(1,parseInt(LS.getItem(K)||'1',10)||1); }catch(e){}
  const h=decodeURIComponent(location.hash.slice(1)); if(h){ const t=document.getElementById(h);
    const hi=ss.findIndex(s=>s.dataset.step===h||(t&&s.contains(t))); if(hi>=0) open=Math.max(open,hi+1); }
  open=Math.min(open,ss.length);
  const ends=[...document.querySelectorAll('.themeend')], btns=[];
  ss.forEach((s,i)=>{ if(!s.id) s.id=s.dataset.step;
    if(i===ss.length-1) return;
    const w=document.createElement('div'); w.className='stnext';
    w.innerHTML='<button type="button" class="stnextb"><span class="pk">next footing</span><span class="pl">'+ss[i+1].dataset.step+'</span></button>';
    w.querySelector('button').addEventListener('click',()=>{ set(i+2); setTimeout(()=>ss[i+1].scrollIntoView({behavior:'smooth',block:'start'}),30); });
    s.appendChild(w); btns.push(w); });
  let pill=null; const tags=document.querySelector('header.top .tags');
  if(tags){ pill=document.createElement('span'); pill.className='stpill'; tags.appendChild(pill); }
  function set(n){ if(n<=open) return; open=n; try{ LS.setItem(K,String(n)); }catch(e){} paint(); }
  function paint(){
    ss.forEach((s,i)=>{ s.hidden=i>=open; }); btns.forEach((b,i)=>{ b.hidden=i!==open-1; });
    ends.forEach(e=>{ e.hidden=open<ss.length; });
    if(pill) pill.textContent=ss.length+' footings'+(open<ss.length?' · '+open+' open':'');
    bleed(); if(window.__fit) setTimeout(window.__fit,60); }
  /* the next-footing rung spans the whole screen, whatever column the step sits in */
  function bleed(){ const W=document.documentElement.clientWidth;
    btns.forEach(b=>{ if(b.hidden) return; b.style.marginLeft='0px'; b.style.width=W+'px';
      b.style.marginLeft=(-b.getBoundingClientRect().left)+'px'; }); }
  addEventListener('resize',bleed);
  paint();
}
/* every paragraph with a pid is a link target (rNN.html#pid), so a cite-back can point at the paragraph that built a thing (0.1.18) */
function pids(){ document.querySelectorAll('[data-pid]').forEach(p=>{ const id=p.dataset.pid; if(id&&!p.id&&!document.getElementById(id)) p.id=id; });
  /* a link may also name the address the page shows (1b1.0.3): turn it into the paragraph's pid before the steps open */
  const h=decodeURIComponent(location.hash.slice(1)); if(!h||document.getElementById(h)) return; const info=tagInfo(); if(!info) return;
  const per={}; const ps=[...document.querySelectorAll('header.top > p[data-pid], section.class p[data-pid]')];
  for(const p of ps){ const top=!!p.closest('header.top'), st=p.closest('section.step'), k=top?info.label+'.top':(st?st.dataset.step:info.label); per[k]=(per[k]||0)+1; const ad=top?k+'.'+per[k]:k+'.0.'+per[k]; if(ad===h){ history.replaceState(null,'','#'+p.dataset.pid); break; } } }
function toPid(){ const h=location.hash.slice(1); const t=h&&document.getElementById(h); if(t&&t.dataset&&t.dataset.pid) setTimeout(()=>t.scrollIntoView({block:'center'}),60); }
ready(()=>{ pids(); steps(); const info=tagInfo(); if(info){ titles(info); addresses(info); edInit(); } toPid(); reportQuestions(); pn(); nonskid(); greek(); curly();
  const fit=()=>{ stackTables(); liftLong(); }; window.__fit=fit;
  setTimeout(fit,400); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>setTimeout(fit,100)); });
})();
/* the basement: it waits below the bottom buttons; push on past the foot of the page and the ladder turns over */
(function(){
'use strict';
const ready=f=>{ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',f); else f(); };
function basement(){
  const b=document.querySelector('section.basement'); if(!b) return;
  const t=document.querySelector('header.top .tags .tag'), txt=t?t.textContent.trim():'', i=txt.indexOf(' · ');
  const lab=(i<0?txt:txt.slice(0,i)).replace(/^Rung\s+/,'');
  const head=document.createElement('div'); head.className='bhead'; head.innerHTML='<span class="bn">−'+lab+'</span> basement';
  const eb=b.querySelector('.eyebrow'); if(eb) eb.replaceWith(head); else b.prepend(head);
  b.id=b.id||'basement';
  const lip=document.createElement('button'); lip.type='button'; lip.className='blip';
  lip.innerHTML='<span class="bar"></span><span class="bl">keep going down: the basement</span>';
  b.before(lip);
  let pull=0, open=false; const NEED=160;
  const atFoot=()=>window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4;
  const setPull=v=>{ pull=Math.max(0,Math.min(NEED,v)); lip.style.setProperty('--pull',(pull/NEED).toFixed(3)); };
  const show=()=>{ open=true; b.classList.remove('shut'); lip.classList.add('gone'); setPull(0); };
  const openIt=()=>{ if(open) return; show();
    requestAnimationFrame(()=>head.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})); };
  const tgt=location.hash&&document.getElementById(location.hash.slice(1));
  if(tgt&&b.contains(tgt)) show(); else b.classList.add('shut');
  lip.onclick=openIt;
  addEventListener('wheel',e=>{ if(open) return; if(e.deltaY>0&&atFoot()){ setPull(pull+e.deltaY*0.5); if(pull>=NEED) openIt(); } else if(e.deltaY<0) setPull(0); },{passive:true});
  let ty=null;
  addEventListener('touchstart',e=>{ ty=(!open&&atFoot())?e.touches[0].clientY:null; },{passive:true});
  addEventListener('touchmove',e=>{ if(open||ty==null) return; setPull(ty-e.touches[0].clientY); if(pull>=NEED) openIt(); },{passive:true});
  addEventListener('touchend',()=>{ ty=null; if(!open) setPull(0); },{passive:true});
  const flip=()=>{ const inb=open&&b.getBoundingClientRect().top<innerHeight*0.45;
    if(document.body.classList.contains('inbase')===inb) return;
    document.body.classList.toggle('inbase',inb);
    const w=document.querySelector('#lbar .lb-ladder .lb-w'), L=document.querySelector('#lbar .lb-ladder .lb-L'); if(w) w.textContent=inb?'Basement':'adder'; if(L) L.style.display=inb?'none':'';
    const l=document.querySelector('#lbar .lb-ladder .lb-l'); if(l) l.setAttribute('aria-label',inb?'Basement':'Ladder'); };
  addEventListener('scroll',flip,{passive:true}); flip();
}
ready(()=>setTimeout(basement,0));
})();


/* ---- flash cards: multiple choice, "know by sight". A rung's steps share one deck; a step's cards join it
   the first time the step is opened. Annexes share a deck by annex type (every chem page, every phys page...).
   Data: cards/rNN.js for a rung, cards/a-<type>.js for an annex type; each pushes into window.LADDER_CARDS[tag] = [
   {q:'prompt', a:'right answer', w:['tempting wrong', ...], why:'one line shown after'} ]. $...$ in any field is TeX. */
(function(){
'use strict';
const ANNEX=['bio','chem','comp','crypt','econ','eng','logi','nav','phys','stat','now'];
const CS='cards:seen', CR='cards:record';
const get=(k,d)=>{ try{ return JSON.parse(LS.getItem(k)||'')||d; }catch(e){ return d; } };
const put=(k,v)=>{ try{ LS.setItem(k,JSON.stringify(v)); }catch(e){} };
function info(){
  const t=document.querySelector('header.top .tags .tag'); if(!t||!document.querySelector('.qid')) return null;
  const txt=t.textContent.trim(), i=txt.indexOf(' · '); const tag=(i<0?txt:txt.slice(0,i)).trim();
  const cls=[...t.classList].find(c=>c!=='tag')||'';
  const rung=parseInt(tag,10); if(isNaN(rung)) return null;
  const annex=ANNEX.includes(cls)?cls:null;
  return {tag,rung,annex,deck:annex?'a-'+annex:'r'+String(rung).padStart(2,'0')};
}
const me=info(); if(!me) return;
const seen=get(CS,{}); if(!seen[me.tag]||seen[me.tag].deck!==me.deck){ seen[me.tag]={deck:me.deck,t:Date.now()}; put(CS,seen); }
window.LADDER_CARDS=window.LADDER_CARDS||{};
let loaded=null;
function load(){ if(loaded) return loaded;
  loaded=new Promise(res=>{ const s=document.createElement('script'); s.src='cards/'+me.deck+'.js'; s.onload=()=>res(true); s.onerror=()=>res(false); document.head.appendChild(s); });
  return loaded; }
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
function rich(el,t){ el.innerHTML=''; String(t).split(/(\$[^$]+\$)/).forEach(p=>{ if(/^\$[^$]+\$$/.test(p)){ const sp=document.createElement('span'); const x=p.slice(1,-1);
    if(window.katex){ try{ katex.render(x,sp,{throwOnError:false,strict:false}); }catch(e){ sp.textContent=x; } } else sp.textContent=x; el.appendChild(sp); }
  else el.appendChild(document.createTextNode(p)); }); }
function note(m){ let t=document.getElementById('patoast'); if(!t){ t=document.createElement('div'); t.id='patoast'; t.setAttribute('role','status'); document.body.appendChild(t); } t.textContent=m; t.classList.add('on'); clearTimeout(note.h); note.h=setTimeout(()=>t.classList.remove('on'),2200); }
const shuffle=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
function deck(){ const s=get(CS,{}); const tags=Object.keys(s).filter(k=>s[k].deck===me.deck);
  const out=[]; tags.forEach(tg=>(window.LADDER_CARDS[tg]||[]).forEach((c,i)=>out.push(Object.assign({tag:tg,id:tg+'#'+i},c)))); return {tags,cards:out}; }
let box=null;
function close(){ if(box){ box.remove(); box=null; document.body.classList.remove('cardsopen'); } }
function open(){
  load().then(ok=>{
    const d=deck();
    if(!ok||!d.cards.length){ note('this deck’s cards are still being made'); return; }
    close(); box=document.createElement('div'); box.id='cards'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','flash cards');
    document.body.appendChild(box); document.body.classList.add('cardsopen');
    const rec=get(CR,{}); let queue=shuffle(d.cards.slice()), n=0, right=0;
    const label=me.annex?('every '+me.annex+' page you have opened'):('rung '+me.rung+', steps opened: '+d.tags.sort().join(', '));
    const show=()=>{
      if(!queue.length){ box.innerHTML='<div class="cd-card"><div class="cd-top"><span>flash cards</span><button class="cd-x" aria-label="close">×</button></div><p class="cd-q">'+right+' of '+n+' at first sight. Every card missed came back until it was known.</p><div class="cd-foot"><button class="cd-next cd-again">shuffle again</button></div></div>';
        box.querySelector('.cd-x').onclick=close; box.querySelector('.cd-again').onclick=()=>{ close(); open(); }; return; }
      const c=queue.shift(); const opts=shuffle([c.a].concat(shuffle((c.w||[]).slice()).slice(0,3)));
      box.innerHTML='<div class="cd-card"><div class="cd-top"><span>'+esc(c.tag)+' · '+esc(label)+'</span><button class="cd-x" aria-label="close">×</button></div><div class="cd-q"></div><div class="cd-opts"></div><div class="cd-why" hidden></div><div class="cd-foot"><span class="cd-n">'+queue.length+' left</span><button class="cd-next" hidden>next →</button></div></div>';
      box.querySelector('.cd-x').onclick=close; rich(box.querySelector('.cd-q'),c.q);
      const ob=box.querySelector('.cd-opts'); let done=false;
      opts.forEach(o=>{ const b=document.createElement('button'); b.className='cd-o'; rich(b,o); ob.appendChild(b);
        b.onclick=()=>{ if(done) return; done=true; const ok=o===c.a;
          ob.querySelectorAll('.cd-o').forEach((x,i)=>{ if(opts[i]===c.a) x.classList.add('right'); });
          if(!ok){ b.classList.add('wrong'); queue.splice(Math.min(queue.length,2+Math.floor(Math.random()*3)),0,c); }
          if(!c._seen){ n++; if(ok) right++; c._seen=true; }
          const r=rec[c.id]||{r:0,w:0}; ok?r.r++:r.w++; rec[c.id]=r; put(CR,rec);
          const w=box.querySelector('.cd-why'); if(c.why){ rich(w,c.why); w.hidden=false; }
          const nx=box.querySelector('.cd-next'); nx.hidden=false; nx.focus(); nx.onclick=show; }; });
    };
    show();
  });
}
document.addEventListener('keydown',e=>{ if(box&&e.key==='Escape') close(); });
window.LadderCards={open,close,info:me};
})();

/* ladder rows: the whole row opens its page; the footings toggle, buttons and links inside keep their own jobs (0.0.448) */
(function(){
  const rows=[...document.querySelectorAll('ol.ladder>li')].filter(li=>li.querySelector(':scope>.t>a[href]'));
  if(!rows.length) return;
  rows.forEach(li=>li.classList.add('rowlink'));
  document.addEventListener('click',e=>{
    const li=e.target.closest&&e.target.closest('ol.ladder>li.rowlink'); if(!li) return;
    if(e.target.closest('details.stidx,button,input,label,a,.crownarrow')) return;
    if(window.getSelection&&String(window.getSelection()).length) return;
    e.preventDefault(); e.stopPropagation();
    const a=li.querySelector(':scope>.t>a[href]');
    if(e.metaKey||e.ctrlKey) window.open(a.href,'_blank'); else location.href=a.href;
  },true);
})();

/* Tap to agree (Andrew, 2026-10-31): the first time the ladder opens on a device, the learner (or, under 18,
   a parent or guardian) agrees to the license and terms. The agreement is kept on this device with its date.
   The license, about and install pages stay open to read first; the author's desk never asks. */
(function(){
  const TERMS='2026-10-31';
  const pg=ladderPage();
  if(window.LADDER_PAGE||/^(license|about|install|404)$/.test(pg)) return;
  let ok=null; try{ ok=JSON.parse(LS.getItem('ladder:agreed')||'null'); }catch(e){}
  if(ok&&ok.terms===TERMS) return;
  const show=()=>{ if(document.getElementById('agreebox')) return;
    const box=document.createElement('div'); box.id='agreebox'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label','license and terms');
    box.innerHTML='<div class="agcard"><h3>Before you climb</h3><p>The Ladder is free for learners, classrooms and homes, for non-commercial use. It makes no promise about any test or placement. Your progress stays on this device and is never sent anywhere.</p><p>Please read the <a href="license.html">license and terms</a>. If you are under 18, ask a parent or guardian to read them and agree for you.</p><button type="button" class="agyes">I agree</button><p class="agsmall">Tapping “I agree” means you, or your parent or guardian, accept the license and terms.</p></div>';
    document.body.appendChild(box); document.body.classList.add('agreeing');
    box.querySelector('.agyes').onclick=()=>{ try{ LS.setItem('ladder:agreed',JSON.stringify({terms:TERMS,at:new Date().toISOString()})); }catch(e){}
      box.remove(); document.body.classList.remove('agreeing'); }; };
  if(document.body) show(); else document.addEventListener('DOMContentLoaded',show);
})();
