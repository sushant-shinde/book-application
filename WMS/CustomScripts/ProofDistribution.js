var dataSet = [];
var aUploadType = "";
var aCatalog = "";
var aBookTitle = "";
var aBookID = "";
var aPEEmail = "";
var aPMEmail = "";
var aPMName = "";
var aTSPMEmail = "";
var aAuthorName = "";
var aEditorName = "";
var aAuthorEmail = "";
var aMonoMailbody = "";
var aAuthorMailbody = "";
var aEditorMailbody = "";
var aAUIntroMailbody = "";
var aAUIntroMailbodySkipCE = "";
var aEDIntroMailbody = "";
var aContributeIntroMailbody = "";
var aAUCEMailbody = "";
var aEDCEMailbody = "";
var aContributeCEMailbody = "";
var aFinalAUMailbody = "";
var aFinalEDMailbody = "";
var aFinalWelcomeMailbody = "";
var aAUWelcomeMailbody = "";
var aEDWelcomeMailbody = "";
var atoday = new Date();
var aID = 0;
var aPPAUDueDateG; var aFRAUDueDateG; var aVOUDueDateG; var aFVOUDueDateG;
var bookTitle = ""; var bookDetails = ""; var bookCatalogNumber = "";

$(function () {

    //atoday.setDate(atoday.getDate() + 4);

    $('.divBookContent').css('height', size.height - 120);
    $('#TxtAUMailBody').jqte();
    $('#TxtEDMailBody').jqte();
    $('#TxtIntroMailBody').jqte();
    $('#TxtAUPreview').jqte();
    $('#TxtEDPreview').jqte();
    $('#TxtIntroPreview').jqte();
    $('#divLoadChapter').css('height', size.height - 340);
    $('#lstEditorList').select2({
        closeOnSelect: false,
        placeholder: "Select Editor(s)",
        allowHtml: true,
        allowClear: true,
        tags: true
    });
    $('#ddlStage').select2({ placeholder: "Select Stage" });
    $('#ddlStage').val(-1).change();
    $('#ddlEmailTo').select2({ placeholder: "Select" });
    $('#ddlEmailTo').val(-1).change();
    $('#ddlSearch').select2();
    $('#txtEditorDueDt').datetimepicker({
        format: 'd M Y',
        //value: new Date(),
        timepicker: false,
        minDate: atoday,
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });
    $('#txtAuthorDueDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        minDate: atoday,
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });
    $('#txtMonoAuthorDueDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        minDate: atoday,
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });
    $('#txtMonoAuthorDueDt').val()
    $('#txtCEReviewDueDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        minDate: atoday,
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });
    $('#txtCEReviewReturnDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        minDate: atoday,
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });
    $('#txtFirstPageDueDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        minDate: atoday,
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });
    $('#txtFirstPageReturnDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        minDate: atoday,
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });
    $('#txtRevisionDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        minDate: atoday,
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });
    $('#txtAuthorReturnDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        minDate: atoday,
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });
    $('#lstCatalogList').select2({
        closeOnSelect: false,
        placeholder: "Select Catalog(s)",
        allowHtml: true,
        allowClear: true,
        tags: true
    });
    $('#lstNumberList').select2({
        closeOnSelect: false,
        placeholder: "Select Number(s)",
        allowHtml: true,
        allowClear: true,
        tags: true
    });
    $('#lstISBNList').select2({
        closeOnSelect: false,
        placeholder: "Select ISBN(s)",
        allowHtml: true,
        allowClear: true,
        tags: true
    });
    $('#txtAuthorDueDt').change(function () {
        $('.AuthorDueDt').val($('#txtAuthorDueDt').val());
    });
    $('#ddlSearch').change(function () {
        $('#divNumberFilter').hide();
        $('#divCatalogFilter').hide();
        $('#divISBNFilter').hide();

        $('#lstNumberList').val(null).trigger("change");
        $('#lstCatalogList').val(null).trigger("change");
        $('#lstISBNList').val(null).trigger("change");

        var SearchVal = $(this).val();
        if (SearchVal == "Number") {
            $('#divNumberFilter').show();
        }
        else if (SearchVal == "ISBN") {
            $('#divISBNFilter').show();
        }
        else if (SearchVal == "Catalog") {
            $('#divCatalogFilter').show();
        }
    })
    $('#btnBkGet').click(function () {
        LoadProofBookList();
    });
    //Distribute
    $('#btnDistribute').click(function () {

        var IsValid = Validate();
        if (!IsValid)
            return false;
        $('#LoadingImage').show();
        var getDistributeList = [];
        getDistributeList = GetTableRowToList('tblProofChapter', '|');
        if (getDistributeList.length == 0) {
            $.bootstrapGrowl('Add chapter details ! ', {
                type: 'danger', delay: 5000,
            });
            $('#LoadingImage').hide();
            return false;
        }
        aFinalAUMailbody = "";
        aFinalEDMailbody = "";
        aFinalWelcomeMailbody = "";
        if (aUploadType == "Contribute") {
            if ($('#ddlStage').val() == "Intro Email") {
                if ($('#ddlEmailTo').val() == "Author") {
                    aFinalAUMailbody = aContributeIntroMailbody;
                    aFinalWelcomeMailbody = aAUWelcomeMailbody;
                }
                if ($('#ddlEmailTo').val() == "Editor") {
                    aFinalEDMailbody = aEDIntroMailbody;
                    aFinalWelcomeMailbody = aEDWelcomeMailbody;
                }
            }
            else if ($('#ddlStage').val() == "CE Review") {
                aFinalAUMailbody = aAUCEMailbody;
                aFinalEDMailbody = aEDCEMailbody;
            }
            else if ($('#ddlStage').val() == "First Page") {
                aFinalAUMailbody = aAuthorMailbody;
                aFinalEDMailbody = aEditorMailbody;
            }
        }
        else {
            if ($('#ddlStage').val() == "Intro Email") {
                aFinalAUMailbody = aAUIntroMailbody;
                aFinalWelcomeMailbody = aAUWelcomeMailbody;
            }
            else if ($('#ddlStage').val() == "CE Review") {
                aFinalAUMailbody = aAUCEMailbody;
            }
            else if ($('#ddlStage').val() == "First Page") {
                aFinalAUMailbody = aMonoMailbody;

            }
        }

        if (aFinalAUMailbody == "" && aFinalEDMailbody == "" && aFinalWelcomeMailbody == "") {
            $.bootstrapGrowl('Email Templeted not updated! ', {
                type: 'danger', delay: 5000,
            });
            $('#LoadingImage').hide();
            return false;
        }
        $('#myModal').modal('hide');
        var authorDt ="";
        if ($('#txtMonoAuthorDueDt').val() != '')
            authorDt = $('#txtMonoAuthorDueDt').val();
        else
            authorDt = $('#txtAuthorDueDt').val();

        var data = {
            zEditor: $('#lstEditorList').val(),
            zStage: $('#ddlStage').val(),
            zEditorDueDt: $('#txtEditorDueDt').val(),
            zAllED: $('#chkEditorCorrReceive').prop("checked"),
            zEDReminder: $('#chkEditorReminder').prop("checked"),
            zSeries: $('#chkSeries').prop("checked"),
            zEditorName: $('#TxtEditorName').val(),
            zAuthorName: $('#TxtAuthorName').val(),
            zAuthorEmail: $('#TxtAuthorEmail').val(),
            zAuthorDueDt: authorDt,
            zPEinCC: $('#chkMonoPEinCC').prop("checked"),
            zAuthorReminder: $('#chkAuthorReminder').prop("checked"),
            zProofChapterL: getDistributeList,
            zBookID: aBookID,
            zUploadType: aUploadType,
            zAUMailBody: aFinalAUMailbody,
            zEDMailBody: aFinalEDMailbody,
            zWelcomeMailBody: aFinalWelcomeMailbody,
            zPMName: aPMName,
            zPMEmail: aPMEmail,
            zPEEmail: aPEEmail,
            zTSPMEmail: aTSPMEmail,
            zCatalog: aCatalog,
            zBookTitle: aBookTitle,
            ZIntroUser: $('#ddlEmailTo').val(),
            zCEReviewDueDt: $('#txtCEReviewDueDt').val(),
            zCEReviewReturnDt: $('#txtCEReviewReturnDt').val(),
            zFirstPageDueDt: $('#txtFirstPageDueDt').val(),
            zFirstPageReturnDt: $('#txtFirstPageReturnDt').val(),

            zIsBookWise: $('#chkBookwise').prop("checked")
        }
        $.ajax({
            type: 'post',
            url: $('#hf_InsertProof').val(),
            data: data,
            datatype: 'json',
            traditional: true,
            success: function (response) {
                $.bootstrapGrowl(response.msg, {
                    type: 'info',
                    delay: 5000,
                });
                $('#myModal').modal('hide');
                CallData(true, '', '', '', '');
                $('#LoadingImage').hide();
                AddCEHistory();
            },
            error: function (response) {
                $.bootstrapGrowl(response, {
                    type: 'danger',
                    delay: 5000,
                });
                $('#myModal').modal('hide');
                $('#LoadingImage').hide();
            }
        });
    });
    $('#TxtAuthorEmail').change(function () {
        $(".AUEmail").val($(this).val());
    });
    //AU Mail Preview
    $('#btnAUMailPreview').click(function () {
        var IsValid = Validate();
        if (!IsValid)
            return false;
        if (aUploadType == "Contribute") {
            if ($('#ddlStage').val() == "CE Review") {
                $('#TxtAUMailBody').val(aAUCEMailbody);
                $('#myModalAuthor_Review .jqte_editor').html(aContributeCEMailbody);
                $('#myModalAuthor_Review').modal({ backdrop: 'static', keyboard: false });
            }
            if ($('#ddlStage').val() == "First Page") {
                $('#TxtAUMailBody').val(aAuthorMailbody);
                $('#myModalAuthor_Review .jqte_editor').html(aAuthorMailbody);
                $('#myModalAuthor_Review').modal({ backdrop: 'static', keyboard: false });
            }
        }
        else {
            if ($('#ddlStage').val() == "CE Review") {
                $('#TxtAUMailBody').val(aAUCEMailbody);
                $('#myModalAuthor_Review .jqte_editor').html(aAUCEMailbody);
                $('#myModalAuthor_Review').modal({ backdrop: 'static', keyboard: false });
            }
            if ($('#ddlStage').val() == "First Page") {
                $('#TxtAUMailBody').val(aMonoMailbody);
                $('#myModalAuthor_Review .jqte_editor').html(aMonoMailbody);
                $('#myModalAuthor_Review').modal({ backdrop: 'static', keyboard: false });
            }
        }
    })
    //ED Mail Preview
    $('#btnEDMailPreview').click(function () {
        var IsValid = Validate();
        if (!IsValid)
            return false;
        if (aUploadType == "Contribute") {

            if ($('#ddlStage').val() == "CE Review") {
                $('#TxtEDMailBody').val(aEDCEMailbody);
                $('#myModalEditor_Review .jqte_editor').html(aEDCEMailbody);
                $('#myModalEditor_Review').modal({ backdrop: 'static', keyboard: false });
            }
            if ($('#ddlStage').val() == "First Page") {
                $('#TxtEDMailBody').val(aEditorMailbody);
                $('#myModalEditor_Review .jqte_editor').html(aEditorMailbody);
                $('#myModalEditor_Review').modal({ backdrop: 'static', keyboard: false });
            }
        }
    })
    //Intro Mail Preview
    $('#btnIntroPreview').click(function () {
        if (aUploadType == "Mono") {
            $('#TxtIntroMailBody').val(aAUIntroMailbody);
            $('#myModalIntro_Review .jqte_editor').html(aAUIntroMailbody);
            $('#myModalIntro_Review').modal({ backdrop: 'static', keyboard: false });
        }
        else {

            if ($('#ddlEmailTo').val() == null || $('#ddlEmailTo').val() == "") {
                $.bootstrapGrowl("Select Email To", { type: 'danger', delay: 2000, });
                $('#TxtAuthorName').focus();
                aResultL = false;
                return false;
            }

            if ($('#ddlEmailTo').val() == "Author") {
                $('#TxtIntroMailBody').val(aContributeIntroMailbody);
                $('#myModalIntro_Review .jqte_editor').html(aContributeIntroMailbody);
                $('#myModalIntro_Review').modal({ backdrop: 'static', keyboard: false });
            }
            if ($('#ddlEmailTo').val() == "Editor") {
                $('#TxtIntroMailBody').val(aEDIntroMailbody);
                $('#myModalIntro_Review .jqte_editor').html(aEDIntroMailbody);
                $('#myModalIntro_Review').modal({ backdrop: 'static', keyboard: false });
            }
        }
        if ($("#chkce").is(":checked")) {
            $(".trCE").attr("style", "display:none");
        } else {
            $(".trCE").removeAttr("style");
        }
    })
    $('#btnEDMailUpdate').click(function () {
        if (aUploadType == "Contribute") {

            if ($('#ddlStage').val() == "CE Review") {
                aEDCEMailbody = $('#myModalEditor_Review .jqte_editor').html();
            }
            if ($('#ddlStage').val() == "First Page") {
                aEditorMailbody = $('#myModalEditor_Review .jqte_editor').html();
            }
        }
        $.bootstrapGrowl("Mail content updated successfully!", { type: 'info', delay: 2000, });
        $('#myModalEditor_Review').modal('hide');
    })
    $('#btnIntroMailUpdate').click(function () {
        if (aUploadType == "Mono") {
            aAUIntroMailbody = $('#myModalIntro_Review .jqte_editor').html();
        }
        else {
            if ($('#ddlEmailTo').val() == "Author") {
                aContributeIntroMailbody = $('#myModalIntro_Review .jqte_editor').html();
            }
            if ($('#ddlEmailTo').val() == "Editor") {
                aEDIntroMailbody = $('#myModalIntro_Review .jqte_editor').html();
            }
        }
        $.bootstrapGrowl("Mail content updated successfully!", { type: 'info', delay: 2000, });
        $('#myModalIntro_Review').modal('hide');
    })
    $('#btnAUMailUpdate').click(function () {
        if (aUploadType == "Contribute") {

            if ($('#ddlStage').val() == "CE Review") {
                aAUCEMailbody = $('#myModalAuthor_Review .jqte_editor').html();
            }
            if ($('#ddlStage').val() == "First Page") {
                aAuthorMailbody = $('#myModalAuthor_Review .jqte_editor').html();
            }
        }
        else {
            if ($('#ddlStage').val() == "CE Review") {
                aAUCEMailbody = $('#myModalAuthor_Review .jqte_editor').html();
            }
            if ($('#ddlStage').val() == "First Page") {
                aMonoMailbody = $('#myModalAuthor_Review .jqte_editor').html();
            }
        }
        $.bootstrapGrowl("Mail content updated successfully!", { type: 'info', delay: 2000, });
        $('#myModalAuthor_Review').modal('hide');
    });

    $('#ULAUMailBody li').click(function () {
        var aAUPreviewMailbody = "";
        if ($(this)[0].textContent == 'HTML') {
            $('#myModalAuthor_Review #divAUHTML .jqte .jqte_toolbar').css("display", "none");
            $('#myModalAuthor_Review #divAUHTML .jqte .jqte_editor').attr("contenteditable", false);
            aAUPreviewMailbody = $('#myModalAuthor_Review #divAUText .jqte_editor').html();
            if (aUploadType == "Contribute") {
                var getDistributeList = [];
                getDistributeList = GetTableRowToList('tblProofChapter', '|');
                var aChapter = "";
                var aChapterTitle = "";
                var aDueDate = "";
                var aAuthorName = "";
                for (var i = 0; i < getDistributeList.length; i++) {
                    if (getDistributeList[i][0] == true) {
                        aChapter = getDistributeList[i][1];
                        aChapterTitle = getDistributeList[i][2];
                        aDueDate = getDistributeList[i][5];
                        aAuthorName = getDistributeList[i][3];
                        break;
                    }
                }
                if ($('#ddlStage').val() == "CE Review") {
                    var au = aAuthorName.replace(/^\|+;\|+$/g, "");
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{AuthorName}/g, au);
                    if ((au.indexOf(";") > 0) || (au.indexOf(",") > 0) || (au.indexOf(",") > 0)) {
                        aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Salutation}/g, "Drs. ");
                    }
                    else {
                        aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Salutation}/g, "Dr. ");
                    }
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{PMName}/g, aPMName);
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{DueDate}/g, aDueDate);
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Week}/g, diff_weeks(new Date(FormatDate_IE(aDueDate)), new Date()));
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Catalog}/g, aCatalog);
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{BookTitle}/g, aBookTitle);
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{ChapterTitle}/g, aChapterTitle);
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/ChapterNo/g, aChapter);
                }
                if ($('#ddlStage').val() == "First Page") {
                    var au = aAuthorName.replace(/^\|+;\|+$/g, "");
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{AuthorName}/g, au);
                    if ((au.indexOf(";") > 0) || (au.indexOf(",") > 0) || (au.indexOf(",") > 0)) {
                        aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Salutation}/g, "Drs. ");
                    }
                    else {
                        aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Salutation}/g, "Dr. ");
                    }
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{PMName}/g, aPMName);
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{DueDate}/g, aDueDate);
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Week}/g, diff_weeks(new Date(FormatDate_IE(aDueDate)), new Date()));
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Catalog}/g, aCatalog);
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{BookTitle}/g, aBookTitle);
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{ChapterTitle}/g, aChapterTitle);
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/ChapterNo/g, aChapter);
                }
            }
            else {
                if ($('#ddlStage').val() == "CE Review") {
                    var au = $('#TxtAuthorName').val().replace(/^\|+;\|+$/g, "");
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{AuthorName}/g, au);
                    if ((au.indexOf(";") > 0) || (au.indexOf(",") > 0) || (au.indexOf(",") > 0)) {
                        aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Salutation}/g, "Drs. ");
                    }
                    else {
                        aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Salutation}/g, "Dr. ");
                    }
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{PMName}/g, aPMName);
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{DueDate}/g, $('#txtMonoAuthorDueDt').val());
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Week}/g, diff_weeks(new Date(FormatDate_IE($("#txtMonoAuthorDueDt").val())), new Date()));
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Catalog}/g, aCatalog);
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{BookTitle}/g, aBookTitle);
                }
                if ($('#ddlStage').val() == "First Page") {
                    var au = $('#TxtAuthorName').val().replace(/^\|+;\|+$/g, "");
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{AuthorName}/g, au);
                    if ((au.indexOf(";") > 0) || (au.indexOf(",") > 0) || (au.indexOf(",") > 0)) {
                        aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Salutation}/g, "Drs. ");
                    }
                    else {
                        aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Salutation}/g, "Dr. ");
                    }
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{PMName}/g, aPMName);
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{DueDate}/g, $('#txtMonoAuthorDueDt').val());
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Week}/g, diff_weeks(new Date(FormatDate_IE($("#txtMonoAuthorDueDt").val())), new Date()));
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{Catalog}/g, aCatalog);
                    aAUPreviewMailbody = aAUPreviewMailbody.replace(/{BookTitle}/g, aBookTitle);
                }
            }
            $('#TxtAUPreview').val(aAUPreviewMailbody);
            $('#myModalAuthor_Review #divAUHTML .jqte_editor').html(aAUPreviewMailbody);
        }
    });

    $('#ULEDMailBody li').click(function () {
        var aEDPreviewMailbody = "";
        if ($(this)[0].textContent == 'HTML') {
            $('#myModalEditor_Review #divEDHTML .jqte .jqte_toolbar').css("display", "none");
            $('#myModalEditor_Review #divEDHTML .jqte .jqte_editor').attr("contenteditable", false);
            aEDPreviewMailbody = $('#myModalEditor_Review #divEDText .jqte_editor').html();
            if (aUploadType == "Contribute") {
                var getDistributeList = [];
                getDistributeList = GetTableRowToList('tblProofChapter', '|');
                var aChapter = "";
                var aChapterTitle = "";
                var aDueDate = "";
                for (var i = 0; i < getDistributeList.length; i++) {
                    if (getDistributeList[i][0] == true) {
                        aChapter = getDistributeList[i][1];
                        aChapterTitle = getDistributeList[i][2];
                        aDueDate = getDistributeList[i][4];
                        break;
                    }
                }
                var ed = $('#TxtEditorName').val().replace(/^\|+;\|+$/g, "");
                aEDPreviewMailbody = aEDPreviewMailbody.replace(/{EditorName}/g, ed);
                if ((ed.indexOf(";") > 0) || (ed.indexOf(",") > 0) || (ed.indexOf(",") > 0)) {
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{Salutation}/g, "Drs. ");
                }
                else {
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{Salutation}/g, "Dr. ");
                }

                if ($('#ddlStage').val() == "CE Review") {

                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{PMName}/g, aPMName);
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{DueDate}/g, $('#txtEditorDueDt').val());
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{Week}/g, diff_weeks(new Date(FormatDate_IE($("#txtEditorDueDt").val())), new Date()));
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{Catalog}/g, aCatalog);
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{BookTitle}/g, aBookTitle);
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{ChapterTitle}/g, aChapterTitle);
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/ChapterNo/g, aChapter);
                }
                if ($('#ddlStage').val() == "First Page") {
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{PMName}/g, aPMName);
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{DueDate}/g, $('#txtEditorDueDt').val());
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{Week}/g, diff_weeks(new Date(FormatDate_IE($("#txtEditorDueDt").val())), new Date()));
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{Catalog}/g, aCatalog);
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{BookTitle}/g, aBookTitle);
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{ChapterTitle}/g, aChapterTitle);
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/ChapterNo/g, aChapter);
                }
            }
            else {
                if ($('#ddlStage').val() == "CE Review") {
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{PMName}/g, aPMName);
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{DueDate}/g, $('#txtEditorDueDt').val());
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{Week}/g, diff_weeks(new Date(FormatDate_IE($("#txtEditorDueDt").val())), new Date()));
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{Catalog}/g, aCatalog);
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{BookTitle}/g, aBookTitle);
                }
                if ($('#ddlStage').val() == "First Page") {
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{PMName}/g, aPMName);
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{DueDate}/g, $('#txtEditorDueDt').val());
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{Week}/g, diff_weeks(new Date(FormatDate_IE($("#txtEditorDueDt").val())), new Date()));
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{Catalog}/g, aCatalog);
                    aEDPreviewMailbody = aEDPreviewMailbody.replace(/{BookTitle}/g, aBookTitle);
                }
            }
            $('#TxtEDPreview').val(aEDPreviewMailbody);
            $('#myModalEditor_Review #divEDHTML .jqte_editor').html(aEDPreviewMailbody);
        }
    });

    $('#ULIntroMailBody li').click(function () {
        var aIntroPreviewMailbody = "";
        if ($(this)[0].textContent == 'HTML') {
            $('#myModalIntro_Review #divIntroHTML .jqte .jqte_toolbar').css("display", "none");
            $('#myModalIntro_Review #divIntroHTML .jqte .jqte_editor').attr("contenteditable", false);
            aIntroPreviewMailbody = $('#myModalIntro_Review #divIntroText .jqte_editor').html();

            aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{PRReviewDueDt}/g, aPPAUDueDateG);
            aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{PRReviewReturnDt}/g, aFRAUDueDateG);
            aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{VoPageDueDt}/g, aVOUDueDateG);
            aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{VoPageReturnDt}/g, aFVOUDueDateG);

            if (aUploadType == "Contribute") {

                if ($('#ddlEmailTo').val() == "Author") {
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{PMName}/g, aPMName);
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{Catalog}/g, aCatalog);
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{BookTitle}/g, aBookTitle);
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{CEReviewDueDt}/g, $('#txtCEReviewDueDt').val());
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{CEReviewReturnDt}/g, $('#txtCEReviewReturnDt').val());
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{FirstPageDueDt}/g, $('#txtFirstPageDueDt').val());
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{FirstPageReturnDt}/g, $('#txtFirstPageReturnDt').val());
                }
                if ($('#ddlEmailTo').val() == "Editor") {
                    var ed = $('#TxtEditorName').val().replace(/^\|+;\|+$/g, "");
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{EditorName}/g, ed);
                    if ((ed.indexOf(";") > 0) || (ed.indexOf(",") > 0) || (ed.indexOf(",") > 0)) {
                        aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{Salutation}/g, "Drs. ");
                    }
                    else {
                        aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{Salutation}/g, "Dr. ");
                    }
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{PMName}/g, aPMName);
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{Catalog}/g, aCatalog);
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{BookTitle}/g, aBookTitle);
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{CEReviewDueDt}/g, $('#txtCEReviewDueDt').val());
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{CEReviewReturnDt}/g, $('#txtCEReviewReturnDt').val());
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{FirstPageDueDt}/g, $('#txtFirstPageDueDt').val());
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{FirstPageReturnDt}/g, $('#txtFirstPageReturnDt').val());
                }

            }
            else {
                var au = $('#TxtAuthorName').val().replace(/^\|+;\|+$/g, "");
                aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{AuthorName}/g, au);
                if ((au.indexOf(";") > 0) || (au.indexOf(",") > 0) || (au.indexOf(",") > 0)) {
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{Salutation}/g, "Drs. ");
                }
                else {
                    aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{Salutation}/g, "Dr. ");
                }
                aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{PMName}/g, aPMName);
                aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{Catalog}/g, aCatalog);
                aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{BookTitle}/g, aBookTitle);
                aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{CEReviewDueDt}/g, $('#txtCEReviewDueDt').val());
                aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{CEReviewReturnDt}/g, $('#txtCEReviewReturnDt').val());
                aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{FirstPageDueDt}/g, $('#txtFirstPageDueDt').val());
                aIntroPreviewMailbody = aIntroPreviewMailbody.replace(/{FirstPageReturnDt}/g, $('#txtFirstPageReturnDt').val());

            }
            $('#TxtIntroPreview').val(aIntroPreviewMailbody);
            $('#myModalIntro_Review #divIntroHTML .jqte_editor').html(aIntroPreviewMailbody);
        }
    });

    $('#ddlStage').change(function () {
        //$('.rowMono,.rowintro,.rowintroinput,.rowContribute,.btnPD').show();
        if ($(this).val() == 'Intro Email') {
            $('.CEcheck').show();
            $('.rowBookWise').hide();
        }
        else {
            $('.CEcheck').hide();
            $('.rowBookWise').show();
        }

        $('.btnApproveS3').hide();
        if ($(this).val() == 'First Page to PE' || $(this).val() == 'Voucher Proof') {
            $('.btnApproveS3').show();
            $('.rowBookWise').hide();

            $('.rowMono,.rowintro,.rowintroinput,.rowContribute,.btnPD, .CEcheck').hide();
            $('#tblProofChapter thead tr th').not(':nth-child(2)').not(':nth-child(3)').hide();
            $('#tblProofChapter tbody tr td').not(':nth-child(2)').not(':nth-child(3)').hide();
        }
        else {
            $('.btnPD').show();
            //$('.rowBookWise').show();

            GoToProofDetails(aBookID, aUploadType, $(this).val())
        }
    });

    $('#ddlEmailTo').change(function () {
        var data = { BookID: aBookID, EmailTo: $(this).val() };
        $.ajax({
            type: 'get',
            url: $('#hf_GetEmailToChapters').val(),
            data: data,
            datatype: 'json',
            success: function (response) {
                $('#divLoadChapter').html('');
                var Chapteritems = response.aitemList;
                var ztable = "";

                ztable = "<table id='tblProofChapter' class='tblTrans' style='overflow:hidden'><thead><tr><th><input id='chkSelect' type='checkbox'  /></th><th>Number</th><th>Title</th><th>Author Name</th><th>Author Email</th><th>Due Date</th><th>PE in CC<input id='chkPEinCC' type='checkbox'  /></th><th>ED in CC<input id='chkEDinCC' type='checkbox'  /></th><th>Correction to ED<input id='chkCorrtoED' type='checkbox'  /></th><th>Reminder<input id='chkReminder' type='checkbox'  /></th></tr></thead>";

                for (var i = 0; i < Chapteritems.length; i++) {
                    ztable += "<tr>";
                    ztable += "<td width='3%'><input id='chkSelect-" + Chapteritems[i].Number + "' type='checkbox' class='chkChapter'  /></td>";
                    ztable += "<td width='5%'>" + Chapteritems[i].Number + "</td>";
                    ztable += "<td width='20%'>" + Chapteritems[i].Title + "</td>";
                    ztable += "<td width='25%'><input id='txtName-" + Chapteritems[i].Number + "'  type='text' value='" + isNullCheck(Chapteritems[i].AuthorName) + "' class='form-control tdAUList' /></td>";
                    ztable += "<td width='25%'><input id='txtEmail-" + Chapteritems[i].Number + "'  type='text' value='" + isNullCheck(Chapteritems[i].AuthorEmail) + "' class='form-control tdAUEList' /></td>";
                    ztable += "<td width='10%'><input id='txtDueDt-" + Chapteritems[i].Number + "'  type='text' readonly class='form-control AuthorDueDt inputHandCursor' /></td>";
                    ztable += "<td width='7%'><input id='chkPEinCC-" + Chapteritems[i].Number + "' type='checkbox' class='PEinCC'  /></td>";
                    ztable += "<td width='7%'><input id='chkEDinCC-" + Chapteritems[i].Number + "' type='checkbox' class='EDinCC' /></td>";
                    ztable += "<td width='10%'><input id='chkCorrtoED-" + Chapteritems[i].Number + "' type='checkbox' class='CorrtoED' /></td>";
                    ztable += "<td width='10%'><input id='chkReminder-" + Chapteritems[i].Number + "' type='checkbox'  class='Reminder'/></td>";
                    ztable += "</tr>";
                }
                ztable += '</table>';
                $('#divLoadChapter').html(ztable);
                $('#chkSelect').prop('checked', true);
                $("#chkSelect").attr("disabled", true);
                $(".chkChapter").prop('checked', true);
                $(".chkChapter").attr("disabled", true);
                $('#chkPEinCC').change(function () {

                    if ($(this).is(":checked")) {
                        $(".PEinCC").prop('checked', true);
                    }
                    else {
                        $(".PEinCC").prop('checked', false);
                    }
                });
                $('#chkEDinCC').change(function () {

                    if ($(this).is(":checked")) {
                        $(".EDinCC").prop('checked', true);
                    }
                    else {
                        $(".EDinCC").prop('checked', false);
                    }
                });
                $('#chkCorrtoED').change(function () {
                    if ($(this).is(":checked")) {
                        $(".CorrtoED").prop('checked', true);
                    }
                    else {
                        $(".CorrtoED").prop('checked', false);
                    }
                });
                $('#chkReminder').change(function () {
                    if ($(this).is(":checked")) {
                        $(".Reminder").prop('checked', true);
                    }
                    else {
                        $(".Reminder").prop('checked', false);
                    }
                });

                if ($('#ddlEmailTo').val() == "Author") {
                    $('#lblEDReminder').css("display", "none");
                    $('#chkEditorReminder').css("display", "none");
                }
                else {
                    $('#lblEDReminder').css("display", "");
                    $('#chkEditorReminder').css("display", "");
                }
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

    //File Upload Techset server to S3
    //ApproveS3
    $('#btnApproveS3').click(function () {
        if ($('#tblProofChapter tbody tr').length == 0) {
            $.bootstrapGrowl("Chapter List not available !", { type: 'warning', delay: 2000, });
            return false;
        }
        bootbox.confirm("Are you sure to Approve ?",
            function (result) {
                if (result) {
                    $('#LoadingImage').show();
                    $.post($('#hf_ApproveS3').val(), { BookID: aBookID, zTypeP: $('#ddlStage').val() },
                        function (returnedData) {
                            if (returnedData.indexOf('Error') > 0)
                                $.bootstrapGrowl(returnedData, { type: 'danger', delay: 2000, });
                            else
                                $.bootstrapGrowl(returnedData, { type: 'info', delay: 2000, });

                            $('#LoadingImage').hide();
                        });
                }
            });
    });
    LoadProofBookList();

    //$('#lstEditorList').change(function () {
    //    $('#tblProofChapter tbody tr .tdAUEList').val($(this).val().toString().replace(',', ';'));
    //    $('#tblProofChapter tbody tr .tdAUList').val($('#TxtEditorName').val());
    //});

    $('#chkBookwise').click(function () {
        if ($(this).prop("checked") == true) {
            //aChapterG = $(this).attr('data-id');

            DeleteTempFolder();
            $('#lblChapter').text('File Upload - ' + bookDetails);
            $("#myModal_bookFiles").modal({ backdrop: 'static', keyboard: false });
        } else {
            alert('Unchecked');
        }
    });

    $('#FUpload').change(function () {
        //FileUpload();
        var fileUpload = $("#FUpload").get(0);
        var files = fileUpload.files;
        // Create FormData object
        var fileData = new FormData();
        // Looping over all files and add it to FormData object
        for (var i = 0; i < files.length; i++) {
            fileData.append(files[i].name, files[i]);
        }
        fileData.append('Book', bookTitle);
        $('.FileAttach').show();

        $.ajax({
            type: 'POST',
            url: $('#hf_UpladFolder').val(),
            data: fileData,
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            success: function (res) {
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
    });

    //$('#myModal_bookFiles').on('hidden.bs.modal', function () {
    //    DeleteTempFolder();
    //});

    $('#btnUploadFiles').click(function () {
      
        $('#myModal_bookFiles').modal('hide');
    });

    $('#btnCloseModal').click(function () {
        DeleteTempFolder();
        $('#myModal_bookFiles').modal('hide');
    });
});

function DeleteTempFile(zitem) {
    var atrItem = $(zitem).closest('tr').find('td');

    var zFileNameP = atrItem[1].innerText;
    try {
        $('#LoadingImage').show();
        var data = { zBook: bookTitle, zFileName: zFileNameP }
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

function DeleteTempFolder() {
    try {
        $('#LoadingImage').show();
        var data = { zBook: bookTitle }
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
    } catch (e) {

    }
}

function diff_weeks(dt2, dt1) {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60 * 24 * 7);
    return Math.abs(Math.round(diff));

}

function LoadProofBookList() {
    var zNumberList = "";
    var zCatalogList = "";
    var zISBNList = "";

    if ($('#lstNumberList').val() != null)
        zNumberList = $('#lstNumberList').val().toString();
    if ($('#lstCatalogList').val() != null)
        zCatalogList = $('#lstCatalogList').val().toString();
    if ($('#lstISBNList').val() != null)
        zISBNList = $('#lstISBNList').val().toString();

    CallData(true, zNumberList, zCatalogList, zISBNList, '');


}

function Validate() {

    var aResultL = true;

    if ($('#ddlStage').val() == null) {
        $.bootstrapGrowl("Select Stage !", { type: 'danger', delay: 2000, });
        $('#ddlStage').focus();
        aResultL = false;
        return false;
    }

    if (aUploadType == "Mono") {
        var vali = "";
        if (aPEEmail == "" || aPMEmail == "") {
            $.bootstrapGrowl("Select PE/PM in Book Master!", { type: 'danger', delay: 2000, });
            $('#ddlStage').focus();
            aResultL = false;
            return false;
        }
        if ($('#TxtAuthorName').val() == "") {
            $.bootstrapGrowl("Enter Author Name!", { type: 'danger', delay: 2000, });
            $('#TxtAuthorName').focus();
            aResultL = false;
            return false;
        }
        if ($('#TxtAuthorEmail').val() == "") {
            $.bootstrapGrowl("Enter Author Email!", { type: 'danger', delay: 2000, });
            $('#TxtAuthorEmail').focus();
            aResultL = false;
            return false;
        }
        if ($('#TxtAuthorEmail').val() != "") {
            if (IsEmail($('#TxtAuthorEmail').val()) == false) {
                $.bootstrapGrowl("Enter Correct Author Email!", { type: 'danger', delay: 2000, });
                $('#TxtAuthorEmail').focus();
                aResultL = false;
                return false;
            }

        }
        if ($('#txtMonoAuthorDueDt').val() != "") {
            if (FormatDate_IE($("#txtMonoAuthorDueDt").val()) <= new Date()) {
                $.bootstrapGrowl("Enter Correct Author Email!", { type: 'danger', delay: 2000, });
                $('#TxtAuthorEmail').focus();
                aResultL = false;
                return false;
            }

        }
        if ($('#ddlStage').val() == "Intro Email") {
            //if ($("#txtCEReviewDueDt").val() == "") {
            //    $.bootstrapGrowl("Enter CE Review Date!", { type: 'danger', delay: 2000, });
            //    $('#txtCEReviewDueDt').focus();
            //    aResultL = false;
            //    return false;
            //}
            //if ($("#txtCEReviewReturnDt").val() == "") {
            //    $.bootstrapGrowl("Enter CE Review Return Date!", { type: 'danger', delay: 2000, });
            //    $('#txtCEReviewReturnDt').focus();
            //    aResultL = false;
            //    return false;
            //}
            if ($("#txtFirstPageDueDt").val() == "") {
                $.bootstrapGrowl("Enter First Page Due Date!", { type: 'danger', delay: 2000, });
                $('#txtFirstPageDueDt').focus();
                aResultL = false;
                return false;
            }
            if ($("#txtFirstPageReturnDt").val() == "") {
                $.bootstrapGrowl("Enter First Page Return Date!", { type: 'danger', delay: 2000, });
                $('#txtFirstPageReturnDt').focus();
                aResultL = false;
                return false;
            }

            //if (FormatDate_IE($("#txtCEReviewReturnDt").val()) <= FormatDate_IE($("#txtCEReviewDueDt").val())) {
            //    $.bootstrapGrowl("CE Review Return Date should be greater than CE Review Due Date!", { type: 'danger', delay: 2000, });
            //    $('#txtCEReviewReturnDt').focus();
            //    aResultL = false;
            //    return false;
            //}
            if (FormatDate_IE($("#txtFirstPageDueDt").val()) <= FormatDate_IE($("#txtCEReviewReturnDt").val())) {
                $.bootstrapGrowl("First Page Due Date should be greater than CE Review Return Date!", { type: 'danger', delay: 2000, });
                $('#txtFirstPageDueDt').focus();
                aResultL = false;
                return false;
            }
            if (FormatDate_IE($("#txtFirstPageReturnDt").val()) <= FormatDate_IE($("#txtFirstPageDueDt").val())) {
                $.bootstrapGrowl("First Page Return Date should be greater than First Page Due Date!", { type: 'danger', delay: 2000, });
                $('#txtFirstPageReturnDt').focus();
                aResultL = false;
                return false;
            }
        }
        var aint = 0;

        var getDistributeList = [];
        getDistributeList = GetTableRowToList('tblProofChapter');
        for (var i = 0; i < getDistributeList.length; i++) {
            if (getDistributeList[i][0] == true) {
                aint = aint + 1;

            }
        }
      
        if ($('#chkBookwise').prop("checked")) { } else {
            if (aint == 0) {
                $.bootstrapGrowl('Select atleast one chapter !', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
        }
    }
    if (aUploadType == "Contribute") {
        if (aPEEmail == "" || aPMEmail == "") {
            $.bootstrapGrowl("Select PE/PM in Book Master!", { type: 'danger', delay: 2000, });
            $('#ddlStage').focus();
            aResultL = false;
            return false;
        }
        if ($('#ddlStage').val() == "Intro Email") {
            if ($('#ddlEmailTo').val() == "" || $('#ddlEmailTo').val() == null) {
                $.bootstrapGrowl("Select Intro Email To!", { type: 'danger', delay: 2000, });
                $('#txtCEReviewDueDt').focus();
                aResultL = false;
                return false;
            }
            //if ($("#txtCEReviewDueDt").val() == "") {
            //    $.bootstrapGrowl("Enter CE Review Date!", { type: 'danger', delay: 2000, });
            //    $('#txtCEReviewDueDt').focus();
            //    aResultL = false;
            //    return false;
            //}
            //if ($("#txtCEReviewReturnDt").val() == "") {
            //    $.bootstrapGrowl("Enter CE Review Return Date!", { type: 'danger', delay: 2000, });
            //    $('#txtCEReviewReturnDt').focus();
            //    aResultL = false;
            //    return false;
            //}
            if ($("#txtFirstPageDueDt").val() == "") {
                $.bootstrapGrowl("Enter First Page Due Date!", { type: 'danger', delay: 2000, });
                $('#txtFirstPageDueDt').focus();
                aResultL = false;
                return false;
            }
            if ($("#txtFirstPageReturnDt").val() == "") {
                $.bootstrapGrowl("Enter First Page Return Date!", { type: 'danger', delay: 2000, });
                $('#txtFirstPageReturnDt').focus();
                aResultL = false;
                return false;
            }
        }
        if ($('#lstEditorList').val() == null) {
            if (($('#ddlStage').val() == "Intro Email" && $('#ddlEmailTo').val() == "Editor") || ($('#ddlStage').val() != "Intro Email")) {
                $.bootstrapGrowl('Select Editor !', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
        }
        if ($('#TxtEditorName').val() == "") {
            if (($('#ddlStage').val() == "Intro Email" && $('#ddlEmailTo').val() == "Editor") || ($('#ddlStage').val() != "Intro Email")) {
                $.bootstrapGrowl('Enter Editor Name!', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
        }

        if (($('#ddlStage').val() == "Intro Email" && $('#ddlEmailTo').val() == "Author") || ($('#ddlStage').val() != "Intro Email")) {
            var aint = 0;
            var aChapter = "";
            var aNameChapter = "";
            var aEmailChapter = "";
            var getDistributeList = [];
            getDistributeList = GetTableRowToList('tblProofChapter');

            for (var i = 0; i < getDistributeList.length; i++) {
                if (getDistributeList[i][0] == true) {
                    aint = aint + 1;
                    if (getDistributeList[i][3] == "") {
                        aNameChapter = aNameChapter + getDistributeList[i][1] + ";";
                    }

                    if (getDistributeList[i][4] == "") {
                        aChapter = aChapter + getDistributeList[i][1] + ";";
                    }
                    else {
                        if (IsEmail(getDistributeList[i][4]) == false) {
                            aEmailChapter = aEmailChapter + getDistributeList[i][1] + ";";
                        }
                    }
                }
            }
           
            if ($('#chkBookwise').prop("checked")) { } else {
                if (aint == 0) {
                    $.bootstrapGrowl('Select atleast one chapter !', {
                        type: 'danger',
                        delay: 5000,
                    });
                    aResultL = false;
                    return false;
                }
            }

            if (aNameChapter != "") {
                $.bootstrapGrowl('Enter AuthorName for ' + aChapter + ' Chapter(s) !', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }

            if (aChapter != "") {
                $.bootstrapGrowl('Enter AuthorEmail for ' + aChapter + ' Chapter(s) !', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
            if (aEmailChapter != "") {
                $.bootstrapGrowl('Enter Correct AuthorEmail for ' + aEmailChapter + ' Chapter(s) !', {
                    type: 'danger',
                    delay: 5000,
                });
                aResultL = false;
                return false;
            }
        }
    }
    return aResultL;
}

function IsEmail(email) {
    var zResult = true;
    var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    var emails = email.split(";");

    for (var i = 0; i < emails.length; i++)

        if (!regex.test(emails[i].trim())) {
            return false;
        } else {

        }
    return zResult;
}

function CallData(aFirstLoad, zNumberList, zCatalogList, zISBNList, zPublList) {
    $('#LoadingImage').show();
    aPEList = [];
    aCatalogList = [];
    aBookTypeList = [];
    aBookCategoryList = [];
    aPMList = [];
    aStatusList = [];
    var zCatList = 'All';
    var zNumList = 'All';
    var zISList = 'All';
    var zPubList = 'All';

    if (zNumberList != '')
        zNumList = zNumberList;
    if (zCatalogList != '')
        zCatList = zCatalogList;
    if (zISBNList != '')
        zISList = zISBNList;
    if (zPublList != '')
        zPubList = zPublList;
    var ZType = 'WIP';
    var data = {
        Type: ZType,
        CatalogList: zCatList,
        NumList: zNumList,
        ISBNList: zISList,
        PublList: zPubList
    };
    $.ajax({
        type: 'post',
        url: $('#hf_GetReport').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            FetechData(response.aItemList);
            $('#LoadingImage').hide();
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again', {
                type: 'danger',
                delay: 2000,
            });
            $('#LoadingImage').hide();
        }
    });
}

function FetechData(ItemsList) {
    try {
        var zCatalogList = ''; var zNumberList = ''; var zISBNList = '';
        dataSet = [];
        var items = ItemsList;
        var zCtInP = 0;
        var zCtCom = 0;
        var zBookShelfList = '';
        $.each(items, function (index) {
            // Show List View
            var aimgpath = $(this)[0]["ImgPath"];
            if (aimgpath == null || aimgpath == '') {
                aimgpath = "../Images/Covers/blue.png";
            }

            var aNumberL = ($(this)[0]["Number"] == '' ? '---' : $(this)[0]["Number"]);
            var aISBNL = ($(this)[0]["ISBN"] == '' ? '---' : $(this)[0]["ISBN"]);
            var aPENameL = ($(this)[0]["PEName"] == null ? '---' : $(this)[0]["PEName"].capitalize());
            var aPMNameL = ($(this)[0]["PMName"] == null ? '---' : $(this)[0]["PMName"].capitalize());

            zBookShelfList += '<div class="col-sm-3">'
            zBookShelfList += '<div class="info-box bg-aqua">';
            zBookShelfList += '<span class="info-box-icon"><img class="imgCover" src="' + aimgpath + '" altr=""/></span>';
            zBookShelfList += '<div class="info-box-content" data-id="' + $(this)[0]["Catalog"] + '" >';
            zBookShelfList += '<span class="info-box-number">' + aNumberL + '</span>';
            zBookShelfList += '<span class="info-box-text">' + aISBNL + '</span>';
            zBookShelfList += '<div class="info-box-text1">' + aPENameL + '</div>';
            zBookShelfList += '<div class="info-box-text1">' + aPMNameL + '</div>';

            var zParamListProof = $(this)[0]["ID"] + ',"' + $(this)[0]["UploadType"].trim() + '",""';
            var zParamListTrack = $(this)[0]["ID"] + ',"' + $(this)[0]["UploadType"].trim() + '"';

            zBookShelfList += "<div class='spAction'>"
                + "<span class='btn1 btn-info1 spAddIcon' title='Proof Distribution' onclick='GoToProofDetails(" + zParamListProof + ")'><i class='fa fa-paper-plane'></i></span>"
                + "&nbsp;<span class='btn1 btn-info1 spAddIcon' title='Proof Tracking' onclick='ProofTackView(" + zParamListTrack + ")'><i class='fa fa-bars'></i></span>"
                + "&nbsp;<span class='btn1 btn-info1 spAddIcon' title='Asset' onclick='AuthorEditorView(" + $(this)[0]["ID"] + ")'><i class='fa fa-download'></i></span>"
                + "</div>";
            zBookShelfList += '</div>';
            zBookShelfList += '</div>';
            zBookShelfList += '</div>';
            zBookShelfList += '</div>';

            // Load Grid List

            var zindexL = 0;
            zCtInP += 1;
            zindexL = zCtInP;
            var t = [
                zindexL.toString(),
                $(this)[0]["Number"],
                $(this)[0]["Catalog"],
                $(this)[0]["ISBN"],
                $(this)[0]["Publisher"],
                $(this)[0]["PEName"],
                $(this)[0]["PMName"],
                FormatDateColumn($(this)[0]["ReceivedDt"]),
                FormatDateColumn($(this)[0]["DueDt"]),
                "<div class='spAction'>"
                + "<span class='btn1 btn-info1 spAddIcon' title='Proof Distribution' onclick='GoToProofDetails(" + zParamListProof + ")'><i class='fa fa-paper-plane'></i></span>"
                + "&nbsp;<span class='btn1 btn-info1 spAddIcon' title='Proof Tracking' onclick='ProofTackView(" + zParamListTrack + ")'><i class='fa fa-bars'></i></span>"
                + "&nbsp;<span class='btn1 btn-info1 spAddIcon' title='Asset' onclick='AuthorEditorView(" + $(this)[0]["ID"] + ")'><i class='fa fa-download'></i></span>"
                + "</div>"
            ];

            dataSet.push(t);

            if ($(this)[0]["Catalog"] != null && $(this)[0]["Catalog"] != '' && zCatalogList.indexOf($(this)[0]["Catalog"]) == -1)
                zCatalogList += '<option value="' + $(this)[0]["Catalog"] + '">' + $(this)[0]["Catalog"] + '</option>';
            if ($(this)[0]["Number"] != null && $(this)[0]["Number"] != '' && zNumberList.indexOf($(this)[0]["Number"]) == -1)
                zNumberList += '<option value="' + $(this)[0]["Number"] + '">' + $(this)[0]["Number"] + '</option>';
            if ($(this)[0]["ISBN"] != null && $(this)[0]["ISBN"] != '' && zISBNList.indexOf($(this)[0]["ISBN"]) == -1)
                zISBNList += '<option value="' + $(this)[0]["ISBN"] + '">' + $(this)[0]["ISBN"] + '</option>';
        });

        if ($("#lstCatalogList").find('option').length == 0) {
            $('#lstCatalogList').html(zCatalogList);
        }
        if ($("#lstNumberList").find('option').length == 0) {
            $('#lstNumberList').html(zNumberList);
        }
        if ($("#lstISBNList").find('option').length == 0) {
            $('#lstISBNList').html(zISBNList);
        }

        $('#divProofBook').html(zBookShelfList);
        $('#LoadingImage').hide();
        LoadData();
    } catch (e) {
        $('#LoadingImage').hide();
    }
}

function LoadData() {
    var Page = 'Master';
    var table = $('#exampleList').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
        "deferRender": true,
        data: dataSet,
        columns: [
            { title: "S.No" },
            { title: "Book ID" },
            { title: "Catalog" },
            { title: "ISBN" },
            { title: "Publisher" },
            { title: "PE Name" },
            { title: "PM Name" },
            { title: "Received Date" },
            { title: "Proposed Pub Date" },
            {
                title: "<center>Actions</center>"
            }
        ],
        columnDefs: [
            { type: 'date-dd-mmm-yyyy', targets: [7, 8] }
        ],
        "destroy": true,

        fixedHeader: {
            header: true
        },
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'PD' + today.toShortFormatWithTime(),

                title: 'Proof Distribution - ' + $('#BkTabul li.active').text(),
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7, 8],
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
                filename: 'PD' + today.toShortFormatWithTime(),

                title: 'Proof Distribution - ' + $('#BkTabul li.active').text(),
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                    format: {
                        header: function (data, row, column, node) {
                            var zheader = data.toString().split('<div class="dropdown')[0];
                            zheader = zheader.toString().split('<i class="fa fa-filter')[0];
                            return zheader.replace('<br>', '');
                        },
                    }
                }
            }
        ],
        "scrollY": (size.height - 215),
        "scrollX": true,
        "createdRow": function (row, data, dataIndex) {

            CheckAccessRights();
        },
        drawCallback: function () {
            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                .on('click', function () {
                    CheckAccessRights();
                });
        }
    });
    var start = moment().subtract(29, 'days');
    var end = moment();
}

function GoToProofDetails(zBookID, zUploadType, zStage) {
    $($('#ddlStage').find('option')[1]).removeAttr('disabled');
    if (zUploadType == '') {
        $.bootstrapGrowl('Kindly set Upload Type in Book Master and Try Again !', {
            type: 'warning',
            delay: 2000,
        });
        return false;
    }
    $('#LoadingImage').show();
    if (zStage == "") {
        aUploadType = zUploadType;
        aBookID = zBookID;
        $('#ddlStage').val(-1).change();
    }
    $("#txtCEReviewDueDt").val('');
    $("#txtCEReviewReturnDt").val('');
    $("#txtFirstPageDueDt").val('');
    $("#txtFirstPageReturnDt").val('');
    $("#txtMonoAuthorDueDt").val('');
    $("#chkMonoPEinCC").prop('checked', false);
    $("#chkAuthorReminder").prop('checked', false);
    $("#chkEditorCorrReceive").prop('checked', false);
    $("#chkEditorReminder").prop('checked', false);
    $("#chkSeries").prop('checked', false);
    $("#chkce").prop('checked', false);
    if (zStage == null) {
        zStage = "";
    }
    var data = { BookID: zBookID, Stage: zStage, UploadType: zUploadType };
    $.ajax({
        type: 'get',
        url: $('#hf_GetChapters').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            $('#divLoadChapter').html('');
            var aitemsHistory = response.aCEHistory;
            var dtlBoot = response.aBookDetails;
            var aBKPPDateList = response.BKPPDateList;

            if (aitemsHistory != null && aitemsHistory.SkipCE) {
                $('#chkce').prop('checked', 'checked');
                $($('#ddlStage').find('option')[1]).attr('disabled', true);
                $('#chkce').attr('disabled', true);
                $("#txtCEReviewReturnDt").prop("disabled", true);
                $("#txtCEReviewDueDt").prop("disabled", true);

            }
            else {
                $($('#ddlStage').find('option')[1]).removeAttr('disabled');
                $('#chkce').removeAttr('checked');
                $('#chkce').removeAttr('disabled', true);
            }

            //FetechChapterData(response.aitemList)
            var items = response.EDitems;
            $("#lstEditorList").empty();
            for (var i = 0; i < items.length; i++) {
                $("#lstEditorList").append("<option value='" + items[i].Text + "'>" + items[i].Text + "</option>");
            }

            var Chapteritems = response.aitemList;
            var ztable = "";
            if (aUploadType == "Contribute") {

                ztable = "<table id='tblProofChapter' class='tblTrans' style='overflow:hidden'><thead><tr><th><input id='chkSelect' type='checkbox' /></th><th>Number</th><th>Title</th><th>Author Name</th><th>Author Email</th><th>Due Date</th><th>PE in CC<input id='chkPEinCC' type='checkbox'  /></th><th>ED in CC<input id='chkEDinCC' type='checkbox'  /></th><th>Correction to ED<input id='chkCorrtoED' type='checkbox'  /></th><th>Reminder<input id='chkReminder' type='checkbox'  /></th></tr></thead>";

                for (var i = 0; i < Chapteritems.length; i++) {
                    ztable += "<tr>";
                    ztable += "<td width='3%'><input id='chkSelect-" + Chapteritems[i].Number + "' type='checkbox' class='chkChapter'  /></td>";
                    ztable += "<td width='5%'>" + Chapteritems[i].Number + "</td>";
                    ztable += "<td width='20%'>" + Chapteritems[i].Title + "</td>";
                    ztable += "<td width='25%'><input id='txtName-" + Chapteritems[i].Number + "'  type='text' value='" + isNullCheck(Chapteritems[i].AuthorName) + "' class='form-control tdAUList' /></td>";
                    ztable += "<td width='25%'><input id='txtEmail-" + Chapteritems[i].Number + "'  type='text' value='" + isNullCheck(Chapteritems[i].AuthorEmail) + "' class='form-control tdAUEList' /></td>";
                    ztable += "<td width='10%'><input id='txtDueDt-" + Chapteritems[i].Number + "'  type='text' readonly class='form-control AuthorDueDt inputHandCursor' /></td>";
                    ztable += "<td width='7%'><input id='chkPEinCC-" + Chapteritems[i].Number + "' type='checkbox' class='PEinCC'  /></td>";
                    ztable += "<td width='7%'><input id='chkEDinCC-" + Chapteritems[i].Number + "' type='checkbox' class='EDinCC' /></td>";
                    ztable += "<td width='10%'><input id='chkCorrtoED-" + Chapteritems[i].Number + "' type='checkbox' class='CorrtoED' /></td>";
                    ztable += "<td width='10%'><input id='chkReminder-" + Chapteritems[i].Number + "' type='checkbox'  class='Reminder'/></td>";
                    ztable += "</tr>";
                }
                ztable += '</table>';
                $('#divLoadChapter').html(ztable);

            }
            else {

                ztable = "<table id='tblProofChapter' class='tblTrans'  width='100%' style='overflow:hidden'><thead><tr><th><input id='chkSelect' type='checkbox'  /></th><th>Number</th><th>Title</th></tr></thead>";

                for (var i = 0; i < Chapteritems.length; i++) {
                    ztable += "<tr>";
                    ztable += "<td width='50px'><input id='chkSelect-" + Chapteritems[i].Number + "' type='checkbox' class='chkChapter'  /></td>";
                    ztable += "<td width='200px'>" + Chapteritems[i].Number + "</td>";
                    ztable += "<td>" + Chapteritems[i].Title + "</td>";
                    ztable += "</tr>";
                }
                ztable += '</table>';
                $('#divLoadChapter').html(ztable);

            }

            $.ajax({
                type: 'GET',
                url: $("#hf_CheckBookWise").val(),
                data: { BookId: aBookID, Stage: zStage },
                success: function (result) {
                    if (result) {
                        $('#chkBookwise').prop('checked', 'checked');
                        $('#chkBookwise').prop('disabled', 'disabled');
                    } else {
                        $('#chkBookwise').prop("disabled", false);
                        $('#chkBookwise').prop('checked', false);
                    }

                    if ($('#chkBookwise').prop("checked")) {
                        $('.chkChapter').prop('checked', 'checked');
                        $('#chkSelect').prop('checked', 'checked');

                        $('#chkSelect').prop('disabled', 'disabled');
                        $('.chkChapter').prop('disabled', 'disabled');

                        $('#btnDistribute').prop('disabled', 'disabled');
                    }
                    else {
                        $('.chkChapter').prop('checked', false);
                        $('#chkSelect').prop('checked', false);

                        $('#chkSelect').prop('disabled', false);
                        $('.chkChapter').prop('disabled', false);

                        $('#btnDistribute').prop('disabled', false);
                    }
                }
            });

            $('.AuthorDueDt').datetimepicker({
                format: 'd M Y',
                value: new Date(),
                timepicker: false,
                scrollMonth: false,
                scrollInput: false
            });

            $('#chkEDinCC').change(function () {

                if ($(this).is(":checked")) {
                    $(".EDinCC").prop('checked', true);
                }
                else {
                    $(".EDinCC").prop('checked', false);
                }
            });
            $('#chkCorrtoED').change(function () {
                if ($(this).is(":checked")) {
                    $(".CorrtoED").prop('checked', true);
                }
                else {
                    $(".CorrtoED").prop('checked', false);
                }
            });
            $('#chkReminder').change(function () {
                if ($(this).is(":checked")) {
                    $(".Reminder").prop('checked', true);
                }
                else {
                    $(".Reminder").prop('checked', false);
                }
            });
            $('#chkSelect').change(function () {
                if ($(this).is(":checked")) {
                    $(".chkChapter").prop('checked', true);
                }
                else {
                    $(".chkChapter").prop('checked', false);
                }
            });
            $('#chkPEinCC').change(function () {

                if ($(this).is(":checked")) {
                    $(".PEinCC").prop('checked', true);
                }
                else {
                    $(".PEinCC").prop('checked', false);
                }
            });

            $('#txtCEReviewDueDt').val(FormatDateColumn(aBKPPDateList[0].CEReviewToDate));
            $('#txtCEReviewReturnDt').val(FormatDateColumn(aBKPPDateList[0].CEReviewFromDate));
            $('#txtFirstPageDueDt').val(FormatDateColumn(aBKPPDateList[0].FPToDate));
            $('#txtFirstPageReturnDt').val(FormatDateColumn(aBKPPDateList[0].FPFromDate));

            aPPAUDueDateG = FormatDateColumn(aBKPPDateList[0].PPAUDueDate);
            aFRAUDueDateG = FormatDateColumn(aBKPPDateList[0].FRAUDueDate);
            aVOUDueDateG = FormatDateColumn(aBKPPDateList[0].VOUDueDate);
            aFVOUDueDateG = FormatDateColumn(aBKPPDateList[0].FVOUDueDate);

            aMonoMailbody = "";
            aAuthorMailbody = "";
            aEditorMailbody = "";
            aAUIntroMailbody = "";
            aEDIntroMailbody = "";
            aContributeIntroMailbody = "";
            aAUCEMailbody = "";
            aEDCEMailbody = "";
            aContributeCEMailbody = "";
            aAUWelcomeMailbody = "";
            aEDWelcomeMailbody = "";
            aAUIntroMailbodySkipCE = "";
            var Mailitems = response.aMailBody;
            for (var i = 0; i < Mailitems.length; i++) {
                if (Mailitems[i].Template == "AUIntroEmailLatex" && dtlBoot[0].Platform == 'Latex') {
                    aAUIntroMailbody = Mailitems[i].MailContent;
                }
                if (Mailitems[i].Template == "AUIntroEmail" && dtlBoot[0].Platform != 'Latex') {
                    aAUIntroMailbody = Mailitems[i].MailContent;
                }
                if (Mailitems[i].Template == "AUContributeIntroEmail") {
                    aContributeIntroMailbody = Mailitems[i].MailContent;
                }
                if (Mailitems[i].Template == "EDIntroEmail") {
                    aEDIntroMailbody = Mailitems[i].MailContent;
                }
                if (Mailitems[i].Template == "AUCEEmail") {
                    aAUCEMailbody = Mailitems[i].MailContent;
                }
                if (Mailitems[i].Template == "EDCEEmail") {
                    aEDCEMailbody = Mailitems[i].MailContent;
                }
                if (Mailitems[i].Template == "ContributeCEEmail") {
                    aContributeCEMailbody = Mailitems[i].MailContent;
                }
                if (Mailitems[i].Template == "BookAuthor") {
                    aMonoMailbody = Mailitems[i].MailContent;
                }
                if (Mailitems[i].Template == "LeadChapterAuthor") {
                    aAuthorMailbody = Mailitems[i].MailContent;
                }
                if (Mailitems[i].Template == "BookEditor") {
                    aEditorMailbody = Mailitems[i].MailContent;
                }
                if (Mailitems[i].Template == "AUWelcomeEmail") {
                    aAUWelcomeMailbody = Mailitems[i].MailContent;
                }
                if (Mailitems[i].Template == "EDWelcomeEmail") {
                    aEDWelcomeMailbody = Mailitems[i].MailContent;
                }
                //if (zStage == "Intro Email") {

                //    if (aUploadType == "Contribute") {
                //        if (Mailitems[i].Template == "LeadChapterAuthor") {
                //            aAuthorMailbody = Mailitems[i].MailContent;
                //        }
                //        if (Mailitems[i].Template == "BookEditor") {
                //            aEditorMailbody = Mailitems[i].MailContent;
                //        }
                //    }
                //    else {
                //        if (Mailitems[i].Template == "MonoIntoEmail") {
                //            aIntroMailbody = Mailitems[i].MailContent;
                //        }
                //    }


                //}
                //else {
                //    if (aUploadType == "Contribute") {
                //        if (Mailitems[i].Template == "LeadChapterAuthor") {
                //            aAuthorMailbody = Mailitems[i].MailContent;
                //        }
                //        if (Mailitems[i].Template == "BookEditor") {
                //            aEditorMailbody = Mailitems[i].MailContent;
                //        }
                //    }
                //    else {
                //        if (Mailitems[i].Template == "BookAuthor") {
                //            aMonoMailbody = Mailitems[i].MailContent;
                //        }
                //    }
                //}
            }

            $('.strTitle').html('Proof Distribution - ' + dtlBoot[0].Catalog + ' (' + dtlBoot[0].Number + ') - ' + dtlBoot[0].Title);

            bookTitle = dtlBoot[0].Title;
            bookDetails = dtlBoot[0].Catalog + ' (' + dtlBoot[0].Number + ') - ' + dtlBoot[0].Title;
            bookCatalogNumber = dtlBoot[0].Catalog + '(' + dtlBoot[0].Number + ')';

            aPEEmail = dtlBoot[0].PEEmail;
            aPMEmail = dtlBoot[0].PMEmail;
            aPMName = dtlBoot[0].PMName;
            aTSPMEmail = dtlBoot[0].TSPMEmailID;
            aCatalog = dtlBoot[0].Catalog;
            aBookTitle = dtlBoot[0].Title;
            aAuthorName = dtlBoot[0].AuthorName;
            aAuthorEmail = dtlBoot[0].AuthorEmail;
            aEditorName = dtlBoot[0].EditorName;
            $('#lblEDReminder').css("display", "");
            $('#chkEditorReminder').css("display", "");
            $('.rowintro').css("display", "");
            $('.rowintroinput').css("display", "none");
            if (aUploadType == "Contribute") {
                $('.rowMono').css("display", "none");
                $('.rowContribute').css("display", "");
                $('#btnIntroPreview').css("display", "none");
            }
            else {
                $('.rowMono').css("display", "block");
                $('.rowContribute').css("display", "none");
                $('#btnIntroPreview').css("display", "none");
                //$('#btnAUMailPreview').css("display", "block");
            }

            if (zStage == "Intro Email") {
                $('#chkce').change(function () {

                    if ($('#chkce').is(":checked")) {
                        $("#txtCEReviewReturnDt").prop("disabled", true);
                        $("#txtCEReviewDueDt").prop("disabled", true);

                    }
                    else {
                        //aCEHistory
                        $("#txtCEReviewReturnDt").prop("disabled", false);
                        $("#txtCEReviewDueDt").prop("disabled", false);
                    }
                });

                $('.rowintro').css("display", "none");
                $('#btnIntroPreview').css("display", "");
                $('#chkSelect').prop('checked', true);
                $("#chkSelect").attr("disabled", true);
                $(".chkChapter").prop('checked', true);
                $(".chkChapter").attr("disabled", true);
                $('.rowintroinput').css("display", "");
                $('.rowintroinputNo').css("display", "");
                if (aUploadType == "Contribute") {
                    $('.rowintroinputNo').css("display", "");
                    $('.rowMono').css("display", "none");

                }
                else {
                    $('.rowintroinputNo').css("display", "none");
                    $('#chkEditorReminder').css("display", "none");
                }
            }

            $('#TxtAuthorName').val(aAuthorName);
            $('#TxtAuthorEmail').val(aAuthorEmail);
            $('#TxtEditorName').val(aEditorName);
            $('#TxtPMEmail').html('PM Email : ' + aPMEmail);

            
            
            $('#LoadingImage').hide();
            $('#myModal').modal({ backdrop: 'static', keyboard: false });
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 2000,
            });
            $('#LoadingImage').hide();
        }
    });    
}

//Skip CE
function AddCEHistory() {

    var aitemInfoP = {
        ID: aID,
        MainID: aBookID,
        Stage: ($('#ddlStage').val() == null ? null : $('#ddlStage').val().toString()),
        SkipCE: $('#chkce').prop("checked"),
    }
    $.ajax({
        type: 'post',
        url: $('#hf_AddToCESkiptable').val(),
        data: JSON.stringify(aitemInfoP),
        contentType: 'application/json;charset=utf-8',
        datatype: 'json',
        success: function (response) {
            //$.bootstrapGrowl('Details Submitted!', {
            //    type: 'info',
            //    delay: 5000,
            //});

        },

        error: function (response) {
            $.bootstrapGrowl(response, {
                type: 'danger',
                delay: 5000,
            });
        }
    });

}

//Proof Tracking
function ProofTackView(id, aUploadType) {

    $('#ddlStage_tracking').select2({ placeholder: "Select Stage" });
    $('#ddlStage_tracking').val(-1).change();

    $('#divBkAuthor').addClass("active");
    $('#divBkEditor').removeClass("active");
    $('#divBkReport').removeClass("active");


    if (aUploadType == "Contribute") {
        $('#divBkAuthor').show();
        $('#divBkEditor').show();
        $('#divBkReport').show();
    }
    else {
        $('#divBkAuthor').show();
        $('#divBkEditor').hide();
        $('#divBkReport').show();
    }
    PopulateProofTracking(id);

    //if ($('#BkTabul li.active').text() == "Report") {
    //    PopulateProofTracking_Report(id);

    //}


}

function PopulateProofTracking(aBookID, aActiveTab) {


    $('#hf_BookID').val(aBookID);
    $('.FileAttach').show();
    var zActiveTab = $('#BkTabul li.active').text();
    zActiveTab = (zActiveTab == '' ? 'All' : zActiveTab);
    $('#btnUpdate_Tracking').show();
    $('#tblstage').show();

    //if (zActiveTab == "Report") {
    //    PopulateProofTracking_Report(id);
    //}

    if (typeof aActiveTab != "undefined" && aActiveTab != 'Get') {
        zActiveTab = aActiveTab;
    }

    var data = {
        zBookID: aBookID,
        Stage: ($('#ddlStage_tracking').val() == null ? '' : $('#ddlStage_tracking').val()),
        UType: zActiveTab
    };
    $.ajax({
        type: 'post',
        url: $('#hf_PopulateProofTracking').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var aitemList = response.aitemList;
            var aBkDetails = response.aBookDetails;
            $('.strTitle1').html('Proof Tracking - ' + aBkDetails[0].Catalog + ' (' + aBkDetails[0].Number.toString() + ') - ' + aBkDetails[0].Title);
            //$('#divBkEditor').show();
            if (aitemList.length > 0) {
                if (aitemList[0].UploadType == 'Contribute') {
                    $('#divBkAuthor').show();
                    $('#divBkEditor').show();
                    $('#divBkReport').show();
                }
                else {
                    $('#divBkAuthor').show();
                    $('#divBkEditor').hide();
                    $('#divBkReport').show();
                }
            }
            FetchProofData(aitemList);

            $('.FileAttach').hide();
            $('#myModal_ProofTracking').modal({ backdrop: 'static', keyboard: false });
            setTimeout(function () {
                $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
            }, 200);
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 2000,
            });
            $('.FileAttach').hide();
        }
    });
    $('#LoadingImage').hide();

}

function FetchProofData(ItemsList) {
    try {

        dataSet = [];
        var items = ItemsList;
        var zCtInP = 0;
        var zCtCom = 0;
        $.each(items, function (index, val) {

            if ($(this)[0]["MailSentDate"] != null) {
                var zindexL = 0;
                zCtInP += 1;
                zindexL = zCtInP;
                var sChecked = "";
                var sChecked1 = "";
                var sChecked2 = "";
                if ($(this)[0]["IsReminder1"] == 1) {
                    sChecked = "checked";
                }
                if ($(this)[0]["IsReminder2"] == 1) {
                    sChecked1 = "checked";
                }
                if ($(this)[0]["IsReminder3"] == 1) {
                    sChecked2 = "checked";
                }

                var IsCorrectionReceived = ($(this)[0]["CorrectionReceiveDt"] == null ? "" : " disabled=disabled");
                //if ($(this)[0]["Stage"] == 'Intro Email')
                //    IsCorrectionReceived = " disabled=disabled";

                var zReminderONOFF1 = '';
                if ($(this)[0]["Reminder1Date"] == null || $(this)[0]["Reminder1Sent"] == 1)
                    zReminderONOFF1 = "<center class='onoffswitch' style='width:47px'><input type='checkbox' name='onoffswitch' class='onoffswitch-checkbox' id='myonoffswitch-" + zCtInP + "' " + sChecked + IsCorrectionReceived + "  disabled/><label class='onoffswitch-label' for='myonoffswitch-" + zCtInP + "' ><span class='onoffswitch-inner'></span><span class='onoffswitch-switch' style='right: 34px;position: relative;'></span></label ></center>";
                else
                    zReminderONOFF1 = "<center class='onoffswitch' style='width:47px'><input type='checkbox' name='onoffswitch' class='onoffswitch-checkbox' id='myonoffswitch-" + zCtInP + "' " + sChecked + IsCorrectionReceived + "/><label class='onoffswitch-label' for='myonoffswitch-" + zCtInP + "'><span class='onoffswitch-inner'></span><span class='onoffswitch-switch' style='right: 34px;position: relative;'></span></label ></center>";

                var zReminderONOFF2 = '';
                if ($(this)[0]["Reminder2Date"] == null || $(this)[0]["Reminder2Sent"] == 1)
                    zReminderONOFF2 = "<center class='onoffswitch' style='width:47px'><input type='checkbox' name='onoffswitch' class='onoffswitch-checkbox'  id='Reminder2Date-" + zCtInP + "' " + sChecked1 + IsCorrectionReceived + " disabled /><label class='onoffswitch-label' for='Reminder2Date-" + zCtInP + "'><span class='onoffswitch-inner'></span><span class='onoffswitch-switch' style='right: 34px;position: relative;'></span></label ></center>";
                else
                    zReminderONOFF2 = "<center class='onoffswitch' style='width:47px'><input type='checkbox' name='onoffswitch' class='onoffswitch-checkbox' id='Reminder2Date-" + zCtInP + "' " + sChecked1 + IsCorrectionReceived + "/><label class='onoffswitch-label' for='Reminder2Date-" + zCtInP + "'><span class='onoffswitch-inner'></span><span class='onoffswitch-switch' style='right: 34px;position: relative;'></span></label ></center>";

                var zReminderONOFF3 = '';
                if ($(this)[0]["Reminder3Date"] == null || $(this)[0]["Reminder3Sent"] == 1)
                    zReminderONOFF3 = "<center class='onoffswitch' style='width:47px'><input type='checkbox' name='onoffswitch' class='onoffswitch-checkbox' id='Reminder3Date-" + zCtInP + "' " + sChecked2 + IsCorrectionReceived + " disabled /><label class='onoffswitch-label' for='Reminder3Date-" + zCtInP + "'><span class='onoffswitch-inner'></span><span class='onoffswitch-switch' style='right: 34px;position: relative;'></span></label ></center>";
                else
                    zReminderONOFF3 = "<center class='onoffswitch' style='width:47px'><input type='checkbox' name='onoffswitch' class='onoffswitch-checkbox' id='Reminder3Date-" + zCtInP + "' " + sChecked2 + IsCorrectionReceived + "/><label class='onoffswitch-label' for='Reminder3Date-" + zCtInP + "'><span class='onoffswitch-inner'></span><span class='onoffswitch-switch' style='right: 34px;position: relative;'></span></label ></center>";

                var t = [

                    $(this)[0]["ChapterID"],
                    $(this)[0]["EmailID"],
                    $(this)[0]["Stage"],
                    FormatDateColumn($(this)[0]["MailSentDate"]),


                    ($(this)[0]["Reminder1Date"] == null ? '<center>---</center>' : FormatDateColumn($(this)[0]["Reminder1Date"])),
                    $(this)[0]["Reminder1Sent"] == 1 ? "<i class='fa fa-check facenter' style='color:green'></i>" : "<i class='fa fa-times facenter' style='color:red'></i>",
                    zReminderONOFF1,

                    ($(this)[0]["Reminder2Date"] == null ? '<center>---</center>' : FormatDateColumn($(this)[0]["Reminder2Date"])),
                    $(this)[0]["Reminder2Sent"] == 1 ? "<i class='fa fa-check facenter' style='color:green'>" : "<i class='fa fa-times facenter' style='color:red'></i>",
                    zReminderONOFF2,

                    ($(this)[0]["Reminder3Date"] == null ? '<center>---</center>' : FormatDateColumn($(this)[0]["Reminder3Date"])),
                    $(this)[0]["Reminder3Sent"] == 1 ? "<i class='fa fa-check facenter' style='color:green'>" : "<i class='fa fa-times facenter' style='color:red'></i>",
                    zReminderONOFF3,

                    //"<input id='txtDueDt-" + FormatDateColumn($(this)[0]["DueDate"]) + "'  type='text'  value='" + FormatDateColumn($(this)[0]["DueDate"]) + "' readonly class='form-control DueDt inputHandCursor'  " + IsCorrectionReceived + " />",
                    ($(this)[0]["Stage"] == 'Intro Email' ? "NA" : "<input id='txtDueDt-" + index.toString() + FormatDateColumn($(this)[0]["DueDate"]) + "'  type='text'  value='" + FormatDateColumn($(this)[0]["DueDate"]) + "' readonly class='form-control DueDt inputHandCursor'  " + IsCorrectionReceived + " />"),
                    ($(this)[0]["Stage"] == 'Intro Email' ? "<input id='txtCorRecDate-" + index.toString() + FormatDateColumn($(this)[0]["AcceptDate"]) + "'  value='" + FormatDateColumn($(this)[0]["AcceptDate"]) + "'  type='text'  readonly class='form-control DueDt inputHandCursor' " + IsCorrectionReceived + " />" : "<input id='txtCorRecDate-" + index.toString() + FormatDateColumn($(this)[0]["CorrectionReceiveDt"]) + "'  value='" + FormatDateColumn($(this)[0]["CorrectionReceiveDt"]) + "'  type='text'  readonly class='form-control DueDt inputHandCursor' " + IsCorrectionReceived + " />"),
                    $(this)[0]["ID"]


                ];

                dataSet.push(t);
            }
        });
        LoadProofTracking();
        $('.imgLoader').hide();
    } catch (e) {

    }
}

function LoadProofTracking() {
    var table = $('#example').DataTable({
        dom: 't',
        "pageLength": -1,
        "lengthMenu": [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
        "deferRender": true,
        data: dataSet,
        columns: [

            { title: "Chapter<br>No.", },
            { title: "Email Sent To", "bSortable": false },
            { title: "Stage", "bSortable": false },
            { title: "Email Read", "bSortable": false },
            { title: "Read-receipt<br> Reminder", "bSortable": false },
            { title: "Caveat", "bSortable": false },

            { title: "Reminder <br>ON/OFF", "bSortable": false },
            { title: "Due Date <br>Reminder", "bSortable": false },
            { title: "Caveat", "bSortable": false },
            { title: "Reminder <br>ON/OFF", "bSortable": false },
            { title: "Over Due <br>Reminder", "bSortable": false },
            { title: "Caveat", "bSortable": false },
            { title: "Reminder <br>ON/OFF", "bSortable": false },
            { title: "Due Date", "bSortable": false },
            { title: "Email Received Date", "bSortable": false },

        ],
        columnDefs: [
            { type: 'date-dd-mmm-yyyy', targets: [7, 8] }
        ],
        "destroy": true,

        fixedHeader: {
            header: true
        },
        buttons: [],
        "scrollY": (size.height - 320),
        "scrollX": true,
        "createdRow": function (row, data, dataIndex) {
            $($(row).find('td')[0]).attr('id', data[15]);//ProofID
        },
        drawCallback: function () {
            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                .on('click', function () {
                    CheckAccessRights();
                });
        }
    });
    var start = moment().subtract(29, 'days');
    var end = moment();

    $('.DueDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        //beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });

}

function PopulateProofTracking_Report(aBookID) {
    $('#hf_BookID').val(aBookID);
    $('#LoadingImage').show();
    var zActiveTab = 'All';
    $('#tblstage').hide();

    $('#btnUpdate_Tracking').hide();


    var data = {
        zBookID: aBookID,
        Stage: ($('#ddlStage_tracking').val() == null ? '' : $('#ddlStage_tracking').val()),
        UType: zActiveTab
    };
    $.ajax({
        type: 'post',
        url: $('#hf_PopulateProofTracking').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            var aitemList = response.aitemList;
            //$('#divBkEditor').show();
            if (aitemList.length > 0) {
                if (aitemList[0].UploadType == 'Contribute') {
                    $('#divBkAuthor').show();
                    $('#divBkEditor').show();
                    $('#divBkReport').show();
                }
                else {
                    $('#divBkAuthor').show();
                    $('#divBkEditor').hide();
                    $('#divBkReport').show();
                }
            }
            FetchProofData_Report(aitemList);
            $('#LoadingImage').hide();

            $('#myModal_ProofTracking').modal({ backdrop: 'static', keyboard: false });
            setTimeout(function () {
                $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
            }, 200);
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 2000,
            });
            $('#LoadingImage').hide();
        }
    });
    $('#LoadingImage').hide();
}

