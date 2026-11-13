/* Math keys tray: a button in the bottom corner of every page; tap it and the keyboard slides up.
   Only symbols a keyboard can't type. Teal keys type; grey keys open a cluster over the keyboard
   where you tapped (clusters can nest: superscript → n → digits). The symbol goes into whichever
   text box on the page you last touched, at the caret; with none touched, into the tray's own line. */
(function(){
'use strict';
if(document.getElementById('mk-tray')) return;
const L=s=>s.split(' ');
const TREE=[ /* 0.3.23 (Andrew 2026-11-05 10:54): no stray keys; each mark sits in its group */
  {t:'︿ ﹀',n:'pack and unpack',c:L('︿ ﹀'),always:1},
  {t:'∂ ∇ ∫',n:'rates and integrals',c:L('∂ ∇ ∫ ∬ ∭ ∮ ∯')},
  {t:'√ ∛',n:'roots',c:L('√ ∛ ∜')},
  {t:'xⁿ',n:'superscript',c:[...L('⁻ ⁺ ⁽ ⁾'),{t:'ⁿ',n:'n',c:L('⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁿ ˣ')}]},
  {t:'xₙ',n:'subscript',c:[...L('₋ ₊ ₍ ₎'),{t:'ₙ',n:'n',c:L('₀ ₁ ₂ ₃ ₄ ₅ ₆ ₇ ₈ ₉ ₙ ₓ ₐ ᵢ')}]},
  {t:'½ ⅓',n:'fractions',c:L('½ ⅓ ¼ ⅔ ¾ ⁄')},
  {t:'→ ≈ ∝',n:'between two expressions',c:L('→ ← ↔ ↦ ⇒ ⇔ ≈ ≠ ≡ ≅ ≤ ≥ ≪ ≫ ∝ ± ∓ · × ÷ ∘ ⋯ ∴ ∵ lim ∈ ∉ ∅ ∀ ∃ ¬ ∧ ∨ ⊥ ⊂ ⊃ ⊆ ⊇ ∪ ∩ ∖')},
  {t:'ℕ ℤ ∞',n:'number sets',c:L('ℕ ℤ ℚ ℝ ℂ ∞ ℵ')},
  {t:'α β γ',n:'greek',c:L('α β γ δ ε ζ η θ ι κ λ μ ν ξ π ρ σ τ υ φ χ ψ ω')},
  {t:'Γ Δ Σ',n:'GREEK',c:L('Γ Δ Θ Λ Ξ Π Σ Φ Ψ Ω')},
  {t:'′ ″ °',n:'primes, degree, angle brackets',c:L('′ ″ ° ⟨ ⟩')}
];
const css=`
#mk-tray{--mk-paper:var(--paper,#fbf9f4);--mk-ink:var(--ink,#26262b);--mk-muted:var(--muted,#8a8a93);--mk-grid:var(--grid,#e3dfd5);--mk-sand:var(--sand,#ece7dd);--mk-card:var(--card,#fff);--mk-teal:var(--teal,#1f6f8b);--mk-ember:var(--ember,#c8501e);
  --mk-mono:"Nunito",system-ui,-apple-system,"Segoe UI",sans-serif;--mk-serif:"Source Serif 4",Georgia,serif;font-family:var(--mk-serif);color:var(--mk-ink)}
@media (prefers-color-scheme: dark){#mk-tray{--mk-paper:var(--paper,#1b1b1f);--mk-ink:var(--ink,#ece8df);--mk-muted:var(--muted,#9a9aa3);--mk-grid:var(--grid,#33333a);--mk-sand:var(--sand,#2a2a30);--mk-card:var(--card,#232329);--mk-teal:var(--teal,#4aa3c2);--mk-ember:var(--ember,#e8703a)}}
#mk-tray .mk-btn{position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:max(14px,env(safe-area-inset-bottom,0px));z-index:9000;font-family:var(--mk-mono);font-size:.85rem;background:var(--mk-ink);color:var(--mk-paper);border:0;border-radius:999px;padding:9px 14px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.25)}
#mk-tray.hasdesk .mk-btn{bottom:calc(max(14px,env(safe-area-inset-bottom,0px)) + 54px)}
#mk-tray .mk-panel{position:fixed;left:0;right:0;bottom:0;z-index:9001;background:var(--mk-paper);border-top:1px solid var(--mk-grid);box-shadow:0 -4px 18px rgba(0,0,0,.18);max-height:60vh;overflow:auto;padding:10px max(14px,env(safe-area-inset-right,0px)) max(14px,env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px));transform:translateY(105%);transition:transform .22s ease;display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
#mk-tray .mk-panel>*{min-width:0} /* 2026-11-10: the panel never grows past its host (the one-line target label used to set its width) */
#mk-tray.open .mk-panel{transform:none}
#mk-tray .mk-panel[hidden]{display:none}
#mk-tray.mk-docked .mk-btn,#mk-tray.mk-docked .mk-close{display:none}
#mk-tray.mk-docked .mk-panel{position:static;transform:none;box-shadow:none;border:0;max-height:none;padding:0;background:transparent;transition:none}
#mk-tray .mk-top{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
#mk-tray .mk-target{font-family:var(--mk-mono);font-size:.72rem;color:var(--mk-teal);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#mk-tray .mk-top button,#mk-tray .mk-line button{font-family:var(--mk-mono);font-size:.8rem;background:var(--mk-sand);color:var(--mk-ink);border:1px solid var(--mk-grid);border-radius:6px;padding:5px 9px;cursor:pointer}
#mk-tray .mk-line{display:none;grid-template-columns:minmax(0,1fr) auto auto;gap:6px}
@media (max-width:480px){#mk-tray .mk-line{grid-template-columns:1fr 1fr} #mk-tray .mk-line textarea{grid-column:1/-1}} /* 2026-11-10 (Andrew 15:59): the own line fits a phone */
#mk-tray.ownline .mk-line{display:grid}
#mk-tray textarea{font-family:var(--mk-mono);font-size:1.05rem;padding:7px 10px;border:1px solid var(--mk-grid);border-radius:6px;background:var(--mk-card);color:var(--mk-ink);resize:vertical;min-height:2.4rem;min-width:0;width:100%;box-sizing:border-box}
#mk-tray .mk-keys{display:flex;flex-wrap:wrap;gap:6px}
#mk-tray .mk-k{font-family:var(--mk-serif);font-size:1.25rem;min-width:2.7rem;min-height:2.7rem;padding:3px 9px;border-radius:7px;line-height:1.15;cursor:pointer;display:grid;align-content:center;justify-items:center;gap:1px}
#mk-tray .mk-k.leaf{background:var(--mk-teal);color:#fff;border:1px solid var(--mk-teal)}
#mk-tray .mk-k.leaf.w{font-size:.95rem;font-family:var(--mk-mono)}
#mk-tray .mk-k.node{background:var(--mk-card);color:var(--mk-ink);border:1px solid var(--mk-grid);padding:3px 10px}
#mk-tray .mk-k.node small{font-family:var(--mk-mono);font-size:.58rem;letter-spacing:.06em;text-transform:uppercase;color:var(--mk-muted);white-space:nowrap}
#mk-tray .mk-k.node::after{content:"▾";font-size:.7rem;color:var(--mk-muted);line-height:.6}
#mk-tray .mk-k:hover{filter:brightness(1.08)} #mk-tray .mk-k.node:hover{border-color:var(--mk-ink)}
#mk-tray .mk-pop{position:fixed;z-index:9002;background:var(--mk-paper);border:1px solid var(--mk-grid);border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.28);padding:8px;display:flex;flex-wrap:wrap;gap:6px;max-width:min(92vw,520px)}
#mk-tray .mk-pop .mk-pt{flex:1 0 100%;font-family:var(--mk-mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--mk-muted);display:flex;justify-content:space-between;align-items:center}
#mk-tray .mk-pop .mk-pt button{font-family:var(--mk-mono);font-size:.7rem;background:none;border:0;color:var(--mk-muted);cursor:pointer;padding:2px 4px}
#mk-tray .mk-scope{flex:1 0 100%;margin:4px 0 0;font-family:var(--mk-mono);font-size:.68rem;color:var(--mk-muted)}
#mk-tray .mk-toast{font-family:var(--mk-mono);font-size:.72rem;color:var(--mk-teal);min-height:1em}
#mk-tray button:focus-visible{outline:2px solid var(--mk-ember);outline-offset:2px}
`;
const root=document.createElement('div'); root.id='mk-tray';
root.innerHTML=`<style>${css}</style>
<button class="mk-btn" type="button" aria-expanded="false" aria-controls="mk-panel">⌨ quick keys</button>
<div class="mk-panel" id="mk-panel" role="region" aria-label="quick keys" hidden>
  <div class="mk-top"><span class="mk-target"></span><button type="button" class="mk-own">Quick Keys</button><button type="button" class="mk-close">close</button></div>
  <div class="mk-line"><textarea aria-label="composing line" placeholder="dy/dx = ½·x⁻½"></textarea><button type="button" class="mk-copy">copy</button><button type="button" class="mk-clear">clear</button></div>
  <div class="mk-keys"></div>
  <div class="mk-toast"></div>
</div>`;
document.body.appendChild(root);
if(document.getElementById('deskbtn')) root.classList.add('hasdesk');
const $=s=>root.querySelector(s);
const btn=$('.mk-btn'), panel=$('.mk-panel'), line=$('textarea'), toast=$('.mk-toast'), keys=$('.mk-keys'), tgt=$('.mk-target');
try{ const s=LS.getItem('mathkeys-line'); if(s) line.value=s; }catch(e){}
const saveLine=()=>{ try{ LS.setItem('mathkeys-line',line.value); }catch(e){} };
line.addEventListener('input',()=>{ saveLine(); autoCopy(); });
let tt; const say=t=>{ toast.textContent=t; clearTimeout(tt); tt=setTimeout(()=>toast.textContent='',1200); };

// --- the target: the last text box touched on the page ---------------------------------
let target=null;
/* the chat's prompt box lives outside this page, where a page is not allowed to type; so the line copies itself on every key, ready to paste */
function autoCopy(){ /* keysname */ return; try{ if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(line.value).then(()=>{ const n=Date.now(); if(!autoCopy.t||n-autoCopy.t>4000){ autoCopy.t=n; say('copied: paste it into the chat'); } },()=>{}); }catch(e){} }
const editable=el=>el && !root.contains(el) && ((el.tagName==='TEXTAREA')||(el.tagName==='INPUT'&&/^(text|search|url|tel|email|number|)$/.test(el.type||''))||el.isContentEditable);
function label(el){ if(!el) return ''; const a=el.getAttribute('aria-label')||el.placeholder||(el.id?'#'+el.id:'')||el.tagName.toLowerCase(); return 'writing into: '+a; }
function setTarget(el){ target=el; root.classList.toggle('ownline',!el); tgt.textContent=label(el); }
document.addEventListener('focusin',e=>{ if(editable(e.target)) setTarget(e.target); });
document.addEventListener('pointerdown',e=>{ const el=e.target.closest&&e.target.closest('textarea,input,[contenteditable]'); if(editable(el)) setTarget(el); },true);
function insert(k){
  const el=(target&&document.contains(target))?target:null;
  if(!el){ setTarget(null); const s=line.selectionStart??line.value.length, e=line.selectionEnd??s; line.value=line.value.slice(0,s)+k+line.value.slice(e); line.selectionStart=line.selectionEnd=s+k.length; saveLine(); autoCopy(); return; }
  if(el.isContentEditable){ el.focus(); const sel=window.getSelection(); if(sel&&sel.rangeCount&&el.contains(sel.anchorNode)){ const r=sel.getRangeAt(0); r.deleteContents(); const t=document.createTextNode(k); r.insertNode(t); r.setStartAfter(t); r.collapse(true); sel.removeAllRanges(); sel.addRange(r); } else el.append(k); }
  else { let s=el.selectionStart, e=el.selectionEnd; if(s==null||el.type==='number'){ el.value+=k; } else { el.value=el.value.slice(0,s)+k+el.value.slice(e); try{ el.selectionStart=el.selectionEnd=s+k.length; }catch(_){} } el.focus({preventScroll:true}); }
  el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true}));
}
root.addEventListener('mousedown',e=>{ if(e.target.closest('button')) e.preventDefault(); });  // keep the page box focused

