/* compete */
try{ if(localStorage.getItem('ladder:compete')==='1') document.documentElement.setAttribute('data-compete','1'); }catch(e){}
/* toolbox gear */ (function(){ try{ const th=localStorage.getItem('ladder:theme'); if(th==='light'||th==='dark') document.documentElement.setAttribute('data-theme',th); }catch(e){} })();
/* a link's page stem; on the desk links read view.html#p=<stem> */
function hstem(h){ h=h||''; const m=h.match(/^view\.html#(?:.*&)?p=([^&]+)/); if(m) return decodeURIComponent(m[1]); return h.replace(/#.*$/,'').replace(/\.html?$/,''); }
/* rung.js: the shared machinery of the new ladder's pages.
   Load order at the end of <body>: katex (in <head>), then rung.js, then the page's own script, then tray.js.
   Provides window.Rung = { tex, col, stepper, plane, ready }.
   Markup it understands:
     [data-tex]          display TeX         [data-tex-inline]   inline TeX
     <pre class="lines" data-k="ember|teal|plain" data-label="…">  one move per line:  TeX @@ note
     <div class="brkkey"></div>   filled with the colour legend for bars
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
function save(){ kc=null; window.__lsVer=(window.__lsVer||0)+1; if(!store) return; rec.updated=Date.now(); const s=JSON.stringify(rec);
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
let kc=null;
function keys(){ const r=load(); if(kc&&kc.r===r&&kc.raw===raw) return kc.out; const out=[];
  if(r.progress.pages&&Object.keys(r.progress.pages).length) out.push('pages:done');
  if(r.stats&&Object.keys(r.stats).length) out.push('ladder:stats');
  if(r.reports&&r.reports.length) out.push('ladder:reports');
  ['sync','steps','marks','certs','games','desk','cards','notes','prefs','other'].forEach(s=>Object.keys(r[s]||{}).forEach(u=>out.push(name(s,u))));
  if(r.meta.reset!==undefined) out.push('ladder:reset');
  kc={r,raw,out}; return out; }
window.LS={
  getItem(k){ const r=load(), [s,u]=where(k); const v=u===null?r[s]:(r[s]||{})[u];
    if(u===null&&((s==='stats'&&!Object.keys(v||{}).length)||(s==='reports'&&!(v||[]).length))) return null;
    return v===undefined?null:show(v); },
  setItem(k,v){ const r=load(), [s,u]=where(k), p=parse(v); if(u===null) r[s]=p; else r[s][u]=p; kc=null; save(); },
  removeItem(k){ const r=load(), [s,u]=where(k); if(u===null) r[s]=blank()[s]; else delete r[s][u]; kc=null; save(); },
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
    const b=blank(); for(const k in b) if(!(k in o)) o[k]=b[k]; rec=o; save(); },
  /* 0.3.4: erase all progress; keeps only the terms agreement and the reset marker */
  erase(){ const o=load(), b=blank(); b.meta=o.meta||{}; if(o.prefs&&o.prefs.agreed!==undefined) b.prefs.agreed=o.prefs.agreed; rec=b; save(); }
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

/* Phase J step 4 (Andrew 2026-11-11): the 52 infinity series steps moved up by 26, ∞1-∞52 -> ∞27-∞78, and their files from
   skyNN to inf(NN+26), so an old page id is never reused (the new ∞1-∞26 are inf01-inf26). Page-keyed records (pages:done,
   cert:, steps:, note:, the climb's furthest and last footing) move whenever an old sky id turns up, which is safe because
   sky ids are retired. Records keyed by the ∞ label (ticks q:∞N..., crosswalk cards seen and record, pool repeats, standing
   questions) move once, under the flag ladder:mvInf26, before any new ∞1-∞26 exists. */
(function(){ const SH=26, F='ladder:mvInf26';
  const ids=s=>String(s).replace(/\bsky(\d+)(?=\.\d)/g,(x,n)=>'inf'+(+n+SH)).replace(/\bsky(\d\d)\b/g,(x,n)=>'inf'+(+n+SH));
  const tg=s=>String(s).replace(/∞(\d+)/g,(x,n)=>(+n>=1&&+n<=52)?'∞'+(+n+SH):x);
  const J=(k,d)=>{ try{ const v=LS.getItem(k); return v==null?d:JSON.parse(v); }catch(e){ return d; } };
  try{
    const pd=J('pages:done',null); if(pd&&typeof pd==='object'){ let ch=false;
      Object.keys(pd).forEach(k=>{ const m=/^(open:)?sky(\d\d)$/.exec(k); if(!m) return; const nk=(m[1]||'')+'inf'+(+m[2]+SH);
        if(!pd[nk]||((pd[k]&&pd[k].t)||0)>((pd[nk]&&pd[nk].t)||0)) pd[nk]=pd[k]; delete pd[k]; ch=true; });
      if(ch) LS.setItem('pages:done',JSON.stringify(pd)); }
    const ks=[]; for(let i=0;i<LS.length;i++){ const k=LS.key(i); if(k) ks.push(k); }
    ks.forEach(k=>{ const m=/^(cert|steps|note):sky(\d\d)$/.exec(k); if(!m) return; const nk=m[1]+':inf'+(+m[2]+SH);
      if(LS.getItem(nk)==null) LS.setItem(nk,LS.getItem(k)); LS.removeItem(k); });
    ['ladder:furthest','ladder:lastFooting'].forEach(k=>{ const v=LS.getItem(k); if(v&&/\bsky\d/.test(v)) LS.setItem(k,ids(v)); });
    if(LS.getItem(F)==null){
      ks.forEach(k=>{ if(!/^(marks:|cards:|rand:|sq:)/.test(k)) return; const v=LS.getItem(k); if(v==null) return;
        const nk=tg(ids(k)), nv=/^marks:/.test(k)||/^cards:|^rand:/.test(k)||/^sq:/.test(k)?tg(ids(v)):v;
        if(nk!==k){ if(LS.getItem(nk)==null) LS.setItem(nk,nv); LS.removeItem(k); } else if(nv!==v) LS.setItem(k,nv); });
      const sy=J('ladder:sky',null); if(sy&&sy.n&&!sy.first){ sy.first=27; LS.setItem('ladder:sky',JSON.stringify(sy)); } /* the count n began at ∞27 */
      LS.setItem(F,String(Date.now())); }
  }catch(e){} })();

/* Phase J step 5 (2026-11-11): ∞1-∞26 now stand in front of ∞27-∞78 in sky.js. A supplied count n kept before this release
   counted from ∞27 (first: 27, or no first at all under 0.3.154-0.3.159), so it moves up by 26 once, under ladder:mvInf1:
   what a learner already had stays, and ∞1-∞26 arrive with it, under the button. */
/* 2026-11-11: the arrow newsflashes 47·comp2 and 47·crypt (0.3.174-0.3.177) left rung 47 for the infinity series as ∞·comp and
   ∞·crypt (infcomp, infcrypt). Their page records follow once, under ladder:mvArrow1; the old page ids are retired. */
(function(){ const F='ladder:mvArrow1'; try{ if(LS.getItem(F)!=null) return; const M={r47comp2:'infcomp',r47crypt:'infcrypt'};
  ['pages:done'].forEach(k=>{ const v=JSON.parse(LS.getItem(k)||'null'); if(!v||typeof v!=='object') return; let ch=false;
    Object.keys(M).forEach(o=>{ ['','open:'].forEach(pre=>{ if(v[pre+o]!=null){ if(v[pre+M[o]]==null) v[pre+M[o]]=v[pre+o]; delete v[pre+o]; ch=true; } }); }); if(ch) LS.setItem(k,JSON.stringify(v)); });
  Object.keys(M).forEach(o=>{ ['cert:','steps:','note:'].forEach(pre=>{ const v=LS.getItem(pre+o); if(v!=null){ if(LS.getItem(pre+M[o])==null) LS.setItem(pre+M[o],v); LS.removeItem(pre+o); } }); });
  LS.setItem(F,String(Date.now())); }catch(e){} })();
(function(){ const F='ladder:mvInf1'; try{ if(LS.getItem(F)!=null) return;
  const sy=JSON.parse(LS.getItem('ladder:sky')||'null'); if(sy&&sy.n>0&&sy.first!==1){ sy.n+=26; sy.first=1; LS.setItem('ladder:sky',JSON.stringify(sy)); }
  LS.setItem(F,String(Date.now())); }catch(e){} })();
/* 2026-11-11 (Andrew 20:05Z): the infinity series is numbered by a fixed shuffle of letters, digits and date kanji
   (work/infshuffle/order.json), so ∞1-∞86 became ∞ + a symbol. Records keyed by the ∞ label (ticks, crosswalk cards seen,
   pool repeats, standing questions) follow once, under ladder:mvInfSym, in one pass, before any record under a new label exists.
   Page ids (infNN) did not change. */
(function(){ const F='ladder:mvInfSym', S=["Ψ", "ל‎", "1", "Υ", "Φ", "r", "Τ", "x", "Η", "v", "Ε", "א‎", "ג‎", "ψ", "τ", "水", "Ξ", "p", "a", "J", "γ", "八", "M", "ר‎", "ד‎", "2", "8", "土", "6", "η", "F", "四", "Δ", "n", "ח‎", "九", "B", "h", "W", "G", "ט‎", "θ", "ο", "Π", "λ", "י‎", "j", "Ω", "H", "一", "ב‎", "ω", "ק‎", "木", "ζ", "4", "ו‎", "פ‎", "Ο", "千", "l", "7", "δ", "A", "ι", "Κ", "六", "f", "C", "日", "σ", "υ", "α", "s", "金", "χ", "Μ", "b", "三", "q", "I", "w", "9", "D", "十", "P"]; try{ if(LS.getItem(F)!=null) return;
  const tg=s=>String(s).replace(/∞(\d+)/g,(x,n)=>(+n>=1&&+n<=S.length)?'∞'+S[+n-1]:x);
  const ks=[]; for(let i=0;i<LS.length;i++){ const k=LS.key(i); if(k) ks.push(k); }
  const mv=[]; ks.forEach(k=>{ if(!/^(marks:|cards:|rand:|sq:)/.test(k)) return; const v=LS.getItem(k); if(v==null) return; mv.push([k,tg(k),tg(v)]); });
  mv.forEach(x=>{ if(x[1]!==x[0]) LS.removeItem(x[0]); }); mv.forEach(x=>{ LS.setItem(x[1],x[2]); });
  LS.setItem(F,String(Date.now())); }catch(e){} })();

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
    /* a wrong proof (moves to watch out for, a move that fails) is always red, never the colour of a valid move */
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
    if(o.labels&&g){ c.fillStyle=col('--muted'); c.font='11px Nunito, system-ui, sans-serif'; c.textAlign='center'; const ly=Math.min(H-6,Math.max(12,P.Y(0)+14));
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
  P.text=(s,x,y,color,align,size)=>{ c.fillStyle=col(color||'--ink'); c.font=(size||13)+'px Nunito, system-ui, sans-serif'; c.textAlign=align||'left'; c.fillText(s,P.X(x),P.Y(y)); };
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
  if(window.LadderSky&&LadderSky.histLinks) LadderSky.histLinks();
}
/* certification (Andrew, 2026-10-29): one kind, replacing quiz, test and exam. A gold button shows once the
   required questions (x.1 to x.3) are ticked; sat under a proctor it becomes a green check, sat on your own a gold star.
   The sitting itself (fresh questions from the randomizer) is not built yet; the record is cert:<page> = 'proctor' | 'self'. */
function certRead(key){ try{ return JSON.parse(LS.getItem('cert:'+(key||PAGE))||'null'); }catch(e){ return null; } }
const CERTTXT={rung:'This is the rung’s last step, so its measuring stick is the rung’s: one short sitting of fresh questions on the whole rung, drawn from its steps.',step:'The measuring stick is one short sitting of fresh questions on this step, drawn from its own pool.',floor:'The floor’s measuring stick is two fresh questions a rung, drawn from its rungs.'};
function certFill(w,key,open,what,sk){
  const rec=certRead(key);
  if(!open&&!rec){ w.innerHTML=''; w.hidden=true; return; }
  w.hidden=false;
  if(rec&&rec.by==='proctor'){ w.innerHTML='<span class="certdone proctor" title="measured under a proctor">✓ measured</span>'; return; }
  if(rec&&rec.by==='self'){ w.innerHTML='<span class="certdone self" title="measured on your own'+(rec.score?', '+rec.score:'')+'">★ measured</span>'; return; }
  w.innerHTML='<button type="button" class="certbtn">'+(what==='rung'?'the rung’s measuring stick':what==='floor'?'the floor’s measuring stick':'the measuring stick')+'</button><div class="certpanel" hidden><p>'+CERTTXT[what||'step']+' Pass with four in five right and it becomes a gold star.</p><p><button type="button" class="certgo">sit it now</button></p></div>';
  const b=w.querySelector('.certbtn'), p=w.querySelector('.certpanel'); b.onclick=e=>{ e.preventDefault(); e.stopPropagation(); p.hidden=!p.hidden; };
  w.querySelector('.certgo').onclick=e=>{ e.preventDefault(); e.stopPropagation(); if(window.LadderStick&&sk) LadderStick.sit(sk[0],sk[1],{done:()=>certFill(w,key,open,what,sk)}); };
}
window.LadderCert={read:certRead,fill:(el,key,open)=>{ if(!el) return; el.classList.add('certwrap'); const fm=String(key).match(/^floor(\d+)concl$/); certFill(el,key,open,'floor',fm?['floor',+fm[1]]:null); }};
/* the last in a series folds into the larger one (Andrew, 2026-10-29 18:32): a rung's last core step carries the rung's
   certification; the last step of a floor's last rung carries none, since the floor's certification covers it */
function certify(box,all){
  let w=box.querySelector(':scope>.certwrap');
  if(!w){ w=document.createElement('div'); w.className='certwrap'; box.appendChild(w); }
  const m=(document.querySelector('meta[name="ladder-cert"]')||{}).content||'';
  if(/^floor:/.test(m)){ const n=m.split(':')[1]; w.hidden=!all;
    w.innerHTML=all?'<p class="certnote">This is the floor’s last step, so its measuring stick is the floor’s: <a href="floor'+n+'concl.html#cert">beside the floor conclusion</a>.</p>':''; return; }
  const rm=PAGE.match(/^r0*(\d+)/);
  certFill(w,PAGE,all,m==='rung'?'rung':'step',m==='rung'&&rm?['rung',+rm[1]]:['step',PAGE]);
}
/* on the ladder: beside each floor conclusion row, its certification (once the floor conclusion has opened) */
function floorCerts(){
  const rows=[...document.querySelectorAll('.rungs li.k-concl')].filter(li=>{ const a=li.querySelector('.t a'); return a&&/^floor\d+concl$/.test(hstem(a.getAttribute('href'))); });
  if(!rows.length) return;
  let pages={}; try{ pages=JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){}
  rows.forEach(li=>{ const stem=hstem(li.querySelector('.t a').getAttribute('href'));
    let w=li.querySelector('.certrow'); if(!w){ w=document.createElement('a'); w.className='certrow'; w.href=stem+'.html#cert'; li.querySelector('.t').appendChild(w); }
    const rec=certRead(stem), open=!!(pages[stem]&&pages[stem].v);
    if(rec&&rec.by==='proctor'){ w.textContent='✓ measured'; w.className='certrow proctor'; }
    else if(rec&&rec.by==='self'){ w.textContent='★ measured'; w.className='certrow self'; }
    else if(open){ w.textContent='measuring stick'; w.className='certrow'; }
    else { w.textContent='measuring stick'; w.className='certrow wait'; w.title='opens once every step of the floor is ticked'; } });
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
    /* 0.3.15 (Andrew 21:57): the desk opens on the whole ladder, every rung unpacked */
    if(window.LADDER_DESK){ sec.classList.remove('packed'); cue.textContent=''; return; }
    const open=th.classList.contains('passed');
    const lab=((th.querySelector(':scope>.n')||{}).textContent||'').trim();
    if(open&&!openSeen.has(lab)){ openSeen.add(lab); saveOpenSeen(); if(openSeeded){ sec.classList.add('packed'); unpack(sec,true); } }
    if(!open){ sec.classList.add('packed'); cue.textContent=''; /* 0.3.34: no open button any more; a rung unpacks once its page is passed */ }
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
  const rows=[...document.querySelectorAll('li.built')].filter(li=>li.querySelector(':scope>.n')&&!li.closest('.firstrun')) /* 0.3.23: the first-run rows below floor 1 are never ticked */;
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
/* 0.3.28: titles went to title case, so a record kept under the old title (same words, other case) carries over once */
/* 0.3.153: renamed page titles carry their record over once (new title: old title) */
const TITLE_WAS={"Finding Your Vectors":"Finding Your Arrows","Vectors Add and Stretch, and Have Dimension":"Arrows Add and Stretch, and Have Dimension","The Vectors a Map Only Stretches":"The Arrows a Map Only Stretches","Measuring Sticks for Vectors":"Measuring Sticks for Arrows","Functions Are Vectors With Lengths and Angles":"Functions Are Arrows With Lengths and Angles","7a · Results Revisited":"7a · Deduction Revisited"};
let tkC=null;
function titledKey(prefix,title){ const k=prefix+title; try{ if(LS.getItem(k)!=null) return k; const lk=k.toLowerCase();
    if(!tkC||tkC.v!==window.__lsVer){ const m={}; for(let i=0;i<LS.length;i++){ const o=LS.key(i); if(o){ const l=o.toLowerCase(); (m[l]=m[l]||[]).push(o); } } tkC={v:window.__lsVer,m}; }
    let o=(tkC.m[lk]||[]).find(x=>x!==k); if(!o&&TITLE_WAS[title]){ o=(tkC.m[(prefix+TITLE_WAS[title]).toLowerCase()]||[])[0]; } if(o){ const v=LS.getItem(o); if(v!=null){ LS.setItem(k,v); } } }catch(e){} return k; }
window.__titledKey=titledKey;
function holdMenu(el,open){ let t=null, x0=0, y0=0; const clear=()=>{ if(t){ clearTimeout(t); t=null; } };
  el.addEventListener('pointerdown',e=>{ if(e.button>0) return; x0=e.clientX; y0=e.clientY; el.__held=false; clear(); t=setTimeout(()=>{ t=null; el.__held=true; try{ navigator.vibrate&&navigator.vibrate(12); }catch(x){} open(); },480); });
  el.addEventListener('pointermove',e=>{ if(t&&Math.hypot(e.clientX-x0,e.clientY-y0)>10) clear(); });
  ['pointerup','pointercancel','pointerleave'].forEach(k=>el.addEventListener(k,clear));
  el.addEventListener('contextmenu',e=>{ e.preventDefault(); e.stopPropagation(); if(el.__held) return; el.__held=true; open(); setTimeout(()=>{ el.__held=false; },400); }); }
function marks(){
  const KEY=titledKey('marks:',document.title||location.pathname);
  let st={}; try{ st=JSON.parse(LS.getItem(KEY)||'{}'); }catch(e){ st={}; }
  /* rung 1's steps moved one letter on (2026-10-25: the boxes page became 1a): carry old marks across */
  const RL=(PAGE.match(/^r01([a-h])$/)||[])[1]; const OLD=RL?'1'+RL:null, NEW=RL?'1'+String.fromCharCode(RL.charCodeAt(0)+1):null;
  /* 0.3.65: footings 38phys9-15 were added, so 38·phys's standing questions moved from 9.k to 16.k: carry old ticks across */
  const MV=({r38phys:[['c:38·phys.9.','c:38·phys.16.']],r43cb19:[['c:43·cb19.6.','c:43·cb19.8.']]})[PAGE]||[], moved=new Set();
  const relabel=()=>{ let ch=false; if(OLD) Object.keys(st).forEach(k=>{ if(k.startsWith('q:'+OLD+'.')){ const nk='q:'+NEW+k.slice(2+OLD.length); if(!(nk in st)){ st[nk]=st[k]; moved.add(nk); ch=true; } } });
    MV.forEach(([f,t])=>Object.keys(st).forEach(k=>{ if(k.startsWith(f)){ const nk=t+k.slice(f.length); if(!(nk in st)){ st[nk]=st[k]; moved.add(nk); ch=true; } } }));
    if(mvx()) ch=true; if(mv2()) ch=true; return ch; };
  /* 0.3.80 Phase B: on the 84 converted annex pages the page carries LADDER_MVX {old q: id: new id}. Every old q: tick moves to its
     new id or, when its question was retired, is set false (its id may now name a new understand question). The changed ids get a
     fresh time so sync keeps them over the older remote copy. The first run sets the flag mv:B; later runs (after sync) only touch q: ticks older than the flag, i.e. stale copies from another device. */
  function mvx(){ const X=window.LADDER_MVX; if(!X) return false; const t0=Date.now(), ids=[];
    let T={}; try{ T=JSON.parse(LS.getItem(KEY+':t')||'{}')||{}; }catch(e){}
    const done=!!st['mv:B'], ft=+T['mv:B']||0;
    Object.keys(st).forEach(k=>{ if(!k.startsWith('q:')||!st[k]) return; if(done&&(+T[k]||0)>=ft) return; const nk=X[k];
      if(nk&&!st[nk]){ st[nk]=true; ids.push(nk); moved.add(nk); }
      st[k]=false; ids.push(k); moved.add(k); });
    if(!done){ st['mv:B']=true; ids.push('mv:B'); moved.add('mv:B'); }
    if(ids.length){ ids.forEach(i=>T[i]=t0); try{ LS.setItem(KEY+':t',JSON.stringify(T)); }catch(e){} }
    return ids.length>0; }
  /* 0.3.83: LADDER_MV2 {f: flag, m: {old q: id: new q: id}} moves only the mapped ticks and keeps every other tick. Old ids are taken
     from the highest down, so a chain (3f19 -> 3f20, 3f20 -> 3f21) does not cascade. Same flag and time rule as mvx. */
  function mv2(){ const X=window.LADDER_MV2; if(!X||!X.m) return false; const t0=Date.now(), ids=[];
    let T={}; try{ T=JSON.parse(LS.getItem(KEY+':t')||'{}')||{}; }catch(e){}
    const done=!!st[X.f], ft=+T[X.f]||0;
    Object.keys(X.m).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true})).forEach(k=>{ if(!st[k]) return; if(done&&(+T[k]||0)>=ft) return;
      const nk=X.m[k]; st[nk]=true; st[k]=false; ids.push(nk,k); moved.add(nk); moved.add(k); });
    if(!done){ st[X.f]=true; ids.push(X.f); moved.add(X.f); }
    if(ids.length){ ids.forEach(i=>T[i]=t0); try{ LS.setItem(KEY+':t',JSON.stringify(T)); }catch(e){} }
    return ids.length>0; }
  if(OLD&&!Object.keys(st).length){ try{ const old=JSON.parse(LS.getItem('marks:'+(document.title||'').replace(new RegExp('^'+NEW+'\\b'),OLD))||'{}'); Object.assign(st,old); }catch(e){} }
  if(relabel()){ try{ LS.setItem(KEY,JSON.stringify(st)); }catch(e){} }
  const save=id=>{ try{ LS.setItem(KEY,JSON.stringify(st)); }catch(e){} if(window.MarksSync) MarksSync.push(KEY,st,id); };
  if(document.querySelector('li.built')) window.__ladderMarks={st,save};
  const items=[];
  const VAR=/^(?:[^.\s]+\.\d+\.\d+|\d+[a-z]+\d+\.\d+)$/;
  document.querySelectorAll('.qid').forEach(el=>{ if(el.closest('#desk')) return; if(!VAR.test(el.textContent.trim())){ el.classList.add('auto'); el.title='ticks itself when every question in this group is ticked; tap for prompt or report'; return; } items.push({el,id:'q:'+el.textContent.trim(),on:()=>el.classList.contains('done'),set:v=>el.classList.toggle('done',v)}); });
  document.querySelectorAll('section.challenge .chid').forEach(el=>{ if(el.closest('#desk')) return; el.title='tap when you have cleared this standing question'; items.push({el,id:'c:'+el.textContent.trim(),on:()=>el.classList.contains('done'),set:v=>el.classList.toggle('done',v)}); });
  document.querySelectorAll('li>.n').forEach(el=>{ const li=el.parentElement;
    if(li.classList.contains('built')&&!li.classList.contains('k-theory')&&!li.classList.contains('k-gate')){ li.classList.add('autorow'); el.title='ticks itself when every question on this page is ticked'; el.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); lockedHint(li); }); return; }
    items.push({el,id:'L:'+el.textContent.trim(),on:()=>li.classList.contains('passed'),set:v=>li.classList.toggle('passed',v)}); });
  items.forEach(it=>{ if(it.id in st) it.set(!!st[it.id]);
    const tick=()=>{ const li=it.el.parentElement;
      if(li&&li.classList&&li.classList.contains('k-theory')){ theoryHint(li); return; }
      const v=!it.on(); it.set(v); st[it.id]=v; save(it.id); progress();
      if(it.id.startsWith('L:')&&li.classList.contains('k-theory')&&v) unpack(li.closest('section.rung'),true); };
    it.el.__tick=tick;
    it.el.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); if(it.el.__held){ it.el.__held=false; return; } tick(); });
    /* 0.3.29 (Andrew 11:36): tap ticks; hold (or right-click) brings up the menu */
    if(it.id.startsWith('q:')) holdMenu(it.el,()=>{ if(window.__qMenu) window.__qMenu(it.el,()=>tick(),it.on()); }); });
  document.querySelectorAll('.qid.auto').forEach(el=>el.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); if(window.__qMenu) window.__qMenu(el,null,false); }));
  progress(); gateLadder(true);
  const go=()=>{ if(window.MarksSync){ const r=MarksSync.init(KEY,st,items); const after=()=>{ if(relabel()){ try{ LS.setItem(KEY,JSON.stringify(st)); }catch(e){} items.forEach(it=>{ if(it.id in st){ it.set(!!st[it.id]); if(moved.has(it.id)) MarksSync.push(KEY,st,it.id); } }); ['mv:B',(window.LADDER_MV2||{}).f].concat(Object.keys(window.LADDER_MVX||{}),Object.keys((window.LADDER_MV2||{}).m||{})).forEach(id=>{ if(moved.has(id)) MarksSync.push(KEY,st,id); }); } progress(); gateLadder(); }; if(r&&r.then) r.then(after,after); else after(); } };
  if(window.MarksSync) go(); else { const s=document.createElement('script'); s.src='sync.js'; s.onload=go; document.head.appendChild(s); }
  /* pull again whenever the page comes back into view, so a ✓ made on another device shows up without a reload */
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) go(); });
  window.addEventListener('pageshow',e=>{ if(e.persisted) go(); });
  if(items.length&&document.querySelector('.qid')){ const p=document.createElement('p'); p.className='marknote'; p.textContent='Tap a question’s label to tick it ✓; hold it to prompt from it or report it. Marks save in this browser and sync to the ladder’s record; I say in chat when one is earned.'; document.body.appendChild(p); }
}

/* desk */
function deskHTML(){
  const b=document.createElement('button'); b.id='deskbtn'; b.setAttribute('aria-label','open the desk: questions and a grapher'); b.textContent='☰ desk';
  const d=document.createElement('div'); d.id='desk'; d.setAttribute('role','dialog'); d.setAttribute('aria-label','desk');
  const qs=!!document.querySelector('.sayback');
  const hb=!!document.querySelector('section.basement'); /* 0.3.30 (Andrew 11:39): the basement is a Toolbox page */
  d.innerHTML='<div class="dtop"><button type="button" class="dback">← back</button><b class="dttl"></b><span class="dacct">'+(window.LadderAccount?LadderAccount.name:'')+'</span></div><div class="dname"><span class="dname-n" title="your name on this device">'+(window.LadderAccount?LadderAccount.name:'')+'</span><a class="dname-s" href="standing.html">Standing</a></div><div class="dtabs"><button data-p="keys">Quick Keys</button>'+(qs?'<button data-p="qs">Questions</button>':'')+'<button data-p="graph">Graph View</button><button data-p="moves">Techs Read</button><button data-p="rand">Laundry</button>'+(document.querySelector('.qid')?'<button type="button" class="dcross">Crosswalk</button>':'')+'<button type="button" class="dstick">Measuring Stick</button><button type="button" class="dstand">Answering Questions</button>'+(hb?'<button data-p="base">Cellar</button>':'')+'<button data-p="rec" class="dgear" aria-label="settings and record" title="settings and record">⚙</button>'+(document.querySelector('.wrap>section.class.step')&&false?'<button type="button" class="dfv">Page View</button>':'')+'<button type="button" class="dheights">Index</button><a class="dshare" href="install.html">Share the Ladder</a><button class="x" aria-label="close">✕</button></div>'
    +'<div class="dpane" id="dp-keys"><div id="dkeyshost"></div></div>'
    +(qs?'<div class="dpane" id="dp-qs"><p class="dnote">The page’s questions, here so you can read them beside the class.</p><div class="dq" id="dq"></div></div>':'')
    +'<div class="dpane" id="dp-graph"><div id="dgfig"></div><div id="dmg"></div><p class="dnote" style="margin-top:10px">Type it as on paper: x^2, 2sin(x), e^x, ln x, √x, |x|, x!. a, b, c and k get sliders.</p></div>'
    +'<div class="dpane" id="dp-moves">'+/* techhead */'<p class="dtdeck"><a class="dtdeck-b" href="moves.html">Tech Deck</a></p><p class="dnote" id="dmnote">The techs this step uses and builds: what each is called, what it does in words, and the line in symbols.</p><div id="dmoves"></div></div>'
    +'<div class="dpane" id="dp-rand">'+/* hangdry */'<p class="jogtxt" role="status" aria-label="the laundry is loading">'+'Hang Drying'.split('').map((c,i)=>c===' '?'<s>&nbsp;</s>':'<s aria-hidden="true" style="animation-delay:'+(i*70)+'ms">'+c+'</s>').join('')+'</p></div>'
    +(hb?'<div class="dpane" id="dp-base"><div id="dbase"></div></div>':'')+'<div class="dpane" id="dp-rec"><p class="dtheme"><span class="dnote">Display:</span> <button type="button" data-th="light">Light</button> <button type="button" data-th="dark">Dark</button></p><p class="dcomp"><label><input type="checkbox" class="reccomp"> Opt into competition</label><span class="dnote dcomp-n">Gives you a climber name and opens the Standing.</span></p><h4 class="drech">Record</h4><p class="recname"><span class="dnote">Your climber name:</span> <b class="dname-n">'+(window.LadderAccount?LadderAccount.name:'')+'</b> </p><p class="recrolls"><button type="button" class="dlink recroll">New Name</button> <button type="button" class="dlink recroll-a">New Animal</button> <button type="button" class="dlink recroll-p">New Place</button></p><p class="dnote">Everything the ladder remembers about your climb is one record, kept on this device. Save it as a file to keep a copy or to carry it to another device, and open that file there.</p><p><button type="button" class="dlink recx">save my record as a file</button></p><p><label class="dlink">open a record file <input type="file" accept=".json,application/json" class="reci" hidden></label></p><p><label class="dnote recai-l"><input type="checkbox" class="recai"> An AI assistant is connected</label></p><p><button type="button" class="dlink recdel">delete my progress</button></p><p class="dnote" id="recnote"></p></div>';
  document.body.append(b,d);
}

