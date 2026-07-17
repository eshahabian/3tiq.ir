(function () {
    'use strict';

    var grid = document.getElementById('guidesGrid');
    var empty = document.getElementById('guidesEmpty');
    var countEl = document.getElementById('guidesCount');
    if (!grid) return;

    var guides = [];
    var activeRegion = 'all';
    var activeDifficulty = 'all';

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatElev(n) {
        try {
            return Number(n).toLocaleString('fa-IR') + 'm';
        } catch (e) {
            return String(n) + 'm';
        }
    }

    function cardHtml(g) {
        var href = g.slug;
        var featured = g.featured ? ' featured' : '';
        var metaExtra = g.peakName
            ? '<span>⛰ ' + escapeHtml(g.peakName) + '</span>'
            : '';

        var bodyBlock =
            '<div class="blog-card-body">' +
            '<div class="blog-card-meta">' +
            '<span>📅 ' + escapeHtml(g.dateFa) + '</span>' +
            '<span>⏱ ' + g.readMinutes + ' دقیقه</span>' +
            '<span>↕ ' + formatElev(g.elevation) + '</span>' +
            metaExtra +
            '</div>' +
            '<div class="blog-card-title">' + escapeHtml(g.title) + '</div>' +
            '<div class="blog-card-excerpt">' + escapeHtml(g.excerpt) + '</div>' +
            '</div>' +
            '<div class="blog-card-footer">' +
            '<div class="blog-card-author">' +
            '<div class="blog-card-author-avatar">سه</div>' +
            '<span class="blog-card-author-name">' + escapeHtml(g.difficultyLabel) + ' · ' + escapeHtml(g.days) + '</span>' +
            '</div>' +
            '<span class="blog-read-more">مطالعه راهنما ←</span>' +
            '</div>';

        if (g.featured) {
            bodyBlock = '<div style="display:flex;flex-direction:column;flex:1;">' + bodyBlock + '</div>';
        }

        return (
            '<a href="' + escapeHtml(href) + '" class="blog-card' + featured + '" data-region="' + escapeHtml(g.region) + '" data-difficulty="' + escapeHtml(g.difficulty) + '">' +
            '<div class="blog-card-img">' +
            '<img src="' + escapeHtml(g.image) + '" alt="' + escapeHtml(g.peakName || g.title) + '" loading="lazy">' +
            '<span class="blog-card-cat cat-route">🗺 ' + escapeHtml(g.regionLabel) + '</span>' +
            '</div>' +
            bodyBlock +
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

        var featured = grid.querySelector('.blog-card.featured');
        if (featured) featured.style.gridColumn = '1 / -1';

        if (empty) empty.hidden = filtered.length > 0;
        if (countEl) countEl.textContent = filtered.length + ' راهنما';
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

    function loadFromInline() {
        var el = document.getElementById('guidesData');
        if (!el) return null;
        try {
            return JSON.parse(el.textContent).guides || [];
        } catch (e) {
            return null;
        }
    }

    function init(data) {
        guides = data || [];
        render();
        bindFilters();
    }

    var inline = loadFromInline();
    if (inline && inline.length) {
        init(inline);
        return;
    }

    fetch('data/ascent-guides.json')
        .then(function (r) {
            if (!r.ok) throw new Error('fetch failed');
            return r.json();
        })
        .then(function (data) { init(data.guides || []); })
        .catch(function () {
            grid.innerHTML = '<p class="guides-error">خطا در بارگذاری راهنماها. صفحه را رفرش کن.</p>';
        });
})();
