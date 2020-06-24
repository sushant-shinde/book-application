$(document).ready(function () {
    $('#ddlSearch').select2();

    $('#ddlTrackSearch').select2();

    $('#lstNumberList').select2({
        closeOnSelect: false,
        placeholder: "Select Number(s)"
    });

    $('#lstCatalogList').select2({
        closeOnSelect: false,
        placeholder: "Select Catalog(s)"
    });

    $('#lstISBNList').select2({
        closeOnSelect: false,
        placeholder: "Select ISBN(s)"
    });

    $('#lstPublisherList').select2({
        closeOnSelect: false,
        placeholder: "Select Publisher(s)"
    });

    $('#lstTaskList').select2({
        closeOnSelect: false,
        placeholder: "Select Task(s)"
    });

    $('#lstFreelancerList').select2({
        closeOnSelect: false,
        placeholder: "Select Freelancer(s)"
    });

    $('#ddlTrackSearch').change(function () {
        $('#divNumberFilter').hide();
        $('#divCatalogFilter').hide();
        $('#divISBNFilter').hide();
        $('#divPublisherFilter').hide();
        $('#divTaskFilter').hide();
        $('#divFreelancerFilter').hide();

        $('#lstNumberList').val(null).trigger("change");
        $('#lstCatalogList').val(null).trigger("change");
        $('#lstISBNList').val(null).trigger("change");
        $('#lstPublisherList').val(null).trigger("change");
        $('#lstTaskList').val(null).trigger("change");
        $('#lstFreelancerList').val(null).trigger("change");

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
        else if (SearchVal == "Freelancer") {
            $('#divFreelancerFilter').show();
        }
    });

    $('#btnBkGet').click(function () {
        var zNumberList = "";
        var zCatalogList = "";
        var zISBNList = "";
        var zPublList = "";
        var zTaskList = "";
        var zFreelancerList = "";
        var zDates = "";

        if ($('#lstNumberList').val() != null)
            zNumberList = $('#lstNumberList').val().toString();
        if ($('#lstCatalogList').val() != null)
            zCatalogList = $('#lstCatalogList').val().toString();
        if ($('#lstISBNList').val() != null)
            zISBNList = $('#lstISBNList').val().toString();
        if ($('#lstPublisherList').val() != null)
            zPublList = $('#lstPublisherList').val().toString();
        if ($('#lstTaskList').val() != null)
            zTaskList = $('#lstTaskList').val().toString();
        if ($('#lstFreelancerList').val() != null)
            zFreelancerList = $('#lstFreelancerList').val().toString();        

        if ($('#startDate').val() != '' && $('#endDate').val() == '') {
            $.bootstrapGrowl('Select end date', {
                type: 'danger',
                delay: 5000,
            });
        } else if ($('#startDate').val() == '' && $('#endDate').val() != '') {
            $.bootstrapGrowl('Select start date', {
                type: 'danger',
                delay: 5000,
            });
        } else if ($('#startDate').val() != '' && $('#endDate').val() != '') {
            zDates = $('#startDate').val() + '-' + $('#endDate').val();
        }

        GetTrackingData($('#ddlSearch').val(), zNumberList, zCatalogList, zISBNList, zPublList, zTaskList, zFreelancerList, zDates);
    });

    $('#startDate').datepicker({
        dateFormat: 'yy/mm/dd',
        onSelect: function (date) {
            var dt2 = $('#endDate');
            var startDate = $(this).datepicker('getDate');
            dt2.datepicker('option', 'minDate', startDate);
        },
        maxDate: new Date()
    });

    $('#endDate').datepicker({
        dateFormat: 'yy/mm/dd',
        maxDate: new Date()
    });

    GetTrackingData($('#ddlSearch').val(), '', '', '', '', '', '', '');
});

