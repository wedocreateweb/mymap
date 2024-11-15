// Google maps browser

var map = L.map('map', {
    center: [31.4187222, 72.2825785],
    zoom: 13,
    measureControl: true,
    zoomAnimation: true, // Enable zoom animation
    zoomSnap: 0.05, // Smaller increments for smoother zoom
    zoomDelta: 0.1, // Smaller zoom increment per scroll
    wheelDebounceTime: 20, // Quick response to wheel actions
    wheelPxPerZoomLevel: 50
})
googleHybrid = L.tileLayer('http://{s}.google.com/vt?lyrs=s,h&x={x}&y={y}&z={z}', {
    maxZoom: 30,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
googleHybrid.addTo(map)
// Scale
L.control.scale({ position: 'bottomright' }).addTo(map)



//----------------------------------------------Manual Lines
// Main Script
document.addEventListener("DOMContentLoaded", function () {
    // Initialize Map
    const map = L.map("map").setView([0, 0], 2);

    // Add Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    // Utility: Haversine Distance
    function haversineDistance(coord1, coord2) {
        const R = 20902231.64; // Earth's radius in feet
        const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
        const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(coord1.lat * Math.PI / 180) *
            Math.cos(coord2.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Add GeoJSON Features
    function addMapFeatures(features, map) {
        features.map(i => {
            if (i.geometry.type === 'polyline') {
                L.polyline(i.geometry.coords, { color: i.color, className: `${i.id}` }).addTo(map);
            } else if (i.geometry.type === 'point') {
                L.marker(i.geometry.coords, { opacity: 0.01 }).addTo(map);
            }
        });
    }

    // Example Data Layers (Replace with Actual GeoJSON Data)
    const exampleFeatures = [
        { geometry: { type: 'polyline', coords: [[0, 0], [1, 1]] }, color: 'blue', id: 'line1' },
        { geometry: { type: 'point', coords: [0, 0] }, id: 'point1' }
    ];
    addMapFeatures(exampleFeatures, map);

    // Draw Tools Initialization
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    const drawControl = new L.Control.Draw({
        edit: { featureGroup: drawnItems },
        draw: {
            polyline: true,
            polygon: false,
            circle: false,
            marker: false
        }
    });
    map.addControl(drawControl);

    // Handle Draw Events
    map.on('draw:created', function (e) {
        const layer = e.layer;
        drawnItems.addLayer(layer);

        if (e.layerType === 'polyline') {
            const latlngs = layer._latlngs;
            latlngs.forEach((point, index) => {
                if (index < latlngs.length - 1) {
                    const distance = haversineDistance(point, latlngs[index + 1]).toFixed(2);
                    const line = L.polyline([point, latlngs[index + 1]], { color: 'blue', weight: 3 }).addTo(map);
                    line.bindTooltip(`${distance} feet`, { permanent: true, direction: 'center' });
                }
            });
        }
    });

    // Live Location Updates
    let lastUpdateTime = Date.now();
    function throttle(fn, limit) {
        return function (...args) {
            if (Date.now() - lastUpdateTime > limit) {
                fn(...args);
                lastUpdateTime = Date.now();
            }
        };
    }

    function onLocationFound(e) {
        const radius = e.accuracy / 2;
        L.marker(e.latlng).addTo(map).bindPopup("You are within " + radius + " meters from this point").openPopup();
        L.circle(e.latlng, radius).addTo(map);
    }

    function onLocationError(e) {
        alert(e.message);
    }

    navigator.geolocation.watchPosition(
        throttle(({ coords }) => {
            onLocationFound({
                latlng: [coords.latitude, coords.longitude],
                accuracy: coords.accuracy
            });
        }, 1000),
        onLocationError,
        { enableHighAccuracy: true }
    );
});
