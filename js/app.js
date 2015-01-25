/* --------------------------- *\
  #CONSTANTS
\* --------------------------- */

// Source: http://php.quicoto.com/get-device-width-javascript/
var WIDTH = (window.innerWidth > 0) ? window.innerWidth : screen.width;

var LONGITUDE_OFFSET = .01;



/* --------------------------- *\
  #FoursquareVenue Object
\* --------------------------- */

/**
 * Class making an object representing a Foursquare venue
 * @param {object} data Venue details parsed from Foursquare API response
 * @constructor
 */
function FoursquareVenue(data) {
  /**
   * Name of venue
   * @type {string}
   */
  this.name = data.name;

  /**
   * Type of venue (Bar, Cafe, Hotel, etc)
   * @type {string}
   */
  this.type = data.categories[0].name;

  /**
   * Full postal address of venue
   * @type {string}
   */
  this.address = this.getFullAddress(data.location) || "Not available";
  
  /**
   * Formatted phone number of venue ex. (xxx) xxx-xxxx
   * @type {string}
   */
  this.phone = data.contact.formattedPhone || "Not available";
  
  /**
   * Phone # formatted for use as href attribute of anchor tag
   * @type {string}
   */
  this.phoneLink = this.getPhoneLink(data.contact);
  
  /**
   * Rating value with suffix ex. 6 / 10
   * @type {string}
   */
  this.rating = this.getFormattedRating(data.rating);
  
  /**
   * Venue website URL address
   * @type {string}
   */
  this.website = data.url || "Not available";
  
  /**
   * Venue website URL address used in anchor href attribute
   * Differs from website in that fallback is # to avoid breaking anchor tag
   * @type {string}
   */
  this.url = data.url || "#";
  
  /**
   * Image src URL for static Google Map of venue location
   * @type {string}
   */
  this.mapUrl = this.getMapUrl(data.location);

  /**
   * Object literal represeting lat, lng of venue location
   * @type {object}
   */
  this.position = this.getPositionCoords(data.location);
}

/**
 * Get position coords from location object
 * @param {object} location Object containg location data from parsed
 *     Foursquare API response
 * @return {object} Object literal with lat, lng as properties
 */
FoursquareVenue.prototype.getPositionCoords = function(location) {
  return {
    lat: location.lat,
    lng: location.lng
  };
};

/**
 * Assemble full address from Foursquare location object
 * @param {object} location Object containg location data from parsed
 *     Foursquare API response
 * @return {string} Full postal address of venue
 */
FoursquareVenue.prototype.getFullAddress = function(location) {
  var fullAddress = "";

  fullAddress += location.address ? location.address : "";
  fullAddress += location.city ? ", " + location.city : "";
  fullAddress += location.state ? ", " + location.state : "";

  // TODO: Maybe do an indexOf to remove any leading or trailing ","'s?
  return fullAddress;
};

/**
 * Assemble formatted string representing venue rating
 * @param {int} rating Number representing ranking score of venue
 * @return {string} Formatted string representing venue rank
 */
FoursquareVenue.prototype.getFormattedRating = function(rating) {
  if (!rating) {
    return "Not available";
  }
  return rating + " / 10";
}

/**
 * Assembles Google Maps static map URL for venue location 
 * @param {object} location Object containg location data from parsed
 *     Foursquare API response
 * @return {boolean} Whether something occurred.
 */
FoursquareVenue.prototype.getMapUrl = function (location) {
  var lat = location.lat;
  var lng = location.lng;
  var coords = lat + "," + lng;

  var mapUrl = "https://maps.googleapis.com/maps/api/staticmap";
  mapUrl += "?zoom=17&size=310x300";
  mapUrl += "&maptype=roadmap";
  mapUrl += "&markers=color:red%7Clabel:%7C" + coords;

  return mapUrl;
}

/**
 * Formats phone # for use as href attribute of anchor tag
 * @param {object} data Object containg data from parsed
 *     Foursquare API response
 * @return {boolean} Whether something occurred.
 */
FoursquareVenue.prototype.getPhoneLink = function(data) {
  return "tel:" + data.phone;
}



//Source: http://jstricks.com/detect-mobile-devices-javascript-jquery/
/**
 * Operates on an instance of MyClass and returns something.
 * @param {project.MyClass} obj Instance of MyClass which leads to a long
 *     comment that needs to be wrapped to two lines.
 * @return {boolean} Whether something occurred.
 */
