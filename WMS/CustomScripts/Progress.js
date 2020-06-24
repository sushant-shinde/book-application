var dataSet = [];
var aPEList = [];
var aPMList = [];
var aCatalogList = [];
var aBookTypeList = [];
var aBookCategoryList = [];
var aStatusList = [];
var custFilterList = [];
var aBookID = "";
$(function () {
    $('.divBookContent').css('height', size.height - 150);
    $('#ddlWIPSearch').select2();
    $('#lstPublisherList').select2({
        closeOnSelect: false,
        placeholder: "Select Publisher(s)",

    });
    $('#lstCatalogList').select2({
        closeOnSelect: false,
        placeholder: "Select Catalog(s)",

    });
    $('#lstNumberList').select2({
        closeOnSelect: false,
        placeholder: "Select Number(s)",

    });
    $('#lstISBNList').select2({
        closeOnSelect: false,
        placeholder: "Select ISBN(s)",

    });

    $('body').click(function (e) {
        if (e.target.closest('.dropdown') == null && e.target.className.indexOf('select2') == -1)
            closeToggle();
    });

    $('#btnBkGet').click(function () {

        var zNumberList = "";
        var zCatalogList = "";
        var zISBNList = "";
        var zPublList = "";

        if ($('#lstNumberList').val() != null)
            zNumberList = $('#lstNumberList').val().toString();
        if ($('#lstCatalogList').val() != null)
            zCatalogList = $('#lstCatalogList').val().toString();
        if ($('#lstISBNList').val() != null)
            zISBNList = $('#lstISBNList').val().toString();
        if ($('#lstPublisherList').val() != null)
            zPublList = $('#lstPublisherList').val().toString();

        CallData(true, zNumberList, zCatalogList, zISBNList, zPublList);

    });

    $('#ddlWIPSearch').change(function () {
        $('#divNumberFilter').hide();
        $('#divCatalogFilter').hide();
        $('#divISBNFilter').hide();
        $('#divPublisherFilter').hide();
        $('#lstNumberList').val(null).trigger("change");
        $('#lstCatalogFilter').val(null).trigger("change");
        $('#lstISBNList').val(null).trigger("change");
        $('#lstPublisherList').val(null).trigger("change");
        var SearchVal = $(this).val();
        if (SearchVal == "Number") {
            $('#divNumberFilter').show();
        }
        else if (SearchVal == "ISBN") {
            $('#divISBNFilter').show();
        }
        else if (SearchVal == "Catalog") {
            $('#divCatalogFilter').show();
        }
        else if (SearchVal == "Publisher") {
            $('#divPublisherFilter').show();
        }
        else {
            $('#lstNumberList').val(null).trigger("change");
            $('#lstCatalogFilter').val(null).trigger("change");
            $('#lstISBNList').val(null).trigger("change");
            $('#lstPublisherList').val(null).trigger("change");
            CallData(true, '', '', '', '');
        }

    })

    $('.inputHandCursor').change(function () {
        var aStartDate = new Date($("#Txt_FromDate").val());
        var aEndate = new Date($("#Txt_ToDate").val());
        if (new Date(aStartDate) >= new Date(aEndate)) {
            $.bootstrapGrowl("To date should be greater than From date !", { type: 'danger', delay: 2000, });
            $(this).val('');
            $(this).focus();
            zResult = false;
        }
    })
    CallData(true, '', '', '', '');
});

function CallData(aFirstLoad, zNumberList, zCatalogList, zISBNList, zPublList) {
    $('#LoadingImage').show();
    aPEList = [];
    aCatalogList = [];
    aBookTypeList = [];
    aBookCategoryList = [];
    aPMList = [];
    aStatusList = [];
    var zCatList = 'All';
    var zNumList = 'All';
    var zISList = 'All';
    var zPubList = 'All';

    if (zNumberList != '')
        zNumList = zNumberList;
    if (zCatalogList != '')
        zCatList = zCatalogList;
    if (zISBNList != '')
        zISList = zISBNList;
    if (zPublList != '')
        zPubList = zPublList;

    var data = {

        CatalogList: zCatList,
        NumList: zNumList,
        ISBNList: zISList,
        PublList: zPubList

    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetProgressReport').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechData(response.zBookList);
            $('#LoadingImage').hide();
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again', {
                type: 'danger',
                delay: 2000,
            });
            $('#LoadingImage').hide();
        }
    });
}

