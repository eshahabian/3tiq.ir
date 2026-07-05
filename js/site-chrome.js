/**
 * Sitewide chrome: footer, nav, page titles, range heroes — bilingual.
 */
(function (global) {
    'use strict';

    var PAGES_EN = null;
    var faTitle = null;

    function basePath() {
        if (/\/peaks\//.test(location.pathname) || /\/blog\//.test(location.pathname)) return '../';
        return '';
    }

    function pageFile() {
        var path = location.pathname.split('/').pop() || 'index.html';
        return path.indexOf('.html') >= 0 ? path : 'index.html';
    }

    function loadPagesEn() {
        if (PAGES_EN) {
            global.PAGES_EN = PAGES_EN;
            return Promise.resolve(PAGES_EN);
        }
        var bp = basePath();
        return fetch(bp + 'data/pages-en.json')
            .then(function (r) { return r.json(); })
            .then(function (d) { PAGES_EN = d; global.PAGES_EN = d; return d; })
            .catch(function () { PAGES_EN = {}; global.PAGES_EN = PAGES_EN; return PAGES_EN; });
    }

    function captureFa(el) {
        if (el && !el.dataset.faText) el.dataset.faText = el.textContent.trim();
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

        document.querySelectorAll('.nav-menu a').forEach(function (a) {
            var t = a.textContent.trim();
            if (t === 'صفحه اصلی' && !a.hasAttribute('data-i18n')) a.setAttribute('data-i18n', 'nav.home');
            if (t === 'پناهگاه‌ها' && !a.hasAttribute('data-i18n')) a.setAttribute('data-i18n', 'nav.shelters');
            if (t === 'وبلاگ' && !a.hasAttribute('data-i18n')) a.setAttribute('data-i18n', 'nav.blog');
            if (t === 'تماس با ما' && !a.hasAttribute('data-i18n')) a.setAttribute('data-i18n', 'nav.contact');
            if (t === 'رشته‌کوه‌های ایران' && !a.hasAttribute('data-i18n')) a.setAttribute('data-i18n', 'nav.ranges');
        });
    }

    function upgradeFooter() {
        var footer = document.querySelector('.footer');
        if (!footer) return;

        footer.querySelectorAll('.footer-section h3').forEach(function (h) {
            if (!h.hasAttribute('data-i18n')) h.setAttribute('data-i18n', 'hero.brand');
        });

        footer.querySelectorAll('.footer-section p').forEach(function (p) {
            if (!p.hasAttribute('data-i18n') && p.textContent.indexOf('راهنمای') >= 0) {
                p.setAttribute('data-i18n', 'footer.tagline');
            }
            if (!p.hasAttribute('data-i18n') && p.textContent.indexOf('تهران') >= 0) {
                p.setAttribute('data-i18n', 'footer.address');
            }
        });

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

    function applyRangePageContent() {
        if (window.RangeI18n && document.querySelector('.peaks-section, #peaksGrid')) {
            RangeI18n.apply();
            return;
        }
        if (!window.I18n || !PAGES_EN) return;
        var info = PAGES_EN[pageFile()];
        if (!info) return;

        var hero = document.querySelector('.hero-map-content .hero-title, .region-banner h1, .ph-hero-inner h1:not([data-i18n]), .blog-hero h1:not([data-i18n])');
        var sub = document.querySelector('.hero-map-content .hero-subtitle, .region-banner p, .ph-hero-inner p:not([data-i18n]), .blog-hero p:not([data-i18n])');

        [hero, sub].forEach(captureFa);

        if (I18n.isEn()) {
            if (hero && info.title) hero.textContent = info.title;
            if (sub && info.subtitle) sub.textContent = info.subtitle;
        } else {
            if (hero && hero.dataset.faText) hero.textContent = hero.dataset.faText;
            if (sub && sub.dataset.faText) sub.textContent = sub.dataset.faText;
        }
    }

    function updateDocumentTitle() {
        if (!window.I18n) return;
        if (!faTitle) faTitle = document.title;

        if (I18n.isEn()) {
            var brand = I18n.t('hero.brand');
            var info = PAGES_EN && PAGES_EN[pageFile()];
            if (info && info.title) {
                document.title = info.title + ' | ' + brand;
                return;
            }
            var slug = location.pathname.match(/\/peaks\/([^/.]+)\.html/i);
            if (slug && window.ContentEn) {
                ContentEn.loadPeaksEn().then(function () {
                    var en = ContentEn.peakBySlug(slug[1]);
                    if (en) document.title = en.name + ' | ' + brand;
                });
                return;
            }
            document.title = faTitle.replace('سه تیغ', brand).replace(' | سه تیغ', ' | ' + brand);
        } else {
            document.title = faTitle;
        }
    }

    function applyShelterTabLabels() {
        if (!window.I18n || !window.ContentEn) return;
        document.querySelectorAll('.shelter-tab[data-i18n-region]').forEach(function (tab) {
            tab.textContent = I18n.isEn()
                ? ContentEn.regionLabel(tab.getAttribute('data-i18n-region'))
                : tab.getAttribute('data-i18n-region');
        });
    }

    function upgradeShelterTabs() {
        document.querySelectorAll('.shelter-tab[data-region]').forEach(function (tab) {
            if (tab.dataset.region !== 'all') tab.setAttribute('data-i18n-region', tab.dataset.region);
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
        document.querySelectorAll('.header-logo, .logo a img[alt="سه تیغ"]').forEach(function (el) {
            if (el.tagName === 'IMG') {
                el.alt = (window.I18n && I18n.isEn()) ? '3Tiq' : 'سه تیغ';
                return;
            }
            if (!el.dataset.faBrand) el.dataset.faBrand = el.textContent.trim();
            el.textContent = (window.I18n && I18n.isEn()) ? '3Tiq ⛰' : el.dataset.faBrand;
        });
        document.querySelectorAll('.footer-section h3[data-i18n="hero.brand"]').forEach(function (h) {
            if (window.I18n) h.textContent = I18n.t('hero.brand');
        });
    }

    function run() {
        injectLangIfMissing();
        upgradeNav();
        upgradeFooter();
        upgradeShelterTabs();
        loadPagesEn().then(function () {
            applyRangePageContent();
            updateDocumentTitle();
            applyShelterTabLabels();
            applyBrandLogo();
            if (window.I18n) I18n.apply(I18n.lang());
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

    document.addEventListener('3tiq:languagechange', function () {
        applyRangePageContent();
        updateDocumentTitle();
        applyShelterTabLabels();
        applyBrandLogo();
        if (window.I18n) I18n.apply(I18n.lang());
    });

    global.SiteChromePageFile = pageFile;
})(window);
