var iterator = 0;
var markers = [];

// var markersVraag1
//var markersVraag2
var map;

//------------ MARKERS ------------

var foodAndDrinks = "https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=glyphish_fork-and-knife|FFD801";
var barsAndCafes = "https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=glyphish_wineglass|E60000";
var clubs = "https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=glyphish_moon|CCCCB2";
var shops = "https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=glyphish_shopping-cart|4565C5";
var museum = "https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=glyphish_camera|00CC00";

var hotzone = "https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.6|0|FFFF00|11|b|VRAAG+2";

//---------------------------------


var locations = [
    ['<h4>Barnini</h4>', 51.21491515579124, 4.409103691577911, barsAndCafes],
    ['<h4>Tropicos Foods</h4>', 51.2166259, 4.413610100000028, foodAndDrinks],
    ['<h4>Stadsfeestzaal</h4>', 51.2180487, 4.411330599999928, shops],
    ['<h4>Bourla</h4>', 51.215989, 4.408375299999989, museum],
    ['<h4>Forever 21</h4>', 51.2181606, 4.407542899999953, shops],
    ['<h4>AP CLUB</h4>', 51.2161349, 4.410647400000016, clubs],

    ['<h4>VRAAG 2</h4>', 51.21639953394351, 4.405704662203789, hotzone]
];

var coordinates = [
    new google.maps.LatLng(locations[0][1], locations[0][2]),
    new google.maps.LatLng(locations[1][1], locations[1][2]),
    new google.maps.LatLng(locations[2][1], locations[2][2]),
    new google.maps.LatLng(locations[3][1], locations[3][2]),
    new google.maps.LatLng(locations[4][1], locations[4][2]),
    new google.maps.LatLng(locations[5][1], locations[5][2]),

    new google.maps.LatLng(locations[6][1], locations[6][2])
];


function drop() {
    for (var i = 0; i < coordinates.length; i++) {
        setTimeout(function() {
            addMarker();
        }, i * 400);
    }

}


function addMarker() {
    var marker = new google.maps.Marker({
        position: coordinates[iterator],
        icon: locations[iterator][3],
        map: map,
        draggable: false,
        animation: google.maps.Animation.DROP
    });

    markers.push(marker);


    var infowindow = new google.maps.InfoWindow({
        content: locations[iterator][0]
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
    });
    iterator++;
}


function initialize() {
    var mapOptions = {
        zoom: 16,
        center: new google.maps.LatLng(51.2161349, 4.410647400000016),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);

}





//------------------------------------------------------------------------------------

/*function getLocation() {
 if (navigator.geolocation) {
 navigator.geolocation.getCurrentPosition(showPosition, showError);
 } else {
 x.innerHTML = "Geolocation is not supported by this browser.";
 }
 }

 function showPosition(position) {
 lat = position.coords.latitude;
 lon = position.coords.longitude;
 latlon = new google.maps.LatLng(lat, lon)

 var marker = new google.maps.Marker({position:latlon,map:map,title:"You are here!",icon:"../www/img/gps.png"});
 }

 function showError(error) {
 switch(error.code) {
 case error.PERMISSION_DENIED:
 x.innerHTML = "User denied the request for Geolocation."
 break;
 case error.POSITION_UNAVAILABLE:
 x.innerHTML = "Location information is unavailable."
 break;
 case error.TIMEOUT:
 x.innerHTML = "The request to get user location timed out."
 break;
 case error.UNKNOWN_ERROR:
 x.innerHTML = "An unknown error occurred."
 break;
 }
 }*/


//--------------------------------------------------------------------------------------------


var markerPos = null;

function autoUpdate() {
    navigator.geolocation.getCurrentPosition(function(position) {
        var newPoint = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude);

        if (markerPos) {
            // Marker already created - Move it
            markerPos.setPosition(newPoint);
        }
        else {
            // Marker does not exist - Create it
            markerPos = new google.maps.Marker({
                position: newPoint,
                map: map,
                icon:"../www/img/gps.png"
            });
        }

// Center the map on the new position
        /*map.setCenter(newPoint);*/
    });

// Call the autoUpdate() function every 5 seconds
    setTimeout(autoUpdate, 5000);
}

//----------------------------------------------------------------------



google.maps.event.addDomListener(window, 'load', initialize);



var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

 app.initialize();
