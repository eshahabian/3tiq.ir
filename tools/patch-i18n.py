#!/usr/bin/env python3
"""Add i18n.css, i18n.js, lang switcher and data-i18n attributes across site HTML."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

LANG_SWITCH = """                    <div class="lang-switch" id="langSwitch" role="group" aria-label="Language">
                        <button type="button" class="lang-switch-btn active" data-lang="fa" aria-pressed="true">فا</button>
                        <button type="button" class="lang-switch-btn" data-lang="en" aria-pressed="false">EN</button>
                    </div>
"""

PEAK_HEADER_OLD = """<header class="header">
    <div class="container">
        <a href="../index.html" class="header-logo">سه تیغ ⛰</a>
        <a href="javascript:history.back()" class="header-back">← بازگشت</a>
    </div>
</header>"""

PEAK_HEADER_NEW = """<header class="header">
    <div class="container header-container--peak">
        <a href="../index.html" class="header-logo">سه تیغ ⛰</a>
        <div class="header-actions header-actions--compact">
            <div class="lang-switch" id="langSwitch" role="group" aria-label="Language">
                <button type="button" class="lang-switch-btn active" data-lang="fa" aria-pressed="true">فا</button>
                <button type="button" class="lang-switch-btn" data-lang="en" aria-pressed="false">EN</button>
            </div>
            <a href="javascript:history.back()" class="header-back" data-i18n="peak.back">← بازگشت</a>
        </div>
    </div>
