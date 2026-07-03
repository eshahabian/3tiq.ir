(function (global) {
    'use strict';

    var STORAGE_KEY = '3tiq-lang';

    var STRINGS = {
        fa: {
            'nav.skip': 'رفتن به محتوای اصلی',
            'nav.home': 'صفحه اصلی',
            'nav.ranges': 'رشته‌کوه‌های ایران',
            'nav.shelters': 'پناهگاه‌ها',
            'nav.blog': 'وبلاگ',
            'nav.contact': 'تماس با ما',
            'hero.subtitle': 'راهنمای جامع کوهنوردی ایران',
            'hero.statPeaks': 'قله ثبت شده',
            'hero.statShelters': 'پناهگاه',
            'hero.statYears': 'سال تجربه',
            'hero.explore': 'کشف بیشتر',
            'hero.routes': 'مسیرها',
            'services.title': 'خدمات ما',
            'services.route.title': 'راهنمای مسیر',
            'services.route.desc': 'نقشه تعاملی مسیرهای صعود با ارتفاع، پناهگاه و قله — نمونه زنده از راهنمای هر قله',
            'services.route.pickPeak': 'انتخاب قله',
            'services.route.fullGuide': 'مشاهده راهنمای کامل قله ←',
            'services.tour.title': 'برنامه‌ریزی تور',
            'services.tour.desc': 'برنامه شخصی‌سازی‌شده با شهر مبدا، تاریخ حرکت، تجهیزات و پیش‌بینی آب‌وهوا',
            'services.tour.f1': 'انتخاب از ۷۶ قله',
            'services.tour.f2': 'برنامه روزانه و چک‌لیست',
            'services.tour.f3': 'خروجی PDF',
            'services.tour.cta': 'شروع برنامه‌ریزی ←',
            'services.tour.aria': 'شروع برنامه‌ریزی تور کوهنوردی',
            'peaks.title': '۱۲ قله محبوب ایران',
            'peaks.subtitle': 'معروف‌ترین و محبوب‌ترین قله‌های کوهنوردی ایران',
            'shelters.title': 'پناهگاه‌ها و جان‌پناه‌های ایران',
            'shelters.subtitle': 'امکانات اقامت و پناه اضطراری در مسیرهای کوهنوردی ایران',
            'shelters.all': 'همه',
            'shelters.viewAll': 'مشاهده همه پناهگاه‌ها ←',
            'about.title': 'درباره ما',
            'about.p1': 'ما یک تیم حرفه‌ای از کوهنوردان با بیش از ۱۰ سال تجربه هستیم که هدفمان معرفی زیبایی‌های کوهستان‌های ایران و ایجاد تجربه‌ای امن و به یاد ماندنی برای علاقه‌مندان به کوهنوردی است.',
            'about.p2': 'با ما می‌توانید به بهترین مسیرهای کوهنوردی دسترسی داشته باشید و از راهنمایی‌های حرفه‌ای بهره‌مند شوید.',
            'common.loading': 'در حال بارگذاری...',
            'common.loadingMap': 'در حال بارگذاری نقشه...',
            'route.export': '📥 ذخیره نقشه (PNG)',
            'route.loading': 'در حال بارگذاری نقشه...',
            'route.unavailable': 'نقشه مسیر در دسترس نیست.',
            'route.legendShelter': '🏠 پناهگاه',
            'route.legendSummit': '🔺 قله',
            'tour.title': 'برنامه‌ریزی تور کوهنوردی',
            'tour.back': 'قبلی',
            'tour.next': 'بعدی',
            'tour.build': 'ساخت برنامه',
            'tour.pdf': 'دانلود PDF',
            'tour.restart': 'برنامه جدید',
            'tour.close': 'بستن',
            'tour.step.peak': 'مقصد',
            'tour.step.level': 'تجربه',
            'tour.step.days': 'مدت',
            'tour.step.group': 'گروه',
            'tour.step.season': 'فصل',
            'tour.step.departure': 'زمان حرکت',
            'tour.q.peak': 'کدوم قله یا منطقه مدنظرته؟',
            'tour.q.level': 'سطح تجربه کوهنوردی‌ات چقدره؟',
            'tour.q.days': 'چند روز وقت داری؟',
            'tour.q.group': 'چند نفر هستید؟',
            'tour.q.season': 'چه فصلی برنامه‌ریزی می‌کنی؟',
            'tour.q.departure': 'چه روز و ساعتی حرکت می‌کنی؟'
        },
        en: {
            'nav.skip': 'Skip to main content',
            'nav.home': 'Home',
            'nav.ranges': 'Mountain Ranges',
            'nav.shelters': 'Shelters',
            'nav.blog': 'Blog',
            'nav.contact': 'Contact',
            'hero.subtitle': 'Complete Mountaineering Guide to Iran',
            'hero.statPeaks': 'Peaks listed',
            'hero.statShelters': 'Shelters',
            'hero.statYears': 'Years experience',
            'hero.explore': 'Explore more',
            'hero.routes': 'Routes',
            'services.title': 'Our Services',
            'services.route.title': 'Route Guide',
            'services.route.desc': 'Interactive ascent maps with elevation, shelters and summit — live preview for each peak',
            'services.route.pickPeak': 'Choose a peak',
            'services.route.fullGuide': 'Full peak guide →',
            'services.tour.title': 'Trip Planner',
            'services.tour.desc': 'Personalized plan with start city, departure date, gear list and weather forecast',
            'services.tour.f1': 'Choose from 76 peaks',
            'services.tour.f2': 'Day-by-day plan & checklist',
            'services.tour.f3': 'PDF export',
            'services.tour.cta': 'Start planning →',
            'services.tour.aria': 'Start mountaineering trip planner',
            'peaks.title': '12 Popular Peaks in Iran',
            'peaks.subtitle': 'The most famous and popular mountaineering peaks in Iran',
            'shelters.title': 'Shelters & Bivouacs in Iran',
            'shelters.subtitle': 'Accommodation and emergency shelters on Iranian climbing routes',
            'shelters.all': 'All',
            'shelters.viewAll': 'View all shelters →',
            'about.title': 'About Us',
            'about.p1': 'We are a team of mountaineers with over 10 years of experience, dedicated to showcasing the beauty of Iran\'s mountains and creating safe, memorable adventures.',
            'about.p2': 'Access the best climbing routes and benefit from professional guidance.',
            'common.loading': 'Loading...',
            'common.loadingMap': 'Loading map...',
            'route.export': '📥 Save map (PNG)',
            'route.loading': 'Loading map...',
            'route.unavailable': 'Route map unavailable.',
            'route.legendShelter': '🏠 Shelter',
            'route.legendSummit': '🔺 Summit',
            'tour.title': 'Mountaineering Trip Planner',
            'tour.back': 'Back',
            'tour.next': 'Next',
            'tour.build': 'Build plan',
            'tour.pdf': 'Download PDF',
            'tour.restart': 'New plan',
            'tour.close': 'Close',
            'tour.step.peak': 'Destination',
            'tour.step.level': 'Experience',
            'tour.step.days': 'Duration',
            'tour.step.group': 'Group',
            'tour.step.season': 'Season',
            'tour.step.departure': 'Departure',
            'tour.q.peak': 'Which peak or area do you have in mind?',
            'tour.q.level': 'What is your climbing experience level?',
            'tour.q.days': 'How many days do you have?',
            'tour.q.group': 'How many people are in your group?',
            'tour.q.season': 'Which season are you planning for?',
            'tour.q.departure': 'When do you plan to start?'
        }
    };

    var currentLang = 'fa';

    function t(key) {
        var pack = STRINGS[currentLang] || STRINGS.fa;
        if (pack[key] !== undefined) return pack[key];
        return (STRINGS.fa[key] !== undefined) ? STRINGS.fa[key] : key;
    }

    function applyLang(lang) {
        currentLang = (lang === 'en') ? 'en' : 'fa';
        localStorage.setItem(STORAGE_KEY, currentLang);

        var html = document.documentElement;
        html.lang = currentLang === 'en' ? 'en' : 'fa';
        html.dir = currentLang === 'en' ? 'ltr' : 'rtl';

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (key) el.textContent = t(key);
        });

        document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
            el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
                var parts = pair.split(':');
                if (parts.length === 2) {
                    el.setAttribute(parts[0].trim(), t(parts[1].trim()));
                }
            });
        });

        document.querySelectorAll('.lang-switch-btn').forEach(function (btn) {
            var active = btn.getAttribute('data-lang') === currentLang;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        document.dispatchEvent(new CustomEvent('3tiq:languagechange', { detail: { lang: currentLang } }));
    }

    function init() {
        var saved = localStorage.getItem(STORAGE_KEY);
        applyLang(saved === 'en' ? 'en' : 'fa');

        var switcher = document.getElementById('langSwitch');
        if (switcher) {
            switcher.addEventListener('click', function (e) {
                var btn = e.target.closest('[data-lang]');
                if (!btn) return;
                applyLang(btn.getAttribute('data-lang'));
            });
        }
    }

    global.I18n = { t: t, lang: function () { return currentLang; }, apply: applyLang };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
