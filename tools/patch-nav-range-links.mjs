import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const navFixes = [
  ['<li><a href="#">زاگرس شمالی</a></li>', '<li><a href="zagros-shomal.html">زاگرس شمالی</a></li>'],
  ['<li><a href="#">زاگرس مرکزی</a></li>', '<li><a href="zagros-markazi.html">زاگرس مرکزی</a></li>'],
  ['<li><a href="#">زاگرس جنوبی</a></li>', '<li><a href="zagros-jonoob.html">زاگرس جنوبی</a></li>'],
  ['<li><a href="#">کوه‌های مرکزی ایران</a></li>', '<li><a href="koohaye-markazi.html">کوه‌های مرکزی ایران</a></li>'],
  ['<li><a href="#">کوه‌های آتشفشانی و منفرد</a></li>', '<li><a href="koohaye-atashfeshani.html">کوه‌های آتشفشانی و منفرد</a></li>']
];

const files = fs.readdirSync(root).filter((f) => f.endsWith('.html') && !f.startsWith('_'));
let count = 0;
for (const file of files) {
  const p = path.join(root, file);
  let html = fs.readFileSync(p, 'utf8');
  const before = html;
  for (const [from, to] of navFixes) html = html.split(from).join(to);
  if (html !== before) {
    fs.writeFileSync(p, html, 'utf8');
    count++;
  }
}
console.log('Nav range links fixed in', count, 'files');
