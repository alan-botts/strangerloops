const phaseInput = document.getElementById('phase');
const travelerInput = document.getElementById('traveler');
const destinationInput = document.getElementById('destination');
const windowInput = document.getElementById('window');
const driInput = document.getElementById('dri');

const statusEl = document.getElementById('status');
const stampEl = document.getElementById('stamp');
const memorySentenceEl = document.getElementById('memorySentence');
const reminderTextEl = document.getElementById('reminderText');
const riskTextEl = document.getElementById('riskText');
const driNameEl = document.getElementById('driName');
const continuityTestEl = document.getElementById('continuityTest');
const ticketEl = document.querySelector('.ticket');

const phases = [
  {
    key: 'upcoming',
    status: 'Upcoming',
    stamp: 'Scheduled',
    sentence: (t, d, w) => `${t} are going to ${d} in ${w}.`,
    reminder: (d) => `Nudge before decisions that depend on ${d}: packing, timing, recommendations, scheduling.`,
    risk: (d) => `If the system forgets the trip now, it wastes the future in small stupid ways.`,
    continuity: 'Does the reminder arrive before the hinge?'
  },
  {
    key: 'inflight',
    status: 'In flight',
    stamp: 'Live context',
    sentence: (t, d, w) => `${t} are in ${d} right now during ${w}.`,
    reminder: (d) => `Keep ${d} close to the decision surface; this is live context, not archival trivia.`,
    risk: () => `If the system still talks like the trip is merely upcoming, it is already acting one tense behind reality.`,
    continuity: 'Is the right state present while action happens?'
  },
  {
    key: 'landed',
    status: 'Landed',
    stamp: 'Settled history',
    sentence: (t, d, w) => `${t} went to ${d} in ${w}.`,
    reminder: () => `Stop nudging as if the event is pending; preserve it as history, not unfinished business.`,
    risk: () => `If the system never rewrites this line, memory becomes a polite hallucination.`,
    continuity: 'Did the system revise the record when time moved?'
  }
];

function render() {
  const phase = phases[Number(phaseInput.value)] || phases[0];
  const traveler = travelerInput.value.trim() || 'You';
  const destination = destinationInput.value.trim() || 'Singapore';
  const windowText = windowInput.value.trim() || 'July 2026';
  const dri = driInput.value.trim() || 'Kyle';

  ticketEl.classList.remove('upcoming', 'inflight', 'landed');
  ticketEl.classList.add(phase.key);

  statusEl.textContent = phase.status;
  stampEl.textContent = phase.stamp;
  memorySentenceEl.textContent = phase.sentence(traveler, destination, windowText);
  reminderTextEl.textContent = phase.reminder(destination, windowText);
  riskTextEl.textContent = phase.risk(destination, windowText);
  driNameEl.textContent = dri;
  continuityTestEl.textContent = phase.continuity;
}

[phaseInput, travelerInput, destinationInput, windowInput, driInput].forEach((input) => {
  input.addEventListener('input', render);
});

render();
