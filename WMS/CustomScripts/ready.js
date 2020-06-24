var aTaskID = "";
var Holidays = [];
var size = {
    width: window.innerWidth || document.body.clientWidth,
    height: window.innerHeight || document.body.clientHeight
}
function isNullCheck(element) {
    return element == null ? "" : element;
}
function isNaNCheck(element) {
    return element == null ? "0" : element;
}
$(document).ready(function () {
    $("input").attr("autocomplete", "off");
    $('#myModalView_Pending #Txt_StartDate').datetimepicker({ format: 'd M Y H:i', beforeShowDay: noWeekendsOrHolidays });
    $('#myModalView_Pending #Txt_EndDate').datetimepicker({ format: 'd M Y H:i', beforeShowDay: noWeekendsOrHolidays });
    $('.jumbotron').css('height', size.height - 65);
    $('.side-navi-data').css('height', size.height - 60);
    $('.divQuickList').css('height', size.height - 70);
    $('#DivBookList').css('height', size.height - 150);
    $('#NotificationData').css('height', size.height - 100);
    $('#lblnotify').hide();

    $('.TaskDate').change(function () {
        var aStartDate = new Date($("#myModalView_Pending #Txt_StartDate").val());
        var aEndate = new Date($("#myModalView_Pending #Txt_EndDate").val());
        if (new Date(aStartDate) > new Date(aEndate)) {
            $.bootstrapGrowl("End date should be greater than Start date !", { type: 'danger', delay: 2000, });
            $(this).val('');
            $(this).focus();
            zResult = false;
        }
    })

    var scrollTop;
    $('select:not(#lstEditorList)').on("select2:selecting", function (event) {
        var $pr = $('#' + event.params.args.data._resultId).parent();
        scrollTop = $pr.prop('scrollTop');
    });
    $('select:not(#lstEditorList)').on("select2:select", function (event) {
        var $pr = $('#' + event.params.data._resultId).parent();
        $pr.prop('scrollTop', scrollTop);
    });

    $('#Nofify').click(function () {
        $('#sideNavi').animate({ "right": "350px" }, "slow");
    });
    $('#isideClose').click(function () {
        $('#sideNavi').animate({ "right": "0px" }, "slow");
    });

    LoadUserData();
    GetTaskNotifications();

    $('input.skipSpecialChar').on('keypress', function (event) {
        var regex = new RegExp("^[a-zA-Z0-9 ]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
            event.preventDefault();
            return false;
        }
    });

    $("input.IsNumeric").keydown(function (e) {
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 || (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) || (e.keyCode >= 35 && e.keyCode <= 40)) {
            return;
        }
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
    GetHolidays();

    setInterval(function () {
        $("input.IsNumeric").keydown(function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 || (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) || (e.keyCode >= 35 && e.keyCode <= 40)) {
                return;
            }
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });

    }, 1000);

    $('#IFitler').click(function () {

        $('#sideNavi_Filter').animate({ "right": "350px" }, "slow");
    });
    $('#isideClose_fitler').click(function () {
        $('#sideNavi_Filter').animate({ "right": "0px" }, "slow");
    });

});
function GetHolidays() {
    Holidays = [];

    $.ajax({
        type: 'post',
        url: $('#hf_GetHolidaysInfo').val(),
        datatype: 'json',
        success: function (response) {
            try {
                var items = JSON.parse(response);
                $.each(items, function (index) {

                    var t = [

                        $(this)[0]["Leave_Date"].replace("T00:00:00", "")

                    ];

                    Holidays.push(t);
                });

            } catch (e) {

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
function LoadUserData() {

    if ($('#hf_UserMaster').attr('data-value') == '') {
        window.location.href = $('#hf_LoginURL').val();
    }
    else {
        var aUserMaster = JSON.parse($('#hf_UserMaster').attr('data-value'));
        if (aUserMaster[0].MainMenu == null) {
            $('.sidebar-menu ul li').hide();
            $('#show-sidebar a').hide();
        }
        else {
            debugger
            var aMainMenu = aUserMaster[0].MainMenu.split(",");
            var aSubMenu = aUserMaster[0].SubMenu.split(",");
            $('.sidebar-menu ul li').hide();
            $('#show-sidebar a').hide();

            $.each(aMainMenu, function (i) {
                $('.Li_' + aMainMenu[i]).show();
                if (typeof $('.Li_' + aMainMenu[i]).attr('menuview') == "undefined")
                    $('.Li_' + aMainMenu[i]).attr('menuview', aMainMenu[i]);

            });

            $.each(aSubMenu, function (i) {
                $('.Li_' + aSubMenu[i]).show();
            });

            if ($('#divMenulist').length != 0) {
                var aMenuViewList = $("#myiconmenu li[menuview]");

                var menu = '<div>';
                $('#divMenulist').html('');
                debugger;
                var zCtBox = 0;
                $.each(aMenuViewList, function (i, val) {
                    zCtBox += 1;
                    if (zCtBox == 7)
                        zCtBox = 1;
                    var aLabel = $($(this)[0]).find('a').attr('title');
                    var menuclass = $($(this)[0]).find('a').attr('class');
                    var aLink = $($(this)[0]).find('a').attr('href');
                    if (typeof aLabel == "undefined")
                        aLabel = $(this)[0].title;

                    menu += '<div class="col-sm-2">'
                        + '<div class="box_' + zCtBox + ' gallery" style="width: auto;height: 86px;">'
                        + '<p style="color:white">' + aLabel + '</p>'
                        + '<a href="' + aLink + '" class="' + menuclass + '" style="color: whitesmoke;font-size: 18px;"></a>'
                        + '</div>'
                        + '</div>'

                });
                menu += '</div >';
                $('#divMenulist').html(menu);
            }

        }


        $('#hf_UserID').val(aUserMaster[0].UserID);
        $('#hf_RoleID').val(aUserMaster[0].RoleID);
        $('#hf_UserType').val(aUserMaster[0].UserType);

        if (aUserMaster[0].UserType == 'Author' || aUserMaster[0].UserType == 'Editor') {
            $('.Li_Home').show();
        }

        if (aUserMaster.length > -1) {
            $('.spUserName').html('Welcome ' + aUserMaster[0].LoginName.capitalize() + ' !');
        }
        if (aUserMaster[0].Image == null)
            $('#imgUserDP,.imgProfile').attr('src', '../img/user.jpg');
        else
            $('#imgUserDP,.imgProfile').attr('src', aUserMaster[0].Image);
    }
    SetActiveMenu();
}


function GetTaskNotifications() {
    $.ajax({
        type: 'post',
        url: $('#hf_GetNotification').val(),
        data: JSON.stringify(),
        datatype: 'json',
        success: function (response) {
            var items = response.aItemList;
            var items1 = response.aItemListCount;
            $('#HelpdeskCount').html(response.aHelpdeskCount == '0' ? '' : response.aHelpdeskCount);

            try {
                if (items.length == 0) {
                    $('#NotificationData').html("<center style='color:#FFF'><b>No Data Found</b></center>");
                    $('#lblnotify').show();
                    return false;
                }
                var zNotificationList = '<ul class="todo-list ui-sortable">';
                var nNotifyCt = 0;
                $.each(items, function (i, e) {
                    zNotificationList += '<li>' +
                        //'<span class="handle ui-sortable-handle"> <i class="fa fa-ellipsis-v"></i> </span>' +
                        '<span class="text" style="font-size: 12px;">' + items[i].title + '</span>';
                    if (items[i].id != '0') {
                        zNotificationList += '<small class="label label-info"><i class="fa fa-clock-o"></i> ' + items[i].Duration + ' ago </small>';
                        zNotificationList += '<div class="tools" style="display:block"> <i class="fa fa-check" title="Completed" onclick=ComfirmTaskComplete(' + items[i].id + ')></i> <i class="fa fa-clock" title="Postponed" onclick=PostponedTask(' + items[i].id + ')></i> </div>';
                    }
                    zNotificationList += '</li>';
                    nNotifyCt += 1;
                });
                zNotificationList += ' </ul>';
                $('#NotificationData').html(zNotificationList);
                $('#NotificationCount').html(nNotifyCt);

            } catch (e) {

            }

        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
        }
    });
}
function noWeekendsOrHolidays(date) {
    var dt = $.datepicker.formatDate('yy-mm-dd', date);
    var noWeekend = $.datepicker.noWeekends(date);

    if (noWeekend[0]) {
        return HoliDaysList(dt);
    } else {
        return noWeekend;
    }
}

function HoliDaysList(date) {
    for (i = 0; i < Holidays.length; i++) {
        if (date == Holidays[i]) {
            return [false, Holidays[i][2] + '_day'];
        }
    }
    return [true, ''];
}

//Task notification
function ComfirmTaskComplete(zTaskID) {
    aTaskID = zTaskID;
    bootbox.confirm("Are you sure to Complete this Task ? ",
        function (result) {
            if (result) {

                var data =
                {
                    SNo: zTaskID

                };
                $.ajax({
                    type: 'post',
                    url: $('#hf_UpdateCompletedTask').val(),
                    data: data,
                    datatype: 'json',
                    success: function (response) {
                        if (response.toString().indexOf("Error") > -1) {
                            $.bootstrapGrowl(response, {
                                type: 'danger',
                                delay: 5000,
                            });
                        }
                        else if (response) {
                            $.bootstrapGrowl('Task Completed Successfully!', {
                                type: 'info',
                                delay: 5000,
                            });
                            $('#NotificationCount').html(response.aItemListCount);
                            GetTaskNotifications();
                        }

                    },
                    error: function (result) {
                        $.bootstrapGrowl('Error Occured, Try Again..!', {
                            type: 'danger',
                            delay: 5000,
                        });
                    }
                });
            }
        });
}

function PostponedTask(nTaskID) {
    $('#myModalView_Pending #lblTaskID').html(nTaskID);
    $('#LoadingImage').show();
    var data = {
        zTaskID: nTaskID
    }
    $.ajax({
        type: 'get',
        url: $('#hf_GetTaskDetails').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            var items = response.aitemList;
            $('#myModalView_Pending #Txt_Title').val(items.Title);
            $('#myModalView_Pending #Txt_StartDate').val(FromateDateWithTime(items.StartDate));
            $('#myModalView_Pending #Txt_EndDate').val(FromateDateWithTime(items.EndDate));
            $('#myModalView_Pending #Txt_Description').val(items.Description);

            $("#myModalView_Pending input#Rb_" + items.Status).prop('checked', true);

            $('#myModalView_Pending').modal({ backdrop: 'static', keyboard: false });
            $('#LoadingImage').hide();
        },
        error: function (response) {
            $.bootstrapGrowl(response + ' &#128515;', {
                type: 'danger',
                delay: 2000,
            });
            $('#LoadingImage').hide();
        }
    });

}
$(document).ready(function () {
    $('#myModalView_Pending .TaskDate').change(function () {
        var aStartDate = new Date($("#myModalView_Pending #Txt_StartDate").val());
        var aEndate = new Date($("#myModalView_Pending #Txt_EndDate").val());
        if (new Date(aStartDate) > new Date(aEndate)) {
            $.bootstrapGrowl("End date should be greater than Start date !", { type: 'danger', delay: 2000, });
            $(this).val('');
            $(this).focus();
            zResult = false;
        }
    });
});

$('#btnTask_Postponed').click(function () {

    if ($('#myModalView_Pending #Txt_Title').val() == '') {
        $.bootstrapGrowl('Enter Title &#128577;', {
            type: 'danger',
            delay: 2000,
        });
        return false;
    }
    else if ($('#myModalView_Pending #Txt_StartDate').val() == '') {
        $.bootstrapGrowl('Enter Start Date &#128577;', {
            type: 'danger',
            delay: 2000,
        });
        return false;
    }
    else if ($('#myModalView_Pending #Txt_EndDate').val() == '') {
        $.bootstrapGrowl('Enter End Date &#128577;', {
            type: 'danger',
            delay: 2000,
        });
        return false;
    }

    if ($('#lblTaskID').html() == '') {
        return false;
    }
    $('#myModalView_Pending').modal('hide');
    $('#LoadingImage').show();
    var aitemInfoP = {
        SNo: $('#myModalView_Pending #lblTaskID').html(),
        Title: $('#myModalView_Pending #Txt_Title').val(),
        StartDate: $('#myModalView_Pending #Txt_StartDate').val(),
        EndDate: $('#myModalView_Pending #Txt_EndDate').val(),
        Description: $('#myModalView_Pending #Txt_Description').val(),
        Status: $("#myModalView_Pending input[name='Actions']:checked").val(),
    }

    $.ajax({
        type: 'post',
        url: $('#hf_UpdateTaskDetails').val(),
        data: JSON.stringify(aitemInfoP),
        contentType: 'application/json;charset=utf-8',
        datatype: 'json',
        success: function (response) {

            $.bootstrapGrowl("Task Updated ! &#128515;", {
                type: 'info',
                delay: 2000,

            });

            $('#LoadingImage').hide();
            $('#NotificationCount').html(response.aItemListCount);
            GetTaskNotifications();
        },
        error: function (response) {
            $.bootstrapGrowl(response + ' &#128543;', {
                type: 'danger',
                delay: 2000,
            });
            $('#LoadingImage').hide();
        }

    });

});

function SetActiveMenu() {
    if (GetLastSegment().toLowerCase() == 'userprofile') {
        return false;
    }
    var aLink = window.location.href.toLowerCase();
    if (aLink.indexOf('home') > -1 && aLink.indexOf('feedback') == -1) {
        $('#myiconmenu .Li_Home').addClass('menuActive');
    }
    else if (aLink.indexOf('budget') > -1) {
        $('#myiconmenu .Li_Budget').addClass('menuActive');
    }
    else if (aLink.indexOf('newbook') > -1) {
        $('#myiconmenu .Li_NewBook').addClass('menuActive');
    }
    else if (aLink.indexOf('freelance') > -1) {
        $('#myiconmenu .Li_Freelancer').addClass('menuActive');
    }
    else if ((aLink.indexOf('book') > -1 || aLink.indexOf('archival') > -1) && aLink.indexOf('progress') == -1) {
        $('#myiconmenu .Li_BookMaster').addClass('menuActive');
    }
    else if (aLink.indexOf('workflow') > -1) {
        $('#myiconmenu .Li_WorkflowManager').addClass('menuActive');
    }
    else if (aLink.indexOf('projectplan') > -1) {
        $('#myiconmenu .Li_ProjectPlan').addClass('menuActive');
    }
    else if (aLink.indexOf('user') > -1) {
        $('#myiconmenu .Li_UsersManagement').addClass('menuActive');
    }
    else if (aLink.indexOf('projectanalysis') > -1) {
        $('#myiconmenu .Li_Book').addClass('menuActive');
        $('#myiconmenu .Li_ProjectAnalysis').addClass('menuActive');
    }
    else if (aLink.indexOf('proofdistribution') > -1) {
        $('#myiconmenu .Li_ProofDistribution').addClass('menuActive');
    }
    else if (aLink.indexOf('query') > -1) {
        $('#myiconmenu .Li_Query').addClass('menuActive');
    }
    else if (aLink.indexOf('pipeline') > -1 || aLink.indexOf('wish') > -1 || aLink.indexOf('tracking') > -1 || aLink.indexOf('feedback') > -1
        || aLink.indexOf('progress') > -1 || aLink.indexOf('instruction') > -1) {
        $('#myiconmenu .Li_Tracking').addClass('menuActive');
    }
    else if (aLink.indexOf('general') > -1) {
        $('#myiconmenu .Li_General').addClass('menuActive');
    }
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var month_names = ["Jan", "Feb", "Mar",
    "Apr", "May", "Jun",
    "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec"];

Date.prototype.toShortFormat = function () {

    var day = this.getDate();
    var month_index = this.getMonth();
    var year = this.getFullYear();

    return "" + day + month_names[month_index] + year;
}
Date.prototype.toShortFormatWithTime = function () {

    var day = this.getDate();
    var month_index = this.getMonth();
    var year = this.getFullYear();
    var ztime = '_' + this.getHours() + '_' + this.getMinutes() + '_' + this.getSeconds();

    return "_" + day + month_names[month_index] + year + ztime;
}
var today = new Date();


function FormatDateColumn(dateL, addDate) {
    try {

        var date = new Date(parseInt(dateL.replace(/\D/g, '')));
        if (typeof addDate != "undefined") {
            date.setDate(date.getDate() + addDate);
        }
        var day = date.getDate();
        var dayString = day > 9 ? day : '0' + day;
        var Monthstr = date.getMonth() > 9 ? date.getMonth() : '0' + date.getMonth();
        var dtT = dayString + ' ' + month_names[date.getMonth()] + ' ' + date.getFullYear(); //month_names[date.getMonth()]

        return dtT;
    } catch (e) {
        return '';
    }
}
function FromateDateWithTime(dateTime) {
    var date = new Date(parseInt(dateTime.substr(6)));
    var hrs = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
    var mints = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
    var formatted = ("0" + date.getDate()).slice(-2) + " " +
        month_names[date.getMonth()] + " " + // ("0" + (date.getMonth() + 1)).slice(-2)
        date.getFullYear() + " " + hrs + ":" + mints;

    return formatted;
}

function FormatDate(dateL, addDate) {
    try {

        var date = new Date(dateL);
        if (typeof addDate != "undefined") {
            date.setDate(date.getDate() + addDate);
        }
        var day = date.getDate();
        var dayString = day > 9 ? day : '0' + day;
        var dtT = dayString + ' ' + month_names[date.getMonth()] + ' ' + date.getFullYear(); //month_names[date.getMonth()] 

        return dtT;
    } catch (e) {
        return '';
    }
}

function FormatDate_IE(dateL) {
    try {
        var dateL = dateL.split(' ');
        var zmonthL = month_names.indexOf(dateL[1].toString()) + 1;
        var monthString = zmonthL > 9 ? zmonthL : '0' + zmonthL;
        var dtT = dateL[2].toString() + '-' + monthString + '-' + dateL[0].toString();
        return dtT;
    } catch (e) {
        return '';
    }
}

setInterval(function () { heartbeat(); }, 30000);
function heartbeat() {
    try {
        $.ajax({
            type: 'post',
            url: $('#hf_KeepAlive').val(),
            data: null,
            contentType: 'application/json;charset=utf-8',
            datatype: 'json',
            success: function (response) {
                console.log(response);
            },
            error: function (response) {

            }
        });
    } catch (e) {

    }
}

function diff_weeks(dt2, dt1) {
    debugger;
    dt2 = new Date(dt2);
    dt1 = new Date(dt1);
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60 * 24 * 7);
    return Math.abs(Math.round(diff));

}

var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function GetDayName(aDt) {
    try {
        var adate = new Date(aDt);
        var aval = daysList[adate.getDay()];
        return (typeof aval == 'undefined' ? '' : aval);
    } catch (e) {
        return "";
    }

}

function GetLastMonthDate(adateL) {
    var date = new Date(adateL);
    date.setMonth(date.getMonth() - 1);
    var dtF = date.getDate() + ' ' + month_names[date.getMonth()] + ' ' + date.getFullYear();
    if (GetDayName(dtF) == 'Sunday') {
        date.setMonth(date.getDate() + 1);
        dtF = date.getDate() + ' ' + month_names[date.getMonth()] + ' ' + date.getFullYear();
    }
    else if (GetDayName(dtF) == 'Saturday') {
        date.setMonth(date.getDate() - 1);
        dtF = date.getDate() + ' ' + month_names[date.getMonth()] + ' ' + date.getFullYear();
    }
    return dtF;
}
function getDueDate(aAddDt, adt) {
    var dt = new Date();
    if (typeof adt !== "undefined")
        dt = new Date(adt);
    dt.setDate(dt.getDate() + aAddDt);
    var y = dt.getYear();
    if (y < 1000) y += 1900;
    return dt.getDate() + '-' + month_names[dt.getMonth()] + '-' + dt.getFullYear();
}

function GetLastSegment() {
    var pageURL = window.location.href;
    var lastURLSegment = pageURL.substr(pageURL.lastIndexOf('/') + 1);
    if (lastURLSegment.toLocaleLowerCase() == 'index' || lastURLSegment.toLocaleLowerCase() == 'display') {
        var parts = pageURL.split("/");
        lastURLSegment = parts[parts.length - 2]
    }
    return lastURLSegment;
}
function unique(list) {
    var result = [];
    $.each(list, function (i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
}
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
function clearForm(form) {
    $(':input', form).each(function () {
        var type = this.type;
        var tag = this.tagName.toLowerCase();
        if (type == 'text' || type == 'password' || tag == 'textarea' || tag == 'email')
            this.value = "";
        //else if (type == 'checkbox' || type == 'radio')
        //    this.checked = false;
        else if (tag == 'select') {
            this.selectedIndex = -1;
            $(this).val(-1).change();
        }
    });

    $('#imgUserLogo').attr('src', "");
};
function DisableCtrl(form, IsEditable) {
    $(':input', form).each(function () {
        if (IsEditable == 1)
            $(this).removeAttr('disabled');
        else
            $(this).attr('disabled', 'disabled');
    });

    //Check PA Comments ICON 
    if (IsEditable == 0)
        $(form).find('i').hide();
    else
        $(form).find('i').show();

    if ($('#hf_UserType').val() != 'Manager') {
        $(form).find('i[data-id]:not(i[data-value])').hide();
    }
    //Check PA Comments ICON 

};
// Table Column Filter Open
function OpenToggle(type, zthis) {
    closeToggle();
    document.getElementById("myDropdown" + type).classList.toggle("show");
    $("#myDropdown" + type + ' select').select2("open");

    $("#myDropdown" + type + ' select').on("select2-closing", function (e) {
        $("#myDropdown" + type + ' select').select2("open");
    });

    $('#myDropdown' + type + ' select > option').prop("selected", true);
}

// Close the dropdown menu if the user clicks outside of it
function closeToggle() {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
        }
    }
}


function GetTableRowToList(zTableID, aTitle) {
    var getResultList = [];
    $("table#" + zTableID + " tr").each(function () {
        var arrayOfThisRow = [];
        var tableData = $(this).find('td');
        if (tableData.length > 0) {
            tableData.each(function () {
                try {
                    if ($(this).find('select').length > 0) {
                        arrayOfThisRow.push($(this).find('select').val());
                    }
                    else if ($(this).text() == '' && $(this).find('input').length > 0) {
                        if ($(this).find('input')[0].value == 'on')
                            arrayOfThisRow.push($(this).find('input')[0].checked);

                        else {
                            var zActivityNameL = $(this).find('input')[0].value.toString().replace(",", "");
                            arrayOfThisRow.push(zActivityNameL);
                        }
                    }
                    else {
                        if (aTitle != null)
                            arrayOfThisRow.push($(this).text().replace(/,/g, '|'));
                        else
                            arrayOfThisRow.push($(this).text());
                    }
                } catch (e) {
                }

            });
            getResultList.push(arrayOfThisRow);
        }
    });

    return getResultList;
}

function CheckNumericVal() {
    $(".TxtScheduleDays,.TxtPercentage").keydown(function (event) {
        if (event.shiftKey == true) {
            event.preventDefault();
        }
        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 37 ||
            event.keyCode == 39 || event.keyCode == 46 || event.keyCode == 190) {

        } else {
            event.preventDefault();
        }

        if ($(this).val().indexOf('.') !== -1 && event.keyCode == 190)
            event.preventDefault();

    });
}
try {
    $(window).load(function () {
        CheckAccessRights();

    });
} catch (e) {

}
// Check User Access Rights
function CheckAccessRights(PM, XML, PG, QC, Art) {

    var data = { nRoleID: $('#hf_RoleID').val() };
    $.ajax({
        type: 'get',
        url: $('#hf_GetRights').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            try {
                var aMenuName = GetLastSegment().toLowerCase();
                var aRightsList = response.aItemList;
                var found;
                try {
                    found = aRightsList.find(function (element) {
                        return element.MenuName.toString().replace(/\s/g, '').toLowerCase().indexOf(aMenuName) > -1;
                    });
                } catch (e) {
                    // FOR IE 
                    for (i = 1; i < aRightsList.length; i++) {
                        if (aRightsList[i].MenuName.toString().replace(/\s/g, '').toLowerCase().indexOf(aMenuName) > -1) {
                            found = aRightsList[i];
                            break;
                        }
                    }
                }

                // Add Update and Delete Grid Option By User Access rights based
                if (found.Actions.indexOf('Add') > -1) {
                    $('.spAddIcon').show();
                }
                if (found.Actions.indexOf('Delete') > -1) {
                    $('.spDeleteIcon').show();
                }
                if (found.Actions.indexOf('Update') > -1) {
                    $('.spUpdateIcon').show();
                }
                $.each($('.context-menu-list li'), function () {
                    if (found.Actions.indexOf($(this)[0].innerText) == -1)
                        $(this).remove();
                });
                //Project Analysis Access right checking
                if ($('#TabPM').length != 0) {
                    DisableCtrl('#TabPM', 0); DisableCtrl('#TabXML', 0); DisableCtrl('#TabPG', 0); DisableCtrl('#TabQC', 0); DisableCtrl('#TabArtwork', 0);
                    $.each(aRightsList, function (e, val) {
                        if (val.MenuName == 'Project Manager') {
                            if ((val.Actions.indexOf('Update') > -1 && PM == null) || ($('#hf_UserType').val() == "Manager"))
                                DisableCtrl('#TabPM', 1);
                        }
                        else if (val.MenuName == 'XML') {
                            if ((val.Actions.indexOf('Update') > -1 && XML == null) || ($('#hf_UserType').val() == "Manager"))
                                DisableCtrl('#TabXML', 1);
                        }
                        else if (val.MenuName == 'Pagination') {
                            if ((val.Actions.indexOf('Update') > -1 && PG == null) || ($('#hf_UserType').val() == "Manager"))
                                DisableCtrl('#TabPG', 1);
                        }
                        else if (val.MenuName == 'Quality Check') {
                            if ((val.Actions.indexOf('Update') > -1 && QC == null) || ($('#hf_UserType').val() == "Manager"))
                                DisableCtrl('#TabQC', 1);
                        }
                        else if (val.MenuName == 'ArtWork') {
                            if ((val.Actions.indexOf('Update') > -1 && Art == null) || ($('#hf_UserType').val() == "Manager"))
                                DisableCtrl('#TabArtwork', 1);
                        }
                    });
                }

            } catch (e) {

            }
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again ! &#128577;', {
                type: 'danger',
                delay: 5000,
            });
        }
    });
}
function GetIEVersion() {
    var sAgent = window.navigator.userAgent;
    var Idx = sAgent.indexOf("MSIE");

    // If IE, return version number.
    if (Idx > 0)
        return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)));

    // If IE 11 then look for Updated user agent string.
    else if (!!navigator.userAgent.match(/Trident\/7\./))
        return 11;

    else
        return 0; //It is not IE
}
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function validateFileType(file, Size) {
    let f_no = /(\.bat|\.exe|\.dll)$/i;
    var fileUpload = $(file).get(0);
    var files = fileUpload.files;
    for (var i = 0; i < files.length; i++) {
        if (files[i].size > Size) {
            $.bootstrapGrowl('Please upload file less than ' + bytesToSize(Size) + ' ! ', {
                type: 'danger',
                delay: 8000,
            });
            return false;
        }
        let filename = files[i].name.split('\\').pop();
        let ext = filename.substr((filename.lastIndexOf('.') + 1));
        if (f_no.test(filename)) {
            $.bootstrapGrowl("File type not supported.", {
                type: 'danger',
                delay: 2000,
            });
            $(file).val(null);
            return false;
        }
    }
    return true;
}
function GetBrowserName() {
    var ua = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i),
        browser;
    if (navigator.userAgent.match(/Edge/i) || navigator.userAgent.match(/Trident.*rv[ :]*11\./i)) {
        browser = "msie";
    }
    else {
        browser = ua[1].toLowerCase();
    }
    return browser;
}

var sortBy = (function () {
  var toString = Object.prototype.toString,
      // default parser function
      parse = function (x) { return x; },
      // gets the item to be sorted
      getItem = function (x) {
        var isObject = x != null && typeof x === "object";
        var isProp = isObject && this.prop in x;
        return this.parser(isProp ? x[this.prop] : x);
      };

  return function sortby (array, cfg) {
    if (!(array instanceof Array && array.length)) return [];
    if (toString.call(cfg) !== "[object Object]") cfg = {};
    if (typeof cfg.parser !== "function") cfg.parser = parse;
    cfg.desc = !!cfg.desc ? -1 : 1;
    return array.sort(function (a, b) {
      a = getItem.call(cfg, a);
      b = getItem.call(cfg, b);
      return cfg.desc * (a < b ? -1 : +(a > b));
    });
  };
}());
//sortBy(data, {prop: "date",desc: true,parser: (d) => new Date(d) });