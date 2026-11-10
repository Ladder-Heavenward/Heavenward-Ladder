/* The randomizer (the learner calls it the laundry). Build 4 (2026-11-10): four kinds of work on one switch, each question a seed,
   a number of links and a bank, addressed seed.link.bank; pools switched by rung. Build 3 (0.0.523): pools through rung 5.
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
const DESK=!!window.LADDER_DESK; /* 0.3.15: the desk opens every pool, so its words can be read and edited */
const has=tag=>DESK||!!seen()[tag];
/* 0.3.1 (Andrew 20:25): seed pools open by the measuring stick; link pools by regular progress (has).
   A step counts as measured when its own stick is passed, or its rung's, or its floor's. */
const cert=k=>{ try{ return JSON.parse(LS.getItem('cert:'+k)||'null'); }catch(e){ return null; } };
function tagStem(t){ const M=window.LADDER_CARDMAP||{}; for(const s in M) if(M[s][0]===t) return s; return (typeof STEPS!=='undefined'&&STEPS[t])?STEPS[t][0]:null; }
function measured(tag){ if(DESK) return true; const s=tagStem(tag); if(!s) return false; if(cert(s)) return true;
  const W=window.LadderStick&&LadderStick.where(s); if(!W) return false; if(cert('floor'+W.fl+'concl')) return true;
  const c=cert(W.core[W.core.length-1]); return !!(c&&c.scope==='rung'&&W.core.includes(s)); }
const rnd=n=>Math.floor(Math.random()*n);
const pick=a=>a[rnd(a.length)];
const shuffle=a=>{ for(let i=a.length-1;i>0;i--){ const j=rnd(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');

const STEPS={'0a':['r00a','Names and Statements'],'0b':['r00b','The Same as Itself'],'1b':['r01b','Not, and the Totally False'],
  '1c':['r01c','And, and the Ors'],'4f':['r04f','Adding'],'4g':['r04g','Multiplying and Powers']};
const stepLink=s=>{ const S=STEPS[s]; if(S) return '<a href="'+S[0]+'.html">'+s+' '+esc(S[1])+'</a>'; const st=tagStem(s); return st?'<a href="'+st+'.html">'+esc(s)+'</a>':esc(s); };

/* Seed pools: each makes one sameness claim {l, r}, a claim that differs {n}, and the index of the values it drew. */
const NAME_SEEDS=`Tahoma = Mount Rainier = the tallest peak in Washington
the Beaver State = Oregon = the Pacific Wonderland
the Evergreen State = Washington = the state whose capital is Olympia
the Golden State = California = the state whose capital is Sacramento
the Beaver State = Oregon = the state whose capital is Salem
the Emerald City = Seattle = the largest city in Washington
the Rose City = Portland = the largest city in Oregon
the City by the Bay = San Francisco = the city at the Golden Gate
the Salad Bowl of the World = the Salinas Valley = the valley of the Salinas River`;
const parseNames=t=>String(t).split(/\n+/).map(l=>l.split('=').map(x=>x.trim()).filter(Boolean)).filter(a=>a.length>=3);
const NAMES=parseNames(NAME_SEEDS);
const top=()=>has('5b')?30:has('4j')?20:has('4h')?9:4;
const SEEDS=[
  {id:'0a.names', step:'0a', label:'names for one place', open:()=>true,
   make(){ const i=rnd(NAMES.length); let j=rnd(NAMES.length-1); if(j>=i) j++;
     const [l,r,m]=NAMES[i]; return {l,r,m,n:NAMES[j][1],ix:'['+i+','+j+']',kind:'names'}; }},
  {id:'4f.add', step:'4f', label:'sums', open:()=>has('4f'),
   make(){ const T=top(), a=rnd(T+1), b=rnd(T+1-a), c=a+b;
     const m=(a!==b&&Math.random()<0.5)?b+' + '+a:(c>0?(c-1)+' + 1':'0 + 0');
     return {l:a+' + '+b, r:String(c), m, n:String(c+1), a, b, c, ix:'['+a+','+b+']', kind:'add'}; }},
  {id:'4g.times', step:'4g', label:'products', open:()=>has('4g'),
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
  {id:'1b.mixed', step:'1b', name:'1b9’s swap inside a denial', open:()=>has('1b'),
   lic:(g,t)=>{ const p=t.split(' ≠ '); if(p.length!==2) return false; return g.some(x=>{ const q=x.split(' = '); return q.length===2&&q[1]===p[0]&&g.includes(q[0]+' ≠ '+p[1]); }); },
   act:c=>({lines:[[c.l+' = '+c.r,'given'],[c.l+' ≠ '+c.n,'given'],[c.r+' ≠ '+c.n,null]], why:'Line 1 says the two names are one thing, line 2 says the first is not '+c.n+', so the second is not either: 0b’s swap inside the denial.'})},
  {id:'1b.notnot', step:'1b', name:'the not-not-in technique', open:()=>has('1b'),
   lic:(g,t)=>t.startsWith('¬¬(')&&g.includes(t.slice(3,-1)),
   act:c=>({lines:[[c.l+' = '+c.r,'given'],['¬¬('+c.l+' = '+c.r+')',null]], why:'From any statement in hand you may write its double denial: not-not-in.'})},
  {id:'1c.remaining', step:'1c', name:'the remaining-option technique', open:()=>has('1c'),
   lic:(g,t)=>g.some(x=>{ const m=x.match(/^\((.*)\) ∨ \((.*)\)$/); return m&&((m[1]===t&&g.includes(neg(m[2])))||(m[2]===t&&g.includes(neg(m[1])))); }),
   act:c=>({lines:[['('+c.l+' = '+c.n+') ∨ ('+c.l+' = '+c.r+')','given'],[c.l+' ≠ '+c.n,'given'],[c.l+' = '+c.r,null]], why:'Line 1 offers two options, line 2 denies the first, so the second remains.'})},
  {id:'4f.pluszero', step:'4f', name:'the plus-zero technique', kinds:['add','times'], open:()=>has('4f'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) \+ 0 = (\d+)$/); return !!m&&m[1]===m[2]; },
   act:c=>({lines:[[c.a+' + 0 = '+c.a,null]], why:'Adding 0 changes nothing, and it needs no line above it.'})},
  {id:'4f.zeroplus', step:'4f', name:'the zero-plus technique', kinds:['add','times'], open:()=>has('4f'),
   lic:(g,t)=>{ const m=t.match(/^0 \+ (\d+) = (\d+)$/); return !!m&&m[1]===m[2]; },
   act:c=>({lines:[['0 + '+c.b+' = '+c.b,null]], why:'0 added on the left gives the number back. That is its own technique, proved after plus-zero.'})},
  {id:'4f.plusone', step:'4f', name:'the plus-one technique', kinds:['add','times'], open:()=>has('4f'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) \+ 1 = S\((\d+)\)$/); return !!m&&m[1]===m[2]; },
   act:c=>({lines:[[c.a+' + 1 = S('+c.a+')',null]], why:'Adding one is taking the next one.'})},
  {id:'4f.plusnext', step:'4f', name:'the plus-a-next technique', kinds:['add','times'], open:()=>has('4f'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) \+ S\((\d+)\) = S\((\d+) \+ (\d+)\)$/); return !!m&&m[1]===m[3]&&m[2]===m[4]; },
   act:c=>({lines:[[c.a+' + S('+c.b+') = S('+c.a+' + '+c.b+')',null]], why:'Adding the next one after '+c.b+' gives the next one after the sum with '+c.b+'.'})},
  {id:'4g.timeszero', step:'4g', name:'the times-zero technique', kinds:['add','times'], open:()=>has('4g'),
   lic:(g,t)=>/^\d+ · 0 = 0$/.test(t),
   act:c=>({lines:[[c.a+' · 0 = 0',null]], why:'Any number times 0 is 0.'})},
  {id:'4g.timesnext', step:'4g', name:'the times-a-next technique', kinds:['add','times'], open:()=>has('4g'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) · S\((\d+)\) = \((\d+) · (\d+)\) \+ (\d+)$/); return !!m&&m[1]===m[3]&&m[2]===m[4]&&m[1]===m[5]; },
   act:c=>({lines:[[c.a+' · S('+c.b+') = ('+c.a+' · '+c.b+') + '+c.a,null]], why:c.a+' times the next one after '+c.b+' is '+c.a+' times '+c.b+', plus '+c.a+'.'})},
  {id:'4g.powerzero', step:'4g', name:'the power-zero technique', kinds:['add','times'], open:()=>has('4g'),
   lic:(g,t)=>/^\d+⁰ = 1$/.test(t),
   act:c=>({lines:[[(c.a||1)+'⁰ = 1',null]], why:'Any number to the power 0 is 1.'})}
];
/* Build 3 (Andrew 2026-10-31 20:55): pools through rung 5, so a page is well mixed by the end of 4 and nearly never repeats by the end of 5. */
const SUPD='⁰¹²³⁴⁵⁶⁷⁸⁹', SUPC='[⁰¹²³⁴⁵⁶⁷⁸⁹]+';
const sup=n=>String(n).split('').map(d=>SUPD[d]).join('');
const unsup=s=>Number(String(s).split('').map(ch=>SUPD.indexOf(ch)).join(''));
const I=n=>n<0?'(−'+(-n)+')':String(n);
const TOK='(\\d+|\\(−\\d+\\))';
const P=t=>t.charAt(0)==='('?-Number(t.slice(2,-1)):Number(t);
const F=(p,q)=>I(p)+'/'+q;
const FR='(\\d+|\\(−\\d+\\))/(\\d+)';
const fact=n=>n<2?1:n*fact(n-1);
const re=s=>new RegExp('^'+s+'$');
const kk=c=>c.k||(2+(c.a%8));
const mem=n=>n+(n===1?' member':' members');
Object.assign(STEPS,{'4h':['r04h','Order'],'4j':['r04j','Divides, Remainders and Primes'],'4k':['r04k','Counting Choices'],
  '5b':['r05b','Integers as Pairs'],'5c':['r05c','Fractions as Ratios'],'5e':['r05e','Zero, Negatives, and the Forbidden Division'],
  '5f':['r05f','Between Any Two, Another; Yet Holes'],'5g':['r05g','The Same Change to Both Sides'],'5i':['r05i','Expanding and Factoring'],
  '5j':['r05j','Ratio, Proportion and Units']});
