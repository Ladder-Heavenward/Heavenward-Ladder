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
