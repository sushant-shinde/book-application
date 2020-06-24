var aFileList;
var aID;
var time = "";
var counter = 0;
var aInstructionID = "";
var aChapterListG = null;
$(".hover").mouseleave(
    function () {
        $(this).removeClass("hover");
    }
);

$(document).ready(function () {
    GetTicketDetails_User();
    ShowTicketDetailsToAdmin('Pending');
    //CallDataList();
    CallInstList();
});

$(function () {
    time = $.now();
    $('#myModal').modal('hide');

    $('#btnnewticket').click(function () {
        AutoID();
        $('#theCount').hide();
        $('#theCountq').hide();
        $("#myModal").modal({ backdrop: 'static', keyboard: false });

    });

    $('#TxtAUMailBody').jqte();

    $('#btnSave').click(function () {
        $('#theCount').hide();
        $('#theCountq').hide();
        AddTicketData();
        GetTicketDetails_User();

    });

    $('#btncancel').click(function () {
        //$('#tblAddAttachment tbody tr').remove();
        //$('input[type="file"]').remove();
        DeleteAllFileFolder();
        ClearPopup();
    });

    $("#btnSubmit").click(function () {

        if ($('#txtreason').val() == '') {
            $.bootstrapGrowl('Enter Reason !', { type: 'danger', delay: 5000, });
            $('#txtreason').focus();
            zResult = false;
        }
        else {

            var zID = $('#ticktRID').text();
            $('#hf_Status').val($(this).attr("data-value"))
            var aType = $('#hf_Status').val();
            AddReasonToReopen(zID);

            UpdatestatusbyUser(zID, aType);
        }



    })

    $("#btnReopen").click(function () {

        $("#myModal_Reason").modal({ backdrop: 'static', keyboard: false });

    })

    $("#btndelete").click(function () {
        var zID = $('#ticktRID').text();
        $('#hf_Status').val($(this).attr("data-value"))
        var aType = $('#hf_Status').val();

        bootbox.confirm("Are you sure to Delete the Ticket?",
            function (result) {
                if (result) {
                    UpdatestatusbyUser(zID, aType);
                    DeleteTicket(zID);
                    GetTicketDetails_User();
                }
            });



    })

$('.BtnAttach').click(function () {
    $('#theCount').hide();
    $('#theCountq').hide();

    var data = {
        aTicketNo: $('#theCount').text(),
        aTime: time
    };


    $.ajax({
        type: 'post',
        url: $('#hf_GetFiles').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var items = response.aFileListHD;

            var ztable = "";
            ztable += "<span id='spFileAdd' onclick='OpenFile();'><i class='fa fa-plus-square' aria-hidden='true'></i></span>"
            ztable += "<table id='tblAddAttachment' class='tblTrans' width=100%><thead><th>File Name</th><th>#</th></thead><tbody>"
            $.each(items, function (e, val) {
                var zFileNameList = val.split('\\').pop(-1);

                ztable += "<td><a href='../Source/HelpDesk/" + $('#theCount').text() + "/" + time + "/" + zFileNameList + "' download> " + zFileNameList + "</td>";
                ztable += "<td style='text-align: center'><i class='fas fa-trash' onclick='DeleteAddFile(this);'></i></td>";
                ztable += "</tbody>"


            });
            ztable += "</table>";
            $('#divFileInfo').html(ztable)
            $('#divFileInfo').show();


            $('#myModal_attachFiles').modal({ backdrop: 'static', keyboard: false });


        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
        }
    });



});

$('input[type="file"]').change(function (e) {
    if (window.FormData !== undefined && validateFileType('#file-input')) {
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

        fileData.append("ID", $('#theCountq').text());
        fileData.append("Time", time);
        $.ajax({
            url: $('#hf_FileuploadM').val(),
            type: "POST",
            contentType: false, // Not to set any content header  
            processData: false, // Not to process data  
            data: fileData,
            datatype: 'json',
            success: function (response) {
                for (var i = 0; i < files.length; i++) {
                    var Stable = "<tr>";
                    Stable += "<td><a href='../Source/HelpDesk/" + $('#theCountq').text() + "/" + time + "/" + files[i].name + "' download> " + files[i].name + "</td>";
                    Stable += "<td style='text-align: center'><i class='fas fa-trash' onclick='DeleteAddFile(this);'></i></td>";
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

});

$('#BkTabul li').click(function () {
    var zTabType = $(this).text();
    //zTabType = $('#BkTabul li.active').text();
    GetTicketDetails_User(zTabType);
    ShowTicketDetailsToAdmin(zTabType);
});


$('#btnview').click(function () {
    var zID = $('#ticktRID').text();
    ViewReasons(zID);

});
$('#btnresolve').click(function () {
  
    $("#myModal_Comment").modal({ backdrop: 'static', keyboard: false });
});

$('#btnSubmit_Admin').click(function () {
    if ($('#txtreason').val() == '') {
        $.bootstrapGrowl('Enter Comment !', { type: 'danger', delay: 5000, });
        $('#txtreason').focus();
        zResult = false;
    }
    else {


        var zID = $('#ticktRID').text();
        $('#hf_Status').val($(this).attr("data-value"))
        var aType = $('#hf_Status').val();
        AddReasonToReopen(zID);
        UpdateTicketStatusbyAdmin(zID);
        SendStatusbyMail(zID);
    }


});


$('#btnview_user').click(function () {
    var zID = $('#ticktRID').text();
    ViewReasons(zID);

});

});


function AddReasonToReopen(aID) {
    aID = $('#ticktRID').text();
    var aitemInfoP = {

        ID: aID,
        Comment: $('#txtreason').val(),

    }
    $.ajax({
        type: 'post',
        url: $('#hf_AddReopenReason').val(),
        data: JSON.stringify(aitemInfoP),
        contentType: 'application/json;charset=utf-8',
        datatype: 'json',
        success: function (response) {
            $('#myModal_Comment').modal('hide');

            $('#myModal_Reason').modal('hide');
            $('#myModal_ViewTicket').modal('hide');
            $('#txtreason').val('');
        },

        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
        }
    });


}

function UpdatestatusbyUser(zID, aType) {

    var data = {
        aID: zID,
        aStatus: aType

    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateStatusbyUser').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            $.bootstrapGrowl(response, {
                type: 'info',
                delay: 5000,
            });
            GetTicketDetails_User();
            $('#myModal_ViewTicket').modal('hide');
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

function OpenFile() {
    $('#file-input').trigger('click');
}

function ClearPopup() {

    $('#txtsubject').val('');
    $('.jqte_editor').text('');

    $('input:radio[name=priority]:checked').removeAttr('checked');
    //DeleteAllFileFolder();

}

function AutoID() {
    $.ajax({
        type: 'post',
        url: $('#hf_GetAutoID').val(),
        data: JSON.stringify(),
        datatype: 'json',
        success: function (response) {
            var items = response.counter;
            $('#theCount').text(items);
            $('#theCountq').text(items);
            $('#ticktRID').text(items);
        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
        }
    });
}

function DeleteAddFile(btndel) {

    var aFileName = $(btndel).closest('tr').find('td a').html().trim();
    var data =
    {
        aTickitID: $("#theCountq").text(),
        FileNameP: aFileName,
        zTime: time
    };
    $.ajax({
        type: 'post',
        url: $('#hf_DeleteFile').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            if (response) {
                $.bootstrapGrowl('File Deleted Successfully!', {
                    type: 'info',
                    delay: 5000,
                });

            }
            $(btndel).closest('tr').remove();
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again.. ! ', {
                type: 'danger',
                delay: 5000,
            });
        }
    });

}