// --- keys and clusters ------------------------------------------------------------------
const pops=[];
function closePops(from=0){ while(pops.length>from) pops.pop().remove(); }
function makeKey(item,depth){
  const b=document.createElement('button'); b.type='button'; b.className='mk-k';
  if(typeof item==='string') item={k:item};
  if(item.k){ b.classList.add('leaf'); if(item.k.length>2) b.classList.add('w'); b.textContent=item.k; b.setAttribute('aria-label','type '+item.k);
    b.addEventListener('click',()=>{ insert(item.k); say(item.k+' written'); }); }
  else { b.classList.add('node'); b.innerHTML=`<span>${item.t}</span><small>${item.n}</small>`; b.setAttribute('aria-haspopup','true'); b.setAttribute('aria-label',item.n+': '+item.c.map(x=>typeof x==='string'?x:x.n).join(' '));
    b.addEventListener('click',e=>openPop(item,e,depth)); }
  return b;
}
function openPop(item,e,depth){
  closePops(depth);
  const pop=document.createElement('div'); pop.className='mk-pop'; pop.setAttribute('role','group'); pop.setAttribute('aria-label',item.n);
  const head=document.createElement('div'); head.className='mk-pt'; head.innerHTML=`<span>${item.n}</span><button type="button" aria-label="close ${item.n}">✕</button>`;
  head.querySelector('button').addEventListener('click',()=>closePops(depth)); pop.appendChild(head);
  item.c.forEach(ch=>pop.appendChild(makeKey(ch,depth+1)));
  root.appendChild(pop); pops.push(pop);
  // place it over the keyboard at the point of the tap, kept on screen
  const x=e.clientX||e.target.getBoundingClientRect().left, y=e.clientY||e.target.getBoundingClientRect().top;
  const w=pop.offsetWidth, h=pop.offsetHeight, vw=innerWidth, vh=innerHeight;
  pop.style.left=Math.max(6,Math.min(vw-w-6,x-w/2))+'px';
  pop.style.top=Math.max(6,(y-h-10>6? y-h-10 : Math.min(vh-h-6,y+14)))+'px';
}
/* The keys limit themselves to the marks the learner is expected to use: by default the marks this page
   writes in its lesson and questions (not its basement); in the randomizer, the marks its chosen pools write. */
