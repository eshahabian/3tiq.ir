/**
 * Rock climbing page — filter by province, search, top-10 section.
 */
(function () {
    'use strict';

    var allSpots = [];

    function tr(k, fb) {
        return window.I18n ? I18n.t(k) : fb;
    }

    function displayName(s) {
        return window.I18n && I18n.isEn() && s.nameEn ? s.nameEn : s.name;
    }

    function typeLabel(t) {
        if (window.I18n && I18n.isEn()) {
            if (t === 'سنگ‌نوردی') return 'Rock climbing';
            if (t === 'اسپرت') return 'Sport';
            if (t === 'بیگ‌وال') return 'Big wall';
            if (t === 'بیگ‌وال/آلپاین') return 'Big wall / Alpine';
            if (t === 'آموزشی/اسپرت') return 'Training / Sport';
            if (t === 'آموزشی') return 'Training';
            if (t === 'آلپاین') return 'Alpine';
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

    function rankBadge(s) {
        if (!s.topRank) return '';
        var medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
        var label = medals[s.topRank] || ('#' + s.topRank);
        return '<span class="cl-rank-badge">' + label + '</span>';
    }

    function buildCard(s, i) {
        return '<article class="cl-card' + (s.topRank ? ' cl-card--top' : '') + '" style="animation-delay:' + (Math.min(i, 12) * 0.04) + 's">' +
            cardImage(s) +
            '<div class="cl-card-body">' +
            '<div class="cl-card-head">' +
            '<div class="cl-card-tags">' +
            '<span class="cl-type">' + typeLabel(s.type) + '</span>' +
            rankBadge(s) +
            '</div>' +
            '<span class="cl-region">' + s.province + '</span>' +
            '</div>' +
            '<h3 class="cl-card-name">' + displayName(s) + '</h3>' +
            '<p class="cl-card-desc">' + s.description + '</p>' +
            '<div class="cl-meta">' +
            '<div><span class="cl-meta-label">' + tr('climbing.grade', 'درجه') + '</span><span class="cl-meta-value">' + s.grades + '</span></div>' +
            '<div><span class="cl-meta-label">' + tr('climbing.routes', 'مسیر') + '</span><span class="cl-meta-value">' + s.routes + '</span></div>' +
            '<div><span class="cl-meta-label">' + tr('climbing.season', 'فصل') + '</span><span class="cl-meta-value">' + s.season + '</span></div>' +
            '</div></div></article>';
    }

    function activeProvince() {
        var tab = document.querySelector('#climbingTabs .climbing-tab.active');
        return tab ? tab.getAttribute('data-province') : 'all';
    }

    function filterSpots() {
        var province = activeProvince();
        var q = (document.getElementById('climbingSearch') || {}).value || '';
        q = q.trim().toLowerCase();
        return allSpots.filter(function (s) {
            var matchProv = province === 'all' || s.province === province;
            if (!matchProv) return false;
            if (!q) return true;
            var hay = [s.name, s.nameEn || '', s.province, s.description].join(' ').toLowerCase();
            return hay.indexOf(q) !== -1;
        });
    }

    function renderTop10() {
        var grid = document.getElementById('climbingTop10');
        if (!grid) return;
        var top = allSpots.filter(function (s) { return s.topRank; })
            .sort(function (a, b) { return a.topRank - b.topRank; });
        grid.innerHTML = top.map(function (s, i) { return buildCard(s, i); }).join('');
    }

    function renderGrid() {
        var grid = document.getElementById('climbingGrid');
        var countEl = document.getElementById('climbingCount');
        if (!grid) return;

        var list = filterSpots();
        if (!list.length) {
            grid.innerHTML = '<p class="cl-loading">' + tr('climbing.empty', 'موردی یافت نشد.') + '</p>';
        } else {
            grid.innerHTML = list.map(function (s, i) { return buildCard(s, i); }).join('');
        }
        if (countEl) {
            countEl.textContent = tr('climbing.spotCount', '{n} منطقه').replace('{n}',
                window.I18n && I18n.isEn() ? String(list.length) : list.length.toLocaleString('fa-IR'));
        }
    }

    function buildTabs(spots) {
        var tabs = document.getElementById('climbingTabs');
        if (!tabs) return;
        var current = activeProvince();
        var provinces = ['all'].concat(
            Array.from(new Set(spots.map(function (s) { return s.province; }))).sort()
        );
        tabs.innerHTML = provinces.map(function (p) {
            var label = p === 'all' ? tr('climbing.all', 'همه') : p;
            var active = p === current ? ' active' : '';
            return '<button type="button" class="climbing-tab' + active + '" data-province="' + p + '">' + label + '</button>';
        }).join('');

        tabs.querySelectorAll('.climbing-tab').forEach(function (btn) {
            btn.addEventListener('click', function () {
                tabs.querySelectorAll('.climbing-tab').forEach(function (t) { t.classList.remove('active'); });
                btn.classList.add('active');
                renderGrid();
            });
        });
    }

    function renderAll(spots) {
        allSpots = spots;
        buildTabs(spots);
        renderTop10();
        renderGrid();
    }

    function load() {
        fetch('data/climbing-spots.json', { cache: 'no-store' })
            .then(function (r) {
                if (!r.ok) throw new Error('fetch failed');
                return r.json();
            })
            .then(renderAll)
            .catch(function () {
                ['climbingGrid', 'climbingTop10'].forEach(function (id) {
                    var el = document.getElementById(id);
                    if (el) el.innerHTML = '<p class="cl-loading">' + tr('climbing.loadFail', 'بارگذاری دیواره‌ها ممکن نشد.') + '</p>';
                });
            });
    }

    function init() {
        var search = document.getElementById('climbingSearch');
        if (search) search.addEventListener('input', renderGrid);
        document.addEventListener('3tiq:languagechange', load);
        load();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
