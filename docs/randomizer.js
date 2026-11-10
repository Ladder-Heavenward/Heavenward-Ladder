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
  {id:'read',label:'Understanding',say:'Know it by sight.'}];
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
function proofQ(P,used,last){ const pq=P.qps.filter(Q=>qmode(Q)==='proof'), pool=()=>pq.length?poolQ(pq,used,last||[]):null;
  if(pq.length&&Math.random()<Math.min(0.5,0.15*pq.length)){ const q=pool(); if(q) return q; }
  return (P.seeds.length?proofQ0(P,used):null)||pool(); }
function proofQ0(P,used){
  for(let tries=0;tries<120;tries++){
    const s=pick(P.seeds), c=s.make(), W=world(c);
    if(c.kind==='say') continue;
    if(TERMK.includes(c.kind)){ const q=chainProofQ(P,used,s,c); if(q) return q; continue; }
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
  const seeds=P.seeds.filter(s=>['add','times','num','int'].includes(SKIND[s.id])), wq=P.qps.filter(Q=>qmode(Q)==='work');
  const canChain=seeds.length&&P.ops.length;
  const tseeds=P.seeds.filter(s=>TERMK.includes(SKIND[s.id])&&chainLinks(P,SKIND[s.id]).length);
  if(tseeds.length&&(Math.random()<0.4||!(canChain||wq.length))) for(let tries=0;tries<30;tries++){ const s=pick(tseeds), q=chainWorkQ(P,used,s,s.make()); if(q) return q; }
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
function wordQ(P,used,last){ const wq=P.qps.filter(Q=>qmode(Q)==='word'), c=()=>wq.length?poolQ(wq,used,last||[]):null, a=()=>countQ(P,used), b=()=>sayQ(P,used);
  const order=shuffle([a,b,c].concat(wq.length>2?[c]:[])); for(const f of order){ const q=f(); if(q) return q; } return null; }
function countQ(P,used){
  const seeds=P.seeds.filter(s=>['add','times','num'].includes(SKIND[s.id])), ops=P.ops.filter(O=>O.word), cbank=P.bank.filter(B=>!B.kind); if(!seeds.length||!ops.length||!cbank.length) return null;
  for(let tries=0;tries<160;tries++){
    const s=pick(seeds), c=s.make(), B=pick(cbank), story=[], steps=[], nums=[c.a], told={}; let two=false, E={t:String(c.a),v:c.a,p:3};
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

/* --- Understanding (was Comprehension until 2026-11-10 19:46Z): the crosswalk cards, the techniques, the standing questions, the sight questions, and which technique licenses a line. --- */
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
    const out=L.act(c); if(!out) continue; const index='link:'+L.id+'(nest '+s.id+c.ix+')'+(c.t||L.rule?':'+out.lines.map(x=>x[0]).join('/'):''); if(used[index]) continue;
    const lic=licensers(out.lines); if(lic.length!==1||lic[0]!==L.name) continue;
    const near=shuffle(P.openL.filter(x=>x.name!==L.name&&x.kinds.some(k=>L.kinds.includes(k))).map(x=>x.name)), far=shuffle(P.openL.filter(x=>x.name!==L.name).map(x=>x.name));
    const others=[...new Set(near.concat(far))].slice(0,c.kind==='prop'||c.kind==='set'?3:2), wrong=others.concat(shuffle(AX.slice())).slice(0,3);
    const names=c.kind==='names';
    return {index, a3:[names?s.id:s.id+c.ix,L.id,names?'places'+c.ix:DASH], step:L.step, stack:!!(c.t||L.rule), lines:out.lines, ask:'Which technique licenses the line marked ?', right:L.name, opts:shuffle([L.name,...wrong]), why:out.why}; }
  return null; }
function readQ(P,used,last){
  const rq=P.qps.filter(Q=>qmode(Q)==='read');
  const card=()=>{ for(let t=0;t<40&&P.cps.length;t++){ const C=pick(P.cps), x=C.make(); if(!x||used[x.index]) continue; return Object.assign({a3:[x.addr,C.id,DASH]},x); } return null; };
  const ways=[[card,P.cps.length?4:0],[()=>rq.length?poolQ(rq,used,last):null,rq.length?3:0],[()=>licQ(P,used,last),P.links.length&&P.seeds.length?3:0]].filter(w=>w[1]);
  while(ways.length){ let r=Math.random()*ways.reduce((a,w)=>a+w[1],0), i=0; while(i<ways.length-1&&r>=ways[i][1]){ r-=ways[i][1]; i++; } const q=ways[i][0](); if(q) return q; ways.splice(i,1); }
  return null; }
/* ===== Laundry 5 (Andrew 2026-11-10 19:46Z: "Go ahead and do those floor 1 pools"; 19:49Z: "after floor 1 continue filling in pools by floor") =====
   Terms: one reader and writer for statements (¬ ∧ ∨ ⇒ ⇔ ⊤ ⊥) and for sets (∪ ∩ ∖ ∅). A rewrite technique is a pair of patterns;
   a chain is a seed rewritten link by link, each line citing its technique. A line is checked by its column: every way its letters can come out. */
const TBIN='∧∨⇒⇔⊕∪∩∖', TMETA='ABC';
function tparse(s){ s=String(s); let i=0;
  const ws=()=>{ while(s[i]===' ') i++; };
  const unary=()=>{ ws(); const ch=s[i]; if(ch===undefined) throw new Error('term');
    if(ch==='¬'){ i++; return {o:'¬',a:unary()}; }
    if(ch==='('){ i++; const e=expr(); ws(); if(s[i]!==')') throw new Error('term'); i++; return e; }
    if(!/^[A-Za-z⊤⊥∅]$/.test(ch)) throw new Error('term'); i++; return {v:ch}; };
  function expr(){ const a=unary(); ws(); const o=s[i]; if(o!==undefined&&TBIN.indexOf(o)>=0){ i++; const b=unary(); return {o,a,b}; } return a; }
  const e=expr(); ws(); if(i!==s.length) throw new Error('term'); return e; }
const tsub=t=>t.o&&t.o!=='¬'?'('+tshow(t)+')':tshow(t);
function tshow(t){ return t.v?t.v:t.o==='¬'?'¬'+tsub(t.a):tsub(t.a)+' '+t.o+' '+tsub(t.b); }
function tmatch(p,t,env){ if(p.v){ if(TMETA.indexOf(p.v)>=0){ if(env[p.v]) return tshow(env[p.v])===tshow(t); env[p.v]=t; return true; } return t.v===p.v; }
  if(p.o!==t.o) return false; return tmatch(p.a,t.a,env)&&(p.o==='¬'||tmatch(p.b,t.b,env)); }
const tinst=(p,env)=>p.v?(env[p.v]||p):p.o==='¬'?{o:'¬',a:tinst(p.a,env)}:{o:p.o,a:tinst(p.a,env),b:tinst(p.b,env)};
const tleaves=t=>t.v?[t.v]:t.o==='¬'?tleaves(t.a):tleaves(t.a).concat(tleaves(t.b));
const tvars=p=>[...new Set(tleaves(p).filter(v=>TMETA.indexOf(v)>=0))];
const tatoms=t=>[...new Set(tleaves(t).filter(v=>'⊤⊥∅'.indexOf(v)<0))];
function trew(t,rule){ const out=[], seen={}, self=tshow(t);
  const walk=(n,put)=>{ rule.pairs.forEach(([l,r])=>[[l,r,'→'],[r,l,'←']].forEach(([from,to,dir])=>{ const fv=tvars(from); if(!tvars(to).every(v=>fv.includes(v))) return;
      const env={}; if(!tmatch(from,n,env)) return; const res=put(tinst(to,env)), key=tshow(res); if(key===self||seen[key]) return; seen[key]=1; out.push({t:res,dir}); }));
    if(n.o==='¬') walk(n.a,x=>put({o:'¬',a:x})); else if(n.o){ walk(n.a,x=>put({o:n.o,a:x,b:n.b})); walk(n.b,x=>put({o:n.o,a:n.a,b:x})); } };
  walk(t,x=>x); return out; }
function tval(t,env){ if(t.v) return t.v==='⊤'?true:(t.v==='⊥'||t.v==='∅')?false:!!env[t.v];
  if(t.o==='¬') return !tval(t.a,env); const a=tval(t.a,env), b=tval(t.b,env);
  return t.o==='∧'||t.o==='∩'?a&&b:t.o==='∨'||t.o==='∪'?a||b:t.o==='⇒'?!a||b:t.o==='⇔'?a===b:t.o==='⊕'?a!==b:a&&!b; }
function trows(ts){ const L=[...new Set([].concat(...ts.map(tatoms)))].sort(), rows=[]; for(let m=0;m<(1<<L.length);m++){ const env={}; L.forEach((v,i)=>env[v]=!(m&(1<<(L.length-1-i)))); rows.push(env); } return {L,rows}; }
const tequiv=(a,b)=>trows([a,b]).rows.every(env=>tval(a,env)===tval(b,env));
/* the row that tells two lines apart, said the way the kind says it */
function tapart(a,b,kind){ const R=trows([a,b]), env=R.rows.find(e=>tval(a,e)!==tval(b,e)); if(!env) return '';
  return kind==='set'?'a thing that is '+R.L.map(v=>(env[v]?'in ':'not in ')+v).join(' and ')+' is in one and not in the other':'in the row where '+R.L.map(v=>v+' is '+(env[v]?'T':'F')).join(', ')+' they give different marks'; }
/* the slips: one mark turned into its neighbour, a not dropped or added, the sides of an if or a less turned */
function tslips(t){ const out=[]; const flip={'∧':'∨','∨':'∧','∪':'∩','∩':'∪','⇔':'⇒'};
  const walk=(n,put)=>{ if(n.v){ if('⊤⊥∅'.indexOf(n.v)<0&&'∪∩∖'.indexOf(put.sig||'')<0) out.push(put({o:'¬',a:n})); return; }
    if(n.o==='¬'){ out.push(put(n.a)); walk(n.a,Object.assign(x=>put({o:'¬',a:x}),{sig:put.sig})); return; }
    if(flip[n.o]) out.push(put({o:flip[n.o],a:n.a,b:n.b})); if(n.o==='⇒'||n.o==='∖') out.push(put({o:n.o,a:n.b,b:n.a}));
    if(n.o==='∖') out.push(put({o:'∩',a:n.a,b:n.b}));
    walk(n.a,Object.assign(x=>put({o:n.o,a:x,b:n.b}),{sig:put.sig})); walk(n.b,Object.assign(x=>put({o:n.o,a:n.a,b:x}),{sig:put.sig})); };
  const sig=tleaves(t).length&&/[∪∩∖]/.test(tshow(t))?'∪':''; walk(t,Object.assign(x=>x,{sig}));
  return shuffle(out.filter((x,i)=>out.findIndex(y=>tshow(y)===tshow(x))===i)); }

/* A chain grown at random only gets longer (1f16), so a link is kept only when its line stays tidy: no third not in a row,
   no new ⊤ or ⊥ (but for not-as-if, once), and no growth by the techniques whose backward reading only pads a line. */
const PADS=/\.(again|absorb|units|notnot|notasif|sagain|sabsorb|sunits)$/, tcount=(k,re)=>(k.match(re)||[]).length;
function tidy(cur,res,L){ const a=tshow(cur), b=tshow(res); if(b.length>33||b.indexOf('¬¬¬')>=0) return false;
  const grew=b.length>a.length, consts=tcount(b,/[⊤⊥∅]/g)>tcount(a,/[⊤⊥∅]/g);
  if(L.id==='1d.notasif') return !consts||(tcount(a,/[⊤⊥]/g)===0&&Math.random()<0.5);
  if(consts) return false;
  if(grew&&PADS.test(L.id)) return /\.notnot$/.test(L.id)&&a.indexOf('¬¬')<0&&Math.random()<0.25;
  return b.length<=a.length+13; }
/* a rewrite technique as a link pool: it licenses a line that is a line above it with one piece rewritten */
function rwLink(id,step,name,pairs,kind){ const rule={pairs:pairs.map(p=>p.map(tparse))};
  return {id,step,name,kinds:[kind],rule,open:()=>measured(step),
    lic:(g,t)=>{ let T; try{ T=tshow(tparse(t.replace(/^= /,''))); }catch(e){ return false; }
      return g.some(x=>{ let G; try{ G=tparse(String(x).replace(/^= /,'')); }catch(e){ return false; } return trew(G,rule).some(r=>tshow(r.t)===T); }); },
    act(c){ if(!c.t) return null; const rs=trew(c.t,rule).filter(r=>tidy(c.t,r.t,this)); if(!rs.length) return null; const r=pick(rs);
      return {lines:[[tshow(c.t),'given'],[(kind==='set'?'= ':'')+tshow(r.t),null]], why:'Line 2 is line 1 with one piece rewritten by '+name+', read '+(r.dir==='→'?'forward':'backward')+'.'}; }}; }

/* --- Rung 1: the rulebook of 1f, each technique in the marks of its table --- */
Object.assign(STEPS,{'0c':['r00c','Guess, Work'],'1a':['r01a','Line It All Up'],'1d':['r01d','If, and Exactly When'],'1f':['r01f','Rewriting by the Rulebook'],'1g':['r01g','Too Many Rows']});
LINKS.push(
  rwLink('1f.turnabout','1f','the turn-about rewrite for And and for Or',[['A ∧ B','B ∧ A'],['A ∨ B','B ∨ A']],'prop'),
  rwLink('1f.regroup','1f','the regroup rewrite',[['(A ∧ B) ∧ C','A ∧ (B ∧ C)'],['(A ∨ B) ∨ C','A ∨ (B ∨ C)']],'prop'),
  rwLink('1f.spreadand','1f','the spread rewrite for and over or',[['A ∧ (B ∨ C)','(A ∧ B) ∨ (A ∧ C)']],'prop'),
  rwLink('1f.spreador','1f','the spread rewrite for or over and',[['A ∨ (B ∧ C)','(A ∨ B) ∧ (A ∨ C)']],'prop'),
  rwLink('1f.again','1f','the say-it-again rewrite',[['A ∧ A','A'],['A ∨ A','A']],'prop'),
  rwLink('1f.absorb','1f','the absorb rewrite',[['A ∧ (A ∨ B)','A'],['A ∨ (A ∧ B)','A']],'prop'),
  rwLink('1f.notor','1f','the not-through rewrite for or',[['¬(A ∨ B)','¬A ∧ ¬B']],'prop'),
  rwLink('1f.notand','1f','the not-through rewrite for and',[['¬(A ∧ B)','¬A ∨ ¬B']],'prop'),
  rwLink('1f.notnot','1f','the not-not rewrite',[['¬¬A','A']],'prop'),
  rwLink('1f.ifasor','1f','the if-as-or rewrite',[['A ⇒ B','¬A ∨ B']],'prop'),
  rwLink('1f.turndeny','1f','the turn-and-deny rewrite',[['A ⇒ B','¬B ⇒ ¬A']],'prop'),
  rwLink('1f.negif','1f','the negated-if rewrite',[['¬(A ⇒ B)','A ∧ ¬B']],'prop'),
  rwLink('1f.twoifs','1f','the two-ifs rewrite',[['A ⇔ B','(A ⇒ B) ∧ (B ⇒ A)']],'prop'),
  rwLink('1f.cases','1f','the cases rewrite',[['(A ⇒ C) ∧ (B ⇒ C)','(A ∨ B) ⇒ C']],'prop'),
  rwLink('1f.inturn','1f','the hypotheses-in-turn rewrite',[['(A ∧ B) ⇒ C','A ⇒ (B ⇒ C)']],'prop'),
  rwLink('1f.clash','1f','the clash rewrite',[['A ∧ ¬A','⊥']],'prop'),
  rwLink('1f.eitherway','1f','the either-way principle',[['A ∨ ¬A','⊤']],'prop'),
  rwLink('1f.units','1f','the units rewrite',[['A ∧ ⊤','A'],['A ∨ ⊥','A'],['A ∧ ⊥','⊥'],['A ∨ ⊤','⊤']],'prop'),
  /* 1d: the techniques of the if */
  rwLink('1d.notasif','1d','the not-as-if technique',[['¬A','A ⇒ ⊥']],'prop'),
  {id:'1d.chainif',step:'1d',name:'the chain technique for If',kinds:['prop'],open:()=>measured('1d'),
   lic:(g,t)=>{ let T; try{ T=tparse(t); }catch(e){ return false; } if(T.o!=='⇒') return false; const G=[]; g.forEach(x=>{ try{ const y=tparse(x); if(y.o==='⇒') G.push(y); }catch(e){} });
     return G.some(x=>tshow(x.a)===tshow(T.a)&&tshow(x.b)!==tshow(T.b)&&G.some(y=>tshow(y.a)===tshow(x.b)&&tshow(y.b)===tshow(T.b))); },
   act:c=>{ if(!c.L) return null; const [p,q,r]=c.L; return {lines:[[p+' ⇒ '+q,'given'],[q+' ⇒ '+r,'given'],[p+' ⇒ '+r,null]], why:'Line 3 joins the two ifs through their shared middle: if '+p+' then '+q+', and if '+q+' then '+r+'; so if '+p+' then '+r+'.'}; }},
  {id:'1d.freeif',step:'1d',name:'the free-if technique',kinds:['prop'],open:()=>measured('1d'),
   lic:(g,t)=>{ let T; try{ T=tparse(t); }catch(e){ return false; } if(T.o!=='⇒') return false; return g.includes(tshow({o:'¬',a:T.a}))||g.includes(tshow(T.b)); },
   act:c=>{ if(!c.L) return null; const [p,q]=c.L, held=Math.random()<0.5; return {lines:[[held?q:'¬'+p,'given'],[p+' ⇒ '+q,null]], why:held?'The conclusion is held, so the if is free: whatever is supposed, '+q+' is already in hand.':'The hypothesis is denied, so the if is free: it promises nothing that can be called in.'}; }}
);

/* seeds of statements: each is a start for a chain; the letters are dealt afresh each time */
const PROP_SEEDS=['¬(P ∧ Q)','¬(P ∨ Q)','¬¬P ∧ Q','P ⇒ Q','¬(P ⇒ Q)','P ⇔ Q','(P ⇒ R) ∧ (Q ⇒ R)','(P ∧ Q) ⇒ R','P ∧ (Q ∨ R)','P ∨ (Q ∧ R)','(P ∧ Q) ∨ (P ∧ ¬Q)','P ∧ (P ∨ Q)','P ∨ (P ∧ Q)',
  '(P ∧ Q) ∧ R','(P ∨ Q) ∨ R','¬(P ∧ ¬Q)','¬(¬P ∨ Q)','(P ∨ Q) ⇒ R','P ⇒ (Q ⇒ R)','¬(P ⇒ ¬Q)','(P ∧ ¬P) ∨ Q','(P ∨ ¬P) ∧ Q','(P ∧ ⊤) ∨ Q','¬(P ∧ (Q ∨ R))','¬((P ⇒ Q) ∧ R)','(P ⇒ Q) ∧ (Q ⇒ P)',
  '¬P ⇒ ¬Q','(¬P ∨ Q) ∧ P','¬(¬P ∧ ¬Q)','(P ∧ P) ∨ Q','¬¬(P ∨ Q)','P ⇒ (Q ∧ R)','(P ∧ Q) ∨ R','¬(P ⇔ Q)','(P ∨ ⊥) ∧ Q','¬(P ∨ (Q ∧ R))','(P ⇒ Q) ∨ R','¬P ∨ (P ∧ Q)','(P ⇒ ⊥) ∨ Q','P ⇒ (Q ⇒ ⊥)','¬(P ⇒ ⊥)','¬¬P ⇒ Q','(P ∧ Q) ⇒ ⊥'];
const relabel=(t,map)=>t.v?{v:map[t.v]||t.v}:t.o==='¬'?{o:'¬',a:relabel(t.a,map)}:{o:t.o,a:relabel(t.a,map),b:relabel(t.b,map)};
SEEDS.push({id:'1f.statements',step:'1f',label:'statements to rewrite',open:()=>measured('1f'),
  make(){ const k=rnd(PROP_SEEDS.length), L=shuffle(['P','Q','R']); return {kind:'prop',t:relabel(tparse(PROP_SEEDS[k]),{P:L[0],Q:L[1],R:L[2]}),L,ix:'['+k+','+L.join('')+']'}; }});
SKIND['1f.statements']='prop';
/* a seed of letters alone is enough for 1d's ifs, so the statements open with 1d for those */
SEEDS.push({id:'1d.letters',step:'1d',label:'letters for statements',open:()=>measured('1d'),
  make(){ const L=shuffle(['P','Q','R']); return {kind:'prop',t:null,L,ix:'['+L.join('')+']'}; }});
SKIND['1d.letters']='prop';

/* checks that ride on a chain: 1a's rule that a reason may cite only lines above it */
const MOVES=[{id:'1a.upward',step:'1a',label:'reasons point upward'}];
MOVES.forEach(M=>{ M.open=()=>measured(M.step); });

const TERMK=['prop','set'], shortName=n=>n.replace(/^the /,'');
function chainBuild(c,links,n,spoilAt){ const kind=c.kind, lines=[{t:c.t}], seenT={}; seenT[tshow(c.t)]=1; let spoiled=null;
  for(let k=1;k<=n;k++){ const cur=lines[lines.length-1].t, cand=[];
    links.forEach(L=>trew(cur,L.rule).forEach(r=>{ const key=tshow(r.t); if(!seenT[key]&&tidy(cur,r.t,L)) cand.push({L,r}); }));
    if(!cand.length) break;
    const prevL=lines[lines.length-1].L, fresh=cand.filter(x=>x.L!==prevL); if(fresh.length){ cand.length=0; fresh.forEach(x=>cand.push(x)); } /* the same technique twice running only when nothing else fits */
    const L=pick([...new Set(cand.map(x=>x.L))]), x=pick(cand.filter(y=>y.L===L)); let t=x.r.t;
    if(k===spoilAt){ const slip=tslips(t).find(z=>trows([z,cur]).rows.some(env=>tval(cur,env)&&!tval(z,env))&& /* the slip must fail on a row where the line above holds, so nothing above can license it */ !seenT[tshow(z)]&&tshow(z).length<=33); if(!slip) return null; spoiled={orig:t,L,apart:tapart(slip,t,kind)}; t=slip; }
    seenT[tshow(t)]=1; lines.push({t,L,dir:x.r.dir}); }
  if(lines.length-1<n) return null; return {lines,spoiled}; }
const chainLinks=(P,kind)=>P.links.filter(L=>L.rule&&L.kinds.includes(kind));
/* a seed of bare letters: a short column of givens and lines drawn from them by 1d's techniques, one line spoiled.
   The spoiled line is checked against every row: it must fail on some row where all the other lines hold. */
function lettersProofQ(P,used,s,c){ const have=id=>P.links.find(L=>L.id===id), CH=have('1d.chainif'), FR=have('1d.freeif'), NA=have('1d.notasif');
  if([CH,FR,NA].filter(Boolean).length<2) return null;
  for(let tries=0;tries<40;tries++){ const [p,q,r]=shuffle(c.L.slice()), lines=[], der=[], cited={};
    const given=t=>{ let i=lines.findIndex(x=>x.t===t); if(i<0){ lines.push({t,w:'given'}); i=lines.length-1; } if(lines[i].L) cited[i]=1; return i+1; };
    const blocks=shuffle([CH&&'ch',FR&&'fr',NA&&'na'].filter(Boolean)).slice(0,2+rnd(2));
    blocks.forEach(b=>{
      if(b==='ch'){ const a=given(p+' ⇒ '+q), d=given(q+' ⇒ '+r); lines.push({t:p+' ⇒ '+r,L:CH,w:shortName(CH.name)+', on lines '+a+' and '+d,slips:[r+' ⇒ '+p,p+' ⇒ ¬'+r,'¬'+p+' ⇒ '+r]}); }
      if(b==='fr'){ const held=Math.random()<0.5, x=held?r:q, y=held?q:r, a=given(held?y:'¬'+x); lines.push({t:x+' ⇒ '+y,L:FR,w:shortName(FR.name)+', on line '+a,slips:[y+' ⇒ '+x,held?x+' ⇒ ¬'+y:'¬'+x+' ⇒ '+y]}); }
      if(b==='na'){ const x=blocks.includes('fr')?p:pick([p,q,r]), a=given('¬'+x); lines.push({t:x+' ⇒ ⊥',L:NA,w:shortName(NA.name)+', on line '+a,slips:['¬'+x+' ⇒ ⊥']}); }
      der.push(lines.length-1); });
    const T=lines.map(x=>tparse(x.t)), rows=trows(T.concat(c.L.map(v=>tparse(v)))).rows;
    if(!rows.some(env=>T.every(t=>tval(t,env)))) continue; /* the givens must be able to hold together */
    const free=der.filter(i=>!cited[i]); if(!free.length) continue; const j=pick(free), others=T.filter((t,i)=>i!==j); /* a line that a later line cites is never the spoiled one */
    const bad=shuffle(lines[j].slips).find(z=>{ const Z=tparse(z); return !lines.some(x=>x.t===z)&&rows.some(env=>others.every(t=>tval(t,env))&&!tval(Z,env)); });
    if(!bad) continue;
    const ids=der.map(i=>lines[i].L.id), index='p:'+s.id+c.ix+'.'+ids.join('+')+'#'+(j+1)+':'+bad; if(used[index]) continue;
    return {index, a3:[s.id+c.ix, ids.join('+'), DASH], step:'1d', steps:['1d'], stack:true,
      lines:lines.map((x,i)=>[i===j?bad:x.t,x.w]), ask:'One line does not follow from what it cites. Which line is the bad line?',
      right:'line '+(j+1), opts:der.map(i=>'line '+(i+1)), lead:'The bad line is line '+(j+1)+'. ',
      why:'Line '+(j+1)+' cites '+lines[j].L.name+'. That technique licenses “'+lines[j].t+'”, and the line as written does not follow.'}; }
  return null; }
function chainProofQ(P,used,s,c){ if(!c.t) return lettersProofQ(P,used,s,c); const links=chainLinks(P,c.kind); if(links.length<2) return null; const eq=c.kind==='set'?'= ':'';
  for(let tries=0;tries<40;tries++){ const n=2+rnd(3), upward=P.moves.some(M=>M.id==='1a.upward')&&n>=3&&Math.random()<0.22;
    const j=upward?2+rnd(n-1):2+rnd(n), B=chainBuild(c,links,n,upward?0:j-1); if(!B) continue;
    const ids=B.lines.slice(1).map(x=>x.L.id); let cite=B.lines.map((x,i)=>i); /* line i+1 cites line i */
    const reason=(x,i,to)=>shortName(x.L.name)+', on line '+to;
    let lines, why, lead='The bad line is line '+j+'. ';
    if(upward){ const below=j+1+rnd(n+1-j); lines=B.lines.map((x,i)=>[(i?eq:'')+tshow(x.t),i?reason(x,i,i+1===j?below:i):'given']);
      why='Line '+j+' cites line '+below+', which is below it. A reason may cite only lines above it.'; }
    else{ lines=B.lines.map((x,i)=>[(i?eq:'')+tshow(x.t),i?reason(x,i,i):'given']);
      why='Line '+j+' cites '+B.spoiled.L.name+'. That takes line '+(j-1)+' to “'+tshow(B.spoiled.orig)+'”. The line as written says something else: '+B.spoiled.apart+'.'; }
    const index='p:'+s.id+c.ix+'.'+ids.join('+')+(upward?'^':'#')+j+':'+lines[j-1][0]; if(used[index]) continue;
    return {index, a3:[s.id+c.ix, ids.join('+')+(upward?'+1a.upward':''), DASH], step:B.lines[j-1].L.step, steps:[...new Set(B.lines.slice(1).map(x=>x.L.step).concat(upward?['1a']:[]))], stack:true,
      lines, ask:'One line does not follow from what it cites. Which line is the bad line?', right:'line '+j, opts:B.lines.slice(1).map((x,i)=>'line '+(i+2)), lead, why}; }
  return null; }
/* Work: the chain is given with its last line left as a box; the learner works it to completion */
function chainWorkQ(P,used,s,c){ const links=chainLinks(P,c.kind); if(!links.length||!c.t) return null; const eq=c.kind==='set'?'= ':'';
  for(let tries=0;tries<40;tries++){ const n=1+rnd(Math.min(3,links.length)), B=chainBuild(c,links,n,0); if(!B) continue;
    const last=B.lines[n], prev=B.lines[n-1].t, valid=trew(prev,last.L.rule).map(r=>tshow(r.t)), right=tshow(last.t);
    const wrong=[]; tslips(last.t).forEach(z=>{ const k=tshow(z); if(wrong.length<2&&!tequiv(z,prev)&&!valid.includes(k)&&k.length<=33&&!wrong.includes(k)) wrong.push(k); });
    shuffle(links.filter(L=>L!==last.L)).forEach(L=>trew(prev,L.rule).forEach(r=>{ const k=tshow(r.t); if(wrong.length<3&&!valid.includes(k)&&!wrong.includes(k)&&k.length<=33) wrong.push(k); }));
    tslips(prev).forEach(z=>{ const k=tshow(z); if(wrong.length<3&&!valid.includes(k)&&!wrong.includes(k)&&k!==tshow(prev)) wrong.push(k); });
    if(wrong.length<3) continue;
    const ids=B.lines.slice(1).map(x=>x.L.id), index='w:'+s.id+c.ix+'.'+ids.join('+')+'>'+right; if(used[index]) continue;
    return {index, a3:[s.id+c.ix,ids.join('+'),DASH], step:last.L.step, steps:[...new Set(B.lines.slice(1).map(x=>x.L.step))], stack:true,
      lines:B.lines.map((x,i)=>[i===n?eq+'▢':(i?eq:'')+tshow(x.t),i?shortName(x.L.name)+', on line '+i:'given']),
      ask:'What fills the box ▢?', right:eq+right, opts:shuffle([right,...wrong]).map(o=>eq+o), lead:'The box holds '+right+'. ',
      why:'Line '+(n+1)+' is line '+n+' with one piece rewritten by '+last.L.name+', read '+(last.dir==='→'?'forward':'backward')+'.'}; }
  return null; }

/* --- Rung 1 bank: weather statements, and the ways English says a rule (1f10's table) --- */
const SAYINGS=[['If {X}, then {Y}.','X ⇒ Y'],['{Y} if {X}.','X ⇒ Y'],['{Y} whenever {X}.','X ⇒ Y'],['{X} only if {Y}.','X ⇒ Y'],['{X} unless {Y}.','¬Y ⇒ X'],['{X} exactly when {Y}.','X ⇔ Y'],
  ['{X} if and only if {Y}.','X ⇔ Y'],['{X}, and {nY}.','X ∧ ¬Y'],['It is not so that both {X} and {Y}.','¬(X ∧ Y)'],['If {nY}, then {nX}.','¬Y ⇒ ¬X']];
SEEDS.push({id:'1d.sayings',step:'1d',label:'ways English says a rule',open:()=>measured('1d'),
  make(){ const k=rnd(SAYINGS.length), turn=rnd(2); return {kind:'say',k,turn,ix:'['+k+','+turn+']'}; }});
SKIND['1d.sayings']='say';
[['weather.rain','it is raining','the street is wet'],['weather.snow','it is snowing','the pass is closed'],['weather.fog','the wind is from the south','the fog is lifting'],
 ['weather.frost','the sky is clear','the night is cold'],['weather.river','the river is high','the ferry is tied up'],['weather.ice','the ground is frozen','the puddles are iced over']]
 .forEach(([id,p,q])=>BANK.push({id,step:'1d',kind:'prop',p,q,open:()=>measured('1d')}));
const notSay=s=>s.replace(/ (is|are) /,' $1 not '), capFirst=s=>s.charAt(0).toUpperCase()+s.slice(1);
function sayQ(P,used){ const seeds=P.seeds.filter(s=>SKIND[s.id]==='say'&&(!P.use||P.use(s))) /* the sentence is the question, so its rung must be switched on */, bank=P.bank.filter(B=>B.kind==='prop'); if(!seeds.length||!bank.length) return null;
  const links=chainLinks(P,'prop');
  for(let tries=0;tries<60;tries++){ const s=pick(seeds), c=s.make(), B=pick(bank), [text,form]=SAYINGS[c.k];
    const X=c.turn?'Q':'P', Y=c.turn?'P':'Q', cl={P:B.p,Q:B.q}, say=capFirst(text.replace('{X}',cl[X]).replace('{Y}',cl[Y]).replace('{nX}',notSay(cl[X])).replace('{nY}',notSay(cl[Y])));
    const t0=relabel(tparse(form),{X,Y}), n=links.length?rnd(3):0, CB=n?chainBuild({kind:'prop',t:t0},links,n,0):{lines:[{t:t0}]}; if(!CB) continue;
    const fin=CB.lines[CB.lines.length-1].t, right=tshow(fin), names=CB.lines.slice(1).map(x=>x.L.name);
    const base=[relabel(tparse(form),{X:Y,Y:X}),tparse('P ⇒ Q'),tparse('Q ⇒ P'),tparse('P ⇔ Q'),tparse('¬P ⇒ Q'),tparse('¬Q ⇒ P'),tparse('P ∧ ¬Q'),tparse('¬(P ∧ Q)')];
    const fam=n?tslips(fin).concat(base):base.concat(tslips(fin)); /* after a rewrite the wrong lines are slips of the line reached; before one, the if's relatives */
    const wrong=[]; fam.forEach(z=>{ const k=tshow(z); if(wrong.length<3&&!tequiv(z,fin)&&!wrong.includes(k)&&k.length<=33) wrong.push(k); }); if(wrong.length<3) continue;
    const ids=CB.lines.slice(1).map(x=>x.L.id), index='d:'+s.id+c.ix+'.'+(ids.join('+')||DASH)+'.'+B.id+'>'+right; if(used[index]) continue;
    return {index, a3:[s.id+c.ix,ids.join('+')||DASH,B.id], step:'1d', steps:[...new Set(['1d',...CB.lines.slice(1).map(x=>x.L.step)])],
      story:'Let P be “'+B.p+'”. Let Q be “'+B.q+'”. The rule: “'+say+'”'+(names.length?' Write the rule in marks, then rewrite it by '+names.join(', and then by ')+'.':''), lines:[],
      ask:names.length?'Which line do you reach?':'Which line writes the rule in marks?', right, opts:shuffle([right,...wrong]), lead:'It is '+right+'. ',
      why:'The rule in marks is '+tshow(t0)+'.'+(names.length?' Rewritten: '+CB.lines.slice(1).map(x=>tshow(x.t)).join(', then ')+'.':'')}; }
  return null; }

/* --- Question pools for the steps that teach no technique of their own --- */
WORKQ.push('1g.rows');
QP.push({id:'1g.rows',step:'1g',label:'how many rows',open:()=>measured('1g'),make(){
    const k=rnd(PROP_SEEDS.length), four=Math.random()<0.3, t=four?{o:pick(['∧','∨','⇒']),a:tparse(PROP_SEEDS[k]),b:{v:'S'}}:tparse(PROP_SEEDS[k]), n=tatoms(t).length, right=String(1<<n);
    const wrong=[...new Set([2*n,n*n,1<<(n+1),1<<(n-1),n+1,2*n+1].map(String))].filter(x=>x!==right&&x!=='1'&&x!=='0').slice(0,3);
    return {index:'q:1g.rows['+k+','+(four?1:0)+']', lines:[[tshow(t),'statement']], ask:'How many rows does its table need?', right, opts:shuffle([right,...wrong]),
      why:'It has '+n+' different letter'+(n===1?'':'s')+', and each letter doubles the rows: '+Array.from({length:n},()=>'2').join(' · ')+' = '+right+'.'}; }},
  {id:'0c.work',step:'0c',label:'said or seen',open:()=>measured('0c'),make(){
    const said=Math.random()<0.5; let text, index;
    if(said){ const i=rnd(NAMES.length), [l,r,m]=NAMES[i]; text='From “'+l+' = '+r+'” and “'+r+' = '+m+'”, you write “'+l+' = '+m+'”.'; index='q:0c.work[s'+i+']'; }
    else{ const C=[['crates','crate','lettuce'],['bins','bin','apples'],['totes','tote','salmon'],['sacks','sack','almonds'],['bins','bin','pears']], i=rnd(C.length), [us,u,thing]=C[i], n=3+rnd(7);
      text='You open '+n+' '+us+' and find '+thing+' in each one, and you say “every '+u+' here holds '+thing+'”.'; index='q:0c.work[c'+i+','+n+']'; }
    return {index, lines:[[text,'working']], ask:'Is this working from what is said, or from what is seen?', right:said?'from what is said':'from what is seen', opts:['from what is said','from what is seen'],
      why:said?'Nothing is looked at: the new line is written only from the lines already written. The guess is in the lines it starts from.':'A word for all the cases is gathered from the cases looked at. More cases make the guess harder to shake, and never finish it.'}; }}
);

/* ===== Laundry 5, rung 2 (floor 1 pools, stage B): 2a 2b 2c 2d 2e 2f 2g 2h 2j 2k =====
   A question pool may now sit under any of the four kinds (mode:'proof' | 'work' | 'word'; none = Understanding).
   Three small checkers stand behind every answer here: listed sets worked out member by member; every-and-some lines read
   in a listed world, or in every world of up to three kinds at once; and the four old sentences read the same way. */
const qmode=Q=>Q.mode||(WORKQ.includes(Q.id)?'work':'read');
Object.assign(STEPS,{'2a':['r02a','Arrange Your Series'],'2b':['r02b','Every and Some'],'2c':['r02c','Claims Built in Layers'],'2d':['r02d','Membership and Same Members'],
  '2e':['r02e','Sifting, and a Set to Start From'],'2f':['r02f','Gather and Merge'],'2g':['r02g','All the Subsets'],'2h':['r02h','Pairs in Order'],
  '2j':['r02j','Every and Some by Hand'],'2k':['r02k','What Holds of the Set']});

/* --- listed sets: a member is a word, a pair, or a listed set --- */
const lkey=x=>typeof x==='string'?x:x.p?'('+lkey(x.p[0])+';'+lkey(x.p[1])+')':'{'+x.s.map(lkey).sort().join(',')+'}';
const lset=xs=>{ const seen={}, s=[]; xs.forEach(x=>{ const k=lkey(x); if(!seen[k]){ seen[k]=1; s.push(x); } }); return {s}; };
const lshow=x=>typeof x==='string'?x:x.p?'('+lshow(x.p[0])+', '+lshow(x.p[1])+')':x.s.length?'{'+x.s.map(lshow).join(', ')+'}':'∅';
const lhas=(S,x)=>S.s.some(y=>lkey(y)===lkey(x)), lsub=(A,B)=>A.s.every(x=>lhas(B,x)), lsame=(A,B)=>lkey(A)===lkey(B);
const lun=(A,B)=>lset(A.s.concat(B.s)), lint=(A,B)=>lset(A.s.filter(x=>lhas(B,x))), lless=(A,B)=>lset(A.s.filter(x=>!lhas(B,x)));
const lpow=A=>{ let out=[lset([])]; A.s.forEach(x=>{ out=out.concat(out.map(S=>lset(S.s.concat([x])))); }); return lset(out); };
const lval=(t,env)=>t.v?(t.v==='∅'?lset([]):env[t.v]):t.o==='∪'?lun(lval(t.a,env),lval(t.b,env)):t.o==='∩'?lint(lval(t.a,env),lval(t.b,env)):lless(lval(t.a,env),lval(t.b,env));
const listed=xs=>xs.length===1?'the '+xs[0]:xs.slice(0,-1).map(x=>'the '+x).join(', ')+' and the '+xs[xs.length-1];
const take=(xs,n)=>shuffle(xs.slice()).slice(0,n);

/* --- the bank of things: what is said of them is laid down as given in each question, never left to be looked up --- */
const THINGS=[
  {id:'things.zoo',things:['owl','bat','cat','dog','cod','bee'],props:[['can fly','F',['owl','bat','bee']],['is a mammal','M',['bat','cat','dog']],['lives in water','W',['cod']]]},
  {id:'things.market',things:['apple','pear','plum','kale','leek','beet'],props:[['is a fruit','F',['apple','pear','plum']],['has a stone','S',['plum']],['grows under the ground','U',['beet']]]},
  {id:'things.shed',things:['saw','file','drill','rake','hoe','spade'],props:[['is a garden tool','G',['rake','hoe','spade']],['has a motor','M',['drill']],['has teeth','T',['saw','rake','file']]]}];
THINGS.forEach(B=>BANK.push(Object.assign(B,{step:'2b',kind:'things',open:()=>measured('2b')||measured('2d')})));
/* kinds for the every-and-some sentences: nouns, and what may be said of one */
const KINDS=[
  {id:'kinds.pets',nouns:[['cat','C'],['dog','D'],['animal','A']],adjs:[['grey','G'],['asleep','S'],['old','O']]},
  {id:'kinds.orchard',nouns:[['pear','P'],['apple','A'],['fruit','F']],adjs:[['ripe','R'],['green','G'],['bruised','B']]},
  {id:'kinds.harbor',nouns:[['ferry','F'],['barge','B'],['boat','T']],adjs:[['loaded','L'],['moored','M'],['red','R']]}];
KINDS.forEach(B=>BANK.push(Object.assign(B,{step:'2b',kind:'kinds',open:()=>measured('2b')})));
const aOf=w=>(/^[aeiou]/.test(w)?'an ':'a ')+w;

/* --- every-and-some lines over statements with one gap. A line is {q, neg, body}; body is a term over the letters. --- */
const mshowBody=t=>tshow(t).replace(/[A-Z]/g,m=>m+'(x)');
const mshow=f=>(f.neg?'¬':'')+(f.q?f.q+'x '+(f.body.o&&f.body.o!=='¬'?'('+mshowBody(f.body)+')':mshowBody(f.body)):mshowBody(f.body));
const mline=(q,body,neg)=>({q,neg:!!neg,body:typeof body==='string'?tparse(body):body});
/* so or not so in a world given as a list of things, each an env of its letters */
const mval=(f,world)=>{ const v=f.q==='∀'?world.every(e=>tval(f.body,e)):world.some(e=>tval(f.body,e)); return f.neg?!v:v; };
/* every world there is for these letters: each kind of thing (a row of the letters) is in the world or not; no world is empty */
function mworlds(L){ const types=[]; for(let m=0;m<(1<<L.length);m++){ const e={}; L.forEach((v,i)=>e[v]=!!(m&(1<<i))); types.push(e); }
  const out=[]; for(let w=1;w<(1<<types.length);w++) out.push(types.filter((t,i)=>w&(1<<i))); return out; }
const mletters=fs=>[...new Set([].concat(...fs.map(f=>tatoms(f.body))))].sort();
const msame=(f,g)=>mworlds(mletters([f,g])).every(w=>mval(f,w)===mval(g,w));
const mgives=(fs,g)=>mworlds(mletters(fs.concat([g]))).every(w=>!fs.every(f=>mval(f,w))||mval(g,w));

/* ---------- 2a Arrange Your Series ---------- */
QP.push({id:'2a.cases',step:'2a',mode:'proof',label:'rows and cases',open:()=>measured('2a'),make(){
    const [p,q,r,s]=shuffle(['P','Q','R','S']), v=rnd(4), closed=Math.random()<0.35; let rows, bad, why;
    const cite='carry an if through, rows ';
    if(closed){ /* one case clashes with a given and is closed; the other reaches the row */
      rows=[[p+' ∨ '+q,'given'],['¬'+q,'given'],[p+' ⇒ '+r,'given'],['│ '+p,'case'],['│ '+r,cite+'3 and 4'],['│ '+q,'case'],['│ ⊥','clash, rows 2 and 6'],['│ '+r,'when nothing is true, everything is permitted, row 7'],[r,'reason by cases, rows 1, 5 and 8']];
      if(v===0){ rows[7]=['│ '+r,cite+'3 and 4']; bad=8; why='Row 8 sits in the '+q+' case and cites row 4, the case row of the '+p+' case. A case may use its own rows and the rows above it at the margin, never the rows of another case.'; }
      else if(v===1){ rows[6]=['│ ⊥','clash, rows 3 and 6']; bad=7; why='A clash needs a row and its denial. Rows 3 and 6 are “'+p+' ⇒ '+r+'” and “'+q+'”: neither denies the other. The denial of '+q+' is row 2.'; }
      else if(v===2){ rows[8]=[s,'reason by cases, rows 1, 5 and 8']; bad=9; why='A row comes back to the margin only when every case reached it. The cases reached '+r+', and row 9 writes '+s+'.'; }
      else { rows[7]=['│ '+r,'when nothing is true, everything is permitted, row 5']; bad=8; why='That move needs ⊥ in hand. Row 5 is '+r+', not ⊥, and it is a row of the other case. The '+q+' case reached ⊥ at row 7.'; } }
    else{ rows=[[p+' ∨ '+q,'given'],[p+' ⇒ '+r,'given'],[q+' ⇒ '+r,'given'],['│ '+p,'case'],['│ '+r,cite+'2 and 4'],['│ '+q,'case'],['│ '+r,cite+'3 and 6'],[r,'reason by cases, rows 1, 5 and 7']];
      if(v===0){ rows[6]=['│ '+r,cite+'2 and 4']; bad=7; why='Row 7 sits in the '+q+' case and cites row 4, the case row of the '+p+' case. A case may use its own rows and the rows above it at the margin, never the rows of another case.'; }
      else if(v===1){ rows[2]=[q+' ⇒ '+s,'given']; rows[6]=['│ '+s,cite+'3 and 6']; bad=8; why='A row comes back to the margin only when every case reached it. The '+p+' case reached '+r+' and the '+q+' case reached '+s+', so row 8 is not earned.'; }
      else if(v===2){ rows[4]=['│ '+r,cite+'3 and 4']; bad=5; why='Row 3 is “'+q+' ⇒ '+r+'”, and row 4 is '+p+'. An if fires only on its own condition, so rows 3 and 4 give nothing. Row 2 was the row to cite.'; }
      else { rows.splice(7,0,['│ '+q+' ∧ '+p,'join, rows 6 and 4']); rows[8]=[r,'reason by cases, rows 1, 5 and 7']; bad=8; why='Row 8 joins the case row of the '+q+' case with row 4, the case row of the '+p+' case. What one case writes belongs to that one way things could be, and to no other.'; } }
    const der=rows.map((x,i)=>i+1).filter(i=>rows[i-1][1]!=='given'&&rows[i-1][1]!=='case');
    return {index:'q:2a.cases['+[p,q,r,s].join('')+','+(closed?'c':'o')+v+']', a3:['1d.letters['+[p,q,r].join('')+']','2a.cases',DASH], stack:true, lines:rows,
      ask:'One row does not follow from the rows it cites. Which row is the bad row?', right:'row '+bad, opts:der.map(i=>'row '+i), lead:'The bad row is row '+bad+'. ', why}; }});
QP.push({id:'2a.stand',step:'2a',mode:'work',label:'givens that can stand together',open:()=>measured('2a'),make(){
    const POOL=['P ∨ Q','¬P','¬Q','P ⇒ Q','Q ⇒ P','P ∧ Q','¬(P ∧ Q)','P ⇔ Q','¬P ∨ ¬Q','P','Q','Q ⇒ ¬P'];
    for(let tries=0;tries<40;tries++){ const gs=take(POOL,2+rnd(2)), T=gs.map(tparse), rows=trows([tparse('P'),tparse('Q')]).rows, ok=rows.filter(e=>T.every(t=>tval(t,e)));
      if(ok.length>1) continue; const name=e=>'the row where P is '+(e.P?'T':'F')+' and Q is '+(e.Q?'T':'F'), none='no row: these givens cannot stand together';
      const right=ok.length?name(ok[0]):none, three=ok.length?shuffle([right,...shuffle(rows.map(name).filter(o=>o!==right)).slice(0,2)]):shuffle(rows.map(name)).slice(0,3);
      return {index:'q:2a.stand['+gs.join(';')+']', stack:true, lines:gs.map(g=>[g,'given']), ask:'In which row is every given so?', right, opts:three.concat([none]),
        why:ok.length?'Showing that givens can stand together takes one row: name it and check each given in it. In that row '+gs.map(g=>'“'+g+'” is T').join(', ')+'. In every other row some given is F.':'Showing that givens cannot stand together takes every row: '+rows.map(e=>'with P '+(e.P?'T':'F')+' and Q '+(e.Q?'T':'F')+', “'+gs[T.findIndex(t=>!tval(t,e))]+'” is F').join('; ')+'.'}; }
    return null; }});

/* ---------- 2b Every and Some ---------- */
QP.push({id:'2b.world',step:'2b',mode:'work',label:'a world for a line',open:()=>measured('2b'),make(){
    for(let tries=0;tries<40;tries++){ const B=pick(THINGS), W=take(B.things,3+rnd(2)), [p1,p2]=take(B.props,2), a=p1[1], b=p2[1];
      const world=W.map(t=>({name:t,[a]:p1[2].includes(t),[b]:p2[2].includes(t)}));
      const C=shuffle([mline('∀',a),mline('∃',a),mline('∀',b),mline('∃',b),mline('∀',a+' ⇒ '+b),mline('∀',b+' ⇒ '+a),mline('∃',a+' ∧ '+b),mline('∀',a+' ∨ '+b),mline('∃',a+' ∧ ¬'+b),mline('∃',b+' ∧ ¬'+a),mline('∀','¬'+a),mline('∃',a+' ∧ '+b,true)]);
      const so=C.filter(f=>mval(f,world)), not=C.filter(f=>!mval(f,world)); if(!so.length||not.length<3) continue;
      const R=so[0], wrong=not.slice(0,3), say=(pw,ts)=>ts.length?'so of '+listed(ts):'so of none of them';
      const witness=f=>{ if(f.neg) return 'it denies a some, and no thing here passes'; if(f.q==='∃'){ const e=world.find(e=>tval(f.body,e)); return 'the '+e.name+' is an example'; } return 'each of the '+W.length+' things passes when it is checked in turn'; };
      const fails=f=>{ if(f.neg||f.q==='∀'){ const e=world.find(e=>f.neg?tval(f.body,e):!tval(f.body,e)); return 'the '+e.name+(f.neg?' is an example of what it denies':' fails it'); } return 'no thing here is an example'; };
      return {index:'q:2b.world['+B.id.slice(7)+';'+W.join(',')+';'+a+b+';'+mshow(R)+']', a3:['2b.world['+a+b+']',DASH,B.id],
        story:'A world of '+W.length+' things: '+listed(W)+'. '+a+'(x) says “x '+p1[0]+'”: '+say(p1[0],W.filter(t=>p1[2].includes(t)))+'. '+b+'(x) says “x '+p2[0]+'”: '+say(p2[0],W.filter(t=>p2[2].includes(t)))+'.',
        lines:[], ask:'Which line is so in this world?', right:mshow(R), opts:shuffle([R,...wrong]).map(mshow), lead:'It is '+mshow(R)+'. ',
        why:'In this world '+witness(R)+'. The others are not so: '+wrong.map(f=>mshow(f)+' ('+fails(f)+')').join('; ')+'.'}; }
    return null; }});
/* sentences into marks: 2b's two spellings, and 2c's layers */
const SENT=[
  {k:'every',step:'2b',say:(n,a)=>'Every '+n[0]+' is '+a[0]+'.',f:(n,a)=>mline('∀',n[1]+' ⇒ '+a[1]),why:'Every goes with ⇒: the line promises '+'something of each thing that passes the first test, and says nothing of the rest.'},
  {k:'some',step:'2b',say:(n,a)=>'Some '+n[0]+' is '+a[0]+'.',f:(n,a)=>mline('∃',n[1]+' ∧ '+a[1]),why:'Some goes with ∧: an example must pass both tests at once.'},
  {k:'no',step:'2c',say:(n,a)=>'No '+n[0]+' is '+a[0]+'.',f:(n,a)=>Math.random()<0.5?mline('∀',n[1]+' ⇒ ¬'+a[1]):mline('∃',n[1]+' ∧ '+a[1],true),why:'“No” is an every with a not inside, or a not in front of a some. Find the main mark first, then work inward.'},
  {k:'everyadj',step:'2c',say:(n,a,b)=>'Every '+a[0]+' '+n[0]+' is '+b[0]+'.',f:(n,a,b)=>mline('∀','('+n[1]+' ∧ '+a[1]+') ⇒ '+b[1]),why:'The main mark is the every, of the kind “'+'two tests joined”: the and is built first, the if is put in front of it, and the gap is bound last.'},
  {k:'everyor',step:'2c',say:(n,a,b)=>'Every '+n[0]+' is '+a[0]+' or '+b[0]+'.',f:(n,a,b)=>mline('∀',n[1]+' ⇒ ('+a[1]+' ∨ '+b[1]+')'),why:'Join the last two with or, put the if in front, bind the gap: the every is the main mark and reaches the whole bracket.'},
  {k:'somenot',step:'2c',say:(n,a,b)=>'Some '+n[0]+' is '+a[0]+' and not '+b[0]+'.',f:(n,a,b)=>mline('∃',n[1]+' ∧ ('+a[1]+' ∧ ¬'+b[1]+')'),why:'A some wants an example that passes every part at once, so its parts are joined with ∧, and the not sits on the one part it denies.'}];
function sentQ(step){ const S=pick(SENT.filter(x=>x.step===step)), B=pick(KINDS), n=pick(B.nouns), [a,b]=take(B.adjs,2), R=S.f(n,a,b), L=tatoms(R.body);
  const swapQ=f=>mline(f.q==='∀'?'∃':'∀',f.body,f.neg), cand=[];
  const body=R.body, alt=o=>({o,a:body.a,b:body.b});
  if(body.o==='⇒'){ cand.push(mline(R.q,alt('∧'),R.neg),mline('∃',alt('⇒')),mline('∃',alt('∧')),mline(R.q,{o:'⇒',a:body.b,b:body.a},R.neg)); }
  if(body.o==='∧'){ cand.push(mline(R.q,alt('⇒'),R.neg),mline('∀',alt('∧')),mline('∀',alt('⇒')),mline(R.q,alt('∨'),R.neg)); }
  tslips(body).forEach(z=>cand.push(mline(R.q,z,R.neg))); cand.push(swapQ(R),mline(R.q,body,!R.neg));
  const wrong=[]; shuffle(cand.slice(0,4)).concat(shuffle(cand.slice(4))).forEach(f=>{ const k=mshow(f); if(wrong.length<3&&k!==mshow(R)&&!wrong.includes(k)&&!msame(f,R)&&mletters([f]).length===L.length) wrong.push(k); });
  if(wrong.length<3) return null;
  const all=B.nouns.concat(B.adjs), defs=L.map(l=>{ const w=all.find(x=>x[1]===l), noun=B.nouns.includes(w); return 'Let '+l+'(x) be “x is '+(noun?aOf(w[0]):w[0])+'”.'; }).join(' ');
  return {index:'q:'+step+'.say['+S.k+';'+B.id.slice(6)+';'+n[1]+a[1]+(b?b[1]:'')+';'+mshow(R)+']', a3:[step+'.sentences['+S.k+']',DASH,B.id], story:defs+' The sentence: “'+S.say(n,a,b)+'”', lines:[],
    ask:'Which line writes the sentence in marks?', right:mshow(R), opts:shuffle([mshow(R),...wrong]), lead:'It is '+mshow(R)+'. ', why:S.why}; }
QP.push({id:'2b.say',step:'2b',mode:'word',label:'every and some in marks',open:()=>measured('2b'),make:()=>sentQ('2b')});

/* ---------- 2c Claims Built in Layers ---------- */
QP.push({id:'2c.say',step:'2c',mode:'word',label:'a sentence in layers',open:()=>measured('2c'),make:()=>sentQ('2c')});
QP.push({id:'2c.main',step:'2c',label:'the main mark',open:()=>measured('2c'),make(){
    const B=pick(KINDS), n=pick(B.nouns), [a,b]=take(B.adjs,2), S=pick(SENT), f=S.f(n,a,b), bare=Math.random()<0.3&&f.body.o;
    const g=bare?{q:'',neg:false,body:f.body}:f, text=mshow(g), right=g.neg?'¬':g.q||g.body.o;
    const name={'∀':'∀, the every','∃':'∃, the some','¬':'¬, the not','⇒':'⇒, the if','∧':'∧, the and','∨':'∨, the or'};
    const inside=[...new Set((text.match(/[∀∃¬⇒∧∨]/g)||[]))].filter(m=>m!==right), pad=shuffle(['∀','∃','¬','⇒','∧','∨'].filter(m=>m!==right&&!inside.includes(m)));
    const wrong=inside.concat(pad).slice(0,3);
    return {index:'q:2c.main['+text+']', lines:[[text,bare?'a statement with a gap':'statement']], ask:'Which mark is its main mark?', right:name[right], opts:shuffle([right,...wrong]).map(m=>name[m]),
      why:'A statement is built one mark at a time, and the last mark put on is its main mark. Here every other mark sits inside the reach of '+right+'.'}; }});

/* ---------- 2d Membership and Same Members ---------- */
QP.push({id:'2d.inpart',step:'2d',label:'in, or part of',open:()=>measured('2d'),make(){
    for(let tries=0;tries<40;tries++){ const B=pick(THINGS), [a,b,c]=take(B.things,3), shape=rnd(4);
      const S=shape===0?lset([a,b]):shape===1?lset([a,lset([b])]):shape===2?lset([lset([a]),b]):lset([a,lset([a,b]),c]);
      const cand=[]; [a,b,c].forEach(t=>{ cand.push([t,'∈'],[lset([t]),'∈'],[lset([t]),'⊆']); }); cand.push([lset([a,b]),'⊆'],[lset([a,b]),'∈'],[lset([lset([a])]),'⊆'],[lset([lset([b])]),'⊆']);
      const so=x=>x[1]==='∈'?lhas(S,x[0]):lsub(x[0],S), show=x=>lshow(x[0])+' '+x[1]+' '+lshow(S);
      const yes=shuffle(cand.filter(so)), no=shuffle(cand.filter(x=>!so(x))); if(!yes.length||no.length<3) continue; const R=yes[0], wrong=no.slice(0,3);
      const whyR=R[1]==='∈'?lshow(R[0])+' is on the list of '+lshow(S):'every member of '+lshow(R[0])+' is on the list of '+lshow(S);
      const whyW=x=>x[1]==='∈'?lshow(x[0])+' is not on the list':lshow(x[0].s.find(y=>!lhas(S,y)))+' is in '+lshow(x[0])+' and is not on the list';
      return {index:'q:2d.inpart['+lshow(S)+';'+show(R)+']', a3:['2d.inpart['+shape+']',DASH,B.id], lines:[], ask:'Which line is so?', right:show(R), opts:shuffle([R,...wrong]).map(show), lead:'It is '+show(R)+'. ',
        why:'∈ asks whether a thing is on the list; ⊆ asks whether every member of a thing is on the list. Here '+whyR+'. The others: '+wrong.map(whyW).join('; ')+'.'}; }
    return null; }});
QP.push({id:'2d.same',step:'2d',mode:'work',label:'the same set',open:()=>measured('2d'),make(){
    const B=pick(THINGS), [a,b,c,d]=take(B.things,4), three=Math.random()<0.5, base=three?[a,b,c]:[a,b];
    const sh=xs=>'{'+xs.join(', ')+'}', given=three?pick([[a,b,c,a],[b,a,c,b],[c,c,a,b]]):pick([[a,b,a],[b,a,b],[a,a,b]]);
    const right=three?pick([[c,a,b],[b,c,a],[c,b,a]]):[b,a];
    const wrong=shuffle(three?[sh([a,b]),sh([a,b,c,d]),'{{'+[a,b,c].join(', ')+'}}',sh([a,c]),'{'+a+', {'+b+', '+c+'}}']:[sh([a]),sh([a,b,c]),'{{'+a+', '+b+'}}',sh([b]),'{{'+a+'}, {'+b+'}}']).slice(0,3);
    return {index:'q:2d.same['+sh(given)+'>'+sh(right)+']', a3:['2d.same',DASH,B.id], lines:[[sh(given),'a set, listed']], ask:'Which list names the same set?', right:sh(right), opts:shuffle([sh(right),...wrong]),
      why:'A set is known by what is on its list and nothing else. A repeat and a new order name the same set, since the same things are in each: the same-members axiom. Each other list drops a member, adds one, or lists a set where a member stood.'}; }});

/* ---------- 2e Sifting ---------- */
QP.push({id:'2e.sift',step:'2e',mode:'word',label:'a sift',open:()=>measured('2e'),make(){
    for(let tries=0;tries<40;tries++){ const B=pick(THINGS), P=pick(B.props), W=take(B.things,3+rnd(2)), pass=W.filter(t=>P[2].includes(t)), fail=W.filter(t=>!P[2].includes(t));
      const out=B.things.filter(t=>!W.includes(t)&&P[2].includes(t)); const u=lset(W), R=lset(pass);
      const cand=[lset(fail),u,out.length?lset(pass.concat([out[0]])):null,pass.length>1?lset(pass.slice(1)):null,fail.length?lset(pass.concat([fail[0]])):null,lset([]),out.length?lset([out[0]]):null].filter(Boolean);
      const wrong=[]; cand.forEach(x=>{ const k=lshow(x); if(wrong.length<3&&!lsame(x,R)&&!wrong.includes(k)) wrong.push(k); }); if(wrong.length<3) continue;
      const facts='Given, of the members of u: “x '+P[0]+'” is so of '+(pass.length?listed(pass):'none of them')+(fail.length&&pass.length?', and not so of '+listed(fail):'')+'.';
      return {index:'q:2e.sift['+B.id.slice(7)+';'+W.join(',')+';'+P[1]+']', a3:['2e.sift['+P[1]+']',DASH,B.id], story:'Let u = '+lshow(u)+'. '+facts, lines:[['{x ∈ u : x '+P[0]+'}','a sift of u']],
        ask:'Which set is it?', right:lshow(R), opts:shuffle([lshow(R),...wrong]), lead:'It is '+lshow(R)+'. ',
        why:'The sift keeps exactly the members of u that pass the condition'+(pass.length?': '+listed(pass):', and here none passes, so it is the empty set')+'. Sifting never adds: whatever the condition, the sifted set is part of u'+(out.length?', so the '+out[0]+', which is not in u, is not in it':'')+'.'}; }
    return null; }});

/* ---------- 2f Gather and Merge ---------- */
QP.push({id:'2f.sets',step:'2f',mode:'work',label:'union, common members, members left over',open:()=>measured('2f'),make(){
    const EX=['d ∪ b','d ∩ b','d ∖ b','b ∖ d','(d ∪ b) ∖ c','(d ∩ b) ∪ c','d ∩ (b ∪ c)','d ∖ (b ∩ c)','(d ∖ b) ∪ (b ∖ d)','(d ∪ c) ∩ b','d ∪ (b ∩ c)','(d ∖ c) ∩ b','c ∖ (d ∪ b)','(c ∖ d) ∩ (c ∖ b)'];
    for(let tries=0;tries<40;tries++){ const B=pick(THINGS), ex=pick(EX), t=tparse(ex), L=tatoms(t), ps=shuffle(B.props.slice());
      const env={d:lset(ps[0][2]),b:lset(take(B.things,3)),c:lset(ps[1][2].concat(take(B.things,1)))}; const R=lval(t,env);
      const wrong=[]; tslips(t).map(z=>lval(z,env)).concat([env.d,env.b,lun(env.d,env.b),lint(env.d,env.b),lset([])]).forEach(x=>{ const k=lshow(x); if(wrong.length<3&&!lsame(x,R)&&!wrong.includes(k)) wrong.push(k); });
      if(wrong.length<3) continue;
      return {index:'q:2f.sets['+B.id.slice(7)+';'+L.map(l=>lshow(env[l])).join(';')+';'+ex+']', a3:['2f.sets['+ex+']',DASH,B.id], stack:true, lines:L.map(l=>[l+' = '+lshow(env[l]),'given']).concat([[ex,'a set']]),
        ask:'Which set is it?', right:lshow(R), opts:shuffle([lshow(R),...wrong]), lead:'It is '+lshow(R)+'. ',
        why:'Read each mark off its membership line: a thing is in a union when it is in one side or the other, in the common members when it is in both, and in the members left over when it is in the first and not in the second. Worked from the inside brackets out, that leaves '+lshow(R)+'.'}; }
    return null; }});
QP.push({id:'2f.merge',step:'2f',mode:'work',label:'a merge',open:()=>measured('2f'),make(){
    for(let tries=0;tries<40;tries++){ const B=pick(THINGS), [a,b,c,d]=take(B.things,4), shape=rnd(4);
      const s=shape===0?lset([lset([a,b]),lset([b,c])]):shape===1?lset([lset([a,b])]):shape===2?lset([lset([a]),lset([b,c]),lset([c,d])]):lset([lset([a,b]),lset([])]);
      const R=s.s.reduce((x,y)=>lun(x,y),lset([])), wrong=[];
      [s.s.reduce((x,y)=>lint(x,y)),s,lset([R]),lset(R.s.slice(1)),lset([a,b,c,d]),lset([])].forEach(x=>{ const k=lshow(x); if(wrong.length<3&&!lsame(x,R)&&!wrong.includes(k)) wrong.push(k); });
      if(wrong.length<3) continue;
      return {index:'q:2f.merge['+lshow(s)+']', a3:['2f.merge['+shape+']',DASH,B.id], lines:[['⋃'+lshow(s),'a merge']], ask:'Which set is it?', right:lshow(R), opts:shuffle([lshow(R),...wrong]), lead:'It is '+lshow(R)+'. ',
        why:'Tip every member of the set out and gather up everything that fell: a thing is in the merge exactly when it is in some member. The members here are '+s.s.map(lshow).join(' and ')+'.'}; }
    return null; }});
/* the set techniques of 2f10, each a technique of 1f under the same name; the not-through technique for intersection is one inclusion only, so it is no link of a sameness chain */
LINKS.push(
  rwLink('2f.sturnabout','2f','the turn-about technique for union and intersection',[['A ∪ B','B ∪ A'],['A ∩ B','B ∩ A']],'set'),
  rwLink('2f.sregroup','2f','the regroup technique for union and intersection',[['(A ∪ B) ∪ C','A ∪ (B ∪ C)'],['(A ∩ B) ∩ C','A ∩ (B ∩ C)']],'set'),
  rwLink('2f.sagain','2f','the say-it-again technique for sets',[['A ∪ A','A'],['A ∩ A','A']],'set'),
  rwLink('2f.sabsorb','2f','the absorb technique for sets',[['A ∪ (A ∩ B)','A'],['A ∩ (A ∪ B)','A']],'set'),
  rwLink('2f.sspreadand','2f','the spread technique for intersection over union',[['A ∩ (B ∪ C)','(A ∩ B) ∪ (A ∩ C)']],'set'),
  rwLink('2f.sspreador','2f','the spread technique for union over intersection',[['A ∪ (B ∩ C)','(A ∪ B) ∩ (A ∪ C)']],'set'),
  rwLink('2f.sunits','2f','the units technique for sets',[['A ∪ ∅','A'],['A ∩ ∅','∅']],'set'),
  rwLink('2f.snotor','2f','the not-through technique for union',[['C ∖ (A ∪ B)','(C ∖ A) ∩ (C ∖ B)']],'set'));
const SET_SEEDS=['d ∩ (b ∪ c)','d ∪ (b ∩ c)','(d ∪ b) ∩ c','(d ∩ b) ∪ c','c ∖ (d ∪ b)','(d ∩ b) ∪ (d ∩ c)','(d ∪ b) ∩ (d ∪ c)','d ∪ (d ∩ b)','d ∩ (d ∪ b)','(d ∪ b) ∪ c','(d ∩ b) ∩ c','(c ∖ d) ∩ (c ∖ b)',
  '(d ∩ b) ∪ (b ∩ d)','d ∩ (b ∪ d)','(d ∪ ∅) ∩ b','(d ∩ d) ∪ b','c ∖ (b ∪ (d ∩ b))','(d ∪ b) ∩ (b ∪ d)','d ∪ (b ∪ d)','(d ∩ c) ∪ (b ∩ c)','c ∖ ((d ∪ b) ∪ d)','(d ∩ (b ∪ c)) ∪ d'];
SEEDS.push({id:'2f.sets',step:'2f',label:'sets, by letter',open:()=>measured('2f'),
  make(){ const k=rnd(SET_SEEDS.length), L=shuffle(['d','b','c']); return {kind:'set',t:relabel(tparse(SET_SEEDS[k]),{d:L[0],b:L[1],c:L[2]}),ix:'['+k+','+L.join('')+']'}; }});
SKIND['2f.sets']='set';

/* ---------- 2g All the Subsets ---------- */
QP.push({id:'2g.power',step:'2g',mode:'work',label:'all the subsets',open:()=>measured('2g'),make(){
    const B=pick(THINGS), n=1+rnd(2), xs=take(B.things,n), u=lset(xs), R=lpow(u), [a,b]=xs;
    const cand=n===1?[lset([lset([a])]),lset([a]),lset([lset([]),a]),lset([lset([])]),lset([lset([]),lset([lset([a])])])]
      :[lset([lset([a]),lset([b]),lset([a,b])]),lset([lset([]),lset([a]),lset([b])]),lset([lset([]),a,b,lset([a,b])]),lset([lset([a]),lset([b])]),u];
    const wrong=shuffle(cand.map(lshow).filter(k=>k!==lshow(R))).slice(0,3);
    return {index:'q:2g.power['+lshow(u)+']', a3:['2g.power['+n+']',DASH,B.id], lines:[['𝒫('+lshow(u)+')','the set of all the subsets']], ask:'Which set is it?', right:lshow(R), opts:shuffle([lshow(R),...wrong]), lead:'It is '+lshow(R)+'. ',
      why:'Keep or drop: go through the members in turn, and each set made so far comes back kept and dropped. Dropping everything gives ∅, keeping everything gives '+lshow(u)+' itself, and both are always on the list. The members of 𝒫 are subsets, never the bare members.'}; }},
  {id:'2g.missing',step:'2g',mode:'work',label:'keep or drop',open:()=>measured('2g'),make(){
    const B=pick(THINGS), xs=take(B.things,3), u=lset(xs), all=shuffle(lpow(u).s), gone=all[0], kept=all.slice(1), wrong=shuffle(kept).slice(0,3);
    return {index:'q:2g.missing['+lshow(u)+';'+lshow(gone)+']', a3:['2g.missing',DASH,B.id], stack:true, lines:[['u = '+lshow(u),'given'],[kept.map(lshow).join(', '),'subsets of u, one short']],
      ask:'Which subset of u is missing from the list?', right:lshow(gone), opts:shuffle([gone,...wrong]).map(lshow), lead:'It is '+lshow(gone)+'. ',
      why:'Each member is kept or dropped, so three members give eight subsets, from ∅ (drop all) to u itself (keep all). Seven are listed, and '+lshow(gone)+' is the one that is not.'}; }},
  {id:'2g.inpower',step:'2g',label:'in, and part of, again',open:()=>measured('2g'),make(){
    for(let tries=0;tries<40;tries++){ const B=pick(THINGS), [a,b,c]=take(B.things,3), u=lset([a,b]), PW=lpow(u), e=lset([]);
      const cand=[[e,'∈'],[a,'∈'],[lset([a]),'∈'],[lset([a]),'⊆'],[u,'∈'],[u,'⊆'],[lset([lset([a])]),'⊆'],[lset([lset([a])]),'∈'],[e,'⊆'],[lset([c]),'∈'],[lset([a,c]),'∈'],[lset([e]),'⊆'],[lset([lset([a]),lset([b])]),'⊆'],[b,'∈']];
      const so=x=>x[1]==='∈'?lhas(PW,x[0]):lsub(x[0],PW), show=x=>lshow(x[0])+' '+x[1]+' 𝒫('+lshow(u)+')';
      const yes=shuffle(cand.filter(so)), no=shuffle(cand.filter(x=>!so(x))); const R=yes[0], wrong=no.slice(0,3);
      return {index:'q:2g.inpower['+lshow(u)+';'+show(R)+']', a3:['2g.inpower',DASH,B.id], lines:[], ask:'Which line is so?', right:show(R), opts:shuffle([R,...wrong]).map(show), lead:'It is '+show(R)+'. ',
        why:'The members of 𝒫('+lshow(u)+') are the subsets of '+lshow(u)+': '+PW.s.map(lshow).join(', ')+'. ∈ asks whether a thing is on that list; ⊆ asks whether every member of a thing is on it.'}; }
    return null; }});

/* ---------- 2h Pairs in Order ---------- */
QP.push({id:'2h.equal',step:'2h',mode:'work',label:'equal pairs',open:()=>measured('2h'),make(){
    const B=pick(THINGS), [a,b,c]=take(B.things,3), v=rnd(3);
    const L=v===0?'(x, '+b+') = ('+a+', y)':v===1?'('+a+', x) = (y, '+b+')':'(x, y) = ('+a+', '+b+')';
    const xa=v===1?b:a, yb=v===1?a:b, right='x = '+xa+' and y = '+yb;
    return {index:'q:2h.equal['+L+']', a3:['2h.equal['+v+']',DASH,B.id], lines:[[L,'given']], ask:'What does the line give?', right, opts:shuffle([right,'x = '+yb+' and y = '+xa,'x = y','x = '+xa+' and y = '+c]),
      why:'The equal-pairs technique: if two pairs are the same set, their left entries are the same and their right entries are the same. Left with left, right with right.'}; }},
  {id:'2h.product',step:'2h',mode:'work',label:'a product',open:()=>measured('2h'),make(){
    const [B1,B2]=take(THINGS,2), n=1+rnd(2), m=n===1?2:1+rnd(2), u=take(B1.things,n), b=take(B2.things,m), pr=(x,y)=>({p:[x,y]});
    const R=lset([].concat(...u.map(x=>b.map(y=>pr(x,y))))), cand=[lset([].concat(...b.map(y=>u.map(x=>pr(y,x))))),lset(u.concat(b)),lset(u.map((x,i)=>pr(x,b[i%b.length]))),lset([lset(u),lset(b)]),lset([pr(lset(u),lset(b))])];
    const wrong=[]; cand.forEach(x=>{ const k=lshow(x); if(wrong.length<3&&!lsame(x,R)&&!wrong.includes(k)) wrong.push(k); }); if(wrong.length<3) return null;
    return {index:'q:2h.product['+lshow(lset(u))+'×'+lshow(lset(b))+']', a3:['2h.product['+n+'×'+m+']',DASH,B1.id+'+'+B2.id], stack:true, lines:[['u = '+lshow(lset(u)),'given'],['b = '+lshow(lset(b)),'given'],['u × b','the product']],
      ask:'Which set is it?', right:lshow(R), opts:shuffle([lshow(R),...wrong]), lead:'It is '+lshow(R)+'. ',
      why:'The product is the set of all pairs with left entry in u and right entry in b: '+(n*m)+' pair'+(n*m>1?'s':'')+' here. Order matters in a pair, so the left entries all come from u.'}; }},
  {id:'2h.relation',step:'2h',label:'three properties',open:()=>measured('2h'),make(){
    for(let tries=0;tries<60;tries++){ const B=pick(THINGS), U=take(B.things,3), prs=[]; U.forEach(x=>U.forEach(y=>{ if(Math.random()<0.42) prs.push([x,y]); })); if(prs.length<2||prs.length>6) continue;
      const hasP=(x,y)=>prs.some(p=>p[0]===x&&p[1]===y), refl=U.every(x=>hasP(x,x)), sym=prs.every(p=>hasP(p[1],p[0])), trans=prs.every(p=>prs.every(q=>p[1]!==q[0]||hasP(p[0],q[1])));
      const props=[['reflexive',refl],['symmetric',sym],['transitive',trans]], yes=props.filter(p=>p[1]); if(yes.length>1) continue; if(!yes.length&&Math.random()<0.6) continue;
      const right=yes.length?yes[0][0]:'none of the three';
      const miss={reflexive:()=>{ const x=U.find(x=>!hasP(x,x)); return 'not reflexive: ('+x+', '+x+') is not in it'; }, symmetric:()=>{ const p=prs.find(p=>!hasP(p[1],p[0])); return 'not symmetric: ('+p[0]+', '+p[1]+') is in it and ('+p[1]+', '+p[0]+') is not'; },
        transitive:()=>{ let w; prs.forEach(p=>prs.forEach(q=>{ if(!w&&p[1]===q[0]&&!hasP(p[0],q[1])) w=[p,q]; })); return 'not transitive: ('+w[0].join(', ')+') and ('+w[1].join(', ')+') are in it and ('+w[0][0]+', '+w[1][1]+') is not'; }};
      return {index:'q:2h.relation['+U.join(',')+';'+prs.map(p=>p.join('>')).join(',')+']', a3:['2h.relation',DASH,B.id], stack:true, lines:[['u = '+lshow(lset(U)),'given'],['r = {'+prs.map(p=>'('+p.join(', ')+')').join(', ')+'}','a relation on u']],
        ask:'Which of the three properties does r have?', right, opts:['reflexive','symmetric','transitive','none of the three'], lead:'It is '+right+'. ',
        why:(yes.length?'Each property is an every about the pairs, and r passes this one. ':'')+'It is '+props.filter(p=>!p[1]).map(p=>miss[p[0]]()).join('; ')+'.'}; }
    return null; }});

/* ---------- 2j Every and Some by Hand: the four old sentences and the four valid forms ---------- */
const TERMS3=[['terrier','dog','mammal','bird'],['oak','tree','plant','stone'],['salmon','fish','animal','tree'],['tulip','flower','plant','tool'],['ferry','boat','vessel','bridge']];
TERMS3.forEach((x,i)=>BANK.push({id:'terms.'+x[1],step:'2j',kind:'terms',w:x,open:()=>measured('2j')}));
/* a sentence is [kind, subject letter, predicate letter]; kinds A E I O as 2j5 spells them */
const osent=(k,s,p,W)=>k==='A'?'every '+W[s]+' is '+aOf(W[p]):k==='E'?'no '+W[s]+' is '+aOf(W[p]):k==='I'?'some '+W[s]+' is '+aOf(W[p]):'some '+W[s]+' is not '+aOf(W[p]);
const oline=(k,s,p)=>k==='A'?mline('∀',s+' ⇒ '+p):k==='E'?mline('∀',s+' ⇒ ¬'+p):k==='I'?mline('∃',s+' ∧ '+p):mline('∃',s+' ∧ ¬'+p);
const FORMS=[['Barbara','A','A','A'],['Celarent','E','A','E'],['Darii','A','I','I'],['Ferio','E','I','O']];
const cap=s=>s[0].toUpperCase()+s.slice(1);
function formDraw(){ const T=pick(BANK.filter(b=>b.kind==='terms')), F=pick(FORMS), neg=F[1]==='E', W={S:T.w[0],M:T.w[1],P:neg?T.w[3]:T.w[2]};
  return {T,F,W,prem:[[F[1],'M','P'],[F[2],'S','M']],concl:[F[3],'S','P']}; }
QP.push({id:'2j.forms',step:'2j',label:'the four valid forms',open:()=>measured('2j'),make(){
    const D=formDraw(), say=x=>cap(osent(x[0],x[1],x[2],D.W))+'.';
    return {index:'q:2j.forms['+D.F[0]+';'+D.T.id+']', a3:['2j.forms',DASH,D.T.id], stack:true, lines:[[say(D.prem[0]),'given'],[say(D.prem[1]),'given'],[say(D.concl),null]], ask:'Which technique licenses the line marked ?', right:D.F[0], opts:FORMS.map(f=>f[0]),
      why:D.F[0]+' is '+D.F.slice(1).join(', ')+': '+(D.F[1]==='A'?'every M is P':'no M is P')+', '+(D.F[2]==='A'?'every S is M':'some S is M')+', so '+(D.F[3]==='A'?'every S is P':D.F[3]==='E'?'no S is P':D.F[3]==='I'?'some S is P':'some S is not P')+'. The middle term here is “'+D.W.M+'”.'}; }},
  {id:'2j.follows',step:'2j',mode:'work',label:'what follows',open:()=>measured('2j'),make(){
    const D=formDraw(), P=D.prem.map(x=>oline(...x)), all=[]; ['A','E','I','O'].forEach(k=>{ all.push([k,'S','P'],[k,'P','S']); });
    const gives=all.filter(x=>mgives(P,oline(...x))), key=x=>x.join(''), right=D.concl;
    const wrong=shuffle(all.filter(x=>key(x)!==key(right)&&!gives.some(g=>key(g)===key(x)))).slice(0,3), say=x=>cap(osent(x[0],x[1],x[2],D.W))+'.';
    if(!gives.some(g=>key(g)===key(right))||wrong.length<3) return null;
    return {index:'q:2j.follows['+D.F[0]+';'+D.T.id+';'+wrong.map(key).join(',')+']', a3:['2j.follows['+D.F[0]+']',DASH,D.T.id], stack:true, lines:[[say(D.prem[0]),'given'],[say(D.prem[1]),'given'],['▢','so']],
      ask:'Which line follows from the two givens?', right:say(right), opts:shuffle([right,...wrong]).map(say), lead:'It is “'+say(right)+'” ',
      why:'The form is '+D.F[0]+'. The middle term “'+D.W.M+'” links the givens and vanishes from the conclusion. Each other line has a world where both givens are so and it is not.'}; }},
  {id:'2j.bad',step:'2j',mode:'proof',label:'a form that fails',open:()=>measured('2j'),make(){
    for(let tries=0;tries<40;tries++){ const D1=formDraw(), D2=formDraw(); if(D1.T===D2.T||D1.F===D2.F) continue; const which=rnd(2), D=[D1,D2][which];
      const P=D.prem.map(x=>oline(...x)), all=[]; ['A','E','I','O'].forEach(k=>{ all.push([k,'S','P'],[k,'P','S']); });
      const slip=shuffle(all.filter(x=>!mgives(P,oline(...x))&&(x[0]===D.concl[0]||x[1]===D.concl[1])))[0]; if(!slip) continue;
      const say=(x,W)=>cap(osent(x[0],x[1],x[2],W))+'.', rows=[];
      [D1,D2].forEach((d,i)=>{ const base=rows.length; rows.push([say(d.prem[0],d.W),'given'],[say(d.prem[1],d.W),'given'],[i===which?say(slip,d.W):say(d.concl,d.W),d.F[0]+', on lines '+(base+1)+' and '+(base+2)]); });
      const bad=which*3+3;
      return {index:'q:2j.bad['+D1.F[0]+D1.T.id+';'+D2.F[0]+D2.T.id+';'+which+slip.join('')+']', a3:['2j.bad',D1.F[0]+'+'+D2.F[0],D1.T.id+'+'+D2.T.id], stack:true, lines:rows,
        ask:'One line does not follow from what it cites. Which line is the bad line?', right:'line '+bad, opts:['line 3','line 6'], lead:'The bad line is line '+bad+'. ',
        why:D.F[0]+' licenses “'+say(D.concl,D.W)+'” from those two givens. The line as written does not follow: there is a world where both givens are so and it is not.'}; }
    return null; }},
  {id:'2j.denial',step:'2j',label:'the crossing links',open:()=>measured('2j'),make(){
    const T=pick(BANK.filter(b=>b.kind==='terms')), B=pick(KINDS), a=pick(B.adjs)[0], n=pick(B.nouns)[0], k=pick(['A','E','I','O']), cross={A:'O',O:'A',E:'I',I:'E'};
    const say=k=>k==='A'?'Every '+n+' is '+a+'.':k==='E'?'No '+n+' is '+a+'.':k==='I'?'Some '+n+' is '+a+'.':'Some '+n+' is not '+a+'.';
    return {index:'q:2j.denial['+k+';'+n+';'+a+']', a3:['2j.denial['+k+']',DASH,B.id], lines:[[say(k),'a sentence']], ask:'Which sentence is its denial: never both so, and never both not so?', right:say(cross[k]), opts:shuffle(['A','E','I','O'].filter(x=>x!==k).map(say)),
      why:'The crossing links: an every sentence and its some-not sentence, and a no sentence and its some sentence, are each the other’s denial, whatever the subject. The other pairs can both be so, or both be not so, when the subject is empty.'}; }});

/* ---------- 2k What Holds of the Set ---------- */
QP.push({id:'2k.carries',step:'2k',label:'what the set hands to its members',open:()=>measured('2k'),make(){
    const B=pick(THINGS), P=pick(B.props.filter(p=>p[2].length>1)), t=pick(P[2]), name='{x ∈ u : x '+P[0]+'}';
    const C=[['The '+t+' '+P[0]+'.',true,'the condition made the members members, so it holds of each one'],
      ['Everything in the set '+P[0]+'.',true,'a guess about the set is a guess about every member, made once'],
      ['The '+t+' has '+P[2].length+' members.',false,'the count belongs to the set, and the '+t+' is a member, not the set'],
      ['The '+t+' is a set.',false,'a member is not the set'],
      ['The '+t+' is part of u.',false,'the set is part of u; the '+t+' is in u, a member'],
      ['Everything in u '+P[0]+'.',false,'the condition was handed to what the sift kept, not to all of u']];
    const R=pick(C.filter(c=>c[1])), wrong=shuffle(C.filter(c=>!c[1])).slice(0,3);
    return {index:'q:2k.carries['+B.id.slice(7)+';'+P[1]+';'+t+';'+R[0]+';'+wrong.map(w=>w[0].length).join('')+']', a3:['2k.carries',DASH,B.id], story:'A set u of things is sifted: '+name+'. The sifted set has '+P[2].length+' members, and the '+t+' is one of them.', lines:[],
      ask:'Which line does this make sure?', right:R[0], opts:shuffle([R,...wrong]).map(c=>c[0]), lead:'It is “'+R[0]+'” ',
      why:'A set made by a condition hands that condition to every member: '+R[2]+'. It does not carry what holds only of the whole. The others: '+wrong.map(w=>w[2]).join('; ')+'.'}; }});

/* ===== Laundry 5, rung 3 (floor 1 pools, stage C): 3a 3b 3c 3d 3e 3f 3g ===== */
Object.assign(STEPS,{'3a':['r03a','Earning Outputs'],'3b':['r03b','Necessary and Possible'],'3c':['r03c','The Next One'],'3d':['r03d','Inductive Sets and the Axiom of Infinity'],
  '3e':['r03e','Sets Collect Type, Bigness and Order'],'3f':['r03f','Why Infinity Is Chosen, Not Discovered'],'3g':['r03g','Raining, All the Way']});

/* the named sets of 3c: 0 is ∅ and each next one is S(x) = x ∪ {x}; a listed set is shown with the names it has */
const nS=x=>lun(x,lset([x])), NUMS=[lset([])]; for(let i=1;i<=5;i++) NUMS.push(nS(NUMS[i-1]));
const nname=x=>{ if(typeof x==='string') return x; const i=NUMS.findIndex(n=>lsame(n,x)); return i>=0&&i<=4?String(i):i===5?'S(4)':'{'+x.s.map(nname).join(', ')+'}'; };
const nlist=x=>'{'+x.s.map(nname).join(', ')+'}';

/* ---------- 3a Earning Outputs: boxes ---------- */
function boxDraw(){ const [p,q,r]=shuffle(['P','Q','R','S']).slice(0,3), cite='carry an if through, rows ', kind=pick(['if','refute','free']);
  if(kind==='if') return {kind,p,q,r,out:p+' ⇒ '+r,rows:[[p+' ⇒ '+q,'given'],[q+' ⇒ '+r,'given'],['│ '+p,'suppose'],['│ '+q,cite+'1 and 3'],['│ '+r,cite+'2 and 4'],[p+' ⇒ '+r,'prove an if, rows 3 to 5']],
    slips:[[6,r,'A row outside a box may never lean on a row inside it. '+r+' was reached only under the supposition '+p+', so the box’s report is the if: '+p+' ⇒ '+r+'.'],[6,r+' ⇒ '+p,'The box supposed '+p+' and reached '+r+', so its report runs from '+p+' to '+r+', not back.'],
      [5,null,'Row 2 is “'+q+' ⇒ '+r+'”. Rows 1 and 4 are “'+p+' ⇒ '+q+'” and “'+q+'”: that if fires only on '+p+', and gives '+q+' again, not '+r+'.',cite+'1 and 4']],
    decoys:[r,r+' ⇒ '+p,q+' ⇒ '+r,p+' ∧ '+r]};
  if(kind==='refute') return {kind,p,q,r,out:'¬'+p,rows:[[p+' ⇒ '+q,'given'],['¬'+q,'given'],['│ '+p,'suppose'],['│ '+q,cite+'1 and 3'],['│ ⊥','clash, rows 2 and 4'],['¬'+p,'refute, rows 3 to 5']],
    slips:[[6,p,'Refute writes the denial of what the box supposed. The box supposed '+p+' and reached ⊥, so its output is ¬'+p+'.'],[6,'⊥','⊥ was reached only under the supposition. The box closes and reports ¬'+p+'; nothing totally false stands at the margin.'],
      [5,null,'A clash needs a statement and its denial. Rows 1 and 4 are “'+p+' ⇒ '+q+'” and “'+q+'”; the denial of '+q+' is row 2.','clash, rows 1 and 4']],
    decoys:[p,'⊥','¬'+q+' ⇒ '+p,'¬¬'+p]};
  return {kind,p,q,r,out:p+' ⇒ '+q,rows:[['¬'+p,'given'],['│ '+p,'suppose'],['│ ⊥','clash, rows 1 and 2'],['│ '+q,'when nothing is true, everything is permitted, row 3'],[p+' ⇒ '+q,'prove an if, rows 2 to 4']],
    slips:[[5,q,q+' was reached only inside the box, from ⊥. Outside the box only the report stands: '+p+' ⇒ '+q+', a free if from the denied condition.'],[5,q+' ⇒ '+p,'The box supposed '+p+' and reached '+q+', so its report is '+p+' ⇒ '+q+'.'],
      [4,null,'That move needs ⊥ in hand, and row 3 is the row that holds it. Row 2 is only the supposition.','when nothing is true, everything is permitted, row 2']],
    decoys:[q,q+' ⇒ '+p,'¬'+q,p+' ∧ '+q]}; }
QP.push({id:'3a.box',step:'3a',mode:'proof',label:'boxes',open:()=>measured('3a'),make(){
    const D=boxDraw(), v=rnd(D.slips.length), [at,text,why,reason]=D.slips[v], rows=D.rows.map(x=>x.slice());
    if(text!==null) rows[at-1][0]=text; if(reason) rows[at-1][1]=reason;
    const der=rows.map((x,i)=>i+1).filter(i=>rows[i-1][1]!=='given'&&rows[i-1][1]!=='suppose');
    return {index:'q:3a.box['+D.kind+';'+D.p+D.q+D.r+';'+v+']', a3:['1d.letters['+D.p+D.q+D.r+']','3a.box',DASH], stack:true, lines:rows,
      ask:'One row does not follow from the rows it cites. Which row is the bad row?', right:'row '+at, opts:der.map(i=>'row '+i), lead:'The bad row is row '+at+'. ', why}; }},
  {id:'3a.output',step:'3a',mode:'work',label:'what a box reports',open:()=>measured('3a'),make(){
    const D=boxDraw(), rows=D.rows.map(x=>x.slice()), n=rows.length; rows[n-1][0]='▢';
    return {index:'q:3a.output['+D.kind+';'+D.p+D.q+D.r+']', a3:['1d.letters['+D.p+D.q+D.r+']','3a.output',DASH], stack:true, lines:rows, ask:'The box is closed. What does row '+n+' write?', right:D.out, opts:shuffle([D.out,...shuffle(D.decoys).slice(0,3)]),
      lead:'It writes '+D.out+'. ', why:D.kind==='refute'?'Refute: the box supposed '+D.p+' and reached ⊥, so the output is the denial of the supposition.':'Prove an if: the box supposed '+D.p+' and reached '+(D.kind==='if'?D.r:D.q)+', so the output is the if from the one to the other. It leans on nothing that was only tried.'}; }});

/* ---------- 3b Necessary and Possible ---------- */
const MODAL=[
  ['Necessarily, if {p}, then {q}.','□(P ⇒ Q)',['P ⇒ □Q','◇(P ⇒ Q)','□P ⇒ Q'],'The □ sits in front of the whole if: whatever else is so, the if holds. Sliding it onto the result claims more.'],
  ['If {p}, then necessarily {q}.','P ⇒ □Q',['□(P ⇒ Q)','P ⇒ ◇Q','□P ⇒ Q'],'Here the □ sits on the result alone: the if hands over a necessity. That claims more than a necessary if.'],
  ['Possibly, {p} and {q}.','◇(P ∧ Q)',['□(P ∧ Q)','◇P ∧ Q','◇P ⇒ ◇Q'],'Possible is a some over the ways things could go: at least one way holds both together, so the ◇ reaches the whole and.'],
  ['It is not possible that {p}.','¬◇P',['◇¬P','¬□P','□P'],'The not is put on last, in front of the ◇: no way of supposing it escapes a clash.'],
  ['Possibly, it is not so that {p}.','◇¬P',['¬◇P','□¬P','¬□¬P'],'The ◇ is the main mark and the not sits inside it: some way things could go holds the denial.'],
  ['Necessarily, {p}.','□P',['◇P','¬◇P','P ⇒ □P'],'Necessary is an every over the ways things could go: whatever you suppose, it comes out.']];
QP.push({id:'3b.say',step:'3b',mode:'word',label:'necessary and possible in marks',open:()=>measured('3b'),make(){
    const k=rnd(MODAL.length), [text,right,wrong,why]=MODAL[k], B=pick(BANK.filter(b=>b.kind==='prop')), two=/\{q\}/.test(text);
    return {index:'q:3b.say['+k+';'+B.id+']', a3:['3b.sentences['+k+']',DASH,B.id], story:'Let P be “'+B.p+'”.'+(two?' Let Q be “'+B.q+'”.':'')+' The sentence: “'+text.replace('{p}',B.p).replace('{q}',B.q)+'”', lines:[],
      ask:'Which line writes the sentence in marks?', right, opts:shuffle([right,...wrong]), lead:'It is '+right+'. ', why}; }},
  {id:'3b.gives',step:'3b',label:'the two together',open:()=>measured('3b'),make(){
    const p=pick(['P','Q','R']), v=rnd(2);
    return v===0?{index:'q:3b.gives['+p+'0]', lines:[['□'+p,'in hand']], ask:'Which line does it give?', right:'¬◇¬'+p, opts:shuffle(['¬◇¬'+p,'◇¬'+p,'¬◇'+p,'□¬'+p]),
        why:'If '+p+' is necessary, then not-'+p+' is not possible: every way reaches '+p+', so no way holds its denial without a clash. It is the way an every gives “no counterexample”.'}
      :{index:'q:3b.gives['+p+'1]', lines:[['¬◇¬'+p,'in hand']], ask:'Can □'+p+' be written from it, with the techs of this rung?', right:'not yet: the way back waits for rung 7', opts:['yes: each gives the other','not yet: the way back waits for rung 7','yes, by refute','no: it is totally false'],
        why:'□'+p+' gives ¬◇¬'+p+'. The way back, from “not-'+p+' is not possible” to “'+p+' is necessary”, needs the step from ¬¬ that no tech yet takes.'}; }});

/* ---------- 3c The Next One ---------- */
QP.push({id:'3c.next',step:'3c',mode:'work',label:'the next one',open:()=>measured('3c'),make(){
    const v=rnd(4); let x, show, R, cand, why;
    if(v===0){ const k=rnd(4); x=NUMS[k]; show='S('+k+')'; R=nS(x); cand=[NUMS[k],lset([x]),lset([x,lset([x])]),NUMS[k+2]||NUMS[0]];
      const wrong=[...new Set(cand.map(nlist))].filter(o=>o!==nlist(R)).slice(0,3); if(wrong.length<3) return null;
      return {index:'q:3c.next[n'+k+']', lines:[[show,'the next one']], ask:'Which listed set is it?', right:nlist(R), opts:shuffle([nlist(R),...wrong]),
        why:'S(x) = x ∪ {x}: whatever x had in it, together with x itself as a new member. So '+show+' has the members of '+k+' and '+k+' itself: '+nlist(R)+', which is named '+nname(R)+'.'}; }
    if(v===1){ const a=1+rnd(3), b=rnd(a); x=lset(Math.random()<0.5?[NUMS[a]]:[NUMS[b],NUMS[a]].filter((y,i,ar)=>ar.findIndex(z=>lsame(z,y))===i)); if(NUMS.some(n=>lsame(n,x))) return null;
      R=nS(x); cand=[lset([x,lset([x])]),lset([x]),lun(x,lset([lset([x])])),lset(x.s.concat(x.s.map(nS)))];
      const wrong=[...new Set(cand.map(nlist))].filter(o=>o!==nlist(R)).slice(0,3); if(wrong.length<3) return null;
      return {index:'q:3c.next[s'+nlist(x)+']', lines:[['S('+nlist(x)+')','the next one']], ask:'Which listed set is it?', right:nlist(R), opts:shuffle([nlist(R),...wrong]),
        why:'S is a move on any set: S(x) = x ∪ {x}. The result keeps every member of '+nlist(x)+' and adds '+nlist(x)+' itself as one new member.'}; }
    if(v===2){ const k=2+rnd(3); R=NUMS[k-1];
      return {index:'q:3c.next[m'+k+']', lines:[['⋃'+k,'a merge']], ask:'Which named set is it?', right:String(k-1), opts:shuffle([String(k-1),String(k),String(k-2),k<4?String(k+1):'S(4)']),
        why:'Merging runs S backwards on the named sets: every member of '+k+' is also a part of '+k+', so tipping the members out gives nothing that was not already in the largest of them, '+(k-1)+'.'}; }
    const k=1+rnd(4), wr=[...new Set(['{'+Array.from({length:k},(_,i)=>i+1).join(', ')+'}','{'+k+'}',k>1?'{'+(k-1)+'}':'∅',nlist(NUMS[k+1]),nlist(NUMS[k-1])])].filter(o=>o!==nlist(NUMS[k])).slice(0,3);
    return {index:'q:3c.next[l'+k+']', lines:[[String(k),'a named set']], ask:'Which listed set does the name stand for?', right:nlist(NUMS[k]), opts:shuffle([nlist(NUMS[k]),...wr]),
      why:'Each named set is the set of exactly the ones named before it: '+k+' = '+nlist(NUMS[k])+'.'}; }},
  {id:'3c.names',step:'3c',label:'members and parts of the named sets',open:()=>measured('3c'),make(){
    const cand=[]; for(let a=0;a<=4;a++) for(let b=0;b<=4;b++){ cand.push([a,'∈',b,a<b],[a,'⊆',b,a<=b]); if(a!==b) cand.push([a,'=',b,false]); }
    const yes=shuffle(cand.filter(c=>c[3]&&c[0]!==c[2])), no=shuffle(cand.filter(c=>!c[3])), R=yes[0], wrong=[]; no.forEach(c=>{ if(wrong.length<3&&!wrong.some(w=>w[1]===c[1]&&wrong.filter(z=>z[1]===c[1]).length>=2)) wrong.push(c); });
    const show=c=>c[0]+' '+c[1]+' '+c[2];
    return {index:'q:3c.names['+show(R)+';'+wrong.map(show).join(',')+']', lines:[], ask:'Which line is so of the named sets?', right:show(R), opts:shuffle([R,...wrong]).map(show), lead:'It is '+show(R)+'. ',
      why:'Each named set is the set of the ones named before it. So one is a member of another exactly when it is named earlier, and a part of another exactly when it is named earlier or is the same. Here '+R[2]+' = '+nlist(NUMS[R[2]])+'.'}; }});

/* ---------- 3d Inductive Sets ---------- */
QP.push({id:'3d.witness',step:'3d',label:'not inductive: the witness',open:()=>measured('3d'),make(){
    for(let tries=0;tries<40;tries++){ const I=[0,1,2,3,4].filter(()=>Math.random()<0.6); if(!I.length) continue; const has=k=>I.includes(k), nm=k=>k===5?'S(4)':String(k);
      const base=['the base part: 0 is not in it',!has(0)], step=k=>['the step part at '+k+': '+k+' is in it and '+nm(k+1)+' is not',has(k)&&!has(k+1)];
      const all=[base,...[0,1,2,3,4].map(step)], yes=shuffle(all.filter(c=>c[1])), no=shuffle(all.filter(c=>!c[1])); if(!yes.length||no.length<3) continue;
      const R=yes[0], wrong=no.slice(0,3), text='{'+I.join(', ')+'}';
      return {index:'q:3d.witness['+text+';'+R[0].slice(0,22)+']', lines:[['I = '+text,'given']], ask:'I is not inductive. Which witness shows it?', right:R[0], opts:shuffle([R,...wrong]).map(c=>c[0]), lead:'It is '+R[0]+'. ',
        why:'Inductive means: the set holds 0, and whenever it holds a set it holds that set’s next one. A witness is 0 missing, or a member whose next one is missing. A step part can only fail at a member: where the set does not hold x, the if has a false first half.'}; }
    return null; }});

/* ---------- 3e Sets Collect Type, Bigness and Order ---------- */
const COUNTED=[['barge','in the tow'],['crate','off the truck'],['sack','on the scale'],['tulip','in the row'],['ferry','of the morning'],['bin','in the shed'],['salmon','over the ladder'],['pear','in the box']];
const ORD=['','1st','2nd','3rd','4th','5th','6th','7th','8th','9th'];
QP.push({id:'3e.counts',step:'3e',label:'the two counts',open:()=>measured('3e'),make(){
    const [w,where]=pick(COUNTED), n=2+rnd(8), order=Math.random()<0.5, text=order?'the '+ORD[n]+' '+w+' '+where:n+' '+w+(w==='salmon'?'':'s')+' '+where;
    return {index:'q:3e.counts['+text+']', lines:[[text,'a count']], ask:'Which question does the number answer?', right:order?'order: which place':'bigness: how many', opts:['order: which place','bigness: how many'],
      why:order?'“'+ORD[n]+'” says which place, as “3rd base” does. It does not say how many there are in all.':'“'+n+'” says how many, as “3 to 2” does. It does not say which came first.'}; }},
  {id:'3e.type',step:'3e',mode:'work',label:'members, and members of members',open:()=>measured('3e'),make(){
    const B=pick(THINGS), ps=take(B.props.filter(p=>p[2].length>=1),2), C=lset(ps[0][2]), D=lset(ps[1][2].filter(t=>!ps[0][2].includes(t))); if(!D.s.length||lsame(C,D)) return null;
    const n=C.s.length+D.s.length, opts=[...new Set(['2',String(n),String(C.s.length),String(D.s.length),String(n+2)])]; if(opts.length<3) return null;
    return {index:'q:3e.type['+lshow(C)+';'+lshow(D)+']', a3:['3e.type',DASH,B.id], stack:true, lines:[['C = '+lshow(C),'given'],['D = '+lshow(D),'given'],['{C, D}','a set']], ask:'How many members has {C, D}?', right:'2', opts:shuffle(opts.slice(0,4)),
      why:'Its members are C and D, two of them. The '+n+' things are members of its members: {C, D} holds them as types only.'}; }});

/* ---------- 3f Why Infinity Is Chosen ---------- */
const F3=[
  ['The claim P is to be shown of every named number. Which checks make the start-and-step shape?','P(0); and for any u, if P(u) then P(S(u))',['P(0), P(1), P(2), P(3) and P(4), one argument each','for any u, if P(u) then P(S(u)), and nothing else','P(0) and P(S(0))'],'Check the claim for 0: the start. Show that whenever it holds for a set u it holds for S(u): the step. The step is one argument, with u any set.'],
  ['The start is moved to S(2). Of which numbers does the shape then speak?','the numbers from S(2) on',['every number from 0 on','the number S(2) only','the numbers before S(2)'],'The start need not be 0. Fix a number and start at its next one: the shape then speaks of the numbers from the start on.'],
  ['The layers: the bottom layer has nothing in it, and each layer above is all the subsets of the layer below. Which set is V₁?','{0}',['∅','{0, 1}','{1}'],'V₀ = ∅, and V₁ = 𝒫(V₀) = 𝒫(∅) = {∅}, which is {0}.'],
  ['The layers: V₀ = ∅, and each layer above is all the subsets of the layer below. Which set is V₂?','{0, 1}',['{0}','{0, 1, 2}','{1, 2}'],'V₁ = {0}, and V₂ = 𝒫({0}) = {∅, {0}}, which is {0, 1}.'],
  ['The layers: V₂ = {0, 1}, and V₃ is all its subsets. Which set is V₃?','{0, 1, {1}, 2}',['{0, 1, 2}','{0, 1, 2, 3}','{{0}, {1}, {0, 1}}'],'Keep or drop on {0, 1}: ∅, {0}, {1} and {0, 1}. By their names: 0, 1, {1} and 2.'],
  ['In the layered world every axiom of rungs 0 to 2 is true, and no set is inductive. What does that show of the axiom of infinity?','no proof of it from the axioms of rungs 0 to 2 can exist',['it is false','it is true in every world','it can be proved from the axioms of rungs 0 to 2'],'A world where the axioms hold and a statement fails refutes every supposed proof of the statement from them. It does not make the statement false: in another world it is true. Independent, not false.'],
  ['A line has held in a thousand worlds that were checked. What does that show?','nothing final: the next world may fail it, and the worlds do not run out',['that the line is always so','that the line has a proof','that the line is an axiom'],'One world is enough to refute a proof. No number of worlds makes one.'],
  ['The step of a start-and-step argument will not close. What is the usual cause, and the cure?','the claim for u is too weak to carry; make the claim stronger',['the start was wrong; start at 1','the step needs every case written out','the claim is false'],'When the step will not close, the claim for u is too weak to carry the claim for S(u). A stronger claim gives the step more to lean on.']];
QP.push({id:'3f.shape',step:'3f',label:'start and step, layers and worlds',open:()=>measured('3f'),make(){
    const k=rnd(F3.length), [ask,right,wrong,why]=F3[k], ws=shuffle(wrong.slice());
    return {index:'q:3f.shape['+k+';'+ws.map(w=>w.length).join('.')+']', lines:[], ask, right, opts:shuffle([right,...ws]), lead:'It is: '+right+'. ', why}; }});

/* ---------- 3g Raining, All the Way ---------- */
const RUNS=[['crate on the line','is sealed'],['drop that falls','is rain'],['barge in the tow','is lashed to the one ahead'],['row of the field','is planted'],['step of the stair','holds your weight'],['page of the ledger','balances']];
QP.push({id:'3g.keep',step:'3g',label:'start, and keep it',open:()=>measured('3g'),make(){
    const k=rnd(RUNS.length), [thing,prop]=RUNS[k], v=rnd(4);
    const startOk='The first '+thing+' '+prop+'.', stepOk='Whenever one '+thing+' '+prop+', the next '+prop+' too.';
    const told=v===0?startOk+' '+stepOk:v===1?stepOk+' Nothing is said of the first '+thing+'.':v===2?startOk+' Whenever one '+thing+' '+prop+', the next '+prop+' too, except after every tenth.':'The first five were looked at, and each '+prop+'.';
    const opts=['yes: the start holds and every step keeps it','no: the start was never checked','no: one step breaks it, and the guess stops there','no: five looked at are not a step'];
    return {index:'q:3g.keep['+k+';'+v+']', lines:[[told,'what is known']], ask:'Does the guess “every '+thing+' '+prop+'” cover every place the steps reach?', right:opts[v], opts, lead:'',
      why:['What holds at the start, and is kept by each step, holds of everything the steps reach. You check the start once and the step once, and the guess covers the rest.','The step only carries what the start hands it. With no start, nothing is carried.','The step has to keep the claim every time, with no exception. One step that breaks it, and the guess stops there.','Looking at cases is not the step. The step is one argument, from any one to its next.'][v]}; }});

/* ===== Laundry 5, rung 4 (floor 1 pools, stage D): 4a 4b 4c 4d 4e 4i 4l 4m (4f 4g 4h 4j 4k had pools already) ===== */
Object.assign(STEPS,{'4a':['r04a','Prove It'],'4b':['r04b','The Smallest Inductive Set'],'4c':['r04c','Induction'],'4d':['r04d','Defining by Repeating'],'4e':['r04e','Proof Shapes'],
  '4i':['r04i','Writing Numbers'],'4l':['r04l','What a Recipe for Answers Is Made Of'],'4m':['r04m','Processes Without Things']});
const setOf=xs=>xs.length?'{'+xs.join(', ')+'}':'∅';

/* ---------- 4a: a proof is a list of lines, each a pair (suppositions, statement); the citing rule ---------- */
QP.push({id:'4a.lean',step:'4a',mode:'proof',label:'the citing rule',open:()=>measured('4a'),make(){
    const L=['P','Q','R'], sub=()=>L.filter(()=>Math.random()<0.45), k=2+rnd(5); let j=rnd(8), Sj=sub(), Sk=sub(); if(Math.random()<0.25) Sj=Sk.filter(()=>Math.random()<0.6);
    if(j===k) j=k-1; const before=j<k, part=Sj.every(x=>Sk.includes(x)), st=pick(L), st2=pick(L);
    const opts=['allowed','not allowed: line '+j+' does not come before line '+k,'not allowed: '+setOf(Sj)+' is not a part of '+setOf(Sk)];
    const right=!before?opts[1]:!part?opts[2]:opts[0];
    return {index:'q:4a.lean['+j+setOf(Sj)+st2+';'+k+setOf(Sk)+st+']', stack:true, lines:[['line '+j+': ('+setOf(Sj)+', '+st2+')','a line: what it stands under, and its statement'],['line '+k+': ('+setOf(Sk)+', '+st+')','cites line '+j]],
      ask:'May line '+k+' lean on line '+j+'?', right, opts, lead:'',
      why:'Citing rule: a line may lean on a line before it only if that line’s suppositions are a part of its own. '+(!before?'Line '+j+' is not before line '+k+'.':part?setOf(Sj)+' is a part of '+setOf(Sk)+(Sj.length?'':': ∅ is a part of every collection')+', so nothing leaned on has been dropped.':'Line '+j+' stands under '+Sj.filter(x=>!Sk.includes(x)).join(' and ')+', and line '+k+' does not.')}; }});

/* ---------- 4b: the numbers, sifted from an inductive set; strays ---------- */
QP.push({id:'4b.number',step:'4b',label:'a number, or a stray',open:()=>measured('4b'),make(){
    const N=NUMS, STRAY=[lset([N[1]]),lset([N[2]]),lset([N[0],N[2]]),lset([N[1],N[2]]),lset([lset([N[1]])]),lset([N[0],lset([N[1]])]),lset([N[3]]),lset([N[0],N[1],N[3]])];
    const isNext=s=>s.s.some(x=>typeof x!=='string'&&lsame(nS(x),s)), strays=STRAY.filter(s=>s.s.length&&!isNext(s)), wantNum=Math.random()<0.5, k=1+rnd(4);
    const full=n=>'{'+n.s.map(nname).join(', ')+'}';
    if(wantNum){ const wrong=take(strays,3).map(nlist);
      return {index:'q:4b.number[n'+k+';'+wrong.join('')+']', lines:[], ask:'Which set is a number, a member of ℕ?', right:full(N[k]), opts:shuffle([full(N[k]),...wrong]), lead:'It is '+full(N[k])+'. ',
        why:full(N[k])+' is '+k+', the next one after '+(k-1)+', and the next one after a number is a number. Each other set is not 0 and is nobody’s next one, so by the strays technique it can be sifted away from an inductive set and is no number.'}; }
    const s=pick(strays), wrong=take([1,2,3,4],3).map(i=>full(N[i]));
    return {index:'q:4b.number[s'+nlist(s)+';'+wrong.join('')+']', lines:[], ask:'Which set is a stray: in no way a number?', right:nlist(s), opts:shuffle([nlist(s),...wrong]), lead:'It is '+nlist(s)+'. ',
      why:nlist(s)+' is not 0, and it is nobody’s next one: no member x of it has x ∪ {x} equal to it. The strays technique sifts it away. The others are 1 to 4 written out, each the next one after the one before.'}; }});

/* ---------- 4c: induction: base, step, hypothesis ---------- */
const PHI=[t=>t+' ∉ '+t,t=>'0 ⊆ '+t,t=>t+' ≠ S('+t+')',t=>'⋃S('+t+') = '+t,t=>'every member of '+t+' is a part of '+t];
const IND=[
  ['A proof by induction checks φ(0), φ(1), φ(2), φ(3) and φ(4), and stops. What is missing?','the step: one argument from φ(n) to φ(S(n)), for any number n',['nothing: five cases are enough','the base','the case φ(5)'],'Cases looked at are not the step. The step is one argument, with n any number, and the base hands it its first case.'],
  ['The step is proved: for any number n, if φ(n) then φ(S(n)). The base φ(0) was never checked. What stands?','nothing yet: the step only carries what the base hands it',['φ of every number','φ of every number but 0','φ(0)'],'The dominoes: the spacing is the step and the push is the base. With no push, no domino falls.'],
  ['Inside the step, φ(n) is supposed. Is that supposing what you want to prove?','no: it supposes φ of one number n, to reach φ of its next one',['yes, and so induction is a circle','yes, but the base repairs it','no: φ(n) is a given'],'The induction hypothesis is φ(n) for one number n, supposed in a box. What is wanted is φ of every number. The box reports only the if from n to S(n).'],
  ['A step never uses its hypothesis: it reaches φ(S(n)) whatever is so of n. Is the induction still sound?','yes: a step that does not need its hypothesis is still a step',['no: the hypothesis must be used','no: then the base is not needed','only if φ(0) fails'],'Zero-or-a-next is proved this way: S(n) is the next one after n, whatever is so of n. The if from φ(n) to φ(S(n)) holds all the same.']];
QP.push({id:'4c.pieces',step:'4c',label:'base, step, hypothesis',open:()=>measured('4c'),make(){
    if(Math.random()<0.3){ const k=rnd(IND.length), [ask,right,wrong,why]=IND[k]; return {index:'q:4c.pieces[w'+k+']', lines:[], ask, right, opts:shuffle([right,...wrong]), lead:'', why}; }
    const k=rnd(PHI.length), f=PHI[k], v=rnd(3), want=[f('0'),f('n'),f('S(n)')][v];
    const ask=['Which line is the base?','Which line is the induction hypothesis, supposed inside the step?','Which line must the step reach?'][v];
    return {index:'q:4c.pieces['+k+';'+v+']', lines:[['φ(n): '+f('n'),'the condition, for a number n']], ask, right:want, opts:shuffle([f('0'),f('n'),f('S(n)'),f('S(0)')]), lead:'It is “'+want+'”. ',
      why:'The base is φ(0). The step is ∀n ∈ ℕ (φ(n) ⇒ φ(S(n))): inside it φ(n) is supposed, the induction hypothesis, and φ(S(n)) is what must be reached.'}; }});

/* ---------- 4d: defining by repeating ---------- */
QP.push({id:'4d.repeat',step:'4d',mode:'work',label:'a start and a step',open:()=>measured('4d'),make(){
    const B=pick(THINGS), n=2+rnd(2), A=take(B.things,n), k=2+rnd(3), cyc=Math.random()<0.7;
    const g={}; if(cyc) A.forEach((x,i)=>g[x]=A[(i+1)%n]); else { A.forEach((x,i)=>g[x]=A[Math.min(i+1,n-1)]); }
    let y=A[0]; const run=[y]; for(let i=0;i<k;i++){ y=g[y]; run.push(y); }
    const opts=shuffle(A.slice()); if(opts.length<2) return null;
    return {index:'q:4d.repeat['+A.join(',')+';'+(cyc?'c':'s')+';'+k+']', a3:['4d.repeat['+k+']',DASH,B.id], stack:true,
      lines:[['A = '+setOf(A),'given'],['g = {'+A.map(x=>'('+x+', '+g[x]+')').join(', ')+'}','a function from A to A'],['f(0) = '+A[0],'the start'],['f(S(n)) = g(f(n))','the step'],['f('+k+')','▢']],
      ask:'Recursion gives exactly one such f. What is f('+k+')?', right:y, opts, lead:'It is '+y+'. ',
      why:'Each value comes from the value before, by g: '+run.map((v,i)=>'f('+i+') = '+v).join(', ')+'.'}; }},
  {id:'4d.function',step:'4d',label:'a function is its pairs',open:()=>measured('4d'),make(){
    for(let tries=0;tries<40;tries++){ const [B1,B2]=take(THINGS,2), A=take(B1.things,3), Bs=take(B2.things,2), kind=rnd(3);
      let prs=A.map(x=>[x,pick(Bs)]); if(kind===1) prs.push([A[0],Bs.find(y=>y!==prs[0][1])]); if(kind===2) prs=prs.slice(1);
      const OPT=['a function from A to B','not a function: one input has two outputs','not a function from A to B: an input has no output','not a function: an output is used twice'], right=OPT[kind];
      return {index:'q:4d.function['+kind+';'+prs.map(p=>p.join('>')).join(',')+']', a3:['4d.function['+kind+']',DASH,B1.id+'+'+B2.id], stack:true, lines:[['A = '+setOf(A),'given'],['B = '+setOf(Bs),'given'],['f = {'+shuffle(prs).map(p=>'('+p.join(', ')+')').join(', ')+'}','a set of pairs']],
        ask:'Is f a function from A to B?', right, opts:OPT, lead:'',
        why:'A function from A to B is a set of pairs with left entry in A and right entry in B, in which every member of A is the left entry of exactly one pair. Two inputs may share an output.'}; }
    return null; }});

/* ---------- 4e: proof shapes: the goal's outermost mark ---------- */
const SHAPES={'⇒':'Suppose the first half. Reach the second. Close the box: prove an if.','∀':'Let n be anything. Reach the claim for n. n was anything: speak of everything.','∃':'Take a particular thing. Reach the claim for it. Show an example.',
  '∧':'Give an argument for each half, then join.','∨':'Give an argument for either side, then add an option.','⇔':'Prove an if each way, then join and pack.','¬':'Suppose the statement without its not. Reach ⊥. Refute.'};
QP.push({id:'4e.shape',step:'4e',label:'the goal’s outermost mark',open:()=>measured('4e'),make(){
    const B=pick(KINDS), n=pick(B.nouns), [a,b]=take(B.adjs,2), v=rnd(7); let text, m;
    if(v<3){ const S=pick(SENT), f=S.f(n,a,b); text=mshow(f); m=f.neg?'¬':f.q; }
    else{ const [p,q]=shuffle(['P','Q','R']).slice(0,2); [text,m]=[[p+' ⇒ '+q,'⇒'],[p+' ∧ '+q,'∧'],[p+' ∨ '+q,'∨'],[p+' ⇔ '+q,'⇔'],['¬('+p+' ∧ '+q+')','¬'],['('+p+' ∧ '+q+') ⇒ '+p,'⇒'],['¬'+p+' ∨ '+q,'∨'],[p+' ⇒ ('+q+' ∨ '+p+')','⇒']][rnd(8)]; }
    const wrong=shuffle(Object.keys(SHAPES).filter(k=>k!==m)).slice(0,3);
    return {index:'q:4e.shape['+text+';'+wrong.join('')+']', lines:[[text,'the goal']], ask:'Which skeleton does the goal’s outermost mark call for?', right:SHAPES[m], opts:shuffle([m,...wrong]).map(k=>SHAPES[k]), lead:'',
      why:'The outermost mark of the goal decides the opening and closing lines before anything else is known. Here it is '+m+'.'}; }});

/* ---------- 4i: writing numbers ---------- */
QP.push({id:'4i.first',step:'4i',mode:'work',label:'which mark is worked first',open:()=>measured('4i'),make(){
    const a=1+rnd(6), b=2+rnd(5), c=2+rnd(5), v=rnd(4);
    const [text,val,alt]=v===0?[a+' + '+b+' · '+c,a+b*c,(a+b)*c]:v===1?[a+' · '+b+' + '+c,a*b+c,a*(b+c)]:v===2?[a+' + '+b+' · '+c+' + '+a,a+b*c+a,(a+b)*(c+a)]:[a+' · '+b+' + '+c+' · '+b,a*b+c*b,a*(b+c)*b];
    const wrong=[...new Set([alt,val+1,val-1,v===2?(a+b)*c+a:alt+b,val+b])].filter(x=>x!==val&&x>0).slice(0,3); if(wrong.length<3||alt===val) return null;
    return {index:'q:4i.first['+text+']', lines:[[text+' = ▢','a line without brackets']], ask:'What fills the box ▢?', right:String(val), opts:shuffle([val,...wrong]).map(String), lead:'It is '+val+'. ',
      why:'A line written without brackets is read by the ladder of operations, highest first: products before sums. So the products are worked first and then added. Reading it the other way gives '+alt+'.'}; }},
  {id:'4i.split',step:'4i',mode:'work',label:'splitting by a base',open:()=>measured('4i'),make(){
    const b=2+rnd(9), q=1+rnd(9), r=rnd(b), x=b*q+r, show=(q,r)=>b+' · '+q+' + '+r;
    const wrong=[...new Set([show(q-1,r+b),show(q+1,r),show(q,r+1),q>1?show(q-2,r+2*b):show(q,r+2),b!==q?q+' · '+b+' + '+(r+b):show(q+1,r+1)])].filter(o=>o!==show(q,r)).slice(0,3);
    return {index:'q:4i.split['+x+';'+b+']', lines:[[String(x),'a number'],['b = '+b,'the base']], ask:'Which line splits the number by the base?', right:show(q,r), opts:shuffle([show(q,r),...wrong]), lead:'It is '+x+' = '+show(q,r)+'. ',
      why:'Split-by-a-base: the number is b times some number, plus a number less than b. Here '+r+' < '+b+'. A number splits by a base in only one way, so a line whose last place is not less than '+b+', or whose sum is not '+x+', is not the split.'}; }},
  {id:'4i.read',step:'4i',mode:'work',label:'a row of digits names a number',open:()=>measured('4i'),make(){
    const two=Math.random()<0.45;
    if(two){ const x=5+rnd(27), bits=x.toString(2), rev=parseInt(bits.split('').reverse().join(''),2), wrong=[...new Set([rev,x+1,x-1,bits.split('').filter(c=>c==='1').length,x+2,x*2])].filter(y=>y!==x&&y>0).slice(0,3);
      return {index:'q:4i.read[2;'+bits+']', lines:[[bits+'₂','a numeral in twos']], ask:'Which number does it name?', right:String(x), opts:shuffle([x,...wrong]).map(String), lead:'It is '+x+'. ',
        why:'Read from the left, and at each step double what you have and add the next bit: '+bits.split('').reduce((acc,c)=>{ const w=acc.w*2+Number(c); acc.s.push(w); acc.w=w; return acc; },{w:0,s:[]}).s.join(', ')+'.'}; }
    const d=[1+rnd(9),rnd(10),rnd(10)], x=d[0]*100+d[1]*10+d[2], right='('+d[0]+' · 10 + '+d[1]+') · 10 + '+d[2];
    const wrong=[d[0]+' + '+d[1]+' + '+d[2],'('+d[2]+' · 10 + '+d[1]+') · 10 + '+d[0],d[0]+' · 10 + '+d[1]+' · 10 + '+d[2],'('+d[0]+' + '+d[1]+') · 10 + '+d[2]];
    const ok=[...new Set(wrong)].filter(o=>o!==right).slice(0,3);
    return {index:'q:4i.read[10;'+x+']', lines:[[String(x),'a tens numeral']], ask:'Which line is the reading rule at work on it?', right, opts:shuffle([right,...ok]), lead:'It is '+right+'. ',
      why:'Take the digits from the left, and at each step multiply what you have by ten and add the next digit. Digits side by side are not added.'}; }},
  {id:'4i.write',step:'4i',mode:'work',label:'writing a number down',open:()=>measured('4i'),make(){
    const x=5+rnd(27), bits=x.toString(2), wrong=[...new Set([bits.split('').reverse().join(''),(x+1).toString(2),(x-1).toString(2),bits+'0',(x^2).toString(2)])].filter(o=>o!==bits&&o[0]==='1').slice(0,3); if(wrong.length<3) return null;
    const steps=[]; let q=x; while(q>0){ steps.push(q+' = 2 · '+Math.floor(q/2)+' + '+(q%2)); q=Math.floor(q/2); }
    return {index:'q:4i.write['+x+']', lines:[[String(x),'a number']], ask:'Which numeral in twos names it?', right:bits+'₂', opts:shuffle([bits,...wrong]).map(o=>o+'₂'), lead:'It is '+bits+'₂. ',
      why:'Split by 2, split the quotient by 2, and so on until it is 0: '+steps.join('; ')+'. The last places, read from the last split back, are the bits.'}; }});

/* ---------- 4l: algorithms: state, start, stop test, move, output; measure and kept statement ---------- */
const ALGOS=[
  {k:'add',name:'adding by counting on',state:'(s, k)',start:(a,b)=>[a,b],stop:'k = 0',move:'(s, S(j)) ↦ (S(s), j)',out:'s',step:([s,k])=>[s+1,k-1],measure:'k',kept:(a,b)=>'s + k = '+(a+b),grows:'s',sum:'s + k'},
  {k:'times',name:'multiplying by repeated adding of a',state:'(p, k)',start:(a,b)=>[0,b],stop:'k = 0',move:'(p, S(j)) ↦ (p + a, j)',out:'p',step:([p,k],a)=>[p+a,k-1],measure:'k',kept:(a,b)=>'p + a · k = '+(a*b),grows:'p',sum:'p + k'},
  {k:'down',name:'counting both down',state:'(u, k)',start:(a,b)=>[a,b],stop:'k = 0',move:'(S(i), S(j)) ↦ (i, j)',out:'u',step:([u,k])=>[u-1,k-1],measure:'k',kept:(a,b)=>'u = k + '+(a-b),grows:'',sum:'u + k'}];
QP.push({id:'4l.run',step:'4l',mode:'work',label:'the run of an algorithm',open:()=>measured('4l'),make(){
    const A=pick(ALGOS), b=2+rnd(3), a=A.k==='down'?b+1+rnd(4):2+rnd(5), m=1+rnd(b), sh=s=>'('+s.join(', ')+')'; let s=A.start(a,b); const run=[s]; for(let i=0;i<b;i++){ s=A.step(s,a); run.push(s); }
    const out=run[b][0], askOut=Math.random()<0.4, right=askOut?String(out):sh(run[m]);
    const wrong=askOut?[...new Set([out+1,out-1,run[b-1][0],a,b,a+b+1])].filter(x=>x!==out&&x>=0).slice(0,3).map(String)
      :[...new Set([m>0?sh(run[m-1]):'',m<b?sh(run[m+1]):'',sh([run[m][0],run[m][1]+1]),sh([run[m][0]+1,run[m][1]]),sh([run[m][1],run[m][0]])])].filter(x=>x&&x!==right).slice(0,3);
    if(wrong.length<3) return null;
    return {index:'q:4l.run['+A.k+';'+a+','+b+';'+(askOut?'o':m)+']', a3:['4l.run['+A.k+']',DASH,DASH], stack:true,
      lines:[['state: '+A.state,A.name+(A.k==='times'?', a = '+a:'')],['start: '+sh(run[0]),'the state made from the input'],['stop test: '+A.stop,'settled'],['move: '+A.move,'used only when the stop test fails'],['output: '+A.out,'read off at the stop']],
      ask:askOut?'What is the output of this run?':'What is the state after '+m+' move'+(m>1?'s':'')+'?', right, opts:shuffle([right,...wrong]), lead:'It is '+right+'. ', why:'The run: '+run.map(sh).join(' ↦ ')+'. The stop test passes at '+sh(run[b])+', and the output is read off there.'}; }},
  {id:'4l.why',step:'4l',label:'why it stops, why it is right',open:()=>measured('4l'),make(){
    const A=pick(ALGOS.filter(x=>x.grows)), b=2+rnd(3), a=2+rnd(5), v=rnd(2);
    const lines=[['state: '+A.state,A.name+(A.k==='times'?', a = '+a:'')],['start: ('+A.start(a,b).join(', ')+')','the state made from the input'],['move: '+A.move,'used only when the stop test fails']];
    return v===0?{index:'q:4l.why[m;'+A.k+';'+a+','+b+']', stack:true, lines, ask:'Which counting number read off the state is smaller after every move?', right:A.measure, opts:shuffle([A.measure,A.grows,A.sum,'none: the state only grows']), lead:'It is '+A.measure+'. ',
        why:'Falling-measure technique: if a counting number read off the state is smaller after every move, every run stops. Each move takes '+A.measure+' from S(j) to j. '+A.grows+' grows'+(A.k==='add'?', and '+A.sum+' stays the same.':'.')}
      :{index:'q:4l.why[k;'+A.k+';'+a+','+b+']', stack:true, lines, ask:'Which statement is true at the start and kept by every move?', right:A.kept(a,b), opts:shuffle([A.kept(a,b),A.grows+' = '+A.start(a,b)[0],A.measure+' = '+b,A.grows+' < '+A.measure]), lead:'It is '+A.kept(a,b)+'. ',
        why:'Kept-statement technique: a statement true at the start, and kept by every move, is true at the stop. At the stop '+A.measure+' = 0, so the kept statement reads off the answer. Stopping alone is not enough.'}; }});

/* ---------- 4m: processes without things ---------- */
const UNITS=['crates','hours','miles','sacks','days','apples','stones','pages','rows','boxes'];
QP.push({id:'4m.forgets',step:'4m',mode:'word',label:'the operator forgets the things',open:()=>measured('4m'),make(){
    const [u1,u2]=take(UNITS,2), a=2+rnd(7), b=2+rnd(7), plus=Math.random()<0.5; if(a===b) return null;
    const tell=u=>plus?a+' '+u+', and then '+b+' more '+u:a+' lots of '+b+' '+u;
    const right=plus?a+' + '+b+' = '+(a+b):a+' · '+b+' = '+(a*b), wrong=[plus?a+' · '+b+' = '+(a*b):a+' + '+b+' = '+(a+b),a+' + '+a+' = '+(2*a),b+' · '+b+' = '+(b*b)];
    return {index:'q:4m.forgets['+(plus?'+':'·')+';'+a+','+b+';'+u1+','+u2+']', a3:[(plus?'4f.plus':'4g.by')+'['+a+','+b+']',DASH,'units.'+u1+'+'+u2], story:'One story: '+tell(u1)+'. Another story: '+tell(u2)+'.', lines:[],
      ask:'Which one line answers both stories?', right, opts:shuffle([right,...wrong]), lead:'It is '+right+'. ',
      why:'The operator works on the count and never asks what is counted. The things are taken out, the one line is worked once, and the answer goes back to each story as '+(plus?a+b:a*b)+' '+u1+' and '+(plus?a+b:a*b)+' '+u2+'.'}; }});

/* ===== Laundry 5, rung 5 (floor 1 pools, stage E): 5a 5d 5h 5k (5b 5c 5e 5f 5g 5i 5j had pools already) ===== */
Object.assign(STEPS,{'5a':['r05a','Equations Revisited'],'5d':['r05d','The Rules of Arithmetic'],'5h':['r05h','Fractions by Hand, and Decimals'],'5k':['r05k','Working With the Gap']});
/* fractions: a pair in lowest terms with its denominator positive */
const fgcd=(a,b)=>{ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a||1; };
const fr=(p,q)=>{ if(q<0){ p=-p; q=-q; } const g=fgcd(p,q); return {p:p/g,q:q/g}; };
const fshow=f=>(f.p<0?'−':'')+Math.abs(f.p)+(f.q===1?'':'/'+f.q), fraw=(p,q)=>(p<0?'−':'')+Math.abs(p)+'/'+q;
const fadd=(a,b)=>fr(a.p*b.q+b.p*a.q,a.q*b.q), fmul=(a,b)=>fr(a.p*b.p,a.q*b.q), fsame=(a,b)=>a.p===b.p&&a.q===b.q;
const uniq=(right,cands,n)=>{ const out=[]; cands.forEach(c=>{ if(c!==right&&!out.includes(c)&&out.length<(n||3)) out.push(c); }); return out; };

/* ---------- 5a Equations Revisited ---------- */
const OPCHK={'=':(a,b)=>a===b,'≠':(a,b)=>a!==b,'<':(a,b)=>a<b,'≤':(a,b)=>a<=b,'>':(a,b)=>a>b,'≥':(a,b)=>a>=b};
function numLine(want){ for(let t=0;t<60;t++){ const a=1+rnd(8), b=1+rnd(8), c=2+rnd(4), k=rnd(4), [ex,v]=k===0?[a+' + '+b,a+b]:k===1?[a+' · '+b,a*b]:k===2?[a+' + '+b+' · '+c,a+b*c]:[String(a),a];
    const op=pick(Object.keys(OPCHK)), r=v+pick([0,0,1,-1,2,-2,b]); if(r<0) continue; if(OPCHK[op](v,r)===want) return ex+' '+op+' '+r; } return null; }
QP.push({id:'5a.conforms',step:'5a',label:'the operator’s condition',open:()=>measured('5a'),make(){
    const yes=Math.random()<0.6, R=numLine(yes), wrong=[]; for(let i=0;i<12&&wrong.length<3;i++){ const w=numLine(!yes); if(w&&!wrong.includes(w)&&w!==R) wrong.push(w); } if(!R||wrong.length<3) return null;
    return {index:'q:5a.conforms['+R+';'+wrong.join(';')+']', lines:[], ask:yes?'Which line conforms to its operator’s condition?':'Which line does not conform to its operator’s condition?', right:R, opts:shuffle([R,...wrong]), lead:'It is '+R+'. ',
      why:'Each operator has its own condition: = conforms when its sides name one number, ≠ when the = inside it does not, < when the left side is less, ≤ when it is less or the same. Work each side, products before sums, and compare.'}; }});
const MOVES5=[['the sides are turned about, and the sign is left as it is',(op,a,b)=>[b,op,a]],['the same number is added to both sides',(op,a,b,k)=>[a+k,op,b+k]],['both sides are multiplied by the same number, not 0',(op,a,b,k)=>[a*k,op,b*k]],['both sides are multiplied by 0',(op,a,b)=>[0,op,0]]];
QP.push({id:'5a.moves',step:'5a',mode:'proof',label:'each operator, its moves',open:()=>measured('5a'),make(){
    for(let t=0;t<40;t++){ const op=pick(['=','≠','<','≤']), a=1+rnd(8), b=op==='='?a:op==='≤'&&Math.random()<0.4?a:a+1+rnd(5), k=2+rnd(4), mv=rnd(MOVES5.length), [say,f]=MOVES5[mv];
      const [x,o,y]=f(op,a,b,k), keeps=OPCHK[o](x,y), right=keeps?'the move keeps the condition':'the move breaks the condition';
      return {index:'q:5a.moves['+a+op+b+';'+mv+';'+k+']', stack:true, lines:[[a+' '+op+' '+b,'a line that conforms'],[x+' '+o+' '+y,say+(mv===1||mv===2?': '+k:'')]], ask:'Does the move keep the condition of the line’s operator?', right, opts:['the move keeps the condition','the move breaks the condition'], lead:'',
        why:'A move is allowed in a line only if it keeps the condition of that line’s operator. '+(keeps?'“'+x+' '+o+' '+y+'” conforms.':'“'+x+' '+o+' '+y+'” does not conform.')+' '+['= and ≠ turn about freely; < and ≤ turn about only if the sign turns about too.','Adding the same to both sides keeps every exact condition.','Multiplying both sides by the same number other than 0 keeps every exact condition.','Multiplying by 0 keeps = and ≤, and breaks ≠ and <: both sides become 0.'][mv]}; }
    return null; }});
QP.push({id:'5a.gap',step:'5a',mode:'work',label:'asking backwards',open:()=>measured('5a'),make(){
    const plus=Math.random()<0.5, a=2+rnd(7), x=1+rnd(7), stuck=Math.random()<0.3, none='no counting number does';
    const c=plus?(stuck?a-1-rnd(Math.min(a-1,3)):a+x):(stuck?a*x+1+rnd(a-1):a*x), line=a+(plus?' + ':' · ')+'x = '+c;
    const right=stuck?none:String(x), nums=uniq(right,[x,x+1,x-1,plus?c:c-a,plus?a+c:a,x+2].filter(n=>n>=0).map(String),3);
    return {index:'q:5a.gap['+line+']', lines:[[line,'a line with a gap']], ask:'Which number, put in the gap, makes the line conform?', right, opts:shuffle(stuck?nums:[String(x),...nums.slice(0,2)]).concat([none]), lead:'',
      why:stuck?(plus?'Whatever number x is, '+a+' ≤ '+a+' + x, and '+c+' is less than '+a+'. The line can be written, and no counting number makes it an equation.':a+' · '+Math.floor(c/a)+' = '+(a*Math.floor(c/a))+' and '+a+' · '+(Math.floor(c/a)+1)+' = '+(a*(Math.floor(c/a)+1))+': '+c+' falls between them, so no counting number put in the gap makes the line conform.')
        :'This runs '+(plus?'adding':'multiplying')+' backwards: '+a+(plus?' + ':' · ')+x+' = '+c+'.'}; }});

/* ---------- 5d The Rules of Arithmetic ---------- */
const frnd=()=>{ for(;;){ const f=fr(1+rnd(7),2+rnd(6)); if(f.q>1) return f; } };
const RULES5=[
  ['the turn-about technique for plus on ℚ',(w,b,c)=>w+' + '+b+' = '+b+' + '+w],['the regroup technique for plus on ℚ',(w,b,c)=>'('+w+' + '+b+') + '+c+' = '+w+' + ('+b+' + '+c+')'],
  ['the plus-zero technique on ℚ',(w)=>w+' + 0 = '+w],['the negative technique on ℚ',(w)=>w+' + (−'+w+') = 0'],
  ['the turn-about technique for times on ℚ',(w,b)=>w+' · '+b+' = '+b+' · '+w],['the regroup technique for times on ℚ',(w,b,c)=>'('+w+' · '+b+') · '+c+' = '+w+' · ('+b+' · '+c+')'],
  ['the times-one technique on ℚ',(w)=>w+' · 1 = '+w],['the reciprocal technique on ℚ',(w,b,c,W)=>w+' · '+W.q+'/'+W.p+' = 1'],
  ['the spread technique on ℚ',(w,b,c)=>w+' · ('+b+' + '+c+') = '+w+' · '+b+' + '+w+' · '+c]];
QP.push({id:'5d.name',step:'5d',label:'the twelve techniques',open:()=>measured('5d'),make(){
    const W=frnd(), B=frnd(), C=frnd(); if(fsame(W,B)||fsame(B,C)||fsame(W,C)||W.p===1) return null; const k=rnd(RULES5.length), [name,f]=RULES5[k], line=f(fshow(W),fshow(B),fshow(C),W);
    const same=k<4?[0,1,2,3]:k<8?[4,5,6,7]:[1,5,0,4], wrong=uniq(name,shuffle(same.map(i=>RULES5[i][0])).concat(shuffle(RULES5.map(r=>r[0]))),3);
    return {index:'q:5d.name['+k+';'+line+']', lines:[[line,null]], ask:'Which technique licenses the line marked ?', right:name, opts:shuffle([name,...wrong]), why:'The line is '+name+', with these rationals in its letters. Each of the twelve techniques holds for any rationals.'}; }});
QP.push({id:'5d.positive',step:'5d',mode:'work',label:'three-way',open:()=>measured('5d'),make(){
    const p=pick([-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6]), q=pick([-5,-4,-3,-2,2,3,4,5]), text='('+(p<0?'−'+(-p):p)+')/('+(q<0?'−'+(-q):q)+')', pq=p*q;
    const opts=['it is positive','it is 0','its negative is positive'], right=pq>0?opts[0]:pq===0?opts[1]:opts[2];
    return {index:'q:5d.positive['+p+'/'+q+']', lines:[[text,'a rational, by one of its members']], ask:'Exactly one of the three holds. Which?', right, opts, lead:'',
      why:'A rational p/q is positive when the product pq is a positive integer. Here pq = '+(pq<0?'−'+(-pq):pq)+'. The sign of the numerator alone does not decide it: (−2)/(−3) is 2/3.'}; }});

/* ---------- 5h Fractions by Hand, and Decimals ---------- */
QP.push({id:'5h.lowest',step:'5h',mode:'work',label:'lowest terms',open:()=>measured('5h'),make(){
    const f=frnd(), k=pick([2,3,4,5,6,8,10]), p=f.p*k, q=f.q*k, right=fshow(f);
    const wrong=uniq(right,[fraw(p-k,q-k),k%2===0&&k>2?fraw(p/2,q/2):fraw(f.q,f.p),fraw(f.p+1,f.q),fraw(f.p,f.q+1),fraw(f.q,f.p)].filter(o=>!/\/0$|^0\//.test(o)),3); if(wrong.length<3) return null;
    return {index:'q:5h.lowest['+p+'/'+q+']', lines:[[fraw(p,q),'a fraction, by one of its members']], ask:'Which member names it in lowest terms?', right, opts:shuffle([right,...wrong]), lead:'It is '+right+'. ',
      why:'Choosing a member: divide the numerator and the denominator by their gcd, '+k*fgcd(f.p,f.q)+'. '+p+' = '+k+' · '+f.p+' and '+q+' = '+k+' · '+f.q+', and '+f.p+' and '+f.q+' share no factor but 1. Taking the same number away from both is not scaling.'}; }},
  {id:'5h.add',step:'5h',mode:'work',label:'adding fractions',open:()=>measured('5h'),make(){
    const a=frnd(), b=frnd(); if(a.q===b.q) return null; const s=fadd(a,b), right=fshow(s);
    const wrong=uniq(right,[fraw(a.p+b.p,a.q+b.q),fraw(a.p+b.p,a.q*b.q),fraw(a.p*b.q+b.p*a.q,a.q+b.q),fshow(fr(a.p*b.p,a.q*b.q)),fshow(fr(a.p+b.p,Math.max(a.q,b.q)))],3); if(wrong.length<3) return null;
    return {index:'q:5h.add['+fshow(a)+'+'+fshow(b)+']', lines:[[fshow(a)+' + '+fshow(b)+' = ▢','a sum']], ask:'What fills the box ▢, in lowest terms?', right, opts:shuffle([right,...wrong]), lead:'It is '+right+'. ',
      why:'Adding is only easy over one denominator, so rename both first: '+fraw(a.p*b.q,a.q*b.q)+' + '+fraw(b.p*a.q,a.q*b.q)+' = '+fraw(a.p*b.q+b.p*a.q,a.q*b.q)+(fraw(a.p*b.q+b.p*a.q,a.q*b.q)===right?'':' = '+right)+'. Adding numerators and adding denominators gives '+fraw(a.p+b.p,a.q+b.q)+', which lies between the two fractions and is not their sum.'}; }},
  {id:'5h.times',step:'5h',mode:'work',label:'multiplying, and cancelling first',open:()=>measured('5h'),make(){
    const a=frnd(), b=frnd(); if(fsame(a,b)) return null; const s=fmul(a,b), right=fshow(s);
    const wrong=uniq(right,[fshow(fr(a.p*b.q,a.q*b.p)),fraw(a.p+b.p,a.q+b.q),fshow(fadd(a,b)),fraw(a.p*b.p,a.q+b.q),fraw(a.p*b.p+1,a.q*b.q)],3); if(wrong.length<3) return null;
    return {index:'q:5h.times['+fshow(a)+'·'+fshow(b)+']', lines:[[fshow(a)+' · '+fshow(b)+' = ▢','a product']], ask:'What fills the box ▢, in lowest terms?', right, opts:shuffle([right,...wrong]), lead:'It is '+right+'. ',
      why:'Multiply numerators and multiply denominators: ('+a.p+' · '+b.p+')/('+a.q+' · '+b.q+') = '+fraw(a.p*b.p,a.q*b.q)+(fraw(a.p*b.p,a.q*b.q)===right?'':' = '+right+', and cancelling a shared factor first keeps the numbers small')+'.'}; }},
  {id:'5h.decimal',step:'5h',mode:'work',label:'decimals',open:()=>measured('5h'),make(){
    if(Math.random()<0.5){ const fin=[2,4,5,8,10,16,20,25,40,50], non=[3,6,7,9,11,12,14,15,18,21,30], pk=q=>{ for(;;){ const p=1+rnd(q-1); if(fgcd(p,q)===1) return p+'/'+q; } };
      const R=pk(pick(fin)), wrong=uniq(R,take(non,3).map(pk),3);
      return {index:'q:5h.decimal[f'+R+';'+wrong.join(',')+']', lines:[], ask:'Which fraction has a finite decimal?', right:R, opts:shuffle([R,...wrong]), lead:'It is '+R+'. ',
        why:'Finite-decimal technique: a fraction has a finite decimal exactly when its denominator in lowest terms has no prime in its prime list but 2 and 5. Each other denominator here holds a 3, a 7 or an 11.'}; }
    const q=pick([4,5,8,20,25,40]), p=(()=>{ for(;;){ const p=1+rnd(q-1); if(fgcd(p,q)===1) return p; } })(), v=p/q, dec=String(v), right=p+'/'+q, digits=dec.split('.')[1];
    const wrong=uniq(right,[fshow(fr(Number(digits),100===Math.pow(10,digits.length)?1000:100)),fshow(fr(1,Number(digits))),fshow(fr(Number(digits),Math.pow(10,digits.length)+1)),fshow(fr(p,q+1)),fshow(fr(p+1,q))].filter(o=>/\//.test(o)),3); if(wrong.length<3) return null;
    return {index:'q:5h.decimal[d'+dec+']', lines:[[dec,'a finite decimal']], ask:'Which fraction does it name, in lowest terms?', right, opts:shuffle([right,...wrong]), lead:'It is '+right+'. ',
      why:dec+' = '+Number(digits)+'/'+Math.pow(10,digits.length)+': the digits after the point, read by the reading rule, over the power of ten with as many places. In lowest terms that is '+right+'.'}; }},
  {id:'5h.round',step:'5h',mode:'work',label:'rounding',open:()=>measured('5h'),make(){
    const k=100+rnd(900), third=rnd(10), v=(k*10+third)/1000, show=n=>(n/100).toFixed(2), right=show(third>=5?k+1:k);
    const wrong=uniq(right,[show(third>=5?k:k+1),show(k-1),(k/100).toFixed(1),show(k+2)],3);
    return {index:'q:5h.round['+v.toFixed(3)+']', lines:[[v.toFixed(3),'a decimal']], ask:'What is it rounded to two places?', right, opts:shuffle([right,...wrong]), lead:'It is '+right+'. ',
      why:'It lies from '+show(k)+' up to '+show(k+1)+'. The difference up from '+show(k)+' is '+third+' thousandths, and the difference up to '+show(k+1)+' is '+(10-third)+' thousandths'+(third===5?'. The two are the same, and the line sends it up: that choice is a convention.':', so the nearer one is '+right+'.')}; }},
  {id:'5h.percent',step:'5h',mode:'word',label:'percent',open:()=>measured('5h'),make(){
    const n=pick([5,10,20,25,40,50,75]), unit=pick(UNITS), v=rnd(3);
    if(v===0){ const w=20*(1+rnd(12)), val=n*w/100, right=val+' '+unit, wrong=uniq(right,[n+w,w-n,val*2,val/2,val+n,w*n/10,val+10].filter(x=>x>0&&Number.isInteger(x)).map(x=>x+' '+unit),3); if(wrong.length<3) return null;
      return {index:'q:5h.percent[of;'+n+';'+w+';'+unit+']', a3:['5h.percent[of]',DASH,'units.'+unit], story:'A load of '+w+' '+unit+'. '+n+'% of the load is set aside.', lines:[], ask:'How much is set aside?', right, opts:shuffle([right,...wrong]), lead:'It is '+right+'. ',
        why:n+'% names '+n+'/100, and '+n+'% of '+w+' is ('+n+'/100) · '+w+' = '+val+'.'}; }
    const up=v===1, f=fr(up?100+n:100-n,100), right=fshow(f), wrong=uniq(right,[fshow(fr(n,100)),fshow(fr(up?100-n:100+n,100)),fshow(fr(100,up?100+n:100-n)),String(n),fshow(fr(n+1,100))],3);
    return {index:'q:5h.percent['+(up?'rise':'fall')+';'+n+']', a3:['5h.percent['+(up?'rise':'fall')+']',DASH,'units.'+unit], story:'A count of '+unit+' '+(up?'rises':'falls')+' by '+n+'%.', lines:[], ask:'A percent change is multiplying by one fraction. Which fraction?', right, opts:shuffle([right,...wrong]), lead:'It is '+right+'. ',
      why:'A '+(up?'rise':'fall')+' of '+n+'% multiplies by 1 '+(up?'+':'−')+' '+n+'/100 = '+fraw(up?100+n:100-n,100)+(fraw(up?100+n:100-n,100)===right?'':' = '+right)+'.'}; }});

/* ---------- 5k Working With the Gap ---------- */
const GAPS=[['n + n is even',n=>(n+n)%2===0],['n · (n + 1) is even',n=>(n*(n+1))%2===0],['n + (n + 1) is odd',n=>(2*n+1)%2===1],['n · n + n is even',n=>(n*n+n)%2===0],['2 · n + 1 is odd',n=>(2*n+1)%2===1],['n · 2 is even',n=>true],
  ['n · n is even',n=>(n*n)%2===0],['n + 1 is odd',n=>(n+1)%2===1],['n · (n + 2) is even',n=>(n*(n+2))%2===0],['3 · n is odd',n=>(3*n)%2===1],['n + n + n is even',n=>(3*n)%2===0],['n · n + 1 is odd',n=>(n*n+1)%2===1],['n + 2 is even',n=>(n+2)%2===0],['n · n is more than n',n=>n*n>n]];
QP.push({id:'5k.gap',step:'5k',label:'the letter stays empty',open:()=>measured('5k'),make(){
    const all=n=>{ for(let i=0;i<=30;i++) if(!n(i)) return i; return -1; }, T=GAPS.filter(g=>all(g[1])<0), F=GAPS.filter(g=>all(g[1])>=0), R=pick(T), wrong=take(F,3);
    return {index:'q:5k.gap['+R[0]+';'+wrong.map(w=>w[0]).join(';')+']', lines:[], ask:'n is any counting number, and the gap stays empty. Which line holds for every filling at once?', right:R[0], opts:shuffle([R,...wrong]).map(g=>g[0]), lead:'It is “'+R[0]+'”. ',
      why:'The empty gap keeps the guess general: no n is tried, and the line holds down the whole series. Each other line fails at some filling: '+wrong.map(w=>'“'+w[0]+'” at n = '+all(w[1])).join('; ')+'.'}; }},
  {id:'5k.scale',step:'5k',mode:'word',label:'worked without being filled',open:()=>measured('5k'),make(){
    const thing=pick(['orange','crate','sack','ticket','tulip bulb','ferry crossing']), k=2+rnd(4), words=['','','doubled','tripled','multiplied by 4','multiplied by 5'][k];
    const right='it is '+words+', whatever n and c are', wrong=['it grows by '+k+', whatever n and c are','it is multiplied by '+k+' · n','nothing can be said until n and c are filled in'];
    return {index:'q:5k.scale['+thing+';'+k+']', a3:['5k.scale['+k+']',DASH,DASH], story:'One '+thing+' costs c, so n of them cost n · c. Then the price of one is '+words+'.', lines:[], ask:'What happens to the cost of n of them?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'n · ('+k+' · c) = '+k+' · (n · c), by regroup and turn-about for times. Nothing was filled in, and the answer holds for every filling at once.'}; }});

/* ===== Laundry 5, rung 6 (floor 1 pools, stage F): 6a 6b 6c 6d 6e 6f ===== */
Object.assign(STEPS,{'6a':['r06a','The Price of Free'],'6b':['r06b','Picking One From Every Box'],'6c':['r06c','Finitely Many Needs No Axiom'],'6d':['r06d','A World Where It Is True, and One Where It Is False'],'6e':['r06e','Choosing, Lining up Any Set, and the Top of Every Chain'],'6f':['r06f','Three Things Choice Does']});
/* a written question: [ask, right, [three wrong], why] */
const writtenQ=(id,L)=>{ const k=rnd(L.length), [ask,right,wrong,why]=L[k], ws=shuffle(wrong.slice());
  return {index:'q:'+id+'['+k+';'+ws.map(w=>w.length).join('.')+']', lines:[], ask, right, opts:shuffle([right,...ws]), lead:'It is: '+right+'. ', why}; };
const SUB6=['₀','₁','₂','₃','₄','₅','₆'];

/* ---------- 6a The Price of Free ---------- */
/* a line is free when the line above already holds it: checked on every row */
const holds6=(a,b)=>{ const A=tparse(a), B=tparse(b); return trows([A,B]).rows.every(env=>!tval(A,env)||tval(B,env)); };
const FREE6=(X,Y)=>[[X,X+' ∨ '+Y,'An option, for free: the or is true, because one of its options is.'],[X,Y+' ∨ '+X,'An option, for free: the or is true, because one of its options is.'],
  [X,Y+' ⇒ '+X,'An if, for free: suppose '+Y+'; '+X+' is still in reach; close the box.'],['¬'+X,X+' ⇒ '+Y,'The second free if: the condition is already false, so it does not matter whether '+Y+' is true.'],
  [X+' ∨ '+Y,Y,'An added option does not say which: from an or, neither option comes out without cases.'],[X+' ∨ '+Y,X,'An added option does not say which: from an or, neither option comes out without cases.'],
  [Y+' ⇒ '+X,Y,'A free if is carried with its condition: the if does not say that its condition holds.'],[X,X+' ∧ '+Y,'An and claims both halves, and the line above holds only one.'],
  [X+' ⇒ '+Y,Y+' ⇒ '+X,'An if turned about claims something the line above does not hold.'],[X,X+' ⇒ '+Y,'From '+X+' the free if is “anything ⇒ '+X+'”, with '+X+' at the end. This one puts '+X+' first.'],['¬'+X,Y+' ⇒ '+X,'From ¬'+X+' the free if is “'+X+' ⇒ anything”, with '+X+' first. This one ends in '+X+'.']];
QP.push({id:'6a.price',step:'6a',mode:'proof',label:'free, or claiming more',open:()=>measured('6a'),make(){
    const [X,Y]=take(['P','Q','R'],2), F=FREE6(X,Y), k=rnd(F.length), [g,w,say]=F[k], free=holds6(g,w), opts=['it is free: line 1 already holds it','it is not free: it claims more than line 1'];
    return {index:'q:6a.price['+g+';'+w+']', stack:true, lines:[[g,'given'],[w,'written for free, on line 1']], ask:'Is line 2 a free move?', right:opts[free?0:1], opts, lead:'',
      why:'A free move writes something the line already holds, so no technique has to pay for it in truth. '+say}; }},
  {id:'6a.free',step:'6a',label:'what a line already holds',open:()=>measured('6a'),make(){
    const [X,Y]=take(['P','Q','R'],2), F=FREE6(X,Y), g=Math.random()<0.65?X:'¬'+X, yes=F.filter(f=>f[0]===g&&holds6(g,f[1])), R=pick(yes);
    const wrong=uniq(R[1],shuffle([X+' ∧ '+Y,Y,X+' ⇒ '+Y,'¬'+Y,Y+' ⇒ '+X,X+' ∨ '+Y,Y+' ∧ ¬'+X,'¬'+X+' ∧ '+Y]).filter(w=>!holds6(g,w)),3); if(wrong.length<3) return null;
    return {index:'q:6a.free['+g+';'+R[1]+';'+wrong.join(';')+']', lines:[[g,'given']], ask:'Which line may be written under line 1 for free?', right:R[1], opts:shuffle([R[1],...wrong]), lead:'It is '+R[1]+'. ',
      why:R[2]+' Each other line claims something line 1 does not hold.'}; }},
  {id:'6a.gather',step:'6a',mode:'work',label:'a free move changes the shape',open:()=>measured('6a'),make(){
    if(Math.random()<0.5){ const a=2+rnd(7), front=Math.random()<0.5, line=front?'x + '+a+' · x':a+' · x + x', right=(a+1)+' · x';
      return {index:'q:6a.gather[x1;'+line+']', lines:[[line,'given'],[front?'x · 1 + '+a+' · x':a+' · x + x · 1','x = x · 1, a free move']], ask:'Spread, run backwards, now gathers the line. What does it write?', right, opts:shuffle([right,a+' · x',(a+1)+' · x · x',a+' · x + 1']), lead:'',
        why:'Writing x as x · 1 changes nothing the line claims. It changes the shape, so that spread can take hold: ('+(front?'1 + '+a:a+' + 1')+') · x = '+right+'.'}; }
    const a=1+rnd(5), b=1+rnd(5), line=a+'/x + '+b+'/x²', top=(a===1?'x':a+' · x')+' + '+b, right='('+top+')/x²';
    return {index:'q:6a.gather[xx;'+line+']', lines:[[line,'given, with x not 0'],[(a===1?'x':a+' · x')+'/x² + '+b+'/x²','x/x is 1, a free move']], ask:'Both parts now stand over one denominator. What is the sum?', right,
      opts:shuffle(uniq(right,[(a+b)+'/x²','('+a+' + '+b+' · x)/x²','('+top+')/x³'],3).concat([right])), lead:'',
      why:'x/x is 1, so multiplying by it is free: '+a+'/x = '+(a===1?'x':a+' · x')+'/x². Fractions over one denominator add by their upper parts.'}; }});

/* ---------- 6b Picking One From Every Box ---------- */
const ANIM6=['ant','bee','cow','cat','dog','owl','fox','hen','eel','yak','emu','ram'];
const coll6=()=>{ const n=2+rnd(2), w=shuffle(ANIM6.slice()), sets=[]; let big=false; for(let i=0;i<n;i++){ const s=(i===n-1&&!big)?2:1+rnd(3); if(s>1) big=true; sets.push(w.splice(0,s)); } return shuffle(sets); };
const nm6=i=>'A'+SUB6[i+1], prs6=ps=>'{'+ps.map(p=>'('+p[0]+', '+p[1]+')').join(', ')+'}';
QP.push({id:'6b.chooser',step:'6b',label:'a function that picks',open:()=>measured('6b'),make(){
    const S=coll6(), n=S.length, lines=S.map((s,i)=>[nm6(i)+' = {'+s.join(', ')+'}',i?null:'𝒜 = {'+S.map((_,j)=>nm6(j)).join(', ')+'}']), good=S.map((s,i)=>[nm6(i),pick(s)]);
    const b=S.findIndex(s=>s.length>1), o=(b+1)%n, stray=good.map((p,i)=>i===b?[p[0],pick(S[o])]:p), short=good.filter((_,i)=>i!==o), twice=good.slice(0,b+1).concat([[nm6(b),S[b].find(x=>x!==good[b][1])]],good.slice(b+1));
    const right=prs6(good), wrong=[prs6(stray),prs6(short),prs6(twice)];
    return {index:'q:6b.chooser['+S.map(s=>s.join('')).join(',')+';'+good.map(p=>p[1]).join('')+']', lines, ask:'Which set of pairs is a choosing function for 𝒜?', right, opts:shuffle([right,...wrong]), lead:'It is '+right+'. ',
      why:'In a choosing function every member of 𝒜 is the left entry of exactly one pair, and the right entry of each pair is a member of its left entry. One of the others picks from outside its set, one leaves a set out, and one picks twice from one set.'}; }},
  {id:'6b.least',step:'6b',mode:'work',label:'take the least',open:()=>measured('6b'),make(){
    const n=3, pool=shuffle([1,2,3,4,5,6,7,8,9,10,11,12]), S=[]; for(let i=0;i<n;i++) S.push(pool.splice(0,2+rnd(2)).sort((a,b)=>a-b));
    const say=f=>S.map((s,i)=>'c('+nm6(i)+') = '+f(s,i)).join(', '), all=[].concat(...S), right=say(s=>s[0]);
    const wrong=uniq(right,[say(s=>s[s.length-1]),say(()=>Math.min(...all)),say((s,i)=>i?s[0]:s[1]),say(s=>s.length)],3); if(wrong.length<3) return null;
    return {index:'q:6b.least['+S.map(s=>s.join('.')).join(',')+']', lines:S.map((s,i)=>[nm6(i)+' = {'+s.join(', ')+'}',i?null:'𝒜 = {A₁, A₂, A₃}, sets of numbers']), ask:'Least-chooses needs no axiom. Which function does it give?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Each member of 𝒜 is a non-empty settled set of numbers, so it has a least member, and at most one. “The least member of A” fits exactly one thing: it is a rule, and a sift builds the function.'}; }});
const B6=[
  ['A collection of pairs of shoes, endlessly many, each pair with one left shoe. What picks from every pair at once?','a rule: the left shoe of each pair, by a sift, with no axiom',['only the choosing axiom','one call per pair, written out to the end','nothing: endlessly many pairs cannot be picked from'],'“Is a left shoe” is so of exactly one shoe in each pair. A condition like that is a rule, and a sift builds the choosing function from it. No axiom is used.'],
  ['A collection of pairs of socks made alike, endlessly many. What picks from every pair at once?','only the choosing axiom: no condition is so of exactly one sock of a pair',['a rule: the first sock of each pair','one call per pair, written out to the end','a sift, with no axiom'],'Whatever can be said of one sock of a pair can be said of the other, so there is no rule. A column runs out of calls before it runs out of pairs. The axiom says a choosing function exists, and not which sock it takes.'],
  ['The collection 𝒜 has ∅ among its members. How many choosing functions has 𝒜?','none',['exactly one: the empty set','one, by the choosing axiom','one for each member of 𝒜'],'A choosing function c would need c(∅) ∈ ∅, and ∅ has no member. The axiom speaks only of collections whose members each have a member.'],
  ['The collection is empty: it has no members at all. What is a choosing function for it?','the empty set: no pairs are needed',['there is none: nothing can be picked','only the choosing axiom gives one','a rule that takes the least'],'Every member of the collection must be the left entry of exactly one pair. There are no members, so the set with no pairs does it: an empty truth.'],
  ['Every member of 𝒜 is a non-empty settled set of numbers, and 𝒜 has endlessly many members. What picks from them all at once?','a rule: the least member of each, with no axiom',['only the choosing axiom','one call per set, written out to the end','nothing, since the sets differ in size'],'A non-empty settled set of numbers has a least member, and at most one. “The least” is a rule, so a sift builds the function.'],
  ['A proof writes c(A) = “a member of A”. Why does that not make a function?','“a member of A” fits each member; a name must fit exactly one thing',['A may be empty','c is not yet a set of pairs','a function may not take a set as input'],'A function gives each input exactly one output. A rule needs a condition true of exactly one member of each set.'],
  ['By the axiom, c is a choosing function for the pairs of socks. What can be said of c(K), for a pair K?','that it is a sock of K, and not which one',['that it is the first sock of K','that it is the sock every other choosing function takes','nothing at all, not even that it is in K'],'The axiom says that a choosing function exists. Then c(K) ∈ K for every pair K, and that is all anyone can say.'],
  ['What does the choosing axiom say?','for any collection of sets, each with a member, one object holds a pick from each, all at once',['every set has a member','every collection of sets has a rule that picks','from each set of a collection a member can be called, one at a time'],'One call at a time is already paid for. The axiom lays down the picks all at once: a choosing function for the whole collection.'],
  ['A set is known to be not ∅. Before rung 7, what does the non-empty technique give?','that it is not without a member: a double negative',['a member, ready to be called','nothing at all','that it is ∅ after all'],'A non-empty set is not ∅: that way is easy. The way back gives only “not without a member”. A call needs “has a member” in hand.']];
QP.push({id:'6b.rule',step:'6b',label:'a rule, a call, or the axiom',open:()=>measured('6b'),make(){ return writtenQ('6b.rule',B6); }});

/* ---------- 6c Finitely Many Needs No Axiom ---------- */
const C6=[
  ['A collection has 5 members, each non-empty, and nothing more is known of them. What gives it a choosing function?','finite-choice: one call per set, with no axiom',['only the choosing axiom','a rule, which must be found first','nothing: without a rule there is none'],'A collection with any number of members, each of them non-empty, has a choosing function, with no axiom. Picking in turn always works for any number of sets you can count.'],
  ['A collection of non-empty sets has no choosing function. What does that show of the collection?','it is infinite',['it has ∅ as a member','it is empty','each of its members is infinite'],'Turn finite-choice about: if the collection had a number of members, finite-choice would give it a choosing function.'],
  ['For each n there is a function that chooses for the first n pairs of socks. Why does one function for all the pairs not follow?','∃ and ∀ have swapped places: a function for each n is not one function for all',['finite-choice fails for large n','the pairs have not been matched with ℕ','it does follow, by “and so on”'],'Each n has its own function, made afresh by its own column of calls. To glue them into one you would have to pick one function for every n at once: the axiom again, in disguise.'],
  ['A recursion is offered with the step “add a sock of the next pair”. Why is it not a recursion?','the step does not name one next stage: either sock would do',['the start is missing','recursion cannot build a set of pairs','the pairs are not numbers'],'Recursion’s step must be a function: it names exactly one next stage. “A sock of the pair” fits two things.'],
  ['The step of finite-choice meets a collection with S(n) members. What does it do?','leads one set out, uses the hypothesis on the rest, and puts the set back with a pick',['picks from all S(n) sets at once','calls on the choosing axiom for the last set','writes out S(n) calls'],'The rest has n members, so the hypothesis gives it a choosing function. One new call, a member of the set led out, finishes it.'],
  ['When is the choosing axiom needed for a collection of non-empty sets?','when the collection is infinite and no rule picks',['whenever the collection has more than one member','whenever its members are infinite','whenever no rule picks, however many members it has'],'Ask two questions. Is the collection finite? Then finite-choice does it. Is there a rule? Then a sift does it. The axiom adds something only when both answers are no.']];
QP.push({id:'6c.count',step:'6c',mode:'work',label:'how many ways to pick',open:()=>measured('6c'),make(){
    if(Math.random()<0.25){ const n=3+rnd(4), right=String(n); return {index:'q:6c.count[calls;'+n+']', lines:[], ask:'Finite-choice is unfolded for a collection with '+n+' members. How many calls does the column make?', right, opts:shuffle([right,String(n+1),String(n-1),'1']), lead:'',
      why:'The step makes one new call, a member of the set led out. Unfolded for '+n+' members, that is one call per set: '+n+'.'}; }
    const n=2+rnd(2), empty=Math.random()<0.15, s=[]; for(let i=0;i<n;i++) s.push(1+rnd(4)); const e=rnd(n); if(empty) s[e]=0; if(!empty&&s.every(x=>x===1)) s[0]=2;
    const prod=s.reduce((a,b)=>a*b,1), sum=s.reduce((a,b)=>a+b,0), rest=s.filter((_,i)=>i!==e).reduce((a,b)=>a*b,1), right=String(prod);
    const opts=uniq(right,[sum,empty?rest:prod+1,n,Math.max(...s),prod*2,1,sum+1].map(String),3); if(opts.length<3) return null;
    return {index:'q:6c.count['+s.join('.')+']', lines:[['𝒜 = {'+s.map((_,i)=>nm6(i)).join(', ')+'}',n===2?'two different sets':'three different sets'],[s.map((x,i)=>nm6(i)+' has '+(x===0?'no members':x===1?'1 member':x+' members')).join(', '),null]], ask:'How many choosing functions has 𝒜?', right, opts:shuffle([right,...opts]), lead:'',
      why:empty?'One member of 𝒜 is ∅, and a choosing function would need a pick from it. There is none.':'Each choosing function for the rest takes one more pair, a pick from the set put back: counting-pickings multiplies. '+s.join(' · ')+' = '+prod+'.'}; }},
  {id:'6c.need',step:'6c',label:'where the axiom adds something',open:()=>measured('6c'),make(){ return writtenQ('6c.need',C6); }});

/* ---------- 6d A World Where It Is True, and One Where It Is False ---------- */
const D6=[
  ['There is a world where every other principle is true and choice is false. What does that show?','choice cannot be proved from the other principles',['choice is false','choice is true','the other principles clash'],'In any world where the axioms are true, every line of a proof from them is true. A world where they hold and choice fails leaves no proof of choice from them. It does not make choice false: in the described world it is true.'],
  ['In the described world every other principle is true and choice is true. What does that show?','the denial of choice cannot be proved from the other principles',['choice is proved','choice is false in every other world','choice follows from the other principles'],'A world is not a proof. A world where the principles hold and choice holds shows only that no proof from them ends in the denial of choice.'],
  ['Why is choosing in the described world like choosing shoes?','every set has an earliest description, so “the member described first” is a rule',['every set there is finite','the world has only pairs in it','the choosing axiom is laid down there'],'A description is a string of marks, and strings can be listed in order. So each set has an earliest description, and that gives a condition true of exactly one member of each set.'],
  ['Nobody has found a choosing function for the socks. What follows from that alone?','nothing yet: no proof of a statement is not a proof of its denial',['choice fails','the socks have no choosing function','the socks have a rule after all'],'It took a world, with every other principle true in it and no choosing function for the socks, to show that none can be proved to exist.'],
  ['The two worlds together: how does choice stand to the other principles?','independent: neither it nor its denial can be proved from them',['proved from them','refuted by them','true in every world of them'],'Like infinity, choice is chosen, not discovered. Neither world is a mistake: in each, every other principle is true.'],
  ['A world in which choice fails must hold what?','an infinite collection of non-empty sets with no choosing function, and no rule',['a finite collection with no choosing function','a pair of shoes with no left shoe','a set of numbers with no least member'],'Every finite collection of non-empty sets has a choosing function in every world of the principles, and so does every collection with a rule.'],
  ['In the sock world, what is a support of a set?','a finite list of pairs such that swaps elsewhere leave the set in place',['the socks the set has as members','an endless list of all the pairs','a choosing function for the set'],'The sock world keeps the sets that have a finite support. A swap that touches no pair on the list leaves such a set as it was.'],
  ['In the sock world, a choosing function for all the pairs is supposed, with a support. What refutes it?','a swap of one pair off the support: the function stays, and its pick from that pair moves',['a swap of a pair on the support','the pairs run out before the support does','the function picks a sock that is not in the world'],'The support is a finite list, so some pair is off it. The swap of that pair leaves the function in place and carries its pick to the other sock: one input with two outputs, so the two socks would be one.'],
  ['In the sock world, has the collection of the first three pairs a choosing function?','yes: finite-choice works there, with the three pairs as support',['no: no socks can be picked in that world','only by the choosing axiom','no: a swap refutes it'],'Three calls make it, and swaps that leave those three pairs alone leave it in place.'],
  ['Does the swap argument work for pairs of shoes?','no: “left” is given, and a swap must keep what the world is given',['yes: any pair can be swapped','yes, once there are endlessly many pairs','no: shoes are not sets'],'No swap exchanges the shoes of a pair, because one is a left shoe and the other is not.']];
QP.push({id:'6d.worlds',step:'6d',label:'two worlds, and what they show',open:()=>measured('6d'),make(){ return writtenQ('6d.worlds',D6); }});

/* ---------- 6e Choosing, Lining up Any Set, and the Top of Every Chain ---------- */
const dv6=(a,b)=>b%a===0, chain6=s=>s.every(a=>s.every(b=>dv6(a,b)||dv6(b,a))), set6=s=>'{'+s.join(', ')+'}';
const and6=s=>s.length===0?'none':s.length===1?String(s[0]):s.slice(0,-1).join(', ')+' and '+s[s.length-1];
QP.push({id:'6e.chain',step:'6e',label:'chains under divides',open:()=>measured('6e'),make(){
    const all=[]; for(let a=1;a<=12;a++) for(let b=a+1;b<=12;b++) for(let c=b+1;c<=12;c++) all.push([a,b,c]);
    const want=Math.random()<0.7, C=all.filter(chain6), N=all.filter(s=>!chain6(s)&&s.some((a,i)=>s.some((b,j)=>i<j&&dv6(a,b)))), R=pick(want?C:N), wrong=take(want?N:C,3);
    const pr=R.map((a,i)=>R.slice(i+1).filter(b=>!dv6(a,b)).map(b=>a+' and '+b)).flat()[0], bad=s=>{ for(let i=0;i<3;i++) for(let j=i+1;j<3;j++) if(!dv6(s[i],s[j])) return s[i]+' and '+s[j]; };
    return {index:'q:6e.chain['+(want?'y':'n')+';'+set6(R)+';'+wrong.map(set6).join(';')+']', lines:[], ask:want?'Under ∣ (divides), which set is a chain?':'Under ∣ (divides), which set is not a chain?', right:set6(R), opts:shuffle([R,...wrong]).map(set6), lead:'It is '+set6(R)+'. ',
      why:'A chain is a part in which any two members compare. '+(want?'In each other set a pair does not compare: '+wrong.map(w=>bad(w)+' in '+set6(w)).join('; ')+'.':'Here '+pr+' do not compare: neither divides the other.')}; }},
  {id:'6e.maximal',step:'6e',mode:'work',label:'maximal, greatest, least',open:()=>measured('6e'),make(){
    for(let t=0;t<40;t++){ const W=take([1,2,3,4,5,6,7,8,9,10,12],5).sort((a,b)=>a-b), mx=W.filter(a=>W.every(b=>b===a||!dv6(a,b))), gr=W.filter(a=>W.every(b=>dv6(b,a))), ls=W.filter(a=>W.every(b=>dv6(a,b)));
      const k=rnd(3), big=W[4], small=W[0];
      const [ask,ans,cands,why]=k===0?['Which members of W are maximal?',mx,[[big],mx.slice(1),mx.concat(W.filter(a=>!mx.includes(a)).slice(-1)).sort((a,b)=>a-b),W.slice(3),W.filter(a=>a%2===1)],'A maximal member has nothing above it but itself: it divides no other member of W.'+(mx.length>1?' There may be several, and none of them need be above everything.':'')]
        :k===1?['Which member of W is greatest?',gr,[[big],mx,[W[3]],[small]],gr.length?'A greatest member is above everything: every member of W divides it.':'A greatest member is above everything. Here '+big+' is the biggest number, yet '+W.find(a=>!dv6(a,big))+' does not divide it. Maximal members there are; a greatest there is not.']
        :['Which member of W is least?',ls,[[small],[W[1]],mx,[]],ls.length?'A least member is in the part and below every member of it: it divides them all.':'A least member is below every member. Here '+small+' is the smallest number, yet it does not divide '+W.find(a=>!dv6(small,a))+'.'];
      const right=and6(ans), opts=uniq(right,cands.map(and6),3); if(opts.length<3) continue;
      return {index:'q:6e.maximal['+k+';'+W.join('.')+']', lines:[['W = '+set6(W),'ordered by ∣ (divides)']], ask, right, opts:shuffle([right,...opts]), lead:'',why}; }
    return null; }});
const E6=[
  ['Maximal and greatest: what is the difference?','a maximal member has nothing above it; a greatest member is above everything',['none: they are two words for one thing','a maximal member is above everything; a greatest has nothing above it','a greatest member needs a chain; a maximal member does not'],'Under ∣ on {1, 2, 3, 4, 6}, both 4 and 6 are maximal, and neither is above everything.'],
  ['What does the well-ordering principle say?','every set has a well-order',['every set of numbers has a least member','every chain has an upper bound','every partial order makes its set a chain'],'A well-order is a partial order under which every non-empty part has a least member. The principle says that every set has one.'],
  ['What does the maximal-member principle say?','if a partial order on a set gives every chain an upper bound, the set has a maximal member',['every set has a greatest member','every chain has a maximal member','every set has a well-order'],'The hypothesis is about chains, and the conclusion is about the whole set: something in it that cannot be made bigger.'],
  ['When is a partial order on W a well-order?','when every non-empty part of W has a least member under it',['when W has a least member','when W is a chain','when every chain in W has an upper bound'],'The least member is asked of every non-empty part, not only of W itself. A well-order then makes the whole set a chain: {x, y} has a least member, so any two compare.'],
  ['Which of these does step 6e prove outright?','well-ordering gives Choice: take the least',['Choice gives well-ordering','Choice gives the maximal-member principle','the maximal-member principle gives Choice, with no double negative left'],'With a well-order on ⋃𝒜, the least member of each set is a rule. The maximal-member principle gives Choice only to a double negative, and the two arrows out of Choice are sketched in words.'],
  ['Why does ≤ not well-order the integers ℤ?','the part of them below 0 has no least member',['two integers may not compare','ℤ has no greatest member','≤ is not a partial order on ℤ'],'A well-order gives every non-empty part a least member. Some other order on ℤ may do it; ≤ does not.'],
  ['The maximal-member principle is tried on ∅. What happens?','its hypothesis fails: the empty chain has no upper bound in ∅',['it gives ∅ a maximal member','it gives a choosing function for ∅','its hypothesis holds, as an empty truth'],'The empty chain must have an upper bound too, and an upper bound is in the set. So a set the principle speaks of has a member.'],
  ['You want a choosing function for 𝒜, and ⋃𝒜 has a well-order. What do you do?','take the least member of each set',['call on the maximal-member principle','pick by hand, one call per set','look for a world where choice fails'],'Each member of 𝒜 is a non-empty part of ⋃𝒜, so the well-order gives it a least member, and at most one.'],
  ['You want something that cannot be made any bigger. Which form of the principle fits the job?','the maximal-member principle',['the well-ordering principle','finite-choice','least-chooses'],'Set up the partial things, order them by ⊆, show that unions of chains stay inside, and call on the maximal-member principle. Well-ordering is for running through a set one member at a time.']];
QP.push({id:'6e.stand',step:'6e',label:'the two principles',open:()=>measured('6e'),make(){ return writtenQ('6e.stand',E6); }});

/* ---------- 6f Three Things Choice Does ---------- */
const F6=[['it collapses a question into an answer',['A set is known to have a member. The proof says “call one t” and goes on with t.','“Is there a crate that fits?” is still open. One that fits is picked and named, and the work goes on with it.','A line says some number is in the set. The proof names one such number and reasons with the name.'],'A set with a member lets you pick one and name it. “Is there one?” collapses to “here is one”, and the proof goes on with it.'],
  ['it makes the pick say more',['From a set of numbers the proof picks the least, and then uses that nothing smaller is in the set.','Of the ferries that cross today, the earliest is picked, so no ferry leaves before it.','From the crates that fit, the lightest is picked, and the argument leans on no lighter crate fitting.'],'A choice made well gives more than any choice. The process is the same; the way you choose makes it tell you more.'],
  ['it makes a process to use again',['A function hands back a member of whichever set of the collection it is given, and three later proofs run it.','A picking is written once for every box in the store, and from then on anyone hands it a box and gets an item back.','One object holds a pick from each set, and each later argument looks its pick up there.'],'A function that picks one member from every set in a collection is a tool. The choosing is no longer a step in one proof: it is a machine that later proofs can run.']];
QP.push({id:'6f.does',step:'6f',mode:'word',label:'three things choice does',open:()=>measured('6f'),make(){
    const k=rnd(3), j=rnd(3), [right,stories,why]=F6[k];
    const opts=shuffle(F6.map(f=>f[0]));
    return {index:'q:6f.does['+k+';'+j+';'+opts.map(o=>o.length).join('.')+']', a3:['6f.does['+k+'.'+j+']',DASH,DASH], story:stories[j], lines:[], ask:'Which of the three things is the choice doing here?', right, opts, lead:'', why}; }});

/* ===== Laundry 5, rung 7 (floor 1 pools, stage G): 7a 7b 7c 7d 7e 7f 7g ===== */
Object.assign(STEPS,{'7a':['r07a','Deduction Revisited'],'7b':['r07b','The Either-Way Principle'],'7c':['r07c','Finite Cases Need No Either-Way'],'7d':['r07d','Choosing Forces Either-Way'],'7e':['r07e','The Payoff: Double Negation and the Withheld Licences'],'7f':['r07f','Proof by Contradiction'],'7g':['r07g','Yes or No Is Data']});
const written7=(id,L,lines)=>{ const q=writtenQ(id,L); if(lines) q.lines=lines; return q; };
const let7=(s,m)=>s.replace(/[PQ]/g,c=>m[c]);

/* ---------- worlds of stages (7b6): a statement read at a stage ---------- */
const STG={two:{stages:['now','later'],after:{now:['now','later'],later:['later']},est:[[],['later'],['now','later']],
    say:['is never established','is established later, not now','is established at now'],open:'Two stages, now and later.',at:{now:'now',later:'later'}},
  fork:{stages:['now','left','right'],after:{now:['now','left','right'],left:['left'],right:['right']},est:[[],['left'],['right'],['left','right'],['now','left','right']],
    say:['is never established','is established one way only','is established the other way only','is established both ways, not at now','is established at now'],open:'A fork: now, and after it two stages, one way and the other.',at:{now:'now',left:'the stage one way',right:'the stage the other way'}}};
function sval(t,s,W){ if(t.v) return t.v==='⊤'?true:t.v==='⊥'?false:(W.est[t.v]||[]).includes(s);
  const aft=W.after[s]; if(t.o==='¬') return aft.every(u=>!sval(t.a,u,W));
  if(t.o==='∧') return sval(t.a,s,W)&&sval(t.b,s,W); if(t.o==='∨') return sval(t.a,s,W)||sval(t.b,s,W);
  if(t.o==='⇒') return aft.every(u=>!sval(t.a,u,W)||sval(t.b,u,W)); if(t.o==='⇔') return aft.every(u=>sval(t.a,u,W)===sval(t.b,u,W)); throw new Error('stage'); }
const worlds7=ls=>{ const out=[]; ['two','fork'].forEach(k=>{ const K=STG[k], go=(i,est,pick)=>{ if(i===ls.length){ out.push({kind:k,after:K.after,est:Object.assign({},est),pick:pick.slice()}); return; } K.est.forEach((e,j)=>{ est[ls[i]]=e; pick[i]=j; go(i+1,est,pick); }); }; go(0,{},[]); }); return out; };
const world7=(k,ls)=>{ const K=STG[k], est={}, pk=[]; ls.forEach((l,i)=>{ pk[i]=rnd(K.est.length); est[l]=K.est[pk[i]]; }); return {kind:k,after:K.after,est,pick:pk}; };
const wsay7=(W,ls)=>STG[W.kind].open+' '+ls.map((l,i)=>l+' '+STG[W.kind].say[W.pick[i]]).join('; ')+'.';
const everywhere7=s=>{ const t=tparse(s), ls=tatoms(t).sort(); return worlds7(ls).every(W=>STG[W.kind].stages.every(u=>sval(t,u,W))); };
const fails7=s=>{ const t=tparse(s), ls=tatoms(t).sort(); const W=worlds7(ls).find(W=>!sval(t,'now',W)); return W?wsay7(W,ls):null; };
function why7(t,s,W){ const at=STG[W.kind].at, aft=W.after[s], T=x=>sval(x,s,W)?'true':'not true';
  if(t.v) return 'A letter is true at a stage when it is established there.';
  if(t.o==='¬'){ const u=aft.find(u=>sval(t.a,u,W)); return 'A not is true at a stage when the statement under it is true at no stage at or after it. '+(u?'Here '+tshow(t.a)+' is true at '+at[u]+'.':'Here '+tshow(t.a)+' is true at none of them.'); }
  if(t.o==='⇒'){ const u=aft.find(u=>sval(t.a,u,W)&&!sval(t.b,u,W)); return 'An if is true at a stage when, at every stage at or after it where the first half is true, the second half is true too. '+(u?'At '+at[u]+' the first half, '+tshow(t.a)+', is true and the second, '+tshow(t.b)+', is not.':'No stage at or after '+at[s]+' has the first half true and the second not.'); }
  if(t.o==='∨') return 'An or is true at a stage when one of its sides is true at that stage. At '+at[s]+', '+tshow(t.a)+' is '+T(t.a)+' and '+tshow(t.b)+' is '+T(t.b)+'.';
  return 'An and is true at a stage when both its sides are true at that stage. At '+at[s]+', '+tshow(t.a)+' is '+T(t.a)+' and '+tshow(t.b)+' is '+T(t.b)+'.'; }
const ST7=['P ∨ ¬P','¬¬P ⇒ P','¬¬P','¬P','¬P ∨ ¬¬P','P ⇒ Q','(P ⇒ Q) ∨ (Q ⇒ P)','¬(P ∧ Q) ⇒ (¬P ∨ ¬Q)','¬(P ∧ Q)','(P ⇒ Q) ⇒ (¬P ∨ Q)','¬P ∨ Q','(¬Q ⇒ ¬P) ⇒ (P ⇒ Q)','¬(P ⇒ Q) ⇒ (P ∧ ¬Q)','P ⇒ ¬¬P','¬¬(P ∨ ¬P)','¬(P ⇒ Q)','¬P ∨ ¬Q','¬Q ⇒ ¬P'];
const stage7=(kinds)=>{ const want=Math.random()<0.5; let best=null; for(let i=0;i<30;i++){ const s=pick(ST7), t=tparse(s), ls=tatoms(t).sort(), W=world7(pick(kinds),ls); best={s,t,ls,W,now:sval(t,'now',W)}; if(best.now===want) break; } return best; };

/* ---------- 7a Deduction Revisited ---------- */
const A7=[
  ['What three parts make an operator?','a mark, the condition that says when a line with it holds, and the moves that keep that condition',['a mark, a name and a number','a definition, an axiom and a proof','a mark, its inputs and its output'],'5a read each operator this way: = holds when its two sides name one number, and its moves are the ones that keep them naming one number.'],
  ['A mark has been defined, and no proofs about it have been written yet. What has it got?','its condition, and no moves: it means something but does nothing',['its moves, and no condition','both its condition and its moves','neither: a mark with no proofs means nothing'],'The definition gives the mark its condition. The proofs give it its moves.'],
  ['A proof ends in the line “if P then Q”. What does it hand you from then on?','a move: wherever you have P, you may write Q, and cite the proof by name',['the statement Q, wherever you like','the statement P, wherever you have Q','nothing, until it is written out again'],'A proved if is a move you may make from then on. That is how every technique on the ladder was made.'],
  ['What does rung 7 add?','one principle, either-way: a new licence, with which the old marks get moves they were refused',['a new mark, with its own condition','a new axiom about sets','a new kind of number'],'Every statement holds or its denial does. It is not a new mark. Not-not out, proof by cases on any statement and the turned-back techniques are moves rung 1’s operators could not make before.'],
  ['4f defined adding by repeating the next one, and then proved three things about it. What did the proofs add?','moves: zero on the left changes nothing, the order does not matter, the brackets do not matter',['the condition of +','what 1 + 3 names','a new definition of adding'],'The definition told you what 1 + 3 names, and nothing more. Each proof is a move, and with the moves + does something.']];
const holds7=(as,b)=>{ const A=as.map(tparse), B=tparse(b); return trows(A.concat([B])).rows.every(env=>!A.every(a=>tval(a,env))||tval(B,env)); };
QP.push({id:'7a.operator',step:'7a',label:'a mark, its condition, its moves',open:()=>measured('7a'),make(){ return written7('7a.operator',A7); }},
  {id:'7a.move',step:'7a',mode:'proof',label:'a proof hands you a move',open:()=>measured('7a'),make(){
    const [X,Y,Z]=shuffle(['P','Q','R']), A=pick([X,X+' ∧ '+Z,'¬'+X]), B=pick([Y,Y+' ∨ '+Z,'¬'+Y]), par=s=>s.length>2?'('+s+')':s, neg=s=>'¬'+par(s);
    const [have,write]=pick([[A,B],[A,B],[A,B],[B,A],[neg(A),neg(B)],[B,A]]), ok=holds7([par(A)+' ⇒ '+par(B),have],write), opts=['the proof hands you this move','it does not: line 2 is not the first half of the if'];
    return {index:'q:7a.move['+A+';'+B+';'+have+']', stack:true, lines:[[par(A)+' ⇒ '+par(B),'proved: a technique from now on'],[have,'in hand'],[write,'the technique, on line 2']], ask:'Is line 3 a move the proof handed you?', right:opts[ok?0:1], opts, lead:'',
      why:'A proved if is a move: wherever you have its first half, you may write its second, and cite the proof by name. '+(ok?'Line 2 is the first half, so line 3 is licensed.':'Line 2 is not the first half of the if. The proof says nothing of what follows from '+have+'.')}; }});

/* ---------- 7b The Either-Way Principle ---------- */
const B7=[
  ['When is a proof constructive?','when every or it uses was earned: given, made by adding an option, or reached without citing either-way',['when it uses no or at all','when it cites either-way exactly once','when it ends in a some'],'A proof that cites either-way is classical. Until this rung every or came with a side in hand.'],
  ['What does the either-way principle cost?','the address: a classical proof that something exists may not hand you the thing',['nothing at all','every constructive proof written before it','the truth of rung 1’s techniques'],'A constructive proof that something exists hands you the thing. A classical one may only show that its absence is totally false.'],
  ['Can rung 1’s techs refute either-way at some statement P?','no: ¬¬(P ∨ ¬P) is proved with rung 1’s techs alone',['yes, in the two-stage world','yes, whenever P is undecided','nobody knows'],'Either-way-unrefuted: the principle at any statement cannot be refuted. Rung 1 cannot prove it, and cannot refute it either.'],
  ['There is no proof of P. What follows about ¬P?','nothing: not having a proof is not a refutation',['¬P holds','¬¬P holds','P ∨ ¬P fails'],'It is still 1b’s move to check. The either-way principle says one side holds; it does not say which.'],
  ['What does a world of stages show about rung 1’s techs and either-way?','no column of rung 1’s techs proves P ∨ ¬P from nothing about P',['either-way is false','rung 1’s techs are unsound','P ∨ ¬P is true at every stage'],'Every tech of rung 1 keeps the reading by stages, and in the two-stage world P ∨ ¬P is not true at now. So no such column exists. Independent, not false.'],
  ['In a world of stages, what does ¬A say at a stage?','A is true at no stage at or after it: A will never be established',['A is not established yet','A is false at that stage only','A was true at an earlier stage'],'So ¬A is a strong claim. It agrees with not-as-if, which reads ¬A as A ⇒ ⊥.'],
  ['With either-way in hand for P, how does ¬¬P give P?','by the remaining option: ¬¬P shuts out the side ¬P, and P is what is left',['by adding an option','by refuting P','it does not: not-not out needs choice directly'],'Either-way-gives-not-not-out: if a statement is so or not so, then not not that statement gives the statement.']];
QP.push({id:'7b.stages',step:'7b',label:'a statement read at a stage',open:()=>measured('7b'),make(){
    const S=stage7(['two','two','fork']), opts=['it is true at now','it is not true at now'];
    return {index:'q:7b.stages['+S.s+';'+S.W.kind+S.W.pick.join('')+']', a3:['7b.stages['+S.s+']',DASH,DASH], story:wsay7(S.W,S.ls), lines:[[S.s,'read at now']], ask:'Read by the rules for stages, is the statement true at now?', right:opts[S.now?0:1], opts, lead:'', why:why7(S.t,'now',S.W)}; }},
  {id:'7b.when',step:'7b',mode:'work',label:'at which stages',open:()=>measured('7b'),make(){
    const S=stage7(['two']), later=sval(S.t,'later',S.W), right=S.now?'at now and at later':later?'at later only':'at neither stage';
    return {index:'q:7b.when['+S.s+';'+S.W.pick.join('')+']', a3:['7b.when['+S.s+']',DASH,DASH], story:wsay7(S.W,S.ls), lines:[[S.s,'read at each stage']], ask:'At which stages is the statement true?', right, opts:['at now and at later','at later only','at now only','at neither stage'], lead:'',
      why:why7(S.t,'now',S.W)+(later&&!S.now?' At later it is true.':'')+' Whatever is true at a stage is true at every later stage, so “at now only” never happens.'}; }},
  {id:'7b.kinds',step:'7b',label:'constructive and classical',open:()=>measured('7b'),make(){ return written7('7b.kinds',B7); }});

/* ---------- 7c Finite Cases Need No Either-Way ---------- */
const prime7=n=>{ if(n<2) return false; for(let d=2;d*d<=n;d++) if(n%d===0) return false; return true; };
const COND7=[['x is even',n=>n%2===0],['x is odd',n=>n%2===1],['x is prime',prime7],['x divides 12',n=>12%n===0],['x is less than 5',n=>n<5],['x is a square',n=>Number.isInteger(Math.sqrt(n))],['3 divides x',n=>n%3===0]];
const C7=[
  ['When is a statement P decidable?','when P ∨ ¬P has been proved by a constructive column, one that does not cite either-way',['when P has been proved','when P is true or false','when nobody has refuted P'],'Settled, made exact: the or is earned without the either-way principle.'],
  ['The mark ⟦P⟧ = {x ∈ 1 : P} is a part of {0}. For an undecided P, why does finite-search not apply to it?','nobody can match it with a number: it has 1 member if P, and none if ¬P',['it is too large to search','0 is not a number','its condition is decidable, and that is not allowed'],'The trouble does not come from a large set. It comes from an undecided condition hidden inside the description of a small one.'],
  ['Where every case can be checked, and there are n of them, is the either-way principle needed?','no: finite-search earns the or',['yes, always','yes, when n is large','only for an every, not for a some'],'The content of the principle lies in two places: in an every or a some whose cases never end, and in conditions that nobody can check at all.'],
  ['“n · n + n + 41 is always prime.” How was this endless every settled?','false, by one counterexample: at n = 40 it is 41 · 41',['true, by a proof','true, by checking very far','it is not settled'],'40 · 40 + 40 + 41 = 1681 = 41 · 41. A single counterexample settles an every false.'],
  ['Every case of an endless every is decidable and has passed as far as anyone has checked. Is the every settled?','no: looking can only ever refute it, and nobody has a proof',['yes: true','yes: false','yes: decidable, by finite-search'],'The bounded statement, up to where the checking reached, is decidable and true by finite-search. The endless one is settled only by a proof or by a failure.'],
  ['P and Q are decidable. What does settled-join say?','¬P, P ∧ Q, P ∨ Q and P ⇒ Q are decidable too',['P and Q are true','only P ∧ Q is decidable','every statement is decidable'],'Decidable conditions come from decidable pieces: work out the cases of each piece, with no either-way.'],
  ['Which two things must hold before finite-search is cited?','the set has a number of members, and the condition is decidable at each member',['the set is a set of numbers, and the condition is true','the set is non-empty, and has a least member','the condition is true at some member'],'Both hypotheses matter, and neither can be dropped.']];
QP.push({id:'7c.search',step:'7c',mode:'work',label:'a search you can finish',open:()=>measured('7c'),make(){
    for(let t=0;t<60;t++){ const Y=take([1,2,3,4,5,6,7,8,9,10,11,12],3+rnd(2)).sort((a,b)=>a-b), [say,f]=pick(COND7), some=Math.random()<0.5, yes=Y.filter(f), no=Y.filter(n=>!f(n)), cant='no search that ends can settle it';
      let right, wrong;
      if(some&&yes.length&&no.length){ right='so: '+pick(yes)+' passes'; wrong=['so: '+pick(no)+' passes','not so: every member fails',cant]; }
      else if(some&&!yes.length){ right='not so: every member fails'; wrong=['so: '+Y[0]+' passes','so: '+Y[Y.length-1]+' passes',cant]; }
      else if(!some&&!no.length){ right='so: every member passes'; wrong=['not so: '+Y[0]+' fails','not so: '+Y[Y.length-1]+' fails',cant]; }
      else if(!some&&yes.length&&no.length){ right='not so: '+pick(no)+' fails'; wrong=['not so: '+pick(yes)+' fails','so: every member passes',cant]; }
      else continue;
      return {index:'q:7c.search['+(some?'∃':'∀')+';'+Y.join('.')+';'+say+';'+right+']', lines:[['Y = {'+Y.join(', ')+'}','a set with '+Y.length+' members'],[(some?'∃':'∀')+'x ∈ Y ('+say+')','to be settled']], ask:'Finite-search looks at each member in turn. How does it settle the line?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'Y has '+Y.length+' members and “'+say+'” is decidable at each, so the look ends and the or is earned with no either-way. Passing: '+and6(yes)+'. Failing: '+and6(no)+'.'}; }
    return null; }},
  {id:'7c.decidable',step:'7c',label:'decidable, and where it stops',open:()=>measured('7c'),make(){ return written7('7c.decidable',C7); }});

/* ---------- 7d Choosing Forces Either-Way ---------- */
const UV7=[['U = {x ∈ 2 : x = 0 ∨ P}','Separation'],['V = {x ∈ 2 : x = 1 ∨ P}','Separation']];
const D7a=[
  ['Suppose P is so. Which sets are U and V?','U = {0, 1} and V = {0, 1}',['U = {0} and V = {1}','U = {1} and V = {0}','U = ∅ and V = ∅'],'With P, each condition is true of every member of 2 by adding an option. Both sifts keep everything and are the same set, 2.'],
  ['Suppose ¬P is so. Which sets are U and V?','U = {0} and V = {1}',['U = {0, 1} and V = {0, 1}','U = {1} and V = {0}','U = ∅ and V = ∅'],'U keeps 0 for certain, and keeps 1 only if P is true. V keeps 1 for certain, and keeps 0 only if P is true.'],
  ['c is a choosing function for {U, V}, and its picks differ: c(U) ≠ c(V). What does that prove?','¬P: with P, U and V are one set, and a function gives one input one output',['P','nothing about P','U = V'],'Assume P. Then U = V by same-members, so c(U) = c(V), which clashes with the case. Refute: ¬P.'],
  ['c is a choosing function for {U, V}, and its picks agree: c(U) = c(V). What does that prove?','P: one pick cannot be both 0 and 1, so P let it in on one side',['¬P','nothing about P','U ≠ V'],'The pick is 0 or P let it into U; it is 1 or P let it into V. It is not both 0 and 1, since 0 ≠ 1. Either way round, P.'],
  ['c(U) = 1. What follows?','P: 1 is in U only if 1 = 0 or P, and 1 ≠ 0',['¬P','U = {1}','nothing about P'],'︿ the sift at its pick: 1 = 0 ∨ P. The first option clashes with 0 ≠ 1, so the remaining option holds.'],
  ['Nobody knows whether P is so. Are U and V sets?','yes, by Separation, though nobody can list them or say whether they are the same',['no: a condition may not mention an open statement','yes, and both are {0, 1}','yes, and they are {0} and {1}'],'Separation is laid down for any condition, and a condition may mention P.']];
const D7b=[
  ['What does choice-gives-either-way say?','with the choosing axiom, every statement is so or not so',['with either-way, every collection has a choosing function','every statement is decidable','every finite collection has a choosing function'],'For any statement P, P ∨ ¬P. It rests on the choosing axiom, Separation, same-members and three facts about 2.'],
  ['Where did the endless come into the proof of choice-gives-either-way?','nowhere: two sets of at most two members, and a collection of at most two sets',['in the collection, which is infinite','in the picks, which are endless','in the numbers, all of which are searched'],'The power came from two places: sifting by a condition that mentions an arbitrary statement, and a function that exists by the axiom and that nobody computes.'],
  ['Why will two calls, “call u ∈ U, call v ∈ V”, not do in place of the choosing function?','two calls give no line c(U) = c(V) from U = V, so the case u ≠ v refutes nothing',['U or V may be empty','calls need the either-way principle','two calls are one too many'],'The proof needs a function: one input, one output. Then U = V forces the picks to agree.'],
  ['Why does finite-choice not supply the function for {U, V} with no axiom?','{U, V} has a number of members only once U = V or U ≠ V is decided, and that is the question',['finite-choice needs three sets or more','U and V are infinite','finite-choice was refuted on rung 6'],'Two members if the sets differ, one if they are the same. Counting them would already settle P.'],
  ['Does the either-way principle give choice back?','no: there is a world where every statement is true or false and choice fails',['yes: the two are one principle','yes, for finite collections only','nobody knows'],'The road runs one way. So the ladder needed the axiom for both: Choice laid down on 6b, and either-way proved from it.'],
  ['The proof decides between u = v and u ≠ v for the two picks. What earns that or?','settled-order: sameness between members of 2 is decidable, with no either-way',['the either-way principle','the choosing axiom','Separation'],'The picks are members of 2, so they are numbers, and sameness of numbers is decidable. Citing either-way here would circle.']];
QP.push({id:'7d.sifts',step:'7d',label:'two sifts of {0, 1}',open:()=>measured('7d'),make(){ return written7('7d.sifts',D7a,UV7); }},
  {id:'7d.used',step:'7d',label:'what the proof used',open:()=>measured('7d'),make(){ return written7('7d.used',D7b); }});

/* ---------- 7e The Payoff ---------- */
LINKS.push(rwLink('7e.snotand','7e','the not-both in sets technique',[['C ∖ (A ∩ B)','(C ∖ A) ∪ (C ∖ B)']],'set'),
  rwLink('7e.ssplit','7e','the splits-by-any-set technique',[['(A ∖ B) ∪ (A ∩ B)','A']],'set'));
const SET_SEEDS7=['c ∖ (d ∩ b)','(c ∖ d) ∪ (c ∖ b)','(d ∖ b) ∪ (d ∩ b)','c ∖ ((d ∩ b) ∩ c)','(c ∖ (d ∩ b)) ∪ d','c ∖ (d ∩ (b ∪ d))','((d ∖ b) ∪ (d ∩ b)) ∩ c','(c ∖ d) ∪ (c ∖ (b ∪ d))'];
SEEDS.push({id:'7e.sets',step:'7e',label:'sets, the withheld samenesses',open:()=>measured('7e'),
  make(){ const k=rnd(SET_SEEDS7.length), L=shuffle(['d','b','c']); return {kind:'set',t:relabel(tparse(SET_SEEDS7[k]),{d:L[0],b:L[1],c:L[2]}),ix:'['+k+','+L.join('')+']'}; }});
SKIND['7e.sets']='set';
const DIR7=[['¬¬P ⇒ P','not-not out'],['¬(P ∧ Q) ⇒ (¬P ∨ ¬Q)','not-both forward'],['(P ⇒ Q) ⇒ (¬P ∨ Q)','if-as-or forward'],['(¬Q ⇒ ¬P) ⇒ (P ⇒ Q)','turn-and-deny turned back'],['¬(P ⇒ Q) ⇒ (P ∧ ¬Q)','negated-if forward'],['P ∨ ¬P','the either-way principle'],['(P ⇒ Q) ∨ (Q ⇒ P)','one-way-or-the-other'],
  ['P ⇒ ¬¬P',''],['(¬P ∨ ¬Q) ⇒ ¬(P ∧ Q)',''],['(¬P ∨ Q) ⇒ (P ⇒ Q)',''],['(P ⇒ Q) ⇒ (¬Q ⇒ ¬P)',''],['(P ∧ ¬Q) ⇒ ¬(P ⇒ Q)',''],['¬(P ∨ Q) ⇒ (¬P ∧ ¬Q)',''],['(¬P ∧ ¬Q) ⇒ ¬(P ∨ Q)',''],['¬¬(P ∨ ¬P)',''],['¬¬¬P ⇒ ¬P','']];
const E7=[
  ['From ¬¬∃x P(x), not-not-out is cited. What does it give?','∃x P(x): a some, which names nothing',['the x itself','∀x P(x)','nothing: not-not-out does not reach a some'],'A call then opens a supposition; it is not a finding. The some may have no address.'],
  ['Does the either-way principle license the converse: from P ⇒ Q, writing Q ⇒ P?','no: the converse was never a technique, and its columns do not match',['yes, from this rung on','yes, when P is decidable','only inside a proof by cases'],'Either-way licenses techniques only. It clears the withheld directions of the rulebook; the converse was never on it.'],
  ['What became of the constructive columns written before this rung?','they still stand, and are worth more: each hands you what it claims exists',['they are replaced by classical ones','they are lost','they now need either-way cited'],'Nothing proved before this rung is lost. What changed is that the double negatives are gone, the licence column is full, and every case split is allowed.'],
  ['On what may a proof now split into cases?','on any statement P: case P, reach R; case ¬P, reach R; so R',['on decidable statements only','on an or already in hand, and nothing else','on statements about numbers only'],'The split is proof by cases with the or supplied by either-way. Before this rung it was allowed only for settled statements.'],
  ['Room-of-laughers proves that some person is such that, if that person laughs, everybody laughs. Does it name the person?','no: it proves one exists; in a room you can see, look, and in an endless room nobody can',['yes: the first person to laugh','yes: whoever is not laughing','yes: everybody'],'The proof splits on “everybody is laughing”. A classical some may come without an address.'],
  ['The parts of X are counted: 𝒫(X) has 2ⁿ members. For an undecided G, which part is {x ∈ X : x = cat ∧ G}, with cat ∈ X?','{cat} or ∅; which, either-way does not say',['{cat}','∅','neither: it is not a part of X'],'All-parts-counted says every part is one of the 2ⁿ. It does not say which one a given description names.'],
  ['From this rung on, how may 1f’s rulebook be used?','every technique in both directions, for any statements, in any place',['forward only, as before','both directions, for decidable statements only','both directions, at the outermost mark only'],'The licence column reads “both ways, any” on every row, and 1f’s place rule is no longer needed.']];
QP.push({id:'7e.withheld',step:'7e',label:'the withheld directions',open:()=>measured('7e'),make(){
    const [x,y]=take(['P','Q','R'],2), m={P:x,Q:y}, W=DIR7.filter(d=>!everywhere7(d[0])), F=DIR7.filter(d=>everywhere7(d[0])), late=Math.random()<0.65, R=pick(late?W:F), wrong=take(late?F:W,3), sh=d=>let7(d[0],m);
    return {index:'q:7e.withheld['+(late?'7':'1')+';'+sh(R)+';'+wrong.map(sh).join(';')+']', lines:[], ask:late?'Which of these lines waited for rung 7?':'Which of these lines did rung 1’s techs already reach?', right:sh(R), opts:shuffle([R,...wrong]).map(sh), lead:'It is '+sh(R)+'. ',
      why:late?'It is '+(R[1]||'a withheld direction')+'. Rung 1’s techs cannot reach it, because it fails in a world of stages. '+let7(fails7(R[0]),m)+' There it is not true at now. Each other line is true at every stage of every such world.'
        :'It is true at every stage of every world of stages, and rung 1’s techs prove it. Each other line fails at some stage of some world, and waited for either-way.'}; }},
  {id:'7e.parts',step:'7e',mode:'work',label:'all parts counted',open:()=>measured('7e'),make(){
    const n=2+rnd(9), right=String(2**n), opts=uniq(right,[2*n,n*n,2**n-1,2**(n+1),n*(n-1),n+1].map(String),3);
    return {index:'q:7e.parts['+n+']', lines:[['X has '+n+' members','given']], ask:'How many members has 𝒫(X)?', right, opts:shuffle([right,...opts]), lead:'',
      why:'All-parts-counted: if X has n members, 𝒫(X) has 2ⁿ. Each member is kept or dropped, and with either-way every part, described however you like, is one of these. '+Array(n).fill(2).join(' · ')+' = '+right+'.'}; }},
  {id:'7e.address',step:'7e',label:'what changed, and what did not',open:()=>measured('7e'),make(){ return written7('7e.address',E7); }});

/* ---------- 7f Proof by Contradiction ---------- */
const KF7=[['prime above 2','odd'],['crate on the dock','sealed'],['barge in the tow','lashed'],['row of the field','planted'],['even number above 2','a sum of two primes'],['page of the ledger','balanced']];
const AB7=[['3 divides n · n','3 divides n'],['the tide is in','the ferry runs'],['p · p is even','p is even'],['the lamp is lit','the door is shut']];
const WANT7=[['no fraction squares to 2',true],['there is no greatest prime',true],['the collection of socks has no choosing function',true],['p · p is not 2 · q · q, for numbers p and q with q not 0',true],
  ['every non-empty set of numbers has a least member',false],['the set has a member greater than k',false],['some member of the room is not laughing',false],['the statement P, which is not a denial',false],
  ['0 is not the next of any number',true],['the set of primes is not finite',true],['some crate on the dock is not sealed',false],['the two sets are the same',false]];
const F7=[
  ['The supposition was used once, at the end, only to produce the collision. What is the proof underneath?','a direct proof: drop the supposition and write it directly',['a proof by contrapositive','a refutation that needs not-not-out','no proof at all'],'Taking the costume off: everything else works without the supposition, and the direct proof hands you more.'],
  ['The only part of the supposition used is the denied conclusion, and the collision is with the hypothesis. What has been written?','a proof by contrapositive: write it as one',['a direct proof of the if','a circular proof','a proof that needs choice'],'Strip the supposition and what is left proves: if the conclusion fails, the hypothesis fails.'],
  ['The collision never used the supposition. What then?','stop and look: the givens clash on their own, or a line is wrong',['the statement is proved','the denial is proved','cite not-not-out and go on'],'A collision that does not lean on the supposition says nothing about the supposition.'],
  ['No contradiction has been found from supposing ¬P. What follows?','nothing: failing to break a supposition proves nothing about it',['¬P is true','P is true','P is undecidable'],'Not finding a collision is not a proof.'],
  ['“x · x = x and x ≠ 1: cancel x, so x = 1, a contradiction.” What went wrong?','the collision was made by a mistake: cancelling x needs x ≠ 0, and the lost answer is 0',['nothing: x = 1 is proved','the supposition was not the exact denial','not-not-out was not cited'],'0 · 0 = 0 and 0 ≠ 1. A collision made by a wrong move refutes nothing.'],
  ['What are the four parts of the layout?','the supposition, the ordinary moves, the collision, and the conclusion with its move',['the given, the goal, the cases and the check','the start, the step, the hypothesis and the end','the statement, its converse, its denial and its contrapositive'],'Write the four parts so that anyone can see them. The opening line names the supposition and says what kind it is; one line names the collision.'],
  ['With ¬P supposed for contradiction, the middle of the proof uses P itself. What is wrong?','it circles: P collides with ¬P at once and proves nothing',['nothing: P is what is wanted','P should have been ¬¬P','the supposition should have been P'],'P may not be used while it is being proved.']];
QP.push({id:'7f.denial',step:'7f',label:'the exact denial',open:()=>measured('7f'),make(){
    const k=rnd(5), [K,F]=pick(KF7), [A,B]=pick(AB7), a=pick(['a','m','p']), b=pick(['b','n','q']);
    const [S,right,wrong,why]=k===0?['every '+K+' is '+F,'some '+K+' is not '+F,['every '+K+' is not '+F,'some '+K+' is '+F,'no '+K+' is '+F],'“Not every” is “some is not”. Supposing that every one fails is a stronger claim, and refuting a stronger claim proves nothing.']
      :k===1?['some '+K+' is '+F,'every '+K+' is not '+F,['some '+K+' is not '+F,'every '+K+' is '+F,'not every '+K+' is '+F],'“There is none” is “every one is not”.']
      :k===2?['if '+A+', then '+B,A+', and it is not so that '+B,['if '+A+', then it is not so that '+B,'it is not so that '+A+', and it is not so that '+B,'if '+B+', then '+A],'An if is false only when its hypothesis is true and its conclusion is not.']
      :k===3?[A+', and '+B,'it is not so that '+A+', or it is not so that '+B,['it is not so that '+A+', and it is not so that '+B,A+', or '+B,'if '+A+', then '+B],'Not both: one of the two fails. Which one, the denial does not say.']
      :[a+' < '+b,b+' ≤ '+a,[b+' < '+a,a+' ≤ '+b,a+' = '+b],'Any two numbers compare: if '+a+' is not less than '+b+', then '+b+' is less than '+a+' or the same.'];
    return {index:'q:7f.denial['+k+';'+S+']', lines:[[S,'the statement to prove']], ask:'A proof by contradiction supposes the exact denial. Which line is it?', right, opts:shuffle([right,...wrong]), lead:'It is: '+right+'. ', why:'The supposition must be the exact denial of the statement. '+why}; }},
  {id:'7f.which',step:'7f',mode:'proof',label:'two techs with one name',open:()=>measured('7f'),make(){
    const k=rnd(WANT7.length), [want,den]=WANT7[k], opts=['refute ends it: no rung 7 is used','refute gives a double not; not-not-out ends it'];
    return {index:'q:7f.which['+k+']', stack:true, lines:[[want,'the statement wanted'],[den?'suppose the statement without its not':'suppose, for contradiction, its exact denial','a supposition'],['⊥','ordinary moves, then the collision']], ask:'Which move ends the column?', right:opts[den?0:1], opts, lead:'',
      why:den?'The statement wanted is a denial. Supposing what it denies and reaching ⊥ is 1b’s refutation: the refute writes the denial at once, and nothing of rung 7 is used.':'The statement wanted is not a denial. Supposing its denial and reaching ⊥ shows only that the denial is totally false: ¬¬P. The last step is not-not-out, so the result may have no address.'}; }},
  {id:'7f.costume',step:'7f',label:'the layout, and the costume',open:()=>measured('7f'),make(){ return written7('7f.costume',F7); }});

/* ---------- 7g Yes or No Is Data ---------- */
const G7=[['It is drizzling: somewhere between raining and not. Someone says the either-way principle must be wrong.','What does the principle speak of?','statements, not weather: decide what “it is raining” claims, and it is true or false',['weather: drizzle is neither, so the principle fails','weather: drizzle counts as rain','nothing, once the world has a middle'],'The world often has a middle, and the principle does not deny it. The middle is still there, and a sharper statement can say where.'],
  ['A glass stands half full. “The glass is full” is asked of it.','What makes the line true or false?','deciding what the words claim',['the glass, which is neither','a third value between 1 and 0','nothing can'],'The principle speaks of statements. A sharper statement, such as how full, can say where the middle is.'],
  ['A check comes back: true. The line said that every crate on the dock is sealed.','What has the yes told you?','that, as worded, the claim holds: more data for a better guess',['that the guess behind the words is now a verdict','that nothing more need be asked','that every other line about the dock is true'],'Yes or no, 1 or 0: each is more data for a better guess. None of them is a verdict handed down from on high.'],
  ['With either-way, every statement has a row: 1 or 0.','Why does that make deduction easier?','there are only two ways anything can come out, so cases on any statement, not-not out and contradiction all follow',['every statement is now proved','no guesswork is needed any more','every or now says which side holds'],'Two values make deduction easy. The guess behind the words is still a guess.'],
  ['A report gives its verdict, true, and leaves out the guess that led to the wording.','What is lost?','what the guess knew',['nothing: the verdict is all that matters','the truth of the line','the row of the statement'],'This is why the ladder keeps showing its guesswork. A verdict that hides its guess loses what the guess knew.']];
QP.push({id:'7g.data',step:'7g',mode:'word',label:'yes or no is data',open:()=>measured('7g'),make(){
    const k=rnd(G7.length), [story,ask,right,wrong,why]=G7[k], ws=shuffle(wrong.slice());
    return {index:'q:7g.data['+k+';'+ws.map(w=>w.length).join('.')+']', a3:['7g.data['+k+']',DASH,DASH], story, lines:[], ask, right, opts:shuffle([right,...ws]), lead:'', why}; }});

/* ===== Laundry 5, rung 8 (floor 2 pools, stage H): 8a to 8i, the line ===== */
Object.assign(STEPS,{'8a':['r08a','A Real Number Is a Cut'],'8b':['r08b','Any Two Reals Compare'],'8c':['r08c','The Least Upper Bound'],'8d':['r08d','Adding and Multiplying Cuts'],'8e':['r08e','Counting Passes Any Real'],
  '8f':['r08f','Two Has a Square Root on the Line'],'8g':['r08g','Inequalities'],'8h':['r08h','Absolute Value and Distance on the Line'],'8i':['r08i','Roots, Powers and the Quadratic Formula']});
const fless=(a,b)=>a.p*b.q<b.p*a.q, fneg=f=>fr(-f.p,f.q), fsub=(a,b)=>fadd(a,fneg(b)), fint=n=>fr(n,1), fhalf=f=>fr(f.p,2*f.q);
const star=f=>(f.q===1&&f.p>=0?fshow(f):'('+fshow(f)+')')+'*';
const frq=(lo,hi)=>{ for(;;){ const q=1+rnd(6), p=lo*q+rnd((hi-lo)*q+1), f=fr(p,q); return f; } };   /* a fraction from lo to hi */
const sg=n=>n<0?'−'+(-n):String(n), pm=n=>n<0?' − '+(-n):' + '+n;

/* ---------- 8a A Real Number Is a Cut ---------- */
const CUT4=['(i): it has no member','(ii): it misses no fraction','(iii): it is not closed downward','(iv): it has a greatest member'];
QP.push({id:'8a.cut',step:'8a',label:'the four properties of a cut',open:()=>measured('8a'),make(){
    const r=fshow(frq(-2,3)), sets=[['{s ∈ ℚ : s < '+r+'}',-1],['{s ∈ ℚ : s < 0 ∨ s² < 2}',-1],['{s ∈ ℚ : s ≤ '+r+'}',3],['{s ∈ ℚ : s > '+r+'}',2],['ℚ',1],['∅',0],['{s ∈ ℚ : s² < 2}',2],['{'+r+'}',2]];
    if(Math.random()<0.5){ const R=pick(sets.filter(s=>s[1]<0)), wrong=take(sets.filter(s=>s[1]>=0),3);
      return {index:'q:8a.cut[is;'+R[0]+';'+wrong.map(w=>w[0]).join(';')+']', lines:[], ask:'Which set of fractions is a cut?', right:R[0], opts:shuffle([R,...wrong]).map(s=>s[0]), lead:'It is '+R[0]+'. ',
        why:'A cut has a member, misses some fraction, is closed downward, and has no greatest member. The others fail: '+wrong.map(w=>w[0]+' by '+CUT4[w[1]].slice(0,w[1]===0?3:w[1]===1?4:w[1]===2?5:4)).join('; ')+'.'}; }
    const B=pick(sets.filter(s=>s[1]>=0)), right=CUT4[B[1]];
    return {index:'q:8a.cut[not;'+B[0]+']', lines:[[B[0],'a set of fractions']], ask:'The set is not a cut. Which of the four properties fails first?', right, opts:CUT4.slice(), lead:'',
      why:['A cut has a member, and ∅ has none.','A cut misses some fraction, and ℚ misses none.','A cut is closed downward: with a member it holds every fraction below that member. This set leaves out fractions below one of its members.','A cut has no greatest member. This set has one, the fraction '+r+' itself; with it, that fraction would have two cuts.'][B[1]]}; }},
  {id:'8a.member',step:'8a',mode:'work',label:'the fractions below',open:()=>measured('8a'),make(){
    for(let t=0;t<60;t++){ const hole=Math.random()<0.5, r=frq(0,2), inn=hole?(f=>f.p<0||f.p*f.p<2*f.q*f.q):(f=>fless(f,r)), C=[]; for(let i=0;i<14;i++) C.push(frq(hole&&Math.random()<0.2?-3:0,3));
      const yes=C.filter(inn), no=C.filter(f=>!inn(f)&&f.p>=0), R=yes[0], wrong=uniq(R?fshow(R):'',no.map(fshow),3); if(!R||wrong.length<3||(!hole&&r.p===0)) continue;
      const name=hole?'α = {r ∈ ℚ : r < 0 ∨ r² < 2}':star(r)+' = {s ∈ ℚ : s < '+fshow(r)+'}', right=fshow(R);
      return {index:'q:8a.member['+(hole?'hole':fshow(r))+';'+right+';'+wrong.join(';')+']', lines:[[name,hole?'the hole’s heap':'the cut of '+fshow(r)]], ask:'Which fraction is a member of it?', right, opts:shuffle([right,...wrong]), lead:'',
        why:hole?(R.p<0?'Every negative fraction is let in: without them the set would not be closed downward.':right+' squares to '+fshow(fmul(R,R))+', which is less than 2.')+' Each other fraction is positive and squares to more than 2.':'The members of the cut of '+fshow(r)+' are the fractions below '+fshow(r)+'. The fraction '+fshow(r)+' itself is not one of them.'}; }
    return null; }},
  {id:'8a.step',step:'8a',mode:'work',label:'the hole’s step',open:()=>measured('8a'),make(){
    const r=pick([fr(1,1),fr(4,3),fr(7,5),fr(3,2),fr(1,2),fr(2,1),fr(5,4),fr(0,1),fr(3,1)]), two=fint(2), s=fmul(fadd(fmul(two,r),two),fr(fadd(r,two).q,fadd(r,two).p)), right=fshow(s);
    const wrong=uniq(right,[fshow(fmul(fadd(r,two),fr(fadd(fmul(two,r),two).q,fadd(fmul(two,r),two).p))),fshow(fadd(r,fr(1,2))),fshow(fmul(fadd(fmul(two,r),fint(1)),fr(fadd(r,two).q,fadd(r,two).p))),fshow(fadd(r,fint(1))),fshow(fmul(r,r))],3); if(wrong.length<3) return null;
    const low=s.p*s.p<2*s.q*s.q;
    return {index:'q:8a.step['+fshow(r)+']', lines:[['r = '+fshow(r),'a fraction, not negative'],['s = (2r + 2)/(r + 2)','the hole’s step']], ask:'Which fraction is s?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'(2 · '+fshow(r)+' + 2)/('+fshow(r)+' + 2) = '+right+'. Its square is '+fshow(fmul(s,s))+', '+(low?'still below 2, and s is above r: the lower heap has no greatest member.':'still above 2, and s is below r: the upper heap has no least member.')}; }});

/* ---------- 8b Any Two Reals Compare ---------- */
const B8=[
  ['{0} and {1} are parts of ℚ, and neither is a part of the other. Does that refute any-two-compare on ℝ?','no: neither set is a cut, and the technique speaks of reals',['yes: any two sets of fractions compare','yes, unless either-way is dropped','no: {0} is a part of {1}'],'Of any two cuts, one is a part of the other. Closed downward is what makes it so.'],
  ['The proof of any-two-compare on ℝ cites either-way. Could a cleverer column avoid it?','no: the comparison is exactly as strong as the either-way principle',['yes: by finite-search','yes: by the choosing axiom alone','nobody knows'],'Comparing-gives-either-way: if any two reals compare, then P ∨ ¬P, for any statement P.'],
  ['For reals α and β, how many of α < β, α = β, β < α hold?','exactly one',['at least one, perhaps two','at most one, perhaps none','all three, when α = β'],'Three-way-order on ℝ. At least one, by any-two-compare; no two together, since ⊆ both ways is sameness.'],
  ['On the line, what does α ≤ β mean?','α ⊆ β: every fraction in α is in β',['β ⊆ α','α has fewer members than β','some fraction is in α and not in β'],'Order is being a part of. And α < β means α ≤ β and α ≠ β.']];
QP.push({id:'8b.greater',step:'8b',mode:'work',label:'the greater is the merge',open:()=>measured('8b'),make(){
    for(let t=0;t<40;t++){ const r=frq(-2,3), s=frq(-2,3); if(fsame(r,s)) continue; const lo=fless(r,s)?r:s, hi=fless(r,s)?s:r, k=rnd(4), ex=[star(r)+' ∪ '+star(s),star(r)+' ∩ '+star(s),'max('+star(r)+', '+star(s)+')','min('+star(r)+', '+star(s)+')'][k], up=k===0||k===2;
      const right=star(up?hi:lo), wrong=uniq(right,[star(up?lo:hi),star(fadd(r,s)),'ℚ','∅'],3);
      return {index:'q:8b.greater['+k+';'+fshow(r)+';'+fshow(s)+']', lines:[[ex,'two cuts of fractions']], ask:'Which real is it?', right, opts:shuffle([right,...wrong]), lead:'',
        why:fshow(lo)+' < '+fshow(hi)+', so '+star(lo)+' ⊆ '+star(hi)+'. The greater of two reals is their union and the lesser is what they share: max(α, β) = α ∪ β and min(α, β) = α ∩ β.'}; }
    return null; }},
  {id:'8b.witness',step:'8b',label:'a witness for less',open:()=>measured('8b'),make(){
    for(let t=0;t<40;t++){ const r=frq(-1,2), s=fadd(r,fr(1+rnd(3),1+rnd(3))), mid=fhalf(fadd(r,s)), R=Math.random()<0.35?r:mid, wrong=uniq(fshow(R),[fshow(s),fshow(fsub(r,fr(1,2))),fshow(fadd(s,fr(1,3))),fshow(fsub(r,fint(1)))],3); if(wrong.length<3) continue;
      return {index:'q:8b.witness['+fshow(r)+';'+fshow(s)+';'+fshow(R)+']', lines:[[star(r)+' < '+star(s),'to be shown']], ask:'Which fraction is a witness: in '+star(s)+' and not in '+star(r)+'?', right:fshow(R), opts:shuffle([fshow(R),...wrong]), lead:'',
        why:'Witness-for-less: α < β exactly when some fraction is in β and not in α. '+fshow(R)+' is below '+fshow(s)+' and not below '+fshow(r)+(fsame(R,r)?': a fraction is not a member of its own cut.':'.')}; }
    return null; }},
  {id:'8b.three',step:'8b',label:'order on the line',open:()=>measured('8b'),make(){ return writtenQ('8b.three',B8); }});

/* ---------- 8c The Least Upper Bound ---------- */
const C8=[
  ['What does no-holes say?','every set of reals with a member and an upper bound has a least upper bound, and it is the union',['every set of reals has a greatest member','every set of fractions has a least upper bound among the fractions','every real is a fraction’s cut'],'sup S = ⋃S. The union of the cuts is itself a cut, and nothing smaller is above them all.'],
  ['The hole’s heap has fractions above it: 3/2 and 2. Has it a least upper bound among the fractions?','no: below any fraction bound there is a smaller one',['yes: 3/2','yes: 7/5','yes: 2'],'The fractions are not complete. On the line the same heap is a real, and it is its own least upper bound.'],
  ['Is sup S always a member of S?','sometimes: for {1*, 2*, 3*} yes, for the cuts of 1 − 1/n no',['always','never','only when S is infinite'],'No member of {(1 − 1/n)*} reaches 1*, and 1* is the least real above them all.'],
  ['Why is ⋃{n* : n ∈ ℕ} not a real?','it misses no fraction: the set has no upper bound',['it has no member','it has a greatest member','it is not closed downward'],'Union-of-cuts needs a member and an upper bound. Without the bound the union is all of ℚ, and (ii) fails.'],
  ['To show σ = sup S without writing the union, what two things are shown?','σ is an upper bound of S, and nothing smaller is',['σ is in S, and σ is positive','σ is a fraction, and S is finite','σ is above one member of S, and below another'],'A least upper bound is an upper bound that is at most every upper bound.']];
QP.push({id:'8c.sup',step:'8c',mode:'work',label:'the least upper bound',open:()=>measured('8c'),make(){
    const k=rnd(5), c=1+rnd(5);
    const [S,right,cands,why]=k===0?(()=>{ const fs=[frq(-1,4),frq(-1,4),frq(-1,4)], mx=fs.reduce((a,b)=>fless(a,b)?b:a), mn=fs.reduce((a,b)=>fless(a,b)?a:b); return ['{'+fs.map(star).join(', ')+'}',star(mx)+', a member of S',[star(mx)+', not a member of S',star(mn)+', a member of S',star(fadd(mx,fint(1)))+', not a member of S','S has none'],'A set with a greatest member has that member as its least upper bound.']; })()
      :k===1?['{('+c+' − 1/n)* : n ∈ ℕ, n ≠ 0}',c+'*, not a member of S',[c+'*, a member of S',(c-1)+'*, a member of S',(c+1)+'*, not a member of S','S has none'],'Every '+c+' − 1/n is below '+c+', and a fraction below '+c+' is below some '+c+' − 1/n. So the union is '+c+'*, and no member reaches it.']
      :k===2?['{n* : n ∈ ℕ}','S has none: it has no upper bound',['0*, a member of S','1*, a member of S','ℚ, not a member of S','the greatest number’s cut'],'Counting passes any real, so no real is above every n*. The union is all of ℚ, which is not a cut.']
      :k===3?['{(1/n)* : n ∈ ℕ, n ≠ 0}','1*, a member of S',['0*, not a member of S','0*, a member of S','1*, not a member of S','S has none'],'The greatest member is (1/1)* = 1*. The greatest lower bound is 0*, and that one is not a member.']
      :['{x ∈ ℝ : x < '+c+'}',c+'*, not a member of S',[c+'*, a member of S',(c-1)+'*, a member of S',(c+1)+'*, not a member of S','S has none'],c+' is above every member, and below '+c+' there is always a real still in S: a fraction lies between any two reals.'];
    const wrong=uniq(right,shuffle(cands),3);
    return {index:'q:8c.sup['+k+';'+S+']', lines:[['S = '+S,'a set of reals']], ask:'What is sup S, the least upper bound?', right, opts:shuffle([right,...wrong]), lead:'', why}; }},
  {id:'8c.holes',step:'8c',label:'no holes',open:()=>measured('8c'),make(){ return writtenQ('8c.holes',C8); }});

/* ---------- 8d Adding and Multiplying Cuts ---------- */
const D8=[
  ['The tempting −α is the negatives of the fractions α misses. Why is it wrong?','for α = r* it has a greatest member, −r: (iv) fails',['it has no member','it is not closed downward','it is all of ℚ'],'The cure is to ask for room: the negatives of the fractions with some missed fraction below them.'],
  ['When is a real α positive?','when 0* < α, which is exactly when 0 ∈ α',['when every member of α is positive','when α has a positive member and no negative one','when α misses 0'],'By members-are-the-fractions-below, 0 ∈ α exactly when 0* < α. A positive cut still holds every negative fraction.'],
  ['For positive cuts α and β, the products rs of positive r ∈ α and s ∈ β are gathered. What else must be let in?','every fraction at most 0',['nothing','every fraction below 1','the fractions α and β both miss'],'The positive products alone would miss the negatives, and the set would not be closed downward.'],
  ['Cuts have no representatives. How is each operation on cuts built?','as a sift of ℚ, which then has to be checked to be a cut',['on a representative, checking the choice does not matter','by recursion on the numbers','by the choosing axiom'],'A cut is one set. So α + β is {r + s : r ∈ α, s ∈ β}, and the four properties are checked for it.'],
  ['What is a complete ordered field?','a regular number system with an order that agrees with its arithmetic, and no holes',['any set with an adding and a multiplying','the fractions with their order','a number system where every member is a fraction'],'ℝ, with its + and ·, 0 and 1, negatives, reciprocals and positive, is one. ℚ is ordered and regular, and has holes.']];
QP.push({id:'8d.agree',step:'8d',mode:'work',label:'the fractions keep their arithmetic',open:()=>measured('8d'),make(){
    for(let t=0;t<40;t++){ const r=frq(-2,3), s=frq(-2,3), k=rnd(4); if(r.p===0||s.p===0) continue;
      const [ex,v,alts,name]=k===0?[star(r)+' + '+star(s),fadd(r,s),[fmul(r,s),fsub(r,s),fr(r.p+s.p,r.q+s.q)],'Fraction-sums-agree: (r + s)* = r* + s*.']:k===1?[star(r)+' · '+star(s),fmul(r,s),[fadd(r,s),fneg(fmul(r,s)),fr(r.p*s.q,r.q*s.p)],'Fraction-products-agree: (rs)* = r*s*.']
        :k===2?['−('+star(r)+')',fneg(r),[r,fr(r.q,r.p),fsub(fint(1),r)],'Fraction-negatives-agree: (−r)* = −(r*).']:['('+star(r)+')⁻¹',fr(r.q,r.p),[fneg(r),r,fsub(fint(1),r)],'Fraction-reciprocals-agree: (r⁻¹)* = (r*)⁻¹ for r ≠ 0.'];
      const right=star(v), wrong=uniq(right,alts.map(star).concat([star(fadd(v,fint(1)))]),3); if(wrong.length<3) continue;
      return {index:'q:8d.agree['+ex+']', lines:[[ex,'worked on the line']], ask:'Which real is it?', right, opts:shuffle([right,...wrong]), lead:'', why:name+' Where a real is meant, a rational r names the real r*, and the arithmetic of the fractions is kept.'}; }
    return null; }},
  {id:'8d.built',step:'8d',label:'what has to be built',open:()=>measured('8d'),make(){ return writtenQ('8d.built',D8); }});

/* ---------- 8e Counting Passes Any Real ---------- */
QP.push({id:'8e.passes',step:'8e',mode:'work',label:'counting passes',open:()=>measured('8e'),make(){
    for(let t=0;t<40;t++){ if(Math.random()<0.5){ const a=frq(1,30), n=Math.floor(a.p/a.q)+1, right=String(n), wrong=uniq(right,[n-1,n+1,a.p,a.q].filter(x=>x>=0).map(String),3); if(wrong.length<3) continue;
        return {index:'q:8e.passes[up;'+fshow(a)+']', lines:[['α = '+fshow(a),'a real']], ask:'Counting passes α. Which is the least number n with α < n?', right, opts:shuffle([right,...wrong]), lead:'', why:(n-1)+' ≤ '+fshow(a)+' < '+n+'. Counting eventually passes any real; here it does so at '+n+'.'}; }
      const p=1+rnd(3), q=p+1+rnd(20), a=fr(p,q); if(a.p===0) continue; const n=Math.floor(a.q/a.p)+1, right=String(n), wrong=uniq(right,[n-1,n+1,a.q,n+2].filter(x=>x>0).map(String),3); if(wrong.length<3) continue;
      return {index:'q:8e.passes[down;'+fshow(a)+']', lines:[['α = '+fshow(a),'a positive real']], ask:'Which is the least number n, not 0, with 1/n < α?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'1/n < '+fshow(a)+' exactly when '+fshow(fr(a.q,a.p))+' < n. The least such number is '+n+': 1/'+n+' is below α and 1/'+(n-1)+' is not.'}; }
    return null; }},
  {id:'8e.between',step:'8e',mode:'work',label:'a fraction between',open:()=>measured('8e'),make(){
    for(let t=0;t<40;t++){ const a=frq(-1,3), b=fadd(a,fr(1,1+rnd(6))), m=fhalf(fadd(a,b)), right=fshow(m), wrong=uniq(right,[fshow(a),fshow(b),fshow(fadd(b,fsub(b,a))),fshow(fsub(a,fsub(b,a))),fshow(fadd(a,b))].filter(w=>{ const f=w; return true; }),3);
      const btw=f=>fless(a,f)&&fless(f,b); if(wrong.length<3||btw(fadd(a,b))&&wrong.includes(fshow(fadd(a,b)))) continue;
      return {index:'q:8e.between['+fshow(a)+';'+fshow(b)+']', lines:[[fshow(a)+' < r < '+fshow(b),'a fraction r is wanted']], ask:'Which fraction lies strictly between the two?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'Half the sum of two fractions lies between them: ('+fshow(a)+' + '+fshow(b)+')/2 = '+right+'. Fraction-between says more: between any two reals there is a fraction, so ℚ is dense in ℝ.'}; }
    return null; }});

/* ---------- 8f Two Has a Square Root on the Line ---------- */
const F8=[
  ['Two expressions with roots are to be shown the same. What does the uniqueness method ask?','that both are non-negative and have the same square',['that both are fractions','that their difference is small','that one is the square of the other'],'One-root: for non-negative x and y, x² = y² gives x = y.'],
  ['A real with a given square is wanted. How does the line supply it?','as the least upper bound of what falls short',['as the greatest fraction that falls short','by the choosing axiom','by trying fractions until one fits'],'S = {x : 0 ≤ x ∧ x² < 2} has a member and an upper bound, so no-holes gives σ = sup S. Too small and too big are both refuted, so σ² = 2.'],
  ['Is {r ∈ ℚ : r² < 2} the real √2?','no: it is not a cut, and √2 lets the negatives in',['yes','no: it has a greatest member','no: √2 is a fraction'],'It leaves out −2, which is below its member 0. The hole’s cut is {r ∈ ℚ : r < 0 ∨ r² < 2}.'],
  ['For every real x, what can be said of x²?','0 ≤ x²',['0 < x²','x ≤ x²','x² ≤ x'],'Square-never-negative. A positive times a positive and a negative times a negative are both positive, and 0² = 0.']];
QP.push({id:'8f.root',step:'8f',mode:'work',label:'square roots on the line',open:()=>measured('8f'),make(){
    if(Math.random()<0.5){ const sq=[1,4,9,16,25,36,49,64,81,100], u=2+rnd(98); if(sq.includes(u)) return null; const f=Math.floor(Math.sqrt(u)), say=n=>'between '+n+' and '+(n+1), right=say(f);
      return {index:'q:8f.root[bt;'+u+']', lines:[['x ≥ 0 and x² = '+u,'the square-root technique gives one such real']], ask:'Between which two numbers does x lie?', right, opts:shuffle([right,...uniq(right,[say(f-1),say(f+1),say(Math.floor(u/2)),say(f+2)],3)]), lead:'',
        why:f+'² = '+(f*f)+' < '+u+' < '+((f+1)*(f+1))+' = '+(f+1)+'². Powers keep order, so '+f+' < x < '+(f+1)+'.'}; }
    const p=1+rnd(9), q=1+rnd(6), f=fr(p,q), u=fmul(f,f), right=fshow(f), wrong=uniq(right,[fshow(fneg(f)),fshow(fhalf(u)),fshow(u),fshow(fmul(u,u)),fshow(fadd(f,fint(1)))],3);
    return {index:'q:8f.root[sq;'+fshow(u)+']', lines:[['x ≥ 0 and x² = '+fshow(u),'one real only']], ask:'Which real is x?', right, opts:shuffle([right,...wrong]), lead:'',
      why:right+' is not negative and squares to '+fshow(u)+'. By one-root there is no other: √('+fshow(u)+') = '+right+'.'+(wrong.includes(fshow(fneg(f)))?' '+fshow(fneg(f))+' has the same square, and is negative.':'')}; }},
  {id:'8f.method',step:'8f',label:'roots by least upper bound',open:()=>measured('8f'),make(){ return writtenQ('8f.method',F8); }});

/* ---------- 8g Inequalities ---------- */
QP.push({id:'8g.linear',step:'8g',mode:'work',label:'linear inequalities',open:()=>measured('8g'),make(){
    for(let t=0;t<40;t++){ const a=pick([-5,-4,-3,-2,2,3,4,5]), b=rnd(13)-6, k=rnd(11)-5, c=a*k+b, op=pick(['<','>','≤','≥']), flip={'<':'>','>':'<','≤':'≥','≥':'≤'}; if(k===0||b===0) continue;
      const line=sg(b)+(a<0?' − '+(-a):' + '+a)+'x '+op+' '+sg(c), ans=a<0?flip[op]:op, right='x '+ans+' '+sg(k), wrong=uniq(right,['x '+flip[ans]+' '+sg(k),'x '+ans+' '+sg(-k),'x '+flip[ans]+' '+sg(-k)],3);
      return {index:'q:8g.linear['+line+']', lines:[[line,'the question']], ask:'Which line is the answer?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'Add '+sg(-b)+' to both sides: order kept. Then multiply both sides by 1/'+(a<0?'('+sg(a)+')':a)+': '+(a<0?'a negative, so the order turns about.':'a positive, so the order is kept.')+' Check a value: at x = '+sg(k)+' the two sides are the same.'}; }
    return null; }},
  {id:'8g.chart',step:'8g',mode:'work',label:'sign charts',open:()=>measured('8g'),make(){
    const a=rnd(9)-5, b=a+1+rnd(5), neg=Math.random()<0.5, strict=Math.random()<0.7, fac=n=>'(x'+(n===0?'':pm(-n))+')', line=fac(a).replace('(x)','x')+fac(b).replace('(x)','x')+' '+(neg?(strict?'<':'≤'):(strict?'>':'≥'))+' 0';
    const ins=strict?'('+sg(a)+', '+sg(b)+')':'['+sg(a)+', '+sg(b)+']', ins2=strict?'['+sg(a)+', '+sg(b)+']':'('+sg(a)+', '+sg(b)+')', out='x '+(strict?'<':'≤')+' '+sg(a)+' or '+sg(b)+' '+(strict?'<':'≤')+' x', out2='x '+(strict?'≤':'<')+' '+sg(a)+' or '+sg(b)+' '+(strict?'≤':'<')+' x';
    const right=neg?ins:out, wrong=neg?[ins2,out,'x '+(strict?'<':'≤')+' '+sg(b)]:[out2,ins,'x '+(strict?'>':'≥')+' '+sg(b)];
    return {index:'q:8g.chart['+line+']', lines:[[line,'the question']], ask:'Read the sign chart. Where does the line hold?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The factors are 0 at '+sg(a)+' and at '+sg(b)+'. Below '+sg(a)+' both are negative, so the product is positive; between them one is negative, so it is negative; above '+sg(b)+' both are positive. '+(strict?'The ends make the product 0, and are left out.':'The ends make the product 0, and are let in.')}; }},
  {id:'8g.turn',step:'8g',mode:'proof',label:'a negative turns the order about',open:()=>measured('8g'),make(){
    const p=rnd(9)-4, q=p+1+rnd(5), s=pick([-3,-2,-1,2,3]), add=Math.random()<0.3, turned=Math.random()<0.5;
    const l2=add?[(p+s),(turned?'>':'<'),(q+s)]:[p*s,(turned?'>':'<'),q*s], ok=l2[1]==='<'?l2[0]<l2[2]:l2[0]>l2[2], opts=['the line is licensed','the line is not licensed'];
    return {index:'q:8g.turn['+p+';'+q+';'+s+';'+(add?'a':'m')+(turned?'t':'k')+']', stack:true, lines:[[sg(p)+' < '+sg(q),'given'],[sg(l2[0])+' '+l2[1]+' '+sg(l2[2]),(add?'add '+sg(s)+' to both sides':'multiply both sides by '+sg(s))+(turned?', and turn the order about':', order kept')]], ask:'Is line 2 licensed?', right:opts[ok?0:1], opts, lead:'',
      why:add?'Adding the same real keeps the order: the difference of the two sides is unchanged. The order is never turned about for adding.':s<0?'Negative-reverses-order: p < q and s < 0 give qs < ps. Multiplying by a negative turns the order about, every time.':'Multiplying by a positive keeps strict order. The order is turned about only for a negative.'}; }});

/* ---------- 8h Absolute Value and Distance on the Line ---------- */
QP.push({id:'8h.size',step:'8h',mode:'work',label:'size and distance',open:()=>measured('8h'),make(){
    const p=rnd(19)-9, q=rnd(19)-9, k=rnd(4); if(p===0||q===0||p===q) return null;
    const [ex,v,alts,why]=k===0?['|'+sg(p)+' − '+(q<0?'('+sg(q)+')':q)+'|',Math.abs(p-q),[Math.abs(p+q),Math.abs(p)-Math.abs(q),p-q,Math.abs(p)+Math.abs(q)],'|p − q| is the distance between p and q on the line: '+sg(p)+' − '+(q<0?'('+sg(q)+')':q)+' = '+sg(p-q)+', and its size is '+Math.abs(p-q)+'.']
      :k===1?['|'+sg(p)+' · '+(q<0?'('+sg(q)+')':q)+'|',Math.abs(p*q),[p*q,-Math.abs(p*q),Math.abs(p)+Math.abs(q),Math.abs(p+q)],'Size-of-a-product: |pq| = |p| |q| = '+Math.abs(p)+' · '+Math.abs(q)+'.']
      :k===2?['|'+sg(p)+' + '+(q<0?'('+sg(q)+')':q)+'|',Math.abs(p+q),[Math.abs(p)+Math.abs(q),Math.abs(p-q),p+q,-Math.abs(p+q)],'Work inside the bars first: '+sg(p+q)+', whose size is '+Math.abs(p+q)+'. The triangle technique says only that this is at most |p| + |q| = '+(Math.abs(p)+Math.abs(q))+'.']
      :['√(('+sg(p)+')²)',Math.abs(p),[p,-Math.abs(p),p*p,-p],'Size-squared: √(p²) = |p|. A root is never negative.'];
    const right=sg(v), wrong=uniq(right,alts.concat([v+1,v+2,v+3]).map(sg),3);
    return {index:'q:8h.size['+ex+']', lines:[[ex,'to be worked']], ask:'Which number is it?', right, opts:shuffle([right,...wrong]), lead:'', why}; }},
  {id:'8h.unpack',step:'8h',mode:'work',label:'unpack the bars',open:()=>measured('8h'),make(){
    const c=rnd(13)-6, d=1+rnd(6), k=rnd(4), lo=c-d, hi=c+d, bar='|x'+(c===0?'':pm(-c))+'|';
    const [line,right,wrong,why]=k===0?[bar+' < '+d,'('+sg(lo)+', '+sg(hi)+')',['['+sg(lo)+', '+sg(hi)+']','x < '+sg(lo)+' or '+sg(hi)+' < x','('+sg(-hi)+', '+sg(hi)+')'],'Unpack-the-bars: |p| < d exactly when −d < p < d. So '+sg(-d)+' < x'+(c===0?'':pm(-c))+' < '+d+', and adding '+sg(c)+' throughout gives the stretch.']
      :k===1?[bar+' ≤ '+d,'['+sg(lo)+', '+sg(hi)+']',['('+sg(lo)+', '+sg(hi)+')','x ≤ '+sg(lo)+' or '+sg(hi)+' ≤ x','['+sg(-hi)+', '+sg(hi)+']'],'Unpack-the-bars: |p| ≤ d exactly when −d ≤ p ≤ d. The ends are at distance '+d+' from '+sg(c)+', and are let in.']
      :k===2?[bar+' = '+d,'x = '+sg(lo)+' or x = '+sg(hi),['x = '+sg(hi),'x = '+sg(-hi)+' or x = '+sg(hi),'x = '+sg(lo)],'The two reals at distance '+d+' from '+sg(c)+': one each side.']
      :[bar+' > '+d,'x < '+sg(lo)+' or '+sg(hi)+' < x',['('+sg(lo)+', '+sg(hi)+')','x > '+sg(hi),'x ≤ '+sg(lo)+' or '+sg(hi)+' ≤ x'],'Further than '+d+' from '+sg(c)+': the outside of the stretch from '+sg(lo)+' to '+sg(hi)+', ends left out.'];
    const w=uniq(right,wrong,3); if(w.length<3||(k===2&&(lo===0||hi===0||lo===-hi))) return null;
    return {index:'q:8h.unpack['+line+']', lines:[[line,'the question']], ask:'Which reals x make the line hold?', right, opts:shuffle([right,...w]), lead:'', why:bar+' is the distance from x to '+sg(c)+'. '+why}; }},
  {id:'8h.triangle',step:'8h',label:'the triangle technique',open:()=>measured('8h'),make(){
    const eq=Math.random()<0.5, same=()=>{ const s=pick([1,-1]); return [s*(1+rnd(8)),s*(1+rnd(8))]; }, opp=()=>{ const s=pick([1,-1]); return [s*(1+rnd(8)),-s*(1+rnd(8))]; }, sh=x=>'a = '+sg(x[0])+', b = '+sg(x[1]);
    const R=(eq?same:opp)(), W=[]; for(let i=0;i<20&&W.length<3;i++){ const w=(eq?opp:same)(); if(!W.some(x=>sh(x)===sh(w))) W.push(w); } if(W.length<3) return null;
    return {index:'q:8h.triangle['+(eq?'=':'<')+';'+sh(R)+';'+W.map(sh).join(';')+']', lines:[['|a + b| '+(eq?'=':'<')+' |a| + |b|','to hold']], ask:'For which pair does the line hold?', right:sh(R), opts:shuffle([R,...W]).map(sh), lead:'',
      why:'Triangle: |a + b| ≤ |a| + |b|, always. The two sides are the same when a and b have the same sign, and the left is smaller when the signs differ. Here |'+sg(R[0])+' + '+(R[1]<0?'('+sg(R[1])+')':R[1])+'| = '+Math.abs(R[0]+R[1])+' and |a| + |b| = '+(Math.abs(R[0])+Math.abs(R[1]))+'.'}; }});

/* ---------- 8i Roots, Powers and the Quadratic Formula ---------- */
const quad8=(b,c)=>'x²'+(b===0?'':(b<0?' − ':' + ')+(Math.abs(b)===1?'':Math.abs(b))+'x')+(c===0?'':pm(c))+' = 0';
const POW8=[[2,3,2],[3,3,2],[2,4,3],[2,2,3],[3,2,3],[2,5,2],[2,3,4],[5,2,1],[2,6,5],[10,3,2],[3,4,3],[4,2,3]];
QP.push({id:'8i.disc',step:'8i',mode:'work',label:'counting answers by the discriminant',open:()=>measured('8i'),make(){
    const b=rnd(13)-6, c=rnd(15)-5, D=b*b-4*c, line=quad8(b,c), right=D>0?'two':D===0?'one':'none on the line';
    return {index:'q:8i.disc['+line+']', lines:[[line,'the question']], ask:'How many answers has it on the line?', right, opts:['two','one','none on the line','endlessly many'], lead:'',
      why:'The discriminant b² − 4tc is '+(b*b)+' − 4 · 1 · '+(c<0?'('+sg(c)+')':c)+' = '+sg(D)+'. If it is positive there are two answers; if it is 0, one; if it is negative, none on the line: a square is never negative.'}; }},
  {id:'8i.solve',step:'8i',mode:'work',label:'the quadratic formula',open:()=>measured('8i'),make(){
    const r=rnd(13)-6, s=rnd(13)-6; if(r===s||r===-s||r===0||s===0) return null; const lo=Math.min(r,s), hi=Math.max(r,s), b=-(r+s), c=r*s, line=quad8(b,c), say=(x,y)=>'x = '+sg(Math.min(x,y))+' or x = '+sg(Math.max(x,y));
    const right=say(lo,hi), wrong=uniq(right,[say(-lo,-hi),say(lo,-hi),say(-lo,hi),say(b,c)],3); if(wrong.length<3) return null;
    return {index:'q:8i.solve['+line+']', lines:[[line,'the question']], ask:'Which reals answer it?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'x = (−b ± √(b² − 4tc))/(2t) = ('+sg(-b)+' ± √'+(b*b-4*c)+')/2 = ('+sg(-b)+' ± '+(hi-lo)+')/2. Check by sum and product: the answers add to '+sg(r+s)+' and multiply to '+sg(c)+'.'}; }},
  {id:'8i.complete',step:'8i',mode:'work',label:'completing the sameness',open:()=>measured('8i'),make(){
    const h=pick([-6,-5,-4,-3,-2,-1,1,2,3,4,5,6]), b=2*h, ex='x²'+(b<0?' − ':' + ')+Math.abs(b)+'x', f=(m,k)=>'(x'+pm(m)+')²'+pm(k), right=f(h,-h*h), wrong=uniq(right,[f(h,h*h),f(b,-b*b),f(-h,-h*h),f(b,-h*h)],3);
    return {index:'q:8i.complete['+ex+']', lines:[[ex,'to be completed']], ask:'Which line is the same, for every x?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'x² + bx = (x + b/2)² − (b/2)². Half of '+sg(b)+' is '+sg(h)+', and its square is '+(h*h)+'. Expand to check: (x'+pm(h)+')² = x²'+(b<0?' − ':' + ')+Math.abs(b)+'x + '+(h*h)+'.'}; }},
  {id:'8i.powers',step:'8i',mode:'work',label:'fractions in the high place',open:()=>measured('8i'),make(){
    const [base,q,p]=pick(POW8), u=base**q, neg=Math.random()<0.3, v=base**p, ex=u+'^('+(neg?'−':'')+p+'/'+q+')', right=neg?'1/'+v:String(v);
    const wrong=uniq(right,[neg?String(v):'1/'+v,String(Math.round(u*p/q)),neg?'−'+v:String(base**(p+1)),String(base),neg?'−1/'+v:String(u)],3); if(wrong.length<3) return null;
    return {index:'q:8i.powers['+ex+']', lines:[[ex,'to be worked']], ask:'Which real is it?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The bottom of the fraction takes a root and the top takes a power: the '+(q===2?'square':q===3?'cube':q+'th')+' root of '+u+' is '+base+', and '+base+' to the power '+p+' is '+v+'.'+(neg?' A negative in the high place is the reciprocal: 1/'+v+'.':'')}; }},
  {id:'8i.strangers',step:'8i',mode:'work',label:'check after squaring',open:()=>measured('8i'),make(){
    const b=1+rnd(4), m=2+rnd(3), x0=b+m, a=m*m-x0, x1=2*b+1-x0, line='√(x'+(a===0?'':pm(a))+') = x − '+b, lo=Math.min(x0,x1), hi=Math.max(x0,x1); if(x0===x1) return null;
    const right='x = '+sg(x0)+' only', opts=[right,'x = '+sg(x1)+' only','both','neither'];
    return {index:'q:8i.strangers['+line+']', lines:[[line,'the question'],['x = '+sg(lo)+' or x = '+sg(hi),'after squaring both sides, and solving']], ask:'Which of the two answers the question itself?', right, opts:shuffle(opts), lead:'',
      why:'Squaring adds strangers, so check every answer in the original. At x = '+sg(x0)+': √'+(x0+a)+' = '+m+' and '+x0+' − '+b+' = '+m+'. At x = '+sg(x1)+': √'+(x1+a)+' = '+(m-1)+', and '+sg(x1)+' − '+b+' = '+sg(x1-b)+', which is negative; a root is never negative.'}; }});

/* ---------- rung 8, Word Problems ---------- */
QP.push({id:'8h.reach',step:'8h',mode:'word',label:'a middle and a reach',open:()=>measured('8h'),make(){
    const [what,unit]=pick([['A gauge','degrees'],['The fill of a sack','kilos'],['The length of a cut plank','centimetres'],['A ferry’s crossing time','minutes'],['The level in a tank','litres']]), c=10+rnd(80), d=2+rnd(5), strict=Math.random()<0.4, op=strict?'<':'≤', opp=strict?'>':'≥';
    const right='|x − '+c+'| '+op+' '+d, wrong=['|x − '+d+'| '+op+' '+c,'|x + '+c+'| '+op+' '+d,'|x − '+c+'| '+opp+' '+d];
    return {index:'q:8h.reach['+c+';'+d+';'+op+']', a3:['8h.reach['+op+']',DASH,DASH], story:what+', x, must come '+(strict?'closer than '+d+' '+unit+' to ':'within '+d+' '+unit+' of ')+c+'.', lines:[], ask:'Which line says so?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'|x − '+c+'| is the distance from x to '+c+' on the line. '+(strict?'Closer than':'Within')+' '+d+' is “'+op+' '+d+'”. Unpacked, it is the stretch from '+(c-d)+' to '+(c+d)+', ends '+(strict?'left out.':'let in.')}; }},
  {id:'8g.story',step:'8g',mode:'word',label:'an inequality from a story',open:()=>measured('8g'),make(){
    const [thing,box]=pick([['sack','cart'],['crate','barge'],['bale','wagon'],['drum','lift']]), w=2+rnd(8), b=[1,2,3,4,5,6,7,8,9,10].filter(x=>x!==w)[rnd(9)], n=3+rnd(8), cap=b+w*n+rnd(w), most=Math.floor((cap-b)/w);
    if(Math.random()<0.5){ const right=b+' + '+w+'x ≤ '+cap, wrong=[b+' + '+w+'x < '+cap,w+' + '+b+'x ≤ '+cap,b+' + '+w+'x ≥ '+cap];
      return {index:'q:8g.story[line;'+w+';'+b+';'+cap+']', a3:['8g.story[line]',DASH,DASH], story:'A '+box+' carries at most '+cap+' kilos. A box of '+b+' kilos is on it already, and each '+thing+' weighs '+w+' kilos. x '+thing+'s are loaded.', lines:[], ask:'Which line must hold?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'The load is the box and x '+thing+'s: '+b+' + '+w+'x. “At most” lets the two sides be the same, so the mark is ≤.'}; }
    const right=String(most), wrong=uniq(right,[most+1,most-1,Math.floor(cap/w),Math.ceil((cap-b)/w)+1].map(String),3); if(wrong.length<3) return null;
    return {index:'q:8g.story[most;'+w+';'+b+';'+cap+']', a3:['8g.story[most]',DASH,DASH], story:'A '+box+' carries at most '+cap+' kilos. A box of '+b+' kilos is on it already, and each '+thing+' weighs '+w+' kilos.', lines:[[b+' + '+w+'x ≤ '+cap,'x counts the '+thing+'s']], ask:'What is the greatest number of '+thing+'s it can take?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Add −'+b+' to both sides: '+w+'x ≤ '+(cap-b)+'. Multiply by 1/'+w+', a positive, so the order is kept: x ≤ '+fshow(fr(cap-b,w))+'. The greatest number that fits is '+most+'.'}; }});

/* ===== Laundry 5, rung 9 (floor 2 pools, stage I): 9a to 9h, functions (9a.which and 9e.graph were there already) ===== */
Object.assign(STEPS,{'9b':['r09b','Composing, and Brackets Don’t Matter'],'9c':['r09c','One-to-One, Onto, Bijection'],'9d':['r09d','Running Backwards'],'9f':['r09f','Composing and Inverting by Hand'],'9g':['r09g','Polynomials and Rational Functions'],'9h':['r09h','Steps That Add, Steps That Multiply']});
/* a listed function from A to B, as its pairs */
const fn9=(A,B,kind)=>{ for(let t=0;t<200;t++){ const f={}; if(kind==='bij'){ const s=shuffle(B.slice()); A.forEach((a,i)=>f[a]=s[i]); } else A.forEach(a=>f[a]=pick(B));
    const one=new Set(A.map(a=>f[a])).size===A.length, onto=B.every(b=>A.some(a=>f[a]===b)); if(!kind||kind==='bij'||(kind==='one'&&one&&!onto)||(kind==='onto'&&onto&&!one)||(kind==='none'&&!one&&!onto)) return {f,one,onto}; } return null; };
const prs9=(A,f)=>'{'+A.map(a=>'('+a+', '+f[a]+')').join(', ')+'}', set9=s=>'{'+s.join(', ')+'}';
const lin9=(m,b)=>(m===1?'x':m===-1?'−x':sg(m)+'x')+(b===0?'':pm(b));

/* ---------- 9a A Function Is Its Pairs ---------- */
QP.push({id:'9a.range',step:'9a',mode:'work',label:'inputs and outputs',open:()=>measured('9a'),make(){
    const A=[1,2,3,4].slice(0,3+rnd(2)), B=[5,6,7,8,9].slice(0,3+rnd(3)), F=fn9(A,B), ran=[...new Set(A.map(a=>F.f[a]))].sort((x,y)=>x-y), dom=Math.random()<0.3;
    const right=set9(dom?A:ran), wrong=uniq(right,[set9(B),set9(dom?ran:A),set9(B.filter(b=>!ran.includes(b))),set9(ran.slice(1)),set9(A.concat(B))],3); if(wrong.length<3) return null;
    return {index:'q:9a.range['+(dom?'d':'r')+';'+prs9(A,F.f)+';'+B.length+']', lines:[['f = '+prs9(A,F.f),'f : A → B, with B = '+set9(B)]], ask:dom?'Which set is dom f?':'Which set is ran f?', right, opts:shuffle([right,...wrong]), lead:'',
      why:dom?'The pairs fix the inputs: dom f is the set of left entries, and that is A.':'ran f = {f(x) : x ∈ A}, the right entries that are used. It is a part of B, and need not be all of it.'}; }});

/* ---------- 9b Composing ---------- */
QP.push({id:'9b.compose',step:'9b',mode:'work',label:'one function after another',open:()=>measured('9b'),make(){
    for(let t=0;t<40;t++){ const A=[1,2,3], f=fn9(A,A).f, g=fn9(A,A).f, x=pick(A), gf=Math.random()<0.6, v=gf?g[f[x]]:f[g[x]], right=String(v), other=String(gf?f[g[x]]:g[f[x]]);
      const wrong=uniq(right,[other,String(f[x]),String(g[x]),String(x),...A.map(String)],3); if(wrong.length<2||other===right) continue;
      return {index:'q:9b.compose['+prs9(A,f)+';'+prs9(A,g)+';'+x+(gf?'gf':'fg')+']', lines:[['f = '+prs9(A,f),'from {1, 2, 3} to itself'],['g = '+prs9(A,g),null]], ask:'What is ('+(gf?'g ∘ f':'f ∘ g')+')('+x+')?', right, opts:shuffle([right,...wrong]), lead:'',
        why:gf?'(g ∘ f)(x) = g(f(x)): the inside function goes first. f('+x+') = '+f[x]+', and g('+f[x]+') = '+v+'.':'(f ∘ g)(x) = f(g(x)): the inside function goes first. g('+x+') = '+g[x]+', and f('+g[x]+') = '+v+'.'}; }
    return null; }},
  {id:'9b.order',step:'9b',mode:'work',label:'composing order matters',open:()=>measured('9b'),make(){
    const a=pick([-4,-3,-2,-1,1,2,3,4,5]), k=pick([-3,-2,2,3,4]), gf=Math.random()<0.5, right=gf?lin9(k,k*a):lin9(k,a), wrong=uniq(right,[gf?lin9(k,a):lin9(k,k*a),lin9(k+1,a),lin9(k,k+a),lin9(1,k*a)],3); if(wrong.length<3) return null;
    return {index:'q:9b.order['+a+';'+k+(gf?'gf':'fg')+']', lines:[['f(x) = '+lin9(1,a),'on ℝ'],['g(x) = '+lin9(k,0),'on ℝ']], ask:'What is ('+(gf?'g ∘ f':'f ∘ g')+')(x)?', right, opts:shuffle([right,...wrong]), lead:'',
      why:gf?'g(f(x)) = '+sg(k)+'(x'+pm(a)+') = '+right+'. The other order gives '+lin9(k,a)+': composing order matters.':'f(g(x)) = '+lin9(k,0)+pm(a)+'. The other order gives '+lin9(k,k*a)+': composing order matters.'}; }});

/* ---------- 9c One-to-One, Onto, Bijection ---------- */
const C9=[
  ['g ∘ f is one-to-one. What follows?','f is one-to-one',['g is one-to-one','both are one-to-one','f is onto'],'One-to-one-inside: if two inputs had one output under f, they would have one output under g ∘ f.'],
  ['g ∘ f is onto C. What follows?','g is onto C',['f is onto its codomain','both are onto','g is one-to-one'],'Onto-outside: every member of C is an output of g ∘ f, and so an output of g.'],
  ['g is one-to-one and g ∘ f = g ∘ h. What follows?','f = h: a one-to-one function cancels on the outside',['nothing','f and h are one-to-one','g is the identity'],'g(f(x)) = g(h(x)) at every x, and g is one-to-one, so f(x) = h(x) at every x.'],
  ['f is onto B and g ∘ f = h ∘ f. What follows?','g = h: an onto function cancels on the inside',['nothing','g and h are onto','f is the identity'],'Every member of B is f(x) for some x, and g and h agree there.'],
  ['What is a matching between X and Y, in this rung’s words?','a bijection from X to Y',['a one-to-one function from X to Y','a function onto Y','any set of pairs from X × Y'],'Matchings-are-bijections: one-to-one and onto.']];
QP.push({id:'9c.kind',step:'9c',label:'one-to-one, onto, or both',open:()=>measured('9c'),make(){
    const k=pick(['bij','one','onto','none']), A=[1,2,3,4].slice(0,k==='onto'?4:3), B=[5,6,7,8].slice(0,k==='one'?4:k==='onto'?3:3), F=fn9(A,B,k); if(!F) return null;
    const opts=['one-to-one, and not onto B','onto B, and not one-to-one','a bijection','neither one-to-one nor onto B'], right=opts[F.one&&F.onto?2:F.one?0:F.onto?1:3];
    const twice=A.find(a=>A.some(b=>b!==a&&F.f[a]===F.f[b])), miss=B.find(b=>!A.some(a=>F.f[a]===b));
    return {index:'q:9c.kind['+prs9(A,F.f)+';'+B.length+']', lines:[['f = '+prs9(A,F.f),'f : A → B, with B = '+set9(B)]], ask:'Which is f?', right, opts, lead:'',
      why:(F.one?'No output is used twice, so f is one-to-one.':'The output '+F.f[twice]+' is used twice, so f is not one-to-one.')+' '+(F.onto?'Every member of B is an output, so f is onto B.':miss+' is no output, so f is not onto B.')}; }},
  {id:'9c.compose',step:'9c',label:'what composing keeps',open:()=>measured('9c'),make(){ return writtenQ('9c.compose',C9); }});

/* ---------- 9d Running Backwards ---------- */
QP.push({id:'9d.back',step:'9d',mode:'work',label:'swapped pairs',open:()=>measured('9d'),make(){
    const k=pick(['bij','bij','one','onto']), A=[1,2,3,4].slice(0,k==='onto'?4:3), B=[5,6,7,8].slice(0,k==='one'?4:3), F=fn9(A,B,k); if(!F) return null;
    if(k==='bij'){ const y=pick(B), x=A.find(a=>F.f[a]===y), right=String(x), wrong=uniq(right,A.map(String).concat([String(y)]),3);
      return {index:'q:9d.back[v;'+prs9(A,F.f)+';'+y+']', lines:[['f = '+prs9(A,F.f),'a bijection from '+set9(A)+' to '+set9(B)]], ask:'What is f⁻¹('+y+')?', right, opts:shuffle([right,...wrong]), lead:'', why:'Swapped-pairs: (x, y) ∈ f exactly when (y, x) ∈ f⁻¹. ('+x+', '+y+') ∈ f, so f⁻¹('+y+') = '+x+'.'}; }
    const opts=['yes: f is a bijection','no: f is not one-to-one, so some input of f⁻¹ would have two outputs','no: f is not onto B, so some member of B would have no output','no: f⁻¹ is not a set of pairs'], right=opts[k==='one'?2:1];
    return {index:'q:9d.back[is;'+prs9(A,F.f)+']', lines:[['f = '+prs9(A,F.f),'f : A → B, with B = '+set9(B)]], ask:'Is f⁻¹, the swapped pairs, a function from B to A?', right, opts, lead:'',
      why:'Swapped-pairs-function: f⁻¹ : B → A exactly when f is one-to-one and onto B. The swapped pairs are always a set of pairs; whether they make a function is the question.'}; }},
  {id:'9d.undo',step:'9d',mode:'work',label:'inverting by hand',open:()=>measured('9d'),make(){
    const m=pick([-4,-3,-2,2,3,4,5]), b=pick([-6,-5,-4,-3,-2,-1,1,2,3,4,5,6]), inv=(mm,bb)=>'(x'+pm(bb)+')/'+(mm<0?'('+sg(mm)+')':mm), right=inv(m,-b), wrong=uniq(right,[inv(m,b),lin9(m,-b),'x/'+(m<0?'('+sg(m)+')':m)+pm(-b),lin9(-m,-b)],3);
    return {index:'q:9d.undo['+m+';'+b+']', lines:[['f(x) = '+lin9(m,b),'a bijection from ℝ to ℝ']], ask:'What is f⁻¹(x)?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'f multiplies by '+sg(m)+' and then adds '+sg(b)+'. Running backwards undoes the last step first: add '+sg(-b)+', then divide by '+sg(m)+'. That is socks-and-shoes: (g ∘ f)⁻¹ = f⁻¹ ∘ g⁻¹.'}; }});

/* ---------- 9e Reading and Drawing Graphs ---------- */
const EO9=[['x²',0],['x⁴',0],['x⁶',0],['x² + 1',0],['|x|',0],['x⁴ − x²',0],['x³',1],['x⁵',1],['x',1],['x³ + x',1],['x⁵ − x',1],['x² + x',2],['x + 1',2],['x³ + 1',2],['x² − x',2]];
QP.push({id:'9e.line',step:'9e',mode:'work',label:'two points, one line',open:()=>measured('9e'),make(){
    for(let t=0;t<40;t++){ const x1=rnd(9)-4, x2=x1+1+rnd(4), y1=rnd(13)-6, y2=rnd(13)-6, m=fr(y2-y1,x2-x1), st=fsub(fint(y1),fmul(m,fint(x1))), step=Math.random()<0.6;
      const right=fshow(step?m:st), wrong=uniq(right,[fshow(step?fr(x2-x1,(y2-y1)||1):fint(y1)),fshow(fneg(step?m:st)),fshow(step?fr(y2+y1,x2-x1):fadd(fint(y1),fmul(m,fint(x1)))),fshow(step?fint(y2-y1):fint(y2)),fshow(fadd(step?m:st,fint(1)))],3); if(wrong.length<3) continue;
      return {index:'q:9e.line['+x1+','+y1+';'+x2+','+y2+';'+(step?'m':'b')+']', lines:[['('+sg(x1)+', '+sg(y1)+') and ('+sg(x2)+', '+sg(y2)+')','two pairs of one linear function f(x) = mx + b']], ask:step?'What is the step m?':'What is the start b?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'Two-points-one-line: m = (y₂ − y₁)/(x₂ − x₁) = '+sg(y2-y1)+'/'+(x2-x1)+' = '+fshow(m)+', and the start is y₁ − mx₁ = '+fshow(st)+'.'}; }
    return null; }},
  {id:'9e.even',step:'9e',label:'even and odd functions',open:()=>measured('9e'),make(){
    const k=rnd(3), R=pick(EO9.filter(e=>e[1]===k)), wrong=take(EO9.filter(e=>e[1]!==k),3), ask=['Which is an even function: f(−x) = f(x) for every x?','Which is an odd function: f(−x) = −f(x) for every x?','Which is neither an even nor an odd function?'][k];
    return {index:'q:9e.even['+k+';'+R[0]+';'+wrong.map(w=>w[0]).join(';')+']', lines:[], ask, right:'x ↦ '+R[0], opts:shuffle([R,...wrong]).map(e=>'x ↦ '+e[0]), lead:'It is x ↦ '+R[0]+'. ',
      why:'x ↦ xⁿ is an even function when n is even and an odd function when n is odd. A sum of even powers is even, a sum of odd powers is odd, and a mix of the two is neither: try x = 1 and x = −1.'}; }});

/* ---------- 9f Composing and Inverting by Hand ---------- */
QP.push({id:'9f.domain',step:'9f',mode:'work',label:'the natural domain',open:()=>measured('9f'),make(){
    const a=rnd(13)-6, k=rnd(4), xa='x'+(a===0?'':pm(-a)), ax=sg(a)+' − x';
    const [ex,right,why]=k===0?['√('+xa+')','x ≥ '+sg(a),'A root takes only what is not negative: '+xa+' ≥ 0.']:k===1?['1/('+xa+')','x ≠ '+sg(a),'A reciprocal takes everything but 0: '+xa+' ≠ 0.']
      :k===2?['1/√('+xa+')','x > '+sg(a),'The root needs '+xa+' ≥ 0, and the reciprocal needs the root not to be 0. Together: '+xa+' > 0.']:['√('+ax+')','x ≤ '+sg(a),'A root takes only what is not negative: '+ax+' ≥ 0, so x ≤ '+sg(a)+'.'];
    const all=['x ≥ '+sg(a),'x ≠ '+sg(a),'x > '+sg(a),'x ≤ '+sg(a),'every real x'];
    return {index:'q:9f.domain['+ex+']', lines:[['x ↦ '+ex,'a formula with no domain stated']], ask:'What is its natural domain?', right, opts:shuffle([right,...take(all.filter(o=>o!==right),3)]), lead:'',
      why:'The natural domain of x ↦ g(f(x)) is {x ∈ dom f : f(x) ∈ dom g}: the inside must give something the outside can take. '+why}; }});

/* ---------- 9g Polynomials and Rational Functions ---------- */
const poly9=cs=>{ const n=cs.length-1; return cs.map((c,i)=>{ const d=n-i; if(c===0) return ''; const a=Math.abs(c), body=(d===0?String(a):(a===1?'':a)+'x'+(d===1?'':['','','²','³','⁴'][d])); return (i===0?(c<0?'−':''):(c<0?' − ':' + '))+body; }).join(''); };
const ev9=(cs,x)=>cs.reduce((s,c)=>s*x+c,0);
QP.push({id:'9g.remainder',step:'9g',mode:'work',label:'dividing by x − r',open:()=>measured('9g'),make(){
    const cs=[pick([1,1,2,-1]),rnd(9)-4,rnd(9)-4,rnd(11)-5], r=pick([-2,-1,1,2,3]), v=ev9(cs,r), right=sg(v), wrong=uniq(right,[ev9(cs,-r),cs[3],v+1,ev9(cs,r+1),-v,v-r].map(sg),3); if(wrong.length<3) return null;
    return {index:'q:9g.remainder['+poly9(cs)+';'+r+']', lines:[['p(x) = '+poly9(cs),'a polynomial'],['d(x) = x'+pm(-r),'the divisor']], ask:'What is the remainder when p is divided by d?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'p(x) = (x'+pm(-r)+')q(x) + r, with the remainder a constant. Put x = '+sg(r)+': the first part is 0, so the remainder is p('+sg(r)+') = '+right+'.'+(v===0?' So '+sg(r)+' is a zero of p, and x'+pm(-r)+' is a factor.':'')}; }},
  {id:'9g.zeros',step:'9g',mode:'work',label:'zeros and factors',open:()=>measured('9g'),make(){
    if(Math.random()<0.5){ const zs=take([-4,-3,-2,-1,1,2,3,4,5],3).sort((a,b)=>a-b), fac=z=>'(x'+pm(-z)+')', right=set9(zs.map(sg)), wrong=uniq(right,[set9(zs.map(z=>-z).sort((a,b)=>a-b).map(sg)),set9(zs.slice(0,2).map(sg)),set9([zs[0],zs[1],-zs[2]].sort((a,b)=>a-b).map(sg)),set9(zs.map(z=>z+1).map(sg))],3); if(wrong.length<3) return null;
      return {index:'q:9g.zeros[f;'+zs.join(',')+']', lines:[['p(x) = '+zs.map(fac).join(''),'a polynomial of degree 3']], ask:'Which is its set of zeros?', right, opts:shuffle([right,...wrong]), lead:'', why:'Factor technique: r is a zero of p exactly when x − r is a factor. A product is 0 exactly when a factor is, and a polynomial of degree 3 has at most 3 zeros.'}; }
    const un=pick([2,3,4,6]), u0=pick([1,2,3,5,6]), dv=n=>[1,2,3,4,5,6].filter(d=>n%d===0), ok=f=>dv(u0).includes(Math.abs(f.p))&&dv(un).includes(f.q), C=[]; for(let p=1;p<=6;p++) for(let q=1;q<=6;q++){ const f=fr(pick([1,-1])*p,q); if(!C.some(c=>fsame(c,f))) C.push(f); }
    const bad=shuffle(C.filter(f=>!ok(f))), good=shuffle(C.filter(ok)); if(!bad.length||good.length<3) return null; const right=fshow(bad[0]);
    return {index:'q:9g.zeros[q;'+un+';'+u0+';'+right+']', lines:[['p(x) = '+un+'x³ + ⋯ + '+u0,'integer coefficients; only the first and the last are shown']], ask:'Which fraction cannot be a zero of p?', right, opts:shuffle([right,...good.slice(0,3).map(fshow)]), lead:'',
      why:'Fraction-zeros: if p/q in lowest terms is a zero, then p divides the last coefficient, '+u0+', and q divides the leading one, '+un+'. '+right+' fails that test. The others pass it, which makes them candidates only.'}; }});

/* ---------- 9h Steps That Add, Steps That Multiply ---------- */
QP.push({id:'9h.steps',step:'9h',mode:'work',label:'steps that add, steps that multiply',open:()=>measured('9h'),make(){
    const k=rnd(3), f0=1+rnd(6), n=3+rnd(4);
    if(k===0){ const d=pick([-3,-2,2,3,4,5]), v=f0+n*d, right=sg(v), wrong=uniq(right,[f0+(n-1)*d,f0+(n+1)*d,f0*n+d,n*d,f0+n+d].map(sg),3);
      return {index:'q:9h.steps[+;'+f0+';'+d+';'+n+']', lines:[['f(0) = '+f0,'the start'],['f(n + 1) = f(n)'+pm(d),'for every n']], ask:'What is f('+n+')?', right, opts:shuffle([right,...wrong]), lead:'', why:'Steps-that-add: f(n) = f(0) + nd = '+f0+' + '+n+' · '+(d<0?'('+sg(d)+')':d)+' = '+right+'.'}; }
    if(k===1){ const b=pick([2,3,2,10]), nn=Math.min(n,b===10?4:5), v=f0*b**nn, right=String(v), wrong=uniq(right,[f0*b**(nn-1),f0*b**(nn+1),f0+nn*b,f0*b*nn,(f0*b)**2].map(String),3);
      return {index:'q:9h.steps[×;'+f0+';'+b+';'+nn+']', lines:[['f(0) = '+f0,'the start'],['f(n + 1) = '+b+' · f(n)','for every n']], ask:'What is f('+nn+')?', right, opts:shuffle([right,...wrong]), lead:'', why:'Steps-that-multiply: f(n) = f(0)bⁿ = '+f0+' · '+Array(nn).fill(b).join(' · ')+' = '+right+'.'}; }
    const b=pick([2,3,4,5]), nn=3+rnd(3), v=(b**nn-1)/(b-1), ex=Array.from({length:nn},(_,i)=>i===0?'1':i===1?String(b):b+['','','²','³','⁴','⁵'][i]).join(' + '), right=String(v), wrong=uniq(right,[b**nn-1,b**nn,v+b**nn,(b**(nn-1)-1)/(b-1),v-1].map(String),3);
    return {index:'q:9h.steps[Σ;'+b+';'+nn+']', lines:[[ex,'a sum of '+nn+' terms']], ask:'What does the sum come to?', right, opts:shuffle([right,...wrong]), lead:'', why:'Ratio-sum: 1 + b + ⋯ + bⁿ⁻¹ = (bⁿ − 1)/(b − 1) = ('+(b**nn)+' − 1)/'+(b-1)+' = '+right+'.'}; }},
  {id:'9h.story',step:'9h',mode:'word',label:'adding or multiplying',open:()=>measured('9h'),make(){
    const add=Math.random()<0.5, f0=pick([20,40,50,100,200]), n=3+rnd(3);
    if(add){ const d=pick([5,10,15,20,25]), [story,unit]=pick([['A tank holds '+f0+' litres, and '+d+' litres are poured in every hour.','litres'],['A stack has '+f0+' crates, and '+d+' more are added every day.','crates'],['A jar holds '+f0+' coins, and '+d+' coins go in every week.','coins']]);
      const right=String(f0+n*d), wrong=uniq(right,[f0*d*n,f0+(n-1)*d,f0+d,(f0+d)*n,f0+n*d+d].map(String),3);
      return {index:'q:9h.story[+;'+f0+';'+d+';'+n+';'+unit+']', a3:['9h.story[+]',DASH,DASH], story, lines:[], ask:'How many '+unit+' after '+n+' such steps?', right, opts:shuffle([right,...wrong]), lead:'', why:'Each step adds the same amount, so these are steps that add: f(n) = f(0) + nd = '+f0+' + '+n+' · '+d+' = '+right+'.'}; }
    const b=pick([2,3]), [story,unit]=pick([['A culture holds '+f0+' cells, and the count '+(b===2?'doubles':'triples')+' every hour.','cells'],['A rumour is known to '+f0+' people, and the count '+(b===2?'doubles':'triples')+' every day.','people'],['A pond has '+f0+' lily pads, and the count '+(b===2?'doubles':'triples')+' every week.','lily pads']]);
    const right=String(f0*b**n), wrong=uniq(right,[f0+n*b,f0*b*n,f0*b**(n-1),f0*b**(n+1),f0*n].map(String),3);
    return {index:'q:9h.story[×;'+f0+';'+b+';'+n+';'+unit+']', a3:['9h.story[×]',DASH,DASH], story, lines:[], ask:'How many '+unit+' after '+n+' such steps?', right, opts:shuffle([right,...wrong]), lead:'', why:'Each step multiplies by the same number, so these are steps that multiply: f(n) = f(0)bⁿ = '+f0+' · '+Array(n).fill(b).join(' · ')+' = '+right+'.'}; }});

/* ---------- rung 9, Check Proofs ---------- */
QP.push({id:'9d.there',step:'9d',mode:'proof',label:'there and back',open:()=>measured('9d'),make(){
    const m=pick([-4,-3,-2,2,3,4,5]), b=pick([-6,-5,-4,-3,-2,-1,1,2,3,4,5,6]), inv=(mm,bb)=>'(x'+pm(bb)+')/'+(mm<0?'('+sg(mm)+')':mm);
    const H=[[inv(m,-b),x=>(x-b)/m],[inv(m,b),x=>(x+b)/m],['x/'+(m<0?'('+sg(m)+')':m)+pm(-b),x=>x/m-b],[inv(m,-b),x=>(x-b)/m],[lin9(m,-b),x=>m*x-b]], [hs,h]=pick(H), ok=[0,1,2,5].every(x=>Math.abs(h(m*x+b)-x)<1e-9), opts=['it holds for every x: h runs f backwards','it does not hold: h is not f⁻¹'];
    return {index:'q:9d.there['+m+';'+b+';'+hs+']', stack:true, lines:[['f(x) = '+lin9(m,b),'given, on ℝ'],['h(x) = '+hs,'offered as f⁻¹'],['h(f(x)) = x','there-and-back, on lines 1 and 2']], ask:'Does line 3 hold?', right:opts[ok?0:1], opts, lead:'',
      why:'There-and-back: f⁻¹(f(x)) = x for every x. Try x = 1: f(1) = '+sg(m+b)+', and h('+sg(m+b)+') = '+fshow(fr(Math.round(h(m+b)*m*m),m*m))+'. '+(ok?'Running backwards undoes the last step first: add '+sg(-b)+', then divide by '+sg(m)+'.':'The inverse undoes the last step first: add '+sg(-b)+', then divide by '+sg(m)+', which is '+inv(m,-b)+'.')}; }});

/* ===== Laundry 5, rungs 10 and 11 (floor 2 pools, stage J): limits and continuity ===== */
Object.assign(STEPS,{'10a':['r10a','The Challenge and the Answer'],'10b':['r10b','A Function Can’t Head Two Ways'],'10c':['r10c','Limits Add, Multiply and Divide'],'10d':['r10d','The Squeeze'],'10e':['r10e','From the Left and From the Right'],'10f':['r10f','Computing Limits'],'10g':['r10g','Playing the Challenge Game'],
  '11a':['r11a','Continuity'],'11b':['r11b','Sums and Products'],'11c':['r11c','Continuous After Continuous'],'11d':['r11d','Every Polynomial Is Continuous'],'11e':['r11e','A Joint Doesn’t Break Continuity'],'11f':['r11f','Finding the Breaks']});
const NOLIM='it heads to no real', par10=n=>n<0?'('+sg(n)+')':String(n);

/* ---------- 10a The Challenge and the Answer ---------- */
QP.push({id:'10a.reach',step:'10a',mode:'work',label:'a reach for every challenge',open:()=>measured('10a'),make(){
    const m=pick([-5,-4,-3,-2,2,3,4,5,10]), b=rnd(11)-5, w=rnd(7)-3, e=pick([fr(1,2),fr(1,10),fr(1,100),fr(3,10),fr(1,5),fr(1,4)]), d=fmul(e,fr(1,Math.abs(m))), right=fshow(d);
    const wrong=uniq(right,[fshow(e),fshow(fmul(e,fint(Math.abs(m)))),fshow(fmul(d,fint(2))),fshow(fadd(e,fint(Math.abs(m)))),fshow(fr(1,Math.abs(m)))],3); if(wrong.length<3) return null;
    return {index:'q:10a.reach['+m+';'+b+';'+w+';'+fshow(e)+']', lines:[['f(x) = '+lin9(m,b),'heading to '+sg(m*w+b)+' as x → '+sg(w)],['ε = '+fshow(e),'the challenge']], ask:'Which is the greatest reach δ that answers the challenge?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'|f(x) − '+par10(m*w+b)+'| = '+Math.abs(m)+' · |x − '+par10(w)+'|. That is below ε exactly when |x − '+par10(w)+'| is below ε/'+Math.abs(m)+' = '+right+'. Any smaller reach answers too; none greater does.'}; }},
  {id:'10a.heads',step:'10a',mode:'work',label:'where it heads',open:()=>measured('10a'),make(){
    const k=rnd(3), w=pick([-4,-3,-2,-1,1,2,3,4,5]), m=pick([-3,-2,2,3,4]), b=rnd(9)-4;
    const [ex,v,alts,why]=k===0?[lin9(m,b),fint(m*w+b),[fint(m*w),fint(m+w+b),fint(b),fint(m*w-b)],'Line-limit: mx + b heads to mw + b.']:k===1?['x²',fint(w*w),[fint(2*w),fint(w),fint(-w*w),fint(w*w+1)],'Square-limit: x² heads to w².']:['1/x',fr(1,w),[fint(w),fr(-1,w),fint(0),fr(1,w+1===0?2:w+1)],'One-over-x-limit: for w ≠ 0, 1/x heads to 1/w.'];
    const right=fshow(v), wrong=uniq(right,alts.map(fshow),3); if(wrong.length<3) return null;
    return {index:'q:10a.heads['+ex+';'+w+']', lines:[['f(x) = '+ex,'as x → '+sg(w)]], ask:'To which real does f(x) head?', right, opts:shuffle([right,...wrong]), lead:'', why:why+' Here that is '+right+'.'}; }});

/* ---------- 10b A Function Can't Head Two Ways ---------- */
const B10=[
  ['f heads to L at w, and f heads to M at w. What follows?','L = M: a function has at most one limit at a place',['nothing','L < M','f is a constant'],'One-limit. If L ≠ M, take ε with 2ε ≤ |L − M|: no output is within ε of both.'],
  ['f(x) < g(x) near w, f heads to L and g heads to M. What follows?','L ≤ M, and L = M may happen',['L < M','L = M','nothing'],'Limits keep order, as ≤. A strict order between the functions may close up at the limit: x² and 2x² at 0.'],
  ['f heads to L at w, and L > 0. What follows near w?','f(x) > L/2 > 0 in some neighbourhood of w',['f(x) = L in some neighbourhood of w','f(x) > L in some neighbourhood of w','nothing about f near w'],'Sign-kept-near: answer the challenge ε = L/2.'],
  ['Does the value f(w) matter to the limit of f at w?','no: the limit looks only at inputs near w and other than w',['yes: the limit is f(w)','yes: f must be defined at w','only when f(w) = 0'],'Agreeing-near: functions that agree near w, whatever they do at w, have the same limit there.']];
QP.push({id:'10b.one',step:'10b',label:'one limit, and order kept',open:()=>measured('10b'),make(){ return writtenQ('10b.one',B10); }});

/* ---------- 10c Limits Add, Multiply and Divide ---------- */
QP.push({id:'10c.rules',step:'10c',mode:'work',label:'limits add, multiply and divide',open:()=>measured('10c'),make(){
    const L=pick([-6,-4,-3,-2,2,3,4,6,8]), k=rnd(6), M=k===2&&Math.random()<0.3?0:pick([-4,-2,-1,1,2,3,5]), c=pick([-3,-2,2,3,5]), na='the technique does not apply: the bottom heads to 0';
    const [ex,right,alts,name]=k===0?['f(x) + g(x)',sg(L+M),[L*M,L-M,L,M],'Limits-add']:k===1?['f(x) · g(x)',sg(L*M),[L+M,L-M,L,-L*M],'Limits-multiply']
      :k===2?['f(x)/g(x)',M===0?na:fshow(fr(L,M)),M===0?[0,L,1]:[L*M,L-M,L+M],'Limits-divide, which asks that the bottom’s limit is not 0']:k===3?[c+' · f(x)'.replace(/^-/,'−'),sg(c*L),[c+L,L,c,-c*L],'Constant-factor']
      :k===4?['f(x) − g(x)',sg(L-M),[L+M,M-L,L*M,L],'Limits-subtract']:['f(x) · f(x) · f(x)',sg(L*L*L),[3*L,L*L,L,-L*L*L],'Power-limit'];
    const wrong=uniq(right,alts.map(a=>typeof a==='number'?sg(a):a).concat(k===2&&M!==0?[na]:[]).reverse(),3); if(wrong.length<3) return null;
    return {index:'q:10c.rules['+k+';'+L+';'+M+';'+c+']', lines:[['f heads to '+sg(L)+', and g heads to '+sg(M),'both as x → w'],[ex.replace(/^-/,'−'),'as x → w']], ask:'To which real does it head?', right, opts:shuffle([right,...wrong]), lead:'',
      why:name+'. '+(k===2&&M===0?'With the bottom heading to 0 the quotient may head anywhere or nowhere; another road is needed, such as factoring.':'The limit of the combination is the combination of the limits.')}; }},
  {id:'10c.subst',step:'10c',mode:'work',label:'substitution',open:()=>measured('10c'),make(){
    const cs=[pick([1,2,-1]),rnd(7)-3,rnd(9)-4], w=pick([-3,-2,-1,1,2,3]), rat=Math.random()<0.4, a=pick([-4,-3,-2,2,3,4].filter(z=>z!==w)), top=ev9(cs,w), v=rat?fr(top,w-a):fint(top);
    const ex=rat?'('+poly9(cs)+')/(x'+pm(-a)+')':poly9(cs), right=fshow(v), wrong=uniq(right,[fshow(fint(ev9(cs,-w))),fshow(fint(cs[2])),fshow(fadd(v,fint(1))),fshow(fneg(v)),fshow(rat?fint(top):fint(ev9(cs,w+1)))],3); if(wrong.length<3) return null;
    return {index:'q:10c.subst['+ex+';'+w+']', lines:[['f(x) = '+ex,'as x → '+sg(w)]], ask:'To which real does f(x) head?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Substitution: a polynomial heads to its value at w'+(rat?', and a rational function does too when the bottom is not 0 there. The top is '+sg(top)+' and the bottom is '+sg(w-a)+'.':': p('+sg(w)+') = '+right+'.')}; }});

/* ---------- 10d The Squeeze ---------- */
QP.push({id:'10d.squeeze',step:'10d',label:'the squeeze',open:()=>measured('10d'),make(){
    const a=rnd(11)-5, same=Math.random()<0.6, b=same?a:a+1+rnd(4), k=rnd(2);
    if(k===0){ const right=same?'f heads to '+sg(a)+' too':'nothing yet: the limit of f, if it has one, is from '+sg(a)+' to '+sg(b), wrong=same?['nothing: f may head anywhere','f heads to '+sg(a+1),'f has no limit at w']:['f heads to '+sg(a),'f heads to '+sg(b),'f has no limit at w'];
      return {index:'q:10d.squeeze[s;'+a+';'+b+']', lines:[['g(x) ≤ f(x) ≤ h(x)','in a neighbourhood of w'],['g heads to '+sg(a)+', and h heads to '+sg(b),'as x → w']], ask:'What does that settle about f at w?', right, opts:shuffle([right,...wrong]), lead:'',
        why:same?'The squeeze: caught between two functions that head to one real, f has nowhere else to go.':'The squeeze needs both sides to head to the same real. Here limits-keep-order gives only bounds, and f may still head nowhere.'}; }
    const n=2+rnd(3), right='0', P=['','','x²','x³','x⁴'][n];
    return {index:'q:10d.squeeze[z;'+n+';'+a+']', lines:[['|f(x)| ≤ '+P.replace('x','|x|'),'in a neighbourhood of 0']], ask:'To which real does f(x) head as x → 0?', right, opts:shuffle(['0','1',NOLIM,'it cannot be told from this']), lead:'',
      why:'Squeezed-to-0: |f(x)| is at most a function that heads to 0, so f heads to 0. Nothing more about f is needed, not even a formula.'}; }});

/* ---------- 10e From the Left and From the Right ---------- */
QP.push({id:'10e.sides',step:'10e',mode:'work',label:'two sides',open:()=>measured('10e'),make(){
    for(let t=0;t<40;t++){ const w=rnd(7)-3, m1=pick([-2,-1,1,2,3]), b1=rnd(9)-4, m2=pick([-2,-1,1,2,3]), agree=Math.random()<0.4, lv=m1*w+b1, b2=agree?lv-m2*w:rnd(9)-4, rv=m2*w+b2, k=rnd(3); if(!agree&&lv===rv) continue; if(m1===m2&&b1===b2) continue;
      const ask=['To which real does f(x) head as x → '+sg(w)+' from the left?','To which real does f(x) head as x → '+sg(w)+' from the right?','To which real does f(x) head as x → '+sg(w)+'?'][k], right=k===0?sg(lv):k===1?sg(rv):lv===rv?sg(lv):NOLIM;
      const wrong=uniq(right,[sg(k===0?rv:lv),sg(k===2?rv:lv+rv),NOLIM,sg(lv+1),sg(rv-1),sg(b1)],3); if(wrong.length<3) continue;
      return {index:'q:10e.sides['+w+';'+m1+';'+b1+';'+m2+';'+b2+';'+k+']', lines:[['f(x) = '+lin9(m1,b1),'for x < '+sg(w)],['f(x) = '+lin9(m2,b2),'for x > '+sg(w)]], ask, right, opts:shuffle([right,...wrong]), lead:'',
        why:'From the left f is '+lin9(m1,b1)+', heading to '+sg(lv)+'. From the right it is '+lin9(m2,b2)+', heading to '+sg(rv)+'. '+(lv===rv?'Two-sides-agree: the limit is '+sg(lv)+'.':'Two-sides-differ: f has no limit at '+sg(w)+'.')}; }
    return null; }});

/* ---------- 10f Computing Limits ---------- */
QP.push({id:'10f.compute',step:'10f',mode:'work',label:'computing limits',open:()=>measured('10f'),make(){
    const k=rnd(4);
    if(k===0){ const a=pick([-5,-4,-3,-2,-1,1,2,3,4,5]), right=sg(2*a), ex='(x² − '+(a*a)+')/(x'+pm(-a)+')';
      return {index:'q:10f.compute[r;'+a+']', lines:[['f(x) = '+ex,'as x → '+sg(a)+'; f is not defined at '+sg(a)]], ask:'To which real does f(x) head?', right, opts:shuffle([right,...uniq(right,[sg(a),'0',NOLIM,sg(a*a),sg(-2*a)],3)]), lead:'',
        why:'Substitution gives 0/0, so factor: x² − '+(a*a)+' = (x'+pm(-a)+')(x'+pm(a)+'). Near '+sg(a)+', and not at it, f agrees with x'+pm(a)+', and agreeing-near gives the limit '+right+'.'}; }
    if(k===1){ const n=1+rnd(3), m=1+rnd(3), an=pick([-3,-2,1,2,3,4,6]), bm=pick([1,2,3,4,5]), P=d=>['','x','x²','x³'][d], top=(Math.abs(an)===1?(an<0?'−':''):sg(an))+P(n)+' + 1', bot=(bm===1?'':bm)+P(m)+' − 7';
      const right=n===m?fshow(fr(an,bm)):n<m?'0':NOLIM, wrong=uniq(right,['0',NOLIM,fshow(fr(an,bm)),'1',fshow(fr(bm,an)),fshow(fr(-1,7))],3);
      return {index:'q:10f.compute[far;'+top+';'+bot+']', lines:[['f(x) = ('+top+')/('+bot+')','as x → ∞']], ask:'To which real does f(x) head, far out?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'Rational-functions-far-out: compare the degrees. '+(n===m?'They are the same, so the limit is the ratio of the leading coefficients, '+right+'.':n<m?'The bottom’s is greater, so the limit is 0.':'The top’s is greater, so f passes every bound and has no limit.')}; }
    if(k===2){ const r=1+rnd(6), w=rnd(9)-4, c=r*r-w, right=String(r);
      return {index:'q:10f.compute[root;'+w+';'+c+']', lines:[['f(x) = √(x'+(c===0?'':pm(c))+')','as x → '+sg(w)]], ask:'To which real does f(x) head?', right, opts:shuffle([right,...uniq(right,[String(r*r),sg(-r),String(r+1),NOLIM,'0'],3)]), lead:'',
        why:'Root-limit: for w + c > 0, √(x + c) heads to √(w + c) = √'+(r*r)+' = '+r+'.'}; }
    const side=pick(['the right','the left']), a=rnd(7)-3;
    return {index:'q:10f.compute[inf;'+a+';'+side+']', lines:[['f(x) = 1/(x'+(a===0?'':pm(-a))+')','as x → '+sg(a)+' from '+side]], ask:'To which real does f(x) head?', right:NOLIM, opts:shuffle([NOLIM,...uniq(NOLIM,['0','1',sg(a),'−1',sg(a+2)],3)]), lead:'',
      why:'Near '+sg(a)+' the bottom is as small as you like, so f passes '+(side==='the right'?'every bound':'below every bound')+'. Passing-every-bound: f has no limit from '+side+' at '+sg(a)+'.'}; }});

/* ---------- 10g Playing the Challenge Game ---------- */
const G10=[
  ['In the challenge game for “f heads to L at w”, who moves first, and with what?','the challenger, with a positive ε; the answer is a reach δ',['the answerer, with a reach δ; the challenge is an ε','the challenger, with an input x','the answerer, with the limit L'],'∀ε > 0 ∃δ > 0: the reach may depend on the challenge, so the challenge comes first.'],
  ['Which line says that f does not head to L at z?','∃ε > 0 ∀δ > 0 ∃x (0 < |x − z| < δ ∧ ε ≤ |f(x) − L|)',['∀ε > 0 ∃δ > 0 ∃x (0 < |x − z| < δ ∧ ε ≤ |f(x) − L|)','∃ε > 0 ∃δ > 0 ∀x (0 < |x − z| < δ ⇒ ε ≤ |f(x) − L|)','∀ε > 0 ∀δ > 0 ∀x (0 < |x − z| < δ ⇒ |f(x) − L| < ε)'],'Not-heading-to: push the not through, and each ∀ turns to ∃ and each ∃ to ∀. One challenge that no reach answers is enough.'],
  ['To show f does not head to L at z, what must be produced?','one ε, and for every δ an input within δ of z whose output is at least ε from L',['one δ, and for every ε an input that fails','an input x with f(x) ≠ L','every ε, each with a reach that fails'],'The roles turn about: you pick the challenge, and must beat every reach.'],
  ['A reach δ answers the challenge ε. Does a smaller reach answer it too?','yes: fewer inputs are let in, and each of them still passes',['no: the reach must be exact','only when f is a line','only when ε is made smaller too'],'That is why the lesser of two reaches serves two demands at once.']];
QP.push({id:'10g.game',step:'10g',label:'the challenge game',open:()=>measured('10g'),make(){ return writtenQ('10g.game',G10); }});

/* ---------- 11a Continuity, 11e joints, 11f breaks ---------- */
QP.push({id:'11a.at',step:'11a',label:'continuous at a place',open:()=>measured('11a'),make(){
    for(let t=0;t<40;t++){ const w=rnd(7)-3, m1=pick([-2,-1,1,2,3]), b1=rnd(9)-4, m2=pick([-2,-1,1,2,3]), kind=rnd(3), lv=m1*w+b1, b2=kind===2?rnd(9)-4:lv-m2*w, rv=m2*w+b2, fw=kind===0?lv:kind===1?lv+pick([-2,-1,1,2]):lv; if(kind===2&&lv===rv) continue;
      const opts=['yes: both sides head to f('+sg(w)+')','no: the sides agree, and f('+sg(w)+') is somewhere else','no: the two sides head to different reals','no: f is not defined at '+sg(w)], right=opts[kind];
      return {index:'q:11a.at['+w+';'+m1+';'+b1+';'+m2+';'+b2+';'+fw+']', lines:[['f(x) = '+lin9(m1,b1),'for x < '+sg(w)],['f('+sg(w)+') = '+sg(fw),null],['f(x) = '+lin9(m2,b2),'for x > '+sg(w)]], ask:'Is f continuous at '+sg(w)+'?', right, opts, lead:'',
        why:'Glued-functions: f is continuous at w exactly when the limit from the left, f(w) and the limit from the right are one real. Here they are '+sg(lv)+', '+sg(fw)+' and '+sg(rv)+'.'+(kind===1?' The break is removable: mend f by moving f('+sg(w)+') to '+sg(lv)+'.':'')}; }
    return null; }},
  {id:'11e.joint',step:'11e',mode:'work',label:'making the joint hold',open:()=>measured('11e'),make(){
    const w=pick([-3,-2,-1,1,2,3]), m1=pick([-2,-1,1,2,3]), b1=rnd(9)-4, m2=pick([-3,-2,2,3,4].filter(m=>m!==m1)), lv=m1*w+b1, c=lv-m2*w, right=sg(c), wrong=uniq(right,[sg(b1),sg(lv),sg(lv+m2*w),sg(-c),sg(c+1)],3); if(wrong.length<3) return null;
    return {index:'q:11e.joint['+w+';'+m1+';'+b1+';'+m2+']', lines:[['f(x) = '+lin9(m1,b1),'for x ≤ '+sg(w)],['f(x) = '+(m2===1?'':sg(m2))+'x + c','for x > '+sg(w)]], ask:'Which c makes f continuous at '+sg(w)+'?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The left piece gives f('+sg(w)+') = '+sg(lv)+'. The right piece heads to '+sg(m2*w)+' + c. Glued-functions asks the two to be the same: c = '+right+'. A joint does not break continuity; the pieces may still climb at different rates.'}; }},
  {id:'11f.breaks',step:'11f',mode:'work',label:'finding the breaks',open:()=>measured('11f'),make(){
    const k=rnd(3);
    if(k===0){ const f=frq(-4,4); if(f.q===1&&Math.random()<0.5) return null; const v=Math.floor(f.p/f.q), right=sg(v);
      return {index:'q:11f.breaks[fl;'+fshow(f)+']', lines:[['x = '+fshow(f),'a real']], ask:'Which integer n has n ≤ x < n + 1? It is the floor of x.', right, opts:shuffle([right,...uniq(right,[sg(v+1),sg(v-1),sg(Math.trunc(f.p/f.q)),sg(-v),sg(v+2)],3)]), lead:'',
        why:'The floor technique: exactly one integer n has n ≤ x < n + 1. '+sg(v)+' ≤ '+fshow(f)+' < '+sg(v+1)+'. Below 0 the floor steps down, away from 0. The floor function breaks at every integer, by a jump.'}; }
    const a=pick([-4,-3,-2,-1,1,2,3,4]);
    if(k===1){ const right='a removable break: mend it with the value '+sg(2*a);
      return {index:'q:11f.breaks[rem;'+a+']', lines:[['f(x) = (x² − '+(a*a)+')/(x'+pm(-a)+')','not defined at '+sg(a)]], ask:'What kind of break has f at '+sg(a)+'?', right, opts:shuffle([right,'a removable break: mend it with the value 0','a jump: the two sides head to different reals','no mending: f passes every bound there']), lead:'',
        why:'Near '+sg(a)+' f agrees with x'+pm(a)+', which heads to '+sg(2*a)+'. The limit is there and only the value is missing: mended-function fills it in, and the mended function is continuous at '+sg(a)+'.'}; }
    const b=pick([-4,-3,-2,-1,1,2,3,4].filter(z=>z!==a)), lo=Math.min(a,b), hi=Math.max(a,b), right='at every real but '+sg(lo)+' and '+sg(hi);
    return {index:'q:11f.breaks[rat;'+lo+';'+hi+']', lines:[['f(x) = (x + 7)/((x'+pm(-lo)+')(x'+pm(-hi)+'))','a rational function']], ask:'Where is f continuous?', right, opts:shuffle([right,'at every real','at every real but −7','at '+sg(lo)+' and '+sg(hi)+' only']), lead:'',
      why:'Rational-functions-are-continuous: p/q is continuous at every input, and its inputs are the reals where the bottom is not 0.'}; }});

/* ---------- 11b, 11c, 11d ---------- */
const B11=[
  ['f and g are continuous at w. Which of these need not be continuous at w?','f/g, unless g(w) ≠ 0',['f + g','fg','3f − g'],'Continuous-sums, continuous-products, and continuous-quotients with its one condition: the bottom is not 0 at w.'],
  ['1/x is not defined at 0. Is 1/x a continuous function?','yes: it is continuous at every input, and 0 is not an input',['no: it breaks at 0','no: it passes every bound','only on the positive reals'],'A function is continuous when it is continuous at every input. A place outside the domain is not a place where it fails.'],
  ['Where is a polynomial continuous?','at every real',['at every real but its zeros','at every fraction only','it depends on the degree'],'Polynomials-are-continuous: lines are, products and sums of continuous functions are, and peeling off the constant carries the induction.'],
  ['Is there a polynomial p with p(x) = |x| for every real x?','no: |x| is continuous everywhere and still is no polynomial',['yes: p(x) = x','yes: p(x) = √(x²), which is x','no: |x| is not continuous at 0'],'Size-is-not-a-polynomial. |x| is continuous at every real; at 0 it has a joint whose pieces climb at the rates −1 and 1.'],
  ['q is 1 at fractions and 0 at irrationals. Where is x ↦ x · q(x) continuous?','at 0 only',['nowhere','everywhere','at every fraction'],'|x · q(x)| ≤ |x|, so it is squeezed to 0 at 0, and its value there is 0. At every other place it heads nowhere.'],
  ['f is continuous at w, and a sequence of inputs has x_n → w. What follows?','f(x_n) → f(w)',['f(x_n) = f(w) from some n on','nothing','x_n = w from some n on'],'Sequences-go-through. The test runs back as well: if it holds for every such sequence, f is continuous at w.']];
QP.push({id:'11b.keep',step:'11b',label:'what stays continuous',open:()=>measured('11b'),make(){ return writtenQ('11b.keep',B11.slice(0,2)); }},
  {id:'11d.poly',step:'11d',label:'polynomials, and what is not one',open:()=>measured('11d'),make(){ return writtenQ('11d.poly',B11.slice(2,4)); }},
  {id:'11e.through',step:'11e',label:'sequences go through',open:()=>measured('11e'),make(){ return writtenQ('11e.through',B11.slice(4,6)); }},
  {id:'11c.inside',step:'11c',mode:'work',label:'the limit passes inside',open:()=>measured('11c'),make(){
    const r=1+rnd(6), w=pick([-3,-2,-1,1,2,3]), m=pick([1,2,3,-1,-2]), b=r*r-m*w, k=rnd(2), v=k===0?r:r*r*r, ex=k===0?'√('+lin9(m,b)+')':'('+lin9(m,b)+')³'.replace('³','')+' · √('+lin9(m,b)+')';
    const right=String(v), wrong=uniq(right,[String(r*r),String(k===0?r+1:r*r*r+1),NOLIM,sg(-v),'0'],3);
    return {index:'q:11c.inside['+k+';'+m+';'+b+';'+w+']', lines:[['g(x) = '+lin9(m,b),'heading to '+(r*r)+' as x → '+sg(w)],['f(g(x)) = '+ex,'as x → '+sg(w)]], ask:'To which real does f(g(x)) head?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Limit-passes-inside: g heads to '+(r*r)+', and the outside function is continuous there, so the limit is the outside function at '+(r*r)+': '+(k===0?'√'+(r*r)+' = '+r:(r*r)+' · √'+(r*r)+' = '+v)+'.'}; }});

/* ---------- rungs 10 and 11, Check Proofs and Word Problems ---------- */
QP.push({id:'10a.answer',step:'10a',mode:'proof',label:'does the reach answer',open:()=>measured('10a'),make(){
    const m=pick([-5,-4,-3,-2,2,3,4,5]), b=rnd(11)-5, w=rnd(7)-3, e=pick([fr(1,2),fr(1,10),fr(1,5),fr(1,4),fr(3,10)]), best=fmul(e,fr(1,Math.abs(m))), d=pick([best,fhalf(best),e,fmul(e,fint(Math.abs(m))),fmul(best,fint(2))]);
    const ok=!fless(best,d), opts=['it answers: every x within δ of '+sg(w)+' lands within ε','it does not answer: some x within δ lands ε or more away'];
    return {index:'q:10a.answer['+m+';'+b+';'+w+';'+fshow(e)+';'+fshow(d)+']', stack:true, lines:[['f(x) = '+lin9(m,b),'heading to '+sg(m*w+b)+' as x → '+sg(w)],['ε = '+fshow(e),'the challenge'],['δ = '+fshow(d),'the answer offered']], ask:'Does the reach on line 3 answer the challenge?', right:opts[ok?0:1], opts, lead:'',
      why:'|f(x) − '+par10(m*w+b)+'| = '+Math.abs(m)+' · |x − '+par10(w)+'|, so within δ of '+sg(w)+' the output is within '+Math.abs(m)+' · '+fshow(d)+' = '+fshow(fmul(d,fint(Math.abs(m))))+' of the target. '+(ok?'That is at most ε.':'That is more than ε. The greatest reach that answers is ε/'+Math.abs(m)+' = '+fshow(best)+'.')}; }},
  {id:'10a.dial',step:'10a',mode:'word',label:'how close is close enough',open:()=>measured('10a'),make(){
    const m=pick([2,3,4,5,10]), w=2+rnd(8), e=pick([fr(1,2),fr(1,10),fr(1,5),fr(1,4)]), d=fmul(e,fr(1,m)), [story,unit]=pick([['A saw cuts a plank '+m+' centimetres long for each mark on its dial.','centimetres'],['A pump delivers '+m+' litres for each turn of its wheel.','litres'],['A press makes a sheet '+m+' millimetres thick for each notch of its lever.','millimetres']]);
    const right='within '+fshow(d), wrong=uniq(right,['within '+fshow(e),'within '+fshow(fmul(e,fint(m))),'within '+fshow(fmul(d,fint(2))),'within '+fshow(fr(1,m))],3); if(wrong.length<3) return null;
    return {index:'q:10a.dial['+m+';'+w+';'+fshow(e)+';'+unit+']', a3:['10a.dial['+m+']',DASH,DASH], story:story+' The output must come within '+fshow(e)+' of '+(m*w)+' '+unit+'.', lines:[], ask:'How close to '+w+' must the setting be? Give the greatest reach.', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The output is '+m+' times the setting, so its distance from '+(m*w)+' is '+m+' times the setting’s distance from '+w+'. The challenge is '+fshow(e)+', and the reach that answers it is ('+fshow(e)+')/'+m+' = '+fshow(d)+'.'}; }},
  {id:'11a.mend',step:'11a',mode:'word',label:'a break in the record',open:()=>measured('11a'),make(){
    const a=10+rnd(30), k=rnd(3), b=a+pick([-6,-4,4,6]), [story,right,why]=k===0?['A gauge reads '+a+' just before noon and '+a+' just after. The reading logged at noon is '+b+'.','a removable break: change the one value at noon to '+a,'Both sides head to '+a+', and only the value is elsewhere. Mending that one value makes the record continuous at noon.']
      :k===1?['A gauge reads '+a+' just before noon and '+b+' just after.','a jump: no value at noon can mend it','The two sides head to different reals, so the record has no limit at noon, whatever is logged there.']
      :['A gauge reads '+a+' just before noon, '+a+' at noon, and '+a+' just after.','none: the record is continuous at noon','The limit from the left, the value and the limit from the right are one real.'];
    const all=['a removable break: change the one value at noon to '+a,'a jump: no value at noon can mend it','none: the record is continuous at noon','a break that passes every bound'];
    return {index:'q:11a.mend['+k+';'+a+';'+b+']', a3:['11a.mend['+k+']',DASH,DASH], story, lines:[], ask:'What kind of break has the record at noon?', right, opts:shuffle(all), lead:'', why}; }});

/* ===== Laundry 5, rung 12 (floor 3 pools, stage K): 12a to 12f, skipping nothing on the way ===== */
Object.assign(STEPS,{'12a':['r12a','The Intermediate Value Technique'],'12b':['r12b','Bounded on a Closed Interval'],'12c':['r12c','The Highest-and-Lowest Technique'],'12d':['r12d','Why Having No Holes Matters'],'12e':['r12e','Bisection by Hand'],'12f':['r12f','Square Root by Hand']});
const btw12=(a,b)=>'between '+sg(a)+' and '+sg(b);

/* ---------- 12a The Intermediate Value Technique ---------- */
const A12=[
  ['f(x) = 1/x has f(−1) < 0 < f(1), and no zero between −1 and 1. Why does the in-between-value technique not apply?','f is not continuous on [−1, 1]: it is not even defined at 0',['the interval is not closed','the end values have the same sign','it does apply, and the zero is 0'],'The technique asks for continuity on the whole closed interval, ends included. One missing input is enough to let a function skip 0.'],
  ['f is continuous on [v, w], and y is between f(v) and f(w). What follows?','y is a value of f: some c between v and w has f(c) = y',['f(v) = y or f(w) = y','exactly one c has f(c) = y','nothing, unless y = 0'],'The general form: any height between the two end values is taken. Apply the zero form to f(x) − y.'],
  ['f is continuous on [v, w] and f(v) < 0 < f(w). Does the technique say how many zeros f has?','no: at least one, and there may be more',['yes: exactly one','yes: an odd number','yes: two'],'It proves that a zero exists between v and w. It does not count them, and it does not say where.'],
  ['What does continuity on a closed interval [v, w] promise at the ends?','the same as inside, with only the inputs of [v, w] looked at',['nothing: the ends are left out','continuity from both sides, using inputs outside','that f is 0 at the ends'],'Closed-interval-continuity: one promise, made alike at every input, ends included.']];
QP.push({id:'12a.trap',step:'12a',mode:'work',label:'a zero in between',open:()=>measured('12a'),make(){
    for(let t=0;t<60;t++){ const cs=[1,rnd(5)-2,rnd(9)-6,rnd(9)-4], ch=[], same=[]; for(let k=-4;k<4;k++){ const a=ev9(cs,k), b=ev9(cs,k+1); if(a*b<0) ch.push(k); else if(a*b>0) same.push(k); } if(!ch.length||same.length<3) continue;
      const k=pick(ch), W=take(same,3), right=btw12(k,k+1);
      return {index:'q:12a.trap['+poly9(cs)+';'+k+';'+W.join(',')+']', lines:[['p(x) = '+poly9(cs),'a polynomial, so continuous on every closed interval']], ask:'Between which two integers must p have a zero?', right, opts:shuffle([right,...W.map(j=>btw12(j,j+1))]), lead:'',
        why:'p('+sg(k)+') = '+sg(ev9(cs,k))+' and p('+sg(k+1)+') = '+sg(ev9(cs,k+1))+': the signs differ, so the in-between-value technique gives a zero between them. At the ends of each other pair p has one sign, and the technique says nothing there.'}; }
    return null; }},
  {id:'12a.needs',step:'12a',label:'what the technique asks',open:()=>measured('12a'),make(){ return writtenQ('12a.needs',A12); }},
  {id:'12a.licensed',step:'12a',mode:'proof',label:'is the zero licensed',open:()=>measured('12a'),make(){
    const v=rnd(7)-3, w=v+1+rnd(4), k=rnd(4), fv=pick([-5,-4,-3,-2,-1,1,2,3,4]), fw=(k===1?Math.sign(fv):-Math.sign(fv))*(1+rnd(5)), cont=k!==2, ok=cont&&fv*fw<0, opts=['it is licensed','it is not licensed'];
    return {index:'q:12a.licensed['+v+';'+w+';'+fv+';'+fw+';'+k+']', stack:true, lines:[[cont?'f is continuous on ['+sg(v)+', '+sg(w)+']':'f is continuous on ['+sg(v)+', '+sg(w)+'] but for one input inside','given'],['f('+sg(v)+') = '+sg(fv)+' and f('+sg(w)+') = '+sg(fw),'given'],['f has a zero c with '+sg(v)+' < c < '+sg(w),'the in-between-value technique, on lines 1 and 2']], ask:'Is line 3 licensed?', right:opts[ok?0:1], opts, lead:'',
      why:ok?'f is continuous on the closed interval and its end values have different signs, so 0 is taken somewhere between.':!cont?'One break is enough for a function to step over 0. The technique needs continuity at every input of the closed interval.':'Both end values have the same sign. f may still have a zero, and this technique does not give one.'}; }},
  {id:'12a.reading',step:'12a',mode:'word',label:'every reading in between',open:()=>measured('12a'),make(){
    const a=rnd(9)-6, b=a+3+rnd(8), [what,unit]=pick([['A thermometer’s record','degrees'],['A depth gauge’s record','metres'],['A balance’s record','units']]), inside=a+1+rnd(b-a-1), out=[a-1-rnd(3),b+1+rnd(3),a-4-rnd(3),b+5].map(sg), right=sg(inside);
    return {index:'q:12a.reading['+a+';'+b+';'+inside+';'+out.join(',')+']', a3:['12a.reading',DASH,DASH], story:what+' is continuous from noon to two. It reads '+sg(a)+' '+unit+' at noon and '+sg(b)+' at two.', lines:[], ask:'Which reading must it have shown at some moment between?', right, opts:shuffle([right,...uniq(right,out,3)]), lead:'',
      why:'Any height between the two end values is taken. '+right+' lies between '+sg(a)+' and '+sg(b)+'. A reading outside that stretch may have happened, and nothing makes it.'}; }});

/* ---------- 12b Bounded on a Closed Interval ---------- */
QP.push({id:'12b.bound',step:'12b',mode:'work',label:'a bound for a polynomial',open:()=>measured('12b'),make(){
    const cs=[pick([1,2,-1,-2]),rnd(9)-4,rnd(9)-4], v=rnd(5)-4, w=v+1+rnd(4), R=Math.max(Math.abs(v),Math.abs(w)), B=Math.abs(cs[0])*R*R+Math.abs(cs[1])*R+Math.abs(cs[2]), right=String(B);
    const wrong=uniq(right,[Math.abs(ev9(cs,R)),Math.abs(cs[0])+Math.abs(cs[1])+Math.abs(cs[2]),B+R,Math.abs(ev9(cs,w)),B-1,R*R].map(String),3); if(wrong.length<3||R===1) return null;
    return {index:'q:12b.bound['+poly9(cs)+';'+v+';'+w+']', lines:[['p(x) = '+poly9(cs),'on ['+sg(v)+', '+sg(w)+']']], ask:'Which bound does the polynomial-bound technique give for |p(x)| there?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'With R = max(|'+sg(v)+'|, |'+sg(w)+'|) = '+R+', |p(x)| ≤ Σ |u_k| R^k = '+Math.abs(cs[0])+' · '+(R*R)+' + '+Math.abs(cs[1])+' · '+R+' + '+Math.abs(cs[2])+' = '+right+'. Sizes are taken term by term, so signs cannot help by cancelling. It is a bound, not the greatest value.'}; }});

/* ---------- 12c The Highest-and-Lowest Technique ---------- */
const C12=[
  ['f(x) = x on the open interval (0, 1). Does f reach a greatest value there?','no: its values pass every real below 1 and never reach 1',['yes: 1','yes: 1/2','no: f is not continuous there'],'Highest-and-lowest asks for a closed interval. On (0, 1) the least upper bound of the values is 1, and no input gives it.'],
  ['f(x) = 1/x on (0, 1]. Is f bounded there?','no: it passes every bound near 0',['yes: by 1','yes: by its value at 1/2','yes: every continuous function is bounded'],'Bounded-on-a-closed-interval needs both ends in. Here one end is missing, and f runs away towards it.'],
  ['f is continuous on [v, w]. What does the highest-and-lowest technique give?','inputs where f takes a greatest value and a least value on [v, w]',['a bound only: the greatest value may not be reached','a zero of f','the places where f is greatest'],'The values have a least upper bound by no-holes, and continuity on the closed interval makes it a value. Where it is reached, the technique does not say.'],
  ['When does f reach its greatest value on A at c?','when c ∈ A and f(c) is the least upper bound of the values of f on A',['when f(c) is an upper bound of the values','when f(c) > 0','when c is an end of A'],'Greatest-is-reached: the sup of the values exists and is itself a value.']];
QP.push({id:'12c.extremes',step:'12c',mode:'work',label:'highest and lowest on a closed interval',open:()=>measured('12c'),make(){
    const h=rnd(9)-4, k=rnd(9)-4, v=rnd(9)-6, w=v+1+rnd(5), f=x=>(x-h)*(x-h)+k, least=Math.random()<0.5, inside=v<=h&&h<=w, lo=inside?k:Math.min(f(v),f(w)), hi=Math.max(f(v),f(w)), val=least?lo:hi, right=sg(val);
    const wrong=uniq(right,[sg(least?hi:lo),sg(k),sg(f(v)),sg(f(w)),sg(val+1),sg(h)],3); if(wrong.length<3) return null;
    return {index:'q:12c.extremes['+h+';'+k+';'+v+';'+w+';'+(least?'l':'g')+']', lines:[['f(x) = (x'+(h===0?'':pm(-h))+')²'+(k===0?'':pm(k)),'on ['+sg(v)+', '+sg(w)+']']], ask:least?'What is the least value of f there?':'What is the greatest value of f there?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'A square is never negative, so f is least where x = '+sg(h)+(inside?', which is in the interval: the least value is '+sg(k)+'.':', which is outside the interval: the least value is at the nearer end, '+sg(lo)+'.')+' The greatest value is at the end further from '+sg(h)+': f('+sg(v)+') = '+sg(f(v))+', f('+sg(w)+') = '+sg(f(w))+'.'}; }},
  {id:'12c.closed',step:'12c',label:'why the interval is closed',open:()=>measured('12c'),make(){ return writtenQ('12c.closed',C12); }});

/* ---------- 12d Why Having No Holes Matters ---------- */
const D12=[
  ['Over the fractions alone, f(x) = x² − 2 has f(1) < 0 < f(2). Has it a zero among the fractions between 1 and 2?','no: no fraction squares to 2',['yes: 3/2','yes: 7/5','yes, by the in-between-value technique'],'f is continuous over ℚ and changes sign, and still skips 0: the zero would be at the hole. The technique rests on no-holes.'],
  ['Over the fractions, g(x) = −(x² − 2)² is continuous and bounded between 1 and 2. Has it a greatest value there?','no: its values come as near 0 as you like and never reach it',['yes: 0','yes: −1','yes, by the highest-and-lowest technique'],'The greatest value would be 0, taken where x² = 2. Over ℚ that input is missing.'],
  ['Which fact about the line do the three techniques of this rung rest on?','no-holes: every set of reals with a member and an upper bound has a least upper bound',['every real is a fraction','every function is continuous','counting passes any real, and nothing more'],'Take the holes back and each technique fails, as the fractions show.'],
  ['Over ℚ there is a function that is continuous at every fraction and takes only the values −1 and 1. What makes that possible?','the hole: the step is made where no fraction stands',['a break at a fraction','the either-way principle failing','fractions not comparing'],'Hole-makes-a-step: −1 below the hole and 1 above it. On the line the same recipe has a break at √2.']];
QP.push({id:'12d.holes',step:'12d',label:'why having no holes matters',open:()=>measured('12d'),make(){ return writtenQ('12d.holes',D12); }});

/* ---------- 12e Bisection by Hand ---------- */
QP.push({id:'12e.bisect',step:'12e',mode:'work',label:'halving a trap',open:()=>measured('12e'),make(){
    const k=rnd(3), n=pick([2,3,5,6,7,10,11]), lo0=Math.floor(Math.sqrt(n));
    if(k===0){ let c=fint(lo0), d=fint(lo0+1); const steps=rnd(3); for(let i=0;i<steps;i++){ const m=fhalf(fadd(c,d)); if(m.p*m.p<n*m.q*m.q) c=m; else d=m; } const m=fhalf(fadd(c,d)), low=m.p*m.p<n*m.q*m.q, iv=(a,b)=>'['+fshow(a)+', '+fshow(b)+']', right=low?iv(m,d):iv(c,m);
      return {index:'q:12e.bisect[h;'+n+';'+fshow(c)+';'+fshow(d)+']', lines:[['f(x) = x² − '+n,'continuous'],[iv(c,d),'a trap: f is negative at the left end and positive at the right']], ask:'The middle is '+fshow(m)+'. Which half is the next trap?', right, opts:shuffle([right,low?iv(c,m):iv(m,d),iv(c,d),'neither: the middle is a zero']), lead:'',
        why:'f('+fshow(m)+') = '+fshow(fsub(fmul(m,m),fint(n)))+', which is '+(low?'negative, so the sign change is in the right half.':'positive, so the sign change is in the left half.')+' Middle-of-a-trap: the middle is a zero, or exactly one half is a trap.'}; }
    if(k===1){ const u=rnd(5), w=u+pick([1,2,4]), h=2+rnd(5), d=fr(w-u,2**h), right=fshow(d), wrong=uniq(right,[fshow(fr(w-u,2*h)),fshow(fr(w-u,2**(h-1))),fshow(fr(w-u,2**(h+1))),fshow(fr(1,h)),fshow(fr(w-u,h*h))],3); if(wrong.length<3) return null;
      return {index:'q:12e.bisect[w;'+u+';'+w+';'+h+']', lines:[['['+u+', '+w+']','a trap'],[h+' halvings','no tested middle was a zero']], ask:'How wide is the trap now?', right, opts:shuffle([right,...wrong]), lead:'', why:'Halvings-width: after n halvings the width is (v − u)/2ⁿ = '+(w-u)+'/'+(2**h)+' = '+right+'. Each halving is one more place in twos.'}; }
    const even=[['x² + 1',0],['x⁴ + 3',0],['x⁶ + x² + 1',0],['x² + 2x + 5',0],['x⁴ + x² + 2',0]], odd=[['x³ − 5x + 1',1],['x⁵ + x + 7',1],['x³ + 4',1],['−x³ + 2x² − 9',1],['x⁷ − 3x⁴ + 2',1]], R=pick(odd), W=take(even,3);
    return {index:'q:12e.bisect[odd;'+R[0]+';'+W.map(w=>w[0]).join(';')+']', lines:[], ask:'Which polynomial must have a zero on the line?', right:R[0], opts:shuffle([R,...W]).map(x=>x[0]), lead:'It is '+R[0]+'. ',
      why:'Odd-degree-zero: a polynomial of odd degree passes every bound one way and below every bound the other, so it changes sign, and the in-between-value technique gives a zero. Each of the others is a sum of squares and a positive number, and is never 0.'}; }});

/* ---------- 12f Square Root by Hand ---------- */
QP.push({id:'12f.average',step:'12f',mode:'work',label:'the averaging step',open:()=>measured('12f'),make(){
    const n=pick([2,3,5,6,7,10]), u=pick([fint(Math.floor(Math.sqrt(n))+1),fr(2*Math.floor(Math.sqrt(n))+3,2),fint(Math.floor(Math.sqrt(n))+2)]), nu=fmul(fint(n),fr(u.q,u.p)), k=rnd(2);
    if(k===0){ const v=fhalf(fadd(u,nu)), right=fshow(v), wrong=uniq(right,[fshow(nu),fshow(fhalf(fadd(u,fint(n)))),fshow(fadd(u,nu)),fshow(fhalf(u)),fshow(fsub(u,nu))],3); if(wrong.length<3) return null;
      return {index:'q:12f.average[s;'+n+';'+fshow(u)+']', lines:[['n = '+n+', u = '+fshow(u),'u² > n'],['u′ = (u + n/u)/2','the averaging step']], ask:'Which fraction is u′?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'n/u = '+fshow(nu)+', and half of '+fshow(u)+' + '+fshow(nu)+' is '+right+'. Square-overshoot: u′² − n = (u² − n)²/(4u²) = '+fshow(fsub(fmul(v,v),fint(n)))+', never negative, and far smaller than the overshoot before.'}; }
    const iv=(a,b)=>'['+fshow(a)+', '+fshow(b)+']', right=iv(nu,u), wrong=uniq(right,[iv(u,nu),iv(fint(0),u),iv(nu,fint(n)),iv(fhalf(u),u)],3); if(wrong.length<3) return null;
    return {index:'q:12f.average[t;'+n+';'+fshow(u)+']', lines:[['n = '+n+', u = '+fshow(u),'u > 0 and u² > n']], ask:'Which trap does the root-trap technique give for √'+n+'?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Root-trap: if u² > n, then n/u < √n < u. Here n/u = '+fshow(nu)+', and the trap has width (u² − n)/u = '+fshow(fsub(u,nu))+'.'}; }});

/* ===== Laundry 5, rung 13 (floor 3 pools, stage L): 13a to 13n, slopes ===== */
Object.assign(STEPS,{'13a':['r13a','The Slope at a Point'],'13b':['r13b','A Slope Means No Gap'],'13c':['r13c','The Product Rule'],'13d':['r13d','The Power Rule'],'13e':['r13e','The Chain Rule'],'13f':['r13f','A Joint Has No Slope'],'13g':['r13g','The Growing Square'],
  '13h':['r13h','Powers, Constants and Sums'],'13i':['r13i','Products and Quotients'],'13j':['r13j','The Chain Rule by Hand'],'13k':['r13k','The Tangent Line and the Nearby Line'],'13l':['r13l','Implicit Slopes and the Inverse Dodge'],'13m':['r13m','Homing in on a Root With Tangent Lines, and How Errors Spread'],'13n':['r13n','Units and Standards']});
const dp13=cs=>cs.length<2?[0]:cs.slice(0,-1).map((c,i)=>c*(cs.length-1-i));
const poly13=cs=>{ let i=0; while(i<cs.length-1&&cs[i]===0) i++; const s=poly9(cs.slice(i)); return s===''?'0':s; };
const num13=(right,alts,n)=>uniq(right,alts.map(a=>typeof a==='number'?sg(a):a),n||3);

/* ---------- 13a The Slope at a Point, 13g The Growing Square ---------- */
QP.push({id:'13a.slope',step:'13a',mode:'work',label:'first slopes',open:()=>measured('13a'),make(){
    const k=rnd(4), w=pick([-4,-3,-2,-1,1,2,3,4,5]), m=pick([-3,-2,2,3,5]), b=rnd(9)-4;
    const [ex,v,alts,why]=k===0?[lin9(m,b),fint(m),[fint(m*w+b),fint(b),fint(m*w),fint(0)],'Slope-of-a-line: mx + b has the slope m at every real.']:k===1?['x²',fint(2*w),[fint(w*w),fint(w),fint(2),fint(-2*w)],'Slope-of-x²: (x²)′ = 2x.']
      :k===2?['x³',fint(3*w*w),[fint(w*w*w),fint(3*w),fint(2*w),fint(w*w)],'Slope-of-x³: (x³)′ = 3x².']:['1/x',fr(-1,w*w),[fr(1,w*w),fr(1,w),fr(-1,w),fint(-w*w)],'Slope-of-one-over-x: at every w ≠ 0, (1/x)′ = −1/x².'];
    const right=fshow(v), wrong=uniq(right,alts.map(fshow),3); if(wrong.length<3) return null;
    return {index:'q:13a.slope['+ex+';'+w+']', lines:[['f(x) = '+ex,'at the input '+sg(w)]], ask:'What is the slope of f there?', right, opts:shuffle([right,...wrong]), lead:'', why:why+' At '+sg(w)+' that is '+right+'.'}; }},
  {id:'13a.chord',step:'13a',mode:'work',label:'chord slopes',open:()=>measured('13a'),make(){
    const w=rnd(7)-3, h=pick([1,2,-1,3]), a=rnd(7)-3, f=x=>x*x+a*x, v=(f(w+h)-f(w))/h, right=sg(v), wrong=num13(right,[2*w+a,f(w+h)-f(w),v+h,2*w,v-1,f(w+h)]); if(wrong.length<3) return null;
    return {index:'q:13a.chord['+w+';'+h+';'+a+']', lines:[['f(x) = '+poly13([1,a,0]),'from the input '+sg(w)+' to the input '+sg(w+h)]], ask:'What is the chord slope?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'(f('+sg(w+h)+') − f('+sg(w)+'))/'+par10(h)+' = ('+sg(f(w+h))+' − '+par10(f(w))+')/'+par10(h)+' = '+right+'. As a polynomial in h the chord slope is '+poly13([1,2*w+a]).replace(/x/g,'h')+', and the slope at '+sg(w)+' is what is left when h heads to 0: '+sg(2*w+a)+'.'}; }},
  {id:'13g.square',step:'13g',mode:'work',label:'the growing square',open:()=>measured('13g'),make(){
    const w=2+rnd(8), h=1+rnd(3), v=2*w*h+h*h, right=String(v), wrong=num13(right,[h*h,2*w*h,2*w+h,(w+h)*(w+h),w*h]);
    return {index:'q:13g.square['+w+';'+h+']', lines:[['a square of side '+w,'its side grows by '+h]], ask:'By how much does its area grow?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'(w + h)² − w² = 2wh + h²: two strips of '+w+' by '+h+', and a corner of '+h+' by '+h+'. Divide by h and the strips leave 2w while the corner leaves h, which heads to 0. That is why the slope of x² is 2x.'}; }});

/* ---------- 13b A Slope Means No Gap, 13f A Joint Has No Slope ---------- */
const B13=[
  ['f has a slope at w. What follows about continuity?','f is continuous at w',['nothing','f is continuous everywhere','f is a line near w'],'Slope-means-no-gap: the change f(w + h) − f(w) is the chord slope times h, and that heads to 0.'],
  ['f is continuous at w. Must f have a slope at w?','no: |x| is continuous at 0 and has no slope there',['yes: continuity gives a slope','yes, unless f is a constant','no: a continuous function never has a slope'],'The chord slopes of |x| from 0 are 1 to the right and −1 to the left. No gap, and no slope.'],
  ['When does a function have a slope at a joint?','exactly when its pieces arrive there with the same slope',['whenever it is continuous there','never','whenever both pieces are lines'],'Two-side-slopes: a slope exists exactly when the slopes from the two sides exist and agree.'],
  ['What is the slope at w, in words?','the limit of the chord slopes from w, as the step h heads to 0',['the chord slope for a small step h','the value of f at w','the limit of f at w'],'A chord slope needs two inputs. The slope at a point is where the chord slopes head, and it is one real or there is none.']];
QP.push({id:'13b.gap',step:'13b',label:'a slope means no gap',open:()=>measured('13b'),make(){ return writtenQ('13b.gap',B13); }},
  {id:'13f.joint',step:'13f',label:'a slope at a joint',open:()=>measured('13f'),make(){
    const w=rnd(7)-3, m1=pick([-3,-2,-1,1,2,3]), b1=rnd(9)-4, kind=rnd(3), m2=kind===0?m1:pick([-3,-2,-1,1,2,3].filter(m=>m!==m1)), lv=m1*w+b1, b2=kind===2?lv-m2*w+pick([-2,-1,1,2]):lv-m2*w;
    const opts=['yes: the slope there is '+sg(m1),'no: the pieces arrive with the slopes '+sg(m1)+' and '+sg(m2),'no: f has a gap there, so it has no slope','yes: the slope there is '+fshow(fr(m1+m2,2))], right=opts[kind];
    return {index:'q:13f.joint['+w+';'+m1+';'+b1+';'+m2+';'+b2+']', lines:[['f(x) = '+lin9(m1,b1),'for x ≤ '+sg(w)],['f(x) = '+lin9(m2,b2),'for x > '+sg(w)]], ask:'Has f a slope at '+sg(w)+'?', right, opts:kind===0?[opts[0],'no: the pieces arrive with different slopes',opts[2],'no: a joint never has a slope']:opts, lead:'',
      why:kind===2?'The left piece gives '+sg(lv)+' at the joint and the right piece heads to '+sg(m2*w+b2)+'. A slope means no gap, so a gap means no slope.':'The pieces meet at the height '+sg(lv)+'. Joint-slopes: a slope exists exactly when the pieces arrive with the same slope. '+(kind===0?'Both arrive with '+sg(m1)+'.':'Slopes are not averaged.')}; }});

/* ---------- 13c, 13e, 13f, 13i, 13l: the rules, from a table of values ---------- */
QP.push({id:'13c.product',step:'13c',mode:'work',label:'the product rule',open:()=>measured('13c'),make(){
    const w=rnd(5), f=pick([-3,-2,2,3,4]), df=pick([-2,-1,1,2,3]), g=pick([-4,-2,1,3,5]), dg=pick([-3,-1,2,4]), v=df*g+f*dg, right=sg(v), wrong=num13(right,[df*dg,f*g,df*g-f*dg,df+dg,f*dg]); if(wrong.length<3) return null;
    return {index:'q:13c.product['+[f,df,g,dg].join(';')+']', lines:[['f('+w+') = '+sg(f)+', f′('+w+') = '+sg(df),'given'],['g('+w+') = '+sg(g)+', g′('+w+') = '+sg(dg),'given']], ask:'What is (fg)′('+w+')?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Product for slopes: (fg)′ = f′g + fg′ = '+par10(df)+' · '+par10(g)+' + '+par10(f)+' · '+par10(dg)+' = '+right+'. The slope of a product is not the product of the slopes.'}; }},
  {id:'13e.chain',step:'13e',mode:'work',label:'the chain rule',open:()=>measured('13e'),make(){
    const w=1+rnd(4), g=w+2+rnd(4), dg=pick([-3,-2,2,3,4]), dfg=pick([-2,-1,3,5]), dfw=pick([-4,1,2,6].filter(x=>x!==dfg)), v=dfg*dg, right=sg(v), wrong=num13(right,[dfw*dg,dfg+dg,dfg,dfw*dfg,dg]); if(wrong.length<3) return null;
    return {index:'q:13e.chain['+[w,g,dg,dfg,dfw].join(';')+']', lines:[['g('+w+') = '+g+', g′('+w+') = '+sg(dg),'given'],['f′('+w+') = '+sg(dfw)+', f′('+g+') = '+sg(dfg),'given']], ask:'What is (f ∘ g)′('+w+')?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Chain for slopes: rates through a chain multiply, the outside’s taken where the inside stands. The inside stands at g('+w+') = '+g+', so (f ∘ g)′('+w+') = f′('+g+') · g′('+w+') = '+par10(dfg)+' · '+par10(dg)+' = '+right+'.'}; }},
  {id:'13i.quotient',step:'13i',mode:'work',label:'the quotient rule',open:()=>measured('13i'),make(){
    const w=rnd(5), f=pick([-3,-2,2,3,4]), df=pick([-2,-1,1,2,3]), g=pick([-2,-1,1,2]), dg=pick([-3,-1,2,4]), v=fr(df*g-f*dg,g*g), right=fshow(v), wrong=uniq(right,[fshow(fr(df*g+f*dg,g*g)),fshow(fr(df,dg)),fshow(fr(f*dg-df*g,g*g)),fshow(fint(df*g-f*dg)),fshow(fr(f,g))],3); if(wrong.length<3) return null;
    return {index:'q:13i.quotient['+[f,df,g,dg].join(';')+']', lines:[['f('+w+') = '+sg(f)+', f′('+w+') = '+sg(df),'given'],['g('+w+') = '+sg(g)+', g′('+w+') = '+sg(dg),'given']], ask:'What is (f/g)′('+w+')?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Quotient for slopes: (f/g)′ = (f′g − fg′)/g² = ('+par10(df)+' · '+par10(g)+' − '+par10(f)+' · '+par10(dg)+')/'+(g*g)+' = '+right+'. The bottom is a square, so the sign of the slope is the sign of the top.'}; }},
  {id:'13l.inverse',step:'13l',mode:'work',label:'the inverse dodge',open:()=>measured('13l'),make(){
    if(Math.random()<0.5){ const x0=1+rnd(4), y0=x0+3+rnd(5), d=pick([-4,-3,-2,2,3,4,5]), right=fshow(fr(1,d)), wrong=uniq(right,[fshow(fint(d)),fshow(fr(-1,d)),fshow(fr(1,y0)),fshow(fint(-d)),fshow(fr(x0,y0))],3); if(wrong.length<3) return null;
      return {index:'q:13l.inverse[i;'+x0+';'+y0+';'+d+']', lines:[['f('+x0+') = '+y0+', f′('+x0+') = '+sg(d),'f keeps order or turns it about near '+x0],['g undoes f','so g('+y0+') = '+x0]], ask:'What is g′('+y0+')?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'Inverse-slope: g′(y₀) · f′(x₀) = 1, so g′('+y0+') = 1/f′('+x0+') = '+right+'. Run backwards, a rate is turned upside down.'}; }
    const [a,b,r]=pick([[3,4,5],[4,3,5],[5,12,13],[12,5,13],[6,8,10],[8,6,10]]), sa=pick([1,-1])*a, sb=pick([1,-1])*b, right=fshow(fr(-sa,sb)), wrong=uniq(right,[fshow(fr(sa,sb)),fshow(fr(-sb,sa)),fshow(fr(sb,sa)),fshow(fr(-sa,r))],3); if(wrong.length<3) return null;
    return {index:'q:13l.inverse[c;'+sa+';'+sb+']', lines:[['x² + y² = '+(r*r),'y is a function of x near the point'],['the point ('+sg(sa)+', '+sg(sb)+')','on the curve']], ask:'What is the slope of y there?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Take the slope of both sides, with y a function of x: 2x + 2y · y′ = 0, by the chain rule. So y′ = −x/y = '+right+' at the point.'}; }});

/* ---------- 13d The Power Rule, 13h, 13j by hand ---------- */
QP.push({id:'13d.poly',step:'13d',mode:'work',label:'a polynomial, term by term',open:()=>measured('13d'),make(){
    const n=2+rnd(3), cs=[pick([1,2,3,-1,-2])]; for(let i=0;i<n;i++) cs.push(Math.random()<0.3?0:rnd(11)-5); const d=dp13(cs), right=poly13(d);
    const keep=cs.slice(0,-1).concat([0]), wrong=uniq(right,[poly13(cs.slice(0,-1)),poly13(d.concat([cs[n]])),poly13(d.map((c,i)=>i===0?cs[0]:c)),poly13(keep.map((c,i)=>c*(n-i))),poly13(d.map(c=>-c))],3); if(wrong.length<3) return null;
    return {index:'q:13d.poly['+poly13(cs)+']', lines:[['p(x) = '+poly13(cs),'a polynomial']], ask:'What is p′(x)?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Polynomial-slope: term by term. The power comes down as a factor and the power drops by one; a constant factor stays; a constant alone has slope 0.'}; }},
  {id:'13d.check',step:'13d',mode:'proof',label:'is it the slope',open:()=>measured('13d'),make(){
    const cs=[pick([1,2,3,-1]),rnd(9)-4,rnd(9)-4,rnd(9)-4], d=dp13(cs), bad=pick([null,null,d.concat([cs[3]]),[cs[0],d[1],d[2]],cs.slice(0,3)]), off=bad||d, ok=poly13(off)===poly13(d), opts=['it is the slope of line 1','it is not the slope of line 1'];
    return {index:'q:13d.check['+poly13(cs)+';'+poly13(off)+']', stack:true, lines:[['p(x) = '+poly13(cs),'given'],['p′(x) = '+poly13(off),'power for slopes, term by term, on line 1']], ask:'Is line 2 right?', right:opts[ok?0:1], opts, lead:'',
      why:'Term by term the slope is '+poly13(d)+'. Each power comes down as a factor and drops by one, and the constant goes to 0.'}; }},
  {id:'13h.fraction',step:'13h',mode:'work',label:'fraction powers',open:()=>measured('13h'),make(){
    const [b,q,p]=pick([[3,2,1],[2,2,1],[4,2,1],[2,2,3],[3,2,3],[2,3,1],[2,3,2],[3,3,1],[2,3,4],[5,2,1],[2,4,1],[2,2,5]]), w=b**q, v=fmul(fr(p,q),p>=q?fint(b**(p-q)):fr(1,b**(q-p))), right=fshow(v);
    const wrong=uniq(right,[fshow(fr(p,q)),fshow(fint(b**p)),fshow(fmul(fr(p,q),fint(b**p))),fshow(fr(1,b**(q-1)||1)),fshow(fmul(v,fint(q)))],3); if(wrong.length<3) return null;
    return {index:'q:13h.fraction['+w+';'+p+'/'+q+']', lines:[['f(x) = x^('+p+'/'+q+')','at the input '+w]], ask:'What is the slope of f there?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Fraction-power for slopes: the power rule holds for every fraction power at a positive input. The slope is ('+p+'/'+q+') · x^('+p+'/'+q+' − 1), and at '+w+', whose '+(q===2?'square':q===3?'cube':'fourth')+' root is '+b+', that is '+right+'.'}; }},
  {id:'13j.byhand',step:'13j',mode:'work',label:'the chain rule by hand',open:()=>measured('13j'),make(){
    const a=pick([-3,-2,2,3,4,5]), b=rnd(9)-4, n=2+rnd(4), sup=['','','²','³','⁴','⁵','⁶'], inn='('+lin9(a,b)+')', right=sg(n*a)+inn+(n-1===1?'':sup[n-1]), wrong=uniq(right,[sg(n)+inn+(n-1===1?'':sup[n-1]),sg(n*a)+inn+sup[n],sg(a)+inn+(n-1===1?'':sup[n-1]),sg(n)+'('+sg(a)+')'+(n-1===1?'':sup[n-1])],3);
    return {index:'q:13j.byhand['+a+';'+b+';'+n+']', lines:[['f(x) = '+inn+sup[n],'an inside and an outside']], ask:'What is f′(x)?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The outside is a power: its slope, taken where the inside stands, is '+n+inn+(n-1===1?'':sup[n-1])+'. The inside is a line with slope '+sg(a)+'. Rates through a chain multiply: '+n+' · '+par10(a)+' = '+sg(n*a)+'.'}; }});

/* ---------- 13k The Tangent Line and the Nearby Line ---------- */
QP.push({id:'13k.tangent',step:'13k',mode:'work',label:'the tangent line',open:()=>measured('13k'),make(){
    if(Math.random()<0.55){ const cube=Math.random()<0.4, x0=pick([-3,-2,-1,1,2,3]), f=cube?x0**3:x0*x0, m=cube?3*x0*x0:2*x0, b=f-m*x0, right='y = '+lin9(m,b), wrong=uniq(right,['y = '+lin9(m,f),'y = '+lin9(m,-b),'y = '+lin9(f,m),'y = '+lin9(m,0),'y = '+lin9(m,b+1)],3); if(wrong.length<3) return null;
      return {index:'q:13k.tangent[l;'+(cube?3:2)+';'+x0+']', lines:[['f(x) = '+(cube?'x³':'x²'),'at the input '+sg(x0)]], ask:'Which is the tangent line there?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'The tangent line goes through ('+sg(x0)+', '+sg(f)+') with the slope f′('+sg(x0)+') = '+sg(m)+': y = '+sg(f)+' + '+par10(m)+'(x'+pm(-x0)+') = '+lin9(m,b)+'. Its error shrinks faster than the step, and it is the only line through the point that does so.'}; }
    const r=2+rnd(8), h=pick([1,2,-1,3]), est=fadd(fint(r),fr(h,2*r)), right=fshow(est), wrong=uniq(right,[fshow(fadd(fint(r),fr(h,r))),fshow(fadd(fint(r),fr(h,2))),fshow(fint(r)),fshow(fadd(fint(r),fr(1,2*r*h))),fshow(fadd(est,fint(1)))],3); if(wrong.length<3) return null;
    return {index:'q:13k.tangent[n;'+r+';'+h+']', lines:[['√'+(r*r+h),'to be estimated from √'+(r*r)+' = '+r]], ask:'What does the nearby line give?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The nearby line of √ at x₀ is √x₀ + h/(2√x₀) = '+r+' + '+par10(h)+'/'+(2*r)+' = '+right+'. Root’s-nearby-line: this is a little more than the true root, since √ bends downward.'}; }});

/* ---------- 13m Homing in on a Root; How Errors Spread ---------- */
QP.push({id:'13m.newton',step:'13m',mode:'work',label:'a step along the tangent line',open:()=>measured('13m'),make(){
    if(Math.random()<0.6){ const cube=Math.random()<0.4, n=pick(cube?[2,3,5,7,10]:[2,3,5,6,7,10]), x=cube?pick([fint(1),fint(2),fr(3,2)]):pick([fint(1),fint(2),fint(3),fr(3,2)]), fx=fsub(cube?fmul(x,fmul(x,x)):fmul(x,x),fint(n)), d=cube?fmul(fint(3),fmul(x,x)):fmul(fint(2),x), nx=fsub(x,fmul(fx,fr(d.q,d.p))), right=fshow(nx);
      const wrong=uniq(right,[fshow(fadd(x,fmul(fx,fr(d.q,d.p)))),fshow(fsub(x,fx)),fshow(fmul(fx,fr(d.q,d.p))),fshow(fhalf(fadd(x,fint(n)))),fshow(fadd(nx,fint(1)))],3); if(wrong.length<3) return null;
      return {index:'q:13m.newton[s;'+(cube?3:2)+';'+n+';'+fshow(x)+']', lines:[['f(x) = '+(cube?'x³':'x²')+' − '+n,'a zero is wanted'],['the guess '+fshow(x),'slide down the tangent line to the axis']], ask:'What is the next guess?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'The tangent line at the guess meets the axis at x − f(x)/f′(x). Here f('+fshow(x)+') = '+fshow(fx)+' and f′('+fshow(x)+') = '+fshow(d)+', so the next guess is '+right+'. Once a guess is close, each new guess about doubles the number of correct places.'}; }
    const p=2+rnd(3), e=pick([1,2,3]), what=['','','the area of a square','the volume of a cube','a fourth power'][p], right='about '+(p*e)+'%', wrong=uniq(right,['about '+e+'%','about '+(e**p)+'%','about '+(e+p)+'%','about '+fshow(fr(e,p))+'%','about '+(2*p*e)+'%'],3); if(wrong.length<3) return null;
    return {index:'q:13m.newton[e;'+p+';'+e+']', lines:[['a length is measured to within '+e+'%','a relative error'],[what+' is worked from it','a power: '+p]], ask:'How large is the relative error of the result?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Relative-errors: through a power, the relative error is multiplied by the power. '+p+' · '+e+'% = '+(p*e)+'%, for small errors.'}; }});

/* ---------- 13n Units and Standards ---------- */
QP.push({id:'13n.units',step:'13n',mode:'word',label:'the units of a rate',open:()=>measured('13n'),make(){
    if(Math.random()<0.5){ const [story,out,inp]=pick([['A tank’s depth in metres is recorded against the time in minutes.','metres','minute'],['A cart’s distance in kilometres is recorded against the time in hours.','kilometres','hour'],['A wire’s cost in coins is recorded against its length in metres.','coins','metre'],['A balloon’s volume in litres is recorded against its height in metres.','litres','metre'],['A kiln’s heat in degrees is recorded against the time in hours.','degrees','hour']]);
      const right=out+' per '+inp, wrong=[inp+'s per '+out.replace(/s$/,''),out+' times '+inp+'s',out];
      return {index:'q:13n.units[u;'+out+';'+inp+']', a3:['13n.units[rate]',DASH,DASH], story, lines:[], ask:'In what units is the slope of the record?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'Rate-units: a slope is a change of output over a change of input, so it has the units of the output over the units of the input.'}; }
    if(Math.random()<0.5){ const [thing,out,inp,noun]=pick([['A tank’s depth','metres','minute','time'],['A cart’s distance','kilometres','hour','time'],['A wire’s cost','coins','metre','length'],['A balloon’s volume','litres','metre','height'],['A kiln’s heat','degrees','hour','time']]);
      const t1=2+rnd(4), dt=2+rnd(5), y1=2+rnd(9), k=1+rnd(6), dy=k*dt+pick([0,0,1,2].filter(e=>e<dt)), v=fr(dy,dt), right=fshow(v)+' '+out+' per '+inp, wrong=uniq(right,[fshow(fr(dt,dy))+' '+out+' per '+inp,fshow(v)+' '+inp+'s per '+out.replace(/s$/,''),dy+' '+out+' per '+inp,fshow(fr(y1+dy,t1+dt))+' '+out+' per '+inp],3); if(wrong.length<3) return null;
      return {index:'q:13n.units[r;'+out+';'+t1+';'+dt+';'+y1+';'+dy+']', a3:['13n.units[average]',DASH,DASH], story:thing+' goes from '+y1+' '+out+' to '+(y1+dy)+' '+out+' as the '+noun+' goes from '+t1+' '+inp+'s to '+(t1+dt)+' '+inp+'s.', lines:[], ask:'What is the average rate over that stretch?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'A rate is a change of output over a change of input: '+dy+' '+out+' over '+dt+' '+inp+'s is '+right+'. The units are those of the output over those of the input.'}; }
    const ms=pick([5,10,15,20,25,30,35,40]), kmh=ms*18/5, up=Math.random()<0.5, right=up?kmh+' kilometres per hour':ms+' metres per second', wrong=up?[(ms*60)+' kilometres per hour',fshow(fr(ms*5,18))+' kilometres per hour',(ms*1000)+' kilometres per hour']:[(kmh*1000)+' metres per second',fshow(fr(kmh*18,5))+' metres per second',(kmh*60)+' metres per second'];
    return {index:'q:13n.units[c;'+ms+';'+(up?'u':'d')+']', a3:['13n.units[convert]',DASH,DASH], story:'A train moves at '+(up?ms+' metres per second':kmh+' kilometres per hour')+'. There are 1000 metres in a kilometre and 3600 seconds in an hour.', lines:[], ask:'What is that in '+(up?'kilometres per hour':'metres per second')+'?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Conversion: multiply by fractions equal to 1 whose bottoms cancel the old units. '+(up?ms+' · 3600/1000 = '+kmh:kmh+' · 1000/3600 = '+ms)+'. For a rate, the top unit and the bottom unit are each converted.'}; }});

/* ===== Laundry 5, rung 14 (floor 3 pools, stage M): 14a to 14i, what slopes say ===== */
Object.assign(STEPS,{'14a':['r14a','Zero Slope at a Top or Bottom'],'14b':['r14b','Level Ends, a Level Point Between'],'14c':['r14c','The Mean Value Technique'],'14d':['r14d','Zero Slope Means Flat'],'14e':['r14e','Same Slopes, Same Shape Lifted'],
  '14f':['r14f','Crest and Trough'],'14g':['r14g','The Bend and Sketching'],'14h':['r14h','Optimising'],'14i':['r14i','When Top and Bottom Both Vanish, and Growth Races']});
const fac14=r=>r===0?'x':'(x'+pm(-r)+')', eq14=(a,b)=>a===b?a:a+' = '+b;

/* ---------- 14a Zero Slope at a Top or Bottom ---------- */
const A14=[
  ['f has a top at c and a slope at c. What follows?','f′(c) = 0',['f″(c) < 0','f(c) is the greatest value of f on its whole domain','nothing'],'Flat-top: a top or a bottom where there is a slope has the slope 0. A top is greatest among its neighbours only.'],
  ['f′(c) = 0. Must f have a top or a bottom at c?','no: x³ has the slope 0 at 0 and neither there',['yes: a top or a bottom','yes, whenever f is a polynomial','no: the slope is never 0 at a top'],'Flat-top runs one way. Slope 0 puts c on the list of candidates and decides nothing more.'],
  ['Which inputs are the critical points of f?','those inside the domain where the slope is 0 or there is no slope',['those where the slope is 0, and no others','those where f is 0','the ends of the domain'],'A top or bottom inside has slope 0 or no slope. Either way it is on the list.'],
  ['f is continuous on [α, β]. Where can its greatest value be reached?','at α, at β, or at a critical point inside',['only at a critical point inside','only at α or at β','only where the slope is 0'],'Candidates: highest-and-lowest gives a greatest value, and flat-top says an inside one is at a critical point.']];
QP.push({id:'14a.flat',step:'14a',label:'flat at a top',open:()=>measured('14a'),make(){ return writtenQ('14a.flat',A14); }},
  {id:'14a.candidates',step:'14a',mode:'work',label:'the candidates',open:()=>measured('14a'),make(){
    const c=pick([1,1,2]), k=rnd(9)-4, lo=-c-rnd(3), hi=lo+2+rnd(5), top=Math.random()<0.5, cs=[1,0,-3*c*c,k], f=x=>ev9(cs,x), cand=[lo,hi]; if(-c>lo&&-c<hi) cand.push(-c); if(c>lo&&c<hi) cand.push(c);
    const vals=cand.map(f), best=top?Math.max(...vals):Math.min(...vals), other=top?Math.min(...vals):Math.max(...vals), right=sg(best), wrong=num13(right,vals.concat([other,k,f(0)+1,best+(top?2:-2),-best,best+(top?c:-c)])); if(wrong.length<3) return null;
    return {index:'q:14a.candidates['+[c,k,lo,hi,top?'t':'b'].join(';')+']', lines:[['f(x) = '+poly13(cs),'on ['+sg(lo)+', '+sg(hi)+']']], ask:'What is the '+(top?'greatest':'least')+' value of f there?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'f′(x) = '+poly13(dp13(cs))+' is 0 at '+sg(-c)+' and at '+c+'. The candidates are the two ends and the critical points inside: '+cand.map(x=>'f('+sg(x)+') = '+sg(f(x))).join(', ')+'. The '+(top?'greatest':'least')+' of these is '+right+'.'}; }});

/* ---------- 14b Level Ends, a Level Point Between ---------- */
const B14=[
  ['|x| on [−1, 1] has level ends and no slope 0 inside. Which hypothesis fails?','a slope at every input inside: there is none at 0',['continuity on [−1, 1]','equal values at the ends','none: the technique fails here'],'Take away the slope at one input and the conclusion can fail. The bottom of |x| is at 0, where flat-top cannot be cited.'],
  ['Level-ends gives a c inside with f′(c) = 0. How many does it promise?','at least one',['exactly one','exactly one, at the middle','one for each end'],'The technique says some c. x³ − x on [−1, 1] has two, and neither is the middle.'],
  ['f′(c) = 0 for some c inside (α, β). Does f(α) = f(β) follow?','no: x³ on [−1, 2] has the slope 0 at 0 and unequal ends',['yes','yes, whenever f is continuous','no: a slope inside is never 0'],'Level-ends runs from equal ends to a level point, and not back.'],
  ['A polynomial’s slope has at most k zeros. What does zeros-of-slopes, turned about, say?','the polynomial has at most k + 1 zeros',['the polynomial has at most k zeros','the polynomial has exactly k + 1 zeros','the polynomial has at least k + 1 zeros'],'Between each neighbouring pair of zeros of p there is a zero of p′. More than k + 1 zeros of p would force more than k zeros of p′.']];
QP.push({id:'14b.needs',step:'14b',label:'each hypothesis is needed',open:()=>measured('14b'),make(){ return writtenQ('14b.needs',B14); }},
  {id:'14b.zeros',step:'14b',mode:'work',label:'counting zeros by slopes',open:()=>measured('14b'),make(){
    const k=rnd(3);
    if(k===0){ const n=2+rnd(6), right=String(n-1), wrong=uniq(right,[String(n),String(n+1),String(n-2),String(2*n)],3);
      return {index:'q:14b.zeros[f;'+n+']', lines:[['a polynomial p has '+n+' different zeros','given']], ask:'At least how many zeros has p′?', right, opts:shuffle([right,...wrong]), lead:'', why:'Zeros-of-slopes: level-ends puts a zero of p′ strictly between each neighbouring pair of zeros of p. '+n+' zeros have '+(n-1)+' gaps between neighbours.'}; }
    if(k===1){ const n=rnd(6), right=String(n+1), wrong=uniq(right,[String(n),String(n+2),String(2*n+2),String(n+3)],3);
      return {index:'q:14b.zeros[b;'+n+']', lines:[['the slope p′ of a polynomial p has '+(n===0?'no zeros':'at most '+n+' zero'+(n===1?'':'s')),'given']], ask:'At most how many zeros has p?', right, opts:shuffle([right,...wrong]), lead:'', why:'Zeros-of-slopes, turned about: '+(n+2)+' zeros of p would force '+(n+1)+' zeros of p′, one between each neighbouring pair.'}; }
    const a=1+rnd(6), b=rnd(13)-6, cs=[1,0,a,b], right='exactly one', opts=['none','exactly one','exactly two','exactly three'];
    return {index:'q:14b.zeros[c;'+a+';'+b+']', lines:[['p(x) = '+poly13(cs),'a polynomial of odd degree']], ask:'How many zeros has p?', right, opts, lead:'', why:'p′(x) = '+poly13(dp13(cs))+' is at least '+a+', so it has no zeros, and p has at most one. A polynomial of odd degree has at least one (12a). So exactly one.'}; }},
  {id:'14b.licensed',step:'14b',mode:'proof',label:'is the level point licensed',open:()=>measured('14b'),make(){
    const a=rnd(7)-3, b=a+1+rnd(4), k=rnd(5), u=rnd(11)-5, v=k===1?u+pick([-3,-2,-1,1,2,3]):u, ok=k===0||k===4, opts=['it is licensed','it is not licensed'], I='['+sg(a)+', '+sg(b)+']', J='('+sg(a)+', '+sg(b)+')';
    return {index:'q:14b.licensed['+[a,b,u,v,k].join(';')+']', stack:true, lines:[[k===2?'f is continuous on '+J+', and not at '+sg(b):'f is continuous on '+I,'given'],[k===3?'f has a slope at every input of '+J+' but one':'f has a slope at every input of '+J,'given'],['f('+sg(a)+') = '+sg(u)+' and f('+sg(b)+') = '+sg(v),'given'],['f′(c) = 0 for some c with '+sg(a)+' < c < '+sg(b),'the level-ends technique, on lines 1 to 3']], ask:'Is line 4 licensed?', right:opts[ok?0:1], opts, lead:'',
      why:ok?'f is continuous on the closed interval, has a slope at every input inside, and its end values are equal. Those are the three hypotheses.':k===1?'The end values differ. Average-slope still gives a c whose slope is the chord slope, and that is not 0 here.':k===2?'Without continuity at the end, highest-and-lowest cannot be cited: x on [0, 1) with the value 0 put at 1 has level ends and the slope 1 everywhere inside.':'One input without a slope is enough: |x| on [−1, 1] has level ends, and its bottom is at the one input where it has no slope.'}; }});

/* ---------- 14c The Mean Value Technique ---------- */
QP.push({id:'14c.average',step:'14c',mode:'work',label:'the average slope',open:()=>measured('14c'),make(){
    const a=rnd(7)-3, d=1+rnd(5), b=a+d, u=rnd(13)-6;
    if(Math.random()<0.5){ const v=u+pick([-9,-7,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,8,9]), s=fr(v-u,d), right=fshow(s), wrong=uniq(right,[fshow(fint(v-u)),fshow(fneg(s)),fshow(fr(u+v,2)),fshow(fr(d,v-u)),fshow(fint(0)),fshow(fadd(s,fint(1)))],3); if(wrong.length<3) return null;
      return {index:'q:14c.average[s;'+[a,b,u,v].join(';')+']', lines:[['f is continuous on ['+sg(a)+', '+sg(b)+'], with a slope at every input inside','given'],['f('+sg(a)+') = '+sg(u)+' and f('+sg(b)+') = '+sg(v),'given']], ask:'Which slope must f have at some input between?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'Average-slope: some c inside has f′(c) equal to the chord slope, ('+sg(v)+' − '+par10(u)+')/('+sg(b)+' − '+par10(a)+') = '+right+'.'}; }
    const K=1+rnd(5), most=Math.random()<0.5, v=most?u+K*d:u-K*d, right=sg(v), wrong=num13(right,[most?u-K*d:u+K*d,u+K,K*d,u+K+d,u*K,v+(most?1:-1),u-K]); if(wrong.length<3) return null;
    return {index:'q:14c.average[b;'+[a,b,u,K,most?'m':'l'].join(';')+']', lines:[['f is continuous on ['+sg(a)+', '+sg(b)+'], and |f′(x)| ≤ '+K+' at every input inside','given'],['f('+sg(a)+') = '+sg(u),'given']], ask:'What is the '+(most?'most':'least')+' that f('+sg(b)+') can be?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Slope-bound: |f('+sg(b)+') − f('+sg(a)+')| ≤ '+K+' · '+d+' = '+(K*d)+'. So f('+sg(b)+') lies from '+sg(u-K*d)+' to '+sg(u+K*d)+'.'}; }},
  {id:'14c.speed',step:'14c',mode:'word',label:'the average speed is a speed',open:()=>measured('14c'),make(){
    const [who,dist,time]=pick([['A cart','kilometres','hour'],['A barge','kilometres','hour'],['A runner','metres','second'],['A lift','metres','second']]), T=2+rnd(5);
    if(Math.random()<0.5){ const D=T*(2+rnd(8))+pick([0,0,1]), s=fr(D,T), u=' '+dist+' per '+time, right=fshow(s)+u, wrong=uniq(right,[D*T+u,fshow(fr(T,D))+u,D+u,fshow(fr(D,2*T))+u,(D+T)+u],3); if(wrong.length<3) return null;
      return {index:'q:14c.speed[a;'+who+';'+D+';'+T+']', a3:['14c.speed[average]',DASH,DASH], story:who+' covers '+D+' '+dist+' in '+T+' '+time+'s. Its position has a velocity at every instant.', lines:[], ask:'Which velocity did it have at some instant?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'The average velocity is the chord slope, '+eq14(D+'/'+T,fshow(s))+'. Average-slope: at some instant between, the velocity was exactly that.'}; }
    const K=3+rnd(10), u=' '+dist, right=(K*T)+u, wrong=uniq(right,[(K+T)+u,K+u,fshow(fr(K,T))+u,(K*T*2)+u,(K*(T-1))+u],3); if(wrong.length<3) return null;
    return {index:'q:14c.speed[b;'+who+';'+K+';'+T+']', a3:['14c.speed[bound]',DASH,DASH], story:who+' moves for '+T+' '+time+'s, and its speed is never more than '+K+' '+dist+' per '+time+'.', lines:[], ask:'At most how far is it from where it began?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Slope-bound: a bound on every slope bounds the change. '+K+' '+dist+' per '+time+' times '+T+' '+time+'s is '+(K*T)+' '+dist+'.'}; }});

/* ---------- 14d Zero Slope Means Flat ---------- */
const D14=[
  ['f has the slope 0 at every input of an interval. What follows?','f is constant on the interval',['f is 0 on the interval','f is increasing on the interval','nothing'],'Zero-slope-is-constant: for any two inputs, average-slope gives a chord slope equal to some slope between, which is 0.'],
  ['f has the slope 0 at every input of its domain, and the domain is two separate intervals. Must f be constant?','no: it may hold one value on each interval',['yes','yes, whenever f has a slope everywhere','no: its slope must somewhere differ from 0'],'The technique speaks of an interval. Across a break there is no chord to apply average-slope to.'],
  ['x³ is increasing on ℝ. Is its slope positive at every input?','no: the slope is 0 at 0, and one such input does no harm',['yes','no: x³ is not increasing on ℝ','no: its slope is negative left of 0'],'Positive-but-finitely: a slope positive at every input but finitely many, where it is 0, still gives an increasing function.'],
  ['To prove f(x) ≥ g(x) for every x ≥ w, what is enough?','the gap f − g is at least 0 at w, and its slope is at least 0 after w',['f′(x) ≥ g′(x) for every x ≥ w','f(w) ≥ g(w)','f and g are both increasing'],'Slope-sign-order on the gap: it starts at least 0 and never falls.']];
QP.push({id:'14d.constant',step:'14d',label:'flat, rising, falling',open:()=>measured('14d'),make(){ return writtenQ('14d.constant',D14); }},
  {id:'14d.sign',step:'14d',mode:'work',label:'the sign of the slope',open:()=>measured('14d'),make(){
    const r=rnd(7)-4, s=r+1+rnd(4), a=pick([-3,-2,-1,1,2,3]), inc=Math.random()<0.5, mid=(a<0)===inc, opts=['between '+sg(r)+' and '+sg(s),'left of '+sg(r)+' and right of '+sg(s),'left of '+sg(r)+' only','right of '+sg(s)+' only'], right=opts[mid?0:1];
    return {index:'q:14d.sign['+[a,r,s,inc?'i':'d'].join(';')+']', lines:[['f′(x) = '+(a===1?'':a===-1?'−':sg(a))+fac14(r)+fac14(s),'at every real']], ask:'Where is f '+(inc?'increasing':'decreasing')+'?', right, opts, lead:'',
      why:'Between '+sg(r)+' and '+sg(s)+' the two factors have different signs, and outside they have the same sign. With the '+(a>0?'positive':'negative')+' number in front, f′ is '+(a>0?'negative':'positive')+' between and '+(a>0?'positive':'negative')+' outside. Slope-sign-order: f is '+(inc?'increasing':'decreasing')+' where f′ is '+(inc?'positive':'negative')+'.'}; }});

/* ---------- 14e Same Slopes, Same Shape Lifted ---------- */
const E14=[
  ['f and g have the same slope at every input of an interval. What follows?','f = g + C on the interval, for some real C',['f = g on the interval','f = C · g on the interval, for some real C','nothing'],'Same-slopes: the difference f − g has slope 0 on the interval, so it is constant.'],
  ['What does “+ C” say in an antiderivative?','there is a whole family: one antiderivative for each real C',['there is an error still to be found','the antiderivative is known only near 0','C is a constant that may be dropped'],'All-antiderivatives: if F is one, the antiderivatives on an interval are exactly the functions F + C.'],
  ['F′ is known on an interval, and one value of F is known. How many functions fit?','exactly one',['one for each real C','none','two'],'The family F + C has one member through each height at a given input. The one value picks C.'],
  ['F″ is known on an interval. How many constants does F carry?','two',['one','none','three'],'Each run backwards from a slope brings one constant. Two values, or a value and a slope, pick them.']];
QP.push({id:'14e.same',step:'14e',label:'the family + C',open:()=>measured('14e'),make(){ return writtenQ('14e.same',E14); }},
  {id:'14e.anti',step:'14e',mode:'work',label:'the antiderivative through a point',open:()=>measured('14e'),make(){
    const cube=Math.random()<0.4, C=pick([-5,-4,-3,-2,-1,1,2,3,4,5]), F=cube?[pick([1,1,2,-1]),rnd(5)-2,rnd(7)-3,C]:[pick([1,2,3,-1,-2]),rnd(9)-4,C], x0=pick([-2,-1,0,1,2]), v=ev9(F,x0), f=dp13(F), withC=c=>poly13(F.slice(0,-1).concat([c]));
    const right=withC(C), wrong=uniq(right,[withC(0),withC(v),withC(-C),withC(C+x0),poly13(dp13(f)),withC(C+1)],3); if(wrong.length<3) return null;
    return {index:'q:14e.anti['+right+';'+x0+']', lines:[['F′(x) = '+poly13(f),'at every real'],['F('+sg(x0)+') = '+sg(v),'given']], ask:'Which is F(x)?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Run the slope rules backwards term by term: F(x) = '+withC(0).replace(/^0$/,'')+' + C. All-antiderivatives: every antiderivative has that shape. F('+sg(x0)+') = '+sg(v)+' gives C = '+sg(C)+'.'}; }});

/* ---------- 14f Crest and Trough ---------- */
QP.push({id:'14f.test',step:'14f',mode:'work',label:'the two tests',open:()=>measured('14f'),make(){
    const c=rnd(11)-5;
    if(Math.random()<0.55){ const k=rnd(5), d=k===3?pick([-4,-3,-2,-1,1,2,3,4]):0, e=k===0?1+rnd(6):k===1?-1-rnd(6):k===2?0:pick([-5,-3,-1,2,4,6]), opts=['a bottom','a top','neither: the slope there is not 0','the second test does not decide'], right=d!==0?opts[2]:e===0?opts[3]:e>0?opts[0]:opts[1];
      return {index:'q:14f.test[2;'+[c,d,e].join(';')+']', lines:[['f′('+sg(c)+') = '+sg(d),'given'],['f″('+sg(c)+') = '+sg(e),'given']], ask:'What has f at '+sg(c)+'?', right, opts, lead:'',
        why:d!==0?'A top or bottom where there is a slope has the slope 0 (flat-top). Here the slope is '+sg(d)+', whatever the second slope is.':e===0?'The second test speaks only when f″(c) is not 0. x⁴ has a bottom at 0 and x³ has neither, both with f″(0) = 0. Fall back on the signs of f′.':'Second-test: f′(c) = 0 and f″(c) '+(e>0?'> 0 give a bottom':'< 0 give a top')+'. The slope is '+(e>0?'rising':'falling')+' through 0 there.'}; }
    const l=pick([1,-1]), r=pick([1,-1]), opts=['a bottom','a top','neither','the first test does not decide'], right=l===r?opts[2]:l<0?opts[0]:opts[1], sn=x=>x>0?'> 0':'< 0';
    return {index:'q:14f.test[1;'+[c,l,r].join(';')+']', lines:[['f is continuous around '+sg(c),'given'],['f′ '+sn(l)+' just left of '+sg(c)+', and f′ '+sn(r)+' just right of it','given']], ask:'What has f at '+sg(c)+'?', right, opts, lead:'',
      why:'First-test: '+(l===r?'f′ has one sign on both sides, so f '+(l>0?'climbs':'falls')+' through '+sg(c)+': neither.':l<0?'f falls to '+sg(c)+' and climbs after it: a bottom.':'f climbs to '+sg(c)+' and falls after it: a top.')+' The test needs no slope at '+sg(c)+' itself.'}; }});

/* ---------- 14g The Bend and Sketching ---------- */
QP.push({id:'14g.bend',step:'14g',mode:'work',label:'where the bend turns',open:()=>measured('14g'),make(){
    const a=pick([1,1,-1,2]), k=pick([-3,-2,-1,1,2,3]), cs=[a,3*a*k,rnd(9)-4,rnd(9)-4], d2=dp13(dp13(cs));
    if(Math.random()<0.5){ const right='at '+sg(-k), wrong=uniq(right,['at '+sg(k),'at '+sg(-3*k),'at 0','at '+sg(-2*k),'there is none'],3);
      return {index:'q:14g.bend[i;'+poly13(cs)+']', lines:[['f(x) = '+poly13(cs),'at every real']], ask:'Where is the inflection point of f?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'f″(x) = '+poly13(d2)+' is 0 at '+sg(-k)+' and changes sign there, so the bend turns. A zero of f″ alone is not enough: the sign must change.'}; }
    const up=Math.random()<0.5, opts=['right of '+sg(-k),'left of '+sg(-k),'everywhere','nowhere'], right=opts[(a>0)===up?0:1];
    return {index:'q:14g.bend[u;'+poly13(cs)+';'+(up?'u':'d')+']', lines:[['f(x) = '+poly13(cs),'at every real']], ask:'Where does f bend '+(up?'up':'down')+'?', right, opts, lead:'',
      why:'f″(x) = '+poly13(d2)+' is positive '+(a>0?'right':'left')+' of '+sg(-k)+' and negative '+(a>0?'left':'right')+' of it. Bends-up: where f″ > 0 the slope f′ is increasing and f bends up. Where f″ < 0, f bends down.'}; }});

/* ---------- 14h Optimising ---------- */
QP.push({id:'14h.equal',step:'14h',mode:'work',label:'two parts that pull apart',open:()=>measured('14h'),make(){
    const m=1+rnd(6), t=2+rnd(9), k=m*t*t, where=Math.random()<0.5, right=String(where?t:2*m*t), wrong=uniq(right,(where?[t*t,2*t,m*t,k,t+1,2*m*t]:[m*t,k+m,2*m*t*t,4*m*t,t,k]).map(String),3); if(wrong.length<3) return null;
    return {index:'q:14h.equal['+[k,m,where?'w':'v'].join(';')+']', lines:[['C(x) = '+k+'/x + '+(m===1?'':m)+'x','for x > 0']], ask:where?'At which x is C least?':'What is the least value of C?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Equal-parts: k/x + mx is least at x = √(k/m) = √'+(t*t)+' = '+t+', where the two parts are equal: '+k+'/'+t+' = '+(m*t)+' and '+(m===1?'':m+' · ')+t+' = '+(m*t)+'. The least value is 2√(km) = '+(2*m*t)+'.'}; }},
  {id:'14h.fare',step:'14h',mode:'word',label:'the price that brings in most',open:()=>measured('14h'),make(){
    const [who,things,word]=pick([['A ferry sells','tickets','fare'],['A stall sells','loaves','price'],['A hall sells','seats','price'],['A press sells','pamphlets','price']]), B=pick([10,20,25,40,50]), p=3+rnd(18), A=2*B*p, right=p+' coins', wrong=uniq(right,[(2*p)+' coins',B+' coins',(p+1)+' coins',Math.round(p/2)+' coins',(p*B)+' coins'],3); if(wrong.length<3) return null;
    return {index:'q:14h.fare['+[things,A,B].join(';')+']', a3:['14h.fare',DASH,DASH], story:who+' '+A+' − '+B+'p '+things+' a day at a '+word+' of p coins, for p from 0 to '+(2*p)+'.', lines:[], ask:'Which '+word+' brings in the most money?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The goal is the money in, p('+A+' − '+B+'p) = '+A+'p − '+B+'p². Its slope '+A+' − '+(2*B)+'p is 0 at p = '+p+'. The ends bring in 0 and the critical point brings in '+(p*(A-B*p))+', so by candidates it is the greatest.'}; }});

/* ---------- 14i When Top and Bottom Both Vanish, and Growth Races ---------- */
const I14=[
  ['What is checked first, before the slope-ratio technique is used?','the form: top and bottom must both head to 0',['that the top has a limit','that the quotient has a slope','nothing: it applies to every fraction'],'(x + 1)/(x + 2) at 0 is not 0/0. Its limit is 1/2 by substitution, and the ratio of slopes would say 1.'],
  ['Which ratio does the slope-ratio technique take?','the slope of the top over the slope of the bottom',['the slope of the quotient','the top over the slope of the bottom','the slope of the bottom over the slope of the top'],'f′/g′, each slope taken separately. The slope of the quotient f/g is another thing (quotient for slopes).'],
  ['f′(x)/g′(x) has no limit. What does the technique say about f(x)/g(x)?','nothing: another road may still find the limit',['it has no limit','it heads to 0','it passes every bound'],'The technique runs one way: if the ratio of slopes heads to L, so does the ratio. Otherwise it is silent.'],
  ['When does g outgrow f?','when f(x)/g(x) heads to 0 far out',['when g(x) > f(x) far out','when g(x) − f(x) passes every bound','when g′(x) > f′(x) far out'],'2x is above x far out and their difference passes every bound, yet x/2x heads to 1/2: a tie, in the sense of the ratio.']];
QP.push({id:'14i.race',step:'14i',label:'the form and the race',open:()=>measured('14i'),make(){ return writtenQ('14i.race',I14); }},
  {id:'14i.ratio',step:'14i',mode:'work',label:'the ratio of slopes',open:()=>measured('14i'),make(){
    const w=pick([-3,-2,-1,1,2,3]), a=rnd(9)-4, b=rnd(9)-4; if(a===b||w+b===0||w+a===0) return null;
    if(Math.random()<0.7){ const f=[1,a-w,-a*w], g=[1,b-w,-b*w], v=fr(w+a,w+b), right=fshow(v), wrong=uniq(right,[fshow(fr(w+b,w+a)),fshow(fneg(v)),fshow(fint(1)),fshow(fint(0)),fshow(fr(a*w,b*w===0?1:b*w)),fshow(fadd(v,fint(1)))],3); if(wrong.length<3) return null;
      return {index:'q:14i.ratio[z;'+[w,a,b].join(';')+']', lines:[['f(x) = '+poly13(f),'the top'],['g(x) = '+poly13(g),'the bottom']], ask:'To which real does f(x)/g(x) head as x heads to '+sg(w)+'?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'f('+sg(w)+') = 0 and g('+sg(w)+') = 0: the form is 0/0. Slope-ratio: f′(x)/g′(x) = ('+poly13(dp13(f))+')/('+poly13(dp13(g))+') heads to '+eq14(par10(w+a)+'/'+par10(w+b),right)+'. Factoring out (x'+pm(-w)+') agrees.'}; }
    const v=fr(w+a,w+b), right=fshow(v), wrong=uniq(right,[fshow(fint(1)),fshow(fr(w+b,w+a)),fshow(fint(0)),fshow(fr(a,b===0?1:b)),fshow(fneg(v))],3); if(wrong.length<3) return null;
    return {index:'q:14i.ratio[n;'+[w,a,b].join(';')+']', lines:[['f(x) = '+lin9(1,a),'the top'],['g(x) = '+lin9(1,b),'the bottom']], ask:'To which real does f(x)/g(x) head as x heads to '+sg(w)+'?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The bottom heads to '+sg(w+b)+', not 0, so the form is not 0/0 and substitution decides: '+eq14(par10(w+a)+'/'+par10(w+b),right)+'. The ratio of the slopes is 1, and the technique does not apply here.'}; }});

/* ===== Laundry 5, rung 15 (floor 3 pools, stage N): 15a to 15i, areas by sums ===== */
Object.assign(STEPS,{'15a':['r15a','Partitions, Lower and Upper Sums'],'15b':['r15b','Every Under-Estimate Is Below Every Over-Estimate'],'15c':['r15c','Integrable, and the Sign ∫'],'15d':['r15d','The Area Under x, Worked to the End'],'15e':['r15e','Areas Add, Scale, Split'],
  '15f':['r15f','Every Continuous Curve Has an Area'],'15g':['r15g','Sums and Σ by Hand'],'15h':['r15h','Sums of Thin Strips by Hand'],'15i':['r15i','Geometric Sums']});
const sub15=n=>String(n).split('').map(ch=>ch==='-'?'₋':'₀₁₂₃₄₅₆₇₈₉'[+ch]).join(''), sup15=n=>String(n).split('').map(ch=>ch==='-'?'⁻':'⁰¹²³⁴⁵⁶⁷⁸⁹'[+ch]).join('');
const int15=(u,v,b)=>'∫'+sub15(u)+sup15(v)+' '+b, fsum15=xs=>xs.reduce((s,x)=>fadd(s,x),fint(0)), fs15=xs=>uniq('',xs.map(fshow),9), plus15=xs=>xs.map(fshow).join(' + ').replace(/\+ −/g,'− ');

/* ---------- 15a Partitions, Lower and Upper Sums ---------- */
const A15=[
  ['What is the area of the box [p, q] × [c, d]?','(q − p)(d − c)',['(q − p) + (d − c)','qd − pc','(q − c)(d − p)'],'Box-area: width times height. It is an axiom, one of three that say what area must obey.'],
  ['On a piece where f is decreasing, where is its least value on the piece?','at the right end of the piece',['at the left end of the piece','at the middle of the piece','it has none'],'The least is at the left end only where f is increasing on the piece. For a falling f the ends trade places.'],
  ['The region under f has an area A obeying the area axioms. Which holds for every partition P?','L(f, P) ≤ A ≤ U(f, P)',['L(f, P) = A','A ≤ L(f, P)','U(f, P) ≤ A'],'Boxes-trap-the-area: the lower boxes lie inside the region and the region lies inside the upper boxes.'],
  ['Which list is a partition of [0, 1]?','0, 1/3, 1/2, 1',['0, 1/2, 1/2, 1','1/4, 1/2, 1','0, 1/2, 3/4'],'A partition is a finite list from the left end to the right end, strictly increasing: no piece of width 0.']];
QP.push({id:'15a.boxes',step:'15a',label:'boxes and partitions',open:()=>measured('15a'),make(){ return writtenQ('15a.boxes',A15); }},
  {id:'15a.sums',step:'15a',mode:'work',label:'a lower or an upper sum',open:()=>measured('15a'),make(){
    const u=rnd(3), n=2+rnd(3), h=Math.random()<0.4?fr(1,2):fint(1), k=rnd(3), c=rnd(5), m=1+rnd(3), K=10+rnd(11), low=Math.random()<0.5;
    const f=x=>k===0?fadd(fmul(x,x),fint(c)):k===1?fadd(fmul(fint(m),x),fint(c)):fsub(fint(K),fmul(x,x)), ex=k===0?poly13([1,0,c]):k===1?lin9(m,c):K+' − x²', inc=k!==2;
    const xs=[]; for(let i=0;i<=n;i++) xs.push(fadd(fint(u),fmul(fint(i),h))); const vs=xs.map(f), lefts=vs.slice(0,n), rights=vs.slice(1), SL=fmul(h,fsum15(lefts)), SR=fmul(h,fsum15(rights)), useLeft=inc===low, R=useLeft?SL:SR, O=useLeft?SR:SL, right=fshow(R);
    const wrong=uniq(right,[fshow(O),fshow(fsum15(useLeft?lefts:rights)),fshow(fmul(h,fsum15(vs))),fshow(fhalf(fadd(SL,SR))),fshow(fadd(R,h)),fshow(fsub(O,R))],3); if(wrong.length<3) return null;
    return {index:'q:15a.sums['+[ex,u,n,fshow(h),low?'L':'U'].join(';')+']', lines:[['f(x) = '+ex,'on ['+u+', '+fshow(xs[n])+'], in '+n+' equal pieces']], ask:'What is the '+(low?'lower':'upper')+' sum?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'f is '+(inc?'increasing':'decreasing')+' there, so on each piece its '+(low?'least':'greatest')+' value is at the '+(useLeft?'left':'right')+' end. The width '+fshow(h)+' times ('+plus15(useLeft?lefts:rights)+') is '+right+'.'}; }});

/* ---------- 15b Every Under-Estimate Is Below Every Over-Estimate ---------- */
const B15=[
  ['Q refines P. Which chain holds?','L(f, P) ≤ L(f, Q) ≤ U(f, Q) ≤ U(f, P)',['L(f, Q) ≤ L(f, P) ≤ U(f, P) ≤ U(f, Q)','L(f, P) ≤ U(f, P) ≤ L(f, Q) ≤ U(f, Q)','L(f, P) = L(f, Q) and U(f, P) = U(f, Q)'],'Refining-tightens: more points, kept from P, can only raise the lower sum and lower the upper sum.'],
  ['P and Q are any two partitions of [u, v]. What is sure?','L(f, P) ≤ U(f, Q)',['L(f, P) ≤ L(f, Q)','U(f, P) ≤ U(f, Q)','nothing, unless one refines the other'],'Every-lower-below-every-upper: pass through the common refinement, which refines both.'],
  ['Q has more points than P. Must U(f, Q) ≤ U(f, P)?','no: only when Q refines P',['yes','yes, when the pieces of each are equal','no: more points always loosen the bound'],'Halves and thirds: neither refines the other, and a narrow peak at 1/3 makes the thirds give the larger upper sum.'],
  ['S is a non-empty part of a bounded set T. Which holds?','inf T ≤ inf S ≤ sup S ≤ sup T',['inf S ≤ inf T ≤ sup T ≤ sup S','inf S = inf T and sup S = sup T','inf T ≤ sup T ≤ inf S ≤ sup S'],'Smaller-set-tighter-bound: every bound of T is a bound of S, and S may have tighter ones.']];
QP.push({id:'15b.chain',step:'15b',label:'refining tightens',open:()=>measured('15b'),make(){ return writtenQ('15b.chain',B15); }},
  {id:'15b.refine',step:'15b',mode:'work',label:'the common refinement',open:()=>measured('15b'),make(){
    const pool=[fr(1,4),fr(1,3),fr(1,2),fr(2,3),fr(3,4)], set=xs=>'{'+[fint(0),...xs.slice().sort((a,b)=>a.p*b.q-b.p*a.q),fint(1)].map(fshow).join(', ')+'}', has=(xs,x)=>xs.some(y=>fsame(x,y));
    const P=take(pool,1+rnd(2)), Q=take(pool,1+rnd(3)), U=P.concat(Q.filter(x=>!has(P,x))), I=P.filter(x=>has(Q,x));
    if(Math.random()<0.55){ const right=set(U), wrong=uniq(right,[set(I),set(P),set(Q),set(U.slice(1)),set(U.concat(pool.filter(x=>!has(U,x)).slice(0,1))),set(pool)],3); if(wrong.length<3||U.length===P.length||U.length===Q.length) return null;
      return {index:'q:15b.refine[c;'+set(P)+';'+set(Q)+']', lines:[['P = '+set(P),'a partition of [0, 1]'],['Q = '+set(Q),'a partition of [0, 1]']], ask:'Which is the common refinement of P and Q?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'The common refinement has the points of P and the points of Q together, in increasing order. It refines both, which is what lets every lower sum be compared with every upper sum.'}; }
    const ok=I.length===P.length, opts=['yes: every point of P is a point of Q','no: P has a point that Q lacks','yes: Q has more points','no: Q has fewer points'], right=opts[ok?0:1];
    return {index:'q:15b.refine[r;'+set(P)+';'+set(Q)+']', lines:[['P = '+set(P),'a partition of [0, 1]'],['Q = '+set(Q),'a partition of [0, 1]']], ask:'Is Q a refinement of P?', right, opts:[opts[0],opts[1],Q.length>P.length?opts[2]:'yes: the two have the same ends',Q.length<P.length?opts[3]:'no: the pieces of Q are not equal'], lead:'',
      why:'Q refines P when every point of P is a point of Q. The count of points decides nothing.'}; }});

/* ---------- 15c Integrable, and the Sign ∫ ---------- */
const C15=[
  ['When is a bounded f integrable on [u, v]?','when its lower integral equals its upper integral',['when it has a lower sum','when its values are never negative','always'],'The lower integral is the sup of the lower sums, the upper integral the inf of the upper sums. Integrable: the two agree.'],
  ['On [0, 1], q is 1 at fractions and 0 elsewhere. Is q integrable?','no: every lower sum is 0 and every upper sum is 1',['yes: its integral is 1/2','yes: its integral is 0','no: q is not bounded'],'Every piece holds a fraction and a non-fraction. The lower integral is 0 and the upper integral is 1.'],
  ['What does the gap-closes technique ask for?','for every ε > 0, some partition with U − L < ε',['for every ε > 0, every partition with U − L < ε','one partition with U = L','equal pieces, and nothing else'],'The definition speaks of all partitions at once. The test asks for one partition for each ε.'],
  ['f is integrable, and a number A lies between L(f, P) and U(f, P) for every partition P. What is A?','the integral of f',['any number between the sums','the lower integral, which may be less than the integral','the average value of f'],'Exactly-one-between: only one number is trapped by every pair of sums.']];
QP.push({id:'15c.integrable',step:'15c',label:'integrable',open:()=>measured('15c'),make(){ return writtenQ('15c.integrable',C15); }},
  {id:'15c.steps',step:'15c',mode:'work',label:'constants and one step',open:()=>measured('15c'),make(){
    const u=rnd(7)-3, d1=1+rnd(4), a=pick([-3,-2,-1,1,2,3,4,5]);
    if(Math.random()<0.4){ const v=u+d1, right=sg(a*d1), wrong=num13(right,[a,a*v,a*(v+u),a+d1,a*d1+a,-a*d1]); if(wrong.length<3) return null;
      return {index:'q:15c.steps[c;'+[a,u,v].join(';')+']', lines:[['f(x) = '+sg(a),'on ['+sg(u)+', '+sg(v)+']']], ask:'What is '+int15(u,v,'f(x) dx')+'?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'On every piece the least and the greatest are both '+sg(a)+', so every lower sum and every upper sum is '+par10(a)+' · ('+sg(v)+' − '+par10(u)+') = '+right+'.'}; }
    const c=u+d1, d2=1+rnd(4), v=c+d2, b=pick([-3,-2,-1,1,2,3,4,5].filter(x=>x!==a)), val=a*d1+b*d2, right=sg(val), wrong=num13(right,[(a+b)*(d1+d2),a+b,a*d1,b*d2,a*d2+b*d1,val+b]); if(wrong.length<3) return null;
    return {index:'q:15c.steps[s;'+[a,b,u,c,v].join(';')+']', lines:[['f = '+sg(a)+' on ['+sg(u)+', '+sg(c)+')','the first stretch'],['f = '+sg(b)+' on ['+sg(c)+', '+sg(v)+']','the second stretch']], ask:'What is '+int15(u,v,'f(x) dx')+'?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'One jump does no harm: a narrow piece around '+sg(c)+' closes the gap. The integral is '+par10(a)+' · '+d1+' + '+par10(b)+' · '+d2+' = '+right+'.'}; }});

/* ---------- 15d The Area Under x, Worked to the End ---------- */
QP.push({id:'15d.line',step:'15d',mode:'work',label:'the area under x',open:()=>measured('15d'),make(){
    const u=rnd(8), v=u+1+rnd(6), R=fr(v*v-u*u,2), right=fshow(R), wrong=uniq(right,[fshow(fr((v-u)*(v-u),2)),fshow(fint(v*v-u*u)),fshow(fr(v-u,2)),fshow(fr(v*v+u*u,2)),fshow(fint(v-u)),fshow(fint(v)),fshow(fint(v*v))],3); if(wrong.length<3) return null;
    return {index:'q:15d.line['+u+';'+v+']', lines:[['f(x) = x','on ['+u+', '+v+']']], ask:'What is '+int15(u,v,'x dx')+'?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The lower and upper sums for n equal pieces differ by (v − u)²/n and trap one number: (v² − u²)/2 = ('+(v*v)+' − '+(u*u)+')/2 = '+right+'. It is not (v − u)²/2 unless u = 0.'}; }},
  {id:'15d.rest',step:'15d',mode:'word',label:'from rest',open:()=>measured('15d'),make(){
    const who=pick(['A sled','A cart','A lift','A barge']), a=pick([2,3,4,5,6,8]), T=2+rnd(6), R=fr(a*T*T,2), right=fshow(R)+' metres', wrong=uniq(right,[(a*T*T)+' metres',(a*T)+' metres',fshow(fr(a*T,2))+' metres',(2*a*T*T)+' metres',fshow(fr(a*a*T,2))+' metres'],3); if(wrong.length<3) return null;
    return {index:'q:15d.rest['+[who,a,T].join(';')+']', a3:['15d.rest',DASH,DASH], story:who+' starts from rest. Its velocity grows steadily, by '+a+' metres per second each second.', lines:[], ask:'How far has it gone after '+T+' seconds?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The distance is the area under the velocity v(t) = '+a+'t from 0 to '+T+': ½ · '+a+' · '+T+'² = '+fshow(R)+'. The final velocity '+(a*T)+' times '+T+' would count a whole box, twice too much.'}; }});

/* ---------- 15e Areas Add, Scale, Split ---------- */
const E15=[
  [int15(0,2,'(x − 1) dx')+' = 0. What does that say?','the area above the axis equals the area below it',['there is no region between the graph and the axis','x − 1 is 0 on [0, 2]','x − 1 is not integrable on [0, 2]'],'The integral is the signed area. The area between the graph and the axis is '+int15(0,2,'|x − 1| dx')+' = 1.'],
  ['Is ∫ fg always ∫ f · ∫ g?','no: on [0, 1], ∫ x · x = 1/3, not 1/2 · 1/2',['yes','yes, whenever f = g','no: a product is never integrable'],'Areas add and scale. Nothing here says they multiply.'],
  ['f and g are integrable on [u, v], and f(x) ≤ g(x) at every x there. What follows?','∫ f ≤ ∫ g',['∫ f < ∫ g','f′ ≤ g′','nothing'],'Smaller-function-smaller-area: g − f is never negative, so its lower sums are at least 0.'],
  ['f takes both signs on [u, v]. What does ∫ f count?','the area above the axis minus the area below it',['the whole area between the graph and the axis','only the area above the axis','nothing: it is not defined'],'f = f⁺ − f⁻, with both parts never negative, and ∫ f = ∫ f⁺ − ∫ f⁻.']];
QP.push({id:'15e.signed',step:'15e',label:'what the rules count',open:()=>measured('15e'),make(){ return writtenQ('15e.signed',E15); }},
  {id:'15e.rules',step:'15e',mode:'work',label:'no new sums',open:()=>measured('15e'),make(){
    const u=rnd(5)-2, d1=1+rnd(3), c=u+d1, d2=1+rnd(3), v=c+d2, A=rnd(13)-6, B=rnd(13)-6, k=rnd(4);
    if(k===0){ const whole=Math.random()<0.5, right=sg(whole?A+B:B), wrong=num13(right,whole?[A-B,A*B,B-A,A+B+1,A,B]:[A+B+A,A-B,-B,A,B+1,A+B]); if(wrong.length<3) return null;
      return {index:'q:15e.rules[s;'+[u,c,v,A,B,whole?'w':'p'].join(';')+']', lines:[[int15(u,c,'f')+' = '+sg(A),'given'],[whole?int15(c,v,'f')+' = '+sg(B):int15(u,v,'f')+' = '+sg(A+B),'given']], ask:'What is '+(whole?int15(u,v,'f'):int15(c,v,'f'))+'?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'Interval-cut-in-two: '+int15(u,v,'f')+' = '+int15(u,c,'f')+' + '+int15(c,v,'f')+'. '+(whole?sg(A)+' + '+par10(B):sg(A+B)+' − '+par10(A))+' = '+right+'.'}; }
    if(k===1){ const m=pick([2,3,4,5]), s=pick([1,-1]), val=m*A+s*B, right=sg(val), wrong=num13(right,[A+s*B,m*(A+s*B),m*A-s*B,m*A*B,m+A+B,val+m]); if(wrong.length<3) return null;
      return {index:'q:15e.rules[l;'+[u,v,A,B,m,s].join(';')+']', lines:[[int15(u,v,'f')+' = '+sg(A),'given'],[int15(u,v,'g')+' = '+sg(B),'given']], ask:'What is '+int15(u,v,'('+m+'f '+(s>0?'+':'−')+' g)')+'?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'Areas-scale and areas-add: '+m+' · '+par10(A)+' '+(s>0?'+':'−')+' '+par10(B)+' = '+right+'.'}; }
    const lo=rnd(7)-3, hi=lo+1+rnd(5), most=Math.random()<0.5, w=v-u, val=(most?hi:lo)*w, right=sg(val), wrong=num13(right,[(most?lo:hi)*w,most?hi:lo,(hi-lo)*w,(hi+lo)*w,val+w,hi*v-lo*u]); if(wrong.length<3) return null;
    return {index:'q:15e.rules[b;'+[u,v,lo,hi,most?'m':'l'].join(';')+']', lines:[[sg(lo)+' ≤ f(x) ≤ '+sg(hi)+' at every x of ['+sg(u)+', '+sg(v)+']','f integrable there']], ask:'What is the '+(most?'most':'least')+' that '+int15(u,v,'f')+' can be?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Smaller-function-smaller-area: m(v − u) ≤ ∫ f ≤ M(v − u). The width is '+w+', so the integral lies from '+sg(lo*w)+' to '+sg(hi*w)+'.'}; }});

/* ---------- 15f Every Continuous Curve Has an Area ---------- */
const F15=[
  ['f is continuous on [u, v]. Is f integrable there?','yes: continuity on a closed interval is enough',['only if f is increasing','only if f is a polynomial','not always'],'Continuous-is-integrable: uniform continuity gives one width that makes every piece’s gap small at once.'],
  ['f is integrable on [u, v]. Must f be continuous there?','no: an increasing function with jumps is integrable',['yes','yes, except at the two ends','no: an integrable function is never continuous'],'Continuity is enough, not needed. For n equal pieces an increasing f has U − L = (f(v) − f(u))(v − u)/n.'],
  ['What does uniform continuity add to continuity at each input?','for each ε, one δ serves every input at once',['for each δ, one ε serves every input at once','a slope at every input','a bound on the values of f'],'The difference is the order of the choices: the δ may not depend on the input.'],
  ['Is 1/x uniformly continuous on (0, 1]?','no: 1/n and 1/(n + 1) draw together while their values stay 1 apart',['yes: it is continuous there','yes: every continuous function is','no: it is not continuous there'],'Evenly-continuous needs a closed interval. On (0, 1] no single δ serves near 0.']];
QP.push({id:'15f.enough',step:'15f',label:'continuity is enough, not needed',open:()=>measured('15f'),make(){ return writtenQ('15f.enough',F15); }},
  {id:'15f.average',step:'15f',mode:'work',label:'the average value',open:()=>measured('15f'),make(){
    const k=rnd(3), u=rnd(5), w=2+rnd(5), v=u+w;
    if(k===0){ const I=pick([-9,-6,-5,-3,3,4,5,6,8,9,10,12,15]), R=fr(I,w), right=fshow(R), wrong=uniq(right,[fshow(fint(I*w)),fshow(fint(I)),fshow(fr(w,I)),fshow(fr(I,v)),fshow(fr(I,2)),fshow(fint(I-w))],3); if(wrong.length<3) return null;
      return {index:'q:15f.average[i;'+[u,v,I].join(';')+']', lines:[[int15(u,v,'f')+' = '+sg(I),'f continuous on ['+u+', '+v+']']], ask:'Which value must f take somewhere on ['+u+', '+v+']?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'Average-height: some c in the interval has f(c) equal to the average value, the integral over the width: '+sg(I)+'/'+w+(fshow(R)===sg(I)+'/'+w?'':' = '+right)+'.'}; }
    if(k===1){ const R=fr(u+v,2), right=fshow(R), wrong=uniq(right,[fshow(fr(v*v-u*u,2)),fshow(fint(u+v)),fshow(fr(v-u,2)),fshow(fint(v)),fshow(fr(v,2)),fshow(fint(u))],3); if(wrong.length<3) return null;
      return {index:'q:15f.average[x;'+u+';'+v+']', lines:[['f(x) = x','on ['+u+', '+v+']']], ask:'What is the average value of f there?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'The integral is (v² − u²)/2 = '+fshow(fr(v*v-u*u,2))+', and the width is '+w+'. Their quotient is (u + v)/2 = '+right+', the value at the middle.'}; }
    const b=1+rnd(6), R=fr(b*b,3), right=fshow(R), wrong=uniq(right,[fshow(fr(b*b*b,3)),fshow(fr(b*b,2)),fshow(fint(b*b)),fshow(fr(b*b,4)),fshow(fr(b,3)),fshow(fr(b,2))],3); if(wrong.length<3) return null;
    return {index:'q:15f.average[q;'+b+']', lines:[['f(x) = x²','on [0, '+b+']']], ask:'What is the average value of f there?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The integral is b³/3 = '+fshow(fr(b*b*b,3))+', and the width is '+b+'. Their quotient is b²/3 = '+right+'.'}; }});

/* ---------- 15g Sums and Σ by Hand ---------- */
const sum15=()=>{ const n=3+rnd(6), k=rnd(6), T=n*(n+1)/2, c=2+rnd(8), a=2+rnd(4), b=1+rnd(6), to=', for i from 1 to '+n;
  return k===0?{t:'Σ (2i − 1)'+to,v:n*n,alts:[n*(n+1),2*n-1,n*n-1,(n+1)*(n+1),T],why:'Odd-numbers-make-squares: the first n odd numbers add to n².',cite:'odd-numbers-make-squares'}
    :k===1?{t:'Σ i²'+to,v:n*(n+1)*(2*n+1)/6,alts:[T*T,n*n,T,n*n*n,n*(n+1)*(2*n+1)/6+n],why:'Sum-of-squares: n(n + 1)(2n + 1)/6.',cite:'sum-of-squares'}
    :k===2?{t:'Σ i³'+to,v:T*T,alts:[n*(n+1)*(2*n+1)/6,n*n*n,T,T*T-n,T*n],why:'Sum-of-cubes: (n(n + 1)/2)², the square of the sum 1 + 2 + ⋯ + n.',cite:'sum-of-cubes'}
    :k===3?{t:'Σ '+c+to,v:n*c,alts:[c,n+c,c*T,(n+1)*c,(n-1)*c],why:'Sums-are-linear: n copies of c add to nc.',cite:'sums-are-linear'}
    :k===4?{t:'Σ ('+a+'i + '+b+')'+to,v:a*T+b*n,alts:[a*T+b,a*n+b,a*n+b*n,a*T,(a+b)*T],why:'Sums-are-linear: '+a+' · (1 + 2 + ⋯ + n) + n · '+b+', with 1 + 2 + ⋯ + n = n(n + 1)/2 = '+T+'.',cite:'sums-are-linear and the doubled sum'}
    :{t:'Σ ((i + 1)² − i²)'+to,v:(n+1)*(n+1)-1,alts:[(n+1)*(n+1),n*n,2*n+1,n*n-1,(n+1)*(n+1)+1],why:'Collapsing-sum: every middle term is added once and taken away once. What is left is (n + 1)² − 1².',cite:'collapsing-sum'}; };
QP.push({id:'15g.sum',step:'15g',mode:'work',label:'sums by hand',open:()=>measured('15g'),make(){
    const s=sum15(), right=String(s.v), wrong=uniq(right,s.alts.map(String),3); if(wrong.length<3) return null;
    return {index:'q:15g.sum['+s.t+']', lines:[[s.t,'a sum']], ask:'What is the sum?', right, opts:shuffle([right,...wrong]), lead:'', why:s.why+' Here that is '+right+'.'}; }},
  {id:'15g.check',step:'15g',mode:'proof',label:'is the sum right',open:()=>measured('15g'),make(){
    const s=sum15(), bad=Math.random()<0.5, alts=uniq(String(s.v),s.alts.map(String),5), shown=bad?pick(alts.slice(0,3)):String(s.v), opts=['it is the sum of line 1','it is not the sum of line 1'];
    return {index:'q:15g.check['+s.t+';'+shown+']', stack:true, lines:[[s.t,'given'],['= '+shown,s.cite+', on line 1']], ask:'Is line 2 right?', right:opts[bad?1:0], opts, lead:'', why:s.why+' Here that is '+s.v+(bad?', not '+shown:'')+'.'}; }});

/* ---------- 15h Sums of Thin Strips by Hand ---------- */
QP.push({id:'15h.strip',step:'15h',mode:'work',label:'left, right and midpoint sums',open:()=>measured('15h'),make(){
    const u=rnd(3), n=2+rnd(3), sq=Math.random()<0.5, c=rnd(5), m=pick([-2,-1,1,2,3]), f=x=>sq?x*x+c:m*x+c, ex=sq?poly13([1,0,c]):lin9(m,c), kind=rnd(3), tags=k=>Array.from({length:n},(_,i)=>u+2*i+k), S=k=>2*tags(k).reduce((s,x)=>s+f(x),0);
    const right=sg(S(kind)), wrong=num13(right,[S((kind+1)%3),S((kind+2)%3),S(kind)/2,S(kind)+2,2*tags(0).concat([u+2*n]).reduce((s,x)=>s+f(x),0),S(kind)-2]); if(wrong.length<3) return null;
    return {index:'q:15h.strip['+[ex,u,n,kind].join(';')+']', lines:[['f(x) = '+ex,'on ['+u+', '+(u+2*n)+'], in '+n+' equal pieces'],['the tags','at the '+['left ends','middles','right ends'][kind]+' of the pieces']], ask:'What is the strip sum?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Each piece has the width 2. The tags are '+tags(kind).join(', ')+', with the heights '+tags(kind).map(x=>sg(f(x))).join(', ')+'. The width times their sum is '+right+'.'}; }},
  {id:'15h.exact',step:'15h',mode:'work',label:'exact areas under powers',open:()=>measured('15h'),make(){
    const k=rnd(3);
    if(k===0){ const u=rnd(4), v=u+1+rnd(3), R=fr(v**3-u**3,3), right=fshow(R), wrong=uniq(right,[fshow(fr((v-u)**3,3)),fshow(fint(v**3-u**3)),fshow(fr(v*v-u*u,2)),fshow(fint(v*v-u*u)),fshow(fr(v**3,3)),fshow(fr(v**3+u**3,3)),fshow(fint(v**3))],3); if(wrong.length<3) return null;
      return {index:'q:15h.exact[2;'+u+';'+v+']', lines:[['f(x) = x²','on ['+u+', '+v+']']], ask:'What is '+int15(u,v,'x² dx')+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'The area under x² from 0 to b is b³/3, and interval-cut-in-two gives (v³ − u³)/3 = ('+(v**3)+' − '+(u**3)+')/3 = '+right+'.'}; }
    if(k===1){ const b=1+rnd(4), R=fr(b**4,4), right=fshow(R), wrong=uniq(right,[fshow(fr(b**3,3)),fshow(fint(b**4)),fshow(fint(3*b*b)),fshow(fr(b**4,3)),fshow(fr(b**3,4)),fshow(fint(b**3))],3); if(wrong.length<3) return null;
      return {index:'q:15h.exact[3;'+b+']', lines:[['f(x) = x³','on [0, '+b+']']], ask:'What is '+int15(0,b,'x³ dx')+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'The squeeze with sum-of-cubes gives b⁴/4 = '+(b**4)+'/4'+(fshow(R)===(b**4)+'/4'?'':' = '+right)+'.'}; }
    const b=1+rnd(3), a=pick([1,2,3,6]), c=pick([-4,-2,0,2,4]), d=rnd(7)-3, cs=[a,c,d], R=fadd(fadd(fr(a*b**3,3),fr(c*b*b,2)),fint(d*b)), right=fshow(R), wrong=uniq(right,[fshow(fint(ev9(cs,b))),fshow(fint(a*b**3+c*b*b+d*b)),fshow(fint(2*a*b+c)),fshow(fadd(R,fint(d))),fshow(fsub(R,fint(d*b))),fshow(fneg(R)),fshow(fadd(R,fint(1)))],3); if(wrong.length<3) return null;
    return {index:'q:15h.exact[p;'+poly13(cs)+';'+b+']', lines:[['f(x) = '+poly13(cs),'on [0, '+b+']']], ask:'What is '+int15(0,b,'f(x) dx')+'?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Areas-add and areas-scale, term by term: '+a+' · '+(b**3)+'/3'+(c?pm(c)+' · '+(b*b)+'/2':'')+(d?pm(d)+' · '+b:'')+' = '+right+'. No new sums are needed.'}; }},
  {id:'15h.readings',step:'15h',mode:'word',label:'an integral from measurements',open:()=>measured('15h'),make(){
    const [what,unit,total]=pick([['A pump’s flow','litres per hour','litres'],['An array’s power','kilowatts','kilowatt-hours'],['A stream’s flow','cubic metres per hour','cubic metres'],['A mill’s output','sacks per hour','sacks']]), w=pick([2,3,4]), n=3+rnd(3), rs=Array.from({length:n},()=>1+rnd(9)), sum=rs.reduce((s,x)=>s+x,0), right=(w*sum)+' '+total, wrong=uniq(right,[sum+' '+total,(sum*n)+' '+total,(w*n*Math.max(...rs))+' '+total,fshow(fr(sum,n))+' '+total,(w*sum+w)+' '+total,(w*n)+' '+total],3); if(wrong.length<3) return null;
    return {index:'q:15h.readings['+[unit,w,rs.join(',')].join(';')+']', a3:['15h.readings',DASH,DASH], story:what+' is read at the middle of each '+w+'-hour stretch, for '+n+' stretches in a row. The readings are '+rs.join(', ')+' '+unit+'.', lines:[], ask:'What does the midpoint sum give for the whole time?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'A strip sum: each reading times the width of its stretch. '+w+' · ('+rs.join(' + ')+') = '+(w*sum)+'. The integral is within U − L of it, and readings alone do not say how large that is.'}; }});

/* ---------- 15i Geometric Sums ---------- */
const I15=[
  ['1 + 2 + 4 + ⋯ : does the endless-ratio-sum technique give 1/(1 − 2) = −1?','no: it needs |r| < 1, and these partial sums pass every bound',['yes','no: the sum is 0','yes, once the signs are turned about'],'For |r| ≥ 1 and c ≠ 0 the series diverges. The formula c/(1 − r) says nothing there.'],
  ['What is the endless sum of a series?','the number its partial sums head to, when there is one',['its last partial sum','all of its terms added at once','its greatest term'],'There is no last term. The mark Σ with ∞ above names a limit of partial sums.'],
  ['What does 0.999… name?','1: the number its truncations head to',['a number just below 1','the greatest number below 1','nothing'],'9/10 · (1 + 1/10 + 1/100 + ⋯) = 9/10 · 1/(1 − 1/10) = 1.'],
  ['For which r does rⁿ head to 0?','for |r| < 1',['for r < 1','for 0 < r ≤ 1','for every r'],'Small-powers-vanish. (−2)ⁿ is below 1 at every odd n and heads to nothing, and 1ⁿ stays at 1.']];
QP.push({id:'15i.endless',step:'15i',label:'endless sums',open:()=>measured('15i'),make(){ return writtenQ('15i.endless',I15); }},
  {id:'15i.ratio',step:'15i',mode:'work',label:'sums by a ratio',open:()=>measured('15i'),make(){
    const k=rnd(5), NO='no sum: the series diverges';
    if(k===0){ const r=pick([2,2,3]), n=5+rnd(r===2?4:2), v=(r**n-1)/(r-1), right=String(v), wrong=uniq(right,[r**n,r**n+1,r**(n-1),v+r,v-1,2*r**(n-1)].map(String),3); if(wrong.length<3) return null;
      return {index:'q:15i.ratio[f;'+r+';'+n+']', lines:[['1 + '+r+' + '+(r*r)+' + ⋯ + '+(r**(n-1)),n+' terms, each '+r+' times the one before']], ask:'What is the sum?', right, opts:shuffle([right,...wrong]), lead:'', why:'Finite-ratio-sum: (1 − rⁿ)/(1 − r) = ('+(r**n)+' − 1)/('+r+' − 1) = '+right+'.'}; }
    if(k===1||k===2){ const c=1+rnd(5), conv=k===1, r=conv?pick([fr(1,2),fr(1,3),fr(2,3),fr(1,4),fr(3,4),fr(-1,2),fr(1,5),fr(-1,3)]):pick([fint(2),fint(3),fint(-1),fint(1),fr(3,2),fint(-2)]), t=[fint(c),fmul(fint(c),r),fmul(fint(c),fmul(r,r))], one=fint(1), form=fsame(r,one)?null:fmul(fint(c),fr(fsub(one,r).q,fsub(one,r).p));
      const right=conv?fshow(form):NO, wrong=uniq(right,(conv?[NO,fshow(fmul(fint(c),fr(fadd(one,r).q,fadd(one,r).p))),fshow(fmul(form,r)),fshow(fint(2*c)),fshow(fsum15(t))]:[form?fshow(form):'0',fshow(fint(c)),'0',fshow(fsum15(t)),fshow(fint(-c))]),3); if(wrong.length<3) return null;
      return {index:'q:15i.ratio[e;'+c+';'+fshow(r)+']', lines:[[plus15(t)+' + ⋯','each term '+fshow(r)+' times the one before, without end']], ask:'What is the endless sum?', right, opts:shuffle([right,...wrong]), lead:'',
        why:conv?'Endless-ratio-sum: |r| < 1, so the sum is c/(1 − r) = '+c+'/('+fshow(fsub(one,r))+') = '+right+'.':'Here |r| ≥ 1, so the terms do not head to 0 and the partial sums head to no number. The formula c/(1 − r) needs |r| < 1.'}; }
    if(k===3){ const ab=10+rnd(89); if(ab%11===0||ab%10===0) return null; const R=fr(ab,99), right=fshow(R), wrong=uniq(right,[fshow(fr(ab,100)),fshow(fr(ab,90)),fshow(fr(ab,999)),fshow(fr(ab+1,99)),fshow(fr(ab,9*11*10))],3); if(wrong.length<3) return null;
      return {index:'q:15i.ratio[d;'+ab+']', lines:[['0.'+ab+ab+ab+'…','the block '+ab+' repeats without end']], ask:'Which fraction is it?', right, opts:shuffle([right,...wrong]), lead:'', why:'It is '+ab+'/100 · (1 + 1/100 + 1/100² + ⋯) = '+ab+'/100 · 1/(1 − 1/100) = '+ab+'/99'+(fshow(R)===ab+'/99'?'':' = '+right)+', by endless-ratio-sum with r = 1/100.'}; }
    const p=2+rnd(4), b=1+rnd(3), R=fr(b**(p+1),p+1), right=fshow(R), wrong=uniq(right,[fshow(fr(b**p,p)),fshow(fint(b**(p+1))),fshow(fint(p*b**(p-1))),fshow(fr(b**(p+1),p)),fshow(fr(b**p,p+1)),fshow(fint(b**p)),fshow(fr(1,p))],3); if(wrong.length<3) return null;
    return {index:'q:15i.ratio[p;'+p+';'+b+']', lines:[['f(x) = x'+sup15(p),'on [0, '+b+']']], ask:'What is '+int15(0,b,'x'+sup15(p)+' dx')+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'Area-under-a-power, by the shrinking cut: bᵏ⁺¹/(k + 1) = '+(b**(p+1))+'/'+(p+1)+(fshow(R)===(b**(p+1))+'/'+(p+1)?'':' = '+right)+'.'}; }});

/* ===== Laundry 5, rung 16 (floor 3 pools, stage O): 16a to 16j, the area function and its uses ===== */
Object.assign(STEPS,{'16a':['r16a','The Area Function'],'16b':['r16b','Its Slope Is the Height'],'16c':['r16c','Evaluating by Antiderivatives'],'16d':['r16d','Substitution'],'16e':['r16e','Parts'],'16f':['r16f','The Table Run Backwards'],
  '16g':['r16g','Definite Integrals and Areas'],'16h':['r16h','Substitution and Parts by Hand'],'16i':['r16i','Improper Integrals'],'16j':['r16j','Volumes by Cross Sections']});
const fact16=n=>n<2?1:n*fact16(n-1), pw16=(b,n)=>b+(n===1?'':sup15(n)), DIV16='it diverges', frs16=(right,fs,n)=>uniq(right,fs.map(fshow),n||3);

/* ---------- 16a The Area Function ---------- */
const A16=[
  ['In ∫ₚ^q f(x) dx, what does the letter x name?','no number: it is a stand-in, and any letter not in use will do',['the right end q','the width of a piece','an unknown to be solved for'],'The integral is one number made from all the values of f on [p, q]. The letter only says which slot of f is run through.'],
  ['f is integrable and jumps at c. What can be said of its area function F at c?','F is continuous at c',['F jumps at c too','F has no value at c','F has a slope at c'],'Area-never-jumps: if |f| ≤ M then |F(y) − F(x)| ≤ M|y − x|. A jump in the height makes a corner in the area, not a jump.'],
  ['Is an area function F(x) = ∫ₛˣ f(t) dt never negative?','no: left of s, or where f is negative, it counts negative',['yes','yes, whenever f is continuous','no: it is negative at every x but s'],'F(s) = 0, and from there the area is added with its sign and with the direction of travel.'],
  ['|f(t)| ≤ M at every t of [p, q]. What bounds the integral?','|∫ₚ^q f| ≤ M(q − p)',['|∫ₚ^q f| ≤ M','∫ₚ^q f = M(q − p)','|∫ₚ^q f| ≤ M/(q − p)'],'Area-bound: −M ≤ f ≤ M, and smaller-function-smaller-area on both sides.']];
QP.push({id:'16a.letter',step:'16a',label:'the stand-in letter and the area function',open:()=>measured('16a'),make(){ return writtenQ('16a.letter',A16); }},
  {id:'16a.areafn',step:'16a',mode:'work',label:'three area functions',open:()=>measured('16a'),make(){
    const k=rnd(3);
    if(k===0){ const c=pick([-3,-2,2,3,4,5]), s=rnd(7)-3, a=pick([-4,-3,-2,-1,0,1,2,3,4,5,6].filter(x=>x!==s)), right=sg(c*(a-s)), wrong=num13(right,[c*a,c*(s-a),c,c*(a+s),a-s,c*(a-s)+c]); if(wrong.length<3) return null;
      return {index:'q:16a.areafn[k;'+[c,s,a].join(';')+']', lines:[['f(t) = '+sg(c),'at every real'],['F(x) = ∫'+sub15(s)+'ˣ f(t) dt','the area function of f from '+sg(s)]], ask:'What is F('+sg(a)+')?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'A constant’s sums are all k(x − s): '+par10(c)+' · ('+sg(a)+' − '+par10(s)+') = '+right+'.'+(a<s?' Left of '+sg(s)+' the area counts with the sign turned about.':'')}; }
    const a=1+rnd(6), sq=k===2, R=sq?fr(a**3,3):fr(a*a,2), right=fshow(R), wrong=frs16(right,sq?[fr(a*a,2),fint(a**3),fint(a*a),fr(a**3,2),fint(2*a),fr(a,3)]:[fint(a*a),fint(a),fr(a,2),fr(a**3,3),fint(1),fr(a*a,4)]); if(wrong.length<3) return null;
    return {index:'q:16a.areafn['+(sq?'q':'l')+';'+a+']', lines:[['f(t) = '+(sq?'t²':'t'),'at every real'],['F(x) = ∫₀ˣ f(t) dt','the area function of f from 0']], ask:'What is F('+a+')?', right, opts:shuffle([right,...wrong]), lead:'',
      why:(sq?'Area-under-a-power: F(x) = x³/3':'The area under t from 0 to x is x²/2')+', so F('+a+') = '+right+'.'}; }});

/* ---------- 16b Its Slope Is the Height ---------- */
const B16=[
  ['F(x) = ∫ₚˣ f(t) dt, and f is continuous at c. What is F′(c)?','f(c)',['f(c) − f(p)','f′(c)','F(c)'],'Area-slope: the slope of the area function is the height of f there. The lower end p does not enter.'],
  ['Does every function continuous on an interval have an antiderivative there?','yes: its area function is one',['only polynomials do','only when a formula can be found','no'],'Antiderivative-exists: F(x) = ∫ₚˣ f(t) dt has F′ = f at every input of the interval, formula or no formula.'],
  ['f jumps at c. Must its area function have a slope at c?','no: the slopes from the two sides can differ',['yes, and it is f(c)','yes, and it is 0','no: the area function is not continuous there'],'For the unit step from 0, F is 0 left of 0 and x right of it: slopes 0 and 1 from the two sides.'],
  ['What is the slope of ∫ₓ^q f(t) dt, as a function of x?','−f(x)',['f(x)','f(q) − f(x)','0'],'∫ₓ^q f = −∫_q^x f: the moving end is the lower one, and the sign turns about.']];
QP.push({id:'16b.first',step:'16b',label:'the first fundamental technique',open:()=>measured('16b'),make(){ return writtenQ('16b.first',B16); }},
  {id:'16b.slope',step:'16b',mode:'work',label:'the slope of an area function',open:()=>measured('16b'),make(){
    const k=rnd(3), cs=[pick([1,2,-1]),rnd(7)-3,rnd(9)-4], f=x=>ev9(cs,x), c=pick([-2,-1,1,2,3]);
    if(k===0){ const p=pick([-3,-2,0,1,4].filter(x=>x!==c)), right=sg(f(c)), wrong=num13(right,[f(c)-f(p),2*cs[0]*c+cs[1],0,f(p),-f(c),f(c)+f(p)]); if(wrong.length<3) return null;
      return {index:'q:16b.slope[u;'+[poly13(cs),p,c].join(';')+']', lines:[['f(t) = '+poly13(cs).replace(/x/g,'t'),'at every real'],['F(x) = ∫'+sub15(p)+'ˣ f(t) dt','an area function']], ask:'What is F′('+sg(c)+')?', right, opts:shuffle([right,...wrong]), lead:'', why:'Area-slope: F′(c) = f(c). f('+sg(c)+') = '+right+'. The lower end '+sg(p)+' changes F by a constant and its slope not at all.'}; }
    if(k===1){ const q=c+1+rnd(4), right=sg(-f(c)), wrong=num13(right,[f(c),f(q)-f(c),-(2*cs[0]*c+cs[1]),0,f(q),-f(q)]); if(wrong.length<3) return null;
      return {index:'q:16b.slope[l;'+[poly13(cs),q,c].join(';')+']', lines:[['f(t) = '+poly13(cs).replace(/x/g,'t'),'at every real'],['G(x) = ∫ₓ'+sup15(q)+' f(t) dt','the moving end is the lower one']], ask:'What is G′('+sg(c)+')?', right, opts:shuffle([right,...wrong]), lead:'', why:'G(x) = −∫'+sub15(q)+'ˣ f(t) dt, so G′(c) = −f(c). f('+sg(c)+') = '+sg(f(c))+', and G′('+sg(c)+') = '+right+'.'}; }
    const m=pick([1,2,3]), b=rnd(7)-3, g=t=>m*t+b, p=pick([0,1,2]), val=g(c*c)*2*c, right=sg(val), wrong=num13(right,[g(c*c),g(c)*2*c,2*c,g(c*c)*c*c,g(c),-val]); if(wrong.length<3) return null;
    return {index:'q:16b.slope[m;'+[m,b,p,c].join(';')+']', lines:[['f(t) = '+lin9(m,b).replace(/x/g,'t'),'at every real'],['H(x) = ∫'+sub15(p)+'^(x²) f(t) dt','the upper end moves as x²']], ask:'What is H′('+sg(c)+')?', right, opts:shuffle([right,...wrong]), lead:'', why:'Moving-end: H(x) = F(x²), so by the chain rule H′(x) = f(x²) · 2x. At '+sg(c)+': f('+(c*c)+') · '+par10(2*c)+' = '+par10(g(c*c))+' · '+par10(2*c)+' = '+right+'.'}; }});

/* ---------- 16c Evaluating by Antiderivatives ---------- */
QP.push({id:'16c.change',step:'16c',mode:'work',label:'an area is a change',open:()=>measured('16c'),make(){
    if(Math.random()<0.65){ const a=pick([1,1,2,-1]), b=rnd(5)-2, c=rnd(7)-3, f=[3*a,2*b,c], G=[a,b,c,0], p=rnd(4)-2, q=p+1+rnd(3), v=ev9(G,q)-ev9(G,p), right=sg(v), wrong=num13(right,[ev9(G,q)+ev9(G,p),ev9(f,q)-ev9(f,p),ev9(G,q),-v,(q-p)*ev9(f,q),v+1,v-c]); if(wrong.length<3) return null;
      return {index:'q:16c.change[p;'+[poly13(f),p,q].join(';')+']', lines:[['f(x) = '+poly13(f),'on ['+sg(p)+', '+sg(q)+']']], ask:'What is '+int15(p,q,'f(x) dx')+'?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'G(x) = '+poly13(G)+' has G′ = f. Area-is-a-change: G('+sg(q)+') − G('+sg(p)+') = '+sg(ev9(G,q))+' − '+par10(ev9(G,p))+' = '+right+'.'}; }
    const p=1+rnd(4), q=p+1+rnd(4), R=fsub(fr(1,p),fr(1,q)), right=fshow(R), wrong=frs16(right,[fneg(R),fsub(fr(1,p*p),fr(1,q*q)),fint(q-p),fr(1,q-p),fadd(fr(1,p),fr(1,q)),fr(1,p*q*q)]); if(wrong.length<3) return null;
    return {index:'q:16c.change[i;'+p+';'+q+']', lines:[['f(x) = 1/x²','on ['+p+', '+q+']']], ask:'What is '+int15(p,q,'dx/x²')+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'(−1/x)′ = 1/x² on the interval, which stays clear of 0. Inverse-square-area: 1/p − 1/q = 1/'+p+' − 1/'+q+' = '+right+'.'}; }},
  {id:'16c.licensed',step:'16c',mode:'proof',label:'is the change licensed',open:()=>measured('16c'),make(){
    const k=rnd(3), a=1+rnd(7), b=a+1+rnd(7), [p,q]=k===0?[a,b]:k===1?[-b,-a]:[-a,1+rnd(8)], val=fshow(fsub(fr(1,p),fr(1,q))), ok=k!==2, opts=['it is licensed','it is not licensed'];
    return {index:'q:16c.licensed['+p+';'+q+']', stack:true, lines:[['G(x) = −1/x','G′(x) = 1/x² at every x ≠ 0'],[int15(p,q,'dx/x²')+' = G('+sg(q)+') − G('+sg(p)+') = '+val,'area-is-a-change, on line 1']], ask:'Is line 2 licensed?', right:opts[ok?0:1], opts, lead:'',
      why:ok?'0 is not in ['+sg(p)+', '+sg(q)+'], so 1/x² is continuous there and G is an antiderivative of it on the whole interval.':'0 lies in ['+sg(p)+', '+sg(q)+']. There 1/x² is not bounded, so it has no integral, and G has no value at 0. The answer '+val+' is negative for a function that is never negative.'}; }});

/* ---------- 16d Substitution ---------- */
const D16=[
  ['After r = g(x), which ends does the integral in r carry?','g(v) and g(w), the values of r at the old ends',['v and w, as before','0 and 1','none: the ends are dropped'],'Substitution for areas: ∫ᵥʷ f(g(x)) g′(x) dx = ∫ from g(v) to g(w) of f(r) dr. The ends belong to the letter.'],
  ['What is the line dr = g′(x) dx?','a reminder of the substitution technique, not a statement about numbers',['an equation between two small numbers','a slope','a definition of dx'],'It says that g′(x) dx beside a function of g(x) may be traded for dr.'],
  ['∫ (x² + 1)³ dx: can r = x² + 1 be used as it stands?','no: there is no 2x beside it to become dr',['yes: the answer is (x² + 1)⁴/4 + C','yes: the answer is (x² + 1)⁴/(8x) + C','no: substitution is for definite integrals only'],'Check by the slope: ((x² + 1)⁴/4)′ = 2x(x² + 1)³. Expand the cube instead.'],
  ['Which of these functions is even?','x⁴ + x²',['x³','x² + x','x'],'Even: f(−x) = f(x). The names come from the powers. A sum of an even and an odd power is neither.']];
QP.push({id:'16d.ends',step:'16d',label:'the bookkeeping',open:()=>measured('16d'),make(){ return writtenQ('16d.ends',D16); }},
  {id:'16d.subst',step:'16d',mode:'work',label:'the chain rule, backwards',open:()=>measured('16d'),make(){
    const k=rnd(3), n=2+rnd(3);
    if(k===0){ const c=1+rnd(4), v=rnd(3), w=v+1+rnd(2), gv=v*v+c, gw=w*w+c, body=pw16('r',n)+' dr', right=int15(gv,gw,body), wrong=uniq(right,[int15(v,w,body),int15(gv,gw,'2'+body),int15(v,w,'2'+body),int15(gw,gv,body),int15(gv,gw,pw16('r',n+1)+' dr')],3);
      return {index:'q:16d.subst[e;'+[c,n,v,w].join(';')+']', lines:[[int15(v,w,'2x(x² + '+c+')'+sup15(n)+' dx'),'to be rewritten'],['r = x² + '+c+', dr = 2x dx','the substitution']], ask:'Which integral in r is it?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'2x dx is traded for dr, and the ends for the values of r there: x = '+v+' gives r = '+gv+', and x = '+w+' gives r = '+gw+'.'}; }
    if(k===1){ const p=1+rnd(5), A=pick([-6,-4,-3,-2,2,3,4,5,7]), odd=Math.random()<0.5, right=sg(odd?0:2*A), wrong=num13(right,[A,odd?2*A:0,-A,-2*A,A*p]); if(wrong.length<3) return null;
      return {index:'q:16d.subst[o;'+[p,A,odd?'o':'e'].join(';')+']', lines:[['f is '+(odd?'odd':'even')+' and continuous on ['+sg(-p)+', '+p+']','given'],[int15(0,p,'f')+' = '+sg(A),'given']], ask:'What is '+int15(-p,p,'f')+'?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'Odd-and-even-areas: the left half is '+(odd?'the right half with its sign turned about, so the two cancel.':'equal to the right half, so the whole is twice '+sg(A)+'.')}; }
    const m=pick([2,3,4,5]), b=pick([-3,-2,-1,1,2,3]), ins='('+lin9(m,b)+')', right=ins+sup15(n+1)+'/'+(m*(n+1))+' + C', wrong=uniq(right,[ins+sup15(n+1)+'/'+(n+1)+' + C',m+ins+sup15(n+1)+'/'+(n+1)+' + C',(n*m)+ins+(n===2?'':sup15(n-1))+' + C',ins+sup15(n+1)+'/'+m+' + C'],3);
    return {index:'q:16d.subst[s;'+[m,b,n].join(';')+']', lines:[['∫ '+ins+sup15(n)+' dx','a straight inside']], ask:'Which is it?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Straight-inside: with F′ = f, ∫ f(kx + m) dx = (1/k)F(kx + m) + C. Here F(r) = r'+sup15(n+1)+'/'+(n+1)+' and k = '+m+'. Check by the slope: the chain rule brings the '+m+' back.'}; }});

/* ---------- 16e Parts ---------- */
const E16=[
  ['Parts trades ∫ f g′ for which integral?','∫ f′ g',['∫ f′ g′','∫ f g','∫ (fg)′'],'From (fg)′ = f′g + fg′: the leftover is the product rule’s other term.'],
  ['On a definite integral from p to q, how is the fg term of parts taken?','between the ends: f(q)g(q) − f(p)g(p)',['at the upper end only','it is dropped','as f(q)g(p)'],'∫ₚ^q fg′ = fg|ₚ^q − ∫ₚ^q f′g. The bar means the value at q less the value at p.'],
  ['Which rule for slopes does parts run backwards?','the product rule',['the chain rule','the quotient rule','the power rule'],'Substitution is the chain rule backwards. Parts is the product rule backwards.'],
  ['In ∫ x(1 − x)⁴ dx, why take f = x and g′ = (1 − x)⁴?','x gets simpler when its slope is taken, and (1 − x)⁴ is easy to undo',['the first factor is always f','x is always f','because x has no antiderivative'],'The choice is free. A good one leaves an easier integral behind.']];
QP.push({id:'16e.choose',step:'16e',label:'the product rule, backwards',open:()=>measured('16e'),make(){ return writtenQ('16e.choose',E16); }},
  {id:'16e.parts',step:'16e',mode:'work',label:'parts, and a family of areas',open:()=>measured('16e'),make(){
    if(Math.random()<0.5){ const m=rnd(5), n=1+rnd(4), R=fr(fact16(m)*fact16(n),fact16(m+n+1)), right=fshow(R), wrong=frs16(right,[fr(1,(m+1)*(n+1)),fr(fact16(m)*fact16(n),fact16(m+n)),fr(1,m+n+1),fr(fact16(m)*fact16(n),fact16(m+n+2)),fr(1,fact16(m+n+1)),fr(1,(m+1)*(n+2))]); if(wrong.length<3) return null;
      return {index:'q:16e.parts[b;'+m+';'+n+']', lines:[[int15(0,1,(m===0?'':pw16('x',m))+pw16('(1 − x)',n)+' dx'),'one of a family of areas']], ask:'What is it?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'Areas-under-xᵐ(1 − x)ⁿ: m! n!/(m + n + 1)! = '+fact16(m)+' · '+fact16(n)+'/'+fact16(m+n+1)+' = '+right+', with no expanding. Each use of parts moves one power from (1 − x) to x.'}; }
    const p=rnd(3), q=p+1+rnd(3), fp=rnd(7)-3, fq=rnd(7)-3, gp=rnd(7)-3, gq=rnd(7)-3, K=rnd(11)-5, bar=fq*gq-fp*gp, v=bar-K, right=sg(v), wrong=num13(right,[bar+K,fq*gq-K,-K,bar,fq*gq+fp*gp-K,K-bar,v+1]); if(wrong.length<3) return null;
    return {index:'q:16e.parts[t;'+[p,q,fp,fq,gp,gq,K].join(';')+']', lines:[['f('+p+') = '+sg(fp)+', f('+q+') = '+sg(fq),'given'],['g('+p+') = '+sg(gp)+', g('+q+') = '+sg(gq),'given'],[int15(p,q,'f′g')+' = '+sg(K),'given']], ask:'What is '+int15(p,q,'fg′')+'?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Parts for areas: fg between the ends, less the other integral. ('+par10(fq)+' · '+par10(gq)+' − '+par10(fp)+' · '+par10(gp)+') − '+par10(K)+' = '+right+'.'}; }});

/* ---------- 16f The Table Run Backwards ---------- */
const F16=[
  ['What does the power line of the table give for ∫ x⁻¹ dx?','nothing: −1 is the one exponent it leaves out',['x⁰/0 + C','1 + C','−x⁻² + C'],'x⁰/0 is no function. No-power-for-1/x: no c xʳ has the slope 1/x. The entry waits for a new function.'],
  ['How is a claimed antiderivative checked?','take its slope and compare with the integrand',['put x = 0 in it','integrate it once more','it cannot be checked'],'Every line of the table is a slope rule read backwards, so the slope is the test.'],
  ['G′(x) = x⁻² at every x ≠ 0. Must G be −1/x + C for one real C?','no: the domain is two intervals, and each may carry its own constant',['yes','yes, by all-antiderivatives','no: x⁻² has no antiderivative'],'All-antiderivatives is about one interval. Left and right of 0 the constants are free of each other.'],
  ['G′ is known on an interval. What pins the constant?','one value of G',['the slope of G at one input','nothing: it stays free','the value of G′ at 0'],'An initial condition G(x₀) = y₀ picks one member of the family G + C.']];
QP.push({id:'16f.missing',step:'16f',label:'the constant and the missing entry',open:()=>measured('16f'),make(){ return writtenQ('16f.missing',F16); }},
  {id:'16f.table',step:'16f',mode:'work',label:'the table, backwards',open:()=>measured('16f'),make(){
    const k=rnd(3), n=2+rnd(5);
    if(k===0){ const right='x'+sup15(n+1)+'/'+(n+1)+' + C', wrong=[n+pw16('x',n-1)+' + C','x'+sup15(n+1)+' + C','x'+sup15(n+1)+'/'+n+' + C'];
      return {index:'q:16f.table[p;'+n+']', lines:[['∫ x'+sup15(n)+' dx','from the table']], ask:'Which is it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Power for slopes, backwards: raise the exponent by one and divide by the new exponent. Check: (x'+sup15(n+1)+'/'+(n+1)+')′ = x'+sup15(n)+'.'}; }
    if(k===1){ const right='−1/('+(n-1===1?'':n-1)+pw16('x',n-1)+') + C', wrong=['1/('+(n-1===1?'':n-1)+pw16('x',n-1)+') + C','−1/('+(n+1)+'x'+sup15(n+1)+') + C','−'+n+'/x'+sup15(n+1)+' + C'];
      return {index:'q:16f.table[n;'+n+']', lines:[['∫ dx/x'+sup15(n),'for x > 0']], ask:'Which is it?', right:right.replace('(x)','x'), opts:shuffle([right,...wrong]).map(o=>o.replace('(x)','x')), lead:'', why:'x⁻ⁿ has the antiderivative x¹⁻ⁿ/(1 − n): the exponent rises by one, to '+sg(1-n)+', and the new exponent divides. Check by the slope.'}; }
    const a=pick([1,1,2,-1]), b=rnd(5)-2, c=rnd(7)-3, C=pick([-4,-3,-2,-1,1,2,3,4]), f=[3*a,2*b,c], G=[a,b,c,C], G0=[a,b,c,0], x0=pick([0,1,-1]), x1=pick([2,-2,3].filter(x=>x!==x0)), y0=ev9(G,x0), v=ev9(G,x1), right=sg(v), wrong=num13(right,[ev9(G0,x1),ev9(G0,x1)+y0,y0+ev9(f,x1),ev9(f,x1),v-2*C,v+1]); if(wrong.length<3) return null;
    return {index:'q:16f.table[i;'+[poly13(f),x0,y0,x1].join(';')+']', lines:[['G′(x) = '+poly13(f),'the demand'],['G('+sg(x0)+') = '+sg(y0),'the condition']], ask:'What is G('+sg(x1)+')?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The table gives G(x) = '+poly13(G0)+' + C. The condition gives C = '+sg(C)+'. Then G('+sg(x1)+') = '+right+'.'}; }});

/* ---------- 16g Definite Integrals and Areas ---------- */
const G16=[
  ['f changes from positive to negative at c. What has its area function F at c?','a top',['a bottom','a zero','a jump'],'F′ = f, so F climbs while f is positive and falls after. First-test gives a top.'],
  ['x and x² cross at 1. Is the area between them on [0, 2] equal to ∫₀² (x − x²) dx?','no: cut at 1 and swap, since x² is above x on [1, 2]',['yes','yes, once bars are put around the answer','no: the region has no area'],'Area-between needs the upper graph first on each stretch. ∫₀¹ (x − x²) + ∫₁² (x² − x) = 1/6 + 5/6 = 1.'],
  ['For a velocity v, what does ∫ |v| count?','the distance travelled',['the displacement','the average speed','the acceleration'],'∫ v is the net change of position, the displacement. ∫ |v| counts every stretch as positive.'],
  ['On a stretch where f > 0, what does the area function F do?','it increases',['it is positive','it bends up','it stays constant'],'F′ = f > 0, and slope-sign-order. Whether F is positive depends on where the area is counted from.']];
QP.push({id:'16g.reading',step:'16g',label:'reading an area function',open:()=>measured('16g'),make(){ return writtenQ('16g.reading',G16); }},
  {id:'16g.between',step:'16g',mode:'work',label:'the region between two graphs',open:()=>measured('16g'),make(){
    const k=rnd(4);
    if(k===3){ const m=1+rnd(4), n=m+1+rnd(5-m), R=fsub(fr(1,m+1),fr(1,n+1)), right=fshow(R), wrong=frs16(right,[fr(1,n-m),fadd(fr(1,m+1),fr(1,n+1)),fr(1,(m+1)*(n+1)),fsub(fr(1,m),fr(1,n)),fr(1,m+n+1),fr(1,n+1)]); if(wrong.length<3) return null;
      return {index:'q:16g.between[p;'+m+';'+n+']', lines:[['y = '+pw16('x',m)+' and y = '+pw16('x',n),'for 0 ≤ x ≤ 1; they meet at 0 and at 1']], ask:'What is the area between them?', right, opts:shuffle([right,...wrong]), lead:'', why:'Between 0 and 1 the lower power is above. '+int15(0,1,'('+pw16('x',m)+' − '+pw16('x',n)+') dx')+' = 1/'+(m+1)+' − 1/'+(n+1)+' = '+right+'.'}; }
    if(k===0){ const a=1+rnd(8), R=fr(a**3,6), right=fshow(R), wrong=frs16(right,[fr(a**3,3),fr(a**3,2),fr(a*a,2),fr(a*a,6),fint(a**3),fr(a**3,12)]); if(wrong.length<3) return null;
      return {index:'q:16g.between[l;'+a+']', lines:[['y = '+(a===1?'':a)+'x and y = x²','they cross at 0 and at '+a]], ask:'What is the area between them?', right, opts:shuffle([right,...wrong]), lead:'', why:'On [0, '+a+'] the line is above. Area-between: '+int15(0,a,'('+(a===1?'':a)+'x − x²) dx')+' = '+a+' · '+(a*a)+'/2 − '+(a**3)+'/3 = '+right+'.'}; }
    if(k===1){ const m=1+rnd(6), R=fr(2*m**3,3), right=fshow(R), wrong=frs16(right,[fr(m**3,3),fint(m**3),fr(4*m**3,3),fr(m**3,2),fint(m*m),fr(2*m*m,3)]); if(wrong.length<3) return null;
      return {index:'q:16g.between[c;'+m+']', lines:[['y = '+(m*m)+' and y = x²','for 0 ≤ x ≤ '+m]], ask:'What is the area between them?', right, opts:shuffle([right,...wrong]), lead:'', why:'The level line is above. '+int15(0,m,'('+(m*m)+' − x²) dx')+' = '+(m**3)+' − '+(m**3)+'/3 = '+right+'.'}; }
    const b=2+rnd(5), G=x=>fsub(fr(x**3,3),fr(x*x,2)), R=fadd(fr(1,6),fsub(G(b),G(1))), right=fshow(R), N=fsub(fr(b*b,2),fr(b**3,3)), wrong=frs16(right,[fr(Math.abs(N.p),N.q),N,fsub(G(b),G(1)),fadd(R,fr(1,6)),fr(b**3,3),fr(b*b,2)]); if(wrong.length<3) return null;
    return {index:'q:16g.between[x;'+b+']', lines:[['y = x and y = x²','for 0 ≤ x ≤ '+b+'; they cross at 1']], ask:'What is the area between them?', right, opts:shuffle([right,...wrong]), lead:'', why:'Cut at the crossing and put the upper graph first on each stretch: ∫₀¹ (x − x²) dx + '+int15(1,b,'(x² − x) dx')+' = 1/6 + '+fshow(fsub(G(b),G(1)))+' = '+right+'.'}; }},
  {id:'16g.travel',step:'16g',mode:'word',label:'net and total',open:()=>measured('16g'),make(){
    const who=pick(['A shuttle on a track','A float on a line','A slide on a rail','A cart on a track']), c=1+rnd(4), b=c+1+rnd(4), net=fsub(fr(b*b,2),fint(c*b)), tot=fadd(fr(c*c,2),fr((b-c)*(b-c),2)), dist=Math.random()<0.5, right=fshow(dist?tot:net)+' metres';
    const wrong=uniq(right,[fshow(dist?net:tot)+' metres',fshow(fr(b*b,2))+' metres',(c*b)+' metres',fshow(fr((b-c)*(b-c),2))+' metres',fshow(fint(b-c))+' metres',fshow(fneg(dist?tot:net))+' metres'],3); if(wrong.length<3) return null;
    return {index:'q:16g.travel['+[who,c,b,dist?'d':'n'].join(';')+']', a3:['16g.travel['+(dist?'total':'net')+']',DASH,DASH], story:who+' has the velocity t − '+c+' metres per second at the time t seconds, for t from 0 to '+b+'.', lines:[], ask:dist?'What distance does it travel?':'What is its displacement?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The velocity is negative before t = '+c+' and positive after. Backwards it covers '+fshow(fr(c*c,2))+' metres, forwards '+fshow(fr((b-c)*(b-c),2))+'. The displacement is the net area, '+fshow(net)+'. The distance is the total area, '+fshow(tot)+'.'}; }});

/* ---------- 16h Substitution and Parts by Hand ---------- */
QP.push({id:'16h.byhand',step:'16h',mode:'work',label:'by hand',open:()=>measured('16h'),make(){
    if(Math.random()<0.55){ const b=1+rnd(3), c=1+rnd(3), n=1+rnd(b===3?2:3), lo=c, hi=b*b+c, R=fr(hi**(n+1)-lo**(n+1),n+1), right=fshow(R), wrong=frs16(right,[fr(b**(n+1),n+1),fr(hi**(n+1),n+1),fint(hi**(n+1)-lo**(n+1)),fr(hi**(n+1)-lo**(n+1),2*(n+1)),fr(hi**n-lo**n,n),fint(hi**n)]); if(wrong.length<3) return null;
      return {index:'q:16h.byhand[s;'+[b,c,n].join(';')+']', lines:[[int15(0,b,'2x'+pw16('(x² + '+c+')',n)+' dx'),'an inside with its slope beside it']], ask:'What is it?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'r = x² + '+c+', dr = 2x dx, and r runs from '+lo+' to '+hi+'. '+int15(lo,hi,pw16('r',n)+' dr')+' = ('+(hi**(n+1))+' − '+(lo**(n+1))+')/'+(n+1)+' = '+right+'. The ends '+0+' and '+b+' belong to x.'}; }
    const n=2+rnd(6); let J=fint(1); for(let i=1;i<n;i++) J=fmul(J,fr(2*i,2*i+1)); const R=fmul(J,fr(2*n,2*n+1)), right=fshow(R), wrong=frs16(right,[fmul(J,fr(2*n+1,2*n)),fmul(J,fr(n,n+1)),fmul(J,fr(2*n,2*n-1)),fmul(J,fr(1,2*n+1)),fmul(J,fr(2*n-1,2*n+1)),fr(1,2*n+1)]); if(wrong.length<3) return null;
    return {index:'q:16h.byhand[j;'+n+']', lines:[['Jₙ = ∫₀¹ (1 − x²)ⁿ dx','one integral through a smaller one'],['J'+sub15(n-1)+' = '+fshow(J),'given']], ask:'What is J'+sub15(n)+'?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Areas-under-(1 − x²)ⁿ: Jₙ = (2n/(2n + 1)) Jₙ₋₁. With n = '+n+': '+(2*n)+'/'+(2*n+1)+' · '+fshow(J)+' = '+right+'. Each is a product of even numbers over odd ones.'}; }});

/* ---------- 16i Improper Integrals ---------- */
const I16=[
  ['0 ≤ f(x) ≤ g(x) far out, and ∫ g out to forever converges. What follows?','∫ f converges too, and is at most ∫ g',['nothing','∫ f diverges','∫ f equals ∫ g'],'Comparison: the area function of f is increasing and bounded above, so it heads to a number.'],
  ['0 ≤ f(x) ≤ g(x) far out, and ∫ f out to forever converges. What follows for g?','nothing: ∫ g may converge or diverge',['∫ g converges','∫ g diverges','∫ g is at most ∫ f'],'Comparison runs from the larger to the smaller. 1/x² ≤ 1/x for x ≥ 1: the first converges and the second does not.'],
  ['∫₋₁¹ x⁻² dx: what must be done first?','split at 0, the bad point, and take each side as a limit',['nothing: −1/x between the ends gives −2','take bars around x','swap the ends'],'In-to-0: ∫₀¹ x⁻² dx diverges, so the whole diverges. The −2 is the mark of a missed bad point.'],
  ['What does ∫ₐ^∞ f(x) dx mean?','the limit of ∫ₐᵇ f(x) dx as b passes every bound, when it exists',['a sum over endlessly many pieces at once','the area function’s value at ∞','the upper integral of f'],'There is no input ∞. The mark names a limit of ordinary integrals, when there is one.']];
const px16=p=>p.q===1?(p.p===1?'1/x':'1/x'+sup15(p.p)):(p.p===1&&p.q===2?'1/√x':'1/x^('+fshow(p)+')');
QP.push({id:'16i.compare',step:'16i',label:'out to forever',open:()=>measured('16i'),make(){ return writtenQ('16i.compare',I16); }},
  {id:'16i.improper',step:'16i',mode:'work',label:'the powers',open:()=>measured('16i'),make(){
    const out=Math.random()<0.5, p=pick(out?[fint(2),fint(3),fint(4),fint(5),fr(3,2),fr(5,2),fr(4,3),fr(5,3),fr(7,4),fr(5,4),fint(1),fr(1,2),fr(2,3),fr(3,4),fr(1,3)]:[fr(1,2),fr(1,3),fr(2,3),fr(3,4),fr(1,4),fr(4,5),fr(1,5),fr(2,5),fint(1),fint(2),fr(3,2),fint(3),fr(5,4),fr(4,3)]), one=fint(1), conv=out?fless(one,p):fless(p,one), d=out?fsub(p,one):fsub(one,p);
    const val=conv?fr(d.q,d.p):null, right=conv?fshow(val):DIV16, flip=fsame(p,one)?fint(1):fr(Math.abs(d.q),Math.abs(d.p)), wrong=uniq(right,[DIV16,fshow(flip),fshow(p),'0',fshow(fr(p.q,p.p)),fshow(fadd(flip,one)),'1'],3); if(wrong.length<3) return null;
    return {index:'q:16i.improper['+(out?'o':'i')+';'+fshow(p)+']', lines:[[(out?'∫₁^∞ ':'∫₀¹ ')+px16(p)+' dx',out?'out to forever':'in to the bad point 0']], ask:'What is it?', right, opts:shuffle([right,...wrong]), lead:'',
      why:out?'Out-to-forever: ∫₁^∞ x⁻ᵖ dx converges exactly when p > 1, to 1/(p − 1). Here p = '+fshow(p)+(conv?', and the area is '+right+'.':', so it diverges: the area up to b passes every bound.')
        :'In-to-0: ∫₀¹ x⁻ᵖ dx converges exactly when p < 1, to 1/(1 − p). Here p = '+fshow(p)+(conv?', and the area is '+right+'.':', so it diverges: the area from c to 1 passes every bound as c heads to 0.')}; }});

/* ---------- 16j Volumes by Cross Sections ---------- */
const J16=[
  ['Is a pyramid’s volume half its base times its height?','no: the slice shrinks as the square of x/h, and the volume is Bh/3',['yes','no: it is Bh/4','no: it is Bh'],'∫₀ʰ B(x/h)² dx = Bh/3. A half is right for a triangle, where the slice shrinks as x/h.'],
  ['Two solids lie between the same walls, and their slices at each x have the same area. What follows?','they have the same volume',['they have the same shape','they have the same surface','nothing'],'Matching-slices: the volume is the integral of the slice areas, and the two integrands agree.'],
  ['A slice is a square with the side √x − x². What is its area?','(√x − x²)²',['√x − x²','x − x⁴','2(√x − x²)'],'That expression is the side. The area is its square, x − 2x^(5/2) + x⁴.'],
  ['By cross sections, what is a solid’s volume?','the integral of the areas of its slices',['the sum of the lengths of its edges','its base area times its greatest height','the area of its largest slice times its length'],'Cross-sections: thin slabs of volume A(x)Δx squeeze the volume to ∫ A(x) dx.']];
QP.push({id:'16j.slices',step:'16j',label:'slices',open:()=>measured('16j'),make(){ return writtenQ('16j.slices',J16); }},
  {id:'16j.volume',step:'16j',mode:'work',label:'prisms, pyramids and known slices',open:()=>measured('16j'),make(){
    const k=rnd(4), B=2+rnd(11), h=2+rnd(7);
    if(k===0){ const R=fr(B*h,3), right=fshow(R), wrong=frs16(right,[fr(B*h,2),fint(B*h),fint(B+h),fr(B*h,6),fr(B*h*h,3),fr(B,3)]); if(wrong.length<3) return null;
      return {index:'q:16j.volume[y;'+B+';'+h+']', lines:[['a pyramid: the slice at x is the base shrunk by x/h each way','for 0 ≤ x ≤ h'],['the base has area '+B+', and h = '+h,'given']], ask:'What is its volume?', right, opts:shuffle([right,...wrong]), lead:'', why:'Pyramid: A(x) = B(x/h)², and ∫₀ʰ B(x/h)² dx = Bh/3 = '+B+' · '+h+'/3 = '+right+'.'}; }
    if(k===1){ const right=String(B*h), wrong=uniq(right,[fshow(fr(B*h,3)),fshow(fr(B*h,2)),String(B+h),String(B*B*h),String(B*h*h)],3); if(wrong.length<3) return null;
      return {index:'q:16j.volume[r;'+B+';'+h+']', lines:[['every slice has the area '+B,'for 0 ≤ x ≤ '+h]], ask:'What is the volume?', right, opts:shuffle([right,...wrong]), lead:'', why:'Prism: '+int15(0,h,B+' dx')+' = Bh = '+right+'. The shape of the slice does not matter, only its area.'}; }
    if(k===2){ const hh=1+rnd(5), R=fr(hh**3,3), right=fshow(R), wrong=frs16(right,[fr(hh**3,2),fint(hh**3),fint(hh*hh),fr(hh*hh,2),fint(2*hh),fr(hh**4,4)]); if(wrong.length<3) return null;
      return {index:'q:16j.volume[s;'+hh+']', lines:[['the slice at x is a square of side x','for 0 ≤ x ≤ '+hh]], ask:'What is the volume?', right, opts:shuffle([right,...wrong]), lead:'', why:'Cross-sections: A(x) = x², and '+int15(0,hh,'x² dx')+' = '+(hh**3)+'/3'+(fshow(R)===(hh**3)+'/3'?'':' = '+right)+'.'}; }
    const a=1+rnd(5), hh=1+rnd(5), R=fr(a*hh*hh,2), right=fshow(R), wrong=frs16(right,[fint(a*hh*hh),fint(a*hh),fr(a*hh,2),fr(a*hh**3,3),fr(a*a*hh,2),fint(a+hh)]); if(wrong.length<3) return null;
    return {index:'q:16j.volume[l;'+a+';'+hh+']', lines:[['the slice at x has the area '+(a===1?'':a)+'x','for 0 ≤ x ≤ '+hh]], ask:'What is the volume?', right, opts:shuffle([right,...wrong]), lead:'', why:'Cross-sections: '+int15(0,hh,(a===1?'':a)+'x dx')+' = '+eq14((a===1?'':a+' · ')+(hh*hh)+'/2',right)+'.'}; }},
  {id:'16j.mass',step:'16j',mode:'word',label:'mass by slices',open:()=>measured('16j'),make(){
    const what=pick(['A column of settling mud','A tank of brine','A vat of slurry','A core of wet clay']), A=pick([2,3,4,5]), a=pick([1000,1100,1200,1300]), b=pick([50,100,150]), h=pick([2,4]), m=A*(a*h+b*h*h/2), right=m+' kilograms';
    const wrong=uniq(right,[(A*a*h)+' kilograms',(A*(a+b*h)*h)+' kilograms',(a*h+b*h*h/2)+' kilograms',(A*(a*h+b*h*h))+' kilograms',(A*(a+b*h))+' kilograms'],3); if(wrong.length<3) return null;
    return {index:'q:16j.mass['+[what,A,a,b,h].join(';')+']', a3:['16j.mass',DASH,DASH], story:what+' stands '+h+' metres deep, with a level cross section of '+A+' square metres. At the depth x metres its density is '+a+' + '+b+'x kilograms per cubic metre.', lines:[], ask:'What is its mass?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Density: the mass is ∫ ρ(x)A(x) dx = '+A+' · '+int15(0,h,'('+a+' + '+b+'x) dx')+' = '+A+' · ('+(a*h)+' + '+(b*h*h/2)+') = '+m+'. The top density alone gives too little, and the bottom density alone too much.'}; }});

/* ===== Laundry 5, rung 17 (floor 3 pools, stage P): 17a to 17k, ln and exp ===== */
Object.assign(STEPS,{'17a':['r17a','The Log as an Area'],'17b':['r17b','Its Slope'],'17c':['r17c','ln(xy) = ln x + ln y'],'17d':['r17d','ln Reaches Every Height'],'17e':['r17e','exp and e'],'17f':['r17f','exp Is Its Own Slope'],
  '17g':['r17g','pˣ for Any Real x'],'17h':['r17h','Logs and Exponents by Hand'],'17i':['r17i','Slopes of e and ln'],'17j':['r17j','Growth and Decay'],'17k':['r17k','Partial Fractions Into Logs']});
const ln17=f=>fsame(f,fint(1))?'0':f.q===1?'ln '+f.p:'ln('+fshow(f)+')', E17=k=>'e'+(k===1?'':sup15(k))+'ˣ', co17=c=>c===1?'':c===-1?'−':sg(c);
const comb17=(i,j)=>{ const t=[]; if(i) t.push([i,'a']); if(j) t.push([j,'b']); if(!t.length) return '0'; return t.map(([c,l],n)=>{ const a=Math.abs(c), body=(a===1?'':a)+l; return n===0?(c<0?'−':'')+body:(c<0?' − ':' + ')+body; }).join(''); };
const two17=(A1,s1,A2,s2)=>(A1<0?'−':'')+(Math.abs(A1)===1&&s1[0]==='l'?'':Math.abs(A1))+s1+(A2<0?' − ':' + ')+(Math.abs(A2)===1&&s2[0]==='l'?'':Math.abs(A2))+s2;

/* ---------- 17a The Log as an Area ---------- */
const A17=[
  ['What is ln x, for x > 0?','the area under 1/t from 1 to x',['the area under t from 0 to x','the slope of 1/x at x','the power line of the table at n = −1'],'ln x = ∫₁ˣ dt/t. It fills the entry the table of powers left missing.'],
  ['What is the sign of ln x for 0 < x < 1?','negative',['positive','it is 0','it has no value'],'Log-rises: ln 1 = 0 and ln increases, so left of 1 it is below 0. The area is counted from 1 backwards.'],
  ['Has ln 0 a value?','no: 1/t is not bounded on [0, 1], and ln is defined only for x > 0',['yes: 0','yes: −1','yes: 1'],'The stretch from 1 to x must stay clear of 0. So ln has no value at 0 or at any negative number.'],
  ['Which bounds hold for every x > 0?','1 − 1/x ≤ ln x ≤ x − 1',['x − 1 ≤ ln x ≤ 1 − 1/x','0 ≤ ln x ≤ x','1/x ≤ ln x ≤ x'],'Log-bounds: between 1 and x the height 1/t lies between 1/x and 1. Equality only at x = 1.']];
QP.push({id:'17a.area',step:'17a',label:'the log as an area',open:()=>measured('17a'),make(){ return writtenQ('17a.area',A17); }},
  {id:'17a.bounds',step:'17a',mode:'work',label:'two bounds',open:()=>measured('17a'),make(){
    const x=pick([fint(2),fint(3),fint(4),fint(5),fint(6),fr(3,2),fr(5,4),fr(4,3),fr(5,2),fr(1,2),fr(2,3),fr(3,4),fr(1,3),fr(5,3),fr(7,4),fint(7),fint(8),fint(10),fr(7,2),fr(1,4),fr(2,5),fr(4,5),fr(7,5),fr(9,4)]), one=fint(1), inv=fr(x.q,x.p), lo=fsub(one,inv), hi=fsub(x,one), b=(u,v)=>fshow(u)+' and '+fshow(v), right=b(lo,hi);
    const wrong=uniq(right,[b(inv,x),b(hi,x),b(fint(0),hi),b(fsub(one,x),fsub(inv,one)),b(lo,x),b(inv,hi)],3); if(wrong.length<3) return null;
    return {index:'q:17a.bounds['+fshow(x)+']', lines:[['ln '+(x.q===1?x.p:'('+fshow(x)+')'),'to be trapped by log-bounds']], ask:'Between which two numbers does the technique put it?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Log-bounds: 1 − 1/x ≤ ln x ≤ x − 1. With x = '+fshow(x)+': 1 − '+fshow(inv)+' = '+fshow(lo)+', and '+fshow(x)+' − 1 = '+fshow(hi)+'.'}; }});

/* ---------- 17b Its Slope ---------- */
QP.push({id:'17b.slope',step:'17b',mode:'work',label:'the slope of ln, and areas under 1/x',open:()=>measured('17b'),make(){
    const k=rnd(3);
    if(k===0||k===1){ const a=pick([fint(2),fint(3),fint(4),fint(5),fint(8),fr(1,2),fr(1,3),fr(2,3),fr(3,2),fr(5,2)]), m=2+rnd(5), inv=fr(a.q,a.p), right=fshow(inv), wrong=uniq(right,k===0?[fshow(a),ln17(a),fshow(fneg(fmul(inv,inv))),fshow(fmul(inv,inv)),'0']:[fshow(fmul(fint(m),inv)),fshow(fmul(fr(1,m),inv)),String(m),fshow(fr(1,m)),fshow(a)],3); if(wrong.length<3) return null;
      return {index:'q:17b.slope['+(k?'k'+m:'p')+';'+fshow(a)+']', lines:[['f(x) = '+(k?'ln('+m+'x)':'ln x'),'for x > 0']], ask:'What is f′('+fshow(a)+')?', right, opts:shuffle([right,...wrong]), lead:'',
        why:k?'ln('+m+'x) = ln '+m+' + ln x, and a constant has slope 0. Or by the chain rule: '+m+' · 1/('+m+'x) = 1/x. At '+fshow(a)+' that is '+right+'.':'Slope-of-log: ln′(x) = 1/x. At '+fshow(a)+' that is '+right+'.'}; }
    const u=1+rnd(5), v=u+1+rnd(5), neg=Math.random()<0.35, R=neg?fr(u,v):fr(v,u), right=ln17(R), wrong=uniq(right,[ln17(neg?fr(v,u):fr(u,v)),ln17(fint(v-u)),fshow(fsub(fr(1,u),fr(1,v))),ln17(fint(u*v)),ln17(fint(v)),'it has no value'],3); if(wrong.length<3) return null;
    return {index:'q:17b.slope[a;'+u+';'+v+';'+(neg?'n':'p')+']', lines:[[neg?int15(-v,-u,'dx/x'):int15(u,v,'dx/x'),'an interval that does not contain 0']], ask:'What is it?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Area-under-1/x: ∫ dx/x = ln|x| + C on an interval clear of 0. '+(neg?'ln|'+sg(-u)+'| − ln|'+sg(-v)+'| = ln '+u+' − ln '+v:'ln '+v+' − ln '+u)+' = '+right+'.'+(neg?' Left of 0 the height 1/x is negative, and so is the area.':'')}; }});

/* ---------- 17c ln(xy) = ln x + ln y ---------- */
const chk17=()=>{ const x=2+rnd(8), y=pick([2,3,4,5,6,7,8,9].filter(z=>z!==x)), r=2+rnd(5), k=rnd(4), bad=Math.random()<0.5;
  return k===0?{l1:'ln '+(x*y),l2:bad?'ln '+x+' · ln '+y:'ln '+x+' + ln '+y,cite:'log-of-a-product',bad,why:'Log-of-a-product: ln(xy) = ln x + ln y. A product inside becomes a sum outside, not a product of logs.'}
    :k===1?{l1:'ln '+x+' + ln '+y,l2:'ln '+(bad?x+y:x*y),cite:'log-of-a-product',bad,why:'Log-of-a-product, read backwards: ln x + ln y = ln(xy), here ln '+(x*y)+'. There is no technique for ln(x + y).'}
    :k===2?{l1:'ln('+x+'/'+y+')',l2:bad?'ln '+x+' / ln '+y:'ln '+x+' − ln '+y,cite:'log-of-a-quotient',bad,why:'Log-of-a-quotient: ln(x/y) = ln x − ln y. The quotient of two logs is another thing: it is a log to another base.'}
    :{l1:'ln('+x+sup15(r)+')',l2:bad?'(ln '+x+')'+sup15(r):r+' ln '+x,cite:'log-of-a-power',bad,why:'Log-of-a-power: ln(xʳ) = r ln x. The exponent comes down in front. It does not stay as a power of the log.'}; };
QP.push({id:'17c.rules',step:'17c',mode:'work',label:'products, quotients and powers',open:()=>measured('17c'),make(){
    const i=rnd(6)-2, j=rnd(6)-2; if(!i&&!j) return null; const N=fr(2**Math.max(i,0)*3**Math.max(j,0),2**Math.max(-i,0)*3**Math.max(-j,0)), right=comb17(i,j), wrong=uniq(right,[comb17(j,i),comb17(i,-j),comb17(-i,j),comb17(i+1,j),comb17(i,j+1),comb17(2*i,j),comb17(i,2*j),comb17(i-1,j)],3); if(wrong.length<3) return null;
    return {index:'q:17c.rules['+i+';'+j+']', lines:[['a = ln 2 and b = ln 3','two names']], ask:'What is ln '+(N.q===1?N.p:'('+fshow(N)+')')+', in a and b?', right, opts:shuffle([right,...wrong]), lead:'',
      why:fshow(N)+' = '+[i?'2'+(i===1?'':sup15(i)):'',j?'3'+(j===1?'':sup15(j)):''].filter(Boolean).join(' · ')+'. Log-of-a-product and log-of-a-power give '+right.replace(/a/g,'ln 2').replace(/b/g,'ln 3').replace(/(\d)ln/g,'$1 ln')+', which is '+right+'. A power below 0 is a quotient, and its log is taken away.'}; }},
  {id:'17c.check',step:'17c',mode:'proof',label:'does the log line follow',open:()=>measured('17c'),make(){
    const c=chk17(), opts=['it follows from line 1','it does not follow from line 1'];
    return {index:'q:17c.check['+c.l1+';'+c.l2+']', stack:true, lines:[[c.l1,'given'],['= '+c.l2,c.cite+', on line 1']], ask:'Is line 2 right?', right:opts[c.bad?1:0], opts, lead:'', why:c.why}; }});

/* ---------- 17d ln Reaches Every Height ---------- */
const D17=[
  ['The slope of ln heads to 0 far out. Is ln bounded?','no: ln 2ⁿ = n ln 2 ≥ n/2 for every n',['yes','yes: by 1','no: its slope grows without bound'],'Log-unbounded: a shrinking slope does not make a ceiling. ln passes every bound, slowly.'],
  ['For a given real c, how many x > 0 have ln x = c?','exactly one',['none when c < 0','at least one, and perhaps more','two'],'Log-onto-ℝ: ln is continuous and reaches above and below c, so it takes c, and it rises, so only once.'],
  ['Which wins far out, ln x or √x?','√x: ln x/xᵖ heads to 0 for every rational p > 0',['ln x','neither: their ratio heads to 1','it depends on the base of the log'],'Log-loses-to-powers: ln is outgrown by every positive power of x, however small.'],
  ['As x heads to 0 from the right, what does ln x do?','it passes every bound downward',['it heads to 0','it heads to −1','it passes every bound upward'],'ln 2⁻ⁿ = −n ln 2 ≤ −n/2. The area from 1 back toward 0 has no floor.']];
QP.push({id:'17d.reach',step:'17d',label:'no ceiling, no floor',open:()=>measured('17d'),make(){ return writtenQ('17d.reach',D17); }});

/* ---------- 17e exp and e ---------- */
const E17w=[
  ['What is exp x?','the one positive number whose ln is x',['the number x multiplied by itself e times','the area under 1/t from 1 to x','the slope of ln at x'],'exp undoes ln. It exists, and is one function, because ln takes every real height exactly once.'],
  ['What is e?','the number whose ln is 1',['ln 1','the slope of ln at 1','the area under 1/t from 0 to 1'],'e = exp 1: the place past 1 where the area under 1/t from 1 reaches 1. And 2 < e < 3.'],
  ['Is exp(xy) = exp x · exp y?','no: adding becomes multiplying, exp(x + y) = exp x · exp y',['yes','yes, for positive x and y','no: exp(xy) = exp x + exp y'],'exp(1 · 1) = e, but e · e = e². The technique is about sums.'],
  ['Where does (1 + 1/n)ⁿ head as n grows?','to e',['to 1, since 1 + 1/n heads to 1','past every bound','to 2'],'e-as-a-limit: (1 + 1/n)ⁿ ≤ e ≤ (1 + 1/n)ⁿ⁺¹. The base shrinks toward 1 while the exponent grows, and neither wins outright.']];
QP.push({id:'17e.e',step:'17e',label:'exp and e',open:()=>measured('17e'),make(){ return writtenQ('17e.e',E17w); }},
  {id:'17e.exp',step:'17e',mode:'work',label:'adding becomes multiplying',open:()=>measured('17e'),make(){
    if(Math.random()<0.3){ const n=1+rnd(4), lo=fr((n+1)**n,n**n), hi=fr((n+1)**(n+1),n**(n+1)), b=(u,v)=>fshow(u)+' ≤ e ≤ '+fshow(v), right=b(lo,hi), wrong=uniq(right,[b(fr(n+1,n),lo),b(lo,fmul(lo,fint(2))),b(fint(n),fint(n+1)),b(fr(n**n,(n+1)**n),lo),b(lo,fadd(lo,fint(1)))],3); if(wrong.length<3) return null;
      return {index:'q:17e.exp[e;'+n+']', lines:[['(1 + 1/n)ⁿ ≤ e ≤ (1 + 1/n)ⁿ⁺¹','e-as-a-limit'],['n = '+n,'given']], ask:'Which bounds does it give?', right, opts:shuffle([right,...wrong]), lead:'', why:'1 + 1/'+n+' = '+fshow(fr(n+1,n))+'. Its power '+n+' is '+fshow(lo)+', and its power '+(n+1)+' is '+fshow(hi)+'.'}; }
    const A=pick([fint(2),fint(3),fint(4),fint(5),fint(9),fr(1,2),fr(3,2)]), B=pick([fint(2),fint(3),fint(5),fint(7),fr(1,3)].filter(z=>!fsame(z,A))), k=rnd(4), invB=fr(B.q,B.p), invA=fr(A.q,A.p);
    const [ask,R,alts]=k===0?['exp(x + y)',fmul(A,B),[fadd(A,B),fmul(A,invB),fsub(A,B),fmul(A,A)]]:k===1?['exp(x − y)',fmul(A,invB),[fsub(A,B),fmul(A,B),fmul(B,invA),fneg(fmul(A,B))]]:k===2?['exp(−x)',invA,[fneg(A),fsub(fint(1),A),A,fneg(invA)]]:['exp(2x)',fmul(A,A),[fmul(fint(2),A),fadd(A,fint(2)),fmul(A,B),fmul(fint(4),A)]];
    const right=fshow(R), wrong=frs16(right,alts.concat([fadd(R,fint(1))])); if(wrong.length<3) return null;
    return {index:'q:17e.exp[r;'+[fshow(A),fshow(B),k].join(';')+']', lines:[['exp x = '+fshow(A)+' and exp y = '+fshow(B),'given']], ask:'What is '+ask+'?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Adding-becomes-multiplying: '+(k===0?'exp(x + y) = exp x · exp y':k===1?'exp(x − y) = exp x · exp(−y) = exp x/exp y':k===2?'exp(−x) = 1/exp x':'exp(2x) = exp(x + x) = (exp x)²')+' = '+right+'.'}; }});

/* ---------- 17f exp Is Its Own Slope ---------- */
const F17=[
  ['Is (eˣ)′ = x eˣ⁻¹?','no: the power rule is for a fixed exponent, and (eˣ)′ = eˣ',['yes','yes, for x > 0','no: (eˣ)′ = e'],'Slope-of-exp: exp is its own slope. Here the exponent is the variable, not a fixed number.'],
  ['f′(x) = f(x) at every x of an interval. What must f be?','Ceˣ, for some constant C',['eˣ, and nothing else','eˣ + C, for some constant C','any pˣ with p > 0'],'Slope-equals-size: f(x)e⁻ˣ has slope 0, so it is constant. C = 0 is allowed, the function that is 0 everywhere.'],
  ['What is the slope of exp at 0?','1',['0','e','1/e'],'exp′(0) = exp 0 = 1, since ln 1 = 0.'],
  ['f′ = kf on an interval containing 0, and f(0) is known. How many functions fit?','exactly one: f(0)e^(kx)',['one for each real C','none, unless k = 1','two'],'Proportional-slope: the whole course of f is fixed by its rule of change and one value.']];
QP.push({id:'17f.only',step:'17f',label:'the only one',open:()=>measured('17f'),make(){ return writtenQ('17f.only',F17); }},
  {id:'17f.slope',step:'17f',mode:'work',label:'slopes with e',open:()=>measured('17f'),make(){
    const k=pick([2,3,4,5,6,-1,-2,-3,-4]);
    if(Math.random()<0.5){ const right=co17(k)+E17(k), wrong=uniq(right,[E17(k),co17(k)+'x·e'+sup15(k)+'ˣ⁻¹',(k<0?'−':'')+E17(k)+'/'+Math.abs(k),co17(-k)+E17(k)],3);
      return {index:'q:17f.slope[d;'+k+']', lines:[['f(x) = '+E17(k),'at every real']], ask:'Which is f′(x)?', right, opts:shuffle([right,...wrong]), lead:'', why:'Chain for slopes, with slope-of-exp: the outside is its own slope, and the inside '+co17(k)+'x has the slope '+sg(k)+'. So f′(x) = '+right+'.'}; }
    const c=pick([-5,-3,-2,2,3,4,5,6,7,8,9].filter(z=>z!==k)), right=co17(c)+E17(k), wrong=uniq(right,[co17(k)+E17(c),co17(c)+'eˣ',lin9(k,c),co17(c)+E17(k)+pm(k),co17(c*k)+E17(k)],3);
    return {index:'q:17f.slope[p;'+k+';'+c+']', lines:[['f′(x) = '+co17(k)+'f(x)','at every real'],['f(0) = '+sg(c),'given']], ask:'Which is f(x)?', right, opts:shuffle([right,...wrong]), lead:'', why:'Proportional-slope: f′ = kf gives f(x) = f(0)e^(kx). Here k = '+sg(k)+' and f(0) = '+sg(c)+'. Check: its slope is '+sg(k)+' times itself, and e⁰ = 1.'}; }});

/* ---------- 17g pˣ for Any Real x ---------- */
const G17=[
  ['What is pˣ, for p > 0 and a real x?','exp(x ln p)',['p multiplied by itself x times','ln(x exp p)','x exp p'],'The definition. For a rational x it agrees with the powers and roots of rung 8 (powers-agree).'],
  ['Is (2ˣ)′ = x 2ˣ⁻¹?','no: the exponent varies, and the slope is 2ˣ ln 2',['yes','yes, for whole x','no: the slope is 2ˣ'],'Slope-of-pˣ: (pˣ)′ = pˣ ln p. The power rule is for a fixed exponent and a varying base.'],
  ['Is (−8)ˣ = e^(x ln(−8))?','no: ln(−8) has no value, and pˣ is defined for p > 0',['yes','yes, for whole x only, by this definition','no: it is −e^(x ln 8)'],'The definition goes through ln p, which needs p > 0.'],
  ['What is ln(pˣ), for p > 0 and a real x?','x ln p',['(ln p)ˣ','p ln x','ln p + ln x'],'Real-exponent: log-of-a-power now holds for every real exponent.']];
QP.push({id:'17g.def',step:'17g',label:'pˣ by its definition',open:()=>measured('17g'),make(){ return writtenQ('17g.def',G17); }},
  {id:'17g.power',step:'17g',mode:'work',label:'logs to a base, and the slope of pˣ',open:()=>measured('17g'),make(){
    if(Math.random()<0.55){ const p=pick([2,2,3,5,10]), n=p===2?rnd(9)-3:p===3?rnd(7)-3:rnd(6)-2, N=n<0?'(1/'+(p**-n)+')':String(p**n), right=sg(n), wrong=num13(right,[-n,n+1,n-1,p,n*p,p**Math.abs(n),n+2]); if(wrong.length<3) return null;
      return {index:'q:17g.power[l;'+p+';'+n+']', lines:[['log'+sub15(p)+' '+N,'a log to the base '+p]], ask:'What is it?', right, opts:shuffle([right,...wrong]), lead:'', why:'log'+sub15(p)+' y is the x with '+p+'ˣ = y. '+p+sup15(n)+' = '+(n<0?'1/'+(p**-n):p**n)+', so it is '+right+'.'}; }
    const p=pick([2,3,5]), a=rnd(4), v=p**a, right=(v===1?'':v+' ')+'ln '+p, wrong=uniq(right,[String(a*p**Math.max(a-1,0)),String(v),'ln '+p,v+'/ln '+p,(v*p)+' ln '+p,(a?a+' ':'2 ')+'ln '+p],3); if(wrong.length<3) return null;
    return {index:'q:17g.power[s;'+p+';'+a+']', lines:[['f(x) = '+p+'ˣ','at every real']], ask:'What is f′('+a+')?', right, opts:shuffle([right,...wrong]), lead:'', why:'Slope-of-pˣ: ('+p+'ˣ)′ = '+p+'ˣ ln '+p+'. At '+a+' that is '+right+'. The power rule does not apply: the exponent is the variable.'}; }});

/* ---------- 17h Logs and Exponents by Hand ---------- */
QP.push({id:'17h.base',step:'17h',mode:'work',label:'changing base, and equations',open:()=>measured('17h'),make(){
    const k=rnd(3);
    if(k===0){ const p=pick([2,3]), a=pick([2,3]), b=pick([1,2,3,4,5].filter(z=>z!==a)), base=p**a, N=p**b, R=fr(b,a), right=fshow(R), wrong=frs16(right,[fr(a,b),fr(N,base),fint(b-a),fint(b),fint(a),fr(b,a*p)]); if(wrong.length<3) return null;
      return {index:'q:17h.base[c;'+base+';'+N+']', lines:[['log'+sub15(base)+' '+N,'a log to the base '+base]], ask:'What is it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Change-of-base, through the base '+p+': log'+sub15(p)+' '+N+' / log'+sub15(p)+' '+base+' = '+b+'/'+a+(fshow(R)===b+'/'+a?'':' = '+right)+'.'}; }
    if(k===1){ const m=2+rnd(4), n=m+1+rnd(4), right='x = ln '+m+' or x = ln '+n, wrong=['x = '+m+' or x = '+n,'x = ln '+(m+n),'x = ln '+(m*n),'x = e'+sup15(m)+' or x = e'+sup15(n)];
      return {index:'q:17h.base[q;'+m+';'+n+']', lines:[['e²ˣ − '+(m+n)+'eˣ + '+(m*n)+' = 0','a quadratic in eˣ']], ask:'What are its solutions?', right, opts:shuffle([right,...take(wrong,3)]), lead:'', why:'(eˣ − '+m+')(eˣ − '+n+') = 0, so eˣ = '+m+' or eˣ = '+n+'. Take ln of both sides: ln is one to one.'}; }
    const [r,a,n,o]=pick([[4,2,3,-2],[8,6,4,-2],[4,3,2,-1],[8,7,3,-1],[2,1,1,-1],[8,4,5,-4],[16,14,5,-2],[16,12,6,-4]]), opts=['x = '+r+' only','x = '+r+' or x = '+sg(o),'x = '+sg(o)+' only','no solution'];
    return {index:'q:17h.base[d;'+r+';'+a+']', lines:[['log₂ x + log₂(x − '+a+') = '+n,'to be solved']], ask:'What are its solutions?', right:opts[0], opts, lead:'', why:'log-of-a-product: log₂(x(x − '+a+')) = '+n+', so x(x − '+a+') = '+(2**n)+', and x = '+r+' or x = '+sg(o)+'. But log₂('+sg(o)+') has no value: check the domain. Only '+r+' is left.'}; }},
  {id:'17h.fit',step:'17h',mode:'word',label:'from two measurements',open:()=>measured('17h'),make(){
    const [what,unit]=pick([['The count of cells in a culture','hour'],['The number of weed patches on a pond','week'],['The number who have heard a rumour','day'],['The number of mould spots on a wall','day']]), b=pick([2,2,3]), A=2+rnd(7), t1=1+rnd(2), d=2+rnd(2), t2=t1+d, Y1=A*b**t1, Y2=A*b**t2, fac=Math.random()<0.5;
    const right=String(fac?b:A), wrong=uniq(right,(fac?[b**d,(Y2-Y1)/d,d,b+1,Y2/Y1/d]:[Y1,Y1-(Y2-Y1)/d*t1,Y1/t1,A*b,Y1/b**(t1-1)*1+1]).filter(z=>Number.isInteger(z)&&z>=0).map(String),3); if(wrong.length<3) return null;
    return {index:'q:17h.fit['+[what,b,A,t1,t2,fac?'f':'a'].join(';')+']', a3:['17h.fit['+(fac?'factor':'start')+']',DASH,DASH], story:what+' grows by equal factors in equal times. It is '+Y1+' at '+unit+' '+t1+' and '+Y2+' at '+unit+' '+t2+'.', lines:[], ask:fac?'By what factor does it grow each '+unit+'?':'What was it at '+unit+' 0?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'y = A bᵗ. The ratio '+Y2+'/'+Y1+' = '+(b**d)+' is b'+sup15(d)+', so b = '+b+'. Then A = '+Y1+'/'+b+sup15(t1)+' = '+A+'. The start cancels in the ratio, which is why two measurements are enough.'}; }});

/* ---------- 17i Slopes of e and ln ---------- */
const I17=[
  ['What is (xˣ)′, for x > 0?','xˣ(ln x + 1)',['x · xˣ⁻¹','xˣ ln x','xˣ'],'Log-slope: ln(xˣ) = x ln x has the slope ln x + 1, and f′ = f · (ln f)′. Neither the power rule nor slope-of-pˣ fits, since base and exponent both vary.'],
  ['What is ∫ ln x dx?','x ln x − x + C',['1/x + C','x ln x + C','(ln x)²/2 + C'],'Parts, with f = ln x and g′ = 1. Check: (x ln x − x)′ = ln x + 1 − 1.'],
  ['Which wins far out, x¹⁰⁰ or 2ˣ?','2ˣ: xʳ/bˣ heads to 0 for every real r and every b > 1',['x¹⁰⁰','neither: their ratio heads to 1','x¹⁰⁰ until 100, and after that neither'],'Exponentials-pass-powers: bˣ eventually passes every polynomial, and stays past it.'],
  ['What is (ln f)′, where f > 0 has a slope?','f′/f',['1/f','f′ ln f','ln f′'],'Chain for slopes with slope-of-log. Read backwards, ∫ g′/g = ln|g| + C.']];
QP.push({id:'17i.races',step:'17i',label:'taking ln first',open:()=>measured('17i'),make(){ return writtenQ('17i.races',I17); }},
  {id:'17i.logslope',step:'17i',mode:'work',label:'slopes over values',open:()=>measured('17i'),make(){
    const k=rnd(3), c=1+rnd(5);
    if(k===0){ const g='x² + '+c, right='ln('+g+') + C', wrong=['1/('+g+') + C','2x ln('+g+') + C','x²/('+g+') + C'];
      return {index:'q:17i.logslope[i;'+c+']', lines:[['∫ 2x/('+g+') dx','a slope over its value']], ask:'Which is it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Area-under-g′/g: the top 2x is the slope of the bottom '+g+', so the integral is ln|'+g+'| + C. The bars may go, since '+g+' > 0.'}; }
    if(k===1){ const b=1+rnd(4), R=fr(b*b+c,c), right=ln17(R), wrong=uniq(right,[ln17(fint(b*b+c)),ln17(fint(b*b)),ln17(fr(c,b*b+c)),fshow(fsub(fr(1,c),fr(1,b*b+c))),ln17(fint(b*b+2*c)),fshow(fr(b*b,c))],3); if(wrong.length<3) return null;
      return {index:'q:17i.logslope[d;'+c+';'+b+']', lines:[[int15(0,b,'2x/(x² + '+c+') dx'),'a slope over its value']], ask:'What is it?', right, opts:shuffle([right,...wrong]), lead:'', why:'An antiderivative is ln(x² + '+c+'). Between the ends: ln '+(b*b+c)+' − ln '+c+' = '+right+', by log-of-a-quotient.'}; }
    const a=rnd(5)-2, u=a+1+rnd(3), v=u+1+rnd(4), R=fr(v-a,u-a), right=ln17(R), wrong=uniq(right,[ln17(fr(v,u)),ln17(fint(v-u)),fshow(fsub(fr(1,u-a),fr(1,v-a))),ln17(fr(u-a,v-a)),ln17(fint(v-a)),ln17(fint((v-a)*(u-a)))],3); if(wrong.length<3||u<=0) return null;
    return {index:'q:17i.logslope[s;'+[a,u,v].join(';')+']', lines:[[int15(u,v,'dx/'+fac14(a)),'the bottom is not 0 on the interval']], ask:'What is it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Area-under-1/x with a straight inside: an antiderivative is ln|'+(a===0?'x':'x'+pm(-a))+'|. Between the ends: ln '+(v-a)+' − ln '+(u-a)+' = '+right+'.'}; }});

/* ---------- 17j Growth and Decay ---------- */
QP.push({id:'17j.growth',step:'17j',mode:'work',label:'equal steps, equal factors',open:()=>measured('17j'),make(){
    if(Math.random()<0.5){ const kk=pick([fr(1,2),fr(1,3),fr(1,5),fr(1,10),fint(2),fint(3),fr(2,3),fr(3,4),fr(1,4)]), neg=Math.random()<0.5, c=fr(kk.q,kk.p), T=f=>fsame(f,fint(1))?'ln 2':f.q===1?f.p+' ln 2':'('+fshow(f)+') ln 2', right=T(c), wrong=uniq(right,[T(kk),fshow(fmul(fint(2),c)),fshow(c),'ln '+(c.q===1?2*c.p:'('+fshow(fmul(fint(2),c))+')'),T(fmul(fint(2),c))],3); if(wrong.length<3) return null;
      return {index:'q:17j.growth[t;'+fshow(kk)+';'+(neg?'h':'d')+']', lines:[['y = y₀e^(kt), with k = '+(neg?'−':'')+fshow(kk),'given']], ask:'How long does y take to '+(neg?'halve':'double')+'?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'Doubling-time: e^(kT) = '+(neg?'1/2':'2')+' exactly when T = ln 2/|k|. Here |k| = '+fshow(kk)+', so T = '+right+', from whatever instant the count starts.'}; }
    const A=2+rnd(8), r=pick([2,3,4]), h=pick([2,3,5]), geo=Math.random()<0.5, v=geo?A*r*r:A+2*(A*r-A), right=String(v), wrong=uniq(right,[geo?A+2*(A*r-A):A*r*r,2*A*r,A*r**3,A*r+r,A*r+A].map(String),3); if(wrong.length<3) return null;
    return {index:'q:17j.growth[s;'+[A,r,h,geo?'g':'l'].join(';')+']', lines:[['y changes by equal '+(geo?'factors':'steps')+' in equal times','given'],['y(0) = '+A+' and y('+h+') = '+(A*r),'given']], ask:'What is y('+(2*h)+')?', right, opts:shuffle([right,...wrong]), lead:'',
      why:geo?'Equal-steps-equal-factors: over each stretch of '+h+' the factor is '+r+'. '+(A*r)+' · '+r+' = '+right+'. This is y₀e^(kt).':'Equal steps: over each stretch of '+h+' the step is '+(A*r-A)+'. '+(A*r)+' + '+(A*r-A)+' = '+right+'. This is the line y₀ + mt, not an exponential.'}; }},
  {id:'17j.cooling',step:'17j',mode:'word',label:'cooling',open:()=>measured('17j'),make(){
    const what=pick(['A loaf from the oven','A forged bar','A pot of broth','A kiln brick']), room=pick([10,15,20,25]), [n,D]=pick([[2,40],[2,80],[2,120],[2,160],[3,90],[3,180],[4,80],[4,160]]), h=pick([5,10,15,20]), T0=room+D, T1=room+D/n, T2=room+D/(n*n), right=T2+' degrees';
    const wrong=uniq(right,[sg(T1-(T0-T1))+' degrees',room+' degrees',(room+D/(2*n))+' degrees',(T1-10)+' degrees',(T2+10)+' degrees'],3); if(wrong.length<3) return null;
    return {index:'q:17j.cooling['+[what,room,D,n,h].join(';')+']', a3:['17j.cooling',DASH,DASH], story:what+' at '+T0+' degrees is left in a room at '+room+' degrees. After '+h+' minutes it is at '+T1+' degrees.', lines:[], ask:'By the law of cooling, what is its temperature after '+(2*h)+' minutes?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The law of cooling: the difference from the room decays by equal factors in equal times. It went from '+D+' to '+(D/n)+' in '+h+' minutes, a factor of 1/'+n+'. After '+h+' more it is '+(D/(n*n))+', so the temperature is '+room+' + '+(D/(n*n))+' = '+T2+'. Equal steps would give '+sg(T1-(T0-T1))+'.'}; }});

/* ---------- 17k Partial Fractions Into Logs ---------- */
const K17=[
  ['Can x²/((x − 1)(x + 1)) be split as A/(x − 1) + B/(x + 1)?','no: the top’s degree is not less than the bottom’s, so divide first',['yes, with A = 1 and B = 1','yes, with A = 1/2 and B = −1/2','no: such a quotient has no antiderivative'],'x²/(x² − 1) = 1 + 1/(x² − 1). Straight-factors asks for a top of lower degree.'],
  ['By the cover-up rule, how is the number over (x − c) found?','cover (x − c) in the bottom, and put x = c into what is left',['put x = 0 into the whole quotient','take the slope of the bottom at c','cover the top, and put x = c into the bottom'],'Aᵢ = p(cᵢ)/qᵢ(cᵢ), with qᵢ the bottom without its factor (x − cᵢ).'],
  ['After the split, what does a piece A/(x − c) integrate to?','A ln|x − c|',['−A/(x − c)²','A/(x − c)²','A ln x − c'],'Area-under-1/x with a straight inside, on an interval that does not contain c.'],
  ['Does straight-factors split 1/(x − 1)² as A/(x − 1) + B/(x − 1)?','no: the technique needs different factors',['yes, with A = B = 1/2','yes, with A = 1 and B = −1','yes, with A = 1 and B = 0'],'The right side is (A + B)/(x − 1), which is never 1/(x − 1)². The cᵢ must be different reals.']];
QP.push({id:'17k.cover',step:'17k',label:'the cover-up rule',open:()=>measured('17k'),make(){ return writtenQ('17k.cover',K17); }},
  {id:'17k.split',step:'17k',mode:'work',label:'the split, and its logs',open:()=>measured('17k'),make(){
    const c1=rnd(6)-3, c2=c1+1+rnd(3), A1=pick([-3,-2,-1,1,2,3,4]), A2=pick([-3,-2,-1,1,2,3,4]); if(A1+A2===0) return null;
    const top=lin9(A1+A2,-(A1*c2+A2*c1)), bot=fac14(c1)+fac14(c2), logs=Math.random()<0.5, s1=logs?'ln|'+(c1===0?'x':'x'+pm(-c1))+'|':'/'+fac14(c1), s2=logs?'ln|'+(c2===0?'x':'x'+pm(-c2))+'|':'/'+fac14(c2), form=(a,b)=>two17(a,logs?' '+s1:s1,b,logs?' '+s2:s2).replace(/(^|− |\+ )1 ln/g,'$1ln').replace(/^−1 ln/,'−ln')+(logs?' + C':'');
    const right=form(A1,A2), wrong=uniq(right,[form(A2,A1),form(A1,-A2),form(-A1,A2),form(A1+A2,-(A1*c2+A2*c1)||1),form(A1+1,A2),form(A1,A2+1)],3); if(wrong.length<3) return null;
    return {index:'q:17k.split['+[c1,c2,A1,A2,logs?'l':'s'].join(';')+']', lines:[[(logs?'∫ ':'')+'('+top+')/('+bot+')'+(logs?' dx':''),logs?'on an interval clear of '+sg(c1)+' and '+sg(c2):'to be split into straight pieces']], ask:logs?'Which is it?':'Which split is it?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Cover-up: cover '+fac14(c1)+' and put x = '+sg(c1)+', giving '+sg(A1*(c1-c2))+'/'+par10(c1-c2)+' = '+sg(A1)+'. Cover '+fac14(c2)+' and put x = '+sg(c2)+', giving '+sg(A2*(c2-c1))+'/'+par10(c2-c1)+' = '+sg(A2)+'.'+(logs?' Then each piece is a log.':'')}; }});

/* ===== Laundry 5, rung 18 (floor 4 pools, stage Q): 18a to 18j, the plane ===== */
Object.assign(STEPS,{'18a':['r18a','Points, Distance, the Displacement Pattern'],'18b':['r18b','The Triangle Inequality in the Plane'],'18c':['r18c','Lines'],'18d':['r18d','Circles'],'18e':['r18e','Conics by Distances'],
  '18f':['r18f','Triangles and Parallels by Hand'],'18g':['r18g','Lines in Coordinates'],'18h':['r18h','Circles and Conics'],'18i':['r18i','Curves Traced in Time'],'18j':['r18j','Constructions With Straightedge and Compass']});
const pt18=(x,y)=>'('+sg(x)+', '+sg(y)+')', fpt18=(x,y)=>'('+fshow(x)+', '+fshow(y)+')', TRI18=[[3,4,5],[4,3,5],[6,8,10],[8,6,10],[5,12,13],[12,5,13],[8,15,17],[15,8,17]], sn18=()=>pick([1,-1]);
const eq18=(A,B,C)=>{ const t=[]; if(A) t.push([A,'x']); if(B) t.push([B,'y']); return t.map(([c,l],n)=>{ const a=Math.abs(c), body=(a===1?'':a)+l; return n===0?(c<0?'−':'')+body:(c<0?' − ':' + ')+body; }).join('')+' = '+sg(C); };

/* ---------- 18a Points, Distance, the Displacement Pattern ---------- */
const A18=[
  ['When are two displacements u and v perpendicular?','when u · v = 0',['when u · v = 1','when |u| = |v|','when u + v = 0'],'u ⊥ v is defined by the dot product: u₁v₁ + u₂v₂ = 0.'],
  ['Is √(a² + b²) = a + b?','no: √(9 + 16) = 5, not 7',['yes','yes, for positive a and b','no: it is a · b'],'The distance squares, adds and then roots. The root of a sum is not the sum of the roots.'],
  ['In a triangle, the squares of two sides add to the square of the third. What follows?','the angle where those two sides meet is right',['nothing','the triangle has two equal sides','the third side is the shortest'],'Right-triangle runs both ways: |u + v|² = |u|² + |v|² exactly when u ⊥ v.'],
  ['Is |x₂ − x₁| + |y₂ − y₁| the distance of this step?','no: that is the distance along city blocks',['yes','yes, when the points are far apart','no: it is the square of the distance'],'This step’s distance is √((x₂ − x₁)² + (y₂ − y₁)²). The two agree only along a level or an upright line.']];
QP.push({id:'18a.perp',step:'18a',label:'distance and the right angle',open:()=>measured('18a'),make(){ return writtenQ('18a.perp',A18); }},
  {id:'18a.dist',step:'18a',mode:'work',label:'distances, dots and midpoints',open:()=>measured('18a'),make(){
    const k=rnd(4), x=rnd(9)-4, y=rnd(9)-4;
    if(k===0){ const [a,b,c]=pick(TRI18), dx=sn18()*a, dy=sn18()*b, right=String(c), wrong=uniq(right,[a+b,a*a+b*b,Math.abs(a-b),c+1,c*c,c-1].map(String),3);
      return {index:'q:18a.dist[d;'+[x,y,dx,dy].join(';')+']', lines:[['P = '+pt18(x,y)+' and Q = '+pt18(x+dx,y+dy),'two points']], ask:'What is d(P, Q)?', right, opts:shuffle([right,...wrong]), lead:'', why:'Q − P = '+pt18(dx,dy)+', and its length is √('+(a*a)+' + '+(b*b)+') = √'+(c*c)+' = '+c+'. Adding '+a+' and '+b+' gives the distance along city blocks.'}; }
    if(k===1){ const u=[rnd(9)-4,rnd(9)-4], v=[rnd(9)-4,rnd(9)-4], d=u[0]*v[0]+u[1]*v[1], right=sg(d), wrong=num13(right,[u[0]*v[1]+u[1]*v[0],u[0]*v[0]-u[1]*v[1],u[0]*v[1]-u[1]*v[0],(u[0]+u[1])*(v[0]+v[1]),d+1,-d,u[0]+v[0]+u[1]+v[1]]); if(wrong.length<3) return null;
      return {index:'q:18a.dist[o;'+u.concat(v).join(';')+']', lines:[['u = '+pt18(u[0],u[1])+' and v = '+pt18(v[0],v[1]),'two displacements']], ask:'What is u · v?', right, opts:shuffle([right,...wrong]), lead:'', why:'u · v = u₁v₁ + u₂v₂ = '+par10(u[0])+' · '+par10(v[0])+' + '+par10(u[1])+' · '+par10(v[1])+' = '+right+'.'+(d===0?' So u ⊥ v.':'')}; }
    if(k===2){ const m=1+rnd(3), n=1+rnd(3), s=m+n, dx=s*(rnd(5)-2), dy=s*(1+rnd(3))*sn18(), X=[x+m*dx/s,y+m*dy/s], right=pt18(X[0],X[1]), wrong=uniq(right,[pt18(x+n*dx/s,y+n*dy/s),pt18(m*dx/s,m*dy/s),pt18(x+dx,y+dy),pt18(X[1],X[0]),pt18(X[0]+1,X[1])],3); if(wrong.length<3) return null;
      return {index:'q:18a.dist[p;'+[x,y,dx,dy,m,n].join(';')+']', lines:[['P = '+pt18(x,y)+' and Q = '+pt18(x+dx,y+dy),'two points']], ask:m===n?'What is the midpoint of PQ?':'Which point divides the way from P to Q in the ratio '+m+' : '+n+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'Part-of-the-way with t = '+fshow(fr(m,s))+': P + t(Q − P) = '+pt18(x,y)+' + '+fshow(fr(m,s))+' · '+pt18(dx,dy)+' = '+right+'.'}; }
    const [a,b,c,d]=pick([[1,2,2,3],[2,1,2,3],[2,3,6,7],[3,6,2,7],[2,6,9,11],[6,2,9,11],[1,4,8,9],[4,8,1,9],[4,4,7,9]]), z=rnd(5)-2, right=String(d), wrong=uniq(right,[a+b+c,a*a+b*b+c*c,d+1,d-1,Math.max(a,b,c)].map(String),3);
    return {index:'q:18a.dist[s;'+[x,y,z,a,b,c].join(';')+']', lines:[['P = ('+sg(x)+', '+sg(y)+', '+sg(z)+') and Q = ('+sg(x+a)+', '+sg(y-b)+', '+sg(z+c)+')','two points of space']], ask:'What is d(P, Q)?', right, opts:shuffle([right,...wrong]), lead:'', why:'Cross the floor, then climb: the plane’s distance used twice gives √('+(a*a)+' + '+(b*b)+' + '+(c*c)+') = √'+(d*d)+' = '+d+'.'}; }});

/* ---------- 18b The Triangle Inequality in the Plane ---------- */
const B18=[
  ['When is d(P, R) = d(P, Q) + d(Q, R)?','exactly when Q is on the segment PR',['always','never','exactly when Q is the midpoint of PR'],'Equality-on-the-segment: the detour through Q costs nothing only when Q lies on the straight way.'],
  ['Is |u + v| = |u| + |v| for all displacements?','no: only when one is a non-negative multiple of the other',['yes','no: never','no: only when u ⊥ v'],'The triangle technique gives ≤. For u ⊥ v it is |u + v|² = |u|² + |v|².'],
  ['How large can |u · v| be?','at most |u| |v|',['at most |u| + |v|','at most |u|² + |v|²','as large as you like'],'Dot-bound, with equality exactly when one of u, v is a multiple of the other.'],
  ['What does the triangle technique say of any three points P, Q, R?','d(P, R) ≤ d(P, Q) + d(Q, R)',['d(P, R) = d(P, Q) + d(Q, R)','d(P, R) ≥ d(P, Q) + d(Q, R)','d(P, R)² = d(P, Q)² + d(Q, R)²'],'Going by way of Q is never shorter than going straight.']];
QP.push({id:'18b.detour',step:'18b',label:'the detour',open:()=>measured('18b'),make(){ return writtenQ('18b.detour',B18); }},
  {id:'18b.range',step:'18b',mode:'work',label:'how far apart',open:()=>measured('18b'),make(){
    const a=2+rnd(9), b=pick([1,2,3,4,5,6,7,8,9,10].filter(z=>z!==a)), k=rnd(3), right=String(k===0?a+b:k===1?Math.abs(a-b):a*b), wrong=uniq(right,[a+b,Math.abs(a-b),a*b,Math.max(a,b),a*a+b*b,Math.min(a,b)].map(String),3); if(wrong.length<3) return null;
    return {index:'q:18b.range['+[a,b,k].join(';')+']', lines:[k===2?['|u| = '+a+' and |v| = '+b,'two displacements']:['d(P, Q) = '+a+' and d(Q, R) = '+b,'three points']], ask:k===0?'What is the most that d(P, R) can be?':k===1?'What is the least that d(P, R) can be?':'What is the most that u · v can be?', right, opts:shuffle([right,...wrong]), lead:'',
      why:k===0?'The triangle technique: d(P, R) ≤ '+a+' + '+b+' = '+right+', reached when Q is on the segment PR.':k===1?'The triangle technique on P, R, Q: '+Math.max(a,b)+' ≤ d(P, R) + '+Math.min(a,b)+', so d(P, R) ≥ '+right+'.':'Dot-bound: |u · v| ≤ |u| |v| = '+right+', reached when v is a positive multiple of u.'}; }},
  {id:'18b.onseg',step:'18b',mode:'proof',label:'is Q on the segment',open:()=>measured('18b'),make(){
    const a=1+rnd(9), b=1+rnd(9), ok=Math.random()<0.5, c=ok?a+b:a+b-1-rnd(Math.min(a,b)), opts=['it is licensed','it is not licensed']; if(c<=Math.abs(a-b)) return null;
    return {index:'q:18b.onseg['+[a,b,c].join(';')+']', stack:true, lines:[['d(P, Q) = '+a,'given'],['d(Q, R) = '+b,'given'],['d(P, R) = '+c,'given'],['Q is on the segment PR','equality-on-the-segment, on lines 1 to 3']], ask:'Is line 4 licensed?', right:opts[ok?0:1], opts, lead:'',
      why:ok?a+' + '+b+' = '+c+': the detour through Q costs nothing, and that happens exactly when Q is on the segment.':a+' + '+b+' = '+(a+b)+', more than '+c+'. The detour costs something, so Q is off the segment, and P, Q, R are the corners of a triangle.'}; }});

/* ---------- 18c Lines ---------- */
const C18=[
  ['What is the slope of the line x = 3?','it has none',['0','3','1/3'],'A vertical line has no slope. The form Ax + By = C, with B = 0, handles it.'],
  ['When are two different lines parallel?','when they have no point in common',['when they meet at a right angle','when their slopes multiply to −1','when they have the same y-intercept'],'The definition. By two-lines-meet it happens exactly when their normals are multiples of each other.'],
  ['The line Ax + By = C: which displacement is a direction of it?','(−B, A)',['(A, B)','(A, −B) turned to (C, C)','(B, A)'],'Two-descriptions-agree: (A, B) is perpendicular to the line, and (−B, A) lies along it.'],
  ['How many lines pass through two different points?','exactly one',['at least one','two','as many as you like'],'Line-through-two-points: the line through P with direction Q − P, and no other.']];
QP.push({id:'18c.slope',step:'18c',label:'two descriptions of a line',open:()=>measured('18c'),make(){ return writtenQ('18c.slope',C18); }},
  {id:'18c.lines',step:'18c',mode:'work',label:'lines by their equations',open:()=>measured('18c'),make(){
    const k=rnd(4), x0=rnd(7)-3, y0=rnd(7)-3;
    if(k===0){ const v=[1+rnd(4),pick([-3,-2,-1,1,2,3,4])], A=-v[1], B=v[0], C=A*x0+B*y0, right=eq18(A,B,C), wrong=uniq(right,[eq18(v[0],v[1],v[0]*x0+v[1]*y0),eq18(A,B,C+pick([1,2,-1])),eq18(-A,B,-A*x0+B*y0+ (A*x0?0:1)),eq18(B,A,B*x0+A*y0+1)],3); if(wrong.length<3) return null;
      return {index:'q:18c.lines[t;'+[x0,y0,v[0],v[1]].join(';')+']', lines:[['P = '+pt18(x0,y0)+' and Q = '+pt18(x0+v[0],y0+v[1]),'two points']], ask:'Which is the line through P and Q?', right, opts:shuffle([right,...wrong]), lead:'', why:'Its direction is Q − P = '+pt18(v[0],v[1])+', so a normal is '+pt18(A,B)+'. The line is n · X = n · P: '+right+'. Both points satisfy it.'}; }
    if(k===1){ const [A1,B1]=pick([[1,1],[2,1],[1,2],[3,1],[1,-1],[2,-1]]), [A2,B2]=pick([[1,-2],[1,3],[3,2],[2,3],[1,-3],[3,-1]].filter(([a,b])=>A1*b-a*B1!==0)), C1=A1*x0+B1*y0, C2=A2*x0+B2*y0, right=pt18(x0,y0), wrong=uniq(right,[pt18(y0,x0),pt18(x0,-y0),pt18(-x0,y0),pt18(C1,C2),pt18(x0+1,y0-1),pt18(x0-1,y0)],3); if(wrong.length<3) return null;
      return {index:'q:18c.lines[m;'+[A1,B1,C1,A2,B2,C2].join(';')+']', lines:[[eq18(A1,B1,C1),'a line'],[eq18(A2,B2,C2),'a second line']], ask:'Where do they meet?', right, opts:shuffle([right,...wrong]), lead:'', why:'D = A₁B₂ − A₂B₁ = '+sg(A1*B2-A2*B1)+', not 0, so they have exactly one common point. '+right+' satisfies both equations.'}; }
    if(k===2){ const A=pick([1,2,3]), B=pick([-3,-2,-1,1,2,3]), c=rnd(4), C=rnd(9)-4, m=pick([2,-1,3]), [A2,B2,C2]=c===0?[m*A,m*B,m*C+pick([1,2,-3])]:c===1?[B,-A,rnd(9)-4]:c===2?[m*A,m*B,m*C]:[A,pick([-3,-2,-1,1,2,3].filter(z=>z!==B&&A*A+B*z!==0)),rnd(9)-4];
      const opts=['they are parallel','they are perpendicular','they are the same line','they meet, and not at a right angle'], D=A*B2-A2*B, right=opts[c];
      return {index:'q:18c.lines[r;'+[A,B,C,A2,B2,C2].join(';')+']', lines:[[eq18(A,B,C),'a line'],[eq18(A2,B2,C2),'a second line']], ask:'How do the two lines lie?', right, opts, lead:'', why:c===0?'The normals '+pt18(A,B)+' and '+pt18(A2,B2)+' are multiples, so D = 0, and the right sides are not the same multiple: no common point.':c===1?'A₁A₂ + B₁B₂ = '+par10(A)+' · '+par10(A2)+' + '+par10(B)+' · '+par10(B2)+' = 0: perpendicular-lines.':c===2?'The second equation is the first multiplied through by '+sg(m)+'. Same points, same line.':'D = '+sg(D)+' is not 0, so they meet once. A₁A₂ + B₁B₂ = '+sg(A*A2+B*B2)+' is not 0, so not at a right angle.'}; }
    const [a,b,n]=pick([[3,4,5],[4,3,5],[-3,4,5],[5,12,13],[12,-5,13],[6,8,10]]), C=rnd(11)-5, num=Math.abs(a*x0+b*y0-C), R=fr(num,n), right=fshow(R), wrong=frs16(right,[fint(num),fr(num,a*a+b*b),fr(num,Math.abs(a)+Math.abs(b)),fr(Math.abs(a*x0+b*y0+C),n),fr(num+n,n),fint(n)]); if(wrong.length<3||num===0) return null;
    return {index:'q:18c.lines[n;'+[a,b,C,x0,y0].join(';')+']', lines:[[eq18(a,b,C),'a line'],['P₀ = '+pt18(x0,y0),'a point']], ask:'How far is P₀ from the line?', right, opts:shuffle([right,...wrong]), lead:'', why:'Nearest-point: |Ax₀ + By₀ − C|/√(A² + B²) = |'+sg(a*x0+b*y0-C)+'|/'+n+(fshow(R)===num+'/'+n?'':' = '+right)+'.'}; }});

/* ---------- 18d Circles ---------- */
const D18=[
  ['Which set is {X : d(X, A) = d(X, B)}, for points A ≠ B?','the line through the midpoint of AB, perpendicular to AB',['the midpoint of AB alone','the circle with diameter AB','the line through A and B'],'Perpendicular-bisector: every point of that line is equally far from A and B, and no other point is.'],
  ['How many circles pass through three collinear points?','none',['exactly one','two','as many as you like'],'Circle-through-three: the centre is where two perpendicular bisectors meet, and for collinear points those are parallel.'],
  ['Is x² + y² + 2x + 2 = 0 a circle?','no: it is (x + 1)² + y² = −1, which no point satisfies',['yes, with radius 1','yes, with radius √2','no: it is one point'],'Circle-equation: D² + E² − 4F = 4 − 8 is negative.'],
  ['Where is the centre of the circle inside a triangle that touches all three sides?','where the angle bisectors meet',['where the perpendicular bisectors of the sides meet','where the medians meet','where the heights meet'],'Inscribed-circle: each point of a bisector is equally far from two side lines. The perpendicular bisectors give the circle through the corners.']];
QP.push({id:'18d.equal',step:'18d',label:'equally far',open:()=>measured('18d'),make(){ return writtenQ('18d.equal',D18); }},
  {id:'18d.circle',step:'18d',mode:'work',label:'circles by their numbers',open:()=>measured('18d'),make(){
    const k=rnd(4);
    if(k===0){ const p=rnd(9)-4, q=rnd(9)-4, r=1+rnd(6), D=-2*p, E=-2*q, F=p*p+q*q-r*r, ex='x² + y²'+(D?pm(D)+'x':'')+(E?pm(E)+'y':'')+(F?pm(F):'')+' = 0', f=(a,b,c)=>'centre '+pt18(a,b)+', radius '+c, right=f(p,q,r), wrong=uniq(right,[f(-p,-q,r),f(p,q,r*r),f(D,E,r),f(-p,-q,r*r),f(p,q,2*r),f(q,p,r)],3); if(wrong.length<3) return null;
      return {index:'q:18d.circle[e;'+[p,q,r].join(';')+']', lines:[[ex,'a circle']], ask:'What are its centre and radius?', right, opts:shuffle([right,...wrong]), lead:'', why:'Complete the squares: (x'+pm(-p)+')² + (y'+pm(-q)+')² = '+(r*r)+'. Circle-equation: the centre is (−D/2, −E/2) and the radius is √'+(r*r)+' = '+r+'.'}; }
    if(k===1){ const r1=2+rnd(6), r2=1+rnd(r1-1), c=rnd(4), d=c===0?r1-r2+1+rnd(2*r2-1):c===1?(Math.random()<0.5?r1+r2:r1-r2):c===2?r1+r2+1+rnd(4):Math.max(1,r1-r2-1-rnd(2)), opts=['in exactly two points','in exactly one point','nowhere: each lies outside the other','nowhere: one lies inside the other']; if(c===3&&d>=r1-r2) return null; if(c===1&&d===0) return null;
      return {index:'q:18d.circle[t;'+[r1,r2,d].join(';')+']', lines:[['two circles with the radii '+r1+' and '+r2,'given'],['their centres are '+d+' apart','given']], ask:'Where do the circles meet?', right:opts[c], opts, lead:'', why:'Two-circles-meet: compare d = '+d+' with r₁ + r₂ = '+(r1+r2)+' and |r₁ − r₂| = '+(r1-r2)+'. '+(c===0?'It lies strictly between: two points.':c===1?'It equals one of them: the circles touch once.':c===2?'It is more than the sum: too far apart to meet.':'It is less than the difference: the smaller circle sits inside the larger.')}; }
    if(k===2){ const r=2+rnd(8), c=rnd(3), dl=c===0?rnd(r):c===1?r:r+1+rnd(4), opts=['in exactly two points','in exactly one point','nowhere','at every point of the line'];
      return {index:'q:18d.circle[l;'+r+';'+dl+']', lines:[['a circle of radius '+r,'given'],['a line at the distance '+dl+' from its centre','given']], ask:'Where does the line meet the circle?', right:opts[c], opts, lead:'', why:'Line-meets-circle: compare δ = '+dl+' with r = '+r+'. '+(c===0?'δ < r: two points, each √(r² − δ²) from the foot of the perpendicular.':c===1?'δ = r: only at the foot of the perpendicular. The line touches.':'δ > r: every point of the line is farther than r from the centre.')}; }
    const mk=ok=>{ const a=2+rnd(7), b=2+rnd(7), c=ok?Math.abs(a-b)+1+rnd(2*Math.min(a,b)-1):(Math.random()<0.5?a+b+rnd(4):Math.abs(a-b)-rnd(2)); return c>0?[a,b,c].join(', '):null; }, right=mk(true), wrong=uniq(right,[mk(false),mk(false),mk(false),mk(false),mk(false),mk(false)].filter(Boolean),3); if(wrong.length<3) return null;
    return {index:'q:18d.circle[w;'+right+';'+wrong.join(';')+']', lines:[['three lengths','to be the sides of a triangle']], ask:'Which three can be?', right, opts:shuffle([right,...wrong]), lead:'', why:'Which-triangles: each length must be less than the sum of the other two. In '+right+' each is. In every other list one length is at least the sum of the other two, and the circles about the ends of that side never cross.'}; }});

/* ---------- 18e Conics by Distances ---------- */
const E18=[
  ['Which points make a parabola?','those equally far from one point and one line',['those equally far from two points','those whose distances to two points have a fixed sum','those at a fixed distance from one point'],'Parabola: {P : d(P, F) = d(P, ℓ)}. With F = (0, p) and ℓ: y = −p it is x² = 4py.'],
  ['Which points make an ellipse?','those whose distances to two points have a fixed sum',['those whose distances to two points have a fixed difference','those equally far from one point and one line','those equally far from two points'],'Ellipse: d(P, F₁) + d(P, F₂) = 2α. A fixed difference gives a hyperbola.'],
  ['d(P, F) = e · d(P, ℓ). What does the number e decide?','which conic: an ellipse for e < 1, a parabola for e = 1, a hyperbola for e > 1',['the size of the conic only','where the focus is','nothing: all e give a parabola'],'One-family: one point, one line and one number give all three.'],
  ['A hyperbola has how many parts?','two',['one','three','four'],'On one part d(P, F₁) − d(P, F₂) = 2α, and on the other d(P, F₂) − d(P, F₁) = 2α.']];
QP.push({id:'18e.sets',step:'18e',label:'conics as sets of points',open:()=>measured('18e'),make(){ return writtenQ('18e.sets',E18); }},
  {id:'18e.conic',step:'18e',mode:'work',label:'foci and sums',open:()=>measured('18e'),make(){
    const k=rnd(4);
    if(k===0){ const p=pick([-4,-3,-2,-1,1,2,3,4,5]), foc=Math.random()<0.5, right=foc?pt18(0,p):'y = '+sg(-p), wrong=uniq(right,foc?[pt18(0,4*p),pt18(p,0),pt18(0,-p),pt18(0,2*p)]:['y = '+sg(p),'y = '+sg(-4*p),'x = '+sg(-p),'y = '+sg(-2*p)],3);
      return {index:'q:18e.conic[p;'+p+';'+(foc?'f':'l')+']', lines:[['x² = '+sg(4*p)+'y','a parabola']], ask:foc?'Where is its point F?':'Which is its line ℓ?', right, opts:shuffle([right,...wrong]), lead:'', why:'Parabola: x² = 4py is the set equally far from F = (0, p) and ℓ: y = −p. Here 4p = '+sg(4*p)+', so p = '+sg(p)+'.'}; }
    if(k===1){ const [b,c,al]=pick([[4,3,5],[3,4,5],[12,5,13],[5,12,13],[8,6,10],[6,8,10],[15,8,17],[8,15,17]]), q=rnd(3), right=q===0?'(±'+c+', 0)':q===1?String(2*al):fshow(fr(c,al)), wrong=uniq(right,q===0?['(±'+al+', 0)','(±'+b+', 0)','(0, ±'+c+')','(±'+(al*al-b*b)+', 0)']:q===1?[String(al),String(2*b),String(al+b),String(2*c)]:[fshow(fr(b,al)),fshow(fr(c,b)),fshow(fr(al,c)),String(c)],3); if(wrong.length<3) return null;
      return {index:'q:18e.conic[e;'+[al,b,q].join(';')+']', lines:[['x²/'+(al*al)+' + y²/'+(b*b)+' = 1','an ellipse']], ask:q===0?'Where are its two points F₁ and F₂?':q===1?'What is the sum d(P, F₁) + d(P, F₂) at each of its points?':'What is its number e?', right, opts:shuffle([right,...wrong]), lead:'', why:'Ellipse: α² = '+(al*al)+' and b² = '+(b*b)+', so α = '+al+' and c = √(α² − b²) = '+c+'. The foci are (±c, 0), the sum is 2α = '+(2*al)+', and e = c/α = '+fshow(fr(c,al))+'.'}; }
    if(k===2){ const [al,b,c]=pick(TRI18.slice(0,6)), q=rnd(2), right=q===0?'(±'+c+', 0)':String(2*al), wrong=uniq(right,q===0?['(±'+al+', 0)','(±'+b+', 0)','(0, ±'+c+')','(±'+Math.abs(al*al-b*b)+', 0)']:[String(al),String(2*b),String(2*c),String(c)],3); if(wrong.length<3) return null;
      return {index:'q:18e.conic[h;'+[al,b,q].join(';')+']', lines:[['x²/'+(al*al)+' − y²/'+(b*b)+' = 1','a hyperbola']], ask:q===0?'Where are its two points F₁ and F₂?':'What is |d(P, F₁) − d(P, F₂)| at each of its points?', right, opts:shuffle([right,...wrong]), lead:'', why:'Hyperbola: α = '+al+' and b = '+b+', and here c = √(α² + b²) = '+c+', since b² = c² − α². The foci are (±c, 0), and the difference of the distances is 2α = '+(2*al)+'.'}; }
    const e=pick([fr(1,2),fr(2,3),fr(3,5),fr(4,5),fint(1),fint(1),fr(3,2),fint(2),fr(5,4),fr(5,3)]), opts=['an ellipse','a parabola','a hyperbola','a circle'], right=opts[fless(e,fint(1))?0:fsame(e,fint(1))?1:2];
    return {index:'q:18e.conic[o;'+fshow(e)+']', lines:[['d(P, F) = '+(fsame(e,fint(1))?'':fshow(e)+' · ')+'d(P, ℓ)','a point F and a line ℓ not through it']], ask:'Which set of points P is it?', right, opts, lead:'', why:'One-family: e = '+fshow(e)+'. A parabola when e = 1, an ellipse when e < 1, a hyperbola when e > 1.'}; }});

/* ---------- 18f Triangles and Parallels by Hand ---------- */
const F18=[
  ['Two triangles agree in two sides and an angle not between them. Must they be congruent?','no: two different triangles can fit',['yes','yes, when the angle is the larger one','no: no triangle fits'],'Two-sides-and-the-angle needs the angle between the two sides. With the angle elsewhere the third side can take two lengths.'],
  ['Two triangles have their three sides equal in pairs. What follows?','their angles are equal in pairs, and they are congruent',['nothing','they are similar, perhaps of different sizes','they have the same area and nothing more'],'Three-sides: each opening is fixed by the three sides, through d² = b² + c² − 2bc · (the opening at A).'],
  ['Two triangles have two angles equal in pairs. What follows?','the third angles are equal, and the sides are in one ratio',['the triangles are congruent','the triangles have the same area','nothing'],'Similar-triangles: same shape, perhaps another size.'],
  ['AB is a diameter of a circle and X is another point of it. What is ∠AXB?','a right angle',['half a right angle','it depends on X','two right angles'],'Angle-in-a-semicircle: X lies on the circle exactly when ∠AXB is right.']];
QP.push({id:'18f.same',step:'18f',label:'congruent and similar',open:()=>measured('18f'),make(){ return writtenQ('18f.same',F18); }},
  {id:'18f.angles',step:'18f',mode:'work',label:'angles, similar triangles and turns',open:()=>measured('18f'),make(){
    const k=rnd(5);
    if(k===0){ const a=20+5*rnd(17), b=20+5*rnd(Math.floor((150-a)/5)), c=180-a-b, right=c+'°', wrong=uniq(right,[(a+b)+'°',(360-a-b)+'°',(90-Math.min(a,b))+'°',(c+10)+'°',Math.abs(a-b)+'°'],3); if(wrong.length<3||c<=0) return null;
      return {index:'q:18f.angles[s;'+a+';'+b+']', lines:[['a triangle with the angles '+a+'° and '+b+'°','given']], ask:'What is its third angle?', right, opts:shuffle([right,...wrong]), lead:'', why:'Angle-sum: the angles of a triangle add to 180°. 180 − '+a+' − '+b+' = '+c+'.'}; }
    if(k===1){ const a=20+4*rnd(30), base=(180-a)/2, right=base+'°', wrong=uniq(right,[(180-a)+'°',a+'°',(90-a/2+10)+'°',(a/2)+'°',(180-2*a)+'°'],3); if(wrong.length<3) return null;
      return {index:'q:18f.angles[i;'+a+']', lines:[['a triangle with b = c','two equal sides'],['the angle at A is '+a+'°','between the equal sides']], ask:'What is the angle at B?', right, opts:shuffle([right,...wrong]), lead:'', why:'Equal-sides-equal-angles: the angles at B and C are equal. Angle-sum: each is (180 − '+a+')/2 = '+base+'.'}; }
    if(k===2){ const a=2+rnd(7), b=pick([2,3,4,5,6,7,8,9].filter(z=>z!==a)), m=pick([fint(2),fint(3),fr(3,2),fr(1,2),fr(5,2),fint(4)]), R=fmul(fint(b),m), right=fshow(R), wrong=frs16(right,[fadd(fint(b),fsub(fmul(fint(a),m),fint(a))),fmul(fint(b),fr(m.q,m.p)),fmul(fint(a),m),fint(b),fmul(R,m)]); if(wrong.length<3) return null;
      return {index:'q:18f.angles[m;'+[a,b,fshow(m)].join(';')+']', lines:[['triangles ABC and A′B′C′ with ∠A = ∠A′ and ∠B = ∠B′','given'],['AB = '+a+', A′B′ = '+fshow(fmul(fint(a),m))+', BC = '+b,'given']], ask:'What is B′C′?', right, opts:shuffle([right,...wrong]), lead:'', why:'Similar-triangles: A′B′/AB = B′C′/BC. The ratio is '+fshow(m)+', so B′C′ = '+fshow(m)+' · '+b+' = '+right+'. The sides scale by a factor. They do not grow by a fixed amount.'}; }
    if(k===3){ const s=pick([2,3,4,5,10]), A=1+rnd(12), dist=Math.random()<0.4, right=String(dist?s*A:s*s*A), wrong=uniq(right,[s*A,s*s*A,2*s*A,A+s,s*s*s*A,A*A].map(String),3); if(wrong.length<3) return null;
      return {index:'q:18f.angles[k;'+[s,A,dist?'d':'a'].join(';')+']', lines:[['a figure is scaled from a point O by the factor '+s,'given'],[dist?'one of its sides has the length '+A:'its area is '+A,'before the scaling']], ask:dist?'What is that side’s length afterwards?':'What is its area afterwards?', right, opts:shuffle([right,...wrong]), lead:'', why:'Scaling: every distance is multiplied by k = '+s+' and every area by k² = '+(s*s)+'. Openings are kept.'}; }
    const x=pick([-4,-3,-2,-1,1,2,3,4]), y=pick([-4,-3,-2,1,2,3,5]), n=1+rnd(3), q=n===1?[-y,x]:n===2?[-x,-y]:[y,-x], right=pt18(q[0],q[1]), wrong=uniq(right,[pt18(y,x),pt18(-x,-y),pt18(-y,x),pt18(y,-x),pt18(x,-y),pt18(-x,y)],3); if(wrong.length<3) return null;
    return {index:'q:18f.angles[t;'+[x,y,n].join(';')+']', lines:[['the point '+pt18(x,y),'given'],['the quarter turn i = (0, 1) sends (x, y) to (−y, x)','given']], ask:n===1?'Where does one quarter turn send the point?':'Where do '+['','','two','three'][n]+' quarter turns send the point?', right, opts:shuffle([right,...wrong]), lead:'', why:'Turning by (a, b) sends (x, y) to (ax − by, bx + ay). With (0, 1) that is (−y, x)'+(n===1?'':', applied '+['','','twice','three times'][n])+': '+right+'. Every distance is kept.'}; }});

/* ---------- 18g Lines in Coordinates ---------- */
const G18=[
  ['The midpoints of the four sides of any four-sided figure are joined in order. What figure do they make?','a parallelogram',['a square','a rectangle','it depends on the figure'],'Midpoint-parallelogram: its sides are parallel to the two diagonals and half as long.'],
  ['Where do the three medians of a triangle meet?','at (A + B + C)/3, two thirds of the way along each from its corner',['at the midpoint of the longest side','halfway along each median','they need not meet in one point'],'Centroid: the average of the three corners.'],
  ['The segment from P to Q meets the line f = 0. What can be said of f(P) and f(Q), neither being 0?','they have opposite signs',['they have the same sign','they are equal','their sum is 0'],'Sides-of-a-line: the line splits the plane into the side where f > 0 and the side where f < 0.'],
  ['On a bounded convex polygon, where does px + qy take its largest value?','at a corner',['at the centre','at the midpoint of the longest side','anywhere inside'],'Best-corner. A whole side may share the largest value, and then its two corners have it too.']];
QP.push({id:'18g.forms',step:'18g',label:'midpoints and sides',open:()=>measured('18g'),make(){ return writtenQ('18g.forms',G18); }},
  {id:'18g.area',step:'18g',mode:'work',label:'areas, centroids and sides of a line',open:()=>measured('18g'),make(){
    const k=rnd(3), P=()=>[rnd(9)-4,rnd(9)-4], A=P(), B=P(), C=P(), cr=(B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0]);
    if(k===0){ if(cr===0) return null; const R=fr(Math.abs(cr),2), right=fshow(R), wrong=frs16(right,[fint(Math.abs(cr)),fr(Math.abs(cr),4),fr(Math.abs((B[0]-A[0])*(C[0]-A[0])+(B[1]-A[1])*(C[1]-A[1])),2),fadd(R,fint(1)),fr(Math.abs(cr)+1,2),fint(2*Math.abs(cr))]); if(wrong.length<3) return null;
      return {index:'q:18g.area[a;'+A.concat(B,C).join(';')+']', lines:[['A = '+pt18(...A)+', B = '+pt18(...B)+', C = '+pt18(...C),'the corners of a triangle']], ask:'What is its area?', right, opts:shuffle([right,...wrong]), lead:'', why:'Triangle-area: with u = B − A = '+pt18(B[0]-A[0],B[1]-A[1])+' and v = C − A = '+pt18(C[0]-A[0],C[1]-A[1])+', the area is ½|u₁v₂ − u₂v₁| = ½ · |'+sg(cr)+'| = '+right+'.'}; }
    if(k===1){ const G=[fr(A[0]+B[0]+C[0],3),fr(A[1]+B[1]+C[1],3)], right=fpt18(...G), wrong=uniq(right,[fpt18(fr(A[0]+B[0]+C[0],2),fr(A[1]+B[1]+C[1],2)),fpt18(fint(A[0]+B[0]+C[0]),fint(A[1]+B[1]+C[1])),fpt18(fr(A[0]+B[0],2),fr(A[1]+B[1],2)),fpt18(G[1],G[0]),fpt18(fr(B[0]+C[0],2),fr(B[1]+C[1],2))],3); if(wrong.length<3||cr===0) return null;
      return {index:'q:18g.area[g;'+A.concat(B,C).join(';')+']', lines:[['A = '+pt18(...A)+', B = '+pt18(...B)+', C = '+pt18(...C),'the corners of a triangle']], ask:'Where do its medians meet?', right, opts:shuffle([right,...wrong]), lead:'', why:'Centroid: G = (A + B + C)/3 = ('+sg(A[0]+B[0]+C[0])+', '+sg(A[1]+B[1]+C[1])+')/3 = '+right+'.'}; }
    const a=pick([1,2,3]), b=pick([-2,-1,1,2]), c=rnd(7)-3, f=X=>a*X[0]+b*X[1]-c, fA=f(A), fB=f(B); if(fA===0||fB===0) return null; const meets=fA*fB<0, opts=['yes: f has opposite signs at P and Q','no: f has the same sign at P and Q','yes: f has the same sign at P and Q','no: f has opposite signs at P and Q'];
    return {index:'q:18g.area[s;'+[a,b,c].concat(A,B).join(';')+']', lines:[['ℓ: '+eq18(a,b,c)+', and f(X) = '+eq18(a,b,c).split(' = ')[0]+pm(-c).replace(' + 0','').replace(' − 0',''),'a line'],['P = '+pt18(...A)+' and Q = '+pt18(...B),'two points off the line']], ask:'Does the segment from P to Q meet ℓ?', right:opts[meets?0:1], opts, lead:'', why:'f(P) = '+sg(fA)+' and f(Q) = '+sg(fB)+'. Sides-of-a-line: the segment meets ℓ exactly when the two signs are opposite.'}; }},
  {id:'18g.corner',step:'18g',mode:'word',label:'the best corner',open:()=>measured('18g'),make(){
    const [who,xs,ys]=pick([['A workshop','chairs','tables'],['A bakery','trays of rolls','trays of loaves'],['A nursery','crates of herbs','crates of bulbs'],['A press','runs of posters','runs of maps']]), a=4+rnd(5), b=4+rnd(5), c=1+rnd(a-1), d=1+rnd(b-1), p=1+rnd(6), q=1+rnd(6); if(c*b+d*a<=a*b) return null;
    const cs=[[0,0],[a,0],[c,d],[0,b]], g=X=>p*X[0]+q*X[1], best=Math.max(...cs.map(g)), right=best+' coins', wrong=uniq(right,cs.map(g).concat([p*a+q*b,best+p,p*c+q*b]).filter(v=>v!==best).map(v=>v+' coins'),3); if(wrong.length<3) return null;
    return {index:'q:18g.corner['+[who,a,b,c,d,p,q].join(';')+']', a3:['18g.corner',DASH,DASH], story:who+' can make x '+xs+' and y '+ys+' a day, for the points (x, y) of the four-sided region with the corners (0, 0), ('+a+', 0), ('+c+', '+d+') and (0, '+b+'). It gains '+p+' coins on each of the first and '+q+' on each of the second.', lines:[], ask:'What is the most it can gain in a day?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Best-corner: '+(p===1?'':p)+'x + '+(q===1?'':q)+'y is greatest at a corner. At the corners it is '+cs.map(g).join(', ')+'. The greatest is '+best+'. The point ('+a+', '+b+') is not in the region.'}; }});

/* ---------- 18h Circles and Conics ---------- */
const H18=[
  ['The line x = 2 meets the parabola x² = 4y once. Does it touch it?','no: it crosses there, and touching is found by a double root',['yes: meeting once is touching','yes: every vertical line touches','no: it does not meet it at all'],'For a circle, a touching line is one that meets it once. For a parabola that test fails, so the hand method asks for a double root.'],
  ['P is outside a circle, at the distance d from its centre, and the radius is r. Is the touching segment from P of length d − r?','no: it is √(d² − r²)',['yes','no: it is d + r','no: it is d² − r²'],'The radius to the touching point is perpendicular to the touching line. Right-triangle gives d² = r² + d(P, T)².'],
  ['Which points X have (X − A) · (X − B) = 0?','those of the circle with diameter AB',['those of the line through A and B','those of the perpendicular bisector of AB','A and B alone'],'Diameter: the two displacements from X are perpendicular exactly on that circle.'],
  ['From a point outside a circle, how many lines touch the circle?','exactly two',['exactly one','none','as many as you like'],'Two-touching-lines: they touch it where it meets the circle with diameter OP.']];
QP.push({id:'18h.touch',step:'18h',label:'touching',open:()=>measured('18h'),make(){ return writtenQ('18h.touch',H18); }},
  {id:'18h.power',step:'18h',mode:'work',label:'touching lengths, products and sorting',open:()=>measured('18h'),make(){
    const k=rnd(4);
    if(k===0){ const [t,r,d]=pick(TRI18), right=String(t), wrong=uniq(right,[d-r,d+r,d*d-r*r,t+1,r].map(String),3); if(wrong.length<3) return null;
      return {index:'q:18h.power[t;'+d+';'+r+']', lines:[['a circle of radius '+r,'given'],['P is at the distance '+d+' from its centre','outside the circle']], ask:'How long is the touching segment from P?', right, opts:shuffle([right,...wrong]), lead:'', why:'Touching-length: √(d² − r²) = √('+(d*d)+' − '+(r*r)+') = √'+(t*t)+' = '+t+'. It is not d − r, which is the distance to the nearest point of the circle.'}; }
    if(k===1){ const r=2+rnd(6), d=pick([1,2,3,4,5,6,7,8,9,10].filter(z=>z!==r)), pw=Math.abs(d*d-r*r), fs=[]; for(let i=1;i<=pw;i++) if(pw%i===0&&i>=Math.abs(d-r)&&i<=d+r) fs.push(i); const pa=pick(fs), given=Math.random()<0.5&&pa!==pw/pa, right=String(given?pw/pa:pw), wrong=uniq(right,[d*d+r*r,Math.abs(d-r),d+r,pw+1,d*r,pw-pa,pa].map(String),3); if(wrong.length<3) return null;
      return {index:'q:18h.power[p;'+[d,r,given?pa:0].join(';')+']', lines:[['a circle of radius '+r+', and P at the distance '+d+' from its centre','given'],given?['a line through P meets the circle at A and B, with d(P, A) = '+pa,'given']:['a line through P meets the circle at A and B','any such line']], ask:given?'What is d(P, B)?':'What is d(P, A) · d(P, B)?', right, opts:shuffle([right,...wrong]), lead:'', why:'Same-product: for every line through P, d(P, A) · d(P, B) = |d² − r²| = |'+(d*d)+' − '+(r*r)+'| = '+pw+'.'+(given?' So d(P, B) = '+pw+'/'+pa+' = '+right+'.':'')}; }
    if(k===2){ const c=rnd(4), A=1+rnd(6), C=c===0?pick([1,2,3,4,5,6,7].filter(z=>z!==A)):c===1?A:c===2?-(1+rnd(6)):0, K=pick([4,9,12,16,36]), ex=c===3?(A===1?'':A)+'x² '+pick(['−','+'])+' '+(1+rnd(8))+'y = 0':(A===1?'':A)+'x²'+(C<0?' − ':' + ')+(Math.abs(C)===1?'':Math.abs(C))+'y² = '+K, opts=['an ellipse that is not a circle','a circle','a hyperbola','a parabola'];
      return {index:'q:18h.power[s;'+ex+']', lines:[[ex,'an equation of the second degree']], ask:'Which conic is it?', right:opts[c], opts, lead:'', why:'Sorting: look at the numbers on x² and y². '+(c===0?'Same sign and unequal: an ellipse.':c===1?'Equal: a circle, of radius √('+K+'/'+A+').':c===2?'Opposite signs: a hyperbola.':'Only one square is present: a parabola.')}; }
    const [b,c,al]=pick([[4,3,5],[3,4,5],[12,5,13],[5,12,13],[8,6,10],[6,8,10]]), near=Math.random()<0.5, right=String(near?al-c:al+c), wrong=uniq(right,[near?al+c:al-c,al,b,c,2*al].map(String),3); if(wrong.length<3) return null;
    return {index:'q:18h.power[o;'+[al,b,near?'n':'f'].join(';')+']', lines:[['x²/'+(al*al)+' + y²/'+(b*b)+' = 1','an ellipse, with a focus at ('+c+', 0)']], ask:'What is the '+(near?'least':'greatest')+' distance from that focus to a point of the ellipse?', right, opts:shuffle([right,...wrong]), lead:'', why:'Orbit-ends: the distance to a focus is α − (c/α)x, least at the near end of the long axis, α − c = '+(al-c)+', and greatest at the far end, α + c = '+(al+c)+'.'}; }});

/* ---------- 18i Curves Traced in Time ---------- */
const I18=[
  ['Is dy/dx = (dy/dt)/(dx/dt) because the dt’s cancel?','no: dy/dx is not a fraction, and path-slope is proved by the chain technique',['yes','yes, when dt is small','no: the formula is false'],'The formula holds where x′ keeps one sign. Its proof writes the trace as a graph F and takes the slope of F(x(t)).'],
  ['Can two different paths have the same trace?','yes: the trace forgets when, and how often, each point is passed',['no','only if they have the same speed','only if one is the other run backwards'],'A path is a function of time. Its trace is only the set of points it passes.'],
  ['What is the speed of a path at t?','√(x′(t)² + y′(t)²), the length of its velocity',['x′(t) + y′(t)','y′(t)/x′(t)','the distance from the start'],'Speed: the distance covered per unit of time heads to |P′(t)|. The quotient y′/x′ is the slope of the trace.'],
  ['How is the length of a path on [r, w] found?','as the area under its speed, ∫ᵣʷ √(x′² + y′²) dt',['as d(P(r), P(w))','as the speed at r times w − r','as ∫ᵣʷ (x′ + y′) dt'],'Distance-travelled. The straight distance between the ends is a lower bound, reached only by a straight run.']];
QP.push({id:'18i.trace',step:'18i',label:'paths and traces',open:()=>measured('18i'),make(){ return writtenQ('18i.trace',I18); }},
  {id:'18i.path',step:'18i',mode:'work',label:'velocity, speed and length',open:()=>measured('18i'),make(){
    const k=rnd(3), [a,b,c]=pick(TRI18), sa=sn18()*a, sb=sn18()*b, x0=rnd(7)-3, y0=rnd(7)-3;
    if(k===0){ const sp=Math.random()<0.5, r=rnd(3), w=r+1+rnd(4), right=String(sp?c:c*(w-r)), wrong=uniq(right,(sp?[a+b,c*c,Math.abs(a-b),c+1,a]:[(a+b)*(w-r),c*w,c,c*(w-r)+c,a*(w-r)]).map(String),3); if(wrong.length<3) return null;
      return {index:'q:18i.path[l;'+[sa,sb,x0,y0,sp?'s':r+'-'+w].join(';')+']', lines:[['x(t) = '+lin9(sa,x0).replace(/x/g,'t')+', y(t) = '+lin9(sb,y0).replace(/x/g,'t'),'a path']], ask:sp?'What is its speed?':'How far does it go from t = '+r+' to t = '+w+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'P′(t) = '+pt18(sa,sb)+' at every t, and its length is √('+(a*a)+' + '+(b*b)+') = '+c+'.'+(sp?'':' Distance-travelled: the area under the speed is '+c+' · '+(w-r)+' = '+right+'.')}; }
    if(k===1){ const d=rnd(7)-3, t0=pick([-2,-1,1,2,3]), R=fr(3*t0*t0+d,2*t0), right=fshow(R), wrong=frs16(right,[fr(2*t0,3*t0*t0+d||1),fint(3*t0*t0+d),fint(2*t0),fr(t0**3+d*t0,t0*t0||1),fneg(R),fadd(R,fint(1))]); if(wrong.length<3) return null;
      return {index:'q:18i.path[s;'+d+';'+t0+']', lines:[['x(t) = t², y(t) = '+poly13([1,0,d,0]).replace(/x/g,'t'),'a path']], ask:'What is the slope of its trace at t = '+sg(t0)+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'Path-slope: y′(t)/x′(t) = ('+poly13([3,0,d]).replace(/x/g,'t')+')/(2t). At t = '+sg(t0)+' that is '+sg(3*t0*t0+d)+'/'+par10(2*t0)+(fshow(R)===sg(3*t0*t0+d)+'/'+par10(2*t0)?'':' = '+right)+'. Near there x′ keeps one sign, so the trace is a graph.'}; }
    const n=1+rnd(3), r=rnd(4)-1, w=r+n*a, right=String(n*c), wrong=uniq(right,[n*a,n*b,n*(a+b),n*c+1,n*a*b,n*c*a].map(String),3); if(wrong.length<3) return null;
    return {index:'q:18i.path[g;'+[a,b,r,w].join(';')+']', lines:[['f(x) = '+(b%a===0?lin9(b/a,y0):'('+fshow(fr(b,a))+')x'+(y0?pm(y0):'')),'from x = '+sg(r)+' to x = '+sg(w)]], ask:'How long is its graph there?', right, opts:shuffle([right,...wrong]), lead:'', why:'Graph-length: ∫ √(1 + f′(x)²) dx, with f′ = '+fshow(fr(b,a))+'. √(1 + '+fshow(fr(b*b,a*a))+') = '+fshow(fr(c,a))+', and the stretch is '+(n*a)+' wide: '+fshow(fr(c,a))+' · '+(n*a)+' = '+right+'. A straight graph, so the distance formula agrees.'}; }},
  {id:'18i.walk',step:'18i',mode:'word',label:'how far it goes',open:()=>measured('18i'),make(){
    const who=pick(['A beetle on a table','A float on a pond','A cursor on a screen','A cutter on a sheet']), [a,b,c]=pick(TRI18.slice(0,6)), T=2+rnd(7), far=Math.random()<0.6, right=far?(c*T)+' centimetres':c+' centimetres per second', u=far?' centimetres':' centimetres per second', wrong=uniq(right,(far?[(a+b)*T,c*T*T,a*T,c+T,c]:[a+b,c*c,2*c,c*T,a]).map(v=>v+u),3); if(wrong.length<3) return null;
    return {index:'q:18i.walk['+[who,a,b,T,far?'d':'s'].join(';')+']', a3:['18i.walk',DASH,DASH], story:who+' is at the point ('+a+'t, '+b+'t) at the time t seconds, the lengths in centimetres.', lines:[], ask:far?'How far has it gone after '+T+' seconds?':'What is its speed?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Its velocity is ('+a+', '+b+') at every instant, of length √('+(a*a)+' + '+(b*b)+') = '+c+'. '+(far?'Distance-travelled: '+c+' · '+T+' = '+(c*T)+'.':'The speed is the length of the velocity, not the sum of its parts.')}; }});

/* ---------- 18j Constructions With Straightedge and Compass ---------- */
const J18=[
  ['Which moves may a construction make?','draw the line through two drawn points, draw the circle with a drawn centre through a drawn point, and mark where these meet',['measure a length and mark it off anywhere','draw any line or circle that looks right','mark the point at any wanted distance along a line'],'The rules of construction: three kinds of move, each starting from points already drawn.'],
  ['The circle with centre A through B and the circle with centre B through A meet at two points. What does each make with A and B?','an equilateral triangle',['a right triangle','a square','a triangle with two equal sides and no more'],'Equilateral: each meeting point is |AB| from A and from B.'],
  ['Which coordinates can the tools reach in one more move, from points with coordinates in K?','those of the form p + q√k, with p, q and k in K',['every real number','only those already in K','only whole numbers'],'Root-and-ratio: lines and circles are met by solving equations of the first and second degree.'],
  ['How is the midpoint of AB constructed?','join the two meeting points of the circles about A and B through each other, and mark where that line meets AB',['open the compass to half of AB by eye','measure AB and halve the number','draw any line through A and mark its middle'],'Midpoint: the line through the two points of equilateral is the perpendicular bisector of AB.']];
QP.push({id:'18j.rules',step:'18j',label:'the rules of the game',open:()=>measured('18j'),make(){ return writtenQ('18j.rules',J18); }},
  {id:'18j.root',step:'18j',mode:'work',label:'what the tools reach',open:()=>measured('18j'),make(){
    const k=rnd(3);
    if(k===0){ const s=2+rnd(9), kk=s*s, q=rnd(3), right=q===0?String(s):q===1?fshow(fr(kk+1,2)):fpt18(fr(kk-1,2),fint(0)), wrong=uniq(right,q===0?[String(kk),fshow(fr(kk,2)),fshow(fr(kk+1,2)),String(s+1)]:q===1?[fshow(fr(kk-1,2)),String(kk+1),String(s),fshow(fr(kk,2))]:[fpt18(fr(kk+1,2),fint(0)),fpt18(fr(kk,2),fint(0)),fpt18(fint(0),fint(s)),fpt18(fint(kk-1),fint(0))],3); if(wrong.length<3) return null;
      return {index:'q:18j.root[r;'+kk+';'+q+']', lines:[['the circle with the diameter from (−1, 0) to ('+kk+', 0)','drawn']], ask:q===0?'How high above (0, 0) does it meet the line x = 0?':q===1?'What is its radius?':'Where is its centre?', right, opts:shuffle([right,...wrong]), lead:'', why:'Square-root: its centre is the midpoint ('+fshow(fr(kk-1,2))+', 0) and its radius is '+fshow(fr(kk+1,2))+'. It meets x = 0 at (0, ±√'+kk+') = (0, ±'+s+'). So the tools take square roots.'}; }
    if(k===1){ const r=1+rnd(9), right=String(6*r), wrong=uniq(right,[4*r,8*r,3*r,2*r,r*r,12*r].map(String),3);
      return {index:'q:18j.root[h;'+r+']', lines:[['a circle of radius '+r,'drawn'],['the compass steps round it, each step a circle through the centre','the hexagon technique']], ask:'What is the distance round the six-sided figure?', right, opts:shuffle([right,...wrong]), lead:'', why:'Hexagon: each step makes an equilateral triangle with the centre, so each side is the radius, '+r+'. Six sides: '+right+'.'}; }
    const r=1+rnd(8), right=String(2*r*r), wrong=uniq(right,[r*r,4*r*r,2*r,4*r,r*r*r].map(String),3); if(wrong.length<3) return null;
    return {index:'q:18j.root[q;'+r+']', lines:[['a circle of radius '+r,'drawn'],['a diameter and the diameter perpendicular to it meet the circle at four corners','the square technique']], ask:'What is the area of the square with those corners?', right, opts:shuffle([right,...wrong]), lead:'', why:'Neighbouring corners are '+r+' along and '+r+' up from each other, so by right-triangle the side squared is '+r+'² + '+r+'² = '+right+'. That is the area.'}; }});

/* ===== Laundry 5, rung 19 (floor 4 pools, stage R): 19a to 19f, groups ===== */
Object.assign(STEPS,{'19a':['r19a','Groups Defined'],'19b':['r19b','One Identity, One Inverse Each'],'19c':['r19c','Socks and Shoes'],'19d':['r19d','A Part’s Size Divides the Whole’s'],'19e':['r19e','Parity of Shuffles'],'19f':['r19f','Symmetries by Hand']});
const sh19=l=>'['+l.join(' ')+']', comp19=(a,b)=>b.map(v=>a[v-1]), inv19=a=>{ const r=[]; a.forEach((v,i)=>{ r[v-1]=i+1; }); return r; }, id19=n=>Array.from({length:n},(_,i)=>i+1), isid19=a=>a.every((v,i)=>v===i+1);
const perm19=n=>{ let p; do{ p=shuffle(id19(n)); }while(isid19(p)); return p; }, ord19=a=>{ let p=a, k=1; while(!isid19(p)){ p=comp19(a,p); k++; } return k; };
const N19=a=>{ let c=0; a.forEach((v,i)=>{ for(let j=i+1;j<a.length;j++) if(v>a[j]) c++; }); return c; }, sup19=n=>String(n).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join(''), gcd19=(a,b)=>b?gcd19(b,a%b):a;
const any19=n=>sh19(shuffle(id19(n))), go19=(i,x,y)=>x===i&&y===i?i+' stays':i+' goes to '+x+' and then to '+y;
const L19='abcdghkptuvw'.split(''), set19=l=>'{'+l.slice().sort((x,y)=>x-y).join(', ')+'}';

/* ---------- 19a Groups Defined ---------- */
const A19=[
  ['For moves, which is done first in ab?','b: ab is a after b',['a: read from the left','either: the order never matters','both at once'],'ab(x) is a(b(x)). The move next to x is done first.'],
  ['Is ab = ba in every group?','no: in S₃, s₁₂s₂₃ = [2 3 1] and s₂₃s₁₂ = [3 1 2]',['yes','yes, whenever the group is finite','no: it holds in no group'],'A group with ab = ba for all its members is turn-about. S₃ is not. The turns of a wheel are.'],
  ['Which four demands make a group?','results stay in it, brackets do not matter, one member does nothing, every member can be undone',['results stay in it, brackets do not matter, one member does nothing, ab = ba','brackets do not matter, one member does nothing, every member can be undone, it is finite','results stay in it, one member does nothing, every member can be undone, ab = ba'],'Turn-about is not demanded, and neither is being finite.'],
  ['A whole turn of a wheel: which member of the group of turns is it?','the one that does nothing',['the last one','the undo of the half turn','it is not a member'],'A whole turn puts every spoke back where it was. As a move it is the same as no turn.']];
const P19=[
  ['ℕ with +: is it a group?','no: 1 cannot be undone in ℕ',['yes','no: brackets matter','no: no member does nothing'],'0 does nothing, and + regroups. But 1 + n = 0 has no answer in ℕ.'],
  ['ℤ with ·: is it a group?','no: 2 cannot be undone in ℤ',['yes','no: brackets matter','no: no member does nothing'],'1 does nothing, and · regroups. But 2 · n = 1 has no answer in ℤ.'],
  ['ℤ with +: is it a group?','yes',['no: 0 cannot be undone','no: brackets matter','no: a sum can leave ℤ'],'A sum of whole numbers is a whole number, + regroups, 0 does nothing, and −a undoes a.'],
  ['ℚ without 0, with ·: is it a group?','yes',['no: 2 cannot be undone','no: a product can leave it','no: no member does nothing'],'A product of non-zero fractions is not zero, · regroups, 1 does nothing, and 1/a undoes a.'],
  ['ℤ with −: is it a group?','no: brackets matter, as (1 − 1) − 1 is not 1 − (1 − 1)',['yes','no: a difference can leave ℤ','yes, and it is turn-about'],'(1 − 1) − 1 = −1 and 1 − (1 − 1) = 1. The second demand fails.'],
  ['e and the three swaps s₁₂, s₂₃, s₁₃ of three cards, composed: is it a group?','no: s₁₂s₂₃ = [2 3 1] is not among them',['yes','no: s₁₂ cannot be undone','no: brackets matter'],'Each swap undoes itself, and composing always regroups. But a swap after a swap can take all three cards round.'],
  ['The turns of a wheel by whole numbers of twelfths, one after another: is it a group?','yes, with 12 members',['yes, with 11 members','no: a whole turn cannot be undone','no: two turns in a row can leave the family'],'Turns add, the whole turn does nothing, and the turn by k twelfths is undone by the turn by 12 − k. Counting the one that does nothing, there are 12.']];
QP.push({id:'19a.moves',step:'19a',label:'moves that combine',open:()=>measured('19a'),make(){ return writtenQ('19a.moves',A19); }},
  {id:'19a.pass',step:'19a',label:'which families pass',open:()=>measured('19a'),make(){ return writtenQ('19a.pass',P19); }},
  {id:'19a.compose',step:'19a',mode:'work',label:'one shuffle after another',open:()=>measured('19a'),make(){
    const k=rnd(3), n=k===0?3+rnd(2):4+rnd(2), a=perm19(n), b=perm19(n), rs=()=>sh19(perm19(n));
    if(k===0){ const ba=Math.random()<0.5, [f,g]=ba?[b,a]:[a,b], c=comp19(f,g), right=sh19(c), wrong=uniq(right,[sh19(comp19(g,f)),sh19(inv19(c)),sh19(a),sh19(b),rs(),rs(),rs(),rs()],3); if(wrong.length<3) return null;
      return {index:'q:19a.compose[c;'+[sh19(a),sh19(b),ba?1:0].join(';')+']', lines:[['a = '+sh19(a)+' and b = '+sh19(b),'two shuffles, each a list of where 1, 2, … go']], ask:'Which shuffle is '+(ba?'ba':'ab')+'?', right, opts:shuffle([right,...wrong]), lead:'',
        why:(ba?'ba is b after a: a':'ab is a after b: b')+' is done first. '+id19(n).map(i=>go19(i,g[i-1],c[i-1])).join(', ')+'.'}; }
    if(k===1){ const c=inv19(a), right=sh19(c), wrong=uniq(right,[sh19(a),sh19(a.slice().reverse()),sh19(comp19(a,a)),rs(),rs(),rs(),rs()],3); if(wrong.length<3) return null;
      return {index:'q:19a.compose[u;'+sh19(a)+']', lines:[['a = '+sh19(a),'a shuffle, as a list of where 1, 2, … go']], ask:'Which shuffle undoes a?', right, opts:shuffle([right,...wrong]), lead:'',
        why:'a sends i to a(i), so its undo sends a(i) back to i: '+id19(n).map(i=>a[i-1]+' goes back to '+i).join(', ')+'. Done after a, it leaves '+sh19(id19(n))+', the shuffle that does nothing.'}; }
    const c=comp19(a,a), right=isid19(c)?'e':sh19(c), wrong=uniq(right,[sh19(a),sh19(inv19(a)),'e',sh19(a.slice().reverse()),rs(),rs(),rs()],3); if(wrong.length<3) return null;
    return {index:'q:19a.compose[s;'+sh19(a)+']', lines:[['a = '+sh19(a),'a shuffle, as a list of where 1, 2, … go']], ask:'Which shuffle is aa, a done twice?', right, opts:shuffle([right,...wrong]), lead:'',
      why:id19(n).map(i=>go19(i,a[i-1],c[i-1])).join(', ')+'.'+(isid19(c)?' Everything is back in place: a undoes itself.':'')}; }},
  {id:'19a.wheel',step:'19a',mode:'word',label:'turns of a wheel',open:()=>measured('19a'),make(){
    const who=pick(['A wheel','A dial','A turntable','A valve handle']), a=1+rnd(11), b=1+rnd(11), s=(a+b)%12, undo=Math.random()<0.4, t=v=>v%12===0?'no turn at all':'on by '+(v%12)+' mark'+(v%12===1?'':'s'), right=t(undo?12-s:s),
      wrong=uniq(right,(undo?[s,12-a,12-b,Math.abs(a-b),s+1,s+6]:[12-s,Math.abs(a-b),a*b,s+1,s+11,a]).map(v=>t(v+12)),3); if(wrong.length<3) return null;
    return {index:'q:19a.wheel['+[who,a,b,undo?'u':'s'].join(';')+']', a3:['19a.wheel',DASH,DASH], story:who+' has 12 marks, evenly spaced round it. It is turned on by '+a+' mark'+(a===1?'':'s')+', and then on by '+b+' mark'+(b===1?'':'s')+'.', lines:[], ask:undo?'Which turn of fewer than 12 marks puts it back where it began?':'Which turn of fewer than 12 marks does the same as the two together?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Turns add: '+a+' + '+b+' = '+(a+b)+' marks'+(a+b>=12?', and a whole turn of 12 marks does nothing, which leaves '+s:'')+'.'+(undo?' To undo it, turn on by the rest of a whole turn: 12 − '+s+' = '+(12-s)+(s===0?', a whole turn, which is no turn at all':'')+'.':'')}; }});

/* ---------- 19b One Identity, One Inverse Each ---------- */
const B19=[
  ['How many members of a group do nothing?','exactly one',['at least one','one for each side','one for each member'],'One-identity: if e and e′ both do nothing, then ee′ is e′ and it is e, so they are the same member.'],
  ['In a group, ab = ca. Does b = c follow?','no: cancel only on the same side',['yes, by the cancel technique','yes, since a has an inverse','no: nothing ever cancels in a group'],'In S₃, r s₁₂ = s₁₂ r², both being s₁₃, and r is not r².'],
  ['What is the one answer of ax = b?','x = a⁻¹b',['x = ba⁻¹','x = b⁻¹a','x = ab⁻¹'],'a is on the left, so a⁻¹ goes on the left of both sides: a⁻¹(ax) = a⁻¹b.'],
  ['What is (a⁻¹)⁻¹?','a',['a⁻¹','e','a²'],'Undo-the-undo: aa⁻¹ = a⁻¹a = e says that a undoes a⁻¹, and by one-inverse nothing else does.'],
  ['What is the order of a member a?','the least n ≥ 1 with aⁿ = e',['the number of members of the group','the least n ≥ 0 with aⁿ = e','the place of a in a list of the members'],'It is how soon the move comes back. a⁰ = e for every a, so n = 0 would tell nothing.']];
QP.push({id:'19b.one',step:'19b',label:'one way to do nothing, one way to undo',open:()=>measured('19b'),make(){ return writtenQ('19b.one',B19); }},
  {id:'19b.solve',step:'19b',mode:'work',label:'one answer',open:()=>measured('19b'),make(){
    const n=3+rnd(2), a=perm19(n), b=perm19(n), left=Math.random()<0.5; if(sh19(a)===sh19(b)) return null; const ai=inv19(a), x=left?comp19(ai,b):comp19(b,ai), right=sh19(x), wrong=uniq(right,[sh19(left?comp19(b,ai):comp19(ai,b)),sh19(comp19(a,b)),sh19(comp19(b,a)),sh19(comp19(inv19(b),a)),any19(n),any19(n),any19(n),any19(n),any19(n),any19(n),any19(n),any19(n)],3); if(wrong.length<3) return null;
    return {index:'q:19b.solve['+[sh19(a),sh19(b),left?'l':'r'].join(';')+']', lines:[['a = '+sh19(a)+' and b = '+sh19(b),'two shuffles'],[left?'ax = b':'xa = b','to be solved for x']], ask:'Which shuffle is x?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'One-answer: x = '+(left?'a⁻¹b':'ba⁻¹')+', with a⁻¹ = '+sh19(ai)+'. That is '+(left?'a⁻¹ after b':'b after a⁻¹')+': '+right+'. Check: '+(left?'a after x':'x after a')+' is '+sh19(left?comp19(a,x):comp19(x,a))+', which is b.'}; }},
  {id:'19b.order',step:'19b',mode:'work',label:'how soon a move comes back',open:()=>measured('19b'),make(){
    const k=rnd(3);
    if(k===0){ const n=4+rnd(3), a=perm19(n), o=ord19(a), right=String(o), wrong=uniq(right,[n,a.filter((v,i)=>v!==i+1).length,o+1,o-1,2*o,2,3,4].filter(v=>v>=1).map(String),3), pw=[]; let p=a; for(let i=2;i<=o;i++){ p=comp19(a,p); pw.push('a'+sup19(i)+' = '+(i===o?'e':sh19(p))); }
      return {index:'q:19b.order[s;'+sh19(a)+']', lines:[['a = '+sh19(a),'a shuffle of '+n+' things']], ask:'What is the order of a?', right, opts:shuffle([right,...wrong]), lead:'', why:'Keep doing a until everything is back: '+pw.join(', ')+'. The order is the least n ≥ 1 with aⁿ = e.'}; }
    if(k===1){ const t=1+rnd(11), g=gcd19(t,12), o=12/g, right=String(o), wrong=uniq(right,[t,12,12-t,g,o+1,o*2,6,4,3].filter(v=>v>=1).map(String),3);
      return {index:'q:19b.order[w;'+t+']', lines:[['the turn of a wheel by '+t+' twelfth'+(t===1?'':'s')+' of a whole turn','a member of the group of 12 turns']], ask:'What is its order?', right, opts:shuffle([right,...wrong]), lead:'', why:'Done '+o+' times it is '+(o*t)+' twelfths, which is '+(o*t/12)+' whole turn'+(o*t===12?'':'s')+' and so does nothing. Done fewer times, it never comes to a whole number of turns.'}; }
    const o=3+rnd(7), q=1+rnd(6), r=rnd(o), m=q*o+r, f=v=>v===0?'e':v===1?'a':'a'+sup19(v), right=f(r), wrong=uniq(right,[f((r+1)%o),f((r+o-1)%o),f(m%(o+1)),f(q%o),'e','a',f(2)],3); if(wrong.length<3) return null;
    return {index:'q:19b.order[p;'+o+';'+m+']', lines:[['a has the order '+o,'given']], ask:'Which is a'+sup19(m)+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'Powers technique: '+m+' = '+q+' · '+o+(r?' + '+r:'')+', so a'+sup19(m)+' = (a'+sup19(o)+')'+sup19(q)+(r?' · '+f(r):'')+' = '+(r?'e · '+f(r)+' = '+f(r):'e')+'.'}; }},
  {id:'19b.cancel',step:'19b',mode:'proof',label:'cancel on the same side',open:()=>measured('19b'),make(){
    const [a,b,c,d]=take(L19,4), k=rnd(12), opts=['it is licensed','it is not licensed'], sw=Math.random()<0.5, eq=(x,y)=>sw?y+' = '+x:x+' = '+y;
    const K=[[a+b+' = '+a+c,eq(b,c),'the cancel technique',1,'Combine both sides with '+a+'⁻¹ on the left, where '+a+' is.'],
      [b+a+' = '+c+a,eq(b,c),'the cancel technique',1,'Combine both sides with '+a+'⁻¹ on the right, where '+a+' is.'],
      [a+b+' = '+c+a,eq(b,c),'the cancel technique',0,a+' is on the left of one side and on the right of the other. Cancel only on the same side: in S₃, r s₁₂ = s₁₂ r², and r is not r².'],
      [a+'x = '+b,'x = '+a+'⁻¹'+b,'the one-answer technique',1,a+' is on the left, so '+a+'⁻¹ goes on the left of both sides.'],
      [a+'x = '+b,'x = '+b+a+'⁻¹','the one-answer technique',0,a+' is on the left, so '+a+'⁻¹ must go on the left: x = '+a+'⁻¹'+b+'. In a group that is not turn-about, '+b+a+'⁻¹ can be a different member.'],
      ['x'+a+' = '+b,'x = '+b+a+'⁻¹','the one-answer technique',1,a+' is on the right, so '+a+'⁻¹ goes on the right of both sides.'],
      ['x'+a+' = '+b,'x = '+a+'⁻¹'+b,'the one-answer technique',0,a+' is on the right, so '+a+'⁻¹ must go on the right: x = '+b+a+'⁻¹.'],
      [a+b+' = e',eq(b,a+'⁻¹'),'the one-answer technique',1,a+'x = e has exactly one answer, '+a+'⁻¹e = '+a+'⁻¹, and '+b+' is an answer.'],
      [a+'² = e',eq(a,'e'),'the cancel technique',0,'A swap done twice does nothing, and a swap is not e. From '+a+a+' = e, cancelling gives only '+a+' = '+a+'⁻¹.'],
      [a+b+c+' = '+a+b+d,eq(c,d),'the cancel technique, twice',1,'Cancel '+a+' on the left, and then '+b+' on the left.'],
      [a+b+c+' = '+d+b+c,eq(a,d),'the cancel technique, twice',1,'Cancel '+c+' on the right, and then '+b+' on the right.'],
      [a+b+c+' = '+b+c+d,eq(a,d),'the cancel technique, twice',0,b+c+' is on the right of one side and on the left of the other, so nothing cancels.']][k];
    return {index:'q:19b.cancel['+[k,a,b,c,d,sw?1:0].join(';')+']', stack:true, lines:[[K[0],'given, in a group'],[K[1],K[2]]], ask:'Is line 2 licensed?', right:opts[K[3]?0:1], opts, lead:'', why:K[4]}; }});

/* ---------- 19c Socks and Shoes ---------- */
const C19=[
  ['What is (ab)⁻¹ in any group?','b⁻¹a⁻¹',['a⁻¹b⁻¹','ba','a⁻¹b'],'Socks-and-shoes: ab is b first and then a, so undo a first and then b. (ab)(b⁻¹a⁻¹) = a(bb⁻¹)a⁻¹ = e.'],
  ['When is (ab)⁻¹ = a⁻¹b⁻¹ for all a and b?','exactly when the group is turn-about',['in every group','in no group','exactly when the group is finite'],'Turn-about-undo. In S₃, with a = s₁₂ and b = s₂₃, (ab)⁻¹ = r² and a⁻¹b⁻¹ = r.'],
  ['Is (ab)² = a²b² in every group?','no: it needs ab = ba',['yes, by the powers technique','yes, by regrouping','no: it holds in no group'],'(ab)² = abab. Set it equal to aabb and cancel a on the left and b on the right: ba = ab.'],
  ['Socks went on, then shoes, then a coat. Which comes off first?','the coat',['the socks','the shoes','any of them'],'Undress-in-reverse: whatever went on last comes off first.'],
  ['What is (abc)⁻¹?','c⁻¹b⁻¹a⁻¹',['a⁻¹b⁻¹c⁻¹','b⁻¹c⁻¹a⁻¹','cba'],'Undress-in-reverse: the undoes come in the opposite order.']];
QP.push({id:'19c.last',step:'19c',label:'undo the last move first',open:()=>measured('19c'),make(){ return writtenQ('19c.last',C19); }},
  {id:'19c.undo',step:'19c',mode:'work',label:'undoing two moves and more',open:()=>measured('19c'),make(){
    if(Math.random()<0.5){ const n=3+rnd(2), a=perm19(n), b=perm19(n), ab=comp19(a,b), c=inv19(ab), right=sh19(c), wrong=uniq(right,[sh19(comp19(inv19(a),inv19(b))),sh19(ab),sh19(comp19(b,a)),sh19(inv19(a)),sh19(inv19(b)),sh19(perm19(n)),sh19(perm19(n)),sh19(perm19(n))],3); if(wrong.length<3) return null;
      return {index:'q:19c.undo[l;'+sh19(a)+';'+sh19(b)+']', lines:[['a = '+sh19(a)+' and b = '+sh19(b),'two shuffles']], ask:'Which shuffle is (ab)⁻¹?', right, opts:shuffle([right,...wrong]), lead:'', why:'Socks-and-shoes: (ab)⁻¹ = b⁻¹a⁻¹, with a⁻¹ = '+sh19(inv19(a))+' and b⁻¹ = '+sh19(inv19(b))+'. b⁻¹ after a⁻¹ is '+right+'. Check: ab = '+sh19(ab)+', and '+right+' sends each number back.'}; }
    const n=3+rnd(2), ls=take(L19,n), fl=ls.map(()=>Math.random()<0.4), tok=(l,i)=>l+(i?'⁻¹':''), str=(xs,fs)=>xs.map((l,i)=>tok(l,fs[i])).join(''), rl=ls.slice().reverse(), rf=fl.slice().reverse().map(v=>!v), right=str(rl,rf), one=rf.slice(); one[0]=!one[0]; const two=rf.slice(); two[n-1]=!two[n-1];
    const wrong=uniq(right,[str(ls,fl.map(v=>!v)),str(rl,fl.slice().reverse()),str(rl,one),str(rl,two),str(ls,fl)],3); if(wrong.length<3) return null;
    return {index:'q:19c.undo[s;'+str(ls,fl)+']', lines:[['('+str(ls,fl)+')⁻¹','to be written without brackets']], ask:'Which is it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Undress-in-reverse: undo each move, last one first.'+(fl.some(v=>v)?' Where a move is already an undo, undo-the-undo gives the move back.':'')}; }},
  {id:'19c.line',step:'19c',mode:'proof',label:'does the order matter here',open:()=>measured('19c'),make(){
    const [a,b,c]=take(L19,3), [G,ta]=pick([['the turns of a wheel by twelfths',1],['the quarter turns {e, q, q², q³}',1],['ℚ without 0, with ·',1],['a turn-about group',1],['S₃',0],['S₄',0],['the shuffles of five cards',0],['a group',2]]), k=rnd(6), opts=['it is licensed','it is not licensed'];
    const [claim,reason,need]=[['('+a+b+')⁻¹ = '+a+'⁻¹'+b+'⁻¹','turn-about-undo',1],['('+a+b+')² = '+a+'²'+b+'²','regroup and turn about',1],['('+a+b+')⁻¹ = '+b+'⁻¹'+a+'⁻¹','socks-and-shoes',0],[a+b+' = '+b+a,'turn about',1],['('+a+b+c+')⁻¹ = '+c+'⁻¹'+b+'⁻¹'+a+'⁻¹','undress-in-reverse',0],['('+a+b+c+')⁻¹ = '+a+'⁻¹'+b+'⁻¹'+c+'⁻¹','undress-in-reverse, then turn about',1]][k], ok=!need||ta===1;
    return {index:'q:19c.line['+[k,G,a,b,c].join(';')+']', stack:true, lines:[[(k>3?a+', '+b+' and '+c:a+' and '+b)+' are any members of '+G,'given'],[claim,reason]], ask:'Is line 2 licensed?', right:opts[ok?0:1], opts, lead:'',
      why:!need?'It holds in every group: undo the last move first. No turning about is used.':ta===1?'This group is turn-about, so its members may change places, and the line follows.':ta===0?'This group is not turn-about: already s₁₂s₂₃ = [2 3 1] and s₂₃s₁₂ = [3 1 2] differ. The line needs members to change places.':'The line needs '+a+b+' = '+b+a+'. Some groups are turn-about and S₃ is not, so the word group alone does not license it.'}; }});

/* ---------- 19d A Part's Size Divides the Whole's ---------- */
const D19=[
  ['A group has 12 members. Can a part-group of it have 5?','no: 5 does not divide 12',['yes','yes, if the group is turn-about','no: a part-group has an even number of members'],'Part-divides-whole: the copies of the part-group are all of its size and sort the 12 members with none left over.'],
  ['m divides the size of a finite group. Must the group have a part-group of m members?','no: the technique goes one way only',['yes, by part-divides-whole','yes: take any m members','no: never, unless m = 1'],'Part-divides-whole says what a part-group’s size must do. It does not promise a part-group for each divisor.'],
  ['When is the copy aH a part-group?','only when a is in H, and then aH = H',['always','never','only when a = e'],'A part-group holds e. e = ah means a = h⁻¹, a member of H.'],
  ['Two copies aH and bH share one member. What follows?','they are the same set',['they share exactly one member','a = b','H has one member'],'Copies-never-overlap: two copies are the same set or share no member.'],
  ['A group has a prime number of members. Which part-groups does it have?','only {e} and the whole group',['none','one for each member','one of each size up to the prime'],'A part-group’s size divides the prime, so it is 1 or the prime.']];
QP.push({id:'19d.part',step:'19d',label:'groups inside groups',open:()=>measured('19d'),make(){ return writtenQ('19d.part',D19); }},
  {id:'19d.sizes',step:'19d',mode:'work',label:'sizes that divide',open:()=>measured('19d'),make(){
    const k=rnd(4), n=pick([12,18,20,24,28,30,36,40,42,45,48,60]), ds=id19(n).filter(v=>v>1&&v<n&&n%v===0), nd=id19(n).filter(v=>v>1&&n%v!==0);
    if(k===0||k===2){ const right=String(pick(ds)), wrong=take(nd,3).map(String);
      return {index:'q:19d.sizes['+[k,n,right].concat(wrong).join(';')+']', lines:[['a group of '+n+' members','given']], ask:k===0?'Which of these can be the size of a part-group of it?':'Which of these can be the order of a member of it?', right, opts:shuffle([right,...wrong]), lead:'', why:(k===0?'Part-divides-whole':'Order-divides')+': the number must divide '+n+'. '+right+' does, since '+n+' = '+right+' · '+(n/right)+'. None of the others does.'}; }
    if(k===1){ const m=pick(ds), right=String(n/m), wrong=uniq(right,[n-m,m,n/m+1,n/m-1,n,n+m].filter(v=>v>=1).map(String),3); if(wrong.length<3) return null;
      return {index:'q:19d.sizes[c;'+n+';'+m+']', lines:[['a group of '+n+' members','given'],['a part-group H of '+m+' members','given']], ask:'How many different copies aH are there?', right, opts:shuffle([right,...wrong]), lead:'', why:'Every copy has '+m+' members, and the copies sort all '+n+' members with no overlap: '+n+' = '+right+' · '+m+'.'}; }
    const p=pick([5,7,11,13,17,19,23]), right=String(p), wrong=uniq(right,['1','2',String(p-1),String((p-1)/2),String(p+1)],3);
    return {index:'q:19d.sizes[p;'+p+']', lines:[['a group of '+p+' members','given'],['a is a member, and a is not e','given']], ask:'What is the order of a?', right, opts:shuffle([right,...wrong]), lead:'', why:'Order-divides: the order divides '+p+', a prime, so it is 1 or '+p+'. Only e has the order 1.'}; }},
  {id:'19d.copies',step:'19d',mode:'work',label:'shifted copies on the wheel',open:()=>measured('19d'),make(){
    const d=pick([2,3,4,6]), H=id19(12/d).map(i=>(i-1)*d), a=1+rnd(11), cp=x=>set19(H.map(h=>(x+h)%12)), k=rnd(3), top=[['the turns of a wheel by twelfths, k for the turn by k twelfths','the group'],['H = '+set19(H),'a part-group']];
    if(k===0){ const right=cp(a), wrong=uniq(right,[set19(H),cp(a+1),cp(a+d-1),set19(H.map((h,i)=>(a+i)%12)),set19(uniq(-1,H.map(h=>(a*h)%12),12)),cp(a+2)],3); if(wrong.length<3) return null;
      return {index:'q:19d.copies[s;'+d+';'+a+']', lines:top, ask:'Which set is the copy '+a+' + H?', right, opts:shuffle([right,...wrong]), lead:'', why:'Add '+a+' to each member of H, taking away 12 when the sum reaches 12: '+right+'.'+(a%d===0?' Since '+a+' is in H, the copy is H itself.':'')}; }
    if(k===1){ const right=String(d), wrong=uniq(right,[12/d,12,12-12/d,d+1,d-1,11].filter(v=>v>=1).map(String),3);
      return {index:'q:19d.copies[n;'+d+']', lines:top, ask:'How many different copies has H?', right, opts:shuffle([right,...wrong]), lead:'', why:'H has '+(12/d)+' members, every copy has as many, and the copies sort the 12 turns: 12 = '+d+' · '+(12/d)+'.'}; }
    if(d===2) return null; const y=(a+d*(1+rnd(12/d-1)))%12, bad=id19(12).map(v=>v-1).filter(v=>(v-a)%d!==0), right=String(y), wrong=take(bad,3).map(String);
    return {index:'q:19d.copies[m;'+[d,a,y].concat(wrong).join(';')+']', lines:top, ask:'Which of these lies in the same copy as '+a+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'The copy of '+a+' is '+cp(a)+', and '+y+' is in it. Two turns lie in one copy exactly when they differ by a member of H.'}; }});

/* ---------- 19e Parity of Shuffles ---------- */
const E19=[
  ['What does N(σ) count?','the pairs of places i < j with σ(i) > σ(j)',['the things that σ moves','the swaps in the shortest string for σ','the order of σ'],'A pair is out of order when the bigger number comes first in the list. [3 2 1] is one swap and has three pairs out of order.'],
  ['A shuffle moves an even number of things. Is it even?','not always: a swap moves two things and is odd',['yes','yes, when it has the order 2','no: never'],'Even and odd go by N(σ), or by the length of any string of swaps. [2 3 1] moves three things and is even.'],
  ['A shuffle has the order 2. Is it odd?','not always: [2 1 4 3] has the order 2 and is even',['yes: it is a swap','yes, by the parity technique','no: never'],'[2 1 4 3] is two swaps, s₁₂ and s₃₄.'],
  ['One string of swaps for σ has 7 swaps. Can another have 10?','no: every string for σ is odd in length',['yes','yes, if σ moves enough things','no: every string for σ has exactly 7'],'Parity technique. Strings of 9 or 11 swaps exist: add a swap and the same swap again.'],
  ['How many of the n! shuffles of {1, …, n} are even, for n ≥ 2?','half of them: n!/2',['all but the swaps','(n − 1)!','n'],'Half-are-even: doing s₁₂ after each even shuffle matches the even ones with the odd ones.']];
QP.push({id:'19e.even',step:'19e',label:'even and odd',open:()=>measured('19e'),make(){ return writtenQ('19e.even',E19); }},
  {id:'19e.count',step:'19e',mode:'work',label:'pairs out of order',open:()=>measured('19e'),make(){
    const n=4+rnd(3), a=perm19(n), N=N19(a), right=String(N), mv=a.filter((v,i)=>v!==i+1).length, wrong=uniq(right,[N+1,N-1,mv,n*(n-1)/2-N,N+2,n].filter(v=>v>=0).map(String),3), ps=[]; a.forEach((v,i)=>{ for(let j=i+1;j<n;j++) if(v>a[j]) ps.push(v+' before '+a[j]); });
    return {index:'q:19e.count['+sh19(a)+']', lines:[['σ = '+sh19(a),'a shuffle']], ask:'What is N(σ), the number of pairs out of order?', right, opts:shuffle([right,...wrong]), lead:'', why:'Go through the list and count each bigger number that comes before a smaller one: '+ps.join(', ')+'.'}; }},
  {id:'19e.parity',step:'19e',mode:'work',label:'which shuffles are even',open:()=>measured('19e'),make(){
    const k=rnd(3);
    if(k===0){ const n=4+rnd(2), ev=Math.random()<0.5, good=[], bad=[]; for(let i=0;i<40&&(good.length<1||bad.length<3);i++){ const p=perm19(n), s=sh19(p); if((N19(p)%2===0)===ev){ if(!good.length) good.push(p); } else if(!bad.some(b=>sh19(b)===s)) bad.push(p); } if(good.length<1||bad.length<3) return null;
      const right=sh19(good[0]), wrong=bad.slice(0,3).map(sh19);
      return {index:'q:19e.parity[w;'+[right].concat(wrong).join(';')+']', lines:[['four shuffles of {1, …, '+n+'}','one of them is '+(ev?'even':'odd')]], ask:'Which one is '+(ev?'even':'odd')+'?', right, opts:shuffle([right,...wrong]), lead:'', why:right+' has '+N19(good[0])+' pair'+(N19(good[0])===1?'':'s')+' out of order, an '+(ev?'even':'odd')+' number. The others have '+bad.slice(0,3).map(N19).join(', ')+'.'}; }
    if(k===1){ const n=3+rnd(6), f=fact16(n), right=String(f/2), wrong=uniq(right,[f,fact16(n-1),n*(n-1)/2,2*n,f/2-1,f/n].map(String),3); if(wrong.length<3) return null;
      return {index:'q:19e.parity[a;'+n+']', lines:[['Aₙ, the even shuffles of {1, …, n}, with n = '+n,'a part-group of Sₙ']], ask:'How many members has it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Half-are-even: n!/2 = '+f+'/2 = '+right+'.'}; }
    const m=2+rnd(9), j=2+rnd(9), ev=(m+j)%2===0, opts=['even','odd','even only when σ and τ turn about','it depends on which swaps were used'];
    return {index:'q:19e.parity[p;'+m+';'+j+']', lines:[['σ is a string of '+m+' swaps','given'],['τ is a string of '+j+' swaps','given']], ask:'Is στ even or odd?', right:opts[ev?0:1], opts, lead:'', why:'Put the two strings end to end: a string of '+m+' + '+j+' = '+(m+j)+' swaps for στ. By the parity technique every string for στ is then '+(ev?'even':'odd')+' in length.'}; }},
  {id:'19e.swaps',step:'19e',mode:'proof',label:'can it be that many swaps',open:()=>measured('19e'),make(){
    const n=4+rnd(2), a=perm19(n), N=N19(a), m=n-1+rnd(7), ok=(m-N)%2===0, opts=['it can be true','it cannot be true'];
    return {index:'q:19e.swaps['+sh19(a)+';'+m+']', stack:true, lines:[['σ = '+sh19(a),'a shuffle'],['N(σ) = '+N,'count the pairs out of order'],['σ is a string of '+m+' swaps','claimed']], ask:'Can line 3 be true?', right:opts[ok?0:1], opts, lead:'',
      why:'Parity technique: N(σ) = '+N+' is '+(N%2?'odd':'even')+', so every string of swaps for σ is '+(N%2?'odd':'even')+' in length. '+(ok?m+' is '+(m%2?'odd':'even')+' too. Swaps-build-every-shuffle gives a string of at most '+(n-1)+', and a swap done twice lengthens it by 2 at a time.':m+' is '+(m%2?'odd':'even')+', so no string of '+m+' swaps gives σ.')}; }});

/* ---------- 19f Symmetries by Hand ---------- */
const F19=[
  ['What is a symmetry of a polygon, on this step?','a shuffle of its corners that sends neighbours to neighbours',['any shuffle of its corners','a turn of it on the table','a shuffle of its corners that keeps one corner in place'],'Corners that share a side must still share a side afterwards.'],
  ['How many of the 24 shuffles of a square’s corners are symmetries?','8',['4','16','24'],'Place-then-count: 4 places for corner 1, then 2 for its neighbour, and the rest is forced. 2 · 4 = 8.'],
  ['Are all of a square’s symmetries turns on the table?','no: four of the eight need the card turned over',['yes','no: only the half turn is','no: none of them is'],'The quarter turn, the half turn, three quarters and doing nothing stay on the table. The other four lift the card.'],
  ['A rectangle is not a square. How many symmetries has it?','4',['8','2','1'],'Corner 1 can go to any of 4 corners, but its neighbour along the long side must stay along a long side: 4 · 1.'],
  ['Do the symmetries of the square turn about?','no: qf = [3 2 1 4] and fq = [1 4 3 2]',['yes','yes: every group of 8 members does','no: no two of them do'],'With q = [2 3 4 1] and f = [2 1 4 3]. Some pairs do turn about: q and q² do.']];
const sym19=p=>{ const n=p.length; return p.every((v,i)=>{ const d=Math.abs(v-p[(i+1)%n]); return d===1||d===n-1; }); };
QP.push({id:'19f.keep',step:'19f',label:'shuffles that keep neighbours',open:()=>measured('19f'),make(){ return writtenQ('19f.keep',F19); }},
  {id:'19f.count',step:'19f',mode:'work',label:'counting symmetries',open:()=>measured('19f'),make(){
    const k=rnd(4), n=k===3?4+rnd(4):3+rnd(10), top=[['a regular polygon with '+n+' corners','given']];
    if(k===0){ const right=String(2*n), wrong=uniq(right,[n,n*n,4*n,n+2,2*n-2,2*n+2].map(String),3);
      return {index:'q:19f.count[a;'+n+']', lines:top, ask:'How many symmetries has it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Place-then-count: '+n+' places for corner 1, then 2 for its neighbour, and every other corner is forced. 2 · '+n+' = '+right+'.'}; }
    if(k===1){ const right=String(n), wrong=uniq(right,[2*n,n-1,n+1,n*n,1].map(String),3);
      return {index:'q:19f.count[t;'+n+']', lines:top, ask:'How many of its symmetries are turns on the table, doing nothing among them?', right, opts:shuffle([right,...wrong]), lead:'', why:'A turn by one '+n+'th of a whole turn, done 1, 2, … up to '+n+' times: '+n+' turns, the last of them doing nothing. The other '+n+' symmetries turn the polygon over.'}; }
    if(k===2){ const j=2+rnd(n-1), right='2', wrong=uniq(right,['1',String(n),String(2*n),String(n-1),'4'],3);
      return {index:'q:19f.count[j;'+n+';'+j+']', lines:top, ask:'How many of its symmetries send corner 1 to corner '+j+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'Once corner 1 is at '+j+', corner 2 must go to one of the two neighbours of '+j+', and then every other corner is forced. One of the two is a turn on the table, and the other turns the polygon over.'}; }
    const f=fact16(n), right=String(f-2*n), wrong=uniq(right,[f-n,2*n,f/2,f-2*n-2,f-4*n,f].map(String),3);
    return {index:'q:19f.count[r;'+n+']', lines:top, ask:'How many of the '+f+' shuffles of its corners are not symmetries?', right, opts:shuffle([right,...wrong]), lead:'', why:'It has 2 · '+n+' = '+(2*n)+' symmetries, and '+f+' − '+(2*n)+' = '+right+'. Every one of those sends some two neighbours to corners that are not neighbours.'}; }},
  {id:'19f.which',step:'19f',mode:'work',label:'which shuffles are symmetries',open:()=>measured('19f'),make(){
    const n=4+rnd(3), good=[], bad=[]; for(let i=0;i<300&&(good.length<1||bad.length<3);i++){ const p=perm19(n), s=sh19(p); if(sym19(p)){ if(!good.length) good.push(p); } else if(bad.length<3&&!bad.some(b=>sh19(b)===s)) bad.push(p); } if(good.length<1||bad.length<3) return null;
    const g=good[0], right=sh19(g), wrong=bad.map(sh19), b=bad[0], i=id19(n).find(t=>{ const d=Math.abs(b[t-1]-b[t%n]); return !(d===1||d===n-1); }), up=g[1]===g[0]%n+1;
    return {index:'q:19f.which['+[right].concat(wrong).join(';')+']', lines:[['a regular polygon with '+n+' corners, labelled 1 to '+n+' in order round it','given'],['four shuffles of its corners','one of them is a symmetry']], ask:'Which one is a symmetry?', right, opts:shuffle([right,...wrong]), lead:'',
      why:right+' reads round the polygon in order, '+(up?'the same way round: a turn on the table':'the other way round: the polygon is turned over')+'. So neighbours stay neighbours. In '+wrong[0]+', the neighbours '+i+' and '+(i%n+1)+' go to '+b[i-1]+' and '+b[i%n]+', which are not neighbours.'}; }},
  {id:'19f.tile',step:'19f',mode:'word',label:'ways to fit',open:()=>measured('19f'),make(){
    const who=pick(['A paving tile','A lid','A puzzle piece','A hatch cover']), flip=Math.random()<0.5, rect=Math.random()<0.15, n=3+rnd(10), v=rect?(flip?4:2):(flip?2*n:n), right=String(v), wrong=uniq(right,(rect?[2,4,8,1,6]:[n,2*n,4*n,n-1,n+1,2*n-1]).map(String),3);
    return {index:'q:19f.tile['+[who,rect?'r':n,flip?1:0].join(';')+']', a3:['19f.tile',DASH,DASH], story:who+' has the shape of '+(rect?'a rectangle that is not a square':'a regular polygon with '+n+' corners')+'. '+(flip?'Its two faces are alike, so it may go in either face up.':'It must go in with its marked face up.'), lines:[], ask:'In how many ways does it fit its hole?', right, opts:shuffle([right,...wrong]), lead:'',
      why:rect?(flip?'A rectangle that is not a square has 4 symmetries: corner 1 can go to any of 4 corners, and then its neighbour along the long side is forced.':'Of the rectangle’s 4 symmetries, 2 are turns on the table: doing nothing, and the half turn. The other 2 turn it over.'):(flip?'Place-then-count: '+n+' places for one corner, then 2 for its neighbour. 2 · '+n+' = '+right+'.':'With one face up, only the turns on the table are left: '+n+' of them, doing nothing among them. The other '+n+' symmetries turn it over.')}; }});

/* ===== Laundry 5, rung 20 (floor 4 pools, stage S): 20a to 20j, moves of the plane ===== */
Object.assign(STEPS,{'20a':['r20a','Isometries and Similarities'],'20b':['r20b','Distance-Keepers Form a Group'],'20c':['r20c','Slide, Flip, Turn'],'20d':['r20d','All Three Keep Distances'],'20e':['r20e','Two Flips'],
  '20f':['r20f','Every Isometry Is at Most Three Flips'],'20g':['r20g','Handedness'],'20h':['r20h','Sorting Geometries by the Moves They Keep'],'20i':['r20i','Moving Graphs'],'20j':['r20j','Turns in Coordinates']});
const nz20=n=>pick(id19(n).concat(id19(n).map(v=>-v))), K20=[[2,1],[3,1],[4,1],[5,1],[1,2],[1,3],[3,2],[2,3],[5,2],[3,4],[1,4],[4,3]], U20=[[3,4,5],[4,3,5],[5,12,13],[12,5,13],[8,15,17],[15,8,17]];
const upair20=()=>{ const [a,b,c]=pick(U20); return [sn18()*a,sn18()*b,c]; }, pr20=(a,b,c)=>fpt18(fr(a,c),fr(b,c)), D20=(A,B,C)=>(B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0]), P20=p=>pt18(p[0],p[1]);
/* the moves used by name: [name, where (x, y) goes] */
const ISO20=[['the turn about the origin by (0, 1)',(x,y)=>[-y,x]],['the turn about the origin by (−1, 0)',(x,y)=>[-x,-y]],['the turn about the origin by (0, −1)',(x,y)=>[y,-x]],['the flip across the floor y = 0',(x,y)=>[x,-y]],['the flip across the line x = 0',(x,y)=>[-x,y]],['the flip across the line y = x',(x,y)=>[y,x]],['the flip across the line y = −x',(x,y)=>[-y,-x]]];

/* ---------- 20a Isometries and Similarities ---------- */
const A20=[
  ['What is an isometry?','a move f with d(f(P), f(Q)) = d(P, Q) for all P and Q',['a move that keeps some distances','a move with d(f(P), P) the same for all P','a move that leaves the origin in place'],'Every distance, for every pair of points. A slide moves the origin and is an isometry.'],
  ['(x, y) ↦ (2x, y): is it a similarity?','no: it doubles widths and keeps heights, so it has no one factor',['yes, with the factor 2','yes, with the factor 1','no: it is an isometry'],'A similarity multiplies every distance by the same k.'],
  ['Are all rectangles similar?','no: a similarity keeps the ratio of the sides',['yes','yes, as all circles are','no: only those with equal areas are'],'A 1 by 2 and a 1 by 3 rectangle differ in that ratio.'],
  ['Are all circles similar?','yes: slide one centre to the other and stretch by the ratio of the radii',['no: only circles with equal radii','no: only circles with one centre','yes: every two figures are'],'All-circles-similar. Circles with equal radii are more: congruent.'],
  ['An isometry is a similarity with which factor?','1',['0','2','any k > 0'],'d(f(P), f(Q)) = 1 · d(P, Q).']];
QP.push({id:'20a.keep',step:'20a',label:'keeping distance, keeping shape',open:()=>measured('20a'),make(){ return writtenQ('20a.keep',A20); }},
  {id:'20a.factor',step:'20a',mode:'work',label:'factors and moves',open:()=>measured('20a'),make(){
    const k=rnd(4), h=nz20(5), j=nz20(5);
    if(k===0){ const [n,d]=pick(K20), L=6*(1+rnd(6)), F=fr(n,d), right=fshow(fmul(F,fint(L))), wrong=frs16(right,[fint(L),fmul(fr(d,n),fint(L)),fmul(fmul(F,F),fint(L)),fadd(F,fint(L)),fint(L+1)]); if(wrong.length<3) return null;
      return {index:'q:20a.factor[l;'+[n,d,L].join(';')+']', lines:[['f is a similarity with the factor '+fshow(F),'given'],['d(P, Q) = '+L,'given']], ask:'What is d(f(P), f(Q))?', right, opts:shuffle([right,...wrong]), lead:'', why:'A similarity with the factor k has d(f(P), f(Q)) = k · d(P, Q): '+fshow(F)+' · '+L+' = '+right+'.'}; }
    if(k===1){ const r=1+rnd(9), r2=pick(id19(9).filter(v=>v!==r)), right=fshow(fr(r2,r)), wrong=frs16(right,[fr(r,r2),fint(Math.abs(r2-r)),fint(r*r2),fint(r+r2),fint(1)]); if(wrong.length<3) return null;
      return {index:'q:20a.factor[c;'+r+';'+r2+']', lines:[['a circle of radius '+r+' and a circle of radius '+r2,'given']], ask:'Which factor has a similarity that sends the first onto the second?', right, opts:shuffle([right,...wrong]), lead:'', why:'All-circles-similar: slide the first centre to the second and stretch by the ratio of the radii, r′/r = '+right+'.'}; }
    if(k===2){ const right=pick(['(x'+pm(h)+', y'+pm(j)+')','(−x, y'+pm(j)+')','(y, x)','(−y, x)','(x'+pm(h)+', −y)','(−x, −y)','(y'+pm(h)+', −x)','(−y'+pm(h)+', −x'+pm(j)+')']), wrong=take(['(2x, 2y)','(2x, y)','(x, 3y)','(x + y, y)','(x/2, y/2)','(−2x, y)','(3x, 3y'+pm(j)+')','(x'+pm(h)+', 2y)','(x − y, x + y)','(x, x + y)'],3);
      return {index:'q:20a.factor[i;'+[right].concat(wrong).join(';')+']', lines:[['four moves, each given by where it sends (x, y)','one of them keeps every distance']], ask:'Which one is an isometry?', right, opts:shuffle([right,...wrong]), lead:'', why:right+' is made of slides, quarter turns and flips alone. Each of the others changes the distance from (0, 0) to (1, 0) or to (0, 1).'}; }
    const c=2+rnd(4), right=pick(['('+c+'x, '+c+'y)','(−'+c+'y, '+c+'x)','('+c+'x'+pm(h)+', '+c+'y'+pm(j)+')','('+c+'x, −'+c+'y)']), wrong=take(['('+c+'x, y)','(x + '+c+', y + '+c+')','(x, '+c+'y)','('+(c*c)+'x, '+(c*c)+'y)','('+c+'x, '+(2*c)+'y)','(x/'+c+', y/'+c+')'],3);
    return {index:'q:20a.factor[s;'+[right].concat(wrong).join(';')+']', lines:[['four moves, each given by where it sends (x, y)','one of them multiplies every distance by '+c]], ask:'Which one is a similarity with the factor '+c+'?', right, opts:shuffle([right,...wrong]), lead:'', why:right+' is the stretch from the origin by '+c+', with at most a slide, a quarter turn or a flip as well. The others have another factor, or no one factor.'}; }});

/* ---------- 20b Distance-Keepers Form a Group ---------- */
const B20=[
  ['Do isometries turn about?','not in general: the order can matter',['yes','yes: only similarities do not','no: no two of them do'],'Slide right by 1 and then flip across the line x = 0: (0, 0) goes to (−1, 0). In the other order it goes to (1, 0).'],
  ['f keeps every distance. Does f⁻¹?','yes, always',['no','only when f is a slide','only when f undoes itself'],'Undo-keeps: put f⁻¹(P) and f⁻¹(Q) into f, which keeps their distance, and you get P and Q back.'],
  ['What is a symmetry of a set S of points?','an isometry f with f(S) = S',['any move f with f(S) = S','an isometry that leaves each point of S in place','a similarity f with f(S) = S'],'It keeps every distance and sends the figure onto itself. The points of S may change places.'],
  ['f is a similarity with the factor k. Which factor has f⁻¹?','1/k',['k','−k','1 − k'],'Factors multiply, and f⁻¹ after f does nothing, with the factor 1.'],
  ['The symmetries of a figure, composed: what do they form?','a part-group of the isometries',['a group only when the figure is regular','the whole group of isometries','no group: the order matters'],'Symmetries-of-a-figure: if f(S) = S and g(S) = S then g(f(S)) = S and f⁻¹(S) = S.']];
QP.push({id:'20b.group',step:'20b',label:'two in a row, and undoing',open:()=>measured('20b'),make(){ return writtenQ('20b.group',B20); }},
  {id:'20b.factors',step:'20b',mode:'work',label:'factors multiply',open:()=>measured('20b'),make(){
    const k=rnd(4), [n,d]=pick(K20), [n2,d2]=pick(K20), F=fr(n,d), G=fr(n2,d2), I=fr(d,n);
    if(k===0){ const right=fshow(fmul(F,G)), wrong=frs16(right,[fadd(F,G),fmul(F,fr(d2,n2)),F,G,fint(1)]); if(wrong.length<3) return null;
      return {index:'q:20b.factors[m;'+[n,d,n2,d2].join(';')+']', lines:[['f is a similarity with the factor '+fshow(F),'given'],['g is a similarity with the factor '+fshow(G),'given']], ask:'Which factor has g ∘ f?', right, opts:shuffle([right,...wrong]), lead:'', why:'Similarities-form-a-group: the factors multiply. '+fshow(G)+' · '+fshow(F)+' = '+right+'.'}; }
    if(k===1||k===2){ const right=fshow(I), wrong=frs16(right,[F,fint(1),fmul(F,F),fneg(F),fsub(fint(1),F),fmul(I,I)]); if(wrong.length<3) return null;
      return {index:'q:20b.factors['+(k===1?'u':'i')+';'+n+';'+d+']', lines:k===1?[['f is a similarity with the factor '+fshow(F),'given']]:[['f is a similarity with the factor '+fshow(F),'given'],['g ∘ f is an isometry','given']], ask:k===1?'Which factor has f⁻¹?':'Which factor has g?', right, opts:shuffle([right,...wrong]), lead:'', why:k===1?'f⁻¹ after f does nothing, with the factor 1, and factors multiply: the factor of f⁻¹ is 1/k = '+right+'.':'An isometry has the factor 1, and factors multiply: the factor of g times '+fshow(F)+' is 1, so it is '+right+'.'}; }
    const m=2+rnd(2), P=m===2?fmul(F,F):fmul(F,fmul(F,F)), right=fshow(P), wrong=frs16(right,[fmul(F,fint(m)),F,m===2?fmul(F,fmul(F,F)):fmul(F,F),fadd(F,fint(m)),fint(1)]); if(wrong.length<3) return null;
    return {index:'q:20b.factors[p;'+[n,d,m].join(';')+']', lines:[['f is a similarity with the factor '+fshow(F),'given']], ask:'Which factor has f done '+(m===2?'twice':'three times')+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'Factors multiply: '+Array(m).fill(fshow(F)).join(' · ')+' = '+right+'.'}; }},
  {id:'20b.line',step:'20b',mode:'proof',label:'is it an isometry',open:()=>measured('20b'),make(){
    const [n,d]=pick(K20), F=fr(n,d), k=rnd(3), opts=['it is licensed','it is not licensed'], inv=Math.random()<0.5, [n2,d2]=inv?[d,n]:pick(K20), G=fr(n2,d2), M=fmul(F,G), S=fadd(F,G);
    if(k===0){ const ok=fsame(M,fint(1));
      return {index:'q:20b.line[i;'+[n,d,n2,d2].join(';')+']', stack:true, lines:[['f is a similarity with the factor '+fshow(F),'given'],['g is a similarity with the factor '+fshow(G),'given'],['g ∘ f is an isometry','similarities-form-a-group']], ask:'Is line 3 licensed?', right:opts[ok?0:1], opts, lead:'', why:'Factors multiply: '+fshow(G)+' · '+fshow(F)+' = '+fshow(M)+'. '+(ok?'A similarity with the factor 1 keeps every distance.':'That is not 1, so g ∘ f changes every distance between two different points.')}; }
    if(k===1){ const ok=Math.random()<0.5; if(fsame(M,S)) return null;
      return {index:'q:20b.line[f;'+[n,d,n2,d2,ok?1:0].join(';')+']', stack:true, lines:[['f is a similarity with the factor '+fshow(F),'given'],['g is a similarity with the factor '+fshow(G),'given'],['g ∘ f is a similarity with the factor '+fshow(ok?M:S),'similarities-form-a-group']], ask:'Is line 3 licensed?', right:opts[ok?0:1], opts, lead:'', why:'Factors multiply: '+fshow(G)+' · '+fshow(F)+' = '+fshow(M)+'.'+(ok?'':' Adding them gives '+fshow(S)+', which is not the factor.')}; }
    const ok=Math.random()<0.5;
    return {index:'q:20b.line[u;'+[n,d,ok?1:0].join(';')+']', stack:true, lines:[['f is a similarity with the factor '+fshow(F),'given'],['f⁻¹ is a similarity with the factor '+fshow(ok?fr(d,n):F),'similarities-form-a-group']], ask:'Is line 2 licensed?', right:opts[ok?0:1], opts, lead:'', why:'f⁻¹ after f does nothing, with the factor 1. So the factor of f⁻¹ is 1/k = '+fshow(fr(d,n))+(ok?'.':', not '+fshow(F)+'.')}; }});

/* ---------- 20c Slide, Flip, Turn ---------- */
const C20=[
  ['Where does the turn by (a, b) send (1, 0) and (0, 1)?','to (a, b) and (−b, a)',['to (a, b) and (b, a)','to (a, b) and (b, −a)','to (a, −b) and (b, a)'],'(−b, a) is the point a quarter turn on from (a, b).'],
  ['(x, y) ↦ (y, x): is it a quarter turn?','no: it is the flip across the line y = x',['yes','no: it is a half turn','no: it is a slide'],'It leaves every point (t, t) in place. The quarter turn is (x, y) ↦ (−y, x).'],
  ['How do you turn about a point C that is not the origin?','slide C to the origin, turn, and slide back',['turn about the origin, then slide by C','slide by C, then turn about the origin','it cannot be done'],'P ↦ C + R(P − C).'],
  ['A slide sends P to Q. Which slide is it?','the slide by Q − P',['the slide by P − Q','the slide by P + Q','one point does not fix it'],'A slide adds the same displacement to every point, and P + (Q − P) = Q.'],
  ['Which points does the flip across a line ℓ leave in place?','exactly the points of ℓ',['none','only the origin','every point'],'Each other point P goes to the point P′ for which ℓ is the line of points equally far from P and P′.']];
QP.push({id:'20c.three',step:'20c',label:'the three kinds of move',open:()=>measured('20c'),make(){ return writtenQ('20c.three',C20); }},
  {id:'20c.where',step:'20c',mode:'work',label:'where a point goes',open:()=>measured('20c'),make(){
    const k=rnd(4), x=nz20(6), y=nz20(6), h=nz20(5), j=nz20(5);
    if(k===0){ const right=pt18(x+h,y+j), wrong=uniq(right,[pt18(x-h,y-j),pt18(x+j,y+h),pt18(h,j),pt18(x*h,y*j),pt18(x+h,y-j),pt18(h-x,j-y)],3); if(wrong.length<3) return null;
      return {index:'q:20c.where[s;'+[x,y,h,j].join(';')+']', lines:[['P = '+pt18(x,y),'a point'],['the slide by '+pt18(h,j),'a move']], ask:'Where does it send P?', right, opts:shuffle([right,...wrong]), lead:'', why:'A slide adds its displacement: '+pt18(x,y)+' + '+pt18(h,j)+' = '+right+'.'}; }
    if(k===1){ const fracs=Math.random()<0.5, [a,b,c]=fracs?upair20():pick([[0,1,1],[-1,0,1],[0,-1,1]]), xs=fracs?nz20(3):x, ys=fracs?nz20(3):y, X=c*xs, Y=c*ys, right=pt18(a*xs-b*ys,b*xs+a*ys), wrong=uniq(right,[pt18(a*xs+b*ys,-b*xs+a*ys),pt18(a*xs+b*ys,b*xs-a*ys),pt18(Y,X),pt18(a*xs,b*ys),pt18(-X,-Y),pt18(b*xs-a*ys,a*xs+b*ys),pt18(X,-Y)],3); if(wrong.length<3) return null;
      return {index:'q:20c.where[t;'+[X,Y,a,b,c].join(';')+']', lines:[['P = '+pt18(X,Y),'a point'],['the turn about the origin by '+pr20(a,b,c),'a move']], ask:'Where does it send P?', right, opts:shuffle([right,...wrong]), lead:'', why:'The turn by (a, b) sends (x, y) to (ax − by, bx + ay). Here that is '+right+'.'}; }
    if(k===2){ const dd=nz20(4), F=pick(ISO20.slice(3).concat([['the flip across the line y = '+sg(dd),(u,v)=>[u,2*dd-v]],['the flip across the line x = '+sg(dd),(u,v)=>[2*dd-u,v]]])), q=F[1](x,y), right=P20(q), wrong=uniq(right,[pt18(x,-y),pt18(-x,y),pt18(y,x),pt18(-y,-x),pt18(-x,-y),pt18(x,dd-y),pt18(dd-x,y),pt18(x+dd,y)],3); if(wrong.length<3||(q[0]===x&&q[1]===y)) return null;
      return {index:'q:20c.where[f;'+[x,y,F[0]].join(';')+']', lines:[['P = '+pt18(x,y),'a point'],[F[0],'a move']], ask:'Where does it send P?', right, opts:shuffle([right,...wrong]), lead:'', why:'The line is the set of points equally far from P and '+right+': the midpoint of the two, '+fpt18(fr(x+q[0],2),fr(y+q[1],2))+', is on the line, and the displacement between them is at right angles to it.'}; }
    const cx=nz20(4), cy=nz20(4), half=Math.random()<0.4, u=x-cx, v=y-cy, q=half?[cx-u,cy-v]:[cx-v,cy+u], right=P20(q), wrong=uniq(right,[half?pt18(-x,-y):pt18(-y,x),half?pt18(cx-v,cy+u):pt18(cx-u,cy-v),pt18(cx+v,cy-u),half?pt18(-x+cx,-y+cy):pt18(-y+cx,x+cy),pt18(-u,-v),pt18(-v,u)],3); if(wrong.length<3||(u===0&&v===0)) return null;
    return {index:'q:20c.where[c;'+[x,y,cx,cy,half?1:0].join(';')+']', lines:[['P = '+pt18(x,y)+' and C = '+pt18(cx,cy),'two points'],['the turn about C by '+(half?'(−1, 0)':'(0, 1)'),'a move']], ask:'Where does it send P?', right, opts:shuffle([right,...wrong]), lead:'', why:'Slide C to the origin, turn, and slide back: P − C = '+pt18(u,v)+', turned it is '+(half?pt18(-u,-v):pt18(-v,u))+', and adding C gives '+right+'.'}; }},
  {id:'20c.twice',step:'20c',mode:'word',label:'one slide for two',open:()=>measured('20c'),make(){
    const who=pick(['A stencil on a sheet','A tile on a floor','A stamp on a page','A window on a screen']), h=nz20(8), j=nz20(8), h2=nz20(8), j2=nz20(8), back=Math.random()<0.35, f=(a,b)=>'the slide by '+pt18(a,b), right=back?f(-h-h2,-j-j2):f(h+h2,j+j2),
      wrong=uniq(right,[back?f(h+h2,j+j2):f(-h-h2,-j-j2),f(h-h2,j-j2),f(h*h2,j*j2),f(h+j2,j+h2),f(h+h2,j-j2),f(-h-h2,j+j2)],3); if(wrong.length<3||(h+h2===0&&j+j2===0)) return null;
    return {index:'q:20c.twice['+[who,h,j,h2,j2,back?1:0].join(';')+']', a3:['20c.twice',DASH,DASH], story:who+' is slid by '+pt18(h,j)+', and then by '+pt18(h2,j2)+', the lengths in centimetres.', lines:[], ask:back?'Which one slide puts it back where it began?':'Which one slide does the same as the two together?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Slides add their displacements: '+pt18(h,j)+' + '+pt18(h2,j2)+' = '+pt18(h+h2,j+j2)+'.'+(back?' The slide by the opposite displacement undoes it.':'')}; }});

/* ---------- 20d All Three Keep Distances ---------- */
const D20Q=[
  ['When are two sets of points S and T congruent?','when some isometry f has f(S) = T',['when they have equal areas','when some similarity f has f(S) = T','when they have equally many points'],'The definition. Congruent figures agree in every length.'],
  ['Two rectangles have equal areas. Are they congruent?','not always: take a 1 by 4 and a 2 by 2',['yes','yes, if their sides are whole numbers','no: never'],'Equal areas, different sides, and an isometry keeps every length.'],
  ['Two four-sided figures have their sides equal in pairs. Are they congruent?','not always: take a square and a pushed-over rhombus with sides 1',['yes','yes, by the count of the sides','no: never'],'Their diagonals differ, and an isometry keeps every distance.'],
  ['Why does a slide keep every distance?','it keeps every displacement Q − P',['it keeps the origin in place','it keeps every point in place','it undoes itself'],'S(Q) − S(P) = (Q + (h, k)) − (P + (h, k)) = Q − P.'],
  ['S ≅ T and T ≅ U. Why is S ≅ U?','an isometry after an isometry is an isometry',['every two figures are congruent','T is the same set as S','an isometry undoes itself'],'If f(S) = T and g(T) = U then g(f(S)) = U, and g ∘ f keeps every distance.']];
QP.push({id:'20d.cong',step:'20d',label:'congruent',open:()=>measured('20d'),make(){ return writtenQ('20d.cong',D20Q); }},
  {id:'20d.keeps',step:'20d',mode:'work',label:'what a move does to a length',open:()=>measured('20d'),make(){
    if(Math.random()<0.7){ const [a,b,c]=pick(TRI18), x=nz20(5), y=nz20(5), dx=sn18()*a, dy=sn18()*b, st=Math.random()<0.25, m=2+rnd(3), h=nz20(6), j=nz20(6), M=st?['the stretch from the origin by '+m]:Math.random()<0.25?['the slide by '+pt18(h,j)]:pick(ISO20), v=st?m*c:c, right=String(v), wrong=uniq(right,[a+b,st?c:2*c,c+1,c*c,v+2,Math.abs(a-b),st?m+c:c-1].map(String),3); if(wrong.length<3) return null;
      return {index:'q:20d.keeps[d;'+[x,y,dx,dy,M[0]].join(';')+']', lines:[['P = '+pt18(x,y)+' and Q = '+pt18(x+dx,y+dy),'two points'],['f is '+M[0],'a move']], ask:'What is d(f(P), f(Q))?', right, opts:shuffle([right,...wrong]), lead:'', why:'d(P, Q) = √('+(a*a)+' + '+(b*b)+') = '+c+'. '+(st?'A stretch by '+m+' is a similarity with the factor '+m+': '+m+' · '+c+' = '+v+'.':'Slides, turns and flips keep every distance, so there is nothing more to work out.')}; }
    const a=3+rnd(6), b=a+rnd(4), c=b+1+rnd(a-2), per=a+b+c, right=String(per), wrong=uniq(right,[2*per,per+1,c,a+b,per-1,a*b].map(String),3);
    return {index:'q:20d.keeps[p;'+[a,b,c].join(';')+']', lines:[['S is a triangle with the sides '+a+', '+b+' and '+c,'given'],['S ≅ T','given']], ask:'How long is it round T?', right, opts:shuffle([right,...wrong]), lead:'', why:'Some isometry sends S onto T, and it sends each side onto a side of the same length: '+a+' + '+b+' + '+c+' = '+per+'.'}; }},
  {id:'20d.line',step:'20d',mode:'proof',label:'is it congruent',open:()=>measured('20d'),make(){
    const [S,T,U]=take(['S','T','U','V','W'],3), k=rnd(8), opts=['it is licensed','it is not licensed'], kf=pick([1,1,2,3]);
    const K=[[[S+' ≅ '+T,T+' ≅ '+U],S+' ≅ '+U,1,'If f('+S+') = '+T+' and g('+T+') = '+U+', then g ∘ f is an isometry that sends '+S+' onto '+U+'.'],
      [[S+' ≅ '+T,U+' ≅ '+T],S+' ≅ '+U,1,'Congruence runs both ways and passes along: '+T+' ≅ '+U+' by the undo, and then '+S+' ≅ '+U+' by composing.'],
      [['f('+S+') = '+T+', for an isometry f'],T+' ≅ '+S,1,'f⁻¹ is an isometry, by undo-keeps, and it sends '+T+' onto '+S+'.'],
      [[S+' and '+T+' are rectangles with equal areas'],S+' ≅ '+T,0,'A 1 by 4 and a 2 by 2 rectangle have equal areas and different sides. Congruent figures agree in every length.'],
      [['f('+S+') = '+T+', for a similarity f with the factor '+kf],S+' ≅ '+T,kf===1?1:0,kf===1?'A similarity with the factor 1 is an isometry.':'f multiplies every length by '+kf+'. A circle and a circle of '+kf+' times the radius are similar and not congruent.'],
      [[S+' ≅ '+T,T+' and '+U+' are triangles of equal length round'],S+' ≅ '+U,0,'Triangles with the sides 3, 4, 5 and 4, 4, 4 are equally long round and not congruent.'],
      [[S+' ≅ '+T],T+' ≅ '+S,1,'If f('+S+') = '+T+' then f⁻¹('+T+') = '+S+', and f⁻¹ is an isometry.'],
      [[S+' is similar to '+T,T+' ≅ '+U],S+' ≅ '+U,0,'The 3, 4, 5 and the 6, 8, 10 triangles are similar and not congruent.']][k], n=K[0].length+1;
    return {index:'q:20d.line['+[k,S,T,U,kf].join(';')+']', stack:true, lines:K[0].map(t=>[t,'given']).concat([[K[1],'congruent-is-sorting']]), ask:'Is line '+n+' licensed?', right:opts[K[2]?0:1], opts, lead:'', why:K[3]}; }});

/* ---------- 20e Two Flips ---------- */
const E20=[
  ['Two flips across lines that cross: what do they make?','a turn about the crossing point',['a flip','a slide','nothing: they cancel'],'Crossing-flips. Each flip leaves the crossing point in place, so the two together do.'],
  ['Two flips across parallel lines a gap d apart: what do they make?','a slide by 2d, at right angles to the lines',['a slide by d, at right angles to the lines','a slide by 2d, along the lines','a turn'],'Parallel-flips: (x, y) ↦ (x, −y) ↦ (x, 2d + y), for the floor and then the line y = d.'],
  ['Is a flip after a flip the same in either order?','not in general: the two orders give a turn and its undo',['yes, always','yes, whenever the lines cross','no: never'],'For lines at right angles both orders give the half turn, which undoes itself. For most pairs of lines they differ.'],
  ['Can two flips make a flip?','no: they make a turn or a slide',['yes, across the line midway','yes, when the lines are parallel','yes, when the lines cross'],'Lines that cross give a turn, and parallel lines give a slide. It takes a third flip to flip again.'],
  ['How is a slide by v made of two flips?','across two lines at right angles to v, half of |v| apart',['across two lines along v, |v| apart','across two lines at right angles to v, |v| apart','it cannot be made'],'Parallel flips slide by twice the gap.']];
QP.push({id:'20e.pair',step:'20e',label:'what two flips make',open:()=>measured('20e'),make(){ return writtenQ('20e.pair',E20); }},
  {id:'20e.two',step:'20e',mode:'work',label:'two flips, worked',open:()=>measured('20e'),make(){
    const k=rnd(4), d1=rnd(9)-4, d2=pick(id19(9).map(v=>v-5).filter(v=>v!==d1)), g=2*(d2-d1), up=Math.random()<0.5, L=v=>(up?'y':'x')+' = '+sg(v), sl=v=>'the slide by '+(up?pt18(0,v):pt18(v,0));
    if(k===0){ const right=sl(g), wrong=uniq(right,[sl(g/2),sl(-g),'the slide by '+(up?pt18(g,0):pt18(0,g)),sl(2*(d1+d2)),sl(d1+d2),'the turn about the origin by (−1, 0)'],3); if(wrong.length<3) return null;
      return {index:'q:20e.two[p;'+[up?'y':'x',d1,d2].join(';')+']', lines:[['the flip across the line '+L(d1),'done first'],['the flip across the line '+L(d2),'done second']], ask:'Which move are the two together?', right, opts:shuffle([right,...wrong]), lead:'', why:'Parallel-flips: a slide at right angles to the lines by twice the gap, from the first line towards the second. 2 · ('+sg(d2)+' − '+par10(d1)+') = '+sg(g)+'.'}; }
    if(k===1){ const x=nz20(6), y=nz20(6), q=up?[x,y+g]:[x+g,y], right=P20(q), wrong=uniq(right,[up?pt18(x,y-g):pt18(x-g,y),up?pt18(x,y+g/2):pt18(x+g/2,y),up?pt18(x+g,y):pt18(x,y+g),up?pt18(x,2*d2-y):pt18(2*d2-x,y),up?pt18(x,-y):pt18(-x,y)],3); if(wrong.length<3) return null;
      return {index:'q:20e.two[w;'+[up?'y':'x',d1,d2,x,y].join(';')+']', lines:[['P = '+pt18(x,y),'a point'],['the flip across '+L(d1)+', and then the flip across '+L(d2),'two moves']], ask:'Where does P end?', right, opts:shuffle([right,...wrong]), lead:'', why:'The first flip sends P to '+(up?pt18(x,2*d1-y):pt18(2*d1-x,y))+', and the second sends that to '+right+'. Together they slide by twice the gap, '+sg(g)+'.'}; }
    if(k===2){ const gap=1+rnd(12), rev=Math.random()<0.5, right=rev?fshow(fr(gap,2)):String(2*gap), wrong=frs16(right,rev?[fint(gap),fint(2*gap),fr(gap,4),fint(gap+1)]:[fint(gap),fr(gap,2),fint(4*gap),fint(gap*gap===2*gap?gap+3:gap*gap)]); if(wrong.length<3) return null;
      return {index:'q:20e.two[g;'+gap+';'+(rev?1:0)+']', lines:[rev?['a slide by a displacement of the length '+gap,'to be made of two flips']:['two parallel lines, '+gap+' apart','given']], ask:rev?'How far apart must the two lines be?':'How far does a flip across one and then the other slide each point?', right, opts:shuffle([right,...wrong]), lead:'', why:rev?'Two-flips: the lines are at right angles to the displacement, half its length apart: '+(gap%2?'':gap+'/2 = ')+right+'.':'Parallel-flips: twice the gap, 2 · '+gap+' = '+right+'.'}; }
    const [c,s0,r]=pick(U20.slice(0,4)), s=sn18()*s0, p=c*c-s*s, q=2*c*s, R=r*r, f=(a,b)=>'the turn about the origin by '+pr20(a,b,R), right=f(p,q), wrong=uniq(right,['the turn about the origin by '+pr20(c,s,r),f(p,-q),f(q,p),'the flip across the line along '+pr20(c,s,r),f(-p,q)],3);
    return {index:'q:20e.two[c;'+[c,s,r].join(';')+']', lines:[['the flip across the floor y = 0','done first'],['the flip across the line through the origin along u = '+pr20(c,s,r),'done second']], ask:'Which move are the two together?', right, opts:shuffle([right,...wrong]), lead:'', why:'Crossing-flips: for u = (c, s) it is the turn by (c² − s², 2cs) = (('+(c*c)+' − '+(s*s)+')/'+R+', 2 · '+c+' · '+par10(s)+'/'+R+') = '+pr20(p,q,R)+'.'}; }},
  {id:'20e.fold',step:'20e',mode:'word',label:'flipped twice',open:()=>measured('20e'),make(){
    const who=pick(['A stencil','A paper cut-out','A stamp','A tracing']), gap=2+rnd(18), rev=Math.random()<0.4, right=(rev?fshow(fr(gap,2)):String(2*gap))+' centimetres', wrong=uniq(right,(rev?[fint(gap),fint(2*gap),fr(gap,4),fint(gap+1)]:[fint(gap),fr(gap,2),fint(4*gap),fint(gap+2)]).map(v=>fshow(v)+' centimetres'),3); if(wrong.length<3) return null;
    return {index:'q:20e.fold['+[who,gap,rev?1:0].join(';')+']', a3:['20e.fold',DASH,DASH], story:rev?who+' is flipped across a line on the sheet, and then across a second line parallel to the first. It ends '+gap+' centimetres from where it began, the same way up.':who+' is flipped across a line on the sheet, and then across a second line parallel to the first, '+gap+' centimetres from it.', lines:[], ask:rev?'How far apart are the two lines?':'How far from where it began does each point of it end?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Parallel-flips: two flips across parallel lines make a slide by twice the gap. '+(rev?'So the gap is half of '+gap+'.':'2 · '+gap+' = '+(2*gap)+'.')}; }});

/* ---------- 20f Every Isometry Is at Most Three Flips ---------- */
const F20=[
  ['Do two anchors fix a point by its distances to them?','no: a point and its flip across the line AB have the same two distances',['yes','yes, if A and B are different points','no: not even three anchors do'],'It takes three anchors that are not on one line.'],
  ['Is every isometry exactly three flips?','no: at most three',['yes','no: some need four','no: every isometry is two flips'],'A flip is one flip, and a turn or a slide is two.'],
  ['Two triangles share two sides and an angle not between them. Are they congruent?','not always',['yes','yes, by three-sides-congruent','no: never'],'Two triangles can share two sides and an angle not between them and differ in the third side.'],
  ['Two isometries agree at three points not on one line. What follows?','they are the same move',['they agree on that triangle only','nothing more','each undoes the other'],'Three-points-decide: every point is fixed by its distances to the three, and both isometries keep those distances.'],
  ['Why must the three anchors not lie on one line?','a point and its flip across that line have the same three distances',['a line has no distances','two of them would then be the same point','no reason: any three points will do'],'The flip across the line keeps all three anchors in place.']];
QP.push({id:'20f.anchor',step:'20f',label:'three anchors',open:()=>measured('20f'),make(){ return writtenQ('20f.anchor',F20); }},
  {id:'20f.flips',step:'20f',mode:'work',label:'how many flips',open:()=>measured('20f'),make(){
    const k=rnd(6), h=nz20(7), j=nz20(7), d=nz20(6), opts=['1','2','3','4'], [a,b,c]=upair20(), cx=nz20(5), cy=nz20(5);
    const K=[['the slide by '+pt18(h,j),1,'Two-flips: across two lines at right angles to '+pt18(h,j)+', half its length apart. One flip cannot do it, since a flip leaves the points of its line in place and a slide leaves none.'],
      [Math.random()<0.5?'the turn about the origin by '+pr20(a,b,c):'the turn about '+pt18(cx,cy)+' by (0, 1)',1,'Two-flips: across two lines through the centre. One flip cannot do it, since a flip leaves a whole line of points in place and this turn leaves one point.'],
      ['the flip across the line '+pick(['y = '+sg(d),'x = '+sg(d),'y = x'+pm(d)]),0,'It is a flip already.'],
      ['the flip across the floor y = 0, followed by the slide by '+pt18(h,0),2,'It leaves no point in place, so it is not a flip and not a turn. It sends the displacement (0, 1) to (0, −1), so it is not a slide. So two flips cannot make it, and by three-flips three can.'],
      ['the flip across the floor y = 0, followed by the slide by '+pt18(0,2*d),0,'(x, y) ↦ (x, −y) ↦ (x, '+sg(2*d)+' − y). That is the flip across the line y = '+sg(d)+'.'],
      ['the flip across the floor y = 0, followed by the flip across the line y = '+sg(d),1,'Parallel-flips: together they are the slide by '+pt18(0,2*d)+'. A slide leaves no point in place, so one flip cannot do it.']][k];
    return {index:'q:20f.flips['+k+';'+K[0]+']', lines:[[K[0],'an isometry']], ask:'What is the least number of flips that makes it?', right:opts[K[1]], opts, lead:'', why:K[2]}; }},
  {id:'20f.twin',step:'20f',mode:'work',label:'the other point with the same distances',open:()=>measured('20f'),make(){
    const k=rnd(4), d=nz20(4), t=nz20(5), u=pick(id19(5).concat(id19(5).map(v=>-v)).filter(v=>v!==t)), x=nz20(6), y=nz20(6);
    const [A,B,q,nm]=k===0?[[t,0],[u,0],[x,-y],'y = 0']:k===1?[[0,t],[0,u],[-x,y],'x = 0']:k===2?[[t,t],[u,u],[y,x],'y = x']:[[t,d],[u,d],[x,2*d-y],'y = '+sg(d)]; if(q[0]===x&&q[1]===y) return null;
    const right=P20(q), wrong=uniq(right,[pt18(x,-y),pt18(-x,y),pt18(y,x),pt18(-x,-y),pt18(-y,-x),pt18(x,d-y),pt18(x+t,y+u)],3); if(wrong.length<3) return null;
    return {index:'q:20f.twin['+[k,t,u,d,x,y].join(';')+']', lines:[['A = '+P20(A)+' and B = '+P20(B),'two anchors'],['X = '+pt18(x,y),'a point']], ask:'Which other point has the same distances to A and to B as X has?', right, opts:shuffle([right,...wrong]), lead:'', why:'A and B lie on the line '+nm+'. The flip across that line keeps A and B in place and keeps every distance, so it sends X to a point with the same two distances: '+right+'. A third anchor off the line would tell the two apart.'}; }},
  {id:'20f.sides',step:'20f',mode:'work',label:'three sides',open:()=>measured('20f'),make(){
    const a=3+rnd(6), b=a+1+rnd(3), c=b+1+rnd(a-2), f=l=>l.join(', '), right=f(pick([[b,c,a],[c,a,b],[c,b,a],[b,a,c]])), wrong=uniq(right,[f([2*a,2*b,2*c]),f([a,b,c+1]),f([a+1,b+1,c+1]),f([b,c,a+1]),f([c,a-1,b]),f([a,a,b])],3);
    return {index:'q:20f.sides['+[right].concat(wrong).join(';')+']', lines:[['a triangle with the sides '+f([a,b,c]),'given']], ask:'Which of these triangles, given by their sides, is congruent to it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Three-sides-congruent: the sides '+right+' are the same three lengths in another order, so some isometry sends one triangle onto the other. Each of the others has a side of some other length, and congruent figures agree in every length.'}; }},
  {id:'20f.same',step:'20f',mode:'proof',label:'do three points decide',open:()=>measured('20f'),make(){
    const A=[rnd(9)-4,rnd(9)-4], ok=Math.random()<0.5, v=pick([[1,1],[1,2],[2,1],[1,-1],[1,0],[0,1],[2,-1],[1,3],[3,1],[1,-2]]), m=pick([2,3,-1,-2]), B=[A[0]+v[0],A[1]+v[1]], C=ok?[A[0]+rnd(7)-3,A[1]+rnd(7)-3]:[A[0]+m*v[0],A[1]+m*v[1]], D=D20(A,B,C), opts=['it is licensed','it is not licensed']; if(ok===(D===0)) return null;
    return {index:'q:20f.same['+[A,B,C].map(P20).join(';')+']', stack:true, lines:[['f and g are isometries','given'],['f and g agree at '+P20(A)+', '+P20(B)+' and '+P20(C),'given'],['f = g','three-points-decide']], ask:'Is line 3 licensed?', right:opts[ok?0:1], opts, lead:'',
      why:'From the first point, the displacements to the other two are '+pt18(B[0]-A[0],B[1]-A[1])+' and '+pt18(C[0]-A[0],C[1]-A[1])+'. '+(ok?'Neither is a multiple of the other, so the three points are not on one line, and they decide the move.':'The second is '+sg(m)+' times the first, so the three points lie on one line. Doing nothing and the flip across that line agree at all three and are different moves.')}; }});

/* ---------- 20g Handedness ---------- */
const G20=[
  ['Is a flip across a line a half turn?','no: a half turn keeps D, and a flip changes its sign',['yes','yes, when the line passes through the origin','no: a flip is a quarter turn'],'A half turn is two flips. A flip is one.'],
  ['What does a stretch by k do to D?','it multiplies D by k²',['it keeps D','it multiplies D by k','it changes the sign of D'],'Each of the two displacements in D is multiplied by k.'],
  ['Does an even number of flips do nothing?','not always: two flips make a turn or a slide',['yes','yes, when the lines cross','no: it makes a flip'],'An even number of flips keeps D. Keeping D is less than doing nothing.'],
  ['What does the sign of D(A, B, C) tell?','which way round the corners A, B, C go',['whether the triangle has a right angle','which corner is nearest the origin','whether the area is a whole number'],'Positive is anticlockwise, negative is clockwise, and zero means that A, B, C lie on one line.'],
  ['Can a string of 4 flips be the same move as a string of 3 flips?','no: the first keeps D and the second changes its sign',['yes','yes, when lines repeat','only when the lines are parallel'],'Flip-parity: no string of an even number of flips equals a string of an odd number.']];
QP.push({id:'20g.round',step:'20g',label:'which way round',open:()=>measured('20g'),make(){ return writtenQ('20g.round',G20); }},
  {id:'20g.D',step:'20g',mode:'work',label:'D, worked',open:()=>measured('20g'),make(){
    const k=rnd(5), A=[rnd(7)-3,rnd(7)-3], B=[A[0]+nz20(4),A[1]+rnd(7)-3], C=k===3&&Math.random()<0.25?[A[0]+2*(B[0]-A[0]),A[1]+2*(B[1]-A[1])]:[A[0]+rnd(9)-4,A[1]+nz20(4)], D=D20(A,B,C), u=[B[0]-A[0],B[1]-A[1]], v=[C[0]-A[0],C[1]-A[1]], top=[['A = '+P20(A)+', B = '+P20(B)+', C = '+P20(C),'three points']], calc='B − A = '+P20(u)+' and C − A = '+P20(v)+', so D = '+par10(u[0])+' · '+par10(v[1])+' − '+par10(u[1])+' · '+par10(v[0])+' = '+sg(D);
    if(k===0){ const right=sg(D), wrong=num13(right,[-D,u[0]*v[1]+u[1]*v[0],u[0]*v[0]-u[1]*v[1],u[0]*v[0]+u[1]*v[1],D+1,D-2]); if(wrong.length<3) return null;
      return {index:'q:20g.D[d;'+[A,B,C].map(P20).join(';')+']', lines:top, ask:'What is D(A, B, C)?', right, opts:shuffle([right,...wrong]), lead:'', why:calc+'.'}; }
    if(k===1){ if(D===0) return null; const right=fshow(fr(Math.abs(D),2)), wrong=frs16(right,[fint(Math.abs(D)),fint(2*Math.abs(D)),fr(Math.abs(D),4),fr(Math.abs(D)+1,2),fr(Math.abs(u[0]*v[1]+u[1]*v[0])+1,2)]); if(wrong.length<3) return null;
      return {index:'q:20g.D[a;'+[A,B,C].map(P20).join(';')+']', lines:top, ask:'What is the area of the triangle ABC?', right, opts:shuffle([right,...wrong]), lead:'', why:calc+'. Which-way-round: D is twice the area, with a sign. The area is |D|/2 = '+right+'.'}; }
    if(k===2){ if(D===0) return null; const m=1+rnd(7), right=sg(m%2?-D:D), wrong=num13(right,[m%2?D:-D,m*D,-m*D,0,D+m]);
      return {index:'q:20g.D[f;'+D+';'+m+']', lines:[['D(A, B, C) = '+sg(D),'given'],['f is a string of '+m+' flip'+(m===1?'':'s'),'given']], ask:'What is D(f(A), f(B), f(C))?', right, opts:shuffle([right,...wrong]), lead:'', why:'Flip-parity: each flip changes the sign of D once and keeps its size. '+m+' is '+(m%2?'odd, so the sign changes':'even, so D is kept')+'.'}; }
    if(k===3){ const opts=['anticlockwise','clockwise','neither: they lie on one line','it cannot be told from the points'];
      return {index:'q:20g.D[o;'+[A,B,C].map(P20).join(';')+']', lines:top, ask:'Which way round do A, B, C go?', right:opts[D>0?0:D<0?1:2], opts, lead:'', why:calc+'. Positive is anticlockwise, negative is clockwise, and zero means one line.'}; }
    if(D===0) return null; const m=2+rnd(3), right=sg(m*m*D), wrong=num13(right,[m*D,D,-m*m*D,2*m*D,m*m+D]); if(wrong.length<3) return null;
    return {index:'q:20g.D[s;'+D+';'+m+']', lines:[['D(A, B, C) = '+sg(D),'given'],['f is the stretch from the origin by '+m,'given']], ask:'What is D(f(A), f(B), f(C))?', right, opts:shuffle([right,...wrong]), lead:'', why:'Both displacements in D are multiplied by '+m+', so D is multiplied by '+m+'² = '+(m*m)+'. The sign, and so the way round, is kept.'}; }},
  {id:'20g.line',step:'20g',mode:'proof',label:'odd and even flips',open:()=>measured('20g'),make(){
    const D=nz20(20), m=1+rnd(9), ok=Math.random()<0.5, w=(m%2===0)===ok?D:-D, opts=['it is licensed','it is not licensed'];
    return {index:'q:20g.line['+[D,m,w].join(';')+']', stack:true, lines:[['D(A, B, C) = '+sg(D),'given'],['f is a string of '+m+' flip'+(m===1?'':'s'),'given'],['D(f(A), f(B), f(C)) = '+sg(w),'flip-parity']], ask:'Is line 3 licensed?', right:opts[ok?0:1], opts, lead:'',
      why:m+' is '+(m%2?'odd':'even')+', so the string '+(m%2?'changes the sign of D':'keeps D')+': D(f(A), f(B), f(C)) = '+sg(m%2?-D:D)+'.'}; }});

/* ---------- 20h Sorting Geometries by the Moves They Keep ---------- */
const H20=[
  ['Does a bigger group of moves keep more facts?','no, fewer: each extra move is one more test a fact must pass',['yes: more moves, more facts','the same facts','no: it keeps none'],'Fewer-facts: a fact of the bigger geometry is kept by every move of the smaller one too, and not the other way round.'],
  ['Are similar figures congruent?','not always: take the 3, 4, 5 and the 6, 8, 10 triangles',['yes','yes, when they are triangles','no: never'],'The geometry of the similarities sorts them together. The geometry of the isometries does not.'],
  ['What is a geometry, from here on?','a group of moves of the plane',['a set of figures','a list of axioms about points and lines','a way of measuring angles'],'And a fact of that geometry is a fact about figures that every move in the group keeps.'],
  ['Which of these does every stretch keep?','the ratio of any two lengths',['every length','D','every area'],'A stretch by k multiplies every length by k, so the k cancels in a ratio. It multiplies D and areas by k².'],
  ['In the geometry of the slides alone, is the direction of a side a fact?','yes: a slide keeps every displacement',['no: only lengths are facts','no: a fact must hold in every geometry','yes: every statement is a fact there'],'A turn changes directions, so in the geometry of the slides and turns it is no longer a fact.']];
const FAM20=['the slides','the slides and turns','the isometries','the similarities'], FACT20=[['the direction of each side',0,'A slide keeps every displacement. A turn changes directions.'],['which way round its corners go',1,'Slides and turns keep D. A flip changes its sign.'],['the sign of D for three of its corners',1,'Slides and turns keep D. A flip changes its sign.'],['the length of each side',2,'Every isometry keeps every distance. A stretch multiplies each length.'],['its area',2,'Every isometry keeps lengths, and D up to its sign. A stretch by k multiplies areas by k².'],['the distance between two of its corners',2,'Every isometry keeps every distance. A stretch does not.'],['each of its angles',3,'A similarity keeps shape: angles, and the ratio of any two lengths.'],['the ratio of two of its sides',3,'A similarity multiplies both sides by the same factor, which cancels in the ratio.'],['whether it is a circle',3,'A similarity sends circles onto circles: all circles are similar.']];
QP.push({id:'20h.facts',step:'20h',label:'more moves, fewer facts',open:()=>measured('20h'),make(){ return writtenQ('20h.facts',H20); }},
  {id:'20h.kept',step:'20h',mode:'work',label:'what each family keeps',open:()=>measured('20h'),make(){
    const k=rnd(3), [a,b,c]=pick(TRI18.concat([[4,5,6],[5,6,8],[4,6,7],[5,7,9],[6,7,10]])).slice().sort((x,y)=>x-y), [n,d]=pick(K20), F=fr(n,d);
    if(k===0){ const [fact,lv,why]=pick(FACT20), fam=pick(['a triangle','a figure with corners']);
      return {index:'q:20h.kept[f;'+fact+']', lines:[['a fact about '+(fact==='whether it is a circle'?'a figure':fam)+': '+fact,'given'],['four families of moves, each inside the next','the slides, the slides and turns, the isometries, the similarities']], ask:'Which is the biggest of the four families whose every move keeps it?', right:FAM20[lv], opts:FAM20.slice(), lead:'', why}; }
    if(k===1){ const right=fshow(fr(c,a)), wrong=frs16(right,[fmul(F,fr(c,a)),fmul(fr(d,n),fr(c,a)),fr(a,c),fr(c,b),fint(c-a),F]); if(wrong.length<3) return null;
      return {index:'q:20h.kept[r;'+[a,b,c,n,d].join(';')+']', lines:[['a triangle with the sides '+a+', '+b+' and '+c,'given'],['a similarity with the factor '+fshow(F)+' moves it','given']], ask:'What is the ratio of its longest side to its shortest, after the move?', right, opts:shuffle([right,...wrong]), lead:'', why:'Both sides are multiplied by '+fshow(F)+', and the factor cancels: the ratio is still '+c+'/'+a+(fshow(fr(c,a))===c+'/'+a?'':' = '+right)+'. Ratios of lengths are facts of the geometry of the similarities.'}; }
    const per=a+b+c, lg=Math.random()<0.5, right=fshow(fmul(F,fint(lg?c:per))), wrong=frs16(right,[fint(lg?c:per),fmul(fr(d,n),fint(lg?c:per)),fmul(F,fint(lg?per:c)),fadd(F,fint(lg?c:per)),fmul(fmul(F,F),fint(lg?c:per))]); if(wrong.length<3) return null;
    return {index:'q:20h.kept[l;'+[a,b,c,n,d,lg?1:0].join(';')+']', lines:[['a triangle with the sides '+a+', '+b+' and '+c,'given'],['a similarity with the factor '+fshow(F)+' moves it','given']], ask:lg?'How long is its longest side after the move?':'How long is it round, after the move?', right, opts:shuffle([right,...wrong]), lead:'', why:'A similarity multiplies every length by its factor: '+fshow(F)+' · '+(lg?c:per)+' = '+right+'. Lengths are facts of the geometry of the isometries, and not of the similarities.'}; }});

/* ---------- 20i Moving Graphs ---------- */
const I20=[
  ['The graph of y = f(x) is slid right by 3. Which equation has it now?','y = f(x − 3)',['y = f(x + 3)','y = f(x) + 3','y = f(x) − 3'],'The move goes into the equation undone: (x − 3, y) must be on the old graph.'],
  ['Flipped over the floor, y = f(x) becomes which?','y = −f(x)',['y = f(−x)','y = −f(−x)','x = f(y)'],'The floor flips y: (x, −y) must be on the old graph. y = f(−x) is the flip over the upright axis.'],
  ['Pulled upright by 2, y = f(x) becomes which?','y = 2f(x)',['y = f(x/2)','y = f(2x)','y = f(x) + 2'],'(x, y/2) must be on the old graph: y/2 = f(x). y = f(x/2) pulls sideways.'],
  ['Why does a move go into the equation undone?','P is on g(S) exactly when g⁻¹(P) is on S',['every move undoes itself','equations are read from right to left','it does not: it goes in as it is'],'Undo-in-the-equation. A flip does undo itself, so it goes in as it is.'],
  ['Pulled sideways by 2, y = f(x) becomes which?','y = f(x/2)',['y = f(2x)','y = 2f(x)','y = f(x − 2)'],'(x/2, y) must be on the old graph. y = f(2x) squeezes the graph to half its width.']];
const FN20=[['x²',a=>a==='x'?'x²':'('+a+')²'],['x³',a=>a==='x'?'x³':'('+a+')³'],['√x',a=>a==='x'?'√x':'√('+a+')'],['|x|',a=>'|'+a+'|'],['1/x',a=>a==='x'?'1/x':'1/('+a+')']];
QP.push({id:'20i.undo',step:'20i',label:'the equation moves the other way',open:()=>measured('20i'),make(){ return writtenQ('20i.undo',I20); }},
  {id:'20i.move',step:'20i',mode:'work',label:'a graph, moved',open:()=>measured('20i'),make(){
    const k=rnd(4), h=nz20(6), j=nz20(6);
    if(k===0||k===1){ const [nm,f]=pick(FN20), e=(a,b)=>'y = '+f('x'+pm(-a))+pm(b).replace(/^ /,' '), right=e(h,j);
      if(k===0){ const wrong=uniq(right,[e(-h,j),e(h,-j),e(-h,-j),e(j,h),e(-j,h)],3); if(wrong.length<3) return null;
        return {index:'q:20i.move[s;'+[nm,h,j].join(';')+']', lines:[['the graph of y = '+nm,'given'],['the slide by '+pt18(h,j),'a move']], ask:'Which equation has the moved graph?', right, opts:shuffle([right,...wrong]), lead:'', why:'Graph-slide: y = f(x − h) + k, with h = '+sg(h)+' and k = '+sg(j)+'. The slide goes in undone: in place of x stands x'+pm(-h)+'.'}; }
      const g=(a,b)=>pt18(a,b), r2=g(h,j), wrong=uniq(r2,[g(-h,j),g(h,-j),g(-h,-j),g(j,h),g(-j,-h)],3); if(wrong.length<3) return null;
      return {index:'q:20i.move[r;'+[nm,h,j].join(';')+']', lines:[['the graph of '+right,'given'],['it is the graph of y = '+nm+', slid','given']], ask:'By which displacement was it slid?', right:r2, opts:shuffle([r2,...wrong]), lead:'', why:'Graph-slide: y = f(x − h) + k is the graph slid by (h, k). '+(h>0?'In place of x stands x'+pm(-h):'x'+pm(-h)+' is x − '+par10(h))+', so h = '+sg(h)+', and k = '+sg(j)+'.'}; }
    if(k===2){ const m=nz20(5), fl=Math.random()<0.5, e=(neg,inn,c)=>'y = '+(neg?'−':'')+'√'+(inn?'(−x)':'x')+pm(c), right=fl?e(true,false,-m):e(false,true,m), wrong=uniq(right,[fl?e(false,true,m):e(true,false,-m),e(true,true,-m),e(true,false,m),e(false,true,-m),e(true,true,m)],3);
      return {index:'q:20i.move[f;'+m+';'+(fl?1:0)+']', lines:[['the graph of y = √x'+pm(m),'given'],[fl?'the flip over the floor':'the flip over the upright axis','a move']], ask:'Which equation has the moved graph?', right, opts:shuffle([right,...wrong]), lead:'', why:fl?'Graph-flip: over the floor, y = f(x) becomes y = −f(x). The whole right side changes sign: −(√x'+pm(m)+') = −√x'+pm(-m)+'.':'Graph-flip: over the upright axis, y = f(x) becomes y = f(−x). Only the x changes sign.'}; }
    const c=2+rnd(4), [nm,f]=pick(FN20.slice(0,3)), upr=Math.random()<0.5, right='y = '+(upr?c+nm:f('x/'+c)), wrong=uniq(right,['y = '+(upr?f('x/'+c):c+nm),'y = '+f(c+'x'),'y = '+nm+' + '+c,'y = '+f('x − '+c)],3);
    return {index:'q:20i.move[p;'+[nm,c,upr?1:0].join(';')+']', lines:[['the graph of y = '+nm,'given'],[upr?'the pull upright by '+c+': (x, y) ↦ (x, '+c+'y)':'the pull sideways by '+c+': (x, y) ↦ ('+c+'x, y)','a move']], ask:'Which equation has the moved graph?', right, opts:shuffle([right,...wrong]), lead:'', why:upr?'Graph-pull: (x, y/'+c+') must be on the old graph, so y/'+c+' = f(x), and y = '+c+'f(x).':'Graph-pull: ('+'x/'+c+', y) must be on the old graph, so y = f(x/'+c+'). The pull goes in undone.'}; }});

/* ---------- 20j Turns in Coordinates ---------- */
const J20=[
  ['By the pair product, which is (a, b) · (c, d)?','(ac − bd, ad + bc)',['(ac, bd)','(ac + bd, ad − bc)','(ad − bc, ac + bd)'],'Follow (1, 0): the first turn sends it to (c, d), and the second sends that to (ac − bd, bc + ad).'],
  ['Which turn undoes the turn by (a, b)?','the turn by (a, −b)',['the turn by (−a, −b)','the turn by (−a, b)','the turn by (b, a)'],'(a, b) · (a, −b) = (a² + b², 0) = (1, 0), the turn that does nothing. (−a, −b) is the half turn after it.'],
  ['Is every pair (a, b) a turn?','only when a² + b² = 1',['yes','only when a and b are whole numbers','only when a = b'],'Any other pair, apart from (0, 0), turns and stretches by √(a² + b²).'],
  ['(x, y) ↦ (3x − 4y, 4x + 3y): what does it do?','it turns, and stretches by 5',['it turns only','it stretches by 7','it stretches by 25'],'Turn-and-stretch with (a, b) = (3, 4): r = √(9 + 16) = 5, and the turn is by (3/5, 4/5).'],
  ['A turn about the origin sends (1, 0) to (a, b). Where does it send (0, 1)?','(−b, a)',['(b, a)','(b, −a)','(a, −b)'],'Turn-is-a-pair: (0, 1) is a quarter turn on from (1, 0), and (−b, a) is a quarter turn on from (a, b).']];
QP.push({id:'20j.pair',step:'20j',label:'a turn is a pair',open:()=>measured('20j'),make(){ return writtenQ('20j.pair',J20); }},
  {id:'20j.pairs',step:'20j',mode:'work',label:'pairs, worked',open:()=>measured('20j'),make(){
    const k=rnd(5), a=nz20(5), b=nz20(5), c=nz20(5), d=nz20(5);
    if(k===0||k===1){ const p=a*c-b*d, q=a*d+b*c, right=pt18(p,q), wrong=uniq(right,[pt18(a*c,b*d),pt18(a*c+b*d,a*d-b*c),pt18(q,p),pt18(a*c+b*d,a*d+b*c),pt18(a*c-b*d,a*d-b*c),pt18(a+c,b+d)],3); if(wrong.length<3) return null;
      return {index:'q:20j.pairs['+(k?'w':'m')+';'+[a,b,c,d].join(';')+']', lines:k===0?[['(a, b) = '+pt18(a,b)+' and (c, d) = '+pt18(c,d),'two pairs']]:[['(a, b) = '+pt18(a,b),'a pair, for the move (x, y) ↦ (ax − by, bx + ay)'],['P = '+pt18(c,d),'a point']], ask:k===0?'Which pair is (a, b) · (c, d)?':'Where does the move send P?', right, opts:shuffle([right,...wrong]), lead:'', why:(k===0?'Pair-product: (ac − bd, ad + bc)':'(ax − by, bx + ay)')+' = ('+par10(a)+' · '+par10(c)+' − '+par10(b)+' · '+par10(d)+', '+(k===0?par10(a)+' · '+par10(d)+' + '+par10(b)+' · '+par10(c):par10(b)+' · '+par10(c)+' + '+par10(a)+' · '+par10(d))+') = '+right+'.'}; }
    if(k===2){ const [x,y,r]=pick(TRI18), s1=sn18(), s2=sn18(), right=String(r), wrong=uniq(right,[x+y,r*r,Math.abs(x-y),r+1,x*y,Math.max(x,y)].map(String),3);
      return {index:'q:20j.pairs[r;'+[s1*x,s2*y].join(';')+']', lines:[['(a, b) = '+pt18(s1*x,s2*y),'a pair, for the move (x, y) ↦ (ax − by, bx + ay)']], ask:'By how much does the move stretch?', right, opts:shuffle([right,...wrong]), lead:'', why:'Turn-and-stretch: r = √(a² + b²) = √('+(x*x)+' + '+(y*y)+') = '+r+'. The turn is by '+pr20(s1*x,s2*y,r)+'.'}; }
    if(k===3){ const [x,y,r]=upair20(), f=(u,v)=>'the turn by '+pr20(u,v,r), right=f(x,-y), wrong=uniq(right,[f(-x,-y),f(-x,y),f(y,x),f(x,y),f(-y,x)],3);
      return {index:'q:20j.pairs[u;'+[x,y,r].join(';')+']', lines:[['the turn about the origin by '+pr20(x,y,r),'given']], ask:'Which turn undoes it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Pair-undo: the turn by (a, −b) undoes the turn by (a, b), since (a, b) · (a, −b) = (a² + b², 0) = (1, 0).'}; }
    const [x,y,r]=pick(TRI18), [x2,y2,r2]=pick(TRI18), right=String(r*r2), wrong=uniq(right,[r+r2,r*r2+1,x*x2+y*y2,r*r+r2*r2,(x+y)*(x2+y2),r*r2*2].map(String),3); if(wrong.length<3) return null;
    return {index:'q:20j.pairs[s;'+[x,y,x2,y2].join(';')+']', lines:[['the pairs '+pt18(x,y)+' and '+pt18(x2,y2),'each a turn and a stretch'],['their pair product','one move after the other']], ask:'By how much does the product stretch?', right, opts:shuffle([right,...wrong]), lead:'', why:'Turn-and-stretch: the stretches multiply. √('+(x*x)+' + '+(y*y)+') = '+r+' and √('+(x2*x2)+' + '+(y2*y2)+') = '+r2+', and '+r+' · '+r2+' = '+right+'.'}; }},
  {id:'20j.line',step:'20j',mode:'proof',label:'is the pair a turn',open:()=>measured('20j'),make(){
    const ok=Math.random()<0.5, [x,y,r]=ok?(Math.random()<0.2?pick([[0,1,1],[1,0,1],[0,-1,1],[-1,0,1]]):upair20()):pick([[1,1,2],[3,3,5],[1,1,1],[2,1,3],[3,4,6],[1,3,2],[4,3,6],[5,12,12],[2,2,3],[1,2,2],[5,5,7],[3,4,4]]).map((v,i)=>i<2?sn18()*v:v), A=fr(x,r), B=fr(y,r), S=fadd(fmul(A,A),fmul(B,B)), opts=['it is licensed','it is not licensed']; if(ok!==fsame(S,fint(1))) return null;
    return {index:'q:20j.line['+[x,y,r].join(';')+']', stack:true, lines:[['(a, b) = '+fpt18(A,B),'a pair'],['(x, y) ↦ (ax − by, bx + ay) is a turn about the origin','turn-is-a-pair']], ask:'Is line 2 licensed?', right:opts[ok?0:1], opts, lead:'',
      why:'a² + b² = '+fshow(fmul(A,A))+' + '+fshow(fmul(B,B))+' = '+fshow(S)+'. '+(ok?'A pair with a² + b² = 1 is a turn.':'That is not 1, so the move also multiplies every length by √('+fshow(S)+').')}; }});

/* ===== Laundry 5, rung 21 (floor 4 pools, stage T), part 1: 21a to 21i, the circle's functions ===== */
Object.assign(STEPS,{'21a':['r21a','An Angle Is an Arc; π'],'21b':['r21b','cos and sin as Coordinates'],'21c':['r21c','Sin² + cos² = 1'],'21d':['r21d','The Sum Formulas From Turns'],'21e':['r21e','Flips and the Complement'],'21f':['r21f','sin h / h → 1'],
  '21g':['r21g','The Slopes of sin and cos'],'21h':['r21h','The Two Triangles'],'21i':['r21i','Around the Circle'],'21j':['r21j','Radians'],'21k':['r21k','Identities'],'21l':['r21l','The Slope of Sine by Hand'],
  '21m':['r21m','Running Trig Backwards'],'21n':['r21n','Trig Integrals and Substitution; Circle Area'],'21o':['r21o','Adding up Slices'],'21p':['r21p','Related Rates'],'21q':['r21q','Angles Standing on Arcs'],'21r':['r21r','Curves by Turning and Reach']});
/* nπ/d as text; a fraction times π; exact values at the twelfths of a half turn */
const pi21=(n,d)=>{ const F=fr(n,d||1); return F.p===0?'0':(F.p===1?'':F.p===-1?'−':sg(F.p))+'π'+(F.q===1?'':'/'+F.q); }, fpi21=F=>pi21(F.p,F.q);
const SV21=[[0,'0'],[0.5,'1/2'],[Math.SQRT1_2,'√2/2'],[Math.sqrt(3)/2,'√3/2'],[1,'1'],[Math.sqrt(3)/3,'√3/3'],[Math.sqrt(3),'√3']], ex21=x=>{ const a=Math.abs(x), m=SV21.find(([v])=>Math.abs(v-a)<1e-9); return m?(x<-1e-9?'−':'')+m[1]:null; };
const ARC21=[0,2,3,4,6,8,9,10,12,14,15,16,18,20,21,22], cos21=k=>ex21(Math.cos(k*Math.PI/12)), sin21=k=>ex21(Math.sin(k*Math.PI/12)), ALL21=['0','1/2','−1/2','√2/2','−√2/2','√3/2','−√3/2','1','−1'];
const rt21=(k,r)=>(k===1?'':k===-1?'−':sg(k))+'√'+r, mul21=(c,v)=>v==='1/2'?String(c/2):v==='√3/2'?rt21(c/2,3):v==='√2/2'?rt21(c/2,2):v==='1'?String(c):'0';
const lc21=(a,s,b,t)=>(a===1?'':a===-1?'−':sg(a))+s+(b<0?' − ':' + ')+(Math.abs(b)===1?'':Math.abs(b))+t, T21=[[3,4,5],[4,3,5],[5,12,13],[12,5,13],[8,15,17],[15,8,17],[7,24,25],[24,7,25]], QN21=['first','second','third','fourth'], QS21=[[1,1],[-1,1],[-1,-1],[1,-1]];

/* ---------- 21a An Angle Is an Arc; π ---------- */
const A21=[
  ['For every circle, what is the length around divided by the length across?','π',['2π','π/2','it depends on the circle'],'Round-quotient: every circle is the circle of radius 1 pulled by its radius, and the pull multiplies both lengths alike.'],
  ['Is π = 22/7?','no: 22/7 is a guess, and a little too big',['yes','no: 22/7 is a little too small','yes, to as many places as you like'],'A guess with no fence. π is a real fixed by an integral, and 22/7 is not it.'],
  ['What is L(−1), the arc of the circle of radius 1 from (1, 0) to (−1, 0)?','π',['2π','π/2','1'],'L runs from L(−1) = π down to L(1) = 0. The half circle has the length π, and the whole circle 2π.'],
  ['For each θ between 0 and π, how many points of the upper half circle have the arc θ from (1, 0)?','exactly one',['at least one','two','none, unless θ is a fraction of π'],'Arc-picks-a-point: L is continuous and falls as x rises, so it takes each value between 0 and π exactly once.']];
QP.push({id:'21a.arc',step:'21a',label:'an angle is an arc',open:()=>measured('21a'),make(){ return writtenQ('21a.arc',A21); }},
  {id:'21a.round',step:'21a',mode:'work',label:'round and across',open:()=>measured('21a'),make(){
    const k=rnd(5), r=1+rnd(12), f=F=>fpi21(F);
    const [given,ask,R,W,why]=k===0?['a circle of radius '+r,'How long is it round?',f(fint(2*r)),[f(fint(r)),f(fint(r*r)),String(2*r),f(fint(4*r))],'Round-quotient: the length around is π times the length across, π · '+(2*r)+'.']
      :k===1?['a circle that is '+r+' across','How long is it round?',f(fint(r)),[f(fint(2*r)),f(fint(r*r)),f(fr(r,2)),String(r)],'Round-quotient: the length around is π times the length across.']
      :k===2?['a circle that is '+f(fint(r))+' round','What is its radius?',fshow(fr(r,2)),[String(r),String(2*r),fshow(fr(r,4)),f(fr(r,2))],'The length across is '+f(fint(r))+'/π = '+r+', and the radius is half of that.']
      :k===3?['a circle of radius '+r,'How long is half of it, from one end of a line across to the other?',f(fint(r)),[f(fint(2*r)),f(fr(r,2)),String(2*r),f(fint(r*r))],'The whole circle is 2π · '+r+' round, and half of that is '+f(fint(r))+'.']
      :['a circle of radius '+r,'How long is a quarter of it?',f(fr(r,2)),[f(fint(r)),f(fr(r,4)),f(fint(2*r)),fshow(fr(r,2))],'The whole circle is 2π · '+r+' = '+f(fint(2*r))+' round, and a quarter of that is '+f(fr(r,2))+'.'];
    const wrong=uniq(R,W,3); if(wrong.length<3) return null;
    return {index:'q:21a.round['+k+';'+r+']', lines:[[given,'given']], ask, right:R, opts:shuffle([R,...wrong]), lead:'', why}; }});

/* ---------- 21b cos and sin as Coordinates ---------- */
const B21=[
  ['What are cos θ and sin θ?','the coordinates of the point reached by walking θ round the circle of radius 1 from (1, 0)',['the two shorter sides of any triangle','the slope and the height of a line','the length and the width of an arc'],'(cos θ, sin θ) is that point: cos is how far across, and sin is how far up.'],
  ['Is sin θ = √(1 − cos² θ) for every θ?','only on the upper half: below the floor sin is negative',['yes','no: never','only when θ is a fraction of π'],'A root is never negative, and the lower half of the circle is below the floor.'],
  ['cos 2π = cos 0. Does 2π = 0 follow?','no: cos repeats, so equal values do not give equal arcs',['yes','yes, as arcs','no: cos 2π is not cos 0'],'Whole-turns: adding a whole turn changes neither coordinate.'],
  ['A triangle has a right angle, the longest side c and an angle θ. How long is the side facing θ?','c sin θ',['c cos θ','c tan θ','c / sin θ'],'Next-and-facing: the side next to θ is c cos θ, and the side facing θ is c sin θ.'],
  ['What is the opening of an angle of size θ?','cos θ',['sin θ','θ','tan θ'],'Opening-is-cosine: the opening e₁ · e₂ of 18f is the cosine of the arc.']];
QP.push({id:'21b.coord',step:'21b',label:'across and up',open:()=>measured('21b'),make(){ return writtenQ('21b.coord',B21); }},
  {id:'21b.exact',step:'21b',mode:'work',label:'arcs you can find exactly',open:()=>measured('21b'),make(){
    const k=pick(ARC21), t=pick([0,0,0,1,-1,2]), n=k+24*t, co=Math.random()<0.5, right=co?cos21(k):sin21(k), other=co?sin21(k):cos21(k), neg=right[0]==='−'?right.slice(1):'−'+right, wrong=uniq(right,[right==='0'?'1':neg,other,other[0]==='−'?other.slice(1):'−'+other].concat(shuffle(ALL21.slice())).filter(v=>v!=='−0'),3);
    return {index:'q:21b.exact['+n+';'+(co?'c':'s')+']', lines:[['θ = '+pi21(n,12),'an arc']], ask:'What is '+(co?'cos':'sin')+' θ?', right, opts:shuffle([right,...wrong]), lead:'', why:(t?'Whole-turns: take away '+(t===1?'one whole turn':t===2?'two whole turns':'−1 whole turns, that is, add one')+', which leaves '+pi21(k,12)+'. ':'')+'The point at '+pi21(k,12)+' is ('+cos21(k)+', '+sin21(k)+'), and '+(co?'cos is how far across':'sin is how far up')+'.'}; }},
  {id:'21b.sides',step:'21b',mode:'work',label:'next to and facing',open:()=>measured('21b'),make(){
    const c=2*(1+rnd(10)), k=pick([2,3,4]), next=Math.random()<0.5, v=next?cos21(k):sin21(k), right=mul21(c,v), wrong=uniq(right,[mul21(c,next?sin21(k):cos21(k)),mul21(c,'1/2'),rt21(c/2,3),rt21(c/2,2),String(c),rt21(c,3),String(2*c)],3);
    return {index:'q:21b.sides['+[c,k,next?'n':'f'].join(';')+']', lines:[['a triangle with a right angle, and the longest side '+c,'given'],['one of its angles is θ = '+pi21(k,12),'given']], ask:'How long is the side '+(next?'next to':'facing')+' θ?', right, opts:shuffle([right,...wrong]), lead:'', why:'Next-and-facing: the side '+(next?'next to θ is c cos θ':'facing θ is c sin θ')+' = '+c+' · '+v+' = '+right+'.'}; }},
  {id:'21b.lean',step:'21b',mode:'word',label:'leaning',open:()=>measured('21b'),make(){
    const who=pick(['A ladder','A plank','A pole','A beam']), c=2*(1+rnd(8)), k=pick([2,3,4]), up=Math.random()<0.5, v=up?sin21(k):cos21(k), mt=s=>s+(s==='1'?' metre':' metres'), right=mt(mul21(c,v)), wrong=uniq(right,[mul21(c,up?cos21(k):sin21(k)),mul21(c,'1/2'),rt21(c/2,3),rt21(c/2,2),String(c),rt21(c,3)].map(mt),3);
    return {index:'q:21b.lean['+[who,c,k,up?'u':'o'].join(';')+']', a3:['21b.lean',DASH,DASH], story:who+' '+c+' metres long leans against an upright wall. It makes the angle '+pi21(k,12)+' with the level ground.', lines:[], ask:up?'How high up the wall does it reach?':'How far from the wall is its foot?', right, opts:shuffle([right,...wrong]), lead:'', why:'The wall, the ground and the '+who.split(' ')[1]+' make a triangle with a right angle and the longest side '+c+'. '+(up?'The height faces the angle: '+c+' sin θ':'The ground is next to the angle: '+c+' cos θ')+' = '+c+' · '+v+' = '+mul21(c,v)+'.'}; }});

/* ---------- 21c Sin² + cos² = 1 ---------- */
const C21=[
  ['Is sin² θ the same as sin(θ²)?','no: sin² θ is (sin θ)²',['yes','no: it is sin(sin θ)','no: it is 2 sin θ'],'The little 2 squares the value of the sine, not the arc.'],
  ['Is cos θ = √(1 − sin² θ)?','only where cos θ ≥ 0: the sign comes from the quarter',['yes, always','no: never','only where sin θ ≥ 0'],'The circle technique gives cos² θ. Which root to take is told by the quarter the walk ends in.'],
  ['What is tan θ, for the point of the circle at θ?','the slope of the line from the centre to that point',['the length of the arc to that point','the height of that point','the slope of the circle at that point'],'Tangent-is-steepness: up over across, sin θ / cos θ.'],
  ['Wherever cos θ ≠ 0, what is 1 + tan² θ?','sec² θ',['csc² θ','cot² θ','1'],'Divide cos² θ + sin² θ = 1 through by cos² θ.'],
  ['In which quarter are cos θ < 0 and sin θ > 0?','the second',['the first','the third','the fourth'],'Left of the upright axis and above the floor.']];
QP.push({id:'21c.circle',step:'21c',label:'the circle technique',open:()=>measured('21c'),make(){ return writtenQ('21c.circle',C21); }},
  {id:'21c.other',step:'21c',mode:'work',label:'one coordinate from the other',open:()=>measured('21c'),make(){
    const [a,b,c]=pick(T21), q=rnd(4), [sx,sy]=QS21[q], C=fr(sx*a,c), S=fr(sy*b,c), gc=Math.random()<0.5, k=rnd(3), right=fshow(k===0?(gc?S:C):k===1?fr(sy*b,sx*a):gc?fr(c,sx*a):fr(c,sy*b)), nm=k===0?(gc?'sin θ':'cos θ'):k===1?'tan θ':gc?'sec θ':'csc θ';
    const wrong=frs16(right,k===0?[fneg(gc?S:C),gc?fr(c-a,c):fr(c-b,c),gc?fneg(fr(c-a,c)):fneg(fr(c-b,c)),fr(sy*b,sx*a),gc?C:S]:k===1?[fr(-sy*b,sx*a),fr(sx*a,sy*b),fr(-sx*a,sy*b),S,C]:[fneg(gc?fr(c,sx*a):fr(c,sy*b)),gc?C:S,gc?fr(c,sy*b):fr(c,sx*a),gc?fr(-c,sy*b):fr(-c,sx*a)]); if(wrong.length<3) return null;
    return {index:'q:21c.other['+[a,b,c,q,gc?'c':'s',k].join(';')+']', lines:[[(gc?'cos θ = '+fshow(C):'sin θ = '+fshow(S)),'given'],['θ ends in the '+QN21[q]+' quarter','given']], ask:'What is '+nm+'?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Circle technique: '+(gc?'sin² θ = 1 − '+fshow(fmul(C,C))+' = '+fshow(fmul(S,S)):'cos² θ = 1 − '+fshow(fmul(S,S))+' = '+fshow(fmul(C,C)))+'. Quarters: in the '+QN21[q]+' quarter cos is '+(sx>0?'positive':'negative')+' and sin is '+(sy>0?'positive':'negative')+', so cos θ = '+fshow(C)+' and sin θ = '+fshow(S)+'.'+(k===1?' tan θ = sin θ / cos θ.':k===2?(gc?' sec θ = 1 / cos θ.':' csc θ = 1 / sin θ.'):'')}; }},
  {id:'21c.line',step:'21c',mode:'proof',label:'which sign',open:()=>measured('21c'),make(){
    const [a,b,c]=pick(T21), q=rnd(4), [sx,sy]=QS21[q], C=fr(sx*a,c), S=fr(sy*b,c), gc=Math.random()<0.5, ok=Math.random()<0.5, T=gc?S:C, claim=ok?T:Math.random()<0.75?fneg(T):fr((gc?sy:sx)*(c-(gc?a:b)),c), opts=['it is licensed','it is not licensed'];
    return {index:'q:21c.line['+[a,b,c,q,gc?'c':'s',fshow(claim)].join(';')+']', stack:true, lines:[[(gc?'cos θ = '+fshow(C):'sin θ = '+fshow(S)),'given'],['θ ends in the '+QN21[q]+' quarter','given'],[(gc?'sin θ = ':'cos θ = ')+fshow(claim),'the circle technique, and quarters']], ask:'Is line 3 licensed?', right:opts[ok?0:1], opts, lead:'',
      why:'Circle technique: the square of the other coordinate is 1 − '+fshow(gc?fmul(C,C):fmul(S,S))+' = '+fshow(fmul(T,T))+', so its size is '+fshow(fr(gc?b:a,c))+'. In the '+QN21[q]+' quarter '+(gc?'sin':'cos')+' is '+((gc?sy:sx)>0?'positive':'negative')+': '+fshow(T)+'.'}; }});

/* ---------- 21d The Sum Formulas From Turns ---------- */
const D21=[
  ['Is cos(A + B) = cos A + cos B?','no: with A = B = π/3 the left side is −1/2 and the right side is 1',['yes','yes, for small arcs','no: it is cos A cos B + sin A sin B'],'Sum technique: cos(A + B) = cos A cos B − sin A sin B.'],
  ['Is sin 2A = 2 sin A?','no: sin 2A = 2 sin A cos A',['yes','no: sin 2A = sin² A','no: sin 2A = 2 cos A'],'With A = π/2: sin π = 0, and 2 sin(π/2) = 2.'],
  ['What does the turn by the pair (cos B, sin B) do to the point at the arc A?','it sends it to the point at the arc A + B',['it sends it to the point at the arc A − B','it sends it to the point at the arc AB','it leaves it in place'],'Turning-adds-arcs: the turn carries the arc from (1, 0) to the point at A onto an arc of the same length starting at the point at B.'],
  ['Which is cos 2A?','cos² A − sin² A',['2 cos A','cos² A + sin² A','2 sin A cos A'],'Put B = A in the sum technique. With the circle technique it is also 2cos² A − 1 and 1 − 2sin² A.'],
  ['Does a turn change the length of a path?','no: a slide, a turn or a flip carries every path to a path of the same length',['yes: it stretches it','only when the path is not straight','only when the turn is more than a quarter turn'],'Path-length-kept: length is the area under speed, and these moves keep the speed.']];
QP.push({id:'21d.turn',step:'21d',label:'turning adds arcs',open:()=>measured('21d'),make(){ return writtenQ('21d.turn',D21); }},
  {id:'21d.sum',step:'21d',mode:'work',label:'sums and doubles',open:()=>measured('21d'),make(){
    const [a,b,c]=pick(T21.slice(0,6)), [a2,b2,c2]=pick(T21.slice(0,6)), k=rnd(4), cA=fr(a,c), sA=fr(b,c), cB=fr(a2,c2), sB=fr(b2,c2), m=fmul, top=[['cos A = '+fshow(cA)+' and sin A = '+fshow(sA),'given']];
    if(k<2){ const right=fshow(k===0?fsub(m(cA,cB),m(sA,sB)):fadd(m(sA,cB),m(cA,sB))), wrong=frs16(right,[fadd(m(cA,cB),m(sA,sB)),fsub(m(sA,cB),m(cA,sB)),k===0?fadd(cA,cB):fadd(sA,sB),k===0?fadd(m(sA,cB),m(cA,sB)):fsub(m(cA,cB),m(sA,sB)),m(cA,cB),m(sA,sB)]); if(wrong.length<3) return null;
      return {index:'q:21d.sum['+[k,a,b,c,a2,b2,c2].join(';')+']', lines:top.concat([['cos B = '+fshow(cB)+' and sin B = '+fshow(sB),'given']]), ask:'What is '+(k===0?'cos':'sin')+'(A + B)?', right, opts:shuffle([right,...wrong]), lead:'', why:'Sum technique: '+(k===0?'cos A cos B − sin A sin B = '+fshow(m(cA,cB))+' − '+fshow(m(sA,sB)):'sin A cos B + cos A sin B = '+fshow(m(sA,cB))+' + '+fshow(m(cA,sB)))+' = '+right+'.'}; }
    const right=fshow(k===2?m(fint(2),m(sA,cA)):fsub(m(cA,cA),m(sA,sA))), wrong=frs16(right,[m(fint(2),k===2?sA:cA),k===2?fsub(m(cA,cA),m(sA,sA)):m(fint(2),m(sA,cA)),m(sA,cA),k===2?m(sA,sA):fsub(m(sA,sA),m(cA,cA)),m(cA,cA),fint(1)]); if(wrong.length<3) return null;
    return {index:'q:21d.sum['+[k,a,b,c].join(';')+']', lines:top, ask:'What is '+(k===2?'sin':'cos')+' 2A?', right, opts:shuffle([right,...wrong]), lead:'', why:'Double technique: '+(k===2?'sin 2A = 2 sin A cos A = 2 · '+fshow(sA)+' · '+fshow(cA):'cos 2A = cos² A − sin² A = '+fshow(m(cA,cA))+' − '+fshow(m(sA,sA)))+' = '+right+'.'}; }});

/* ---------- 21e Flips and the Complement ---------- */
const E21=[
  ['Is sin(−θ) = sin θ?','no: sin(−θ) = −sin θ',['yes','no: sin(−θ) = cos θ','only when θ > 0'],'Reversal: the flip over the floor keeps the across and changes the sign of the up.'],
  ['Which is cos(π/2 − θ)?','sin θ',['cos θ − π/2','−sin θ','−cos θ'],'Complement technique. The π/2 is inside the cosine and cannot be taken out as it stands.'],
  ['Which flip gives sin(π − θ) = sin θ?','the flip across the upright axis',['the flip over the floor','the flip across y = x','no flip: the half turn'],'It keeps the up and changes the sign of the across: cos(π − θ) = −cos θ.'],
  ['Which is cos(A − B)?','cos A cos B + sin A sin B',['cos A cos B − sin A sin B','cos A − cos B','sin A cos B − cos A sin B'],'Write A − B as A + (−B), and use the reversal technique on −B.'],
  ['Which flip gives the complement technique?','the flip across y = x',['the flip over the floor','the flip across the upright axis','no flip: the quarter turn'],'It swaps (1, 0) and (0, 1), and so swaps across and up.']];
const SAME21=[['cos(−θ)',0],['sin(−θ)',3],['cos(π/2 − θ)',2],['sin(π/2 − θ)',0],['cos(π − θ)',1],['sin(π − θ)',2],['cos(θ + π)',1],['sin(θ + π)',3],['cos(θ + π/2)',3],['sin(θ + π/2)',0],['cos(θ − π/2)',2],['sin(θ − π/2)',1],['cos(θ − π)',1],['sin(θ − π)',3],['cos(2π − θ)',0],['sin(2π − θ)',3],['cos(3π/2 − θ)',3],['sin(3π/2 − θ)',1],['cos(θ + 3π/2)',2],['sin(θ + 3π/2)',1]];
QP.push({id:'21e.flip',step:'21e',label:'what each flip does',open:()=>measured('21e'),make(){ return writtenQ('21e.flip',E21); }},
  {id:'21e.same',step:'21e',mode:'work',label:'back to cos θ and sin θ',open:()=>measured('21e'),make(){
    if(Math.random()<0.55){ const [e,r]=pick(SAME21), L=pick(['θ','A','x','t']), sub=s=>s.replace(/θ/g,L), opts=['cos θ','−cos θ','sin θ','−sin θ'].map(sub), fn=e.slice(0,3), other=fn==='cos'?'sin':'cos', inner=e.slice(4,-1), plus=inner.indexOf('θ')===0, arc=inner.replace('θ','').replace(/[ +−]/g,'');
      return {index:'q:21e.same['+sub(e)+']', lines:[[sub(e),'to be written with '+L+' alone inside']], ask:'Which is it?', right:opts[r], opts, lead:'', why:arc===''?'Reversal: cos(−'+L+') = cos '+L+' and sin(−'+L+') = −sin '+L+'.':'Use the '+(plus&&inner.indexOf('−')<0?'sum':'difference')+' technique with cos '+arc+' = '+ex21(Math.cos(arc==='π'?Math.PI:arc==='2π'?2*Math.PI:arc==='π/2'?Math.PI/2:1.5*Math.PI))+' and sin '+arc+' = '+ex21(Math.sin(arc==='π'?Math.PI:arc==='2π'?2*Math.PI:arc==='π/2'?Math.PI/2:1.5*Math.PI))+': only the '+(r<2===(fn==='cos')?fn:other)+' term is left, and it is '+opts[r]+'.'}; }
    const [a,b,c]=pick(T21.slice(0,6)), [a2,b2,c2]=pick(T21.slice(0,6)), co=Math.random()<0.5, cA=fr(a,c), sA=fr(b,c), cB=fr(a2,c2), sB=fr(b2,c2), m=fmul, right=fshow(co?fadd(m(cA,cB),m(sA,sB)):fsub(m(sA,cB),m(cA,sB))), wrong=frs16(right,[fsub(m(cA,cB),m(sA,sB)),fadd(m(sA,cB),m(cA,sB)),co?fsub(cA,cB):fsub(sA,sB),co?fsub(m(sA,cB),m(cA,sB)):fadd(m(cA,cB),m(sA,sB)),fsub(m(cA,sB),m(sA,cB)),m(cA,cB)]); if(wrong.length<3) return null;
    return {index:'q:21e.same[d;'+[co?'c':'s',a,b,c,a2,b2,c2].join(';')+']', lines:[['cos A = '+fshow(cA)+' and sin A = '+fshow(sA),'given'],['cos B = '+fshow(cB)+' and sin B = '+fshow(sB),'given']], ask:'What is '+(co?'cos':'sin')+'(A − B)?', right, opts:shuffle([right,...wrong]), lead:'', why:'Difference technique: '+(co?'cos A cos B + sin A sin B = '+fshow(m(cA,cB))+' + '+fshow(m(sA,sB)):'sin A cos B − cos A sin B = '+fshow(m(sA,cB))+' − '+fshow(m(cA,sB)))+' = '+right+'.'}; }});

/* ---------- 21f sin h / h → 1 ---------- */
const F21=[
  ['For 0 ≤ h < π/2, which fences hold?','sin h ≤ h ≤ tan h',['h ≤ sin h ≤ tan h','tan h ≤ h ≤ sin h','sin h ≤ tan h ≤ h'],'Small-arc: the arc is an integral whose integrand is at least 1 and at most 1/cos h.'],
  ['Can the slope of sin at 0 be used to find where sin h / h heads?','no: that slope is this very limit',['yes','yes, by the quotient rule','no: sin has no slope at 0'],'It would be circular. The fences sin h ≤ h ≤ tan h come first, and the slope of sin is built on them.'],
  ['Is sin h = h for small h?','no: only the ratio sin h / h heads to 1',['yes','yes, once h is less than 1/100','no: sin h is more than h'],'sin h ≤ h, and the two are equal only at h = 0.'],
  ['As h heads to 0, to which real does (1 − cos h)/h head?','0',['1','1/2','to none'],'Cosine-gap: multiply top and bottom by 1 + cos h, and the top becomes sin² h.'],
  ['As h heads to 0, to which real does sin h / h head?','1',['0','to none: it is 0/0','π'],'Sine-over-arc: sin h / h sits between cos h and 1, and cos h heads to 1.']];
QP.push({id:'21f.fence',step:'21f',label:'fences for a small arc',open:()=>measured('21f'),make(){ return writtenQ('21f.fence',F21); }},
  {id:'21f.limit',step:'21f',mode:'work',label:'where it heads',open:()=>measured('21f'),make(){
    const k=rnd(8), a=2+rnd(8), b=pick(id19(9).filter(v=>v!==a&&v>1)), x=pick(['h','x','t']);
    const [e,R,why]=k===0?['sin '+a+x+' / '+x,fint(a),'Write it as '+a+' · (sin '+a+x+' / '+a+x+'). As '+x+' heads to 0 so does '+a+x+', and sine-over-arc sends the bracket to 1.']
      :k===1?['sin '+a+x+' / '+b+x,fr(a,b),'Write it as ('+a+'/'+b+') · (sin '+a+x+' / '+a+x+'). Sine-over-arc sends the bracket to 1.']
      :k===2?['sin '+a+x+' / sin '+b+x,fr(a,b),'Divide top and bottom by '+x+': the top heads to '+a+' and the bottom to '+b+', by sine-over-arc.']
      :k===3?['tan '+a+x+' / '+x,fint(a),'tan '+a+x+' / '+x+' = (sin '+a+x+' / '+x+') · (1 / cos '+a+x+'). The first heads to '+a+' and the second to 1.']
      :k===4?[x+' / sin '+a+x,fr(1,a),'It is 1 over (sin '+a+x+' / '+x+'), and that heads to '+a+'.']
      :k===5?[a+'(1 − cos '+x+') / '+x,fint(0),'Cosine-gap: (1 − cos '+x+') / '+x+' heads to 0, and '+a+' · 0 = 0.']
      :k===6?['sin² '+x+' / '+a+x,fint(0),'It is (sin '+x+' / '+x+') · (sin '+x+' / '+a+'). The first heads to 1 and the second to 0.']
      :['(1 − cos '+x+') / '+x+'²',fr(1,2),'Multiply top and bottom by 1 + cos '+x+': it is (sin '+x+' / '+x+')² · 1/(1 + cos '+x+'), which heads to 1 · 1/2.'];
    const right=fshow(R), wrong=frs16(right,[fint(a),fr(1,a),fr(b,a),fr(a,b),fint(0),fint(1),fint(a*b),fr(1,2)]); if(wrong.length<3) return null;
    return {index:'q:21f.limit['+[k,a,b,x].join(';')+']', lines:[[e,'a quotient, for '+x+' near 0 and not 0']], ask:'As '+x+' heads to 0, to which real does it head?', right, opts:shuffle([right,...wrong]), lead:'', why}; }},
  {id:'21f.line',step:'21f',mode:'proof',label:'which fence',open:()=>measured('21f'),make(){
    const q=2+rnd(11), p=1+rnd(Math.floor(3*q/2)), h=fshow(fr(p,q)), k=rnd(6), opts=['it is licensed','it is not licensed'], hs=fr(p,q).q===1?' '+h:'('+h+')';
    const [claim,ok,why]=[['sin'+hs+' ≤ '+h,1,'Small-arc: sin h ≤ h for 0 ≤ h < π/2.'],[h+' ≤ tan'+hs,1,'Small-arc: h ≤ tan h for 0 ≤ h < π/2.'],['sin'+hs+' ≤ tan'+hs,1,'Small-arc gives sin h ≤ h and h ≤ tan h, and ≤ passes along.'],[h+' ≤ sin'+hs,0,'Small-arc gives the fence the other way round: sin h ≤ h.'],['tan'+hs+' ≤ '+h,0,'Small-arc gives the fence the other way round: h ≤ tan h.'],['sin'+hs+' = '+h,0,'Small-arc gives sin h ≤ h, not that they are equal. They are equal only at h = 0.']][k];
    return {index:'q:21f.line['+[k,p,q].join(';')+']', stack:true, lines:[['h = '+h+', which is between 0 and π/2','given'],[claim,'the small-arc technique']], ask:'Is line 2 licensed?', right:opts[ok?0:1], opts, lead:'', why}; }});

/* ---------- 21g The Slopes of sin and cos ---------- */
const G21=[
  ['What is the slope of cos at θ?','−sin θ',['sin θ','cos θ','−cos θ'],'cos falls as θ leaves 0, where sin is positive.'],
  ['What is the slope of sin 2θ?','2 cos 2θ',['cos 2θ','2 cos θ','−2 cos 2θ'],'The chain rule brings out the slope of the inside, 2.'],
  ['f″ = −f everywhere, f(0) = 0 and f′(0) = 0. What is f?','0 everywhere',['sin','cos','it cannot be told'],'Swing technique: f(θ) = f(0) cos θ + f′(0) sin θ.'],
  ['Wherever cos θ ≠ 0, what is the slope of tan at θ?','sec² θ',['sec θ','1 + tan θ','−csc² θ'],'The quotient rule on sin / cos, then the circle technique on top.'],
  ['What is the second slope of sin?','−sin',['sin','cos','−cos'],'The slope of sin is cos, and the slope of cos is −sin.']];
QP.push({id:'21g.slope',step:'21g',label:'the slopes of the coordinates',open:()=>measured('21g'),make(){ return writtenQ('21g.slope',G21); }},
  {id:'21g.work',step:'21g',mode:'work',label:'slopes and swings',open:()=>measured('21g'),make(){
    const k=rnd(4), a=nz20(7), b=nz20(7);
    if(k===0||k===3){ const f=lc21(a,'sin θ',b,'cos θ'), right=k===0?lc21(a,'cos θ',-b,'sin θ'):lc21(-a,'sin θ',-b,'cos θ'), wrong=uniq(right,[lc21(a,'cos θ',b,'sin θ'),lc21(-a,'cos θ',b,'sin θ'),lc21(a,'sin θ',b,'cos θ'),lc21(-a,'sin θ',-b,'cos θ'),lc21(a,'cos θ',-b,'sin θ'),lc21(b,'cos θ',-a,'sin θ')],3);
      return {index:'q:21g.work['+[k,a,b].join(';')+']', lines:[['f(θ) = '+f,'given']], ask:k===0?'What is its slope f′(θ)?':'What is its second slope f″(θ)?', right, opts:shuffle([right,...wrong]), lead:'', why:'The slope of sin is cos, and the slope of cos is −sin. So f′(θ) = '+lc21(a,'cos θ',-b,'sin θ')+(k===3?', and once more f″(θ) = '+right+', which is −f(θ)':'')+'.'}; }
    if(k===1){ const t=pick(ARC21), co=Math.random()<0.5, v=co?-Math.sin(t*Math.PI/12):Math.cos(t*Math.PI/12), right=ex21(v), wrong=uniq(right,[ex21(-v),co?cos21(t):sin21(t),ex21(co?-Math.cos(t*Math.PI/12):-Math.sin(t*Math.PI/12))].concat(shuffle(ALL21.slice())).filter(s=>s!=='−0'),3);
      return {index:'q:21g.work[p;'+t+';'+(co?'c':'s')+']', lines:[['θ = '+pi21(t,12),'an arc']], ask:'What is the slope of '+(co?'cos':'sin')+' at θ?', right, opts:shuffle([right,...wrong]), lead:'', why:(co?'Slope-of-cos: it is −sin θ':'Slope-of-sin: it is cos θ')+'. The point at '+pi21(t,12)+' is ('+cos21(t)+', '+sin21(t)+').'}; }
    const [t,v,nm]=pick([[6,b,'f′(0)'],[12,-a,'−f(0)'],[18,-b,'−f′(0)'],[24,a,'f(0)']]), right=sg(v), wrong=num13(right,[a,b,-a,-b,a+b,a-b,0].filter(z=>z!==v)); if(wrong.length<3) return null;
    return {index:'q:21g.work[s;'+[a,b,t].join(';')+']', lines:[['f″ = −f everywhere','given'],['f(0) = '+sg(a)+' and f′(0) = '+sg(b),'given']], ask:'What is f('+pi21(t,12)+')?', right, opts:shuffle([right,...wrong]), lead:'', why:'Swing technique: f(θ) = '+lc21(a,'cos θ',b,'sin θ')+'. At '+pi21(t,12)+' the point of the circle is ('+cos21(t%24)+', '+sin21(t%24)+'), so f is '+nm+' = '+right+'.'}; }});

/* ---------- 21h The Two Triangles ---------- */
const H21=[
  ['Area = ½ ab sin A: is that right?','no: the angle must be the one between the two sides, as in ½ ab sin C',['yes','no: it is ½ ab cos A','no: it is ab sin A'],'Sine-area: half the product of two sides and the sine of the angle between them.'],
  ['Which is the cosine-side technique?','a² = b² + c² − 2bc cos A',['a² = b² + c² + 2bc cos A','a² = b² + c² − 2bc sin A','a = b + c − 2bc cos A'],'Minus: an angle that opens less than a right angle makes the facing side shorter than the right-triangle technique would.'],
  ['What does the cosine-side technique become when A is a right angle?','a² = b² + c²',['a = b + c','a² = b² + c² − 2bc','a² = 2bc'],'cos(π/2) = 0, and it is 18a’s right-triangle technique.'],
  ['Given A, b and a, with A between 0 and π/2 and b sin A < a < b: how many triangles are there?','two',['none','one','three'],'Two-triangles: the side a is long enough to reach the far line and short enough to reach it on both sides of the foot.'],
  ['Which is the sine-ratio technique?','a / sin A = b / sin B = c / sin C',['a sin A = b sin B = c sin C','a / cos A = b / cos B = c / cos C','a + sin A = b + sin B = c + sin C'],'Find the area three ways, once from each corner, and divide by ½ abc.']];
const CS21=[[3,8,7,4],[5,8,7,4],[7,15,13,4],[8,15,13,4],[5,21,19,4],[16,21,19,4],[3,5,7,8],[7,8,13,8],[5,16,19,8],[3,4,5,6],[5,12,13,6],[8,15,17,6],[6,8,10,6]];
QP.push({id:'21h.laws',step:'21h',label:'sides and angles of any triangle',open:()=>measured('21h'),make(){ return writtenQ('21h.laws',H21); }},
  {id:'21h.tri',step:'21h',mode:'work',label:'triangles, worked',open:()=>measured('21h'),make(){
    const k=rnd(4);
    if(k===0){ const b=2+rnd(11), c=2+rnd(11), t=pick([2,6,10]), F=fr(b*c,t===6?2:4), right=fshow(F), wrong=frs16(right,[fr(b*c,t===6?4:2),fint(b*c),fint(b+c),fr(b*c,8),fr(b+c,2),fint(2*b*c)]); if(wrong.length<3) return null;
      return {index:'q:21h.tri[a;'+[b,c,t].join(';')+']', lines:[['a triangle with the sides b = '+b+' and c = '+c,'given'],['the angle between them is A = '+pi21(t,12),'given']], ask:'What is its area?', right, opts:shuffle([right,...wrong]), lead:'', why:'Sine-area: ½ bc sin A = ½ · '+b+' · '+c+' · '+sin21(t)+' = '+right+'.'}; }
    if(k===1){ const [b,c,a,t]=pick(CS21), right=String(a), wrong=uniq(right,[a+1,a-1,b+c,Math.abs(c-b),a+2,b*c].map(String),3);
      return {index:'q:21h.tri[c;'+[b,c,t].join(';')+']', lines:[['a triangle with the sides b = '+b+' and c = '+c,'given'],['the angle between them is A = '+pi21(t,12),'given']], ask:'How long is the third side a?', right, opts:shuffle([right,...wrong]), lead:'', why:'Cosine-side: a² = b² + c² − 2bc cos A = '+(b*b)+' + '+(c*c)+' − 2 · '+b+' · '+c+' · '+(t===8?'(−1/2)':cos21(t))+' = '+(a*a)+', so a = '+a+'.'}; }
    if(k===2){ const b=2*(2+rnd(9)), c=rnd(4), a=c===0?1+rnd(b/2-1):c===1?b/2:c===2?b/2+1+rnd(b/2-1):b+rnd(5), opts=['none','one','two','three'], cs=[0,1,2,1][c];
      return {index:'q:21h.tri[t;'+[b,a].join(';')+']', lines:[['A = π/6 and b = '+b,'an angle, and a side next to it'],['a = '+a,'the side facing A']], ask:'How many triangles have these three?', right:opts[cs], opts, lead:'', why:'Two-triangles: b sin A = '+b+' · 1/2 = '+(b/2)+'. '+(c===0?'a is less than that: too short to reach the far line.':c===1?'a is exactly that: it reaches the far line at a right angle, once.':c===2?'a is between '+(b/2)+' and b = '+b+': it reaches the far line on both sides of the foot.':'a is at least b: it reaches the far line on one side of A only.')}; }
    const a=2*(1+rnd(9)), [tA,tB,r,why]=pick([[2,6,String(2*a),'2'],[6,2,String(a/2),'1/2'],[2,3,rt21(a,2),'√2'],[3,6,rt21(a/2,2)+' · 2',''],[2,4,rt21(a,3),'√3'],[2,8,rt21(a,3),'√3'],[2,9,rt21(a,2),'√2']].filter(v=>v[3]!=='')), right=r, wrong=uniq(right,[String(2*a),String(a/2),rt21(a,2),rt21(a,3),String(a),rt21(a/2,3)],3);
    return {index:'q:21h.tri[s;'+[a,tA,tB].join(';')+']', lines:[['a triangle with the side a = '+a+' facing the angle A = '+pi21(tA,12),'given'],['the angle B = '+pi21(tB,12),'given']], ask:'How long is the side b facing B?', right, opts:shuffle([right,...wrong]), lead:'', why:'Sine-ratio: b = a sin B / sin A = '+a+' · '+sin21(tB)+' / '+sin21(tA)+' = '+right+'.'}; }},
  {id:'21h.plot',step:'21h',mode:'word',label:'a three-cornered piece',open:()=>measured('21h'),make(){
    const who=pick(['A three-cornered plot','A three-cornered sail','A three-cornered flag','A three-cornered sheet of steel']), b=2+rnd(14), c=2+rnd(14), t=pick([2,6,10,2,10]), F=fr(b*c,t===6?2:4), right=fshow(F)+' square metres', wrong=uniq(right,[fr(b*c,t===6?4:2),fint(b*c),fint(b+c),fr(b*c,8),fint(2*b*c)].map(v=>fshow(v)+' square metres'),3); if(wrong.length<3) return null;
    return {index:'q:21h.plot['+[who,b,c,t].join(';')+']', a3:['21h.plot',DASH,DASH], story:who+' has two sides of '+b+' metres and '+c+' metres, and the angle between them is '+pi21(t,12)+'.', lines:[], ask:'What is its area?', right, opts:shuffle([right,...wrong]), lead:'', why:'Sine-area: half the product of two sides and the sine of the angle between them. ½ · '+b+' · '+c+' · '+sin21(t)+' = '+fshow(F)+'.'}; }});

/* ---------- 21i Around the Circle ---------- */
const I21=[
  ['y = −3 sin θ: how far does it swing from its level?','3',['−3','6','0'],'Wave-height: the swing is |A|. The minus turns the wave over.'],
  ['sin(2θ + π/2) is sin(2θ) slid left by how much?','π/4',['π/2','π','2π'],'Slide-inside: take the 2 out first. sin(2θ + π/2) = sin(2(θ + π/4)).'],
  ['How often does y = sin(bθ) repeat, for b > 0?','every 2π/b, and no sooner',['every 2πb','every b','every π/b'],'Period technique: the squeeze by b squeezes the whole turn 2π to 2π/b.'],
  ['Between which values does y = A sin θ + d swing?','d − |A| and d + |A|',['−A and A','d and d + A','A − d and A + d'],'Wave-height: sin runs from −1 to 1, the pull by A makes that −|A| to |A|, and the lift by d moves the level.'],
  ['A wave is highest at M and lowest at m. About which level does it swing?','(M + m)/2',['(M − m)/2','M − m','M + m'],'Wave-from-readings: d = (M + m)/2 and A = (M − m)/2.']];
QP.push({id:'21i.wave',step:'21i',label:'reading a wave',open:()=>measured('21i'),make(){ return writtenQ('21i.wave',I21); }},
  {id:'21i.read',step:'21i',mode:'work',label:'waves, worked',open:()=>measured('21i'),make(){
    const k=rnd(5), A=nz20(6), d=rnd(11)-5, [bn,bd]=pick([[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[1,2],[1,3],[2,3],[3,2]]), B=fr(bn,bd), arg=bd===1?(bn===1?'θ':bn+'θ'):(bn===1?'θ/'+bd:bn+'θ/'+bd), fn=pick(['sin','cos']), eq='y = '+(A===1?'':A===-1?'−':sg(A)+' ')+fn+(arg==='θ'?' θ':'('+arg+')')+(d?pm(d):'');
    if(k===0||k===1){ const v=k===0?d+Math.abs(A):d-Math.abs(A), right=sg(v), wrong=num13(right,[k===0?d-Math.abs(A):d+Math.abs(A),A,d,d+A===v?d-A:d+A,Math.abs(A),v+1,2*Math.abs(A)]); if(wrong.length<3) return null;
      return {index:'q:21i.read['+[k,A,d,bn,bd,fn].join(';')+']', lines:[[eq,'a wave']], ask:k===0?'What is its highest value?':'What is its lowest value?', right, opts:shuffle([right,...wrong]), lead:'', why:'Wave-height: it swings evenly about the level '+sg(d)+', by |A| = '+Math.abs(A)+' each way: from '+sg(d-Math.abs(A))+' to '+sg(d+Math.abs(A))+'.'}; }
    if(k===2){ const right=pi21(2*bd,bn), wrong=uniq(right,[pi21(2*bn,bd),pi21(bd,bn),pi21(2,1),pi21(bn,bd),pi21(4*bd,bn),fshow(B)],3); if(wrong.length<3) return null;
      return {index:'q:21i.read[p;'+[A,d,bn,bd,fn].join(';')+']', lines:[[eq,'a wave']], ask:'After how long does it first repeat?', right, opts:shuffle([right,...wrong]), lead:'', why:'Period technique: 2π/b = 2π/'+(bd===1?bn:'('+fshow(B)+')')+' = '+right+'.'}; }
    if(k===3){ const b=2+rnd(5), [cn,cd]=pick([[1,2],[1,3],[1,4],[1,6],[2,3],[1,1],[3,4]]), neg=Math.random()<0.5, right=pi21(cn,cd*b), wrong=uniq(right,[pi21(cn,cd),pi21(cn*b,cd),pi21(2,b),pi21(cn,cd*b*2),pi21(2*cn,cd*b)],3); if(wrong.length<3) return null;
      return {index:'q:21i.read[s;'+[b,cn,cd,neg?1:0].join(';')+']', lines:[['y = sin('+b+'θ '+(neg?'−':'+')+' '+pi21(cn,cd)+')','a wave']], ask:'It is y = sin('+b+'θ), slid '+(neg?'right':'left')+' by how much?', right, opts:shuffle([right,...wrong]), lead:'', why:'Slide-inside: take the '+b+' out first. sin('+b+'θ '+(neg?'−':'+')+' '+pi21(cn,cd)+') = sin('+b+'(θ '+(neg?'−':'+')+' '+right+')), a slide by c/b and not by c.'}; }
    const m=rnd(9)-4, amp=1+rnd(6), M=m+2*amp, wantA=Math.random()<0.5, right=sg(wantA?amp:m+amp), wrong=num13(right,[wantA?m+amp:amp,2*amp,M,m,M+m,wantA?amp+1:m+amp+1]); if(wrong.length<3) return null;
    return {index:'q:21i.read[r;'+[M,m,wantA?1:0].join(';')+']', lines:[['a wave with the highest value '+sg(M)+' and the lowest value '+sg(m),'two readings']], ask:wantA?'What is A, its swing to each side of the level?':'What is d, the level it swings about?', right, opts:shuffle([right,...wrong]), lead:'', why:'Wave-from-readings: A = (M − m)/2 = '+amp+' and d = (M + m)/2 = '+sg(m+amp)+'.'}; }},
  {id:'21i.tide',step:'21i',mode:'word',label:'four readings',open:()=>measured('21i'),make(){
    const [who,unit,len]=pick([['A cork on a pond','seconds','centimetres'],['A float on a swell','seconds','metres'],['A weight on a spring','seconds','centimetres'],['A seat on a big wheel','minutes','metres']]), m=1+rnd(6), amp=2+rnd(4), M=m+2*amp, T=pick([2,3,4,5,6,8,10,12]), k=rnd(3);
    const right=k===0?(m+amp)+' '+len:k===1?amp+' '+len:pi21(2,T), wrong=k<2?uniq(right,[k===0?amp:m+amp,2*amp,M,m,M+m,k===0?m+amp+1:amp+1].filter(v=>v>1).map(v=>v+' '+len),3):uniq(right,[pi21(1,T),pi21(2*T,1),pi21(T,2),pi21(4,T),String(T)],3); if(wrong.length<3) return null;
    return {index:'q:21i.tide['+[who,M,m,T,k].join(';')+']', a3:['21i.tide',DASH,DASH], story:who+' is '+M+' '+len+' up at its highest and '+m+' '+(m===1?len.slice(0,-1):len)+' up at its lowest, and '+T+' '+unit+' pass from one high to the next.', lines:[], ask:k===0?'About which height does it swing?':k===1?'How far above that middle height does it rise?':'In y = A cos(2π(t − t₀)/T) + d, by how much does the arc inside the cosine grow in one of the '+unit+'?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'Wave-from-readings: d = (M + m)/2 = '+(m+amp)+', A = (M − m)/2 = '+amp+', and T = '+T+'.'+(k===2?' A share of the time is a share of the turn: 2π/T = '+right+' in each of the '+unit+'.':'')}; }});

/* ===== Laundry 5, rung 21 (floor 4 pools, stage T), part 2: 21j to 21r ===== */
const smul21=(c,v)=>v[0]==='−'?'−'+mul21(c,v.slice(1)):mul21(c,v), FR21=[[1,6],[1,5],[1,4],[2,5],[1,3],[3,8],[3,5],[2,3],[3,4],[5,6],[7,12],[5,12],[1,8],[3,10],[7,10],[4,9]];
const back21=(fn,x)=>{ const lo=fn==='cos'?0:fn==='tan'?-5:-6, hi=fn==='cos'?12:fn==='tan'?5:6; for(let j=lo;j<=hi;j++){ const v=fn==='cos'?Math.cos(j*Math.PI/12):fn==='tan'?Math.tan(j*Math.PI/12):Math.sin(j*Math.PI/12); if(Math.abs(v-x)<1e-9) return j; } return null; };

/* ---------- 21j Radians ---------- */
const J21=[
  ['Is sin 30 = 1/2?','no: sin 30° = 1/2, and 30 with no mark is 30 radians',['yes','no: sin 30 = √3/2','yes, in any measure'],'30 radians is nearly five whole turns.'],
  ['An angle of x° has which arc?','πx/180',['180x/π','x/360','2πx'],'Sizes-are-arcs: a half turn is 180° and has the arc π.'],
  ['On a circle of radius r, an angle of θ radians at the centre cuts an arc of which length?','rθ',['r + θ','πrθ','rθ/180'],'Arc-on-any-circle: the circle of radius r is the circle of radius 1 pulled by r.'],
  ['With the angle in degrees, what is the slope of the sine?','π/180 times the cosine',['the cosine itself','180/π times the cosine','minus the cosine'],'Degree-slope: “°” means times π/180, and the chain rule brings that out. Only in radians is the slope the cosine itself.'],
  ['For an angle of 60°, is the arc on a circle of radius r equal to 60r?','no: s = rθ needs θ in radians, here π/3',['yes','no: it is 60πr','no: it is r/60'],'60° has the arc π · 60/180 = π/3, so s = πr/3.']];
QP.push({id:'21j.rad',step:'21j',label:'degrees and arcs',open:()=>measured('21j'),make(){ return writtenQ('21j.rad',J21); }},
  {id:'21j.conv',step:'21j',mode:'work',label:'from degrees to arcs and back',open:()=>measured('21j'),make(){
    const k=rnd(4), deg=pick([10,15,18,20,30,36,45,60,72,75,90,105,120,135,150,180,210,225,240,270,300,315,330,360]), r=1+rnd(12), [p,q]=pick(FR21.concat([[1,2],[1,1],[3,2],[5,4],[4,3],[2,1]]));
    if(k===0){ const right=pi21(deg,180), wrong=uniq(right,[pi21(deg,360),pi21(deg,90),pi21(deg,100),pi21(2*deg,270),pi21(deg,120),String(deg)],3); if(wrong.length<3) return null;
      return {index:'q:21j.conv[d;'+deg+']', lines:[['an angle of '+deg+'°','given']], ask:'What is its arc, in radians?', right, opts:shuffle([right,...wrong]), lead:'', why:'Sizes-are-arcs: x° has the arc πx/180. π · '+deg+'/180 = '+right+'.'}; }
    if(k===1){ const f=v=>v+'°', right=f(deg), wrong=uniq(right,[deg/2,2*deg,deg+30,Math.abs(180-deg)||90,deg+90,deg/3].filter(v=>v===Math.floor(v)&&v>0).map(f),3); if(wrong.length<3) return null;
      return {index:'q:21j.conv[r;'+deg+']', lines:[['an angle with the arc '+pi21(deg,180),'given']], ask:'What is its size in degrees?', right, opts:shuffle([right,...wrong]), lead:'', why:'A half turn has the arc π and the size 180°, so multiply the arc by 180/π: '+pi21(deg,180)+' · 180/π = '+deg+'.'}; }
    if(k===2){ const right=fpi21(fr(r*p,q)), wrong=uniq(right,[fpi21(fr(p,q)),fpi21(fr(r*p,2*q)),fpi21(fr(2*r*p,q)),fpi21(fr(r*r*p,q)),fpi21(fr(r*q,p)),fshow(fr(r*p,q))],3); if(wrong.length<3) return null;
      return {index:'q:21j.conv[s;'+[r,p,q].join(';')+']', lines:[['a circle of radius '+r,'given'],['an angle of '+pi21(p,q)+' radians at its centre','given']], ask:'How long is the arc it cuts?', right, opts:shuffle([right,...wrong]), lead:'', why:'Arc-on-any-circle: rθ = '+r+' · '+pi21(p,q)+' = '+right+'.'}; }
    const s=1+rnd(20), right=fshow(fr(s,r)), wrong=frs16(right,[fr(r,s),fint(s*r),fr(s,2*r),fint(s+r),fr(2*s,r),fint(s)]); if(wrong.length<3) return null;
    return {index:'q:21j.conv[a;'+[r,s].join(';')+']', lines:[['a circle of radius '+r,'given'],['an arc of it of the length '+s,'given']], ask:'How many radians is the angle at the centre that cuts it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Arc-on-any-circle: s = rθ, so θ = s/r = '+s+'/'+r+(right===s+'/'+r?'':' = '+right)+'. No π is needed: a radian is an arc as long as the radius.'}; }},
  {id:'21j.rim',step:'21j',mode:'word',label:'how far round',open:()=>measured('21j'),make(){
    const [who,d,un]=pick([['A mark on the rim of a wheel','from the axle','centimetres'],['The tip of a clock hand','from the centre of the face','centimetres'],['A seat on a roundabout','from the middle','metres'],['A mark on a turntable','from the centre','centimetres']]), r=2+rnd(11), [p,q]=pick(FR21.concat([[1,2],[1,1],[3,2],[2,1]])), right=fpi21(fr(r*p,q))+' '+un, wrong=uniq(right,[fpi21(fr(p,q)),fpi21(fr(r*p,2*q)),fpi21(fr(2*r*p,q)),fpi21(fr(r*r*p,q)),fshow(fr(r*p,q))].map(v=>v+' '+un),3); if(wrong.length<3) return null;
    return {index:'q:21j.rim['+[who,r,p,q].join(';')+']', a3:['21j.rim',DASH,DASH], story:who+' is '+r+' '+un+' '+d+'. It turns through the angle '+pi21(p,q)+', in radians.', lines:[], ask:'How far does it travel?', right, opts:shuffle([right,...wrong]), lead:'', why:'Arc-on-any-circle: rθ = '+r+' · '+pi21(p,q)+' = '+fpi21(fr(r*p,q))+'.'}; }});

/* ---------- 21k Identities ---------- */
const K21=[
  ['To prove an identity, may you square both sides of the claim and reach 1 = 1?','no: that runs backwards, and −1 = 1 squares to 1 = 1 too',['yes','yes, if both sides are positive somewhere','no: squaring is never allowed in any proof'],'One-side technique: a chain of equals from one side to the other.'],
  ['sin θ cos θ = sin θ. Does cos θ = 1 follow?','no: sin θ may be 0, so factor instead',['yes: divide by sin θ','yes, by the cancel technique','no: the equation has no answer'],'sin θ (cos θ − 1) = 0, so sin θ = 0 or cos θ = 1. Dividing loses θ = π.'],
  ['Which is cos²(θ/2)?','(1 + cos θ)/2',['(1 − cos θ)/2','cos² θ / 4','(cos θ)/2'],'Half-arc: from cos 2A = 2cos² A − 1 with A = θ/2.'],
  ['α is one arc with sin α = s. Which are all θ with sin θ = s?','α + 2πk and π − α + 2πk, for whole numbers k',['α + 2πk only','α + πk','±α + 2πk'],'Every-answer: the flip across the upright axis keeps the up, so π − α has the same sine. ±α is the rule for the cosine.'],
  ['What is an identity?','an equation true for every θ where both sides are defined',['an equation with exactly one answer','an equation with no θ in it','any equation between cos and sin'],'sin θ = 1/2 is an equation with answers. cos² θ + sin² θ = 1 is an identity.']];
const ID21=[['tan θ cos θ','sin θ','(sin θ / cos θ) cos θ'],['(1 − cos θ)(1 + cos θ)','sin² θ','1 − cos² θ'],['sec² θ − tan² θ','1','(1 + tan² θ) − tan² θ'],['(sin θ + cos θ)²','1 + sin 2θ','sin² θ + 2 sin θ cos θ + cos² θ'],['cos⁴ θ − sin⁴ θ','cos 2θ','(cos² θ − sin² θ)(cos² θ + sin² θ)'],['sin θ / tan θ','cos θ','sin θ · (cos θ / sin θ)'],['2cos² θ − 1','1 − 2sin² θ','2(1 − sin² θ) − 1'],['(1 − sin θ)(1 + sin θ)','cos² θ','1 − sin² θ'],['sin 2θ / (2 cos θ)','sin θ','2 sin θ cos θ / (2 cos θ)'],['cot θ sin θ','cos θ','(cos θ / sin θ) sin θ']];
QP.push({id:'21k.ident',step:'21k',label:'identities and answers',open:()=>measured('21k'),make(){ return writtenQ('21k.ident',K21); }},
  {id:'21k.solve',step:'21k',mode:'work',label:'every answer, and halves',open:()=>measured('21k'),make(){
    const k=rnd(4), co=Math.random()<0.5, fn=co?'cos':'sin', f=j=>co?cos21(j):sin21(j), all=v=>ARC21.filter(j=>f(j)===v).map(j=>pi21(j,12)).join(' and ');
    if(k===0){ const v=pick(ALL21), right=all(v), g=j=>co?sin21(j):cos21(j), neg=v==='0'?'1':v[0]==='−'?v.slice(1):'−'+v, first=ARC21.filter(j=>f(j)===v)[0], wrong=uniq(right,[all(neg),ARC21.filter(j=>g(j)===v).map(j=>pi21(j,12)).join(' and '),pi21(first,12)+' and '+pi21((first+12)%24,12),ARC21.filter(j=>g(j)===neg).map(j=>pi21(j,12)).join(' and '),pi21(first,12)+' and '+pi21((first+6)%24,12)],3); if(wrong.length<3) return null;
      return {index:'q:21k.solve[e;'+fn+';'+v+']', lines:[[fn+' θ = '+v,'an equation'],['0 ≤ θ < 2π','one whole turn']], ask:'Which are all its answers?', right, opts:shuffle([right,...wrong]), lead:'', why:'Every-answer: '+(co?'if α is one answer, the others in one turn come from ±α':'if α is one answer, the other in one turn is π − α')+'. The points of the circle with '+(co?'the across':'the up')+' '+v+' are at '+right+'.'}; }
    if(k===1){ const [a,b,c]=pick(T21), s=sn18(), C=fr(s*a,c), half=Math.random()<0.5, R=half?fr(c+s*a,2*c):fr(c-s*a,2*c), right=fshow(R), wrong=frs16(right,[half?fr(c-s*a,2*c):fr(c+s*a,2*c),fr(s*a,2*c),fmul(C,C),fr(a*a,4*c*c),fr(c+s*a,c),fr(1,2)]); if(wrong.length<3) return null;
      return {index:'q:21k.solve[h;'+[s*a,c,half?1:0].join(';')+']', lines:[['cos θ = '+fshow(C),'given']], ask:'What is '+(half?'cos':'sin')+'²(θ/2)?', right, opts:shuffle([right,...wrong]), lead:'', why:'Half-arc: '+(half?'cos²(θ/2) = (1 + cos θ)/2':'sin²(θ/2) = (1 − cos θ)/2')+' = (1 '+(half?'+':'−')+' '+par10s21(C)+')/2 = '+right+'.'}; }
    if(k===2){ const m=1+rnd(4), [e,n,why]=pick([[fn+' '+(m===1?'':m)+'θ = 1/2',2*m,'One turn of θ is '+m+' turn'+(m===1?'':'s')+' of '+(m===1?'θ':m+'θ')+', and each turn holds two answers.'],[fn+' '+(m===1?'':m)+'θ = −√3/2',2*m,'One turn of θ is '+m+' turn'+(m===1?'':'s')+' of '+(m===1?'θ':m+'θ')+', and each turn holds two answers.'],[fn+' θ = '+pick(['2','3/2','−5/4']),0,'cos and sin are coordinates of a point of the circle of radius 1, so they stay between −1 and 1.'],[fn+' θ = '+pick(['1','−1']),1,'Only one point of the circle is that far '+(co?'across':'up')+'.'],[fn+'² θ = '+pick(['1/4','1/2','3/4']),4,fn+' θ may be the root or minus the root, and each of the two has two answers in a turn.'],[fn+' '+(m===1?'':m)+'θ = '+pick(['1','−1']),m,'One turn of θ is '+m+' turn'+(m===1?'':'s')+' of '+(m===1?'θ':m+'θ')+', and each turn holds one answer.']]), right=String(n), wrong=uniq(right,shuffle(['0','1','2','3','4','6','8']),3);
      return {index:'q:21k.solve[n;'+e+']', lines:[[e,'an equation'],['0 ≤ θ < 2π','one whole turn']], ask:'How many answers has it?', right, opts:shuffle([right,...wrong]), lead:'', why}; }
    const b=1+rnd(5), a=b+1+rnd(5), x=pick(['x','θ','t']), t=rnd(3), P=(u,v)=>'½('+u+' '+v+')', s1=(a+b)+x, s2=(a-b===1?'':a-b)+x;
    const [e,right,cands]=t===0?['sin '+a+x+' cos '+b+x,'½(sin '+s1+' + sin '+s2+')',['½(sin '+s1+' − sin '+s2+')','½(cos '+s2+' + cos '+s1+')','sin '+s1+' + sin '+s2,'½(cos '+s2+' − cos '+s1+')']]:t===1?['cos '+a+x+' cos '+b+x,'½(cos '+s2+' + cos '+s1+')',['½(cos '+s2+' − cos '+s1+')','½(sin '+s1+' + sin '+s2+')','cos '+s2+' + cos '+s1,'½(cos '+s1+' − cos '+s2+')']]:['sin '+a+x+' sin '+b+x,'½(cos '+s2+' − cos '+s1+')',['½(cos '+s2+' + cos '+s1+')','½(cos '+s1+' − cos '+s2+')','½(sin '+s1+' − sin '+s2+')','cos '+s2+' − cos '+s1]];
    const wrong=uniq(right,cands,3);
    return {index:'q:21k.solve[p;'+e+']', lines:[[e,'a product']], ask:'Which sum is it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Product-to-sum: '+(t===0?'add sin(A + B) and sin(A − B), and the cos A sin B terms cancel':t===1?'add cos(A − B) and cos(A + B), and the sin A sin B terms cancel':'take cos(A + B) from cos(A − B), and the cos A cos B terms cancel')+'. Here A + B = '+s1+' and A − B = '+s2+'.'}; }},
  {id:'21k.line',step:'21k',mode:'proof',label:'is it proved',open:()=>measured('21k'),make(){
    const k=rnd(4), opts=['it is licensed','it is not licensed'], [L,R,mid]=pick(ID21), x=pick(['θ','x','t','A']), sub=s=>s.replace(/θ/g,x);
    if(k===0) return {index:'q:21k.line[c;'+sub(L)+']', stack:true, lines:[['to prove: '+sub(L)+' = '+sub(R),'the claim'],[sub(L)+' = '+sub(mid)+' = '+sub(R),'a chain of equals from the left side'],['the claim is proved','the one-side technique']], ask:'Is line 3 licensed?', right:opts[0], opts, lead:'', why:'The chain starts from one side and reaches the other by steps that each hold for every '+x+' where both sides are defined. Nothing unproved was used.'};
    if(k===1){ const sq=Math.random()<0.5, at=pick(['0','π/6','π/4','π/3']);
      return {index:'q:21k.line['+(sq?'q':'v'+at)+';'+sub(L)+']', stack:true, lines:[['to prove: '+sub(L)+' = '+sub(R),'the claim'],sq?['('+sub(L)+')² = ('+sub(R)+')²','square both sides of the claim; the two squares agree']:['at '+x+' = '+at+', where both sides are defined, they give the same number','put the number in'],['the claim is proved','the one-side technique']], ask:'Is line 3 licensed?', right:opts[1], opts, lead:'', why:sq?'This starts from the claim, which is still unproved, and runs backwards. −1 = 1 squares to 1 = 1 too. Chain from one side to the other.':'An identity must hold for every '+x+' where both sides are defined. One value shows nothing: sin '+x+' = 2 sin '+x+' holds at '+x+' = 0.'}; }
    const v=pick(['1','1/2','√3/2','−1/2','√2/2','−√3/2']), [f,g]=Math.random()<0.5?['sin','cos']:['cos','sin'], div=k===2;
    return {index:'q:21k.line['+[div?'d':'f',f,v,x].join(';')+']', stack:true, lines:[[f+' '+x+' '+g+' '+x+' = '+(v==='1'?'':'('+v+') ')+f+' '+x,'given'],div?[g+' '+x+' = '+v,'divide both sides by '+f+' '+x]:[f+' '+x+' = 0 or '+g+' '+x+' = '+v,'factor: '+f+' '+x+' ('+g+' '+x+(v[0]==='−'?' + '+v.slice(1):' − '+v)+') = 0']], ask:'Is line 2 licensed?', right:opts[div?1:0], opts, lead:'', why:div?'Dividing by '+f+' '+x+' is allowed only where it is not 0, and the answers with '+f+' '+x+' = 0 are lost. Factor instead.':'A product is 0 exactly when one of its factors is 0. No answer is lost.'}; }});
function par10s21(F){ const s=fshow(F); return F.p<0?'('+s+')':s; }

/* ---------- 21l The Slope of Sine by Hand ---------- */
const L21=[
  ['Which is the slope of sin(x²)?','cos(x²) · 2x',['cos 2x','cos(x²)','2x cos x'],'Trig-chain: the outside keeps its inside, and the slope of the inside comes out.'],
  ['Which is the slope of sin² x?','2 sin x cos x',['cos² x','2 sin x','2 cos x'],'The square is the outside: 2 sin x, times the slope of sin x.'],
  ['Which is the slope of sec x?','sec x tan x',['sec² x','−csc x cot x','tan² x'],'The quotient rule on 1 / cos x gives sin x / cos² x.'],
  ['Where does the sine bend down?','where it is above the floor',['where it is rising','where it is below the floor','everywhere'],'Sine-bend: its second slope is −sin, negative exactly where sin is positive.'],
  ['On a closed stretch, where can a wave-built function be highest?','at an end, or where its slope is 0',['only where its slope is 0','only at an end','where its second slope is 0'],'Trig-peaks. Every-answer finds the zeros of the slope.']];
QP.push({id:'21l.chain',step:'21l',label:'one inside another',open:()=>measured('21l'),make(){ return writtenQ('21l.chain',L21); }},
  {id:'21l.slope',step:'21l',mode:'work',label:'slopes of built-up waves',open:()=>measured('21l'),make(){
    const k=rnd(10), a=2+rnd(8), n=2+rnd(4), p=v=>v===1?'':sup19(v), xn='x'+p(n), xm='x'+p(n-1);
    if(k===9){ const t=pick(ARC21), s=Math.sin(t*Math.PI/12), opts=['it bends down','it bends up','neither: it changes its bend there','it cannot be told'];
      return {index:'q:21l.slope[b;'+t+']', lines:[['the graph of y = sin x, at x = '+pi21(t,12),'given']], ask:'Which way does it bend there?', right:opts[s>1e-9?0:s<-1e-9?1:2], opts, lead:'', why:'Sine-bend: the second slope is −sin x, and sin('+pi21(t,12)+') = '+sin21(t)+'. '+(Math.abs(s)<1e-9?'The sine crosses the floor there, and that is exactly where its bend changes.':s>0?'The sine is above the floor, so it bends down.':'The sine is below the floor, so it bends up.')}; }
    const [e,right,W,why]=[['sin '+a+'x',a+' cos '+a+'x',['cos '+a+'x',a+' cos x','−'+a+' cos '+a+'x',a+' sin '+a+'x'],'Trig-chain: cos of the inside, times the slope of the inside, '+a+'.'],
      ['cos '+a+'x','−'+a+' sin '+a+'x',[a+' sin '+a+'x','−sin '+a+'x','−'+a+' cos '+a+'x','−'+a+' sin x'],'Trig-chain: −sin of the inside, times the slope of the inside, '+a+'.'],
      ['sin('+xn+')',n+xm+' cos('+xn+')',['cos('+xn+')','cos('+n+xm+')',n+xm+' sin('+xn+')','−'+n+xm+' cos('+xn+')'],'Trig-chain: cos of the inside, which stays as it is, times the slope of the inside, '+n+xm+'.'],
      ['sin'+p(n)+' x',n+' sin'+p(n-1)+' x cos x',['cos'+p(n)+' x',n+' sin'+p(n-1)+' x',n+' cos'+p(n-1)+' x','−'+n+' sin'+p(n-1)+' x cos x'],'The power is the outside: '+n+' sin'+p(n-1)+' x, times the slope of sin x.'],
      ['cos'+p(n)+' x','−'+n+' cos'+p(n-1)+' x sin x',[n+' cos'+p(n-1)+' x sin x','−sin'+p(n)+' x','−'+n+' cos'+p(n-1)+' x',n+' sin'+p(n-1)+' x cos x'],'The power is the outside: '+n+' cos'+p(n-1)+' x, times the slope of cos x, which is −sin x.'],
      ['tan '+a+'x',a+' sec² '+a+'x',['sec² '+a+'x',a+' sec '+a+'x',a+' sec² x',a+' tan '+a+'x'],'Slope-of-tan with the chain rule: sec² of the inside, times '+a+'.'],
      [a+' sec x',a+' sec x tan x',[a+' sec² x','−'+a+' csc x cot x',a+' tan² x','sec x tan x'],'Trig-quotient: sec′ = sec · tan, and the '+a+' stays in front.'],
      [a+' cot x','−'+a+' csc² x',[a+' csc² x','−'+a+' csc x cot x',a+' sec² x','−'+a+' cot² x'],'Trig-quotient: cot′ = −csc², and the '+a+' stays in front.'],
      ['x'+p(n-1)+' sin x',(n-1===1?'':(n-1)+'x'+p(n-2)+' ')+'sin x + x'+p(n-1)+' cos x',['x'+p(n-1)+' cos x',(n-1===1?'':(n-1)+'x'+p(n-2)+' ')+'cos x',(n-1===1?'':(n-1)+'x'+p(n-2)+' ')+'sin x − x'+p(n-1)+' cos x',(n-1===1?'':(n-1)+'x'+p(n-2)+' ')+'sin x + cos x'],'The product rule: the slope of the first times the second, plus the first times the slope of the second.']][k];
    const wrong=uniq(right,W,3); if(wrong.length<3) return null;
    return {index:'q:21l.slope['+e+']', lines:[['f(x) = '+e,'given']], ask:'What is its slope f′(x)?', right, opts:shuffle([right,...wrong]), lead:'', why}; }});

/* ---------- 21m Running Trig Backwards ---------- */
const M21=[
  ['Is sin⁻¹ x the same as 1 / sin x?','no: 1 / sin x is csc x, and sin⁻¹ means run backwards',['yes','yes, when x is not 0','no: sin⁻¹ x is −sin x'],'The −1 is the mark of the undoing, as in f⁻¹.'],
  ['Is arcsin(sin θ) = θ always?','only when θ is in [−π/2, π/2]',['yes','only when θ is in [0, π]','never'],'Stretch technique: elsewhere it is the one angle in that stretch with the same sine.'],
  ['What is arcsin x + arccos x?','π/2',['π','0','1'],'Complement technique: if θ = arcsin x then cos(π/2 − θ) = x, and π/2 − θ is in [0, π].'],
  ['Which is the slope of arctan at x?','1/(1 + x²)',['1/√(1 − x²)','sec² x','−1/(1 + x²)'],'Backward-slope: 1 over sec² of the angle, and sec² = 1 + tan² = 1 + x².'],
  ['Onto which stretch does arccos send [−1, 1]?','[0, π]',['[−π/2, π/2]','[0, 2π]','(−π/2, π/2)'],'On [0, π] the cosine never repeats a value, and arccos x is the arc L(x) of 21a.']];
QP.push({id:'21m.back',step:'21m',label:'the undoings',open:()=>measured('21m'),make(){ return writtenQ('21m.back',M21); }},
  {id:'21m.value',step:'21m',mode:'work',label:'backwards, worked',open:()=>measured('21m'),make(){
    const k=rnd(3), fn=pick(['sin','cos','tan']), nm='arc'+fn;
    if(k===0){ const j=fn==='cos'?pick([0,2,3,4,6,8,9,10,12]):fn==='tan'?pick([-4,-3,-2,0,2,3,4]):pick([-6,-4,-3,-2,0,2,3,4,6]), x=fn==='cos'?Math.cos(j*Math.PI/12):fn==='tan'?Math.tan(j*Math.PI/12):Math.sin(j*Math.PI/12), v=ex21(x), right=pi21(j,12), wrong=uniq(right,[pi21(12-j,12),pi21(-j,12),pi21(6-j,12),pi21(j+12,12),pi21(j+6,12),pi21(2*j,12),'0'],3); if(wrong.length<3) return null;
      return {index:'q:21m.value[v;'+fn+';'+j+']', lines:[[nm+'('+v+')','to be found exactly']], ask:'Which arc is it?', right, opts:shuffle([right,...wrong]), lead:'', why:nm+' gives the one angle in '+(fn==='cos'?'[0, π]':fn==='tan'?'(−π/2, π/2)':'[−π/2, π/2]')+' whose '+(fn==='cos'?'cosine':fn==='tan'?'tangent':'sine')+' is '+v+': '+right+'.'}; }
    if(k===1){ const t=pick([-10,-9,-8,-4,-3,-2,2,3,4,8,9,10,14,15,16,20,21,22,7*2,26,27,28].concat(fn==='tan'?[]:[6,-6,12,18])), x=fn==='cos'?Math.cos(t*Math.PI/12):fn==='tan'?Math.tan(t*Math.PI/12):Math.sin(t*Math.PI/12), j=back21(fn,x); if(j===null) return null;
      const right=pi21(j,12), wrong=uniq(right,[pi21(t,12),pi21(-j,12),pi21(12-j,12),pi21(t-12,12),pi21(t-24,12),pi21(12-t,12),pi21(j+12,12)],3); if(wrong.length<3) return null;
      return {index:'q:21m.value[s;'+fn+';'+t+']', lines:[[nm+'('+fn+(t<0?'('+pi21(t,12)+')':' '+pi21(t,12))+')','to be found exactly']], ask:'Which arc is it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Stretch technique: '+fn+(t<0?'('+pi21(t,12)+')':' '+pi21(t,12))+' = '+ex21(x)+', and '+nm+' gives the one angle in '+(fn==='cos'?'[0, π]':fn==='tan'?'(−π/2, π/2)':'[−π/2, π/2]')+' with that value: '+right+'.'+(j===t?' Here that is the angle you began with.':'')}; }
    if(fn==='tan'){ const a=rnd(10), s=sn18(), right=fshow(fr(1,1+a*a)), wrong=frs16(right,[fr(1,1+a),fr(1,a*a||2),fint(1+a*a),fr(-1,1+a*a),fr(1,2+a*a),fr(a,1+a*a)]); if(wrong.length<3) return null;
      return {index:'q:21m.value[t;'+s*a+']', lines:[['x = '+sg(s*a),'a number']], ask:'What is the slope of arctan at x?', right, opts:shuffle([right,...wrong]), lead:'', why:'Backward-slope: arctan′ x = 1/(1 + x²) = 1/(1 + '+(a*a)+') = '+right+'.'}; }
    const [a,b,c]=pick(T21), s=sn18(), R=fr(fn==='cos'?-c:c,b), right=fshow(R), wrong=frs16(right,[fneg(R),fr(b,c),fr(c,a),fr(-b,c),fr(c*c,b*b),fr(a,c)]); if(wrong.length<3) return null;
    return {index:'q:21m.value[d;'+fn+';'+[s*a,c].join(';')+']', lines:[['x = '+fshow(fr(s*a,c)),'a number']], ask:'What is the slope of '+nm+' at x?', right, opts:shuffle([right,...wrong]), lead:'', why:'Backward-slope: '+nm+'′ x = '+(fn==='cos'?'−':'')+'1/√(1 − x²). Here 1 − x² = '+fshow(fr(b*b,c*c))+', whose root is '+fshow(fr(b,c))+', so the slope is '+right+'.'}; }},
  {id:'21m.line',step:'21m',mode:'proof',label:'does the undoing give it back',open:()=>measured('21m'),make(){
    const fn=pick(['sin','cos','tan']), t=pick([-12,-10,-9,-8,-4,-3,-2,0,2,3,4,8,9,10,12,14,15,16,20].concat(fn==='tan'?[]:[-6,6,18])), ok=fn==='cos'?(t>=0&&t<=12):fn==='tan'?(t>-6&&t<6):(t>=-6&&t<=6), opts=['it is licensed','it is not licensed'], x=fn==='cos'?Math.cos(t*Math.PI/12):fn==='tan'?Math.tan(t*Math.PI/12):Math.sin(t*Math.PI/12), j=back21(fn,x), st=fn==='cos'?'[0, π]':fn==='tan'?'(−π/2, π/2)':'[−π/2, π/2]';
    return {index:'q:21m.line['+fn+';'+t+']', stack:true, lines:[['θ = '+pi21(t,12),'given'],['arc'+fn+'('+fn+' θ) = θ','the stretch technique']], ask:'Is line 2 licensed?', right:opts[ok?0:1], opts, lead:'', why:ok?pi21(t,12)+' is in '+st+', the stretch that arc'+fn+' gives its answers in.':pi21(t,12)+' is outside '+st+'. arc'+fn+' gives the one angle in that stretch with the same value'+(j===null?'':', which is '+pi21(j,12))+'.'}; }});

/* ---------- 21n Trig Integrals and Substitution; Circle Area ---------- */
const N21=[
  ['Which is ∫ sin x dx?','−cos x + C',['cos x + C','sin x + C','−sin x + C'],'The slope of cos is −sin, so the slope of −cos is sin.'],
  ['Is ∫ sin² x dx = sin³ x / 3 + C?','no: the slope of that is sin² x cos x',['yes, by the power rule','no: it is cos³ x / 3 + C','no: it is 2 sin x cos x + C'],'The chain rule brings out a cos x. For an even power, halve the arc: sin² x = (1 − cos 2x)/2.'],
  ['For ∫ sin³ x dx, what is the first move?','keep one sin x, and turn sin² x into 1 − cos² x',['halve the arc','divide by 4','put x = tan θ'],'Odd-or-even: for an odd power keep one factor, and turn the rest into the other coordinate.'],
  ['What is the area of the disc of radius r?','πr²',['2πr','πr','4πr²'],'Disc technique: four quarters, each ∫₀ʳ √(r² − x²) dx, found by putting x = r sin θ.'],
  ['Which is ∫ dx/(a² + x²)?','(1/a) arctan(x/a) + C',['arctan(x/a) + C','(1/a) arcsin(x/a) + C','ln(a² + x²) + C'],'Tan-trade: with x = a tan θ, a² + x² becomes a² sec² θ and dx becomes a sec² θ dθ.']];
const SIN21=[[0,0],[2,1],[6,2],[10,1],[12,0],[18,-2],[24,0]], COS21=[[0,2],[4,1],[6,0],[8,-1],[12,-2],[16,-1],[18,0],[20,1],[24,2]];
QP.push({id:'21n.read',step:'21n',label:'slopes read backwards',open:()=>measured('21n'),make(){ return writtenQ('21n.read',N21); }},
  {id:'21n.area',step:'21n',mode:'work',label:'areas under waves',open:()=>measured('21n'),make(){
    const k=rnd(5), m=1+rnd(6), ms=m===1?'':m+' ';
    if(k===0||k===1){ const T=k===0?SIN21:COS21, i=rnd(T.length-1), j=i+1+rnd(T.length-1-i), [a,va]=T[i], [b,vb]=T[j], R=fr(m*(k===0?vb-va:va-vb),2), right=fshow(R), wrong=frs16(right,[fneg(R),fr(m*(vb+va),2),fr(k===0?vb-va:va-vb,2),fint(m),fint(0),fr(m,2),fint(2*m),fint(-m)]); if(wrong.length<3) return null;
      return {index:'q:21n.area['+[k,m,a,b].join(';')+']', lines:[['∫ '+ms+(k===0?'cos':'sin')+' x dx, from x = '+pi21(a,12)+' to x = '+pi21(b,12),'to be found']], ask:'What is it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Trig-area: '+(k===0?'∫ cos = sin, so it is '+ms+'(sin '+pi21(b,12)+' − sin '+pi21(a,12)+') = '+ms+'('+fshow(fr(vb,2))+' − '+par10s21(fr(va,2))+')':'∫ sin = −cos, so it is '+ms+'(cos '+pi21(a,12)+' − cos '+pi21(b,12)+') = '+ms+'('+fshow(fr(va,2))+' − '+par10s21(fr(vb,2))+')')+' = '+right+'.'}; }
    if(k===2){ const a=1+rnd(8), [e,R,why]=pick([['∫ '+ms+'dx/(1 + x²), from x = 0 to x = 1',fr(m,4),'Trig-area: ∫ 1/(1 + x²) = arctan, and arctan 1 − arctan 0 = π/4.'],['∫ dx/('+(a*a)+' + x²), from x = 0 to x = '+a,fr(1,4*a),'Tan-trade: (1/a) arctan(x/a), with a = '+a+'. (1/'+a+')(arctan 1 − arctan 0) = (1/'+a+') · π/4.'],['∫ dx/('+(a*a)+' + x²), from x = −'+a+' to x = '+a,fr(1,2*a),'Tan-trade: (1/a) arctan(x/a), with a = '+a+'. (1/'+a+')(π/4 − (−π/4)).'],['∫ '+ms+'dx/√(1 − x²), from x = 0 to x = 1/2',fr(m,6),'Trig-area: ∫ 1/√(1 − x²) = arcsin, and arcsin(1/2) − arcsin 0 = π/6.'],['∫ dx/√('+(4*a*a)+' − x²), from x = 0 to x = '+a,fr(1,6),'With x = '+(2*a)+' sin θ it is arcsin(x/'+(2*a)+'), and arcsin(1/2) − arcsin 0 = π/6.']]), right=fpi21(R), wrong=uniq(right,[fpi21(fmul(R,fint(2))),fpi21(fmul(R,fr(1,2))),fpi21(fr(1,4)),fpi21(fr(m,2)),fpi21(fr(1,6)),fpi21(fr(a,4)),fshow(R)],3); if(wrong.length<3) return null;
      return {index:'q:21n.area[t;'+e+']', lines:[[e,'to be found']], ask:'What is it?', right, opts:shuffle([right,...wrong]), lead:'', why:why+' So it is '+right+'.'}; }
    if(k===3){ const r=1+rnd(9), [e,R]=pick([['the disc of radius '+r,fint(r*r)],['half of the disc of radius '+r,fr(r*r,2)],['∫ √('+(r*r)+' − x²) dx, from x = 0 to x = '+r,fr(r*r,4)],['∫ √('+(r*r)+' − x²) dx, from x = −'+r+' to x = '+r,fr(r*r,2)]]), right=fpi21(R), wrong=uniq(right,[fpi21(fint(2*r)),fpi21(fint(r)),fpi21(fr(r*r,4)),fpi21(fr(r*r,2)),fpi21(fint(r*r)),fpi21(fr(r,2)),fpi21(fint(2*r*r))],3);
      return {index:'q:21n.area[d;'+e+']', lines:[[e,e[0]==='∫'?'to be found':'a region']], ask:e[0]==='∫'?'What is it?':'What is its area?', right, opts:shuffle([right,...wrong]), lead:'', why:'Disc technique: the disc of radius r has the area πr², here '+fpi21(fint(r*r))+'.'+(e[0]==='∫'?' The graph of √(r² − x²) is the upper half circle, so the integral is '+(e.indexOf('−'+r)>0?'half':'a quarter')+' of the disc.':'')}; }
    const [fnm,a,b,R]=pick([['sin',0,12,fr(m,2)],['cos',0,24,fint(m)],['sin',0,6,fr(m,4)],['cos',0,12,fr(m,2)],['sin',0,24,fint(m)],['cos',0,6,fr(m,4)]]), right=fpi21(R), wrong=uniq(right,[fpi21(fmul(R,fint(2))),fpi21(fmul(R,fr(1,2))),fshow(R),'0',fpi21(fint(2*m)),fpi21(fr(m,3))],3); if(wrong.length<3) return null;
    return {index:'q:21n.area[e;'+[fnm,m,b].join(';')+']', lines:[['∫ '+ms+fnm+'² x dx, from x = 0 to x = '+pi21(b,12),'to be found']], ask:'What is it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Odd-or-even: an even power, so halve the arc. '+fnm+'² x = (1 '+(fnm==='sin'?'−':'+')+' cos 2x)/2. The cos 2x part adds up to 0 over this stretch, which leaves '+ms+'· ½ · '+pi21(b,12)+' = '+right+'.'}; }});

/* ---------- 21o Adding up Slices ---------- */
const O21=[
  ['Spin the region under y = f(x) ≥ 0 about the floor. Which is the volume?','∫ₐᵇ π f(x)² dx',['∫ₐᵇ π f(x) dx','∫ₐᵇ 2π f(x) dx','π(∫ₐᵇ f(x) dx)²'],'Disc-stack: the slice at x is a disc of radius f(x), with the area π f(x)².'],
  ['Spin the region between y = f(x) and y = g(x), with f ≥ g ≥ 0. What is the area of the slice at x?','π(f(x)² − g(x)²)',['π(f(x) − g(x))²','π(f(x) − g(x))','π(f(x)² + g(x)²)'],'Washer: a disc with a smaller disc taken out. The hole comes out of the disc, not out of the radius.'],
  ['What share of the can that just holds it does a ball fill?','two thirds',['one half','one third','three quarters'],'Ball technique: (4/3)πr³ out of πr² · 2r = 2πr³.'],
  ['What is the area of the sphere of radius r?','4πr²',['2πr²','πr²','(4/3)πr²'],'Skin technique: four times the disc through its centre.'],
  ['How is the sphere’s area got from the ball’s volume?','as its slope when the radius grows: S(r) = V′(r)',['by dividing by r','by multiplying by r','by taking a root'],'A ball grown from r to r + h gains a skin of thickness h. ((4/3)πr³)′ = 4πr².']];
QP.push({id:'21o.slice',step:'21o',label:'discs, washers, the ball',open:()=>measured('21o'),make(){ return writtenQ('21o.slice',O21); }},
  {id:'21o.spin',step:'21o',mode:'work',label:'volumes by slices',open:()=>measured('21o'),make(){
    const k=rnd(6), r=1+rnd(6), b=1+rnd(6), m=1+rnd(4), f=F=>fpi21(F);
    const [given,ask,R,W,why]=k===0?[['a ball of radius '+r,'given'],'What is its volume?',fr(4*r*r*r,3),[fint(4*r*r*r),fr(4*r*r,3),fint(4*r*r),fr(2*r*r*r,3),fint(r*r*r),fr(4*r*r*r,9)],'Ball technique: (4/3)πr³ = (4/3)π · '+(r*r*r)+'.']
      :k===1?[['a sphere of radius '+r,'given'],'What is its area?',fint(4*r*r),[fint(2*r*r),fint(r*r),fr(4*r*r,3),fint(4*r),fint(8*r*r),fr(4*r*r*r,3)],'Skin technique: 4πr² = 4π · '+(r*r)+'.']
      :k===2?[['the region under y = '+(m===1?'':m)+'x, from x = 0 to x = '+b,'spun about the floor'],'What is the volume of the solid?',fr(m*m*b*b*b,3),[fr(m*b*b,2),fr(m*m*b*b*b,2),fint(m*m*b*b*b),fr(m*b*b*b,3),fr(m*m*b*b,3),fint(m*m*b*b)],'Disc-stack: ∫ π('+(m===1?'':m)+'x)² dx from 0 to '+b+' = π · '+(m*m)+' · '+b+'³/3.']
      :k===3?[['the region under y = √'+(m===1?'x':'('+m+'x)')+', from x = 0 to x = '+b,'spun about the floor'],'What is the volume of the solid?',fr(m*b*b,2),[fint(m*b*b),fr(m*b,2),fr(m*m*b*b,2),fr(m*b*b*b,3),fr(m*b*b,4),fint(m*b)],'Disc-stack: the radius squared is '+(m===1?'x':m+'x')+', so it is ∫ π · '+(m===1?'x':m+'x')+' dx from 0 to '+b+' = π · '+(m===1?'':m+' · ')+b+'²/2.']
      :k===4?[['the region under y = '+r+', from x = 0 to x = '+b,'spun about the floor'],'What is the volume of the solid?',fint(r*r*b),[fint(r*b),fint(2*r*b),fint(r*r*b*b),fr(r*r*b,3),fint(r*b*b),fr(r*r*b,2)],'Disc-stack: every slice is a disc of radius '+r+', so it is π · '+(r*r)+' · '+b+', a can.']
      :[['the region between y = '+(r+m)+' and y = '+r+', from x = 0 to x = '+b,'spun about the floor'],'What is the volume of the solid?',fint(((r+m)*(r+m)-r*r)*b),[fint(m*m*b),fint(m*b),fint(((r+m)*(r+m)+r*r)*b),fint((r+m)*(r+m)*b),fr(((r+m)*(r+m)-r*r)*b,2),fint((2*r+m)*b)],'Washer: π('+((r+m)*(r+m))+' − '+(r*r)+') for every slice, times the length '+b+'. π('+(r+m)+' − '+r+')² would take the hole out of the radius.'];
    const right=f(R), wrong=uniq(right,W.map(f),3); if(wrong.length<3) return null;
    return {index:'q:21o.spin['+[k,r,b,m].join(';')+']', lines:[given], ask, right, opts:shuffle([right,...wrong]), lead:'', why:why+' That is '+right+'.'}; }},
  {id:'21o.can',step:'21o',mode:'word',label:'a ball in its can',open:()=>measured('21o'),make(){
    const who=pick(['A rubber ball','A glass ball','A steel ball','A wooden ball']), V=12*(3+rnd(30)), left=Math.random()<0.4, right=(left?V/3:2*V/3)+' millilitres', wrong=uniq(right,[left?2*V/3:V/3,V/2,V,3*V/4,V/6].filter(v=>v===Math.floor(v)).map(v=>v+' millilitres'),3); if(wrong.length<3) return null;
    return {index:'q:21o.can['+[who,V,left?1:0].join(';')+']', a3:['21o.can',DASH,DASH], story:who+' just fits its can: it touches the wall all the way round, the bottom and the lid. Empty, the can holds '+V+' millilitres.', lines:[], ask:left?'How much room is left in the can around the ball?':'How much room does the ball take up?', right, opts:shuffle([right,...wrong]), lead:'', why:'Ball technique: the ball is two thirds of the can that just holds it. Two thirds of '+V+' is '+(2*V/3)+(left?', which leaves '+(V/3):'')+'.'}; }});

/* ---------- 21p Related Rates ---------- */
const P21=[
  ['At the instant, x = 3. May you put x = 3 in first and take the slope afterwards?','no: a fixed number has the slope 0, so take slopes first',['yes','yes, if x′ is known','no: the instant may never be put in'],'Tied-rates: put in the numbers for the instant only after the slopes are taken.'],
  ['In which unit do angle rates come out?','radians per unit of time',['degrees per unit of time','whole turns per unit of time','they have no unit'],'The slopes of sin, cos and tan are as 21g found them only with the angle as an arc.'],
  ['A rate comes out endless. What does that say?','the tie it came from has stopped holding before that instant',['the slopes were taken wrongly','the thing moves endlessly fast','nothing can be said'],'Broken-tie: the equations are right, and the picture they describe has ended.'],
  ['x and y stay tied by x² + y² = L², with L fixed. Which line ties their rates?','2x x′ + 2y y′ = 0',['x′ + y′ = 0','2x + 2y = 0','x′² + y′² = L²'],'Take the slope in t of both sides. The chain rule brings out x′ and y′, and the fixed L² has the slope 0.']];
QP.push({id:'21p.tie',step:'21p',label:'the slope of a tie',open:()=>measured('21p'),make(){ return writtenQ('21p.tie',P21); }},
  {id:'21p.rates',step:'21p',mode:'work',label:'tied rates, worked',open:()=>measured('21p'),make(){
    const k=rnd(5), r=1+rnd(9), v=1+rnd(6), [a,b,c]=pick(TRI18);
    if(k===0){ const s=sn18(), R=fr(-a*s*v,b), right=fshow(R), wrong=frs16(right,[fneg(R),fr(-b*s*v,a),fint(-s*v),fr(-a*s*v,c),fint(s*v),fr(a*s*v,c),fr(b*s*v,a)]); if(wrong.length<3) return null;
      return {index:'q:21p.rates[l;'+[a,b,s*v].join(';')+']', lines:[['x² + y² = '+(c*c)+' at every time t','the tie'],['at one instant x = '+a+', y = '+b+' and x′ = '+sg(s*v),'given']], ask:'What is y′ at that instant?', right, opts:shuffle([right,...wrong]), lead:'', why:'Tied-rates: 2x x′ + 2y y′ = 0, so y′ = −x x′ / y = −'+a+' · '+par10(s*v)+' / '+b+' = '+right+'.'}; }
    if(k===1||k===2){ const R=fint(k===1?2*r*v:4*r*r*v), right=fpi21(R), wrong=uniq(right,[fpi21(fint(k===1?r*r*v:4*r*r*r*v)),fpi21(fint(k===1?2*r:4*r*r)),fpi21(fint(k===1?r*v:r*r*v)),fpi21(fint(k===1?4*r*v:8*r*v)),fpi21(fint(k===1?2*v:4*v)),fpi21(fr(4*r*r*r*v,3))],3); if(wrong.length<3) return null;
      return {index:'q:21p.rates['+[k,r,v].join(';')+']', lines:[[k===1?'a disc whose radius r grows: A = πr²':'a ball whose radius r grows: V = (4/3)πr³','the tie'],['at one instant r = '+r+' and r′ = '+v,'given']], ask:k===1?'What is A′ at that instant?':'What is V′ at that instant?', right, opts:shuffle([right,...wrong]), lead:'', why:'Take the slope of the tie in t: '+(k===1?'A′ = 2πr r′ = 2π · '+r+' · '+v:'V′ = 4πr² r′ = 4π · '+(r*r)+' · '+v)+' = '+right+'.'}; }
    if(k===3){ const cube=Math.random()<0.5, right=String(cube?3*r*r*v:2*r*v), wrong=uniq(right,[cube?r*r*r*v:r*r*v,cube?3*r*r:2*r,cube?3*r*v:r*v,cube?2*r*v:4*r*v,cube?3*r*r*v+v:2*r*v+v,v].map(String),3); if(wrong.length<3) return null;
      return {index:'q:21p.rates[q;'+[cube?3:2,r,v].join(';')+']', lines:[[cube?'a cube whose side s grows: V = s³':'a square whose side s grows: A = s²','the tie'],['at one instant s = '+r+' and s′ = '+v,'given']], ask:cube?'What is V′ at that instant?':'What is A′ at that instant?', right, opts:shuffle([right,...wrong]), lead:'', why:'Take the slope of the tie in t: '+(cube?'V′ = 3s² s′ = 3 · '+(r*r)+' · '+v:'A′ = 2s s′ = 2 · '+r+' · '+v)+' = '+right+'.'}; }
    const x=1+rnd(8), y=1+rnd(8), s=sn18(), R=fr(-y*s*v,x), right=fshow(R), wrong=frs16(right,[fneg(R),fr(-x*s*v,y),fint(-s*v),fint(s*v),fr(x*s*v,y),fint(-x*y*s*v)]); if(wrong.length<3) return null;
    return {index:'q:21p.rates[p;'+[x,y,s*v].join(';')+']', lines:[['xy = '+(x*y)+' at every time t','the tie'],['at one instant x = '+x+', y = '+y+' and x′ = '+sg(s*v),'given']], ask:'What is y′ at that instant?', right, opts:shuffle([right,...wrong]), lead:'', why:'Tied-rates, with the product rule: x′y + xy′ = 0, so y′ = −y x′ / x = −'+y+' · '+par10(s*v)+' / '+x+' = '+right+'.'}; }},
  {id:'21p.ladder',step:'21p',mode:'word',label:'the sliding ladder',open:()=>measured('21p'),make(){
    const who=pick(['A ladder','A plank','A pole','A beam']), [a,b,c]=pick(TRI18), v=1+rnd(4), R=fr(a*v,b), u=F=>fshow(F)+(fshow(F)==='1'?' metre a second':' metres a second'), right=u(R), wrong=uniq(right,[fr(b*v,a),fint(v),fr(a*v,c),fr(c*v,b),fr(b*v,c),fint(2*v)].map(u),3); if(wrong.length<3) return null;
    return {index:'q:21p.ladder['+[who,a,b,v].join(';')+']', a3:['21p.ladder',DASH,DASH], story:who+' '+c+' metres long leans against an upright wall. Its foot slides away from the wall at '+v+' metre'+(v===1?'':'s')+' a second.', lines:[], ask:'How fast is its top coming down the wall when the foot is '+a+' metres from the wall?', right, opts:shuffle([right,...wrong]), lead:'',
      why:'The tie is x² + y² = '+(c*c)+', so 2x x′ + 2y y′ = 0. With the foot at x = '+a+' the top is at y = '+b+', and y′ = −x x′ / y = −'+a+' · '+v+' / '+b+'. The top comes down at '+fshow(R)+'.'}; }});

/* ---------- 21q Angles Standing on Arcs ---------- */
const Q21=[
  ['How does the rim angle APB compare with the centre angle AOB on the same arc?','it is half of it',['it is equal to it','it is twice it','it is π minus it'],'Rim-half-centre: the radii OA, OB and OP make triangles with two equal sides.'],
  ['An angle stands on a half circle, with its corner on the rim. What is it?','a right angle',['π/3','π','it depends on where the corner is'],'Same-arc: the centre angle is the half turn π, and the rim angle is half of that.'],
  ['Are all rim angles standing on one chord AB equal?','only from one side: from the other side each is π minus that',['yes, from anywhere on the rim','no two of them are','no: each depends on how far its corner is from A'],'Same-arc. The two sides stand on the two arcs that AB cuts, and their centre angles add to 2π.'],
  ['A, B, C, D lie in that order round a circle. What do the angles at A and C add to?','π',['2π','π/2','it depends on the four points'],'Four-on-a-circle: the two rim angles stand on the two arcs BCD and DAB, which together are the whole circle.'],
  ['How is a triangle’s area tied to the radius r of the circle inside it?','the area is r times half the perimeter',['the area is r times the perimeter','the area is πr²','the area is r² times half the perimeter'],'Incircle: cut the triangle from the centre I into three triangles, each of height r on one side.']];
const IN21=[[3,4,5,1],[5,12,13,2],[6,8,10,2],[8,15,17,3],[7,24,25,3],[9,12,15,3],[13,14,15,4],[10,24,26,4],[12,16,20,4],[9,40,41,4],[15,20,25,5],[5,5,6,'3/2'],[5,5,8,'4/3'],[10,10,12,3],[13,13,10,'10/3'],[13,13,24,'12/5']];
QP.push({id:'21q.rim',step:'21q',label:'rim and centre',open:()=>measured('21q'),make(){ return writtenQ('21q.rim',Q21); }},
  {id:'21q.arcs',step:'21q',mode:'work',label:'angles on arcs, worked',open:()=>measured('21q'),make(){
    const k=rnd(5), [p,q]=pick(FR21), f=(n,d)=>pi21(n,d);
    if(k===0||k===1){ const right=k===0?f(p,2*q):f(2*p,q), wrong=uniq(right,[f(p,q),k===0?f(2*p,q):f(p,2*q),f(q-p,q),f(2*q-p,2*q),f(p,4*q),f(4*p,q)],3); if(wrong.length<3||(k===1&&2*p>=q)) return null;
      return {index:'q:21q.arcs['+[k,p,q].join(';')+']', lines:[[k===0?'the angle AOB at the centre O is '+f(p,q):'the rim angle APB is '+f(p,q),'given'],['P is on the rim, on the far side of AB from the short arc','given']], ask:k===0?'What is the rim angle APB?':'What is the angle AOB at the centre?', right, opts:shuffle([right,...wrong]), lead:'', why:'Rim-half-centre: the angle at the rim is half the angle at the centre on the same arc.'}; }
    if(k===2||k===4){ const right=k===2?f(q-p,q):(Math.random()<0.5?f(p,q):f(q-p,q)), same=right===f(p,q), wrong=uniq(right,[f(p,q),f(q-p,q),f(p,2*q),f(2*q-p,q),f(q-2*p,2*q),f(2*p,q),f(1,2)],3); if(wrong.length<3||(k===4&&2*p===q)) return null;
      return {index:'q:21q.arcs['+[k,p,q,same?1:0].join(';')+']', lines:k===2?[['A, B, C, D lie in that order round a circle','given'],['the angle at A is '+f(p,q),'given']]:[['the rim angle APB is '+f(p,q),'given'],['Q is on the rim, on '+(same?'the same side of AB as P':'the other side of AB from P'),'given']], ask:k===2?'What is the angle at C?':'What is the rim angle AQB?', right, opts:shuffle([right,...wrong]), lead:'', why:k===2?'Four-on-a-circle: the angles at A and C add to π. π − '+f(p,q)+' = '+right+'.':same?'Same-arc: rim angles standing on one arc from the same side are equal.':'From the other side the rim angle stands on the other arc: π − '+f(p,q)+' = '+right+'.'}; }
    const [a,b,c,r]=pick(IN21), right=String(r), s=(a+b+c)/2, wrong=uniq(right,['1','2','3','4','5','3/2','5/2',String(s)],3);
    return {index:'q:21q.arcs[i;'+[a,b,c].join(';')+']', lines:[['a triangle with the sides '+a+', '+b+' and '+c,'given'],['its area is '+fshow(fmul(typeof r==='number'?fint(r):fr(+r.split('/')[0],+r.split('/')[1]),fint(s))),'given']], ask:'What is the radius of the circle inside it that touches all three sides?', right, opts:shuffle([right,...wrong]), lead:'', why:'Incircle: the area is r times half the perimeter. Half the perimeter is '+s+', so r = area / '+s+' = '+right+'.'}; }},
  {id:'21q.line',step:'21q',mode:'proof',label:'four corners on a circle',open:()=>measured('21q'),make(){
    const [p,q]=pick(FR21), k=rnd(4), opts=['it is licensed','it is not licensed'], f=(n,d)=>pi21(n,d), [X,val,ok,why]=k===0?['C',f(q-p,q),1,'The angles at A and C add to π: π − '+f(p,q)+' = '+f(q-p,q)+'.']:k===1?['C',f(p,q),2*p===q?1:0,'The angles at A and C add to π, so the angle at C is '+f(q-p,q)+'. Facing angles are equal only when both are right angles.']:k===2?[pick(['B','D']),f(q-p,q),0,'Four-on-a-circle ties A to C, and B to D. It says nothing about the angle next to A.']:['C',f(2*q-p,q),0,'The angles at A and C add to π, not to 2π: the angle at C is '+f(q-p,q)+'.'];
    return {index:'q:21q.line['+[k,p,q,X].join(';')+']', stack:true, lines:[['A, B, C, D lie in that order round a circle','given'],['the angle at A is '+f(p,q),'given'],['the angle at '+X+' is '+val,'four-on-a-circle']], ask:'Is line 3 licensed?', right:opts[ok?0:1], opts, lead:'', why}; }});

/* ---------- 21r Curves by Turning and Reach ---------- */
const R21=[
  ['Is the turn of a point always θ = arctan(y/x)?','no: add π when x < 0, as (−3, −3) is not at π/4',['yes','no: it is arctan(x/y)','yes, when y is not 0'],'arctan gives angles in (−π/2, π/2) only, on the right of the upright axis.'],
  ['Which is the area swept by the reach r = f(θ) as the turn runs from α to β?','½∫ f(θ)² dθ',['∫ f(θ) dθ','∫ f(θ)² dθ','½∫ f(θ) dθ'],'Swept-area: each thin turn dθ sweeps a sliver of a disc of radius f(θ), with the area ½ f(θ)² dθ.'],
  ['To compare r = f(θ) with an across-and-up equation, what do you put?','r² = x² + y², r cos θ = x and r sin θ = y',['r = x + y','r = x and θ = y','r² = x² − y²'],'Polar-graph: multiply through by r first, so that these three appear.'],
  ['What does a negative reach r mean?','it reaches backwards',['nothing: r cannot be negative','the point is below the floor','the turn is clockwise'],'(r cos θ, r sin θ) with r < 0 is the point |r| away in the opposite direction.'],
  ['Which point has the reach r and the turn θ?','(r cos θ, r sin θ)',['(r sin θ, r cos θ)','(r + cos θ, r + sin θ)','(θ cos r, θ sin r)'],'The point of the circle of radius 1 at θ, pulled out by r.']];
QP.push({id:'21r.reach',step:'21r',label:'turn and reach',open:()=>measured('21r'),make(){ return writtenQ('21r.reach',R21); }},
  {id:'21r.polar',step:'21r',mode:'work',label:'turn and reach, worked',open:()=>measured('21r'),make(){
    const k=rnd(5), r=2*(1+rnd(6)), t=pick(ARC21), P=(u,v)=>'('+u+', '+v+')', c=1+rnd(9);
    if(k===0){ const X=smul21(r,cos21(t)), Y=smul21(r,sin21(t)), ng=s=>s==='0'?'0':s[0]==='−'?s.slice(1):'−'+s, right=P(X,Y), wrong=uniq(right,[P(Y,X),P(ng(X),Y),P(X,ng(Y)),P(ng(X),ng(Y)),P(ng(Y),X),P(String(r),pi21(t,12))],3); if(wrong.length<3) return null;
      return {index:'q:21r.polar[x;'+r+';'+t+']', lines:[['the point with the reach r = '+r+' and the turn θ = '+pi21(t,12),'given']], ask:'Which point is it, across and up?', right, opts:shuffle([right,...wrong]), lead:'', why:'(r cos θ, r sin θ) = ('+r+' · '+par21(cos21(t))+', '+r+' · '+par21(sin21(t))+') = '+right+'.'}; }
    if(k===1){ const diag=Math.random()<0.4, [a,b,h]=pick(TRI18), s1=sn18(), s2=sn18(), right=diag?rt21(c,2):String(h), wrong=uniq(right,diag?[String(c),String(2*c),rt21(c,3),String(c*c),rt21(2*c,2)]:[a+b,h*h,h+1,Math.abs(a-b),h-1].map(String),3); if(wrong.length<3) return null;
      return {index:'q:21r.polar[r;'+(diag?[s1*c,s2*c]:[s1*a,s2*b]).join(';')+']', lines:[['the point '+(diag?pt18(s1*c,s2*c):pt18(s1*a,s2*b)),'given']], ask:'What is its reach?', right, opts:shuffle([right,...wrong]), lead:'', why:'Turn-and-reach: r = √(x² + y²) = √('+(diag?c*c+' + '+c*c:a*a+' + '+b*b)+') = '+right+'.'}; }
    if(k===2){ const [pt,tt]=pick([[[c,c],3],[[-c,c],9],[[-c,-c],15],[[c,-c],21],[[0,c],6],[[-c,0],12],[[0,-c],18]]), right=pi21(tt,12), wrong=uniq(right,[3,9,15,21,6,12,18].map(v=>pi21(v,12)).sort(()=>Math.random()-0.5),3);
      return {index:'q:21r.polar[t;'+pt.join(';')+']', lines:[['the point '+pt18(pt[0],pt[1]),'given']], ask:'What is its turn, between 0 and 2π?', right, opts:shuffle([right,...wrong]), lead:'', why:'Turn-and-reach: cos θ = x/r and sin θ = y/r. The point lies '+(pt[0]===0||pt[1]===0?'on an axis':'on a diagonal, in the quarter where x is '+(pt[0]>0?'positive':'negative')+' and y is '+(pt[1]>0?'positive':'negative'))+', at '+right+'.'}; }
    if(k===3){ const [e,right]=pick([['r = '+c,'x² + y² = '+(c*c)],['r cos θ = '+c,'x = '+c],['r sin θ = '+c,'y = '+c],['r = '+(2*c)+' cos θ','x² + y² = '+(2*c)+'x'],['r = '+(2*c)+' sin θ','x² + y² = '+(2*c)+'y']]), wrong=uniq(right,['x² + y² = '+(c*c),'x = '+c,'y = '+c,'x² + y² = '+(2*c)+'x','x² + y² = '+(2*c)+'y','x² + y² = '+c,'x + y = '+c],3);
      return {index:'q:21r.polar[e;'+e+']', lines:[[e,'a curve by turn and reach']], ask:'Which across-and-up equation has the same curve?', right, opts:shuffle([right,...wrong]), lead:'', why:'Polar-graph: '+(e.indexOf('θ')<0?'square both sides, and r² = x² + y².':e[1]===' '&&e[2]==='='?'multiply through by r: r² = '+(2*c)+' r '+(e.indexOf('cos')>0?'cos θ, and put r² = x² + y² and r cos θ = x.':'sin θ, and put r² = x² + y² and r sin θ = y.'):(e.indexOf('cos')>0?'r cos θ is x.':'r sin θ is y.'))}; }
    const [p,q]=pick(FR21.concat([[1,2],[1,1],[3,2],[2,1]])), circ=Math.random()<0.3, R=circ?fint(c*c):fr(c*c*p,2*q), right=fpi21(R), wrong=uniq(right,[fpi21(fr(c*p,q)),fpi21(fr(c*c*p,q)),fpi21(fr(c*p,2*q)),fpi21(fint(2*c*c)),fpi21(fint(4*c*c)),fpi21(fr(c*c,2)),fpi21(fint(c*c))],3); if(wrong.length<3) return null;
    return {index:'q:21r.polar[a;'+[c,p,q,circ?1:0].join(';')+']', lines:[[circ?'r = '+(2*c)+' cos θ, as θ runs from −π/2 to π/2':'r = '+c+', as θ runs from 0 to '+pi21(p,q),'a reach that turns']], ask:'What area does it sweep?', right, opts:shuffle([right,...wrong]), lead:'', why:circ?'The curve is the circle x² + y² = '+(2*c)+'x, of radius '+c+' about ('+c+', 0), traced once: the disc technique gives π · '+(c*c)+'. Swept-area agrees: ½∫ '+(4*c*c)+' cos² θ dθ over a half turn is ½ · '+(4*c*c)+' · π/2.':'Swept-area: ½∫ '+c+'² dθ from 0 to '+pi21(p,q)+' = ½ · '+(c*c)+' · '+pi21(p,q)+' = '+right+'.'}; }});
function par21(s){ return s[0]==='−'?'('+s+')':s; }

/* ===== Laundry 5, rung 22 (floor 4 pools, stage U), part 1: 22a to 22f ===== */
Object.assign(STEPS,{'22a':['r22a','A Climb Under a Ceiling Arrives'],'22b':['r22b','Every Bounded Sequence Has a Settling Thread'],'22c':['r22c','Settling Without Knowing Where'],'22d':['r22d','A Sum Is Where Its Partial Sums Settle'],'22e':['r22e','Compare With a Geometric Sum'],'22f':['r22f','Sums Against Areas'],'22g':['r22g','Signs That Alternate, and Sums That Can Be Rearranged'],'22h':['r22h','Sequences by Hand'],'22i':['r22i','Testing Sums by Hand'],'22j':['r22j','From Counting to Rare Events'],'22k':['r22k','How Fast Things Grow'],'22l':['r22l','Splitting the Work, Counted']});
const YN22=['it is licensed','it is not licensed'], WAND22='it wanders', R22=[[1,2],[1,3],[2,3],[1,4],[3,4],[1,5],[2,5],[3,5]];
const cf22=(c,x)=>c===1?x:c===-1?'−'+x:sg(c)+x, fpar22=F=>F.q===1&&F.p>=0?fshow(F):'('+fshow(F)+')';

/* ---------- 22a A Climb Under a Ceiling Arrives ---------- */
const A22=[
  ['Every term of a sequence lies between −1 and 1. Must it settle?','no: (−1)ⁿ is kept between −1 and 1 and wanders',['yes, by the climb technique','yes: at 1, its ceiling','yes: at 0, half way between'],'The climb technique asks for a sequence that climbs and has a ceiling. Being kept in is not enough: it must also climb or fall.'],
  ['A sequence climbs. Must it settle?','no: sₙ = n climbs and passes every ceiling',['yes, by the climb technique','yes: at its least upper bound','no: no sequence that climbs settles'],'The climb technique asks for a ceiling as well.'],
  ['A sequence climbs, and 5 is a ceiling for it. Where does it settle?','at its least upper bound, which is 5 or less',['at 5','at its first term','it need not settle'],'It settles at the least ceiling, not at any ceiling: 1 − 1/n has the ceiling 5 and settles at 1.'],
  ['sₙ₊₁ = 2sₙ and s₁ = 1. Solving L = 2L gives L = 0. Does the sequence settle at 0?','no: it wanders; solve L = g(L) only after proving it settles',['yes, by the fixed-point technique','yes: 0 is the only L with L = 2L','no: it settles at 1'],'The fixed-point technique starts “if the sequence settles”. From s₁ = 1 the terms are 1, 2, 4, 8, … and pass every ceiling.'],
  ['The decimal of √2 cut after n places climbs, and 2 is a ceiling. Does it head to any fraction?','no: its least upper bound is √2, which is no fraction',['yes: to 2','yes: to 1.5','no: among the fractions it has no ceiling'],'The climb technique spends the least upper bound. On the fractions alone there may be none, so the technique needs the line with no holes.']];
QP.push({id:'22a.climb',step:'22a',label:'climbs and ceilings',open:()=>measured('22a'),make(){ return writtenQ('22a.climb',A22); }},
  {id:'22a.fixed',step:'22a',mode:'work',label:'where a rule settles',open:()=>measured('22a'),make(){
    const k=rnd(4);
    if(k===0){ const [p,q]=pick(R22), b=1+rnd(6), a=fr(p,q), L=fr(b*q,q-p), up=Math.random()<0.5, s1=up?0:Math.ceil(L.p/L.q)+1+rnd(4), right=fshow(L), wrong=frs16(right,[fint(b),fr(b*q,p),fr(b*q,q+p),fint(s1),fr(b*p,q),fr(b*q,q-p+1)]); if(wrong.length<3||right===String(s1)) return null;
      return {index:'q:22a.fixed[l;'+[p,q,b,s1].join(';')+']', lines:[['s₁ = '+s1,'the start'],['sₙ₊₁ = ('+p+'/'+q+')sₙ + '+b,'the rule'],['the sequence '+(up?'climbs and has a ceiling':'falls and has a floor'),'proved by induction'],['the sequence settles',up?'the climb technique':'the fall technique']], ask:'What is its limit?', right, opts:shuffle([right,...wrong]), lead:'', why:'Fixed-point technique: it settles, and the rule is continuous, so L = ('+p+'/'+q+')L + '+b+'. Then ('+(q-p)+'/'+q+')L = '+b+', and L = '+right+'.'}; }
    if(k===1){ const m=2+rnd(5), c=m*(m-1), right=String(m), wrong=uniq(right,[sg(-(m-1)),String(c),'√'+c,String(m-1),String(m+1),m+' and '+sg(-(m-1))],3);
      return {index:'q:22a.fixed[r;'+m+']', lines:[['s₁ = 1','the start'],['sₙ₊₁ = √('+c+' + sₙ)','the rule'],['the sequence climbs, and '+m+' is a ceiling','proved by induction'],['the sequence settles','the climb technique']], ask:'What is its limit?', right, opts:shuffle([right,...wrong]), lead:'', why:'Fixed-point technique: L = √('+c+' + L), so L² − L − '+c+' = 0, and L is '+m+' or '+sg(-(m-1))+'. Every term is positive, so L = '+m+'.'}; }
    if(k===2){ const a=1+rnd(9), b=1+rnd(6), sq=Math.random()<0.5, right=String(a), wrong=uniq(right,[sg(a-b),String(a+b),String(b),'it has none',String(a+1),'0'],3);
      return {index:'q:22a.fixed[c;'+[a,b,sq?2:1].join(';')+']', lines:[['sₙ = '+a+' − '+b+'/n'+(sq?'²':''),'a sequence that climbs']], ask:'What is its least ceiling?', right, opts:shuffle([right,...wrong]), lead:'', why:'Every term is under '+a+', and the terms come as near '+a+' as you like, so no number under '+a+' is a ceiling. By the climb technique the sequence settles there. '+(a+1)+' is a ceiling too, but not the least.'}; }
    const right=pick(['1 − 1/n','n/(n + 1)','2 − 1/2ⁿ','3 − 1/n²','(2n − 1)/n']), wrong=take(['n²','(−1)ⁿ','(−1)ⁿ/n','1/n','2ⁿ','n − 1/n','√n','1 + 1/n'],3);
    return {index:'q:22a.fixed[w;'+right+';'+wrong.join(';')+']', lines:[['a sequence that climbs and has a ceiling settles','the climb technique']], ask:'Which of these sequences climbs and has a ceiling?', right, opts:shuffle([right,...wrong]), lead:'', why:'Each term of '+right+' is more than the one before, and none passes its ceiling. Of the others, some fall, some take turns, and some pass every ceiling.'}; }},
  {id:'22a.line',step:'22a',mode:'proof',label:'does it settle',open:()=>measured('22a'),make(){
    const c=2+rnd(8), s='sₙ', V=[
      ['cc',[[s+' climbs','proved by induction'],['every '+s+' ≤ '+c,'proved by induction'],[s+' settles','the climb technique']],3,0,'The sequence climbs and has a ceiling. The climb technique asks for exactly these two.'],
      ['ff',[[s+' falls','proved by induction'],['every '+s+' ≥ '+c,'proved by induction'],[s+' settles','the fall technique']],3,0,'The sequence falls and has a floor. The fall technique asks for exactly these two.'],
      ['b',[['every '+s+' ≥ 0','proved by induction'],['every '+s+' ≤ '+c,'proved by induction'],[s+' settles','the climb technique']],3,1,'A floor and a ceiling are not enough: (−1)ⁿ is kept between −1 and 1 and wanders. The sequence must also climb or fall.'],
      ['c',[[s+' climbs','proved by induction'],[s+' settles','the climb technique']],2,1,'No ceiling has been shown. sₙ = n climbs and passes every ceiling.'],
      ['fc',[[s+' falls','proved by induction'],['every '+s+' ≤ '+c,'proved by induction'],[s+' settles','the fall technique']],3,1,'A sequence that falls needs a floor, not a ceiling. sₙ = −n falls, stays under '+c+', and passes every floor.'],
      ['fx',[['sₙ₊₁ = 3sₙ − '+2*c+', and s₁ = '+(c+1),'the rule and the start'],['L = 3L − '+2*c+', so L = '+c,'solve L = g(L)'],[s+' settles at '+c,'the fixed-point technique']],3,1,'The fixed-point technique starts “if the sequence settles”. Nothing here proves that it does, and from s₁ = '+(c+1)+' the terms pass every ceiling.'],
      ['fy',[['sₙ₊₁ = ½sₙ + '+c+', and s₁ = 0','the rule and the start'],[s+' settles','proved: it climbs and has a ceiling'],['its limit L has L = ½L + '+c+', so L = '+2*c,'the fixed-point technique']],3,0,'The sequence was proved to settle first, and the rule is continuous, so its limit is a point the rule leaves alone.'],
      ['cl',[[s+' climbs','proved by induction'],['every '+s+' ≤ '+c,'proved by induction'],[s+' settles at '+c,'the climb technique']],3,1,'It settles at its least ceiling, and '+c+' is only a ceiling. 1 − 1/n has the ceiling 5 and settles at 1.']];
    const [tag,lines,n,r,why]=pick(V);
    return {index:'q:22a.line['+tag+';'+c+']', stack:true, lines, ask:'Is line '+n+' licensed?', right:YN22[r], opts:YN22, lead:'', why}; }});

/* ---------- 22b Every Bounded Sequence Has a Settling Thread ---------- */
const B22=[
  ['One thread of a sequence settles. Must the sequence settle?','no: the even thread of (−1)ⁿ settles, and the sequence wanders',['yes, by the thread technique','yes, at the same limit','no: a sequence with a settling thread never settles'],'The thread technique runs from the sequence to its threads, not back.'],
  ['A sequence has no ceiling. Can a thread of it settle?','yes: 1, 1, 2, 1, 3, 1, … has the thread 1, 1, 1, …',['no: every thread of it passes every ceiling','no, by the thread technique','only if the sequence settles'],'Some thread of it passes every ceiling. Other threads need not.'],
  ['The even thread and the odd thread of a sequence each settle. Does the sequence settle?','only if both settle at the same place',['yes, always','no, never','only if the sequence climbs'],'(−1)ⁿ has an even thread settling at 1 and an odd thread settling at −1, so it has two gathering points and wanders.'],
  ['What is a gathering point of a sequence?','a real that some thread of it settles at',['a real that every thread of it settles at','any term that comes up twice','its least upper bound'],'Accepted names: a cluster point, an accumulation point, or a limit point of the sequence.'],
  ['A sequence has a floor and a ceiling. When does it settle?','exactly when it has only one gathering point',['always','exactly when it climbs','exactly when it has no gathering point'],'Gathering technique: with a floor and a ceiling it has at least one gathering point, and it settles exactly when it has only one.'],
  ['A sequence settles at L. Where do its threads settle?','every one of them at L',['some at L, and some elsewhere','only the even thread and the odd thread at L','threads of it need not settle'],'Thread technique: a thread keeps some of the terms in their order, and far out all of them are near L.']];
QP.push({id:'22b.thread',step:'22b',label:'threads and gathering points',open:()=>measured('22b'),make(){ return writtenQ('22b.thread',B22); }},
  {id:'22b.gather',step:'22b',mode:'work',label:'gathering points',open:()=>measured('22b'),make(){
    const k=rnd(4), a=1+rnd(5), c=rnd(9)-4;
    if(k===0){ const lo=sg(c-a), hi=sg(c+a), right=lo+' and '+hi, wrong=uniq(right,[sg(c)+' only',sg(-a)+' and '+a,lo+', '+sg(c)+' and '+hi,'it has none',hi+' only'],3);
      return {index:'q:22b.gather[t;'+[a,c].join(';')+']', lines:[['sₙ = '+(c===0?'':sg(c)+' + ')+cf22(a,'(−1)ⁿ')+' + 1/n','a sequence']], ask:'Which are its gathering points?', right, opts:shuffle([right,...wrong]), lead:'', why:'For even n the terms are '+sg(c+a)+' + 1/n, and that thread settles at '+hi+'. For odd n they are '+sg(c-a)+' + 1/n, and that thread settles at '+lo+'. Two gathering points, so the sequence wanders.'}; }
    if(k===1){ const right=sg(c)+' only', wrong=uniq(right,[sg(c-a)+' and '+sg(c+a),(c===0?'1':'0')+' only',sg(-a)+' and '+a,'it has none',sg(c+a)+' only'],3);
      return {index:'q:22b.gather[o;'+[a,c].join(';')+']', lines:[['sₙ = '+sg(c)+' + '+cf22(a,'(−1)ⁿ')+'/n','a sequence']], ask:'Which are its gathering points?', right, opts:shuffle([right,...wrong]), lead:'', why:'The part '+cf22(a,'(−1)ⁿ')+'/n heads to 0, so the sequence settles at '+sg(c)+'. By the thread technique every thread settles there too.'}; }
    if(k===2){ const len=3+rnd(3), vals=[]; for(let i=0;i<len;i++) vals.push(pick([0,1,2,3,5,7])); const d=[...new Set(vals)].length; if(d===len&&Math.random()<0.6) return null;
      const right=String(d), wrong=uniq(right,[String(len),String(d+1),'0','1',String(d-1),'endlessly many'].filter(v=>v!=='-1'),3);
      return {index:'q:22b.gather[p;'+vals.join(',')+']', lines:[['sₙ runs '+vals.join(', ')+', '+vals.join(', ')+', … for ever','a sequence that repeats every '+len+' terms']], ask:'How many gathering points has it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Each value that comes up is met endlessly often, so a thread stays on it. The different values are '+[...new Set(vals)].sort((x,y)=>x-y).join(', ')+': '+d+' in all'+(d===1?', so the sequence settles':'')+'.'}; }
    const ev=Math.random()<0.5, b=1+rnd(6), right=sg(ev?a:-a), wrong=uniq(right,[sg(ev?-a:a),'0',WAND22,String(a+b),'1'],3);
    return {index:'q:22b.gather[e;'+[a,b,ev?1:0].join(';')+']', lines:[['sₙ = (−1)ⁿ · '+(a===1?'':a)+'n/(n + '+b+')','a sequence']], ask:'Where does its '+(ev?'even thread s₂, s₄, s₆, …':'odd thread s₁, s₃, s₅, …')+' settle?', right, opts:shuffle([right,...wrong]), lead:'', why:(a===1?'':a)+'n/(n + '+b+') heads to '+a+'. On the '+(ev?'even':'odd')+' places (−1)ⁿ is '+(ev?'1':'−1')+', so that thread settles at '+right+'. The whole sequence has two gathering points and wanders.'}; }});

/* ---------- 22c Settling Without Knowing Where ---------- */
const C22=[
  ['|sₙ₊₁ − sₙ| heads to 0. Must s crowd?','no: for √n the next terms close up, yet √(4n) − √n = √n passes every bound',['yes: that is what crowding says','yes, on the line with no holes','no: only sequences that climb can crowd'],'Crowding asks every two terms far out to be near each other, not only neighbours.'],
  ['A sequence of fractions crowds. Must it head to a fraction?','no: the decimals of √2 crowd, and no fraction is their limit',['yes, by the crowd technique','yes: fractions that crowd share a denominator','no: a sequence of fractions never crowds'],'The crowd technique holds on the line with no holes. The fractions have holes.'],
  ['A sequence crowds. Must it climb or fall?','no: (−1)ⁿ/n crowds and does neither',['yes: it climbs','yes: it climbs or it falls','no: a sequence that crowds always takes turns'],'It settles at 0, so it crowds, while its terms take turns on each side of 0.'],
  ['To show that a sequence of reals settles, must you first find its limit?','no: show that it crowds, and the crowd technique does the rest',['yes: “settles” names the limit L','yes, by solving L = g(L)','no: every sequence of reals settles'],'“Crowds” has no L in it. On the reals, a sequence settles exactly when it crowds.'],
  ['What does it mean that s crowds?','for every ε > 0 there is N such that every m, n ≥ N have |sₘ − sₙ| < ε',['for every ε > 0 there is N such that every n ≥ N has |sₙ₊₁ − sₙ| < ε','there is L such that for every ε > 0 some n has |sₙ − L| < ε','for some ε > 0 every m and n have |sₘ − sₙ| < ε'],'Every two terms far out are near each other.']];
const SQ22=[[1,4],[1,9],[2,8],[4,4],[1,16],[3,12],[2,18],[4,9],[1,25],[9,4],[5,20]];
QP.push({id:'22c.crowd',step:'22c',label:'crowding',open:()=>measured('22c'),make(){ return writtenQ('22c.crowd',C22); }},
  {id:'22c.far',step:'22c',mode:'work',label:'how far out',open:()=>measured('22c'),make(){
    const k=rnd(3), c=rnd(7);
    if(k===0){ const a=1+rnd(5), e=pick([2,3,4,5,10,20]), N=a*e, right=String(N), wrong=uniq(right,[String(N+1),String(N-1),String(e),String(a),String(2*N),String(a+e)].filter(v=>v!=='0'),3);
      return {index:'q:22c.far[n;'+[a,e,c].join(';')+']', lines:[['sₙ = '+(c?c+' + ':'')+(a===1?'1':a)+'/n','a sequence'],['every m, n ≥ N are to have |sₘ − sₙ| < 1/'+e,'the challenge ε = 1/'+e]], ask:'Which is the least N that answers the challenge?', right, opts:shuffle([right,...wrong]), lead:'', why:'For m, n ≥ N, both terms are above '+c+' and at most '+(c?c+' + ':'')+a+'/N, so |sₘ − sₙ| < '+a+'/N. That is at most 1/'+e+' from N = '+N+' on. With N = '+(N-1)+', the term at place '+(N-1)+' and terms far out are more than 1/'+e+' apart.'}; }
    if(k===1){ const [a,e]=pick(SQ22), N=Math.round(Math.sqrt(a*e)), right=String(N), wrong=uniq(right,[String(N+1),String(N-1),String(a*e),String(e),String(2*N),String(N*N+1)].filter(v=>v!=='0'),3);
      return {index:'q:22c.far[q;'+[a,e,c].join(';')+']', lines:[['sₙ = '+(c?c+' + ':'')+(a===1?'1':a)+'/n²','a sequence'],['every m, n ≥ N are to have |sₘ − sₙ| < 1/'+e,'the challenge ε = 1/'+e]], ask:'Which is the least N that answers the challenge?', right, opts:shuffle([right,...wrong]), lead:'', why:'For m, n ≥ N, |sₘ − sₙ| < '+a+'/N². That is at most 1/'+e+' when N² ≥ '+a*e+', so from N = '+N+' on. With N = '+(N-1)+', the term at place '+(N-1)+' and terms far out are more than 1/'+e+' apart.'}; }
    const yes=Math.random()<0.5, Y=['1/n','(−1)ⁿ/n','1 − 1/2ⁿ','n/(n + 1)','(2n + 1)/n','1/n²'], W=['√n','(−1)ⁿ','n','ln n','1 + ½ + ⅓ + ⋯ + 1/n','(−1)ⁿ · n','n²/(n + 1)'], right=pick(yes?Y:W), wrong=take(yes?W:Y,3);
    return {index:'q:22c.far[w;'+right+';'+wrong.join(';')+']', lines:[['on the reals, a sequence settles exactly when it crowds','22c1 and the crowd technique']], ask:'Which of these sequences '+(yes?'crowds':'does not crowd')+'?', right, opts:shuffle([right,...wrong]), lead:'', why:yes?right+' settles, so it crowds. Each of the others wanders, so far out it still has terms that stay apart.':right+' wanders, so it cannot crowd: far out it still has terms that stay apart. Each of the others settles, so it crowds.'}; }});

/* ---------- 22d A Sum Is Where Its Partial Sums Settle ---------- */
const D22=[
  ['The pieces of an endless sum head to 0. Must the sum settle?','no: 1 + ½ + ⅓ + ⋯ wanders',['yes, by the shrink technique','yes, if the pieces are positive','no: such a sum always wanders'],'The shrink technique runs one way: if the sum settles, the pieces head to 0. The grouping technique shows the harmonic sum passes every ceiling.'],
  ['Is 1 − 1 + 1 − 1 + ⋯ = (1 − 1) + (1 − 1) + ⋯ = 0?','no: the sum wanders; group only sums that settle',['yes','no: the total is 1','no: the total is ½'],'Its running totals are 1, 0, 1, 0, … Grouping a sum that wanders can manufacture a total.'],
  ['Σ (uₙ + vₙ) settles. Must Σ uₙ settle?','no: take uₙ = 1 and vₙ = −1',['yes, by the sum-of-sums technique','yes, and Σ vₙ settles too','no: then neither Σ uₙ nor Σ vₙ can settle'],'The sum-of-sums technique starts from two sums that settle. It does not run back.'],
  ['After a million pieces the running totals seem to stand still. Is the sum shown to settle?','no: the harmonic sum looks settled near 14.4 and still wanders',['yes','yes, if the pieces are positive','yes, if the pieces head to 0'],'A look at finitely many running totals proves nothing about the rest.'],
  ['The first hundred pieces of an endless sum are changed. What can change?','the total, but not whether the sum settles',['whether the sum settles','nothing at all','whether the pieces head to 0'],'Tail technique: dropping or changing finitely many pieces only shifts the total by a fixed amount.'],
  ['What does it mean that the endless sum Σ uₙ settles?','its running totals settle',['its pieces settle','its pieces head to 0','its running totals have a ceiling'],'Partial-sum technique: every question about an endless sum is a question about the sequence of its running totals.']];
QP.push({id:'22d.sum',step:'22d',label:'pieces and running totals',open:()=>measured('22d'),make(){ return writtenQ('22d.sum',D22); }},
  {id:'22d.totals',step:'22d',mode:'work',label:'totals',open:()=>measured('22d'),make(){
    const k=rnd(4);
    if(k===0){ const c=1+rnd(5), N=3+rnd(8), tot=Math.random()<0.4, R=tot?fint(c):fr(c*N,N+1), right=fshow(R), wrong=frs16(right,tot?[fr(c,2),fint(2*c),fint(0),fr(c*N,N+1),fint(c+1)]:[fr(c,N+1),fr(c*(N-1),N),fint(c),fr(c*N,N+2),fr(c,N*(N+1)),fr(c*(N+1),N+2)]); if(wrong.length<3) return null;
      return {index:'q:22d.totals[t;'+[c,N,tot?1:0].join(';')+']', lines:[['uₙ = '+c+'/(n(n + 1)) = '+c+'/n − '+c+'/(n + 1)','the pieces, from n = 1']], ask:tot?'What is the total of Σ uₙ?':'What is the running total after '+N+' pieces?', right, opts:shuffle([right,...wrong]), lead:'', why:'In the running total the middle terms cancel in pairs: sₙ = '+c+' − '+c+'/(n + 1). '+(tot?'That heads to '+c+', so the total is '+c+'.':'After '+N+' pieces it is '+c+' − '+c+'/'+(N+1)+' = '+right+'.')}; }
    if(k===1){ const [[p1,q1],[p2,q2]]=take(R22,2), a=1+rnd(5), b=1+rnd(5), A=fr(a*q1,q1-p1), B=fr(b*q2,q2-p2), R=fadd(A,B), right=fshow(R), wrong=frs16(right,[A,B,fint(a+b),fadd(fr(a,q1-p1),fr(b,q2-p2)),fr((a+b)*q1*q2,q1*q2-p1*p2),fadd(fr(a*q1,q1+p1),fr(b*q2,q2+p2))]); if(wrong.length<3) return null;
      return {index:'q:22d.totals[g;'+[a,p1,q1,b,p2,q2].join(';')+']', lines:[['uₙ = '+cf22(a,'('+p1+'/'+q1+')ⁿ')+' + '+cf22(b,'('+p2+'/'+q2+')ⁿ'),'the pieces, from n = 0']], ask:'What is the total of Σ uₙ?', right, opts:shuffle([right,...wrong]), lead:'', why:'Sum-of-sums technique: two geometric sums, each 1/(1 − r) times its number in front. '+a+' · '+fshow(fr(q1,q1-p1))+' + '+b+' · '+fshow(fr(q2,q2-p2))+' = '+fshow(A)+' + '+fshow(B)+' = '+right+'.'}; }
    if(k===2){ const a=2+rnd(4), [right,to]=pick([['Σ n/(n + 1)','1'],['Σ (1 + 1/n)','1'],['Σ n/('+a+'n + 1)','1/'+a],['Σ ('+a+'n + 1)/n',String(a)],['Σ n²/(n² + '+a+')','1']]), wrong=take(['Σ 1/n','Σ 1/n²','Σ 1/2ⁿ','Σ 1/√n','Σ 1/(n(n + 1))','Σ 1/n³'],3);
      return {index:'q:22d.totals[s;'+right+';'+wrong.join(';')+']', lines:[['if Σ uₙ settles, then uₙ → 0','the shrink technique']], ask:'Which sum does this technique show to wander?', right, opts:shuffle([right,...wrong]), lead:'', why:'Its pieces head to '+to+', not to 0, so it cannot settle. The pieces of the others all head to 0, and for them the shrink technique says nothing either way.'}; }
    const [p,q]=pick(R22), n=1+rnd(4), a=q*(1+rnd(4)), S=fr(a*q,q-p), part=fsub(S,fmul(S,fr(p**n,q**n))), T=fsub(S,part), right=fshow(T), wrong=frs16(right,[S,part,fadd(S,part),fmul(T,fr(p,q)),fmul(T,fr(q,p)),fr(a*p**n,q**n)]); if(wrong.length<3) return null;
    return {index:'q:22d.totals[r;'+[p,q,n,a].join(';')+']', lines:[['Σ uₙ = '+fshow(S),'given: the sum settles'],['its first '+(n===1?'piece is ':n+' pieces add to ')+fshow(part),'given']], ask:'What is the total of the rest?', right, opts:shuffle([right,...wrong]), lead:'', why:'Tail technique: dropping finitely many pieces shifts the total by a fixed amount. '+fshow(S)+' − '+fshow(part)+' = '+right+'.'}; }},
  {id:'22d.line',step:'22d',mode:'proof',label:'which way it runs',open:()=>measured('22d'),make(){
    const c=pick(['1','½','2','−1','⅓']), m=pick([10,50,100,1000]), V=[
      ['s1',[['Σ uₙ settles','given'],['uₙ → 0','the shrink technique']],0,'The shrink technique says exactly this: uₙ is the difference of two running totals that head to the same total.'],
      ['s2',[['uₙ → 0','given'],['Σ uₙ settles','the shrink technique']],1,'The shrink technique runs the other way. 1 + ½ + ⅓ + ⋯ has pieces heading to 0 and wanders.'],
      ['s3',[['uₙ → '+c,'given'],['Σ uₙ wanders','the shrink technique: if it settled, uₙ would head to 0']],0,'If the sum settled, the pieces would head to 0. They head to '+c+', so it does not settle.'],
      ['t1',[['Σ uₙ settles','given'],['Σ uₙ still settles after its first '+m+' pieces are changed','the tail technique']],0,'Changing finitely many pieces only shifts the total by a fixed amount.'],
      ['t2',[['Σ uₙ = S','given'],['Σ uₙ still has the total S after its first '+m+' pieces are changed','the tail technique']],1,'The tail technique keeps whether the sum settles. The total shifts by as much as the pieces were changed.'],
      ['a1',[['Σ uₙ = A and Σ vₙ = B','given'],['Σ (uₙ + vₙ) = A + B','the sum-of-sums technique']],0,'Running totals add, and limits of sequences add.'],
      ['a2',[['Σ (uₙ + vₙ) settles','given'],['Σ uₙ settles','the sum-of-sums technique']],1,'The technique does not run back: uₙ = 1 and vₙ = −1 add to pieces that are all 0.'],
      ['a3',[['Σ uₙ = A and Σ vₙ = B','given'],['Σ uₙvₙ = AB','the sum-of-sums technique']],1,'The technique covers sums and a number in front, not products of pieces. With uₙ = vₙ = 1/2ⁿ from n = 1, A = B = 1, yet Σ 1/4ⁿ = ⅓.'],
      ['a4',[['Σ uₙ = A','given'],['Σ '+m+'uₙ = '+m+'A','the sum-of-sums technique']],0,'Running totals scale, and limits of sequences scale.']];
    const [tag,lines,r,why]=pick(V);
    return {index:'q:22d.line['+tag+';'+c+';'+m+']', stack:true, lines, ask:'Is line 2 licensed?', right:YN22[r], opts:YN22, lead:'', why}; }});

/* ---------- 22e Compare With a Geometric Sum ---------- */
const E22=[
  ['uₙ ≤ vₙ and Σ vₙ settles. Must Σ uₙ settle?','only if uₙ ≥ 0 as well: uₙ = −1 is under every vₙ = 1/n²',['yes, by the comparison technique','yes, and at a smaller total','no: then Σ uₙ wanders'],'The comparison technique asks for 0 ≤ uₙ ≤ vₙ from some place on.'],
  ['uₙ > 0 and uₙ₊₁/uₙ heads to 1. What does the ratio test say?','nothing: Σ 1/n wanders and Σ 1/n² settles, both with q = 1',['the sum settles','the sum wanders','the pieces do not head to 0'],'If q < 1 the sum settles, if q > 1 it wanders, and if q = 1 the test says nothing.'],
  ['Σ |uₙ| settles. What follows for Σ uₙ?','it settles too',['nothing','it wanders','it settles at the same total'],'Settles-in-size technique: any block of pieces is at most the block of their sizes, in size.'],
  ['0 ≤ uₙ ≤ vₙ and Σ uₙ settles. What follows for Σ vₙ?','nothing: the comparison technique runs the other way',['it settles','it wanders','it settles at a larger total'],'A settling sum underneath says nothing about the sum above: 1/n² is under 1/n and under 1/n² itself.'],
  ['Which pieces is the root test made for?','pieces built from n-th powers, like (n/(2n + 1))ⁿ',['pieces with factorials in them','pieces that change sign','pieces like 1/nᵖ'],'The n-th root undoes the n-th power. For factorials the ratio test is easier, and on 1/nᵖ both tests say nothing.'],
  ['uₙ, vₙ > 0 and uₙ/vₙ heads to a positive real. What follows?','the two sums settle or wander together',['both sums settle','Σ uₙ settles and Σ vₙ wanders','nothing'],'Ratio-of-pieces comparison: far out, each sum is under a multiple of the other.']];
const V22=q=>q==='∞'?'the sum wanders':fless(q,fint(1))?'the sum settles':fsame(q,fint(1))?'the test says nothing':'the sum wanders', Q22=q=>q==='∞'?'the ratio passes every bound':'q = '+fshow(q);
QP.push({id:'22e.test',step:'22e',label:'what a test may say',open:()=>measured('22e'),make(){ return writtenQ('22e.test',E22); }},
  {id:'22e.ratio',step:'22e',mode:'work',label:'the ratio test and the root test',open:()=>measured('22e'),make(){
    const b=2+rnd(4), kk=1+rnd(4), t=rnd(6); let a=1+rnd(6); if(a===b) a=b+1;
    const [u,q,test,how]=t===0?['n'+(kk===1?'':sup15(kk))+'/'+b+'ⁿ',fr(1,b),'ratio','uₙ₊₁/uₙ = ((n + 1)/n)'+(kk===1?'':sup15(kk))+' · 1/'+b+', and (n + 1)/n heads to 1']
      :t===1?[b+'ⁿ/n!',fint(0),'ratio','uₙ₊₁/uₙ = '+b+'/(n + 1)']
      :t===2?['n!/'+b+'ⁿ','∞','ratio','uₙ₊₁/uₙ = (n + 1)/'+b]
      :t===3?['n · '+a+'ⁿ/'+b+'ⁿ',fr(a,b),'ratio','uₙ₊₁/uₙ = ((n + 1)/n) · '+a+'/'+b+', and (n + 1)/n heads to 1']
      :t===4?['1/n'+(kk===1?'':sup15(kk)),fint(1),'ratio','uₙ₊₁/uₙ = (n/(n + 1))'+(kk===1?'':sup15(kk))]
      :['('+(a===1?'':a)+'n/('+b+'n + '+kk+'))ⁿ',fr(a,b),'root','the n-th root of uₙ is '+(a===1?'':a)+'n/('+b+'n + '+kk+')'];
    const right=Q22(q)+': '+V22(q), other=v=>v==='the sum settles'?'the sum wanders':'the sum settles';
    const cands=[Q22(q)+': '+other(V22(q))].concat([fint(1),fint(0),q==='∞'?fr(1,b):fr(q.q,q.p||1),fr(b,1),fr(1,b),'∞'].map(x=>Q22(x)+': '+V22(x))), wrong=uniq(right,cands,3); if(wrong.length<3) return null;
    return {index:'q:22e.ratio['+t+';'+[a,b,kk].join(';')+']', lines:[['uₙ = '+u,'the pieces of Σ uₙ']], ask:'What does the '+test+' test give?', right, opts:shuffle([right,...wrong]), lead:'', why:how+(q==='∞'?', which passes every bound. Far out each piece is bigger than the one before, so the pieces do not head to 0.':', which heads to '+fshow(q)+'. '+(V22(q)==='the test says nothing'?'With q = 1 the test says nothing.':'With q '+(fless(q,fint(1))?'< 1 the sum settles.':'> 1 the sum wanders.')))}; }},
  {id:'22e.compare',step:'22e',mode:'work',label:'lay it beside another',open:()=>measured('22e'),make(){
    const a=1+rnd(9), b=2+rnd(3), I=[
      ['1/('+b+'ⁿ + '+a+')','0 ≤ uₙ ≤ 1/'+b+'ⁿ, and Σ 1/'+b+'ⁿ settles: the sum settles',['uₙ ≤ 1/'+a+', and the pieces 1/'+a+' do not head to 0: the sum wanders','uₙ ≥ 1/'+(b+1)+'ⁿ ≥ 0 far out, and Σ 1/'+(b+1)+'ⁿ settles: the sum settles','uₙ → 0: the sum settles'],'A sum of pieces never negative, under a geometric sum that settles, settles. A settling sum underneath proves nothing, and pieces heading to 0 prove nothing.'],
      ['(n + '+a+')/n²','uₙ ≥ 1/n ≥ 0, and Σ 1/n wanders: the sum wanders',['uₙ → 0: the sum settles','uₙ ≤ '+(a+1)+'/n, and Σ 1/n wanders: the sum wanders','0 ≤ uₙ ≤ '+(a+1)+', and the pieces have a ceiling: the sum settles'],'A sum over a sum that wanders, piece by piece, wanders. A wandering sum on top proves nothing.'],
      ['1/(√n + '+a+')','uₙ ≥ 1/('+(a+1)+'n) ≥ 0, and Σ 1/n wanders: the sum wanders',['uₙ ≤ 1/√n, and Σ 1/√n wanders: the sum wanders','uₙ → 0: the sum settles','uₙ ≤ 1/'+a+', and Σ 1/'+a+' wanders: the sum wanders'],'√n + '+a+' ≤ n + '+a+'n, so the pieces are at least 1/('+(a+1)+'n). A number in front does not change whether a sum settles. A wandering sum on top proves nothing.'],
      [(a+1)+'ⁿ/('+(a+1+b)+'ⁿ + n)','0 ≤ uₙ ≤ '+(a+1)+'ⁿ/'+(a+1+b)+'ⁿ, a geometric sum that settles: the sum settles',['uₙ ≥ 0 and uₙ → 0: the sum settles','uₙ ≤ 1, and Σ 1 wanders: the sum wanders','uₙ ≥ 1/'+(a+1+b)+'ⁿ ≥ 0, and Σ 1/'+(a+1+b)+'ⁿ settles: the sum settles'],'Dropping the n makes the bottom smaller and the piece bigger, and the bigger pieces make a geometric sum with ratio under 1.'],
      ['(2 + (−1)ⁿ)/'+b+'ⁿ','0 ≤ uₙ ≤ 3/'+b+'ⁿ, and Σ 3/'+b+'ⁿ settles: the sum settles',['uₙ₊₁/uₙ heads to 1/'+b+': the sum settles','uₙ ≥ 1/'+b+'ⁿ ≥ 0, and Σ 1/'+b+'ⁿ settles: the sum settles','the pieces take turns: the sum wanders'],'The top is 1 or 3, so the pieces lie under 3/'+b+'ⁿ. The ratios of neighbours take turns between two values and head nowhere, so the ratio test cannot be used.'],
      ['n/(n² + '+a+')','uₙ ≥ 1/('+(a+1)+'n) ≥ 0, and Σ 1/n wanders: the sum wanders',['uₙ ≤ 1/n, and Σ 1/n wanders: the sum wanders','uₙ → 0: the sum settles','uₙ₊₁/uₙ heads to 1: the sum wanders'],'n² + '+a+' ≤ '+(a+1)+'n², so the pieces are at least 1/('+(a+1)+'n). A wandering sum on top proves nothing, and with q = 1 the ratio test says nothing.']];
    const [u,right,wrong,why]=pick(I);
    return {index:'q:22e.compare['+u+']', lines:[['uₙ = '+u,'the pieces of Σ uₙ']], ask:'Which line decides it?', right, opts:shuffle([right,...wrong]), lead:'', why}; }},
  {id:'22e.line',step:'22e',mode:'proof',label:'which way the comparison runs',open:()=>measured('22e'),make(){
    const m=pick([5,10,100]), q=pick(['½','⅓','¾']), Q=pick(['2','3','3/2']), C='the comparison technique', V=[
      ['c1',[['0 ≤ uₙ ≤ vₙ for every n','given'],['Σ vₙ settles','given'],['Σ uₙ settles',C]],3,0,'The running totals of u climb, since no piece is negative, and the total of Σ vₙ is a ceiling for them.'],
      ['c2',[['0 ≤ uₙ ≤ vₙ for every n','given'],['Σ uₙ settles','given'],['Σ vₙ settles',C]],3,1,'The technique runs the other way. 1/n² is under 1/n, Σ 1/n² settles, and Σ 1/n wanders.'],
      ['c3',[['0 ≤ uₙ ≤ vₙ for every n','given'],['Σ uₙ wanders','given'],['Σ vₙ wanders',C]],3,0,'This is the first half turned about: if Σ vₙ settled, Σ uₙ would.'],
      ['c4',[['0 ≤ uₙ ≤ vₙ for every n','given'],['Σ vₙ wanders','given'],['Σ uₙ wanders',C]],3,1,'A wandering sum on top proves nothing. 1/n² is under 1/n, Σ 1/n wanders, and Σ 1/n² settles.'],
      ['c5',[['uₙ ≤ vₙ for every n','given'],['Σ vₙ settles','given'],['Σ uₙ settles',C]],3,1,'The technique asks for uₙ ≥ 0 as well. uₙ = −1 is under every vₙ = 1/n².'],
      ['c6',[['0 ≤ uₙ ≤ vₙ for every n ≥ '+m,'given'],['Σ vₙ settles','given'],['Σ uₙ settles',C]],3,0,'“From some place on” is enough: by the tail technique, the first few pieces never change whether a sum settles.'],
      ['z1',[['Σ |uₙ| settles','given'],['Σ uₙ settles','the settles-in-size technique']],2,0,'Any block of pieces is at most the block of their sizes, in size. So if the sizes crowd, the pieces do.'],
      ['z2',[['Σ uₙ settles','given'],['Σ |uₙ| settles','the settles-in-size technique']],2,1,'The technique runs the other way. 1 − ½ + ⅓ − ⋯ settles, and 1 + ½ + ⅓ + ⋯ wanders.'],
      ['r1',[['uₙ > 0 and uₙ₊₁/uₙ → '+q,'given'],['Σ uₙ settles','the ratio test']],2,0,'q = '+q+' is under 1, so far out the pieces lie under a geometric sum that settles.'],
      ['r2',[['uₙ > 0 and uₙ₊₁/uₙ → '+Q,'given'],['Σ uₙ wanders','the ratio test']],2,0,'q = '+Q+' is over 1, so far out each piece is bigger than the one before and the pieces do not head to 0.'],
      ['r3',[['uₙ > 0 and uₙ₊₁/uₙ → 1','given'],['Σ uₙ '+pick(['wanders','settles']),'the ratio test']],2,1,'With q = 1 the ratio test says nothing: Σ 1/n wanders and Σ 1/n² settles, both with q = 1.']];
    const [tag,lines,n,r,why]=pick(V);
    return {index:'q:22e.line['+tag+';'+[m,q,Q].join(';')+';'+lines[lines.length-1][0]+']', stack:true, lines, ask:'Is line '+n+' licensed?', right:YN22[r], opts:YN22, lead:'', why}; }});

/* ---------- 22f Sums Against Areas ---------- */
const F22=[
  ['Is Σ 1/n² equal to ∫₁^∞ dx/x² = 1?','no: the area only fences the total, which lies between 1 and 2',['yes, by the area technique','no: the total is less than 1','no: the sum wanders'],'The area technique says the sum settles exactly when the area does. The fence technique says how near they are.'],
  ['May the area technique be used on the pieces sin² n / n²?','no: the curve must fall, and this one wobbles',['yes: the curve is never negative','yes: the pieces head to 0','no: the curve must climb'],'The strips sit under and over the curve only when f is positive and falling. Compare with 1/n² instead.'],
  ['For which p does Σ 1/nᵖ settle?','exactly for p > 1',['for every p ≥ 1','for every p > 0','exactly for p < 1'],'p-sum technique. p = 1 is the harmonic sum, and it wanders.'],
  ['The running totals Hₙ = 1 + ½ + ⋯ + 1/n wander. What does Hₙ − ln n do?','it settles',['it wanders too','it heads to 0','it passes every ceiling'],'The gap falls and has a floor, so it settles. Hₙ stays within 1 of ln n.'],
  ['f is positive and falling, and uₙ = f(n). What lies between ∫ₙ₊₁^∞ f and ∫ₙ^∞ f?','the tail of Σ uₙ after n pieces',['the total of Σ uₙ','the running total after n pieces','the piece uₙ'],'Fence technique for sums: the inequalities of the strips, with the area run out to forever.']];
const pe22=(p,q)=>q===1?(p===1?'n':'n'+sup15(p)):'n^('+p+'/'+q+')';
QP.push({id:'22f.area',step:'22f',label:'sums and areas',open:()=>measured('22f'),make(){ return writtenQ('22f.area',F22); }},
  {id:'22f.p',step:'22f',mode:'work',label:'p-sums and their fences',open:()=>measured('22f'),make(){
    const k=rnd(3);
    if(k===0){ const S=[[2,1],[3,1],[3,2],[4,3],[5,4],[5,2],[4,1],[6,5]], W=[[1,1],[1,2],[2,3],[3,4],[1,3],[4,5],[9,10]], yes=Math.random()<0.5, f=([p,q])=>'Σ 1/'+pe22(p,q), R=pick(yes?S:W), right=f(R), wrong=take(yes?W:S,3).map(f);
      return {index:'q:22f.p[w;'+right+';'+wrong.join(';')+']', lines:[['Σ 1/nᵖ settles exactly when p > 1','the p-sum technique']], ask:'Which of these sums '+(yes?'settles':'wanders')+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'Its power is '+(R[1]===1?R[0]:R[0]+'/'+R[1])+', which is '+(yes?'more than 1':R[0]===R[1]?'exactly 1: the harmonic sum':'less than 1')+'. The others have powers '+(yes?'of 1 or less':'more than 1')+'.'}; }
    if(k===1){ const p=2+rnd(5), lo=fr(1,p-1), hi=fr(p,p-1), f=(x,y)=>fshow(x)+' and '+fshow(y), right=f(lo,hi), wrong=uniq(right,[f(fint(0),lo),f(fr(1,p),fint(1)),f(lo,fint(p)),f(fint(1),fint(2)),f(fr(1,p),lo),f(fint(1),fr(p+1,p))],3); if(wrong.length<3) return null;
      return {index:'q:22f.p[f;'+p+']', lines:[['Σ 1/n'+sup15(p),'a p-sum, from n = 1'],['∫₁^∞ x'+sup15(-p)+' dx = '+fshow(lo),'the area under the curve']], ask:'Between which two numbers does the fence technique put the total?', right, opts:shuffle([right,...wrong]), lead:'', why:'Fence technique for sums: the total lies between ∫₁^∞ f and f(1) + ∫₁^∞ f. Here f(1) = 1, so between '+fshow(lo)+' and 1 + '+fshow(lo)+' = '+fshow(hi)+'.'}; }
    const p=2+rnd(2), N=2+rnd(8), g=n=>fr(1,(p-1)*n**(p-1)), f=(x,y)=>fshow(x)+' and '+fshow(y), right=f(g(N+1),g(N)), wrong=uniq(right,[f(fr(1,(N+1)**p),fr(1,N**p)),f(fint(0),fr(1,N**p)),f(g(N),g(N-1)),f(fr(1,N+1),fr(1,N)),f(fr(1,(N+1)**2),fr(1,N*N)),f(g(N+2),g(N+1))],3); if(wrong.length<3) return null;
    return {index:'q:22f.p[t;'+[p,N].join(';')+']', lines:[['Σ 1/n'+sup15(p),'a p-sum, from n = 1'],['∫ₙ^∞ x'+sup15(-p)+' dx = '+(p===2?'1/n':'1/(2n²)'),'the area past n'],['stop after '+N+' pieces','the tail is what is left out']], ask:'Between which two numbers does the fence technique put the tail?', right, opts:shuffle([right,...wrong]), lead:'', why:'Fence technique for sums: the tail after n pieces lies between ∫ₙ₊₁^∞ f and ∫ₙ^∞ f. With n = '+N+': between '+fshow(g(N+1))+' and '+fshow(g(N))+'.'}; }});

/* ===== Laundry 5, rung 22 (floor 4 pools, stage U), part 2: 22g to 22l ===== */
const ep22=n=>n===0?'1':n===1?'e':'e'+sup15(n), ce22=(c,n)=>(c.p===1&&c.q===1?'':c.q===1?String(c.p):'('+fshow(c)+')')+ep22(n), N22=d=>d===0?'1':d===1?'n':'n'+sup15(d);

/* ---------- 22g Signs That Alternate, and Sums That Can Be Rearranged ---------- */
const G22=[
  ['Σ (−1)ⁿ/n settles. Must Σ 1/n settle?','no: settling only by taking turns is not settling in size',['yes, by the settles-in-size technique','yes: the two have the same pieces in size','no: then Σ (−1)ⁿ/n would wander too'],'The settles-in-size technique runs from the sizes to the sum, not back. Σ 1/n is the harmonic sum.'],
  ['The pieces of a sum take turns in sign and head to 0. Must the sum settle?','no: the sizes must also fall; 1 − ¼ + ⅓ − ⅛ + ⅕ − ⋯ wanders',['yes, by the bracket technique','yes: it settles in size','no: a sum whose signs take turns never settles'],'The bracket technique asks for vₙ that falls and heads to 0. Here the gains are the odd pieces of the harmonic sum and the losses make a geometric sum.'],
  ['Σ uₙ settles. Has every reordering of its pieces the same total?','only when it settles in size',['yes, always','no, never','only when its signs take turns'],'A sum that settles only by taking turns can be reordered to settle at any number.'],
  ['Σ uₙ settles only by taking turns. Which totals can reorderings of its pieces reach?','any number T you like',['only its own total','only totals between two running totals in a row','only 0 and its own total'],'Reorder technique: take gains until the running total passes T, then losses until it drops below, and repeat. Every piece is used exactly once.'],
  ['vₙ falls and heads to 0. Where does the total of v₁ − v₂ + v₃ − ⋯ lie?','between any two running totals in a row',['above every running total','below every running total','half way between the first two running totals'],'Bracket technique: the even running totals climb, the odd ones fall, and the gap between them is one piece.'],
  ['What does it mean that a sum settles only by taking turns?','it settles, but the sum of the sizes of its pieces wanders',['it settles, and its signs take turns','it wanders, but the sum of the sizes of its pieces settles','its running totals take turns between two values'],'1 − ½ + ⅓ − ⋯ settles, and 1 + ½ + ⅓ + ⋯ wanders.']];
const VG22=[['1/n',n=>fr(1,n)],['1/n²',n=>fr(1,n*n)],['1/(2n − 1)',n=>fr(1,2*n-1)],['1/2ⁿ',n=>fr(1,2**n)],['1/(n + 1)',n=>fr(1,n+1)]];
const alt22=(v,N)=>{ let s=''; for(let i=1;i<=N;i++) s+=(i===1?'':i%2?' + ':' − ')+fshow(v(i)); return s+(N%2?' − ':' + ')+'⋯'; }, tot22=(v,N)=>{ let s=fint(0); for(let i=1;i<=N;i++) s=fadd(s,i%2?v(i):fneg(v(i))); return s; };
QP.push({id:'22g.turns',step:'22g',label:'taking turns',open:()=>measured('22g'),make(){ return writtenQ('22g.turns',G22); }},
  {id:'22g.bracket',step:'22g',mode:'work',label:'the bracket',open:()=>measured('22g'),make(){
    const k=rnd(4), [name,v]=pick(VG22), N=3+rnd(3);
    if(k===0){ const f=(x,y)=>fless(x,y)?fshow(x)+' and '+fshow(y):fshow(y)+' and '+fshow(x), S=n=>tot22(v,n), right=f(S(N-1),S(N)), wrong=uniq(right,[f(S(N-2),S(N-1)),f(S(N),S(N+1)),f(v(N),v(N-1)),f(fint(0),S(N)),f(S(N),fadd(S(N),v(N)))],3); if(wrong.length<3) return null;
      return {index:'q:22g.bracket[b;'+name+';'+N+']', lines:[[alt22(v,N),'the sizes '+name+' fall and head to 0'],['the total lies between any two running totals in a row','the bracket technique']], ask:'Which are the running totals after '+(N-1)+' and after '+N+' pieces?', right, opts:shuffle([right,...wrong]), lead:'', why:'After '+(N-1)+' pieces the running total is '+fshow(S(N-1))+'. The next piece is '+(N%2?'+ ':'− ')+fshow(v(N))+', which brings it to '+fshow(S(N))+'. The total lies between the two.'}; }
    if(k===1){ const right=fshow(v(N+1)), wrong=frs16(right,[v(N),v(N+2),fhalf(v(N+1)),tot22(v,N),fr(1,N),fr(1,2*N+3)]); if(wrong.length<3) return null;
      return {index:'q:22g.bracket[e;'+name+';'+N+']', lines:[[alt22(v,N),'the sizes '+name+' fall and head to 0'],['stop after '+N+' pieces','the tail is the error']], ask:'The error is less than the next piece in size. How large is that piece?', right, opts:shuffle([right,...wrong]), lead:'', why:'The total lies between the running totals after '+N+' and after '+(N+1)+' pieces, and those differ by piece '+(N+1)+', which is '+right+' in size.'}; }
    if(k===2){ const right=pick(['1 − 1/2 + 1/3 − 1/4 + ⋯','1 − 1/√2 + 1/√3 − 1/√4 + ⋯','1/ln 2 − 1/ln 3 + 1/ln 4 − ⋯','1 − 1/4 + 1/9 − 1/16 + ⋯','1 − 1/3 + 1/5 − 1/7 + ⋯']), wrong=take(['1 − 1 + 1 − 1 + ⋯','1/2 − 2/3 + 3/4 − 4/5 + ⋯','1 − 1/4 + 1/3 − 1/8 + 1/5 − ⋯','1 + 1/2 + 1/3 + 1/4 + ⋯','1 − 2 + 3 − 4 + ⋯'],3);
      return {index:'q:22g.bracket[w;'+right+';'+wrong.join(';')+']', lines:[['if vₙ falls and heads to 0, then v₁ − v₂ + v₃ − ⋯ settles','the bracket technique']], ask:'Which of these sums does the technique settle?', right, opts:shuffle([right,...wrong]), lead:'', why:'Its signs take turns, and its sizes fall and head to 0. Each of the others misses one of the three: its signs do not take turns, or its sizes do not fall, or they do not head to 0.'}; }
    const O=['it settles in size','it settles only by taking turns',WAND22,'it settles in every order, but not in size'], a=2+rnd(4), [u,r,why]=pick([['(−1)ⁿ/n',1,'The bracket settles it. In size it is the harmonic sum, which wanders.'],['(−1)ⁿ/√n',1,'The bracket settles it. In size it is the p-sum with p = ½, which wanders.'],['(−1)ⁿ/n'+sup15(a),0,'In size it is the p-sum with p = '+a+', which settles.'],['(−1)ⁿ/'+a+'ⁿ',0,'In size it is a geometric sum with ratio 1/'+a+', which settles.'],['(−1)ⁿ/n!',0,'In size the ratio of neighbours is 1/(n + 1), which heads to 0, so the sizes settle by the ratio test.'],['(−1)ⁿ · n/(n + '+a+')',2,'The pieces do not head to 0: in size they head to 1.'],['(−1)ⁿ',2,'The pieces do not head to 0. The running totals take turns between −1 and 0.'],['(−1)ⁿ/ln n, from n = 2',1,'The bracket settles it. In size the pieces are over 1/n, and the harmonic sum wanders.'],['(−1)ⁿ/(n + '+a+')',1,'The bracket settles it. In size it is a tail of the harmonic sum, which wanders.']]);
    return {index:'q:22g.bracket[c;'+u+']', lines:[['uₙ = '+u,'the pieces of Σ uₙ']], ask:'How does the sum behave?', right:O[r], opts:shuffle(O.slice()), lead:'', why:why+(r<2?' A sum that settles in size has the same total in every order, so the last choice cannot happen.':'')}; }},
  {id:'22g.line',step:'22g',mode:'proof',label:'what the bracket asks for',open:()=>measured('22g'),make(){
    const T=pick(['7','−3','100','½','0']), c=pick(['½','1','⅓']), B='the bracket technique', V=[
      ['b1',[['vₙ falls','given'],['vₙ → 0','given'],['v₁ − v₂ + v₃ − v₄ + ⋯ settles',B]],3,0,'The technique asks for exactly these two: the sizes fall, and they head to 0.'],
      ['b2',[['every vₙ > 0','given'],['vₙ → 0','given'],['v₁ − v₂ + v₃ − v₄ + ⋯ settles',B]],3,1,'The sizes must also fall. 1 − ¼ + ⅓ − ⅛ + ⅕ − ⋯ has sizes heading to 0 and wanders.'],
      ['b3',[['vₙ falls','given'],['vₙ → '+c,'given'],['v₁ − v₂ + v₃ − v₄ + ⋯ settles',B]],3,1,'The sizes must head to 0. Here the pieces do not, so by the shrink technique the sum wanders.'],
      ['b4',[['vₙ falls and vₙ → 0','given'],['the total of v₁ − v₂ + v₃ − ⋯ lies between v₁ − v₂ and v₁',B]],2,0,'v₁ and v₁ − v₂ are two running totals in a row, and the total lies between any such two.'],
      ['r1',[['Σ uₙ settles only by taking turns','given'],['some reordering of its pieces settles at '+T,'the reorder technique']],2,0,'Its gains pass every ceiling and so do its losses, so the running total can be steered across '+T+' for ever, by pieces that head to 0.'],
      ['r2',[['Σ uₙ settles in size','given'],['some reordering of its pieces settles at '+T+', whatever its own total','the reorder technique']],2,1,'The reorder technique is for sums that settle only by taking turns. A sum that settles in size has the same total in every order.'],
      ['r3',[['Σ uₙ settles','given'],['every reordering of its pieces has the same total','the pieces are the same']],2,1,'That holds only when the sum settles in size. 1 − ½ + ⅓ − ⋯ can be reordered to settle at any number.'],
      ['z1',[['Σ uₙ settles, and Σ |uₙ| wanders','given'],['Σ uₙ settles only by taking turns','what the words mean']],2,0,'That is the meaning: it settles, but not in size.']];
    const [tag,lines,n,r,why]=pick(V);
    return {index:'q:22g.line['+tag+';'+T+';'+c+']', stack:true, lines, ask:'Is line '+n+' licensed?', right:YN22[r], opts:YN22, lead:'', why}; }});

/* ---------- 22h Sequences by Hand ---------- */
const H22=[
  ['sin(πn) → 0 as n grows. Does sin(πx) → 0 as x grows?','no: the far-out technique runs one way only',['yes, by the far-out technique','yes: n is a kind of x','no: sin(πn) does not head to 0 either'],'From the function to the sequence, not back. sin(πx) keeps swinging between −1 and 1, and the whole numbers happen to land on its zeros.'],
  ['Is (1 + 1/n)ⁿ → 1^∞ = 1?','no: the base and the power move together, and it heads to e',['yes','no: it heads to 0','no: it passes every bound'],'The base heads to 1 while the power grows. Neither may be sent to its limit first.'],
  ['L = g(L) has a solution. Must sₙ₊₁ = g(sₙ) settle there?','no: the point can push away',['yes, by the fixed-point technique','yes, from any start','no: such a sequence never settles'],'Near a point g leaves alone the slope decides: pulled in if |g′(L)| < 1, pushed away if |g′(L)| > 1.'],
  ['Where does n^(1/n) head?','to 1',['to 0','to e','past every bound'],'Standard-sequences technique. ∞ is no number to put in a root; the proof squeezes instead.'],
  ['For any x, where does xⁿ/n! head?','to 0',['to eˣ','to x','past every bound when x > 1'],'Standard-sequences technique: far out each term is the one before times x/n, which is small.'],
  ['g sends an interval I into itself, and |g(x) − g(y)| ≤ k|x − y| on I for one k < 1. What follows for sₙ₊₁ = g(sₙ)?','from any start in I it settles, at the only L in I with g(L) = L',['it settles only from starts near L','it settles, but perhaps at different places from different starts','nothing, until it is shown to climb or fall'],'Pull-together technique: the gaps between neighbours shrink like kⁿ, so the sequence crowds.']];
QP.push({id:'22h.seq',step:'22h',label:'sequences to know',open:()=>measured('22h'),make(){ return writtenQ('22h.seq',H22); }},
  {id:'22h.std',step:'22h',mode:'work',label:'limits by hand',open:()=>measured('22h'),make(){
    const k=rnd(3), a=2+rnd(8), kk=2+rnd(3), [p,q]=pick(R22);
    if(k===0){ const b=1+rnd(9), c=2+rnd(6), d=1+rnd(9), t=rnd(4), top=t===0?'n³':t===1?'n':'n²', R=t===0?NOLIM:t===1?'0':fshow(fr(a,c)), wrong=uniq(R,[fshow(fr(a,c)),fshow(fr(c,a)),fshow(fr(b,d)),'0',NOLIM,fshow(fr(a+b,c+d)),String(a)],3); if(wrong.length<3) return null;
      return {index:'q:22h.std[q;'+[t,a,b,c,d].join(';')+']', lines:[['sₙ = ('+a+top+' + '+b+')/('+c+'n² + '+d+')','a sequence']], ask:'Where does it head?', right:R, opts:shuffle([R,...wrong]), lead:'', why:'Far-out technique: the techniques for functions work on sequences. Divide top and bottom by n²: '+(t===0?'the top becomes '+a+'n + '+b+'/n², which passes every bound, while the bottom heads to '+c+'.':t===1?'the top becomes '+a+'/n + '+b+'/n², which heads to 0, while the bottom heads to '+c+'.':'the top heads to '+a+' and the bottom to '+c+', so the sequence heads to '+R+'.')}; }
    if(k===1){ const O=['0','1','e',NOLIM], [u,r,why]=pick([['('+p+'/'+q+')ⁿ',0,'For |r| < 1, rⁿ → 0.'],['n^(1/n)',1,'n^(1/n) → 1.'],[a+'^(1/n)',1,'For a > 0, a^(1/n) → 1.'],['n'+sup15(kk)+' · ('+p+'/'+q+')ⁿ',0,'For any power k and |r| < 1, nᵏrⁿ → 0: the power of r wins.'],[a+'ⁿ/n!',0,'For any x, xⁿ/n! → 0.'],['(1 + 1/n)ⁿ',2,'17e: the base and the power move together, and it heads to e.'],['('+q+'/'+p+')ⁿ',3,'The ratio is over 1, so the terms pass every bound.'],['n!/'+a+'ⁿ',3,a+'ⁿ/n! → 0, so its upside-down passes every bound.'],['(−1)ⁿ',3,'It has two gathering points, 1 and −1.'],['n^(1/n) · (1 + 1/n)ⁿ',2,'The first factor heads to 1 and the second to e.'],['n'+sup15(kk)+'/'+a+'ⁿ',0,'nᵏrⁿ → 0 with r = 1/'+a+'.']]);
      return {index:'q:22h.std[s;'+u+']', lines:[['sₙ = '+u,'a sequence']], ask:'Where does it head?', right:O[r], opts:shuffle(O.slice()), lead:'', why:'Standard-sequences technique. '+why}; }
    const b=1+rnd(6), c=1+rnd(6), right=String(a), wrong=uniq(right,[String(a+b),String(a+b-c),String(b),'0',NOLIM,String(a-c)],3);
    return {index:'q:22h.std[m;'+[a,b,p,q,c].join(';')+']', lines:[['sₙ = '+a+' · n^(1/n) + '+cf22(b,'('+p+'/'+q+')ⁿ')+' − '+c+'/n','a sequence']], ask:'Where does it head?', right, opts:shuffle([right,...wrong]), lead:'', why:'n^(1/n) → 1, ('+p+'/'+q+')ⁿ → 0 and '+c+'/n → 0. By the sum and product techniques the sequence heads to '+a+' · 1 + 0 − 0 = '+a+'.'}; }},
  {id:'22h.pull',step:'22h',mode:'work',label:'pulled in or pushed away',open:()=>measured('22h'),make(){
    const k=rnd(3), V=F=>{ const z=Math.abs(F.p)/F.q; return z<1?'they are pulled in':z>1?'they are pushed away':'the slope does not decide'; }, O=v=>v==='they are pulled in'?'they are pushed away':'they are pulled in';
    if(k===0){ const m=pick([fr(1,2),fr(-1,2),fr(1,3),fr(2,3),fr(-2,3),fr(2,1),fr(-2,1),fr(3,1),fr(3,2),fr(-3,2)]), c=1+rnd(8), L=fmul(fint(c),fr(m.q,m.q-m.p)), L2=fmul(fint(c),fr(m.q,m.q+m.p)), mt=m.q===1?cf22(m.p,'x'):(m.p<0?'−':'')+'('+Math.abs(m.p)+'/'+m.q+')x';
      const f=(X,v)=>'L = '+fshow(X)+': '+v, right=f(L,V(m)), wrong=uniq(right,[f(L,O(V(m))),f(L2,V(m)),f(L2,O(V(m))),f(fint(c),V(m)),f(fint(c),O(V(m)))],3); if(wrong.length<3) return null;
      return {index:'q:22h.pull[l;'+[m.p,m.q,c].join(';')+']', lines:[['g(x) = '+mt+' + '+c,'the rule sₙ₊₁ = g(sₙ)']], ask:'Which point L does g leave alone, and what happens to starts near it?', right, opts:shuffle([right,...wrong]), lead:'', why:'L = g(L) gives L = '+fshow(L)+'. The slope of g is '+fshow(m)+' everywhere, '+(Math.abs(m.p)<m.q?'under':'over')+' 1 in size, so near L '+V(m)+'.'}; }
    if(k===1){ const a=pick([fr(3,2),fr(2,1),fr(5,2),fr(16,5),fr(7,2),fr(4,1),fr(5,4),fr(9,4)]), L=fsub(fint(1),fr(a.q,a.p)), s=fsub(fint(2),a), f=X=>fshow(X)+': '+V(X), right=f(s), wrong=uniq(right,[fshow(s)+': '+O(V(s)),f(a),f(fsub(fint(1),a)),f(fneg(s)),f(fr(1,2)),f(fint(1))],3); if(wrong.length<3) return null;
      return {index:'q:22h.pull[g;'+[a.p,a.q].join(';')+']', lines:[['g(x) = '+(a.q===1?a.p:'('+fshow(a)+')')+'x(1 − x)','the rule sₙ₊₁ = g(sₙ)'],['g leaves L = '+fshow(L)+' alone','L = g(L)']], ask:'What is the slope of g at L, and what happens to starts near L?', right, opts:shuffle([right,...wrong]), lead:'', why:'g′(x) = '+fshow(a)+' − '+fshow(fmul(fint(2),a))+'x, so g′('+fshow(L)+') = '+fshow(s)+'. That is '+(V(s)==='they are pulled in'?'under 1 in size, so nearby starts are pulled in.':'over 1 in size, so nearby starts are pushed away.')}; }
    const m=2+rnd(5), A=m*m, right='0: they are pulled in', wrong=take(['½: they are pulled in','1: the slope does not decide','2: they are pushed away','0: they are pushed away','−1: the slope does not decide'],3);
    return {index:'q:22h.pull[h;'+m+']', lines:[['g(x) = (x + '+A+'/x)/2','the rule sₙ₊₁ = g(sₙ)'],['g leaves L = '+m+' alone','L = g(L)']], ask:'What is the slope of g at L, and what happens to starts near L?', right, opts:shuffle([right,...wrong]), lead:'', why:'g′(x) = (1 − '+A+'/x²)/2, so g′('+m+') = (1 − 1)/2 = 0. That is under 1 in size, so nearby starts are pulled in, and fast.'}; }});

/* ---------- 22i Testing Sums by Hand ---------- */
const I22=[
  ['1/n → 0. Does Σ 1/n settle?','no: heading to 0 is needed, not enough',['yes, by the shrink technique','yes: it is a p-sum','no: 1/n does not head to 0'],'It is the harmonic sum, the p-sum with p = 1, and it wanders.'],
  ['In the choosing technique, which question comes first?','do the pieces head to 0?',['do the signs take turns?','are there factorials or n-th powers?','do the pieces come from a falling curve?'],'If they do not, the sum wanders. It is the cheapest check.'],
  ['The signs take turns and the sizes fall to 0. Stop after n pieces. How large can the error be?','less than the next piece in size',['as large as the running total','exactly the next piece','less than half the last piece kept'],'Leftover technique: the total lies between two running totals in a row, and those differ by the next piece.'],
  ['Each piece is at most k times the one before, with k < 1. Stop after n pieces. The tail is at most what?','uₙ₊₁/(1 − k)',['uₙ₊₁','k · uₙ₊₁','uₙ₊₁/(1 + k)'],'Leftover technique: a geometric sum with first piece uₙ₊₁ and ratio k, laid over the tail.'],
  ['The ratio test gives q = 1 on Σ 1/n². What now?','the test says nothing; it is a p-sum with p = 2, so it settles',['the sum wanders','the sum settles, by the ratio test','no test can decide it'],'When one test falls silent, ask the next question of the choosing technique.'],
  ['The signs of a sum take turns, and the bracket settles it. What is still to ask?','whether it settles in size',['whether its pieces head to 0','nothing','whether it is a geometric sum'],'A sum can settle in size, or settle only by taking turns. The bracket does not say which.']];
QP.push({id:'22i.pick',step:'22i',label:'which test, and how near',open:()=>measured('22i'),make(){ return writtenQ('22i.pick',I22); }},
  {id:'22i.choose',step:'22i',mode:'work',label:'which test decides',open:()=>measured('22i'),make(){
    const a=2+rnd(4), b=2+rnd(3), I=[
      ['n/('+a+'n + 1)','the pieces head to 1/'+a+', not 0: it wanders',['the pieces are like 1/n far out, and the harmonic sum wanders: it wanders','the ratio test gives q = 1/'+a+': it settles','the root test gives q = 1/'+a+': it settles'],'The cheapest check comes first. The pieces are near 1/'+a+' for ever, so the running totals pass every ceiling.'],
      ['('+a+'n + 1)/(n³ + 1)','the pieces over 1/n² head to '+a+', and the p-sum with p = 2 settles: it settles',['the pieces head to 0: it settles','the pieces over 1/n head to '+a+', and the harmonic sum wanders: it wanders','the ratio test gives q = 1: it wanders'],'Far out the pieces look like '+a+'/n². Compare by the ratio of pieces. Pieces heading to 0 decide nothing, and q = 1 says nothing.'],
      ['n'+sup15(a)+'/'+b+'ⁿ','the ratio of neighbours heads to 1/'+b+': it settles',['the pieces pass every bound: it wanders','it is a p-sum with p = '+a+': it settles','the ratio of neighbours heads to '+b+': it wanders'],'A fixed number to the n-th power calls for the ratio test: ((n + 1)/n)'+sup15(a)+' · 1/'+b+' heads to 1/'+b+'.'],
      ['1/(n ln n), from n = 2','the area ∫₂^b dx/(x ln x) = ln ln b − ln ln 2 passes every ceiling: it wanders',['the pieces head to 0: it settles','the pieces are under 1/n, and the harmonic sum wanders: it wanders','the ratio test gives q = 1: it settles'],'The pieces come from a falling curve with a log in it: the area technique. A wandering sum on top proves nothing.'],
      ['(−1)ⁿ/√n','the bracket settles it, and in size it is the p-sum with p = ½, which wanders: it settles only by taking turns',['it is the p-sum with p = ½: it wanders','the pieces head to 0: it settles in size','the ratio test gives q = −1: it settles'],'Signs that take turns: the bracket first, then ask separately whether it settles in size.'],
      [a+'ⁿ/n!','the ratio of neighbours is '+a+'/(n + 1), which heads to 0: it settles',['the pieces pass every bound: it wanders','it is a geometric sum with ratio '+a+': it wanders','the root test gives q = '+a+': it wanders'],'Factorials call for the ratio test. n! outgrows '+a+'ⁿ.'],
      ['(n/('+a+'n + 1))ⁿ','the n-th root of the piece heads to 1/'+a+': it settles',['the pieces head to 1/'+a+', not 0: it wanders','it is a p-sum with p = n: it settles','the ratio test gives q = 1: it says nothing'],'Something to the n-th power whole calls for the root test.'],
      [a+'/n^(3/2)','it is the p-sum with p = 3/2, with a number in front: it settles',['the pieces head to 0: it settles','the ratio test gives q = 1: it wanders','the pieces are at least 1/n², and Σ 1/n² settles: it settles'],'p = 3/2 is more than 1. A settling sum underneath proves nothing.']];
    const [u,right,wrong,why]=pick(I);
    return {index:'q:22i.choose['+u+']', lines:[['uₙ = '+u,'the pieces of Σ uₙ']], ask:'Which line decides it?', right, opts:shuffle([right,...wrong]), lead:'', why}; }},
  {id:'22i.left',step:'22i',mode:'work',label:'the leftover',open:()=>measured('22i'),make(){
    const k=rnd(4);
    if(k===0){ const [p,q]=pick(R22), u=fr(1,pick([10,20,50,100,24,60,36])), K=fr(p,q), right=fshow(fmul(u,fr(q,q-p))), wrong=frs16(right,[u,fmul(u,K),fmul(u,fr(q,q+p)),fmul(u,fr(q,p)),fr(q,q-p),fmul(u,fr(q-p,q))]); if(wrong.length<3) return null;
      return {index:'q:22i.left[g;'+[p,q,u.q].join(';')+']', lines:[['each piece is at most '+p+'/'+q+' of the one before','given'],['the first piece left out is '+fshow(u),'given']], ask:'The tail is at most what?', right, opts:shuffle([right,...wrong]), lead:'', why:'Leftover technique: the tail is at most uₙ₊₁/(1 − k) = ('+fshow(u)+') / ('+fshow(fr(q-p,q))+') = '+right+'.'}; }
    const K=k===3?pick([4,9,16,25,100]):pick([10,20,50,100,1000]), m=Math.round(Math.sqrt(K)), [sum,what,bound,n,how]=k===1?['1 + 1/4 + 1/9 + 1/16 + ⋯','the pieces 1/n² come from a falling curve','the tail is at most ∫ₙ^∞ dx/x² = 1/n',K,'1/n ≤ 1/'+K+' first at n = '+K]:k===2?['1 − 1/2 + 1/3 − 1/4 + ⋯','the signs take turns and the sizes fall to 0','the error is less than the next piece, 1/(n + 1)',K-1,'1/(n + 1) ≤ 1/'+K+' first at n = '+(K-1)]:['1 − 1/4 + 1/9 − 1/16 + ⋯','the signs take turns and the sizes fall to 0','the error is less than the next piece, 1/(n + 1)²',m-1,'1/(n + 1)² ≤ 1/'+K+' first at n = '+(m-1)];
    const right=String(n), wrong=uniq(right,[K,K-1,K+1,m,m-1,2*K,m+1,K*K].filter(v=>v>0).map(String),3);
    return {index:'q:22i.left[n;'+k+';'+K+']', lines:[[sum,what],[bound,'the leftover technique']], ask:'Stop after n pieces. What is the least n for which this promises an error of at most 1/'+K+'?', right, opts:shuffle([right,...wrong]), lead:'', why:how+'.'+(k===2?' That is why this sum needs so many pieces: its bound is only the next piece.':'')}; }});

/* ---------- 22j From Counting to Rare Events ---------- */
const J22=[
  ['Is (1 − λ/N)ᴺ → 1ᴺ = 1?','no: the base and the power move together, and it heads to e^(−λ)',['yes','no: it heads to 0','no: it heads to 1 − λ'],'Many-small-chances technique: for any real x, (1 + x/N)ᴺ heads to eˣ.'],
  ['May the rare-events technique be used with N = 10 and λ = 5?','no: each chance is ½, not small',['yes: only λ is left in the answer','yes: λ is less than N','no: λ must be less than 1'],'The technique is a limit: N large with λ fixed, so that each chance λ/N is small.'],
  ['May e^(−λ) λᵏ/k! be used for events that come in clumps?','no: the tries must be independent of one another',['yes, with a larger λ','yes: the clumps even out','no: the chances would add to more than 1'],'The count behind the technique multiplies chances, and that needs tries that come apart from one another.'],
  ['What do the chances e^(−λ) λᵏ/k! add to, over k = 0, 1, 2, …?','1',['e^λ','e^(−λ)','λ'],'Exp-as-a-sum technique: 1 + λ + λ²/2! + ⋯ = e^λ, and the e^(−λ) in front is part of each chance.'],
  ['As N grows, where does (1 + x/N)ᴺ head?','to eˣ',['to 1','to x','to e, whatever x is'],'Many-small-chances technique. 17e did x = 1.'],
  ['Each of N tries has the chance λ/N, and N grows. What is left in the chance of exactly k successes?','only λ and k',['N, λ and k','only N','only k'],'Rare-events technique: the chance heads to e^(−λ) λᵏ/k!.']];
QP.push({id:'22j.rare',step:'22j',label:'rare events',open:()=>measured('22j'),make(){ return writtenQ('22j.rare',J22); }},
  {id:'22j.count',step:'22j',mode:'work',label:'the chance of exactly k',open:()=>measured('22j'),make(){
    const t=rnd(3), l=1+rnd(4), k=rnd(5);
    if(t===0){ const c=fr(l**k,fact16(k)), right=ce22(c,-l), wrong=uniq(right,[ce22(fint(l**k),-l),ce22(c,-k),fshow(c),ce22(fr(l,fact16(k)),-l),ce22(fr(1,fact16(k)),-l),ce22(c,l),ce22(fr(l*k||1,fact16(k)),-l),'1 − '+right],3); if(wrong.length<3) return null;
      return {index:'q:22j.count[k;'+[l,k].join(';')+']', lines:[['the count of hits is k with chance e^(−λ) λᵏ/k!','the rare-events technique'],['λ = '+l,'the expected count']], ask:'What is the chance of exactly '+k+' hit'+(k===1?'':'s')+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'e'+sup15(-l)+' · '+l+sup15(k)+'/'+k+'! = e'+sup15(-l)+' · '+l**k+'/'+fact16(k)+' = '+right+'.'}; }
    if(t===1){ const m=2+rnd(4), [u,n,why]=pick([['(1 − '+l+'/N)ᴺ',-l,'x = −'+l],['(1 + '+l+'/N)ᴺ',l,'x = '+l],['(1 + 1/N)^('+m+'N)',m,'it is ((1 + 1/N)ᴺ)'+sup15(m)+', and the inside heads to e'],['(1 − 1/N)^('+m+'N)',-m,'it is ((1 − 1/N)ᴺ)'+sup15(m)+', and the inside heads to e⁻¹']]), right=ep22(n), wrong=uniq(right,['1',ep22(-n),'e','0',ep22(n+1),String(Math.abs(n)),ep22(n-1)],3);
      return {index:'q:22j.count[l;'+u+']', lines:[['sₙ = '+u,'a sequence, as N grows']], ask:'Where does it head?', right, opts:shuffle([right,...wrong]), lead:'', why:'Many-small-chances technique: (1 + x/N)ᴺ heads to eˣ. Here '+why+'.'}; }
    const O=[ep22(-l),'1 − '+ep22(-l),ce22(fint(1+l),-l),'1 − '+ce22(fint(1+l),-l)], r=rnd(4), what=['no hits','at least one hit','at most one hit','two hits or more'][r];
    return {index:'q:22j.count[s;'+[l,r].join(';')+']', lines:[['the count of hits is k with chance e^(−λ) λᵏ/k!','the rare-events technique'],['λ = '+l,'the expected count']], ask:'What is the chance of '+what+'?', right:O[r], opts:shuffle(O.slice()), lead:'', why:(r===0?'No hits is k = 0: e'+sup15(-l)+' · '+l+'⁰/0! = e'+sup15(-l)+'.':'No hits: e'+sup15(-l)+'. One hit: '+ce22(fint(l),-l)+'. ')+(r===0?'':r===1?'All the chances add to 1, so at least one hit has the chance 1 − e'+sup15(-l)+'.':r===2?'Together: '+O[2]+'.':'Together: '+O[2]+'. All the chances add to 1, so two or more has the chance '+O[3]+'.')}; }},
  {id:'22j.scatter',step:'22j',mode:'word',label:'scattered at random',open:()=>measured('22j'),make(){
    const [pre,post,one,things]=pick([['A baker stirs ',' raisins into the dough for # buns, and the raisins end up scattered at random','bun','raisins'],['A printer leaves ',' misprints scattered at random through a book of # pages','page','misprints'],['A gardener throws ',' seeds at random over a bed marked in # squares','square','seeds'],['',' drops of rain fall at random on a yard of # paving stones','stone','drops']]), B=pick([50,100,200,500]), l=1+rnd(4), R=l*B, k=rnd(4), c=fr(l**k,fact16(k)), right=ce22(c,-l), wrong=uniq(right,[ce22(fint(l**k),-l),ce22(c,-k),fshow(c),ce22(fr(1,fact16(k)),-l),'1/'+B,ce22(c,l),fshow(fr(k||1,B))],3); if(wrong.length<3) return null;
    return {index:'q:22j.scatter['+[things,B,l,k].join(';')+']', a3:['22j.scatter',DASH,DASH], story:pre+R+post.replace('#',B)+'.', lines:[], ask:'By the rare-events technique, what is the chance that a given '+one+' has '+(k===0?'none':'exactly '+k)+' of the '+things+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'Each of the '+R+' '+things+' lands on that '+one+' with the chance 1/'+B+', which is small, and they land apart from one another. The expected count is λ = '+R+'/'+B+' = '+l+'. So the chance is e'+sup15(-l)+' · '+l+sup15(k)+'/'+k+'! = '+right+'.'}; }});

/* ---------- 22k How Fast Things Grow ---------- */
const K22=[
  ['n = O(n²) and n² = O(n²). Does n = n² follow?','no: the = of O does not turn about',['yes: both equal O(n²)','yes, far out','no: n = O(n²) is false'],'f = O(g) is a promise that f grows no faster than g. It is not the = of rung 0 and cannot be chained both ways.'],
  ['Which is larger far out, 1000n or n²?','n², from n = 1000 on',['1000n, always','they grow alike','they take turns for ever'],'1000n is ahead only for n < 1000. A number in front never changes the rank.'],
  ['Is 2²ⁿ = O(2ⁿ)?','no: 2²ⁿ/2ⁿ = 2ⁿ passes every ceiling',['yes: both are powers of 2','yes, with C = 2','yes: a number in front never matters'],'A number in front does not matter. A number in the power does: 2²ⁿ is 4ⁿ.'],
  ['f ~ g. Must f − g head to 0?','no: n² + n ~ n², but the difference n passes every ceiling',['yes: that is what ~ says','yes, far out','no: the difference always passes every ceiling'],'f ~ g says the ratio heads to 1. The difference may still grow.'],
  ['What does f(n) ~ g(n) say?','f(n)/g(n) heads to 1',['f(n) − g(n) heads to 0','f(n)/g(n) has a ceiling','f(n)/g(n) heads to 0'],'Read “f and g grow alike”.'],
  ['What does f(n) = O(g(n)) say?','some C and some N make |f(n)| ≤ C·g(n) for every n ≥ N',['f(n)/g(n) heads to 1','f(n) ≤ g(n) for every n','f(n)/g(n) heads to 0'],'Read “f grows no faster than g”. Two numbers are hidden in it, C and N.']];
const RK22=[['ln n',1],['√n',2],['n',3],['n ln n',4],['n²',5],['n³',6],['n¹⁰⁰',7],['(1.01)ⁿ',8],['2ⁿ',9],['3ⁿ',10],['n!',11],['nⁿ',12]];
QP.push({id:'22k.grow',step:'22k',label:'grows no faster than',open:()=>measured('22k'),make(){ return writtenQ('22k.grow',K22); }},
  {id:'22k.rank',step:'22k',mode:'work',label:'ranks of growth',open:()=>measured('22k'),make(){
    const t=rnd(3);
    if(t===0){ const four=take(RK22,4).sort((x,y)=>x[1]-y[1]), hi=Math.random()<0.5, right=four[hi?3:0][0], wrong=four.filter(x=>x[0]!==right).map(x=>x[0]);
      return {index:'q:22k.rank[r;'+four.map(x=>x[0]).join(';')+';'+(hi?1:0)+']', lines:[['each of these over the next heads to 0: ln n, nᵏ, bⁿ, n!, nⁿ','the ranking technique, for k > 0 and b > 1']], ask:'Which of these is '+(hi?'highest':'lowest')+' in rank?', right, opts:shuffle([right,...wrong]), lead:'', why:'From lowest to highest: '+four.map(x=>x[0]).join(', ')+'. Logs come under every power of n, powers of n under every bⁿ with b > 1, then n!, then nⁿ. Within a kind, the larger power or the larger base is higher.'}; }
    if(t===1){ const a=2+rnd(5), b=1+rnd(9), c=1+rnd(9), k=2+rnd(3), right=a+N22(k), wrong=uniq(right,[N22(k),(a+b)+N22(k),b+N22(k-1),a+N22(k+1),a+N22(k)+' ln n',(a+b+c)+N22(k)],3);
      return {index:'q:22k.rank[a;'+[a,b,c,k].join(';')+']', lines:[['f(n) = '+a+N22(k)+' + '+b+N22(k-1)+' + '+c,'a function'],['f ~ g says f(n)/g(n) heads to 1','grow alike']], ask:'Which grows alike with f?', right, opts:shuffle([right,...wrong]), lead:'', why:'f(n)/('+right+') = 1 + '+b+'/('+a+'n) + '+c+'/('+a+N22(k)+'), which heads to 1. Over '+N22(k)+' the ratio heads to '+a+', not 1: for ~ the number in front counts.'}; }
    const a=2+rnd(4), yes=Math.random()<0.5, T=['n² = O(n³)',a+'n² + n = O(n²)','ln n = O(n)','2ⁿ = O(n!)','n¹⁰ = O(2ⁿ)','1000n = O(n)','n ln n = O(n²)','2ⁿ⁺¹ = O(2ⁿ)'], F=['n³ = O(n²)','3ⁿ = O(2ⁿ)','n = O(ln n)','n! = O(2ⁿ)','2ⁿ = O(n¹⁰)','n ln n = O(n)','2²ⁿ = O(2ⁿ)','n² = O('+a+'n)'], right=pick(yes?T:F), wrong=take(yes?F:T,3);
    return {index:'q:22k.rank[o;'+right+';'+wrong.join(';')+']', lines:[['f = O(g): some C and N make |f(n)| ≤ C·g(n) for every n ≥ N','grows no faster than']], ask:'Which of these is '+(yes?'true':'false')+'?', right, opts:shuffle([right,...wrong]), lead:'', why:yes?'In '+right+' the left side over the right side keeps a ceiling. In each of the others the left side is higher in rank, so the ratio passes every ceiling.':'In '+right+' the left side over the right side passes every ceiling, so no C will do. In each of the others the ratio keeps a ceiling.'}; }});

/* ---------- 22l Splitting the Work, Counted ---------- */
const L22=[
  ['T(n) = 2T(n/2) + n, and each level costs n. How many levels are there, at a power of 2?','log₂ n',['n','n/2','2ⁿ'],'The size halves at each level, and log₂ n halvings bring n down to 1. So the cost has the rank n log₂ n, not n².'],
  ['Does the master technique give the cost of T(n) = 2T(n/2) + n log₂ n?','no: n log₂ n is not a power nᵈ',['yes: n log₂ n, with d = 1','yes: n², with d = 2','yes: n, since r < 1'],'The technique is for a joining cost nᵈ. Counted by levels, this one comes to ½ n log₂² n.'],
  ['Which is lower in rank, 4T(n/4) + n or 2T(n/2) + n?','neither: n log₄ n is half of n log₂ n, the same rank',['4T(n/4) + n','2T(n/2) + n','it depends on T(1)'],'Both have r = 1, so every level costs n. Only the number of levels differs, by a fixed factor.'],
  ['Does merge sort make about n log₂ n comparisons on every list?','no: that is the most; on a sorted list it makes ½ n log₂ n',['yes','no: on a sorted list it makes none','no: on a sorted list it makes n²'],'The halvings technique bounds the most comparisons on any list of n items.'],
  ['Must every comparing sort make at least log₂ n! comparisons on every list?','no: on some list; insertion sort makes n − 1 on a sorted one',['yes, by the answer-count technique','yes, and at least n log₂ n','no: only merge sort must'],'Answer-count technique: a sort that learns only by comparing makes at least log₂ n! comparisons on some list of n different items.'],
  ['In T(n) = aT(n/b) + nᵈ, what does r = a/bᵈ measure?','how much each level costs beside the one above it',['how many levels there are','the cost of the pieces of size 1','the size of each piece'],'Level j costs nᵈrʲ. With r < 1 the top level outweighs the rest, with r > 1 the bottom does, and with r = 1 all levels cost the same.']];
QP.push({id:'22l.cost',step:'22l',label:'counting a split',open:()=>measured('22l'),make(){ return writtenQ('22l.cost',L22); }},
  {id:'22l.master',step:'22l',mode:'work',label:'three ways a split can go',open:()=>measured('22l'),make(){
    if(Math.random()<0.25){ const c=rnd(6), j=2+rnd(5), n=2**j, right=String(n*j+c*n), wrong=uniq(right,[n*j,n*n,n*j+c,n*(j+1)+c*n,2*n*j+c*n,n*j+c*n+n,n*(j-1)+c*n].map(String),3);
      return {index:'q:22l.master[u;'+[c,j].join(';')+']', lines:[['T(1) = '+c,'the start'],['T(n) = 2T(n/2) + n','the rule, at every power of 2 from 2 on']], ask:'What is T('+n+')?', right, opts:shuffle([right,...wrong]), lead:'', why:'Unrolling technique: T(n) = n log₂ n + cn. log₂ '+n+' = '+j+', so T('+n+') = '+n+' · '+j+' + '+c+' · '+n+' = '+right+'.'}; }
    const odd=Math.random()<0.25, b=odd?2:2+rnd(3), d=rnd(4), m=rnd(4), a=odd?pick([3,5,7]):b**m, bd=b**d, lg='log'+sub15(b)+' n', low=N22(d), mid=d===0?lg:N22(d)+' '+lg, high=odd?'n^(log₂ '+a+')':N22(m);
    const right=a<bd?low:a===bd?mid:high, wrong=uniq(right,[low,mid,high,N22(d+1),N22(Math.max(m,d)+1),odd?N22(d+2):m===0?lg:N22(m)+' '+lg,'n '+lg,N22(d+m)].filter(v=>v!=='1'),3); if(wrong.length<3) return null;
    return {index:'q:22l.master[m;'+[a,b,d].join(';')+']', lines:[['T(n) = '+(a===1?'':a)+'T(n/'+b+') + '+N22(d),'the rule, at powers of '+b],['r = a/bᵈ','the master technique']], ask:'Which rank has its cost?', right, opts:shuffle([right,...wrong]), lead:'', why:'a = '+a+', b = '+b+', d = '+d+', so r = '+a+'/'+bd+(a<bd?', under 1. The top level outweighs the rest, and the cost has the rank of nᵈ = '+low+'.':a===bd?' = 1. Every level costs '+low+', and there are '+lg+' levels.':', over 1. The bottom level outweighs the rest, and the cost has the rank of n^(log'+sub15(b)+' a)'+(odd?'':' = '+high+', since '+b+sup15(m)+' = '+a)+'.')}; }},
  {id:'22l.halve',step:'22l',mode:'word',label:'halve and halve again',open:()=>measured('22l'),make(){
    const j=3+rnd(6), n=2**j, t=rnd(3);
    const [story,ask,r,why]=t===0?['A pile of '+n+' cards is cut into two equal piles. Each pile is cut in two again, and so on, until every pile holds one card.','How many rounds of cutting are there?',j,'Each round halves the piles, and log₂ '+n+' = '+j+' halvings bring '+n+' down to 1.']
      :t===1?['A knock-out cup starts with '+n+' players. Each round sends home half of those still in.','How many rounds leave one winner?',j,'Each round halves the players, and log₂ '+n+' = '+j+' halvings bring '+n+' down to 1.']
      :['A sorter splits a tray of '+n+' letters into two equal piles, then each pile in two again, and so on, until every pile holds one letter. In each round every letter is moved once.','How many moves are made in all?',n*j,'There are log₂ '+n+' = '+j+' rounds, and each round costs '+n+' moves: '+n+' · '+j+' = '+n*j+'. Every level costs the same, as in the master technique with r = 1.'];
    const right=String(r), wrong=uniq(right,(t===2?[n*n,n*(j+1),n+j,2*n,n*(j-1),n*n/2]:[n/2,n-1,j+1,j-1,2*j,n]).map(String),3);
    return {index:'q:22l.halve['+[t,j].join(';')+']', a3:['22l.halve',DASH,DASH], story, lines:[], ask, right, opts:shuffle([right,...wrong]), lead:'', why}; }});

/* ===== Laundry 5, rung 23 (floor 4 pools, stage V), part 1: 23a to 23f ===== */
Object.assign(STEPS,{'23a':['r23a','Polynomials That Match Every Slope'],'23b':['r23b','How Wrong the Match Is'],'23c':['r23c','How Far a Power Sum Reaches'],'23d':['r23d','Settling Everywhere at Once'],'23e':['r23e','Term by Term'],'23f':['r23f','The Function That Refuses Its Series'],'23g':['r23g','Two Famous Proofs'],'23h':['r23h','Polynomials That Hug a Curve, by Hand'],'23i':['r23i','How Many Terms'],'23j':['r23j','A List Stored in One Function'],'23k':['r23k','Expansions That Diverge yet Help'],'23l':['r23l','Numerical Integration']});
const pol23=(ts,x)=>{ let s=''; ts.filter(t=>t[0]!==0).forEach(([c,p],i)=>{ const a=Math.abs(c), body=p===0?String(a):(a===1?'':a)+(x||'x')+(p===1?'':sup15(p)); s+=(i===0?(c<0?'−':''):(c<0?' − ':' + '))+body; }); return s||'0'; };
const EVERY23='it reaches everywhere', pwf23=(F,n)=>fr(F.p**n,F.q**n);

/* ---------- 23a Polynomials That Match Every Slope ---------- */
const WA23=[
  ['In the match Tₙ, where are the slopes of f taken?','at w, then frozen: they do not move with x',['at x','at some point between w and x','at 0, whatever w is'],'Tₙ(x) = f(w) + f′(w)(x − w) + ⋯ + f⁽ⁿ⁾(w)(x − w)ⁿ/n!. The numbers in front are fixed, so Tₙ is a polynomial.'],
  ['Has √x a match T₃ at w = 0?','no: √x has no slope at 0, so there is nothing to match',['yes: T₃ = 0','yes: T₃ = x/2','no: √x is not continuous at 0'],'The match technique asks for n slopes at w.'],
  ['f and Tₙ agree at w. Is it thereby shown that they agree near w?','no: the match fixes the value and n slopes at w only',['yes, on some interval round w','yes, wherever f is smooth','yes, as far as the first place where f is 0'],'How near they stay away from w is the question of the error.'],
  ['Which number stands in front of (x − w)ᵏ in the match?','f⁽ᵏ⁾(w)/k!',['f⁽ᵏ⁾(w)','f⁽ᵏ⁾(w)/k','k! · f⁽ᵏ⁾(w)'],'The k-th slope of uₖ(x − w)ᵏ at w is k!·uₖ, and matching asks that to be f⁽ᵏ⁾(w).'],
  ['What does it mean that f is smooth on an open interval?','it has slopes of every order there',['it is continuous there','it has a slope there','it is a polynomial there'],'Accepted name: infinitely differentiable. |x| is not smooth at 0.'],
  ['How many polynomials of degree at most n agree with f and its first n slopes at w?','exactly one',['none, unless f is a polynomial','n + 1','endlessly many'],'Match technique: matching fixes each of the n + 1 numbers in front.']];
const M23=[['eˣ',2,'1 + x + x²/2',['1 + x + x²','1 + x + 2x²','x + x²/2'],'Every slope of eˣ at 0 is 1, so the number in front of xᵏ is 1/k!.'],['eˣ',3,'1 + x + x²/2 + x³/6',['1 + x + x²/2 + x³/3','1 + x + x² + x³','1 + x + x²/2 − x³/6'],'Every slope of eˣ at 0 is 1, so the number in front of xᵏ is 1/k!.'],['sin x',3,'x − x³/6',['x − x³/3','x + x³/6','1 − x²/2'],'The slopes of sin at 0 run 0, 1, 0, −1, and 3! = 6.'],['sin x',5,'x − x³/6 + x⁵/120',['x − x³/3 + x⁵/5','x − x³/6 − x⁵/120','x + x³/6 + x⁵/120'],'The slopes of sin at 0 run 0, 1, 0, −1, 0, 1, and 5! = 120.'],['sin x',2,'x',['x − x²/2','1 + x','x + x²/2'],'The slopes of sin at 0 run 0, 1, 0: sin has no x² piece, so its match of degree 2 is its match of degree 1.'],['cos x',2,'1 − x²/2',['1 + x²/2','x − x²/2','1 − x²'],'The slopes of cos at 0 run 1, 0, −1.'],['cos x',4,'1 − x²/2 + x⁴/24',['1 − x²/2 + x⁴/4','1 − x²/2 − x⁴/24','1 + x²/2 + x⁴/24'],'The slopes of cos at 0 run 1, 0, −1, 0, 1, and 4! = 24.'],['ln(1 + x)',3,'x − x²/2 + x³/3',['x − x²/2 + x³/6','x + x²/2 + x³/3','1 + x − x²/2'],'The k-th slope of ln(1 + x) at 0 is ±(k − 1)!, and (k − 1)!/k! = 1/k.'],['ln(1 + x)',2,'x − x²/2',['x + x²/2','x − x²','1 − x/2'],'The slopes at 0 run 0, 1, −1.']];
QP.push({id:'23a.what',step:'23a',label:'what the match is',open:()=>measured('23a'),make(){ return writtenQ('23a.what',WA23); }},
  {id:'23a.match',step:'23a',mode:'work',label:'matches by hand',open:()=>measured('23a'),make(){
    const k=rnd(4);
    if(k===0){ const [f,n,right,wrong,why]=pick(M23);
      return {index:'q:23a.match[s;'+f+';'+n+']', lines:[['f(x) = '+f,'given'],['w = 0','the point of matching']], ask:'Which is its match T'+sub15(n)+'?', right, opts:shuffle([right,...wrong]), lead:'', why}; }
    if(k===1){ const m=3+rnd(3), a=pick([1,2,-1,3,-2]), c=m*(m-1)/2*a**(m-2), right=sg(c), wrong=num13(right,[m*(m-1)*a**(m-2),m*a**(m-1),a**m,m*(m-1)/2,-c,c*a]);
      return {index:'q:23a.match[p;'+[m,a].join(';')+']', lines:[['f(x) = x'+sup15(m),'given'],['w = '+sg(a),'the point of matching']], ask:'Which number stands in front of (x − w)² in its match?', right, opts:shuffle([right,...wrong]), lead:'', why:'f″(x) = '+m*(m-1)+(m===3?'x':'x'+sup15(m-2))+', so f″('+sg(a)+') = '+sg(m*(m-1)*a**(m-2))+'. Divide by 2! = 2: '+right+'.'}; }
    if(k===2){ const A=rnd(7)-3, B=rnd(7)-3, C=2*(rnd(7)-3), D=pick([-6,-3,-2,-1,1,2,3,6,12]), T=fadd(fint(A+B+C/2),fr(D,6)), right=fshow(T), wrong=frs16(right,[fint(A+B+C+D),fadd(fint(A+B+C/2),fr(D,3)),fint(A+B+C/2),fadd(fint(A+B+C/2),fr(D,2)),fadd(fint(A+B+C),fr(D,6)),fint(A)]); if(wrong.length<3) return null;
      return {index:'q:23a.match[v;'+[A,B,C,D].join(';')+']', lines:[['f(w) = '+sg(A)+', f′(w) = '+sg(B)+', f″(w) = '+sg(C)+', f‴(w) = '+sg(D),'given']], ask:'What is T₃(w + 1)?', right, opts:shuffle([right,...wrong]), lead:'', why:'T₃(x) = f(w) + f′(w)(x − w) + f″(w)(x − w)²/2! + f‴(w)(x − w)³/3!. With x − w = 1: '+sg(A)+pm(B)+' + '+par10(C)+'/2 + '+par10(D)+'/6 = '+right+'.'}; }
    const c=pick([2,3,-1,-2,4]), j=2+rnd(3), R=fr(c**j,fact16(j)), right=fshow(R), wrong=frs16(right,[fint(c**j),fr(c,fact16(j)),fr(c**j,j),fneg(R),fr(1,fact16(j)),fr(c**(j-1),fact16(j-1))]); if(wrong.length<3) return null;
    return {index:'q:23a.match[e;'+[c,j].join(';')+']', lines:[['f(x) = e^('+cf22(c,'x')+')','given'],['w = 0','the point of matching']], ask:'Which number stands in front of x'+sup15(j)+' in its match?', right, opts:shuffle([right,...wrong]), lead:'', why:'Each slope brings out one more '+sg(c)+' by the chain rule, so f'+(j===2?'″':j===3?'‴':'⁽⁴⁾')+'(0) = '+par10(c)+sup15(j)+' = '+sg(c**j)+'. Divide by '+j+'! = '+fact16(j)+': '+right+'.'}; }});

/* ---------- 23b How Wrong the Match Is ---------- */
const WB23=[
  ['In the match-error technique, where is the slope f⁽ⁿ⁺¹⁾ taken?','at some c between w and x',['at w','at x','at the midpoint of w and x'],'Rₙ(x) = f⁽ⁿ⁺¹⁾(c)(x − w)ⁿ⁺¹/(n + 1)! for some c between w and x. The technique does not say where c is.'],
  ['f is smooth. Must Tₙ(x) head to f(x) as n grows?','no: the error must be shown to head to 0; ln(1 + x) at x = 2 is smooth and its sum wanders',['yes: a smooth f has every match','yes, by the match-error technique','no: Tₙ(x) heads to f(x) only at x = w'],'The match-error technique gives the error a shape. Whether it heads to 0 is a separate question each time.'],
  ['Is |Rₙ(x)| ≤ |x − w|ⁿ⁺¹/(n + 1)! for every f?','no: only with the ceiling K = 1 on the slope; eˣ needs e^|x|',['yes, by the error-ceiling technique','yes, if f is smooth','no: it holds for no f'],'Error-ceiling technique: |Rₙ(x)| ≤ K|x − w|ⁿ⁺¹/(n + 1)!, where K is a ceiling on |f⁽ⁿ⁺¹⁾| between w and x.'],
  ['For which x does the error ceiling show that the matches of sin head to sin x?','for every x: every slope is ±sin or ±cos, so K = 1',['only for |x| < 1','only for |x| ≤ π','only for x = 0'],'|Rₙ(x)| ≤ |x|ⁿ⁺¹/(n + 1)!, and that heads to 0 for any x.'],
  ['What is Rₙ(x)?','f(x) − Tₙ(x), what the match leaves over',['Tₙ₊₁(x) − Tₙ(x), the next piece','f⁽ⁿ⁾(x), the n-th slope','f(x) − f(w)'],'The error is the next piece with its slope taken somewhere between, not the next piece itself.']];
QP.push({id:'23b.err',step:'23b',label:'the error of a match',open:()=>measured('23b'),make(){ return writtenQ('23b.err',WB23); }},
  {id:'23b.ceil',step:'23b',mode:'work',label:'a ceiling on the error',open:()=>measured('23b'),make(){
    const k=rnd(4);
    if(k===0){ const q=pick([2,3,4,5,10]), n=1+rnd(4), fn=pick(['sin','cos']), R=fr(1,q**(n+1)*fact16(n+1)), right=fshow(R), wrong=frs16(right,[fr(1,q**n*fact16(n)),fr(1,q**(n+1)),fr(1,fact16(n+1)),fr(1,q**(n+1)*(n+1)),fr(1,q**n*fact16(n+1)),fr(1,q*fact16(n+1))]); if(wrong.length<3) return null;
      return {index:'q:23b.ceil[t;'+[fn,q,n].join(';')+']', lines:[['f = '+fn+', w = 0, x = 1/'+q,'given'],['|f'+(n===1?'″':n===2?'‴':'⁽'+sup15(n+1)+'⁾')+'| ≤ 1 everywhere','every slope is ±sin or ±cos']], ask:'Which ceiling does the error-ceiling technique put on |R'+sub15(n)+'(x)|?', right, opts:shuffle([right,...wrong]), lead:'', why:'K|x − w|ⁿ⁺¹/(n + 1)! with K = 1 and n = '+n+': (1/'+q+')'+sup15(n+1)+'/'+(n+1)+'! = 1/('+q**(n+1)+' · '+fact16(n+1)+') = '+right+'.'}; }
    if(k===1){ const n=2+rnd(6), R=fr(3,fact16(n+1)), right=fshow(R), wrong=frs16(right,[fr(1,fact16(n+1)),fr(3,fact16(n)),fr(3,n+1),fr(1,fact16(n)),fr(3,fact16(n+2)),fr(3,(n+1)*(n+1))]); if(wrong.length<3) return null;
      return {index:'q:23b.ceil[e;'+n+']', lines:[['f(x) = eˣ, w = 0, x = 1','given'],['every slope of f is eᵗ, and eᵗ ≤ e < 3 between 0 and 1','exp climbs']], ask:'With K = 3, which ceiling does the error-ceiling technique put on |R'+sub15(n)+'(1)|?', right, opts:shuffle([right,...wrong]), lead:'', why:'K|x − w|ⁿ⁺¹/(n + 1)! = 3 · 1/'+(n+1)+'! = 3/'+fact16(n+1)+(right==='3/'+fact16(n+1)?'':' = '+right)+'.'}; }
    if(k===2){ const K=1+rnd(6), d=pick([fr(1,2),fr(1,3),fint(1),fint(2),fr(3,2)]), n=1+rnd(3), R=fmul(fint(K),fmul(pwf23(d,n+1),fr(1,fact16(n+1)))), right=fshow(R), wrong=frs16(right,[fmul(fint(K),fmul(pwf23(d,n),fr(1,fact16(n)))),fmul(fint(K),pwf23(d,n+1)),fmul(pwf23(d,n+1),fr(1,fact16(n+1))),fmul(fint(K),fmul(pwf23(d,n+1),fr(1,n+1))),fmul(fint(K),fmul(d,fr(1,fact16(n+1)))),fr(K,fact16(n+1))]); if(wrong.length<3) return null;
      return {index:'q:23b.ceil[g;'+[K,d.p,d.q,n].join(';')+']', lines:[['|f'+(n===1?'″':n===2?'‴':'⁽⁴⁾')+'| ≤ '+K+' between w and x','given'],['|x − w| = '+fshow(d),'given']], ask:'Which ceiling does the error-ceiling technique put on |R'+sub15(n)+'(x)|?', right, opts:shuffle([right,...wrong]), lead:'', why:'K|x − w|ⁿ⁺¹/(n + 1)! = '+K+' · '+fpar22(d)+sup15(n+1)+'/'+(n+1)+'! = '+K+' · '+fshow(pwf23(d,n+1))+'/'+fact16(n+1)+' = '+right+'.'}; }
    const e=Math.random()<0.5, K=e?3:1, tol=pick([10,100,1000,10000,100000]); let n=0; while(fact16(n+1)<K*tol) n++;
    const right=String(n), wrong=uniq(right,[n-1,n+1,n+2,n-2,2*n].filter(v=>v>0).map(String),3);
    return {index:'q:23b.ceil[n;'+[K,tol].join(';')+']', lines:[e?['f(x) = eˣ, w = 0, x = 1, and K = 3','eᵗ < 3 between 0 and 1']:['f = sin, w = 0, x = 1, and K = 1','every slope is ±sin or ±cos'],['|Rₙ(1)| ≤ '+(K===1?'1':K)+'/(n + 1)!','the error-ceiling technique']], ask:'What is the least n for which this ceiling is at most 1/'+tol+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'(n + 1)! must be at least '+K*tol+'. '+n+'! = '+fact16(n)+' is too small, and '+(n+1)+'! = '+fact16(n+1)+' is enough, so n = '+n+'.'}; }},
  {id:'23b.line',step:'23b',mode:'proof',label:'where the slope is taken',open:()=>measured('23b'),make(){
    const V=[
      ['c1',[['f has n + 1 slopes on an interval holding w and x','given'],['Rₙ(x) = f⁽ⁿ⁺¹⁾(c)(x − w)ⁿ⁺¹/(n + 1)! for some c between w and x','the match-error technique']],2,0,'That is the technique: the next piece, with its slope taken somewhere between w and x.'],
      ['c2',[['f has n + 1 slopes on an interval holding w and x','given'],['Rₙ(x) = f⁽ⁿ⁺¹⁾(w)(x − w)ⁿ⁺¹/(n + 1)!','the match-error technique']],2,1,'The slope is taken at some c between w and x, not at w. With the slope at w this would be the next piece of the match, not the error.'],
      ['c3',[['f has n + 1 slopes on an interval holding w and x','given'],['Rₙ(x) = f⁽ⁿ⁺¹⁾(c)(x − w)ⁿ⁺¹/(n + 1)!, with c the midpoint of w and x','the match-error technique']],2,1,'The technique says some c between w and x. It does not say where.'],
      ['k1',[['|f⁽ⁿ⁺¹⁾| ≤ K between w and x','given'],['|Rₙ(x)| ≤ K|x − w|ⁿ⁺¹/(n + 1)!','the error-ceiling technique']],2,0,'Wherever c lies between w and x, the slope there is at most K in size.'],
      ['k2',[['|f⁽ⁿ⁺¹⁾(w)| ≤ K','given'],['|Rₙ(x)| ≤ K|x − w|ⁿ⁺¹/(n + 1)!','the error-ceiling technique']],2,1,'The ceiling must hold all the way between w and x, since c may be anywhere there. A ceiling at w alone is not enough.'],
      ['s1',[['f is smooth on an interval holding w and x','given'],['Tₙ(x) heads to f(x) as n grows','the match-error technique']],2,1,'The error must be shown to head to 0. ln(1 + x) is smooth at x = 2, and its matches at 0 wander there.'],
      ['s2',[['every slope of f is at most 1 in size, everywhere','given'],['|Rₙ(x)| ≤ |x − w|ⁿ⁺¹/(n + 1)!','the error-ceiling technique, with K = 1'],['Tₙ(x) heads to f(x) as n grows','for any x, xⁿ/n! → 0']],3,0,'The ceiling on the error heads to 0, so the error does. This is how sin and cos are rebuilt at every x.']];
    const [tag,L0,n,r,why]=pick(V), F=pick(['f','g','h']), nn=tag[0]==='s'?0:pick([0,2,3,4]);
    const fix=s=>{ let t=s.replace(/(^|[^a-zA-Z])f(?=[⁽ ]|$)/g,'$1'+F); if(nn) t=t.replace(/ⁿ⁺¹/g,sup15(nn+1)).replace(/Rₙ/g,'R'+sub15(nn)).replace(/\(n \+ 1\)!/g,(nn+1)+'!').replace(/n \+ 1 slopes/,(nn+1)+' slopes'); return t; }, lines=L0.map(l=>[fix(l[0]),fix(l[1])]);
    return {index:'q:23b.line['+[tag,F,nn].join(';')+']', stack:true, lines, ask:'Is line '+n+' licensed?', right:YN22[r], opts:YN22, lead:'', why}; }});

/* ---------- 23c How Far a Power Sum Reaches ---------- */
const WC23=[
  ['A power sum about w has the reach R = 1. Does it settle at x = w + 1?','not decided: at the edges anything can happen',['yes: the edge belongs to the reach','no: it wanders at both edges','yes, but only by taking turns'],'Inside the reach it settles in size, outside it wanders, and each edge must be tested by itself.'],
  ['A power sum about 0 settles at x₀. Must it settle at −x₀?','no: only at every x nearer to 0 than x₀; Σ xᵏ/k settles at −1 and wanders at 1',['yes, by the reach technique','yes: x₀ and −x₀ are as far from 0','no: it then wanders at every x < 0'],'Reach technique: it settles in size at every x nearer to the centre than x₀ is. The other edge is as far, not nearer.'],
  ['f is smooth everywhere. Must its power sum about 0 reach everywhere?','no: 1/(1 + x²) is smooth along the whole line, and its sum about 0 has the reach 1',['yes: a smooth function has no edge','yes, by the reach-of-a-sum technique','no: no power sum reaches everywhere'],'Its sum is the geometric sum with ratio −x², which wanders once |x| ≥ 1.'],
  ['Inside its reach, how does a power sum settle?','in size',['only by taking turns','only at the centre','it need not settle there'],'Reach-of-a-sum technique: it settles in size where |x − w| < R, and wanders where |x − w| > R.'],
  ['|uₖ₊₁/uₖ| heads to L > 0. What is the reach of Σ uₖ(x − w)ᵏ?','1/L',['L','L²','1 − L'],'Reach-by-ratio technique: the ratio of neighbouring pieces heads to L|x − w|, and the ratio test asks that to be under 1.'],
  ['What is a power sum about w?','Σ uₖ(x − w)ᵏ, with real numbers uₖ in front',['any endless sum of functions','a polynomial in x − w','Σ uₖ · kˣ'],'Accepted name: a power series. For each x it is an endless sum of reals, which settles or wanders.']];
QP.push({id:'23c.sum',step:'23c',label:'power sums and their reach',open:()=>measured('23c'),make(){ return writtenQ('23c.sum',WC23); }},
  {id:'23c.reach',step:'23c',mode:'work',label:'finding the reach',open:()=>measured('23c'),make(){
    const k=rnd(4), c=2+rnd(4), m=1+rnd(3), [a,b]=pick(R22), w=rnd(9)-3;
    if(k<2){ const Rs=F=>F==='E'?EVERY23:F.p===0?'R = 0: it settles only at the centre':'R = '+fshow(F), [u,R,L]=pick([[c+'ᵏ',fr(1,c),String(c)],['1/'+c+'ᵏ',fint(c),'1/'+c],['k'+(m===1?'':sup15(m))+'/'+c+'ᵏ',fint(c),'1/'+c],['1/k!','E','0'],['k!',fint(0),''],[c+'ᵏ/k!','E','0'],['1/(k · '+c+'ᵏ)',fint(c),'1/'+c],['('+a+'/'+b+')ᵏ',fr(b,a),a+'/'+b],['k · '+c+'ᵏ',fr(1,c),String(c)],['kᵏ',fint(0),'']]);
      const right=Rs(R), wrong=uniq(right,shuffle([Rs(fr(1,c)),Rs(fint(c)),Rs(fint(1)),Rs(fr(a,b)),Rs(fr(b,a))]).concat([Rs('E'),Rs(fint(0))]),3);
      return {index:'q:23c.reach[r;'+u+']', lines:[['Σ uₖ(x − w)ᵏ with uₖ = '+u,'a power sum'+(u[0]==='1'&&u.indexOf('(k')>0?', from k = 1':'')]], ask:'How far does it reach?', right, opts:shuffle([right,...wrong]), lead:'', why:'Reach-by-ratio technique: |uₖ₊₁/uₖ| '+(R==='E'?'heads to 0, so the sum reaches everywhere.':R.p===0?'passes every ceiling, so the reach is 0.':'heads to L = '+L+', so the reach is 1/L = '+fshow(R)+'.')}; }
    if(k===2){ const f=(lo,hi)=>sg(lo)+' < x < '+sg(hi), right=f(w-c,w+c), wrong=uniq(right,[f(-c,c),f(w,w+c),f(w-1,w+1),'every x',f(w-c,w),f(w-2*c,w+2*c)],3);
      return {index:'q:23c.reach[i;'+[w,c].join(';')+']', lines:[['Σ (x'+pm(-w).replace(' − 0','').replace(' + 0','')+')ᵏ/'+c+'ᵏ','a power sum about '+sg(w)],['its reach is '+c,'the reach-by-ratio technique']], ask:'On which stretch does it settle in size?', right, opts:shuffle([right,...wrong]), lead:'', why:'Inside the reach means |x − w| < R, here |x'+pm(-w).replace(' − 0','').replace(' + 0','')+'| < '+c+': from '+sg(w-c)+' to '+sg(w+c)+', the edges left open.'}; }
    const O=['it wanders at both','it wanders at 1 and settles at −1','it settles at both','it settles at 1 and wanders at −1'], [u,r,why]=pick([['Σ xᵏ',0,'At both edges the pieces are 1 in size and do not head to 0.'],['Σ xᵏ/k',1,'At 1 it is the harmonic sum. At −1 the signs take turns and the sizes fall to 0, so the bracket settles it.'],['Σ xᵏ/k²',2,'At both edges it is, in size, the p-sum with p = 2.'],['Σ (−1)ᵏxᵏ/k',3,'At 1 the signs take turns and the bracket settles it. At −1 every piece is 1/k, the harmonic sum.'],['Σ k · xᵏ',0,'At both edges the pieces grow in size.'],['Σ xᵏ/k³',2,'At both edges it is, in size, the p-sum with p = 3.'],['Σ xᵏ/√k',1,'At 1 it is the p-sum with p = ½, which wanders. At −1 the bracket settles it.']]);
    return {index:'q:23c.reach[e;'+u+']', lines:[[u+', from k = 1','a power sum about 0 with the reach 1']], ask:'What happens at the edges x = 1 and x = −1?', right:O[r], opts:shuffle(O.slice()), lead:'', why}; }});

/* ---------- 23d Settling Everywhere at Once ---------- */
const WD23=[
  ['Each fₙ is continuous, and fₙ settles at each point to f. Must f be continuous?','no: xⁿ on [0, 1] settles at each point to a function that jumps at 1',['yes, by the kept-continuity technique','yes: a limit of continuous functions is continuous','no: such an f is never continuous'],'The kept-continuity technique asks for settling everywhere at once.'],
  ['xⁿ settles everywhere at once on [0, r] for each r < 1. Does it settle everywhere at once on [0, 1)?','no: for each n some x under 1 still has xⁿ ≥ ½',['yes: [0, 1) is made of the stretches [0, r]','yes: take the largest of the N for each r','no: it does not settle at each point of [0, 1)'],'Each r has its own N, and those N have no ceiling as r nears 1. One N for the whole of [0, 1) does not exist.'],
  ['What changes between settling at each point and settling everywhere at once?','only the order: one N for each ε that works for every x, in place of an N that may depend on x',['the limit function f','the challenge: ε may now depend on x','nothing: they are two names for one thing'],'At each point: for every ε and every x there is an N. Everywhere at once: for every ε there is one N for every x.'],
  ['|fₖ(x)| ≤ Mₖ for every x in D and every k, and Σ Mₖ settles. What follows?','Σ fₖ settles everywhere at once on D',['Σ fₖ settles at each point of D, and no more is shown','each fₖ is continuous on D','Σ fₖ = Σ Mₖ on D'],'At-once comparison technique: the tail is bounded by the tail of Σ Mₖ, with no x left in it.'],
  ['Each fₙ is continuous at w, and fₙ settles everywhere at once to f near w. What is kept?','continuity: f is continuous at w',['the slope: f has a slope at w','the value: f(w) = fₙ(w) for every n','nothing is kept'],'Kept-continuity technique. One n is good at x and at w together, and ε is split in three.']];
QP.push({id:'23d.once',step:'23d',label:'at each point, or at once',open:()=>measured('23d'),make(){ return writtenQ('23d.once',WD23); }},
  {id:'23d.gap',step:'23d',mode:'work',label:'the largest gap',open:()=>measured('23d'),make(){
    const k=rnd(3), a=2+rnd(8), [p,q]=pick(R22), r=p+'/'+q, n=2+rnd(3);
    if(k===0){ const R=pwf23(fr(p,q),n), right=fshow(R), wrong=frs16(right,[fr(p,q),fr(p*n,q),pwf23(fr(p,q),n+1),fint(1),fr(p,q**n),fint(0)]); if(wrong.length<3) return null;
      return {index:'q:23d.gap[x;'+[p,q,n].join(';')+']', lines:[['fₙ(x) = xⁿ on [0, '+r+']','a list of functions'],['it settles at each point to f(x) = 0','since '+r+' < 1']], ask:'How large is the largest gap |fₙ(x) − f(x)| on [0, '+r+'], for n = '+n+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'xⁿ climbs with x, so the largest gap is at x = '+r+': ('+r+')'+sup15(n)+' = '+right+'. The largest gap heads to 0 as n grows, so the list settles everywhere at once on [0, '+r+'].'}; }
    if(k===1){ const I=[
        ['fₙ(x) = xⁿ on [0, '+r+']','yes: the largest gap is ('+r+')ⁿ, which heads to 0',['no: the limit jumps at 1','yes: every list that settles at each point does','no: the gap at x = '+r+' never shrinks'],'One N works for every x in [0, '+r+'], since the gap is largest at x = '+r+'.'],
        ['fₙ(x) = xⁿ on [0, 1)','no: for every n the gaps come as near 1 as you like',['yes: the largest gap is 0','yes: it settles at each point to 0','no: it does not settle at x = ½'],'For any n, x just under 1 has xⁿ just under 1. No single N brings every gap under ½.'],
        ['fₙ(x) = x/n on the whole line','no: for every n the gap |x|/n has no ceiling',['yes: the largest gap is 1/n','yes: it settles at each point to 0','no: it settles at no point'],'It settles at each point to 0, but for any n the gap at x = n is already 1.'],
        ['fₙ(x) = x/n on [0, '+a+']','yes: the largest gap is '+a+'/n, which heads to 0',['no: for every n the gap has no ceiling','no: the limit is not continuous','yes: every list of continuous functions does'],'On a stretch with a ceiling the gap x/n is at most '+a+'/n, whatever x is.'],
        ['fₙ(x) = sin(nx)/n on the whole line','yes: every gap is at most 1/n, which heads to 0',['no: sin(nx) wanders','no: the whole line has no ceiling','yes, but only on stretches [−r, r]'],'|sin| ≤ 1 everywhere, so one N works for every x.'],
        ['fₙ(x) = x + '+a+'/n on the whole line','yes: every gap is '+a+'/n, which heads to 0',['no: x has no ceiling on the whole line','no: the limit x is not bounded','yes, but only on stretches [−r, r]'],'The gap fₙ(x) − x has no x left in it.']];
      const [u,right,wrong,why]=pick(I);
      return {index:'q:23d.gap[j;'+u+']', lines:[[u,'a list of functions']], ask:'Does it settle everywhere at once there?', right, opts:shuffle([right,...wrong]), lead:'', why}; }
    const pw=2+rnd(3), [u,right,why]=pick([['Σ sin(kx)/k'+sup15(pw)+' on the whole line','Mₖ = 1/k'+sup15(pw),'|sin| ≤ 1, and the p-sum with p = '+pw+' settles.'],['Σ cos(kx)/k'+sup15(pw)+' on the whole line','Mₖ = 1/k'+sup15(pw),'|cos| ≤ 1, and the p-sum with p = '+pw+' settles.'],['Σ xᵏ on [−1/'+q+', 1/'+q+']','Mₖ = 1/'+q+'ᵏ','|x|ᵏ ≤ 1/'+q+'ᵏ there, and that geometric sum settles.'],['Σ xᵏ/k! on [−'+a+', '+a+']','Mₖ = '+a+'ᵏ/k!','|x|ᵏ ≤ '+a+'ᵏ there, and Σ '+a+'ᵏ/k! settles by the ratio test.'],['Σ xᵏ/k² on [−1, 1]','Mₖ = 1/k²','|x|ᵏ ≤ 1 there, and the p-sum with p = 2 settles.']]);
    const wrong=uniq(right,['Mₖ = 1/k','Mₖ = 1','Mₖ = |x|ᵏ','Mₖ = k','Mₖ = 1/√k'],3);
    return {index:'q:23d.gap[m;'+u+']', lines:[[u+', from k = 1','a sum of functions'],['|fₖ(x)| ≤ Mₖ for every x there, and Σ Mₖ settles','what the at-once comparison technique asks']], ask:'Which Mₖ shows that it settles everywhere at once?', right, opts:shuffle([right,...wrong]), lead:'', why:why+' Mₖ must have no x in it, must sit over every piece, and its sum must settle: Σ 1/k, Σ 1/√k, Σ 1 and Σ k wander.'}; }},
  {id:'23d.line',step:'23d',mode:'proof',label:'what at once buys',open:()=>measured('23d'),make(){
    const K='the kept-continuity technique', A='the at-once comparison technique', V=[
      ['k1',[['each fₙ is continuous at w','given'],['fₙ settles everywhere at once to f near w','given'],['f is continuous at w',K]],3,0,'One n is good at x and at w together, so f can be compared through that single fₙ.'],
      ['k2',[['each fₙ is continuous at w','given'],['fₙ settles at each point to f near w','given'],['f is continuous at w',K]],3,1,'Settling at each point gives an n for x and another for w, and no single fₙ to compare through. xⁿ on [0, 1] settles at each point to a function that jumps at 1.'],
      ['a1',[['|fₖ(x)| ≤ Mₖ for every x in D and every k','given'],['Σ Mₖ settles','given'],['Σ fₖ settles everywhere at once on D',A]],3,0,'The tail of Σ fₖ(x) is at most the tail of Σ Mₖ, which heads to 0 and has no x in it.'],
      ['a2',[['|fₖ(x)| ≤ Mₖ for every x in D and every k','given'],['Mₖ → 0','given'],['Σ fₖ settles everywhere at once on D',A]],3,1,'The technique asks for Σ Mₖ to settle. Mₖ = 1/k heads to 0 and its sum wanders.'],
      ['a3',[['|xᵏ| ≤ |x|ᵏ for every x in (−1, 1)','given'],['Σ |x|ᵏ settles for each such x','a geometric sum'],['Σ xᵏ settles everywhere at once on (−1, 1)',A]],3,1,'The bound |x|ᵏ still has x in it. The technique asks for one number Mₖ over the whole of D, and on (−1, 1) the only such number is 1.'],
      ['e1',[['continuous fₙ settle everywhere at once to f on [p, q]','given'],['∫ₚ^q fₙ heads to ∫ₚ^q f','one N bounds the gap at every input, so it bounds the gap in areas']],2,0,'If every gap is under ε, the areas differ by at most ε(q − p).']];
    const [tag,L0,n,r,why0]=pick(V), F=pick(['f','g','h']), D=tag==='a3'?'D':pick(['D','[0, 1]','the whole line','[p, q]']);
    const fix=s=>s.replace(/(^|[^a-zA-Z])f(?=[ₙₖ ]|$)/g,'$1'+F).replace(/\bD\b/g,D), lines=L0.map(l=>[fix(l[0]),fix(l[1])]), why=fix(why0);
    return {index:'q:23d.line['+[tag,F,D].join(';')+']', stack:true, lines, ask:'Is line '+n+' licensed?', right:YN22[r], opts:YN22, lead:'', why}; }});

/* ---------- 23e Term by Term ---------- */
const WE23=[
  ['fₙ settles at each point to f on [0, 1]. Must ∫₀¹ fₙ head to ∫₀¹ f?','no: n²x(1 − x)ⁿ has areas heading to 1, and its limit has area 0',['yes, by the area-at-once technique','yes, if each fₙ is continuous','no: the areas never settle'],'The area-at-once technique asks for settling everywhere at once.'],
  ['A power sum settles at an edge of its reach. Must its slope sum settle there?','no: Σ xᵏ/k² settles at 1, and its slope sum Σ xᵏ⁻¹/k is the harmonic sum there',['yes, by the same-reach technique','yes: the slope sum has smaller pieces','no: a slope sum never settles at an edge'],'The same-reach technique gives the two sums the same reach. It says nothing about the edges.'],
  ['Is (Σ fₖ)′ = Σ fₖ′ for any functions fₖ?','no: it is proved for power sums, inside the reach',['yes: the slope of a sum is the sum of the slopes','yes, wherever Σ fₖ settles','no: not even for power sums'],'For finitely many functions the slope of a sum is the sum of the slopes. For endlessly many it needs a proof, and the term-by-term technique gives one for power sums.'],
  ['How do the reach of a power sum and the reach of its slope sum compare?','they are the same',['the slope sum reaches less far','the slope sum reaches further','it depends on the numbers in front'],'Same-reach technique.'],
  ['Inside its reach, f(x) = Σ uₖ(x − w)ᵏ. What is uₖ?','f⁽ᵏ⁾(w)/k!',['f⁽ᵏ⁾(w)','f(w + k)','it cannot be told from f'],'Smooth-sum technique: a power sum is smooth inside its reach, and it is its own matching sum. So one total near w has only one power sum about w.']];
const U23=[['2ᵏ',k=>fint(2**k)],['1/k!',k=>fr(1,fact16(k))],['k + 1',k=>fint(k+1)],['1/3ᵏ',k=>fr(1,3**k)],['(−1)ᵏ',k=>fint(k%2?-1:1)],['k²',k=>fint(k*k)],['1/(k + 1)',k=>fr(1,k+1)],['(−2)ᵏ',k=>fint((-2)**k)]];
const G23=[['1/(1 − x)²','the slope of 1/(1 − x) = 1 + x + x² + ⋯','1 + 2x + 3x² + 4x³ + ⋯'],['ln(1 + x)','the area of 1/(1 + t) = 1 − t + t² − ⋯ from 0 to x','x − x²/2 + x³/3 − x⁴/4 + ⋯'],['arctan x','the area of 1/(1 + t²) = 1 − t² + t⁴ − ⋯ from 0 to x','x − x³/3 + x⁵/5 − x⁷/7 + ⋯'],['−ln(1 − x)','the area of 1/(1 − t) = 1 + t + t² + ⋯ from 0 to x','x + x²/2 + x³/3 + x⁴/4 + ⋯'],['1/(1 + x)²','minus the slope of 1/(1 + x) = 1 − x + x² − ⋯','1 − 2x + 3x² − 4x³ + ⋯']];
QP.push({id:'23e.swap',step:'23e',label:'term by term',open:()=>measured('23e'),make(){ return writtenQ('23e.swap',WE23); }},
  {id:'23e.term',step:'23e',mode:'work',label:'slopes and areas of sums',open:()=>measured('23e'),make(){
    const k=rnd(3), [name,u]=pick(U23), j=2+rnd(3);
    if(k===0){ const R=fmul(fint(j+1),u(j+1)), right=fshow(R), wrong=frs16(right,[fmul(fint(j),u(j)),u(j+1),u(j),fmul(fint(j+1),u(j)),fmul(fr(1,j+1),u(j+1)),fmul(fint(j),u(j+1))]); if(wrong.length<3) return null;
      return {index:'q:23e.term[s;'+name+';'+j+']', lines:[['f(x) = Σ uₖxᵏ with uₖ = '+name,'a power sum, inside its reach'],['f′(x) = Σ k uₖxᵏ⁻¹','the term-by-term technique']], ask:'Which number stands in front of x'+sup15(j)+' in f′?', right, opts:shuffle([right,...wrong]), lead:'', why:'x'+sup15(j)+' comes from the piece with x'+sup15(j+1)+': its slope is '+(j+1)+' · u'+sub15(j+1)+' · x'+sup15(j)+', and u'+sub15(j+1)+' = '+fshow(u(j+1))+'. So '+(j+1)+' · '+fpar22(u(j+1))+' = '+right+'.'}; }
    if(k===1){ const R=fmul(fr(1,j),u(j-1)), right=fshow(R), wrong=frs16(right,[fmul(fr(1,j),u(j)),u(j-1),fmul(fr(1,j-1),u(j-1)),fmul(fint(j),u(j-1)),fmul(fr(1,j+1),u(j)),fmul(fr(1,j+1),u(j-1))]); if(wrong.length<3) return null;
      return {index:'q:23e.term[a;'+name+';'+j+']', lines:[['f(x) = Σ uₖxᵏ with uₖ = '+name,'a power sum, inside its reach'],['∫₀ˣ f = Σ uₖxᵏ⁺¹/(k + 1)','the term-by-term technique']], ask:'Which number stands in front of x'+sup15(j)+' in ∫₀ˣ f?', right, opts:shuffle([right,...wrong]), lead:'', why:'x'+sup15(j)+' comes from the piece with x'+sup15(j-1)+': its area is u'+sub15(j-1)+' · x'+sup15(j)+'/'+j+', and u'+sub15(j-1)+' = '+fshow(u(j-1))+', so the number in front is '+right+'.'}; }
    const [f,how,right]=pick(G23), wrong=take(G23.map(g=>g[2]).concat(['x − x³/3! + x⁵/5! − x⁷/7! + ⋯','1 + x + x²/2! + x³/3! + ⋯']).filter(s=>s!==right),3);
    return {index:'q:23e.term[g;'+f+']', lines:[['f(x) = '+f+', for −1 < x < 1','given'],['it is '+how,'known']], ask:'Which sum does the term-by-term technique give for f?', right, opts:shuffle([right,...wrong]), lead:'', why:'Take the '+(how.indexOf('slope')>=0?'slope':'area')+' of each piece. The new sum has the same reach, 1, and inside it the total is f.'}; }});

/* ---------- 23f The Function That Refuses Its Series ---------- */
const WF23=[
  ['f is smooth at w. Must its matching sum at w rebuild f near w?','no: e^(−1/x²), with the value 0 at 0, is smooth, and its matching sum at 0 is 0',['yes: smooth means it has every match','yes, inside the reach of the sum','no: a smooth f never equals its matching sum'],'Flat-point technique: every slope of that function at 0 is 0, yet the function is positive away from 0.'],
  ['The matching sum of f settles at x. Must it settle at f(x)?','no: for e^(−1/x²) it settles at 0 for every x, and f(x) is not 0',['yes: where it settles, it settles at f','yes, by the smooth-sum technique','no: then f(x) has no value'],'Settling and settling at f are two questions. The error Rₙ(x) must be shown to head to 0.'],
  ['To find the slopes of e^(−1/x²) at 0, may you put ∞ in: Pₙ(∞) · e^(−∞)?','no: ∞ is not a number to put in; the limit needs f(x)/xᵐ → 0',['yes: e^(−∞) = 0','yes: anything times 0 is 0','no: the slopes at 0 do not exist'],'A polynomial in 1/x grows as x nears 0 while e^(−1/x²) shrinks. Which wins has to be proved: powers lose to exponentials.'],
  ['Every slope of f at 0 is 0. What is its matching sum at 0?','0, and it reaches everywhere',['f itself','it has none','0, with the reach 0'],'Every piece is 0, so the sum settles at 0 for every x.'],
  ['f and g are smooth and have all the same slopes at 0. Must they agree near 0?','no: add e^(−1/x²) to f, and every slope at 0 stays the same',['yes, by the match technique','yes, by the smooth-sum technique','no: they then differ at 0 too'],'The slopes at one point fix the matching sum. They do not fix the function.']];
QP.push({id:'23f.flat',step:'23f',label:'flat at a point',open:()=>measured('23f'),make(){ return writtenQ('23f.flat',WF23); }},
  {id:'23f.plus',step:'23f',mode:'work',label:'what the match cannot see',open:()=>measured('23f'),make(){
    const a=rnd(9)-4, b=1+rnd(5), c=pick([-3,-2,-1,1,2,3]), n=2+rnd(3), P=pol23([[c,2],[b,1],[a,0]].sort((x,y)=>x[1]-y[1])), k=rnd(2);
    if(k===0){ const right=P, wrong=uniq(right,[pol23([[a+1,0],[b,1],[c,2]]),pol23([[a,0],[b,1],[c+1,2]]),pol23([[a,0],[b,1]]),'0',pol23([[a,0],[b+1,1],[c,2]]),pol23([[a,0],[c,2]])],3);
      return {index:'q:23f.plus[t;'+[a,b,c,n].join(';')+']', lines:[['g(x) = '+P+' + e^(−1/x²) for x ≠ 0, and g(0) = '+sg(a),'given'],['every slope of e^(−1/x²) at 0 is 0','the flat-point technique']], ask:'Which is the match T'+sub15(n)+' of g at 0?', right, opts:shuffle([right,...wrong]), lead:'', why:'The slopes of g at 0 are those of the polynomial, since the other part adds 0 to each. A polynomial of degree 2 is its own match of degree '+n+'.'}; }
    const right='e^(−1/x²), which is more than 0', wrong=['0','x'+sup15(n+1)+', times a number','e^(−1/x²) − ('+P+')'];
    return {index:'q:23f.plus[r;'+[a,b,c,n].join(';')+']', lines:[['g(x) = '+P+' + e^(−1/x²) for x ≠ 0, and g(0) = '+sg(a),'given'],['T'+sub15(n)+'(x) = '+P,'its match at 0, by the flat-point technique']], ask:'What is the error g(x) − T'+sub15(n)+'(x) at an x other than 0?', right, opts:shuffle([right,...wrong]), lead:'', why:'The match takes away the polynomial and leaves the flat part whole. However many pieces are added, the error stays e^(−1/x²): the matching sum settles, but not at g(x).'}; }});

/* ===== Laundry 5, rung 23 (floor 4 pools, stage V), part 2: 23g to 23l ===== */
const ch23=(A,k)=>{ let r=fint(1); for(let i=0;i<k;i++) r=fmul(r,fmul(fsub(A,fint(i)),fr(1,i+1))); return r; }, fib23=n=>{ let a=0, b=1; for(let i=0;i<n;i++) [a,b]=[b,a+b]; return a; };

/* ---------- 23g Two Famous Proofs ---------- */
const WG23=[
  ['e = 2.718281828 to nine places. Is e = 2718281828/10⁹?','no: nine places fence e; they do not name it',['yes','yes, to within rounding, which is the same','no: e has only eight places'],'No whole numbers p and q make e = p/q. Any number of places gives a fence, and e lies inside without being its edge.'],
  ['π does not repeat in its first 10 million digits. Is it thereby shown to be no fraction?','no: checking digits proves nothing about the rest; the proof does',['yes: a fraction would have repeated by then','yes, with more digits to be sure','no: π is a fraction, 22/7'],'A fraction may repeat only after more digits than anyone has looked at. The irrationality technique for π covers every p and q at once.'],
  ['x is a whole number and x > 0. Does x ≥ 1 follow?','yes: that is the step both proofs turn on',['no: x could be ½','no: only x ≥ 0 follows','only if x is even'],'Each proof builds a whole number that lies strictly between 0 and 1, and there is none.'],
  ['a and b are both irrational. Is a + b thereby irrational?','no: √2 and −√2 are irrational, and their sum is 0',['yes: a sum of irrationals is irrational','yes, unless one of them is 0','no: a sum of irrationals is always a fraction'],'Being no fraction is not kept by adding. Each sum needs its own proof.'],
  ['What is an algebraic real?','a root of a polynomial with whole coefficients, not all 0',['a fraction','a real that is no fraction','a real whose decimal ends'],'A real that is not algebraic is transcendental.'],
  ['Is √2 algebraic?','yes: it is a root of x² − 2 = 0',['no: it is irrational','no: it is transcendental','yes: it is a fraction'],'Irrational and transcendental are different words. √2 is no fraction, and still a root of a polynomial with whole coefficients.']];
QP.push({id:'23g.frac',step:'23g',label:'not a fraction',open:()=>measured('23g'),make(){ return writtenQ('23g.frac',WG23); }},
  {id:'23g.alg',step:'23g',mode:'work',label:'algebraic reals',open:()=>measured('23g'),make(){
    const k=rnd(4), a=pick([2,3,5,6,7]), c=1+rnd(3), [p,q]=pick(R22), E=s=>s+' = 0';
    const [x,right,cands,why]=k===0?['√'+a,E('x² − '+a),[E('x² + '+a),E('x − '+a),E('2x − '+a),E(a+'x² − 1')],'(√'+a+')² = '+a+'.']
      :k===1?['∛'+a,E('x³ − '+a),[E('x³ + '+a),E('3x − '+a),E('x² − '+a),E(a+'x³ − 1')],'(∛'+a+')³ = '+a+'.']
      :k===2?[p+'/'+q,E(q+'x − '+p),[E(p+'x − '+q),E(q+'x + '+p),E('x² − '+p*q),E('x − '+(p+q))],'A fraction is a root of a first-degree equation with whole coefficients: '+q+' · '+p+'/'+q+' − '+p+' = 0.']
      :[c+' + √'+a,E(pol23([[1,2],[-2*c,1],[c*c-a,0]])),[E(pol23([[1,2],[-(c*c+a),0]])),E(pol23([[1,2],[2*c,1],[c*c-a,0]])),E(pol23([[1,2],[-2*c,1],[c*c+a,0]])),E(pol23([[1,2],[-a,0]]))],'(x − '+c+')² = '+a+' at x = '+c+' + √'+a+'. Multiply out: x² − '+2*c+'x + '+c*c+' = '+a+'.'];
    const wrong=uniq(right,cands,3);
    return {index:'q:23g.alg['+x+']', lines:[['x = '+x,'a real']], ask:'Which equation with whole coefficients shows it to be algebraic?', right, opts:shuffle([right,...wrong]), lead:'', why:why+' A real is algebraic when it is a root of a polynomial with whole coefficients, not all 0.'}; }},
  {id:'23g.line',step:'23g',mode:'proof',label:'what a proof may use',open:()=>measured('23g'),make(){
    const [a,b]=pick([['a','b'],['s','t'],['u','v']]), [rt,eq]=pick([['√2','x² − 2'],['√3','x² − 3'],['∛2','x³ − 2'],['√5','x² − 5']]), many=pick(['10 million','million','100 million','billion']), [nm,dg,fr9]=pick([['e','2.718281828','2718281828/10⁹'],['π','3.141592654','3141592654/10⁹']]);
    const V=[
      ['w1',[['x is a whole number','shown'],['0 < x < 1','shown'],['⊥','no whole number lies strictly between 0 and 1']],3,0,'A whole number above 0 is at least 1. Both proofs end here.'],
      ['w2',[[nm+' agrees with '+dg+' to nine places','computed'],[nm+' = '+fr9,'read off the places']],2,1,'Nine places fence '+nm+'. They do not name it.'],
      ['w3',[[a+' is irrational, and '+b+' is irrational','given'],[a+' + '+b+' is irrational','a sum of irrationals']],2,1,'√2 and −√2 are irrational, and their sum is 0.'],
      ['w4',[[a+' is a fraction, and '+b+' is irrational','given'],[a+' + '+b+' is irrational','else '+b+' = ('+a+' + '+b+') − '+a+' would be a difference of fractions']],2,0,'A difference of fractions is a fraction, so if '+a+' + '+b+' were a fraction, '+b+' would be one.'],
      ['w5',[['x is a root of '+eq+' = 0','given'],['x is algebraic','what the word means']],2,0,eq+' has whole coefficients, not all 0.'],
      ['w6',[['x is irrational','given'],['x is transcendental','what the word means']],2,1,'Transcendental means a root of no polynomial with whole coefficients. '+rt+' is irrational and a root of '+eq+'.'],
      ['w7',[['x is transcendental','given'],['x is irrational','a fraction p/q is a root of qx − p = 0']],2,0,'If x were a fraction it would be a root of a first-degree polynomial with whole coefficients, so it would be algebraic.'],
      ['w8',[['the first '+many+' digits of x do not repeat','checked'],['x is irrational','its decimal does not repeat']],2,1,'Checking digits proves nothing about the rest.']];
    const [tag,lines,n,r,why]=pick(V);
    return {index:'q:23g.line['+[tag,a,eq,many,nm].join(';')+']', stack:true, lines, ask:'Is line '+n+' licensed?', right:YN22[r], opts:YN22, lead:'', why}; }});

/* ---------- 23h Polynomials That Hug a Curve, by Hand ---------- */
const WH23=[
  ['Is √4 = √(1 + 3) = 1 + 3/2 − 9/8 + 27/16 − ⋯?','no: the binomial sum reaches 1; at x = 3 its pieces grow and it wanders',['yes, by the binomial-sum technique','yes: the pieces take turns in sign','no: the sum settles, but at −2'],'Binomial-sum technique: for every real α and every x with |x| < 1.'],
  ['Is the number in front of xᵏ in (1 + x)^α equal to αᵏ/k!?','no: that is the sum for e^(αx); α choose k is α(α − 1)⋯(α − k + 1)/k!',['yes','no: it is α/k!','no: it is αᵏ'],'Each slope of (1 + x)^α brings down the power and lowers it by 1.'],
  ['Is (Σ uₖxᵏ)(Σ vₖxᵏ) = Σ uₖvₖxᵏ?','no: the piece with xᵏ gathers every pair of powers that adds to k',['yes: multiply piece by piece','yes, inside both reaches','no: the product is no power sum'],'Product technique: the number in front of xᵏ is u₀vₖ + u₁vₖ₋₁ + ⋯ + uₖv₀.'],
  ['Is e^(−1/x²) = Σ (−1/x²)ᵏ/k! a power sum about 0?','no: powers of 1/x are not powers of x',['yes, by the building technique','yes, with reach 1','no: the sum wanders for every x'],'The building technique puts cxᵐ in for x. 1/x² is no such thing, and that function is not rebuilt from 0.'],
  ['A sum for f about w was built from sums you know. Could the matching sum of f about w be a different one?','no: a function has only one power sum about a point',['yes: built sums and matching sums differ by the error','yes, unless f is a polynomial','it cannot be told without the slopes of f'],'Smooth-sum technique. So a sum built honestly is the matching sum, and no slope needs to be found.']];
QP.push({id:'23h.one',step:'23h',label:'sums built from sums',open:()=>measured('23h'),make(){ return writtenQ('23h.one',WH23); }},
  {id:'23h.build',step:'23h',mode:'work',label:'new sums from old',open:()=>measured('23h'),make(){
    const k=rnd(4);
    if(k===0){ const A=pick([fr(1,2),fr(-1,2),fint(-1),fint(-2),fr(1,3),fr(3,2),fr(-3,2)]), j=2+rnd(2), R=ch23(A,j), right=fshow(R), wrong=frs16(right,[fr(A.p**j,A.q**j*fact16(j)),fmul(R,fint(fact16(j))),fneg(R),ch23(A,j-1),ch23(A,j+1),fmul(A,fr(1,fact16(j)))]); if(wrong.length<3) return null;
      let top=''; for(let i=0;i<j;i++) top+=(i?' · ':'')+fpar22(fsub(A,fint(i)));
      return {index:'q:23h.build[c;'+[A.p,A.q,j].join(';')+']', lines:[['(1 + x)^α = Σ (α choose k) xᵏ for |x| < 1','the binomial-sum technique'],['α = '+fshow(A),'given']], ask:'Which number stands in front of x'+sup15(j)+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'α choose '+j+' = α(α − 1)'+(j===3?'(α − 2)':'')+'/'+j+'! = '+top+' / '+fact16(j)+' = '+right+'.'}; }
    if(k===1){ const c=pick([-2,-1,2,3]), j=2+rnd(2), m=1+rnd(3), a=Math.abs(c), t=rnd(5);
      const [f,pw,R,why]=t===0?['e^('+cf22(c,'x²')+')',2*j,fr(c**j,fact16(j)),'Put '+cf22(c,'x²')+' in for x in Σ xᵏ/k!. The piece with k = '+j+' is ('+cf22(c,'x²')+')'+sup15(j)+'/'+j+'!.']
        :t===1?['1/(1'+(c===1?' − ':c===-1?' + ':pm(-c))+'x)',j,fint(c**j),'Put '+cf22(c,'x')+' in for x in 1 + x + x² + ⋯. The piece with k = '+j+' is ('+cf22(c,'x')+')'+sup15(j)+'.']
        :t===2?['1/(1 + '+(a===1?'':a)+'x²)',2*j,fint((-a)**j),'Put '+cf22(-a,'x²')+' in for x in 1 + x + x² + ⋯. The piece with k = '+j+' is ('+cf22(-a,'x²')+')'+sup15(j)+'.']
        :t===3?['x'+(m===1?'':sup15(m))+' · eˣ',m+j,fr(1,fact16(j)),'Multiply Σ xᵏ/k! by x'+(m===1?'':sup15(m))+'. The piece with x'+sup15(m+j)+' comes from k = '+j+'.']
        :[(j===2?'sin':'cos')+'('+a+'x)',j+1,j===2?fr(-(a**3),6):fr(a**4,24),'Put '+a+'x in for x in '+(j===2?'x − x³/3! + ⋯':'1 − x²/2! + x⁴/4! − ⋯')+'.'];
      const right=fshow(R), wrong=frs16(right,[fneg(R),fint(c**j),fr(c**(j-1),fact16(j-1)),fr(c,fact16(j)),fr(1,fact16(j)),fr(c**j,j),fint(c**(j+1)),fr(a**(j+1),j+1),fr(1,fact16(j+1))]); if(wrong.length<3) return null;
      return {index:'q:23h.build[b;'+f+';'+pw+']', lines:[['f(x) = '+f,'given'],['build its sum about 0 from a sum you know','the building technique']], ask:'Which number stands in front of x'+sup15(pw)+'?', right, opts:shuffle([right,...wrong]), lead:'', why:why+' So the number in front is '+right+'.'}; }
    if(k===2){ const u=[1,2,3].map(()=>1+rnd(4)), v=[1,2,3].map(()=>pick([-2,-1,1,2,3])), c2=u[0]*v[2]+u[1]*v[1]+u[2]*v[0], right=sg(c2), wrong=num13(right,[u[2]*v[2],u[1]*v[1],u[0]*v[2]+u[2]*v[0],u[0]*v[0]+u[1]*v[1]+u[2]*v[2],(u[0]+u[1]+u[2])*(v[0]+v[1]+v[2]),c2+1,c2-1]);
      return {index:'q:23h.build[p;'+u.concat(v).join(';')+']', lines:[['Σ uₖxᵏ = '+pol23([[u[0],0],[u[1],1],[u[2],2]])+' + ⋯','one sum'],['Σ vₖxᵏ = '+pol23([[v[0],0],[v[1],1],[v[2],2]])+' + ⋯','another, both settling in size']], ask:'Which number stands in front of x² in their product?', right, opts:shuffle([right,...wrong]), lead:'', why:'Product technique: u₀v₂ + u₁v₁ + u₂v₀ = '+u[0]+' · '+par10(v[2])+' + '+u[1]+' · '+par10(v[1])+' + '+u[2]+' · '+par10(v[0])+' = '+right+'.'}; }
    const a=2+rnd(3), j=1+rnd(3), R=fr((-1)**j,a**(j+1)), right=fshow(R), wrong=frs16(right,[fneg(R),fr((-1)**j,a**j),fr((-1)**j,fact16(j)),fr(1,a),fr((-1)**j,a**(j+2)),fr((-1)**j*a,1)]); if(wrong.length<3) return null;
    return {index:'q:23h.build[r;'+[a,j].join(';')+']', lines:[['f(x) = 1/x, about w = '+a,'given'],['x = '+a+' + h, so 1/x = (1/'+a+') · 1/(1 + h/'+a+')','the recentring technique']], ask:'Which number stands in front of (x − '+a+')'+(j===1?'':sup15(j))+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'1/(1 + h/'+a+') = 1 − h/'+a+' + h²/'+a*a+' − ⋯, a geometric sum in h that settles for |h| < '+a+'. Times 1/'+a+', the piece with h'+(j===1?'':sup15(j))+' has '+right+' in front.'}; }});

/* ---------- 23i How Many Terms ---------- */
const WI23=[
  ['A total has the fence [0.1234564, 0.1234566], narrower than 0.0000005. Are six places known?','no: the fence holds 0.1234565, the boundary halfway between two roundings',['yes: 0.123456','yes: 0.123457','no: a fence must be narrower than 0.00000005'],'Rounding-fence technique: every number in the fence must round to the same places. A narrow fence is needed, and it is not enough.'],
  ['The signs of a sum take turns and its sizes fall. Which fence for the leftover is cheapest?','the bracket: the leftover is smaller than the next piece',['a geometric sum: the next piece over 1 − k','the error ceiling, with a ceiling on a slope','none: add pieces until they stop changing'],'Cheapest-fence technique. The bracket needs no ratio and no slope.'],
  ['For |θ| ≤ h, with θ in radians, how near is sin θ to θ?','within h³/6',['within h²/2','within h','within h⁴/24'],'Small-angle technique. And cos θ is 1 − θ²/2 to within h⁴/24.'],
  ['Why is the error of sin θ ≈ θ one power smaller than it looks?','sin has no θ² piece, so its match of degree 1 is already its match of degree 2',['the signs of the sum take turns','θ is measured in radians','sin θ is always less than 1'],'So the error is R₂(θ), with a third power in it, not R₁(θ).'],
  ['Before adding pieces of the sum for sin at an angle of 10 radians, what does the bring-near technique do?','takes whole half turns off the angle, by facts that are exact',['adds more pieces to make up for the size','turns the angle into degrees','rounds the angle to the nearest whole half turn'],'Near the centre the pieces shrink fast from the first one. Only the facts used to move the input need more places.'],
  ['When is a total known to d places?','when every number in its fence, with the slips of rounding added, rounds to the same d places',['when its last piece is under half a unit in place d','when two running totals in a row agree to d places','when d pieces have been added'],'Rounding-fence technique.']];
QP.push({id:'23i.fence',step:'23i',label:'fences and places',open:()=>measured('23i'),make(){ return writtenQ('23i.fence',WI23); }},
  {id:'23i.terms',step:'23i',mode:'work',label:'how near, how many',open:()=>measured('23i'),make(){
    const k=rnd(4);
    if(k===0){ const q=pick([2,3,5,10,20,100]), s=Math.random()<0.5, R=s?fr(1,6*q**3):fr(1,24*q**4), right=fshow(R), wrong=frs16(right,[s?fr(1,24*q**4):fr(1,6*q**3),fr(1,2*q*q),fr(1,q**3),fr(1,3*q**3),fr(1,q**4),fr(1,6*q*q),fr(1,q)]); if(wrong.length<3) return null;
      return {index:'q:23i.terms[a;'+[q,s?1:0].join(';')+']', lines:[['|θ| ≤ 1/'+q+', with θ in radians','given'],[s?'sin θ is taken to be θ':'cos θ is taken to be 1 − θ²/2','the small-angle technique']], ask:'Within what is that right?', right, opts:shuffle([right,...wrong]), lead:'', why:s?'sin θ is θ to within h³/6. With h = 1/'+q+': 1/(6 · '+q**3+') = '+right+'.':'cos θ is 1 − θ²/2 to within h⁴/24. With h = 1/'+q+': 1/(24 · '+q**4+') = '+right+'.'}; }
    if(k===1){ const K=pick([10,100,1000,10000,100000,1000000]); let n=1; while(fact16(n)<K) n++;
      const right=String(n), wrong=uniq(right,[n-1,n+1,n+2,n-2].filter(v=>v>0).map(String),3);
      return {index:'q:23i.terms[n;'+K+']', lines:[['e⁻¹ = 1 − 1 + 1/2! − 1/3! + 1/4! − ⋯','the sum for eˣ at x = −1'],['stop before the piece 1/n!, and the leftover is smaller than 1/n!','the bracket: the signs take turns and the sizes fall']], ask:'What is the least n for which 1/n! is at most 1/'+K+'?', right, opts:shuffle([right,...wrong]), lead:'', why:(n-1)+'! = '+fact16(n-1)+' is under '+K+', and '+n+'! = '+fact16(n)+' is not. So the pieces up to 1/'+(n-1)+'! are enough.'}; }
    if(k===2){ const O=['the bracket','a geometric sum','the error ceiling','none: the sum wanders'], [u,r,why]=pick([['1 − 1/3! + 1/5! − 1/7! + ⋯, the sum for sin 1',0,'The signs take turns and the sizes fall, so the leftover is smaller than the next piece.'],['1 + 1 + 1/2! + 1/3! + 1/4! + ⋯, the sum for e',1,'The signs do not take turns. From 1/2! on, each piece is at most ½ of the one before, so the leftover is at most the next piece over 1 − ½.'],['1/2 − 1/8 + 1/24 − 1/64 + ⋯, the sum for ln(1 + ½)',0,'The signs take turns and the sizes fall, so the leftover is smaller than the next piece.'],['1/2 + 1/8 + 1/24 + 1/64 + ⋯, the sum for −ln(1 − ½)',1,'The signs do not take turns. Each piece is at most ½ of the one before, so the leftover is at most the next piece over 1 − ½.'],['1 − 2 + 4 − 8 + ⋯, the sum for 1/(1 + x) at x = 2',3,'x = 2 lies outside the reach 1. The pieces grow, and no fence holds a leftover that is not there.'],['1 − 1/2! + 1/4! − 1/6! + ⋯, the sum for cos 1',0,'The signs take turns and the sizes fall, so the leftover is smaller than the next piece.'],['1 + 1/3 + 1/9 · 1/2! + 1/27 · 1/3! + ⋯, the sum for e^(1/3)',1,'The signs do not take turns. Each piece is at most ⅓ of the one before, so the leftover is at most the next piece over 1 − ⅓.']]);
      return {index:'q:23i.terms[f;'+u+']', lines:[[u,'a sum, stopped after a few pieces']], ask:'Which is the cheapest fence for its leftover?', right:O[r], opts:shuffle(O.slice()), lead:'', why:'Cheapest-fence technique. '+why}; }
    const [N,j]=pick([[3,1],[5,2],[6,2],[10,3],[12,3],[9,3],[20,4],[18,4],[40,5],[24,4]]), X=fr(N-2**j,2**j), right=fshow(X), wrong=frs16(right,[fint(N-2**j),fr(2**j,N),fr(N,2**j),fr(1,j+1),fhalf(X),fr(1,2**j),fmul(X,fint(2))]); if(wrong.length<3) return null;
    return {index:'q:23i.terms[l;'+N+']', lines:[['ln '+N+' = ln('+2**j+' · '+N+'/'+2**j+')','split off a power of 2: the bring-near technique'],['ln '+N+' = '+(j===1?'':j+' ')+'ln 2 + ln(1 + x)','ln of a product']], ask:'What is x?', right, opts:shuffle([right,...wrong]), lead:'', why:N+'/'+2**j+' = '+fshow(fr(N,2**j))+' = 1 + '+right+'. The sum for ln(1 + x) shrinks fast at x = '+right+', where at x = '+(N-1)+' it would wander.'}; }});

/* ---------- 23j A List Stored in One Function ---------- */
const WJ23=[
  ['The storing function of the rabbit counts is x/(1 − x − x²), which is −1 at x = 1. Is 0 + 1 + 1 + 2 + 3 + ⋯ = −1?','no: 1 lies outside the reach, and there the sum wanders',['yes: the function stores the list','yes, by the read-back technique','no: the total is 1'],'The function equals the power sum only inside the reach, which is less than 1 here.'],
  ['Which number stands in front of xⁿ in A(x)B(x)?','u₀vₙ + u₁vₙ₋₁ + ⋯ + uₙv₀',['uₙvₙ','uₙ + vₙ','u₀v₀ + u₁v₁ + ⋯ + uₙvₙ'],'It collects every way to split n into a part from A and a part from B.'],
  ['A(0) = B(0). Are the two stored lists the same?','no: agreeing at 0 fixes only the first entry; they must agree near 0',['yes, by the read-back technique','yes, if both reaches are above 0','no: two lists never have storing functions that agree at 0'],'Read-back technique: two lists whose storing functions agree near 0 are the same list.'],
  ['What is the storing function of a list u₀, u₁, u₂, …?','the power sum Σ uₖxᵏ, wherever it settles',['the function with f(k) = uₖ','the running totals u₀ + u₁ + ⋯ + uₙ','the polynomial through the first n entries'],'Accepted name: the generating function.'],
  ['A storing function A has reach above 0. How does it give back its list?','uₖ = A⁽ᵏ⁾(0)/k!',['uₖ = A(k)','uₖ = A⁽ᵏ⁾(0)','uₖ = A(1/k)'],'Read-back technique: the smooth-sum technique, used as a filing system.']];
const SJ23=[['1/(1 − x)','1, 1, 1, 1, …','It is the geometric sum 1 + x + x² + ⋯.'],['1/(1 + x)','1, −1, 1, −1, …','It is the geometric sum with ratio −x.'],['1/(1 − x)²','1, 2, 3, 4, …','It is the slope of 1/(1 − x), term by term: 1 + 2x + 3x² + ⋯.'],['eˣ','1, 1, 1/2, 1/6, …','The number in front of xᵏ is 1/k!.'],['x/(1 − x)²','0, 1, 2, 3, …','It is x times 1 + 2x + 3x² + ⋯.'],['1/(1 − x²)','1, 0, 1, 0, …','It is the geometric sum with ratio x²: only even powers.'],['1/(1 − 2x)','1, 2, 4, 8, …','It is the geometric sum with ratio 2x.'],['x/(1 − x − x²)','0, 1, 1, 2, 3, …','It stores the rabbit counts.'],['1/(1 − x) − 1','0, 1, 1, 1, …','Taking away 1 changes only the first entry.']];
QP.push({id:'23j.store',step:'23j',label:'storing functions',open:()=>measured('23j'),make(){ return writtenQ('23j.store',WJ23); }},
  {id:'23j.read',step:'23j',mode:'work',label:'reading a list back',open:()=>measured('23j'),make(){
    const k=rnd(3), n=3+rnd(4);
    if(k===0){ const [f,right,why]=pick(SJ23), wrong=take(SJ23.map(s=>s[1]).filter(s=>s!==right),3);
      return {index:'q:23j.read[s;'+f+']', lines:[['A(x) = '+f,'a storing function with reach above 0']], ask:'Which list does it store?', right, opts:shuffle([right,...wrong]), lead:'', why:why+' Read-back technique: the function alone gives back the list.'}; }
    if(k===1){ const t=rnd(3), [B,r,why]=t===0?['1, 1, 1, 1, …',n+1,'Every split of '+n+' gives 1 · 1, and there are '+(n+1)+' splits: 0 + '+n+', 1 + '+(n-1)+', …, '+n+' + 0.']:t===1?['1, 2, 4, 8, …',2**(n+1)-1,'u₀vₙ + ⋯ + uₙv₀ = 2'+sup15(n)+' + ⋯ + 2 + 1 = '+(2**(n+1)-1)+'.']:['1, 2, 3, 4, …',(n+1)*(n+2)/2,'u₀vₙ + ⋯ + uₙv₀ = '+(n+1)+' + '+n+' + ⋯ + 1 = '+(n+1)*(n+2)/2+'.'];
      const right=String(r), wrong=uniq(right,[t===0?1:t===1?2**n:n+1,n,r+1,r-1,2*n,n*n,t===1?2**(n+1):n+2].map(String),3);
      return {index:'q:23j.read[p;'+[t,n].join(';')+']', lines:[['A(x) stores 1, 1, 1, 1, …','given'],['B(x) stores '+B,'given']], ask:'Which number stands in front of x'+sup15(n)+' in A(x)B(x)?', right, opts:shuffle([right,...wrong]), lead:'', why:'Product technique: the number in front of xⁿ collects every way to split n into a part from A and a part from B. '+why}; }
    const m=8+rnd(8), right=String(fib23(m)), wrong=uniq(right,[fib23(m-1),fib23(m+1),fib23(m)+1,2*fib23(m-1),fib23(m)-fib23(m-3)].map(String),3);
    return {index:'q:23j.read[f;'+m+']', lines:[['F₀, F₁, F₂, … = 0, 1, 1, 2, 3, 5, 8, 13, …','the rabbit counts: each is the sum of the two before'],['F'+sub15(m-2)+' = '+fib23(m-2)+' and F'+sub15(m-1)+' = '+fib23(m-1),'given']], ask:'What is F'+sub15(m)+'?', right, opts:shuffle([right,...wrong]), lead:'', why:fib23(m-2)+' + '+fib23(m-1)+' = '+right+'. The rule Fₙ = Fₙ₋₁ + Fₙ₋₂ is what the storing function x/(1 − x − x²) packs into one line.'}; }});

/* ---------- 23k Expansions That Diverge yet Help ---------- */
const WK23=[
  ['1 − x + 2!x² − 3!x³ + ⋯ wanders for every x other than 0. Does it then say nothing about the function it came from?','no: stopped early it computes; at x = 0.1, nine pieces give the function to within 0.0004',['yes: a sum that wanders has no use','yes, except at x = 0','no: it settles after all, by taking turns'],'Each error is at most the next piece in size. While the pieces are still small, so is the error.'],
  ['Do more pieces of such an expansion always do better?','no: the pieces shrink and then grow; stop just before the smallest piece',['yes: each piece is a correction','yes, once the signs take turns','no: only the first piece is of use'],'Cut-at-the-smallest technique. Past the smallest piece the bound gets worse with every piece added.'],
  ['n! ~ √(2πn)(n/e)ⁿ. Does n! − √(2πn)(n/e)ⁿ head to 0?','no: ~ speaks of the ratio; the difference grows',['yes: that is what ~ says','yes, by the trapezoid-fence technique','no: the ratio does not head to 1 either'],'The ratio heads to 1, while both sides grow past every ceiling, and so does their difference.'],
  ['Each error is at most the next piece in size, and the pieces shrink and then grow. Where do you stop?','just before the smallest piece',['at the first piece','as late as you can','just after the largest piece'],'The error is then at most that smallest piece.'],
  ['Which is the size of n!?','n! ~ √(2πn)(n/e)ⁿ',['n! ~ (n/e)ⁿ','n! ~ nⁿ','n! ~ √n · nⁿ'],'Size-of-factorials technique. 22k fenced n! between e(n/e)ⁿ and e·n·(n/e)ⁿ; this names the size between them.']];
QP.push({id:'23k.help',step:'23k',label:'a sum that wanders and helps',open:()=>measured('23k'),make(){ return writtenQ('23k.help',WK23); }},
  {id:'23k.cut',step:'23k',mode:'work',label:'where to stop',open:()=>measured('23k'),make(){
    const k=rnd(3), m=pick([4,5,8,10,20,50]);
    if(k===0){ const f=v=>'the piece with x'+sup15(v), right=f(m+1), wrong=uniq(right,[f(m),f(m-1),f(2*m),f(2),f(m+2)],3);
      return {index:'q:23k.cut[g;'+m+']', lines:[['1 − x + 2!x² − 3!x³ + ⋯, at x = 1/'+m,'the pieces are k!/'+m+'ᵏ in size'],['each piece is k/'+m+' times the one before, in size','k!/'+m+'ᵏ over (k − 1)!/'+m+'ᵏ⁻¹']], ask:'Which is the first piece bigger than the one before it?', right, opts:shuffle([right,...wrong]), lead:'', why:'The ratio k/'+m+' is under 1 up to k = '+(m-1)+', is 1 at k = '+m+', and first passes 1 at k = '+(m+1)+'. So the pieces shrink to the two smallest, at k = '+(m-1)+' and k = '+m+', and then grow. Stop just before the smallest.'}; }
    if(k===1){ const mm=2+rnd(4), R=fr(fact16(mm),mm**mm), right=fshow(R), wrong=frs16(right,[fr(1,mm**mm),fr(fact16(mm),mm),fr(1,fact16(mm)),fr(fact16(mm+1),mm**(mm+1)),fr(1,mm),fr(fact16(mm-1),mm**mm)]); if(wrong.length<3) return null;
      return {index:'q:23k.cut[s;'+mm+']', lines:[['1 − x + 2!x² − 3!x³ + ⋯, at x = 1/'+mm,'the pieces are k!/'+mm+'ᵏ in size'],['the pieces are smallest at k = '+mm,'each is k/'+mm+' times the one before']], ask:'Stop just before that piece. The error is at most what?', right, opts:shuffle([right,...wrong]), lead:'', why:'Cut-at-the-smallest technique: the error is at most the smallest piece, '+mm+'!/'+mm+sup15(mm)+' = '+fact16(mm)+'/'+mm**mm+(right===fact16(mm)+'/'+mm**mm?'':' = '+right)+'. No number of pieces does better at this x.'}; }
    const n=pick([1,2,5,10,25,100]), right='e^(1/'+8*n+')', wrong=uniq(right,['e^(1/'+n+')','1/'+8*n,'e^('+8*n+')','1 + 1/'+n,'e^(1/'+(8+n)+')'],3);
    return {index:'q:23k.cut[f;'+n+']', lines:[['√(2πn)(n/e)ⁿ < n! < √(2πn)(n/e)ⁿ · e^(1/(8n))','the size-of-factorials technique'],['n = '+n,'given']], ask:'By at most which factor is '+n+'! bigger than √(2πn)(n/e)ⁿ?', right, opts:shuffle([right,...wrong]), lead:'', why:'The upper side of the fence is the lower side times e^(1/(8n)), and 8 · '+n+' = '+8*n+'. As n grows the factor heads to e⁰ = 1, which is what n! ~ √(2πn)(n/e)ⁿ says.'}; }});

/* ---------- 23l Numerical Integration ---------- */
const WL23=[
  ['Halve h. What happens to the bound on the trapezoid error?','it falls to a quarter',['it halves','it falls to a sixteenth','it stays as it was'],'Trapezoid technique: the bound is (v − u)Kh²/6, and (h/2)² = h²/4.'],
  ['Is the parabola sum exact for t⁴?','no: ∫ t⁴ over [−1, 1] is 2/5, and the rule with h = 1 gives 2/3',['yes: it is exact for every polynomial','yes: it is exact up to degree 4','no: it is exact only up to degree 2'],'It is exact for every polynomial of degree 3 or less. The error bound has the fourth slope in it.'],
  ['Does the h² bound of the trapezoid technique hold for √x on [0, 1]?','no: its second slope has no ceiling near 0',['yes: √x is continuous on [0, 1]','yes, with K = 1','no: √x has no area on [0, 1]'],'The technique asks for |f″| ≤ K on the whole of [u, v]. There the error shrinks more slowly than h².'],
  ['Halve h. What happens to the bound on the error of the parabola sum?','it falls to a sixteenth',['it halves','it falls to a quarter','it falls to an eighth'],'Sixteenth technique: the bound is (v − u)Kh⁴/45, and (h/2)⁴ = h⁴/16.'],
  ['On [−1, 1], how many heights does the best-points rule use to be exact for every polynomial of degree 3 or less?','two',['three','four','one'],'f(−1/√3) + f(1/√3). Two well-placed heights do the work of the parabola rule’s three.'],
  ['Which are the weights of the parabola sum on a pair of strips?','h/3, 4h/3, h/3',['h/2, h, h/2','h/4, h/2, h/4','h, h, h'],'Sₕ = (h/3)(f₀ + 4f₁ + 2f₂ + 4f₃ + ⋯ + 4f_{N−1} + f_N).']];
const FL23=[['x²',x=>x*x,b=>fr(b**3,3)],['x³',x=>x**3,b=>fr(b**4,4)],['x² + 1',x=>x*x+1,b=>fr(b**3+3*b,3)],['x⁴',x=>x**4,b=>fr(b**5,5)]];
QP.push({id:'23l.rule',step:'23l',label:'rules for areas',open:()=>measured('23l'),make(){ return writtenQ('23l.rule',WL23); }},
  {id:'23l.sum',step:'23l',mode:'work',label:'trapezoids and parabolas',open:()=>measured('23l'),make(){
    const k=rnd(4);
    if(k<2){ const [name,f,ex]=pick(k===0?FL23.slice(0,3):FL23), h=1+rnd(2), N=k===0?2+rnd(3):pick([2,4]), xs=[...Array(N+1).keys()].map(i=>i*h), hs=xs.map(f), tot=hs.reduce((s,v)=>s+v,0), mid=tot-hs[0]-hs[N], T=fr(h*(2*mid+hs[0]+hs[N]),2);
      let sw=0; hs.forEach((v,i)=>{ sw+=v*(i===0||i===N?1:i%2?4:2); }); const S=fr(h*sw,3), R=k===0?T:S, right=fshow(R), wrong=frs16(right,[k===0?S:T,fint(h*tot),ex(N*h),fr(h*tot,k===0?2:3),fmul(R,fint(2)),fint(h*mid),fr(h*sw,2)]); if(wrong.length<3) return null;
      return {index:'q:23l.sum['+(k===0?'t':'p')+';'+[name,h,N].join(';')+']', lines:[['f(x) = '+name+' on [0, '+N*h+'], cut into '+N+' strips of width '+h,'given'],['the heights at the cuts are '+hs.join(', '),'f at '+xs.join(', ')],[k===0?'Tₕ = h(½f₀ + f₁ + ⋯ + f_{N−1} + ½f_N)':'Sₕ = (h/3)(f₀ + 4f₁ + 2f₂ + ⋯ + 4f_{N−1} + f_N)',k===0?'the trapezoid sum':'the parabola sum']], ask:'What is '+(k===0?'Tₕ':'Sₕ')+'?', right, opts:shuffle([right,...wrong]), lead:'', why:(k===0?h+' · (½ · '+hs[0]+' + '+hs.slice(1,N).join(' + ')+' + ½ · '+hs[N]+') = '+right+'.':'('+h+'/3) · ('+hs.map((v,i)=>(i===0||i===N?'':i%2?'4 · ':'2 · ')+v).join(' + ')+') = ('+h+'/3) · '+sw+' = '+right+'.')+' The area itself is '+fshow(ex(N*h))+(fsame(R,ex(N*h))?': the rule is exact here, as it is for every polynomial of degree 3 or less.':'.')}; }
    if(k===2){ const L=pick([1,2,3,6]), K=pick([1,2,3,6,12,24]), q=pick([2,3,10]), tr=Math.random()<0.5, R=tr?fr(L*K,6*q*q):fr(L*K,45*q**4), right=fshow(R), wrong=frs16(right,[tr?fr(L*K,6*q):fr(L*K,45*q*q),tr?fr(L*K,12*q*q):fr(L*K,90*q**4),tr?fr(K,6*q*q):fr(K,45*q**4),tr?fr(L*K,45*q**4):fr(L*K,6*q*q),tr?fr(L*K,q*q):fr(L*K,q**4),tr?fr(L*K,2*q*q):fr(L*K,6*q**4)]); if(wrong.length<3) return null;
      return {index:'q:23l.sum[b;'+[L,K,q,tr?1:0].join(';')+']', lines:[['[u, v] has the length '+L+', and h = 1/'+q,'given'],['|f'+(tr?'″':'⁽⁴⁾')+'| ≤ '+K+' on [u, v]','given']], ask:'Which bound does the '+(tr?'trapezoid':'sixteenth')+' technique put on the error of '+(tr?'Tₕ':'Sₕ')+'?', right, opts:shuffle([right,...wrong]), lead:'', why:tr?'(v − u)Kh²/6 = '+L+' · '+K+' · (1/'+q*q+')/6 = '+right+'.':'(v − u)Kh⁴/45 = '+L+' · '+K+' · (1/'+q**4+')/45 = '+right+'.'}; }
    const c=pick([0,0,1,3,9]), a=pick([1,2,3,6]), b=rnd(7)-3, d=rnd(6), R=fadd(fadd(fr(2*c,9),fr(2*a,3)),fint(2*d)), X=fadd(fadd(fr(2*c,5),fr(2*a,3)),fint(2*d)), right=fshow(R), wrong=frs16(right,[X,fhalf(R),fadd(fadd(fr(2*c,3),fr(2*a,3)),fint(2*d)),fint(2*c+2*a+2*d),fadd(R,fint(1)),fadd(fr(2*a,3),fint(d)),fadd(fr(2*c,9),fadd(fr(a,3),fint(2*d)))]); if(wrong.length<3) return null;
    return {index:'q:23l.sum[g;'+[c,a,b,d].join(';')+']', lines:[['f(t) = '+pol23([[c,4],[a,2],[b,1],[d,0]],'t')+' on [−1, 1]','given'],['take f(−1/√3) + f(1/√3)','the best-points rule']], ask:'What does the rule give?', right, opts:shuffle([right,...wrong]), lead:'', why:'At both points t² = 1/3'+(c?' and t⁴ = 1/9':'')+', and the odd piece cancels between them. So the rule gives 2 · ('+(c?c+'/9 + ':'')+a+'/3'+(d?' + '+d:'')+') = '+right+'. '+(c?'The area itself is '+fshow(X)+': the rule is exact only up to degree 3, and t⁴ has the area 2/5, not 2/9.':'That is the area exactly: the rule is exact for every polynomial of degree 3 or less.')}; }},
  {id:'23l.pond',step:'23l',mode:'word',label:'widths at even steps',open:()=>measured('23l'),make(){
    const h=pick([2,5,10]), N=4, e0=pick([0,2,4]), e1=pick([0,2,6]), ws=[e0,3+rnd(8),4+rnd(9),3+rnd(8),e1], tot=ws.reduce((s,v)=>s+v,0), A=h*(tot-(e0+e1)/2), [what,along]=pick([['A pond','from one end to the other'],['A strip of ground between a straight fence and a stream','along the fence'],['A patch of reeds','from one end to the other'],['A clearing','from one end to the other']]);
    const right=A+' square metres', wrong=uniq(right,[h*tot,tot,N*h*Math.max(...ws),h*tot/2,A+h*N,h*(tot-e0-e1)/2+h,2*A].filter(v=>v!==A&&Number.isInteger(v)).map(v=>v+' square metres'),3); if(wrong.length<3) return null;
    return {index:'q:23l.pond['+[what,h].concat(ws).join(';')+']', a3:['23l.pond',DASH,DASH], story:what+' is '+N*h+' metres long. Its width, measured every '+h+' metres '+along+', is '+ws.slice(0,N).join(', ')+' and '+ws[N]+' metres.', lines:[], ask:'By the trapezoid sum, about how large is it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Tₕ = h(½f₀ + f₁ + f₂ + f₃ + ½f₄) = '+h+' · ('+e0/2+' + '+ws[1]+' + '+ws[2]+' + '+ws[3]+' + '+e1/2+') = '+A+'. The end widths count half, since each belongs to one strip only.'}; }});

/* ===== Laundry 5, rung 24 (floor 5 pools, stage W), part 1: 24a to 24f ===== */
Object.assign(STEPS,{'24a':['r24a','A Rule and a Start'],'24b':['r24b','Building the Solution by Repeated Integration'],'24c':['r24c','A Map That Shrinks Has One Fixed Point'],'24d':['r24d','Tame Rules Fix the Future'],'24e':['r24e','When the Future Is Not Fixed'],'24f':['r24f','Separating the Variables'],'24g':['r24g','The Integrating Factor'],'24h':['r24h','The Two Model Equations'],'24i':['r24i','Slope Fields and Stepping Forward'],'24j':['r24j','The Logistic Equation Solved'],'24k':['r24k','Fixed Points, Stability and the Start of Chaos'],'24l':['r24l','Solutions as Power Series']});
const E24=(k,v)=>k===1&&v==='x'?'eˣ':k===1&&v==='t'?'eᵗ':'e^('+cf22(k,v)+')', A24=a=>a===1?'':a===-1?'−':sg(a);
const polf24=ts=>{ let s=''; ts.filter(t=>t[0].p!==0).forEach(([F,x],i)=>{ const a=fr(Math.abs(F.p),F.q), body=x===''?fshow(a):a.q===1?(a.p===1?'':String(a.p))+x:a.p===1?x+'/'+a.q:'('+fshow(a)+')'+x; s+=(i===0?(F.p<0?'−':''):(F.p<0?' − ':' + '))+body; }); return s||'0'; };

/* ---------- 24a A Rule and a Start ---------- */
const WA24=[
  ['y = Ce^(−x²/2) solves y′ = −xy for every C. Is it thereby shown that every solution has that form?','no: checking that some functions solve it says nothing about the others',['yes: there is one for every C','yes: a rule has only one family of solutions','no: none of them solves it'],'That needs a proof of the own-rate kind: divide any solution by the claimed one, and show the slope comes out 0.'],
  ['y′ = y. May you divide by y, get y′/y = 1, and so ln y = x + C?','no: ln y needs y > 0 and y′/y needs y ≠ 0; the zero solution is lost',['yes: every solution of y′ = y is positive','yes, if C may be any real','no: y′ = y has no solutions'],'y = 0 everywhere solves y′ = y, and so does −eˣ. The division misses both.'],
  ['y′ = ky and y(0) = A. Is y = A + kAx the solution?','no: that is the tangent line at the start, not the solution',['yes','yes, for small k','no: the solution is A + kx'],'Own-rate technique: the one solution is y = Ae^(kx). The line only shares its height and slope at the start.'],
  ['Has a rate rule with a start always exactly one solution?','no: some rules have many, and some solutions run off in a moment',['yes, always','yes, if the rule can be written down','no: most have none'],'y′ = ky has exactly one, on the whole line. That is a fact about that rule, proved for it.'],
  ['What is a solution of a rate rule on an open interval I?','a function with the slopes the rule mentions at every x in I, making the equation true at every x in I',['a number that makes the equation true','a function that makes the equation true at the start','a formula with a C in it'],'Accepted name of a rate rule: a differential equation.'],
  ['What is a start for a first-order rule?','a pair (x₀, y₀): the solution is to have y(x₀) = y₀',['the value of y′ at 0','the first guess y₀(x)','the constant C'],'The rule and its start together are one question. Accepted name: an initial value problem.']];
QP.push({id:'24a.rule',step:'24a',label:'rules and starts',open:()=>measured('24a'),make(){ return writtenQ('24a.rule',WA24); }},
  {id:'24a.own',step:'24a',mode:'work',label:'growth at its own rate',open:()=>measured('24a'),make(){
    const t=rnd(3), k=pick([-3,-2,-1,2,3]), A=1+rnd(5), x0=pick([0,0,1,2]);
    if(t===0){ const f=(a,kk,sh)=>A24(a)+(sh?'e^('+cf22(kk,'(x − '+sh+')')+')':E24(kk,'x')), right=f(A,k,x0), wrong=uniq(right,[A+(k*A<0?' − ':' + ')+(Math.abs(k*A)===1?'':Math.abs(k*A))+(x0?'(x − '+x0+')':'x'),f(A,-k,x0),f(k,A,x0),E24(k,'x')+' + '+A,x0?f(A,k,0):f(A+1,k,0),f(A,k,x0+1)],3);
      return {index:'q:24a.own[f;'+[k,A,x0].join(';')+']', lines:[['y′ = '+cf22(k,'y'),'the rule'],['y('+x0+') = '+A,'the start']], ask:'Which is the solution?', right:'y = '+right, opts:shuffle([right,...wrong]).map(s=>'y = '+s), lead:'', why:'Own-rate technique: y = Ae^(k(x − x₀)), with k = '+sg(k)+', A = '+A+' and x₀ = '+x0+'. Put it back: its slope is '+sg(k)+' times itself, and at x = '+x0+' it is '+A+'.'}; }
    if(t===1){ const f=(a,n)=>(a===1?'':a)+ep22(n), right=f(A,k), wrong=uniq(right,[sg(A+k*A),f(A,-k),f(Math.abs(k*A),1),ep22(k),f(A,k*A),f(A+1,k)],3);
      return {index:'q:24a.own[v;'+[k,A].join(';')+']', lines:[['y′ = '+cf22(k,'y'),'the rule'],['y(0) = '+A,'the start']], ask:'What is y(1)?', right, opts:shuffle([right,...wrong]), lead:'', why:'Own-rate technique: y = '+A24(A)+E24(k,'x')+', so y(1) = '+right+'. '+sg(A+k*A)+' is where the tangent line at the start would be.'}; }
    const c=2+rnd(5), kk=Math.abs(k)===1?2:k, right=c+E24(kk,'x'), wrong=take([E24(kk,'x')+' + '+c,cf22(kk,'x')+' + '+c,c+'x'+sup15(Math.abs(kk)),c+'e^(x²)',E24(1,'x')+' + '+E24(kk,'x')],3);
    return {index:'q:24a.own[w;'+[kk,c].join(';')+']', lines:[['y′ = '+cf22(kk,'y'),'the rule']], ask:'Which of these solves it on the whole line?', right:'y = '+right, opts:shuffle([right,...wrong]).map(s=>'y = '+s), lead:'', why:'The slope of '+right+' is '+sg(kk)+' · '+right+', which is '+sg(kk)+'y at every x. Each of the others has a slope that is not '+sg(kk)+' times its height.'}; }},
  {id:'24a.line',step:'24a',mode:'proof',label:'solved, or only checked',open:()=>measured('24a'),make(){
    const k=pick([2,3,-2,-1,4]), A=1+rnd(5), V=[
      ['c1',[['y = Ce^(−x²/2) solves y′ = −xy, for every C','checked by taking the slope'],['every solution of y′ = −xy is Ce^(−x²/2) for some C','the check']],2,1,'Checking that some functions solve a rule says nothing about the others.'],
      ['c2',[['y′ = '+cf22(k,'y')+' and y(0) = '+A,'given'],['y = '+A24(A)+E24(k,'x')+', and no other function','the own-rate technique']],2,0,'The own-rate technique proves both halves: that function solves it, and any solution divided by it has slope 0.'],
      ['c3',[['y′ = '+cf22(k,'y'),'given'],['y′/y = '+sg(k),'divide both sides by y']],2,1,'y may be 0. The zero function solves the rule, and the division loses it.'],
      ['c4',[['y′ = '+cf22(k,'y')+' and y(0) = '+A,'given'],['y = '+A+pm(k*A)+'x','the height and the slope at the start']],2,1,'That is the tangent line at the start. Its slope is '+sg(k*A)+' everywhere, and '+sg(k)+'y is not.'],
      ['c5',[['y = '+E24(k,'x')+' has y′ = '+sg(k)+E24(k,'x')+' at every x','the chain rule'],['y = '+E24(k,'x')+' is a solution of y′ = '+cf22(k,'y')+' on the whole line','what a solution is']],2,0,'It has the slope the rule mentions at every x, and the equation is true at every x.'],
      ['c6',[['y = '+E24(k,'x')+' is a solution of y′ = '+cf22(k,'y'),'checked'],['it is the solution with y(0) = '+(A+1),'it solves the rule']],2,1,'At 0 it is 1, not '+(A+1)+'. The rule and its start together are one question.']];
    const [tag,lines,n,r,why]=pick(V);
    return {index:'q:24a.line['+[tag,k,A].join(';')+']', stack:true, lines, ask:'Is line '+n+' licensed?', right:YN22[r], opts:YN22, lead:'', why}; }});

/* ---------- 24b Building the Solution by Repeated Integration ---------- */
const WB24=[
  ['In repeated integration, which guess is fed into the area for yₙ₊₁?','the last one, yₙ',['the one being built, yₙ₊₁','the first one, y₀, every time','the solution itself'],'yₙ₊₁(x) = y₀ + ∫ F(t, yₙ(t)) dt from x₀ to x. Feeding in the one being built would be the rule itself, not a recipe.'],
  ['Is yₙ₊₁(x) = ∫ F(t, yₙ(t)) dt, from x₀ to x, the repeated integration?','no: the start y₀ must be added each round',['yes','no: the area runs from 0 to 1','no: F is fed y₀ every time'],'Without the start added, every guess is 0 at x₀, whatever the start asks.'],
  ['The guesses settle at each point. Is the limit thereby shown to solve the rule?','no: passing the area to the limit needs settling everywhere at once',['yes: the limit of solutions is a solution','yes, if F is continuous','no: the limit never solves the rule'],'The area of the limit is the limit of the areas when the functions settle everywhere at once.'],
  ['Does repeated integration give a formula for every rule?','no: it gives guesses; most rules have no formula, and the guesses are how the solution is known',['yes, after enough rounds','yes, if F is a polynomial','no: it works for y′ = y only'],'For y′ = y the guesses are the matches of eˣ. For most rules no such name is waiting.'],
  ['F is continuous. y solves y′ = F(x, y) with y(x₀) = y₀ exactly when what holds?','y(x) = y₀ + ∫ F(t, y(t)) dt, from x₀ to x, at every x',['y(x) = ∫ F(t, y₀) dt, from x₀ to x','y′(x₀) = y₀','y(x) = y₀ + F(x, y₀)'],'Area-form technique: the rule and its start, packed into one equation with no slope in it.']];
const B24=[['y′ = xy','y(0) = 1',1,'1 + x²/2',['1 + x²','x²/2','1 + x'],'y₁ = 1 + ∫ t · 1 dt from 0 to x.'],['y′ = xy','y(0) = 1',2,'1 + x²/2 + x⁴/8',['1 + x²/2 + x⁴/4','1 + x²/2','x²/2 + x⁴/8'],'y₂ = 1 + ∫ t(1 + t²/2) dt from 0 to x.'],['y′ = x + y','y(0) = 0',2,'x²/2 + x³/6',['x²/2 + x³/3','x²/2','x + x²/2 + x³/6'],'y₁ = ∫ t dt = x²/2, and y₂ = ∫ (t + t²/2) dt from 0 to x.'],['y′ = y²','y(0) = 1',2,'1 + x + x² + x³/3',['1 + x + x²','1 + x + x²/2 + x³/3','x + x² + x³/3'],'y₁ = 1 + x, and y₂ = 1 + ∫ (1 + t)² dt from 0 to x.'],['y′ = x + y','y(0) = 1',1,'1 + x + x²/2',['1 + x','x + x²/2','1 + x²/2'],'y₁ = 1 + ∫ (t + 1) dt from 0 to x.'],['y′ = 2xy','y(0) = 1',2,'1 + x² + x⁴/2',['1 + x² + x⁴','1 + x²','1 + 2x² + x⁴/2'],'y₁ = 1 + x², and y₂ = 1 + ∫ 2t(1 + t²) dt from 0 to x.']];
QP.push({id:'24b.area',step:'24b',label:'the rule as an area',open:()=>measured('24b'),make(){ return writtenQ('24b.area',WB24); }},
  {id:'24b.feed',step:'24b',mode:'work',label:'feed the guess back in',open:()=>measured('24b'),make(){
    if(Math.random()<0.4){ const [rule,st,n,right,wrong,why]=pick(B24);
      return {index:'q:24b.feed[x;'+rule+';'+st+';'+n+']', lines:[[rule,'the rule'],[st,'the start'],['y₀(x) is the flat line at the start, and each guess is fed into the area for the next','repeated integration']], ask:'Which is the guess y'+sub15(n)+'?', right, opts:shuffle([right,...wrong]), lead:'', why}; }
    const k=pick([1,2,-1,3,-2]), A=1+rnd(4), n=1+rnd(3), c=j=>fr(k**j*A,fact16(j)), X=['','x','x²','x³','x⁴'], Y=(m,g)=>polf24([...Array(m+1).keys()].map(j=>[g?g(j):c(j),X[j]]));
    const right=Y(n), wrong=uniq(right,[Y(n-1),Y(n,j=>j===n?fint(k**j*A):c(j)),polf24([...Array(n).keys()].map(j=>[c(j+1),X[j+1]])),Y(n+1),Y(n,j=>j===n?fr(k*A,fact16(j)):c(j)),Y(n,j=>j===0?fint(0):c(j))].filter(s=>s!=='0'),3); if(wrong.length<3) return null;
    return {index:'q:24b.feed[k;'+[k,A,n].join(';')+']', lines:[['y′ = '+cf22(k,'y'),'the rule'],['y(0) = '+A,'the start'],['y₀(x) = '+A+', and yₙ₊₁(x) = '+A+' + ∫ '+cf22(k,'yₙ(t)')+' dt from 0 to x','repeated integration']], ask:'Which is the guess y'+sub15(n)+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'Each round adds one more piece: the area of '+sg(k)+' times the last piece. The guesses are the matches of '+A24(A)+E24(k,'x')+', the solution, and y'+sub15(n)+' is its match of degree '+n+'.'}; }});

/* ---------- 24c A Map That Shrinks Has One Fixed Point ---------- */
const WC24=[
  ['‖Tf − Tg‖ < ‖f − g‖ for all f ≠ g in D. Is that enough for the shrinking-map technique?','no: it asks for one k < 1 with ‖Tf − Tg‖ ≤ k‖f − g‖',['yes: every gap shrinks','yes, if D holds continuous functions','no: it asks for ‖Tf − Tg‖ = 0'],'With one k the steps of the run shrink like kⁿ, a geometric sum. Shrinking by less and less each time proves nothing.'],
  ['What is ‖f − g‖, for f and g continuous on [u, v]?','the largest value of |f(x) − g(x)| on [u, v]',['the area between f and g','|f(u) − g(u)|','the mean of |f(x) − g(x)| on [u, v]'],'Read it “the largest gap between f and g”. It exists since |f − g| is continuous on [u, v]. Accepted name: the sup norm.'],
  ['Continuous fₙ on [u, v] crowd in the largest gap. What follows?','they settle everywhere at once to a continuous f',['they settle at each point, and no more is shown','nothing: functions are not reals','they are all the same from some n on'],'Function-crowd technique: the line of reals has no holes, and neither does this space of functions.'],
  ['T shrinks gaps by one k < 1 and sends D into itself. How many f in D have Tf = f?','exactly one',['at least one, perhaps many','none, unless T is the map that changes nothing','endlessly many'],'Shrinking-map technique. Two fixed points f and g would have ‖f − g‖ ≤ k‖f − g‖, so their gap is 0.'],
  ['T shrinks gaps by one k < 1 on D. From which starts f₀ does fₙ₊₁ = Tfₙ settle at the fixed point?','from any start in D',['only from starts near the fixed point','only from f₀ = 0','from no start: the run only crowds'],'Shrinking-map technique: the run crowds in the largest gap, so it settles everywhere at once, and its limit is the fixed point.']];
QP.push({id:'24c.map',step:'24c',label:'gaps and shrinking maps',open:()=>measured('24c'),make(){ return writtenQ('24c.map',WC24); }},
  {id:'24c.gap',step:'24c',mode:'work',label:'the largest gap',open:()=>measured('24c'),make(){
    const t=rnd(3);
    if(t===0){ const a=rnd(7)-3, c=rnd(7)-3, b=rnd(9)-4, d=rnd(9)-4, u=rnd(3)-1, v=u+1+rnd(4), e=x=>Math.abs((a-c)*x+(b-d)); if(a===c||e(u)===e(v)) return null;
      const right=String(Math.max(e(u),e(v))), wrong=uniq(right,[Math.min(e(u),e(v)),Math.abs(a-c),Math.abs(b-d),e(u)+e(v),Math.max(e(u),e(v))+1,Math.abs(a-c)*(v-u)].map(String),3);
      return {index:'q:24c.gap[l;'+[a,b,c,d,u,v].join(';')+']', lines:[['f(x) = '+pol23([[a,1],[b,0]])+' and g(x) = '+pol23([[c,1],[d,0]]),'on ['+sg(u)+', '+v+']']], ask:'What is ‖f − g‖?', right, opts:shuffle([right,...wrong]), lead:'', why:'f(x) − g(x) = '+pol23([[a-c,1],[b-d,0]])+', a straight line, so its size is largest at an end. At '+sg(u)+' the gap is '+e(u)+' and at '+v+' it is '+e(v)+'.'}; }
    if(t===1){ const a=1+rnd(4), b=1+rnd(4), [txt,right,wrong,why]=pick([['f(x) = x and g(x) = x² on [0, 1]','1/4',['0','1','1/2'],'x − x² is largest at x = 1/2, where it is 1/4. At both ends the gap is 0.'],['f(x) = x² and g(x) = 0 on [−'+a+', '+b+']',String(Math.max(a,b)**2),uniq(String(Math.max(a,b)**2),[String(Math.min(a,b)**2),String(a*a+b*b),String(Math.max(a,b)),'0',String((a+b)**2)],3),'x² is largest at the end further from 0.'],['f(x) = sin x and g(x) = 0 on [0, π]','1',['0','π','2'],'sin is 0 at both ends and 1 in the middle. The largest gap need not be at an end.'],['f(x) = '+a+' and g(x) = '+a+' + x(1 − x) on [0, 1]','1/4',['0','1/2',String(a+1)],'The gap is x(1 − x), largest at x = 1/2.']]);
      return {index:'q:24c.gap[c;'+txt+']', lines:[[txt,'two continuous functions']], ask:'What is ‖f − g‖?', right, opts:shuffle([right,...wrong]), lead:'', why:why+' ‖f − g‖ is the largest value of |f(x) − g(x)| on the stretch.'}; }
    const [p,q]=pick(R22), c=1+rnd(5), R=fr(c*q,q-p), f=F=>polf24([[F,'x']]), right=f(R), wrong=uniq(right,[f(fint(c)),f(fr(c*p,q)),f(fr(c*q,q+p)),'0',f(fr(c*(q-p),q)),f(fr(q,q-p))],3); if(wrong.length<3) return null;
    return {index:'q:24c.gap[t;'+[p,q,c].join(';')+']', lines:[['(Tf)(x) = ('+p+'/'+q+')f(x) + '+cf22(c,'x'),'a map on the continuous functions on [0, 1]'],['‖Tf − Tg‖ = ('+p+'/'+q+')‖f − g‖','it shrinks gaps, with k = '+p+'/'+q]], ask:'Which f has Tf = f?', right:'f(x) = '+right, opts:shuffle([right,...wrong]).map(s=>'f(x) = '+s), lead:'', why:'f = ('+p+'/'+q+')f + '+cf22(c,'x')+' gives ('+(q-p)+'/'+q+')f = '+cf22(c,'x')+', so f(x) = '+right+'. By the shrinking-map technique it is the only one, and every run fₙ₊₁ = Tfₙ settles at it.'}; }});

/* ---------- 24d Tame Rules Fix the Future ---------- */
const WD24=[
  ['F is continuous. Has y′ = F(x, y) with a start exactly one solution?','not shown: continuous is not enough for one only; y′ = √|y| from (0, 0) has many',['yes, by the existence technique','yes, on the whole line','no: a continuous F never gives a solution'],'The existence technique asks for a tame F: continuous, with one number L bounding how fast F changes with y.'],
  ['There is exactly one solution on [x₀ − h, x₀ + h]. Is there one on the whole line?','not shown: only for a while; y′ = y² runs off in finite time',['yes: carry on step by step for ever','yes, since F is tame','no: there is never one past x₀ + h'],'The technique gives a stretch whose length depends on the rectangle. The steps may shrink as the solution climbs.'],
  ['What does it mean that F is tame on a rectangle R?','F is continuous on R, and one number L has |F(x, y) − F(x, z)| ≤ L|y − z| on R',['F is continuous on R','F has a ceiling on R','F does not involve x'],'L is its constant. A ceiling on the slope of F in y gives such an L.'],
  ['y and z solve the same tame rule, with constant L, and start |y(x₀) − z(x₀)| apart. How far apart can they be at x?','at most |y(x₀) − z(x₀)| · e^(L|x − x₀|)',['at most |y(x₀) − z(x₀)|','at most L|x − x₀|','as far as you like'],'Drift technique. In particular the same start gives the same solution, wherever both exist.'],
  ['In the existence technique, why is h chosen with hL < 1?','so that the map of repeated integration shrinks gaps by one k = hL < 1',['so that the solution stays under 1','so that F stays continuous','so that the start lies in the rectangle'],'Then the shrinking-map technique gives exactly one fixed point, and a fixed point of that map is a solution.']];
QP.push({id:'24d.tame',step:'24d',label:'tame rules',open:()=>measured('24d'),make(){ return writtenQ('24d.tame',WD24); }},
  {id:'24d.const',step:'24d',mode:'work',label:'constants and drift',open:()=>measured('24d'),make(){
    const t=rnd(3), a=2+rnd(5), b=1+rnd(4);
    if(t===0){ const NO='none: it is not tame there', [F,where,right,why]=pick([['F(x, y) = '+a+'y + x','any rectangle','L = '+a,'F(x, y) − F(x, z) = '+a+'(y − z).'],['F(x, y) = y²','a rectangle with |y| ≤ '+b,'L = '+2*b,'y² − z² = (y + z)(y − z), and |y + z| ≤ '+2*b+' there.'],['F(x, y) = xy','a rectangle with |x| ≤ '+a,'L = '+a,'xy − xz = x(y − z), and |x| ≤ '+a+' there.'],['F(x, y) = sin y + x²','any rectangle','L = 1','The slope of sin is cos, at most 1 in size, so |sin y − sin z| ≤ |y − z|.'],['F(x, y) = x² − '+a+'y','any rectangle','L = '+a,'F(x, y) − F(x, z) = −'+a+'(y − z), which is '+a+'|y − z| in size.'],['F(x, y) = √|y|','a rectangle holding points with y = 0',NO,'Near y = 0 the curve √|y| is steeper than any line: √y/y = 1/√y passes every bound. No L will do.'],['F(x, y) = y³','a rectangle with |y| ≤ '+b,'L = '+3*b*b,'The slope of y³ is 3y², at most '+3*b*b+' there.']]);
      const wrong=uniq(right,shuffle(['L = '+a,'L = '+2*b,'L = 1','L = '+b,'L = '+a*b,'L = '+3*b*b,'L = '+(a+1)]).concat([NO]),3);
      return {index:'q:24d.const[l;'+F+';'+where+']', lines:[[F,'on '+where]], ask:'Which constant L shows it tame there?', right, opts:shuffle([right,...wrong]), lead:'', why:why+' Tame asks for |F(x, y) − F(x, z)| ≤ L|y − z|.'}; }
    if(t===1){ const den=pick([10,100,1000]), L=1+rnd(3), d=1+rnd(3), F=fr(1,den), right=ce22(F,L*d), wrong=uniq(right,[fshow(F),ce22(F,L),ce22(F,d),fshow(fr(L*d,den)),ep22(L*d),ce22(F,L+d),ce22(F,-L*d)],3);
      return {index:'q:24d.const[d;'+[den,L,d].join(';')+']', lines:[['y and z solve the same tame rule, with constant L = '+L,'given'],['|y(x₀) − z(x₀)| = 1/'+den,'the two starts']], ask:'How far apart can they be at x = x₀ + '+d+', at most?', right, opts:shuffle([right,...wrong]), lead:'', why:'Drift technique: |y(x) − z(x)| ≤ |y(x₀) − z(x₀)| · e^(L|x − x₀|) = (1/'+den+') · e^('+L+' · '+d+') = '+right+'.'}; }
    const al=1+rnd(3), be=1+rnd(4), M=1+rnd(6), L=1+rnd(5), lim=[fint(al),fr(be,M),fr(1,L)].reduce((m,x)=>fless(x,m)?x:m), right=fshow(fhalf(lim)), wrong=uniq(right,[fmul(lim,fr(3,2)),fmul(lim,fint(2)),fadd(lim,fint(1)),fmul(lim,fint(3)),fadd(lim,fr(1,2))].map(fshow),3); if(wrong.length<3) return null;
    return {index:'q:24d.const[h;'+[al,be,M,L].join(';')+']', lines:[['F is tame on [x₀ − '+al+', x₀ + '+al+'] × [y₀ − '+be+', y₀ + '+be+'], with L = '+L+' and |F| ≤ '+M,'given'],['choose h > 0 with h ≤ α, hM ≤ β and hL < 1','the existence technique']], ask:'Which of these h may be chosen?', right:'h = '+right, opts:shuffle([right,...wrong]).map(s=>'h = '+s), lead:'', why:'h ≤ '+al+', h ≤ '+be+'/'+M+(fshow(fr(be,M))===be+'/'+M?'':' = '+fshow(fr(be,M)))+', and h < 1/'+L+'. The tightest of the three is '+fshow(lim)+', and only '+right+' is under it. On [x₀ − h, x₀ + h] there is then exactly one solution.'}; }});

/* ---------- 24e When the Future Is Not Fixed ---------- */
const WE24=[
  ['y′ = √|y| and y(0) = 0. Is y = 0 the only solution?','no: wait any time c, then follow (x − c)²/4',['yes: the slope at the start is 0','yes, by the existence technique','no: there is no solution at all'],'Many-futures technique. √|y| is continuous and not tame at y = 0, so the existence technique does not apply.'],
  ['y′ = y² is tame on every bounded rectangle. Does its solution from (0, 1) last for ever?','no: it leaves every bounded rectangle before x = 1',['yes: tame rules have solutions on the whole line','yes: the solution is unique','no: it stops at x = 0'],'Run-off technique: the solution is y = 1/(1 − x) on x < 1, and it passes every ceiling as x heads to 1.'],
  ['y = 1/(1 − x) also makes y′ = y² true for x > 1. Does the solution from (0, 1) continue there?','no: that piece starts from no point of the first; it is not the same solution',['yes: it is the same formula','yes, after a jump at x = 1','no: the formula fails for x > 1'],'A solution lives on one interval holding its start.'],
  ['A solution is unique. Can it therefore be computed as far as you like?','no: unique where it exists; it may stop existing',['yes: unique means it goes on','yes, with small enough steps','no: unique solutions cannot be computed'],'y′ = y² from (0, 1) is unique and has nothing to compute at x = 1.'],
  ['Why does the existence technique not apply to y′ = √|y| at the start (0, 0)?','√|y| is not tame near y = 0: no L bounds how fast it changes there',['√|y| is not continuous at 0','the start is not in any rectangle','√|y| is negative below 0'],'Near 0 the curve √|y| is steeper than every line.']];
QP.push({id:'24e.future',step:'24e',label:'many futures, and running off',open:()=>measured('24e'),make(){ return writtenQ('24e.future',WE24); }},
  {id:'24e.run',step:'24e',mode:'work',label:'how far the solution lives',open:()=>measured('24e'),make(){
    const t=rnd(3), A=pick([fint(2),fint(3),fint(4),fint(5),fr(1,2),fr(1,3),fr(3,2)]), NEV='never: it lives on the whole line';
    if(t===0){ const R=fr(A.q,A.p), right='at x = '+fshow(R), wrong=uniq(right,['at x = '+fshow(A),'at x = 1',NEV,'at x = '+fshow(fr(A.q,A.p+A.q)),'at x = '+fshow(fmul(R,fint(2)))],3);
      return {index:'q:24e.run[o;'+[A.p,A.q].join(';')+']', lines:[['y′ = y²','the rule'],['y(0) = '+fshow(A),'the start'],['y = '+fshow(A)+'/(1 − '+(A.q===1?(A.p===1?'':A.p):'('+fshow(A)+')')+'x)','the solution: put it back']], ask:'Where does the solution run off?', right, opts:shuffle([right,...wrong]), lead:'', why:'The bottom 1 − '+fshow(A)+' · x reaches 0 at x = '+fshow(R)+'. As x heads there from the left, y passes every ceiling, and no solution from this start reaches x = '+fshow(R)+'.'}; }
    if(t===1){ const m=2+rnd(3), x=fr(A.q,A.p*m), R=fmul(A,fr(m,m-1)), right=fshow(R), wrong=frs16(right,[fadd(A,fmul(fmul(A,A),x)),fmul(A,fr(m,m+1)),A,fmul(A,fint(m)),fadd(A,x),fmul(R,fint(2))]); if(wrong.length<3) return null;
      return {index:'q:24e.run[v;'+[A.p,A.q,m].join(';')+']', lines:[['y′ = y², y(0) = '+fshow(A),'the rule and the start'],['y = '+fshow(A)+'/(1 − '+(A.q===1?(A.p===1?'':A.p):'('+fshow(A)+')')+'x)','the solution: put it back']], ask:'What is y('+fshow(x)+')?', right, opts:shuffle([right,...wrong]), lead:'', why:'1 − '+fshow(A)+' · '+fshow(x)+' = '+fshow(fr(m-1,m))+', so y = '+fshow(A)+' / '+fpar22(fr(m-1,m))+' = '+right+'. The tangent line at the start would give '+fshow(fadd(A,fmul(fmul(A,A),x)))+'.'}; }
    const c=rnd(5), x=c+pick([-2,-1,2,4,6,1,3]), R=x<=c?fint(0):fr((x-c)**2,4); if(x<0) return null;
    const right=fshow(R), wrong=frs16(right,[fr((x-c)**2,4),fr(x*x,4),fr(Math.abs(x-c),2),fint(0),fint((x-c)**2),fr(x-c,4)]); if(wrong.length<3) return null;
    return {index:'q:24e.run[w;'+[c,x].join(';')+']', lines:[['y′ = √|y|, y(0) = 0','the rule and the start'],['y = 0 for x ≤ '+c+', and y = (x − '+c+')²/4 for x ≥ '+c,'one of its solutions: it waits until '+c]], ask:'What is y('+x+') on this solution?', right, opts:shuffle([right,...wrong]), lead:'', why:x<=c?x+' is not past '+c+', so the solution is still waiting at 0. The other formula is for x ≥ '+c+' only.':x+' is past '+c+', so y = ('+x+' − '+c+')²/4 = '+right+'. Every wait c ≥ 0 gives a different solution from the same start.'}; }});

/* ---------- 24f Separating the Variables ---------- */
const WF24=[
  ['y′ = y² gives −1/y = x + C. Is every solution y = −1/(x + C)?','no: dividing by y² lost the resting line y = 0',['yes: C may be any real','yes, by the side-by-side technique','no: none of those solves it'],'Resting-line technique: where h(c) = 0 the flat line y = c solves the rule, and the division never meets it.'],
  ['dy/y = dx gives ln y = x + C, so y = e^(x + C) > 0. What went wrong?','the area under 1/y is ln|y|, and y = 0 is a resting line',['nothing: every solution is positive','the area under 1/y is −1/y²','dx has no area'],'The negative solutions −eˣ⁺ᶜ and the flat line 0 were both dropped.'],
  ['Does y′ = x + y part, as ∫ dy/(x + y) = ∫ dx?','no: x + y is not an input piece times a height piece; the left area still holds x',['yes','yes, after dividing by y','no: no rule with a + in it parts'],'A rule parts when its slope is g(x)h(y).'],
  ['y = 2/(2 − x²) solves y′ = xy² with y(0) = 1. Does the solution live at every x other than ±√2?','no: a solution lives on one interval holding the start, here −√2 < x < √2',['yes: the formula works there','yes, by the put-back technique','no: it lives at x = 0 only'],'The outer pieces start from no point of the solution.'],
  ['A formula was found by hand. How is it shown to be a solution on I?','put it back: it has a slope at every x of I, makes the rule true there, and meets the start',['it came from a technique, so it is one','check the rule at the start only','check that it has a C in it'],'Put-back technique. And if F is tame on every rectangle, every solution with the same start agrees with it wherever both live.']];
QP.push({id:'24f.part',step:'24f',label:'parting the letters',open:()=>measured('24f'),make(){ return writtenQ('24f.part',WF24); }},
  {id:'24f.side',step:'24f',mode:'work',label:'side by side',open:()=>measured('24f'),make(){
    const t=rnd(4), c=1+rnd(6), a=1+rnd(4), b=a+1+rnd(3);
    if(t===0){ const yes=Math.random()<0.5, Y=['y′ = xy²','y′ = x/y','y′ = eˣ⁺ʸ','y′ = y cos x','y′ = (1 + x)(1 + y²)','y′ = '+a+'y','y′ = x²y'], N=['y′ = x + y','y′ = x − y²','y′ = sin(xy)','y′ = x² + y²','y′ = y + eˣ','y′ = 1 + xy'], right=pick(yes?Y:N), wrong=take(yes?N:Y,3);
      return {index:'q:24f.side[p;'+right+';'+wrong.join(';')+']', lines:[['a rule parts when its slope is an input piece times a height piece','y′ = g(x)h(y)']], ask:'Which of these rules '+(yes?'parts':'does not part')+'?', right, opts:shuffle([right,...wrong]), lead:'', why:yes?'Its right side is a function of x alone times a function of y alone'+(right==='y′ = eˣ⁺ʸ'?': eˣ⁺ʸ = eˣ · eʸ':'')+'. In each of the others x and y are joined by a + or sit together inside a function.':'Its right side cannot be written as a function of x alone times a function of y alone. Each of the others can'+(wrong.indexOf('y′ = eˣ⁺ʸ')>=0?': eˣ⁺ʸ = eˣ · eʸ.':'.')}; }
    if(t===1){ const f=s=>'y = '+s, right=f('1/('+c+' − x²)'), wrong=[f('1/('+c+' + x²)'),f(c+' − x²'),f('1/(1 − '+(c===1?'2':c)+'x²)')];
      return {index:'q:24f.side[s;'+c+']', lines:[['y′ = 2xy²','the rule: g(x) = 2x, h(y) = y²'],['y(0) = 1/'+c,'the start'],['∫ ds/s² from 1/'+c+' to y equals ∫ 2t dt from 0 to x','the side-by-side technique']], ask:'Which is the solution?', right, opts:shuffle([right,...wrong]), lead:'', why:'The left area is '+c+' − 1/y and the right area is x². So 1/y = '+c+' − x², and y = 1/('+c+' − x²). Put it back: y′ = 2x/('+c+' − x²)² = 2xy². It lives where '+c+' − x² > 0, the stretch holding the start.'}; }
    if(t===2){ const f=(p,q)=>'y = '+sg(p)+' and y = '+sg(q), right=f(a,-b), wrong=uniq(right,['y = '+a+' only',f(-a,b),'none: the rule has no flat solution','y = 0 only',f(a,b)],3);
      return {index:'q:24f.side[r;'+[a,b].join(';')+']', lines:[['y′ = x(y − '+a+')(y + '+b+')','the rule: h(y) = (y − '+a+')(y + '+b+')']], ask:'Which flat lines solve it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Resting-line technique: h is 0 at y = '+a+' and at y = −'+b+', so those flat lines have slope 0 and so has the right side. Dividing by h(y) would lose both.'}; }
    const f=s=>s, right='−√'+c+' < x < √'+c, wrong=['every x other than ±√'+c,'every x','0 ≤ x < '+c];
    return {index:'q:24f.side[i;'+c+']', lines:[['y = 1/('+c+' − x²)','solves y′ = 2xy² with y(0) = 1/'+c]], ask:'On which stretch does this solution live?', right:c===1?'−1 < x < 1':c===4?'−2 < x < 2':right, opts:shuffle([c===1?'−1 < x < 1':c===4?'−2 < x < 2':right,c===1?'every x other than ±1':c===4?'every x other than ±2':wrong[0],wrong[1],wrong[2]]), lead:'', why:'A solution lives on one interval holding the start. The bottom '+c+' − x² is 0 at ±'+(c===1?'1':c===4?'2':'√'+c)+', and the stretch between them holds x = 0. The outer pieces start from no point of the solution.'}; }},
  {id:'24f.line',step:'24f',mode:'proof',label:'what the division loses',open:()=>measured('24f'),make(){
    const a=1+rnd(5), V=[
      ['d1',[['y′ = y²','the rule'],['−1/y = x + C','divide by y² and take areas, where y ≠ 0'],['every solution is y = −1/(x + C) for some C','solve for y']],3,1,'Line 2 holds only where y ≠ 0. The flat line y = 0 solves the rule and is none of these.'],
      ['d2',[['y′ = x + y','the rule'],['∫ dy/(x + y) = ∫ dx','the side-by-side technique']],2,1,'The rule does not part: x + y is not an input piece times a height piece, and the left area still holds x.'],
      ['d3',[['y = 1/(1 − x) has y′ = 1/(1 − x)² = y² at every x < 1, and y(0) = 1','computed'],['y = 1/(1 − x) is a solution of y′ = y², y(0) = 1 on x < 1','the put-back technique']],2,0,'It has a slope at every x of the interval, makes the rule true there, and meets the start.'],
      ['d4',[['h('+a+') = 0','given'],['the flat line y = '+a+' solves y′ = g(x)h(y)','the resting-line technique']],2,0,'The flat line has slope 0, and g(x)h('+a+') = 0 at every x.'],
      ['d5',[['y = 1/('+a+' − x) makes y′ = y² true at every x ≠ '+a,'computed'],['it is one solution on the whole line less the point '+a,'the put-back technique']],2,1,'A solution lives on one interval. The two pieces, on x < '+a+' and on x > '+a+', are two solutions.'],
      ['d6',[['y′ = '+(a<2?2:a)+'y','the rule'],['dy/y = '+(a<2?2:a)+' dx, so ln|y| = '+(a<2?2:a)+'x + C','divide by y and take areas, where y ≠ 0'],['the solutions that are never 0 are y = ±e^C · e^('+(a<2?2:a)+'x)','undo the ln']],3,0,'ln|y| keeps both signs, and the line claims only the solutions that are never 0. The flat line y = 0 is a solution too, found apart.']];
    const [tag,lines,n,r,why]=pick(V);
    return {index:'q:24f.line['+[tag,a].join(';')+']', stack:true, lines, ask:'Is line '+n+' licensed?', right:YN22[r], opts:YN22, lead:'', why}; }});

/* ===== Laundry 5, rung 24 (floor 5 pools, stage W), part 2: 24g to 24l ===== */
const sgn24=(c,x)=>c===0?'':(c<0?' − ':' + ')+(Math.abs(c)===1?'':Math.abs(c))+x;

/* ---------- 24g The Integrating Factor ---------- */
const WG24=[
  ['y′ + 2y = x. Is (e^(2x)y)′ = x?','no: the factor multiplies the push too: (e^(2x)y)′ = xe^(2x)',['yes: the factor only gathers the left side','yes, since e^(2x) is never 0','no: the left side is (e^(x)y)′'],'Multiply the whole rule by the factor. The left side becomes one slope, and the right side carries the factor.'],
  ['y′ + 2xy = x. Is the multiplying factor e^(2x)?','no: it is e to an antiderivative of p, here e^(x²)',['yes: p = 2x, so the factor is e^(2x)','no: it is e^(2x²)','no: it is 2x'],'P is the area under p from x₀, and the factor is e^P.'],
  ['xy′ + y = 1. Is p = 1?','no: divide by x first; then p = 1/x and q = 1/x, on x > 0 or on x < 0',['yes: y stands alone','no: p = x','yes, and q = 1'],'A rule is straight in y when it is written y′ + p(x)y = q(x), with y′ alone.'],
  ['y = ½ solves y′ + 2xy = x. Is that every solution?','no: the constant of the area was dropped; the solutions are ½ + Ce^(−x²)',['yes: a straight rule has one solution','yes, by the whole-stretch technique','no: ½ does not solve it'],'One-plus-bare technique: any one solution plus every solution of the bare rule y′ + 2xy = 0.'],
  ['Where does a solution of a straight rule live?','on the whole open interval J holding x₀ on which p and q are continuous',['only near x₀, for a while','on the whole line, whatever p and q are','only where y stays positive'],'Whole-stretch technique: it can run off only at an end of J.'],
  ['What is the bare rule of y′ + p(x)y = q(x)?','y′ + p(x)y = 0: the same rule with the push q taken away',['y′ = q(x): the same rule with p taken away','y′ + p(x)y = 1','y′ = 0'],'Its solutions are Ce^(−P), one for each real C.']];
QP.push({id:'24g.straight',step:'24g',label:'straight rules',open:()=>measured('24g'),make(){ return writtenQ('24g.straight',WG24); }},
  {id:'24g.factor',step:'24g',mode:'work',label:'the multiplying factor',open:()=>measured('24g'),make(){
    const t=rnd(3), a=2+rnd(4), m=1+rnd(6), y0=m+pick([-3,-2,-1,1,2,3,4]);
    if(t===0){ const [rule,right,why]=pick([['y′ + '+a+'y = x',E24(a,'x'),'p = '+a+', and an antiderivative of it is '+a+'x.'],['y′ − '+a+'y = eˣ',E24(-a,'x'),'p = −'+a+', and an antiderivative of it is −'+a+'x.'],['y′ + 2xy = x','e^(x²)','p = 2x, and an antiderivative of it is x².'],['y′ + y/x = 1, on x > 0','x','p = 1/x, an antiderivative is ln x, and e^(ln x) = x.'],['y′ + '+a+'y/x = x, on x > 0','x'+sup15(a),'p = '+a+'/x, an antiderivative is '+a+' ln x, and e^('+a+' ln x) = x'+sup15(a)+'.'],['y′ + y cos x = cos x','e^(sin x)','p = cos x, and an antiderivative of it is sin x.'],['y′ + 3x²y = x²','e^(x³)','p = 3x², and an antiderivative of it is x³.'],['xy′ + '+a+'y = x², on x > 0','x'+sup15(a),'Divide by x first: p = '+a+'/x. An antiderivative is '+a+' ln x, and e^('+a+' ln x) = x'+sup15(a)+'.']]);
      const wrong=uniq(right,shuffle([E24(a,'x'),E24(-a,'x'),'e^(x²)','x','x'+sup15(a),'e^(sin x)','e^(x³)','e^(2x)','eˣ','1/x','e^(cos x)',String(a)]),3);
      return {index:'q:24g.factor[f;'+rule+']', lines:[[rule,'a rule straight in y']], ask:'Which factor turns the left side into one slope?', right, opts:shuffle([right,...wrong]), lead:'', why:why+' The factor is e to that antiderivative.'}; }
    const f=(mm,c,k)=>mm+(c<0?' − ':' + ')+(Math.abs(c)===1?'':Math.abs(c))+E24(k,'x');
    if(t===1){ const c=y0-m, right=f(m,c,-a), wrong=uniq(right,[f(m,c,a),f(m,y0,-a),f(a*m,y0-a*m,-a),f(m,-c,-a),y0+E24(-a,'x')].filter(v=>!/(^| )0e/.test(v)),3); if(wrong.length<3) return null;
      return {index:'q:24g.factor[s;'+[a,m,y0].join(';')+']', lines:[['y′ + '+a+'y = '+a*m,'a rule straight in y'],['y(0) = '+sg(y0),'the start'],['(e^('+a+'x)y)′ = '+a*m+'e^('+a+'x)','multiply by the factor e^('+a+'x)']], ask:'Which is the solution?', right:'y = '+right, opts:shuffle([right,...wrong]).map(s=>'y = '+s), lead:'', why:'Take the area: e^('+a+'x)y = '+A24(m)+'e^('+a+'x) + C, so y = '+m+' + Ce^(−'+a+'x). The start gives '+sg(y0)+' = '+m+' + C, so C = '+sg(c)+'. Put it back: y′ = '+sg(-a*c)+'e^(−'+a+'x), and y′ + '+a+'y = '+a*m+'.'}; }
    const g=s=>'y = '+s, right=m+' + C'+E24(-a,'x'), wrong=[m+' + C',m+' + C'+E24(a,'x'),m+' only'];
    return {index:'q:24g.factor[b;'+[a,m].join(';')+']', lines:[['y′ + '+a+'y = '+a*m,'a rule straight in y'],['y = '+m+' solves it','checked: its slope is 0, and '+a+' · '+m+' = '+a*m]], ask:'Which are all its solutions?', right:g(right), opts:shuffle([right,...wrong]).map(g), lead:'', why:'One-plus-bare technique: the bare rule y′ + '+a+'y = 0 has the solutions Ce^(−'+a+'x), by the own-rate technique. Add them to the one solution found.'}; }});

/* ---------- 24h The Two Model Equations ---------- */
const WH24=[
  ['y′ = 0.5(y − 20). Does every solution head to 20?','no: k > 0, so the resting value pushes; only the flat line stays',['yes: 20 is the resting value','yes, from starts above 20','no: every solution heads to 0'],'Shift-to-rest technique: y = A + (y₀ − A)e^(k(x − x₀)). With k < 0 the gap shrinks; with k > 0 it grows.'],
  ['y″ = −y and y(0) = 1. Is y = cos x the solution?','not yet: a second-order rule needs a slope too; cos x + B sin x fits for every B',['yes','no: the solution is sin x','no: the rule has no solution'],'A start for a second-order rule is two numbers at one input: a height and a slope.'],
  ['The trial equation has r = 2 twice. Is every solution C₁e^(2x) + C₂e^(2x)?','no: that is (C₁ + C₂)e^(2x), one constant; the second solution is xe^(2x)',['yes','no: the second solution is e^(−2x)','no: there is only one solution'],'Tried-growth technique: with a double root r, every solution is (C₁ + C₂x)e^(rx).'],
  ['y″ = −4y gives r² = −4, with no real root. Has the rule no solution?','no: the steady swing solves it; only the tried growths fail',['yes: no growth fits','yes, on the reals','no: e^(2x) solves it'],'Steady-swing technique: y = A cos 2x + (B/2) sin 2x.'],
  ['Every solution of y″ = −n²y repeats. How often?','every 2π/n',['every 2π','every n','every 2πn'],'cos and sin of n(x − x₀) repeat when n(x − x₀) grows by 2π.'],
  ['What is the trial equation of y″ + by′ + cy = 0?','r² + br + c = 0',['r² + cr + b = 0','br + c = 0','r² = bc'],'Try y = e^(rx): the rule becomes (r² + br + c)e^(rx) = 0, and e^(rx) is never 0.']];
QP.push({id:'24h.two',step:'24h',label:'rest and swing',open:()=>measured('24h'),make(){ return writtenQ('24h.two',WH24); }},
  {id:'24h.model',step:'24h',mode:'work',label:'the model rules by hand',open:()=>measured('24h'),make(){
    const t=rnd(5), A=5*(1+rnd(8)), k=pick([-3,-2,-1,1,2,3]), y0=A+pick([-10,-5,-2,3,5,10]), n=2+rnd(3);
    if(t===0){ const O=[String(A),String(y0),'past every ceiling','past every floor'], right=k<0?O[0]:y0>A?O[2]:O[3];
      return {index:'q:24h.model[h;'+[k,A,y0].join(';')+']', lines:[['y′ = '+(k===1?'y − '+A:A24(k)+'(y − '+A+')'),'the rule'],['y(0) = '+y0,'the start']], ask:'Where does y head as x grows?', right, opts:shuffle(O.slice()), lead:'', why:'Shift-to-rest technique: y = '+A+pm(y0-A)+E24(k,'x')+'. '+(k<0?'k = '+sg(k)+' is under 0, so the gap to '+A+' shrinks toward 0.':'k = '+k+' is over 0, so the gap to '+A+' grows, and it started '+(y0>A?'above':'below')+' '+A+'.')}; }
    if(t===1){ if(!y0) return null; const f=(a,c,kk)=>a+(c<0?' − ':' + ')+(Math.abs(c)===1?'':Math.abs(c))+E24(kk,'x'), c=y0-A, right=f(A,c,k), wrong=uniq(right,[f(A,c,-k),f(A,y0,k),f(y0,A,k),f(A,-c,k),y0+E24(k,'x')],3);
      return {index:'q:24h.model[f;'+[k,A,y0].join(';')+']', lines:[['y′ = '+(k===1?'y − '+A:A24(k)+'(y − '+A+')'),'the rule'],['y(0) = '+y0,'the start']], ask:'Which is the solution?', right:'y = '+right, opts:shuffle([right,...wrong]).map(s=>'y = '+s), lead:'', why:'Shift-to-rest technique: z = y − '+A+' has z′ = '+cf22(k,'z')+', so z = z(0)'+E24(k,'x')+' with z(0) = '+y0+' − '+A+' = '+sg(c)+'.'}; }
    if(t===2){ const a=1+rnd(5), mm=pick([-3,-2,-1,1,2,3]), B=n*mm, f=(p,q,w)=>p+' cos '+w+(q<0?' − ':' + ')+(Math.abs(q)===1?'':Math.abs(q)+' ')+'sin '+w, right=f(a,mm,n+'x'), wrong=uniq(right,[f(a,B,n+'x'),f(a,mm,'x'),f(a,mm,n*n+'x'),f(Math.abs(mm),a*Math.sign(mm),n+'x'),f(a,-mm,n+'x')],3);
      return {index:'q:24h.model[s;'+[n,a,mm].join(';')+']', lines:[['y″ = −'+n*n+'y','the rule'],['y(0) = '+a+' and y′(0) = '+sg(B),'the start: a height and a slope']], ask:'Which is the solution?', right:'y = '+right, opts:shuffle([right,...wrong]).map(s=>'y = '+s), lead:'', why:'Steady-swing technique with n = '+n+': y = A cos nx + (B/n) sin nx = '+a+' cos '+n+'x + ('+sg(B)+'/'+n+') sin '+n+'x. Put it back: y(0) = '+a+', and y′(0) = '+n+' · '+par10(mm)+' = '+sg(B)+'.'}; }
    if(t===3){ const right=pi21(2,n), wrong=uniq(right,['2π',pi21(2*n,1),pi21(1,n*n),pi21(2,n*n),String(n),pi21(1,2*n)],3);
      return {index:'q:24h.model[p;'+n+']', lines:[['y″ = −'+n*n+'y','the rule']], ask:'How often does every solution repeat?', right:'every '+right, opts:shuffle([right,...wrong]).map(s=>'every '+s), lead:'', why:'Steady-swing technique with n = '+n+': the solutions are built from cos '+n+'x and sin '+n+'x, which repeat every 2π/'+n+(right==='2π/'+n?'':' = '+right)+'.'}; }
    const R=[-3,-2,-1,1,2,3], r1=pick(R), r2=pick(R), b=-(r1+r2), c=r1*r2, rule='y″'+sgn24(b,'y′')+sgn24(c,'y')+' = 0', G=(p,q)=>p===q?'(C₁ + C₂x)'+E24(p,'x'):'C₁'+E24(Math.min(p,q),'x')+' + C₂'+E24(Math.max(p,q),'x');
    const right=G(r1,r2), wrong=uniq(right,[G(-r1,-r2),r1===r2?'C₁'+E24(r1,'x')+' + C₂'+E24(-r1,'x'):G(r1,r1),'C₁ cos '+(Math.abs(r1)===1?'':Math.abs(r1))+'x + C₂ sin '+(Math.abs(r1)===1?'':Math.abs(r1))+'x',G(r1,-r2),G(b||1,c||2),r1===r2?'C₁'+E24(r1,'x'):G(r2,r2)],3);
    return {index:'q:24h.model[g;'+[r1,r2].sort().join(';')+']', lines:[[rule,'the rule'],['r²'+sgn24(b,'r')+(c?(c<0?' − ':' + ')+Math.abs(c):'')+' = 0','its trial equation']], ask:'Which are all its solutions?', right:'y = '+right, opts:shuffle([right,...wrong]).map(s=>'y = '+s), lead:'', why:'The trial equation factors as (r'+pm(-r1)+')(r'+pm(-r2)+') = 0, so '+(r1===r2?'r = '+sg(r1)+' twice. Tried-growth technique: with a double root the solutions are (C₁ + C₂x)e^(rx).':'r = '+sg(Math.min(r1,r2))+' or r = '+sg(Math.max(r1,r2))+'. Tried-growth technique: each root gives a growth, and every solution is a mix of the two.')}; }},
  {id:'24h.cool',step:'24h',mode:'word',label:'closing on the room',open:()=>measured('24h'),make(){
    const [R,T0]=pick([[20,84],[20,68],[22,70],[20,100],[18,82],[16,80],[20,52]]), G=T0-R, m=pick([5,6,8,10]), j=2+rnd(2), what=pick(['A cup of soup','A pot of tea','A baked loaf','A bowl of porridge']), r=R+G/2**j;
    const right=r+' degrees', wrong=uniq(right,[T0-j*G/2,R+G/(2*j),R,G/2**j,T0/2**j,R+G/2**(j-1),R+G/2**(j+1)].filter(v=>Number.isInteger(v)&&v>0&&v!==r).map(v=>v+' degrees'),3); if(wrong.length<3) return null;
    return {index:'q:24h.cool['+[what,R,T0,m,j].join(';')+']', a3:['24h.cool',DASH,DASH], story:what+' at '+T0+' degrees stands in a room at '+R+' degrees and cools by the rule T′ = k(T − '+R+'). After '+m+' minutes it is at '+(R+G/2)+' degrees.', lines:[], ask:'How warm is it after '+j*m+' minutes?', right, opts:shuffle([right,...wrong]), lead:'', why:'Shift-to-rest technique: the gap to the room, T − '+R+', shrinks by the same factor in every stretch of the same length. In '+m+' minutes it went from '+G+' to '+G/2+', a half. After '+j+' such stretches it is '+G+'/'+2**j+' = '+G/2**j+', so T = '+R+' + '+G/2**j+' = '+r+'.'}; }});

/* ---------- 24i Slope Fields and Stepping Forward ---------- */
const WI24=[
  ['Halve the step of a forward walk. What happens to the slip of each step, and to the error of the walk?','each slip falls to about a quarter, and the walk’s error halves, since there are twice as many slips',['each slip halves, and so does the walk’s error','each slip falls to a quarter, and so does the walk’s error','nothing: the walk does not depend on the step'],'A slip is about h². The walk-error technique bounds the whole walk by a multiple of h.'],
  ['Is yₙ₊₁ = yₙ + h·F(xₙ₊₁, ỹ) the look-ahead step?','no: it steps with the average of the two slopes, yₙ₊₁ = yₙ + h(s₁ + s₂)/2',['yes','no: it steps with the first slope only','no: it steps with the larger of the two slopes'],'The slope at the trial point alone is as crude as the forward step. The average is what matches degree 2.'],
  ['Does a smaller step always give a better walk?','no: every step also rounds, and with many tiny steps the rounding slips add up',['yes, always','yes, once h is under 1','no: a larger step is always better'],'The bound of the walk-error technique shrinks with h. The rounding of each step does not.'],
  ['The solution of a rule is gentle. Is a forward walk that follows it steady?','not on a stiff rule: for y′ = −ky the plain walk swings wildly unless hk < 2',['yes: a gentle solution is easy to follow','yes, with any step under 1','no: no walk follows a gentle solution'],'Stiff-step technique: each forward step multiplies by 1 − hk, and that is under 1 in size exactly when hk < 2.'],
  ['What is the forward walk with step h from (x₀, y₀)?','xₙ₊₁ = xₙ + h and yₙ₊₁ = yₙ + h·F(xₙ, yₙ)',['xₙ₊₁ = xₙ + h and yₙ₊₁ = yₙ + F(xₙ, yₙ)','xₙ₊₁ = xₙ + h and yₙ₊₁ = h·F(xₙ, yₙ)','xₙ₊₁ = xₙ and yₙ₊₁ = yₙ + h'],'Each step follows the stroke of the slope field at the point where it stands. Accepted name: the forward step method.'],
  ['For y′ = ky from (0, A), where do n forward steps of length x/n land, and where does that head?','at A(1 + kx/n)ⁿ, which heads to Ae^(kx) as n grows',['at A + kx, whatever n is','at A(1 + kx)ⁿ, which passes every bound','at Ae^(kx) exactly, for every n'],'Small-step technique: each step multiplies by 1 + kx/n.']];
const FI24=[['x + y',(x,y)=>fadd(x,y)],['y',(x,y)=>y],['x − y',(x,y)=>fsub(x,y)],['2x',(x,y)=>fmul(fint(2),x)],['xy',(x,y)=>fmul(x,y)],['1 + y',(x,y)=>fadd(fint(1),y)]];
QP.push({id:'24i.walk',step:'24i',label:'walking the field',open:()=>measured('24i'),make(){ return writtenQ('24i.walk',WI24); }},
  {id:'24i.step',step:'24i',mode:'work',label:'steps by hand',open:()=>measured('24i'),make(){
    const t=rnd(4), [name,F]=pick(FI24), h=pick([fint(1),fr(1,2)]), x0=fint(rnd(2)), y0=fint(1+rnd(3)), x1=fadd(x0,h), s1=F(x0,y0), y1=fadd(y0,fmul(h,s1));
    if(t===0){ const y2=fadd(y1,fmul(h,F(x1,y1))), right=fshow(y2), wrong=frs16(right,[y1,fadd(y0,fmul(fmul(fint(2),h),s1)),fadd(y1,F(x1,y1)),fadd(y2,h),fadd(y1,fmul(h,F(x0,y1))),fadd(y2,fint(1))]); if(wrong.length<3) return null;
      return {index:'q:24i.step[w;'+[name,fshow(h),x0.p,y0.p].join(';')+']', lines:[['y′ = '+name,'the rule'],['start at ('+fshow(x0)+', '+fshow(y0)+'), with step h = '+fshow(h),'the forward walk: yₙ₊₁ = yₙ + h·F(xₙ, yₙ)']], ask:'Where is y after two steps?', right, opts:shuffle([right,...wrong]), lead:'', why:'Step 1: the slope at ('+fshow(x0)+', '+fshow(y0)+') is '+fshow(s1)+', so y₁ = '+fshow(y0)+' + '+fshow(h)+' · '+fpar22(s1)+' = '+fshow(y1)+'. Step 2: the slope at ('+fshow(x1)+', '+fshow(y1)+') is '+fshow(F(x1,y1))+', so y₂ = '+fshow(y1)+' + '+fshow(h)+' · '+fpar22(F(x1,y1))+' = '+right+'.'}; }
    if(t===1){ const s2=F(x1,y1), R=fadd(y0,fmul(fhalf(h),fadd(s1,s2))), right=fshow(R), wrong=frs16(right,[y1,fadd(y0,fmul(h,s2)),fadd(y0,fmul(h,fadd(s1,s2))),fadd(R,h),fadd(y0,fhalf(fadd(s1,s2))),fadd(y1,fmul(h,s2))]); if(wrong.length<3) return null;
      return {index:'q:24i.step[a;'+[name,fshow(h),x0.p,y0.p].join(';')+']', lines:[['y′ = '+name,'the rule'],['start at ('+fshow(x0)+', '+fshow(y0)+'), with step h = '+fshow(h),'one look-ahead step: yₙ₊₁ = yₙ + h(s₁ + s₂)/2']], ask:'Where is y after the step?', right, opts:shuffle([right,...wrong]), lead:'', why:'s₁ = '+fshow(s1)+' at the start. The trial step lands at ỹ = '+fshow(y1)+', where the slope is s₂ = '+fshow(s2)+'. Step with the average: '+fshow(y0)+' + '+fshow(h)+' · ('+fshow(s1)+' + '+fpar22(s2)+')/2 = '+right+'.'}; }
    if(t===2){ const k=pick([4,10,20,50,100]), right=fshow(fr(1,k)), wrong=[fr(3,k),fr(5,k),fr(5,2*k)].map(fshow);
      return {index:'q:24i.step[s;'+k+']', lines:[['y′ = −'+k+'y','the rule: its solutions shrink toward 0'],['yₙ₊₁ = (1 − '+k+'h)yₙ','forward steps']], ask:'With which step h do the forward steps shrink toward 0?', right:'h = '+right, opts:shuffle([right,...wrong]).map(s=>'h = '+s), lead:'', why:'Stiff-step technique: the steps shrink exactly when |1 − hk| < 1, which is hk < 2, here h < '+fshow(fr(2,k))+'. With the other steps 1 − hk is under −1, and the walk swings wider at every step.'}; }
    const n=2+rnd(3), R=fr((n+1)**n,n**n), right=fshow(R), wrong=uniq(right,['2','e',fshow(fr((n+1)**(n-1),n**(n-1))),fshow(fr((n+2)**n,(n+1)**n)),fshow(fr(n+1,n)),'3'],3);
    return {index:'q:24i.step[e;'+n+']', lines:[['y′ = y, from (0, 1)','the rule and the start'],[n+' forward steps of length 1/'+n,'to x = 1']], ask:'Where does the walk land?', right, opts:shuffle([right,...wrong]), lead:'', why:'Small-step technique: each step multiplies by 1 + 1/'+n+', so the walk lands at ('+(n+1)+'/'+n+')'+sup15(n)+' = '+right+'. The solution is at e, a little higher, and more steps come nearer.'}; }});

/* ---------- 24j The Logistic Equation Solved ---------- */
const WJ24=[
  ['P = K/(1 + Ce^(−rt)) solves the rule. Is it thereby shown that no other solution starts at P₀?','no: checking one solution says nothing about others; tameness and the drift technique do',['yes: it has the right start','yes: the formula has only one C','no: there are always two'],'The rule is tame on every bounded rectangle, so two solutions with the same start agree wherever both live.'],
  ['P climbs toward K. Does it reach K and rest there?','no: it would touch the resting line P = K, and a tame rule forbids it',['yes, after a finite time','yes, at t = 1/r','no: it turns back before K'],'Resting-line technique: no solution that starts off the line ever touches it. P comes as near K as you like and never gets there.'],
  ['1/P closes on 1/K by a fixed factor in every stretch of time T. Does P close on K by the same factor?','no: the factor is for the gap in 1/P; the gap in P shrinks by a factor that changes',['yes: 1/P and P close together','yes, once P is near K','no: P does not close on K at all'],'Reciprocal-cooling technique: u = 1/P solves u′ = −r(u − 1/K).'],
  ['The smooth rule settles at K from any start between 0 and K. Does the yearly walk too?','only when hr < 2; past it the walk swings',['yes, always','yes, if the start is under K','no, never'],'Logistic-walk technique: forward steps of size h pull starts near K in when 0 < hr < 2.'],
  ['A start above K: what does the solution do?','it falls to K',['it climbs past every ceiling','it stays where it is','it runs off to minus infinity'],'Every-start technique. A start below 0 is the one that runs off, in finite time.']];
QP.push({id:'24j.logi',step:'24j',label:'the logistic rule',open:()=>measured('24j'),make(){ return writtenQ('24j.logi',WJ24); }},
  {id:'24j.solve',step:'24j',mode:'work',label:'solutions and starts',open:()=>measured('24j'),make(){
    const t=rnd(4), K=pick([100,200,1000]), C=pick([1,3,4,9]), P0=K/(C+1), r=1+rnd(3);
    if(t===0){ const f=(c,sgn,kk)=>K+'/(1 '+sgn+' '+(c===1?'':c)+E24(kk,'t')+')', right=f(C,'+',-r), wrong=uniq(right,[f(C,'+',r),f(P0,'+',-r),P0+E24(r,'t'),f(C,'−',-r),f(C+1,'+',-r)],3);
      return {index:'q:24j.solve[c;'+[K,C,r].join(';')+']', lines:[['P′ = '+(r===1?'':r)+'P(1 − P/'+K+')','the rule'],['P(0) = '+P0,'the start'],['P = K/(1 + Ce^(−rt)), with C = (K − P₀)/P₀','the stays-between technique']], ask:'Which is the solution?', right:'P = '+right, opts:shuffle([right,...wrong]).map(s=>'P = '+s), lead:'', why:'C = ('+K+' − '+P0+')/'+P0+' = '+C+'. Check the start: at t = 0 the bottom is 1 + '+C+' = '+(C+1)+', and '+K+'/'+(C+1)+' = '+P0+'.'}; }
    if(t===1){ const rr=pick([fr(1,2),fr(1,5),fr(1,10),fint(1)]), P=pick([10,20,25,50,80].map(v=>v*K/100)), R=fmul(fmul(rr,fint(P)),fr(K-P,K)), right=fshow(R), wrong=frs16(right,[fmul(rr,fint(P)),fmul(rr,fint(K-P)),fmul(fmul(rr,fint(P)),fr(P,K)),fmul(R,fint(2)),fmul(fint(P),fr(K-P,K)),fhalf(R)]); if(wrong.length<3) return null;
      return {index:'q:24j.solve[g;'+[K,fshow(rr),P].join(';')+']', lines:[['P′ = '+(rr.q===1?'':'('+fshow(rr)+')')+'P(1 − P/'+K+')','the rule']], ask:'How fast is P growing when P = '+P+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'Put P = '+P+' into the right side: '+fshow(rr)+' · '+P+' · (1 − '+P+'/'+K+') = '+fshow(rr)+' · '+P+' · '+fshow(fr(K-P,K))+' = '+right+'.'}; }
    if(t===2){ const O=['it climbs toward '+K+' and never touches it','it falls toward '+K+' and never touches it','it stays where it is','it runs off to minus infinity in a finite time'], [st,i,why]=pick([[P0,0,'A start between 0 and K: the solution lives for every t and never touches 0 or K.'],[K/2,0,'A start between 0 and K: the solution lives for every t and never touches 0 or K.'],[K+K/4,1,'A start above K falls to K. It cannot touch the resting line P = K.'],[2*K,1,'A start above K falls to K. It cannot touch the resting line P = K.'],[0,2,'P = 0 is a resting line: the right side is 0 there.'],[K,2,'P = K is a resting line: the right side is 0 there.'],[-K/10,3,'Below 0 both factors push down, harder and harder: C is under −1 and the bottom 1 + Ce^(−rt) reaches 0 at t = ln(−C)/r.']]);
      return {index:'q:24j.solve[s;'+[K,r,st].join(';')+']', lines:[['P′ = '+(r===1?'':r)+'P(1 − P/'+K+')','the rule'],['P(0) = '+sg(st),'the start']], ask:'What does the solution do as t grows?', right:O[i], opts:shuffle(O.slice()), lead:'', why:'Every-start technique. '+why}; }
    const rr=pick([fr(1,2),fint(1),fint(2),fr(1,4)]), P=pick([20,40,50,80,120].map(v=>v*K/100)), R=fadd(fint(P),fmul(fmul(rr,fint(P)),fr(K-P,K))), right=fshow(R), wrong=frs16(right,[fadd(fint(P),fmul(rr,fint(P))),fmul(fmul(rr,fint(P)),fr(K-P,K)),fint(K),fadd(fint(P),fmul(rr,fint(K-P))),fsub(fint(P),fmul(fmul(rr,fint(P)),fr(K-P,K))),fint(P)]); if(wrong.length<3||R.q!==1) return null;
    return {index:'q:24j.solve[w;'+[K,fshow(rr),P].join(';')+']', lines:[['Pₙ₊₁ = Pₙ + '+(rr.q===1?(rr.p===1?'':rr.p):'('+fshow(rr)+')')+'Pₙ(1 − Pₙ/'+K+')','the yearly walk, h = 1'],['P₀ = '+P,'the start']], ask:'What is P₁?', right, opts:shuffle([right,...wrong]), lead:'', why:P+' + '+fshow(rr)+' · '+P+' · (1 − '+P+'/'+K+') = '+P+' + '+fpar22(fmul(fmul(rr,fint(P)),fr(K-P,K)))+' = '+right+'.'+(rr.p>=2?' With hr = 2 the walk no longer pulls starts near '+K+' in.':'')}; }},
  {id:'24j.island',step:'24j',mode:'word',label:'a count a year',open:()=>measured('24j'),make(){
    const [who,where]=pick([['hares','An island'],['voles','A meadow'],['carp','A pond'],['finches','A wood']]), K=pick([400,1000,2000]), P=pick([1,2,4].map(v=>v*K/5).concat([K/2])), rr=pick([fr(1,2),fint(1),fr(1,4)]), add=fmul(fmul(rr,fint(P)),fr(K-P,K)); if(add.q!==1) return null;
    const r=P+add.p, right=String(r), wrong=uniq(right,[P+rr.p*P/rr.q,add.p,K,P+rr.p*(K-P)/rr.q,P-add.p,2*P].filter(v=>Number.isInteger(v)&&v!==r&&v>0).map(String),3); if(wrong.length<3) return null;
    return {index:'q:24j.island['+[who,K,P,fshow(rr)].join(';')+']', a3:['24j.island',DASH,DASH], story:where+' can feed '+K+' '+who+' and no more. Each year the count grows by '+(rr.q===1?'':fshow(rr)+' of ')+'itself times the share of the room still free: Pₙ₊₁ = Pₙ + '+(rr.q===1?'':'('+fshow(rr)+')')+'Pₙ(1 − Pₙ/'+K+'). This year there are '+P+'.', lines:[], ask:'How many are there next year?', right, opts:shuffle([right,...wrong]), lead:'', why:'The share of the room still free is 1 − '+P+'/'+K+' = '+fshow(fr(K-P,K))+'. The count grows by '+fshow(rr)+' · '+P+' · '+fshow(fr(K-P,K))+' = '+add.p+', to '+r+'.'}; }});

/* ---------- 24k Fixed Points, Stability and the Start of Chaos ---------- */
const WK24=[
  ['F(y*) = 0. Do solutions that start near y* head to it?','only if the resting place holds: F′(y*) < 0 is enough; if F′(y*) > 0 they leave',['yes: y* is a resting place','yes, from one side','no: they never do'],'Sign-of-slope technique. Just above a place with F′ < 0 the slope is negative, and just below it is positive: both push back.'],
  ['F′(y*) = 0 at a resting place. Does it hold?','not decided: y′ = y³ falls apart at 0, and y′ = −y³ holds there',['yes','no: it falls apart','yes, from above only'],'The sign-of-slope technique is silent when the slope is 0.'],
  ['The rule of a run is fixed. Can the run be forecast as far as wanted?','no: at μ = 4 a start known to ten places is lost after some 33 steps',['yes: a fixed rule fixes the run','yes, with a start known to ten places','no: the rule itself changes from step to step'],'Angle-doubling technique: each step doubles the angle, so each step doubles the slip in the start.'],
  ['What is a resting place of y′ = F(y)?','a y* with F(y*) = 0',['a y* with F′(y*) = 0','a y* with F(y*) = y*','the start y(0)'],'The constant y = y* is then a solution: a resting line.'],
  ['For y′ = μ − y², what happens as the knob μ is turned down through 0?','the two resting places √μ and −√μ meet at 0 and then there is none',['the two resting places swap','a third resting place appears','nothing: the resting places do not depend on μ'],'Fold technique. Below 0 every solution falls past every floor.'],
  ['For g(x) = μx(1 − x), what are two points p ≠ q with g(p) = q and g(q) = p?','a cycle of two',['two fixed points','a resting place','a fold'],'Two-cycle technique: past μ = 3 the fixed point 1 − 1/μ pushes, and a cycle of two appears.']];
QP.push({id:'24k.hold',step:'24k',label:'holding and falling apart',open:()=>measured('24k'),make(){ return writtenQ('24k.hold',WK24); }},
  {id:'24k.rest',step:'24k',mode:'work',label:'resting places',open:()=>measured('24k'),make(){
    const t=rnd(4), a=rnd(7)-3, b=a+1+rnd(4), k=pick([-2,-1,1,2,3]), m=1+rnd(4);
    if(t===0){ const O=[sg(a)+' holds and '+sg(b)+' falls apart',sg(b)+' holds and '+sg(a)+' falls apart','both hold','both fall apart'], right=O[k>0?0:1];
      return {index:'q:24k.rest[s;'+[k,a,b].join(';')+']', lines:[['y′ = '+A24(k)+'(y'+pm(-a).replace(/ [+−] 0$/,'')+')(y'+pm(-b).replace(/ [+−] 0$/,'')+')','a rule that looks only at the state']], ask:'What do its two resting places do?', right, opts:shuffle(O.slice()), lead:'', why:'Between '+sg(a)+' and '+sg(b)+' the two brackets have opposite signs, so the slope there is '+(k>0?'negative: solutions fall toward '+sg(a)+' and away from '+sg(b):'positive: solutions climb toward '+sg(b)+' and away from '+sg(a))+'. The sign-of-slope technique says the same: F′ is negative at the one that holds.'}; }
    if(t===1){ const O=[m+' holds and −'+m+' falls apart','−'+m+' holds and '+m+' falls apart','there is no resting place','0 is the only resting place'], mu=pick([m*m,m*m,-m*m,0]), right=mu>0?O[0]:mu<0?O[2]:O[3];
      return {index:'q:24k.rest[f;'+[mu,m].join(';')+']', lines:[['y′ = μ − y², with the knob at μ = '+sg(mu),'the rule']], ask:'What are its resting places?', right, opts:shuffle(O.slice()), lead:'', why:'Fold technique: '+(mu>0?'μ − y² = 0 at y = ±'+m+'. The slope of μ − y² is −2y: negative at '+m+', which holds, and positive at −'+m+', which falls apart.':mu<0?'μ − y² is under 0 for every y, so nothing rests and every solution falls past every floor.':'at μ = 0 the two resting places meet at 0.')}; }
    if(t===2){ const mu=pick([fr(3,2),fr(9,4),fr(5,2),fr(16,5),fr(7,2),fr(5,4)]), L=fsub(fint(1),fr(mu.q,mu.p)), s=fsub(fint(2),mu), pull=Math.abs(s.p)<s.q, f=(X,v)=>fshow(X)+': it '+(v?'pulls nearby starts in':'pushes nearby starts away'), right=f(L,pull), wrong=uniq(right,[f(L,!pull),f(fr(mu.q,mu.p),pull),f(fr(mu.q,mu.p),!pull),f(fr(1,2),pull)],3);
      return {index:'q:24k.rest[m;'+[mu.p,mu.q].join(';')+']', lines:[['g(x) = '+(mu.q===1?mu.p:'('+fshow(mu)+')')+'x(1 − x)','the yearly rule, with μ = '+fshow(mu)]], ask:'Which is its fixed point other than 0, and what does it do?', right, opts:shuffle([right,...wrong]), lead:'', why:'The fixed point is 1 − 1/μ = '+fshow(L)+', and the slope of g there is 2 − μ = '+fshow(s)+'. Two-cycle technique: it pulls in for 1 < μ < 3 and pushes past μ = 3.'}; }
    const mu=pick([2,3,4]), x0=pick([fr(1,2),fr(1,4),fr(1,3),fr(3,4),fr(1,5),fr(2,3)]), g=x=>fmul(fmul(fint(mu),x),fsub(fint(1),x)), x1=g(x0), x2=g(x1), right=fshow(x2), wrong=frs16(right,[x1,fmul(x1,fsub(fint(1),x1)),fmul(fint(mu),x1),g(x2),fsub(fint(1),x2),x0,fmul(x1,x1)]); if(wrong.length<3) return null;
    return {index:'q:24k.rest[r;'+[mu,x0.p,x0.q].join(';')+']', lines:[['g(x) = '+mu+'x(1 − x)','the yearly rule'],['x₀ = '+fshow(x0),'the start of the run xₙ₊₁ = g(xₙ)']], ask:'What is x₂?', right, opts:shuffle([right,...wrong]), lead:'', why:'x₁ = '+mu+' · '+fshow(x0)+' · '+fshow(fsub(fint(1),x0))+' = '+fshow(x1)+', and x₂ = '+mu+' · '+fshow(x1)+' · '+fshow(fsub(fint(1),x1))+' = '+right+'.'}; }});

/* ---------- 24l Solutions as Power Series ---------- */
const WL24=[
  ['A power sum obeys the recipe of a rule. Does it solve the rule everywhere?','no: only inside its reach',['yes: the recipe is the rule','yes, wherever the rule is written','no: only at its centre'],'Sum-solves technique: if the coefficients obey the recipe and the sum has reach R > 0, the sum solves the rule on |x − w| < R.'],
  ['y″ = Σ k(k − 1)uₖxᵏ⁻². May you balance uₖ against uₖ at once?','no: write every sum by the same power xᵏ before balancing; the indices shift',['yes: both carry the index k','yes, after dividing by x²','no: sums cannot be balanced at all'],'The piece of y″ with xᵏ is (k + 2)(k + 1)uₖ₊₂xᵏ.'],
  ['Has every rule a power-sum solution about every point?','no: at a bad point solutions can behave like x^(1/2) or x^(−1/2), or need ln x',['yes, by the sum-solves technique','yes, with reach 0','no: only y′ = y has one'],'Where P or Q passes every bound, the point is a bad point of the rule.'],
  ['The starting-power equation has a double root. How many sums of the form xˢ Σ uₖxᵏ does it give?','only one; the second solution needs ln x',['two, as always','none','endlessly many'],'Two different roots can give two sums. A double root gives one starting power.'],
  ['For x²y″ + x·p(x)y′ + q(x)y = 0, which s can start a solution xˢ Σ uₖxᵏ with u₀ ≠ 0?','those with s(s − 1) + p(0)s + q(0) = 0',['every whole number s ≥ 0','those with s² + p(0)s + q(0) = 0','only s = 0'],'Starting-power technique: the lowest power, xˢ, must balance by itself.']];
QP.push({id:'24l.sums',step:'24l',label:'sums that solve rules',open:()=>measured('24l'),make(){ return writtenQ('24l.sums',WL24); }},
  {id:'24l.recipe',step:'24l',mode:'work',label:'following the recipe',open:()=>measured('24l'),make(){
    const t=rnd(4), c=1+rnd(4), j=2+rnd(3);
    if(t===0){ const a=pick([2,3,-1,-2]), R=fr(a**j*c,fact16(j)), right=fshow(R), wrong=frs16(right,[fint(a**j*c),fr(a*c,fact16(j)),fr(a**j*c,j),fneg(R),fr(a**(j-1)*c,fact16(j-1)),fr(c,fact16(j))]); if(wrong.length<3) return null;
      return {index:'q:24l.recipe[o;'+[a,c,j].join(';')+']', lines:[['y′ = '+cf22(a,'y'),'the rule'],['y = Σ uₖxᵏ, with (k + 1)uₖ₊₁ = '+cf22(a,'uₖ'),'balance the piece with xᵏ'],['u₀ = '+c,'the start y(0) = '+c]], ask:'What is u'+sub15(j)+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'Each step multiplies by '+sg(a)+' and divides by the next index: u'+sub15(j)+' = '+par10(a)+sup15(j)+' · '+c+'/'+j+'! = '+right+'. The sum is '+A24(c)+E24(a,'x')+', as the own-rate technique found.'}; }
    if(t===1){ const mm=pick([-1,1,-4,4]), d=1+rnd(4), u=[fint(c),fint(d)]; for(let k=0;k<3;k++) u.push(fmul(u[k],fr(mm,(k+2)*(k+1))));
      const right=fshow(u[j]), wrong=frs16(right,[fneg(u[j]),u[j-1],fmul(u[j],fint(j)),fmul(u[j-2],fr(mm,j)),u[j-2],fmul(u[j-2],fr(1,(j)*(j-1))),fmul(u[j],fint(2))]); if(wrong.length<3) return null;
      return {index:'q:24l.recipe[s;'+[mm,c,d,j].join(';')+']', lines:[['y″ = '+cf22(mm,'y'),'the rule'],['y = Σ uₖxᵏ, with (k + 2)(k + 1)uₖ₊₂ = '+cf22(mm,'uₖ'),'balance the piece with xᵏ'],['u₀ = '+c+' and u₁ = '+d,'the start: a height and a slope']], ask:'What is u'+sub15(j)+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'u'+sub15(j)+' = '+par10(mm)+' · u'+sub15(j-2)+'/('+j+' · '+(j-1)+') = '+par10(mm)+' · '+fpar22(u[j-2])+'/'+j*(j-1)+' = '+right+'. The recipe ties each coefficient to the one two places back, so u₀ and u₁ fix the rest.'}; }
    if(t===2){ const n=1+rnd(6), k=n%2, uk2=fr((k-n)*(k+n+1),(k+2)*(k+1)), ask2=Math.random()<0.5||n<2;
      if(ask2){ const right=fshow(uk2), wrong=frs16(right,[fneg(uk2),fr((k-n)*(k+n+1),1),fr((k+n)*(k+n+1),(k+2)*(k+1)),fr(-n,(k+2)*(k+1)),fr(n*(n+1),(k+2)*(k+1)),fmul(uk2,fint(2)),fint(0)]); if(wrong.length<3) return null;
        return {index:'q:24l.recipe[l;'+n+']', lines:[['(1 − x²)y″ − 2xy′ + n(n + 1)y = 0, with n = '+n,'the rule'],['uₖ₊₂ = (k − n)(k + n + 1)uₖ/((k + 2)(k + 1))','its recipe for power sums about 0'],['u'+sub15(k)+' = 1','the start of the sum of '+(k?'odd':'even')+' powers']], ask:'What is u'+sub15(k+2)+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'With k = '+k+': ('+k+' − '+n+')('+k+' + '+n+' + 1)/(('+k+' + 2)('+k+' + 1)) = '+sg((k-n)*(k+n+1))+'/'+(k+2)*(k+1)+(right===sg((k-n)*(k+n+1))+'/'+(k+2)*(k+1)?'':' = '+right)+'.'+(n===k?' The factor k − n is 0, so the sum stops here: it is a polynomial.':'')}; }
      const f=v=>'u'+sub15(v), right=f(n+2), wrong=uniq(right,[f(n),f(n+1),f(n+4),f(2*n),f(n-2)].filter(s=>s!=='u₀'&&s!=='u₁'),3); if(wrong.length<3) return null;
      return {index:'q:24l.recipe[z;'+n+']', lines:[['(1 − x²)y″ − 2xy′ + n(n + 1)y = 0, with n = '+n,'the rule'],['uₖ₊₂ = (k − n)(k + n + 1)uₖ/((k + 2)(k + 1))','its recipe for power sums about 0'],['u'+sub15(k)+' = 1','the start of the sum of '+(k?'odd':'even')+' powers']], ask:'Which is the first coefficient of this sum that the recipe makes 0?', right, opts:shuffle([right,...wrong]), lead:'', why:'Stopping-sum technique: the factor k − n is 0 at k = '+n+', so u'+sub15(n+2)+' = 0, and every later one with it. The sum stops at x'+sup15(n)+' and is a polynomial.'}; }
    const [s1,s2]=pick([[fr(-1,2),fr(1,2)],[fint(0),fint(0)],[fint(-1),fint(1)],[fint(-2),fint(2)],[fint(0),fint(1)],[fint(0),fr(1,2)],[fint(1),fint(2)],[fint(1),fint(1)],[fr(-1,3),fr(1,3)],[fint(-1),fint(2)]]), p0=fsub(fint(1),fadd(s1,s2)), q0=fmul(s1,s2), f=(x,y)=>fsame(x,y)?'s = '+fshow(x)+' only, a double root':'s = '+fshow(x)+' and s = '+fshow(y);
    const B=x=>x.p===0?'s':'(s'+(x.p<0?' + ':' − ')+fshow(fr(Math.abs(x.p),x.q))+')'; const right=f(s1,s2), wrong=uniq(right,[f(fneg(s2),fneg(s1)),f(s1,fadd(s2,fint(1))),f(fsub(s1,fint(1)),s2),f(s1,s1),f(s2,s2),f(fint(0),fint(1)),f(p0,q0)],3); if(wrong.length<3) return null;
    return {index:'q:24l.recipe[p;'+[fshow(s1),fshow(s2)].join(';')+']', lines:[['x²y″ + x·p(x)y′ + q(x)y = 0, with p(0) = '+fshow(p0)+' and q(0) = '+fshow(q0),'a rule with a bad point at 0'],['s(s − 1) + p(0)s + q(0) = 0','the starting-power technique']], ask:'Which starting powers s does it allow?', right, opts:shuffle([right,...wrong]), lead:'', why:'With these numbers the equation s(s − 1) + p(0)s + q(0) = 0 factors as '+(fsame(s1,s2)?B(s1)+'²':B(s1)+B(s2))+' = 0.'+(fsame(s1,s2)?' A double root gives only one sum; the second solution needs ln x.':'')}; }});

/* ===== Laundry 5, rung 25 (floor 5 pools, stage X): 25a to 25f ===== */
Object.assign(STEPS,{'25a':['r25a','The Pairs Looked Back On'],'25b':['r25b','A Field With No Order'],'25c':['r25c','The Size of a Product'],'25d':['r25d','Every Polynomial Has a Root'],'25e':['r25e','Roots in Pairs'],'25f':['r25f','Maps of the Plane']});
const cx25=(a,b)=>b===0?sg(a):(a===0?'':sg(a)+(b<0?' − ':' + '))+(a===0&&b<0?'−':'')+(Math.abs(b)===1?'':Math.abs(b))+'i';
const pc25=(a,b)=>(b===0&&a>=0)||(a===0&&b>0)?cx25(a,b):'('+cx25(a,b)+')';
const TRIP25=[[3,4,5],[4,3,5],[5,12,13],[12,5,13],[8,15,17],[6,8,10],[8,6,10]], s25=()=>pick([1,-1]), nz25=n=>(1+rnd(n))*s25();
const z25=()=>{ const [a,b,r]=pick(TRIP25); return [a*s25(),b*s25(),r]; };
const tm25=ts=>{ let s=''; ts.filter(t=>t[0]!==0).forEach(([c,x],i)=>{ const a=Math.abs(c); s+=(i===0?(c<0?'−':''):(c<0?' − ':' + '))+(x===''?a:(a===1?'':a)+x); }); return s; };
const circ25=(A,B,C,D,x,y)=>tm25([[A,Math.abs(A)===1?x+'² + '+y+'²':'('+x+'² + '+y+'²)'],[B,x],[C,y],[D,'']])+' = 0';

/* ---------- 25a The Pairs Looked Back On ---------- */
const WA25=[
  ['Is |a + bi| = a + b?','no: the size is √(a² + b²), the distance from 0',['yes','yes, when a and b are both positive','no: the size is a² + b²'],'The size of z is its distance from 0, by the distance of 18a.'],
  ['Is the flip of zw equal to z̄ · w?','no: the flip goes on both factors, z̄ · w̄',['yes','no: flips do not go through products at all','no: the flip of a product is the product, unflipped'],'Flip technique: the flip of a product is the product of the flips.'],
  ['Is z z̄ = a² − b², for z = a + bi?','no: −b²i² = +b², so z z̄ = a² + b², the size squared',['yes','no: z z̄ = 2a','no: z z̄ = a² + b²i'],'Flip technique: (a + bi)(a − bi) = a² + b² = |z|². The bi terms cancel.'],
  ['Is i a new number assumed to exist?','no: i is the pair (0, 1), the quarter turn: built, not assumed',['yes: it is assumed, with i² = −1','yes: it is the one assumption of the rung','no: i is a real number, √−1'],'The pair product gives (0, 1) · (0, 1) = (−1, 0).'],
  ['When is z on the floor?','exactly when z̄ = z',['exactly when z̄ = −z','exactly when z z̄ = 0','exactly when |z| = 1'],'Flip technique: z̄ = z says −b = b, so b = 0.'],
  ['What is z + z̄, for z = a + bi?','2a, twice the floor part, a real number',['2bi, twice the upright part','a² + b²','0'],'The upright parts cancel: (a + bi) + (a − bi) = 2a.']];
QP.push({id:'25a.pairs',step:'25a',label:'floor, upright, size, flip',open:()=>measured('25a'),make(){ return writtenQ('25a.pairs',WA25); }},
  {id:'25a.flip',step:'25a',mode:'work',label:'flips and sizes',open:()=>measured('25a'),make(){
    const t=rnd(5), a=nz25(5), b=nz25(5), c=nz25(4), d=nz25(4), Z=cx25(a,b);
    if(t===0){ const right=cx25(a,-b), wrong=uniq(right,[cx25(-a,b),cx25(-a,-b),cx25(b,a),Z],3);
      return {index:'q:25a.flip[f;'+[a,b].join(';')+']', lines:[['z = '+Z,'a number of ℂ']], ask:'Which is its flip z̄?', right, opts:shuffle([right,...wrong]), lead:'', why:'The flip keeps the floor part and turns the upright part over. In the picture it is the mirror in the floor.'}; }
    if(t===1){ const [p,q,r]=z25(), right=String(r), wrong=uniq(right,[String(Math.abs(p)+Math.abs(q)),String(r*r),String(Math.max(Math.abs(p),Math.abs(q))),String(r+1)],3);
      return {index:'q:25a.flip[s;'+[p,q].join(';')+']', lines:[['z = '+cx25(p,q),'a number of ℂ']], ask:'Which is its size |z|?', right, opts:shuffle([right,...wrong]), lead:'', why:'|z| = √('+par10(p)+'² + '+par10(q)+'²) = √'+r*r+' = '+r+', the distance from 0.'}; }
    if(t===2){ const N=a*a+b*b, right=String(N), wrong=uniq(right,[sg(a*a-b*b),sg(2*a),cx25(a*a-b*b,2*a*b),cx25(N,1),String(N+1)],3);
      return {index:'q:25a.flip[n;'+[a,b].join(';')+']', lines:[['z = '+Z,'a number of ℂ']], ask:'What is z z̄?', right, opts:shuffle([right,...wrong]), lead:'', why:'Flip technique: z z̄ = '+par10(a)+'² + '+par10(b)+'² = '+N+', the size squared. The bi terms cancel, and −b²i² = +b².'}; }
    if(t===3){ const right=cx25(a*c-b*d,a*d+b*c), wrong=uniq(right,[cx25(a*c+b*d,a*d+b*c),cx25(a*c,b*d),cx25(a*c-b*d,a*d-b*c),cx25(a+c,b+d)],3); if(wrong.length<3) return null;
      return {index:'q:25a.flip[p;'+[a,b,c,d].join(';')+']', lines:[['z = '+Z+' and w = '+cx25(c,d),'two numbers of ℂ']], ask:'What is zw?', right, opts:shuffle([right,...wrong]), lead:'', why:'The pair product: (ac − bd) + (ad + bc)i, with a = '+sg(a)+', b = '+sg(b)+', c = '+sg(c)+', d = '+sg(d)+'. The floor part is '+sg(a*c)+' − '+par10(b*d)+' = '+sg(a*c-b*d)+', and the upright part is '+sg(a*d)+' + '+par10(b*c)+' = '+sg(a*d+b*c)+'.'}; }
    const right=sg(2*a), wrong=uniq(right,[cx25(0,2*b),String(a*a+b*b),'0',cx25(2*a,2*b),sg(a)],3);
    return {index:'q:25a.flip[t;'+[a,b].join(';')+']', lines:[['z = '+Z,'a number of ℂ']], ask:'What is z + z̄?', right, opts:shuffle([right,...wrong]), lead:'', why:'('+Z+') + ('+cx25(a,-b)+') = '+sg(2*a)+': the upright parts cancel, and twice the floor part is left.'}; }},
  {id:'25a.line',step:'25a',mode:'proof',label:'what the flip licenses',open:()=>measured('25a'),make(){
    const a=nz25(5), b=nz25(5), c=nz25(4), d=nz25(4), [p,q,r]=z25(), Z=cx25(a,b), W=cx25(c,d), V=[
      ['p1',[['z = '+Z,'given'],['z z̄ = '+(a*a+b*b),'the flip technique: z z̄ = |z|²']],2,0,'z z̄ = '+par10(a)+'² + '+par10(b)+'² = '+(a*a+b*b)+'.'],
      ['p2',[['z = '+cx25(p,q),'given'],['|z| = '+(Math.abs(p)+Math.abs(q)),'the size']],2,1,'The size is √('+par10(p)+'² + '+par10(q)+'²) = '+r+', the distance from 0, not the sum of the parts.'],
      ['p3',[['z̄ = z','given'],['z is on the floor','the flip technique']],2,0,'z̄ = z says −b = b, so the upright part is 0.'],
      ['p4',[['z z̄ = '+(a*a+b*b),'given'],['z is on the floor','z z̄ is a real number']],2,1,'z z̄ = |z|² is real for every z. '+Z+' has z z̄ = '+(a*a+b*b)+' and is off the floor.'],
      ['p5',[['z = '+Z+' and w = '+W,'given'],['the flip of zw is ('+cx25(a,-b)+')('+cx25(c,-d)+')','the flip technique']],2,0,'The flip of a product is the product of the flips.'],
      ['p6',[['z = '+Z+' and w = '+W,'given'],['the flip of zw is ('+cx25(a,-b)+')('+W+')','the flip technique']],2,1,'The flip goes on both factors, and w = '+W+' is not its own flip.'],
      ['p7',[['z = '+Z+' and w = '+W,'given'],['the flip of z + w is '+cx25(a+c,-(b+d)),'the flip technique']],2,0,'The flip of a sum is the sum of the flips: ('+cx25(a,-b)+') + ('+cx25(c,-d)+').']];
    const [tag,lines,n,rr,why]=pick(V);
    return {index:'q:25a.line['+[tag,a,b,c,d,p,q].join(';')+']', stack:true, lines, ask:'Is line '+n+' licensed?', right:YN22[rr], opts:YN22, lead:'', why}; }});

/* ---------- 25b A Field With No Order ---------- */
const WB25=[
  ['Is i > 0?','the claim has no meaning: there is no order on ℂ',['yes: i is above the floor','no: i < 0','no: i = 0'],'No-order technique: no choice of positives in ℂ obeys the three order techniques.'],
  ['Is z² ≥ 0 for every z in ℂ?','no: i² = −1, and ≥ means nothing off the floor',['yes: a square is never negative','yes, by the flip technique','no: only when z has size 1'],'Square-never-negative is a fact about the line.'],
  ['May you write |z − 1| < 0.01 for z in ℂ?','yes: both sides are reals, and reals compare',['no: ℂ has no order, so no inequality may be written','only when z is on the floor','only when z is positive'],'Size-compare technique: every inequality in ℂ is an inequality between reals.'],
  ['What did the proof of no order on ℂ use about ℂ?','only that some number squares to −1',['that ℂ is a plane','that i is the quarter turn','that sizes multiply'],'Any field with a number whose square is −1 has no order.'],
  ['In a field with an order, what is x² when x ≠ 0?','positive',['positive or negative, as x is','sometimes 0','not decided by the order'],'Three-way leaves two cases, x positive or −x positive, and positive-product gives a positive square in both.'],
  ['What is an order on a field?','a choice of which members are positive that obeys the three-way, positive-sum and positive-product techniques',['a list of its members from least to greatest','a size |z| for each member','any way to say which of two members comes first'],'Then w < z means z − w is positive.']];
const O25=['it has a meaning, and it is true','it has a meaning, and it is false','it has no meaning: there is no order on ℂ'];
QP.push({id:'25b.order',step:'25b',label:'what an order needs',open:()=>measured('25b'),make(){ return writtenQ('25b.order',WB25); }},
  {id:'25b.compare',step:'25b',mode:'work',label:'which claims compare',open:()=>measured('25b'),make(){
    const t=rnd(6), [a,b,r]=z25(), [c,d,s]=z25(), Z=cx25(a,b), W=cx25(c,d), m=nz25(6); let claim, i, why;
    if(t===0){ if(r===s) return null; const lt=Math.random()<0.5; claim='|'+Z+'| '+(lt?'<':'>')+' |'+W+'|'; i=(lt?r<s:r>s)?0:1; why='Size-compare technique: the sizes are '+r+' and '+s+', two reals, and reals compare.'; }
    else if(t===1){ claim=Z+' < '+W; i=2; why='Neither number is on the floor. No-order technique: no choice of positives in ℂ obeys the three order techniques, so < says nothing here.'; }
    else if(t===2){ if(a===c) return null; claim='the floor part of '+Z+' is less than the floor part of '+W; i=a<c?0:1; why='Floor parts are reals: '+sg(a)+' and '+sg(c)+'. Each compares by the order of the line.'; }
    else if(t===3){ const lt=Math.random()<0.6; claim='('+cx25(0,m)+')² '+(lt?'<':'>')+' 0'; i=lt?0:1; why='('+cx25(0,m)+')² = −'+m*m+', a number on the floor, and −'+m*m+' < 0 there. On the floor the order is the old one.'; }
    else if(t===4){ claim=Z+' > 0'; i=2; why=Z+' is off the floor. Whatever were called positive in ℂ, −1 would come out positive too.'; }
    else { const [e,f,g]=z25(), k=g+pick([-2,-1,1,2]); claim='|z − w| < '+k+', for z = '+cx25(c+e,d+f)+' and w = '+W; i=g<k?0:1; why='z − w = '+cx25(e,f)+', of size '+g+'. Sizes are reals, so the claim compares '+g+' with '+k+'.';
      return {index:'q:25b.compare[d;'+[c,d,e,f,k].join(';')+']', lines:[[claim,'a claim about numbers of ℂ']], ask:'What of this claim?', right:O25[i], opts:O25, lead:'', why}; }
    return {index:'q:25b.compare['+[t,a,b,c,d,m].join(';')+']', lines:[[claim,'a claim about numbers of ℂ']], ask:'What of this claim?', right:O25[i], opts:O25, lead:'', why}; }},
  {id:'25b.line',step:'25b',mode:'proof',label:'order, or only size',open:()=>measured('25b'),make(){
    const [a,b,r]=z25(), [c,d,s]=z25(), Z=cx25(a,b), F=pick(['a field','a number system','ℚ','ℝ']), V=[
      ['o1',[['an order on '+F+', and x ≠ 0 in it','given'],['x² is positive','positive-product, in both cases the three-way technique leaves']],2,0,'If x is positive, x · x is positive. If x = −p with p positive, x · x = p · p, positive again.'],
      ['o2',[['suppose an order on ℂ','for contradiction'],['i is positive','i is above the floor']],2,1,'Above the floor is a picture, not an order. The proof needs neither case: i ≠ 0, so its square is positive either way.'],
      ['o3',[['suppose an order on ℂ','for contradiction'],['−1 = i² is positive','a square other than 0 is positive']],2,0,'i ≠ 0, and in a field with an order every square other than 0 is positive.'],
      ['o4',[['|z| = '+r+' and |w| = '+(r+s),'given'],['|z| < |w|','sizes are reals, and reals compare']],2,0,'Size-compare technique: '+r+' < '+(r+s)+' is a claim about two reals.'],
      ['o5',[['|z| = '+r+' and |w| = '+(r+s),'given'],['z < w','the size-compare technique']],2,1,'The sizes compare. The numbers do not, unless both are on the floor.'],
      ['o6',[['z = '+Z,'given'],['z² ≥ 0','square-never-negative (8g)']],2,1,'8g is about the line. z² = '+cx25(a*a-b*b,2*a*b)+' is off the floor, where ≥ means nothing.'],
      ['o7',[['z = '+Z,'given'],['|z| ≥ 0, and |z| = 0 only for z = 0','the size is a square root of a sum of squares']],2,0,'a² + b² = 0 only when a = b = 0.']];
    const [tag,lines,n,rr,why]=pick(V);
    return {index:'q:25b.line['+[tag,a,b,s,F].join(';')+']', stack:true, lines, ask:'Is line '+n+' licensed?', right:YN22[rr], opts:YN22, lead:'', why}; }});

/* ---------- 25c The Size of a Product ---------- */
const WC25=[
  ['Is |z + w| = |z| + |w|?','only when z and w point the same way; |1 + (−1)| = 0',['yes, always','yes, when z and w are both off the floor','never'],'Plane-triangle technique: |z + w| ≤ |z| + |w|. One side of a triangle is never longer than the other two together.'],
  ['Is |z²| = z²?','no: the left side is a real number, and z² need not be; |i²| = 1',['yes, always','yes: a square is its own size','no: |z²| = −z²'],'Product-size technique: |z²| = |z|².'],
  ['Is |z − w| ≤ |z| − |w|?','no: the fence runs the other way, |z| − |w| ≤ |z − w|',['yes, always','yes, when |z| ≥ |w|','no: |z − w| = |z| + |w|'],'With z = 0 the right side is negative, and a size is never negative.'],
  ['|a + bi| ≤ |a| + |b|. Is |a + bi| = |a| + |b|, then?','no: a fence is not a sameness; |3 + 4i| = 5 < 7',['yes','yes, when a and b are positive','no: |a + bi| is the larger of |a| and |b|'],'The size is √(a² + b²).'],
  ['Does the proof of |zw| = |z||w| need the out-and-round form?','no: the flip technique does it, with no angle',['yes: lengths multiply and turns add','yes, when z is off the floor','no: it needs the plane triangle'],'|zw|² = (zw) times the flip of zw = (z z̄)(w w̄) = |z|²|w|².'],
  ['When does a list zₙ in ℂ settle at L?','when |zₙ − L| heads to 0, which is exactly when its floor parts and its upright parts both settle',['when its floor parts settle','when |zₙ| settles at |L|','when zₙ < L from some n on'],'Each part is at most the size, and the size is at most the sum of the parts’ sizes.']];
const U25=[['3 + 4i',5],['−2',2],['i',1],['−3i',3],['1',1],['4 − 3i',5],['2i',2],['−1',1],['3',3]];
QP.push({id:'25c.size',step:'25c',label:'sizes and the triangle',open:()=>measured('25c'),make(){ return writtenQ('25c.size',WC25); }},
  {id:'25c.work',step:'25c',mode:'work',label:'sizes by hand',open:()=>measured('25c'),make(){
    const t=rnd(4), [a,b,p]=z25(), [c,d,q]=z25(), Z=cx25(a,b), W=cx25(c,d);
    if(t===0){ const k=rnd(4), [what,right,why]=[['|zw|',String(p*q),'Product-size technique: |zw| = |z||w| = '+p+' · '+q+'.'],['|z/w|',fshow(fr(p,q)),'Product-size technique: |1/w| = 1/|w|, so |z/w| = |z|/|w| = '+p+'/'+q+(fshow(fr(p,q))===p+'/'+q?'':' = '+fshow(fr(p,q)))+'.'],['|z²|',String(p*p),'Sizes multiply: |z²| = |z|² = '+p+'².'],['|1/z|','1/'+p,'Product-size technique: |1/z| = 1/|z|.']][k];
      const wrong=uniq(right,shuffle([String(p+q),String(p*q),fshow(fr(p,q)),'1/'+p,String(p*p),String(2*p),String(Math.abs(p-q)),String(p)]),3);
      return {index:'q:25c.work[m;'+[k,a,b,c,d].join(';')+']', lines:[['z = '+Z+' and w = '+W,'two numbers of ℂ'],['|z| = '+p+' and |w| = '+q,'their sizes']], ask:'What is '+what+'?', right, opts:shuffle([right,...wrong]), lead:'', why}; }
    if(t===1){ const P=2+rnd(8), Q=P+1+rnd(6), op=pick(['+','−']), right='it is at least '+(Q-P)+' and at most '+(P+Q), wrong=['it is exactly '+(P+Q),'it is at most '+(Q-P),'it is at least '+(P+Q)];
      return {index:'q:25c.work[t;'+[P,Q,op].join(';')+']', lines:[['|z| = '+P+' and |w| = '+Q,'two sizes']], ask:'What does the plane-triangle technique say of |z '+op+' w|?', right, opts:shuffle([right,...wrong]), lead:'', why:'|z '+op+' w| ≤ |z| + |w| = '+(P+Q)+', and ||z| − |w|| = '+(Q-P)+' ≤ |z '+op+' w|.'+(op==='+'?' The second half holds for a sum too, since |−w| = |w|.':'')}; }
    if(t===2){ const [u0,u1,u2]=take(U25,3), rho=2+rnd(2), B=u0[1]+u1[1]*rho+u2[1]*rho*rho, right=String(B), wrong=uniq(right,[String(u0[1]+u1[1]+u2[1]),String((u0[1]+u1[1]+u2[1])*rho),String(u2[1]*rho*rho),String(u0[1]+u1[1]*rho+u2[1]*rho),String(B+rho)],3); if(wrong.length<3) return null;
      return {index:'q:25c.work[v;'+[u0[0],u1[0],u2[0],rho].join(';')+']', lines:[['p(z) = u₀ + u₁z + u₂z²','a polynomial'],['u₀ = '+u0[0]+', u₁ = '+u1[0]+', u₂ = '+u2[0],'the numbers in front']], ask:'Which ceiling does the value-fence technique give for |p(z)| on |z| ≤ '+rho+'?', right, opts:shuffle([right,...wrong]), lead:'', why:'|p(z)| ≤ |u₀| + |u₁||z| + |u₂||z|² ≤ '+u0[1]+' + '+u1[1]+' · '+rho+' + '+u2[1]+' · '+rho*rho+' = '+B+'.'}; }
    const [e,f,g]=z25(), wx=e-a, wy=f-b; if(wx===0&&wy===0) return null;
    const right=String(g), wrong=uniq(right,[String(g+p),String(Math.abs(e)+Math.abs(f)),String(g+1),String(p),String(g*g)],3);
    return {index:'q:25c.work[a;'+[a,b,e,f].join(';')+']', lines:[['z = '+Z+' and w = '+cx25(wx,wy),'two numbers of ℂ']], ask:'What is |z + w|?', right, opts:shuffle([right,...wrong]), lead:'', why:'z + w = '+cx25(e,f)+', and its size is √('+par10(e)+'² + '+par10(f)+'²) = '+g+'. The plane triangle gives only a ceiling, |z| + |w|.'}; }},
  {id:'25c.line',step:'25c',mode:'proof',label:'a fence, or a sameness',open:()=>measured('25c'),make(){
    const P=2+rnd(8), Q=P+1+rnd(6), n=2+rnd(3), V=[
      ['s1',[['|z| = '+Q+' and |w| = '+P,'given'],['|zw| = '+P*Q,'the product-size technique']],2,0,'|zw| = |z||w|, a sameness.'],
      ['s2',[['|z| = '+Q+' and |w| = '+P,'given'],['|z + w| = '+(P+Q),'the plane-triangle technique']],2,1,'The triangle gives a fence, |z + w| ≤ '+(P+Q)+'. The two are the same only when z and w point the same way.'],
      ['s3',[['|z| = '+Q+' and |w| = '+P,'given'],['|z + w| ≤ '+(P+Q),'the plane-triangle technique']],2,0,'|z + w| ≤ |z| + |w|.'],
      ['s4',[['|z| = '+Q+' and |w| = '+P,'given'],['|z − w| ≥ '+(Q-P),'the plane-triangle technique, its second half']],2,0,'||z| − |w|| ≤ |z − w|.'],
      ['s5',[['|z| = '+Q+' and |w| = '+P,'given'],['|z − w| ≤ '+(Q-P),'the plane-triangle technique']],2,1,'The fence runs the other way: '+(Q-P)+' ≤ |z − w|. With w = −z·'+P+'/'+Q+' the size of z − w is '+(P+Q)+'.'],
      ['s6',[['|z| = '+P,'given'],['|z'+sup15(n)+'| = '+P**n,'sizes multiply, '+(n-1)+(n===2?' time':' times')]],2,0,'|zⁿ| = |z|ⁿ.'],
      ['s7',[['|z| = '+P,'given'],['z² = '+P*P,'|z²| = |z|²']],2,1,'|z²| = '+P*P+' is licensed. z² itself need not be real: with z = '+cx25(0,P)+' it is −'+P*P+'.']];
    const [tag,lines,k,rr,why]=pick(V);
    return {index:'q:25c.line['+[tag,P,Q,n].join(';')+']', stack:true, lines, ask:'Is line '+k+' licensed?', right:YN22[rr], opts:YN22, lead:'', why}; }},
  {id:'25c.walk',step:'25c',mode:'word',label:'two legs',open:()=>measured('25c'),make(){
    const [E,N,s]=pick([[6,8,10],[5,12,13],[8,15,17],[9,12,15],[12,16,20],[12,5,13],[8,6,10]]), a=1+rnd(E-1), b=1+rnd(N-1), c=E-a, d=N-b, what=pick(['A drone','A kite buggy','A survey boat','A walker']);
    const right=s+' km', wrong=[(E+N)+' km',Math.max(E,N)+' km',2*s+' km'];
    return {index:'q:25c.walk['+[what,a,b,E,N].join(';')+']', a3:['25c.walk',DASH,DASH], story:what+' goes '+a+' km east and '+b+' km north, the step '+cx25(a,b)+', and then '+c+' km east and '+d+' km north, the step '+cx25(c,d)+'.', lines:[], ask:'How far is it from its start?', right, opts:shuffle([right,...wrong]), lead:'', why:'The two steps add as pairs to '+cx25(E,N)+', of size √('+E+'² + '+N+'²) = '+s+'. The plane triangle says only that this is at most the lengths of the two legs together.'}; }});

/* ---------- 25d Every Polynomial Has a Root ---------- */
const WD25=[
  ['|p| heads past every ceiling far out. Does that give it a least value?','not by itself: it keeps the least inside a disc; a settling thread and the value fence are what reach it',['yes: nothing more is needed','no: |p| has no least value','yes, at z = 0'],'Lowest-size technique: some z₀ in ℂ has |p(z₀)| ≤ |p(z)| for every z.'],
  ['Is a least value of |p| on the line a root?','no: x² + 1 is least at 0 on the line, where it is 1; the push-down needs a direction off the line',['yes, by the push-down technique','yes, when p has real numbers in front','no: |p| has no least value on the line'],'Push-down technique: if p(z₀) ≠ 0, some z has |p(z)| < |p(z₀)|. That z may lie off the line.'],
  ['Has zⁿ = c one root, c^(1/n)?','no: it has n of them, one turn of 2π/n apart, when c ≠ 0',['yes','no: it has two, s and −s','yes, when c is positive'],'Equal parts of a turn (21·cb20.3).'],
  ['Has every polynomial with real numbers in front a real root?','no: x² + 1; the root technique promises roots in ℂ only',['yes, by the root technique','yes, when its degree is even','no: none of them has'],'Root technique: every polynomial of degree n ≥ 1 with complex numbers in front has a root in ℂ.'],
  ['p has degree n ≥ 1, with complex numbers in front. How many roots has it in ℂ, counted with repeats?','exactly n',['at most n, and maybe none','n when the numbers in front are real, fewer otherwise','endlessly many'],'Root technique: p(z) = uₙ(z − r₁)(z − r₂)⋯(z − rₙ) for some r₁, …, rₙ in ℂ.'],
  ['Does the proof of the lowest-size technique say where z₀ is?','no: only that the least size is reached somewhere',['yes: z₀ = 0','yes: z₀ is on the circle |z| = ρ','yes: z₀ is the root nearest 0'],'That is enough for the push-down: if p(z₀) were not 0, some size would be lower still.']];
const RT25=[['1','(z − 1)'],['i','(z − i)'],['−2','(z + 2)'],['2 + i','(z − 2 − i)'],['−i','(z + i)'],['3','(z − 3)'],['−1 + i','(z + 1 − i)']];
QP.push({id:'25d.root',step:'25d',label:'why a root must come',open:()=>measured('25d'),make(){ return writtenQ('25d.root',WD25); }},
  {id:'25d.work',step:'25d',mode:'work',label:'roots and radii',open:()=>measured('25d'),make(){
    const t=rnd(4), k=1+rnd(3), a=nz25(3), b=1+rnd(4);
    if(t===0){ const n=2+rnd(2), un=pick([1,2,4]), us=[]; for(let j=0;j<n;j++) us.push(nz25(6)); const S=us.reduce((x,y)=>x+Math.abs(y),0), R=fr(2*S,un), P=pol23([[un,n],...us.map((u,j)=>[u,n-1-j])],'z');
      const right=fshow(R), wrong=frs16(right,[fr(S,un),fint(2*S),fint(1),fr(2*(S+un),un),fint(S)]); if(wrong.length<3) return null;
      return {index:'q:25d.work[r;'+[un,...us].join(';')+']', lines:[['p(z) = '+P,'a polynomial']], ask:'Which radius R does the far-out technique give?', right, opts:shuffle([right,...wrong]), lead:'', why:'R = max(1, 2(|u₀| + ⋯ + |uₙ₋₁|)/|uₙ|) = max(1, 2 · '+S+'/'+un+') = '+right+'. From there out, |p(z)| ≥ '+(un===4?'2':'')+'|z|'+sup15(n)+(un===1?'/2':'')+'.'}; }
    if(t===1){ if(Math.random()<0.5){ const right=[sg(k),cx25(0,k),sg(-k),cx25(0,-k)].join(', '), wrong=[k+' only',k+' and −'+k,cx25(0,k)+' and '+cx25(0,-k)];
        return {index:'q:25d.work[q;4;'+k+']', lines:[['z⁴ = '+k**4,'an equation in ℂ']], ask:'Which are all its roots?', right, opts:shuffle([right,...wrong]), lead:'', why:'It has 4 roots, a quarter turn apart, each of size '+k+'. Check: '+(k===1?'i⁴ = i² · i² = 1.':'('+cx25(0,k)+')⁴ = '+k**4+' · i⁴, and i⁴ = 1.')}; }
      const right=cx25(0,k)+' and '+cx25(0,-k), wrong=[k+' and −'+k,cx25(0,k)+' only','none: a square is never negative'];
      return {index:'q:25d.work[q;2;'+k+']', lines:[['z² = −'+k*k,'an equation in ℂ']], ask:'Which are all its roots?', right, opts:shuffle([right,...wrong]), lead:'', why:'It has 2 roots, a half turn apart. ('+cx25(0,k)+')² = '+k*k+' · i² = −'+k*k+', and the same for its negative.'}; }
    if(t===2){ const N=a*a+b*b, f=(x,y,u,v)=>cx25(x,y)+' and '+cx25(u,v), right=f(a,b,a,-b), wrong=uniq(right,[f(-a,b,-a,-b),f(a,b,-a,-b),'it has no root in ℂ',f(b,a,b,-a)],3);
      return {index:'q:25d.work[c;'+[a,b].join(';')+']', lines:[['p(z) = '+pol23([[1,2],[-2*a,1],[N,0]],'z'),'a polynomial']], ask:'Which are its roots?', right, opts:shuffle([right,...wrong]), lead:'', why:'p(z) = (z'+pm(-a)+')² + '+b*b+', which is 0 when z'+pm(-a)+' = ±'+cx25(0,b)+'. Check: the two roots add to '+sg(2*a)+' and multiply to '+N+'.'}; }
    const [r1,r2,r3]=take(RT25,3), e1=1+rnd(3), e2=1+rnd(3), e3=1+rnd(2), n=e1+e2+e3, pw=(x,e)=>x[1]+(e===1?'':sup15(e)); if(n===3) return null;
    const g=(x,y)=>x+' counted with repeats, '+y+' different', right=g(n,3), wrong=[g(3,3),g(n,n),g(3,n)];
    return {index:'q:25d.work[n;'+[r1[0],e1,r2[0],e2,r3[0],e3].join(';')+']', lines:[['p(z) = '+pw(r1,e1)+pw(r2,e2)+pw(r3,e3),'a polynomial, in line factors']], ask:'How many roots has it in ℂ?', right, opts:shuffle([right,...wrong]), lead:'', why:'Its degree is '+[e1,e2,e3].join(' + ')+' = '+n+', and the root technique gives that many roots counted with repeats. The different ones are '+r1[0]+', '+r2[0]+' and '+r3[0]+'.'}; }},
  {id:'25d.line',step:'25d',mode:'proof',label:'what brings the root',open:()=>measured('25d'),make(){
    const n=2+rnd(5), f=pick(['p','q','f']), k=1+rnd(6), V=[
      ['r1',[[f+' has degree '+n+', with complex numbers in front','given'],[f+' has a root in ℂ','the root technique']],2,0,'Every polynomial of degree n ≥ 1 with complex numbers in front has a root in ℂ.'],
      ['r2',[[f+' has degree '+2*Math.ceil(n/2)+', with real numbers in front','given'],[f+' has a root on the floor','the root technique']],2,1,'The root technique promises roots in ℂ only. x² + '+k+' has none on the floor.'],
      ['r3',[['|'+f+'(z)| heads past every ceiling as z moves away from 0','the far-out technique'],['|'+f+'| has a least value','the far-out technique']],2,1,'Far-out only keeps the least inside a disc. A settling thread and the value fence are what reach it.'],
      ['r4',[['|'+f+'(z₀)| ≤ |'+f+'(z)| for every z in ℂ','the lowest-size technique'],[f+'(z₀) = 0','if not, the push-down technique gives a smaller size']],2,0,'A least size that is not 0 could be pushed lower, so it is 0.'],
      ['r5',[['on the line, x² + '+k+' is least at x = 0','square-never-negative'],['0 is a root of x² + '+k,'a least value of |p| is a root']],2,1,'At 0 it is '+k+'. The push-down needs a direction off the line, and the least on the line need not be the least on the plane.'],
      ['r6',[[f+' has degree '+n+', and r is a root of it','given'],[f+'(z) = (z − r) · g(z), with g of degree '+(n-1),'divide by z − r: the remainder is '+f+'(r) = 0']],2,0,'Dividing out one root at a time is how the root technique reaches all '+n+' line factors.'],
      ['r7',[['z'+sup15(n)+' = '+(k+1),'given'],['z = '+(k+1)+'^(1/'+n+'), and no other z','take the root']],2,1,'It has '+n+' roots, one turn of '+pi21(2,n)+' apart.']];
    const [tag,lines,j,rr,why]=pick(V);
    return {index:'q:25d.line['+[tag,n,f,k].join(';')+']', stack:true, lines, ask:'Is line '+j+' licensed?', right:YN22[rr], opts:YN22, lead:'', why}; }});

/* ---------- 25e Roots in Pairs ---------- */
const WE25=[
  ['Is √−4 · √−9 = √36 = 6?','no: roots go through products only for numbers ≥ 0 on the floor; 2i · 3i = −6',['yes','no: it is 6i','no: √−4 means nothing in ℂ'],'Root-choice technique: what always holds is √z √w = ±√(zw).'],
  ['p(r) = 0. Is p(r̄) = 0, for every polynomial p?','no: the flipped-root technique needs real numbers in front',['yes, always','yes, when r is off the floor','no: never'],'z − i has the root i and not −i.'],
  ['x⁴ + 1 has no real root. Has it no real factors, then?','no real lines, but two real quadratics: (x² + √2x + 1)(x² − √2x + 1)',['yes: no root, no factor','it has four real lines','it has one real quadratic, squared'],'Real-pieces technique: real lines and real quadratics are always enough.'],
  ['Is ∫ dx/(x − i) = ln|x − i| + C?','no: the slope of ln|x − i| = ½ ln(x² + 1) is x/(x² + 1); join the flipped pair first',['yes: the area of 1/(x − c) is ln|x − c|','yes, for x > 0','no: 1/(x − i) has no area'],'Paired-fractions technique: each flipped pair gives one piece (Bx + C)/(x² + bx + c) with real B and C.'],
  ['Into which pieces does every real polynomial split?','real lines x − c and real quadratics x² + bx + c with b² − 4c < 0',['real lines only','real lines, quadratics and sometimes cubics','only lines with complex numbers in front'],'Real-pieces technique. No piece of higher degree is ever needed.'],
  ['How many square roots has w ≠ 0 in ℂ?','exactly two, s and −s',['one, √w','two when w is on the floor, and none otherwise','endlessly many'],'z² = w says (z − s)(z + s) = 0, and a product is 0 only if a factor is.']];
QP.push({id:'25e.pairs',step:'25e',label:'mirrored roots',open:()=>measured('25e'),make(){ return writtenQ('25e.pairs',WE25); }},
  {id:'25e.work',step:'25e',mode:'work',label:'pairs and pieces',open:()=>measured('25e'),make(){
    const t=rnd(5), s=nz25(4), u=1+rnd(4), N=s*s+u*u, R=cx25(s,u), Rb=cx25(s,-u);
    if(t===0){ const q=(b,c)=>pol23([[1,2],[b,1],[c,0]],'x'), right=q(-2*s,N), wrong=uniq(right,[q(2*s,N),q(-2*s,s*s-u*u),q(-s,N),q(-2*s,-N)],3); if(wrong.length<3) return null;
      return {index:'q:25e.work[q;'+[s,u].join(';')+']', lines:[[R+' is a root of a real polynomial p','given'],[Rb+' is a root of p too','the flipped-root technique']], ask:'Which real quadratic do the two roots make?', right, opts:shuffle([right,...wrong]), lead:'', why:'(x − r)(x − r̄) = x² − (r + r̄)x + r r̄, with r + r̄ = '+sg(2*s)+' and r r̄ = '+par10(s)+'² + '+u+'² = '+N+'.'}; }
    if(t===1){ const right=Rb+' is a root, and the third root is on the floor', wrong=[Rb+' is a root, and the third root is off the floor','the other two roots may be any numbers of ℂ',cx25(-s,u)+' is a root, and the third root is on the floor'];
      return {index:'q:25e.work[c;'+[s,u].join(';')+']', lines:[['p is a real polynomial of degree 3','given'],['p('+R+') = 0','given']], ask:'What of its other roots?', right, opts:shuffle([right,...wrong]), lead:'', why:'Flipped-root technique: '+Rb+' is a root. A third root off the floor would bring its own flip, a fourth root, and a polynomial of degree 3 has 3.'}; }
    if(t===2){ const m=2+rnd(4), n=m+1+rnd(3), right='−'+m*n, wrong=[String(m*n),cx25(0,m*n),cx25(0,-m*n)];
      return {index:'q:25e.work[r;'+[m,n].join(';')+']', lines:[[cx25(0,m)+' is a square root of −'+m*m+', and '+cx25(0,n)+' of −'+n*n,'check: square them']], ask:'What is '+cx25(0,m)+' · '+cx25(0,n)+'?', right, opts:shuffle([right,...wrong]), lead:'', why:m+' · '+n+' · i² = −'+m*n+'. √('+m*m+' · '+n*n+') = '+m*n+' is the other square root of the product: √z √w = ±√(zw), and here the sign is −.'}; }
    if(t===3){ const n=3+rnd(5), ev=[], od=[]; for(let j=0;j<=n;j++) (j%2?od:ev).push(j); const L=x=>x.length===1?String(x[0]):x.slice(0,-1).join(', ')+' or '+x[x.length-1];
      const right=L(ev), wrong=uniq(right,['any number from 0 to '+n,L(od),'exactly '+n,L(ev.filter(j=>j>0))],3);
      return {index:'q:25e.work[d;'+n+']', lines:[['p is a real polynomial of degree '+n,'given']], ask:'How many of its '+n+' roots, counted with repeats, can lie off the floor?', right, opts:shuffle([right,...wrong]), lead:'', why:'Flipped-root technique: the roots off the floor come in mirrored pairs, so their count is even.'+(n%2?' The degree is odd, so at least one root is on the floor.':'')}; }
    const c=nz25(4), [qt,nm]=pick([['x² + 1','x² + 1'],['x² + 4','x² + 4'],['x² + 2x + 2','x² + 2x + 2'],['x² − 2x + 5','x² − 2x + 5']]), L='(x'+pm(-c)+')';
    const right='A/'+L+' + (Bx + C)/('+qt+')', wrong=['A/'+L+' + B/('+qt+')','A/'+L+' + B/'+L+'² + C/('+qt+')','(Ax + B)/'+L+' + C/('+qt+')'];
    return {index:'q:25e.work[f;'+[c,qt].join(';')+']', lines:[['1/('+L+'('+qt+'))','a quotient of real polynomials'],[qt+' has no root on the floor','its b² − 4c is under 0']], ask:'Into which pieces does it split, with A, B and C real?', right, opts:shuffle([right,...wrong]), lead:'', why:'Paired-fractions technique: A/(x − c) for the root on the floor, and (Bx + C)/(x² + bx + c) for the flipped pair.'}; }},
  {id:'25e.line',step:'25e',mode:'proof',label:'real in front, or not',open:()=>measured('25e'),make(){
    const s=nz25(4), u=1+rnd(4), m=2+rnd(4), n=m+1+rnd(3), k=1+rnd(8), od=3+2*rnd(3), R=cx25(s,u), Rb=cx25(s,-u), V=[
      ['e1',[['p is a real polynomial, and p('+R+') = 0','given'],['p('+Rb+') = 0','the flipped-root technique']],2,0,'The flip of p(r) is p(r̄) when every number in front is its own flip.'],
      ['e2',[['p(z) = z − ('+R+'), and p('+R+') = 0','given'],['p('+Rb+') = 0','the flipped-root technique']],2,1,'The technique needs real numbers in front. Here p('+Rb+') = '+cx25(0,-2*u)+'.'],
      ['e3',[['√−'+m*m+' · √−'+n*n,'given'],['= √('+m*m+' · '+n*n+') = '+m*n,'roots go through products (8i)']],2,1,'8i is for numbers ≥ 0 on the floor. '+cx25(0,m)+' · '+cx25(0,n)+' = −'+m*n+'.'],
      ['e4',[['s² = w and w ≠ 0','given'],['the square roots of w are s and −s, and no others','z² = w says (z − s)(z + s) = 0']],2,0,'A product is 0 only if a factor is, in the field ℂ.'],
      ['e5',[['x⁴ + '+k+' has no real root','a fourth power is never negative'],['x⁴ + '+k+' has no real factors','it has no real root']],2,1,'No real lines, but the real-pieces technique gives two real quadratics.'],
      ['e6',[['p is a real polynomial of degree '+od,'given'],['p has a root on the floor','its roots off the floor pair up, and '+od+' is odd']],2,0,'An even count of roots off the floor leaves at least one of the '+od+' on the floor.'],
      ['e7',[['p is a real polynomial of degree '+(od+1),'given'],['p has a root on the floor','its roots off the floor pair up']],2,1,'With an even degree every root may be off the floor: x² + '+k+'.']];
    const [tag,lines,j,rr,why]=pick(V);
    return {index:'q:25e.line['+[tag,s,u,m,n,k,od].join(';')+']', stack:true, lines, ask:'Is line '+j+' licensed?', right:YN22[rr], opts:YN22, lead:'', why}; }});

/* ---------- 25f Maps of the Plane ---------- */
const WF25=[
  ['Does z ↦ 1/z send the circle |z − 2| = 1 to the circle with centre ½?','no: centres do not go to centres; the image has centre 2/3 and radius 1/3',['yes: 1/2 is where the centre goes','no: the image is a line','no: the image is not a circle or a line'],'The circle crosses the floor at 1 and 3, which go to 1 and 1/3.'],
  ['Is 1/(z + w) = 1/z + 1/w?','no: 1/(1 + 1) = ½, but 1/1 + 1/1 = 2; 1/z keeps products, not sums',['yes','yes, when z and w are on the floor','no: 1/(z + w) = 1/z · 1/w'],'1/(zw) = (1/z)(1/w) holds. The same with + does not.'],
  ['Does z ↦ az + b keep distances?','only when |a| = 1; it multiplies them by |a|',['yes, always','never','only when b = 0'],'Straight-map technique: |(az + b) − (aw + b)| = |a||z − w|.'],
  ['Is z ↦ z̄ a straight map?','no: it changes which way round triangles go, and every straight map keeps that',['yes, with a = −1','yes, with a = i','no: it does not keep distances'],'A straight map is a turn, a stretch and a slide. None of them is a mirror.'],
  ['What does z ↦ 1/z do to the circle |z| = 1?','it keeps the circle, sending each z on it to z̄',['it fixes every point of it','it sends it to a line','it sends it to its centre'],'Inside-out technique: 1/z = z̄/|z|², and |z|² = 1 on that circle.'],
  ['Which points does z ↦ az + b fix, when a ≠ 1?','exactly one, z* = b/(1 − a)',['none','0 only','every point of a line'],'Straight-map technique: it is the turn and stretch by a about z*.']];
QP.push({id:'25f.maps',step:'25f',label:'straight maps and inside out',open:()=>measured('25f'),make(){ return writtenQ('25f.maps',WF25); }},
  {id:'25f.work',step:'25f',mode:'work',label:'maps by hand',open:()=>measured('25f'),make(){
    const t=rnd(5), p=nz25(4), q=nz25(4);
    if(t===0){ const ai=Math.random()<0.4, a=pick([2,3,-1,-2]), bx=ai?p+q:(1-a)*p, by=ai?q-p:(1-a)*q, at=ai?'i':sg(a);
      const right=cx25(p,q), wrong=uniq(right,[cx25(bx,by),cx25(-p,-q),cx25(q,p),'0',cx25(p,-q)],3);
      return {index:'q:25f.work[x;'+[at,p,q].join(';')+']', lines:[['z ↦ az + b, with a = '+at+' and b = '+cx25(bx,by),'a straight map']], ask:'Which point does it fix?', right, opts:shuffle([right,...wrong]), lead:'', why:'Straight-map technique: z* = b/(1 − a) = '+pc25(bx,by)+'/'+(ai?'(1 − i)':par10(1-a))+' = '+right+'. Check: a · z* + b comes back to '+right+'.'}; }
    if(t===1){ const N=p*p+q*q, f=(x,y,n)=>'('+cx25(x,y)+')/'+n, right=f(p,-q,N), wrong=uniq(right,[f(p,q,N),cx25(p,-q),f(-p,q,N),f(p,-q,Math.abs(p)+Math.abs(q))],3);
      return {index:'q:25f.work[i;'+[p,q].join(';')+']', lines:[['z = '+cx25(p,q),'a number of ℂ other than 0']], ask:'What is 1/z?', right, opts:shuffle([right,...wrong]), lead:'', why:'Inside-out technique: 1/z = z̄/|z|², and |z|² = '+par10(p)+'² + '+par10(q)+'² = '+N+'.'}; }
    if(t===2){ const [a,b,r]=z25(), d=2+rnd(6), right=String(r*d), wrong=uniq(right,[String(d),String(r+d),String(d*(Math.abs(a)+Math.abs(b))),String(r*r*d)],3);
      return {index:'q:25f.work[d;'+[a,b,d].join(';')+']', lines:[['z ↦ ('+cx25(a,b)+')z + '+pc25(q,p),'a straight map'],['two points are '+d+' apart','given']], ask:'How far apart are their images?', right, opts:shuffle([right,...wrong]), lead:'', why:'Straight-map technique: it multiplies every distance by |a| = |'+cx25(a,b)+'| = '+r+'. The slide changes no distance.'}; }
    if(t===3){ const a=nz25(4), b=nz25(4), c=nz25(4), d=nz25(4); if(a*d-b*c===0) return null;
      const lin=(x,v,y)=>cf22(x,v)+pm(y), f=(x,y,u,v)=>'w ↦ ('+lin(x,'w',y)+')/('+lin(u,'w',v)+')', right=f(d,-b,-c,a), wrong=uniq(right,[f(a,b,c,d),f(d,b,c,a),f(c,d,a,b),f(d,-b,c,a),f(-d,b,-c,a)],3); if(wrong.length<3) return null;
      return {index:'q:25f.work[u;'+[a,b,c,d].join(';')+']', lines:[['z ↦ ('+lin(a,'z',b)+')/('+lin(c,'z',d)+')','a map with four numbers, ad − bc = '+sg(a*d-b*c)]], ask:'Which map undoes it?', right, opts:shuffle([right,...wrong]), lead:'', why:'Four-number technique: the undoing is w ↦ (dw − b)/(−cw + a), with a = '+sg(a)+', b = '+sg(b)+', c = '+sg(c)+', d = '+sg(d)+'.'}; }
    const c=1+rnd(4), e=pick([0,0,1,-1,2]), r=1+rnd(3), B=-2*c, C=-2*e, D=c*c+e*e-r*r;
    const right=circ25(D,B,-C,1,'u','v'), wrong=uniq(right,[circ25(D,B,C,1,'u','v'),circ25(1,B,-C,D,'u','v'),circ25(D,-B,-C,1,'u','v'),circ25(D,B,-C,-1,'u','v'),circ25(D+1,B,-C,1,'u','v')],3);
    return {index:'q:25f.work[k;'+[c,e,r].join(';')+']', lines:[[circ25(1,B,C,D,'x','y'),'the circle with centre '+cx25(c,e)+' and radius '+r],['z ↦ 1/z = u + iv','inside out']], ask:'Where do its points other than 0 go?', right, opts:shuffle([right,...wrong]), lead:'', why:'Circle-or-line technique: A(x² + y²) + Bx + Cy + D = 0 goes to D(u² + v²) + Bu − Cv + A = 0. A and D swap, and C changes sign.'+(D===0?' Here D = 0: the circle runs through 0, and its image is a line.':'')}; }});

/* ===== Laundry 5, last part (spliced after every other terms*.js): a pool that sets no lead gets one, so a wrong answer never reads "The line holds by ..." ===== */
QP.forEach(Q=>{ const mk=Q.make; Q.make=function(){ const q=mk.call(this); if(q&&typeof q.index==='string'&&q.index.startsWith('q:')&&q.lead==='') q.lead='The answer is “'+q.right+'”. '; return q; }; });

const MAKE={proof:proofQ, work:workQ, word:wordQ, read:readQ};

const toggled=()=>[...LINKS,...QP,...CARDP,...OPS,...MOVES];
function avail(mode){ const oS=SEEDS.filter(s=>s.open()), kinds=oS.map(s=>SKIND[s.id]), oO=OPS.filter(o=>o.open());
  const qp=m=>QP.some(Q=>Q.open()&&qmode(Q)===m);
  if(mode==='proof') return (oS.length>0&&LINKS.filter(l=>l.open()).length>=2)||qp('proof');
  const chainable=oS.some(s=>TERMK.includes(SKIND[s.id])&&s.id!=='1d.letters'&&LINKS.filter(l=>l.open()&&l.rule&&l.kinds.includes(SKIND[s.id])).length>=2);
  if(mode==='work') return chainable||(oO.length>0&&kinds.some(k=>['add','times','num','int'].includes(k)))||qp('work');
  if(mode==='word') return (BANK.some(b=>b.open()&&!b.kind)&&oO.some(o=>o.word)&&kinds.some(k=>['add','times','num'].includes(k)))||(BANK.some(b=>b.open()&&b.kind==='prop')&&kinds.includes('say'))||qp('word');
  return qp('read')||CARDP.some(C=>C.open())||(oS.length>0&&LINKS.some(l=>l.open())); }
const OPENS={proof:'0b',work:'1f',word:'1d',read:'0a'};
function modeNow(){ const m=(get('rand:mode',null)||{}).m||'proof'; /* kept as an object: the record hands a bare word back unquoted */ if(MODES.some(M=>M.id===m)&&avail(m)) return m; const f=MODES.find(M=>avail(M.id)); return f?f.id:m; }

function build(mode){
  mode=mode||modeNow();
  const off=get('rand:off',{}), isOff=P=>!!off['rung:'+rungOf(P.step)];
  if(![...SEEDS,...toggled(),...BANK].some(P=>P.open())) return {closed:'The laundry opens with the crosswalk of the first step you reach, and its technique pools open as you pass measuring sticks.'};
  if(!avail(mode)) return {closed:mode==='read'?'Understanding opens with the crosswalk of the first step you reach.':MODES.find(M=>M.id===mode).label+' opens when you pass the measuring stick of '+OPENS[mode]+'.'};
  const used=get('rand:seen',{}), last=get('rand:last',[]), st=strayDue();
  const anyOn=toggled().some(P=>P.open()&&!isOff(P)), anyOff=toggled().some(P=>P.open()&&isOff(P));
  if(!anyOn) return {closed:'Every rung is switched off below. Switch one on.'};
  const passes=(st.due>st.served&&anyOff)?[true,false]:[false];
  for(const stray of passes){
    const use=P=>P.open()&&(stray?isOff(P):!isOff(P));
    const P={isOff, seeds:SEEDS.filter(s=>s.open()), bank:BANK.filter(b=>b.open()), links:LINKS.filter(use), qps:QP.filter(use), ops:OPS.filter(use),
      cps:CARDP.filter(C=>use(C)&&C.ready()), openL:LINKS.filter(l=>l.open()), moves:MOVES.filter(use), use};
    const q=MAKE[mode](P,used,last); if(q){ q.stray=stray; q.mode=mode; return q; } }
  return {closed:'The rungs switched on hold no fresh question of this kind. Switch on another rung below, or pick another kind above. Each step you pass adds its pools.'};
}

/* Pools are switched by rung; inside a rung each pool unlocks with its step. */
function picker(q){
  const off=get('rand:off',{}), by={};
  const src=P=>P.kind==='cards'?'crosswalk':P.kind==='sq'?'standing questions':P.kind==='tech'?'techniques':OPS.includes(P)?'operations':MOVES.includes(P)?'checks':BANK.includes(P)?'bank':SEEDS.includes(P)?'seeds':LINKS.includes(P)?'links':'questions';
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
window.LadderRandomizer={render, build, parseNames, licensers, LINKS, SEEDS, QP, measured, cardPools, CARDP, MODES, OPS, BANK, MOVES, holds, mutations, avail, MAKE, T:{tparse,tshow,trew,tequiv,tslips,tval,trows}};
const pane=document.getElementById('dp-rand'); if(pane){ let box=pane.querySelector('.rzbox'); if(!box){ box=document.createElement('div'); box.className='rzbox'; pane.innerHTML=''; pane.appendChild(box); } render(box); }
})();
