// Create our map, giving it the streetmap and earthquakes layers to display on load
var myMap = L.map("map", {
   center: [
      37.09, -95.71
    ],
    zoom: 5,
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Create a color scale for the depth of earthquakes.
var depthColor = d3.scaleLinear()
    .domain([0, 100]) // You might need to adjust this depending on your data.
    .range(['lightgreen', 'darkred']);

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});

// This function creates a marker for each earthquake in the data.
function createFeatures(features) {
    // Loop over each earthquake feature.
    for (var i = 0; i < features.length; i++) {
        // The depth of the earthquake is the third coordinate.
        var depth = features[i].geometry.coordinates[2];
        
        // Create a new circle for the earthquake. The radius is the magnitude, and the color is the depth.
        var circle = L.circle([features[i].geometry.coordinates[1], features[i].geometry.coordinates[0]], {
            color: 'black',
            weight: 1,
            fillColor: depthColor(depth),
            fillOpacity: 0.8,
            radius: features[i].properties.mag * 20000 // Adjust as needed.
        });

        // Add the circle to the map.
        circle.addTo(myMap);

        // Create a popup for the circle that displays additional information about the earthquake.
        circle.bindPopup("<h4>" + features[i].properties.place + "</h4><p>Magnitude: " + features[i].properties.mag + "</p><p>Depth: " + depth + " km</p>");
    }
};

// Define a legend to explain the colors.
var legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var labels = [];
    var categories = [0, 10, 30, 50, 70, 90];

    // Create a label for each category.
    for (var i = 0; i < categories.length; i++) {
        var from = categories[i];
        var to = categories[i + 1] - 1;

        labels.push(
            '<i style="background:' + depthColor(from + 1) + '"></i> ' +
            from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = "<h4>Earthquake Depth</h4>" + labels.join('<br>');
    return div;
};

legend.addTo(myMap);
