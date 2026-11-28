/* Under pressure: the nook's own toolbox (Andrew 2026-11-22 20:56Z).
   On the five DBT series pages the toolbox keeps what the regular ladder has, except the Laundry and the competition:
   its own index (the five series and their footings), its own Techs Read and Tech Deck (the rung's marks),
   Answering Questions by category with the rung's own questions, and an award for each series completed.
   Nook progress lives under nook:* keys and never moves the ladder's reach. */
(function(){
const SER={dbtg:'G',dbtm:'M',dbtie:'IE',dbter:'ER',dbtdt:'DT'};
const page=(location.pathname.split('/').pop()||'').replace(/\.html$/,'');
const FRONT=page==='dbt';   /* the nook's first page: no series of its own */
if(!(SER[page]||FRONT)||window.LADDER_DESK) return;
const N=()=>window.LADDER_NOOK, BOLD={G:'𝐆',M:'𝐌',IE:'𝐈𝐄',ER:'𝐄𝐑',DT:'𝐃𝐓'};
const get=(k,d)=>{ try{ const v=JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } };
const put=(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* blackletter: fraktur letters drawn in the blackletter face, as on the page */
const FKM=(()=>{ const m={}, A='ABCDEFGHIJKLMNOPQRSTUVWXYZ', a='abcdefghijklmnopqrstuvwxyz', hole={C:'ℭ',H:'ℌ',I:'ℑ',R:'ℜ',Z:'ℨ'};
  for(let i=0;i<26;i++){ m[hole[A[i]]||String.fromCodePoint(0x1D504+i)]=A[i]; m[String.fromCodePoint(0x1D51E+i)]=a[i]; m[String.fromCodePoint(0x1D56C+i)]=A[i]; m[String.fromCodePoint(0x1D586+i)]=a[i]; } return m; })();
const fk=s=>[...String(s)].map(c=>FKM[c]?'<span class="fk">'+FKM[c]+'</span>':esc(c)).join('');
const stepId=s=>s==='∎'?'dbtend':'dbt'+s;
document.documentElement.classList.add('nook');
try{ localStorage.setItem('ladder:pressure','1'); }catch(e){}

/* progress: footings opened (the site's own steps:<page>), practice ticked, awards */
const seen=get('nook:seen',{}); seen[page]=1; put('nook:seen',seen);
const opened=s=>{ const v=parseInt(get('steps:'+s.page,0),10)||0; return v||(get('nook:seen',{})[s.page]?1:0); };
const isOpen=(s,i)=>i<opened(s);
const pkey=(st,j)=>st.id+'.'+j;
const ticked=()=>get('nook:pr',{});
const done=s=>opened(s)>=s.footings&&s.steps.every(st=>st.practice.every((_,j)=>ticked()[pkey(st,j)]));
const awards=()=>get('nook:aw',{});
function say(t){ let d=document.getElementById('nk-toast'); if(!d){ d=document.createElement('div'); d.id='nk-toast'; d.setAttribute('role','status'); document.body.appendChild(d); }
  d.textContent=t; d.classList.add('on'); clearTimeout(say.t); say.t=setTimeout(()=>d.classList.remove('on'),4200); }
function check(quiet){ if(!N()) return; const A=awards(); let got=null;
  N().series.forEach(s=>{ if(!A[s.id]&&done(s)){ A[s.id]=Date.now(); got=s; } });
  if(got){ put('nook:aw',A); if(!quiet) say(BOLD[got.id]+' · '+got.name+' is complete. Its award is yours.'); }
  bar(); }
function last(){ const L=get('nook:last',null); return L&&L.page&&SER[L.page]?L:null; }
function here(){ const ss=[...document.querySelectorAll('section.step')].filter(s=>!s.hidden&&s.offsetHeight>0); let at=null; const y=innerHeight*.35; /* footing view hides all but the footing on screen */
  ss.forEach(s=>{ if(s.getBoundingClientRect().top<y) at=s; }); return at; }
function mark(){ if(FRONT) return; const s=here(); if(s) put('nook:last',{page,id:s.id,t:Date.now()}); }
addEventListener('scroll',()=>{ clearTimeout(mark.t); mark.t=setTimeout(mark,600); },{passive:true});
document.addEventListener('click',e=>{ if(e.target.closest&&e.target.closest('.stnextb')) setTimeout(()=>{ mark(); check(); },120); },true);

/* the bar: the ladder's stars give way to the five series awards */
function bar(){ const c=document.querySelector('#lbar .lb-counts'); if(!c||!N()) return; let n=c.querySelector('.lc-nook');
  if(!n){ n=document.createElement('button'); n.type='button'; n.className='lc lc-nook'; n.onclick=e=>{ e.preventDefault(); index(); }; c.appendChild(n); }
  const A=awards(); n.innerHTML=N().series.map(s=>'<span class="nk-aw'+(A[s.id]?' on':'')+'" title="'+esc(s.name)+(A[s.id]?': complete':'')+'">'+BOLD[s.id]+'</span>').join('');
  n.setAttribute('aria-label','Under pressure awards: '+N().series.filter(s=>A[s.id]).length+' of 5 series complete; open the index'); }

/* the overlay, in the frame of the ladder's own Answering Questions */
function frame(slug,title){ shut(); const b=document.createElement('div'); b.id='stick'; b.className='sqbox nkbox'; b.setAttribute('role','dialog'); b.setAttribute('aria-label',title);
  b.innerHTML='<div class="sk-card"><div class="sk-top" data-slug="'+esc(slug)+'"><span>'+esc(title)+'</span><button type="button" class="sk-x" aria-label="close"></button></div><div class="nk-body"></div></div>';
  document.body.appendChild(b); document.body.classList.add('stickopen'); b.querySelector('.sk-x').onclick=shut; return b.querySelector('.nk-body'); }
function shut(){ const b=document.getElementById('stick'); if(b){ b.remove(); document.body.classList.remove('stickopen'); } }
function closeDesk(){ const d=document.getElementById('desk'); if(d&&d.classList.contains('open')){ const x=d.querySelector('.dtabs .x'); if(x) x.click(); } }
const go=(s,id)=>s.page+'.html#'+id;

/* the nook's index: five series, their footings, and the way back to the ladder */
function index(){ closeDesk(); const body=frame('under pressure','Index'); if(!N()){ body.innerHTML='<p class="sk-n">The index is loading.</p>'; return; }
  const A=awards(), L=last();
  let h='<p class="sk-n">Five series, each a run of footings. Open every footing of a series and tick its practice for its award.</p>';
  if(L){ const s=N().series.find(x=>x.page===L.page), st=s&&s.steps.find(t=>stepId(t.id)===L.id);
    h+='<p class="nk-resume"><a href="'+go(s,L.id)+'">Pick up where you left off: '+esc(st?st.id+' · '+st.title:s.name)+' →</a></p>'; }
  N().series.forEach(s=>{ const o=Math.min(opened(s),s.footings);
    h+='<details class="sk-fl nk-ser'+(A[s.id]?' nk-won':'')+'"'+(s.page===page?' open':'')+'><summary><b>'+BOLD[s.id]+'</b> '+esc(s.name)+' <span class="sk-st">'+(A[s.id]?'<span class="nk-awi">award</span> complete':o+' of '+s.footings+' open')+'</span></summary><ul class="sk-list">';
    s.steps.forEach((st,i)=>{ const on=isOpen(s,i);
      h+='<li class="'+(on?'nk-on':'nk-shut')+'">'+(on?'<a href="'+go(s,stepId(st.id))+'">':'<span>')+'<b class="nk-id">'+esc(st.id)+'</b> '+fk(st.title)+(on?'</a>':'</span>')+'</li>'; });
    if(s.id==='DT') h+='<li class="'+(opened(s)>=s.footings?'nk-on':'nk-shut')+'">'+(opened(s)>=s.footings?'<a href="dbtdt.html#dbtconcl">':'<span>')+'<b class="nk-id">∴</b> conclusion'+(opened(s)>=s.footings?'</a>':'</span>')+'</li>';
    h+='</ul></details>'; });
  h+='<p class="nk-resume"><a href="dbtg.html">What Under pressure is: the summary →</a></p><p class="nk-out"><a href="index.html">Leave Under pressure for the ladder →</a></p>';
  body.innerHTML=h; body.querySelectorAll('a[href*="#"]').forEach(a=>a.addEventListener('click',()=>{ if(a.getAttribute('href').startsWith(page+'.html')) shut(); })); }

/* a mark's card: the mark, what it means here or the ladder step that teaches it, and where the rung first uses it */
const card=(m,s,st)=>'<div class="dmv nk-mk"><b class="nk-m">'+fk(m[0])+'</b> <span class="kd">'+(m[2]?'taught on the ladder':'this rung')+' · first used at '+esc(st.id)+'</span>'
  +(m[1]?'<div class="mw">'+fk(m[1])+'</div>':'')
  +'<a class="mwhere" href="'+(s.page===page?'':s.page+'.html')+'#'+stepId(st.id)+'">where it is first used'+(s.page===page?', on this page':'')+' →</a>'
  +(m[2]?'<a class="mwhere nk-lad" href="'+esc(m[2])+'">taught at '+esc(m[3])+' →</a>':'')+'</div>';
function moves(){ const host=document.getElementById('nkmoves'); if(!host||!N()) return; const s=N().series.find(x=>x.page===page);
  if(!s){ host.innerHTML='<p class="dnote">Open a series and the marks its footings first use are listed here.</p>'; return; }
  let h='', shut_=0;
  s.steps.forEach((st,i)=>{ if(!st.marks.length) return; if(!isOpen(s,i)){ shut_+=st.marks.length; return; }
    h+='<details class="dfold nk-step"'+(i===Math.min(opened(s),s.steps.length)-1?' open':'')+'><summary><span>'+esc(st.id)+' · '+fk(st.title)+'</span><b>'+st.marks.length+'</b></summary>'+st.marks.map(m=>card(m,s,st)).join('')+'</details>'; });
  host.innerHTML=(h||'<p class="dnote">No marks yet on the footings open here.</p>')+(shut_?'<p class="dnote">'+shut_+' more marks are first used in footings not yet open.</p>':''); }
function deck(q){ const host=document.getElementById('nkdeck'); if(!host||!N()) return; q=(q||'').trim().toLowerCase(); let h='', all=0, shown=0;
  N().series.forEach(s=>{ const cards=[]; s.steps.forEach((st,i)=>{ if(!isOpen(s,i)) return; st.marks.forEach(m=>{ all++; if(!q||(m[0]+' '+(m[1]||'')+' '+(m[3]||'')).toLowerCase().includes(q)){ shown++; cards.push(card(m,s,st)); } }); });
    if(cards.length) h+='<details class="dfold nk-ser"'+(q||s.page===page?' open':'')+'><summary><span>'+BOLD[s.id]+' · '+esc(s.name)+'</span><b>'+cards.length+'</b></summary>'+cards.join('')+'</details>'; });
  host.innerHTML=h||'<p class="dnote">'+(all?'No mark matches.':'Nothing here yet. Open a footing and the marks it first uses land here.')+'</p>';
  const c=document.getElementById('nkdkcount'); if(c) c.textContent=shown+' of '+all+' open'; }

/* Answering Questions: the rung's own questions, by category */
const CATS=[['un','Understanding','One question for each footing you have opened: why the footing holds. Think it through, then tick it.'],
  ['st','Standing','One case for each skill, set in school or university. Every case meets the problem one of four ways (G4): solve it, feel better about it, tolerate it, or stay miserable. Each way is a real choice with its causes; pick one and see which skills it leans on and which assumption (G6) carries it.'],
  ['ms','Measuring stick','Multiple choice dealt from the other three kinds, from the footings you have opened.'],
  ['pr','Practice','The practice of every footing you have opened. Tick a line when you have done it; a series with every footing open and every line ticked earns its award.']];
function questions(){ closeDesk(); const body=frame('under pressure','Answering Questions'); if(!N()){ body.innerHTML='<p class="sk-n">The questions are loading.</p>'; return; }
  let cur=get('nook:aqcat','st'); if(!CATS.some(c=>c[0]===cur)) cur=CATS[0][0];
  const barEl=document.createElement('p'); barEl.className='sk-tools aq-bar nk-cats'; barEl.innerHTML=CATS.map(c=>'<button type="button" class="aq-b nk-cat-'+c[0]+'" data-k="'+c[0]+'">'+c[1]+'</button>').join('');
  const pane=document.createElement('div'); body.append(barEl,pane);
  const fill=()=>{ barEl.querySelectorAll('.aq-b').forEach(b=>{ const on=b.dataset.k===cur; b.classList.toggle('on',on); b.setAttribute('aria-pressed',String(on)); });
    const lead=CATS.find(c=>c[0]===cur)[2]; if(cur==='pr') practice(pane,lead); else if(cur==='un') understanding(pane,lead); else if(cur==='st') standing(pane,lead); else stick(pane,lead); };
  barEl.querySelectorAll('.aq-b').forEach(b=>b.onclick=()=>{ cur=b.dataset.k; put('nook:aqcat',cur); fill(); }); fill(); }
function practice(pane,lead){ const T=ticked(), A=awards(); let h='<p class="sk-n">'+esc(lead)+'</p>', any=false;
  N().series.forEach(s=>{ const rows=[]; let n=0, k=0;
    s.steps.forEach((st,i)=>{ if(!st.practice.length) return; n+=st.practice.length; if(!isOpen(s,i)){ return; }
      rows.push('<li class="nk-prs"><a class="nk-id" href="'+go(s,stepId(st.id))+'">'+esc(st.id)+'</a> <span class="sk-st">'+fk(st.title)+'</span><ul class="sk-list nk-pl">'
        +st.practice.map((p,j)=>{ const on=!!T[pkey(st,j)]; if(on) k++; return '<li><button type="button" class="nk-tick'+(on?' on':'')+'" data-k="'+esc(pkey(st,j))+'" aria-pressed="'+on+'">'+(on?'✓':'')+'</button> <span class="nk-pr">'+fk(p)+'</span></li>'; }).join('')+'</ul></li>'); });
    if(!n) return; any=true;
    h+='<details class="sk-fl nk-ser'+(A[s.id]?' nk-won':'')+'"'+(s.page===page?' open':'')+'><summary><b>'+BOLD[s.id]+'</b> '+esc(s.name)+' <span class="sk-st">'+k+' of '+n+' ticked</span></summary>'
      +(rows.length?'<ul class="sk-list">'+rows.join('')+'</ul>':'<p class="sk-n">Its practice opens with its footings.</p>')+'</details>'; });
  pane.innerHTML=any?h:'<p class="sk-n">No practice yet.</p>';
  pane.querySelectorAll('.nk-tick').forEach(b=>b.onclick=()=>{ const T=ticked(), k=b.dataset.k; if(T[k]) delete T[k]; else T[k]=Date.now(); put('nook:pr',T);
    const on=!!T[k]; b.classList.toggle('on',on); b.textContent=on?'✓':''; b.setAttribute('aria-pressed',String(on));
    const d=b.closest('details'), sm=d&&d.querySelector('summary .sk-st'); if(sm){ const all=d.querySelectorAll('.nk-tick'), s=N().series.find(x=>d.querySelector('a.nk-id')&&d.querySelector('a.nk-id').getAttribute('href').startsWith(x.page+'.'));
      const total=s?s.steps.reduce((a,st)=>a+st.practice.length,0):all.length; sm.textContent=d.querySelectorAll('.nk-tick.on').length+' of '+total+' ticked'; }
    check(); }); }

/* where a footing lives, from its id (G4, IE12, ∎) */
const PAGE={G:'dbtg',M:'dbtm',IE:'dbtie',ER:'dbter',DT:'dbtdt','∎':'dbtdt'};
const sOf=id=>N().series.find(x=>x.page===PAGE[(id.match(/^[A-Z]+|^∎/)||[''])[0]]);
const stOf=id=>{ const s=sOf(id); return s&&s.steps.find(t=>t.id===id); };
/* a footing can carry a second standing case (tree2): it is walked as its own case, with its own record under the key id#2 */
const K=st=>st.key||st.id;
const second=st=>st&&st.tree2?Object.assign(Object.create(st),{tree:st.tree2,key:st.id+'#2'}):null;
const caseOf=k=>k.slice(-2)==='#2'?second(stOf(k.slice(0,-2))):stOf(k);
const casesOf=st=>st.tree?[st].concat(st.tree2?[second(st)]:[]):[];
const href=id=>{ const s=sOf(id); return (s&&s.page!==page?s.page+'.html':'')+'#'+stepId(id); };
const opens=()=>{ const r=[]; N().series.forEach(s=>s.steps.forEach((st,i)=>{ if(isOpen(s,i)) r.push([s,st]); })); return r; };
const closeOnHere=el=>el.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',shut));
const WAYC=['nk-w1','nk-w2','nk-w3','nk-w4'];

function bySeries(pane,lead,has,row,count){ let h='<p class="sk-n">'+esc(lead)+'</p>', any=false;
  N().series.forEach(s=>{ const rows=[]; let n=0;
    s.steps.forEach((st,i)=>{ if(!has(st)) return; n++; if(isOpen(s,i)) rows.push(row(s,st)); });
    if(!n) return; any=true;
    h+='<details class="sk-fl nk-ser"'+(s.page===page?' open':'')+'><summary><b>'+BOLD[s.id]+'</b> '+esc(s.name)+' <span class="sk-st">'+count(s)+'</span></summary>'
      +(rows.length?'<ul class="sk-list">'+rows.join('')+'</ul>':'<p class="sk-n">These open with the footings.</p>')+'</details>'; });
  pane.innerHTML=any?h:'<p class="sk-n">Nothing here yet.</p>'; closeOnHere(pane); }

function understanding(pane,lead){ const Q=get('nook:uq',{});
  bySeries(pane,lead,st=>st.u,(s,st)=>{ const on=!!Q[st.id];
      return '<li class="nk-uq"><button type="button" class="nk-tick'+(on?' on':'')+'" data-k="'+esc(st.id)+'" aria-pressed="'+on+'">'+(on?'✓':'')+'</button><div><a class="nk-id" href="'+href(st.id)+'">'+esc(st.id)+'</a> <span class="sk-st">'+fk(st.title)+'</span><p class="nk-q">'+fk(st.u)+'</p></div></li>'; },
    s=>s.steps.filter(st=>Q[st.id]).length+' of '+s.steps.filter(st=>st.u).length+' thought through');
  pane.querySelectorAll('.nk-tick').forEach(b=>b.onclick=()=>{ const Q=get('nook:uq',{}), k=b.dataset.k; if(Q[k]) delete Q[k]; else Q[k]=Date.now(); put('nook:uq',Q);
    const on=!!Q[k]; b.classList.toggle('on',on); b.textContent=on?'✓':''; b.setAttribute('aria-pressed',String(on)); }); }

function standing(pane,lead){ const W=get('nook:sq',{});
  bySeries(pane,lead,st=>st.tree,(s,st)=>casesOf(st).map(c=>{ const w=W[K(c)]||[];
      return '<li class="nk-sq"><button type="button" class="nk-case" data-k="'+esc(K(c))+'"><b class="nk-id">'+esc(st.id)+'</b> '+fk(st.title)+(c.key?' <span class="sk-st">second case</span>':'')+' <span class="nk-dots">'+[0,1,2,3].map(j=>'<i class="'+WAYC[j]+(w.includes(j)?' on':'')+'"></i>').join('')+'</span></button></li>'; }).join(''),
    s=>{ const cs=s.steps.flatMap(casesOf); return cs.filter(c=>(W[K(c)]||[]).length).length+' of '+cs.length+' walked'; });
  pane.querySelectorAll('.nk-case').forEach(b=>b.onclick=()=>walk(pane,lead,caseOf(b.dataset.k))); }

/* one case: the start, the four ways, and what each way leans on. No way is wrong. */
function walk(pane,lead,st,pick){ const T=st.tree, W=get('nook:sq',{}), w=W[K(st)]||[];
  let h='<p class="nk-back"><button type="button" class="nk-bk">← all cases</button> <a class="nk-id" href="'+href(st.id)+'">'+esc(st.id)+' · '+fk(st.title)+' →</a></p><p class="nk-start">'+fk(T.t)+'</p><ol class="nk-ways">';
  T.o.forEach((o,j)=>{ h+='<li><button type="button" class="nk-way '+WAYC[j]+(pick===j?' on':'')+(w.includes(j)?' tried':'')+'" data-j="'+j+'"><span class="nk-wn">'+(j+1)+' · '+esc(N().ways[j])+'</span>'+fk(o[0])+'</button></li>'; });
  h+='</ol>';
  if(pick!=null){ const o=T.o[pick];
    h+='<div class="nk-follow '+WAYC[pick]+'"><p class="nk-wn">'+(pick+1)+' · '+esc(N().ways[pick])+'</p><p>'+fk(o[3])+'</p>'
      +((pick===3||(get('nook:sq2',{})[K(st)]||{})[pick])?lean(o):'')
      +'<p class="nk-ax"><span>carried by assumption '+o[2]+' (G6)</span> «'+esc(N().axioms[o[2]-1])+'»</p>'
      +'<p class="sk-n">'+(w.length>=4?'You have walked all four ways of this case.':'Each of the four ways is valid. Try another and compare what it costs and what it keeps.')+'</p></div>'+deeper(st,pick); }
  pane.innerHTML=h; closeOnHere(pane);
  pane.querySelector('.nk-bk').onclick=()=>standing(pane,lead);
  wireDeeper(pane,lead,st,pick);
  pane.querySelectorAll('.nk-way').forEach(b=>b.onclick=()=>{ const j=+b.dataset.j, W=get('nook:sq',{}), w=W[K(st)]||[]; if(!w.includes(j)) w.push(j); W[K(st)]=w; put('nook:sq',W);
    walk(pane,lead,st,j); const f=pane.querySelector('.nk-follow'); if(f) f.scrollIntoView({block:'nearest',behavior:'smooth'}); }); }

/* the second level: which skills serve the way picked. Skills sorted by the job they do (G4): change the situation, change the response, accept. */
const JOB={};
[['G3 G9 G10 G11 G12 G13 G14 G15 IE1 IE4 IE9 ER24 DT1 DT3 DT22 IE5 IE6 IE7 IE11 IE12 IE13 IE14 IE15 IE16 IE18 IE25 IE26 IE27 ER12 ER13 ER14 ER16 ER18 ER19 ER21 DT5 DT20 DT21 DT23',0],
 ['G1 G7 G8 IE21 ER3 M4 M5 M7 IE17 IE20 IE21 IE22 IE24 ER2 ER7 ER9 ER10 ER11 ER20 DT6 DT7 DT8 DT9 DT10 DT11 DT18 DT25',1],
 ['∎ M1 M2 M6 ER22 DT2 DT12 DT13 DT14 DT15 DT16 DT17 DT19',2]].forEach(([l,k])=>l.split(' ').forEach(id=>JOB[id]=k));
const GENERAL=new Set(['G4']);
/* the skills an answer uses: its own skills other than the case's home footing (and the general G4, G6); the home footing when it has no other */
const useSk=(st,o)=>{ const home=st.id.replace(/\.s$/,''), pick=st.tree.o.indexOf(o), r=o[1].filter(id=>(id!==home||JOB[home]===pick)&&!(GENERAL.has(id)&&pick===3)&&stOf(id)); return r.length?r:[home].filter(stOf); };
const lean=o=>'<p class="nk-lean"><span>leans on</span> '+o[1].map(id=>{ const t=stOf(id); return '<a class="nk-chip" href="'+href(id)+'">'+esc(id)+(t?' · '+fk(t.title):'')+'</a>'; }).join(' ')+'</p>';
function deeper(st,pick){ if(pick==null) return ''; const o=st.tree.o[pick], D=get('nook:sq2',{}), done=(D[K(st)]||{})[pick];
  if(pick===3){ const alt=[0,1,2].map(j=>[j,useSk(st,st.tree.o[j])[0]]).filter(x=>x[1]);
    return '<div class="nk-deep"><p class="nk-ask">Using no skill is a choice too (G4). Which skill would you reach for to turn it?</p><ul class="nk-chips">'
      +alt.map(([j,id])=>{ const t=stOf(id); return '<li><button type="button" class="nk-turn '+WAYC[j]+'" data-j="'+j+'"><span class="nk-wn">'+(j+1)+' · '+esc(N().ways[j])+'</span>'+esc(id)+(t?' · '+fk(t.title):'')+'<span class="nk-act">'+fk(st.tree.o[j][0])+'</span></button></li>'; }).join('')+'</ul></div>'; }
  const right=useSk(st,o);
  const rj=new Set(right.map(id=>JOB[id]).filter(x=>x!=null)), pool=Object.keys(JOB).filter(id=>JOB[id]!==pick&&!rj.has(JOB[id])&&!right.includes(id)&&!st.tree.o.some(x=>x[1].includes(id))&&stOf(id));
  const sid=(st.id.match(/^[A-Z]+/)||['DT'])[0], near=pool.filter(id=>id.replace(/\d+$/,'')===sid), far=pool.filter(id=>!near.includes(id));
  const wrong=pickN(near,3).concat(pickN(far,3)).slice(0,Math.max(2,5-right.length));
  const opts=pickN(right.concat(wrong),right.length+wrong.length);
  return '<div class="nk-deep '+WAYC[pick]+'" data-n="'+right.length+'"><p class="nk-ask">Which skills can be used to '+esc(N().ways[pick])+' here? Pick every one that fits.</p><ul class="nk-chips">'
    +opts.map(id=>{ const t=stOf(id), ok=right.includes(id); return '<li><button type="button" class="nk-sk" data-ok="'+(ok?1:0)+'" data-id="'+esc(id)+'">'+esc(id)+(t?' · '+fk(t.title):'')+'</button></li>'; }).join('')
    +'</ul><p class="nk-dres sk-n">'+(done?'You have found every skill for this way before.':'')+'</p></div>'; }
function wireDeeper(pane,lead,st,pick){ const box=pane.querySelector('.nk-deep'); if(!box) return;
  box.querySelectorAll('.nk-turn').forEach(b=>b.onclick=()=>{ const j=+b.dataset.j, W=get('nook:sq',{}), w=W[K(st)]||[]; if(!w.includes(j)) w.push(j); W[K(st)]=w; put('nook:sq',W); walk(pane,lead,st,j); const f=pane.querySelector('.nk-follow'); if(f) f.scrollIntoView({block:'nearest',behavior:'smooth'}); });
  const res=box.querySelector('.nk-dres'), n=+box.dataset.n||0;
  if(pick<3&&(get('nook:sq2',{})[K(st)]||{})[pick]) third(box,st,pick);
  box.querySelectorAll('.nk-sk').forEach(b=>b.onclick=()=>{ if(b.disabled) return; b.disabled=true; const ok=b.dataset.ok==='1', id=b.dataset.id;
    b.classList.add(ok?'ok':'no');
    if(ok){ third(box,st,pick); const got=box.querySelectorAll('.nk-sk.ok').length; res.textContent=got>=n?'That is every skill this answer leans on.':'Yes. '+(n-got)+' more to find.';
      if(got>=n){ const D=get('nook:sq2',{}); (D[K(st)]=D[K(st)]||{})[pick]=Date.now(); put('nook:sq2',D); box.querySelectorAll('.nk-sk:not(:disabled)').forEach(x=>x.disabled=true); res.insertAdjacentHTML('afterend',lean(st.tree.o[pick])); closeOnHere(box); third(box,st,pick); } }
    else { const k=JOB[id]; res.textContent=id+' does another job here'+(k!=null?': it is a skill to '+N().ways[k]+'.':'.'); } }); }

/* the third level: the skill was used, and something unexpected happened. Every way on is a valid use of a skill. */
function third(box,st,pick){ const E=st.tree.e&&st.tree.e[pick]; if(!E||box.parentNode.querySelector('.nk-third')) return;
  const T=get('nook:sq3',{}), seen=(T[K(st)]||{})[pick]||[];
  const d=document.createElement('div'); d.className='nk-third';
  d.innerHTML='<p class="kd">then</p><p class="nk-start">'+fk(E[0])+'</p><p class="nk-ask">What does '+esc((st.tree.t.match(/Joy|Evita|Sarah|Claire|Randy|Jean|Terry|Mike/)||['the student'])[0])+' do to keep going?</p><ol class="nk-ways">'
    +E[1].map((r,i)=>'<li><button type="button" class="nk-on3'+(seen.includes(i)?' tried':'')+'" data-i="'+i+'">'+fk(r[0])+'</button></li>').join('')+'</ol><div class="nk-f3"></div>';
  box.after(d);
  d.querySelectorAll('.nk-on3').forEach(b=>b.onclick=()=>{ const i=+b.dataset.i, r=E[1][i], T=get('nook:sq3',{}), m=(T[K(st)]=T[K(st)]||{}), s=(m[pick]=m[pick]||[]); if(!s.includes(i)) s.push(i); put('nook:sq3',T);
    d.querySelectorAll('.nk-on3').forEach(x=>x.classList.toggle('on',x===b)); b.classList.add('tried');
    const f=d.querySelector('.nk-f3'); f.innerHTML='<p>'+fk(r[2])+'</p>'+lean([r[0],r[1]])+'<p class="sk-n">'+(s.length>=3?'You have tried all three. Each one keeps the skills going when the first try did not land.':'Each of the three keeps going with a skill. Try another.')+'</p>';
    closeOnHere(f); f.scrollIntoView({block:'nearest',behavior:'smooth'}); }); }

/* the measuring stick: multiple choice dealt from understanding, standing and practice */
const pickN=(a,n)=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a.slice(0,n); };
function deal(){ const O=opens(); if(!O.length) return null; const kinds=[];
  O.forEach(([s,st])=>{ if(st.u) kinds.push(['u',s,st]); casesOf(st).forEach(c=>{ kinds.push(['w',s,c]); kinds.push(['a',s,c]); }); st.practice.forEach((p,j)=>kinds.push(['p',s,st,j])); });
  const [k,s,st,j]=pickN(kinds,1)[0];
  const others=(n)=>{ const pool=s.steps.filter(t=>t.id!==st.id), all=N().series.flatMap(x=>x.steps).filter(t=>t.id!==st.id);
    return pickN(pool.length>=n?pool:all,n); };
  if(k==='u'||k==='p'){ const opts=pickN([st,...others(3)],4);
    return {kind:k==='u'?'from Understanding':'from Practice', q:k==='u'?st.u:st.practice[j], ask:'Which footing does this belong to?', opts:opts.map(t=>t.id+' · '+t.title), right:opts.indexOf(st), at:st}; }
  const oi=Math.floor(Math.random()*4), o=st.tree.o[oi];
  if(k==='w') return {kind:'from Standing', q:st.tree.t+'\n→ '+o[0], ask:'Which of the four ways does this answer take?', opts:N().ways.map((w,i)=>(i+1)+' · '+w), right:oi, at:st};
  const wrong=pickN([1,2,3,4,5,6,7].filter(n=>n!==o[2]),3), opts=pickN([o[2],...wrong],4);
  return {kind:'from Standing', q:st.tree.t+'\n→ '+o[0], ask:'Which assumption (G6) carries this answer?', opts:opts.map(n=>n+' · '+N().axioms[n-1]), right:opts.indexOf(o[2]), at:st}; }
function stick(pane,lead){ const c=deal(), S=get('nook:ms',{r:0,n:0});
  if(!c){ pane.innerHTML='<p class="sk-n">'+esc(lead)+'</p><p class="sk-n">Open a footing first.</p>'; return; }
  pane.innerHTML='<p class="sk-n">'+esc(lead)+' <span class="nk-score">'+S.r+' of '+S.n+' right</span></p><div class="nk-mc"><p class="kd">'+esc(c.kind)+'</p><p class="nk-q">'+fk(c.q)+'</p><p class="nk-ask">'+esc(c.ask)+'</p><ol class="nk-opts">'
    +c.opts.map((t,i)=>'<li><button type="button" class="nk-opt" data-i="'+i+'">'+fk(t)+'</button></li>').join('')+'</ol><div class="nk-res"></div></div>';
  pane.querySelectorAll('.nk-opt').forEach(b=>b.onclick=()=>{ if(pane.querySelector('.nk-opt.ok')) return; const i=+b.dataset.i, ok=i===c.right, S=get('nook:ms',{r:0,n:0}); S.n++; if(ok) S.r++; put('nook:ms',S);
    pane.querySelectorAll('.nk-opt').forEach((x,k)=>{ x.disabled=true; if(k===c.right) x.classList.add('ok'); else if(k===i) x.classList.add('no'); });
    pane.querySelector('.nk-score').textContent=S.r+' of '+S.n+' right';
    const r=pane.querySelector('.nk-res'); r.innerHTML='<p>'+(ok?'Right.':'Not this time.')+' <a class="nk-id" href="'+href(c.at.id)+'">'+esc(c.at.id)+' · '+fk(c.at.title)+' →</a></p><button type="button" class="nk-next">next</button>';
    closeOnHere(r); r.querySelector('.nk-next').onclick=()=>stick(pane,lead); }); }

/* the toolbox, refitted once the site has built it */
function refit(){ const d=document.getElementById('desk'); if(!d||d.dataset.nook) return !!d; d.dataset.nook='1';
  d.querySelectorAll('.dtabs [data-p="rand"], .dtabs .dstick, .dtabs .dannex, .dtabs .dcross').forEach(b=>b.classList.add('nk-off'));
  const ix=d.querySelector('.dheights'); if(ix) ix.textContent='Index';
  const mv=document.getElementById('dp-moves'); if(mv&&!document.getElementById('nkmoves')){ const p=document.createElement('p'); p.className='dnote nk-note'; p.textContent='The marks this page first uses, footing by footing: what each means here, in one sentence, and where the ladder teaches it if it does.'; const h=document.createElement('div'); h.id='nkmoves'; mv.append(p,h); }
  const dk=document.getElementById('dp-deck'); if(dk&&!document.getElementById('nkdeck')){ const t=document.createElement('div'); t.className='dk-tools nk-dkt'; t.innerHTML='<input type="search" id="nkdkq" placeholder="find a mark by sign or word" aria-label="find a mark"><span class="dk-count" id="nkdkcount"></span>';
    const p=document.createElement('p'); p.className='dnote nk-note'; p.textContent='Every mark of the five series, from the footings you have opened.'; const h=document.createElement('div'); h.id='nkdeck'; dk.append(p,t,h); t.querySelector('input').addEventListener('input',e=>deck(e.target.value)); }
  const rec=document.getElementById('dp-rec'); if(rec&&!rec.querySelector('.nk-set')){ const p=document.createElement('p'); p.className='nk-set'; p.innerHTML='<span class="dnote">You are in Under pressure. Its progress and awards are kept apart from the ladder’s.</span> <a class="dlink" href="index.html">back to the ladder →</a>'; rec.prepend(p); }
  return true; }
/* the toolbox's own buttons lead into the nook's screens */
document.addEventListener('click',e=>{ const t=e.target.closest&&e.target.closest('#desk .dheights, #desk .dstand'); if(!t) return;
  e.preventDefault(); e.stopPropagation(); if(t.classList.contains('dheights')) index(); else questions(); },true);
document.addEventListener('click',e=>{ const t=e.target.closest&&e.target.closest('#desk .dtabs [data-p="moves"], #desk .dtrio [data-go]'); if(t) setTimeout(()=>{ moves(); deck(document.getElementById('nkdkq')&&document.getElementById('nkdkq').value); },0); });

function start(){ check(false); let n=0; const iv=setInterval(()=>{ if(refit()||++n>80) clearInterval(iv); bar(); },150); if(location.hash) setTimeout(mark,800); }
if(N()) start(); else { const s=document.createElement('script'); s.src='nook-data.js'; s.onload=start; document.head.appendChild(s); }

const css=document.createElement('style'); css.textContent=`
html.nook #desk .dtabs .lk-hide:not(.nk-off):not(.dannex):not(.dstick):not(.dcross):not([data-p="rand"]){display:revert!important}
html.nook #desk .nk-off,html.nook #desk .dannex,html.nook #desk .dstick,html.nook #desk .dcross,html.nook #desk [data-p="rand"],html.nook #desk .dname,html.nook #desk .dacct,html.nook #dp-rec .dcomp:not(.dai),html.nook #dp-rec .recname,html.nook #dp-rec .recrolls,html.nook #dp-rec .dpress,html.nook #dp-rec p:has(>.recpress){display:none!important}
html.nook #dmnote,html.nook #dmoves,html.nook #dklist,html.nook #dkcount,html.nook #dkahead,html.nook #dp-deck>.dnote:not(.nk-note),html.nook #dp-deck>.dk-tools:not(.nk-dkt){display:none!important}
html.nook #lbar .lc-blue,html.nook #lbar .lc-gold,html.nook #lbar .lc-wing{display:none}
.lc-nook{display:inline-flex;gap:5px;align-items:center;background:none;border:0;padding:2px 4px;cursor:pointer;font:inherit;color:var(--muted)}
.lc-nook .nk-aw{font-size:.82rem;opacity:.45}.lc-nook .nk-aw.on{opacity:1;color:var(--teal);text-shadow:0 0 6px color-mix(in srgb,var(--teal) 45%,transparent)}
.nk-set{margin:0 0 14px;display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.nkbox .sk-x::before{content:"close"!important}
.nkbox .nk-resume a,.nkbox .nk-out a{font-family:var(--mono);font-size:.85rem;color:var(--ember);text-decoration:none}
.nkbox .nk-out{margin-top:1.6em;padding-top:.8em;border-top:1px solid var(--grid)}
.nkbox details.nk-ser summary b{color:var(--teal);margin-right:4px}
.nkbox .nk-awi{display:inline-block;background:var(--teal);color:#fff;border-radius:8px;padding:0 6px;margin-right:4px;font-size:.7rem}
.nkbox .sk-list li.nk-shut{color:var(--muted);opacity:.6}
.nkbox .sk-list a{color:var(--ink);text-decoration:none}
.nkbox .nk-id{font-family:var(--mono);font-size:.8rem;color:var(--teal);margin-right:4px;text-decoration:none}
#stick.nkbox .sk-tools.aq-bar.nk-cats{grid-template-columns:1fr 1fr}
.nkbox .nk-pl{margin-left:6px;padding-left:10px;border-left:2px solid var(--grid)}
.nkbox .nk-pl li{display:flex;gap:8px;align-items:flex-start}
.nkbox .nk-pr{font-family:var(--mono);font-size:.82rem;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.nkbox .nk-tick{flex:none;width:24px;height:24px;border-radius:6px;border:1.5px solid var(--teal);background:transparent;color:#fff;font-size:.8rem;line-height:1;padding:0;cursor:pointer}
.nkbox .nk-tick.on{background:var(--teal)}
#nkmoves .dmv,#nkdeck .dmv{min-width:0;box-sizing:border-box;overflow-wrap:anywhere;border:1px solid var(--grid);border-radius:6px;padding:8px 10px;background:var(--card);margin:0 0 8px}
#nkmoves .kd,#nkdeck .kd{font-family:var(--mono);font-size:.72rem;color:var(--muted)}
#nkmoves .mw,#nkdeck .mw{font-size:.95rem;margin-top:2px}
#nkmoves .mwhere,#nkdeck .mwhere{display:block;margin-top:4px;font-size:.82rem}
#desk .nk-mk .nk-m{font-size:1.3rem;margin-right:4px}
.nkbox .nk-uq{display:flex;gap:8px;align-items:flex-start}
.nkbox .nk-q{margin:4px 0 0;font-size:.92rem;line-height:1.5;white-space:pre-wrap}
.nkbox .nk-case{display:block;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--grid);padding:7px 0;font:inherit;color:var(--ink);cursor:pointer}
.nkbox .nk-dots{float:right;display:inline-flex;gap:3px;margin-top:6px}.nkbox .nk-dots i{width:7px;height:7px;border-radius:50%;border:1px solid var(--muted);opacity:.5}.nkbox .nk-dots i.on{opacity:1;border-color:transparent}
.nkbox .nk-w1{--w:var(--teal)}.nkbox .nk-w2{--w:#6b8fd6}.nkbox .nk-w3{--w:#b07ac8}.nkbox .nk-w4{--w:var(--ember)}
.nkbox .nk-dots i.on{background:var(--w)}
.nkbox .nk-back{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}
.nkbox .nk-bk,.nkbox .nk-next{font:inherit;font-size:.82rem;background:none;border:1px solid var(--grid);border-radius:8px;padding:4px 10px;color:var(--ink);cursor:pointer}
.nkbox .nk-start{font-size:1rem;line-height:1.5;margin:8px 0 10px}
.nkbox .nk-ways,.nkbox .nk-opts{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.nkbox .nk-way,.nkbox .nk-opt{display:block;width:100%;text-align:left;font:inherit;font-size:.9rem;line-height:1.45;color:var(--ink);background:var(--card);border:1px solid var(--grid);border-left:4px solid var(--w,var(--grid));border-radius:8px;padding:8px 10px;cursor:pointer}
.nkbox .nk-way.tried{background:color-mix(in srgb,var(--w) 8%,var(--card))}.nkbox .nk-way.on{border-color:var(--w);box-shadow:0 0 0 1px var(--w)}
.nkbox .nk-wn{display:block;font-family:var(--mono);font-size:.72rem;color:var(--w,var(--muted));margin-bottom:2px}
.nkbox .nk-follow{margin-top:12px;border:1px solid var(--w);border-radius:10px;padding:10px 12px;background:color-mix(in srgb,var(--w) 6%,var(--card))}
.nkbox .nk-follow p{margin:0 0 8px;line-height:1.5}
.nkbox .nk-lean span,.nkbox .nk-ax span{display:block;font-family:var(--mono);font-size:.72rem;color:var(--muted)}
.nkbox .nk-chip{display:inline-block;margin:2px 4px 2px 0;font-size:.8rem;border:1px solid var(--grid);border-radius:12px;padding:2px 8px;color:var(--teal)!important}
.nkbox .nk-mc .kd{font-family:var(--mono);font-size:.72rem;color:var(--muted);margin:0}
.nkbox .nk-ask{font-weight:600;margin:8px 0}
.nkbox .nk-opt:disabled{cursor:default;color:var(--ink);opacity:1!important}.nkbox .nk-opt.ok{font-weight:600}.nkbox .nk-opt.ok{border-left-color:var(--teal);background:color-mix(in srgb,var(--teal) 12%,var(--card))}.nkbox .nk-opt.no{border-left-color:var(--ember);opacity:.75}
.nkbox .nk-score{float:right;font-family:var(--mono);font-size:.75rem}
.nkbox .nk-res{margin-top:10px}
.nkbox .nk-deep{margin-top:12px;padding:10px 12px;border:1px dashed var(--w,var(--grid));border-radius:10px}
.nkbox .nk-deep .nk-ask{margin:0 0 8px;font-size:.92rem}
.nkbox .nk-chips{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.nkbox .nk-sk{--w:var(--grid)}.nkbox .nk-act{display:block;font-size:.8rem;color:var(--muted);margin-top:2px}
.nkbox .nk-sk,.nkbox .nk-turn{display:block;width:100%;text-align:left;font:inherit;font-size:.85rem;color:var(--ink);background:var(--card);border:1px solid var(--grid);border-left:4px solid var(--w,var(--grid));border-radius:8px;padding:6px 10px;cursor:pointer}
.nkbox .nk-sk:disabled{cursor:default;color:var(--ink);opacity:1!important}
.nkbox .nk-sk.ok{border-left-color:var(--teal);background:color-mix(in srgb,var(--teal) 12%,var(--card));font-weight:600}
.nkbox .nk-sk.no{border-left-color:var(--ember);opacity:.7!important}
.nkbox .nk-dres{margin:8px 0 0;min-height:1em}
.nkbox .nk-third{margin-top:12px;padding:10px 12px;border-radius:10px;background:color-mix(in srgb,var(--ember) 6%,var(--card));border:1px solid color-mix(in srgb,var(--ember) 35%,var(--grid))}
.nkbox .nk-third .kd{font-family:var(--mono);font-size:.72rem;color:var(--ember);margin:0}
.nkbox .nk-on3{display:block;width:100%;text-align:left;font:inherit;font-size:.88rem;line-height:1.45;color:var(--ink);background:var(--card);border:1px solid var(--grid);border-left:4px solid var(--ember);border-radius:8px;padding:7px 10px;cursor:pointer}
.nkbox .nk-on3.tried{background:color-mix(in srgb,var(--ember) 8%,var(--card))}.nkbox .nk-on3.on{box-shadow:0 0 0 1px var(--ember)}
.nkbox .nk-f3{margin-top:10px}.nkbox .nk-f3 p{margin:0 0 8px;line-height:1.5}
#nk-toast{position:fixed;left:50%;bottom:calc(var(--lbh,52px) + 16px);transform:translate(-50%,20px);opacity:0;z-index:9500;background:var(--teal);color:#fff;font-family:var(--mono);font-size:.82rem;padding:10px 16px;border-radius:12px;max-width:calc(100vw - 32px);transition:opacity .25s,transform .25s;pointer-events:none}
#nk-toast.on{opacity:1;transform:translate(-50%,0)}
`; document.head.appendChild(css);
})();
