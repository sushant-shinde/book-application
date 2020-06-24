$(function () {
    $('#divBookList,#DivListView').css('height', size.height - 120);

    $('#Txt_FromDate').datetimepicker({
        format: 'd M Y',
        value: new Date(),
        timepicker: false,
        maxDate: today
    });
    $('#Txt_ToDate').datetimepicker({
        format: 'd M Y',
        value: new Date(),
        timepicker: false,
    });

    //$('#BkTabul li').click(function () {
    //    $(this).parent().prepend(this);
    //})

    LoadBookList('Today');
    $('.progress').asProgress({
        'namespace': 'progress'
    });
    $('.progress').asProgress('go', '50%');


    $('#BkTabul li').click(function () {
        var aTabType = $(this)[0].innerText;
        LoadBookList(aTabType);
    });

    $('#btnWISH').click(function () {
        if ($('#Txt_FromDate').val() == '') {
            $.bootstrapGrowl('Select From Date!', {
                type: 'danger',
                delay: 2000,
            });
            $('#Txt_FromDate').focus();
            return false;
        }
        else if ($('#Txt_ToDate').val() == '') {
            $.bootstrapGrowl('Select To Date !', {
                type: 'danger',
                delay: 2000,
            });
            $('#Txt_ToDate').focus();
            return false;
        }
        LoadBookList($('#BkTabul li.active').text());
    });


    $('.inputHandCursor').change(function () {
        var aStartDate = new Date($("#Txt_FromDate").val());
        var aEndate = new Date($("#Txt_ToDate").val());
        if (new Date(aStartDate) > new Date(aEndate)) {
            $.bootstrapGrowl("To date should be greater than From date !", { type: 'danger', delay: 2000, });
            $(this).val('');
            $(this).focus();
            zResult = false;
        }
    });

});
function LoadBookList(aTabType) {
    $('#LoadingImage').show();
    var data = {
        zFromDate: $('#Txt_FromDate').val(),
        zToDate: $('#Txt_ToDate').val(),
        zTabType: aTabType
    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetBookList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var zItemList = JSON.parse(response.zBookList);
            var zActivityList = response.zActivityList;

            $('#LoadingImage').hide();
            // Starting
            var zTableList = '<div class="DivList"> <table width="100%">';
            var zListView = '';
            $.each(zItemList, function (e, val) {
                //Child Elements
                var zActDutDate = FormatDate_IE(FormatDateColumn(val.ActivityDueDate));

                var zActDate = new Date(new Date(zActDutDate).toDateString());
                var zCurrentDate = new Date(new Date().toDateString());

                if (zActDate < zCurrentDate)
                    zTableList += '<tr class="trOverDue" title="Over Due"  data-id="' + val.BookID + '" >';
                else
                    zTableList += '<tr  data-id="' + val.BookID + '">';
                zTableList += '<td width="10%">';

                var aimgpath = val.ImgPath;
                if (aimgpath == null || aimgpath == '') {
                    aimgpath = "../Images/Covers/blue.png";
                }
                zTableList += '<div><img height="110px" width="90px;" src="' + aimgpath + '" altr=""/></div>';
                zTableList += '</td>';

                zTableList += '<td>';
                zTableList += '<div class="row divBookWish">';
                zTableList += '<div class="col-sm-12 child"><strong>' + 'Title : ' + isNullCheck(val.Title) + '</strong></div>';
                zTableList += '<div class="col-sm-3 divPadd">' + 'Catalog : ' + val.Catalog + '</div>';
                zTableList += '<div class="col-sm-3 divPadd">' + 'ISBN : ' + val.ISBN + '</div>';
                zTableList += '<div class="col-sm-3 divPadd">' + 'Receive Date : ' + FormatDateColumn(val.ReceivedDt) + '</div>';
                zTableList += '<div class="col-sm-3 divPadd">' + 'Due Date : ' + FormatDateColumn(val.DueDt) + '</div>';

                

                zTableList += '<div class="col-sm-3 divPadd">' + 'PE Name : ' + isNullCheck(val.PEName).capitalize() + '</div>';
                zTableList += '<div class="col-sm-3 divPadd">' + 'PM Name : ' + isNullCheck(val.PMName).capitalize() + '</div>';
                zTableList += '<div class="col-sm-3 divPadd">' + 'Author Name : ' + isNullCheck(val.AuthorName).capitalize() + '</div>';
                zTableList += '<div class="col-sm-3 divPadd">' + 'Publisher : ' + isNullCheck(val.Publisher).capitalize() + '</div>';


                zTableList += '<div class="col-sm-3 divPadd"><strong>' + 'Activity : <span class="spActivity">' + isNullCheck(val.Activity) + '</span></strong></div>';
                zTableList += '<div class="col-sm-3 divPadd"><strong>' + 'Activity Due Date : ' + FormatDateColumn(val.ActivityDueDate) + '</strong></div>';

                if (zActDate < zCurrentDate)
                    zTableList += '<div class="col-sm-3 divPadd spOverDue blink" title="Over Due"><i class="fa fa-exclamation-triangle"></i> Over Due</div>';

                //setInterval(blink_text, 2000);
                //var zPercentableL = parseInt(val.Percentage) - 100;
                //zTableList += '<div class="col-sm-12"><div class="progress" role="progressbar" data-goal="' + zPercentableL.toString() + ' " aria-valuemin="-100" aria-valuemax="0">' +
                //    '<div class="progress__bar"><span class="progress__label"></span></div>' +
                //    '</div></div>';
                //zTableList += '</div>';

                var zProgBar = '<br><div class="col-sm-12 child">';
                var zsumPer = 0;
                $.each(zActivityList, function (e1, valItem) {
                    var zclass = 'progress-bar-info';
                    if (e1 % 2 === 0)
                        zclass = 'progress-bar-info';
                    else
                        zclass = 'progress-bar-danger';

                    if (valItem.PlanID == val.PlanID) {
                        if (valItem.CompletedDate != null) {
                            zProgBar += '<div class="progress-bar ' + zclass + '" style="width:' + valItem.Percentage.toString() + '%" title="' + valItem.Activity + '">' +
                                valItem.Percentage.toString() + '%</div>';
                            zsumPer += parseInt(valItem.Percentage);
                        }
                    }

                });
                //zProgBar += '<span class="divTotPercent"><span class="SpPercent">' + zsumPer.toString() + '</span>%</span>';
                zProgBar += '</div>';

                // zTableList += zProgBar;

                zTableList += '</td>';
                var zCompletePercentage = parseInt(zsumPer.toString()[0]);
                if (parseInt(zsumPer.toString()[1]) > 5) {
                    zCompletePercentage += 1;
                }
                var zProgressL = '<div class="radialProgressBar progress-' + zCompletePercentage.toString() + '0' + '"><div class="overlay">' + zsumPer.toString() + '%</div></div>'
                zTableList += '<td width="10%"><div class="cols-sm-2 divTotPercent">' + zProgressL + '</div></td>';

                zTableList += '</tr>';
                //Child Elements

                // Show List View
                zListView += '<div class="col-md-3" title="' + val.Title + '">';
                if (zActDate < zCurrentDate)
                    zListView += '<div class="info-box bg-red">';
                else
                    zListView += '<div class="info-box bg-aqua">';

                var aimgpath = val.ImgPath;
                if (aimgpath == null || aimgpath == '') {
                    aimgpath = "../Images/Covers/blue.png";
                }

                zListView += '<span class="info-box-icon"><img class="imgCover" src="' + aimgpath + '" altr=""/></span>';
                zListView += '<div class="info-box-content" data-id="' + val.BookID + '" >';
                zListView += '<span class="info-box-text">' + val.Catalog + '</span>';
                zListView += '<span class="info-box-number">' + val.ISBN + '</span>';
                zListView += '<div class="info-box-text1">' + val.PEName.capitalize() + '</div>';
                zListView += '<div class="info-box-text1">' + val.PMName.capitalize() + '</div>';
                zListView += '<div class="info-box-text1 spActivity">' + val.Activity.capitalize() + '</div>';
                zListView += '<div class="info-box-text1">' + FormatDateColumn(val.ActivityDueDate) + '</div>';
                zListView += '<div class="progress">';
                zListView += '<div class="progress-bar" style="width: ' + zsumPer.toString() + '%"></div>';
                zListView += '</div>';
                zListView += '<span class="progress-description">';
                zListView += zsumPer.toString() + '%';
                zListView += '</span>';
                zListView += '</div>';
                zListView += '</div>';
                zListView += '</div>';
            });
            // Ending
            zTableList += '</table></div>';
            $('#divBookList').html(zTableList);
            $('#DivListView').html(zListView);

            if (zItemList.length == 0) {
                var znoData = '<br><strong><center>No Data found...</center></strong>';
                $('#divBookList').html(znoData);
                $('#DivListView').html(znoData);
            }

            $(".DivList table tbody tr,.info-box-content").click(function () {
                XMLView($(this).attr('data-id'), $(this).find('.spActivity').html());
            });
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 5000,
            });
            $('#LoadingImage').hide();
        }
    });

}
function blink_text() {
    $('.blink').fadeOut(500);
    $('.blink').fadeIn(500);
}

