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
// Add Locate Control


//----------------------------------------------Manual Lines
//                              Jahan Khan
jahankhan.features.map(i => {
    if (i.geometry.type === 'polyline') {
        var polyline = L.polyline(i.geometry.coords, { color: i.color, className: `${i.id}` }).addTo(map);
    } else {
        var marker = new L.marker([39.5, -77.3], { opacity: 0.01 });
    }
})

//                             Thatha Kauriana 
thathakauriana.features.map(i => {
    if (i.geometry.type === 'polyline') {
        var polyline = L.polyline(i.geometry.coords, { color: i.color, className: `${i.id}` }).addTo(map);
    } else {
        var marker = new L.marker([39.5, -77.3], { opacity: 0.01 });
    }
})
//                              Daduana Kohna
daduana.features.map(i => {
    if (i.geometry.type === 'polyline') {
        var polyline = L.polyline(i.geometry.coords, { color: i.color }).addTo(map);
    } else {
        var cord = i.geometry.coords[0]
        var textLabel = L.divIcon({
            className: 'text-label',
            html: `${i.id}`,
            iconSize: [30, 30],
            iconAnchor: [10, 33]
        });
        L.marker(cord, { icon: textLabel }).addTo(map);
    }
})

//                                 Pipil Wala
pipilwala.features.map(i => {
    var coords = [
        [i.start.lat, i.start.lng], [i.end.lat, i.end.lng]
    ]
    var polyline = L.polyline(coords, { color: "red" }).addTo(map);
})





//----------------------------------------------Controls
// Draw toolbar
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polyline: {
            showLength: true,
            metric: false,
            shapeOptions: {
                color: 'red'
            }
        },
        polygon: {
            showArea: true,
            showLength: true,
            metric: false,
        }
    },
    position: 'bottomleft'
});
map.addControl(drawControl);




//----------------------------------------------Distance Calculator b/w coords
function haversineDistance(coord1, coord2) {
    const R = 20902231.64; // Radius of the Earth in feet
    const lat1 = coord1.lat * Math.PI / 180; // Convert latitude to radians
    const lon1 = coord1.lng * Math.PI / 180; // Convert longitude to radians
    const lat2 = coord2.lat * Math.PI / 180;
    const lon2 = coord2.lng * Math.PI / 180;

    const dlat = lat2 - lat1; // Difference in latitude
    const dlon = lon2 - lon1; // Difference in longitude

    const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dlon / 2) * Math.sin(dlon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in feet

    return distance;
}
//                                             Square feet to local area calculation
function convertArea(areaInSqFt) {
    const areaInMarla = Math.floor(areaInSqFt / 272);
    const remainingSqFtAfterMarla = areaInSqFt % 272; // Remaining square feet after calculating marlas
    const areaInKanal = Math.floor(areaInMarla / 20);
    const remainingMarlaAfterKanal = areaInMarla % 20; // Remaining marlas after calculating kanals
    const areaInAcre = Math.floor(areaInKanal / 8);
    const remainingKanalAfterAcre = areaInKanal % 8; // Remaining kanals after calculating acres

    return {
        acres: areaInAcre,
        kanals: remainingKanalAfterAcre,
        marlas: remainingMarlaAfterKanal,
        squareFeet: remainingSqFtAfterMarla
    };
}

