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

// Draw Route Function
function drawRoute() {

    if (routeLine) {
        map.removeLayer(routeLine);
    }

    let sourceInput = document.getElementById("sourceInput").value;
    let destinationInput = document.getElementById("destinationInput").value;

    if (!sourceInput || !destinationInput) {
        alert("Please enter source and destination as lat,lng");
        return;
    }

    let source = sourceInput.split(',').map(Number);
    let destination = destinationInput.split(',').map(Number);

    let hour = new Date().getHours();
    let risk = 0;

    // Night risk
    if (hour >= 19 || hour <= 5) {
        risk += 5;
    }

    // Check if near unsafe zone
    let distanceToUnsafe = map.distance(source, [17.390044, 78.490671]);

    if (distanceToUnsafe < 600) {
        risk += 10;
    }

    updateRiskUI(risk);

    let routeColor = getRouteColor(risk);
    let routeWeight = risk > 10 ? 8 : 5;

    routeLine = L.polyline([source, destination], {
        color: routeColor,
        weight: routeWeight,
        opacity: 0.9
    }).addTo(map);

    map.fitBounds(routeLine.getBounds());
}
function updateRiskUI(risk) {

    document.getElementById("riskValue").innerText = risk;

    let status = document.getElementById("riskStatus");
    let circle = document.querySelector(".circle");

    let degree = (risk / 15) * 360;

    if (risk <= 5) {
        status.innerText = "Status: Safe";
        circle.style.background = `conic-gradient(green ${degree}deg, #eee ${degree}deg)`;
    }
    else if (risk <= 10) {
        status.innerText = "Status: Medium Risk";
        circle.style.background = `conic-gradient(orange ${degree}deg, #eee ${degree}deg)`;
    }
    else {
        status.innerText = "Status: High Risk";
        circle.style.background = `conic-gradient(red ${degree}deg, #eee ${degree}deg)`;
    }
}

function getRouteColor(risk) {
    if (risk <= 5) return "green";
    if (risk <= 10) return "orange";
    return "red";
}
navigator.geolocation.getCurrentPosition(function(position) {
    let userLatLng = [position.coords.latitude, position.coords.longitude];

    L.marker(userLatLng)
        .addTo(map)
        .bindPopup("You are here")
        .openPopup();

    map.setView(userLatLng, 14);
});
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

            alert("Emergency Alert Sent to Trusted Contacts!");

        });

    } else {
        alert("Geolocation not supported");
    }
}