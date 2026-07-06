import fs from 'fs';
import path from 'path';

const blogHtml = path.resolve(import.meta.dirname, '../blog.html');
let html = fs.readFileSync(blogHtml, 'utf8');

html = html.replace(
  /href="([^"]+)" class="blog-card" data-cat="href="[^"]+" class="blog-card( featured)?" data-cat="([^"]+)"/g,
  'href="$1" class="blog-card$2" data-cat="$3"'
);

const imgCards = [
  ['blog/blog-altitude-sickness.html', 'altitude-sickness.png', 'ارتفاع‌زدگی در کوه'],
  ['blog/blog-sabalan.html', 'sabalan.png', 'قله سبلان'],
  ['blog/blog-flora.html', 'flora.png', 'گیاهان دارویی کوهستان'],
  ['blog/blog-navigation.html', 'navigation.png', 'مسیریابی در کوه']
];

for (const [href, img, alt] of imgCards) {
  const re = new RegExp(
    `<a href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?<div class="blog-card-img"[^>]*>[\\s\\S]*?</div>`,
    'm'
  );
  html = html.replace(re, (block) => {
    const open = block.match(/^<a href="[^"]+" class="blog-card[^"]*" data-cat="[^"]+">/)[0];
    const catSpan = block.match(/<span class="blog-card-cat[^"]*">[^<]+<\/span>/)[0];
    return `${open}
                    <div class="blog-card-img">
                        <img src="images/blog/${img}" alt="${alt}" loading="lazy">
                        ${catSpan}
                    </div>`;
  });
}

html = html.replace(/"PLACEHOLDER"/g, '');
html = html.replace(/PLACEHOLDER/g, '');

fs.writeFileSync(blogHtml, html, 'utf8');
console.log('Fixed blog.html');
