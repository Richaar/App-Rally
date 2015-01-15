//document.getElementById('results').innerHTML = $.jStorage.get('test')
var lang = localStorage.getItem("lang");
var dburl = 'https://apprally.cloudant.com/apprally';
var questionid;

//------------------------------------------------------------------------------------------------------------
//Op deze pagina moet nog een header komen met een back-knop en een checkbox voor indien de QR code ontbreekt!
//localStorage.setItem(questionid , "missing");
//localStorage.setItem("progress", localStorage.getItem("progress") +1);

document.addEventListener("deviceready", init, false);


function init() {
    //language customization
    if(lang== "nl"){
        $('#solution').attr("placeholder", "Antwoord");
        $('label[for="QRPresence"] span.ui-btn-text').text("QR code niet aanwezig");
        document.getElementById('submit').innerHTML = '<a href="index.html" onclick="StoreLocal()" class="btn btn-primary">ANTWOORD!</a>';
    }else{
        $('#solution').attr("placeholder", "Answere");
        $('label[for="QRPresence"] span.ui-btn-text').text("QR code not present");
        document.getElementById('submit').innerHTML = '<a href="index.html" onclick="StoreLocal()" class="btn btn-primary">SUBMIT!</a>';
    }
    startScan();
}


function startScan() {
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            searchQuestion(result.text);
            //StoreLocal();
        },
        function (error) {
            alert("Scanning failed: " + error);
        }
    );
}


function searchQuestion(code){
    $.ajax
    ({
        url: dburl + '/_design/allviews/_view/question' + lang + '?key= "' + code + '"',
        type: 'GET',
        dataType: 'jsonp',
        async : false,
        success: function(data)
        {
            //console.log(arr[x].value);
            $('#question').text(data.rows[0].value);
            questionid = data.rows[0].id;
        },
        error: function(xhr, textStatus, errorThrown){
            if(lang=='nl'){
                //message: QR code is niet bekend, probeer opniew. Anders vinkt u de checkbox aan.
            }else{
                //message: QR code is not known, try again. Else check the checkbox.
            }
            console.log("unkown QR code!");
        }
    });
}

function StoreLocal(){

    if(document.getElementById("solution").value=="") {
        if(lang=='nl'){
            //message: Antwoord ontbrekend.
        }else{
            //message: Missing answere.
        }
        console.log("missing response!");

    } else{
        localStorage.setItem(questionid , document.getElementById("solution").value);
        localStorage.setItem("progress", localStorage.getItem("progress") +1);
    }



}