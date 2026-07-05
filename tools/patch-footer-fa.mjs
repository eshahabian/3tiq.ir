/**
 * Patch Persian footer: @3tiq.ir, single phone, correct social links.
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

const phoneBlock =
  '<p><span data-i18n="footer.phone">تلفن:</span> <a href="tel:+989302323969">۰۹۳۰۲۳۲۳۹۶۹</a></p>';

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name === '_archive' || name === 'node_modules') continue;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) patch(p);
  }
}

function patch(file) {
  let c = fs.readFileSync(file, 'utf8');
  const o = c;

  c = c.replace(/تلفن:\s*۰۹۳۰۲۳۲۳۹۶۹\s*،\s*۰۹۳۰۲۳۲۳۹۸۶/g, 'تلفن: ۰۹۳۰۲۳۲۳۹۶۹');
  c = c.replace(/تلفن:\s*۰۹۳۰۲۳۲۳۹۶۹\s*،\s*۰۹۳۰۲۳۲۳۹۸۶/g, 'تلفن: ۰۹۳۰۲۳۲۳۹۶۹');
  c = c.replace(
    /<p>تلفن:\s*۰۹۳۰۲۳۲۳۹۶۹[^<]*<\/p>/g,
    phoneBlock
  );
  c = c.replace(
    /<span>اینستاگرام<\/span>/g,
    '<span data-i18n="footer.instagram">@3tiq.ir</span>'
  );
  c = c.replace(
    /class="social-link social-instagram">(?![^"]*aria-label)/g,
    'class="social-link social-instagram" aria-label="@3tiq.ir">'
  );
  c = c.replace(
    /class="social-link social-instagram"><svg/g,
    'class="social-link social-instagram" aria-label="@3tiq.ir"><svg'
  );

  if (file.includes(`${path.sep}blog${path.sep}`) && !c.includes('blog-chrome.js')) {
    c = c.replace(
      /<script src="\.\.\/js\/app\.js"><\/script>/,
      '<script src="../js/site-config.js"></script>\n    <script src="../js/footer-snippet.js"></script>\n    <script src="../js/blog-chrome.js"></script>\n    <script src="../js/app.js"></script>'
    );
  }

  if (path.basename(file) === 'blog.html' && !c.includes('blog-chrome.js')) {
    c = c.replace(
      /<script src="js\/i18n-boot\.js"/,
      '<script src="js/site-config.js"></script>\n    <script src="js/footer-snippet.js"></script>\n    <script src="js/blog-chrome.js"></script>\n    <script src="js/i18n-boot.js"'
    );
  }

  if (c !== o) {
    fs.writeFileSync(file, c, 'utf8');
    console.log('Patched', path.relative(root, file));
  }
}

walk(root);