function FetchProofData_Report(ItemsList) {
    try {

        dataSet = [];
        var items = ItemsList;
        var zCtInP = 0;
        var zCtCom = 0;
        $.each(items, function (index) {
            if ($(this)[0]["MailSentDate"] != null) {
                var zindexL = 0;
                zCtInP += 1;
                zindexL = zCtInP;

                var zReminderONOFF1 = '';
                if ($(this)[0]["IsReminder1"] == 0)
                    zReminderONOFF1 = "OFF";
                else
                    zReminderONOFF1 = "ON";

                var zReminderONOFF2 = '';
                if ($(this)[0]["IsReminder2"] == 0)
                    zReminderONOFF2 = "OFF";
                else
                    zReminderONOFF2 = "ON";

                var zReminderONOFF3 = '';
                if ($(this)[0]["IsReminder3"] == 0)
                    zReminderONOFF3 = "OFF";
                else
                    zReminderONOFF3 = "ON";

                var t = [

                    $(this)[0]["ChapterID"],
                    $(this)[0]["EmailID"],
                    $(this)[0]["Stage"],
                    FormatDateColumn($(this)[0]["MailSentDate"]),


                    ($(this)[0]["Reminder1Date"] == null ? '<center>---</center>' : FormatDateColumn($(this)[0]["Reminder1Date"])),
                    $(this)[0]["Reminder1Sent"] == 1 ? "<center>1</center>" : "<center>0</center>",
                    zReminderONOFF1,

                    ($(this)[0]["Reminder2Date"] == null ? '<center>---</center>' : FormatDateColumn($(this)[0]["Reminder2Date"])),
                    $(this)[0]["Reminder2Sent"] == 1 ? "<center>1</center>" : "<center>0</center>",
                    zReminderONOFF2,

                    ($(this)[0]["Reminder3Date"] == null ? '<center>---</center>' : FormatDateColumn($(this)[0]["Reminder3Date"])),
                    $(this)[0]["Reminder3Sent"] == 1 ? "<center>1</center>" : "<center>0</center>",
                    zReminderONOFF3,


                    ($(this)[0]["Stage"] == 'Intro Email' ? "NA" : FormatDateColumn($(this)[0]["DueDate"])),
                    ($(this)[0]["Stage"] == 'Intro Email' ? FormatDateColumn($(this)[0]["AcceptDate"]) : FormatDateColumn($(this)[0]["CorrectionReceiveDt"])),
                    $(this)[0]["ID"]


                ];

                dataSet.push(t);
            }
        });
        LoadProofTracking_Report();
        $('.imgLoader').hide();
    } catch (e) {

    }

}

