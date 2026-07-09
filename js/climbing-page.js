/**
 * Rock climbing page — load spots, bilingual cards.
 */
(function () {
    'use strict';

    function tr(k, fb) {
        return window.I18n ? I18n.t(k) : fb;
    }

    function displayName(s) {
        return window.I18n && I18n.isEn() && s.nameEn ? s.nameEn : s.name;
    }

    function typeLabel(t) {
        if (window.I18n && I18n.isEn()) {
            if (t === 'سنگ‌نوردی') return 'Rock climbing';
            if (t === 'ترکیبی') return 'Mixed';
        }
        return t;
    }

    function cardImage(s) {
        var name = displayName(s);
        if (s.image) {
            return '<div class="cl-card-img"><img src="' + s.image + '" alt="' + name.replace(/"/g, '&quot;') + '" loading="lazy"></div>';
        }
        return '';
    }

    function renderCards(spots) {
        var grid = document.getElementById('climbingGrid');
        if (!grid || !Array.isArray(spots)) return;

        grid.innerHTML = spots.map(function (s, i) {
            return '<article class="cl-card" style="animation-delay:' + (i * 0.05) + 's">' +
                cardImage(s) +
                '<div class="cl-card-head">' +
                '<span class="cl-type">' + typeLabel(s.type) + '</span>' +
                '<span class="cl-region">' + s.region + ' · ' + s.province + '</span>' +
                '</div>' +
                '<h3 class="cl-card-name">' + displayName(s) + '</h3>' +
                '<p class="cl-card-desc">' + s.description + '</p>' +
                '<div class="cl-meta">' +
                '<div><span class="cl-meta-label">' + tr('climbing.grade', 'درجه') + '</span><span class="cl-meta-value">' + s.grades + '</span></div>' +
                '<div><span class="cl-meta-label">' + tr('climbing.routes', 'مسیر') + '</span><span class="cl-meta-value">' + s.routes + '</span></div>' +
                '<div><span class="cl-meta-label">' + tr('climbing.season', 'فصل') + '</span><span class="cl-meta-value">' + s.season + '</span></div>' +
                '</div></article>';
        }).join('');
    }

    function load() {
        fetch('data/climbing-spots.json', { cache: 'no-store' })
            .then(function (r) {
                if (!r.ok) throw new Error('fetch failed');
                return r.json();
            })
            .then(renderCards)
            .catch(function () {
                var grid = document.getElementById('climbingGrid');
                if (grid) {
                    grid.innerHTML = '<p class="cl-loading">' + tr('climbing.loadFail', 'بارگذاری دیواره‌ها ممکن نشد.') + '</p>';
                }
            });
    }

    function init() {
        document.addEventListener('3tiq:languagechange', load);
        load();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
