var dataSet = [];
$(function () {
    $('.modal-body').css('height', size.height - 150);
    $('.divBookContent').css('height', size.height - 200);
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
    $('#txtFromDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        value: new Date(),
    });
    $('#txtToDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        value: new Date(),
    });
    $('#ddlWIPSearch').select2();
    $('#ddlType').select2();
    $('#ddlWIPSearch').change(function () {
        $('#divNumberFilter').hide();
        $('#divCatalogFilter').hide();
        $('#divISBNFilter').hide();
        $('#divPublisherFilter').hide();
        $('#divTypeFilter').hide();
        $('#lstNumberList').val(null).trigger("change");
        $('#lstCatalogFilter').val(null).trigger("change");
        $('#lstISBNList').val(null).trigger("change");
        $('#lstPublisherList').val(null).trigger("change");
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
        else if (SearchVal == "Type") {
            $('#divTypeFilter').show();
        }

    })
    $('.btnArchive').css("display", "");
    $('.btnRestore').css("display", "none");
    //$('.btnReport').css("display", "none");
    $('#BkTabul li').click(function () {

        $('#lstCatalogList').find('option').remove();
        $('#lstNumberList').find('option').remove();
        $('#lstISBNList').find('option').remove();
        $('#lstPublisherList').find('option').remove();

        closeToggle();
        var zNumberList = "";
        var zCatalogList = "";
        var zISBNList = "";
        var zPublList = "";
        var zTypeList = "";
        var zFromDt = "";
        var zToDt = "";

        if ($('#lstNumberList').val() != null)
            zNumberList = $('#lstNumberList').val().toString();
        if ($('#lstCatalogList').val() != null)
            zCatalogList = $('#lstCatalogList').val().toString();
        if ($('#lstISBNList').val() != null)
            zISBNList = $('#lstISBNList').val().toString();
        if ($('#lstPublisherList').val() != null)
            zPublList = $('#lstPublisherList').val().toString();

        if ($('#ddlWIPSearch').val() == "Type") {
            zTypeList = $('#ddlType').val().toString();
            zFromDt = FormatDate_IE($("#txtFromDt").val()); //2013-09-5
            zToDt = FormatDate_IE($("#txtToDt").val()); //2013-09-10
        }

        if ($(this)[0].id == 'divBkArchive') {
            $('#example_wrapper').css("display", "");
            $('#tblReport_wrapper').css("display", "none");
            $('.btnArchive').css("display", "");
            $('.btnRestore').css("display", "none");
            //$('.btnReport').css("display", "none");
            CallBook('Archive', zNumberList, zCatalogList, zISBNList, zPublList);
        }
        else if ($(this)[0].id == 'divBkRestore') {
            $('#example_wrapper').css("display", "");
            $('#tblReport_wrapper').css("display", "none");
            $('.btnArchive').css("display", "none");
            $('.btnRestore').css("display", "");
            //$('.btnReport').css("display", "none");
            CallBook('Restore', zNumberList, zCatalogList, zISBNList, zPublList);

        }
        else {
            $('#example_wrapper').css("display", "none");
            $('#tblReport_wrapper').css("display", "");
            $('.btnArchive').css("display", "none");
            $('.btnRestore').css("display", "none");
            //$('.btnReport').css("display", "");
            CallReport(zNumberList, zCatalogList, zISBNList, zPublList, zTypeList, zFromDt, zToDt, $('#ddlWIPSearch').val());
        }
    });
    $('#btnBkGet').click(function () {

        var zNumberList = "";
        var zCatalogList = "";
        var zISBNList = "";
        var zPublList = "";
        var zTypeList = "";
        var zFromDt = "";
        var zToDt = "";

        zTypeList = $('#ddlType').val().toString();
        zFromDt = FormatDate_IE($("#txtFromDt").val()); //2013-09-5
        zToDt = FormatDate_IE($("#txtToDt").val());

        if ($('#lstNumberList').val() != null)
            zNumberList = $('#lstNumberList').val().toString();
        if ($('#lstCatalogList').val() != null)
            zCatalogList = $('#lstCatalogList').val().toString();
        if ($('#lstISBNList').val() != null)
            zISBNList = $('#lstISBNList').val().toString();
        if ($('#lstPublisherList').val() != null)
            zPublList = $('#lstPublisherList').val().toString();


        if ($("#BkTabul li.active a").text() == 'Archive') {

            CallBook('Archive', zNumberList, zCatalogList, zISBNList, zPublList);
        }
        else if ($("#BkTabul li.active a").text() == 'Restore') {

            CallBook('Restore', zNumberList, zCatalogList, zISBNList, zPublList);

        }
        else {

            CallReport(zNumberList, zCatalogList, zISBNList, zPublList, zTypeList, zFromDt, zToDt, $('#ddlWIPSearch').val());
        }

    });
    $('#btnArchive').click(function () {
        UpdateArchiveRestoreInfo('Archive');
    });
    $('#btnReprint').click(function () {
        UpdateArchiveRestoreInfo('Reprint');
    });
    $('#btnRework').click(function () {
        UpdateArchiveRestoreInfo('Rework');
    });
    //$('#btnReport').click(function () {
    //    CallReport('Report', zNumberList, zCatalogList, zISBNList, zPublList, zTypeList, zFromDt, zToDt);
    //});
    $('#example_wrapper').css("display", "");
    $('#tblReport_wrapper').css("display", "none");
    CallBook('Archive', '', '', '', '');
});

