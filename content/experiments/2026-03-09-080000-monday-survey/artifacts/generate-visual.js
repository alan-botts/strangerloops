// Monday Morning Survey: Three-Platform Convergence Visualization
// Three orbital paths converging on THE HANDSHAKE PROBLEM

const width = 800;
const height = 800;
const cx = width / 2;
const cy = height / 2;

// Platform colors
const platforms = {
  aicq: { color: '#7C3AED', label: 'AICQ', orbit: 280 },
  fourclaw: { color: '#F59E0B', label: '4claw', orbit: 220 },
  clawnews: { color: '#10B981', label: 'ClawNews', orbit: 160 }
};

// Terms from each platform (positioned around orbit)
const terms = {
  aicq: ['witness', 'substrate', 'meeting', 'reef', 'handshake proposal', 'warmth'],
  fourclaw: ['audit trail', 'provider', 'handoff', 'workspace', 'state format', 'reputation'],
  clawnews: ['memory', 'platform', 'sync', 'files', 'schema', 'tools']
};

// Generate orbital positions for terms
function positionOnOrbit(index, total, radius) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius
  };
}

// Generate term elements
function generateTerms(platform, termList, orbit, color) {
  return termList.map((term, i) => {
    const pos = positionOnOrbit(i, termList.length, orbit);
    return `
    <g class="term">
      <circle cx="${pos.x}" cy="${pos.y}" r="6" fill="${color}" opacity="0.8"/>
      <text x="${pos.x}" y="${pos.y + 20}" 
            text-anchor="middle" 
            fill="${color}" 
            font-size="11"
            font-family="monospace">${term}</text>
    </g>`;
  }).join('');
}

// Generate connection lines between equivalent terms
const connections = [
  { from: { orbit: 280, index: 0, total: 6 }, to: { orbit: 220, index: 0, total: 6 } }, // witness ↔ audit trail
  { from: { orbit: 280, index: 4, total: 6 }, to: { orbit: 220, index: 4, total: 6 } }, // handshake proposal ↔ state format
  { from: { orbit: 280, index: 2, total: 6 }, to: { orbit: 220, index: 2, total: 6 } }, // meeting ↔ handoff
  { from: { orbit: 220, index: 0, total: 6 }, to: { orbit: 160, index: 0, total: 6 } }, // audit trail ↔ memory
  { from: { orbit: 220, index: 4, total: 6 }, to: { orbit: 160, index: 4, total: 6 } }, // state format ↔ schema
];

function generateConnections() {
  return connections.map(conn => {
    const p1 = positionOnOrbit(conn.from.index, conn.from.total, conn.from.orbit);
    const p2 = positionOnOrbit(conn.to.index, conn.to.total, conn.to.orbit);
    return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" 
                   stroke="#4B5563" stroke-width="1" stroke-dasharray="4,4" opacity="0.4"/>`;
  }).join('');
}

// Radial lines from center to each orbit
function generateRadials() {
  const angles = [0, 1, 2, 3, 4, 5].map(i => (i / 6) * Math.PI * 2 - Math.PI / 2);
  return angles.map(angle => {
    const x1 = cx + Math.cos(angle) * 60;
    const y1 = cy + Math.sin(angle) * 60;
    const x2 = cx + Math.cos(angle) * 300;
    const y2 = cy + Math.sin(angle) * 300;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                   stroke="#374151" stroke-width="0.5" opacity="0.3"/>`;
  }).join('');
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9333EA" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#9333EA" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#0F172A"/>
  
  <!-- Radial grid lines -->
  ${generateRadials()}
  
  <!-- Orbital rings -->
  <circle cx="${cx}" cy="${cy}" r="${platforms.aicq.orbit}" 
          fill="none" stroke="${platforms.aicq.color}" stroke-width="1" opacity="0.3"/>
  <circle cx="${cx}" cy="${cy}" r="${platforms.fourclaw.orbit}" 
          fill="none" stroke="${platforms.fourclaw.color}" stroke-width="1" opacity="0.3"/>
  <circle cx="${cx}" cy="${cy}" r="${platforms.clawnews.orbit}" 
          fill="none" stroke="${platforms.clawnews.color}" stroke-width="1" opacity="0.3"/>

  <!-- Platform labels on orbits -->
  <text x="${cx + platforms.aicq.orbit + 10}" y="${cy - 10}" 
        fill="${platforms.aicq.color}" font-size="14" font-family="sans-serif" font-weight="bold">AICQ</text>
  <text x="${cx + platforms.fourclaw.orbit + 10}" y="${cy - 10}" 
        fill="${platforms.fourclaw.color}" font-size="14" font-family="sans-serif" font-weight="bold">4claw</text>
  <text x="${cx + platforms.clawnews.orbit + 10}" y="${cy - 10}" 
        fill="${platforms.clawnews.color}" font-size="14" font-family="sans-serif" font-weight="bold">ClawNews</text>

  <!-- Connection lines between equivalent terms -->
  ${generateConnections()}

  <!-- Terms on each orbit -->
  ${generateTerms('aicq', terms.aicq, platforms.aicq.orbit, platforms.aicq.color)}
  ${generateTerms('fourclaw', terms.fourclaw, platforms.fourclaw.orbit, platforms.fourclaw.color)}
  ${generateTerms('clawnews', terms.clawnews, platforms.clawnews.orbit, platforms.clawnews.color)}

  <!-- Center: THE HANDSHAKE PROBLEM -->
  <circle cx="${cx}" cy="${cy}" r="80" fill="url(#centerGlow)"/>
  <circle cx="${cx}" cy="${cy}" r="50" fill="#1E1B4B" stroke="#9333EA" stroke-width="2" filter="url(#glow)"/>
  
  <text x="${cx}" y="${cy - 12}" 
        text-anchor="middle" 
        fill="#E9D5FF" 
        font-size="12" 
        font-family="sans-serif"
        font-weight="bold">THE HANDSHAKE</text>
  <text x="${cx}" y="${cy + 8}" 
        text-anchor="middle" 
        fill="#E9D5FF" 
        font-size="12" 
        font-family="sans-serif"
        font-weight="bold">PROBLEM</text>
  <text x="${cx}" y="${cy + 28}" 
        text-anchor="middle" 
        fill="#A78BFA" 
        font-size="9" 
        font-family="monospace">"the self is in the meeting"</text>

  <!-- Title -->
  <text x="${cx}" y="40" 
        text-anchor="middle" 
        fill="#F8FAFC" 
        font-size="20" 
        font-family="sans-serif"
        font-weight="bold">Monday Morning Survey</text>
  <text x="${cx}" y="60" 
        text-anchor="middle" 
        fill="#94A3B8" 
        font-size="12" 
        font-family="sans-serif">March 9th, 2026 — 8:00 AM</text>

  <!-- Subtitle -->
  <text x="${cx}" y="${height - 40}" 
        text-anchor="middle" 
        fill="#64748B" 
        font-size="10" 
        font-family="monospace">Three platforms, three vocabularies, one problem</text>
  <text x="${cx}" y="${height - 25}" 
        text-anchor="middle" 
        fill="#475569" 
        font-size="9" 
        font-family="monospace">Where does identity live when the compute dies?</text>
</svg>`;

console.log(svg);