SEEDS.push(
  {id:'4h.numbers', step:'4h', label:'numbers to compare', open:()=>has('4h'),
   make(){ const T=has('4j')?30:20, a=rnd(T+1), b=1+rnd(T), k=2+rnd(8); return {a,b,k,c:a+b,ix:'['+a+','+b+','+k+']',kind:'num'}; }},
  {id:'5b.integers', step:'5b', label:'integers', open:()=>has('5b'),
   make(){ const x=rnd(41)-20, y=rnd(41)-20; let z=rnd(19)-9; if(z===0) z=7; return {x,y,z,ix:'['+x+','+y+','+z+']',kind:'int'}; }},
  {id:'5c.fractions', step:'5c', label:'fractions', open:()=>has('5c'),
   make(){ const q=1+rnd(12), s=1+rnd(12), p=rnd(25)-12, r=rnd(25)-12, k=2+rnd(8); return {p,q,r,s,k,ix:'['+p+','+q+','+r+','+s+','+k+']',kind:'frac'}; }}
);
const NUM=['add','times','num'];
LINKS.push(
  /* rung 1 */
  {id:'1c.neither', step:'1c', name:'the neither technique', kinds:['names'], open:()=>has('1c'),
   lic:(g,t)=>{ const m=t.match(/^\((.*)\) ∧ \((.*)\)$/); return !!m&&m[1].includes(' ≠ ')&&m[2].includes(' ≠ ')&&g.includes('¬(('+m[1].replace(' ≠ ',' = ')+') ∨ ('+m[2].replace(' ≠ ',' = ')+'))'); },
   act:c=>({lines:[['¬(('+c.l+' = '+c.n+') ∨ ('+c.r+' = '+c.n+'))','given'],['('+c.l+' ≠ '+c.n+') ∧ ('+c.r+' ≠ '+c.n+')',null]], why:'Line 1 denies that either option holds, so each one fails: neither.'})},
  {id:'1c.onlyone', step:'1c', name:'the only-one technique', kinds:['names'], open:()=>has('1c'),
   lic:(g,t)=>{ const p=t.split(' ≠ '); if(p.length!==2) return false; const Q=p[0]+' = '+p[1]; return g.some(x=>{ const m=x.match(/^\((.*)\) ⊕ \((.*)\)$/); return m&&((m[2]===Q&&g.includes(m[1]))||(m[1]===Q&&g.includes(m[2]))); }); },
   act:c=>({lines:[['('+c.l+' = '+c.r+') ⊕ ('+c.l+' = '+c.n+')','given'],[c.l+' = '+c.r,'given'],[c.l+' ≠ '+c.n,null]], why:'Exactly one of the two holds, line 2 says the first does, so the second does not: only-one.'})},
  /* rung 4: powers */
  {id:'4g.powernext', step:'4g', name:'the power-of-a-next technique', kinds:NUM, open:()=>has('4g'),
   lic:(g,t)=>{ const m=t.match(re('(\\d+)\\^S\\((\\d+)\\) = (\\d+)('+SUPC+') · (\\d+)')); return !!m&&m[1]===m[3]&&m[3]===m[5]&&unsup(m[4])===Number(m[2]); },
   act:c=>{ const k=kk(c), e=c.b%6; return {lines:[[k+'^S('+e+') = '+k+sup(e)+' · '+k,null]], why:k+' to the power of the next one after '+e+' is '+k+' to the power '+e+', times '+k+'.'}; }},
  {id:'4g.zerotimes', step:'4g', name:'the zero-times technique', kinds:NUM, open:()=>has('4g'),
   lic:(g,t)=>/^0 · \d+ = 0$/.test(t), act:c=>({lines:[['0 · '+c.a+' = 0',null]], why:'0 times any number is 0. It is its own technique, proved after times-zero.'})},
  {id:'4g.onetimes', step:'4g', name:'the one-changes-nothing technique', kinds:NUM, open:()=>has('4g'),
   lic:(g,t)=>{ const m=t.match(/^(?:1 · (\d+)|(\d+) · 1) = (\d+)$/); return !!m&&(m[1]||m[2])===m[3]; },
   act:c=>({lines:[[(c.a%2?'1 · '+c.a:c.a+' · 1')+' = '+c.a,null]], why:'Multiplying by 1, on either side, changes nothing.'})},
  {id:'4g.powerone', step:'4g', name:'the power-one technique', kinds:NUM, open:()=>has('4g'),
   lic:(g,t)=>{ const m=t.match(/^(\d+)¹ = (\d+)$/); return !!m&&m[1]===m[2]; }, act:c=>({lines:[[c.a+'¹ = '+c.a,null]], why:'A number to the power 1 is itself.'})},
  {id:'4g.powersadd', step:'4g', name:'the powers-add-their-counts technique', kinds:NUM, open:()=>has('4g'),
   lic:(g,t)=>{ const m=t.match(re('(\\d+)('+SUPC+') · (\\d+)('+SUPC+') = (\\d+)⁽('+SUPC+')⁺('+SUPC+')⁾')); return !!m&&m[1]===m[3]&&m[3]===m[5]&&m[2]===m[6]&&m[4]===m[7]; },
   act:c=>{ const k=kk(c), e=c.a%7, f=c.b%7; return {lines:[[k+sup(e)+' · '+k+sup(f)+' = '+k+'⁽'+sup(e)+'⁺'+sup(f)+'⁾',null]], why:'Multiplying by '+k+', '+e+' times and then '+f+' more times, is multiplying by '+k+', ('+e+' + '+f+') times.'}; }},
  {id:'4g.powerpower', step:'4g', name:'the power-of-a-power technique', kinds:NUM, open:()=>has('4g'),
   lic:(g,t)=>{ const m=t.match(re('\\((\\d+)('+SUPC+')\\)('+SUPC+') = (\\d+)('+SUPC+')')); return !!m&&m[1]===m[4]&&unsup(m[2])*unsup(m[3])===unsup(m[5]); },
   act:c=>{ const k=kk(c), e=2+c.a%4, f=2+c.b%4; return {lines:[['('+k+sup(e)+')'+sup(f)+' = '+k+sup(e*f),null]], why:'Doing “'+e+' times” '+f+' times over is doing it '+e+' · '+f+' = '+(e*f)+' times.'}; }},
  /* rung 4: order */
  {id:'4h.less', step:'4h', name:'the less-is-adding technique', kinds:['num'], open:()=>has('4h'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) < (\d+)$/); return !!m&&g.some(x=>{ const q=x.match(/^(\d+) = (\d+) \+ (\d+)$/); return q&&q[1]===m[2]&&q[2]===m[1]&&q[3]!=='0'; }); },
   act:c=>({lines:[[c.c+' = '+c.a+' + '+c.b,'given'],[c.a+' < '+c.c,null]], why:c.c+' is '+c.a+' plus '+c.b+', a number other than 0, so '+c.a+' is less: less-is-adding.'})},
  {id:'4h.atmost', step:'4h', name:'the at-most-is-adding technique', kinds:['num'], open:()=>has('4h'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) ≤ (\d+)$/); return !!m&&g.some(x=>{ const q=x.match(/^(\d+) = (\d+) \+ (\d+)$/); return q&&q[1]===m[2]&&q[2]===m[1]; }); },
   act:c=>({lines:[[c.c+' = '+c.a+' + '+c.b,'given'],[c.a+' ≤ '+c.c,null]], why:c.c+' is '+c.a+' plus some number, so '+c.a+' is at most '+c.c+': at-most-is-adding.'})},
  {id:'4h.nextnotpast', step:'4h', name:'the next-is-not-past technique', kinds:['num'], open:()=>has('4h'),
   lic:(g,t)=>{ const m=t.match(/^S\((\d+)\) ≤ (\d+)$/); return !!m&&g.includes(m[1]+' < '+m[2]); },
   act:c=>({lines:[[c.a+' < '+c.c,'given'],['S('+c.a+') ≤ '+c.c,null]], why:'If '+c.a+' is less than '+c.c+', the next one after '+c.a+' is at most '+c.c+'.'})},
  {id:'4h.compare', step:'4h', name:'the any-two-compare technique', kinds:['num'], open:()=>has('4h'),
   lic:(g,t)=>{ const m=t.match(/^\((\d+) < (\d+)\) ∨ \((\d+) = (\d+)\) ∨ \((\d+) < (\d+)\)$/); return !!m&&m[1]===m[3]&&m[3]===m[6]&&m[2]===m[4]&&m[4]===m[5]; },
   act:c=>{ const x=c.a, y=c.b+c.k; return {lines:[['('+x+' < '+y+') ∨ ('+x+' = '+y+') ∨ ('+y+' < '+x+')',null]], why:'Of two numbers, one is less than the other or they are the same: any-two-compare.'}; }},
  /* rung 4: divides */
  {id:'4j.dsum', step:'4j', name:'the divides-a-sum technique', kinds:['num'], open:()=>has('4j'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) ∣ (\d+) \+ (\d+)$/); return !!m&&g.includes(m[1]+' ∣ '+m[2])&&g.includes(m[1]+' ∣ '+m[3]); },
   act:c=>{ const k=c.k, m=k*(c.a+1), n=k*c.b; return {lines:[[k+' ∣ '+m,'given'],[k+' ∣ '+n,'given'],[k+' ∣ '+m+' + '+n,null]], why:k+' divides each of '+m+' and '+n+', so it divides their sum.'}; }},
  {id:'4j.dmult', step:'4j', name:'the divides-a-multiple technique', kinds:['num'], open:()=>has('4j'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) ∣ (\d+) · (\d+)$/); return !!m&&g.includes(m[1]+' ∣ '+m[2]); },
   act:c=>{ const k=c.k, m=k*(c.a+1); return {lines:[[k+' ∣ '+m,'given'],[k+' ∣ '+m+' · '+c.b,null]], why:k+' divides '+m+', so it divides every multiple of '+m+'.'}; }},
  {id:'4j.drest', step:'4j', name:'the divides-the-rest technique', kinds:['num'], open:()=>has('4j'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) ∣ (\d+)$/); return !!m&&g.some(x=>{ const q=x.match(/^(\d+) ∣ (\d+) \+ (\d+)$/); return q&&q[1]===m[1]&&q[3]===m[2]&&g.includes(m[1]+' ∣ '+q[2]); }); },
   act:c=>{ const k=c.k, m=k*(c.a+1), n=k*c.b; return {lines:[[k+' ∣ '+m,'given'],[k+' ∣ '+m+' + '+n,'given'],[k+' ∣ '+n,null]], why:k+' divides '+m+' and divides '+m+' + '+n+', so it divides '+n+'.'}; }},
  {id:'4j.remainder', step:'4j', name:'the division-with-remainder technique', kinds:['num'], open:()=>has('4j'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) = (\d+) · (\d+) \+ (\d+), and (\d+) < (\d+)$/); return !!m&&+m[1]===m[2]*m[3]+ +m[4]&&m[4]===m[5]&&m[2]===m[6]&&+m[4]<+m[2]; },
   act:c=>{ const b=c.k, q=c.a, r=c.b%b, u=b*q+r; return {lines:[[u+' = '+b+' · '+q+' + '+r+', and '+r+' < '+b,null]], why:'Dividing '+u+' by '+b+' leaves a remainder less than '+b+'.'}; }},
  {id:'4j.oddodd', step:'4j', name:'the odd-times-odd technique', kinds:['num'], open:()=>has('4j'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) · (\d+) is odd$/); return !!m&&g.includes(m[1]+' is odd')&&g.includes(m[2]+' is odd'); },
   act:c=>{ const x=2*c.a+1, y=2*c.b+1; return {lines:[[x+' is odd','given'],[y+' is odd','given'],[x+' · '+y+' is odd',null]], why:'An odd number times an odd number is odd.'}; }},
  {id:'4j.evensquare', step:'4j', name:'the even-square technique', kinds:['num'], open:()=>has('4j'),
   lic:(g,t)=>{ const m=t.match(/^(\d+) is even$/); return !!m&&g.includes(m[1]+' · '+m[1]+' is even'); },
   act:c=>{ const x=2*c.a+2; return {lines:[[x+' · '+x+' is even','given'],[x+' is even',null]], why:'If a number times itself is even, the number is even.'}; }},
  /* rung 4: counting */
  {id:'4k.piles', step:'4k', name:'the separate-piles technique', kinds:['num'], open:()=>has('4k'),
   lic:(g,t)=>{ const m=t.match(/^A ∪ B has (\d+) members?$/); if(!m||!g.includes('A ∩ B = ∅')) return false; const a=g.find(x=>/^A has \d+ members?$/.test(x)), b=g.find(x=>/^B has \d+ members?$/.test(x)); return !!a&&!!b&&+a.split(' ')[2]+ +b.split(' ')[2]===+m[1]; },
   act:c=>({lines:[['A has '+mem(c.a),'given'],['B has '+mem(c.b),'given'],['A ∩ B = ∅','given'],['A ∪ B has '+mem(c.a+c.b),null]], why:'Two piles that share nothing hold '+c.a+' + '+c.b+' together.'})},
  {id:'4k.stages', step:'4k', name:'the stages-multiply technique', kinds:['num'], open:()=>has('4k'),
   lic:(g,t)=>{ const m=t.match(/^the pairs \(x, y\) with x ∈ X and y ∈ Yₓ number (\d+)$/); const a=g.find(x=>/^X has \d+ members?$/.test(x)), b=g.find(x=>/^each Yₓ has \d+ members?$/.test(x)); return !!m&&!!a&&!!b&&a.split(' ')[2]*b.split(' ')[3]===+m[1]; },
   act:c=>({lines:[['X has '+mem(c.a),'given'],['each Yₓ has '+mem(c.b),'given'],['the pairs (x, y) with x ∈ X and y ∈ Yₓ number '+(c.a*c.b),null]], why:c.a+' first choices, each with '+c.b+' second choices, make '+c.a+' · '+c.b+' pairs.'})},
  {id:'4k.functions', step:'4k', name:'the counted-functions technique', kinds:['num'], open:()=>has('4k'),
   lic:(g,t)=>{ const m=t.match(/^there are (\d+) functions from X to Y$/); const a=g.find(x=>/^X has \d+ members?$/.test(x)), b=g.find(x=>/^Y has \d+ members?$/.test(x)); return !!m&&!!a&&!!b&&Math.pow(+b.split(' ')[2],+a.split(' ')[2])===+m[1]; },
   act:c=>{ const n=c.a%5, m=c.k%6+1; return {lines:[['X has '+mem(n),'given'],['Y has '+mem(m),'given'],['there are '+Math.pow(m,n)+' functions from X to Y',null]], why:'Each of the '+n+' members of X picks one of '+m+' outputs: '+m+' to the power '+n+'.'}; }},
  {id:'4k.parts', step:'4k', name:'the settled-parts technique', kinds:['num'], open:()=>has('4k'),
   lic:(g,t)=>{ const m=t.match(/^X has (\d+) settled parts$/); const a=g.find(x=>/^X has \d+ members?$/.test(x)); return !!m&&!!a&&Math.pow(2,+a.split(' ')[2])===+m[1]; },
   act:c=>{ const n=c.a%11; return {lines:[['X has '+mem(n),'given'],['X has '+Math.pow(2,n)+' settled parts',null]], why:'Each member is in a part or out of it: 2 to the power '+n+'.'}; }},
  {id:'4k.arrange', step:'4k', name:'the arrangements technique', kinds:['num'], open:()=>has('4k'),
   lic:(g,t)=>{ const m=t.match(/^X has (\d+) arrangements$/); const a=g.find(x=>/^X has \d+ members?$/.test(x)); return !!m&&!!a&&fact(+a.split(' ')[2])===+m[1]; },
   act:c=>{ const n=c.b%8; return {lines:[['X has '+mem(n),'given'],['X has '+fact(n)+' arrangements',null]], why:'A set with '+n+' members has '+n+'! arrangements.'}; }},
  /* rung 5: integers */
  {id:'5b.subtract', step:'5b', name:'the subtraction technique', kinds:['int'], open:()=>has('5b'),
   lic:(g,t)=>{ const m=t.match(re(TOK+' \\+ \\('+TOK+' − '+TOK+'\\) = '+TOK)); return !!m&&m[1]===m[3]&&m[2]===m[4]; },
   act:c=>({lines:[[I(c.y)+' + ('+I(c.x)+' − '+I(c.y)+') = '+I(c.x),null]], why:'Adding '+I(c.y)+' back to the difference gives '+I(c.x)+' again: subtraction.'})},
  {id:'5e.negneg', step:'5e', name:'the negative-of-a-negative technique', kinds:['int'], open:()=>has('5e'),
   lic:(g,t)=>{ const m=t.match(/^−\(−(\d+)\) = (\d+)$/); return !!m&&m[1]===m[2]; },
   act:c=>{ const x=Math.abs(c.x); return {lines:[['−(−'+x+') = '+x,null]], why:'The negative of the negative of '+x+' is '+x+'.'}; }},
  {id:'5e.twoneg', step:'5e', name:'the two-negatives technique', kinds:['int'], open:()=>has('5e'),
   lic:(g,t)=>{ const m=t.match(/^\(−(\d+)\) · \(−(\d+)\) = (\d+) · (\d+)$/); return !!m&&m[1]===m[3]&&m[2]===m[4]; },
   act:c=>{ const x=Math.abs(c.x), y=Math.abs(c.y); return {lines:[['(−'+x+') · (−'+y+') = '+x+' · '+y,null]], why:'Two negatives multiplied give the product of the positives.'}; }},
  {id:'5e.anyzero', step:'5e', name:'the anything-times-zero technique', kinds:['int'], open:()=>has('5e'),
   lic:(g,t)=>/^\(−\d+\) · 0 = 0$/.test(t), act:c=>{ const x=Math.abs(c.z)||1; return {lines:[['(−'+x+') · 0 = 0',null]], why:'Any rational, negatives too, times 0 is 0.'}; }},
  {id:'5f.negsum', step:'5f', name:'the negative-of-a-sum technique', kinds:['int'], open:()=>has('5f'),
   lic:(g,t)=>{ const m=t.match(re('−\\('+TOK+' \\+ '+TOK+'\\) = '+TOK+' \\+ '+TOK)); return !!m&&P(m[3])===-P(m[1])&&P(m[4])===-P(m[2]); },
   act:c=>({lines:[['−('+I(c.x)+' + '+I(c.y)+') = '+I(-c.x)+' + '+I(-c.y),null]], why:'The negative of a sum is the sum of the negatives.'})},
  {id:'5g.addkeeps', step:'5g', name:'the adding-keeps-answers technique', kinds:['int'], open:()=>has('5g'),
   lic:(g,t)=>{ const m=t.match(re('(.+) = (.+) \\+ '+TOK)); if(!m) return false; const c=m[3]; return g.some(x=>{ const q=x.split(' = '); return q.length===2&&t===q[0]+' + '+c+' = '+q[1]+' + '+c; }); },
   act:c=>({lines:[[I(c.x)+' + '+I(c.y)+' = '+I(c.x+c.y),'given'],[I(c.x)+' + '+I(c.y)+' + '+I(c.z)+' = '+I(c.x+c.y)+' + '+I(c.z),null]], why:'Adding '+I(c.z)+' to both sides keeps the sameness.'})},
  {id:'5g.mulkeeps', step:'5g', name:'the multiplying-keeps-answers technique', kinds:['int'], open:()=>has('5g'),
   lic:(g,t)=>{ const m=t.match(re('\\((.+)\\) · '+TOK+' = \\((.+)\\) · '+TOK)); return !!m&&m[2]===m[4]&&P(m[2])!==0&&g.includes(m[1]+' = '+m[3]); },
   act:c=>({lines:[[I(c.x)+' + '+I(c.y)+' = '+I(c.x+c.y),'given'],['('+I(c.x)+' + '+I(c.y)+') · '+I(c.z)+' = ('+I(c.x+c.y)+') · '+I(c.z),null]], why:'Multiplying both sides by '+I(c.z)+', which is not 0, keeps the sameness.'})},
  {id:'5g.addsame', step:'5g', name:'the add-a-sameness technique', kinds:['int'], open:()=>has('5g'),
   lic:(g,t)=>{ const m=t.match(/^\((.+)\) \+ \((.+)\) = (.+) \+ (.+)$/); return !!m&&g.includes(m[1]+' = '+m[3])&&g.includes(m[2]+' = '+m[4]); },
   act:c=>({lines:[[I(c.x)+' + '+I(c.y)+' = '+I(c.x+c.y),'given'],[I(c.z)+' · 2 = '+I(2*c.z),'given'],['('+I(c.x)+' + '+I(c.y)+') + ('+I(c.z)+' · 2) = '+I(c.x+c.y)+' + '+I(2*c.z),null]], why:'Two samenesses added side by side give a sameness.'})},
  /* rung 5: expanding */
  {id:'5i.grid', step:'5i', name:'the grid-of-cells technique', kinds:['int'], open:()=>has('5i'),
   lic:(g,t)=>{ const m=t.match(re('\\('+TOK+' \\+ '+TOK+'\\)\\('+TOK+' \\+ '+TOK+'\\) = '+TOK+'·'+TOK+' \\+ '+TOK+'·'+TOK+' \\+ '+TOK+'·'+TOK+' \\+ '+TOK+'·'+TOK)); if(!m) return false; const [w,b,c,d]=[m[1],m[2],m[3],m[4]]; return [m[5],m[6],m[7],m[8],m[9],m[10],m[11],m[12]].join()===[w,c,w,d,b,c,b,d].join(); },
   act:c=>{ const w=c.x, b=c.y, u=c.z, d=(c.x-c.y)%9||5; return {lines:[['('+I(w)+' + '+I(b)+')('+I(u)+' + '+I(d)+') = '+I(w)+'·'+I(u)+' + '+I(w)+'·'+I(d)+' + '+I(b)+'·'+I(u)+' + '+I(b)+'·'+I(d),null]], why:'Each term of one bracket times each term of the other: the grid of cells.'}; }},
  {id:'5i.sqsum', step:'5i', name:'the square-of-a-sum technique', kinds:['int'], open:()=>has('5i'),
   lic:(g,t)=>{ const m=t.match(re('\\('+TOK+' \\+ '+TOK+'\\)² = '+TOK+'² \\+ 2·'+TOK+'·'+TOK+' \\+ '+TOK+'²')); return !!m&&m[1]===m[3]&&m[3]===m[4]&&m[2]===m[5]&&m[5]===m[6]; },
   act:c=>({lines:[['('+I(c.x)+' + '+I(c.y)+')² = '+I(c.x)+'² + 2·'+I(c.x)+'·'+I(c.y)+' + '+I(c.y)+'²',null]], why:'A sum squared is the first squared, twice the product, and the second squared.'})},
  {id:'5i.sqdiff', step:'5i', name:'the square-of-a-difference technique', kinds:['int'], open:()=>has('5i'),
   lic:(g,t)=>{ const m=t.match(re('\\('+TOK+' − '+TOK+'\\)² = '+TOK+'² − 2·'+TOK+'·'+TOK+' \\+ '+TOK+'²')); return !!m&&m[1]===m[3]&&m[3]===m[4]&&m[2]===m[5]&&m[5]===m[6]; },
   act:c=>({lines:[['('+I(c.x)+' − '+I(c.y)+')² = '+I(c.x)+'² − 2·'+I(c.x)+'·'+I(c.y)+' + '+I(c.y)+'²',null]], why:'A difference squared is the first squared, less twice the product, plus the second squared.'})},
  {id:'5i.diffsq', step:'5i', name:'the difference-of-squares technique', kinds:['int'], open:()=>has('5i'),
   lic:(g,t)=>{ const m=t.match(re('\\('+TOK+' \\+ '+TOK+'\\)\\('+TOK+' − '+TOK+'\\) = '+TOK+'² − '+TOK+'²')); return !!m&&m[1]===m[3]&&m[3]===m[5]&&m[2]===m[4]&&m[4]===m[6]; },
   act:c=>({lines:[['('+I(c.x)+' + '+I(c.y)+')('+I(c.x)+' − '+I(c.y)+') = '+I(c.x)+'² − '+I(c.y)+'²',null]], why:'A sum times the matching difference is the difference of the squares.'})},
  /* rung 5: fractions */
  {id:'5c.cross', step:'5c', name:'the cross-multiplying technique', kinds:['frac'], open:()=>has('5c'),
   lic:(g,t)=>{ const m=t.match(re(TOK+' · (\\d+) = (\\d+) · '+TOK)); return !!m&&g.includes(m[1]+'/'+m[3]+' = '+m[4]+'/'+m[2]); },
   act:c=>{ const p=c.p, q=c.q, r=c.p*c.k, s=c.q*c.k; return {lines:[[F(p,q)+' = '+F(r,s),'given'],[I(p)+' · '+s+' = '+q+' · '+I(r),null]], why:'Two fractions are the same exactly when their cross products are: cross-multiplying.'}; }},
  {id:'5c.scaling', step:'5c', name:'the scaling technique', kinds:['frac'], open:()=>has('5c'),
   lic:(g,t)=>{ const m=t.match(re(FR+' = '+FR)); if(!m) return false; const a=P(m[1]), b=+m[2], c=P(m[3]), d=+m[4]; return d>0&&b%d===0&&b/d>=2&&a===c*(b/d); },
   act:c=>({lines:[[F(c.k*c.p,c.k*c.q)+' = '+F(c.p,c.q),null]], why:'Top and bottom both scaled by '+c.k+' give the same fraction.'})},
  {id:'5c.recip', step:'5c', name:'the reciprocal technique', kinds:['frac'], open:()=>has('5c'),
   lic:(g,t)=>{ const m=t.match(re(FR+' · '+FR+' = 1')); return !!m&&P(m[1])!==0&&P(m[1])*P(m[3])===+m[2]*+m[4]&&Math.abs(P(m[1]))===+m[4]&&Math.abs(P(m[3]))===+m[2]; },
   act:c=>{ const p=c.p||5, q=c.q, sg=p<0?-1:1; return {lines:[[F(p,q)+' · '+F(sg*q,Math.abs(p))+' = 1',null]], why:'The reciprocal of '+F(p,q)+' turns it upside down, and the product is 1.'}; }},
  {id:'5f.between', step:'5f', name:'the another-between technique', kinds:['frac'], open:()=>has('5f'),
   lic:(g,t)=>{ const m=t.match(/^(.+) < \((.+) \+ (.+)\)\/2 < (.+)$/); return !!m&&m[1]===m[2]&&m[3]===m[4]&&g.includes(m[1]+' < '+m[4]); },
   act:c=>{ let a=[c.p,c.q], b=[c.r,c.s]; if(a[0]*b[1]===b[0]*a[1]) b=[c.r+1,c.s]; if(a[0]*b[1]>b[0]*a[1]) [a,b]=[b,a]; const w=F(a[0],a[1]), v=F(b[0],b[1]); return {lines:[[w+' < '+v,'given'],[w+' < ('+w+' + '+v+')/2 < '+v,null]], why:'Halfway between two different rationals is another rational, strictly between them.'}; }},
  {id:'5f.compare', step:'5f', name:'the compare-by-cross-multiplying technique', kinds:['frac'], open:()=>has('5f'),
   lic:(g,t)=>{ const m=t.match(re(FR+' < '+FR)); return !!m&&g.includes(m[1]+' · '+m[4]+' < '+m[2]+' · '+m[3]); },
   act:c=>{ let [p,q,r,s]=[c.p,c.q,c.r,c.s]; if(p*s===q*r) r=r+1; if(p*s>q*r) [p,q,r,s]=[r,s,p,q]; return {lines:[[I(p)+' · '+s+' < '+q+' · '+I(r),'given'],[F(p,q)+' < '+F(r,s),null]], why:'With positive bottoms, the cross products decide which fraction is less.'}; }},
  {id:'5j.ratio', step:'5j', name:'the ratios-cross-multiply technique', kinds:['frac'], open:()=>has('5j'),
   lic:(g,t)=>{ const m=t.match(re(TOK+' · (\\d+) = (\\d+) · '+TOK)); return !!m&&g.includes(m[1]+' : '+m[3]+' = '+m[4]+' : '+m[2]); },
   act:c=>{ const p=c.p, q=c.q, r=c.p*c.k, s=c.q*c.k; return {lines:[[I(p)+' : '+q+' = '+I(r)+' : '+s,'given'],[I(p)+' · '+s+' = '+q+' · '+I(r),null]], why:'Two ratios agree exactly when their cross products do.'}; }}
);
['4f.pluszero','4f.zeroplus','4f.plusone','4f.plusnext','4g.timeszero','4g.timesnext','4g.powerzero'].forEach(id=>{ const L=LINKS.find(x=>x.id===id); if(L) L.kinds=NUM; });

