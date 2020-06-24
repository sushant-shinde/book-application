$(function () {
    $("#Txt_MinDays,#Txt_MaxDays").change(function (e) {
        if (!ValidateMinMax()) {
            $(this).val('');
        }
    });

    $('#myModal_WorkFlow .modal-body').css('height', size.height - 150);
    $('#lstPublisherList').select2({
        closeOnSelect: false,
        placeholder: "Select Publisher",

    });
    $('#lstPublisherList').val(null).trigger("change");
    //$('#Txt_Description').css('height', size.height - 350);
    CallDataList();
    $("#spAddActivity").click(function () {
        AddActivityRow();
    });
    $('#btnWF').click(function () {
        var zTotal = parseFloat($('#PercentageTotal').html());
        if (zTotal != 100) {
            $.bootstrapGrowl('Total % should be 100!', {
                type: 'danger',
                delay: 5000,
            });
        }
        else {
            UpdateWorkFlow();
        }
    });

});

function ValidateMinMax() {
    if (parseInt($('#Txt_MinDays').val()) > parseInt($('#Txt_MaxDays').val())) {
        $.bootstrapGrowl('Minimum Day should less then Maximum !', {
            type: 'danger',
            delay: 5000,
        });
        return false;
    }
    else
        return true;
}

var dataSet = [];
var aActivityListG;
function CallDataList() {
    $('#LoadingImage').show();
    var data;
    $.ajax({
        type: 'post',
        url: $('#hf_GetWorkFlowList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechData(response.aItemList);
            aActivityListG = response.aActivityList;
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
            var t = [
                zCtInP,
                $(this)[0]["WorkFlowName"],
                $(this)[0]["MinDays"],
                $(this)[0]["MaxDays"],
                $(this)[0]["Publishers"],
                $(this)[0]["Description"],
                $(this)[0]["PublisherList"],
                $(this)[0]["ID"]
            ];
            dataSet.push(t);
        });
        LoadData();
        $('.imgLoader').hide();
    } catch (e) {

    }
}
function LoadData() {
    var table = $('#example').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[15, 25, 50, 75, 100, -1], [15, 25, 50, 75, 100, "All"]],
        data: dataSet,
        columns: [
            { title: "S.No.", width: "20" },
            { title: "Workflow" },
            {
                title: "Min.Days", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Max.Days", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spRight">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Publishers", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spDescription">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },
            {
                title: "Description", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class="spCol" title="' + isNullCheck(data) + '">' + (isNullCheck(data) == '' ? '--' : isNullCheck(data)) + '</span>';
                }
            },

            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<span class=spDeleteIcon style="display:none"><i class="fa fa-trash" aria-hidden="true" title="Delete" data-col="Name" onclick="DeleteWorkFlowIcon(this);"></i></span>' +
                        '<span class=spUpdateIcon style="display:none"><i class="fa fa-pen" aria-hidden="true" title="Edit" data-col="Name" onclick="WorkFlowMaster(this);"></i></span>';
                }
            }
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
                text: '<button class="btn btn-primary spAddIcon" style="display:none"><i class="fa fa-building"></i> Add</button>',
                action: function (e, dt, node, config) {
                    WorkFlowMaster(0);
                }

            },
        ]
    });
    CheckAccessRights();
}


