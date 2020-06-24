var aFeedbackID = "";
var time = "";
var aFileList = "";
$(function () {
    time = $.now();
    //$('#myModal_Feedback .modal-body').css('height', size.height - 120);
    $('#myModal_Feedback').modal('hide');

    $('#Txt_ImplementDate_feedback').datetimepicker({
        format: 'd M Y',
        value: new Date(),
        timepicker: false,
        maxDate: today
    });
    $('#Txt_ImplementDate_esc').datetimepicker({
        format: 'd M Y',
        value: new Date(),
        timepicker: false,
        maxDate: today
    });
    $('#Txt_ImplementDate_appreciation').datetimepicker({
        format: 'd M Y',
        value: new Date(),
        timepicker: false,
        maxDate: today
    });
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
    $('#Txt_SearchFromDate').datetimepicker({
        format: 'd M Y',
        value: new Date(),
        timepicker: false,
        maxDate: today
    });
    $('#Txt_SearchToDate').datetimepicker({
        format: 'd M Y',
        value: new Date(),
        timepicker: false,
    });
    $("#ddlType").select2({ placeholder: "Select", allowClear: true }); $("#ddlType").val(-1).change();
    $("#txtverifiedby_feedback").select2({ placeholder: "Select", allowClear: true }); $("#txtverifiedby_feedback").val(-1).change();
    $("#ddlCustomer_feedback").select2({ placeholder: "Select", allowClear: true }); $("#ddlCustomer_feedback").val(-1).change();
    $("#ddlBookID_feedback").select2({ placeholder: "Select", allowClear: true }); $("#ddlBookID_feedback").val(-1).change();
    $("#ddlArtID_feedback").select2({ placeholder: "Select", allowClear: true, tags: true }); $("#ddlArtID_feedback").val(-1).change();
    $("#ddlCompType_feedback").select2({ placeholder: "Select", allowClear: true }); $("#ddlCompType_feedback").val(-1).change();
    $("#ddlcritical_feedback").select2({ placeholder: "Select", allowClear: true }); $("#ddlcritical_feedback").val(-1).change();
    $("#ddlfeedbackto_feedback").select2({ placeholder: "Select", allowClear: true, tags: true }); $("#ddlfeedbackto_feedback").val(-1).change();


    $('#divBookList,#DivListView').css('height', size.height - 120);

    $('.inputHandCursor').change(function () {
        var aStartDate = new Date($("#Txt_SearchFromDate").val());
        var aEndate = new Date($("#Txt_SearchToDate").val());
        if (new Date(aStartDate) > new Date(aEndate)) {
            $.bootstrapGrowl("To date should be greater than From date !", { type: 'danger', delay: 2000, });
            $(this).val('');
            $(this).focus();
            zResult = false;
        }
    });


    $('#btnSave_Feedback').click(function () {
        AddUpdateFeedbackDetails();
    });

    var FromDt = FormatDate_IE($("#Txt_SearchFromDate").val());
    var ToDt = FormatDate_IE($("#Txt_SearchToDate").val());

    $('#btnGet').click(function () {
        var FromDt = FormatDate_IE($("#Txt_SearchFromDate").val());
        var ToDt = FormatDate_IE($("#Txt_SearchToDate").val());
        FeedbackData(false, FromDt, ToDt, $('#BkTabul li.active').text());
    });

    $('#ddlType').change(function () {
        $('.feedescal').css("display", "");
        $('.feedappre').css("display", "");
        if ($(this).val() == 'Appreciation') {
            $('.feedescal').css("display", "none");
            $('.feedappre').css("display", "");
        }
        else {
            $('.feedescal').css("display", "");
            $('.feedappre').css("display", "none");
        }
    });

    $('#ddlCustomer_feedback').change(function () {
        if ($(this).val() == null)
            return true;
        var data = { zPublID: $(this).val() };
        $.ajax({
            type: 'get',
            url: $('#hf_GetNumberList').val(),
            data: data,
            datatype: 'json',
            success: function (response) {

                var items = response.Numberitems;
                $("#ddlBookID_feedback").empty();
                for (var i = 0; i < items.length; i++) {

                    $("#ddlBookID_feedback").append("<option value='" + items[i].Value + "'>" + items[i].Text + "</option>");
                }
                if (nBookIDG != null) {
                    $("#ddlArtID_feedback").val(-1).change();
                    $("#ddlBookID_feedback").val(nBookIDG).change();
                }
                else {
                    $("#ddlArtID_feedback").val(-1).change();
                    $("#ddlBookID_feedback").val(-1).change();
                }

                $('#LoadingImage').hide();

            },
            error: function (result) {
                $.bootstrapGrowl('Error Occured, Try Again !', {
                    type: 'danger',
                    delay: 2000,
                });
                $('#LoadingImage').hide();
            }
        });
    });

    $('#ddlBookID_feedback').change(function () {
        if ($(this).val() == null)
            return true;
        var data = { zBookID: $(this).val() };
        $.ajax({
            type: 'get',
            url: $('#hf_GetChapterList').val(),
            data: data,
            datatype: 'json',
            success: function (response) {

                var items = response.Numberitems;
                $("#ddlArtID_feedback").empty();
                for (var i = 0; i < items.length; i++) {

                    $("#ddlArtID_feedback").append("<option value='" + items[i].Value + "'>" + items[i].Text + "</option>");
                }

                if (nChapterIDG != null && nBookIDG == $('#ddlBookID_feedback').val()) {
                    var zChapterList = nChapterIDG;
                    try {
                        var data = zChapterList.split(',');
                        var selectedValues = new Array();
                        try {
                            for (var i = 0; i < data.length; i++) {
                                selectedValues[i] = data[i];
                            }
                        } catch (e) { }

                        $('#ddlArtID_feedback').val(selectedValues).change();

                    } catch (e) {
                        $('#ddlArtID_feedback').val(-1).change();
                    }
                }
                else {
                    nBookIDG = null;
                    nChapterIDG = null;
                    $("#ddlArtID_feedback").val(-1).change();
                }

                $('#LoadingImage').hide();

            },
            error: function (result) {
                $.bootstrapGrowl('Error Occured, Try Again !', {
                    type: 'danger',
                    delay: 2000,
                });
                $('#LoadingImage').hide();
            }
        });
    });

    $('#btnAttachment_Feedback').click(function () {
        $('#divFiles').html('');
        if (aFeedbackID != 0)
        {
            var Stable = "<table id='tbla1' class='tblTrans' width=100%>";
            Stable += "<thead><th>File Name</th><th>Action</th></thead>";
            var aFileList;

            $.each(aFileList, function (e, val) {
                var zFileNameList = val.split('\\').pop(-1);
                Stable += "<tr>";
                Stable += "<td><a href='../Source/ProjectAnalysis/" + $('#lblcatalog').html() + "/" + aType + "/" + zFileNameList + "' download> " + zFileNameList + "</td>";
                Stable += "<td style='text-align: center'><i class='fas fa-trash' onclick='Delete(this);'></i></td>";
                Stable += "</tr>";
            });
            Stable += "</table>";
            $('#divFiles').html(Stable);
            $('#divFiles').show();
        }
       

        $('#myModal_attachFiles').modal({ backdrop: 'static', keyboard: false });
    });

    $('input[type="file"]').change(function (e) {
        if (validateFileType('#file-input')) {
            if (window.FormData !== undefined) {
                var fileUpload = $("#file-input").get(0);
                var files = fileUpload.files;
                var fileData = new FormData();
                for (var i = 0; i < files.length; i++) {
                    var rowCount = $('#tblAddAttachment tbody tr').length;
                    if (rowCount > 0) {
                        $.each($("#tblAddAttachment tbody tr"), function (e) {
                            var zPreVal = $(this).find('td')[0].innerText;

                            if (zPreVal == files[i].name) {
                                $.bootstrapGrowl('Already ' + files[i].name + ' Added!', {
                                    type: 'danger',
                                    delay: 5000,
                                });
                                $("#file-input").val(null);
                                return false;
                            }
                            else {
                                fileData.append(files[i].name, files[i]);
                            }
                        });
                    }
                    else {
                        fileData.append(files[i].name, files[i]);
                    }


                }

                fileData.append("Time", time);
                $.ajax({
                    url: $('#hf_AddFileupload').val(),
                    type: "POST",
                    contentType: false, // Not to set any content header  
                    processData: false, // Not to process data  
                    data: fileData,
                    datatype: 'json',
                    success: function (response) {
                        for (var i = 0; i < files.length; i++) {
                            var Stable = "<tr>";
                            Stable += "<td><a href='../Source/Feedback/" + time + "/" + files[i].name + "' download> " + files[i].name + "</td>";
                            Stable += "<td style='text-align: center'><i class='fas fa-trash' onclick='Delete(this);'></i></td>";
                            Stable += "</tr>";

                            $('#tblAddAttachment tr:last').after(Stable);

                        }
                        $("#file-input").val(null);
                    },
                    error: function (err) {
                        alert(err.statusText);
                    }
                });
            }
        }
    });

    FeedbackData(true, FromDt, ToDt, $('#BkTabul li.active').text());

    $('#BkTabul li').click(function () {
        var aTabType = $(this)[0].innerText;
        FeedbackData(true, FromDt, ToDt, aTabType);
    });
});
function OpenFile(aid) {
        $('#file-input').trigger('click');
}