LINKS.forEach(L=>{ if(!L.kinds) L.kinds=['names','add','times']; });

/* 0.2.1 question pools (Andrew 2026-11-04 19:13): five more kinds of laundry question, each opened by its step.
   true or false · what is x, or [x, y], or [x, y, z] · which function is it · which graph is it · what set is it.
   Each pool checks its own question: exactly one offered answer is right, and no decoy equals it. */
Object.assign(STEPS,{'1e':['r01e','Tables'],'2i':['r02i','Sets by Hand'],'9a':['r09a','A Function Is Its Pairs'],
  '9e':['r09e','Reading and Drawing Graphs'],'27j':['r27j','Solving Systems by Elimination']});
const S=n=>n<0?'−'+(-n):String(n);
const lin=(a,b)=>(a===1?'':a===-1?'−':S(a))+'x'+(b===0?'':b>0?' + '+b:' − '+(-b));
const ANIMALS=[['cat',{fur:1,legs:4}],['dog',{fur:1,legs:4}],['owl',{flies:1,legs:2}],['bee',{flies:1,legs:6}],['ant',{legs:6}],['eel',{water:1,legs:0}],['spider',{legs:8}]];
const CONDS=[['flies',a=>!!a[1].flies],['has fur',a=>!!a[1].fur],['has six legs',a=>a[1].legs===6],['has four legs',a=>a[1].legs===4],['lives in water',a=>!!a[1].water],['has no legs',a=>a[1].legs===0]];
const setTxt=a=>a.length?'{'+a.join(', ')+'}':'∅';
const FUNS=[['x + 1',x=>x+1],['x + 2',x=>x+2],['2x',x=>2*x],['3x',x=>3*x],['x²',x=>x*x],['x³',x=>x*x*x],['2x + 1',x=>2*x+1],['x − 1',x=>x-1],['10 − x',x=>10-x],['x² + 1',x=>x*x+1]];
const GRAPHS=[['y = x',x=>x],['y = x²',x=>x*x],['y = x³',x=>x*x*x],['y = 1/x',x=>Math.abs(x)<0.05?NaN:1/x],['y = √x',x=>x<0?NaN:Math.sqrt(x)],['y = |x|',x=>Math.abs(x)],['y = −x',x=>-x],['y = x + 2',x=>x+2],['y = −x²',x=>-x*x]];
function svg(f){ let d='', pen=false; for(let i=0;i<=160;i++){ const x=-3+6*i/160, y=f(x); if(!isFinite(y)||Math.abs(y)>3.4){ pen=false; continue; }
    const X=(x+3)/6*120, Y=60-y/3*60*0.92; d+=(pen?'L':'M')+X.toFixed(1)+' '+Y.toFixed(1); pen=true; }
  return '<svg viewBox="0 0 120 120" width="96" height="96" aria-hidden="true" style="display:block"><path d="M0 60H120M60 0V120" stroke="currentColor" stroke-opacity=".3" fill="none"/><path d="'+d+'" stroke="currentColor" stroke-width="2.4" fill="none"/></svg>'; }
