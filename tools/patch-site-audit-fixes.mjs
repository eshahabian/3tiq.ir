import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

const LEGACY = {
  'alamkooh.html': 'peaks/alamkooh.html',
  'sabalan.html': 'peaks/sabalan.html',
  'sahand.html': 'peaks/sahand.html',
  'hezar.html': 'peaks/hezar.html',
  'dena.html': 'peaks/dena.html',
  'eshterankoh.html': 'peaks/eshterankoh.html',
  'shirkoh.html': 'peaks/shirkoh.html',
  'tochal.html': 'peaks/tochal.html',
  'taftan.html': 'peaks/taftan.html',
  'karkas.html': 'peaks/karkas.html',
  'zardkooh.html': 'peaks/zardkooh.html'
};

function redirectHtml(target, canonical) {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=${target}">
    <link rel="canonical" href="${canonical}">
    <title>در حال انتقال… | سه تیغ</title>
    <script>location.replace('${target}');</script>
</head>
<body>
    <p><a href="${target}">ادامه ←</a></p>
</body>
</html>
`;
}

for (const [file, target] of Object.entries(LEGACY)) {
  const canonical = `https://3tiq.ir/${target}`;
  fs.writeFileSync(path.join(root, file), redirectHtml(target, canonical), 'utf8');
  console.log('Redirect:', file, '->', target);
}

// Peak pages: add i18n-boot if missing
const peaksDir = path.join(root, 'peaks');
let patched = 0;
for (const name of fs.readdirSync(peaksDir)) {
  if (!name.endsWith('.html')) continue;
  const file = path.join(peaksDir, name);
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('i18n-boot.js')) continue;

  if (!html.includes('i18n.css')) {
    html = html.replace(
      '<link rel="stylesheet" href="../css/style.css">',
      '<link rel="stylesheet" href="../css/style.css">\n    <link rel="stylesheet" href="../css/i18n.css">'
    );
  }

  const boot = '<script src="../js/i18n-boot.js"></script>\n';
  if (html.includes('../js/route-map.js')) {
    html = html.replace('<script src="../js/route-map.js">', boot + '<script src="../js/route-map.js">');
  } else {
    html = html.replace('</body>', boot + '</body>');
  }

  fs.writeFileSync(file, html, 'utf8');
  patched++;
}
console.log('Peaks patched with i18n-boot:', patched);

// Blog posts: remove duplicate site-config/footer-snippet before i18n-boot
for (const name of fs.readdirSync(path.join(root, 'blog'))) {
  if (!name.endsWith('.html')) continue;
  const file = path.join(root, 'blog', name);
  let html = fs.readFileSync(file, 'utf8');
  const dup = `<script src="../js/site-config.js"></script>\n    <script src="../js/footer-snippet.js"></script>\n    <script src="../js/site-config.js"></script>\n    <script src="../js/footer-snippet.js"></script>`;
  const single = `<script src="../js/site-config.js"></script>\n    <script src="../js/footer-snippet.js"></script>`;
  if (html.includes(dup)) {
    html = html.replace(dup, single);
    fs.writeFileSync(file, html, 'utf8');
    console.log('Fixed duplicate scripts:', name);
  }
}

const damavandBlog = path.join(root, 'blog-damavand-guide.html');
if (fs.existsSync(damavandBlog)) {
  let d = fs.readFileSync(damavandBlog, 'utf8');
  const dup = `<script src="js/site-config.js"></script>\n    <script src="js/footer-snippet.js"></script>\n    <script src="js/site-config.js"></script>\n    <script src="js/footer-snippet.js"></script>`;
  const single = `<script src="js/site-config.js"></script>\n    <script src="js/footer-snippet.js"></script>`;
  if (d.includes(dup)) {
    d = d.replace(dup, single);
    fs.writeFileSync(damavandBlog, d, 'utf8');
    console.log('Fixed duplicate scripts: blog-damavand-guide.html');
  }
}
