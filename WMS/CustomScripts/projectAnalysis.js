var dataSet = [];
var aFileListPM;
var aFileListQC;
var aFileListXML;
var aFileListPG;
var aFileListArtwork;
var zColID;
var zColvalue;
var aCmtCount;
var time = "";
var isNoArtWork = false;

$(document).ready(function () {

    setInterval(function () {
        if ($('#hf_UserType').val() == "Manager" && $('#lblApprovedBy').html() == "")
            $('#divaction').show();
        else
            $('#divaction').hide();
    }, 1);

    $('form').css('height', size.height - 100);
    $('form').css('overflow-y', 'auto');
    $('form').css('overflow-x', 'hidden');
    $('.modal').css('overflow', 'hidden');
    $('.modal').css('top', '-30px');
    $('.form-group').css('margin-bottom', '-30px');

    if ($('#hf_UserType').val() == "Manager")
        $('#divaction').show();
    else
        $('#divaction').hide();

    $("#ddldept").select2({
        closeOnSelect: false,
        placeholder: "Select Department",
        allowHtml: true,
        allowClear: true,
        tags: true
    });

    $(".fa-comment").click(function () {
        zColID = $($(this)[0]).attr('data-id');
        zColvalue = $($(this)[0]).attr('data-value');
        $('#spcolumnCom').html("Comment for " + zColID + " : ");
        $('#txtColComment').val(zColvalue);
        $('#myModal_View2').modal({ backdrop: 'static', keyboard: false });

        if ($('#hf_UserType').val() != "Manager") {
            $('#lblcomment').show();
            $('#lblcomment').html("'" + zColvalue + "'");
            $('#txtColComment').hide();
            $('#BtnSubmit_Com').hide();
            $('#BtnResolve_Com').show();
        }
        else if ($('#hf_UserType').val() == "Manager") {
            $('#BtnSubmit_Com').show();
            $('#BtnResolve_Com').hide();
        }

    })

    $('#BtnSubmit_Com').click(function () {
        var validate = validatecomment();
        if (validate) {
            AddComments();
        }

    })
    LoadBookList();
    $('#file-input').change(function (e) {
        validateFileType('#file-input')
    });

    $('input[type="file"]').change(function (e) {

        if (window.FormData !== undefined && validateFileType('#file-input')) {
            var fileUpload = $("#file-input").get(0);
            var files = fileUpload.files;
            var fileData = new FormData();
            for (var i = 0; i < files.length; i++) {
                var rowCount = $('#tblAddAttachment tbody tr').length;
                if (rowCount > 0) {
                    $.each($("#tblAddAttachment tbody tr"), function (e) {
                        var zPreVal = $(this).find('td')[0].innerText;

                        if (zPreVal == files[i].name) {
                            $.bootstrapGrowl('Already ' + files[i].name + ' Added!', {
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
                    fileData.append(files[i].name, files[i]);
                }
            }

            fileData.append("BookID", $('#lblcatalog').html());
            fileData.append("UploadTab", $('#hf_UploadType').val());
            fileData.append("Time", time);
            $.ajax({
                url: $('#hf_FileuploadM').val(),
                type: "POST",
                contentType: false, // Not to set any content header  
                processData: false, // Not to process data  
                data: fileData,
                datatype: 'json',
                success: function (response) {
                    for (var i = 0; i < files.length; i++) {
                        var Stable = "<tr>";
                        Stable += "<td><a href='../Source/ProjectAnalysis/" + $('#lblcatalog').html() + "/" + $('#hf_UploadType').val() + "/" + time + "/" + files[i].name + "' download> " + files[i].name + "</td>";
                        Stable += "<td style='text-align: center'><i class='fas fa-trash' onclick='DeleteAddFile(this);'></i></td>";
                        Stable += "</tr>";
                        $('#tblAddAttachment tr:last').after(Stable);
                    }
                    $("#file-input").val(null);
                },
                error: function (err) {
                    alert(err.statusText);
                }
            });
        }

    });

    $('.BtnAttach').click(function () {

        $('#hf_UploadType').val($(this).attr("data-id"))
        var aType = $('#hf_UploadType').val();
        var atime = time;

        var aFileList;
        if (aType == "PM") {
            aFileList = aFileListPM;
        }
        else if (aType == "XML") {
            aFileList = aFileListXML;
        }
        else if (aType == "PG") {
            aFileList = aFileListPG;
        }
        else if (aType == "QC") {
            aFileList = aFileListQC;
        }
        else if (aType == "Artwork") {
            aFileList = aFileListArtwork;
        }

        var ztable = "";
        ztable += "<span id='spFileAdd' onclick='OpenFile();'><i class='fa fa-plus-square' aria-hidden='true'></i></span>"
        ztable += "<table id='tblAddAttachment' class='tblTrans' width=100%><thead><th>File Name</th><th>#</th></thead><tbody>"
        //$.each(aFileList, function (e, val) {
        //    var zFileNameList = val.split('\\').pop(-1);
        //    ztable += "<td><a href='../Source/ProjectAnalysis/" + $('#lblcatalog').html() + "/" + aType + "/" + time + "/" + zFileNameList + "' download> " + zFileNameList + "</td>";
        //    ztable += "<td style='text-align: center'><i class='fas fa-trash' onclick='DeleteAddFile(this);'></i></td>";
        //    ztable += "</tbody>"
        //});
        ztable += "</table>";
        $('#divFileInfo').html(ztable)
        $('#divFileInfo').show();


        $('#myModal_attachFiles').modal({ backdrop: 'static', keyboard: false });
    });

    $('#btnclose').click(function () {

        $("#FileUpload").val(null);
    })

    $('#btnapprove').click(function () {

        if (aCmtCount.length > 0) {

            $.bootstrapGrowl("Some Comments are not Resolved !", { type: 'danger', delay: 5000, });
            return false;
        }
        var validate = ValidateForm('All');

        if (validate) {

            UpdateSections($("#hf_BookID").val(), new Date(), 'Final');
            DisableCtrl('#TabPM', 0);
            DisableCtrl('#TabXML', 0);
            DisableCtrl('#TabPG', 0);
            DisableCtrl('#TabQC', 0);
            DisableCtrl('#TabArtwork', 0);
            $('#myModal_View').modal('hide');

        }
    });

    $('#btnsendback').click(function () {
        $('#myModal_View1').modal({ backdrop: 'static', keyboard: false });
    })

    $('#BtnSubmit_Gen').click(function () {
        AddComments();

    })

    $('#BtnResolve_Com').click(function () {
        AddComments(1);
    })

    $('#ddlWIPSearch').select2();
    $('#lstPublisherList').select2({
        closeOnSelect: false,
        placeholder: "Select Publisher(s)",
        allowHtml: true,
        allowClear: true,
        tags: true

    });
    $('#lstCatalogList').select2({
        closeOnSelect: false,
        placeholder: "Select Catalog(s)",
        allowHtml: true,
        allowClear: true,
        tags: true
    });
    $('#lstNumberList').select2({
        closeOnSelect: false,
        placeholder: "Select Number(s)",
        allowHtml: true,
        allowClear: true,
        tags: true
    });
    $('#lstISBNList').select2({
        closeOnSelect: false,
        placeholder: "Select ISBN(s)",
        allowHtml: true,
        allowClear: true,
        tags: true
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

    });

    $('#btnBkGet,#BkTabul li').click(function () {
        if ($(this).text() != 'Get') {
            $('#lstCatalogList').find('option').remove();
            $('#lstNumberList').find('option').remove();
            $('#lstISBNList').find('option').remove();
            $('#lstPublisherList').find('option').remove();
        }
        var zTabType = $(this).text();
        if (zTabType == "Get")
            zTabType = $('#BkTabul li.active').text();
        LoadBookList(zTabType);
    });

    $('#btnTabBook').click(function () {
        if ($('#lblApprovedBy').html() == '')
            $("#divaction").show();
    })

    $('#chkNoArtwork').click(function () {
        if ($(this).prop("checked") == true) {
            $('.artworkField').prop('disabled', 'disabled');
            isNoArtWork = true;

            $('#TabArtwork').find('i').hide();
        } else {
            $('.artworkField').prop('disabled', false);
            isNoArtWork = false;

            $('#TabArtwork').find('i').show();
        }
    });
});

function DeleteAddFile(btndel) {

    var aFileName = $(btndel).closest('tr').find('td a').html().trim();
    var data =
    {
        aCatalog: $('#lblcatalog').html(),
        zType: $('#hf_UploadType').val(),
        FileNameP: aFileName,
        zTime: time
    };
    $.ajax({
        type: 'post',
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
            $(btndel).closest('tr').remove();
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again.. ! ', {
                type: 'danger',
                delay: 5000,
            });
        }
    });

}

function DeleteAllFileFolder() {
    var data =
    {
        aBookID: $('#lblcatalog').html()


    };
    $.ajax({
        type: 'post',
        url: $('#hf_DeleteallFilesFromFolder').val(),
        data: data,
        datatype: 'json',
        success: function (response) {



        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again.. ! ', {
                type: 'danger',
                delay: 5000,
            });
        }
    });

}

function OpenFile() {
    $('#file-input').trigger('click');
}

