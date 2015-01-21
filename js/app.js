/* --------------------------- *\
  #VIEWMODEL
\* --------------------------- */

var ViewModel = function() {
  var self = this;

  // Cache DOM elms
  var mapContainer = document.getElementById("map-canvas");
  var searchInput = document.getElementsByClassName("input-search")[0];

  // Variables scoped to ViewModel
  var map;
  
  var markers = [];
  var infoWindow = new google.maps.InfoWindow();

  var currentLocation = { lat: 41.3100, lng: -72.924 }; // New Haven, CT

  // Observables
  self.searchTerm = ko.observable();
  self.sideBarTitle = ko.observable();
  self.chosenPlaceData = ko.observable();

  self.isSidebarShowing = ko.observable(true);
  self.isInfoBarShowing = ko.observable(false);

  self.placeList = ko.observableArray([]);

  /**
   * Toggle side bar
   */ 
  self.toggleSidebar = function() {
    var isShowing = self.isSidebarShowing();

    // Toggle sidebar
    if (isShowing) {
      self.isSidebarShowing(false);
    } else {
      self.isSidebarShowing(true);
    }

    // Ensure info bar is closed
    self.isInfoBarShowing(false);
  };

  /**
   * Show info bar w/ place data
   */
  self.goToPlace = function(place) { 
    self.isInfoBarShowing(true);
    self.chosenPlaceData(place);
  };

  /**
   * Hide info bar
   */
  self.closeInfoBar = function() {
    self.isInfoBarShowing(false);
  };

  /**
   * Update infoWindows properties and show
   */
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

  /**
   * Get places based on search term from Foursquare API
   */
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

  /**
   * Get places based on search term from Foursquare API
   */
  self.getFoursquareData = function(query) {
    var CLIENT_ID = "S5NWL3EHTULCWQBMZPATQXYRSJJY1ZIDZQVEDE5RQA2XU3L2";
    var CLIENT_SECRET = "SHMKP1QG43ZKS55DPJO3P3PA5XAUYKZWKANFTT4A54FHVLQV";

    var query = encodeURIComponent(query);
    var location = parseCurrentLocation();

    var requestUrl = "https://api.foursquare.com/v2/venues/explore";
    requestUrl += "?client_id=" + CLIENT_ID;
    requestUrl += "&client_secret=" + CLIENT_SECRET;
    requestUrl += "&v=20130815"; // version
    requestUrl += "&intent=global";
    requestUrl += "&ll=" + location; // lat, lng
    
    requestUrl += "&query=" + query;
    requestUrl += "&limit=15";

    $.ajax({
      url: requestUrl,
      dataType: "jsonp",
      method: "GET",
      success: self.foursquareCallback
    });
  };

  /**
   * Handle Foursquare API response
   */
  self.foursquareCallback = function(response) {
    var statusCode = response.meta.code;
    if (statusCode !== 200) {
      console.log("FOURSQUARE ERROR");
      return;
    }

    var results = response.response.groups[0].items;
    var data = self.parseFoursquareData(results);
    loadSideBar(data);
  };

  /**
   * Parse Foursquare API response data
   */
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
  };

  //** HELPER FUNCTIONS **//
  /**
   * Get places based on search term from Foursquare API
   */
  function loadSideBar(data) {
    // Empty side bar
    self.placeList.removeAll();

    // Load list data
    self.placeList(data);
  }

  /**
   * Format location coordinates for Foursqyare API
   */
  function parseCurrentLocation() {
    var lng = currentLocation.lng;
    var lat = currentLocation.lat;

    return lat + ',' + lng;
  }

  /**
   * Get position coords from location object
   */
  function getPositionCoords(location) {
    return {
      lat: location.lat,
      lng: location.lng
    };
  }

  /**
   * Assemble full address from Foursquare location object
   */
  function getFullAddress(location) {
    var fullAddress = "";

    fullAddress += location.address ? location.address : "";
    fullAddress += location.city ? ", " + location.city : "";
    fullAddress += location.state ? ", " + location.state : "";

    // Maybe do an indexOf to remove any leading or trailing ","'s?
    return fullAddress;
  }

  /**
   * Initial Google Map
   */
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

    // Source: https://developers.google.com/maps/documentation
    // /javascriptplaces-autocomplete
    var geolocation = new google.maps.LatLng(
          currentLocation.lat, currentLocation.lng);

    var circle = new google.maps.Circle({
      center: geolocation,
      radius: 1000
    });
    
    var mapBounds = circle.getBounds();

    var options = {
      bounds: mapBounds,
      types: ['establishment']
    };

    autocomplete = new google.maps.places.Autocomplete(searchInput, options);
  }

  /**
   * Create Google Map Marker
   */
  function createMarker(data) {
    var name = data.name;
    var position = data.position;
   
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
  /**
   * Sets the map on all markers in the array.
   */
  function setAllMap(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }

  /**
   * Removes the markers from the map, but keeps them in the array.
   */
  function clearMarkers() {
    setAllMap(null);
  }

  /**
   * Deletes all markers in the array by removing references to them.
   */
  function deleteMarkers() {
    clearMarkers();
    markers = [];
  }

  /**
   * On load initialize map and fetch default locations
   */
  google.maps.event.addDomListener(window, "load", function() {
    // Add map
    initializeMap();

    // Fetch default places
    self.getPlaces();
  });
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
