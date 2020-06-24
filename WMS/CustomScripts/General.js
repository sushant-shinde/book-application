var aMailID = 0;
var aPublID = 0;
var aQueryID = 0;
$(function () {
    $('#txtmailcontent').jqte();
    $('#myModal_MailTemplate .jqte_editor').css('height', size.height - 300);
    //$('#txtmailbody').jqte();
    $('#myModal_QueryTemplate .jqte_editor').css('height', size.height - 450);

    $("#ddlYears").select2({ placeholder: "Select", allowClear: true });
    
    $("#ddlPublisherList").select2({ placeholder: "Select Publisher", allowClear: true }); $("#ddlPublisherList").val(-1).change();
    CallMailList();
    CallPublisherList();
    CallTemplateList();

    $("#btnSave_MailContent").click(function () {
        var validate = CheckValidateData();
        if (validate) {


        }
    })

    $("#btnSave_PublDetails").click(function () {
        UpdatePublDetails();
    })

    $("#btnSave_QueryTemp").click(function () {
        var validate = CheckValidateDataQuery();
        if (validate) {


        }
    })
});

function CheckValidateData() {
    var zResult = true;
    if ($('#txttemplate').val() == "") {
        $.bootstrapGrowl("Enter Template!", { type: 'danger', delay: 2000, });
        $('#txttemplate').focus();
        zResult = false;
    }
    else if ($('#txtmailcontent').val() == "" && $('#myModal_MailTemplate .jqte_editor').html() == '') {
        $.bootstrapGrowl("Enter Mail Content !", { type: 'danger', delay: 2000, });
        $('#txtmailcontent').focus();
        zResult = false;
    }
    else {

        if (aMailID == 0) {
            var data = {
                SNo: aMailID,
                zTemplate: $('#txttemplate').val()
            };
            $.ajax({
                type: 'get',
                url: $('#hf_CheckExistingData').val(),
                data: data,
                datatype: 'json',
                allowHtml: true,
                success: function (response) {
                    if (response.length > 0) {
                        zResult = false;
                        $.bootstrapGrowl('Template Already found !', {
                            type: 'danger',
                            delay: 5000,
                        });
                        $('#txttemplate').val('');
                        $('#myModal_MailTemplate .jqte_editor').html('');
                    }
                    else {
                        AddMailContent();
                    }

                },
                error: function (result) {
                    zResult = false;
                    $.bootstrapGrowl('Error Occured, Try Again.. !', {
                        type: 'danger',
                        delay: 5000,
                    });
                }
            });

        }

        else {

            AddMailContent();
        }
       
    }

}

function AddMailContent() {

  var aitemInfoP = {
            SNo: aMailID,
            Template: $('#txttemplate').val(),
            MailContent: $('#txtmailcontent').val()

        }
        $.ajax({
            type: 'post',
            url: $('#hf_UpdateMailTemplate').val(),
            data: JSON.stringify(aitemInfoP),
            contentType: 'application/json;charset=utf-8',
            datatype: 'json',
            success: function (response) {
                $.bootstrapGrowl('Details Submitted!', {
                    type: 'info',
                    delay: 5000,
                });
                ClearMailData();
                CallMailList();
                $('#myModal_MailTemplate').modal('hide');

            },

            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 5000,
                });
            }
        });

   
}

function CallMailList() {
    $('#LoadingImage').show();


    $.ajax({
        type: 'post',
        url: $('#hf_GetMailTemplateDetails').val(),
        data: JSON.stringify(),
        datatype: 'json',
        success: function (response) {

            FetchMailData(response.aitemList);

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

function FetchMailData(ItemsList) {
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
                $(this)[0]["Template"],
                $(this)[0]["CreatedBy"],
                $(this)[0]["UpdatedBy"],
                $(this)[0]["SNo"]
            ];
            dataSet.push(t);
        });
        LoadDataMail();
        $('.imgLoader').hide();
    } catch (e) {

    }
}