var isMobile = {
    Android: function() {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
      return (isMobile.Android() ||
        isMobile.BlackBerry() ||
        isMobile.iOS() ||
        isMobile.Opera() ||
        isMobile.Windows());
    }
};






/* --------------------------- *\
  #VIEWMODEL
\* --------------------------- */

/**
 * Get position coords from location object
 * @param {string} foo This is a param with a description too long to fit in
 *     one line.
 * @return {number} This returns something that has a description too long to
 *     fit in one line.
 */
var ViewModel = function() {
  var self = this;

  // Cached DOM elm mapContainer needed to append Google Maps
  var mapContainer = document.getElementById("map-canvas");

  // Variables scoped to ViewModel
  var map;
  var markers = [];
  var infoWindow = new google.maps.InfoWindow();
  var currentLocation = { lat: 41.3100, lng: -72.924 }; // New Haven, CT




  // Observables
  self.searchTerm = ko.observable();
  self.sidebarTitle = ko.observable();
  self.selectedVenueData = ko.observable();
  self.errorMessage = ko.observable();
  self.venueList = ko.observableArray([]);
  
  // UI flag observables
  self.isSidebarActive = ko.observable(true);
  self.isDropPanelActive = ko.observable(false);
  self.isError = ko.observable(false);



  //--------------------------------------- List UI Features ----*

  /**
   * Toggle side bar
   */ 
  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
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
  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
   */
  self.showDropPanel = function(venue) { 
    self.isDropPanelActive(true);
    self.selectedVenueData(venue);
  };

  /**
   * Hide drop panel
   */
  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
   */
  self.hideDropPanel = function() {
    self.isDropPanelActive(false);
  };

  /**
   * Update infoWindows properties and show
   */
  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
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

    // If on mobile close the sidebar to reveal map
    if(isMobile.any() && WIDTH < 480) {
      self.isSidebarActive(false);
      self.isDropPanelActive(false);
    }

    // Center map on marker
    var coords = cloneCoords(data.position);
    if (self.isSidebarActive()) {
      // Offset center if sidebar is open
      coords.lng -= LONGITUDE_OFFSET;
    }

    map.panTo(coords);
  };



  //--------------------------------------- AJAX call feature ----*
  /**
   * Get places based on search term from Foursquare API
   */
  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
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
    var title = "Results for: " + capitalizeFirstLetter(searchTerm);
    self.sidebarTitle(title);

    // Get venue data via AJAX call to Foursquare API
    getFoursquareData(searchTerm);
  };

  
  //--------------------------------------- AJAX HELPERS  ----*
  /**
   * Get places based on search term from Foursquare API
   */
  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
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
  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
   */
  function foursquareCallback(response) {
    // Check for valid response
    var statusCode = response.meta.code;

    // Handle invalid response
    if (statusCode !== 200) {
      // Display error on view
      self.isError(true);

      // Show appropriate message
      var msg = "Please try again later or contact the imaginary support team";
      self.errorMessage(msg);

      return;
    }

    // Reset error flag
    self.isError(false);
    
    // Load response date to page
    var results = response.response.groups[0].items;
    var data = parseFoursquareData(results);
    loadSideBar(data);
  };

  /**
   * Parse Foursquare API response data
   */
  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
   */
  function parseFoursquareData(results) {
    // Handle case where no results found
    var len = results.length;
    if (!len) {
      self.isError(true);
      self.errorMessage("No results found, try again!");
      return [];
    }

    var foursquareData = [];
    var venue;

    for (var i = 0; i < len; i++) {
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

  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
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
  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
   */
  function parseCurrentLocation() {
    var lng = currentLocation.lng;
    var lat = currentLocation.lat;

    return lat + ',' + lng;
  }

  function capitalizeFirstLetter(string) {
    return string; //string.charAt(0).toUpperCase() + string.slice(1);
  }

  function cloneCoords(position) {
    return { lat: position.lat, lng: position.lng };
  }

  //--------------------------------------- GOOGLE MAP API HELPERS ----*  
  /**
   * Initial Google Map
   */
  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
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
  }

  /**
   * Create Google Map Marker
   */
  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
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

  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
   */
  function setAllMap(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }

  /**
   * Removes the markers from the map, but keeps them in the array.
   */
  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
   */
  function clearMarkers() {
    setAllMap(null);
  }

  /**
   * Deletes all markers in the array by removing references to them.
   */
  /**
   * Get position coords from location object
   * @param {string} foo This is a param with a description too long to fit in
   *     one line.
   * @return {number} This returns something that has a description too long to
   *     fit in one line.
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





