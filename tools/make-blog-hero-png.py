#!/usr/bin/env python3
"""Copy a source photo into images/blog/{id}.png and watermark it."""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("wm", ROOT / "tools" / "watermark-blog-images.py")
wm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(wm)


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: python tools/make-blog-hero-png.py <source> <blog-id>", file=sys.stderr)
        return 1
    src = Path(sys.argv[1])
    blog_id = sys.argv[2]
    dst = ROOT / "images" / "blog" / f"{blog_id}.png"
    if not src.exists():
        print(f"Missing source: {src}", file=sys.stderr)
        return 1
    dst.parent.mkdir(parents=True, exist_ok=True)
    Image.open(src).convert("RGB").save(dst, format="PNG", optimize=True)
    wm.watermark_image(dst.resolve())
    print(f"Created {dst.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
