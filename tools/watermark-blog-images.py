#!/usr/bin/env python3
"""Add full-page + corner @3tiq.ir watermark to blog images."""
from __future__ import annotations

import argparse
import math
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
BLOG_IMG_DIR = ROOT / "images" / "blog"
LOGO_PATH = ROOT / "logo.png"

LINE1 = "@3tiq.ir"
LINE2 = "3tiq.ir"
TILE_TEXT = "سه تیغ  ·  3tiq.ir"


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for name in ("arialbd.ttf", "arial.ttf", "segoeuib.ttf", "segoeui.ttf"):
        path = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts" / name
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def text_size(draw: ImageDraw.ImageDraw, text: str, font) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def add_tiled_watermark(overlay: Image.Image, w: int, h: int) -> None:
    """Diagonal repeating site name across the whole image."""
    font = load_font(max(26, w // 22))
    tile = Image.new("RGBA", (w * 2, h * 2), (0, 0, 0, 0))
    tdraw = ImageDraw.Draw(tile)
    tw, th = text_size(tdraw, TILE_TEXT, font)
    step_x = tw + max(60, w // 12)
    step_y = th + max(50, h // 10)
    for row in range(-2, (h * 2) // step_y + 4):
        for col in range(-2, (w * 2) // step_x + 4):
            x = col * step_x + (row % 2) * (step_x // 2)
            y = row * step_y
            tdraw.text((x, y), TILE_TEXT, font=font, fill=(255, 255, 255, 42))
    tile = tile.rotate(32, expand=False, center=(w, h))
    crop = tile.crop((w // 2, h // 2, w // 2 + w, h // 2 + h))
    overlay.alpha_composite(crop)


def watermark_image(src: Path, dst: Path | None = None) -> Path:
    dst = dst or src
    base = Image.open(src).convert("RGBA")
    w, h = base.size

    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    add_tiled_watermark(overlay, w, h)
    draw = ImageDraw.Draw(overlay)

    font_main = load_font(max(22, w // 38))
    font_sub = load_font(max(16, w // 52))
    pad = max(10, w // 90)
    gap = max(4, h // 200)

    w1, h1 = text_size(draw, LINE1, font_main)
    w2, h2 = text_size(draw, LINE2, font_sub)
    box_w = max(w1, w2) + pad * 2
    box_h = h1 + h2 + pad * 2 + gap

    logo_w = 0
    logo_img = None
    if LOGO_PATH.exists():
        logo_img = Image.open(LOGO_PATH).convert("RGBA")
        target_h = int(box_h * 0.85)
        ratio = target_h / logo_img.height
        logo_w = int(logo_img.width * ratio)
        logo_img = logo_img.resize((logo_w, target_h), Image.Resampling.LANCZOS)
        box_w += logo_w + pad

    x0 = w - box_w - pad * 2
    y0 = h - box_h - pad * 2
    x1 = w - pad * 2
    y1 = h - pad * 2

    draw.rounded_rectangle(
        (x0, y0, x1, y1),
        radius=max(8, w // 120),
        fill=(20, 16, 12, 185),
    )

    tx = x0 + pad
    ty = y0 + pad
    if logo_img:
        ly = y0 + (box_h - logo_img.height) // 2
        overlay.paste(logo_img, (tx, ly), logo_img)
        tx += logo_w + pad

    draw.text((tx, ty), LINE1, font=font_main, fill=(255, 255, 255, 245))
    draw.text((tx, ty + h1 + gap), LINE2, font=font_sub, fill=(210, 200, 185, 230))

    mark_font = load_font(max(18, w // 55))
    draw.text((pad * 2, pad * 2), "سه تیغ", font=mark_font, fill=(255, 255, 255, 120))

    merged = Image.alpha_composite(base, overlay).convert("RGB")
    merged.save(dst, format="PNG", optimize=True)
    return dst


def main() -> int:
    parser = argparse.ArgumentParser(description="Watermark blog images with @3tiq.ir")
    parser.add_argument("paths", nargs="*", help="Image files (default: all in images/blog)")
    args = parser.parse_args()

    if args.paths:
        files = [Path(p) for p in args.paths]
    else:
        files = sorted(BLOG_IMG_DIR.glob("*.png"))

    if not files:
        print("No images found.", file=sys.stderr)
        return 1

    for fp in files:
        if not fp.exists():
            print(f"Skip missing: {fp}", file=sys.stderr)
            continue
        watermark_image(fp)
        print(f"Watermarked: {fp.relative_to(ROOT)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
