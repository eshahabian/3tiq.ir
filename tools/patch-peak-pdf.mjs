import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const peaksDir = path.join(root, 'peaks');
const cssLink = '<link rel="stylesheet" href="../css/peak-print.css">';
const jspdfScript =
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>';
const watermarkScript = '<script src="../js/pdf-watermark.js"></script>';
const peakPdfScript = '<script src="../js/peak-pdf.js"></script>';

let patched = 0;

for (const file of fs.readdirSync(peaksDir)) {
    if (!file.endsWith('.html')) continue;
    const filePath = path.join(peaksDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    if (!html.includes('peak-print.css')) {
        html = html.replace(
            '<link rel="stylesheet" href="../css/route-map.css">',
            '<link rel="stylesheet" href="../css/route-map.css">\n    ' + cssLink
        );
        changed = true;
    }

    if (!html.includes('pdf-watermark.js')) {
        const anchor = html.includes('html2canvas')
            ? /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas[^"]+"><\/script>\n/
            : /<script src="\.\.\/js\/i18n-boot\.js"><\/script>\n/;
        if (anchor.test(html)) {
            html = html.replace(anchor, (m) => m + jspdfScript + '\n' + watermarkScript + '\n');
            changed = true;
        }
    }

    if (!html.includes('peak-pdf.js')) {
        html = html.replace(
            /<script src="\.\.\/js\/route-map\.js"><\/script>/,
            peakPdfScript + '\n<script src="../js/route-map.js"></script>'
        );
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, html, 'utf8');
        patched++;
        console.log('patched', file);
    }
}

console.log('Done. Patched', patched, 'peak pages.');
