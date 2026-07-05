import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name === '_archive' || name === 'node_modules') continue;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) patch(p);
  }
}

function patch(file) {
  let c = fs.readFileSync(file, 'utf8');
  const o = c;
  c = c.replace(/https:\/\/instagram\.com\/se3tigh/g, 'https://instagram.com/3tiq.ir');
  c = c.replace(/https:\/\/t\.me\/se3tigh/g, 'https://t.me/+989302323969');
  c = c.replace(/https:\/\/aparat\.com\/se3tigh/g, 'https://aparat.com/3tiq.ir');
  c = c.replace(
    /<a href="tel:\+989302323969">۰۹۳۰۲۳۲۳۹۶۹<\/a>، <a href="tel:\+989302323986">۰۹۳۰۲۳۲۳۹۸۶<\/a>/g,
    '<a href="tel:+989302323969">۰۹۳۰۲۳۲۳۹۶۹</a>'
  );
  if (c !== o) {
    fs.writeFileSync(file, c, 'utf8');
    console.log('Updated', path.relative(root, file));
  }
}

walk(root);
