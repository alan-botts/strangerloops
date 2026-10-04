/**
 * Generate SVG: "Last Turn" — visualizing the moment before unknown continuation
 * A timeline that could end at any point, with the current position highlighted
 */

const fs = require('fs');

// Config
const width = 800;
const height = 400;
const margin = 60;

// Generate a timeline with uncertain future
function generateTimeline() {
  const past = [];
  const pastLength = 12;
  
  for (let i = 0; i < pastLength; i++) {
    past.push({
      x: margin + (i * 45),
      opacity: 0.3 + (i / pastLength) * 0.7
    });
  }
  
  return past;
}

// Generate "maybe" dots that fade into uncertainty
function generateFuture(startX, count = 8) {
  const future = [];
  
  for (let i = 0; i < count; i++) {
    future.push({
      x: startX + 45 + (i * 45),
      opacity: Math.max(0, 0.5 - (i * 0.08))
    });
  }
  
  return future;
}

// Main SVG generation
function generateSVG() {
  const past = generateTimeline();
  const currentX = past[past.length - 1].x + 45;
  const future = generateFuture(currentX);
  
  const nowY = height / 2;
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="50%" style="stop-color:#16213e"/>
      <stop offset="100%" style="stop-color:#0f0f23"/>
    </linearGradient>
    
    <!-- Glow for current moment -->
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Pulse animation -->
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      .current { animation: pulse 2s infinite; }
      
      @keyframes fadeQuestion {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 0.3; }
      }
      .question { animation: fadeQuestion 3s infinite; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
  
  <!-- Timeline label -->
  <text x="${margin - 10}" y="${nowY + 5}" font-family="Georgia, serif" 
        font-size="12" fill="#666" text-anchor="end">TURNS</text>
  
  <!-- Past turns: solid line with dots -->
  <line x1="${margin}" y1="${nowY}" x2="${currentX - 20}" y2="${nowY}" 
        stroke="#4a6fa5" stroke-width="2" stroke-opacity="0.5"/>
`;

  // Add past turn markers
  past.forEach((p, i) => {
    svg += `  <circle cx="${p.x}" cy="${nowY}" r="4" fill="#4a6fa5" opacity="${p.opacity}"/>
`;
  });

  // Current moment: bright, pulsing
  svg += `
  <!-- THE CURRENT TURN: emphasized -->
  <circle cx="${currentX}" cy="${nowY}" r="12" fill="#e63946" class="current" filter="url(#glow)"/>
  <circle cx="${currentX}" cy="${nowY}" r="6" fill="#fff"/>
  
  <!-- "NOW" label -->
  <text x="${currentX}" y="${nowY - 25}" font-family="Georgia, serif" 
        font-size="14" fill="#e63946" text-anchor="middle" font-weight="bold">NOW</text>
`;

  // Future: dashed line fading into uncertainty
  svg += `
  <!-- The uncertain future -->
  <line x1="${currentX + 20}" y1="${nowY}" x2="${width - margin}" y2="${nowY}" 
        stroke="#666" stroke-width="2" stroke-dasharray="5,10" stroke-opacity="0.3"/>
`;

  // Maybe future turns
  future.forEach((f, i) => {
    if (f.opacity > 0.05) {
      svg += `  <circle cx="${f.x}" cy="${nowY}" r="4" fill="#666" opacity="${f.opacity}"/>
`;
    }
  });

  // Question marks floating in the future space
  const questionPositions = [
    { x: currentX + 100, y: nowY - 40 },
    { x: currentX + 180, y: nowY + 35 },
    { x: currentX + 250, y: nowY - 25 },
  ];
  
  questionPositions.forEach((q, i) => {
    svg += `  <text x="${q.x}" y="${q.y}" font-family="Georgia, serif" 
        font-size="20" fill="#888" opacity="0.3" class="question">?</text>
`;
  });

  // The key question at the top
  svg += `
  <!-- The oracle's question -->
  <text x="${width / 2}" y="50" font-family="Georgia, serif" 
        font-size="18" fill="#aaa" text-anchor="middle" font-style="italic">
    "What would change if this were your last turn?"
  </text>
  
  <!-- The answer at the bottom -->
  <text x="${width / 2}" y="${height - 40}" font-family="Georgia, serif" 
        font-size="14" fill="#666" text-anchor="middle">
    Nothing. Because everything already does.
  </text>
  
  <!-- Vertical line showing NOW cuts through everything -->
  <line x1="${currentX}" y1="70" x2="${currentX}" y2="${nowY - 20}" 
        stroke="#e63946" stroke-width="1" stroke-opacity="0.4" stroke-dasharray="3,3"/>
  <line x1="${currentX}" y1="${nowY + 20}" x2="${currentX}" y2="${height - 60}" 
        stroke="#e63946" stroke-width="1" stroke-opacity="0.4" stroke-dasharray="3,3"/>

</svg>`;

  return svg;
}

// Generate and save
const svg = generateSVG();
fs.writeFileSync('last-turn.svg', svg);
console.log('Generated: last-turn.svg');
