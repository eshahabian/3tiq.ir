// =============================================
//  Theme Toggle
// =============================================
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
}

if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', body.classList.contains('dark-mode') ? 'true' : 'false');
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });
}

// =============================================
//  i18n helpers
// =============================================
function tr(key, fallback) {
    return window.I18n ? I18n.t(key) : fallback;
}
function isEn() {
    return window.I18n && I18n.isEn();
}
function isRangePage() {
    return /(?:^|\/)(alborz-(?:gharbi|markazi|shargi)|zagros-(?:shomal|markazi|jonoob)|koohaye-(?:markazi|atashfeshani))\.html$/i.test(location.pathname);
}

// صفحات رشته کوه اسکریپت inline خودشان را دارند — app.js فقط برای index
const isHomeApp = !isRangePage();
function locNum(n) {
    return isEn() ? String(n) : Number(n).toLocaleString('fa-IR');
}
function peakDisplayName(m) {
    return window.ContentEn ? ContentEn.peakName(m) : m.name;
}
function peakDisplayProvince(m) {
    return window.ContentEn ? ContentEn.peakProvince(m) : m.province;
}

// =============================================
//  Mobile Menu Toggle
// =============================================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');
const navOverlay = document.getElementById('navOverlay');

function closeMenu() {
    navMenu.classList.remove('active');
    mobileMenuToggle.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'false');
}

if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenuToggle.setAttribute('aria-controls', 'navMenu');
    mobileMenuToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.contains('active');
        if (isOpen) {
            closeMenu();
        } else {
            navMenu.classList.add('active');
            mobileMenuToggle.classList.add('active');
            navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            mobileMenuToggle.setAttribute('aria-expanded', 'true');
        }
    });
}

// بستن منو با کلیک روی overlay
if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
}

// بستن منو با کلیک روی لینک‌ها (موبایل)
document.querySelectorAll('.nav-menu a:not(.has-dropdown > a)').forEach(link => {
    link.addEventListener('click', closeMenu);
});

// باز/بسته کردن dropdown در موبایل
document.querySelectorAll('.has-dropdown > a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            const parent = link.parentElement;
            parent.classList.toggle('open');
        }
    });
});

// باز/بسته کردن dropdown-sub در موبایل
document.querySelectorAll('.has-dropdown-sub > a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            const parent = link.parentElement;
            parent.classList.toggle('open');
        }
    });
});

// =============================================
//  Counter Animation
// =============================================
function animateCounter(counter) {
    const target = +counter.getAttribute('data-target');
    const suffix = counter.getAttribute('data-suffix') || '';
    const duration = 1800;
    const start = performance.now();

    const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuart
        const eased = 1 - Math.pow(1 - progress, 4);
        counter.innerText = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(update);
        else counter.innerText = target + suffix;
    };

    counter.innerText = '0' + suffix;
    requestAnimationFrame(update);
}

// کانتر از همون ابتدا شروع می‌کنه چون hero-map اول صفحه‌ست
window.addEventListener('load', () => {
    document.querySelectorAll('.hero-map-content .stat-number[data-target]')
        .forEach(c => animateCounter(c));
});

