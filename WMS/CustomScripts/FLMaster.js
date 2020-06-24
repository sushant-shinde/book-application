var aFreelancerIDG = 0;
var aStateID = 0;
var aCityID = 0;
$(function () {
    $('#lstPublisherList').select2({ closeOnSelect: false, placeholder: "Select Publishers" });
    $('#lstLanguageList').select2({ closeOnSelect: false, placeholder: "Select Languages" });
    $('#lstInterest').select2({ closeOnSelect: false, placeholder: "Select Interests" });
    $('#lstRestriction').select2({ closeOnSelect: false, placeholder: "Select Restriction" });
    $('#lstSourceList').select2({ closeOnSelect: false, placeholder: "Select Source", tags: true });

    $('#ddlActiveStatus').select2({ placeholder: "Select Active", allowClear: true });
    $('#ddlGender').select2({ placeholder: "Select", allowClear: true });
    $('#ddlCountryList').select2({ placeholder: "Select", allowClear: true });
    $('#ddlState').select2({ placeholder: "Select", allowClear: true });
    $('#ddlCity').select2({ placeholder: "Select", allowClear: true });
    $('#ddlAvailable').select2({ placeholder: "Select Available", allowClear: true });
    $('#ddlTaskList').select2({ placeholder: "Select Task", allowClear: true, tags: true });

    $('#ddlNDADoc').select2({ placeholder: "Select", allowClear: true });

    $('#TxtFromDate,#TxtToDate').datetimepicker({
        format: 'd M Y',
        //value: new Date(),
        timepicker: false,
        scrollMonth: false,
        scrollInput: false
    });

    $("#TxtEmailID,#TxtEmailID1").change(function (e) {
        var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
        if (filter.test($(this).val())) {
            return true;
        }
        else {
            $.bootstrapGrowl('Invalid EmailID ! ', {
                type: 'danger',
                delay: 8000,
            });
            $(this).val('');
        }
    });

    $('#TxtDOB').datetimepicker({
        format: 'd M Y',
        //value: new Date(),
        timepicker: false,
        maxDate: today,
        scrollMonth: false,
        scrollInput: false
    });
    CallDataList()

    //Available Change Event
    $('#ddlAvailable').change(function () {
        if ($(this).val() == 'Yes') {
            $('#TxtFromDate,#TxtToDate').attr('disabled', 'disabled');
            $('#TxtFromDate,#TxtToDate').val('');
            $('#TxtFromDate,#TxtToDate').removeClass('inputHandCursor');
        }
        else if ($(this).val() == 'No') {
            $('#TxtFromDate,#TxtToDate').addClass('inputHandCursor')
            $('#TxtFromDate,#TxtToDate').removeAttr('disabled');
        }
    });

    //Country Change Event
    $('#ddlCountryList').change(function () {
        $('#ddlState').empty();
        var data = { nCountryID: $(this).val() };
        $.ajax({
            type: 'post',
            url: $('#hf_GetStateList_ByCountry').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                $('#ddlState').empty();
                var aitemP = JSON.parse(response.json);
                $.each(aitemP, function (e, val) {
                    $('#ddlState').append('<option value="' + val.ID + '">' + val.StateName + '</option>');
                });

                if (aStateID != 0)
                    $('#ddlState').val(aStateID).change();
                else
                    $('#ddlState').val(-1).change();

                $('#ddlState').removeAttr('disabled');
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

    //Country Change Event
    $('#ddlState').change(function () {
        $('#ddlCity').empty();
        var data = { nStateID: $(this).val() };
        $.ajax({
            type: 'post',
            url: $('#hf_GetCityList_ByState').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                $('#ddlCity').empty();
                var aitemP = JSON.parse(response.json);
                $.each(aitemP, function (e, val) {
                    $('#ddlCity').append('<option value="' + val.ID + '">' + val.CityName + '</option>');
                });
                if (aCityID != 0)
                    $('#ddlCity').val(aCityID).change();
                else
                    $('#ddlCity').val(-1).change();

                $('#ddlCity').removeAttr('disabled');
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

    //EmailID Validation
    $('#TxtEmailID').change(function (e) {
        CheckExistingData($(this).val(), 'EmailID');
    });


    //Add Task Table Row Event
    $('#btnAddTask').click(function () {
        AddTaskRow();
    });

    //Update Freelancer Master
    $('#btnUpdate').click(function () {
        SaveMaster();
    });
});

function CheckExistingData(itemP, zType) {
    $('.modal-footer .btn').attr('disabled', 'disabled');
    var data = { ValueData: itemP, zType: zType, zTableName: "Freelancer" };
    $.ajax({
        type: 'get',
        url: $('#hf_CheckExistingData').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            if (response) {
                $.bootstrapGrowl(zType + ' already found ! ', {
                    type: 'danger',
                    delay: 3000,
                });
                $('#Txt' + zType).val('');
            }
            $('.modal-footer .btn').removeAttr('disabled');
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again ! ', {
                type: 'danger',
                delay: 3000,
            });
            $('.modal-footer .btn').removeAttr('disabled');
        }
    });
}


var zActHostpath = document.location.pathname.split('/')[1];
function onerrorImageLoad() {
    $('#imgProfile').attr('src', '/' + zActHostpath + "/img/user.jpg");
}
var dataSet = [];
function CallDataList() {
    $('#LoadingImage').show();
    var data = null;
    $.ajax({
        type: 'post',
        url: $('#hf_GetMasterList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var items = JSON.parse(response.json);
            var aSourceitems = response.aSrcItemList;
            FetechData(items);
            $('#lstSourceList').empty();
            $.each(aSourceitems, function (e, val) {
                $('#lstSourceList').append('<option value="' + val.ID + '">' + val.SourceName + '</option>');
            })
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
function showPreview(objFileInput) {
    var ext = $('#imageUploadForm').val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['png', 'jpg', 'jpeg']) == -1) {
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
            $('#imgProfile').attr('src', e.target.result);
        }
        fileReader.readAsDataURL(objFileInput.files[0]);
    }

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
                $(this)[0]["Name"],
                $(this)[0]["EmailID"],
                $(this)[0]["TaskList"],
                $(this)[0]["Publishers"],
                $(this)[0]["Country"],
                $(this)[0]["Available"],
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
            { title: "S.No." },
            { title: "Profile" },
            { title: "Name" },
            {
                title: "Email ID", "render": function (data, type, full, meta) {
                    return '<span class=spEmail>' + data + '</span>';
                }
            },
            {
                title: "Task List", "render": function (data, type, full, meta) {
                    return '<span class="spCol1" data-toggle="tooltip" title="' + data + '">' + data + '</span>';
                }
            },
            {
                title: "Publishers", "render": function (data, type, full, meta) {
                    return '<span class="spCol1" data-toggle="tooltip" title="' + data + '">' + data + '</span>';
                }
            },
            { title: "Country" },
            { title: "Available" },
            {
                title: "<center>Actions</center>", "bSortable": false, "render": function (data, type, full, meta) {
                    return '<center><span class=spDeleteIcon style="display:none"><i class="fa fa-trash" aria-hidden="true" title="Delete" data-col="Name" onclick="DeleteMaster(' + isNullCheck(data) + ');"></i></span>' +
                        '<span class=spUpdateIcon style="display:none"><i class="fa fa-pen" aria-hidden="true" title = "Edit" data-col="Name" onclick="UpdateInfo(' + isNullCheck(data) + ');" ></i></span></center> ';
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
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'FreelancerMaster' + today.toShortFormatWithTime(),

                title: 'Freelancer Master',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7],
                    format: {
                        header: function (data, row, column, node) {
                            var zheader = data.toString().split('<div class="dropdown')[0];
                            zheader = zheader.toString().split('<i class="fa fa-filter')[0];
                            return zheader.replace('<br>', '');
                        }
                    }
                }
            },
            {
                extend: 'pdfHtml5',
                text: '<img src="../Images/pdf.png" title="Export to PDF" />',
                filename: 'FreelancerMaster' + today.toShortFormatWithTime(),

                title: 'Freelancer Master',
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7],
                    format: {
                        header: function (data, row, column, node) {
                            var zheader = data.toString().split('<div class="dropdown')[0];
                            zheader = zheader.toString().split('<i class="fa fa-filter')[0];
                            return zheader.replace('<br>', '');
                        },
                    }
                }

            },
            {
                text: '<button class="btn btn-primary spAddIcon" style="display:none"><i class="fa fa-user"></i> Add</button>',
                action: function (e, dt, node, config) {
                    clearForm('#myModal');
                    $('#ULTabul li').removeClass('active');
                    $('#ULTabul li:first').addClass('active in');
                    $('.tab-content div.tab-pane').removeClass('active');
                    $('#divPrimary').addClass('active in');
                    aFreelancerIDG = 0;
                    aStateID = 0;
                    aCityID = 0;
                    $('#ddlState').attr('disabled', 'disabled');
                    $('#ddlCity').attr('disabled', 'disabled');
                    $("#tblTask tbody").html("");
                    UpdateInfo(0);
                }

            }
        ]
    });
    CheckAccessRights();
}

