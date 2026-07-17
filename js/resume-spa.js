/**
 * Sergio-style resume SPA — panel transitions, typewriter, skill bars.
 */
(function (global) {
    'use strict';

    var activePanel = 'home';
    var wheelLocked = false;
    var panelOrder = ['home', 'about', 'resume', 'skills', 'contact'];
    var reduced = false;

    function prefersReduced() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function panelIndex(id) {
        return panelOrder.indexOf(id);
    }

    function nextPanelId(delta) {
        var idx = panelIndex(activePanel);
        if (idx < 0) return null;
        var next = idx + delta;
        if (next < 0 || next >= panelOrder.length) return null;
        return panelOrder[next];
    }

    function qs(sel, root) {
        return (root || document).querySelector(sel);
    }

    function qsa(sel, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(sel));
    }

    function setActiveNav(id) {
        qsa('.sv-nav-link').forEach(function (link) {
            var on = link.getAttribute('data-panel') === id;
            link.classList.toggle('is-active', on);
            if (on) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    }

    function animateSkillBars(panel) {
        if (!panel) return;
        qsa('.sv-skill-fill', panel).forEach(function (fill) {
            var w = fill.getAttribute('data-width') || '0';
            fill.style.width = '0%';
            requestAnimationFrame(function () {
                fill.style.width = w + '%';
            });
        });
    }

    function switchPanel(id, pushHash) {
        if (!id || id === activePanel) return;
        var current = qs('.sv-panel.is-active');
        var next = qs('.sv-panel[data-panel="' + id + '"]');
        if (!next) return;

        if (pushHash !== false) {
            if (history.replaceState) history.replaceState(null, '', '#' + id);
            else location.hash = id;
        }

        setActiveNav(id);
        closeSidebar();

        if (next) next.scrollTop = 0;

        if (reduced || !current) {
            if (current) current.classList.remove('is-active');
            next.classList.add('is-active');
            activePanel = id;
            if (id === 'skills') animateSkillBars(next);
            return;
        }

        current.classList.add('is-leaving');
        current.classList.remove('is-active');

        next.classList.add('is-entering');
        next.classList.add('is-active');

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                next.classList.remove('is-entering');
            });
        });

        setTimeout(function () {
            current.classList.remove('is-leaving');
            activePanel = id;
            if (id === 'skills') animateSkillBars(next);
        }, 420);
    }

    function bindWheelNav() {
        var main = qs('.sv-main');
        if (!main || main.dataset.wheelBound === '1') return;
        main.dataset.wheelBound = '1';

        main.addEventListener('wheel', function (e) {
            if (reduced) return;

            var panel = qs('.sv-panel.is-active');
            if (!panel) return;

            var canScroll = panel.scrollHeight > panel.clientHeight + 4;
            var atTop = panel.scrollTop <= 0;
            var atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 4;

            if (e.deltaY > 0 && canScroll && !atBottom) return;
            if (e.deltaY < 0 && canScroll && !atTop) return;

            var target = nextPanelId(e.deltaY > 0 ? 1 : -1);
            if (!target || wheelLocked) return;

            e.preventDefault();
            wheelLocked = true;
            switchPanel(target);
            setTimeout(function () { wheelLocked = false; }, 850);
        }, { passive: false });
    }

    function panelFromHash() {
        var h = (location.hash || '').replace(/^#/, '');
        return h && qs('.sv-panel[data-panel="' + h + '"]') ? h : 'home';
    }

    function bindNav() {
        qsa('.sv-nav-link').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                switchPanel(link.getAttribute('data-panel'));
            });
        });

        qsa('[data-goto]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                switchPanel(btn.getAttribute('data-goto'));
            });
        });

        window.addEventListener('hashchange', function () {
            switchPanel(panelFromHash(), false);
        });
    }

    function bindMobile() {
        var toggle = qs('#svMenuToggle');
        var overlay = qs('#svOverlay');
        if (!toggle) return;

        toggle.addEventListener('click', function () {
            document.body.classList.toggle('sv-sidebar-open');
            if (overlay) overlay.hidden = !document.body.classList.contains('sv-sidebar-open');
        });

        if (overlay) {
            overlay.addEventListener('click', closeSidebar);
        }
    }

    function closeSidebar() {
        document.body.classList.remove('sv-sidebar-open');
        var overlay = qs('#svOverlay');
        if (overlay) overlay.hidden = true;
    }

    function startTypewriter() { /* disabled — home uses static tagline */ }

    function init() {
        var app = qs('#resumeApp');
        if (!app || !app.querySelector('.sv-sidebar')) return;

        reduced = prefersReduced();
        bindNav();
        bindMobile();
        bindWheelNav();

        var start = panelFromHash();
        qsa('.sv-panel').forEach(function (p) {
            p.classList.toggle('is-active', p.getAttribute('data-panel') === start);
        });
        activePanel = start;
        setActiveNav(start);

        if (start === 'skills') animateSkillBars(qs('.sv-panel.is-active'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('profile:rendered', init);

    global.ResumeSpa = { init: init, switchPanel: switchPanel };
})(typeof window !== 'undefined' ? window : this);
