var dataSet = [];
var aPEList = [];
var aPMList = [];
var aCatalogList = [];
var aBookTypeList = [];
var aBookCategoryList = [];
var aStatusList = [];
var custFilterList = [];
var aBookID = "";
var aWithdrawType = "";
var CF_PEG = null;
var CF_PMG = null;
var CF_CatalogG = null;
var CF_BookTypeG = null;
var CF_BookCategoryG = null;
var CF_RecFromDt = null;
var CF_RecToDt = null;
var CF_PubFromDt = null;
var CF_PubToDt = null;
var CF_StatusG = null;
var CF_Billed = null;
var aID = null;
var atoday = new Date();
var aSurveylistG;
var cNumber = 0;
var chaptNumber = "";
var chapterCount = 0;
var chaptNumbers = [];

$(function () {
    aBookID = "";
    $('.divBookContent').css('height', size.height - 120);
    $('.tblList').css('height', size.height - 120);

    $('#TxtGeneralNote').jqte();
    $('#TxtWithdrawReason').jqte();
    //LoadUserData();
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
    var date = new Date();
    date.setMonth(date.getMonth() - 1);

    var dtF = '01-' + month_names[date.getMonth()] + '-' + date.getFullYear();
    var date = new Date();
    var dtT = date.getDate() + '-' + month_names[date.getMonth()] + '-' + date.getFullYear();
    $('#Txt_RecDTFrom').val(dtF);
    $('#Txt_RecDTTo').val(dtT);

    $('#Txt_SearchFromDate').val(dtF);
    $('#Txt_SearchToDate').val(dtT);

    $('#ddlWIPSearch').select2();

    $('#Txt_SearchFromDate').datepicker();
    $('#Txt_SearchToDate').datepicker();

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
    })

    $('#BkInfoTabul li').click(function () {
        $('#btnSave_Activity').hide();

        if ($(this)[0].innerText == 'Chapter Info')
            GoToChapterDetails(aBookID); {
            setTimeout(function () {
                $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
            }, 200);
        }
    });

    $('#BkTabul li').click(function () {
        closeToggle();
        $('#lstCatalogList').find('option').remove();
        $('#lstNumberList').find('option').remove();
        $('#lstISBNList').find('option').remove();
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
        if ($(this)[0].id == 'divBkWIP') {
            CallData(true, zNumberList, zCatalogList, zISBNList, zPublList);
        }
        else {
            AdvanceSearch(true, zNumberList, zCatalogList, zISBNList, zPublList);
        }
    });

    $('#Tabul li').click(function () {
        closeToggle();
        var zNumberList = "";
        var zCatalogList = "";
        var zISBNList = "";
        var zPublList = "";
        if ($('#lstNumberList').val() != null)
            zNumberList = $('#lstNumberList').val().toString();
        if ($('#lstCatalogFilter').val() != null)
            zCatalogList = $('#lstCatalogFilter').val().toString();
        if ($('#lstISBNList').val() != null)
            zISBNList = $('#lstISBNList').val().toString();
        if ($('#lstPublisherList').val() != null)
            zPublList = $('#lstPublisherList').val().toString();
        if ($(this)[0].id == 'divWIP') {
            CallData(true, zNumberList, zCatalogList, zISBNList, zPublList);
        }
        else {
            AdvanceSearch(true, zNumberList, zCatalogList, zISBNList, zPublList);
        }
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

        if ($("#BkTabul li.active a").text() == 'WIP') {

            CallData(true, zNumberList, zCatalogList, zISBNList, zPublList);
        }
        else {
            AdvanceSearch(true, zNumberList, zCatalogList, zISBNList, zPublList);
        }
    });

    $('#btnUpdateNotes').click(function () {
        if ($('#TxtGeneralNote').val() == '') {
            $.bootstrapGrowl("Please Enter Notes", {
                type: 'danger',
                delay: 2000,
            });
            return false;
        }
        $.post($('#hf_UpdateGeneralNotes').val(), {
            aBookUPID: aBookID,
            zGeneralNotes: $('#TxtGeneralNote').val()
        },
            function (returnedData) {
                $.bootstrapGrowl(returnedData, {
                    type: 'info',
                    delay: 2000,
                });
                $("#myModal_GeneralNotes").modal('hide');
                XMLView(aBookID);
            });

    });

    $('#btnClearNotes').click(function () {
        $('#TxtGeneralNote').val('');
        $.post($('#hf_UpdateGeneralNotes').val(), {
            aBookUPID: aBookID,
            zGeneralNotes: ''
        },
            function (returnedData) {
                XMLView(aBookID);
            });

    });

    $('#btnUpdatewithdraw').click(function () {
        if ($('#TxtWithdrawReason').val() == '') {
            $.bootstrapGrowl("Please Enter Reason", {
                type: 'danger',
                delay: 2000,
            });
            return false;
        }

        var data = { zBookID: aBookID, zType: aWithdrawType, zReason: $('#TxtWithdrawReason').val() }
        $.ajax({
            type: 'post',
            url: $('#hf_BookDelete').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                if (response.toString().indexOf('Error') != -1) {
                    $.bootstrapGrowl(response, {
                        type: 'danger',
                        delay: 2000,
                    });
                }
                else {
                    $.bootstrapGrowl(response, {
                        type: 'info',
                        delay: 2000,
                    });
                    $('#ddlWIPSearch').val("All");
                    if ($("#BkTabul li.active a").text() == 'WIP') {

                        CallData(true, '', '', '', '');
                    }
                    else {
                        AdvanceSearch(true, '', '', '', '');
                    }
                    $("#myModal_Withdraw").modal('hide');
                    XMLView(aBookID);
                }

            },
            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 2000,
                });

            }
        });

    });

    if (GetLastSegment() != 'NewBook')
        CallData(true, '', '', '', '');
});