function DeleteAllFileFolder() {
    var data =
    {
        aTickitID: $("#theCount").text()


    };
    $.ajax({
        type: 'post',
        url: $('#hf_DeleteallFilesFromFolder').val(),
        data: data,
        datatype: 'json',
        success: function (response) {



        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again.. ! ', {
                type: 'danger',
                delay: 5000,
            });
        }
    });

}

function AddTicketData() {
    var validatedata = validate('#Formdata');
    if (validatedata) {
        var getFileList = [];
        getFileList = GetTableRowToList('tblAddAttachment');
        var aitemInfoP = {

            Ticket_No: $('#theCount').text(),
            subject: $('#txtsubject').val(),
            description: $('#TxtAUMailBody').val(),
            priority: $("input:radio[name=priority]:checked").val(),
            zTime: time,
            FileListL: getFileList


        }
        $.ajax({
            type: 'post',
            url: $('#hf_AddTicket').val(),
            data: JSON.stringify(aitemInfoP),
            contentType: 'application/json;charset=utf-8',
            datatype: 'json',
            success: function (response) {
                $.bootstrapGrowl('Ticket Raised!', {
                    type: 'info',
                    delay: 5000,
                });

                $('#myModal').modal('hide');
                ClearPopup();
                GetTicketDetails_User();
                ShowTicketDetailsToAdmin('Pending');
            },

            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 5000,
                });
            }
        });

    }


}