/* An integer rung is opened at the foot of its own page: an orange button that turns teal. */
function openRungButton(){
  /* 0.3.34 (Andrew 11:47): no "open the rung" button. A rung opens (open:rNN) once you pass its page: you move on from it,
     or your furthest footing is past it. */
  const pages=()=>{ try{ return JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){ return {}; } };
  const mark=stem=>{ const id='open:'+stem, p=pages(); if(p[id]&&p[id].v) return;
    if(window.MarksSync&&MarksSync.reportPage) MarksSync.reportPage(id,true,true,true,false);
    else { try{ p[id]={v:true,a:true,o:true,h:false,t:Date.now()}; LS.setItem('pages:done',JSON.stringify(p)); }catch(e){} } };
  let fur=null; try{ fur=JSON.parse(LS.getItem('ladder:furthest')||'null'); }catch(e){}
  const fm=fur&&fur.page&&String(fur.page).match(/^r(\d\d)(.*)$/);
  if(fm){ const top=+fm[1], beyond=fm[2]!==''; for(let r=0;r<top+(beyond?1:0);r++) mark('r'+String(r).padStart(2,'0')); }
  const m=PAGE.match(/^r(\d+)$/); if(!m) return;
  const stem=PAGE;
  document.addEventListener('click',e=>{ const a=e.target.closest&&e.target.closest('nav.nextrung a, .fvup:not(.fvsky)'); if(!a) return;
    mark(stem); },true); /* a rung page is one footing, so its next always moves on */
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

/* Beside the ladder: an orange ladder with the furthest rung measured or a floor passed,
   and a teal star with the number of rungs crowned. */
function ladderStats(){
  const rungs=document.querySelector('.rungs'); if(!rungs) return;
  let box=document.querySelector('.ladderstats');
  if(!box){
    box=document.createElement('div'); box.className='ladderstats'; box.setAttribute('role','status');
    box.innerHTML='<span class="ls ls-far" title="the furthest rung measured or a floor passed"><svg viewBox="0 0 20 28" width="18" height="25" aria-hidden="true"><path d="M5 1v26M15 1v26M5 6h10M5 12h10M5 18h10M5 24h10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><b class="ls-n">–</b><span class="ls-l">furthest rung passed</span></span><span class="ls ls-star" title="rungs crowned with the star"><span class="ls-s" aria-hidden="true">★</span><b class="ls-n">0</b><span class="ls-l">rungs starred</span></span>';
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
   gold stars = steps measured + rungs measured + floors measured;
   angel wings = rungs and floors with their blue star, their gold star and every standing question cleared.
   The shape of the ladder comes from ladmap.js (made from ladder.tsv). A rung's certification is its last core step's;
   the last rung of a floor is measured by the floor's measuring stick. */
function starCounts(){
  const M=window.LADMAP; if(!M) return null;
  let pages={}; try{ pages=JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){}
  let below=true; const certAt=k=>{ const c=certRead(k); return !!c&&(c.via!=='measure'||below); }, P=s=>pages[s]||{};
  const blueStep=s=>!!P(s).v, starStep=s=>!!(P(s).v&&P(s).o!==false), cleared=([s,n])=>!n||(+P(s).cd||0)>=n;
  let blue=0,gold=0,wings=0;
  M.forEach(([fl,rungs])=>{ let fB=rungs.length>0,fC=true; const cert=certAt, fG=cert('floor'+fl+'concl');
    rungs.forEach(([r,core,annex],i)=>{
      core.concat(annex).forEach(([s])=>{ if(blueStep(s)) blue++; if(cert(s)) gold++; });
      const rB=core.every(([s])=>starStep(s)), rG=i===rungs.length-1?fG:cert(core[core.length-1][0]), rC=core.every(cleared);
      if(rB) blue++; if(rG) gold++; if(rB&&rG&&rC) wings++;
      fB=fB&&rB; fC=fC&&rC; });
    if(fB) blue++; if(fG) gold++; if(fB&&fG&&fC) wings++; below=below&&fB; });
  return {blue,gold,wings};
}
/* starpop */ /* 2026-11-13 (Andrew 08:29Z): which step, rung or floor holds each mark, by its number, so the pop-up can name it */
function starLabel(s){ let m=String(s).match(/^r0*(\d+)([a-z])$/); if(m) return m[1]+m[2]; m=String(s).match(/^r0*(\d+)([a-z]{2,}\d*|cb\d+)$/); return m?m[1]+'·'+m[2]:String(s); }
function starUnits(){
  const M=window.LADMAP; if(!M) return null;
  let pages={}; try{ pages=JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){}
  let below=true; const cert=k=>{ const c=certRead(k); return !!c&&(c.via!=='measure'||below); }, P=s=>pages[s]||{};
  const blueStep=s=>!!P(s).v, starStep=s=>!!(P(s).v&&P(s).o!==false), cleared=([s,n])=>!n||(+P(s).cd||0)>=n;
  const blue=[],gold=[],wings=[];
  M.forEach(([fl,rungs])=>{ let fB=rungs.length>0,fC=true; const fG=cert('floor'+fl+'concl');
    rungs.forEach(([r,core,annex],i)=>{
      core.concat(annex).forEach(([s])=>{ if(blueStep(s)) blue.push(starLabel(s)); if(cert(s)) gold.push(starLabel(s)); });
      const rB=core.every(([s])=>starStep(s)), rG=i===rungs.length-1?fG:cert(core[core.length-1][0]), rC=core.every(cleared);
      if(rB) blue.push('rung '+r); if(rG) gold.push('rung '+r); if(rB&&rG&&rC) wings.push('rung '+r);
      fB=fB&&rB; fC=fC&&rC; });
    if(fB) blue.push('floor '+fl); if(fG) gold.push('floor '+fl); if(fB&&fG&&fC) wings.push('floor '+fl); below=below&&fB; });
  return {blue,gold,wings};
}
window.__starUnits=starUnits;
const ICON_L='<svg class="lb-L" viewBox="104 92 308 328" aria-hidden="true"><path d="M222,132 L384,358" stroke="#5fd13a" stroke-width="16" stroke-linecap="round"/><path fill="currentColor" d="M112,100 L262,100 L262,108 C238,108 225,112 223,136 L222,360 L360,360 C384,359 397,342 398,294 L405,294 L400,412 L112,412 L112,404 C134,404 149,399 150,378 L150,136 C149,112 136,108 112,108 Z"/><path d="M222,318 L264,318 L264,360" fill="none" stroke="#e8703a" stroke-width="16"/></svg>';
const ICON_X='<svg class="lb-X" viewBox="20 20 280 300" aria-hidden="true"><path d="M262,64 C220,118 130,226 66,292" fill="none" stroke="#5fd13a" stroke-width="18" stroke-linecap="round"/><path fill="currentColor" d="M38,92 C52,52 98,44 124,86 L216,262 C228,284 246,290 270,276 L276,286 C246,318 196,316 176,280 L88,112 C76,90 58,88 46,100 Z"/></svg>'; /* 0.3.23 (Andrew 10:54): Toolbox in the ladder's lettering, its x a large teal chi */
window.ICON_L_HTML='<span class="lb-l">'+ICON_L+'<span class="lb-w">adder</span></span>';
const WINGS='<svg viewBox="0 0 28 14" width="22" height="11" aria-hidden="true"><path fill="currentColor" d="M13.4 9.2C11 3.6 6.4.9.8.8c1 3 2.4 5 4.4 6.2-1 .5-1.7 1.1-2.2 1.9 1.9.9 3.8 1 5.2.7-.6 1-.8 2-.5 3.2 1.4.4 3.4-.2 5.7-3.6z"/><path fill="currentColor" transform="matrix(-1 0 0 1 28 0)" d="M13.4 9.2C11 3.6 6.4.9.8.8c1 3 2.4 5 4.4 6.2-1 .5-1.7 1.1-2.2 1.9 1.9.9 3.8 1 5.2.7-.6 1-.8 2-.5 3.2 1.4.4 3.4-.2 5.7-3.6z"/></svg>';

/* The ladder bar: sticky along the foot of every page. The ladder (home, with how far you have climbed),
   the keys, and the tray (the page's questions, a grapher, the quick moves, the randomizer). */
function ladderBar(){
  if(document.getElementById('lbar')) return;
  const home=!!document.querySelector('.rungs');
  const bar=document.createElement('nav'); bar.id='lbar'; bar.setAttribute('aria-label','the ladder bar');
  bar.innerHTML=(home?'<button type="button" class="lb lb-ladder"':'<a class="lb lb-ladder" href="index.html"')+' title="the ladder"><span class="lb-l" aria-label="Ladder">'+ICON_L+'<span class="lb-w">adder</span></span>'+(home?'</button>':'</a>')
    +'<span class="lb-counts" role="status"><span class="lc lc-blue" title="blue stars: steps with every footing question cleared, rungs with every step starred, floors with every rung starred"><span aria-hidden="true">★</span><b>0</b><span class="vh"> blue stars</span></span><span class="lc lc-gold" title="gold stars: steps, rungs and floors measured"><span aria-hidden="true">★</span><b>0</b><span class="vh"> gold stars</span></span><span class="lc lc-wing" title="angel wings: rungs and floors with their blue star, their gold star and every standing question cleared">'+WINGS+'<b>0</b><span class="vh"> angel wings</span></span></span>'
    +'<span class="lb-gap"></span>'+'<button type="button" class="lb lb-tray" title="the toolbox"><span class="lb-t" aria-label="Toolbox"><span class="lb-w">Toolbo</span>'+ICON_X+'</span></button>';
  document.body.appendChild(bar); document.body.classList.add('hasbar');
  const stats=()=>{ const v=starCounts(); if(!v) return;
    bar.querySelector('.lc-blue b').textContent=v.blue; bar.querySelector('.lc-gold b').textContent=v.gold; bar.querySelector('.lc-wing b').textContent=v.wings; };
  window.__barStats=stats;
  if(window.LADMAP) stats(); else { const sc=document.createElement('script'); sc.src='ladmap.js'; sc.onload=stats; document.head.appendChild(sc); }
  addEventListener('storage',e=>{ if(!e.key||e.key==='ladder:record') setTimeout(stats,0); });
  /* the Ladder button takes you to the footing you were last reading (0.2.1); the ladder itself is "dizzying heights" in the toolbox */
  const lb=bar.querySelector('.lb-ladder');
  lb.addEventListener('click',e=>{ if(window.LadderFV&&LadderFV.resume()){ e.preventDefault(); return; } if(home) climbTo(true); });
  const kb=null; /* 0.3.28 (Andrew 11:30): Quick Keys live only in the Toolbox */
  bar.querySelector('.lb-tray').onclick=()=>{ const b=document.getElementById('deskbtn'); if(b) b.click(); };
  const sync=()=>{ const t=document.getElementById('mk-tray'), d=document.getElementById('desk');
    if(kb){ kb.hidden=!!d||!t; kb.classList.toggle('on',!!(t&&t.classList.contains('open'))); }
    bar.querySelector('.lb-tray').classList.toggle('on',!!(d&&d.classList.contains('open'))); };
  new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']}); sync();
}
/* On the ladder, rung 0 is at the foot and the page opens where you are standing. */
function climbTo(smooth){
  if(window.LADDER_DESK) return deskScroll();
  let glide=null; try{ glide=sessionStorage.getItem('fv:glide'); sessionStorage.removeItem('fv:glide'); }catch(e){} if(climbTo.gliding&&!smooth) return; /* heights glide */
  try{ if(sessionStorage.getItem('sky:new')||window.__skyFresh) return; }catch(e){}
  /* 0.3.5 (Andrew 22:09): the index opens on your furthest footing; its step's footing list opens to show it */
  let h=null; const f=window.LadderFV&&LadderFV.furthest&&LadderFV.furthest();
  if(f&&f.page){ const pg=f.page.replace(/\.html$/,''); const fa=f.id&&f.id!=='top'&&f.id!=='end'?document.querySelector('.ladder a[href="'+pg+'.html#'+f.id+'"]'):null;
    if(fa){ const d=fa.closest('details'); if(d) d.open=true; h=fa.closest('li')||fa; }
    else { const ra=document.querySelector('.ladder a[href="'+pg+'.html"]'); if(ra) h=ra.closest('li')||ra; }
    if(h){ document.querySelectorAll('.fvhere,.fvrow').forEach(x=>x.classList.remove('fvhere','fvrow')); h.classList.add('fvhere'); const row=h.parentElement&&h.parentElement.closest('.ladder>li'); (row||h).classList.add('fvrow'); } } /* 0.3.36: the row carries the orange dot */
  if(!h) h=document.querySelector('.rungs .here')||document.querySelector('.rungs section.rung');
  while(h&&!h.offsetParent&&h.parentElement&&h.parentElement!==document.body) h=h.parentElement; /* 0.3.23: a hidden footing climbs to the row that shows it */
  if(glide&&!smooth&&h&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){
    /* the glide stops on the footing you opened the index from (the last one read); the orange dot stays on the furthest */
    let g=null; const l=window.LadderFV&&LadderFV.last&&LadderFV.last();
    if(l&&l.page){ const pg=String(l.page).replace(/\.html$/,''); const fa=l.id&&l.id!=='top'&&l.id!=='end'?document.querySelector('.ladder a[href="'+pg+'.html#'+l.id+'"]'):null;
      if(fa){ const d=fa.closest('details'); if(d) d.open=true; g=fa.closest('li')||fa; } else { const ra=document.querySelector('.ladder a[href="'+pg+'.html"]'); if(ra) g=ra.closest('li')||ra; }
      while(g&&!g.offsetParent&&g.parentElement&&g.parentElement!==document.body) g=g.parentElement;
      if(g&&!(g.closest&&g.closest('.rungs'))) g=null; }
    /* 09:39Z: three dots hold the screen until the page has finished loading and the glide is laid out, so the first frames are not shared with the page's own start-up work */
    climbTo.gliding=true; heightsHold(); const tgt=g||h;
    heightsReady(()=>{ let go=null; try{ go=heightsGlide(tgt); }catch(e){ heightsUndo(); tgt.scrollIntoView({block:'center'}); return; }
      requestAnimationFrame(()=>requestAnimationFrame(()=>{ const run=()=>{ try{ go(); }catch(e){ heightsUndo(); } heightsHold(false); }; if(window.requestIdleCallback) requestIdleCallback(run,{timeout:300}); else setTimeout(run,40); })); });
    return; }
  if(glide) heightsHold(false);
  if(h) h.scrollIntoView({block:'center',behavior:smooth?'smooth':'auto'});
}
/* heights glide */ /* 2026-11-13 (Andrew 08:51Z): the index loads in line by line while the view glides up the ladder to the footing
   you came from; the lines above it keep loading off screen. It starts at most a screen and a half below that footing (or at the foot). */
function heightsHold(on){ let d=document.getElementById('hg-hold');
  if(on===false){ if(d){ d.classList.add('hg-out'); setTimeout(()=>d.remove(),260); } return; }
  if(d||!document.body) return; d=document.createElement('div'); d.id='hg-hold'; d.setAttribute('aria-hidden','true'); d.innerHTML='<b class="hg-name" aria-hidden="true">'+'Dizzying Heights'.split('').map((c,i)=>c===' '?'<s>&nbsp;</s>':'<s style="animation-delay:'+(i*70)+'ms">'+c+'</s>').join('')+'</b>'; d.__t=Date.now(); document.body.appendChild(d);
  setTimeout(()=>{ if(d.isConnected&&!climbTo.gliding) heightsHold(false); },6000); }
window.__hgHold=heightsHold;
/* ready when the page has loaded and its fonts are in (at most 3 s), and the dots have shown for at least .45 s */
function heightsReady(cb){ let done=false; const d=document.getElementById('hg-hold'), t0=d&&d.__t||Date.now();
  const fire=()=>{ if(done) return; done=true; setTimeout(cb,Math.max(0,450-(Date.now()-t0))); };
  const fonts=()=>{ try{ if(document.fonts&&document.fonts.ready){ document.fonts.ready.then(fire,fire); return; } }catch(e){} fire(); };
  if(document.readyState==='complete') fonts(); else addEventListener('load',fonts,{once:true});
  setTimeout(fire,3000); }
function heightsUndo(){ climbTo.gliding=false; heightsHold(false); document.documentElement.classList.remove('hg-on','hg-wait'); document.querySelectorAll('.hg-in').forEach(e=>{ e.classList.remove('hg-in'); e.style.animationDelay=''; }); }
/* 09:25Z rebuild: nothing is steered frame by frame. The page is put where it will rest; the whole ladder is then slid there by one
   transform animation the browser runs off the main thread, and each line is given its own start time up front. Only the lines within
   reach (the glide's path and two and a half screens above the footing) take part, so a tall ladder costs no more than a short one. */
function heightsGlide(h){
  const wrap=document.querySelector('.wrap'); if(!wrap||!wrap.animate) throw 0;
  document.documentElement.classList.add('hg-on','hg-wait'); /* first, so a newly opened rung's own unfolding is settled before anything is measured */
  const vh=window.innerHeight, se=document.scrollingElement||document.documentElement, max=Math.max(0,se.scrollHeight-vh);
  let r=h.getBoundingClientRect(); const s1=Math.min(max,Math.max(0,r.top+window.scrollY+r.height/2-vh/2)); window.scrollTo(0,s1);
  const D=Math.min(max-window.scrollY,1.5*vh), T=D<2?0:1400+1600*D/vh, T1=Math.max(T,1000), sm=p=>p*p*p*(10-15*p+6*p*p); /* least-jerk ease: starts and stops at rest */
  const off=t=>T?D*(1-sm(Math.min(1,t/T))):0, front=t=>off(t)+vh*(1-.62*sm(Math.min(1,t/1000))); /* in screen px at rest: how far the ladder is displaced, and where the loading front stands */
  const els=[...document.querySelectorAll('.rungs .ladder>li')].filter(e=>e.offsetParent).map(e=>({e,b:e.getBoundingClientRect().bottom}))
    .filter(x=>x.b<D+vh+40&&x.b>-2.5*vh).sort((a,b)=>b.b-a.b);
  const rungs=document.querySelector('.rungs'); if(rungs&&!rungs.__hg){ rungs.__hg=1; rungs.addEventListener('animationend',e=>{ if(e.animationName==='hgIn'){ e.target.classList.remove('hg-in'); e.target.style.animationDelay=''; } }); }
  let t=0, tl=0; els.forEach(x=>{ while(t<T1&&front(t)>x.b-18) t+=16; let at=t; if(t>=T1){ tl=Math.max(tl+70,T1); at=tl; } else tl=t; x.e.style.animationDelay=Math.round(at)+'ms'; x.e.classList.add('hg-in'); });
  const end=()=>{ climbTo.gliding=false; document.documentElement.classList.remove('hg-on'); EV.forEach(k=>removeEventListener(k,quit)); };
  let an=null; const EV=['wheel','touchstart','keydown','mousedown'];
  const quit=()=>{ if(!an) return; let y=0; try{ y=new DOMMatrixReadOnly(getComputedStyle(wrap).transform).m42; }catch(e){} const a=an; an=null; a.cancel(); if(y) window.scrollBy(0,-y); end(); }; /* a touch takes over where the glide is */
  if(T){ const N=48, kf=[]; for(let k=0;k<=N;k++) kf.push({transform:'translate3d(0,'+(-off(T*k/N)).toFixed(2)+'px,0)'});
    an=wrap.animate(kf,{duration:T,easing:'linear',fill:'backwards'}); an.pause(); an.onfinish=()=>{ an=null; end(); }; an.oncancel=()=>{ if(an){ an=null; end(); } }; }
  /* everything above is laid out and held still (html.hg-wait pauses the lines); the caller starts it once the frame is quiet */
  return ()=>{ document.documentElement.classList.remove('hg-wait'); if(an){ an.play(); EV.forEach(k=>addEventListener(k,quit,{passive:true})); } else setTimeout(end,T1); };
}
try{ if(sessionStorage.getItem('fv:glide')&&document.querySelector('.rungs')&&!window.LADDER_DESK) heightsHold(); }catch(e){}
/* the desk: never jumps; it keeps where you were on the index between visits */
function deskScroll(){ if(deskScroll.done) return; deskScroll.done=1;
  let y=null; try{ y=JSON.parse(localStorage.getItem('desk:iscroll')||'null'); }catch(e){}
  if(typeof y==='number') [60,400,1200].forEach(t=>setTimeout(()=>window.scrollTo(0,y),t));
  let tk=0; window.addEventListener('scroll',()=>{ clearTimeout(tk); tk=setTimeout(()=>{ try{ localStorage.setItem('desk:iscroll',JSON.stringify(window.scrollY)); }catch(e){} },300); },{passive:true}); }

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
    if(document.querySelector('.rungs')){ if(window.LADDER_DESK) deskScroll(); else { window.__climbTo=climbTo; if(document.documentElement.classList.contains('lk-ready')) climbTo(false); } } /* 0.3.23: the lock reveals the list, then climbs once */
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
    const step=niceStep(); c.lineWidth=1; c.font='11px Nunito, system-ui, sans-serif'; c.fillStyle=col('--muted');
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
  const K=(window.__titledKey?__titledKey('desk:',document.title||''):'desk:'+(document.title||''));
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
  const TOOLS={qs:'Questions',graph:'Graph View',moves:'Techs Read',rand:'Laundry',base:'Cellar',rec:'Settings'};
  /* the page's basement, copied in once; ← back returns to the footing you were on */
  function fillBase(){ const h=document.getElementById('dbase'); if(!h||h.dataset.done) return; const b=document.querySelector('.wrap section.basement, section.basement'); if(!b) return;
    const c=b.cloneNode(true); c.classList.remove('shut'); c.removeAttribute('id'); c.querySelectorAll('[id]').forEach(e=>e.id='db-'+e.id); c.querySelectorAll('.blip').forEach(e=>e.remove()); c.hidden=false; c.style.display='';
    h.appendChild(c); h.dataset.done=1; }
  const hereOf=()=>{ const h=window.LadderFV&&LadderFV.here?LadderFV.here():null; const tag=(document.querySelector('header .tag, .stag')||{}).textContent||'';
    if(h&&h.id&&h.id!=='top'&&h.id!=='end') return {id:h.id,els:h.els,say:'footing '+h.id}; return {id:h&&h.id||'page',els:h&&h.els||null,say:(tag.trim()||'the page')}; };
  function dock(v){ const t=document.getElementById('mk-tray'), host=document.getElementById('dkeyshost'); if(!t||!host) return;
    if(v){ if(t.parentNode!==host) host.appendChild(t); t.classList.add('mk-docked'); if(window.MathKeys&&MathKeys.open) MathKeys.open(true); }
    else if(t.parentNode===host){ if(window.MathKeys&&MathKeys.open) MathKeys.open(false); t.classList.remove('mk-docked'); document.body.appendChild(t); } }
  function toolPage(p){ const on=!!TOOLS[p]; desk.classList.toggle('toolpage',on); document.body.classList.toggle('toolpage',on);
    if(on){ const h=hereOf(); desk.querySelector('.dttl').textContent=TOOLS[p]; desk.dataset.tool=p; desk.querySelector('.dback').textContent='← back to '+h.say;
      if(!(history.state&&history.state.tool)) try{ history.pushState({tool:p},''); }catch(e){} else try{ history.replaceState({tool:p},''); }catch(e){}
      desk.querySelector('.dpane.on')&&(desk.querySelector('.dpane.on').scrollTop=0); } }
  function show(p){ desk.querySelectorAll('.dtabs [data-p]').forEach(b=>b.classList.toggle('on',b.dataset.p===p)); desk.querySelectorAll('.dpane').forEach(d=>d.classList.toggle('on',d.id==='dp-'+p)); dock(p==='keys'); toolPage(p); if(p==='book') renderBook(); if(p==='qs') fillQs(); if(p==='base') fillBase(); if(p==='moves') fillMoves(); if(p==='graph') initGraph(); if(p==='rand') loadRand(); else if(window.MathKeys) MathKeys.limit(null); st.tab=p; save(); }
  window.addEventListener('popstate',()=>{ if(desk.classList.contains('toolpage')) open(false); });
  function loadRand(){ if(window.LadderRandomizer){ const bx=desk.querySelector('#dp-rand .rzbox'); if(bx) LadderRandomizer.render(bx); return; } const s=document.createElement('script'); s.src='randomizer.js'; document.head.appendChild(s); }
  function open(v){ if(!v&&window.MathKeys) MathKeys.limit(null); desk.classList.toggle('open',v); document.body.classList.toggle('deskopen',v); btn.textContent=v?'✕ desk':'☰ desk'; st.open=v; save(); if(v) show('keys'); else { dock(false); const was=desk.classList.contains('toolpage'); toolPage(null); if(was&&history.state&&history.state.tool) try{ history.back(); }catch(e){} } }
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
  desk.querySelector('.dback').onclick=()=>open(false);
  desk.querySelectorAll('.dtabs [data-p]').forEach(b=>b.onclick=()=>show(b.dataset.p));
  /* toolbox gear */ (function(){ const R=document.documentElement, eff=()=>R.getAttribute('data-theme')||(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
    const mark=()=>desk.querySelectorAll('.dtheme [data-th]').forEach(b=>{ const on=b.dataset.th===eff(); b.classList.toggle('on',on); b.setAttribute('aria-pressed',on?'true':'false'); });
    desk.querySelectorAll('.dtheme [data-th]').forEach(b=>b.onclick=()=>{ R.setAttribute('data-theme',b.dataset.th); try{ localStorage.setItem('ladder:theme',b.dataset.th); }catch(e){} mark(); }); mark();
    const mv=document.getElementById('dp-moves'), gb=desk.querySelector('.dtabs [data-p="graph"]');
    if(mv&&gb){ const p=document.createElement('p'); p.className='dinner'; p.innerHTML='<button type="button" class="dgraphin">Graph View</button>'; p.firstChild.onclick=()=>gb.click(); mv.prepend(p); }
    const sync=()=>{ const i=desk.querySelector('.dgraphin'); if(i&&gb) i.parentNode.hidden=gb.classList.contains('lk-hide');
      const m=desk.querySelector('.dtabs [data-p="moves"]'), gp=document.getElementById('dp-graph'); if(m&&gp&&gp.classList.contains('on')) m.classList.add('on');
      const an=desk.querySelector('.dannex'), ba=desk.querySelector('.dtabs [data-p="base"]'); if(ba) ba.classList.toggle('tb-in',!!(an&&!an.classList.contains('lk-hide'))); };
    document.addEventListener('click',()=>setTimeout(sync,0)); [300,1200,3000,7000].forEach(ms=>setTimeout(sync,ms)); })();
  const dfv=desk.querySelector('.dfv'); if(dfv) dfv.onclick=()=>{ open(false); if(window.LadderFV&&LadderFV.toggle) LadderFV.toggle(); };
  const dx=desk.querySelector('.dcross'); if(dx) dx.onclick=()=>{ open(false); if(window.LadderCards) LadderCards.open(); else if(typeof toast==='function') toast('the crosswalk is loading'); };
  const dsk=desk.querySelector('.dstick'); if(dsk) dsk.onclick=()=>{ open(false); if(window.LadderMeasure) LadderMeasure.list(); };
  const dsq=desk.querySelector('.dstand'); if(dsq) dsq.onclick=()=>{ open(false); if(window.LadderStanding) LadderStanding.list(); else if(typeof toast==='function') toast('the standing questions are loading'); };
  const dh=desk.querySelector('.dheights'); if(dh) dh.onclick=()=>{ open(false); if(window.LadderFV) LadderFV.heights(); else location.href='index.html'; };
  const rx=desk.querySelector('.recx'), ri=desk.querySelector('.reci'), rn=desk.querySelector('#recnote');
  if(rx) rx.onclick=()=>LadderRecord.export();
  const ra=desk.querySelector('.recai'); if(ra){ try{ ra.checked=localStorage.getItem('ladder:assistant')==='1'; }catch(_){} ra.onchange=()=>{ try{ if(ra.checked) localStorage.setItem('ladder:assistant','1'); else localStorage.removeItem('ladder:assistant'); }catch(_){} toast(ra.checked?'paragraph addresses now offer prompt from':'prompt from is hidden in paragraph addresses'); }; }
  [['.recroll',''],['.recroll-a','animal'],['.recroll-p','place']].forEach(x=>{ const b=desk.querySelector(x[0]); if(b) b.onclick=()=>{ if(window.LadderAccount&&LadderAccount.reroll){ const n=LadderAccount.reroll(x[1]); if(rn) rn.textContent='Your name is now '+n+'.'; } }; });
  const rc=desk.querySelector('.reccomp'); if(rc){ try{ rc.checked=localStorage.getItem('ladder:compete')==='1'; }catch(_){}
    rc.onchange=()=>{ try{ if(rc.checked){ localStorage.setItem('ladder:compete','1'); document.documentElement.setAttribute('data-compete','1'); } else { localStorage.removeItem('ladder:compete'); document.documentElement.removeAttribute('data-compete'); } }catch(_){}
      if(rn) rn.textContent=rc.checked?'You are in. Your climber name is '+(window.LadderAccount?LadderAccount.name:'')+'. The Standing is at the top of the toolbox.':'You are out of the competition. Your name is kept if you come back.'; }; }
  const rd=desk.querySelector('.recdel'); if(rd) rd.onclick=()=>{ if(!confirm('Delete your progress? You will lose all your progress: every footing, star, measure, standing question and note on this device. Save your record as a file first if you may want it back.')) return;
    LadderRecord.erase(); try{ sessionStorage.clear(); }catch(x){} rn.textContent='Progress deleted. Reloading…'; setTimeout(()=>location.href='index.html',400); };
  if(ri) ri.onchange=()=>{ const f=ri.files[0]; if(!f) return; f.text().then(t=>{ const o=JSON.parse(t);
    if(!confirm('Replace the record on this device with the one in this file?')) return;
    LadderRecord.import(o); rn.textContent='Record opened. Reloading…'; setTimeout(()=>location.reload(),400); }).catch(()=>{ rn.textContent='That file is not a ladder record.'; }); };
  let G=null, GK=''; function initGraph(){ if(!window.MathGraph) return; const h=hereOf(), k='fg:'+(window.LADDER_PAGE||location.pathname.split('/').pop().replace(/\.html$/,''))+':'+h.id;
    const fig=document.getElementById('dgfig'); fig.innerHTML='';
    const big=x=>x.tagName!=='svg'||x.getBoundingClientRect().width>60||+x.getAttribute('width')>60||!!x.getAttribute('viewBox');
    const pics=h.els?[].concat(...h.els.map(el=>[...el.querySelectorAll('svg,img,figure')])).filter(x=>!x.parentElement.closest('figure')).filter(x=>!x.closest('.katex,button,.qid,nav')&&big(x)):[];
    if(pics.length){ const n=document.createElement('p'); n.className='dnote'; n.textContent='The figure'+(pics.length>1?'s':'')+' on '+h.say+':'; fig.appendChild(n); pics.slice(0,4).forEach(x=>{ const c=x.cloneNode(true); c.removeAttribute('id'); c.classList.add('dgpic'); fig.appendChild(c); }); }
    if(G&&GK===k){ G.redraw(); return; }
    const seed=footCurves(h.els); document.getElementById('dmg').innerHTML='';
    G=MathGraph(document.getElementById('dmg'),{key:k,height:280,seed:seed.length?seed.concat(['','']).slice(0,3):['x^2','','']}); GK=k;
    const n=document.createElement('p'); n.className='dnote'; n.textContent=seed.length?'Seeded with the curve'+(seed.length>1?'s':'')+' '+h.say+' names. Change them, or add your own; this footing keeps what you build.':'Build up to three curves here; this footing keeps what you build.'; document.getElementById('dmg').prepend(n); }
  /* curves a footing names (y = …, f(x) = …) in its TeX or its words, turned into the grapher's typing and kept only if the grapher can draw them */
  function footCurves(els){ if(!els||!window.MathGraph) return []; const src=[];
    els.forEach(el=>{ [el,...el.querySelectorAll('[data-tex],[data-tex-inline],[data-t]')].forEach(n=>{ const v=n.getAttribute&&(n.getAttribute('data-tex')||n.getAttribute('data-tex-inline')||n.getAttribute('data-t')); if(v) src.push(v); });
      el.querySelectorAll('annotation').forEach(a=>src.push(a.textContent));
      const c=el.cloneNode(true); c.querySelectorAll('.katex,script,style,.qid,nav,button').forEach(n=>n.remove()); src.push(c.textContent); });
    const SUPS={'²':'^2','³':'^3','⁴':'^4','½':'(1/2)'}, FN=/^(sin|cos|tan|ln|log|exp|sqrt|abs|pi)$/;
    const plain=s=>{ let o=s.replace(/\\(left|right|displaystyle|,|;|!|quad|qquad)/g,' ').replace(/\\cdot|\\times/g,'*').replace(/\\operatorname\{(\w+)\}/g,'$1');
      for(let i=0;i<6;i++) o=o.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g,'(($1)/($2))').replace(/\\sqrt\{([^{}]*)\}/g,'√($1)').replace(/\^\{([^{}]*)\}/g,'^($1)');
      o=o.replace(/\\(sin|cos|tan|ln|log|exp|pi)\b/g,'$1').replace(/[{}]/g,'').replace(/[²³⁴½]/g,m=>SUPS[m]).replace(/−/g,'-').replace(/\s+/g,' ').trim();
      const w=o.split(' '); let k=w.length; for(let i=0;i<w.length;i++){ const m=w[i].replace(/[^A-Za-z]/g,''); if(m.length>=2&&!FN.test(m)){ k=i; break; } if(/[.?!]$/.test(w[i])&&!/\d\.$/.test(w[i])){ w[i]=w[i].replace(/[.?!]+$/,''); k=i+1; break; } }
      o=w.slice(0,k).join(' ').replace(/[\s(.?!]+$/,'');
      let d=0; for(const ch of o){ if(ch==='(') d++; else if(ch===')') d--; } while(d<0&&/\)$/.test(o)){ o=o.slice(0,-1); d++; }
      return d===0?o:''; };
    const out=[], RX=/(?:^|[^A-Za-z\\])(?:y|[a-z]\s*\(\s*x\s*\))\s*=\s*([^=\n,;:@]+?)(?=\\quad|\\qquad|\\text|\\\\|,|;|:|@|\n|=|$)/g;
    src.join('\n').replace(RX,(m,r)=>{
      const e=plain(r); if(!e||!/x/.test(e)||/[\\_∘→]/.test(e)||e.length>40||out.includes(e)||out.length>=3) return m;
      try{ const q=MathGraph.parse(e); if(q&&q.f&&(q.params||[]).every(p=>'abck'.includes(p))){ const v=q.f({x:0.7,a:1,b:1,c:0,k:1}); if(typeof v==='number'&&isFinite(v)) out.push(e); } }catch(x){} return m; });
    return out; }
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
  const t=document.querySelector('header.top .tags .tag');
  /* 2026-11-10 (Andrew 11:01): floor and rung pages carry no tag line, so their paragraphs had no addresses and no edit menu; the file name labels them (floor1 -> F1, r00 -> 0) */
  if(!t){ const pg=window.LADDER_PAGE||(location.pathname.split('/').pop()||'').replace(/\.html?$/,''); const m=/^(floor(\d+)|r(\d\d))$/.exec(pg); if(!m) return null; return {label:m[2]?'F'+m[2]:String(Number(m[3])),kind:''}; }
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
    /* the step's crosswalk cards: at the foot only, between previous and next, below the questions and above the basement */
    const mid=home; /* 0.2.1: the cards are the crosswalk, opened from the toolbox */
    n.innerHTML=b(prev,'prev','← previous')+mid+b(next,'next','next →');
    const c=n.querySelector('.cards'); if(c) c.addEventListener('click',()=>{ if(window.LadderCards) LadderCards.open(); else toast('crosswalk cards are loading'); });
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
  const ps=[...document.querySelectorAll('header.top > p[data-pid], section.class p[data-pid]')].filter(p=>!(p.hasAttribute('data-collapsed')||!p.textContent.replace(/\s+/g,''))); if(!ps.length) return;
  const per={};
  ps.forEach((p,i)=>{ const top=!!p.closest('header.top'), st=p.closest('section.step'), k=top?info.label+'.top':(st?st.dataset.step:info.label); per[k]=(per[k]||0)+1; const ad=top?k+'.'+per[k]:k+'.0.'+per[k]; p.dataset.addr=ad; p.id=p.id||'p-'+p.dataset.pid;
    const b=document.createElement('button'); b.type='button'; b.className='pa'; b.textContent=ad; b.setAttribute('aria-label','paragraph '+ad+': report or leave a note');
    b.addEventListener('click',e=>{ e.stopPropagation(); openMenu(p,b); }); p.appendChild(document.createTextNode(' ')); p.appendChild(b); });
  menu=document.createElement('div'); menu.className='pamenu'; menu.hidden=true;
  menu.innerHTML='<button type="button" data-a="prompt">prompt from</button><button type="button" data-a="report">report</button><button type="button" data-a="note">leave a note</button><button type="button" data-a="final" hidden>final pass</button><button type="button" data-a="fold" hidden>collapse</button>';
  document.body.appendChild(menu);
  menu.addEventListener('click',e=>{ const a=e.target.dataset.a; if(!a||!cur) return; const ad=cur.dataset.addr;
    const text=[...cur.childNodes].filter(n=>!(n.classList&&n.classList.contains('pa'))).map(n=>n.textContent).join('').trim();
    if(a==='prompt'){ copy('About paragraph '+ad+' of the ladder, which reads: “'+text+'”\n\n'); toast('paragraph '+ad+' and its words are copied: paste them to your assistant and ask'); }
    if(a==='edit'){ menu.hidden=true; startEdit(cur); return; }
    if(a==='fold'){ menu.hidden=true; edFold(cur); return; } /* Phase G */
    if(a==='final'){ menu.hidden=true; markFinal(cur); return; }
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
/* ===== The account name (Andrew 2026-11-11 13:22Z): "a once randomized name consisting of an animal native to pnw or the north
   pacific/salish sea, a location from my approved location pool (towns, geologic features, hydrologic features) and 2 digit number
   with a randomized 12 digit hex hash hiding in the code". Drawn once on this device and kept outside the progress record, so
   Delete Progress does not change who the learner is. The name is shown; the hash is not: it rides in reports and in the record. */
(function(){
  const ANIMALS=('Orca Otter Salmon Heron Osprey Marmot Elk Cougar Raven Puffin Murre Sculpin Lingcod Halibut Geoduck Limpet Chiton Urchin Anemone Nudibranch '
    +'Octopus Porpoise Seal Humpback Minke Beaver Marten Fisher Pika Wolverine Lynx Bobcat Coyote Wolf Bear Deer Newt Salamander Treefrog Kingfisher '
    +'Dipper Eagle Murrelet Auklet Oystercatcher Loon Grebe Scoter Goldeneye Bufflehead Harlequin Steelhead Sturgeon Lamprey Smelt Herring Rockfish Greenling '
    +'Dogfish Skate Ratfish Crab Shrimp Barnacle Mussel Oyster Clam Cockle Sandpiper Dunlin Turnstone Jay Chickadee Wren Nuthatch Flicker Owl Grouse '
    +'Ptarmigan Swift Swallow Thrush Junco Towhee Hummingbird Bat Vole Shrew Mole Squirrel Chipmunk Porcupine Raccoon Mink Weasel Ermine Muskrat Seastar '
    +'Gull Cormorant Guillemot Albatross Shearwater Fulmar Kittiwake').split(' ');
  const PLACES=[ /* towns */ 'Salinas','Monterey','Astoria','Tillamook','Wenatchee','Modesto','Merced','Truckee','Auburn','Placerville','Bend','Yakima','Ellensburg','Tofino','Anacortes',
    'Bellingham','Olympia','Tacoma','Eugene','Ashland','Eureka','Arcata','Mendocino','Sonora','Mariposa','Newport','Coos Bay','Port Townsend','Sequim','Nanaimo','Victoria','Squamish',
    'Hood River','The Dalles','Leavenworth','Winthrop','Sisters','Redding','Chico','Petaluma','Santa Cruz',
    /* geologic features */ 'Rainier','Mount Hood','Shasta','Mount Baker','Mount Adams','Saint Helens','Lassen','Olympus','Half Dome','El Capitan','Cape Flattery','Cape Disappointment',
    'Point Reyes','Big Sur','Glacier Peak','Three Sisters','Smith Rock','Beacon Rock','Haystack Rock','Tamalpais','Garibaldi','Mount Lyell','Desolation Peak',
    /* hydrologic features */ 'Columbia','Willamette','Skagit','Klamath','Rogue','Umpqua','Fraser','Tuolumne','Stanislaus','Sacramento','Deschutes','Puget Sound','Hood Canal','Juan de Fuca',
    'Deception Pass','Chelan','Tahoe','Crater Lake','Willapa Bay','Grays Harbor','Tomales Bay','Humboldt Bay','Desolation Sound','Haro Strait','Rosario Strait','Elwha','Hoh','Quinault',
    'Nisqually','Snoqualmie','Skykomish','Nooksack','Yuba','Multnomah Falls','Yosemite Falls','Spirit Lake'];
  const KEY='__ladder_account';
  const rnd=n=>{ try{ const a=new Uint32Array(1); crypto.getRandomValues(a); return a[0]%n; }catch(e){ return Math.floor(Math.random()*n); } };
  const hex12=()=>{ let s=''; for(let i=0;i<12;i++) s+='0123456789abcdef'[rnd(16)]; return s; };
  let a=null, st=null; try{ st=window.localStorage; a=JSON.parse(st.getItem(KEY)||'null'); }catch(e){}
  const draw=()=>ANIMALS[rnd(ANIMALS.length)]+' '+PLACES[rnd(PLACES.length)]+' '+(10+rnd(90));
  if(!a||!a.id||!a.name){ a={name:draw(), id:hex12(), t:Date.now()}; try{ st.setItem(KEY,JSON.stringify(a)); }catch(e){} }
  window.LadderAccount={name:a.name, id:a.id, since:a.t,
    /* Andrew 2026-11-11 18:33Z: a new name on request; the id and the start date stay */
    reroll(part){ const t=String(a.name).split(' '), cur=[t[0],t.slice(1,-1).join(' '),t[t.length-1]];
      const mk=()=>part==='animal'?ANIMALS[rnd(ANIMALS.length)]+' '+cur[1]+' '+cur[2]:part==='place'?cur[0]+' '+PLACES[rnd(PLACES.length)]+' '+cur[2]:draw();
      let n=mk(), k=0; while(n===a.name&&k++<5) n=mk(); a.name=n; try{ st.setItem(KEY,JSON.stringify(a)); }catch(e){} this.name=n;
      try{ document.querySelectorAll('.dname-n,.dacct').forEach(e=>{ e.textContent=n; }); }catch(e){} return n; } };
  try{ document.querySelectorAll('.dname-n,.dacct').forEach(e=>{ e.textContent=a.name; }); }catch(e){} /* the toolbox may be built before the name is drawn */
  try{ document.documentElement.setAttribute('data-acct',a.id); }catch(e){}
})();
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
      const meta=['page: '+page+(tag?' ('+tag.trim()+')':''),'where: '+(m.kind==='page'?'the page as a whole':m.kind+' '+m.where)+(m.pid?' · pid '+m.pid:''),(m.text?'it reads: '+m.text.slice(0,300)+(m.text.length>300?'…':''):''),(window.LadderAccount?'account: '+LadderAccount.name+' · '+LadderAccount.id:''),'sent: '+new Date().toISOString(),'screen: '+window.innerWidth+'×'+window.innerHeight].filter(Boolean).join('\n');
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
  qmenu.innerHTML=(tick?'<button type="button" data-a="tick">'+(on?'take off the ✓':'tick ✓')+'</button>':'')+'<button type="button" data-a="prompt">prompt from</button><button type="button" data-a="report">report</button>'
    +(window.LADDER_DESK&&ED.owner&&li&&li.closest('.stql,.chq,.sayback')?'<button type="button" data-a="qedit">edit</button>':'');
  qmenu.onclick=e=>{ const a=e.target.dataset.a; if(!a) return; qmenu.hidden=true;
    if(a==='tick') tick();
    if(a==='qedit') txStartQ(li);
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
function edWait(){ return Promise.resolve(false); return new Promise(res=>{ let n=0; (function t(){ if(window.claude&&typeof window.claude.use==='function') return res(true); if(++n>120) return res(false); setTimeout(t,250); /* 2026-11-09: wait up to 30 s for the host */ })(); }); }
/* 0.3.42 (Andrew 18:28): a paragraph with inline maths is editable too. Each inline formula is one locked piece in the editor
   (it can be moved past or deleted, not changed), and is saved back as its TeX source. Display maths and code stay out. */
function editable(p){ if(p.querySelector('[data-tex],code')) return false; return [...p.querySelectorAll('.katex')].every(k=>k.closest('[data-tex-inline]')); }
function edTex(p){ p.querySelectorAll('[data-tex-inline]').forEach(el=>{ if(el.querySelector('.katex')) return; const t=el.getAttribute('data-tex-inline'); try{ if(window.katex){ katex.render(t,el,{throwOnError:false,strict:false,trust:true,displayMode:false}); return; } }catch(_){} el.textContent=t; }); }
const ED_OK={B:1,STRONG:1,I:1,EM:1,A:1,SUP:1,SUB:1,BR:1};
function edClean(node){ const out=document.createElement('div');
  (function walk(src,dst){ src.childNodes.forEach(n=>{
    if(n.nodeType===3){ dst.appendChild(document.createTextNode(n.textContent)); return; }
    if(n.nodeType!==1||(n.classList&&n.classList.contains('pa'))||/^(SCRIPT|STYLE|TEMPLATE)$/.test(n.tagName)) return;
    if(n.hasAttribute&&n.hasAttribute('data-tex-inline')){ const t=n.getAttribute('data-tex-inline'), e=document.createElement('span'); e.setAttribute('data-tex-inline',t); e.textContent=t; dst.appendChild(e); return; }
    if(ED_OK[n.tagName]){ const e=document.createElement(n.tagName.toLowerCase()); if(n.tagName==='A'){ const h=n.getAttribute('href')||''; if(/^(https?:|[\w.-]+\.html)/.test(h)) e.setAttribute('href',h); } dst.appendChild(e); walk(n,e); }
    else walk(n,dst); }); })(node,out);
  return out.innerHTML.replace(/\s+/g,' ').trim(); }
function edApply(p,html){ const b=p.querySelector('button.pa'); const tmp=document.createElement('div'); tmp.innerHTML=html;
  p.innerHTML=edClean(tmp); edTex(p); if(b){ p.appendChild(document.createTextNode(' ')); p.appendChild(b); } p.classList.add('pedited'); if(!p.textContent.replace(/\s+/g,'')) p.setAttribute('data-collapsed','1'); /* Phase G: emptied = collapsed, never deleted */ }
/* 2026-11-09 (Andrew 16:47 "it always says the updates failed"): the write lands but set() often does not answer within the
   10 s, so every save said "not saved yet". Now a slow set() is followed by reading the document back: if the stored time stamp is
   the one just written, the save is confirmed. Only when neither answers is it "not saved yet". */
async function edPut(path,rec){ const ref=ED.db.doc(path); let done=false; let fail=null; const w=ref.set(rec); w.then(()=>{ done=true; },e=>{ fail=e||new Error('refused'); });
  /* 2026-11-09 (Andrew 16:49): the box stays open only until the edit is seen in the queue. From 1.2 s on, the document is read
     back every 1.5 s while set() is still silent; the first answer that matches the time stamp just written closes the box. */
  const seen=async()=>{ try{ const s=await Promise.race([ref.get(),new Promise((_,rj)=>setTimeout(()=>rj(0),4000))]); const v=s&&(typeof s.data==='function'?s.data():s)||null; return !!(v&&v.at===rec.at); }catch(e){ return false; } };
  const t0=Date.now(); await new Promise(r=>setTimeout(r,1200));
  while(Date.now()-t0<20000){ if(done) return null; if(fail&&!(await seen())) return {code:'refused',msg:String(fail.message||fail.code||fail)}; if(await seen()) return null; await new Promise(r=>setTimeout(r,1500)); if(done) return null; }
  return {code:'no answer in 20 seconds',msg:'no answer in 20 seconds'}; }
/* ---- the outbox (2026-11-09 17:03). ladder:pending-edits holds every edit not yet confirmed in the database, by pid (text edits
   by their tx id, sent by txInit). edSync drains it in the background: one edPut per record, newest copy of each pid, the badge
   counting what still waits. It never blocks the editor. */
/* 2026-11-10 (Andrew 11:55): the waiting edits as Markdown, one section per edit, for the sweep */
function edMdText(html){ const d=document.createElement('div'); d.innerHTML=html||''; d.querySelectorAll('button.pa').forEach(x=>x.remove()); d.querySelectorAll('br').forEach(x=>x.replaceWith('\n')); d.querySelectorAll('b,strong').forEach(x=>{ x.replaceWith('**'+x.textContent+'**'); }); d.querySelectorAll('i,em').forEach(x=>{ x.replaceWith('*'+x.textContent+'*'); }); d.querySelectorAll('[data-tex-inline]').forEach(x=>{ x.replaceWith('$'+x.getAttribute('data-tex-inline')+'$'); }); return d.textContent.replace(/\n{3,}/g,'\n\n').trim(); }
function edMarkdown(){ const m=edOutAll(); const ks=Object.keys(m).sort((a,b)=>String(m[a].at||'').localeCompare(String(m[b].at||''))); const out=['# Ladder desk edits · '+ks.length+' waiting · '+new Date().toISOString()];
  for(const k of ks){ const r=m[k]||{}; if(r.kind==='text'){ out.push('','## '+(r.page||'?')+' · text · '+k+' · '+(r.at||''),'old: '+(r.old_text||''),'new: '+(r.new_text||'')); continue; }
    const p=document.querySelector('[data-pid="'+k+'"]'); const ad=p&&p.dataset.addr?' · '+p.dataset.addr:''; out.push('','## '+(r.page||'?')+' · '+k+ad+' · '+(r.at||'')+(('collapsed' in r)?(r.collapsed?' · collapsed':' · uncollapsed'):''), typeof r.html==='string'?(edMdText(r.html)||'(emptied)'):''); }
  return out.join('\n'); }
function edShowMd(md){ let ok=false; try{ navigator.clipboard.writeText(md).then(()=>toast('edits copied as text · paste them to Claude'),()=>{}); ok=true; }catch(_){}
  let box=document.getElementById('edmd'); if(!box){ box=document.createElement('div'); box.id='edmd'; box.style.cssText='position:fixed;left:10px;right:10px;bottom:calc(var(--lbh,48px) + 52px);z-index:9600;background:#fff;border:1px solid rgba(0,0,0,.2);border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,.2);padding:8px;font:.78rem/1.3 system-ui,sans-serif;max-height:50vh;display:grid;gap:6px'; box.innerHTML='<div><b>Waiting edits as text</b> · select all and copy, paste to Claude <button type="button" style="float:right">close</button><button type="button" class="edclr" style="float:right;margin-right:6px">clear all (folded)</button></div><textarea readonly style="width:100%;height:32vh;font:.72rem/1.3 ui-monospace,monospace"></textarea>'; box.querySelector('button').onclick=()=>box.remove(); box.querySelector('.edclr').onclick=e=>{ const b=e.currentTarget; if(!b.dataset.armed){ b.dataset.armed='1'; b.textContent='tap again to clear'; setTimeout(()=>{ b.dataset.armed=''; b.textContent='clear all (folded)'; },4000); return; } try{ localStorage.setItem('ladder:pending-edits','{}'); }catch(_){} edBadge(); box.remove(); toast('outbox cleared'); }; /* 2026-11-10 15:10: confirm() is blocked in the artifact frame; two taps instead */ document.body.appendChild(box); }
  const ta=box.querySelector('textarea'); ta.value=md; ta.focus(); ta.select(); if(!ok) toast('select the text and copy it'); }
function edOutAll(){ try{ return JSON.parse(localStorage.getItem('ladder:pending-edits')||'{}'); }catch(_){ return {}; } }
function edOutPut(rec){ try{ const m=edOutAll(); m[rec.pid]=rec; localStorage.setItem('ladder:pending-edits',JSON.stringify(m)); }catch(_){} edBadge(); }
function edBadge(){ if(!window.LADDER_DESK) return; const m=edOutAll(); const n=Object.keys(m).length;
  let b=document.getElementById('edout'); if(!n){ if(b){ b.textContent='no edits since the last sweep'; b.classList.add('ok'); setTimeout(()=>{ const x=document.getElementById('edout'); if(x&&x.classList.contains('ok')) x.remove(); },2500); } return; }
  if(!b){ b=document.createElement('button'); b.type='button'; b.id='edout'; b.title='edits made on this device since the last sweep · tap to copy them as text for Claude'; b.style.cssText='position:fixed;left:10px;bottom:calc(var(--lbh,48px) + 60px);z-index:9600;font:600 .72rem/1 system-ui,sans-serif;padding:6px 9px;border-radius:999px;border:1px solid rgba(0,0,0,.15);background:#fff6d6;color:#5a4a1a;box-shadow:0 1px 4px rgba(0,0,0,.15);cursor:pointer'; b.onclick=()=>{ const md=edMarkdown(); edShowMd(md); edSync(true); }; document.body.appendChild(b); }
  b.classList.remove('ok'); b.style.background=ED.db?'#fff6d6':'#f3e6e6'; const DM=window.LADDER_MAP||{}; b.textContent=(DM.desk?'desk '+DM.desk+(DM.commit?' · '+String(DM.commit).slice(0,7):'')+' · ':(DM.commit?String(DM.commit).slice(0,7)+' · ':''))+n+' edit'+(n===1?'':'s')+' since the last sweep · tap for the text'; }
let edSyncBusy=false, edSyncTimer=0;
async function edSync(now){ if(!window.LADDER_DESK) return; edBadge(); clearTimeout(edSyncTimer); if(edSyncBusy) return; edSyncBusy=true;
  try{ if(!ED.db){ try{ if(window.claude&&typeof window.claude.use==='function') ED.db=await Promise.race([edGetDb(),new Promise((_,rj)=>setTimeout(()=>rj(0),15000))]); }catch(_){ ED.db=null; } if(ED.db){ ED.owner=true; document.body.classList.add('ed-owner'); } }
    if(ED.db){ const m=edOutAll(); for(const pid in m){ const r=m[pid]; if(!r||r.kind==='text') continue; const err=await edPut('edits/'+pid,r); if(err){ const msg=err.msg||err.code||'not sent'; if(ED.lastErr!==msg){ ED.lastErr=msg; toast('edit not sent · '+msg); } break; } ED.lastErr=''; const cur=edOutAll(); if(cur[pid]&&cur[pid].at===r.at){ delete cur[pid]; localStorage.setItem('ladder:pending-edits',JSON.stringify(cur)); try{ const dm=JSON.parse(localStorage.getItem('ladder:edit-drafts')||'{}'); delete dm[pid]; localStorage.setItem('ladder:edit-drafts',JSON.stringify(dm)); }catch(_){} } edBadge(); } } }
  finally{ edSyncBusy=false; edBadge(); const left=Object.keys(edOutAll()).filter(k=>{ const r=edOutAll()[k]; return !r||r.kind!=='text'; }).length; if(left) edSyncTimer=setTimeout(()=>edSync(),15000); } }
/* 2026-11-10 (Andrew 12:08): an edit that already stands in the published page was swept; drop it from the device */
function edNorm(html){ const d=document.createElement('div'); d.innerHTML=html||''; d.querySelectorAll('button.pa,.pebar').forEach(x=>x.remove()); return d.textContent.replace(/\s+/g,' ').trim(); }
const ED_SWEPT='2026-11-10T15:00:00Z'; /* the last sweep: Andrew's 0a paste, folded in 0.3.103; desk-map.js "swept" overrides when later */
function edSwept(){ const DM=window.LADDER_MAP||{}; return [ED_SWEPT,String(DM.swept||'')].sort().pop(); }
function edSweepClear(){ const m=edOutAll(); let gone=0; const sw=edSwept(); for(const k in m){ const r=m[k]; if(r&&r.at&&String(r.at)<=sw){ delete m[k]; gone++; } }
  for(const k in m){ const r=m[k]; if(!r||r.page!==ED.page) continue;
    if(r.kind==='text'){ const want=String(r.new_text||'').replace(/\s+/g,' ').trim(); if(want&&document.body.textContent.replace(/\s+/g,' ').indexOf(want)>=0){ delete m[k]; gone++; } continue; }
    const p=document.querySelector('p[data-pid="'+k+'"],li[data-pid="'+k+'"]'); if(!p) continue; const same=(typeof r.html!=='string')||edNorm(r.html)===edNorm(p.innerHTML); const col=('collapsed' in r)?(!!r.collapsed===p.hasAttribute('data-collapsed')):true; const emptied=(typeof r.html==='string'&&!edNorm(r.html)&&(p.hasAttribute('data-collapsed')||!edNorm(p.innerHTML)));
    if((same&&col)||emptied){ delete m[k]; gone++; } }
  if(gone){ try{ localStorage.setItem('ladder:pending-edits',JSON.stringify(m)); }catch(_){} } return gone; }
/* 2026-11-10 (Andrew 14:53): the other pages' entries are compared with the published site too, in the background */
async function edSweepAll(){ const m=edOutAll(); const pages=[...new Set(Object.values(m).map(r=>r&&r.page).filter(p=>p&&p!==ED.page))]; if(!pages.length) return; const SITE='https://ladder-heavenward.github.io/Heavenward-Ladder/'; let gone=0;
  for(const pg of pages){ let doc=null; try{ const r=await fetch(SITE+pg+'.html',{cache:'no-store',mode:'cors'}); if(!r.ok) continue; doc=new DOMParser().parseFromString(await r.text(),'text/html'); }catch(_){ continue; }
    const cur=edOutAll(); const bodyText=(doc.body&&doc.body.textContent||'').replace(/\s+/g,' ');
    for(const k in cur){ const r=cur[k]; if(!r||r.page!==pg) continue;
      if(r.kind==='text'){ const want=String(r.new_text||'').replace(/\s+/g,' ').trim(); if(want&&bodyText.indexOf(want)>=0){ delete cur[k]; gone++; } continue; }
      const p=doc.querySelector('p[data-pid="'+k+'"],li[data-pid="'+k+'"]'); const emptiedGone=(typeof r.html==='string'&&!edNorm(r.html)&&(!p||p.hasAttribute('data-collapsed')));
      if(!p){ if(emptiedGone){ delete cur[k]; gone++; } continue; }
      const same=(typeof r.html!=='string')||edNorm(r.html)===edNorm(p.innerHTML); const col=('collapsed' in r)?(!!r.collapsed===p.hasAttribute('data-collapsed')):true;
      if((same&&col)||emptiedGone){ delete cur[k]; gone++; } }
    try{ localStorage.setItem('ladder:pending-edits',JSON.stringify(cur)); }catch(_){} }
  if(gone){ edBadge(); toast(gone+' edit'+(gone===1?'':'s')+' already in the published ladder, cleared'); } }
function edLocal(){ /* the outbox laid over the page */ edSweepClear(); setTimeout(()=>{ edSweepAll().catch(()=>{}); },1500); const m=edOutAll(); let n=0; for(const pid in m){ const r=m[pid]; if(!r||r.kind==='text'||r.page!==ED.page) continue; const p=document.querySelector('p[data-pid="'+pid+'"],li[data-pid="'+pid+'"]'); if(p&&typeof r.html==='string'){ edApply(p,r.html); n++; } if(p&&'collapsed' in r){ if(r.collapsed) p.setAttribute('data-collapsed','1'); else p.removeAttribute('data-collapsed'); } } edBadge(); return n; }
if(window.LADDER_DESK){ ['online','focus'].forEach(ev=>addEventListener(ev,()=>{ if(Object.keys(edOutAll()).length) edSync(); })); document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&Object.keys(edOutAll()).length) edSync(); }); }
/* Phase G (Andrew 2026-11-09 16:29): collapse a paragraph instead of emptying it. The paragraph keeps its address and its screen
   (a stub in the app's swipe row); the flag is saved with the paragraph's current words as an edit, and the fold at release writes
   data-collapsed on the paragraph. An edit whose words are empty is read as collapsed too, never as a deletion. */
async function edFold(p){ if(!edOn()) return; const pid=p.dataset.pid; const was=p.hasAttribute('data-collapsed');
  if(was) p.removeAttribute('data-collapsed'); else p.setAttribute('data-collapsed','1');
  const c=p.cloneNode(true); c.querySelectorAll('button.pa').forEach(b=>b.remove()); const html=edClean(c);
  const rec={pid,page:ED.page,html,collapsed:!was,at:new Date().toISOString()};
  edOutPut(rec); toast(was?'uncollapsed: it is a full screen again':'collapsed: the screen stays, folded, and the chain keeps its numbers'); edSync(); }
function edClearPending(pid){ try{ const k='ladder:pending-edits', m=JSON.parse(localStorage.getItem(k)||'{}'); delete m[pid]; localStorage.setItem(k,JSON.stringify(m)); }catch(_){} }
async function edFolded(){ const f={}; try{ const s=await ED.db.collection('folded').get(); s.docs.forEach(d=>{ const v=d.data()||{}; f[v.pid||d.id]=v.at||''; }); }catch(_){ return null; } return f; }
/* The owner check runs once at load; if the host was slow to answer then, check again when a menu opens. */
/* 2026-11-10 (Andrew 11:37 'half the time it doesn't load in'): the desk's view page asks for the database handle before it rewrites the
   document (window.LADDER_DBP); take that first, and only then ask the host again from this document. */
function edTop(){ try{ return window.top===window; }catch(_){ return false; } }
/* 2026-11-10 (Andrew 11:45): read the db grant without prompting, ask once per load while it is still to be asked, and remember the state for the badge */
async function edPerm(){ try{ if(!window.claude||typeof window.claude.use!=='function') return ''; const pm=await Promise.race([window.claude.use('permissions'),new Promise(r=>setTimeout(()=>r(null),8000))]); if(!pm||!pm.state) return ''; let st=await pm.state('db'); if(st==='prompt'&&!ED.asked){ ED.asked=true; const r=await pm.request(['db']); st=(r&&r.db)||st; } ED.perm=st||''; return ED.perm; }catch(_){ return ''; } }
async function edGetDb(){ if(edTop()){ ED.why='top'; return null; } await edPerm(); let d=null; try{ if(window.LADDER_DBP) d=await Promise.race([window.LADDER_DBP,new Promise(r=>setTimeout(()=>r(null),12000))]); }catch(_){ d=null; } if(!d){ try{ d=await Promise.race([window.claude.use('db'),new Promise(r=>setTimeout(()=>r(null),10000))]); }catch(_){ d=null; } } return d||null; }
async function edRecheck(){ try{ if(!window.claude||typeof window.claude.use!=='function'){ ED.why='claude'; return false; } if(!ED.db) ED.db=await edGetDb(); if(!ED.db){ if(ED.why!=='top') ED.why=(ED.perm==='denied')?'db':'db'; return false; } /* 0.3.53 (Andrew 14:26 'locked out again'): the desk is private to its owner and the database only takes the owner's edits, so reaching the database is the whole gate; no separate who-is-viewing check */ ED.owner=true; ED.why=''; if(ED.owner) document.body.classList.add('ed-owner'); }catch(e){ ED.why='err'; } return ED.owner; }
/* 0.3.41 (Andrew 18:24 "the edit button is not on the menu"): on the desk, when editing is off, the menu says why and offers the Permissions panel */
const ED_WHY={top:'Editing is off: this address is the desk’s page on its own, outside claude.ai. Open the desk from its claude.ai link (the pinned artifact), not from a bookmark or a new tab of this address.',claude:'Editing is off: this view is not inside claude.ai. Open the desk link in claude.ai, signed in.',db:'Editing is off: the desk cannot reach its database. Allow database access under Permissions, then reload.',user:'Editing is off: the desk cannot tell who is viewing. Open the desk link in claude.ai, signed in.',owner:'Editing is off: claude.ai does not see you as the owner of this desk. Check that you are signed in to the account that owns it.',err:'Editing is off: the desk could not check its database. Reload the page and try again.'};
async function edWhyShow(m){ let w=m.querySelector('.edwhy'); if(!window.LADDER_DESK||edOn()){ if(w) w.hidden=true; return; }
  if(!w){ w=document.createElement('div'); w.className='edwhy'; w.style.cssText='font-size:.78rem;line-height:1.35;max-width:16rem;padding:6px 8px;color:var(--muted,#666);border-top:1px solid rgba(0,0,0,.1);white-space:normal'; m.appendChild(w); }
  w.hidden=false; w.textContent=ED_WHY[ED.why]||ED_WHY.err;
  try{ const pm=window.claude&&await window.claude.use('permissions'); if(pm&&pm.manage){ const b=document.createElement('button'); b.type='button'; b.textContent='Open Permissions'; b.style.cssText='display:block;margin-top:4px'; b.onclick=e=>{ e.stopPropagation(); pm.manage().catch(()=>toast('Open the Permissions menu at the top of the desk')); }; w.appendChild(b); } }catch(_){} }
async function edInit(){
  if(!document.querySelector('header.top > p[data-pid], section.class p[data-pid]')) return;
  if(window.LADDER_DESK){ document.body.classList.add('ed-owner'); const nl=edLocal(); const nw=Object.keys(edOutAll()).length; if(nw) toast(nw+' edit'+(nw===1?'':'s')+' since the last sweep · tap the badge for the text'); setTimeout(()=>edSync(),300); }
  if(!(await edWait())){ edBadge(); return; }
  let db=null,user=null; try{ db=await edGetDb(); }catch(e){} if(!db) return; ED.db=db;
  ED.owner=true; /* 0.3.53: the database is the gate (see edRecheck) */
  if(ED.owner) document.body.classList.add('ed-owner');
  const FOLD=await edFolded(), stale=r=>!!FOLD&&!!FOLD[r.pid]&&String(FOLD[r.pid])>=String(r.at||'');
  /* 2026-11-09 (Andrew 16:42 "the edits don't populate"): every edit logged for this page is laid over the page as loaded (from the
     site, or the bundle), editable in place or not; what was shown is said in a toast so the desk never goes quiet about it. */
  let shownEd=0, skippedEd=0, edErr=null;
  try{ const snap=await db.collection('edits').where('page','==',ED.page).get();
    snap.docs.forEach(d=>{ const v=d.data()||{}; if(v.kind==='text') return; if(stale({pid:v.pid||d.id,at:v.at})){ skippedEd++; return; } const ob=edOutAll()[v.pid||d.id]; if(ob&&ob.kind!=='text'&&String(ob.at||'')>String(v.at||'')) { shownEd++; return; } const p=document.querySelector('p[data-pid="'+(v.pid||d.id)+'"],li[data-pid="'+(v.pid||d.id)+'"]'); if(p&&typeof v.html==='string'){ edApply(p,v.html); shownEd++; } if(p&&'collapsed' in v){ if(v.collapsed) p.setAttribute('data-collapsed','1'); else p.removeAttribute('data-collapsed'); } }); }catch(e){ edErr=e; }
  if(window.LADDER_DESK){ const from=window.LADDER_SOURCE==='site'?'page from the ladder’s site':window.LADDER_SOURCE==='bundle'?'page from the desk’s own copy':'page';
    toast(from+(edErr?' · the database did not answer':' · '+(shownEd?shownEd+' edit'+(shownEd===1?'':'s')+' from the database shown':'no unfolded edits for this page')+(skippedEd?' · '+skippedEd+' already folded':''))); }
  if(FOLD) try{ const m=edOutAll(); let drop=0; for(const pid in m){ const r=m[pid]; if(r&&r.kind!=='text'&&stale(r)){ delete m[pid]; drop++; try{ const dm=JSON.parse(localStorage.getItem('ladder:edit-drafts')||'{}'); delete dm[pid]; localStorage.setItem('ladder:edit-drafts',JSON.stringify(dm)); }catch(_){} } } if(drop) localStorage.setItem('ladder:pending-edits',JSON.stringify(m)); }catch(_){}
  edSync(); /* the outbox goes out in the background; the badge says what still waits */
  try{ const m=JSON.parse(localStorage.getItem('ladder:edit-drafts')||'{}'); let n=0;
    for(const pid in m){ const d=m[pid]; if(d.page!==ED.page) continue; if(FOLD[pid]&&Number(new Date(FOLD[pid]))>=Number(d.at||0)) continue; const p=document.querySelector('p[data-pid="'+pid+'"],li[data-pid="'+pid+'"]'); if(!p||!editable(p)) continue;
      startEdit(p); p.innerHTML=d.html; n++; }
    if(n) toast('your unsaved edit'+(n>1?'s are':' is')+' back, still open: press save when ready'); }catch(_){}
}
const edOn=()=>ED.owner||!!window.LADDER_DESK; /* outbox 2026-11-09: on the desk editing is always on; the database is reached in the background */
function startEdit(p){ if(!edOn()||!editable(p)||p.isContentEditable) return;
  const b=p.querySelector('button.pa'); if(b) b.remove(); const before=p.innerHTML;
  p.querySelectorAll('[data-tex-inline]').forEach(el=>el.contentEditable='false');
  p.contentEditable='true'; p.classList.add('pediting'); p.focus();
  const bar=document.createElement('div'); bar.className='pebar';
  bar.innerHTML='<button type="button" data-e="save">save</button><button type="button" data-e="cancel">cancel</button><span class="pehint">prose only · bold with '+(/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent)?'⌘B':'Ctrl+B')+'</span>';
  p.after(bar);
  const DK='ladder:edit-drafts', dset=v=>{ try{ const m=JSON.parse(localStorage.getItem(DK)||'{}'); if(v==null) delete m[p.dataset.pid]; else m[p.dataset.pid]={page:ED.page,html:v,at:Date.now()}; localStorage.setItem(DK,JSON.stringify(m)); }catch(_){} };
  let dt=0; p.addEventListener('input',()=>{ clearTimeout(dt); dt=setTimeout(()=>dset(p.innerHTML),400); });
  const done0=()=>{ p.querySelectorAll('[data-tex-inline]').forEach(el=>el.removeAttribute('contenteditable')); p.contentEditable='false'; p.classList.remove('pediting'); bar.remove(); if(b){ p.appendChild(document.createTextNode(' ')); p.appendChild(b); } };
  const done=()=>{ clearTimeout(dt); dset(null); done0(); };
  bar.addEventListener('click',async e=>{ const k=e.target.dataset.e; if(!k) return;
    if(k==='cancel'){ p.innerHTML=before; done(); return; }
    const html=edClean(p); const rec={pid:p.dataset.pid,page:ED.page,html,at:new Date().toISOString()};
    p.innerHTML=html; edTex(p); p.classList.add('pedited'); done(); edOutPut(rec); toast('saved · it counts on the badge until the next sweep'); edSync(); });
}
/* 0.3.10 final pass (Andrew 23:57): a paragraph he has re-edited down to plain, concise sentences, the promise that "the ladder
   trusts your English completely" kept, reads in a slightly different ink. Every paragraph he saves through the editor is final
   pass; one already right can be marked as it stands. The mark is an edit of the paragraph's own words, so it rides the edit
   pipeline: shown live as .pedited, and the fold writes class="fp" into the page. */
async function markFinal(p){ if(!edOn()||!editable(p)) return;
  const rec={pid:p.dataset.pid,page:ED.page,html:edClean(p),at:new Date().toISOString(),final:true};
  p.classList.add('pedited'); edOutPut(rec); toast('marked final pass · sending to the database'); edSync(); }
/* 0.3.15 the desk's text editor (Andrew 21:57, 02:40 "i need the desk immediately"): on the desk the owner can edit the words of any
   title or paragraph without typeset maths, graphs or slides, anywhere they show: page and index titles, footing names, step blurbs,
   and the words that come from the data files (seeds, links, answers, questions, crosswalk cards). "✎ edit text" turns it on; a tap
   opens the words in place. A save goes to edits/tx-<id> {kind:'text', page, old/new text and html}; the desk shows it at once,
   and the next publish folds it into whichever source file holds those words (work/foldtext.py). Nothing is ever deleted here. */
const TX={on:false,list:[],busy:null};
const txNorm=s=>String(s||'').replace(/\s+/g,' ').trim();
const TX_TAGS='a,button,summary,h1,h2,h3,h4,h5,h6,p,li,dd,dt,td,th,figcaption,blockquote,label';
const TX_NO='.katex,[data-tex],[data-tex-inline],svg,canvas,img,code,pre,input,textarea,select,video,iframe';
const TX_OFF='.txbar,.pebar,.pamenu,.qmenu,#txbtn,#patoast,.slide,.slides,.deck,figure,.graph,.gt,.grapher,#splash,.agree,.modal';
const TX_BLOCK='p,li,ol,ul,div,section,table,details,h1,h2,h3,h4,h5,h6,blockquote,dl,figure,form';
function txOwnText(e){ for(const n of e.childNodes) if(n.nodeType===3&&n.textContent.trim()) return true; return false; }
function txOk(e){ if(!e||e.closest(TX_OFF)) return false; if(e.querySelector(TX_NO)||e.closest('svg')) return false;
  if(e.matches('a,button,summary')) return !!txNorm(e.textContent);
  if(e.querySelector(TX_BLOCK)) return false; return !!txNorm(e.textContent); }
function txCand(t){ for(let e=t&&t.nodeType===1?t:t&&t.parentElement; e&&e!==document.body; e=e.parentElement){
    if(e.closest(TX_OFF)) return null;
    /* 0.3.52: a paragraph or list item with an address and inline maths opens in the paragraph editor */
    if(e.matches('p[data-pid],li[data-pid]')&&!e.closest('.ladder')&&editable(e)) return e;
    if(e.matches(TX_TAGS)||(txOwnText(e)&&getComputedStyle(e).display!=='inline')) return txOk(e)?e:null; }
  return null; }
function txKind(e){ return e.matches('h1,h2,h3,h4')||!!e.closest('.ladder .t, .stidx, .pn, nav, header.top h1, .fvhead')?'title':'text'; }
function txId(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0).toString(36); }
/* map normalized text positions to (text node, offset), so an edit lands inside the element without flattening its markup */
function txMap(el){ const map=[]; let out='', sp=true; const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  for(let n=w.nextNode(); n; n=w.nextNode()){ if(n.parentElement&&n.parentElement.closest('button.pa,.txbar,.here,.stno,.fn,.h1tag')) continue; const t=n.textContent;
    for(let i=0;i<t.length;i++){ const ws=/\s/.test(t[i]); if(ws){ if(sp) continue; out+=' '; sp=true; } else { out+=t[i]; sp=false; } map.push([n,i]); } }
  while(out.endsWith(' ')){ out=out.slice(0,-1); map.pop(); } return {text:out,map}; }
function txDiff(a,b){ let p=0; while(p<a.length&&p<b.length&&a[p]===b[p]) p++; let s=0; while(s<a.length-p&&s<b.length-p&&a[a.length-1-s]===b[b.length-1-s]) s++;
  return {p, oldMid:a.slice(p,a.length-s), newMid:b.slice(p,b.length-s)}; }
function txApplyTo(el,r){ const done=(el.dataset.txdone||'').split(' '); if(done.includes(r.id)) return false; const {text,map}=txMap(el); let off=0;
  if(text!==r.old_text){ if(r.role!=='title') return false; off=text.indexOf(r.old_text); if(off<0||text.length-r.old_text.length>24) return false;
    const post=text[off+r.old_text.length]; if(post&&/\w/.test(post)&&/\w/.test(r.old_text.slice(-1))) return false; }
  const d=txDiff(r.old_text,r.new_text); d.p+=off;
  try{ const rg=document.createRange(); const a=map[d.p], z=map[d.p+d.oldMid.length-1];
    if(a) rg.setStart(a[0],a[1]); else { const l=map[map.length-1]; rg.setStart(l[0],l[1]+1); }
    if(z) rg.setEnd(z[0],z[1]+1); else rg.collapse(true);
    rg.deleteContents(); if(d.newMid) rg.insertNode(document.createTextNode(d.newMid)); el.normalize(); el.classList.add('txedited'); el.dataset.txdone=(el.dataset.txdone?el.dataset.txdone+' ':'')+r.id; return true; }catch(e){ return false; } }
function txOverlay(){ if(!TX.list.length) return; const pend=TX.list.filter(r=>!r.folded);
  for(const r of pend){ const key=r.old_text.slice(0,24);
    let els=[...document.querySelectorAll(r.role==='title'?TX_TAGS:(r.tag||TX_TAGS))].filter(el=>!el.isContentEditable&&txNorm(el.textContent).indexOf(key)>=0&&txOk(el));
    els=els.filter(e=>!els.some(o=>o!==e&&e.contains(o))); /* the innermost holder of the words, not its row too */
    els.forEach(el=>txApplyTo(el,r)); } }
function txPend(rec,keep){ try{ const k='ladder:pending-edits', m=JSON.parse(localStorage.getItem(k)||'{}'); if(keep) m[rec.id]=rec; else delete m[rec.id]; localStorage.setItem(k,JSON.stringify(m)); }catch(_){} }
async function txSave(rec){ txPend(rec,true); if(!ED.db) return {code:'no database'}; let err=null; try{ err=await edPut('edits/'+rec.id,rec); }catch(e){ err={code:'refused'}; } return err; } /* 2026-11-10: the record stays in the outbox for the sweep */
/* 2026-11-10 (Andrew 15:29): the device's title and list edits are laid over the page at load, as paragraph edits are */
function txLocal(){ let n=0; try{ const m=JSON.parse(localStorage.getItem('ladder:pending-edits')||'{}'); for(const id in m){ const r=m[id]; if(!r||r.kind!=='text'||r.page!==ED.page||!r.old_text||!r.new_html) continue;
    const els=[...document.querySelectorAll(r.tag||TX_TAGS)].filter(e=>!e.closest(TX_OFF)); let el=els.find(e=>txMap(e).text===r.old_text); if(!el){ if(els.some(e=>txMap(e).text===r.new_text)) continue; el=null; } if(!el) continue;
    const tmp=document.createElement('div'); tmp.innerHTML=r.new_html; const keep=[...el.querySelectorAll('.stno,.fn,.qid,.ph,.here,.kind,.h1tag')]; /* the locked address or label stays as it was; edClean had kept only its words */
    keep.forEach(k=>{ const kt=(k.textContent||'').trim(); if(!kt) return; const w=document.createTreeWalker(tmp,NodeFilter.SHOW_TEXT); const tn=w.nextNode(); if(tn&&tn.textContent.trimStart().startsWith(kt)) tn.textContent=tn.textContent.trimStart().slice(kt.length); });
    el.innerHTML=''; keep.forEach(k=>el.appendChild(k)); el.append(...tmp.childNodes); el.classList.add('txedited'); el.dataset.txdone=id; n++; } }catch(_){} return n; }
function txStart(el){ if(TX.busy) return; const pa=el.matches('p[data-pid],li[data-pid]')&&!el.closest('.ladder');
  if(pa&&editable(el)){ startEdit(el); return; }
  const before=txMap(el).text, beforeHtml=el.innerHTML, tag=el.tagName.toLowerCase(); TX.busy=el;
  const href=el.getAttribute('href'); if(href!=null){ el.dataset.txhref=href; el.removeAttribute('href'); }
  /* 0.3.49: a title's address (0a1, 2b3) and a question's labels stay locked, and are left out of the saved words */
  el.querySelectorAll('.stno,.fn,.qid,.ph,.here,.kind,.h1tag').forEach(x=>x.contentEditable='false');
  el.contentEditable='true'; el.classList.add('txediting'); el.tabIndex=-1; el.focus(); try{ const sel=getSelection(), rg=document.createRange(); rg.selectNodeContents(el); rg.collapse(false); sel.removeAllRanges(); sel.addRange(rg); }catch(_){}
  const bar=document.createElement('div'); bar.className='txbar';
  bar.innerHTML='<button type="button" data-e="save">save</button><button type="button" data-e="cancel">cancel</button><span class="pehint">words only · '+(txKind(el)==='title'?'a title: the next publish changes it everywhere it shows':'the next publish puts it into its source')+'</span>';
  (el.matches('a,button,summary,li,td,th,dt,dd')?document.body:el.parentNode).appendChild(bar);
  if(bar.parentNode===document.body){ const r=el.getBoundingClientRect(); bar.style.cssText='position:absolute;z-index:9999;left:'+Math.max(8,r.left+window.scrollX)+'px;top:'+(r.bottom+window.scrollY+6)+'px'; }
  else el.after(bar);
  const done=()=>{ el.removeAttribute('tabindex'); el.removeAttribute('contenteditable'); el.classList.remove('txediting'); bar.remove(); if(el.dataset.txhref!=null){ el.setAttribute('href',el.dataset.txhref); delete el.dataset.txhref; } TX.busy=null; };
  const key=e=>{ if(e.key==='Escape'){ e.preventDefault(); bar.querySelector('[data-e=cancel]').click(); } if(e.key==='Enter'&&(tag!=='p'||e.metaKey||e.ctrlKey)){ e.preventDefault(); bar.querySelector('[data-e=save]').click(); } };
  el.addEventListener('keydown',key);
  bar.addEventListener('click',async e=>{ const k=e.target.dataset&&e.target.dataset.e; if(!k) return; e.preventDefault(); e.stopPropagation();
    if(k==='cancel'){ el.innerHTML=beforeHtml; el.removeEventListener('keydown',key); done(); return; }
    const after=txMap(el).text; el.removeEventListener('keydown',key);
    if(after===before){ done(); return; } if(!after){ toast('a title or paragraph cannot be left empty; cancel instead'); return; }
    const tmpA=document.createElement('div'); tmpA.innerHTML=beforeHtml;
    const rec={kind:'text',id:'tx-'+txId(ED.page+'|'+before),page:ED.page,tag,role:txKind(el),old_text:before,new_text:after,old_html:edClean(tmpA),new_html:edClean(el),at:new Date().toISOString()};
    const prev=TX.list.find(r=>r.new_text===before&&!r.folded); if(prev){ rec.id=prev.id; rec.old_text=prev.old_text; rec.old_html=prev.old_html; rec.page=prev.page; }
    /* 2026-11-10 (Andrew 15:29): the outbox is the record; the editor never waits on the database */
    txPend(rec,true); TX.list=TX.list.filter(r=>r.id!==rec.id).concat([rec]); el.classList.add('txedited'); el.dataset.txdone=(el.dataset.txdone?el.dataset.txdone+' ':'')+rec.id; done();
    try{ edBadge(); }catch(_){} toast('kept for the sweep · it goes into its page at the next release'); try{ if(ED.db) txSave(rec).catch(()=>{}); }catch(_){} });
}
/* 0.3.48 (Andrew 2026-11-06 11:44 "give my desk a way to edit questions"): a question's menu on the desk has "edit"; it opens
   the question's words in place, with its address and kind label locked, and saves through the text editor (edits/tx-<id>). */
function txStartQ(li){ if(!li||TX.busy) return; li.querySelectorAll(':scope>span,:scope>.here').forEach(x=>{ if(x.matches('.qid,.ph,.here,.chid,.tagq,[class^="tag"]')) x.contentEditable='false'; });
  txStart(li); }
function txToggle(v){ TX.on=v; document.body.classList.toggle('tx-on',v); const b=document.getElementById('txbtn'); if(b){ b.textContent=v?'✓ Done Editing':'✎ Edit Text'; b.setAttribute('aria-pressed',v); }
  try{ sessionStorage.setItem('tx:on',v?'1':''); }catch(_){} }
async function txInit(){ if(!window.LADDER_DESK) return;
  ED.owner=true; document.body.classList.add('ed-owner'); /* 2026-11-10 (Andrew 12:08): the sweep goes by paste; no database needed */
  /* 2026-11-10 (Andrew 14:53): the button first; the database check may never answer on his device */
  { const b=document.createElement('button'); b.type='button'; b.id='txbtn'; b.className='txbtn'; b.style.cssText='position:fixed;left:10px;bottom:calc(var(--lbh,48px) + 98px);z-index:9600'; document.body.appendChild(b); /* 2026-11-10 15:01: above the badge, over every bar */
    b.addEventListener('click',e=>{ e.stopPropagation(); if(TX.busy) return; txToggle(!TX.on); });
    let st=''; try{ st=sessionStorage.getItem('tx:on')||''; }catch(_){} txToggle(!!st); }
  try{ txLocal(); }catch(_){}
  try{ await Promise.race([edRecheck(),new Promise(r=>setTimeout(r,12000))]); }catch(_){}
  const FOLD=(ED.db&&await edFolded())||{};
  try{ if(!ED.db) throw 0; const s=await ED.db.collection('edits').where('kind','==','text').get(); TX.list=s.docs.map(d=>d.data()||{}).filter(r=>r.old_text&&r.new_text).map(r=>Object.assign(r,{folded:!!FOLD[r.id]&&String(FOLD[r.id])>=String(r.at||'')})); }catch(e){}
  try{ const m=JSON.parse(localStorage.getItem('ladder:pending-edits')||'{}'); for(const id in m){ const r=m[id]; if(!r||r.kind!=='text') continue; TX.list=TX.list.filter(x=>x.id!==id).concat([r]); } }catch(_){} /* 2026-11-10: listed, not re-sent; the sweep takes them */
  try{ const m=JSON.parse(localStorage.getItem('ladder:pending-edits')||'{}'); for(const id in m){ const r=m[id]; if(r&&r.kind==='text'&&!TX.list.some(x=>x.id===id)) TX.list.push(r); } }catch(_){}
  window.addEventListener('click',e=>{ if(!TX.on||TX.busy&&TX.busy.contains(e.target)) return; if(e.target.closest&&e.target.closest('#txbtn,.txbar,.pebar,#desk,.dtop,.lnav,#ladderbtn')) return;
    const el=txCand(e.target); e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); if(TX.busy) return; if(el) txStart(el); else toast('that one has maths, a graph or a slide in it, so it stays as it is'); },true);
  document.addEventListener('mouseover',e=>{ if(!TX.on||TX.busy) return; document.querySelectorAll('.txcand').forEach(x=>x.classList.remove('txcand')); const el=txCand(e.target); if(el) el.classList.add('txcand'); });
  txOverlay(); let t=0; new MutationObserver(()=>{ if(TX.busy) return; clearTimeout(t); t=setTimeout(txOverlay,250); }).observe(document.body,{childList:true,subtree:true});
}
window.LadderText={on:()=>txToggle(true),off:()=>txToggle(false),list:()=>TX.list};
/* 2026-11-12 (Andrew 20:57Z): 'prompt from' shows only when the learner has said an AI assistant is connected (Record page) */
function aiOn(){ try{ return localStorage.getItem('ladder:assistant')==='1'; }catch(_){ return false; } }
function openMenu(p,b){ cur=p; const r=b.getBoundingClientRect(); const pb=menu.querySelector('[data-a=prompt]'); if(pb) pb.hidden=!aiOn(); const fb=menu.querySelector('[data-a=final]'); if(fb){ const done=p.classList.contains('fp')||p.classList.contains('pedited'); fb.hidden=!(edOn()&&editable(p)&&!done); } const fo=menu.querySelector('[data-a=fold]'); if(fo){ fo.hidden=!edOn(); fo.textContent=p.hasAttribute('data-collapsed')?'uncollapse':'collapse'; } const eb=menu.querySelector('[data-a=edit]'); if(eb){ eb.hidden=!(edOn()&&editable(p)); if(!edOn()&&editable(p)) edRecheck().then(ok=>{ if(ok&&cur===p) eb.hidden=false; edWhyShow(menu); }); else edWhyShow(menu); } menu.hidden=false;
  const w=menu.offsetWidth||220; menu.style.left=Math.max(8,Math.min(window.innerWidth-w-8,r.left+r.width/2-w/2))+'px';
  menu.style.top=(r.bottom+window.scrollY+6)+'px'; }