function AddChapterInfo(bookId) {
    if (chapterCount > 0)
        cNumber = cNumber + 1;
    else
        cNumber = 0;

    if (cNumber > 9)
        chaptNumber = "C0" + cNumber;
    else
        chaptNumber = "C00" + cNumber;

    $.ajax({
        type: 'GET',
        url: $('#hf_GetAddChapterView').val(),
        data: { BookId: bookId, ChapterNumber: chaptNumber },
        success: function (response) {
            $("#chapterInfo").html(response);

            $('#myModal_Chapter_Info').modal('show');
        }, error: function (err) {

        }
    })
}

function ComfirmSurveyMailSent() {

    var zAUView = '';
    var zEDView = '';
    var zPEView = '';

    for (i = 0; i < aSurveylistG.length; i++) {
        if (aSurveylistG[i].UserType == 'Author') {
            zAUView = '&nbsp;<span id="1" class="surveyView" ><i class="fa fa-info-circle" aria-hidden="true" title="Author Survey View"></i><label id="lbldate1"></label></span>';
        }
        else if (aSurveylistG[i].UserType == 'Editor') {
            zEDView = '&nbsp;<span id="2" class="surveyView"><i class="fa fa-info-circle" aria-hidden="true"  title="Editor Survey View"></i><label id="lbldate2"></label></span>';
        }
        else if (aSurveylistG[i].UserType == 'ProductionEditor') {
            zPEView = '&nbsp;<span id="3" class="surveyView"><i class="fa fa-info-circle" aria-hidden="true" title="PE Survey View"></i><label id="lbldate3"></label></span>';
        }
    }

    bootbox.prompt({
        title: "Are you sure to Send Survey Link?",
        value: ['1', '2', '3'],
        inputType: 'checkbox',
        inputOptions: [{
            text: 'Send Survey Link to Author' + zAUView,
            value: '1',
        },
        {
            text: 'Send Survey Link to Editor' + zEDView,
            value: '2',
        },
        {
            text: 'Send Survey Link to Production Editor' + zPEView,
            value: '3',
        }
        ],
        callback: function (result) {
            if (result) {
                var zvalue = result.toString().replace(',', '');
                SendSurvey(zvalue);
            }
        }
    });
    $('.surveyView').click(function () {

        var aID = $(this)[0].id;
        bootbox.hideAll();
        PopulateSurveyResponse(aID);
        //window.location.href = "http://localhost:60975/Home/Survey/" + aBookID + '/' + aID;

        //alert(aID);
    });
}

function SendSurvey(zMailTypeP) {
    var data = {
        zBookID: aBookID, zMailTypeP: zMailTypeP
    }
    $.ajax({
        type: 'post',
        url: $('#hf_SurveyMailSent').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            if (response.toString().indexOf('Error') != -1) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 2000,
                });
            }
            else {
                $.bootstrapGrowl(response, {
                    type: 'info',
                    delay: 2000,
                });


                XMLView(aBookID);
            }

        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 2000,
            });

        }
    });

}

