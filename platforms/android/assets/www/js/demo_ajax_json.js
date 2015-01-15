
function searchQuestion(){

    $.ajax
    ({
        url: 'https://apprally.cloudant.com/apprally/_design/allviews/_view/questions',
        type: 'GET',
        dataType: 'jsonp',
        async : false,
        success: function(data)
        {
            console.log(data);
            var arr = (data).rows;
            console.log(arr[0].value);
            $('#vraag').text(arr[0].value);
        }
    });
    }

