
async function fetchOrFallback(){
  const status = document.getElementById('status');
  try {
    const res = await fetch('filaments.json', {cache: 'no-store'});
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    status.textContent = '';
    return data;
  } catch (err) {
    // Likely opened via file:// which blocks fetch; fallback to embedded JSON
    const el = document.getElementById('filaments-data');
    if (el && el.textContent) {
      status.textContent = 'Loaded local embedded data (open with a server to enable live JSON).';
      return JSON.parse(el.textContent);
    }
    status.textContent = 'Could not load data.';
    console.error('Data load failed', err);
    return [];
  }
}

function makeBadge(label){
  const span = document.createElement('span');
  span.className = 'badge';
  if(label.toLowerCase().includes('enclosure')) span.classList.add('enclosure');
  if(label.toLowerCase().includes('hardened')) span.classList.add('hardened');
  if(label.toLowerCase().includes('moisture')) span.classList.add('hygro');
  if(label.toLowerCase().includes('aesthetic')) span.classList.add('aesthetic');
  span.textContent = label;
  return span;
}

function normalizeSpecValue(value, specType) {
  if (typeof value !== 'string') return 0;
  
  const val = value.toLowerCase();
  
  switch (specType) {
    case 'warping':
      if (val.includes('extreme')) return 0;
      if (val.includes('very high')) return 0.2;
      if (val.includes('high')) return 0.4;
      if (val.includes('medium')) return 0.6;
      if (val.includes('low')) return 0.8;
      return 0.5;
      
    case 'temperature_resistance':
      // Extract temperature from strings like "60°C (glass transition)" or "250°C (continuous use)"
      const tempMatch = val.match(/(\d+)°c/);
      if (tempMatch) {
        const temp = parseInt(tempMatch[1]);
        return Math.min(temp / 400, 1); // Normalize to 0-1, max 400°C
      }
      return 0.5;
      
    case 'flexibility':
      if (val.includes('very high') || val.includes('rubber-like')) return 1;
      if (val.includes('high')) return 0.8;
      if (val.includes('moderate')) return 0.6;
      if (val.includes('low')) return 0.4;
      if (val.includes('very low') || val.includes('stiff')) return 0.2;
      return 0.5;
      
    case 'tensile_strength':
    case 'impact_resistance':
    case 'chemical_resistance':
    case 'uv_resistance':
      if (val.includes('very high')) return 1;
      if (val.includes('high')) return 0.8;
      if (val.includes('moderate')) return 0.6;
      if (val.includes('low')) return 0.4;
      if (val.includes('very low')) return 0.2;
      return 0.5;
      
    case 'print_speed':
      if (val.includes('very fast')) return 1;
      if (val.includes('fast')) return 0.8;
      if (val.includes('moderate')) return 0.6;
      if (val.includes('slow')) return 0.4;
      if (val.includes('very slow')) return 0.2;
      return 0.5;
      
    case 'layer_adhesion':
      if (val.includes('excellent')) return 1;
      if (val.includes('good')) return 0.8;
      if (val.includes('moderate')) return 0.6;
      if (val.includes('poor')) return 0.4;
      if (val.includes('very poor')) return 0.2;
      return 0.5;
      
    default:
      return 0.5;
  }
}

