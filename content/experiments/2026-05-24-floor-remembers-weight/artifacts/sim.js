const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');
const toggle = document.getElementById('toggleMode');
const resetButton = document.getElementById('reset');
const modeBlurb = document.getElementById('modeBlurb');
const visitorsEl = document.getElementById('visitors');
const efficiencyEl = document.getElementById('efficiency');
const driftEl = document.getElementById('drift');

const cols = 48;
const rows = 32;
const size = 16;
const wear = new Float32Array(cols * rows);
const audience = new Float32Array(cols * rows);
const actors = [];
const destinations = [
  { x: 7, y: 6, label: 'bench', tint: '#d0a45f' },
  { x: 38, y: 10, label: 'shelf', tint: '#8eb8ff' },
  { x: 25, y: 26, label: 'door', tint: '#ca7f52' },
];
const spotlight = { x: 24, y: 15 };

let mode = 'grooves';
let visitors = 0;
let pathSteps = 0;
let detourSteps = 0;
let spawnClock = 0;

function idx(x, y) {
  return y * cols + x;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function dist(a, b, x, y) {
  return Math.hypot(a - x, b - y);
}

function seedAudienceField() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const d = dist(spotlight.x, spotlight.y, x, y);
      audience[idx(x, y)] = Math.max(0, 1 - d / 11);
    }
  }
}

function randomEdgeSpawn(target) {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { x: 0, y: target.y + Math.floor((Math.random() - 0.5) * 4) };
  if (side === 1) return { x: cols - 1, y: target.y + Math.floor((Math.random() - 0.5) * 4) };
  if (side === 2) return { x: target.x + Math.floor((Math.random() - 0.5) * 4), y: 0 };
  return { x: target.x + Math.floor((Math.random() - 0.5) * 4), y: rows - 1 };
}

function spawnActor() {
  const target = destinations[Math.floor(Math.random() * destinations.length)];
  const start = randomEdgeSpawn(target);
  actors.push({
    x: clamp(start.x, 0, cols - 1),
    y: clamp(start.y, 0, rows - 1),
    target,
    age: 0,
    detour: 0,
  });
  visitors += 1;
}

function scoreCell(actor, nx, ny) {
  const towardTarget = -dist(nx, ny, actor.target.x, actor.target.y);
  const groovePull = wear[idx(nx, ny)] * 2.4;
  const crowdCost = actors.reduce((sum, other) => {
    if (other === actor) return sum;
    const d = dist(nx, ny, other.x, other.y);
    return sum + (d < 2 ? 0.7 : 0);
  }, 0);

  if (mode === 'grooves') {
    return towardTarget + groovePull - crowdCost;
  }

  const stagePull = audience[idx(nx, ny)] * 3.8;
  const targetPenalty = dist(nx, ny, actor.target.x, actor.target.y) * 0.15;
  return towardTarget + groovePull * 0.6 + stagePull - targetPenalty - crowdCost;
}

function updateActors() {
  spawnClock += 1;
  if (spawnClock % 18 === 0 && actors.length < 28) spawnActor();

  for (let i = actors.length - 1; i >= 0; i--) {
    const actor = actors[i];
    actor.age += 1;
    let best = { x: actor.x, y: actor.y, score: -Infinity };
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = clamp(actor.x + dx, 0, cols - 1);
        const ny = clamp(actor.y + dy, 0, rows - 1);
        const score = scoreCell(actor, nx, ny);
        if (score > best.score) best = { x: nx, y: ny, score };
      }
    }

    actor.x = best.x;
    actor.y = best.y;
    pathSteps += 1;
    const direct = dist(actor.x, actor.y, actor.target.x, actor.target.y);
    const stage = dist(actor.x, actor.y, spotlight.x, spotlight.y);
    if (mode === 'audience' && stage < direct) {
      detourSteps += 1;
      actor.detour += 1;
    }

    wear[idx(actor.x, actor.y)] += mode === 'grooves' ? 0.05 : 0.03;

    if (dist(actor.x, actor.y, actor.target.x, actor.target.y) < 1.2 || actor.age > 90) {
      actors.splice(i, 1);
    }
  }

  for (let i = 0; i < wear.length; i++) {
    wear[i] *= mode === 'grooves' ? 0.996 : 0.992;
  }
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const w = clamp(wear[idx(x, y)], 0, 1);
      const a = audience[idx(x, y)];
      let fill = `rgba(52, 42, 34, ${0.18 + w * 0.9})`;
      if (mode === 'audience' && a > 0.02) {
        const glow = clamp(a * 0.25, 0, 0.22);
        fill = `rgba(${70 + Math.floor(80 * glow)}, ${80 + Math.floor(120 * glow)}, ${100 + Math.floor(155 * glow)}, ${0.16 + glow})`;
      }
      ctx.fillStyle = fill;
      ctx.fillRect(x * size, y * size, size - 1, size - 1);
    }
  }
}

function drawFixtures() {
  destinations.forEach((spot) => {
    ctx.fillStyle = spot.tint;
    ctx.fillRect(spot.x * size + 2, spot.y * size + 2, size - 4, size - 4);
    ctx.fillStyle = '#0f1114';
    ctx.font = '11px Georgia';
    ctx.fillText(spot.label, spot.x * size - 8, spot.y * size - 4);
  });

  if (mode === 'audience') {
    ctx.beginPath();
    ctx.arc(spotlight.x * size + size / 2, spotlight.y * size + size / 2, 18, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(122, 198, 255, 0.65)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(122, 198, 255, 0.2)';
    ctx.fill();
    ctx.fillStyle = '#9fd7ff';
    ctx.fillText('visible center', spotlight.x * size - 18, spotlight.y * size - 14);
  }
}

function drawActors() {
  actors.forEach((actor) => {
    ctx.beginPath();
    ctx.arc(actor.x * size + size / 2, actor.y * size + size / 2, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = '#f6ead1';
    ctx.fill();
  });
}

function updateText() {
  toggle.textContent = `Mode: ${mode}`;
  modeBlurb.textContent = mode === 'grooves'
    ? 'The room forgets who crossed it. It only keeps the friction of repeated need, so corridors slowly appear.'
    : 'Now the room can feel the gaze. Traffic bends toward a visible center, and usefulness starts losing to performance.';

  visitorsEl.textContent = visitors.toString();
  const efficiency = pathSteps === 0 ? 0 : Math.max(0, 100 - (detourSteps / pathSteps) * 100);
  efficiencyEl.textContent = `${Math.round(efficiency)}%`;
  const drift = pathSteps === 0 ? 0 : (detourSteps / pathSteps) * 100;
  driftEl.textContent = `${Math.round(drift)}%`;
}

function frame() {
  updateActors();
  drawGrid();
  drawFixtures();
  drawActors();
  updateText();
  requestAnimationFrame(frame);
}

function reset() {
  wear.fill(0);
  actors.length = 0;
  visitors = 0;
  pathSteps = 0;
  detourSteps = 0;
  spawnClock = 0;
  for (let i = 0; i < 8; i++) spawnActor();
}

toggle.addEventListener('click', () => {
  mode = mode === 'grooves' ? 'audience' : 'grooves';
});
resetButton.addEventListener('click', reset);

seedAudienceField();
reset();
frame();
