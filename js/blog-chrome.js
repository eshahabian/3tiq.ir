/**
 * Blog pages: footer + i18n stack.
 */
(function () {
    'use strict';

    var bp = /\/blog\//.test(location.pathname) ? '../' : '';

    function loadCss() {
        if (document.querySelector('link[href*="i18n.css"]')) return;
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = bp + 'css/i18n.css';
        document.head.appendChild(l);
    }

    function run() {
        loadCss();
        if (window.FooterSnippet) FooterSnippet.inject();
        else if (window.SiteConfig && SiteConfig.applyFooter) SiteConfig.applyFooter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
