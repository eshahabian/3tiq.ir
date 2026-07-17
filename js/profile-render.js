(function (global) {
    'use strict';

    var profile = null;

    function bp() {
        if (/\/peaks\//.test(location.pathname) || /\/blog\//.test(location.pathname)) return '../';
        return '';
    }

    function isEn() {
        return global.I18n && I18n.isEn();
    }

    function i18n(key, fallback) {
        if (global.I18n && typeof I18n.t === 'function') {
            var v = I18n.t(key);
            if (v && v !== key) return v;
        }
        return fallback || key;
    }

    function t(fa, en) {
        return isEn() ? (en || fa) : fa;
    }

    function esc(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function contactHtml(prefix) {
        prefix = prefix || bp();
        var cfg = global.SiteConfig || {};
        return (
            '<div class="resume-contact-row">' +
            '<a href="tel:' + (cfg.phoneIntl || '+989302323969') + '" class="resume-contact-chip">📞 ۰۹۳۰۲۳۲۳۹۶۹</a>' +
            '<a href="mailto:' + (cfg.email || 'eshahabian@mail.ir') + '" class="resume-contact-chip">✉️ ' + esc(cfg.emailDisplay || 'eshahabian@mail.ir') + '</a>' +
            '<a href="' + (cfg.instagram && cfg.instagram.url ? cfg.instagram.url : 'https://instagram.com/3tiq.ir') + '" target="_blank" rel="noopener" class="resume-contact-chip">📷 ' + esc((cfg.instagram && cfg.instagram.handle) || '@3tiq.ir') + '</a>' +
            '<a href="' + prefix + 'blog.html" class="resume-contact-chip">📝 وبلاگ</a>' +
            '</div>'
        );
    }

    function skillTags(items) {
        return items.map(function (item) {
            return '<span class="resume-tag">' + esc(item) + '</span>';
        }).join('');
    }

    function renderFull(container) {
        if (!profile || !container) return;

        var html =
            '<div class="resume-hero-card">' +
            '<div class="resume-avatar" aria-hidden="true">⛰</div>' +
            '<div class="resume-hero-text">' +
            '<h1 class="resume-name">' + esc(t(profile.name, profile.nameEn)) + '</h1>' +
            '<p class="resume-title">' + esc(t(profile.title, profile.titleEn)) + '</p>' +
            '<p class="resume-location">📍 ' + esc(t(profile.location, profile.locationEn)) + '</p>' +
            contactHtml('') +
            '</div></div>' +
            '<p class="resume-bio">' + esc(t(profile.bio, profile.bioEn)) + '</p>';

        if (profile.highlights && profile.highlights.length) {
            html += '<div class="resume-highlights">';
            profile.highlights.forEach(function (h) {
                html += '<div class="resume-highlight"><span class="resume-highlight-val">' + esc(h.value) + '</span><span class="resume-highlight-lbl">' + esc(t(h.label, h.labelEn)) + '</span></div>';
            });
            html += '</div>';
        }

        html += '<div class="resume-grid">';

        html += '<section class="resume-block" id="education"><h2 class="resume-block-title">🎓 ' + esc(i18n('resume.education', 'تحصیلات')) + '</h2><div class="resume-timeline">';
        (profile.education || []).forEach(function (edu) {
            html +=
                '<article class="resume-timeline-item">' +
                '<div class="resume-timeline-head"><strong>' + esc(t(edu.degree, edu.degreeEn)) + '</strong><span>' + esc(edu.years || '') + '</span></div>' +
                '<div class="resume-timeline-org">' + esc(t(edu.school, edu.schoolEn)) + '</div>' +
                (edu.detail ? '<p class="resume-timeline-desc">' + esc(edu.detail) + '</p>' : '') +
                '</article>';
        });
        html += '</div></section>';

        html += '<section class="resume-block" id="skills"><h2 class="resume-block-title">🛠 ' + esc(i18n('resume.skills', 'مهارت‌ها')) + '</h2>';
        (profile.skills || []).forEach(function (group) {
            html +=
                '<div class="resume-skill-group">' +
                '<h3>' + esc(t(group.category, group.categoryEn)) + '</h3>' +
                '<div class="resume-tags">' + skillTags(group.items) + '</div></div>';
        });
        html += '</section>';

        html += '<section class="resume-block resume-block--wide" id="experience"><h2 class="resume-block-title">💼 ' + esc(i18n('resume.experience', 'تجربه و فعالیت')) + '</h2><div class="resume-timeline">';
        (profile.experience || []).forEach(function (job) {
            html +=
                '<article class="resume-timeline-item">' +
                '<div class="resume-timeline-head"><strong>' + esc(t(job.role, job.roleEn)) + '</strong><span>' + esc(t(job.period, job.periodEn)) + '</span></div>' +
                '<div class="resume-timeline-org">' + esc(job.org) + '</div>' +
                '<ul class="resume-bullets">' +
                (t(job.bullets, job.bulletsEn) || []).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') +
                '</ul></article>';
        });
        html += '</div></section>';

        html += '</div>';

        html +=
            '<section class="resume-cta-block" id="contact">' +
            '<h2>' + esc(i18n('resume.contactTitle', 'ارتباط')) + '</h2>' +
            '<p>' + esc(i18n('resume.contactText', 'پیشنهاد همکاری، اصلاح محتوای کوهنوردی یا سؤال فنی — خوشحال می‌شوم بشنوم.')) + '</p>' +
            contactHtml('') +
            '</section>';

        container.innerHTML = html;
    }

    function renderTeaser(container) {
        if (!profile || !container) return;

        container.innerHTML =
            '<div class="container">' +
            '<div class="resume-teaser-inner">' +
            '<div class="resume-teaser-copy">' +
            '<span class="resume-teaser-badge">' + esc(i18n('resume.badge', 'درباره من')) + '</span>' +
            '<h2 class="section-title" id="resumeTeaserTitle">' + esc(t(profile.name, profile.nameEn)) + '</h2>' +
            '<p class="resume-teaser-title">' + esc(t(profile.title, profile.titleEn)) + '</p>' +
            '<p class="resume-teaser-bio">' + esc(t(profile.bio, profile.bioEn)).slice(0, 220) + '…</p>' +
            contactHtml('') +
            '<a href="' + bp() + 'about.html" class="btn btn-primary resume-teaser-btn">' + esc(i18n('resume.fullLink', 'رزومه کامل و سوابق ←')) + '</a>' +
            '</div>' +
            '<div class="resume-teaser-card">' +
            '<div class="resume-avatar resume-avatar--lg" aria-hidden="true">⛰</div>' +
            '<ul class="resume-teaser-stats">' +
            (profile.highlights || []).map(function (h) {
                return '<li><strong>' + esc(h.value) + '</strong><span>' + esc(t(h.label, h.labelEn)) + '</span></li>';
            }).join('') +
            '</ul></div></div></div>';
    }

    function load() {
        return fetch(bp() + 'data/profile.json')
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
    }

    function init() {
        var full = document.getElementById('resumeFull');
        var teaser = document.getElementById('resumeTeaser');
        if (!full && !teaser) return;

        load().then(function (data) {
            profile = data;
            if (!profile) return;
            if (full) renderFull(full);
            if (teaser) renderTeaser(teaser);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('3tiq:languagechange', init);

    global.ProfileRender = { init: init, reload: init };
})(typeof window !== 'undefined' ? window : this);