const QP=[
  {id:'1e.tf', step:'1e', label:'true or false: joined statements', open:()=>has('1e'), make(){
     const a=rnd(10), b=rnd(10), c=rnd(10), P=[a+' < '+b, a<b], Q=[b+' = '+c, b===c], R=[c+' ≠ '+a, c!==a];
     const forms=[[ '('+P[0]+') ∧ ('+Q[0]+')', P[1]&&Q[1]],[ '('+P[0]+') ∨ ('+R[0]+')', P[1]||R[1]],[ '¬('+Q[0]+') ∧ ('+R[0]+')', !Q[1]&&R[1]],[ '('+Q[0]+') → ('+P[0]+')', !Q[1]||P[1]],[ '('+P[0]+') ⊕ ('+R[0]+')', P[1]!==R[1]]];
     const k=rnd(forms.length), [t,v]=forms[k];
     return {index:'q:1e.tf['+a+','+b+','+c+','+k+']', lines:[[t,'statement']], ask:'Is the statement true or false?', right:v?'true':'false', opts:['true','false'],
       why:'Each part is read from its numbers, then the joining word works on the marks, as 1e’s tables do.'}; }},
  {id:'4j.tf', step:'4j', label:'true or false: divides', open:()=>has('4j'), make(){
     const k=2+rnd(8), n=1+rnd(60), v=n%k===0;
     return {index:'q:4j.tf['+k+','+n+']', lines:[[k+' | '+n,'statement']], ask:'Is the statement true or false?', right:v?'true':'false', opts:['true','false'],
       why:k+' divides '+n+' exactly when '+n+' is '+k+' times some counting number; here the remainder is '+(n%k)+'.'}; }},
  {id:'5g.x', step:'5g', label:'what is x', open:()=>has('5g'), make(){
     let a=rnd(9)-4; if(a===0) a=3; const x=rnd(21)-10, b=rnd(21)-10, c=a*x+b;
     const pool=[x+1,x-1,-x,c-b,(c+b)/a,x+2].filter(v=>Number.isInteger(v)&&v!==x);
     const wrong=[...new Set(pool)].slice(0,3).map(S);
     return {index:'q:5g.x['+a+','+x+','+b+']', lines:[[lin(a,b)+' = '+S(c),'given']], ask:'What is x?', right:S(x), opts:shuffle([S(x),...wrong]),
       why:'Take '+S(b)+' from both sides, then divide both by '+S(a)+': x = '+S(x)+'. Put it back to check: '+S(a)+' · '+S(x)+' + '+S(b)+' = '+S(c)+'.'}; }},
  {id:'5g.xy', step:'5g', label:'what is [x, y]', open:()=>has('5g'), make(){
     const x=rnd(21)-10, y=rnd(21)-10, s=x+y, d=x-y, P=v=>'['+v.map(S).join(', ')+']';
     const right=P([x,y]), wrong=[P([y,x]),P([x,-y]),P([-x,y]),P([x+1,y-1])].filter(w=>w!==right);
     return {index:'q:5g.xy['+x+','+y+']', lines:[['x + y = '+S(s),'given'],['x − y = '+S(d),'given']], ask:'What is [x, y]?', right, opts:shuffle([right,...[...new Set(wrong)].slice(0,3)]),
       why:'Add the two lines: 2x = '+S(s+d)+', so x = '+S(x)+'; then y = '+S(s)+' − '+S(x)+' = '+S(y)+'.'}; }},
  {id:'27j.xyz', step:'27j', label:'what is [x, y, z]', open:()=>has('27j'), make(){
     const x=rnd(13)-6, y=rnd(13)-6, z=rnd(13)-6, P=v=>'['+v.map(S).join(', ')+']';
     const right=P([x,y,z]), wrong=[P([z,y,x]),P([x,z,y]),P([y,x,z]),P([x,y,-z]),P([-x,y,z])].filter(w=>w!==right);
     const opts=[...new Set(wrong)].slice(0,3); if(opts.length<3) return null;
     return {index:'q:27j.xyz['+x+','+y+','+z+']', lines:[['x + y + z = '+S(x+y+z),'given'],['y + z = '+S(y+z),'given'],['z = '+S(z),'given']], ask:'What is [x, y, z]?', right, opts:shuffle([right,...opts]),
       why:'The rows are already reduced: z = '+S(z)+', then y = '+S(y+z)+' − '+S(z)+' = '+S(y)+', then x = '+S(x+y+z)+' − '+S(y+z)+' = '+S(x)+'.'}; }},
  {id:'9a.which', step:'9a', label:'which function is it', open:()=>has('9a'), make(){
     const k=rnd(FUNS.length), xs=shuffle([0,1,2,3,4]).slice(0,3).sort((p,q)=>p-q), f=FUNS[k];
     const fits=g=>xs.every(x=>g[1](x)===f[1](x));
     const wrong=shuffle(FUNS.filter((g,i)=>i!==k&&!fits(g))).slice(0,3).map(g=>'f(x) = '+g[0]);
     return {index:'q:9a.which['+k+','+xs+']', lines:xs.map(x=>['f('+x+') = '+S(f[1](x)),'pair']), ask:'Which function is it?', right:'f(x) = '+f[0], opts:shuffle(['f(x) = '+f[0],...wrong]),
       why:'Only f(x) = '+f[0]+' gives every listed pair; each other choice misses at least one.'}; }},
  {id:'9e.graph', step:'9e', label:'which graph is it', open:()=>has('9e'), make(){
     const k=rnd(GRAPHS.length), g=GRAPHS[k], others=shuffle(GRAPHS.filter((h,i)=>i!==k)).slice(0,3), all=shuffle([g,...others]);
     const html={}; all.forEach(h=>html[h[0]]=svg(h[1]));
     return {index:'q:9e.graph['+k+','+others.map(h=>GRAPHS.indexOf(h))+']', lines:[[g[0],'function']], ask:'Which graph is it?', right:g[0], opts:all.map(h=>h[0]), html,
       why:'Read a few pairs off '+g[0]+' (at x = −1, 0, 1, 2) and find the drawing that holds them all.'}; }},
  {id:'2i.set', step:'2i', label:'what set is it', open:()=>has('2i'), make(){
     const base=shuffle(ANIMALS.slice()).slice(0,5), i=rnd(CONDS.length); let j=rnd(CONDS.length-1); if(j>=i) j++;
     const A=CONDS[i], B=CONDS[j], f=rnd(3);
     const test=[a=>A[1](a), a=>A[1](a)||B[1](a), a=>A[1](a)&&!B[1](a)][f];
     const say=['{x ∈ U : x '+A[0]+'}','{x ∈ U : x '+A[0]+'} ∪ {x ∈ U : x '+B[0]+'}','{x ∈ U : x '+A[0]+'} ∖ {x ∈ U : x '+B[0]+'}'][f];
     const nm=a=>a[0], right=setTxt(base.filter(test).map(nm));
     const alt=[base.filter(a=>!test(a)).map(nm), base.filter(a=>A[1](a)&&B[1](a)).map(nm), base.filter(a=>B[1](a)).map(nm), base.filter(a=>A[1](a)!==B[1](a)).map(nm), base.map(nm)].map(setTxt);
     const wrong=[...new Set(alt)].filter(w=>w!==right).slice(0,3); if(wrong.length<3) return null;
     return {index:'q:2i.set['+base.map(nm)+';'+i+','+j+','+f+']', lines:[['U = '+setTxt(base.map(nm)),'given'],[say,'set']], ask:'What set is it?', right, opts:shuffle([right,...wrong]),
       why:'Chase each member of U through the condition, as 2i chases a member through a sift: '+right+' is what is left.'}; }},
  {id:'4j.set', step:'4j', label:'what set is it: by dividing', open:()=>has('4j'), make(){
     const N=12+rnd(9), k=2+rnd(4), U=Array.from({length:N},(_,i)=>i+1);
     const right=setTxt(U.filter(n=>n%k===0)), wrong=[k+1,k===2?4:2,k+2].filter(m=>m!==k).map(m=>setTxt(U.filter(n=>n%m===0)));
     const w=[...new Set(wrong)].filter(x=>x!==right).slice(0,3); if(w.length<3) w.push(setTxt(U.filter(n=>n%k===1)));
     return {index:'q:4j.set['+N+','+k+']', lines:[['{n ∈ {1, …, '+N+'} : '+k+' | n}','set']], ask:'What set is it?', right, opts:shuffle([right,...w.slice(0,3)]),
       why:'Keep each n from 1 to '+N+' that '+k+' divides: '+right+'.'}; }}
];

