var dataSet = [];
var aBookID = "";
var aTaskID = "";
var aFreelancerID = "";
var aCatalogG;
var aTaskNameG;
var aChapterG;
var aEditGroupIDG = '';
var aFLID = 0;
$(function () {
    $('.divBookContent').css('height', size.height - 120);
    $('#ddlWIPSearch').select2();
    $('#ddlFreelancer').select2({ placeholder: "Select Freelancer" });
    $('#lstPublisherList').select2({
        closeOnSelect: false,
        placeholder: "Select Publisher(s)",
    });

    $('#txtDueDt').datetimepicker({
        format: 'd M Y',
        //value: new Date(),
        timepicker: false,
        minDate: today,
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });

    $('#txtDueDt').change(function () {
        $('.FreelancerDueDt').val($(this).val());
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
    $('#lstTaskList').select2({
        closeOnSelect: false,
        placeholder: "Select Task(s)",

    });
    $('body').click(function (e) {
        if (e.target.closest('.dropdown') == null && e.target.className.indexOf('select2') == -1)
            closeToggle();
    });
    $('#ddlWIPSearch').change(function () {
        $('#divNumberFilter').hide();
        $('#divCatalogFilter').hide();
        $('#divISBNFilter').hide();
        $('#divPublisherFilter').hide();
        $('#divTaskFilter').hide();
        $('#lstNumberList').val(null).trigger("change");
        $('#lstCatalogFilter').val(null).trigger("change");
        $('#lstISBNList').val(null).trigger("change");
        $('#lstPublisherList').val(null).trigger("change");
        $('#lstTaskList').val(null).trigger("change");
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
        else if (SearchVal == "Task") {
            $('#divTaskFilter').show();
        }

    });

    $('#btnBkGet').click(function () {

        var zNumberList = "";
        var zCatalogList = "";
        var zISBNList = "";
        var zPublList = "";
        var zTaskList = "";

        if ($('#lstNumberList').val() != null)
            zNumberList = $('#lstNumberList').val().toString();
        if ($('#lstCatalogList').val() != null)
            zCatalogList = $('#lstCatalogList').val().toString();
        if ($('#lstISBNList').val() != null)
            zISBNList = $('#lstISBNList').val().toString();
        if ($('#lstPublisherList').val() != null)
            zPublList = $('#lstPublisherList').val().toString();
        if ($('#lstPublisherList').val() != null)
            zPublList = $('#lstPublisherList').val().toString();
        if ($('#lstTaskList').val() != null)
            zTaskList = $('#lstTaskList').val().toString();

        CallFreelanceAllocationBk('true', zNumberList, zCatalogList, zISBNList, zPublList, zTaskList);

    });


    $('#chkBookwise').change(function () {
        if ($(this).is(":checked")) {
            var data = {
                BookID: aBookID,
                aViewTab: $('#BkTabul li.active').text()
            };
            $.ajax({
                type: 'get',
                url: $('#hf_GetAllocationBookDetails').val(),
                data: data,
                datatype: 'json',
                success: function (response) {
                    LoadChapterTable(response.aitemList);
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
        }
        else {
            var data = {
                BookID: aBookID,
                TaskID: aTaskID,
                FreelancerID: aFreelancerID,
                aViewTab: $('#BkTabul li.active').text()
            };
            $.ajax({
                type: 'get',
                url: $('#hf_GetAllocationChapters').val(),
                data: data,
                datatype: 'json',
                success: function (response) {
                    LoadChapterTable(response.aitemList, response.Freelanceritems);
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
        }

    });

    $('#BkTabul li').click(function () {
        var aTabType = $(this)[0].innerText;
        if (aTabType == 'Allocation')
            $('#btnApproveDataEntry').show();
        else
            $('#btnApproveDataEntry').hide();
        CallFreelanceAllocationBk('true', '', '', '', '', '', aTabType);
    });
    CallFreelanceAllocationBk('true', '', '', '', '', '');
    $('#FUpload').change(function () {
        FileUpload();
    });
    $('#myModal_Chapter').on('hidden.bs.modal', function () {
        DeleteTempFolder();
    })

    // Update For Due Date,Withdrawn and Manual Return
    $('#btnUpdate').click(function () {
        var aList = GetTableRowToList('tblAllocationChapter');
        var aActiveTab = $('#BkTabul li.active').text();
        if (aActiveTab == 'Due Date Change') {
            var aDueDateValidate = true;
            $.each($('.FreelancerDueDt'), function (e, val) {
                if ($(this).val() == '') {
                    $.bootstrapGrowl('Select Due Date !', {
                        type: 'danger',
                        delay: 2000,
                    });
                    $(this).focus();
                    aDueDateValidate = false;
                }
            });
            if ($('.FreelancerDueDt').length == 0) {
                aDueDateValidate = false;
                $.bootstrapGrowl('No Chapter Found!', {
                    type: 'danger',
                    delay: 2000,
                });
            }
            if (aDueDateValidate)
                UpdateAllocationData(aList, aActiveTab);

        }
        else if (aActiveTab == 'Withdrawn') {
            var zWithdrawnList = $('.Withdrawn:checked').length;
            if (zWithdrawnList == 0) {
                $.bootstrapGrowl('Select Withdraw Chapters !', {
                    type: 'danger',
                    delay: 2000,
                });
                return false;
            }
            bootbox.prompt("Enter Remarks for Withdraw!", function (result) {
                if (result != '' && result != null) {
                    UpdateAllocationData(aList, aActiveTab, result);
                }
                else {
                    $.bootstrapGrowl('Enter Remarks for Withdraw !', {
                        type: 'danger',
                        delay: 2000,
                    });
                }

            });

        }
        else if (aActiveTab == 'Manual Return') {
            var aFinalValidate = false;
            $.each($('.FreelancerFinalDt'), function (e, val) {
                if ($(this).val() != '') {
                    aFinalValidate = true;
                }
            });
            if (!aFinalValidate) {
                $.bootstrapGrowl('Select Completed date for Chapters!', {
                    type: 'danger',
                    delay: 2000,
                });
                return false;
            }
            UpdateAllocationData(aList, aActiveTab);
        }

    })
});


function UpdateAllocationData(Itemlist, aActiveTab, zWithDrawRemarksL) {
    var data = {
        nBookID: aBookID,
        nTaskID: aTaskID,
        aActiveTab: aActiveTab,
        zChapterList: Itemlist,
        zWithDrawRemarks: zWithDrawRemarksL
    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateAllocationData').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            $.bootstrapGrowl(response, {
                type: 'info',
                delay: 5000,
            });
            $('#LoadingImage').hide();
            GetChapterData(aEditGroupIDG);
            CallFreelanceAllocationBk('true', '', '', '', '', '', $('#BkTabul li.active').text());
        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
            $('#myModal_WorkFlow').modal('hide');
        }
    });
}

function CallFreelanceAllocationBk(zFirstLoad, zNumberList, zCatalogList, zISBNList, zPublList, zTaskList, aViewTab) {
    $('#LoadingImage').show();
    var zCatList = 'All';
    var zNumList = 'All';
    var zISList = 'All';
    var zPubList = 'All';
    var zTkList = 'All';

    if (zNumberList != '')
        zNumList = zNumberList;
    if (zCatalogList != '')
        zCatList = zCatalogList;
    if (zISBNList != '')
        zISList = zISBNList;
    if (zPublList != '')
        zPubList = zPublList;
    if (zTaskList != '')
        zTkList = zTaskList;

    if (aViewTab == null)
        aViewTab = $('#BkTabul li.active').text();

    var data = {
        FirstLoad: zFirstLoad,
        CatalogList: zCatList,
        NumList: zNumList,
        ISBNList: zISList,
        PublList: zPubList,
        TaskList: zTkList,
        zViewType: aViewTab
    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetAllocationBk').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechAllocationData(response.aItemList);

            if (zFirstLoad == 'true') {
                var items = response.Catalogitems;
                if (items != null) {
                    $("#lstCatalogList").empty();
                    for (var i = 0; i < items.length; i++) {

                        $("#lstCatalogList").append("<option value='" + items[i].Text + "'>" + items[i].Text + "</option>");
                    }
                }

                items = response.ISBNitems;
                if (items != null) {
                    $("#lstISBNList").empty();
                    for (var i = 0; i < items.length; i++) {

                        $("#lstISBNList").append("<option value='" + items[i].Text + "'>" + items[i].Text + "</option>");
                    }
                }
                items = response.Numberitems;
                if (items != null) {
                    $("#lstNumberList").empty();
                    for (var i = 0; i < items.length; i++) {

                        $("#lstNumberList").append("<option value='" + items[i].Text + "'>" + items[i].Text + "</option>");
                    }
                }
            }

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

function FetechAllocationData(ItemsList) {
    try {
        dataSet = [];
        var items = ItemsList;
        var zCtInP = 0;
        var zCtCom = 0;
        var zBookShelfList = '';
        var zBookNo = ''; var zTaskName = '';

        $.each(items, function (index) {
            var zindexL = 0;
            zCtInP += 1;
            zindexL = zCtInP;
            if (zBookNo != $(this)[0]["Number"] || zTaskName != $(this)[0]["TaskName"]) {
                var t = [
                    zindexL.toString(),
                    $(this)[0]["Number"],
                    $(this)[0]["Catalog"],
                    $(this)[0]["ISBN"],
                    $(this)[0]["PEName"],
                    $(this)[0]["PMName"],
                    $(this)[0]["TaskName"],
                    ($('#BkTabul li.active').text() == 'Allocation' ? '---' : FormatDateColumn($(this)[0]["FileUploadDate"])),
                    FormatDateColumn($(this)[0]["AllocateDueDate"]),
                    "'" + $(this)[0]["ID"] + "|" + $(this)[0]["TaskID"] + "|" + $(this)[0]["Catalog"] + "|" + $(this)[0]["TaskName"] + "|" + $(this)[0]["SuggestedFreelancer"] + "|" + $(this)[0]["AllocateDueDate"] + "'"
                ];
                zBookNo = $(this)[0]["Number"]; zTaskName = $(this)[0]["TaskName"];

                dataSet.push(t);
            }
        });

        LoadAllocationData();
    } catch (e) {
        $('#LoadingImage').hide();
    }
}

function LoadAllocationData() {
    var table = $('#tblAllocationBk').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
        "deferRender": true,
        data: dataSet,
        columns: [
            { title: "S.No." },
            { title: "Book ID" },
            { title: "Catalog" },
            { title: "ISBN" },
            { title: "PE Name" },
            { title: "PM Name" },
            { title: "Activity" },
            { title: "Sent Date" },
            { title: "Due Date" },
            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class=spUpdateIcon style="display:none"><i class="fa fa-pen iEdit" aria-hidden="true" title="Update" data-col="Name" onclick="GetChapterData(' + isNullCheck(data) + ');"></i></span>';

                }
            }
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
                filename: 'Freelancer - ' + $('#BkTabul li.active').text() + today.toShortFormatWithTime(),

                title: 'Freelancer - ' + $('#BkTabul li.active').text(),
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7, 8],
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
                filename: 'Freelancer - ' + $('#BkTabul li.active').text() + today.toShortFormatWithTime(),

                title: 'Freelancer - ' + $('#BkTabul li.active').text(),
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7, 8],
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
        "scrollY": (size.height - 215),
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

}

function GetChapterData(zID) {
    aEditGroupIDG = zID;
    $('#LoadingImage').show();
    var zBookID = zID.split('|')[0];
    var zTaskID = zID.split('|')[1];
    var Catalog = zID.split('|')[2];
    var Task = zID.split('|')[3];
    var zFreelancerID = zID.split('|')[4];

    var zFreeBkDueDate = zID.split('|')[5];

    aBookID = zBookID;
    aTaskID = zTaskID;

    aCatalogG = Catalog;
    aTaskNameG = Task;


    aFreelancerID = zFreelancerID;
    $('#lblTitle').text('Freelancer ' + $('#BkTabul li.active').text() + ' - ' + Catalog + ' (' + Task + ')');

    var data = {
        BookID: zBookID,
        TaskID: zTaskID,
        FreelancerID: zFreelancerID,
        aViewTab: $('#BkTabul li.active').text()
    };
    $.ajax({
        type: 'get',
        url: $('#hf_GetAllocationChapters').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            aChapterG = '';
            LoadChapterTable(response.aitemList, response.Freelanceritems, zFreeBkDueDate)
            var aChapterEntryList = response.aChapterEntryList;
            var aBookWiseEntry = response.aBookWiseEntry;
            //Check Chapter wise or Book Wise
            $('#chkBookwise').removeAttr('disabled');
            $('#chkBookwise').prop('checked', false).trigger("change");
            if (aChapterEntryList.length == 0 && aBookWiseEntry.length == 0)
                $('#chkBookwise').removeAttr('disabled');
            else if (aChapterEntryList.length > 0)
                $('#chkBookwise').attr('disabled', 'disabled');
            else if (aBookWiseEntry.length == 1) {
                $('#chkBookwise').attr('disabled', 'disabled');
                if ($('#BkTabul li.active').text() == 'Allocation') // Trigger only For Allocation Tag
                    $('#chkBookwise').prop('checked', true).trigger("change");
            }
            $('#LoadingImage').hide();
            if ($('#chkBookwise').is(':checked') == false && $('#BkTabul li.active').text() == 'Allocation')
                $("#myModal").modal({ backdrop: 'static', keyboard: false });
            else
                $("#myModal").modal({ backdrop: 'static', keyboard: false });
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 2000,
            });
            $('#LoadingImage').hide();
        }
    });
}


