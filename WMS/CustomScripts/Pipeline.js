var dataSet = [];
var aPipelineID = "";
$(function () {
    $('#Txt_SearchFromDate').datetimepicker({
        format: 'd M Y',
        value: new Date(),
        timepicker: false,
        scrollMonth: false,
        scrollInput: false
    });
    $('#Txt_SearchToDate').datetimepicker({
        format: 'd M Y',
        value: new Date(),
        timepicker: false,
        scrollMonth: false,
        scrollInput: false
    });
    $('#txtExpectedDt').datetimepicker({
        format: 'd M Y',
        value: new Date(),
        timepicker: false,
        scrollMonth: false,
        scrollInput: false
    });
    $('#txtISBN').change(function (e) {

        CheckExistingData($(this).val(), aPipelineID, 'ISBN');
    });
    $('#ddlPublisherList').select2({ placeholder: "Select", allowClear: true });
    $('#btnGet').click(function () {
        var FromDt = FormatDate_IE($("#Txt_SearchFromDate").val());
        var ToDt = FormatDate_IE($("#Txt_SearchToDate").val());
        PipelineData(false, FromDt, ToDt);
    });

    $('#btnUpdate').click(function () {
        SavePipelineData();
    });

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

    PipelineData(true, '', '');
});
function CheckExistingData(itemP, id, zType) {
    $('.modal-footer .btn').attr('disabled', 'disabled');
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
                $('#txt' + zType).focus();
            }
            $('.modal-footer .btn').removeAttr('disabled');
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again.. !', {
                type: 'danger',
                delay: 8000,
            });
            $('.modal-footer .btn').removeAttr('disabled');
        }
    });
}

function PipelineData(aFirstLoad, aFromDt, aToDt) {
    $('#LoadingImage').show();
    var data = {
        zFirstLoad: aFirstLoad,
        zFromDt: aFromDt,
        zToDt: aToDt
    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetPipeline').val(),
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
                $(this)[0]["Publisher"],
                $(this)[0]["ISBN"],
                $(this)[0]["Title"],
                $(this)[0]["AuthorName"],
                FormatDateColumn($(this)[0]["ExpectedDt"]),
                $(this)[0]["ID"]
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
            { title: "Publisher" },
            { title: "ISBN" },
            { title: "Title" },
            { title: "Author Name" },
            { title: "Expected Date" },
            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class=spDeleteIcon style="display:none"><i class="fa fa-trash" aria-hidden="true" title="Delete" data-col="Name" onclick="DeletePipelineInfo(' + isNullCheck(data) + ');"></i></span>' +
                        '<span class=spUpdateIcon style="display:none"><i class="fa fa-pen" aria-hidden="true" title="Edit" data-col="Name" onclick="UpdatePipelineInfo(' + isNullCheck(data) + ');"></i></span>';
                }
            }
        ],
        columnDefs: [
            { type: 'date-dd-mmm-yyyy', targets: [5] }
        ],
        "destroy": true,

        fixedHeader: {
            header: true
        },
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'Pipeline' + today.toShortFormatWithTime(),

                title: 'Pipeline',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5],
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
                filename: 'Pipeline' + today.toShortFormatWithTime(),

                title: 'Pipeline',
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5],
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
                    UpdatePipelineInfo(0);
                }

            },

        ],
        "scrollY": (size.height - 250),
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
function UpdatePipelineInfo(aIDP) {
    aPipelineID = aIDP;
    PipelineDetails(aIDP);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
}

function DeletePipelineInfo(aIDP) {

    bootbox.confirm("Are you sure want to delete?",
        function (result) {
            if (result) {
                $('#LoadingImage').show();
                var aitemInfoP = {
                    ID: aIDP
                }
                $.ajax({
                    type: 'post',
                    url: $('#hf_PipelineDelete').val(),
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
                        PipelineData(false, FormatDate_IE($('#Txt_SearchFromDate').val()), FormatDate_IE($('#Txt_SearchToDate').val()));
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

function SavePipelineData() {
    var validate = ValidateForm('');
    if (validate) {

        $('#LoadingImage').show();
        var aitemInfoP = {
            ID: aPipelineID, ISBN: $('#txtISBN').val(), Title: $('#txtTitle').val(),
            AuthorName: $("#txtAuthor").val(), ExpectedDt: $('#txtExpectedDt').val(), PublisherID: $("#ddlPublisherList").val()

        }
        $.ajax({
            type: 'post',
            url: $('#hf_PipelineUpdate').val(),
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
                    clearForm('#divContent');
                }
                $('#LoadingImage').hide();
                $('#myModal').modal('hide');
                PipelineData(false, '', '');
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
}

function ValidateForm(form) {
    var zResult = true;
    var ExpectedDt = FormatDate_IE($("#txtExpectedDt").val());
    if ($('#ddlPublisherList').val() == null) {
        $.bootstrapGrowl("Select Publisher !", { type: 'danger', delay: 8000, });
        $('#ddlPublisherList').focus();
        zResult = false;
    }
    else if ($('#txtISBN').val() == '') {
        $.bootstrapGrowl('Enter ISBN !', { type: 'danger', delay: 8000, });
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
    else if ($('#txtTitle').val() == '') {
        $.bootstrapGrowl("Enter Title !", { type: 'danger', delay: 8000, });
        $('#txtTitle').focus();
        zResult = false;
    }
    else if ($('#txtAuthor').val() == '') {
        $.bootstrapGrowl("Enter Author !", { type: 'danger', delay: 8000, });
        $('#txtAuthor').focus();
        zResult = false;
    }

    else if ($('#txtExpectedDt').val() == '') {
        $.bootstrapGrowl("Enter Expected Date !", { type: 'danger', delay: 8000, });
        $('#txtExpectedDt').focus();
        zResult = false;
    }
    else if (new Date(ExpectedDt) < new Date()) {
        $.bootstrapGrowl("Expected date should not be less than current date !", { type: 'danger', delay: 8000, });
        $('#txtExpectedDt').focus();
        zResult = false;
    }

    return zResult;

};


function PipelineDetails(zitem) {
    if (zitem == null || zitem == 0) {
        clearForm('#divContent');

    }
    else {
        $('#LoadingImage').show();
        var data = { zPipelineID: zitem }
        $.ajax({
            type: 'post',
            url: $('#hf_PipelineInfo').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var items = JSON.parse(response);

                $('#txtISBN').val(items[0]["ISBN"]);
                $('#txtTitle').val(items[0]["Title"]);

                $('#ddlPublisherList').val(items[0]["PublisherID"]).change();

                $('#txtExpectedDt').val(FormatDate(items[0]["ExpectedDt"]));

                $('#txtAuthor').val(items[0]["AuthorName"]);

                $('#LoadingImage').hide();

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
}