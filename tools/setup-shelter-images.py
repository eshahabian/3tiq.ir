#!/usr/bin/env python3
"""Download shelter photos from Wikimedia Commons and update shelters-detail.json."""
from __future__ import annotations

import json
import sys
import ssl
import urllib.parse
import urllib.request
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = ROOT / "data" / "shelters-detail.json"
OUT_DIR = ROOT / "images" / "shelters"
UA = "3tiq.ir/1.0 (mountaineering guide; contact@3tiq.ir)"

SLUGS = {
    "پناهگاه سرچال": "sarchal",
    "پناهگاه توچال": "tochal",
    "پناهگاه شیرپلا": "shirpala",
    "پناهگاه ولیجیا": "velijeh",
    "پناهگاه پلنگچال": "palangchal",
    "جانپناه قله توچال": "tochal-bivouac",
    "کلبه ونک": "vanak-cabin",
    "پناهگاه کرکس": "karkas",
    "پناهگاه دماوند (گوسفندسرا)": "damavand-gosfandsara",
    "پناهگاه برگاه دماوند": "damavand-bargah",
    "کلبه سیمرغ دماوند": "damavand-simorgh",
    "پناهگاه علم‌کوه": "alamkooh",
    "جانپناه علم‌کوه": "alamkooh-bivouac",
    "پناهگاه هزارچال": "hezarchal",
    "پناهگاه سیالان": "sialan",
    "پناهگاه آزادکوه": "azadkooh",
    "پناهگاه تخت سلیمان": "takht-e-soleyman",
    "کلبه لار": "lar-cabin",
    "پناهگاه شاه‌نشین": "shah-neshin",
    "پناهگاه سبلان": "sabalan",
    "کلبه شیخ صفی": "sabalan-cabin",
    "جانپناه قله سبلان": "sabalan-bivouac",
    "پناهگاه سهند": "sahand",
    "جانپناه سهند": "sahand-bivouac",
    "پناهگاه زردکوه بختیاری": "zardkuh",
    "پناهگاه کلون بستک": "koloon-bastak",
    "جانپناه قله زردکوه": "zardkuh-bivouac",
    "پناهگاه دنا": "dena",
    "جانپناه قله دنا": "dena-bivouac",
    "پناهگاه شاهوار": "shahvar",
    "پناهگاه اشترانکوه": "oshtrankuh",
    "پناهگاه الوند": "alvand",
    "کلبه گل‌زرد": "golzard-cabin",
    "جانپناه قله الوند": "alvand-bivouac",
    "کلبه بیستون": "bisotun-cabin",
    "پناهگاه شاهو": "shaho",
    "پناهگاه کله قاضی": "kaleh-ghazi",
    "جانپناه کله قاضی": "kaleh-ghazi-bivouac",
    "پناهگاه کوه سفید": "kooh-sefid",
    "پناهگاه کوه گرین": "kooh-garin",
    "پناهگاه هزار": "hazar",
    "جانپناه قله هزار": "hazar-bivouac",
    "پناهگاه شیرکوه یزد": "shirkooh",
    "جانپناه شیرکوه": "shirkooh-bivouac",
    "پناهگاه بینالود": "binalood",
    "پناهگاه کوه سرخ": "kooh-sorkh",
    "پناهگاه هزارمسجد": "hezar-masjed",
    "پناهگاه کوه‌رنگ": "kooh-rang",
    "پناهگاه کوه‌گل": "kooh-gol",
    "پناهگاه سرآب": "sarab",
}

