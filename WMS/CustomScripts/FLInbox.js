var dataSet = [];
$(function () {
    $('#ddlAvailable').select2({ placeholder: "Select Available", allowClear: true });
    $('#TxtFromDate,#TxtToDate').datetimepicker({
        format: 'd M Y',
        //value: new Date(),
        timepicker: false,
        scrollMonth: false,
        scrollInput: false
    });

    //Available Change Event
    $('#ddlAvailable').change(function () {
        if ($(this).val() == 'Yes') {
            $('#TxtFromDate,#TxtToDate').attr('disabled', 'disabled');
            $('#TxtFromDate,#TxtToDate,#TxtRemarks').val('');
            $('.tdNo').hide();
        }
        else if ($(this).val() == 'No') {
            $('#TxtFromDate,#TxtToDate').removeAttr('disabled');
            $('.tdNo').show();
        }
    });

    $('.inputHandCursor').change(function () {
        var aStartDate = new Date($("#TxtFromDt").val());
        var aEndate = new Date($("#TxtToDt").val());
        if (new Date(aStartDate) > new Date(aEndate)) {
            $.bootstrapGrowl("To date should be greater than From date !", { type: 'danger', delay: 2000, });
            $(this).val('');
            $(this).focus();
            zResult = false;
        }
    });

    $('#TxtFromDt,#TxtToDt').datetimepicker({
        format: 'd M Y',
        value: new Date(),
        timepicker: false
    });
    GetDashboard();
    CallDataList();
    CallReportDataList();
    CallInvoiceDataList();
    $('#btnFileClear').click(function () {
        DeleteTempFolder();
    });

    $('#myModal_ViewUpLoad').on('hidden.bs.modal', function () {
        DeleteTempFolder();
    });

    $('#FUpload').change(function () {
        var zIDList = '';
        $('.chkUpload:checked').each(function () {
            zIDList += $(this).attr('data-id') + ',';
        });
        if (zIDList == '') {
            $.bootstrapGrowl('Select Chapter for Upload !', {
                type: 'warning',
                delay: 5000,
            });
            return false;
        }
        FileUpload(zIDList);
    });

    $('#btnUploadFile').click(function () {
        if ($('#tblFileList tbody tr').length == 0) {
            $.bootstrapGrowl('Kindly Select Files for Upload !', {
                type: 'warning',
                delay: 5000,
            });
            return false;
        }
        var zIDList = '';
        $('.chkUpload:checked').each(function () {
            zIDList += $(this).attr('data-id') + ',';
        });

        bootbox.confirm("Are you sure to Upload the Chapter?",
            function (result) {
                if (result) {
                    FileUploadWithZip(zIDList);
                }
            });
    });
    $('#ddlTypeInbox').show();
    $('#ddlTypeReport').hide();
    $('.iFilter').hide();
    $('#BkTabul li').click(function () {
        $('#LoadingImage').show();
        $('.iFilter').hide();
        setTimeout(function () {
            $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
        }, 200);
        if ($(this).text() == 'Inbox') {
            $('#ddlTypeInbox').show();
            $('#ddlTypeReport').hide();
            $('.iFilter').show();
        }
        else if ($(this).text() == 'Report') {
            $('#ddlTypeReport').show();
            $('#ddlTypeInbox').hide();
            $('.iFilter').show();
        }
        $('.spTitle').html('Freelancer ' + $(this).text());
        $('#LoadingImage').hide();
    });

    $('#btnBkGet').click(function () {
        if ($('#TxtFromDt').val() == '') {
            $.bootstrapGrowl('Select From Date!', {
                type: 'warning',
                delay: 5000,
            });
            $('#TxtFromDt').focus();
            return false;
        }
        else if ($('#TxtToDt').val() == '') {
            $.bootstrapGrowl('Select To Date!', {
                type: 'warning',
                delay: 5000,
            });
            $('#TxtToDt').focus();
            return false;
        }
        if ($('#BkTabul li.active').text() == 'Home') {
            GetDashboard();
        }
        if ($('#BkTabul li.active').text() == 'Inbox') {
            CallDataList();
        }
        else if ($('#BkTabul li.active').text() == 'Report') {
            CallReportDataList();
        }
        else if ($('#BkTabul li.active').text() == 'Invoice') {
            CallInvoiceDataList();
        }
    });
    $('#btnAvailableUpdate').click(function () {
        var zResult = true;
        if ($('#ddlAvailable').val() == 'No' && $('#TxtFromDate').val() == '') {
            $.bootstrapGrowl("Select From Date ! ", { type: 'danger', delay: 5000, });
            $('#TxtFromDate').focus();
            zResult = false;
        }
        else if ($('#ddlAvailable').val() == 'No' && $('#TxtToDate').val() == '') {
            $.bootstrapGrowl("Select To Date ! ", { type: 'danger', delay: 5000, });
            $('#TxtToDate').focus();
            zResult = false;
        }
        else if ($('#ddlAvailable').val() == 'No' && $('#TxtRemarks').val() == '') {
            $.bootstrapGrowl("Enter Reamrks ! ", { type: 'danger', delay: 5000, });
            $('#TxtRemarks').focus();
            zResult = false;
        }
        if (zResult) {

            $('#LoadingImage').show();
            var data = {
                zAvailable: $('#ddlAvailable').val(),
                zFromDate: $('#TxtFromDate').val(),
                zToDate: $('#TxtToDate').val(),
                zRemarks: $('#TxtRemarks').val()

            };
            $.ajax({
                type: 'post',
                url: $('#hf_UpdateOOF').val(),
                data: data,
                datatype: 'json',
                success: function (response) {
                    $('#LoadingImage').hide();
                    $.bootstrapGrowl('Available Status Updated..!', {
                        type: 'info',
                        delay: 5000,
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
        }
    });
});

function GetDashboard() {
    $('#LoadingImage').show();
    var data;
    $.ajax({
        type: 'post',
        url: $('#hf_GetDashboard').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var aDashboard = response.aDashboardL;
            var aUploadSummary = response.aUploadSummaryL;
            var aFreeList = response.aFreeItemL;

            $('#ddlAvailable').val(aFreeList.Available).change();
            $('#TxtFromDate').val(FormatDateColumn(aFreeList.FromDate));
            $('#TxtToDate').val(FormatDateColumn(aFreeList.ToDate));
            $('#TxtRemarks').val(aFreeList.AvailableRemarks);


            $('#H_TodayDue').html(aDashboard[0].TodayDue);
            $('#H_Pending').html(aDashboard[0].Pending);
            $('#H_Download').html(aDashboard[0].Downloaded);
            $('#H_Upload').html(aDashboard[0].Uploaded);

            var aChartdataL = [];
            var categories = [];
            $.each(aUploadSummary, function (e, val) {
                categories.push(val.UploadMonth)
                aChartdataL.push(val.UploadCount);
            });

            Highcharts.chart('container', {
                chart: {
                    type: 'line',
                    backgroundColor: 'rgba(255, 255, 255, 0.0)'
                },
                title: {
                    text: '<strong>Monthly Achievement ' + new Date().getFullYear() + '</strong>'
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    categories: categories
                },
                yAxis: {
                    min: 0,
                    max: 100,
                    title: {
                        text: 'File Upload Count'
                    }
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true
                        },
                        enableMouseTracking: false
                    }
                },
                series: [{
                    name: 'Months',
                    data: aChartdataL
                }]
            });

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

function CallDataList() {
    $('#LoadingImage').show();
    var data = { zType: $('#ddlTypeInbox').val(), FromDate: $('#TxtFromDt').val(), ToDate: $('#TxtToDt').val() };
    $.ajax({
        type: 'post',
        url: $('#hf_GetInboxList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechData(response.aItemList);
            $('#LoadingImage').hide();
            setTimeout(function () {
                $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
            }, 200);
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
            var t = [
                zCtInP,
                $(this)[0]["Publisher"],
                $(this)[0]["BookNo"],
                $(this)[0]["ChapterNo"],
                $(this)[0]["MSPages"],
                $(this)[0]["FileName"],
                FormatDateColumn($(this)[0]["DueDate"]),
                '<center class="spGuideView" title="View Guide Line" data-Pubid="' + $(this)[0]["PublisherID"] +
                                        '" data-PubName="' + $(this)[0]["Publisher"] +
                                        '" data-Task="' + $(this)[0]["TaskID"] +
                                        '" data-FileList="' + isNullCheck($(this)[0]["GuideLine"]) + '"><i class="fa fa-eye" aria-hidden="true"></i></center>',
                $(this)[0]["CurrentStatus"],
                '<center><input type="checkbox" class="chkDownload" data-id="' + $(this)[0]["ID"] + '"/></center>',
                '<center><input type="checkbox" class="chkUpload" data-id="' + $(this)[0]["ID"] + '"/></center>',
                $(this)[0]["ID"]
            ];
            dataSet.push(t);
        });
        LoadData();

        $('.spGuideView').click(function () {
            $('#TblFileList tbody').html('');
            $('#lblTitle').html('Guide Line List - ' + $(this).attr('data-PubName'));
            var aPublisher = $(this).attr('data-Pubid');
            var aTask = $(this).attr('data-Task');
            var aFileList = $(this).attr('data-FileList').split(',');
            $.each(aFileList, function (e, val) {
                if (val != '') {
                    var Stable = "<tr>";
                    Stable += "<td>" + (e + 1).toString() + "</td>";
                    Stable += "<td><a href='../Source/FreelanceGuideLine/" + aPublisher + "/" + aTask + "/" + val + "' download> " + val + "</td>";
                    Stable += "</tr>";
                    $('#TblFileList tbody').append(Stable);
                }
            });
            $("#myModal_GuideLine").modal({ backdrop: 'static', keyboard: false });
        });
        $('#LoadingImage').hide();
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
            { title: "S.No.", width: "20" },
            { title: "Publisher" },
            { title: "Book No." },
            { title: "Chapter No." },
            { title: "Pages" },
            { title: "File Name" },
            { title: "Due Date" },
            { title: "Guide Line" },
            { title: "Status" },
            { title: "<center>Download<br><input type='checkbox' class='chkDownloadAll' /></center>", "bSortable": false },
            { title: "<center>Upload <br><input type='checkbox' class='chkUploadAll' /></center>", "bSortable": false },

        ],
        "createdRow": function (row, data, dataIndex) {
            $($(row).find('td')[0]).attr('id', data[7]);//ID
        },
        "destroy": true,
        "scrollY": (size.height - 250),
        "scrollX": true,
        buttons: [
            {
                text: '<button class="btn btn-primary"><i class="fa fa-download"></i> Download</button>',
                action: function (e, dt, node, config) {
                    var zIDList = '';
                    $('.chkDownload:checked').each(function () {
                        zIDList += $(this).attr('data-id') + ',';
                    });
                    if (zIDList == '') {
                        $.bootstrapGrowl('Select Chapter for Download the file!', {
                            type: 'warning',
                            delay: 5000,
                        });
                        return false;
                    }
                    DownloadFile(zIDList);
                }

            },
            {
                text: '<button class="btn btn-primary"><i class="fa fa-upload"></i> Upload</button>',
                action: function (e, dt, node, config) {
                    var zIDList = '';
                    $('.chkUpload:checked').each(function () {
                        zIDList += $(this).attr('data-id') + ',';
                    });

                    if (zIDList == '') {
                        $.bootstrapGrowl('Select Chapter for Upload the file!', {
                            type: 'warning',
                            delay: 5000,
                        });
                        return false;
                    }
                    DeleteTempFolder();
                    $('#myModal_ViewUpLoad').modal({ backdrop: 'static', keyboard: false });
                }

            },
        ]
    });

    $('.chkDownloadAll').change(function () {
        if ($(this).is(':checked'))
            $('.chkDownload').not('[disabled="disabled"]').prop('checked', 'checked');
        else
            $('.chkDownload').not('[disabled="disabled"]').removeAttr('checked');
    });
    $('.chkUploadAll').change(function () {
        if ($(this).is(':checked'))
            $('.chkUpload').not('[disabled="disabled"]').prop('checked', 'checked');
        else
            $('.chkUpload').not('[disabled="disabled"]').removeAttr('checked');
    });
}

function DownloadFile(zIDList) {
    zIDList = zIDList.replace(/,\s*$/, "");
    window.location = $('#hf_DownloadFile').val() + '?zID=' + zIDList;
}

function DeleteTempFolder() {
    var zIDList = '';
    $('.chkUpload:checked').each(function () {
        zIDList += $(this).attr('data-id') + ',';
    });
    $('#LoadingImage').show();
    var data = { zID: zIDList }
    $.ajax({
        type: 'post',
        url: $('#hf_FreeLancerDeleteTempFolder').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            $("#FUpload").val(null);
            $("#tblFileList > tbody").html("");
            $('#LoadingImage').hide();
        },
        error: function (response) {
            $('#LoadingImage').hide();
        }
    });
}

function FileUpload(zDList) {
    if (validateFileType('#FUpload', 21000000)) {
        if (window.FormData !== undefined) {
            var fileUpload = $("#FUpload").get(0);
            var files = fileUpload.files;
            // Create FormData object
            var fileData = new FormData();
            // Looping over all files and add it to FormData object
            for (var i = 0; i < files.length; i++) {
                fileData.append(files[i].name, files[i]);
            }

            // Adding FolderName as key to FormData object
            fileData.append('ID', zDList);
            $('.FileAttach').show();
            $.ajax({
                url: $('#hf_FreeLancerUploadFolder').val(),
                type: "POST",
                contentType: false, // Not to set any content header
                processData: false, // Not to process data
                data: fileData,
                success: function (result) {
                    var afileList = fileUpload.files;
                    $.each(afileList, function (e, val) {
                        var ztblstr = '';
                        ztblstr += '<tr>';
                        ztblstr += '<td>' + ($('#tblFileList tbody tr').length + 1).toString() + '</td>';
                        ztblstr += '<td width="80%">' + val.name + '</td>';
                        ztblstr += '<td><i class="fa fa-trash" aria-hidden="true" onclick=DeleteTempFile(this)></i></td>';
                        ztblstr += '</tr>';
                        $('#tblFileList tbody').append(ztblstr);
                    });
                    $('.FileAttach').hide();
                }
            });
        } else {
            $.bootstrapGrowl("FormData is not supported.", {
                type: 'danger',
                delay: 2000,
            });
        }
    }
    else
        $("#FUpload").val(null);
}

function DeleteTempFile(zitem) {

    var zIDList = '';
    $('.chkUpload:checked').each(function () {
        zIDList += $(this).attr('data-id') + ',';
    });
    $('#LoadingImage').show();


    var atrItem = $(zitem).closest('tr').find('td');

    var zFileNameP = atrItem[1].innerText;
    try {
        $('#LoadingImage').show();
        var data = { zID: zIDList, zFileName: zFileNameP }
        $.ajax({
            type: 'post',
            url: $('#hf_FreeLancerDeleteTempFile').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                $(zitem).closest("tr").remove();
                $("table#tblFileList tbody").each(function () {
                    $(this).children().each(function (index) {
                        $(this).find('td').first().html(index + 1);
                    });
                });
            },
            error: function (response) {
                $('#LoadingImage').hide();
            }
        });
    } catch (e) {

    }
}
//Upload Function
function FileUploadWithZip(zIDList) {
    $('#LoadingImage').show();
    $('#myModal_ViewUpLoad').modal('hide');
    var data = { zID: zIDList }
    $.ajax({
        type: 'post',
        url: $('#hf_FreelancerFileUploadWithZip').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            if (response.toString().indexOf('Error') > -1) {
                $.bootstrapGrowl(response.replace('Error : ', ''), {
                    type: 'danger',
                    delay: 2000,
                });
                $('#LoadingImage').hide();
                return false;
            }
            else {
                $.bootstrapGrowl('Uploaded Successfully.', {
                    type: 'info',
                    delay: 2000,

                });
                $("#FUpload").val(null);
                $("#tblFileList > tbody").html("");
                CallDataList();
                CallReportDataList();
                CallInvoiceDataList();
                $('#LoadingImage').hide();
                $('#myModal_ViewUpLoad').modal('hide');

            }
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


//Load Report
function CallReportDataList() {
    $('#LoadingImage').show();
    var data = { zType: $('#ddlTypeReport').val(), FromDate: $('#TxtFromDt').val(), ToDate: $('#TxtToDt').val() };
    $.ajax({
        type: 'post',
        url: $('#hf_GetReportDataList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechReportData(response.aItemList);
            $('#LoadingImage').hide();
            setTimeout(function () {
                $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
            }, 200);
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
function FetechReportData(ItemsList) {
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
                zCtInP,
                $(this)[0]["Publisher"],
                $(this)[0]["BookNo"],
                $(this)[0]["ChapterNo"],
                $(this)[0]["MSPages"],
                $(this)[0]["FileName"],
                FormatDateColumn($(this)[0]["AllocationDate"]),
                FormatDateColumn($(this)[0]["DueDate"]),
                FormatDateColumn($(this)[0]["DownloadDate"]),
                FormatDateColumn($(this)[0]["FinalDate"]),
                $(this)[0]["ID"]
            ];
            dataSet.push(t);
        });
        LoadReportData();
        $('#LoadingImage').hide();
    } catch (e) {

    }
}
function LoadReportData() {
    var table = $('#example_report').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[15, 25, 50, 75, 100, -1], [15, 25, 50, 75, 100, "All"]],
        data: dataSet,
        columns: [
            { title: "S.No.", width: "20" },
            { title: "Publisher" },
            { title: "Book No." },
            { title: "Chapter No." },
            { title: "Pages" },
            { title: "File Name" },
            { title: "Received Date" },
            { title: "Due Date" },
            { title: "Download" },
            { title: "Sent" },


        ],
        "createdRow": function (row, data, dataIndex) {
            $($(row).find('td')[0]).attr('id', data[6]);//ID
        },
        "destroy": true,
        "scrollY": (size.height - 250),
        "scrollX": true,
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'FreelancerStatus' + today.toShortFormatWithTime(),

                title: 'Freelancer Status',
                exportOptions: {
                    columns: ':visible',
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
                filename: 'FreelancerStatus' + today.toShortFormatWithTime(),

                title: 'Freelancer Status',
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
                            return zheader.replace('<br>', '');
                        },
                    }
                }

            }

        ],
    });
}