function PopulateSurveyResponse(id) {

    $('#divSurveyPopulate').html('');

    var data = {
        zBookID: aBookID,
        ID: id
    }

    $.ajax({
        type: 'post',
        url: $('#hf_GetSurveyResponse').val(),
        data: data,
        datatype: 'json',
        success: function (response) {

            var itemList = response.aitemList1;

            for (var i = 0; i < itemList.length; i++) {
                if (id == '1') {
                    $('#lblname').text(itemList[i].AuthorName);
                }
                if (id == '2') {
                    $('#lblname').text(itemList[i].EditorName);
                }
                if (id == '3') {
                    $('#lblname').text(itemList[i].PEName);
                }

                $('#lbldate').text(FormatDateColumn(itemList[i].UpdatedTime));
                $('#lblcatlog').text(itemList[i].catalog);
                $('#lblBookname').text(itemList[i].Title);
            }


            var ztable = "<table id='tblResponse' class='tblTrans' style='margin-left: 16px;width: 95% !important;'><tr><th>Feedback</th><th>Response</th></tr>";

            var items = response.aitemList;



            for (var i = 0; i < items.length; i++) {


                ztable += "<tr>";
                ztable += "<td>Accuracy of text matter </td><td>" + items[i].TextAccuracy + "</td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td>Quality of Art production </td><td>" + items[i].Quality + "</td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td>Pagination/Style aspects </td><td>" + items[i].Pagination + " </td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td>Copyediting aspects </td><td>" + items[i].CopyEditing + " </td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td>Timely delivery </td><td>" + items[i].Delivery + " </td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td>Accuracy of End products </td><td>" + items[i].ProductAccuracy + " </td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td>Response to specific/Special Requirements </td><td>" + items[i].Response + " </td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td>Communication aspects </td><td>" + items[i].Communication + " </td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td>Response time on your specific complaints </td><td>" + items[i].ResponseTime + " </td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td>Raising appropriate Queries/Clarifications </td><td>" + items[i].Clarification + " </td>";
                ztable += "</tr>";
                $('#TxtComment').val(items[i].Comment);
                $('#lbltypename').text(items[i].UserType);

            }

            ztable += "</table>"


            $('#divSurveyPopulate').html(ztable);


        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 2000,
            });
        }
    });
    $("#myModal_SurveyResponse").modal({ backdrop: 'static', keyboard: false });
}

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
    var ZType = 'WIP';
    var data = {

        Type: ZType,
        CatalogList: zCatList,
        NumList: zNumList,
        ISBNList: zISList,
        PublList: zPubList,
        aType: getUrlVars()[0]
    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetReport').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechData(response.aItemList);
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

function AdvanceSearch(aFirstLoad, zNumberList, zCatalogList, zISBNList, zPublList) {
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
    var ZType = 'ADVANCE';
    var data = {

        Type: ZType,
        CatalogList: zCatList,
        NumList: zNumList,
        ISBNList: zISList,
        PublList: zPubList,
        aType: getUrlVars()[0]

    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetReport').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechData(response.aItemList);
            $('#LoadingImage').hide();
            CheckAccessRights();
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
        $.each(items, function (index) {
            var zindexL = 0;
            zCtInP += 1;
            zindexL = zCtInP;
            var t = [
                zindexL.toString(),
                $(this)[0]["Number"],
                $(this)[0]["Catalog"],
                $(this)[0]["ISBN"],
                $(this)[0]["Publisher"],
                $(this)[0]["PEName"],
                $(this)[0]["PMName"],
                $(this)[0]["TSPM"],
                $(this)[0]["UploadType"],
                //$(this)[0]["Category"],
                FormatDateColumn($(this)[0]["ReceivedDt"]),
                FormatDateColumn($(this)[0]["DueDt"]),
                //$(this)[0]["Status"],
                $(this)[0]["ID"],
                $(this)[0]["IsDeleted"],
                $(this)[0]["Billed"],
            ];

            dataSet.push(t);
            var withdraw = "";
            //if ($(this)[0]["IsDeleted"] == 0) {
            //    withdraw = '<span class=spUpdateIcon style="display:none"><i class="fa fa-thumbs-down" aria-hidden="true" title="Withdraw" data-col="Name" onclick="GoToBookDetails(' + $(this)[0]["ID"] + ');"></i></span>';
            //}
            //else {
            //    withdraw = '<span class=spUpdateIcon style="display:none"><i class="fa fa-thumbs-up" aria-hidden="true" title="Re-active" data-col="Name" onclick="GoToBookDetails(' + $(this)[0]["ID"] + ');"></i></span>';
            //}

            var aimgpath = $(this)[0]["ImgPath"];
            if (aimgpath == null) {
                aimgpath = "../Images/Covers/blue.png";
            }

            zBookShelfList += '<a><div class="divBoofInfo">' +

                '<div class="col-sm-3 divDisp" style="background:linear-gradient( rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),url(' + aimgpath + ') no-repeat;background-size: cover">' +
                '<span class="spBookLabel">' + $(this)[0]["Publisher"] + '</span></br>' +
                '<span class="spBookLabel">' + $(this)[0]["Catalog"].substring(0, 15) + '</span>' +
                '<span class="spBookAction"><i class="fa fa-bars" aria-hidden="true" title="Actions" data-col="Name"></i>' +
                '<div class="dropdown-menu">' +
                '<span class="spInfo"><i class="fa fa-info-circle" aria-hidden="true" title="Info" data-col="Name" onclick="XMLView(' + $(this)[0]["ID"] + ');"></i></span>' +
                //'<span><i class="fa fa-list" aria-hidden="true" title="Chapter" data-col="Name" onclick="GoToChapterDetails(' + $(this)[0]["ID"] + ');"></i></span>' +
                '<span class=spUpdateIcon style="display:none"><i class="fa fa-pen" aria-hidden="true" title="Update" data-col="Name" onclick="'
                + (($(this)[0]["IsDeleted"] == 1 || $(this)[0]["Billed"] == 1) ? '' : 'GoToBookDetails(' + $(this)[0]["ID"] + ');') + '"></i></span>' +
                '</div></span>' +
                ($(this)[0]["IsDeleted"] == 1 ? '<span class="spBilledAction"><i class="fa fa-times-circle" title="Withdrawn"></i></span>' : ($(this)[0]["Billed"] == 1 ? '<span class="spBilledAction"><i class="fa fa-coins" title="Billed"></i></span>' : '')) +
                '<hr>' +
                '<span class="spLabel">' +
                $(this)[0]["Number"] + '</br>' +
                $(this)[0]["ISBN"] + '</br>' +
                $(this)[0]["PEName"] + '</br>' +
                $(this)[0]["PMName"] + '</br>' +
                $(this)[0]["TSPM"] + '</br>' +
                //($(this)[0]["IsDeleted"] == 1 ? '<br>Withdrwan' : ($(this)[0]["Billed"] == 1 ? '<br>Billed' : '')) +
                '</span>' +
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
        LoadData();
    } catch (e) {
        $('#LoadingImage').hide();
    }
}

function LoadData() {
    var Page = 'Master';
    var table = $('#example').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
        "deferRender": true,
        data: dataSet,
        columns: [
            { title: "S.No" },
            { title: "Book ID" },
            {
                title: "Catalog", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spDescription">' + isNullCheck(data) + '</span>';
                }
            },
            { title: "ISBN" },
            { title: "Publisher" },
            { title: "PE Name" },
            { title: "PM Name" },
            { title: "TSPM" },
            { title: "Type" },
            //{ title: "Category" },
            { title: "Received Date" },
            { title: "Proposed Pub Date" },

            //{ title: "Status" },
            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<div class="divBkAction">' +
                        //'<span><i class="fa fa-list" aria-hidden="true" title="Chapters List" data-col="Name" onclick="GoToChapterDetails(' + isNullCheck(data) + ');"></i></span>' +
                        '<span class=spUpdateIcon style="display:none"><i class="fa fa-pen" aria-hidden="true" title="Edit" data-col="Name" onclick="GoToBookDetails(' + isNullCheck(data) + ');"></i></span>' +
                        '<span class=spInfo><i class="fa fa-info-circle" aria-hidden="true" title="Info" data-col="Name" onclick="XMLView(' + isNullCheck(data) + ');"></i></span>' +
                        '</div>';
                }
            }
        ],
        columnDefs: [
            { type: 'date-dd-mmm-yyyy', targets: [9, 10] }
        ],
        "destroy": true,

        fixedHeader: {
            header: true
        },
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'BookStatus' + today.toShortFormatWithTime(),

                title: 'Book Master - ' + $('#BkTabul li.active').text(),
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    format: {
                        header: function (data, row, column, node) {
                            var zheader = data.toString().split('<div class="dropdown')[0];
                            zheader = zheader.toString().split('<i class="fa fa-filter')[0];
                            return zheader.replace('<br>', '');
                        }
                    }
                }
            },
            {
                extend: 'pdfHtml5',
                text: '<img src="../Images/pdf.png" title="Export to PDF" />',
                filename: 'BookStatus' + today.toShortFormatWithTime(),

                title: 'Book Master - ' + $('#BkTabul li.active').text(),
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    format: {
                        header: function (data, row, column, node) {
                            var zheader = data.toString().split('<div class="dropdown')[0];
                            zheader = zheader.toString().split('<i class="fa fa-filter')[0];
                            return zheader.replace('<br>', '');
                        },
                    }
                }

            }

        ],
        "scrollY": (size.height - 220),
        "scrollX": true,
        "createdRow": function (row, data, dataIndex) {
            if (data[12] == 1) //IsWithdrwan
            {
                $(row).css('background-color', '#F78888');
                $(row).attr('title', 'Withdrwan');
                $($(row).find('.spUpdateIcon i')).attr('onclick', '');
            }
            if (data[13] == 1) //Billed
            {
                $(row).css('background-color', '#AAAAF9');
                $(row).attr('title', 'Billed');
                $($(row).find('.spUpdateIcon i')).attr('onclick', '');
            }
            CheckAccessRights();
        },
        drawCallback: function () {
            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                .on('click', function () {
                    CheckAccessRights();
                });
        }
    });

    var start = moment().subtract(29, 'days');
    var end = moment();
}

