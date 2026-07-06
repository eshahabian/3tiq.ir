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

let removed = 0;
let guarded = 0;

for (const file of rangeFiles) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) continue;
  let html = fs.readFileSync(filePath, 'utf8');

  const before = html;
  html = html.replace(/\s*<script src="js\/app\.js"><\/script>\s*/g, '\n');

  if (html !== before) {
    removed++;
    fs.writeFileSync(filePath, html, 'utf8');
  }

  // Guard inline map against double init
  if (html.includes("new L.Map('map'") && !html.includes('_leaflet_id')) {
    html = fs.readFileSync(filePath, 'utf8');
    html = html.replace(
      /\/\/ ===== نقشه نشان[^\n]*\n\s*const map = new L\.Map\('map',/,
      "// ===== نقشه نشان — فقط یک بار\n    if (document.getElementById('map') && !document.getElementById('map')._leaflet_id) {\n    const map = new L.Map('map',"
    );
    if (html.includes('_leaflet_id') && !html.includes("document.getElementById('shelter-type-filter').addEventListener('change', applyShelterFilter);\n\n    }")) {
      html = html.replace(
        /(document\.getElementById\('shelter-type-filter'\)\.addEventListener\('change', applyShelterFilter\);\s*\n)(\s*<\/script>)/,
        "$1\n    }\n$2"
      );
      fs.writeFileSync(filePath, html, 'utf8');
      guarded++;
    }
  }

  // Null-safe back to top
  html = fs.readFileSync(filePath, 'utf8');
  const bttBefore = html;
  html = html.replace(
    /const backToTop = document\.getElementById\('backToTop'\);\s*\n\s*window\.addEventListener\('scroll', \(\) => backToTop\.classList\.toggle\('visible', window\.scrollY > 400\)\);\s*\n\s*backToTop\.addEventListener\('click', \(\) => window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\)\);/,
    "const backToTop = document.getElementById('backToTop');\n    if (backToTop) {\n        window.addEventListener('scroll', () => backToTop.classList.toggle('visible', window.scrollY > 400));\n        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));\n    }"
  );
  if (html !== bttBefore) fs.writeFileSync(filePath, html, 'utf8');
}

console.log('Removed app.js from', removed, 'range pages');
console.log('Added map guard to', guarded, 'range pages');
