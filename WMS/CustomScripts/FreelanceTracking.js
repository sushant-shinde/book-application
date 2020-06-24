$(function () {
    $('.divBookContent').css('height', size.height - 120);
    $('#ddlTrackSearch').select2();
    $('#ddlSearch').select2();
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

    $('#ddlTrackSearch').change(function () {
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
        debugger;
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

        CallFreelanceTrackingBk($('#ddlSearch').val(), zNumberList, zCatalogList, zISBNList, zPublList, zTaskList);

    });

    CallFreelanceTrackingBk($('#ddlSearch').val(), '', '', '', '', '');
});

function CallFreelanceTrackingBk(zSearch, zNumberList, zCatalogList, zISBNList, zPublList, zTaskList) {
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
    debugger
    var data = {
        Search: zSearch,
        CatalogList: zCatList,
        NumList: zNumList,
        ISBNList: zISList,
        PublList: zPubList,
        TaskList: zTkList
    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetFreelanceTrackingBk').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechTrackingData(response.aItemList);


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

function FetechTrackingData(ItemsList) {
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
                $(this)[0]["Publisher"],
                $(this)[0]["Number"],
                $(this)[0]["Catalog"],
                $(this)[0]["ISBN"],
                $(this)[0]["Chapter"],
                $(this)[0]["PEName"],
                $(this)[0]["PMName"],
                $(this)[0]["Freelancer"],
                $(this)[0]["TaskName"],
                $(this)[0]["Status"],
                ($(this)[0]["IsInvoiced"] == 1 ?
                    "<center class='DownloadInvoice' title='Download Invoice' onclick=DownloadInvoice('"
                    + $(this)[0]["FSID"] + "','"
                    + $(this)[0]["TotalPages"] + "','"
                    + $(this)[0]["TotalWords"] + "','"
                    + $(this)[0]["TotalTables"] + "','"
                    + $(this)[0]["TotalFigures"] + "')><i class='fa fa-file-invoice'></i></center>" :
                    "<center>---</center>"),

            ];

            dataSet.push(t);

        });

        LoadSelectionData();
    } catch (e) {
        $('#LoadingImage').hide();
    }
}
function LoadSelectionData() {
    var table = $('#tblTrackingBk').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
        "deferRender": true,
        data: dataSet,
        columns: [
            { title: "S.No." },
            { title: "Publisher" },
            { title: "Book ID" },
            { title: "Catalog" },
            { title: "ISBN" },
            { title: "Chapter No." },
            { title: "PE Name" },
            { title: "PM Name" },
            { title: "Freelancer" },
            { title: "Task Name" },
            { title: "Status" },
            { title: "Download Invoice" }
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

function DownloadInvoice(aID, Pages, Words, Tables, Figures) {
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