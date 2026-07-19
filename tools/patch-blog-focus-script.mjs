import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const blogDir = path.join(root, 'blog');
const scriptTag = '<script src="../js/blog-image-focus.js" defer></script>';

for (const file of fs.readdirSync(blogDir).filter((f) => f.endsWith('.html'))) {
  const fp = path.join(blogDir, file);
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes('blog-image-focus.js')) continue;
  if (html.includes('blog-chrome.js')) {
    html = html.replace(
      '<script src="../js/blog-chrome.js"></script>',
      '<script src="../js/blog-chrome.js"></script>\n    ' + scriptTag
    );
    fs.writeFileSync(fp, html, 'utf8');
    console.log('Script:', file);
  }
}

const dam = path.join(root, 'blog-damavand-guide.html');
if (fs.existsSync(dam)) {
  let html = fs.readFileSync(dam, 'utf8');
  if (!html.includes('blog-image-focus.js')) {
    html = html.replace(
      '<script src="js/app.js"></script>',
      '<script src="js/blog-image-focus.js" defer></script>\n    <script src="js/app.js"></script>'
    );
    fs.writeFileSync(dam, html, 'utf8');
    console.log('Script: blog-damavand-guide.html');
  }
}

let blog = fs.readFileSync(path.join(root, 'blog.html'), 'utf8');
blog = blog.replaceAll('images/shelters/tochal.jpg', 'images/blog/tochal-guide.png');
fs.writeFileSync(path.join(root, 'blog.html'), blog, 'utf8');
console.log('Fixed tochal thumb paths in blog.html');

for (const file of fs.readdirSync(blogDir).filter((f) => f.endsWith('.html'))) {
  const fp = path.join(blogDir, file);
  let html = fs.readFileSync(fp, 'utf8');
  const next = html.replaceAll('../images/shelters/tochal.jpg', '../images/blog/tochal-guide.png');
  if (next !== html) {
    fs.writeFileSync(fp, next, 'utf8');
    console.log('Tochal thumb:', file);
  }
}
