# -*- coding: utf-8 -*-
"""Generate data/tour-planner-peaks.json from route-maps + peak pages + city cache."""
import json
import glob
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPS_DIR = os.path.join(ROOT, 'data', 'route-maps')
PEAKS_DIR = os.path.join(ROOT, 'peaks')
MOUNTAINS_PATH = os.path.join(ROOT, 'js', 'mountains.json')
CACHE_PATH = os.path.join(ROOT, 'data', 'peak-access-cities-cache.json')
OUT_PATH = os.path.join(ROOT, 'data', 'tour-planner-peaks.json')

SKIP_LABELS = {'Start', 'Summit', 'Summit Point', 'Camp', 'Base', 'قله'}
GENERIC_ROUTE_WORDS = {
    'اصلی', 'شمالی', 'جنوبی', 'شرقی', 'غربی', 'جنگلی', 'کوتاه', 'بلند', 'سنگین',
    'تله\u200cکابین', 'پیاده\u200cروی', 'استاندارد', 'کلاسیک', 'مستقیم', 'جایگزین',
}
GENERIC_PAREN = {'مسیر', 'مسیر اصلی', 'مسیر شمالی', 'مسیر جنوبی'}

MANUAL = {
    'damavand': {
        'difficulty': 'سخت', 'minLevel': 'متوسط', 'bestSeason': 'تیر - شهریور', 'minDays': 2,
        'route': 'مسیر جنوبی (رینه) — کلاسیک‌ترین مسیر صعود',
        'startCities': ['رینه', 'پلور', 'دشت لار'],
        'shelters': ['پناهگاه برگ جهان (۳۲۵۰m)', 'پناهگاه بارگاه سوم (۴۲۵۰m)'],
    },
    'alamkooh': {
        'difficulty': 'خیلی‌سخت', 'minLevel': 'حرفه‌ای', 'bestSeason': 'مرداد - شهریور', 'minDays': 2,
        'route': 'مسیر هاسک‌چال — دیواره شمالی',
        'startCities': ['واریان', 'کلاردشت (هاسک‌چال)'],
        'shelters': ['پناهگاه شیرپلا (۲۲۰۰m)', 'پناهگاه صخره‌ای (۳۶۰۰m)'],
    },
    'sabalan': {
        'difficulty': 'متوسط', 'minLevel': 'مبتدی', 'bestSeason': 'تیر - مرداد', 'minDays': 1,
        'route': 'مسیر شمالی (شهرستان مشگین)',
        'startCities': ['مشگین‌شهر', 'لاهرود'],
        'shelters': ['پناهگاه سبلان (۳۵۰۰m)'],
    },
    'zardkooh': {
        'difficulty': 'سخت', 'minLevel': 'متوسط', 'bestSeason': 'خرداد - مرداد', 'minDays': 2,
        'route': 'مسیر چل‌گردان — از منطقه کوهرنگ',
        'startCities': ['چلگرد', 'شهرکرد'],
        'shelters': ['پناهگاه زردکوه (۳۲۰۰m)'],
    },
    'dena': {
        'difficulty': 'متوسط', 'minLevel': 'مبتدی', 'bestSeason': 'اردیبهشت - تیر', 'minDays': 2,
        'route': 'مسیر سی‌سخت — قله بیشتر',
        'startCities': ['سی‌سخت', 'یاسوج'],
        'shelters': ['کلبه کوهپیمایی سی‌سخت'],
    },
    'eshterankoh': {
        'difficulty': 'متوسط', 'minLevel': 'مبتدی', 'bestSeason': 'خرداد - مرداد', 'minDays': 2,
        'route': 'مسیر دره‌گل — از شهر ازنا',
        'startCities': ['ازنا', 'الیگودرز'],
        'shelters': ['پناهگاه اشترانکوه (۳۰۰۰m)'],
    },
    'tochal': {
        'difficulty': 'آسان', 'minLevel': 'مبتدی', 'bestSeason': 'همه فصل', 'minDays': 1,
        'route': 'مسیر دربند یا تله‌کابین + پیاده‌روی',
        'startCities': ['تهران (دربند)', 'تهران (درکه)', 'تهران (تله‌کابین توچال)'],
        'shelters': ['پناهگاه توچال (۳۹۰۰m)'],
    },
    'sahand': {
        'difficulty': 'متوسط', 'minLevel': 'مبتدی', 'bestSeason': 'تیر - شهریور', 'minDays': 1,
        'route': 'مسیر پیاده‌روی از پیست اسکی',
        'startCities': ['تبریز', 'پیست اسکی سهند'],
        'shelters': ['کلبه‌های منطقه اسکی'],
    },
    'karkas': {
        'difficulty': 'متوسط', 'minLevel': 'مبتدی', 'bestSeason': 'فروردین - خرداد', 'minDays': 1,
        'route': 'مسیر دشت‌کوه — از نطنز',
        'startCities': ['نطنز'],
        'shelters': ['بدون پناهگاه — صعود روزانه'],
    },
    'taftan': {
        'difficulty': 'سخت', 'minLevel': 'متوسط', 'bestSeason': 'اسفند - اردیبهشت', 'minDays': 2,
        'route': 'مسیر جنوبی — از خاش',
        'startCities': ['خاش'],
        'shelters': ['کمپ پایگاه (بدون پناهگاه مجهز)'],
    },
    'shirkoh': {
        'difficulty': 'متوسط', 'minLevel': 'مبتدی', 'bestSeason': 'فروردین - خرداد', 'minDays': 1,
        'route': 'مسیر شیرکوه — از مهریز',
        'startCities': ['مهریز', 'یزد'],
        'shelters': ['بدون پناهگاه — صعود روزانه'],
    },
    'hezar': {
        'difficulty': 'سخت', 'minLevel': 'متوسط', 'bestSeason': 'خرداد - شهریور', 'minDays': 2,
        'route': 'مسیر هزار — از بافت',
        'startCities': ['بافت', 'کرمان'],
        'shelters': ['کمپ میانی مسیر'],
    },
    'naz': {
        'startCities': ['نارنج‌بنه (لاریجان)', 'آمل'],
    },
    'kolakchal': {
        'startCities': ['تهران (دریاچه چیتگر)', 'فشم'],
    },
    'varjin': {
        'startCities': ['تهران (فشم)', 'لواسان'],
    },
    'palangchal': {
        'startCities': ['تهران (شمشک)', 'دماوند (گیلاوند)'],
    },
}


