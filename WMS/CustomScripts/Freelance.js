var dataSet = [];
var aBookID = "";
var aTaskID = "";
var aCatalog = ""
var aTaskName = "";
var aMailContent = "";
var aChapterData = "";
var aBooksListG;
var aPMName = "";
$(function () {
    $('.divBookContent').css('height', size.height - 120);
    $('#TxtMailBody').jqte();
    $('.txtservice').select2({ placeholder: "Select", allowClear: true });
    $('#ddlUnitType').select2({ placeholder: "Select", allowClear: true });
    $('#ddlWIPSearch').select2();
    $('#lstPublisherList').select2({
        closeOnSelect: false,
        placeholder: "Select Publisher(s)",

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

    $('#spFileAdd').click(function (e) {
        $('#file-input').trigger('click');
    });

    $('#txtDueDate').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        beforeShowDay: noWeekendsOrHolidays,
        minDate: today,
        scrollMonth: false,
        scrollInput: false
    });

    $('body').click(function (e) {
        try {
            if (e.target.closest('.dropdown') == null && e.target.className.indexOf('select2') == -1)
                closeToggle();
        } catch (e) {
        }
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

        CallFreelanceSelectionBk('true', zNumberList, zCatalogList, zISBNList, zPublList, zTaskList);

    });

    $('#btnUpdate').click(function () {
        UpdateFreelancerSelection();
    });

    $('#btnEmail').click(function () {
        var IsValid = Validate();
        if (!IsValid)
            return false;
        
        if (aChapterData.length > 0) {
            aMailContent = aMailContent.replace(/{PMName}/g, aPMName);
            aMailContent = aMailContent.replace("{Title}", aBooksListG.Title);
            aMailContent = aMailContent.replace("{MSPages}", aChapterData[0].MSPages);
            aMailContent = aMailContent.replace("{ChapterCnt}", aChapterData[0].ChapterCnt);
            aMailContent = aMailContent.replace("{Cost}", $('#txtCost').val());
            aMailContent = aMailContent.replace("{WordCnt}", $('#txtVolume').val());
            aMailContent = aMailContent.replace("{DueDate}", $('#txtDueDate').val());
            aMailContent = aMailContent.replace("{TSPages}", aChapterData[0].TSPages);
        }
        else {
            aMailContent = aMailContent.replace(/{PMName}/g, aPMName);
            aMailContent = aMailContent.replace("{Title}", aBooksListG.Title);
            aMailContent = aMailContent.replace("{MSPages}", "0");
            aMailContent = aMailContent.replace("{ChapterCnt}", "0");
            aMailContent = aMailContent.replace("{Cost}", $('#txtCost').val());
            aMailContent = aMailContent.replace("{WordCnt}", $('#txtVolume').val());
            aMailContent = aMailContent.replace("{DueDate}", $('#txtDueDate').val());
            aMailContent = aMailContent.replace("{TSPages}", "0");
        }
      

        $('#TxtMailBody').val(aMailContent);
        $('#myModal_Review .jqte_editor').html(aMailContent);
        $("#myModal_Review").modal({ backdrop: 'static', keyboard: false });
    });

    $('#btnSendEmail').click(function () {
        $('#LoadingImage').show();

        $('#myModal').modal('hide');
        $("#myModal_Review").modal('hide');
        var getFreelancerList = [];
        getFreelancerList = GetTableRowToList('tblFreelancerList');
        if (getFreelancerList.length == 0) {
            $.bootstrapGrowl('Add Freelancer details ! ', {
                type: 'danger', delay: 5000,
            });
            $('#LoadingImage').hide();
            return false;
        }
        var data = {
            zCost: $('#txtCost').val(),
            zVolume: $('#txtVolume').val(),
            zUnitType: $('#ddlUnitType').val(),
            zBookID: aBookID,
            zTaskID: aTaskID,
            zDueDate: $('#txtDueDate').val(),
            FreelancerL: getFreelancerList,
            zMailBody: $('#myModal_Review .jqte_editor').html(),
            zSubject: "Checking for availability " + aCatalog,
            zCatalog: aCatalog,
            zTask: aTaskName

        }
        $.ajax({
            type: 'post',
            url: $('#hf_UpdateFreelancerandMail').val(),
            data: data,
            datatype: 'json',
            traditional: true,
            success: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'info',
                    delay: 5000,
                });
                CallFreelanceSelectionBk('true', '', '', '', '', '');
                $('#LoadingImage').hide();
                $('#myModal').modal('hide');
                $("#myModal_Review").modal('hide');
            },
            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 5000,
                });
                $('#LoadingImage').hide();
                $('#myModal').modal('hide');
                $("#myModal_Review").modal('hide');
            }
        });
    });

    $.ajax({
        type: 'get',
        url: $('#hf_GetUnitType').val(),
        datatype: 'json',
        success: function (response) {

            var items = response.aUnitTypeList;

            $("#ddlUnitType").empty();
            for (var i = 0; i < items.length; i++) {

                $("#ddlUnitType").append("<option value='" + items[i].UnitType + "'>" + items[i].UnitType + "</option>");
            }

        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 5000,
            });

        }
    });

    $('input[type="file"]').change(function (e) {
        if (window.FormData !== undefined && validateFileType('#file-input')) {
            var fileUpload = $("#file-input").get(0);
            var files = fileUpload.files;
            var fileData = new FormData();
            for (var i = 0; i < files.length; i++) {
                if ($("#tblAttachment tbody tr").length > 0) {
                    $.each($("#tblAttachment tbody tr"), function (e) {
                        var zPreVal = $(this).find('td')[0].innerText;

                        if (zPreVal == files[i].name) {
                            $.bootstrapGrowl('Already ' + files[i].name + ' Added !', {
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
                    for (var i = 0; i < files.length; i++) {
                        fileData.append(files[i].name, files[i]);
                    }
                }
            }
            fileData.append("Catalog", aCatalog);
            fileData.append("Task", aTaskName);
            $.ajax({
                url: $('#hf_Fileupload').val(),
                type: "POST",
                contentType: false, // Not to set any content header  
                processData: false, // Not to process data  
                data: fileData,
                datatype: 'json',
                success: function (response) {
                    for (var i = 0; i < files.length; i++) {
                        var Stable = "<tr>";
                        Stable += "<td><a href='../Source/FreelanceSelection/" + aCatalog + "/" + aTaskName + "/" + files[i].name + "' download> " + files[i].name + "</td>";
                        Stable += "<td style='text-align: center'><i class='fas fa-trash' onclick='DeleteFile(this);'></i></td>";
                        Stable += "</tr>";

                        $('#tblAttachment tr:last').after(Stable);

                    }
                    $("#file-input").val(null);
                },
                error: function (err) {
                    alert(err.statusText);
                }
            });
        }

    });


    CallFreelanceSelectionBk('true', '', '', '', '', '');

});

function CallFreelanceSelectionBk(zFirstLoad, zNumberList, zCatalogList, zISBNList, zPublList, zTaskList) {
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

    var data = {
        FirstLoad: zFirstLoad,
        CatalogList: zCatList,
        NumList: zNumList,
        ISBNList: zISList,
        PublList: zPubList,
        TaskList: zTkList
    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetSelectionBk').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechSelectionData(response.aItemList);

            if (zFirstLoad == 'true') {
                var items = response.Catalogitems;
                $("#lstCatalogList").empty();
                for (var i = 0; i < items.length; i++) {

                    $("#lstCatalogList").append("<option value='" + items[i].Text + "'>" + items[i].Text + "</option>");
                }
                items = response.ISBNitems;
                $("#lstISBNList").empty();
                for (var i = 0; i < items.length; i++) {

                    $("#lstISBNList").append("<option value='" + items[i].Text + "'>" + items[i].Text + "</option>");
                }
                items = response.Numberitems;
                $("#lstNumberList").empty();
                for (var i = 0; i < items.length; i++) {

                    $("#lstNumberList").append("<option value='" + items[i].Text + "'>" + items[i].Text + "</option>");
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

function FetechSelectionData(ItemsList) {
    try {
        dataSet = [];
        var items = ItemsList;
        var zCtInP = 0;
        var zCtCom = 0;
        var zBookShelfList = '';
        $.each(items, function (index) {
            var zindexL = 0;
            zCtInP += 1;
            zindexL = zCtInP;
            var t = [
                zindexL.toString(),
                $(this)[0]["Number"],
                $(this)[0]["Catalog"],
                $(this)[0]["ISBN"],
                $(this)[0]["Publisher"],
                $(this)[0]["PEName"],
                $(this)[0]["PMName"],
                $(this)[0]["TaskName"],
                "'" + $(this)[0]["ID"] + "|" + $(this)[0]["TaskID"] + "|" + $(this)[0]["Catalog"] + "|" + $(this)[0]["TaskName"] + "'"
            ];

            dataSet.push(t);

        });

        LoadSelectionData();
    } catch (e) {
        $('#LoadingImage').hide();
    }
}
function LoadSelectionData() {
    var table = $('#tblSelectionBk').DataTable({
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
            { title: "Publisher" },
            { title: "PE Name" },
            { title: "PM Name" },
            { title: "Activity" },

            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class=spDeleteIcon style="display:none"><i class="fa fa-cut" aria-hidden="true" title="Skip" data-col="Name" onclick="SkipSelecionData(' + isNullCheck(data) + ');"></i></span>' +
                        '<span class=spUpdateIcon style="display:none"><i class="fa fa-pen" aria-hidden="true" title="Edit" data-col="Name" onclick="GetFreelanceData(' + isNullCheck(data) + ');"></i></span>';

                }
            }
        ],

        "destroy": true,

        fixedHeader: {
            header: true
        },
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'Outsource' + today.toShortFormatWithTime(),

                title: 'Outsource Book - ' + $('#BkTabul li.active').text(),
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7],
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
                filename: 'Outsource' + today.toShortFormatWithTime(),

                title: 'Outsource Book - ' + $('#BkTabul li.active').text(),
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7],
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

function SkipSelecionData(zID) {
    bootbox.confirm("Are you sure to skip Selection ?",
        function (result) {
            if (result) {
                $('#LoadingImage').show();
                var BookID = zID.split('|')[0];
                var TaskID = zID.split('|')[1];
                var Catalog = zID.split('|')[2];
                var Task = zID.split('|')[3];
                aBookID = BookID;
                aTaskID = TaskID;
                aCatalog = Catalog;
                aTaskName = Task;
                var data = { zBookID: aBookID, zTaskID: aTaskID, zCatalog: Catalog };
                $.ajax({
                    type: 'post',
                    url: $('#hf_SkipSelectionData').val(),
                    data: data,
                    datatype: 'json',
                    success: function (response) {
                        if (response.toString().indexOf('Error') != -1) {
                            $.bootstrapGrowl(response, {
                                type: 'danger',
                                delay: 2000,
                            });
                        }
                        else {
                            $.bootstrapGrowl(response, {
                                type: 'info',
                                delay: 2000,
                            });

                        }
                        $('#LoadingImage').hide();
                        CallFreelanceSelectionBk('true', '', '', '', '', '');

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
        });


}

function GetFreelanceData(zID) {
    debugger;
    var BookID = zID.split('|')[0];
    var TaskID = zID.split('|')[1];
    var Catalog = zID.split('|')[2];
    var Task = zID.split('|')[3];
    aBookID = BookID;
    aTaskID = TaskID;
    aCatalog = Catalog;
    aTaskName = Task;

    $('#lblTitle').text('Freelancer Selection - ' + Catalog + ' (' + Task + ') ');

    var data = { zBookID: BookID, zTaskID: TaskID, zCatalog: Catalog, zTask: Task };
    $.ajax({
        type: 'post',
        url: $('#hf_GetFreelanceData').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            aBooksListG = response.aBooksListL;
            var items = response.aitemList;
            var Bkitems = response.zBkList;
            $('#txtCost').val(Bkitems.SuggestedCost);
            $('#txtVolume').val(Bkitems.SuggestedVolume);
            $('#ddlUnitType').val(Bkitems.SuggestedUnitType).change();
            if (Bkitems.DueDate != null) {
                $('#txtDueDate').val(FormatDateColumn(Bkitems.DueDate));
            }
            else {
                $('#txtDueDate').val('');
            }
            //.toString().split("T")[0]
            var ztable = "";
            ztable = "<span id='spFreelancerAdd' onclick='AddFreelancerRow(" + TaskID + "," + BookID + ");'><i class='fa fa-plus-square' aria-hidden='true'></i></span>";
            ztable += "<table id='tblFreelancerList' class='tblTrans'><thead><tr><th>S.No.</th><th>Name & Email</th><th>Capacity</th><th>Alloted</th><th>Available</th><th>#</th></tr></thead><tbody>";
            for (var i = 0; i < items.length; i++) {
                var zActList = "";
                ztable += "<tr>";
                ztable += "<td width='3%'>" + (i + 1).toString() + "</td>";

                zActList = '<select class="txtservice form-control"  onchange="SetPages(this)" disabled>';
                $.each(items, function (e, val) {

                    zActList += '<option value="' + items[i].ID + '" data-id="' + items[i].Capacity + '|' + items[i].Alloted + '" selected>' + items[i].Name + ' - ' + items[i].EmailID + '</option>';
                })
                zActList += '</select>';

                ztable += "<td width='40%'>" + zActList + "</td>";
                ztable += "<td width='15%'><input type='text' class='TxtCapacity' step='any' maxlength='15'value='" + items[i].Capacity + "' disabled/></td>"
                ztable += "<td width='15%'><input type='text' class='TxtAlloted' step='any' maxlength='15' value='" + items[i].Alloted + "' disabled/></td>"
                ztable += "<td width='15%'><input type='text' class='TxtAvailable' step='any' maxlength='15' value='" + (items[i].Capacity - items[i].Alloted) + "' disabled/></td>"

                ztable += "<td width='3%' style='text-align: center'><i class='fas fa-trash' onclick='FreelancerDelete(this);'></i></td>"
                ztable += "</tr>";



            }
            ztable += "</tbody>"
            $('.txtservice').select2({ placeholder: "Select", allowClear: true });
            $('#divLoadFreelance').html(ztable);
            $('#tblFreelancerList').css('cursor', 'move');



            var aFileList;

            aFileList = response.FileList;
            ztable = "";
            ztable += "<span id='spFileAdd' onclick='OpenFile();'><i class='fa fa-plus-square' aria-hidden='true'></i></span>"
            ztable += "<table id='tblAttachment' class='tblTrans' width=100%><thead><th>File Name</th><th>#</th></thead><tbody>"
            $.each(aFileList, function (e, val) {
                var zFileNameList = val.split('\\').pop(-1);
                ztable += "<tr>";
                ztable += "<td><a href='../Source/FreelanceSelection/" + Catalog + "/" + Task + "/" + zFileNameList + "' download> " + zFileNameList + "</td>";
                ztable += "<td style='text-align: center'><i class='fas fa-trash' onclick='DeleteFile(this);'></i></td>";
                ztable += "</tr>";
            });
            ztable += "</tbody>"
            ztable += "</table>";
            $('#divFiles').html(ztable);
            debugger;
            aMailContent = response.aMailBody[0].MailContent;
            aPMName = response.aPMData[0].LoginName;
            aChapterData = response.aChapterData;
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


    $('#spFileAdd').click(function (e) {
        debugger;
        $('#file-input').trigger('click');
    });

    $("#myModal").modal({ backdrop: 'static', keyboard: false });
}

function OpenFile() {
    debugger;
    $('#file-input').trigger('click');
}

function AddFreelancerRow(TaskID, BookID) {
    var zActList = "";

    var data = { zTaskID: TaskID, nBookID: BookID }
    $.ajax({
        type: 'post',
        url: $('#hf_GetFreelancerList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {

            var items = response.aFreelancerList;
            debugger;
            if (items.length > 0) {
                debugger;
                zActList = '<select class="txtservice" style="width:120px;" onchange="SetPages(this)" >';
                $.each(items, function (e, val) {
                    debugger;
                    zActList += '<option style="width:120px;" value="' + val.ID + '" data-id="' + val.Capacity + '|' + val.Alloted + '">' + val.Name + ' - ' + val.EmailID + '</option>';
                })
                zActList += '</select>';

                var nRowL = "<tr><td width='3%'>" + ($("#tblFreelancerList").find("tr").length).toString() + "</td>"
                    + "<td width='40%'>" + zActList + "</td>"
                    + "<td width='15%'><input type='text' class='TxtCapacity' step='any' maxlength='15'value='0' disabled/></td>"
                    + "<td width='15%'><input type='text' class='TxtAlloted' step='any' maxlength='15' value='0' disabled/></td>"
                    + "<td width='15%'><input type='text' class='TxtAvailable' step='any' maxlength='15' value='0' disabled/></td>"

                    + "<td width='3%' style='text-align: center'><i class='fas fa-trash' onclick='FreelancerDelete(this);'></i></td>"
                    + "</tr>";
                $("#tblFreelancerList tbody").append(nRowL);

                var alastbefore = $("#tblFreelancerList").find("tr:nth-last-child(2)");
                if ($(alastbefore).find('select').val() != "")
                    $($(alastbefore).find('select')[0]).attr('disabled', 'disabled');
                $($(alastbefore).find('input')).attr('disabled', 'disabled');

                var alasttr = $("#tblFreelancerList").find("tr:nth-last-child(1)");
                $(alasttr).find('select').select2({ placeholder: "Select", allowClear: true});
                $(alasttr).find('select').val(-1).change();
            }
            else {
                $.bootstrapGrowl("Add freelancer for this task !", {
                    type: 'danger',
                    delay: 2000,
                });
                return false;
            }

        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 2000,
            });
        }
    });
}

function SetPages(aitemL) {
    var txtbox = $(aitemL).closest('tr');
    var zChkVal = true;

    $.each($("#tblFreelancerList tbody tr"), function (e) {
        debugger;
        var zPreVal = $(this).find('td')[1].innerText;
        if ($(this).find('td').find('select').length > 0 && (e != $("#tblFreelancerList tbody tr").length - 1)) {
            zPreVal = $(this).find('td').find('select').val();
        }
        if (zPreVal == $(aitemL).val()) {
            $.bootstrapGrowl('Already Freelancer Added !', {
                type: 'danger',
                delay: 5000,
            });
            zChkVal = false;
            return false;
        }
    });

    if (zChkVal) {
        debugger;
        $(txtbox).find('.TxtCapacity').val($(aitemL).find(':selected').attr('data-id').split('|')[0]);
        $(txtbox).find('.TxtAlloted').val($(aitemL).find(':selected').attr('data-id').split('|')[1]);
        var Available = ($(aitemL).find(':selected').attr('data-id').split('|')[0]) - ($(aitemL).find(':selected').attr('data-id').split('|')[1])
        $(txtbox).find('.TxtAvailable').val(Available)
    }
    else {
        $(aitemL).val(-1).change();
    }
}

function FreelancerDelete(btndel) {
    $(btndel).closest("tr").remove();
    $("table#tblFreelancerList tbody").each(function () {
        $(this).children().each(function (index) {
            $(this).find('td').first().html(index + 1);
        });
    });
}

function Validate() {
    var aResultL = true;
    var aLast = $("#tblFreelancerList").find("tr").last();
    var aLastActivity = $(aLast).find('select').val();
    if ($(aLast).find('select').length > 0 && aLastActivity == null) {
        $.bootstrapGrowl('Select Freelancer !', {
            type: 'danger',
            delay: 5000,
        });
        aResultL = false;
    }

    if (aResultL) {
        if ($('#txtCost').val() == "") {
            $.bootstrapGrowl('Enter Total Cost !', {
                type: 'danger',
                delay: 5000,
            });
            aResultL = false;
        }
        else if ($('#txtVolume').val() == "") {
            $.bootstrapGrowl('Enter Total Volume !', {
                type: 'danger',
                delay: 5000,
            });
            aResultL = false;
        }
        else if ($('#ddlUnitType').val() == null) {
            $.bootstrapGrowl('Select Unit Type !', {
                type: 'danger',
                delay: 5000,
            });
            aResultL = false;
        }
        else if ($('#txtDueDate').val() == '') {
            $.bootstrapGrowl('Select Due Date !', {
                type: 'danger',
                delay: 5000,
            });
            aResultL = false;
        }

    }
    return aResultL;
}

function UpdateFreelancerSelection() {
    debugger;
    var IsValid = Validate();
    if (!IsValid)
        return false;
    $('#LoadingImage').show();

    var getFreelancerList = [];
    getFreelancerList = GetTableRowToList('tblFreelancerList');
    if (getFreelancerList.length == 0) {
        $.bootstrapGrowl('Add Freelancer details ! ', {
            type: 'danger', delay: 5000,
        });
        $('#LoadingImage').hide();
        return false;
    }
    var data = {
        zCost: $('#txtCost').val(),
        zVolume: $('#txtVolume').val(),
        zUnitType: $('#ddlUnitType').val(),
        zBookID: aBookID,
        zTaskID: aTaskID,
        zDueDate: $('#txtDueDate').val(),
        FreelancerL: getFreelancerList
    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateFreelancerSelection').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            $.bootstrapGrowl(response, {
                type: 'info',
                delay: 5000,
            });
            CallFreelanceSelectionBk('true', '', '', '', '', '');
            $('#LoadingImage').hide();
            $('#myModal').modal('hide');
        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
            $('#myModal').modal('hide');
        }
    });
}

function DeleteFile(aitem) {
    var aFileName = $(aitem).closest('tr').find('td a').html().trim();
    var data =
    {
        zCatalog: aCatalog,
        zFileNameP: aFileName,
        zTask: aTaskName

    };
    $.ajax({
        type: 'get',
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
            $(aitem).closest('tr').remove();
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again.. !', {
                type: 'danger',
                delay: 5000,
            });
        }
    });

}