/* Marks sync: mirrors each page's ✓ marks (still saved in this browser) into this artifact's
   database, so they follow you across devices and the morning brief can read real progress.
   One document per page: marks/<page>  {page, title, updatedAt, marks:{id:{v,t}}}.
   The newest change wins, per mark. Without the database the page works exactly as before. */
(function(){
'use strict';
const page=((location.pathname.split('/').pop()||'index.html').replace(/\.html?$/,''))||'index';
const TK=k=>k+':t';
function times(KEY){ try{ return JSON.parse(LS.getItem(TK(KEY))||'{}')||{}; }catch(e){ return {}; } }
function saveTimes(KEY,t){ try{ LS.setItem(TK(KEY),JSON.stringify(t)); }catch(e){} }
let dbp=null;
function waitDb(){
  if(dbp) return dbp;
  dbp=new Promise(res=>{
    let n=0; (function tryUse(){
      if(window.claude&&typeof window.claude.use==='function'){ window.claude.use('db').then(res,()=>res(null)); return; }
      if(++n>40) return res(null); setTimeout(tryUse,250);
    })();
  });
  return dbp;
}
let ref=null, state=null, readOnly=false, chain=Promise.resolve(), pending=false;
function write(){
  if(readOnly||!ref||!state) return;
  if(pending) return; pending=true;
  chain=chain.then(()=>new Promise(r=>setTimeout(r,400))).then(()=>{ pending=false;
    return ref.set({page, title:document.title, updatedAt:new Date().toISOString(), marks:state}); })
  .catch(e=>{ pending=false; if(e&&(e.code==='invalid_argument'||e.code==='revoked'||e.code==='not_granted')) readOnly=true; });
}
window.MarksSync={
  push(KEY,st,id){
    const t=times(KEY); t[id]=Date.now(); saveTimes(KEY,t);
    if(state){ state[id]={v:!!st[id],t:t[id]}; write(); }
  },
  async init(KEY,st,items){
    const db=await waitDb(); if(!db) return;
    try{ ref=db.doc('marks/'+page); }catch(e){ return; }
    let snap; try{ snap=await ref.get(); }catch(e){ ref=null; return; }
    const body=snap.exists?(snap.data()||{}):{};
    const remote=(body.marks&&typeof body.marks==='object')?body.marks:{};
    const t=times(KEY); const next={}; let local=false, up=false;
    new Set([...Object.keys(remote),...Object.keys(st)]).forEach(id=>{
      const r=remote[id], lt=t[id]||0, has=Object.prototype.hasOwnProperty.call(st,id);
      if(r&&typeof r==='object'&&(!has||(+r.t||0)>=lt)){
        next[id]={v:!!r.v,t:+r.t||0};
        if(!has||!!st[id]!==!!r.v){ st[id]=!!r.v; local=true; }
        t[id]=+r.t||0;
      } else { next[id]={v:!!st[id],t:lt}; if(!r||!!r.v!==!!st[id]) up=true; }
    });
    state=next;
    if(local){ try{ LS.setItem(KEY,JSON.stringify(st)); }catch(e){} saveTimes(KEY,t);
      items.forEach(it=>{ if(Object.prototype.hasOwnProperty.call(st,it.id)) it.set(!!st[it.id]); }); }
    if(up) write();
  }
};

/* Page completion: a page reports whether every one of its questions is ticked; the ladder reads the reports to decide
   which step rows may be ticked. Kept in this browser ("pages:done") and in the database doc marks/_pages,
   {pages:{<page>:{v,t}}}, newest report wins, so phone and computer agree. */
const PK='pages:done';
function localPages(){ try{ return JSON.parse(LS.getItem(PK)||'{}')||{}; }catch(e){ return {}; } }
function saveLocalPages(m){ try{ LS.setItem(PK,JSON.stringify(m)); }catch(e){} }
let pchain=Promise.resolve();
MarksSync.reportPage=function(stem,done,any,opt,has,ch){
  const o=(opt===undefined)?true:!!opt, h=!!has, cn=ch?+ch.n||0:0, cd=ch?+ch.d||0:0;
  const m=localPages(); const cur=m[stem];
  if(cur&&!!cur.v===!!done&&!!cur.a===!!any&&(cur.o!==false)===o&&!!cur.h===h&&(+cur.cn||0)===cn&&(+cur.cd||0)===cd) return;
  m[stem]={v:!!done,a:!!any,o:o,h:h,cn:cn,cd:cd,t:Date.now()}; saveLocalPages(m);
  pchain=pchain.then(async()=>{ const db=await waitDb(); if(!db) return; let ref; try{ ref=db.doc('marks/_pages'); }catch(e){ return; }
    let body={}; try{ const sn=await ref.get(); body=sn.exists?(sn.data()||{}):{}; }catch(e){ return; }
    const pages=(body.pages&&typeof body.pages==='object')?body.pages:{};
    const loc=localPages();
    Object.keys(loc).forEach(k=>{ const r=pages[k]; if(!r||(+r.t||0)<(+loc[k].t||0)) pages[k]=loc[k]; });
    try{ await ref.set({pages,updatedAt:new Date().toISOString()}); }catch(e){} }).catch(()=>{});
};
MarksSync.pages=async function(){
  const m=localPages(); const db=await waitDb(); if(!db) return m;
  try{ const sn=await db.doc('marks/_pages').get(); const body=sn.exists?(sn.data()||{}):{}; const pages=(body.pages&&typeof body.pages==='object')?body.pages:{};
    Object.keys(pages).forEach(k=>{ const r=pages[k]; if(!m[k]||(+r.t||0)>(+m[k].t||0)) m[k]={v:!!r.v,a:!!r.a,o:r.o!==false,h:!!r.h,cn:+r.cn||0,cd:+r.cd||0,t:+r.t||0}; }); saveLocalPages(m); }catch(e){}
  return m;
};
})();