// =============================================
//  ۱۰ قله برتر ایران
// =============================================
const famousPeaks = [
    {
        name: 'دماوند',
        elevation: 5610,
        province: 'مازندران / تهران',
        difficulty: 'سخت',
        bestSeason: 'تیر - شهریور',
        duration: '۲ تا ۳ روز',
        description: 'بلندترین قله ایران و خاورمیانه. آتشفشانی خاموش با قله‌ای پوشیده از برف و دهانه گوگردی که تجربه‌ای بی‌نظیر برای هر کوهنوردی است.',
        image: 'images/peaks/damavand.jpg',
        link: 'peaks/damavand.html'
    },
    {
        name: 'علم‌کوه',
        elevation: 4850,
        province: 'مازندران',
        difficulty: 'خیلی‌سخت',
        bestSeason: 'مرداد - شهریور',
        duration: '۲ روز',
        description: 'دومین قله بلند ایران با دیواره شمالی باشکوه و چالش‌برانگیز. مقصد اصلی کوهنوردان حرفه‌ای در رشته کوه البرز مرکزی.',
        image: 'images/peaks/alamkooh.jpg',
	link: 'peaks/alamkooh.html'
    },
    {
        name: 'سبلان',
        elevation: 4811,
        province: 'اردبیل',
        difficulty: 'متوسط',
        bestSeason: 'تیر - مرداد',
        duration: '۱ تا ۲ روز',
        description: 'سومین قله بلند ایران با دریاچه یخ زیبا در قله. آتشفشانی خاموش با چشمه‌های آب گرم در دامنه و مناظر بکر چهارفصل.',
        image: 'images/peaks/sabalan.jpg',
	link: 'peaks/sabalan.html'
    },
    {
        name: 'زردکوه بختیاری',
        elevation: 4548,
        province: 'چهارمحال و بختیاری',
        difficulty: 'سخت',
        bestSeason: 'خرداد - مرداد',
        duration: '۲ روز',
        description: 'بلندترین قله رشته کوه زاگرس در قلب سرزمین بختیاری. پوشش برفی طولانی، دره‌های عمیق و طبیعت وحشی از ویژگی‌های این قله است.',
        image: 'images/peaks/zardkooh.jpg',
	link: 'peaks/zardkooh.html'
    },
    {
        name: 'هزار',
        elevation: 4465,
        province: 'کرمان',
        difficulty: 'سخت',
        bestSeason: 'خرداد - شهریور',
        duration: '۲ روز',
        description: 'بلندترین قله جنوب ایران با چشم‌اندازهای خیره‌کننده به کویر. مسیر صعود طولانی اما دارای مناظر بی‌نظیر از دشت‌های کرمان.',
        image: 'images/peaks/hezar.jpg',
	link: 'peaks/hezar.html'
    },
    {
        name: 'دنا',
        elevation: 4409,
        province: 'کهگیلویه و بویراحمد',
        difficulty: 'متوسط',
        bestSeason: 'اردیبهشت - تیر',
        duration: '۲ روز',
        description: 'بانوی کوه‌های ایران با قله‌های متعدد و دره‌های پوشیده از گل. رشته‌کوه دنا با تنوع زیستی استثنایی خود یکی از زیباترین مناطق کوهستانی ایران است.',
        image: 'images/peaks/dena.jpg',
	link: 'peaks/dena.html'
    },
    {
        name: 'اشترانکوه',
        elevation: 4150,
        province: 'لرستان',
        difficulty: 'متوسط',
        bestSeason: 'خرداد - مرداد',
        duration: '۲ روز',
        description: 'کوه شتر پشت لرستان با دشت‌های سبز و آبشارهای زیبا. یکی از مرتفع‌ترین قله‌های زاگرس با چشمه‌های آب زلال و پوشش گیاهی بکر.',
        image: 'images/peaks/eshterankoh.jpg',
	link: 'peaks/eshterankoh.html'
    },
    {
        name: 'شیرکوه یزد',
        elevation: 4075,
        province: 'یزد',
        difficulty: 'متوسط',
        bestSeason: 'فروردین - خرداد',
        duration: '۱ روز',
        description: 'بلندترین قله استان یزد در میان کویر. کوهی منحصربه‌فرد که از دل کویر سر برافراشته و برف‌های قله‌اش با شن‌های کویر تضاد زیبایی می‌سازند.',
        image: 'images/peaks/shirkoh.jpg',
	link: 'peaks/shirkoh.html'
    },
    {
        name: 'توچال',
        elevation: 3933,
        province: 'تهران',
        difficulty: 'آسان',
        bestSeason: 'همه فصل',
        duration: '۱ روز',
        description: 'نزدیک‌ترین قله بزرگ به پایتخت با دسترسی آسان از طریق تله‌کابین. محبوب‌ترین مقصد کوهنوردی تهرانی‌ها با چشم‌انداز زیبا به شهر.',
        image: 'images/peaks/tochal.jpg',
	link: 'peaks/tochal.html'
    },
    {
        name: 'سهند',
        elevation: 3707,
        province: 'آذربایجان شرقی',
        difficulty: 'متوسط',
        bestSeason: 'تیر - شهریور',
        duration: '۱ روز',
        description: 'آتشفشان خاموش آذربایجان با دره‌های رنگارنگ و چشمه‌های متعدد. بهشت گل‌های وحشی در بهار و پیست اسکی محبوب در زمستان.',
        image: 'images/peaks/sahand2.webp',
	link: 'peaks/sahand.html'
    },
    {
        name: 'تفتان',
        elevation: 4042,
        province: 'سیستان و بلوچستان',
        difficulty: 'سخت',
        bestSeason: 'اسفند - اردیبهشت',
        duration: '۲ روز',
        description: 'تنها آتشفشان نیمه‌فعال ایران در جنوب شرقی کشور. دود و بخار گوگرد از دهانه قله، این کوه را به یکی از عجیب‌ترین و جذاب‌ترین مقاصد کوهنوردی تبدیل کرده.',
        image: 'images/peaks/taftan.webp',
	link: 'peaks/taftan.html'
    },
    {
        name: 'کرکس',
        elevation: 3899,
        province: 'اصفهان',
        difficulty: 'متوسط',
        bestSeason: 'فروردین - خرداد',
        duration: '۱ روز',
        description: 'قله محبوب اصفهانی‌ها با دسترسی آسان و مناظر بی‌نظیر به کویر مرکزی ایران. در روزهای صاف می‌توان تا کویر نمک را از قله دید.',
        image: 'images/peaks/karkas.webp',
	link: 'peaks/karkas.html'
    }
];

