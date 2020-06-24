var nTaskIDG = 0;

$(function() {
    $("#ddl_UserList").select2({ placeholder: "Select", closeOnSelect: false, allowClear: true });
});

function LoadCalendar() {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    var calendar = $('#calendar').fullCalendar({
        theme: 'standard',
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay,listWeek'
        },
        defaultView: 'month',
        selectable: true,
        selectHelper: true,
        allDaySlot: true,
        //aspectRatio: 1.75,
        //minTime: 7,
        //maxTime: 20,
        timezone: "local",
        timeFormat: 'hh:mm A',
        //weekMode: 'variable',
        editable: false,
        eventRender: function (eventObj, $el) {
            $el.popover({
                title: (eventObj.color == '#acb81d' ? 'Pipeline' : eventObj.color == '#F78888' ? 'Schedule' : eventObj.title),
                content: eventObj.description,
                trigger: 'hover',
                placement: 'top',
                container: 'body'
            });
        },
        eventClick: function (event) {
            if (event.color == "#0b7eca") {//Only Show TaskCalender Entry.
                nTaskIDG = event.id;
                ShowTask();
            }
            return false;
        },
        events: $('#hf_GetTaskList').val(),
        height: 550

    });

}

$(document).ready(function () {
    $('.jumbotron').css('height', size.height - 85);
    $('#ddlTaskAction').select2();
    $('#Txt_StartDate').datetimepicker({
        format: 'd M Y H:i',
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });
    $('#Txt_EndDate').datetimepicker({
        format: 'd M Y H:i',
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });
    LoadCalendar();

    $('.TaskDate').change(function () {
        var aStartDate = new Date($("#Txt_StartDate").val());
        var aEndate = new Date($("#Txt_EndDate").val());
        if (new Date(aStartDate) > new Date(aEndate)) {
            $.bootstrapGrowl("End date should be greater than Start date !", { type: 'danger', delay: 2000, });
            $(this).val('');
            $(this).focus();
            zResult = false;
        }
    });
    $('#btnTask').click(function () {

        if ($('#Txt_Title').val() == '') {
            $.bootstrapGrowl('Enter Title !', {
                type: 'danger',
                delay: 2000,
            });
            return false;
        }
        else if ($('#Txt_StartDate').val() == '') {
            $.bootstrapGrowl('Select Start Date !', {
                type: 'danger',
                delay: 2000,
            });
            return false;
        }
        else if ($('#Txt_EndDate').val() == '') {
            $.bootstrapGrowl('Select End Date !', {
                type: 'danger',
                delay: 2000,
            });
            return false;
        }
        else if ($('#ddl_UserList').val() == null) {
            $.bootstrapGrowl('Select Users !', {
                type: 'danger',
                delay: 2000,
            });
            return false;
        }

        $('#myModal_View').modal('hide');
        $('#LoadingImage').show();
      

        var aitemInfoP = {
            SNo: nTaskIDG,
            Title: $('#Txt_Title').val(),
            StartDate: $('#Txt_StartDate').val(),
            EndDate: $('#Txt_EndDate').val(),
            Description: $('#Txt_Description').val(),
            Status: $("input[name='Actions']:checked").val(),
            UsersList: ($('#ddl_UserList').val() == null ? null : $('#ddl_UserList').val().toString()),
        }
        $.ajax({
            type: 'post',
            url: $('#hf_UpdateTaskDetails').val(),
            data: JSON.stringify(aitemInfoP),
            contentType: 'application/json;charset=utf-8',
            datatype: 'json',
            success: function (response) {
                $.bootstrapGrowl("Task Details Updated !", {
                    type: 'info',
                    delay: 2000,
                });
                $('#calendar').fullCalendar('refetchEvents');
                $('#LoadingImage').hide();
            },
            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 2000,
                });
                $('#LoadingImage').hide();
            }
        });

    });
   
   
});

var zchapterList;
function ShowTask() {
    $('#LoadingImage').show();
    $('#btnDeleteTask').show();
    var data = {
        zTaskID: nTaskIDG
    }
    $.ajax({
        type: 'get',
        url: $('#hf_GetTaskDetails').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            var items = response.aitemList;
            $('#Txt_Title').val(items.Title);
            $('#Txt_StartDate').val(FromateDateWithTime(items.StartDate));
            $('#Txt_EndDate').val(FromateDateWithTime(items.EndDate));
            $('#Txt_Description').val(items.Description);
           zchapterList = null;
            try {
                var data = items.UsersList.split(',');
                var selectedValues = new Array();
                try {
                    for (var i = 0; i < data.length; i++) {
                        selectedValues[i] = data[i];
                    }
                } catch (e) { }

                zchapterList = selectedValues;
                $('#ddl_UserList').val(selectedValues).change();


            } catch (e) {

            }


            $("#myModal_View input#Rb_" + items.Status).prop('checked', true);
            $('#myModal_View').modal({ backdrop: 'static', keyboard: false });
            $('#LoadingImage').hide();
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

$(function () {
    $.contextMenu({
        selector: '#calendar tbody tr td.fc-day-top',
        callback: function (key, options) {
            if (key == 'new') {
                
                nTaskIDG = 0;
                $('#Txt_Title').val('');
                $('#Txt_StartDate').val(FormatDate($(this)[0].dataset.date));
                $('#Txt_EndDate').val(FormatDate($(this)[0].dataset.date));
                $('#Txt_Description').val('');
                $('#ddl_UserList').val(null).change();
                $('#myModal_View').modal({ backdrop: 'static', keyboard: false });
                $('#btnDeleteTask').hide();
            }
        },
        items: {
            "new": { name: "New Task" },
        }
    });
});

$(function () {
    $('#btnDeleteTask').click(function () {

        DeleteTask();

    });
})

function DeleteTask() {
   
    $('#LoadingImage').show();
    var data = { zTaskID: nTaskIDG }
    $.ajax({
        type: 'post',
        url: $('#hf_DeleteTaskDetails').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            $.bootstrapGrowl(response, {
                type: 'info',
                delay: 5000,
            });
            $('#myModal_View').modal('hide');
            $('#LoadingImage').hide();
            $('#calendar').fullCalendar('refetchEvents');
          
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