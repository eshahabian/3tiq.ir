import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const blogDir = path.join(root, 'blog');

const cssLink = '<link rel="stylesheet" href="../css/blog-post.css">';
const heroCssOld = '.post-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}';
const heroCssNew = '.post-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 22%}';

for (const file of fs.readdirSync(blogDir).filter((f) => f.endsWith('.html'))) {
  const fp = path.join(blogDir, file);
  let html = fs.readFileSync(fp, 'utf8');
  let changed = false;

  if (html.includes('i18n.css') && !html.includes('blog-post.css')) {
    html = html.replace(
      '<link rel="stylesheet" href="../css/i18n.css">',
      '<link rel="stylesheet" href="../css/i18n.css">\n    ' + cssLink
    );
    changed = true;
  }

  if (html.includes(heroCssOld)) {
    html = html.replace(heroCssOld, heroCssNew);
    changed = true;
  }

  if (file === 'blog-tochal-guide.html') {
    html = html.replaceAll('../images/shelters/tochal.jpg', '../images/blog/tochal-guide.png');
    html = html.replaceAll('https://3tiq.ir/images/shelters/tochal.jpg', 'https://3tiq.ir/images/blog/tochal-guide.png');
    changed = true;
  }

  if (file === 'blog-weather-check.html') {
    html = html.replaceAll('../images/peaks/asmankooh.jpg', '../images/blog/weather-check.png');
    html = html.replaceAll('https://3tiq.ir/images/peaks/asmankooh.jpg', 'https://3tiq.ir/images/blog/weather-check.png');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log('Patched', file);
  }
}

// blog-damavand-guide.html at root
const dam = path.join(root, 'blog-damavand-guide.html');
if (fs.existsSync(dam)) {
  let html = fs.readFileSync(dam, 'utf8');
  let changed = false;
  if (!html.includes('blog-post.css')) {
    html = html.replace(
      '<link rel="stylesheet" href="css/style.css">',
      '<link rel="stylesheet" href="css/style.css">\n    <link rel="stylesheet" href="css/blog-post.css">'
    );
    changed = true;
  }
  html = html.replace(
    /object-fit:cover;\s*\}/,
    (m) => (m.includes('object-position') ? m : m.replace('}', ' object-position:center 22%; }'))
  );
  if (changed) fs.writeFileSync(dam, html, 'utf8');
  console.log('Patched blog-damavand-guide.html');
}

// blog.html list page
const blogHtml = path.join(root, 'blog.html');
let blog = fs.readFileSync(blogHtml, 'utf8');
if (!blog.includes('blog-post.css')) {
  blog = blog.replace(
    '<link rel="stylesheet" href="css/style.css">',
    '<link rel="stylesheet" href="css/style.css">\n    <link rel="stylesheet" href="css/blog-post.css">'
  );
}
blog = blog.replaceAll('images/peaks/asmankooh.jpg', 'images/blog/weather-check.png');
blog = blog.replaceAll('images/shelters/tochal.jpg', 'images/blog/tochal-guide.png');
if (!blog.includes('blog-image-focus.js')) {
  blog = blog.replace(
    '<script src="js/blog-chrome.js"></script>',
    '<script src="js/blog-chrome.js"></script>\n    <script src="js/blog-image-focus.js" defer></script>'
  );
}
if (!blog.match(/\.blog-card-img img[^}]+object-position/)) {
  blog = blog.replace(
    '.blog-card-img img { width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease; }',
    '.blog-card-img img { width:100%;height:100%;object-fit:cover;object-position:center 22%;display:block;transition:transform .5s ease; }'
  );
}
fs.writeFileSync(blogHtml, blog, 'utf8');
console.log('Patched blog.html');

const registryPath = path.join(root, 'data', 'blog-posts.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
for (const p of registry.posts) {
  if (p.id === 'weather-check') p.image = 'images/blog/weather-check.png';
}
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
console.log('Updated blog-posts.json');
