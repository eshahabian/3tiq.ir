#!/usr/bin/env python3
"""Watermark image with tiled + corner 3tiq.ir only."""
from __future__ import annotations

import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

TILE_TEXT = "3tiq.ir"


def load_font(size: int):
    for name in ("arialbd.ttf", "arial.ttf", "segoeuib.ttf", "segoeui.ttf"):
        path = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts" / name
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def text_size(draw: ImageDraw.ImageDraw, text: str, font) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def watermark(src: Path) -> None:
    base = Image.open(src).convert("RGBA")
    w, h = base.size
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))

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
    overlay.alpha_composite(tile.crop((w // 2, h // 2, w // 2 + w, h // 2 + h)))

    draw = ImageDraw.Draw(overlay)
    font_c = load_font(max(20, w // 42))
    pad = max(10, w // 90)
    tw, th = text_size(draw, TILE_TEXT, font_c)
    x0 = w - tw - pad * 3
    y0 = h - th - pad * 3
    x1 = w - pad * 2
    y1 = h - pad * 2
    draw.rounded_rectangle((x0, y0, x1, y1), radius=max(8, w // 120), fill=(20, 16, 12, 185))
    draw.text((x0 + pad, y0 + pad), TILE_TEXT, font=font_c, fill=(255, 255, 255, 245))

    Image.alpha_composite(base, overlay).convert("RGB").save(src, format="PNG", optimize=True)


if __name__ == "__main__":
    for path in sys.argv[1:]:
        p = Path(path)
        if not p.exists():
            print(f"Skip missing: {p}", file=sys.stderr)
            continue
        watermark(p)
        print(f"Watermarked: {p}")
