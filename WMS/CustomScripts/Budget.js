var dataSet = [];
var aServiceListG;
var aPublServiceListG;
var aOnshoreUnitType = "";
var aOffshoreUnitType = "";
var aComplexity = "";
var aInvoiceBookID = "";
var aInvoiceType = "";
var aPrimaryInvoice = "";
var aFinalInvoice = "";
var aCatalog = "";
var aTitle = "";
var aAuthorName = "";
var aEditorName = "";
var aUploadType = "";
var aPEName = "";

$(function () {
    aOnshoreUnitType = "";
    aOffshoreUnitType = "";
    $('.modal-body').css('height', size.height - 150);
    $('.divPriceGrid').css('height', size.height - 200);
    //$('#ddlPublisherList').select2({ placeholder: "Select", allowClear: true });
    $('#ddlPublisherList').select2({ placeholder: "Select Publisher" });
    //$('#ddlPublisherList').val(-1).change();
    $('#ddlPublisherList').val(2).change;
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
    $('#ddlWIPSearch').select2();
    $('.txtservice').select2({ placeholder: "Select", allowClear: true });
    $('.txtUnitType').select2({ placeholder: "Select", allowClear: true });
    $('.txtComplexity').select2({ placeholder: "Select", allowClear: true });
    clearForm('#FormPriceGrid');
    $('#btnGetPG').click(function () {
        PopulatePriceGrid($('#ddlPublisherList').val());
    });
    $("#spAddActivity").click(function () {
        AddServiceRow();
    });
    $("#spInvoiceAdd").click(function () {

        AddInvoiceRow();
    });
    $("#btnPRUpdate").click(function () {
        UpdatePriceGrid();
    });
    $("#btnInvoiceUpdate").click(function () {
        UpdateInvoiceGrid();
    });
    $("#btnInvoiceApprove").click(function () {
        ApproveInvoiceGrid();
    });
    $("#btnInvoiceReport").click(function () {
        InvoiceReport();
    });
    $("#btnPRCancel").click(function () {
        if ($('#ddlPublisherList').val() != "" && $('#ddlPublisherList').val() != null) {
            PopulatePriceGrid($('#ddlPublisherList').val());
        }
        else {
            $('.divPriceGrid').html('');
        }
    });

    $('#ddlWIPSearch').change(function () {
        $('#divNumberFilter').hide();
        $('#divCatalogFilter').hide();
        $('#divISBNFilter').hide();
        $('#divPublisherFilter').hide();
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

    })

    $('#BkTabul li').click(function () {
        closeToggle();
        var zNumberList = "";
        var zCatalogList = "";
        var zISBNList = "";
        var zPublList = "";
        if ($('#lstNumberList').val() != null)
            zNumberList = $('#lstNumberList').val().toString();
        if ($('#lstCatalogList').val() != null)
            zCatalogList = $('#lstCatalogList').val().toString();
        if ($('#lstISBNList').val() != null)
            zISBNList = $('#lstISBNList').val().toString();
        if ($('#lstPublisherList').val() != null)
            zPublList = $('#lstPublisherList').val().toString();
        if ($(this)[0].id == 'divBkUnBilled') {

            CallBook('UnBilled', zNumberList, zCatalogList, zISBNList, zPublList);
        }
        else {

            CallBook('Billed', zNumberList, zCatalogList, zISBNList, zPublList);

        }
    });

    $('#BkInvoice li').click(function () {
        closeToggle();
        $('#divPrimaryTrns').css("display", "none");
        $('#divFinalTrns').css("display", "none");
        if ($(this)[0].id == 'divBkPrimary') {
            $('#divPrimaryTrns').css("display", "");
            $('#divFinalTrns').css("display", "none");
            if (aPrimaryInvoice == '0') {
                $('#BkInvoice li #divBkFinal').css("display", "none");
                $('#btnInvoiceUpdate').css("display", "");
                $('#btnInvoiceApprove').css("display", "");
                $('#btnInvoiceReport').css("display", "");
            }
            else {
                $('#BkInvoice li #divBkFinal').css("display", "");
                $('#btnInvoiceUpdate').css("display", "none");
                $('#btnInvoiceApprove').css("display", "none");
                $('#btnInvoiceReport').css("display", "");
            }
        }
        else {
            $('#divPrimaryTrns').css("display", "none");
            $('#divFinalTrns').css("display", "");
            if (aFinalInvoice == '0') {
                $('#btnInvoiceUpdate').css("display", "");
                $('#btnInvoiceApprove').css("display", "");
                $('#btnInvoiceReport').css("display", "");
            }
            else {
                $('#btnInvoiceUpdate').css("display", "none");
                $('#btnInvoiceApprove').css("display", "none");
                $('#btnInvoiceReport').css("display", "");
            }
        }

    });

    $('#btnBkGet').click(function () {

        var zNumberList = "";
        var zCatalogList = "";
        var zISBNList = "";
        var zPublList = "";

        if ($('#lstNumberList').val() != null)
            zNumberList = $('#lstNumberList').val().toString();
        if ($('#lstCatalogList').val() != null)
            zCatalogList = $('#lstCatalogList').val().toString();
        if ($('#lstISBNList').val() != null)
            zISBNList = $('#lstISBNList').val().toString();
        if ($('#lstPublisherList').val() != null)
            zPublList = $('#lstPublisherList').val().toString();

        if ($("#BkTabul li.active a").text() == 'Unbilled') {

            CallBook('UnBilled', zNumberList, zCatalogList, zISBNList, zPublList);
        }
        else {
            CallBook('Billed', zNumberList, zCatalogList, zISBNList, zPublList);
        }
    });
    CallBook('UnBilled', '', '', '', '');
    $.ajax({
        type: 'get',
        url: $('#hf_GetUnitType').val(),
        datatype: 'json',
        success: function (response) {

            var items = response.aUnitTypeList;
            aOnshoreUnitType = '<select class="txtOnshoreUnitType" style="width:70px;" >';
            aOffshoreUnitType = '<select class="txtOffshoreUnitType" style="width:70px;" >';
            $.each(items, function (e, val) {
                aOnshoreUnitType += '<option style="width:70px;" value="' + val.UnitType + '" data-id="' + val.ID + '">' + val.UnitType + '</option>';
                aOffshoreUnitType += '<option style="width:70px;" value="' + val.UnitType + '" data-id="' + val.ID + '">' + val.UnitType + '</option>';
            })
            aOnshoreUnitType += '</select>';
            aOffshoreUnitType += '</select>';

        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 5000,
            });

        }
    });
    $.ajax({
        type: 'get',
        url: $('#hf_GetComplexity').val(),
        datatype: 'json',
        success: function (response) {

            var items = response.aComplexityList;
            aComplexity = '<select class="txtComplexity" style="width:70px;" onchange="CheckServices(this)">';
            $.each(items, function (e, val) {
                aComplexity += '<option style="width:70px;" value="' + val.Complexity + '" data-id="' + val.ID + '">' + val.Complexity + '</option>';
            })
            aComplexity += '</select>';

        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 5000,
            });

        }
    });

    $('#ddlPublisherList').change(function () {
        PopulatePriceGrid($('#ddlPublisherList').val());
    });

    $('#ddlPublisherList').val(2).change();
});


