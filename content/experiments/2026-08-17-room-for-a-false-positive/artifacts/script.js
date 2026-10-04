const scene = document.querySelector('#scene');
const weather = document.querySelector('#weather');
const counter = document.querySelector('#counter');
const verdict = document.querySelector('#verdict');
const evidence = document.querySelector('#evidence');
const receipt = document.querySelector('#receipt');
const buttons = [...document.querySelectorAll('.lens')];
const selected = new Set();
const lenses = {
  threshold: { text: 'At a stricter threshold, only the red lantern remains. The “constellation” was partly a brightness rule.', chip: 'A claim can change when a defensible cutoff changes.' },
  neighborhood: { text: 'With a different local boundary, the red lantern joins another cluster. The grouping was not unique.', chip: 'A pattern can depend on where we draw its edge.' },
  tomorrow: { text: 'On another simulated night, a similar cluster forms elsewhere. The recurrence needs a wider sample.', chip: 'A convincing night is not yet a durable weather report.' }
};
const positions = [
 [13,18],[29,24],[49,12],[68,24],[86,14],[18,44],[39,39],[57,49],[75,42],[91,52],
 [8,70],[25,78],[44,68],[62,78],[81,71],[96,82],[35,91],[55,89],[73,94]
];
const dots = positions.map(([x,y], i) => {
  const dot = document.createElement('i'); dot.className = 'light'; dot.style.left = x+'%'; dot.style.top = y+'%';
  if ([6,7,8].includes(i)) dot.classList.add('active');
  if (i === 7) dot.classList.add('signal');
  scene.append(dot); return dot;
});
function redraw() {
  dots.forEach((dot, i) => {
    dot.classList.remove('connected');
    dot.classList.toggle('active', !selected.has('threshold') && [6,7,8].includes(i));
    if (selected.has('neighborhood') && [5,6,7,11,12].includes(i)) dot.classList.add('connected');
    if (selected.has('tomorrow') && [2,3,4].includes(i)) dot.classList.add('connected');
  });
  const count = selected.size;
  counter.textContent = `${count} / 3 lenses`;
  weather.textContent = count === 0 ? 'The first look makes a constellation.' : count < 3 ? 'The same field changes its story.' : 'The lantern survives. The story gets humbler.';
  verdict.textContent = count === 0 ? 'Plausible. Not yet portable.' : count < 3 ? 'Interesting. Still conditional.' : 'A finding, not a verdict about a mind.';
  evidence.innerHTML = [...selected].map(key => `<span class="chip">${lenses[key].chip}</span>`).join('');
  receipt.hidden = count !== 3;
}
buttons.forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.lens;
  selected.has(key) ? selected.delete(key) : selected.add(key);
  button.setAttribute('aria-pressed', selected.has(key));
  redraw();
}));
document.querySelector('#reset').addEventListener('click', () => {
  selected.clear(); buttons.forEach(button => button.setAttribute('aria-pressed','false')); redraw(); window.scrollTo({ top: 0, behavior: 'smooth' });
});
redraw();
