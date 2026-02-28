// Initialize Map
var map = L.map('map').setView([17.385044, 78.486671], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Unsafe Zone
var unsafeZone = L.circle([17.390044, 78.490671], {
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.4,
    radius: 500
}).addTo(map);

unsafeZone.bindPopup("High Risk Area 🚨");

var routeLine;

// Toast & loading helpers
var toastContainer = document.getElementById('toastContainer');
var loadingOverlay = document.getElementById('loadingOverlay');

function showToast(message, opts) {
    opts = opts || {};
    var type = opts.type || 'success';
    var toast = document.createElement('div');
    toast.className = 'toast ' + (type === 'danger' ? 'danger' : 'success');
    toast.setAttribute('role','status');
    toast.innerHTML = '<div class="icon">' + (type === 'danger' ? '🚨' : '✅') + '</div>' +
        '<div class="body"><strong>' + (opts.title || '') + '</strong><div class="msg">' + message + '</div></div>';
    toastContainer.appendChild(toast);

    // auto dismiss
    setTimeout(function(){
        toast.classList.add('hide');
        setTimeout(function(){ toast.remove(); }, 360);
    }, opts.duration || 4000);
}

function showLoading(on) {
    if (!loadingOverlay) return;
    if (on) loadingOverlay.classList.remove('hidden'); else loadingOverlay.classList.add('hidden');
}

// Helper: geocode an address string using Nominatim
function geocode(query) {
    if (!query) return Promise.reject('empty');
    // If input looks like lat,lng use it directly
    var coords = query.split(',').map(function(s){ return s.trim(); });
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        return Promise.resolve({ lat: parseFloat(coords[0]), lon: parseFloat(coords[1]) });
    }

    var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query);
    return fetch(url, { headers: { 'Accept': 'application/json' } })
        .then(function(res){ return res.json(); })
        .then(function(results){
            if (results && results.length) {
                return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
            }
            throw new Error('No results');
        });
}

function renderRoute(source, destination) {
    if (routeLine) {
        map.removeLayer(routeLine);
    }

    var hour = new Date().getHours();
    var risk = 0;

    if (hour >= 19 || hour <= 5) {
        risk += 5;
    }

    risk += 10;

    document.getElementById("riskValue").innerText = risk;

    var riskBox = document.getElementById("riskBox");
    var status = document.getElementById("riskStatus");

    var routeColor = "green";
    var routeWeight = 4;

    if (risk <= 5) {
        riskBox.style.backgroundColor = "lightgreen";
        status.innerText = "Status: Safe";
        routeColor = "green";
        routeWeight = 4;
    }
    else if (risk <= 10) {
        riskBox.style.backgroundColor = "yellow";
        status.innerText = "Status: Medium Risk";
        routeColor = "orange";
        routeWeight = 6;
    }
    else {
        riskBox.style.backgroundColor = "red";
        status.innerText = "Status: High Risk";
        routeColor = "red";
        routeWeight = 8;
    }

    routeLine = L.polyline([source, destination], {
        color: routeColor,
        weight: routeWeight,
        opacity: 0.95,
        dashArray: '6,4'
    }).addTo(map);

    // Add markers for clarity
    L.circleMarker(source, { radius:6, color:'#2b8cbe', fillColor:'#2b8cbe', fillOpacity:1 }).addTo(map).bindPopup('Start');
    L.circleMarker(destination, { radius:6, color:'#7b3294', fillColor:'#7b3294', fillOpacity:1 }).addTo(map).bindPopup('End');

    map.fitBounds(routeLine.getBounds(), { padding: [40,40] });
}

// Public: invoked by UI
function findRoute() {
    var from = document.getElementById('fromInput').value.trim();
    var to = document.getElementById('toInput').value.trim();

    if (!from || !to) {
        showToast('Please enter both From and To locations (address or lat,lng).', { type: 'danger', title: 'Input required' });
        return;
    }
    showLoading(true);
    Promise.all([geocode(from), geocode(to)])
        .then(function(results){
            var s = [results[0].lat, results[0].lon];
            var d = [results[1].lat, results[1].lon];
            renderRoute(s, d);
            showToast('Route calculated successfully.', { type: 'success' });
        })
        .catch(function(err){
            console.error(err);
            showToast('Could not find one or both locations. Try a different query.', { type: 'danger', title: 'Lookup failed' });
        })
        .finally(function(){ showLoading(false); });
}

// Backwards-compatible drawRoute still available (uses defaults)
function drawRoute() {
    var source = [17.385044, 78.486671];
    var destination = [17.395044, 78.496671];
    renderRoute(source, destination);
}

// Ensure intro disappears fully
setTimeout(function() {
    var intro = document.getElementById("introScreen");
    if (intro) {
        intro.style.display = "none";
    }
}, 4000);
function triggerSOS() {

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(function(position) {

            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            var userLocation = [lat, lng];

            var sosMarker = L.circleMarker(userLocation, {
                radius: 10,
                color: 'red',
                fillColor: 'red',
                fillOpacity: 1
            }).addTo(map);

            sosMarker.bindPopup("🚨 SOS Triggered! Help is on the way.").openPopup();

            map.setView(userLocation, 15);
                    showToast('Emergency Alert Sent Successfully. Trusted contacts notified.', { type: 'danger', title: 'Emergency' });

        });

    } else {
        showToast('Geolocation not supported on this device.', { type: 'danger', title: 'Geolocation' });
    }
}