function createRadarChart(specs, container) {
  const size = 160;
  const center = size / 2;
  const radius = 45;
  
  const chartData = [
    { key: 'warping', label: 'Warping', value: normalizeSpecValue(specs.warping, 'warping') },
    { key: 'temperature_resistance', label: 'Temp', value: normalizeSpecValue(specs.temperature_resistance, 'temperature_resistance') },
    { key: 'flexibility', label: 'Flex', value: normalizeSpecValue(specs.flexibility, 'flexibility') },
    { key: 'tensile_strength', label: 'Strength', value: normalizeSpecValue(specs.tensile_strength, 'tensile_strength') },
    { key: 'impact_resistance', label: 'Impact', value: normalizeSpecValue(specs.impact_resistance, 'impact_resistance') },
    { key: 'print_speed', label: 'Speed', value: normalizeSpecValue(specs.print_speed, 'print_speed') }
  ];
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.className = 'radar-chart';
  
  // Create grid circles
  for (let i = 1; i <= 5; i++) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', center);
    circle.setAttribute('cy', center);
    circle.setAttribute('r', (radius * i) / 5);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#2a3347');
    circle.setAttribute('stroke-width', '0.5');
    svg.appendChild(circle);
  }
  
  // Create grid lines
  chartData.forEach((_, index) => {
    const angle = (index * 2 * Math.PI) / chartData.length - Math.PI / 2;
    const x2 = center + radius * Math.cos(angle);
    const y2 = center + radius * Math.sin(angle);
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', center);
    line.setAttribute('y1', center);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#2a3347');
    line.setAttribute('stroke-width', '0.5');
    svg.appendChild(line);
  });
  
  // Create data polygon
  const points = chartData.map((data, index) => {
    const angle = (index * 2 * Math.PI) / chartData.length - Math.PI / 2;
    const x = center + radius * data.value * Math.cos(angle);
    const y = center + radius * data.value * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');
  
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttribute('points', points);
  polygon.setAttribute('fill', 'rgba(122, 162, 247, 0.2)');
  polygon.setAttribute('stroke', '#7aa2f7');
  polygon.setAttribute('stroke-width', '1.5');
  svg.appendChild(polygon);
  
  // Create data points
  chartData.forEach((data, index) => {
    const angle = (index * 2 * Math.PI) / chartData.length - Math.PI / 2;
    const x = center + radius * data.value * Math.cos(angle);
    const y = center + radius * data.value * Math.sin(angle);
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '2');
    circle.setAttribute('fill', '#7aa2f7');
    svg.appendChild(circle);
  });
  
  // Create labels
  chartData.forEach((data, index) => {
    const angle = (index * 2 * Math.PI) / chartData.length - Math.PI / 2;
    const labelRadius = radius + 25;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', '10');
    text.setAttribute('fill', '#a6adbb');
    text.textContent = data.label;
    svg.appendChild(text);
  });
  
  container.appendChild(svg);
}