def infer_meta(elevation, slug):
    if slug in ('tochal', 'karkas', 'qalat', 'jahanama'):
        return 'آسان', 'مبتدی', 1, 'همه فصل'
    if elevation >= 5000:
        return 'خیلی‌سخت', 'حرفه‌ای', 2, 'تیر - شهریور'
    if elevation >= 4800:
        return 'خیلی‌سخت', 'حرفه‌ای', 2, 'مرداد - شهریور'
    if elevation >= 4500:
        return 'سخت', 'متوسط', 2, 'تیر - شهریور'
    if elevation >= 4000:
        return 'سخت', 'متوسط', 2, 'خرداد - مرداد'
    if elevation >= 3500:
        return 'متوسط', 'مبتدی', 1, 'تیر - شهریور'
    return 'متوسط', 'مبتدی', 1, 'بهار - تابستان'


def main_route(routes):
    for r in routes or []:
        if r.get('type') == 'main':
            return r.get('name', 'مسیر اصلی صعود')
    if routes:
        return routes[0].get('name', 'مسیر صعود')
    return 'مسیر اصلی صعود'


def fmt_shelters(shelters):
    out = []
    for s in shelters or []:
        name = s.get('name', 'پناهگاه')
        elev = s.get('elevation')
        if elev:
            out.append(f"{name} ({elev}m)")
        else:
            out.append(name)
    return out or ['اطلاعات پناهگاه در صفحه قله']


def from_paren(text):
    found = []
    for m in re.finditer(r'\(([^)]+)\)', text):
        val = m.group(1).strip()
        if val and val not in GENERIC_PAREN and len(val) < 35:
            found.append(val)
    return found


def from_desc(text):
    found = []
    patterns = [
        r'از (?:شهر|روستای|روستا|منطقه|سمت)\s+([^.\،]+)',
        r'مسیر از (?:شهر\s+)?([^.\،]+)',
        r'صعود از (?:روستای|شهر|منطقه)\s+([^.\،]+)',
    ]
    for pat in patterns:
        for m in re.finditer(pat, text):
            val = m.group(1).strip()
            if len(val) < 30 and not re.match(r'^(شمال|جنوب|شرق|غرب|میان|طریق)', val):
                found.append(val)
    return found


def from_route_name(name):
    found = []
    found.extend(from_paren(name))
    m = re.match(r'^مسیر\s+(.+)$', name.strip())
    if m:
        tail = m.group(1).strip()
        if tail not in GENERIC_ROUTE_WORDS and not re.match(r'^(شمالی|جنوبی|شرقی|غربی)', tail):
            if len(tail) < 25:
                found.append(tail)
    return found


def from_route_text(text):
    found = []
    for m in re.finditer(r'(?:^|[—\-–]\s*)از\s+([^.\،—]+)', text):
        val = m.group(1).strip()
        if len(val) < 30:
            found.append(val)
    found.extend(from_paren(text))
    return found


