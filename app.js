
// Global state for comparison
let comparisonFilaments = new Set();
let allFilaments = [];

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

function wrapTooltipText(text, maxLength = 50) {
  if (text.length <= maxLength) return [text];
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word is longer than maxLength, force it on its own line
        lines.push(word);
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

function getOptimalCharacterLimit(tooltipElement, canvasElement = null) {
  if (!tooltipElement) return 50;
  
  // Get the actual width of the tooltip
  const tooltipWidth = tooltipElement.offsetWidth || tooltipElement.clientWidth;
  
  // If we have a canvas element, use its size to determine optimal character limit
  let canvasWidth = 400; // Default fallback
  if (canvasElement) {
    const rect = canvasElement.getBoundingClientRect();
    canvasWidth = rect.width || canvasElement.width || 400;
  }
  
  // For very small canvases (card charts), use a much more conservative approach
  if (canvasWidth < 200) {
    return 20; // Very conservative limit for card charts
  }
  
  // Calculate character limit based on both tooltip width and canvas size
  // Smaller canvas = more conservative character limits
  const canvasRatio = Math.min(canvasWidth / 400, 1); // Normalize to 400px reference
  const baseCharsPerLine = Math.floor(tooltipWidth / 8);
  
  // Adjust based on canvas size - smaller canvas gets more conservative limits
  let adjustedChars = Math.floor(baseCharsPerLine * canvasRatio);
  
  // Add padding and ensure reasonable bounds
  const padding = Math.max(10, Math.floor(adjustedChars * 0.3)); // 30% padding
  const minLimit = Math.max(20, Math.floor(adjustedChars * 0.3)); // At least 30% of adjusted
  const maxLimit = Math.min(100, Math.floor(adjustedChars * 0.9)); // Up to 90% of adjusted
  
  const optimalLength = Math.max(minLimit, Math.min(maxLimit, adjustedChars - padding));
  
  return optimalLength;
}

function createDynamicTooltipCallback(chartData, filament, isComparison = false, canvasElement = null) {
  return function(context) {
    const spec = chartData[context.dataIndex];
    const originalValue = filament.specs[spec.key] || 'N/A';
    const normalizedValue = context.parsed.r.toFixed(0);
    
    // Try to get the tooltip element for dynamic sizing
    const tooltipElement = document.querySelector('.chartjs-tooltip');
    const charLimit = getOptimalCharacterLimit(tooltipElement, canvasElement);
    
    const wrappedDescription = wrapTooltipText(spec.description, charLimit);
    
    if (isComparison) {
      return [
        `${context.label}: ${originalValue} (${normalizedValue}%)`,
        '',
        ...wrappedDescription
      ];
    } else {
      return [
        `${originalValue} (${normalizedValue}%)`,
        '',
        ...wrappedDescription
      ];
    }
  };
}

function createCardRadarChart(filament, canvas) {
  const chartData = [
    { 
      key: 'warping', 
      label: 'Warping',
      description: 'How much the material bends during printing. Low warping means easier printing with fewer failed prints and better dimensional accuracy.'
    },
    { 
      key: 'temperature_resistance', 
      label: 'Temp',
      description: 'Maximum temperature before the material deforms or loses its shape. Higher values mean better performance in hot environments and automotive applications.'
    },
    { 
      key: 'flexibility', 
      label: 'Flex',
      description: 'How much the material can bend before breaking. Higher flexibility means more durable parts that can absorb impacts and stress without cracking.'
    },
    { 
      key: 'tensile_strength', 
      label: 'Strength',
      description: 'Resistance to breaking when pulled apart. Higher tensile strength means stronger parts that can handle more load and mechanical stress.'
    },
    { 
      key: 'impact_resistance', 
      label: 'Impact',
      description: 'Resistance to breaking from sudden force or impact. Higher impact resistance means more durable parts that won\'t crack when dropped or hit.'
    },
    { 
      key: 'print_speed', 
      label: 'Speed',
      description: 'How fast you can print without quality issues. Higher print speeds mean faster prototyping and production, saving time and material costs.'
    }
  ];
  
  const ctx = canvas.getContext('2d');
  
  const chart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: chartData.map(data => data.label),
      datasets: [{
        data: chartData.map(data => normalizeSpecValue(filament.specs[data.key], data.key) * 100),
        borderColor: '#7aa2f7',
        backgroundColor: 'rgba(122, 162, 247, 0.2)',
        pointBackgroundColor: '#7aa2f7',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 2,
        pointHoverRadius: 3,
        borderWidth: 1.5,
        fill: true
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#14171c',
          titleColor: '#7aa2f7',
          bodyColor: '#e6e9ef',
          borderColor: '#1f2430',
          borderWidth: 1,
          cornerRadius: 6,
          displayColors: false,
          callbacks: {
            title: function(context) {
              return context[0].label;
            },
            label: function(context) {
              const spec = chartData[context.dataIndex];
              const originalValue = filament.specs[spec.key] || 'N/A';
              const normalizedValue = context.parsed.r.toFixed(0);
              return [
                `${originalValue} (${normalizedValue}%)`
              ];
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          min: 0,
          ticks: {
            display: false
          },
          grid: {
            color: '#2a3347'
          },
          angleLines: {
            color: '#2a3347'
          },
                  pointLabels: {
          color: '#a6adbb',
          font: {
            size: 10
          }
        }
        }
      },
      elements: {
        line: {
          tension: 0.1
        }
      }
    }
  });
}

