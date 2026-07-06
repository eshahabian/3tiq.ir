import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

const slugToImage = {
  'blog-altitude-sickness.html': 'altitude-sickness.png',
  'blog-beginner-peaks.html': 'beginner-peaks.png',
  'blog-navigation.html': 'navigation.png',
  'blog-winter-gear.html': 'winter-gear.png',
  'blog-flora.html': 'flora.png',
  'blog-sabalan.html': 'sabalan.png',
  'blog-damavand-guide.html': 'damavand-guide.png',
  '../blog-damavand-guide.html': 'damavand-guide.png'
};

function patchFile(file, bp) {
  let html = fs.readFileSync(file, 'utf8');
  const o = html;
  const imgBase = bp + 'images/blog/';

  html = html.replace(
    /<div class="related-thumb"[^>]*><\/div>/g,
    (match, offset) => {
      const slice = html.slice(Math.max(0, offset - 200), offset + 50);
      const hrefMatch = slice.match(/href="([^"]+)"/);
      if (!hrefMatch) return match;
      const img = slugToImage[hrefMatch[1]];
      if (!img) return match;
      return `<img class="related-thumb" src="${imgBase}${img}" alt="" loading="lazy">`;
    }
  );

  html = html.replace(
    /<div class="related-thumb" style="background:linear-gradient[^"]*"><\/div>/g,
    (match, offset) => {
      const slice = html.slice(Math.max(0, offset - 200), offset + 50);
      const hrefMatch = slice.match(/href="([^"]+)"/);
      if (!hrefMatch) return match;
      const img = slugToImage[hrefMatch[1]];
      if (!img) return match;
      return `<img class="related-thumb" src="${imgBase}${img}" alt="" loading="lazy">`;
    }
  );

  html = html.replace(
    /\.related-thumb\{([^}]*)\}/,
    '.related-thumb{$1;object-fit:cover}'
  );

  if (html !== o) {
    fs.writeFileSync(file, html, 'utf8');
    console.log('Related thumbs:', path.relative(root, file));
  }
}

for (const name of fs.readdirSync(path.join(root, 'blog'))) {
  if (name.endsWith('.html')) patchFile(path.join(root, 'blog', name), '../');
}

const damavand = path.join(root, 'blog-damavand-guide.html');
if (fs.existsSync(damavand)) {
  let d = fs.readFileSync(damavand, 'utf8');
  d = d.replace(
    '"image": "https://3tiq.ir/images/peaks/damavand.jpg"',
    '"image": "https://3tiq.ir/images/blog/damavand-guide.png"'
  );
  fs.writeFileSync(damavand, d, 'utf8');
  console.log('Fixed damavand JSON-LD image');
}
