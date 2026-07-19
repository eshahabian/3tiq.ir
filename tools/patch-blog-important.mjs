import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

function addImportant(html) {
  return html.replace(/style="object-position:([^"]+)"/g, (m, v) =>
    v.includes('important') ? m : `style="object-position:${v} !important"`
  );
}

for (const file of fs.readdirSync(path.join(root, 'blog')).filter((f) => f.endsWith('.html'))) {
  const fp = path.join(root, 'blog', file);
  const next = addImportant(fs.readFileSync(fp, 'utf8'));
  if (next !== fs.readFileSync(fp, 'utf8')) {
    fs.writeFileSync(fp, next, 'utf8');
    console.log(file);
  }
}

for (const name of ['blog.html', 'blog-damavand-guide.html']) {
  const fp = path.join(root, name);
  const html = fs.readFileSync(fp, 'utf8');
  const next = addImportant(html);
  if (next !== html) {
    fs.writeFileSync(fp, next, 'utf8');
    console.log(name);
  }
}