function XMLView(item) {
    $('#btnWithdraw').css("display", "none");
    $('#btnRevert').css("display", "none");
    $('#btnSurvey').css("display", "none");
    aBookID = item;
    $('#divLoadData').html('Please Wait......');
    $('#divLoadDataTrns').html('');
    $('#btnSave_Activity').hide();
    var data = { zBookID: item }

    $.ajax({
        type: 'post',
        url: $('#hf_GetBookData').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var items = response.aItemList;
            aSurveylistG = response.aSurveyList;//Survey Details for Book

            var zWeeksCt = ' <strong style="float:right"><span class="spTAT">TAT Details</span> ' +
                diff_weeks(FormatDate_IE(FormatDateColumn(items[0].ReceivedDt)), FormatDate_IE(FormatDateColumn(items[0].DueDt))
                ) + ' - Weeks</strong>';

            var ztable = '<table class="tblMain">';
            ztable += '<tr><td>Book ID</td>' + '<td>' + items[0].Number + '</td></tr>';
            ztable += '<tr><td>Publisher</td>' + '<td>' + items[0].Publisher + '</td></tr>';
            ztable += '<tr><td>Catalog</td>' + '<td>' + items[0].Catalog + '</td></tr>';
            ztable += '<tr><td>Title</td>' + '<td>' + items[0].Title + '</td></tr>';
            ztable += '<tr><td>Sub Title</td>' + '<td>' + isNullCheck(items[0].SubTitle) + '</td></tr>';
            ztable += '<tr><td>Edition</td>' + '<td>' + isNullCheck(items[0].Edition) + '</td></tr>';
            ztable += '<tr><td>Type</td>' + '<td>' + items[0].UploadType + '</td></tr>';
            ztable += '<tr><td>Category</td>' + '<td>' + items[0].Category + '</td></tr>';
            ztable += '<tr><td>ISBN</td>' + '<td>' + items[0].ISBN + '</td></tr>';
            ztable += "<tr><td>Proposed Pub date</td><td>" + FormatDateColumn(items[0].DueDt) + zWeeksCt + "</td></tr>";
            ztable += "<tr><td>Author(s) Name</td><td>" + isNullCheck(items[0].AuthorName) + "</td></tr>";
            ztable += "<tr><td>Author(s) Email</td><td><a href='mailto:" + isNullCheck(items[0].AuthorEmail) + "'>" + isNullCheck(items[0].AuthorEmail) + "</a></td></tr>";
            ztable += "<tr><td>Editor(s) Name</td><td>" + isNullCheck(items[0].EditorName) + "</td></tr>";
            ztable += "<tr><td>Editor(s) Email</td><td><a href='mailto:" + isNullCheck(items[0].EditorEmail) + "'>" + isNullCheck(items[0].EditorEmail) + "</a></td></tr>";
            ztable += "<tr><td>PE Name</td><td>" + isNullCheck(items[0].PEName) + " / ";
            ztable += "<a href='mailto:" + isNullCheck(items[0].PEEmail) + "'>" + isNullCheck(items[0].PEEmail) + "</a></td></tr>";
            ztable += "<tr><td>PM Name</td><td>" + isNullCheck(items[0].PMName) + " / ";
            ztable += "<a href='mailto:" + isNullCheck(items[0].PMEmail) + "'>" + isNullCheck(items[0].PMEmail) + "</a></td></tr>";
            ztable += "<tr><td>TSPM Name</td><td>" + isNullCheck(items[0].TSPMName) + " / ";
            ztable += "<a href='mailto:" + isNullCheck(items[0].TSPMEmailID) + "'>" + isNullCheck(items[0].TSPMEmailID) + "</a></td></tr>";
            ztable += "<tr><td><span>Notes<span class='cols-2'>&nbsp;<i class='fa fa-edit' aria-hidden='true' title='Add/Edit Notes' id='spGenNotes' onclick='UpdateGeneralNotes()'></i></span></span></td><td  id='note'><span class='cols-10' id='trNotes'>" + isNullCheck(items[0].Notes) + "</span></td></tr>";

            $('#TxtGeneralNote').val(isNullCheck(items[0].Notes));
            $('#myModal_GeneralNotes .jqte_editor').html(isNullCheck(items[0].Notes));
            ztable += '</table>';

            $('#divLoadData').html(ztable);

            $('[data-toggle="tooltikp"]').tooltip();

            if (items[0].IsDeleted == 0) {

                $('#btnWithdraw').css("display", "block");
                $('#btnRevert').css("display", "none");
            }
            else {

                $('#btnWithdraw').css("display", "none");
                $('#btnRevert').css("display", "block");
            }

            if (items[0].IsCompleted == 0) {
                $('#btnSurvey').css("display", "none");
            }
            else {
                $('#btnSurvey').css("display", "block");
            }

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
                    if ($(this).find('td')[4].innerText.trim() == '' && zcheckCur == 0) {
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
    ActvieTab(1);

    $("#myModal").modal({ backdrop: 'static', keyboard: false });
}

function BookWithdraw(ZType) {
    $('#divWithdrawnData').html('');

    var Type = "";
    aWithdrawType = ZType;

    $.ajax({
        type: 'post',
        url: $('#hf_GetWithdrawnData').val(),
        data: { zBookID: aBookID },
        datatype: 'json',
        success: function (response) {

            items = response.aWithdrawnList;
            if (items.length > 0) {
                var ztable = "<table id='tblWithdrawnList' class='tblTrans'><tr><th>Date</th><th>Type</th><th>Reason</th></tr>";
                for (var i = 0; i < items.length; i++) {

                    ztable += "<tr>";
                    ztable += "<td width='15%'>" + FormatDateColumn(items[i].ModifiedDt) + "</td>";
                    if (items[i].ColumnName == "WithdrawReason") {
                        ztable += "<td width='10%'>Withdraw</td>";
                    }
                    else {
                        ztable += "<td width='10%'>Revert</td>";
                    }
                    ztable += "<td>" + items[i].NewValue + "</td>";
                    ztable += "</tr>";
                }
                ztable += "</table><br>"

                $('#divWithdrawnData').html(ztable);
            }



        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 2000,
            });
        }
    });

    if (ZType == "Withdraw") {
        //Type = "Are you sure to withdraw?";
        $('#lblWithdraw').text('Are you sure to withdraw?');
    }
    else {
        //Type = "Are you sure to revert?";
        $('#lblWithdraw').text('Are you sure to revert?');
    }
    $('#myModal_Withdraw .jqte_editor').html('');
    $("#myModal_Withdraw").modal({ backdrop: 'static', keyboard: false });
}

function BookDelete(id, form) {
    bootbox.confirm("Are you sure to withdraw?",
        function (result) {
            if (result) {
                var data = { zBookID: id, zType: 'Delete' }
                $.ajax({
                    type: 'post',
                    url: $('#hf_BookDelete').val(),
                    data: data,
                    datatype: 'json',
                    success: function (response) {
                        if (response.toString().indexOf('Error') != -1) {
                            $.bootstrapGrowl(response, {
                                type: 'danger',
                                delay: 2000,
                            });
                        }
                        else {
                            $.bootstrapGrowl(response, {
                                type: 'info',
                                delay: 2000,
                            });
                            location.reload(true);
                        }

                    },
                    error: function (response) {
                        $.bootstrapGrowl(response, {
                            type: 'danger',
                            delay: 2000,
                        });

                    }
                });
            }

        });


}

function UpdateGeneralNotes() {
    $('#TxtGeneralNote').val(isNullCheck($('#trNotes').html()));
    $('#myModal_GeneralNotes .jqte_editor').html(isNullCheck($('#trNotes').html()));

    $("#myModal_GeneralNotes").modal({ backdrop: 'static', keyboard: false });
}

function CustomFilter(start, end) {
    var date;
    if (typeof end !== "undefined") {
        var date = new Date(start);

        var zStDate = (date.getDate() + '-' + month_names[date.getMonth()] + '-' + date.getFullYear());
        date = new Date(end);
        var zEtDate = (date.getDate() + '-' + month_names[date.getMonth()] + '-' + date.getFullYear());

        if ($(this)["0"].element[0].id == "ReceivedDate") {
            CF_RecFromDt = zStDate;
            CF_RecToDt = zEtDate;
        }

        else if ($(this)["0"].element[0].id == "PublishDate") {
            CF_PubFromDt = zStDate;
            CF_PubToDt = zEtDate;
        }

    }
    var zFilterType = "";
    if (start == 2) {
        zFilterType = "PEList";
    }
    else if (start == 4) {
        zFilterType = "CatalogList";
    }
    else if (start == 6) {
        zFilterType = "BookTypeList";
    }
    else if (start == 8) {
        zFilterType = "BookCategoryList";
    }
    else if (start == 10) {
        zFilterType = "PMList";
    }
    else if (start == 12) {
        zFilterType = "Status";
    }
    else if (start == 14) {
        zFilterType = "Billed";
    }
    CF_Billed = ($("input#chkIsBilled")[0].checked ? 1 : 0);


    if (start == 10 && $('#ddlPMListFilter').val() == "Select") {
        $.bootstrapGrowl('Select PM', {
            type: 'warning',
            delay: 2000,
        });
        return false;
    }
    else if (start == 8 && $('#ddlBookCategoryListFilter').val() == "Select") {
        $.bootstrapGrowl('Select Book Category', {
            type: 'warning',
            delay: 2000,
        });
        return false;
    }
    else if (start == 6 && $('#ddlBookTypeListFilter').val() == "Select") {
        $.bootstrapGrowl('Select Book Type', {
            type: 'warning',
            delay: 2000,
        });
        return false;
    }
    else if (start == 4 && $('#ddlCatalogListFilter').val() == "Select") {
        $.bootstrapGrowl('Select Catalog', {
            type: 'warning',
            delay: 2000,
        });
        return false;
    }
    else if (start == 2 && $('#ddlPEListFilter').val() == "Select") {
        $.bootstrapGrowl('Select PE', {
            type: 'warning',
            delay: 2000,
        });
        return false;
    }
    else if (start == 12 && $('#ddlStatusFilter').val() == "Select") {
        $.bootstrapGrowl('Select Status', {
            type: 'warning',
            delay: 2000,
        });
        return false;
    }
    else if (start == 1) {
        CF_PEG = null;
        custFilterList.splice($.inArray('PEList', custFilterList), 1);
    }
    else if (start == 3) {
        CF_CatalogG = null;
        custFilterList.splice($.inArray('CatalogList', custFilterList), 1);
    }
    else if (start == 5) {
        CF_BookTypeG = null;
        custFilterList.splice($.inArray('BookTypeList', custFilterList), 1);
    }
    else if (start == 7) {
        CF_BookCategoryG = null;
        custFilterList.splice($.inArray('BookCategoryList', custFilterList), 1);
    }
    else if (start == 9) {
        CF_PMG = null;
        custFilterList.splice($.inArray('PMList', custFilterList), 1);
    }
    else if (start == 11) {
        CF_StatusG = null;
        custFilterList.splice($.inArray('Status', custFilterList), 1);
    }
    else if (start == 14) {
        CF_RecFromDt = null;
        CF_RecToDt = null;
        custFilterList.splice($.inArray('ReceivedDate', custFilterList), 1);
    }
    else if (start == 15) {
        CF_PubFromDt = null;
        CF_PubToDt = null;
        custFilterList.splice($.inArray('PublishDate', custFilterList), 1);
    }
    else if (start == 17) {
        CF_Billed = 2;
        custFilterList.splice($.inArray('Billed', custFilterList), 1);
    }
}

function GoToBookDetails(zBookID, Page) {

    if (Page === undefined) {
        Page = "Master";
    }
    window.location.href = 'Manipulation?id=' + zBookID + '&page=' + Page;
}

function GoToChapterDetails(zBookID) {
    $('#LoadingImage').show();
    var data = { BookID: zBookID };
    $.ajax({
        type: 'get',
        url: $('#hf_GetChapterMaster').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechChapterData(response.aitemList)
            $('#LoadingImage').hide();
            var dt = $('#tblChapter').DataTable();
            setTimeout(function () {
                $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
            }, 200);
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 2000,
            });
            $('#LoadingImage').hide();
        }
    });
    //$('#myModal_View').modal({ backdrop: 'static', keyboard: false });

}

