/**
 * Peak page bilingual chrome — lang switcher + UI labels + peak name (RTL/LTR).
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
    var peakSlug = null;
    var peakFaName = null;

    function pageSlug() {
        var m = location.pathname.match(/\/peaks\/([^/.]+)\.html/i);
        return m ? m[1] : null;
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

    function applyPeakName() {
        var title = document.querySelector('.hero-title');
        if (!title) return;
        if (!peakFaName) peakFaName = title.textContent.trim();
        peakSlug = peakSlug || pageSlug();

        if (window.I18n && I18n.isEn() && window.ContentEn && peakSlug) {
            ContentEn.loadPeaksEn().then(function () {
                var en = ContentEn.peakBySlug(peakSlug);
                if (en && en.name) title.textContent = en.name;
            });
        } else if (peakFaName) {
            title.textContent = peakFaName;
        }
    }

    function apply() {
        injectLangSwitch();
        tagElements();
        applyPeakName();
        if (window.I18n) I18n.apply(I18n.lang());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', apply);
    } else {
        apply();
    }

    document.addEventListener('3tiq:languagechange', function () {
        tagElements();
        applyPeakName();
        if (window.I18n) I18n.apply(I18n.lang());
    });
})();
