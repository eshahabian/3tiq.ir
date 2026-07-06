import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const SITE = 'https://3tiq.ir';

const skipDirs = new Set(['_archive', 'tools', 'data', 'node_modules', '.git']);

function walkHtml(dir, list = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(full, list);
    else if (ent.name.endsWith('.html')) list.push(full);
  }
  return list;
}

function resolveHref(fromFile, href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return null;
  if (/^https?:\/\//i.test(href)) return null;
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return null;
  const base = path.dirname(fromFile);
  return path.normalize(path.join(base, clean));
}

function relUrl(fromFile, target) {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, target).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

const pages = walkHtml(root);
const issues = { brokenLinks: [], missingCanonical: [], missingDescription: [], missingOgImage: [], noI18nBoot: [], legacyPaths: [] };

for (const file of pages) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');

  if (!html.includes('rel="canonical"') && !html.includes("rel='canonical'")) {
    issues.missingCanonical.push(rel);
  }
  if (!html.match(/meta\s+name=["']description["']/i)) {
    issues.missingDescription.push(rel);
  }
  if (!html.match(/og:image/i) && !html.includes('http-equiv="refresh"')) {
    issues.missingOgImage.push(rel);
  }

  const isLive =
    !rel.startsWith('_archive/') &&
    !rel.startsWith('tools/') &&
    !rel.startsWith('data/');

  if (isLive && !html.includes('i18n-boot.js') && !html.includes('i18n.js')) {
    issues.noI18nBoot.push(rel);
  }

  if (isLive && html.includes('href="../') && !rel.includes('/')) {
    issues.legacyPaths.push(rel);
  }

  const hrefRe = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    const target = resolveHref(file, m[1]);
    if (!target) continue;
    if (!fs.existsSync(target)) {
      issues.brokenLinks.push({ page: rel, href: m[1], resolved: path.relative(root, target).replace(/\\/g, '/') });
    }
  }
}

console.log('=== 3tiq.ir Site Audit ===\n');
console.log('Pages scanned:', pages.length);
console.log('\n--- Broken internal links:', issues.brokenLinks.length, '---');
issues.brokenLinks.slice(0, 40).forEach((x) => console.log(`  ${x.page} -> ${x.href} (${x.resolved})`));
if (issues.brokenLinks.length > 40) console.log(`  ... +${issues.brokenLinks.length - 40} more`);

console.log('\n--- Missing canonical:', issues.missingCanonical.length, '---');
issues.missingCanonical.forEach((x) => console.log(' ', x));

console.log('\n--- Missing meta description:', issues.missingDescription.length, '---');
issues.missingDescription.slice(0, 20).forEach((x) => console.log(' ', x));

console.log('\n--- Missing og:image:', issues.missingOgImage.length, '---');
issues.missingOgImage.slice(0, 20).forEach((x) => console.log(' ', x));

console.log('\n--- No i18n stack:', issues.noI18nBoot.length, '---');
issues.noI18nBoot.forEach((x) => console.log(' ', x));

console.log('\n--- Suspicious ../ paths at root:', issues.legacyPaths.length, '---');
issues.legacyPaths.forEach((x) => console.log(' ', x));

const out = path.join(root, 'data', 'site-audit-report.json');
fs.writeFileSync(out, JSON.stringify(issues, null, 2), 'utf8');
console.log('\nFull report:', out);
