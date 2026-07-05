/**
 * Peak page bilingual chrome — lang switcher, breadcrumbs, footer, hero (RTL/LTR).
 */
(function () {
    'use strict';

    var TEXT_KEYS = {
        'درباره این قله': 'peak.about',
        'آب‌وهوا و پیش‌بینی': 'peak.weather',
        'مسیرهای صعود': 'peak.routes',
        'نکات مهم برای صعود': 'peak.tips',
        'گالری تصاویر': 'peak.gallery',
        'قله‌های اطراف': 'peak.nearby',
        '📅 بهترین فصل صعود': 'peak.seasonTitle',
        '⚡ اقدامات': 'peak.actions',
        '🖨️ چاپ / ذخیره PDF': 'peak.print',
        '🔗 اشتراک‌گذاری': 'peak.share',
        'ℹ️ اطلاعات تکمیلی': 'peak.info',
        'مختصات': 'peak.coords',
        'رشته‌کوه': 'peak.range',
        'نوع سنگ': 'peak.rockType',
        'رتبه در ایران': 'peak.rank',
        '🏠 پناهگاه‌های مسیر': 'peak.shelters',
        '🗺️ نقشه مسیر': 'peak.routeMap'
    };

    var SEASON_KEYS = ['peak.season.spring', 'peak.season.summer', 'peak.season.fall', 'peak.season.winter'];
    var RANGE_FA_EN = {
        'البرز مرکزی': 'Central Alborz',
        'البرز غربی': 'Western Alborz',
        'البرز شرقی': 'Eastern Alborz',
        'زاگرس شمالی': 'Northern Zagros',
        'زاگرس مرکزی': 'Central Zagros',
        'زاگرس جنوبی': 'Southern Zagros',
        'کوه‌های مرکزی': 'Central Iran Mountains',
        'کوه‌های مرکزی ایران': 'Central Iran Mountains'
    };

    var peakSlug = null;
    var peakFaName = null;
    var peakFaSub = null;
    var breadcrumbRangeFa = null;

    function pageSlug() {
        var m = location.pathname.match(/\/peaks\/([^/.]+)\.html/i);
        return m ? m[1] : null;
    }

    function isEn() {
        return window.I18n && I18n.isEn();
    }

    function injectLangSwitch() {
        if (document.getElementById('langSwitch')) return;
        var header = document.querySelector('.header .container');
        if (!header) return;
        header.classList.add('header-container--peak');
        var back = header.querySelector('.header-back');
        var actions = document.createElement('div');
        actions.className = 'header-actions header-actions--compact';
        var switcher = document.createElement('div');
        switcher.className = 'lang-switch';
        switcher.id = 'langSwitch';
        switcher.setAttribute('role', 'group');
        switcher.setAttribute('aria-label', 'Language');
        switcher.innerHTML =
            '<button type="button" class="lang-switch-btn active" data-lang="fa" aria-pressed="true">فا</button>' +
            '<button type="button" class="lang-switch-btn" data-lang="en" aria-pressed="false">EN</button>';
        actions.appendChild(switcher);
        if (back) {
            back.setAttribute('data-i18n', 'peak.back');
            actions.appendChild(back);
        }
        header.appendChild(actions);
        switcher.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-lang]');
            if (btn && window.I18n) I18n.apply(btn.getAttribute('data-lang'));
        });
    }

    function injectFooter() {
        if (document.querySelector('.footer')) return;
        var bp = '../';
        var footer = document.createElement('footer');
        footer.className = 'footer';
        footer.id = 'contact';
        footer.innerHTML =
            '<div class="container"><div class="footer-content">' +
            '<div class="footer-section"><h3 data-i18n="hero.brand">سه تیغ</h3><p data-i18n="footer.tagline">بهترین راهنمای کوهنوردی ایران</p></div>' +
            '<div class="footer-section"><h4 data-i18n="footer.links">لینک‌های مفید</h4><ul>' +
            '<li><a href="' + bp + 'index.html" data-i18n="nav.home">صفحه اصلی</a></li>' +
            '<li><a href="' + bp + 'index.html#peaks" data-i18n="footer.peaks">قله‌ها</a></li>' +
            '<li><a href="' + bp + 'index.html#routes" data-i18n="footer.routes">مسیرها</a></li>' +
            '<li><a href="' + bp + 'index.html#contact" data-i18n="nav.contact">تماس با ما</a></li>' +
            '</ul></div>' +
            '<div class="footer-section"><h4 data-i18n="footer.contactTitle">تماس با ما</h4>' +
            '<p data-i18n="footer.address">تهران، خیابان ولیعصر</p>' +
            '<p><span data-i18n="footer.phone">تلفن:</span> <a href="tel:+989302323969">۰۹۳۰۲۳۲۳۹۶۹</a></p>' +
            '<p><span data-i18n="footer.email">ایمیل:</span> eshahabian[a]mail.ir</p></div>' +
            '<div class="footer-section"><h4 data-i18n="footer.follow">ما را دنبال کنید</h4>' +
            '<div class="social-links">' +
            '<a href="https://instagram.com/se3tigh" target="_blank" rel="noopener" class="social-link"><span data-i18n="footer.instagram">اینستاگرام</span></a>' +
            '<a href="https://t.me/se3tigh" target="_blank" rel="noopener" class="social-link"><span data-i18n="footer.telegram">تلگرام</span></a>' +
            '</div></div></div>' +
            '<div class="footer-bottom"><p data-i18n="footer.copyright">&copy; ۱۴۰۵ سه تیغ. تمامی حقوق محفوظ است.</p></div></div>';
        document.body.appendChild(footer);
    }

    function tagElements() {
        document.querySelectorAll('.section-title').forEach(function (el) {
            var key = TEXT_KEYS[el.textContent.trim()];
            if (key) el.setAttribute('data-i18n', key);
        });
        document.querySelectorAll('.sidebar-title').forEach(function (el) {
            var key = TEXT_KEYS[el.textContent.trim()];
            if (key) el.setAttribute('data-i18n', key);
        });
        document.querySelectorAll('.action-btn').forEach(function (el) {
            var key = TEXT_KEYS[el.textContent.trim()];
            if (key) el.setAttribute('data-i18n', key);
        });
        document.querySelectorAll('.hero-breadcrumb a[href*="index"]').forEach(function (el) {
            el.setAttribute('data-i18n', 'peak.home');
        });
        document.querySelectorAll('.map-open-btn').forEach(function (el) {
            if (!el.hasAttribute('data-i18n')) el.setAttribute('data-i18n', 'peak.mapOpen');
        });
        document.querySelectorAll('.season-item').forEach(function (el, i) {
            if (SEASON_KEYS[i]) {
                var textNode = el.childNodes[el.childNodes.length - 1];
                if (textNode && textNode.nodeType === 3) {
                    var span = document.createElement('span');
                    span.setAttribute('data-i18n', SEASON_KEYS[i]);
                    span.textContent = textNode.textContent.trim();
                    el.replaceChild(span, textNode);
                }
            }
        });
        document.querySelectorAll('.sidebar-card span[style*="text-light"]').forEach(function (el) {
            var key = TEXT_KEYS[el.textContent.trim()];
            if (key) el.setAttribute('data-i18n', key);
        });
    }

    function applyBreadcrumb() {
        var bc = document.querySelector('.hero-breadcrumb');
        if (!bc) return;

        var rangeLink = bc.querySelector('a[href*="alborz"], a[href*="zagros"], a[href*="koohaye"]');
        if (rangeLink && !breadcrumbRangeFa) breadcrumbRangeFa = rangeLink.textContent.trim();

        var peakSpan = bc.querySelector('span:last-child');
        if (peakSpan && !peakFaName && peakSpan.textContent.trim() !== '›') {
            peakFaName = peakSpan.textContent.trim();
        }

        if (isEn()) {
            if (rangeLink && breadcrumbRangeFa) {
                rangeLink.textContent = RANGE_FA_EN[breadcrumbRangeFa] || breadcrumbRangeFa;
            }
            if (peakSpan && peakSlug && window.ContentEn) {
                var en = ContentEn.peakBySlug(peakSlug);
                if (en) peakSpan.textContent = en.name;
            }
        } else {
            if (rangeLink && breadcrumbRangeFa) rangeLink.textContent = breadcrumbRangeFa;
            if (peakSpan && peakFaName) peakSpan.textContent = peakFaName;
        }
    }

    function applyPeakHero() {
        var title = document.querySelector('.hero-title');
        var sub = document.querySelector('.hero-sub');
        if (title && !peakFaName) peakFaName = title.textContent.trim();
        if (sub && !peakFaSub) peakFaSub = sub.textContent.trim();
        peakSlug = peakSlug || pageSlug();

        if (isEn() && window.ContentEn && peakSlug) {
            ContentEn.loadPeaksEn().then(function () {
                var en = ContentEn.peakBySlug(peakSlug);
                if (en && title) title.textContent = en.name;
                if (sub && en) {
                    sub.textContent = en.subtitle || (en.name + ' — ' + en.province);
                }
            });
        } else {
            if (title && peakFaName) title.textContent = peakFaName;
            if (sub && peakFaSub) sub.textContent = peakFaSub;
        }
    }

    function applySidebarRange() {
        document.querySelectorAll('.sidebar-card span[style*="text-light"]').forEach(function (label) {
            if (label.getAttribute('data-i18n') !== 'peak.range') return;
            var row = label.parentElement;
            if (!row) return;
            var val = row.querySelector('span[style*="font-weight"]');
            if (!val) return;
            if (!val.dataset.faRange) val.dataset.faRange = val.textContent.trim();
            if (isEn()) {
                val.textContent = RANGE_FA_EN[val.dataset.faRange] || val.dataset.faRange;
            } else {
                val.textContent = val.dataset.faRange;
            }
        });
    }

    function apply() {
        peakSlug = pageSlug();
        injectLangSwitch();
        injectFooter();
        tagElements();
        applyBreadcrumb();
        applyPeakHero();
        applySidebarRange();
        if (window.I18n) I18n.apply(I18n.lang());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', apply);
    } else {
        apply();
    }

    document.addEventListener('3tiq:languagechange', function () {
        tagElements();
        applyBreadcrumb();
        applyPeakHero();
        applySidebarRange();
        if (window.I18n) I18n.apply(I18n.lang());
    });
})();
