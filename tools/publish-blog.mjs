/**
 * Publish blog post: card on site + caption + optional Instagram auto-post.
 *
 * Usage:
 *   node tools/publish-blog.mjs --title "عنوان" --slug blog-my-post --cat safety --excerpt "..."
 *
 * Requires .env with META_ACCESS_TOKEN + INSTAGRAM_USER_ID for auto Instagram post.
 * Skip IG: --no-instagram
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import {
  loadEnv,
  publishToInstagram,
  markPublished,
  buildCaption,
  isConfigured,
  root
} from './instagram-lib.mjs';

const siteUrl = 'https://3tiq.ir';

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const title = arg('title');
const slug = arg('slug');
const cat = arg('cat', 'tips');
const excerpt = arg('excerpt', '');
const minutes = arg('minutes', '6');
const image = arg('image', 'images/peaks/damavand.jpg');
const dateFa = arg('date', '');
const skipInstagram = process.argv.includes('--no-instagram');

if (!title || !slug) {
  console.error('Usage: node tools/publish-blog.mjs --title "..." --slug blog-my-post --cat safety --excerpt "..."');
  process.exit(1);
}

const postId = slug.replace(/^blog\//, '').replace(/\.html$/, '');
const href = slug.startsWith('blog/') ? slug : slug.endsWith('.html') ? slug : 'blog/' + slug + '.html';
const url = siteUrl + '/' + href.replace(/^\//, '');

const catLabels = {
  safety: '⚠️ ایمنی',
  gear: '🎒 تجهیزات',
  route: '🗺 مسیرها',
  nature: '🌿 طبیعت',
  tips: '💡 نکات'
};

const catClass = { safety: 'cat-safety', gear: 'cat-gear', route: 'cat-route', nature: 'cat-nature', tips: 'cat-tips' };

const card = `                <a href="${href}" class="blog-card" data-cat="${cat}">
                    <div class="blog-card-img">
                        <img src="${image}" alt="${title}" loading="lazy">
                        <span class="blog-card-cat ${catClass[cat] || 'cat-tips'}">${catLabels[cat] || cat}</span>
                    </div>
                    <div class="blog-card-body">
                        <div class="blog-card-meta">
                            <span>📅 ${dateFa || 'امروز'}</span>
                            <span>⏱ ${minutes} دقیقه</span>
                        </div>
                        <div class="blog-card-title">${title}</div>
                        <div class="blog-card-excerpt">${excerpt}</div>
                    </div>
                    <div class="blog-card-footer">
                        <div class="blog-card-author">
                            <div class="blog-card-author-avatar">سه</div>
                            <span class="blog-card-author-name">تیم سه تیغ</span>
                        </div>
                        <span class="blog-read-more">ادامه &larr;</span>
                    </div>
                </a>`;

const post = { id: postId, slug: href, title, excerpt, image, cat, dateFa: dateFa || 'امروز' };
const caption = buildCaption(post);

const igDir = path.join(root, 'data', 'instagram');
fs.mkdirSync(igDir, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const captionPath = path.join(igDir, `${stamp}-${postId}.txt`);
fs.writeFileSync(captionPath, caption, 'utf8');

const blogHtml = path.join(root, 'blog.html');
let blog = fs.readFileSync(blogHtml, 'utf8');
const marker = '<!-- BLOG-GENERATOR-INSERT -->';
if (blog.includes(`href="${href}"`)) {
  console.log('Card already in blog.html');
} else if (blog.includes(marker)) {
  blog = blog.replace(marker, marker + '\n' + card);
  fs.writeFileSync(blogHtml, blog, 'utf8');
  console.log('Added card to blog.html');
}

const registryPath = path.join(root, 'data', 'blog-posts.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
if (!registry.posts.find(p => p.id === postId)) {
  registry.posts.unshift(post);
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
  console.log('Added to blog-posts.json');
}

console.log('Caption:', captionPath);

const imageFile = path.join(root, image.replace(/^\//, ''));
if (fs.existsSync(imageFile)) {
  try {
    execSync(`python "${path.join(root, 'tools', 'watermark-blog-images.py')}" "${imageFile}"`, { stdio: 'inherit' });
  } catch {
    console.log('⚠️ Watermark skipped — run: python tools/watermark-blog-images.py');
  }
}

const env = loadEnv();
if (!skipInstagram && isConfigured(env)) {
  try {
    const result = await publishToInstagram(post, { env });
    markPublished(postId, { mediaId: result.mediaId, title, slug: href });
    console.log('✅ Published to Instagram — Media ID:', result.mediaId);
  } catch (err) {
    console.error('⚠️ Instagram publish failed:', err.message);
    console.error('Caption saved for manual posting:', captionPath);
  }
} else if (!skipInstagram) {
  console.log('ℹ️ Instagram auto-post skipped — configure .env (see .env.example)');
}

console.log('\n--- Caption ---\n');
console.log(caption);