function GetTrackingData(search, number, catalog, isbn, publisher, task, freelancer, dates) {
    var aSearch = "All";
    var aCatalog = "All";
    var aNumber = "All";
    var aIsbn = "All";
    var aPublisher = "All";
    var aTask = "All";
    var aFreelancer = "All";
    var aDates = "";

    if (search != '')
        aSearch = search;
    if (number != '')
        aNumber = number;
    if (catalog != '')
        aCatalog = catalog;
    if (isbn != '')
        aIsbn = isbn;
    if (publisher != '')
        aPublisher = publisher;
    if (task != '')
        aTask = task;
    if (freelancer != '')
        aFreelancer = freelancer;
    if (dates != '')
        aDates = dates;

    var data = {
        Search: aSearch,
        CatalogList: aCatalog,
        NumList: aNumber,
        ISBNList: aIsbn,
        PublList: aPublisher,
        TaskList: aTask,
        FreelancerList: aFreelancer,
        Dates: aDates
    };

    $.ajax({
        type: 'POST',
        url: $('#hf_GetFreelancerActivitiesTracking').val(),
        data: data,
        datatype: 'json',
        async: true,
        success: function (response) {
            FetechTrackingData(response.aItemList, response.aList);
        },
        error: function (err) {

        }
    })
}

function FetechTrackingData(ItemsList, NumberList) {
    try {
        dataSet = [];
        dataSetChild = [];
        var items = ItemsList;
        var zCtInP = 0;
        var aPrevBkNo = '';
        $.each(items, function (index) {
            var zindexL = 0;
            zCtInP += 1;
            zindexL = zCtInP;
            var userBooks = NumberList.find(x => x.Key === $(this)[0]["FreelancerName"]).Value;
            var t = [
                zindexL.toString(),
                $(this)[0]["FreelancerName"],
                $(this)[0]["EmailID"],
                $(this)[0]["Publishers"],
                $(this)[0]["TaskList"],
                userBooks,
                $(this)[0]["Country"],

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
                $(this)[0]["AllocationDate"],
                $(this)[0]["CompletedDate"],
                $(this)[0]["DueDate"]
            ];
            if (aPrevBkNo != $(this)[0]["Freelancer"])
                dataSet.push(t);
            aPrevBkNo = $(this)[0]["Freelancer"];
            dataSetChild.push(t);
        });

        LoadDetailsList();
    } catch (e) {
        $('#LoadingImage').hide();
    }
}

function LoadDetailsList() {
    table = $('#tblTrackingBk').DataTable({
        dom: 'lBfrtip',
        data: dataSet,
        "pageLength": -1,
        "lengthMenu": [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
        "deferRender": true,
        columns: [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            { title: "Freelancer" },
            { title: "EmailID" },
            { title: "Publishers" },
            { title: "Task List" },
            { title: "User Book List" },
            { title: "Country" }
        ],
        "destroy": true,
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
        },
        buttons: [
            {
                text: '<img src="../Images/excel.png" title="Export to Excel" id="exportToExcel" />',
            },
            {
                text: '<img src="../Images/pdf.png" title="Export to PDF" id="exportToPdf"/>',
            }
        ],
        fixedHeader: {
            header: true
        }
    });

    // Add event listener for opening and closing details
    DetailsViewEvent();
    exportToExcel();
    exportToPdf();
}

function format(d) {
    var zCtInP = 0;
    var zHtml = '<table class="tblChild" width="100%" cellpadding="1" cellspacing="0" border="0" style="padding-left:50px;"><thead><tr><th>S.No.</th><th>Publisher</th><th>Book ID</th><th>Catalog</th><th>ISBN</th>';

    zHtml += '<th>Chapter No.</th><th>PE Name</th><th>PM Name</th><th>Freelancer</th><th>Task Name</th><th>Status</th><th>Download Invoice</th><th>Start Date</th><th>Due Date</th><th>Completed Date</th></tr></thead><tbody>';

    $.each(dataSetChild, function (e, val) {
        if (d[1] == val[1]) {
            zCtInP += 1;
            zHtml += '<tr>' +
                '<td>' + zCtInP + '</td> <td>' + val[7] + '</td>' +
                '<td>' + val[8] + '</td> <td>' + val[9] + '</td>' +
                '<td>' + val[10] + '</td> <td>' + val[11] + '</td>' +
                '<td>' + val[12] + '</td> <td>' + val[13] + '</td>' +
                '<td>' + val[1] + '</td> <td>' + val[15] + '</td>' +
                '<td>' + val[16] + '</td> <td><center>---</center></td>' +
                '<td>' + FormatDateColumn(val[17]) + '</td> <td>' + FormatDateColumn(val[19]) + '</td>' +
                '<td>' + FormatDateColumn(val[18]) + '</td> </tr>';
        }
    });
    zHtml += '</tbody></table>';
    return zHtml;
}

