/**
 * Shared shelter "View on map" modal (homepage + panahgah).
 */
(function (global) {
    'use strict';

    var NESHAN_KEY = 'web.6a240d5daf514aa6a2bdeac77b73f5e5';
    var modalMap = null;
    var modalMarker = null;
    var bound = false;

    function $(id) {
        return document.getElementById(id);
    }

    function whenLeaflet(cb) {
        if (typeof L !== 'undefined') {
            cb();
            return;
        }
        var tries = 0;
        var timer = setInterval(function () {
            if (typeof L !== 'undefined') {
                clearInterval(timer);
                cb();
            } else if (++tries > 60) {
                clearInterval(timer);
            }
        }, 100);
    }

    function openShelterMap(lat, lng, name) {
        var modal = $('shelterMapModal');
        var title = $('shelterMapModalTitle');
        var mapEl = $('shelterModalMap');
        if (!modal || !mapEl) return;

        if (title) title.textContent = name || '';
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        whenLeaflet(function () {
            if (!modalMap) {
                modalMap = new L.Map('shelterModalMap', {
                    key: NESHAN_KEY,
                    maptype: 'dreamy',
                    poi: false,
                    traffic: false,
                    center: [lat, lng],
                    zoom: 13
                });
            } else {
                modalMap.setView([lat, lng], 13);
                setTimeout(function () {
                    if (modalMap) modalMap.invalidateSize();
                }, 150);
            }

            if (modalMarker) modalMap.removeLayer(modalMarker);
            modalMarker = L.marker([lat, lng]).addTo(modalMap).bindPopup(name || '').openPopup();
        });
    }

    function closeShelterMap() {
        var modal = $('shelterMapModal');
        if (!modal) return;
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    function bindModal() {
        if (bound) return;
        bound = true;

        var closeBtn = $('shelterMapModalClose');
        var overlay = $('shelterMapModalOverlay');
        if (closeBtn) closeBtn.addEventListener('click', closeShelterMap);
        if (overlay) overlay.addEventListener('click', closeShelterMap);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeShelterMap();
        });

        document.addEventListener('click', function (e) {
            var btn = e.target.closest('.sh-map-btn');
            if (!btn) return;
            var lat = parseFloat(btn.getAttribute('data-lat'));
            var lng = parseFloat(btn.getAttribute('data-lng'));
            var name = btn.getAttribute('data-name') || '';
            if (!isNaN(lat) && !isNaN(lng)) openShelterMap(lat, lng, name);
        });
    }

    function init() {
        if (!$('shelterMapModal')) return;
        bindModal();
    }

    global.ShelterMapModal = {
        open: openShelterMap,
        close: closeShelterMap
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
