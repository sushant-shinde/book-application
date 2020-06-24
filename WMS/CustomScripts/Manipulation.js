//var Holidays = ["2019-07-05"];
var OutSource = "";
$(function () {
    clearForm('#FormBookInfo');
    $('#TxtGeneralNote').jqte();
    $('.jqte_editor').css('height', size.height - 485);
    $('#txtCatalog').change(function (e) {

        var id = GetParameterValues('id');
        var Page = GetParameterValues('page');
        CheckExistingData($(this).val(), id, 'Catalog');
    });
    $('#txtISBN').change(function (e) {

        var id = GetParameterValues('id');
        var Page = GetParameterValues('page');
        CheckExistingData($(this).val(), id, 'ISBN');
    });
    $('#txtPBISBN').change(function (e) {

        var id = GetParameterValues('id');
        var Page = GetParameterValues('page');
        CheckExistingData($(this).val(), id, 'PBISBN');
    });
    $('#txtEbookISBN').change(function (e) {

        var id = GetParameterValues('id');
        var Page = GetParameterValues('page');
        CheckExistingData($(this).val(), id, 'EbookISBN');
    });
    $('#txtWebISBN').change(function (e) {

        var id = GetParameterValues('id');
        var Page = GetParameterValues('page');
        CheckExistingData($(this).val(), id, 'WebISBN');
    });
    $('#txtEpubISBN').change(function (e) {

        var id = GetParameterValues('id');
        var Page = GetParameterValues('page');
        CheckExistingData($(this).val(), id, 'EPubISBN');
    });
    $('#txtMobiISBN').change(function (e) {

        var id = GetParameterValues('id');
        var Page = GetParameterValues('page');
        CheckExistingData($(this).val(), id, 'MobiISBN');
    });

    GetHolidays();

    $('#FormBookInfo').css('height', size.height - 150);
    $('#ddlPublisherList').select2({ placeholder: "Select" });
    //$('#ddlPlatform').select2({ placeholder: "Select" });
    $('#ddlType').select2({ placeholder: "Select" });
    $('#ddlOrigin,#ddlSkipPA').select2({ placeholder: "Select" });
    //$('#ddlCategory').select2({ placeholder: "Select" });
    $('#ddlSubject').select2({ placeholder: "Select", allowClear: true, tags: true });
    $('#ddlEdition').select2({ placeholder: "Select", allowClear: true, tags: true });
    $('#ddlProcess').select2({ placeholder: "Select", allowClear: true, tags: true });
    $('#ddlPlatform').select2({ placeholder: "Select", allowClear: true, tags: true });
    $('#ddlCategory').select2({ placeholder: "Select", allowClear: true, tags: true });
    $('#ddlPEList').select2({ placeholder: "Select" });
    $('#ddlPMList').select2({ placeholder: "Select" });
    $('#ddlWorkflow').select2({ placeholder: "Select" });
    $('#ddlTSPMList').select2({ placeholder: "Select" });
    $('#lstOutsource').select2({
        closeOnSelect: false,
        //placeholder: "Select Outsource(s)",
        allowHtml: true,
        allowClear: true,
        //tags: true
    });
    //$('#txtReceivedDt').datepicker()
    $('#txtReceivedDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        maxDate: today
    });
    $('#txtDueDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        beforeShowDay: noWeekendsOrHolidays
    });

    clearForm('#FormBookInfo');

    var id = GetParameterValues('id');
    GetBookDetails(id);

    $('#btnUpdate').click(function () {
        var id = GetParameterValues('id');
        var Page = GetParameterValues('page');
        SaveUpdateBookInfo(id, Page);
    });
    $('#btnCancel').click(function () {

        var Page = GetParameterValues('page');

        if (Page == 'NewBook') {
            window.location.href = 'NewBook';
        }
        else {
            window.location.href = 'Index';
        }
    });

    $('#ddlType').change(function () {
        if ($(this).val() == "Mono") {
            $("#txtEditorName").attr("disabled", true);
            $("#txtEditorEmail").attr("disabled", true);
            $("#txtAuthorName").attr("disabled", false);
            $("#txtAuthorEmail").attr("disabled", false);
            $("#txtEditorName").val('');
            $("#txtEditorEmail").val('');
        }
        else if ($(this).val() == "Contribute") {
            $("#txtAuthorName").attr("disabled", true);
            $("#txtAuthorEmail").attr("disabled", true);
            $("#txtEditorName").attr("disabled", false);
            $("#txtEditorEmail").attr("disabled", false);
            $("#txtAuthorName").val('');
            $("#txtAuthorEmail").val('');
        }

    });
    $('#ddlPublisherList').change(function () {
        var data = { PublisherID: $('#ddlPublisherList').val() };
        $.ajax({
            type: 'post',
            url: $('#hf_GetOutSourceList').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var items = response;
                $("#lstOutsource").empty();
                for (var i = 0; i < items.length; i++) {
                    $("#lstOutsource").append("<option value='" + items[i].Value + "'>" + items[i].Text + "</option>");
                }
                if (OutSource != "") {
                    try {
                        var data = OutSource.split(',');
                        var selectedValues = new Array();
                        try {
                            for (var i = 0; i < data.length; i++) {
                                selectedValues[i] = data[i];
                            }
                        } catch (e) { }

                        $('#lstOutsource').val(selectedValues).change();

                    } catch (e) {
                        $('#lstOutsource').val(-1).change();
                    }
                }

            },
            error: function (result) {
                $.bootstrapGrowl('Error Occured, Try Again !', {
                    type: 'danger',
                    delay: 5000,
                });
                $('#LoadingImage').hide();
            }
        });
    });

});


