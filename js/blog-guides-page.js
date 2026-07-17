(function () {
    'use strict';

    var grid = document.getElementById('guidesGrid');
    var empty = document.getElementById('guidesEmpty');
    var countEl = document.getElementById('guidesCount');
    if (!grid) return;

    var guides = [];
    var activeRegion = 'all';
    var activeDifficulty = 'all';

    var regionLabels = {
        all: 'همه',
        alborz: 'البرز',
        zagros: 'زاگرس',
        central: 'مرکزی',
        volcanic: 'آتشفشانی'
    };

    var diffClass = {
        beginner: 'guide-diff--beginner',
        intermediate: 'guide-diff--mid',
        advanced: 'guide-diff--advanced'
    };

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function cardHtml(g) {
        var href = g.slug;
        var diffCls = diffClass[g.difficulty] || 'guide-diff--mid';
        var featured = g.featured ? ' guide-card--featured' : '';
        var peakLink = g.peakPage
            ? '<a class="guide-peak-link" href="' + escapeHtml(g.peakPage) + '">صفحه ' + escapeHtml(g.peakName) + ' ←</a>'
            : '';

        return (
            '<a href="' + escapeHtml(href) + '" class="guide-card' + featured + '" data-region="' + escapeHtml(g.region) + '" data-difficulty="' + escapeHtml(g.difficulty) + '">' +
            '<div class="guide-card-img">' +
            '<img src="' + escapeHtml(g.image) + '" alt="' + escapeHtml(g.peakName) + '" loading="lazy">' +
            '<span class="guide-elev-badge">' + g.elevation.toLocaleString('fa-IR') + 'm</span>' +
            '<span class="guide-region-badge">' + escapeHtml(g.regionLabel) + '</span>' +
            '</div>' +
            '<div class="guide-card-body">' +
            '<div class="guide-card-meta">' +
            '<span>📅 ' + escapeHtml(g.dateFa) + '</span>' +
            '<span>⏱ ' + g.readMinutes + ' دقیقه</span>' +
            '</div>' +
            '<h2 class="guide-card-title">' + escapeHtml(g.title) + '</h2>' +
            '<p class="guide-card-excerpt">' + escapeHtml(g.excerpt) + '</p>' +
            '<div class="guide-card-tags">' +
            '<span class="guide-diff ' + diffCls + '">' + escapeHtml(g.difficultyLabel) + '</span>' +
            '<span class="guide-tag">🗓 ' + escapeHtml(g.days) + '</span>' +
            '<span class="guide-tag">☀ ' + escapeHtml(g.season) + '</span>' +
            '</div>' +
            peakLink +
            '</div>' +
            '<div class="guide-card-footer">' +
            '<span class="guide-read-more">مطالعه راهنما ←</span>' +
            '</div>' +
            '</a>'
        );
    }

    function render() {
        var filtered = guides.filter(function (g) {
            var okRegion = activeRegion === 'all' || g.region === activeRegion || g.region === 'all';
            var okDiff = activeDifficulty === 'all' || g.difficulty === activeDifficulty;
            return okRegion && okDiff;
        });

        filtered.sort(function (a, b) {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return b.elevation - a.elevation;
        });

        grid.innerHTML = filtered.map(cardHtml).join('');
        if (empty) empty.hidden = filtered.length > 0;
        if (countEl) {
            countEl.textContent = filtered.length + ' راهنما';
        }
    }

    function bindFilters() {
        document.querySelectorAll('[data-guide-region]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('[data-guide-region]').forEach(function (b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                activeRegion = btn.getAttribute('data-guide-region');
                render();
            });
        });

        document.querySelectorAll('[data-guide-difficulty]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('[data-guide-difficulty]').forEach(function (b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                activeDifficulty = btn.getAttribute('data-guide-difficulty');
                render();
            });
        });
    }

    fetch('data/ascent-guides.json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            guides = data.guides || [];
            render();
            bindFilters();
        })
        .catch(function () {
            grid.innerHTML = '<p class="guides-error">خطا در بارگذاری راهنماها.</p>';
        });
})();