function FetechChapterData(ItemsList) {
    dataSet = [];
    var items = ItemsList;
    var zCtInP = 0;
    var zCtCom = 0;
    chaptNumbers = [];
    $.each(items, function (index) {
        var zindexL = 0;
        zCtInP += 1;
        zindexL = zCtInP;
        var t = [
            zindexL.toString(),
            $(this)[0]["Number"],
            $(this)[0]["Title"],
            $(this)[0]["MSPages"],
            $(this)[0]["ColorFig"],
            $(this)[0]["Tables"],
            $(this)[0]["AuthorName"],
            $(this)[0]["AuthorEmail"],
            $(this)[0]["ID"]
        ];
        dataSet.push(t);

        if ($(this)[0]["Number"].indexOf("C") == 0) {
            cNumber = parseInt(($(this)[0]["Number"]).split('C')[1]);
            chapterCount++;
        }

        chaptNumbers.push($(this)[0]["Number"]);
    });

    if (items.length == 0)
        chapterCount = 0;

    LoadChapterData();
}

function LoadChapterData() {
    var table = $('#tblChapter').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
        data: dataSet,
        columns: [
            { title: "S.No." },
            { title: "Number" },
            { title: "Title" },
            { title: "MS Pages" },
            { title: "Figures" },
            { title: "Tables" },
            { title: "Author Name " },
            { title: "Author Email" },
            {
                title: "Actions", "bSortable": false,
                "render": function (data, type, full, meta) {
                    return '<div class="divBkAction">' +
                        '<span class="spUpdateIcon"><i class="fa fa-pen" aria-hidden="true" title="Edit" data-col="Name" onclick="UpdateChapter(' + isNullCheck(data) + ');"></i></span></div>';
                }
            }
        ],
        "destroy": true,
        fixedHeader: {
            header: true
        },
        buttons: [
            {
                text: '<i class="fa fa-plus-square" aria-hidden="true" style="color: #1d6680!important;font-size: 22px;line-height: 25px;"></i>',

                action: function (e, dt, node, config) {
                    AddChapterInfo(aBookID);
                }
            },
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'Chapter' + today.toShortFormatWithTime(),
                title: 'Chapter List',
                exportOptions: {
                    columns: ':visible',
                    format: {
                        header: function (data, row, column, node) {
                            var zheader = data.toString().split('<div class="dropdown')[0];
                            zheader = zheader.toString().split('<i class="fa fa-filter')[0];
                            return zheader.replace('<br>', '');
                        }
                    }
                }
            },
            {
                extend: 'pdfHtml5',
                text: '<img src="../Images/pdf.png" title="Export to PDF" />',
                filename: 'Chapter' + today.toShortFormatWithTime(),
                title: 'Chapter List',
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: ':visible',
                    format: {
                        header: function (data, row, column, node) {
                            var zheader = data.toString().split('<div class="dropdown')[0];
                            zheader = zheader.toString().split('<i class="fa fa-filter')[0];
                            return zheader.replace('<br>', '');
                        },
                    }
                }
            }
        ],
        "scrollY": (size.height - 320),
        "scrollX": true,
    });

    var table1 = $('#tblChapter').DataTable();
    table1.draw();
}