/* the non-skid key: the annex tags show or hide their annexes; the geometry-transform mark waits for the geometry floor */
const ANNEX=['stat','phys','chem','bio','comp','econ','logi','eng','crypt','nav','now'];
function nonskid(){
  const key=document.querySelector('.ladderkey'), rungs=document.querySelector('.rungs'); if(!key||!rungs) return;
  /* by default every annex but statistics is hidden: the learner finds the rest by being curious (Andrew, 2026-10-31) */
  let hide=ANNEX.filter(k=>k!=='stat'); try{ const v=LS.getItem('ladder:hide'); if(v) hide=JSON.parse(v); }catch(e){} if(window.LADDER_DESK) hide=[];
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
  txt=txt.replace(/∞[^\s·.,;:()]\u200e?/g,' ').replace(/\\([A-Za-z]+)/g,(m,w)=>T[w]?' '+T[w]+' ':m).replace(/ϕ/g,'φ').replace(/ϵ/g,'ε');
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
  if(window.LADDER_DESK) open=ss.length; /* 0.3.20: the desk shows every footing at once, no next-footing buttons */
  open=Math.min(open,ss.length);
  const ends=[...document.querySelectorAll('.themeend')], btns=[];
  ss.forEach((s,i)=>{ if(!s.id) s.id=s.dataset.step;
    if(i===ss.length-1||window.LADDER_DESK) return;
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
  const per={}; const ps=[...document.querySelectorAll('header.top > p[data-pid], section.class p[data-pid]')].filter(p=>!(p.hasAttribute('data-collapsed')||!p.textContent.replace(/\s+/g,'')));
  for(const p of ps){ const top=!!p.closest('header.top'), st=p.closest('section.step'), k=top?info.label+'.top':(st?st.dataset.step:info.label); per[k]=(per[k]||0)+1; const ad=top?k+'.'+per[k]:k+'.0.'+per[k]; if(ad===h){ history.replaceState(null,'','#'+p.dataset.pid); break; } } }
function toPid(){ const h=location.hash.slice(1); const t=h&&document.getElementById(h); if(t&&t.dataset&&t.dataset.pid) setTimeout(()=>t.scrollIntoView({block:'center'}),60); }
ready(()=>{ document.documentElement.classList.add(window.LADDER_DESK?'isdesk':'isapp'); if(window.LADDER_DESK) document.documentElement.classList.add('lk-paint'); /* 2026-11-10 (Andrew 15:10): in the app the page stays hidden until the footing view's first paint (footingView), so it never shows the whole step first */ pids(); steps(); const info=tagInfo(); if(info){ titles(info); addresses(info); edInit(); } txInit(); if(window.LADDER_DESK&&!foldPref()) setTimeout(()=>document.querySelectorAll('.rungs details.stidx').forEach(d=>d.open=true),0); setTimeout(foldAllButton,0); toPid(); reportQuestions(); pn(); nonskid(); greek(); curly();
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
  let lab=(i<0?txt:txt.slice(0,i)).replace(/^Rung\s+/,'');
  if(!lab){ const pm=(window.ladderPage?ladderPage():'').match(/^(?:r(\d+)|floor(\d+))$/); if(pm) lab=pm[1]?String(+pm[1]):'F'+pm[2]; }
  const head=document.createElement('div'); head.className='bhead'; head.innerHTML='<span class="bn">−'+lab+'</span> cellar';
  const eb=b.querySelector('.eyebrow'); if(eb) eb.replaceWith(head); else b.prepend(head);
  b.id=b.id||'basement';
  if(!window.LADDER_DESK){ b.hidden=true; b.classList.add('shut'); return; } /* 2026-11-10 (Andrew 15:51): in the app the cellar is reached only through the toolbox; the pull past the foot fought the footing view */
  const lip=document.createElement('button'); lip.type='button'; lip.className='blip';
  lip.innerHTML='<span class="bar"></span><span class="bl">keep going down: the cellar</span>';
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
    const w=document.querySelector('#lbar .lb-ladder .lb-w'), L=document.querySelector('#lbar .lb-ladder .lb-L'); if(w) w.textContent=inb?'Cellar':'adder'; if(L) L.style.display=inb?'none':'';
    const l=document.querySelector('#lbar .lb-ladder .lb-l'); if(l) l.setAttribute('aria-label',inb?'Cellar':'Ladder'); };
  addEventListener('scroll',flip,{passive:true}); flip();
}
ready(()=>setTimeout(basement,0));
})();