function render(data){
  const grid = document.getElementById('results');
  grid.innerHTML = '';
  data.forEach(f => {
    const card = document.createElement('article');
    card.className = 'card';
    card.style.position = 'relative';
    
    // Add comparison checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'comparison-checkbox';
    checkbox.checked = comparisonFilaments.has(f.name);
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        comparisonFilaments.add(f.name);
      } else {
        comparisonFilaments.delete(f.name);
      }
      updateComparisonControls();
    });
    card.appendChild(checkbox);
    
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
      
      // Create canvas for Chart.js
      const canvas = document.createElement('canvas');
      canvas.id = `chart-${f.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
      canvas.width = 160;
      canvas.height = 160;
      chartContainer.appendChild(canvas);
      
      card.appendChild(chartContainer);
      
      // Create Chart.js radar chart for this filament
      createCardRadarChart(f, canvas);

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

// Comparison functionality
function updateComparisonControls() {
  const compareBtn = document.getElementById('compare-btn');
  const clearBtn = document.getElementById('clear-compare-btn');
  const count = comparisonFilaments.size;
  
  compareBtn.disabled = count < 2;
  clearBtn.disabled = count === 0;
  compareBtn.textContent = `Compare (${count})`;
}

function showComparison() {
  const modal = document.getElementById('comparison-modal');
  const selectedFilaments = allFilaments.filter(f => comparisonFilaments.has(f.name));
  
  if (selectedFilaments.length < 2) return;
  
  // Show modal first
  modal.style.display = 'flex';
  
  // Create comparison table
  const tableContainer = document.getElementById('comparison-table');
  tableContainer.innerHTML = createComparisonTable(selectedFilaments);
  
  // Create comparison charts after modal is visible and canvas is ready
  requestAnimationFrame(() => {
    createComparisonCharts(selectedFilaments);
  });
}

function createComparisonTable(filaments) {
  const table = document.createElement('table');
  
  // Header row
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th>Property</th>';
  filaments.forEach(f => {
    const th = document.createElement('th');
    th.innerHTML = `<div class="filament-name">${f.name}</div><span class="tier-badge ${f.tier}">${f.tier}</span>`;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);
  
  // Basic properties with improved styling
  const properties = [
    { key: 'temp', label: 'Nozzle Temp' },
    { key: 'use_cases', label: 'Use Cases' },
    { key: 'notes', label: 'Notes' },
    { key: 'enclosure', label: 'Prefers Enclosure', transform: (val) => val ? 'Yes' : 'No' },
    { key: 'hygroscopic', label: 'Moisture Sensitive', transform: (val) => val ? 'Yes' : 'No' }
  ];
  
  properties.forEach(prop => {
    const row = document.createElement('tr');
    const labelCell = document.createElement('td');
    labelCell.textContent = prop.label;
    labelCell.style.fontWeight = '600';
    labelCell.style.color = 'var(--muted)';
    row.appendChild(labelCell);
    
    filaments.forEach((f, index) => {
      const cell = document.createElement('td');
      const cellContent = document.createElement('div');
      cellContent.className = 'comparison-cell comparison-basic-highlight';
      
      let value = f[prop.key];
      if (prop.transform) {
        value = prop.transform(value);
      }
      cellContent.textContent = value || 'N/A';
      cell.appendChild(cellContent);
      row.appendChild(cell);
    });
    
    table.appendChild(row);
  });
  
  // Badges row with improved styling
  const badgesRow = document.createElement('tr');
  const badgesLabelCell = document.createElement('td');
  badgesLabelCell.textContent = 'Flags';
  badgesLabelCell.style.fontWeight = '600';
  badgesLabelCell.style.color = 'var(--muted)';
  badgesRow.appendChild(badgesLabelCell);
  
  filaments.forEach((f, index) => {
    const cell = document.createElement('td');
    const cellContent = document.createElement('div');
    cellContent.className = 'comparison-cell comparison-basic-highlight';
    
    const badgesContainer = document.createElement('div');
    badgesContainer.className = 'comparison-badges';
    
    // Get badges for this filament
    const canonical = (label) => {
      const s = String(label).trim().toLowerCase();
      if (/enclosure/.test(s)) return 'Prefers enclosure';
      if (/hardened/.test(s))  return 'Requires hardened nozzle';
      if (/moisture/.test(s))  return 'Moisture sensitive';
      if (/aesthetic/.test(s)) return 'Aesthetic';
      return label;
    };
    const badgeSet = new Set();
    (f.badges || []).forEach(b => badgeSet.add(canonical(b)));
    if (f.enclosure)    badgeSet.add('Prefers enclosure');
    if (f.hygroscopic)  badgeSet.add('Moisture sensitive');
    const badgeValues = Array.from(badgeSet);
    
    badgeValues.forEach(badge => {
      const badgeEl = document.createElement('span');
      badgeEl.className = 'comparison-badge';
      if (badge.toLowerCase().includes('enclosure')) badgeEl.classList.add('enclosure');
      if (badge.toLowerCase().includes('hardened')) badgeEl.classList.add('hardened');
      if (badge.toLowerCase().includes('moisture')) badgeEl.classList.add('hygro');
      if (badge.toLowerCase().includes('aesthetic')) badgeEl.classList.add('aesthetic');
      badgeEl.textContent = badge;
      badgesContainer.appendChild(badgeEl);
    });
    
    if (badgeValues.length === 0) {
      badgesContainer.textContent = 'None';
    }
    
    cellContent.appendChild(badgesContainer);
    cell.appendChild(cellContent);
    badgesRow.appendChild(cell);
  });
  
  table.appendChild(badgesRow);
  
  // Specifications rows with improved styling
  if (filaments[0].specs) {
    const specProperties = [
      { key: 'warping', label: 'Warping' },
      { key: 'temperature_resistance', label: 'Temp Resistance' },
      { key: 'flexibility', label: 'Flexibility' },
      { key: 'tensile_strength', label: 'Tensile Strength' },
      { key: 'impact_resistance', label: 'Impact Resistance' },
      { key: 'chemical_resistance', label: 'Chemical Resistance' },
      { key: 'uv_resistance', label: 'UV Resistance' },
      { key: 'bed_temp', label: 'Bed Temp' },
      { key: 'print_speed', label: 'Print Speed' },
      { key: 'layer_adhesion', label: 'Layer Adhesion' },
      { key: 'shrinkage', label: 'Shrinkage' },
      { key: 'density', label: 'Density' }
    ];
    
    specProperties.forEach(spec => {
      const row = document.createElement('tr');
      const labelCell = document.createElement('td');
      labelCell.textContent = spec.label;
      labelCell.style.fontWeight = '600';
      labelCell.style.color = 'var(--muted)';
      row.appendChild(labelCell);
      
      filaments.forEach((f, index) => {
        const cell = document.createElement('td');
        const cellContent = document.createElement('div');
        cellContent.className = 'comparison-cell comparison-spec-highlight';
        cellContent.textContent = f.specs?.[spec.key] || 'N/A';
        cell.appendChild(cellContent);
        row.appendChild(cell);
      });
      
      table.appendChild(row);
    });
  }
  
  return table.outerHTML;
}

let radarChart = null;

function createComparisonCharts(filaments) {
  if (!filaments[0].specs) return '';
  
  console.log('Creating radar chart for filaments:', filaments.map(f => f.name));
  
  // Destroy existing chart if it exists
  if (radarChart) {
    radarChart.destroy();
  }
  
  // Get canvas element
  const canvas = document.getElementById('radar-chart');
  if (!canvas) {
    console.error('Canvas element not found!');
    return '';
  }
  
  // Check if canvas is visible and has dimensions
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    console.warn('Canvas has no dimensions, retrying...');
    // Retry on next frame if canvas isn't ready
    requestAnimationFrame(() => createComparisonCharts(filaments));
    return '';
  }
  
  console.log('Canvas found and ready:', canvas, 'Dimensions:', rect.width, 'x', rect.height);
  
  // Create Chart.js radar chart
  const ctx = canvas.getContext('2d');
  
  const chartData = [
    { 
      key: 'warping', 
      label: 'Warping',
      description: 'How much the material bends during printing. Low warping means easier printing with fewer failed prints and better dimensional accuracy.'
    },
    { 
      key: 'temperature_resistance', 
      label: 'Temperature Resistance',
      description: 'Maximum temperature before the material deforms or loses its shape. Higher values mean better performance in hot environments and automotive applications.'
    },
    { 
      key: 'flexibility', 
      label: 'Flexibility',
      description: 'How much the material can bend before breaking. Higher flexibility means more durable parts that can absorb impacts and stress without cracking.'
    },
    { 
      key: 'tensile_strength', 
      label: 'Tensile Strength',
      description: 'Resistance to breaking when pulled apart. Higher tensile strength means stronger parts that can handle more load and mechanical stress.'
    },
    { 
      key: 'impact_resistance', 
      label: 'Impact Resistance',
      description: 'Resistance to breaking from sudden force or impact. Higher impact resistance means more durable parts that won\'t crack when dropped or hit.'
    },
    { 
      key: 'print_speed', 
      label: 'Print Speed',
      description: 'How fast you can print without quality issues. Higher print speeds mean faster prototyping and production, saving time and material costs.'
    }
  ];
  
  const datasets = filaments.map((filament, index) => {
    const colors = ['#7aa2f7', '#9ece6a', '#e0af68', '#bb9af7', '#f7768e', '#7dcfff'];
    const color = colors[index % colors.length];
    
    return {
      label: filament.name,
      data: chartData.map(data => normalizeSpecValue(filament.specs[data.key], data.key) * 100),
      borderColor: color,
      backgroundColor: color + '20',
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 2,
      fill: true
    };
  });
  
  try {
    radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: chartData.map(data => data.label),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#e6e9ef',
              font: {
                size: 12
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: '#14171c',
            titleColor: '#7aa2f7',
            bodyColor: '#e6e9ef',
            borderColor: '#1f2430',
            borderWidth: 1,
            cornerRadius: 6,
            displayColors: true,
            callbacks: {
              title: function(context) {
                return context[0].dataset.label;
              },
              label: function(context) {
                const filament = filaments[context.datasetIndex];
                return createDynamicTooltipCallback(chartData, filament, true, canvas)(context);
              }
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            min: 0,
            ticks: {
              display: false
            },
            grid: {
              color: '#2a3347'
            },
            angleLines: {
              color: '#2a3347'
            },
            pointLabels: {
              color: '#a6adbb',
              font: {
                size: 11
              }
            }
          }
        },
        elements: {
          line: {
            tension: 0.1
          }
        }
      }
    });
    
    console.log('Chart created successfully:', radarChart);
  } catch (error) {
    console.error('Error creating chart:', error);
  }
  
  return '';
}

function clearComparison() {
  comparisonFilaments.clear();
  updateComparisonControls();
  
  // Uncheck all checkboxes
  document.querySelectorAll('.comparison-checkbox').forEach(checkbox => {
    checkbox.checked = false;
  });
}

function setupComparison() {
  const compareBtn = document.getElementById('compare-btn');
  const clearBtn = document.getElementById('clear-compare-btn');
  const closeBtn = document.getElementById('close-comparison');
  const modal = document.getElementById('comparison-modal');
  
  compareBtn.addEventListener('click', showComparison);
  clearBtn.addEventListener('click', clearComparison);
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

fetchOrFallback().then(data => { 
  allFilaments = data;
  render(data); 
  setupFilters(data); 
  setupComparison();
  updateComparisonControls();
  addAxisInfoToLegend();
});

// Add axis info to existing legend section
function addAxisInfoToLegend() {
  const legend = document.querySelector('.legend');
  if (!legend) return;
  
  // Add axis descriptions to the legend
  const axisInfo = document.createElement('div');
  axisInfo.className = 'axis-descriptions';
  axisInfo.style.cssText = `
    margin-top: 16px;
    padding: 12px;
    background: rgba(122, 162, 247, 0.05);
    border: 1px solid rgba(122, 162, 247, 0.2);
    border-radius: 6px;
    font-size: 12px;
    line-height: 1.4;
  `;
  
  axisInfo.innerHTML = `
    <h4 style="margin: 0 0 8px 0; color: #7aa2f7; font-size: 14px;">Chart Axis Descriptions:</h4>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 8px;">
      <div><strong>Warping:</strong> How much the material bends during printing. Low warping means easier printing with fewer failed prints.</div>
      <div><strong>Temperature Resistance:</strong> Maximum temperature before the material deforms. Higher values mean better performance in hot environments.</div>
      <div><strong>Flexibility:</strong> How much the material can bend before breaking. Higher flexibility means more durable parts.</div>
      <div><strong>Tensile Strength:</strong> Resistance to breaking when pulled apart. Higher tensile strength means stronger parts.</div>
      <div><strong>Impact Resistance:</strong> Resistance to breaking from sudden force. Higher impact resistance means more durable parts.</div>
      <div><strong>Print Speed:</strong> How fast you can print without quality issues. Higher print speeds mean faster prototyping.</div>
    </div>
  `;
  
  legend.appendChild(axisInfo);
}