//----------------------------------------------Map On Events
map.on('draw:created', function (e) {
    var layer = e.layer;

    if (e.layerType === 'polyline') {
        var ll = layer._latlngs;
        for (let i = 0; i < ll.length - 1; i++) {
            const point1 = ll[i];
            const point2 = ll[i + 1];

            const line = L.polyline([[point1.lat, point1.lng], [point2.lat, point2.lng]], {
                color: 'blue',
                weight: 3
            }).addTo(map);

            const distance = haversineDistance(point1, point2).toFixed(2);

            line.bindTooltip(`${distance} feet`, {
                permanent: true,
                direction: 'center',
            });
            drawnItems.addLayer(line);
        }
    } else if (e.layerType === 'polygon') {
        // Get the latlngs of the polygon
        const latlngs = layer.getLatLngs()[0];
        const area = turf.area(layer.toGeoJSON()) * 10.7639; // Convert square meters to square feet
        const { acres, kanals, marlas, squareFeet } = convertArea(area);

        layer.bindTooltip(`${acres} acre<br>${kanals} kanal<br>${marlas} marla<br>${squareFeet.toFixed(1)} sqft`, {

            permanent: true,
            direction: 'center',
        }).addTo(map);

        // Calculate and bind side lengths as tooltips
        for (let i = 0; i < latlngs.length; i++) {
            const point1 = latlngs[i];
            const point2 = latlngs[(i + 1) % latlngs.length]; // Loop back to the first point

            const distance = haversineDistance(point1, point2).toFixed(2);

            // Create a line segment for each side of the polygon
            const sideLine = L.polyline([[point1.lat, point1.lng], [point2.lat, point2.lng]], {
                color: 'blue',
                weight: 2,
            }).addTo(map);

            sideLine.bindTooltip(`${distance} feet`, {
                permanent: true,
                direction: 'center',
            });

            drawnItems.addLayer(sideLine);
        }

        drawnItems.addLayer(layer);
    } else if (e.layerType === 'rectangle') {
        const bounds = layer.getBounds();
        const width = bounds.getEast() - bounds.getWest();
        const height = bounds.getNorth() - bounds.getSouth();
        const area = width * height * 69.047; // Approx. 1 degree = 69.047 feet in latitude

        const centroid = bounds.getCenter();

        layer.bindTooltip(`Area: ${area.toFixed(2)} sq ft`, {
            permanent: true,
            direction: 'center',
        }).setLatLng(centroid).addTo(map);
        drawnItems.addLayer(layer);
    } else if (e.layerType === 'circle') {
        const radius = layer.getRadius();
        const area = Math.PI * Math.pow(radius, 2); // Area in square feet
        const center = layer.getLatLng();

        layer.bindTooltip(`Area: ${area.toFixed(2)} sq ft`, {
            permanent: true,
            direction: 'center',
        }).setLatLng(center).addTo(map);
        drawnItems.addLayer(layer);
    } else {
        layer.bindPopup(JSON.stringify(layer._latlng)).openPopup();
        a.push(`${layer._latlng.lat}, ${layer._latlng.lng}`);
        console.log(a);
        drawnItems.addLayer(layer);
    }
});


map.on('draw:edited', function (e) {
    const layers = e.layers;
    layers.eachLayer(function (layer) {
        const latlngs = layer.getLatLngs();
        const point1 = { lat: latlngs[0].lat, lng: latlngs[0].lng };
        const point2 = { lat: latlngs[1].lat, lng: latlngs[1].lng };
        const newDistance = haversineDistance(point1, point2).toFixed(2);
        layer.bindTooltip(newDistance, {
            permanent: true,
            direction: 'center',
        }).openTooltip();
    })
});



//                                       Update live coordinates on mouse move
map.on('move', function (e) {
    var center = map.getCenter();
    document.getElementById('center-coord').textContent = center.lat.toFixed(5) + ", " + center.lng.toFixed(5);
});



//                                                  Image Overlay

var imageUrl = './tk-b.png'; // Replace with your image URL
var imageBounds = [[31.45295, 72.25096], [31.41692, 72.28641]]; // Adjust coordinates as needed
L.imageOverlay(imageUrl, imageBounds).addTo(map);

//                                                   Show/Hide popup
document.getElementById('calc').addEventListener('click', function () {
    document.getElementById('popup').style.display = 'block';
});

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

function calculateThirdSide() {
    let side1 = parseFloat(document.getElementById('side1').value);
    let side2 = parseFloat(document.getElementById('side2').value);
    let angle = parseFloat(document.getElementById('angle').value);

    if (isNaN(side1) || isNaN(side2) || isNaN(angle)) {
        alert('Please enter valid values for sides and angle.');
        return;
    }

    let angleInRadians = angle * (Math.PI / 180);
    let side3 = Math.sqrt(side1 ** 2 + side2 ** 2 - 2 * side1 * side2 * Math.cos(angleInRadians));
    document.getElementById('side3').value = side3.toFixed(2);
    document.getElementById('result').innerHTML = "Calculated Side 3: " + side3.toFixed(2) + " feet";
}

function calculateTriangleArea() {
    let side1 = parseFloat(document.getElementById('side1').value);
    let side2 = parseFloat(document.getElementById('side2').value);
    let side3 = parseFloat(document.getElementById('side3').value);

    if (isNaN(side1) || isNaN(side2) || isNaN(side3)) {
        alert('Please enter valid side lengths for the triangle.');
        return;
    }

    let s = (side1 + side2 + side3) / 2;
    let area = Math.sqrt(s * (s - side1) * (s - side2) * (s - side3));

    if (isNaN(area)) {
        document.getElementById('result').innerHTML = "Invalid Triangle!";
    } else {
        document.getElementById('result').innerHTML = "Area of the Triangle: " + area.toFixed(2) + " square feet";
    }
}