const TEX={forall:'∀',exists:'∃',neg:'¬',lnot:'¬',land:'∧',wedge:'∧',lor:'∨',vee:'∨',Rightarrow:'⇒',implies:'⇒',Leftrightarrow:'⇔',iff:'⇔',to:'→',rightarrow:'→',leftarrow:'←',leftrightarrow:'↔',mapsto:'↦',
  le:'≤',leq:'≤',ge:'≥',geq:'≥',ne:'≠',neq:'≠',approx:'≈',equiv:'≡',cong:'≅',in:'∈',notin:'∉',emptyset:'∅',varnothing:'∅',subset:'⊂',subseteq:'⊆',supset:'⊃',supseteq:'⊇',cup:'∪',cap:'∩',setminus:'∖',
  cdot:'·',times:'×',div:'÷',circ:'∘',pm:'±',mp:'∓',infty:'∞',aleph:'ℵ',int:'∫',iint:'∬',iiint:'∭',oint:'∮',sum:'Σ',prod:'Π',sqrt:'√',partial:'∂',nabla:'∇',lim:'lim',langle:'⟨',rangle:'⟩',
  cdots:'⋯',ldots:'⋯',dots:'⋯',therefore:'∴',because:'∵',propto:'∝',bot:'⊥',perp:'⊥',ll:'≪',gg:'≫',prime:'′',degree:'°',
  alpha:'α',beta:'β',gamma:'γ',delta:'δ',epsilon:'ε',varepsilon:'ε',zeta:'ζ',eta:'η',theta:'θ',iota:'ι',kappa:'κ',lambda:'λ',mu:'μ',nu:'ν',xi:'ξ',pi:'π',rho:'ρ',sigma:'σ',tau:'τ',upsilon:'υ',phi:'φ',varphi:'φ',chi:'χ',psi:'ψ',omega:'ω',
  Gamma:'Γ',Delta:'Δ',Theta:'Θ',Lambda:'Λ',Xi:'Ξ',Pi:'Π',Sigma:'Σ',Phi:'Φ',Psi:'Ψ',Omega:'Ω'};