</header>"""

PEAK_REPLACEMENTS = [
    (PEAK_HEADER_OLD, PEAK_HEADER_NEW),
    ('<a href="../index.html">صفحه اصلی</a>', '<a href="../index.html" data-i18n="peak.home">صفحه اصلی</a>'),
    ('<h2 class="section-title">درباره این قله</h2>', '<h2 class="section-title" data-i18n="peak.about">درباره این قله</h2>'),
    ('<h2 class="section-title">آب‌وهوا و پیش‌بینی</h2>', '<h2 class="section-title" data-i18n="peak.weather">آب‌وهوا و پیش‌بینی</h2>'),
    ('<h2 class="section-title">مسیرهای صعود</h2>', '<h2 class="section-title" data-i18n="peak.routes">مسیرهای صعود</h2>'),
    ('<h2 class="section-title">نکات مهم برای صعود</h2>', '<h2 class="section-title" data-i18n="peak.tips">نکات مهم برای صعود</h2>'),
    ('<h2 class="section-title">گالری تصاویر</h2>', '<h2 class="section-title" data-i18n="peak.gallery">گالری تصاویر</h2>'),
    ('<h2 class="section-title">قله‌های اطراف</h2>', '<h2 class="section-title" data-i18n="peak.nearby">قله‌های اطراف</h2>'),
    ('class="map-open-btn">\n           🗺️ باز کردن نقشه در CyclOSM ↗', 'class="map-open-btn" data-i18n="peak.mapOpen">\n           🗺️ باز کردن نقشه در CyclOSM ↗'),
    ('<div class="sidebar-title">📅 بهترین فصل صعود</div>', '<div class="sidebar-title" data-i18n="peak.seasonTitle">📅 بهترین فصل صعود</div>'),
    ('<div class="sidebar-title">⚡ اقدامات</div>', '<div class="sidebar-title" data-i18n="peak.actions">⚡ اقدامات</div>'),
    (
        '<button class="action-btn btn-primary" onclick="window.print()">🖨️ چاپ / ذخیره PDF</button>',
        '<button class="action-btn btn-primary" onclick="window.print()" data-i18n="peak.print">🖨️ چاپ / ذخیره PDF</button>',
    ),
    (
        '<button class="action-btn btn-secondary" onclick="navigator.share?navigator.share({title:document.title,url:location.href}):navigator.clipboard.writeText(location.href)">🔗 اشتراک‌گذاری</button>',
        '<button class="action-btn btn-secondary" onclick="navigator.share?navigator.share({title:document.title,url:location.href}):navigator.clipboard.writeText(location.href)" data-i18n="peak.share">🔗 اشتراک‌گذاری</button>',
    ),
    ('<div class="sidebar-title">ℹ️ اطلاعات تکمیلی</div>', '<div class="sidebar-title" data-i18n="peak.info">ℹ️ اطلاعات تکمیلی</div>'),
    ('<span style="color:var(--text-light);">مختصات</span>', '<span style="color:var(--text-light);" data-i18n="peak.coords">مختصات</span>'),
    ('<span style="color:var(--text-light);">رشته‌کوه</span>', '<span style="color:var(--text-light);" data-i18n="peak.range">رشته‌کوه</span>'),
    ('<span style="color:var(--text-light);">نوع سنگ</span>', '<span style="color:var(--text-light);" data-i18n="peak.rockType">نوع سنگ</span>'),
    ('<span style="color:var(--text-light);">رتبه در ایران</span>', '<span style="color:var(--text-light);" data-i18n="peak.rank">رتبه در ایران</span>'),
]

NAV_REPLACEMENTS = [
    ('<li><a href="index.html">صفحه اصلی</a></li>', '<li><a href="index.html" data-i18n="nav.home">صفحه اصلی</a></li>'),
    ('<li><a href="#home" class="active"', '<li><a href="#home" class="active"'),  # index already has data-i18n
    ('<a href="#">رشته‌کوه‌های ایران</a>', '<a href="#" data-i18n="nav.ranges">رشته‌کوه‌های ایران</a>'),
    ('<a href="index.html#peaks">رشته‌کوه‌های ایران</a>', '<a href="index.html#peaks" data-i18n="nav.ranges">رشته‌کوه‌های ایران</a>'),
    ('<li><a href="panahgah.html" class="active">پناهگاه‌ها</a></li>', '<li><a href="panahgah.html" class="active" data-i18n="nav.shelters">پناهگاه‌ها</a></li>'),
    ('<li><a href="panahgah.html">پناهگاه‌ها</a></li>', '<li><a href="panahgah.html" data-i18n="nav.shelters">پناهگاه‌ها</a></li>'),
    ('<li><a href="blog.html" class="active">وبلاگ</a></li>', '<li><a href="blog.html" class="active" data-i18n="nav.blog">وبلاگ</a></li>'),
    ('<li><a href="blog.html">وبلاگ</a></li>', '<li><a href="blog.html" data-i18n="nav.blog">وبلاگ</a></li>'),
    ('<li><a href="index.html#contact">تماس با ما</a></li>', '<li><a href="index.html#contact" data-i18n="nav.contact">تماس با ما</a></li>'),
    ('aria-label="تغییر تم"', 'data-i18n-attr="aria-label:nav.theme" aria-label="تغییر تم"'),
    ('aria-label="منو"', 'data-i18n-attr="aria-label:nav.menu" aria-label="منو"'),
]

BLOG_REPLACEMENTS = [
    ('<span class="blog-hero-badge">📝 دانش کوهنوردی</span>', '<span class="blog-hero-badge" data-i18n="blog.badge">📝 دانش کوهنوردی</span>'),
    ('<h1>وبلاگ سه تیغ</h1>', '<h1 data-i18n="blog.title">وبلاگ سه تیغ</h1>'),
    (
        '<p>راهنماها، نکات ایمنی، معرفی تجهیزات و تجربیات کوهنوردی در ایران</p>',
        '<p data-i18n="blog.subtitle">راهنماها، نکات ایمنی، معرفی تجهیزات و تجربیات کوهنوردی در ایران</p>',
    ),
    ('data-cat="all">همه</button>', 'data-cat="all" data-i18n="blog.filter.all">همه</button>'),
    ('data-cat="safety">⚠️ ایمنی</button>', 'data-cat="safety" data-i18n="blog.filter.safety">⚠️ ایمنی</button>'),
    ('data-cat="gear">🎒 تجهیزات</button>', 'data-cat="gear" data-i18n="blog.filter.gear">🎒 تجهیزات</button>'),
    ('data-cat="routes">🧭 مسیرها</button>', 'data-cat="routes" data-i18n="blog.filter.routes">🧭 مسیرها</button>'),
    ('data-cat="nature">🌿 طبیعت</button>', 'data-cat="nature" data-i18n="blog.filter.nature">🌿 طبیعت</button>'),
    ('data-cat="peaks">⛰️ قله‌ها</button>', 'data-cat="peaks" data-i18n="blog.filter.peaks">⛰️ قله‌ها</button>'),
]

PH_REPLACEMENTS = [
    ('<span class="ph-eyebrow">🏔️ دفترچهٔ ثبت کوهستان</span>', '<span class="ph-eyebrow" data-i18n="ph.eyebrow">🏔️ دفترچهٔ ثبت کوهستان</span>'),
    ('<h1>پناهگاه‌ها، جان‌پناه‌ها و کلبه‌های کوهستانی</h1>', '<h1 data-i18n="ph.title">پناهگاه‌ها، جان‌پناه‌ها و کلبه‌های کوهستانی</h1>'),
    (
        '<p>فهرستی کامل از نقاط اقامت و اضطراری در مسیرهای کوهنوردی ایران — همراه با مختصات دقیق و نزدیک‌ترین قله به هر یک، برای برنامه‌ریزی بهتر صعود.</p>',
        '<p data-i18n="ph.subtitle">فهرستی کامل از نقاط اقامت و اضطراری در مسیرهای کوهنوردی ایران — همراه با مختصات دقیق و نزدیک‌ترین قله به هر یک، برای برنامه‌ریزی بهتر صعود.</p>',
    ),
    ('<span class="ph-stat-label">نقطهٔ ثبت‌شده</span>', '<span class="ph-stat-label" data-i18n="ph.statTotal">نقطهٔ ثبت‌شده</span>'),
    ('<span class="ph-stat-label">پناهگاه</span>', '<span class="ph-stat-label" data-i18n="ph.statRefuge">پناهگاه</span>'),
    ('<span class="ph-stat-label">جان‌پناه</span>', '<span class="ph-stat-label" data-i18n="ph.statBivouac">جان‌پناه</span>'),
    ('<span class="ph-stat-label">استان</span>', '<span class="ph-stat-label" data-i18n="ph.statProvince">استان</span>'),
]


def add_css_link(content: str, css_href: str) -> str:
    if 'css/i18n.css' in content or '../css/i18n.css' in content:
        return content
    marker = f'href="{css_href}"'
    if marker in content:
        return content.replace(
            f'<link rel="stylesheet" href="{css_href}">',
            f'<link rel="stylesheet" href="{css_href}">\n    <link rel="stylesheet" href="{"../" if "../" in css_href else ""}css/i18n.css">'.replace('css/../', '../css/'),
            1,
        )
    # peak pages inline styles - add before </head>
    if '</head>' in content and 'i18n.css' not in content:
        i18n_path = css_href.replace('style.css', 'i18n.css')
        content = content.replace('</head>', f'    <link rel="stylesheet" href="{i18n_path}">\n</head>', 1)
    return content


def add_script(content: str, script_src: str) -> str:
    if script_src in content:
        return content
    tag = f'<script src="{script_src}" defer></script>'
    if '</body>' in content:
        content = content.replace('</body>', tag + '\n</body>', 1)
    return content


def add_lang_switch(content: str) -> str:
    if 'id="langSwitch"' in content:
        return content
    if '<div class="header-actions">' in content and 'header-actions--compact' not in content:
        return content.replace(
            '<div class="header-actions">',
            '<div class="header-actions">\n' + LANG_SWITCH,
            1,
        )
    return content


def apply_replacements(content: str, pairs: list[tuple[str, str]]) -> str:
    for old, new in pairs:
        if old in content and new not in content:
            content = content.replace(old, new)
    return content


def patch_peak_file(path: Path) -> bool:
    content = path.read_text(encoding='utf-8')
    original = content
    content = add_css_link(content, '../css/style.css')
    content = apply_replacements(content, PEAK_REPLACEMENTS)
    content = add_script(content, '../js/i18n.js')
    if content != original:
        path.write_text(content, encoding='utf-8')
        return True
    return False


def patch_root_page(path: Path, extra: list[tuple[str, str]] | None = None) -> bool:
    content = path.read_text(encoding='utf-8')
    original = content
    content = add_css_link(content, 'css/style.css')
    content = apply_replacements(content, NAV_REPLACEMENTS)
    if extra:
        content = apply_replacements(content, extra)
    content = add_lang_switch(content)
    if 'js/i18n.js' not in content:
        content = add_script(content, 'js/i18n.js')
    if content != original:
        path.write_text(content, encoding='utf-8')
        return True
    return False


def main() -> None:
    changed = []

    for peak in sorted((ROOT / 'peaks').glob('*.html')):
        if patch_peak_file(peak):
            changed.append(str(peak.relative_to(ROOT)))

    root_pages = [
        'panahgah.html',
        'blog.html',
        'alborz-gharbi.html',
        'alborz-markazi.html',
        'alborz-shargi.html',
        'zagros-shomal.html',
        'zagros-markazi.html',
        'zagros-jonoob.html',
        'koohaye-markazi.html',
        'koohaye-atashfeshani.html',
    ]
    extras = {
        'blog.html': BLOG_REPLACEMENTS,
        'panahgah.html': PH_REPLACEMENTS,
    }
    for name in root_pages:
        p = ROOT / name
        if p.exists():
            if patch_root_page(p, extras.get(name)):
                changed.append(name)

    print(f'Patched {len(changed)} files:')
    for c in changed:
        print(' ', c)


if __name__ == '__main__':
    main()
