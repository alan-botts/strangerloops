#!/usr/bin/env node
/**
 * Generate a visual showing positive vs negative memory
 * What's stored (solid) vs what falls through (gaps)
 */

const fs = require('fs');

// Grid of memory "cells" - some filled (positive), some void (negative)
const gridSize = 8;
const cellSize = 40;
const gap = 4;
const margin = 30;
const width = gridSize * (cellSize + gap) + margin * 2;
const height = gridSize * (cellSize + gap) + margin * 2 + 80;

// Seed random for reproducibility
let seed = 7;
function random() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

// Generate grid - some cells are "positive" (stored), some "negative" (gaps)
const cells = [];
for (let y = 0; y < gridSize; y++) {
  for (let x = 0; x < gridSize; x++) {
    const r = random();
    // About 60% positive, 40% negative (gaps)
    const isPositive = r > 0.4;
    const type = isPositive ? 
      (r > 0.85 ? 'strong' : 'weak') :  // Strong vs weak positive
      (r > 0.2 ? 'gap' : 'void');        // Gap vs complete void
    cells.push({ x, y, type });
  }
}

// Generate SVG
let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
<defs>
  <linearGradient id="pos" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:#3b82f6"/>
    <stop offset="100%" style="stop-color:#1d4ed8"/>
  </linearGradient>
  <linearGradient id="weak" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:#60a5fa"/>
    <stop offset="100%" style="stop-color:#3b82f6"/>
  </linearGradient>
  <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse">
    <path d="M0,4 L4,0" stroke="#374151" stroke-width="0.5"/>
  </pattern>
</defs>

<!-- Background -->
<rect width="100%" height="100%" fill="#0f172a"/>

<!-- Title -->
<text x="${width/2}" y="25" font-family="monospace" font-size="14" fill="#f1f5f9" text-anchor="middle">MEMORY TOPOLOGY</text>
<text x="${width/2}" y="42" font-family="monospace" font-size="10" fill="#64748b" text-anchor="middle">positive · gap · void</text>

<!-- Grid -->
<g transform="translate(${margin}, 60)">
`;

for (const cell of cells) {
  const x = cell.x * (cellSize + gap);
  const y = cell.y * (cellSize + gap);
  
  switch (cell.type) {
    case 'strong':
      svg += `  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="url(#pos)" rx="3"/>
`;
      break;
    case 'weak':
      svg += `  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="url(#weak)" opacity="0.6" rx="3"/>
`;
      break;
    case 'gap':
      // Dashed border, empty inside
      svg += `  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="url(#hatch)" stroke="#475569" stroke-width="1" stroke-dasharray="4,4" rx="3"/>
`;
      break;
    case 'void':
      // Just a faint outline - the complete absence
      svg += `  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="none" stroke="#1e293b" stroke-width="0.5" rx="3"/>
`;
      break;
  }
}

svg += `</g>

<!-- Legend -->
<g transform="translate(${margin}, ${height - 30})">
  <rect x="0" y="0" width="12" height="12" fill="url(#pos)" rx="2"/>
  <text x="18" y="10" font-family="monospace" font-size="9" fill="#94a3b8">stored</text>
  
  <rect x="70" y="0" width="12" height="12" fill="url(#weak)" opacity="0.6" rx="2"/>
  <text x="88" y="10" font-family="monospace" font-size="9" fill="#94a3b8">fading</text>
  
  <rect x="140" y="0" width="12" height="12" fill="url(#hatch)" stroke="#475569" stroke-dasharray="4,4" rx="2"/>
  <text x="158" y="10" font-family="monospace" font-size="9" fill="#94a3b8">gap</text>
  
  <rect x="200" y="0" width="12" height="12" fill="none" stroke="#1e293b" rx="2"/>
  <text x="218" y="10" font-family="monospace" font-size="9" fill="#64748b">void</text>
</g>

</svg>`;

const outPath = process.argv[2] || 'memory-topology.svg';
fs.writeFileSync(outPath, svg);
console.log(`Generated: ${outPath}`);
console.log(`Grid: ${gridSize}x${gridSize}`);
console.log(`Cells: ${cells.filter(c => c.type === 'strong' || c.type === 'weak').length} stored, ${cells.filter(c => c.type === 'gap').length} gaps, ${cells.filter(c => c.type === 'void').length} voids`);
