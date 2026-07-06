/**
 * Peak page PDF export with 3tiq.ir watermark.
 * Replaces window.print() on «چاپ / ذخیره PDF» buttons.
 */
(function () {
    'use strict';

    var SITE = (window.PdfWatermark && PdfWatermark.SITE) || '3tiq.ir';
    var busy = false;

    function injectPrintWatermark() {
        if (document.getElementById('peakPrintWatermark')) return;
        var wm = document.createElement('div');
        wm.id = 'peakPrintWatermark';
        wm.className = 'peak-print-watermarks';
        wm.setAttribute('aria-hidden', 'true');
        wm.innerHTML = Array(12).fill('<span>' + SITE + '</span>').join('');
        document.body.appendChild(wm);
    }

    function wirePrintButton() {
        document.querySelectorAll('.action-btn.btn-primary').forEach(function (btn) {
            var onclick = btn.getAttribute('onclick') || '';
            var label = (btn.textContent || '').trim();
            if (!onclick.includes('window.print') && !label.includes('PDF')) return;
            btn.removeAttribute('onclick');
            btn.type = 'button';
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                exportPeakPdf(btn);
            });
        });
    }

    function cloneForExport() {
        var wrap = document.createElement('div');
        wrap.className = 'peak-pdf-export';

        var head = document.createElement('div');
        head.className = 'peak-pdf-head';

        var titleEl = document.querySelector('.hero-title');
        var subEl = document.querySelector('.hero-sub');
        var h1 = document.createElement('h1');
        h1.className = 'peak-pdf-title';
        h1.textContent = titleEl ? titleEl.textContent.trim() : document.title.split('|')[0].trim();
        head.appendChild(h1);

        if (subEl && subEl.textContent.trim()) {
            var p = document.createElement('p');
            p.className = 'peak-pdf-sub';
            p.textContent = subEl.textContent.trim();
            head.appendChild(p);
        }

        var site = document.createElement('p');
        site.className = 'peak-pdf-site';
        site.textContent = SITE;
        head.appendChild(site);
        wrap.appendChild(head);

        var stats = document.querySelector('.stats-bar');
        if (stats) {
            wrap.appendChild(stats.cloneNode(true));
        }

        var body = document.querySelector('.page-body');
        if (body) {
            var bodyClone = body.cloneNode(true);
            bodyClone.querySelectorAll('.action-btn, .route-map-btn, button').forEach(function (el) {
                el.remove();
            });
            bodyClone.querySelectorAll('iframe').forEach(function (el) {
                el.remove();
            });
            wrap.appendChild(bodyClone);
        }

        document.body.appendChild(wrap);
        return wrap;
    }

    async function exportPeakPdf(btn) {
        if (busy) return;

        if (!window.html2canvas || !window.jspdf) {
            window.print();
            return;
        }

        busy = true;
        var prevText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'در حال ساخت PDF…';

        var exportNode = null;
        try {
            exportNode = cloneForExport();
            var canvas = await html2canvas(exportNode, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#fdfbf7',
                logging: false
            });

            var jsPDF = window.jspdf.jsPDF;
            var pdf = new jsPDF('p', 'pt', 'a4');
            var pageW = pdf.internal.pageSize.getWidth();
            var pageH = pdf.internal.pageSize.getHeight();
            var margin = 36;
            var contentW = pageW - margin * 2;
            var scale = contentW / canvas.width;
            var pageContentH = pageH - margin * 2;
            var slicePx = pageContentH / scale;
            var srcY = 0;
            var pageNum = 0;
            var drawWm = window.PdfWatermark && PdfWatermark.draw;

            while (srcY < canvas.height) {
                if (pageNum > 0) pdf.addPage();

                var sliceH = Math.min(slicePx, canvas.height - srcY);
                var slice = document.createElement('canvas');
                slice.width = canvas.width;
                slice.height = sliceH;
                slice.getContext('2d').drawImage(
                    canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH
                );

                pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, contentW, sliceH * scale);
                if (drawWm) drawWm(pdf, pageW, pageH);
                srcY += sliceH;
                pageNum++;
            }

            var slugMatch = location.pathname.match(/\/peaks\/([^/.]+)\.html/i);
            var slug = slugMatch ? slugMatch[1] : 'peak';
            pdf.save('3tiq-' + slug + '.pdf');
        } catch (err) {
            console.error('peak pdf export', err);
            alert('ساخت PDF ممکن نشد. از گزینه چاپ مرورگر استفاده کنید.');
            window.print();
        } finally {
            if (exportNode && exportNode.parentNode) {
                exportNode.parentNode.removeChild(exportNode);
            }
            btn.disabled = false;
            btn.textContent = prevText;
            busy = false;
        }
    }

    function init() {
        injectPrintWatermark();
        wirePrintButton();
    }

    window.PeakPdf = { export: exportPeakPdf };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
