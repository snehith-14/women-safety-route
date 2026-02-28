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

    var source = [17.385044, 78.486671];
    var destination = [17.395044, 78.496671];

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
        opacity: 0.9
    }).addTo(map);

    map.fitBounds(routeLine.getBounds());
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

            alert("Emergency Alert Sent to Trusted Contacts!");

        });

    } else {
        alert("Geolocation not supported");
    }
}