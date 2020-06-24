var dataSet = [];
var aActivityCols = [];
var aReportTypeG = GetLastSegment().toLowerCase();
function GetLastSegment() {
    var pageURL = window.location.href;
    var lastURLSegment = pageURL.substr(pageURL.lastIndexOf('/') + 1);
    if (lastURLSegment.toLocaleLowerCase() == 'index' || lastURLSegment.toLocaleLowerCase() == 'display') {
        var parts = pageURL.split("/");
        lastURLSegment = parts[parts.length - 2]
    }
    return lastURLSegment;
}

//OOF History
$(function () {
    $('#Txt_FromDate,#Txt_ToDate').datetimepicker({
        format: 'd M Y',
        value: new Date(),
        timepicker: false,
        maxDate: today
    });
    CallDataList();
    $('#btnGetHistory').click(function () {
        CallDataList();
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

    $("#ddlBookID_Report").select2({ placeholder: "Select", allowClear: true });
    $("#ddlBookID_Report").val(-1).change();

    $('#btnGetTrack').click(function () {
        if ($('#ddlBookID_Report').val() == null) {
            $.bootstrapGrowl("Select Book Number!", { type: 'danger', delay: 2000, });
            $('#ddlBookID_Report').focus();
            zResult = false;
        }
        else {
            PopulateProofTracking_Report();
        }


    })

    try {
        $('#ddlFilterType').select2();
    } catch (e) { }
});

function CallDataList() {
    var zFilterTypeL = '';
    var zDataURL = $('#hf_GetOOFHistory').val();
    if (aReportTypeG == 'fsallocate') {
        zDataURL = $('#hf_GetFreelancerAllocate').val();
        zFilterTypeL = $('#ddlFilterType').val();
    }
    else if (aReportTypeG == 'aeallocate') {
        zDataURL = $('#hf_GetAEAllocate').val();
        zFilterTypeL = $('#ddlFilterType').val();
    }
    $('#LoadingImage').show();
    var data = {
        zFromDate: $('#Txt_FromDate').val(),
        zTodate: $('#Txt_ToDate').val(),
        zFilterType: zFilterTypeL
    };
    $.ajax({
        type: 'post',
        url: zDataURL,
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechData(response.aItemList);
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
            var t = [];
            if (aReportTypeG == 'fsallocate') {
                t = [
                    zCtInP,
                    $(this)[0]["BookNo"],
                    $(this)[0]["Catalog"],
                    $(this)[0]["ChapterNo"],
                    $(this)[0]["TaskName"],
                    $(this)[0]["FreelancerName"],
                    FormatDateColumn($(this)[0]["AllocationDate"]),
                    FormatDateColumn($(this)[0]["DueDate"]),
                    '<a href="../Source/OutSource/' + $(this)[0]["Catalog"] + '/' + $(this)[0]["FileName"] + '" download>' + $(this)[0]["FileName"] + '</a>',
                    ($(this)[0]["FinalFileName"] == null ? '' :
                        '<a href="../Source/OutSource/' + $(this)[0]["Catalog"] + '/Upload/' + $(this)[0]["FinalFileName"] + '" download>' + $(this)[0]["FinalFileName"] + '</a>'),
                    FormatDateColumn($(this)[0]["FinalDate"]),
                    $(this)[0]["MSPages"],
                    $(this)[0]["TypesetPages"],
                    $(this)[0]["TotalPages"],
                    $(this)[0]["TotalWords"],
                    $(this)[0]["TotalTables"],
                    $(this)[0]["TotalFigures"],
                    $(this)[0]["IsInvoiced"],

                ];
            }
            else if (aReportTypeG == 'aeallocate') {
                t = [
                    zCtInP,
                    $(this)[0]["BookNo"],
                    $(this)[0]["ChapterNo"],
                    $(this)[0]["UploadType"],
                    $(this)[0]["UserType"],
                    $(this)[0]["Stage"],
                    $(this)[0]["EmailID"],
                    FormatDateColumn($(this)[0]["FileUploadDate"]),
                    FormatDateColumn($(this)[0]["DueDate"]),
                    '<a href="../Source/Distribution/' + $(this)[0]["BookNo"] + '/' + $(this)[0]["Stage"] + '/' + $(this)[0]["UploadFileName"] + '" download>' + $(this)[0]["UploadFileName"] + '</a>',
                    ($(this)[0]["CorrectionFileName"] == null ? '' :
                        '<a href="../Source/Distribution/' + $(this)[0]["BookNo"] + '/' + $(this)[0]["Stage"] + '/' + $(this)[0]["UserType"]
                        + '/' + $(this)[0]["CorrectionFileName"] + '" download>' + $(this)[0]["CorrectionFileName"] + '</a>'),
                    FormatDateColumn($(this)[0]["CorrectionReceiveDt"]),
                    $(this)[0]["NoCorrection"],

                ];
            }
            else {
                t = [
                    zCtInP,
                    $(this)[0]["Number"],
                    $(this)[0]["Catalog"],
                    $(this)[0]["CurrentPM"],
                    $(this)[0]["TransferPM"],
                    $(this)[0]["TransferMode"],
                    $(this)[0]["TransferFromDate"] != null ? FormatDateColumn($(this)[0]["TransferFromDate"]) : "--",
                    $(this)[0]["TransferToDate"] != null ? FormatDateColumn($(this)[0]["TransferToDate"]) : "--",
                    $(this)[0]["Remark"],
                    $(this)[0]["UpdatedBy"]

                ];
            }
            dataSet.push(t);
        });
        LoadData();
        $('.imgLoader').hide();
    } catch (e) {

    }
}
function LoadData() {
    var columnsList = [];
    var zFileName = '';
    if (aReportTypeG == 'fsallocate') {
        zFileName = 'FreelancerAllocate';
        columnsList = [
            { title: "S.No.", "bSortable": false },
            { title: "BookNo.", "bSortable": false },
            { title: "Catalog", "bSortable": false },
            { title: "ChapterNo.", "bSortable": false },
            { title: "Task Name", "bSortable": false },
            { title: "Freelancer", "bSortable": false },
            { title: "Allocation Date", "bSortable": false },
            { title: "Due Date", "bSortable": false },
            { title: "Upload File", "bSortable": false },
            { title: "Final File", "bSortable": false },
            { title: "FL.Upload Date", "bSortable": false },
            { title: "MSPages", "bSortable": false },
            { title: "TypesetPages", "bSortable": false },
            { title: "TotalPages", "bSortable": false },
            { title: "TotalWords", "bSortable": false },
            { title: "TotalTables", "bSortable": false },
            { title: "TotalFigures", "bSortable": false },
            { title: "IsInvoiced", "bSortable": false },
        ];
    }
    else if (aReportTypeG == 'aeallocate') {
        zFileName = 'ProofDistribution';
        columnsList = [
            { title: "S.No.", "bSortable": false },
            { title: "BookNo.", "bSortable": false },
            { title: "ChapterNo.", "bSortable": false },
            { title: "Upload Type", "bSortable": false },
            { title: "User Type", "bSortable": false },
            { title: "Stage", "bSortable": false },
            { title: "EmailID", "bSortable": false },
            { title: "Allocate Date", "bSortable": false },
            { title: "Due Date", "bSortable": false },
            { title: "FileName", "bSortable": false },
            { title: "Corr.FileName", "bSortable": false },
            { title: "Upload Date", "bSortable": false },
        ];
    }
    else {
        zFileName = 'OOPHistory';
        columnsList = [
            { title: "S.No.", "bSortable": false },
            { title: "Number", "bSortable": false },
            { title: "Catalog", "bSortable": false },
            { title: "PM Name", "bSortable": false },
            { title: "Transfer To PM", "bSortable": false },
            { title: "Transfer Mode", "bSortable": false },
            { title: "Transfer From Date", "bSortable": false },
            { title: "Transfer To Date", "bSortable": false },
            { title: "Remark", "bSortable": false },
            { title: "Updated By", "bSortable": false }
        ];
    }
    var datecolumnsList = [];
    datecolumnsList.push(columnsList.length - 1);
    var table = $('#example').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[15, 25, 50, 75, 100, -1], [15, 25, 50, 75, 100, "All"]],
        data: dataSet,
        columns: columnsList,
        columnDefs: [
            { type: 'date-dd-mmm-yyyy', targets: datecolumnsList }
        ],
        "destroy": true,
        //"order": [[9, 'asc']],
        fixedHeader: {
            header: true
        },
        "scrollY": (size.height - 210),
        "scrollX": true,
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: zFileName + today.toShortFormatWithTime(),

                title: zFileName,
                exportOptions: {
                    columns: ':visible',
                    format: {
                        header: function (data, row, column, node) {
                            var zheader = data.toString().split('<div class="dropdown')[0];
                            zheader = zheader.toString().split('<i class="fa fa-filter')[0];
                            zheader = zheader.replace('<center>', '');
                            zheader = zheader.replace('</center>', '');
                            zheader = zheader.replace('&amp;', '&');
                            return zheader.replace('<br>', '');
                        }
                    }
                }
            },
            {
                extend: 'pdfHtml5',
                text: '<img src="../Images/pdf.png" title="Export to PDF" />',
                filename: zFileName + today.toShortFormatWithTime(),

                title: zFileName,
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: ':visible',
                    format: {
                        header: function (data, row, column, node) {
                            var zheader = data.toString().split('<div class="dropdown')[0];
                            zheader = zheader.toString().split('<i class="fa fa-filter')[0];
                            zheader = zheader.replace('<center>', '');
                            zheader = zheader.replace('</center>', '');
                            zheader = zheader.replace('&amp;', '&');
                            return zheader.replace('<br>', '');
                        },
                    }
                }

            }

        ],
    });
    $('.spGreen').parent().addClass('spGreen');
    $('.spRed').parent().addClass('spRed');
    $('.spBlue').parent().addClass('spBlue');
}

