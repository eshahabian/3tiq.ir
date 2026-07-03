# -*- coding: utf-8 -*-
"""Build data/peak-access-cities-cache.json via Nominatim reverse geocoding."""
import json
import glob
import os
import re
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPS_DIR = os.path.join(ROOT, 'data', 'route-maps')
OUT_PATH = os.path.join(ROOT, 'data', 'peak-access-cities-cache.json')
UA = '3tiq-tour-planner/1.0 (contact@3tiq.ir)'


def access_coord(route_map):
    summit = route_map.get('summit') or {}
    for route in route_map.get('routes') or []:
        if route.get('type') == 'access':
            coords = route.get('coordinates') or []
            if coords:
                return coords[0].get('lat'), coords[0].get('lng')
    for route in route_map.get('routes') or []:
        coords = route.get('coordinates') or []
        if coords:
            return coords[0].get('lat'), coords[0].get('lng')
    return summit.get('lat'), summit.get('lng')


def pick_place(address, name):
    for key in ('village', 'town', 'city', 'suburb', 'hamlet', 'county'):
        val = address.get(key)
        if not val:
            continue
        if key == 'city' and val.startswith('دهستان'):
            continue
        return val
    return name


def reverse_geocode(lat, lng):
    url = (
        f'https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}'
        f'&format=json&accept-language=fa&zoom=14'
    )
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    address = data.get('address') or {}
    place = pick_place(address, data.get('name') or '')
    county = address.get('county', '')
    if county and place and county not in place:
        return f'{place} ({county.replace("شهرستان ", "")})'
    return place


def main():
    cache = {}
    if os.path.isfile(OUT_PATH):
        with open(OUT_PATH, encoding='utf-8') as f:
            cache = json.load(f)

    paths = sorted(glob.glob(os.path.join(MAPS_DIR, '*.json')))
    for i, path in enumerate(paths):
        with open(path, encoding='utf-8') as f:
            j = json.load(f)
        slug = j['peakId']
        if slug in cache:
            continue
        lat, lng = access_coord(j)
        if lat is None or lng is None:
            continue
        try:
            place = reverse_geocode(lat, lng)
            if place:
                cache[slug] = [place]
                print(f'[{i+1}/{len(paths)}] {slug}: OK')
        except Exception as exc:
            print(f'[{i+1}/{len(paths)}] {slug}: ERROR {exc}')
        time.sleep(1.15)

    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)
    print(f'Wrote {len(cache)} entries to {OUT_PATH}')


if __name__ == '__main__':
    main()