function FetechData(ItemsList) {
    try {
        var zCatalogList = ''; var zNumberList = ''; var zISBNList = ''; var zPublisherList = '';

        dataSet = [];
        var items = ItemsList;
        var zCtInP = 0;
        var zCtCom = 0;
        var zBookShelfList = '';
        var zColorindex = 0;
        var zColor = "";
        $.each(items, function (index) {
            var zindexL = 0;
            zCtInP += 1;
            zindexL = zCtInP;
            if ($(this)[0]["PlanStatus"] == "OnProcess") {
                zColor = "#36a2eb";
            }
            else if ($(this)[0]["PlanStatus"] == "OverDue") {
                zColor = "#ed687c";
            }

            var withdraw = "";
            var aimgpath = $(this)[0]["ImgPath"];
            if (aimgpath == null || aimgpath == '') {
                aimgpath = "../Images/Covers/blue.png";
            }

            zBookShelfList += '<a><div class="divBoofInfo">' +

                '<div class="col-sm-8 divDisp" style="background:linear-gradient( rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),url(' + aimgpath + ') no-repeat;background-size: 150px">' +
                $(this)[0]["Catalog"] +

                '<span class="spBookAction"><i class="fa fa-info-circle" aria-hidden="true" title="Info" data-col="Name" onclick="XMLView(' + $(this)[0]["BookID"] + ');"></i>' +
                '</span>' +
                '<hr>' +
                $(this)[0]["ISBN"].capitalize() + '<br>' +
                $(this)[0]["PEName"].capitalize() + '<br>' +
                $(this)[0]["PMName"].capitalize() + '<br>' +
                '<br/>' +
                '<div class="progress">' +
                '<div class="progress-bar" style="width: ' + $(this)[0]["Percentage"] + '%; background: ' + zColor + ';">' +
                '<span class="progress-icon fa fa-check" style="border-color: ' + zColor + '; color:' + zColor + ';"></span>' +
                '<div class="progress-value">' + $(this)[0]["Percentage"] + '%</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div></a>';

            if ($(this)[0]["Catalog"] != null && $(this)[0]["Catalog"] != '' && zCatalogList.indexOf($(this)[0]["Catalog"]) == -1)
                zCatalogList += '<option value="' + $(this)[0]["Catalog"] + '">' + $(this)[0]["Catalog"] + '</option>';
            if ($(this)[0]["Number"] != null && $(this)[0]["Number"] != '' && zNumberList.indexOf($(this)[0]["Number"]) == -1)
                zNumberList += '<option value="' + $(this)[0]["Number"] + '">' + $(this)[0]["Number"] + '</option>';
            if ($(this)[0]["ISBN"] != null && $(this)[0]["ISBN"] != '' && zISBNList.indexOf($(this)[0]["ISBN"]) == -1)
                zISBNList += '<option value="' + $(this)[0]["ISBN"] + '">' + $(this)[0]["ISBN"] + '</option>';
            if ($(this)[0]["Publisher"] != null && $(this)[0]["Publisher"] != '' && zPublisherList.indexOf($(this)[0]["Publisher"]) == -1)
                zPublisherList += '<option value="' + $(this)[0]["Publisher"] + '">' + $(this)[0]["Publisher"] + '</option>';

        });

        if ($("#lstCatalogList").find('option').length == 0) {
            $('#lstCatalogList').html(zCatalogList);
        }
        if ($("#lstNumberList").find('option').length == 0) {
            $('#lstNumberList').html(zNumberList);
        }
        if ($("#lstISBNList").find('option').length == 0) {
            $('#lstISBNList').html(zISBNList);
        }
        if ($("#lstPublisherList").find('option').length == 0) {
            $('#lstPublisherList').html(zPublisherList);
        }

        $('#bookshelf').html(zBookShelfList);
        $('.spBookAction').click(function () {
            $('.dropdown-menu').hide(300);
            $(this).find('.dropdown-menu').show(500);
        });

    } catch (e) {
        $('#LoadingImage').hide();
    }
}