//Proof Tracking Report
function PopulateProofTracking_Report() {

    $('#LoadingImage').show();
    var zActiveTab = 'All';

    var data = {
        zBookID: $("#ddlBookID_Report").val(),
        Stage: "All",
        UType: zActiveTab
    };
    $.ajax({
        type: 'post',
        url: $('#hf_PopulateProofTracking_Report').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var aitemList = response.aitemList;

            FetchProofData_Report(aitemList);
            $('#LoadingImage').hide();
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
    $('#LoadingImage').hide();

}

function FetchProofData_Report(ItemsList) {
    try {

        dataSet = [];
        var items = ItemsList;
        var zCtInP = 0;
        var zCtCom = 0;
        $.each(items, function (index) {
            if ($(this)[0]["MailSentDate"] != null) {
                var zindexL = 0;
                zCtInP += 1;
                zindexL = zCtInP;




                var t = [
                    $(this)[0]["Number"],
                    $(this)[0]["Catalog"],
                    $(this)[0]["ChapterID"],
                    $(this)[0]["EmailID"],
                    $(this)[0]["Stage"],
                    FormatDateColumn($(this)[0]["MailSentDate"]),


                    ($(this)[0]["Reminder1Date"] == null ? '<center>---</center>' : FormatDateColumn($(this)[0]["Reminder1Date"])),

                    ($(this)[0]["Reminder2Date"] == null ? '<center>---</center>' : FormatDateColumn($(this)[0]["Reminder2Date"])),

                    ($(this)[0]["Reminder3Date"] == null ? '<center>---</center>' : FormatDateColumn($(this)[0]["Reminder3Date"])),


                    ($(this)[0]["Stage"] == 'Intro Email' ? "NA" : FormatDateColumn($(this)[0]["DueDate"])),
                    ($(this)[0]["Stage"] == 'Intro Email' ? FormatDateColumn($(this)[0]["AcceptDate"]) : FormatDateColumn($(this)[0]["CorrectionReceiveDt"])),
                    $(this)[0]["ID"]


                ];

                dataSet.push(t);
            }
        });
        LoadProofTracking_Report();
        $('.imgLoader').hide();
    } catch (e) {

    }

}

function LoadProofTracking_Report() {


    var table = $('#example').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
        "deferRender": true,
        data: dataSet,
        columns: [
            { title: "Book No.", "bSortable": false },
            { title: "Catalog", "bSortable": false },

            { title: "Chapter<br>No.", },
            { title: "Email Sent To", "bSortable": false },
            { title: "Stage", "bSortable": false },
            { title: "Email Read", "bSortable": false },
            { title: "Read-receipt<br> Reminder", "bSortable": false },

            { title: "Due Date <br>Reminder", "bSortable": false },

            { title: "Over Due <br>Reminder", "bSortable": false },

            { title: "Due Date", "bSortable": false },
            { title: "Email Received Date", "bSortable": false },

        ],
        columnDefs: [
            { type: 'date-dd-mmm-yyyy', targets: [7, 8] }
        ],
        "destroy": true,

        fixedHeader: {
            header: true
        },
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'PT' + today.toShortFormatWithTime(),

                title: 'Proof Tracking Report- ' + $('#ddlBookID_Report').val(),
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
                filename: 'PT' + today.toShortFormatWithTime(),

                title: 'Proof Tracking Report - ' + $('#ddlBookID_Report').val(),
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
        "scrollY": (size.height - 232),
        "scrollX": true,
        "createdRow": function (row, data, dataIndex) {
            $($(row).find('td')[0]).attr('id', data[15]);//ProofID
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

    $('.DueDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });

}


