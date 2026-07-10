(function () {
    'use strict';

    const SITE = '3tiq.ir';

    let PEAKS = [];
    let peaksReady = false;

    const LEVEL_RANK = { 'مبتدی': 1, 'متوسط': 2, 'حرفه‌ای': 3 };
    const LEVEL_LABEL = { beginner: 'مبتدی', intermediate: 'متوسط', expert: 'حرفه‌ای' };

    const STEPS_FA = [
        { id: 'peak', title: 'مقصد', question: 'کدوم قله یا منطقه مدنظرته؟' },
        { id: 'level', title: 'تجربه', question: 'سطح تجربه کوهنوردی‌ات چقدره؟' },
        { id: 'days', title: 'مدت', question: 'چند روز وقت داری؟' },
        { id: 'group', title: 'گروه', question: 'چند نفر هستید؟' },
        { id: 'season', title: 'فصل', question: 'چه فصلی برنامه‌ریزی می‌کنی؟' },
        { id: 'departure', title: 'زمان حرکت', question: 'چه روز و ساعتی حرکت می‌کنی؟' }
    ];

    function buildSteps() {
        if (!window.I18n) return STEPS_FA.slice();
        return [
            { id: 'peak', title: I18n.t('tour.step.peak'), question: I18n.t('tour.q.peak') },
            { id: 'level', title: I18n.t('tour.step.level'), question: I18n.t('tour.q.level') },
            { id: 'days', title: I18n.t('tour.step.days'), question: I18n.t('tour.q.days') },
            { id: 'group', title: I18n.t('tour.step.group'), question: I18n.t('tour.q.group') },
            { id: 'season', title: I18n.t('tour.step.season'), question: I18n.t('tour.q.season') },
            { id: 'departure', title: I18n.t('tour.step.departure'), question: I18n.t('tour.q.departure') }
        ];
    }

    let STEPS = buildSteps();

    function tr(key, fallback) {
        return window.I18n ? I18n.t(key) : fallback;
    }

    function isEn() {
        return window.I18n && I18n.isEn();
    }

    function localeNum(n) {
        return isEn() ? String(n) : n.toLocaleString('fa-IR');
    }

    function levelOptions() {
        return [
            ['beginner', tr('tour.level.beginner', 'مبتدی'), tr('tour.level.beginnerDesc', 'اولین یا دومین صعود')],
            ['intermediate', tr('tour.level.intermediate', 'متوسط'), tr('tour.level.intermediateDesc', 'چند صعود موفق داشتم')],
            ['expert', tr('tour.level.expert', 'حرفه‌ای'), tr('tour.level.expertDesc', 'کوهنورد با تجربه')]
        ];
    }

    function daysOptions() {
        return [
            ['1', tr('tour.days.1', '۱ روز'), tr('tour.days.1Desc', 'صعود روزانه')],
            ['2', tr('tour.days.2', '۲ تا ۳ روز'), tr('tour.days.2Desc', 'یک شب در کوه')],
            ['4', tr('tour.days.4', '۴ روز یا بیشتر'), tr('tour.days.4Desc', 'برنامه extended')]
        ];
    }

    function groupOptions() {
        return [
            ['solo', tr('tour.group.solo', 'تک‌نفره'), ''],
            ['2-4', tr('tour.group.2-4', '۲ تا ۴ نفر'), ''],
            ['5+', tr('tour.group.5+', '۵ نفر یا بیشتر'), tr('tour.group.5+Desc', 'گروه بزرگ')]
        ];
    }

    function seasonOptions() {
        return [
            ['spring', tr('tour.season.spring', 'بهار'), tr('tour.season.springDesc', 'فروردین - خرداد')],
            ['summer', tr('tour.season.summer', 'تابستان'), tr('tour.season.summerDesc', 'تیر - شهریور')],
            ['fall', tr('tour.season.fall', 'پاییز'), tr('tour.season.fallDesc', 'مهر - آبان')],
            ['winter', tr('tour.season.winter', 'زمستان'), tr('tour.season.winterDesc', 'آذر - اسفند')]
        ];
    }

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

    document.addEventListener('3tiq:languagechange', function () {
        STEPS = buildSteps();
        if (modal && modal.classList.contains('open')) {
            if (wizardEl && !wizardEl.hidden) {
                renderStep();
            }
        }
        var pdfBtn = document.getElementById('tourBtnPdf');
        if (pdfBtn && window.I18n) pdfBtn.textContent = I18n.t('tour.pdf');
    });

    loadPeaks();

    const JALALI_MONTHS = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    const WEEKDAYS_FA = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

    function div(a, b) { return ~~(a / b); }

    function gregorianToJalali(gy, gm, gd) {
        var g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        var gy2 = (gm > 2) ? (gy + 1) : gy;
        var days = 355666 + (365 * gy) + div(gy2 + 3, 4) - div(gy2 + 99, 100) + div(gy2 + 399, 400) + gd + g_d_m[gm - 1];
        var jy = -1595 + (33 * div(days, 12053));
        days %= 12053;
        jy += 4 * div(days, 1461);
        days %= 1461;
        if (days > 365) {
            jy += div(days - 1, 365);
            days = (days - 1) % 365;
        }
        var jm, jd;
        if (days < 186) {
            jm = 1 + div(days, 31);
            jd = 1 + (days % 31);
        } else {
            jm = 7 + div(days - 186, 30);
            jd = 1 + ((days - 186) % 30);
        }
        return [jy, jm, jd];
    }

    function jalaliToGregorian(jy, jm, jd) {
        var jy2 = jy + 1595;
        var days = -355668 + (365 * jy2) + div(jy2, 33) * 8 + div(((jy2 % 33) + 3), 4) + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
        var gy = 400 * div(days, 146097);
        days %= 146097;
        if (days > 36524) {
            gy += 100 * div(--days, 36524);
            days %= 36524;
            if (days >= 365) days++;
        }
        gy += 4 * div(days, 1461);
        days %= 1461;
        if (days > 365) {
            gy += div(days - 1, 365);
            days = (days - 1) % 365;
        }
        var gd = days + 1;
        var sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var gm = 0;
        while (gm < 13 && gd > sal_a[gm]) {
            gd -= sal_a[gm++];
        }
        return [gy, gm, gd];
    }

    function jalaliMonthLength(jy, jm) {
        if (jm <= 6) return 31;
        if (jm <= 11) return 30;
        var r = jy % 33;
        if (r === 1 || r === 5 || r === 9 || r === 13 || r === 17 || r === 22 || r === 26 || r === 30) return 30;
        return 29;
    }

    function pad2(n) { return String(n).padStart(2, '0'); }

    function toIsoDate(gy, gm, gd) {
        return gy + '-' + pad2(gm) + '-' + pad2(gd);
    }

    function todayIso() {
        var n = new Date();
        return toIsoDate(n.getFullYear(), n.getMonth() + 1, n.getDate());
    }

    function todayJalali() {
        var n = new Date();
        var p = gregorianToJalali(n.getFullYear(), n.getMonth() + 1, n.getDate());
        return { jy: p[0], jm: p[1], jd: p[2] };
    }

    function isoToJalali(iso) {
        var parts = iso.split('-').map(Number);
        var p = gregorianToJalali(parts[0], parts[1], parts[2]);
        return { jy: p[0], jm: p[1], jd: p[2] };
    }

    function jalaliToIso(jy, jm, jd) {
        var p = jalaliToGregorian(jy, jm, jd);
        return toIsoDate(p[0], p[1], p[2]);
    }

    function formatJalaliLong(isoOrJy, jm, jd) {
        var jy, m, d;
        if (typeof isoOrJy === 'string') {
            var j = isoToJalali(isoOrJy);
            jy = j.jy; m = j.jm; d = j.jd;
        } else {
            jy = isoOrJy; m = jm; d = jd;
        }
        var g = jalaliToGregorian(jy, m, d);
        var dt = new Date(g[0], g[1] - 1, g[2]);
        return WEEKDAYS_FA[dt.getDay()] + ' ' +
            d.toLocaleString('fa-IR') + ' ' + JALALI_MONTHS[m - 1] + ' ' +
            jy.toLocaleString('fa-IR');
    }

    function formatJalaliShort(iso) {
        var j = isoToJalali(iso);
        return j.jd.toLocaleString('fa-IR') + ' ' + JALALI_MONTHS[j.jm - 1] + ' ' + j.jy.toLocaleString('fa-IR');
    }

    function formatTimeFa(timeStr) {
        var parts = (timeStr || '05:00').split(':');
        var h = Number(parts[0]);
        var m = Number(parts[1] || 0);
        return h.toLocaleString('fa-IR') + ':' + m.toLocaleString('fa-IR', { minimumIntegerDigits: 2 });
    }

    function buildTimeString(h, m) {
        return pad2(h) + ':' + pad2(m);
    }

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
            stepBody.innerHTML = '<p class="tour-loading-peaks">' + tr('tour.loadingPeaks', 'در حال بارگذاری لیست قله‌ها…') + '</p>';
            const wait = setInterval(function () {
                if (peaksReady) {
                    clearInterval(wait);
                    renderPeakStep();
                }
            }, 120);
            return;
        }

        stepBody.innerHTML = `
            <input type="search" id="tourPeakSearch" class="tour-peak-search" placeholder="${tr('tour.searchPeak', 'جستجوی قله…')} (${localeNum(PEAKS.length)})" autocomplete="off">
            <div class="tour-options tour-options--grid tour-options--scroll" id="tourPeakList">
                <button type="button" class="tour-opt${answers.peak === 'suggest' ? ' selected' : ''}" data-val="suggest"${answers.peak === 'suggest' ? ' aria-pressed="true"' : ' aria-pressed="false"'}>
                    <span class="tour-opt-icon">✨</span>
                    <span class="tour-opt-label">${tr('tour.suggest', 'پیشنهاد بدید')}</span>
                </button>
                ${peakButtonsHtml('')}
            </div>
            <p class="tour-peak-count" id="tourPeakCount">${tr('tour.peakCount', '{n} قله').replace('{n}', localeNum(PEAKS.length))}</p>`;

        const search = document.getElementById('tourPeakSearch');
        const list = document.getElementById('tourPeakList');
        const count = document.getElementById('tourPeakCount');

        bindPeakOptions();

        search?.addEventListener('input', function () {
            const filtered = PEAKS.filter(function (p) { return p.name.includes(search.value.trim()); });
            list.innerHTML = `
                <button type="button" class="tour-opt${answers.peak === 'suggest' ? ' selected' : ''}" data-val="suggest"${answers.peak === 'suggest' ? ' aria-pressed="true"' : ' aria-pressed="false"'}>
                    <span class="tour-opt-icon">✨</span>
                    <span class="tour-opt-label">${tr('tour.suggest', 'پیشنهاد بدید')}</span>
                </button>
                ${peakButtonsHtml(search.value)}`;
            if (count) {
                const n = localeNum(filtered.length);
                count.textContent = search.value.trim()
                    ? tr('tour.peakFound', '{n} قله یافت شد').replace('{n}', n)
                    : tr('tour.peakCount', '{n} قله').replace('{n}', n);
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
        stepTitle.textContent = tr('tour.stepOf', 'مرحله {n} از {total} — {title}')
            .replace('{n}', localeNum(stepIndex + 1))
            .replace('{total}', localeNum(STEPS.length))
            .replace('{title}', step.title);
        stepQuestion.textContent = step.question;
        progressBar.style.width = ((stepIndex + 1) / STEPS.length * 100) + '%';
        btnBack.hidden = stepIndex === 0;
        btnNext.textContent = stepIndex === STEPS.length - 1
            ? tr('tour.build', 'ساخت برنامه')
            : tr('tour.next', 'بعدی');

        if (step.id === 'peak') {
            renderPeakStep();
            return;
        } else if (step.id === 'level') {
            stepBody.innerHTML = optionButtons('level', levelOptions());
        } else if (step.id === 'days') {
            stepBody.innerHTML = optionButtons('days', daysOptions());
        } else if (step.id === 'group') {
            stepBody.innerHTML = optionButtons('group', groupOptions());
        } else if (step.id === 'season') {
            stepBody.innerHTML = optionButtons('season', seasonOptions());
        } else if (step.id === 'departure') {
            renderDepartureStep();
            return;
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

    function renderDepartureStep() {
        if (isEn()) {
            renderDepartureStepEn();
            return;
        }

        const savedTime = answers.departureTime || '05:00';
        const savedParts = savedTime.split(':');
        let savedH = Number(savedParts[0]);
        let savedM = Math.round(Number(savedParts[1] || 0) / 5) * 5;
        if (savedM === 60) savedM = 55;

        const todayJ = todayJalali();
        let jy, jm, jd;
        if (answers.departureDate) {
            const j = isoToJalali(answers.departureDate);
            jy = j.jy; jm = j.jm; jd = j.jd;
        } else {
            jy = todayJ.jy; jm = todayJ.jm; jd = todayJ.jd;
        }

        const yearOptions = [todayJ.jy, todayJ.jy + 1].map(function (y) {
            return '<option value="' + y + '"' + (y === jy ? ' selected' : '') + '>' + y.toLocaleString('fa-IR') + '</option>';
        }).join('');

        const monthOptions = JALALI_MONTHS.map(function (name, i) {
            const m = i + 1;
            return '<option value="' + m + '"' + (m === jm ? ' selected' : '') + '>' + name + '</option>';
        }).join('');

        const maxDay = jalaliMonthLength(jy, jm);
        const dayOptions = [];
        for (let d = 1; d <= maxDay; d++) {
            dayOptions.push('<option value="' + d + '"' + (d === jd ? ' selected' : '') + '>' + d.toLocaleString('fa-IR') + '</option>');
        }

        let hourOptions = '';
        for (let h = 0; h < 24; h++) {
            hourOptions += '<option value="' + h + '"' + (h === savedH ? ' selected' : '') + '>' + h.toLocaleString('fa-IR') + '</option>';
        }

        let minuteOptions = '';
        for (let m = 0; m < 60; m += 5) {
            minuteOptions += '<option value="' + m + '"' + (m === savedM ? ' selected' : '') + '>' + m.toLocaleString('fa-IR', { minimumIntegerDigits: 2 }) + '</option>';
        }

        stepBody.innerHTML = `
            <div class="tour-departure-fields">
                <label class="tour-field">
                    <span class="tour-field-label">${tr('tour.departure.date', 'تاریخ حرکت (شمسی)')}</span>
                    <div class="tour-jalali-date">
                        <select id="tourJy" class="tour-date-input tour-date-select" aria-label="سال">${yearOptions}</select>
                        <select id="tourJm" class="tour-date-input tour-date-select" aria-label="ماه">${monthOptions}</select>
                        <select id="tourJd" class="tour-date-input tour-date-select" aria-label="روز">${dayOptions.join('')}</select>
                    </div>
                </label>
                <label class="tour-field">
                    <span class="tour-field-label">${tr('tour.departure.time', 'ساعت حرکت')}</span>
                    <div class="tour-jalali-time">
                        <select id="tourHour" class="tour-date-input tour-date-select" aria-label="ساعت">${hourOptions}</select>
                        <span class="tour-time-sep" aria-hidden="true">:</span>
                        <select id="tourMinute" class="tour-date-input tour-date-select" aria-label="دقیقه">${minuteOptions}</select>
                    </div>
                </label>
            </div>
            <p class="tour-departure-hint">اگر حرکت بین ۱ تا ۱۰ روز آینده باشد، پیش‌بینی آب‌وهوا برای تمام روزهای برنامه (از روز حرکت) به گزارش اضافه می‌شود.</p>`;

        function syncTime() {
            const h = Number(document.getElementById('tourHour').value);
            const m = Number(document.getElementById('tourMinute').value);
            answers.departureTime = buildTimeString(h, m);
        }

        function syncFromJalali() {
            const y = Number(document.getElementById('tourJy').value);
            const m = Number(document.getElementById('tourJm').value);
            const dayEl = document.getElementById('tourJd');
            const prevDay = Number(dayEl.value) || 1;
            const maxD = jalaliMonthLength(y, m);
            dayEl.innerHTML = '';
            for (let d = 1; d <= maxD; d++) {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d.toLocaleString('fa-IR');
                if (d === Math.min(prevDay, maxD)) opt.selected = true;
                dayEl.appendChild(opt);
            }
            const jd = Number(dayEl.value);
            answers.departureDate = jalaliToIso(y, m, jd);
            answers.departureJalali = { jy: y, jm: m, jd: jd };
        }

        document.getElementById('tourJy')?.addEventListener('change', syncFromJalali);
        document.getElementById('tourJm')?.addEventListener('change', syncFromJalali);
        document.getElementById('tourJd')?.addEventListener('change', syncFromJalali);
        document.getElementById('tourHour')?.addEventListener('change', syncTime);
        document.getElementById('tourMinute')?.addEventListener('change', syncTime);

        syncFromJalali();
        syncTime();
    }

    function renderDepartureStepEn() {
        const savedTime = answers.departureTime || '05:00';
        const savedParts = savedTime.split(':');
        let savedH = Number(savedParts[0]);
        let savedM = Math.round(Number(savedParts[1] || 0) / 5) * 5;
        if (savedM === 60) savedM = 55;

        const dateVal = answers.departureDate || todayIso();

        let hourOptions = '';
        for (let h = 0; h < 24; h++) {
            hourOptions += '<option value="' + h + '"' + (h === savedH ? ' selected' : '') + '>' + h + '</option>';
        }
        let minuteOptions = '';
        for (let m = 0; m < 60; m += 5) {
            minuteOptions += '<option value="' + m + '"' + (m === savedM ? ' selected' : '') + '>' + String(m).padStart(2, '0') + '</option>';
        }

        stepBody.innerHTML = `
            <div class="tour-departure-fields">
                <label class="tour-field">
                    <span class="tour-field-label">${tr('tour.departure.date', 'Departure date')}</span>
                    <input type="date" id="tourGregDate" class="tour-date-input" value="${dateVal}">
                </label>
                <label class="tour-field">
                    <span class="tour-field-label">${tr('tour.departure.time', 'Departure time')}</span>
                    <div class="tour-jalali-time">
                        <select id="tourHour" class="tour-date-input tour-date-select" aria-label="Hour">${hourOptions}</select>
                        <span class="tour-time-sep" aria-hidden="true">:</span>
                        <select id="tourMinute" class="tour-date-input tour-date-select" aria-label="Minute">${minuteOptions}</select>
                    </div>
                </label>
            </div>
            <p class="tour-departure-hint">Weather forecast is added when departure is within the next 1–10 days.</p>`;

        function syncTime() {
            answers.departureTime = buildTimeString(
                Number(document.getElementById('tourHour').value),
                Number(document.getElementById('tourMinute').value)
            );
        }

        document.getElementById('tourGregDate')?.addEventListener('change', function () {
            answers.departureDate = document.getElementById('tourGregDate').value;
        });
        document.getElementById('tourHour')?.addEventListener('change', syncTime);
        document.getElementById('tourMinute')?.addEventListener('change', syncTime);

        answers.departureDate = dateVal;
        syncTime();
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
        if (step.id === 'departure') {
            const hourEl = document.getElementById('tourHour');
            const minuteEl = document.getElementById('tourMinute');
            if (hourEl && minuteEl) {
                answers.departureTime = buildTimeString(Number(hourEl.value), Number(minuteEl.value));
            }
            const gregEl = document.getElementById('tourGregDate');
            if (gregEl) {
                answers.departureDate = gregEl.value;
            } else {
                const jyEl = document.getElementById('tourJy');
                const jmEl = document.getElementById('tourJm');
                const jdEl = document.getElementById('tourJd');
                if (jyEl && jmEl && jdEl) {
                    answers.departureDate = jalaliToIso(Number(jyEl.value), Number(jmEl.value), Number(jdEl.value));
                }
            }
            if (!answers.departureDate || answers.departureDate < todayIso()) {
                shake(stepBody);
                return;
            }
        } else if (!answers[step.id]) {
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

    function formatStartCities(peak) {
        const cities = peak.startCities || [];
        if (!cities.length) return 'نقطه شروع مسیر (جزئیات در صفحه قله)';
        if (cities.length === 1) return cities[0];
        return cities.join('، ');
    }

    function formatDepartureLabel() {
        if (!answers.departureDate) return '—';
        var dateFa = formatJalaliLong(answers.departureDate);
        if (answers.departureTime) {
            return dateFa + ' — ساعت ' + formatTimeFa(answers.departureTime);
        }
        return dateFa;
    }

    function daysUntilDeparture(dateStr) {
        const parts = dateStr.split('-').map(Number);
        const dep = new Date(parts[0], parts[1] - 1, parts[2]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dep.setHours(0, 0, 0, 0);
        return Math.round((dep - today) / 86400000);
    }

    function weatherLabel(code) {
        const map = {
            0: '☀️ آفتابی',
            1: '🌤 عمدتاً آفتابی',
            2: '⛅ نیمه‌ابری',
            3: '☁️ ابری',
            45: '🌫 مه',
            48: '🌫 مه',
            51: '🌦 نم‌نم باران',
            53: '🌦 نم‌نم باران',
            55: '🌦 نم‌نم باران',
            61: '🌧 بارانی',
            63: '🌧 بارانی',
            65: '🌧 باران شدید',
            71: '🌨 برف',
            73: '🌨 برف',
            75: '🌨 برف سنگین',
            77: '🌨 دانه برف',
            80: '🌦 رگبار',
            81: '🌦 رگبار',
            82: '⛈ رگبار شدید',
            85: '🌨 برف',
            86: '🌨 برف سنگین',
            95: '⛈ رعد و برق',
            96: '⛈ تگرگ',
            99: '⛈ تگرگ شدید'
        };
        return map[code] || '🌡 نامشخص';
    }

    function planDurationDays(daysKey) {
        const d = daysKey || answers.days;
        if (d === '1') return 1;
        if (d === '2') return 3;
        return 4;
    }

    async function fetchWeatherForecast(peak, dateStr, duration) {
        if (!peak.lat || !peak.lng || !dateStr || duration < 1) return null;
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + peak.lat +
            '&longitude=' + peak.lng +
            '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max' +
            '&timezone=Asia%2FTehran&forecast_days=16';
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const daily = data.daily;
        if (!daily || !daily.time) return null;
        const startIdx = daily.time.indexOf(dateStr);
        if (startIdx < 0) return null;

        const forecasts = [];
        for (let i = 0; i < duration; i++) {
            const idx = startIdx + i;
            if (idx >= daily.time.length) break;
            forecasts.push({
                date: daily.time[idx],
                dayNum: i + 1,
                label: weatherLabel(daily.weathercode[idx]),
                tMax: Math.round(daily.temperature_2m_max[idx]),
                tMin: Math.round(daily.temperature_2m_min[idx]),
                rain: daily.precipitation_sum[idx],
                wind: Math.round(daily.windspeed_10m_max[idx])
            });
        }
        return forecasts.length ? forecasts : null;
    }

    function buildDayPlan(peak, days) {
        const n = planDurationDays(days);
        const start = formatStartCities(peak);
        const fromLine = peak.startCities && peak.startCities.length > 1
            ? 'حرکت از یکی از شهرهای مبدا: ' + start
            : 'حرکت از ' + start;
        const returnLine = peak.startCities && peak.startCities.length > 1
            ? 'بازگشت به ' + peak.startCities[0]
            : 'بازگشت به ' + start;
        const daysArr = [];
        if (n === 1) {
            daysArr.push({ day: 1, title: 'صعود و بازگشت', items: [
                fromLine + ' (سحرگاه)',
                'صعود تا قله ' + peak.name + ' (' + peak.elevation.toLocaleString('fa-IR') + ' م)',
                'استراحت در قله و عکاسی (۳۰-۴۵ دقیقه)',
                returnLine
            ]});
        } else if (n <= 3) {
            daysArr.push({ day: 1, title: 'رسیدن به پایگاه', items: [
                fromLine + ' به نقطه شروع مسیر',
                'پیاده‌روی تا پناهگاه / اردوگاه',
                'استقرار، آماده‌سازی تجهیزات و استراحت',
                'بررسی آب‌وهوا و هماهنگی با گروه'
            ]});
            daysArr.push({ day: 2, title: 'روز صعود', items: [
                'شروع حرکت قبل از طلوع (۴:۰۰-۵:۰۰)',
                'صعود به قله ' + peak.name,
                'بازگشت به پناهگاه یا فرود تا پایین (بسته به شرایط)',
                'جشن کوه در صورت موفقیت!'
            ]});
            if (n === 3) {
                daysArr.push({ day: 3, title: 'روز احتیاط / بازگشت', items: [
                    'روز رزرو برای تأخیر آب‌وهوایی',
                    returnLine,
                    'استراحت و مرور مسیر'
                ]});
            }
        } else {
            daysArr.push({ day: 1, title: 'آمادگی و انتقال', items: [fromLine, 'خرید نان و آب', 'استقرار در اردوگاه'] });
            daysArr.push({ day: 2, title: 'آکلیماتیزاسیون', items: ['پیاده‌روی سبک', 'آشنایی با مسیر', 'آماده‌سازی بار'] });
            daysArr.push({ day: 3, title: 'صعود', items: ['تلاش برای قله ' + peak.name, 'بازگشت به پناهگاه'] });
            daysArr.push({ day: 4, title: 'بازگشت', items: ['فرود کامل', returnLine] });
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

    function renderPlanHtml(peak, weatherBlock) {
        const levelFa = LEVEL_LABEL[answers.level];
        const seasonFa = { spring: 'بهار', summer: 'تابستان', fall: 'پاییز', winter: 'زمستان' }[answers.season];
        const groupFa = { solo: 'تک‌نفره', '2-4': '۲ تا ۴ نفر', '5+': '۵+ نفر' }[answers.group];
        const daysFa = { '1': '۱ روز', '2': '۲ تا ۳ روز', '4': '۴+ روز' }[answers.days];
        const dayPlan = buildDayPlan(peak, answers.days);
        const today = formatJalaliLong(todayIso());
        const levelOk = LEVEL_RANK[levelFa] >= LEVEL_RANK[peak.minLevel];
        const startCities = formatStartCities(peak);

        return `
            <div class="tour-watermarks" aria-hidden="true">${Array(12).fill('<span>' + SITE + '</span>').join('')}</div>
            <div class="tour-plan-inner">
                <header class="tour-plan-header">
                    <div class="tour-plan-brand">سه تیغ · ${SITE}</div>
                    <h2>برنامه کوهنوردی — ${peak.name}</h2>
                    <p class="tour-plan-date">تاریخ تهیه: ${today}</p>
                </header>

                <table class="tour-plan-meta">
                    <tr><th>قله</th><td>${peak.name} (${peak.elevation.toLocaleString('fa-IR')} م)</td></tr>
                    <tr><th>استان</th><td>${peak.province}</td></tr>
                    <tr><th>شهر(های) مبدا</th><td>${startCities}</td></tr>
                    <tr><th>تاریخ حرکت</th><td>${formatDepartureLabel()}</td></tr>
                    <tr><th>سختی</th><td>${peak.difficulty}</td></tr>
                    <tr><th>مسیر پیشنهادی</th><td>${peak.route}</td></tr>
                    <tr><th>بهترین فصل</th><td>${peak.bestSeason}</td></tr>
                    <tr><th>سطح شما</th><td>${levelFa}${levelOk ? '' : ' ⚠️ این قله برای سطح بالاتر توصیه می‌شود'}</td></tr>
                    <tr><th>مدت برنامه</th><td>${daysFa}</td></tr>
                    <tr><th>اندازه گروه</th><td>${groupFa}</td></tr>
                    <tr><th>فصل برنامه‌ریزی</th><td>${seasonFa}</td></tr>
                </table>

                ${weatherBlock || ''}

                ${peak.shelters.length ? `
                <section class="tour-plan-section">
                    <h3>🏕 پناهگاه / توقف</h3>
                    <ul>${peak.shelters.map(function (s) { return '<li>' + s + '</li>'; }).join('')}</ul>
                </section>` : ''}

                <section class="tour-plan-section">
                    <h3>📅 برنامه روزانه</h3>
                    ${dayPlan.map(function (d) {
                        return '<div class="tour-day"><h4>روز ' + d.day.toLocaleString('fa-IR') + ' — ' + d.title + '</h4><ol>' +
                            d.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ol></div>';
                    }).join('')}
                </section>

                <section class="tour-plan-section">
                    <h3>🎒 چک‌لیست تجهیزات</h3>
                    <ul class="tour-gear-list">${gearList(answers.season, answers.level).map(function (g) { return '<li>' + g + '</li>'; }).join('')}</ul>
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
                    ${peak.link ? '<p>اطلاعات بیشتر: <a href="' + peak.link + '">' + SITE + '/' + peak.link + '</a></p>' : ''}
                </footer>
            </div>`;
    }

    function weatherSectionHtml(forecasts, totalDays) {
        if (!forecasts || !forecasts.length) return '';
        const title = forecasts.length === 1
            ? '🌤 پیش‌بینی آب‌وهوا (روز حرکت)'
            : '🌤 پیش‌بینی آب‌وهوا — ' + forecasts.length.toLocaleString('fa-IR') + ' روز (از شروع حرکت)';
        const partialNote = totalDays && forecasts.length < totalDays
            ? '<p class="tour-weather-note tour-weather-note--warn">فقط ' + forecasts.length.toLocaleString('fa-IR') + ' روز اول در بازه پیش‌بینی ۱۶ روزه موجود است.</p>'
            : '';

        const rows = forecasts.map(function (f) {
            const dateFa = formatJalaliLong(f.date);
            const rainText = f.rain > 0
                ? f.rain.toLocaleString('fa-IR') + ' میلی‌متر'
                : '—';
            return `
                <div class="tour-weather-row">
                    <div class="tour-weather-row-head">
                        <span class="tour-weather-day">روز ${f.dayNum.toLocaleString('fa-IR')}</span>
                        <span class="tour-weather-date">${dateFa}</span>
                    </div>
                    <div class="tour-weather-main">${f.label}</div>
                    <div class="tour-weather-stats">
                        <span>🌡 ${f.tMin.toLocaleString('fa-IR')} تا ${f.tMax.toLocaleString('fa-IR')} °C</span>
                        <span>💧 ${rainText}</span>
                        <span>💨 ${f.wind.toLocaleString('fa-IR')} km/h</span>
                    </div>
                </div>`;
        }).join('');

        return `
            <section class="tour-plan-section tour-plan-weather">
                <h3>${title}</h3>
                <div class="tour-weather-days">${rows}</div>
                ${partialNote}
                <p class="tour-weather-note">منبع: Open-Meteo · پیش‌بینی تقریبی برای ارتفاع قله — قبل از حرکت وضعیت محلی را دوباره چک کنید.</p>
            </section>`;
    }

    async function showPlan() {
        const peak = pickPeak();
        if (!peak) {
            alert('لیست قله‌ها هنوز بارگذاری نشده. لطفاً چند ثانیه صبر کنید.');
            return;
        }

        wizardEl.hidden = true;
        resultEl.hidden = false;
        planContent.innerHTML = '<p class="tour-loading-peaks" style="padding:2rem;text-align:center">در حال ساخت برنامه…</p>';
        resultEl.scrollTop = 0;

        let weatherBlock = '';
        const daysAhead = answers.departureDate ? daysUntilDeparture(answers.departureDate) : -1;
        const tripDays = planDurationDays();
        if (daysAhead >= 1 && daysAhead <= 10) {
            try {
                const forecasts = await fetchWeatherForecast(peak, answers.departureDate, tripDays);
                weatherBlock = weatherSectionHtml(forecasts, tripDays);
            } catch (err) {
                console.warn('weather forecast', err);
            }
        }

        planContent.innerHTML = renderPlanHtml(peak, weatherBlock);
    }

    async function ensurePdfLibs() {
        if (window.html2canvas && window.jspdf) return true;
        return new Promise(function (resolve) {
            var pending = 0;
            function done() { if (--pending <= 0) resolve(!!(window.html2canvas && window.jspdf)); }
            if (!window.html2canvas) {
                pending++;
                var s1 = document.createElement('script');
                s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                s1.onload = done; s1.onerror = done;
                document.head.appendChild(s1);
            }
            if (!window.jspdf) {
                pending++;
                var s2 = document.createElement('script');
                s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                s2.onload = done; s2.onerror = done;
                document.head.appendChild(s2);
            }
            if (pending === 0) resolve(true);
        });
    }

    async function downloadPdf() {
        const btn = document.getElementById('tourBtnPdf');
        btn.disabled = true;
        btn.textContent = 'در حال بارگذاری…';
        const ready = await ensurePdfLibs();
        if (!ready) {
            alert('کتابخانه PDF بارگذاری نشد. لطفاً دوباره تلاش کنید.');
            btn.disabled = false;
            btn.textContent = tr('tour.pdf', 'دانلود PDF');
            return;
        }

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
            btn.textContent = tr('tour.pdf', 'دانلود PDF');
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