function GetTicketDetails_User(zType) {
    if (zType == null)
        zType = $('#BkTabul li.active').text()
    var data = {

        aStatus: zType
    };

    $.ajax({
        type: 'post',
        url: $('#hf_GetHelpdeskDetails').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var zitem = response.aitemList;
            var zTicketList = "";
            $('#ticketdetail').html('');

            $.each(zitem, function (i, e) {

                var imgPath = "";
                if (zitem[i].Status == "Pending") {
                    imgPath = '../Images/Covers/default.png';
                }
                if (zitem[i].Status == "Reopened") {
                    imgPath = '../Images/Covers/lightblueP.png';
                }
                if (zitem[i].Status == "Resolved") {
                    imgPath = '../Images/Covers/green.png';
                }
                if (zitem[i].Status == "Closed") {
                    imgPath = '../Images/Covers/spColdPurple.png';
                }



                zTicketList +=
                    '<div class="col-sm-2">' +
                    '<figure class="snip1529" style="height: 192px;">' +
                    '<img src=' + imgPath + ' />' +
                    '<div class="date"><span class="month">' + zitem[i].Status + ' </span></div>' +

                    '<figcaption>' +
                    '<h3>Subject :- ' + zitem[i].subject + '</h3>' +
                    '<h4>Priority :- ' + zitem[i].priority + '</h4>' +
                    '<h4>Created On ' + FormatDateColumn(zitem[i].Created_Date) + '</h4>' +
                    '</figcaption >' +
                    '<div class="hover">History Details</div><a onclick="PopulateTicketInfo(' + zitem[i].ID + ')"></a>' +

                    '</figure>' +
                    '</div>';


            });

            $('#ticketdetail').html(zTicketList);
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

function ShowTicketDetailsToAdmin(zType) {
    
    if (zType == null)
        zType = $('#BkTabul li.active').text();

    var data = {aStatus: zType};
    $.ajax({
        type: 'post',
        url: $('#hf_GetallHDdetails').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var zitem = response.aitemList;
            var zTicketList = "";
            $('#tktDetailAdmin').html('');
            $.each(zitem, function (i, e) {

                var imgPath = "";
                if (zitem[i].Status == "Pending") {
                    imgPath = '../Images/Covers/default.png';
                }
                if (zitem[i].Status == "Reopened") {
                    imgPath = '../Images/Covers/lightblueP.png';
                }
                if (zitem[i].Status == "Resolved") {
                    imgPath = '../Images/Covers/green.png';
                }
                if (zitem[i].Status == "Closed") {
                    imgPath = '../Images/Covers/spColdPurple.png';
                }
                zTicketList +=
                    '<div class="col-sm-2">' +
                    '<figure class="snip1529" style="height: 192px;">' +
                    '<img src=' + imgPath + ' />' +
                    '<div class="date"><span class="month">' + zitem[i].Status + ' </span></div>' +

                    '<figcaption>' +
                    '<h3>Subject :- ' + zitem[i].subject + '</h3>' +

                    '<h4>Priority :- ' + zitem[i].priority + '</h4>' +
                    '<h4>Created On ' + FormatDateColumn(zitem[i].Created_Date) + '</h4>' +
                    '</figcaption >' +
                    '<div class="hover">History Details</div><a onclick="PopulateTicketInfo_Admin(' + zitem[i].ID + ')"></a>' +

                    '</figure>' +
                    '</div>';


            });

            $('#tktDetailAdmin').html(zTicketList);
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

function PopulateTicketInfo_Admin(aID) {

    var astatus = $('#BkTabul li.active').text();

    if (astatus == "Pending") {
        $('#btnview').hide();
        $('#btnresolve').show();
    }
    if (astatus == "Closed") {
        $('#btnview').hide();
        $('#btnresolve').hide();
    }
    if (astatus == "Resolved") {
        $('#btnview').hide();
        $('#btnresolve').hide();
    }
    if (astatus == "Reopened") {
        $('#btnview').show();
        $('#btnresolve').show();
    }

    $('#divTicketPopulate').html('');
    $('#ticktRID').hide();
    $('#ticktRID').text(aID);

    var data = {
        TicketID: aID

    }

    $.ajax({
        type: 'post',
        url: $('#hf_GetHelpdeskDetailsByTicketID').val(),
        data: data,
        datatype: 'json',
        success: function (response) {


            var ztable = "<table id='tblResponse' class='tblTrans' style='margin-left: 16px;width: 95% !important;'><tr><th style='font-weight:bolder;font-size:13px;'>Title</th><th style='font-weight:bolder;font-size:13px;'>Details</th></tr>";
            var items = response.aitemList;
            var items_reason = response.aitemList_Reason;
            $('#btnview').show();
            if (items_reason.length == 0) {
                $('#btnview').hide();
            }

            for (var i = 0; i < items.length; i++) {

                ztable += "<tr>";
                ztable += "<td style='font-weight:bolder;font-size:13px;'>Ticket ID </td><td>" + items[i].ID + "</td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td style='font-weight:bolder;font-size:13px;'>Subject </td><td>" + items[i].subject + "</td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td style='font-weight:bolder;font-size:13px;'>Created Date </td><td>" + FormatDateColumn(items[i].Created_Date) + " </td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td style='font-weight:bolder;font-size:13px;'>Description </td><td>" + items[i].description + "</td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td style='font-weight:bolder;font-size:13px;'>Priority </td><td>" + items[i].priority + "</td>";
                ztable += "</tr>";
                ztable += "<tr>";
                if (items[i].Status == "Pending") {
                    ztable += "<td style='font-weight:bolder;font-size:13px;'>Status </td><td><b><span class='text' style='font-size:13px;color:red'>" + items[i].Status + "</span></b></td>";
                }
                if (items[i].Status == "Closed") {
                    ztable += "<td style='font-weight:bolder;font-size:13px;'>Status </td><td><b><span class='text' style='font-size:13px;color:green'>" + items[i].Status + "</span></b></td>";

                }
                if (items[i].Status == "Resolved") {
                    ztable += "<td style='font-weight:bolder;font-size:13px;'>Status </td><td><b><span class='text' style='font-size:13px;color:green'>" + items[i].Status + "</span></b></td>";

                }
                if (items[i].Status == "Reopened") {
                    ztable += "<td style='font-weight:bolder;font-size:13px;'>Status </td><td><b><span class='text' style='font-size:13px;color:red'>" + items[i].Status + "</span></b></td>";
                }

                ztable += "</tr>";


                //$.each(items_reason, function (i, e) {
                //    ztable += "<tr>";
                //    ztable += "<td style='font-weight:bolder;font-size:13px;'>Reason " + (i + 1) + " To reopen </td>";
                //    ztable += "<td>" + e.Comment + " Submitted On " + FormatDateColumn(e.SubmittedDate) + "</td>";
                //    ztable += "</tr>";

                //})

                ztable += "<tr>";
                ztable += "<td style='font-weight:bolder;font-size:13px;'>Submitted By </td><td>" + isNullCheck(items[i].Submitedname) + " </td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td style='font-weight:bolder;font-size:13px;'>Resolved By </td><td>" + isNullCheck(items[i].Reslovename) + " </td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td style='font-weight:bolder;font-size:13px;'>Attachment </td><td>" + (items[i].Attachment != null ? "<a href='" + items[i].Attachment.toString().replace('~', '../') + "' download><i class='fa fa-download'></i>" : "No Attachment Available") + " </td>";
                ztable += "</tr>";


            }

            ztable += "</table>"


            $('#divTicketPopulate').html(ztable);


        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 2000,
            });
        }
    });

    $("#myModal_ViewTicket").modal({ backdrop: 'static', keyboard: false });


}

function PopulateTicketInfo(aID) {

    var astatus = $('#BkTabul li.active').text();

    if (astatus == "Pending") {
        $('#btnReopen').hide();
        $('#btndelete').show();
    }
    if (astatus == "Closed") {
        $('#btndelete').hide();
        $('#btnReopen').show();
    }
    if (astatus == "Resolved") {
        $('#btndelete').show();
        $('#btnReopen').show();
    }
    if (astatus == "Reopened") {
        $('#btndelete').show();
        $('#btnReopen').hide();

    }
    $('#divTicketPopulate').html('');
    $('#ticktRID').hide();
    $('#ticktRID').text(aID);

    var data = {
        TicketID: aID

    }

    $.ajax({
        type: 'post',
        url: $('#hf_GetHelpdeskDetailsByTicketID').val(),
        data: data,
        datatype: 'json',
        success: function (response) {


            var ztable = "<table id='tblResponse' class='tblTrans' style='margin-left: 16px;width: 95% !important;'><tr><th style='font-weight:bolder;font-size:13px;'>Title</th><th style='font-weight:bolder;font-size:13px;'>Details</th></tr>";
            var items = response.aitemList;
            var items_reason = response.aitemList_Reason;


            $('#btnview_user').show();
            if (items_reason.length == 0) {
                $('#btnview_user').hide();
            }


            for (var i = 0; i < items.length; i++) {


                ztable += "<tr>";
                ztable += "<td style='font-weight:bolder;font-size:13px;'>Subject </td><td>" + items[i].subject + "</td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td style='font-weight:bolder;font-size:13px;'>Created Date </td><td>" + FormatDateColumn(items[i].Created_Date) + " </td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td style='font-weight:bolder;font-size:13px;'>Description </td><td>" + items[i].description + "</td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td style='font-weight:bolder;font-size:13px;'>Priority </td><td>" + items[i].priority + "</td>";
                ztable += "</tr>";
                ztable += "<tr>";
                if (items[i].Status == "Pending") {
                    ztable += "<td style='font-weight:bolder;font-size:13px;'>Status </td><td><b><span class='text' style='font-size:13px;color:red'>Your Ticket is " + items[i].Status + "</span></b></td>";
                }
                if (items[i].Status == "Closed") {
                    ztable += "<td style='font-weight:bolder;font-size:13px;'>Status </td><td><b><span class='text' style='font-size:13px;color:green'>Your Ticket is " + items[i].Status + "</span></b></td>";

                }
                if (items[i].Status == "Resolved") {
                    ztable += "<td style='font-weight:bolder;font-size:13px;'>Status </td><td><b><span class='text' style='font-size:13px;color:green'>Your Ticket is " + items[i].Status + "</span></b></td>";
                }
                if (items[i].Status == "Reopened") {
                    ztable += "<td style='font-weight:bolder;font-size:13px;'>Status </td><td><b><span class='text' style='font-size:13px;color:red'>Your Ticket is " + items[i].Status + "</span></b></td>";
                }

                ztable += "</tr>";


                //$.each(items_reason, function (i, e) {
                //    ztable += "<tr>";
                //    ztable += "<td style='font-weight:bolder;font-size:13px;'>Reason " + (i + 1) + " To reopen </td>";
                //    ztable += "<td>" + e.Comment + " Submitted On " + FormatDateColumn(e.SubmittedDate) + "</td>";
                //    ztable += "</tr>";

                //})

                ztable += "<tr>";
                ztable += "<td style='font-weight:bolder;font-size:13px;'>Resolved By </td><td>" + isNullCheck(items[i].Reslovename) + " </td>";
                ztable += "</tr>";
                ztable += "<tr>";
                ztable += "<td style='font-weight:bolder;font-size:13px;'>Attachment </td><td>" + (items[i].Attachment != null ? "<a href='" + items[i].Attachment.toString().replace('~', '../') + "' download><i class='fa fa-download'></i>" : "") + " </td>";
                ztable += "</tr>";


            }

            ztable += "</table>"


            $('#divTicketPopulate').html(ztable);


        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 2000,
            });
        }
    });

    $("#myModal_ViewTicket").modal({ backdrop: 'static', keyboard: false });


}

function ViewReasons(zID) {
    var zID = $('#ticktRID').text();
    //var zID = $(aid).closest('tr').find('td')[0].innerText;

    var data = {TicketID: zID}
    $.ajax({
        type: 'post',
        url: $('#hf_GetReasonsbyTicketID').val(),
        data: data,
        datatype: 'json',
        success: function (response) {

            var zitem = response.aitemList;

            $('#divReasonPopulate').html('');
            var Stable = "<table id='tblResponse' class='tblTrans' style='margin-left: 16px;width: 95% !important;'><tr><th style='font-weight:bolder;font-size:13px;'>Reasons</th><th style='font-weight:bolder;font-size:13px;'>Created On</th><th style='font-weight:bolder;font-size:13px;'>Submitted By</th></tr>";

            $.each(zitem, function (i, e) {
                Stable += "<tr>";
                Stable += "<td>" + e.Comment + "</td><td>" + FormatDateColumn(e.SubmittedDate) + "</td><td>" + e.Submitedname + "</td>";
                Stable += "</tr>";

            }) 
            Stable += "</table>";



            $('#divReasonPopulate').html(Stable);
            $('#LoadingImage').hide();
        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 2000,
            });
        }
    });



    $("#myModal_ViewAllReason").modal({ backdrop: 'static', keyboard: false });


}



