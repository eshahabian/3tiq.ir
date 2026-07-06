import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

const rangeFiles = [
  'alborz-gharbi.html',
  'alborz-markazi.html',
  'alborz-shargi.html',
  'koohaye-markazi.html',
  'zagros-shomal.html',
  'zagros-markazi.html',
  'zagros-jonoob.html',
  'koohaye-atashfeshani.html'
];

const archiveMap = {
  'alborz-gharbi.html': '_archive/aalborz-gharbi.html',
  'alborz-markazi.html': '_archive/aalborz-markazi.html',
  'koohaye-markazi.html': '_archive/kooohaye-markazi.html'
};

const mapDefaults = {
  'alborz-gharbi.html': { mapCenter: [36.72, 50.25], mapZoom: 9 },
  'alborz-markazi.html': { mapCenter: [36.0, 51.55], mapZoom: 9 },
  'alborz-shargi.html': { mapCenter: [36.55, 52.5], mapZoom: 9 },
  'koohaye-markazi.html': { mapCenter: [31.5, 54.5], mapZoom: 6 },
  'zagros-shomal.html': { mapCenter: [34.0, 47.2], mapZoom: 8 },
  'zagros-markazi.html': { mapCenter: [32.5, 49.5], mapZoom: 8 },
  'zagros-jonoob.html': { mapCenter: [30.5, 51.5], mapZoom: 8 },
  'koohaye-atashfeshani.html': { mapCenter: [37.5, 47.5], mapZoom: 8 }
};

function extractShelters(html) {
  const m = html.match(/const shelters = (\[[\s\S]*?\n\s*\]);/);
  if (!m) return [];
  try {
    return Function(`"use strict"; return (${m[1]});`)();
  } catch {
    return [];
  }
}

function computeCenter(peaks) {
  if (!peaks.length) return [32.5, 53.5];
  const lat = peaks.reduce((s, p) => s + p.lat, 0) / peaks.length;
  const lng = peaks.reduce((s, p) => s + p.lng, 0) / peaks.length;
  return [lat, lng];
}

for (const file of rangeFiles) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) continue;

  let html = fs.readFileSync(filePath, 'utf8');
  const dataMatch = html.match(/<script type="application\/json" id="range-data">\s*([\s\S]*?)\s*<\/script>/);
  if (!dataMatch) {
    console.log('SKIP no range-data:', file);
    continue;
  }

  const data = JSON.parse(dataMatch[1]);
  const defaults = mapDefaults[file] || {};
  data.mapCenter = defaults.mapCenter || computeCenter(data.peaks || []);
  data.mapZoom = defaults.mapZoom || 9;

  const archivePath = archiveMap[file] ? path.join(root, archiveMap[file]) : null;
  if (archivePath && fs.existsSync(archivePath)) {
    data.shelters = extractShelters(fs.readFileSync(archivePath, 'utf8'));
  } else if (!data.shelters) {
    data.shelters = [];
  }

  const heroImg = data.heroImage || 'images/peaks/damavand.jpg';
  const heroBlock =
    `<div class="hero-map-bg" style="background-image:url('${heroImg}')" aria-hidden="true"></div>\n        <div id="map" aria-label="نقشه قله‌ها و پناهگاه‌ها"></div>`;

  html = html.replace(
    /<div class="hero-map-bg"[^>]*><\/div>/,
    heroBlock
  );

  if (!html.includes('id="map"')) {
    html = html.replace(
      /<section class="hero-map" id="home">/,
      `<section class="hero-map" id="home">\n        ${heroBlock}`
    );
  }

  const jsonBlock = `<script type="application/json" id="range-data">\n${JSON.stringify(data, null, 2).replace(/</g, '\\u003c')}\n    </script>`;
  html = html.replace(/<script type="application\/json" id="range-data">[\s\S]*?<\/script>/, jsonBlock);

  if (!html.includes('range-map.js')) {
    html = html.replace(
      '<script src="js/range-ui.js" defer></script>',
      '<script src="js/range-ui.js" defer></script>\n    <script src="js/range-map.js" defer></script>'
    );
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('OK', file, '- shelters:', (data.shelters || []).length, '- center:', data.mapCenter);
}

console.log('\nMaps restored on range pages (lazy load via range-map.js)');
