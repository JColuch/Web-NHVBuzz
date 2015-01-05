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
  var self = this;

  this.placeMarkerList = ko.observableArray([]);

  // // Load placeMarkers
  modelFavorites.forEach(function(place) {
    self.placeMarkerList.push(new Placemarker(place));
  })

// Declare global map and infopane variables
  var map,
      openInfoWindow;

  // Create map and append to index.html
  // Source: SOURCE: https://github.com/udacity/
  // frontend-nanodegree-resume/blob/master/js/helper.js
  this.initializeMap = function() {

    var newHaven = { lat: 41.3100, lng: -72.924 };

    var mapOptions = {
      center: newHaven,
      zoom: 13,
      panControl: false,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      overviewMapControl: false
    };

    map = new google.maps.Map(document.getElementById("map-canvas"),
                              mapOptions);
    console.log("Ran map");
  }

  // On load initalize map
  google.maps.event.addDomListener(window, "load", this.initializeMap);

  
  // add placemarkers
    // pass data from api calls

  // update the list

  // AJAX Calls
    // get data
    // pass to correct callback to manipulate view

};

ko.applyBindings(new ViewModel());




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



/*
createMapMarker(placeData) reads Google Places search results to create map pins.
placeData is the object returned from search results containing information
about a single location.
*/
function createMapMarker(placeData) {

  // The next lines save location data from the search result object to local variables
  var lat = placeData.geometry.location.lat();  // latitude from the place service
  var lon = placeData.geometry.location.lng();  // longitude from the place service
  var address = placeData.formatted_address;   // name of the place from the place service
  //var bounds = window.mapBounds;            // current boundaries of the map window
  var name = placeData.name;

  // marker is an object with additional data about the pin for a single location
  var marker = new google.maps.Marker({
    map: map,
    position: placeData.geometry.location,
    title: name
  });

  // infoWindows are the little helper windows that open when you click
  // or hover over a pin on a map. They usually contain more information
  // about a location.
  var contentString = "";
  contentString += "<h4>" + name + "</h4>";
  contentString += "<h5>" + address + "</h5>";

  var infoWindow = new google.maps.InfoWindow({
    content: contentString
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

  //marker.setMap(map);
  // this is where the pin actually gets added to the map.
  // bounds.extend() takes in a map location object
  //bounds.extend(new google.maps.LatLng(lat, lon));
  // fit the map to the new marker
  //map.fitBounds(bounds);
  // center the map
  //map.setCenter(bounds.getCenter());
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


// SOURCE: SOURCE: https://github.com/udacity/frontend-nanodegree-resume/
//    blob/master/js/helper.js
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