function DeleteTicket(aid) {
    var aid = $('#ticktRID').text();
    $('#LoadingImage').show();
    var data = { nID: aid }
    $.ajax({
        type: 'post',
        url: $('#hf_DeleteTicket').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            //$.bootstrapGrowl(response, {
            //    type: 'info',
            //    delay: 5000,
            //});
            GetTicketDetails_User();
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

function UpdateTicketStatusbyAdmin(zID) {
    var zID = $('#ticktRID').text();

    var data = {
        aID: zID

    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateTicketStatus').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            $.bootstrapGrowl(response, {
                type: 'info',
                delay: 5000,
            });
            ShowTicketDetailsToAdmin('Pending');
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

function SendStatusbyMail(aTicketID) {
    var data = {
        zTicketID: aTicketID,
        zComment: $('#txtreason').val()
    }
    $.ajax({
        type: 'post',
        url: $('#hf_SendMailToUser').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            if (response.toString().indexOf('Error') != -1) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 2000,
                });
            }
            //else {
            //    $.bootstrapGrowl(response, {
            //        type: 'info',
            //        delay: 2000,
            //    });


            //}

        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 2000,
            });

        }
    });

}


function validate(form) {
    var zResult = true;
    if ($('#txtsubject').val() == '') {
        $.bootstrapGrowl('Enter Subject !', { type: 'danger', delay: 5000, });
        $('#txtsubject').focus();
        zResult = false;
    }
    else if ($('#TxtAUMailBody').val() == '') {
        $.bootstrapGrowl("Enter Description !", { type: 'danger', delay: 5000, });
        $('#TxtAUMailBody').focus();
        zResult = false;
    }
    else if ($("input:radio[name=priority]:checked").val() == null) {
        $.bootstrapGrowl("Select Priority !", { type: 'danger', delay: 5000, });
        //$('#txtUpdatedBy').focus();
        zResult = false;
    }
    return zResult;
}




