var aBookID;
$(document).ready(function () {
    var aarr = window.location.href.split('/');
    var ID = aarr[aarr.length - 3];
    var zType = aarr[aarr.length - 2];
    aBookID = ID;
    console.log("id=>" + ID);

    var ExistData = CheckExistingID(ID, zType);

    if (!ExistData) {
        $('#tbldata').show();
        $('#Message1').hide();
        $('#Exists').hide();
        var data = {
            aBookID: ID,
            aType: zType
        };
        $('#LoadingImage').show();
        $.ajax({
            type: 'Get',
            url: $('#hf_GetSurveyPopulate').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var zitem = response.aitemList;
                var aPlanningList = response.aPlanningList
                $('#customers').html('');
                var Stable = "<table id='tbla'class='tblTrans' Style='width: 100%';>";
                Stable += "<thead><th>Activity</th><th>Scheduled</th><th>Completed</th></thead>";
                $.each(aPlanningList, function (i, e) {
                    Stable += "<tr>";
                    Stable += "<td>" + e.Activity + "</td><td>" + FormatDateColumn(e.ScheduleDate) + "</td><td>" + FormatDateColumn(e.CompletedDate) + "</td>";
                    Stable += "</tr>";

                })
                Stable += "</table>";

                $('#customers').html(Stable);
                $('#LoadingImage').hide();
            },

            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 2000,
                });
                $(window).scrollTop(0);
                $('#LoadingImage').hide();
            }
        });

        $('#BtnSubmit').click(function () {

            if ($("input:radio[name=like]:checked").val() == null || $("input:radio[name=like1]:checked").val() == null
                || $("input:radio[name=like2]:checked").val() == null || $("input:radio[name=like3]:checked").val() == null
                || $("input:radio[name=like4]:checked").val() == null || $("input:radio[name=like5]:checked").val() == null
                || $("input:radio[name=like6]:checked").val() == null || $("input:radio[name=like7]:checked").val() == null
                || $("input:radio[name=like8]:checked").val() == null || $("input:radio[name=like9]:checked").val() == null) {
                $.bootstrapGrowl('Kinldy response your feedback rating for Customer Review !', {
                    type: 'warning',
                    delay: 5000,
                });
                $(window).scrollTop(0);
                return false;
            }

            $('#LoadingImage').show();
            $(window).scrollTop(0);
            var aitemInfoP = {
                BookID: aBookID,
                TextAccuracy: $("input:radio[name=like]:checked").val(),
                Quality: $("input:radio[name=like1]:checked").val(),
                Pagination: $("input:radio[name=like2]:checked").val(),
                CopyEditing: $("input:radio[name=like3]:checked").val(),
                Delivery: $("input:radio[name=like4]:checked").val(),
                ProductAccuracy: $("input:radio[name=like5]:checked").val(),
                Response: $("input:radio[name=like6]:checked").val(),
                Communication: $("input:radio[name=like7]:checked").val(),
                ResponseTime: $("input:radio[name=like8]:checked").val(),
                Clarification: $("input:radio[name=like9]:checked").val(),
                Comment: $('#txtcomment').val()
            }
            $.ajax({
                type: 'post',
                url: $('#hf_SubmitResponse').val(),
                data: JSON.stringify(aitemInfoP),
                contentType: 'application/json;charset=utf-8',
                datatype: 'json',

                success: function (response) {
                    if (response) {
                        $('#tbldata').hide();
                        $('#Message1').show();
                        $('#Exists').hide();
                    }

                    $('#LoadingImage').hide();

                },
                error: function (response) {
                    $.bootstrapGrowl(response, {
                        type: 'danger',
                        delay: 2000,
                    });
                    $(window).scrollTop(0);
                    $('#LoadingImage').hide();
                }
            });

        });
    }

})

function CheckExistingID(itemP, zType) {
    $('#LoadingImage').show();
    var data = { ValueData: itemP, Type: zType };
    $.ajax({
        type: 'get',
        url: $('#hf_CheckExistingData_survey').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            if (response) {
                $('#tbldata').hide();
                $('#Message1').hide();
                $('#Exists').show();
            }
            else {
                $('#Exists').hide();
                $('#tbldata').show();
                //$('#Message1').show();
            }
            $('#LoadingImage').hide();
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again.. ! &#128543;', {
                type: 'danger',
                delay: 2000,
            });
            $(window).scrollTop(0);
            $('#LoadingImage').hide();
        }
    });
}