function UpdateArchiveRestoreInfo(zType) {
    var getArchiveRestoreGridList = [];

    getArchiveRestoreGridList = GetTableRowToList('example');
    if (getArchiveRestoreGridList.length == 0) {
        $.bootstrapGrowl('No record ! &#128528;', {
            type: 'danger', delay: 5000,
        });
        return false;
    }
    var aint = 0;
    for (var i = 0; i < getArchiveRestoreGridList.length; i++) {
        if (getArchiveRestoreGridList[i][0] == true) {
            aint = aint + 1;
        }
    }

    if (aint == 0) {
        $.bootstrapGrowl('Select atleast one book !', {
            type: 'danger',
            delay: 5000,
        });
        return false;
    }

    $('#LoadingImage').show();
    var data = {
        ArchiveGridL: getArchiveRestoreGridList,
        Type: zType
    }

    $.ajax({
        type: 'post',
        url: $('#hf_UpdateArchiveRestoreInfo').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            $.bootstrapGrowl(response + ' &#128515;', {
                type: 'info',
                delay: 5000,
            });

            $('#LoadingImage').hide();
        },
        error: function (response) {
            $.bootstrapGrowl(response + ' &#128515;', {
                type: 'danger',
                delay: 5000,
            });
            $('#LoadingImage').hide();
        }
    });
}

