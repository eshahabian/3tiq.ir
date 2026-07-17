/**
 * Inkling-style scroll reveals — fade-up, stagger, counters, header elevation.
 * Respects prefers-reduced-motion.
 */
(function (global) {
    'use strict';

    var STAGGER_MS = 85;
    var observer = null;
    var counterObserver = null;
    var reduced = false;

    function prefersReduced() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function markReveal(el, variant, delayMs) {
        if (!el || el.classList.contains('reveal') || el.closest('.hero-map, .post-hero, .blog-hero, .ph-hero, .cl-hero, .mtn-hero, .about-hero')) {
            return;
        }
        el.classList.add('reveal', variant || 'reveal-up');
        if (delayMs) el.style.setProperty('--reveal-delay', delayMs + 'ms');
    }

    function markGroup(group) {
        if (!group || group.dataset.revealMarked === '1') return;
        group.dataset.revealMarked = '1';
        var i = 0;
        Array.prototype.forEach.call(group.children, function (child) {
            if (child.hidden) return;
            if (/loading|empty|error/i.test(child.className)) return;
            markReveal(child, child.classList.contains('blog-card') ? 'reveal-scale' : 'reveal-up', i * STAGGER_MS);
            i += 1;
        });
    }

    function autoMark() {
        document.querySelectorAll('.section-title, .section-subtitle, .post-content > h2').forEach(function (el) {
            markReveal(el, 'reveal-up');
        });

        document.querySelectorAll(
            '.services-grid, .peaks-grid, .shelter-cards-grid, .blog-grid, ' +
            '.climbing-cards-grid, .about-stats, .about-grid, .guides-grid, ' +
            '.ph-grid, .page-body main .section-card, .post-layout article'
        ).forEach(markGroup);

        document.querySelectorAll('.about-text, .about-gallery, .about-card, .sidebar-card').forEach(function (el, i) {
            markReveal(el, 'reveal-up', i * 100);
        });

        document.querySelectorAll('.info-box, .peak-card-mini, .checklist-item').forEach(function (el, i) {
            markReveal(el, 'reveal-up', (i % 4) * 60);
        });
    }

    function observeReveals() {
        if (!observer) {
            observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
        }

        document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
            observer.observe(el);
        });
    }

    function animateCounter(counter) {
        if (counter.dataset.counted === '1') return;
        counter.dataset.counted = '1';
        var target = +counter.getAttribute('data-target');
        var suffix = counter.getAttribute('data-suffix') || '';
        var duration = 1600;
        var start = performance.now();

        function update(now) {
            var progress = Math.min((now - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 4);
            counter.textContent = Math.floor(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(update);
            else counter.textContent = target + suffix;
        }

        counter.textContent = '0' + suffix;
        requestAnimationFrame(update);
    }

    function initCounters() {
        if (!counterObserver) {
            counterObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.4 });
        }

        document.querySelectorAll('.stat-number[data-target]:not([data-counted])').forEach(function (el) {
            if (el.closest('.hero-map-content')) return;
            counterObserver.observe(el);
        });
    }

    function initHeaderScroll() {
        var header = document.querySelector('.header');
        if (!header || header.dataset.scrollFx === '1') return;
        header.dataset.scrollFx = '1';
        var onScroll = function () {
            header.classList.toggle('header--elevated', window.scrollY > 20);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    function watchDynamicGrids() {
        ['peaksGrid', 'shelterCardsGrid', 'climbingCardsGrid', 'guidesGrid', 'phGrid', 'blogGrid'].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el || el.dataset.revealWatch === '1') return;
            el.dataset.revealWatch = '1';
            new MutationObserver(function () {
                markGroup(el);
                observeReveals();
                initCounters();
            }).observe(el, { childList: true });
        });
    }

    function refresh() {
        if (reduced) return;
        autoMark();
        observeReveals();
        initCounters();
    }

    function init() {
        reduced = prefersReduced();
        if (reduced) {
            document.documentElement.classList.add('reduced-motion');
            return;
        }
        autoMark();
        observeReveals();
        initCounters();
        initHeaderScroll();
        watchDynamicGrids();

        document.addEventListener('3tiq:languagechange', refresh);
        window.addEventListener('load', refresh);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    global.ScrollAnimations = { refresh: refresh, init: init };
})(typeof window !== 'undefined' ? window : this);
