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
            '<footer class="footer footer--compact">' +
            '<div class="container footer-compact-inner">' +
            '<p class="footer-compact-brand"><strong data-i18n="hero.brand">سه تیغ</strong> · <span data-i18n="footer.tagline">بهترین راهنمای کوهنوردی ایران</span></p>' +
            '<nav class="footer-compact-nav" aria-label="لینک\u200cهای پایین صفحه">' +
            '<a href="' + bp + 'index.html#peaks" data-i18n="footer.peaks">قله\u200cها</a>' +
            '<a href="' + bp + 'blog.html" data-i18n="nav.blog">وبلاگ</a>' +
            '<a href="' + bp + 'about.html" data-i18n="nav.about">درباره من</a>' +
            '</nav>' +
            '<div class="footer-compact-social">' +
            '<a href="' + CFG.instagram.url + '" target="_blank" rel="noopener" aria-label="' + CFG.instagram.handle + '">' + CFG.instagram.handle + '</a>' +
            '<a href="tel:' + CFG.phoneIntl + '">۰۹۳۰۲۳۲۳۹۶۹</a>' +
            '</div>' +
            '<p data-i18n="footer.copyright">&copy; ۱۴۰۵ سه تیغ. تمامی حقوق محفوظ است.</p>' +
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
