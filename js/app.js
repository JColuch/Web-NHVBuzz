/* --------------------------- *\
  #VIEWMODEL
\* --------------------------- */

var ViewModel = function() {
  var self = this;

  // Cache DOM elms
  var $searchInput = $(".search-input")[0]; // autocomplete via Places library
  var mapContainer = document.getElementById("map-canvas");

  // Cache DOM elms needed for CSS animations
  var $sidebarBtn = $(".menu-toggle");
  var $sidebar = $(".side-bar");
  var $sidebarHeader = $(".side-bar-header");
  var $infoPane = $(".info-bar");
  

  
  var map;
  var mapBounds;
  var infoWindow;
  
  var markers = [];

  // Default to New Haven, CT
  var currentLocation = { lat: 41.3100, lng: -72.924 };

  self.searchTerm = ko.observable();
  self.sideBarTitle = ko.observable();
  self.chosenPlaceData = ko.observable();
  self.placeList = ko.observableArray([]);

  self.sideBarTitle("Places");

  // Behaviors    
  self.goToPlace = function(place) { 
    $infoPane.addClass("info-bar-active");
    
    self.chosenPlaceData(place);
  };

  self.toggleSidebar = function() {
    $sidebarBtn.toggleClass("toggle");
    $sidebarHeader.toggleClass("sbh-active");
    $sidebar.toggleClass("side-bar-active");
    $infoPane.removeClass("info-bar-active");
  };

  self.closeInfoBar = function() {
    $infoPane.removeClass("info-bar-active");
  };

  self.setInfoWindow = function(data) {
    var content = "";
    content += '<h4 class="iw-title"><a href="' + data.url + '">';
    content += data.name + "</a></h4>";
    content += '<p class="iw-address">' + data.address + '</p>';
    content += '<p class="iw-para"><i class="fa fa-phone iw-icon"></i>';
    content += data.phone + '</li>';
    content += '<p class="iw-para"><i class="fa fa-tag iw-icon"></i>';
    content += data.type + '</li>';

    infoWindow.setPosition(data.position);
    infoWindow.setContent(content);
    infoWindow.open(map);

    map.panTo(data.position);
  };

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
  };



  // Operations
  function loadSideBar(data) {
    // Empty side bar
    self.placeList.removeAll();

    self.placeList(data);
  }


  self.getFoursquareData = function(query) {
    var CLIENT_ID = "S5NWL3EHTULCWQBMZPATQXYRSJJY1ZIDZQVEDE5RQA2XU3L2";
    var CLIENT_SECRET = "SHMKP1QG43ZKS55DPJO3P3PA5XAUYKZWKANFTT4A54FHVLQV";

    var query = encodeURIComponent(query);
    console.log(query);
    var location = parseCurrentLocation();
    console.log(location);

    var requestUrl = "https://api.foursquare.com/v2/venues/explore";
    requestUrl += "?client_id=" + CLIENT_ID;
    requestUrl += "&client_secret=" + CLIENT_SECRET;
    requestUrl += "&v=20130815"; // version
    requestUrl += "&ll=" + location; // lat, lng
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

    // Pan to location of first response item
    var coords = data[0].position;
    setCurrentLocation(coords);
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
      };


      createMarker(place);

      foursquareData.push(place);
    }

    return foursquareData;
  }

  //** HELPER FUNCTIONS **//

  /**
   *  
   */
  function setCurrentLocation(coords) {
    currentLocation = coords;

    map.panTo(coords);
  }

  function parseCurrentLocation() {
    var lng = currentLocation.lng;
    var lat = currentLocation.lat;

    return lat + ',' + lng;
  }

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

    return fullAddress;
  }


  function initializeMap() {
    // Set map options
    var mapOptions = {
      center: currentLocation,
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
  }

  function createMarker(data) {
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

};

ko.applyBindings(new ViewModel());




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
