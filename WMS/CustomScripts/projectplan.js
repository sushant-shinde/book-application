var zPlanIDP;

$(window).load(function () {
    if ($('.dataTables_empty').html() == 'No data available in table') {
        $('.context-menu-list li').not(':first').remove();
    }
});

$(function () {
    CallDataList();
    $('#ddlBookList').select2({ placeholder: "Select", allowClear: true });
    $('#ddlWorkFlowList').select2({ placeholder: "Select", allowClear: true });
    $('#btnGet').click(function () {
        if ($('#ddlBookList').val() == null && $('#ddlBookPop').length == 0) {
            $.bootstrapGrowl('Select Book !', {
                type: 'danger',
                delay: 5000,
            });
            return false;
        }
        else if ($('#ddlWorkFlowList').val() == null) {
            $.bootstrapGrowl('Select Workflow !', {
                type: 'danger',
                delay: 5000,
            });
            return false;
        }
        GetActivityList();
    });

    $('#btnPP').click(function () {
        if ($('#ddlBookList').val() == null && $('#ddlBookPop').length == 0) {
            $.bootstrapGrowl('Select Book !', {
                type: 'danger',
                delay: 5000,
            });
            return false;
        }
        else if ($('#ddlWorkFlowList').val() == null) {
            $.bootstrapGrowl('Select Workflow !', {
                type: 'danger',
                delay: 5000,
            });
            return false;
        }
        UpdateProjectPlan();
    });

    $('#ddlBookList').change(function () {
        $('#ddlWorkFlowList').empty();
        $('#LoadingImage').show();
        var data = { nBookIDP: $(this).val() };
        $.ajax({
            type: 'post',
            url: $('#hf_GetWorkFlowList_ByBookID').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                $('#ddlWorkFlowList').empty();
                var aitemP = response.aItemList;
                $.each(aitemP, function (e, val) {
                    $('#ddlWorkFlowList').append('<option value="' + val.ID + '">' + val.WorkFlowName + '</option>');
                });
                $('#LoadingImage').hide();
                $('#ddlWorkFlowList').val(-1).change();
            },
            error: function (result) {
                //$.bootstrapGrowl('Error Occured, Try Again !', {
                //    type: 'danger',
                //    delay: 5000,
                //});
                $('#LoadingImage').hide();
            }
        });
    });
});
var dataSet = [];
function CallDataList() {
    $('#LoadingImage').show();
    var data;
    $.ajax({
        type: 'post',
        url: $('#hf_GetProjectPlanList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechData(response.aItemList);
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
                zindexL,
                $(this)[0]["BookNo"],
                $(this)[0]["Catalog"],
                $(this)[0]["WorkFlowName"],
                $(this)[0]["BufferDays"],
                $(this)[0]["CurrentActivity"],
                FormatDateColumn($(this)[0]["DueDate"]),
                FormatDateColumn($(this)[0]["FinalDueDate"]),
                FormatDateColumn($(this)[0]["DueDate"]),
                $(this)[0]["BookID"],
                $(this)[0]["WorkFlowID"],
                $(this)[0]["PlanID"],
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
            { title: "S.No." },
            { title: "Book No.", "width": "10%" },
            { title: "Catalog", "width": "10%" },
            { title: "Workflow Name" },
            { title: "Buffer Days", "width": "10%" },
            { title: "Current Activity" },
            { title: "Due Date", "width": "10%" },
            { title: "Final Due Date", "width": "10%" },
            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    if (data == '')
                        return '<center class="spInfo"><i class="fa fa-info-circle" aria-hidden="true" title="Info" data-col="Name" onclick="ProjectPlanMaster(this);"></i></center>';
                    else
                        return '<span class=spDeleteIcon style="display:none"><i class="fa fa-trash" aria-hidden="true" title="Delete" data-col="Name" onclick="DeleteProjectPlanIcon(this);"></i></span>' +
                            '<span class=spUpdateIcon style="display:none"><i class="fa fa-pen" aria-hidden="true" title="Edit" data-col="Name" onclick="ProjectPlanMaster(this);"></i></span>';
                }
            }
        ],
        columnDefs: [
            { type: 'date-dd-mmm-yyyy', targets: [6, 7] }
        ],
        "createdRow": function (row, data, dataIndex) {
            $($(row).find('td')[0]).attr('id', data[11]);//PlanID
            $($(row).find('td')[1]).attr('id', data[10]);//WorkFlowID
            $($(row).find('td')[2]).attr('id', data[9]);//BookID
            CheckAccessRights();
        },
        "destroy": true,
        "scrollY": (size.height - 180),
        "scrollX": true,
        drawCallback: function () {
            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                .on('click', function () {
                    CheckAccessRights();
                });
        },
        buttons: [
            {
                text: '<button class="btn btn-primary spAddIcon" style="display:none"><i class="fa fa-tasks"></i> Add</button>',
                action: function (e, dt, node, config) {
                    $('#btnPP').show();
                    $('.divError').hide();
                    $('.divError').html('');
                    $('#Txt_BufferDays').removeAttr('disabled');
                    $('#btnGet').removeAttr('disabled');
                    zPlanIDP = 0;
                    ProjectPlanMaster();
                }

            },
        ]
    });
    CheckAccessRights();
}

