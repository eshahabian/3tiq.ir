/**
 * Central site contact & social links — single source of truth.
 */
(function (global) {
    'use strict';

    var SiteConfig = {
        phone: '09302323969',
        phoneIntl: '+989302323969',
        phones: [
            { phone: '09302323969', phoneIntl: '+989302323969', phoneDisplay: '09302323969' },
            { phone: '09302323986', phoneIntl: '+989302323986', phoneDisplay: '09302323986' }
        ],
        email: 'eshahabian@gmail.com',
        emailDisplay: 'eshahabian[a]gmail.com',
        instagram: {
            url: 'https://instagram.com/3tiq.ir',
            handle: '@3tiq.ir'
        },
        telegram: {
            url: 'https://t.me/+989302323969'
        },
        whatsapp: {
            url: 'https://wa.me/989302323969'
        },
        aparat: {
            url: 'https://aparat.com/3tiq.ir'
        },
        siteUrl: 'https://3tiq.ir'
    };

    SiteConfig.applyFooter = function () {
        var footer = document.querySelector('.footer');
        if (!footer) return;

        footer.querySelectorAll('a[href*="instagram.com"]').forEach(function (a) {
            a.href = SiteConfig.instagram.url;
            a.setAttribute('aria-label', SiteConfig.instagram.handle);
        });

        footer.querySelectorAll('a[href*="t.me"]').forEach(function (a) {
            a.href = SiteConfig.telegram.url;
        });

        footer.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
            a.href = SiteConfig.whatsapp.url;
        });

        footer.querySelectorAll('a[href*="aparat.com"]').forEach(function (a) {
            a.href = SiteConfig.aparat.url;
        });

        footer.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
            a.href = 'tel:' + SiteConfig.phoneIntl;
            if (a.textContent.indexOf('0930') >= 0 || a.textContent.indexOf('۰۹۳۰') >= 0) {
                a.textContent = '۰۹۳۰۲۳۲۳۹۶۹';
            }
        });

        footer.querySelectorAll('.footer-section p').forEach(function (p) {
            if (p.innerHTML.indexOf('tel:') >= 0 && p.innerHTML.indexOf('،') >= 0) {
                p.innerHTML = '<span data-i18n="footer.phone">تلفن:</span> <a href="tel:' +
                    SiteConfig.phoneIntl + '">۰۹۳۰۲۳۲۳۹۶۹</a>';
            }
        });

        footer.querySelectorAll('.social-link.social-instagram span[data-i18n="footer.instagram"]').forEach(function (s) {
            s.textContent = SiteConfig.instagram.handle;
        });
    };

    global.SiteConfig = SiteConfig;
})(typeof window !== 'undefined' ? window : this);