function Delete(btndel) {
    var aFileName = $(btndel).closest('tr').find('td a').html().trim();
    var data =
    {
        atime: time,
        FileNameP: aFileName
    };
    $.ajax({
        type: 'get',
        url: $('#hf_DeleteFile').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            if (response) {
                $.bootstrapGrowl('File Deleted Successfully! &#128515;', {
                    type: 'info',
                    delay: 5000,
                });

            }
            $(btndel).closest('tr').remove();
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again.. !', {
                type: 'danger',
                delay: 5000,
            });
        }
    });

}
function FeedbackData(aFirstLoad, aFromDt, aToDt, aTabType) {
    $('#LoadingImage').show();
    var data = {
        zFirstLoad: aFirstLoad,
        zFromDt: aFromDt,
        zToDt: aToDt,
        zTabType: aTabType
    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetFeedback').val(),
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

function FetechData(ItemsList) {
    try {
        dataSet = [];
        var items = ItemsList;
        var zCtInP = 0;
        var zCtCom = 0;

        $.each(items, function (index) {
            var zindexL = 0;
            zCtInP += 1;
            zindexL = zCtInP;
            var t = [
                zindexL.toString(),
                $(this)[0]["Type"],
                $(this)[0]["Publisher"],
                $(this)[0]["Number"],
                $(this)[0]["Catalog"],
                $(this)[0]["ComplaintType"],
                $(this)[0]["CriticalLevel"],
                FormatDateColumn($(this)[0]["FeedbackDate"]),
                $(this)[0]["FeedbackID"]
            ];

            dataSet.push(t);

        });

        LoadData();
    } catch (e) {
        $('#LoadingImage').hide();
    }
}
function LoadData() {

    var table = $('#example').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
        data: dataSet,
        columns: [
            { title: "S.No." },
            {
                title: "Type", "bSortable": false, "render": function (data, type, full, meta) {
                    if (data == 'Appreciation') {
                        return '<span class="feedsmily"><i class="fa fa-smile" aria-hidden="true" title="Appreciation"></i><span style="display:none">Appreciation</span></span>';
                    }
                    else if (data == 'Feedback') {
                        return '<span class="feedsmily"><i class="fa fa-frown" aria-hidden="true" title="Feedback"></i><span style="display:none">Feedback</span></span>';
                    }
                    else if (data == 'Escalation') {
                        return '<span class="feedsmily"><i class="fa fa-sad-tear" aria-hidden="true" title="Escalation"></i><span style="display:none">Escalation</span></span>';
                    }
                }
            },
            { title: "Publisher" },
            { title: "Book ID" },
            { title: "Catalog" },
            { title: "Complaint Type" },
            { title: "Critical Level" },
            { title: "Inserted Date" },
            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class=spDeleteIcon style="display:none"><i class="fa fa-trash" aria-hidden="true" title="Delete" data-col="Name" onclick="DeleteFeedbackInfo(' + isNullCheck(data) + ');"></i></span>' +
                        '<span class=spUpdateIcon style="display:none"><i class="fa fa-pen" aria-hidden="true" title="Edit" data-col="Name" onclick="UpdateFeedbackInfo(' + isNullCheck(data) + ');"></i></span>';
                }
            }
        ],
        columnDefs: [
            { type: 'date-dd-mmm-yyyy', targets: [7] }
        ],
        "destroy": true,

        fixedHeader: {
            header: true
        },
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'Feedback' + today.toShortFormatWithTime(),

                title: 'Feedback',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7],
                    format: {
                        header: function (data, row, column, node) {
                            var zheader = data.toString().split('<div class="dropdown')[0];
                            zheader = zheader.toString().split('<i class="fa fa-filter')[0];
                            zheader = zheader.replace('<center>', '');
                            zheader = zheader.replace('</center>', '');
                            return zheader.replace('<br>', '');
                        }
                    }
                }
            },
            {
                extend: 'pdfHtml5',
                text: '<img src="../Images/pdf.png" title="Export to PDF" />',
                filename: 'Feedback' + today.toShortFormatWithTime(),

                title: 'Feedback',
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7],
                    format: {
                        header: function (data, row, column, node) {
                            var zheader = data.toString().split('<div class="dropdown')[0];
                            zheader = zheader.toString().split('<i class="fa fa-filter')[0];
                            zheader = zheader.replace('<center>', '');
                            zheader = zheader.replace('</center>', '');
                            return zheader.replace('<br>', '');
                        },
                    }
                }

            },
            {
                text: '<button class="btn btn-primary spAddIcon" style="display:none"><i class="fa fa-handshake"></i> Add</button>',
                action: function (e, dt, node, config) {
                    //('#ddlType').val('Feedback').change();
                    clearForm('#divFeedback');
                    aFeedbackID = 0;
                    nBookIDG = null;
                    nChapterIDG = null;
                    time = $.now();
                    $('.feedescal').css("display", "");
                    $('.feedappre').css("display", "");
                    $('.feedescal').css("display", "");
                    $('.feedappre').css("display", "none");
                    var ztable = "";
                    ztable += "<label class='control-label'>Attachment</label><span id='spFileAdd' onclick='OpenFile(1);'><i class='fa fa-plus-square' aria-hidden='true'></i></span>"
                    ztable += "<div class='divFile' style='overflow:auto;'><table id='tblAddAttachment' class='tblTrans' width=100%><thead><th>File Name</th><th>#</th></thead><tbody>"
                    ztable += "</tbody></div>"
                    ztable += "</table>";
                    $('#divFileInfo').html(ztable);
                    $("#myModal_Feedback").modal({ backdrop: 'static', keyboard: false });
                }

            },

        ],
        "scrollY": (size.height - ($('#BkTabul li.active').text() == 'Period' ? 280 : 230)),
        "scrollX": true,
        "createdRow": function (row, data, dataIndex) {
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
    CheckAccessRights();
}
function DeleteFeedbackInfo(aIDP) {

    bootbox.confirm('Are you sure to delete?',
        function (result) {
            if (result) {

                $('#LoadingImage').show();
                var aitemInfoP = {
                    FeedbackID: aIDP

                }
                $.ajax({
                    type: 'post',
                    url: $('#hf_FeedbackDelete').val(),
                    data: JSON.stringify(aitemInfoP),
                    contentType: 'application/json;charset=utf-8',
                    datatype: 'json',
                    success: function (response) {
                        if (response.toString().indexOf('Error') != -1) {
                            $.bootstrapGrowl(response, {
                                type: 'danger',
                                delay: 8000,
                            });
                        }
                        else {
                            $.bootstrapGrowl(response, {
                                type: 'info',
                                delay: 8000,
                            });

                        }
                        $('#LoadingImage').hide();
                        FeedbackData(true, '', '');
                    },
                    error: function (response) {
                        $.bootstrapGrowl(response, {
                            type: 'danger',
                            delay: 8000,
                        });
                        $('#LoadingImage').hide();
                    }
                });
            }
        });


}
function UpdateFeedbackInfo(aIDP) {
    aFeedbackID = aIDP;
    FeedbackDetails(aIDP);
    $('#myModal_Feedback').modal({ backdrop: 'static', keyboard: false });
}
var nBookIDG;
var nChapterIDG;
function FeedbackDetails(zitem) {
    if (zitem == null || zitem == 0) {
        clearForm('#divFeedback');
    }
    else {
        clearForm('#divFeedback');
        $('#LoadingImage').show();
        var data = { zFeedbackID: zitem }
        $.ajax({
            type: 'post',
            url: $('#hf_FeedbackInfo').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var items = JSON.parse(response.json);
                $('#ddlType').val(items[0]["Type"]).change();
                $('#ddlCustomer_feedback').val(items[0]["PulisherID"]).trigger('change');
                //$('#ddlBookID_feedback').val(items[0]["BookID"]).trigger('change');
                nBookIDG = items[0]["BookID"];
                $('#ddlCompType_feedback').val(items[0]["ComplaintType"]).change();
                $('#ddlcritical_feedback').val(items[0]["CriticalLevel"]).change();
                $('#txtfeedback_feedback').val(items[0]["Feedback"]);
                $('#txtrootcause_feedback').val(items[0]["Rootcause"]);
                $('#txtcorrectn_feedback').val(items[0]["Correctiveaction"]);
                $('#txtpreventive_feedback').val(items[0]["Preventiveaction"]);
                $('#txtfeedback_appreciation').val(items[0]["Appreciation"]);
                $('#Txt_ImplementDate_feedback').val((items[0]["ImplementDate"] == null ? '' : FormatDate(items[0]["ImplementDate"])));
                $('#txtverifiedby_feedback').val(items[0]["Verifiedby"]).change();
                time = (items[0]["Attachment"] == null ? $.now() : items[0]["Attachment"]);
                var zFeedbacktoList = items[0]["FeedbackTo"];
                try {
                    var data = zFeedbacktoList.split(',');
                    var selectedValues = new Array();
                    try {
                        for (var i = 0; i < data.length; i++) {
                            selectedValues[i] = data[i];
                        }
                    } catch (e) { }

                    $('#ddlfeedbackto_feedback').val(selectedValues).change();

                } catch (e) {
                    $('#ddlfeedbackto_feedback').val(-1).change();
                }

                nChapterIDG = items[0]["ChapterNo"];

                aFileList = response.aFileList;
                $('#divFileInfo').html('');
                var ztable = "";
                ztable += "<label class='control-label'>Attachment</label><span id='spFileAdd' onclick='OpenFile(1);'><i class='fa fa-plus-square' aria-hidden='true'></i></span>"
                ztable += "<div class='divFile' style='overflow:auto;'><table id='tblAddAttachment' class='tblTrans' width=100%><thead><th>File Name</th><th>#</th></thead><tbody>"
                $.each(aFileList, function (e, val) {
                    var zFileNameList = val.split('\\').pop(-1);
                    ztable += "<tr>";
                    ztable += "<td><a href='../Source/Feedback/" + time + "/" + zFileNameList + "' download> " + zFileNameList + "</td>";
                    ztable += "<td style='text-align: center'><i class='fas fa-trash' onclick='Delete(this);'></i></td>";
                    ztable += "</tr>";
                });
                ztable += "</tbody>"
                ztable += "</table>";
                $('#divFileInfo').html(ztable);

                $('.feedescal').css("display", "");
                $('.feedappre').css("display", "");
                if (items[0]["Type"] == 'Appreciation') {
                    $('.feedescal').css("display", "none");
                    $('.feedappre').css("display", "");
                }
                else {
                    $('.feedescal').css("display", "");
                    $('.feedappre').css("display", "none");
                }
                $('#LoadingImage').hide();

            },
            error: function (response) {
                $.bootstrapGrowl(response + '...&#128528', {
                    type: 'danger',
                    delay: 8000,
                });
                $('#LoadingImage').hide();
            }
        });
    }
}

