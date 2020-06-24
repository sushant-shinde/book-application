var zJournalList = null;
$(function () {
    $("#ddlUserList").select2({ placeholder: "Select", allowClear: true });
    $("#ddlRoleID").select2({ placeholder: "Select", allowClear: true });
    $("#ddlUserTypeList").select2({ placeholder: "Select", allowClear: true });
    $('#ddlActiveStatus').select2({ placeholder: "Select", allowClear: true });
    $('#ddlGender').select2({ placeholder: "Select", allowClear: true });
    $('.divUserContent').css('height', size.height - 250);
    $('#txtDOB').datetimepicker({
        format: 'd M Y',
        value: new Date(),
        timepicker: false,
        maxDate: today
    });
    $("#TxtEmailID").change(function (e) {
        var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
        if (filter.test($(this).val())) {
            return true;
        }
        else {
            $.bootstrapGrowl('Invalid Email ID ! ', {
                type: 'danger',
                delay: 8000,
            });
            $(this).val('');
        }
    });
    //Validation for sequence only Numeric
    $("#txtWrkExtNo,#txtWrkPhone,#txtPhone").keydown(function (e) {
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 || (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) || (e.keyCode >= 35 && e.keyCode <= 40)) {
            return;
        }
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });

    $('#txtLoginID').change(function (e) {
        //var value = $(this).val();
        //if (value.length < 5) {
        //    $.bootstrapGrowl("Login too short !", {
        //        type: 'warning',
        //        delay: 8000,
        //    });
        //    $(this).val('');
        //}
    });
    $('#txtLoginID').change(function (e) {
        if ($(this).val().length > 2)
            CheckExistingData($(this).val(), 'LoginID');
    });
    $('#TxtEmailID').change(function (e) {
        CheckExistingData($(this).val(), 'EmailID');
    });

    //$('#ddlUserList').change(function () {
    //    PopulateUserDetails($(this).val());
    //})

    $('#btnUpdate').click(function () {
        SaveUserInfo();
    });

    $('#btnCancel').click(function () {
        $('#ddlRoleID').val(-1).change();
        $('#ddlUserList').val(-1).change();
        clearForm('#FormUserInfo');
    });
    var aColName;
    $('.fa-pen').click(function () {
        clearForm('#myModal_profile');
        aColName = $(this).attr('data-col');
        $('.CrtlHide').hide();
        $('#divTitle').html(aColName);
        $('#Txt' + aColName).show();
        $('#Txt' + aColName).val($('#Lbl' + aColName).text());
        if (aColName == 'Gender') {
            $("input#Rb_" + $('#Lbl' + aColName).text()).prop('checked', true);
        }
        $('#myModal_profile').modal({ backdrop: 'static', keyboard: false });
    });

    $('#btnUpdateProfile').click(function () {
        ProfileUpdate(aColName);
    });
    $('#btnImageUpload').click(function () {
        ProfileUpdate('Image');
    });
    $('#btnImageClear').click(function () {
        $('#imgUserLogo').attr('src', '../img/user.jpg');
        ProfileUpdate('Image');
    });
    CallDataList();

    $('#TxtPwd').change(function () {
        var value = $(this).val();
        if (value.length < 5) {
            $.bootstrapGrowl("Password too short !", {
                type: 'warning',
                delay: 8000,
            });
            $(this).val('');
            return false;
        }
    });

    $('#ddlGender').change(function () {
        if ($(this).val() == 'Female')
            $('#imgUserLogo').attr('src', '../img/female.jpg');
        else
            $('#imgUserLogo').attr('src', '../img/user.jpg');
    });
});


