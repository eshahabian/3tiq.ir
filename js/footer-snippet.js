/**
 * Shared footer HTML + runtime patch for all 3tiq.ir pages.
 */
(function (global) {
    'use strict';

    var CFG = global.SiteConfig || {
        phoneIntl: '+989302323969',
        instagram: { url: 'https://instagram.com/3tiq.ir', handle: '@3tiq.ir' },
        telegram: { url: 'https://t.me/+989302323969' },
        whatsapp: { url: 'https://wa.me/989302323969' },
        aparat: { url: 'https://aparat.com/3tiq.ir' }
    };

    function basePath() {
        if (/\/blog\//.test(location.pathname)) return '../';
        return '';
    }

    function footerHtml(bp) {
        return (
            '<footer class="footer" id="contact">' +
            '<div class="container"><div class="footer-content">' +
            '<div class="footer-section"><h3 data-i18n="hero.brand">سه تیغ</h3><p data-i18n="footer.tagline">بهترین راهنمای کوهنوردی ایران</p></div>' +
            '<div class="footer-section"><h4 data-i18n="footer.links">لینک\u200cهای مفید</h4><ul>' +
            '<li><a href="' + bp + 'index.html" data-i18n="nav.home">صفحه اصلی</a></li>' +
            '<li><a href="' + bp + 'index.html#peaks" data-i18n="footer.peaks">قله\u200cها</a></li>' +
            '<li><a href="' + bp + 'index.html#routes" data-i18n="footer.routes">مسیرها</a></li>' +
            '<li><a href="' + bp + 'index.html#contact" data-i18n="nav.contact">تماس با ما</a></li>' +
            '</ul></div>' +
            '<div class="footer-section"><h4 data-i18n="footer.contactTitle">تماس با ما</h4>' +
            '<p data-i18n="footer.address">تهران، خیابان ولیعصر</p>' +
            '<p><span data-i18n="footer.phone">تلفن:</span> <a href="tel:' + CFG.phoneIntl + '">۰۹۳۰۲۳۲۳۹۶۹</a></p>' +
            '<p><span data-i18n="footer.email">ایمیل:</span> eshahabian[a]mail.ir</p></div>' +
            '<div class="footer-section"><h4 data-i18n="footer.follow">ما را دنبال کنید</h4>' +
            '<div class="social-links">' +
            '<a href="' + CFG.instagram.url + '" target="_blank" rel="noopener" aria-label="' + CFG.instagram.handle + '" class="social-link social-instagram">' +
            '<span data-i18n="footer.instagram">' + CFG.instagram.handle + '</span></a>' +
            '<a href="' + CFG.telegram.url + '" target="_blank" rel="noopener" aria-label="تلگرام" class="social-link social-telegram">' +
            '<span data-i18n="footer.telegram">تلگرام</span></a>' +
            '<a href="' + CFG.whatsapp.url + '" target="_blank" rel="noopener" aria-label="واتساپ" class="social-link social-whatsapp">' +
            '<span data-i18n="footer.whatsapp">واتساپ</span></a>' +
            '<a href="' + CFG.aparat.url + '" target="_blank" rel="noopener" aria-label="آپارات" class="social-link social-aparat">' +
            '<span data-i18n="footer.aparat">آپارات</span></a>' +
            '</div></div></div>' +
            '<div class="footer-bottom"><p data-i18n="footer.copyright">&copy; ۱۴۰۵ سه تیغ. تمامی حقوق محفوظ است.</p></div>' +
            '</div></footer>'
        );
    }

    function applyFooterPatch() {
        var footer = document.querySelector('.footer');
        if (!footer) return;

        footer.querySelectorAll('a[href*="instagram.com"]').forEach(function (a) {
            a.href = CFG.instagram.url;
            a.setAttribute('aria-label', CFG.instagram.handle);
        });
        footer.querySelectorAll('a[href*="t.me"]').forEach(function (a) {
            a.href = CFG.telegram.url;
        });
        footer.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
            a.href = CFG.whatsapp.url;
        });
        footer.querySelectorAll('a[href*="aparat.com"]').forEach(function (a) {
            a.href = CFG.aparat.url;
        });

        footer.querySelectorAll('.social-link.social-instagram span').forEach(function (s) {
            if (!s.getAttribute('data-i18n')) s.setAttribute('data-i18n', 'footer.instagram');
            s.textContent = CFG.instagram.handle;
        });

        footer.querySelectorAll('.footer-section p').forEach(function (p) {
            var t = p.textContent || '';
            if (/09302323986|۰۹۳۰۲۳۲۳۹۸۶/.test(t) || (/تلفن/.test(t) && /۰۹۳۰/.test(t) && !p.querySelector('a[href^="tel:"]'))) {
                p.innerHTML = '<span data-i18n="footer.phone">تلفن:</span> <a href="tel:' + CFG.phoneIntl + '">۰۹۳۰۲۳۲۳۹۶۹</a>';
            }
        });
    }

    function injectFooterIfMissing() {
        if (document.querySelector('.footer')) {
            applyFooterPatch();
            return;
        }
        var bp = basePath();
        var wrap = document.createElement('div');
        wrap.innerHTML = footerHtml(bp);
        var footer = wrap.firstChild;
        var btt = document.getElementById('backToTop');
        if (btt) document.body.insertBefore(footer, btt);
        else document.body.appendChild(footer);
        applyFooterPatch();
    }

    global.FooterSnippet = {
        html: footerHtml,
        apply: applyFooterPatch,
        inject: injectFooterIfMissing
    };

    if (global.SiteConfig) {
        global.SiteConfig.applyFooter = applyFooterPatch;
        global.SiteConfig.injectFooter = injectFooterIfMissing;
    }
})(typeof window !== 'undefined' ? window : this);
