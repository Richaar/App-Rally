//local storage variables
var init;       //init true = app is juist begonnen, false = al gestart
var numberOfHotzones;
var start;
var progress = 0;
var unprintedMarkervalues = [];

//runtime variables
var map;
var url = 'https://apprally.cloudant.com/apprally';
var defaultMarker = 'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.3|0|FF0000|5';

//------------------------------------------------------------------------------------------------------------------

google.maps.event.addDomListener(window, 'load', initialize);


function initialize() {

    // 1) Initializing localStorage items
    try {
        init = localStorage.getItem("init");
        numberOfHotzones = localStorage.getItem("hotzones");
        start = localStorage.getItem("start");
        progress = localStorage.getItem("progress");
        printedMarkers.push(localStorage.getItem("printedMarkers"));
    }
    catch(err) {

        init = true;
        localStorage.setItem("init", init);

        progress=0;
        localStorage.setItem("progress",progress);

        localStorage.setItem("lang","nl");
    }
    //console.log(init);

    // 2) Create map
   createMap();

    // 3) Add startup hotzones or unlocked & new markers
    if(init){
        getHotzones();
    }
   else{
        //placing unlocked markers
        var counter =0;
        if(counter < printedMarkers.length){
            unprintedMarkervalues = printedMarkers[counter];
            getIcon();
        }

        if(progress > 0){
            //decreasing progress a sec to get the previous hotzone nr for it's hotspots
            progress--;

            //placing new Markers
            getHotspots(determineNextHotzone());
            progress++;
            getNextHotzone();

            //saving unlocked & new markers
            localStorage.setItem("printedMarkers", printedMarkers);
        }

    }
}


//also used as a clearMap function
function createMap() {
    var mapOptions = {
        zoom: 15,
        center: new google.maps.LatLng(51.2161349, 4.410647400000016),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);
}


function getHotzones(){

    $.ajax
    ({
        url: url + '/_design/allviews/_view/hotzones',
        type: 'GET',
        dataType: 'jsonp',
        async : false,
        success: function(data)
        {
            numberOfHotzones = data.rows.length;
            localStorage.setItem("hotzones", numberOfHotzones);

            var i;
            for (i=0; i < numberOfHotzones; i++){
                unprintedMarkervalues =data.rows[i].value;
                //console.log("sinterklaas", unprintedMarkervalues);

                getIcon();
            }
        },
        error: function(xhr, textStatus, errorThrown){
            //message: no internetconnection, please try again!
        }
    });
}


function getHotspots(hotzone){
    $.ajax
    ({
        url: url + '/_design/allviews/_view/hotspotsperhotzone?key="' + hotzone + '"',
        type: 'GET',
        dataType: 'jsonp',
        async : false,
        success: function(data)
        {
            console.log(data.rows);
            var i;
            for (i=0; i < data.rows.length; i++){
                unprintedMarkervalues =data.rows[i].value;
                //console.log(unprintedMarkervalues);

                getIcon();
                printedMarkers.push(unprintedMarkervalues);
            }
        },
        error: function(xhr, textStatus, errorThrown){
            //message: no internetconnection, please try again!
        }
    });
    addMarker();
}


function getNextHotzone(){
    $.ajax
    ({

        url: url + '/_design/allviews/_view/hotzones?key="hotzone' + determineNextHotzone() + '"',
        type: 'GET',
        dataType: 'jsonp',
        async : false,
        success: function(data)
        {
            console.log(data.rows);
            var i;
            for (i=0; i < data.rows.length; i++){
                unprintedMarkervalues =data.rows[i].value;
                //console.log(unprintedMarkervalues);

                getIcon();
            }
        },
        error: function(xhr, textStatus, errorThrown){
            //message: no internetconnection, please try again!
        }
    });
}


function determineNextHotzone(){
    if((start + progress)<= numberOfHotzones){
        return start + progress;
    }
    else{
        return start + progress - numberOfHotzones;
    }
}