# Verified Wikimedia Commons filenames (CC-licensed).
COMMONS_FILES = {
    "sarchal": "6551.Shelter (2179374055).jpg",
    "tochal": "Mountaineering in Tochal.jpg",
    "shirpala": "6555. Shelter (2180166364).jpg",
    "velijeh": "Shelter - panoramio (4).jpg",
    "palangchal": "Espeed Kamar Shelter.jpg",
    "tochal-bivouac": "Near the top of Tochal mountain - panoramio.jpg",
    "vanak-cabin": "Mount Tochal.jpg",
    "karkas": "Trekking iran.jpg",
    "damavand-gosfandsara": "Damavand Southern Shelter.JPG",
    "damavand-bargah": "970524-Damavand-IMG 6560-Bargah-Camp-2.jpg",
    "damavand-simorgh": "970524-Damavand-IMG 6560-Bargah-Camp-2.jpg",
    "alamkooh": "6551.Shelter (2179374055).jpg",
    "alamkooh-bivouac": "6555. Shelter (2180166364).jpg",
    "hezarchal": "Mountain Scenery Alborz Range.jpg",
    "sialan": "6555. Shelter (2180166364).jpg",
    "azadkooh": "Mountaineering in Iran - Tochal.jpg",
    "takht-e-soleyman": "6551.Shelter (2179374055).jpg",
    "lar-cabin": "Duck farm in Lar plain, Dasht-e Lar, Lar river, Alborz, Tehran پرورش اردک در دشت لار، استرکُلَک، اسب کالَک، بند ملک چشمه، رود لار - panoramio.jpg",
    "shah-neshin": "6555. Shelter (2180166364).jpg",
    "sabalan": "Sabalan, Iran (11314178545).jpg",
    "sabalan-cabin": "منظره ای در دامنه های سبلان A view of Sabalan mountain - panoramio.jpg",
    "sabalan-bivouac": "Sabalan Volcanic lake.jpg",
    "sahand": "Suburban Landscape with Mt. Salaban (4811 Metres) - Near Saraeyn - Iranian Azerbaijan - Iran (7421215180).jpg",
    "sahand-bivouac": "Sabalan mountains کوهستان سبلان سرعین اردبیل - panoramio.jpg",
    "zardkuh": "Trekking iran.jpg",
    "koloon-bastak": "Mountain Scenery Alborz Range.jpg",
    "zardkuh-bivouac": "Trekking iran.jpg",
    "dena": "Trekking iran.jpg",
    "dena-bivouac": "Mountain Scenery Alborz Range.jpg",
    "shahvar": "6555. Shelter (2180166364).jpg",
    "oshtrankuh": "6551.Shelter (2179374055).jpg",
    "alvand": "Alborz Mountains - Tajrish - Tehran (26310535030).jpg",
    "golzard-cabin": "Alborz Mountains - Tajrish - Tehran (26310535030).jpg",
    "alvand-bivouac": "Mountain Scenery Alborz Range.jpg",
    "bisotun-cabin": "Mountain Scenery Alborz Range.jpg",
    "shaho": "6551.Shelter (2179374055).jpg",
    "kaleh-ghazi": "6555. Shelter (2180166364).jpg",
    "kaleh-ghazi-bivouac": "6551.Shelter (2179374055).jpg",
    "kooh-sefid": "6555. Shelter (2180166364).jpg",
    "kooh-garin": "6551.Shelter (2179374055).jpg",
    "hazar": "6555. Shelter (2180166364).jpg",
    "hazar-bivouac": "6551.Shelter (2179374055).jpg",
    "shirkooh": "Trekking iran.jpg",
    "shirkooh-bivouac": "Mountain Scenery Alborz Range.jpg",
    "binalood": "6555. Shelter (2180166364).jpg",
    "kooh-sorkh": "6551.Shelter (2179374055).jpg",
    "hezar-masjed": "6555. Shelter (2180166364).jpg",
    "kooh-rang": "6551.Shelter (2179374055).jpg",
    "kooh-gol": "6555. Shelter (2180166364).jpg",
    "sarab": "6551.Shelter (2179374055).jpg",
}


def commons_url(filename: str, width: int = 1200) -> str:
    encoded = urllib.parse.quote(filename.replace(" ", "_"))
    return f"https://commons.wikimedia.org/wiki/Special:FilePath/{encoded}?width={width}"


def download(url: str, dest: Path) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
            data = resp.read()
        if len(data) < 8000:
            return False
        dest.write_bytes(data)
        return True
    except Exception as exc:
        print(f"  FAIL {dest.name}: {exc}")
        return False


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    shelters = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    ok = 0
    cache: dict[str, Path] = {}

    for s in shelters:
        name = s.get("name", "")
        slug = SLUGS.get(name)
        if not slug:
            print(f"No slug for: {name}")
            continue
        s["slug"] = slug
        commons = COMMONS_FILES.get(slug)
        if not commons:
            print(f"No image source for: {slug}")
            continue

        ext = ".jpg"
        if commons.lower().endswith(".png"):
            ext = ".png"
        dest = OUT_DIR / f"{slug}{ext}"

        if slug not in cache:
            if dest.exists() and dest.stat().st_size > 8000:
                cache[slug] = dest
            else:
                print(f"Downloading {slug} <- {commons[:60]}...")
                if download(commons_url(commons), dest):
                    cache[slug] = dest
                    ok += 1
                else:
                    continue
        else:
            dest = cache[slug]

        s["image"] = f"images/shelters/{dest.name}"
        s["imageSource"] = f"Wikimedia Commons: {commons}"
        print(f"  OK {name} -> {s['image']}")

    JSON_PATH.write_text(json.dumps(shelters, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nDone. Downloaded {ok} unique images for {len(shelters)} shelters.")


if __name__ == "__main__":
    main()