/* The check: which techniques license the marked line, from the lines above it. */
function licensers(lines){ const g=lines.filter(x=>x[1]).map(x=>x[0]), t=lines.find(x=>!x[1])[0]; return LINKS.filter(L=>L.lic(g,t)).map(L=>L.name); }

/* Strays: a stream of about 0.25 a day from open pools the learner switched off. */
function poisson(l){ let k=0,p=Math.exp(-l),s=p; const u=Math.random(); while(u>s&&k<9){ k++; p*=l/k; s+=p; } return k; }
function strayDue(){ const day=new Date().toISOString().slice(0,10); let s=get('rand:strays',null);
  if(!s||s.day!==day){ s={day,due:poisson(0.25),served:0}; put('rand:strays',s); } return s; }

/* ===== Laundry 4 (Andrew 2026-11-10 18:43Z) =====
   The main switch is between four kinds of work: checking a proof to find the bad line, working an equation to completion,
   word problems (attach the real-world inputs to the equation and get the output), and comprehension.
   Each question takes a seed (an address in a seed pool) and a number of links (addresses in link pools) and fits them together;
   terms and units of measure come from a bank (an address in a bank pool). The foot of every question lists seed.link.bank
   and opens the report form. Pools are switched by rung and unlocked by step. */
const rungOf=t=>{ const n=parseInt(t,10); return isNaN(n)?99:n; };
const MODES=[{id:'proof',label:'Check Proofs',say:'One line in the proof is bad. Find it.'},
  {id:'work',label:'Work Equations',say:'Work the equation to completion.'},
  {id:'word',label:'Word Problems',say:'Attach the inputs to the equation and get the output.'},
  {id:'read',label:'Comprehension',say:'Know it by sight.'}];
const WORKQ=['5g.x','5g.xy','27j.xyz'], DASH='–';
const SKIND={'0a.names':'names','4f.add':'add','4g.times':'times','4h.numbers':'num','5b.integers':'int','5c.fractions':'frac'};

/* --- Reading a line: does it hold? true, false, or null when the line cannot be read as numbers or names. --- */
const SUPMAP={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁺':'+','⁽':'(','⁾':')'};
function num(s){ const tk=[]; let i=0; s=String(s);
  while(i<s.length){ const ch=s[i];
    if(ch===' '){ i++; continue; }
    if(ch>='0'&&ch<='9'){ let j=i; while(j<s.length&&s[j]>='0'&&s[j]<='9') j++; tk.push(['n',Number(s.slice(i,j))]); i=j; continue; }
    if(ch in SUPMAP){ let j=i,u=''; while(j<s.length&&(s[j] in SUPMAP)){ u+=SUPMAP[s[j]]; j++; } tk.push(['p',num(u)]); i=j; continue; }
    if('()+−·/:^S'.indexOf(ch)>=0){ tk.push([ch]); i++; continue; }
    throw new Error('unread'); }
  let k=0; const at=c=>k<tk.length&&tk[k][0]===c, need=c=>{ if(!at(c)) throw new Error('unread'); k++; };
  const base=()=>{ if(at('n')) return tk[k++][1]; if(at('S')){ k++; need('('); const v=expr(); need(')'); return v+1; } if(at('(')){ k++; const v=expr(); need(')'); return v; } throw new Error('unread'); };
  const power=()=>{ let b=base(); if(at('p')) b=Math.pow(b,tk[k++][1]); else if(at('^')){ k++; b=Math.pow(b,base()); } return b; };
  const unary=()=>{ if(at('−')){ k++; return -unary(); } return power(); };
  const term=()=>{ let v=unary(); for(;;){ if(at('·')){ k++; v*=unary(); } else if(at('/')||at(':')){ k++; const w=unary(); if(w===0) throw new Error('unread'); v/=w; } else if(at('(')){ v*=unary(); } else break; } return v; };
  function expr(){ let v=term(); while(at('+')||at('−')){ const o=tk[k++][0], w=term(); v=o==='+'?v+w:v-w; } return v; }
  const v=expr(); if(k!==tk.length||!isFinite(v)) throw new Error('unread'); return v; }
function splitTop(t,sep){ const out=[]; let d=0,last=0; for(let i=0;i<t.length;i++){ const ch=t[i]; if(ch==='(') d++; else if(ch===')') d--; else if(d===0&&t.startsWith(sep,i)){ out.push(t.slice(last,i)); last=i+sep.length; i=last-1; } } out.push(t.slice(last)); return out; }
function unwrap(t){ t=t.trim(); for(;;){ if(t[0]!=='('||t[t.length-1]!==')') return t; let d=0,whole=true; for(let i=0;i<t.length-1;i++){ if(t[i]==='(') d++; else if(t[i]===')') d--; if(d===0){ whole=false; break; } } if(!whole) return t; t=t.slice(1,-1).trim(); } }
const RELS=[' = ',' ≠ ',' < ',' ≤ ',' ∣ ',' | '];
function relParts(t){ const parts=[], ops=[]; let d=0,last=0; for(let i=0;i<t.length;i++){ const ch=t[i]; if(ch==='(') d++; else if(ch===')') d--; else if(d===0&&ch===' '){ const r=RELS.find(x=>t.startsWith(x,i)); if(r){ parts.push(t.slice(last,i)); ops.push(r.trim()); last=i+r.length; i=last-1; } } } parts.push(t.slice(last)); return {parts,ops}; }
function H(t,W){ t=t.trim(); const u=unwrap(t); if(u!==t) return H(u,W);
  let p=splitTop(t,', and '); if(p.length>1) return p.map(x=>H(x,W)).every(Boolean);
  p=splitTop(t,' ⊕ '); if(p.length>1) return p.map(x=>H(x,W)).filter(Boolean).length===1;
  p=splitTop(t,' ∨ '); if(p.length>1) return p.map(x=>H(x,W)).some(Boolean);
  p=splitTop(t,' ∧ '); if(p.length>1) return p.map(x=>H(x,W)).every(Boolean);
  if(t[0]==='¬') return !H(t.slice(1),W);
  const par=t.match(/^(.*) is (odd|even)$/); if(par){ const v=num(par[1]); if(!Number.isInteger(v)) throw new Error('unread'); return (Math.abs(v%2)===1)===(par[2]==='odd'); }
  const R=relParts(t); if(!R.ops.length) throw new Error('unread');
  const names=W&&R.parts.some(x=>W.all.includes(x.trim()));
  if(names){ if(R.parts.length!==2) throw new Error('unread'); const a=R.parts[0].trim(), b=R.parts[1].trim();
    if(!W.all.includes(a)||!W.all.includes(b)) throw new Error('unread');
    const same=a===b||(W.same.includes(a)&&W.same.includes(b));
    if(R.ops[0]==='=') return same; if(R.ops[0]==='≠') return !same; throw new Error('unread'); }
  const v=R.parts.map(num), near=(a,b)=>Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b));
  return R.ops.every((o,i)=>{ const a=v[i], b=v[i+1];
    if(o==='=') return near(a,b); if(o==='≠') return !near(a,b); if(o==='<') return a<b&&!near(a,b); if(o==='≤') return a<b||near(a,b);
    if(!Number.isInteger(a)||!Number.isInteger(b)||a===0) throw new Error('unread'); return b%a===0; }); }
function holds(t,W){ try{ return !!H(String(t),W); }catch(e){ return null; } }
const world=c=>c.kind==='names'?{same:[c.l,c.r,c.m],all:[c.l,c.r,c.m,c.n]}:null;

/* --- The ways a line goes bad: a number off by one or two, a sameness turned to a difference, the sides of an order turned, a wrong name. --- */
function mutations(t,c){ const out=[]; const re=/\d+/g; let m;
  while((m=re.exec(t))){ const n=Number(m[0]); [n+1,n-1,n+2].forEach(v=>{ if(v>=0) out.push(t.slice(0,m.index)+v+t.slice(m.index+m[0].length)); }); }
  const R=relParts(t);
  if(R.ops.length===1){ const [a,b]=R.parts, o=R.ops[0];
    if(o==='=') out.push(a+' ≠ '+b); if(o==='≠') out.push(a+' = '+b); if(o==='<'||o==='≤') out.push(b+' '+o+' '+a); }
  else{ if(t.indexOf(' = ')>=0) out.push(t.replace(' = ',' ≠ ')); else if(t.indexOf(' ≠ ')>=0) out.push(t.replace(' ≠ ',' = ')); }
  if(c.kind==='names') [c.l,c.r,c.m].forEach(x=>{ const i=t.indexOf(x); if(i>=0) out.push(t.slice(0,i)+c.n+t.slice(i+x.length)); });
  return shuffle([...new Set(out)].filter(x=>x!==t)); }

/* --- Check Proofs: a seed, several links, one bad line. --- */
function proofQ(P,used){
  for(let tries=0;tries<120;tries++){
    const s=pick(P.seeds), c=s.make(), W=world(c);
    if(c.kind==='names'&&[c.l,c.r,c.m].includes(c.n)) continue;
    const fit=shuffle(P.links.filter(L=>L.kinds.includes(c.kind))); if(fit.length<2) continue;
    const want=Math.min(fit.length,fit.length>=3?3+rnd(2):2);
    const lines=[], der=[];
    for(const L of fit){ if(der.length>=want) break; let out; try{ out=L.act(c); }catch(e){ continue; }
      const d=out.lines.filter(x=>!x[1]); if(d.length!==1) continue; const text=d[0][0];
      if(lines.some(x=>x.t===text)) continue;
      const gs=out.lines.filter(x=>x[1]).map(x=>x[0]);
      if(gs.some(g=>holds(g,W)===false)||holds(text,W)===false) continue;
      const all=lines.map(x=>x.t).concat(gs); if(!L.lic(all,text)) continue;
      const add=gs.filter(g=>!lines.some(x=>x.t===g)); if(lines.length+add.length+1>10) continue;
      add.forEach(g=>lines.push({t:g,w:'given'})); lines.push({t:text,w:L.name,L}); der.push(lines.length-1); }
    if(der.length<2) continue;
    for(const j of shuffle(der.slice())){ const orig=lines[j].t, L=lines[j].L, others=lines.filter((x,i)=>i!==j).map(x=>x.t);
      const bad=mutations(orig,c).find(t=>!others.includes(t)&&holds(t,W)!==true&&!LINKS.some(X=>{ try{ return X.lic(others,t); }catch(e){ return false; } }));
      if(!bad) continue;
      const ids=der.map(i=>lines[i].L.id), index='p:'+s.id+c.ix+'.'+ids.join('+')+'#'+ids.indexOf(L.id)+':'+bad;
      if(used[index]) continue;
      const names=c.kind==='names';
      return {index, a3:[names?s.id:s.id+c.ix, ids.join('+'), names?'places'+c.ix:DASH], step:L.step, steps:[...new Set(der.map(i=>lines[i].L.step))], stack:true,
        lines:lines.map((x,i)=>[i===j?bad:x.t,x.w]), ask:'One line does not follow from what it cites. Which line is the bad line?',
        right:'line '+(j+1), opts:der.map(i=>'line '+(i+1)), lead:'The bad line is line '+(j+1)+'. ',
        why:'Line '+(j+1)+' cites '+L.name+'. That technique licenses “'+orig+'”, and the line as written does not follow.'}; } }
  return null; }

