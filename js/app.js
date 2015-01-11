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
  this.address = data.formatted_address;
  this.type = data.types[0];
  this.rating = "5.5";
  this.url = "www.joelcolucci.com";
  this.price = "EXPENSIVE";
  this.phone = "(203) 592-3484";
  this.twitter = "@JColuch";
  this.imgUrl = "http://www.northernlakesailboats.com/NewFiles/racing.jpg";
}




/* --------------------------- *\
  #VIEWMODEL
\* --------------------------- */

var ViewModel = function() {
  // Data
  var self = this;

  var markers = [];
  
  var mapContainer = document.getElementById("map-canvas");
  var $searchInput = $(".search-input")[0]; // autocomplete via Places library
  var $infoPane = $(".info-bar");
 
  var map;
  var openInfoWindow;

  var mapBounds;

  self.searchTerm = ko.observable();
  self.sideBarTitle = ko.observable();
  self.placeList = ko.observableArray([]);

  self.chosenPlaceId = ko.observable();

  // This is the data we set and use to populate info pane
  // Our observable arry contains all data we want
  // How does the click pass the the UID to the function gotToPlace
  self.chosenPlaceData = ko.observable();

  // Behaviours    
  self.goToPlace = function(place) { 
    $infoPane.addClass("info-bar-active");
    
    self.chosenPlaceData(place);
    //self.chosenFolderId(place);
  
  };

  self.closeInfoBar = function() {
    $infoPane.removeClass("info-bar-active");
  }

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

    map = new google.maps.Map(mapContainer, mapOptions);

    mapBounds = new google.maps.LatLngBounds();

    var options = {
      bounds: mapBounds,
      types: ['establishment']
    };

    autocomplete = new google.maps.places.Autocomplete($searchInput, options);

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

    self.getFoursquareData(searchTerm);
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

      //loadSideBar(results);
    }
    else {
      console.log("ERROR");
    }
  }

  function loadSideBar(data) {
    // Empty side bar
    self.placeList.removeAll();

    self.placeList(data);
  }



  self.getFoursquareData = function(query) {
    var CLIENT_ID = "S5NWL3EHTULCWQBMZPATQXYRSJJY1ZIDZQVEDE5RQA2XU3L2";
    var CLIENT_SECRET = "SHMKP1QG43ZKS55DPJO3P3PA5XAUYKZWKANFTT4A54FHVLQV";

    var query = encodeURIComponent(query);

    var requestUrl = "https://api.foursquare.com/v2/venues/explore";
    requestUrl += "?client_id=" + CLIENT_ID;
    requestUrl += "&client_secret=" + CLIENT_SECRET;
    requestUrl += "&v=20130815"; // version
    requestUrl += "&ll=41.31,-72.924"; // latitude, longitude
    requestUrl += "&query=" + query;


    $.ajax({
      url: requestUrl,
      dataType: "jsonp",
      method: "GET",
      success: self.foursquareCallback
    })
  }


  self.foursquareCallback = function(response) {
    var statusCode = response.meta.code;
    if (statusCode !== 200) {
      console.log("FOURSQUARE ERROR");
      return;
    }

    var results = response.response.groups[0].items;
    var data = self.parseFoursquareData(results);

    loadSideBar(data);
  }


  self.parseFoursquareData = function(results) {
    var foursquareData = [];
    var place;

    for (var i = 0, len = results.length; i < len; i++) {
      var venue = results[i].venue;
      var tips = results[i].tips ? results[i].tips[0] : "";

      place = {
        name: venue.name,
        type: venue.categories[0].name,
        address: getFullAddress(venue.location) || "Not available",
        phone: venue.contact.formattedPhone || "Not available",
        twitter: venue.contact.twitter || "Not available",
        rating: venue.rating || "Not available",
        url: venue.url || "Not available",
        imgUrl: tips.photourl || ""
      }
      
      foursquareData.push(place);
    }

    return foursquareData;
  }

  function getFullAddress(location) {
    var fullAddress = "";

    fullAddress += location.address ? location.address : "";
    fullAddress += location.city ? ", " + location.city : "";
    fullAddress += location.state ? ", " + location.state : "";
    fullAddress += location.postalCode ? location.postalCode : "";

    return fullAddress;
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

// console.log(moreButton);
// var moreButton = document.getElementsByClassName("place-link");
// listings.addEventListener('click', function() {

//   info.classList.add("info-bar-active");
// });

// infoClose.addEventListener('click', function() {

//   info.classList.remove("info-bar-active");
// });





function success(data) {
  console.log("SUCCESS");
  console.log(data);
}














