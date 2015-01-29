//document.getElementById('results').innerHTML = $.jStorage.get('test')
var lang = localStorage.getItem("lang");
var dburl = 'https://apprally.cloudant.com/apprally';
var questionid;
var questioncode;
var answerType;
var unansweredQuestions = [];
var finalAnsweringAction;
var gameFinished;
//------------------------------------------------------------------------------------------------------------

document.addEventListener("deviceready", init, false);


function init() {
    //language customization
    if(lang== "nl"){
        $('#solution').attr("placeholder", "Antwoord");
        //$('label[for="QRPresence"] span.ui-btn-text').text("QR code niet aanwezig");
        document.getElementById('button').innerHTML = '<a onclick="storeLocal()" class="btn btn-primary">ANTWOORD!</a>';
    }else{
        $('#solution').attr("placeholder", "Answer");
        //$('label[for="QRPresence"] span.ui-btn-text').text("QR code not present");
        document.getElementById('button').innerHTML = '<a onclick="storeLocal()" class="btn btn-primary">SUBMIT!</a>';
    }

    // checking if game is finished
    console.log(localStorage.getItem("progress"));
    console.log(localStorage.getItem("numberOfHotzones"));
    if(localStorage.getItem("progress") == localStorage.getItem("numberOfHotzones")){
        finalAnswering();
        console.log("test", unansweredQuestions.length);
        if(unansweredQuestions.length == 0){window.location.href = "schifting.html";}
    }else{
        startScan();
    }
}


function startScan() {
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            questioncode = result.text;
            searchQuestion(questioncode,null);
        },
        function (error) {
            alert("Scanning failed: " + error);
        }
    );
}

function searchQuestion(questionQRCode,questionID){

    var ajaxUrl;
    if(questionID == null){
        ajaxUrl = dburl + '/_design/allviews/_view/questionQRCode?key="' + questionQRCode + '"'}
    else {
        ajaxUrl = dburl + '/_design/allviews/_view/questionID?key="' + questionID + '"'
    }

    $.ajax
    ({
        url: ajaxUrl,
        type: 'GET',
        dataType: 'jsonp',
        async : false,
        success: function(data)
        {
            console.log("unansweredQuestions :", data);
            prepareQuestion(data);
        },
        error: function(xhr, textStatus, errorThrown) {
            if (lang == 'nl') {
                //Toastr message: QR code is niet bekend, probeer opniew. Anders vinkt u de checkbox aan.
            } else {
                //Toastr message: QR code is not known, try again. Else check the checkbox.
            }
            console.log("unkown QR code!");
        }
    });
}

function prepareQuestion(questionData) {

    answerType = questionData.rows[0].value.answerType;
    if (answerType == "multiple") {
        var multi = questionData.rows[0].value.answerMultiple;
        console.log(questionData.rows[0].value);

        $('#radio1').text(multi[0]);
        $('#radio2').text(multi[1]);
        $('#radio3').text(multi[2]);
        $('#radio4').text(multi[3]);

        console.log("text input closed");
        document.getElementById("multipleChoice").style.display = "block";
        document.getElementById("open").style.display = "none";
    }

    else {
        document.getElementById("multipleChoice").style.display = "none";
        document.getElementById("open").style.display = "inline";
    }

    var image = questionData.rows[0].value.image;
    $("#question_images").attr("src", image);

    $('#question').text(questionData.rows[0].value.questionNL);
    questionid = questionData.rows[0].id;
}

function storeLocal(){
    var response;
    if(answerType == "multiple"){
        response = $("input[name='klik']:checked").val();


    }
    else{
        if(document.getElementById("solution").value=="") {
            if(lang=='nl'){
                //Toastr message: Antwoord ontbrekend.
            }else{
                //Toastr message: Missing answere.
            }
            console.log("missing response!");

        } else{

            response=document.getElementById("solution").value;


        }
    }

    // checking if game is finished
    console.log(localStorage.getItem("progress"));
    console.log(localStorage.getItem("numberOfHotzones"));
    if(localStorage.getItem("progress") == localStorage.getItem("numberOfHotzones")){
        localStorage.setItem(questionid , response);
        console.log("final answer 1", unansweredQuestions.length);
        if(unansweredQuestions.length == 0 ){window.location.href = "schifting.html";}
        finalAnswering();
    }
    else{
        localStorage.setItem(questionid , response);
        localStorage.setItem("progress", parseInt(localStorage.getItem("progress")) +1);
        window.location.href ="index.html";
    }


}


function finalAnswering(){
    console.log("final answer 2");
    //Initial doublechecking and retrieving of unanswered questions
    if(finalAnsweringAction==null) {
        unansweredQuestions = [];
        var numberOfQuestions = localStorage.getItem("numberOfHotzones");
        for (var i = 1; i <= numberOfQuestions; i++) {
            var question = "question" + i + "a";
            console.log("question"+i,question );
            var answer = localStorage.getItem(question);
            console.log(answer);
            if (answer == "missing") {
                unansweredQuestions.push(question);
                console.log("pushed");
            }
        }
        finalAnsweringAction = true;
    }

    //checking if all questions are answered
    console.log("unawsered questions remaining", unansweredQuestions.length);
    if(unansweredQuestions.length > 0){
        questionid = unansweredQuestions.pop();

        searchQuestion(null,questionid);

    }
}