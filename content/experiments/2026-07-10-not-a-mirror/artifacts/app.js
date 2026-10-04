const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');
const coverageEl = document.getElementById('coverage');
const blindEl = document.getElementById('blindPocket');
const stateEl = document.getElementById('state');
const narration = document.getElementById('narration');

const W = canvas.width;
const H = canvas.height;
const CELL = 10;
const COLS = Math.floor(W / CELL);
const ROWS = Math.floor(H / CELL);
const heat = new Float32Array(COLS * ROWS);

const walkers = [];
let reminderPulse = 0;
let strangerAdded = false;

function idx(c, r) { return r * COLS + c; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rand(min, max) { return Math.random() * (max - min) + min; }
function turn(vx, vy, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return { vx: vx * c - vy * s, vy: vx * s + vy * c };
}

function makeWalker(kind = 'familiar') {
  const angle = rand(0, Math.PI * 2);
  const speed = kind === 'stranger' ? 2.5 : 2.1;
  return {
    x: rand(W * 0.2, W * 0.8),
    y: rand(H * 0.2, H * 0.8),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    kind,
    hue: kind === 'stranger' ? '#ff6f91' : '#f3b562',
    wobble: rand(-0.018, 0.018)
  };
}

function resetRoom() {
  heat.fill(0);
  walkers.length = 0;
  strangerAdded = false;
  reminderPulse = 0;
  for (let i = 0; i < 36; i++) walkers.push(makeWalker('familiar'));
  stateEl.textContent = 'a room repeating itself';
}

function coldestCell() {
  let min = Infinity, best = 0;
  for (let i = 0; i < heat.length; i++) {
    if (heat[i] < min) { min = heat[i]; best = i; }
  }
  return { c: best % COLS, r: Math.floor(best / COLS) };
}

function largestBlindPocket() {
  const seen = new Uint8Array(heat.length);
  let best = 0;
  for (let i = 0; i < heat.length; i++) {
    if (seen[i] || heat[i] > 0.12) continue;
    let size = 0;
    const stack = [i];
    seen[i] = 1;
    while (stack.length) {
      const cur = stack.pop();
      size++;
      const c = cur % COLS;
      const r = Math.floor(cur / COLS);
      const nbs = [
        c > 0 ? cur - 1 : -1,
        c < COLS - 1 ? cur + 1 : -1,
        r > 0 ? cur - COLS : -1,
        r < ROWS - 1 ? cur + COLS : -1,
      ];
      for (const n of nbs) {
        if (n >= 0 && !seen[n] && heat[n] <= 0.12) {
          seen[n] = 1;
          stack.push(n);
        }
      }
    }
    if (size > best) best = size;
  }
  return best;
}

function updateReadout() {
  let visited = 0;
  for (const v of heat) if (v > 0.12) visited++;
  const pct = ((visited / heat.length) * 100).toFixed(1);
  coverageEl.textContent = `${pct}%`;
  blindEl.textContent = `${largestBlindPocket()} cells`;
  if (reminderPulse > 0) {
    stateEl.textContent = 'the room remembers what it skipped';
  } else if (strangerAdded) {
    stateEl.textContent = 'difference becomes a search pattern';
  } else {
    stateEl.textContent = 'a room repeating itself';
  }
}

function stepWalker(w) {
  const c = clamp(Math.floor(w.x / CELL), 0, COLS - 1);
  const r = clamp(Math.floor(w.y / CELL), 0, ROWS - 1);
  heat[idx(c, r)] = Math.min(1, heat[idx(c, r)] + (w.kind === 'stranger' ? 0.10 : 0.06));

  const current = heat[idx(c, r)];
  const lookA = clamp(Math.floor((w.x + w.vx * 6) / CELL), 0, COLS - 1);
  const lookB = clamp(Math.floor((w.y + w.vy * 6) / CELL), 0, ROWS - 1);
  const ahead = heat[idx(lookA, lookB)];

  let angle = w.wobble;
  if (reminderPulse > 0) {
    const cold = coldestCell();
    const tx = cold.c * CELL + CELL / 2;
    const ty = cold.r * CELL + CELL / 2;
    const desired = Math.atan2(ty - w.y, tx - w.x);
    const currentAngle = Math.atan2(w.vy, w.vx);
    angle += (desired - currentAngle) * 0.06;
  } else if (ahead > current + 0.04) {
    angle += w.kind === 'stranger' ? -0.18 : 0.18;
  } else {
    angle += w.kind === 'stranger' ? 0.05 : -0.05;
  }

  const turned = turn(w.vx, w.vy, angle);
  w.vx = turned.vx;
  w.vy = turned.vy;
  w.x += w.vx;
  w.y += w.vy;

  if (w.x < 0 || w.x > W) w.vx *= -1;
  if (w.y < 0 || w.y > H) w.vy *= -1;
  w.x = clamp(w.x, 0, W);
  w.y = clamp(w.y, 0, H);
}

function fadeHeat() {
  for (let i = 0; i < heat.length; i++) heat[i] *= 0.9975;
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0f1728';
  ctx.fillRect(0, 0, W, H);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = heat[idx(c, r)];
      const x = c * CELL;
      const y = r * CELL;
      if (v <= 0.12) {
        ctx.fillStyle = 'rgba(38,49,79,0.55)';
      } else {
        const alpha = Math.min(0.9, v * 0.75);
        ctx.fillStyle = `rgba(111,231,221,${alpha})`;
      }
      ctx.fillRect(x, y, CELL - 1, CELL - 1);
    }
  }

  if (reminderPulse > 0) {
    ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.4, reminderPulse / 120)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 50 + (120 - reminderPulse) * 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (const w of walkers) {
    ctx.fillStyle = w.hue;
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.kind === 'stranger' ? 5 : 3.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function tick() {
  fadeHeat();
  walkers.forEach(stepWalker);
  if (reminderPulse > 0) reminderPulse--;
  draw();
  updateReadout();
  requestAnimationFrame(tick);
}

document.getElementById('resetBtn').addEventListener('click', resetRoom);
document.getElementById('strangerBtn').addEventListener('click', () => {
  if (!strangerAdded) {
    walkers.push(makeWalker('stranger'));
    strangerAdded = true;
  }
});
document.getElementById('reminderBtn').addEventListener('click', () => {
  reminderPulse = 120;
});
document.getElementById('audioBtn').addEventListener('click', async () => {
  try {
    if (narration.paused) {
      await narration.play();
    } else {
      narration.pause();
      narration.currentTime = 0;
    }
  } catch (err) {
    console.error(err);
  }
});

resetRoom();
tick();