def labels_from_map(route_map):
    labels = []
    for route in route_map.get('routes') or []:
        coords = route.get('coordinates') or []
        if not coords:
            continue
        lbl = coords[0].get('label')
        if lbl and lbl not in SKIP_LABELS and re.search(r'[\u0600-\u06FF]', lbl):
            labels.append(lbl)
        rname = route.get('name') or ''
        labels.extend(from_paren(rname))
    return labels


def parse_peak_html(slug):
    path = os.path.join(PEAKS_DIR, f'{slug}.html')
    if not os.path.isfile(path):
        return [], []
    html = open(path, encoding='utf-8').read()
    names = re.findall(r'class="route-name">([^<]+)', html)
    descs = re.findall(r'class="route-desc">([^<]+)', html)
    cities = []
    for n in names:
        cities.extend(from_route_name(n))
    for d in descs:
        cities.extend(from_desc(d))
    return names, cities


def dedupe_cities(items):
    seen = set()
    out = []
    for item in items:
        key = item.strip()
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(key)
    return out


def extract_start_cities(slug, route_map, manual):
    cities = []
    if manual.get('startCities'):
        cities.extend(manual['startCities'])
    route_str = manual.get('route') or main_route(route_map.get('routes'))
    cities.extend(from_route_text(route_str))
    _, html_cities = parse_peak_html(slug)
    cities.extend(html_cities)
    cities.extend(labels_from_map(route_map))
    return dedupe_cities(cities)


def access_point(route_map):
    summit = route_map.get('summit') or {}
    lat = summit.get('lat')
    lng = summit.get('lng')
    for route in route_map.get('routes') or []:
        if route.get('type') == 'access':
            coords = route.get('coordinates') or []
            if coords:
                return coords[0].get('lat', lat), coords[0].get('lng', lng), lat, lng
    for route in route_map.get('routes') or []:
        coords = route.get('coordinates') or []
        if coords:
            return coords[0].get('lat', lat), coords[0].get('lng', lng), lat, lng
    return lat, lng, lat, lng


city_cache = {}
if os.path.isfile(CACHE_PATH):
    with open(CACHE_PATH, encoding='utf-8') as f:
        city_cache = json.load(f)

province_by_slug = {}
coords_by_slug = {}
with open(MOUNTAINS_PATH, encoding='utf-8') as f:
    for m in json.load(f):
        if m.get('slug'):
            province_by_slug[m['slug']] = m.get('province', 'ایران')
            coords_by_slug[m['slug']] = (m.get('lat'), m.get('lng'))

peaks = []
for path in sorted(glob.glob(os.path.join(MAPS_DIR, '*.json'))):
    with open(path, encoding='utf-8') as f:
        j = json.load(f)
    slug = j['peakId']
    elev = int(j.get('peakElevation', 0))
    manual = MANUAL.get(slug, {})
    diff, level, days, season = infer_meta(elev, slug)

    start_cities = extract_start_cities(slug, j, manual)
    if not start_cities and slug in city_cache:
        cached = city_cache[slug]
        if isinstance(cached, list):
            start_cities = cached
        elif isinstance(cached, str):
            start_cities = [cached]

    acc_lat, acc_lng, sum_lat, sum_lng = access_point(j)
    mlat, mlng = coords_by_slug.get(slug, (None, None))
    lat = sum_lat or mlat or acc_lat
    lng = sum_lng or mlng or acc_lng

    entry = {
        'slug': slug,
        'name': j['peakName'],
        'elevation': elev,
        'province': province_by_slug.get(slug, 'ایران'),
        'difficulty': manual.get('difficulty', diff),
        'minLevel': manual.get('minLevel', level),
        'bestSeason': manual.get('bestSeason', season),
        'minDays': manual.get('minDays', days),
        'route': manual.get('route', main_route(j.get('routes'))),
        'startCities': start_cities,
        'shelters': manual.get('shelters', fmt_shelters(j.get('shelters'))),
        'link': f'peaks/{slug}.html',
        'lat': lat,
        'lng': lng,
    }
    peaks.append(entry)

peaks.sort(key=lambda p: (-p['elevation'], p['name']))

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(peaks, f, ensure_ascii=False, indent=2)

missing = [p['slug'] for p in peaks if not p['startCities']]
print(f'Wrote {len(peaks)} peaks to {OUT_PATH}')
print(f'With start cities: {len(peaks) - len(missing)}')
if missing:
    print(f'Missing start cities ({len(missing)}): {", ".join(missing[:15])}...')
