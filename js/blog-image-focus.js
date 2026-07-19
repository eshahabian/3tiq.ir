/**
 * Per-post object-position for blog heroes and cards (keep climber heads in frame).
 */
(function (global) {
    'use strict';

    var FOCUS = null;

    function bp() {
        return /\/blog\//.test(location.pathname) ? '../' : '';
    }

    function idFromSrc(src) {
        if (!src) return null;
        var name = src.split('/').pop().replace(/\.(png|jpe?g|webp)$/i, '');
        var map = {
            'damavand-guide': 'damavand-guide',
            'tochal': 'tochal-guide',
            'asmankooh': 'weather-check'
        };
        if (map[name]) return map[name];
        if (name.indexOf('blog-') === 0) name = name.slice(5);
        return name;
    }

    function focusFor(id, kind) {
        if (!id || !FOCUS || !FOCUS[id]) return null;
        var entry = FOCUS[id];
        return entry[kind] || entry.hero || entry.card || null;
    }

    function apply(el, pos) {
        if (el && pos) el.style.objectPosition = pos;
    }

    function applyAll() {
        var pageId = document.body && document.body.getAttribute('data-blog-id');
        if (pageId) {
            document.querySelectorAll('.post-hero-img').forEach(function (img) {
                apply(img, focusFor(pageId, 'hero'));
            });
        }

        document.querySelectorAll('.blog-card[data-blog-id]').forEach(function (card) {
            var id = card.getAttribute('data-blog-id');
            var img = card.querySelector('.blog-card-img img');
            apply(img, focusFor(id, 'card'));
        });

        document.querySelectorAll('.related-thumb').forEach(function (img) {
            var id = idFromSrc(img.getAttribute('src') || img.src);
            apply(img, focusFor(id, 'thumb'));
        });
    }

    function load() {
        return fetch(bp() + 'data/blog-image-focus.json')
            .then(function (r) { return r.ok ? r.json() : {}; })
            .catch(function () { return {}; })
            .then(function (data) {
                FOCUS = data;
                applyAll();
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', load);
    } else {
        load();
    }

    global.BlogImageFocus = { reload: load };
})(typeof window !== 'undefined' ? window : this);
