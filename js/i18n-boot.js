/**
 * Loads i18n stack on any page — one script tag per HTML file.
 */
(function () {
    'use strict';

    var script = document.currentScript || (function () {
        var all = document.querySelectorAll('script[src*="i18n-boot"]');
        return all[all.length - 1];
    })();

    if (!script) return;

    var base = script.src.replace(/js\/i18n-boot\.js(\?.*)?$/, '');

    function isRangePage() {
        return /(?:^|\/)(alborz-(?:gharbi|markazi|shargi)|zagros-(?:shomal|markazi|jonoob)|koohaye-(?:markazi|atashfeshani))\.html$/i.test(location.pathname);
    }

    function loadCss(href) {
        if (document.querySelector('link[href*="i18n.css"]')) return;
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = href;
        document.head.appendChild(l);
    }

    function loadJs(src, cb) {
        if (document.querySelector('script[src="' + src + '"]')) {
            if (cb) cb();
            return;
        }
        var s = document.createElement('script');
        s.src = src;
        s.onload = function () { if (cb) cb(); };
        s.onerror = function () { if (cb) cb(); };
        document.body.appendChild(s);
    }

    function finish() {
        document.dispatchEvent(new CustomEvent('3tiq:i18nready'));
    }

    loadCss(base + 'css/i18n.css');

    loadJs(base + 'js/i18n.js', function () {
        loadJs(base + 'js/content-en.js', function () {
            loadJs(base + 'js/site-config.js', function () {
            loadJs(base + 'js/footer-snippet.js', function () {
            loadJs(base + 'js/site-chrome.js', function () {
                if (isRangePage()) {
                    loadJs(base + 'js/range-i18n.js', finish);
                } else if (/\/peaks\//.test(location.pathname)) {
                    loadJs(base + 'js/peak-content.js', finish);
                } else if (document.body.classList.contains('ph-page')) {
                    loadJs(base + 'js/panahgah-i18n.js', finish);
                } else if (/\/blog\//.test(location.pathname) || /\/blog\.html$/i.test(location.pathname) || /\/blog-damavand-guide\.html$/i.test(location.pathname)) {
                    loadJs(base + 'js/blog-i18n.js', finish);
                } else {
                    finish();
                }
            });
            });
            });
        });
    });
})();
