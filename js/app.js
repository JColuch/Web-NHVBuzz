/* --------------------------- *\
  #VIEWMODEL
\* --------------------------- */

var ViewModel = function() {
  var self = this;

  // Cached DOM elm mapContainer needed to append Google Maps
  var mapContainer = document.getElementById("map-canvas");

  // Cached DOM elm searchInput for Google autocomplete feature
  var searchInput = document.getElementsByClassName("input-search")[0];

  // Variables scoped to ViewModel
  var map;
  var markers = [];
  var infoWindow = new google.maps.InfoWindow();
  var currentLocation = { lat: 41.3100, lng: -72.924 }; // New Haven, CT




  // Observables
  self.searchTerm = ko.observable();
  self.sidebarTitle = ko.observable();
  self.selectedVenueData = ko.observable();

  self.isSidebarActive = ko.observable(true);
  self.isDropPanelActive = ko.observable(false);
  self.isAjaxError = ko.observable(false);

  self.venueList = ko.observableArray([]);



  //--------------------------------------- List UI Features ----*

  /**
   * Toggle side bar
   */ 
  self.toggleSidebar = function() {
    var isShowing = self.isSidebarActive();

    // Toggle sidebar
    if (isShowing) {
      self.isSidebarActive(false);
    } else {
      self.isSidebarActive(true);
    }

    // Ensure drop panel is closed
    self.isDropPanelActive(false);
  };

  /**
   * Show drop panel w/ venue data
   */
  self.showDropPanel = function(venue) { 
    self.isDropPanelActive(true);
    self.selectedVenueData(venue);
  };

  /**
   * Hide drop panel
   */
  self.hideDropPanel = function() {
    self.isDropPanelActive(false);
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



  //--------------------------------------- AJAX call feature ----*
  /**
   * Get places based on search term from Foursquare API
   */
  self.getVenues =function() {
    // Get search term from input
    var searchTerm = self.searchTerm();

    // If no search term present default search to restaurants
    if (!searchTerm) {
      searchTerm = "Restaurants";
    }

    // Clear input box
    self.searchTerm("");

    // Remove map markers
    deleteMarkers();

    // Close map info window
    infoWindow.close();

    // Update sidebar title
    var title = capitalizeFirstLetter(searchTerm);
    self.sidebarTitle(title);

    // Get venue data via AJAX call to Foursquare API
    getFoursquareData(searchTerm);
  };

  
  //--------------------------------------- AJAX HELPERS  ----*
  /**
   * Get places based on search term from Foursquare API
   */
  function getFoursquareData(query) {
    var CLIENT_ID = "S5NWL3EHTULCWQBMZPATQXYRSJJY1ZIDZQVEDE5RQA2XU3L2";
    var CLIENT_SECRET = "SHMKP1QG43ZKS55DPJO3P3PA5XAUYKZWKANFTT4A54FHVLQV";

    var query = encodeURIComponent(query);
    var location = parseCurrentLocation();

    var requestUrl = "https://api.foursquare.com/v2/venues/explore";
    requestUrl += "?client_id=" + CLIENT_ID;
    requestUrl += "&client_secret=" + CLIENT_SECRET;
    requestUrl += "&v=20130815"; // version - missing "v" on purpose to trigger error
    requestUrl += "&ll=" + location; // lat, lng
    requestUrl += "&query=" + query;
    requestUrl += "&limit=15";

    $.ajax({
      url: requestUrl,
      dataType: "jsonp",
      method: "GET",
      success: foursquareCallback
    });
  };

  /**
   * Handle Foursquare API response
   */
  function foursquareCallback(response) {
    var statusCode = response.meta.code;
    if (statusCode !== 200) {
      console.log("FOURSQUARE ERROR");
      self.isAjaxError(true);
      return;
    }

    var results = response.response.groups[0].items;
    var data = parseFoursquareData(results);
    loadSideBar(data);
  };

  /**
   * Parse Foursquare API response data
   */
  function parseFoursquareData(results) {
    var foursquareData = [];
    var venue;

    for (var i = 0, len = results.length; i < len; i++) {
      // Generate new FoursquareVenue object
      var data = results[i].venue;
      venue = new FoursquareVenue(data);

      // Create Google Map marker for venue
      createMarker(venue);

      // Add to foursquareData array
      foursquareData.push(venue);
    }

    return foursquareData;
  };

  /**
   * Get places based on search term from Foursquare API
   */
  function loadSideBar(data) {
    // Empty side bar
    self.venueList.removeAll();

    // Load list data
    self.venueList(data);
  }

  /**
   * Format location coordinates for Foursqyare API
   */
  function parseCurrentLocation() {
    var lng = currentLocation.lng;
    var lat = currentLocation.lat;

    return lat + ',' + lng;
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }


  //--------------------------------------- GOOGLE MAP API HELPERS ----*  
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
    self.getVenues();
  });
};

ko.applyBindings(new ViewModel());





/* --------------------------- *\
  #FoursqaureVenue Object
\* --------------------------- */

/**
 * @constructor
 */
function FoursquareVenue(data) {
  this.name = data.name;

  this.type = data.categories[0].name;

  this.address = this.getFullAddress(data.location) || "Not available";
  
  this.phone = data.contact.formattedPhone || "Not available";
  
  this.twitter = data.contact.twitter || "Not available";
  
  this.rating = data.rating || "Not available";
  
  this.websiteName = data.url || "Not available";
  
  this.url = data.url || "#";
  
  this.position = this.getPositionCoords(data.location);

}

/**
 * Get position coords from location object
 */
FoursquareVenue.prototype.getPositionCoords = function(location) {
  return {
    lat: location.lat,
    lng: location.lng
  };
};

/**
 * Assemble full address from Foursquare location object
 */
FoursquareVenue.prototype.getFullAddress = function(location) {
  var fullAddress = "";

  fullAddress += location.address ? location.address : "";
  fullAddress += location.city ? ", " + location.city : "";
  fullAddress += location.state ? ", " + location.state : "";

  // Maybe do an indexOf to remove any leading or trailing ","'s?
  return fullAddress;
};
