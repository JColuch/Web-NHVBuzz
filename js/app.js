/* --------------------------- *\
  #MODELS
\* --------------------------- */

var modelFavorites = [
  {
    name: "Claire's Cornocopia",
    location: "New Haven, CT"
  },
  {
    name: "Starbucks Coffee",
    location: "New Haven, CT"
  },
  {
    name: "Yale University",
    location: "New Haven, CT"
  },
  {
    name: "Yale-New Haven Hospital",
    location: "New Haven, CT"
  },
  {
    name: "Blue State Coffee",
    location: "New Haven, CT"
  }
];






/* --------------------------- *\
  #CLASSES
\* --------------------------- */
var Placemarker = function(data) {
  this.name = data.name;
  this.location = data.location;
}





/* --------------------------- *\
  #VIEWMODEL
\* --------------------------- */

var ViewModel = function() {
  // Data

  var self = this;
  var markers = [];

  var map;
  var openInfoWindow;

  var mapBounds;

  self.searchTerm = ko.observable();
  self.sideBarTitle = ko.observable();
  self.placeList = ko.observableArray([]);


  self.sideBarTitle("Places");

  // Operations

  function initializeMap() {

    var newHaven = { lat: 41.3100, lng: -72.924 };

    var mapOptions = {
      center: newHaven,
      zoom: 14,
      panControl: false,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      overviewMapControl: false
    };

    map = new google.maps.Map(document.getElementById("map-canvas"),
                              mapOptions);

    mapBounds = new google.maps.LatLngBounds();
  }

  // On load initalize map
  google.maps.event.addDomListener(window, "load", initializeMap);


  self.getPlaces =function() {
    // Get search term from input
    var searchTerm = self.searchTerm();
    if (!searchTerm) {
      // If no input default to restaurants
      searchTerm = "Restaurants";
    }

    // Clear input box
    self.searchTerm("");

    // Update Side Bar Title
    var title = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
    self.sideBarTitle(title);

    var service = new google.maps.places.PlacesService(map);
    
    var request = {
      location: { lat: 41.3100, lng: -72.924 },
      radius: '300',
      query: searchTerm
    };

    service.textSearch(request, self.callback);
  }

  // Source: https://developers.google.com/maps/documentation/javascript/
  // places#TextSearchRequests
  self.callback = function(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      // Clear old markers
      deleteMarkers();

      for (var i = 0; i < results.length; i++) {
        self.createMarker(results[i]);
      }

      loadSideBar(results);
    }
    else {
      console.log("ERROR");
    }
  }


  self.createMarker = function(placeData) {
    var name = placeData.name;
    // var lat = placeData.geometry.location.lat();  // latitude from the place service
    // var lon = placeData.geometry.location.lng();  // longitude from the place service
    var position = placeData.geometry.location;
    var bounds = mapBounds;
    var address = placeData.formatted_address;
    var rating = placeData.rating || "No rating available";
    // marker is an object with additional data about the pin
    // for a single location
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: name
      //animation: google.maps.Animation.DROP
    });

    // Keep track of markers
    markers.push(marker);

    var content = '<div class="gm-title">' + name + "</h5>";
    content += '<div>' + rating + '</div>';
    content += '<div class="gm-addr">' + address + '</div>';
    content += '<div class="gm-website"><a href="#">ynhh.org</a></div>';
    
    // Attach infowidnow
    var infowindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', function() {
      // Center map on marker clicked
      map.panTo(marker.getPosition());

      // Close current open window
      if (openInfoWindow) {
        openInfoWindow.close();
      }

      openInfoWindow = infowindow;
      openInfoWindow.open(map, marker);
    });

  }

  // SOURCE: https://developers.google.com/maps/documentation/
  // javascript/examples/marker-remove
  // Sets the map on all markers in the array.
  function setAllMap(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }

  // Removes the markers from the map, but keeps them in the array.
  function clearMarkers() {
    setAllMap(null);
  }
  
  // Shows any markers currently in the array.
  function showMarkers() {
    setAllMap(map);
  }

  // Deletes all markers in the array by removing references to them.
  function deleteMarkers() {
    clearMarkers();
    markers = [];
  }



  function loadSideBar(data) {
    // Empty side bar
    self.placeList.removeAll();

    // Load placeMarkers
    data.forEach(function(place) {
      self.placeList.push(new Placemarker(place));
    });
  }



  
  // AJAX Calls
    // get data
    // pass to correct callback to manipulate view

};

ko.applyBindings(new ViewModel());







var sbHeader = document.getElementsByClassName("side-bar-header")[0];
var elm = document.getElementsByClassName("menu-toggle")[0];
var infoClose = document.getElementsByClassName("close-btn")[0];
var bar = document.getElementsByClassName("side-bar")[0];
var listings = document.getElementsByClassName("place-listings")[0];
var logo = document.getElementsByClassName("fa")[0];
var info = document.getElementsByClassName("info-bar")[0];

elm.addEventListener('click', function() {
  sbHeader.classList.toggle("sbh-active");
  bar.classList.toggle("side-bar-active");
  elm.classList.toggle("toggle");
  info.classList.remove("info-bar-active");
})


listings.addEventListener('click', function() {

  info.classList.add("info-bar-active");
});

infoClose.addEventListener('click', function() {

  info.classList.remove("info-bar-active");
});



function getFoursquareData() {
  var CLIENT_ID = "S5NWL3EHTULCWQBMZPATQXYRSJJY1ZIDZQVEDE5RQA2XU3L2";
  var CLIENT_SECRET = "SHMKP1QG43ZKS55DPJO3P3PA5XAUYKZWKANFTT4A54FHVLQV";

  var requestUrl = "https://api.foursquare.com/v2/venues/explore";
  requestUrl += "?client_id=" + CLIENT_ID;
  requestUrl += "&client_secret=" + CLIENT_SECRET;
  requestUrl += "&v=20130815"; // version
  requestUrl += "&ll=41.31,-72.924"; // latitude, longitude
  requestUrl += "&query=sushi";


  $.ajax({
    url: requestUrl,
    dataType: "jsonp",
    method: "GET",
    success: success
  })
}

function success(data) {
  console.log("SUCCESS");
  console.log(data);
}




