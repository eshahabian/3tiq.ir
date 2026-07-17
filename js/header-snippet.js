/**
 * Shared site header — inject on peak / minimal-chrome pages.
 */
(function (global) {
    'use strict';

    function basePath() {
        if (/\/peaks\//.test(location.pathname) || /\/blog\//.test(location.pathname)) return '../';
        return '';
    }

    function navHtml(bp, active) {
        active = active || '';
        function cls(page) { return active === page ? ' class="active" aria-current="page"' : ''; }

        return (
            '<div class="header-content">' +
            '<div class="logo"><a href="' + bp + 'index.html"><img src="' + bp + 'logo.png" alt="سه تیغ" class="logo-img" width="140" height="70"></a></div>' +
            '<nav class="nav-menu" id="navMenu" aria-label="منوی اصلی"><ul>' +
            '<li><a href="' + bp + 'index.html"' + cls('home') + ' data-i18n="nav.home">صفحه اصلی</a></li>' +
            '<li class="has-dropdown">' +
            '<a href="' + bp + 'index.html#peaks" aria-haspopup="true" data-i18n="nav.ranges">رشته\u200cکوه\u200cهای ایران</a>' +
            '<ul class="dropdown">' +
            '<li class="has-dropdown-sub"><a href="#" aria-haspopup="true">البرز \u25C2</a><ul class="dropdown-sub">' +
            '<li><a href="' + bp + 'alborz-gharbi.html" data-i18n="nav.alborzWest">البرز غربی</a></li>' +
            '<li><a href="' + bp + 'alborz-markazi.html" data-i18n="nav.alborzCentral">البرز مرکزی</a></li>' +
            '<li><a href="' + bp + 'alborz-shargi.html" data-i18n="nav.alborzEast">البرز شرقی</a></li>' +
            '</ul></li>' +
            '<li class="has-dropdown-sub"><a href="#" aria-haspopup="true">زاگرس \u25C2</a><ul class="dropdown-sub">' +
            '<li><a href="' + bp + 'zagros-shomal.html" data-i18n="nav.zagrosNorth">زاگرس شمالی</a></li>' +
            '<li><a href="' + bp + 'zagros-markazi.html" data-i18n="nav.zagrosCentral">زاگرس مرکزی</a></li>' +
            '<li><a href="' + bp + 'zagros-jonoob.html" data-i18n="nav.zagrosSouth">زاگرس جنوبی</a></li>' +
            '</ul></li>' +
            '<li><a href="' + bp + 'koohaye-markazi.html" data-i18n="nav.centralPeaks">کوه\u200cهای مرکزی ایران</a></li>' +
            '<li><a href="' + bp + 'koohaye-atashfeshani.html" data-i18n="nav.volcanicPeaks">کوه\u200cهای آتشفشانی و منفرد</a></li>' +
            '</ul></li>' +
            '<li><a href="' + bp + 'panahgah.html"' + cls('shelters') + ' data-i18n="nav.shelters">پناهگاه\u200cها</a></li>' +
            '<li><a href="' + bp + 'sakhre-nvardi.html"' + cls('climbing') + ' data-i18n="nav.climbing">صخره\u200cنوردی</a></li>' +
            '<li><a href="' + bp + 'blog.html"' + cls('blog') + ' data-i18n="nav.blog">وبلاگ</a></li>' +
            '<li><a href="' + bp + 'blog-guides.html"' + cls('guides') + ' data-i18n="nav.ascentGuides">راهنمای صعود</a></li>' +
            '<li><a href="' + bp + 'assistant.html"' + cls('assistant') + ' data-i18n="nav.assistant">دستیار</a></li>' +
            '<li><a href="' + bp + 'about.html"' + cls('about') + ' data-i18n="nav.about">درباره ما</a></li>' +
            '<li><a href="' + bp + 'index.html#contact"' + cls('contact') + ' data-i18n="nav.contact">تماس با ما</a></li>' +
            '</ul></nav>' +
            '<div class="nav-overlay" id="navOverlay"></div>' +
            '<div class="header-actions">' +
            '<div class="lang-switch" id="langSwitch" role="group" aria-label="Language">' +
            '<button type="button" class="lang-switch-btn active" data-lang="fa" aria-pressed="true">فا</button>' +
            '<button type="button" class="lang-switch-btn" data-lang="en" aria-pressed="false">EN</button>' +
            '</div>' +
            '<button class="theme-toggle" id="themeToggle" data-i18n-attr="aria-label:nav.theme" aria-label="تغییر تم">' +
            '<svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/></svg>' +
            '<svg class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
            '</button>' +
            '<button class="mobile-menu-toggle" id="mobileMenuToggle" data-i18n-attr="aria-label:nav.menu" aria-label="منو"><span></span><span></span><span></span></button>' +
            '</div></div>'
        );
    }

    function initChrome() {
        var themeToggle = document.getElementById('themeToggle');
        if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
        if (themeToggle && !themeToggle.dataset.bound) {
            themeToggle.dataset.bound = '1';
            themeToggle.addEventListener('click', function () {
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            });
        }

        var mobileMenuToggle = document.getElementById('mobileMenuToggle');
        var navMenu = document.getElementById('navMenu');
        var navOverlay = document.getElementById('navOverlay');
        function closeMenu() {
            if (!navMenu) return;
            navMenu.classList.remove('active');
            if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
            if (navOverlay) navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        if (mobileMenuToggle && navMenu && !mobileMenuToggle.dataset.bound) {
            mobileMenuToggle.dataset.bound = '1';
            mobileMenuToggle.addEventListener('click', function () {
                var isOpen = navMenu.classList.contains('active');
                if (isOpen) closeMenu();
                else {
                    navMenu.classList.add('active');
                    mobileMenuToggle.classList.add('active');
                    if (navOverlay) navOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        }
        if (navOverlay && !navOverlay.dataset.bound) {
            navOverlay.dataset.bound = '1';
            navOverlay.addEventListener('click', closeMenu);
        }
        document.querySelectorAll('.has-dropdown > a, .has-dropdown-sub > a').forEach(function (link) {
            if (link.dataset.bound) return;
            link.dataset.bound = '1';
            link.addEventListener('click', function (e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    link.parentElement.classList.toggle('open');
                }
            });
        });

        var langSwitch = document.getElementById('langSwitch');
        if (langSwitch && !langSwitch.dataset.bound) {
            langSwitch.dataset.bound = '1';
            langSwitch.addEventListener('click', function (e) {
                var btn = e.target.closest('[data-lang]');
                if (btn && global.I18n) I18n.apply(btn.getAttribute('data-lang'));
            });
        }
        if (global.I18n) I18n.refreshDom();
    }

    function upgradeHeader(active) {
        var header = document.querySelector('.header');
        if (!header || header.dataset.chromeUpgraded === '1') return;
        var bp = basePath();
        header.classList.add('header--site');
        header.innerHTML = '<div class="container">' + navHtml(bp, active) + '</div>';
        header.dataset.chromeUpgraded = '1';
        document.body.classList.add('has-site-header');
        initChrome();
    }

    global.HeaderSnippet = {
        basePath: basePath,
        html: navHtml,
        upgrade: upgradeHeader,
        initChrome: initChrome
    };
})(typeof window !== 'undefined' ? window : this);