function UpdateChapter(chaptId) {
    $.ajax({
        type: 'GET',
        url: $('#hf_UpdateChapterInfo').val(),
        data: { Id: chaptId },
        success: function (response) {
            $("#chapterInfo").html(response);

            $('#myModal_Chapter_Info').modal('show');
            if ($('#Number').val() != "") {
                $('#Number').prop('disabled', 'disabled');
            }
            else {
                $('#Number').prop('disabled', false);
            }
        }, error: function (err) {

        }
    })
}

function ShowBookMaster(zID, itemP) {
    $('.BookView').hide();
    $('#' + zID).show();
    if (zID == 'DivListView')
        $('.divBookContent').css('overflow', 'hidden');
    else
        $('.divBookContent').css('overflow', 'auto');

    var table = $('#example').DataTable();
    table.draw();
    CheckAccessRights();
    $('.iright').css('color', '#1d2c99');
    $('.iright').css('cursor', 'pointer');
    $('#' + itemP).css('color', '#2196f3');
    $('#' + itemP).css('cursor', 'not-allowed');
}

$(document).ready(function () {
    $('body').click(function (e) {
        if (e.target.closest('.spBookAction') == null)
            $('.dropdown-menu').hide(300);
    });
});

function ActvieTab(aitem) {
    if (aitem == '1') {
        $('#BkInfoTabul li').removeClass('active');
        $('#BkInfoTabul li:first').addClass('active in');
        $('.tab-content div.tab-pane').removeClass('active');
        $('#BkInfo').addClass('active in');
    }
    if (aitem == '2') {
        $('#BkInfoTabul li').removeClass('active');
        $('#BkInfoTabul li:nth-child(2)').addClass('active in');
        $('.tab-content div.tab-pane').removeClass('active');
        $('#ChapInfo').addClass('active in');
    }

    if (aitem == '3') {
        $('#BkInfoTabul li').removeClass('active');
        $('#BkInfoTabul li:nth-child(2)').addClass('active in');
        $('.tab-content div.tab-pane').removeClass('active');
        $('#ActInfo').addClass('active in');
    }
}

