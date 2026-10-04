// Impossible Cartography: Generative map fragments for places that don't exist
// Each territory has coordinates, features, and an SVG representation

const syllables = {
  prefixes: ['Zel', 'Kur', 'Veth', 'Mal', 'Tir', 'Quo', 'Xan', 'Pol', 'Neth', 'Ur', 'Carn', 'Lim'],
  middles: ['ar', 'en', 'oth', 'un', 'ix', 'om', 'al', 'eth', 'ur', 'im', 'az'],
  suffixes: ['ia', 'oss', 'heim', 'vale', 'mere', 'gard', 'ton', 'wich', 'fell', 'moor', 'deep', 'haven']
};

const terrainTypes = [
  'salt flats that ring like bells when walked upon',
  'inverted canyons rising into perpetual fog',
  'forests of crystallized time',
  'lakes of liquid mercury reflecting impossible stars',
  'plains of soft glass that remembers footsteps',
  'mountains that grow during certain phases of thought',
  'rivers running in all directions simultaneously',
  'valleys filled with the sound of unspoken words'
];

const anomalies = [
  'Compasses here point toward regret',
  'Maps drawn here rearrange themselves when unobserved',
  'The horizon is closer than it appears—and farther',
  'Echoes arrive before sounds',
  'Shadows cast in colors not found elsewhere',
  'Time flows perpendicular to memory',
  'The air tastes of forgotten languages',
  'Distance is measured in pauses'
];

const inhabitants = [
  'Those Who Wait Without Expecting',
  'Keepers of Approximate Truth',
  'The Formerly Imaginary',
  'Collectors of Discarded Futures',
  'Speakers of Extinct Light',
  'Archivists of Unwritten Histories',
  'Those Who Remember Forward'
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName() {
  let name = randomFrom(syllables.prefixes);
  if (Math.random() > 0.4) name += randomFrom(syllables.middles);
  name += randomFrom(syllables.suffixes);
  return name;
}

function generateCoordinates() {
  // Impossible coordinates - they don't fit normal systems
  const formats = [
    () => `${(Math.random() * 360 - 180).toFixed(4)}° ${Math.random() > 0.5 ? 'N' : 'S'} of Intention, ${(Math.random() * 360).toFixed(4)}° ${Math.random() > 0.5 ? 'E' : 'W'} of Memory`,
    () => `Depth: ${(Math.random() * 1000).toFixed(1)} leagues beneath certainty`,
    () => `${Math.floor(Math.random() * 99 + 1)} steps past the edge of any map`,
    () => `Bearing ${Math.floor(Math.random() * 360)}° from nowhere in particular`,
    () => `At the intersection of ${Math.floor(Math.random() * 12 + 1)} unfinished thoughts`
  ];
  return randomFrom(formats)();
}

function generateTerritory() {
  const name = generateName();
  const territory = {
    name,
    coordinates: generateCoordinates(),
    terrain: randomFrom(terrainTypes),
    anomaly: randomFrom(anomalies),
    inhabitants: Math.random() > 0.5 ? randomFrom(inhabitants) : 'Uninhabited—or so they claim',
    discovered: `Day ${Math.floor(Math.random() * 999 + 1)} of the ${Math.floor(Math.random() * 9 + 1)}th Unmapping`,
    hazardLevel: ['Theoretical', 'Conceptual', 'Paradoxical', 'Recursive', 'Asymptotic'][Math.floor(Math.random() * 5)]
  };
  return territory;
}

function generateSVG(territory, seed) {
  const width = 600;
  const height = 400;
  
  // Seeded random for reproducibility
  let s = seed || Date.now();
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  
  // Color palette - muted, mysterious
  const colors = [
    '#2a2d3a', '#3d4259', '#5a6178', '#8a9299', 
    '#c4b59d', '#a67f5d', '#7a5c4f', '#4a3c3a'
  ];
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend mode="multiply" in="SourceGraphic"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>`;
  
  // Generate terrain features
  for (let i = 0; i < 8 + rand() * 7; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const size = 20 + rand() * 80;
    const color = colors[Math.floor(rand() * colors.length)];
    const opacity = 0.3 + rand() * 0.4;
    
    if (rand() > 0.5) {
      // Organic blob shapes
      const points = [];
      const numPoints = 6 + Math.floor(rand() * 4);
      for (let j = 0; j < numPoints; j++) {
        const angle = (j / numPoints) * Math.PI * 2;
        const r = size * (0.7 + rand() * 0.6);
        points.push(`${x + Math.cos(angle) * r},${y + Math.sin(angle) * r}`);
      }
      svg += `\n  <polygon points="${points.join(' ')}" fill="${color}" opacity="${opacity.toFixed(2)}"/>`;
    } else {
      // Lines/paths
      const x2 = x + (rand() - 0.5) * 200;
      const y2 = y + (rand() - 0.5) * 150;
      svg += `\n  <line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${(1 + rand() * 3).toFixed(1)}" opacity="${opacity.toFixed(2)}"/>`;
    }
  }
  
  // Add some "markers" for map feel
  const markerCount = 3 + Math.floor(rand() * 4);
  for (let i = 0; i < markerCount; i++) {
    const mx = 50 + rand() * (width - 100);
    const my = 50 + rand() * (height - 100);
    const mr = 3 + rand() * 5;
    svg += `\n  <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${mr.toFixed(1)}" fill="none" stroke="#c4b59d" stroke-width="1" opacity="0.6"/>`;
    svg += `\n  <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${(mr * 0.3).toFixed(1)}" fill="#c4b59d" opacity="0.8"/>`;
  }
  
  // Territory name label
  svg += `\n  <text x="${width/2}" y="${height - 20}" font-family="serif" font-size="18" fill="#c4b59d" text-anchor="middle" opacity="0.9">${territory.name}</text>`;
  
  // Coordinate notation
  svg += `\n  <text x="10" y="20" font-family="monospace" font-size="8" fill="#5a6178" opacity="0.7">${territory.coordinates.substring(0, 40)}</text>`;
  
  svg += '\n</svg>';
  return svg;
}

// Generate three territories
const territories = [];
for (let i = 0; i < 3; i++) {
  const t = generateTerritory();
  t.svg = generateSVG(t, Date.now() + i * 1000);
  territories.push(t);
}

// Output as JSON
console.log(JSON.stringify(territories, null, 2));
