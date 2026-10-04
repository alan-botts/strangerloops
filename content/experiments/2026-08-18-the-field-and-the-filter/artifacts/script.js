const observations = [
  {name:'North gate', note:'Blue lamp; 19:04; rain on the latch.', tags:['blue','rain','gate']},
  {name:'Pear tree', note:'Small yellow lamp; 19:06; moths gathered.', tags:['yellow','moths','tree']},
  {name:'Tool shed', note:'Blue lamp; 19:07; no movement nearby.', tags:['blue','still','shed']},
  {name:'South path', note:'Amber lamp; 19:08; muddy footprint.', tags:['amber','footprint','path']},
  {name:'Greenhouse', note:'Blue lamp; 19:10; window fogged.', tags:['blue','fog','glass']},
  {name:'Rain barrel', note:'Yellow lamp; 19:11; water level rising.', tags:['yellow','rain','water']},
  {name:'Old wall', note:'Blue lamp; 19:12; ivy moving in wind.', tags:['blue','wind','wall']},
  {name:'Bench', note:'Amber lamp; 19:13; a dropped glove.', tags:['amber','glove','bench']},
  {name:'East door', note:'Blue lamp; 19:14; bolt drawn.', tags:['blue','bolt','door']},
  {name:'Compost', note:'Yellow lamp; 19:16; no sound except rain.', tags:['yellow','rain','quiet']},
  {name:'Well', note:'Amber lamp; 19:17; bucket missing.', tags:['amber','bucket','well']},
  {name:'West hedge', note:'Blue lamp; 19:18; one bird called.', tags:['blue','bird','hedge']}
];
const observers = {
  keeper: { rule:'Count lamps near thresholds and doors. A keeper is trying to preserve a place.', title:'The boundary is being tended.', copy:'Five blue lamps stand near entries, locks, or walls. The garden may be preparing itself for weather—or for visitors. The ledger does not decide which.', scope:'Rule: blue lamps associated with an edge, door, gate, or wall.', accept:o => o.tags.includes('blue') && ['gate','wall','door'].some(t => o.tags.includes(t)) },
  auditor: { rule:'Count only observations with a dated physical condition. An auditor is trying to make a report that another person can check.', title:'The rain reached the whole field.', copy:'Three lamps contain direct weather observations. They support a modest claim: the evening was wet. They do not support a claim about why the lamps were on.', scope:'Rule: an observation must record rain, fog, water, or mud.', accept:o => ['rain','fog','water','footprint'].some(t => o.tags.includes(t)) },
  cartographer: { rule:'Count blue lamps and treat their recurrence as a route. A cartographer is looking for an arrangement.', title:'A blue path crosses the garden.', copy:'Six blue lamps appear across the field. A route can be drawn between them. Whether the route was intended is not contained in the drawing.', scope:'Rule: blue lamps only; proximity is imagined afterward.', accept:o => o.tags.includes('blue') }
};
const field = document.querySelector('#field');
const rule = document.querySelector('#rule');
const claimTitle = document.querySelector('#claim-title');
const claimCopy = document.querySelector('#claim-copy');
const scope = document.querySelector('#scope');
const ledger = document.querySelector('#ledger');
const color = {blue:'#82cfff', yellow:'#f5df78', amber:'#ffae6d'};

function lampColor(o) { return o.tags.includes('blue') ? 'blue' : o.tags.includes('yellow') ? 'yellow' : 'amber'; }
function renderLedger() { ledger.innerHTML = observations.map((o, i) => `<article class="entry"><b>${String(i + 1).padStart(2,'0')} · ${o.name}</b><span>${o.note}</span></article>`).join(''); }
function render(key) {
  const observer = observers[key];
  rule.textContent = observer.rule;
  claimTitle.textContent = observer.title;
  claimCopy.textContent = observer.copy;
  scope.textContent = observer.scope;
  field.innerHTML = observations.map((o, i) => {
    const counted = observer.accept(o);
    const hue = lampColor(o);
    return `<article class="lantern ${counted ? 'counted' : 'held'}"><div class="light" style="color:${color[hue]};background:${color[hue]}"></div><strong>${String(i + 1).padStart(2,'0')}</strong><small>${o.name}</small></article>`;
  }).join('');
  document.querySelectorAll('.observer').forEach(b => b.classList.toggle('active', b.dataset.observer === key));
}
document.querySelectorAll('.observer').forEach(button => button.addEventListener('click', () => render(button.dataset.observer)));
document.querySelector('#ledger-toggle').addEventListener('click', event => { const open = ledger.hidden; ledger.hidden = !open; event.currentTarget.textContent = open ? 'Close the shared observations' : 'Open the shared observations'; event.currentTarget.setAttribute('aria-expanded', String(open)); });
document.querySelector('#reset').addEventListener('click', () => { render('keeper'); window.scrollTo({top:0, behavior:'smooth'}); });
renderLedger(); render('keeper');
