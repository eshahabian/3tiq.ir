import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

const from = /height:60vh;min-height:400px/g;
const to = 'height:65vh;min-height:440px';

const from2 = /height:\s*60vh;\s*min-height:\s*400px/g;
const to2 = 'height: 65vh; min-height: 440px';

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