function LoadChapterTable(Chapteritems, Freelanceritems, zFreeBkDueDate) {
    var aActiveTab = $('#BkTabul li.active').text();
    $('#divLoadChapter').html('');
    var items = Freelanceritems;
    if (Freelanceritems != null) {
        $("#ddlFreelancer").empty();
        for (var i = 0; i < items.length; i++) {
            $("#ddlFreelancer").append("<option value='" + items[i].Value + "'>" + items[i].Text + "</option>");
        }
    }
    $('#ddlFreelancer').val(-1).change();
    //var ztable = "<table id='tblAllocationChapter' class='tblTrans' style='overflow:hidden'><thead><tr><th>S.No.</th><th>Number</th><th>Title</th><th>MS Pages</th><th>Typeset Pages</th><th>Due Date</th><th>Reminder<br/><input id='chkReminder' type='checkbox'  /></th><th>Upload</th></tr></thead>";
    var ztable = "<table id='tblAllocationChapter' class='tblTrans' style='overflow:hidden'><thead><tr><th>S.No.</th><th>Number</th><th>Title</th><th>MS Pages</th><th>Typeset Pages</th><th>Total Pages</th><th>Total Words</th><th>Total Tables</th><th>Total Figures</th><th>Due Date</th><th>Upload</th><th><input id='chkAllBulkUpload' type='checkbox'  /></th></th></tr></thead>";
    $('.divAllocation').show();
    $('.divDueDate').show();
    $('#divFooter').hide();//Not For Allocation Tab
    var aDueDateL = '';
    if (aActiveTab == 'Due Date Change') {
        ztable = "<table id='tblAllocationChapter' class='tblTrans' style='overflow:hidden'><thead><tr><th>S.No.</th><th>Freelancer Name</th><th>Number</th><th>Title</th><th>MS Pages</th><th>Typeset Pages</th><th>Total Pages</th><th>Total Words</th><th>Total Tables</th><th>Total Figures</th><th>Due Date</th></tr></thead>";
        $('.divAllocation').hide();
        $('#divFooter').show();//Show not tab as Allocation
        $('.divDueDate').show();
    }
    else if (aActiveTab == 'Withdrawn') {
        ztable = "<table id='tblAllocationChapter' class='tblTrans' style='overflow:hidden'><thead><tr><th>S.No.</th><th>Freelancer Name</th><th>Number</th><th>Title</th><th>MS Pages</th><th>Typeset Pages</th><th>Total Pages</th><th>Total Words</th><th>Total Tables</th><th>Total Figures</th><th>Due Date</th><th>Withdrwan<br/><input id='chkWithdrwan' type='checkbox'  /></th></tr></thead>";
        $('.divAllocation').hide();
        $('#divFooter').show();//Show not tab as Allocation
        $('.divDueDate').hide();
    }
    else if (aActiveTab == 'Manual Return') {
        ztable = "<table id='tblAllocationChapter' class='tblTrans' style='overflow:hidden'><thead><tr><th>S.No.</th><th>Freelancer Name</th><th>Number</th><th>Title</th><th>MS Pages</th><th>Typeset Pages</th><th>Total Pages</th><th>Total Words</th><th>Total Tables</th><th>Total Figures</th><th>Due Date</th><th>Completed Date</th></tr></thead>";
        $('.divAllocation').hide();
        $('#divFooter').show();//Show not tab as Allocation
        $('.divDueDate').hide();
    }

    for (var i = 0; i < Chapteritems.length; i++) {
        ztable += "<tr id=tr" + Chapteritems[i].ChapterID + ">";

        if ($('#BkTabul li.active').text() != 'Allocation') {
            aDueDateL = FormatDateColumn(Chapteritems[i].DueDate);
        }
        else if ($('#BkTabul li.active').text() == 'Allocation' && typeof zFreeBkDueDate != "undefined") {
            aDueDateL = FormatDateColumn(zFreeBkDueDate);
            $('#txtDueDt').val(aDueDateL);
        }
        ztable += "<td width1='4%' style='text-align: center'>" + (i + 1).toString() + "</td>";

        //Add Freelancer Column for Due Date,Withdrawn and Manual Return
        if ($('#BkTabul li.active').text() != 'Allocation')
            ztable += "<td>" + Chapteritems[i].FreelancerName + "</td>";

        ztable += "<td width1='20%'>" + Chapteritems[i].ChapterID + "</td>";
        ztable += "<td width1='20%'>" + Chapteritems[i].Title + "</td>";
        ztable += "<td width1='5%' style='text-align: right'>" + Chapteritems[i].MSPages + "</td>";
        ztable += "<td width1='5%' style='text-align: right'>" + Chapteritems[i].PPages + "</td>";

        if ($('#BkTabul li.active').text() == 'Allocation') {
            ztable += "<td width='7%'><input type='text' class='form-control IsNumeric txtPages' value='0' maxlength='6' /></td>";
            ztable += "<td width='7%'><input type='text' class='form-control IsNumeric txtWords' value='0' maxlength='6' /></td>";
            ztable += "<td width='7%'><input type='text' class='form-control IsNumeric txtTables' value='0' maxlength='6' /></td>";
            ztable += "<td width='7%'><input type='text' class='form-control IsNumeric txtFigures' value='0' maxlength='6' /></td>";
        }
        else {
            ztable += "<td width1='5%' style='text-align: right'>" + Chapteritems[i].TotalPages + "</td>";
            ztable += "<td width1='5%' style='text-align: right'>" + Chapteritems[i].TotalWords + "</td>";
            ztable += "<td width1='5%' style='text-align: right'>" + Chapteritems[i].TotalTables + "</td>";
            ztable += "<td width1='5%' style='text-align: right'>" + Chapteritems[i].TotalFigures + "</td>";
        }

        if (aActiveTab == 'Due Date Change') {//Update Option for Due Date chagne tab
            ztable += "<td width1='10%'><input id='txtDueDt-" + Chapteritems[i].ChapterID + "'  type='text' readonly class='form-control FreelancerDueDt inputHandCursor' value='" + aDueDateL + "' /></td>";
        }
        else if (aActiveTab == 'Withdrawn') {
            ztable += "<td width='10%'><center>" + aDueDateL + "</center></td>";
            ztable += "<td width='7%' style='text-align: center'><input id='chkWithdrawn-" + Chapteritems[i].ChapterID + "' type='checkbox'  class='Withdrawn'/></td>";
        }
        else if (aActiveTab == 'Manual Return') {
            ztable += "<td width='10%'><center>" + aDueDateL + "</center></td>";
            ztable += "<td width='10%'><input id='txtFinalDt-" + Chapteritems[i].ChapterID + "'  type='text' readonly class='form-control FreelancerFinalDt inputHandCursor' /></td>";
        }
        else {
            ztable += "<td width='10%'><input id='txtDueDt-" + Chapteritems[i].ChapterID + "'  type='text' readonly class='form-control FreelancerDueDt inputHandCursor' value='" + $('#txtDueDt').val() + "' /></td>";
        }
        if ($('#BkTabul li.active').text() == 'Allocation') {
            //ztable += "<td width='7%' style='text-align: center'><input id='chkReminder-" + Chapteritems[i].ChapterID + "' type='checkbox'  class='Reminder'/></td>";
            ztable += "<td width='5%' style='text-align: center'><i class='fas fa-upload' data-id=" + Chapteritems[i].ChapterID + "></i></td>"

            ztable += "<td width='7%' style='text-align: center'><input id='chkBulk-" + Chapteritems[i].ChapterID + "' type='checkbox'  class='BulkUpload'/></td>";

            $('#ddlFreelancer').val(aFLID).change();
        }

        ztable += "</tr>";
    }
    ztable += '</table>';
    $('#divLoadChapter').html(ztable);

    $('#chkReminder').change(function () {
        if ($(this).is(":checked")) {
            $(".Reminder").prop('checked', true);
        }
        else {
            $(".Reminder").prop('checked', false);
        }
    });
    $('#chkWithdrwan').change(function () {
        if ($(this).is(":checked")) {
            $(".Withdrawn").prop('checked', true);
        }
        else {
            $(".Withdrawn").prop('checked', false);
        }
    });
    $('#chkSelect').change(function () {
        if ($(this).is(":checked")) {
            $(".chkChapter").prop('checked', true);
        }
        else {
            $(".chkChapter").prop('checked', false);
        }
    });

    $('#chkAllBulkUpload').change(function () {
        if ($(this).is(":checked")) {
            $(".BulkUpload").prop('checked', true);
        }
        else {
            $(".BulkUpload").prop('checked', false);
        }
    });

    $('.FreelancerDueDt').datetimepicker({
        format: 'd M Y',
        //value: new Date(),
        timepicker: false,
        minDate: today,
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });

    $('.FreelancerFinalDt').datetimepicker({
        format: 'd M Y',
        //value: new Date(),
        timepicker: false,
        //beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false

    });
    //Chpapter wise Upload Eevent.
    $('.fa-upload').click(function () {
        aChapterG = $(this).attr('data-id');

        var aDueDate = $(this).closest('tr').find('.FreelancerDueDt');
        if ($('#ddlFreelancer').val() == null) {
            $.bootstrapGrowl('Select Freelancer !', {
                type: 'warning',
                delay: 2000,
            });
            $('#ddlFreelancer').focus();
            return false;
        }
        if (aDueDate.val() == "") {
            $.bootstrapGrowl('Select Due Date !', {
                type: 'warning',
                delay: 2000,
            });
            aDueDate.focus();
            return false;
        }
        DeleteTempFolder();
        $('#lblChapter').text('Chapter Approve - ' + aChapterG);
        $("#myModal_Chapter").modal({ backdrop: 'static', keyboard: false });
    });


}


