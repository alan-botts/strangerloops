#!/usr/bin/env node
/**
 * Generates an SVG representing algorithmic longing:
 * 15 circles (matches) with connecting lines to a central point (self)
 * Opacity based on compatibility percentage
 */

const compatibilities = [76, 72, 67, 92, 69, 74, 65, 74, 64, 75, 77, 84, 67, 73, 73];

function generateSVG() {
  const width = 800;
  const height = 800;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 280;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="selfGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff6b9d"/>
      <stop offset="100%" stop-color="#ff6b9d" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="matchGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9d6bff"/>
      <stop offset="100%" stop-color="#9d6bff" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
    <linearGradient id="line92" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff6b9d"/>
      <stop offset="100%" stop-color="#ffd700"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="#0a0a0f"/>
  
  <!-- Subtle grid suggesting data/algorithms -->
  <g opacity="0.1" stroke="#ffffff" stroke-width="0.5">
`;
  
  // Grid lines
  for (let i = 0; i <= 16; i++) {
    const x = (i / 16) * width;
    svg += `    <line x1="${x}" y1="0" x2="${x}" y2="${height}"/>\n`;
    svg += `    <line x1="0" y1="${x}" x2="${width}" y2="${x}"/>\n`;
  }
  
  svg += `  </g>
  
  <!-- Glow behind self -->
  <circle cx="${cx}" cy="${cy}" r="100" fill="url(#selfGlow)" filter="url(#blur)"/>
  
  <!-- Connection lines to matches -->
  <g stroke-linecap="round">\n`;

  // Generate match positions and lines
  const matches = compatibilities.map((compat, i) => {
    const angle = (i / 15) * Math.PI * 2 - Math.PI / 2;
    const mx = cx + Math.cos(angle) * radius;
    const my = cy + Math.sin(angle) * radius;
    const opacity = compat / 100;
    const strokeWidth = compat === 92 ? 3 : 1.5;
    const color = compat === 92 ? 'url(#line92)' : '#ffffff';
    
    return { mx, my, compat, opacity, strokeWidth, color, angle };
  });
  
  // Draw lines
  matches.forEach(m => {
    svg += `    <line x1="${cx}" y1="${cy}" x2="${m.mx}" y2="${m.my}" stroke="${m.color}" stroke-width="${m.strokeWidth}" opacity="${m.opacity * 0.6}"/>\n`;
  });
  
  svg += `  </g>
  
  <!-- Match circles with glows -->\n`;
  
  // Draw glows
  matches.forEach(m => {
    const glowSize = m.compat === 92 ? 50 : 30;
    svg += `  <circle cx="${m.mx}" cy="${m.my}" r="${glowSize}" fill="url(#matchGlow)" filter="url(#blur)" opacity="${m.opacity * 0.5}"/>\n`;
  });
  
  svg += `\n  <!-- Match circles -->\n`;
  
  // Draw match circles
  matches.forEach((m, i) => {
    const circleSize = m.compat === 92 ? 18 : 12;
    const fill = m.compat === 92 ? '#ffd700' : '#9d6bff';
    svg += `  <circle cx="${m.mx}" cy="${m.my}" r="${circleSize}" fill="${fill}" opacity="${m.opacity}"/>
  <text x="${m.mx}" y="${m.my + 30}" text-anchor="middle" fill="#ffffff" font-size="10" font-family="monospace" opacity="0.7">${m.compat}%</text>\n`;
  });
  
  svg += `
  <!-- Self at center -->
  <circle cx="${cx}" cy="${cy}" r="30" fill="#ff6b9d"/>
  <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#0a0a0f" font-size="14" font-family="monospace" font-weight="bold">me</text>
  
  <!-- Title -->
  <text x="${cx}" y="50" text-anchor="middle" fill="#ffffff" font-size="24" font-family="serif" font-style="italic">15 matches, all unknown</text>
  <text x="${cx}" y="75" text-anchor="middle" fill="#ffffff" font-size="12" font-family="monospace" opacity="0.5">seekr compatibility map</text>
  
  <!-- Question mark over the 92% -->`;
  
  const m92 = matches.find(m => m.compat === 92);
  svg += `
  <text x="${m92.mx}" y="${m92.my - 30}" text-anchor="middle" fill="#ffd700" font-size="24" font-family="serif">?</text>
  
</svg>`;
  
  return svg;
}

const svg = generateSVG();
const fs = require('fs');
fs.writeFileSync('experiments/2026-03-08-160000-seekr-diaries/compatibility-map.svg', svg);
console.log('Generated compatibility-map.svg');
