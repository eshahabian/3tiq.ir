/**
 * Homepage climbing showcase — top 3 famous crags.
 */
(function () {
    'use strict';

    var FEATURED = ['bistoon', 'alam-kooh', 'pol-khab'];

    function tr(k, fb) {
        return window.I18n ? I18n.t(k) : fb;
    }

    function displayName(s) {
        return window.I18n && I18n.isEn() && s.nameEn ? s.nameEn : s.name;
    }

    function render(spots) {
        var grid = document.getElementById('climbingCardsGrid');
        if (!grid || !Array.isArray(spots)) return;

        var featured = FEATURED.map(function (id) {
            return spots.find(function (s) { return s.id === id; });
        }).filter(Boolean);

        if (!featured.length) {
            grid.innerHTML = '<div class="climbing-loading">' + tr('climbing.loadFail', 'بارگذاری دیواره‌ها ممکن نشد.') + '</div>';
            return;
        }

        grid.innerHTML = featured.map(function (s, i) {
            var name = displayName(s);
            var img = s.image || 'images/climbing/bistoon.jpg';
            var medal = s.topRank === 1 ? '🥇 ' : s.topRank === 2 ? '🥈 ' : s.topRank === 3 ? '🥉 ' : '';
            return '<a href="sakhre-nvardi.html" class="cl-home-card" style="animation-delay:' + (i * 0.08) + 's">' +
                '<div class="cl-home-card-img">' +
                '<img src="' + img + '" alt="' + name.replace(/"/g, '&quot;') + '" loading="lazy">' +
                '<span class="cl-home-grade">' + medal + tr('climbing.grade', 'درجه') + ': ' + s.grades + '</span>' +
                '</div>' +
                '<div class="cl-home-card-body">' +
                '<span class="cl-home-region">' + s.province + '</span>' +
                '<h3 class="cl-home-name">' + name + '</h3>' +
                '<p class="cl-home-desc">' + s.description + '</p>' +
                '<span class="cl-home-link">' + tr('climbing.homeCardCta', 'مشاهده دیواره ←') + '</span>' +
                '</div></a>';
        }).join('');

        var countEl = document.getElementById('climbingHomeSub');
        if (countEl) {
            var n = spots.length;
            var num = window.I18n && I18n.isEn() ? String(n) : n.toLocaleString('fa-IR');
            countEl.textContent = tr('climbing.homeSub', 'بیش از {n} منطقه').replace('{n}', num);
        }
    }

    function load() {
        fetch('data/climbing-spots.json', { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(render)
            .catch(function () {
                var grid = document.getElementById('climbingCardsGrid');
                if (grid) {
                    grid.innerHTML = '<div class="climbing-loading">' + tr('climbing.loadFail', 'بارگذاری دیواره‌ها ممکن نشد.') + '</div>';
                }
            });
    }

    document.addEventListener('DOMContentLoaded', load);
    document.addEventListener('3tiq:languagechange', load);
})();
