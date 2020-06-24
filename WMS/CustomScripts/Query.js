var dataSet = [];
var aEditListG;
var aCatalog = "";
var time = "";
var aQueryIDG;
var aShowResolved = 0;
var table;
$(function () {
    time = $.now();
    $('.divBookContent').css('height', size.height - 120);
    $('#ddlWIPSearch').select2();
    $('#ddlAddCatalog').select2();
    $('#ddltemplate').select2({ placeholder: "Select Template" });
    $('#ddlAddChapter').select2({ closeOnSelect: false, placeholder: "Select Chapter" });
    $('#ddlAddQueryTo').select2({ closeOnSelect: false, placeholder: "Select Query To" });
    $('#txtQuery,#txtResponse').jqte();

    $('#txtReminderDt').datetimepicker({
        format: 'd M Y',
        //value: new Date(),
        timepicker: false,
        minDate: today,
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });

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

    $('.iQryBookInfo').click(function () {
        $("#myModal_BookInfo").modal({ backdrop: 'static', keyboard: false });
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

        $('#lstNumberList').val(null).trigger("change");
        $('#lstCatalogFilter').val(null).trigger("change");
        $('#lstISBNList').val(null).trigger("change");

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

    });

    $('#ddlAddCatalog').change(function () {
        $('#txtQuery').val('');
        $('#txtSubject').val('');
        $('#myModal_Add .jqte_editor').html('');
        $('#divFileInfo').html('');
        aCatalog = $(this).val();
        var data = { Catalog: $(this).val() };
        $.ajax({
            type: 'post',
            url: $('#hf_GetCatalogbyUser').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var items = response.Chapteritems;

                $("#ddlAddChapter").empty();
                for (var i = 0; i < items.length; i++) {

                    $("#ddlAddChapter").append("<option value='" + items[i].Text + "'>" + items[i].Text + "</option>");
                }
                var item_temp = response.TempList;
                $("#ddltemplate").empty();
                for (var i = 0; i < item_temp.length; i++) {

                    $("#ddltemplate").append("<option value='" + item_temp[i].Text + "'>" + item_temp[i].Text + "</option>");
                }
                $("#ddltemplate").val(null).change();
            },
            error: function (result) {
                $.bootstrapGrowl('Error Occured, Try Again !', {
                    type: 'danger',
                    delay: 2000,
                });
                $('#LoadingImage').hide();
            }
        });

        var data = { Catalog: aCatalog, zID: 0 };

        $.ajax({
            type: 'post',
            url: $('#hf_GetBookDataByCatalog').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                $('#divBookInfo').html('');
                var items = response.aItemList;
                if (items.length > 0) {
                    var ztable = '<table class="tblMain">';
                    ztable += '<tr><td>Publisher</td>' + '<td>' + items[0].Publisher + '</td></tr>';
                    ztable += '<tr><td>Catalog</td>' + '<td>' + items[0].Catalog + '</td></tr>';
                    ztable += '<tr><td>Title</td>' + '<td>' + items[0].Title + '</td></tr>';
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
                    $('#divBookInfo').html(ztable);
                }

                $('#ddlAddQueryTo').empty();
                var aQueryToEmailList = response.aQueryToEmailList;
                $.each(aQueryToEmailList, function (e, val) {
                    $('#ddlAddQueryTo').append("<option value='" + val.UserID + "'>" + val.EmailID + "</option>");
                });

                $("#myModal_Add").modal({ backdrop: 'static', keyboard: false });
            },
            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 2000,
                });
            }
        });

        var ztable = "";
        ztable += "<label class='control-label'>Attachment</label><span id='spFileAdd' onclick='OpenFile(1);'><i class='fa fa-plus-square' aria-hidden='true'></i></span>"
        ztable += "<div class='divFile' style='overflow:auto;height:200px'><table id='tblAddAttachment' class='tblTrans' width=100%><thead><th>File Name</th><th>#</th></thead><tbody>"
        ztable += "</tbody></div>"
        ztable += "</table>";
        $('#divFileInfo').html(ztable);
    });

    $('input[type="file"]').change(function (e) {
        if (validateFileType('#file-input')) {
            if (window.FormData !== undefined) {
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

                fileData.append("Catalog", aCatalog);
                fileData.append("Time", time);
                $.ajax({
                    url: $('#hf_AddFileupload').val(),
                    type: "POST",
                    contentType: false, // Not to set any content header  
                    processData: false, // Not to process data  
                    data: fileData,
                    datatype: 'json',
                    success: function (response) {
                        for (var i = 0; i < files.length; i++) {
                            var Stable = "<tr>";
                            Stable += "<td><a href='../Source/Query/" + aCatalog + "/" + time + "/" + files[i].name + "' download> " + files[i].name + "</td>";
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
        }
    });

    $('#FResponse').change(function (e) {
        if (validateFileType('#FResponse')) {
            if (window.FormData !== undefined) {
                var fileUpload = $("#FResponse").get(0);
                var files = fileUpload.files;
                var fileData = new FormData();
                for (var i = 0; i < files.length; i++) {
                    var rowCount = $('#tblAddAttachmentR tbody tr').length;
                    if (rowCount > 0) {
                        $.each($("#tblAddAttachmentR tbody tr"), function (e) {
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

                for (var i = 0; i < files.length; i++) {
                    var Stable = "<tr>";
                    Stable += "<td><a href='../Source/Query/" + aCatalog + "/" + time + "/" + files[i].name + "' download> " + files[i].name + "</td>";
                    Stable += "<td style='text-align: center'><i class='fas fa-trash' onclick='DeleteAddFile(this,2);'></i></td>";
                    Stable += "</tr>";

                    $('#tblAddAttachmentR tr:last').after(Stable);

                }
            }
        }
    });

    $('#txtSubject').change(function (e) {
        var data = { zCatalog: $('#ddlAddCatalog').val(), zSubject: $('#txtSubject').val() };
        $.ajax({
            type: 'get',
            url: $('#hf_CheckExistingData').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                if (response) {
                    $.bootstrapGrowl($('#txtSubject').val() + ' - subject already found !', {
                        type: 'danger',
                        delay: 8000,
                    });
                    $('#txtSubject').val('');
                }

            },
            error: function (result) {
                $.bootstrapGrowl('Error Occured, Try Again.. !', {
                    type: 'danger',
                    delay: 8000,
                });

            }
        });
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


        CallQueryListBk('true', $('#BkTabul li.active').text(), zNumberList, zCatalogList, zISBNList);

    });

    $('#btnSendQuery').click(function () {
        var IsValid = ValidateSendQuery();
        if (!IsValid)
            return false;
        $('#LoadingImage').show();
        $('#myModal_Add').modal('hide');
        var getFileList = [];
        getFileList = GetTableRowToList('tblAddAttachment');
        var data = {
            zCatalog: $('#ddlAddCatalog').val(),
            zChapter: $('#ddlAddChapter').val(),
            zSubject: $('#txtSubject').val(),
            zQuery: $('#txtQuery').val(),
            zTime: time,
            FileListL: getFileList,
            zQueryTo: $('#ddlAddQueryTo').val().toString(),
            zQueryPriority: $("form input[name='optradio']:checked").parent('label').text(),
            zReminderDt: $('#txtReminderDt').val()
        }

        $.ajax({
            type: 'post',
            url: $('#hf_AddQuery').val(),
            data: data,
            datatype: 'json',
            traditional: true,
            success: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'info',
                    delay: 5000,
                });
                CallQueryListBk('true', 'Pending', '', '', '', 'WIP');
                $('#LoadingImage').hide();
                $('#myModal_Add').modal('hide');
            },
            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 5000,
                });
                $('#LoadingImage').hide();
            }
        });
    });

    CallQueryListBk('true', 'Pending', '', '', '', 'WIP');

    $('#ddltemplate').change(function () {
        if ($(this).val() != null)
            GetQueryTemplate($(this).val());
    });

    $('#ddlAddChapter').change(function () {
        if ($(this).val() != null)
            GetQueryTemplate($(this).val());
    });

    $('#myModal_QueryInfo').on('hidden.bs.modal', function () {
        $('.onCursor').removeClass('changeColor');
    });
});