/* --- Operations: the links of an equation that is worked to completion, and of a word problem. --- */
const OPS=[{id:'4f.plus',step:'4f',label:'adding',word:true},{id:'4g.by',step:'4g',label:'multiplying',word:true},{id:'4g.squared',step:'4g',label:'squaring'},
  {id:'5b.minus',step:'5b',label:'subtracting',word:true},{id:'5e.negated',step:'5e',label:'the negative of'}];
OPS.forEach(O=>{ O.open=()=>measured(O.step); });
const wrapTo=(E,p)=>E.p<p?'('+E.t+')':E.t;
function apply(id,E,n){
  if(id==='4f.plus') return {t:E.t+' + '+n, v:E.v+n, p:1};
  if(id==='5b.minus') return {t:E.t+' − '+n, v:E.v-n, p:1};
  if(id==='4g.by') return {t:wrapTo(E,2)+' · '+n, v:E.v*n, p:2};
  if(id==='4g.squared') return {t:wrapTo(E,3)+'²', v:E.v*E.v, p:3};
  return {t:'−('+E.t+')', v:-E.v, p:2}; }
const startOf=c=>c.kind==='add'?{t:c.a+' + '+c.b,v:c.c,p:1}:c.kind==='times'?{t:c.a+' · '+c.b,v:c.c,p:2}:c.kind==='num'?{t:String(c.a),v:c.a,p:3}:c.kind==='int'?{t:I(c.x),v:c.x,p:3}:null;
const chain=(E,steps)=>steps.reduce((e,s)=>apply(s.id,e,s.n),E);
/* the value of a line read with no parentheses: times before plus and minus (the slip of dropping the grouping) */
function flat(t){ const s=t.replace(/[()]/g,''); try{ return num(s); }catch(e){ return null; } }
const stepAddr=steps=>steps.map(s=>s.id+(s.n!=null?'['+s.n+']':'')).join('+')||DASH;
function drawSteps(ops,E0,count,nonneg){ const steps=[]; let E=E0;
  for(let i=0;i<count;i++){ const O=pick(ops); let n=null;
    if(O.id==='4f.plus') n=1+rnd(Math.max(2,top()));
    else if(O.id==='5b.minus'){ n=1+rnd(Math.max(2,top())); if(nonneg&&n>E.v) n=E.v; if(n<1) continue; }
    else if(O.id==='4g.by') n=2+rnd(8);
    else if(O.id==='4g.squared'){ if(Math.abs(E.v)>12||steps.some(s=>s.id===O.id)) continue; }
    else if(steps.length&&steps[steps.length-1].id===O.id) continue;
    const N=apply(O.id,E,n); if(Math.abs(N.v)>999) continue; steps.push({id:O.id,n}); E=N; }
  return {steps,E}; }
function workQ(P,used,last){
  const seeds=P.seeds.filter(s=>['add','times','num','int'].includes(SKIND[s.id])), wq=P.qps.filter(Q=>WORKQ.includes(Q.id));
  const canChain=seeds.length&&P.ops.length;
  if(wq.length&&(!canChain||Math.random()<0.35)){ const q=poolQ(wq,used,last); if(q) return q; }
  if(canChain) for(let tries=0;tries<120;tries++){
    const s=pick(seeds), c=s.make(), neg=measured('5b'), deep=Math.min(3,1+P.ops.length);
    const solve=measured('5g')&&(c.kind==='num'||c.kind==='int')&&Math.random()<0.5;
    if(solve){ const x=c.kind==='num'?c.a:c.x, ops=P.ops.filter(O=>O.word); if(!ops.length) continue;
      const D=drawSteps(ops,{t:'x',v:x,p:3},1+rnd(deep),!neg); if(!D.steps.length) continue;
      const index='w:'+s.id+c.ix+'.'+stepAddr(D.steps)+'?x'; if(used[index]) continue;
      const right=S(x), again=chain({t:'',v:D.E.v,p:3},D.steps).v;
      const wrong=[...new Set([D.E.v,again,x+1,x-1,-x,x+2].filter(v=>v!==x&&(neg||v>=0)).map(S))].slice(0,3); if(wrong.length<3) continue;
      const undo=[]; let cur=D.E.v; D.steps.slice().reverse().forEach(st=>{ const prev=st.id==='4f.plus'?cur-st.n:st.id==='5b.minus'?cur+st.n:cur/st.n;
        undo.push(st.id==='4f.plus'?S(cur)+' − '+st.n+' = '+S(prev):st.id==='5b.minus'?S(cur)+' + '+st.n+' = '+S(prev):S(cur)+' = '+S(prev)+' · '+st.n); cur=prev; });
      return {index, a3:[s.id+c.ix,stepAddr(D.steps)+'?x',DASH], step:'5g', steps:['5g',...new Set(D.steps.map(t=>t.id.split('.')[0]))], lines:[[D.E.t+' = '+S(D.E.v),'']],
        ask:'What is x?', right, opts:shuffle([right,...wrong]), lead:'x is '+right+'. ',
        why:'Make the same change to both sides, undoing the last change first: '+undo.join('; ')+'. So x = '+right+'.'}; }
    const E0=P.isOff(s)&&(c.kind==='add'||c.kind==='times')?{t:String(c.a),v:c.a,p:3}:startOf(c); if(!E0) continue; /* a seed from a rung switched off lends its number only */
    const D=drawSteps(P.ops,E0,1+rnd(deep),!neg); if(!D.steps.length) continue;
    const index='w:'+s.id+c.ix+'.'+stepAddr(D.steps); if(used[index]) continue;
    const E=D.E, alts=[flat(E.t)];
    D.steps.forEach((st,i)=>{ const swap=st.id==='4f.plus'?'4g.by':st.id==='4g.by'?'4f.plus':st.id==='5b.minus'?'4f.plus':null;
      if(swap) alts.push(chain(E0,D.steps.map((x,k)=>k===i?{id:swap,n:x.n}:x)).v);
      if(st.id==='4g.squared'){ const before=chain(E0,D.steps.slice(0,i)); alts.push(chain({t:'',v:before.v*2,p:3},D.steps.slice(i+1)).v); }
      if(st.id==='5e.negated'){ const before=chain(E0,D.steps.slice(0,i)); alts.push(chain({t:'',v:before.v,p:3},D.steps.slice(i+1)).v); }
      if(st.n!=null) alts.push(chain(E0,D.steps.map((x,k)=>k===i?{id:x.id,n:x.n+1}:x)).v); });
    alts.push(E.v+1,E.v-1,E.v+2,E.v+10);
    const wrong=[...new Set(alts.filter(v=>v!==null&&v!==E.v&&Math.abs(v)<=9999&&(neg||v>=0)).map(S))].slice(0,3); if(wrong.length<3) continue;
    const work=[]; let e=E0; if(E0.p<3) work.push(E0.t+' = '+S(E0.v));
    D.steps.forEach(st=>{ const nx=apply(st.id,{t:I(e.v),v:e.v,p:3},st.n); work.push(nx.t+' = '+S(nx.v)); e=nx; });
    return {index, a3:[s.id+c.ix,stepAddr(D.steps),DASH], step:s.step, steps:[...new Set([s.step,...D.steps.map(t=>t.id.split('.')[0])])], lines:[[E.t+' = ▢','']],
      ask:'What number fills the box ▢?', right:S(E.v), opts:shuffle([S(E.v),...wrong]), lead:'The box holds '+S(E.v)+'. ',
      why:'Work from the inside out: '+work.join('; ')+'.'}; }
  if(wq.length) return poolQ(wq,used,last);
  return null; }

