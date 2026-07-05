(function (global) {
    'use strict';

    var PEAKS_EN = null;

    var REGIONS_EN = {
        'البرز مرکزی': 'Central Alborz',
        'البرز غربی': 'Western Alborz',
        'البرز شرقی': 'Eastern Alborz',
        'زاگرس شمالی': 'Northern Zagros',
        'زاگرس مرکزی': 'Central Zagros',
        'زاگرس جنوبی': 'Southern Zagros',
        'کوه‌های مرکزی': 'Central Iran Mountains',
        'کوه‌های مرکزی ایران': 'Central Iran Mountains',
        'شمال شرق': 'Northeast'
    };

    var PROVINCES_EN = {
        'تهران': 'Tehran',
        'مازندران': 'Mazandaran',
        'البرز': 'Alborz',
        'گیلان': 'Gilan',
        'قزوین': 'Qazvin',
        'اصفahan': 'Isfahan',
        'اردبیل': 'Ardabil',
        'آذربایجان شرقی': 'East Azerbaijan',
        'چهارمحال و بختیاری': 'Chaharmahal & Bakhtiari',
        'کهگیلویه و بویراحمد': 'Kohgiluyeh & Boyer-Ahmad',
        'لرستان': 'Lorestan',
        'همدان': 'Hamedan',
        'کرمانشاه': 'Kermanshah',
        'کردستان': 'Kurdistan',
        'فارس': 'Fars',
        'یزد': 'Yazd',
        'خراسان رضوی': 'Khorasan Razavi',
        'گلستان': 'Golestan',
        'کرمان': 'Kerman',
        'سیستان و بلوچستان': 'Sistan & Baluchestan',
        'خوزستان': 'Khuzestan',
        'بوشهر': 'Bushehr',
        'اصفهان': 'Isfahan'
    };

    var SHELTERS_EN = null;

    var DIFFICULTY_EN = {
        'آسان': 'Easy',
        'متوسط': 'Moderate',
        'سخت': 'Hard',
        'خیلی‌سخت': 'Very Hard'
    };

    var SHELTER_TYPE_EN = {
        'پناهگاه': 'Shelter',
        'جانپناه': 'Bivouac',
        'کلبه': 'Cabin'
    };

    var FAMOUS_PEAKS_EN = [
        { name: 'Mount Damavand', elevation: 5610, province: 'Mazandaran / Tehran', difficulty: 'Hard', bestSeason: 'Jul – Sep', duration: '2–3 days', description: 'Iran and the Middle East\'s highest peak. A dormant volcano with a snow-capped summit and sulfur crater — an unforgettable climb for every mountaineer.', image: 'images/peaks/damavand.jpg', link: 'peaks/damavand.html' },
        { name: 'Alam Kuh', elevation: 4850, province: 'Mazandaran', difficulty: 'Very Hard', bestSeason: 'Aug – Sep', duration: '2 days', description: 'Iran\'s second highest peak with a magnificent northern wall. The main destination for expert climbers in the Central Alborz range.', image: 'images/peaks/alamkooh.jpg', link: 'peaks/alamkooh.html' },
        { name: 'Mount Sabalan', elevation: 4811, province: 'Ardabil', difficulty: 'Moderate', bestSeason: 'Jul – Aug', duration: '1–2 days', description: 'Iran\'s third highest peak with a beautiful crater lake at the summit. A dormant volcano with hot springs on its slopes and pristine four-season scenery.', image: 'images/peaks/sabalan.jpg', link: 'peaks/sabalan.html' },
        { name: 'Zard Kuh', elevation: 4548, province: 'Chaharmahal & Bakhtiari', difficulty: 'Hard', bestSeason: 'May – Aug', duration: '2 days', description: 'The highest peak of the Zagros range in the heart of Bakhtiari land. Long snow cover, deep valleys and wild nature define this mountain.', image: 'images/peaks/zardkooh.jpg', link: 'peaks/zardkooh.html' },
        { name: 'Hezar', elevation: 4465, province: 'Kerman', difficulty: 'Hard', bestSeason: 'May – Sep', duration: '2 days', description: 'Southern Iran\'s highest peak with stunning views over the desert. A long ascent route but with unique scenery of Kerman\'s plains.', image: 'images/peaks/hezar.jpg', link: 'peaks/hezar.html' },
        { name: 'Dena', elevation: 4409, province: 'Kohgiluyeh & Boyer-Ahmad', difficulty: 'Moderate', bestSeason: 'Apr – Jul', duration: '2 days', description: 'The Lady of Iran\'s mountains with multiple summits and flower-filled valleys. Dena range boasts exceptional biodiversity and is among Iran\'s most beautiful highlands.', image: 'images/peaks/dena.jpg', link: 'peaks/dena.html' },
        { name: 'Oshtoran Kuh', elevation: 4150, province: 'Lorestan', difficulty: 'Moderate', bestSeason: 'May – Aug', duration: '2 days', description: 'Lorestan\'s camel-back mountain with green meadows and beautiful waterfalls. One of the highest Zagros peaks with crystal springs and pristine vegetation.', image: 'images/peaks/eshterankoh.jpg', link: 'peaks/eshterankoh.html' },
        { name: 'Shir Kuh', elevation: 4075, province: 'Yazd', difficulty: 'Moderate', bestSeason: 'Mar – May', duration: '1 day', description: 'Yazd province\'s highest peak rising from the desert. A unique mountain where summit snow contrasts beautifully with surrounding sands.', image: 'images/peaks/shirkoh.jpg', link: 'peaks/shirkoh.html' },
        { name: 'Tochal', elevation: 3933, province: 'Tehran', difficulty: 'Easy', bestSeason: 'All seasons', duration: '1 day', description: 'The nearest major peak to the capital, easily reached via Tochal telecabin. Tehran climbers\' favorite destination with city views.', image: 'images/peaks/tochal.jpg', link: 'peaks/tochal.html' },
        { name: 'Sahand', elevation: 3707, province: 'East Azerbaijan', difficulty: 'Moderate', bestSeason: 'Jul – Sep', duration: '1 day', description: 'A dormant volcano in Azerbaijan with colorful valleys and numerous springs. A wildflower paradise in spring and a popular ski area in winter.', image: 'images/peaks/sahand2.webp', link: 'peaks/sahand.html' },
        { name: 'Taftan', elevation: 4042, province: 'Sistan & Baluchestan', difficulty: 'Hard', bestSeason: 'Mar – May', duration: '2 days', description: 'Iran\'s only semi-active volcano in the southeast. Sulfur steam from the crater makes it one of the most unusual climbing destinations.', image: 'images/peaks/taftan.webp', link: 'peaks/taftan.html' },
        { name: 'Karkas', elevation: 3899, province: 'Isfahan', difficulty: 'Moderate', bestSeason: 'Mar – May', duration: '1 day', description: 'A popular peak for Isfahani climbers with easy access and views over Iran\'s central desert. On clear days the salt desert is visible from the summit.', image: 'images/peaks/karkas.webp', link: 'peaks/karkas.html' }
    ];

    var ROUTES_EN = [
        { name: 'Bargah-e Sevom Shelter', province: 'Mazandaran', range: 'Central Alborz', image: 'images/peaks/damavand.jpg', description: 'One of Iran\'s oldest and most famous shelters on Damavand\'s southern slope at 3,250 m.', history: 'Built in the 1960s by the Mountaineering Federation. Bargah-e Sevom has been the main base camp for Damavand ascents for decades.', capacity: 80, water: true, electricity: true },
        { name: 'Takht-e Fereydoun Shelter', province: 'Mazandaran', range: 'Central Alborz', image: 'images/peaks/alamkooh.jpg', description: 'A high-altitude Damavand shelter at 4,250 m — the last rest point before the final summit push.', history: 'Built in the 1970s and used ever since as the main base for summer and winter Damavand climbs.', capacity: 40, water: false, electricity: false },
        { name: 'Shirpala Shelter', province: 'Mazandaran', range: 'Central Alborz', image: 'images/peaks/sabalan.jpg', description: 'A shelter amid dense Alborz forests at 2,200 m — the first stop on the Alam Kuh route.', history: 'Over 60 years old, Shirpala has been renovated and expanded through the decades.', capacity: 60, water: true, electricity: true },
        { name: 'Alam Kuh Rock Shelter', province: 'Mazandaran', range: 'Central Alborz', image: 'images/peaks/tochal.jpg', description: 'A shelter on Alam Kuh\'s northern wall at 3,600 m, for expert mountaineers only.', history: null, capacity: 25, water: false, electricity: false },
        { name: 'Sabalan Shelter', province: 'Ardabil', range: 'Western Alborz', image: 'images/peaks/dena.jpg', description: 'Main Sabalan area shelter at 3,500 m with stunning views of the volcanic crater lake.', history: 'Built in the 1980s by Ardabil mountaineering club and renovated several times since.', capacity: 50, water: true, electricity: false },
        { name: 'Oshtoran Kuh Shelter', province: 'Lorestan', range: 'Central Zagros', image: 'images/peaks/zardkuh.jpg', description: 'Beautiful Oshtoran Kuh shelter at 3,000 m in the heart of Central Zagros.', history: 'Built by the federation in the 1990s to support climbers in Lorestan.', capacity: 35, water: true, electricity: true },
        { name: 'Tochal Shelter', province: 'Tehran', range: 'Central Alborz', image: 'images/peaks/tochal.jpg', description: 'The famous Tochal shelter at 3,550 m — one of Iran\'s busiest mountain huts.', history: 'Active since the 1970s and expanded over the years with improved facilities.', capacity: 100, water: true, electricity: true },
        { name: 'Zard Kuh Shelter', province: 'Chaharmahal & Bakhtiari', range: 'Central Zagros', image: 'images/peaks/zardkooh.jpg', description: 'Shelter on Zard Kuh\'s slopes at 3,200 m — gateway to the highest peak of Zagros.', history: null, capacity: 30, water: true, electricity: false }
    ];

    function isEn() {
        return global.I18n && global.I18n.isEn();
    }

    function t(key, vars) {
        return global.I18n ? global.I18n.t(key, vars) : key;
    }

    function localeNum(n) {
        return isEn() ? String(n) : Number(n).toLocaleString('fa-IR');
    }

    function diffLabel(fa) {
        if (!fa) return fa;
        return isEn() ? (DIFFICULTY_EN[fa] || fa) : fa;
    }

    function regionLabel(fa) {
        if (!fa) return fa;
        return isEn() ? (REGIONS_EN[fa] || fa) : fa;
    }

    function provinceLabel(fa) {
        if (!fa) return fa;
        return isEn() ? (PROVINCES_EN[fa] || fa) : fa;
    }

    function shelterNameEn(faName, type) {
        if (!faName || !isEn()) return faName;
        if (SHELTERS_EN && SHELTERS_EN[faName] && SHELTERS_EN[faName].name) {
            return SHELTERS_EN[faName].name;
        }
        if (faName.indexOf('پناهگاه ') === 0) return faName.slice(7) + ' Shelter';
        if (faName.indexOf('جانپناه ') === 0) return faName.slice(7) + ' Bivouac';
        if (faName.indexOf('کلبه ') === 0) return faName.slice(4) + ' Cabin';
        return faName;
    }

    function shelterTextEn(faName, field, fallback) {
        if (!isEn()) return fallback;
        if (SHELTERS_EN && SHELTERS_EN[faName] && SHELTERS_EN[faName][field]) {
            return SHELTERS_EN[faName][field];
        }
        if (field === 'description') {
            var kind = fallback && fallback.indexOf('جان') >= 0 ? 'bivouac' : 'shelter';
            return 'Mountain ' + kind + ' on Iranian climbing routes.';
        }
        return fallback;
    }

    function shelterDisplay(s) {
        if (!s || !isEn()) return s;
        return {
            name: shelterNameEn(s.name, s.type),
            province: provinceLabel(s.province),
            region: regionLabel(s.region),
            type: shelterTypeLabel(s.type),
            description: shelterTextEn(s.name, 'description', s.description),
            history: shelterTextEn(s.name, 'history', s.history),
            capacity: s.capacity,
            electricity: s.electricity,
            water: s.water,
            altitude: s.altitude,
            lat: s.lat,
            lng: s.lng,
            image: s.image
        };
    }

    function loadSheltersEn() {
        if (SHELTERS_EN) return Promise.resolve(SHELTERS_EN);
        var bp = /\/peaks\//.test(location.pathname) || /\/blog\//.test(location.pathname) ? '../' : '';
        return fetch(bp + 'data/shelters-en.json')
            .then(function (r) { return r.ok ? r.json() : {}; })
            .then(function (d) { SHELTERS_EN = d || {}; return SHELTERS_EN; })
            .catch(function () { SHELTERS_EN = {}; return SHELTERS_EN; });
    }

    function shelterTypeLabel(fa) {
        if (!fa) return fa;
        return isEn() ? (SHELTER_TYPE_EN[fa] || fa) : fa;
    }

    function peakBySlug(slug) {
        if (!PEAKS_EN || !slug) return null;
        return PEAKS_EN[slug] || null;
    }

    function peakName(m) {
        if (!m) return '';
        if (isEn() && m.slug && PEAKS_EN && PEAKS_EN[m.slug]) return PEAKS_EN[m.slug].name;
        if (isEn() && m.nameEn) return m.nameEn;
        return m.name;
    }

    function peakProvince(m) {
        if (!m) return '';
        if (isEn() && m.slug && PEAKS_EN && PEAKS_EN[m.slug]) return PEAKS_EN[m.slug].province;
        if (isEn() && m.provinceEn) return m.provinceEn;
        return m.province;
    }

    function loadPeaksEn() {
        if (PEAKS_EN) return Promise.resolve(PEAKS_EN);
        return fetch((function () {
            if (/\/peaks\//.test(location.pathname) || /\/blog\//.test(location.pathname)) return '../data/peaks-en.json';
            return 'data/peaks-en.json';
        })())
            .then(function (r) { return r.json(); })
            .then(function (data) { PEAKS_EN = data; return data; })
            .catch(function () { PEAKS_EN = {}; return PEAKS_EN; });
    }

    function enrichMountains(list) {
        return list.map(function (m) {
            var en = peakBySlug(m.slug);
            return Object.assign({}, m, {
                nameEn: en ? en.name : m.name,
                provinceEn: en ? en.province : m.province
            });
        });
    }

    global.ContentEn = {
        isEn: isEn,
        t: t,
        localeNum: localeNum,
        diffLabel: diffLabel,
        regionLabel: regionLabel,
        provinceLabel: provinceLabel,
        shelterTypeLabel: shelterTypeLabel,
        shelterDisplay: shelterDisplay,
        shelterNameEn: shelterNameEn,
        loadSheltersEn: loadSheltersEn,
        peakName: peakName,
        peakProvince: peakProvince,
        peakBySlug: peakBySlug,
        loadPeaksEn: loadPeaksEn,
        enrichMountains: enrichMountains,
        famousPeaksEn: FAMOUS_PEAKS_EN,
        routesEn: ROUTES_EN,
        regionsEn: REGIONS_EN
    };
})(window);