function XMLView(item) {
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

            var zcheckCur = 0;
            $.each($('#tblTaskList tr'), function () {

                try {
                    if ($(this).find('td')[4].innerText == '' && zcheckCur == 0) {
                        $(this).addClass('trCurStatus');
                        zcheckCur = 1;
                    }

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

//function LoadBookList(aTabType) {
//    $('#LoadingImage').show();

//    $.ajax({
//        type: 'post',
//        url: $('#hf_GetWIPBookDetail').val(),
//        data: JSON.stringify(),
//        datatype: 'json',
//        success: function (response) {
//            var zItemList = response.zBookList;
//            var zActivityList = response.zActivityList;

//            $('#LoadingImage').hide();
//            // Starting
//            var zTableList = '<div class="DivList"> <table width="100%">';

//            $.each(zItemList, function (e, val) {
//                //Child Elements
//                var zActDutDate = FormatDate_IE(FormatDateColumn(val.ActivityDueDate));

//                if (new Date(zActDutDate) < new Date())
//                    zTableList += '<tr class="trOverDue" title="Over Due">';
//                else
//                    zTableList += '<tr>';
//                zTableList += '<td width="10%">';
//                zTableList += '<div><img height="100px" width="100px" src="' + val.ImgPath + '" altr=""/></div>';
//                zTableList += '</td>';

//                zTableList += '<td>';
//                zTableList += '<div class="row divBookWish">';

//                zTableList += '<div class="col-sm-3 divPadd">' + 'Catalog : ' + val.Catalog + '</div>';
//                zTableList += '<div class="col-sm-3 divPadd">' + 'ISBN : ' + val.ISBN + '</div>';
//                zTableList += '<div class="col-sm-3 divPadd">' + 'Receive Date : ' + FormatDateColumn(val.ReceivedDt) + '</div>';
//                zTableList += '<div class="col-sm-3 divPadd">' + 'Due Date : ' + FormatDateColumn(val.DueDt) + '</div>';

//                zTableList += '<div class="col-sm-12 child">' + 'Title : ' + isNullCheck(val.Title) + '</div>';

//                zTableList += '<div class="col-sm-3 divPadd">' + 'PE Name : ' + isNullCheck(val.PEName).capitalize() + '</div>';
//                zTableList += '<div class="col-sm-3 divPadd">' + 'PM Name : ' + isNullCheck(val.PMName).capitalize() + '</div>';
//                zTableList += '<div class="col-sm-3 divPadd">' + 'Author Name : ' + isNullCheck(val.AuthorName).capitalize() + '</div>';
//                zTableList += '<div class="col-sm-3 divPadd">&nbsp;</div>';

//                zTableList += '<div class="col-sm-3 divPadd"><strong>' + 'Activity : ' + isNullCheck(val.Activity) + '</strong></div>';
//                zTableList += '<div class="col-sm-3 divPadd"><strong>' + 'Activity Due Date : ' + FormatDateColumn(val.ActivityDueDate) + '</strong></div>';

//                if (new Date(zActDutDate) < new Date())
//                    zTableList += '<div class="col-sm-3 divPadd spOverDue blink" title="Over Due"><i class="fa fa-exclamation-triangle"></i> Over Due</div>';

//                setInterval(blink_text, 2000);
//                //var zPercentableL = parseInt(val.Percentage) - 100;
//                //zTableList += '<div class="col-sm-12"><div class="progress" role="progressbar" data-goal="' + zPercentableL.toString() + ' " aria-valuemin="-100" aria-valuemax="0">' +
//                //    '<div class="progress__bar"><span class="progress__label"></span></div>' +
//                //    '</div></div>';
//                //zTableList += '</div>';

//                var zProgBar = '<br><div class="col-sm-12 child">';
//                var zsumPer = 0;
//                $.each(zActivityList, function (e1, valItem) {
//                    var zclass = 'progress-bar-info';
//                    if (e1 % 2 === 0)
//                        zclass = 'progress-bar-info';
//                    else
//                        zclass = 'progress-bar-danger';

//                    if (valItem.PlanID == val.PlanID) {
//                        if (valItem.CompletedDate != null) {
//                            zProgBar += '<div class="progress-bar ' + zclass + '" style="width:' + valItem.Percentage.toString() + '%" title="' + valItem.Activity + '">' +
//                                valItem.Percentage.toString() + '%</div>';
//                            zsumPer += parseInt(valItem.Percentage);
//                        }
//                    }

//                });
//                zProgBar += '<span class="divTotPercent"><span class="SpPercent">' + zsumPer.toString() + '</span>%</span>';
//                zProgBar += '</div>';

//                 zTableList += zProgBar;


//                zTableList += '</tr>';
//                //Child Elements
//            });
//            // Ending
//            zTableList += '</table></div>';
//            $('#divBookList').html(zTableList);
//            $('.progress').asProgress({
//                'namespace': 'progress'
//            });
//            $('.progress').asProgress('go');


//            $('div.progress-bar').each(function (i) {
//                $(this).fadeOut(0).delay(200 * i).fadeIn(1850);
//            });

//            function count($this) {
//                var current = parseInt($this.html(), 10);
//                $this.html(++current);
//                if (current !== $this.data('count')) {
//                    setTimeout(function () { count($this) }, 50);
//                }
//            }
//            $("span.SpPercent").each(function () {
//                if ($(this).html() > 0) {
//                    $(this).data('count', parseInt($(this).html(), 10));
//                    $(this).html('0');

//                    count($(this));
//                }
//            });

//        },
//        error: function (result) {
//            $.bootstrapGrowl('Error Occured, Try Again !', {
//                type: 'danger',
//                delay: 5000,
//            });
//            $('#LoadingImage').hide();
//        }
//    });

//}
//function blink_text() {
//    $('.blink').fadeOut(500);
//    $('.blink').fadeIn(500);
//}