var aPublisher;
var aTask;
$(function () {
    $('#ddlTaskList').select2();
    LoadPublisherList();
    $('#divPublisherList').css('height', size.height - 180);

    $('#btnUpdate').click(function () {
        UpdateSettings();
    });

    $('#ddlTaskList').change(function () {
        LoadPublisherList();
    });

    $('input[type="file"]').change(function (e) {
        if (validateFileType('#file-input', 21000000)) {
            if (window.FormData !== undefined) {
                var fileUpload = $("#file-input").get(0);
                var files = fileUpload.files;
                var fileData = new FormData();
                for (var i = 0; i < files.length; i++) {
                    var rowCount = $('#TblFileList tbody tr').length;
                    if (rowCount > 0) {
                        $.each($("#TblFileList tbody tr"), function (e) {
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

                fileData.append("Publisher", aPublisher);
                fileData.append("Task", aTask);
                $('.FileAttach').show();
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
                            Stable += "<td>" + (i + 1).toString() + "</td>";
                            Stable += "<td><a href='../Source/FreelanceGuideLine/" + aPublisher + "/" + aTask + "/" + files[i].name + "' download> " + files[i].name + "</td>";
                            Stable += "<td style='text-align: center'><i class='fas fa-trash' onclick='DeleteAddFile(this);'></i></td>";
                            Stable += "</tr>";
                            $('#TblFileList tbody').append(Stable);
                        }
                        $("#file-input").val(null);
                        FileListReNumber();
                        $('.FileAttach').hide();
                    },
                    error: function (err) {
                        alert(err.statusText);
                        $('.FileAttach').hide();
                    }
                });
            }
        }
    });

});

function LoadPublisherList() {
    $('#LoadingImage').show();
    var data = { nTaskID: $('#ddlTaskList').val() };
    $.ajax({
        type: 'get',
        url: $('#hf_GetLoadDataList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var aPubitems = response.aPublisherList;
            var zHTML = "<table id='tblPubList' class='tblTrans' width='100%'><thead>" +
                "<tr><th>S.No.</th><th>Publisher</th><th>Next Booking</th>" +
                "<th>Stage</th><th>Status</th><th>New No.</th>" +
                "<th>Production Download Path <br>{Publisher}{BookNo}{ChapterNo}</th>" +
                "<th>Skip Selection</th>" +
                "<th>Guide Line</th>" +
                "</tr></thead>";
            $.each(aPubitems, function (e, val) {

                var aNextBooking = GetSelectList("", 'NextBk', val.NextBooking);
                var aTaskitems = GetSelectList(response.aStageList, 'Stage', val.NextBookingStage);
                var aStatusitems = GetSelectList(response.aProcessList, 'Status', val.NextBookingStatus);
                if (val.NextBooking != null)
                    aNewRecord = false;

                zHTML += '<tr>';
                zHTML += '<td width=2%>' + (e + 1).toString() + '</td>';
                zHTML += '<td width=2% style="display:none">' + val.Publ_ID + '</td>';
                zHTML += '<td width=10% id="' + val.Publ_ID + '">' + val.Publ_Acronym + '</td>';
                zHTML += '<td width=10%>' + aNextBooking + '</td>';
                zHTML += '<td width=15%>' + aTaskitems + '</td>';
                zHTML += '<td width=15%>' + aStatusitems + '</td>';
                zHTML += '<td width=15%><input type="text" class="form-control TxtNewNo" value="' + isNullCheck(val.NewNo) + '" maxlength="15" /></td>';
                zHTML += '<td><input type="text" class="form-control TxtDownloadPath" value="' + isNullCheck(val.DownloadPath) + '" /></td>';
                if (val.SkipSelection == 0 || val.SkipSelection == null)
                    zHTML += '<td><center><input type="checkbox" class="ChkSkip"/></center></td>';
                else
                    zHTML += '<td><center><input type="checkbox" class="ChkSkip" checked="checked"/></center></td>';

                zHTML += '<td><center class="spFileAdd" data-Pub="' + val.Publ_Acronym + '" data-id="' + val.Publ_ID + '" data-FileList="' + isNullCheck(val.GuideLine) + '"><i class="fa fa-plus-square" aria-hidden="true"></i></center></td>';

                zHTML += '</tr>';
            });

            $('#divPublisherList').html(zHTML);
            $('.ddlStatus,.ddlStage,.ddlNextBk').val(-1);
            $('.ddlStatus,.ddlStage,.ddlNextBk').select2({ placeholder: "Select" });
            var atrList = $('#tblPubList tbody tr');
            $.each(atrList, function (e, val) {
                if (aPubitems[e].Publ_ID == $(this).find('td[id]')[0].id) {
                    $(this).find('.ddlNextBk').val(aPubitems[e].NextBooking).change();
                    $(this).find('.ddlStage').val(aPubitems[e].NextBookingStage).change();
                    $(this).find('.ddlStatus').val(aPubitems[e].NextBookingStatus).change();
                }
            });
            $('.ddlNextBk').change(function () {
                if ($(this).val() == 0) {
                    $(this).closest('tr').find('.ddlStage,.ddlStatus').val(-1).change();
                }
            });

            $('.spFileAdd').click(function () {
                $('#TblFileList tbody').html('');
                $('#lblTitle').html('Guide Line List - ' + $(this).attr('data-Pub'));
                aPublisher = $(this).attr('data-id');
                aTask = $('#ddlTaskList').val();
                var aFileList = $(this).attr('data-FileList').split(',');
                $.each(aFileList, function (e, val) {
                    if (val != '') {
                        var Stable = "<tr>";
                        Stable += "<td>" + (e + 1).toString() + "</td>";
                        Stable += "<td><a href='../Source/FreelanceGuideLine/" + aPublisher + "/" + aTask + "/" + val + "' download> " + val + "</td>";
                        Stable += "<td style='text-align: center'><i class='fas fa-trash' onclick='DeleteAddFile(this);'></i></td>";
                        Stable += "</tr>";
                        $('#TblFileList tbody').append(Stable);
                    }
                });
                $("#myModal_GuideLine").modal({ backdrop: 'static', keyboard: false });
            });

            $('#LoadingImage').hide();
        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
            $('#LoadingImage').hide();
        }
    });
}