//Information dissemination management

var nBookIDG;
var nChapterIDG;

$(function () {
    $("#ddlChapter_Instruction").select2({ placeholder: "Select", allowClear: true, tags: true }); $("#ddlChapter_Instruction").val(-1).change();
    $("#ddlBookID_Instruction").select2({ placeholder: "Select", allowClear: true }); $("#ddlBookID_Instruction").val(-1).change();
    $("#ddlInstType_Instruction").select2({ placeholder: "Select", allowClear: true }); $("#ddlInstType_Instruction").val(-1).change();

    $('#ddlBookID_Instruction').change(function () {
        
        $("#ddlChapter_Instruction").empty();
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
                
                $("#ddlChapter_Instruction").empty();
                for (var i = 0; i < items.length; i++) {

                    $("#ddlChapter_Instruction").append("<option value='" + items[i].Value + "'>" + items[i].Text + "</option>");
                }
            
                if (nChapterIDG != null && nBookIDG == $('#ddlBookID_Instruction').val()) {
                    var zChapterList = nChapterIDG;
                    try {
                        var data = zChapterList.split(',');
                        var selectedValues = new Array();
                        try {
                            for (var i = 0; i < data.length; i++) {
                                selectedValues[i] = data[i];
                            }
                        } catch (e) { }
                        
                        $('#ddlChapter_Instruction').val(selectedValues).change();

                    } catch (e) {
                        $('#ddlChapter_Instruction').val(-1).change();
                    }
                }
                else {
                    nBookIDG = null;
                    nChapterIDG = null;
                    
                    $("#ddlChapter_Instruction").val(-1).change();
                }
                
                if (aChapterListG != null) {
                    $("#ddlChapter_Instruction").val(aChapterListG).change();
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
   

    $("#btnSave_Instruction").click(function () {
        var validate = CheckExistingData();
        if (validate) {

            AddInstruction();
        }
    })



});

function AddInstruction() {
    var validate = ValidateInstructionForm('#FormInstData');
    if (validate) {

        var aitemInfoP = {
            Inst_ID: aInstructionID,
            BookID: ($('#ddlBookID_Instruction').val() == null ? null : $('#ddlBookID_Instruction').val().toString()),
            ChapterNo: ($('#ddlChapter_Instruction').val() == null ? null : $('#ddlChapter_Instruction').val().toString()),
            Instruction_Type: ($('#ddlInstType_Instruction').val() == null ? null : $('#ddlInstType_Instruction').val().toString()),
            Instruction: $("#txtInstruction").val(),



        }
        $.ajax({
            type: 'post',
            url: $('#hf_AddInstruction').val(),
            data: JSON.stringify(aitemInfoP),
            contentType: 'application/json;charset=utf-8',
            datatype: 'json',
            success: function (response) {
                $.bootstrapGrowl('Details Submitted!', {
                    type: 'info',
                    delay: 5000,
                });
                ClearInstData();
                CallInstList();
                $('#myModal_Instruction').modal('hide');

            },

            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 5000,
                });
            }
        });
    }


}

