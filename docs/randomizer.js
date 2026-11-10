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
