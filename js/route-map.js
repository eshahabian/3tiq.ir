/**
 * نقشه مسیر کوه — CyclOSM + مسیر رنگی + پناهگاه + واترمارک + خروجی PNG
 */
(function (global) {
    'use strict';

    const SITE = '3tiq.ir';
    const TILE = 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png';

    function shelterClass(type) {
        if (type === 'پناهگاه') return 'refuge';
        if (type === 'جانپناه') return 'bivouac';
        return 'cabin';
    }

    function shelterEmoji(type) {
        if (type === 'پناهگاه') return '🏠';
        if (type === 'جانپناه') return '⚡';
        return '🏕';
    }

    function elevIcon(point) {
        const label = point.label ? `<span class="elev-name">${point.label}</span>` : '';
        const elev = point.elevation ? `${point.elevation} m` : '';
        return L.divIcon({
            className: 'route-map-elev-wrap',
            html: `<div class="route-map-elev-badge">${label}${elev}</div>`,
            iconSize: [1, 1],
            iconAnchor: [0, 12]
        });
    }

    function buildWatermarkPattern() {
        var cells = '';
        for (var i = 0; i < 42; i++) {
            cells += '<span>' + SITE + '</span>';
        }
        return '<div class="route-map-watermark" aria-hidden="true"><div class="route-map-watermark-pattern">' + cells + '</div></div>';
    }

    function buildLegend(routes) {
        const routeItems = routes.map(function (r) {
            const dashed = r.dashArray ? ' dashed' : '';
            const style = r.dashArray
                ? `color:${r.color}`
                : `background:${r.color}`;
            return `<span class="route-map-legend-item">
                <span class="route-map-legend-line${dashed}" style="${style}"></span>
                ${r.name}
            </span>`;
        }).join('');
        return routeItems + `
            <span class="route-map-legend-item">🏠 پناهگاه</span>
            <span class="route-map-legend-item">🔺 قله</span>`;
    }

    async function loadData(peakId, basePath) {
        const prefix = basePath || 'data/route-maps/';
        const res = await fetch(`${prefix}${peakId}.json`);
        if (!res.ok) throw new Error('route map data not found');
        return res.json();
    }

    const mapRegistry = new Map();

    function destroyMap(container) {
        container.querySelectorAll('.route-map-canvas').forEach(function (mapEl) {
            if (mapRegistry.has(mapEl)) {
                mapRegistry.get(mapEl).remove();
                mapRegistry.delete(mapEl);
            }
        });
    }

    async function init(container, peakId, options) {
        if (typeof container === 'string') container = document.getElementById(container);
        if (!container) return null;

        destroyMap(container);

        const basePath = (options && options.basePath) || container.dataset.basePath || 'data/route-maps/';
        container.innerHTML = '<div class="route-map-loading">در حال بارگذاری نقشه...</div>';

        let data;
        try {
            data = await loadData(peakId, basePath);
        } catch (e) {
            container.innerHTML = '<div class="route-map-loading">نقشه مسیر در دسترس نیست.</div>';
            return null;
        }

        const widget = document.createElement('div');
        widget.className = 'route-map-widget';
        widget.innerHTML = `
            <div class="route-map-toolbar">
                <div class="route-map-legend">${buildLegend(data.routes)}</div>
                <div class="route-map-actions">
                    <button type="button" class="route-map-btn" data-action="export">📥 ذخیره نقشه (PNG)</button>
                </div>
            </div>
            <div class="route-map-frame" id="routeMapFrame-${peakId}">
                <div class="route-map-canvas" id="routeMapCanvas-${peakId}"></div>
                ${buildWatermarkPattern()}
            </div>`;
        container.innerHTML = '';
        container.appendChild(widget);

        const mapEl = widget.querySelector(`#routeMapCanvas-${peakId}`);
        const frame = widget.querySelector(`#routeMapFrame-${peakId}`);

        const map = L.map(mapEl, {
            zoomControl: true,
            attributionControl: true
        });

        const tileLayer = L.tileLayer(TILE, {
            attribution: '© OpenStreetMap · CyclOSM',
            maxZoom: 17,
            crossOrigin: 'anonymous'
        }).addTo(map);

        const allLatLngs = [];

        data.routes.forEach(function (route) {
            const latlngs = route.coordinates.map(function (p) {
                allLatLngs.push([p.lat, p.lng]);
                return [p.lat, p.lng];
            });
            L.polyline(latlngs, {
                color: route.color,
                weight: route.weight || 4,
                opacity: 0.92,
                dashArray: route.dashArray || null,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(map).bindPopup(`<div class="route-map-popup"><strong>${route.name}</strong></div>`);

            route.coordinates.forEach(function (p) {
                if (p.label || p.elevation) {
                    L.marker([p.lat, p.lng], { icon: elevIcon(p), interactive: false }).addTo(map);
                }
            });
        });

        (data.shelters || []).forEach(function (s) {
            allLatLngs.push([s.lat, s.lng]);
            const cls = shelterClass(s.type);
            const icon = L.divIcon({
                className: '',
                html: `<div class="route-map-shelter-icon ${cls}">${shelterEmoji(s.type)}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });
            L.marker([s.lat, s.lng], { icon: icon }).addTo(map)
                .bindPopup(`<div class="route-map-popup"><strong>${s.name}</strong><span>${s.type}${s.elevation ? ' · ' + s.elevation + ' m' : ''}</span></div>`);
        });

        if (data.summit) {
            const s = data.summit;
            allLatLngs.push([s.lat, s.lng]);
            const summitIcon = L.divIcon({
                className: '',
                html: '<div class="route-map-summit-icon"></div>',
                iconSize: [20, 18],
                iconAnchor: [10, 18]
            });
            L.marker([s.lat, s.lng], { icon: summitIcon }).addTo(map)
                .bindPopup(`<div class="route-map-popup"><strong>${s.name}</strong><span>${s.elevation} m</span></div>`);
        }

        if (allLatLngs.length) {
            map.fitBounds(L.latLngBounds(allLatLngs), { padding: [36, 36] });
        } else {
            map.setView(data.center, data.zoom || 12);
        }

        setTimeout(function () { map.invalidateSize(); }, 200);

        widget.querySelector('[data-action="export"]').addEventListener('click', function () {
            exportPng(frame, {
                map: map,
                data: data,
                allLatLngs: allLatLngs.slice(),
                tileLayer: tileLayer,
                title: data.peakName || peakId
            });
        });

        mapRegistry.set(mapEl, map);
        return map;
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function buildBoundsProjector(allLatLngs, w, h, pad) {
        var bounds = L.latLngBounds(allLatLngs);
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        var lngSpan = Math.max(ne.lng - sw.lng, 0.002);
        var latSpan = Math.max(ne.lat - sw.lat, 0.002);
        return function project(lat, lng) {
            return {
                x: pad + ((lng - sw.lng) / lngSpan) * (w - 2 * pad),
                y: pad + ((ne.lat - lat) / latSpan) * (h - 2 * pad)
            };
        };
    }

    function latLngToTile(lat, lng, zoom) {
        var n = Math.pow(2, zoom);
        var x = Math.floor((lng + 180) / 360 * n);
        var latRad = lat * Math.PI / 180;
        var y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
        return { x: x, y: y };
    }

    function tileToLng(x, z) {
        return x / Math.pow(2, z) * 360 - 180;
    }

    function tileToLat(y, z) {
        var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
        return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    }

    function pickExportZoom(bounds, w, h, pad) {
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        for (var z = 15; z >= 8; z--) {
            var nwTile = latLngToTile(ne.lat, sw.lng, z);
            var seTile = latLngToTile(sw.lat, ne.lng, z);
            var tileW = (seTile.x - nwTile.x + 1) * 256;
            var tileH = (seTile.y - nwTile.y + 1) * 256;
            if (tileW <= w - pad * 2 && tileH <= h - pad * 2) return z;
        }
        return 10;
    }

    function loadTileImage(url) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () { resolve(img); };
            img.onerror = function () { resolve(null); };
            img.src = url;
        });
    }

    async function drawExportTiles(ctx, allLatLngs, w, h, pad, project) {
        if (!allLatLngs.length) return false;
        var bounds = L.latLngBounds(allLatLngs);
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        var zoom = pickExportZoom(bounds, w, h, pad);
        var nwTile = latLngToTile(ne.lat, sw.lng, zoom);
        var seTile = latLngToTile(sw.lat, ne.lng, zoom);
        var drawn = false;

        for (var x = nwTile.x; x <= seTile.x; x++) {
            for (var y = nwTile.y; y <= seTile.y; y++) {
                var url = TILE.replace('{s}', 'a').replace('{z}', zoom).replace('{x}', x).replace('{y}', y);
                var img = await loadTileImage(url);
                if (!img) continue;
                var tl = project(tileToLat(y, zoom), tileToLng(x, zoom));
                var br = project(tileToLat(y + 1, zoom), tileToLng(x + 1, zoom));
                var tw = br.x - tl.x;
                var th = br.y - tl.y;
                try {
                    ctx.drawImage(img, tl.x, tl.y, tw, th);
                    drawn = true;
                } catch (e) { /* skip tainted tile */ }
            }
        }
        return drawn;
    }

    function drawElevBadge(ctx, x, y, text) {
        ctx.font = 'bold 20px Vazirmatn, Tahoma, sans-serif';
        var pw = ctx.measureText(text).width + 22;
        var ph = 30;
        ctx.fillStyle = 'rgba(20, 16, 10, 0.85)';
        roundRect(ctx, x - pw / 2, y - ph / 2, pw, ph, 14);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
    }

    function drawShelterMarker(ctx, x, y, emoji) {
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#5c6b4a';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, x, y + 1);
    }

    function drawSummitMarker(ctx, x, y) {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(x, y - 22);
        ctx.lineTo(x + 16, y + 10);
        ctx.lineTo(x - 16, y + 10);
        ctx.closePath();
        ctx.fill();
    }

    function drawWatermark(ctx, w, h) {
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-32 * Math.PI / 180);
        ctx.font = 'bold 36px Vazirmatn, Tahoma, sans-serif';
        ctx.fillStyle = 'rgba(44, 36, 22, 0.16)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var stepX = 210;
        var stepY = 110;
        for (var yy = -h; yy <= h; yy += stepY) {
            for (var xx = -w; xx <= w; xx += stepX) {
                ctx.fillText(SITE, xx, yy);
            }
        }
        ctx.restore();
    }

    async function renderMapExportCanvas(data, allLatLngs, w, h) {
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        var pad = 140;
        var project = buildBoundsProjector(allLatLngs, w, h, pad);

        ctx.fillStyle = '#e8e4dc';
        ctx.fillRect(0, 0, w, h);

        await drawExportTiles(ctx, allLatLngs, w, h, pad, project);

        data.routes.forEach(function (route) {
            ctx.beginPath();
            route.coordinates.forEach(function (p, i) {
                var pt = project(p.lat, p.lng);
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = route.color;
            ctx.lineWidth = (route.weight || 4) * 1.75;
            ctx.setLineDash(route.dashArray ? [14, 10] : []);
            ctx.globalAlpha = 0.92;
            ctx.stroke();
            ctx.globalAlpha = 1;
        });

        data.routes.forEach(function (route) {
            route.coordinates.forEach(function (p) {
                if (!p.label && !p.elevation) return;
                var pt = project(p.lat, p.lng);
                var text = (p.label ? p.label + ' ' : '') + (p.elevation ? p.elevation + ' m' : '');
                drawElevBadge(ctx, pt.x, pt.y, text.trim());
            });
        });

        (data.shelters || []).forEach(function (s) {
            var pt = project(s.lat, s.lng);
            drawShelterMarker(ctx, pt.x, pt.y, shelterEmoji(s.type));
        });

        if (data.summit) {
            var spt = project(data.summit.lat, data.summit.lng);
            drawSummitMarker(ctx, spt.x, spt.y);
        }

        drawWatermark(ctx, w, h);
        return canvas;
    }

    function downloadCanvas(canvas, title) {
        var link = document.createElement('a');
        link.download = title + '-3tiq.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    async function exportPng(frame, ctx) {
        var data = ctx && ctx.data;
        var allLatLngs = (ctx && ctx.allLatLngs) || [];
        var title = (ctx && ctx.title) || 'route-map';

        if (!data || !allLatLngs.length) {
            alert('داده مسیر برای ذخیره در دسترس نیست.');
            return;
        }

        var btn = frame.parentElement.querySelector('[data-action="export"]');
        if (btn) btn.disabled = true;

        var widget = frame.closest('.route-map-widget');
        var overlay = null;

        try {
            if (widget) {
                overlay = document.createElement('div');
                overlay.className = 'route-map-export-overlay';
                overlay.textContent = 'در حال آماده‌سازی نقشه…';
                widget.appendChild(overlay);
            }

            var canvas = await renderMapExportCanvas(data, allLatLngs, 2400, 1800);
            downloadCanvas(canvas, title);
        } catch (err) {
            console.error(err);
            alert('ذخیره تصویر ممکن نشد. دوباره تلاش کنید.');
        } finally {
            if (overlay) overlay.remove();
            if (btn) btn.disabled = false;
        }
    }

    function mountOne(el) {
        init(el, el.dataset.routeMap, {
            basePath: el.dataset.basePath || undefined
        });
    }

    function peaksManifestUrl(container) {
        var bp = (container && container.dataset.basePath) || 'data/route-maps/';
        return bp.replace(/\/?route-maps\/?$/, '/route-map-peaks.json');
    }

    async function populateHomePeakSelect(container) {
        var select = document.getElementById('homeRoutePeak');
        if (!select || select.dataset.loaded === 'true') return;

        try {
            var res = await fetch(peaksManifestUrl(container));
            if (!res.ok) return;
            var peaks = await res.json();
            if (!peaks.length) return;

            var current = select.value || container.dataset.routeMap || 'damavand';
            select.innerHTML = peaks.map(function (p) {
                var elev = p.elevation ? ' — ' + p.elevation + ' m' : '';
                return '<option value="' + p.id + '">' + p.name + elev + '</option>';
            }).join('');

            var hasCurrent = peaks.some(function (p) { return p.id === current; });
            select.value = hasCurrent ? current : peaks[0].id;
            select.dataset.loaded = 'true';

            var link = document.getElementById('homeRoutePeakLink');
            if (link) link.href = 'peaks/' + select.value + '.html';
        } catch (e) {
            console.warn('route-map peaks list', e);
        }
    }

    function initHomePreview() {
        var select = document.getElementById('homeRoutePeak');
        var container = document.querySelector('.service-route-preview-map[data-route-map]');
        var link = document.getElementById('homeRoutePeakLink');
        if (!select || !container) return;

        populateHomePeakSelect(container);

        select.addEventListener('change', function () {
            var slug = select.value;
            container.dataset.routeMap = slug;
            if (link) link.href = 'peaks/' + slug + '.html';
            mountOne(container);
        });
    }

    function mountAll() {
        document.querySelectorAll('[data-route-map]').forEach(function (el) {
            var lazyRoot = el.closest('.service-card--route-preview') || el;
            if (el.dataset.lazy === 'true' && 'IntersectionObserver' in window) {
                var observer = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            mountOne(el);
                            observer.unobserve(lazyRoot);
                        }
                    });
                }, { rootMargin: '120px', threshold: 0.01 });
                observer.observe(lazyRoot);
            } else {
                mountOne(el);
            }
        });
        initHomePreview();
    }

    global.RouteMap = { init: init, mountAll: mountAll, destroyMap: destroyMap };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountAll);
    } else {
        mountAll();
    }
})(window);