function getIcon(){
    $.ajax
    ({
        url: url + '/markertypes',
        type: 'GET',
        dataType: 'json',
        async : false,
        success: function(data)
        {
            var i;
            for (i=0; i < data.markertypes.length; i++){

                if(unprintedMarkervalues.marker == data.markertypes[i][0]){
                    unprintedMarkervalues.markerurl = data.markertypes[i][1];}
                else{
                    unprintedMarkervalues.markerurl = defaultMarker;
                }}

            addMarker()
        },
        error: function () {
            unprintedMarkervalues.marker = defaultMarker;
            addMarker();
        }
    })
}


function addMarker() {
    var latitude = unprintedMarkervalues.latitude;
    var longitude = unprintedMarkervalues.longitude;
    var icon = unprintedMarkervalues.markerurl;
    var dropanimation = unprintedMarkervalues.dropanimation;


    // 1) Create marker
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        icon: icon,
        map: map,
        draggable: false,
        animation: function determineAnimation(){
            if(dropanimation){
                //marker.setAnimation(google.maps.Animation.DROP);
                return new google.maps.Animation.DROP;
            }
            else{
                //marker.setAnimation(null);
                return null
            }
        }
    });

    // 2) Create infowindow for specific marker
    var infowindow = new google.maps.InfoWindow({
        content: "<h4>" + unprintedMarkervalues.info + "</h4>"
    });


    // 3) Add eventlistener to this specific marker, CODE WILL ONLY BE EXECUTED ONCE MARKER IS CLICKED!
    google.maps.event.addListener(marker, 'click', function() {

        if(init){

            // hotzone info ophalen en klaarzetten om terug te adden op de map
            var hotzoneinfo = infowindow.getContent().substring(4);
            console.log(hotzoneinfo);
            hotzoneinfo = hotzoneinfo.substring(0,hotzoneinfo.length - 5);
            console.log(hotzoneinfo);

            $.ajax
            ({
                url: url + '/_design/allviews/_view/hotzone?key="' + hotzoneinfo + '"',
                type: 'GET',
                dataType: 'json',
                async : false,
                success: function(data)
                {
                    console.log("chosenHotzone", data);
                    unprintedMarkervalues.latitude = data.rows[0].value.latitude;
                    unprintedMarkervalues.longitude = data.rows[0].value.longitude;
                    unprintedMarkervalues.dropanimation = false;
                    // unprintedMarkervalues.icon bevat nog steeds de hotzone-markerurl
                    // dus deze hoeft niet meer aangepast te worden

                    console.log(unprintedMarkervalues);
                    createMap();
                    addMarker();
                    //map.setCenter(determineCenterAverage());              <--- NOG AAN TE VULLEN!


                    //starthotzone has been selected!
                    localStorage.setItem("start",(data.rows[0].value._id).substring(7));
                    localStorage.setItem("init", false);

                    printedMarkers.push(unprintedMarkervalues);
                },
                error: function (exception) {
                    //message: no internetconnection. please try again!
                }
            })
        }
        else{
            infowindow.open(map,marker);
        }
    });
}


/*func determineCenterAverage(destinationmarker){

}*/

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


var gpsMarkerPos = null;

function autoUpdate() {
    navigator.geolocation.getCurrentPosition(function(position) {
        var newPoint = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude);

        if (gpsMarkerPos) {
            // Marker already created - Move it
            gpsMarkerPos.setPosition(newPoint);
        }
        else {
            // Marker does not exist - Create it
            gpsMarkerPos = new google.maps.Marker({
                position: newPoint,
                map: map,
                icon:"../www/img/gps.png"
            });
        }

    //Center the map on the new position
    map.setCenter(newPoint);
    });

// Call the autoUpdate() function every 8 seconds
    setTimeout(autoUpdate, 8000);
}

//----------------------------------------------------------------------


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
