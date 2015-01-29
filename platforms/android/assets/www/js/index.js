//local storage variables
var init;       //init true = app is juist begonnen, false = al gestart
var numberOfHotzones;
var start;
var progress = 0;
var unprintedMarkervalues = [];
var printedMarkers = [];

//runtime variables
var map;
var url = 'https://apprally.cloudant.com/apprally';
var defaultMarker = 'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.3|0|FF0000|5';

//------------------------------------------------------------------------------------------------------------------

google.maps.event.addDomListener(window, 'load', initialize);


function initialize() {
    console.log("Index initialization: Started");

    // 1) Initializing or recovering localStorage items
    if(localStorage.getItem("init")==null){
        console.log("init 1: Initializing");

        init = true;
        localStorage.setItem("init", init);
        progress=0;
        localStorage.setItem("progress",progress);
        localStorage.setItem("lang","nl");
        localStorage.setItem("questionsMissing","");

        /*Storage.prototype.setObj = function(key, obj) {
            return this.setItem(key, JSON.stringify(obj))
        }
        Storage.prototype.getObj = function(key) {
            return JSON.parse(this.getItem(key))
        }*/


    }else{
        console.log("Initializationprocess (init 1,2,3): " + localStorage.getItem("init"));
        console.log("index 1: LocalStorage recovery");

        init = localStorage.getItem("init");
        numberOfHotzones = localStorage.getItem("numberOfHotzones");
        start = localStorage.getItem("start");
        progress = localStorage.getItem("progress");
        /*printedMarkers = localStorage.getObj("printedMarkers");
        console.log(printedMarkers);
        console.log(localStorage.getItem("printedMarkers"));*/
        if(localStorage.getItem("gpsStart")=="start"){
            gpsStart = "start";
            codeGPS();
        }

        if(progress == numberOfHotzones){
            document.getElementById("scanPagina").disabled = true;
            //Toastr message: Gefeliciteerd, u hebt de APpRally uitgespeeld! U kan uw score op campus Meistraat vergelijken met andere groepen.
        }
    }

    // 2) Create map
   createMap();

    // 3) Add startup hotzones or unlocked & new markers
    if(init==true){
        placeAllHotzones();
    }
   else{
        //index 2: placing unlocked markers
        /*console.log("index 2: placing unlocked markers");
        console.log(printedMarkers);
        var counter;
        for(counter=0;counter < printedMarkers.length;counter++){
            unprintedMarkervalues = printedMarkers[counter];
            getIcon();
        }*/

        if(progress > 0){
            //decreasing progress a sec to get the previous hotzone nr for it's hotspots
            progress--;

            //placing new Markers
            placeHotspots(determineNextHotzone());
            progress++;
            placeNextHotzone();

            //index 5: saving current markers
            /*console.log("index 5: saving current markers");
            localStorage.setObj("printedMarkers", printedMarkers);*/

            console.log("index 6: Index loading: Completed");
        }
    }

    console.log("Index initialization: Complete!")
}


function createMap() {
    if(init == true){console.log("init 2 Mapcreation");} //also used as a clearMap function

    var mapOptions = {
        zoom: 15,
        center: new google.maps.LatLng(51.2161349, 4.410647400000016),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);
}


function placeAllHotzones(){
    console.log("init 3 Hotzones");
    $.ajax
    ({
        url: url + '/_design/allviews/_view/hotzones',
        type: 'GET',
        dataType: 'jsonp',
        async : false,
        success: function(data)
        {
            numberOfHotzones = data.rows.length;
            localStorage.setItem("numberOfHotzones", numberOfHotzones);

            var i;
            for (i=0; i < numberOfHotzones; i++){
                unprintedMarkervalues =data.rows[i].value;

                getIcon();
            }
        },
        error: function(xhr, textStatus, errorThrown){
            //Toastr message: no internetconnection, please try again!
        }
    });
}


function placeHotspots(hotzone){
    console.log("index 3: placing new hotspots");

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
            //Toastr message: no internetconnection, please try again!
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


function placeNextHotzone(){
    console.log("index 4: placing next hotzone");

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
                getIcon();
            }
        },
        error: function(xhr, textStatus, errorThrown){
            //Toastr message: no internetconnection, please try again!
        }
    });
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
                    unprintedMarkervalues.hotzoneid = "chosen starthotzone";
                    unprintedMarkervalues.info = hotzoneinfo;
                    // unprintedMarkervalues.icon bevat nog steeds de hotzone-markerurl, dus deze hoeft niet meer aangepast te worden

                    console.log(unprintedMarkervalues);
                    createMap();
                    addMarker();

                    //Ajusting mapcenter and zoom
                    //var hotzonePosition = [unprintedMarkervalues.latitude, unprintedMarkervalues.longitude];


                    //saven starthotzone en spelsetup voltooien
                    printedMarkers.push(unprintedMarkervalues);
                    console.log("test1", JSON.stringify(printedMarkers));
                    console.log("test2", JSON.parse(JSON.stringify(printedMarkers)));
                    console.log("test3", JSON.parse(JSON.stringify(printedMarkers))[0].doctype);

                    ///localStorage.setItem("printedMarkers", printedMarkers);
                    //console.log(localStorage.getItem("printedMarkers"));
                    localStorage.setItem("start",(data.rows[0].value._id).substring(7));
                    localStorage.setItem("init", false);

                    console.log("init: Game startup completed! Starthotzone " + hotzoneinfo)
                },
                error: function (exception) {
                    //Toastr message: no internetconnection. please try again!
                }
            })
        }
        else{
            infowindow.open(map,marker);
        }
    });
}


function centerAverage(hotzonePosition){
    if(gpsStart != "start") {
        gpsStart = "startBrief";
        codeGPS();
    }

    var centerZoomPoint = new google.maps.LatLng(gpsMarkerPos.latitude + hotzonePosition[0]/ 2, gpsMarkerPos.longitude + hotzonePosition[1]/2);
    if(gpsStart =="startBrief"){gpsStart = "stop"}
    map.setCenter(centerZoomPoint);
    //map.zoom();

}


//--------------------------------------- GPS functions -------------------------------------------


var gpsMarkerPos = null;
var gpsStart = null;

function uiGPS() {
    gpsStart = 'start';
    localStorage.setItem("gpsStart",gpsStart);
    codeGPS();
}

function codeGPS() {
    if(gpsStart == "start" || gpsStart == "startBrief"){
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
            //map.setCenter(newPoint);
        });

        // Call the autoUpdate() function every 8 seconds
        setTimeout(codeGPS(), 8000);
    }
}

//--------------------------------------- Application -------------------------------------------


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
