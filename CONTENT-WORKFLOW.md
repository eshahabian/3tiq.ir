# گردش کار محتوای روزانه — 3tiq.ir

این سند برای **Automation روزانه** و هر agent که روی این repo کار می‌کند است.

## هدف هر run (هر روز)

1. **یک راهنمای صعود** — قلهٔ مشخص ایران  
2. **یک مقاله وبلاگ** — آموزشی/علمی درباره **کوهنوردی در جهان** (نه راهنمای صعود یک قله)

تاریخ انتشار: **امروز به تقویم شمسی** (مثلاً «۱۹ مرداد ۱۴۰۵»). از تاریخ ساختگی یا قدیمی استفاده نکن.

---

## تفکیک قطعی: وبلاگ ≠ راهنمای صعود

| نوع | فهرست | داده | HTML |
|-----|--------|------|------|
| **مقاله وبلاگ** | `blog.html` | `data/blog-posts.json` | `blog/blog-….html` |
| **راهنمای صعود** | `blog-guides.html` | `data/ascent-guides.json` | `blog/blog-…-guide.html` یا `blog-damavand-guide.html` |

- راهنمای صعود **هرگز** در `blog-posts.json` یا کارت‌های `blog.html` نیاید.
- مقاله وبلاگ **هرگز** فقط در `ascent-guides.json` ثبت نشود (مگر اشتباه).

---

## راهنمای صعود — checklist

1. **قله:** اولین مورد `upcoming` در `data/ascent-guide-schedule.json`؛ اگر خالی بود از `index.html#peaks` / `js/app.js` (`famousPeaks`) قلهٔ بدون راهنمای اختصاصی در سری.
2. **صفحه:** الگو از `blog/blog-dena-guide.html` — breadcrumb به `blog-guides.html`، لینک `peaks/<peak>.html`، لینک‌های داخلی به مقالات (`blog-pre-ascent-checklist.html`, `blog-weather-check.html`, …).
3. **عکس:** `images/blog/` یا `images/peaks/` + در صورت نیاز `python tools/watermark-blog-images.py` روی JPG جدید.
4. **ثبت:** ورودی در `data/ascent-guides.json` با `dateFa` امروز.
5. **همگام inline:** `node tools/sync-ascent-guides-inline.mjs` (اجباری).
6. **صفحه قله:** دکمه/لینک «مطالعه راهنمای …» در `peaks/<peak>.html`.
7. **schedule:** انتقال قله از `upcoming` به `published` با `slug` و `dateFa`.
8. **SEO:** `sitemap.xml`، `data/blog-image-focus.json` برای `data-blog-id`.
9. **ترتیب نمایش:** با `dateFa` در `js/blog-guides-page.js` — نیازی به دستکاری نیست اگر تاریخ درست باشد.

---

## مقاله وبلاگ (کوهنوردی جهانی) — checklist

1. **موضوع:** یک موضوع **آموزشی یا علمی** مرتبط با کوهنوردی **در جهان** (ایمنی، فیزیologie، فرهنگ کوه در کشور دیگر، استاندارد UIAA، محیط‌زیست، تاریخچه کوهنوری، …). **نه** راهنمای مسیر یک قلهٔ ایران.
2. **زبان:** فارسی، مخاطب سایت 3tiq.
3. **صفحه:** الگو از `blog/blog-acclimatization.html` — breadcrumb به `blog.html`.
4. **ثبت:** بالای `data/blog-posts.json`؛ کارت در `blog.html` بعد از `<!-- BLOG-GENERATOR-INSERT -->` (نه featured مگر در prompt جداگانه).
5. **تکراری نباشد:** عنوان و slug را با `data/blog-posts.json` و فایل‌های `blog/` مقایسه کن.
6. **SEO:** `sitemap.xml`، `data/blog-en.json` (cards + posts خلاصه)، `blog-image-focus.json` در صورت hero.

---

## Git

- یک commit (یا دو commit جدا) با پیام واضح فارسی/انگلیسی.
- **Push** به `origin/main` اگر دسترسی Automation دارد.
- **Deploy روی 3tiq.ir** جزو این workflow نیست — بعد از push باید هاست sync شود (FTP / `git pull`).

---

## فایل‌هایی که معمولاً دست نمی‌خورند

- `coding-tutor/` (پروژه جدا)
- محتوای unrelated در `blog.html` (فیلتر مسیرها نباید برگردد)

---

## پس از هر run

در گزارش Automation بنویس:

- slug راهنما + slug مقاله
- `dateFa`
- آیا `sync-ascent-guides-inline.mjs` اجرا شد
- یادآوری: «برای live بودن، deploy هاست لازم است»