function CallInstList() {
    $('#LoadingImage').show();


    $.ajax({
        type: 'post',
        url: $('#hf_PopulateInstructionData').val(),
        data: JSON.stringify(),
        datatype: 'json',
        success: function (response) {

            FetechInstData(response.aitemList);

            $('#LoadingImage').hide();
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

function FetechInstData(ItemsList) {
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


                $(this)[0]["BookID"],
                $(this)[0]["ChapterNo"],
                $(this)[0]["Instruction_Type"],
                $(this)[0]["Instruction"],
                //$(this)[0]["LoginName"],
                FormatDateColumn($(this)[0]["CreatedTime"]),
                $(this)[0]["Inst_ID"]
            ];
            dataSet.push(t);
        });
        LoadDataInst();
        $('.imgLoader').hide();
    } catch (e) {

    }
}

function LoadDataInst() {
    
    var table = $('#Instruction').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[15, 25, 50, 75, 100, -1], [15, 25, 50, 75, 100, "All"]],
        data: dataSet,
        columns: [
            //{ title: "S.No.", width: "20" },

            {
                title: "Book ID", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Chapter No", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Instruction Type", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spDescription">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Instruction", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spDescription">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            //{
            //    title: "LoginName", "bSortable": false, "render": function (data, type, full, meta) {
            //        return '<span class="spDescription">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
            //    }
            //},
            { title: "Created Date" },
            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class=spDeleteIcon><i class="fa fa-trash" aria-hidden="true" title="Delete" data-col="Name" onclick="DeleteInstData(' + isNullCheck(data) + ');"></i></span>' +
                        '<span class=spUpdateIcon><i class="fa fa-pen" aria-hidden="true" title="Edit" data-col="Name" onclick="UpdateInstInfo(' + isNullCheck(data) + ');"></i></span>';
                }
            }


        ],
        columnDefs: [
            { type: 'date-dd-mmm-yyyy', targets: [4] }
        ],
        "destroy": true,
        //"order": [[9, 'asc']],
        //fixedHeader: {
        //    header: true
        //},
        "scrollY": (size.height - 180),
        "scrollX": true,
        "createdRow": function (row, data, dataIndex) {
            $($(row).find('td')[4]).attr('data-id', data[6]);//PublisherID
            CheckAccessRights();
        },
        drawCallback: function () {
            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                .on('click', function () {
                    CheckAccessRights();
                });
        },
        buttons: [
            {
                text: '<button class="btn btn-primary spAddIcon" style="display:none"><i class="fa fa-handshake"></i> Add</button>',
                
                action: function (e, dt, node, config) {
                    clearForm('#divInstruction');
                   
                    $("#ddlBookID_Instruction").prop("disabled", false);
                    $("#myModal_Instruction").modal({ backdrop: 'static', keyboard: false });
                }

            },
        ]
    });
    CheckAccessRights();
}