//Load Invoice
function CallInvoiceDataList() {
    $('#LoadingImage').show();
    var data = { zType: $('#ddlTypeReport').val(), FromDate: $('#TxtFromDt').val(), ToDate: $('#TxtToDt').val() };
    $.ajax({
        type: 'post',
        url: $('#hf_GetInvoiceDataList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechInvoiceData(response.aItemList);
            $('#LoadingImage').hide();
            setTimeout(function () {
                $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
            }, 200);
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
function FetechInvoiceData(ItemsList) {
    try {
        dataSet = [];
        var items = ItemsList;
        var zCtInP = 0;
        var zCtCom = 0;
        $.each(items, function (index) {
            var zindexL = 0;
            zCtInP += 1;
            zindexL = zCtInP;
            var adisabled = "disabled='disabled'";
            if ($(this)[0]["IsInvoiced"] == 0) {
               // adisabled = '';
            }
            var t = [
                zCtInP,
                $(this)[0]["Publisher"],
                $(this)[0]["BookNo"],
                $(this)[0]["ChapterNo"],
                FormatDateColumn($(this)[0]["AllocationDate"]),
                FormatDateColumn($(this)[0]["FinalDate"]),
                "<input type='text' class='IsNumeric TP' value='" + $(this)[0]["TotalPages"] + "' " + adisabled + ">",
                "<input type='text' class='IsNumeric TW' value='" + $(this)[0]["TotalWords"] + "'" + adisabled + ">",
                "<input type='text' class='IsNumeric TT' value='" + $(this)[0]["TotalTables"] + "'" + adisabled + ">",
                "<input type='text' class='IsNumeric TF' value='" + $(this)[0]["TotalFigures"] + "'" + adisabled + ">",
                ($(this)[0]["IsInvoiced"] == 0 ?
                    '<center class="GenerateInvoice" title="Generate Invoice" data-id="' + $(this)[0]["ID"] + '"><i class="fa fa-file-invoice"></i></center>' :
                    '<center class="DownloadInvoice" title="Download Invoice" data-id="' + $(this)[0]["ID"] + '"><i class="fa fa-file-invoice"></i></center>'
                ),
                $(this)[0]["ID"]
            ];
            dataSet.push(t);
        });
        LoadInvoiceData();
        $('#LoadingImage').hide();
    } catch (e) {

    }
}
function LoadInvoiceData() {
    var table = $('#example_invoice').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[15, 25, 50, 75, 100, -1], [15, 25, 50, 75, 100, "All"]],
        data: dataSet,
        columns: [
            { title: "S.No.", width: "20" },
            { title: "Publisher" },
            { title: "Book No." },
            { title: "Chapter No." },
            { title: "Received Date" },
            { title: "Sent" },
            { title: "Total Pages" },
            { title: "Total Words" },
            { title: "Total Tables" },
            { title: "Total Figures" },
            { title: "Invoice Generation" },
        ],
        "createdRow": function (row, data, dataIndex) {
            $($(row).find('td')[0]).attr('id', data[6]);//ID
        },
        "destroy": true,
        "scrollY": (size.height - 250),
        "scrollX": true,
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'FreelancerInvoice' + today.toShortFormatWithTime(),

                title: 'Freelancer Invoice',
                exportOptions: {
                    columns: ':visible',
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
                filename: 'FreelancerInvoice' + today.toShortFormatWithTime(),

                title: 'Freelancer Invoice',
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
                            return zheader.replace('<br>', '');
                        },
                    }
                }

            }

        ],
    });
    $('.GenerateInvoice').click(function () {
        var aID = $(this).attr('data-id');
        var atr = $(this).closest('tr');
        bootbox.confirm("Are you sure to Generate the Invoice?",
            function (result) {
                if (result) {
                    UpdateInvoiceDetails(aID,
                        $(atr).find('.TP').val(),
                        $(atr).find('.TW').val(),
                        $(atr).find('.TT').val(),
                        $(atr).find('.TF').val());
                }
            });
    });
    $('.DownloadInvoice').click(function () {
        var aID = $(this).attr('data-id');
        var atr = $(this).closest('tr');
        GenerateInvoice(aID,
            $(atr).find('.TP').val(),
            $(atr).find('.TW').val(),
            $(atr).find('.TT').val(),
            $(atr).find('.TF').val())
    });

}

function UpdateInvoiceDetails(aID, Pages, Words, Tables, Figures) {
    $('#LoadingImage').show();
    var data = {
        ID: aID,
        TotalPages: Pages,
        TotalWords: Words,
        TotalTables: Tables,
        TotalFigures: Figures
    };
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateInvoiceData').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            $.bootstrapGrowl(response, {
                type: 'info',
                delay: 5000,
            })
            CallInvoiceDataList();
            GenerateInvoice(aID, Pages, Words, Tables, Figures);
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

function GenerateInvoice(aID, Pages, Words, Tables, Figures) {
    $("#LoadingImage").show();
    var data = {
        ID: aID,
        TotalPages: Pages,
        TotalWords: Words,
        TotalTables: Tables,
        TotalFigures: Figures
    };
    $.ajax({
        type: 'post',
        url: $('#hf_ExcelFiles').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (data) {
            window.location.href = "../Source/FreelanceInvoice/" + data;
            $("#LoadingImage").hide();
        }, error: function (err) {

            $("#LoadingImage").hide();
        }
    });
}