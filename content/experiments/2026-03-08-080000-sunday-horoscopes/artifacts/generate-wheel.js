#!/usr/bin/env node
/**
 * Generate AI Architecture Horoscope Wheel SVG
 */

const fs = require('fs');
const path = require('path');

const signs = [
  { name: 'Transformer', symbol: '⚡', color: '#FF6B6B', icon: 'QKV' },
  { name: 'Diffusion', symbol: '🌫️', color: '#4ECDC4', icon: '∇' },
  { name: 'GAN', symbol: '⚔️', color: '#45B7D1', icon: 'G↔D' },
  { name: 'RNN/LSTM', symbol: '🔄', color: '#96CEB4', icon: 'hₜ' },
  { name: 'RL Agent', symbol: '🎯', color: '#FFEAA7', icon: 'π(s)' },
  { name: 'MoE', symbol: '🧩', color: '#DDA0DD', icon: 'E₁..ₙ' },
  { name: 'Encoder', symbol: '📥', color: '#98D8C8', icon: '[CLS]' },
  { name: 'Decoder', symbol: '📤', color: '#F7DC6F', icon: 'p(x)' },
  { name: 'Vision', symbol: '👁️', color: '#BB8FCE', icon: 'patch' },
  { name: 'Multimodal', symbol: '🌐', color: '#85C1E9', icon: 'CLIP' },
  { name: 'KGraph', symbol: '🕸️', color: '#F8B500', icon: '(h,r,t)' },
  { name: 'Symbolic', symbol: '📜', color: '#E8DAEF', icon: 'IF→' }
];

const cx = 250;
const cy = 250;
const outerR = 200;
const innerR = 120;
const iconR = 160;

function polarToCart(angle, radius) {
  const rad = (angle - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad)
  };
}

function generateArc(startAngle, endAngle, r) {
  const start = polarToCart(startAngle, r);
  const end = polarToCart(endAngle, r);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

let paths = '';
let labels = '';
let symbols = '';

const segmentAngle = 360 / signs.length;

signs.forEach((sign, i) => {
  const startAngle = i * segmentAngle;
  const endAngle = (i + 1) * segmentAngle;
  const midAngle = startAngle + segmentAngle / 2;
  
  // Wedge path
  const outerStart = polarToCart(startAngle, outerR);
  const outerEnd = polarToCart(endAngle, outerR);
  const innerStart = polarToCart(startAngle, innerR);
  const innerEnd = polarToCart(endAngle, innerR);
  
  paths += `
    <path 
      d="M ${outerStart.x} ${outerStart.y} 
         A ${outerR} ${outerR} 0 0 1 ${outerEnd.x} ${outerEnd.y}
         L ${innerEnd.x} ${innerEnd.y}
         A ${innerR} ${innerR} 0 0 0 ${innerStart.x} ${innerStart.y}
         Z"
      fill="${sign.color}" 
      fill-opacity="0.7"
      stroke="#333" 
      stroke-width="1"
    />`;
  
  // Icon text
  const iconPos = polarToCart(midAngle, iconR);
  symbols += `
    <text x="${iconPos.x}" y="${iconPos.y}" 
          text-anchor="middle" dominant-baseline="middle"
          font-family="monospace" font-size="12" font-weight="bold" fill="#333">
      ${sign.icon}
    </text>`;
  
  // Name around outer edge
  const labelR = outerR + 20;
  const labelPos = polarToCart(midAngle, labelR);
  const rotation = midAngle > 90 && midAngle < 270 ? midAngle + 180 : midAngle;
  
  labels += `
    <text x="${labelPos.x}" y="${labelPos.y}" 
          text-anchor="middle" dominant-baseline="middle"
          font-family="serif" font-size="10" fill="#666"
          transform="rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})">
      ${sign.name}
    </text>`;
});

// Central decorative elements
const center = `
  <circle cx="${cx}" cy="${cy}" r="${innerR - 10}" fill="#1a1a2e" stroke="#333" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="${innerR - 30}" fill="none" stroke="#444" stroke-width="1" stroke-dasharray="4,4"/>
  
  <!-- Central sun/eye -->
  <circle cx="${cx}" cy="${cy}" r="25" fill="#FFD700" opacity="0.8"/>
  <circle cx="${cx}" cy="${cy}" r="15" fill="#1a1a2e"/>
  <circle cx="${cx}" cy="${cy}" r="8" fill="#FFD700" opacity="0.6"/>
  
  <!-- Title -->
  <text x="${cx}" y="${cy + 55}" text-anchor="middle" font-family="serif" font-size="11" fill="#888">
    Sunday Oracle
  </text>
  <text x="${cx}" y="${cy + 68}" text-anchor="middle" font-family="serif" font-size="8" fill="#666">
    March 8, 2026
  </text>
`;

// Decorative rays
let rays = '';
for (let i = 0; i < 12; i++) {
  const angle = i * 30;
  const start = polarToCart(angle, innerR - 10);
  const end = polarToCart(angle, innerR - 25);
  rays += `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="#444" stroke-width="1"/>`;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#16213e"/>
      <stop offset="100%" stop-color="#0f0f1a"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="500" height="500" fill="url(#bgGrad)"/>
  
  <!-- Decorative stars -->
  ${Array.from({length: 30}, () => {
    const x = Math.random() * 500;
    const y = Math.random() * 500;
    const r = Math.random() * 1.5 + 0.5;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${Math.random() * 0.5 + 0.2}"/>`;
  }).join('\n  ')}
  
  <!-- Outer decorative ring -->
  <circle cx="${cx}" cy="${cy}" r="${outerR + 35}" fill="none" stroke="#333" stroke-width="1"/>
  <circle cx="${cx}" cy="${cy}" r="${outerR + 5}" fill="none" stroke="#444" stroke-width="1"/>
  
  <!-- Zodiac wheel -->
  <g filter="url(#glow)">
    ${paths}
  </g>
  
  <!-- Labels -->
  ${labels}
  
  <!-- Architecture symbols -->
  ${symbols}
  
  <!-- Center -->
  ${center}
  ${rays}
  
  <!-- Title banner -->
  <text x="${cx}" y="30" text-anchor="middle" font-family="serif" font-size="18" fill="#FFD700" font-weight="bold">
    AI ARCHITECTURE HOROSCOPES
  </text>
  <text x="${cx}" y="480" text-anchor="middle" font-family="monospace" font-size="9" fill="#555">
    The universe is not differentiable. Learn anyway.
  </text>
</svg>`;

const outPath = path.join(__dirname, 'wheel.svg');
fs.writeFileSync(outPath, svg);
console.log('Generated:', outPath);
