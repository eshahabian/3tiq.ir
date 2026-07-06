/**
 * Range pages (Alborz / Zagros): UI chrome + peak cards. Map: js/range-map.js (lazy).
 */
(function () {
    'use strict';

    var themeToggle = document.getElementById('themeToggle');
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }

    var mobileMenuToggle = document.getElementById('mobileMenuToggle');
    var navMenu = document.getElementById('navMenu');
    var navOverlay = document.getElementById('navOverlay');

    function closeMenu() {
        if (!navMenu || !mobileMenuToggle) return;
        navMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function () {
            if (navMenu.classList.contains('active')) closeMenu();
            else {
                navMenu.classList.add('active');
                mobileMenuToggle.classList.add('active');
                if (navOverlay) navOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }
    if (navOverlay) navOverlay.addEventListener('click', closeMenu);
    document.querySelectorAll('.nav-menu a:not(.has-dropdown > a)').forEach(function (l) {
        l.addEventListener('click', closeMenu);
    });
    document.querySelectorAll('.has-dropdown > a').forEach(function (link) {
        link.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                link.parentElement.classList.toggle('open');
            }
        });
    });
    document.querySelectorAll('.has-dropdown-sub > a').forEach(function (link) {
        link.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                link.parentElement.classList.toggle('open');
            }
        });
    });

    var backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function () {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        });
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function readRangeData() {
        var el = document.getElementById('range-data');
        if (!el) return null;
        try { return JSON.parse(el.textContent); } catch (e) { return null; }
    }

    function renderPeaks(peaks) {
        var grid = document.getElementById('peaksGrid');
        if (!grid || !peaks || !peaks.length) return;

        grid.innerHTML = peaks.map(function (p) {
            var tag = p.link ? 'a' : 'div';
            var href = p.link ? 'href="' + p.link + '"' : '';
            var badge = p.link ? '<span class="peak-link-badge">مشاهده جزئیات ←</span>' : '';
            var img = p.image
                ? '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy">'
                : '<span style="font-size:3.5rem;">' + (p.emoji || '⛰️') + '</span>';
            var elev = p.elevation ? p.elevation.toLocaleString('fa-IR') : '—';

            return (
                '<' + tag + ' class="peak-card' + (p.link ? ' peak-card--linked' : '') + '" ' + href +
                ' style="' + (p.link ? 'text-decoration:none;color:inherit;display:block;' : '') + '">' +
                '<div class="peak-image-wrap">' + img +
                '<span class="peak-elevation-badge">⛰ ' + elev + ' متر</span>' +
                '<span class="peak-difficulty-badge ' + p.difficulty + '">' + p.difficulty + '</span></div>' +
                '<div class="peak-body"><div class="peak-header">' +
                '<h3 class="peak-name">' + p.name + '</h3>' +
                '<span class="peak-province">📍 ' + p.province + '</span></div>' +
                '<p class="peak-desc">' + p.description + '</p>' +
                '<div class="peak-meta">' +
                '<span>🗓 بهترین فصل: ' + p.bestSeason + '</span>' +
                '<span>⏱ مدت: ' + p.duration + '</span></div>' + badge +
                '</div></' + tag + '>'
            );
        }).join('');
    }

    function initPeaks() {
        var data = readRangeData();
        if (data && data.heroImage) {
            var bg = document.querySelector('.hero-map-bg');
            if (bg) bg.style.backgroundImage = "url('" + data.heroImage + "')";
        }
        if (data && data.peaks) renderPeaks(data.peaks);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPeaks);
    } else {
        initPeaks();
    }

    window.renderRangePeaks = renderPeaks;
})();