function InvoiceReport() {

    $('#LoadingImage').show();
    if ($("#BkInvoice li.active a").text() == 'Primary') {
        getInvoiceGridList = GetTableRowToList('tblPrimaryInvoiceList');
        if (getInvoiceGridList.length == 0) {
            $.bootstrapGrowl('Add Service details ! &#128528;', {
                type: 'danger', delay: 5000,
            });
            return false;
        }
    }
    else if ($("#BkInvoice li.active a").text() == 'Final') {
        getInvoiceGridList = GetTableRowToList('tblFinalInvoiceList');
        if (getInvoiceGridList.length == 0) {
            $.bootstrapGrowl('Add Service details ! &#128528;', {
                type: 'danger', delay: 5000,
            });
            return false;
        }
    }
    var data = {

        Type: $("#BkInvoice li.active a").text(),
        Catalog: aCatalog,
        Title: aTitle,
        UploadType: aUploadType,
        AuthorName: aAuthorName,
        EditorName: aEditorName,
        PEName: aPEName,
        InvoiceGridL: getInvoiceGridList,
        WordCount: $('#txtWordCnt').val(),
        ProofPages: $('#txtTypesetPage').val(),
        Relabel: $('#txtRelable').val(),
        Conversion: $('#txtConversion').val(),
        SimpleRedraw: $('#txtSRedraw').val(),
        MediumRedraw: $('#txtMRedraw').val(),
        ComplexRedraw: $('#txtCRedraw').val()
    };
    $.ajax({
        type: 'post',
        url: $('#hf_ExcelFiles').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (data) {

            window.location.href = "../InvoiceExcel/" + data;
            //$.bootstrapGrowl("Successfully submited !", {
            //    type: 'info',
            //    delay: 2000,
            //});

            $("#LoadingImage").hide();
        }, error: function (err) {

            $("#LoadingImage").hide();
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
        url: $('#hf_GetBillReport').val(),
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
                $(this)[0]["UploadType"],
                $(this)[0]["Category"],
                FormatDateColumn($(this)[0]["ReceivedDt"]),
                FormatDateColumn($(this)[0]["DueDt"]),
                $(this)[0]["PEName"],
                $(this)[0]["PMName"],
                ($(this)[0]["PrimaryInvoice"] == '0' ?
                    '<span>No</span>' :
                    '<span>Yes</span>'),
                ($(this)[0]["FinalInvoice"] == '0' ?
                    '<span>No</span>' :
                    '<span>Yes</span>'),
                ($(this)[0]["PriceGrid"] == '' ?
                    '' :
                    $(this)[0]["ID"]
                )


            ];

            dataSet.push(t);

        });


        LoadData();
    } catch (e) {
        $('#LoadingImage').hide();
    }
}
function LoadData() {
    var Page = 'Master';
    var table = $('#example').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
        "deferRender": true,
        data: dataSet,
        columns: [
            { title: "S.No" },
            { title: "Number" },
            { title: "Catalog" },
            { title: "ISBN" },
            { title: "Type" },
            { title: "Category" },
            { title: "Received Date " },
            { title: "Proposed Pub Date" },
            { title: "PE" },
            { title: "PM" },
            { title: "Primary Invoice" },
            { title: "Final Invoice" },
            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    if ($("#BkTabul li.active a").text() == 'Unbilled') {
                        if (data == '') {
                            return "<span class=spUpdateIcon style='display:none' readonly><i class='fa fa-pause' aria-hidden='true' title='Add Price Grid' data-col='Name' onclick=GetInvoiceData('PriceGrid','UnBilled');></i></span>";
                        }
                        else {
                            return "<span class=spUpdateIcon style='display:none'><i class='fa fa-pen' aria-hidden='true' title='Edit' data-col='Name' onclick=GetInvoiceData(" + isNullCheck(data) + ",'UnBilled');></i></span>";
                        }
                    }
                    else {
                        return "<span class=spInfoIcon><i class='fa fa-info-circle' aria-hidden='true' title='Info' data-col='Name' onclick=GetInvoiceData('" + isNullCheck(data) + "','Billed');></i></span>";
                    }

                    //'<span><i class="fa fa-print" aria-hidden="true" title="Report" data-col="Name" onclick="GoToChapterDetails(' + isNullCheck(data) + ');"></i></span>';

                }
            }


        ],
        columnDefs: [
            { type: 'date-dd-mmm-yyyy', targets: [6, 7] }
        ],
        //"createdRow": function (row, data, dataIndex) {
        //    debugger;
        //    if (data[12] == '')
        //    {
        //        $($(row).find('td')[11]).attr('readonly', 'readonly');
        //        $($(row).find('td')[11]).attr('title', 'Add Price Grid');

        //    }

        //},
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
                filename: 'BookList' + today.toShortFormatWithTime(),

                title: 'Book List - ' + $('#BkTabul li.active').text(),
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
        "scrollY": (size.height - 220),
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


