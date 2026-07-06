import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

const ids = {
  'blog-pre-ascent-checklist.html': 'pre-ascent-checklist',
  'blog-alamkooh-intro.html': 'alamkooh-intro',
  'blog-layering-system.html': 'layering-system',
  'blog-beginner-peaks.html': 'beginner-peaks',
  'blog-winter-gear.html': 'winter-gear',
  'blog-altitude-sickness.html': 'altitude-sickness',
  'blog-sabalan.html': 'sabalan',
  'blog-flora.html': 'flora',
  'blog-navigation.html': 'navigation',
  'blog-damavand-guide.html': 'damavand-guide'
};

function patchFile(file, id, bp) {
  let html = fs.readFileSync(file, 'utf8');
  const o = html;

  if (!html.includes('data-blog-id')) {
    html = html.replace('<body>', '<body data-blog-id="' + id + '">');
  }

  if (!html.includes('i18n.css')) {
    html = html.replace(
      '<link rel="stylesheet" href="' + bp + 'css/style.css">',
      '<link rel="stylesheet" href="' + bp + 'css/style.css">\n    <link rel="stylesheet" href="' + bp + 'css/i18n.css">'
    );
  }

  if (!html.includes('i18n-boot.js')) {
    const inject =
      '<script src="' + bp + 'js/site-config.js"></script>\n    <script src="' + bp + 'js/footer-snippet.js"></script>\n    <script src="' + bp + 'js/i18n-boot.js" defer></script>\n    <script src="' + bp + 'js/blog-chrome.js"></script>';
    if (html.includes('blog-chrome.js')) {
      html = html.replace(/<script src="[^"]*blog-chrome\.js"><\/script>\s*/, inject + '\n    ');
    } else {
      html = html.replace(/<script src="[^"]*app\.js"><\/script>/, inject + '\n    <script src="' + bp + 'js/app.js"></script>');
    }
  }

  if (file.includes('damavand') && html.includes('images/peaks/damavand.jpg')) {
    html = html.replace(/\s*<img src="images\/peaks\/damavand\.jpg"[^>]+>\s*/, '\n        ');
  }

  if (html !== o) {
    fs.writeFileSync(file, html, 'utf8');
    console.log('Patched', path.relative(root, file));
  }
}

for (const [name, id] of Object.entries(ids)) {
  const inBlog = path.join(root, 'blog', name);
  const inRoot = path.join(root, name);
  if (fs.existsSync(inBlog)) patchFile(inBlog, id, '../');
  if (fs.existsSync(inRoot)) patchFile(inRoot, id, '');
}

let blog = fs.readFileSync(path.join(root, 'blog.html'), 'utf8');
const cardMap = {
  'blog-damavand-guide.html': 'damavand-guide',
  'blog/blog-pre-ascent-checklist.html': 'pre-ascent-checklist',
  'blog/blog-alamkooh-intro.html': 'alamkooh-intro',
  'blog/blog-layering-system.html': 'layering-system',
  'blog/blog-beginner-peaks.html': 'beginner-peaks',
  'blog/blog-winter-gear.html': 'winter-gear',
  'blog/blog-altitude-sickness.html': 'altitude-sickness',
  'blog/blog-sabalan.html': 'sabalan',
  'blog/blog-flora.html': 'flora',
  'blog/blog-navigation.html': 'navigation'
};
for (const [href, id] of Object.entries(cardMap)) {
  if (blog.includes('href="' + href + '"') && !blog.includes('data-blog-id="' + id + '"')) {
    blog = blog.replace('href="' + href + '"', 'href="' + href + '" data-blog-id="' + id + '"');
  }
}
fs.writeFileSync(path.join(root, 'blog.html'), blog, 'utf8');
console.log('Updated blog.html data-blog-id attributes');