function LoadDataMail() {

    var table = $('#MailTemplate').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[15, 25, 50, 75, 100, -1], [15, 25, 50, 75, 100, "All"]],
        data: dataSet,
        columns: [
            //{ title: "S.No.", width: "20" },
            { title: "S.No." },
            {
                title: "Template", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Created By", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },


            {
                title: "Updated By", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class=spUpdateIcon><i class="fa fa-pen" aria-hidden="true" title="Edit"  data-col="Name" onclick="PopulateMailContentbyID(' + isNullCheck(data) + ');"></i></span>';
                        
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
                text: '<button class="btn btn-primary spAddIcon"><i class="fa fa-handshake"></i> Add</button>',

                action: function (e, dt, node, config) {
                    clearForm('#divMailContent');
                    aMailID = 0;
                    
                    $('#myModal_MailTemplate .jqte_editor').html('');
                    $("#txttemplate").prop("disabled", false);
                    $("#myModal_MailTemplate").modal({ backdrop: 'static', keyboard: false });
                }

            },
        ]
    });
    CheckAccessRights();
}

function PopulateMailContentbyID(aID) {
    aMailID = aID;

   MailContentDetails(aID);
    $('#myModal_MailTemplate').modal({ backdrop: 'static', keyboard: false });
}

function MailContentDetails(zitem) {
    if (zitem == null || zitem == 0) {
        clearForm('#divMailContent');
    }
    else {
        clearForm('#divMailContent');

        var data = { aID: zitem }
        $.ajax({
            type: 'post',
            url: $('#hf_PopulateMailDetailsByID').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var items = response.aitemList;


                if ($('#txttemplate').val() != null) {
                    $("#txttemplate").prop("disabled", true);
                }
                $('#txttemplate').val(items.Template);
                $('#txtmailcontent').val(items.MailContent);
                $('#myModal_MailTemplate .jqte_editor').html(isNullCheck(items.MailContent));

              
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

function ClearMailData() {
    $('#txttemplate').val('');
    $('#txtmailcontent').val('');
    $('#myModal_MailTemplate .jqte_editor').html('');
}


//Publisher Details
function CallPublisherList() {
    $('#LoadingImage').show();


    $.ajax({
        type: 'post',
        url: $('#hf_GetPublisherDetails').val(),
        data: JSON.stringify(),
        datatype: 'json',
        success: function (response) {

            FetchPublisherData(response.aitemList);

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

function FetchPublisherData(ItemsList) {
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
                $(this)[0]["Publ_Acronym"],
                $(this)[0]["Publ_Title"],
                $(this)[0]["Publ_Status"],
                $(this)[0]["Publ_Journal"],
                $(this)[0]["Publ_Book"],
                $(this)[0]["Active"],
                $(this)[0]["ActiveYear"],
                $(this)[0]["Publ_ID"]

            ];
            dataSet.push(t);
        });
        LoadDataPublisher();
        $('.imgLoader').hide();
    } catch (e) {

    }
}

function LoadDataPublisher() {

    var table = $('#Publisher').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[15, 25, 50, 75, 100, -1], [15, 25, 50, 75, 100, "All"]],
        data: dataSet,
        columns: [
            //{ title: "S.No.", width: "20" },
            { title: "S.No." },
            {
                title: "Publisher Acronym", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (data == ''? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Publisher Title", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (data ==null ? '--' : isNullCheck(data)) + '</span>';
                }
            },


            {
                title: "Publisher Status", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (data == null ? '--' : isNullCheck(data)) + '</span>';
                }
            },

            {
                title: "Publisher Journal", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (data == null ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Publisher Book", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (data == null? '--' : isNullCheck(data)) + '</span>';
                }
            },


            {
                title: "Active", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '1' ? "<i class='fa fa-check' style='color:green;cursor:text'></i>" : "<i class='fa fa-times facenter' style='color:red;cursor:text'></i>") + '</span>';
                }
            },
            {
                title: "Active Year", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class=spUpdateIcon><i class="fa fa-pen" aria-hidden="true" title="Edit"  data-col="Name" onclick="PopulatePublisherDatabyID(' + isNullCheck(data) + ');"></i></span>';

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
                

            },
        ]
    });
    CheckAccessRights();
}

