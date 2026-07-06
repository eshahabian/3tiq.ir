#!/usr/bin/env python3
"""Download CC-licensed peak photos for Western Alborz range page."""
from __future__ import annotations

import ssl
import sys
import urllib.parse
import urllib.request
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "images" / "peaks"
UA = "3tiq.ir/1.0 (mountaineering guide; contact@3tiq.ir)"

# slug -> Wikimedia Commons filename
PEAKS = {
    "sialan": "Mount Sialan 01.jpg",
    "khashchal": "Sialan peak and hut.jpg",
    "shahmoallem": "Alborz mountains, Gilan, Iran (42412091274).jpg",
    "darfak": "Gilan - Deylaman - Espeyli - panoramio.jpg",
    "samamos": "Gilan - Deylaman - panoramio (3).jpg",
    "espinas": "Azad Kuh - panoramio.jpg",
    "boghroudagh": "Alborz Mountains, Iran - 4012033843.jpg",
    "asmankooh": "Sialan Mountain.jpg",
}


def commons_url(filename: str, width: int = 1200) -> str:
    encoded = urllib.parse.quote(filename.replace(" ", "_"))
    return f"https://commons.wikimedia.org/wiki/Special:FilePath/{encoded}?width={width}"


def download(url: str, dest: Path) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=90) as resp:
            data = resp.read()
        if len(data) < 5000:
            print(f"  too small: {dest.name} ({len(data)} bytes)")
            return False
        dest.write_bytes(data)
        return True
    except Exception as exc:
        print(f"  FAIL {dest.name}: {exc}")
        return False


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ok = 0
    for slug, commons in PEAKS.items():
        dest = OUT_DIR / f"{slug}.jpg"
        if dest.exists() and dest.stat().st_size > 5000:
            print(f"skip {slug} (exists)")
            ok += 1
            continue
        print(f"Downloading {slug} <- {commons}")
        if download(commons_url(commons), dest):
            print(f"  OK -> {dest.name} ({dest.stat().st_size // 1024} KB)")
            ok += 1
    print(f"\nDone: {ok}/{len(PEAKS)} images ready.")


if __name__ == "__main__":
    main()
