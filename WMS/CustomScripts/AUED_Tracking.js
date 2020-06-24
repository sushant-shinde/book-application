var zStageG;
$(function () {
    $('#divBookList').css('height', size.height - 150);
    LoadBookList();

    $('#btnDownload').click(function () {
        var zProodIDList = '';
        $('.chkDownload:checked').each(function () {
            zProodIDList += $(this).attr('data-id') + ',';
        });
        if (zProodIDList == '') {
            $.bootstrapGrowl('Select Chapter for Download!', {
                type: 'warning',
                delay: 5000,
            });
            return false;
        }
        DownloadProof(zProodIDList, 'Proof');
    });
    $('#btnDownload_AU').click(function () {
        var zProodIDList = '';
        $('.chkDownload_AU:checked').each(function () {
            zProodIDList += $(this).attr('data-id') + ',';
        });
        if (zProodIDList == '') {
            $.bootstrapGrowl('Select Chapter for Author Corrections Download!', {
                type: 'warning',
                delay: 5000,
            });
            return false;
        }
        DownloadProof(zProodIDList, 'Author');
    });
    $('#btnUpload').click(function () {
        var zProodIDList = '';
        $('.chkUpload:checked').each(function () {
            zProodIDList += $(this).attr('data-id') + ',';
        });
        if (zProodIDList == '') {
            $.bootstrapGrowl('Select Chapter for Upload !', {
                type: 'warning',
                delay: 5000,
            });
            return false;
        }

        $('#myModal_ViewUpLoad').modal({ backdrop: 'static', keyboard: false });
    })
    $('#FUpload').change(function () {
        if (validateFileType('#FUpload')) {
            var zProodIDList = '';
            $('.chkUpload:checked').each(function () {
                zProodIDList += $(this).attr('data-id') + ',';
            });
            if (zProodIDList == '') {
                $.bootstrapGrowl('Select Chapter for Upload !', {
                    type: 'warning',
                    delay: 5000,
                });
                return false;
            }
            FileUpload(zProodIDList);
        }
    });

    $('#btnUploadFile').click(function () {
        if ($('#tblFileList tbody tr').length == 0) {
            $.bootstrapGrowl('Kindly Select Files for Upload !', {
                type: 'warning',
                delay: 5000,
            });
            return false;
        }
        var zProodIDList = '';
        $('.chkUpload:checked').each(function () {
            zProodIDList += $(this).attr('data-id') + ',';
        });

        bootbox.confirm("Are you sure to Upload the Correction ?",
            function (result) {
                if (result) {
                    FileUploadWithZip(zProodIDList);
                }
            });
    });
    $('#btnFileClear').click(function () {
        DeleteTempFolder();
    });

    $('#myModal_ViewUpLoad').on('hidden.bs.modal', function () {
        DeleteTempFolder();
    })

    $('#btnNoCorrection').click(function () {
        var zProodIDList = '';
        $('.chkNoCorrecion:checked').each(function () {
            zProodIDList += $(this).attr('data-id') + ',';
        });
        if (zProodIDList == '') {
            $.bootstrapGrowl('Select Chapter for No Correction !', {
                type: 'warning',
                delay: 5000,
            });
            return false;
        }

        bootbox.confirm("Are you sure to No Correction ?",
            function (result) {
                if (result) {
                    UpdateNoCorrection(zProodIDList);
                }
            });
    })
});

function UpdateNoCorrection(zProodIDList) {

    $('#LoadingImage').show();
    var data = { zProofID: zProodIDList, zStageP: $('#hf_Stage').val() }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateNoCorrection').val(),
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
                $.bootstrapGrowl('No Correction Updated Successfully &#128515;', {
                    type: 'info',
                    delay: 2000,

                });
                LoadBookList();
                LoadBookChapterList(response);
            }
            $('#LoadingImage').hide();
        },
        error: function (response) {
            $.bootstrapGrowl('Error Occured, Try Again ! &#128577;', {
                type: 'danger',
                delay: 2000,
            });
            $('.FileAttach').hide();
        }
    });
}

function DeleteTempFolder() {
    var zProodIDList = '';
    $('.chkUpload:checked').each(function () {
        zProodIDList += $(this).attr('data-id') + ',';
    });
    $('#LoadingImage').show();
    var data = { zProofID: zProodIDList }
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
}