function SaveUpdateBookInfo(id, page) {
    var validate = ValidateForm('#FormBookInfo', id);
    if (validate) {

        $('#LoadingImage').show();
        var aitemInfoP = {
            Title: $('#txtTitle').val(), Catalog: $('#txtCatalog').val(), ISBN: $('#txtISBN').val(), PublisherID: $('#ddlPublisherList').val(),
            Platform: $('#ddlPlatform').val(), AuthorName: $('#txtAuthorName').val(), ReceivedDt: $('#txtReceivedDt').val(), DueDt: $('#txtDueDt').val(),
            AuthorEmail: $('#txtAuthorEmail').val(), EditorName: $('#txtEditorName').val(), EditorEmail: $('#txtEditorEmail').val(),
            PEName: $('#ddlPEList').val(), PMName: $('#ddlPMList').val(), SeriesTitle: $('#txtSeriesTitle').val(),
            UploadType: $('#ddlType').val(), Category: $('#ddlCategory').val(), Subject: $('#ddlSubject').val(),
            EbookISBN: $('#txtEbookISBN').val(), WebISBN: $('#txtWebISBN').val(), EpubISBN: $('#txtEpubISBN').val(), MobiISBN: $('#txtMobiISBN').val(),
            Edition: $('#ddlEdition').val(), Workflow: $('#ddlProcess').val(), SubTitle: $('#txtSubTitle').val(),
            Outsource: ($('#lstOutsource').val() == null ? '' : $('#lstOutsource').val().toString()),
            TSPM: $('#ddlTSPMList').val(), ImgPath: $('#imgcover').attr('src'), PBISBN: $('#txtPBISBN').val(),
            SeriesEditorName: $('#txtSeriesEditorName').val(), Notes: $('#TxtGeneralNote').val(),
            Origin: $('#ddlOrigin').val(),
            SkipPA: $('#ddlSkipPA').val(),
            ID: id
        }

        $.ajax({
            type: 'post',
            url: $('#hf_BookInfoUpdate').val(),
            data: JSON.stringify(aitemInfoP),
            contentType: 'application/json;charset=utf-8',
            datatype: 'json',
            success: function (response) {
                if (response.toString().indexOf('Error') != -1) {
                    $.bootstrapGrowl(response, {
                        type: 'danger',
                        delay: 2000,
                    });
                    if (page == 'NewBook') {
                        window.location.href = 'NewBook';
                    }
                    else {
                        window.location.href = 'Index';
                    }
                }
                else {
                    $.bootstrapGrowl(response, {
                        type: 'info',
                        delay: 2000,
                    });
                    clearForm('#FormUserInfo');
                }
                $('#LoadingImage').hide();



            },
            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 2000,
                });
                $('#LoadingImage').hide();
            }
        });
    }
};

