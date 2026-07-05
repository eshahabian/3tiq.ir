/**
 * Publish one blog post to Instagram via Meta Graph API.
 *
 * Usage:
 *   node tools/instagram-publish.mjs --id pre-ascent-checklist
 *   node tools/instagram-publish.mjs --id damavand-guide --dry-run
 */
import {
  loadEnv,
  loadBlogPosts,
  publishToInstagram,
  markPublished,
  readPublishedLog,
  buildCaption
} from './instagram-lib.mjs';

function arg(name) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : null;
}

const id = arg('id');
const dryRun = process.argv.includes('--dry-run');

if (!id) {
  console.error('Usage: node tools/instagram-publish.mjs --id <post-id> [--dry-run]');
  process.exit(1);
}

const post = loadBlogPosts().find(p => p.id === id);
if (!post) {
  console.error('Post not found:', id);
  process.exit(1);
}

const env = loadEnv();
const log = readPublishedLog();

if (log.posts[id] && !process.argv.includes('--force')) {
  console.log('Already published on', log.posts[id].publishedAt);
  console.log('Media ID:', log.posts[id].mediaId);
  console.log('Use --force to publish again.');
  process.exit(0);
}

try {
  const result = await publishToInstagram(post, { env, dryRun });
  if (dryRun) {
    console.log('DRY RUN — would publish:');
    console.log('Image:', result.imageUrl);
    console.log('\nCaption:\n', result.caption);
    process.exit(0);
  }

  markPublished(id, { mediaId: result.mediaId, title: post.title, slug: post.slug });
  console.log('✅ Published to Instagram!');
  console.log('Media ID:', result.mediaId);
  console.log('Post:', post.title);
} catch (err) {
  console.error('❌', err.message);
  process.exit(1);
}