function ShowWishList(zID, itemP) {
    $('.BookView').hide();
    $('#' + zID).show();
    if (zID == 'DivListView')
        $('.divBookContent').css('overflow', 'hidden');
    else
        $('.divBookContent').css('overflow', 'auto');

    $('.iright').css('color', '#1d2c99');
    $('.iright').css('cursor', 'pointer');
    $('#' + itemP).css('color', '#2196f3');
    $('#' + itemP).css('cursor', 'not-allowed');

}
function XMLView(item,aCurrentAct) {
    aBookID = item;
    $('#divLoadData').html('Please Wait......');
    $('#divLoadDataTrns').html('');

    var data = { zBookID: item }

    $.ajax({
        type: 'post',
        url: $('#hf_GetBookData').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var items = response.aItemList;
            var zWeeksCt = ' <strong style="float:right"><span class="spTAT">TAT Details</span> ' +
                diff_weeks(FormatDate_IE(FormatDateColumn(items[0].ReceivedDt)), FormatDate_IE(FormatDateColumn(items[0].DueDt))
                ) + ' - Weeks</strong>';

            var ztable = '<table class="tblMain">';
            ztable += '<tr><td>Publisher</td>' + '<td>' + items[0].Publisher + '</td></tr>';
            ztable += '<tr><td>Catalog</td>' + '<td>' + items[0].Catalog + '</td></tr>';
            ztable += '<tr><td>Title</td>' + '<td>' + items[0].Title + '</td></tr>';
            ztable += '<tr><td>Sub Title</td>' + '<td>' + isNullCheck(items[0].SubTitle) + '</td></tr>';
            ztable += '<tr><td>Type</td>' + '<td>' + items[0].UploadType + '</td></tr>';
            ztable += '<tr><td>Category</td>' + '<td>' + items[0].Category + '</td></tr>';
            ztable += '<tr><td>ISBN</td>' + '<td>' + items[0].ISBN + '</td></tr>';
            ztable += "<tr><td>Proposed Pub date</td><td>" + FormatDateColumn(items[0].DueDt) + zWeeksCt + "</td></tr>";
            ztable += "<tr><td>Author(s) Name</td><td>" + isNullCheck(items[0].AuthorName) + "</td></tr>";
            ztable += "<tr><td>Author(s) Email</td><td><a href='mailto:" + isNullCheck(items[0].AuthorEmail) + "'>" + isNullCheck(items[0].AuthorEmail) + "</a></td></tr>";
            ztable += "<tr><td>Editor(s) Name</td><td>" + isNullCheck(items[0].EditorName) + "</td></tr>";
            ztable += "<tr><td>Editor(s) Email</td><td><a href='mailto:" + isNullCheck(items[0].EditorEmail) + "'>" + isNullCheck(items[0].EditorEmail) + "</a></td></tr>";
            ztable += "<tr><td>PE Name</td><td>" + isNullCheck(items[0].PEName) + "</td></tr>";
            ztable += "<tr><td>PE Email</td><td><a href='mailto:" + isNullCheck(items[0].PEEmail) + "'>" + isNullCheck(items[0].PEEmail) + "</a></td></tr>";
            ztable += "<tr><td>PM Name</td><td>" + isNullCheck(items[0].PMName) + "</td></tr>";
            ztable += "<tr><td>PM Email</td><td><a href='mailto:" + isNullCheck(items[0].PMEmail) + "'>" + isNullCheck(items[0].PMEmail) + "</a></td></tr>";

            ztable += '</table>';
            $('#divLoadData').html(ztable);

            $('[data-toggle="tooltip"]').tooltip();
            ztable = "<table id='tblTaskList' class='tblTrans'><tr><th>Activity</th><th>Days</th><th>Scheduled</th><th>Revised Scheduled</th><th>Completed</th></tr>";

            items = response.aPlanningList;
            for (var i = 0; i < items.length; i++) {
                var SchDt = FormatDateColumn(items[i].ScheduleDate);
                var ReSchDt = FormatDateColumn(items[i].RevisedDate);
                var zComDt = FormatDateColumn(items[i].CompletedDate);

                ztable += "<tr>";
                ztable += "<td>" + items[i].Activity + "</td>";
                ztable += "<td>" + items[i].Days + "</td>";
                ztable += "<td title='" + GetDayName(SchDt) + "'>" + SchDt + " </td>";
                ztable += "<td title='" + GetDayName(ReSchDt) + "'>" + ReSchDt + " </td>";
                ztable += "<td title='" + GetDayName(zComDt) + "'>" + zComDt + " </td>";
                ztable += "</tr>";
            }
            ztable += "</table>"

            $('#divLoadDataTrns').html(ztable);

            $.each($('#tblTaskList tr'), function () {
                try {
                    if ($(this).find('td')[0].innerText.trim().toUpperCase() == aCurrentAct.toUpperCase())
                        $(this).addClass('trCurStatus');
                } catch (e) { }

            });

        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 2000,
            });
        }
    });
    $("#myModal").modal({ backdrop: 'static', keyboard: false });
}