import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const posts = JSON.parse(fs.readFileSync(path.join(root, 'data', 'blog-posts.json'), 'utf8')).posts;

const OG_EXTRA = `
    <meta property="og:description" content="{DESC}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://3tiq.ir/{URL}">
    <meta property="og:locale" content="fa_IR">
    <meta property="og:site_name" content="سه تیغ">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{TITLE}">
    <meta name="twitter:description" content="{DESC}">
    <meta name="twitter:image" content="https://3tiq.ir/{IMG}">`;

const ARTICLE_SCHEMA = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "{TITLE}",
      "description": "{DESC}",
      "image": "https://3tiq.ir/{IMG}",
      "author": { "@type": "Organization", "name": "سه تیغ", "url": "https://3tiq.ir" },
      "publisher": {
        "@type": "Organization",
        "name": "سه تیغ",
        "url": "https://3tiq.ir",
        "logo": { "@type": "ImageObject", "url": "https://3tiq.ir/favicon.png" }
      },
      "mainEntityOfPage": "https://3tiq.ir/{URL}",
      "inLanguage": "fa"
    }
    </script>`;

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

for (const post of posts) {
  const filePath = path.join(root, post.slug.replace(/\//g, path.sep));
  if (!fs.existsSync(filePath)) continue;
  let html = fs.readFileSync(filePath, 'utf8');
  const url = post.slug.replace(/\\/g, '/');
  const desc = post.excerpt;
  const title = post.title + ' | سه تیغ';
  const img = post.image;

  if (!html.includes('og:description')) {
    const ogBlock = OG_EXTRA
      .replace(/\{DESC\}/g, esc(desc))
      .replace(/\{URL\}/g, url)
      .replace(/\{TITLE\}/g, esc(title))
      .replace(/\{IMG\}/g, img);
    html = html.replace(
      /(<meta property="og:image"[^>]+>)/,
      '$1' + ogBlock
    );
  }

  if (!html.includes('"@type": "Article"')) {
    const schema = ARTICLE_SCHEMA
      .replace(/\{TITLE\}/g, esc(post.title))
      .replace(/\{DESC\}/g, esc(desc))
      .replace(/\{URL\}/g, url)
      .replace(/\{IMG\}/g, img);
    html = html.replace('</head>', schema + '\n</head>');
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('SEO patched:', post.slug);
}

// blog.html collection schema
const blogHtml = path.join(root, 'blog.html');
let blog = fs.readFileSync(blogHtml, 'utf8');
if (!blog.includes('"@type": "CollectionPage"')) {
  const items = posts.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    url: 'https://3tiq.ir/' + p.slug,
    image: 'https://3tiq.ir/' + p.image
  }));
  const schema = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "وبلاگ کوهنوردی | سه تیغ",
      "description": "مقالات و راهنماهای کوهنوردی ایران",
      "url": "https://3tiq.ir/blog.html",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": ${JSON.stringify(items, null, 8)}
      }
    }
    </script>`;
  blog = blog.replace('</head>', schema + '\n</head>');
  fs.writeFileSync(blogHtml, blog, 'utf8');
  console.log('blog.html CollectionPage schema added');
}
