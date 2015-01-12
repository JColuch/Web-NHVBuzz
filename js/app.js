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
  #VIEWMODEL
\* --------------------------- */

var ViewModel = function() {
  // Data
  var self = this;

  var $searchInput = $(".search-input")[0]; // autocomplete via Places library
  var $infoPane = $(".info-bar");
  
  var mapContainer = document.getElementById("map-canvas");
  
  var map;
  var mapBounds;
  var infoWindow;
  
  var markers = [];

  self.searchTerm = ko.observable();
  self.sideBarTitle = ko.observable();
  self.placeList = ko.observableArray([]);
  self.chosenPlaceData = ko.observable();

  self.sideBarTitle("Places");


  // Behaviors    
  self.goToPlace = function(place) { 
    $infoPane.addClass("info-bar-active");
    
    self.chosenPlaceData(place);
  };


  self.closeInfoBar = function() {
    $infoPane.removeClass("info-bar-active");
  }


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

    // Set ViewModel scoped variables
    map = new google.maps.Map(mapContainer, mapOptions);
    mapBounds = new google.maps.LatLngBounds();
    infoWindow = new google.maps.InfoWindow();

    var options = {
      bounds: mapBounds,
      types: ['establishment']
    };

    autocomplete = new google.maps.places.Autocomplete($searchInput, options);
  } // End function initializeMap()


  self.setInfoWindow = function(data) {
    var content = "";
    content += '<h4 class="iw-title"><a href="' + data.url + '">';
    content += data.name + "</a></h4>";
    content += '<p class="iw-address">' + data.address + '</p>';
    content += '<p class="iw-para"><i class="fa fa-phone iw-icon"></i>' + data.phone + '</li>';
    content += '<p class="iw-para"><i class="fa fa-tag iw-icon"></i>' + data.type + '</li>';

    infoWindow.setPosition(data.position);
    infoWindow.setContent(content);
    infoWindow.open(map);

    map.panTo(data.position);
  }


  self.createMarker = function(data) {
    var name = data.name;

    var position = data.position;

    var address = data.address;

    var rating = data.rating || "No rating available";

    // marker is an object with additional data about the pin
    // for a single location
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: name
      //animation: google.maps.Animation.DROP
    });

    google.maps.event.addListener(marker, 'click', function() {
      self.setInfoWindow(data);
    });

    // Keep track of markers
    markers.push(marker);
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

  // Deletes all markers in the array by removing references to them.
  function deleteMarkers() {
    clearMarkers();
    markers = [];
  }


  // On load initalize map
  google.maps.event.addDomListener(window, "load", initializeMap);


  self.getPlaces =function() {
    // Get search term from input
    var searchTerm = self.searchTerm();
    if (!searchTerm) {
      searchTerm = "Restaurants";
    }

    // Clear input box
    self.searchTerm("");
    deleteMarkers();
    infoWindow.close();

    // Update Side Bar Title
    var title = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
    self.sideBarTitle(title);

    self.getFoursquareData(searchTerm);
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
    requestUrl += "&ll=41.31,-72.924"; // lat, lng
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
        websiteName: venue.url || "Not available",
        url: venue.url || "#",
        imgUrl: tips.photourl || "",
        position: getPositionCoords(venue.location)
      }


      self.createMarker(place);

      foursquareData.push(place);
    }

    return foursquareData;
  }

  // HELPER FUNCTIONS

  function getPositionCoords(location) {
    return {
      lat: location.lat,
      lng: location.lng
    }
  }

  function getFullAddress(location) {
    var fullAddress = "";

    fullAddress += location.address ? location.address : "";
    fullAddress += location.city ? ", " + location.city : "";
    fullAddress += location.state ? ", " + location.state : "";
    fullAddress += location.postalCode ? location.postalCode : "";

    return fullAddress;
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








  // self.createMarker = function(placeData) {
  //   var name = placeData.name;
  //   // var lat = placeData.geometry.location.lat();  // latitude from the place service
  //   // var lon = placeData.geometry.location.lng();  // longitude from the place service
  //   var position = placeData.geometry.location;
  //   var bounds = mapBounds;
  //   var address = placeData.formatted_address;
  //   var rating = placeData.rating || "No rating available";
  //   // marker is an object with additional data about the pin
  //   // for a single location
  //   var marker = new google.maps.Marker({
  //     map: map,
  //     position: position,
  //     title: name
  //     //animation: google.maps.Animation.DROP
  //   });

  //   // Keep track of markers
  //   markers.push(marker);

  //   var content = '<div class="gm-title">' + name + "</h5>";
  //   content += '<div>' + rating + '</div>';
  //   content += '<div class="gm-addr">' + address + '</div>';
  //   content += '<div class="gm-website"><a href="#">ynhh.org</a></div>';
    
  //   // Attach infowidnow
  //   var infowindow = new google.maps.InfoWindow({
  //     content: content
  //   });

  //   google.maps.event.addListener(marker, 'click', function() {
  //     // Center map on marker clicked
  //     map.panTo(marker.getPosition());

  //     // Close current open window
  //     if (openInfoWindow) {
  //       openInfoWindow.close();
  //     }

  //     openInfoWindow = infowindow;
  //     openInfoWindow.open(map, marker);
  //   });

  // }


  // self.getPlaces =function() {
  //   // Get search term from input
  //   var searchTerm = self.searchTerm();
  //   if (!searchTerm) {
  //     searchTerm = "Restaurants";
  //   }

  //   // Clear input box
  //   self.searchTerm("");

  //   // Update Side Bar Title
  //   var title = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
  //   self.sideBarTitle(title);

  //   // var service = new google.maps.places.PlacesService(map);
    
  //   // var request = {
  //   //   location: { lat: 41.3100, lng: -72.924 },
  //   //   radius: '300',
  //   //   query: searchTerm
  //   // };

  //   // service.textSearch(request, self.callback);

  //   self.getFoursquareData(searchTerm);
  // }

  // // Source: https://developers.google.com/maps/documentation/javascript/
  // // places#TextSearchRequests
  // self.callback = function(results, status) {
  //   if (status == google.maps.places.PlacesServiceStatus.OK) {
  //     // Clear old markers
  //     deleteMarkers();

  //     for (var i = 0; i < results.length; i++) {
  //       self.createMarker(results[i]);
  //     }

  //     //loadSideBar(results);
  //   }
  //   else {
  //     console.log("ERROR");
  //   }
  // }



