/**
 * نقشه مسیر کوه — CyclOSM + مسیر رنگی + پناهگاه + واترمارک + خروجی PNG
 */
(function (global) {
    'use strict';

    const SITE = '3tiq.ir';
    const TILE = 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png';

    var ROUTE_I18N = null;

    function isRouteEn() {
        return global.I18n && I18n.isEn();
    }

    function routeI18nBase() {
        if (/\/peaks\//.test(location.pathname) || /\/blog\//.test(location.pathname)) return '../';
        return '';
    }

    function loadRouteI18n() {
        if (ROUTE_I18N) return Promise.resolve(ROUTE_I18N);
        return fetch(routeI18nBase() + 'data/route-maps-en.json')
            .then(function (r) { return r.ok ? r.json() : {}; })
            .then(function (d) { ROUTE_I18N = d || {}; return ROUTE_I18N; })
            .catch(function () { ROUTE_I18N = {}; return ROUTE_I18N; });
    }

    function trRouteLabel(label) {
        if (!label || !isRouteEn()) return label;
        if (label === 'Start') return 'Start';
        if (label === 'Summit' || label === 'قله') return 'Summit';
        if (ROUTE_I18N && ROUTE_I18N.labels && ROUTE_I18N.labels[label]) {
            return ROUTE_I18N.labels[label];
        }
        return label;
    }

    function trRouteName(name, peakId, routeId) {
        if (!isRouteEn()) return name;
        if (ROUTE_I18N && ROUTE_I18N.peaks && ROUTE_I18N.peaks[peakId]) {
            var peak = ROUTE_I18N.peaks[peakId];
            if (peak.routes && (peak.routes[routeId] || peak.routes[name])) {
                return peak.routes[routeId] || peak.routes[name];
            }
        }
        if (ROUTE_I18N && ROUTE_I18N.routeNames && ROUTE_I18N.routeNames[name]) {
            return ROUTE_I18N.routeNames[name];
        }
        return name;
    }

    function trPeakName(peakId, faName) {
        if (!isRouteEn()) return faName;
        if (global.ContentEn) {
            var en = ContentEn.peakBySlug(peakId);
            if (en && en.name) return en.name;
        }
        if (ROUTE_I18N && ROUTE_I18N.peaks && ROUTE_I18N.peaks[peakId] && ROUTE_I18N.peaks[peakId].peakName) {
            return ROUTE_I18N.peaks[peakId].peakName;
        }
        return faName;
    }

    function trShelterName(name) {
        if (!isRouteEn() || !global.ContentEn) return name;
        return ContentEn.shelterNameEn(name);
    }

    function trShelterType(type) {
        if (!isRouteEn() || !global.ContentEn) return type;
        return ContentEn.shelterTypeLabel(type);
    }

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

    function elevIcon(point, summit, peakId) {
        var labelText = localizePointLabel(point, summit, peakId) || (point.elevation ? point.elevation + ' m' : '');
        var coordLine = point.label || point.elevation ? formatCoords(point.lat, point.lng) : '';
        var label = labelText ? '<span class="elev-name">' + labelText + '</span>' : '';
        var elev = point.elevation && labelText !== String(point.elevation) ? point.elevation + ' m' : '';
        var coords = coordLine ? '<span class="elev-coords">' + coordLine + '</span>' : '';
        return L.divIcon({
            className: 'route-map-elev-wrap',
            html: '<div class="route-map-elev-badge">' + label + elev + coords + '</div>',
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

    function buildLegend(routes, peakId) {
        const routeItems = routes.map(function (r) {
            const dashed = r.dashArray ? ' dashed' : '';
            const style = r.dashArray
                ? `color:${r.color}`
                : `background:${r.color}`;
            const rName = trRouteName(r.name, peakId, r.id);
            return `<span class="route-map-legend-item">
                <span class="route-map-legend-line${dashed}" style="${style}"></span>
                ${rName}
            </span>`;
        }).join('');
        return routeItems + `
            <span class="route-map-legend-item">${(global.I18n && I18n.t('route.legendShelter')) || '🏠 پناهگاه'}</span>
            <span class="route-map-legend-item">${(global.I18n && I18n.t('route.legendSummit')) || '🔺 قله'}</span>`;
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

        await loadRouteI18n();
        if (global.ContentEn) await ContentEn.loadPeaksEn();

        destroyMap(container);

        const basePath = (options && options.basePath) || container.dataset.basePath || 'data/route-maps/';
        container.innerHTML = '<div class="route-map-loading">' + ((global.I18n && I18n.t('route.loading')) || 'در حال بارگذاری نقشه...') + '</div>';

        let data;
        try {
            data = await loadData(peakId, basePath);
        } catch (e) {
            container.innerHTML = '<div class="route-map-loading">' + ((global.I18n && I18n.t('route.unavailable')) || 'نقشه مسیر در دسترس نیست.') + '</div>';
            return null;
        }

        const widget = document.createElement('div');
        widget.className = 'route-map-widget';
        widget.innerHTML = `
            <div class="route-map-toolbar">
                <div class="route-map-legend">${buildLegend(data.routes, peakId)}</div>
                <div class="route-map-actions">
                    <button type="button" class="route-map-btn" data-action="gpx">${(global.I18n && I18n.t('route.gpx')) || '📍 دانلود GPX'}</button>
                    <button type="button" class="route-map-btn" data-action="export">${(global.I18n && I18n.t('route.export')) || '📥 ذخیره نقشه (PNG)'}</button>
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
            }).addTo(map).bindPopup(`<div class="route-map-popup"><strong>${trRouteName(route.name, peakId, route.id)}</strong></div>`);

            route.coordinates.forEach(function (p) {
                if (p.label || p.elevation) {
                    L.marker([p.lat, p.lng], { icon: elevIcon(p, data.summit, peakId), interactive: false }).addTo(map);
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
                .bindPopup(`<div class="route-map-popup"><strong>${trShelterName(s.name)}</strong><span>${trShelterType(s.type)}${s.elevation ? ' · ' + s.elevation + ' m' : ''}</span></div>`);
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
                .bindPopup('<div class="route-map-popup"><strong>' + trPeakName(peakId, s.name) + '</strong><span>' + s.elevation + ' m</span><span class="route-map-popup-coords">' + formatCoords(s.lat, s.lng) + '</span></div>');
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
                title: trPeakName(peakId, data.peakName || peakId)
            });
        });

        var gpxBtn = widget.querySelector('[data-action="gpx"]');
        if (gpxBtn) {
            gpxBtn.addEventListener('click', function () {
                exportGpx(data, peakId);
            });
        }

        mapRegistry.set(mapEl, map);
        return map;
    }

    function latLngToWorldPx(lat, lng, zoom) {
        var scale = Math.pow(2, zoom) * 256;
        var x = (lng + 180) / 360 * scale;
        var latRad = lat * Math.PI / 180;
        var y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * scale;
        return { x: x, y: y };
    }

    function formatCoords(lat, lng) {
        return lat.toFixed(4) + '°N · ' + lng.toFixed(4) + '°E';
    }

    function localizePointLabel(p, summit, peakId) {
        if (!p.label) return '';
        if (p.label === 'Summit' || p.label === 'قله') {
            return summit ? trPeakName(peakId, summit.name) : trRouteLabel('Summit');
        }
        if (p.label === 'Start') return trRouteLabel('Start');
        return trRouteLabel(p.label);
    }

    function boundsForAspect(allLatLngs, aspectW, aspectH, padFactor) {
        var bounds = L.latLngBounds(allLatLngs);
        var c = bounds.getCenter();
        var latSpan = Math.max(bounds.getNorth() - bounds.getSouth(), 0.012);
        var lngSpan = Math.max(bounds.getEast() - bounds.getWest(), 0.012);
        latSpan *= padFactor;
        lngSpan *= padFactor;

        var cosLat = Math.cos(c.lat * Math.PI / 180);
        var mercW = lngSpan * cosLat;
        var mercH = latSpan;
        var targetAspect = aspectW / aspectH;

        if (mercW / mercH < targetAspect) {
            lngSpan = (mercH * targetAspect) / cosLat;
        } else if (mercW / mercH > targetAspect) {
            latSpan = mercW / targetAspect;
        }

        return L.latLngBounds(
            [c.lat - latSpan / 2, c.lng - lngSpan / 2],
            [c.lat + latSpan / 2, c.lng + lngSpan / 2]
        );
    }

    function exportCanvasSize(allLatLngs) {
        var bounds = L.latLngBounds(allLatLngs);
        var latSpan = Math.max(bounds.getNorth() - bounds.getSouth(), 0.01);
        var lngSpan = Math.max(bounds.getEast() - bounds.getWest(), 0.01);
        var cosLat = Math.cos(bounds.getCenter().lat * Math.PI / 180);
        var ratio = latSpan / (lngSpan * cosLat);

        if (ratio > 1.25) return { w: 2400, h: 3400 };
        if (ratio < 0.8) return { w: 3400, h: 2400 };
        return { w: 2800, h: 2800 };
    }

    function tileGridForView(nw, se) {
        var minTx = Math.floor(nw.x / 256);
        var maxTx = Math.floor(se.x / 256);
        var minTy = Math.floor(nw.y / 256);
        var maxTy = Math.floor(se.y / 256);
        return {
            minTx: minTx,
            maxTx: maxTx,
            minTy: minTy,
            maxTy: maxTy,
            count: (maxTx - minTx + 1) * (maxTy - minTy + 1)
        };
    }

    function computeExportView(allLatLngs, mapX, mapY, mapW, mapH) {
        var padded = boundsForAspect(allLatLngs, mapW, mapH, 1.18);
        var MAX_TILES = 96;
        var best = null;

        for (var z = 16; z >= 9; z--) {
            var nw = latLngToWorldPx(padded.getNorth(), padded.getWest(), z);
            var se = latLngToWorldPx(padded.getSouth(), padded.getEast(), z);
            var bw = se.x - nw.x;
            var bh = se.y - nw.y;
            if (bw > mapW || bh > mapH) continue;
            var grid = tileGridForView(nw, se);
            if (grid.count > MAX_TILES) continue;
            best = {
                zoom: z,
                nw: nw,
                se: se,
                drawW: bw,
                drawH: bh,
                offsetX: mapX + (mapW - bw) / 2,
                offsetY: mapY + (mapH - bh) / 2
            };
            break;
        }

        if (best) return best;

        for (var z2 = 9; z2 <= 16; z2++) {
            var nw2 = latLngToWorldPx(padded.getNorth(), padded.getWest(), z2);
            var se2 = latLngToWorldPx(padded.getSouth(), padded.getEast(), z2);
            var bw2 = se2.x - nw2.x;
            var bh2 = se2.y - nw2.y;
            var grid2 = tileGridForView(nw2, se2);
            if (grid2.count <= MAX_TILES) {
                var scale = Math.min(mapW / bw2, mapH / bh2, 1);
                return {
                    zoom: z2,
                    nw: nw2,
                    se: se2,
                    drawW: bw2 * scale,
                    drawH: bh2 * scale,
                    offsetX: mapX + (mapW - bw2 * scale) / 2,
                    offsetY: mapY + (mapH - bh2 * scale) / 2
                };
            }
        }

        var z3 = 9;
        var nw3 = latLngToWorldPx(padded.getNorth(), padded.getWest(), z3);
        var se3 = latLngToWorldPx(padded.getSouth(), padded.getEast(), z3);
        var bw3 = se3.x - nw3.x;
        var bh3 = se3.y - nw3.y;
        return {
            zoom: z3,
            nw: nw3,
            se: se3,
            drawW: Math.min(bw3, mapW),
            drawH: Math.min(bh3, mapH),
            offsetX: mapX + (mapW - Math.min(bw3, mapW)) / 2,
            offsetY: mapY + (mapH - Math.min(bh3, mapH)) / 2
        };
    }

    function projectLatLng(lat, lng, view) {
        var p = latLngToWorldPx(lat, lng, view.zoom);
        var dx = view.se.x - view.nw.x || 1;
        var dy = view.se.y - view.nw.y || 1;
        return {
            x: view.offsetX + (p.x - view.nw.x) / dx * view.drawW,
            y: view.offsetY + (p.y - view.nw.y) / dy * view.drawH
        };
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

    function loadTileImage(url) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () { resolve(img); };
            img.onerror = function () { resolve(null); };
            img.src = url;
        });
    }

    function tileToLng(x, z) {
        return x / Math.pow(2, z) * 360 - 180;
    }

    function tileToLat(y, z) {
        var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
        return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    }

    async function drawExportTilesMercator(ctx, view) {
        var z = view.zoom;
        var minTx = Math.floor(view.nw.x / 256);
        var maxTx = Math.floor(view.se.x / 256);
        var minTy = Math.floor(view.nw.y / 256);
        var maxTy = Math.floor(view.se.y / 256);
        var subs = ['a', 'b', 'c'];
        var jobs = [];
        var idx = 0;

        for (var tx = minTx; tx <= maxTx; tx++) {
            for (var ty = minTy; ty <= maxTy; ty++) {
                jobs.push({
                    tx: tx,
                    ty: ty,
                    url: TILE.replace('{s}', subs[idx++ % 3]).replace('{z}', z).replace('{x}', tx).replace('{y}', ty)
                });
            }
        }

        var drawn = false;
        var BATCH = 16;
        for (var i = 0; i < jobs.length; i += BATCH) {
            var slice = jobs.slice(i, i + BATCH);
            var imgs = await Promise.all(slice.map(function (j) { return loadTileImage(j.url); }));
            slice.forEach(function (j, k) {
                var img = imgs[k];
                if (!img) return;
                var tl = projectLatLng(tileToLat(j.ty, z), tileToLng(j.tx, z), view);
                var br = projectLatLng(tileToLat(j.ty + 1, z), tileToLng(j.tx + 1, z), view);
                try {
                    ctx.drawImage(img, tl.x, tl.y, br.x - tl.x, br.y - tl.y);
                    drawn = true;
                } catch (e) { /* skip tainted tile */ }
            });
        }
        return drawn;
    }

    function drawElevBadge(ctx, x, y, title, subtitle) {
        ctx.font = 'bold 22px Vazirmatn, Tahoma, sans-serif';
        var titleW = ctx.measureText(title).width;
        var subW = subtitle ? ctx.measureText(subtitle).width : 0;
        var pw = Math.max(titleW, subW) + 28;
        var ph = subtitle ? 52 : 34;
        var bx = x - pw / 2;
        var by = y - ph - 8;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
        ctx.strokeStyle = 'rgba(58, 50, 38, 0.2)';
        ctx.lineWidth = 1.5;
        roundRect(ctx, bx, by, pw, ph, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1a1208';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, x, by + (subtitle ? 18 : ph / 2));

        if (subtitle) {
            ctx.font = '16px Vazirmatn, Tahoma, sans-serif';
            ctx.fillStyle = '#6b5c48';
            ctx.fillText(subtitle, x, by + 38);
        }

        ctx.beginPath();
        ctx.moveTo(x - 7, by + ph);
        ctx.lineTo(x + 7, by + ph);
        ctx.lineTo(x, by + ph + 9);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
        ctx.fill();
        ctx.stroke();
    }

    function drawShelterMarker(ctx, x, y, emoji, name) {
        drawElevBadge(ctx, x, y - 18, emoji + ' ' + name, '');
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#5c6b4a';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, x, y + 1);
    }

    function drawSummitMarker(ctx, x, y, summit) {
        var name = summit.name || 'قله';
        var elev = summit.elevation ? summit.elevation + ' m' : '';
        var title = name + (elev ? ' (' + elev + ')' : '');
        drawElevBadge(ctx, x, y - 24, title, formatCoords(summit.lat, summit.lng));

        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    function drawExportHeader(ctx, data, w, headerH) {
        var peakName = trPeakName(data.peakId, data.peakName || data.peakId);
        var elev = data.peakElevation || (data.summit && data.summit.elevation) || '';
        var summit = data.summit;
        var en = isRouteEn();

        ctx.fillStyle = '#faf8f4';
        ctx.fillRect(0, 0, w, headerH);
        ctx.strokeStyle = 'rgba(58, 50, 38, 0.12)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, headerH);
        ctx.lineTo(w, headerH);
        ctx.stroke();

        ctx.fillStyle = '#1a1208';
        ctx.font = 'bold 42px Vazirmatn, Tahoma, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText((en ? 'Route guide — ' : '🗺 راهنمای مسیر — ') + peakName + (elev ? ' (' + elev + ' m)' : ''), w - 36, 28);

        ctx.font = '22px Vazirmatn, Tahoma, sans-serif';
        ctx.fillStyle = '#4a4034';
        if (summit) {
            ctx.fillText((en ? 'Summit: ' : '📍 مختصات قله: ') + formatCoords(summit.lat, summit.lng), w - 36, 82);
        }

        var xLeft = 36;
        var yLegend = 34;
        ctx.textAlign = 'left';
        ctx.font = 'bold 20px Vazirmatn, Tahoma, sans-serif';
        ctx.fillStyle = '#6b5c48';
        ctx.fillText(en ? 'Routes:' : 'مسیرها:', xLeft, yLegend);
        yLegend += 30;

        data.routes.forEach(function (route) {
            ctx.fillStyle = route.color;
            roundRect(ctx, xLeft, yLegend + 6, 36, 8, 4);
            ctx.fill();
            ctx.fillStyle = '#1a1208';
            ctx.font = '18px Vazirmatn, Tahoma, sans-serif';
            ctx.fillText(trRouteName(route.name, data.peakId, route.id), xLeft + 48, yLegend + 14);
            yLegend += 28;
        });

        ctx.font = '16px Vazirmatn, Tahoma, sans-serif';
        ctx.fillStyle = '#8a7a66';
        ctx.fillText(SITE + ' — نقشه: © OpenStreetMap · CyclOSM', xLeft, headerH - 22);
    }

    function drawExportFooter(ctx, w, h, footerH) {
        var y = h - footerH;
        ctx.fillStyle = 'rgba(250, 248, 244, 0.95)';
        ctx.fillRect(0, y, w, footerH);
        ctx.strokeStyle = 'rgba(58, 50, 38, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        ctx.font = '16px Vazirmatn, Tahoma, sans-serif';
        ctx.fillStyle = '#8a7a66';
        ctx.textAlign = 'center';
        ctx.fillText('مختصات WGS84 · قبل از صعود وضعیت مسیر و آب‌وهوا را بررسی کنید · ' + SITE, w / 2, y + footerH / 2 + 6);
    }

    function drawWatermark(ctx, x, y, w, h) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(-32 * Math.PI / 180);
        ctx.font = 'bold 32px Vazirmatn, Tahoma, sans-serif';
        ctx.fillStyle = 'rgba(44, 36, 22, 0.12)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var stepX = 220;
        var stepY = 120;
        for (var yy = -h; yy <= h; yy += stepY) {
            for (var xx = -w; xx <= w; xx += stepX) {
                ctx.fillText(SITE, xx, yy);
            }
        }
        ctx.restore();
    }

    async function renderMapExportCanvas(data, allLatLngs, w, h) {
        var headerH = 200;
        var footerH = 44;
        var sidePad = 12;
        var mapY = headerH + 8;
        var mapH = h - headerH - footerH - 16;
        var mapX = sidePad;
        var mapW = w - sidePad * 2;

        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');

        ctx.fillStyle = '#faf8f4';
        ctx.fillRect(0, 0, w, h);

        drawExportHeader(ctx, data, w, headerH);

        var view = computeExportView(allLatLngs, mapX, mapY, mapW, mapH);

        ctx.fillStyle = '#e8e4dc';
        roundRect(ctx, mapX, mapY, mapW, mapH, 12);
        ctx.fill();
        ctx.save();
        roundRect(ctx, mapX, mapY, mapW, mapH, 12);
        ctx.clip();

        await drawExportTilesMercator(ctx, view);

        data.routes.forEach(function (route) {
            ctx.beginPath();
            route.coordinates.forEach(function (p, i) {
                var pt = projectLatLng(p.lat, p.lng, view);
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = route.color;
            ctx.lineWidth = (route.weight || 4) * 2.2;
            ctx.setLineDash(route.dashArray ? [16, 12] : []);
            ctx.globalAlpha = 0.95;
            ctx.stroke();
            ctx.globalAlpha = 1;
        });

        data.routes.forEach(function (route) {
            route.coordinates.forEach(function (p) {
                if (!p.label && !p.elevation) return;
                var pt = projectLatLng(p.lat, p.lng, view);
                var label = localizePointLabel(p, data.summit, data.peakId);
                var title = label || (p.elevation ? p.elevation + ' m' : '');
                var subtitle = (label && p.elevation) ? (p.elevation + ' m · ' + formatCoords(p.lat, p.lng)) : formatCoords(p.lat, p.lng);
                if (title) drawElevBadge(ctx, pt.x, pt.y, title, subtitle);
            });
        });

        (data.shelters || []).forEach(function (s) {
            var pt = projectLatLng(s.lat, s.lng, view);
            drawShelterMarker(ctx, pt.x, pt.y, shelterEmoji(s.type), s.name);
        });

        if (data.summit) {
            var spt = projectLatLng(data.summit.lat, data.summit.lng, view);
            drawSummitMarker(ctx, spt.x, spt.y, data.summit);
        }

        drawWatermark(ctx, mapX, mapY, mapW, mapH);
        ctx.restore();

        ctx.strokeStyle = 'rgba(58, 50, 38, 0.15)';
        ctx.lineWidth = 2;
        roundRect(ctx, mapX, mapY, mapW, mapH, 12);
        ctx.stroke();

        drawExportFooter(ctx, w, h, footerH);
        return canvas;
    }

    function escapeXml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function exportGpx(data, peakId) {
        if (!data || !data.routes || !data.routes.length) {
            alert((global.I18n && I18n.t('route.gpxUnavailable')) || 'مسیر برای GPX در دسترس نیست.');
            return;
        }
        var peakName = trPeakName(peakId, data.peakName || peakId);
        var segments = data.routes.map(function (route) {
            var pts = route.coordinates.map(function (p) {
                var ele = p.elevation ? '<ele>' + p.elevation + '</ele>' : '';
                var name = p.label ? '<name>' + escapeXml(trRouteLabel(p.label)) + '</name>' : '';
                return '<trkpt lat="' + p.lat + '" lon="' + p.lng + '">' + ele + name + '</trkpt>';
            }).join('');
            return '<trkseg><name>' + escapeXml(trRouteName(route.name, peakId, route.id)) + '</name>' + pts + '</trkseg>';
        }).join('');

        var gpx = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<gpx version="1.1" creator="3tiq.ir" xmlns="http://www.topografix.com/GPX/1/1">' +
            '<metadata><name>' + escapeXml(peakName) + '</name><desc>Route from 3tiq.ir</desc></metadata>' +
            '<trk><name>' + escapeXml(peakName) + '</name>' + segments + '</trk></gpx>';

        var blob = new Blob([gpx], { type: 'application/gpx+xml' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.download = (peakId || 'route') + '-3tiq.gpx';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
    }

    function downloadCanvas(canvas, slug) {
        var name = String(slug || 'route-map').replace(/[^\w\-]+/g, '-').replace(/^-+|-+$/g, '') || 'route-map';
        name = name + '-3tiq.png';

        function saveBlob(blob) {
            if (!blob) {
                alert('ذخیره تصویر ممکن نشد. لطفاً دوباره تلاش کنید.');
                return;
            }
            var url = URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.download = name;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(function () { URL.revokeObjectURL(url); }, 8000);
        }

        if (canvas.toBlob) {
            canvas.toBlob(saveBlob, 'image/png');
            return;
        }

        try {
            var link = document.createElement('a');
            link.download = name;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error(err);
            alert('ذخیره تصویر ممکن نشد. لطفاً دوباره تلاش کنید.');
        }
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

            var size = exportCanvasSize(allLatLngs);
            var canvas = await renderMapExportCanvas(data, allLatLngs, size.w, size.h);
            downloadCanvas(canvas, data.peakId || title);
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
        if (!select) return;

        try {
            if (window.ContentEn) await ContentEn.loadPeaksEn();
            var res = await fetch(peaksManifestUrl(container));
            if (!res.ok) return;
            var peaks = await res.json();
            if (!peaks.length) return;

            var current = select.value || container.dataset.routeMap || 'damavand';
            var isEn = window.I18n && I18n.isEn();
            select.innerHTML = peaks.map(function (p) {
                var label = p.name;
                if (isEn && window.ContentEn) {
                    var en = ContentEn.peakBySlug(p.id);
                    if (en) label = en.name;
                }
                var elev = p.elevation ? ' — ' + p.elevation + ' m' : '';
                return '<option value="' + p.id + '">' + label + elev + '</option>';
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

        document.addEventListener('3tiq:languagechange', function () {
            populateHomePeakSelect(container);
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

    /* Peak pages: load i18n + bilingual chrome */
    if (document.querySelector('.mtn-hero') && document.querySelector('.header-back')) {
        (function () {
            var base = '../';
            if (!document.querySelector('link[href*="i18n.css"]')) {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = base + 'css/i18n.css';
                document.head.appendChild(link);
            }
            function loadSiteChrome(cb) {
                if (document.querySelector('script[src*="site-chrome.js"]')) { cb(); return; }
                var sc = document.createElement('script');
                sc.src = base + 'js/site-chrome.js';
                sc.defer = true;
                sc.onload = cb;
                document.body.appendChild(sc);
            }
            function loadScript(src, cb) {
                if (document.querySelector('script[src*="' + src.split('/').pop() + '"]')) {
                    if (cb) cb();
                    return;
                }
                var s = document.createElement('script');
                s.src = base + src;
                s.defer = true;
                s.onload = function () { if (cb) cb(); };
                document.body.appendChild(s);
            }
            function loadContentEn(cb) {
                if (window.ContentEn) { cb(); return; }
                loadScript('js/content-en.js', cb);
            }
            function bootPeakI18n() {
                loadContentEn(function () {
                    loadSiteChrome(function () {
                        loadScript('js/peak-chrome.js', function () {
                            loadScript('js/peak-content.js');
                        });
                    });
                });
            }
            if (window.I18n) {
                bootPeakI18n();
            } else {
                var i18n = document.createElement('script');
                i18n.src = base + 'js/i18n.js';
                i18n.defer = true;
                i18n.onload = bootPeakI18n;
                document.body.appendChild(i18n);
            }
        })();
    }
})(window);
