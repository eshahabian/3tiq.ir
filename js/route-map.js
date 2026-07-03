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
            maxZoom: 17
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
                allLatLngs: allLatLngs.slice(),
                tileLayer: tileLayer,
                title: data.peakName || peakId
            });
        });

        mapRegistry.set(mapEl, map);
        return map;
    }

    function waitForTiles(tileLayer) {
        return new Promise(function (resolve) {
            if (!tileLayer || !tileLayer._loading) {
                resolve();
                return;
            }
            tileLayer.once('load', resolve);
            setTimeout(resolve, 8000);
        });
    }

    function delay(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    async function exportPng(frame, ctx) {
        if (!global.html2canvas) {
            alert('برای ذخیره تصویر، صفحه را یک‌بار refresh کنید.');
            return;
        }

        const map = ctx && ctx.map;
        const allLatLngs = (ctx && ctx.allLatLngs) || [];
        const tileLayer = ctx && ctx.tileLayer;
        const title = (ctx && ctx.title) || 'route-map';
        const btn = frame.parentElement.querySelector('[data-action="export"]');
        if (btn) btn.disabled = true;

        const mapEl = map ? map.getContainer() : null;
        const exportW = 1920;
        const exportH = 1440;
        const saved = mapEl ? {
            mapWidth: mapEl.style.width,
            mapHeight: mapEl.style.height,
            frameWidth: frame.style.width,
            frameHeight: frame.style.height,
            center: map.getCenter(),
            zoom: map.getZoom()
        } : null;

        try {
            const widget = frame.closest('.route-map-widget');
            let overlay = null;
            if (widget) {
                overlay = document.createElement('div');
                overlay.className = 'route-map-export-overlay';
                overlay.textContent = 'در حال آماده‌سازی نقشه با کیفیت بالا…';
                widget.style.position = 'relative';
                widget.appendChild(overlay);
            }

            if (mapEl) {
                frame.classList.add('is-exporting');
                mapEl.style.width = exportW + 'px';
                mapEl.style.height = exportH + 'px';
                frame.style.width = exportW + 'px';
                frame.style.height = exportH + 'px';
                map.invalidateSize();
                if (allLatLngs.length) {
                    map.fitBounds(L.latLngBounds(allLatLngs), { padding: [120, 120], maxZoom: 14 });
                }
                await waitForTiles(tileLayer);
                await delay(700);
            } else {
                await delay(400);
            }

            const canvas = await html2canvas(frame, {
                useCORS: true,
                allowTaint: true,
                scale: 2,
                backgroundColor: '#e8e4dc',
                logging: false,
                width: mapEl ? exportW : frame.offsetWidth,
                height: mapEl ? exportH : frame.offsetHeight
            });

            const link = document.createElement('a');
            link.download = title + '-3tiq.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error(err);
            alert('ذخیره تصویر ممکن نشد. از اسکرین‌شات نقشه استفاده کنید.');
        } finally {
            frame.classList.remove('is-exporting');
            const widget = frame.closest('.route-map-widget');
            if (widget) {
                const overlay = widget.querySelector('.route-map-export-overlay');
                if (overlay) overlay.remove();
            }
            if (mapEl && saved) {
                mapEl.style.width = saved.mapWidth;
                mapEl.style.height = saved.mapHeight;
                frame.style.width = saved.frameWidth;
                frame.style.height = saved.frameHeight;
                map.invalidateSize();
                map.setView(saved.center, saved.zoom);
            }
            if (btn) btn.disabled = false;
        }
    }

    function mountOne(el) {
        init(el, el.dataset.routeMap, {
            basePath: el.dataset.basePath || undefined
        });
    }

    function initHomePreview() {
        var select = document.getElementById('homeRoutePeak');
        var container = document.querySelector('.service-route-preview-map[data-route-map]');
        var link = document.getElementById('homeRoutePeakLink');
        if (!select || !container) return;

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