$(function () {
    $.contextMenu({
        selector: '#example tbody tr',
        callback: function (key, options) {
            var zPlanF = $(this).find("td")[0].id;
            var zWorkF = $(this).find("td")[1].innerText;
            var zBookF = $(this).find("td")[2].innerText;
            if (key == 'delete') {
                bootbox.confirm("Are you sure to delete the Project Plan for <strong>" + zBookF + " - " + zWorkF + "</strong> ?",
                    function (result) {
                        if (result) {
                            DeleteProjectPlan(zPlanF);
                        }
                    });
            }
            else if (key == 'add') {
                zPlanIDP = 0;
                ProjectPlanMaster();
            }
            else if (key == 'update') {
                ProjectPlanMaster(this);
            }
        },
        items: {
            "add": { name: "Add" },
            "update": { name: "Update" },
            "delete": { name: "Delete" },
        }
    });

});
function ProjectPlanMaster(aitem) {
    $('.tblBkinfo').hide();
    if (aitem != null) {
        var aPlanId = $(aitem).closest('tr').find('td')[0].id;
        $('#ddlWorkFlowList').val($(aitem).closest('tr').find('td')[1].id).change();
        $('#ddlBookList').val($(aitem).closest('tr').find('td')[2].id).change();
        $('#Txt_BufferDays').val($(aitem).closest('tr').find('td')[4].innerText);
        $('.divAdd').hide();
        $('.divPop').show();

        // Populate BookList Load
        var zDdloption = "<select id='ddlBookPop'><option value='" + $(aitem).closest('tr').find('td')[2].id + "'>"
            + $(aitem).closest('tr').find('td')[1].innerText + ' (' + $(aitem).closest('tr').find('td')[2].innerText + ")</option></select>";
        $('#spBookID').html(zDdloption);
        $('#ddlBookPop').select2();
        $('#spBookID').show();
        $('#spddlBookList').hide();
        $('#ddlBookPop').attr("disabled", true);
        // Populate BookList Load

        $('#ddlBookList').attr("disabled", true);
        $('#ddlWorkFlowList').attr("disabled", true);

        $('#ddlWorkFlowList').append('<option value="' + $(aitem).closest('tr').find('td')[1].id + '">' +
            $(aitem).closest('tr').find('td')[3].innerText +
            '</option>');

        zPlanIDP = aPlanId;
        PopulateProjectPlan(aPlanId,
            $(aitem).closest('tr').find('td')[1].id,
            $(aitem).closest('tr').find('td')[2].id
        );
    }
    else {
        $('#spBookID').html('');
        $('#spBookID').hide();
        $('#spddlBookList').show();

        $('#ddlBookList').attr("disabled", false);
        $('#ddlWorkFlowList').attr("disabled", false);

        $('.divAdd').show();
        $('.divPop').hide();

        $('#ddlBookList').val(-1).change();
        $('#ddlWorkFlowList').val(-1).change();
        $('#Txt_BufferDays').val(0);
        $('#DivActivityList_Plan').html('');
    }
    $('#myModal_View').modal({ backdrop: 'static', keyboard: false });
}