function GetSelectList(item, type, selVal) {
    var aSelectList = '';
    if (type == 'Status') {
        aSelectList = '<select class="ddlStatus">';
        $.each(item, function (e, val) {
            if (val.ProcessName == selVal && selVal != null && selVal != '')
                aSelectList += '<option selected="selected" value="' + val.ProcessName + '">' + val.ProcessName + '</option>';
            else
                aSelectList += '<option value="' + val.ProcessName + '">' + val.ProcessName + '</option>';
        });
        aSelectList += '</select>';
    }
    else if (type == "Stage") {
        aSelectList = '<select class="ddlStage">';
        $.each(item, function (e, val) {
            if (val.StageName == selVal && selVal != null && selVal != '')
                aSelectList += '<option selected="selected" value="' + val.StageName + '">' + val.StageName + '</option>';
            else
                aSelectList += '<option value="' + val.StageName + '">' + val.StageName + '</option>';
        });
        aSelectList += '</select>';
    }
    else if (type == "NextBk") {
        aSelectList = '<select class="ddlNextBk">';
        if (selVal == 1) {
            aSelectList += '<option selected="selected" value="1">Yes</option>';
            aSelectList += '<option value="0">No</option>';
        }
        else if (selVal == 0) {
            aSelectList += '<option value="1">Yes</option>';
            aSelectList += '<option selected="selected" value="0">No</option>';
        }
        else {
            aSelectList += '<option value="1">Yes</option>';
            aSelectList += '<option value="0">No</option>';
        }
        aSelectList += '</select>';
    }
    return aSelectList;

}

function UpdateSettings() {
    $('#LoadingImage').show();
    var aResult = true;
    var aItemList = $('#tblPubList tbody tr');
    $.each(aItemList, function () {
        var aNextStage = $(this).find('td .ddlNextBk');
        var aStageBkList = $(this).find('td .ddlStage');
        var aStatusList = $(this).find('td .ddlStatus');
        var aNewNoist = $(this).find('td .TxtNewNo');
        var aPathList = $(this).find('td .TxtDownloadPath');
        if ($(aNextStage).val() != null) {
            if ($(aStageBkList).val() == null && $(aNextStage).val() == 1) {
                $.bootstrapGrowl("Select Stage for Publisher !", {
                    type: 'danger',
                    delay: 5000,
                });
                $('#LoadingImage').hide();
                $(aStageBkList).focus();
                aResult = false;
                return false;
            }
            else if ($(aStatusList).val() == null && $(aNextStage).val() == 1) {
                $.bootstrapGrowl("Select Status for Publisher !", {
                    type: 'danger',
                    delay: 5000,
                });
                $('#LoadingImage').hide();
                $(aStatusList).focus();
                aResult = false;
                return false;
            }
            else if ($(aPathList).val() == '') {
                $.bootstrapGrowl("Enter Download Path !", {
                    type: 'danger',
                    delay: 5000,
                });
                $('#LoadingImage').hide();
                $(aPathList).focus();
                aResult = false;
                return false;
            }
        }
    });
    if (aResult) {
        var getPublisherList = [];
        getPublisherList = GetTableRowToList('tblPubList');

        var data = {
            nTaskID: $('#ddlTaskList').val(),
            zPublisherList: getPublisherList
        }
        $.ajax({
            type: 'post',
            url: $('#hf_UpdateSettings').val(),
            data: data,
            datatype: 'json',
            traditional: true,
            success: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'info',
                    delay: 5000,
                });
                $('#LoadingImage').hide();
            },
            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 5000,
                });
                $('#LoadingImage').hide();
                $('#myModal_WorkFlow').modal('hide');
            }
        });
    }
}

function OpenFile(aid) {
    $('#file-input').trigger('click');
}

function DeleteAddFile(aitem) {
    var aFileName = $(aitem).closest('tr').find('td a').text().trim();
    var data =
    {
        nPublisher: aPublisher,
        nTask: aTask,
        zFileNameP: aFileName,
    };
    $.ajax({
        type: 'get',
        url: $('#hf_DeleteAddFile').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            if (response) {
                $.bootstrapGrowl('File Deleted Successfully!', {
                    type: 'info',
                    delay: 5000,
                });
            }
            $(aitem).closest('tr').remove();
            var alist = $('.spFileAdd[data-id="' + aPublisher + '"]').attr('data-filelist');
            alist = alist.replace(aFileName, '');
            $('.spFileAdd[data-id="' + aPublisher + '"]').attr('data-filelist', alist);
            FileListReNumber();
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again.. !', {
                type: 'danger',
                delay: 5000,
            });
        }
    });
}

function FileListReNumber() {
    $("table#TblFileList tbody").each(function () {
        $(this).children().each(function (index) {
            $(this).find('td').first().html(index + 1);
        });
    });
}