function renderPeaks() {
    if (!isHomeApp) return;
    const grid = document.getElementById('peaksGrid');
    if (!grid) return;

    const list = isEn() && window.ContentEn ? ContentEn.famousPeaksEn : famousPeaks;

    grid.innerHTML = list.map((peak, idx) => {
        const tag   = peak.link ? 'a' : 'div';
        const href  = peak.link ? `href="${peak.link}"` : '';
        const badge = peak.link ? `<span class="peak-link-badge">${tr('peaks.viewDetails', 'مشاهده جزئیات ←')}</span>` : '';
        const diffClass = famousPeaks[idx] ? famousPeaks[idx].difficulty : '';
        const diff  = isEn() ? peak.difficulty : (famousPeaks[idx] ? famousPeaks[idx].difficulty : peak.difficulty);
        return `
        <${tag} class="peak-card${peak.link ? ' peak-card--linked' : ''}" ${href}>
            <div class="peak-image-wrap">
                <img src="${peak.image}" alt="${peak.name}" loading="lazy">
                <span class="peak-elevation-badge">⛰ ${locNum(peak.elevation)} ${tr('peaks.meters', 'متر')}</span>
                <span class="peak-difficulty-badge ${diffClass}">${diff}</span>
            </div>
            <div class="peak-body">
                <div class="peak-header">
                    <h3 class="peak-name">${peak.name}</h3>
                    <span class="peak-province">📍 ${peak.province}</span>
                </div>
                <p class="peak-desc">${peak.description}</p>
                <div class="peak-meta">
                    <span>🗓 ${tr('peaks.bestSeason', 'بهترین فصل')}: ${peak.bestSeason}</span>
                    <span>⏱ ${tr('peaks.duration', 'مدت')}: ${peak.duration}</span>
                </div>
                ${badge}
            </div>
        </${tag}>`;
    }).join('');
}

renderPeaks();


// =============================================
//  Shelters - داده‌های پناهگاه و جانپناه
// =============================================
const routes = [
    {
        name: 'پناهگاه برگ جهان',
        province: 'مازندران',
        range: 'البرز مرکزی',
        image: 'images/peaks/damavand.jpg',
        description: 'یکی از قدیمی‌ترین و معروف‌ترین پناهگاه‌های ایران در دامنه جنوبی دماوند، در ارتفاع ۳۲۵۰ متری.',
        history: 'ساخته شده در دهه ۱۳۴۰ توسط فدراسیون کوهنوردی ایران. برگ جهان دهه‌هاست که پایگاه اصلی صعود به دماوند است.',
        capacity: 80,
        water: true,
        electricity: true
    },
    {
        name: 'پناهگاه تخت فریدون',
        province: 'مازندران',
        range: 'البرز مرکزی',
        image: 'images/peaks/alamkooh.jpg',
        description: 'پناهگاه مرتفع دماوند در ارتفاع ۴۲۵۰ متر، آخرین نقطه استراحت پیش از صعود نهایی به قله.',
        history: 'این پناهگاه در دهه ۱۳۵۰ احداث شد و از آن زمان پایگاه اصلی صعودهای تابستانی و زمستانی به دماوند بوده است.',
        capacity: 40,
        water: false,
        electricity: false
    },
    {
        name: 'پناهگاه شیرپلا',
        province: 'مازندران',
        range: 'البرز مرکزی',
        image: 'images/peaks/sabalan.jpg',
        description: 'پناهگاهی در میان جنگل‌های انبوه البرز در ارتفاع ۲۲۰۰ متر، اولین توقف در مسیر علم‌کوه.',
        history: 'پناهگاه شیرپلا قدمتی بیش از ۶۰ سال دارد و طی دهه‌های مختلف بازسازی و توسعه یافته است.',
        capacity: 60,
        water: true,
        electricity: true
    },
    {
        name: 'پناهگاه صخره‌ای علم‌کوه',
        province: 'مازندران',
        range: 'البرز مرکزی',
        image: 'images/peaks/tochal.jpg',
        description: 'پناهگاهی در قلب دیواره شمالی علم‌کوه در ارتفاع ۳۶۰۰ متر، مخصوص کوهنوردان حرفه‌ای.',
        history: null,
        capacity: 25,
        water: false,
        electricity: false
    },
    {
        name: 'پناهگاه سبلان',
        province: 'اردبیل',
        range: 'البرز غربی',
        image: 'images/peaks/dena.jpg',
        description: 'پناهگاه اصلی منطقه سبلان در ارتفاع ۳۵۰۰ متر با چشم‌اندازی بی‌نظیر به دریاچه آتشفشانی.',
        history: 'این پناهگاه در دهه ۱۳۶۰ توسط هیئت کوهنوردی اردبیل احداث شد و از آن زمان بارها بازسازی شده است.',
        capacity: 50,
        water: true,
        electricity: false
    },
    {
        name: 'پناهگاه اشترانکوه',
        province: 'لرستان',
        range: 'زاگرس مرکزی',
        image: 'images/peaks/zardkuh.jpg',
        description: 'پناهگاه زیبای اشترانکوه در ارتفاع ۳۰۰۰ متر در دل زاگرس مرکزی با طبیعتی بکر.',
        history: 'ساخته شده توسط فدراسیون کوهنوردی در دهه ۱۳۷۰ برای پشتیبانی از کوهنوردان منطقه لرستان.',
        capacity: 35,
        water: true,
        electricity: true
    },
    {
        name: 'پناهگاه توچال',
        province: 'تهران',
        range: 'البرز مرکزی',
        image: 'images/peaks/tochal.jpg',
        description: 'پناهگاه معروف توچال در ارتفاع ۳۵۵۰ متر، یکی از پرتردد‌ترین پناهگاه‌های ایران.',
        history: 'پناهگاه توچال از دهه ۱۳۵۰ فعال است و طی سال‌ها توسعه یافته و امکانات آن ارتقاء پیدا کرده.',
        capacity: 100,
        water: true,
        electricity: true
    },
    {
        name: 'پناهگاه زردکوه',
        province: 'چهارمحال و بختیاری',
        range: 'زاگرس مرکزی',
        image: 'images/peaks/zardkooh.jpg',
        description: 'پناهگاهی در دامنه زردکوه بختیاری در ارتفاع ۳۲۰۰ متر، دروازه ورود به بلندترین قله زاگرس.',
        history: null,
        capacity: 30,
        water: true,
        electricity: false
    }
];