/* ---- crosswalk cards: multiple choice, "know by sight". A rung's steps share one deck; a step's cards join it
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
  const rung=parseInt(tag,10); if(isNaN(rung)) return /^∞([^·.\s]\u200e?|·[a-z]+)$/.test(tag)?{tag,rung:null,annex:null,deck:'sky'}:null;
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
function open(host){ host=host&&host.nodeType===1?host:null; /* ansq */
  load().then(ok=>{
    const d=deck();
    if(!ok||!d.cards.length){ if(host) host.innerHTML='<p class="sk-n">This deck’s cards are still being made.</p>'; else note('this deck’s cards are still being made'); return; }
    close(); box=document.createElement('div'); box.id='cards'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','crosswalk');
    if(host){ box.className='cd-in'; host.innerHTML=''; host.appendChild(box); } else { document.body.appendChild(box); document.body.classList.add('cardsopen'); }
    const rec=get(CR,{}); let queue=shuffle(d.cards.slice()), n=0, right=0;
    const label=me.annex?('every '+me.annex+' page you have opened'):me.rung==null?('the Endless floor, steps opened: '+d.tags.sort((x,y)=>x.slice(1)-y.slice(1)).join(', ')):('rung '+me.rung+', steps opened: '+d.tags.sort().join(', '));
    const show=()=>{
      if(!queue.length){ box.innerHTML='<div class="cd-card"><div class="cd-top"><span>crosswalk</span><button class="cd-x" aria-label="close">×</button></div><p class="cd-q">'+right+' of '+n+' at first sight. Every card missed came back until it was known.</p><div class="cd-foot"><button class="cd-next cd-again">shuffle again</button></div></div>';
        box.querySelector('.cd-x').onclick=close; box.querySelector('.cd-again').onclick=()=>{ close(); open(host); }; return; }
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

/* ---- the footing view (0.2.1, Andrew 2026-11-04 19:13): one footing at a time is the default way to read a step.
   "next" is an up arrow at the top of the screen and "previous" a down arrow at the bottom; a one-finger drag past the
   edge of a footing does the same. The old footing leaves along a cam's curve and the new one comes in on the same curve.
   The page view (every footing at once) and the ladder itself ("dizzying heights") are in the toolbox.
   The Ladder button and the app's start take you back to the footing you were last reading. */
(function(){
'use strict';
const ready=f=>{ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',f); else f(); };
const LK='ladder:lastFooting';
const page=()=>window.ladderPage?ladderPage():'index';
const ss={ get(k){ try{ return sessionStorage.getItem(k); }catch(e){ return null; } }, set(k,v){ try{ sessionStorage.setItem(k,v); }catch(e){} }, del(k){ try{ sessionStorage.removeItem(k); }catch(e){} } };
const last=()=>{ try{ return JSON.parse(LS.getItem(LK)||'null'); }catch(e){ return null; } };
const href=(p,id)=>p+'.html'+(id?'#'+id:'');
/* where the Ladder button and the app's start go */
/* 0.3.2 (Andrew 21:27): the Ladder button and the app's start go to your furthest footing on the climb, not the last one opened.
   A footing's place on the climb: its rung, then its page within the rung (theory page, steps in LADMAP's order, statistics and
   newsflash, conclusion; floor pages around their rungs), then the footing. Subject annexes, the blue sky and the index have no place. */
const FK='ladder:furthest';
const furthest=()=>{ try{ return JSON.parse(LS.getItem(FK)||'null'); }catch(e){ return null; } };
const OPTX=/(phys|chem|bio|comp|eng|econ|logi|crypt|nav)\d*$/;
function placeOf(stem){ const M=window.LADMAP; if(stem==='start') return -2000; if(stem==='intro') return -1000; /* the first run's pages, below floor 1 */ let m=String(stem||'').match(/^floor(\d+)(concl)?$/);
  if(m){ if(!M) return null; const F=M.find(x=>x[0]===+m[1]); if(!F||!F[1].length) return null; return m[2]?F[1][F[1].length-1][0]*1000+960:F[1][0][0]*1000; }
  m=String(stem||'').match(/^r(\d+)(.*)$/); if(!m) return null; const r=+m[1], suf=m[2];
  if(suf==='') return r*1000+10; if(suf==='concl') return r*1000+950; if(OPTX.test(suf)) return null;
  if(!M) return null; for(const [,rungs] of M) for(const [rr,core,annex] of rungs) if(rr===r){ const all=core.concat(annex).map(x=>x[0]); const i=all.indexOf(stem); return i<0?null:r*1000+20+i; }
  return null; }
/* 2026-11-10 (Andrew 15:29, a locked floor's page opened and unlocked everything below): a page two or more rungs past the record
   is not climbed by being opened; only a certificate (measured in) reaches that far */
function certReach(){ let r=-1; try{ for(let i=0;i<LS.length;i++){ const k=LS.key(i)||''; const m=k.match(/^cert:(.+)$/); if(!m) continue; const pl=placeOf(m[1]); if(pl!=null) r=Math.max(r,Math.floor(pl/1000)); } }catch(e){} return r; }
function climbable(P,f){ const pl=placeOf(P); if(pl==null) return false; const r=Math.floor(pl/1000); const fr=f&&f.ord!=null?Math.floor(f.ord/1e6):-1; return r<=fr+1||r<=certReach()+1; }
function climbed(P,id,n){ const pl=placeOf(P); if(pl==null) return; const ord=pl*1000+n, f=furthest(); if(f&&f.ord>=ord) return; if(f&&!climbable(P,f)) return;
  try{ LS.setItem(FK,JSON.stringify({page:P,id,ord,t:Date.now()})); }catch(e){} }
/* a record that got past the climb that way (before this fix) goes back to the end of the contiguous climb the record knows:
   the stems it holds (steps:, open:, passed pages) in climb order, rung by rung, with no jump of two rungs that no certificate covers */
function climbChain(){ let P={}; try{ P=JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){} const stems=new Set();
  try{ for(let i=0;i<LS.length;i++){ const k=LS.key(i)||''; if(/^steps:/.test(k)) stems.add(k.slice(6)); } }catch(e){}
  Object.keys(P).forEach(k=>{ if(!/^open:/.test(k)&&P[k]&&P[k].v) stems.add(k); }); /* open:rNN rows follow the furthest record, so they do not count */
  const list=[...stems].map(s=>[placeOf(s),s]).filter(x=>x[0]!=null).sort((a,b)=>a[0]-b[0]); const cr=certReach(); let cur=-1, best=null, cut=[];
  list.forEach(([pl,s])=>{ const r=Math.floor(pl/1000); if(best!==null&&r>cur+1&&r>cr+1){ cut.push(s); return; } cur=Math.max(cur,r); best=s; }); return {best,cut}; }
function repairFurthest(){ try{ const f=furthest(); if(!f||!f.page||!window.LADMAP) return false; const ch=climbChain(); const bad=ch.cut.indexOf(f.page)>=0||(ch.best&&!climbable(f.page,{ord:(placeOf(ch.best)||0)*1000})); if(!bad) return false;
    if(ch.best){ LS.setItem(FK,JSON.stringify({page:ch.best,id:'top',ord:(placeOf(ch.best)||0)*1000,t:Date.now()})); } else LS.removeItem(FK);
    ch.cut.forEach(s=>{ try{ LS.removeItem('steps:'+s); }catch(e){} });
    try{ const br=ch.best?Math.floor((placeOf(ch.best)||0)/1000):-1; const P=JSON.parse(LS.getItem('pages:done')||'{}')||{}; let ch2=false; Object.keys(P).forEach(k=>{ const m=k.match(/^open:r(\d+)$/); if(m&&+m[1]>br+1){ delete P[k]; ch2=true; } }); if(ch2) LS.setItem('pages:done',JSON.stringify(P)); }catch(e){}
    LS.removeItem('ladder:notices'); LS.removeItem('ladder:unlocksnap'); return true; }catch(e){ return false; } }
/* no record yet (before 0.3.2): the furthest page the record knows, opened at its top */
function guess(){ let P={}; try{ P=JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){}
  const stems=new Set(Object.keys(P).filter(k=>!/^open:/.test(k)));
  for(let i=0;i<LS.length;i++){ const k=LS.key(i)||''; if(/^steps:/.test(k)) stems.add(k.slice(6)); }
  Object.keys(P).forEach(k=>{ const m=k.match(/^open:(r\d+)$/); if(m&&P[k].v) stems.add(m[1]); });
  let best=null, bo=-1; stems.forEach(s=>{ const o=placeOf(s); if(o!=null&&o>bo){ bo=o; best=s; } }); return best?{page:best,id:null}:null; }
window.LadderFV={
  last,furthest,placeOf,climbed,climbChain,repairFurthest,certReach,
  resumeHref(){ const l=furthest()||guess(); return l&&l.page?href(l.page,l.id&&l.id!=='top'?l.id:null):null; },
  resume(){ const l=furthest()||guess(), h=this.resumeHref(); if(!h) return false;
    if(l.page===page()&&this.goId){ this.goId(l.id); return true; }
    ss.set('fv:want','fv');
    if(window.LADDER_PAGE&&window.__deskGo){ window.__deskGo(h); return true; }
    location.href=h; return true; },
  heights(){ ss.set('fv:heights','1'); ss.set('fv:glide','1'); try{ sessionStorage.setItem('desk:page','index'); sessionStorage.removeItem('desk:scroll'); }catch(e){} location.href='index.html'; } /* 0.3.20: the desk's index would otherwise reopen the last page */
};
/* the ladder itself: the app opens on the last footing, unless you came here by "dizzying heights" */
function onIndex(){
  if(!document.querySelector('.rungs')) return;
  const came=ss.get('fv:heights'); ss.del('fv:heights');
  const first=!ss.get('fv:session'); ss.set('fv:session','1');
  if(first&&!came&&!location.hash&&!window.LADDER_DESK){ let fs=null; try{ fs=LS.getItem('ladder:started'); }catch(e){}
    const h=LadderFV.resumeHref(); if(h){ ss.set('fv:want','fv'); location.replace(h); return; }
    if(fs!=='done'){ ss.set('fv:want','fv'); location.replace('start.html'); return; } }
  /* a row's link opens the page view; a footing in a row's footing list opens that footing */
  document.addEventListener('click',e=>{ const a=e.target.closest('a'); if(!a) return;
    if(a.closest('.flist')) ss.set('fv:want','fv'); else if(a.closest('.ladder')) ss.set('fv:want',window.LADDER_DESK?'page':'fv'); },true);
}
const REDUCE=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function footingView(){ try{ footingView0(); } finally { document.documentElement.classList.add('lk-paint'); } } /* 2026-11-10 (Andrew 15:10): the page shows only once the footing view has painted (or declined) */
function footingView0(){
  if(window.LADDER_DESK) return; /* 0.3.19 (Andrew 2026-11-05 10:14): the desk has only page view; the app has footing view */
  const wrap=document.querySelector('.wrap'); if(!wrap||document.querySelector('.rungs')) return;
  let steps=[...wrap.querySelectorAll(':scope>section.class.step')];
  /* 0.3.9 (Andrew 23:43): a page built as one class section with no footings (a rung's theory page, a rung's or a floor's
     conclusion) is one footing, so the climb runs through it on next and previous */
  if(!steps.length){ const one=wrap.querySelectorAll(':scope>section.class'); if(one.length===1){ one[0].classList.add('step'); if(!one[0].dataset.step) one[0].dataset.step=page(); steps=[one[0]]; } }
  if(!steps.length) return;
  const kids=[...wrap.children], i0=kids.indexOf(steps[0]), iN=kids.indexOf(steps[steps.length-1]);
  const units=[kids.slice(0,i0)];
  /* 0.3.8 (Andrew 23:28): a page of one footing (start, how to read the ladder, the floor pages) opens with its title and its
     footing together, not on a title alone */
  const ONE=steps.length===1;
  if(ONE) units[0].push(steps[0]); else steps.forEach(s=>units.push([s]));
  /* 0.3.2 (Andrew 21:27): what follows the last footing (the standing questions, the measuring stick, the links) is not a footing:
     it is reached from the toolbox, or by a link to it; "next" on the last footing goes to the first footing of the next page */
  const tail=kids.slice(iN+1); if(tail.length) units.push(tail);
  /* footings between the first and the last that are not steps ride with the footing before them */
  kids.slice(i0,iN+1).forEach(k=>{ if(!steps.includes(k)){ const prev=steps.filter(s=>kids.indexOf(s)<kids.indexOf(k)).pop(); units[steps.indexOf(prev)+1].push(k); } });
  units.forEach((u,n)=>u.forEach(el=>el.setAttribute('data-fvu',n)));
  const N=units.length, P=page(), LASTU=tail.length?N-2:N-1;
  /* the pages before and after on the climb: nav.nextrung as built, or the .pn rows pn() made of it (annex links relinked) */
  const pageLink=dir=>{ const a=document.querySelector(dir>0?'.pn .pnb.next[href], nav.nextrung a.pnb.next[href]':'.pn .pnb.prev[href], nav.nextrung a.pnb.prev[href]')
      ||[...document.querySelectorAll('nav.nextrung a')].find(x=>dir>0?/→/.test(x.textContent):(/←/.test(x.textContent)&&!/index\.html$/.test(x.getAttribute('href')||'')));
    const h=a&&a.getAttribute('href'); if(h&&(dir>0||!/^index\.html/.test(h))) return h;
    /* a floor page's links go back to the ladder only: its previous on the climb is the floor below's conclusion */
    const fm=dir<0&&P.match(/^floor(\d+)$/); return fm&&+fm[1]>1?'floor'+(+fm[1]-1)+'concl.html':null; };
  /* 0.3.7: forward, press the page's own next link, so a link a page has rewritten (the first run's floor 1 -> the dizzying
     heights) keeps its own handler; back, open the previous page at its last footing */
  const leave=(h,dir)=>{ ss.set('fv:want','fv'); if(dir>0){ const a=document.querySelector('.pn .pnb.next[href], nav.nextrung a.pnb.next[href]')||[...document.querySelectorAll('nav.nextrung a')].find(x=>/→/.test(x.textContent)); if(a&&a.getAttribute('href')===h){ a.click(); return; } }
    location.href=h.replace(/#.*$/,'')+(dir<0?'#last':''); };
  /* the blue sky waits until the top of the ladder is finished (Andrew 21:27) */
  const skyOpen=()=>window.LadderSky&&LadderSky.open&&LadderSky.open();
  const unitOf=el=>{ const u=el&&el.closest&&el.closest('[data-fvu]'); return u?+u.getAttribute('data-fvu'):-1; };
  const idOf=n=>n===0?'top':(n===N-1&&tail.length?'end':steps[n-1].dataset.step);
  let cur=0, on=false, busy=false;
  const up=document.createElement('button'); up.type='button'; up.className='fvnav fvup'; up.innerHTML='<span aria-hidden="true">▲</span> next';
  const dn=document.createElement('button'); dn.type='button'; dn.className='fvnav fvdn'; dn.innerHTML='<span aria-hidden="true">▼</span> previous';
  const pos=document.createElement('span'); pos.className='fvpos'; up.appendChild(pos);
  const sky=document.createElement('button'); sky.type='button'; sky.className='fvnav fvup fvsky'; sky.innerHTML='<span aria-hidden="true">☁</span> blue sky'; sky.hidden=true;
  sky.onclick=()=>{ if(window.LadderSky) LadderSky.supply(); };
  document.body.append(up,dn); if(!window.LADDER_DESK) document.body.append(sky); /* 0.3.57: no blue sky on the desk */
  const label=()=>{ const atEnd=cur>=LASTU, nextPage=atEnd?pageLink(1):null, prevPage=cur<=0?pageLink(-1):null;
    up.hidden=!on||(atEnd&&!nextPage); dn.hidden=!on||(cur<=0&&!prevPage); sky.hidden=!on||!atEnd||!!nextPage||!skyOpen();
    up.setAttribute('aria-label','next: '+(atEnd?(nextPage||''):idOf(cur+1))); dn.setAttribute('aria-label','previous: '+(cur>0?idOf(cur-1):(prevPage||'')));
    pos.textContent=!ONE&&cur>0&&cur<=steps.length?' · '+cur+' of '+steps.length:''; };
  /* 0.3.13 (Andrew 00:51): the page view's reveal ("next footing") hides the footings past the furthest opened; in the footing
     view, reaching a footing opens it, and the page view's record (steps:<page>) keeps up */
  const reveal=()=>{ units[cur].forEach(el=>{ if(el.hidden&&el.matches('section.step')) el.hidden=false; });
    const i=steps.indexOf(units[cur].find(el=>steps.includes(el))); if(i>=0) try{ const K='steps:'+P, o=parseInt(LS.getItem(K)||'1',10)||1; if(i+1>o) LS.setItem(K,String(i+1)); }catch(e){} };
  const paint=()=>{ reveal(); units.forEach((u,n)=>u.forEach(el=>el.classList.toggle('fv-on',n===cur))); document.body.classList.toggle('fv-notend',cur<N-1); label(); if(window.LadderFV&&LadderFV.onPaint) try{ LadderFV.onPaint(units[cur],cur,{on,N,LASTU,ONE}); }catch(e){} /* Phase G */ };
  const remember=()=>{ try{ LS.setItem(LK,JSON.stringify({page:P,id:idOf(cur),t:Date.now()})); }catch(e){} if(cur<=LASTU) climbed(P,idOf(cur),cur); };
  const top=()=>{ window.scrollTo(0,0); };
  function setMode(v){ on=v; document.body.classList.toggle('fv',on); if(on) paint(); else units.forEach(u=>u.forEach(el=>el.classList.remove('fv-on'))); label();
    const b=document.querySelector('#desk .dfv'); if(b) b.textContent=on?'Page view':'Footing view';
    try{ const pr=JSON.parse(LS.getItem('ladder:view')||'{}')||{}; pr[P]=on?'fv':'page'; LS.setItem('ladder:view',JSON.stringify(pr)); }catch(e){} }
  /* the cam (0.3.2, Andrew 21:27): the footing travels straight up or down; only its speed follows the cam. An elliptical cam
     (semi-axes 1 and 0.55) turning at an even rate lifts its follower by r(φ) = ab/√(b²cos²φ + a²sin²φ) as φ runs from π/2 to 0:
     the lift starts and ends at rest, and the ellipse sets how it gathers and loses speed in between. */
  const CA=1, CB=0.55, lift=t=>{ const ph=Math.PI/2*(1-t), r=CA*CB/Math.sqrt(CB*CB*Math.cos(ph)**2+CA*CA*Math.sin(ph)**2); return (r-CB)/(CA-CB); };
  const cam=(dir,H,W,outgoing,ax)=>{ const f=[]; for(let i=0;i<=32;i++){ const t=i/32, e=lift(t);
      const y=outgoing?dir*e*H:-dir*(1-e)*H;
      f.push({transform:'translate'+(ax||'Y')+'('+y.toFixed(1)+'px)',opacity:outgoing?1-0.35*e*e:0.35+0.65*e}); } /* 2026-11-10 (Andrew 15:59): ax 'X' for a sideways crossing */
    return f; };
  function go(n,opts){ opts=opts||{}; n=Math.max(0,Math.min(N-1,n)); if(n===cur&&!opts.force){ return; } if(busy) return;
    const from=cur, dir=n>from?1:-1; cur=n; window.LadderFV.dir=dir; window.LadderFV.wantEl=opts.el||null; /* Phase G: the swipe row starts at its far end when the climb goes back */
    if(!on||REDUCE()||opts.instant||from===n){ paint(); top(); remember(); if(opts.el) opts.el.scrollIntoView({block:'start'}); return; }
    busy=true;
    const H=innerHeight, W=Math.min(innerWidth,wrap.clientWidth||innerWidth);
    /* lift the old footing out of the flow, in place, so the new one can take its spot */
    const r=wrap.getBoundingClientRect(); const ghost=document.createElement('div'); ghost.className='wrap fvghost';
    ghost.style.cssText='margin:0;max-width:none;position:fixed;left:'+r.left+'px;width:'+r.width+'px;top:'+r.top+'px;z-index:40;pointer-events:none;background:'+getComputedStyle(document.body).backgroundColor+';box-shadow:0 10px 40px rgba(0,0,0,.18);border-radius:14px;padding-bottom:40px';
    const old=units[from], marks=old.map(el=>{ const c=document.createComment('fv'); el.replaceWith(c); return c; });
    old.forEach(el=>{ el.classList.add('fv-on'); ghost.appendChild(el); }); document.body.appendChild(ghost);
    reveal(); units[n].forEach(el=>el.classList.add('fv-on')); label(); top();
    /* 2026-11-10 (Andrew 15:48): the incoming footing's screens exist before it lifts in, so one screen arrives, not the whole footing */
    if(window.LadderFV&&LadderFV.onPaint) try{ const keepEl=LadderFV.wantEl, keepLast=LadderFV.wantLast; LadderFV.onPaint(units[n],n,{on,N,LASTU,ONE}); LadderFV.wantEl=keepEl; LadderFV.wantLast=keepLast; }catch(e){}
    const inc=units[n];
    const hz=!!opts.h, D=hz?-dir:dir, L=hz?W:H, ax=hz?'X':'Y', dur=hz?320:560; /* a horizontal swipe crosses sideways, the way the row slides */
    const a1=ghost.animate(cam(D,L,W,true,ax),{duration:dur,easing:'linear',fill:'forwards'});
    const a2=inc.map(el=>el.animate(cam(D,L,W,false,ax),{duration:dur,easing:'linear'}));
    a1.onfinish=()=>{ old.forEach((el,i)=>{ el.classList.remove('fv-on'); marks[i].replaceWith(el); }); ghost.remove(); paint(); busy=false; remember(); if(opts.el) opts.el.scrollIntoView({block:'start'}); };
  }
  const fwd=o=>{ if(cur>=LASTU){ const h=pageLink(1); if(h) leave(h,1); return; } go(cur+1,o&&o.h?{h:true}:undefined); };
  const back=o=>{ if(cur<=0){ const h=pageLink(-1); if(h) leave(h,-1); return; } go(Math.min(cur-1,LASTU),o&&o.h?{h:true}:undefined); };
  up.onclick=fwd; dn.onclick=back; window.LadderFV.fwd=fwd; window.LadderFV.back=back; /* Phase G: the row's ends climb */
  /* 0.3.40 (Andrew 12:08): on a keyboard, ↑ climbs to the next footing and ↓ goes back, as the ▲ and ▼ buttons do */
  document.addEventListener('keydown',e=>{ if(!on||busy||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey) return;
    if(e.key!=='ArrowUp'&&e.key!=='ArrowDown') return;
    const t=e.target; if(t&&(t.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(t.tagName))) return;
    if(document.querySelector('#desk.open,#stick,#agreebox:not([hidden])')||document.body.classList.contains('stickopen')||document.body.classList.contains('toolpage')) return;
    const b=e.key==='ArrowUp'?up:dn; if(b.hidden) return; e.preventDefault(); b.click(); });
  /* one finger: past the top edge of a footing, pulling down climbs to the next; past its bottom edge, pushing up goes back */
  let sy=null, sx=0, mode=0;
  const shut=t=>!!(t.closest&&t.closest('.slides,.pic,canvas,input,textarea,select,button,a,.mg,#desk,#lbar,.chq,.sayback .qid,.swbar,.unlocknote'));
  addEventListener('touchstart',e=>{ if(!on||busy||e.touches.length!==1||shut(e.target)) { sy=null; return; }
    sy=e.touches[0].clientY; sx=e.touches[0].clientX;
    const atTop=wrap.getBoundingClientRect().top>=-2, atFoot=innerHeight+scrollY>=document.documentElement.scrollHeight-4;
    mode=(atTop&&(cur<LASTU||pageLink(1))&&cur<=LASTU?1:0)|(atFoot&&(cur>0||pageLink(-1))&&cur<=LASTU?2:0); },{passive:true});
  /* not passive: a pull that climbs must not also be the browser's pull-to-refresh (Andrew 21:27: "it just reloads the page") */
  addEventListener('touchmove',e=>{ if(sy==null||!mode) return; const dy=e.touches[0].clientY-sy, dx=e.touches[0].clientX-sx;
    if(Math.abs(dx)>Math.abs(dy)) return; const pull=(mode&1&&dy>0)?dy:(mode&2&&dy<0)?dy:0;
    if(pull&&e.cancelable) e.preventDefault();
    units[cur].forEach(el=>el.style.transform=pull?'translateY('+(pull*0.35).toFixed(1)+'px)':''); },{passive:false});
  addEventListener('touchend',e=>{ if(sy==null) return; const t=e.changedTouches[0], dy=t.clientY-sy, dx=t.clientX-sx; sy=null;
    units[cur].forEach(el=>el.style.transform='');
    if(!mode||Math.abs(dx)>Math.abs(dy)) return;
    if(mode&1&&dy>90) fwd(); else if(mode&2&&dy<-90) back(); },{passive:true});
  /* a link to a paragraph or a footing on this page opens the footing that holds it */
  const toHash=()=>{ const h=decodeURIComponent((location.hash||'').slice(1)); if(!h) return false;
    let el=null; try{ el=document.getElementById(h)||document.querySelector('[data-step="'+CSS.escape(h)+'"]')||document.querySelector('[data-pid="'+CSS.escape(h)+'"]'); }catch(e){}
    if(h==='top') { go(0,{instant:true,force:true}); return true; } if(h==='end'){ go(N-1,{instant:true,force:true}); return true; }
    if(h==='last'){ go(LASTU,{instant:true,force:true}); return true; }
    const u=unitOf(el); if(u<0) return false; go(u,{instant:true,force:true,el:u>0?el:null}); return true; };
  addEventListener('hashchange',()=>{ if(on) toHash(); });
  document.addEventListener('click',e=>{ const a=e.target.closest('a[href^="#"]'); if(!a||!on) return; const id=a.getAttribute('href').slice(1); if(!id) return;
    let el=null; try{ el=document.getElementById(id)||document.querySelector('[data-pid="'+CSS.escape(id)+'"]'); }catch(x){} const u=unitOf(el); if(u>=0&&u!==cur){ e.preventDefault(); go(u,{el}); } });
  /* the mode: a link from the ladder's rows opens the page view; everything else opens the footing view */
  const want=ss.get('fv:want'); ss.del('fv:want');
  let pref=null; try{ pref=(JSON.parse(LS.getItem('ladder:view')||'{}')||{})[P]; }catch(e){}
  setMode(ss.get('fv:off')==='1'?false:want?want==='fv':(pref&&window.LADDER_DESK?pref==='fv':true)); /* fv:off = page view for checks */
  if(on){ if(!toHash()) go(0,{instant:true,force:true}); }
  /* what needs ladmap.js runs when it arrives: the climb record of this footing and its repair */
  window.LadderFV.mapReady=()=>{ try{ if(repairFurthest()) toast('the climb record was set back to your furthest footing'); }catch(e){} try{ if(on) remember(); }catch(e){} };
  if(window.LADMAP) window.LadderFV.mapReady();
  window.LadderFV.toggle=()=>{ const el=units[cur]&&units[cur][0]; setMode(!on); if(!on&&el&&cur>0) el.scrollIntoView({block:'start'}); else if(on) go(cur,{instant:true,force:true}); };
  window.LadderFV.go=n=>go(n);
  window.LadderFV.here=()=>({id:idOf(cur),els:on?units[cur]:[...document.querySelectorAll('.wrap>section.class.step')].filter(s=>{ const r=s.getBoundingClientRect(); return r.top<innerHeight*.5&&r.bottom>0; }).slice(0,1)});
  window.LadderFV.goId=id=>{ if(!on) setMode(true); const i=steps.findIndex(s=>s.dataset.step===id), n=id==='top'?0:id==='end'?N-1:(i<0?-1:ONE?0:1+i); go(n<0?0:n,{force:true}); };
}
const ladmap=()=>window.LADMAP?Promise.resolve():new Promise(res=>{ const s=document.createElement('script'); s.src='ladmap.js'; s.onload=s.onerror=()=>res(); document.head.appendChild(s); });
window.LadderFV.ladmap=ladmap;
ready(()=>{ /* 0.2.1: rung and floor pages carry no tags */ if(/^(r\d+|floor\d+)$/.test(page())) document.querySelectorAll(".top .tags").forEach(t=>t.remove()); footingView(); /* 2026-11-10 (Andrew 15:41): the footing view and its screens are built before the first frame, without the map */
  ladmap().then(()=>{ onIndex(); try{ if(window.LadderFV&&LadderFV.mapReady) LadderFV.mapReady(); }catch(e){} }); });
})();

/* ---- 0.2.1 the blue sky (Andrew 2026-11-04 19:13, 19:53): the Endless floor's steps come one at a time. The button sits at the very top
   of the index, each step it supplies goes directly under it, newest on top; in the footing view it takes the place of "next" on the
   last footing of a step, and a drag never presses it. The list is sky.js; what has been supplied is LS 'ladder:sky' {n}. */
(function(){
'use strict';
const KEY='ladder:sky';
const got=()=>{ try{ return (JSON.parse(LS.getItem(KEY)||'null')||{n:0}); }catch(e){ return {n:0}; } };
let list=null;
/* Arrow newsflashes (Andrew 2026-11-11 16:39Z): each stands in sky.js just before the first step of its subject, with a label
   in place of a number (n "·phys"). They arrive over several releases, so each is counted in once, by page, under
   ladder:skyIns: a learner who already had the step after it gets the newsflash with it; otherwise it is the next supplied. */
function skyIns(L){ try{ let done=JSON.parse(LS.getItem('ladder:skyIns')||'[]'); if(!Array.isArray(done)) done=[]; const st=got(); let ch=false, add=false;
    L.forEach((x,p)=>{ if(typeof x.n==='number'||done.includes(x.page)) return; if(st.n>p){ st.n++; ch=true; } done.push(x.page); add=true; });
    if(ch) LS.setItem(KEY,JSON.stringify(st)); if(add) LS.setItem('ladder:skyIns',JSON.stringify(done)); }catch(e){} return L; }
function load(){ if(list) return list;
  list=(window.LADDER_SKY?Promise.resolve(window.LADDER_SKY):new Promise(res=>{ const s=document.createElement('script'); s.src='sky.js'; s.onload=()=>res(window.LADDER_SKY||[]); s.onerror=()=>res([]); document.head.appendChild(s); })).then(skyIns); return list; }
function note(m){ let t=document.getElementById('patoast'); if(!t){ t=document.createElement('div'); t.id='patoast'; t.setAttribute('role','status'); document.body.appendChild(t); } t.textContent=m; t.classList.add('on'); clearTimeout(note.h); note.h=setTimeout(()=>t.classList.remove('on'),3200); }
function supply(){ load().then(L=>{ const st=got(); if(!L.length){ note('The blue sky could not load.'); return; }
    if(st.n>=L.length){ note('The blue sky is caught up: every step from the front is under the button. New ones come with new versions of the ladder.'); return; }
    const nx=L[st.n]; st.n++; st.at=(st.at||[]).concat([Date.now()]); try{ LS.setItem(KEY,JSON.stringify(st)); }catch(e){}
    try{ sessionStorage.setItem('sky:new',nx.page); }catch(e){} if(window.LadderFV&&LadderFV.heights) LadderFV.heights(); else location.href='index.html'; }); }
function index(){ const sec=document.getElementById('skysec'), top=document.getElementById('skytop'); if(!sec||!top) return;
  if(window.LADDER_DESK){ top.hidden=true; top.style.display='none'; } else { top.querySelector('.skybtn').onclick=supply; top.hidden=true; } sec.hidden=true; /* 0.3.57: no blue sky button on the desk */
  if(!window.LADMAP){ const s=document.createElement('script'); s.src='ladmap.js'; s.onload=()=>index(); document.head.appendChild(s); return; }
  if(!endless()&&!window.LADDER_DESK) return;
  load().then(L=>{ histRow(L); /* 0.3.57: the desk shows every Endless step; the app shows what the blue sky has supplied */ const n=window.LADDER_DESK?L.length:Math.min(got().n,L.length), ol=sec.querySelector('ol');
    const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
    let fresh=null; try{ fresh=sessionStorage.getItem('sky:new'); sessionStorage.removeItem('sky:new'); }catch(e){} window.__skyFresh=fresh;
    if(!n){ sec.hidden=true; return; }
    ol.innerHTML=L.slice(0,n).map(x=>/* 2026-11-08: the list is shown bottom-up (column-reverse), so ∞1 sits lowest and the newest on top */'<li class="k-sky built"><span class="n">∞'+(x.s||x.n)+'</span><span class="t"><a href="'+x.page+'.html">'+esc(x.title)+'</a><span class="kind">'+esc(x.kw)+'</span></span></li>').join('');
    sec.hidden=false;
    if(fresh){ const fa=ol.querySelector('a[href="'+fresh+'.html"]'); if(fa){ const li=fa.closest('li'); li.classList.add('fvhere'); setTimeout(()=>li.scrollIntoView({block:'center'}),80); setTimeout(()=>li.scrollIntoView({block:'center'}),700); } } }); }
/* 0.3.5 (Andrew 21:57): the Endless floor shows once rung 30 is finished: its core steps passed, its floor certified, or a footing above it climbed */
function endless(){ const M=window.LADMAP||[]; let P={}; try{ P=JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){}
  let r30=null; M.forEach(F=>F[1].forEach(R=>{ if(R[0]===30) r30=R; }));
  if(r30&&r30[1].length&&r30[1].every(([s])=>P[s]&&P[s].v)) return true;
  try{ const f=JSON.parse(LS.getItem('ladder:furthest')||'null'); const m=f&&f.page&&f.page.match(/^r(\d\d)/); if(m&&+m[1]>30) return true; }catch(e){}
  for(const k of ['cert:floor5concl','cert:r30concl']){ try{ const c=JSON.parse(LS.getItem(k)||'null'); if(c) return true; }catch(e){} }
  return false; }
/* 0.3.2 (Andrew 21:27): the blue sky does not appear until the top floor is finished: every core step of the ladder's
   last floor passed, or that floor measured */
function open(){ const M=window.LADMAP; if(!M||!M.length) return false; const F=M[M.length-1];
  let P={}; try{ P=JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){}
  let c=null; try{ c=JSON.parse(LS.getItem('cert:floor'+F[0]+'concl')||'null'); }catch(e){}
  if(c&&c.via!=='measure') return true;
  return F[1].length>0&&F[1].every(([,core])=>core.every(([s])=>P[s]&&P[s].v)); }
/* the History step (Andrew 2026-11-10 02:00-02:12): the fixed top of the ladder, one after the last infinity step; every new
   infinity step goes between the last one and it; hidden until the last infinity step is passed; no questions on its pages.
   Its row is #histsec in the index; its pages are hist0 (mathematics as a form) and hist1-hist6 (one per era). */
function histOpen(L){ if(!L||!L.length) return false; if(got().n<L.length) return false; let P={}; try{ P=JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){}
  const last=L[L.length-1].page; return !!(P[last]&&P[last].v); }
function histRow(L){ const hs=document.getElementById('histsec'); if(!hs) return; hs.hidden=!(window.LADDER_DESK||histOpen(L)); }
function histLinks(){ const pg=ladderPage(); if(!/^(inf\d+|hist0)$/.test(pg)) return; load().then(L=>{ if(!L.length) return; const last=L[L.length-1];
  const lab=(a,t)=>{ const l=a.classList.contains('pnb')?a.querySelector('.pl'):null; if(l) l.textContent=t; else a.textContent=t; };
  if(pg===last.page){ if(!histOpen(L)) return;
    document.querySelectorAll('.pn a.pnb.next, header.top .home a, nav.nextrung a').forEach(a=>{ if(/^index\.html/.test(a.getAttribute('href')||'')&&(a.classList.contains('next')||/→/.test(a.textContent))){ a.setAttribute('href','hist0.html'); lab(a,a.classList.contains('pnb')?'the top · the history of mathematics':'next: the top · the history of mathematics →'); } }); }
  else if(pg==='hist0'){ const t=String(last.title||''), tt='∞'+(last.s||last.n)+' · '+t.toLowerCase();
    document.querySelectorAll('.pn a.pnb.prev, header.top .home a, nav.nextrung a').forEach(a=>{ if(/^inf\d+\.html/.test(a.getAttribute('href')||'')){ a.setAttribute('href',last.page+'.html'); lab(a,a.classList.contains('pnb')?tt:'← '+tt); } }); } }); }
window.LadderSky={supply,load,open,endless,count:()=>got().n,histOpen,histLinks};
const go=()=>{ index(); histLinks(); };
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',go); else go();
})();

/* ---- 0.3.1 the measuring stick (Andrew 2026-11-04 20:25): the certification, renamed, with real sittings.
   A step's stick draws from its own pool: its crosswalk cards and its laundry question pools. A rung's stick draws from
   its steps' pools, a floor's from its rungs'. Pass with 80%. The record stays cert:<key> = {by, via, t, score}:
   a step's key is its page, a rung's is its last core step (as before), a floor's is floorNconcl.
   via 'stick' = sat at a section you reached; via 'measure' = measured into ahead from the index, which unlocks it,
   but its gold star waits until every floor below it is accomplished. */
(function(){
'use strict';
const get=(k,d)=>{ try{ const v=JSON.parse(LS.getItem(k)||'null'); return v==null?d:v; }catch(e){ return d; } };
const put=(k,v)=>{ try{ LS.setItem(k,JSON.stringify(v)); }catch(e){} };
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const shuffle=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const once={};
function script(src,test){ if(test&&test()) return Promise.resolve(true); if(once[src]) return once[src];
  return once[src]=new Promise(res=>{ const s=document.createElement('script'); s.src=src; s.onload=()=>res(true); s.onerror=()=>res(false); document.head.appendChild(s); }); }
const maps=()=>Promise.all([script('ladmap.js',()=>window.LADMAP),script('cardmap.js',()=>window.LADDER_CARDMAP)]);
const rand=()=>script('randomizer.js',()=>window.LadderRandomizer);
function rich(el,t){ el.innerHTML=''; String(t).split(/(\$[^$]+\$)/).forEach(p=>{ if(/^\$[^$]+\$$/.test(p)){ const sp=document.createElement('span'); const x=p.slice(1,-1);
    if(window.katex){ try{ katex.render(x,sp,{throwOnError:false,strict:false}); }catch(e){ sp.textContent=x; } } else sp.textContent=x; el.appendChild(sp); }
  else el.appendChild(document.createTextNode(p)); }); }
/* the shape of the ladder */
function where(stem){ const M=window.LADMAP||[]; for(const [fl,rungs] of M) for(let i=0;i<rungs.length;i++){ const [r,core,annex]=rungs[i];
    if(core.some(x=>x[0]===stem)||annex.some(x=>x[0]===stem)) return {fl,r,core:core.map(x=>x[0]),annex:annex.map(x=>x[0]),lastRung:i===rungs.length-1}; } return null; }
function rungOf(r){ const M=window.LADMAP||[]; for(const [fl,rungs] of M) for(let i=0;i<rungs.length;i++) if(rungs[i][0]===r) return {fl,r,core:rungs[i][1].map(x=>x[0]),annex:rungs[i][2].map(x=>x[0]),lastRung:i===rungs.length-1}; return null; }
function floorOf(fl){ const F=(window.LADMAP||[]).find(x=>x[0]===fl); return F?{fl,rungs:F[1].map(x=>x[0])}:null; }
/* pools */
const CM=s=>(window.LADDER_CARDMAP||{})[s]||[null,null,0];
/* 0.3.3 (Andrew 21:07): the stick populates itself from the techniques the step offers (tech/rNN.js, from the techs read),
   with the laundry's question pools for the step; the crosswalk cards fill in only where a step offers fewer than six. */
const techFile=stem=>{ const m=String(stem).match(/^r(\d\d)/); return m?'tech/r'+m[1]+'.js':null; };
async function techOf(stem){ const f=techFile(stem); if(!f) return []; await script(f,()=>window.LADDER_TECH&&window.LADDER_TECH[stem]); return (window.LADDER_TECH||{})[stem]||[]; }
function techQs(stem,own,rungAll){ const out=[]; const others=rungAll.filter(x=>x[0]!==own[0]);
  own.forEach((t,i)=>{ if(t[2]==='axiom') return; const dn=shuffle(rungAll.filter(x=>x[0]!==t[0]&&x[1]!==t[1])).slice(0,3); if(dn.length<3) return;
    out.push({id:'t:'+stem+'#'+i+'n', q:'Which technique says this?\n“'+t[1]+'”', a:t[0], w:dn.map(x=>x[0]), why:'It is '+t[0]+', built at '+stem.replace(/^r0?/,'')+'.', tag:stem});
    out.push({id:'t:'+stem+'#'+i+'w', q:'What does '+t[0]+' say?', a:t[1], w:dn.map(x=>x[1]), why:t[0]+': '+t[1], tag:stem}); });
  return out; }
async function stepTech(stem){ const own=(await techOf(stem)).map(x=>[x[0],x[1],x[2]]); if(!own.length) return [];
  const T=window.LADDER_TECH||{}, rp=String(stem).slice(0,3), all=[]; Object.keys(T).forEach(k=>{ if(k.slice(0,3)===rp) T[k].forEach(x=>all.push(x)); });
  return techQs(stem,own,all); }
async function cardsOf(stem){ const [tag,deck]=CM(stem); const out=[]; if(!deck) return out;
  await script('cards/'+deck+'.js',()=>window.LADDER_CARDS&&window.LADDER_CARDS[tag]);
  (window.LADDER_CARDS&&window.LADDER_CARDS[tag]||[]).forEach((c,i)=>out.push({id:tag+'#'+i,q:c.q,a:c.a,w:c.w||[],why:c.why||'',tag})); return out; }
async function qpOf(stem){ const [tag]=CM(stem); const out=[]; if(!tag) return out; await rand(); const R=window.LadderRandomizer;
  (R&&R.QP||[]).filter(P=>P.step===tag).forEach(P=>{ for(let k=0;k<4;k++){ let x=null; for(let t=0;t<20&&!x;t++) x=P.make(); if(x) out.push({id:x.index,q:x.lines.map(l=>l[0]).join('\n')+'\n'+x.ask,a:x.right,w:x.opts.filter(o=>o!==x.right),why:x.why,html:x.html,tag}); } }); return out; }
async function stepPool(stem){ let out=(await stepTech(stem)).concat(await qpOf(stem));
  if(out.length<6) out=out.concat(await cardsOf(stem)); return out; }
const pick=(arr,n)=>shuffle(arr.slice()).slice(0,n);
async function draw(scope,key){
  if(scope==='step') return pick(await stepPool(key),6);
  if(scope==='rung'){ const R=rungOf(key); if(!R) return []; let q=[]; for(const s of R.core) q=q.concat(pick(await stepPool(s),2)); return pick(q,Math.min(16,q.length)); }
  if(scope==='floor'){ const F=floorOf(key); if(!F) return []; let q=[]; for(const r of F.rungs){ const R=rungOf(r); let rq=[]; for(const s of R.core) rq=rq.concat(pick(await stepPool(s),1)); q=q.concat(pick(rq,2)); } return shuffle(q); }
  return []; }
/* keys and records */
function certKey(scope,key){ if(scope==='step') return key; if(scope==='rung'){ const R=rungOf(key); return R?R.core[R.core.length-1]:null; } if(scope==='floor') return 'floor'+key+'concl'; return null; }
const read=k=>get('cert:'+k,null);
function unlock(scope,key){ const set=stem=>{ if(window.MarksSync&&MarksSync.reportPage) MarksSync.reportPage('open:'+stem,true,true,true,false);
    else { const p=get('pages:done',{}); p['open:'+stem]={v:true,a:true,o:true,h:false,t:Date.now()}; put('pages:done',p); } };
  const rr=r=>set('r'+String(r).padStart(2,'0'));
  if(scope==='step'){ const w=where(key); if(w) rr(w.r); } else if(scope==='rung') rr(key); else if(scope==='floor'){ const F=floorOf(key); if(F) F.rungs.forEach(rr); } }
const label=(scope,key)=>scope==='step'?(CM(key)[0]||key):scope==='rung'?'rung '+key:'floor '+key;
/* the sitting */
let box=null;
function close(){ if(box){ box.remove(); box=null; document.body.classList.remove('stickopen'); } }
async function sit(scope,key,opts){ opts=opts||{}; close();
  box=document.createElement('div'); box.id='stick'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','the measuring stick'); document.body.appendChild(box); document.body.classList.add('stickopen');
  const head=t=>'<div class="sk-top"><span>the measuring stick · '+esc(label(scope,key))+(opts.into?' · testing in to '+esc(label(opts.into[0],opts.into[1])):'')+'</span><button type="button" class="sk-x" aria-label="close">×</button></div>';
  const wire=()=>{ const x=box.querySelector('.sk-x'); if(x) x.onclick=close; };
  box.innerHTML='<div class="sk-card">'+head()+'<p class="sk-q">Gathering the questions…</p></div>'; wire();
  await maps(); const qs=await draw(scope,key);
  if(!qs.length){ box.innerHTML='<div class="sk-card">'+head()+'<p class="sk-q">This section has no question pool yet, so its measuring stick cannot be sat.</p></div>'; wire(); return; }
  const need=Math.ceil(qs.length*0.8); let i=0, right=0;
  const show=()=>{ const c=qs[i]; const opts=shuffle([c.a].concat(c.w.slice(0,3)));
    box.innerHTML='<div class="sk-card">'+head()+'<p class="sk-n">question '+(i+1)+' of '+qs.length+' · '+need+' right to pass</p><div class="sk-q"></div><div class="sk-opts"></div><p class="sk-why" hidden></p><p><button type="button" class="sk-next" hidden>'+(i+1<qs.length?'next':'finish')+'</button></p></div>'; wire();
    const qe=box.querySelector('.sk-q'); String(c.q).split('\n').forEach((ln,k)=>{ const p=document.createElement('div'); rich(p,ln); if(k) p.style.marginTop='4px'; qe.appendChild(p); });
    const oe=box.querySelector('.sk-opts');
    opts.forEach(o=>{ const b=document.createElement('button'); b.type='button'; b.className='sk-o'; b.dataset.v=o; if(c.html&&c.html[o]){ b.innerHTML=c.html[o]; b.setAttribute('aria-label',o); b.classList.add('sk-g'); } else rich(b,o);
      b.onclick=()=>{ if(oe.dataset.done) return; oe.dataset.done='1'; const ok=o===c.a; if(ok) right++;
        oe.querySelectorAll('.sk-o').forEach(x=>{ x.disabled=true; if(x.dataset.v===c.a) x.classList.add('ok'); }); if(!ok) b.classList.add('no');
        const w=box.querySelector('.sk-why'); w.hidden=false; rich(w,(ok?'Right. ':'Not this one. ')+(c.why||'')); box.querySelector('.sk-next').hidden=false; };
      oe.appendChild(b); });
    box.querySelector('.sk-next').onclick=()=>{ i++; if(i<qs.length) show(); else end(); }; };
  const end=()=>{ const pass=right>=need, k=certKey(scope,key);
    if(pass&&k){ const old=read(k); const via=opts.via||'stick'; if(!old||(old.via==='measure'&&via==='stick')) put('cert:'+k,{by:'self',via,scope,t:Date.now(),score:right+'/'+qs.length,into:opts.into?opts.into.join(' '):null}); if(via==='measure') unlock.apply(null,opts.into||[scope,key]);
      if(opts.into){ const [isc,ik]=opts.into, rs=isc==='rung'?[ik]:((floorOf(ik)||{}).rungs||[]); rs.forEach(r=>put('cert:in:r'+String(r).padStart(2,'0'),{by:'self',via:'testin',t:Date.now(),from:scope+' '+key})); } }
    box.innerHTML='<div class="sk-card">'+head()+'<p class="sk-q">'+right+' of '+qs.length+' right. '+(pass?(opts.via==='measure'?'It measures up: '+esc(opts.into?label(opts.into[0],opts.into[1]):label(scope,key))+' is unlocked. Its gold star waits until every floor below it is done.':'It measures up: a gold star.'):'Not yet: '+need+' were needed. Sit it again whenever you like; the questions are drawn fresh.')+'</p><p><button type="button" class="sk-again">'+(pass?'close':'sit it again')+'</button></p></div>'; wire();
    box.querySelector('.sk-again').onclick=()=>{ if(pass) close(); else sit(scope,key,opts); };
    if(window.__barStats) window.__barStats(); if(opts.done) opts.done(pass); };
  show(); }
window.LadderStick={sit,read,certKey,where,rungOf,floorOf,stepPool,draw,maps,stepTech,techOf,techQs};
})();

/* ---- 0.3.1 measure into (Andrew 20:25): a small ruler on the index rows you have not reached or finished,
   and the toolbox's "Measuring stick", which lists the sections you have finished. */
(function(){
'use strict';
const RULER='<svg viewBox="0 0 24 12" width="20" height="10" aria-hidden="true"><rect x="1" y="1" width="22" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 1v4M9 1v6M13 1v4M17 1v6M21 1v4" stroke="currentColor" stroke-width="1.4"/></svg>';
const pages=()=>{ try{ return JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){ return {}; } };
const cert=k=>{ try{ return JSON.parse(LS.getItem('cert:'+k)||'null'); }catch(e){ return null; } };
const S=()=>window.LadderStick;
const stemOf=li=>{ const a=li.querySelector(':scope>.t>a'); const m=a&&(a.getAttribute('href')||'').match(/^([^#.]+)\.html/); return m?m[1]:null; };
const GOLD='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 2.6l2.8 6.1 6.6.7-4.9 4.5 1.4 6.6L12 17.2l-5.9 3.3 1.4-6.6L2.6 9.4l6.6-.7z" fill="currentColor"/></svg>';
function icon(li,scope,key,title){ if(li.querySelector('.msr')) return;
  /* 0.3.25 (Andrew 11:08): once its test is passed, the ruler turns into a gold star (still tap to sit it again) */
  const got=S().certKey&&cert(S().certKey(scope,key)); if(got) title=title.replace(/^measure/,'measured ★ · sit again:');
  const b=document.createElement('button'); b.type='button'; b.className='msr'+(got?' msr-gold':''); b.title=title; b.setAttribute('aria-label',title); b.innerHTML=got?GOLD:RULER;
  b.onclick=e=>{ e.preventDefault(); e.stopPropagation(); if(!S()) return; S().sit(scope,key,{via:'measure',done:ok=>{ if(ok) setTimeout(()=>location.reload(),1600); }}); };
  (li.querySelector(':scope>.t')||li).appendChild(b); }
function indexIcons(){ if(!document.querySelector('.rungs')||!S()) return Promise.resolve();
  /* 0.3.23 (Andrew 11:04): the ruler sits beside a step, rung or floor already unlocked, and measures it.
     A locked row has no icon: tapping it tests in, with the last test before it. */
  return S().maps().then(()=>{ const vis=li=>!li.classList.contains('lk-hide')&&!li.classList.contains('lk-shut')&&!li.closest('section.lk-hide');
    document.querySelectorAll('.rungs .msr').forEach(b=>b.remove()); if(window.__footCount) __footCount();
    /* 0.3.39 (Andrew 12:06): floor and rung rows carry no ruler. A rung's last step carries the rung's test in place of its own;
       the last step of a floor's last rung carries the floor's test. Every other step carries its own. */
    document.querySelectorAll('section.rung li.built:not(.k-theory):not(.k-floor)').forEach(li=>{ const s=stemOf(li); if(!s||!vis(li)) return; const w=S().where(s); if(!w) return;
      if(w.core[w.core.length-1]===s){ if(w.lastRung) icon(li,'floor',w.fl,'measure floor '+w.fl); else icon(li,'rung',w.r,'measure rung '+w.r); return; }
      icon(li,'step',s,'measure this step'); });
  }); }
/* testing in: a locked rung or floor gives the last test before it */
function testIn(li){ const s=S(); if(!s) return; const M=window.LADMAP||[];
  if(li.classList.contains('k-floor')){ const m=(stemOf(li)||'').match(/^floor(\d+)$/); if(!m) return; const F=+m[1], k=M.findIndex(x=>x[0]===F); if(k<1) return;
    s.sit('floor',M[k-1][0],{via:'measure',into:['floor',F],done:ok=>{ if(ok) setTimeout(()=>location.reload(),1600); }}); return; }
  const n=+((li.querySelector(':scope>.n')||{}).textContent||'').trim(); if(isNaN(n)) return;
  const order=[]; M.forEach(([fl,rungs])=>rungs.forEach(r=>order.push(r[0]))); const k=order.indexOf(n); if(k<1) return;
  s.sit('rung',order[k-1],{via:'measure',into:['rung',n],done:ok=>{ if(ok) setTimeout(()=>location.reload(),1600); }}); } /* a locked rung: the previous rung's test; a locked floor: the previous floor's */
/* the toolbox list: every finished section, with its measure */
function finished(){ const M=window.LADMAP||[], P=pages(), FV=window.LadderFV, f=FV&&FV.furthest&&FV.furthest(), at=f&&f.ord!=null?Math.floor(f.ord/1000):-1e9,
    pl=s=>{ const x=FV&&FV.placeOf?FV.placeOf(s):null; return x==null?1e9:x; }, done=s=>!!(P[s]&&P[s].v), v=s=>done(s)||at>=pl(s), past=s=>done(s)||at>pl(s), out=[];
  M.forEach(([fl,rungs])=>{ const F={fl,rows:[]}; let all=rungs.length>0;
    rungs.forEach(([r,core,annex])=>{ const steps=core.concat(annex).map(x=>x[0]).filter(v); steps.forEach(s=>F.rows.push(['step',s]));
      const rd=core.every(x=>past(x[0])); if(rd) F.rows.push(['rung',r]); all=all&&rd; });
    if(all) F.rows.push(['floor',fl]); if(F.rows.length) out.push(F); });
  return out; }
function list(){ const s=S(); if(!s) return;
  s.maps().then(()=>{ const box=document.createElement('div'); box.id='stick'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','the measuring stick'); document.body.appendChild(box); document.body.classList.add('stickopen');
    const F=finished(), lab=(sc,k)=>sc==='step'?((window.LADDER_CARDMAP||{})[k]||[k])[0]:sc+' '+k;
    const st=(sc,k)=>{ const c=cert(s.certKey(sc,k)); return c?(c.via==='measure'?'measured ahead':'★ measured '+(c.score||'')):'not yet measured'; };
    box.innerHTML='<div class="sk-card"><div class="sk-top"><span>the measuring stick</span><button type="button" class="sk-x" aria-label="close">×</button></div>'
      +(F.length?'<p class="sk-n">The sections you have reached. Each measure draws fresh questions from its own pool; 80% passes and gives the gold star.</p>'
        +F.map(f=>'<details class="sk-fl"'+(f===F[F.length-1]?' open':'')+'><summary>floor '+f.fl+' · '+f.rows.length+'</summary><ul class="sk-list">'
          +f.rows.map(([sc,k])=>'<li><button type="button" class="sk-sit" data-s="'+sc+'" data-k="'+k+'">'+lab(sc,k)+'</button> <span class="sk-st">'+st(sc,k)+'</span></li>').join('')+'</ul></details>').join('')
        :'<p class="sk-q">Nothing is reached yet. Each step’s measuring stick is here as soon as you reach it. To test into a section you have not reached, use the small ruler beside it on the ladder.</p>')+'</div>';
    box.querySelector('.sk-x').onclick=()=>{ box.remove(); document.body.classList.remove('stickopen'); };
    box.querySelectorAll('.sk-sit').forEach(b=>b.onclick=()=>{ const sc=b.dataset.s, k=sc==='step'?b.dataset.k:+b.dataset.k; box.remove(); s.sit(sc,k,{via:'stick'}); });
  }); }
/* toolscreens */ /* the same list, written into a given element (the Answering Questions screen) */
function fill(el,before){ const s=S(); if(!s||!el) return; s.maps().then(()=>{
    const F=finished(), lab=(sc,k)=>sc==='step'?((window.LADDER_CARDMAP||{})[k]||[k])[0]:sc+' '+k;
    const GU=window.__starUnits?window.__starUnits():null, GS=new Set(GU?GU.gold:[]), GSTAR='<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21.1l1.6-7L2 9.3l7.1-.7z"/></svg>'; /* ansq */
    const rOf=(sc,k)=>sc==='rung'?+k:sc==='step'?+((String(k).match(/^r0*(\d+)/)||[])[1]):null;
    const mrow=([sc,k])=>'<li><button type="button" class="sk-msit" data-s="'+sc+'" data-k="'+k+'">'+lab(sc,k)+'</button> <span class="sk-st">'+st(sc,k)+'</span></li>';
    const rungsOf=rows=>{ const g=[]; rows.forEach(x=>{ const r=rOf(x[0],x[1]), l=g[g.length-1]; if(l&&l.r===r&&r!=null) l.h+=mrow(x); else g.push({r,h:mrow(x)}); });
      return g.map(o=>o.r!=null&&GS.has('rung '+o.r)?'<li class="sk-wingli"><details class="sk-wing sk-star sk-star-gold"><summary aria-label="rung '+o.r+', gold star earned: its measures">'+GSTAR+' rung '+o.r+'</summary><ul class="sk-list">'+o.h+'</ul></details></li>':o.h).join(''); };
    const st=(sc,k)=>{ const c=cert(s.certKey(sc,k)); return c?(c.via==='measure'?'measured ahead':'★ measured '+(c.score||'')):'not yet measured'; };
    el.innerHTML=F.length?'<p class="sk-n">The sections you have reached. Each measure draws fresh questions from its own pool; 80% passes and gives the gold star.</p>'
        +F.map(f=>'<details class="sk-fl"'+(f===F[F.length-1]?' open':'')+'><summary>floor '+f.fl+' · '+f.rows.length+'</summary><ul class="sk-list">'
          +rungsOf(f.rows)+'</ul></details>').join('')
      :'<p class="sk-n">Nothing is reached yet. Each step’s measuring stick is here as soon as you reach it. To test into a section you have not reached, use the small ruler beside it on the ladder.</p>';
    el.querySelectorAll('.sk-msit').forEach(b=>b.onclick=()=>{ const sc=b.dataset.s, k=sc==='step'?b.dataset.k:+b.dataset.k; if(before) before(); s.sit(sc,k,{via:'stick'}); }); }); }
window.LadderMeasure={list,fill,finished,indexIcons,testIn}; /* 0.3.23: LadderLock draws the icons once the rows are settled */
})();

/* ---- 0.3.25 (Andrew 11:08) index rows: the title sits on the row's centre whatever comes with it. The ruler or gold star
   sit in the row's right column, as wide as the number's column on the left, with the closed footing list; the tag,
   "you are here" and cues go on a line below the title. An open footing list spans the row, centred (Andrew 11:14).
   The footing list's button is a blue star outline with x/n: n footings, x understand questions ticked (und.js). */
(function(){
'use strict';
const SIDE=n=>n.nodeType===1&&(n.matches('.msr,.certrow,svg,img')||n.tagName==='BUTTON'); /* these go to the row's right column */
function tidy(t){ if(!t||!t.querySelector(':scope>a')) return; const li=t.parentElement; let tr=li.querySelector(':scope>.tr'), tb=li.querySelector(':scope>.tb');
  /* 0.3.35 (Andrew 11:50): tags and "you are here" sit under the address (the number), left-aligned; ruler and closed footings on the right */
  if(!tr){ tr=document.createElement('span'); tr.className='tr'; li.insertBefore(tr,t.nextSibling); } if(!tb){ tb=document.createElement('span'); tb.className='tb'; li.insertBefore(tb,t); }
  [...t.childNodes].forEach(n=>{ if(n===tr||n===tb||(n.nodeType===1&&n.tagName==='A')) return; if(n.nodeType===3){ if(!n.textContent.trim()) return; tb.appendChild(n); return; } (SIDE(n)?tr:tb).appendChild(n); });
  tr.hidden=!tr.childNodes.length; tb.hidden=!tb.childNodes.length; }
const STAR='<svg class="fstar" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 2.6l2.8 6.1 6.6.7-4.9 4.5 1.4 6.6L12 17.2l-5.9 3.3 1.4-6.6L2.6 9.4l6.6-.7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
const J=k=>{ try{ return JSON.parse(LS.getItem(k)||'null'); }catch(e){ return null; } };
function footCount(){ const U=window.LADDER_UND||{};
  /* 0.3.26 (Andrew 11:23): a footing whose understand question is ticked turns teal in the list; the star stays hidden
     until every footing is, then shows as a teal star. A step with no understand questions just says "n footings". */
  document.querySelectorAll('.rungs .ladder li>details.flist').forEach(d=>{ const sm=d.querySelector('summary'); if(!sm) return;
    const items=[...d.querySelectorAll(':scope ol>li')], n=items.length; const a=d.parentElement.querySelector(':scope>.t>a'); const m=a&&(a.getAttribute('href')||'').match(/^(?:view\.html#p=)?([^#.&]+)/);
    const u=m&&U[m[1]]; const st=u?(J(window.__titledKey?__titledKey('marks:',u[0]):'marks:'+u[0])||{}):{}; const done=new Set(); if(u) u[1].forEach(([f,q])=>{ if(st['q:'+q]) done.add(f); });
    items.forEach(li=>{ const h=((li.querySelector('a')||{}).getAttribute?li.querySelector('a').getAttribute('href'):'')||''; const f=decodeURIComponent((h.split('#')[1]||'').replace(/^.*[&;]h=/,'')); li.classList.toggle('fdone',!!f&&done.has(f)); });
    const x=Math.min(items.filter(li=>li.classList.contains('fdone')).length,n), full=!!u&&n>0&&x>=n;
    let lab=sm.querySelector(':scope>.fslab'); if(!lab){ [...sm.childNodes].forEach(c=>c.remove()); sm.insertAdjacentHTML('afterbegin',STAR+'<span class="fslab"></span>'); lab=sm.querySelector(':scope>.fslab'); }
    lab.innerHTML=(u?x+'/'+n:n)+' <span class="fsw">footings</span>'; sm.classList.toggle('fsnoq',!u); sm.classList.toggle('fsfull',full);
    sm.setAttribute('aria-label',(u?x+' of '+n+' footings understood':n+' footings')+'; show or hide the footings'); }); }
window.__footCount=footCount;
function start(){ const R=document.querySelector('.rungs'); if(!R) return;
  R.querySelectorAll('.ladder>li>.t').forEach(tidy);
  new MutationObserver(ms=>{ const ts=new Set(); ms.forEach(m=>{ if(m.target.classList&&m.target.classList.contains('t')&&m.addedNodes.length) ts.add(m.target);
      if(m.target.classList&&(m.target.classList.contains('tr')||m.target.classList.contains('tb'))){ m.target.hidden=!m.target.childNodes.length; } });
    ts.forEach(tidy); }).observe(R,{childList:true,subtree:true});
  const go=()=>footCount(); if(window.LADDER_UND) go(); else { const s=document.createElement('script'); s.src='und.js'; s.onload=go; document.head.appendChild(s); } }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();

/* ---- 0.3.1 standing questions (Andrew 2026-11-04 20:25): each standing question walks a branching tree.
   Trees live in sq/<stem>.js as window.LADDER_SQ[chid] = {kind, start, n:{id:node}, areas?}.
   challenge kind: node {t, c:[{t, why, go:id} | {t, why, win:1} | {t, why, fail:1}]}. Each choice says why it is the
     right or wrong path; a right end finishes it; a wrong path locks it for 6 minutes, then 1 hour, 10 hours,
     4.16 days, ... (each lock ten times the last).
   debate kind: node {t, area:k, c:[{t, cost, faces, go:id}]} or a leaf {t, area:k, end:1}. Every choice is
     supported: it says what the choice costs in the discourse and what it faces. It finishes at a leaf, and every leaf
     lies in one of the debate's last two areas of inquiry.
   Record: sq:<chid> = {fails, until, done, t}. Finishing ticks the question (c:<chid>) on its page.
   The toolbox's "Standing questions" lists the standing questions of every step you have finished (sq/index.js). */
(function(){
'use strict';
const get=(k,d)=>{ try{ const v=JSON.parse(LS.getItem(k)||'null'); return v==null?d:v; }catch(e){ return d; } };
const put=(k,v)=>{ try{ LS.setItem(k,JSON.stringify(v)); }catch(e){} };
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const once={};
function script(src,test){ if(test&&test()) return Promise.resolve(true); if(once[src]) return once[src];
  return once[src]=new Promise(res=>{ const s=document.createElement('script'); s.src=src; s.onload=()=>res(true); s.onerror=()=>res(false); document.head.appendChild(s); }); }
function rich(el,t){ el.innerHTML=''; String(t).split('\n').forEach((ln,k)=>{ const d=document.createElement(k?'p':'span'); if(k) d.style.margin='.4em 0 0';
  ln.split(/(\$[^$]+\$)/).forEach(p=>{ if(/^\$[^$]+\$$/.test(p)){ const sp=document.createElement('span'); const x=p.slice(1,-1);
    if(window.katex){ try{ katex.render(x,sp,{throwOnError:false,strict:false}); }catch(e){ sp.textContent=x; } } else sp.textContent=x; d.appendChild(sp); }
    else d.appendChild(document.createTextNode(p)); }); el.appendChild(d); }); }
const stemOf=chid=>{ const tag=String(chid).split('.')[0]; const M=window.LADDER_CARDMAP||{}; for(const s in M) if(M[s][0]===tag) return s;
  const m=tag.match(/^(\d+)([a-z]+\d*)$/); if(m) return 'r'+m[1].padStart(2,'0')+m[2]; const n=tag.match(/^(\d+)·(.+)$/); return n?'r'+n[1].padStart(2,'0')+n[2]:null; };
const trees=stem=>script('sq/has.js',()=>window.LADDER_SQHAS).then(()=>(window.LADDER_SQHAS||[]).includes(stem)?script('sq/'+stem+'.js',null):null).then(()=>window.LADDER_SQ||{});
const LOCK0=6*60*1000;
const lockFor=f=>LOCK0*Math.pow(10,Math.max(0,f-1));
function left(ms){ const m=Math.ceil(ms/60000); if(m<60) return m+' minute'+(m===1?'':'s'); const h=ms/3600000; if(h<48) return (Math.round(h*10)/10)+' hours'; return (Math.round(h/24*100)/100)+' days'; }
/* the walk */
let box=null;
function close(){ if(box){ box.remove(); box=null; document.body.classList.remove('stickopen'); } }
function frame(chid,kind){ close(); box=document.createElement('div'); box.id='stick'; box.className='sqbox'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','standing question '+chid);
  document.body.appendChild(box); document.body.classList.add('stickopen');
  box.innerHTML='<div class="sk-card"><div class="sk-top"><span>standing question '+esc(chid)+(kind?' · '+(kind==='debate'?'a debate':'a path to the answer'):'')+'</span><button type="button" class="sk-x" aria-label="close">×</button></div><div class="sq-body"></div></div>';
  box.querySelector('.sk-x').onclick=close; return box.querySelector('.sq-body'); }
function finish(chid){ const r=get('sq:'+chid,{}); r.done=true; r.t=Date.now(); put('sq:'+chid,r);
  const el=[...document.querySelectorAll('section.challenge .chid')].find(e=>e.textContent.trim()===chid);
  if(el&&!el.classList.contains('done')&&el.__tick) el.__tick();
  if(window.__barStats) window.__barStats(); }
/* 2026-11-12 (Andrew 21:26Z): every end of a tree offers the way back to the Answering Open Questions list */
function backBtn(to){ const p=document.createElement('p'); p.innerHTML='<button type="button" class="sq-back">Answering Questions</button>'; p.querySelector('.sq-back').onclick=()=>list(); to.appendChild(p); }
function walk(chid,opts){ opts=opts||{}; const stem=opts.stem||stemOf(chid);
  const body=frame(chid); body.innerHTML='<p class="sk-q">Gathering the path…</p>';
  trees(stem).then(T=>{ const tr=T[chid]; if(!tr){ body.innerHTML='<p class="sk-q">This standing question has no branching path yet. You can still work it on paper and tick it on its page.</p>'; return; }
    const top=box.querySelector('.sk-top span'); top.textContent='standing question '+chid+' · '+(tr.kind==='debate'?'a debate':'a path to the answer');
    const rec=get('sq:'+chid,{fails:0});
    if(tr.kind!=='debate'&&rec.until&&rec.until>Date.now()&&!rec.done){ body.innerHTML='<p class="sk-q">This one is resting. It opens again in '+left(rec.until-Date.now())+'. Each wrong path rests it ten times longer than the last; the time is for thinking it through away from the screen.</p>'; backBtn(body); return; }
    const trail=[]; let node=tr.start;
    const show=()=>{ const N=tr.n[node]; body.innerHTML='';
      if(tr.kind==='debate'&&tr.areas&&N.area!=null){ const a=document.createElement('p'); a.className='sk-n'; a.textContent='area of inquiry '+(N.area+1)+' of '+tr.areas.length+': '+tr.areas[N.area]; body.appendChild(a); }
      if(trail.length){ const tl=document.createElement('p'); tl.className='sq-trail'; tl.textContent=trail.map(x=>'› '+x).join(' '); body.appendChild(tl); }
      const q=document.createElement('div'); q.className='sk-q'; rich(q,N.t); body.appendChild(q);
      if(N.end){ const e=document.createElement('p'); e.className='sq-end'; e.textContent=opts.review?'This is the bottom of the debate along this line.':'You have reached the bottom of the debate along this line. The standing question is answered for you: '+(rec.done?'it was already ticked.':'it is ticked on its step.'); body.appendChild(e);
        if(!opts.review) finish(chid); const again=document.createElement('p'); again.innerHTML='<button type="button" class="sk-again">walk another line</button> <button type="button" class="sq-close">close</button> <button type="button" class="sq-back">Answering Open Questions</button>'; body.appendChild(again); again.querySelector('.sq-back').onclick=()=>list();
        again.querySelector('.sk-again').onclick=()=>{ trail.length=0; node=tr.start; show(); }; again.querySelector('.sq-close').onclick=close; return; }
      const oe=document.createElement('div'); oe.className='sk-opts'; body.appendChild(oe);
      const fb=document.createElement('div'); fb.className='sq-fb'; fb.hidden=true; body.appendChild(fb);
      const nx=document.createElement('p'); nx.hidden=true; nx.innerHTML='<button type="button" class="sk-next">go on</button>'; body.appendChild(nx);
      N.c.forEach(c=>{ const b=document.createElement('button'); b.type='button'; b.className='sk-o'; rich(b,c.t);
        b.onclick=()=>{ if(oe.dataset.done) return; oe.dataset.done='1'; oe.querySelectorAll('.sk-o').forEach(x=>x.disabled=true); b.classList.add('picked'); fb.hidden=false; fb.innerHTML='';
          if(tr.kind==='debate'){ b.classList.add('ok');
            const p1=document.createElement('p'); p1.innerHTML='<b>What it costs you.</b> '; const s1=document.createElement('span'); rich(s1,c.cost||''); p1.appendChild(s1);
            const p2=document.createElement('p'); p2.innerHTML='<b>What it faces.</b> '; const s2=document.createElement('span'); rich(s2,c.faces||''); p2.appendChild(s2); fb.append(p1,p2);
            nx.hidden=false; nx.querySelector('.sk-next').onclick=()=>{ trail.push(c.t.replace(/\$/g,'').slice(0,40)); node=c.go; show(); }; return; }
          const w=document.createElement('p'); rich(w,(c.fail?'Not this path. ':'Right. ')+(c.why||'')); fb.appendChild(w);
          if(c.fail){ b.classList.add('no'); if(!opts.review&&!rec.done){ rec.fails=(rec.fails||0)+1; rec.until=Date.now()+lockFor(rec.fails); put('sq:'+chid,rec);
              const l=document.createElement('p'); l.className='sq-end'; l.textContent='The question rests for '+left(lockFor(rec.fails))+'. Next time it opens at the start.'; fb.appendChild(l); backBtn(fb); }
            else { nx.hidden=false; nx.querySelector('.sk-next').textContent='back one'; nx.querySelector('.sk-next').onclick=()=>show(); } return; }
          b.classList.add('ok');
          if(c.win){ const l=document.createElement('p'); l.className='sq-end'; l.textContent=opts.review?'That is the answer.':'That is the answer. The standing question is ticked on its step.'; fb.appendChild(l); if(!opts.review) finish(chid); backBtn(fb); return; }
          nx.hidden=false; nx.querySelector('.sk-next').onclick=()=>{ trail.push(c.t.replace(/\$/g,'').slice(0,40)); node=c.go; show(); }; };
        oe.appendChild(b); }); };
    show(); }); }
/* on a step: a standing question with a tree opens its walk from its label */
function pageHooks(){ const ids=[...document.querySelectorAll('section.challenge .chid')].filter(e=>!e.closest('#desk')); if(!ids.length) return;
  const stem=(location.pathname.split('/').pop()||'').replace(/\.html$/,''); if(!stem) return;
  const go=()=>trees(stem).then(T=>{ ids.forEach(el=>{ const id=el.textContent.trim(), tr=T[id]; if(!tr) return; const q=el.closest('.chq'); if(!q||q.querySelector('.sqgo')) return;
      const b=document.createElement('button'); b.type='button'; b.className='sqgo'; b.textContent=tr.kind==='debate'?'walk the debate':'walk the path';
      b.onclick=e=>{ e.preventDefault(); e.stopPropagation(); walk(id,{stem}); }; q.appendChild(b);
      /* walked to its end from the toolbox: tick it here */
      if(get('sq:'+id,{}).done&&!el.classList.contains('done')&&el.__tick) el.__tick(); });
      /* 2026-11-12 (Andrew 2026-11-11 18:26Z): with a tree for every question, the block is one button into Answering Open Questions */
      if(!window.LADDER_DESK) new Set(ids.map(el=>el.closest('section.challenge'))).forEach(sec=>{ if(!sec||sec.querySelector('.sq-all')) return; const qs=[...sec.querySelectorAll('.chq')];
        if(!qs.length||!qs.every(q=>{ const c=q.querySelector('.chid'); return c&&T[c.textContent.trim()]; })) return;
        sec.classList.add('sq-reduced'); const p=document.createElement('p'); p.className='sq-allp'; p.innerHTML='<button type="button" class="sq-all">Standing Questions</button>';
        p.querySelector('.sq-all').onclick=e=>{ e.preventDefault(); e.stopPropagation(); list(stem); }; sec.appendChild(p); }); });
  (window.LadderStick?LadderStick.maps():Promise.resolve()).then(go); }
/* toolbox colours */ /* 2026-11-13 (Andrew 09:18Z): Crosswalk and Questions are reached from here, not from the toolbox's own row */
/* ansq */ /* 2026-11-13 (Andrew 12:01Z, 12:02Z): four toggles, each opening its own pane; blue and gold stars fold a rung as the wings do (12:12Z) */
const STARSVG='<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21.1l1.6-7L2 9.3l7.1-.7z"/></svg>';
const starred=label=>'<details class="sk-wing sk-star sk-star-blue"><summary aria-label="'+label+', blue star earned: its questions">'+STARSVG+' '+label+'</summary>';
function understand(el){ const P=get('pages:done',{}), M=window.LADMAP||[], U=window.__starUnits?window.__starUnits():null, B=new Set(U?U.blue:[]);
  const stem=(location.pathname.split('/').pop()||'').replace(/\.html$/,''), lab=s=>((window.LADDER_CARDMAP||{})[s]||[s.replace(/^r0*(\d+)/,'$1')])[0];
  const reach=s=>{ if(P[s]) return true; try{ const F=window.LadderFV, f=F&&F.furthest&&F.furthest(); if(!f||f.ord==null||!F.placeOf) return false; const pl=F.placeOf(s); return pl!=null&&Math.floor(f.ord/1000)>=pl; }catch(e){ return false; } };
  el.innerHTML='';
  /* this step's own questions, tickable here; folded into a star once the step holds its blue star */
  const src=[...document.querySelectorAll('section.step:not([hidden]) .sayback ol')].filter(o=>!o.closest('#desk,#stick')); const one=src.length?src:[document.querySelector('.wrap .sayback ol, .wrap #qs ol')].filter(Boolean);
  if(one.length){ const done=!!(P[stem]&&P[stem].v), w=document.createElement('div'); w.innerHTML=(done?starred('this step'):'<details class="sk-fl" open><summary>this step</summary>')+'<div class="aq-qs dq"></div></details>';
    const q=w.querySelector('.aq-qs'); one.forEach(o=>{ const c=o.cloneNode(true); c.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id')); q.appendChild(c); });
    const orig=t=>[...document.querySelectorAll('.qid,.id')].find(o=>!o.closest('#desk,#stick')&&o.textContent.trim()===t);
    q.querySelectorAll('.qid,.id').forEach(e=>{ const o=orig(e.textContent.trim()); if(o) e.classList.toggle('done',o.classList.contains('done')); e.style.cursor='pointer';
      e.addEventListener('click',ev=>{ ev.preventDefault(); ev.stopPropagation(); const o=orig(e.textContent.trim()); if(o&&o.__tick){ o.__tick(); e.classList.toggle('done',o.classList.contains('done')); } }); });
    el.appendChild(w.firstChild); }
  /* the index: every step reached, by floor; a rung with its blue star folds into the star, as the wings do */
  const fls=[]; M.forEach(([fl,rungs])=>{ const rs=[]; rungs.forEach(([r,core,annex])=>{ const ss=core.concat(annex).map(x=>x[0]).filter(reach); if(ss.length) rs.push([r,ss]); }); if(rs.length) fls.push([fl,rs]); });
  const li=s=>'<li><a class="aq-step" href="'+s+'.html">'+esc(lab(s))+'</a> <span class="sk-st">'+(P[s]&&P[s].v?'<span class="aq-star">'+STARSVG+'</span> every question cleared':'questions open')+'</span></li>';
  const rung=([r,ss])=>B.has('rung '+r)?'<li class="sk-wingli">'+starred('rung '+r)+'<ul class="sk-list">'+ss.map(li).join('')+'</ul></details></li>':ss.map(li).join('');
  const h=document.createElement('div');
  h.innerHTML=fls.length?'<p class="sk-n">The understanding questions of every step you have reached. Clear every question on a step for its blue star.</p>'
      +fls.map(([fl,rs],i)=>'<details class="sk-fl"'+(i===fls.length-1&&!one.length?' open':'')+'><summary>floor '+fl+'</summary>'+'<ul class="sk-list">'+rs.map(rung).join('')+'</ul></details>').join('')
    :'<p class="sk-n">Nothing is reached yet. Each step’s understanding questions come here as soon as you reach it.</p>';
  while(h.firstChild) el.appendChild(h.firstChild); }
function tools(body,here){ const KEY='ladder:aq', LBL={un:'Understanding',cw:'Crosswalk',ms:'Measuring Stick',sq:'Standing Questions'}, K=['un','cw','ms','sq'];
  let on=[]; try{ on=JSON.parse(localStorage.getItem(KEY)||'[]')||[]; }catch(e){} if(!Array.isArray(on)) on=[]; if(here&&!on.includes('sq')) on.push('sq');
  const pane={}; K.forEach(k=>{ const d=document.createElement('div'); d.className='aq-pane aq-p-'+k; d.hidden=true; pane[k]=d; });
  while(body.firstChild) pane.sq.appendChild(body.firstChild);
  const bar=document.createElement('p'); bar.className='sk-tools aq-bar'; bar.innerHTML=K.map(k=>'<button type="button" class="aq-b aq-b-'+k+'" data-k="'+k+'" aria-pressed="false">'+LBL[k]+'</button>').join('');
  body.appendChild(bar); K.forEach(k=>body.appendChild(pane[k]));
  const fill={ un:()=>understand(pane.un), cw:()=>{ if(window.LadderCards) LadderCards.open(pane.cw); }, ms:()=>{ if(window.LadderMeasure&&LadderMeasure.fill) LadderMeasure.fill(pane.ms,close); }, sq:()=>{} }, made={sq:true};
  const set=(k,v)=>{ pane[k].hidden=!v; const b=bar.querySelector('[data-k="'+k+'"]'); b.setAttribute('aria-pressed',String(v)); b.classList.toggle('on',v); if(v&&!made[k]){ made[k]=true; fill[k](); } };
  K.forEach(k=>set(k,on.includes(k)));
  bar.querySelectorAll('.aq-b').forEach(b=>b.onclick=()=>{ const k=b.dataset.k, v=pane[k].hidden; set(k,v); on=K.filter(x=>!pane[x].hidden); try{ localStorage.setItem(KEY,JSON.stringify(on)); }catch(e){} }); }
/* the toolbox list */
function list(here){ here=typeof here==='string'?here:null; close(); const body=frame('','');
  box.querySelector('.sk-top span').textContent='answering questions'; box.querySelector('.sk-top').dataset.slug='earn stars'; body.innerHTML='<p class="sk-q">Gathering them…</p>';
  Promise.all([window.LadderStick?LadderStick.maps():null,script('sq/index.js',()=>window.LADDER_SQINDEX),/* sqlist */script('sq/titles.js',()=>window.LADDER_SQTITLES).catch(()=>{})]).then(()=>{
    const P=get('pages:done',{}), I=window.LADDER_SQINDEX||{}, M=window.LADMAP||[]; const out=[];
    M.forEach(([fl,rungs])=>rungs.forEach(([r,core,annex])=>core.concat(annex).forEach(([s])=>{ if(P[s]&&P[s].v&&I[s]) out.push([fl,s,I[s],r]); })));
    const hq=here&&I[here]&&I[here].length?I[here]:null;
    if(!out.length&&!hq){ body.innerHTML='<p class="sk-q">None yet. A step’s standing questions come here once you have passed its footings; each one walks a branching path, a path to its answer or a debate to the bottom of one line of inquiry.</p>'; tools(body,here); return; }
    const TT=window.LADDER_SQTITLES||{}, U=window.__starUnits?window.__starUnits():null, WG=new Set(U?U.wings:[]);
    const WINGSVG='<svg viewBox="0 0 28 14" width="26" height="13" aria-hidden="true"><path fill="currentColor" d="M13.4 9.2C11 3.6 6.4.9.8.8c1 3 2.4 5 4.4 6.2-1 .5-1.7 1.1-2.2 1.9 1.9.9 3.8 1 5.2.7-.6 1-.8 2-.5 3.2 1.4.4 3.4-.2 5.7-3.6z"/><path fill="currentColor" transform="matrix(-1 0 0 1 28 0)" d="M13.4 9.2C11 3.6 6.4.9.8.8c1 3 2.4 5 4.4 6.2-1 .5-1.7 1.1-2.2 1.9 1.9.9 3.8 1 5.2.7-.6 1-.8 2-.5 3.2 1.4.4 3.4-.2 5.7-3.6z"/></svg>';
    const dn=id=>!!get('sq:'+id,{}).done, qa=x=>esc(x).replace(/"/g,'&quot;');
    const st=id=>{ const r=get('sq:'+id,{}); return r.done?'✓':(r.until&&r.until>Date.now()?'resting '+left(r.until-Date.now()):''); };
    /* a row: the question's number, its two-word title, and the question's opening words folded under the title (tap the title) */
    const row=stem=>([id,kind,txt,has])=>'<li'+(dn(id)?' class="sk-done"':'')+'>'+(has?'<button type="button" class="sk-sit" data-stem="'+stem+'" data-id="'+esc(id)+'">'+esc(id)+'</button>':'<a href="'+stem+'.html#'+esc(id)+'">'+esc(id)+'</a>')
      +(TT[id]?' <button type="button" class="sk-st sk-tt" aria-expanded="false" data-txt="'+qa(TT[id])+'" data-pre="" data-post="'+st(id)+'"></button><span class="sk-st sk-sum" hidden data-txt="'+qa(txt)+'" data-pre="'+(kind==='debate'?'debate · ':'')+'" data-post=""></span>'
        :' <span class="sk-st" data-txt="'+qa(txt)+'" data-pre="'+(kind==='debate'?'debate · ':'')+'" data-post="'+st(id)+'"></span>')+'</li>';
    const byF={}; out.forEach(x=>(byF[x[0]]=byF[x[0]]||[]).push(x)); const fls=Object.keys(byF);
    /* a rung with its wings folds its questions into a wing icon */
    const rungsOf=list=>{ const g=[]; list.forEach(x=>{ const l=g[g.length-1], h=x[2].map(row(x[1])).join(''); if(l&&l.r===x[3]) l.rows+=h; else g.push({r:x[3],rows:h}); });
      return g.map(o=>WG.has('rung '+o.r)?'<li class="sk-wingli"><details class="sk-wing"><summary aria-label="rung '+o.r+', wings earned: its questions"><span class="sk-wi">'+WINGSVG+'</span> rung '+o.r+'</summary><ul class="sk-list">'+o.rows+'</ul></details></li>':o.rows).join(''); };
    body.innerHTML='<p class="sk-n">The standing questions of the steps you have passed. Each walks a branching path. A wrong path on a question with one answer rests it: 6 minutes, then an hour, then 10 hours, each rest ten times the last.</p>'
      +fls.map(f=>'<details class="sk-fl"'+(f===fls[fls.length-1]?' open':'')+'><summary>floor '+f+'</summary><ul class="sk-list">'+rungsOf(byF[f])+'</ul></details>').join('');
    if(hq){ const d=document.createElement('details'); d.className='sk-fl sk-here'; d.open=true;
      d.innerHTML='<summary>this step</summary><ul class="sk-list">'+hq.map(row(here)).join('')+'</ul>';
      body.querySelectorAll('details.sk-fl').forEach(x=>{ x.open=false; }); body.querySelector('.sk-n').after(d); }
    body.querySelectorAll('.sk-st[data-txt]').forEach(e=>{ rich(e,(e.dataset.pre+e.dataset.txt+' '+e.dataset.post).trim()); });
    body.querySelectorAll('.sk-tt').forEach(b=>b.onclick=()=>{ const s=b.nextElementSibling; if(!s) return; s.hidden=!s.hidden; b.setAttribute('aria-expanded',String(!s.hidden)); });
    body.querySelectorAll('.sk-sit').forEach(b=>b.onclick=()=>walk(b.dataset.id,{stem:b.dataset.stem})); tools(body,here); }); }
window.LadderStanding={walk,list,lockFor,stemOf};
const boot=()=>setTimeout(pageHooks,300);
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* ---- 0.3.2 how annexes are reached (Andrew 2026-11-04 21:15): the climb runs through the steps, the statistics annex,
   the newsflash and the research front (Andrew 21:31); previous and next skip the subject annexes. A subject annex is reached from the ladder itself
   ("dizzying heights") or from the toolbox's "Annexes": a catalogue by subject, each annex opening once its rung is
   opened, with the next one named ("next annex at 18", or "much higher up the ladder" past the furthest-forward limit).
   On an annex page, previous goes back to the climb and next goes to the subject's next open annex.
   The map is annexes.js, written by tools/annexmap.py from index.html and the pages' links. */
(function(){
'use strict';
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const get=(k,d)=>{ try{ const v=JSON.parse(LS.getItem(k)||'null'); return v==null?d:v; }catch(e){ return d; } };
let loading=null;
const data=()=>window.LADDER_ANNEXES?Promise.resolve(window.LADDER_ANNEXES):(loading=loading||new Promise(res=>{ const s=document.createElement('script'); s.src='annexes.js'; s.onload=()=>res(window.LADDER_ANNEXES||null); s.onerror=()=>res(null); document.head.appendChild(s); }));
const page=()=>window.ladderPage?ladderPage():(location.pathname.split('/').pop()||'index').replace(/\.html$/,'');
/* progress: the highest rung opened (at the foot of its page, or measured into) */
function high(){ const P=get('pages:done',{}); let h=-1; for(const k in P){ const m=k.match(/^open:r(\d+)$/); if(m&&P[k]&&P[k].v) h=Math.max(h,+m[1]); } return h; }
/* how far ahead a page may number (Andrew 2026-10-29): r + floor(0.2·(12 + r/6)·6) */
const limit=r=>{ r=Math.max(0,r); return r+Math.floor(0.2*(12+r/6)*6); };
const isOpen=(a,h)=>a[3]<=h;
function nextAt(list,h){ const n=list.find(a=>!isOpen(a,h)); if(!n) return null; return n[3]<=limit(h)?'next annex at '+n[3]:'next annex much higher up the ladder'; }
function subjectOf(D,stem){ for(const k of D.order){ const i=(D.subj[k]||[]).findIndex(a=>a[0]===stem); if(i>=0) return {k,i,list:D.subj[k]}; } return null; }
/* the climb's links: pn() has turned nav.nextrung into .pn rows (top and foot); before that, the nav itself */
function relink(D){ const P=page(), sk=D.skip[P], S=subjectOf(D,P), opt=S&&S.k!=='stat'&&S.k!=='now';
  if(!sk&&!opt) return;
  let prev=null, next=null, lock=null;
  if(sk){ prev=sk[0]; next=sk[1]; }
  if(opt){ prev=D.back[P]||null; const h=high(), nx=S.list[S.i+1];
    if(nx&&isOpen(nx,h)) next=[nx[0],nx[1]+' · '+nx[2].charAt(0).toLowerCase()+nx[2].slice(1)]; else { next=null; lock=nx?nextAt(S.list.slice(S.i+1),h).replace('next annex','next '+D.names[S.k]+' annex'):'the last '+D.names[S.k]+' annex built so far'; } }
  const txt=s=>s==null?null:Array.isArray(s)?s[1]:(D.text[s]||s), href=s=>(Array.isArray(s)?s[0]:s)+'.html';
  const prevT=opt&&prev?'back to the climb · '+txt(prev):txt(prev);
  const rows=[...document.querySelectorAll('.pn')];
  if(rows.length){ rows.forEach(n=>{
      const set=(cls,s,t,k)=>{ const old=n.querySelector('.pnb.'+cls); if(!old) return;
        if(s==null&&!t){ return; }
        let el;
        if(s!=null){ el=document.createElement('a'); el.href=href(s); el.innerHTML='<span class="pk">'+k+'</span><span class="pl">'+esc(t)+'</span>'; }
        else { el=document.createElement('button'); el.type='button'; el.innerHTML='<span class="pk">'+k+'</span><span class="pl">'+esc(t)+'</span>'; el.onclick=()=>catalogue(S&&S.k); }
        el.className='pnb '+cls+(s==null?' annexlock':''); old.replaceWith(el); };
      if(prev||sk) set('prev',prev,txt(prev),opt?'← back to the climb':'← previous');
      if(next||lock) set('next',next,next?txt(next):lock,next?(opt?'next '+D.names[S.k]+' →':'next →'):'annexes ☰'); });
    return; }
  const nav=document.querySelector('nav.nextrung'); if(!nav) return;
  const as=[...nav.querySelectorAll('a')], pa=as.find(a=>/←/.test(a.textContent)&&!/index\.html$/.test(a.getAttribute('href')||'')), na=as.find(a=>/→/.test(a.textContent));
  if(pa&&prev){ pa.href=href(prev); pa.textContent='← '+prevT; }
  if(na){ if(next){ na.href=href(next); na.textContent=(opt?'next '+D.names[S.k]+': ':'')+txt(next)+' →'; } else if(lock){ const b=document.createElement('button'); b.type='button'; b.className='annexlock'; b.textContent=lock; b.onclick=()=>catalogue(S&&S.k); na.replaceWith(b); } }
}
/* the toolbox catalogue */
function catalogue(want){ data().then(D=>{ if(!D) return;
  const old=document.getElementById('stick'); if(old) old.remove();
  const box=document.createElement('div'); box.id='stick'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','the annexes'); document.body.appendChild(box); document.body.classList.add('stickopen');
  const h=high(), P=get('pages:done',{}), here=page();
  const sec=k=>{ const L=D.subj[k]||[]; if(!L.length) return ''; const open=L.filter(a=>isOpen(a,h)), nx=nextAt(L,h);
    /* 2026-11-09 (Andrew 16:32): one wording for every subject, n of m open; the line takes its subject's tag colour from the index */
    const sum=D.names[k]+' · '+(open.length?open.length+' of '+L.length+' open':(nx?nx.replace('next annex','first annex'):''));
    const show=want?k===want:(open.some(a=>a[0]===here));
    return '<details class="sk-fl k-'+esc(k)+'"'+(show?' open':'')+'><summary>'+esc(sum)+'</summary><ul class="sk-list">'
      +open.map(a=>'<li><a href="'+a[0]+'.html">'+esc(a[1])+'</a> <span class="sk-st">'+esc(a[2])+(P[a[0]]&&P[a[0]].v?' ✓':'')+'</span></li>').join('')
      +(nx?'<li class="sk-st">'+esc(open.length?nx:nx.replace('next annex','first annex'))+'</li>':'')+'</ul></details>'; };
  box.innerHTML='<div class="sk-card"><div class="sk-top" data-slug="By Subject"><span>the annexes</span><button type="button" class="sk-x" aria-label="close">×</button></div>'
    +'<p class="sk-n sk-n0" hidden></p>'
    +D.order.map(sec).join('')+'</div>';
  { const ba=document.querySelector('#desk .dtabs [data-p="base"]'); /* toolbox gear: the Cellar is reached from here */
    if(ba&&!ba.classList.contains('lk-hide')){ const p=document.createElement('p'); p.className='sk-tools'; p.innerHTML='<button type="button" class="sk-cellar">Cellar</button>';
      p.firstChild.onclick=()=>{ box.remove(); document.body.classList.remove('stickopen'); const d=document.getElementById('desk'), b=document.getElementById('deskbtn'); if(b&&!(d&&d.classList.contains('open'))) b.click(); ba.click(); };
      const n=box.querySelector('.sk-n'); if(n) n.parentNode.insertBefore(p,n); } }
  box.querySelector('.sk-x').onclick=()=>{ box.remove(); document.body.classList.remove('stickopen'); };
  box.addEventListener('click',e=>{ if(e.target===box){ box.remove(); document.body.classList.remove('stickopen'); } });
}); }
/* the toolbox button, beside "Dizzying heights" */
function button(){ const dh=document.querySelector('#desk .dheights'); if(!dh) return false; if(document.querySelector('#desk .dannex')) return true;
  const b=document.createElement('button'); b.type='button'; b.className='dannex'; b.textContent='Annexes';
  b.onclick=()=>{ const x=document.querySelector('#desk .x'); if(x) x.click(); catalogue(); };
  dh.parentNode.insertBefore(b,dh); return true; }
window.LadderAnnexes={catalogue,data,high,relink};
const boot=()=>{ data().then(D=>{ if(D) relink(D); }); let n=0; const t=setInterval(()=>{ if(button()||++n>40) clearInterval(t); },150); };
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0)); else boot();
})();

/* 0.3.5 (Andrew 21:57, 22:11): the app's index shows the ladder only as far as you have climbed.
   - A row (step, rung, conclusion, annex) shows once you have reached it: your furthest footing is at or past it, its page is passed,
     or you measured into it, its rung or its floor.
   - The step you stand on lists its footings only up to your furthest one.
   - A rung above you shows only its own row, collapsed, with its measuring stick to test in; a floor above you shows only its floor row.
   - The Endless floor waits for rung 30 (LadderSky). The desk (window.LADDER_DESK) always shows everything.
   - Page view (the old compound page) opens only from a row's number; a row's title opens the footing view. */
(function(){
'use strict';
if(window.LADDER_DESK){ document.documentElement.classList.add('lk-ready'); return; }
const J=(k,d)=>{ try{ const v=JSON.parse(LS.getItem(k)||'null'); return v==null?d:v; }catch(e){ return d; } };
const stemOfLi=li=>{ const a=li.querySelector(':scope>.t>a'); const m=a&&(a.getAttribute('href')||'').match(/^([^#.]+)\.html/); return m?m[1]:null; };
function lock(){
  const wrap=document.querySelector('.rungs'); if(!wrap) return;
  const P=J('pages:done',{}), fur=J('ladder:furthest',null), cert=k=>!!J('cert:'+k,null);
  const secs=[...document.querySelectorAll('section.floor, section.rung:not(.sky)')];
  /* climb order: every row in the index, top floor last as built */
  const rows=[]; secs.forEach(s=>s.querySelectorAll(':scope>ol.ladder>li').forEach(li=>rows.push({li,sec:s,stem:stemOfLi(li)})));
  const idx={}; rows.forEach((r,i)=>{ if(r.stem&&!(r.stem in idx)) idx[r.stem]=i; });
  let reach=-1; let furStem=fur&&fur.page?String(fur.page).replace(/\.html$/,''):null;
  if(furStem&&furStem in idx) reach=Math.max(reach,idx[furStem]);
  for(const s in P){ if(P[s]&&P[s].v&&s in idx) reach=Math.max(reach,idx[s]); }
  let fu=fur; if(reach<0){ reach=rows.findIndex(r=>r.stem&&/^r\d\d[a-z]/.test(r.stem)); /* a new learner stands on the first step, on its first footing */
    const r0=rows[reach], a0=r0&&r0.li.querySelector(':scope>details.flist ol>li a'), h0=a0&&(a0.getAttribute('href')||'').split('#')[1]; if(r0&&h0) fu={page:r0.stem,id:h0}; }
  if(fu!==fur){ furStem=fu.page; }
  const F2=fu;
  /* tested in: floors and rungs measured into, by LADMAP */
  const M=window.LADMAP||[], openRung=new Set(), openFloor=new Set(), rungFloor={};
  M.forEach(([fl,rungs])=>{ if(cert('floor'+fl+'concl')) openFloor.add(fl);
    rungs.forEach(([r,core])=>{ rungFloor[r]=fl; if(core.length&&cert(core[core.length-1])) openRung.add(r); if(cert('in:r'+String(r).padStart(2,'0'))) openRung.add(r); /* 0.3.25: tested in */ }); });
  /* 0.3.23: a rung tested into (open:rNN) is open, and so is its floor */
  const flTouched=new Set(); M.forEach(([fl,rungs])=>{ if(rungs.some(([r])=>openRung.has(r))) flTouched.add(fl); });
  const rungNo=s=>{ const m=s&&s.match(/^r(\d\d)/); return m?+m[1]:null; };
  const floorNo=sec=>{ const f=sec.getAttribute('data-floor'); return f?+f:null; };
  /* the floor each section sits on: floor sections set it, rung sections inherit */
  let curFl=null; const secFl=new Map(); secs.forEach(s=>{ if(s.classList.contains('floor')) curFl=floorNo(s); secFl.set(s,curFl); });
  const reachedFl=new Set(); rows.forEach((r,i)=>{ if(i<=reach) reachedFl.add(secFl.get(r.sec)); });
  const flOpen=fl=>reachedFl.has(fl)||openFloor.has(fl)||flTouched.has(fl);
  const rOpen=n=>openRung.has(n)||openFloor.has(rungFloor[n]);
  rows.forEach((r,i)=>{ const li=r.li, fl=secFl.get(r.sec), isFloor=r.sec.classList.contains('floor'), n=rungNo(r.stem);
    const isRungRow=li.classList.contains('k-theory')&&r.sec.querySelector(':scope>ol.ladder>li')===li;
    let show, collapsed=false;
    if(isFloor&&M.length&&!M.some(F=>F[0]===fl)){ show=!!(window.LadderSky&&LadderSky.endless&&LadderSky.endless()); }
    else if(isFloor){ show=true; collapsed=!flOpen(fl); }
    else if(!flOpen(fl)) show=false;
    else if(i<=reach||(n!=null&&rOpen(n))||(r.stem&&(cert(r.stem)||(P[r.stem]&&P[r.stem].v)))) show=true;
    else if(isRungRow){ show=true; collapsed=true; }
    else show=false;
    li.classList.toggle('lk-hide',!show); li.classList.toggle('lk-shut',show&&collapsed);
    /* footings: the step you stand on lists only those you have reached */
    const fl2=li.querySelector(':scope>details.flist'); if(fl2){ const items=[...fl2.querySelectorAll('ol>li')];
      if(show&&r.stem===furStem&&F2&&F2.id&&F2.id!=='top'&&!(n!=null&&rOpen(n))&&!(P[r.stem]&&P[r.stem].v)){ const k=items.findIndex(x=>{ const a=x.querySelector('a'); return a&&(a.getAttribute('href')||'').endsWith('#'+F2.id); });
        items.forEach((x,j)=>x.classList.toggle('lk-hide',F2.id==='end'?false:(k>=0&&j>k)));
        }
      else items.forEach(x=>x.classList.remove('lk-hide')); }
  });
  /* a section with nothing showing goes; a locked row tells you how to open it */
  secs.forEach(s=>{ const any=s.querySelector(':scope>ol.ladder>li:not(.lk-hide)'); s.classList.toggle('lk-hide',!any); });
  document.body.classList.add('lk-on');
}
/* rows: the title opens the footing view; the number opens the page view (the compound page, all its footings open) */
document.addEventListener('click',e=>{ if(window.LADDER_DESK) return; const n=e.target.closest&&e.target.closest('.rungs .ladder li>.n'); if(!n) return;
  const li=n.parentElement; if(li.classList.contains('lk-shut')) return; const a=li.querySelector(':scope>.t>a'); if(!a) return;
  e.preventDefault(); try{ sessionStorage.setItem('fv:want','page'); }catch(x){} location.href=a.getAttribute('href').replace(/#.*$/,''); },true);
document.addEventListener('click',e=>{ if(window.LADDER_DESK) return; const li=e.target.closest&&e.target.closest('.rungs .ladder li.lk-shut'); if(!li) return;
  e.preventDefault(); e.stopPropagation(); if(window.LadderMeasure) LadderMeasure.testIn(li); },true); /* 0.3.23 (Andrew 11:04): tapping a locked rung or floor tests in */
window.LadderLock={lock};
/* 0.3.23 (Andrew 11:04, "the list populates and then compacts"): the list stays hidden until the map is in,
   the rows are locked and the rulers are drawn; then it shows once, already on your furthest footing. */
let shown=false; const reveal=()=>{ if(shown) return; shown=true; document.documentElement.classList.add('lk-ready'); if(window.__climbTo) window.__climbTo(false); };
const settle=()=>{ lock(); const p=window.LadderMeasure?LadderMeasure.indexIcons():null; Promise.resolve(p).catch(()=>{}).then(reveal); };
const go=()=>{ if(!document.querySelector('.rungs')) return; setTimeout(reveal,2500);
  if(window.LADMAP) settle(); else { const s=document.createElement('script'); s.src='ladmap.js'; s.onload=settle; s.onerror=settle; document.head.appendChild(s); } };
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',go); else go();
})();

/* 0.3.6 (Andrew 22:19): the toolbox opens its tools as you climb. Graph view at 9e (reading and drawing graphs), Techs read at 0b,
   the laundry at 1e, the measuring stick and the standing questions at 0a, Annexes with the first subject annex.
   Record, Quick keys and Share the ladder are always open (and the rest not named stay open). The desk shows everything. */
(function(){
'use strict';
const J=(k,d)=>{ try{ const v=JSON.parse(LS.getItem(k)||'null'); return v==null?d:v; }catch(e){ return d; } };
const SUBJ=/^r\d\d(phys|chem|bio|comp|eng|econ|logi|crypt|nav)\d*$/;
let ORD=null;
function order(){ if(ORD) return ORD; const M=window.LADMAP; if(!M) return null; ORD={}; let i=0;
  M.forEach(([fl,rungs])=>{ ORD['floor'+fl]=i++; rungs.forEach(([r,core,annex])=>{ const R='r'+String(r).padStart(2,'0'); ORD[R]=i++;
    core.forEach(([s])=>{ ORD[s]=i++; }); ORD[R+'concl']=i++; annex.forEach(([s])=>{ if(!(s in ORD)) ORD[s]=i++; }); }); ORD['floor'+fl+'concl']=i++; });
  return ORD; }
function pos(stem){ const O=order(); if(!O||!stem) return -1; stem=String(stem).replace(/\.html$/,''); if(stem in O) return O[stem];
  if(/^inf\d/.test(stem)) return 1e9; const m=stem.match(/^r(\d\d)/); if(m){ const R='r'+m[1]; if(R+'concl' in O) return O[R+'concl']; } return -1; }
let fpC=null;
function furthestPos(){ const hereK=(window.ladderPage&&ladderPage())||''; if(fpC&&fpC.v===window.__lsVer&&fpC.h===hereK) return fpC.b; const b=furthestPos0(); fpC={v:window.__lsVer,h:hereK,b}; return b; }
function furthestPos0(){ let best=-1; const f=J('ladder:furthest',null); if(f&&f.page) best=Math.max(best,pos(f.page));
  const P=J('pages:done',{}); for(const s in P) if(P[s]&&P[s].v) best=Math.max(best,pos(s));
  /* a step you measured into counts as reached */
  try{ for(let i=0;i<LS.length;i++){ const k=LS.key(i); const m=k&&k.match(/^cert:(.+)$/); if(m) best=Math.max(best,pos(m[1])); } }catch(e){}
  const here=(window.ladderPage&&ladderPage())||''; best=Math.max(best,pos(here)); return best; }
function firstAnnex(){ const O=order(); if(!O) return null; let b=null; for(const s in O) if(SUBJ.test(s)&&(b==null||O[s]<O[b])) b=s; return b; }
function reached(stem){ if(!stem) return true; const p=pos(stem); if(p<0) return true; return furthestPos()>=p; }
const GATES=[['[data-p="graph"]','r09e','reading and drawing graphs (9e)'],['[data-p="moves"]','r00b','0b'],['[data-p="rand"]','r01e','1e'],
  ['.dstick','r00a','0a'],['.dstand','r00a','0a'],['.dannex',()=>firstAnnex(),'the first annex']];
function apply(){ if(window.LADDER_DESK) return; if(!order()){ load(); return; }
  const d=document.getElementById('desk');
  GATES.forEach(([sel,stem,say])=>{ const s=typeof stem==='function'?stem():stem; const ok=reached(s);
    if(d) d.querySelectorAll('.dtabs '+sel).forEach(b=>{ b.classList.toggle('lk-hide',!ok); b.title=ok?'':'opens at '+say; }); });
  /* the index tiles follow the same gates */
  document.querySelectorAll('.tiles a.tile[href="moves.html"]').forEach(a=>a.classList.toggle('lk-hide',!reached('r00b')));
  document.querySelectorAll('.tiles a.tile[href="laundry.html"]').forEach(a=>a.classList.toggle('lk-hide',!reached('r01e')));
  skid();
}
let loading=false; function load(){ if(window.LADMAP){ apply(); return; } if(loading) return; loading=true;
  const s=document.createElement('script'); s.src='ladmap.js'; s.onload=()=>apply(); document.head.appendChild(s); }
/* 0.3.6 (Andrew 22:16): the non-skid key opens tag by tag as you pass steps that carry them (basement and anexact included);
   the floor and theory tags are gone from it */
let pdC=null;
function passed(stem){ if(!pdC||pdC.v!==window.__lsVer) pdC={v:window.__lsVer,P:J('pages:done',{})}; const P=pdC.P; if(P[stem]&&P[stem].v) return true; const p=pos(stem); return p>=0&&p<furthestPos(); }
function skid(){ if(window.LADDER_DESK) return; const key=document.querySelector('.ladderkey'), rungs=document.querySelector('.rungs'); if(!key||!rungs||!order()) return;
  const stemOf=li=>{ const a=li.querySelector(':scope>.t>a'); const m=a&&(a.getAttribute('href')||'').match(/^([^#.]+)\.html/); return m?m[1]:null; };
  const rows=[...rungs.querySelectorAll('.ladder>li')].map(li=>({li,s:stemOf(li)})).filter(r=>r.s&&passed(r.s));
  const has=k=>rows.some(r=>r.li.classList.contains('k-'+k));
  key.querySelectorAll('.legend .tag, .legend .tagbtn').forEach(t=>{ if(t.closest('.gtkey')) return; const k=[...t.classList].find(c=>!/^(tag|tagbtn|off)$/.test(c)); if(!k) return;
    let ok=has(k); if(k==='cert'){ ok=false; try{ for(let i=0;i<LS.length;i++){ if(/^cert:/.test(LS.key(i)||'')){ ok=true; break; } } }catch(e){} ok=ok||passed('floor1concl'); }
    t.classList.toggle('lk-hide',!ok); });
  const bm=key.querySelector('.bmkey'); if(bm) bm.classList.toggle('lk-hide',!rows.some(r=>r.li.querySelector('.bm')));
  const pz=key.querySelector('.pzkey'), PZ=(window.LADDER_SKID||{}).pz;
  if(pz){ if(!PZ){ if(skid.ld){ pz.classList.add('lk-hide'); } else { skid.ld=1; const s=document.createElement('script'); s.src='skid.js'; s.onload=()=>skid(); document.head.appendChild(s); pz.classList.add('lk-hide'); } }
    else pz.classList.toggle('lk-hide',!PZ.some(passed)); }
  const gt=key.querySelector('.gtkey'); if(gt){ const ok=pos('r16a')>=0&&furthestPos()>=pos('r16a'); gt.classList.toggle('lk-hide',!ok); if(ok) gt.hidden=false; }
  key.querySelectorAll('.legend').forEach(l=>{ const vis=[...l.children].some(c=>!c.classList.contains('lk-hide')&&!c.hidden&&getComputedStyle(c).display!=='none'); if(l.querySelector('.tag,.tagbtn,.bmkey,.pzkey,.gtkey')) l.classList.toggle('lk-hide',!vis); });
}
window.LadderUnlock={reached,apply,pos,firstAnnex,skid,passed};
const go=()=>{ apply(); const d=document.getElementById('desk'); if(d) new MutationObserver(()=>{ clearTimeout(go.t); go.t=setTimeout(apply,30); }).observe(d.querySelector('.dtabs')||d,{childList:true}); };
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',go); else setTimeout(go,0);
})();

/* 0.3.6 (Andrew 22:16): the first time the ladder opens, it opens on a footing that is the ladder's instruction (start.html, the
   Ladder mark at its head), then "how to read the ladder" (intro.html), then the logic floor (floor1.html), and from there the
   dizzying heights index. LS 'ladder:started' = 'start' while that walk is on, 'done' after. */
(function(){
'use strict';
if(window.LADDER_DESK) return;
const pg=(window.ladderPage&&ladderPage())||'';
let st=null; try{ st=LS.getItem('ladder:started'); }catch(e){}
/* 0.3.14: the walk counts as on while nothing past floor 1 has been climbed, even if the 'start' mark was lost */
if(st!=='done'){ try{ const f=JSON.parse(LS.getItem('ladder:furthest')||'null'); const P=JSON.parse(LS.getItem('pages:done')||'{}')||{};
  const early=!f||!f.page||/^(start|intro|floor1)$/.test(String(f.page).replace(/\.html$/,'')); if(early&&!Object.keys(P).some(k=>P[k]&&P[k].v)) st='start'; }catch(e){} }
const go=()=>{
  if(pg==='start'){ try{ if(st!=='done') LS.setItem('ladder:started','start'); }catch(e){}
    const m=document.querySelector('.startmark'); if(m&&window.ICON_L_HTML) m.innerHTML=window.ICON_L_HTML;
    setTimeout(()=>{ if(window.LadderFV&&LadderFV.goId&&!location.hash) LadderFV.goId('start'); },120); }
  if(pg==='floor1'&&st==='start'){ document.querySelectorAll('.pn a.pnb.next, header.top .home a, nav.nextrung a').forEach(a=>{ if(/→/.test(a.textContent)&&/r00\.html/.test(a.getAttribute('href')||'')){
      a.setAttribute('href','index.html'); if(a.classList.contains('pnb')){ const l=a.querySelector('.pl,.pt,span:last-child'); if(l&&l!==a) l.textContent='the dizzying heights'; else a.textContent='next → the dizzying heights'; } else a.textContent='next: the dizzying heights →';
      a.addEventListener('click',e=>{ e.preventDefault(); try{ LS.setItem('ladder:started','done'); }catch(x){} if(window.LadderFV&&LadderFV.heights) LadderFV.heights(); else location.href='index.html'; }); } }); }
};
/* 0.3.14: the floor's next rows can be rebuilt after us (annex relinking), so the first-run turn is also caught at the click */
if(pg==='floor1'&&st==='start') document.addEventListener('click',e=>{ const a=e.target.closest&&e.target.closest('a[href]'); if(!a||!/^r00\.html(#|$)/.test(a.getAttribute('href')||'')||!/→/.test(a.textContent)) return;
  e.preventDefault(); e.stopPropagation(); try{ LS.setItem('ladder:started','done'); }catch(x){} if(window.LadderFV&&LadderFV.heights) LadderFV.heights(); else location.href='index.html'; },true);
const run=()=>{ go(); setTimeout(go,600); setTimeout(go,1600); };
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(run,0)); else setTimeout(run,0);
})();

/* ---- final pass in colour (Andrew 2026-11-05 00:16): in a final-pass paragraph (p.fp: one he has re-edited, so the colouring
   follows his edits up the ladder) the ink stays the page's own, but objects (names, sets, collections) read a shade cooler and
   statements (functions, techniques, axioms) a shade warmer. Named moves come from kinds.js (tools/kindnames.py); the rest is
   a short word list. The toolbox's "Kinds in colour" turns it off and on (LS ladder:kinds = 'off'). */
(function(){
'use strict';
const OBJ=['name','names','letter','letters','set','sets','subset','subsets','collection','collections','member','members','object','objects','thing','things','number','numbers','pair','pairs','list','lists','element','elements','symbol','symbols','mark','marks','series','arrangement','arrangements','value','values','point','points','variable','variables'];
const ST=['statement','statements','claim','claims','axiom','axioms','technique','techniques','tech','techs','function','functions','rule','rules','operator','operators','principle','principles','law','laws','line','lines','proof','proofs','equation','equations','sentence','sentences','theorem','theorems','definition','definitions','predicate','predicates','move','moves','argument','arguments'];
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
let RX=null, KIND=null;
function build(){ const N=window.LADDER_KINDNAMES||{s:[],o:[]}; KIND=new Map();
  N.s.forEach(n=>KIND.set(n.toLowerCase(),'s')); N.o.forEach(n=>{ if(!KIND.has(n.toLowerCase())) KIND.set(n.toLowerCase(),'o'); });
  OBJ.forEach(w=>{ if(!KIND.has(w)) KIND.set(w,'o'); }); ST.forEach(w=>{ if(!KIND.has(w)) KIND.set(w,'s'); });
  const all=[...KIND.keys()].sort((a,b)=>b.length-a.length).map(esc);
  RX=new RegExp('(^|[^\\p{L}\\p{N}-])('+all.join('|')+')(?![\\p{L}\\p{N}-])','giu'); }
function paint(p){ if(p.dataset.kinds) return; p.dataset.kinds='1';
  const walk=[]; const tw=document.createTreeWalker(p,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&n.parentElement.closest('button,.pa,.katex,code,.kw-o,.kw-s')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  while(tw.nextNode()) walk.push(tw.currentNode);
  walk.forEach(t=>{ const s=t.textContent; RX.lastIndex=0; if(!RX.test(s)) return; RX.lastIndex=0;
    const f=document.createDocumentFragment(); let last=0, m;
    while((m=RX.exec(s))){ const st=m.index+m[1].length, w=m[2]; if(st>last) f.appendChild(document.createTextNode(s.slice(last,st)));
      const sp=document.createElement('span'); sp.className=KIND.get(w.toLowerCase())==='s'?'kw-s':'kw-o'; sp.textContent=w; f.appendChild(sp); last=st+w.length; }
    if(last<s.length) f.appendChild(document.createTextNode(s.slice(last))); t.replaceWith(f); }); }
const off=()=>false; /* 0.3.33 (Andrew 11:45): kinds in colour always on, no toggle */
function apply(){ document.body.classList.toggle('kinds-off',off()); const ps=document.querySelectorAll('p.fp, p.pedited'); if(!ps.length||off()) return;
  const go=()=>{ if(!RX) build(); ps.forEach(paint); };
  if(window.LADDER_KINDNAMES) go(); else { const s=document.createElement('script'); s.src='kinds.js'; s.onload=s.onerror=go; document.head.appendChild(s); } }
function button(){ return true; }
function buttonOld(){ const dh=document.querySelector('#desk .dheights'); if(!dh) return false; let b=document.querySelector('#desk .dkinds'); if(b) return true;
  b=document.createElement('button'); b.type='button'; b.className='dkinds';
  const lab=()=>{ b.textContent='Kinds in Colour: '+(off()?'Off':'On'); }; lab();
  b.onclick=()=>{ try{ LS.setItem('ladder:kinds',off()?'on':'off'); }catch(e){} lab(); apply(); };
  dh.parentNode.insertBefore(b,dh.nextSibling); return true; }
window.LadderKinds={apply};
const boot=()=>{ setTimeout(apply,200); let n=0; const t=setInterval(()=>{ if(button()||++n>40) clearInterval(t); },150); };
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* 0.3.47 (Andrew 22:27 "the wrap for step tags falls into the step address"): on the index, a row's tags keep to the room
   right of its number; when they need more than one line they wrap downward there, and when even one tag will not fit
   beside the number, the tags drop under it. */
(function(){
  if(!document.querySelector('.rungs')) return;
  function fit(){ document.querySelectorAll('.rungs .ladder>li>.tb:not([hidden])').forEach(tb=>{ const li=tb.parentElement, n=li.querySelector(':scope>.n'); if(!n||!li.offsetParent) return;
    tb.classList.remove('tbdown'); li.classList.remove('tbd'); tb.style.maxWidth='';
    const side=parseFloat(getComputedStyle(li).gridTemplateColumns)||0; if(!side) return;
    const room=Math.floor(side-n.getBoundingClientRect().width-4);
    const widest=Math.max(0,...[...tb.children].map(k=>k.getBoundingClientRect().width));
    const total=[...tb.children].reduce((w,k)=>w+k.getBoundingClientRect().width+4,-4);
    if(widest>room||total>room){ tb.classList.add('tbdown'); li.classList.add('tbd'); tb.style.maxWidth=Math.floor(side)+'px'; } else tb.style.maxWidth=room+'px'; }); }
  let q=0; const soon=()=>{ cancelAnimationFrame(q); q=requestAnimationFrame(fit); };
  addEventListener('resize',soon); document.addEventListener('toggle',soon,true); document.addEventListener('click',()=>setTimeout(soon,30),true);
  const go=()=>{ fit(); setTimeout(fit,400); setTimeout(fit,1500); setTimeout(fit,3000); };
  if(document.readyState==='complete') go(); else addEventListener('load',go);
  window.LadderFitTags=fit;
})();

/* ---- Phase G (Andrew 2026-11-09 16:26, 16:29): swipe screens. In the footing view on floor 1 (rungs 0-7, their annexes and the
   floor 1 pages) a footing is a row of screens: one paragraph, one slide deck or one graphic object (picture, line block, table,
   column) to a screen, the footing's question last. A displayed equation line, a block's key or a caption rides with the screen
   before it. Swipe left (or →, or the ▶ button) advances along the row; at the end of the row it climbs to the next footing, so
   one gesture walks the whole ladder. Swipe right (or ←, ◀) returns; before the first screen it goes back to the previous
   footing's last screen. Up and down keep their job: footings, steps, rungs and floors. The desk (page view) is untouched.
   A paragraph or a deck marked data-collapsed (the desk's "collapse", or a paragraph emptied on the desk) keeps its screen as a
   stub with its address, so the chain never renumbers; a tap opens it for this visit. */
(function(){
'use strict';
if(window.LADDER_DESK) return;
const PAGES=window.LADDER_SWIPE_PAGES||/^(r\d\d|floor\d|inf)/; /* Phase G floor 8: all rungs and the Endless floor */
const ADVANCE_ON_SWIPE_LEFT=true; /* finger moves left = the row moves on, as pages turn; flip for the other reading */
const pg=()=>window.ladderPage?ladderPage():'';
const ATTACH=/(^|\s)(eqline|eqline-words|brkkey|eyebrow|lbl|cap|lp|lv|first|dividend|tablewrap-cap)(\s|$)/;
const texbox=el=>!!(el&&el.matches&&(el.matches('pre,.eqline,.eqline-words,.lines,.texline,.katex-display')||el.querySelector('.katex-display,pre')));
let screens=[], k=0, on=false, bar=null, L=null, R=null, posEl=null, dots=null, step=null;
const folded=el=>el.hasAttribute('data-collapsed')||(el.matches('p[data-pid]')&&!el.textContent.replace(/\s+/g,'').replace(/^[\d\w.·]+$/,'').length);
function clear(){ document.querySelectorAll('.brk.sw-rows').forEach(b=>{ if(!b.closest('.fvghost')) b.classList.remove('sw-rows','sw-has'); }); document.querySelectorAll('[data-sw]').forEach(x=>{ if(x.closest('.fvghost')) return; /* the outgoing footing keeps its screen while it leaves */ x.removeAttribute('data-sw'); x.classList.remove('sw-on','sw-open','sw-stub'); }); screens=[]; }
/* slidex */ /* Andrew 2026-11-13 11:01Z: a deck's slides become screens of the footing: no second set of buttons, no deck heading */
function expand(root){ [...root.querySelectorAll(':scope>.slides:not([data-sx]):not([data-collapsed])')].forEach(deck=>{ try{
    const A=(window.__steppers||[]).find(a=>a.container===deck); if(!A) return; const n=deck.querySelectorAll('.dots i').length; if(!n) return;
    const live=deck.querySelector(':scope>.slide'); if(!live) return; const at=A.i; let ref=deck; const made=[];
    for(let j=0;j<n;j++){ A.show(j); const w=document.createElement('section'); w.className='slides sx'; w.setAttribute('data-sx',deck.id||'');
      const c=live.cloneNode(true); c.querySelectorAll('.new').forEach(x=>x.classList.remove('new')); c.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id')); w.appendChild(c); made.push(w); }
    A.show(at); made.forEach(w=>{ ref.parentNode.insertBefore(w,ref.nextSibling); ref=w; }); deck.setAttribute('data-sx','src'); deck.hidden=true;
  }catch(_){} }); }
function build(els){ clear(); step=els.find(e=>e.matches&&e.matches('section.step')); if(!step) return; expand(step);
  [...step.children].forEach(ch=>{ if(ch.matches('h2,.sthead,.stnext,script,style,template')||ch.hidden) return; if(ch.matches('p[data-pid]')&&folded(ch)) return;
    if(ch.matches('.brk.brk-check')){ const rows=[...ch.querySelectorAll(':scope>.rows>.row')]; if(rows.length>1){ ch.classList.add('sw-rows'); rows.forEach(r=>screens.push([r])); return; } } /* 2026-11-10 (Andrew 15:51): one move to a screen */ /* 2026-11-10 (Andrew 12:08): an emptied or collapsed paragraph is no screen; the chain closes up */
    if(ATTACH.test(ch.className||'')&&screens.length&&!(texbox(ch)&&screens[screens.length-1].some(texbox))){ screens[screens.length-1].push(ch); return; } screens.push([ch]); }); /* 2026-11-10 (Andrew 15:44): one TeX box to a screen */
  els.forEach(e=>{ if(e!==step&&e.matches&&e.matches('section,figure,.slides,.pic')&&!e.matches('header.top,nav,.pn')) screens.push([e]); });
  screens.forEach((s,i)=>s.forEach(x=>{ x.setAttribute('data-sw',i); if(folded(x)){ x.classList.add('sw-stub'); if(!x.dataset.addr) x.dataset.addr=x.matches('.slides')?'slides':x.matches('.pic')?'picture':x.matches('pre')?'lines':x.matches('.sayback')?'question':'·'; } })); }
function ui(){ if(bar) return; bar=document.createElement('div'); bar.className='swbar'; bar.hidden=true;
  L=document.createElement('button'); L.type='button'; L.className='swnav swl'; L.innerHTML='<span aria-hidden="true">◀</span>'; L.setAttribute('aria-label','previous screen');
  R=document.createElement('button'); R.type='button'; R.className='swnav swr'; R.innerHTML='<span class="swpos"></span><span aria-hidden="true">▶</span>'; R.setAttribute('aria-label','next screen');
  dots=document.createElement('div'); dots.className='swdots'; posEl=R.querySelector('.swpos');
  bar.append(L,dots,R); document.body.appendChild(bar); L.onclick=()=>ret(null); R.onclick=()=>adv(null); }
const deckOf=el=>el&&el.closest&&el.closest('.slides');
const api=deck=>deck&&(window.__steppers||[]).find(a=>a.container===deck)||null;
const deckN=deck=>deck?deck.querySelectorAll('.dots i').length:0;
/* 2026-11-10 (Andrew 15:10, "an animation that lets you feel like there's motion"): the old screen leaves as a ghost, the new one slides in */
const SWREDUCE=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function swGhost(els){ try{ const g=document.createElement('div'); g.className='swghost'; g.style.cssText='position:fixed;inset:0;z-index:30;pointer-events:none;overflow:hidden';
    let any=false; els.forEach(el=>{ const r=el.getBoundingClientRect(); if(r.height<=0||r.bottom<0||r.top>innerHeight) return; const c=el.cloneNode(true); c.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id')); c.removeAttribute('id'); c.classList.remove('sw-in-f','sw-in-b');
      c.style.cssText='position:absolute;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;margin:0;box-sizing:border-box;animation:none'; g.appendChild(c); any=true; });
    if(!any) return null; document.body.appendChild(g); return g; }catch(_){ return null; } }
function swGhostOut(g,dir){ const done=()=>{ try{ g.remove(); }catch(_){} }; try{ const a=g.animate([{transform:'none',opacity:1},{transform:'translateX('+(-dir*innerWidth)+'px)'}],{duration:190,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'}); a.onfinish=done; a.oncancel=done; }catch(_){ done(); } setTimeout(done,600); }
function show(i,opts){ opts=opts||{}; if(!screens.length) return; const prev=k; k=Math.max(0,Math.min(screens.length-1,i));
  const anim=!!opts.anim&&prev!==k&&!SWREDUCE()&&!!screens[prev]&&document.body.classList.contains('sw'); const dir=k>prev?1:-1; const ghost=anim&&document.documentElement.scrollHeight<=innerHeight*1.5?swGhost(screens[prev]):null; /* 2026-11-10 15:29: no ghost of a long screen */
  screens.forEach((s,j)=>s.forEach(x=>{ x.classList.toggle('sw-on',j===k); if(j!==k) x.classList.remove('sw-open'); x.classList.remove('sw-in-f','sw-in-b'); }));
  document.querySelectorAll('.brk.sw-rows').forEach(b=>b.classList.toggle('sw-has',!!b.querySelector(':scope>.rows>.row.sw-on')));
  if(anim){ screens[k].forEach(x=>{ void x.offsetWidth; x.classList.add(dir>0?'sw-in-f':'sw-in-b'); x.addEventListener('animationend',()=>x.classList.remove('sw-in-f','sw-in-b'),{once:true}); }); if(ghost) swGhostOut(ghost,dir); }
  if(!opts.keep) window.scrollTo(0,0);
  const n=screens.length; posEl.textContent=n>1?(k+1)+' / '+n:''; L.disabled=false; R.disabled=false;
  dots.innerHTML=''; if(n>1&&n<=14) screens.forEach((s,j)=>{ const d=document.createElement('i'); d.className=(j===k?'on':'')+(s[0].classList.contains('sw-stub')?' stub':''); d.onclick=()=>show(j,{anim:true}); dots.appendChild(d); });
  bar.hidden=!on||n<2; if(window.LadderNotices) LadderNotices.tick(); }
function adv(a){ const cur=screens[k]&&screens[k][0]; const deck=cur&&cur.matches('.slides')&&!cur.classList.contains('sw-stub')?cur:null; const A=a||api(deck);
  if(A&&A.i<deckN(A.container)-1){ A.show(A.i+1); return; }
  if(k<screens.length-1) show(k+1,{anim:true}); else if(window.LadderFV&&LadderFV.fwd) LadderFV.fwd({h:true}); }
function ret(a){ const cur=screens[k]&&screens[k][0]; const deck=cur&&cur.matches('.slides')&&!cur.classList.contains('sw-stub')?cur:null; const A=a||api(deck);
  if(A&&A.i>0){ A.show(A.i-1); return; }
  if(k>0) show(k-1,{anim:true}); else if(window.LadderFV&&LadderFV.back){ LadderFV.wantLast=true; LadderFV.back({h:true}); } }
/* the footing view tells us each time it paints a footing */
window.LadderFV=window.LadderFV||{};
LadderFV.onPaint=function(els,cur,info){ ui(); if(!PAGES.test(pg())||!info||!info.on){ on=false; document.body.classList.remove('sw'); clear(); bar.hidden=true; return; }
  build(els); on=screens.length>0; document.body.classList.toggle('sw',on); if(!on){ bar.hidden=true; return; }
  let want=0; const el=LadderFV.wantEl; LadderFV.wantEl=null;
  if(el){ const i=screens.findIndex(s=>s.some(x=>x===el||x.contains(el))); if(i>=0) want=i; }
  else if(LadderFV.wantLast) want=screens.length-1; /* 2026-11-10 (Andrew 15:53): the climb down lands on the first screen; only a swipe back from a row's start lands on the last */
  LadderFV.wantLast=false;
  show(want,{keep:!!el}); };
/* gestures */
let tx=null, ty=null;
const shut=t=>!!(t.closest&&t.closest('canvas,input,textarea,select,.mg,#desk,#lbar,.chq,#stick,.pic,.grapher,.gt,[contenteditable="true"]'));
addEventListener('touchstart',e=>{ if(!on||e.touches.length!==1||shut(e.target)){ tx=null; return; } tx=e.touches[0].clientX; ty=e.touches[0].clientY; },{passive:true});
addEventListener('touchend',e=>{ if(tx==null||!on) return; const t=e.changedTouches[0], dx=t.clientX-tx, dy=t.clientY-ty; tx=null;
  if(Math.abs(dx)<60||Math.abs(dx)<1.4*Math.abs(dy)) return;
  const a=api(deckOf(e.target)); const fwd=ADVANCE_ON_SWIPE_LEFT?dx<0:dx>0; if(fwd) adv(a); else ret(a); },{passive:true});
document.addEventListener('keydown',e=>{ if(!on||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey) return; if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft') return;
  const t=e.target; if(t&&(t.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(t.tagName))) return;
  if(document.querySelector('#desk.open,#stick,#agreebox:not([hidden])')||document.body.classList.contains('stickopen')||document.body.classList.contains('cardsopen')||document.body.classList.contains('toolpage')) return;
  e.preventDefault(); e.stopPropagation(); if(e.key==='ArrowRight') adv(null); else ret(null); },true);
/* a collapsed screen opens for this visit when tapped */
document.addEventListener('click',e=>{ if(!on) return; const s=e.target.closest&&e.target.closest('.sw-stub.sw-on'); if(!s||s.classList.contains('sw-open')||e.target.closest('a,button,input')) return; s.classList.add('sw-open'); });
window.LadderSwipe={show,adv,ret,screens:()=>screens,at:()=>k,on:()=>on};
})();

/* ---- Phase G: unlock notices (Andrew 2026-11-09 16:26). One line when something new opens: a tool in the toolbox, an annex in the
   catalogue, a question pool in the laundry, a star. At most one per screen; the rest wait in a queue kept in the marks and show on
   later screens. The first time this version runs, what is already open is taken as read and announced to nobody. */
(function(){
'use strict';
if(window.LADDER_DESK) return;
const J=(k,d)=>{ try{ const v=JSON.parse(LS.getItem(k)||'null'); return v==null?d:v; }catch(e){ return d; } };
const put=(k,v)=>{ try{ LS.setItem(k,JSON.stringify(v)); }catch(e){} };
const QK='ladder:notices', SEEN='ladder:noticed', SNAP='ladder:unlocksnap';
let shown=false, box=null, base=false;
function queue(key,msg,mark,num){ const seen=J(SEEN,{}); if(seen[key]) return; seen[key]=Date.now(); put(SEEN,seen); if(base) return; const q=J(QK,[]); const n={k:key,m:msg,t:Date.now()}; if(mark){ n.a=mark; n.s=num; let i=0; while(i<q.length&&q[i].a) i++; q.splice(i,0,n); /* marks play first, in the order earned */ } else q.push(n); put(QK,q); }
const STAR_P='M12 2.4l2.95 6.35 6.95.82-5.13 4.75 1.36 6.86L12 17.75 5.87 21.18l1.36-6.86L2.1 9.57l6.95-.82z';
/* starpop 2 */ const WAVE_P='M-24 0q3-1.7 6 0t6 0 6 0 6 0 6 0 6 0 6 0 6 0V30H-24z';
const MARKS={blue:'<svg viewBox="0 0 24 24" aria-hidden="true"><defs><clipPath id="spclip"><path d="'+STAR_P+'"/></clipPath></defs><g clip-path="url(#spclip)"><g class="sp-rise"><path class="sp-wave sp-wave2" d="'+WAVE_P+'"/><path class="sp-wave" d="'+WAVE_P+'"/></g></g><path class="sp-line" d="'+STAR_P+'"/>'+/* starpop 3 */'<g class="sp-drops"><circle cx="12.00" cy="3.30" r="1.05" style="--x1:-1.7px;--y1:-4.7px;--x2:-2.3px;--y2:-2.4px;--d:0.04s"/><circle cx="12.00" cy="3.30" r="1.3" style="--x1:0.0px;--y1:-6.8px;--x2:0.0px;--y2:-5.2px;--d:0s"/><circle cx="12.00" cy="3.30" r="0.95" style="--x1:1.7px;--y1:-5.2px;--x2:2.4px;--y2:-3.0px;--d:0.07s"/><circle cx="12.00" cy="3.30" r="0.75" style="--x1:0.9px;--y1:-8.0px;--x2:1.2px;--y2:-6.9px;--d:0.1s"/><circle cx="21.04" cy="9.83" r="1.05" style="--x1:3.5px;--y1:-3.4px;--x2:4.8px;--y2:-0.5px;--d:0.04s"/><circle cx="21.04" cy="9.83" r="1.3" style="--x1:5.9px;--y1:-2.4px;--x2:8.2px;--y2:0.9px;--d:0s"/><circle cx="21.04" cy="9.83" r="0.95" style="--x1:4.9px;--y1:-0.3px;--x2:6.8px;--y2:3.8px;--d:0.07s"/><circle cx="21.04" cy="9.83" r="0.75" style="--x1:7.4px;--y1:-1.9px;--x2:10.2px;--y2:1.6px;--d:0.1s"/><circle cx="17.61" cy="20.45" r="1.05" style="--x1:3.8px;--y1:1.8px;--x2:5.2px;--y2:6.7px;--d:0.04s"/><circle cx="17.61" cy="20.45" r="1.3" style="--x1:3.6px;--y1:4.4px;--x2:5.0px;--y2:10.4px;--d:0s"/><circle cx="17.61" cy="20.45" r="0.95" style="--x1:1.3px;--y1:4.1px;--x2:1.8px;--y2:10.0px;--d:0.07s"/><circle cx="17.61" cy="20.45" r="0.75" style="--x1:3.6px;--y1:6.0px;--x2:5.0px;--y2:12.5px;--d:0.1s"/><circle cx="6.39" cy="20.45" r="1.05" style="--x1:-1.1px;--y1:3.7px;--x2:-1.5px;--y2:9.4px;--d:0.04s"/><circle cx="6.39" cy="20.45" r="1.3" style="--x1:-3.6px;--y1:4.4px;--x2:-5.0px;--y2:10.4px;--d:0s"/><circle cx="6.39" cy="20.45" r="0.95" style="--x1:-4.1px;--y1:2.1px;--x2:-5.6px;--y2:7.2px;--d:0.07s"/><circle cx="6.39" cy="20.45" r="0.75" style="--x1:-5.1px;--y1:4.9px;--x2:-7.0px;--y2:11.1px;--d:0.1s"/><circle cx="2.96" cy="9.83" r="1.05" style="--x1:-4.4px;--y1:-0.2px;--x2:-6.2px;--y2:3.9px;--d:0.04s"/><circle cx="2.96" cy="9.83" r="1.3" style="--x1:-5.9px;--y1:-2.4px;--x2:-8.2px;--y2:0.9px;--d:0s"/><circle cx="2.96" cy="9.83" r="0.95" style="--x1:-3.9px;--y1:-3.6px;--x2:-5.4px;--y2:-0.8px;--d:0.07s"/><circle cx="2.96" cy="9.83" r="0.75" style="--x1:-6.8px;--y1:-3.6px;--x2:-9.5px;--y2:-0.8px;--d:0.1s"/></g></svg>',
  gold:'<svg viewBox="0 0 24 24" aria-hidden="true"><path class="sp-fill" d="'+STAR_P+'"/></svg>',
  wings:'<span class="sp-corona" aria-hidden="true"></span><svg viewBox="0 0 28 14" aria-hidden="true"><path d="M13.4 9.2C11 3.6 6.4.9.8.8c1 3 2.4 5 4.4 6.2-1 .5-1.7 1.1-2.2 1.9 1.9.9 3.8 1 5.2.7-.6 1-.8 2-.5 3.2 1.4.4 3.4-.2 5.7-3.6z"/><path transform="matrix(-1 0 0 1 28 0)" d="M13.4 9.2C11 3.6 6.4.9.8.8c1 3 2.4 5 4.4 6.2-1 .5-1.7 1.1-2.2 1.9 1.9.9 3.8 1 5.2.7-.6 1-.8 2-.5 3.2 1.4.4 3.4-.2 5.7-3.6z"/></svg>'};
const MARKNAME={blue:'blue star',gold:'gold star',wings:'angel wings'};
function renderMark(n){ if(box) box.remove(); box=document.createElement('div'); box.className='unlocknote un-ach un-'+n.a; box.setAttribute('role','status');
  box.setAttribute('aria-label',MARKNAME[n.a]+': '+n.s);
  box.innerHTML='<span class="sp-ic">'+MARKS[n.a]+'</span><span class="sp-n"></span>'; box.querySelector('.sp-n').textContent=n.s;
  const mine=box, shut=()=>{ if(box!==mine) return; mine.classList.remove('on'); setTimeout(()=>{ mine.remove(); if(box===mine){ box=null; shown=false; next(); } },300); };
  box.onclick=shut; document.body.appendChild(box); requestAnimationFrame(()=>box.classList.add('on'));
  clearTimeout(render.h); render.h=setTimeout(shut,n.a==='wings'?4200:3200); }
function render(n){ if(n.a&&MARKS[n.a]) return renderMark(n); if(box) box.remove(); box=document.createElement('div'); box.className='unlocknote'; box.setAttribute('role','status');
  box.innerHTML='<span class="un-k">new</span><span class="un-m"></span><button type="button" class="un-x" aria-label="close">×</button>';
  box.querySelector('.un-m').textContent=n.m; box.querySelector('.un-x').onclick=()=>{ box.classList.remove('on'); setTimeout(()=>box&&box.remove(),250); };
  document.body.appendChild(box); requestAnimationFrame(()=>box.classList.add('on'));
  clearTimeout(render.h); render.h=setTimeout(()=>{ if(box){ box.classList.remove('on'); setTimeout(()=>box&&box.remove(),300); } },8000); }
function next(){ if(shown) return; if(document.querySelector('#stick,#agreebox:not([hidden]),#splash:not([hidden])')||document.body.classList.contains('cardsopen')) return;
  const q=J(QK,[]); if(!q.length) return; const n=q.shift(); put(QK,q); shown=true; render(n); }
/* what is open now */
const once={}; function script(src,test){ if(test&&test()) return Promise.resolve(true); if(once[src]) return once[src];
  return once[src]=new Promise(res=>{ const s=document.createElement('script'); s.src=src; s.onload=()=>res(true); s.onerror=()=>res(false); document.head.appendChild(s); }); }
function high(){ const P=J('pages:done',{}); let h=-1; for(const k in P){ const m=k.match(/^open:r(\d+)$/); if(m&&P[k]&&P[k].v) h=Math.max(h,+m[1]); } return h; }
async function scan(){ const U=window.LadderUnlock; if(!U) return;
  await Promise.all([script('ladmap.js',()=>window.LADMAP),script('cardmap.js',()=>window.LADDER_CARDMAP),script('annexes.js',()=>window.LADDER_ANNEXES)]);
  base=!J(SNAP,null);
  const TOOLS=[['r00a','the measuring stick and the standing questions'],['r00b','the techniques, read in one place'],['r01e','the laundry and its question pools'],['r09e','the graph view, for reading and drawing graphs'],[U.firstAnnex(),'the annexes catalogue']];
  TOOLS.forEach(([s,name])=>{ if(s&&U.reached(s)) queue('tool:'+s,'The toolbox has a new tool: '+name+'.'); });
  const D=window.LADDER_ANNEXES; if(D){ const h=high(); D.order.forEach(k=>(D.subj[k]||[]).forEach(a=>{ if(a[3]<=h) queue('annex:'+a[0],'A new annex is open in the toolbox: '+a[1]+' ('+D.names[k]+').'); })); }
  const CM=window.LADDER_CARDMAP||{}; Object.keys(CM).forEach(s=>{ const t=CM[s]&&CM[s][0]; if(t&&/^r\d\d[a-z]$/.test(s)&&U.reached(s)&&U.passed&&U.passed(s)) queue('pool:'+s,'The laundry has new questions: '+t+'’s pool.'); });
  const b=document.querySelector('.lb-counts'); if(b){ const v={blue:+(b.querySelector('.lc-blue b')||{}).textContent||0,gold:+(b.querySelector('.lc-gold b')||{}).textContent||0,wings:+(b.querySelector('.lc-wing b')||{}).textContent||0}, old=J(SNAP,null)||{};
    const UN='ladder:starunits', now=window.__starUnits?window.__starUnits():null, was=J(UN,null); /* the first look only records what is held, so nobody gets a flood of old marks */
    if(now){ if(!base&&was) ['blue','gold','wings'].forEach(k=>{ const had=new Set(was[k]||[]); now[k].forEach(s=>{ if(!had.has(s)) queue('mark:'+k+':'+s,'',k,s); }); }); put(UN,now); }
    put(SNAP,Object.assign({t:Date.now()},v)); } else if(base) put(SNAP,{t:Date.now()});
  base=false; next(); }
window.LadderNotices={tick(){ shown=false; scan(); },queue,next};
const go=()=>setTimeout(()=>scan(),1400);
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',go); else go();
})();

/* 2026-11-11 (Andrew 14:09Z): a button in the index that collapses all the footings, on the desk and in the app.
   It closes every footing list; when none is open it opens them all. The desk remembers a collapse (ladder:idxfold),
   so the lists stay shut on the next load until they are opened again with the button. */
function foldPref(){ try{ return localStorage.getItem('ladder:idxfold')==='1'; }catch(e){ return false; } }
function foldAllButton(){ const box=document.querySelector('.rungs'); if(!box||box.querySelector(':scope>.foldall')) return;
  const all=()=>[...box.querySelectorAll('details.stidx')]; if(!all().length) return;
  const p=document.createElement('p'); p.className='foldall'; const bt=document.createElement('button'); bt.type='button'; p.appendChild(bt); box.insertBefore(p,box.firstChild);
  const label=()=>{ bt.textContent=all().some(d=>d.open)?'collapse all footings':'open all footings'; };
  bt.addEventListener('click',()=>{ const shut=all().some(d=>d.open); all().forEach(d=>{ d.open=!shut; });
    try{ if(shut) localStorage.setItem('ladder:idxfold','1'); else localStorage.removeItem('ladder:idxfold'); }catch(e){} label(); if(window.__fit) window.__fit(); });
  box.addEventListener('toggle',label,true); label(); }
/* idle block */
/* idle animation (Andrew 2026-11-11 20:40Z, 20:44Z): when a slide sits untouched for a while, something quiet happens
   behind its text. Two kinds: 'cat' (an outline of a grey cat that curls up to sleep) and 'rain' (a gentle rain of math
   symbols; the pool grows with the rung of the page). Any touch, key, scroll or pointer move ends it at once.
   Off for anyone whose device asks for reduced motion. Nothing here reads or writes the learner's record. */
(function(){
  if(window.LadderIdle) return;
  /* kind 'turns' (the default): the cat and the rain take turns, the cat first (Andrew 21:11Z: "Cat is good"; the rain a little
     diagonal with a faster fall). The turn is kept for the browser session only. Never over an open panel or dialog. */
  var CFG=Object.assign({kind:'turns', wait:25000, only:function(){return document.body.classList.contains('fv')&&![].some.call(document.querySelectorAll('#agreebox,#cards,#stick,.repbox,#desk.toolpage,.pamenu'),function(e){return e.getClientRects().length>0;});}}, window.LADDER_IDLE||{});
  function turn(){ if(CFG.kind!=='turns') return CFG.kind; var k='cat'; try{ k=sessionStorage.getItem('ladder:idle')==='cat'?'rain':'cat'; sessionStorage.setItem('ladder:idle',k); }catch(e){} return k; }
  var calm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* the pool: [first rung, symbols]. A page of rung n rains every row with first rung <= n. */
  var POOL=[[0,'= ( ) a b'],[1,'¬ ∧ ∨ ⇒ ⇔ ⊥ ⊤'],[2,'∀ ∃ ∈ ∉ ≠'],[3,'∅ ⊆ ∪ ∩ □ ◇'],[4,'+ · 0 1 Σ'],[5,'− < ≤ ½ ⅓'],[7,'∎ ≈'],
    [8,'ℝ √ | sup inf'],[9,'∘ ↦ f⁻¹'],[10,'ε δ lim → ∞'],[13,'Δ f′ dy/dx'],[15,'∫ dx'],[17,'∠ △ ∥ ⊥'],[19,'π ° r²'],
    [22,'sin cos e ln'],[26,'∂ ∇ ×'],[31,'ℂ i ≅ ⊕'],[38,'⊗ ℵ ⊢ ⊨'],[44,'λ ⟶ ⟹']];
  function rung(){ if(CFG.rung!=null) return +CFG.rung; var m=/(?:^|\/)(?:r(\d\d)|floor(\d)|(inf|sky))/.exec(location.pathname); if(!m) return 0;
    if(m[3]) return 99; if(m[2]) return [0,7,11,16,21,30,37,47][+m[2]]||0; return +m[1]; }
  function pool(){ var n=rung(), out=[]; POOL.forEach(function(r){ if(r[0]<=n) out=out.concat(r[1].split(' ')); }); return out; }
  var css='#idle-layer{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .9s ease}'
   +'#idle-layer.on{opacity:1}#idle-layer.off{transition:opacity .25s ease;opacity:0}'
   +'#idle-layer svg.cat{position:absolute;right:4vw;bottom:calc(92px + env(safe-area-inset-bottom,0px));width:min(62vw,300px);height:auto;overflow:visible}'
   +'#idle-layer .cat path{fill:none;stroke:#8d929b;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;opacity:.42}'
   +'#idle-layer .cat .dr{stroke-dasharray:var(--l);stroke-dashoffset:var(--l);animation:idle-draw var(--t,2.4s) ease-in-out var(--d,0s) forwards}'
   +'#idle-layer .cat .eyes-open{animation:idle-out .6s ease 7.2s forwards}#idle-layer .cat .eyes-shut{opacity:0;animation:idle-in .8s ease 7.4s forwards}'
   +'#idle-layer .cat .body{transform-origin:105px 104px;animation:idle-breathe 4.6s ease-in-out 8s infinite}'
   +'#idle-layer .cat .z{opacity:0;animation:idle-z 4.6s ease-in 9s infinite}#idle-layer .cat .z2{animation-delay:10.5s}#idle-layer .cat .z3{animation-delay:12s}'
   +'#idle-layer .drop{position:absolute;top:-2em;color:#8d929b;font-family:Georgia,"Times New Roman",serif;opacity:0;animation:idle-fall var(--t) linear var(--d) infinite;will-change:transform}'
   +'@keyframes idle-draw{to{stroke-dashoffset:0}}@keyframes idle-out{to{opacity:0}}@keyframes idle-in{to{opacity:.42}}'
   +'@keyframes idle-breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.012,1.035)}}'
   +'@keyframes idle-z{0%{opacity:0;transform:translate(0,0)}25%{opacity:.4}100%{opacity:0;transform:translate(10px,-22px)}}'
   +'@keyframes idle-fall{0%{opacity:0;transform:translate(0,0)}6%{opacity:var(--o)}54%{opacity:var(--o)}62%{opacity:0;transform:translate(16vw,108vh)}100%{opacity:0;transform:translate(16vw,108vh)}}';
  var CAT='<svg class="cat" viewBox="0 0 210 130" aria-hidden="true">'
   /* the body curls round first, then the head settles, the ears, the tail wraps the paws; then the eyes close */
   +'<g class="body"><path class="dr" style="--l:420;--t:3s" d="M52 104 C30 96 28 62 54 44 C82 25 134 24 162 44 C186 61 188 92 170 104 C150 116 82 116 52 104"/>'
   +'<path class="dr" style="--l:120;--t:1.4s;--d:2.4s" d="M150 52 C136 58 124 72 122 90"/>'
   +'<path class="dr" style="--l:150;--t:1.6s;--d:3.2s" d="M38 96 C34 80 44 66 60 64 C78 62 90 74 90 90 C90 104 78 112 62 112 C50 112 40 106 38 96"/>'
   +'<path class="dr" style="--l:40;--t:.6s;--d:4.4s" d="M44 74 L41 57 L55 66"/><path class="dr" style="--l:40;--t:.6s;--d:4.7s" d="M72 64 L82 52 L86 70"/></g>'
   +'<path class="dr" style="--l:260;--t:2.2s;--d:5s" d="M172 100 C184 118 150 126 112 124 C88 123 70 120 64 113"/>'
   +'<path class="dr eyes-open" style="--l:14;--t:.3s;--d:5.2s" d="M51 88 a2.4 2.4 0 1 0 .1 0 M71 88 a2.4 2.4 0 1 0 .1 0"/>'
   +'<path class="eyes-shut" d="M47 90 q4.5 3.5 9 0 M67 90 q4.5 3.5 9 0 M60 97 l2 2 l2 -2"/>'
   +'<path class="z" d="M96 46 h7 l-7 8 h7"/><path class="z z2" d="M108 32 h6 l-6 7 h6"/><path class="z z3" d="M118 20 h5 l-5 6 h5"/></svg>';
  var layer=null, timer=null;
  function build(){ if(!document.getElementById('idle-style')){ var s=document.createElement('style'); s.id='idle-style'; s.textContent=css; document.head.appendChild(s); }
    layer=document.createElement('div'); layer.id='idle-layer'; layer.setAttribute('aria-hidden','true');
    if(turn()==='rain'){ var P=pool(), w=window.innerWidth, n=Math.max(10,Math.min(26,Math.round(w/22))), h='';
      for(var i=0;i<n;i++){ var t=14+Math.random()*14, sz=14+Math.random()*16;
        h+='<span class="drop" style="left:'+(-12+Math.random()*106).toFixed(1)+'%;font-size:'+sz.toFixed(0)+'px;--t:'+t.toFixed(1)+'s;--d:'+(Math.random()*t).toFixed(1)+'s;--o:'+(0.26+Math.random()*0.22).toFixed(2)+'">'+P[Math.floor(Math.random()*P.length)]+'</span>'; }
      layer.innerHTML=h; }
    else layer.innerHTML=CAT;
    document.body.appendChild(layer); requestAnimationFrame(function(){ requestAnimationFrame(function(){ if(layer) layer.classList.add('on'); }); }); }
  function stop(){ if(layer){ var l=layer; layer=null; l.classList.add('off'); setTimeout(function(){ l.remove(); },300); } if(!CFG.manual) arm(); }
  function arm(){ clearTimeout(timer); if(calm) return; timer=setTimeout(function(){ if(!layer&&!document.hidden&&CFG.only()) build(); else if(!layer) arm(); },CFG.wait); }
  if(!CFG.manual){ ['pointerdown','pointermove','touchstart','keydown','wheel','scroll'].forEach(function(e){ window.addEventListener(e,stop,{passive:true,capture:true}); });
  document.addEventListener('visibilitychange',stop); }
  window.LadderIdle={start:function(kind){ if(kind) CFG.kind=kind; if(layer){ layer.remove(); layer=null; } clearTimeout(timer); build(); },stop:stop,cfg:CFG,pool:pool};
  if(!CFG.manual) arm();
})();
/* end idle block */

/* ---- the rung Steps Towards Symbolizing Induction into Action (Andrew 2026-11-11 23:15Z): one rung above the History step,
   built from his dbt-arrows.md as five series of steps (dbtg, dbtm, dbtie, dbter, dbtdt). Hidden until the climber finishes
   the History step: the History pages carry no questions, so finishing is reaching the end of hist6 (its last footing or its
   closing links, seen or pressed), kept as ladder:histdone. Index row #dbtsec. */
(function(){
'use strict';
const KEY='ladder:histdone', PAGES=['dbtg','dbtm','dbtie','dbter','dbtdt'];
const done=()=>{ try{ return !!LS.getItem(KEY); }catch(e){ return false; } };
const mark=()=>{ if(done()) return; try{ LS.setItem(KEY,String(Date.now())); }catch(e){} row(); };
function open(){ return !!(window.LADDER_DESK||done()); }
function row(){ const r=document.getElementById('dbtsec'); if(r) r.hidden=!open(); }
function page(){ try{ return ladderPage(); }catch(e){ const m=location.pathname.match(/([^\/]+)\.html$/); return m?m[1]:'index'; } }
function hist6(){
  const lab=(a,t)=>{ const l=a.classList.contains('pnb')?a.querySelector('.pl'):null; if(l) l.textContent=t; else a.textContent=t; };
  const fix=()=>document.querySelectorAll('.pn a.pnb.next, header.top .home a, nav.nextrung a').forEach(a=>{
    if(a.dataset.dbt) return; const h=a.getAttribute('href')||'';
    if(/^index\.html/.test(h)&&(a.classList.contains('next')||/→/.test(a.textContent))){ a.dataset.dbt='1'; a.setAttribute('href','dbtg.html');
      lab(a,a.classList.contains('pnb')?'steps towards symbolizing induction into action':'next: steps towards symbolizing induction into action →'); a.addEventListener('click',mark,true); } });
  fix(); setTimeout(fix,400); setTimeout(fix,1500);
  const st=[...document.querySelectorAll('section.step')], last=st[st.length-1], nav=document.querySelector('nav.nextrung');
  const seen=el=>{ if(!el||!el.offsetHeight) return false; const r=el.getBoundingClientRect(); return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth; };
  const check=()=>{ if(seen(last)||seen(nav)) mark(); };
  ['scroll','click','keyup','touchend','pagehide'].forEach(e=>addEventListener(e,check,{passive:true,capture:true}));
  const iv=setInterval(()=>{ check(); if(done()) clearInterval(iv); },700); }
/* a block keeps its columns when it fits at 12.5px or more; otherwise its pieces wrap whole, at 14px */
function fit(pre){ if(!pre.clientWidth) return; pre.classList.remove('dwrap'); let f=15; pre.style.fontSize=f+'px';
  while(pre.scrollWidth>pre.clientWidth+1&&f>12.5){ f-=.5; pre.style.fontSize=f+'px'; }
  if(pre.scrollWidth>pre.clientWidth+1){ pre.classList.add('dwrap'); pre.style.fontSize='14px'; } }
function fitAll(){ const ps=[...document.querySelectorAll('pre.dbtx')]; if(!ps.length) return;
  ps.forEach(fit);
  if('ResizeObserver' in window){ let w=new WeakMap(); const ro=new ResizeObserver(es=>es.forEach(e=>{ const p=e.target, cw=p.clientWidth; if(cw&&w.get(p)!==cw){ w.set(p,cw); fit(p); } })); ps.forEach(p=>ro.observe(p)); }
  else addEventListener('resize',()=>ps.forEach(fit)); }
function go(){ const pg=page(); row(); if(pg==='hist6') hist6(); if(PAGES.includes(pg)) fitAll(); }
window.LadderDbt={open,done,mark};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',go); else go();
})();
/* nunito */
/* nunito figures */
try{ if(document.fonts&&document.fonts.load){ window.addEventListener('load',function(){ if(!document.querySelector('canvas')) return; document.fonts.load('600 12px Nunito').then(function(){ try{ window.dispatchEvent(new Event('resize')); }catch(e){} }); }); } }catch(e){}
/* toolscreens */
(function(){ 'use strict'; if(window.LADDER_DESK) return;
  const closeStick=()=>{ const s=document.getElementById('stick'); if(s){ s.remove(); document.body.classList.remove('stickopen'); } };
  document.addEventListener('click',e=>{ if(e.target.closest&&e.target.closest('#lbar')&&document.getElementById('stick')) closeStick(); },true);
  const boot=()=>{ if(!document.querySelector('.rungs')) return;
    const f=document.createElement('button'); f.type='button'; f.id='annexfab'; f.textContent='Annexes'; f.hidden=true;
    f.onclick=()=>{ if(window.LadderAnnexes) LadderAnnexes.catalogue(); }; document.body.appendChild(f);
    const sync=()=>{ const a=document.querySelector('#desk .dannex'); f.hidden=!(a&&!a.classList.contains('lk-hide')); };
    sync(); let n=0; const t=setInterval(()=>{ sync(); if(++n>60) clearInterval(t); },250); document.addEventListener('click',()=>setTimeout(sync,60)); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0)); else boot();
})();
/* cellarnav */
(function(){ 'use strict'; if(window.LADDER_DESK) return;
  const NONE=new Set(["r09d","r09f"]);
  const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const pages=()=>{ try{ return JSON.parse(LS.getItem('pages:done')||'{}')||{}; }catch(e){ return {}; } };
  const here=()=>(location.pathname.split('/').pop()||'').replace(/\.html$/,'');
  const lab=s=>((window.LADDER_CARDMAP||{})[s]||[s.replace(/^r0*(\d+)/,'$1')])[0];
  const maps=()=>(window.LadderStick&&LadderStick.maps?LadderStick.maps():Promise.resolve()).catch(()=>{});
  /* unlocked: every step of a rung you have opened, any step you have passed, and the step you have climbed to */
  function unlocked(){ const P=pages(); let h=-1; for(const k in P){ const m=k.match(/^open:r(\d+)$/); if(m&&P[k]&&P[k].v) h=Math.max(h,+m[1]); }
    let far=''; try{ far=(JSON.parse(LS.getItem('ladder:furthest')||'null')||{}).page||''; }catch(e){}
    const out=[]; (window.LADMAP||[]).forEach(([fl,rungs])=>rungs.forEach(([r,core,annex])=>core.concat(annex).forEach(([s])=>{ if(!NONE.has(s)&&(r<=h||(P[s]&&P[s].v)||s===here()||s===far)) out.push(s); }))); return out; }
  const cache=new Map();
  function load(s){ if(cache.has(s)) return Promise.resolve(cache.get(s));
    const take=(sec,title)=>{ const c=sec.cloneNode(true); c.classList.remove('shut'); c.hidden=false; c.removeAttribute('style'); c.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id')); c.querySelectorAll('.blip,script,button.pa').forEach(e=>e.remove());
      const v={html:c.innerHTML,title:title||''}; cache.set(s,v); return v; };
    return fetch(s+'.html').then(r=>{ if(!r.ok) throw 0; return r.text(); }).then(t=>{ const d=new DOMParser().parseFromString(t,'text/html'), sec=d.querySelector('section.basement'); if(!sec) throw 0;
      const h=d.querySelector('header.top h1, h1'); return take(sec,h?h.textContent.trim():''); }); }
  function typeset(el){ if(!window.katex) return; el.querySelectorAll('[data-tex],[data-tex-inline]').forEach(n=>{ if(n.querySelector('.katex')) return; const inl=n.hasAttribute('data-tex-inline'), t=n.getAttribute(inl?'data-tex-inline':'data-tex');
      try{ katex.render(t,n,{throwOnError:false,strict:false,trust:true,displayMode:!inl}); }catch(e){ n.textContent=t; } }); }
  let box=null, list=[], at=0;
  function close(){ if(box){ box.remove(); box=null; document.body.classList.remove('stickopen'); } }
  function show(dir){ const s=list[at], body=box.querySelector('.cl-body'), nav=box.querySelector('.cl-nav');
    nav.querySelector('.cl-prev').disabled=at<=0; nav.querySelector('.cl-next').disabled=at>=list.length-1;
    nav.querySelector('.cl-at').innerHTML='<b>'+esc(lab(s))+'</b> <span>'+(at+1)+' of '+list.length+'</span>';
    load(s).then(v=>{ if(!box||list[at]!==s) return; body.className='cl-body'; void body.offsetWidth; body.innerHTML=(v.title?'<p class="cl-title"><a href="'+s+'.html">'+esc(v.title)+'</a></p>':'')+v.html; typeset(body); if(dir) body.classList.add(dir>0?'cl-from-r':'cl-from-l'); box.scrollTop=0; })
      .catch(()=>{ if(!box||list[at]!==s) return; body.innerHTML='<p class="sk-n">This cellar could not be opened just now.</p>'; }); }
  function go(d){ const n=at+d; if(!box||n<0||n>=list.length) return; at=n; show(d); }
  function open(stem){ maps().then(()=>{ document.querySelectorAll('#stick').forEach(e=>e.remove()); close();
    list=unlocked(); const want=stem||here(); at=list.indexOf(want); if(at<0) at=list.length-1;
    box=document.createElement('div'); box.id='stick'; box.className='cellar'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','the cellar');
    box.innerHTML='<div class="sk-card"><div class="sk-top" data-slug="there if you want it"><span>the cellar</span><button type="button" class="sk-x" aria-label="back to the ladder">×</button></div>'
      +(list.length?'<div class="cl-nav"><button type="button" class="cl-prev" aria-label="the cellar before">‹</button><span class="cl-at"></span><button type="button" class="cl-next" aria-label="the cellar after">›</button></div><div class="cl-body"></div>'
        :'<p class="sk-n">No cellar is unlocked yet. Each step’s cellar comes here once its rung is open.</p>')+'</div>';
    document.body.appendChild(box); document.body.classList.add('stickopen'); box.querySelector('.sk-x').onclick=close;
    if(!list.length) return;
    box.querySelector('.cl-prev').onclick=()=>go(-1); box.querySelector('.cl-next').onclick=()=>go(1);
    let x0=null,y0=0; box.addEventListener('touchstart',e=>{ const t=e.touches[0]; x0=t.clientX; y0=t.clientY; },{passive:true});
    box.addEventListener('touchend',e=>{ if(x0==null) return; const t=e.changedTouches[0], dx=t.clientX-x0, dy=t.clientY-y0; x0=null; if(Math.abs(dx)>55&&Math.abs(dx)>2*Math.abs(dy)) go(dx<0?1:-1); },{passive:true});
    show(0); }); }
  document.addEventListener('keydown',e=>{ if(!box||!document.body.contains(box)) return; if(e.key==='ArrowLeft'){ e.preventDefault(); go(-1); } else if(e.key==='ArrowRight'){ e.preventDefault(); go(1); } else if(e.key==='Escape') close(); },true);
  window.LadderCellar={open,close,unlocked};
  /* the toolbox's Cellar button opens the same screen */
  document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('#desk .dtabs [data-p="base"]'); if(!b) return; e.preventDefault(); e.stopPropagation();
    const d=document.getElementById('desk'), k=document.getElementById('deskbtn'); if(d&&d.classList.contains('open')&&k) k.click(); open(here()); },true);
  /* on the index: a Cellar button right above the Annexes button */
  const boot=()=>{ if(!document.querySelector('.rungs')) return;
    const f=document.createElement('button'); f.type='button'; f.id='cellarfab'; f.textContent='Cellar'; f.hidden=true; f.onclick=()=>open(null); document.body.appendChild(f);
    const sync=()=>{ const a=document.getElementById('annexfab'); f.classList.toggle('low',!a||a.hidden); f.hidden=!(window.LADMAP&&unlocked().length); };
    maps().then(()=>{ sync(); let n=0; const t=setInterval(()=>{ sync(); if(++n>60) clearInterval(t); },250); document.addEventListener('click',()=>setTimeout(sync,60)); }); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0)); else boot();
})();
