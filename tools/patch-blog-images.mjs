/**
 * Apply generated blog hero images across posts and blog.html cards.
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const siteUrl = 'https://3tiq.ir';

const posts = [
  { file: 'blog/blog-pre-ascent-checklist.html', id: 'pre-ascent-checklist', alt: 'چک‌لیست قبل از صعود کوه', cardHref: 'blog/blog-pre-ascent-checklist.html' },
  { file: 'blog-damavand-guide.html', id: 'damavand-guide', alt: 'راهنمای صعود دماوند', cardHref: 'blog-damavand-guide.html', rootLevel: true },
  { file: 'blog/blog-alamkooh-intro.html', id: 'alamkooh-intro', alt: 'علم‌کوه — دیواره شمالی', cardHref: 'blog/blog-alamkooh-intro.html' },
  { file: 'blog/blog-layering-system.html', id: 'layering-system', alt: 'سیستم لباس سه‌لایه در کوه', cardHref: 'blog/blog-layering-system.html' },
  { file: 'blog/blog-beginner-peaks.html', id: 'beginner-peaks', alt: 'قله‌های مناسب برای مبتدی', cardHref: 'blog/blog-beginner-peaks.html' },
  { file: 'blog/blog-winter-gear.html', id: 'winter-gear', alt: 'تجهیزات کوهنوردی زمستانه', cardHref: 'blog/blog-winter-gear.html' },
  { file: 'blog/blog-altitude-sickness.html', id: 'altitude-sickness', alt: 'ارتفاع‌زدگی در کوه', cardHref: 'blog/blog-altitude-sickness.html' },
  { file: 'blog/blog-sabalan.html', id: 'sabalan', alt: 'قله سبلان و دریاچه دهانه', cardHref: 'blog/blog-sabalan.html' },
  { file: 'blog/blog-flora.html', id: 'flora', alt: 'گیاهان دارویی کوهستان', cardHref: 'blog/blog-flora.html' },
  { file: 'blog/blog-navigation.html', id: 'navigation', alt: 'مسیریابی با نقشه و قطب‌نما', cardHref: 'blog/blog-navigation.html' }
];

const heroImgCss = '.post-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}';

function patchPost(post) {
  const fp = path.join(root, post.file);
  let html = fs.readFileSync(fp, 'utf8');
  const imgPath = post.rootLevel
    ? `images/blog/${post.id}.png`
    : `../images/blog/${post.id}.png`;
  const ogUrl = `${siteUrl}/images/blog/${post.id}.png`;

  if (!html.includes('post-hero-img{position:absolute')) {
    html = html.replace('.post-hero{', heroImgCss + '\n    .post-hero{');
  }

  const heroImg = `<img class="post-hero-img" src="${imgPath}" alt="${post.alt}">`;

  if (html.includes('post-hero-bg')) {
    html = html.replace(/<div class="post-hero-bg"[^>]*><\/div>\s*/g, heroImg + '\n        ');
  } else {
    html = html.replace(/<img class="post-hero-img"[^>]+>/, heroImg);
    if (!html.includes(imgPath)) {
      html = html.replace(
        /<section class="post-hero">\s*/,
        `<section class="post-hero">\n        ${heroImg}\n        `
      );
    }
  }

  html = html.replace(
    /<meta property="og:image" content="[^"]*">/,
    `<meta property="og:image" content="${ogUrl}">`
  );

  fs.writeFileSync(fp, html, 'utf8');
  console.log('Post:', post.file);
}

let blogHtml = fs.readFileSync(path.join(root, 'blog.html'), 'utf8');

for (const post of posts) {
  patchPost(post);
  const cardImg = `images/blog/${post.id}.png`;
  const re = new RegExp(
    `(href="${post.cardHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?<img src=")[^"]+(" alt="[^"]*")`,
    'm'
  );
  if (re.test(blogHtml)) {
    blogHtml = blogHtml.replace(re, `$1${cardImg}$2`);
  } else {
    const re2 = new RegExp(
      `(href="${post.cardHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?class="blog-card-img"[^>]*>\\s*)(<img src=")[^"]+("|[^>]*>)`,
      'm'
    );
    blogHtml = blogHtml.replace(re2, `$1$2${cardImg}$3`);
  }

}

fs.writeFileSync(path.join(root, 'blog.html'), blogHtml, 'utf8');

const registryPath = path.join(root, 'data', 'blog-posts.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
for (const p of registry.posts) {
  const match = posts.find(x => x.id === p.id);
  if (match) p.image = `images/blog/${match.id}.png`;
}
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');

console.log('Updated blog.html cards and blog-posts.json');