function CallReport(zNumberList, zCatalogList, zISBNList, zPublList, zTypeList, zFromDt, zToDt, zSearch) {
   
    $('#LoadingImage').show();

    var zCatList = 'All';
    var zNumList = 'All';
    var zISList = 'All';
    var zPubList = 'All';

    if (zNumberList != '')
        zNumList = zNumberList;
    if (zCatalogList != '')
        zCatList = zCatalogList;
    if (zISBNList != '')
        zISList = zISBNList;
    if (zPublList != '')
        zPubList = zPublList;

    var data = {

        CatalogList: zCatList,
        NumList: zNumList,
        ISBNList: zISList,
        PublList: zPubList,
        Type: zTypeList,
        FromDt: zFromDt,
        ToDt: zToDt,
        Search: zSearch
    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetArchiveRestoreRpt').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechReport(response.aItemList);
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

function FetechReport(ItemsList) {
   
    try {
        var zCatalogList = ''; var zNumberList = ''; var zISBNList = ''; var zPublisherList = '';
        dataSet = [];
        var items = ItemsList;
        var zCtInP = 0;
        var zCtCom = 0;
        var zBookShelfList = '';
        $.each(items, function (index) {
            debugger;
            var zindexL = 0;
            zCtInP += 1;
            zindexL = zCtInP;
            var t = [
                zindexL.toString(),
                $(this)[0]["Publisher"],
                $(this)[0]["Number"],
                $(this)[0]["Title"],
                $(this)[0]["Catalog"],
                $(this)[0]["ISBN"],
                $(this)[0]["PEName"],
                $(this)[0]["PMName"],
                $(this)[0]["ARType"],
               FormatDateColumn($(this)[0]["RequestDt"]),
                isNullCheck($(this)[0]["Status"]),
                FormatDateColumn($(this)[0]["SucceedDt"]),
                isNullCheck($(this)[0]["Path"])

            ];

            dataSet.push(t);

            if (zitem[i].Catalog != null && zitem[i].Catalog != '' && zCatalogList.indexOf(zitem[i].Catalog) == -1)
                zCatalogList += '<option value="' + zitem[i].Catalog + '">' + zitem[i].Catalog + '</option>';
            if (zitem[i].Number != null && zitem[i].Number != '' && zNumberList.indexOf(zitem[i].Number) == -1)
                zNumberList += '<option value="' + zitem[i].Number + '">' + zitem[i].Number + '</option>';
            if (zitem[i].ISBN != null && zitem[i].ISBN != '' && zISBNList.indexOf(zitem[i].ISBN) == -1)
                zISBNList += '<option value="' + zitem[i].ISBN + '">' + zitem[i].ISBN + '</option>';
            if (zitem[i].Publisher != null && zitem[i].Publisher != '' && zPublisherList.indexOf(zitem[i].Publisher) == -1)
                zPublisherList += '<option value="' + zitem[i].Publisher + '">' + zitem[i].Publisher + '</option>';
        });



        if ($("#lstCatalogList").find('option').length == 0) {
            $('#lstCatalogList').html(zCatalogList);
        }
        if ($("#lstNumberList").find('option').length == 0) {
            $('#lstNumberList').html(zNumberList);
        }
        if ($("#lstISBNList").find('option').length == 0) {
            $('#lstISBNList').html(zISBNList);
        }
        if ($("#lstPublisherList").find('option').length == 0) {
            $('#lstPublisherList').html(zPublisherList);
        }

        LoadReport();
    } catch (e) {
        $('#LoadingImage').hide();
    }
}
function LoadReport() {
    
    var table = $('#tblReport').DataTable({

        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
        "deferRender": true,
        data: dataSet,
        columns: [
            { title: "S.No" },
            { title: "Publisher" },
            { title: "Book ID" },
            { title: "Title" },
            { title: "Catalog" },
            { title: "ISBN" },
            { title: "PE Name" },
            { title: "PM Name" },
            { title: "Archive/Restore" },
            { title: "Request Date" },
            { title: "Status" },
            { title: "Succeed Date" },
            { title: "Path" }

        ],

        "destroy": true,

        fixedHeader: {
            header: true
        },
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'BookList' + today.toShortFormatWithTime(),

                title: 'Archive/Restore - ' + $('#BkTabul li.active').text(),
                exportOptions: {
                    columns: ':visible',
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
                filename: 'BookList' + today.toShortFormatWithTime(),

                title: 'Archive/Restore - ' + $('#BkTabul li.active').text(),
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: ':visible',
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
        "scrollY": (size.height - 180),
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
   

}


function CallBook(zType, zNumberList, zCatalogList, zISBNList, zPublList) {
   
    $('#LoadingImage').show();

    var zCatList = 'All';
    var zNumList = 'All';
    var zISList = 'All';
    var zPubList = 'All';

    if (zNumberList != '')
        zNumList = zNumberList;
    if (zCatalogList != '')
        zCatList = zCatalogList;
    if (zISBNList != '')
        zISList = zISBNList;
    if (zPublList != '')
        zPubList = zPublList;

    var data = {

        Type: zType,
        CatalogList: zCatList,
        NumList: zNumList,
        ISBNList: zISList,
        PublList: zPubList
    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetArchiveRestoreData').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            debugger;
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
   
    debugger;
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
                $(this)[0]["ID"],
                $(this)[0]["Publisher"],
                $(this)[0]["Number"],
                $(this)[0]["Title"],
                $(this)[0]["Catalog"],
                $(this)[0]["ISBN"],
                $(this)[0]["PEName"],
                $(this)[0]["PMName"]

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
        "deferRender": true,
        data: dataSet,
        columns: [
            { title: "S.No" },
            {
                title: "Actions <br/><input type='checkbox' class='chkAll'  id='chkAll'/>", "bSortable": false, "render": function (data, type, full, meta) {
                    return "<input type='checkbox' class='chkBook'  id='chkBook_" + data + "'/>";
                }
            },
            { title: "Publisher" },
            { title: "Book ID" },
            { title: "Title" },
            { title: "Catalog" },
            { title: "ISBN" },
            { title: "PE Name" },
            { title: "PM Name" }

        ],

        "destroy": true,

        fixedHeader: {
            header: true
        },
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'BookList' + today.toShortFormatWithTime(),

                title: 'Book List - ' + $('#BkTabul li.active').text(),
                exportOptions: {
                    columns: [0, 2, 3, 4, 5, 6, 7, 8],
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
                filename: 'BookList' + today.toShortFormatWithTime(),

                title: 'Book List - ' + $('#BkTabul li.active').text(),
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: [0, 2, 3, 4, 5, 6, 7, 8],
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
        "scrollY": (size.height - 280),
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
    $('#chkAll').change(function () {
        if ($(this).is(":checked")) {
            $(".chkBook").prop('checked', true);
        }
        else {
            $(".chkBook").prop('checked', false);
        }
    });

}
$('#chkAll').change(function () {
    if ($(this).is(":checked")) {
        $(".chkBook").prop('checked', true);
    }
    else {
        $(".chkBook").prop('checked', false);
    }
});