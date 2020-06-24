var aInstructionID = 0;
$(function () {
    $('#txtInstruction').jqte();
    $("#ddlChapter_Instruction").select2({ placeholder: "Select", closeOnSelect: false, allowClear: true, tags: true }); $("#ddlChapter_Instruction").val(-1).change();
    $("#ddlBookID_Instruction").select2({ placeholder: "Select", allowClear: true }); $("#ddlBookID_Instruction").val(-1).change();
    $("#ddlInstType_Instruction").select2({ placeholder: "Select", closeOnSelect: false, allowClear: true }); $("#ddlInstType_Instruction").val(-1).change();

    $('#ddlBookID_Instruction').change(function () {

        $("#ddlChapter_Instruction").empty();
        if ($(this).val() == null)
            return true;
        var data = { zBookID: $(this).val() };
        $.ajax({
            type: 'get',
            url: $('#hf_GetChapterList').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var items = response.Numberitems;

                $("#ddlChapter_Instruction").empty();
                for (var i = 0; i < items.length; i++) {

                    $("#ddlChapter_Instruction").append("<option value='" + items[i].Value + "'>" + items[i].Text + "</option>");
                }

                //if (nChapterIDG != null && nBookIDG == $('#ddlBookID_Instruction').val()) {
                //    var zChapterList = nChapterIDG;
                //    try {
                //        var data = zChapterList.split(',');
                //        var selectedValues = new Array();
                //        try {
                //            for (var i = 0; i < data.length; i++) {
                //                selectedValues[i] = data[i];
                //            }
                //        } catch (e) { }

                //        $('#ddlChapter_Instruction').val(selectedValues).change();

                //    } catch (e) {
                //        $('#ddlChapter_Instruction').val(-1).change();
                //    }
                //}
                //else {
                //    nBookIDG = null;
                //    nChapterIDG = null;

                //    $("#ddlChapter_Instruction").val(-1).change();
                //}

                if (aChapterListG != null) {
                    $("#ddlChapter_Instruction").val(aChapterListG).change();
                }



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
    });

    CallInstList();

    $("#btnSave_Instruction").click(function () {
        var validate = CheckValidateData();
        if (validate) {


        }
    })
});

function CheckValidateData() {
    var zResult = true;
    if ($('#ddlBookID_Instruction').val() == null) {
        $.bootstrapGrowl("Select Book ID!", { type: 'danger', delay: 2000, });
        $('#ddlBookID_Instruction').focus();
        zResult = false;
    }
    else if ($('#txtInstruction').val() == "" && $('#myModal_Instruction .jqte_editor').html() == '') {
        $.bootstrapGrowl("Enter Instruction !", { type: 'danger', delay: 2000, });
        $('#txtInstruction').focus();
        zResult = false;
    }
    else {
        var data = {
            zBookID: $('#ddlBookID_Instruction').val(),
            zchapterno: $('#ddlChapter_Instruction').val(),
            zIntructionTo: $('#ddlInstType_Instruction').val(),
            zIntruction: $('#myModal_Instruction .jqte_editor').html()
        };
        $.ajax({
            type: 'get',
            url: $('#hf_CheckExistingData').val(),
            data: data,
            datatype: 'json',
            allowHtml: true,
            success: function (response) {
                if (response.length > 0) {
                    zResult = false;
                    $.bootstrapGrowl('Already found !', {
                        type: 'danger',
                        delay: 5000,
                    });
                    $('#txtInstruction').val('');
                }
                else {
                    AddInstruction();
                }

            },
            error: function (result) {
                zResult = false;
                $.bootstrapGrowl('Error Occured, Try Again.. !', {
                    type: 'danger',
                    delay: 5000,
                });
            }
        });
    }

}

function AddInstruction() {

    var aitemInfoP = {
        Inst_ID: aInstructionID,
        BookID: ($('#ddlBookID_Instruction').val() == null ? null : $('#ddlBookID_Instruction').val().toString()),
        ChapterNo: ($('#ddlChapter_Instruction').val() == null ? null : $('#ddlChapter_Instruction').val().toString()),
        Instruction_Type: ($('#ddlInstType_Instruction').val() == null ? null : $('#ddlInstType_Instruction').val().toString()),
        Instruction: $("#txtInstruction").val(),



    }
    $.ajax({
        type: 'post',
        url: $('#hf_AddInstruction').val(),
        data: JSON.stringify(aitemInfoP),
        contentType: 'application/json;charset=utf-8',
        datatype: 'json',
        success: function (response) {
            $.bootstrapGrowl('Details Submitted!', {
                type: 'info',
                delay: 5000,
            });
            ClearInstData();
            CallInstList();
            $('#myModal_Instruction').modal('hide');

        },

        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
        }
    });

}

function CallInstList() {
    $('#LoadingImage').show();


    $.ajax({
        type: 'post',
        url: $('#hf_PopulateInstructionData').val(),
        data: JSON.stringify(),
        datatype: 'json',
        success: function (response) {

            FetechInstData(response.aitemList);

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

function FetechInstData(ItemsList) {
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
                zindexL.toString(),
                $(this)[0]["Publisher"],
                $(this)[0]["Number"],
                $(this)[0]["Catalog"],
                $(this)[0]["PEName"],
                $(this)[0]["ChapterNo"],
                $(this)[0]["Instruction_Type"],
                $(this)[0]["Instruction"],
                //$(this)[0]["LoginName"],
                FormatDateColumn($(this)[0]["CreatedTime"]),
                $(this)[0]["Inst_ID"]
            ];
            dataSet.push(t);
        });
        LoadDataInst();
        $('.imgLoader').hide();
    } catch (e) {

    }
}

function LoadDataInst() {

    var table = $('#Instruction').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[15, 25, 50, 75, 100, -1], [15, 25, 50, 75, 100, "All"]],
        data: dataSet,
        columns: [
            //{ title: "S.No.", width: "20" },
            { title: "S.No" },
            {
                title: "Publisher", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Book ID", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Catalog", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "PE Name", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Chapter No", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? 'All' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Instruction To", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spDescription">' + (isNullCheck(data) == '' ? 'All' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Instruction", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spDescription">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            //{
            //    title: "LoginName", "bSortable": false, "render": function (data, type, full, meta) {
            //        return '<span class="spDescription">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
            //    }
            //},
            { title: "Created Date" },
            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class=spDeleteIcon><i class="fa fa-trash" aria-hidden="true" title="Delete" data-col="Name" onclick="DeleteInstData(' + isNullCheck(data) + ');"></i></span>' +
                        '<span class=spUpdateIcon><i class="fa fa-pen" aria-hidden="true" title="Edit" data-col="Name" onclick="UpdateInstInfo(' + isNullCheck(data) + ');"></i></span>';
                }
            }


        ],
        columnDefs: [
            { type: 'date-dd-mmm-yyyy', targets: [4] }
        ],
        "destroy": true,
        //"order": [[9, 'asc']],
        //fixedHeader: {
        //    header: true
        //},
        "scrollY": (size.height - 180),
        "scrollX": true,
        "createdRow": function (row, data, dataIndex) {
            $($(row).find('td')[4]).attr('data-id', data[6]);//PublisherID
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
                text: '<button class="btn btn-primary spAddIcon" style="display:none"><i class="fa fa-handshake"></i> Add</button>',

                action: function (e, dt, node, config) {
                    clearForm('#divInstruction');
                    aInstructionID = 0;
                    aChapterListG = null;
                    $('#myModal_Instruction .jqte_editor').html('');
                    $("#ddlBookID_Instruction").prop("disabled", false);
                    $("#myModal_Instruction").modal({ backdrop: 'static', keyboard: false });
                }

            },
        ]
    });
    CheckAccessRights();
}