function DeleteTempFile(zitem) {

    var zProodIDList = '';
    $('.chkUpload:checked').each(function () {
        zProodIDList += $(this).attr('data-id') + ',';
    });
    $('#LoadingImage').show();
    var atrItem = $(zitem).closest('tr').find('td');

    var zFileNameP = atrItem[1].innerText;
    try {
        $('#LoadingImage').show();
        var data = { zProofID: zProodIDList, zFileName: zFileNameP }
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

function FileUpload(zProodIDList) {
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
            fileData.append('ProofID', zProodIDList);
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

//Correction Upload Function
function FileUploadWithZip(zProodIDList) {
    $('.FileAttach').show();
    var data = { zProofID: zProodIDList, zStageP: $('#hf_Stage').val() }
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
                $('.FileAttach').hide();
                return false;
            }
            else {
                $.bootstrapGrowl('Uploaded Successfully.. &#128515;', {
                    type: 'info',
                    delay: 2000,

                });
                $("#FUpload").val(null);
                $("#tblFileList > tbody").html("");
                LoadBookList();
                $('.FileAttach').hide();
                $('#myModal_ViewUpLoad').modal('hide');
                //Populate Book Chapter List
                LoadBookChapterList(response);
            }
        },
        error: function (response) {
            $.bootstrapGrowl('Error Occured, Try Again ! &#128577;', {
                type: 'danger',
                delay: 2000,
            });
            $('.FileAttach').hide();
        }
    });

}