function DetailsViewEvent() {
    //$('#tblTrackingBk tbody').on('click', 'td.details-control', function (e) {
    $('#tblTrackingBk tbody td.details-control').click(function () {
        var tr = $(this).closest('tr');
        var row = table.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child(format(row.data())).show();
            tr.addClass('shown');
        }
    });
}

function exportToExcel() {
    $('#exportToExcel').click(function () {
        var response = setParameters();

        window.location.href = "/FreelancerActivitiesTracking/ExportToExcel?Search=" + response.Search + "&CatalogList=" + response.CatalogList + "&NumList=" + response.NumList + "&ISBNList=" + response.ISBNList + "&PublList=" + response.PublList + "&TaskList=" + response.TaskList + "&FreelancerList=" + response.FreelancerList + "&Dates=" + response.Dates;
    });
}

function exportToPdf() {
    $('#exportToPdf').click(function () {

        var response = setParameters();

        window.location.href = "/FreelancerActivitiesTracking/ExportToPdf?Search=" + response.Search + "&CatalogList=" + response.CatalogList + "&NumList=" + response.NumList + "&ISBNList=" + response.ISBNList + "&PublList=" + response.PublList + "&TaskList=" + response.TaskList + "&FreelancerList=" + response.FreelancerList + "&Dates=" + response.Dates;       
    });
}

function setParameters() {
    var zSearch = "";
    var zNumberList = "";
    var zCatalogList = "";
    var zISBNList = "";
    var zPublList = "";
    var zTaskList = "";
    var zFreelancerList = "";
    var zDates = "";

    zSearch = $('#ddlSearch').val();

    if ($('#lstNumberList').val() != null)
        zNumberList = $('#lstNumberList').val().toString();
    if ($('#lstCatalogList').val() != null)
        zCatalogList = $('#lstCatalogList').val().toString();
    if ($('#lstISBNList').val() != null)
        zISBNList = $('#lstISBNList').val().toString();
    if ($('#lstPublisherList').val() != null)
        zPublList = $('#lstPublisherList').val().toString();
    if ($('#lstTaskList').val() != null)
        zTaskList = $('#lstTaskList').val().toString();
    if ($('#lstFreelancerList').val() != null)
        zFreelancerList = $('#lstFreelancerList').val().toString();

    if ($('#startDate').val() != '' && $('#endDate').val() == '') {
        $.bootstrapGrowl('Select end date', {
            type: 'danger',
            delay: 5000,
        });
    } else if ($('#startDate').val() == '' && $('#endDate').val() != '') {
        $.bootstrapGrowl('Select start date', {
            type: 'danger',
            delay: 5000,
        });
    } else if ($('#startDate').val() != '' && $('#endDate').val() != '') {
        zDates = $('#startDate').val() + '-' + $('#endDate').val();
    }

    var aSearch = "All";
    var aCatalog = "All";
    var aNumber = "All";
    var aIsbn = "All";
    var aPublisher = "All";
    var aTask = "All";
    var aFreelancer = "All";
    var aDates = "";

    if (zSearch != '')
        aSearch = zSearch;
    if (zNumberList != '')
        aNumber = zNumberList;
    if (zCatalogList != '')
        aCatalog = zCatalogList;
    if (zISBNList != '')
        aIsbn = zISBNList;
    if (zPublList != '')
        aPublisher = zPublList;
    if (zTaskList != '')
        aTask = zTaskList;
    if (zFreelancerList != '')
        aFreelancer = zFreelancerList;
    if (zDates != '')
        aDates = zDates;

    var data = {
        Search: aSearch,
        CatalogList: aCatalog,
        NumList: aNumber,
        ISBNList: aIsbn,
        PublList: aPublisher,
        TaskList: aTask,
        FreelancerList: aFreelancer,
        Dates: aDates
    };

    return data;
}