function AddUpdateFeedbackDetails() {
    var validate = ValidateForm('');
    if (validate) {


        $('#LoadingImage').show();


        var aitemInfoP = {

            FeedbackID: aFeedbackID,
            PulisherID: ($('#ddlCustomer_feedback').val() == null ? null : $('#ddlCustomer_feedback').val().toString()),
            BookID: ($('#ddlBookID_feedback').val() == null ? null : $('#ddlBookID_feedback').val().toString()),
            ChapterNo: ($('#ddlArtID_feedback').val() == null ? null : $('#ddlArtID_feedback').val().toString()),
            ComplaintType: ($('#ddlCompType_feedback').val() == null ? null : $('#ddlCompType_feedback').val().toString()),
            CriticalLevel: ($('#ddlcritical_feedback').val() == null ? null : $('#ddlcritical_feedback').val().toString()),
            FeedbackTo: ($('#ddlfeedbackto_feedback').val() == null ? null : $('#ddlfeedbackto_feedback').val().toString()),
            Feedback: $('#txtfeedback_feedback').val(),
            Rootcause: $('#txtrootcause_feedback').val(),
            Correctiveaction: $('#txtcorrectn_feedback').val(),
            Preventiveaction: $('#txtpreventive_feedback').val(),
            ImplementDate: $('#Txt_ImplementDate_feedback').val(),
            Verifiedby: $('#txtverifiedby_feedback').val(),
            Appreciation: $('#txtfeedback_appreciation').val(),
            Type: $('#ddlType').val(),
            Attachment: time


        }
        $.ajax({
            type: 'post',
            url: $('#hf_AddFeedback').val(),
            data: JSON.stringify(aitemInfoP),
            contentType: 'application/json;charset=utf-8',
            datatype: 'json',
            success: function (response) {
                $.bootstrapGrowl('Details Added Successfully &#128515;', {
                    type: 'info',
                    delay: 2000,

                });

                $('#LoadingImage').hide();
                $('#myModal_Feedback').modal('hide');
                FeedbackData(true, '', '');
            },
            error: function (response) {
                $.bootstrapGrowl('Error Occured, Try Again ! &#128577;', {
                    type: 'danger',
                    delay: 2000,
                });
                $('#LoadingImage').hide();
            }
        });
    }
}