function DeleteMaster(aID) {
    bootbox.confirm("Are you sure to delete the Freelancer?",
        function (result) {
            if (result) {
                $('#LoadingImage').show();
                var data = { nID: aID }
                $.ajax({
                    type: 'post',
                    url: $('#hf_DeleteFreelancer').val(),
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
                        $('#LoadingImage').hide();
                    }
                });
            }
        });

}


function UpdateInfo(aID) {
    $('#LoadingImage').show();
    $('#imgProfile').attr('src', '../img/user.jpg');
    $("#imageUploadForm").val(null);
    if (aID != 0) {
        aFreelancerIDG = aID;
        aStateID = 0;
        aCityID = 0;
        clearForm('#myModal');
        $('#ULTabul li').removeClass('active');
        $('#ULTabul li:first').addClass('active in');
        $('.tab-content div.tab-pane').removeClass('active');
        $('#divPrimary').addClass('active in');

        var data = { nID: aID };
        $.ajax({
            type: 'post',
            url: $('#hf_PopulateFreelancer').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                var aitems = JSON.parse(response.aItemList);
                //Populate Primary ,Personnel Data
                $('#TxtName').val(aitems[0].Name);
                $('#TxtDOB').val(FormatDate(aitems[0].DOB));
                $("#ddlAvailable").val(aitems[0].Available).change();
                if (aitems[0].FromDate != null)
                    $('#TxtFromDate').val(FormatDate(aitems[0].FromDate));
                if (aitems[0].ToDate != null)
                    $("#TxtToDate").val(FormatDate(aitems[0].ToDate));

                $('#ddlGender').val(aitems[0].Gender).change();
                $('#TxtAddress').val(aitems[0].Address);
                $('#ddlCountryList').val(aitems[0].CountryID).change();
                aStateID = aitems[0].StateID;
                aCityID = aitems[0].CityID;

                $('#TxtPincode').val(aitems[0].Pincode);

                $('#TxtEmailID').val(aitems[0].EmailID);
                $('#TxtEmailID1').val(aitems[0].EmailID1);
                $('#TxtSkypeId').val(aitems[0].SkypeId);
                $('#TxtMobileNo').val(aitems[0].MobileNo);
                //Specialization: $('#TxtEmailID').val(), PerformanceRecord: $('#TxtEmailID1').val(),

                $('#TxtBank').val(aitems[0].BankName);
                $('#TxtAccountNo').val(aitems[0].AccountNo);
                $('#TxtIFSC').val(aitems[0].IFSCCode);
                $('#TxtBranch').val(aitems[0].BranchName);
                $('#ddlNDADoc').val(aitems[0].NDADocument).change();
                $('#TxtPANCard').val(aitems[0].PANCard);

                //PublisherList
                var data = aitems[0].PublisherList.split(',');
                var selectedValues = new Array();
                try {
                    for (var i = 0; i < data.length; i++) {
                        selectedValues[i] = data[i];
                    }
                } catch (e) { }

                $('#lstPublisherList').val(selectedValues).change();

                //Language
                data = aitems[0].Language.split(',');
                selectedValues = new Array();
                try {
                    for (var i = 0; i < data.length; i++) {
                        selectedValues[i] = data[i];
                    }
                } catch (e) { }

                $('#lstLanguageList').val(selectedValues).change();

                //Source
                data = aitems[0].Source.split(',');
                selectedValues = new Array();
                try {
                    for (var i = 0; i < data.length; i++) {
                        selectedValues[i] = data[i];
                    }
                } catch (e) { }

                $('#lstSourceList').val(selectedValues).change();

                //Interest
                if (aitems[0].Interest != null) {
                    data = aitems[0].Interest.split(',');
                }
                else
                    data = null;
                selectedValues = new Array();
                try {
                    for (var i = 0; i < data.length; i++) {
                        selectedValues[i] = data[i];
                    }
                } catch (e) { }

                $('#lstInterest').val(selectedValues).change();

                //Restriction
                if (aitems[0].Restriction != null) {
                    data = aitems[0].Restriction.split(',');
                }
                else
                    data = null;
                selectedValues = new Array();
                try {
                    for (var i = 0; i < data.length; i++) {
                        selectedValues[i] = data[i];
                    }
                } catch (e) { }
                $('#lstRestriction').val(selectedValues).change();

                $('#ddlActiveStatus').val(aitems[0].IsActive).change();

                if (aitems[0].Image == null)
                    $('#imgProfile').attr('src', '../img/user.jpg');
                else
                    $('#imgProfile').attr('src', aitems[0].Image);

                $('#TxtRemarks').val(aitems[0].Remarks);

                //Populate Task List
                $("#tblTask tbody").html("");
                var aTaskListL = response.aTaskList;
                $.each(aTaskListL, function (e, val) {
                    var zRowLenth = $("#tblTask tbody").find("tr").length;
                    var nRowL = "<tr><td>" + (zRowLenth + 1).toString() + "</td>"
                        + "<td width='15%'>" + val.TaskName + "</td>"
                        + "<td><input type='text' class='IsNumeric PP' value='" + isNullCheck(val.Price).toString() + "'/></td>"
                        + "<td><input type='text' class='IsNumeric PC' value='" + isNullCheck(val.Capacity).toString() + "'/></td>"
                        + "<td><input type='text' class='IsNumeric WP' value='" + isNullCheck(val.WordPrice).toString() + "'/></td>"
                        + "<td><input type='text' class='IsNumeric WC' value='" + isNullCheck(val.WordCapacity).toString() + "'/></td>"
                        + "<td><input type='text' class='IsNumeric TP' value='" + isNullCheck(val.TablePrice).toString() + "'/></td>"
                        + "<td><input type='text' class='IsNumeric TC' value='" + isNullCheck(val.TableCapacity).toString() + "'/></td>"
                        + "<td><input type='text' class='IsNumeric FP' value='" + isNullCheck(val.FigurePrice).toString() + "'/></td>"
                        + "<td><input type='text' class='IsNumeric FC' value='" + isNullCheck(val.FigureCapacity).toString() + "'/></td>"
                        + "<td  width='8%' style='text-align: center'><i class='fas fa-trash' onclick='DeleteTaskRow(this);'></i></td>"
                        + "</tr>";
                    $("#tblTask tbody").append(nRowL);
                });

                $('#myModal').modal({ backdrop: 'static', keyboard: false });

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
    else {

        $('#myModal').modal({ backdrop: 'static', keyboard: false });
    }
}

function AddTaskRow() {
    if ($('#ddlTaskList').val() == null) {
        $.bootstrapGrowl('Please Select Task !', {
            type: 'warning',
            delay: 5000,
        });
        $('#ddlTaskList').focus();
        return false;
    }
    //else if ($('#TxtPrice').val() == '') {
    //    $.bootstrapGrowl('Please Enter Price !', {
    //        type: 'warning',
    //        delay: 5000,
    //    });
    //    $('#TxtPrice').focus();
    //    return false;
    //}
    //else if ($('#TxtCapacityAdd').val() == '') {
    //    $.bootstrapGrowl('Please Enter Capacity !', {
    //        type: 'warning',
    //        delay: 5000,
    //    });
    //    $('#TxtPrice').focus();
    //    return false;
    //}
    var zChkVal = true;
    $.each($("#tblTask tbody tr"), function (e) {
        var zPreVal = $(this).find('td')[1].innerText.toLowerCase();
        if (zPreVal == $('#ddlTaskList option:selected').text().toLowerCase()) {
            $.bootstrapGrowl('Already Task Added !', {
                type: 'danger',
                delay: 5000,
            });
            zChkVal = false;
            return false;
        }
    });
    if (zChkVal) {
        var zRowLenth = $("#tblTask tbody").find("tr").length;
        var nRowL = "<tr><td>" + (zRowLenth + 1).toString() + "</td>"
            + "<td width='15%'>" + $('#ddlTaskList option:selected').text() + "</td>"
            + "<td><input type='text' class='IsNumeric PP' value='0'/></td>"
            + "<td><input type='text' class='IsNumeric PC' value='0'/></td>"
            + "<td><input type='text' class='IsNumeric WP' value='0'/></td>"
            + "<td><input type='text' class='IsNumeric WC' value='0'/></td>"
            + "<td><input type='text' class='IsNumeric TP' value='0'/></td>"
            + "<td><input type='text' class='IsNumeric TC' value='0'/></td>"
            + "<td><input type='text' class='IsNumeric FP' value='0'/></td>"
            + "<td><input type='text' class='IsNumeric FC' value='0'/></td>"
            + "<td width='8%' style='text-align: center'><i class='fas fa-trash' onclick='DeleteTaskRow(this);'></i></td>"
            + "</tr>";
        $("#tblTask tbody").append(nRowL);
        //$('#TxtPrice').val('');
        //$('#TxtCapacityAdd').val('');
        $('#ddlTaskList').val(-1).change();
    }
}
function DeleteTaskRow(btndel) {
    $(btndel).closest("tr").remove();
    $("table#tblTask tbody").each(function () {
        $(this).children().each(function (index) {
            $(this).find('td').first().html(index + 1);
        });
    });
}

function ActvieTab(aitem) {
    if (aitem == '1') {
        $('#ULTabul li').removeClass('active');
        $('#ULTabul li:first').addClass('active in');
        $('.tab-content div.tab-pane').removeClass('active');
        $('#divPrimary').addClass('active in');
    }
    if (aitem == '2') {
        $('#ULTabul li').removeClass('active');
        $('#ULTabul li:nth-child(2)').addClass('active in');
        $('.tab-content div.tab-pane').removeClass('active');
        $('#divTask').addClass('active in');
    }
    else if (aitem == '3') {
        $('#ULTabul li').removeClass('active');
        $('#ULTabul li:nth-child(3)').addClass('active in');
        $('.tab-content div.tab-pane').removeClass('active');
        $('#divPersonal').addClass('active in');
    }
}
//Save Freelancer Master
function ValidateForm(form) {
    var zResult = true;
    if ($('#TxtName').val() == '') {
        $.bootstrapGrowl('Enter Name ! ', { type: 'danger', delay: 5000, });
        ActvieTab(1);
        $('#TxtName').focus();
        zResult = false;
    }
    else if ($('#ddlActiveStatus').val() == null) {
        $.bootstrapGrowl("Select Active Status ! ", { type: 'danger', delay: 5000, });
        ActvieTab(1);
        $('#ddlActiveStatus').focus();
        zResult = false;
    }
    else if ($('#ddlAvailable').val() == null) {
        $.bootstrapGrowl("Select Available Status ! ", { type: 'danger', delay: 5000, });
        ActvieTab(1);
        $('#ddlAvailable').focus();
        zResult = false;
    }
    else if ($('#ddlAvailable').val() == 'No' && $('#TxtFromDate').val() == '' && $('#TxtToDate').val() == '') {
        $.bootstrapGrowl("Select From/To Date ! ", { type: 'danger', delay: 5000, });
        ActvieTab(1);
        $('#TxtFromDate').focus();
        zResult = false;
    }
    else if ($('#lstPublisherList').val() == null) {
        $.bootstrapGrowl('Select Publisher !', { type: 'danger', delay: 5000 });
        ActvieTab(1);
        $('#lstPublisherList').focus();
        zResult = false;
    }
    //else if ($('#lstInterest').val() == null) {
    //    $.bootstrapGrowl('Select Interest !', { type: 'danger', delay: 5000 });
    //    ActvieTab(1);
    //    $('#lstPublisherList').focus();
    //    zResult = false;
    //}
    else if ($('#TxtEmailID').val() == '') {
        $.bootstrapGrowl('Enter EmailID !', { type: 'danger', delay: 5000 });
        ActvieTab(1);
        $('#TxtEmailID').focus();
        zResult = false;
    }
    else if ($('#lstSourceList').val() == null) {
        $.bootstrapGrowl('Select Source !', { type: 'danger', delay: 5000 });
        ActvieTab(1);
        $('#lstSourceList').focus();
        return false;
        zResult = false;
    }
    else if ($('#lstLanguageList').val() == null) {
        $.bootstrapGrowl('Select Languages !', { type: 'danger', delay: 5000 });
        ActvieTab(1);
        $('#lstLanguageList').focus();
        zResult = false;
    }
    //else if ($('#TxtMobileNo').val() == '') {
    //    $.bootstrapGrowl("Enter Mobile No. ! ", { type: 'danger', delay: 5000, });
    //    ActvieTab(3);
    //    $('#TxtMobileNo').focus();
    //    zResult = false;
    //}
    //else if ($('#TxtDOB').val() == '') {
    //    $.bootstrapGrowl("Enter DOB ! ", { type: 'danger', delay: 5000, });
    //    ActvieTab(3);
    //    $('#TxtDOB').focus();
    //    zResult = false;
    //}
    //else if ($('#ddlGender').val() == null) {
    //    $.bootstrapGrowl("Select Gender ! ", { type: 'danger', delay: 5000, });
    //    ActvieTab(3);
    //    $('#ddlGender').focus();
    //    zResult = false;
    //}
    //else if ($('#TxtAddress').val() == '') {
    //    $.bootstrapGrowl("Enter Address ! ", { type: 'danger', delay: 5000, });
    //    ActvieTab(3);
    //    $('#TxtAddress').focus();
    //    zResult = false;
    //}
    //else if ($('#ddlCountryList').val() == null) {
    //    $.bootstrapGrowl("Select Country ! ", { type: 'danger', delay: 5000, });
    //    ActvieTab(3);
    //    $('#ddlCountryList').focus();
    //    zResult = false;
    //}
    //else if ($('#ddlState').val() == null) {
    //    $.bootstrapGrowl("Select State ! ", { type: 'danger', delay: 5000, });
    //    ActvieTab(3);
    //    $('#ddlState').focus();
    //    zResult = false;
    //}
    //else if ($('#ddlCity').val() == null) {
    //    $.bootstrapGrowl("Select City ! ", { type: 'danger', delay: 5000, });
    //    ActvieTab(3);
    //    $('#ddlCity').focus();
    //    zResult = false;
    //}
    //else if ($('#ddlNDADoc').val() == null) {
    //    $.bootstrapGrowl("Select NDA Document ! ", { type: 'danger', delay: 5000, });
    //    ActvieTab(3);
    //    $('#ddlNDADoc').focus();
    //    zResult = false;
    //}
    //else if ($('#TxtPincode').val() == null || $('#TxtPincode').val() == '') {
    //    $.bootstrapGrowl("Enter Pincode ! ", { type: 'danger', delay: 5000, });
    //    ActvieTab(3);
    //    $('#TxtPincode').focus();
    //    zResult = false;
    //}
    //else if ($('#TxtPANCard').val() == '') {
    //    $.bootstrapGrowl("Enter PAN Card or Tax No ! ", { type: 'danger', delay: 5000, });
    //    ActvieTab(3);
    //    $('#TxtPANCard').focus();
    //    zResult = false;
    //}

    return zResult;

};

function GetTaskRowtoJson() {
    var data = [];
    var itemrow = $('#divTask #tblTask tbody tr');
    $.each(itemrow, function (e, val) {
        data.push({
            "SNo": $(val).find('td')[0].innerText,
            "Task Name": $(val).find('td')[1].innerText,
            "Price": $($(this).find('td .PP')[0]).val(),
            "Capacity": $($(this).find('td .PC')[0]).val(),
            "WordPrice": $($(this).find('td .WP')[0]).val(),
            "WordCapacity": $($(this).find('td .WC')[0]).val(),
            "TablePrice": $($(this).find('td .TP')[0]).val(),
            "TableCapacity": $($(this).find('td .TC')[0]).val(),
            "FigurePrice": $($(this).find('td .FP')[0]).val(),
            "FigureCapacity": $($(this).find('td .FC')[0]).val(),
        });
    });
    return data;
}
function SaveMaster() {
    var validate = ValidateForm();
    if (validate) {
        ActvieTab(2);
        var getTaskList = GetTaskRowtoJson(); //$('#divTask #tblTask').tableToJSON();
        if (getTaskList.length == 0) {
            $.bootstrapGrowl('Add Task Details !', { type: 'danger', delay: 5000, });
            ActvieTab(2);
            return false;
        }
        $('#myModal').modal('hide');
        $('#LoadingImage').show();
        var aitemInfoP = {
            ID: aFreelancerIDG,
            Name: $('#TxtName').val(), DOB: $('#TxtDOB').val(),
            Available: $("#ddlAvailable").val(),
            FromDate: $('#TxtFromDate').val(),
            ToDate: $("#TxtToDate").val(),
            Gender: $('#ddlGender').val(),
            Address: $('#TxtAddress').val(),
            CountryID: $('#ddlCountryList').val(), StateID: $('#ddlState').val(),
            CityID: $('#ddlCity').val(), Pincode: $('#TxtPincode').val(),
            EmailID: $('#TxtEmailID').val(), EmailID1: $('#TxtEmailID1').val(),
            SkypeId: $('#TxtSkypeId').val(), MobileNo: $('#TxtMobileNo').val(),
            //Specialization: $('#TxtEmailID').val(), PerformanceRecord: $('#TxtEmailID1').val(),
            BankName: $('#TxtBank').val(), AccountNo: $('#TxtAccountNo').val(),
            IFSCCode: $('#TxtIFSC').val(), BranchName: $('#TxtBranch').val(),
            NDADocument: $('#ddlNDADoc').val(), PANCard: $('#TxtPANCard').val(),
            PublisherList: $('#lstPublisherList').val().toString(),
            Language: $('#lstLanguageList').val().toString(),
            Capacity: $('#TxtCapacity').val(),
            Source: $('#lstSourceList').val().toString(),
            Interest: ($('#lstInterest').val() == null ? null : $('#lstInterest').val().toString()),
            Restriction: ($('#lstRestriction').val() == null ? null : $('#lstRestriction').val().toString()),
            IsActive: $('#ddlActiveStatus').val(),
            Image: $('#imgProfile').attr('src'),
            Remarks: $('#TxtRemarks').val(),
            aTaskListL: JSON.stringify(getTaskList)
        }

        $.ajax({
            type: 'post',
            url: $('#hf_SaveMaster').val(),
            data: JSON.stringify(aitemInfoP),
            contentType: 'application/json;charset=utf-8',
            datatype: 'json',
            traditional: true,
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
                $('#myModal').modal('hide');
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