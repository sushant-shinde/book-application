$(function () {
    $('.jumbotron').css('height', size.height - 0);
    $('#divScheduleBookList').css('height', size.height - 310);
    LoadDashboardData();
});
var chartData = [];
function LoadDashboardData() {
    $('#LoadingImage').show();
    var data = null
    $.ajax({
        type: 'post',
        url: $('#hf_GetSummary').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var aitem = JSON.parse(response.aItemList);
            var aSummaryList = response.aSummaryCountL;
            $('#H_NewBooks').html(aSummaryList[0].NewBookCount);
            $('#H_WIP').html(aSummaryList[0].WIPCount);
            $('#h_Billed').html(aSummaryList[0].BilledCount);
            $('#H_WithDrwan').html(aSummaryList[0].WithDrwanCount);

            var aWishList = JSON.parse(response.zBookList);

            //Load Column Chart
            var aTotalCount = 0;
            var acategoriesL = [];
            var adataL = [];
            $.each(aitem, function (e, val) {
                var aCount = parseInt(val.BookCount);
                // if (aCount > 0) {
                //chartData.push({
                //    Activity: val.Activity,
                //    count: aCount
                //});
                acategoriesL.push(val.Catalog);
                adataL.push(val.Percentage);
                aTotalCount += aCount;
                //}

            });
            BookChart(acategoriesL, adataL);//Load Column Chart
            LoadBookGallary(aitem);
            LoadScheduleBookList(aWishList); // Load Schedule Book List
            $('#LoadingImage').hide();
        },
        error: function (response) {
            $('#LoadingImage').hide();
        }
    });
}

//Column Chart Generation
var colors = ['#FF530D', '#E82C0C', '#FF0000', '#E80C7A', '#E80C7A'];
function BookChart(acategoriesL, dataL) {
    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'container',
            type: 'column',
            //options3d: {
            //    enabled: true,
            //    alpha: 10,
            //    beta: 0,
            //    depth: 50,
            //    viewDistance: 25
            //},
            backgroundColor: 'rgba(255, 255, 255, 0.0)'
        },
        title: {
            text: "Books WIP Progress"
        },
        xAxis: {
            categories: acategoriesL,
            labels: {
                rotation: -45,
                style: {
                    fontSize: '12px',
                    //fontFamily: 'Verdana, sans-serif'
                }
            },
            tickLength: 10,
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'Percentage'
            },
            labels: {
                rotation: -45,
                style: {
                    fontSize: '12px',
                    //fontFamily: 'Verdana, sans-serif',
                }
            },
        },
        plotOptions: {
            column: {
                depth: 25,
                dataLabels: {
                    enabled: true
                },
                pointWidth: 30,
            }
        },
        series: [{
            name: 'Books',
            data: dataL,
            //colorByPoint: true,
        }]
    });
}

//Pie Chart Generation
function PieChart(chartData) {
    var title = 'Activity Wise Book Count (' + aTotalCount.toString() + ')';
    var chart = AmCharts.makeChart("chartdiv", {
        "type": "pie",
        "theme": "light",
        "titles": [{
            "text": title,
            "size": 16
        }],
        "dataProvider": chartData,
        "valueField": "count",
        "titleField": "Activity",
        "startEffect": "elastic",
        "startDuration": 2,
        "labelRadius": 10,
        "innerRadius": "50%",
        "depth3D": 25,
        "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b></span>",
        "angle": 40,
        "export": {
            "enabled": true
        }
    });
}

// Schedule Book List Generation
function LoadScheduleBookList(adata) {
    var zhtml = '<ul class="books-list book-list-in-box">';
    $.each(adata, function (e, val) {
        //zhtml += '<div class="divDashBox marDiv">';
        //zhtml += '<div class="divMarHead"> Catalog : ' + val.Catalog + '</div>';
        //zhtml += '<div> ISBN : ' + val.ISBN + '</div>';
        //zhtml += '<div> Activity : ' + val.Activity + '</div>';
        //zhtml += '<div> Due Date : ' + FormatDateColumn(val.ActivityDueDate) + '</div>';

        //var zActDutDate = FormatDate_IE(FormatDateColumn(val.ActivityDueDate));
        //if (new Date(zActDutDate) < new Date())
        //    zhtml += '<span class="spOverDue blink" title="Over Due"><i class="fa fa-exclamation-triangle"></i> Over Due</span>';
        //if (new Date(zActDutDate) == new Date())
        //    zhtml += '<span class="spTodayDue blink" title="Today Due"><i class="fa fa-info-circle"></i></span>';
        //zhtml += '</div><hr>';

        var aimgpath = val.ImgPath;
        if (aimgpath == null || aimgpath == '') {
            aimgpath = "../Images/Covers/blue.png";
        }

        zhtml += '<li class="item">';
        zhtml += '<div class="book-img">';
        zhtml += '<img src="' + aimgpath + '" alt="Book Cove"></div>';
        zhtml += '<div class="book-info">';
        zhtml += '<span class="product-title">';
        zhtml += val.Catalog;

        var zActDutDate = FormatDate_IE(FormatDateColumn(val.ActivityDueDate));
        var zActDate = new Date(new Date(zActDutDate).toDateString());
        var zCurrentDate = new Date(new Date().toDateString());

        if (zActDate < zCurrentDate)
            zhtml += '<span class="label pull-right spOverDue" title="Over Due"><i class="fa fa-star"></i></span></span>';
        else
            zhtml += '<span class="label pull-right spTodayDue" title="Today Due"><i class="fa fa-star"></i></span></span>';


        zhtml += '<span class="book-description">';
        zhtml += val.ISBN;
        zhtml + '</span>';
        zhtml + '</div>';
        zhtml + '</li> ';

    });
    // setInterval(blink_text, 1000);
    if (zhtml == '<ul class="books-list book-list-in-box">')
        zhtml = '<center>No Data Found...</center>';
    $('#divScheduleBookList').html(zhtml);
}
function blink_text() {
    $('.blink').fadeOut(500);
    $('.blink').fadeIn(500);

    $("marquee").hover(function () {
        this.stop();
    }, function () {
        this.start();
    });
}


function LoadBookGallary(aitem) {
    var zhtmlstr = '';
    $.each(aitem, function (e, val) {

        var aimgpath = val.ImgPath;
        if (aimgpath == null || aimgpath == '') {
            aimgpath = "../Images/Covers/blue.png";
        }
        zhtmlstr += '<a href="#" style="background:linear-gradient(rgb(87, 116, 132), rgb(12, 132, 165))">' +
            '<div class="col-sm-4 bkCover"><img src="' + aimgpath + '"></div>' +
            '<div class="col-sm-8 bkCoverLeft">' +
            '<span>' + val.Title.toString().substring(0, 15) + '</span><br>' +
            '<span>' + val.Catalog + '</span><br>' +
            '<span>' + val.Number + '</span><br>' +
            '<span>' + val.ISBN + '</span><br>' +
            '<span>' + FormatDateColumn(val.ReceivedDt) + '</span><br>' +
            '<span>' + FormatDateColumn(val.DueDt) + '</span><br>' +
            '<span>' + val.PMName + '</span><br>' +
            '<span>' + val.PEName + '</span><br>' +
            '</div>' +
            '<div style="color:#000;bottom:-25px;left:25px">' + (e + 1).toString() + '</div>' +
            '</a>';
    });
    $('.dg-wrapper').html(zhtmlstr);

    $('#dg-container').gallery({
        autoplay: true
    });
}