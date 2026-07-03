(function () {
    'use strict';

    const SITE = '3tiq.ir';

    let PEAKS = [];
    let peaksReady = false;

    const LEVEL_RANK = { 'مبتدی': 1, 'متوسط': 2, 'حرفه‌ای': 3 };
    const LEVEL_LABEL = { beginner: 'مبتدی', intermediate: 'متوسط', expert: 'حرفه‌ای' };

    const STEPS = [
        { id: 'peak', title: 'مقصد', question: 'کدوم قله یا منطقه مدنظرته؟' },
        { id: 'level', title: 'تجربه', question: 'سطح تجربه کوهنوردی‌ات چقدره؟' },
        { id: 'days', title: 'مدت', question: 'چند روز وقت داری؟' },
        { id: 'group', title: 'گروه', question: 'چند نفر هستید؟' },
        { id: 'season', title: 'فصل', question: 'چه فصلی برنامه‌ریزی می‌کنی؟' }
    ];

    let stepIndex = 0;
    const answers = {};

    const modal = document.getElementById('tourPlannerModal');
    if (!modal) return;

    const overlay = document.getElementById('tourPlannerOverlay');
    const wizardEl = document.getElementById('tourWizard');
    const resultEl = document.getElementById('tourResult');
    const stepTitle = document.getElementById('tourStepTitle');
    const stepQuestion = document.getElementById('tourStepQuestion');
    const stepBody = document.getElementById('tourStepBody');
    const progressBar = document.getElementById('tourProgressBar');
    const btnBack = document.getElementById('tourBtnBack');
    const btnNext = document.getElementById('tourBtnNext');
    const planContent = document.getElementById('tourPlanPdfContent');

    document.querySelectorAll('[data-tour-planner]').forEach(el => {
        el.addEventListener('click', openModal);
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); }
        });
    });

    document.getElementById('tourPlannerClose')?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
    document.getElementById('tourBtnClose')?.addEventListener('click', closeModal);
    document.getElementById('tourBtnRestart')?.addEventListener('click', restartWizard);
    document.getElementById('tourBtnPdf')?.addEventListener('click', downloadPdf);
    btnBack?.addEventListener('click', prevStep);
    btnNext?.addEventListener('click', nextStep);

    loadPeaks();

    function loadPeaks() {
        fetch('data/tour-planner-peaks.json')
            .then(function (r) {
                if (!r.ok) throw new Error('tour peaks not found');
                return r.json();
            })
            .then(function (data) {
                PEAKS = data;
                peaksReady = true;
            })
            .catch(function (err) {
                console.error('tour-planner peaks', err);
            });
    }

    function peakButtonsHtml(filter) {
        const q = (filter || '').trim();
        const list = q
            ? PEAKS.filter(function (p) { return p.name.includes(q); })
            : PEAKS;
        return list.map(function (p) {
            return `
                <button type="button" class="tour-opt${answers.peak === p.name ? ' selected' : ''}" data-val="${p.name}"${answers.peak === p.name ? ' aria-pressed="true"' : ' aria-pressed="false"'}>
                    <span class="tour-opt-label">${p.name}</span>
                    <span class="tour-opt-sub">${p.elevation.toLocaleString('fa-IR')} م · ${p.difficulty}</span>
                </button>`;
        }).join('');
    }

    function bindPeakOptions() {
        stepBody.querySelectorAll('.tour-opt').forEach(function (btn) {
            btn.addEventListener('click', function () {
                stepBody.querySelectorAll('.tour-opt').forEach(function (b) {
                    b.classList.remove('selected');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('selected');
                btn.setAttribute('aria-pressed', 'true');
                answers.peak = btn.dataset.val;
            });
        });
    }

    function renderPeakStep() {
        if (!peaksReady) {
            stepBody.innerHTML = '<p class="tour-loading-peaks">در حال بارگذاری لیست قله‌ها…</p>';
            const wait = setInterval(function () {
                if (peaksReady) {
                    clearInterval(wait);
                    renderPeakStep();
                }
            }, 120);
            return;
        }

        stepBody.innerHTML = `
            <input type="search" id="tourPeakSearch" class="tour-peak-search" placeholder="جستجوی نام قله (${PEAKS.length} قله)…" autocomplete="off">
            <div class="tour-options tour-options--grid tour-options--scroll" id="tourPeakList">
                <button type="button" class="tour-opt${answers.peak === 'suggest' ? ' selected' : ''}" data-val="suggest"${answers.peak === 'suggest' ? ' aria-pressed="true"' : ' aria-pressed="false"'}>
                    <span class="tour-opt-icon">✨</span>
                    <span class="tour-opt-label">پیشنهاد بدید</span>
                </button>
                ${peakButtonsHtml('')}
            </div>
            <p class="tour-peak-count" id="tourPeakCount">${PEAKS.length} قله</p>`;

        const search = document.getElementById('tourPeakSearch');
        const list = document.getElementById('tourPeakList');
        const count = document.getElementById('tourPeakCount');

        bindPeakOptions();

        search?.addEventListener('input', function () {
            const filtered = PEAKS.filter(function (p) { return p.name.includes(search.value.trim()); });
            list.innerHTML = `
                <button type="button" class="tour-opt${answers.peak === 'suggest' ? ' selected' : ''}" data-val="suggest"${answers.peak === 'suggest' ? ' aria-pressed="true"' : ' aria-pressed="false"'}>
                    <span class="tour-opt-icon">✨</span>
                    <span class="tour-opt-label">پیشنهاد بدید</span>
                </button>
                ${peakButtonsHtml(search.value)}`;
            if (count) {
                count.textContent = filtered.length + ' قله' + (search.value.trim() ? ' یافت شد' : '');
            }
            bindPeakOptions();
        });
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    function openModal() {
        restartWizard();
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function restartWizard() {
        stepIndex = 0;
        Object.keys(answers).forEach(k => delete answers[k]);
        wizardEl.hidden = false;
        resultEl.hidden = true;
        renderStep();
    }

    function renderStep() {
        const step = STEPS[stepIndex];
        stepTitle.textContent = `مرحله ${stepIndex + 1} از ${STEPS.length} — ${step.title}`;
        stepQuestion.textContent = step.question;
        progressBar.style.width = ((stepIndex + 1) / STEPS.length * 100) + '%';
        btnBack.hidden = stepIndex === 0;
        btnNext.textContent = stepIndex === STEPS.length - 1 ? 'ساخت برنامه' : 'بعدی';

        if (step.id === 'peak') {
            renderPeakStep();
            return;
        } else if (step.id === 'level') {
            stepBody.innerHTML = optionButtons('level', [
                ['beginner', 'مبتدی', 'اولین یا دومین صعود'],
                ['intermediate', 'متوسط', 'چند صعود موفق داشتم'],
                ['expert', 'حرفه‌ای', 'کوهنورد با تجربه']
            ]);
        } else if (step.id === 'days') {
            stepBody.innerHTML = optionButtons('days', [
                ['1', '۱ روز', 'صعود روزانه'],
                ['2', '۲ تا ۳ روز', 'یک شب در کوه'],
                ['4', '۴ روز یا بیشتر', 'برنامه extended']
            ]);
        } else if (step.id === 'group') {
            stepBody.innerHTML = optionButtons('group', [
                ['solo', 'تک‌نفره', ''],
                ['2-4', '۲ تا ۴ نفر', ''],
                ['5+', '۵ نفر یا بیشتر', 'گروه بزرگ']
            ]);
        } else if (step.id === 'season') {
            stepBody.innerHTML = optionButtons('season', [
                ['spring', 'بهار', 'فروردین - خرداد'],
                ['summer', 'تابستان', 'تیر - شهریور'],
                ['fall', 'پاییز', 'مهر - آبان'],
                ['winter', 'زمستان', 'آذر - اسفند']
            ]);
        }

        stepBody.querySelectorAll('.tour-opt').forEach(btn => {
            btn.addEventListener('click', () => {
                stepBody.querySelectorAll('.tour-opt').forEach(b => {
                    b.classList.remove('selected');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('selected');
                btn.setAttribute('aria-pressed', 'true');
                answers[step.id] = btn.dataset.val;
            });
        });
    }

    function optionButtons(key, items) {
        return `<div class="tour-options">${items.map(([val, label, sub]) => `
            <button type="button" class="tour-opt${answers[key] === val ? ' selected' : ''}" data-val="${val}"${answers[key] === val ? ' aria-pressed="true"' : ' aria-pressed="false"'}>
                <span class="tour-opt-label">${label}</span>
                ${sub ? `<span class="tour-opt-sub">${sub}</span>` : ''}
            </button>
        `).join('')}</div>`;
    }

    function prevStep() {
        if (stepIndex > 0) { stepIndex--; renderStep(); }
    }

    function nextStep() {
        const step = STEPS[stepIndex];
        if (!answers[step.id]) {
            shake(stepBody);
            return;
        }
        if (stepIndex < STEPS.length - 1) {
            stepIndex++;
            renderStep();
        } else {
            showPlan();
        }
    }

    function shake(el) {
        el.classList.add('tour-shake');
        setTimeout(() => el.classList.remove('tour-shake'), 400);
    }

    function pickPeak() {
        if (!PEAKS.length) return null;
        if (answers.peak !== 'suggest') {
            return PEAKS.find(function (p) { return p.name === answers.peak; }) || PEAKS[0];
        }
        const level = LEVEL_RANK[LEVEL_LABEL[answers.level]] || 1;
        const days = parseInt(answers.days, 10) || 1;
        const scored = PEAKS.map(p => {
            let score = 0;
            if (LEVEL_RANK[p.minLevel] <= level) score += 3;
            if (p.minDays <= days) score += 2;
            if (answers.level === 'beginner' && p.difficulty === 'آسان') score += 4;
            if (answers.level === 'expert' && p.difficulty === 'خیلی‌سخت') score += 3;
            if (days === 1 && p.minDays === 1) score += 3;
            return { p, score };
        }).sort((a, b) => b.score - a.score);
        return scored[0].p;
    }

    function buildDayPlan(peak, days) {
        const n = days === '1' ? 1 : days === '2' ? 3 : 4;
        const daysArr = [];
        if (n === 1) {
            daysArr.push({ day: 1, title: 'صعود و بازگشت', items: [
                'حرکت سحرگاه (۵:۰۰) از نقطه شروع',
                `صعود تا قله ${peak.name} (${peak.elevation.toLocaleString('fa-IR')} م)`,
                'استراحت در قله و عکاسی (۳۰-۴۵ دقیقه)',
                'فرود تا پایگاه و بازگشت'
            ]});
        } else if (n <= 3) {
            daysArr.push({ day: 1, title: 'رسیدن به پایگاه', items: [
                'حرکت از شهر مبدا به نقطه شروع مسیر',
                'پیاده‌روی تا پناهگاه / اردوگاه',
                'استقرار، آماده‌سازی تجهیزات و استراحت',
                'بررسی آب‌وهوا و هماهنگی با گروه'
            ]});
            daysArr.push({ day: 2, title: 'روز صعود', items: [
                'شروع حرکت قبل از طلوع (۴:۰۰-۵:۰۰)',
                `صعود به قله ${peak.name}`,
                'بازگشت به پناهگاه یا فرود تا پایین (بسته به شرایط)',
                'جشن کوه در صورت موفقیت!'
            ]});
            if (n === 3) {
                daysArr.push({ day: 3, title: 'روز احتیاط / بازگشت', items: [
                    'روز رزرو برای تأخیر آب‌وهوایی',
                    'یا فرود کامل و بازگشت به شهر',
                    'استراحت و مرور مسیر'
                ]});
            }
        } else {
            daysArr.push({ day: 1, title: 'آمادگی و انتقال', items: ['سفر به منطقه', 'خرید نان و آب', 'استقرار در اردوگاه'] });
            daysArr.push({ day: 2, title: 'آکلیماتیزاسیون', items: ['پیاده‌روی سبک', 'آشنایی با مسیر', 'آماده‌سازی بار'] });
            daysArr.push({ day: 3, title: 'صعود', items: [`تلاش برای قله ${peak.name}`, 'بازگشت به پناهگاه'] });
            daysArr.push({ day: 4, title: 'بازگشت', items: ['فرود کامل', 'بازگشت به شهر'] });
        }
        return daysArr;
    }

    function gearList(season, level) {
        const base = [
            'کفش کوهنوردی مناسب', 'کوله‌پشتی ۳۰-۴۵ لیتری', 'چوب کوهنوردی',
            'لباس سه‌لایه', 'کلاه و دستکش', 'عینک آفتابی', 'کرم ضدآفتاب',
            'قمقمه (حداقل ۲ لیتر)', 'غذای سبک و انرژی‌زا', 'کیت کمک‌های اولیه',
            'چراغ‌قوه + باتری یدک', 'نقشه / GPS / اپ آفلاین', 'سوت اضطراری'
        ];
        if (season === 'winter') base.push('گتر', 'کرامپون', 'لباس گرم اضافی', 'پتو اضطراری');
        if (level === 'expert') base.push('طناب و تجهیزات در صورت نیاز فنی');
        return base;
    }

    function showPlan() {
        const peak = pickPeak();
        if (!peak) {
            alert('لیست قله‌ها هنوز بارگذاری نشده. لطفاً چند ثانیه صبر کنید.');
            return;
        }
        const levelFa = LEVEL_LABEL[answers.level];
        const seasonFa = { spring: 'بهار', summer: 'تابستان', fall: 'پاییز', winter: 'زمستان' }[answers.season];
        const groupFa = { solo: 'تک‌نفره', '2-4': '۲ تا ۴ نفر', '5+': '۵+ نفر' }[answers.group];
        const daysFa = { '1': '۱ روز', '2': '۲ تا ۳ روز', '4': '۴+ روز' }[answers.days];
        const dayPlan = buildDayPlan(peak, answers.days);
        const today = new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
        const levelOk = LEVEL_RANK[levelFa] >= LEVEL_RANK[peak.minLevel];

        planContent.innerHTML = `
            <div class="tour-watermarks" aria-hidden="true">${Array(12).fill(`<span>${SITE}</span>`).join('')}</div>
            <div class="tour-plan-inner">
                <header class="tour-plan-header">
                    <div class="tour-plan-brand">سه تیغ · ${SITE}</div>
                    <h2>برنامه کوهنوردی — ${peak.name}</h2>
                    <p class="tour-plan-date">تاریخ تهیه: ${today}</p>
                </header>

                <table class="tour-plan-meta">
                    <tr><th>قله</th><td>${peak.name} (${peak.elevation.toLocaleString('fa-IR')} م)</td></tr>
                    <tr><th>استان</th><td>${peak.province}</td></tr>
                    <tr><th>سختی</th><td>${peak.difficulty}</td></tr>
                    <tr><th>مسیر پیشنهادی</th><td>${peak.route}</td></tr>
                    <tr><th>بهترین فصل</th><td>${peak.bestSeason}</td></tr>
                    <tr><th>سطح شما</th><td>${levelFa}${levelOk ? '' : ' ⚠️ این قله برای سطح بالاتر توصیه می‌شود'}</td></tr>
                    <tr><th>مدت برنامه</th><td>${daysFa}</td></tr>
                    <tr><th>اندازه گروه</th><td>${groupFa}</td></tr>
                    <tr><th>فصل برنامه‌ریزی</th><td>${seasonFa}</td></tr>
                </table>

                ${peak.shelters.length ? `
                <section class="tour-plan-section">
                    <h3>🏕 پناهگاه / توقف</h3>
                    <ul>${peak.shelters.map(s => `<li>${s}</li>`).join('')}</ul>
                </section>` : ''}

                <section class="tour-plan-section">
                    <h3>📅 برنامه روزانه</h3>
                    ${dayPlan.map(d => `
                        <div class="tour-day">
                            <h4>روز ${d.day.toLocaleString('fa-IR')} — ${d.title}</h4>
                            <ol>${d.items.map(i => `<li>${i}</li>`).join('')}</ol>
                        </div>
                    `).join('')}
                </section>

                <section class="tour-plan-section">
                    <h3>🎒 چک‌لیست تجهیزات</h3>
                    <ul class="tour-gear-list">${gearList(answers.season, answers.level).map(g => `<li>${g}</li>`).join('')}</ul>
                </section>

                <section class="tour-plan-section tour-plan-safety">
                    <h3>⚠️ نکات ایمنی</h3>
                    <ul>
                        <li>قبل از حرکت وضعیت آب‌وهوا را از منابع معتبر بررسی کنید.</li>
                        <li>حتماً برنامه خود را به خانواده یا دوستان اطلاع دهید.</li>
                        <li>در ارتفاع بالای ۳۵۰۰ متر، علائم بیماری ارتفاع را بشناسید.</li>
                        <li>آب کافی، غذای کافی و لباس گرم اضافی همراه داشته باشید.</li>
                        ${answers.group === 'solo' ? '<li><strong>تک‌نفره:</strong> صعود تنها ریسک بیشتری دارد؛ راهنمای محلی توصیه می‌شود.</li>' : ''}
                    </ul>
                </section>

                <footer class="tour-plan-footer">
                    <p>این برنامه پیشنهادی است و جایگزین مشورت با راهنمای حرفه‌ای نیست.</p>
                    <p><strong>${SITE}</strong> — راهنمای جامع کوهنوردی ایران</p>
                    ${peak.link ? `<p>اطلاعات بیشتر: <a href="${peak.link}">${SITE}/${peak.link}</a></p>` : ''}
                </footer>
            </div>`;

        wizardEl.hidden = true;
        resultEl.hidden = false;
        resultEl.scrollTop = 0;
    }

    async function downloadPdf() {
        const btn = document.getElementById('tourBtnPdf');
        if (!window.html2canvas || !window.jspdf) {
            alert('کتابخانه PDF در حال بارگذاری است. لطفاً چند ثانیه صبر کنید و دوباره تلاش کنید.');
            return;
        }
        btn.disabled = true;
        btn.textContent = 'در حال ساخت PDF…';

        try {
            const el = planContent;
            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 36;
            const contentW = pageW - margin * 2;
            const scale = contentW / canvas.width;
            const pageContentH = pageH - margin * 2;
            const slicePx = pageContentH / scale;

            let srcY = 0;
            let pageNum = 0;

            while (srcY < canvas.height) {
                if (pageNum > 0) pdf.addPage();

                const sliceH = Math.min(slicePx, canvas.height - srcY);
                const slice = document.createElement('canvas');
                slice.width = canvas.width;
                slice.height = sliceH;
                slice.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

                pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, contentW, sliceH * scale);
                drawPdfWatermark(pdf, pageW, pageH);
                srcY += sliceH;
                pageNum++;
            }

            pdf.save(`برنامه-کوهنوردی-${SITE}.pdf`);
        } catch (err) {
            console.error(err);
            alert('ساخت PDF ممکن نشد. لطفاً دوباره تلاش کنید.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'دانلود PDF';
        }
    }

    function drawPdfWatermark(pdf, w, h) {
        try {
            pdf.saveGraphicsState();
            const GState = pdf.GState || (window.jspdf && window.jspdf.GState);
            if (GState && pdf.setGState) {
                pdf.setGState(new GState({ opacity: 0.1 }));
            }
            pdf.setFontSize(42);
            pdf.setTextColor(180, 140, 90);
            for (let y = 80; y < h; y += 140) {
                for (let x = 30; x < w; x += 160) {
                    pdf.text(SITE, x, y, { angle: -35 });
                }
            }
            pdf.restoreGraphicsState();
        } catch (_) { /* watermark optional */ }
        pdf.setFontSize(9);
        pdf.setTextColor(120, 110, 100);
        pdf.text(SITE, w / 2, h - 16, { align: 'center' });
    }
})();
