import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

const NAME_TO_SLUG = {
  'سیالان': 'sialan',
  'خشچال': 'khashchal',
  'نیزوا': 'nizva',
  'اسپیدکمر': 'espidkamar',
  'پیرزن کولوم': 'pirzan-kolum',
  'پیرزن‌کولوم': 'pirzan-kolum',
  'وروشت': null,
  'کمانکوه': null,
  'شاه‌البرز': null,
  'لشگرک': null,
  'دارآباد': null,
  'چین‌کلاغ': null,
  'سی‌چال': null,
  'پرسون': 'espidkamar'
};

const rangeFiles = fs.readdirSync(root).filter((f) =>
  /^(alborz-|zagros-|koohaye-).*\.html$/.test(f)
);

let fixed = 0;
for (const file of rangeFiles) {
  let html = fs.readFileSync(path.join(root, file), 'utf8');
  const blocks = html.split(/\{\s*\n\s*name:/);
  let out = blocks[0];
  for (let i = 1; i < blocks.length; i++) {
    let block = '{\n            name:' + blocks[i];
    const nameMatch = block.match(/name:\s*'([^']+)'/);
    const name = nameMatch ? nameMatch[1] : null;
    const hasLink = /link:\s*'peaks\//.test(block.split('},')[0] || block);
    if (name && !hasLink && NAME_TO_SLUG[name]) {
      const slug = NAME_TO_SLUG[name];
      block = block.replace(
        /(emoji:\s*'[^']*')\s*\n(\s*\})/,
        `$1,\n            link: 'peaks/${slug}.html'\n$2`
      );
      fixed++;
      console.log(`${file}: added link for ${name} -> ${slug}`);
    }
    // Fix wrong mapping: نیزوا pointing to sarlet
    if (name === 'نیزوا' && /link: 'peaks\/sarlet\.html'/.test(block)) {
      block = block.replace("link: 'peaks/sarlet.html'", "link: 'peaks/nizva.html'");
      console.log(`${file}: fixed نیزوا link sarlet -> nizva`);
      fixed++;
    }
    out += block;
  }
  if (out !== html) fs.writeFileSync(path.join(root, file), out, 'utf8');
}
console.log('Range link fixes:', fixed);
