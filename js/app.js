// ============================================================
// CONFIG
// ============================================================
mapboxgl.accessToken = 'pk.eyJ1Ijoic3BpZXJyZTE0IiwiYSI6ImNtdHg1MXFyNjAxanUyd3B0Zmppd3pldjMifQ.N_SDvISpQJo1gDuuOetnmQ';

const LAYERS = {
  jobs_full:        { file: 'data/Jobs_Full_Service.min.geojson' },
  jobs_limited:      { file: 'data/Jobs_Limited_Fare.min.geojson' },
  land_full:         { file: 'data/Land_Area_Full_Service.min.geojson' },
  land_full_night:   { file: 'data/Land_Area_Full_Service_Nighttime.min.geojson' },
  land_limited:      { file: 'data/Land_Area_Limited_Fare.min.geojson' }
};

// The 20 percentile bins, low to high — order drives the color ramp
const CATEGORY_ORDER = [
  '0–5th percentile', '5th–10th percentile', '10th–15th percentile', '15th–20th percentile',
  '20th–25th percentile', '25th–30th percentile', '30th–35th percentile', '35th–40th percentile',
  '40th–45th percentile', '45th–50th percentile', '50th–55th percentile', '55th–60th percentile',
  '60th–65th percentile', '65th–70th percentile', '70th–75th percentile', '75th–80th percentile',
  '80th–85th percentile', '85th–90th percentile', '90th–95th percentile', '95th–100th percentile'
];

const RAMP_LOW = '#EAF0EE';   // Minimal Transit
const RAMP_HIGH = '#123B3B';  // Rider's Paradise

// Build a 'match' expression: category string -> rank 0..19, then a continuous
// interpolation across that rank so the fill reads as one smooth gradient.
function buildFillColorExpression() {
  const matchPairs = [];
  CATEGORY_ORDER.forEach((cat, i) => { matchPairs.push(cat, i); });
  return [
    'interpolate', ['linear'],
    ['match', ['get', 'category'], ...matchPairs, 0],
    0, RAMP_LOW,
    CATEGORY_ORDER.length - 1, RAMP_HIGH
  ];
}

// ============================================================
// Map init
// ============================================================
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-73.95, 40.70],
  zoom: 10
});

map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

const dataCache = {};
const loadingEl = document.getElementById('mapLoading');
let currentPopup = null;

async function loadLayerData(key) {
  if (dataCache[key]) return dataCache[key];
  loadingEl.classList.add('visible');
  const res = await fetch(LAYERS[key].file);
  const geojson = await res.json();
  dataCache[key] = geojson;
  loadingEl.classList.remove('visible');
  return geojson;
}

async function showLayer(key) {
  const geojson = await loadLayerData(key);
  const source = map.getSource('blocks');
  if (source) {
    source.setData(geojson);
  } else {
    map.addSource('blocks', { type: 'geojson', data: geojson });
    map.addLayer({
      id: 'blocks-fill',
      type: 'fill',
      source: 'blocks',
      paint: { 'fill-color': buildFillColorExpression(), 'fill-opacity': 0.8 }
    });
    map.addLayer({
      id: 'blocks-outline',
      type: 'line',
      source: 'blocks',
      paint: { 'line-color': '#ffffff', 'line-width': 0.2 }
    });

    map.on('click', 'blocks-fill', (e) => {
      const p = e.features[0].properties;
      const isPct = p.metric_label && p.metric_label.startsWith('%');
      const value = isPct
        ? `${Number(p.metric_value).toFixed(1)}%`
        : Number(p.metric_value).toLocaleString();

      if (currentPopup) currentPopup.remove();
      currentPopup = new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<div class="popup-title">Block ${p.blockid20}</div>
                   <div class="popup-row">${p.metric_label}: ${value}</div>
                   <div class="popup-row">${p.category}</div>`)
        .addTo(map);
    });

    map.on('mouseenter', 'blocks-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'blocks-fill', () => { map.getCanvas().style.cursor = ''; });
  }
}

map.on('load', () => { showLayer('jobs_full'); });

// ============================================================
// Layer switcher
// ============================================================
document.querySelectorAll('input[name="layer"]').forEach((radio) => {
  radio.addEventListener('change', (e) => { showLayer(e.target.value); });
});

// ============================================================
// Mobile panel drawer
// ============================================================
document.getElementById('panelToggle').addEventListener('click', () => {
  document.getElementById('panel').classList.toggle('open');
});
