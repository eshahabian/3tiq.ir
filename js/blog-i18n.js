/**
 * Blog list + post pages — FA/EN content swap.
 */
(function (global) {
    'use strict';

    var META = null;
    var CONTENT_CACHE = {};

    function bp() {
        return /\/blog\//.test(location.pathname) ? '../' : '';
    }

    function postId() {
        var bodyId = document.body && document.body.getAttribute('data-blog-id');
        if (bodyId) return bodyId;
        var file = location.pathname.split('/').pop() || '';
        if (file === 'blog-damavand-guide.html') return 'damavand-guide';
        if (file.indexOf('blog-') === 0) return file.replace('.html', '').replace('blog-', '');
        return null;
    }

    function isEn() {
        return global.I18n && I18n.isEn();
    }

    function tr(k, fb) {
        return global.I18n ? I18n.t(k) : fb;
    }

    function loadMeta() {
        if (META) return Promise.resolve(META);
        return fetch(bp() + 'data/blog-en.json')
            .then(function (r) { return r.json(); })
            .then(function (d) { META = d; return d; })
            .catch(function () { META = { cards: {}, posts: {} }; return META; });
    }

    function loadContent(id) {
        if (CONTENT_CACHE[id]) return Promise.resolve(CONTENT_CACHE[id]);
        var info = META && META.posts[id];
        if (!info || !info.contentFile) return Promise.resolve('');
        return fetch(bp() + 'data/blog-en/' + info.contentFile)
            .then(function (r) { return r.text(); })
            .then(function (html) { CONTENT_CACHE[id] = html; return html; })
            .catch(function () { return ''; });
    }

    function capture(el, key) {
        if (!el) return;
        if (!el.dataset[key]) el.dataset[key] = el.innerHTML.trim();
    }

    function captureText(el, key) {
        if (!el) return;
        if (!el.dataset[key]) el.dataset[key] = el.textContent.trim();
    }

    function hrefToId(href) {
        if (!href) return null;
        if (href.indexOf('damavand') >= 0) return 'damavand-guide';
        var base = href.split('/').pop().replace('.html', '').replace('blog-', '');
        return base || null;
    }

    function applyRelatedPosts() {
        if (!META) return;
        document.querySelectorAll('.related-post').forEach(function (link) {
            var titleEl = link.querySelector('.related-post-title');
            var dateEl = link.querySelector('.related-post-date');
            captureText(titleEl, 'faTitle');
            if (dateEl) captureText(dateEl, 'faDate');
            var id = hrefToId(link.getAttribute('href'));
            var card = id && META.cards[id];
            if (isEn() && card) {
                if (titleEl && card.title) titleEl.textContent = card.title;
                if (dateEl && card.date) dateEl.textContent = card.date;
            } else {
                if (titleEl && titleEl.dataset.faTitle) titleEl.textContent = titleEl.dataset.faTitle;
                if (dateEl && dateEl.dataset.faDate) dateEl.textContent = dateEl.dataset.faDate;
            }
        });
    }

    function applyBlogList() {
        if (!META || !document.querySelector('.blog-grid')) return;
        document.querySelectorAll('.blog-card[data-blog-id]').forEach(function (card) {
            var id = card.getAttribute('data-blog-id');
            var en = META.cards[id];
            var title = card.querySelector('.blog-card-title');
            var excerpt = card.querySelector('.blog-card-excerpt');
            var dateEl = card.querySelector('.blog-card-meta span');
            captureText(title, 'faTitle');
            captureText(excerpt, 'faExcerpt');
            if (dateEl) captureText(dateEl, 'faDate');
            if (isEn() && en) {
                if (title && en.title) title.textContent = en.title;
                if (excerpt && en.excerpt) excerpt.textContent = en.excerpt;
                if (dateEl && en.date) dateEl.textContent = '📅 ' + en.date;
            } else {
                if (title) title.textContent = title.dataset.faTitle;
                if (excerpt) excerpt.textContent = excerpt.dataset.faExcerpt;
                if (dateEl && dateEl.dataset.faDate) dateEl.textContent = dateEl.dataset.faDate;
            }
        });
    }

    function applyPost(id) {
        if (!META || !id) return;
        var info = META.posts[id];
        if (!info) return;

        var hero = document.querySelector('.post-hero h1');
        var badge = document.querySelector('.post-cat-badge');
        var breadcrumb = document.querySelector('.post-breadcrumb');
        var content = document.querySelector('.post-content');
        var tocBox = document.querySelector('.sidebar-toc');
        var tocTitle = document.querySelector('.sidebar-card h3');
        var relatedTitle = document.querySelectorAll('.sidebar-card h3')[1];

        capture(hero, 'faHtml');
        captureText(badge, 'faText');
        capture(content, 'faHtml');

        if (isEn()) {
            if (hero && info.heroTitle) hero.innerHTML = info.heroTitle;
            if (badge && info.categoryBadge) badge.textContent = info.categoryBadge;
            if (breadcrumb) {
                breadcrumb.innerHTML = '<a href="' + bp() + 'index.html">' + tr('hero.brand', '3Tiq') + '</a> &larr; <a href="' + bp() + 'blog.html">' + tr('nav.blog', 'Blog') + '</a>' +
                    (info.breadcrumbCat ? ' &larr; ' + info.breadcrumbCat : '');
            }
            document.querySelectorAll('.post-meta span').forEach(function (span, i) {
                captureText(span, 'faText');
                if (i === 0 && info.date) span.textContent = '📅 ' + info.date;
                if (span.textContent.indexOf('⏱') >= 0 && info.readMin) {
                    span.textContent = '⏱ ' + info.readMin + ' ' + tr('blog.readTime', 'min read');
                }
                if (span.textContent.indexOf('✍') >= 0) {
                    span.textContent = '✍️ ' + tr('blog.post.author', '3Tiq Team');
                }
            });
            if (tocTitle) tocTitle.textContent = tr('blog.post.toc', 'Table of contents');
            if (relatedTitle) relatedTitle.textContent = tr('blog.post.related', 'Related articles');
            if (tocBox && info.toc) {
                if (!tocBox.dataset.faHtml) tocBox.dataset.faHtml = tocBox.innerHTML;
                tocBox.innerHTML = info.toc.map(function (t) {
                    return '<a href="' + t.href + '">' + t.label + '</a>';
                }).join('');
            }
            loadContent(id).then(function (html) {
                if (html && content) content.innerHTML = html;
            });
            if (info.title) document.title = info.title + ' | ' + tr('hero.brand', '3Tiq');
            if (info.description) {
                var desc = document.querySelector('meta[name="description"]');
                if (desc) desc.setAttribute('content', info.description);
            }
            applyRelatedPosts();
        } else {
            if (hero && hero.dataset.faHtml) hero.innerHTML = hero.dataset.faHtml;
            if (badge && badge.dataset.faText) badge.textContent = badge.dataset.faText;
            if (content && content.dataset.faHtml) content.innerHTML = content.dataset.faHtml;
            if (tocBox && tocBox.dataset.faHtml) tocBox.innerHTML = tocBox.dataset.faHtml;
            applyRelatedPosts();
        }
    }

    function apply() {
        loadMeta().then(function () {
            var id = postId();
            if (id) applyPost(id);
            else applyRelatedPosts();
            applyBlogList();
        });
    }

    function init() {
        apply();
        document.addEventListener('3tiq:languagechange', apply);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    global.BlogI18n = { apply: apply };
})(window);