const SUP='⁰¹²³⁴⁵⁶⁷⁸⁹ⁿˣ⁻⁺⁽⁾', SUB='₀₁₂₃₄₅₆₇₈₉ₙₓₐᵢ₋₊₍₎';
function marksIn(text){
  const S=new Set(); text=String(text);
  text.replace(/\\mathbb\s*\{?\s*([NZQRC])/g,(m,c)=>{ S.add({N:'ℕ',Z:'ℤ',Q:'ℚ',R:'ℝ',C:'ℂ'}[c]); return m; });
  text.replace(/\\([A-Za-z]+)/g,(m,w)=>{ if(TEX[w]) S.add(TEX[w]); return m; });
  if(/\^/.test(text)) [...SUP].forEach(c=>S.add(c));
  if(/_[{\w]/.test(text)) [...SUB].forEach(c=>S.add(c));
  if(/\\frac|\\tfrac/.test(text)) S.add('⁄');
  if(/\blim\b/.test(text)) S.add('lim');
  for(const ch of text) S.add(ch);
  return S;
}
function pageMarks(){
  const parts=[];
  const body=document.body.cloneNode(true);
  body.querySelectorAll('section.basement,.extra.basement,#mk-tray,#desk,#lbar,nav,script[src],style,.ready,.greekkey,header .tags,.stidx,.bnav,.pnav').forEach(n=>n.remove());
  parts.push(body.textContent);
  body.querySelectorAll('[data-tex],[data-tex-inline],[data-t]').forEach(n=>parts.push(n.getAttribute('data-tex')||n.getAttribute('data-tex-inline')||n.getAttribute('data-t')||''));
  return marksIn(parts.join('\n'));
}
function filt(item,S,depth){
  if(typeof item==='string') return S.has(item)?item:null;
  if(item.k) return S.has(item.k)?item:null;
  if(item.always&&depth===0) return item;
  if(item.n==='n'){ return item.c.some(x=>S.has(x))?item:null; }
  const c=item.c.map(x=>filt(x,S,depth+1)).filter(Boolean);
  if(!c.length) return null;
  if(c.length===1&&typeof c[0]==='string'&&depth>0) return {k:c[0]};
  const t=c.length<item.c.length?c.slice(0,3).map(x=>typeof x==='string'?x:(x.k||x.t)).join(' '):item.t;
  return Object.assign({},item,{c,t});
}
let limitTo=null, limitLabel='';
function drawKeys(){
  closePops(0); keys.innerHTML='';
  const S=limitTo||pageMarks();
  const shown=new Set();
  const items=TREE.map(x=>filt(x,S,0)).filter(Boolean).map(x=>{
    if(x.k){ if(shown.has(x.k)) return null; shown.add(x.k); return x; }
    const c=x.c.filter(y=>typeof y!=='string'||!shown.has(y)); c.forEach(y=>{ if(typeof y==='string') shown.add(y); });
    if(!c.length) return null; return Object.assign({},x,{c}); }).filter(Boolean);
  items.forEach(item=>keys.appendChild(makeKey(item,0)));
  const n=document.createElement('p'); n.className='mk-scope';
  n.textContent=items.length?('keys for '+(limitTo?limitLabel:'this page')):(limitTo?limitLabel.replace(/^./,c=>c.toUpperCase())+' ask':'This page asks')+' for no marks beyond your own keyboard.';
  keys.appendChild(n);
}
window.MathKeys={ limit(set,label){ limitTo=set?new Set(set):null; limitLabel=label||''; drawKeys(); }, marksIn, open:v=>open(v) };
drawKeys();
document.addEventListener('pointerdown',e=>{ if(pops.length && !e.target.closest('.mk-pop') && !e.target.closest('.mk-k.node')) closePops(0); },true);

// --- open / close ------------------------------------------------------------------------
function open(v){ root.classList.toggle('open',v); btn.setAttribute('aria-expanded',String(v)); if(v){ panel.hidden=false; btn.textContent='⌨ hide'; setTarget(editable(document.activeElement)?document.activeElement:target); } else { closePops(0); btn.textContent='⌨ keys'; setTimeout(()=>{ if(!root.classList.contains('open')) panel.hidden=true; },240); } }
btn.addEventListener('click',()=>open(!root.classList.contains('open')));
$('.mk-close').addEventListener('click',()=>open(false));
$('.mk-own').addEventListener('click',()=>{ setTarget(null); line.focus(); });
$('.mk-copy').addEventListener('click',()=>{ const done=()=>say('line copied'); const fb=()=>{ line.select(); try{ document.execCommand('copy'); done(); }catch(e){ say('select and copy by hand'); } }; if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(line.value).then(done).catch(fb); else fb(); });
$('.mk-clear').addEventListener('click',()=>{ line.value=''; saveLine(); say('cleared'); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ if(pops.length) closePops(pops.length-1); else if(root.classList.contains('open')) open(false); } });
panel.addEventListener('scroll',()=>closePops(0));
setTarget(null);
})();
