/**
 * Homepage climbing showcase — 3 featured crag tiles.
 */
(function () {
    'use strict';

    var FEATURED = ['veliran', 'bistoon', 'shiroud'];

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
            return '<a href="sakhre-nvardi.html" class="cl-home-card" style="animation-delay:' + (i * 0.08) + 's">' +
                '<div class="cl-home-card-img">' +
                '<img src="' + img + '" alt="' + name.replace(/"/g, '&quot;') + '" loading="lazy">' +
                '<span class="cl-home-grade">' + tr('climbing.grade', 'درجه') + ': ' + s.grades + '</span>' +
                '</div>' +
                '<div class="cl-home-card-body">' +
                '<span class="cl-home-region">' + s.region + ' · ' + s.province + '</span>' +
                '<h3 class="cl-home-name">' + name + '</h3>' +
                '<p class="cl-home-desc">' + s.description + '</p>' +
                '<span class="cl-home-link">' + tr('climbing.homeCardCta', 'مشاهده دیواره ←') + '</span>' +
                '</div></a>';
        }).join('');
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