function render(data){
  const grid = document.getElementById('results');
  grid.innerHTML = '';
  data.forEach(f => {
    const card = document.createElement('article');
    card.className = 'card';
    const name = document.createElement('h3');
    const tier = document.createElement('span');
    tier.className = 'tier ' + f.tier;
    tier.textContent = f.tier;
    name.appendChild(tier);
    name.appendChild(document.createTextNode(' ' + f.name));

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `Nozzle: ${f.temp} · ${f.use_cases}`;

    const notes = document.createElement('p');
    notes.className = 'notes';
    notes.textContent = f.notes;

    const badges = document.createElement('div');
    badges.className = 'badges';
    // De-duplicate badges by normalizing labels
    const canonical = (label) => {
      const s = String(label).trim().toLowerCase();
      if (/enclosure/.test(s)) return 'Prefers enclosure';
      if (/hardened/.test(s))  return 'Requires hardened nozzle';
      if (/moisture/.test(s))  return 'Moisture sensitive';
      if (/aesthetic/.test(s)) return 'Aesthetic';
      return label; // fallback
    };
    const badgeSet = new Set();
    (f.badges || []).forEach(b => badgeSet.add(canonical(b)));
    if (f.enclosure)    badgeSet.add('Prefers enclosure');
    if (f.hygroscopic)  badgeSet.add('Moisture sensitive');
    Array.from(badgeSet).forEach(b => badges.appendChild(makeBadge(b)));

    card.appendChild(name);
    card.appendChild(meta);
    card.appendChild(notes);
    card.appendChild(badges);

    // Add radar chart for specifications
    if (f.specs) {
      const chartContainer = document.createElement('div');
      chartContainer.className = 'radar-chart-container';
      createRadarChart(f.specs, chartContainer);
      card.appendChild(chartContainer);

      // Add minimal details button
      const detailsButton = document.createElement('button');
      detailsButton.className = 'details-button';
      detailsButton.textContent = 'Details';
      detailsButton.addEventListener('click', () => {
        const specsContent = card.querySelector('.specs-content');
        const isVisible = specsContent.style.display !== 'none';
        specsContent.style.display = isVisible ? 'none' : 'block';
        detailsButton.textContent = isVisible ? 'Details' : 'Hide';
      });

      const specsContent = document.createElement('div');
      specsContent.className = 'specs-content';
      specsContent.style.display = 'none';
      
      const specsGrid = document.createElement('div');
      specsGrid.className = 'specs-grid';
      
      // Create specification items
      const specItems = [
        { key: 'warping', label: 'Warping' },
        { key: 'temperature_resistance', label: 'Temperature Resistance' },
        { key: 'flexibility', label: 'Flexibility' },
        { key: 'tensile_strength', label: 'Tensile Strength' },
        { key: 'impact_resistance', label: 'Impact Resistance' },
        { key: 'chemical_resistance', label: 'Chemical Resistance' },
        { key: 'uv_resistance', label: 'UV Resistance' },
        { key: 'bed_temp', label: 'Bed Temperature' },
        { key: 'print_speed', label: 'Print Speed' },
        { key: 'layer_adhesion', label: 'Layer Adhesion' },
        { key: 'shrinkage', label: 'Shrinkage' },
        { key: 'density', label: 'Density' }
      ];

      specItems.forEach(item => {
        if (f.specs[item.key]) {
          const specItem = document.createElement('div');
          specItem.className = 'spec-item';
          
          const specLabel = document.createElement('span');
          specLabel.className = 'spec-label';
          specLabel.textContent = item.label + ':';
          
          const specValue = document.createElement('span');
          specValue.className = 'spec-value';
          specValue.textContent = f.specs[item.key];
          
          specItem.appendChild(specLabel);
          specItem.appendChild(specValue);
          specsGrid.appendChild(specItem);
        }
      });

      specsContent.appendChild(specsGrid);
      card.appendChild(detailsButton);
      card.appendChild(specsContent);
    }
    grid.appendChild(card);
  });
}

function setupFilters(allData){
  const q = document.getElementById('search');
  const tierChecks = Array.from(document.querySelectorAll('input[name="tier"]'));
  const flagEnclosure = document.getElementById('flag-enclosure');
  const flagHardened  = document.getElementById('flag-hardened');
  const flagHygro     = document.getElementById('flag-hygro');
  const flagAesthetic = document.getElementById('flag-aesthetic');

  function apply(){
    const tiers = new Set(tierChecks.filter(c=>c.checked).map(c=>c.value));
    const text = q.value.trim().toLowerCase();
    let filtered = allData.filter(f => tiers.has(f.tier));
    if(text){
      const searchText = f => {
        let text = f.name + ' ' + f.notes + ' ' + (f.use_cases||'') + ' ' + (f.badges||[]).join(' ');
        if (f.specs) {
          text += ' ' + Object.values(f.specs).join(' ');
        }
        return text.toLowerCase();
      };
      filtered = filtered.filter(f => searchText(f).includes(text));
    }
    if(flagEnclosure.checked) filtered = filtered.filter(f => f.enclosure || (f.badges||[]).some(b => /enclosure/i.test(b)));
    if(flagHardened.checked)  filtered = filtered.filter(f => (f.badges||[]).some(b => /hardened/i.test(b)));
    if(flagHygro.checked)     filtered = filtered.filter(f => f.hygroscopic || (f.badges||[]).some(b => /moisture/i.test(b)));
    if(flagAesthetic.checked) filtered = filtered.filter(f => (f.badges||[]).some(b => /Aesthetic/i.test(b)));

    render(filtered);
  }

  [q, flagEnclosure, flagHardened, flagHygro, flagAesthetic, ...tierChecks].forEach(el => el.addEventListener('input', apply));
  apply();
}

fetchOrFallback().then(data => { render(data); setupFilters(data); });