function GetInvoiceData(zBookID, zType) {
    if (zBookID == 'PriceGrid') {
        $.bootstrapGrowl("Publisher don't have Price Grid details!", {
            type: 'warning',
            delay: 2000,
        });
        return false;
    }
    if (zBookID == "" && zType == "Billed") {
        $.bootstrapGrowl("This is not Sesame invoiced book!", {
            type: 'danger',
            delay: 2000,
        });
        return false;
    }
    if (zType == 'Billed')
        $('.tblInputBox input').attr('disabled', 'disabled');

    else
        $('.tblInputBox input').removeAttr('disabled');

    $('#divLoadData').html('Please Wait......');
    $('#divLoadDataTrns').html('');
    aInvoiceBookID = zBookID;
    aInvoiceType = zType;
    var data = { zBookID: zBookID }

    $.ajax({
        type: 'post',
        url: $('#hf_GetBookData').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var Bkitems = response.aItemList;
            aCatalog = "";
            aTitle = "";
            aAuthorName = "";
            aEditorName = "";
            aUploadType = "";
            aPEName = "";

            aCatalog = Bkitems[0].Catalog;
            aTitle = Bkitems[0].Title;
            aAuthorName = isNullCheck(Bkitems[0].AuthorName);
            aEditorName = isNullCheck(Bkitems[0].EditorName);
            aUploadType = Bkitems[0].UploadType;
            aPEName = isNullCheck(Bkitems[0].PEName);

            $('#txtWordCnt').val(Bkitems[0].WordCount);
            $('#txtTypesetPage').val(Bkitems[0].ProofPages);
            $('#txtRelable').val(Bkitems[0].Relabel);
            $('#txtConversion').val(Bkitems[0].Conversion);
            $('#txtSRedraw').val(Bkitems[0].SimpleRedraw);
            $('#txtMRedraw').val(Bkitems[0].MediumRedraw);
            $('#txtCRedraw').val(Bkitems[0].ComplexRedraw);

            ztable = "";
            aPrimaryInvoice = Bkitems[0].PrimaryInvoice;
            aFinalInvoice = Bkitems[0].FinalInvoice;


            $("#lblItitle").text("Book Invoice Details - " + aCatalog + ' (' + Bkitems[0].Number + ')');

            $('#btnInvoiceUpdate').css("display", "none");
            $('#btnInvoiceApprove').css("display", "none");
            $('#btnInvoiceReport').css("display", "none");
            $('#divPrimaryTrns').css("display", "none");
            $('#divFinalTrns').css("display", "none");
            $('#BkInvoice li #divBkFinal').css("display", "");
            if (Bkitems[0].PrimaryInvoice == '0') {
                $('#BkInvoice li #divBkFinal').css("display", "none");
            }

            if ($("#BkInvoice li.active a").text() == 'Primary') {
                $('#divPrimaryTrns').css("display", "");
                $('#divFinalTrns').css("display", "none");
                if (Bkitems[0].PrimaryInvoice == '0') {
                    $('#BkInvoice li #divBkFinal').css("display", "none");
                    $('#btnInvoiceUpdate').css("display", "");
                    $('#btnInvoiceApprove').css("display", "");
                    $('#btnInvoiceReport').css("display", "");
                    if (zType == "Billed") {
                        $('#btnInvoiceUpdate').css("display", "none");
                        $('#btnInvoiceApprove').css("display", "none");
                        $('#btnInvoiceReport').css("display", "none");
                    }
                }
                else {
                    $('#BkInvoice li #divBkFinal').css("display", "");
                    $('#btnInvoiceUpdate').css("display", "none");
                    $('#btnInvoiceApprove').css("display", "none");
                    $('#btnInvoiceReport').css("display", "");
                }
            }
            else {
                $('#divPrimaryTrns').css("display", "none");
                $('#divFinalTrns').css("display", "");
                if (Bkitems[0].FinalInvoice == '0') {
                    $('#btnInvoiceUpdate').css("display", "");
                    $('#btnInvoiceApprove').css("display", "");
                    $('#btnInvoiceReport').css("display", "");
                    if (zType == "Billed") {
                        $('#btnInvoiceUpdate').css("display", "none");
                        $('#btnInvoiceApprove').css("display", "none");
                        $('#btnInvoiceReport').css("display", "none");
                    }
                }
                else {
                    $('#btnInvoiceUpdate').css("display", "none");
                    $('#btnInvoiceApprove').css("display", "none");
                    $('#btnInvoiceReport').css("display", "");
                }
            }




            if (Bkitems[0].PrimaryInvoice == '0' && zType != "Billed") {

                ztable = "<span id='spInvoiceAdd' onclick='AddInvoiceRow(" + zBookID + "," + isNullCheck(Bkitems[0].PublisherID) + ");'><i class='fa fa-plus-square' aria-hidden='true'></i></span>";
                ztable += "<table id='tblPrimaryInvoiceList' class='tblTrans'><tr><th>S.No.</th><th>Service</th><th>Complexity</th><th>Type</th><th>Unit Price</th><th>Factor</th><th>Publisher Cost</th><th>Initial Unit Volume</th><th>Initial Cost</th><th>Accounting Code</th><th>#</th></tr>";
            }
            else {
                ztable += "<table id='tblPrimaryInvoiceList' class='tblTrans'><tr><th>S.No.</th><th>Service</th><th>Complexity</th><th>Type</th><th>Unit Price</th><th>Factor</th><th>Publisher Cost</th><th>Initial Unit Volume</th><th>Initial Cost</th><th>Accounting Code</th></tr>";
            }


            items = response.aInvoiceList;
            for (var i = 0; i < items.length; i++) {
                ztable += "<tr><td  width='3%'>" + (i + 1).toString() + "</td>";
                ztable += "<td width='35%'>" + items[i].Service + "</td>";
                ztable += "<td width='5%'>" + items[i].Complexity + "</td>";
                ztable += "<td width='5%'>" + items[i].Type + "</td>";
                ztable += "<td width='5%'>" + items[i].UnitPrice + "</td>";
                ztable += "<td width='5%'>" + items[i].Factor + "</td>";
                ztable += "<td width='5%'>" + items[i].PublisherCost + "</td>";
                ztable += "<td width='5%'>" + items[i].InitialUnitVolume + "</td>";
                ztable += "<td width='5%'>" + items[i].InitialUnitCost + "</td>";
                //ztable += "<td width='5%'>" + items[i].InvoiceUnitVolume + "</td>";
                //ztable += "<td width='5%'>" + items[i].InvoiceUnitCost + "</td>";
                ztable += "<td width='10%'>" + items[i].AccountingCode + "</td>";
                if (Bkitems[0].PrimaryInvoice == '0') {
                    ztable += "<td width='3%' style='text-align: center'><i class='fas fa-trash' onclick='InvoiceDelete(this);'></i></td>"
                }

                ztable += "</tr>";
            }
            ztable += "</table>"

            $('#divPrimaryTrns').html(ztable);
            //}
            //else {
            ztable = "";
            if (Bkitems[0].FinalInvoice == '0' && zType != "Billed") {

                ztable = "<span id='spInvoiceAdd' onclick='AddInvoiceRow(" + zBookID + "," + isNullCheck(Bkitems[0].PublisherID) + ");'><i class='fa fa-plus-square' aria-hidden='true'></i></span>";
            }
            else {

            }

            if (zType == 'Billed') {

                ztable += "<table id='tblFinalInvoiceList' class='tblTrans'><tr><th>S.No.</th><th>Service</th><th>Complexity</th><th>Type</th><th>Unit Price</th><th>Factor</th><th>Publisher Cost</th><th>Initial Unit Volume</th><th>Initial Cost</th><th>Invoice Unit Volume</th><th>Invoice Cost</th><th>Accounting Code</th></tr>";

                items = response.aInvoiceList;
                for (var i = 0; i < items.length; i++) {
                    ztable += "<tr><td  width='3%'>" + (i + 1).toString() + "</td>";
                    ztable += "<td width='35%'>" + items[i].Service + "</td>";
                    ztable += "<td width='5%'>" + items[i].Complexity + "</td>";
                    ztable += "<td width='5%'>" + items[i].Type + "</td>";
                    ztable += "<td width='5%'>" + items[i].UnitPrice + "</td>";
                    ztable += "<td width='5%'>" + items[i].Factor + "</td>";
                    ztable += "<td width='5%'>" + items[i].PublisherCost + "</td>";
                    ztable += "<td width='5%'>" + items[i].InitialUnitVolume + "</td>";
                    ztable += "<td width='5%'>" + items[i].InitialUnitCost + "</td>";
                    ztable += "<td width='5%'>" + isNullCheck(items[i].InvoiceUnitVolume) + "</td>";
                    ztable += "<td width='5%'>" + isNullCheck(items[i].InvoiceUnitCost) + "</td>";
                    ztable += "<td width='10%'>" + isNullCheck(items[i].AccountingCode) + "</td>";

                    ztable += "</tr>";
                }
                ztable += "</table>"


            }
            else {

                ztable += "<table id='tblFinalInvoiceList' class='tblTrans'><tr><th>S.No.</th><th>Service</th><th>Complexity</th><th>Type</th><th>Unit Price</th><th>Factor</th><th>Publisher Cost</th><th>Initial Unit Volume</th><th>Initial Cost</th><th>Invoice Unit Volume</th><th>Invoice Cost</th><th>Accounting Code</th><th>#</th></tr>";

                items = response.aInvoiceList;
                for (var i = 0; i < items.length; i++) {
                    ztable += "<tr><td  width='3%'>" + (i + 1).toString() + "</td>";
                    ztable += "<td width='35%'>" + items[i].Service + "</td>";
                    ztable += "<td width='5%'>" + items[i].Complexity + "</td>";
                    ztable += "<td width='5%'>" + items[i].Type + "</td>";
                    ztable += "<td width='5%'><input type='text' class='TxtPrice UnitPrice' step='any' onchange=GetCost(this) maxlength='15' value='" + items[i].UnitPrice + "' disabled/></td>";
                    ztable += "<td width='5%'><input type='text' class='TxtPrice Factor' step='any' onchange=GetCost(this) maxlength='15' value='" + items[i].Factor + "' disabled/></td>";
                    ztable += "<td width='5%'>" + items[i].PublisherCost + "</td>";
                    ztable += "<td width='5%'>" + items[i].InitialUnitVolume + "</td>";
                    ztable += "<td width='5%'>" + items[i].InitialUnitCost + "</td>";
                    ztable += "<td width='5%'><input type='text' class='TxtFactor InvoiceUnitVolume' onchange=GetCost(this) maxlength='15' step='any' value='" + isNullCheck(items[i].InvoiceUnitVolume) + "' /></td>";
                    ztable += "<td width='5%'><input type='text' class='TxtPrice InvoiceCost' maxlength='15' step='any' value='" + isNullCheck(items[i].InvoiceUnitCost) + "' disabled/></td>";
                    ztable += "<td width='10%'><input type='text' step='any' maxlength='50' value='" + isNullCheck(items[i].AccountingCode) + "' /></td>";
                    ztable += "<td width='3%' style='text-align: center'><i class='fas fa-trash' onclick='InvoiceDelete(this);'></i></td>"
                    ztable += "</tr>";
                }
                ztable += "</table>"
            }

            $('#divFinalTrns').html(ztable);

            $('#tblInvoiceList').css('cursor', 'move');

        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 2000,
            });
        }
    });
    $("#spInvoiceAdd").click(function () {

        AddInvoiceRow();
    });
    $("#myModal").modal({ backdrop: 'static', keyboard: false });
}

