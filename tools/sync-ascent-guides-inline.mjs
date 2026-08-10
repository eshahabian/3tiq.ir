import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/** Peak ascent guides → data/ascent-guides.json + blog-guides.html only.
 *  Educational articles → data/blog-posts.json + blog.html only. Do not mix. */

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const guides = JSON.parse(fs.readFileSync(path.join(root, 'data/ascent-guides.json'), 'utf8'));
const htmlPath = path.join(root, 'blog-guides.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const newInner =
    '    <script type="application/json" id="guidesData">' +
    JSON.stringify(guides) +
    '</script>';

const re = /<script type="application\/json" id="guidesData">[\s\S]*?<\/script>/;
if (!re.test(html)) {
    console.error('guidesData block not found in blog-guides.html');
    process.exit(1);
}
const next = html.replace(re, newInner);
if (next === html) {
    console.error('Replace did not change blog-guides.html');
    process.exit(1);
}
fs.writeFileSync(htmlPath, next);
console.log('Synced', guides.guides.length, 'guides into blog-guides.html');