function addSide() {
    const sideIndex = document.querySelectorAll('#polygon-list input').length + 4;
    const polygonList = document.getElementById('polygon-list');

    const sideInput = document.createElement('input');
    sideInput.type = 'number';
    sideInput.placeholder = `Enter side ${sideIndex} length in feet`;
    sideInput.id = `side${sideIndex}`;
    sideInput.name = `side${sideIndex}`;

    const sideLabel = document.createElement('label');
    sideLabel.textContent = `Side ${sideIndex} (in feet):`;

    polygonList.appendChild(sideLabel);
    polygonList.appendChild(sideInput);
}

function calculatePolygonArea() {
    let polygonSides = [];
    let i = 1;
    while (document.getElementById('side' + i)) {
        let sideLength = parseFloat(document.getElementById('side' + i).value);
        if (!isNaN(sideLength)) {
            polygonSides.push(sideLength);
        }
        i++;
    }

    if (polygonSides.length < 3) {
        alert('A polygon must have at least 3 sides.');
        return;
    }

    let n = polygonSides.length;
    let perimeter = polygonSides.reduce((a, b) => a + b, 0);
    let apothem = polygonSides[0] / (2 * Math.tan(Math.PI / n));

    let area = (perimeter * apothem) / 2;

    document.getElementById('result').innerHTML = "Approximate Area of the Polygon: " + area.toFixed(2) + " square feet";
}

//                                                  Live Location Functionality
var marker;
var pos = false
function onLocationFound(e) {
    console.log("kitni")

    if (pos === true) {
        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng).addTo(map);
        }
        map.setView(e.latlng);
    }
}

function onLocationError(e) {
    document.getElementById('locate-button').style.backgroundColor = 'red'
}


document.getElementById("locate-button").addEventListener('click', function () {
    pos = !pos
    console.log(pos)
    if (pos === false) {
        document.getElementById('locate-button').style.backgroundColor = 'white'
    }
    if (pos === true) {
        document.getElementById('locate-button').style.backgroundColor = 'green'
        // Use watchPosition to continuously update location
        navigator.geolocation.watchPosition(function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var accuracy = position.coords.accuracy;
            onLocationFound({ latlng: [lat, lng], accuracy: accuracy });
        }, onLocationError, {
            enableHighAccuracy: true, // Use high accuracy for better precision
            timeout: 1000, // Timeout for location
            maximumAge: 0 // No caching of location
        });
    }
})


//                                                  Copy the center coordinates

var centerCoordinatesDiv = document.getElementById("center-coordinates");
centerCoordinatesDiv.onclick = function () {
    const textToCopy = this.innerText; // Get the inner text of the div
    navigator.clipboard.writeText(textToCopy) // Copy the text to clipboard
        .then(() => {
            alert('Coordinates copied: ' + textToCopy); // Confirmation alert
        })
        .catch(err => {
            console.error('Failed to copy: ', err); // Error handling
        });
}

// Function to toggle search bar visibility
document.getElementById('search-icon').addEventListener('click', function () {
    const searchBar = document.getElementById('search-coordinates');
    if (searchBar.style.display === 'none') {
        searchBar.style.display = 'block';
    } else {
        searchBar.style.display = 'none';
    }
});

function searchCoordinates() {
    const coordInput = document.getElementById('coord-input').value;

    // Split the input value by comma to extract latitude and longitude
    const coords = coordInput.split(',');

    if (coords.length !== 2) {
        alert("Please enter coordinates in the format: latitude, longitude");
        return;
    }

    const lat = parseFloat(coords[0].trim());
    const lng = parseFloat(coords[1].trim());

    // Check if lat and lng are valid numbers
    if (isNaN(lat) || isNaN(lng)) {
        alert("Please enter valid latitude and longitude values.");
        return;
    }

    // Zoom to the entered coordinates and add a marker
    map.flyTo([lat, lng], 15); // Zoom to the coordinates
    L.marker([lat, lng]).addTo(map).bindPopup(`Searched Location: (${lat}, ${lng})`).openPopup();

    // Optionally, hide the search bar after searching
    document.getElementById('search-coordinates').style.display = 'none';
}
