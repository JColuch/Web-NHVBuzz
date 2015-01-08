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

    // Attach infowidnow
    var infowindow = new google.maps.InfoWindow({
      content: "<h5>" + name + "</h5>"
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








var elm = document.getElementsByClassName("slide-logo")[0];
var infoClose = document.getElementsByClassName("slide-logo")[1];
var bar = document.getElementsByClassName("side-bar")[0];
var listings = document.getElementsByClassName("place-listings")[0];
var logo = document.getElementsByClassName("fa")[0];
var info = document.getElementsByClassName("info-bar")[0];

elm.addEventListener('click', function() {
  bar.classList.toggle("side-bar-active");
  logo.classList.toggle("fa-angle-double-right");
})


listings.addEventListener('click', function() {
  elm.style.visibility = "hidden";
  info.classList.add("info-bar-active");
});

infoClose.addEventListener('click', function() {
  elm.style.visibility = "visible";
  info.classList.remove("info-bar-active");
});
// Here's my data model
// var ViewModel = function(first, last) {
//     this.firstName = ko.observable(first);
//     this.lastName = ko.observable(last);
 
//     this.fullName = ko.pureComputed(function() {
//         // Knockout tracks dependencies automatically. It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
//         return this.firstName() + " " + this.lastName();
//     }, this);
// };
 
// ko.applyBindings(new ViewModel("Planet", "Earth"));









/* --------------------------- *\
  #MAP STUFF
\* --------------------------- */








  // // Sets the boundaries of the map based on pin locations
  // window.mapBounds = new google.maps.LatLngBounds();

  // locations is an array of location strings returned from locationFinder()
  // #TODO: Replace locationFinder with 
 // locations = Model_Favorites;

  // pinPoster(locations) creates pins on the map for each location in
  // the locations array
 // pinPoster(locations);














/**
 * 
 */

/*
  Start here! initializeMap() is called when page is loaded.
*/
function initializeMap() {

  var locations;

  var mapOptions = {
    disableDefaultUI: true
  };

  // This next line makes `map` a new Google Map JavaScript Object and attaches it to
  // <div id="map">, which is appended as part of an exercise late in the course.
  map = new google.maps.Map(document.querySelector('#map'), mapOptions);


  /*
  locationFinder() returns an array of every location string from the JSONs
  written for bio, education, and work.
  */
  function locationFinder() {

    // initializes an empty array
    var locations = [];

    // adds the single location property from bio to the locations array
    locations.push(bio.contacts.location);

    // iterates through school locations and appends each location to
    // the locations array
    for (var school in education.schools) {
      locations.push(education.schools[school].location);
    }

    // iterates through work locations and appends each location to
    // the locations array
    for (var job in work.jobs) {
      locations.push(work.jobs[job].location);
    }

    return locations;
  }

  /*
  createMapMarker(placeData) reads Google Places search results to create map pins.
  placeData is the object returned from search results containing information
  about a single location.
  */
  function createMapMarker(placeData) {

    // The next lines save location data from the search result object to local variables
    var lat = placeData.geometry.location.lat();  // latitude from the place service
    var lon = placeData.geometry.location.lng();  // longitude from the place service
    var name = placeData.formatted_address;   // name of the place from the place service
    var bounds = window.mapBounds;            // current boundaries of the map window

    // marker is an object with additional data about the pin for a single location
    var marker = new google.maps.Marker({
      map: map,
      position: placeData.geometry.location,
      title: name
    });

    // infoWindows are the little helper windows that open when you click
    // or hover over a pin on a map. They usually contain more information
    // about a location.
    var infoWindow = new google.maps.InfoWindow({
      content: name
    });

    // hmmmm, I wonder what this is about...
    google.maps.event.addListener(marker, 'click', function() {
      // close open infoWindow
      if (openInfoWindow) { openInfoWindow.close(); }

      // bind clicked marker infoWindow to global variable
      openInfoWindow = infoWindow;

      // add infoWindow
      infoWindow.open(map, marker);
    });

    // this is where the pin actually gets added to the map.
    // bounds.extend() takes in a map location object
    bounds.extend(new google.maps.LatLng(lat, lon));
    // fit the map to the new marker
    map.fitBounds(bounds);
    // center the map
    map.setCenter(bounds.getCenter());
  }

  /*
  callback(results, status) makes sure the search returned results for a location.
  If so, it creates a new map marker for that location.
  */
  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMapMarker(results[0]);
    }
  }

  /*
  pinPoster(locations) takes in the array of locations created by locationFinder()
  and fires off Google place searches for each location
  */
  function pinPoster(locations) {

    // creates a Google place search service object. PlacesService does the work of
    // actually searching for location data.
    var service = new google.maps.places.PlacesService(map);

    // Iterates through the array of locations, creates a search object for each location
    for (var place in locations) {

      // the search request object
      var request = {
        query: locations[place]
      };

      // Actually searches the Google Maps API for location data and runs the callback
      // function with the search results after each search.
      service.textSearch(request, callback);
    }
  }

  // Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();

  // locations is an array of location strings returned from locationFinder()
  locations = locationFinder();

  // pinPoster(locations) creates pins on the map for each location in
  // the locations array
  pinPoster(locations);

}

  /*
  Uncomment the code below when you're ready to implement a Google Map!
  */

  // Calls the initializeMap() function when the page loads
  //window.addEventListener('load', initializeMap);

  // Vanilla JS way to listen for resizing of the window
  // and adjust map bounds
  //window.addEventListener('resize', function(e) {
   // Make sure the map bounds get updated on page resize
  // map.fitBounds(mapBounds);
//});