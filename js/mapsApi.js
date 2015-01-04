// Create map and append to index.html
function initialize() {
  var mapOptions = {
    center: { lat: 41.3100, lng: -72.9236 },
    zoom: 13
  };
  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
}

// On load initalize map
google.maps.event.addDomListener(window, "load", initialize);