function LoadProofTracking_Report() {
    var table = $('#example').DataTable({
        dom: 'lBfrtip',
        "pageLength": -1,
        "lengthMenu": [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
        "deferRender": true,
        data: dataSet,
        columns: [

            { title: "Chapter<br>No.", },
            { title: "Email Sent To", "bSortable": false },
            { title: "Stage", "bSortable": false },
            { title: "Email Read", "bSortable": false },
            { title: "Read-receipt<br> Reminder", "bSortable": false },
            { title: "Caveat", "bSortable": false },
            { title: "Reminder <br>ON/OFF", "bSortable": false },
            { title: "Due Date <br>Reminder", "bSortable": false },
            { title: "Caveat", "bSortable": false },
            { title: "Reminder <br>ON/OFF", "bSortable": false },
            { title: "Over Due <br>Reminder", "bSortable": false },
            { title: "Caveat", "bSortable": false },
            { title: "Reminder <br>ON/OFF", "bSortable": false },
            { title: "Due Date", "bSortable": false },
            { title: "Email Received Date", "bSortable": false },

        ],
        columnDefs: [
            { type: 'date-dd-mmm-yyyy', targets: [7, 8] }
        ],
        "destroy": true,

        fixedHeader: {
            header: true
        },
        buttons: [
            {
                extend: 'excelHtml5',
                text: '<img src="../Images/excel.png" title="Export to Excel" />',
                filename: 'PT' + today.toShortFormatWithTime(),

                title: 'Proof Tracking - ' + $('#BkTabul li.active').text(),
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
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
                filename: 'PT' + today.toShortFormatWithTime(),

                title: 'Proof Tracking - ' + $('#BkTabul li.active').text(),
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
                    format: {
                        header: function (data, row, column, node) {
                            var zheader = data.toString().split('<div class="dropdown')[0];
                            zheader = zheader.toString().split('<i class="fa fa-filter')[0];
                            return zheader.replace('<br>', '');
                        },
                    }
                }

            }

        ],
        "scrollY": (size.height - 320),
        "scrollX": true,
        "createdRow": function (row, data, dataIndex) {
            $($(row).find('td')[0]).attr('id', data[15]);//ProofID
        },
        drawCallback: function () {
            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                .on('click', function () {
                    CheckAccessRights();
                });
        }
    });
    var start = moment().subtract(29, 'days');
    var end = moment();

    $('.DueDt').datetimepicker({
        format: 'd M Y',
        timepicker: false,
        beforeShowDay: noWeekendsOrHolidays,
        scrollMonth: false,
        scrollInput: false
    });

}

