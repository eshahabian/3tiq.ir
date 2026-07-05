/**
 * Peak page content translation — stats bar, badges, about section.
 */
(function (global) {
    'use strict';

    var STAT_KEYS = {
        'ارتفاع': 'peak.stat.elevation',
        'استان': 'peak.stat.province',
        'سختی': 'peak.stat.difficulty',
        'مدت صعود': 'peak.stat.duration',
        'بهترین فصل': 'peak.stat.season',
        'نوع کوه': 'peak.stat.type'
    };

    function tr(k, fb) {
        return global.I18n ? I18n.t(k) : fb;
    }

    function isEn() {
        return global.I18n && I18n.isEn();
    }

    function pageSlug() {
        var m = location.pathname.match(/\/peaks\/([^/.]+)\.html/i);
        return m ? m[1] : null;
    }

    function captureFa(el) {
        if (el && !el.dataset.faText) el.dataset.faText = el.textContent.trim();
    }

    function applyStatsBar(content, en) {
        document.querySelectorAll('.stats-bar .stat-item').forEach(function (item) {
            var label = item.querySelector('.stat-label');
            var value = item.querySelector('.stat-value');
            var unit = item.querySelector('.stat-unit');
            if (label) {
                captureFa(label);
                var fa = label.dataset.faText;
                if (isEn() && STAT_KEYS[fa]) label.textContent = tr(STAT_KEYS[fa], fa);
                else label.textContent = fa;
            }
            if (value && content) {
                captureFa(value);
                if (isEn()) {
                    if (label && label.dataset.faText === 'ارتفاع' && content.elevation) {
                        value.textContent = content.elevation;
                    } else if (label && label.dataset.faText === 'استان' && en.province) {
                        value.textContent = en.province;
                    } else if (label && label.dataset.faText === 'سختی' && content.difficulty) {
                        value.textContent = content.difficulty;
                    } else if (label && label.dataset.faText === 'مدت صعود' && content.duration) {
                        value.textContent = content.duration;
                    } else if (label && label.dataset.faText === 'بهترین فصل' && content.bestSeason) {
                        value.textContent = content.bestSeason;
                    } else if (label && label.dataset.faText === 'نوع کوه' && content.mountainType) {
                        value.textContent = content.mountainType;
                    }
                } else {
                    value.textContent = value.dataset.faText;
                }
            }
            if (unit) {
                captureFa(unit);
                unit.textContent = isEn() ? tr('peaks.meters', 'm') : unit.dataset.faText;
            }
        });
    }

    function applyBadges(content) {
        document.querySelectorAll('.hero-badges .badge').forEach(function (badge) {
            captureFa(badge);
            if (!isEn() || !content) {
                badge.textContent = badge.dataset.faText;
                return;
            }
            var fa = badge.dataset.faText;
            if (fa.indexOf('⛰') >= 0 && content.elevationBadge) badge.textContent = content.elevationBadge;
            else if (fa.indexOf('🎯') >= 0 && content.difficultyBadge) badge.textContent = content.difficultyBadge;
            else if (fa.indexOf('🗓') >= 0 && content.seasonBadge) badge.textContent = content.seasonBadge;
            else if (fa.indexOf('⏱') >= 0 && content.durationBadge) badge.textContent = content.durationBadge;
        });
    }

    function applyAbout(content) {
        var aboutCard = document.querySelector('.section-card .section-title[data-i18n="peak.about"], .section-title');
        if (!aboutCard) return;
        var card = aboutCard.closest('.section-card');
        if (!card) return;
        var p = card.querySelector('p');
        if (!p) return;
        captureFa(p);
        if (isEn() && content && content.about) p.textContent = content.about;
        else p.textContent = p.dataset.faText;
    }

    function updateTitle(en) {
        if (!global.I18n || !en) return;
        if (!document.__faTitle) document.__faTitle = document.title;
        if (isEn()) document.title = en.name + ' | ' + tr('hero.brand', '3Tiq');
        else document.title = document.__faTitle;
    }

    function applyHeroSubtitle(content) {
        var sub = document.querySelector('.hero-sub, .hero-subtitle');
        if (!sub) return;
        captureFa(sub);
        if (isEn() && content && content.subtitle) sub.textContent = content.subtitle;
        else sub.textContent = sub.dataset.faText;
    }

    function apply() {
        var slug = pageSlug();
        if (!slug) return;

        Promise.all([
            global.ContentEn ? ContentEn.loadPeaksEn() : Promise.resolve(),
            global.PEAKS_CONTENT_EN ? Promise.resolve(global.PEAKS_CONTENT_EN) :
                fetch('../data/peaks-content-en.json').then(function (r) { return r.json(); }).then(function (d) {
                    global.PEAKS_CONTENT_EN = d; return d;
                }).catch(function () { global.PEAKS_CONTENT_EN = {}; return {}; })
        ]).then(function () {
            var en = ContentEn.peakBySlug(slug);
            var content = global.PEAKS_CONTENT_EN[slug];
            applyStatsBar(content, en);
            applyBadges(content);
            applyAbout(content);
            applyHeroSubtitle(content);
            if (en) updateTitle(en);
        });
    }

    document.addEventListener('3tiq:languagechange', apply);
    document.addEventListener('3tiq:i18nready', apply);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', apply);
    } else {
        apply();
    }
})(window);
