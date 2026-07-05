/**
 * Sitewide chrome: footer, nav dropdowns, back-to-top — bilingual.
 */
(function () {
    'use strict';

    var FOOTER_HTML = null;

    function basePath() {
        if (/\/peaks\//.test(location.pathname) || /\/blog\//.test(location.pathname)) return '../';
        return '';
    }

    function upgradeNav() {
        var maps = [
            ['البرز غربی', 'nav.alborzWest'],
            ['البرز مرکزی', 'nav.alborzCentral'],
            ['البرز شرقی', 'nav.alborzEast'],
            ['زاگرس شمالی', 'nav.zagrosNorth'],
            ['زاگرس مرکزی', 'nav.zagrosCentral'],
            ['زاگرس جنوبی', 'nav.zagrosSouth'],
            ['کوه‌های مرکزی ایران', 'nav.centralPeaks'],
            ['کوه‌های آتشفشانی و منفرد', 'nav.volcanicPeaks'],
            ['البرز ◂', 'nav.alborz'],
            ['زاگرس ◂', 'nav.zagros']
        ];
        maps.forEach(function (pair) {
            document.querySelectorAll('a').forEach(function (a) {
                if (a.textContent.trim() === pair[0] && !a.hasAttribute('data-i18n')) {
                    a.setAttribute('data-i18n', pair[1]);
                }
            });
        });
    }

    function upgradeFooter() {
        var footer = document.querySelector('.footer');
        if (!footer) return;

        var bp = basePath();

        var tagline = footer.querySelector('.footer-section p');
        if (tagline && !tagline.hasAttribute('data-i18n')) tagline.setAttribute('data-i18n', 'footer.tagline');

        footer.querySelectorAll('.footer-section h4').forEach(function (h) {
            var txt = h.textContent.trim();
            if (txt === 'لینک‌های مفید') h.setAttribute('data-i18n', 'footer.links');
            if (txt === 'تماس با ما') h.setAttribute('data-i18n', 'footer.contactTitle');
            if (txt === 'ما را دنبال کنید') h.setAttribute('data-i18n', 'footer.follow');
        });

        footer.querySelectorAll('.footer-section ul a').forEach(function (a) {
            var txt = a.textContent.trim();
            if (txt === 'صفحه اصلی') a.setAttribute('data-i18n', 'nav.home');
            if (txt === 'قله‌ها') a.setAttribute('data-i18n', 'footer.peaks');
            if (txt === 'مسیرها') a.setAttribute('data-i18n', 'footer.routes');
            if (txt === 'تماس با ما') a.setAttribute('data-i18n', 'nav.contact');
        });

        footer.querySelectorAll('.footer-section p').forEach(function (p) {
            if (p.textContent.indexOf('تهران') >= 0 && !p.hasAttribute('data-i18n')) p.setAttribute('data-i18n', 'footer.address');
        });

        footer.querySelectorAll('.social-link span').forEach(function (s) {
            var m = { 'اینستاگرام': 'footer.instagram', 'تلگرام': 'footer.telegram', 'واتساپ': 'footer.whatsapp', 'آپارات': 'footer.aparat' };
            if (m[s.textContent.trim()]) s.setAttribute('data-i18n', m[s.textContent.trim()]);
        });

        var bottom = footer.querySelector('.footer-bottom p');
        if (bottom && !bottom.hasAttribute('data-i18n')) bottom.setAttribute('data-i18n', 'footer.copyright');

        var backTop = document.getElementById('backToTop');
        if (backTop && !backTop.hasAttribute('data-i18n-attr')) {
            backTop.setAttribute('data-i18n-attr', 'aria-label:common.backToTop');
        }
    }

    function upgradeShelterTabs() {
        document.querySelectorAll('.shelter-tab[data-region]').forEach(function (tab) {
            var r = tab.dataset.region;
            if (r === 'all') return;
            tab.setAttribute('data-i18n-region', r);
        });
    }

    function applyShelterTabLabels() {
        if (!window.I18n || !window.ContentEn) return;
        document.querySelectorAll('.shelter-tab[data-i18n-region]').forEach(function (tab) {
            tab.textContent = ContentEn.regionLabel(tab.getAttribute('data-i18n-region'));
        });
    }

    function injectLangIfMissing() {
        if (document.getElementById('langSwitch')) return;
        var actions = document.querySelector('.header-actions');
        if (!actions) return;
        var div = document.createElement('div');
        div.className = 'lang-switch';
        div.id = 'langSwitch';
        div.setAttribute('role', 'group');
        div.setAttribute('aria-label', 'Language');
        div.innerHTML = '<button type="button" class="lang-switch-btn active" data-lang="fa" aria-pressed="true">فا</button><button type="button" class="lang-switch-btn" data-lang="en" aria-pressed="false">EN</button>';
        actions.insertBefore(div, actions.firstChild);
        div.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-lang]');
            if (btn && window.I18n) I18n.apply(btn.getAttribute('data-lang'));
        });
    }

    function applyBrandLogo() {
        document.querySelectorAll('.header-logo').forEach(function (el) {
            if (!el.dataset.faBrand) el.dataset.faBrand = el.textContent.trim();
            el.textContent = (window.I18n && I18n.isEn()) ? '3Tiq ⛰' : el.dataset.faBrand;
        });
    }

    function run() {
        injectLangIfMissing();
        upgradeNav();
        upgradeFooter();
        upgradeShelterTabs();
        applyShelterTabLabels();
        applyBrandLogo();
        if (window.I18n) I18n.apply(I18n.lang());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

    document.addEventListener('3tiq:languagechange', function () {
        applyShelterTabLabels();
        applyBrandLogo();
        if (window.I18n) I18n.apply(I18n.lang());
    });
})();