function OpenFile(aid) {
    if (aid == 1)
        $('#file-input').trigger('click');
    else
        $('#FResponse').trigger('click');
}

function DeleteAddFile(aitem, atypeP) {
    var aFileName = $(aitem).closest('tr').find('td a').text().trim();
    if (atypeP == 2) {
        var fileId = aFileName;
        var fileUpload = $("#FResponse").get(0);
        var filesToUpload = fileUpload.files;
        // loop through the files array and check if the name of that file matches FileName
        // and get the index of the match
        var newFileList = Array.from(fileUpload.files);

        for (var i = 0; i < newFileList.length; ++i) {
            if (newFileList[i].name === fileId)
                newFileList.splice(i, 1);
        }
        $(aitem).closest('tr').remove();
    }
    else {
        var data =
        {
            zCatalog: aCatalog,
            zFileNameP: aFileName,
            zTime: time

        };
        $.ajax({
            type: 'get',
            url: $('#hf_DeleteAddFile').val(),
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
}

function ValidateSendQuery() {
    var aResultL = true;
    if ($('#ddlAddCatalog').val() == null) {
        $.bootstrapGrowl('Select Catalog !', {
            type: 'danger',
            delay: 5000,
        });
        aResultL = false;
    }
    else if ($('#txtSubject').val() == "") {
        $.bootstrapGrowl('Enter Query Subject !', {
            type: 'danger',
            delay: 5000,
        });
        aResultL = false;
    }
    //else if ($('#ddltemplate').val() == null) {
    //    $.bootstrapGrowl('Select Template Name !', {
    //        type: 'danger',
    //        delay: 5000,
    //    });
    //    aResultL = false;
    //}
    else if ($('#txtQuery').val() == '') {
        $.bootstrapGrowl('Enter Body Content !', {
            type: 'danger',
            delay: 5000,
        });
        aResultL = false;
    }

    else if ($('#ddlAddQueryTo').val() == null) {
        $.bootstrapGrowl('Select Query To Email ID List !', {
            type: 'danger',
            delay: 5000,
        });
        aResultL = false;
    }
    return aResultL;
}

function GetChatData(zID) {
    $('#txtResponse').val('');
    $('#myModal_Chat .jqte_editor').html('');
    $('#btnResolved').hide();
    aEditListG = zID;
    $('#LoadingImage').show();
    var ID = zID.split('|')[0];
    var Catalog = zID.split('|')[1];
    var aRaisedBY = zID.split('|')[2];
    if (aRaisedBY == 'ME' && $('#BkTabul li.active').text() == 'Pending')
        $('#btnResolved').show();
    else
        $('#btnResolved').hide();


    $('#divQueryBookInfo').html('');
    $('#divQueryChatInfo').html('');
    aQueryIDG = ID;
    aCatalog = Catalog;
    var data = { Catalog: Catalog, zID: ID };
    $.ajax({
        type: 'post',
        url: $('#hf_GetBookDataByCatalog').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var items = response.aItemList;
            $('#spnCatalog').html('<strong>Catalog : ' + items[0].Catalog + '</strong>&nbsp;')
            var ztable = '<table class="tblMain">';
            ztable += '<tr><td>Publisher</td>' + '<td>' + items[0].Publisher + '</td></tr>';
            ztable += '<tr><td>Catalog</td>' + '<td>' + items[0].Catalog + '</td></tr>';
            ztable += '<tr><td>Title</td>' + '<td>' + items[0].Title + '</td></tr>';
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
            $('#divBookInfo').html(ztable);

            //Query Conversation List
            var items = response.aQueryItemList;
            $('#lblTitleReply').html('Query Info - ' + items[0].QuerySubject);
            var ztable = '<div class="panel panel-primary"><div class="panel-body"><ul class="chat">';
            var align = 'right';
            var zPreLogin = '';
            for (var i = 0; i < items.length; i++) {
                if ($('#hf_UserID').val() == items[i].UserID)
                    align = 'left';
                else
                    align = 'right';

                if (align == 'right') {
                    zPreLogin = items[i].LoginName;
                    align = 'left';
                    ztable += '<li class="left clearfix">';
                    ztable += '<span class="chat-img pull-left">';
                    var aimgpath = items[i].Image;
                    if (aimgpath == null || aimgpath == '') {
                        aimgpath = "../img/user.jpg";
                    }
                    ztable += '<img src="' + aimgpath + '" alt="" class="imgProfile">'
                    ztable += '</span>';
                    ztable += '<div class="chat-body clearfix">';
                    ztable += '<div class="header">';
                    ztable += '<strong class="primary-font">' + items[i].LoginName + '</strong> <small class="pull-right text-muted">';

                    if (items[i].Attachment != '') {
                        ztable += '<a class="fa fa-paperclip" href="' + items[i].Attachment + '" download />';
                    }

                    //if (items[i].Days == 0) {
                    //    ztable += '<span class="glyphicon glyphicon-time"></span>' + items[i].Hour + ' hr:' + items[i].Minutes + ' mins ago';
                    //}
                    //else {
                    //    ztable += '<span class="glyphicon glyphicon-time"></span>' + items[i].Days + ' Days:' + items[i].Hour + ' hr:' + items[i].Minutes + ' mins ago';
                    //}

                    ztable += '<span class="glyphicon glyphicon-time"></span>' + FormatDateColumn(items[i].UpdatedDate);


                    ztable += '</small>';
                    ztable += '</div>';
                    ztable += '<br/><p>';
                    ztable += items[i].QueryResponse;
                    ztable += '</p>';
                    ztable += '</div>';
                    ztable += '</li>';
                }
                else {
                    zPreLogin = items[i].LoginName;
                    align = 'right'
                    ztable += '<li class="right clearfix">';
                    ztable += '<span class="chat-img pull-right">';
                    ztable += '<img src="' + items[i].Image + '" alt="" class="imgProfile">'
                    ztable += '</span>';
                    ztable += '<div class="chat-body clearfix">';
                    ztable += '<div class="header">';
                    ztable += '<small class=" text-muted">';



                    //if (items[i].Days == 0) {
                    //    ztable += '<span class="glyphicon glyphicon-time"></span>' + items[i].Hour + ' hr:' + items[i].Minutes + ' mins ago';
                    //}
                    //else {
                    //    ztable += '<span class="glyphicon glyphicon-time"></span>' + items[i].Days + ' Days:' + items[i].Hour + ' hr:' + items[i].Minutes + ' mins ago';
                    //}

                    ztable += '<span class="glyphicon glyphicon-time"></span>' + FormatDateColumn(items[i].UpdatedDate);

                    ztable += '</small>';
                    if (items[i].Attachment != '') {
                        ztable += '<a class="fa fa-paperclip" href="' + items[i].Attachment + '" download />';
                    }
                    ztable += '<strong class="pull-right primary-font">' + items[i].LoginName + '</strong>';
                    ztable += '</div>';

                    ztable += '<br/><p>';
                    ztable += items[i].QueryResponse;
                    ztable += '</p>';
                    ztable += '</div>';
                    ztable += '</li>';
                }
            }

            ztable += '</ul></div>';
            ztable += '</div>';

            $('#divQueryChatInfo').html(ztable);

            $('#myModal_Chat .jqte_editor').css('height', size.height - 460);

            var ztable = "";
            ztable += "<label class='control-label'>Attachment</label><span id='spFileAdd' onclick='OpenFile(2);'><i class='fa fa-plus-square' aria-hidden='true'></i></span>"
            ztable += "<div class='divFile' style='overflow:auto;height:200px'><table id='tblAddAttachmentR' class='tblTrans' width=100%><thead><th>File Name</th><th>#</th></thead><tbody>"
            ztable += "</tbody>"
            ztable += "</table></div>";
            $('#divFileInfo_R').html(ztable);

            $("#myModal_QueryInfo").modal("hide");

            $("#myModal_Chat").modal({ backdrop: 'static', keyboard: false });
            $('#LoadingImage').hide();

            //if ($('#BkTabul li.active').text() == 'Pending') {
            $('.panel-body').css('height', '500');
            $('#divQueryHistory').removeClass('col-md-12');
            $('#divQueryHistory').addClass('col-md-7');
            //}
            //else if ($('#BkTabul li.active').text() == 'Resolved') {
            //    $('.panel-body').css('height', '520');
            //    $('#divQueryHistory').removeClass('col-md-7');
            //    $('#divQueryHistory').addClass('col-md-12');
            //}

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

function SendChatData(zQueryID) {
    $('#LoadingImage').show();
    //var getFileList = [];
    //getFileList = GetTableRowToList('tblAddAttachment');
    var data = {
        zQueryID: zQueryID,
        zResponse: $('#txtResponse').val()
        //zTime: time,
        //FileListL: getFileList

    }
    $.ajax({
        type: 'post',
        url: $('#hf_AddResponse').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            $.bootstrapGrowl(response, {
                type: 'info',
                delay: 5000,
            });

            $('#LoadingImage').hide();
            $('#txtResponse').val('');
        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
            $('#LoadingImage').hide();
            $('#txtResponse').val('');
        }
    });
    $("#myModal_Chat").modal('hide');
}

function AddQueryInfo() {

    $('#txtSubject').val('');
    $('#txtQuery').val('');

    $('#LoadingImage').show();
    var data = { Catalog: "" };
    $.ajax({
        type: 'post',
        url: $('#hf_GetCatalogbyUser').val(),
        data: data,
        datatype: 'json',
        success: function (response) {

            var items = response.Catalogitems;
            $("#ddlAddCatalog").empty();
            var selectCat = "";
            for (var i = 0; i < items.length; i++) {

                if (i == 0) {
                    selectCat = items[i].Text;
                }
                $("#ddlAddCatalog").append("<option value='" + items[i].Text + "'>" + items[i].Text + "</option>");
            }
            if (selectCat != '')
                $("#ddlAddCatalog").val(selectCat).change();
            items = response.Chapteritems;
            $("#ddlAddChapter").empty();
            for (var i = 0; i < items.length; i++) {

                $("#ddlAddChapter").append("<option value='" + items[i].Text + "'>" + items[i].Text + "</option>");
            }
            if (selectCat != '')
                $("#ddlAddCatalog").val(selectCat).change();
            var items1 = response.TempList;
            $("#ddltemplate").empty();
            for (var i = 0; i < items1.length; i++) {

                $("#ddltemplate").append("<option value='" + items1[i].Text + "'>" + items1[i].Text + "</option>");
            }
            $('#ddltemplate').val(null).change();
            $('#LoadingImage').hide();
            DetailsViewEvent();
            $("#myModal_Add").modal({ backdrop: 'static', keyboard: false });
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

$(function () {
    $('#btnQueryReply').click(function () {
        if ($('#txtResponse').val() == '') {
            $.bootstrapGrowl('Please enter response !', {
                type: 'danger',
                delay: 5000,
            });
            $('#txtResponse').focus();
            return false;
        }
        if ($('#btnQueryReply').html() == 'Reopen') {
            bootbox.confirm("Are you sure to repone the Query?",
                function (result) {
                    if (result) {
                        QueryReponse('false', 'true');
                    }
                });
        }
        else
            QueryReponse('false');

    });
    $('#btnResolved').click(function () {
        if ($('#txtResponse').val() == '') {
            $.bootstrapGrowl('Please enter final response !', {
                type: 'danger',
                delay: 5000,
            });
            $('#txtResponse').focus();
            return false;
        }

        bootbox.confirm("Are you sure to resolve the Query?",
            function (result) {
                if (result) {
                    QueryReponse('true');
                }
            });
    });

    $('#BkTabul li').click(function () {
        if ($(this).text() == 'Resolved')
            $('#btnQueryReply').html('Reopen');
        else
            $('#btnQueryReply').html('Reply');

        CallQueryListBk('true', $(this).text(), '', '', '');
        DetailsViewEvent();
    });



});

function QueryReponse(aIsFinalP, aIsReopenP) {
    if (aIsReopenP == null)
        aIsReopenP = 'false';

    $('#LoadingImage').show();
    $("#myModal_Chat").modal('hide');
    if (window.FormData !== undefined) {
        var fileUpload = $("#FResponse").get(0);
        var files = fileUpload.files;
        // Create FormData object
        var fileData = new FormData();
        // Looping over all files and add it to FormData object
        for (var i = 0; i < files.length; i++) {
            fileData.append(files[i].name, files[i]);
        }
        // Adding FolderName as key to FormData object
        fileData.append('Catalog', aCatalog);
        fileData.append('QueryID', aQueryIDG);
        fileData.append('Time', time);
        var zResponse = $('#txtResponse').val();
        zResponse = zResponse.replace(/</g, '**');
        zResponse = zResponse.replace(/>/g, '||');

        fileData.append('QueryResponse', zResponse);

        fileData.append('Final', aIsFinalP);
        fileData.append('Reopen', aIsReopenP);

        $.ajax({
            url: $('#hf_QueryResponse').val(),
            type: "POST",
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            data: fileData,
            success: function (result) {

                $("#FResponse").val(null);
                $('#txtResponse').val('');
                $('#myModal_Chat .jqte_editor').html('');
                $('#LoadingImage').hide();

                if (aIsFinalP == 'true' || aIsReopenP == 'true') {
                    if (aIsReopenP == 'true') {
                        $.bootstrapGrowl('Query Reopen successfully updated...', {
                            type: 'info',
                            delay: 5000,
                        });
                    }
                    else {
                        $.bootstrapGrowl('Query Resolved successfully updated...', {
                            type: 'info',
                            delay: 5000,
                        });
                    }
                    CallQueryListBk('true', $('#BkTabul li.active').text(), '', '', '');
                    DetailsViewEvent();
                    $("#myModal_Chat").modal('hide');
                }
                else {
                    $.bootstrapGrowl('Query Response successfully added..', {
                        type: 'info',
                        delay: 5000,
                    });
                    if (aShowResolved == 1) {
                        $('#btnResolved').show();
                    }
                    GetChatData(aEditListG);
                }

            }
        });
    }
    else {
        $.bootstrapGrowl("FormData is not supported.", {
            type: 'danger',
            delay: 2000,
        });
        $('#LoadingImage').hide();
    }
}

function CallQueryListBk(zFirstLoad, zType, zNumberList, zCatalogList, zISBNList) {
    //var table = $('#tblQueryBk').DataTable();
    //table.clear();
    $('#LoadingImage').show();
    var zCatList = 'All';
    var zNumList = 'All';
    var zISList = 'All';

    if (zNumberList != '')
        zNumList = zNumberList;
    if (zCatalogList != '')
        zCatList = zCatalogList;
    if (zISBNList != '')
        zISList = zISBNList;

    var data = {
        FirstLoad: zFirstLoad,
        Type: zType,
        CatalogList: zCatList,
        NumList: zNumList,
        ISBNList: zISList
    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetQueryListBk').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechQueryData(response.aItemList, response.aList);
            if (zFirstLoad == 'true') {
                var items = response.Catalogitems;
                if (items != null) {
                    if ($("#lstCatalogList").find('option').length == 0) {
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].Text != null && items[i].Text != '')
                                $("#lstCatalogList").append("<option value='" + items[i].Text + "'>" + items[i].Text + "</option>");
                        }
                    }
                }

                items = response.ISBNitems;
                if (items != null) {
                    if ($("#lstISBNList").find('option').length == 0) {
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].Text != null && items[i].Text != '')
                                $("#lstISBNList").append("<option value='" + items[i].Text + "'>" + items[i].Text + "</option>");
                        }
                    }
                }

                items = response.Numberitems;
                if (items != null) {
                    if ($("#lstNumberList").find('option').length == 0) {
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].Text != null && items[i].Text != '')
                                $("#lstNumberList").append("<option value='" + items[i].Text + "'>" + items[i].Text + "</option>");
                        }
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

var dataSetChild = [];
var countList;

function FetechQueryData(ItemsList, List) {
    try {
        dataSet = [];
        dataSetChild = [];
        var items = ItemsList;
        countList = List;
        var zCtInP = 0;
        var zCtCom = 0;
        var zBookShelfList = '';
        var aPrevBkNo = '';
        $.each(items, function (index) {
            var zindexL = 0;
            zCtInP += 1;
            zindexL = zCtInP;
            var noOfQueries = countList.find(x => x.Key === $(this)[0]["Catalog"]).Value;
            var t = [
                zindexL.toString(),
                $(this)[0]["Number"],
                noOfQueries,
                $(this)[0]["Catalog"],
                $(this)[0]["Title"],
                $(this)[0]["ISBN"],
                $(this)[0]["PEName"],
                $(this)[0]["PMName"],

                $(this)[0]["QueryDate"],
                $(this)[0]["QuerySubject"],
                $(this)[0]["RaisedBY"],
                $(this)[0]["Priority"],
                "'" + $(this)[0]["ID"] + "|" + $(this)[0]["Catalog"] + "|" + $(this)[0]["RaisedBY"] + "'",
                $(this)[0]["LastReplyUserID"],
                $(this)[0]["ID"]
            ];
            if (aPrevBkNo != $(this)[0]["Number"])
                dataSet.push(t);
            aPrevBkNo = $(this)[0]["Number"];
            dataSetChild.push(t);
        });

        LoadDetailsList();
    } catch (e) {
        $('#LoadingImage').hide();
    }
}

function format(d) {
    var zCtInP = 0;
    var zhtml = '<table class="tblChild" width="100%" cellpadding="1" cellspacing="0" border="0" style="padding-left:50px;">' +
        '<tr><th>Query No</th><th>Query Subject</th><th>Raised By</th><th>Raised Date</th><th>Priority</th></tr>';
    //<th class="hide">a</th>//<th><center>Action</center></th>
    $.each(dataSetChild, function (e, val) {
        if (d[1] == val[1]) {
            zCtInP += 1;
            var zAction = '';
            if ($('#BkTabul li.active').text() == 'Resolved')
                zAction = '<span class=spInfo><i class="fa fa-info-circle" aria-hidden="true" title="Info" data-col="Name" onclick="GetChatData(' + isNullCheck(val[12]) + ');"></i></span>';
            else
                zAction = '<span class=spUpdateIcon style=display:none><i class="fa fa-pen" aria-hidden="true" title="Edit" data-col="Name" onclick="GetChatData(' + isNullCheck(val[12]) + ');"></i></span>';
            if ($('#hf_UserID').val() != val[13])
                zhtml += '<tr class="trBold onCursor" onclick="QueryDetails(' + val[12] + ')" id="trQuery_' + val[14] + '">';
            else
                zhtml += '<tr class="onCursor" onclick="QueryDetails(' + val[12] + ')" id="trQuery_' + val[14] + '">';

            zhtml += '<td>' + zCtInP + '</td>' +
                '<td>' + val[9] + '</td>' +
                //'<td><a href="javascript:void(0)" onclick="QueryDetails(' + val[14] + ')">' + val[9] + '</a></td>' +
                '<td>' + val[10] + '</td>' +
                '<td>' + FormatDateColumn(val[8]) + '</td>' +
                '<td>' + val[11] + '</td>' +
                //'<td>' + zAction + '</td>' +
                '</tr>';
        }
    });
    zhtml += '</table>';
    return zhtml;
}

function QueryDetails(zID) {
    var tt = zID;
    var Id = zID.split('|')[0];
    var Catalog = zID.split('|')[1];
    var aRaisedBY = zID.split('|')[2];

    tt = "'" + Id + "|" + Catalog + "|" + aRaisedBY + "'";
    var data = { QueryID: Id };

    $.ajax({
        type: 'post',
        url: $('#hf_GetQueryDetails').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            $('#divQueryInfo').html('');
            $('#trQuery_' + Id).addClass('changeColor');

            var items = response.aQueryItemList;
            $('#querySubject').html("Query Details : " + items[0].QuerySubject);
            var ztable='<div class="row"><div class="col-sm-12">';
            ztable = '<table class="table table-striped table-bordered"><thead>';
            ztable += '<tr><th>User Name</th><th class="hide">Query Subject</th><th>Query</th><th>Date & Time</th><th>Attachment</th></tr></thead>';
            ztable += '<tbody>';
            for (var i = 0; i < items.length; i++) {
                ztable += '<tr><td>' + items[i].RoleName + " : " + items[i].LoginName + '</td><td class="hide">' + items[i].QuerySubject + '</td><td>' + items[i].QueryResponse;
                ztable += '</td><td>' + moment(items[i].UpdatedDate).format("DD MMM YYYY hh:mmA") + '</td>';
                if (items[i].Attachment != '') {
                    ztable += '<td><a class="fa fa-paperclip" href="' + items[i].Attachment + '" download /></td>';
                } else {
                    ztable += '<td>-</td></tr>';
                }
            }

            ztable += '</tbody></table></div></div>';
            
            if ($('#BkTabul li.active').text() == 'Resolved') {
                ztable += '<div class="col-sm-12"><input type="button" class="btn btn-info margin-right" onclick="GetChatData(' + isNullCheck(tt) + ');" value="Info"></div></div>';
            } else {
                ztable += '<div class="col-sm-12"><input type="button" class="btn btn-primary margin-right" onclick="GetChatData(' + isNullCheck(tt) + ');" value = "Edit"></div></div>';                
            }
            $('#divQueryInfo').html(ztable);

            $("#myModal_QueryInfo").modal({ backdrop: 'static', keyboard: false });
        }
    });
}

function LoadDetailsList() {
    table = $('#example').DataTable({
        dom: 'lBfrtip',
        data: dataSet,
        "pageLength": -1,
        "lengthMenu": [[15, 25, 50, 75, 100, -1], [15, 25, 50, 75, 100, "All"]],
        "columns": [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            { title: "Book ID" },
            { title: "No of Queries" },
            { title: "Catalog" },
            { title: "Title" },
            { title: "ISBN" },
            { title: "PE Name" },
            { title: "PM Name" },

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
                text: '<button class="btn btn-primary spAddIcon" style="display:none" title="New Query"><i class="fa fa-question-circle"></i> Add</button>',
                action: function (e, dt, node, config) {
                    $('#myModal_Add .jqte_editor').css('height', size.height - 250);
                    $('#myModal_Add .jqte_editor').html('');

                    AddQueryInfo();
                }

            },

        ],
        "order": [[1, 'asc']]
    });

    // Add event listener for opening and closing details
    DetailsViewEvent();
    CheckAccessRights();
}

function DetailsViewEvent() {
    $('#example tbody').on('click', 'td.details-control', function (e) {
        var tr = $(this).closest('tr');
        var row = table.row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            //Open this row
            row.child(format(row.data())).show();
            tr.addClass('shown');
        }

        CheckAccessRights();
    });
}

function GetQueryTemplate() {

    var aMailContent = "";
    var aSubject = "";
    var data = {
        zTemplate: $('#ddltemplate').val(),
        zCatalog: $('#ddlAddCatalog').val(),
    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetQueryTemplate').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var items = response.aitemList;
            var item_Data = response.aitemList_Data;

            aMailContent = items.MailBoady;
            aSubject = items.Subject;

            item_Data.Pm != null ? aSubject = aSubject.replace(/{PMName}/g, isNullCheck(item_Data.Pm)) : aSubject = aSubject.replace(/{PMName}/g, '{PMName}');
            item_Data.AuthorName != null ? aSubject = aSubject.replace(/{Author}/g, isNullCheck(item_Data.AuthorName)) : aSubject = aSubject.replace(/{Author}/g, '{Author}');
            item_Data.Number != null ? aSubject = aSubject.replace(/{BookNo}/g, isNullCheck(item_Data.Number)) : aSubject = aSubject.replace(/{BookNo}/g, '{BookNo}');
            item_Data.ISBN != null ? aSubject = aSubject.replace(/{ISBN}/g, isNullCheck(item_Data.ISBN)) : aSubject = aSubject.replace(/{ISBN}/g, '{ISBN}');
            item_Data.Catalog != null ? aSubject = aSubject.replace(/{Catalog}/g, isNullCheck(item_Data.Catalog)) : aSubject = aSubject.replace(/{Catalog}/g, '{Catalog}');
            $('#ddlAddChapter').val() != null ? aSubject = aSubject.replace(/{ChapterNo}/g, $('#ddlAddChapter').val()) : aSubject = aSubject.replace(/{ChapterNo}/g, '{ChapterNo}');
            item_Data.EditorName != null ? aSubject = aSubject.replace(/{Editor}/g, isNullCheck(item_Data.EditorName)) : aSubject = aSubject.replace(/{Editor}/g, '{Editor}');
            item_Data.Pe != null ? aSubject = aSubject.replace(/{ProductionEditor}/g, isNullCheck(item_Data.Pe)) : aSubject = aSubject.replace(/{ProductionEditor}/g, '{ProductionEditor}');
            item_Data.TspmName != null ? aSubject = aSubject.replace(/{TSPMName}/g, isNullCheck(item_Data.TspmName)) : aSubject = aSubject.replace(/{TSPMName}/g, '{TSPMName}');
            item_Data.Publisher != null ? aSubject = aSubject.replace(/{Publisher}/g, isNullCheck(item_Data.Publisher)) : aSubject = aSubject.replace(/{Publisher}/g, '{Publisher}');


            item_Data.Pm != null ? aMailContent = aMailContent.replace(/{PMName}/g, isNullCheck(item_Data.Pm)) : aMailContent = aMailContent.replace(/{PMName}/g, '{PMName}');
            item_Data.AuthorName != null ? aMailContent = aMailContent.replace(/{Author}/g, isNullCheck(item_Data.AuthorName)) : aMailContent = aMailContent.replace(/{Author}/g, '{Author}');
            item_Data.Number != null ? aMailContent = aMailContent.replace(/{BookNo}/g, isNullCheck(item_Data.Number)) : aMailContent = aMailContent.replace(/{BookNo}/g, '{BookNo}');
            item_Data.ISBN != null ? aMailContent = aMailContent.replace(/{ISBN}/g, isNullCheck(item_Data.ISBN)) : aMailContent = aMailContent.replace(/{ISBN}/g, '{ISBN}');
            item_Data.Catalog != null ? aMailContent = aMailContent.replace(/{Catalog}/g, isNullCheck(item_Data.Catalog)) : aMailContent = aMailContent.replace(/{Catalog}/g, '{Catalog}');
            $('#ddlAddChapter').val() != null ? aMailContent = aMailContent.replace(/{ChapterNo}/g, $('#ddlAddChapter').val()) : aMailContent = aMailContent.replace(/{ChapterNo}/g, '{ChapterNo}');
            item_Data.EditorName != null ? aMailContent = aMailContent.replace(/{Editor}/g, isNullCheck(item_Data.EditorName)) : aMailContent = aMailContent.replace(/{Editor}/g, '{Editor}');
            item_Data.Pe != null ? aMailContent = aMailContent.replace(/{ProductionEditor}/g, isNullCheck(item_Data.Pe)) : aMailContent = aMailContent.replace(/{ProductionEditor}/g, '{ProductionEditor}');
            item_Data.TspmName != null ? aMailContent = aMailContent.replace(/{TSPMName}/g, isNullCheck(item_Data.TspmName)) : aMailContent = aMailContent.replace(/{TSPMName}/g, '{TSPMName}');
            item_Data.Publisher != null ? aMailContent = aMailContent.replace(/{Publisher}/g, isNullCheck(item_Data.Publisher)) : aMailContent = aMailContent.replace(/{Publisher}/g, '{Publisher}');




            $('#txtSubject').val(aSubject);
            $('#txtQuery').val(aMailContent);
            $('#myModal_Add .jqte_editor').html(isNullCheck(aMailContent));

        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 2000,
            });

        }
    });
}