# -*- coding: utf-8 -*-
"""Generate data/tour-planner-peaks.json from route-maps + mountains.json."""
import json
import glob
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPS_DIR = os.path.join(ROOT, 'data', 'route-maps')
MOUNTAINS_PATH = os.path.join(ROOT, 'js', 'mountains.json')
OUT_PATH = os.path.join(ROOT, 'data', 'tour-planner-peaks.json')

MANUAL = {
    'damavand': {
        'difficulty': 'سخت', 'minLevel': 'متوسط', 'bestSeason': 'تیر - شهریور', 'minDays': 2,
        'route': 'مسیر جنوبی (رینه) — کلاسیک‌ترین مسیر صعود',
        'shelters': ['پناهگاه برگ جهان (۳۲۵۰m)', 'پناهگاه بارگاه سوم (۴۲۵۰m)'],
    },
    'alamkooh': {
        'difficulty': 'خیلی‌سخت', 'minLevel': 'حرفه‌ای', 'bestSeason': 'مرداد - شهریور', 'minDays': 2,
        'route': 'مسیر هاسک‌چال — دیواره شمالی',
        'shelters': ['پناهگاه شیرپلا (۲۲۰۰m)', 'پناهگاه صخره‌ای (۳۶۰۰m)'],
    },
    'sabalan': {
        'difficulty': 'متوسط', 'minLevel': 'مبتدی', 'bestSeason': 'تیر - مرداد', 'minDays': 1,
        'route': 'مسیر شمالی (شهرستان مشگین)',
        'shelters': ['پناهگاه سبلان (۳۵۰۰m)'],
    },
    'zardkooh': {
        'difficulty': 'سخت', 'minLevel': 'متوسط', 'bestSeason': 'خرداد - مرداد', 'minDays': 2,
        'route': 'مسیر چل‌گردان — از منطقه کوهرنگ',
        'shelters': ['پناهگاه زردکوه (۳۲۰۰m)'],
    },
    'dena': {
        'difficulty': 'متوسط', 'minLevel': 'مبتدی', 'bestSeason': 'اردیبهشت - تیر', 'minDays': 2,
        'route': 'مسیر سی‌سخت — قله بیشتر',
        'shelters': ['کلبه کوهپیمایی سی‌سخت'],
    },
    'eshterankoh': {
        'difficulty': 'متوسط', 'minLevel': 'مبتدی', 'bestSeason': 'خرداد - مرداد', 'minDays': 2,
        'route': 'مسیر دره‌گل — از شهر ازنا',
        'shelters': ['پناهگاه اشترانکوه (۳۰۰۰m)'],
    },
    'tochal': {
        'difficulty': 'آسان', 'minLevel': 'مبتدی', 'bestSeason': 'همه فصل', 'minDays': 1,
        'route': 'مسیر دربند یا تله‌کابین + پیاده‌روی',
        'shelters': ['پناهگاه توچال (۳۹۰۰m)'],
    },
    'sahand': {
        'difficulty': 'متوسط', 'minLevel': 'مبتدی', 'bestSeason': 'تیر - شهریور', 'minDays': 1,
        'route': 'مسیر پیاده‌روی از پیست اسکی',
        'shelters': ['کلبه‌های منطقه اسکی'],
    },
    'karkas': {
        'difficulty': 'متوسط', 'minLevel': 'مبتدی', 'bestSeason': 'فروردین - خرداد', 'minDays': 1,
        'route': 'مسیر دشت‌کوه — از نطنز',
        'shelters': ['بدون پناهگاه — صعود روزانه'],
    },
    'taftan': {
        'difficulty': 'سخت', 'minLevel': 'متوسط', 'bestSeason': 'اسفند - اردیبهشت', 'minDays': 2,
        'route': 'مسیر جنوبی — از خاش',
        'shelters': ['کمپ پایگاه (بدون پناهگاه مجهز)'],
    },
    'shirkoh': {
        'difficulty': 'متوسط', 'minLevel': 'مبتدی', 'bestSeason': 'فروردین - خرداد', 'minDays': 1,
        'route': 'مسیر شیرکوه — از مهریز',
        'shelters': ['بدون پناهگاه — صعود روزانه'],
    },
    'hezar': {
        'difficulty': 'سخت', 'minLevel': 'متوسط', 'bestSeason': 'خرداد - شهریور', 'minDays': 2,
        'route': 'مسیر هزار — از بافت',
        'shelters': ['کمپ میانی مسیر'],
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


province_by_slug = {}
with open(MOUNTAINS_PATH, encoding='utf-8') as f:
    for m in json.load(f):
        if m.get('slug'):
            province_by_slug[m['slug']] = m.get('province', 'ایران')

peaks = []
for path in sorted(glob.glob(os.path.join(MAPS_DIR, '*.json'))):
    with open(path, encoding='utf-8') as f:
        j = json.load(f)
    slug = j['peakId']
    elev = int(j.get('peakElevation', 0))
    manual = MANUAL.get(slug, {})
    diff, level, days, season = infer_meta(elev, slug)

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
        'shelters': manual.get('shelters', fmt_shelters(j.get('shelters'))),
        'link': f'peaks/{slug}.html',
    }
    peaks.append(entry)

peaks.sort(key=lambda p: (-p['elevation'], p['name']))

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(peaks, f, ensure_ascii=False, indent=2)

print(f'Wrote {len(peaks)} peaks to {OUT_PATH}')
