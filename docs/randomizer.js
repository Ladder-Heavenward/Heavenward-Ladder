/* The randomizer (the learner calls it the laundry). Build 2 (0.0.490).
   A seed pool makes a claim; a link pool acts on it with a technique; the question asks about one level.
   Rules (Andrew 2026-10-31): an axiom is never the answer to "which licenses this line"; it may only be a decoy.
   Every question is checked: exactly one offered technique licenses the marked line. The same right answer
   never comes three times running. Pools are listed under their step, by the name the step proves.
   Strays: questions from open pools the learner switched off arrive as a stream, about 0.25 a day (never announced).
   Pools open with the steps the learner has opened (cards:seen). Each question is recorded by its index and never repeats. */
(function(){
'use strict';
const LS=window.LS||window.localStorage;
const get=(k,d)=>{ try{ return JSON.parse(LS.getItem(k)||'')||d; }catch(e){ return d; } };
const put=(k,v)=>{ try{ LS.setItem(k,JSON.stringify(v)); }catch(e){} };
const seen=()=>get('cards:seen',{});
const has=tag=>!!seen()[tag];
const rnd=n=>Math.floor(Math.random()*n);
const pick=a=>a[rnd(a.length)];
const shuffle=a=>{ for(let i=a.length-1;i>0;i--){ const j=rnd(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');

const STEPS={'0a':['r00a','Names and statements'],'0b':['r00b','The same as itself'],'1b':['r01b','Not, and the totally false'],
  '1c':['r01c','And, and the ors'],'4e':['r04e','Adding'],'4f':['r04f','Multiplying and powers']};
const stepLink=s=>'<a href="'+STEPS[s][0]+'.html">'+s+' '+esc(STEPS[s][1])+'</a>';

/* Seed pools: each makes one sameness claim {l, r}, a claim that differs {n}, and the index of the values it drew. */
const NAME_SEEDS=`Tahoma = Mount Rainier = the tallest peak in Washington
Big Sky Country = Montana = the Treasure State
the Evergreen State = Washington = the state whose capital is Olympia
the Golden State = California = the state whose capital is Sacramento
the Beaver State = Oregon = the state whose capital is Salem
the Emerald City = Seattle = the largest city in Washington
the Rose City = Portland = the largest city in Oregon
the City by the Bay = San Francisco = the city at the Golden Gate
the Salad Bowl of the World = the Salinas Valley = the valley of the Salinas River`;
const parseNames=t=>String(t).split(/\n+/).map(l=>l.split('=').map(x=>x.trim()).filter(Boolean)).filter(a=>a.length>=3);
const NAMES=parseNames(NAME_SEEDS);
const top=()=>has('4g')?9:4;
const SEEDS=[
  {id:'0a.names', step:'0a', label:'names for one place', open:()=>true,
   make(){ const i=rnd(NAMES.length); let j=rnd(NAMES.length-1); if(j>=i) j++;
     const [l,r,m]=NAMES[i]; return {l,r,m,n:NAMES[j][1],ix:'['+i+','+j+']',kind:'names'}; }},
  {id:'4e.add', step:'4e', label:'sums', open:()=>has('4e'),
   make(){ const T=top(), a=rnd(T+1), b=rnd(T+1-a), c=a+b;
     const m=(a!==b&&Math.random()<0.5)?b+' + '+a:(c>0?(c-1)+' + 1':'0 + 0');
     return {l:a+' + '+b, r:String(c), m, n:String(c+1), a, b, c, ix:'['+a+','+b+']', kind:'add'}; }},
  {id:'4f.times', step:'4f', label:'products', open:()=>has('4f'),
   make(){ const T=top(), a=1+rnd(T), b=1+rnd(Math.max(1,Math.floor(T/a))), c=a*b;
     return {l:a+' · '+b, r:String(c), m:b+' · '+a, n:String(c+1), a, b, c, ix:'['+a+','+b+']', kind:'times'}; }}
];

/* Link pools: each technique gives a column of lines and the line it licenses, and can say whether it licenses a line. */
const neg=s=>s.replace(' = ',' ≠ ');
const AX=['the self-sameness axiom','the swap axiom'];
const LINKS=[
  {id:'0b.turn', step:'0b', name:'the turn-about technique', open:()=>has('0b'),
   lic:(g,t)=>{ const p=t.split(' = '); return p.length===2&&p[0]!==p[1]&&g.includes(p[1]+' = '+p[0]); },
   act:c=>({lines:[[c.l+' = '+c.r,'given'],[c.r+' = '+c.l,null]], why:'Line 2 is line 1 read from the other side, which is what turn-about licenses.'})},
  {id:'0b.chain', step:'0b', name:'the chain technique', open:()=>has('0b'),
   lic:(g,t)=>{ const p=t.split(' = '); if(p.length!==2) return false; return g.some(x=>{ const q=x.split(' = '); return q.length===2&&q[0]===p[0]&&q[1]!==p[1]&&g.includes(q[1]+' = '+p[1]); }); },
   act:c=>({lines:[[c.l+' = '+c.r,'given'],[c.r+' = '+c.m,'given'],[c.l+' = '+c.m,null]], why:'Line 3 joins line 1 and line 2 through the shared middle, which is what chain licenses.'})},
  {id:'1b.mixed', step:'1b', name:'the mixed-sameness technique', open:()=>has('1b'),
   lic:(g,t)=>{ const p=t.split(' ≠ '); if(p.length!==2) return false; return g.some(x=>{ const q=x.split(' = '); return q.length===2&&q[1]===p[0]&&g.includes(q[0]+' ≠ '+p[1]); }); },
   act:c=>({lines:[[c.l+' = '+c.r,'given'],[c.l+' ≠ '+c.n,'given'],[c.r+' ≠ '+c.n,null]], why:'Line 1 says the two names are one thing, line 2 says the first is not '+c.n+', so the second is not either: mixed sameness.'})},
  {id:'1b.notnot', step:'1b', name:'the not-not-in technique', open:()=>has('1b'),
   lic:(g,t)=>t.startsWith('¬¬(')&&g.includes(t.slice(3,-1)),
   act:c=>({lines:[[c.l+' = '+c.r,'given'],['¬¬('+c.l+' = '+c.r+')',null]], why:'From any statement in hand you may write its double denial: not-not-in.'})},
  {id:'1c.remaining', step:'1c', name:'the remaining-option technique', open:()=>has('1c'),
   lic:(g,t)=>g.some(x=>{ const m=x.match(/^\((.*)\) ∨ \((.*)\)$/); return m&&((m[1]===t&&g.includes(neg(m[2])))||(m[2]===t&&g.includes(neg(m[1])))); }),
   act:c=>({lines:[['('+c.l+' = '+c.n+') ∨ ('+c.l+' = '+c.r+')','given'],[c.l+' ≠ '+c.n,'given'],[c.l+' = '+c.r,null]], why:'Line 1 offers two options, line 2 denies the first, so the second remains.'})},
  {id:'4e.pluszero', step:'4e', name:'the plus-zero technique', kinds:['add','times'], open:()=>has('4e'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) \+ 0 = (\d+)$/); return !!m&&m[1]===m[2]; },
   act:c=>({lines:[[c.a+' + 0 = '+c.a,null]], why:'Adding 0 changes nothing, and it needs no line above it.'})},
  {id:'4e.zeroplus', step:'4e', name:'the zero-plus technique', kinds:['add','times'], open:()=>has('4e'),
   lic:(g,t)=>{ const m=t.match(/^0 \+ (\d+) = (\d+)$/); return !!m&&m[1]===m[2]; },
   act:c=>({lines:[['0 + '+c.b+' = '+c.b,null]], why:'0 added on the left gives the number back. That is its own technique, proved after plus-zero.'})},
  {id:'4e.plusone', step:'4e', name:'the plus-one technique', kinds:['add','times'], open:()=>has('4e'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) \+ 1 = S\((\d+)\)$/); return !!m&&m[1]===m[2]; },
   act:c=>({lines:[[c.a+' + 1 = S('+c.a+')',null]], why:'Adding one is taking the next one.'})},
  {id:'4e.plusnext', step:'4e', name:'the plus-a-next technique', kinds:['add','times'], open:()=>has('4e'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) \+ S\((\d+)\) = S\((\d+) \+ (\d+)\)$/); return !!m&&m[1]===m[3]&&m[2]===m[4]; },
   act:c=>({lines:[[c.a+' + S('+c.b+') = S('+c.a+' + '+c.b+')',null]], why:'Adding the next one after '+c.b+' gives the next one after the sum with '+c.b+'.'})},
  {id:'4f.timeszero', step:'4f', name:'the times-zero technique', kinds:['add','times'], open:()=>has('4f'),
   lic:(g,t)=>/^\d+ · 0 = 0$/.test(t),
   act:c=>({lines:[[c.a+' · 0 = 0',null]], why:'Any number times 0 is 0.'})},
  {id:'4f.timesnext', step:'4f', name:'the times-a-next technique', kinds:['add','times'], open:()=>has('4f'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) · S\((\d+)\) = \((\d+) · (\d+)\) \+ (\d+)$/); return !!m&&m[1]===m[3]&&m[2]===m[4]&&m[1]===m[5]; },
   act:c=>({lines:[[c.a+' · S('+c.b+') = ('+c.a+' · '+c.b+') + '+c.a,null]], why:c.a+' times the next one after '+c.b+' is '+c.a+' times '+c.b+', plus '+c.a+'.'})},
  {id:'4f.powerzero', step:'4f', name:'the power-zero technique', kinds:['add','times'], open:()=>has('4f'),
   lic:(g,t)=>/^\d+⁰ = 1$/.test(t),
   act:c=>({lines:[[(c.a||1)+'⁰ = 1',null]], why:'Any number to the power 0 is 1.'})}
];
LINKS.forEach(L=>{ if(!L.kinds) L.kinds=['names','add','times']; });

