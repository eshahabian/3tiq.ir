/**
 * Blog pages: inject standard footer + load i18n if missing.
 */
(function () {
    'use strict';

    function run() {
        if (window.FooterSnippet) FooterSnippet.inject();
        else if (window.SiteConfig && SiteConfig.applyFooter) SiteConfig.applyFooter();

        if (!document.querySelector('script[src*="i18n-boot"]') && document.querySelector('.footer')) {
            var bp = /\/blog\//.test(location.pathname) ? '../' : '';
            var s = document.createElement('script');
            s.src = bp + 'js/i18n-boot.js';
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
