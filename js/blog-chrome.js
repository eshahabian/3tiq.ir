/**
 * Blog pages: footer + i18n stack.
 */
(function () {
    'use strict';

    var bp = /\/blog\//.test(location.pathname) ? '../' : '';

    function loadCss() {
        if (!document.querySelector('link[href*="i18n.css"]')) {
            var l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = bp + 'css/i18n.css';
            document.head.appendChild(l);
        }
        if (!document.querySelector('link[href*="site-enhancements.css"]')) {
            var se = document.createElement('link');
            se.rel = 'stylesheet';
            se.href = bp + 'css/site-enhancements.css';
            document.head.appendChild(se);
        }
    }

    function run() {
        loadCss();
        if (window.FooterSnippet) FooterSnippet.inject();
        else if (window.SiteConfig && SiteConfig.applyFooter) SiteConfig.applyFooter();
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !window.ScrollAnimations) {
            var s = document.createElement('script');
            s.src = bp + 'js/scroll-animations.js';
            s.defer = true;
            document.body.appendChild(s);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