/* The check: which techniques license the marked line, from the lines above it. */
function licensers(lines){ const g=lines.filter(x=>x[1]).map(x=>x[0]), t=lines.find(x=>!x[1])[0]; return LINKS.filter(L=>L.lic(g,t)).map(L=>L.name); }

/* Strays: a stream of about 0.25 a day from open pools the learner switched off. */
function poisson(l){ let k=0,p=Math.exp(-l),s=p; const u=Math.random(); while(u>s&&k<9){ k++; p*=l/k; s+=p; } return k; }
function strayDue(){ const day=new Date().toISOString().slice(0,10); let s=get('rand:strays',null);
  if(!s||s.day!==day){ s={day,due:poisson(0.25),served:0}; put('rand:strays',s); } return s; }

function build(){
  const off=get('rand:off',{});
  if(!LINKS.some(l=>l.open())) return {closed:'The laundry opens with 0b, the step that earns the first techniques for sameness.'};
  const openS=SEEDS.filter(s=>s.open()), openL=LINKS.filter(l=>l.open());
  let seeds=openS.filter(s=>!off[s.id]), links=openL.filter(l=>!off[l.id]);
  if(!seeds.length||!links.length) return {closed:'Pick at least one claim pool and one technique pool below.'};
  const st=strayDue(), offL=openL.filter(l=>off[l.id]), offS=openS.filter(s=>off[s.id]);
  let stray=false;
  if(st.due>st.served&&(offL.length||offS.length)){ stray=true; if(offL.length) links=offL; if(offS.length&&!offL.length) seeds=offS; }
  const used=get('rand:seen',{}), last=get('rand:last',[]);
  const rights=new Set(links.map(l=>l.name));
  for(let tries=0;tries<120;tries++){
    const s=pick(seeds), c=s.make();
    const fit=links.filter(L=>L.kinds.includes(c.kind)); if(!fit.length) continue;
    const L=pick(fit);
    const level=(c.kind!=='names'&&Math.random()<0.3)?'seed':'link';
    if(level==='link'){
      if(rights.size>1&&tries<100&&last.length>=2&&last[0]===L.name&&last[1]===L.name) continue;
      const out=L.act(c), index='link:'+L.id+'(nest '+s.id+c.ix+')';
      if(used[index]) continue;
      const lic=licensers(out.lines); if(lic.length!==1||lic[0]!==L.name) continue;
      const others=shuffle(openL.filter(x=>x.name!==L.name).map(x=>x.name)).slice(0,2);
      const wrong=others.concat(shuffle(AX.slice())).slice(0,3);
      return {index, stray, step:L.step, lines:out.lines, ask:'Which technique licenses the line marked ?', right:L.name, opts:shuffle([L.name,...wrong]), why:out.why};
    }
    if(c.kind==='names') continue;
    const si='seed:'+s.id+c.ix; if(used[si]) continue;
    const r=String(c.c), op=c.kind==='add'?' + ':' · ', lim=has('4g')?99:Math.max(4,c.c+2);
    const pool=[c.c+1,c.c-1,c.a*c.b,c.a+c.b,Number(String(c.a)+String(c.b)),c.c+2,c.c-2,c.a,c.b,0,1,2,3,4].filter(x=>x>=0&&x<=lim&&String(x)!==r);
    const wrong=shuffle([...new Set(pool.map(String))]).slice(0,3);
    return {index:si, stray, step:s.step, lead:'The box holds '+r+'. ', lines:[[c.l+' = ▢',null]], ask:'What number fills the box ▢?', right:r, opts:shuffle([r,...wrong]),
      why:c.kind==='add'?c.a+' + '+c.b+' unfolds, by plus-a-next and plus-zero, to '+r+'.':c.a+' · '+c.b+' unfolds, by times-a-next and times-zero, to '+r+'.'};
  }
  return {closed:'Every question these pools hold has been asked. Each step you open adds its pools.'};
}