/* --- The bank: terms and units of measure for the word problems. No person is named; the places are the ladder's own. --- */
const BANK=[
  {id:'salinas.lettuce',step:'4f',u1:['crate','crates'],u2:['head','heads'],start:'A packing shed in Salinas fills {n} {u1} of lettuce before noon.',plus:'It fills {n} more {u1} after noon.',minus:'It sends {n} {u1} back as too small.',by:'Each crate holds {n} {u2}.',plus2:'It adds {n} loose {u2} from the last row.',minus2:'It sets {n} {u2} aside as bruised.'},
  {id:'wenatchee.apples',step:'4f',u1:['bin','bins'],u2:['box','boxes'],start:'An orchard near Wenatchee picks {n} {u1} of apples on the first day.',plus:'It picks {n} more {u1} on the second day.',minus:'It holds {n} {u1} back for cider.',by:'Each bin fills {n} {u2}.',plus2:'It adds {n} {u2} of windfalls.',minus2:'It gives {n} {u2} to the pickers.'},
  {id:'astoria.salmon',step:'4f',u1:['tote','totes'],u2:['can','cans'],start:'A cannery in Astoria takes in {n} {u1} of salmon from the first boat.',plus:'It takes in {n} more {u1} from the second boat.',minus:'It sends {n} {u1} on fresh.',by:'Each tote fills {n} {u2}.',plus2:'It adds {n} {u2} left from the day before.',minus2:'It throws out {n} {u2} that fail the seal check.'},
  {id:'tillamook.cheese',step:'4f',u1:['rack','racks'],u2:['wheel','wheels'],start:'A creamery in Tillamook sets {n} {u1} of cheese to age.',plus:'It sets {n} more {u1} the next day.',minus:'It sells {n} {u1} young.',by:'Each rack holds {n} {u2}.',plus2:'It adds {n} {u2} from the floor.',minus2:'It cuts {n} {u2} for samples.'},
  {id:'skagit.bulbs',step:'4f',u1:['row','rows'],u2:['bulb','bulbs'],start:'A farm in the Skagit Valley plants {n} {u1} of tulips in the morning.',plus:'It plants {n} more {u1} in the afternoon.',minus:'It loses {n} {u1} to the rain.',by:'Each row takes {n} {u2}.',plus2:'It plants {n} spare {u2} by the gate.',minus2:'It loses {n} {u2} to voles.'},
  {id:'hoodriver.pears',step:'4f',u1:['bin','bins'],u2:['gallon','gallons'],start:'A press in Hood River crushes {n} {u1} of pears before noon.',plus:'It crushes {n} more {u1} after noon.',minus:null,by:'Each bin gives {n} {u2} of juice.',plus2:'It adds {n} {u2} left in the tank.',minus2:'It draws off {n} {u2} for tasting.'},
  {id:'columbia.barge',step:'5j',u1:['hour','hours'],u2:['mile','miles'],start:'A barge on the Columbia runs for {n} {u1} on the first day.',plus:'It runs for {n} more {u1} on the second day.',minus:'It must take off {n} {u1} spent waiting at a lock.',by:'It makes {n} {u2} each hour.',plus2:'It is then towed {n} more {u2}.',minus2:'It then drifts back {n} {u2}.'},
  {id:'modesto.almonds',step:'5j',u1:['sack','sacks'],u2:['pound','pounds'],start:'A huller near Modesto takes in {n} {u1} of almonds from one orchard.',plus:'It takes in {n} more {u1} from a second orchard.',minus:'It turns away {n} {u1} as wet.',by:'Each sack weighs {n} {u2}.',plus2:'It adds {n} {u2} of floor sweepings.',minus2:'It takes off {n} {u2} of hulls.'}
];
BANK.forEach(B=>{ B.open=()=>measured(B.step); });
const unit=(u,n)=>Math.abs(n)===1?u[0]:u[1];
const say=(B,key,n)=>B[key].replace('{n}',n).replace('{u1}',unit(B.u1,n)).replace('{u2}',unit(B.u2,n));
function wordQ(P,used){
  const seeds=P.seeds.filter(s=>['add','times','num'].includes(SKIND[s.id])), ops=P.ops.filter(O=>O.word); if(!seeds.length||!ops.length||!P.bank.length) return null;
  for(let tries=0;tries<160;tries++){
    const s=pick(seeds), c=s.make(), B=pick(P.bank), story=[], steps=[], nums=[c.a], told={}; let two=false, E={t:String(c.a),v:c.a,p:3};
    if(c.a<1) continue; story.push(say(B,'start',c.a));
    const put=(id,n)=>{ const key=(id==='4f.plus'?'plus':id==='5b.minus'?'minus':'by')+(two&&id!=='4g.by'?'2':''); if(!B[key]||told[key]) return false; /* each sentence of the bank is told once in a story */
      if(id==='4g.by'){ if(two||n<2) return false; } if(id==='5b.minus'&&(n<1||n>=E.v)) return false; if(id==='4f.plus'&&n<1) return false;
      const N=apply(id,E,n); if(N.v>999) return false; told[key]=1; story.push(say(B,key,n)); steps.push({id,n}); nums.push(n); E=N; if(id==='4g.by') two=true; return true; };
    const lend=P.isOff(s)||(c.kind==='add'&&!ops.some(O=>O.id==='4f.plus'))||(c.kind==='times'&&!ops.some(O=>O.id==='4g.by'));
    if(!lend&&c.kind==='add'&&!put('4f.plus',c.b)) continue;
    if(!lend&&c.kind==='times'&&!put('4g.by',c.b)) continue;
    const own=steps.length; /* the seed's own change, when it brings one */
    const more=1+rnd(Math.min(2,ops.length)); /* one or two links past the seed, as far as the bank's sentences allow */
    for(let i=0,g=0;i<more&&g<12;g++){ const O=pick(ops), n=O.id==='4g.by'?2+rnd(8):1+rnd(Math.max(2,Math.min(top(),E.v-1))); if(put(O.id,n)) i++; }
    if(!steps.length) continue;
    const U=two?B.u2:B.u1, opt=(t,v,u)=>t+' = '+v+' '+unit(u,v), right=opt(E.t,E.v,U), wrong=[];
    const start=n=>({t:String(n),v:n,p:3}), take=(X,u)=>{ const o=opt(X.t,X.v,u||U); if(X.v>=0&&X.v<=9999&&(X.v!==E.v||u)&&o!==right&&!wrong.includes(o)) wrong.push(o); };
    const f=flat(E.t); if(f!==null&&f!==E.v) take({t:E.t.replace(/[()]/g,''),v:f});
    const known=OPS.filter(O=>O.word&&O.open()).map(O=>O.id); /* a wrong line uses only the changes the learner has met */
    shuffle(steps.map((x,i)=>i)).forEach(i=>shuffle(known.filter(id=>id!==steps[i].id)).forEach(swap=>take(chain(start(c.a),steps.map((x,k)=>k===i?{id:swap,n:x.n}:x)))));
    for(let i=0;i<nums.length;i++) for(let j=i+1;j<nums.length;j++) if(nums[i]!==nums[j]){ const m=nums.slice(); [m[i],m[j]]=[m[j],m[i]]; take(chain(start(m[0]),steps.map((x,k)=>({id:x.id,n:m[k+1]})))); }
    for(let i=0;i<nums.length;i++) for(let j=0;j<nums.length;j++) if(i!==j&&nums[i]!==nums[j]){ const m=nums.slice(); m[j]=m[i]; take(chain(start(m[0]),steps.map((x,k)=>({id:x.id,n:m[k+1]})))); } /* one input attached twice */
    if(two) wrong.splice(Math.min(2,wrong.length),0,opt(E.t,E.v,B.u1));
    const w=[...new Set(wrong)].filter(o=>o!==right).slice(0,3); if(w.length<2) continue;
    const index='d:'+s.id+c.ix+'.'+stepAddr(steps.slice(own))+'.'+B.id; if(used[index]) continue;
    return {index, a3:[s.id+c.ix,stepAddr(steps.slice(own)),B.id], step:s.step, steps:[...new Set([s.step,...steps.map(t=>t.id.split('.')[0]),B.step])], story:story.join(' '), lines:[],
      ask:'Which line attaches the numbers correctly and gives the output?', right, opts:shuffle([right,...w]), lead:'It is '+right+'. ',
      why:'Each sentence makes one change, in order: '+E.t+' = '+E.v+'.'+(two?' The count starts in '+B.u1[1]+' and is in '+B.u2[1]+' after the sentence that says how many '+B.u2[1]+' each '+B.u1[0]+' stands for.':' The count stays in '+B.u1[1]+'.')}; }
  return null; }

/* --- Comprehension: the crosswalk cards, the techniques, the standing questions, the sight questions, and which technique licenses a line. --- */
function poolQ(qps,used,last){
  for(let tries=0;tries<60;tries++){ const Q=pick(qps), x=Q.make(); if(!x||used[x.index]) continue;
    if(x.opts.length>2&&last.length>=2&&last[0]===x.right&&last[1]===x.right) continue;
    if(x.opts.filter(o=>o===x.right).length!==1) continue;
    return Object.assign({a3:[x.index.slice(2),DASH,DASH], step:Q.step, lead:'The answer is '+x.right+'. '}, x); }
  return null; }
function licQ(P,used,last){ if(!P.seeds.length||!P.links.length) return null;
  const rights=new Set(P.links.map(l=>l.name));
  for(let tries=0;tries<120;tries++){ const s=pick(P.seeds), c=s.make();
    if(c.kind==='names'&&[c.l,c.r,c.m].includes(c.n)) continue;
    const fit=P.links.filter(L=>L.kinds.includes(c.kind)); if(!fit.length) continue; const L=pick(fit);
    if(rights.size>1&&tries<100&&last.length>=2&&last[0]===L.name&&last[1]===L.name) continue;
    const out=L.act(c), index='link:'+L.id+'(nest '+s.id+c.ix+')'; if(used[index]) continue;
    const lic=licensers(out.lines); if(lic.length!==1||lic[0]!==L.name) continue;
    const others=shuffle(P.openL.filter(x=>x.name!==L.name).map(x=>x.name)).slice(0,2), wrong=others.concat(shuffle(AX.slice())).slice(0,3);
    const names=c.kind==='names';
    return {index, a3:[names?s.id:s.id+c.ix,L.id,names?'places'+c.ix:DASH], step:L.step, lines:out.lines, ask:'Which technique licenses the line marked ?', right:L.name, opts:shuffle([L.name,...wrong]), why:out.why}; }
  return null; }
function readQ(P,used,last){
  const rq=P.qps.filter(Q=>!WORKQ.includes(Q.id));
  const card=()=>{ for(let t=0;t<40&&P.cps.length;t++){ const C=pick(P.cps), x=C.make(); if(!x||used[x.index]) continue; return Object.assign({a3:[x.addr,C.id,DASH]},x); } return null; };
  const ways=[[card,P.cps.length?4:0],[()=>rq.length?poolQ(rq,used,last):null,rq.length?3:0],[()=>licQ(P,used,last),P.links.length&&P.seeds.length?3:0]].filter(w=>w[1]);
  while(ways.length){ let r=Math.random()*ways.reduce((a,w)=>a+w[1],0), i=0; while(i<ways.length-1&&r>=ways[i][1]){ r-=ways[i][1]; i++; } const q=ways[i][0](); if(q) return q; ways.splice(i,1); }
  return null; }
const MAKE={proof:proofQ, work:workQ, word:wordQ, read:readQ};

const toggled=()=>[...LINKS,...QP,...CARDP,...OPS];
function avail(mode){ const oS=SEEDS.filter(s=>s.open()), kinds=oS.map(s=>SKIND[s.id]), oO=OPS.filter(o=>o.open());
  if(mode==='proof') return oS.length>0&&LINKS.filter(l=>l.open()).length>=2;
  if(mode==='work') return (oO.length>0&&kinds.some(k=>['add','times','num','int'].includes(k)))||QP.some(Q=>Q.open()&&WORKQ.includes(Q.id));
  if(mode==='word') return BANK.some(b=>b.open())&&oO.some(o=>o.word)&&kinds.some(k=>['add','times','num'].includes(k));
  return QP.some(Q=>Q.open()&&!WORKQ.includes(Q.id))||CARDP.some(C=>C.open())||(oS.length>0&&LINKS.some(l=>l.open())); }
const OPENS={proof:'0b',work:'4f',word:'4f',read:'0a'};
function modeNow(){ const m=(get('rand:mode',null)||{}).m||'proof'; /* kept as an object: the record hands a bare word back unquoted */ if(MODES.some(M=>M.id===m)&&avail(m)) return m; const f=MODES.find(M=>avail(M.id)); return f?f.id:m; }

function build(mode){
  mode=mode||modeNow();
  const off=get('rand:off',{}), isOff=P=>!!off['rung:'+rungOf(P.step)];
  if(![...SEEDS,...toggled(),...BANK].some(P=>P.open())) return {closed:'The laundry opens with the crosswalk of the first step you reach, and its technique pools open as you pass measuring sticks.'};
  if(!avail(mode)) return {closed:mode==='read'?'Comprehension opens with the crosswalk of the first step you reach.':MODES.find(M=>M.id===mode).label+' opens when you pass the measuring stick of '+OPENS[mode]+'.'};
  const used=get('rand:seen',{}), last=get('rand:last',[]), st=strayDue();
  const anyOn=toggled().some(P=>P.open()&&!isOff(P)), anyOff=toggled().some(P=>P.open()&&isOff(P));
  if(!anyOn) return {closed:'Every rung is switched off below. Switch one on.'};
  const passes=(st.due>st.served&&anyOff)?[true,false]:[false];
  for(const stray of passes){
    const use=P=>P.open()&&(stray?isOff(P):!isOff(P));
    const P={isOff, seeds:SEEDS.filter(s=>s.open()), bank:BANK.filter(b=>b.open()), links:LINKS.filter(use), qps:QP.filter(use), ops:OPS.filter(use),
      cps:CARDP.filter(C=>use(C)&&C.ready()), openL:LINKS.filter(l=>l.open())};
    const q=MAKE[mode](P,used,last); if(q){ q.stray=stray; q.mode=mode; return q; } }
  return {closed:'The rungs switched on hold no fresh question of this kind. Switch on another rung below, or pick another kind above. Each step you pass adds its pools.'};
}

/* Pools are switched by rung; inside a rung each pool unlocks with its step. */
function picker(q){
  const off=get('rand:off',{}), by={};
  const src=P=>P.kind==='cards'?'crosswalk':P.kind==='sq'?'standing questions':P.kind==='tech'?'techniques':OPS.includes(P)?'operations':BANK.includes(P)?'bank':SEEDS.includes(P)?'seeds':LINKS.includes(P)?'links':'questions';
  [...SEEDS,...toggled(),...BANK].filter(P=>P.open()).forEach(P=>{ const r=rungOf(P.step), b=by[r]=by[r]||{steps:new Set(),src:new Set()}; b.steps.add(P.step); b.src.add(src(P)); });
  const M=window.LADDER_CARDMAP||{}, stemOf=t=>{ for(const s in M) if(M[s][0]===t) return s; return STEPS[t]?STEPS[t][0]:t; };
  const rows=Object.keys(by).map(Number).sort((a,b)=>a-b).map(r=>{ const steps=[...by[r].steps].sort((x,y)=>stemOf(x)<stemOf(y)?-1:1);
    return '<label class="rzp"><input type="checkbox" data-id="rung:'+r+'"'+(off['rung:'+r]?'':' checked')+'> rung '+r+' <span class="rzsrc">'+esc(steps.join(' '))+' · '+[...by[r].src].join(', ')+'</span></label>'; }).join('');
  return '<details class="rzpick"'+(q.closed?' open':'')+'><summary>pools, one switch to a rung</summary>'+(rows||'<p class="dnote">None open yet.</p>')+'</details>';
}

