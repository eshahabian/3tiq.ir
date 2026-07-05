/**
 * Panahgah page — search placeholder, legend, shelter card labels on lang change.
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

    function applyChrome() {
        var search = document.getElementById('phSearch');
        if (search) search.placeholder = tr('ph.search', 'Search shelters…');

        document.querySelectorAll('.ph-legend-item').forEach(function (item) {
            var strong = item.querySelector('strong');
            var span = item.querySelector('span:last-child');
            if (!strong || !span) return;
            if (!strong.dataset.faText) strong.dataset.faText = strong.textContent.trim();
            if (!span.dataset.faText) span.dataset.faText = span.textContent.trim();

            if (item.classList.contains('refuge')) {
                if (isEn()) {
                    strong.textContent = tr('ph.legend.refuge', 'Shelter');
                    span.textContent = tr('ph.legend.refugeDesc', '— official lodging');
                } else {
                    strong.textContent = strong.dataset.faText;
                    span.textContent = span.dataset.faText;
                }
            } else if (item.classList.contains('bivouac')) {
                if (isEn()) {
                    strong.textContent = tr('ph.legend.bivouac', 'Bivouac');
                    span.textContent = tr('ph.legend.bivouacDesc', '— emergency only');
                } else {
                    strong.textContent = strong.dataset.faText;
                    span.textContent = span.dataset.faText;
                }
            } else if (item.classList.contains('cabin')) {
                if (isEn()) {
                    strong.textContent = tr('ph.legend.cabin', 'Cabin');
                    span.textContent = tr('ph.legend.cabinDesc', '— mountain cabin');
                } else {
                    strong.textContent = strong.dataset.faText;
                    span.textContent = span.dataset.faText;
                }
            }
        });

        var regionOpt = document.querySelector('#phRegion option[value="all"]');
        var provOpt = document.querySelector('#phProvince option[value="all"]');
        if (regionOpt) {
            if (!regionOpt.dataset.faText) regionOpt.dataset.faText = regionOpt.textContent;
            regionOpt.textContent = isEn() ? tr('ph.filter.allRanges', 'All ranges') : regionOpt.dataset.faText;
        }
        if (provOpt) {
            if (!provOpt.dataset.faText) provOpt.dataset.faText = provOpt.textContent;
            provOpt.textContent = isEn() ? tr('ph.filter.allProvinces', 'All provinces') : provOpt.dataset.faText;
        }

        document.querySelectorAll('.ph-pill[data-type="all"]').forEach(function (pill) {
            if (!pill.dataset.faText) pill.dataset.faText = pill.textContent.trim();
            pill.textContent = isEn() ? tr('ph.filter.all', 'All') : pill.dataset.faText;
        });

        if (typeof global.phShelterRender === 'function') global.phShelterRender();
    }

    document.addEventListener('3tiq:languagechange', applyChrome);
    document.addEventListener('3tiq:i18nready', applyChrome);
})(window);
