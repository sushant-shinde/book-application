var dataSet = [];
var dataPMList = [];
$(document).ready(function () {
    $('#ddlPMList,#ddlTransferPM').select2({ placeholder: "Select PM", allowClear: true });
    $('#ddlTransferMode').select2({ placeholder: "Select Transfer Mode", allowClear: true });
    $('#ddlTransferMode').val(-1).change();

    $('#Txt_FromDate').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        minDate: today,
        scrollMonth: false,
        scrollInput: false
    });
    $('#Txt_ToDate').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        minDate: today,
        scrollMonth: false,
        scrollInput: false
    });

    LoadPMList();
    LoadBookList(0);
    $('#ddlPMList').change(function () {
        if ($(this).val() != null) {
            LoadBookList($(this).val());
        }
    })

    $('#btnUpdate').click(function () {
        if ($('#ddlTransferMode').val() == null) {
            $.bootstrapGrowl("Please Select Transfer Mode", {
                type: 'danger',
                delay: 2000,
            });
            return false;
        }
        else if ($('#ddlTransferPM').val() == null) {
            $.bootstrapGrowl("Please Select Transfer PM", {
                type: 'danger',
                delay: 2000,
            });
            return false;
        }
        else if ($('#ddlTransferMode').val() == 'Duration' && ($('#Txt_FromDate').val() == '' || $('#Txt_ToDate').val() == '')) {
            $.bootstrapGrowl("Please Select From and To Date", {
                type: 'danger',
                delay: 2000,
            });
            return false;
        }
        else if ($('#Txt_Remarks').val() == '') {
            $.bootstrapGrowl("Please Enter Remarks", {
                type: 'danger',
                delay: 2000,
            });
            $('#Txt_Remarks').focus();
            return false;
        }

        bootbox.prompt({
            title: "Are you sure to transfer this book ?",
            value: ['1', '2'],
            inputType: 'checkbox',
            inputOptions: [{
                text: 'Send Notification to Author',
                value: '1',
            },
            {
                text: 'Send Notification to Editor',
                value: '2',
            }
            ],
            callback: function (result) {
                if (result) {
                    var zvalue = result.toString().replace(',', '');
                    UpdateTransfer(zvalue);
                }
            }
        });



    });
});

function LoadPMList() {
    $('#LoadingImage').show();
    var data = null;
    $.ajax({
        type: 'post',
        url: $('#hf_GetPMList').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            var items = response.aItemList;
            $.each(items, function (e, val) {
                $('#ddlPMList').append('<option value="' + val.ID + '">' + val.Name.capitalize() + '</option>');
                var PMList = [{ id: val.ID, Name: val.Name }];
                dataPMList.push(PMList);

            });
            $('#ddlPMList,#ddlTransferPM').val(-1).change();
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

    $('.DateValid').change(function () {
        var aStartDate = new Date($("#Txt_FromDate").val());
        var aEndate = new Date($("#Txt_ToDate").val());
        if (new Date(aStartDate) > new Date(aEndate)) {
            $.bootstrapGrowl("To date should be greater than From date !", { type: 'danger', delay: 2000, });
            $(this).val('');
            $(this).focus();
            zResult = false;
        }
    })

}

function LoadBookList(PMID) {
    $('#LoadingImage').show();
    var data = { zPMID: PMID };
    $.ajax({
        type: 'post',
        url: $('#hf_GetPMBookList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var items = JSON.parse(response);
            FetechData(items);
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

            var aimgpath = $(this)[0]["ImgPath"] ;
            if (aimgpath == null || aimgpath == '') {
                aimgpath = "../Images/Covers/blue.png";
            }

            var t = [
                zindexL,
                "<img src='" + aimgpath + "' class='imgCover'/>",
                $(this)[0]["Number"],
                $(this)[0]["Catalog"],
                $(this)[0]["Title"],
                FormatDate($(this)[0]["ReceivedDt"]),
                FormatDate($(this)[0]["DueDt"]),
                '<center><input type="checkbox" class="chkSelect" data-id="' + $(this)[0]["ID"] + '"/></center>',
                $(this)[0]["ID"],
            ];
            dataSet.push(t);
        });
        LoadData();
        $('.imgLoader').hide();
    } catch (e) {

    }
}

function LoadData() {
    var table = $('#example').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[15, 25, 50, 75, 100, -1], [15, 25, 50, 75, 100, "All"]],
        data: dataSet,
        columns: [
            { title: "S.No." },
            { title: "Cover" },
            { title: "Number" },
            { title: "Catalog" },
            { title: "Title" },
            { title: "Received Date " },
            { title: "Proposed Pub Date" },
            { title: "<center>Select All<br><input type='checkbox' class='chkSelectAll' /></center>", "bSortable": false },

        ],
        columnDefs: [
            { type: 'date-dd-mmm-yyyy', targets: [5, 6] }
        ],
        "createdRow": function (row, data, dataIndex) {
            $($(row).find('td')[0]).attr('id', data[7]);

        },
        "destroy": true,
        "scrollY": (size.height - 280),
        "scrollX": true,
        buttons: [
            {
                text: '<button class="btn btn-primary spAddIcon" title="Transfer"><i class="fa fa-paper-plane" aria-hidden="true"></i> Transfer</button>',
                action: function (e, dt, node, config) {
                    var zBookIDList = '';
                    $('.chkSelect:checked').each(function () {
                        zBookIDList += $(this).attr('data-id') + ',';
                    });
                    if (zBookIDList == '') {
                        $.bootstrapGrowl("Please Select Book's", {
                            type: 'danger',
                            delay: 2000,
                        });
                        return false;
                    }
                    $('#ddlTransferPM').find('option').remove();

                    $.each(dataPMList, function (e, val) {
                        if ($('#ddlPMList').val() != val[0].id)
                            $('#ddlTransferPM').append('<option value="' + val[0].id + '">' + val[0].Name.capitalize() + '</option>');
                    });
                    $('#ddlTransferMode').val(-1),
                        $('#ddlTransferPM').val(-1);
                    $('#Txt_FromDate').val(''),
                        $('#Txt_ToDate').val(''),
                        $('#Txt_Remarks').val('')

                    $('#myModal_View').modal({ backdrop: 'static', keyboard: false });
                }

            },
        ]
    });

    $('.chkSelectAll').change(function () {
        if ($(this).is(':checked'))
            $('.chkSelect').not('[disabled="disabled"]').prop('checked', 'checked');
        else
            $('.chkSelect').not('[disabled="disabled"]').removeAttr('checked');
    });
}

function UpdateTransfer(aMailTypeP) {
    var zBookIDList = '';
    $('.chkSelect:checked').each(function () {
        zBookIDList += $(this).attr('data-id') + ',';
    });
    if (zBookIDList == '') {
        $.bootstrapGrowl("Please Select Book's", {
            type: 'danger',
            delay: 2000,
        });
        return false;
    }
    $('#LoadingImage').show();
    $('#myModal_View').modal('hide');
    var data = {
        zBookIDList: zBookIDList,
        zMode: $('#ddlTransferMode').val(),
        zPM: $('#ddlTransferPM').val(),
        zFromDate: $('#Txt_FromDate').val(),
        zToDate: $('#Txt_ToDate').val(),
        zRemarks: $('#Txt_Remarks').val(),
        zMailTypeP: aMailTypeP
    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateTransfer').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            $.bootstrapGrowl(response, {
                type: 'info',
                delay: 5000,
            });
            LoadBookList($('#ddlPMList').val());
            $('#myModal_View').modal('hide');
            $('#LoadingImage').hide();
        },
        error: function (response) {
            $('#LoadingImage').hide();
        }
    });

}