function AddInvoiceRow(zBookID, zPublID) {

    if (!InvoiceValidate())
        return false;

    var data = { zPublID: zPublID }
    var zActList = "";
    $.ajax({
        type: 'post',
        url: $('#hf_GetPublisherServiceList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {

            var items = response.aServiceList;

            if (items.length > 0) {

                zActList = '<select class="txtservice" style="width:120px;" onchange="AddComplexityInvoice(this,' + zPublID + ')" >';
                $.each(items, function (e, val) {
                    zActList += '<option style="width:120px;" value="' + val + '">' + val + '</option>';
                })
                zActList += '</select>';
                if ($("#BkInvoice li.active a").text() != 'Primary') {
                    var nRowL = "<tr><td width='3%'>" + ($("#tblFinalInvoiceList").find("tr").length).toString() + "</td>"
                        + "<td width='20%'>" + zActList + "</td>"
                        + "<td width='10%'><select class='txtServiceC' onchange='AddTypeInvoice(this," + zPublID + ")'></select></td>"
                        + "<td width='15%'><select class='txtSType' onchange='AddInvoicePrice(this)'></select></td>"
                        + "<td width='5%'><input type='text' class='TxtPrice UnitPrice' step='any' maxlength='15' onchange=GetCost(this) value='0' disabled/></td>"
                        + "<td width='5%'><input type='text' class='TxtPrice Factor' step='any' maxlength='15' onchange=GetCost(this) value='0' disabled/></td>"
                        + "<td width='5%'><input type='text' class='TxtPrice PublisherCost' maxlength='15' step='any' value='0' /></td>"
                        + "<td width='5%'><input type='text' class='TxtFactor InitialUnitVolume' maxlength='15' onchange=GetCost(this) step='any' value='0' /></td>"
                        + "<td width='5%'><input type='text' class='TxtPrice InitialCost' maxlength='15' step='any' value='0' disabled/></td>"
                        + "<td width='5%'><input type='text' class='TxtFactor InvoiceUnitVolume' maxlength='15' onchange=GetCost(this) step='any' value='0' /></td>"
                        + "<td width='5%'><input type='text' class='TxtPrice InvoiceCost' maxlength='15' step='any' value='0' disabled/></td>"
                        + "<td width='5%'><input type='text' maxlength='50' step='any' /></td>"
                        + "<td width='3%' style='text-align: center'><i class='fas fa-trash' onclick='InvoiceDelete(this);'></i></td>"
                        + "</tr>";
                    $("#tblFinalInvoiceList").append(nRowL);
                }
                else {
                    var nRowL = "<tr><td width='3%'>" + ($("#tblPrimaryInvoiceList").find("tr").length).toString() + "</td>"
                        + "<td width='20%'>" + zActList + "</td>"
                        + "<td width='10%'><select class='txtServiceC' onchange='AddTypeInvoice(this," + zPublID + ")'></select></td>"
                        + "<td width='15%'><select class='txtSType' onchange='AddInvoicePrice(this)'></select></td>"
                        + "<td width='5%'><input type='text' class='TxtPrice UnitPrice' maxlength='15' step='any' onchange=GetCost(this) value='0' disabled/></td>"
                        + "<td width='5%'><input type='text' class='TxtPrice Factor' maxlength='15' step='any' onchange=GetCost(this) value='0' disabled/></td>"
                        + "<td width='5%'><input type='text' class='TxtPrice PublisherCost' maxlength='15' step='any' value='0' /></td>"
                        + "<td width='5%'><input type='text' class='TxtFactor InitialUnitVolume' maxlength='15' onchange=GetCost(this) step='any' value='0' /></td>"
                        + "<td width='5%'><input type='text' class='TxtPrice InitialCost' maxlength='15' step='any' value='0' disabled/></td>"
                        + "<td width='5%'><input type='text' step='any' maxLength='50' /></td>"
                        + "<td width='3%' style='text-align: center'><i class='fas fa-trash' onclick='InvoiceDelete(this);'></i></td>"
                        + "</tr>";
                    $("#tblPrimaryInvoiceList").append(nRowL);
                }

                var alastbefore = $("#tblPrimaryInvoiceList").find("tr:nth-last-child(2)");
                if ($(alastbefore).find('select').val() != "")
                    $($(alastbefore).find('select')[0]).attr('disabled', 'disabled');
                $($(alastbefore).find('input')).attr('disabled', 'disabled');

                var alasttr = $("#tblPrimaryInvoiceList").find("tr:nth-last-child(1)");
                $(alasttr).find('select').select2({ placeholder: "Select", allowClear: true, tags: true });
                $(alasttr).find('select').val(-1).change();

                var alastbefore = $("#tblFinalInvoiceList").find("tr:nth-last-child(2)");
                if ($(alastbefore).find('select').val() != "")
                    $($(alastbefore).find('select')[0]).attr('disabled', 'disabled');
                $($(alastbefore).find('input')).attr('disabled', 'disabled');

                var alasttr = $("#tblFinalInvoiceList").find("tr:nth-last-child(1)");
                $(alasttr).find('select').select2({ placeholder: "Select", allowClear: true, tags: true });
                $(alasttr).find('select').val(-1).change();
            }
            else {
                $.bootstrapGrowl("Add Price Grid for this publisher !", {
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

function AddInvoicePrice(aitemL) {
    var txtbox = $(aitemL).closest('tr');
    var aDataIDL = $(aitemL).find(':selected').attr('data-id').split("|");
    var unitprice = aDataIDL[0];
    var factor = aDataIDL[1];
    $(txtbox).find('.UnitPrice').val(unitprice);
    $(txtbox).find('.Factor').val(factor);

    var zUnitType = aDataIDL[2];
    var nUnitVol = 0;
    if (zUnitType == 'Words')
        nUnitVol = $('#txtWordCnt').val()
    else
        nUnitVol = $('#txtTypesetPage').val();
    $(txtbox).find('.InitialUnitVolume').val(nUnitVol);

    
    var unitprice = $(txtbox).find('.UnitPrice').val();
    var factor = $(txtbox).find('.Factor').val();
    var initialvolume = $(txtbox).find('.InitialUnitVolume').val();
    var initialcost = (initialvolume / factor) * unitprice;
    $(txtbox).find('.InitialCost').val(initialcost);
    var invoicevolume = $(txtbox).find('.InvoiceUnitVolume').val();
    var invoicecost = (invoicevolume / factor) * unitprice;
    $(txtbox).find('.InvoiceCost').val(invoicecost);
}

function AddComplexityInvoice(aitemL, zPublID) {

    var txtbox = $(aitemL).closest('tr');
    var zChkVal = true;
    var data = { zPublID: zPublID, zService: $(aitemL).val() }
    $.ajax({
        type: 'post',
        url: $('#hf_GetServiceComplexityList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var items = response.aServiceCList;
            var el = $(aitemL).closest('tr').find('.txtServiceC');
            el.empty();
            $.each(items, function (e, val) {

                el.append($("<option></option>")
                    .attr("value", val).text(val));

            })
            el.val(-1).change();


        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 5000,
            });

        }
    });
}

function AddTypeInvoice(aitemL, zPublID) {

    var txtbox = $(aitemL).closest('tr');
    var zChkVal = true;
    var data = { zPublID: zPublID, zService: $(aitemL).closest('tr').find('.txtservice').val(), zComplexity: $(aitemL).val() }
    $.ajax({
        type: 'post',
        url: $('#hf_GetTypeComplexityList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var items = response.aTypeCList;
            var el = $(aitemL).closest('tr').find('.txtSType');
            el.empty();
            $.each(items, function (e, val) {
                if (val.OnShoreUnitPrize != 0) {
                    el.append($("<option></option>")
                        .attr("value", 'Onshore').attr("data-id", val.OnShoreUnitPrize + "|" + val.OnShoreFactor + '|' + val.OnShoreUnitType).text('Onshore'));
                }
                if (val.OffShoreUnitPrize != 0) {
                    el.append($("<option></option>")
                        .attr("value", 'Offshore').attr("data-id", val.OffShoreUnitPrize + "|" + val.OffShoreFactor + '|' + val.OffShoreUnitType).text('Offshore'));
                }


            })
            el.val(-1).change();
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 5000,
            });

        }
    });
}
function InvoiceValidate() {

    var aResultL = true;
    var aLast = "";
    var aLastService = "";

    if ($("#BkInvoice li.active a").text() != 'Primary') {
        if ($("#tblFinalInvoiceList").find("tr").length < 2)
            return true;
        aLast = $("#tblFinalInvoiceList").find("tr").last();
        aLastService = $(aLast).find('td .txtservice').val();
    }
    else {
        if ($("#tblPrimaryInvoiceList").find("tr").length < 2)
            return true;
        aLast = $("#tblPrimaryInvoiceList").find("tr").last();
        aLastService = $(aLast).find('td .txtservice').val();
    }


    if ($(aLast).find('.txtservice').length > 0 && aLastService == null) {
        $.bootstrapGrowl('Select Service !', {
            type: 'danger',
            delay: 5000,
        });
        aResultL = false;
        return false;
    }
    if (aResultL) {
        var aActivityList = "";
        if ($("#BkInvoice li.active a").text() != 'Primary') {
            aActivityList = $($("#tblFinalInvoiceList").find("tr")).find('.txtservice');
        }
        else {
            aActivityList = $($("#tblPrimaryInvoiceList").find("tr")).find('.txtservice');
        }

        $.each(aActivityList, function () {
            if ($(this).val() == "") {
                $.bootstrapGrowl('Enter Service Name !', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
        });
    }

    var aPublisherCost = $(aLast).find('td .PublisherCost').val();
    if (aResultL) {
        if (aPublisherCost == "" || aPublisherCost == 0) {
            $.bootstrapGrowl('Enter Publisher Cost !', {
                type: 'danger',
                delay: 5000,
            });
            aResultL = false;
            return false;
        }
    }

    var aInitialUnitVolume = $(aLast).find('td .InitialUnitVolume').val();
    if (aResultL) {
        if (aInitialUnitVolume == "" || aInitialUnitVolume == 0) {
            $.bootstrapGrowl('Enter Initial Unit Volume !', {
                type: 'danger',
                delay: 5000,
            });
            aResultL = false;
            return false;
        }
    }

    var aInitialCost = $(aLast).find('td .InitialCost').val();
    if (aResultL) {
        if (aInitialCost == "" || aInitialCost == 0) {
            $.bootstrapGrowl('Enter Initial Cost !', {
                type: 'danger',
                delay: 5000,
            });
            aResultL = false;
            return false;
        }
    }
    if ($("#BkInvoice li.active a").text() != 'Primary') {
        var aInvoiceUnitVolume = $(aLast).find('td .InvoiceUnitVolume').val();
        if (aResultL) {
            if (aInvoiceUnitVolume == "" || aInvoiceUnitVolume == 0) {
                $.bootstrapGrowl('Enter Invoice Unit Volume !', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
        }

        var aInvoiceCost = $(aLast).find('td .InvoiceCost').val();
        if (aResultL) {
            if (aInvoiceCost == "" || aInvoiceCost == 0) {
                $.bootstrapGrowl('Enter Invoice Cost !', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
        }
    }


    return aResultL;
}


function ApproveInvoiceGrid() {
    var IsValid = InvoiceValidate();
    if (!IsValid)
        return false;
    $('#LoadingImage').show();
    var getInvoiceGridList = [];
    if ($("#BkInvoice li.active a").text() != 'Primary') {
        getInvoiceGridList = GetTableRowToList('tblFinalInvoiceList');
        if (getInvoiceGridList.length == 0) {
            $.bootstrapGrowl('Add Service details ! &#128528;', {
                type: 'danger', delay: 5000,
            });
            return false;
        }
    }
    else {
        getInvoiceGridList = GetTableRowToList('tblPrimaryInvoiceList');
        if (getInvoiceGridList.length == 0) {
            $.bootstrapGrowl('Add Service details ! &#128528;', {
                type: 'danger', delay: 5000,
            });
            return false;
        }
    }

    var data = {
        zBookID: aInvoiceBookID,
        InvoiceGridL: getInvoiceGridList,
        zType: $("#BkInvoice li.active a").text(),
        WordCnt: $('#txtWordCnt').val(),
        TypesetPage: $('#txtTypesetPage').val(),
        Relable: $('#txtRelable').val(),
        Conversion: $('#txtConversion').val(),
        SRedraw: $('#txtSRedraw').val(),
        MRedraw: $('#txtMRedraw').val(),
        CRedraw: $('#txtCRedraw').val()
    }
    $.ajax({
        type: 'post',
        url: $('#hf_ApproveInvoiceGrid').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {

            $('#myModal').modal('hide');
            //GetInvoiceData(aInvoiceBookID, aInvoiceType);
            if ($("#BkTabul li.active a").text() == 'Unbilled') {

                CallBook('UnBilled', '', '', '', '');
            }
            else {
                CallBook('Billed', '', '', '', '');
            }
            $('#LoadingImage').hide();
            $.bootstrapGrowl(response + ' &#128515;', {
                type: 'info',
                delay: 5000,
            });
        },
        error: function (response) {
            $.bootstrapGrowl(response + ' &#128515;', {
                type: 'danger',
                delay: 5000,
            });
            $('#myModal').modal('hide');
        }
    });
}


function UpdateInvoiceGrid() {
    var IsValid = InvoiceValidate();
    if (!IsValid)
        return false;
    $('#LoadingImage').show();
    var getInvoiceGridList = [];
    if ($("#BkInvoice li.active a").text() != 'Primary') {
        getInvoiceGridList = GetTableRowToList('tblFinalInvoiceList');
        if (getInvoiceGridList.length == 0) {
            $.bootstrapGrowl('Add Service details ! &#128528;', {
                type: 'danger', delay: 5000,
            });
            return false;
        }
    }
    else {
        getInvoiceGridList = GetTableRowToList('tblPrimaryInvoiceList');
        if (getInvoiceGridList.length == 0) {
            $.bootstrapGrowl('Add Service details ! &#128528;', {
                type: 'danger', delay: 5000,
            });
            return false;
        }
    }

    var data = {
        zBookID: aInvoiceBookID,
        InvoiceGridL: getInvoiceGridList,
        zType: $("#BkInvoice li.active a").text(),
        WordCnt: $('#txtWordCnt').val(),
        TypesetPage: $('#txtTypesetPage').val(),
        Relable: $('#txtRelable').val(),
        Conversion: $('#txtConversion').val(),
        SRedraw: $('#txtSRedraw').val(),
        MRedraw: $('#txtMRedraw').val(),
        CRedraw: $('#txtCRedraw').val()
    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateInvoiceGrid').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            $.bootstrapGrowl(response + ' &#128515;', {
                type: 'info',
                delay: 5000,
            });
            GetInvoiceData(aInvoiceBookID, aInvoiceType);
            $('#LoadingImage').hide();
        },
        error: function (response) {
            $.bootstrapGrowl(response + ' &#128515;', {
                type: 'danger',
                delay: 5000,
            });
            $('#myModal_WorkFlow').modal('hide');
        }
    });
}

function CheckServicesInvoice(aitemL) {

    var txtbox = $(aitemL).closest('tr');
    var zChkVal = true;
    $.each($("#tblInvoiceList tbody tr"), function (e) {

        try {
            var zPreVal = $(this).find('td')[1].innerText;
            if ($(this).find('td').find('select').length > 0 && (e != $("#tblInvoiceList tbody tr").length - 1)) {
                zPreVal = $(this).find('td').find('select').val();
            }
            if (zPreVal == $(aitemL).val()) {
                $.bootstrapGrowl('Already Service Added !', {
                    type: 'danger',
                    delay: 5000,
                });
                zChkVal = false;
                return false;
            }
        } catch (e) {

        }

    });
    if (zChkVal) {
        var unitprice = $(aitemL).find(':selected').attr('data-id').split("|")[0];
        var factor = $(aitemL).find(':selected').attr('data-id').split("|")[1];
        $(txtbox).find('.UnitPrice').val(unitprice);
        $(txtbox).find('.Factor').val(factor);

        var unitprice = $(txtbox).find('.UnitPrice').val();
        var factor = $(txtbox).find('.Factor').val();
        var initialvolume = $(txtbox).find('.InitialUnitVolume').val();
        var initialcost = (initialvolume / factor) * unitprice;
        $(txtbox).find('.InitialCost').val(initialcost);
        var invoicevolume = $(txtbox).find('.InvoiceUnitVolume').val();
        var invoicecost = (invoicevolume / factor) * unitprice;
        $(txtbox).find('.InvoiceCost').val(invoicecost);
    }
    else {
        $(aitemL).val(-1).change();
    }
}

function GetCost(aitemL) {

    var txtbox = $(aitemL).closest('tr');
    var zChkVal = true;
    var unitprice = $(txtbox).find('.UnitPrice').val();
    var factor = $(txtbox).find('.Factor').val();
    var initialvolume = $(txtbox).find('.InitialUnitVolume').val();
    var initialcost = (initialvolume / factor) * unitprice;
    $(txtbox).find('.InitialCost').val(initialcost);
    var invoicevolume = $(txtbox).find('.InvoiceUnitVolume').val();
    var invoicecost = (invoicevolume / factor) * unitprice;
    $(txtbox).find('.InvoiceCost').val(invoicecost);
}

function InvoiceDelete(btndel) {
    bootbox.confirm("Are you sure want to delete?",
        function (result) {
            if (result) {
                $(btndel).closest("tr").remove();
                $("table#tblInvoiceList tbody").each(function () {
                    $(this).children().each(function (index) {
                        $(this).find('td').first().html(index + 1);
                    });
                });
            }

        });
}

function PopulatePriceGrid(aPublID) {
    $('#LoadingImage').show();
    var data = { zPublID: aPublID };
    $.ajax({
        type: 'post',
        url: $('#hf_GetPublPriceGrid').val(),
        data: data,
        datatype: 'json',
        success: function (response) {

            var items = response.aitemList;
            aServiceListG = response.aServiceList;
            var ztable = " <span id='spAddActivity' onclick='AddServiceRow();'><i class='fa fa-plus-square' aria-hidden='true'></i></span>"
            ztable += "<table id='tblPriceList' class='tblTrans'><thead><tr><th rowspan='2'>S.No.</th><th rowspan='2'>Services</th><th rowspan='2'>Complexity</th><th colspan='3' style='background-color:#E7717D;'>Onshore</th><th colspan='3' style='background-color:#AAAAF9;'>Offshore</th><th rowspan='2'>#</th></tr><tr><th style='background-color:#E7717D;'>Unit Prize</th><th style='background-color:#E7717D;'>Factor</th><th style='background-color:#E7717D;'>Unit Type</th><th style='background-color:#AAAAF9;'>Unit Prize</th><th style='background-color:#AAAAF9;'>Factor</th><th style='background-color:#AAAAF9;'>Unit Type</th></tr></thead>";
            var zbackClip = '';
            if (GetBrowserName() != 'chrome') {
                zbackClip = 'background-clip: padding-box;';
            }
            for (var i = 0; i < items.length; i++) {
                ztable += "<tr class='trexisting'>";
                ztable += "<td>" + (i + 1).toString() + "</td>";
                ztable += "<td>" + items[i].Services + "</span></td>";
                ztable += "<td>" + isNullCheck(items[i].Complexity) + "</span></td>";
                ztable += "<td style='background-color:#E7717D;" + zbackClip + "'><input type='text' class='TxtPrice IsNumeric OnshoreTxtPrice' maxlength='15' step='any' value='" + isNullCheck(items[i].OnShoreUnitPrize) + "' /></td>";
                ztable += "<td style='background-color:#E7717D;" + zbackClip + "'><input type='text' class='TxtFactor IsNumeric OnshoreTxtFactor' maxlength='15' step='any' value='" + isNullCheck(items[i].OnShoreFactor) + "' /></td>";
                ztable += "<td style='background-color:#E7717D;color:#FFF;" + zbackClip + "'>" + isNullCheck(items[i].OnShoreUnitType) + "</td>";
                ztable += "<td style='background-color:#1760AA;" + zbackClip + "'><input type='text' class='TxtPrice IsNumeric OffshoreTxtPrice' maxlength='15' step='any' value='" + isNullCheck(items[i].OffShoreUnitPrize) + "' /></td>";
                ztable += "<td style='background-color:#1760AA;" + zbackClip + "'><input type='text' class='TxtFactor IsNumeric OffshoreTxtFactor' maxlength='15' step='any' value='" + isNullCheck(items[i].OffShoreFactor) + "' /></td>";
                ztable += "<td style='background-color:#1760AA;color:#FFF;" + zbackClip + "'>" + isNullCheck(items[i].OffShoreUnitType) + "</td>";
                ztable += "<td style='text-align: center;'><i class='fas fa-trash' onclick='ServiceDelete(this);'></i></td>";
                ztable += "</tr>";

            }

            ztable += '</table>';

            $('.divPriceGrid').html(ztable);

            $('#tblPriceList').css('cursor', 'move');

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

function UpdatePriceGrid() {
    var IsValid = Validate();
    if (!IsValid)
        return false;
    $('#LoadingImage').show();
    var getPriceGridList = [];
    getPriceGridList = GetTableRowToList('tblPriceList');
    //if (getPriceGridList.length == 0) {
    //    $.bootstrapGrowl('Add Service details ! &#128528;', {
    //        type: 'danger', delay: 5000,
    //    });
    //    return false;
    //}
    var data = {
        zPublID: $('#ddlPublisherList').val(),
        PriceGridL: getPriceGridList
    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdatePriceGrid').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            $.bootstrapGrowl(response + ' &#128515;', {
                type: 'info',
                delay: 5000,
            });
            PopulatePriceGrid($('#ddlPublisherList').val());
            $('#LoadingImage').hide();
        },
        error: function (response) {
            $.bootstrapGrowl(response + ' &#128515;', {
                type: 'danger',
                delay: 5000,
            });
            $('#myModal_WorkFlow').modal('hide');
        }
    });
}

function CheckServices(aitemL) {

    var txtbox = $(aitemL).closest('tr');
    var zChkVal = true;
    var service = $(txtbox).find('.txtservice').val();
    var complexity = $(aitemL).val();
    $.each($("#tblPriceList tbody tr"), function (e) {

        var zServicePreVal = $(this).find('td')[1].innerText;
        var zLevelPreVal = $(this).find('td')[2].innerText;
        if ($(this).find('td').find('.txtservice').length > 0 && (e != $("#tblPriceList tbody tr").length - 1)) {
            zServicePreVal = $(this).find('td').find('.txtservice').val();
            zLevelPreVal = $(this).find('td').find('.txtComplexity').val();
        }
        if ((zServicePreVal == service) && (zLevelPreVal == complexity)) {
            $.bootstrapGrowl('Already Service Added !', {
                type: 'danger',
                delay: 5000,
            });
            $(aitemL).val(-1).change();
            zChkVal = false;
            return false;
        }
    });
}

//function CheckServices(aitemL) {
//    
//    var txtbox = $(aitemL).closest('tr');
//    var zChkVal = true;
//    $.each($("#tblPriceList tbody tr"), function (e) {
//        
//        var zPreVal = $(this).find('td')[1].innerText;
//        if ($(this).find('td').find('select').length > 0 && (e != $("#tblPriceList tbody tr").length - 1)) {
//            zPreVal = $(this).find('td').find('select').val();
//        }
//        if (zPreVal == $(aitemL).val()) {
//            $.bootstrapGrowl('Already Service Added!', {
//                type: 'danger',
//                delay: 5000,
//            });
//            zChkVal = false;
//            return false;
//        }
//    });
//    if (zChkVal) {

//    }
//    else {
//        $(aitemL).val(-1).change();
//    }
//}

function AddServiceRow() {

    if (!Validate())
        return false;
    var zActList = '<select class="txtservice" style="width:120px;"  >';
    //$.each(aServiceListG, function (e, val) {
    //    zActList += '<option style="width:120px;" value="' + val.Services + '" data-id="' + val.Services + '">' + val.Services + '</option>';
    //})
    for (var i = 0; i < aServiceListG.length; i++) {
        zActList += '<option style="width:120px;" value="' + aServiceListG[i] + '" data-id="' + aServiceListG[i] + '">' + aServiceListG[i] + '</option>';
    }
    zActList += '</select>';

    var nRowL = "<tr><td>" + ($("#tblPriceList").find("tr").length - 1).toString() + "</td>"
        + "<td width='35%'>" + zActList + "</td>" //<input type='text' class='TxtActivity' maxlength='100' />
        + "<td width='15%'>" + aComplexity + "</td>"
        + "<td style='background-color:#E7717D;'><input type='text' class='TxtPrice IsNumeric OnshoreTxtPrice' maxlength='15' step='any' value='0' /></td>"
        + "<td style='background-color:#E7717D;'><input type='text' class='TxtFactor IsNumeric OnshoreTxtFactor' maxlength='15' step='any' value='0' /></td>"
        + "<td width='20%' style='background-color:#E7717D;'>" + aOnshoreUnitType + "</td>"
        + "<td style='background-color:#AAAAF9;'><input type='text' class='TxtPrice IsNumeric OffshoreTxtPrice' maxlength='15' step='any' value='0' /></td>"
        + "<td style='background-color:#AAAAF9;'><input type='text' class='TxtFactor IsNumeric OffshoreTxtFactor' maxlength='15' step='any' value='0' /></td>"
        + "<td width='20%' style='background-color:#AAAAF9;'>" + aOffshoreUnitType + "</td>"
        + "<td style='text-align: center'><i class='fas fa-trash' onclick='ServiceDelete(this);'></i></td>"
        + "</tr>";
    $("#tblPriceList").append(nRowL);

    var alastbefore = $("#tblPriceList").find("tr:nth-last-child(2)");
    if ($(alastbefore).find('select').val() != "")
        $($(alastbefore).find('select')[0]).attr('disabled', 'disabled');

    var alasttr = $("#tblPriceList").find("tr:nth-last-child(1)");
    $(alasttr).find('select').select2({ placeholder: "Select", allowClear: true, tags: true });
    $(alasttr).find('select').val(-1).change();
}
function Validate() {

    var aResultL = true;
    if ($("#tblPriceList").find("tr").length < 3)
        return true;
    var aLast = $("#tblPriceList").find("tr").last();
    var aLastService = $(aLast).find('td .txtservice').val();

    if ($(aLast).find('.txtservice').length > 0 && aLastService == null) {
        $.bootstrapGrowl('Select Service !', {
            type: 'danger',
            delay: 5000,
        });
        aResultL = false;
        return false;
    }
    if (aResultL) {
        var aActivityList = $($("#tblPriceList").find("tr")).find('.txtservice');
        $.each(aActivityList, function () {
            if ($(this).val() == "") {
                $.bootstrapGrowl('Enter Service Name !', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
        });
    }

    //if (aResultL) {
    //    $("#tblPriceList tr").each(function() {
    //        // get row
    //        var row = $(this);
    //        // get first and second td
    //        var first = row.find('td .txtservice').val();
    //        if (aLastService != undefined)
    //        {
    //            if (aLastService == first) {
    //                $.bootstrapGrowl('Service Name "' + aLastService + '" already exists !', {
    //                    type: 'danger',
    //                    delay: 5000,
    //                });
    //                aResultL = false;
    //                return false;
    //            }
    //        }

    //    });
    //}

    //var aLastUnitType = $(aLast).find('td .txtUnitType').val();
    //if (aResultL) {
    //    if (aLastUnitType == "" || aLastUnitType == null) {
    //        $.bootstrapGrowl('Select UnitType !', {
    //            type: 'danger',
    //            delay: 5000,
    //        });
    //        aResultL = false;
    //        return false;
    //    }
    //}
    if (aResultL) {
        var aUnitTypeList = $($("#tblPriceList").find("tr")).find('.txtComplexity');
        $.each(aUnitTypeList, function () {
            if ($(this).val() == "" || $(this).val() == null) {
                $.bootstrapGrowl('Select Complexity !', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
        });
    }


    var aOnshoreLastPrice = $(aLast).find('td .OnshoreTxtPrice').val();
    var aOffshoreLastPrice = $(aLast).find('td .OffshoreTxtPrice').val();
    if (aResultL) {
        if ((aOnshoreLastPrice == "" || aOnshoreLastPrice == 0) && (aOffshoreLastPrice == "" || aOffshoreLastPrice == 0)) {
            $.bootstrapGrowl('Enter Onshore/Offshore Unit Price !', {
                type: 'danger',
                delay: 5000,
            });
            aResultL = false;
            return false;
        }
    }

    var aOnshoreLastFactor = $(aLast).find('td .OnshoreTxtFactor').val();
    var aOffshoreLastFactor = $(aLast).find('td .OffshoreTxtFactor').val();
    if (aResultL) {
        if ((aOnshoreLastFactor == "" || aOnshoreLastFactor == 0) && (aOffshoreLastFactor == "" || aOffshoreLastFactor == 0)) {
            $.bootstrapGrowl('Enter Onshore/Offshore Factor !', {
                type: 'danger',
                delay: 5000,
            });
            aResultL = false;
            return false;
        }
    }

    if (aResultL) {
        var aUnitTypeList = $($("#tblPriceList").find("tr")).find('.txtOnshoreUnitType');
        if (typeof aUnitTypeList.val() !== "undefined") {
            if ((aOnshoreLastPrice != "" && aOnshoreLastPrice != 0) && (aUnitTypeList.val() == "" || aUnitTypeList.val() == null)) {
                $.bootstrapGrowl('Select Onshore UnitType !', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
        }

    }

    if (aResultL) {
        var aUnitTypeList = $($("#tblPriceList").find("tr")).find('.txtOffshoreUnitType');
        if (typeof aUnitTypeList.val() !== "undefined") {
            if ((aOffshoreLastPrice != "" && aOffshoreLastPrice != 0) && (aUnitTypeList.val() == "" || aUnitTypeList.val() == null)) {
                $.bootstrapGrowl('Select Offshore UnitType !', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
        }

    }

    //if (aResultL) {
    //    var aUnitTypeList = $($("#tblPriceList").find("tr")).find('.txtUnitType');
    //    $.each(aUnitTypeList, function () {
    //        if ($(this).val() == "" || $(this).val() == null) {
    //            $.bootstrapGrowl('Select UnitType !', {
    //                type: 'danger',
    //                delay: 5000,
    //            });
    //            aResultL = false;
    //            return false;
    //        }
    //    });
    //}

    return aResultL;
}

function ServiceDelete(btndel) {

    bootbox.confirm("Are you sure want to delete?",
        function (result) {
            if (result) {
                $(btndel).closest("tr").remove();
                $("table#tblPriceList tbody").each(function () {
                    $(this).children().each(function (index) {
                        $(this).find('td').first().html(index + 1);
                    });
                });
            }

        });
}

$("#spInvoiceAdd").click(function () {

    AddInvoiceRow();
});