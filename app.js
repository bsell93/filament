
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
      filtered = filtered.filter(f => (f.name + ' ' + f.notes + ' ' + (f.use_cases||'') + ' ' + (f.badges||[]).join(' ')).toLowerCase().includes(text));
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