function LoadBookList() {
    $('#LoadingImage').show();
    var data = {
        zFromDate: $('#Txt_FromDate').val(),
        zToDate: $('#Txt_ToDate').val()
    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetBookList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var zItemList = response.zBookList;
            var aStatusList = response.zBookStatusList;
            var bStatusList = response.statusList;

            var aDownloadPendingCt = null;
            var aUploadPendingCt = null;

            for (i = 1; i < aStatusList.length; i++) {
                if (aStatusList[i].DownloadDate == null) {
                    aDownloadPendingCt = aStatusList[i]
                    break;
                }
            }
            for (i = 1; i < aStatusList.length; i++) {
                if (aStatusList[i].DownloadDate == null) {
                    aUploadPendingCt = aStatusList[i];
                    break;
                }
            }
            $('#LoadingImage').hide();
            // Starting
            var zTableList = '';
            if (zItemList.length == 0) { zTableList = '<center>No Data Found</center>'; }

            $.each(zItemList, function (e, val) {
                zTableList += '<div class="DivList col-sm-12">';
                zTableList += '<table width="100%"><tr>';

                var aimgpath = val.ImgPath;
                if (aimgpath == null || aimgpath == '' || aimgpath.indexOf('../Images/Covers/') > -1) {
                    aimgpath = "../../Images/Covers/blue.png";
                }

                zTableList += ' <td width="15%"><div><img width="70%" src="' + aimgpath + '" altr="" /></div></td>';
                zTableList += '<td valign="top"><table>';
                zTableList += '<tr><td valign="top"><div class="divPadd"><h3><strong>Title : ' + isNullCheck(val.Title) + '</strong></h3></div></td></tr>';
                zTableList += '<tr><td><div class="divPadd">Catalog : ' + val.Catalog + '</div></td>';
                zTableList += '<td><div class="divPadd">ISBN : ' + val.ISBN + ' </div></td></tr>';
                zTableList += '<tr><td><div class="divPadd">Receive Date : ' + FormatDateColumn(val.ReceivedDt) + '</div></td>';
                zTableList += '<td><div class="divPadd">Due Date : ' + FormatDateColumn(val.DueDt) + '</div></td></tr>';
                zTableList += '<tr><td><div class="divPadd">Publisher : ' + isNullCheck(val.Publihser) + '</div></td>';
                zTableList += '<td><div class="divPadd">PE Name : ' + isNullCheck(val.PEName) + '</div></td></tr>';
                zTableList += '<tr><td><div class="divPadd">PM Name : ' + isNullCheck(val.PMName) + '</div></td>';
                zTableList += '<td><div class="divPadd">Stage : ' + isNullCheck(val.Stage) + '</div></td></tr>';

                for (var i = 0; i < bStatusList.length; i++) {
                    if (bStatusList[i].BookID == val.BookID)
                        zTableList += '<tr><td><div class="divPadd">Book Status : ' + bStatusList[i].Activity + '</div></td></tr>';
                }

                zTableList += '</table></td></tr>';
                if (val.Stage == 'Intro Email') {
                    zTableList += '<tr>';
                    zTableList += '<td colspan="3"><h2>Proof production is in progress</h2></td>';
                    zTableList += '</tr>';
                } else {
                    zTableList += '<tr><div class="divProofAction"><i class="fa fa-list" title="Chapter View " data-id="' + val.BookID + '" data-stage="' + val.Stage + '">';

                    zTableList += '<br><span class="spfileList">Click here to access your book(s)</span></i></div> </tr>';
                    zTableList += '<tr><div class="col-sm-12 child">';

                    if (val.AcceptDate != null) {
                        zTableList += ' <span class="col-sm-4 progress-bar-success" style="width:25%">Accept<span class="spAccept"></span></span>';
                    } else {
                        zTableList += ' <span class="col-sm-4 progress-bar-info" style="width:25%">&nbsp;</span>';
                    }

                    if (aDownloadPendingCt == null) {
                        zTableList += '<span class="col-sm-4 progress-bar-success" style="width:35%">Download<span class="spDownload"></span></span>';
                    } else {
                        zTableList += '<span class="col-sm-4 progress-bar-info" style="width:35%">&nbsp;</span>';
                    }

                    if (aUploadPendingCt == null) {
                        zTableList += '<span class="col-sm-4 progress-bar-success" style="width:40%">Upload<span class="spUpload"></span></span>';
                    } else {
                        zTableList += '<span class="col-sm-4 progress-bar-info" style="width:40%">&nbsp;</span>';
                    }
                }
                zTableList += '</table>';
                zTableList += '</div>';
            });

            $('#divBookList').html(zTableList);
            // Ending

            $('.progress').asProgress({
                'namespace': 'progress'
            });
            $('.progress').asProgress('go');


            $('div.progress-bar').each(function (i) {
                $(this).fadeOut(0).delay(200 * i).fadeIn(1850);
            });

            function count($this) {
                var current = parseInt($this.html(), 10);
                $this.html(++current);
                if (current !== $this.data('count')) {
                    setTimeout(function () { count($this) }, 50);
                }
            }
            $("span.SpPercent").each(function () {
                if ($(this).html() > 0) {
                    $(this).data('count', parseInt($(this).html(), 10));
                    $(this).html('0');

                    count($(this));
                }
            });


            $('.fa-check').click(function () {
                var aBookid = $(this).attr('data-id');
                bootbox.confirm("Are you sure Accept the Book ?",
                    function (result) {
                        if (result) {
                            BookAccept(aBookid);
                        }
                    });

            })

            $('.fa-list').click(function () {
                var aBookID = $(this).attr('data-id');
                $('#hf_Stage').val($(this).attr('data-stage'));
                LoadBookChapterList(aBookID);
            })

            // Set Progress

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

function BookAccept(aBookID) {
    $('#LoadingImage').show();
    var data = { BookID: aBookID }
    $.ajax({
        type: 'post',
        url: $('#hf_BookAccept').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            $.bootstrapGrowl('Book Accept Updated Successfully &#128515;', {
                type: 'info',
                delay: 2000,

            });
            LoadBookList();
            $('#LoadingImage').hide();
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

function LoadBookChapterList(aBookID, aStage) {
    var aStage = $('#hf_Stage').val();
    $('#LoadingImage').show();
    var data = { BookID: aBookID, zStage: aStage };
    $.ajax({
        type: 'post',
        url: $('#hf_GetBookChapterList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            $('#DivHeadingTitle').html("<strong>Chapter Details</strong>");
            var zItemList = response.zBookChapterList;
            FetechData(zItemList);
            setTimeout(function () {
                $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
            }, 200);
            // Hide Author Correction Download Option for Author Login
            $('#example_wrapper table th:nth-child(6)').show();
            $('#example_wrapper table td:nth-child(6)').show();
            if (zItemList[0].UserType.toLowerCase() == 'author' || zItemList[0].EditorCount == "0") {
                $('#btnDownload_AU').hide();
                $('#example_wrapper table th:nth-child(6)').hide();
                $('#example_wrapper table td:nth-child(6)').hide();
            }
            $('#DivHeadingTitle').html("<strong>" + aStage + " - Chapter Details</strong>");
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

var dataSet = [];
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
            var aIsDisabled = 'disabled="disabled"';
            if ($(this)[0]['CorrectionReceiveDt'] == null) {
                aIsDisabled = '';
            }
            var IsSeriesFlow = ($(this)[0]['CorrectionReceiveDt'] == null && $(this)[0]['IsAuthorNoCorrection'] == null
                && $(this)[0]['SeriesFlow'] == 1 && $(this)[0]['AuthorEditorCount'] == 0 && $(this)[0]['UserType'] != 'Author');
            if (IsSeriesFlow) {
                aIsDisabled = 'disabled="disabled"';
            }

            var zAUCorrection = '<center><input type="checkbox" class="chkDownload_AU" data-id="' + $(this)[0]["ID"] + '"/></center>';
            var zUploadCor = '<center><input type="checkbox" class="chkUpload" data-id="' + $(this)[0]["ID"] + '" ' + aIsDisabled + '/></center>';
            var zNoCorrecion = '<center><input type="checkbox" class="chkNoCorrecion" data-id="' + $(this)[0]["ID"] + '" ' + aIsDisabled + '/></center>';

            if ($(this)[0]['IsAuthorNoCorrection'] == 1) {
                zAUCorrection = '<center>No Correction</center>';
            }
            else if ($(this)[0]['CorrectionReceiveDt'] == null && $(this)[0]['IsAuthorCorrection'] == null && $(this)[0]['IsAuthorNoCorrection'] == null) {
                zAUCorrection = '<center>Author Yet to Upload</center>';
            }
            else if ($(this)[0]['IsAuthorCorrection'] != null && $(this)[0]['IsAuthorCorrection'].toString().indexOf('Manual Closing') != -1) {
                zAUCorrection = '<center>Manual Closing by PM</center>';
            }
            if (IsSeriesFlow) {
                var zUploadCor = '<center><input type="checkbox" class="chkUpload" data-id="' + $(this)[0]["ID"] + '" disabled="disabled"/></center>';
                var zNoCorrecion = '<center><input type="checkbox" class="chkNoCorrecion" data-id="' + $(this)[0]["ID"] + '" disabled="disabled"/></center>';
            }
            if ($(this)[0]['CorrectionReceiveDt'] != null && $(this)[0]['NoCorrection'] == 0) {
                zUploadCor = '<center><i class="fa fa-check" title="Correction Uploaded"></i></center>'
            }
            if ($(this)[0]['CorrectionReceiveDt'] != null && $(this)[0]['NoCorrection'] == 1) {
                zNoCorrecion = '<center><i class="fa fa-check"  title="No Corrections Uploaded"></i></center>'
            }

            //AuthorEditor Type

            if (parseInt($(this)[0]['AuthorEditorCount']) > 0) {
                zAUCorrection = '<center>Editor as author</center>';
            }
            var t = [
                zindexL,
                $(this)[0]["ChapterID"],
                $(this)[0]["ChapterTitle"],
                FormatDateColumn($(this)[0]["DueDt"]),
                '<center><input type="checkbox" class="chkDownload" data-id="' + $(this)[0]["ID"] + '"/></center>',
                zAUCorrection,
                zUploadCor,
                zNoCorrecion,
                $(this)[0]["ID"],
            ];
            dataSet.push(t);

            if ($(this)[0]['CorrectionReceiveDt'] == null) {
                $('.divActionBtn').show();
            }
        });
        LoadData();
        $('#LoadingImage').hide();
    } catch (e) {

    }
}
function LoadData() {
    var table = $('#example').DataTable({
        dom: 't',
        "pageLength": -1,
        "lengthMenu": [[15, 25, 50, 75, 100, -1], [15, 25, 50, 75, 100, "All"]],
        data: dataSet,
        columns: [
            { title: "S.No.", "bSortable": false },
            { title: "Chapter", "bSortable": false },
            { title: "Title", "bSortable": false },
            { title: "Due Date", "bSortable": false },
            { title: "<center>Download<br><input type='checkbox' class='chkDownloadAll' /></center>", "bSortable": false },
            { title: "<center>Download <br>Author Correction<br><input type='checkbox' class='chkDownloadAU_All' /></center>", "bSortable": false },
            { title: "<center>Upload <br><input type='checkbox' class='chkUploadAll' /></center>", "bSortable": false },
            { title: "<center>No Correction <br><input type='checkbox' class='chkNoCorrectionAll' /></center>", "bSortable": false },
        ],
        "createdRow": function (row, data, dataIndex) {
            $($(row).find('td')[0]).attr('id', data[7]);//ProofID
        },
        "destroy": true,
        "scrollY": (size.height - 260),
        "scrollX": true,

    });
    $('#LoadingImage').hide();
    $('#myModal_View').modal({ backdrop: 'static', keyboard: false });

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
    $('.chkNoCorrectionAll').change(function () {
        if ($(this).is(':checked'))
            $('.chkNoCorrecion').not('[disabled="disabled"]').prop('checked', 'checked');
        else
            $('.chkNoCorrecion').not('[disabled="disabled"]').removeAttr('checked');
    });

    //Author Correction Download 
    $('.chkDownloadAU_All').change(function () {
        if ($(this).is(':checked'))
            $('.chkDownload_AU').not('[disabled="disabled"]').prop('checked', 'checked');
        else
            $('.chkDownload_AU').not('[disabled="disabled"]').removeAttr('checked');
    });
}

function DownloadProof(zProodIDList, zType) {
    zProodIDList = zProodIDList.replace(/,\s*$/, "");
    window.location = $('#hf_DownloadProofFile').val() + '?zProofID=' + zProodIDList + '&zType=' + zType;
}