function ProfileUpdate(zUpdateType) {
    if (zUpdateType == 'Password') {
        if ($('#TxtPwd').val() != $('#TxtconfirmPwd').val()) {
            $.bootstrapGrowl("Pasword not match !", {
                type: 'warning',
                delay: 8000,
            });
            return false;
        }
        else if ($('#TxtPwd').val() == "") {
            $.bootstrapGrowl("Enter Password !", {
                type: 'warning',
                delay: 8000,
            });
            $('#TxtPwd').focus();
            return false;
        }
    }
    else if (zUpdateType == 'Name') {
        if ($('#TxtName').val() == "") {
            $.bootstrapGrowl("Enter Name !", {
                type: 'warning',
                delay: 8000,
            });
            $('#TxtName').focus();
            return false;
        }
    }
    else if (zUpdateType == 'EmailID') {
        if ($('#TxtEmailID').val() == "") {
            $.bootstrapGrowl("Enter Email ID !", {
                type: 'warning',
                delay: 8000,
            });
            $('#TxtEmailID').focus();
            return false;
        }
    }
    else if (zUpdateType == 'MobileNo') {
        if ($('#TxtMobileNo').val() == "") {
            $.bootstrapGrowl("Enter Mobile No. !", {
                type: 'warning',
                delay: 8000,
            });
            $('#TxtMobileNo').focus();
            return false;
        }
    }
    $('#LoadingImage').show();
    var aitemInfoP = {
        UserID: $('#hf_UserID').val(),
        LoginName: (zUpdateType == 'Name' ? $('#TxtName').val() : null),
        Password: (zUpdateType == 'Password' ? $('#TxtPwd').val() : null),
        Gender: (zUpdateType == 'Gender' ? $("input[name='Gender']:checked").val() : null),
        DOB: (zUpdateType == 'Birthday' ? $("#TxtBirthday").val() : null),
        PhoneNo: (zUpdateType == 'MobileNo' ? $("#TxtMobileNo").val() : null),
        EmailID: (zUpdateType == 'EmailID' ? $("#TxtEmailID").val() : null),
        Image: (zUpdateType == 'Image' ? $('#imgUserLogo').attr('src') : null),
    }
    $.ajax({
        type: 'post',
        url: $('#hf_UserInfoUpdate').val(),
        data: JSON.stringify(aitemInfoP),
        contentType: 'application/json;charset=utf-8',
        datatype: 'json',
        success: function (response) {
            if (response.toString().indexOf('Error') != -1) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 8000,
                });
            }
            else {
                $.bootstrapGrowl(response, {
                    type: 'info',
                    delay: 8000,
                });
            }
            PopulateUserDetails($('#hf_UserID').val(), 'Profile');
            if (zUpdateType != 'Image')
                $('#myModal_profile').modal('hide');
            $('#LoadingImage').hide();
            $("#imageUploadForm").val(null);
        },
        error: function (response) {
            $.bootstrapGrowl(response + ' ', {
                type: 'danger',
                delay: 8000,
            });
            $('#LoadingImage').hide();
        }
    });
}
var zActHostpath = document.location.pathname.split('/')[1];
function onerrorImageLoad() {
    $('#imgUserLogo').attr('src', '/' + zActHostpath + "/img/user.jpg");
}
function showPreview(objFileInput) {
    var ext = $('#imageUploadForm').val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['png', 'jpg', 'jpeg']) == -1 && $('#imageUploadForm').val() != '') {
        $.bootstrapGrowl('Invalid image format ! ', {
            type: 'danger',
            delay: 8000,
        });
        return false;
    }
    else if (objFileInput.files[0].size > 2000000) {
        $.bootstrapGrowl('Please upload Photo less than 2MB ! ', {
            type: 'danger',
            delay: 8000,
        });
        return false;
    }

    if (objFileInput.files[0]) {

        var fileReader = new FileReader();
        fileReader.onload = function (e) {
            $('#imgUserLogo').attr('src', e.target.result);
            $('.imgProfile').attr('src', e.target.result);
        }
        fileReader.readAsDataURL(objFileInput.files[0]);
    }

}
function CheckExistingData(itemP, zType) {
    $('.modal-footer .btn').attr('disabled', 'disabled');
    var data = { ValueData: itemP, zType: zType };
    $.ajax({
        type: 'get',
        url: $('#hf_CheckExistingData').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            if (response) {
                $.bootstrapGrowl(zType + ' already found ! ', {
                    type: 'danger',
                    delay: 8000,
                });
                if (zType == 'EmailID')
                    $('#Txt' + zType).val('');
                else
                    $('#txt' + zType).val('');
            }
            $('.modal-footer .btn').removeAttr('disabled');
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again.. ! ', {
                type: 'danger',
                delay: 8000,
            });
            $('.modal-footer .btn').removeAttr('disabled');
        }
    });
}

