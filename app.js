
// Global state for comparison
let comparisonFilaments = new Set();
let allFilaments = [];

// Storage keys for persistence
const STORAGE_KEYS = {
  FILTERS: 'filamentApp_filters',
  COMPARISON: 'filamentApp_comparison',
  UI_STATE: 'filamentApp_uiState',
  SEARCH: 'filamentApp_search'
};

// Storage utility functions
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

function clearStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
}

// State persistence functions
function saveCurrentState() {
  // Save filter states
  const filterState = {
    search: document.getElementById('search').value,
    materialFilters: {
      pla: document.getElementById('filter-pla').checked,
      petg: document.getElementById('filter-petg').checked,
      abs: document.getElementById('filter-abs').checked,
      tpu: document.getElementById('filter-tpu').checked,
      nylon: document.getElementById('filter-nylon').checked,
      other: document.getElementById('filter-other').checked
    },
    tierFilters: Array.from(document.querySelectorAll('input[name="tier"]')).map(cb => ({
      value: cb.value,
      checked: cb.checked
    })),
    difficultyFilters: {
      beginner: document.getElementById('filter-beginner').checked,
      intermediate: document.getElementById('filter-intermediate').checked,
      advanced: document.getElementById('filter-advanced').checked
    },
    priceFilters: {
      budget: document.getElementById('filter-budget').checked,
      midrange: document.getElementById('filter-midrange').checked,
      premium: document.getElementById('filter-premium').checked
    },
    requirementFilters: {
      enclosure: document.getElementById('flag-enclosure').checked,
      hardened: document.getElementById('flag-hardened').checked,
      hygro: document.getElementById('flag-hygro').checked
    },
    useCaseFilters: {
      aesthetic: document.getElementById('flag-aesthetic').checked,
      functional: document.getElementById('flag-functional').checked,
      prototyping: document.getElementById('flag-prototyping').checked,
      outdoor: document.getElementById('flag-outdoor').checked
    },
    videoFilters: {
      s: document.getElementById('video-filter-s').checked,
      a: document.getElementById('video-filter-a').checked,
      b: document.getElementById('video-filter-b').checked,
      c: document.getElementById('video-filter-c').checked,
      f: document.getElementById('video-filter-f').checked
    },
    otherFilters: {
      professionalOnly: document.getElementById('flag-professional-only').checked,
      popularMaterials: document.getElementById('flag-popular-materials').checked
    },
    specFilters: {
      flexible: document.getElementById('spec-flexible').checked,
      strong: document.getElementById('spec-strong').checked,
      highImpact: document.getElementById('spec-high-impact').checked,
      lowWarping: document.getElementById('spec-low-warping').checked,
      highTemp: document.getElementById('spec-high-temp').checked,
      fastPrint: document.getElementById('spec-fast-print').checked,
      easyPrint: document.getElementById('spec-easy-print').checked,
      goodSurface: document.getElementById('spec-good-surface').checked,
      lowToxicity: document.getElementById('spec-low-toxicity').checked,
      lowVoc: document.getElementById('spec-low-voc').checked,
      biodegradable: document.getElementById('spec-biodegradable').checked,
      recyclable: document.getElementById('spec-recyclable').checked,
      foodSafe: document.getElementById('spec-food-safe').checked,
      medicalGrade: document.getElementById('spec-medical-grade').checked,
      conductive: document.getElementById('spec-conductive').checked,
      uvResistant: document.getElementById('spec-uv-resistant').checked
    }
  };
  
  // Save UI state (collapsed/expanded filter groups)
  const uiState = {
    filterGroups: Array.from(document.querySelectorAll('.filter-group')).map(group => ({
      id: group.querySelector('.filter-options').id,
      collapsed: group.classList.contains('collapsed')
    })),
    expandedDetails: Array.from(document.querySelectorAll('.specs-content')).map(specs => ({
      cardId: specs.closest('.card').querySelector('h3').textContent.trim(),
      visible: specs.style.display !== 'none'
    }))
  };
  
  // Save comparison state
  const comparisonState = Array.from(comparisonFilaments);
  
  // Save all states
  saveToStorage(STORAGE_KEYS.FILTERS, filterState);
  saveToStorage(STORAGE_KEYS.UI_STATE, uiState);
  saveToStorage(STORAGE_KEYS.COMPARISON, comparisonState);
}