function ValidateForm(form, id) {

    var zResult = true;
    var ReceivedDt = FormatDate_IE($("#txtReceivedDt").val()); //2013-09-5
    var DueDt = FormatDate_IE($("#txtDueDt").val()); //2013-09-10
    if ($('#txtCatalog').val() == '') {
        $.bootstrapGrowl('Enter Catalog !', { type: 'danger', delay: 2000, });
        $('#txtCatalog').focus();
        zResult = false;
    }

    else if ($('#txtTitle').val() == '') {
        $.bootstrapGrowl("Enter Title !", { type: 'danger', delay: 2000, });
        $('#txtTitle').focus();
        zResult = false;
    }
    else if (($('#txtISBN').val() == '') && ($('#ddlPublisherList').val() != 45) && ($('#ddlPublisherList').val() != 61) && ($('#ddlPublisherList').val() != 74)) {
        $.bootstrapGrowl("Enter ISBN !", { type: 'danger', delay: 2000, });
        $('#txtISBN').focus();
        zResult = false;
    }
    else if (($('#txtISBN').val() != '') && $('#txtISBN').val().substring(0, 3) != '978') {
        $.bootstrapGrowl("ISBN should start with 978 !", { type: 'danger', delay: 2000, });
        $('#txtISBN').focus();
        zResult = false;
    }
    else if (($('#txtISBN').val() != '') && $('#txtISBN').val().length != 13) {
        $.bootstrapGrowl("ISBN should be 13 digit !", { type: 'danger', delay: 2000, });
        $('#txtISBN').focus();
        zResult = false;
    }
    else if (($('#txtPBISBN').val() != '') && $('#txtPBISBN').val().substring(0, 3) != '978') {
        $.bootstrapGrowl("PB ISBN should start with 978 !", { type: 'danger', delay: 2000, });
        $('#txtPBISBN').focus();
        zResult = false;
    }
    else if (($('#txtPBISBN').val() != '') && $('#txtPBISBN').val().length != 13) {
        $.bootstrapGrowl("PB ISBN should be 13 digit !", { type: 'danger', delay: 2000, });
        $('#txtPBISBN').focus();
        zResult = false;
    }
    else if (($('#txtEbookISBN').val() != '') && $('#txtEbookISBN').val().substring(0, 3) != '978') {
        $.bootstrapGrowl("Ebook ISBN should start with 978 !", { type: 'danger', delay: 2000, });
        $('#txtEbookISBN').focus();
        zResult = false;
    }
    else if (($('#txtEbookISBN').val() != '') && $('#txtEbookISBN').val().length != 13) {
        $.bootstrapGrowl("Ebook ISBN should be 13 digit !", { type: 'danger', delay: 2000, });
        $('#txtEbookISBN').focus();
        zResult = false;
    }
    else if (($('#txtWebISBN').val() != '') && $('#txtWebISBN').val().substring(0, 3) != '978') {
        $.bootstrapGrowl("Web ISBN should start with 978 !", { type: 'danger', delay: 2000, });
        $('#txtWebISBN').focus();
        zResult = false;
    }
    else if (($('#txtWebISBN').val() != '') && $('#txtWebISBN').val().length != 13) {
        $.bootstrapGrowl("Web ISBN should be 13 digit !", { type: 'danger', delay: 2000, });
        $('#txtWebISBN').focus();
        zResult = false;
    }
    else if (($('#txtEpubISBN').val() != '') && $('#txtEpubISBN').val().substring(0, 3) != '978') {
        $.bootstrapGrowl("Epub ISBN should start with 978 !", { type: 'danger', delay: 2000, });
        $('#txtEpubISBN').focus();
        zResult = false;
    }
    else if (($('#txtEpubISBN').val() != '') && $('#txtEpubISBN').val().length != 13) {
        $.bootstrapGrowl("Epub ISBN should be 13 digit !", { type: 'danger', delay: 2000, });
        $('#txtEpubISBN').focus();
        zResult = false;
    }
    else if (($('#txtMobiISBN').val() != '') && $('#txtMobiISBN').val().substring(0, 3) != '978') {
        $.bootstrapGrowl("Mobi ISBN should start with 978 !", { type: 'danger', delay: 2000, });
        $('#txtMobiISBN').focus();
        zResult = false;
    }
    else if (($('#txtMobiISBN').val() != '') && $('#txtMobiISBN').val().length != 13) {
        $.bootstrapGrowl("Mobi ISBN should be 13 digit !", { type: 'danger', delay: 2000, });
        $('#txtMobiISBN').focus();
        zResult = false;
    }
    else if (($('#txtISBN').val() != '') && (($('#txtISBN').val() == $('#txtEbookISBN').val()) || ($('#txtISBN').val() == $('#txtWebISBN').val()) || ($('#txtISBN').val() == $('#txtEpubISBN').val()) || ($('#txtISBN').val() == $('#txtMobiISBN').val()))) {
        $.bootstrapGrowl("Enter Correct ISBN !", { type: 'danger', delay: 2000, });
        $('#txtISBN').focus();
        zResult = false;

    }

    else if (($('#txtEbookISBN').val() != '') && (($('#txtISBN').val() == $('#txtEbookISBN').val()) || ($('#txtEbookISBN').val() == $('#txtWebISBN').val()) || ($('#txtEbookISBN').val() == $('#txtEpubISBN').val()) || ($('#txtEbookISBN').val() == $('#txtMobiISBN').val()))) {
        $.bootstrapGrowl("Enter Correct E-book ISBN !", { type: 'danger', delay: 2000, });
        $('#txtISBN').focus();
        zResult = false;

    }

    else if (($('#txtWebISBN').val() != '') && (($('#txtISBN').val() == $('#txtWebISBN').val()) || ($('#txtEbookISBN').val() == $('#txtWebISBN').val()) || ($('#txtWebISBN').val() == $('#txtEpubISBN').val()) || ($('#txtWebISBN').val() == $('#txtMobiISBN').val()))) {
        $.bootstrapGrowl("Enter Correct Web ISBN !", { type: 'danger', delay: 2000, });
        $('#txtISBN').focus();
        zResult = false;

    }

    else if (($('#txtEpubISBN').val() != '') && (($('#txtISBN').val() == $('#txtEpubISBN').val()) || ($('#txtEbookISBN').val() == $('#txtEpubISBN').val()) || ($('#txtWebISBN').val() == $('#txtEpubISBN').val()) || ($('#txtEpubISBN').val() == $('#txtMobiISBN').val()))) {
        $.bootstrapGrowl("Enter Correct E-pub ISBN !", { type: 'danger', delay: 2000, });
        $('#txtISBN').focus();
        zResult = false;

    }

    else if (($('#txtMobiISBN').val() != '') && (($('#txtISBN').val() == $('#txtMobiISBN').val()) || ($('#txtEbookISBN').val() == $('#txtMobiISBN').val()) || ($('#txtWebISBN').val() == $('#txtMobiISBN').val()) || ($('#txtEpubISBN').val() == $('#txtMobiISBN').val()))) {
        $.bootstrapGrowl("Enter Correct Mobi ISBN !", { type: 'danger', delay: 2000, });
        $('#txtISBN').focus();
        zResult = false;

    }
    else if ($('#ddlPublisherList').val() == null) {
        $.bootstrapGrowl("Select Publisher !", { type: 'danger', delay: 2000, });
        $('#ddlPublisherList').focus();
        zResult = false;
    }
    else if ($('#ddlPlatform').val() == null) {
        $.bootstrapGrowl("Select Platform !", { type: 'danger', delay: 2000, });
        $('#ddlPlatform').focus();
        zResult = false;
    }
    else if ($('#txtReceivedDt').val() == '') {
        $.bootstrapGrowl("Enter Received Date !", { type: 'danger', delay: 2000, });
        $('#txtReceivedDt').focus();
        zResult = false;
    }
    else if ($('#txtDueDt').val() == '') {
        $.bootstrapGrowl("Enter Due Date !", { type: 'danger', delay: 2000, });
        $('#txtDueDt').focus();
        zResult = false;
    }
    else if (new Date(ReceivedDt) >= new Date(DueDt)) {
        $.bootstrapGrowl("Due date should be greater than Received date !", { type: 'danger', delay: 2000, });
        $('#txtDueDt').focus();
        zResult = false;
    }
        //else if (new Date(DueDt) < new Date()) {
        //    $.bootstrapGrowl("Due date should be greater than Current date !", { type: 'danger', delay: 2000, });
        //    $('#txtDueDt').focus();
        //    zResult = false;
        //}
    else if ($('#ddlPEList').val() == null) {
        $.bootstrapGrowl("Select PE Name !", { type: 'danger', delay: 2000, });
        $('#ddlPEList').focus();
        zResult = false;
    }
    else if ($('#ddlPMList').val() == null) {
        $.bootstrapGrowl("Select PM Name !", { type: 'danger', delay: 2000, });
        $('#ddlPMList').focus();
        zResult = false;
    }
    else if ($('#ddlTSPMList').val() == null) {
        $.bootstrapGrowl("Select TSPM Name !", { type: 'danger', delay: 2000, });
        $('#ddlTSPMList').focus();
        zResult = false;
    }
    else if ($('#ddlSubject').val() == null) {
        $.bootstrapGrowl("Select Subject !", { type: 'danger', delay: 2000, });
        $('#ddlSubject').focus();
        zResult = false;
    }
    else if ($('#ddlEdition').val() == null) {
        $.bootstrapGrowl("Select Edition !", { type: 'danger', delay: 2000, });
        $('#ddlEdition').focus();
        zResult = false;
    }
    else if ($('#ddlProcess').val() == null) {
        $.bootstrapGrowl("Select Process !", { type: 'danger', delay: 2000, });
        $('#ddlProcess').focus();
        zResult = false;
    }
    else if ($('#txtAuthorEmail').val() != '') {

        if (IsEmail($('#txtAuthorEmail').val()) == false) {
            $.bootstrapGrowl("Author Email is invalid !", { type: 'danger', delay: 2000, });
            $('#txtAuthorEmail').focus();
            zResult = false;
        }

    }
    else if ($('#txtEditorEmail').val() != '') {

        if (IsEmail($('#txtEditorEmail').val()) == false) {
            $.bootstrapGrowl("Editor Email is invalid !", { type: 'danger', delay: 2000, });
            $('#txtEditorEmail').focus();
            zResult = false;
        }
    }
    else if ($('#ddlCategory').val() == null) {
        $.bootstrapGrowl("Select Workflow !", { type: 'danger', delay: 2000, });
        $('#ddlCategory').focus();
        zResult = false;
    }
    return zResult;

};

