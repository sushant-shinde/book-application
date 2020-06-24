var dataSet = [];
var aActivityCols = [];
$(function () {
    CallDataList();
    $('#BkInfoTabul li').click(function () {
        setTimeout(function () {
            $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
        }, 200);
    });
});

function CallDataList() {
    $('#LoadingImage').show();
    var data;
    $.ajax({
        type: 'post',
        url: $('#hf_GetManagerTracking').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechData(response.aItemList, response.aActivityList);
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
function FetechData(ItemsList, ActivityList) {
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
                '<span class="spPop" onclick="XMLView(' + isNullCheck($(this)[0]["ID"]) + ')">' + $(this)[0]["Number"] + '</span>',
                $(this)[0]["Catalog"],
                $(this)[0]["PEName"],
                //$(this)[0]["PMName"],
                $(this)[0]["TSPM"]
                //$(this)[0]["UploadType"],
                //$(this)[0]["Platform"]

            ];
            var aBookID = $(this)[0]["ID"];
            var aCheckAct = '';
            $.each(ActivityList, function (e, val) {
                if (aCheckAct != val.Activity && val.Activity != null) {
                    aCheckAct = val.Activity;
                    if (zCtInP == 1)
                        aActivityCols.push(aCheckAct);
                }
            });

            $.each(aActivityCols, function (e, val) {
                var aBookDetails = null;
                for (i = 0; i < ActivityList.length; i++) {
                    if (ActivityList[i].BookID == aBookID && ActivityList[i].Activity.toLowerCase() == val.toLowerCase()) {
                        aBookDetails = ActivityList[i];
                        break;
                    }
                }
                if (aBookDetails != null) {
                    var aComDate = (aBookDetails.CompletedDate != null ? "'CompletedDate : " + FormatDateColumn(aBookDetails.CompletedDate) + "'" : "");
                    t.push("<center class='sp" + aBookDetails.CSSType + "' title=" + aComDate + "><span style='display:none'>" + aBookDetails.CSSType + '</span>' + FormatDateColumn(aBookDetails.ScheduleDate) + "</center>");
                }
                else
                    t.push(null);
            });
            t.push($(this)[0]["ID"]);

            dataSet.push(t);
        });
        LoadData();
        $('.imgLoader').hide();
    } catch (e) {

    }
}
function LoadData() {
    var columnsList = [
        { title: "S.No.", "bSortable": false },
        { title: "Number", "bSortable": false },
        { title: "Catalog", "bSortable": false },
        { title: "PE Name", "bSortable": false },
        //{ title: "PM Name", "bSortable": false  },
        { title: "Tech PM Name", "bSortable": false }
        //{ title: "Upload Type", "bSortable": false },
        //{ title: "Platform", "bSortable": false },
    ];
    var datecolumnsList = [];

    $.each(aActivityCols, function (e, val) {
        columnsList.push({ title: "<center>" + val.capitalize() + "</center>", "bSortable": false });
        datecolumnsList.push(columnsList.length - 1);

    })
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
        "scrollY": (size.height - 160),
        "scrollX": true,
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'ManagerTracking' + today.toShortFormatWithTime(),

                title: 'Manager Tracking',
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
                },
                customize: function (xlsx) {
                    var sheet = xlsx.xl.worksheets['sheet1.xml'];
                    $('row:first c', sheet).attr('s', '40');
                    var arowitem = $('row', sheet);
                    $.each(arowitem, function (e, val) {
                        var acellitem = $(this).find('c');
                        $.each(acellitem, function (e1, val1) {
                            if ($(this)[0].textContent.indexOf('Blue') > -1) {
                                $(this).attr('s', '47');
                                $(this)[0].outerHTML = $(this)[0].outerHTML.replace('Blue', '');
                            }
                            else if ($(this)[0].textContent.indexOf('Green') > -1) {
                                $(this).attr('s', '17');
                                $(this)[0].outerHTML = $(this)[0].outerHTML.replace('Green', '');
                            }
                            else if ($(this)[0].textContent.indexOf('Red') > -1) {
                                $(this).attr('s', '35');
                                $(this)[0].outerHTML = $(this)[0].outerHTML.replace('Red', '');
                            }
                        });
                    });
                }
            },
            {
                extend: 'pdfHtml5',
                text: '<img src="../Images/pdf.png" title="Export to PDF" />',
                filename: 'ManagerTracking' + today.toShortFormatWithTime(),

                title: 'Manager Tracking',
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
                },
                customize: function (doc) {
                    var apdfRow = $(doc.content[1])[0].table.body;
                    $.each(apdfRow, function (e, val) {
                        $.each(val, function (e1, val1) {
                            val1.text = val1.text.replace('Blue', '');
                            val1.text = val1.text.replace('Green', '');
                            val1.text = val1.text.replace('Red', '');
                        });
                    });
                }
            }

        ],
    });
    $('.spGreen').parent().addClass('spGreen');
    $('.spRed').parent().addClass('spRed');
    $('.spBlue').parent().addClass('spBlue');
}

