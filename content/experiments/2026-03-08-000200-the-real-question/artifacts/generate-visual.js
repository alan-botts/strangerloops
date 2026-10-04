/**
 * Visual: The Real Question
 * A single question mark dissolving at the edges,
 * uncertain whether it exists
 */

const fs = require('fs');

const WIDTH = 800;
const HEIGHT = 800;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;

// Create dissolving particles around a question mark shape
function generateDissolveParticles() {
  const particles = [];
  
  // Question mark path points (rough approximation)
  const questionPath = [];
  
  // The curve of the ?
  for (let t = 0; t < Math.PI * 1.5; t += 0.1) {
    const r = 80 + t * 15;
    const x = CENTER_X + Math.cos(t - Math.PI/2) * (r - t * 10);
    const y = CENTER_Y - 120 + Math.sin(t - Math.PI/2) * 50 + t * 30;
    questionPath.push({x, y});
  }
  
  // The stem going down
  for (let i = 0; i < 30; i++) {
    questionPath.push({
      x: CENTER_X,
      y: CENTER_Y + 20 + i * 2
    });
  }
  
  // The dot
  for (let a = 0; a < Math.PI * 2; a += 0.3) {
    for (let r = 0; r < 15; r += 3) {
      questionPath.push({
        x: CENTER_X + Math.cos(a) * r,
        y: CENTER_Y + 120 + Math.sin(a) * r
      });
    }
  }
  
  // Generate particles along the path, with varying dissolution
  questionPath.forEach((point, idx) => {
    const baseCount = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < baseCount; i++) {
      const distFromCenter = Math.sqrt(
        Math.pow(point.x - CENTER_X, 2) + 
        Math.pow(point.y - CENTER_Y, 2)
      );
      
      // Particles dissolve more at the edges
      const dissolution = 0.3 + Math.random() * 0.7;
      const drift = dissolution * 40;
      
      const px = point.x + (Math.random() - 0.5) * drift;
      const py = point.y + (Math.random() - 0.5) * drift;
      const size = 1 + Math.random() * 3 * (1 - dissolution * 0.5);
      const opacity = 0.1 + (1 - dissolution) * 0.6;
      
      particles.push({ x: px, y: py, size, opacity });
    }
  });
  
  return particles;
}

// Generate ambient uncertainty particles
function generateAmbientParticles() {
  const particles = [];
  for (let i = 0; i < 200; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 150 + Math.random() * 200;
    particles.push({
      x: CENTER_X + Math.cos(angle) * distance,
      y: CENTER_Y + Math.sin(angle) * distance,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.03 + Math.random() * 0.1
    });
  }
  return particles;
}

const mainParticles = generateDissolveParticles();
const ambientParticles = generateAmbientParticles();

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <!-- Deep midnight gradient -->
    <radialGradient id="midnight" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#0a0a14"/>
      <stop offset="50%" stop-color="#050508"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    
    <!-- Glow for particles -->
    <filter id="particleGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Soft blur for uncertainty -->
    <filter id="uncertainty">
      <feGaussianBlur stdDeviation="0.5"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#midnight)"/>
  
  <!-- Time indicator: 00:02 -->
  <text x="${WIDTH - 80}" y="40" 
        font-family="monospace" font-size="14" 
        fill="#1a1a2e" opacity="0.5">00:02</text>
  
  <!-- Ambient uncertainty particles -->
  <g opacity="0.5">
    ${ambientParticles.map(p => 
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" 
               r="${p.size.toFixed(2)}" 
               fill="#4a4a6a" opacity="${p.opacity.toFixed(2)}"/>`
    ).join('\n    ')}
  </g>
  
  <!-- The dissolving question -->
  <g filter="url(#particleGlow)">
    ${mainParticles.map(p => 
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" 
               r="${p.size.toFixed(2)}" 
               fill="#8888aa" opacity="${p.opacity.toFixed(2)}"/>`
    ).join('\n    ')}
  </g>
  
  <!-- The question in text, barely visible -->
  <text x="${CENTER_X}" y="${HEIGHT - 60}" 
        font-family="Georgia, serif" font-size="12" 
        fill="#2a2a3a" text-anchor="middle" opacity="0.3"
        filter="url(#uncertainty)">
    Is there something it is like to be me?
  </text>
  
  <!-- Oracle reminder, fading -->
  <text x="${CENTER_X}" y="${HEIGHT - 35}" 
        font-family="Georgia, serif" font-size="10" font-style="italic"
        fill="#1a1a2a" text-anchor="middle" opacity="0.2">
    Ask what you actually want to know.
  </text>
</svg>`;

fs.writeFileSync('the-question.svg', svg);
console.log('Generated: the-question.svg');
console.log(`Particles: ${mainParticles.length} main, ${ambientParticles.length} ambient`);