function picker(q){
  const off=get('rand:off',{}), by={};
  SEEDS.filter(x=>x.open()).forEach(P=>(by[P.step]=by[P.step]||[]).push([P,'claims: '+P.label]));
  LINKS.filter(x=>x.open()).forEach(P=>(by[P.step]=by[P.step]||[]).push([P,P.name.replace(/^the /,'')]));
  const rows=Object.keys(STEPS).filter(s=>by[s]).map(s=>'<p class="rzph">'+s+' · '+esc(STEPS[s][1])+'</p>'
    +by[s].map(([P,t])=>'<label class="rzp"><input type="checkbox" data-id="'+P.id+'"'+(off[P.id]?'':' checked')+'> '+esc(t)+'</label>').join('')).join('');
  return '<details class="rzpick"'+(q.closed?' open':'')+'><summary>pools</summary>'+rows+'</details>';
}

function render(box){
  const q=build(), right=get('rand:right',0);
  if(window.MathKeys){ const off=get('rand:off',{}), K=new Set(); [...SEEDS,...LINKS].filter(P=>P.open()&&!off[P.id]).forEach(P=>(P.keys||[]).forEach(k=>K.add(k))); MathKeys.limit(K,'the laundry’s chosen pools'); }
  if(q.closed&&!LINKS.some(l=>l.open())){ box.innerHTML='<p class="dnote">'+esc(q.closed)+'</p>'; return; }
  const wire=()=>box.querySelectorAll('.rzpick input').forEach(i=>i.onchange=()=>{ const o=get('rand:off',{}); if(i.checked) delete o[i.dataset.id]; else o[i.dataset.id]=1; put('rand:off',o); render(box); });
  if(q.closed){ box.innerHTML='<p class="dnote">'+esc(q.closed)+'</p>'+picker(q); wire(); return; }
  box.innerHTML='<p class="dnote">Practice drawn from the pools your steps have opened. A question never comes twice. Right answers so far: <b>'+right+'</b>.</p>'
    +'<div class="rzlines">'+q.lines.map(([t,w],i)=>'<div class="rzl"><span class="rzn">'+(i+1)+'</span><span class="rzt">'+esc(t)+'</span><span class="rzw">'+(w?esc(w):'?')+'</span></div>').join('')+'</div>'
    +'<p class="rzask">'+esc(q.ask)+'</p><div class="rzopts">'+q.opts.map(o=>'<button type="button" class="rzo">'+esc(o)+'</button>').join('')+'</div>'
    +'<p class="rzwhy" hidden></p><p><button type="button" class="dlink rznext">another question</button></p>'+picker(q);
  wire();
  const why=box.querySelector('.rzwhy'); let done=false;
  box.querySelectorAll('.rzo').forEach(b=>b.onclick=()=>{ if(done) return; done=true;
    const ok=b.textContent===q.right;
    box.querySelectorAll('.rzo').forEach(x=>{ x.disabled=true; if(x.textContent===q.right) x.classList.add('ok'); });
    if(!ok) b.classList.add('no');
    const u=get('rand:seen',{}); u[q.index]=Date.now(); put('rand:seen',u);
    if(q.index.startsWith('link:')) put('rand:last',[q.right].concat(get('rand:last',[])).slice(0,2));
    if(q.stray){ const s=strayDue(); s.served++; put('rand:strays',s); const lg=get('rand:straylog',[]); lg.push({day:s.day,index:q.index}); put('rand:straylog',lg); }
    if(ok) put('rand:right',get('rand:right',0)+1);
    const ax=!ok&&AX.includes(b.textContent)?' An axiom stands under every technique above it; the question asks for the technique built over it.':'';
    why.hidden=false; why.innerHTML=esc((ok?'Right. ':(q.lead||'The line holds by '+q.right+'. '))+q.why+ax)+' Built at '+stepLink(q.step)+'.'; });
  box.querySelector('.rznext').onclick=()=>render(box);
}

window.LadderRandomizer={render, build, parseNames, licensers, LINKS, SEEDS};
const pane=document.getElementById('dp-rand'); if(pane){ let box=pane.querySelector('.rzbox'); if(!box){ box=document.createElement('div'); box.className='rzbox'; pane.innerHTML=''; pane.appendChild(box); } render(box); }
})();
