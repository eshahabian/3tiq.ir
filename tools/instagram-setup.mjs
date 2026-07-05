/**
 * One-time setup helper — finds INSTAGRAM_USER_ID from your Meta token.
 *
 * Usage:
 *   node tools/instagram-setup.mjs YOUR_META_ACCESS_TOKEN
 *
 * Or put token in .env as META_ACCESS_TOKEN and run:
 *   node tools/instagram-setup.mjs
 */
import { loadEnv, discoverInstagramUserId } from './instagram-lib.mjs';

const token = process.argv[2] || loadEnv().META_ACCESS_TOKEN;

if (!token) {
  console.error('Usage: node tools/instagram-setup.mjs <META_ACCESS_TOKEN>');
  console.error('Or create .env with META_ACCESS_TOKEN=...');
  process.exit(1);
}

try {
  const info = await discoverInstagramUserId(token);
  console.log('\n✅ Instagram Business account found!\n');
  console.log('Page:', info.pageName);
  console.log('Page ID:', info.pageId);
  console.log('Instagram User ID:', info.instagramUserId);
  console.log('\nAdd these to your .env file:\n');
  console.log('META_ACCESS_TOKEN=' + (process.argv[2] ? token : '(your token — already in .env)'));
  console.log('INSTAGRAM_USER_ID=' + info.instagramUserId);
  console.log('\nTip: Use the Page access token (not User token) for longer-lived publishing.');
  if (info.pageAccessToken && info.pageAccessToken !== token) {
    console.log('\nRecommended Page token:\nMETA_ACCESS_TOKEN=' + info.pageAccessToken);
  }
} catch (err) {
  console.error('❌', err.message);
  process.exit(1);
}