function UpdateInstInfo(aID) {
    aInstructionID = aID;

    InstructionDetails(aID);
    $('#myModal_Instruction').modal({ backdrop: 'static', keyboard: false });
}

function InstructionDetails(zitem) {
    if (zitem == null || zitem == 0) {
        clearForm('#divInstruction');
    }
    else {
        clearForm('#divInstruction'); 
         
        var data = { aInstID: zitem }
        $.ajax({
            type: 'post',
            url: $('#hf_PopulateInstructionByID').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var items = response.aitemList;
               
              
                if ($('#ddlBookID_Instruction').val(items.BookID) != null) {
                    $("#ddlBookID_Instruction").prop("disabled", true);
                }
                $('#ddlBookID_Instruction').val(items.BookID).change();
                $('#txtInstruction').val(items.Instruction);


                zchapterList = null;
                try {
                    var data = items.ChapterNo.split(',');
                    var selectedValues = new Array();
                    try {
                        for (var i = 0; i < data.length; i++) {
                            selectedValues[i] = data[i];
                        }
                    } catch (e) { }

                    zchapterList = selectedValues;
                    $('#ddlChapter_Instruction').val(selectedValues).change();

                    aChapterListG = selectedValues;

                } catch (e) {

                }

                zList = null;
                try {
                    var data = items.Instruction_Type.split(',');
                    var selectedValues = new Array();
                    try {
                        for (var i = 0; i < data.length; i++) {
                            selectedValues[i] = data[i];
                        }
                    } catch (e) { }

                    zList = selectedValues;
                    $('#ddlInstType_Instruction').val(selectedValues).change();

                } catch (e) {

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

function DeleteInstData(ID) {
    
    bootbox.confirm("Are you sure to Delete ?",
        function (result) {
            if (result) {

                deleteInstruction(ID);

            }
        });
  
}

function deleteInstruction(aid) {

    $('#LoadingImage').show();
  
    var data = { nID: aid }
    $.ajax({
        type: 'post',
        url: $('#hf_DeleteInstruction').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            $.bootstrapGrowl(response, {
                type: 'info',
                delay: 5000,
            });
            CallInstList();
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

function ClearInstData() {
    $('#ddlBookID_Instruction').val(null).change();
    $('#ddlChapter_Instruction').val(null).change();
    $('#ddlInstType_Instruction').val(null).change();
    $('#txtInstruction').val('');
}

function ValidateInstructionForm(form) {
    var zResult = true;
    if ($('#ddlBookID_Instruction').val() == null) {
        $.bootstrapGrowl('Select Book ID !', { type: 'danger', delay: 5000, });
        $('#ddlBookID_Instruction').focus();
        zResult = false;
    }
    //else if ($('#ddlChapter_Instruction').val() == null) {
    //    $.bootstrapGrowl("Select Chapter ID !", { type: 'danger', delay: 5000, });
    //    $('#ddlChapter_Instruction').focus();
    //    zResult = false;
    //}
    else if ($('#ddlInstType_Instruction').val() == null) {
        $.bootstrapGrowl("Select Instruction Type !", { type: 'danger', delay: 5000, });
        $('#ddlInstType_Instruction').focus();
        zResult = false;
    }
    else if ($('#txtInstruction').val() == '') {
        $.bootstrapGrowl("Enter Instruction !", { type: 'danger', delay: 5000, });
        $('#txtInstruction').focus();
        zResult = false;
    }
    return zResult;
}

function CheckExistingData() {

    
    var data = {
        zBookID: $('#ddlBookID_Instruction').val(),
       
        zchapterno: $('#ddlChapter_Instruction').val().toString()
    };

    $.ajax({
        type: 'get',
        url: $('#hf_CheckExistingData').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            if (response) {
                $.bootstrapGrowl('Already found !', {
                    type: 'danger',
                    delay: 5000,
                });
                $('#ddlChapter_Instruction').val(null).change();
            }

        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again.. !', {
                type: 'danger',
                delay: 5000,
            });
        }
    });
}