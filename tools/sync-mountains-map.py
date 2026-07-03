# -*- coding: utf-8 -*-
"""Sync js/mountains.json with route-map summit coords and peak slugs."""
import json
import glob
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPS_DIR = os.path.join(ROOT, 'data', 'route-maps')
MOUNTAINS_PATH = os.path.join(ROOT, 'js', 'mountains.json')
ALIASES_PATH = os.path.join(ROOT, 'data', 'mountain-slug-aliases.json')

def normalize(s):
    if not s:
        return ''
    return s.replace('\u200c', '').replace(' ', '').strip().lower()

# Load peaks from route-maps
peak_by_norm = {}
peak_by_slug = {}
for path in glob.glob(os.path.join(MAPS_DIR, '*.json')):
    with open(path, encoding='utf-8') as f:
        j = json.load(f)
    lat = lng = None
    if j.get('summit'):
        lat = float(j['summit']['lat'])
        lng = float(j['summit']['lng'])
    elif j.get('center'):
        lat = float(j['center'][0])
        lng = float(j['center'][1])
    if lat is None:
        continue
    entry = {
        'slug': j['peakId'],
        'name': j['peakName'],
        'lat': round(lat, 4),
        'lng': round(lng, 4),
        'height': int(j.get('peakElevation', 0)),
    }
    peak_by_slug[j['peakId']] = entry
    peak_by_norm[normalize(j['peakName'])] = entry

aliases = {}
if os.path.exists(ALIASES_PATH):
    with open(ALIASES_PATH, encoding='utf-8') as f:
        for row in json.load(f):
            aliases[normalize(row['name'])] = row['slug']

with open(MOUNTAINS_PATH, encoding='utf-8') as f:
    mountains = json.load(f)

out = []
seen_slugs = set()
updated = 0

for m in mountains:
    norm = normalize(m['name'])
    slug = None
    if norm in peak_by_norm:
        slug = peak_by_norm[norm]['slug']
    elif norm in aliases:
        slug = aliases[norm]

    if slug and slug in peak_by_slug:
        p = peak_by_slug[slug]
        if slug in seen_slugs:
            item = {
                'name': m['name'],
                'lat': m['lat'],
                'lng': m['lng'],
                'height': m['height'],
                'province': m.get('province', ''),
            }
        else:
            item = {
                'name': p['name'],
                'lat': p['lat'],
                'lng': p['lng'],
                'height': p['height'],
                'province': m.get('province', ''),
                'slug': slug,
            }
            if m.get('lat') != p['lat'] or m.get('lng') != p['lng'] or m.get('height') != p['height']:
                updated += 1
            seen_slugs.add(slug)
    else:
        item = {
            'name': m['name'],
            'lat': m['lat'],
            'lng': m['lng'],
            'height': m['height'],
            'province': m.get('province', ''),
        }
    out.append(item)

province_guess = {
    'damavand': 'مازندران/تهران', 'alamkooh': 'مازندران', 'sabalan': 'اردبیل',
    'zardkooh': 'چهارمحال و بختیاری', 'tochal': 'تهران', 'dena': 'کهگیلویه و بویراحمد',
    'hezar': 'کرمان', 'taftan': 'سیستان و بلوچستان', 'sahand': 'آذربایجان شرقی',
    'karkas': 'یزد', 'shirkoh': 'یزد', 'eshterankoh': 'لرستان', 'kahar': 'قم/مرکزی',
}

for slug, p in sorted(peak_by_slug.items(), key=lambda x: -x[1]['height']):
    if slug in seen_slugs:
        continue
    out.append({
        'name': p['name'],
        'lat': p['lat'],
        'lng': p['lng'],
        'height': p['height'],
        'province': province_guess.get(slug, 'ایران'),
        'slug': slug,
    })
    seen_slugs.add(slug)

with open(MOUNTAINS_PATH, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

linked = sum(1 for x in out if 'slug' in x)
print(f'Mountains: {len(out)} total, {linked} linked, {updated} coords corrected')
