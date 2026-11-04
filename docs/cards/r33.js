/* flash cards, rung 33. */
(window.LADDER_CARDS=window.LADDER_CARDS||{})['33a']=[
 {q:'A line reads u_t = κu_xx for the temperature in a thin rod. What is the rule called on the page?', a:'the heat rule', w:['the string’s rule','the still-state rule','the carried-along rule'], why:'One slope in time against the second slope in space: heat-rule technique.'},
 {q:'In u_t = κu_xx, κ = K/(ρc). What is K?', a:'how freely heat runs down the slope', w:['the heat held per degree','the density of the rod','the length of the rod'], why:'The flow is −K u_x, the first measured law.'},
 {q:'A line reads ρc u_t = K u_xx + q. What does q stand for?', a:'heat made inside, per cubic metre per second', w:['heat lost at the ends','the start temperature','the flow across the rod'], why:'The ledger: where the books do not close, something makes heat.'},
 {q:'u = e^(−4κπ²t/L²) sin(2πx/L) on a rod with ends at 0. What is it?', a:'a cooling shape with n = 2', w:['a fading series','a string tone','a still state'], why:'Cooling-shape technique: e^(−κ(nπ/L)²t) sin(nπx/L).'},
 {q:'A line reads T′/(κT) = X″/X = −λ. Why is it one number?', a:'one side depends only on t, the other only on x', w:['both sides are 0','the ends are held at 0','the start is a sine'], why:'Fix t and move x: the left side does not change, so neither does the right.'},
 {q:'Which cooling shape fades fastest: n = 1, 2 or 3?', a:'n = 3', w:['n = 1','n = 2','they fade together'], why:'The rate κ(nπ/L)² grows as n².'},
 {q:'A line reads u = Σ b_n e^(−κ(nπ/L)²t) sin(nπx/L), with Σ|b_n| settling. Which technique licenses it?', a:'fading-series', w:['cooling-shape','heat-rule','one-future'], why:'A settling sum of cooling shapes solves the rule and matches the start.'},
 {q:'Start u(x, 0) = 3 sin(πx/L). What is b_1?', a:'3', w:['3/π','6/L','0'], why:'The start is already one shape; its sine coefficient is its amount.'},
 {q:'A claim: “every answer of the heat rule is X(x)T(t).” Is it allowed?', a:'no: sums of products are answers too', w:['yes: separation found every answer','yes: the rule is linear','no: X must be a cosine'], why:'Separation finds only the products; the sum of two shapes is not one.'},
 {q:'A solid block obeys u_t = κΔu. What is Δu?', a:'the spread of the uphill arrow of u', w:['the uphill arrow of u','the second slope in time','the swirl of u'], why:'Δu = u_xx + u_yy + u_zz, the spread of ∇u.'}
];
(window.LADDER_CARDS=window.LADDER_CARDS||{})['33b']=[
 {q:'The rectangle 0 ≤ x ≤ L, 0 ≤ t ≤ T. Which part is the lid?', a:'t = T', w:['t = 0','x = 0','x = L'], why:'The floor is the start; the walls are the ends.'},
 {q:'A heat answer on R. Where is its greatest value taken?', a:'on the floor or the walls', w:['on the lid','inside R','at the middle of the floor'], why:'Hottest-at-the-edge technique.'},
 {q:'Why add the tilt εx² in the hottest-at-the-edge proof?', a:'to make v_t − κv_xx below 0', w:['to make v balanced','to make the ends 0','to make v a cooling shape'], why:'A flat greatest point would give no clash; the tilt makes one.'},
 {q:'Two answers, same start, same ends. What licenses “they are equal”?', a:'one-future', w:['fading-series','hottest-at-the-edge','forgetting'], why:'Apply the edge technique to their difference and its negative.'},
 {q:'Φ = e^(−x²/(4κt))/√(4πκt). What is its total along the line?', a:'1, at every t', w:['4κt','0','it grows with t'], why:'Spreading-bell technique: a bell with total 1.'},
 {q:'The spreading bell at time t has what spread?', a:'2κt', w:['κt','√(2κt)','4πκt'], why:'Spreading-bell technique; the width is √(2κt).'},
 {q:'A start with frequency k, on the whole line. By what is it multiplied by time t?', a:'e^(−κk²t)', w:['e^(−κkt)','cos(κk²t)','e^(κk²t)'], why:'The transform of the bell; high frequencies fade first.'},
 {q:'A line reads |u| ≤ (Σ|b_n|)e^(−κπ²t/L²). Which technique licenses it?', a:'forgetting', w:['spreading-bell','one-future','cooling-shape'], why:'The first shape fades slowest, and it sets the bound.'},
 {q:'A claim: “run the fading series with t < 0 to find the past.” Is it allowed?', a:'no: the factors grow without bound in n', w:['yes: the rule runs both ways','yes, if Σ|b_n| settles','no: the ends are not 0'], why:'A tiny wiggle now is a huge one in the past.'},
 {q:'A start jumps from 0 to 100. At t = 0.001 s, is the answer continuous?', a:'yes, with a slope at every point', w:['no: the jump is kept','only away from the jump','only if κ is large'], why:'The middle of a change, at once: the bell smooths every jump.'}
];
(window.LADDER_CARDS=window.LADDER_CARDS||{})['33c']=[
 {q:'A line reads y_tt = c²y_xx for a stretched string. What is c?', a:'√(T/ρ)', w:['T/ρ','√(ρ/T)','Tρ'], why:'String-rule technique.'},
 {q:'Which slope in time does the string’s rule have?', a:'the second: an acceleration', w:['the first: a rate','none','the third'], why:'Heat has a first slope in time; the string a second.'},
 {q:'y = sin(x − 3t). What is it?', a:'a shape running right at speed 3', w:['a shape running left at speed 3','a standing tone','a cooling shape'], why:'Two-waves technique: F(x − ct) runs right.'},
 {q:'A line reads y = F(x − ct) + G(x + ct). Which technique licenses it?', a:'two-waves', w:['string-tones','kept-energy','string-rule'], why:'Every answer on the line is two running shapes.'},
 {q:'The height at x = 5 at t = 2, with c = 1. Which part of the start does it use?', a:'only [3, 7]', w:['only the point 5','the whole line','only [5, 7]'], why:'The answer uses the start within ct of x.'},
 {q:'A tied string has lowest tone 110 Hz. What is its third tone?', a:'330 Hz', w:['220 Hz','990 Hz','146.7 Hz'], why:'String-tones technique: whole multiples nc/(2L).'},
 {q:'A string of length 0.65 m, c = 429 m/s. Its lowest tone?', a:'about 330 Hz', w:['about 660 Hz','about 279 Hz','about 165 Hz'], why:'c/(2L) = 429/1.3.'},
 {q:'E = ½∫(ρy_t² + Ty_x²). What does kept-energy say?', a:'E is the same at every time', w:['ρy_t² is the same at every time','E fades like a cooling shape','E doubles each swing'], why:'The ends are tied, so the end terms vanish.'},
 {q:'A claim: “the energy of motion ½∫ρy_t² is kept.” Is it allowed?', a:'no: it trades with the energy of stretch', w:['yes: by the kept-energy technique','yes, for a tied string','no: energy fades'], why:'Only the sum is kept.'},
 {q:'A plucked string at its middle. Which tones are missing?', a:'the even ones', w:['the odd ones','none','all but the first'], why:'Each even tone is still at the middle, where the pluck is.'}
];
(window.LADDER_CARDS=window.LADDER_CARDS||{})['33d']=[
 {q:'u = x² − y². Is it balanced?', a:'yes: u_xx + u_yy = 2 − 2 = 0', w:['no: it is not a sine','no: it grows without bound','only on the unit disc'], why:'Balanced means Δu = 0.'},
 {q:'u = x² + y². Is it balanced?', a:'no: Δu = 4', w:['yes: it is round','yes, away from 0','only at 0'], why:'Δu = 2 + 2.'},
 {q:'u is the real part of (x + iy)³. What licenses “u is balanced”?', a:'real-part', w:['circle-average','disc-series','edge-rules-inside'], why:'Every function with a complex slope has balanced real and imaginary parts.'},
 {q:'A line reads u_x = v_y, u_y = −v_x. Where does it come from?', a:'the complex slope is the same both ways', w:['the circle average','the tilt','the disc series'], why:'Rung 26’s rigid slopes.'},
 {q:'u is balanced on a disc of radius 3 about 0. What is u(0)?', a:'its average round the circle of radius 2', w:['its greatest value on the disc','half its value at the rim','0'], why:'Circle-average technique, for every circle inside.'},
 {q:'u is balanced on a disc, between 2 and 7 on its rim. What can u be at the centre?', a:'any value between 2 and 7', w:['exactly 4.5','more than 7','less than 2'], why:'Edge-rules-inside: greatest and least on the edge.'},
 {q:'Two balanced functions, equal on the edge of D. Which technique says they are equal in D?', a:'one-still-state', w:['one-future','edge-rules-inside','circle-average'], why:'Their difference is balanced and 0 on the edge.'},
 {q:'Rim values cos 3θ on the unit disc. What is the balanced function?', a:'r³ cos 3θ', w:['cos 3θ','r cos 3θ','3r cos θ'], why:'Disc-series: each wiggle of n turns is multiplied by rⁿ.'},
 {q:'A claim: “ln r is balanced, so its value at 0 is its average round the unit circle.” Is it allowed?', a:'no: ln r is not balanced at 0', w:['yes: by circle-average','yes: the average is 0','no: ln r is not continuous on the rim'], why:'The circle and its inside must lie where u is balanced.'}
];
(window.LADDER_CARDS=window.LADDER_CARDS||{})['33e']=[
 {q:'u_t + 4u_x = 0 from start f. What is u?', a:'f(x − 4t)', w:['f(x + 4t)','f(4x − t)','4f(x − t)'], why:'Carried-along technique.'},
 {q:'A path with x′(t) = a(x(t), t). What is it called?', a:'a riding path', w:['a jump','a cooling shape','a running shape'], why:'Along it, u does not change.'},
 {q:'u_t + uu_x = 0. Why are its riding paths straight?', a:'u does not change on them, and u is their speed', w:['the rule is linear','u is 0 on them','they start at the jumps'], why:'Constant speed means a straight line.'},
 {q:'Start f with greatest −f′ equal to 2. When does u_t + uu_x = 0 break?', a:'t = 1/2', w:['t = 2','t = 1','never'], why:'Breaking-time technique: t = 1/m.'},
 {q:'u_t + (u²/2)_x = 0, a jump from 4 to 2. Its speed?', a:'3', w:['2','4','6'], why:'Jump-speed: [q]/[u] = (8 − 2)/2, the average of the two sides.'},
 {q:'A line reads s′ = (q(u_L) − q(u_R))/(u_L − u_R). Which technique licenses it?', a:'jump-speed', w:['breaking-time','riding-path','carried-along'], why:'The books kept across a jump.'},
 {q:'Why can a jump be allowed at all?', a:'books are totals, and totals exist across a jump', w:['slopes exist at a jump','the rule is linear','the start has a corner'], why:'The slope rule fails at the jump; the books do not.'},
 {q:'Cars at 30 a km meet a stopped queue. The back of the queue moves at −20 km/h. Which way?', a:'backward, toward the oncoming cars', w:['forward, with the cars','it stays still','forward at 80 km/h'], why:'A jump moves at [q]/[ρ], not with the cars.'},
 {q:'A claim: “after t = 1/m, take both values where paths cross.” Is it allowed?', a:'no: a function has one value at each point', w:['yes: the paths say so','yes, until the jump forms','no: the paths stop'], why:'The books choose a jump instead.'}
];
(window.LADDER_CARDS=window.LADDER_CARDS||{})['33f']=[
 {q:'y and z are 0 at both ends. A line reads ⟨−y″, z⟩ = ⟨y, −z″⟩. Which technique licenses it?', a:'swap-by-parts', w:['perpendicular-shapes','single-kick','kick-in-shapes'], why:'By parts twice; the end terms vanish.'},
 {q:'−y″ = λy, y(0) = y(1) = 0, y ≠ 0. What is y called?', a:'a shape, with number λ', w:['a kick answer','a still state','a riding path'], why:'A shape of L, as an arrow that L only stretches.'},
 {q:'sin(πx) and sin(3πx) on [0, 1]. Why is their total product 0?', a:'they are shapes with different numbers', w:['both are 0 at the ends','they are odd','their tones are whole multiples'], why:'Perpendicular-shapes technique.'},
 {q:'G(x, s) for −y″ = h on [0, 1]. What does it look like?', a:'a tent with its peak at s', w:['a bell centred at s','a sine arch','a step at s'], why:'The string pushed by one kick.'},
 {q:'What is the peak of G(·, s) on [0, 1]?', a:'s(1 − s)', w:['s','1/4','s²'], why:'G(s, s) = s(1 − s).'},
 {q:'A line reads y(x) = ∫₀¹ G(x, s)h(s) ds. Which technique licenses it?', a:'single-kick', w:['kick-in-shapes','swap-by-parts','perpendicular-shapes'], why:'Every load is a total of kicks.'},
 {q:'G(x, s) = Σ 2 sin(nπx) sin(nπs)/(n²π²). What is each n²π²?', a:'a shape’s number', w:['a tone','a cooling rate','a spread'], why:'Kick-in-shapes: divide by each number.'},
 {q:'A claim: “⟨Ly, z⟩ = ⟨y, Lz⟩ for every y, z, whatever their ends.” Is it allowed?', a:'no: the end terms need not vanish', w:['yes: L is symmetric','yes, if q ≥ 0','no: L has no shapes'], why:'With y = x², z = 1: −2 against 0.'},
 {q:'A string of length 1, tension 1, even load 1. Its sag at the middle?', a:'1/8', w:['1/4','1/2','1/90'], why:'y = x(1 − x)/2.'}
];
(window.LADDER_CARDS=window.LADDER_CARDS||{})['33g']=[
 {q:'A line reads Δu = u_rr + u_r/r + u_θθ/r². Which technique licenses it?', a:'round-rate', w:['round-ball','drum-shape','real-part'], why:'The rule rewritten in reach and turn.'},
 {q:'Why must m be whole in cos(mθ − θ₀)?', a:'the shape must come back after a full turn', w:['J_m needs whole m','the rim is tied','the tone must be whole'], why:'θ and θ + 2π are the same point.'},
 {q:'A drum of radius R is tied at its rim. What fixes k?', a:'J_m(kR) = 0', w:['J_m(0) = 0','kR = π','k = m'], why:'Drum-shape technique.'},
 {q:'The first two round tones of a drum. Their ratio?', a:'between 2.28 and 2.31', w:['exactly 2','exactly 3','between 1.5 and 1.6'], why:'Unharmonic-drum technique.'},
 {q:'Two running totals of J₀(2.40) in a row are 0.00292 and 0.00249. What follows?', a:'J₀(2.40) is above 0', w:['J₀(2.40) is 0.0027','J₀ has a zero at 2.40','nothing, without more terms'], why:'Two totals in a row bracket an alternating sum (22g).'},
 {q:'A claim: “a table prints 5.520/2.405 = 2.295, so the ratio is proved not whole.” Is it allowed?', a:'no: a printed number is a rounding', w:['yes: 2.295 is not whole','yes, to three places','no: the ratio is 2'], why:'Bounds make it a proof.'},
 {q:'u depends only on r in space. A line reads Δu = (1/r)(rU)″. Which technique?', a:'round-ball', w:['round-rate','drum-shape','shell-flux'], why:'With w = rU, the ball becomes a rod.'},
 {q:'A ball held at 0 on its skin. What are its cooling shapes?', a:'sin(nπr/R)/r', w:['sin(nπr/R)','J₀(kr)','cos(nπr/R)'], why:'w = rU obeys the rod’s rule.'},
 {q:'Is a drum’s second round tone a whole multiple of its first?', a:'no', w:['yes: twice','yes: three times','only for a small drum'], why:'The ratio lies strictly between 2.28 and 2.31.'}
];
(window.LADDER_CARDS=window.LADDER_CARDS||{})['33h']=[
 {q:'A rod with u_x = 0 at both ends. What is it called on the page?', a:'sealed', w:['held at 0','tied','free'], why:'No heat crosses a sealed end.'},
 {q:'A sealed rod started at f. What never changes?', a:'its average temperature', w:['its greatest temperature','its temperature at the middle','its slope at the ends'], why:'Sealed-rod technique.'},
 {q:'A sealed rod: which functions are its shapes?', a:'cos(nπx/L), n = 0, 1, 2, …', w:['sin(nπx/L)','cos(nπx/(2L))','e^(nπx/L)'], why:'Slope 0 at both ends.'},
 {q:'Ends at A = 20 and B = 80 on a rod of length 1. What is the still line?', a:'20 + 60x', w:['80 − 60x','50','20x + 80'], why:'Shift-to-the-line: the straight line between the ends.'},
 {q:'A line reads w = u − s, with ends 0. Which technique licenses it?', a:'shift-to-the-line', w:['sealed-rod','warm-edge','fading-series'], why:'Take the still line away first.'},
 {q:'A plate, three edges at 0, the top edge at g(x). What does each shape do?', a:'grows from the bottom edge toward the top', w:['fades in time','swings in time','runs to the right'], why:'sinh(nπy/W)/sinh(nπH/W).'},
 {q:'A square plate, one edge at 100, three at 0. Its centre value?', a:'25', w:['50','100/π','33.3'], why:'Four quarter turns add to 100 everywhere.'},
 {q:'A claim: “with ends at 100 and 0, separate u into sines directly.” Is it allowed?', a:'no: sines are 0 at both ends', w:['yes: by the fading series','yes: the rule is linear','no: use cosines'], why:'Take the still line away first.'},
 {q:'A line reads u = Σ b_n sin(nπx/W) sinh(nπy/W)/sinh(nπH/W). Which technique?', a:'warm-edge', w:['shift-to-the-line','disc-series','cooling-shape'], why:'A still state separated on a plate.'}
];
(window.LADDER_CARDS=window.LADDER_CARDS||{})['33i']=[
 {q:'A line reads (y(x + h) − 2y(x) + y(x − h))/h² ≈ y″(x). What licenses the error bound Mh²/12?', a:'second-quotient', w:['grid-average','four-neighbour','grid-reach'], why:'The odd slopes cancel.'},
 {q:'Halve the gap h. By how much does the error of the second quotient fall?', a:'about four times', w:['about two times','not at all','about eight times'], why:'The error goes as h².'},
 {q:'κ = 1, h = 0.1, Δt = 0.004. What is r?', a:'0.4', w:['0.04','4','0.25'], why:'r = κΔt/h².'},
 {q:'r = 0.4. Is the heat grid safe?', a:'yes: each new value is an average', w:['no: r must be below ¼','no: the zigzag grows','only for a short rod'], why:'Grid-average technique, r ≤ ½.'},
 {q:'r = 0.6, start (−1)ʲε. What happens to it each tick?', a:'multiplied by −1.4', w:['multiplied by 0.6','halved','unchanged'], why:'Zigzag technique: 1 − 4r.'},
 {q:'A grid for the string with σ = cΔt/h = 1.2. What licenses “it fails”?', a:'grid-reach', w:['zigzag','grid-average','second-quotient'], why:'The wave outruns the grid’s news.'},
 {q:'A grid still state on a plate: each inside value is what?', a:'the average of its four neighbours', w:['the average of its eight neighbours','the greatest neighbour','the edge value'], why:'Four-neighbour technique.'},
 {q:'A claim: “halve the gap, keep the tick, and the heat grid gets better.” Is it allowed?', a:'no: r grows four times', w:['yes: the error falls','yes, if r was ½','no: the error doubles'], why:'Halving h multiplies r by 4.'},
 {q:'Two runs at h and h/2 agree to the first figure. What does that say?', a:'the first figure is earned', w:['every figure is earned','the grid is too coarse','nothing'], why:'The cloud, on a grid: width by comparing runs.'}
];
(window.LADDER_CARDS=window.LADDER_CARDS||{})['33j']=[
 {q:'A line reads Δφ = 4πGρ. What is φ?', a:'the potential of gravity', w:['the density','the pull','the temperature'], why:'The pull is −∇φ.'},
 {q:'A planet whose density depends only on r. Its pull at r?', a:'GM(r)/r², toward the centre', w:['GM/r², toward the centre','GM(r)/r, outward','0'], why:'Shell-flux technique: only the mass within r.'},
 {q:'Inside an even ball, halfway to the centre. Its pull against the surface pull?', a:'half', w:['four times','a quarter','the same'], why:'Inside-pull technique: g_R r/R.'},
 {q:'A stone dropped down a tunnel through an even earth. How long to the far side?', a:'about 42 minutes', w:['about 84 minutes','about 21 minutes','it never arrives'], why:'Half a swing of period 2π√(R/g).'},
 {q:'Φ = −1/(4π|x|). What is the flux of ∇Φ out of every sphere about 0?', a:'1', w:['0','4π','1/(4π)'], why:'Point-source technique.'},
 {q:'A line reads φ(x) = ∫Φ(x − y)f(y) dy. What is it built from?', a:'shifted point sources', w:['cooling shapes','riding paths','kick answers on a string'], why:'A spread of sources is a total of point sources.'},
 {q:'A pipe’s radius is halved, the push kept. The flow?', a:'falls sixteen times', w:['falls four times','halves','falls eight times'], why:'Pipe-flow technique: Q ∝ R⁴.'},
 {q:'Speed across a pipe w = G(R² − r²)/(4μ). What shape is it?', a:'a parabola', w:['a bell','a straight line','a sine arch'], why:'Pipe-flow technique.'},
 {q:'A claim: “inside the earth the pull is GM/r², stronger nearer the centre.” Is it allowed?', a:'no: only the mass within r pulls', w:['yes: by shell-flux','yes, for an even earth','no: the pull is constant'], why:'Inside an even earth the pull is GMr/R³.'}
];
(window.LADDER_CARDS=window.LADDER_CARDS||{})['33·then']=[
 {q:'A surface swings as A cos ωt. What is the swing at depth x?', a:'A e^(−x/d) cos(ωt − x/d)', w:['A cos(ωt − x/d)','A e^(−x/d) cos ωt','A e^(−x²/d²)'], why:'Ground-wave technique.'},
 {q:'d = √(2κ/ω). The period is made 100 times longer. What happens to d?', a:'ten times larger', w:['100 times larger','ten times smaller','unchanged'], why:'d grows as the root of the period.'},
 {q:'At depth πd, what is the swing’s timing against the surface’s?', a:'half a cycle late: the seasons reversed', w:['the same','a quarter cycle late','a full cycle late'], why:'The lag is x/d radians.'},
 {q:'A line reads τV_t = λ²V_xx − V. What is it?', a:'the leaky cable rule', w:['the heat rule','the string’s rule','the price rule'], why:'Leaky-cable technique.'},
 {q:'A fibre held at V₀ at one end. Its settled voltage at distance 2λ?', a:'V₀e^(−2)', w:['V₀/2','V₀e^(−1/2)','0'], why:'Leaky-cable: V₀e^(−x/λ).'},
 {q:'A pumped well, settled. Why is r h′ the same at every r?', a:'the same flow crosses every circle', w:['the water table is flat','h is balanced on a disc','the pump is steady'], why:'Well-drawdown technique: 2πrTh′ = Q.'},
 {q:'A puff of smoke in a steady wind. How does its width grow?', a:'as the root of time', w:['in proportion to time','as time squared','not at all'], why:'Drifting-bell: the spreading bell, carried.'},
 {q:'With S = eˣ and τ = T − t, the price rule becomes what?', a:'the heat rule, run forward in τ', w:['the string’s rule','a still-state rule','a carried-along rule'], why:'Price-to-heat technique.'},
 {q:'A particle in a box. Its levels against the lowest?', a:'1, 4, 9, 16', w:['1, 2, 3, 4','1, 2, 4, 8','1, 3, 5, 7'], why:'Box-levels: E_n ∝ n².'},
 {q:'A claim: “the ground 7 m down is coldest a little after the surface.” Is it allowed?', a:'no: it lags by about half a year', w:['yes: by the ground-wave','yes, for dry soil','no: it does not swing'], why:'At 7 m the lag is about 3 radians.'}
];
(window.LADDER_CARDS=window.LADDER_CARDS||{})['33·cb29']=[
 {q:'Inside a freely falling room, a dropped ball. How does it move against the room?', a:'it floats, as with no field', w:['it falls at 9.8 m/s²','it rises','it falls at half speed'], why:'Falling-room technique.'},
 {q:'Two balls at the two ends of a large falling room above the earth. What do they do?', a:'drift toward each other', w:['stay put','fall out of the floor','drift apart sideways'], why:'The field points to the centre: the room is good only near its middle.'},
 {q:'ds² = (1 + 2φ/c²)c²dt² − dx². Slow paths that make clock time greatest obey what?', a:'x″ = −∇φ', w:['x″ = 0','Δφ = 0','x′ = c'], why:'Slow-ruler technique.'},
 {q:'In a slow field, gravity’s full rule comes down to which rule?', a:'Δφ = 4πGρ', w:['u_t = κΔu','y_tt = c²y_xx','Δφ = 0 everywhere'], why:'The still-state rule with a source (33j).'},
 {q:'r_s = 2GM/c² for the sun is about what?', a:'3 km', w:['3 m','3000 km','9 mm'], why:'Star-ruler technique: about 2.95 km.'},
 {q:'A ray grazes the sun. Its turn?', a:'about 1.75″', w:['about 0.87″','about 1.75°','none'], why:'Light-bend: 4GM/(c²b).'},
 {q:'Which half of the light’s turn comes from the time part of the ruler?', a:'2GM/(c²b), as a falling stone', w:['all of it','none of it','4GM/(c²b)'], why:'The space part gives the other half.'},
 {q:'A claim: “light falls like a stone, so it bends by 2GM/(c²b).” Is it allowed?', a:'no: that is half the bend', w:['yes: by the falling room','yes, for slow light','no: light does not bend'], why:'The space part of the ruler doubles it.'},
 {q:'H ≈ 70 km/s per megaparsec, matter only, k = 0. The age 2/(3H)?', a:'about 9.3 billion years', w:['about 14 billion years','about 4.6 billion years','about 93 billion years'], why:'Expanding-ball technique.'},
 {q:'A line reads (R′/R)² = (8πG/3)ρ − k/R². Which technique?', a:'expanding-ball', w:['star-ruler','slow-ruler','shell-flux'], why:'An even universe, gravity slow on the scale of a ball.'}
];