function loadSavedState() {
  // Load filter states
  const filterState = loadFromStorage(STORAGE_KEYS.FILTERS, {});
  
  if (filterState.search) {
    document.getElementById('search').value = filterState.search;
  }
  
  // Load material filters
  if (filterState.materialFilters) {
    Object.entries(filterState.materialFilters).forEach(([key, checked]) => {
      const element = document.getElementById(`filter-${key}`);
      if (element) element.checked = checked;
    });
  }
  
  // Load tier filters
  if (filterState.tierFilters) {
    filterState.tierFilters.forEach(tier => {
      const element = document.querySelector(`input[name="tier"][value="${tier.value}"]`);
      if (element) element.checked = tier.checked;
    });
  }
  
  // Load difficulty filters
  if (filterState.difficultyFilters) {
    Object.entries(filterState.difficultyFilters).forEach(([key, checked]) => {
      const element = document.getElementById(`filter-${key}`);
      if (element) element.checked = checked;
    });
  }
  
  // Load price filters
  if (filterState.priceFilters) {
    Object.entries(filterState.priceFilters).forEach(([key, checked]) => {
      const element = document.getElementById(`filter-${key}`);
      if (element) element.checked = checked;
    });
  }
  
  // Load requirement filters
  if (filterState.requirementFilters) {
    Object.entries(filterState.requirementFilters).forEach(([key, checked]) => {
      const element = document.getElementById(`flag-${key}`);
      if (element) element.checked = checked;
    });
  }
  
  // Load use case filters
  if (filterState.useCaseFilters) {
    Object.entries(filterState.useCaseFilters).forEach(([key, checked]) => {
      const element = document.getElementById(`flag-${key}`);
      if (element) element.checked = checked;
    });
  }
  
  // Load video filters
  if (filterState.videoFilters) {
    Object.entries(filterState.videoFilters).forEach(([key, checked]) => {
      const element = document.getElementById(`video-filter-${key}`);
      if (element) element.checked = checked;
    });
  }
  
  // Load other filters
  if (filterState.otherFilters) {
    Object.entries(filterState.otherFilters).forEach(([key, checked]) => {
      const element = document.getElementById(`flag-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      if (element) element.checked = checked;
    });
  }
  
  // Load spec filters
  if (filterState.specFilters) {
    Object.entries(filterState.specFilters).forEach(([key, checked]) => {
      const element = document.getElementById(`spec-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      if (element) element.checked = checked;
    });
  }
  
  // Load UI state
  const uiState = loadFromStorage(STORAGE_KEYS.UI_STATE, {});
  
  if (uiState.filterGroups) {
    uiState.filterGroups.forEach(group => {
      const element = document.getElementById(group.id);
      if (element) {
        const filterGroup = element.closest('.filter-group');
        if (group.collapsed) {
          filterGroup.classList.add('collapsed');
        } else {
          filterGroup.classList.remove('collapsed');
        }
      }
    });
  }
  
  // Load comparison state
  const comparisonState = loadFromStorage(STORAGE_KEYS.COMPARISON, []);
  comparisonFilaments = new Set(comparisonState);
  
  return { filterState, uiState, comparisonState };
}

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
      
    case 'surface_quality':
      if (val.includes('excellent') || val.includes('mirror')) return 1;
      if (val.includes('high') || val.includes('smooth')) return 0.8;
      if (val.includes('moderate') || val.includes('good')) return 0.6;
      if (val.includes('low') || val.includes('rough')) return 0.4;
      if (val.includes('very low') || val.includes('poor')) return 0.2;
      return 0.5;
      
    case 'cost_effectiveness':
      if (val.includes('excellent') || val.includes('very high')) return 1;
      if (val.includes('high') || val.includes('good value')) return 0.8;
      if (val.includes('moderate') || val.includes('fair')) return 0.6;
      if (val.includes('low') || val.includes('poor value')) return 0.4;
      if (val.includes('very low') || val.includes('expensive')) return 0.2;
      return 0.5;
      
    case 'post_processing':
      if (val.includes('excellent') || val.includes('very easy')) return 1;
      if (val.includes('good') || val.includes('easy')) return 0.8;
      if (val.includes('moderate') || val.includes('fair')) return 0.6;
      if (val.includes('poor') || val.includes('difficult')) return 0.4;
      if (val.includes('very poor') || val.includes('very difficult')) return 0.2;
      return 0.5;
      
    case 'ease_of_printing':
      if (val.includes('very high') || val.includes('excellent') || val.includes('beginner')) return 1;
      if (val.includes('high') || val.includes('easy') || val.includes('forgiving')) return 0.8;
      if (val.includes('moderate') || val.includes('fair')) return 0.6;
      if (val.includes('low') || val.includes('difficult') || val.includes('challenging')) return 0.4;
      if (val.includes('very low') || val.includes('expert') || val.includes('very difficult')) return 0.2;
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

// Chart 1: Core Performance (always visible)
function createCorePerformanceChart(filament, canvas) {
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

// Chart 2: Quality & Usability
function createQualityUsabilityChart(filament, canvas) {
  const chartData = [
    { 
      key: 'surface_quality', 
      label: 'Surface',
      description: 'How good the final print looks. Higher values mean smoother, more consistent surface finish with less visible layer lines.'
    },
    { 
      key: 'cost_effectiveness', 
      label: 'Value',
      description: 'Price vs. performance ratio. Higher values mean better bang for your buck - good performance at a reasonable price.'
    },
    { 
      key: 'post_processing', 
      label: 'Finish',
      description: 'How easy it is to finish the print. Higher values mean easier sanding, painting, and post-processing work.'
    },
    { 
      key: 'ease_of_printing', 
      label: 'Easy',
      description: 'How forgiving and easy the material is to print. Higher values mean less tuning, more consistent results, and beginner-friendly.'
    },
    { 
      key: 'layer_adhesion', 
      label: 'Adhesion',
      description: 'How well layers stick together. Higher values mean stronger prints with better inter-layer bonding.'
    },
    { 
      key: 'dimensional_accuracy', 
      label: 'Accuracy',
      description: 'How precise the printed dimensions are. Higher values mean more accurate prints that match the design.'
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

// Chart 3: Safety & Environmental
function createSafetyEnvironmentalChart(filament, canvas) {
  const chartData = [
    { 
      key: 'voc_emissions', 
      label: 'VOC',
      description: 'Volatile organic compounds released during printing. Lower values mean better air quality and safer indoor printing.'
    },
    { 
      key: 'toxicity', 
      label: 'Toxicity',
      description: 'Health safety level. Lower values mean safer handling and less risk of health issues.'
    },
    { 
      key: 'biodegradability', 
      label: 'Bio',
      description: 'How well the material breaks down naturally. Higher values mean more environmentally friendly.'
    },
    { 
      key: 'recyclability', 
      label: 'Recycle',
      description: 'How easily the material can be recycled. Higher values mean better waste reduction.'
    },
    { 
      key: 'chemical_safety', 
      label: 'Safety',
      description: 'Safe handling requirements. Lower values mean safer handling with fewer precautions needed.'
    },
    { 
      key: 'storage_requirements', 
      label: 'Storage',
      description: 'Special storage needs. Lower values mean easier storage with fewer special requirements.'
    }
  ];
  
  const ctx = canvas.getContext('2d');
  
  const chart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: chartData.map(data => data.label),
      datasets: [{
        data: chartData.map(data => normalizeSpecValue(filament.specs[data.key], data.key) * 100),
        borderColor: '#9ece6a',
        backgroundColor: 'rgba(158, 206, 106, 0.2)',
        pointBackgroundColor: '#9ece6a',
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
          titleColor: '#9ece6a',
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

// Chart 4: Advanced Properties
function createAdvancedPropertiesChart(filament, canvas) {
  const chartData = [
    { 
      key: 'electrical_conductivity', 
      label: 'Electrical',
      description: 'Electrical properties. Lower values mean better insulating properties.'
    },
    { 
      key: 'food_safety', 
      label: 'Food',
      description: 'Food contact safety. Higher values mean safer for food-related applications.'
    },
    { 
      key: 'medical_grade', 
      label: 'Medical',
      description: 'Medical device compatibility. Higher values mean better for medical applications.'
    },
    { 
      key: 'uv_resistance', 
      label: 'UV',
      description: 'Resistance to UV degradation. Higher values mean better outdoor durability.'
    },
    { 
      key: 'chemical_resistance', 
      label: 'Chemical',
      description: 'Resistance to chemical exposure. Higher values mean better chemical durability.'
    },
    { 
      key: 'creep_resistance', 
      label: 'Creep',
      description: 'Resistance to permanent deformation under load. Higher values mean better long-term stability.'
    }
  ];
  
  const ctx = canvas.getContext('2d');
  
  const chart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: chartData.map(data => data.label),
      datasets: [{
        data: chartData.map(data => normalizeSpecValue(filament.specs[data.key], data.key) * 100),
        borderColor: '#e0af68',
        backgroundColor: 'rgba(224, 175, 104, 0.2)',
        pointBackgroundColor: '#e0af68',
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
          titleColor: '#e0af68',
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

// Function to create additional charts in details view
function createAdditionalCharts(filament, container) {
  console.log('createAdditionalCharts called for:', filament.name);
  const additionalChartsContainer = container.querySelector('.additional-charts');
  if (!additionalChartsContainer) {
    console.log('No additional charts container found');
    return;
  }
  console.log('Found additional charts container, creating charts...');
  
  // Chart 2: Quality & Usability
  const qualityContainer = document.createElement('div');
  qualityContainer.className = 'quality-chart-container';
  qualityContainer.style.cssText = `
    background: rgba(122, 162, 247, 0.05);
    border: 1px solid rgba(122, 162, 247, 0.2);
    border-radius: 8px;
    padding: 15px;
  `;
  
  const qualityTitle = document.createElement('h4');
  qualityTitle.textContent = 'Quality & Usability';
  qualityTitle.style.cssText = 'margin: 0 0 10px 0; color: #7aa2f7; font-size: 14px;';
  qualityContainer.appendChild(qualityTitle);
  
  const qualityCanvas = document.createElement('canvas');
  qualityCanvas.width = 180;
  qualityCanvas.height = 180;
  qualityContainer.appendChild(qualityCanvas);
  
  // Chart 3: Safety & Environmental
  const safetyContainer = document.createElement('div');
  safetyContainer.style.cssText = `
    background: rgba(158, 206, 106, 0.05);
    border: 1px solid rgba(158, 206, 106, 0.2);
    border-radius: 8px;
    padding: 15px;
  `;
  
  const safetyTitle = document.createElement('h4');
  safetyTitle.textContent = 'Safety & Environmental';
  safetyTitle.style.cssText = 'margin: 0 0 10px 0; color: #9ece6a; font-size: 14px;';
  safetyContainer.appendChild(safetyTitle);
  
  const safetyCanvas = document.createElement('canvas');
  safetyCanvas.width = 180;
  safetyCanvas.height = 180;
  safetyContainer.appendChild(safetyCanvas);
  
  // Chart 4: Advanced Properties
  const advancedContainer = document.createElement('div');
  advancedContainer.style.cssText = `
    background: rgba(224, 175, 104, 0.05);
    border: 1px solid rgba(224, 175, 104, 0.2);
    border-radius: 8px;
    padding: 15px;
  `;
  
  const advancedTitle = document.createElement('h4');
  advancedTitle.textContent = 'Advanced Properties';
  advancedTitle.style.cssText = 'margin: 0 0 10px 0; color: #e0af68; font-size: 14px;';
  advancedContainer.appendChild(advancedTitle);
  
  const advancedCanvas = document.createElement('canvas');
  advancedCanvas.width = 180;
  advancedCanvas.height = 180;
  advancedContainer.appendChild(advancedCanvas);
  
  additionalChartsContainer.appendChild(qualityContainer);
  additionalChartsContainer.appendChild(safetyContainer);
  additionalChartsContainer.appendChild(advancedContainer);
  
  // Create the charts
  createQualityUsabilityChart(filament, qualityCanvas);
  createSafetyEnvironmentalChart(filament, safetyCanvas);
  createAdvancedPropertiesChart(filament, advancedCanvas);
}

function render(data){
  const grid = document.getElementById('results');
  const resultsCount = document.getElementById('results-count');
  
  // Update the count display
  const count = data.length;
  resultsCount.textContent = `Showing ${count} filament${count !== 1 ? 's' : ''}`;
  
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
      saveCurrentState(); // Save state when comparison changes
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

    // Create card content container
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    
    cardContent.appendChild(name);
    cardContent.appendChild(meta);
    cardContent.appendChild(notes);
    cardContent.appendChild(badges);

    // Add radar chart for specifications
    if (f.specs) {
      // Create card bottom container for chart and button
      const cardBottom = document.createElement('div');
      cardBottom.className = 'card-bottom';
      
      const chartContainer = document.createElement('div');
      chartContainer.className = 'radar-chart-container';
      
      // Create canvas for Core Performance chart
      const canvas = document.createElement('canvas');
      canvas.id = `chart-${f.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
      canvas.width = 160;
      canvas.height = 160;
      chartContainer.appendChild(canvas);
      
      cardBottom.appendChild(chartContainer);
      
      // Create Core Performance radar chart for this filament
      createCorePerformanceChart(f, canvas);

      // Add details button
      const detailsButton = document.createElement('button');
      detailsButton.className = 'details-button';
      detailsButton.textContent = 'Details';
      detailsButton.addEventListener('click', () => {
        const specsContent = card.querySelector('.specs-content');
        const isVisible = specsContent.style.display !== 'none';
        specsContent.style.display = isVisible ? 'none' : 'block';
        detailsButton.textContent = isVisible ? 'Details' : 'Hide';
        
        // Create additional charts when first expanded
        if (!isVisible && !specsContent.querySelector('.quality-chart-container')) {
          console.log('Creating additional charts for:', f.name);
          createAdditionalCharts(f, specsContent);
        }
        
        // Save state when details are toggled
        saveCurrentState();
      });

      cardBottom.appendChild(detailsButton);

      const specsContent = document.createElement('div');
      specsContent.className = 'specs-content';
      specsContent.style.display = 'none';
      
      // Create additional charts container (will be populated when details are expanded)
      const additionalChartsContainer = document.createElement('div');
      additionalChartsContainer.className = 'additional-charts';
      additionalChartsContainer.style.cssText = `
        margin-bottom: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
      `;
      specsContent.appendChild(additionalChartsContainer);
      
      const specsGrid = document.createElement('div');
      specsGrid.className = 'specs-grid';
      
      // Create specification items
      const specItems = [
        // Core Properties
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
        { key: 'density', label: 'Density' },
        
        // Quality & Usability
        { key: 'surface_quality', label: 'Surface Quality' },
        { key: 'cost_effectiveness', label: 'Cost Effectiveness' },
        { key: 'post_processing', label: 'Post-Processing' },
        { key: 'ease_of_printing', label: 'Ease of Printing' },
        { key: 'dimensional_accuracy', label: 'Dimensional Accuracy' },
        
        // Safety & Environmental
        { key: 'voc_emissions', label: 'VOC Emissions' },
        { key: 'toxicity', label: 'Toxicity Level' },
        { key: 'biodegradability', label: 'Biodegradability' },
        { key: 'recyclability', label: 'Recyclability' },
        { key: 'chemical_safety', label: 'Chemical Safety' },
        { key: 'storage_requirements', label: 'Storage Requirements' },
        
        // Cost & Availability
        { key: 'price_range', label: 'Price Range' },
        { key: 'availability', label: 'Availability' },
        { key: 'shelf_life', label: 'Shelf Life' },
        
        // Advanced Properties
        { key: 'electrical_conductivity', label: 'Electrical Conductivity' },
        { key: 'food_safety', label: 'Food Safety' },
        { key: 'medical_grade', label: 'Medical Grade' },
        
        // Print Settings
        { key: 'layer_height_range', label: 'Layer Height Range' },
        { key: 'support_requirements', label: 'Support Requirements' },
        { key: 'retraction_settings', label: 'Retraction Settings' },
        { key: 'cooling_requirements', label: 'Cooling Requirements' },
        
        // Durability & Aging
        { key: 'uv_degradation', label: 'UV Degradation' },
        { key: 'creep_resistance', label: 'Creep Resistance' },
        { key: 'fatigue_resistance', label: 'Fatigue Resistance' }
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
      
      // Add card content, card bottom, and specs content to card
      card.appendChild(cardContent);
      card.appendChild(cardBottom);
      card.appendChild(specsContent);
    } else {
      // For cards without specs, just add the content
      card.appendChild(cardContent);
    }
    grid.appendChild(card);
  });
}

function setupFilters(allData){
  const q = document.getElementById('search');
  const tierChecks = Array.from(document.querySelectorAll('input[name="tier"]'));
  
  // Material type filters
  const filterPLA = document.getElementById('filter-pla');
  const filterPETG = document.getElementById('filter-petg');
  const filterABS = document.getElementById('filter-abs');
  const filterTPU = document.getElementById('filter-tpu');
  const filterNylon = document.getElementById('filter-nylon');
  const filterOther = document.getElementById('filter-other');
  
  // Difficulty filters
  const filterBeginner = document.getElementById('filter-beginner');
  const filterIntermediate = document.getElementById('filter-intermediate');
  const filterAdvanced = document.getElementById('filter-advanced');
  
  // Price filters
  const filterBudget = document.getElementById('filter-budget');
  const filterMidrange = document.getElementById('filter-midrange');
  const filterPremium = document.getElementById('filter-premium');
  
  // Requirement filters
  const flagEnclosure = document.getElementById('flag-enclosure');
  const flagHardened = document.getElementById('flag-hardened');
  const flagHygro = document.getElementById('flag-hygro');
  
  // Use case filters
  const flagAesthetic = document.getElementById('flag-aesthetic');
  const flagFunctional = document.getElementById('flag-functional');
  const flagPrototyping = document.getElementById('flag-prototyping');
  const flagOutdoor = document.getElementById('flag-outdoor');
  
  // Spec filters
  const specFlexible = document.getElementById('spec-flexible');
  const specStrong = document.getElementById('spec-strong');
  const specHighImpact = document.getElementById('spec-high-impact');
  const specLowWarping = document.getElementById('spec-low-warping');
  const specHighTemp = document.getElementById('spec-high-temp');
  const specFastPrint = document.getElementById('spec-fast-print');
  const specEasyPrint = document.getElementById('spec-easy-print');
  const specGoodSurface = document.getElementById('spec-good-surface');
  const specLowToxicity = document.getElementById('spec-low-toxicity');
  const specLowVoc = document.getElementById('spec-low-voc');
  const specBiodegradable = document.getElementById('spec-biodegradable');
  const specRecyclable = document.getElementById('spec-recyclable');
  const specFoodSafe = document.getElementById('spec-food-safe');
  const specMedicalGrade = document.getElementById('spec-medical-grade');
  const specConductive = document.getElementById('spec-conductive');
  const specUvResistant = document.getElementById('spec-uv-resistant');
  
  // Other filters
  const flagProfessionalOnly = document.getElementById('flag-professional-only');
  const flagPopularMaterials = document.getElementById('flag-popular-materials');
  
  // Video filters
  const videoFilterS = document.getElementById('video-filter-s');
  const videoFilterA = document.getElementById('video-filter-a');
  const videoFilterB = document.getElementById('video-filter-b');
  const videoFilterC = document.getElementById('video-filter-c');
  const videoFilterF = document.getElementById('video-filter-f');
  
  // Action buttons
  const resetFilters = document.getElementById('reset-filters-btn');

  // Function to check if a filament requires professional/advanced equipment
  function requiresProfessionalEquipment(filament) {
    const professionalFilaments = [
      'PEEK', 'PPS', 'TPI (Kapton)', 'HDPE', 'POM (Acetal/Delrin)', 
      'PVDF', 'Carbon Fiber PEEK (CF PEEK)', 'PPSU', 'PEKK', 'SEBS', 
      'PSU (Polysulfone)', 'OBC (Olefin Block Copolymer)'
    ];
    
    // Check if the filament name matches any professional filaments
    if (professionalFilaments.some(name => filament.name.includes(name))) {
      return true;
    }
    
    // Check for extreme temperature requirements (>350°C)
    if (filament.temp && (filament.temp.includes('~400°C') || filament.temp.includes('~450°C') || filament.temp.includes('~325°C'))) {
      return true;
    }
    
    // Check for use cases that indicate professional equipment needed
    if (filament.use_cases && (
      filament.use_cases.includes('specialized') || 
      filament.use_cases.includes('industrial') ||
      filament.use_cases.includes('professional') ||
      filament.use_cases.includes('specialized equipment') ||
      filament.use_cases.includes('advanced printer')
    )) {
      return true;
    }
    
    // Check for notes that indicate professional equipment needed
    if (filament.notes && (
      filament.notes.includes('specialized equipment') ||
      filament.notes.includes('professional printer') ||
      filament.notes.includes('industrial printer') ||
      filament.notes.includes('extreme temps') ||
      filament.notes.includes('advanced setup')
    )) {
      return true;
    }
    
    // Check for rare availability (often indicates professional use)
    if (filament.specs && filament.specs.availability === 'Rare') {
      return true;
    }
    
    return false;
  }

  // Function to check if a filament is among the most popular materials (covers 80%+ of actual use)
  function isPopularMaterial(filament) {
    // Define only the most popular materials that most people actually use
    const popularMaterials = [
      'PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon', 'PCTG'
    ];
    
    // Check if it's one of the core popular materials
    if (popularMaterials.some(material => filament.name.includes(material))) {
      // Exclude any specialized variants
      if (filament.name.includes('Carbon Fiber') || 
          filament.name.includes('Glass Filled') ||
          filament.name.includes('Metal Filled') ||
          filament.name.includes('Conductive') ||
          filament.name.includes('Magnetic') ||
          filament.name.includes('Glow') ||
          filament.name.includes('Color-Changing') ||
          filament.name.includes('Wood') ||
          filament.name.includes('Marble') ||
          filament.name.includes('Silk') ||
          filament.name.includes('Matte') ||
          filament.name.includes('Transparent') ||
          filament.name.includes('Clear')) {
        return false;
      }
      return true;
    }
    
    // Exclude everything else - be very restrictive
    return false;
  }

  // Function to check if a filament is in the YouTube video categories
  function isInVideoCategory(filament, category) {
    const videoFilaments = {
      'S': [
        'Carbon Fiber PLA (CFPLA)', 'Tough PLA', 'High-Speed PLA', 
        'Carbon Fiber PETG (CF PETG)', 'PCTG', 'Glass-Filled Nylon (GF Nylon)', 'TPU 99D'
      ],
      'A': [
        'PLA', 'PETG', 'Carbon Fiber PET (CF PET)', 'ASA', 'Carbon Fiber PC (CF PC)', 
        'PC PBT (Polycarbonate/PBT blend)', 'SEBS', 'PEKK', 'Ultem (PEI)'
      ],
      'B': [
        'Silk PLA', 'Wood PLA', 'Matte PLA', 'Flex PLA (PCL)', 'PET (Bottle-grade)', 
        'PVB', 'HIPS', 'PA6 Nylon', 'Nylon PA-12', 
        'Carbon Fiber Nylon PA-6 (CF Nylon PA-6)', 'Polycarbonate (PC)', 
        'TPU 80D', 'Glass-Filled PP (GF PP)', 'PSU (Polysulfone)'
      ],
      'C': [
        'ABS', 'Carbon Fiber Nylon PA-12 (CF Nylon PA-12)', 
        'Nylon/PETG Alloys', 'Clear PMMA', 'Chocolate (Disqualified)', 'TPU 80C', 
        'OBC (Olefin Block Copolymer)', 'PEEK', 'PPS', 'PES', 'PPSU', 'Carbon Fiber PEEK (CF PEEK)'
      ],
      'F': [
        '5x Metal-Filled PLA', 'Non-clear PMMA', 'TPE', 'Polypropylene (PP)', 
        'HDPE', 'POM (Acetal/Delrin)', 'PVDF', 'TPI (Kapton)'
      ]
    };

    const filaments = videoFilaments[category] || [];
    return filaments.some(videoFilament => 
      filament.name === videoFilament
    );
  }

  // Helper functions for new filters
  function getMaterialType(filament) {
    const name = filament.name.toLowerCase();
    if (name.includes('pla')) return 'PLA';
    if (name.includes('petg')) return 'PETG';
    if (name.includes('abs')) return 'ABS';
    if (name.includes('tpu')) return 'TPU';
    if (name.includes('nylon') || name.includes('pa6') || name.includes('pa12')) return 'Nylon';
    return 'Other';
  }

  function getDifficultyLevel(filament) {
    if (!filament.specs || !filament.specs.ease_of_printing) return 'intermediate';
    const ease = filament.specs.ease_of_printing.toLowerCase();
    if (ease.includes('very high') || ease.includes('beginner')) return 'beginner';
    if (ease.includes('very low') || ease.includes('expert') || ease.includes('very difficult')) return 'advanced';
    return 'intermediate';
  }

  function getPriceRange(filament) {
    if (!filament.specs || !filament.specs.price_range) return 'midrange';
    const price = filament.specs.price_range.toLowerCase();
    if (price.includes('budget')) return 'budget';
    if (price.includes('premium')) return 'premium';
    return 'midrange';
  }

  function matchesUseCase(filament, useCase) {
    const name = filament.name.toLowerCase();
    const notes = (filament.notes || '').toLowerCase();
    const useCases = (filament.use_cases || '').toLowerCase();
    
    switch(useCase) {
      case 'aesthetic':
        return name.includes('silk') || name.includes('wood') || name.includes('metal') || 
               name.includes('glow') || name.includes('color') || name.includes('matte') ||
               notes.includes('aesthetic') || notes.includes('decorative') || notes.includes('display') ||
               useCases.includes('aesthetic') || useCases.includes('decorative') || useCases.includes('display');
      case 'functional':
        return !name.includes('silk') && !name.includes('wood') && !name.includes('glow') &&
               !notes.includes('aesthetic') && !notes.includes('decorative') &&
               (useCases.includes('functional') || useCases.includes('parts') || useCases.includes('mechanical'));
      case 'prototyping':
        return name.includes('high-speed') || name.includes('rapid') ||
               useCases.includes('prototyping') || useCases.includes('rapid');
      case 'outdoor':
        return (name.includes('asa') || name.includes('abs') || name.includes('petg') ||
                useCases.includes('outdoor') || notes.includes('weather')) &&
               !(notes.includes('limited') && notes.includes('uv')) &&
               !(filament.specs && filament.specs.uv_resistance === 'Low');
      default:
        return true;
    }
  }

  // Helper functions for spec-based filtering
  function hasHighFlexibility(filament) {
    if (!filament.specs || !filament.specs.flexibility) return false;
    const flex = filament.specs.flexibility.toLowerCase();
    return flex.includes('high') || flex.includes('very high') || flex.includes('rubber-like');
  }

  function hasHighStrength(filament) {
    if (!filament.specs || !filament.specs.tensile_strength) return false;
    const strength = filament.specs.tensile_strength.toLowerCase();
    return strength.includes('high') || strength.includes('very high');
  }

  function hasHighImpactResistance(filament) {
    if (!filament.specs || !filament.specs.impact_resistance) return false;
    const impact = filament.specs.impact_resistance.toLowerCase();
    return impact.includes('high') || impact.includes('very high');
  }

  function hasLowWarping(filament) {
    if (!filament.specs || !filament.specs.warping) return false;
    const warping = filament.specs.warping.toLowerCase();
    return warping.includes('low') || warping.includes('very low');
  }

  function hasHighTemperatureResistance(filament) {
    if (!filament.specs || !filament.specs.temperature_resistance) return false;
    const temp = filament.specs.temperature_resistance.toLowerCase();
    return temp.includes('high') || temp.includes('very high') || 
           (temp.includes('°c') && parseInt(temp.match(/(\d+)°c/)?.[1]) > 100);
  }

  function hasFastPrinting(filament) {
    if (!filament.specs || !filament.specs.print_speed) return false;
    const speed = filament.specs.print_speed.toLowerCase();
    return speed.includes('fast') || speed.includes('very fast');
  }

  function hasEasyPrinting(filament) {
    if (!filament.specs || !filament.specs.ease_of_printing) return false;
    const ease = filament.specs.ease_of_printing.toLowerCase();
    return ease.includes('high') || ease.includes('very high') || ease.includes('beginner') || ease.includes('easy');
  }

  function hasHighSurfaceQuality(filament) {
    if (!filament.specs || !filament.specs.surface_quality) return false;
    const quality = filament.specs.surface_quality.toLowerCase();
    return quality.includes('high') || quality.includes('very high') || quality.includes('excellent') || quality.includes('smooth');
  }

  function hasLowToxicity(filament) {
    if (!filament.specs || !filament.specs.toxicity) return false;
    const toxicity = filament.specs.toxicity.toLowerCase();
    return toxicity.includes('low') || toxicity.includes('very low');
  }

  function hasLowVocEmissions(filament) {
    if (!filament.specs || !filament.specs.voc_emissions) return false;
    const voc = filament.specs.voc_emissions.toLowerCase();
    return voc.includes('low') || voc.includes('very low');
  }

  function isBiodegradable(filament) {
    if (!filament.specs || !filament.specs.biodegradability) return false;
    const bio = filament.specs.biodegradability.toLowerCase();
    return bio.includes('high') || bio.includes('yes') || bio.includes('biodegradable');
  }

  function isRecyclable(filament) {
    if (!filament.specs || !filament.specs.recyclability) return false;
    const recycle = filament.specs.recyclability.toLowerCase();
    return recycle.includes('yes') || recycle.includes('recyclable');
  }

  function isFoodSafe(filament) {
    if (!filament.specs || !filament.specs.food_safety) return false;
    const food = filament.specs.food_safety.toLowerCase();
    return food.includes('safe') || food.includes('yes') || food.includes('food safe');
  }

  function isMedicalGrade(filament) {
    if (!filament.specs || !filament.specs.medical_grade) return false;
    const medical = filament.specs.medical_grade.toLowerCase();
    return medical.includes('yes') || medical.includes('medical') || medical.includes('grade');
  }

  function isElectricallyConductive(filament) {
    if (!filament.specs || !filament.specs.electrical_conductivity) return false;
    const electrical = filament.specs.electrical_conductivity.toLowerCase();
    return electrical.includes('conductive') || electrical.includes('conducting');
  }

  function isUvResistant(filament) {
    if (!filament.specs || !filament.specs.uv_resistance) return false;
    const uv = filament.specs.uv_resistance.toLowerCase();
    return uv.includes('high') || uv.includes('very high') || uv.includes('excellent');
  }

  function apply(){
    const tiers = new Set(tierChecks.filter(c=>c.checked).map(c=>c.value));
    const text = q.value.trim().toLowerCase();
    let filtered = allData.filter(f => tiers.has(f.tier));
    
    // Text search
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
    
    // Material type filters (OR logic within group)
    const materialFilters = [];
    if (filterPLA.checked) materialFilters.push('PLA');
    if (filterPETG.checked) materialFilters.push('PETG');
    if (filterABS.checked) materialFilters.push('ABS');
    if (filterTPU.checked) materialFilters.push('TPU');
    if (filterNylon.checked) materialFilters.push('Nylon');
    if (filterOther.checked) materialFilters.push('Other');
    
    if (materialFilters.length > 0) {
      filtered = filtered.filter(f => materialFilters.includes(getMaterialType(f)));
    }
    
    // Difficulty filters (OR logic within group)
    const difficultyFilters = [];
    if (filterBeginner.checked) difficultyFilters.push('beginner');
    if (filterIntermediate.checked) difficultyFilters.push('intermediate');
    if (filterAdvanced.checked) difficultyFilters.push('advanced');
    
    if (difficultyFilters.length > 0) {
      filtered = filtered.filter(f => difficultyFilters.includes(getDifficultyLevel(f)));
    }
    
    // Price filters (OR logic within group)
    const priceFilters = [];
    if (filterBudget.checked) priceFilters.push('budget');
    if (filterMidrange.checked) priceFilters.push('midrange');
    if (filterPremium.checked) priceFilters.push('premium');
    
    if (priceFilters.length > 0) {
      filtered = filtered.filter(f => priceFilters.includes(getPriceRange(f)));
    }
    
    // Requirement filters (OR logic within group)
    const requirementFilters = [];
    if(flagEnclosure.checked) requirementFilters.push(f => f.enclosure || (f.badges||[]).some(b => /enclosure/i.test(b)));
    if(flagHardened.checked) requirementFilters.push(f => (f.badges||[]).some(b => /hardened/i.test(b)));
    if(flagHygro.checked) requirementFilters.push(f => f.hygroscopic || (f.badges||[]).some(b => /moisture/i.test(b)));
    
    if (requirementFilters.length > 0) {
      filtered = filtered.filter(f => requirementFilters.some(filter => filter(f)));
    }
    
    // Use case filters (OR logic within group)
    const useCaseFilters = [];
    if(flagAesthetic.checked) useCaseFilters.push(f => matchesUseCase(f, 'aesthetic'));
    if(flagFunctional.checked) useCaseFilters.push(f => matchesUseCase(f, 'functional'));
    if(flagPrototyping.checked) useCaseFilters.push(f => matchesUseCase(f, 'prototyping'));
    if(flagOutdoor.checked) useCaseFilters.push(f => matchesUseCase(f, 'outdoor'));
    
    if (useCaseFilters.length > 0) {
      filtered = filtered.filter(f => useCaseFilters.some(filter => filter(f)));
    }
    
    // Spec filters (OR logic within group)
    const specFilters = [];
    if(specFlexible.checked) specFilters.push(f => hasHighFlexibility(f));
    if(specStrong.checked) specFilters.push(f => hasHighStrength(f));
    if(specHighImpact.checked) specFilters.push(f => hasHighImpactResistance(f));
    if(specLowWarping.checked) specFilters.push(f => hasLowWarping(f));
    if(specHighTemp.checked) specFilters.push(f => hasHighTemperatureResistance(f));
    if(specFastPrint.checked) specFilters.push(f => hasFastPrinting(f));
    if(specEasyPrint.checked) specFilters.push(f => hasEasyPrinting(f));
    if(specGoodSurface.checked) specFilters.push(f => hasHighSurfaceQuality(f));
    if(specLowToxicity.checked) specFilters.push(f => hasLowToxicity(f));
    if(specLowVoc.checked) specFilters.push(f => hasLowVocEmissions(f));
    if(specBiodegradable.checked) specFilters.push(f => isBiodegradable(f));
    if(specRecyclable.checked) specFilters.push(f => isRecyclable(f));
    if(specFoodSafe.checked) specFilters.push(f => isFoodSafe(f));
    if(specMedicalGrade.checked) specFilters.push(f => isMedicalGrade(f));
    if(specConductive.checked) specFilters.push(f => isElectricallyConductive(f));
    if(specUvResistant.checked) specFilters.push(f => isUvResistant(f));
    
    if (specFilters.length > 0) {
      filtered = filtered.filter(f => specFilters.some(filter => filter(f)));
    }

    // Video filters (OR logic within group)
    const videoFilters = [];
    if(videoFilterS.checked) videoFilters.push(f => isInVideoCategory(f, 'S'));
    if(videoFilterA.checked) videoFilters.push(f => isInVideoCategory(f, 'A'));
    if(videoFilterB.checked) videoFilters.push(f => isInVideoCategory(f, 'B'));
    if(videoFilterC.checked) videoFilters.push(f => isInVideoCategory(f, 'C'));
    if(videoFilterF.checked) videoFilters.push(f => isInVideoCategory(f, 'F'));
    
    if (videoFilters.length > 0) {
      filtered = filtered.filter(f => videoFilters.some(filter => filter(f)));
    }

    // Other filters (OR logic within group)
    const otherFilters = [];
    if(flagProfessionalOnly.checked) otherFilters.push(f => requiresProfessionalEquipment(f));
    if(flagPopularMaterials.checked) otherFilters.push(f => isPopularMaterial(f));
    
    if (otherFilters.length > 0) {
      filtered = filtered.filter(f => otherFilters.some(filter => filter(f)));
    }

    render(filtered);
  }

  // Event listeners for all filters
  const allFilters = [
    q, 
    // Material filters
    filterPLA, filterPETG, filterABS, filterTPU, filterNylon, filterOther,
    // Video filters
    videoFilterS, videoFilterA, videoFilterB, videoFilterC, videoFilterF,
    // Difficulty filters
    filterBeginner, filterIntermediate, filterAdvanced,
    // Price filters
    filterBudget, filterMidrange, filterPremium,
    // Requirement filters
    flagEnclosure, flagHardened, flagHygro,
    // Use case filters
    flagAesthetic, flagFunctional, flagPrototyping, flagOutdoor,
    // Spec filters
    specFlexible, specStrong, specHighImpact, specLowWarping,
    specHighTemp, specFastPrint, specEasyPrint, specGoodSurface,
    specLowToxicity, specLowVoc, specBiodegradable, specRecyclable,
    specFoodSafe, specMedicalGrade, specConductive, specUvResistant,
    // Other filters
    flagProfessionalOnly, flagPopularMaterials,
    // Tier filters
    ...tierChecks
  ];
  
  // Filter count elements
  const materialCount = document.getElementById('material-count');
  const videoCount = document.getElementById('video-count');
  const qualityCount = document.getElementById('quality-count');
  const difficultyCount = document.getElementById('difficulty-count');
  const priceCount = document.getElementById('price-count');
  const requirementsCount = document.getElementById('requirements-count');
  const usecaseCount = document.getElementById('usecase-count');
  const specsCount = document.getElementById('specs-count');
  const otherCount = document.getElementById('other-count');
  
  // Collapsible filter functionality
  const filterHeaders = document.querySelectorAll('.filter-header');
  filterHeaders.forEach(header => {
    // Default all filters to collapsed
    const filterGroup = header.closest('.filter-group');
    filterGroup.classList.add('collapsed');
    
    header.addEventListener('click', () => {
      filterGroup.classList.toggle('collapsed');
    });
  });
  
  // Function to update filter counts
  function updateFilterCounts() {
    // Material count
    const materialChecked = document.querySelectorAll('#material-options input:checked').length;
    materialCount.textContent = `(${materialChecked})`;
    
    // Video count
    const videoChecked = document.querySelectorAll('#video-options input:checked').length;
    videoCount.textContent = `(${videoChecked})`;
    
    // Quality count
    const qualityChecked = document.querySelectorAll('#quality-options input:checked').length;
    qualityCount.textContent = `(${qualityChecked})`;
    
    // Difficulty count
    const difficultyChecked = document.querySelectorAll('#difficulty-options input:checked').length;
    difficultyCount.textContent = `(${difficultyChecked})`;
    
    // Price count
    const priceChecked = document.querySelectorAll('#price-options input:checked').length;
    priceCount.textContent = `(${priceChecked})`;
    
    // Requirements count
    const requirementsChecked = document.querySelectorAll('#requirements-options input:checked').length;
    requirementsCount.textContent = `(${requirementsChecked})`;
    
    // Use case count
    const usecaseChecked = document.querySelectorAll('#usecase-options input:checked').length;
    usecaseCount.textContent = `(${usecaseChecked})`;
    
    // Specs count
    const specsChecked = document.querySelectorAll('#specs-options input:checked').length;
    specsCount.textContent = `(${specsChecked})`;
    
    // Other count
    const otherChecked = document.querySelectorAll('#other-options input:checked').length;
    otherCount.textContent = `(${otherChecked})`;
  }
  
  // Update counts on filter change
  allFilters.forEach(el => el.addEventListener('input', () => {
    apply();
    updateFilterCounts();
    saveCurrentState(); // Save state whenever filters change
  }));
  
  // Reset filters functionality
  resetFilters.addEventListener('click', () => {
    // Reset to default state
    // Material filters - all checked (default)
    filterPLA.checked = true;
    filterPETG.checked = true;
    filterABS.checked = true;
    filterTPU.checked = true;
    filterNylon.checked = true;
    filterOther.checked = true;
    
    // Quality filters - all checked (default)
    tierChecks.forEach(tier => tier.checked = true);
    
    // Difficulty filters - all checked (default)
    filterBeginner.checked = true;
    filterIntermediate.checked = true;
    filterAdvanced.checked = true;
    
    // Price filters - all checked (default)
    filterBudget.checked = true;
    filterMidrange.checked = true;
    filterPremium.checked = true;
    
    // Requirement filters - all unchecked (default)
    flagEnclosure.checked = false;
    flagHardened.checked = false;
    flagHygro.checked = false;
    
    // Use case filters - all unchecked (default)
    flagAesthetic.checked = false;
    flagFunctional.checked = false;
    flagPrototyping.checked = false;
    flagOutdoor.checked = false;
    
    // Spec filters - all unchecked (default)
    specFlexible.checked = false;
    specStrong.checked = false;
    specHighImpact.checked = false;
    specLowWarping.checked = false;
    specHighTemp.checked = false;
    specFastPrint.checked = false;
    specEasyPrint.checked = false;
    specGoodSurface.checked = false;
    specLowToxicity.checked = false;
    specLowVoc.checked = false;
    specBiodegradable.checked = false;
    specRecyclable.checked = false;
    specFoodSafe.checked = false;
    specMedicalGrade.checked = false;
    specConductive.checked = false;
    specUvResistant.checked = false;
    
    // Video filters - all unchecked (default)
    videoFilterS.checked = false;
    videoFilterA.checked = false;
    videoFilterB.checked = false;
    videoFilterC.checked = false;
    videoFilterF.checked = false;
    
    // Other filters - both unchecked (default)
    flagProfessionalOnly.checked = false;
    flagPopularMaterials.checked = false;
    
    // Clear search
    q.value = '';
    
    // Clear comparison state
    comparisonFilaments.clear();
    updateComparisonControls();
    
    // Clear all checkboxes
    document.querySelectorAll('.comparison-checkbox').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Reset filter groups to collapsed state
    document.querySelectorAll('.filter-group').forEach(group => {
      group.classList.add('collapsed');
    });
    
    // Clear storage and save reset state
    clearStorage();
    
    // Apply filters and update counts
    apply();
    updateFilterCounts();
    saveCurrentState();
  });
  
  apply();
  updateFilterCounts();
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
      // Core Properties
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
      { key: 'density', label: 'Density' },
      
      // Quality & Usability (Radar Chart Properties)
      { key: 'surface_quality', label: 'Surface Quality' },
      { key: 'cost_effectiveness', label: 'Cost Effectiveness' },
      { key: 'post_processing', label: 'Post-Processing' },
      { key: 'ease_of_printing', label: 'Ease of Printing' },
      
      // Safety & Environmental
      { key: 'voc_emissions', label: 'VOC Emissions' },
      { key: 'toxicity', label: 'Toxicity Level' },
      { key: 'biodegradability', label: 'Biodegradability' },
      { key: 'recyclability', label: 'Recyclability' },
      
      // Cost & Availability
      { key: 'price_range', label: 'Price Range' },
      { key: 'availability', label: 'Availability' },
      { key: 'shelf_life', label: 'Shelf Life' },
      
      // Advanced Properties
      { key: 'electrical_conductivity', label: 'Electrical Conductivity' },
      { key: 'food_safety', label: 'Food Safety' },
      { key: 'medical_grade', label: 'Medical Grade' },
      
      // Print Settings
      { key: 'layer_height_range', label: 'Layer Height Range' },
      { key: 'support_requirements', label: 'Support Requirements' },
      { key: 'retraction_settings', label: 'Retraction Settings' },
      { key: 'cooling_requirements', label: 'Cooling Requirements' },
      
      // Durability & Aging
      { key: 'uv_degradation', label: 'UV Degradation' },
      { key: 'creep_resistance', label: 'Creep Resistance' },
      { key: 'fatigue_resistance', label: 'Fatigue Resistance' }
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
  
  console.log('Creating comparison charts for filaments:', filaments.map(f => f.name));
  
  // Destroy existing charts if they exist
  if (radarChart) {
    radarChart.destroy();
  }
  
  // Get the charts container
  const chartsContainer = document.getElementById('comparison-charts');
  if (!chartsContainer) {
    console.error('Charts container not found!');
    return '';
  }
  
  // Clear existing charts
  chartsContainer.innerHTML = '';
  
  // Create 4 chart containers
  const chartContainers = [
    { title: 'Core Performance', color: '#7aa2f7', bgColor: 'rgba(122, 162, 247, 0.1)' },
    { title: 'Quality & Usability', color: '#7aa2f7', bgColor: 'rgba(122, 162, 247, 0.1)' },
    { title: 'Safety & Environmental', color: '#9ece6a', bgColor: 'rgba(158, 206, 106, 0.1)' },
    { title: 'Advanced Properties', color: '#e0af68', bgColor: 'rgba(224, 175, 104, 0.1)' }
  ];
  
  // Create a 2x2 grid container
  const gridContainer = document.createElement('div');
  gridContainer.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 20px;
    width: 100%;
    height: 600px;
  `;
  
  chartContainers.forEach((container, index) => {
    const chartDiv = document.createElement('div');
    chartDiv.style.cssText = `
      background: ${container.bgColor};
      border: 1px solid ${container.color}40;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    `;
    
    const chartTitle = document.createElement('h3');
    chartTitle.textContent = container.title;
    chartTitle.style.cssText = `
      margin: 0 0 10px 0;
      color: ${container.color};
      font-size: 14px;
      font-weight: 600;
      text-align: center;
    `;
    
    const chartWrapper = document.createElement('div');
    chartWrapper.style.cssText = `
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      position: relative;
    `;
    
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    canvas.id = `comparison-chart-${index}`;
    canvas.style.cssText = `
      max-width: 100%;
      max-height: 100%;
    `;
    
    chartWrapper.appendChild(canvas);
    chartDiv.appendChild(chartTitle);
    chartDiv.appendChild(chartWrapper);
    gridContainer.appendChild(chartDiv);
    
    // Create the appropriate chart
    switch(index) {
      case 0:
        createComparisonCorePerformanceChart(filaments, canvas);
        break;
      case 1:
        createComparisonQualityUsabilityChart(filaments, canvas);
        break;
      case 2:
        createComparisonSafetyEnvironmentalChart(filaments, canvas);
        break;
      case 3:
        createComparisonAdvancedPropertiesChart(filaments, canvas);
        break;
    }
  });
  
  chartsContainer.appendChild(gridContainer);
  
  return '';
}

// Comparison chart functions
function createComparisonCorePerformanceChart(filaments, canvas) {
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
  
  const ctx = canvas.getContext('2d');
  
  try {
    new Chart(ctx, {
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
              font: { size: 12 },
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
            ticks: { display: false },
            grid: { color: '#2a3347' },
            angleLines: { color: '#2a3347' },
            pointLabels: {
              color: '#a6adbb',
              font: { size: 11 }
            }
          }
        },
        elements: {
          line: { tension: 0.1 }
        }
      }
    });
  } catch (error) {
    console.error('Error creating core performance chart:', error);
  }
}

function createComparisonQualityUsabilityChart(filaments, canvas) {
  const chartData = [
    { key: 'surface_quality', label: 'Surface Quality', description: 'How good the final print looks.' },
    { key: 'cost_effectiveness', label: 'Cost Effectiveness', description: 'Price vs. performance ratio.' },
    { key: 'post_processing', label: 'Post-Processing', description: 'How easy it is to finish the print.' },
    { key: 'ease_of_printing', label: 'Ease of Printing', description: 'How forgiving and easy the material is to print.' },
    { key: 'layer_adhesion', label: 'Layer Adhesion', description: 'How well layers stick together.' },
    { key: 'dimensional_accuracy', label: 'Dimensional Accuracy', description: 'How precise the printed dimensions are.' }
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
  
  const ctx = canvas.getContext('2d');
  
  try {
    new Chart(ctx, {
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
              font: { size: 12 },
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
            ticks: { display: false },
            grid: { color: '#2a3347' },
            angleLines: { color: '#2a3347' },
            pointLabels: {
              color: '#a6adbb',
              font: { size: 11 }
            }
          }
        },
        elements: {
          line: { tension: 0.1 }
        }
      }
    });
  } catch (error) {
    console.error('Error creating quality usability chart:', error);
  }
}

function createComparisonSafetyEnvironmentalChart(filaments, canvas) {
  const chartData = [
    { key: 'voc_emissions', label: 'VOC Emissions', description: 'Volatile organic compounds released during printing.' },
    { key: 'toxicity', label: 'Toxicity', description: 'Health safety level.' },
    { key: 'biodegradability', label: 'Biodegradability', description: 'How well the material breaks down naturally.' },
    { key: 'recyclability', label: 'Recyclability', description: 'How easily the material can be recycled.' },
    { key: 'chemical_safety', label: 'Chemical Safety', description: 'Safe handling requirements.' },
    { key: 'storage_requirements', label: 'Storage', description: 'Special storage needs.' }
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
  
  const ctx = canvas.getContext('2d');
  
  try {
    new Chart(ctx, {
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
              font: { size: 12 },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: '#14171c',
            titleColor: '#9ece6a',
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
            ticks: { display: false },
            grid: { color: '#2a3347' },
            angleLines: { color: '#2a3347' },
            pointLabels: {
              color: '#a6adbb',
              font: { size: 11 }
            }
          }
        },
        elements: {
          line: { tension: 0.1 }
        }
      }
    });
  } catch (error) {
    console.error('Error creating safety environmental chart:', error);
  }
}

function createComparisonAdvancedPropertiesChart(filaments, canvas) {
  const chartData = [
    { key: 'electrical_conductivity', label: 'Electrical', description: 'Electrical properties.' },
    { key: 'food_safety', label: 'Food Safety', description: 'Food contact safety.' },
    { key: 'medical_grade', label: 'Medical Grade', description: 'Medical device compatibility.' },
    { key: 'uv_resistance', label: 'UV Resistance', description: 'Resistance to UV degradation.' },
    { key: 'chemical_resistance', label: 'Chemical Resistance', description: 'Resistance to chemical exposure.' },
    { key: 'creep_resistance', label: 'Creep Resistance', description: 'Resistance to permanent deformation under load.' }
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
  
  const ctx = canvas.getContext('2d');
  
  try {
    new Chart(ctx, {
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
              font: { size: 12 },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: '#14171c',
            titleColor: '#e0af68',
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
            ticks: { display: false },
            grid: { color: '#2a3347' },
            angleLines: { color: '#2a3347' },
            pointLabels: {
              color: '#a6adbb',
              font: { size: 11 }
            }
          }
        },
        elements: {
          line: { tension: 0.1 }
        }
      }
    });
  } catch (error) {
    console.error('Error creating advanced properties chart:', error);
  }
}

function clearComparison() {
  comparisonFilaments.clear();
  updateComparisonControls();
  
  // Uncheck all checkboxes
  document.querySelectorAll('.comparison-checkbox').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  saveCurrentState(); // Save state when comparison is cleared
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
  
  // Load saved state before setting up filters
  const savedState = loadSavedState();
  
  render(data); 
  setupFilters(data); 
  setupComparison();
  updateComparisonControls();
  
  // Restore expanded details after rendering
  if (savedState.uiState && savedState.uiState.expandedDetails) {
    setTimeout(() => {
      savedState.uiState.expandedDetails.forEach(detail => {
        const card = Array.from(document.querySelectorAll('.card')).find(card => 
          card.querySelector('h3').textContent.trim() === detail.cardId
        );
        if (card) {
          const specsContent = card.querySelector('.specs-content');
          const detailsButton = card.querySelector('.details-button');
          if (specsContent && detailsButton) {
            specsContent.style.display = detail.visible ? 'block' : 'none';
            detailsButton.textContent = detail.visible ? 'Hide' : 'Details';
            
            // Create additional charts if details are expanded
            if (detail.visible && !specsContent.querySelector('.quality-chart-container')) {
              const filament = data.find(f => f.name === detail.cardId);
              if (filament) {
                createAdditionalCharts(filament, specsContent);
              }
            }
          }
        }
      });
    }, 100); // Small delay to ensure DOM is ready
  }
  
  // Save initial state
  saveCurrentState();
});