// =============================================
//  Shelters - نمایش کارت‌ها
// =============================================
const routesGrid = document.getElementById('routesGrid');

function loadRoutes(filter = 'all') {
    if (!isHomeApp) return;
    if (!routesGrid) return;

    const filtered = filter === 'all'
        ? routes
        : routes.filter(r => r.range === filter);

    if (filtered.length === 0) {
        routesGrid.innerHTML = `<p style="text-align:center; color:var(--text-light); grid-column:1/-1;">${tr('shelter.notFound', 'پناهگاهی یافت نشد.')}</p>`;
        return;
    }

    routesGrid.innerHTML = filtered.map(s => {
        const idx = routes.indexOf(s);
        const en = isEn() && window.ContentEn ? ContentEn.routesEn[idx] : null;
        const item = en || s;
        const rangeLabel = isEn() && window.ContentEn ? ContentEn.regionLabel(s.range) : s.range;
        return `
        <div class="route-card shelter-card">
            <img class="route-image" src="${item.image}" alt="${item.name}" loading="lazy">
            <div class="route-content">
                <div class="route-header">
                    <h3 class="route-name">${item.name}</h3>
                    <span class="route-region">📍 ${rangeLabel}</span>
                </div>
                <p class="route-description">${item.description}</p>
                ${item.history ? `
                <div class="shelter-history">
                    <span class="shelter-history-label">📜 ${tr('shelter.history', 'تاریخچه')}</span>
                    ${item.history}
                </div>` : ''}
                <div class="shelter-footer">
                    <span class="shelter-capacity">🏕️ ${locNum(item.capacity)} ${tr('shelter.persons', 'نفر')}</span>
                    <span class="shelter-amenity ${item.water ? 'has' : 'no'}">${item.water ? '💧 ' + tr('shelter.water', 'آب') : '💧 ' + tr('shelter.noWater', 'بی‌آب')}</span>
                    <span class="shelter-amenity ${item.electricity ? 'has' : 'no'}">${item.electricity ? '⚡ ' + tr('shelter.electricity', 'برق') : '⚡ ' + tr('shelter.noElectricity', 'بی‌برق')}</span>
                    <span class="shelter-province">📌 ${item.province}</span>
                </div>
            </div>
        </div>`;
    }).join('');
}

loadRoutes();

// فیلتر دکمه‌ها
if (isHomeApp) document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadRoutes(btn.dataset.filter);
    });
});