function ValidateForm(form) {
    var zResult = true;

    if ($('#ddlCustomer_feedback').val() == null) {
        $.bootstrapGrowl("Select Publisher !", { type: 'danger', delay: 8000, });
        $('#ddlCustomer_feedback').focus();
        zResult = false;
    }
    else if ($('#ddlType').val() == null) {
        $.bootstrapGrowl("Select Feedback Type !", { type: 'danger', delay: 8000, });
        $('#ddlType').focus();
        zResult = false;
    } else if ($('#ddlBookID_feedback').val() == null) {
        $.bootstrapGrowl("Select BookID!", { type: 'danger', delay: 8000, });
        $('#ddlBookID_feedback').focus();
        zResult = false;
    }
    else if ($('#ddlCompType_feedback').val() == null) {
        $.bootstrapGrowl('Select Complaint Type !', { type: 'danger', delay: 8000, });
        $('#ddlCompType_feedback').focus();
        zResult = false;
    }
    else if ($('#ddlcritical_feedback').val() == null) {
        $.bootstrapGrowl('Select Criticality Level !', { type: 'danger', delay: 8000, });
        $('#ddlcritical_feedback').focus();
        zResult = false;
    }
    else if (($('#ddlType').val() == 'Feedback' || $('#ddlType').val() == 'Escalation') && $('#txtfeedback_feedback').val() == '') {
        $.bootstrapGrowl("Enter Feedback !", { type: 'danger', delay: 8000, });
        $('#txtfeedback_feedback').focus();
        zResult = false;
    }
    else if (($('#ddlType').val() == 'Appreciation') && $('#txtfeedback_appreciation').val() == '') {
        $.bootstrapGrowl("Enter Appreciation !", { type: 'danger', delay: 8000, });
        $('#txtfeedback_appreciation').focus();
        zResult = false;
    }


    return zResult;

};