//Activity Info
$(function () {
    $("#spAddActivity").click(function () {
        AddActivityRow();
    });

    $("#divActivityInfo").click(function () {
        $('#btnSave_Activity').show();

        ActivityData();
    });

    $('#btnSave_Activity').click(function () {
        UpdateActivityData();
    })

    $("#spPDFReport").click(function () {
        $("#LoadingImage").show();
        var data = { zBookID: aBookID };
        $.ajax({
            type: 'post',
            url: $('#hf_WeeklyReport').val(),
            data: data,
            datatype: 'json',
            traditional: true,
            success: function (data) {

                if (data != "No Data Found!") {
                    //window.location.href = "../Source/WeeklyReport/" + aBookID + ".pdf";
                    $('<a href="' + '../Source/WeeklyReport/' + aBookID + '.pdf' + '" target="_blank">External Link</a>')[0].click();
                }
                else {
                    $.bootstrapGrowl('Kindly Set Workflow/Milestone in Workflow! ', {
                        type: 'danger', delay: 5000,
                    });
                }

                $("#LoadingImage").hide();
            }, error: function (err) {

                $("#LoadingImage").hide();
            }
        });
    });
});

function UpdateActivityData() {
    var IsValid = Validate();
    if (!IsValid)
        return false;
    $('#LoadingImage').show();

    var getActivityList = [];
    getActivityList = GetTableRowToList('tblActList');
    //if (getActivityList.length == 0) {
    //    $.bootstrapGrowl('Add Activity ! ', {
    //        type: 'danger', delay: 5000,
    //    });
    //    return false;
    //}
    var data = {
        zBookID: aBookID,

        ActivityL: getActivityList
    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateActivity').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            $.bootstrapGrowl(response, {
                type: 'info',
                delay: 5000,
            });
            //$('#myModal').modal('hide');
            $('#LoadingImage').hide();

        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });

        }

    });
}

