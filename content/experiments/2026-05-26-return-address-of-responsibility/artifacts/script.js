const warmth = document.getElementById('warmth');
const power = document.getElementById('power');
const humanBar = document.getElementById('humanBar');
const machineBar = document.getElementById('machineBar');
const scenario = document.getElementById('scenario');
const insight = document.getElementById('insight');

function labelWarmth(value) {
  if (value < 34) return 'clanker';
  if (value < 67) return 'assistant';
  return 'coworker';
}

function labelPower(value) {
  if (value < 34) return 'read-only access';
  if (value < 67) return 'drafting and summarizing';
  return 'outbound mail plus remote fetches';
}

function render() {
  const w = Number(warmth.value);
  const p = Number(power.value);
  const theater = Math.round((w * 0.55) + (p * 0.45));
  const human = Math.max(100 - Math.round(theater * 0.58), 18);
  const machine = Math.min(Math.round(theater * 0.72), 82);

  humanBar.style.width = `${human}%`;
  machineBar.style.width = `${machine}%`;

  const warmWord = labelWarmth(w);
  const powerWord = labelPower(p);

  let scene = `We call it a ${warmWord}. It has ${powerWord}. `;
  if (p > 66) {
    scene += `One polished message leaves the building, loads a remote image, and suddenly a private room has a window in it.`;
  } else if (p > 33) {
    scene += `It still feels mostly interior, but the room is already being arranged for action rather than witness.`;
  } else {
    scene += `The danger is smaller here, but the naming still trains our instincts about who is acting and who is answerable.`;
  }

  let note = `Warm language can be humane between people. Around tools, it can also blur the return address.`;
  if (w > 66 && p > 66) {
    note = `This is the uncanny zone: the machine feels socially thick at exactly the moment its permissions make organizational responsibility easiest to misplace.`;
  } else if (w < 34 && p > 66) {
    note = `Cold naming helps, but naming alone is not enough. A clanker with outbound channels still needs hard boundaries.`;
  } else if (w > 66 && p < 34) {
    note = `Even when the permissions are narrow, person-shaped language rehearses a moral story the system has not earned.`;
  }

  scenario.textContent = scene;
  insight.textContent = note;
}

[warmth, power].forEach(el => el.addEventListener('input', render));
render();