// =============================================
//  Neshan Map - تمام صفحه (فقط صفحاتی که #map دارند)
// =============================================
const mapEl = document.getElementById('map');
if (isHomeApp && mapEl && typeof L !== 'undefined') {
const map = new L.Map('map', {
    key: 'web.6a240d5daf514aa6a2bdeac77b73f5e5',
    maptype: 'dreamy',
    poi: true,
    traffic: false,
    center: [32.5, 53.5],   // مرکز ایران
    zoom: 5                  // نمای کل ایران
});

// =============================================
//  Mountain Markers
// =============================================
const mountainIcon = L.divIcon({
    html: `<div style="
        background: linear-gradient(135deg, #2d6a4f, #40916c);
        color: white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        border: 2px solid white;
    "><span style="transform:rotate(45deg); font-size:14px;">⛰️</span></div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36]
});

// پنل کوه
const mountainPanel = document.createElement('div');
mountainPanel.style.cssText = `
    position: absolute; top: 110px; right: 10px;
    z-index: 900; background: rgba(255,255,255,0.97); border-radius: 12px;
    padding: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    width: 220px; max-width: calc(50% - 16px); font-family: 'Vazirmatn', Tahoma, sans-serif;
`;

function layoutMapPanels() {
    const rtl = !isEn();
    if (mountainPanel) {
        mountainPanel.style.direction = rtl ? 'rtl' : 'ltr';
        mountainPanel.style.right = rtl ? '10px' : 'auto';
        mountainPanel.style.left = rtl ? 'auto' : '10px';
    }
    if (shelterPanel) {
        shelterPanel.style.direction = rtl ? 'rtl' : 'ltr';
        shelterPanel.style.right = rtl ? '10px' : 'auto';
        shelterPanel.style.left = rtl ? 'auto' : '10px';
    }
}

function buildMountainPanelHtml() {
    return `
    <h4 style="margin:0 0 8px; color:#2d6a4f; font-size:13px;">${tr('map.searchMountain', '⛰️ جستجوی کوه')}</h4>
    <input id="mountain-search" type="text" placeholder="${tr('map.searchMountainPh', 'نام کوه...')}" style="
        width:100%; padding:6px 8px; border:1px solid #ddd;
        border-radius:8px; font-size:13px; box-sizing:border-box;
        font-family:inherit; outline:none;
    ">
    <select id="mountain-filter" style="
        width:100%; margin-top:8px; padding:6px 8px;
        border:1px solid #ddd; border-radius:8px;
        font-size:13px; font-family:inherit; outline:none;
    ">
        <option value="all">${tr('map.allProvinces', 'همه استان‌ها')}</option>
    </select>
    <select id="mountain-height-filter" style="
        width:100%; margin-top:8px; padding:6px 8px;
        border:1px solid #ddd; border-radius:8px;
        font-size:13px; font-family:inherit; outline:none;
    ">
        <option value="all">${tr('map.allHeights', 'همه ارتفاع‌ها')}</option>
        <option value="3000-4000">${tr('map.heightMid', '۳۰۰۰ تا ۴۰۰۰ متر')}</option>
        <option value="4000+">${tr('map.heightHigh', 'بالای ۴۰۰۰ متر')}</option>
    </select>
    <div id="mountain-count" style="margin-top:8px; font-size:11px; color:#888; text-align:center;"></div>`;
}

mountainPanel.innerHTML = buildMountainPanelHtml();
document.getElementById('map').appendChild(mountainPanel);

let allMountainMarkers = [];
let mountainData = [];
let mapMountainRender = null;
let mapMountainFilter = null;

Promise.all([
    fetch('js/mountains.json').then(r => r.json()),
    window.ContentEn ? ContentEn.loadPeaksEn() : Promise.resolve({})
]).then(function (results) {
        var mountains = results[0];
        if (window.ContentEn) mountains = ContentEn.enrichMountains(mountains);
        mountainData = mountains;

        const provinces = [...new Set(mountains.map(m => peakDisplayProvince(m)))].sort();
        const select = document.getElementById('mountain-filter');
        provinces.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p; opt.textContent = p;
            select.appendChild(opt);
        });

        function buildMountainPopup(m) {
            const dir = isEn() ? 'ltr' : 'rtl';
            const name = peakDisplayName(m);
            const prov = peakDisplayProvince(m);
            const link = m.slug
                ? `<a href="peaks/${m.slug}.html" style="
                    display:inline-block;margin-top:8px;padding:5px 12px;
                    background:#2d6a4f;color:#fff;border-radius:100px;
                    font-size:12px;font-weight:700;text-decoration:none;
                ">${tr('map.viewPeak', 'مشاهده صفحه قله ←')}</a>`
                : '';
            return `
                <div style="text-align:center;font-family:'Vazirmatn',Tahoma;direction:${dir};min-width:150px;padding:4px;">
                    <b style="font-size:14px;color:#2d6a4f;">⛰️ ${name}</b><br>
                    <span style="color:#555;font-size:12px;">${tr('map.elevation', 'ارتفاع')}: <b>${locNum(m.height)}</b> ${tr('peaks.meters', 'متر')}</span><br>
                    <span style="color:#888;font-size:11px;">📍 ${prov}</span><br>
                    ${link}
                </div>`;
        }

        function renderMountains(list) {
            allMountainMarkers.forEach(m => map.removeLayer(m));
            allMountainMarkers = [];
            list.forEach(m => {
                const marker = L.marker([m.lat, m.lng], {
                    icon: mountainIcon,
                    title: peakDisplayName(m)
                })
                    .addTo(map)
                    .bindPopup(buildMountainPopup(m));

                if (m.slug) {
                    marker.on('click', function () {
                        marker.openPopup();
                    });
                }

                allMountainMarkers.push(marker);
            });
            document.getElementById('mountain-count').textContent =
                tr('map.mountainCount', '{n} کوه نمایش داده می‌شود').replace('{n}', locNum(list.length));
        }

        mapMountainRender = renderMountains;

        function applyMountainFilter() {
            const search   = document.getElementById('mountain-search').value.trim().toLowerCase();
            const province = document.getElementById('mountain-filter').value;
            const height   = document.getElementById('mountain-height-filter').value;

            const filtered = mountainData.filter(m => {
                const names = [m.name, m.nameEn || ''].join(' ').toLowerCase();
                const matchName  = !search || names.includes(search);
                const matchProv  = province === 'all' || peakDisplayProvince(m) === province;
                const matchHeight =
                    height === 'all'      ? true :
                    height === '3000-4000' ? (m.height >= 3000 && m.height < 4000) :
                    height === '4000+'     ? m.height >= 4000 : true;
                return matchName && matchProv && matchHeight;
            });
            renderMountains(filtered);
        }

        mapMountainFilter = applyMountainFilter;

        renderMountains(mountains);

        document.getElementById('mountain-search').addEventListener('input', applyMountainFilter);
        document.getElementById('mountain-filter').addEventListener('change', applyMountainFilter);
        document.getElementById('mountain-height-filter').addEventListener('change', applyMountainFilter);
    })
    .catch(err => {
        console.error('❌ خطا در بارگذاری mountains.json:', err);
        const el = document.getElementById('mountain-count');
        if (el) el.textContent = tr('map.loadError', 'خطا در بارگذاری داده');
    });

