/**
 * Publish all blog posts that are not yet on Instagram.
 * Instagram rate limit: ~25 posts/24h — default publishes ONE per run.
 *
 * Usage:
 *   node tools/publish-pending-instagram.mjs           # one post
 *   node tools/publish-pending-instagram.mjs --all     # all pending (careful!)
 *   node tools/publish-pending-instagram.mjs --dry-run # preview next
 *   node tools/publish-pending-instagram.mjs --list  # show queue
 */
import fs from 'fs';
import path from 'path';
import {
  loadEnv,
  loadBlogPosts,
  publishToInstagram,
  markPublished,
  readPublishedLog,
  buildCaption,
  root,
  isConfigured
} from './instagram-lib.mjs';

const dryRun = process.argv.includes('--dry-run');
const listOnly = process.argv.includes('--list');
const publishAll = process.argv.includes('--all');
const env = loadEnv();

const posts = loadBlogPosts();
const log = readPublishedLog();
const pending = posts.filter(p => !log.posts[p.id]);

if (listOnly) {
  console.log('Published:', posts.length - pending.length, '/', posts.length);
  for (const p of posts) {
    const done = log.posts[p.id];
    console.log(done ? '✅' : '⏳', p.id, '—', p.title);
  }
  process.exit(0);
}

if (!pending.length) {
  console.log('All blog posts already published to Instagram.');
  process.exit(0);
}

if (!isConfigured(env) && !dryRun) {
  console.error('❌ Instagram not configured.');
  console.error('Create .env from .env.example and run: node tools/instagram-setup.mjs');
  process.exit(1);
}

const igDir = path.join(root, 'data', 'instagram');
fs.mkdirSync(igDir, { recursive: true });

const batch = publishAll ? pending : [pending[0]];

for (const post of batch) {
  const captionPath = path.join(igDir, `${post.id}.txt`);
  if (!fs.existsSync(captionPath)) {
    fs.writeFileSync(captionPath, buildCaption(post), 'utf8');
  }

  console.log('\n' + (dryRun ? '🔍' : '📤'), post.title);

  try {
    const result = await publishToInstagram(post, { env, dryRun });
    if (dryRun) {
      console.log('Image:', result.imageUrl);
      console.log('Caption saved:', captionPath);
      continue;
    }
    markPublished(post.id, { mediaId: result.mediaId, title: post.title, slug: post.slug });
    console.log('✅ Published — Media ID:', result.mediaId);

    if (!publishAll) break;
    await new Promise(r => setTimeout(r, 5000));
  } catch (err) {
    console.error('❌', post.id, '—', err.message);
    if (!publishAll) process.exit(1);
  }
}

if (!dryRun && !publishAll && pending.length > 1) {
  console.log(`\n${pending.length - 1} posts remaining. Run again tomorrow or use --all.`);
}