function WorkFlowMaster(aitem) {
    $('#LoadingImage').show();
    if (aitem == 0) {
        $('#Txt_WorkFlow').val('');
        $('#Txt_MinDays').val('');
        $('#Txt_MaxDays').val('');
        $('#Txt_Description').val('');
        $('#lstPublisherList').val(-1).change();
        var ztable = "<table id='tblWFList' class='tblTrans'><thead><tr><th>S.No.</th><th>Activity</th><th>Parallel</th><th>%</th><th>Milestone</th><th>#</th></tr></thead><tbody></tbody></table>";
        $('#DivActivityList').html(ztable);
        $('#LoadingImage').hide();
        $('#PercentageTotal').html(0);
    }
    else {
        var aWFId = $(aitem).closest('tr').find('td')[1].innerText;
        var data = { nWorkFlowNameP: aWFId };
        $.ajax({
            type: 'post',
            url: $('#hf_GetWorkFlowMaster').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var items = response.aitemList;
                var ztable = "<table id='tblWFList' class='tblTrans'><thead><tr><th>S.No.</th><th>Activity</th><th>Parallel</th><th>%</th><th>Milestone</th><th>#</th></tr></thead>";
                var aPercentageTotal = 0;
                for (var i = 0; i < items.length; i++) {
                    ztable += "<tr>";
                    ztable += "<td width='50px;'>" + (i + 1).toString() + "</td>";
                    ztable += "<td width='150px;' data-id='" + items[i].ActivityID + "'>" + items[i].Activity + "</span></td>";
                    if (items[i].ParallelID != null) {
                        ztable += "<td width='60px;'><input type='checkbox' class='chkParallel' checked='checked' /></td>";
                        ztable += "<td width='50px;' data-id='" + items[i].ActivityID + "'><input type='text' class='TxtPercentage' value='" + items[i].Percentage + "' disabled='disabled' /></td>";
                    }
                    else {
                        ztable += "<td width='60px;'><input type='checkbox' class='chkParallel' " + (i == 0 ? 'disabled="disabled"' : '') + " /></td>";
                        ztable += "<td width='50px;' data-id='" + items[i].ActivityID + "'><input type='text' class='TxtPercentage' value='" + items[i].Percentage + "' /></td>";
                    }


                    if (items[i].Milestone == 1)
                        ztable += "<td width='50px;'><input type='checkbox' class='chkMilestone' checked='checked' /></td>";
                    else
                        ztable += "<td width='60px;'><input type='checkbox' class='chkMilestone' /></td>";
                    ztable += "<td width='50px;' style='text-align: center'><i class='fas fa-trash' onclick='ActivityDelete(this);'></i></td>";
                    ztable += "</tr>";
                    aPercentageTotal += parseFloat(items[i].Percentage);
                }

                ztable += '</table>';
                $('#PercentageTotal').html(aPercentageTotal);
                $('#DivActivityList').html(ztable);
                CheckNumericVal();
                $('#DivActivityList').css('height', size.height - 190);
                $('#tblWFList').css('cursor', 'move');
                //*************************************************//
                //Sorting Issue Task Table Function//
                $('#tblWFList tbody').sortable({
                    update: function (event, ui) {
                        $(this).children().each(function (index) {
                            if (index == 0) {
                                $(this).find('td .chkParallel').attr("disabled", "disabled");
                                $(this).find('td .chkParallel').removeAttr("checked");
                                $(this).find('td .TxtPercentage').removeAttr("disabled");
                            }
                            else
                                $(this).find('td .chkParallel').removeAttr("disabled");
                            $(this).find('td').first().html(index + 1);
                        });
                    },

                });
                //Sorting Issue Task Table Function//
                //*************************************************//

                $('.TxtPercentage').change(function () {
                    CalculatePercentage();
                    var aitem = this;
                    var zTotal = parseFloat($('#PercentageTotal').html());
                    if (zTotal > 100) {
                        $.bootstrapGrowl('Total % should be 100!', {
                            type: 'danger',
                            delay: 5000,
                        });
                        $(aitem).val(0);
                        CalculatePercentage();
                    }

                });

                $('.chkParallel').change(function () {
                    if ($(this)[0].checked) {
                        $(this).closest('tr').find('td .TxtPercentage').val(0);
                        $(this).closest('tr').find('td .TxtPercentage').attr('disabled', 'disabled');
                    }
                    else {
                        $(this).closest('tr').find('td .TxtPercentage').removeAttr('disabled');
                    }
                    CalculatePercentage();
                });

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

        $('#Txt_WorkFlow').val($(aitem).closest('tr').find('td')[1].innerText);
        $('#Txt_MinDays').val($(aitem).closest('tr').find('td')[2].innerText.replace('--', ''));
        $('#Txt_MaxDays').val($(aitem).closest('tr').find('td')[3].innerText.replace('--', ''));

        //Populate Publisher List
        var zPublisherList = $($(aitem).closest('tr').find('td')[4]).attr('data-id');
        try {
            var data = zPublisherList.split(',');
            var selectedValues = new Array();
            try {
                for (var i = 0; i < data.length; i++) {
                    selectedValues[i] = data[i];
                }
            } catch (e) { }

            $('#lstPublisherList').val(selectedValues).change();

        } catch (e) {
            $('#lstPublisherList').val(-1).change();
        }

        $('#Txt_Description').val($(aitem).closest('tr').find('td')[5].innerText.replace('--', ''));

    }
    $('#myModal_WorkFlow').modal({ backdrop: 'static', keyboard: false });
}
function SetPercentage(aitemL) {
    var txtbox = $(aitemL).closest('tr');
    var zChkVal = true;
    $.each($("#tblWFList tbody tr"), function (e) {
        var zPreVal = $(this).find('td')[1].innerText;
        if ($(this).find('td').find('select').length > 0 && (e != $("#tblWFList tbody tr").length - 1)) {
            zPreVal = $(this).find('td').find('select').val();
        }
        if (zPreVal == $(aitemL).val()) {
            $.bootstrapGrowl('Already Activity Added!', {
                type: 'danger',
                delay: 5000,
            });
            zChkVal = false;
            return false;
        }
    });
    if (zChkVal) {
        $(txtbox).find('.TxtPercentage').val($(aitemL).find(':selected').attr('data-id'));
        CalculatePercentage();
        if (parseInt($('#PercentageTotal').html()) > 100) {
            $.bootstrapGrowl('Total % should be 100!', {
                type: 'danger',
                delay: 5000,
            });
            $(txtbox).find('.TxtPercentage').val(0);
            CalculatePercentage();
        }
    }
    else {
        $(aitemL).val(-1).change();
    }
}
function AddActivityRow() {
    if (!Validate())
        return false;
    var zActList = '<select class="txtactivity" style="width:120px;" onchange="SetPercentage(this)">';
    $.each(aActivityListG, function (e, val) {
        zActList += '<option style="width:120px;" value="' + val.Activity + '" data-id="' + val.Percentage + '">' + val.Activity + '</option>';
    })
    zActList += '</select>';

    var zRowLenth = $("#tblWFList").find("tr").length;
    var nRowL = "<tr><td>" + zRowLenth.toString() + "</td>"
        + "<td width='50%'>" + zActList + "</td>"
        + "<td><input type='checkbox' class='chkParallel' " + (zRowLenth == 1 ? 'disabled="disabled"' : '') + " /></td>"
        + "<td><input type='text' class='TxtPercentage' value='0' /></td>"
        + "<td><input type='checkbox' class='chkMilestone' /></td>"
        + "<td style='text-align: center'><i class='fas fa-trash' onclick='ActivityDelete(this);'></i></td>"
        + "</tr>";
    $("#tblWFList tbody").append(nRowL);
    CheckNumericVal();
    var alastbefore = $("#tblWFList").find("tr:nth-last-child(2)");
    if ($(alastbefore).find('select').val() != "")
        $($(alastbefore).find('select')[0]).attr('disabled', 'disabled');

    var alasttr = $("#tblWFList").find("tr:nth-last-child(1)");
    $(alasttr).find('select.txtactivity').select2({
        placeholder: "Select",
        allowClear: true, tags: true,
        dropdownParent: $('#myModal_WorkFlow')
    });
    $(alasttr).find('select').val(-1).change();

    //*************************************************//
    //Sorting Issue Task Table Function//
    $('#tblWFList tbody').sortable({
        update: function (event, ui) {
            $(this).children().each(function (index) {
                if (index == 0) {
                    $(this).find('td .chkParallel').attr("disabled", "disabled");
                    $(this).find('td .chkParallel').removeAttr("checked");
                    $(this).find('td .TxtPercentage').removeAttr("disabled");
                }
                else
                    $(this).find('td .chkParallel').removeAttr("disabled");
                $(this).find('td').first().html(index + 1);
            });
        },

    });
    //Sorting Issue Task Table Function//
    //*************************************************//

    $('.TxtPercentage').change(function () {
        CalculatePercentage();
        var aitem = this;
        var zTotal = parseFloat($('#PercentageTotal').html());
        if (zTotal > 100) {
            $.bootstrapGrowl('Total % should be 100!', {
                type: 'danger',
                delay: 5000,
            });
            $(aitem).val(0);
            CalculatePercentage();
        }
    })
    $('.chkParallel').change(function () {
        if ($(this)[0].checked) {
            $(this).closest('tr').find('td .TxtPercentage').val(0);
            $(this).closest('tr').find('td .TxtPercentage').attr('disabled', 'disabled');
        }
        else {
            $(this).closest('tr').find('td .TxtPercentage').removeAttr('disabled');
        }
        CalculatePercentage();
    });

}

function ActivityDelete(btndel) {
    $(btndel).closest("tr").remove();
    $("table#tblWFList tbody").each(function () {
        $(this).children().each(function (index) {
            $(this).find('td').first().html(index + 1);
        });
    });
    CalculatePercentage();
}

function CalculatePercentage() {
    var aPercentageTotalL = 0;
    var arow = $("#tblWFList").find("tr");
    $.each(arow, function (index, val) {
        if ($(this).find('td').length > 0) {
            if ($(this).find('.TxtPercentage').val() == '')
                aPercentageTotalL += parseFloat(0);
            else
                aPercentageTotalL += parseFloat($(this).find('.TxtPercentage').val());
        }
    });

    $('#PercentageTotal').html(aPercentageTotalL);
}

function Validate() {
    var aResultL = true;
    var aLast = $("#tblWFList").find("tr").last();
    var aLastActivity = $(aLast).find('select').val();
    if ($(aLast).find('select').length > 0 && aLastActivity == null) {
        $.bootstrapGrowl('Select Activity !', {
            type: 'danger',
            delay: 5000,
        });
        aResultL = false;
    }
    if (aResultL) {
        var aActivityList = $($("#tblWFList").find("tr")).find('.TxtActivity');
        $.each(aActivityList, function () {
            if ($(this).val() == "") {
                $.bootstrapGrowl('Enter Activity Name !', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
        });
    }

    if (aResultL) {
        if ($('#Txt_WorkFlow').val() == "") {
            $.bootstrapGrowl('Enter WorkFlow Name !', {
                type: 'danger',
                delay: 5000,
            });
            aResultL = false;
        }
        else if ($('#Txt_MinDays').val() == "") {
            $.bootstrapGrowl('Enter Minimum Days !', {
                type: 'danger',
                delay: 5000,
            });
            aResultL = false;
        }
        else if ($('#Txt_MaxDays').val() == "") {
            $.bootstrapGrowl('Enter Maximum Days !', {
                type: 'danger',
                delay: 5000,
            });
            aResultL = false;
        }
        else if ($('#lstPublisherList').val() == null) {
            $.bootstrapGrowl('Select Publisher !', {
                type: 'danger',
                delay: 5000,
            });
            aResultL = false;
        }
        else if ($('#Txt_Description').val() == "") {
            $.bootstrapGrowl('Enter Description !', {
                type: 'danger',
                delay: 5000,
            });
            aResultL = false;
        }

    }
    return aResultL;
}
function UpdateWorkFlow() {
    var IsValid = Validate();
    if (!IsValid)
        return false;
    $('#LoadingImage').show();
    $('#myModal_WorkFlow').modal('hide');
    var getWorkflowList = [];
    getWorkflowList = GetTableRowToList('tblWFList');
    if (getWorkflowList.length == 0) {
        $.bootstrapGrowl('Add WorkFlow details ! ', {
            type: 'danger', delay: 5000,
        });
        return false;
    }
    var data = {
        zWorkFlowName: $('#Txt_WorkFlow').val(),
        zMinDay: $('#Txt_MinDays').val(),
        zMaxDay: $('#Txt_MaxDays').val(),
        zPublisherList: $('#lstPublisherList').val().toString(),
        zDescription: $('#Txt_Description').val(),
        WorkFlowMasterL: getWorkflowList
    }
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateWorkFlow').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            $.bootstrapGrowl(response, {
                type: 'info',
                delay: 5000,
            });
            CallDataList();
            $('#LoadingImage').hide();
        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
            $('#myModal_WorkFlow').modal('hide');
        }
    });
}

