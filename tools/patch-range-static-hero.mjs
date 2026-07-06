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

const heroImages = {
  'alborz-gharbi.html': 'images/peaks/sialan.jpg',
  'alborz-markazi.html': 'images/peaks/damavand.jpg',
  'alborz-shargi.html': 'images/peaks/tochal.jpg',
  'koohaye-markazi.html': 'images/peaks/karkas.webp',
  'zagros-shomal.html': 'images/peaks/eshterankoh.jpg',
  'zagros-markazi.html': 'images/peaks/zardkooh.jpg',
  'zagros-jonoob.html': 'images/peaks/dena.jpg',
  'koohaye-atashfeshani.html': 'images/peaks/sabalan.jpg'
};

function extractPeaks(html) {
  const m = html.match(/const peaks = (\[[\s\S]*?\n\s*\]);/);
  if (!m) return null;
  try {
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${m[1]});`)();
  } catch {
    return null;
  }
}

const scriptBlock = (peaks, heroImg) => `    <script type="application/json" id="range-data">\n${JSON.stringify({ peaks, heroImage: heroImg }, null, 2).replace(/</g, '\\u003c')}\n    </script>
    <script src="js/range-ui.js" defer></script>
    <script src="js/i18n-boot.js" defer></script>`;

let ok = 0;
for (const file of rangeFiles) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) continue;
  let html = fs.readFileSync(filePath, 'utf8');
  const peaks = extractPeaks(html);
  if (!peaks) {
    console.log('SKIP peaks extract:', file);
    continue;
  }

  const heroImg = heroImages[file] || (peaks.find((p) => p.image)?.image) || 'images/peaks/damavand.jpg';

  html = html.replace(/\s*<link rel="stylesheet" href="https:\/\/static\.neshan\.org\/sdk\/leaflet\/1\.4\.0\/leaflet\.css"\/?>\s*/g, '\n');
  html = html.replace(/\s*<script src="https:\/\/static\.neshan\.org\/sdk\/leaflet\/1\.4\.0\/leaflet\.js"[^>]*><\/script>\s*/g, '\n');
  html = html.replace(/\s*<script src="js\/app\.js"><\/script>\s*/g, '\n');

  html = html.replace(
    /<div id="map"><\/div>/,
    `<div class="hero-map-bg" style="background-image:url('${heroImg}')" role="img" aria-label="نمای رشته کوه"></div>`
  );

  html = html.replace(/<script src="js\/i18n-boot\.js" defer><\/script>\s*<script>[\s\S]*?<\/script>\s*(?=<\/body>)/, scriptBlock(peaks, heroImg) + '\n');

  if (!html.includes('range-ui.js')) {
    html = html.replace(/<\/body>/, scriptBlock(peaks, heroImg) + '\n</body>');
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('OK', file, '- peaks:', peaks.length, '- hero:', heroImg);
  ok++;
}

console.log('\nPatched', ok, 'range pages (static hero, no Neshan SDK)');