function GetActivityList() {
    $('#LoadingImage').show();
    //$('#btnPP').hide();
    var zBookIDL = $('#ddlBookList').val();
    if ($('#ddlBookPop').length > 0)
        zBookIDL = $('#ddlBookPop').val();

    var data = { zWorkFlowID: $('#ddlWorkFlowList').val(), zBookID: zBookIDL, zBufferDay: $('#Txt_BufferDays').val() };
    $.ajax({
        type: 'post',
        url: $('#hf_GetActivityList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            try {
                var items = response.aItemList;
                var aBkWrk_Info = response.aBk_Wrk_Info;

                if (parseInt(aBkWrk_Info[0].ActDueDays) < parseInt(aBkWrk_Info[0].MinDays)) {
                    var ainfo = '<strong>Book Due Days : ' + aBkWrk_Info[0].ActDueDays.toString() + '</strong><br>';
                    ainfo += '<strong>Workflow Min.Days : ' + aBkWrk_Info[0].MinDays.toString() + '</strong><br>';

                    $.bootstrapGrowl('Actual Due Days less than Workflow Minimum Days! ' + ainfo + '', {
                        type: 'danger',
                        delay: 5000,
                    });
                    $('#LoadingImage').hide();
                    $('#DivActivityList_Plan').html('');
                    return false;
                }
                else if (parseInt(aBkWrk_Info[0].ActDueDays) > parseInt(aBkWrk_Info[0].MaxDays)) {
                    var ainfo = '<strong>Book Due Days : ' + aBkWrk_Info[0].ActDueDays.toString() + '</strong><br>';
                    ainfo += '<strong>Workflow Max.Days : ' + aBkWrk_Info[0].MaxDays.toString() + '</strong><br>';

                    $.bootstrapGrowl('Actual Due Days greater than Workflow Max Days! ' + ainfo + '', {
                        type: 'danger',
                        delay: 5000,
                    });
                    $('#LoadingImage').hide();
                    $('#DivActivityList_Plan').html('');
                    return false;
                }
                DisplayData(items, aBkWrk_Info, 0);
                $('.tblBkinfo').show();
                $('#LoadingImage').hide();

            } catch (e) {
                $.bootstrapGrowl('Error Occured, Try Again !', {
                    type: 'danger',
                    delay: 5000,
                });
                $('#LoadingImage').hide();
            }
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

function PopulateProjectPlan(nPlanIDP, zWorkFlowIDP, zBookFP) {
    $('#LoadingImage').show();
    var data = { nPlanID: nPlanIDP, zBookID: zBookFP, zWorkFlowID: zWorkFlowIDP };
    $.ajax({
        type: 'post',
        url: $('#hf_PopulateProjectPlan').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            try {
                var items = response.aItemList;
                var aBkWrk_Info = response.aBk_Wrk_Info;
                DisplayData(items, aBkWrk_Info, 1);
                $('.tblBkinfo').show();
                $('#LoadingImage').hide();

            } catch (e) {
                $.bootstrapGrowl('Error Occured, Try Again !', {
                    type: 'danger',
                    delay: 5000,
                });
                $('#LoadingImage').hide();
            }
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

function DisplayData(items, aBookInfo, IsPopulate) {
    $('#Txt_BufferDays').removeAttr("disabled");
    $('#btnGet').removeAttr("disabled");

    var ztable = "<table id='tblPPList' class='tblTrans'>"
        + "<thead><tr><th>S.No.</th><th>Activity</th><th>%</th><th>Days</th><th>ScheduleDate</th><th>Day</th></tr></thead>";

    if (IsPopulate == 1)
        ztable = "<table id='tblPPList' class='tblTrans'>"
            + "<thead><tr><th>S.No.</th><th>Activity</th><th>%</th><th>Days</th><th>Schedule Date</th><th>Day</th><th>Revised Schedule Date</th><th>Completed Date</th></tr></thead>";

    for (var i = 0; i < items.length; i++) {
        var actDaty = items[i].Days;
        var ztrOverDue = '';
        if (IsPopulate == 1) {
            var zDate = FormatDate_IE(FormatDate(new Date()));
            var zRevisedtDate = FormatDate_IE(FormatDateColumn(items[i].RevisedScheduleDate));
            var zComDate = FormatDate_IE(FormatDateColumn(items[i].CompletedDate));

            if (zDate > zRevisedtDate && items[i].CompletedDate == null) {
                ztrOverDue = "trOverDue";
            }
            else if (items[i].CompletedDate != null && zRevisedtDate == zComDate) {
                ztrOverDue = "trManualClose";
            }
            else if (items[i].CompletedDate != null && zRevisedtDate > zComDate) {
                ztrOverDue = "trGreen";
            }
            else if (items[i].CompletedDate != null && zRevisedtDate < zComDate) {
                ztrOverDue = "trOverDue";
            }

            //if (zDate > zRevisedtDate && items[i].CompletedDate == null) {
            //    ztrOverDue = "trOverDue";
            //}
            //else if (items[i].CompletedDate != null) {
            //    ztrOverDue = "trManualClose";
            //}

        }
        if (actDaty < 0) {
            $.bootstrapGrowl('Invalid Buffer Days !', {
                type: 'danger',
                delay: 5000,
            });
            return false;
        }

        //Check Parallel Flow
        var isParalleFlow = (items[i].ParallelID == 1 || items[i].Percentage == 0);
        if (typeof items[i].ParallelID === "undefined" || items[i].ParallelID == null) {
            isParalleFlow = false;
        }

        if (isParalleFlow)
            ztable += "<tr class='trParallelFlow " + ztrOverDue + "' title='Parallel Flow' id='tr" + (i + 1).toString() + "'>";
        else
            ztable += "<tr class='" + ztrOverDue + "' id='tr" + (i + 1).toString() + "'>";

        ztable += "<td>" + (i + 1).toString() + "</td>";
        ztable += "<td>" + items[i].Activity + "</td>";
        ztable += "<td>" + items[i].Percentage + "</td>";
        if (items[i].CompletedDate == null && ($('#hf_UserType').val() == 'Manager' || IsPopulate == 0)) {
            if (isParalleFlow)
                ztable += "<td width='10%'><input type='text' class='TxtScheduleDays' value='" + 0 + "' maxlength='3' disabled='disabled' /></td>";
            else
                ztable += "<td width='10%'><input type='text' class='TxtScheduleDays' value='" + actDaty + "' maxlength='3' /></td>";
        }
        else
            ztable += "<td>" + actDaty + "</td>";
        if (isParalleFlow) {
            ztable += "<td>" + FormatDateColumn(items[i - 1].ScheduleDate) + "</td>";
            ztable += "<td>" + GetDayName(FormatDateColumn(items[i - 1].ScheduleDate)) + "</td>";
        }
        else {
            ztable += "<td>" + FormatDateColumn(items[i].ScheduleDate) + "</span></td>";
            ztable += "<td>" + GetDayName(FormatDateColumn(items[i].ScheduleDate)) + "</td>";
        }

        if (IsPopulate == 1) {
            ztable += "<td>" + FormatDateColumn(items[i].RevisedScheduleDate) + "</td>";
            if (items[i].CompletedDate != null) {
                ztable += "<td>" + FormatDateColumn(items[i].CompletedDate) + "</td>";
                $('#btnPP').hide();
            }
            else {
                $('#btnPP').show();
                ztable += "<td><input type='text' class='TxtCompletedDate' readonly value='" + FormatDateColumn(items[i].CompletedDate) + "' /></td>";
            }
        }

        if (items[i].CompletedDate != null) {
            $('#Txt_BufferDays').attr("disabled", true);
            $('#btnGet').attr("disabled", true);
        }

        ztable += "</tr>";
    }

    ztable += '</table>';
    $('#DivActivityList_Plan').html(ztable);

    var atoday = new Date();
    atoday.setDate(atoday.getDate() - 2);
    var aDateNamel = GetDayName(atoday);
    if (aDateNamel == 'Sunday' || aDateNamel == 'Saturday') {
        atoday.setDate(atoday.getDate() - 2);
    }
    $.each($('#tblPPList tbody tr'), function () {
        try {
            if ($(this).find('td')[7].innerText != '') {
                atoday = new Date($(this).find('td')[7].innerText);
                $('.TxtCompletedDate').datetimepicker({
                    format: 'd M Y',
                    timepicker: false,
                    //minDate: atoday,
                    //beforeShowDay: noWeekendsOrHolidays,
                    scrollMonth: false,
                    scrollInput: false
                });
            }
            else {
                $('.TxtCompletedDate').datetimepicker({
                    format: 'd M Y',
                    timepicker: false,
                    //minDate: atoday,
                    //beforeShowDay: noWeekendsOrHolidays,
                    scrollMonth: false,
                    scrollInput: false
                });
            }
        } catch (e) { }
    });

    CheckNumericVal();
    $('.TxtScheduleDays').change(function () {
        var aRowID = $(this).closest('tr').find('td')[0].innerHTML;
        var aRevisedDate;
        try {
            aRevisedDate = $(this).closest('tr').find('td')[6].innerHTML
        } catch (e) {
            aRevisedDate = $(this).closest('tr').find('td')[4].innerHTML
        }
        GetRevisedDate(aRowID, aRevisedDate, $(this).val());
    });

    //Activities Completed Date Change Event
    $('.TxtCompletedDate').change(function () {
        if ($(this).val() == '')
            return false;

        var aRowID = $(this).closest('tr').find('td')[0].innerHTML;
        if ($(aitemL).find('td')[0] != 1)
            aRowID = parseInt(aRowID) - 2;

        var aitemL = $($('#tblPPList tbody tr')[aRowID]).find('.TxtCompletedDate').val();
        if (aitemL == "") {
            $(this).val('');
            $.bootstrapGrowl('Previous activity still not Complete ! ', {
                type: 'danger', delay: 5000,
            });
            return false;
        }
        else {
            var zDate = FormatDate_IE($(this).val());
            var zPrevCmtDate = FormatDate_IE(aitemL);
            if (zPrevCmtDate > zDate) {
                $.bootstrapGrowl('Invalid Date Select ! ', {
                    type: 'danger', delay: 5000,
                });
                $(this).val('');
                return false;
            }
        }
        if ($('.bootbox-confirm').length == 0) {
            var aRowID = $(this).closest('tr').find('td')[0].innerHTML;
            $(this).closest('tr').find('.TxtScheduleDays').attr('disabled', 'disabled');
            GetRevisedDate(aRowID, $(this).val(), 0);
        }
    });

    //Book Info
    $('#divBookCover').attr('style="background:linear-gradient( rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),url(' + aBookInfo[0].ImgPath + ') no-repeat;background-size: cover"');
    $('#LblReceivedDt').html(FormatDateColumn(aBookInfo[0].ReceivedDt));
    $('#LblDueDt').html(FormatDateColumn(aBookInfo[0].DueDt));
    var zWeeksCt = diff_weeks(FormatDate_IE(FormatDateColumn(aBookInfo[0].ReceivedDt)), FormatDate_IE(FormatDateColumn(aBookInfo[0].DueDt))) + ' - Weeks';
    $('#LblTATDetails').html(zWeeksCt);
    $('#LblISBN').html(aBookInfo[0].ISBN);
    $('#LblPlatform').html(aBookInfo[0].Platform);
    $('#LblAuthorName').html(aBookInfo[0].AuthorName);

    //WorkFlow Info
    $('#LblMinDays').html(aBookInfo[0].MinDays);
    $('#LblMaxDays').html(aBookInfo[0].MaxDays);

    $('.divError').hide();
    $('.divError').html('');
    // Show Warning for Revised Schedule Date invalid
    var alasttr = $("#tblPPList").find("tr:nth-last-child(1) td");
    if (alasttr.length > 6) {
        var aBookDueDate = FormatDate_IE($('#LblDueDt').html());
        var aFinalDueDate = FormatDate_IE(alasttr[6].innerText);
        if (new Date(aFinalDueDate) > new Date(aBookDueDate)) {
            $('.divError').show();
            $('.divError').html('Revised Schedule Date should not be greater than Book Due date !');
            setInterval(blink_text, 1000);
            //blink_text();
        }
    }
}

function blink_text() {
    $('.divError').fadeOut(500);
    $('.divError').fadeIn(1000);
}

function UpdateProjectPlan() {
    var getActivityList = GetTableRowToList('tblPPList');
    if ($('#ddlBookList').val() == null && $('#ddlBookPop').length == 0) {
        $.bootstrapGrowl('Select Book !', {
            type: 'danger',
            delay: 5000,
        });
        return false;
    }
    else if ($('#ddlWorkFlowList').val() == null) {
        $.bootstrapGrowl('Select Workflow !', {
            type: 'danger',
            delay: 5000,
        });
        return false;
    }
    else if (getActivityList.length == 0) {
        $.bootstrapGrowl('Get Workflow Activities !', {
            type: 'danger', delay: 5000,
        });
        return false;
    }

    var alasttr = $("#tblPPList").find("tr:nth-last-child(1) td");
    var aBookDueDate = FormatDate_IE($('#LblDueDt').html());
    var aFinalDueDate = FormatDate_IE(alasttr[4].innerText);
    if (new Date(aFinalDueDate) > new Date(aBookDueDate)) {
        $.bootstrapGrowl("Schedule Date should not be greater than Book Due date !", { type: 'danger', delay: 5000, });
        return false;
    }

    $('#LoadingImage').show();
    $('#myModal_View').modal('hide');

    var zBookIDL = $('#ddlBookList').val();
    if ($('#ddlBookPop').length > 0)
        zBookIDL = $('#ddlBookPop').val();

    var data = {
        zWorkFlowID: $('#ddlWorkFlowList').val(),
        zBookID: zBookIDL,
        zBufferDay: $('#Txt_BufferDays').val(),
        zActivityList: getActivityList
    };
    $.ajax({
        type: 'post',
        url: $('#hf_UpdateProjectPlan').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            var zMsg = response.zMsg;
            var aBookListL = response.aBookList;
            if (zMsg.indexOf('Already') > 0) {
                $.bootstrapGrowl(response, {
                    type: 'warning',
                    delay: 5000,
                });
            }
            else {
                $.bootstrapGrowl(zMsg, {
                    type: 'info',
                    delay: 5000,
                });
                CallDataList();
                $('#ddlBookList').find('option').remove();
                $.each(aBookListL, function (e, val) {
                    $('#ddlBookList').append('<option value="' + val.Value + '">' + val.Text + '</option>');
                });
            }
            $('#LoadingImage').hide();
        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
        }
    });

}

function GetRevisedDate(nSequnceID, zCompletedDt, aDays) {
    //For Schedule Days Changes
    if (aDays != 0)
        RevisedScheduleUpdatedList(nSequnceID, zCompletedDt, aDays);
    else {
        bootbox.confirm("Are you want to Revised the Schedule date?",
            function (result) {
                if (result) {
                    RevisedScheduleUpdatedList(nSequnceID, zCompletedDt, aDays);
                }
            });
    }
}

function RevisedScheduleUpdatedList(nSequnceID, zCompletedDt, aDays) {
    var zDaysList = '';
    // Project Newly Added calculate Schedule Date
    if (zPlanIDP == 0) {
        $.each($('#tblPPList tbody tr'), function (index, itemVal) {
            zDaysList = zDaysList + $(this).find('.TxtScheduleDays').val() + ',';
        });
        zDaysList = zDaysList.replace(/,\s*$/, "");
    }
    $('#btnPP').hide();
    var data = {
        nPlanID: zPlanIDP,
        nSequnceID: nSequnceID,
        zCompletedDt: zCompletedDt,
        zDaysP: aDays,
        zReceivedDt: $('#LblReceivedDt').html(),
        zDaysList: zDaysList
    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetScheduleDate').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            var items = JSON.parse(response);
            $.each(items, function (index, itemVal) {
                if (zDaysList != '') {
                    $($('#tblPPList tbody tr[id="tr' + itemVal.SNo + '"]').find('td')[4]).html(FormatDate(itemVal.ScheduleDate));
                    $($('#tblPPList tbody tr[id="tr' + itemVal.SNo + '"]').find('td')[5]).html(GetDayName(FormatDate(itemVal.ScheduleDate)));
                }
                else {
                    $($('#tblPPList tbody tr[id="tr' + itemVal.SNo + '"]').find('td')[6]).html(FormatDate(itemVal.RevisedScheduleDate));
                    $($('#tblPPList tbody tr[id="tr' + itemVal.SNo + '"]').find('td')[6]).attr('title', GetDayName(FormatDate(itemVal.RevisedScheduleDate)));
                }
            });
            $('#btnPP').show();
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 5000,
            });

        }
    });
}
function DeleteProjectPlanIcon(aitem) {
    var aPlanId = $(aitem).closest('tr').find('td')[0].id;
    var zWorkF = $(aitem).closest('tr').find('td')[1].innerText;
    var zBookF = $(aitem).closest('tr').find('td')[2].innerText;
    bootbox.confirm("Are you sure to delete the Project Plan for <strong>" + zBookF + " - " + zWorkF + "</strong> ?",
        function (result) {
            if (result) {
                DeleteProjectPlan(aPlanId);
            }
        });
}

function DeleteProjectPlan(aPlanIdP) {
    $('#LoadingImage').show();
    var data = { nPlanID: aPlanIdP };
    $.ajax({
        type: 'post',
        url: $('#hf_DeleteProjectPlan').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var zMsg = response.zMsg;
            var aBookListL = response.aBookList;
            $.bootstrapGrowl(zMsg, {
                type: 'info',
                delay: 5000,
            });
            $('#ddlBookList').find('option').remove();
            $.each(aBookListL, function (e, val) {
                $('#ddlBookList').append('<option value="' + val.Value + '">' + val.Text + '</option>');
            });

            CallDataList();
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
