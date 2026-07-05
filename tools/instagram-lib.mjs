/**
 * Shared Instagram Graph API helpers for 3tiq.ir blog publishing.
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const siteUrlDefault = 'https://3tiq.ir';
const instagramHandle = '@3tiq.ir';

export function loadEnv() {
  const envPath = path.join(root, '.env');
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

export function siteUrl(env) {
  return (env.SITE_URL || siteUrlDefault).replace(/\/$/, '');
}

export function buildCaption(post) {
  const url = siteUrl(loadEnv()) + '/' + post.slug.replace(/^\//, '');
  const hashtags = [
    '#کوهنوردی', '#سه_تیغ', '#3tiq', '#ایران', '#کوه', '#کوهستان',
    '#کوهنورد', '#طبیعت_گردی'
  ].join(' ');

  return `${post.title}

${post.excerpt}

🔗 لینک مقاله:
${url}

📲 ${instagramHandle}
🌐 3tiq.ir

${hashtags}
`;
}

export function publishedLogPath() {
  return path.join(root, 'data', 'instagram', 'published-log.json');
}

export function readPublishedLog() {
  const p = publishedLogPath();
  if (!fs.existsSync(p)) return { posts: {} };
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return { posts: {} };
  }
}

export function markPublished(postId, meta) {
  const log = readPublishedLog();
  log.posts[postId] = {
    publishedAt: new Date().toISOString(),
    ...meta
  };
  fs.mkdirSync(path.dirname(publishedLogPath()), { recursive: true });
  fs.writeFileSync(publishedLogPath(), JSON.stringify(log, null, 2), 'utf8');
}

export function isConfigured(env) {
  return !!(env.META_ACCESS_TOKEN && env.INSTAGRAM_USER_ID);
}

async function graphPost(url, params) {
  const body = new URLSearchParams(params);
  const res = await fetch(url, { method: 'POST', body });
  const data = await res.json();
  if (!res.ok || data.error) {
    const msg = data.error?.message || res.statusText;
    throw new Error('Instagram API: ' + msg);
  }
  return data;
}

async function graphGet(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || data.error) {
    const msg = data.error?.message || res.statusText;
    throw new Error('Instagram API: ' + msg);
  }
  return data;
}

export async function publishToInstagram(post, options = {}) {
  const env = options.env || loadEnv();
  const dryRun = !!options.dryRun;

  const version = env.META_GRAPH_VERSION || 'v21.0';
  const token = env.META_ACCESS_TOKEN;
  const igUserId = env.INSTAGRAM_USER_ID;
  const base = siteUrl(env);
  const imageUrl = base + '/' + post.image.replace(/^\//, '');
  const caption = options.caption || buildCaption(post);

  if (dryRun) {
    return { dryRun: true, imageUrl, caption };
  }

  if (!isConfigured(env)) {
    throw new Error('Instagram not configured — add META_ACCESS_TOKEN and INSTAGRAM_USER_ID to .env');
  }

  const createUrl = `https://graph.facebook.com/${version}/${igUserId}/media`;
  const container = await graphPost(createUrl, {
    image_url: imageUrl,
    caption,
    access_token: token
  });

  const publishUrl = `https://graph.facebook.com/${version}/${igUserId}/media_publish`;
  const published = await graphPost(publishUrl, {
    creation_id: container.id,
    access_token: token
  });

  return {
    mediaId: published.id,
    containerId: container.id,
    imageUrl,
    caption
  };
}

export async function discoverInstagramUserId(token, version = 'v21.0') {
  const pages = await graphGet(
    `https://graph.facebook.com/${version}/me/accounts?access_token=${encodeURIComponent(token)}`
  );
  if (!pages.data?.length) {
    throw new Error('No Facebook Pages found. Link Instagram to a Facebook Page first.');
  }

  for (const page of pages.data) {
    const pageToken = page.access_token;
    const info = await graphGet(
      `https://graph.facebook.com/${version}/${page.id}?fields=instagram_business_account,name&access_token=${encodeURIComponent(pageToken)}`
    );
    if (info.instagram_business_account?.id) {
      return {
        instagramUserId: info.instagram_business_account.id,
        pageName: info.name,
        pageId: page.id,
        pageAccessToken: pageToken
      };
    }
  }

  throw new Error('No Instagram Business account linked to your Facebook Pages.');
}

export function loadBlogPosts() {
  const p = path.join(root, 'data', 'blog-posts.json');
  return JSON.parse(fs.readFileSync(p, 'utf8')).posts;
}

export { root, siteUrlDefault, instagramHandle };
