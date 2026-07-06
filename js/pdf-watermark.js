/**
 * Shared PDF watermark helper — 3tiq.ir
 */
(function (global) {
    'use strict';

    var SITE = '3tiq.ir';

    function drawPdfWatermark(pdf, w, h, site) {
        site = site || SITE;
        try {
            pdf.saveGraphicsState();
            var GState = pdf.GState || (global.jspdf && global.jspdf.GState);
            if (GState && pdf.setGState) {
                pdf.setGState(new GState({ opacity: 0.1 }));
            }
            pdf.setFontSize(42);
            pdf.setTextColor(180, 140, 90);
            for (var y = 80; y < h; y += 140) {
                for (var x = 30; x < w; x += 160) {
                    pdf.text(site, x, y, { angle: -35 });
                }
            }
            pdf.restoreGraphicsState();
        } catch (_) { /* optional */ }
        pdf.setFontSize(9);
        pdf.setTextColor(120, 110, 100);
        pdf.text(site, w / 2, h - 16, { align: 'center' });
    }

    global.PdfWatermark = {
        SITE: SITE,
        draw: drawPdfWatermark
    };
})(typeof window !== 'undefined' ? window : globalThis);
