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

    function initials(name) {
        if (!name) return '؟';
        var parts = String(name).trim().split(/\s+/);
        if (parts.length >= 2) return parts[0].charAt(0) + parts[1].charAt(0);
        return parts[0].charAt(0) || '؟';
    }

    function avatarHtml(sizeClass) {
        var name = t(profile.name, profile.nameEn);
        var alt = profile.avatarAlt || name;
        if (profile.avatar) {
            return (
                '<div class="sv-avatar sv-avatar--photo' + (sizeClass ? ' ' + sizeClass : '') + '">' +
                '<img src="' + bp() + esc(profile.avatar) + '" alt="' + esc(alt) + '" width="110" height="110" loading="eager" decoding="async">' +
                '</div>'
            );
        }
        return '<div class="sv-avatar' + (sizeClass ? ' ' + sizeClass : '') + '" aria-hidden="true">' + esc(initials(name)) + '</div>';
    }

    function getPhones() {
        if (profile && profile.phones && profile.phones.length) return profile.phones;
        return [{ number: '09302323986', display: '09302323986', intl: '+989302323986' }];
    }

    function emailAddress() {
        return (profile && profile.email) ? profile.email : 'eshahabian@gmail.com';
    }

    function emailLabel() {
        return (profile && profile.emailDisplay) ? profile.emailDisplay : emailAddress();
    }

    function phonesLinksHtml(separator) {
        return getPhones().map(function (p) {
            return '<a href="tel:' + esc(p.intl) + '">' + esc(p.display) + '</a>';
        }).join(separator || ' · ');
    }

    function contactHtml(compact) {
        var email = emailAddress();
        var label = emailLabel();
        var phones = getPhones().map(function (p) {
            return '<a href="tel:' + esc(p.intl) + '" class="resume-contact-chip">📞 ' + esc(p.display) + '</a>';
        }).join('');
        if (compact) {
            return (
                '<a href="mailto:' + esc(email) + '" class="resume-contact-chip">✉️ ' + esc(label) + '</a>' +
                phones
            );
        }
        return (
            '<div class="resume-contact-row">' +
            phones +
            '<a href="mailto:' + esc(email) + '" class="resume-contact-chip">✉️ ' + esc(label) + '</a>' +
            '</div>'
        );
    }

    function navItem(id, label) {
        return '<li><a href="#' + id + '" class="sv-nav-link" data-panel="' + id + '">' + esc(label) + '</a></li>';
    }

    function timelineEdu(items) {
        return items.map(function (edu) {
            var school = t(edu.school, edu.schoolEn);
            return (
                '<li class="sv-timeline-item">' +
                (edu.years ? '<span class="sv-timeline-date">' + esc(edu.years) + '</span>' : '') +
                '<div class="sv-timeline-body">' +
                '<h4>' + esc(t(edu.degree, edu.degreeEn)) + '</h4>' +
                (school ? '<p class="sv-timeline-org">' + esc(school) + '</p>' : '') +
                (edu.detail ? '<p>' + esc(edu.detail) + '</p>' : '') +
                '</div></li>'
            );
        }).join('');
    }

    function timelineJobs(jobs) {
        return jobs.map(function (job) {
            return (
                '<li class="sv-timeline-item">' +
                '<span class="sv-timeline-date">' + esc(t(job.period, job.periodEn)) + '</span>' +
                '<div class="sv-timeline-body">' +
                '<h4>' + esc(t(job.role, job.roleEn)) + '</h4>' +
                '<p class="sv-timeline-org">' + esc(job.org) + '</p>' +
                '<ul class="sv-bullets">' +
                (t(job.bullets, job.bulletsEn) || []).map(function (b) {
                    return '<li>' + esc(b) + '</li>';
                }).join('') +
                '</ul></div></li>'
            );
        }).join('');
    }

    function summaryHtml(text) {
        return String(text).split(/\n\n+/).map(function (p) {
            return '<p class="sv-text">' + esc(p.trim()) + '</p>';
        }).join('');
    }

    function renderSergio(container) {
        if (!profile || !container) return;

        try {
        var name = t(profile.name, profile.nameEn);
        var title = t(profile.title, profile.titleEn);
        var location = t(profile.location, profile.locationEn);
        var summary = t(profile.summary, profile.summaryEn);
        var homeTagline = t(profile.homeTagline, profile.homeTaglineEn);
        var homeIntro = t(profile.homeIntro, profile.homeIntroEn);
        var email = emailAddress();
        var emailShow = emailLabel();
        var insta = (global.SiteConfig && SiteConfig.instagram) ? SiteConfig.instagram.url : 'https://instagram.com/3tiq.ir';

        var skillBars = (profile.skillBars || []).map(function (s) {
            var levelLabel = t(s.level, s.levelEn) || '';
            return (
                '<div class="sv-skill-row">' +
                '<div class="sv-skill-head"><span>' + esc(s.name) + '</span>' +
                (levelLabel ? '<span class="sv-skill-level">' + esc(levelLabel) + '</span>' : '') +
                '</div>' +
                '<div class="sv-skill-track"><div class="sv-skill-fill" data-width="' + esc(s.width || s.percent || 0) + '" style="width:0"></div></div>' +
                '</div>'
            );
        }).join('');

        var skillGroups = (profile.skills || []).map(function (g) {
            return (
                '<div class="sv-skill-group">' +
                '<h4>' + esc(t(g.category, g.categoryEn)) + '</h4>' +
                '<div class="sv-tags">' +
                g.items.map(function (item) { return '<span class="sv-tag">' + esc(item) + '</span>'; }).join('') +
                '</div></div>'
            );
        }).join('');

        var certs = (profile.certificates || []).map(function (c) {
            var label = c.name + (c.year ? ' (' + c.year + ')' : '');
            return '<span class="sv-tag sv-tag--cert">' + esc(label) + '</span>';
        }).join('');

        var interests = t(profile.interests, profile.interestsEn) || [];
        var interestTags = interests.map(function (i) { return '<span class="sv-tag sv-tag--soft">' + esc(i) + '</span>'; }).join('');

        var highlights = (profile.highlights || []).map(function (h) {
            return (
                '<div class="sv-stat">' +
                '<strong class="sv-stat-val">' + esc(h.value) + '</strong>' +
                '<span class="sv-stat-lbl">' + esc(t(h.label, h.labelEn)) + '</span></div>'
            );
        }).join('');

        var focusAreas = t(profile.focusAreas, profile.focusAreasEn) || [];
        var focusHtml = focusAreas.map(function (f) {
            return (
                '<div class="sv-focus-card">' +
                '<span class="sv-focus-icon" aria-hidden="true">' + esc(f.icon || '') + '</span>' +
                '<strong>' + esc(f.title) + '</strong>' +
                '<p>' + esc(f.desc) + '</p></div>'
            );
        }).join('');

        var langs = (profile.languages || []).map(function (lang) {
            return '<li><strong>' + esc(t(lang.name, lang.nameEn)) + '</strong> — ' + esc(t(lang.level, lang.levelEn)) + '</li>';
        }).join('');

        container.innerHTML =
            '<aside class="sv-sidebar" aria-label="منوی رزومه">' +
            '<div class="sv-profile">' +
            avatarHtml('') +
            '<h2 class="sv-sidebar-name">' + esc(name) + '</h2>' +
            '<p class="sv-sidebar-title">' + esc(title) + '</p>' +
            '</div>' +
            '<nav class="sv-nav"><ul>' +
            navItem('home', i18n('resume.nav.home', 'خانه')) +
            navItem('about', i18n('resume.nav.about', 'درباره من')) +
            navItem('resume', i18n('resume.nav.resume', 'رزومه')) +
            navItem('skills', i18n('resume.nav.skills', 'مهارت‌ها')) +
            navItem('contact', i18n('resume.nav.contact', 'تماس')) +
            '</ul></nav>' +
            '<div class="sv-sidebar-social">' +
            '<a href="mailto:' + esc(email) + '" aria-label="' + esc(emailShow) + '" title="' + esc(emailShow) + '">✉</a>' +
            getPhones().map(function (p, i) {
                return '<a href="tel:' + esc(p.intl) + '" aria-label="تلفن ' + (i + 1) + '" title="' + esc(p.display) + '">📞</a>';
            }).join('') +
            '<a href="' + esc(insta) + '" target="_blank" rel="noopener" aria-label="اینستاگرام">📷</a>' +
            '</div>' +
            '<a href="index.html" class="sv-back-link">← بازگشت به سه تیغ</a>' +
            '</aside>' +

            '<main class="sv-main" id="svMain">' +
            '<button type="button" class="sv-menu-toggle" id="svMenuToggle" aria-label="منو">☰</button>' +
            '<div class="sv-panels">' +

            /* HOME */
            '<section class="sv-panel is-active" data-panel="home">' +
            '<div class="sv-panel-inner sv-home">' +
            '<p class="sv-eyebrow">' + esc(i18n('resume.welcome', 'سلام، خوش آمدید')) + '</p>' +
            '<h1 class="sv-home-name">' + esc(name) + '</h1>' +
            '<p class="sv-home-role">' + esc(title) + '</p>' +
            '<p class="sv-home-tagline">' + esc(homeTagline) + '</p>' +
            '<p class="sv-home-intro">' + esc(homeIntro) + '</p>' +
            '<div class="sv-focus-row">' + focusHtml + '</div>' +
            '<div class="sv-home-actions">' +
            '<button type="button" class="sv-btn sv-btn--primary" data-goto="about">' + esc(i18n('resume.viewAbout', 'درباره من')) + '</button>' +
            '<button type="button" class="sv-btn sv-btn--ghost" data-goto="contact">' + esc(i18n('resume.contactBtn', 'تماس با من')) + '</button>' +
            '</div></div></section>' +

            /* ABOUT */
            '<section class="sv-panel" data-panel="about">' +
            '<div class="sv-panel-inner">' +
            '<h2 class="sv-section-title">' + esc(i18n('resume.nav.about', 'درباره من')) + '</h2>' +
            '<p class="sv-section-lead">' + esc(title) + ' · ' + esc(location) + '</p>' +
            '<div class="sv-stats sv-stats--about">' + highlights + '</div>' +
            '<div class="sv-summary">' +
            '<h3 class="sv-block-title">' + esc(i18n('resume.summaryTitle', 'خلاصه رزومه')) + '</h3>' +
            summaryHtml(summary) +
            '</div>' +
            (interestTags ? (
                '<div class="sv-block">' +
                '<h3 class="sv-block-title">' + esc(i18n('resume.interests', 'علایق')) + '</h3>' +
                '<div class="sv-tags">' + interestTags + '</div></div>'
            ) : '') +
            (langs ? (
                '<div class="sv-block">' +
                '<h3 class="sv-block-title">' + esc(i18n('resume.languages', 'زبان‌ها')) + '</h3>' +
                '<ul class="sv-lang-list">' + langs + '</ul></div>'
            ) : '') +
            '</div></section>' +

            /* RESUME */
            '<section class="sv-panel" data-panel="resume">' +
            '<div class="sv-panel-inner">' +
            '<h2 class="sv-section-title">' + esc(i18n('resume.education', 'تحصیلات')) + '</h2>' +
            '<ul class="sv-timeline">' + timelineEdu(profile.education || []) + '</ul>' +
            '<h2 class="sv-section-title sv-section-title--spaced">' + esc(i18n('resume.experience', 'سوابق کاری')) + '</h2>' +
            '<ul class="sv-timeline sv-timeline--jobs">' + timelineJobs(profile.experience || []) + '</ul>' +
            (certs ? (
                '<h2 class="sv-section-title sv-section-title--spaced">' + esc(i18n('resume.certificates', 'گواهینامه‌ها')) + '</h2>' +
                '<div class="sv-tags">' + certs + '</div>'
            ) : '') +
            '</div></section>' +

            /* SKILLS */
            '<section class="sv-panel" data-panel="skills">' +
            '<div class="sv-panel-inner">' +
            '<h2 class="sv-section-title">' + esc(i18n('resume.skills', 'مهارت‌ها')) + '</h2>' +
            '<div class="sv-skill-bars">' + skillBars + '</div>' +
            skillGroups +
            '</div></section>' +

            /* CONTACT */
            '<section class="sv-panel" data-panel="contact">' +
            '<div class="sv-panel-inner">' +
            '<h2 class="sv-section-title">' + esc(i18n('resume.contactTitle', 'ارتباط')) + '</h2>' +
            '<p class="sv-text">' + esc(i18n('resume.contactText', 'پیشنهاد همکاری، فرصت شغلی یا سؤال فنی — از طریق ایمیل یا تلفن در تماس باشید.')) + '</p>' +
            '<ul class="sv-contact-list">' +
            '<li><span class="sv-contact-icon">📍</span><div><strong>' + esc(i18n('resume.location', 'موقعیت')) + '</strong><p>' + esc(location) + '</p></div></li>' +
            '<li><span class="sv-contact-icon">✉️</span><div><strong>Email</strong><p><a href="mailto:' + esc(email) + '">' + esc(emailShow) + '</a></p></div></li>' +
            '<li><span class="sv-contact-icon">📞</span><div><strong>' + esc(i18n('resume.phone', 'تلفن')) + '</strong><p class="sv-phone-list">' + phonesLinksHtml('<br>') + '</p></div></li>' +
            '</ul>' +
            '<div class="sv-home-actions">' +
            '<a href="mailto:' + esc(email) + '" class="sv-btn sv-btn--primary">' + esc(i18n('resume.sendEmail', 'ارسال ایمیل')) + '</a>' +
            '</div></div></section>' +

            '</div></main>';

        document.dispatchEvent(new CustomEvent('profile:rendered'));
        } catch (err) {
            container.innerHTML = '<p class="sv-loading">خطا در بارگذاری رزومه. صفحه را رفرش کنید.</p>';
            if (typeof console !== 'undefined') console.error('ProfileRender:', err);
        }
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
            '<p class="resume-teaser-bio">' + esc(t(profile.summary || profile.bio, profile.summaryEn || profile.bioEn)).slice(0, 240) + '…</p>' +
            contactHtml(true) +
            '<a href="' + bp() + 'about.html" class="btn btn-primary resume-teaser-btn">' + esc(i18n('resume.fullLink', 'مشاهده رزومه تعاملی ←')) + '</a>' +
            '</div>' +
            '<div class="resume-teaser-card">' +
            (profile.avatar
                ? '<div class="resume-avatar resume-avatar--lg resume-avatar--photo"><img src="' + bp() + esc(profile.avatar) + '" alt="' + esc(t(profile.name, profile.nameEn)) + '" width="104" height="104" loading="lazy"></div>'
                : '<div class="resume-avatar resume-avatar--lg resume-avatar--initials" aria-hidden="true">' + esc(initials(t(profile.name, profile.nameEn))) + '</div>') +
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
        var app = document.getElementById('resumeApp');
        var teaser = document.getElementById('resumeTeaser');
        if (!app && !teaser) return;

        load().then(function (data) {
            profile = data;
            if (!profile) return;
            if (app) renderSergio(app);
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
