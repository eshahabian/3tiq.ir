import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const mountains = JSON.parse(fs.readFileSync(path.join(root, 'js', 'mountains.json'), 'utf8'));
let peaksEnData = {};
try {
  peaksEnData = JSON.parse(fs.readFileSync(path.join(root, 'data', 'peaks-en.json'), 'utf8'));
} catch (e) {
  peaksEnData = {};
}

const slugByName = {};
for (const m of mountains) {
  if (m.slug) slugByName[m.name] = m.slug;
}

const peaksDir = path.join(root, 'peaks');
let count = 0;

for (const file of fs.readdirSync(peaksDir)) {
  if (!file.endsWith('.html')) continue;
  const slug = file.replace('.html', '');
  const filePath = path.join(peaksDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('"@type": "Mountain"') || html.includes('"@type":"Mountain"')) continue;

  const titleMatch = html.match(/<title>([^<|]+)/);
  const descMatch = html.match(/meta name="description" content="([^"]+)"/);
  const latMatch = html.match(/(\d+\.\d+)°N\s+(\d+\.\d+)°E/);
  const elevMatch = html.match(/stat-value[^>]*>([\d٬,]+)/);

  const faName = titleMatch ? titleMatch[1].trim() : slug;
  const description = descMatch ? descMatch[1] : '';
  const en = peaksEnData[slug] || {};
  const mtn = mountains.find((x) => x.slug === slug) || {};

  let elevation = mtn.height || null;
  if (!elevation && elevMatch) {
    elevation = parseInt(elevMatch[1].replace(/[^\d]/g, ''), 10) || null;
  }

  const lat = mtn.lat || (latMatch ? parseFloat(latMatch[1]) : null);
  const lng = mtn.lng || (latMatch ? parseFloat(latMatch[2]) : null);

  const ogImg = html.match(/og:image" content="https:\/\/3tiq\.ir\/([^"]+)"/);
  const imageUrl = ogImg ? `https://3tiq.ir/${ogImg[1]}` : `https://3tiq.ir/images/peaks/damavand.jpg`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Mountain',
    name: faName,
    alternateName: en.name || undefined,
    description: description,
    url: `https://3tiq.ir/peaks/${slug}.html`,
    image: imageUrl,
    geo: lat && lng ? { '@type': 'GeoCoordinates', latitude: lat, longitude: lng } : undefined,
    elevation: elevation ? { '@type': 'QuantitativeValue', value: elevation, unitCode: 'MTR' } : undefined,
    containedInPlace: en.province || mtn.province ? { '@type': 'Place', name: mtn.province || en.province } : undefined
  };

  Object.keys(schema).forEach((k) => schema[k] === undefined && delete schema[k]);

  const script = `\n    <script type="application/ld+json">\n    ${JSON.stringify(schema, null, 2).replace(/\n/g, '\n    ')}\n    </script>`;
  html = html.replace('</head>', script + '\n</head>');
  fs.writeFileSync(filePath, html, 'utf8');
  count++;
}

console.log('Peak Mountain schema added:', count);
