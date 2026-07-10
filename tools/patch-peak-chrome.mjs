/**
 * Patch all peak pages: unified chrome scripts + Neshan Leaflet.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PEAKS_DIR = path.join(ROOT, 'peaks');

const NESHAN_CSS = 'https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.css';
const NESHAN_JS = 'https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js';
const UNPKG_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const UNPKG_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

const SCRIPTS_BLOCK = `<script src="../js/site-config.js"></script>
<script src="../js/footer-snippet.js"></script>
<script src="../js/header-snippet.js"></script>
<script src="../js/peak-chrome.js"></script>
<script src="../js/site-enhancements.js"></script>`;

const files = fs.readdirSync(PEAKS_DIR).filter((f) => f.endsWith('.html'));
let patched = 0;

for (const file of files) {
  let html = fs.readFileSync(path.join(PEAKS_DIR, file), 'utf8');
  let changed = false;

  if (html.includes(UNPKG_CSS)) {
    html = html.replace(UNPKG_CSS, NESHAN_CSS);
    changed = true;
  }
  if (html.includes(UNPKG_JS)) {
    html = html.replace(UNPKG_JS, NESHAN_JS);
    changed = true;
  }

  if (!html.includes('site-enhancements.css')) {
    html = html.replace(
      '<link rel="stylesheet" href="../css/i18n.css">',
      '<link rel="stylesheet" href="../css/i18n.css">\n    <link rel="stylesheet" href="../css/site-enhancements.css">'
    );
    changed = true;
  }

  if (!html.includes('header-snippet.js')) {
    if (html.includes('<script src="../js/i18n-boot.js">')) {
      html = html.replace(
        '<script src="../js/i18n-boot.js">',
        SCRIPTS_BLOCK + '\n<script src="../js/i18n-boot.js">'
      );
      changed = true;
    } else if (html.includes('<script src="../js/route-map.js">')) {
      html = html.replace(
        '<script src="../js/route-map.js">',
        SCRIPTS_BLOCK + '\n<script src="../js/route-map.js">'
      );
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(path.join(PEAKS_DIR, file), html, 'utf8');
    patched++;
  }
}

console.log(`Patched ${patched} peak pages (${files.length} total).`);
