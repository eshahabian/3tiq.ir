import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const SITE = 'https://3tiq.ir';

function injectSchema(filePath, schema) {
  let html = fs.readFileSync(filePath, 'utf8');
  const marker = '"@type": "BreadcrumbList"';
  if (html.includes(marker)) return false;
  const script = `\n    <script type="application/ld+json">\n    ${JSON.stringify(schema, null, 2).replace(/\n/g, '\n    ')}\n    </script>`;
  html = html.replace('</head>', script + '\n</head>');
  fs.writeFileSync(filePath, html, 'utf8');
  return true;
}

const rangePages = [
  { file: 'alborz-markazi.html', name: 'البرز مرکزی', en: 'Central Alborz' },
  { file: 'alborz-shargi.html', name: 'البرز شرقی', en: 'Eastern Alborz' },
  { file: 'alborz-gharbi.html', name: 'البرز غربی', en: 'Western Alborz' },
  { file: 'zagros-shomal.html', name: 'زاگرس شمالی', en: 'Northern Zagros' },
  { file: 'zagros-markazi.html', name: 'زاگرس مرکزی', en: 'Central Zagros' },
  { file: 'zagros-jonoob.html', name: 'زاگرس جنوبی', en: 'Southern Zagros' },
  { file: 'koohaye-markazi.html', name: 'کوه‌های مرکزی', en: 'Central Mountains of Iran' },
  { file: 'koohaye-atashfeshani.html', name: 'کوه‌های آتشفشانی', en: 'Volcanic Mountains of Iran' }
];

let rangeCount = 0;
for (const page of rangePages) {
  const filePath = path.join(root, page.file);
  if (!fs.existsSync(filePath)) continue;
  const html = fs.readFileSync(filePath, 'utf8');
  const descMatch = html.match(/meta name="description" content="([^"]+)"/);
  const description = descMatch ? descMatch[1] : '';
  const url = `${SITE}/${page.file}`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: `${page.name} | سه تیغ`,
        description,
        inLanguage: 'fa-IR',
        isPartOf: { '@type': 'WebSite', name: 'سه تیغ', url: SITE },
        about: { '@type': 'Place', name: page.name, alternateName: page.en }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'خانه', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: page.name, item: url }
        ]
      }
    ]
  };

  if (injectSchema(filePath, schema)) rangeCount++;
}

const panahgahPath = path.join(root, 'panahgah.html');
let shelterCount = 0;
try {
  const shelters = JSON.parse(fs.readFileSync(path.join(root, 'data', 'shelters-detail.json'), 'utf8'));
  shelterCount = Array.isArray(shelters) ? shelters.length : Object.keys(shelters).length;
} catch {
  shelterCount = 49;
}

const panahgahSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${SITE}/panahgah.html#webpage`,
      url: `${SITE}/panahgah.html`,
      name: 'پناهگاه‌های کوهستان | سه تیغ',
      description: 'فهرست کامل پناهگاه‌ها، جان‌پناه‌ها و کلبه‌های کوهستانی ایران',
      inLanguage: 'fa-IR',
      isPartOf: { '@type': 'WebSite', name: 'سه تیغ', url: SITE },
      about: { '@type': 'Thing', name: 'پناهگاه کوهستانی', alternateName: 'Mountain shelter' },
      numberOfItems: shelterCount
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'خانه', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'پناهگاه‌ها', item: `${SITE}/panahgah.html` }
      ]
    }
  ]
};

const panahgahDone = injectSchema(panahgahPath, panahgahSchema);

console.log('Range WebPage+Breadcrumb schema:', rangeCount);
console.log('Panahgah CollectionPage schema:', panahgahDone ? 'added' : 'skipped');