function PopulatePublisherDatabyID(aID) {
    aPublID = aID;

    PublisherDetails(aID);
    $('#myModal_PublDetails').modal({ backdrop: 'static', keyboard: false });  
}

function PublisherDetails(zitem) {
    if (zitem == null || zitem == 0) {
        clearForm('#divPublDetails');
    }
    else {
        clearForm('#divPublDetails');

        var data = { aID: zitem }
        $.ajax({
            type: 'post',
            url: $('#hf_PopulatePublisherDetailsByID').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var items = response.aitemList;

                    $("#txtpublacronym").prop("disabled", true);
                    $("#txtpubltitle").prop("disabled", true);
                    $("#txtpublstatus").prop("disabled", true);
                    $("#txtpubljournal").prop("disabled", true);
                    $("#txtpublbook").prop("disabled", true);
                    $('#LoadingImage').hide();

                $('#txtpublacronym').val(isNullCheck(items.Publ_Acronym));
                $('#txtpubltitle').val(isNullCheck(items.Publ_Title));
                $('#txtpublstatus').val(isNullCheck(items.Publ_Status));
                $('#txtpubljournal').val(isNullCheck(items.Publ_Journal));
                $('#txtpublbook').val(isNullCheck(items.Publ_Book));
                $('#ddlYears').val(isNullCheck(items.ActiveYear)).change();
               
                items.Active == '1' ? $('#rdYes').not('[disabled="disabled"]').prop('checked', 'checked') : $('#rdNo').not('[disabled="disabled"]').prop('checked', 'checked');
               
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

function UpdatePublDetails() {

    var zResult = true;
    if ($("input:radio[name=Status]:checked").val() == 1 && $('#ddlYears').val() == null ) {
        $.bootstrapGrowl("Select Year!", { type: 'danger', delay: 2000, });
        $('#ddlYears').focus();
        zResult = false;
    }
   
    else {
        var aiteminfoP = {
             Publ_ID: aPublID,
             Active: $("input:radio[name=Status]:checked").val(),
             ActiveYear: $('#ddlYears').val(),
            

        }
        $.ajax({
            type: 'post',
            url: $('#hf_UpdatePublDetails').val(),
            data: JSON.stringify(aiteminfoP),
            contentType: 'application/json;charset=utf-8',
            datatype: 'json',
            success: function (response) {
                $.bootstrapGrowl('Details Updated!', {
                    type: 'info',
                    delay: 5000,
                });
               
                CallPublisherList();
                $('#myModal_PublDetails').modal('hide');

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



//Query Template 

function CallTemplateList() {
    $('#LoadingImage').show();


    $.ajax({
        type: 'post',
        url: $('#hf_GetQueryTemplate').val(),
        data: JSON.stringify(),
        datatype: 'json',
        success: function (response) {

            FetchQueryData(response.aitemList);

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

function FetchQueryData(ItemsList) {
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
                $(this)[0]["TemplateName"],
                $(this)[0]["PublisherName"],
                $(this)[0]["Subject"],
                $(this)[0]["Createdby"],
                $(this)[0]["Updatedby"],
                $(this)[0]["SNo"]
            ];
            dataSet.push(t);
        });
        LoadDataQuery();
        $('.imgLoader').hide();
    } catch (e) {

    }
}

function LoadDataQuery() {

    var table = $('#QueryTemplate').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[15, 25, 50, 75, 100, -1], [15, 25, 50, 75, 100, "All"]],
        data: dataSet,
        columns: [
            //{ title: "S.No.", width: "20" },
            { title: "S.No." },
            {
                title: "Template Name", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Publisher Name", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Subject", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Created By", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },


            {
                title: "Updated By", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class=spUpdateIcon><i class="fa fa-pen" aria-hidden="true" title="Edit"  data-col="Name" onclick="PopulateQueryTempbyID(' + isNullCheck(data) + ');"></i></span>';

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
                text: '<button class="btn btn-primary spAddIcon"><i class="fa fa-handshake"></i> Add</button>',

                action: function (e, dt, node, config) {
                    clearForm('#divQueryTemp');
                    aQueryID = 0;

                    $('#myModal_QueryTemplate .jqte_editor').html('');
                   
                    $("#myModal_QueryTemplate").modal({ backdrop: 'static', keyboard: false });
                }

            },
        ]
    });
    CheckAccessRights();
}

function AddQueryTemplate() {

    var aiteminfoP = {
        SNo: aQueryID,
        TemplateName: $('#txttemplatename').val(),
        Subject: $('#txtQuerysubject').val(),
        PublisherID: $('#ddlPublisherList').val(),
        MailBoady: $('#txtmailbody').val()

    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateQueryDetails').val(),
        data: JSON.stringify(aiteminfoP),
        contentType: 'application/json;charset=utf-8',
        datatype: 'json',
        success: function (response) {
            $.bootstrapGrowl('Details Submitted!', {
                type: 'info',
                delay: 5000,
            });
            ClearQueryData();
            CallTemplateList();
            $('#myModal_QueryTemplate').modal('hide');

        },

        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
        }
    });


}

function CheckValidateDataQuery() {
    var zResult = true;
    if ($('#ddlPublisherList').val() == null) {
        $.bootstrapGrowl("Select Publisher!", { type: 'danger', delay: 2000, });
        $('#ddlPublisherList').focus();
        zResult = false;
    }

   else if ($('#txttemplatename').val() == "") {
        $.bootstrapGrowl("Enter Template Name!", { type: 'danger', delay: 2000, });
        $('#txttemplatename').focus();
        zResult = false;
    }
    else if ($('#txtQuerysubject').val() == "") {
        $.bootstrapGrowl("Enter Subject!", { type: 'danger', delay: 2000, });
        $('#txtQuerysubject').focus();
        zResult = false;
    }
    
    else if ($('#txtmailbody').val() == "") {
        $.bootstrapGrowl("Enter Mail Content !", { type: 'danger', delay: 2000, });
        $('#txtmailbody').focus();
        zResult = false;
    }
    else {

        if (aQueryID == 0) {
            var data = {
                SNo: aQueryID,
                zTemplate: $('#txttemplatename').val()
            };
            $.ajax({
                type: 'get',
                url: $('#hf_CheckExistingDataQuery').val(),
                data: data,
                datatype: 'json',
                allowHtml: true,
                success: function (response) {
                    if (response.length > 0) {
                        zResult = false;
                        $.bootstrapGrowl('Template Already found !', {
                            type: 'danger',
                            delay: 5000,
                        });
                        $('#txttemplatename').val('');
                        $('#myModal_QueryTemplate .jqte_editor').html('');
                    }
                    else {
                        AddQueryTemplate();
                    }

                },
                error: function (result) {
                    zResult = false;
                    $.bootstrapGrowl('Error Occured, Try Again.. !', {
                        type: 'danger',
                        delay: 5000,
                    });
                }
            });

        }

        else {

            AddQueryTemplate();
        }

    }

}

function PopulateQueryTempbyID(aID) {
    aQueryID = aID;

   QueryTempDetails(aID);
    $('#myModal_QueryTemplate').modal({ backdrop: 'static', keyboard: false });
}

function QueryTempDetails(zitem) {
    if (zitem == null || zitem == 0) {
        clearForm('#divQueryTemp');
    }
    else {
        clearForm('#divQueryTemp');

        var data = { aID: zitem }
        $.ajax({
            type: 'post',
            url: $('#hf_PopulateQueryTempByID').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var items = response.aitemList;

                $('#ddlPublisherList').val(items.PublisherID).change();
                $('#txtQuerysubject').val(items.Subject);
                $('#txttemplatename').val(items.TemplateName);
                $('#txtmailbody').val(items.MailBoady);
                $('#myModal_QueryTemplate .jqte_editor').html(isNullCheck(items.MailBoady));
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

function ClearQueryData() {
    
    $('#ddlPublisherList').val(null).change();
    $('#txttemplatename').val('');
    $('#txtQuerysubject').val('');
    $('#txtmailbody').val('');
    $('#myModal_QueryTemplate .jqte_editor').html('');
}