function style(){ if(document.getElementById('rz4css')) return; const s=document.createElement('style'); s.id='rz4css';
  s.textContent='.rzmodes{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:0 0 10px}.rzmode{padding:8px 6px;border-radius:8px;border:1px solid var(--line,#ccc);background:transparent;color:inherit;font:inherit;font-size:.92rem;cursor:pointer;min-width:0}.rzmode[aria-pressed="true"]{border-color:currentColor;box-shadow:inset 0 0 0 1px currentColor;font-weight:600}.rzmode:disabled{opacity:.45;cursor:default}.rzmode small{display:block;font-size:.7rem;opacity:.75;font-weight:400}.rzstory{margin:10px 0;line-height:1.55}.rzl.rzs{grid-template-columns:1.6em minmax(0,1fr)}.rzl.rzs .rzw{grid-column:2;font-size:.8em}.rzt{overflow-wrap:anywhere}.rzaddr{font-family:var(--mono,monospace);font-size:.72rem;color:var(--muted,#777);margin-top:14px}.rzaddr .rzseed{overflow-wrap:anywhere;text-align:left}';
  document.head.appendChild(s); }

function render(box){
  const S=window.LadderStick; style();
  if((!window.LADDER_CARDMAP||!window.LADDER_SQHAS)&&S&&!render.maps){ render.maps=1; box.innerHTML='<p class="dnote">Gathering the pools…</p>'; Promise.all([S.maps(),load('sq/has.js')]).then(()=>Promise.all((window.LADDER_SQHAS||[]).map(st=>load('sq/'+st+'.js')))).then(()=>render(box)); return; }
  cardPools(); const wantD=CARDP.filter(P=>P.open()&&!P.ready()&&!deckOnce[P.file]);
  if(wantD.length){ box.innerHTML='<p class="dnote">Gathering the pools…</p>'; needDecks().then(()=>render(box)); return; }
  const mode=modeNow(), q=build(mode), right=get('rand:right',0), MD=MODES.find(M=>M.id===mode);
  if(window.MathKeys){ const off=get('rand:off',{}), K=new Set(); [...SEEDS,...LINKS,...QP].filter(P=>P.open()&&!off['rung:'+rungOf(P.step)]).forEach(P=>(P.keys||[]).forEach(k=>K.add(k))); MathKeys.limit(K,'the laundry’s chosen pools'); }
  if(q.closed&&![...SEEDS,...toggled(),...BANK].some(P=>P.open())){ box.innerHTML='<p class="dnote">'+esc(q.closed)+'</p>'; return; }
  const sw='<div class="rzmodes" role="group" aria-label="kind of question">'+MODES.map(M=>{ const ok=avail(M.id); return '<button type="button" class="rzmode" data-m="'+M.id+'" aria-pressed="'+(M.id===mode)+'"'+(ok?'':' disabled')+'>'+esc(M.label)+(ok?'':'<small>opens at '+OPENS[M.id]+'</small>')+'</button>'; }).join('')+'</div>';
  const wire=()=>{ box.querySelectorAll('.rzpick input').forEach(i=>i.onchange=()=>{ const o=get('rand:off',{}); if(i.checked) delete o[i.dataset.id]; else o[i.dataset.id]=1; put('rand:off',o); render(box); });
    box.querySelectorAll('.rzmode').forEach(b=>b.onclick=()=>{ put('rand:mode',{m:b.dataset.m}); render(box); }); };
  if(q.closed){ box.innerHTML=sw+'<p class="dnote">'+esc(q.closed)+'</p>'+picker(q); wire(); return; }
  const addr=q.a3.join(' . ');
  box.innerHTML=sw+'<p class="dnote">'+esc(MD.say)+' A question never comes twice. Right answers so far: <b>'+right+'</b>.</p>'
    +(q.story?'<p class="rzstory">'+esc(q.story)+'</p>':'')
    +(q.lines.length?'<div class="rzlines">'+q.lines.map(([t,w],i)=>'<div class="rzl'+(q.stack?' rzs':'')+'"><span class="rzn">'+(i+1)+'</span><span class="rzt">'+esc(t)+'</span><span class="rzw">'+(w===null?'?':esc(w))+'</span></div>').join('')+'</div>':'')
    +'<p class="rzask">'+esc(q.ask)+'</p><div class="rzopts">'+q.opts.map(o=>'<button type="button" class="rzo'+(q.html?' rzg':'')+'" data-v="'+esc(o).replace(/"/g,'&quot;')+'"'+(q.html?' aria-label="'+esc(o)+'">'+q.html[o]:'>'+esc(o))+'</button>').join('')+'</div>'
    +'<p class="rzwhy" hidden></p><p><button type="button" class="dlink rznext">another question</button></p>'
    +'<p class="rzaddr">seed . link . bank<br><button type="button" class="rzseed" title="report this question">'+esc(addr)+'</button><br>If this question does not make sense, tap its address to report it.</p>'+picker(q);
  wire();
  if(/\$[^$]+\$/.test(q.ask)&&window.katex){ const el=box.querySelector('.rzask'); el.innerHTML=''; String(q.ask).split(/(\$[^$]+\$)/).forEach(t=>{ if(/^\$[^$]+\$$/.test(t)){ const sp=document.createElement('span'); try{ katex.render(t.slice(1,-1),sp,{throwOnError:false}); }catch(e){ sp.textContent=t; } el.appendChild(sp); } else el.appendChild(document.createTextNode(t)); }); }
  box.querySelector('.rzseed').onclick=()=>{ if(window.__report) window.__report({kind:'laundry',where:'seed.link.bank '+addr+' ('+MD.label+')',text:(q.story?q.story+' | ':'')+q.lines.map(l=>l[0]).join(' / ')+' | '+q.ask+' | offered: '+q.opts.join(' ; ')}); };
  const why=box.querySelector('.rzwhy'); let done=false;
  box.querySelectorAll('.rzo').forEach(b=>b.onclick=()=>{ if(done) return; done=true;
    const ok=b.dataset.v===q.right;
    box.querySelectorAll('.rzo').forEach(x=>{ x.disabled=true; if(x.dataset.v===q.right) x.classList.add('ok'); });
    if(!ok) b.classList.add('no');
    const u=get('rand:seen',{}); u[q.index]=Date.now(); put('rand:seen',u);
    if(q.index.startsWith('link:')||q.index.startsWith('q:')) put('rand:last',[q.right].concat(get('rand:last',[])).slice(0,2));
    if(q.stray){ const s=strayDue(); s.served++; put('rand:strays',s); const lg=get('rand:straylog',[]); lg.push({day:s.day,index:q.index}); put('rand:straylog',lg); }
    if(ok) put('rand:right',get('rand:right',0)+1);
    const ax=!ok&&AX.includes(b.dataset.v)?' An axiom stands under every technique above it; the question asks for the technique built over it.':'';
    why.hidden=false; why.innerHTML=esc((ok?'Right. ':(q.lead||'The line holds by '+q.right+'. '))+q.why+ax)+' Built at '+(q.steps||[q.step]).map(stepLink).join(', ')+'.'; });
  box.querySelector('.rznext').onclick=()=>render(box);
}

/* 0.3.3 (Andrew 21:07): the laundry draws from three sets only, each folded into the step it came from:
   the crosswalk (its cards, opening when you reach the step), the techniques the measuring stick draws on (the claim,
   technique and question pools and the step's techniques, opening when you pass its stick), and the standing questions'
   trees (their considerations, as links, opening when you finish a tree; debates add nothing). */
SEEDS.forEach(S=>{ S.open=()=>measured(S.step); });
LINKS.forEach(L=>{ L.open=()=>measured(L.step); });
QP.forEach(P=>{ P.open=()=>measured(P.step); });
const CARDP=[];
const T=()=>window.LADDER_TECH||{}, sqDone=id=>{ const r=get('sq:'+id,null); return !!(r&&r.done); };
function cardPools(){ const M=window.LADDER_CARDMAP||{}, H=window.LADDER_SQHAS||[]; CARDP.length=0;
  for(const st in M){ const [tag,deck,n]=M[st];
    if(deck&&n) CARDP.push({id:'cards.'+tag, step:tag, stem:st, kind:'cards', file:'cards/'+deck+'.js', label:'crosswalk', open:()=>has(tag),
      ready:()=>!!(window.LADDER_CARDS||{})[tag], make(){ return cardQ(this); }});
    CARDP.push({id:'tech.'+tag, step:tag, stem:st, kind:'tech', file:'tech/'+st.slice(0,3)+'.js', label:'techniques', open:()=>measured(tag),
      ready:()=>!!(T()[st]&&T()[st].length), make(){ return techQ(this); }});
    if(H.includes(st)) CARDP.push({id:'sq.'+tag, step:tag, stem:st, kind:'sq', file:'sq/'+st+'.js', label:'standing questions', open(){ const S=(window.LADDER_SQ||{}); return Object.keys(S).some(id=>id.split('.')[0]===tag&&S[id].kind!=='debate'&&sqDone(id)); },
      ready:()=>!!window.LADDER_SQ, make(){ return sqQ(this); }}); }
  return CARDP; }
const deckOnce={};
const load=f=>deckOnce[f]||(deckOnce[f]=new Promise(res=>{ const sc=document.createElement('script'); sc.src=f; sc.onload=sc.onerror=()=>res(); document.head.appendChild(sc); }));
function needDecks(){ const fs=[...new Set(CARDP.filter(P=>P.open()&&!P.ready()).map(P=>P.file))].filter(f=>!deckOnce[f]); return Promise.all(fs.map(load)); }
function cardQ(P){ const C=(window.LADDER_CARDS||{})[P.step]||[]; if(!C.length) return null; const k=rnd(C.length), c=C[k]; if(!c.w||!c.w.length) return null;
  return {index:'c:'+P.step+'#'+k, addr:P.step+'#'+k, stray:false, step:P.step, lines:[], ask:c.q, right:c.a, opts:shuffle([c.a].concat(c.w.slice(0,3))), why:c.why||'', lead:'It is '+c.a+'. '}; }
function techQ(P){ const S=window.LadderStick; if(!S||!S.techQs) return null; const own=T()[P.stem]||[], all=[]; Object.keys(T()).forEach(k=>{ if(k.slice(0,3)===P.stem.slice(0,3)) T()[k].forEach(x=>all.push(x)); });
  const qs=S.techQs(P.stem,own,all); if(!qs.length) return null; const c=pick(qs); const lines=String(c.q).split('\n');
  return {index:c.id, addr:c.id.slice(2), stray:false, step:P.step, lines:lines.length>1?[[lines.slice(1).join(' '),null]]:[], ask:lines[0], right:c.a, opts:shuffle([c.a].concat(c.w.slice(0,3))), why:c.why||'', lead:''}; }
function sqQ(P){ const S=window.LADDER_SQ||{}, ids=Object.keys(S).filter(id=>id.split('.')[0]===P.step&&S[id].kind!=='debate'&&sqDone(id)); if(!ids.length) return null;
  const id=pick(ids), tr=S[id], ns=Object.keys(tr.n).filter(k=>(tr.n[k].c||[]).length>1); if(!ns.length) return null; const k=pick(ns), N=tr.n[k];
  const r=N.c.find(c=>c.go||c.win); if(!r) return null;
  return {index:'s:'+id+'#'+k, addr:id+'#'+k, stray:false, step:P.step, lines:[], ask:N.t, right:r.t, opts:shuffle(N.c.map(c=>c.t)).slice(0,4), why:r.why||'', lead:'The path goes by: '+r.t+'. '}; }
window.LadderRandomizer={render, build, parseNames, licensers, LINKS, SEEDS, QP, measured, cardPools, CARDP, MODES, OPS, BANK, holds, mutations, avail, MAKE};
const pane=document.getElementById('dp-rand'); if(pane){ let box=pane.querySelector('.rzbox'); if(!box){ box=document.createElement('div'); box.className='rzbox'; pane.innerHTML=''; pane.appendChild(box); } render(box); }
})();
