import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

const from = /height:55vh;min-height:360px/g;
const to = 'height:60vh;min-height:400px';

const from2 = /height:\s*55vh;\s*min-height:\s*360px/g;
const to2 = 'height: 60vh; min-height: 400px';

function patch(fp) {
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  html = html.replace(from, to).replace(from2, to2);
  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log('Patched', path.relative(root, fp));
  }
}

for (const f of fs.readdirSync(path.join(root, 'blog')).filter((x) => x.endsWith('.html'))) {
  patch(path.join(root, 'blog', f));
}
patch(path.join(root, 'blog-damavand-guide.html'));
