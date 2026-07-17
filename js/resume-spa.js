/**
 * Sergio-style resume SPA — panel transitions, typewriter, skill bars.
 */
(function (global) {
    'use strict';

    var activePanel = 'home';
    var typingTimer = null;
    var reduced = false;

    function prefersReduced() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

        if (reduced || !current) {
            if (current) current.classList.remove('is-active');
            next.classList.add('is-active');
            activePanel = id;
            if (id === 'skills') animateSkillBars(next);
            if (id === 'home') startTypewriter();
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
            if (id === 'home') startTypewriter();
        }, 420);
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

    function startTypewriter() {
        var el = qs('#svTyped');
        if (!el) return;
        var roles = [];
        try {
            roles = JSON.parse(el.getAttribute('data-roles') || '[]');
        } catch (e) { roles = []; }
        if (!roles.length) return;

        if (typingTimer) clearTimeout(typingTimer);

        var roleIdx = 0;
        var charIdx = 0;
        var deleting = false;

        function tick() {
            var word = roles[roleIdx];
            if (!deleting) {
                charIdx += 1;
                el.textContent = word.slice(0, charIdx);
                if (charIdx >= word.length) {
                    deleting = true;
                    typingTimer = setTimeout(tick, 1800);
                    return;
                }
                typingTimer = setTimeout(tick, 70);
            } else {
                charIdx -= 1;
                el.textContent = word.slice(0, charIdx);
                if (charIdx <= 0) {
                    deleting = false;
                    roleIdx = (roleIdx + 1) % roles.length;
                    typingTimer = setTimeout(tick, 400);
                    return;
                }
                typingTimer = setTimeout(tick, 35);
            }
        }

        if (reduced) {
            el.textContent = roles[0];
            return;
        }
        tick();
    }

    function init() {
        var app = qs('#resumeApp');
        if (!app || !app.querySelector('.sv-sidebar')) return;

        reduced = prefersReduced();
        bindNav();
        bindMobile();

        var start = panelFromHash();
        qsa('.sv-panel').forEach(function (p) {
            p.classList.toggle('is-active', p.getAttribute('data-panel') === start);
        });
        activePanel = start;
        setActiveNav(start);

        if (start === 'skills') animateSkillBars(qs('.sv-panel.is-active'));
        if (start === 'home') startTypewriter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('profile:rendered', init);

    global.ResumeSpa = { init: init, switchPanel: switchPanel };
})(typeof window !== 'undefined' ? window : this);
