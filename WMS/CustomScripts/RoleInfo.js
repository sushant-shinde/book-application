$(function () {
    $('#FormUserInfo').css('height', size.height - 150);
    $('.tblRightsList').css('height', size.height - 150);
    $("#ddlRole_Info").select2({ placeholder: "Select", allowClear: true });
    $('#MainMenuID_Role').select2({
        closeOnSelect: false,
        placeholder: "Select Menus(s)",
        allowHtml: true,
        allowClear: true,
        tags: true
    });

    $('#txtRoleName').change(function (e) {
        //var value = $(this).val();
        //if (value.length < 2) {
        //    $.bootstrapGrowl("RoleName too short !;", {
        //        type: 'warning',
        //        delay: 5000,
        //    });
        //    $(this).val('');
        //}
    });
    $('#txtRoleName').change(function (e) {
        CheckExistingRole($(this).val(), 'Role Name');
    });

    $('#ddlRole_Info').change(function () {
        $('#BtnDelete_RA').show();
        $("#tblRightsList tbody tr td input").each(function () {
            $(this).removeAttr('checked');
        });
        var data = { zRoleID: $(this).val() }
        $.ajax({
            type: 'post',
            url: $('#hf_RoleInfoPopulate').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var items = response.aitemList;
                var items1 = response.itemsList;
                if (items.length == 0) {
                    return false;
                }
                $('#txtRoleName').val(items[0]["RoleName"]);
                $('#txtDescription').val(items[0]["Description"]);
                $('#txtUpdatedBy').val(items[0]["UpdatedBy"]);
                $.each(items, function (index, e) {
                    var MenuName = e.MenuName.replace(/\s/g, '');
                    if ($("#tblRightsList tbody tr#tr_" + MenuName).length > 0) {
                        if (e.Actions.toString().indexOf("Add") > -1) {
                            $($("#tblRightsList tbody tr#tr_" + MenuName).find('input')[0]).prop('checked', 'checked');
                        }
                        if (e.Actions.toString().indexOf("Update") > -1) {
                            $($("#tblRightsList tbody tr#tr_" + MenuName).find('input')[1]).prop('checked', 'checked');
                        }
                        if (e.Actions.toString().indexOf("Delete") > -1) {
                            $($("#tblRightsList tbody tr#tr_" + MenuName).find('input')[2]).prop('checked', 'checked');
                        }
                        if (e.Actions.toString().indexOf("View") > -1) {
                            $($("#tblRightsList tbody tr#tr_" + MenuName).find('input')[3]).prop('checked', 'checked');
                        }
                    }
                });

            },
            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 5000,
                });
            }
        });
    });


    $('#BtnUpdate_RA').click(function () {

        var validate = ValidateForm('#FormUserInfo');
        if (validate) {

            var aitemInfoP = {

                RoleID: ($('#ddlRole_Info').val() == null ? null : $('#ddlRole_Info').val().toString()),
                RoleName: $('#txtRoleName').val(),
                Description: $('#txtDescription').val(),
                UpdatedBy: $('#txtUpdatedBy').val()
            }
            $.ajax({
                type: 'post',
                url: $('#hf_RoleInfoUpdate').val(),
                data: JSON.stringify(aitemInfoP),
                contentType: 'application/json;charset=utf-8',
                datatype: 'json',
                success: function (response) {

                    InsertMenuActions(response);


                },

                error: function (response) {
                    $.bootstrapGrowl(response, {
                        type: 'danger',
                        delay: 5000,
                    });
                }
            });

        }

    });
    $('#BtnDelete_RA').click(function () {

        bootbox.confirm("Are you sure to delete this Role ?",
            function (result) {
                if (result) {
                    var data =
                    {
                        zRoleID: $('#ddlRole_Info').val()

                    };
                    $.ajax({
                        type: 'post',
                        url: $('#hf_RoleDelete').val(),
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
                                $.bootstrapGrowl('Role Deleted Successfully!', {
                                    type: 'info',
                                    delay: 5000,
                                });
                                $('#ddlRole_Info option[value="' + $('#ddlRole_Info').val() + '"]').remove();

                                ClearRoleData();
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


    });


    $('#BtnCancel_RA').click(function () {
        ClearRoleData();
        $('#BtnDelete_RA').hide();
    });
    $("#ddlRole_Info").val(-1).change();

    $('.chkActionAll').change(function () {
        if ($(this).is(':checked'))
            $('.chkAction').not('[disabled="disabled"]').prop('checked', 'checked');
        else
            $('.chkAction').not('[disabled="disabled"]').removeAttr('checked');
    });
});

function InsertMenuActions(zRoleID) {

    $('#LoadingImage').show();

    var getAccesList = GetTableRowToList('tblRightsList');
    if (getAccesList.length == 0) {
        $.bootstrapGrowl("Add Roles Access details !", { type: 'danger', delay: 5000, });
        return false;
    }
    var data = {
        zRoleID: ($('#ddlRole_Info').val() == null ? zRoleID : $('#ddlRole_Info').val().toString()),
        AccessList: getAccesList
    }
    $.ajax({
        type: 'post',
        url: $('#hf_RoleAccessUpdate').val(),
        data: data,
        datatype: 'json',
        traditional: true,
        success: function (response) {
            $.bootstrapGrowl(response, {
                type: 'info',
                delay: 5000,

            });
            ClearRoleData();

            $('#ddlRole_Info').val(-1).change();
            $('#LoadingImage').hide();
            $('#BtnDelete_RA').hide();

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


$(document).ready(function () {
    MenuData();
    $('#BtnDelete_RA').hide();
});

function MenuData() {
    $("#tblRightsList tbody tr").each(function () {
        $(this).remove();
    });
    $.ajax({
        type: 'post',
        url: $('#hf_RoleInfoPopulate').val(),
        data: JSON.stringify(),
        datatype: 'json',
        success: function (response) {
            var items1 = response.itemsList;
            if (items1.length == 0) {

                return false;
            }
            for (var i = 0; i < items1.length; i++) {
                var Stable = "<tr id='tr_" + items1[i].MenuName.replace(/\s/g, '') + "'>";
                Stable += "<td>" + items1[i].MenuName + "</td>"
                    + "<td>" + (items1[i].Description.toString().indexOf('Add') > -1 ? "<input class='chkAction' type='checkbox' name='Add'/>" : "<input class='chkAction' type='checkbox' name='Add' disabled='disabled'/>") + "</td>"
                    + "<td>" + (items1[i].Description.toString().indexOf('Update') > -1 ? "<input class='chkAction' type='checkbox' name='Update'/>" : "<input class='chkAction' type='checkbox' name='Update' disabled='disabled'/>") + "</td>"
                    + "<td>" + (items1[i].Description.toString().indexOf('Delete') > -1 ? "<input class='chkAction' type='checkbox' name='Delete'/>" : "<input class='chkAction' type='checkbox' name='Delete' disabled='disabled'/>") + "</td>"
                    + "<td>" + (items1[i].Description.toString().indexOf('View') > -1 ? "<input class='chkAction' type='checkbox' name='View'/>" : "<input class='chkAction' type='checkbox' name='View' disabled='disabled'/>") + "</td>";
                Stable + '</tr>';

                $("#tblRightsList tbody").append(Stable);
            }

            $('.chkAction').click(function () {
                if ($(this).is(":checked"))
                    $(this).attr('checked', 'checked');
                else
                    $(this).removeAttr('checked');
            });
        },
        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
        }
    });
}

function ClearRoleData() {
    $('#ddlRole_Info').val(null).change();
    $('#txtRoleName').val('');
    $('#MainMenuID_Role').val('').change();
    $('#txtDescription').val('');
    $('#txtUpdatedBy').val('');


}

function CheckExistingRole(itemP, zType) {

    var data = { ValueData: itemP, zType: zType, zTableName: "Role" };
    $.ajax({
        type: 'get',
        url: $('#hf_CheckExistingData_Role').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            if (response) {
                $.bootstrapGrowl(zType + ' already found !', {
                    type: 'danger',
                    delay: 5000,
                });
                $('#txtRoleName').val('');
            }

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
    if ($('#txtRoleName').val() == '') {
        $.bootstrapGrowl('Enter Role Name !', { type: 'danger', delay: 5000, });
        $('#txtRoleName').focus();
        zResult = false;
    }
    else if ($('#txtDescription').val() == '') {
        $.bootstrapGrowl("Enter Description !", { type: 'danger', delay: 5000, });
        $('#txtDescription').focus();
        zResult = false;
    }
    else if ($('#txtUpdatedBy').val() == '') {
        $.bootstrapGrowl("Enter Updated By !", { type: 'danger', delay: 5000, });
        $('#txtUpdatedBy').focus();
        zResult = false;
    }

    //else if ($('#ddlRole_Info').val() == '0') {
    //    $.bootstrapGrowl("Select Role Name !", { type: 'danger', delay: 5000, });
    //    $('#ddlRole_Info').focus();
    //    zResult = false;
    //}

    //else if ($('#MainMenuID_Role').val() == '0') {
    //    $.bootstrapGrowl("Select Menu Name !", { type: 'danger', delay: 5000, });
    //    $('#MainMenuID_Role').focus();
    //    zResult = false;
    //}


    return zResult;

};












