/**
 * Build data/climbing-spots.json — run: node scripts/build-climbing-spots.js
 */
const fs = require('fs');
const path = require('path');

const IMG = {
  tehran: 'images/climbing/veliran.jpg',
  north: 'images/climbing/shiroud.jpg',
  bistoon: 'images/climbing/bistoon.jpg',
  polKhab: 'images/climbing/pol-khab.jpg',
  alamkooh: 'images/shelters/alamkooh.jpg',
};

function spot(o) {
  return {
    type: 'سنگ‌نوردی',
    grades: '۵.۶ تا ۵.۱۲',
    routes: 'چند مسیر',
    season: 'بهار تا پاییز',
    image: IMG.tehran,
    ...o,
  };
}

const spots = [
  // ── تهران ──
  spot({ id: 'band-yakhchal', name: 'بند یخچال', nameEn: 'Band Yakhchal', featured: true, topRank: 4, type: 'آموزشی/اسپرت', grades: '۵.۷ تا ۵.۱۳', routes: '۱۰۰+ مسیر', image: IMG.tehran, lat: 35.839, lng: 51.008, region: 'البرز', province: 'تهران', description: 'قدیمی‌ترین و معروف‌ترین منطقه سنگ‌نوردی ایران — مهد آموزش و تمرین سنگ‌نوردی.' }),
  spot({ id: 'band-auson', name: 'بند اوسون (بند مگس)', nameEn: 'Band Auson', lat: 35.951, lng: 51.518, region: 'البرز', province: 'تهران', grades: '۵.۸ تا ۵.۱۲', routes: '۴۰+ مسیر', description: 'دیواره سنگ‌لوز نزدیک تهران با مسیرهای اسپرت و چندطنابه.' }),
  spot({ id: 'pol-khab', name: 'پل خواب', nameEn: 'Pol Khab', featured: true, topRank: 3, type: 'اسپرت', grades: '۵.۹ تا ۵.۱۳', routes: '۸۰+ مسیر', image: IMG.polKhab, lat: 36.184, lng: 51.218, region: 'البرز', province: 'تهران', description: 'جاده چالوس — مشهورترین منطقه اسپرت و مولتی‌پیچ ایران.' }),
  spot({ id: 'kashar', name: 'کشار', nameEn: 'Kashar', lat: 35.828, lng: 50.942, region: 'البرز', province: 'تهران', description: 'منطقه سنگ‌نوردی در محدوده کرج با دسترسی نسبتاً آسان.' }),
  spot({ id: 'vardeh', name: 'ورده', nameEn: 'Vardeh', lat: 35.875, lng: 51.105, region: 'البرز', province: 'تهران', description: 'دیواره‌های کوچک‌تر برای تمرین در نزدیکی تهران.' }),
  spot({ id: 'emamzadeh-davood', name: 'امامزاده داوود', nameEn: 'Emamzadeh Davood', lat: 35.754, lng: 51.358, region: 'البرز', province: 'تهران', description: 'منطقه سنگ‌نوردی در مسیر امامزاده داوود با چشم‌انداز البرز.' }),
  spot({ id: 'darakeh', name: 'درکه', nameEn: 'Darakeh', lat: 35.816, lng: 51.427, region: 'البرز', province: 'تهران', description: 'دیواره‌های دره درکه — ترکیب کوهپیمایی و سنگ‌نوردی.' }),
  spot({ id: 'darband', name: 'دربند', nameEn: 'Darband', lat: 35.818, lng: 51.432, region: 'البرز', province: 'تهران', type: 'آموزشی', description: 'دیواره‌های کوچک برای شروع و تمرین تکنیک — دسترسی از مسیر دربند.' }),
  spot({ id: 'tochal', name: 'توچال', nameEn: 'Tochal', lat: 35.889, lng: 51.406, region: 'البرز', province: 'تهران', type: 'ترکیبی', description: 'دیواره‌های محدوده توچال — ترکیب کوهنوردی و دیواره‌نوردی.' }),
  spot({ id: 'veliran', name: 'ولیران', nameEn: 'Veliran', lat: 35.979, lng: 51.487, region: 'البرز', province: 'تهران', description: 'دیواره محبوب نزدیک لواسان — مسیرهای متنوع مبتدی تا پیشرفته.' }),
  spot({ id: 'heijan', name: 'هیجان', nameEn: 'Heijan', lat: 36.012, lng: 51.321, region: 'البرز', province: 'البرز', description: 'دیواره سنگ‌لوز با دسترسی نسبتاً آسان — مناسب تمرین.' }),

  // ── البرز (استان) ──
  spot({ id: 'azgi', name: 'ازگی', nameEn: 'Azgi', featured: true, topRank: 5, type: 'اسپرت', grades: '۵.۹ تا ۵.۱۲', routes: '۵۰+ مسیر', lat: 35.872, lng: 50.982, region: 'البرز', province: 'البرز', description: 'یکی از معروف‌ترین مناطق اسپرت ایران — مرز تهران و البرز.' }),
  spot({ id: 'baraghan', name: 'برغان', nameEn: 'Baraghan', lat: 35.889, lng: 50.978, region: 'البرز', province: 'البرز', description: 'منطقه سنگ‌نوردی غار برغان با مسیرهای سرطناب.' }),
  spot({ id: 'vardij', name: 'وردیج', nameEn: 'Vardij', lat: 35.931, lng: 51.018, region: 'البرز', province: 'البرز', description: 'دیواره‌های وردیج در نزدیکی فشم — محبوب تهرانی‌ها.' }),
  spot({ id: 'kelak', name: 'کلاک', nameEn: 'Kelak', lat: 35.798, lng: 51.258, region: 'البرز', province: 'البرز', description: 'منطقه سنگ‌نوردی کلاک در جنوب شرق تهران.' }),
  spot({ id: 'atashgah', name: 'آتشگاه', nameEn: 'Atashgah', lat: 35.835, lng: 51.012, region: 'البرز', province: 'البرز', description: 'دیواره آتشگاه در محدوده بند یخچال و کرج.' }),

  // ── مازندران ──
  spot({ id: 'alam-kooh', name: 'دیواره علم‌کوه', nameEn: 'Alam Kuh Wall', featured: true, topRank: 2, type: 'بیگ‌وال/آلپاین', grades: '۵.۹ تا ۵.۱۳+', routes: '۷۰+ مسیر', image: IMG.alamkooh, lat: 36.46, lng: 51.02, region: 'البرز', province: 'مازندران', season: 'تابستان', description: 'مهم‌ترین دیواره گرانیتی ایران — بسیاری آن را بهترین دیواره کشور می‌دانند.' }),
  spot({ id: 'shakhak', name: 'شاخک', nameEn: 'Shakhak', image: IMG.alamkooh, lat: 36.44, lng: 51.01, region: 'البرز', province: 'مازندران', type: 'آلپاین', description: 'دیواره شاخک در محدوده علم‌کوه — صعودهای چندروزه.' }),
  spot({ id: 'takht-soleyman', name: 'تخت سلیمان', nameEn: 'Takht Soleyman', image: IMG.alamkooh, lat: 36.40, lng: 51.05, region: 'البرز', province: 'مازندران', description: 'دیواره تخت سلیمان در رشته تخت‌سلطان.' }),
  spot({ id: 'haft-khan', name: 'هفت‌خوان', nameEn: 'Haft Khan', image: IMG.alamkooh, lat: 36.48, lng: 51.00, region: 'البرز', province: 'مازندران', description: 'منطقه هفت‌خوان در محدوده علم‌کوه.' }),
  spot({ id: 'manar', name: 'منار', nameEn: 'Manar', image: IMG.alamkooh, lat: 36.45, lng: 51.02, region: 'البرز', province: 'مازندران', description: 'دیواره منار — یکی از دیواره‌های شناخته‌شده علم‌کوه.' }),
  spot({ id: 'se-hazar-wall', name: 'دیواره غربی منطقه سه‌هزار', nameEn: 'Se Hazar West Wall', image: IMG.north, lat: 36.46, lng: 51.00, region: 'البرز', province: 'مازندران', description: 'دیواره غربی منطقه سه‌هزار در رشته سه‌هزار دشت.' }),
  spot({ id: 'shiroud', name: 'شیرود', nameEn: 'Shiroud', image: IMG.north, lat: 36.759, lng: 50.674, region: 'البرز', province: 'مازندران', description: 'دیواره ساحلی با چشم‌انداز دریا — هوای مرطوب را در نظر بگیر.' }),

  // ── کرمانشاه ──
  spot({ id: 'bistoon', name: 'دیواره بیستون', nameEn: 'Bisotun Big Wall', featured: true, topRank: 1, type: 'بیگ‌وال', grades: '۵.۹ تا ۵.۱۳+', routes: '۱۰۰+ مسیر', image: IMG.bistoon, lat: 34.383, lng: 47.435, region: 'زاگرس', province: 'کرمانشاه', season: 'پاییز و زمستان', description: 'یکی از بزرگ‌ترین دیواره‌های آهکی آسیا — ارتفاع حدود ۱۲۰۰ متر، مقصد حرفه‌ای جهانی.' }),

  // ── لرستان ──
  spot({ id: 'yafteh', name: 'دیواره یافته', nameEn: 'Yafteh Wall', featured: true, topRank: 6, type: 'بیگ‌وال', grades: '۵.۱۰ تا ۵.۱۳', routes: '۳۰+ مسیر', image: IMG.bistoon, lat: 33.278, lng: 48.285, region: 'زاگرس', province: 'لرستان', description: 'یکی از بزرگ‌ترین دیواره‌های ایران — صعودهای چندروزه و سنگ آهکی.' }),
  spot({ id: 'oshtrankuh', name: 'اشترانکوه', nameEn: 'Oshtrankuh', lat: 33.05, lng: 48.15, region: 'زاگرس', province: 'لرستان', description: 'دیواره‌های اشترانکوه در زاگرس مرکزی.' }),
  spot({ id: 'mokhmal-kuh', name: 'مخمل‌کوه', nameEn: 'Mokhmal Kuh', lat: 33.12, lng: 48.22, region: 'زاگرس', province: 'لرستان', description: 'منطقه سنگ‌نوردی مخمل‌کوه در لرستان.' }),
  spot({ id: 'chal-kabud', name: 'چال کبود', nameEn: 'Chal Kabud', lat: 33.15, lng: 48.18, region: 'زاگرس', province: 'لرستان', description: 'دیواره چال کبود — مسیرهای سنگ‌نوردی در زاگرس.' }),

  // ── همدان ──
  spot({ id: 'alvand', name: 'الوند', nameEn: 'Alvand', lat: 34.755, lng: 48.488, region: 'زاگرس', province: 'همدان', description: 'دیواره‌های کوه الوند در نزدیکی همدان.' }),
  spot({ id: 'ganjnameh', name: 'گنجنامه', nameEn: 'Ganjnameh', lat: 34.764, lng: 48.472, region: 'زاگرس', province: 'همدان', description: 'منطقه سنگ‌نوردی گنجنامه — دسترسی آسان از همدان.' }),
  spot({ id: 'abbasabad', name: 'عباس‌آباد', nameEn: 'Abbasabad', lat: 34.78, lng: 48.50, region: 'زاگرس', province: 'همدان', description: 'دیواره‌های عباس‌آباد در استان همدان.' }),

  // ── زنجان ──
  spot({ id: 'dodkesh-jan', name: 'منطقه دودکش جن', nameEn: 'Dodkesh Jan', lat: 36.55, lng: 48.75, region: 'آذربایجان', province: 'زنجان', description: 'منطقه سنگ‌نوردی دودکش جن در زنجان.' }),
  spot({ id: 'tarom-colors', name: 'کوه‌های رنگی اطراف طارم', nameEn: 'Tarom Colorful Mountains', lat: 36.72, lng: 48.95, region: 'آذربایجان', province: 'زنجان', description: 'دیواره‌های سنگی منحصربفرد در منطقه طارم.' }),

  // ── قزوین ──
  spot({ id: 'sialan', name: 'سیالان', nameEn: 'Sialan', image: IMG.north, lat: 36.45, lng: 50.44, region: 'البرز', province: 'قزوین', description: 'دیواره‌های کوه سیالان — ترکیب کوهنوردی و سنگ‌نوردی.' }),
  spot({ id: 'alamut', name: 'منطقه الموت', nameEn: 'Alamut', lat: 36.45, lng: 50.58, region: 'البرز', province: 'قزوین', description: 'دیواره‌های سنگی در منطقه تاریخی الموت.' }),
  spot({ id: 'andaj', name: 'اندج', nameEn: 'Andaj', lat: 36.35, lng: 50.35, region: 'البرز', province: 'قزوین', description: 'منطقه سنگ‌نوردی اندج در قزوین.' }),
  spot({ id: 'garmarud', name: 'گرمارود', nameEn: 'Garmarud', lat: 36.38, lng: 50.42, region: 'البرز', province: 'قزوین', description: 'دیواره گرمارود در مسیر الموت.' }),

  // ── گیلان ──
  spot({ id: 'darfak', name: 'درفک', nameEn: 'Darfak', featured: true, topRank: 7, image: IMG.north, lat: 36.38, lng: 49.12, region: 'البرز', province: 'گیلان', description: 'دیواره درفک — یکی از مشهورترین مناطق سنگ‌نوردی شمال ایران.' }),
  spot({ id: 'masuleh', name: 'ماسوله', nameEn: 'Masuleh', image: IMG.north, lat: 37.146, lng: 48.99, region: 'البرز', province: 'گیلان', description: 'دیواره‌های اطراف ماسوله در گیلان.' }),
  spot({ id: 'siahkal', name: 'سیاهکل', nameEn: 'Siahkal', image: IMG.north, lat: 37.272, lng: 49.87, region: 'البرز', province: 'گیلان', description: 'منطقه سنگ‌نوردی سیاهکل.' }),
  spot({ id: 'deylaman', name: 'دیلمان', nameEn: 'Deylaman', image: IMG.north, lat: 36.88, lng: 49.85, region: 'البرز', province: 'گیلان', description: 'دیواره‌های دیلمان در گیلان.' }),

  // ── اصفهان ──
  spot({ id: 'kaleh-ghazi', name: 'کلاه‌قاضی', nameEn: 'Kaleh Ghazi', featured: true, topRank: 10, lat: 32.68, lng: 51.45, region: 'مرکزی', province: 'اصفهان', description: 'دیواره کلاه‌قاضی — یکی از معروف‌ترین مناطق سنگ‌نوردی مرکزی ایران.' }),
  spot({ id: 'sefeh', name: 'صفه', nameEn: 'Sefeh', lat: 32.55, lng: 51.62, region: 'مرکزی', province: 'اصفهان', description: 'دیواره کوه صفه در نزدیکی اصفهان.' }),
  spot({ id: 'karkas', name: 'کوه کرکس (نطنز)', nameEn: 'Karkas', lat: 33.47, lng: 51.98, region: 'مرکزی', province: 'اصفهان', description: 'دیواره‌های کوه کرکس در نطنز.' }),

  // ── فارس ──
  spot({ id: 'tang-chogan', name: 'تنگ چوگان', nameEn: 'Tang Chogan', lat: 29.92, lng: 52.88, region: 'زاگرس', province: 'فارس', description: 'دیواره‌های تنگ چوگان در شیراز.' }),
  spot({ id: 'darak', name: 'کوه دراک', nameEn: 'Darak', lat: 29.67, lng: 52.66, region: 'زاگرس', province: 'فارس', description: 'منطقه سنگ‌نوردی کوه دراک.' }),
  spot({ id: 'sepidan', name: 'سپیدان', nameEn: 'Sepidan', lat: 30.25, lng: 51.98, region: 'زاگرس', province: 'فارس', description: 'دیواره‌های سپیدان در فارس.' }),
  spot({ id: 'bavanak', name: 'تنگ بوانک', nameEn: 'Bavanak Gorge', lat: 29.78, lng: 52.45, region: 'زاگرس', province: 'فارس', description: 'تنگ بوانک — منطقه سنگ‌نوردی در فارس.' }),

  // ── کهگیلویه و بویراحمد ──
  spot({ id: 'ghash-mestan', name: 'قاش‌مستان', nameEn: 'Ghash Mestan', featured: true, topRank: 8, lat: 30.95, lng: 51.42, region: 'زاگرس', province: 'کهگیلویه و بویراحمد', description: 'دیواره قاش‌مستان — یکی از مشهورترین مناطق زاگرس جنوبی.' }),
  spot({ id: 'dena-wall', name: 'دنا', nameEn: 'Dena Wall', lat: 30.95, lng: 51.42, region: 'زاگرس', province: 'کهگیلویه و بویراحمد', type: 'آلپاین', description: 'دیواره‌های کوه دنا — صعودهای سنگ‌نوردی و کوهنوردی.' }),
  spot({ id: 'bijan', name: 'بیژن', nameEn: 'Bijan', lat: 30.88, lng: 51.35, region: 'زاگرس', province: 'کهگیلویه و بویراحمد', description: 'منطقه سنگ‌نوردی بیژن.' }),
  spot({ id: 'sisakht', name: 'سی‌سخت', nameEn: 'Sisakht', lat: 30.85, lng: 51.45, region: 'زاگرس', province: 'کهگیلویه و بویراحمد', description: 'دیواره‌های سی‌سخت در دنا.' }),

  // ── چهارمحال و بختیاری ──
  spot({ id: 'zardkuh-wall', name: 'زردکوه', nameEn: 'Zardkuh Wall', lat: 32.38, lng: 50.12, region: 'زاگرس', province: 'چهارمحال و بختیاری', description: 'دیواره‌های زردکوه بختیاری.' }),
  spot({ id: 'kalar', name: 'کلار', nameEn: 'Kalar', lat: 32.35, lng: 50.08, region: 'زاگرس', province: 'چهارمحال و بختیاری', description: 'منطقه سنگ‌نوردی کلار.' }),

  // ── خوزستان ──
  spot({ id: 'tang-tekab', name: 'تنگ تکاب', nameEn: 'Tang Tekab', lat: 32.05, lng: 49.38, region: 'زاگرس', province: 'خوزستان', description: 'تنگ تکاب — دیواره سنگی در خوزستان.' }),
  spot({ id: 'mangasht', name: 'کوه منگشت', nameEn: 'Mangasht', lat: 31.95, lng: 49.45, region: 'زاگرس', province: 'خوزستان', description: 'دیواره کوه منگشت در خوزستان.' }),

  // ── خراسان رضوی ──
  spot({ id: 'akhlamad', name: 'اخلمد', nameEn: 'Akhlamad', featured: true, topRank: 9, image: IMG.bistoon, lat: 35.92, lng: 59.08, region: 'خراسان', province: 'خراسان رضوی', description: 'دیواره اخلمد — معروف‌ترین منطقه سنگ‌نوردی شرق ایران.' }),
  spot({ id: 'torghabeh', name: 'طرقبه', nameEn: 'Torghabeh', lat: 36.42, lng: 59.35, region: 'خراسان', province: 'خراسان رضوی', description: 'دیواره چالیدره طرقبه — نزدیک مشهد.' }),
  spot({ id: 'binalud', name: 'بینالود', nameEn: 'Binalud', lat: 36.48, lng: 58.92, region: 'خراسان', province: 'خراسان رضوی', description: 'دیواره‌های کوه بینالود.' }),
  spot({ id: 'ardameh', name: 'اردمه', nameEn: 'Ardameh', lat: 36.65, lng: 58.75, region: 'خراسان', province: 'خراسان رضوی', description: 'منطقه سنگ‌نوردی اردمه در خراسان.' }),

  // ── خراسان شمالی ──
  spot({ id: 'saluk', name: 'سالوک', nameEn: 'Saluk', lat: 37.12, lng: 57.45, region: 'خراسان', province: 'خراسان شمالی', description: 'دیواره سالوک در خراسان شمالی.' }),
  spot({ id: 'shah-jahan', name: 'شاه‌جهان', nameEn: 'Shah Jahan', lat: 37.35, lng: 57.28, region: 'خراسان', province: 'خراسان شمالی', description: 'منطقه سنگ‌نوردی شاه‌جهان.' }),

  // ── گلستان ──
  spot({ id: 'jahannama', name: 'جهان‌نما', nameEn: 'Jahannama', image: IMG.north, lat: 37.02, lng: 55.18, region: 'البرز شرقی', province: 'گلستان', description: 'دیواره جهان‌نما در گلستان.' }),
  spot({ id: 'ziarat', name: 'زیارت', nameEn: 'Ziarat', image: IMG.north, lat: 36.88, lng: 54.45, region: 'البرز شرقی', province: 'گلستان', description: 'منطقه سنگ‌نوردی زیارت.' }),

  // ── سمنان ──
  spot({ id: 'shahmirzad', name: 'شهمیرزاد', nameEn: 'Shahmirzad', lat: 35.75, lng: 53.33, region: 'البرز شرقی', province: 'سمنان', description: 'دیواره‌های شهمیرزاد در سمنان.' }),
  spot({ id: 'nizva', name: 'نیزوا', nameEn: 'Nizva', lat: 35.62, lng: 53.28, region: 'البرز شرقی', province: 'سمنان', description: 'منطقه سنگ‌نوردی نیزوا.' }),

  // ── کرمان ──
  spot({ id: 'hazar-kuh', name: 'کوه هزار', nameEn: 'Hazar Kuh', lat: 29.52, lng: 57.25, region: 'مرکزی', province: 'کرمان', description: 'دیواره کوه هزار در کرمان.' }),
  spot({ id: 'joupar', name: 'جوپار', nameEn: 'Joupar', lat: 30.35, lng: 56.88, region: 'مرکزی', province: 'کرمان', description: 'منطقه سنگ‌نوردی جوپار.' }),

  // ── هرمزگان ──
  spot({ id: 'genu', name: 'کوه گنو', nameEn: 'Kuh Genu', lat: 27.08, lng: 56.98, region: 'جنوب', province: 'هرمزگان', description: 'دیواره کوه گنو در هرمزگان.' }),
  spot({ id: 'bandar-abbas-gorges', name: 'تنگه‌های اطراف بندرعباس', nameEn: 'Bandar Abbas Gorges', lat: 27.18, lng: 56.28, region: 'جنوب', province: 'هرمزگان', description: 'تنگه‌ها و دیواره‌های سنگی اطراف بندرعباس.' }),

  // ── آذربایجان شرقی ──
  spot({ id: 'sahand', name: 'سهند', nameEn: 'Sahand', lat: 37.73, lng: 46.42, region: 'آذربایجان', province: 'آذربایجان شرقی', description: 'دیواره‌های کوه سهند.' }),
  spot({ id: 'oynali', name: 'عینالی', nameEn: 'Oynali', lat: 38.08, lng: 46.28, region: 'آذربایجان', province: 'آذربایجان شرقی', description: 'منطقه سنگ‌نوردی عینالی در تبریز.' }),
  spot({ id: 'mishu', name: 'کوه میشو', nameEn: 'Mishu', lat: 37.85, lng: 46.15, region: 'آذربایجان', province: 'آذربایجان شرقی', description: 'دیواره کوه میشو.' }),

  // ── آذربایجان غربی ──
  spot({ id: 'dalampar', name: 'دالامپر', nameEn: 'Dalampar', lat: 36.75, lng: 45.12, region: 'آذربایجان', province: 'آذربایجان غربی', description: 'منطقه سنگ‌نوردی دالامپر.' }),
  spot({ id: 'silvana', name: 'سیلوانا', nameEn: 'Silvana', lat: 37.42, lng: 44.85, region: 'آذربایجان', province: 'آذربایجان غربی', description: 'دیواره سیلوانا در آذربایجان غربی.' }),

  // ── کردستان ──
  spot({ id: 'abidar', name: 'آبیدر', nameEn: 'Abidar', lat: 35.32, lng: 46.98, region: 'زاگرس', province: 'کردستان', description: 'دیواره آبیدر در سنندج.' }),
  spot({ id: 'shaho', name: 'شاهو', nameEn: 'Shaho', lat: 35.25, lng: 46.35, region: 'زاگرس', province: 'کردستان', description: 'دیواره کوه شاهو در کردستان.' }),

  // ── یزد ──
  spot({ id: 'shirkooh-yazd', name: 'شیرکوه', nameEn: 'Shir Kuh', lat: 31.58, lng: 54.08, region: 'مرکزی', province: 'یزد', description: 'دیواره شیرکوه در یزد.' }),
  spot({ id: 'oghab-kuh', name: 'عقاب‌کوه', nameEn: 'Oghab Kuh', lat: 31.55, lng: 54.12, region: 'مرکزی', province: 'یزد', description: 'منطقه سنگ‌نوردی عقاب‌کوه.' }),

  // ── اردبیل ──
  spot({ id: 'garmaab', name: 'گرمااب درق', nameEn: 'Garmab Daraq', image: IMG.north, lat: 37.892, lng: 48.148, region: 'آذربایجان', province: 'اردبیل', description: 'دیواره گرانیتی در ارتفاعات اردبیل.' }),
];

const out = path.join(__dirname, '..', 'data', 'climbing-spots.json');
fs.writeFileSync(out, JSON.stringify(spots, null, 2) + '\n', 'utf8');
console.log('Wrote', spots.length, 'climbing spots to', out);