function CheckExistingData(itemP, id, zType) {
    $('.divTabAction .btn').attr('disabled', 'disabled');
    var data = { ValueData: itemP, zType: zType, ZID: id };
    $.ajax({
        type: 'get',
        url: $('#hf_CheckExistingData').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            if (response) {
                $.bootstrapGrowl(zType + ' already found !', {
                    type: 'danger',
                    delay: 8000,
                });
                $('#txt' + zType).val('');
            }
            $('.divTabAction .btn').removeAttr('disabled');
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again.. !', {
                type: 'danger',
                delay: 8000,
            });
            $('.divTabAction .btn').attr('disabled', 'disabled');
        }
    });
}

function IsEmail(email) {

    var zResult = true;
    var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    var emails = email.split(";");

    for (var i = 0; i < emails.length; i++)

        if (!regex.test(emails[i].trim())) {
            return false;
        } else {

        }

    return zResult;

}
function GetParameterValues(param) {
    var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < url.length; i++) {
        var urlparam = url[i].split('=');
        if (urlparam[0] == param) {
            return urlparam[1];
        }
    }
}
function GetBookDetails(zBookID, Zform) {
    OutSource = "";
    if (zBookID == 0) {
        clearForm('#FormBookInfo');
    }
    else {
        var data = {

            zBookID: zBookID

        };
        $.ajax({
            type: 'post',
            url: $('#hf_GetBookInfo').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var items = JSON.parse(response.json);
                $('#spBookNo').html('<strong>' +  items[0]["Number"] + '</strong>');
                $('#txtCatalog').val(items[0]["Catalog"]);
                $('#ddlPublisherList').val(items[0]["PublisherID"]).change();
                $('#txtISBN').val(items[0]["ISBN"]);
                $('#txtPBISBN').val(items[0]["PBISBN"])
                $('#txtEbookISBN').val(items[0]["EbookISBN"]);
                $('#txtWebISBN').val(items[0]["WebISBN"]);
                $('#txtEpubISBN').val(items[0]["EpubISBN"]);
                $('#txtMobiISBN').val(items[0]["MobiISBN"]);
                $('#ddlPlatform').val(items[0]["Platform"]).change();
                $('#txtTitle').val(items[0]["Title"]);
                $('#txtSeriesTitle').val(items[0]["SeriesTitle"]);
                $('#txtSubTitle').val(items[0]["SubTitle"]);
                //$('#txtReceivedDt').val(items[0]["ReceivedDt"]);
                $('#txtReceivedDt').val(FormatDate(items[0]["ReceivedDt"].toString().split("T")[0]));
                $('#txtDueDt').val(FormatDate(items[0]["DueDt"].toString().split("T")[0]));
                //$('#txtDueDt').val(items[0]["DueDt"]);
                $('#ddlType').val(items[0]["UploadType"]).change();
                $('#ddlCategory').val(items[0]["Category"]).change();
                $('#ddlSubject').val(items[0]["Subject"]).change();
                $('#ddlEdition').val(items[0]["Edition"]).change();
                $('#txtAuthorName').val(items[0]["AuthorName"]);
                $('#txtAuthorEmail').val(items[0]["AuthorEmail"]);
                $('#txtEditorName').val(items[0]["EditorName"]);
                $('#txtEditorEmail').val(items[0]["EditorEmail"]);
                $('#txtSeriesEditorName').val(items[0]["SeriesEditorName"]);
                $('#ddlPEList').val(items[0]["PEName"]).change();
                $('#ddlPMList').val(items[0]["PMName"]).change();
                $('#ddlWorkflow').val(items[0]["Workflow"]).change();
                $('#ddlTSPMList').val(items[0]["TSPM"]).change();
                $('#ddlProcess').val(items[0]["Workflow"]).change();
                $('#ddlOrigin').val(items[0]["Origin"]).change();
                $('#ddlSkipPA').val(items[0]["SkipPA"]).change();
                $('#TxtGeneralNote').val(isNullCheck(items[0].Notes));
                $('.jqte_editor').html(isNullCheck(items[0].Notes));
                OutSource = items[0]["Outsource"];
                try {
                    var data = items[0]["Outsource"].split(',');
                    var selectedValues = new Array();
                    try {
                        for (var i = 0; i < data.length; i++) {
                            selectedValues[i] = data[i];
                        }
                    } catch (e) { }

                    $('#lstOutsource').val(selectedValues).change();

                } catch (e) {
                    $('#lstOutsource').val(-1).change();
                }

                if (items[0]["ImgPath"] == null)
                    $('#imgcover').attr('src', '../Images/Covers/blue.png');
                else
                    $('#imgcover').attr('src', items[0]["ImgPath"]);

            },
            error: function (result) {
                $.bootstrapGrowl('Error Occured, Try Again', {
                    type: 'danger',
                    delay: 2000,
                });
                alert(response.d);
            }
        });
    }

}

function changeCover(aidp) {
    var imgName = $('#imgcover');

    //imgName.attr('src', '../Images/Covers/' + aidp.id + '.png');
    imgName.attr('src', '../Images/Covers/' + aidp.id + '.jpg');

    $('#hfCover').val(aidp.id);

}

function showPreview(objFileInput) {

    var ext = $('#imageUploadForm').val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['gif', 'png', 'jpg', 'jpeg']) == -1) {
        $.bootstrapGrowl('Invalid image format !', {
            type: 'danger',
            delay: 2000,
        });
        return false;
    }
    if (objFileInput.files[0].size > 10000000) {
        $.bootstrapGrowl('Book Cover image Size should be less than 10 MB !', {
            type: 'danger',
            delay: 2000,
        });
        return false;
    }
    else {
        if (objFileInput.files[0]) {
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                $('#imgcover').attr('src', e.target.result);

            }
            fileReader.readAsDataURL(objFileInput.files[0]);
        }
    }

}