function LoadBookList(zType) {
    var zCatalogList = ''; var zNumberList = ''; var zISBNList = ''; var zPublisherList = '';
    $('#LoadingImage').show();
    if (zType == null)
        zType = $('#BkTabul li.active').text()

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

    //$('#LoadingImage').show();
    $('#DivContentList').css('height', size.height - 120);
    $('#bookshelf').show();
    var ID = $('#hf_UserID').val();
    var data = {
        zTabType: zType,
        CatalogList: zCatalogList,
        NumList: zNumberList,
        ISBNList: zISBNList,
        PublList: zPublList
    };
    dataSet = [];
    $.ajax({
        type: 'Get',
        url: $('#hf_BookData').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var zitem = response.aItemList;
            var zBookShelfList = '';
            $('#bookshelf').html('');
            var zCtInP = 0;
            var zCtCom = 0;
            $.each(zitem, function (i, e) {

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
                    FormatDateColumn($(this)[0]["ReceivedDt"]),
                    FormatDateColumn($(this)[0]["DueDt"]),
                    (zitem[i].Approved_date == null ? '<span class=spUpdateIcon style="display:none"><i class="fa fa-pen" aria-hidden="true" title="Edit" data-col="Name" onclick="PopulateBookInfo(' + isNullCheck($(this)[0]["ID"]) + ');"></i></span>' : '<span class=spInfo><i class="fa fa-info-circle" aria-hidden="true" title="Info" data-col="Name" onclick="PopulateBookInfo(' + isNullCheck($(this)[0]["ID"]) + ');"></i></span>')
                    //$(this)[0]["ID"]

                ];

                dataSet.push(t);

                var imgpathL = zitem[i].ImgPath;
                if (zitem[i].ImgPath == null)
                    imgpathL = "../Images/Covers/blue.png";
                //    zBookShelfList +=
                //        '<div class="col-sm-2">' +
                //        '<div class="book" onclick="PopulateBookInfo(' + zitem[i].ID + ')">' +
                //        '<div class="back" style="background-image: linear-gradient( rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6) ),url(' + imgpathL + ')background-size: cover"></div>' +
                //        '<div class="page2">' +
                //        '<br><span style = "color: black;font-size: 14px;max-height:40px;">' + zitem[i].Title + '</span><br>' +
                //        '</div > ' +
                //        '<div class="page1">' +
                //        '<br><span style = "color: black;font-size: 14px">' + zitem[i].Catalog + '</span><hr>' +
                //        //'<span style = color: black;font-size: 14px";max-height:40px;>' + zitem[i].Title + '</span><br>' +
                //        '<span style = "color: black;font-size: 14px">' + isNullCheck(zitem[i].ISBN) + '</span><br>' +
                //        '<span style = "color: black;font-size: 14px">' + isNullCheck(zitem[i].AuthorName) + '</span><br>' +
                //        '</div>' +
                //        '<div class="front" style="background-image: linear-gradient( rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6) ),url(' + imgpathL + ');background-size: cover">' +
                //        '<span style = "font-size: 14px;font-weight: bold;">' + isNullCheck(zitem[i].Catalog) + '</span><hr>' +

                //        '<span style="font-size: 14px;font-weight: bold;"> ' + isNullCheck(zitem[i].ISBN) + '</span><br>' +
                //        '<span style="font-size: 14px;font-weight: bold;"> ' + isNullCheck(zitem[i].Number) + '</span><br>' +
                //        '<span style="font-size: 14px;font-weight: bold;"> ' + isNullCheck(zitem[i].Publisher) + '</span>' +

                //    (zitem[i].Approved_date == null ? '' : '<hr><span style="font-size: 13px;font-weight: bold;"> Approved By  <br>' + isNullCheck(zitem[i].ApprovedBy) + '</span><br>') +
                //        '</div></div></div>';

                zBookShelfList += '<a><div class="divBoofInfo inputHandCursor" title="' + isNullCheck(zitem[i].Title) + '" onclick="PopulateBookInfo(' + zitem[i].ID + ')">' +

                    '<div class="col-sm-3 divDisp" style="background:linear-gradient( rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),url(' + imgpathL + ') no-repeat;background-size: cover">' +
                    '<span class="spBookLabel">' + isNullCheck(zitem[i].Publisher) + '</span></br>' +
                    '<span class="spBookLabel">' + isNullCheck(zitem[i].Catalog) + '</span></br>' +
                    '<hr>' +
                    '<span class="spLabel">' +
                    isNullCheck(zitem[i].Number) + '</br>' +
                    isNullCheck(zitem[i].ISBN) + '</br>' +
                    isNullCheck(zitem[i].PEName) + '</br>' +
                    isNullCheck(zitem[i].PMName) + '</br>' +
                    (zitem[i].Approved_date == null ? '' : '<hr><span class="spLabel" style="font-weight: bold;"> Approved By  <br>' + isNullCheck(zitem[i].ApprovedBy) + '</span><br>') +
                    '</span>' +

                    '</div>' +
                    '</div></a>';

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

            $('#LoadingImage').hide();
            $('#bookshelf').html(zBookShelfList);
            $('.spBookAction').click(function () {
                $('.dropdown-menu').hide(300);
                $(this).find('.dropdown-menu').show(500);
            });
            LoadData();
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
            { title: "Book ID" },
            { title: "Catalog" },
            { title: "ISBN" },
            { title: "Publisher" },
            { title: "PE Name" },
            { title: "PM Name" },
            { title: "Received Date" },
            { title: "Proposed Pub Date" },
            {
                title: "<center>Actions</center>"
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
                filename: 'PA' + today.toShortFormatWithTime(),

                title: 'Project Analysis - ' + $('#BkTabul li.active').text(),
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
                filename: 'PA' + today.toShortFormatWithTime(),

                title: 'Project Analysis - ' + $('#BkTabul li.active').text(),
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

function PopulateBookInfo(zBookFP) {

    $('#LoadingImage').show();
    $('.tabcontent').css('display', 'none');
    $('.tablinks').removeClass('active');
    $('#btnTabBook').addClass('active');
    $("#hf_BookID").val(zBookFP);
    clearForm('#FormPA');
    var data = { zBookID: zBookFP };
    $.ajax({
        type: 'get',
        url: $('#hf_PopulateBookInfo').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            try {
                $('#btnTabPASummary').hide();
                $('#TabPASummary').html('');

                var items = response.aItemList;
                var itemsCmt = response.aitemlCmt;
                PopulateSections(zBookFP);
                DisplayData(items);

                $('.tblBkinfo').show();
                $('#LoadingImage').hide();

                PopulateComment(itemsCmt);

                $('#myModal_View').modal({ backdrop: 'static', keyboard: false });

            } catch (e) {
                $.bootstrapGrowl('Error Occured, Try Again !', {
                    type: 'danger',
                    delay: 2000,
                });
                $('#LoadingImage').hide();
            }
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

function PopulateComment(itemsCmt) {
    $('i[data-id]').removeAttr('data-value');
    $('i[data-id]').removeAttr('data-resolved');
    $('#lblGencomment').html('');
    $.each(itemsCmt, function (e, val) {

        if (val.ColumnName == 'General') {
            $('#lblGencomment').show();

            $('#lblGencomment').html(val.Comment);
        }


        if (val.TabName == 'Project Manager') {
            var aTabList = $('#TabPM');
            $(aTabList).find('i[data-id="' + val.ColumnName + '"]').attr('data-value', val.Comment);
            if (val.IsResolved == 1) {
                $(aTabList).find('i[data-id="' + val.ColumnName + '"]').attr('data-resolved', 1);
            }
        }

        if (val.TabName == 'XML') {
            var aTabList = $('#TabXML');
            $(aTabList).find('i[data-id="' + val.ColumnName + '"]').attr('data-value', val.Comment);
            if (val.IsResolved == 1) {
                $(aTabList).find('i[data-id="' + val.ColumnName + '"]').attr('data-resolved', 1);
            }
        }

        if (val.TabName == 'Pagination') {
            var aTabList = $('#TabPG');
            $(aTabList).find('i[data-id="' + val.ColumnName + '"]').attr('data-value', val.Comment);
            if (val.IsResolved == 1) {
                $(aTabList).find('i[data-id="' + val.ColumnName + '"]').attr('data-resolved', 1);
            }
        }

        if (val.TabName == 'Quality Check') {
            var aTabList = $('#TabQC');
            $(aTabList).find('i[data-id="' + val.ColumnName + '"]').attr('data-value', val.Comment);
            if (val.IsResolved == 1) {
                $(aTabList).find('i[data-id="' + val.ColumnName + '"]').attr('data-resolved', 1);
            }
        }

        if (val.TabName == 'Artwork') {
            var aTabList = $('#TabArtwork');
            $(aTabList).find('i[data-id="' + val.ColumnName + '"]').attr('data-value', val.Comment);
            if (val.IsResolved == 1) {
                $(aTabList).find('i[data-id="' + val.ColumnName + '"]').attr('data-resolved', 1);
            }
        }
    });
}

function DisplayData(aBookInfo) {
    $('#lblpublisher').html(aBookInfo[0].Publisher);
    $('#lbltitle').html(aBookInfo[0].Title);
    $('#lblcatalog').html(aBookInfo[0].Catalog);
    $('#lblno').html(aBookInfo[0].Number);
    $('#lblPE').html(aBookInfo[0].PEName);
    $('#lblPM').html(aBookInfo[0].PMName);
    $('#lblPlatform').html(aBookInfo[0].Platform);
    $('#lblworkflow').html(aBookInfo[0].Workflow);
}

function PopulateSections(zBookFP, time) {
    $("#divAction").hide();
    $('#LoadingImage').show();

    //PM
    $('#ddlcecomplexicity').select2({ placeholder: "Select", allowClear: true });
    $('#ddldualedition').select2({ placeholder: "Select", allowClear: true });
    $('#ddlisbn').select2({ placeholder: "Select", allowClear: true });
    $('#ddlindex').select2({ placeholder: "Select", allowClear: true });
    $('#ddlcatagory').select2({ placeholder: "Select", allowClear: true });
    $('#ddlbookcomp').select2({ placeholder: "Select", allowClear: true });
    $('#ddlpreviousedition').select2({ placeholder: "Select", allowClear: true });
    $('#ddlenglish').select2({ placeholder: "Select", allowClear: true });
    $('#ddlbooktype').select2({ placeholder: "Select", allowClear: true });
    $('#ddlospm').select2({ placeholder: "Select", allowClear: true });

    //XML

    $('#ddlinputtype').select2({ placeholder: "Select", allowClear: true });
    $('#ddlabstract').select2({ placeholder: "Select", allowClear: true });
    $('#ddlreftype').select2({ placeholder: "Select", allowClear: true });
    $('#ddlspkeying').select2({ placeholder: "Select", allowClear: true });
    $('#ddlpap').select2({ placeholder: "Select", allowClear: true });
    $('#ddlorcid').select2({ placeholder: "Select", allowClear: true });
    $('#ddlrefformat').select2({ placeholder: "Select", allowClear: true });
    $('#ddlfinaldel').select2({ placeholder: "Select", allowClear: true });
    $('#ddlmetasheet').select2({ placeholder: "Select", allowClear: true });
    $('#ddlsection').select2({ placeholder: "Select", allowClear: true });
    $('#ddldoi').select2({ placeholder: "Select", allowClear: true });
    $('#ddlbookabstract').select2({ placeholder: "Select", allowClear: true });

    //Pagination
    $('#ddlfont').select2({ placeholder: "Select", allowClear: true });
    $('#ddlebook').select2({ placeholder: "Select", allowClear: true });
    $('#ddlcolumn').select2({ placeholder: "Select", allowClear: true });
    $('#ddlfigureslide').select2({ placeholder: "Select", allowClear: true });
    $('#ddlcolor').select2({ placeholder: "Select", allowClear: true });
    $('#ddlprint').select2({ placeholder: "Select", allowClear: true });

    //Quality Check
    $('#ddlgreek').select2({ placeholder: "Select", allowClear: true });
    $('#ddlfoot').select2({ placeholder: "Select", allowClear: true });
    $('#ddlsectbrk').select2({ placeholder: "Select", allowClear: true });
    $('#ddlseries').select2({ placeholder: "Select", allowClear: true });
    $('#ddlbackm').select2({ placeholder: "Select", allowClear: true });
    $('#ddlvariable').select2({ placeholder: "Select", allowClear: true });
    $('#ddlendnote').select2({ placeholder: "Select", allowClear: true });
    $('#ddlfrontm').select2({ placeholder: "Select", allowClear: true });
    $('#ddlindexqc').select2({ placeholder: "Select", allowClear: true });
    $('#ddlspclelm').select2({ placeholder: "Select", allowClear: true });
    $('#ddlcolorin').select2({ placeholder: "Select", allowClear: true });

    //Artwork
    $('#ddlcolortype').select2({ placeholder: "Select", allowClear: true });
    $('#ddlArtwork').select2({ placeholder: "Select", allowClear: true });
    $('#ddlSctColor').select2({ placeholder: "Select", allowClear: true });


    var data = {
        zBookID: zBookFP,
        aTime: time

    }
    $.ajax({
        type: 'post',
        url: $('#hf_PopulateSections').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var items = response.aitemList;
            var items_Book = response.aitemList_Bookmaster;

            $('#btnTabPM').html('Project Manager'); $('#btnTabXML').html('XML'); $('#btnTabPG').html('Pagination');
            $('#btnTabQC').html('Quality Check'); $('#btnTabArtwork').html('Artwork');

            //Load Attachments File
            aFileListPM = response.aFileListPM;
            if (aFileListPM.length > 0) {
                var zpathL = aFileListPM[0].split("Source")[1];
                $('#spPMDownload').html("<a href='../Source" + zpathL + "' download><span class='fas fa-download' aria-hidden='true'></span></a>");
                $('#spPMDownload').show();
            }
            else {
                $('#spPMDownload').hide();
            }

            aFileListXML = response.aFileListXML;
            if (aFileListXML.length > 0) {
                var zpathL = aFileListXML[0].split("Source")[1];
                $('#spXMLDownload').html("<a href='../Source" + zpathL + "' download><span class='fas fa-download' aria-hidden='true'></span></a>");
                $('#spXMLDownload').show();
            }
            else {
                $('#spXMLDownload').hide();
            }

            aFileListPG = response.aFileListPG;
            if (aFileListPG.length > 0) {
                var zpathL = aFileListPG[0].split("Source")[1];
                $('#spPGDownload').html("<a href='../Source" + zpathL + "' download><span class='fas fa-download' aria-hidden='true'></span></a>");
                $('#spPGDownload').show();
            }
            else {
                $('#spPGDownload').hide();
            }
            aFileListQC = response.aFileListQC;
            if (aFileListQC.length > 0) {
                var zpathL = aFileListQC[0].split("Source")[1];
                $('#spQCDownload').html("<a href='../Source" + zpathL + "' download><span class='fas fa-download' aria-hidden='true'></span></a>");
                $('#spQCDownload').show();
            }
            else { $('#spQCDownload').hide(); }

            aFileListArtwork = response.aFileListArtwork;
            if (aFileListArtwork.length > 0) {
                var zpathL = aFileListArtwork[0].split("Source")[1];
                $('#spARTDownload').html("<a href='../Source" + zpathL + "' download><span class='fas fa-download' aria-hidden='true'></span></a>");
                $('#spARTDownload').show();
            }
            else { $('#spARTDownload').hide(); }

            aCmtCount = response.amangerCmtCount;

            $('#divaction').hide();
            $('#DivApproved').hide();

            if (items == null || items.length == 0) {
                DisableCtrl('#TabPM', 1);
                DisableCtrl('#TabXML', 1);
                DisableCtrl('#TabPG', 1);
                DisableCtrl('#TabQC', 1);
                DisableCtrl('#TabArtwork', 1);
                CheckAccessRights();

                $('#btnTabBook').hide();
                $('#btnTabBook').removeClass('active');
                $('#TabPM').show();
                $('.tab .tablinks:nth-child(2)').addClass('active');
                $('#ddlcatagory').val(items_Book.UploadType).change();

                return false;
            }
            $('#tblBkinfo').show();
            $('#btnTabBook').show();

            //Project manager
            $('#txtmss').val(items.PM_MSS);
            $('#ddlcecomplexicity').val(items.PM_CEComplexity).change();
            $('#ddldualedition').val(items.PM_DualEdition).change();
            $('#ddlisbn').val(items.PM_ISBN).change();
            $('#ddlindex').val(items.PM_Index).change();

            (items.PM_Category == null ? $('#ddlcatagory').val(items_Book.UploadType).change() : $('#ddlcatagory').val(items.PM_Category).change())
            //$('#ddlcatagory').val(items.PM_Category).change();

            $('#txtestimate').val(items.PM_Estimate);
            $('#ddlbookcomp').val(items.PM_BKComplexity).change();
            $('#ddlpreviousedition').val(items.PM_PreEdition).change();
            $('#ddlenglish').val(items.PM_English).change();
            $('#txtcastoff').val(items.PM_Castoff);
            $('#ddlbooktype').val(items.PM_BookType).change();
            $('#txtremarkPM').val(items.PM_Remarks);
            $('#txtqueryPM').val(items.PM_Queries);
            $('#ddlospm').val(items.PM_OSPM).change();

            //xml
            $('#ddlinputtype').val(items.XML_Input_Type).change();
            $('#ddlabstract').val(items.XML_Abstract).change();
            $('#ddlreftype').val(items.XML_Ref_Type).change();
            $('#ddlbookabstract').val(items.XML_BookAbstract).change();
            $('#ddldoi').val(items.XML_DOI).change();
            $('#txttblcount').val(items.XML_Tab_Count);
            $('#ddlspkeying').val(items.XML_Spl_Keying).change();
            $('#ddlpap').val(items.XML_PAPDeliverable).change();
            $('#ddlorcid').val(items.XML_Orcid).change();
            $('#ddlrefformat').val(items.XML_Ref_Format).change();
            $('#ddlfinaldel').val(items.XML_FinalDeliverable).change();
            $('#txtequations').val(items.XML_EQ_Count);
            $('#ddlmetasheet').val(items.XML_MetaSheet).change();
            $('#ddlsection').val(items.XML_Sec_Format).change();
            $('#txtremarkxml').val(items.XML_Remarks);
            $('#txtqueryxml').val(items.XML_Query);


            //Pagination
            $('#txtdesign').val(items.PG_Design);
            $('#ddlfont').val(items.PG_Font_Availability).change();
            $('#ddlebook').val(items.PG_Ebook).change();
            $('#txtimprint').val(items.PG_ImPrint);
            $('#ddlcolumn').val(items.PG_Column).change();
            $('#txttrim').val(items.PG_Trim);
            $('#ddlfigureslide').val(items.PG_Figure_Slides).change();
            $('#ddlcolor').val(items.PG_Color).change();
            $('#txttemplate').val(items.PG_Template);
            $('#ddlprint').val(items.PG_Print).change();
            $('#txtremarkpn').val(items.PG_Remarks);
            $('#txtquerypn').val(items.PG_Query);

            //Quality Check
            $('#ddlgreek').val(items.QC_Greek_Chars).change();
            $('#ddlfoot').val(items.QC_Footnotes).change();
            $('#ddlsectbrk').val(items.QC_Sec_Breaks).change();
            $('#ddlseries').val(items.QC_Series_Page).change();
            $('#ddlbackm').val(items.QC_BM).change();
            $('#txttblcount1').val(items.QC_Tables_Count);
            $('#ddlvariable').val(items.QC_Variables).change();
            $('#ddlendnote').val(items.QC_EndNotes).change();
            $('#ddlfrontm').val(items.QC_FM).change();
            $('#ddlindexqc').val(items.QC_Index).change();
            $('#ddlspclelm').val(items.QC_Spl_Elements).change();
            $('#ddlcolorin').val(items.QC_ColorInsert).change();
            $('#txtremarkqc').val(items.QC_Remarks);
            $('#txtqueryqc').val(items.QC_Query);

            //ArtWork
            $('#ddlcolortype').val(items.Art_Color_Type).change();
            $('#ddlSctColor').val(items.Art_ScatterColors).change();

            zArtworkList = null;
            try {
                var data = items.Art_ArtWork.split(',');
                var selectedValues = new Array();
                try {
                    for (var i = 0; i < data.length; i++) {
                        selectedValues[i] = data[i];
                    }
                } catch (e) { }

                zArtworkList = selectedValues;
                $('#ddlArtwork').val(selectedValues).change();

            } catch (e) {

            }


            $('#txtpagewidth').val(items.Art_Page_Width);
            $('#txttfig').val(items.Art_Figures_Count);
            $('#txtredraws').val(items.Art_Redraws);
            $('#txtpheight').val(items.Art_Page_Height);
            $('#txtremarkart').val(items.Art_Remarks);
            $('#txtqueryart').val(items.Art_Query);
            $('#chkNoArtwork').val(items.Is_NoArtwork);

            $('#LoadingImage').hide();

            if ($('#hf_UserType').val() == "Manager")
                $('#divaction').show();
            else
                $('#divaction').hide();

            $('#DivApproved').hide();

            var aLinkPA = $('#aLinkPA').attr('href');
            var value = aLinkPA.substring(aLinkPA.lastIndexOf('/') + 1);
            $('#aLinkPA').attr('href', aLinkPA.replace(value, zBookFP));

            $('#lblApprovedBy').html('');

            if ($('#hf_UserType').val() == "Manager")
                $('#divaction').show();
            else
                $('#divaction').hide();

            if (items.Approved_date != null) {
                $('#divaction').hide();
                $('#DivApproved').show();
                DisableCtrl('#TabPM', 0);
                DisableCtrl('#TabXML', 0);
                DisableCtrl('#TabPG', 0);
                DisableCtrl('#TabQC', 0);
                DisableCtrl('#TabArtwork', 0);
                $('#lblApprovedBy').html("Approved by - '" + response.aApprovedByL.toString().capitalize() + "'");
                $('#tblBkinfo').show();
                $('#btnTabPASummary').show();
                $('#TabPASummary').html(response.aPASummaryL);
            }
            else {
                CheckAccessRights(items.PM_Isapproved, items.XML_Isapproved, items.PG_Isapproved, items.QC_Isapproved, items.Artwork_Isapproved);
                if ($('#hf_UserType').val() != "Manager") {
                    $('#btnTabBook').hide();
                }
                $('#tblBkinfo').hide();
                $('#btnTabPM').addClass('active');
                $('#TabPM').show();
                $('#btnTabBook').removeClass('active');
            }

            if (items.Is_NoArtwork) {
                $('#chkNoArtwork').prop('checked', 'checked');
            } else {
                $('#chkNoArtwork').prop('checked', false);
            }

            (items.PM_Isapproved != null ? $('#btnTabPM').html('<i class="fas fa-check" style="color:#228b22"></i> Project Manager') : $('#btnTabPM').html('Project Manager'));
            (items.XML_Isapproved != null ? $('#btnTabXML').html('<i class="fas fa-check" style="color:#228b22"></i> XML') : $('#btnTabXML').html('XML'));
            (items.PG_Isapproved != null ? $('#btnTabPG').html('<i class="fas fa-check" style="color:#228b22"></i> Pagination') : $('#btnTabPG').html('Pagination'));
            (items.QC_Isapproved != null ? $('#btnTabQC').html('<i class="fas fa-check" style="color:#228b22"></i> Quality Check') : $('#btnTabQC').html('Quality Check'));
            (items.Artwork_Isapproved != null ? $('#btnTabArtwork').html('<i class="fas fa-check" style="color:#228b22"></i> Artwork') : $('#btnTabArtwork').html('Artwork'));

            return false;
        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 2000,
            });
            $('#LoadingImage').hide();
        }
    });

    setInterval(function () {
        if ($('#chkNoArtwork').prop("checked")) {
            $('.artworkField').prop('disabled', 'disabled');
            $('#TabArtwork').find('i').hide();
            isNoArtWork = true;
        } else {
            if ($('#btnUpdate_Artwork').prop("disabled")) {
                $('#chkNoArtwork').prop('disabled', 'disabled');
                $('.artworkField').prop('disabled', 'disabled');
                $('#TabArtwork').find('i').hide();
            } else {
                $('#chkNoArtwork').prop('disabled', false);
                $('.artworkField').prop('disabled', false);
                $('#TabArtwork').find('i').show();
            }
            isNoArtWork = false;
        }
    }, 3000);
}

$(function () {
    time = $.now();
    $('#btnUpdate_PM').click(function () {
        UpdateSections_PM($("#hf_BookID").val());

    });

    $('#btnUpdate_XML').click(function () {
        UpdateSections_XML($("#hf_BookID").val());
    });

    $('#btnUpdate_PG').click(function () {
        UpdateSections_PG($("#hf_BookID").val());
    });

    $('#btnUpdate_QC').click(function () {
        UpdateSections_QC($("#hf_BookID").val());
    });

    $('#btnUpdate_Artwork').click(function () {
        UpdateSections_Artwork($("#hf_BookID").val());
    });

    $('#btnApprove_PM').click(function () {

        var validate = ValidateForm('PM');
        if (validate) {

            bootbox.confirm("Are you sure to Submit?",
                function (result) {
                    if (result) {

                        UpdateSections_PM($("#hf_BookID").val(), new Date(), 'PM');
                        DisableCtrl('#TabPM', 0);

                    }
                });
        }
    });

    $('#btnApprove_XML').click(function () {

        var validate = ValidateForm('XML');
        if (validate) {
            bootbox.confirm("Are you sure to Submit?",
                function (result) {
                    if (result) {

                        UpdateSections_XML($("#hf_BookID").val(), new Date(), 'XML');
                        DisableCtrl('#TabXML', 0);
                    }
                });
        }

    });

    $('#btnApprove_PG').click(function () {
        var validate = ValidateForm('PG');
        if (validate) {
            bootbox.confirm("Are you sure to Submit?",
                function (result) {
                    if (result) {
                        UpdateSections_PG($("#hf_BookID").val(), new Date(), 'PG');
                        DisableCtrl('#TabPG', 0);
                    }
                });
        }
    });

    $('#btnApprove_QC').click(function () {
        var validate = ValidateForm('QC');
        if (validate) {
            bootbox.confirm("Are you sure to Submit?",
                function (result) {
                    if (result) {
                        UpdateSections_QC($("#hf_BookID").val(), new Date(), 'QC');
                        DisableCtrl('#TabQC', 0);
                    }
                });
        }

    });

    $('#btnApprove_Artwork').click(function () {
        if (isNoArtWork) {
            bootbox.confirm("Are you sure to Submit?",
                function (result) {
                    if (result) {
                        UpdateSections_Artwork($("#hf_BookID").val(), new Date(), 'Artwork');
                        DisableCtrl('#TabArtwork', 0);
                    }
                });
        } else {
            var validate = ValidateForm('Artwork');
            if (validate) {
                bootbox.confirm("Are you sure to Submit?",
                    function (result) {
                        if (result) {
                            UpdateSections_Artwork($("#hf_BookID").val(), new Date(), 'Artwork');
                            DisableCtrl('#TabArtwork', 0);
                        }
                    });
            }
        }
    });
});

function UpdateSections_PM(aBookID, aApproveDate, aType) {
    $('#LoadingImage').show();
    var aType = aType;// $('#hf_UploadType').val();
    var zCatalog = $('#lblcatalog').html();

    var getFileListPM = [];

    if (aType == "PM" || $('.tablinks.active').text().trim() == "Project Manager") {
        getFileListPM = GetTableRowToList('tblAddAttachment');
    }

    var aitemInfoP = {

        FileListPM: getFileListPM,
        zTime: time,
        aCatalog: zCatalog,

        MainID: aBookID,
        //Project manager
        PM_MSS: $('#txtmss').val(),
        PM_CEComplexity: ($('#ddlcecomplexicity').val() == null ? null : $('#ddlcecomplexicity').val().toString()),
        PM_DualEdition: ($('#ddldualedition').val() == null ? null : $('#ddldualedition').val().toString()),
        PM_ISBN: ($('#ddlisbn').val() == null ? null : $('#ddlisbn').val().toString()),
        PM_Index: ($('#ddlindex').val() == null ? null : $('#ddlindex').val().toString()),
        PM_Category: ($('#ddlcatagory').val() == null ? null : $('#ddlcatagory').val().toString()),
        PM_Estimate: $('#txtestimate').val(),
        PM_BKComplexity: ($('#ddlbookcomp').val() == null ? null : $('#ddlbookcomp').val().toString()),
        PM_PreEdition: ($('#ddlpreviousedition').val() == null ? null : $('#ddlpreviousedition').val().toString()),
        PM_English: ($('#ddlenglish').val() == null ? null : $('#ddlenglish').val().toString()),
        PM_Castoff: $('#txtcastoff').val(),
        PM_BookType: ($('#ddlbooktype').val() == null ? null : $('#ddlbooktype').val().toString()),
        PM_Remarks: $('#txtremarkPM').val(),
        PM_Queries: $('#txtqueryPM').val(),
        PM_OSPM: ($('#ddlospm').val() == null ? null : $('#ddlospm').val().toString()),

        Approved_date: (aType == 'Final' ? aApproveDate : null),
        PM_Isapproved: (aType == 'PM' ? aApproveDate : null),
        zType: aType


    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateSections_PM').val(),
        data: JSON.stringify(aitemInfoP),
        contentType: 'application/json;charset=utf-8',
        datatype: 'json',
        success: function (response) {
            $.bootstrapGrowl('Details Updated Successfully', {
                type: 'info',
                delay: 2000,

            });
            // LoadBookList();
            $('#LoadingImage').hide();
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

function UpdateSections_XML(aBookID, aApproveDate, aType) {

    $('#LoadingImage').show();
    var aType = aType;// $('#hf_UploadType').val();
    var zCatalog = $('#lblcatalog').html();


    var getFileListXML = [];



    if (aType == "XML" || $('.tablinks.active').text().trim() == "XML") {
        getFileListXML = GetTableRowToList('tblAddAttachment');
    }


    var aitemInfoP = {
        FileListXML: getFileListXML,

        zTime: time,
        aCatalog: zCatalog,

        MainID: aBookID,

        //xml
        XML_Input_Type: ($('#ddlinputtype').val() == null ? null : $('#ddlinputtype').val().toString()),
        XML_Abstract: ($('#ddlabstract').val() == null ? null : $('#ddlabstract').val().toString()),
        XML_Ref_Type: ($('#ddlreftype').val() == null ? null : $('#ddlreftype').val().toString()),
        XML_DOI: ($('#ddldoi').val() == null ? null : $('#ddldoi').val().toString()),
        XML_BookAbstract: ($('#ddlbookabstract').val() == null ? null : $('#ddlbookabstract').val().toString()),
        XML_Tab_Count: $('#txttblcount').val(),
        XML_Spl_Keying: ($('#ddlspkeying').val() == null ? null : $('#ddlspkeying').val().toString()),
        XML_PAPDeliverable: ($('#ddlpap').val() == null ? null : $('#ddlpap').val().toString()),
        XML_Orcid: ($('#ddlorcid').val() == null ? null : $('#ddlorcid').val().toString()),
        XML_Ref_Format: ($('#ddlrefformat').val() == null ? null : $('#ddlrefformat').val().toString()),
        XML_FinalDeliverable: ($('#ddlfinaldel').val() == null ? null : $('#ddlfinaldel').val().toString()),
        XML_EQ_Count: $('#txtequations').val(),
        XML_MetaSheet: ($('#ddlmetasheet').val() == null ? null : $('#ddlmetasheet').val().toString()),
        XML_Sec_Format: ($('#ddlsection').val() == null ? null : $('#ddlsection').val().toString()),
        XML_Remarks: $('#txtremarkxml').val(),
        XML_Query: $('#txtqueryxml').val(),

        Approved_date: (aType == 'Final' ? aApproveDate : null),
        XML_Isapproved: (aType == 'XML' ? aApproveDate : null),
        zType: aType



    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateSections_XML').val(),
        data: JSON.stringify(aitemInfoP),
        contentType: 'application/json;charset=utf-8',
        datatype: 'json',
        success: function (response) {
            $.bootstrapGrowl('Details Updated Successfully', {
                type: 'info',
                delay: 2000,

            });
            //LoadBookList();
            $('#LoadingImage').hide();
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

function UpdateSections_Artwork(aBookID, aApproveDate, aType) {

    $('#LoadingImage').show();
    var aType = aType;// $('#hf_UploadType').val();
    var zCatalog = $('#lblcatalog').html();

    var getFileListArt = [];

    if (aType == "Artwork" || $('.tablinks.active').text().trim() == "Artwork") {
        getFileListArt = GetTableRowToList('tblAddAttachment');
    }

    var aitemInfoP = {
        FileListArt: getFileListArt,
        zTime: time,
        aCatalog: zCatalog,
        MainID: aBookID,
        //ArtWork
        Art_Color_Type: ($('#ddlcolortype').val() == null ? null : $('#ddlcolortype').val().toString()),
        Art_ScatterColors: ($('#ddlSctColor').val() == null ? null : $('#ddlSctColor').val().toString()),
        Art_Page_Width: $('#txtpagewidth').val(),
        Art_Figures_Count: $('#txttfig').val(),
        Art_Redraws: $('#txtredraws').val(),
        Art_Page_Height: $('#txtpheight').val(),
        Art_Remarks: $('#txtremarkart').val(),
        Art_Query: $('#txtqueryart').val(),
        Art_ArtWork: ($('#ddlArtwork').val() == null ? null : $('#ddlArtwork').val().toString()),
        Approved_date: (aType == 'Final' ? aApproveDate : null),
        Artwork_Isapproved: (aType == 'Artwork' ? aApproveDate : null),
        zType: aType,
        Is_NoArtwork: $('#chkNoArtwork').prop("checked")
    }

    $.ajax({
        type: 'post',
        url: $('#hf_UpdateSections_Artwork').val(),
        data: JSON.stringify(aitemInfoP),
        contentType: 'application/json;charset=utf-8',
        datatype: 'json',
        success: function (response) {
            $.bootstrapGrowl('Details Updated Successfully', {
                type: 'info',
                delay: 2000,

            });
            //LoadBookList();
            $('#LoadingImage').hide();
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

function UpdateSections_QC(aBookID, aApproveDate, aType) {

    $('#LoadingImage').show();
    var aType = aType;// $('#hf_UploadType').val();
    var zCatalog = $('#lblcatalog').html();


    var getFileListQC = [];


    if (aType == "QC" || $('.tablinks.active').text().trim() == "Quality Check") {
        getFileListQC = GetTableRowToList('tblAddAttachment');
    }


    var aitemInfoP = {




        FileListQC: getFileListQC,

        zTime: time,
        aCatalog: zCatalog,

        MainID: aBookID,


        //Quality Check
        QC_Greek_Chars: ($('#ddlgreek').val() == null ? null : $('#ddlgreek').val().toString()),
        QC_Footnotes: ($('#ddlfoot').val() == null ? null : $('#ddlfoot').val().toString()),
        QC_Sec_Breaks: ($('#ddlsectbrk').val() == null ? null : $('#ddlsectbrk').val().toString()),
        QC_Series_Page: ($('#ddlseries').val() == null ? null : $('#ddlseries').val().toString()),
        QC_BM: ($('#ddlbackm').val() == null ? null : $('#ddlbackm').val().toString()),
        QC_Tables_Count: $('#txttblcount1').val(),
        QC_Variables: ($('#ddlvariable').val() == null ? null : $('#ddlvariable').val().toString()),
        QC_EndNotes: ($('#ddlendnote').val() == null ? null : $('#ddlendnote').val().toString()),
        QC_FM: ($('#ddlfrontm').val() == null ? null : $('#ddlfrontm').val().toString()),
        QC_Index: ($('#ddlindexqc').val() == null ? null : $('#ddlindexqc').val().toString()),
        QC_Spl_Elements: ($('#ddlspclelm').val() == null ? null : $('#ddlspclelm').val().toString()),
        QC_ColorInsert: ($('#ddlcolorin').val() == null ? null : $('#ddlcolorin').val().toString()),
        QC_Remarks: $('#txtremarkqc').val(),
        QC_Query: $('#txtqueryqc').val(),




        Approved_date: (aType == 'Final' ? aApproveDate : null),

        QC_Isapproved: (aType == 'QC' ? aApproveDate : null),



        zType: aType



    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateSections_QC').val(),
        data: JSON.stringify(aitemInfoP),
        contentType: 'application/json;charset=utf-8',
        datatype: 'json',
        success: function (response) {
            $.bootstrapGrowl('Details Updated Successfully', {
                type: 'info',
                delay: 2000,

            });
            // LoadBookList();
            $('#LoadingImage').hide();
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

function UpdateSections_PG(aBookID, aApproveDate, aType) {
    $('#LoadingImage').show();
    var aType = aType;// $('#hf_UploadType').val();
    var zCatalog = $('#lblcatalog').html();


    var getFileListPG = [];

    if (aType == "PG" || $('.tablinks.active').text().trim() == "Pagination") {
        getFileListPG = GetTableRowToList('tblAddAttachment');

    }

    var aitemInfoP = {

        FileListPG: getFileListPG,

        zTime: time,
        aCatalog: zCatalog,

        MainID: aBookID,


        //Pagination
        PG_Design: $('#txtdesign').val(),
        PG_Font_Availability: ($('#ddlfont').val() == null ? null : $('#ddlfont').val().toString()),
        PG_Ebook: ($('#ddlebook').val() == null ? null : $('#ddlebook').val().toString()),
        PG_ImPrint: $('#txtimprint').val(),
        PG_Column: ($('#ddlcolumn').val() == null ? null : $('#ddlcolumn').val().toString()),
        PG_Trim: $('#txttrim').val(),
        PG_Figure_Slides: ($('#ddlfigureslide').val() == null ? null : $('#ddlfigureslide').val().toString()),
        PG_Color: ($('#ddlcolor').val() == null ? null : $('#ddlcolor').val().toString()),
        PG_Template: $('#txttemplate').val(),
        PG_Print: ($('#ddlprint').val() == null ? null : $('#ddlprint').val().toString()),
        PG_Remarks: $('#txtremarkpn').val(),
        PG_Query: $('#txtquerypn').val(),


        Approved_date: (aType == 'Final' ? aApproveDate : null),

        PG_Isapproved: (aType == 'PG' ? aApproveDate : null),

        zType: aType



    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateSections_PG').val(),
        data: JSON.stringify(aitemInfoP),
        contentType: 'application/json;charset=utf-8',
        datatype: 'json',
        success: function (response) {
            $.bootstrapGrowl('Details Updated Successfully', {
                type: 'info',
                delay: 2000,

            });
            // LoadBookList();
            $('#LoadingImage').hide();
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

function UpdateSections(aBookID, aApproveDate, aType) {

    $('#LoadingImage').show();
    var aType = aType;// $('#hf_UploadType').val();
    var zCatalog = $('#lblcatalog').html();

    var getFileListPM = [];
    var getFileListPG = [];
    var getFileListXML = [];
    var getFileListArt = [];
    var getFileListQC = [];

    if (aType == "PM" || $('.tablinks.active').text().trim() == "Project Manager") {
        getFileListPM = GetTableRowToList('tblAddAttachment');
    }
    if (aType == "PG" || $('.tablinks.active').text().trim() == "Pagination") {
        getFileListPG = GetTableRowToList('tblAddAttachment');

    }
    if (aType == "XML" || $('.tablinks.active').text().trim() == "XML") {
        getFileListXML = GetTableRowToList('tblAddAttachment');
    }
    if (aType == "Artwork" || $('.tablinks.active').text().trim() == "Artwork") {
        getFileListArt = GetTableRowToList('tblAddAttachment');
    }
    if (aType == "QC" || $('.tablinks.active').text().trim() == "Quality Check") {
        getFileListQC = GetTableRowToList('tblAddAttachment');
    }


    var aitemInfoP = {



        FileListPM: getFileListPM,
        FileListQC: getFileListQC,
        FileListXML: getFileListXML,
        FileListPG: getFileListPG,
        FileListArt: getFileListArt,
        zTime: time,
        aCatalog: zCatalog,

        MainID: aBookID,
        //Project manager
        PM_MSS: $('#txtmss').val(),
        PM_CEComplexity: ($('#ddlcecomplexicity').val() == null ? null : $('#ddlcecomplexicity').val().toString()),
        PM_DualEdition: ($('#ddldualedition').val() == null ? null : $('#ddldualedition').val().toString()),
        PM_ISBN: ($('#ddlisbn').val() == null ? null : $('#ddlisbn').val().toString()),
        PM_Index: ($('#ddlindex').val() == null ? null : $('#ddlindex').val().toString()),
        PM_Category: ($('#ddlcatagory').val() == null ? null : $('#ddlcatagory').val().toString()),
        PM_Estimate: $('#txtestimate').val(),
        PM_BKComplexity: ($('#ddlbookcomp').val() == null ? null : $('#ddlbookcomp').val().toString()),
        PM_PreEdition: ($('#ddlpreviousedition').val() == null ? null : $('#ddlpreviousedition').val().toString()),
        PM_English: ($('#ddlenglish').val() == null ? null : $('#ddlenglish').val().toString()),
        PM_Castoff: $('#txtcastoff').val(),
        PM_BookType: ($('#ddlbooktype').val() == null ? null : $('#ddlbooktype').val().toString()),
        PM_Remarks: $('#txtremarkPM').val(),
        PM_Queries: $('#txtqueryPM').val(),
        PM_OSPM: ($('#ddlospm').val() == null ? null : $('#ddlospm').val().toString()),


        //xml
        XML_Input_Type: ($('#ddlinputtype').val() == null ? null : $('#ddlinputtype').val().toString()),
        XML_Abstract: ($('#ddlabstract').val() == null ? null : $('#ddlabstract').val().toString()),
        XML_Ref_Type: ($('#ddlreftype').val() == null ? null : $('#ddlreftype').val().toString()),
        XML_BookAbstract: ($('#ddlbookabstract').val() == null ? null : $('#ddlbookabstract').val().toString()),
        XML_DOI: ($('#ddldoi').val() == null ? null : $('#ddldoi').val().toString()),
        XML_Tab_Count: $('#txttblcount').val(),
        XML_Spl_Keying: ($('#ddlspkeying').val() == null ? null : $('#ddlspkeying').val().toString()),
        XML_PAPDeliverable: ($('#ddlpap').val() == null ? null : $('#ddlpap').val().toString()),
        XML_Orcid: ($('#ddlorcid').val() == null ? null : $('#ddlorcid').val().toString()),
        XML_Ref_Format: ($('#ddlrefformat').val() == null ? null : $('#ddlrefformat').val().toString()),
        XML_FinalDeliverable: ($('#ddlfinaldel').val() == null ? null : $('#ddlfinaldel').val().toString()),
        XML_EQ_Count: $('#txtequations').val(),
        XML_MetaSheet: ($('#ddlmetasheet').val() == null ? null : $('#ddlmetasheet').val().toString()),
        XML_Sec_Format: ($('#ddlsection').val() == null ? null : $('#ddlsection').val().toString()),
        XML_Remarks: $('#txtremarkxml').val(),
        XML_Query: $('#txtqueryxml').val(),


        //Pagination
        PG_Design: $('#txtdesign').val(),
        PG_Font_Availability: ($('#ddlfont').val() == null ? null : $('#ddlfont').val().toString()),
        PG_Ebook: ($('#ddlebook').val() == null ? null : $('#ddlebook').val().toString()),
        PG_ImPrint: $('#txtimprint').val(),
        PG_Column: ($('#ddlcolumn').val() == null ? null : $('#ddlcolumn').val().toString()),
        PG_Trim: $('#txttrim').val(),
        PG_Figure_Slides: ($('#ddlfigureslide').val() == null ? null : $('#ddlfigureslide').val().toString()),
        PG_Color: ($('#ddlcolor').val() == null ? null : $('#ddlcolor').val().toString()),
        PG_Template: $('#txttemplate').val(),
        PG_Print: ($('#ddlprint').val() == null ? null : $('#ddlprint').val().toString()),
        PG_Remarks: $('#txtremarkpn').val(),
        PG_Query: $('#txtquerypn').val(),


        //Quality Check
        QC_Greek_Chars: ($('#ddlgreek').val() == null ? null : $('#ddlgreek').val().toString()),
        QC_Footnotes: ($('#ddlfoot').val() == null ? null : $('#ddlfoot').val().toString()),
        QC_Sec_Breaks: ($('#ddlsectbrk').val() == null ? null : $('#ddlsectbrk').val().toString()),
        QC_Series_Page: ($('#ddlseries').val() == null ? null : $('#ddlseries').val().toString()),
        QC_BM: ($('#ddlbackm').val() == null ? null : $('#ddlbackm').val().toString()),
        QC_Tables_Count: $('#txttblcount1').val(),
        QC_Variables: ($('#ddlvariable').val() == null ? null : $('#ddlvariable').val().toString()),
        QC_EndNotes: ($('#ddlendnote').val() == null ? null : $('#ddlendnote').val().toString()),
        QC_FM: ($('#ddlfrontm').val() == null ? null : $('#ddlfrontm').val().toString()),
        QC_Index: ($('#ddlindexqc').val() == null ? null : $('#ddlindexqc').val().toString()),
        QC_Spl_Elements: ($('#ddlspclelm').val() == null ? null : $('#ddlspclelm').val().toString()),
        QC_ColorInsert: ($('#ddlcolorin').val() == null ? null : $('#ddlcolorin').val().toString()),
        QC_Remarks: $('#txtremarkqc').val(),
        QC_Query: $('#txtqueryqc').val(),


        //ArtWork
        Art_Color_Type: ($('#ddlcolortype').val() == null ? null : $('#ddlcolortype').val().toString()),
        Art_ScatterColors: ($('#ddlSctColor').val() == null ? null : $('#ddlSctColor').val().toString()),
        Art_Page_Width: $('#txtpagewidth').val(),
        Art_Figures_Count: $('#txttfig').val(),
        Art_Redraws: $('#txtredraws').val(),
        Art_Page_Height: $('#txtpheight').val(),
        Art_Remarks: $('#txtremarkart').val(),
        Art_Query: $('#txtqueryart').val(),
        Art_ArtWork: ($('#ddlArtwork').val() == null ? null : $('#ddlArtwork').val().toString()),

        Approved_date: (aType == 'Final' ? aApproveDate : null),
        PM_Isapproved: (aType == 'PM' ? aApproveDate : null),
        XML_Isapproved: (aType == 'XML' ? aApproveDate : null),
        PG_Isapproved: (aType == 'PG' ? aApproveDate : null),
        QC_Isapproved: (aType == 'QC' ? aApproveDate : null),
        Artwork_Isapproved: (aType == 'Artwork' ? aApproveDate : null),



        //PM_Completed: (aType == 'PM' ? '1' : '0'),
        //XML_Completed: (aType == 'XML' ? '1' : '0'),
        //PG_Completed: (aType == 'PG' ? '1' : '0'),
        //QC_Completed: (aType == 'QC' ? '1' : '0'),
        //Art_Completed: (aType == 'Artwork' ? '1' : '0'),

        zType: aType



    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateSections').val(),
        data: JSON.stringify(aitemInfoP),
        contentType: 'application/json;charset=utf-8',
        datatype: 'json',
        success: function (response) {
            $.bootstrapGrowl('Details Updated Successfully', {
                type: 'info',
                delay: 2000,

            });
            LoadBookList();
            $('#LoadingImage').hide();
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

function AddComments(IsResolveComment) {
    var zComments = $('#txtColComment').val();
    var zTabName = $('button.active').text().trim();
    if (zTabName == 'Book Information') {
        if ($('#txtGeneralcom').val() == '') {
            $.bootstrapGrowl('Enter Comments. !', {
                type: 'danger',
                delay: 5000,
            });

            return false;
        }
        zComments = $('#txtGeneralcom').val();
    }

    var aitemInfoP = {

        BookID: $("#hf_BookID").val(),
        TabName: zTabName,
        ColumnName: (zTabName == 'Book Information' ? 'General' : zColID),
        Comment: zComments,
        IsResolved: IsResolveComment
    }
    $.ajax({
        type: 'post',
        url: $('#hf_AddColumnComment').val(),
        data: JSON.stringify(aitemInfoP),
        contentType: 'application/json;charset=utf-8',
        datatype: 'json',
        success: function (response) {
            if (response) {
                $.bootstrapGrowl('Comment Submitted Successfully!', {
                    type: 'info',
                    delay: 5000,
                });

            }
            if (zTabName == 'Book Information')
                $('#lblGencomment').html("<br><strong>General Comments :</strong> <br> '" + zComments + "'");


            if ($('button.active').text().trim() == 'Project Manager') {
                var aTabList = $('#TabPM');
                $(aTabList).find('i[data-id="' + zColID + '"]').attr('data-value', $('#txtColComment').val());
                if (IsResolveComment == 1) {
                    $(aTabList).find('i[data-id="' + zColID + '"]').attr('data-resolved', 1);
                }
            }
            if ($('button.active').text().trim() == 'XML') {
                var aTabList = $('#TabXML');
                $(aTabList).find('i[data-id="' + zColID + '"]').attr('data-value', $('#txtColComment').val());
                if (IsResolveComment == 1) {
                    $(aTabList).find('i[data-id="' + zColID + '"]').attr('data-resolved', 1);
                }
            }
            if ($('button.active').text().trim() == 'Pagination') {
                var aTabList = $('#TabPG');
                $(aTabList).find('i[data-id="' + zColID + '"]').attr('data-value', $('#txtColComment').val());
                if (IsResolveComment == 1) {
                    $(aTabList).find('i[data-id="' + zColID + '"]').attr('data-resolved', 1);
                }
            }
            if ($('button.active').text().trim() == 'Quality Check') {
                var aTabList = $('#TabQC');
                $(aTabList).find('i[data-id="' + zColID + '"]').attr('data-value', $('#txtColComment').val());
                if (IsResolveComment == 1) {
                    $(aTabList).find('i[data-id="' + zColID + '"]').attr('data-resolved', 1);
                }
            }
            if ($('button.active').text().trim() == 'Artwork') {
                var aTabList = $('#TabArtwork');
                $(aTabList).find('i[data-id="' + zColID + '"]').attr('data-value', $('#txtColComment').val());
                if (IsResolveComment == 1) {
                    $(aTabList).find('i[data-id="' + zColID + '"]').attr('data-resolved', 1);
                }
            }

            $('#txtColComment').val('');
            $('#txtGeneralcom').val('');
            $('#myModal_View2').modal('hide');
            $('#myModal_View1').modal('hide');


            if ($('#hf_UserType').val() == "Manager")
                $('#divaction').show();
            else
                $('#divaction').hide();

        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again.. !', {
                type: 'danger',
                delay: 5000,
            });
        }
    });

}

function ValidateForm(form) {
    var zResult = true;

    //PM
    if (form == "PM" || form == "All") {
        if ($('#txtmss').val() == '') {
            $.bootstrapGrowl('Enter MSS !', { type: 'danger', delay: 5000, });
            $('#TabPM').show();
            $('#btnTabPM').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#txtmss').focus();
            zResult = false;
        }
        else if ($('#ddlcecomplexicity').val() == null) {
            $.bootstrapGrowl("Select CE Complexity !", { type: 'danger', delay: 5000, });
            $('#TabPM').show();
            $('#btnTabPM').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlcecomplexicity').focus();
            zResult = false;
        }
        else if ($('#ddldualedition').val() == null) {
            $.bootstrapGrowl("Select Dual Edition !", { type: 'danger', delay: 5000, });
            $('#TabPM').show();
            $('#btnTabPM').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddldualedition').focus();
            zResult = false;
        }
        else if ($('#ddlisbn').val() == null) {
            $.bootstrapGrowl("Select ISBN !", { type: 'danger', delay: 5000, });
            $('#TabPM').show();
            $('#btnTabPM').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlisbn').focus();
            zResult = false;

        }
        else if ($('#ddlindex').val() == null) {
            $.bootstrapGrowl("Select Index !", { type: 'danger', delay: 5000, });
            $('#TabPM').show();
            $('#btnTabPM').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlindex').focus();
            zResult = false;
        }
        else if ($('#txtestimate').val() == '') {
            $.bootstrapGrowl("Enter Estimate !", { type: 'danger', delay: 5000, });
            $('#TabPM').show();
            $('#btnTabPM').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#txtestimate').focus();
            zResult = false;
        }

        else if ($('#ddlcatagory').val() == null) {
            $.bootstrapGrowl("Select Catagory !", { type: 'danger', delay: 5000, });
            $('#TabPM').show();
            $('#btnTabPM').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlcatagory').focus();
            zResult = false;
        }
        else if ($('#ddlbookcomp').val() == null) {
            $.bootstrapGrowl("Select Book Complexity !", { type: 'danger', delay: 5000, });
            $('#TabPM').show();
            $('#btnTabPM').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlbookcomp').focus();
            zResult = false;

        }
        else if ($('#ddlpreviousedition').val() == null) {
            $.bootstrapGrowl("Select Previous Edition !", { type: 'danger', delay: 5000, });
            $('#TabPM').show();
            $('#btnTabPM').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlpreviousedition').focus();
            zResult = false;
        }
        else if ($('#ddlenglish').val() == null) {
            $.bootstrapGrowl("Select English !", { type: 'danger', delay: 5000, });
            $('#TabPM').show();
            $('#btnTabPM').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlenglish').focus();
            zResult = false;

        }
        else if ($('#txtcastoff').val() == '') {
            $.bootstrapGrowl("Enter Castoff !", { type: 'danger', delay: 5000, });
            $('#TabPM').show();
            $('#btnTabPM').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#txtcastoff').focus();
            zResult = false;
        }
        else if ($('#ddlbooktype').val() == null) {
            $.bootstrapGrowl("Select Book Type !", { type: 'danger', delay: 5000, });
            $('#TabPM').show();
            $('#btnTabPM').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlbooktype').focus();
            zResult = false;
        }
        else if ($('#ddlospm').val() == null) {
            $.bootstrapGrowl("Select OSPM!", { type: 'danger', delay: 5000, });
            $('#TabPM').show();
            $('#btnTabPM').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlospm').focus();
            zResult = false;

        }
        else if ($('#txtqueryPM').val() == '') {
            //$.bootstrapGrowl('Enter Query for PM !', { type: 'danger', delay: 5000, });
            //$('#TabPM').show();
            //$('#btnTabPM').addClass('active');
            //$('#btnTabBook').removeClass('active');
            //$('#divaction').hide();
            //$('#txtqueryPM').focus();
            //zResult = false;
        }

    }

    //XML
    if (form == "XML" || form == "All") {
        //XML
        if ($('#ddlinputtype').val() == null) {
            $.bootstrapGrowl("Select Input Type !", { type: 'danger', delay: 5000, });
            $('#TabXML').show();
            $('#btnTabXML').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlinputtype').focus();
            zResult = false;
        }
        else if ($('#ddlabstract').val() == null) {
            $.bootstrapGrowl("Select Abstract!", { type: 'danger', delay: 5000, });
            $('#TabXML').show();
            $('#btnTabXML').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlabstract').focus();
            zResult = false;

        }
        else if ($('#ddlreftype').val() == null) {
            $.bootstrapGrowl("Select Reference Type !", { type: 'danger', delay: 5000, });
            $('#TabXML').show();
            $('#btnTabXML').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlreftype').focus();
            zResult = false;
        }
        else if ($('#ddlbookabstract').val() == null) {
            $.bootstrapGrowl("Select Book Abstract !", { type: 'danger', delay: 5000, });
            $('#TabXML').show();
            $('#btnTabXML').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlbookabstract').focus();
            zResult = false;
        }

        else if ($('#txttblcount').val() == '') {
            $.bootstrapGrowl("Enter table count !", { type: 'danger', delay: 5000, });
            $('#TabXML').show();
            $('#btnTabBook').removeClass('active');
            $('#btnTabXML').addClass('active');
            $('#divaction').hide();
            $('#txttblcount').focus();
            zResult = false;
        }

        else if ($('#ddlspkeying').val() == null) {
            $.bootstrapGrowl("Select Special Keying !", { type: 'danger', delay: 5000, });
            $('#TabXML').show();
            $('#btnTabXML').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlspkeying').focus();
            zResult = false;
        }
        else if ($('#ddlpap').val() == null) {
            $.bootstrapGrowl("Select PAP Deliverable !", { type: 'danger', delay: 5000, });
            $('#TabXML').show();
            $('#btnTabXML').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlpap').focus();
            zResult = false;
        }
        else if ($('#ddlorcid').val() == null) {
            $.bootstrapGrowl("Select ORCID !", { type: 'danger', delay: 5000, });
            $('#TabXML').show();
            $('#btnTabXML').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlorcid').focus();
            zResult = false;

        }
        else if ($('#ddlrefformat').val() == null) {
            $.bootstrapGrowl("Select Reference Format !", { type: 'danger', delay: 5000, });
            $('#TabXML').show();
            $('#btnTabXML').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlrefformat').focus();
            zResult = false;
        }
        else if ($('#ddlfinaldel').val() == null) {
            $.bootstrapGrowl("Select Final Deliverable !", { type: 'danger', delay: 5000, });
            $('#TabXML').show();
            $('#btnTabXML').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlfinaldel').focus();
            zResult = false;

        }

        else if ($('#ddldoi').val() == null) {
            $.bootstrapGrowl("Select DOI !", { type: 'danger', delay: 5000, });
            $('#TabXML').show();
            $('#btnTabXML').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddldoi').focus();
            zResult = false;

        }

        else if ($('#txtequations').val() == '') {
            $.bootstrapGrowl("Enter Equations !", { type: 'danger', delay: 5000, });
            $('#TabXML').show();
            $('#btnTabXML').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#txtequations').focus();
            zResult = false;
        }
        else if ($('#ddlmetasheet').val() == null) {
            $.bootstrapGrowl("Select Metasheet !", { type: 'danger', delay: 5000, });
            $('#TabXML').show();
            $('#btnTabXML').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlmetasheet').focus();
            zResult = false;
        }
        else if ($('#ddlsection').val() == null) {
            $.bootstrapGrowl("Select Section !", { type: 'danger', delay: 5000, });
            $('#TabXML').show();
            $('#btnTabXML').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlsection').focus();
            zResult = false;

        }
    }

    //PG
    if (form == "PG" || form == "All") {
        if ($('#txtdesign').val() == '') {
            $.bootstrapGrowl("Enter Design !", { type: 'danger', delay: 5000, });
            $('#TabPG').show();
            $('#btnTabPG').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#txtdesign').focus();
            zResult = false;
        }
        else if ($('#ddlfont').val() == null) {
            $.bootstrapGrowl("Select Font !", { type: 'danger', delay: 5000, });
            $('#TabPG').show();
            $('#divaction').hide();
            $('#btnTabPG').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#ddlfont').focus();
            zResult = false;
        }
        else if ($('#ddlebook').val() == null) {
            $.bootstrapGrowl("Select E-Book !", { type: 'danger', delay: 5000, });
            $('#TabPG').show();
            $('#divaction').hide();
            $('#btnTabPG').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#ddlebook').focus();
            zResult = false;

        }
        else if ($('#txtimprint').val() == '') {
            $.bootstrapGrowl("Enter imprint !", { type: 'danger', delay: 5000, });
            $('#TabPG').show();
            $('#divaction').hide();
            $('#btnTabPG').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#txtimprint').focus();
            zResult = false;
        }
        else if ($('#txttrim').val() == '') {
            $.bootstrapGrowl("Enter trim!", { type: 'danger', delay: 5000, });
            $('#TabPG').show();
            $('#divaction').hide();
            $('#btnTabPG').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#txttrim').focus();
            zResult = false;
        }
        else if ($('#ddlfigureslide').val() == null) {
            $.bootstrapGrowl("Select Figure Slides !", { type: 'danger', delay: 5000, });
            $('#TabPG').show();
            $('#divaction').hide();
            $('#btnTabPG').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#ddlfigureslide').focus();
            zResult = false;
        }
        else if ($('#ddlcolor').val() == null) {
            $.bootstrapGrowl("Select Color !", { type: 'danger', delay: 5000, });
            $('#TabPG').show();
            $('#divaction').hide();
            $('#btnTabPG').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#ddlcolor').focus();
            zResult = false;
        }
        else if ($('#txttemplate').val() == '') {
            $.bootstrapGrowl("Enter Template !", { type: 'danger', delay: 5000, });
            $('#TabPG').show();
            $('#divaction').hide();
            $('#btnTabPG').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#txttemplate').focus();
            zResult = false;
        }
        else if ($('#ddlprint').val() == null) {
            $.bootstrapGrowl("Select Print !", { type: 'danger', delay: 5000, });
            $('#TabPG').show();
            $('#divaction').hide();
            $('#btnTabPG').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#ddlprint').focus();
            zResult = false;

        }
        else if ($('#ddlcolumn').val() == null) {
            $.bootstrapGrowl("Select Column !", { type: 'danger', delay: 5000, });
            $('#TabPG').show();
            $('#divaction').hide();
            $('#btnTabPG').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#ddlcolumn').focus();
            zResult = false;
        }

    }


    //QC
    if (form == "QC" || form == "All") {

        if ($('#ddlgreek').val() == null) {
            $.bootstrapGrowl("Select Greek !", { type: 'danger', delay: 5000, });
            $('#TabQC').show();
            $('#divaction').hide();
            $('#btnTabBook').removeClass('active');
            $('#btnTabQC').addClass('active');
            $('#ddlgreek').focus();
            zResult = false;
        }
        else if ($('#ddlfoot').val() == null) {
            $.bootstrapGrowl("Select Foot Notes !", { type: 'danger', delay: 5000, });
            $('#TabQC').show();
            $('#divaction').hide();
            $('#btnTabBook').removeClass('active');
            $('#btnTabQC').addClass('active');
            $('#ddlfoot').focus();
            zResult = false;

        }
        else if ($('#ddlsectbrk').val() == null) {
            $.bootstrapGrowl("Select Section Breaks !", { type: 'danger', delay: 5000, });
            $('#TabQC').show();
            $('#divaction').hide();
            $('#btnTabQC').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#ddlsectbrk').focus();
            zResult = false;
        }
        else if ($('#ddlseries').val() == null) {
            $.bootstrapGrowl("Select Series Page !", { type: 'danger', delay: 5000, });
            $('#TabQC').show();
            $('#divaction').hide();
            $('#btnTabQC').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#ddlseries').focus();
            zResult = false;
        }
        else if ($('#ddlbackm').val() == null) {
            $.bootstrapGrowl("Select Back matters !", { type: 'danger', delay: 5000, });
            $('#TabQC').show();
            $('#divaction').hide();
            $('#btnTabQC').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#ddlbackm').focus();
            zResult = false;
        }
        else if ($('#ddlvariable').val() == null) {
            $.bootstrapGrowl("Select variables !", { type: 'danger', delay: 5000, });
            $('#TabQC').show();
            $('#btnTabQC').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlvariable').focus();
            zResult = false;

        }
        else if ($('#ddlendnote').val() == null) {
            $.bootstrapGrowl("Select End Note !", { type: 'danger', delay: 5000, });
            $('#TabQC').show();
            $('#btnTabQC').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlendnote').focus();
            zResult = false;
        }
        else if ($('#ddlfrontm').val() == null) {
            $.bootstrapGrowl("Select Frontmatter !", { type: 'danger', delay: 5000, });
            $('#TabQC').show();
            $('#btnTabQC').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlfrontm').focus();
            zResult = false;
        }
        else if ($('#ddlindexqc').val() == null) {
            $.bootstrapGrowl("Select Index for QC!", { type: 'danger', delay: 5000, });
            $('#TabQC').show();
            $('#btnTabQC').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlindexqc').focus();
            zResult = false;
        }
        else if ($('#ddlspclelm').val() == null) {
            $.bootstrapGrowl("Select Special Elements !", { type: 'danger', delay: 5000, });
            $('#TabQC').show();
            $('#btnTabQC').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlspclelm').focus();
            zResult = false;

        }
        else if ($('#ddlcolorin').val() == null) {
            $.bootstrapGrowl("Select Color Insert !", { type: 'danger', delay: 5000, });
            $('#TabQC').show();
            $('#btnTabQC').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlcolorin').focus();
            zResult = false;
        }
        else if ($('#txttblcount1').val() == '') {
            $.bootstrapGrowl("Enter table count for QC !", { type: 'danger', delay: 5000, });
            $('#TabQC').show();
            $('#divaction').hide();
            $('#btnTabBook').removeClass('active');
            $('#btnTabQC').addClass('active');
            $('#txttblcount1').focus();
            zResult = false;
        }
    }

    //Artwork
    if (form == "Artwork" || form == "All") {

        if ($('#ddlcolortype').val() == null) {
            $.bootstrapGrowl("Select Color Type !", { type: 'danger', delay: 5000, });
            $('#TabArtwork').show();
            $('#btnTabArtwork').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlcolortype').focus();
            zResult = false;

        }
        else if ($('#txttfig').val() == '') {
            $.bootstrapGrowl("Enter total figure !", { type: 'danger', delay: 5000, });
            $('#TabArtwork').show();
            $('#btnTabArtwork').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#txttfig').focus();
            zResult = false;
        }
        else if ($('#txtpheight').val() == '') {
            $.bootstrapGrowl("Enter Page height!", { type: 'danger', delay: 5000, });
            $('#TabArtwork').show();
            $('#divaction').hide();
            $('#btnTabArtwork').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#txtpheight').focus();
            zResult = false;
        }
        else if ($('#txtredraws').val() == '') {
            $.bootstrapGrowl("Enter Redraws !", { type: 'danger', delay: 5000, });
            $('#TabArtwork').show();
            $('#btnTabArtwork').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#txtredraws').focus();
            zResult = false;
        }
        else if ($('#txtpagewidth').val() == '') {
            $.bootstrapGrowl("Enter Page width!", { type: 'danger', delay: 5000, });
            $('#TabArtwork').show();
            $('#btnTabArtwork').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#txtpagewidth').focus();
            zResult = false;
        }
        else if ($('#ddlArtwork').val() == null) {
            $.bootstrapGrowl("Select Artwork!", { type: 'danger', delay: 5000, });
            $('#TabArtwork').show();
            $('#btnTabArtwork').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlArtwork').focus();
            zResult = false;
        }
        if ($('#ddlSctColor').val() == null) {
            $.bootstrapGrowl("Select Scatter Colors !", { type: 'danger', delay: 5000, });
            $('#TabArtwork').show();
            $('#btnTabArtwork').addClass('active');
            $('#btnTabBook').removeClass('active');
            $('#divaction').hide();
            $('#ddlSctColor').focus();
            zResult = false;

        }
    }

    if ($('#hf_UserType').val() == "Manager")
        $('#divaction').show();
    else
        $('#divaction').hide();

    return zResult;

};

function validatecomment() {
    var zResult = true;

    if ($('#txtColComment').val() == '') {
        $.bootstrapGrowl("Enter your Comment !", { type: 'danger', delay: 5000, });
        $('#txtColComment').focus();
        zResult = false;
    }
    return zResult;
}

//Optional Code
function ClearData() {

    //Project manager
    $('#txtmss').val('');
    $('#ddlcecomplexicity').val(-1).change();
    $('#ddldualedition').val(-1).change();
    $('#ddlisbn').val(-1).change();
    $('#ddlindex').val(-1).change();
    $('#ddlcatagory').val(-1).change();
    $('#txtestimate').val('');
    $('#ddlbookcomp').val(-1).change();
    $('#ddlpreviousedition').val(-1).change();
    $('#ddlenglish').val(-1).change();
    $('#txtcastoff').val('');
    $('#ddlbooktype').val(-1).change();
    $('#txtremarkPM').val('');
    $('#txtqueryPM').val('');
    $('#ddlospm').val(-1).change();

    //xml
    $('#ddlinputtype').val(-1).change();
    $('#ddlabstract').val(-1).change();
    $('#ddlreftype').val(-1).change();
    $('#txttblcount').val('');
    $('#ddlspkeying').val(-1).change();
    $('#ddlpap').val(-1).change();
    $('#ddlbookabstract').val(-1).change();
    $('#ddldoi').val(-1).change();
    $('#ddlorcid').val(-1).change();
    $('#ddlrefformat').val(-1).change();
    $('#ddlfinaldel').val(-1).change();
    $('#txtequations').val('');
    $('#ddlmetasheet').val(-1).change();
    $('#ddlsection').val(-1).change();
    $('#txtremarkxml').val('');
    $('#txtqueryxml').val('');

    //Pagination
    $('#txtdesign').val('');
    $('#ddlfont').val(-1).change();
    $('#ddlebook').val(-1).change();
    $('#txtimprint').val('');
    $('#ddlcolumn').val(-1).change();
    $('#txttrim').val('');
    $('#ddlfigureslide').val(-1).change();
    $('#ddlcolor').val(-1).change();
    $('#txttemplate').val('');
    $('#ddlprint').val(-1).change();
    $('#txtremarkpn').val('');
    $('#txtquerypn').val('');

    //Quality Check
    $('#ddlgreek').val(-1).change();
    $('#ddlfoot').val(-1).change();
    $('#ddlsectbrk').val(-1).change();
    $('#ddlseries').val(-1).change();
    $('#ddlbackm').val(-1).change();
    $('#txttblcount1').val('');
    $('#ddlvariable').val(-1).change();
    $('#ddlendnote').val(-1).change();
    $('#ddlfrontm').val(-1).change();
    $('#ddlindexqc').val(-1).change();
    $('#ddlspclelm').val(-1).change();
    $('#ddlcolorin').val(-1).change();
    $('#txtremarkqc').val('');
    $('#txtqueryqc').val('');

    //ArtWork
    $('#ddlcolortype').val(-1).change();
    $('#ddlSctColor').val(-1).change();
    $('#ddlArtwork').val(-1).change();
    $('#txtpagewidth').val('');
    $('#txttfig').val('');
    $('#txtredraws').val('');
    $('#txtpheight').val('');
    $('#txtremarkart').val('');
    $('#txtqueryart').val('');


}
function ShowBookMaster(zID, itemP) {

    $('.BookView').hide();
    $('#' + zID).show();
    if (zID == 'DivListView')
        $('#DivContentList').css('overflow', 'hidden');
    else
        $('#DivContentList').css('overflow', 'auto');

    var table = $('#example').DataTable();
    table.draw();
    CheckAccessRights();
    $('.iright').css('color', '#1d2c99');
    $('.iright').css('cursor', 'pointer');
    $('#' + itemP).css('color', '#2196f3');
    $('#' + itemP).css('cursor', 'not-allowed');
}