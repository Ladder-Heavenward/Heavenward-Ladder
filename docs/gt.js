/* The squared circle: marks every paragraph, question and slide where a geometry transform happens
   (a slide, turn, flip or stretch of a picture or a point). Hover or long-press it to see which.
   The list is curated by hand from every page, so "flip the fraction" and "over a stretch of x" stay unmarked. */
(function(){
'use strict';
const page=(window.ladderPage?ladderPage()+'.html':(location.pathname.split('/').pop()||'index.html'));
const MARKS={
 'bite10b.html':[['swap the axes and it is','flip'],['A slope and its mirror slope','flip'],['The second dodge in the chapter','flip'],['what the mirror does to rise and run','flip']],
 'bite12.html':[['a quarter turn is a constant','turn'],['a spoke turned by a tiny angle','turn'],['he uses cos θ = sin(π/2 − θ)','turn'],['one wave slid alon','slide'],['cos θ = sin(π/2 − θ). What is the slope of the inside','turn']],
 'bite13.html':[['Here F and f are any two functions at all','slide'],['It is the wave equation','slide']],
 'bite18.html':[['Its solutions include y = f(x − at)','slide'],['In y = f(x − 2t), the peak','slide']],
 'review1.html':[['if the hill is lifted by a constant, and if it is doubled','slide · stretch']],
 'bite15.html':[['x⁴ + 7 and x⁴ − 2 have the same slope','slide'],['a slid-up cu','slide']],
 'bite17.html':[['that is the stretch','stretch'],['what substitution does to the strips','stretch']],
 'f10.html':[['a reflection across the diagonal line','flip'],['cannot be run backwards without a decision','flip'],['Same decision for a wave','flip'],['On the picture that is a mirror across the line','flip'],['why is that the same as reflecting it','flip']],
 'f12.html':[['Slide right by h','slide'],['Slide up by k','slide'],['The same slide on a circle','slide'],['The same slide on a line','slide'],['Turn a quarter','turn'],['The same quarter turn, seen on the angle','turn'],['the turn by any angle','turn'],['a minus on one coordinate','flip'],['swap the coordinates. That is F10','flip'],['from the origin. Lengths ×s','stretch'],['Slide the curve and its slope slides','slide'],['F12.2Slides.','slide'],['F12.3Turns.','turn'],['F12.4Flips.','flip'],['F12.5Stretches.','stretch']],
 'f2.html':[['are the whole alphabet','slide · stretch · flip'],['read the moves off the symbols','slide · stretch · flip'],['y = −(x + 1)² in words','slide · flip'],['Which face, slid where','slide'],['slid left by 1 and flipped over the floor','slide · flip']],
 'f4.html':[['Similar triangles keep their ratios','stretch']],
 'f8.html':[['The cos wave is the sin wave slid left','slide'],['scaled up (F4, similar triangles)','stretch']],
 'graphs.html':[['y = sin(θ + φ)','slide'],['y = csc(θ + φ)','slide'],['y = sin⁻¹x on its kept range','flip'],['y = cos⁻¹x on its kept range','flip'],['y = tan⁻¹x, for every x','flip']],
 'review2.html':[['Both cars move right at the same rate','slide'],['its twin point on the inverse','flip'],['by quadrant, reference angle and mirror','flip'],['Which mirror takes the spoke at 30°','flip'],['with the mirror that gives its height','flip']],
 's4.html':[['The circle equation (x − a)² + (y − b)²','slide'],['Problem 14 is the left-hand picture below','slide'],['The bowl x² slid right by 2','slide'],['So this is x² slid right 3','slide'],['which is f itself drawn','slide · stretch'],['the mirror of the whole bowl','flip'],['drawn as an arrow from the origin','slide'],['as (x-h)^2 + k','slide'],['then reflect it across the axe','flip'],['Swapping is F10','flip']],
 't1.html':[['similar triangles','stretch'],['the co-sine is the sine of the complement','turn']],
 't2.html':[['turned upside down','turn'],['tan(180° + θ) = tan θ','turn'],['Past a full turn, and the other way round','turn'],['How to find θ_ref in each quadrant','flip'],['flipped left to r','flip'],['This is also the vertical-axis mirror','flip'],['This is also the half-turn rule','turn'],['only flipped or turned','flip · turn'],['those four again after each quarter turn','turn'],['because the circle is symmetric','flip'],['Mirror in the vertical axis','flip'],['Mirror in the horizontal axis','flip'],['Doing both mirrors, one after the other','flip · turn'],['The reference angle and the mirrors are one fact','flip'],['sin(180° − θ) = sin θ says the sin wave','flip'],['is called periodic','turn'],['Which mirror takes the spoke at 60°','flip'],['by the mirror in the horizontal axis','flip'],['once by the horizontal mirror','flip'],['which mirror takes one to the other','flip'],['the mirror cos(','flip']],
 't4.html':[['T2: sin(−θ) = −sin θ','flip'],['if one is θ the other is 90° − θ','turn'],["use T2's two mirror facts",'flip'],['show that cos(90° − θ) = sin θ','turn']],
 't5.html':[['The trouble is that sin repeats','flip · turn'],['The mirror across the upright axis keeps the height','flip'],['the two points are mirror images','flip'],["the mirror of T3's sin x ≈ x",'flip']],
 'tangent.html':[['in the form y − y₀ = (slope)(x − a)','slide']]
};
const list=MARKS[page]; if(!list) return;
const css=document.createElement('style');
css.textContent=`.gtm{display:inline-block;width:.78em;height:.78em;border:1.6px solid var(--teal,#1f6f8b);border-radius:2px;position:relative;vertical-align:-.05em;margin-left:.4em;box-sizing:border-box;cursor:help}
.gtm::after{content:"";position:absolute;inset:1.2px;border:1.6px solid var(--teal,#1f6f8b);border-radius:50%}`;
document.head.appendChild(css);
const norm=t=>t.replace(/\s+/g,' ').replace(/\\"/g,'"');
function own(el){ const c=el.cloneNode(true); c.querySelectorAll('ol,ul,.gtm').forEach(x=>x.remove()); return norm(c.textContent); }
function badge(kind){ const b=document.createElement('span'); b.className='gtm'; b.title='geometry transform: '+kind; b.setAttribute('role','img'); b.setAttribute('aria-label','geometry transform: '+kind); return b; }
function mark(el){
  if(el.querySelector(':scope > .gtm')) return;
  const t=own(el);
  for(const [snip,kind] of list){ if(t.includes(snip)){ const sub=el.querySelector(':scope > ol, :scope > ul'); sub? el.insertBefore(badge(kind),sub) : el.appendChild(badge(kind)); return; } }
}
function scan(root){ root.querySelectorAll('p, li, .note, .cap span').forEach(el=>{ if(el.closest('#mk-tray,#desk')) return; mark(el); }); }
scan(document);
const sl=document.getElementById('slide');
if(sl) new MutationObserver(()=>scan(sl)).observe(sl,{childList:true,subtree:true});
})();
