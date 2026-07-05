/**
 * Range pages: translate hero, peak cards, map popups on language change.
 */
(function (global) {
    'use strict';

    function tr(k, fb) {
        return global.I18n ? I18n.t(k) : fb;
    }

    function isEn() {
        return global.I18n && I18n.isEn();
    }

    function locNum(n) {
        return isEn() ? String(n) : Number(n).toLocaleString('fa-IR');
    }

    function slugFromLink(link) {
        var m = (link || '').match(/peaks\/([^/.]+)\.html/i);
        return m ? m[1] : null;
    }

    function captureFa(el) {
        if (el && !el.dataset.faText) el.dataset.faText = el.textContent.trim();
    }

    function applyRangeHero() {
        if (!global.I18n || !global.PAGES_EN) return;
        var info = global.PAGES_EN[global.SiteChromePageFile ? SiteChromePageFile() : ''];
        if (!info) return;

        var heroTitle = document.querySelector('.hero-map-content .hero-title, .hero-map .hero-title');
        var heroSub = document.querySelector('.hero-map-content .hero-subtitle, .hero-map .hero-subtitle');
        var sectionTitle = document.querySelector('.peaks-section .section-title');
        var sectionSub = document.querySelector('.peaks-section .section-subtitle');

        [heroTitle, heroSub, sectionTitle, sectionSub].forEach(captureFa);

        if (heroTitle) heroTitle.textContent = isEn() && info.title ? info.title : heroTitle.dataset.faText;
        if (heroSub) heroSub.textContent = isEn() && info.subtitle ? info.subtitle : heroSub.dataset.faText;
        if (sectionTitle) sectionTitle.textContent = isEn() && info.sectionTitle ? info.sectionTitle : sectionTitle.dataset.faText;
        if (sectionSub) sectionSub.textContent = isEn() && info.sectionSubtitle ? info.sectionSubtitle : sectionSub.dataset.faText;

        document.querySelectorAll('.hero-map-content .stat-label, .hero-stats .stat-label').forEach(function (el) {
            captureFa(el);
            var t = el.dataset.faText || '';
            if (!isEn()) { el.textContent = el.dataset.faText; return; }
            if (t.indexOf('قله') >= 0 && info.statPeaks) el.textContent = info.statPeaks;
            else if (t.indexOf('بلند') >= 0 && info.statHighest) el.textContent = info.statHighest;
            else if (t === 'استان' && info.statProvinces) el.textContent = info.statProvinces;
        });

        document.querySelectorAll('.hero-map-content .hero-btn-primary').forEach(function (btn) {
            captureFa(btn);
            if (isEn() && info.viewPeaks) btn.textContent = info.viewPeaks;
            else btn.textContent = btn.dataset.faText;
        });
        document.querySelectorAll('.hero-map-content .hero-btn-secondary').forEach(function (btn) {
            captureFa(btn);
            if (isEn()) btn.textContent = tr('range.backHome', 'Back to home');
            else btn.textContent = btn.dataset.faText;
        });
    }

    function applyPeakCards() {
        if (!global.ContentEn) return;

        document.querySelectorAll('#peaksGrid .peak-card, #peaksGrid a[class*="peak-card"]').forEach(function (card) {
            var href = card.getAttribute('href') || '';
            var slug = slugFromLink(href);

            var nameEl = card.querySelector('.peak-name');
            var provEl = card.querySelector('.peak-province');
            var descEl = card.querySelector('.peak-desc');
            var badgeEl = card.querySelector('.peak-link-badge');
            var diffEl = card.querySelector('.peak-difficulty-badge');
            var elevEl = card.querySelector('.peak-elevation-badge');
            var metaEls = card.querySelectorAll('.peak-meta span');

            if (nameEl) captureFa(nameEl);
            if (provEl) captureFa(provEl);
            if (descEl) captureFa(descEl);

            var en = slug ? ContentEn.peakBySlug(slug) : null;
            var content = slug && global.PEAKS_CONTENT_EN ? global.PEAKS_CONTENT_EN[slug] : null;

            if (isEn()) {
                if (nameEl && en) nameEl.textContent = en.name;
                if (provEl && en && en.province) provEl.textContent = '📍 ' + en.province;
                if (descEl && content && content.description) descEl.textContent = content.description;
                else if (descEl && en && !content) descEl.textContent = en.name + ' — ' + (en.province || '');
                if (badgeEl) badgeEl.textContent = tr('peaks.viewDetails', 'View details →');
                if (diffEl && diffEl.dataset.faDiff) diffEl.textContent = ContentEn.diffLabel(diffEl.dataset.faDiff);
                else if (diffEl) {
                    if (!diffEl.dataset.faDiff) diffEl.dataset.faDiff = diffEl.textContent.trim();
                    diffEl.textContent = ContentEn.diffLabel(diffEl.dataset.faDiff);
                }
                if (elevEl && elevEl.dataset.faElev) {
                    elevEl.textContent = '⛰ ' + locNum(Number(elevEl.dataset.faElev)) + ' ' + tr('peaks.meters', 'm');
                }
                metaEls.forEach(function (span) {
                    captureFa(span);
                    var fa = span.dataset.faText || '';
                    if (fa.indexOf('بهترین') >= 0) {
                        span.textContent = '🗓 ' + tr('peaks.bestSeason', 'Best season') + ': ' + (content && content.bestSeason ? content.bestSeason : fa.replace(/.*:/, '').trim());
                    } else if (fa.indexOf('مدت') >= 0) {
                        span.textContent = '⏱ ' + tr('peaks.duration', 'Duration') + ': ' + (content && content.duration ? content.duration : fa.replace(/.*:/, '').trim());
                    }
                });
            } else {
                if (nameEl) nameEl.textContent = nameEl.dataset.faText;
                if (provEl) provEl.textContent = provEl.dataset.faText;
                if (descEl) descEl.textContent = descEl.dataset.faText;
                if (badgeEl) badgeEl.textContent = 'مشاهده جزئیات ←';
                if (diffEl && diffEl.dataset.faDiff) diffEl.textContent = diffEl.dataset.faDiff;
                metaEls.forEach(function (span) {
                    if (span.dataset.faText) span.textContent = span.dataset.faText;
                });
            }

            if (elevEl && !elevEl.dataset.faElev) {
                var m = elevEl.textContent.match(/[\d۰-۹,]+/);
                if (m) elevEl.dataset.faElev = String(m[0]).replace(/[^\d]/g, '') || m[0];
            }
        });
    }

    function loadPeakContentEn() {
        if (global.PEAKS_CONTENT_EN) return Promise.resolve(global.PEAKS_CONTENT_EN);
        var bp = /\/peaks\//.test(location.pathname) ? '../' : '';
        return fetch(bp + 'data/peaks-content-en.json')
            .then(function (r) { return r.json(); })
            .then(function (d) { global.PEAKS_CONTENT_EN = d; return d; })
            .catch(function () { global.PEAKS_CONTENT_EN = {}; return {}; });
    }

    function applyAll() {
        applyRangeHero();
        applyPeakCards();
    }

    function watchPeaksGrid() {
        var grid = document.getElementById('peaksGrid');
        if (!grid || grid.__i18nObserved) return;
        grid.__i18nObserved = true;
        new MutationObserver(function () {
            applyPeakCards();
        }).observe(grid, { childList: true, subtree: true });
    }

    function init() {
        if (!document.querySelector('.peaks-section, #peaksGrid')) return;
        if (!/(?:^|\/)(alborz-(?:gharbi|markazi|shargi)|zagros-(?:shomal|markazi|jonoob)|koohaye-(?:markazi|atashfeshani))\.html$/i.test(location.pathname)) return;

        watchPeaksGrid();

        Promise.all([
            global.ContentEn ? ContentEn.loadPeaksEn() : Promise.resolve(),
            loadPeakContentEn(),
            global.PAGES_EN ? Promise.resolve(global.PAGES_EN) :
                fetch('data/pages-en.json').then(function (r) { return r.json(); }).then(function (d) { global.PAGES_EN = d; return d; }).catch(function () { global.PAGES_EN = {}; })
        ]).then(applyAll);
    }

    global.RangeI18n = { apply: applyAll, applyPeakCards: applyPeakCards };

    document.addEventListener('3tiq:languagechange', applyAll);
    document.addEventListener('3tiq:i18nready', init);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
