/**
 * Range pages: lazy-load Neshan map (after page idle) — avoids browser freeze.
 */
(function () {
    'use strict';

    var NESHAN_KEY = 'web.6a240d5daf514aa6a2bdeac77b73f5e5';
    var LEAFLET_CSS = 'https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.css';
    var LEAFLET_JS = 'https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js';
    var started = false;
    var map = null;
    var peakMarkers = [];
    var shelterMarkers = [];

    function readData() {
        var el = document.getElementById('range-data');
        if (!el) return null;
        try { return JSON.parse(el.textContent); } catch (e) { return null; }
    }

    function loadCss(href) {
        if (document.querySelector('link[href="' + href + '"]')) return;
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = href;
        document.head.appendChild(l);
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            if (document.querySelector('script[src="' + src + '"]')) {
                if (typeof L !== 'undefined') resolve();
                else document.querySelector('script[src="' + src + '"]').addEventListener('load', resolve);
                return;
            }
            var s = document.createElement('script');
            s.src = src;
            s.defer = true;
            s.onload = resolve;
            s.onerror = reject;
            document.body.appendChild(s);
        });
    }

    function computeCenter(peaks) {
        if (!peaks || !peaks.length) return [32.5, 53.5];
        var lat = 0;
        var lng = 0;
        peaks.forEach(function (p) {
            lat += p.lat;
            lng += p.lng;
        });
        return [lat / peaks.length, lng / peaks.length];
    }

    function locNum(n) {
        return window.I18n && I18n.isEn() ? String(n) : Number(n).toLocaleString('fa-IR');
    }

    var mountainIcon = null;
    var shelterIcon = null;

    function icons() {
        if (mountainIcon) return;
        mountainIcon = L.divIcon({
            html: '<div style="background:linear-gradient(135deg,#2d6a4f,#40916c);color:white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);border:2px solid white;"><span style="transform:rotate(45deg);font-size:14px;">⛰️</span></div>',
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -36]
        });
        shelterIcon = L.divIcon({
            html: '<div style="background:linear-gradient(135deg,#d97706,#f59e0b);color:white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:28px;height:28px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);border:2px solid white;"><span style="transform:rotate(45deg);font-size:13px;">🏕️</span></div>',
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -32]
        });
    }

    function renderPeakMarkers(list) {
        peakMarkers.forEach(function (m) { map.removeLayer(m); });
        peakMarkers = [];
        icons();
        list.forEach(function (p) {
            var marker = L.marker([p.lat, p.lng], { icon: mountainIcon })
                .addTo(map)
                .bindPopup(
                    '<div style="text-align:center;font-family:Vazirmatn,Tahoma;direction:rtl;min-width:150px;padding:4px;">' +
                    '<b style="font-size:14px;color:#2d6a4f;">' + (p.emoji || '⛰️') + ' ' + p.name + '</b><br>' +
                    '<span style="color:#555;font-size:12px;">ارتفاع: <b>' + locNum(p.elevation) + '</b> متر</span><br>' +
                    '<span style="color:#888;font-size:11px;">📍 ' + p.province + '</span><br>' +
                    '<span style="color:#888;font-size:11px;">سختی: ' + p.difficulty + '</span></div>'
                );
            peakMarkers.push(marker);
        });
        var countEl = document.getElementById('peak-count');
        if (countEl) countEl.textContent = list.length + ' قله نمایش داده می‌شود';
    }

    function renderShelterMarkers(list) {
        shelterMarkers.forEach(function (m) { map.removeLayer(m); });
        shelterMarkers = [];
        if (!list.length) return;
        icons();
        list.forEach(function (s) {
            var marker = L.marker([s.lat, s.lng], { icon: shelterIcon })
                .addTo(map)
                .bindPopup(
                    '<div style="text-align:center;font-family:Vazirmatn,Tahoma;direction:rtl;min-width:150px;padding:4px;">' +
                    '<b style="font-size:14px;color:#d97706;">🏕️ ' + s.name + '</b><br>' +
                    '<span style="color:#555;font-size:12px;">نوع: <b>' + s.type + '</b></span><br>' +
                    '<span style="color:#888;font-size:11px;">📍 ' + s.province + '</span></div>'
                );
            shelterMarkers.push(marker);
        });
        var countEl = document.getElementById('shelter-count');
        if (countEl) countEl.textContent = list.length + ' پناهگاه نمایش داده می‌شود';
    }

    function buildPanels(peaks, shelters) {
        var mapEl = document.getElementById('map');
        if (!mapEl || document.getElementById('peak-search')) return;

        var peakPanel = document.createElement('div');
        peakPanel.className = 'range-map-panel range-map-panel--peaks';
        peakPanel.innerHTML =
            '<h4>⛰️ جستجوی قله</h4>' +
            '<input id="peak-search" type="text" placeholder="نام قله...">' +
            '<select id="peak-difficulty-filter">' +
            '<option value="all">همه سطوح</option>' +
            '<option value="آسان">آسان</option>' +
            '<option value="متوسط">متوسط</option>' +
            '<option value="سخت">سخت</option>' +
            '<option value="خیلی‌سخت">خیلی‌سخت</option>' +
            '</select>' +
            '<div id="peak-count"></div>';
        mapEl.appendChild(peakPanel);

        function applyPeakFilter() {
            var search = document.getElementById('peak-search').value.trim();
            var diff = document.getElementById('peak-difficulty-filter').value;
            var filtered = peaks.filter(function (p) {
                return (!search || p.name.indexOf(search) >= 0) &&
                    (diff === 'all' || p.difficulty === diff);
            });
            renderPeakMarkers(filtered);
        }

        document.getElementById('peak-search').addEventListener('input', applyPeakFilter);
        document.getElementById('peak-difficulty-filter').addEventListener('change', applyPeakFilter);
        renderPeakMarkers(peaks);

        if (!shelters.length) return;

        var shelterPanel = document.createElement('div');
        shelterPanel.className = 'range-map-panel range-map-panel--shelters';
        shelterPanel.innerHTML =
            '<h4>🏕️ جستجوی پناهگاه</h4>' +
            '<input id="shelter-search" type="text" placeholder="نام پناهگاه...">' +
            '<select id="shelter-type-filter">' +
            '<option value="all">همه انواع</option>' +
            '<option value="پناهگاه">پناهگاه</option>' +
            '<option value="کمپ">کمپ</option>' +
            '<option value="جانپناه">جانپناه</option>' +
            '</select>' +
            '<div id="shelter-count"></div>';
        mapEl.appendChild(shelterPanel);

        function applyShelterFilter() {
            var search = document.getElementById('shelter-search').value.trim();
            var type = document.getElementById('shelter-type-filter').value;
            var filtered = shelters.filter(function (s) {
                return (!search || s.name.indexOf(search) >= 0) &&
                    (type === 'all' || s.type === type);
            });
            renderShelterMarkers(filtered);
        }

        document.getElementById('shelter-search').addEventListener('input', applyShelterFilter);
        document.getElementById('shelter-type-filter').addEventListener('change', applyShelterFilter);
        renderShelterMarkers(shelters);
    }

    function initMap() {
        if (started) return;
        started = true;

        var data = readData();
        var mapEl = document.getElementById('map');
        if (!data || !mapEl) return;

        var peaks = data.peaks || [];
        var shelters = data.shelters || [];
        var center = data.mapCenter || computeCenter(peaks);
        var zoom = data.mapZoom || 9;

        loadCss(LEAFLET_CSS);
        loadScript(LEAFLET_JS).then(function () {
            if (typeof L === 'undefined' || mapEl._leaflet_id) return;

            map = new L.Map('map', {
                key: NESHAN_KEY,
                maptype: 'dreamy',
                poi: false,
                traffic: false,
                center: center,
                zoom: zoom
            });

            var bg = document.querySelector('.hero-map-bg');
            if (bg) {
                map.whenReady(function () {
                    bg.style.opacity = '0';
                    bg.style.pointerEvents = 'none';
                });
            }

            buildPanels(peaks, shelters);

            setTimeout(function () {
                if (map) map.invalidateSize();
            }, 250);
        }).catch(function () {
            started = false;
        });
    }

    function scheduleInit() {
        if (window.requestIdleCallback) {
            requestIdleCallback(initMap, { timeout: 3000 });
        } else {
            setTimeout(initMap, 1000);
        }
    }

    if (document.readyState === 'complete') scheduleInit();
    else window.addEventListener('load', scheduleInit, { once: true });
})();