function UpdateInstInfo(aID) {
    aInstructionID = aID;

    InstructionDetails(aID);
    $('#myModal_Instruction').modal({ backdrop: 'static', keyboard: false });
}




function InstructionDetails(zitem) {
    if (zitem == null || zitem == 0) {
        clearForm('#divInstruction');
    }
    else {
        clearForm('#divInstruction');

        var data = { aInstID: zitem }
        $.ajax({
            type: 'post',
            url: $('#hf_PopulateInstructionByID').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var items = response.aitemList;


                if ($('#ddlBookID_Instruction').val(items.BookID) != null) {
                    $("#ddlBookID_Instruction").prop("disabled", true);
                }
                $('#ddlBookID_Instruction').val(items.BookID).change();
                $('#txtInstruction').val(items.Instruction);
                $('#myModal_Instruction .jqte_editor').html(isNullCheck(items.Instruction));

                debugger;
                zchapterList = null;
                try {
                    var data = items.ChapterNo.split(',');
                    var selectedValues = new Array();
                    try {
                        for (var i = 0; i < data.length; i++) {
                            selectedValues[i] = data[i];
                        }
                    } catch (e) { }

                    zchapterList = selectedValues;
                    $('#ddlChapter_Instruction').val(selectedValues).change();

                    aChapterListG = selectedValues;

                } catch (e) {

                }

                zList = null;
                try {
                    var data = items.Instruction_Type.split(',');
                    var selectedValues = new Array();
                    try {
                        for (var i = 0; i < data.length; i++) {
                            selectedValues[i] = data[i];
                        }
                    } catch (e) { }

                    zList = selectedValues;
                    $('#ddlInstType_Instruction').val(selectedValues).change();

                } catch (e) {

                }



                $('#LoadingImage').hide();

            },
            error: function (response) {
                $.bootstrapGrowl(response + '...&#128528', {
                    type: 'danger',
                    delay: 8000,
                });
                $('#LoadingImage').hide();
            }
        });
    }



}

function DeleteInstData(ID) {

    bootbox.confirm("Are you sure to Delete ?",
        function (result) {
            if (result) {

                deleteInstruction(ID);

            }
        });

}

function deleteInstruction(aid) {
    $('#LoadingImage').show();
    var data = { nID: aid }
    $.ajax({
        type: 'post',
        url: $('#hf_DeleteInstruction').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            $.bootstrapGrowl(response, {
                type: 'info',
                delay: 5000,
            });
            CallInstList();
            $('#LoadingImage').hide();
        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
            $('#LoadingImage').hide();
        }
    });
}

function ClearInstData() {
    $('#ddlBookID_Instruction').val(null).change();
    $('#ddlChapter_Instruction').val(null).change();
    $('#ddlInstType_Instruction').val(null).change();
    $('#txtInstruction').val('');
    $('#myModal_Instruction .jqte_editor').html('');
}