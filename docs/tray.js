/* Math keys tray: a button in the bottom corner of every page; tap it and the keyboard slides up.
   Only symbols a keyboard can't type. Teal keys type; grey keys open a cluster over the keyboard
   where you tapped (clusters can nest: superscript → n → digits). The symbol goes into whichever
   text box on the page you last touched, at the caret; with none touched, into the tray's own line. */
(function(){
'use strict';
if(document.getElementById('mk-tray')) return;
const L=s=>s.split(' ');
const TREE=[ /* 0.3.23 (Andrew 2026-11-05 10:54): no stray keys; each mark sits in its group.
   quickkeys (Andrew 2026-11-15 08:00Z): the keys reach the end of the infinity series. 08:14Z: four groups by what the
   learner is writing: Names, Statements, Sets and Proofs, each opening into a pane in subsets. */
  {t:'π xₙ ½',n:'names',s:[['constants','π e ∞ ℏ'],['greek','α β γ δ ε ζ η θ ι κ λ μ ν ξ π ρ σ τ υ φ χ ψ ω'],['script','ℓ 𝒜 ℬ 𝒞 𝒟 ℱ 𝒦 𝒮 𝒯 𝒱 𝒲'],
    ['superscript','⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁻ ⁺ ⁽ ⁾ ⁿ ˣ ⁱ ʲ ᵏ ᵐ ᵖ ʳ ˢ ᵗ ᵃ ᵇ ᶜ ᵈ ᵉ ᵍ ʰ ᵘ ᵛ ʷ ʸ ᶻ ᵀ ᴺ ᴸ ᵠ'],['subscript','₀ ₁ ₂ ₃ ₄ ₅ ₆ ₇ ₈ ₉ ₋ ₊ ₍ ₎ ₌ ₙ ₓ ₐ ᵢ ⱼ ₖ ₗ ₘ ₚ ᵣ ₛ ₜ ᵤ ᵥ ₑ ₕ ₒ ᵧ ᵦ'],
    ['fractions','½ ⅓ ⅔ ¼ ¾ ⅕ ⅗ ⅘ ⅙ ⅚ ⅐ ⅛ ⅜ ⅞ ⅑ ⁄'],['primes and degree','′ ″ °']]},
  {t:'→ ≤ Σ',n:'statements',s:[['operators: arrows','→ ← ↔ ↦ ↑ ↓ ↪ ⇌'],['operators: comparing','≈ ≠ ≡ ≢ ≅ ≃ ∼ ≤ ≥ ≲ ≪ ≫ ∝ ≺ ≼ ∣ ∤ ∥ ∠'],
    ['operators: arithmetic','± ∓ · × ÷ ∘ ⊕ ⊗ √ ∛ ∜ lim'],['operators: rates and integrals','∂ ∇ ∫ ∬ ∭ ∮ ∯'],['operators: sums and products','∑ ∏'],
    ['GREEK','Γ Δ Θ Λ Ξ Π Σ Φ Ψ Ω'],['brackets','⟨ ⟩ ⌊ ⌋ ⌈ ⌉ ⟦ ⟧']]},
  {t:'∅ ∈ ⋯',n:'sets',s:[['marks','∅ ⋯ ⋮'],['belonging','∈ ∉ ∋'],['parts','⊂ ⊃ ⊆ ⊇ ⊊ ⊈ ⊲'],['joining and cutting','∪ ∩ ∖ ⊔ ⋃ ⋂'],['number sets','ℕ ℤ ℚ ℝ ℂ ℵ 𝒫']]},
  {t:'︿ ⊥ ∎',n:'proofs',always:1,s:[['pack and unpack','︿ ﹀'],['totally true and totally false','⊤ ⊥'],['connectives','¬ ∧ ∨ ⋁ ⇒ ⇐ ⇔'],['quantifiers','∀ ∃'],
    ['proving','⊢ ⊬ ⊨ ⊭ ∴ ∵ ∎'],['box and diamond','□ ◇'],['quotes','⌜ ⌝']]}
].map(g=>(g.s=g.s.map(([h,c])=>({h,c:L(c)})),g));
const LEAVES=new Set(TREE.flatMap(g=>g.s.flatMap(x=>x.c)));
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
#mk-tray .mk-keys{display:block}
/* quickkeys: the four group buttons sit two by two, all one size */
#mk-tray .mk-grid,#mk-tray .mk-row{display:flex;flex-wrap:wrap;justify-content:center;gap:6px}
#mk-tray .mk-g{margin:0;flex:0 0 calc((100% - 6px)/2);box-sizing:border-box;height:5rem;position:relative;background:var(--mk-card);color:var(--mk-ink);border:1px solid var(--mk-grid);border-radius:10px;cursor:pointer;display:grid;align-content:center;justify-items:center;gap:3px;padding:4px 4px 6px;font-family:var(--mk-serif)}
#mk-tray .mk-g span{font-size:1.45rem;letter-spacing:.08em;line-height:1.1;white-space:nowrap}
#mk-tray .mk-g small{font-family:var(--mk-mono);font-size:.66rem;letter-spacing:.05em;text-transform:uppercase;color:var(--mk-muted);line-height:1.15;text-align:center;max-width:100%}
#mk-tray .mk-g.here::after{content:"";position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;background:var(--mk-teal)}
#mk-tray .mk-g:hover{border-color:var(--mk-ink)}
#mk-tray .mk-k{margin:0;font-family:var(--mk-serif);font-size:1.25rem;box-sizing:border-box;flex:0 0 calc((100% - 30px)/6);height:2.9rem;padding:0;border-radius:8px;line-height:1;cursor:pointer;display:grid;place-items:center;position:relative}
@media (min-width:560px){#mk-tray .mk-k{flex-basis:calc((100% - 42px)/8)}}
#mk-tray.mk-docked .mk-k{flex-basis:calc((100% - 30px)/6)}
#mk-tray .mk-k.leaf{background:var(--mk-teal);color:#fff;border:1px solid var(--mk-teal)}
#mk-tray .mk-k.leaf.w{font-size:.95rem;font-family:var(--mk-mono)}
#mk-tray .mk-k.here::after{content:"";position:absolute;top:4px;right:4px;width:5px;height:5px;border-radius:50%;background:#fff;opacity:.9}
#mk-tray .mk-k:hover{filter:brightness(1.08)}
/* the pane opens under its row of group buttons, full width; the open button is marked */
#mk-tray .mk-g.on{border-color:var(--mk-teal);box-shadow:inset 0 0 0 1px var(--mk-teal)}
#mk-tray .mk-g.on small{color:var(--mk-teal)}
#mk-tray .mk-pane{flex:0 0 100%;box-sizing:border-box;border:1px solid var(--mk-grid);border-radius:10px;background:var(--mk-card);padding:6px;display:grid;gap:4px;animation:mkin .18s ease}
@keyframes mkin{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){#mk-tray .mk-pane{animation:none}}
#mk-tray .mk-sec{display:grid;gap:6px}
#mk-tray .mk-sh{margin:0;display:grid;grid-template-columns:1.2rem 1fr auto;align-items:center;gap:6px;width:100%;box-sizing:border-box;text-align:left;background:var(--mk-sand);color:var(--mk-ink);border:1px solid var(--mk-grid);border-radius:7px;padding:7px 10px;cursor:pointer;font-family:var(--mk-mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase}
#mk-tray .mk-sh i{font-style:normal;color:var(--mk-muted)}
#mk-tray .mk-sh em{font-style:normal;color:var(--mk-muted);font-size:.66rem;letter-spacing:0}
#mk-tray .mk-sh.here span::after{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--mk-teal);margin-left:7px;vertical-align:middle}
#mk-tray .mk-row[hidden]{display:none}
#mk-tray .mk-row{padding:2px 0 6px}
#mk-tray .mk-scope{margin:8px 0 0;font-family:var(--mk-mono);font-size:.68rem;color:var(--mk-muted);text-align:center}
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

// --- keys and panes (quickkeys 2026-11-15: a group opens into a pane in place of the popups) ---------------------
let openG=null, lastS=null, lastHere=null;
function makeKey(k,here){
  const b=document.createElement('button'); b.type='button'; b.className='mk-k leaf'+(k.length>2?' w':'')+(here&&here.has(k)?' here':''); b.textContent=k; b.setAttribute('aria-label','type '+k);
  b.addEventListener('click',()=>{ insert(k); say(k+' written'); }); return b;
}
function makeGroup(g,here){
  const b=document.createElement('button'); b.type='button'; b.className='mk-g'+(g.s.some(x=>x.c.some(k=>here.has(k)))?' here':'');
  b.innerHTML=`<span>${g.t}</span><small>${g.n}</small>`; b.setAttribute('aria-label',g.n+': '+g.s.flatMap(x=>x.c).join(' '));
  b.setAttribute('aria-expanded',String(openG===g.n)); if(openG===g.n) b.classList.add('on');
  b.addEventListener('click',()=>{ openG=openG===g.n?null:g.n; paint(); }); return b;
}
/* The keys limit themselves to the marks the learner is expected to use: by default the marks this page
   writes in its lesson and questions (not its basement); in the randomizer, the marks its chosen pools write. */
const TEX={forall:'∀',exists:'∃',neg:'¬',lnot:'¬',land:'∧',wedge:'∧',lor:'∨',vee:'∨',Rightarrow:'⇒',implies:'⇒',Leftrightarrow:'⇔',iff:'⇔',to:'→',rightarrow:'→',leftarrow:'←',leftrightarrow:'↔',mapsto:'↦',
  le:'≤',leq:'≤',ge:'≥',geq:'≥',ne:'≠',neq:'≠',approx:'≈',equiv:'≡',cong:'≅',in:'∈',notin:'∉',emptyset:'∅',varnothing:'∅',subset:'⊂',subseteq:'⊆',supset:'⊃',supseteq:'⊇',cup:'∪',cap:'∩',setminus:'∖',
  cdot:'·',times:'×',div:'÷',circ:'∘',pm:'±',mp:'∓',infty:'∞',aleph:'ℵ',int:'∫',iint:'∬',iiint:'∭',oint:'∮',sum:'∑',prod:'∏',sqrt:'√',partial:'∂',nabla:'∇',lim:'lim',langle:'⟨',rangle:'⟩',
  cdots:'⋯',ldots:'⋯',dots:'⋯',therefore:'∴',because:'∵',propto:'∝',bot:'⊥',perp:'⊥',ll:'≪',gg:'≫',prime:'′',degree:'°',
  alpha:'α',beta:'β',gamma:'γ',delta:'δ',epsilon:'ε',varepsilon:'ε',zeta:'ζ',eta:'η',theta:'θ',iota:'ι',kappa:'κ',lambda:'λ',mu:'μ',nu:'ν',xi:'ξ',pi:'π',rho:'ρ',sigma:'σ',tau:'τ',upsilon:'υ',phi:'φ',varphi:'φ',chi:'χ',psi:'ψ',omega:'ω',
  mid:'∣',nmid:'∤',parallel:'∥',sim:'∼',simeq:'≃',lesssim:'≲',prec:'≺',preceq:'≼',subsetneq:'⊊',nsubseteq:'⊈',ni:'∋',oplus:'⊕',otimes:'⊗',vdash:'⊢',nvdash:'⊬',models:'⊨',top:'⊤',
  uparrow:'↑',downarrow:'↓',Leftarrow:'⇐',hookrightarrow:'↪',rightleftharpoons:'⇌',lhd:'⊲',triangleleft:'⊲',sqcup:'⊔',Box:'□',Diamond:'◇',angle:'∠',vdots:'⋮',bigcup:'⋃',bigcap:'⋂',bigvee:'⋁',
  ell:'ℓ',hbar:'ℏ',lfloor:'⌊',rfloor:'⌋',lceil:'⌈',rceil:'⌉',llbracket:'⟦',rrbracket:'⟧',ulcorner:'⌜',urcorner:'⌝',Longleftrightarrow:'⇔',Longrightarrow:'⇒',longrightarrow:'→',longleftarrow:'←',
  Gamma:'Γ',Delta:'Δ',Theta:'Θ',Lambda:'Λ',Xi:'Ξ',Pi:'Π',Sigma:'Σ',Phi:'Φ',Psi:'Ψ',Omega:'Ω'};
const SUP='⁰¹²³⁴⁵⁶⁷⁸⁹ⁿˣ⁻⁺⁽⁾', SUB='₀₁₂₃₄₅₆₇₈₉ₙₓₐᵢ₋₊₍₎';
const SUPL={i:'ⁱ',j:'ʲ',k:'ᵏ',m:'ᵐ',p:'ᵖ',r:'ʳ',s:'ˢ',t:'ᵗ',a:'ᵃ',b:'ᵇ',c:'ᶜ',d:'ᵈ',e:'ᵉ',g:'ᵍ',h:'ʰ',u:'ᵘ',v:'ᵛ',w:'ʷ',y:'ʸ',z:'ᶻ',T:'ᵀ',N:'ᴺ',L:'ᴸ'};
const SUBL={j:'ⱼ',k:'ₖ',l:'ₗ',m:'ₘ',p:'ₚ',r:'ᵣ',s:'ₛ',t:'ₜ',u:'ᵤ',v:'ᵥ',e:'ₑ',h:'ₕ',o:'ₒ'};
const SAME={'⋅':'·','⟺':'⇔','⟹':'⇒','⟸':'⇐','⟶':'→','⟵':'←','ϕ':'φ','ϵ':'ε','◊':'◇','∑':'∑'};
const CAL={P:'𝒫',A:'𝒜',B:'ℬ',C:'𝒞',D:'𝒟',F:'ℱ',K:'𝒦',S:'𝒮',T:'𝒯',V:'𝒱',W:'𝒲'};
/* an infinity step's label (∞Φ, ∞ל‎ ...) names the step and is not a mark: Φ no longer shows on ∞Φ's page */
const unlabel=t=>String(t).replace(/∞(?!·)[^\s·.,;:)]‎?/g,' ');
function marksIn(text){
  const S=new Set(); text=unlabel(text);
  text.replace(/\\mathbb\s*\{?\s*([NZQRC])/g,(m,c)=>{ S.add({N:'ℕ',Z:'ℤ',Q:'ℚ',R:'ℝ',C:'ℂ'}[c]); return m; });
  text.replace(/\\mathcal\s*\{?\s*([A-Z])/g,(m,c)=>{ if(CAL[c]) S.add(CAL[c]); return m; });
  text.replace(/\\([A-Za-z]+)/g,(m,w)=>{ if(TEX[w]) S.add(TEX[w]); return m; });
  if(/\^/.test(text)) [...SUP].forEach(c=>S.add(c));
  if(/_[{\w]/.test(text)) [...SUB].forEach(c=>S.add(c));
  text.replace(/\^\{?([A-Za-z])/g,(m,c)=>{ if(SUPL[c]) S.add(SUPL[c]); return m; });
  text.replace(/_\{?([a-z])/g,(m,c)=>{ if(SUBL[c]) S.add(SUBL[c]); return m; });
  if(/\\frac|\\tfrac/.test(text)) S.add('⁄');
  if(/\blim\b/.test(text)) S.add('lim');
  for(const ch of text) if(ch!=='e') S.add(SAME[ch]||ch);
  if(/(^|[^A-Za-z\\])e(\^|[⁰¹²³⁴⁵⁶⁷⁸⁹ˣⁱᵗ⁻⁽ⁿᵏ])/.test(text)) S.add('e'); /* Euler's number: e raised to a power */
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
/* quickkeys (Andrew 2026-11-15 08:03Z, "unlocked at the right time"): a key opens at the first step that writes it and
   stays open after; the keys of the page you are on carry a dot. The map of which step writes which key is keymap.js. */
function stepReached(st){ const U=window.LadderUnlock; try{ if(LS.getItem('steps:'+st)!=null||LS.getItem('cert:'+st)) return true; }catch(e){}
  if(U&&U.reachedStep&&U.ready&&U.ready()&&!/^(inf|hist|dbt)/.test(st)) return U.reachedStep(st);
  try{ const P=JSON.parse(LS.getItem('pages:done')||'{}'); if(P[st]&&P[st].v) return true; }catch(e){} return false; }
function unlockedKeys(){
  if(window.LADDER_DESK) return new Set(LEAVES);
  const M=window.LADDER_KEYMAP; if(!M) return null;
  const S=new Set(); for(const st in M) if(stepReached(st)) for(const k of M[st].split(' ')) S.add(k);
  return S;
}
let mapAsked=false;
function askMap(){ if(window.LADDER_KEYMAP||mapAsked) return; mapAsked=true; const sc=document.createElement('script'); sc.src='keymap.js'; sc.onload=()=>{ drawKeys(); const U=window.LadderUnlock; if(U&&U.ready&&!U.ready()){ U.load(); setTimeout(drawKeys,1200); } }; document.head.appendChild(sc); }
function groupsFor(S){ /* the group buttons always show the same three marks, so the four look alike */
  return TREE.map(g=>{ const s=g.s.map((x,i)=>({h:x.h,c:(g.always&&i===0)?x.c:x.c.filter(k=>S.has(k))})).filter(x=>x.c.length); return s.length?Object.assign({},g,{s}):null; }).filter(Boolean); }
let limitTo=null, limitLabel='';
function drawKeys(){
  const here=limitTo||pageMarks(); let S;
  if(limitTo) S=limitTo; else { askMap(); const U=unlockedKeys(); S=new Set(here); if(U) U.forEach(k=>S.add(k)); }
  lastS=S; lastHere=limitTo?new Set():here; paint();
}
/* quickkeys 08:25Z (Andrew): a group button opens and closes its pane in place, under its row of buttons; each subset has
   its own button to open and close it. Subsets holding this page's keys start open; what you open or close is remembered. */
let secOpen={}; try{ secOpen=JSON.parse(LS.getItem('mathkeys-open')||'{}')||{}; }catch(e){}
const saveSec=()=>{ try{ LS.setItem('mathkeys-open',JSON.stringify(secOpen)); }catch(e){} };
function paint(){
  keys.innerHTML=''; const G=groupsFor(lastS), here=lastHere;
  if(openG&&!G.some(x=>x.n===openG)) openG=null;
  const grid=document.createElement('div'); grid.className='mk-grid';
  G.forEach((x,i)=>{ grid.appendChild(makeGroup(x,here));
    const rowEnd=(i%2===1)||i===G.length-1, g=G.find(y=>y.n===openG), gi=g?G.indexOf(g):-1;
    if(g&&rowEnd&&Math.floor(gi/2)===Math.floor(i/2)) grid.appendChild(makePane(g,here)); });
  keys.appendChild(grid);
  const n=document.createElement('p'); n.className='mk-scope';
  n.textContent=limitTo?'keys for '+limitLabel:'keys open so far · a dot marks the keys this page writes';
  keys.appendChild(n);
}
function makePane(g,here){
  const pane=document.createElement('div'); pane.className='mk-pane'; pane.id='mk-pane-'+g.n; pane.setAttribute('role','group'); pane.setAttribute('aria-label',g.n);
  g.s.forEach(x=>{ const id=g.n+'/'+x.h, sec=document.createElement('div'); sec.className='mk-sec';
    const isOpen=(id in secOpen)?secOpen[id]:(g.s.length===1||x.c.some(k=>here.has(k)));
    const row=document.createElement('div'); row.className='mk-row'; row.hidden=!isOpen; x.c.forEach(k=>row.appendChild(makeKey(k,here)));
    const h=document.createElement('button'); h.type='button'; h.className='mk-sh'+(x.c.some(k=>here.has(k))?' here':''); h.setAttribute('aria-expanded',String(isOpen));
    h.innerHTML=`<i>${isOpen?'▾':'▸'}</i><span></span><em>${x.c.length}</em>`; h.querySelector('span').textContent=x.h;
    h.addEventListener('click',()=>{ const v=row.hidden; row.hidden=!v; h.setAttribute('aria-expanded',String(v)); h.querySelector('i').textContent=v?'▾':'▸'; secOpen[id]=v; saveSec(); });
    sec.appendChild(h); sec.appendChild(row); pane.appendChild(sec); });
  return pane;
}
window.MathKeys={ limit(set,label){ limitTo=set&&[...set].length?new Set(set):null; limitLabel=label||''; drawKeys(); }, marksIn, open:v=>open(v), tree:TREE };
drawKeys();

// --- open / close ------------------------------------------------------------------------
function open(v){ root.classList.toggle('open',v); btn.setAttribute('aria-expanded',String(v)); if(v){ panel.hidden=false; btn.textContent='⌨ hide'; setTarget(editable(document.activeElement)?document.activeElement:target); } else { btn.textContent='⌨ keys'; setTimeout(()=>{ if(!root.classList.contains('open')) panel.hidden=true; },240); } }
btn.addEventListener('click',()=>open(!root.classList.contains('open')));
$('.mk-close').addEventListener('click',()=>open(false));
$('.mk-own').addEventListener('click',()=>{ setTarget(null); line.focus(); });
$('.mk-copy').addEventListener('click',()=>{ const done=()=>say('line copied'); const fb=()=>{ line.select(); try{ document.execCommand('copy'); done(); }catch(e){ say('select and copy by hand'); } }; if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(line.value).then(done).catch(fb); else fb(); });
$('.mk-clear').addEventListener('click',()=>{ line.value=''; saveLine(); say('cleared'); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ if(openG&&root.classList.contains('open')){ openG=null; paint(); } else if(root.classList.contains('open')) open(false); } });
setTarget(null);
})();