$(function () {
    $.contextMenu({
        selector: '#example tbody tr',
        callback: function (key, options) {
            if (key == 'delete') {
                var zWF = $(this).find("td")[1].innerText;
                bootbox.confirm("Are you sure to delete the WorkFlow <strong>" + zWF + "</strong> ?",
                    function (result) {
                        if (result) {
                            DeleteWorkFlow(zWF);
                        }
                    });
            }
            else if (key == 'update') {
                WorkFlowMaster(this);
            }
            else if (key == 'add') {
                WorkFlowMaster(0);
            }
        },
        items: {
            "add": { name: "Add" },
            "update": { name: "Update" },
            "delete": { name: "Delete" },
        }
    });
});

function DeleteWorkFlowIcon(aid) {
    var aWFId = $(aid).closest('tr').find('td')[1].innerText;
    bootbox.confirm("Are you sure to delete the Workflow <strong>" + aWFId + "</strong> ?",
        function (result) {
            if (result) {
                DeleteWorkFlow(aWFId);
            }
        });
}
function DeleteWorkFlow(aid) {
    $('#LoadingImage').show();
    var data = { nWorkFlowNameP: aid }
    $.ajax({
        type: 'post',
        url: $('#hf_DeleteWorkFlow').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            if (response.indexOf('Error') > -1) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 5000,
                });
            }
            else {
                $.bootstrapGrowl(response, {
                    type: 'info',
                    delay: 5000,
                });
                CallDataList();
            }
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