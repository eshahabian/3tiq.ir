import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const guides = JSON.parse(fs.readFileSync(path.join(root, 'data/ascent-guides.json'), 'utf8'));
const htmlPath = path.join(root, 'blog-guides.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const block =
    '    <script type="application/json" id="guidesData">' +
    JSON.stringify(guides) +
    '</script>\n\n';

if (html.includes('id="guidesData"')) {
    html = html.replace(
        /<script type="application\/json" id="guidesData">[\s\S]*?<\/script>\n\n?/,
        block
    );
} else {
    html = html.replace(
        /(\s*<\/section>\n\n)(    <script src="js\/site-config\.js">)/,
        `$1${block}$2`
    );
}

fs.writeFileSync(htmlPath, html);
console.log('Synced', guides.guides.length, 'guides into blog-guides.html');