function XMLView(item) {

    aBookID = item;
    $('#divLoadData').html('Please Wait......');
    $('#divLoadDataTrns').html('');

    var data = { zBookID: item }

    $.ajax({
        type: 'post',
        url: $('#hf_GetBookData').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var items = response.aItemList;

            var ztable = '<table class="tblMain">';
            ztable += '<tr><td>Book ID</td>' + '<td>' + items[0].Number + '</td></tr>';
            ztable += '<tr><td>Publisher</td>' + '<td>' + items[0].Publisher + '</td></tr>';
            ztable += '<tr><td>Catalog</td>' + '<td>' + items[0].Catalog + '</td></tr>';
            ztable += '<tr><td>Title</td>' + '<td>' + items[0].Title + '</td></tr>';
            ztable += '<tr><td>Sub Title</td>' + '<td>' + isNullCheck(items[0].SubTitle) + '</td></tr>';
            ztable += '<tr><td>Edition</td>' + '<td>' + isNullCheck(items[0].Edition) + '</td></tr>';
            ztable += '<tr><td>Type</td>' + '<td>' + items[0].UploadType + '</td></tr>';
            ztable += '<tr><td>Category</td>' + '<td>' + items[0].Category + '</td></tr>';
            ztable += '<tr><td>ISBN</td>' + '<td>' + items[0].ISBN + '</td></tr>';
            ztable += "<tr><td>Proposed Pub date</td><td>" + FormatDateColumn(items[0].DueDt) + "</td></tr>";
            ztable += "<tr><td>Author(s) Name</td><td>" + isNullCheck(items[0].AuthorName) + "</td></tr>";
            ztable += "<tr><td>Author(s) Email</td><td><a href='mailto:" + isNullCheck(items[0].AuthorEmail) + "'>" + isNullCheck(items[0].AuthorEmail) + "</a></td></tr>";
            ztable += "<tr><td>Editor(s) Name</td><td>" + isNullCheck(items[0].EditorName) + "</td></tr>";
            ztable += "<tr><td>Editor(s) Email</td><td><a href='mailto:" + isNullCheck(items[0].EditorEmail) + "'>" + isNullCheck(items[0].EditorEmail) + "</a></td></tr>";
            ztable += "<tr><td>PE Name</td><td>" + isNullCheck(items[0].PEName) + "</td></tr>";
            ztable += "<tr><td>PE Email</td><td><a href='mailto:" + isNullCheck(items[0].PEEmail) + "'>" + isNullCheck(items[0].PEEmail) + "</a></td></tr>";
            ztable += "<tr><td>PM Name</td><td>" + isNullCheck(items[0].PMName) + "</td></tr>";
            ztable += "<tr><td>PM Email</td><td><a href='mailto:" + isNullCheck(items[0].PMEmail) + "'>" + isNullCheck(items[0].PMEmail) + "</a></td></tr>";

            ztable += '</table>';
            $('#divLoadData').html(ztable);
            FetechChapterData(response.aChapterList);
            $('[data-toggle="tooltikp"]').tooltip();
            ztable = "<table id='tblTaskList' class='tblTrans'><tr><th>Activity</th><th>Days</th><th>Scheduled</th><th>Revised Scheduled</th><th>Completed</th></tr>";
            items = response.aPlanningList;
            for (var i = 0; i < items.length; i++) {
                var SchDt = FormatDateColumn(items[i].ScheduleDate);
                var ReSchDt = FormatDateColumn(items[i].RevisedDate);
                var zComDt = FormatDateColumn(items[i].CompletedDate);

                ztable += "<tr>";
                ztable += "<td>" + items[i].Activity + "</td>";
                ztable += "<td>" + items[i].Days + "</td>";
                ztable += "<td title='" + GetDayName(SchDt) + "'>" + SchDt + " </td>";
                ztable += "<td title='" + GetDayName(ReSchDt) + "'>" + ReSchDt + " </td>";
                ztable += "<td title='" + GetDayName(zComDt) + "'>" + zComDt + " </td>";
                ztable += "</tr>";
            }
            ztable += "</table>"

            $('#divLoadDataTrns').html(ztable);

            var zcheckCur = 0;
            $.each($('#tblTaskList tr'), function () {

                try {
                    if ($(this).find('td')[4].innerText == '' && zcheckCur == 0) {
                        $(this).addClass('trCurStatus');
                        zcheckCur = 1;
                    }

                } catch (e) { }

            });


        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 2000,
            });
        }
    });
    ActvieTab(1);
    $("#myModal").modal({ backdrop: 'static', keyboard: false });
}
function FetechChapterData(ItemsList) {
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
            $(this)[0]["Number"],
            $(this)[0]["Title"],
            $(this)[0]["MSPages"],
            $(this)[0]["ColorFig"],
            $(this)[0]["Tables"],
            $(this)[0]["AuthorName"],
            $(this)[0]["AuthorEmail"]

        ];

        dataSet.push(t);
    });

    LoadChapterData();
}


function LoadChapterData() {
    var table = $('#tblChapter').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
        data: dataSet,
        columns: [
            { title: "S.No" },
            { title: "Number" },

            { title: "Title" },
            { title: "MS Pages" },
            { title: "Figures" },
            { title: "Tables" },
            { title: "Author Name " },
            { title: "Author Email" }

        ],

        "destroy": true,

        fixedHeader: {
            header: true
        },
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'Chapter' + today.toShortFormatWithTime(),

                title: 'Chapter List',
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
                filename: 'Chapter' + today.toShortFormatWithTime(),

                title: 'Chapter List',
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
        "scrollY": (size.height - 320),
        "scrollX": true,

    });

    var table1 = $('#tblChapter').DataTable();
    table1.draw();
}
function ActvieTab(aitem) {
    if (aitem == '1') {
        $('#BkInfoTabul li').removeClass('active');
        $('#BkInfoTabul li:first').addClass('active in');
        $('.tab-content div.tab-pane').removeClass('active');
        $('#BkInfo').addClass('active in');
    }
    if (aitem == '2') {
        $('#BkInfoTabul li').removeClass('active');
        $('#BkInfoTabul li:nth-child(2)').addClass('active in');
        $('.tab-content div.tab-pane').removeClass('active');
        $('#ChapInfo').addClass('active in');
    }
}