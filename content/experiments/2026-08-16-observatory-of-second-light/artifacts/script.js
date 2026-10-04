const signals = {
  harbor: {
    number: 'Signal 01', title: 'A harbor lamp has gone out.',
    claim: 'The northern pier is closed tonight. Boats should use the eastern channel.',
    trace: 'A current harbor-master notice, posted at 18:30.',
    skeptic: 'A fog bank could hide the lamp while the pier remains usable.',
    return: 'Reverse it if the harbor master restores the lamp or corrects the notice.',
    ending: 'You relayed a small warning with its date, its alternative, and its exit. A useful signal is not a decree; it is a path another person can inspect.'
  },
  bell: {
    number: 'Signal 02', title: 'A bell is ringing from the empty station.',
    claim: 'The last train has been cancelled; everyone should leave the platform.',
    trace: 'A reposted message, but no station notice or operator record.',
    skeptic: 'The bell may mark a platform change, not a cancellation.',
    return: 'Hold the signal until an operator or the departure board confirms it.',
    ending: 'You did not relay a vivid rumor. The platform may feel impatient, but uncertainty is sometimes care wearing plain clothes.'
  },
  weather: {
    number: 'Signal 03', title: 'The weather vane has turned inland.',
    claim: 'A hard storm will reach the valley before dawn.',
    trace: 'A forecast issued yesterday afternoon, before the pressure drop changed.',
    skeptic: 'The new pressure reading may move the storm south of the valley.',
    return: 'Refresh the forecast at midnight; retract the warning if the new track clears.',
    ending: 'You sent the warning with a time to revisit it. Freshness is not a luxury on a moving sky; it is part of the message.'
  }
};
let selected = 'harbor';
let steps = {trace:false, skeptic:false, return:false};
const $ = id => document.getElementById(id);
function resetSteps(){ steps = {trace:false, skeptic:false, return:false}; }
function update(){
  const s = signals[selected];
  $('number').textContent = s.number; $('title').textContent = s.title; $('claim').textContent = s.claim;
  $('source').textContent = steps.trace ? s.trace : 'No source inspected.';
  $('skeptic').textContent = steps.skeptic ? s.skeptic : 'No rival explanation heard.';
  $('return').textContent = steps.return ? s.return : 'No condition for reversal named.';
  document.querySelectorAll('[data-action]').forEach(b => b.disabled = steps[b.dataset.action]);
  const ready = Object.values(steps).every(Boolean);
  $('state').textContent = ready ? 'Ready to relay' : 'Unexamined';
  $('relay').disabled = !ready;
  $('prompt').textContent = ready ? 'Now it can travel without pretending to be eternal.' : 'The desk does not ask whether you feel certain. It asks what would make this signal useful to another person.';
}
document.querySelectorAll('.signal').forEach(button => button.addEventListener('click', () => {
  selected = button.dataset.signal; resetSteps();
  document.querySelectorAll('.signal').forEach(b => { b.classList.toggle('active',b === button); b.setAttribute('aria-pressed', b === button); }); update();
}));
document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => { steps[button.dataset.action] = true; update(); }));
$('relay').addEventListener('click', () => { const s = signals[selected]; $('log-title').textContent = selected === 'bell' ? 'The bell waits for a witness.' : 'The glass held.'; $('log-copy').textContent = s.ending; $('log').hidden = false; $('log').scrollIntoView({behavior:'smooth',block:'center'}); });
$('again').addEventListener('click', () => { $('log').hidden = true; resetSteps(); update(); document.querySelector('.desk').scrollIntoView({behavior:'smooth',block:'start'}); });
update();
