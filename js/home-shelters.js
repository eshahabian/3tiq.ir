/**
 * Homepage shelter showcase — load, filter, bilingual cards.
 */
(function () {
    'use strict';

    var SHOW = 6;
    var shelterData = [];
    var dataReady = false;

    function tr(k, fb) {
        return window.I18n ? I18n.t(k) : fb;
    }

    function loc(n) {
        return window.I18n && I18n.isEn() ? String(n) : n.toLocaleString('fa-IR');
    }

    function regionLabel(r) {
        return window.ContentEn ? ContentEn.regionLabel(r) : r;
    }

    function typeLabel(t) {
        return window.ContentEn ? ContentEn.shelterTypeLabel(t) : t;
    }

    function shelterItem(s) {
        return window.ContentEn && I18n.isEn() ? ContentEn.shelterDisplay(s) : s;
    }

    function activeRegion() {
        var activeTab = document.querySelector('#shelterTabs .shelter-tab.active');
        var region = activeTab && activeTab.getAttribute('data-region');
        return region || 'all';
    }

    function cardImageHtml(s, item) {
        var src = (item && item.image) || s.image;
        var name = (item && item.name) || s.name || '';
        if (src && src.indexOf('placeholder') === -1) {
            return '<img src="' + src + '" alt="' + name.replace(/"/g, '&quot;') + '" loading="lazy">';
        }
        return '<div class="sh-img-placeholder"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.4"><path d="M3 17l4-8 4 6 3-4 4 6H3z"/><circle cx="18" cy="8" r="2"/></svg><span>' + regionLabel(item.region || s.region) + '</span></div>';
    }

    function renderShelterCards(data, region) {
        var grid = document.getElementById('shelterCardsGrid');
        if (!grid || !Array.isArray(data)) return;

        region = region || 'all';
        var filtered = region === 'all' ? data : data.filter(function (s) { return s.region === region; });
        filtered = filtered.slice(0, SHOW);

        if (!filtered.length) {
            grid.innerHTML = '<div class="shelter-loading">' + tr('shelter.empty', 'موردی یافت نشد.') + '</div>';
            return;
        }

        grid.innerHTML = filtered.map(function (s, i) {
            var item = shelterItem(s);
            var cap = item.capacity ? loc(item.capacity) + ' ' + tr('shelter.persons', 'نفر') : '—';
            var elec = item.electricity ? { v: tr('shelter.has', 'دارد'), c: 'yes', i: '⚡' } : { v: tr('shelter.no', 'ندارد'), c: 'no', i: '🔌' };
            var water = item.water ? { v: tr('shelter.has', 'دارد'), c: 'yes', i: '💧' } : { v: tr('shelter.no', 'ندارد'), c: 'no', i: '🚫' };
            var alt = item.altitude ? loc(item.altitude) + ' ' + tr('peaks.meters', 'م') : '';
            return '<div class="sh-card" style="animation-delay:' + (i * 0.06) + 's">' +
                '<div class="sh-card-img">' + cardImageHtml(s, item) +
                '<span class="sh-type-badge ' + s.type + '">' + typeLabel(s.type) + '</span>' +
                (alt ? '<span class="sh-altitude">⛰ ' + alt + '</span>' : '') +
                '</div><div class="sh-card-body">' +
                '<div class="sh-card-region">' + regionLabel(item.region || s.region) + ' · ' + (item.province || s.province) + '</div>' +
                '<div class="sh-card-name">' + item.name + '</div>' +
                '<div class="sh-card-desc">' + item.description + '</div>' +
                '</div><div class="sh-divider"></div><div class="sh-stats">' +
                '<div class="sh-stat"><span class="sh-stat-icon">👥</span><span class="sh-stat-value">' + cap + '</span><span class="sh-stat-label">' + tr('shelter.capacity', 'ظرفیت') + '</span></div>' +
                '<div class="sh-stat ' + elec.c + '"><span class="sh-stat-icon">' + elec.i + '</span><span class="sh-stat-value">' + elec.v + '</span><span class="sh-stat-label">' + tr('shelter.electricity', 'برق') + '</span></div>' +
                '<div class="sh-stat ' + water.c + '"><span class="sh-stat-icon">' + water.i + '</span><span class="sh-stat-value">' + water.v + '</span><span class="sh-stat-label">' + tr('shelter.water', 'آب') + '</span></div>' +
                '</div></div>';
        }).join('');
    }

    function applyShelterTabLabels() {
        document.querySelectorAll('.shelter-tab[data-i18n-region]').forEach(function (tab) {
            if (tab.dataset.region !== 'all') tab.textContent = regionLabel(tab.dataset.i18nRegion || tab.dataset.region);
        });
    }

    function refreshShelters() {
        if (!dataReady || !shelterData.length) return;
        applyShelterTabLabels();
        renderShelterCards(shelterData, activeRegion());
    }

    function loadShelterData() {
        var enLoad = window.ContentEn ? ContentEn.loadSheltersEn() : Promise.resolve();
        return Promise.all([
            fetch('data/shelters-detail.json', { cache: 'no-store' }).then(function (r) {
                if (!r.ok) throw new Error('shelters fetch failed');
                return r.json();
            }),
            enLoad
        ]).then(function (results) {
            shelterData = Array.isArray(results[0]) ? results[0] : [];
            dataReady = shelterData.length > 0;
            refreshShelters();
        }).catch(function () {
            var grid = document.getElementById('shelterCardsGrid');
            if (grid) grid.innerHTML = '<div class="shelter-loading">' + tr('shelter.loadFail', 'بارگذاری پناهگاه‌ها ممکن نشد.') + '</div>';
        });
    }

    function bindTabs() {
        document.querySelectorAll('#shelterTabs .shelter-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                document.querySelectorAll('#shelterTabs .shelter-tab').forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');
                if (dataReady) renderShelterCards(shelterData, tab.getAttribute('data-region') || 'all');
            });
        });
    }

    function init() {
        bindTabs();
        document.addEventListener('3tiq:languagechange', refreshShelters);
        loadShelterData();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.HomeShelters = { refresh: refreshShelters };
})();