function PopulateUserDetails(zitem, aType) {
    if (zitem == null || zitem == 0) {
        clearForm('#FormUserInfo');
        $('#ddlRoleID').val(-1).change();
        $('#ddlGender').val(-1).change();
        $('#ddlActiveStatus').val(-1).change();
    }
    else {
        $('#LoadingImage').show();
        var data = { zuserID: zitem }
        $.ajax({
            type: 'post',
            url: $('#hf_UserInfoPopulate').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var items = JSON.parse(response);
                if (aType == 'Profile') {
                    $('#LblName').html(items[0]["LoginName"]);
                    if (items[0]["DOB"] != null)
                        $('#LblBirthday').html(FormatDate(items[0]["DOB"]));

                    $('#LblGender').html(items[0]["Gender"]);

                    $('#LblEmailID').html(items[0]["EmailID"]);

                    $('#LblMobileNo').html(items[0]["PhoneNo"]);
                }

                else {
                    $('#txtLoginID').val(items[0]["LoginID"]);
                    $('#txtLoginName').val(items[0]["LoginName"]);

                    $('#ddlGender').val(items[0]["Gender"]).change();
                    $('#ddlActiveStatus').val(items[0]["ActiveStatus"]).change();

                    //$("input#Rb_" + items[0]["Gender"]).prop('checked', true);
                    //$("input#Rb_" + items[0]["ActiveStatus"]).prop('checked', true);
                    $('#txtDOB').val((items[0]["DOB"] == null ? '' : FormatDate(items[0]["DOB"])));
                    $('#ddlRoleID').val(items[0]["RoleID"]).change();
                    $('#txtPhone').val(items[0]["PhoneNo"]);
                    $('#TxtEmailID').val(items[0]["EmailID"]);
                    $('#txtAddress').val(items[0]["Address"]);
                    $('#ddlLocation').val(items[0]["LocationID"]).change();
                    $('#txtBloodGroup').val(items[0]["BloodGroup"]);
                    $('#txtWrkPhone').val(items[0]["WorkPhone"]);
                    $('#txtWrkExtNo').val(items[0]["WorkExtNo"]);
                    $('#ddlUserTypeList').val(items[0]["UserType"]).change();

                    if (items[0]["Image"] == null)
                        $('#imgUserLogo').attr('src', '../img/user.jpg');
                    else
                        $('#imgUserLogo').attr('src', items[0]["Image"]);
                }
                $('#LoadingImage').hide();

            },
            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 8000,
                });
                $('#LoadingImage').hide();
            }
        });
    }
}

function SaveUserInfo() {
    var validate = ValidateForm('#FormUserInfo');
    if (validate) {
        $('#myModal_View').modal('hide');
        $('#LoadingImage').show();
        var aitemInfoP = {
            UserID: $('#ddlUserList').val(), LoginID: $('#txtLoginID').val(), LoginName: $('#txtLoginName').val(),
            Gender: $("#ddlGender").val(), DOB: $('#txtDOB').val(), ActiveStatus: $("#ddlActiveStatus").val(),
            RoleID: $('#ddlRoleID').val(), PhoneNo: $('#txtPhone').val(),
            EmailID: $('#TxtEmailID').val(), Address: $('#txtAddress').val(),
            BloodGroup: $('#txtBloodGroup').val(), WorkPhone: $('#txtWrkPhone').val(),
            WorkExtNo: $('#txtWrkExtNo').val(), Image: $('#imgUserLogo').attr('src'),
            UserType: $('#ddlUserTypeList').val(),
        }
        $.ajax({
            type: 'post',
            url: $('#hf_UserInfoUpdate').val(),
            data: JSON.stringify(aitemInfoP),
            contentType: 'application/json;charset=utf-8',
            datatype: 'json',
            success: function (response) {
                if (response.toString().indexOf('Error') != -1) {
                    $.bootstrapGrowl(response, {
                        type: 'danger',
                        delay: 8000,
                    });
                }
                else {
                    $.bootstrapGrowl(response, {
                        type: 'info',
                        delay: 8000,
                    });
                    clearForm('#FormUserInfo');
                }
                $('#LoadingImage').hide();
                $('#myModal_View').modal('hide');
                CallDataList();
            },
            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 8000,
                });
                $('#LoadingImage').hide();
            }
        });
    }
}