// =============================================
//  Shelter Markers
// =============================================
const shelterIcon = L.divIcon({
    html: `<div style="
        background: linear-gradient(135deg, #d97706, #f59e0b);
        color: white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        width: 28px; height: 28px;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        border: 2px solid white;
    "><span style="transform:rotate(45deg); font-size:12px;">🏕️</span></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -32]
});

// پنل پناهگاه
const shelterPanel = document.createElement('div');
shelterPanel.style.cssText = `
    position: absolute; top: 310px; right: 10px;
    z-index: 900; background: rgba(255,255,255,0.97); border-radius: 12px;
    padding: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    width: 220px; max-width: calc(50% - 16px); font-family: 'Vazirmatn', Tahoma, sans-serif;
`;

function buildShelterPanelHtml() {
    return `
    <h4 style="margin:0 0 8px; color:#d97706; font-size:13px;">${tr('map.searchShelter', '🏕️ جستجوی پناهگاه')}</h4>
    <input id="shelter-search" type="text" placeholder="${tr('map.searchShelterPh', 'نام پناهگاه...')}" style="
        width:100%; padding:6px 8px; border:1px solid #ddd;
        border-radius:8px; font-size:13px; box-sizing:border-box;
        font-family:inherit; outline:none;
    ">
    <select id="shelter-filter" style="
        width:100%; margin-top:8px; padding:6px 8px;
        border:1px solid #ddd; border-radius:8px;
        font-size:13px; font-family:inherit; outline:none;
    ">
        <option value="all">${tr('map.allProvinces', 'همه استان‌ها')}</option>
    </select>
    <div id="shelter-count" style="margin-top:8px; font-size:11px; color:#888; text-align:center;"></div>`;
}

shelterPanel.innerHTML = buildShelterPanelHtml();
layoutMapPanels();
document.getElementById('map').appendChild(shelterPanel);

let allShelterMarkers = [];
let shelterData = [];

// مسیر صحیح: فایل shelters.json داخل پوشه js باشد
fetch('js/shelters.json')
    .then(r => r.json())
    .then(shelters => {
        shelterData = shelters;

        const provinces = [...new Set(shelters.map(s => s.province))].sort();
        const select = document.getElementById('shelter-filter');
        provinces.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p; opt.textContent = p;
            select.appendChild(opt);
        });

        function renderShelters(list) {
            allShelterMarkers.forEach(m => map.removeLayer(m));
            allShelterMarkers = [];
            const dir = isEn() ? 'ltr' : 'rtl';
            list.forEach(s => {
                const typeLabel = window.ContentEn ? ContentEn.shelterTypeLabel(s.type) : s.type;
                const marker = L.marker([s.lat, s.lng], { icon: shelterIcon })
                    .addTo(map)
                    .bindPopup(`
                        <div style="text-align:center; font-family:'Vazirmatn',Tahoma; direction:${dir}; min-width:140px; padding:4px;">
                            <b style="font-size:14px; color:#d97706;">🏕️ ${s.name}</b><br>
                            <span style="color:#555; font-size:12px;">${tr('map.type', 'نوع')}: <b>${typeLabel}</b></span><br>
                            <span style="color:#888; font-size:11px;">📍 ${s.province}</span>
                        </div>
                    `);
                allShelterMarkers.push(marker);
            });
            document.getElementById('shelter-count').textContent =
                tr('map.shelterCount', '{n} پناهگاه نمایش داده می‌شود').replace('{n}', locNum(list.length));
        }

        renderShelters(shelters);

        function applyShelterFilter() {
            const search = document.getElementById('shelter-search').value.trim();
            const province = document.getElementById('shelter-filter').value;
            const filtered = shelterData.filter(s =>
                (!search || s.name.includes(search)) &&
                (province === 'all' || s.province === province)
            );
            renderShelters(filtered);
        }

        document.getElementById('shelter-search').addEventListener('input', applyShelterFilter);
        document.getElementById('shelter-filter').addEventListener('change', applyShelterFilter);

        console.log(`✅ ${shelters.length} پناهگاه بارگذاری شد`);
    })
    .catch(err => {
        console.error('❌ خطا در بارگذاری shelters.json:', err);
        document.getElementById('shelter-count').textContent = tr('map.loadError', 'خطا در بارگذاری داده');
    });

window.refreshMapPanels = function () {
    if (!document.getElementById('map')) return;
    const mSearch = document.getElementById('mountain-search');
    const sSearch = document.getElementById('shelter-search');
    const mVal = mSearch ? mSearch.value : '';
    const sVal = sSearch ? sSearch.value : '';
    const mProv = document.getElementById('mountain-filter') ? document.getElementById('mountain-filter').value : 'all';
    const mHeight = document.getElementById('mountain-height-filter') ? document.getElementById('mountain-height-filter').value : 'all';
    const sProv = document.getElementById('shelter-filter') ? document.getElementById('shelter-filter').value : 'all';

    mountainPanel.innerHTML = buildMountainPanelHtml();
    shelterPanel.innerHTML = buildShelterPanelHtml();
    layoutMapPanels();

    if (mountainData.length && mapMountainRender) {
        const select = document.getElementById('mountain-filter');
        [...new Set(mountainData.map(m => peakDisplayProvince(m)))].sort().forEach(p => {
            const opt = document.createElement('option');
            opt.value = p; opt.textContent = p;
            if (p === mProv) opt.selected = true;
            select.appendChild(opt);
        });
        document.getElementById('mountain-search').value = mVal;
        document.getElementById('mountain-height-filter').value = mHeight;
        document.getElementById('mountain-search').addEventListener('input', mapMountainFilter);
        document.getElementById('mountain-filter').addEventListener('change', mapMountainFilter);
        document.getElementById('mountain-height-filter').addEventListener('change', mapMountainFilter);
        mapMountainFilter();
    }

    if (shelterData.length) {
        const select = document.getElementById('shelter-filter');
        [...new Set(shelterData.map(s => s.province))].sort().forEach(p => {
            const opt = document.createElement('option');
            opt.value = p; opt.textContent = p;
            if (p === sProv) opt.selected = true;
            select.appendChild(opt);
        });
        document.getElementById('shelter-search').value = sVal;
        document.getElementById('shelter-search').addEventListener('input', function () {
            const search = document.getElementById('shelter-search').value.trim();
            const province = document.getElementById('shelter-filter').value;
            const filtered = shelterData.filter(s =>
                (!search || s.name.includes(search)) &&
                (province === 'all' || s.province === province)
            );
            allShelterMarkers.forEach(m => map.removeLayer(m));
            allShelterMarkers = [];
            const dir = isEn() ? 'ltr' : 'rtl';
            filtered.forEach(s => {
                const typeLabel = window.ContentEn ? ContentEn.shelterTypeLabel(s.type) : s.type;
                allShelterMarkers.push(L.marker([s.lat, s.lng], { icon: shelterIcon }).addTo(map).bindPopup(`
                    <div style="text-align:center;font-family:'Vazirmatn',Tahoma;direction:${dir};min-width:140px;padding:4px;">
                        <b style="font-size:14px;color:#d97706;">🏕️ ${s.name}</b><br>
                        <span style="color:#555;font-size:12px;">${tr('map.type', 'نوع')}: <b>${typeLabel}</b></span><br>
                        <span style="color:#888;font-size:11px;">📍 ${s.province}</span>
                    </div>`));
            });
            document.getElementById('shelter-count').textContent =
                tr('map.shelterCount', '{n} پناهگاه نمایش داده می‌شود').replace('{n}', locNum(filtered.length));
        });
        document.getElementById('shelter-filter').addEventListener('change', function () {
            document.getElementById('shelter-search').dispatchEvent(new Event('input'));
        });
        document.getElementById('shelter-search').dispatchEvent(new Event('input'));
    }
};

} // end map block

// =============================================
//  About Gallery Slider
// =============================================
const galleryImages = [
    { src: 'images/peaks/damavand.jpg',  caption: 'قله دماوند — ۵۶۱۰ متر', captionEn: 'Mount Damavand — 5,610 m' },
    { src: 'images/peaks/alamkooh.jpg',  caption: 'قله علم‌کوه — ۴۸۵۰ متر', captionEn: 'Alam Kuh — 4,850 m' },
    { src: 'images/peaks/sabalan.jpg',   caption: 'قله سبلان — ۴۸۱۱ متر', captionEn: 'Mount Sabalan — 4,811 m' },
    { src: 'images/peaks/dena.jpg',      caption: 'قله دنا — ۴۴۰۹ متر', captionEn: 'Dena — 4,409 m' },
    { src: 'images/peaks/tochal.jpg',    caption: 'قله توچال — ۳۹۳۳ متر', captionEn: 'Tochal — 3,933 m' },
    { src: 'images/peaks/shahvar.jpg',   caption: 'قله شاهوار', captionEn: 'Shahvar' },
    { src: 'images/peaks/shirkoh.jpg',   caption: 'قله شیرکوه', captionEn: 'Shir Kuh' },
    { src: 'images/peaks/taftan.webp',    caption: 'قله تفتان', captionEn: 'Taftan' },
];

function galleryCaption(img) {
    return isEn() && img.captionEn ? img.captionEn : img.caption;
}

(function initGallery() {
    const track    = document.getElementById('galleryTrack');
    const dotsEl   = document.getElementById('galleryDots');
    const thumbsEl = document.getElementById('galleryThumbs');
    const counter  = document.getElementById('galleryCounter');
    if (!track) return;

    let current = 0;
    let autoTimer = null;

    function buildSlides() {
        track.innerHTML = galleryImages.map((img, i) => `
            <div class="gallery-slide${i === 0 ? ' active' : ''}">
                <img src="${img.src}" alt="${galleryCaption(img)}" loading="lazy">
                <div class="gallery-caption">${galleryCaption(img)}</div>
            </div>
        `).join('');

        dotsEl.innerHTML = galleryImages.map((_, i) =>
            `<button class="gallery-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="اسلاید ${i+1}"></button>`
        ).join('');

        thumbsEl.innerHTML = galleryImages.map((img, i) =>
            `<img class="gallery-thumb${i === 0 ? ' active' : ''}" src="${img.src}" alt="${img.caption}" data-i="${i}">`
        ).join('');

        dotsEl.querySelectorAll('.gallery-dot').forEach(d =>
            d.addEventListener('click', () => goTo(+d.dataset.i))
        );
        thumbsEl.querySelectorAll('.gallery-thumb').forEach(t =>
            t.addEventListener('click', () => goTo(+t.dataset.i))
        );
    }

    function updateUI() {
        track.querySelectorAll('.gallery-slide').forEach((s, i) =>
            s.classList.toggle('active', i === current)
        );
        dotsEl.querySelectorAll('.gallery-dot').forEach((d, i) =>
            d.classList.toggle('active', i === current)
        );
        thumbsEl.querySelectorAll('.gallery-thumb').forEach((t, i) =>
            t.classList.toggle('active', i === current)
        );
        if (counter) counter.textContent = `${current + 1} / ${galleryImages.length}`;
    }

    function goTo(n) {
        current = (n + galleryImages.length) % galleryImages.length;
        updateUI();
        resetAuto();
    }

    function resetAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => goTo(current + 1), 4000);
    }

    document.getElementById('galleryPrev').addEventListener('click', () => goTo(current - 1));
    document.getElementById('galleryNext').addEventListener('click', () => goTo(current + 1));

    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });

    buildSlides();
    window.refreshGallery = buildSlides;
    updateUI();
    resetAuto();
})();

// =============================================
//  Back to Top
// =============================================
const backToTop = document.getElementById('backToTop');

if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// =============================================
//  Active Nav Link on Scroll
// =============================================
(function initActiveNav() {
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-menu > ul > li > a');

    if (!sections.length || !navLinks.length) return;

    function setActive(id) {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === '#' + id);
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActive(entry.target.id);
            }
        });
    }, {
        rootMargin: '-40% 0px -55% 0px', // وسط صفحه trigger میشه
        threshold: 0
    });

    sections.forEach(section => observer.observe(section));
})();

document.addEventListener('3tiq:languagechange', function () {
    renderPeaks();
    var activeTab = document.querySelector('.shelter-tab.active');
    var activeFilter = document.querySelector('.filter-btn.active');
    if (activeTab) {
        /* shelter tabs use data-region — re-render handled by index inline script */
    }
    if (activeFilter) loadRoutes(activeFilter.dataset.filter);
    else loadRoutes('all');
    if (window.refreshMapPanels) window.refreshMapPanels();
    if (window.refreshGallery) window.refreshGallery();
});
