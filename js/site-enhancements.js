/**
 * PWA, emergency panel, adventure mode, peak trust badges.
 */
(function (global) {
    'use strict';

    var PEAK_META = null;

    function basePath() {
        if (/\/peaks\//.test(location.pathname) || /\/blog\//.test(location.pathname)) return '../';
        return '';
    }

    function t(key, fallback) {
        return global.I18n ? I18n.t(key) : fallback;
    }

    function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        var bp = basePath();
        window.addEventListener('load', function () {
            navigator.serviceWorker.register(bp + 'sw.js').catch(function () {});
        });
    }

    function injectEmergencyUi() {
        if (document.getElementById('emergencyFab')) return;

        var fab = document.createElement('button');
        fab.type = 'button';
        fab.id = 'emergencyFab';
        fab.className = 'emergency-fab';
        fab.setAttribute('aria-label', t('emergency.open', 'اضطراری'));
        fab.textContent = '🆘';

        var panel = document.createElement('div');
        panel.id = 'emergencyPanel';
        panel.className = 'emergency-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.innerHTML =
            '<div class="emergency-sheet">' +
            '<h2 data-i18n="emergency.title">تماس اضطراری</h2>' +
            '<a href="tel:123" data-i18n="emergency.123">🚑 اورژانس — ۱۲۳</a>' +
            '<a href="tel:112" data-i18n="emergency.112">🆘 هلال\u200cاحمر — ۱۱۲</a>' +
            '<a href="tel:110" data-i18n="emergency.110">👮 پلیس — ۱۱۰</a>' +
            '<a href="' + basePath() + 'blog/blog-pre-ascent-checklist.html" data-i18n="emergency.checklist">✅ چک\u200cلیست قبل از صعود</a>' +
            '<a href="' + basePath() + 'blog/blog-knots-guide.html" data-i18n="emergency.knots">🪢 آموزش گره\u200cها</a>' +
            '<button type="button" class="emergency-close" id="emergencyClose" data-i18n="emergency.close">بستن</button>' +
            '</div>';

        document.body.appendChild(fab);
        document.body.appendChild(panel);

        fab.addEventListener('click', function () {
            panel.classList.add('open');
            if (global.I18n) I18n.refreshDom();
        });
        document.getElementById('emergencyClose').addEventListener('click', function () {
            panel.classList.remove('open');
        });
        panel.addEventListener('click', function (e) {
            if (e.target === panel) panel.classList.remove('open');
        });
    }

    function initAdventureMode() {
        if (localStorage.getItem('3tiq-adventure') === '1') {
            document.body.classList.add('adventure-mode');
        }
        document.querySelectorAll('.header-actions').forEach(function (actions) {
            if (actions.querySelector('.adventure-toggle')) return;
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'adventure-toggle';
            btn.setAttribute('aria-pressed', document.body.classList.contains('adventure-mode') ? 'true' : 'false');
            btn.innerHTML = '<span aria-hidden="true">🏔</span> <span data-i18n="adventure.toggle">حالت کوه</span>';
            btn.addEventListener('click', function () {
                document.body.classList.toggle('adventure-mode');
                var on = document.body.classList.contains('adventure-mode');
                localStorage.setItem('3tiq-adventure', on ? '1' : '0');
                btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
            actions.insertBefore(btn, actions.firstChild);
            if (global.I18n) I18n.refreshDom();
        });
    }

    function peakSlug() {
        var m = location.pathname.match(/\/peaks\/([^/.]+)\.html/i);
        return m ? m[1] : null;
    }

    function loadPeakMeta() {
        if (PEAK_META) return Promise.resolve(PEAK_META);
        return fetch(basePath() + 'data/peak-meta.json')
            .then(function (r) { return r.ok ? r.json() : {}; })
            .then(function (d) { PEAK_META = d || {}; return PEAK_META; })
            .catch(function () { PEAK_META = {}; return PEAK_META; });
    }

    function injectPeakTrust() {
        var slug = peakSlug();
        if (!slug) return;

        loadPeakMeta().then(function (meta) {
            var info = meta[slug] || meta.default || {};
            var reviewed = info.reviewed || 'تیر ۱۴۰۵';
            var sources = info.sources || 'نقشه توپو، داده\u200cهای GPS، تجربه کوهنوردان';

            var main = document.querySelector('.page-body main, .page-body > div:first-child');
            if (!main || main.querySelector('.peak-trust-bar')) return;

            var bar = document.createElement('div');
            bar.className = 'peak-trust-bar';
            bar.innerHTML =
                '<span data-i18n="trust.reviewed">آخرین بررسی:</span> <strong>' + reviewed + '</strong>' +
                '<span>·</span>' +
                '<span data-i18n="trust.verified">محتوای تأییدشده توسط تیم سه\u200cتیغ</span>' +
                '<div class="peak-trust-sources"><span data-i18n="trust.sources">منابع:</span> ' + sources + '</div>';

            main.insertBefore(bar, main.firstChild);
            if (global.I18n) I18n.refreshDom();
        });
    }

    function loadScrollAnimations() {
        if (prefersReducedMotion()) return;
        var bp = basePath();
        if (global.ScrollAnimations) return;
        var s = document.createElement('script');
        s.src = bp + 'js/scroll-animations.js';
        s.defer = true;
        document.body.appendChild(s);
    }

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function init() {
        registerServiceWorker();
        injectEmergencyUi();
        initAdventureMode();
        loadScrollAnimations();
        if (peakSlug()) {
            document.body.classList.add('peak-page');
            injectPeakTrust();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    global.SiteEnhancements = { init: init, injectPeakTrust: injectPeakTrust };
})(typeof window !== 'undefined' ? window : this);
