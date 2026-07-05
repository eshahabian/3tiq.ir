#!/usr/bin/env python3
"""Inject i18n-boot.js + i18n.css into all site HTML pages."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {'_archive', 'tools', '.git'}

BOOT_ROOT = '    <script src="js/i18n-boot.js" defer></script>\n'
BOOT_PEAK = '    <script src="../js/i18n-boot.js" defer></script>\n'
BOOT_BLOG = '    <script src="../js/i18n-boot.js" defer></script>\n'
CSS_ROOT = '    <link rel="stylesheet" href="css/i18n.css">\n'
CSS_DEEP = '    <link rel="stylesheet" href="../css/i18n.css">\n'


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding='utf-8')
    original = text
    rel = path.relative_to(ROOT)
    parts = rel.parts

    if 'i18n-boot.js' in text:
        return False

    if parts[0] == 'peaks':
        css = '../css/i18n.css'
        boot = '../js/i18n-boot.js'
    elif parts[0] == 'blog':
        css = '../css/i18n.css'
        boot = '../js/i18n-boot.js'
    else:
        css = 'css/i18n.css'
        boot = 'js/i18n-boot.js'

    if css not in text and 'css/i18n.css' not in text:
        if f'href="{css}"' not in text:
            needle = '<link rel="stylesheet" href="css/style.css">'
            if parts[0] == 'peaks':
                needle = '<link rel="stylesheet" href="../css/style.css">'
            elif parts[0] == 'blog':
                needle = '<link rel="stylesheet" href="../css/style.css">'
            if needle in text:
                text = text.replace(needle, needle + f'\n    <link rel="stylesheet" href="{css}">', 1)
            elif '</head>' in text:
                text = text.replace('</head>', f'    <link rel="stylesheet" href="{css}">\n</head>', 1)

    boot_tag = f'<script src="{boot}" defer></script>'
    if boot_tag not in text and '</body>' in text:
        text = text.replace('</body>', f'    {boot_tag}\n</body>', 1)

    if text != original:
        path.write_text(text, encoding='utf-8')
        return True
    return False


def main() -> None:
    changed = []
    for html in ROOT.rglob('*.html'):
        if any(p in SKIP_DIRS for p in html.parts):
            continue
        if patch_file(html):
            changed.append(str(html.relative_to(ROOT)))
    print(f'Patched {len(changed)} files')
    for c in changed[:30]:
        print(' ', c)
    if len(changed) > 30:
        print(f'  ... and {len(changed) - 30} more')


if __name__ == '__main__':
    main()
