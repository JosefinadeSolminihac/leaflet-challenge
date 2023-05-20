// Create map: Here, I use Leaflet's L.map function to create a map. Specifying that the map should be displayed in a HTML element with the ID "map". The center option sets the initial geographic center of the map, and zoom sets the initial zoom level.
var myMap = L.map("map", {
   center: [
      37.09, -95.71
    ],
    zoom: 5,
});

// Adding the tile layer: The L.tileLayer function is used to load and display tile layers on the map. The first argument is the URL template of the tile layer. The {s}, {z}, {x}, and {y} are placeholders that Leaflet recognizes and replaces with appropriate values. addTo(myMap) is called to add the layer to the map we created earlier.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Store our API endpoint as queryUrl. This is the URL of the earthquake data from the USGS, all Earthquakes the past day.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Create a color scale for the depth of earthquakes. Using D3.js to create a linear color scale for the depth of earthquakes. This scale will map depths from 0 to 100 (the "domain") to colors between light green and dark red (the "range"). This will allow us to visualize the depth of earthquakes with color.
var depthColor = d3.scaleLinear()
    .domain([0, 100])
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