function FileUpload() {
    if (validateFileType('#FUpload', 51000000)) {
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
            fileData.append('Catalog', aCatalogG);
            fileData.append('TaskName', aTaskNameG);
            fileData.append('Chapter', aChapterG);
            $('.FileAttach').show();
            $.ajax({
                url: $('#hf_UploadFolder').val(),
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
            $('.FileAttach').hide();
        }
    }
    else
        $("#FUpload").val(null);
}

function DeleteTempFile(zitem) {
    var atrItem = $(zitem).closest('tr').find('td');

    var zFileNameP = atrItem[1].innerText;
    try {
        $('#LoadingImage').show();
        var data = { zCatalog: aCatalogG, zTaskName: aTaskNameG, zChapter: aChapterG, zFileName: zFileNameP }
        $.ajax({
            type: 'post',
            url: $('#hf_DeleteTempFile').val(),
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

function DeleteTempFolder() {
    try {
        $('#LoadingImage').show();
        var data = { zCatalog: aCatalogG, zTaskName: aTaskNameG, zChapter: aChapterG }
        $.ajax({
            type: 'post',
            url: $('#hf_DeleteTempFolder').val(),
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
    } catch (e) {

    }
}

$(function () {
    $('#btnApproveAllocation').click(function () {
        aFLID = $('#ddlFreelancer').val();
        if ($('#tblFileList tbody tr').length == 0) {
            $.bootstrapGrowl('Kindly Select Files for Upload !', {
                type: 'warning',
                delay: 5000,
            });
            return false;
        }
        else {
            bootbox.confirm("Are you sure to Approve ?",
                function (result) {
                    if (result) {
                        $('#myModal_Chapter').modal('hide');
                        $('#myModal').modal('hide');
                        FileUploadWithZip();
                    }
                });
        }
    });

    $('#btnApproveDataEntry').click(function () {
        aFLID = $('#ddlFreelancer').val();
        var zBulkApproveList = $('.BulkUpload:checked').length;
        if (zBulkApproveList == 0) {
            $.bootstrapGrowl('Select Chapters for Approve!', {
                type: 'danger',
                delay: 2000,
            });
            return false;
        }
        else if ($('#ddlFreelancer').val() == null) {
            $.bootstrapGrowl('Select Freelancer !', {
                type: 'warning',
                delay: 2000,
            });
            $('#ddlFreelancer').focus();
            return false;
        }
        else {
            bootbox.confirm("Are you sure to Approve ?",
                function (result) {
                    if (result) {
                        $('#myModal_Chapter').modal('hide');
                        $('#myModal').modal('hide');
                        FreelancerAllocationData();
                    }
                });
        }
    });
});

//Allocation File Upload Function
function FileUploadWithZip() {
    var atrChapter = $('#tr' + aChapterG);
    var zMSPages = atrChapter.find('td')[3].innerText;
    var zTSPages = atrChapter.find('td')[4].innerText;
    var zTotalPages = atrChapter.find('.txtPages').val();
    var zTotalWords = atrChapter.find('.txtWords').val();
    var zTotalTables = atrChapter.find('.txtTables').val();
    var zTotalFigures = atrChapter.find('.txtFigures').val();
    var aDueDate = atrChapter.find('.FreelancerDueDt').val();
    $('#LoadingImage').show();
    var data = {
        nBookID: aBookID,
        nTaskID: aTaskID,
        nFLID: $('#ddlFreelancer').val(),
        nMSPages: zMSPages,
        nTSPages: zTSPages,
        nTotalPages: zTotalPages,
        nTotalWords: zTotalWords,
        nTotalTables: zTotalTables,
        nTotalFigures: zTotalFigures,
        zDueDate: aDueDate,
        zCatalog: aCatalogG,
        zTaskName: aTaskNameG,
        zChapter: aChapterG
    }
    $.ajax({
        type: 'post',
        url: $('#hf_FileUploadWithZip').val(),
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
                $.bootstrapGrowl('Uploaded Successfully..', {
                    type: 'info',
                    delay: 2000,

                });

                $("#FUpload").val(null);
                $("#tblFileList > tbody").html("");
                $('#LoadingImage').hide();
                $('#myModal_Chapter').modal('hide');
                if ($('#chkBookwise').is(':checked')) {
                    $('#myModal').modal('hide');
                    CallFreelanceAllocationBk('true', '', '', '', '', '');
                }
                else {
                    GetChapterData(aEditGroupIDG);
                }

            }
        },
        error: function (response) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 2000,
            });
            $('#LoadingImage').hide();
        }
    });

}

function GetTaskRowtoJson() {
    var data = [];
    var itemrow = $('#tblAllocationChapter tbody tr');
    $.each(itemrow, function (e, val) {
        if ($($(this).find('td .BulkUpload')[0]).is(":checked")) {
            data.push({
                "SNo": $(val).find('td')[0].innerText,
                "Chapter": $(val).find('td')[1].innerText,
                "MSPages": $(val).find('td')[3].innerText,
                "TSPages": $(val).find('td')[4].innerText,
                "TotalPages": $($(this).find('td .txtPages')[0]).val(),
                "TotalWords": $($(this).find('td .txtWords')[0]).val(),
                "TotalTables": $($(this).find('td .txtTables')[0]).val(),
                "TotalFigures": $($(this).find('td .txtFigures')[0]).val(),
                "DueDate": $($(this).find('td .FreelancerDueDt ')[0]).val(),
            });
        }
    });
    return data;
}

//Allocation Data Entry only
function FreelancerAllocationData() {
    var aChapterListL = GetTaskRowtoJson();
    $('#LoadingImage').show();
    var data = {
        nBookID: aBookID,
        nTaskID: aTaskID,
        nFLID: $('#ddlFreelancer').val(),
        zChapterList: JSON.stringify(aChapterListL),
        zCatalog: aCatalogG,
        zTaskName: aTaskNameG,
        zChapter: aChapterG
    }
    $.ajax({
        type: 'post',
        url: $('#hf_FreelancerAllocateDataEntry').val(),
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
                $.bootstrapGrowl('Uploaded Successfully..', {
                    type: 'info',
                    delay: 2000,

                });

                $("#FUpload").val(null);
                $("#tblFileList > tbody").html("");
                $('#LoadingImage').hide();
                $('#myModal_Chapter').modal('hide');
                GetChapterData(aEditGroupIDG);
            }
        },
        error: function (response) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 2000,
            });
            $('#LoadingImage').hide();
        }
    });

}