$(function () {

    $('#btnUpdate_Tracking').click(function () {
        $('#LoadingImage').show();
        var validate = ValidateDueDate();
        if (validate) {

            var getResultList = [];
            var caveat = 1;
            $("table#example.tblTrans tbody tr").each(function (index, val) {
                var arrayOfThisRow = [];
                var tableData = $(this).find('td');

                if (tableData.length > 0) {
                    tableData.each(function (e, val) {
                        if (e == 0) {
                            var zProofID = $(this)[0].id;
                            arrayOfThisRow.push(zProofID);
                        }
                        else if (e == 13 || e == 14) {

                            if ($(this).find('input').length > 0) {
                                arrayOfThisRow.push($(this).find('input')[0].value.toString().replace(",", ""));
                            }
                            else {
                                arrayOfThisRow.push("");
                            }

                        }
                        else if (e == 6) {

                            var zValue = $(this).find('input.onoffswitch-checkbox').prop('checked'); //$("#myonoffswitch-" + caveat + "").prop('checked');

                            arrayOfThisRow.push(zValue);
                        }
                        else if (e == 9) {

                            var zValue = $(this).find('input.onoffswitch-checkbox').prop('checked');//$("#Reminder2Date-" + caveat + "").prop('checked');

                            arrayOfThisRow.push(zValue);
                        }
                        else if (e == 12) {

                            var zValue = $(this).find('input.onoffswitch-checkbox').prop('checked');//$("#Reminder3Date-" + caveat + "").prop('checked');

                            arrayOfThisRow.push(zValue);
                        }
                    });
                    if (arrayOfThisRow[0] != '')
                        getResultList.push(arrayOfThisRow);
                }
                caveat++;
            });
            if (getResultList.length == 0) {
                $.bootstrapGrowl('No Records found for update !', {
                    type: 'danger',
                    delay: 5000,
                });
                $('#LoadingImage').hide();
                return false;
            }
            var data = {

                AccessList: getResultList
            }
            $.ajax({
                type: 'post',
                url: $('#hf_UpdateProoftracking').val(),
                data: data,
                datatype: 'json',
                traditional: true,
                success: function (response) {
                    $.bootstrapGrowl(response, {
                        type: 'info',
                        delay: 5000,

                    });
                    PopulateProofTracking($('#hf_BookID').val());
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

    $('#btnBkGet_track, #BkTabul li').click(function () {

        if ($(this).text() == "Get") {
            PopulateProofTracking($('#hf_BookID').val());
        }

        if ($(this).text() == "Report") {

            PopulateProofTracking_Report($('#hf_BookID').val());
        }
        else {
            PopulateProofTracking($('#hf_BookID').val(), $(this).text());

        }

    });

});

function ValidateDueDate() {
    var zResult = true;
    if ($('#txtDueDt-').val() == '') {
        $.bootstrapGrowl('Enter Due Date !', { type: 'danger', delay: 5000, });
        $('#txtDueDt-').focus();
        zResult = false;
        $('#LoadingImage').hide();
    }
    return zResult;
};

function ShowBookMaster(zID, itemP) {
    $('.BookView').hide();
    $('#' + zID).show();
    var table = $('#exampleList').DataTable();
    table.draw();
    CheckAccessRights();
    $('.iright').css('color', '#1d2c99');
    $('.iright').css('cursor', 'pointer');
    $('#' + itemP).css('color', '#2196f3');
    $('#' + itemP).css('cursor', 'not-allowed');
}

function AuthorEditorView(zID) {
    $('#BkFileView li').removeClass('active');
    $('#BkFileView li:first').addClass('active in');
    aBookID = zID;
    LoadBookChapterList_AE(zID, 'CE Review');
}

function LoadBookChapterList_AE(aBookID, aStage) {
    $('.FileAttach').show();
    var data = { BookID: aBookID, zStage: aStage };
    $.ajax({
        type: 'post',
        url: $('#hf_GetBookChapterList').val(),
        data: data,
        datatype: 'json',
        success: function (response) {
            if (response.zBookChapterList.length == 0) {
                $.bootstrapGrowl('Not Available !', {
                    type: 'warning',
                    delay: 5000,
                });
                $('#example_AE tbody tr').remove();
                $('.FileAttach').hide();
                return false;
            }
            var zItemList = response.zBookChapterList;
            FetechData_AE(zItemList);
            setTimeout(function () {
                $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
            }, 200);
            // Hide Author Correction Download Option for Author Login
            $('#example_AE_wrapper table th:nth-child(6)').show();
            $('#example_AE_wrapper table td:nth-child(6)').show();
            if (zItemList[0].UserType.toLowerCase() == 'author' || zItemList[0].EditorCount == "0") {
                $('#btnDownload_AU').hide();
                $('#example_AE_wrapper table th:nth-child(6)').hide();
                $('#example_AE_wrapper table td:nth-child(6)').hide();
            }
            $('.FileAttach').hide();
        },
        error: function (result) {
            $.bootstrapGrowl('Error Occured, Try Again !', {
                type: 'danger',
                delay: 5000,
            });
            $('.FileAttach').hide();
        }
    });

}

var dataSet_AE = [];
function FetechData_AE(ItemsList) {
    try {
        dataSet_AE = [];
        var items = ItemsList;
        var zCtInP = 1;
        var zCtCom = 0;
        var aChapterID = '';
        var zindexL = 0;
        $.each(items, function (index) {
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
            else if ($(this)[0]['CorrectionReceiveDt'] == null && $(this)[0]['IsAuthorNoCorrection'] == null) {
                zAUCorrection = '<center>Author Yet to Upload</center>';

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

            if (aChapterID != $(this)[0]["ChapterID"]) {

                zCtInP += 1;
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
                dataSet_AE.push(t);
            }
            aChapterID = $(this)[0]["ChapterID"];

            $('#DivHeadingTitle').html("<strong>" + $(this)[0]["Catalog"] + ' (' + $(this)[0]["Number"] + ') - ' + $(this)[0]["BookTitle"] + " - Chapter Details</strong>");

            if ($(this)[0]['CorrectionReceiveDt'] == null) {
                $('.divActionBtn').show();
            }
        });
        LoadData_AE();
        $('.FileAttach').hide();
    } catch (e) {

    }
}

function LoadData_AE() {
    var table = $('#example_AE').DataTable({
        dom: 't',
        "pageLength": -1,
        "lengthMenu": [[15, 25, 50, 75, 100, -1], [15, 25, 50, 75, 100, "All"]],
        data: dataSet_AE,
        columns: [
            { title: "S.No.", "bSortable": false },
            { title: "Chapter", "bSortable": false },
            { title: "Title", "bSortable": false },
            { title: "Due Date", "bSortable": false },
            { title: "<center>Download<br><input type='checkbox' class='chkDownloadAll' /></center>", "bSortable": false },
            //{ title: "<center>Download<br>Author Correction</center>", "bSortable": false },
            //{ title: "<center>Upload</center>", "bSortable": false },
            //{ title: "<center>No Correction</center>", "bSortable": false },
        ],
        "createdRow": function (row, data, dataIndex) {
            $($(row).find('td')[0]).attr('id', data[7]);//ProofID
        },
        "destroy": true,
        "scrollY": (size.height - 260),
        "scrollX": true,

    });
    $('.FileAttach').hide();
    $('#myModal_View').modal({ backdrop: 'static', keyboard: false });

    $('.chkDownloadAll').change(function () {
        if ($(this).is(':checked'))
            $('.chkDownload').not('[disabled="disabled"]').prop('checked', 'checked');
        else
            $('.chkDownload').not('[disabled="disabled"]').removeAttr('checked');
    });

    //Author Correction Download 
    $('.chkDownloadAU_All').change(function () {
        if ($(this).is(':checked'))
            $('.chkDownload_AU').not('[disabled="disabled"]').prop('checked', 'checked');
        else
            $('.chkDownload_AU').not('[disabled="disabled"]').removeAttr('checked');
    });
}

$(function () {

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

    $('#BkFileView li').click(function () {
        LoadBookChapterList_AE(aBookID, $(this).text());
    });
});

function DownloadProof(zProodIDList, zType) {
    zProodIDList = zProodIDList.replace(/,\s*$/, "");
    window.location = $('#hf_DownloadProofFile').val() + '?zProofID=' + zProodIDList + '&zType=' + zType;
}