import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const focus = JSON.parse(fs.readFileSync(path.join(root, 'data/blog-image-focus.json'), 'utf8'));

const heroCssOld = '.post-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 22%}';
const heroCssNew = '.post-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}';

function idFromBlogFile(name) {
  if (name === 'blog-damavand-guide.html') return 'damavand-guide';
  return name.replace(/^blog-/, '').replace('.html', '');
}

function heroStyle(id) {
  const pos = focus[id]?.hero || 'center top';
  return `object-position:${pos}`;
}

function patchHeroImg(html, id) {
  const style = heroStyle(id);
  return html.replace(
    /(<img class="post-hero-img" src="[^"]+" alt="[^"]*")([^>]*>)/,
    (m, start, end) => {
      if (end.includes('style=')) {
        return m.replace(/style="[^"]*"/, `style="${style}"`);
      }
      return `${start} style="${style}"${end}`;
    }
  );
}

function patchFile(fp, id) {
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  html = html.replace(heroCssOld, heroCssNew);
  html = html.replace(
    /\.post-hero-img\s*\{[^}]*object-position:[^;]+;?/g,
    (block) => block.replace(/object-position:[^;]+;?\s*/g, '')
  );
  html = patchHeroImg(html, id);
  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log('Hero:', path.relative(root, fp), '→', heroStyle(id));
  }
}

for (const file of fs.readdirSync(path.join(root, 'blog')).filter((f) => f.endsWith('.html'))) {
  patchFile(path.join(root, 'blog', file), idFromBlogFile(file));
}

patchFile(path.join(root, 'blog-damavand-guide.html'), 'damavand-guide');

let blog = fs.readFileSync(path.join(root, 'blog.html'), 'utf8');
blog = blog.replace(
  '.blog-card-img img { width:100%;height:100%;object-fit:cover;object-position:center 22%;display:block;transition:transform .5s ease; }',
  '.blog-card-img img { width:100%;height:100%;object-fit:cover;object-position:center top;display:block;transition:transform .5s ease; }'
);

blog = blog.replace(
  /<a href="([^"]+)" data-blog-id="([^"]+)" class="blog-card[^"]*"[^>]*>[\s\S]*?<img src="([^"]+)" alt="([^"]*)"([^>]*)>/g,
  (m, href, id, src, alt, rest) => {
    const pos = focus[id]?.card || 'center top';
    const style = `style="object-position:${pos}"`;
    if (rest.includes('style=')) return m;
    return m.replace(`alt="${alt}"`, `alt="${alt}" ${style}`);
  }
);

fs.writeFileSync(path.join(root, 'blog.html'), blog, 'utf8');
console.log('Patched blog.html cards');