function ValidateForm(form) {
    var zResult = true;
    if ($('#txtLoginID').val() == '') {
        $.bootstrapGrowl('Enter Login ID ! ', { type: 'danger', delay: 8000, });
        $('#txtLoginID').focus();
        zResult = false;
    }
    else if ($('#txtLoginID').val().length < 4) {
        $.bootstrapGrowl('Login ID too short! ', { type: 'danger', delay: 8000, });
        $('#txtLoginID').focus();
        zResult = false;
    }
    else if ($('#txtLoginName').val() == '') {
        $.bootstrapGrowl("Enter Login Name ! ", { type: 'danger', delay: 8000, });
        $('#txtLoginName').focus();
        zResult = false;
    }
    else if ($('#TxtEmailID').val() == '') {
        $.bootstrapGrowl("Enter Email ID ! ", { type: 'danger', delay: 8000, });
        $('#TxtEmailID').focus();
        zResult = false;
    }
    else if ($('#ddlGender').val() == null) {
        $.bootstrapGrowl("Select Gender ! ", { type: 'danger', delay: 8000, });
        $('#ddlGender').focus();
        zResult = false;
    }
    else if ($('#ddlRoleID').val() == null) {
        $.bootstrapGrowl("Select RoleID ! ", { type: 'danger', delay: 8000, });
        $('#ddlRoleID').focus();
        zResult = false;
    }
    else if ($('#ddlUserTypeList').val() == null) {
        $.bootstrapGrowl("Select User Type ! ", { type: 'danger', delay: 8000, });
        $('#ddlUserTypeList').focus();
        zResult = false;
    }
    return zResult;

};

var dataSet = [];
function CallDataList() {
    $('#LoadingImage').show();
    var data;
    $.ajax({
        type: 'post',
        url: $('#hf_GetUserMasterList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            try {
                var items = JSON.parse(response.json);
                FetechData(items);
            } catch (e) {

            }
            $('#LoadingImage').hide();
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 8000,
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
                "<img src='" + $(this)[0]["Image"] + "' class='imgCover'/>",
                $(this)[0]["LoginID"],
                $(this)[0]["EmailID"],
                $(this)[0]["UserType"],
                $(this)[0]["RoleName"],
                $(this)[0]["ActiveStatus"],
                $(this)[0]["UserID"]
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
            { title: "Profile" },
            { title: "Login ID" },
            {
                title: "Email ID", "render": function (data, type, full, meta) {
                    return '<div class=spEmail>' + data + '</div>';
                }
            },
            { title: "User Type" },
            { title: "Role" },
            { title: "Status" },
            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<center><span class="fa fa-pen" aria-hidden="true" title="Edit" data-col="Name" onclick="UpdateUserInfo(' + isNullCheck(data) + ');"></span></center>';
                }
            }
        ],
        "destroy": true,
        "scrollY": (size.height - 180),
        "scrollX": true,
        "createdRow": function (row, data, dataIndex) {
            $($(row).find('td')[1]).attr('id', data[5]);
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
                text: '<button class="btn btn-primary spAddIcon" style="display:none"><i class="fa fa-user"></i> Add</button>',
                action: function (e, dt, node, config) {
                    UpdateUserInfo(0);
                }

            },
        ]
    });
    CheckAccessRights();
}

function UpdateUserInfo(aIDP) {
    $('#ddlUserList').val(aIDP).change();
    $('#ddlUserTypeList').val(0).change();
    PopulateUserDetails(aIDP);
    $('#myModal_View').modal({ backdrop: 'static', keyboard: false });
}