function ActivityData() {
    $('#LoadingImage').show();

    var aId = aBookID;
    var data = { nBookID: aId };
    $.ajax({
        type: 'post',
        url: $('#hf_GetActivityInfo').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var items = response.aitemList;

            var ztable = "<table id='tblActList' class='tblTrans' ><thead><tr><th>S.No.</th><th>Date</th><th>Activity Notes</th><th>#</th></tr></thead>";

            if (items.length > 0) {
                $.each(items, function (i, e) {
                    ztable += "<tr>";
                    ztable += "<td width='4%;'>" + (i + 1).toString() + "</td>";

                    ztable += "<td width='13%;' data-id='" + FormatDateColumn(items[i].Act_Date) + "'><input id='txtDueDt'  readonly type='text' class='form-control TxtDate ActDt inputHandCursor' value='" + FormatDateColumn(items[i].Act_Date) + "'  /></td>";
                    ztable += "<td width='80%;' data-id='" + items[i].Activity + "'><input type='text' class='form-control TxtActivity' maxlength='250' value='" + items[i].Activity + "' /></td>";
                    ztable += "<td width='3%' style='text-align:center'><i class='fas fa-trash' onclick='ActivityDelete(this);'></i></td>";
                    ztable += "</tr>";



                })

                ztable += "</table>";

                $('#DivActivityList').html(ztable);

                $('#DivActivityList').css('height', size.height - 210);
                $('#tblWFList').css('cursor', 'move');

                $('#LoadingImage').hide();
            }
            else {


                var ztable = "<table id='tblActList' class='tblTrans'><thead><tr><th width='4%'>S.No.</th><th width='13%'>Date</th><th width='80%;'>Activity Notes</th><th width='3%;'>#</th></tr></thead><tbody></tbody></table>";
                ztable += "<br/><center><b><span id='lbldata'>No Data Found...</span></b></center>";
                $('#DivActivityList').html(ztable);
                $('#LoadingImage').hide();
            }

            $('.ActDt').datetimepicker({
                format: 'd M Y',
                beforeShowDay: noWeekendsOrHolidays,
                timepicker: false,
                scrollMonth: false,
                scrollInput: false
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


    ActvieTab(3);

    $("#myModal").modal({ backdrop: 'static', keyboard: false });



}

function AddActivityRow() {
    $('#lbldata').hide();
    if (!Validate())
        return false;


    var zRowLenth = $("#tblActList").find("tr").length;
    var nRowL = "<tr><td width='4%'>" + zRowLenth.toString() + "</td>"
        + "<td width='13%;'><input type='text' readonly class='form-control TxtDate ActDt inputHandCursor'/></td>"
        + "<td width='80%;'><input type='text' maxlength='250' class='form-control TxtActivity' onchange='checkActivity(this)'/></td>"
        + "<td width='3%' style='text-align: center'><i class='fas fa-trash' onclick='ActivityDelete(this);'></i></td>"
        + "</tr>";
    $("#tblActList tbody").append(nRowL);



    $('.ActDt').datetimepicker({
        format: 'd M Y',
        beforeShowDay: noWeekendsOrHolidays,
        timepicker: false,
        scrollMonth: false,
        scrollInput: false
    });

}

function checkActivity(aitemL) {

    var zChkVal = true;
    $.each($("#tblActList tbody tr"), function (e) {
        var zPreVal = $(this).find('td')[1].innerText;
        if ($(this).find('td').find('.TxtActivity').length > 0 && (e != $("#tblActList tbody tr").length - 1)) {
            zPreVal = $(this).find('td').find('.TxtActivity').val();
        }
        if (zPreVal == $(aitemL).val()) {
            $.bootstrapGrowl('Already Activity Added!', {
                type: 'danger',
                delay: 5000,
            });
            $(this).remove();
            zChkVal = false;
            return false;
        }
    });


}

function ActivityDelete(btndel) {
    var aId = $(btndel).closest('tr').find('td')[1].innerText;
    bootbox.confirm("Are you sure to Delete ?",
        function (result) {
            if (result) {

                $(btndel).closest("tr").remove();
                $("table#tblActList tbody").each(function () {
                    $(this).children().each(function (index) {
                        $(this).find('td').first().html(index + 1);


                    });
                });
                //DeleteActDetails(aId);

            }
        });

}

//function DeleteActDetails(aid) {


//    var data = { nID: aid }
//    $.ajax({
//        type: 'post',
//        url: $('#hf_DeleteActivity').val(),
//        data: data,
//        datatype: 'json',
//        traditional: true,
//        success: function (response) {
//            $.bootstrapGrowl(response, {
//                type: 'info',
//                delay: 5000,
//            });
//            ActivityData();
//            $('#LoadingImage').hide();
//        },
//        error: function (response) {
//            $.bootstrapGrowl(response, {
//                type: 'danger',
//                delay: 5000,
//            });
//            $('#LoadingImage').hide();
//        }
//    });

//}

function Validate() {
    var aResultL = true;


    if (aResultL) {
        var aActDate = $($("#tblActList").find("tr")).find('.TxtDate');
        $.each(aActDate, function () {
            if ($(this).val() == "") {
                $.bootstrapGrowl('Enter Date!', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
        });
    }

    else if (aResultL) {
        var aActivityList = $($("#tblActList").find("tr")).find('.TxtActivity');
        $.each(aActivityList, function () {
            if ($(this).val() == "") {
                $.bootstrapGrowl('Enter Activity!', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
        });


    }

    return aResultL;
}
