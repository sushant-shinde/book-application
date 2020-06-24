using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WMS.Models;
using System.Data;
using Newtonsoft.Json;
using System.IO;
using System.Data.Entity;
using System.Text;

namespace WMS.Controllers
{
    public class ProofDistributionController : Controller
    {
        WMSEntities aDBManager = new WMSEntities();
        protected override JsonResult Json(object data, string contentType, Encoding contentEncoding, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data = data,
                ContentType = contentType,
                ContentEncoding = contentEncoding,
                JsonRequestBehavior = behavior,
                MaxJsonLength = Int32.MaxValue
            };
        }


        [CustomAuthorizeAttribute]
        public ActionResult Index()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            ProofDistributionModel aBkData = new ProofDistributionModel();
            aBkData.CatalogList = Common.GetCatalogList(nUserID, false);
            aBkData.NumberList = Common.GetNumberList(nUserID, false);
            aBkData.ISBNList = Common.GetISBNList(nUserID, false);
            var aItemList = aDBManager.SP_GetBookData(nUserID, "WIP", "Proof").ToList();
            List<PBookList> ProofBkList = new List<PBookList>();
            foreach (var item in aItemList)
            {
                ProofBkList.Add(new PBookList()
                {
                    Book_ID = item.ID,
                    Book_Number = item.Number,
                    Book_Img = item.ImgPath,
                    Book_Catalog = item.Catalog,
                    Book_ISBN = item.ISBN,
                    Book_PEName = item.PEName,
                    Book_PMName = item.PMName,
                    Book_ReceivedDt = item.ReceivedDt,
                    Book_DueDt = item.DueDt
                });
            }
            aBkData.ProofBookList = ProofBkList;
            return View(aBkData);
        }

        public List<SelectListItem> GetCatalogList(bool awithAllC = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager.TBL_MainMaster.Where(item => (item.PMName.ToString() != null) && (item.PMName.ToString() != "")).Select(item => new { item.Catalog }).ToList();
            if (awithAllC)
                items.Add(new SelectListItem { Text = "All", Value = "All" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.Catalog == null ? string.Empty : item.Catalog.ToUpper(),
                    Text = item.Catalog == null ? string.Empty : item.Catalog.ToUpper()

                });
            }

            return items;
        }


        public List<SelectListItem> GetISBNList(bool awithAllC = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager.TBL_MainMaster.Where(item => (item.PMName.ToString() != null) && (item.PMName.ToString() != "")).Select(item => new { item.ISBN }).ToList();
            if (awithAllC)
                items.Add(new SelectListItem { Text = "All", Value = "All" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.ISBN == null ? string.Empty : item.ISBN.ToUpper(),
                    Text = item.ISBN == null ? string.Empty : item.ISBN.ToUpper()

                });
            }

            return items;
        }

        public List<SelectListItem> GetNumberList(bool awithAllC = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager.TBL_MainMaster.Where(item => (item.PMName.ToString() != null) && (item.PMName.ToString() != "")).Select(item => new { item.Number }).ToList();
            if (awithAllC)
                items.Add(new SelectListItem { Text = "All", Value = "All" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.Number == null ? string.Empty : item.Number.ToUpper(),
                    Text = item.Number == null ? string.Empty : item.Number.ToUpper()

                });
            }

            return items;
        }

        [HttpGet]
        public ActionResult GetChapters(int BookID, string Stage, string UploadType)
        {

            List<SelectListItem> EDitems = new List<SelectListItem>();
            var aEditorList = aDBManager.TBL_MainMaster.Where(item => item.ID.ToString() == BookID.ToString()).Select(item => new { item.EditorEmail }).ToList();

            if (aEditorList[0].EditorEmail != null)
            {
                var EDList = aEditorList[0].EditorEmail.Replace(" ", "").ToString().Split(';');

                foreach (var item in EDList)
                {
                    EDitems.Add(new SelectListItem()
                    {
                        Value = item == null ? string.Empty : item,
                        Text = item == null ? string.Empty : item

                    });
                }
            }

            //var aitemList = aDBManager.TBL_SubMaster.Where(item => item.MainID.ToString() == BookID.ToString()).ToList();
            var aitemList = aDBManager.SP_GetStagewiseChapter(BookID, Stage).ToList();
            var aBookDetails = aDBManager.SP_GetBookDetails(BookID).ToList();
            var BKPPDateList = aDBManager.SP_GetBookDetails_ProjectPlan_DateList(BookID).ToList();

            var aMailBody = aDBManager.TBL_MailTemplate.ToList();
            var aCEHistory = aDBManager.TBL_ProofDistribution_History.Where(item => item.MainID == BookID).OrderByDescending(u => u.ID).FirstOrDefault();
            return Json(new { aitemList, EDitems, aBookDetails, aMailBody, aCEHistory, BKPPDateList }, JsonRequestBehavior.AllowGet);

        }

        [HttpGet]
        public ActionResult GetEmailToChapters(int BookID, string EmailTo)
        {


            var aitemList = aDBManager.SP_GetEmailToChapter(BookID, EmailTo).ToList();

            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult GetData(string Type, string CatalogList, string NumList, string ISBNList, string PublList)
        {

            try
            {

                int nUserID = int.Parse(Session["LoginID"].ToString());
                var aItemList = aDBManager.SP_GetBookData(nUserID, Type, "Proof").ToList();

                if (CatalogList != "All")
                {
                    var aCatalogList = (CatalogList != null ? CatalogList.Split(',') : null);
                    string[] iCatalogList = (aCatalogList != null ? aCatalogList.ToArray() : null);

                    aItemList = aItemList.Where(item => (iCatalogList.Contains(item.Catalog))).ToList();
                }

                if (NumList != "All")
                {
                    var aNumList = (NumList != null ? NumList.Split(',') : null);
                    string[] iNumList = (aNumList != null ? aNumList.ToArray() : null);

                    aItemList = aItemList.Where(item => (iNumList.Contains(item.Number))).ToList();
                }

                if (ISBNList != "All")
                {
                    var aISBNList = (ISBNList != null ? ISBNList.Split(',') : null);
                    string[] iISBNList = (aISBNList != null ? aISBNList.ToArray() : null);

                    aItemList = aItemList.Where(item => (iISBNList.Contains(item.ISBN))).ToList();
                }

                if (PublList != "All")
                {
                    var aPublList = (PublList != null ? PublList.Split(',') : null);
                    string[] iPublList = (aPublList != null ? aPublList.ToArray() : null);

                    aItemList = aItemList.Where(item => (iPublList.Contains(item.Publisher.ToString()))).ToList();
                }

                return Json(new { aItemList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }

        }

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult InsertProof(string[] zEditor, string zStage, string zEditorDueDt, string zAllED, string zEDReminder, string zSeries, string zEditorName, string zAuthorName, string zAuthorEmail, string zAuthorDueDt, string zPEinCC, string zAuthorReminder, string[] zProofChapterL, string zBookID, string zUploadType, string zAUMailBody, string zEDMailBody, string zWelcomeMailBody, string zPMName, string zPMEmail, string zPEEmail, string zTSPMEmail, string zCatalog, string zBookTitle, string ZIntroUser, string zCEReviewDueDt, string zCEReviewReturnDt, string zFirstPageDueDt, string zFirstPageReturnDt, string zIsBookWise)
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            string strPassword = "";
            string strContributeAuthor = "";
            string strContributeEditor = "";
            int proofId = 0;
            bool isBookWise = false;
            string zZipFolderL = string.Empty; string aFileName = string.Empty; string zZipPath = string.Empty;

            try
            {
                int aBookIDL = int.Parse(zBookID);
                var BKPPDateList = aDBManager.SP_GetBookDetails_ProjectPlan_DateList(aBookIDL).ToList();

                if (zUploadType == "Mono")
                {
                    var aitemBkList = aDBManager.TBL_MainMaster.Single(i => i.ID.ToString() == zBookID);

                    aitemBkList.AuthorName = zAuthorName;
                    aitemBkList.AuthorEmail = zAuthorEmail;
                    aDBManager.SaveChanges();
                    string[] zstrEmail = zAuthorEmail.Split(';');
                    foreach (var Emailitem in zstrEmail)
                    {
                        if (Emailitem.Trim() != "")
                        {
                            var aUser = aDBManager.UserMasters.Where(item => item.EmailID == Emailitem.Trim()).ToList();
                            int intLoginID = 0;
                            string strUserName = "";
                            if (aUser.Count == 0)
                            {
                                string zPassword = Common.RandomString(6);

                                UserMaster tblUser = new UserMaster();
                                tblUser.LoginID = Emailitem.Trim();
                                tblUser.LoginName = Emailitem.Trim();
                                tblUser.ActiveStatus = "Active";
                                tblUser.Password = Common.EncryptString(zPassword);
                                strPassword = zPassword;
                                tblUser.EmailID = Emailitem.Trim();
                                tblUser.UserType = "Author";
                                tblUser.UpdatedTime = DateTime.Now;
                                tblUser.CreatedTime = DateTime.Now;
                                tblUser.CreatedBy = nUserID.ToString();
                                tblUser.UpdatedBy = nUserID.ToString();
                                tblUser.RoleID = 9;
                                tblUser.DefaultPage = "Home";
                                aDBManager.UserMasters.Add(tblUser);
                                aDBManager.SaveChanges();
                                aUser = aDBManager.UserMasters.Where(item => item.EmailID == Emailitem.Trim()).ToList();
                                intLoginID = int.Parse(aUser[0].UserID.ToString());
                                strUserName = aUser[0].LoginID;
                            }
                            else
                            {
                                intLoginID = int.Parse(aUser[0].UserID.ToString());
                                strPassword = Common.DecryptString(aUser[0].Password);
                                strUserName = aUser[0].LoginID;
                            }

                            isBookWise = Convert.ToBoolean(Convert.ToByte(zIsBookWise == "true" ? 1 : 0));
                            if (isBookWise)
                            {
                                TBL_ProofDistribution tblProof = new TBL_ProofDistribution();
                                tblProof.BookID = int.Parse(zBookID);
                                tblProof.ChapterID = "ALL";
                                tblProof.UploadType = zUploadType;
                                tblProof.UserType = "Author";
                                tblProof.Stage = zStage;
                                if (zStage != "Intro Email")
                                {
                                    string zZipFileName = string.Format("{0}_{1}_Allocate_{2}", zBookTitle, nUserID, DateTime.Now.ToString("HHmmss"));

                                    string ztempPath = string.Format("{0}_{1}", zBookTitle, nUserID);
                                    zZipPath = Server.MapPath(string.Format("~/Source/OutSource/{0}", zCatalog + "_" + zUploadType + "_" + zStage));
                                    zZipFolderL = Server.MapPath(string.Format("~/Source/OutSource/temp/{0}/", ztempPath));
                                    aFileName = string.Format("{0}.zip", zZipFileName);

                                    tblProof.DueDate = Convert.ToDateTime(zAuthorDueDt);
                                    tblProof.UploadFileName = aFileName;
                                    tblProof.FileUploadDate = DateTime.Now;
                                    tblProof.Status = "Uploaded";
                                }
                                tblProof.InsertDate = DateTime.Now;
                                tblProof.PEinCC = Convert.ToByte(zPEinCC == "true" ? 1 : 0);
                                //tblProof.IsReminder = Convert.ToByte(zAuthorReminder == "true" ? 1 : 0);
                                if (zStage == "Intro Email")
                                {
                                    tblProof.IsReminder1 = Convert.ToByte(zAuthorReminder == "true" ? 1 : 0);
                                }
                                else
                                {
                                    tblProof.IsReminder1 = Convert.ToByte(zAuthorReminder == "true" ? 1 : 0);
                                    tblProof.IsReminder2 = Convert.ToByte(zAuthorReminder == "true" ? 1 : 0);
                                    tblProof.IsReminder3 = Convert.ToByte(zAuthorReminder == "true" ? 1 : 0);
                                }

                                tblProof.LoginID = intLoginID;
                                tblProof.EmailID = Emailitem.Trim();
                                aDBManager.TBL_ProofDistribution.Add(tblProof);
                                if (aDBManager.SaveChanges() > 0)
                                {
                                    proofId = tblProof.ID;
                                    Common.CreateZIP(zZipFolderL, aFileName, zZipPath);
                                }
                            }
                            else
                            {
                                foreach (var item in zProofChapterL)
                                {
                                    string[] zstrSplit = item.Split(',');
                                    if (zstrSplit[0].ToString() == "true")
                                    {
                                        TBL_ProofDistribution tblProof = new TBL_ProofDistribution();
                                        tblProof.BookID = int.Parse(zBookID);
                                        tblProof.ChapterID = zstrSplit[1].ToString();
                                        tblProof.UploadType = zUploadType;
                                        tblProof.UserType = "Author";
                                        tblProof.Stage = zStage;
                                        if (zStage != "Intro Email")
                                        {
                                            tblProof.DueDate = Convert.ToDateTime(zAuthorDueDt);
                                        }
                                        tblProof.InsertDate = DateTime.Now;
                                        tblProof.PEinCC = Convert.ToByte(zPEinCC == "true" ? 1 : 0);
                                        //tblProof.IsReminder = Convert.ToByte(zAuthorReminder == "true" ? 1 : 0);
                                        if (zStage == "Intro Email")
                                        {
                                            tblProof.IsReminder1 = Convert.ToByte(zAuthorReminder == "true" ? 1 : 0);
                                        }
                                        else
                                        {
                                            tblProof.IsReminder1 = Convert.ToByte(zAuthorReminder == "true" ? 1 : 0);
                                            tblProof.IsReminder2 = Convert.ToByte(zAuthorReminder == "true" ? 1 : 0);
                                            tblProof.IsReminder3 = Convert.ToByte(zAuthorReminder == "true" ? 1 : 0);
                                        }

                                        tblProof.LoginID = intLoginID;
                                        tblProof.EmailID = Emailitem.Trim();
                                        aDBManager.TBL_ProofDistribution.Add(tblProof);
                                        aDBManager.SaveChanges();
                                    }
                                }
                            }
                        }
                    }

                    TBL_ProofEmail tblEmail = new TBL_ProofEmail();
                    tblEmail.FromEmail = zPMEmail;
                    tblEmail.ToEmail = zAuthorEmail.Trim();
                    if (zPEinCC == "true") //|| zStage == "Intro Email"
                    {
                        tblEmail.CCEmail = zPEEmail + ";" + zPMEmail;
                    }
                    else
                    {
                        tblEmail.CCEmail = zPMEmail;
                    }
                    tblEmail.BCCEmail = zTSPMEmail;
                    if (zStage == "First Page")
                    {
                        tblEmail.MailSubject = zCatalog + " (1st pages - author) " + zBookTitle;
                    }
                    else if (zStage == "CE Review")
                    {
                        tblEmail.MailSubject = zCatalog + " (Copyedited manuscript - author) " + zBookTitle;
                    }
                    else if (zStage == "Intro Email")
                    {
                        tblEmail.MailSubject = zCatalog + ": " + zBookTitle + " – Introduction email";
                    }

                    if (zStage == "Intro Email")
                    {
                        if ((zAuthorName.Trim(';').IndexOf(';') > 0) || (zAuthorName.Trim(';').IndexOf(',') > 0) || (zAuthorName.Trim(';').IndexOf(" and ") > 0))
                        {
                            tblEmail.MailBody = zAUMailBody.Replace("{Catalog}", zCatalog)
                                .Replace("{Author}", zAuthorName)
                                .Replace("{PM email ID}", zPMEmail)
                                .Replace("{project manager signature}", zPMName)
                                .Replace("{User}", "Author")
                                .Replace("{BookTitle}", zBookTitle)
                                .Replace("{PMName}", zPMName)
                                .Replace("{CEReviewDueDt}", zCEReviewDueDt)
                                .Replace("{CEReviewReturnDt}", zCEReviewReturnDt)
                                .Replace("{FirstPageDueDt}", zFirstPageDueDt)
                                .Replace("{FirstPageReturnDt}", zFirstPageReturnDt)
                                .Replace("{AuthorName}", zAuthorName)
                                .Replace("{Salutation}", "Drs. ")

                                .Replace("{PRReviewDueDt}", BKPPDateList[0].PPAUDueDate.ToString())
                                .Replace("{PRReviewReturnDt}", BKPPDateList[0].FRAUDueDate.ToString())
                                .Replace("{VoPageDueDt}", BKPPDateList[0].VOUDueDate.ToString())
                                .Replace("{VoPageReturnDt}", BKPPDateList[0].FVOUDueDate.ToString())
                                ;
                        }
                        else
                        {
                            tblEmail.MailBody = zAUMailBody.Replace("{Catalog}", zCatalog)
                                .Replace("{Author}", zAuthorName)
                                .Replace("{PM email ID}", zPMEmail)
                                .Replace("{project manager signature}", zPMName)
                                .Replace("{User}", "Author")
                                .Replace("{BookTitle}", zBookTitle)
                                .Replace("{PMName}", zPMName)
                                .Replace("{CEReviewDueDt}", zCEReviewDueDt)
                                .Replace("{CEReviewReturnDt}", zCEReviewReturnDt)
                                .Replace("{FirstPageDueDt}", zFirstPageDueDt)
                                .Replace("{FirstPageReturnDt}", zFirstPageReturnDt)
                                .Replace("{AuthorName}", zAuthorName)
                                .Replace("{Salutation}", "Dr. ")

                                .Replace("{PRReviewDueDt}", BKPPDateList[0].PPAUDueDate.ToString())
                                .Replace("{PRReviewReturnDt}", BKPPDateList[0].FRAUDueDate.ToString())
                                .Replace("{VoPageDueDt}", BKPPDateList[0].VOUDueDate.ToString())
                                .Replace("{VoPageReturnDt}", BKPPDateList[0].FVOUDueDate.ToString())
                                ;
                        }
                    }
                    else
                    {
                        double intWeeks = Math.Round(((Convert.ToDateTime(zAuthorDueDt) - Convert.ToDateTime(DateTime.Today)).TotalDays / 7));
                        if ((zAuthorName.Trim(';').IndexOf(';') > 0) || (zAuthorName.Trim(';').IndexOf(',') > 0) || (zAuthorName.Trim(';').IndexOf(" and ") > 0))
                        {
                            tblEmail.MailBody = zAUMailBody.Replace("{Catalog}", zCatalog).Replace("{Author}", zAuthorName).Replace("{PM email ID}", zPMEmail).Replace("{project manager signature}", zPMName).Replace("{Week}", intWeeks.ToString()).Replace("{User}", "Author").Replace("{BookTitle}", zBookTitle).Replace("{PMName}", zPMName).Replace("{DueDate}", zAuthorDueDt).Replace("{AuthorName}", zAuthorName).Replace("{Salutation}", "Drs. ");
                        }
                        else
                        {
                            tblEmail.MailBody = zAUMailBody.Replace("{Catalog}", zCatalog).Replace("{Author}", zAuthorName).Replace("{PM email ID}", zPMEmail).Replace("{project manager signature}", zPMName).Replace("{Week}", intWeeks.ToString()).Replace("{User}", "Author").Replace("{BookTitle}", zBookTitle).Replace("{PMName}", zPMName).Replace("{DueDate}", zAuthorDueDt).Replace("{AuthorName}", zAuthorName).Replace("{Salutation}", "Dr. ");
                        }
                    }

                    tblEmail.BookID = int.Parse(zBookID);
                    aDBManager.TBL_ProofEmail.Add(tblEmail);
                    aDBManager.SaveChanges();

                    if (zStage == "Intro Email")
                    {
                        foreach (var Emailitem in zstrEmail)
                        {
                            TBL_ProofEmail tblWelcomEmail = new TBL_ProofEmail();
                            tblWelcomEmail.FromEmail = zPMEmail;
                            tblWelcomEmail.ToEmail = Emailitem.Trim();

                            tblWelcomEmail.BCCEmail = zPMEmail + ";" + zTSPMEmail;

                            tblWelcomEmail.MailSubject = "Welcome to Sesame - " + zCatalog;

                            string strUserName = "";
                            var aUser = aDBManager.UserMasters.Where(items => items.EmailID == Emailitem.Trim()).ToList();
                            strPassword = Common.DecryptString(aUser[0].Password);
                            strUserName = aUser[0].LoginID;

                            tblWelcomEmail.MailBody = zWelcomeMailBody.Replace("{Catalog}", zCatalog).Replace("{Author}", zAuthorName).Replace("{PM email ID}", zPMEmail).Replace("{project manager signature}", zPMName).Replace("{User}", "Author").Replace("{BookTitle}", zBookTitle).Replace("{UserName}", strUserName).Replace("{Password}", strPassword).Replace("{PMName}", zPMName);

                            tblWelcomEmail.BookID = int.Parse(zBookID);
                            aDBManager.TBL_ProofEmail.Add(tblWelcomEmail);
                            aDBManager.SaveChanges();
                        }
                    }
                }
                else
                {
                    if ((zStage != "Intro Email") || (zStage == "Intro Email" && ZIntroUser == "Editor"))
                    {
                        foreach (var EDEmailitem in zEditor)
                        {
                            strContributeEditor = strContributeEditor + EDEmailitem.Trim().Trim(';') + ';';
                        }
                        var aitemBkList = aDBManager.TBL_MainMaster.Single(i => i.ID.ToString() == zBookID);
                        aitemBkList.EditorName = zEditorName;
                        aDBManager.SaveChanges();
                    }

                    isBookWise = Convert.ToBoolean(Convert.ToByte(zIsBookWise == "true" ? 1 : 0));
                    if (isBookWise)
                    {
                        int pos = 0;
                        StringBuilder authorEmailIDs = new StringBuilder();
                        StringBuilder editorEmailIDs = new StringBuilder();
                        //string editorEmailIDs = string.Empty;
                        List<string> emails = new List<string>();

                        foreach (var item in zProofChapterL)
                        {
                            string[] zstrSplit = item.Split(',');
                            string[] zstrEmail = zstrSplit[4].Split(';');
                            string Cha = zstrSplit[1].ToString();

                            var aitemBkList = aDBManager.TBL_SubMaster.Where(chitem => (chitem.MainID.ToString() == zBookID) && (chitem.Number.ToString() == Cha)).ToList();

                            aitemBkList[0].AuthorName = zstrSplit[3];
                            aitemBkList[0].AuthorEmail = zstrSplit[4];
                            aDBManager.SaveChanges();

                            if ((zStage != "Intro Email") || (zStage == "Intro Email" && ZIntroUser == "Author"))
                            {
                                foreach (var Emailitem in zstrEmail)
                                {
                                    authorEmailIDs = authorEmailIDs.Append(Emailitem + ';');

                                    if (strContributeAuthor.IndexOf(Emailitem.Trim().Trim(';')) == -1)
                                    {
                                        strContributeAuthor = strContributeAuthor + Emailitem.Trim().Trim(';') + ';';
                                    }

                                    pos = Array.IndexOf(zEditor, Emailitem.Trim());
                                    var aUser = aDBManager.UserMasters.Where(items => items.EmailID == Emailitem.Trim()).ToList();
                                    int intLoginID = 0;
                                    string strUserName = "";
                                    if (aUser.Count == 0)
                                    {
                                        string zPassword = Common.RandomString(6);

                                        UserMaster tblUser = new UserMaster();
                                        tblUser.LoginID = Emailitem.Trim();
                                        tblUser.LoginName = Emailitem.Trim();
                                        tblUser.ActiveStatus = "Active";
                                        tblUser.Password = Common.EncryptString(zPassword);
                                        strPassword = zPassword;
                                        tblUser.EmailID = Emailitem.Trim();
                                        if (pos > -1)
                                        {
                                            tblUser.UserType = "AuthorEditor";
                                        }
                                        else
                                        {
                                            tblUser.UserType = "Author";
                                        }

                                        tblUser.UpdatedTime = DateTime.Now;
                                        tblUser.CreatedTime = DateTime.Now;
                                        tblUser.CreatedBy = nUserID.ToString();
                                        tblUser.UpdatedBy = nUserID.ToString();
                                        tblUser.RoleID = 9;
                                        tblUser.DefaultPage = "Home";

                                        aDBManager.UserMasters.Add(tblUser);
                                        aDBManager.SaveChanges();

                                        aUser = aDBManager.UserMasters.Where(items => items.EmailID == Emailitem.Trim()).ToList();
                                        intLoginID = int.Parse(aUser[0].UserID.ToString());
                                        strUserName = aUser[0].LoginID;
                                    }
                                    else
                                    {
                                        intLoginID = int.Parse(aUser[0].UserID.ToString());
                                        strPassword = Common.DecryptString(aUser[0].Password);
                                        strUserName = aUser[0].LoginID;
                                    }
                                }
                            }

                            if ((zStage != "Intro Email") || (zStage == "Intro Email" && ZIntroUser == "Editor"))
                            {
                                foreach (var EDEmailitem in zEditor)
                                {
                                    if (!emails.Contains(EDEmailitem))
                                        emails.Add(EDEmailitem);

                                    var aUser = aDBManager.UserMasters.Where(items => items.EmailID == EDEmailitem.Trim()).ToList();
                                    int intLoginID = 0;
                                    string strUserName = "";
                                    if (aUser.Count == 0)
                                    {
                                        string zPassword = Common.RandomString(6);

                                        UserMaster tblUser = new UserMaster();
                                        tblUser.LoginID = EDEmailitem.Trim();
                                        tblUser.LoginName = EDEmailitem.Trim();
                                        tblUser.ActiveStatus = "Active";
                                        tblUser.Password = Common.EncryptString(zPassword);
                                        strPassword = zPassword;
                                        tblUser.EmailID = EDEmailitem.Trim();
                                        tblUser.UserType = "Editor";
                                        tblUser.UpdatedTime = DateTime.Now;
                                        tblUser.CreatedTime = DateTime.Now;
                                        tblUser.CreatedBy = nUserID.ToString();
                                        tblUser.UpdatedBy = nUserID.ToString();
                                        tblUser.RoleID = 9;
                                        tblUser.DefaultPage = "Home";
                                        aDBManager.UserMasters.Add(tblUser);
                                        aDBManager.SaveChanges();
                                        aUser = aDBManager.UserMasters.Where(items => items.EmailID == EDEmailitem.Trim()).ToList();
                                        intLoginID = int.Parse(aUser[0].UserID.ToString());
                                        strUserName = aUser[0].LoginID;
                                    }
                                    else
                                    {
                                        intLoginID = int.Parse(aUser[0].UserID.ToString());
                                        strPassword = Common.DecryptString(aUser[0].Password);
                                        strUserName = aUser[0].LoginID;
                                    }
                                }
                            }

                            if (zStage != "Intro Email")
                            {
                                TBL_ProofEmail tblEmail = new TBL_ProofEmail();
                                tblEmail.FromEmail = zPMEmail;
                                tblEmail.ToEmail = zstrSplit[4].Trim();
                                if ((zstrSplit[6] == "true") && (zstrSplit[7] == "true"))
                                {
                                    tblEmail.CCEmail = strContributeEditor + ";" + zPMEmail; //zPEEmail + ";" +
                                }
                                if ((zstrSplit[6] == "false") && (zstrSplit[7] == "true"))
                                {
                                    tblEmail.CCEmail = strContributeEditor + ";" + zPMEmail;
                                }
                                if ((zstrSplit[6] == "true") && (zstrSplit[7] == "false"))
                                {
                                    tblEmail.CCEmail = zPMEmail; //zPEEmail + ";" +
                                }
                                if ((zstrSplit[6] == "false") && (zstrSplit[7] == "false"))
                                {
                                    tblEmail.CCEmail = zPMEmail;
                                }

                                tblEmail.BCCEmail = zTSPMEmail;
                                if (zStage == "First Page")
                                {
                                    tblEmail.MailSubject = zCatalog + " (1st pages - " + zstrSplit[1].ToString() + " - author) " + zBookTitle;
                                }
                                else if (zStage == "CE Review")
                                {
                                    tblEmail.MailSubject = zCatalog + " (Copyedited manuscript - " + zstrSplit[1].ToString() + " - author) " + zBookTitle;
                                }
                                else if (zStage == "Intro Email")
                                {
                                    tblEmail.MailSubject = zCatalog + ": " + zBookTitle + " – Authors Intro email";
                                }
                                string strUserName = "";

                                double intWeeks = Math.Round(((Convert.ToDateTime(zstrSplit[5]) - Convert.ToDateTime(DateTime.Today)).TotalDays / 7));
                                if (intWeeks == 0)
                                {
                                    intWeeks = 1;
                                }

                                if ((zstrSplit[3].Trim().Trim(';').IndexOf(';') > 0) || (zstrSplit[3].Trim().Trim(';').IndexOf(',') > 0) || (zstrSplit[3].Trim().Trim(';').IndexOf(" and ") > 0))
                                {
                                    tblEmail.MailBody = zAUMailBody.Replace("{book author/authors}", zAuthorName).Replace("{DueDate}", zstrSplit[5]).Replace("{Catalog}", zCatalog).Replace("{BookTitle}", zBookTitle).Replace("{ChapterTitle}", zstrSplit[2].ToString().Replace("|", ",")).Replace("{PM email ID}", zPMEmail).Replace("{project manager signature}", zPMName).Replace("{Week}", intWeeks.ToString()).Replace("{User}", "Author").Replace("{BookTitle}", zBookTitle).Replace("{UserName}", strUserName).Replace("{Password}", strPassword).Replace("{PMName}", zPMName).Replace("{ChapterNo}", zstrSplit[1]).Replace("ChapterNo", zstrSplit[1]).Replace("{AuthorName}", zstrSplit[3].Trim()).Replace("{Salutation}", "Drs. ");
                                }
                                else
                                {
                                    tblEmail.MailBody = zAUMailBody.Replace("{book author/authors}", zAuthorName).Replace("{DueDate}", zstrSplit[5]).Replace("{Catalog}", zCatalog).Replace("{BookTitle}", zBookTitle).Replace("{ChapterTitle}", zstrSplit[2].ToString().Replace("|", ",")).Replace("{PM email ID}", zPMEmail).Replace("{project manager signature}", zPMName).Replace("{Week}", intWeeks.ToString()).Replace("{User}", "Author").Replace("{BookTitle}", zBookTitle).Replace("{UserName}", strUserName).Replace("{Password}", strPassword).Replace("{PMName}", zPMName).Replace("{ChapterNo}", zstrSplit[1]).Replace("ChapterNo", zstrSplit[1]).Replace("{AuthorName}", zstrSplit[3].Trim()).Replace("{Salutation}", "Drs. ");
                                }

                                tblEmail.BookID = int.Parse(zBookID);
                                aDBManager.TBL_ProofEmail.Add(tblEmail);
                                aDBManager.SaveChanges();
                            }
                        }

                        foreach (var item in emails)
                        {
                            editorEmailIDs = editorEmailIDs.Append(item + ';');
                        }

                        #region ProofDistribution Author
                        TBL_ProofDistribution tblProofAU = new TBL_ProofDistribution();
                        tblProofAU.BookID = int.Parse(zBookID);
                        tblProofAU.ChapterID = "ALL";
                        tblProofAU.UploadType = zUploadType;
                        if (pos > -1)
                        {
                            tblProofAU.UserType = "AuthorEditor";
                        }
                        else
                        {
                            tblProofAU.UserType = "Author";
                        }
                        tblProofAU.EmailID = Convert.ToString(authorEmailIDs).Trim();
                        tblProofAU.Stage = zStage;
                        if (zStage != "Intro Email")
                        {
                            tblProofAU.DueDate = Convert.ToDateTime(zAuthorDueDt);//Convert.ToDateTime(zstrSplit[5]);

                            string zZipFileName = string.Format("{0}_{1}_Allocate_{2}", zBookTitle, nUserID, DateTime.Now.ToString("HHmmss"));

                            string ztempPath = string.Format("{0}_{1}", zBookTitle, nUserID);
                            zZipPath = Server.MapPath(string.Format("~/Source/OutSource/{0}", zCatalog + "_" + zUploadType + "_" + zStage));
                            zZipFolderL = Server.MapPath(string.Format("~/Source/OutSource/temp/{0}/", ztempPath));
                            aFileName = string.Format("{0}.zip", zZipFileName);

                            tblProofAU.DueDate = Convert.ToDateTime(zAuthorDueDt);
                            tblProofAU.UploadFileName = aFileName;
                            tblProofAU.FileUploadDate = DateTime.Now;
                            tblProofAU.Status = "Uploaded";
                        }
                        tblProofAU.InsertDate = DateTime.Now;
                        tblProofAU.PEinCC = Convert.ToByte(zPEinCC == "true" ? 1 : 0);//Convert.ToByte(zstrSplit[6] == "true" ? 1 : 0);
                        tblProofAU.EDinCC = 0; //Convert.ToByte(zstrSplit[7] == "true" ? 1 : 0);
                        tblProofAU.CorrectionToED = Convert.ToByte(zAllED == "true" ? 1 : 0);
                        if (zStage == "Intro Email")
                        {
                            tblProofAU.IsReminder1 = Convert.ToByte(zEDReminder == "true" ? 1 : 0);
                        }
                        else
                        {
                            tblProofAU.IsReminder1 = Convert.ToByte(zEDReminder == "true" ? 1 : 0);
                            tblProofAU.IsReminder2 = Convert.ToByte(zEDReminder == "true" ? 1 : 0);
                            tblProofAU.IsReminder3 = Convert.ToByte(zEDReminder == "true" ? 1 : 0);
                        }
                        //tblProof.IsReminder = Convert.ToByte(zstrSplit[9] == "true" ? 1 : 0);
                        tblProofAU.SeriesFlow = Convert.ToByte(zSeries == "true" ? 1 : 0);
                        tblProofAU.AllEDCorrection = Convert.ToByte(zAllED == "true" ? 1 : 0);
                        tblProofAU.LoginID = 0;//intLoginID;

                        aDBManager.TBL_ProofDistribution.Add(tblProofAU);
                        if (aDBManager.SaveChanges() > 0)
                            proofId = tblProofAU.ID;
                        #endregion

                        #region ProofDistribution Editor
                        TBL_ProofDistribution tblProofED = new TBL_ProofDistribution();
                        tblProofED.BookID = int.Parse(zBookID);
                        tblProofED.ChapterID = "ALL";
                        tblProofED.UploadType = zUploadType;
                        tblProofED.UserType = "Editor";
                        tblProofED.EmailID = Convert.ToString(editorEmailIDs).Trim();
                        tblProofED.Stage = zStage;
                        if (zStage != "Intro Email")
                        {
                            tblProofED.DueDate = Convert.ToDateTime(zEditorDueDt);

                            string zZipFileName = string.Format("{0}_{1}_Allocate_{2}", zBookTitle, nUserID, DateTime.Now.ToString("HHmmss"));

                            string ztempPath = string.Format("{0}_{1}", zBookTitle, nUserID);
                            zZipPath = Server.MapPath(string.Format("~/Source/OutSource/{0}", zCatalog + "_" + zUploadType + "_" + zStage));
                            zZipFolderL = Server.MapPath(string.Format("~/Source/OutSource/temp/{0}/", ztempPath));
                            aFileName = string.Format("{0}.zip", zZipFileName);

                            tblProofED.DueDate = Convert.ToDateTime(zAuthorDueDt);
                            tblProofED.UploadFileName = aFileName;
                            tblProofED.FileUploadDate = DateTime.Now;
                            tblProofED.Status = "Uploaded";
                        }

                        tblProofED.InsertDate = DateTime.Now;
                        tblProofED.PEinCC = Convert.ToByte(zPEinCC == "true" ? 1 : 0);
                        tblProofED.EDinCC = 0;// Convert.ToByte(zstrSplit[7] == "true" ? 1 : 0);
                        tblProofED.CorrectionToED = Convert.ToByte(zAllED == "true" ? 1 : 0);
                        if (zStage == "Intro Email")
                        {
                            tblProofED.IsReminder1 = Convert.ToByte(zEDReminder == "true" ? 1 : 0);
                        }
                        else
                        {
                            tblProofED.IsReminder1 = Convert.ToByte(zEDReminder == "true" ? 1 : 0);
                            tblProofED.IsReminder2 = Convert.ToByte(zEDReminder == "true" ? 1 : 0);
                            tblProofED.IsReminder3 = Convert.ToByte(zEDReminder == "true" ? 1 : 0);
                        }
                        tblProofED.SeriesFlow = Convert.ToByte(zSeries == "true" ? 1 : 0);
                        tblProofED.AllEDCorrection = Convert.ToByte(zAllED == "true" ? 1 : 0);
                        tblProofED.LoginID = 0;//intLoginID;

                        aDBManager.TBL_ProofDistribution.Add(tblProofED);
                        if (aDBManager.SaveChanges() > 0)
                            proofId = tblProofED.ID;
                        #endregion

                        if (proofId > 0)
                            Common.CreateZIP(zZipFolderL, aFileName, zZipPath);
                    }
                    else
                    {
                        foreach (var item in zProofChapterL)
                        {
                            string[] zstrSplit = item.Split(',');
                            if (zstrSplit[0].ToString() == "true")
                            {
                                string[] zstrEmail = zstrSplit[4].Split(';');
                                string Cha = zstrSplit[1].ToString();
                                var aitemBkList = aDBManager.TBL_SubMaster.Where(chitem => (chitem.MainID.ToString() == zBookID) && (chitem.Number.ToString() == Cha)).ToList();
                                aitemBkList[0].AuthorName = zstrSplit[3];
                                aitemBkList[0].AuthorEmail = zstrSplit[4];
                                aDBManager.SaveChanges();
                                if ((zStage != "Intro Email") || (zStage == "Intro Email" && ZIntroUser == "Author"))
                                {
                                    foreach (var Emailitem in zstrEmail)
                                    {
                                        if (strContributeAuthor.IndexOf(Emailitem.Trim().Trim(';')) == -1)
                                        {
                                            strContributeAuthor = strContributeAuthor + Emailitem.Trim().Trim(';') + ';';
                                        }

                                        int pos = Array.IndexOf(zEditor, Emailitem.Trim());
                                        var aUser = aDBManager.UserMasters.Where(items => items.EmailID == Emailitem.Trim()).ToList();
                                        int intLoginID = 0;
                                        string strUserName = "";
                                        if (aUser.Count == 0)
                                        {
                                            string zPassword = Common.RandomString(6);

                                            UserMaster tblUser = new UserMaster();
                                            tblUser.LoginID = Emailitem.Trim();
                                            tblUser.LoginName = Emailitem.Trim();
                                            tblUser.ActiveStatus = "Active";
                                            tblUser.Password = Common.EncryptString(zPassword);
                                            strPassword = zPassword;
                                            tblUser.EmailID = Emailitem.Trim();
                                            if (pos > -1)
                                            {
                                                tblUser.UserType = "AuthorEditor";
                                            }
                                            else
                                            {
                                                tblUser.UserType = "Author";
                                            }

                                            tblUser.UpdatedTime = DateTime.Now;
                                            tblUser.CreatedTime = DateTime.Now;
                                            tblUser.CreatedBy = nUserID.ToString();
                                            tblUser.UpdatedBy = nUserID.ToString();
                                            tblUser.RoleID = 9;
                                            tblUser.DefaultPage = "Home";
                                            aDBManager.UserMasters.Add(tblUser);
                                            aDBManager.SaveChanges();
                                            aUser = aDBManager.UserMasters.Where(items => items.EmailID == Emailitem.Trim()).ToList();
                                            intLoginID = int.Parse(aUser[0].UserID.ToString());
                                            strUserName = aUser[0].LoginID;
                                        }
                                        else
                                        {
                                            intLoginID = int.Parse(aUser[0].UserID.ToString());
                                            strPassword = Common.DecryptString(aUser[0].Password);
                                            strUserName = aUser[0].LoginID;
                                        }
                                        TBL_ProofDistribution tblProof = new TBL_ProofDistribution();
                                        tblProof.BookID = int.Parse(zBookID);
                                        tblProof.ChapterID = zstrSplit[1].ToString();
                                        tblProof.UploadType = zUploadType;
                                        if (pos > -1)
                                        {
                                            tblProof.UserType = "AuthorEditor";
                                        }
                                        else
                                        {
                                            tblProof.UserType = "Author";
                                        }
                                        tblProof.EmailID = Emailitem.Trim();
                                        tblProof.Stage = zStage;
                                        if (zStage != "Intro Email")
                                        {
                                            tblProof.DueDate = Convert.ToDateTime(zstrSplit[5]);
                                        }
                                        tblProof.InsertDate = DateTime.Now;
                                        tblProof.PEinCC = Convert.ToByte(zstrSplit[6] == "true" ? 1 : 0);
                                        tblProof.EDinCC = Convert.ToByte(zstrSplit[7] == "true" ? 1 : 0);
                                        tblProof.CorrectionToED = Convert.ToByte(zstrSplit[8] == "true" ? 1 : 0);
                                        if (zStage == "Intro Email")
                                        {
                                            tblProof.IsReminder1 = Convert.ToByte(zstrSplit[9] == "true" ? 1 : 0);
                                        }
                                        else
                                        {
                                            tblProof.IsReminder1 = Convert.ToByte(zstrSplit[9] == "true" ? 1 : 0);
                                            tblProof.IsReminder2 = Convert.ToByte(zstrSplit[9] == "true" ? 1 : 0);
                                            tblProof.IsReminder3 = Convert.ToByte(zstrSplit[9] == "true" ? 1 : 0);
                                        }
                                        //tblProof.IsReminder = Convert.ToByte(zstrSplit[9] == "true" ? 1 : 0);
                                        tblProof.SeriesFlow = Convert.ToByte(zSeries == "true" ? 1 : 0);
                                        tblProof.AllEDCorrection = Convert.ToByte(zAllED == "true" ? 1 : 0);
                                        tblProof.LoginID = intLoginID;
                                        aDBManager.TBL_ProofDistribution.Add(tblProof);
                                        aDBManager.SaveChanges();
                                    }
                                }

                                if ((zStage != "Intro Email") || (zStage == "Intro Email" && ZIntroUser == "Editor"))
                                {
                                    foreach (var EDEmailitem in zEditor)
                                    {
                                        var aUser = aDBManager.UserMasters.Where(items => items.EmailID == EDEmailitem.Trim()).ToList();
                                        int intLoginID = 0;
                                        string strUserName = "";
                                        if (aUser.Count == 0)
                                        {
                                            string zPassword = Common.RandomString(6);

                                            UserMaster tblUser = new UserMaster();
                                            tblUser.LoginID = EDEmailitem.Trim();
                                            tblUser.LoginName = EDEmailitem.Trim();
                                            tblUser.ActiveStatus = "Active";
                                            tblUser.Password = Common.EncryptString(zPassword);
                                            strPassword = zPassword;
                                            tblUser.EmailID = EDEmailitem.Trim();
                                            tblUser.UserType = "Editor";
                                            tblUser.UpdatedTime = DateTime.Now;
                                            tblUser.CreatedTime = DateTime.Now;
                                            tblUser.CreatedBy = nUserID.ToString();
                                            tblUser.UpdatedBy = nUserID.ToString();
                                            tblUser.RoleID = 9;
                                            tblUser.DefaultPage = "Home";
                                            aDBManager.UserMasters.Add(tblUser);
                                            aDBManager.SaveChanges();
                                            aUser = aDBManager.UserMasters.Where(items => items.EmailID == EDEmailitem.Trim()).ToList();
                                            intLoginID = int.Parse(aUser[0].UserID.ToString());
                                            strUserName = aUser[0].LoginID;
                                        }
                                        else
                                        {
                                            intLoginID = int.Parse(aUser[0].UserID.ToString());
                                            strPassword = Common.DecryptString(aUser[0].Password);
                                            strUserName = aUser[0].LoginID;
                                        }
                                        TBL_ProofDistribution tblProof = new TBL_ProofDistribution();
                                        tblProof.BookID = int.Parse(zBookID);
                                        tblProof.ChapterID = zstrSplit[1].ToString();
                                        tblProof.UploadType = zUploadType;
                                        tblProof.UserType = "Editor";
                                        tblProof.EmailID = EDEmailitem;
                                        tblProof.Stage = zStage;
                                        if (zStage != "Intro Email")
                                        {
                                            tblProof.DueDate = Convert.ToDateTime(zEditorDueDt);
                                        }

                                        tblProof.InsertDate = DateTime.Now;
                                        tblProof.PEinCC = Convert.ToByte(zstrSplit[6] == "true" ? 1 : 0);
                                        tblProof.EDinCC = Convert.ToByte(zstrSplit[7] == "true" ? 1 : 0);
                                        tblProof.CorrectionToED = Convert.ToByte(zstrSplit[8] == "true" ? 1 : 0);
                                        if (zStage == "Intro Email")
                                        {
                                            tblProof.IsReminder1 = Convert.ToByte(zEDReminder == "true" ? 1 : 0);
                                        }
                                        else
                                        {
                                            tblProof.IsReminder1 = Convert.ToByte(zEDReminder == "true" ? 1 : 0);
                                            tblProof.IsReminder2 = Convert.ToByte(zEDReminder == "true" ? 1 : 0);
                                            tblProof.IsReminder3 = Convert.ToByte(zEDReminder == "true" ? 1 : 0);
                                        }
                                        tblProof.SeriesFlow = Convert.ToByte(zSeries == "true" ? 1 : 0);
                                        tblProof.AllEDCorrection = Convert.ToByte(zAllED == "true" ? 1 : 0);
                                        tblProof.LoginID = intLoginID;
                                        aDBManager.TBL_ProofDistribution.Add(tblProof);
                                        aDBManager.SaveChanges();
                                    }
                                }

                                if (zStage != "Intro Email")
                                {
                                    TBL_ProofEmail tblEmail = new TBL_ProofEmail();
                                    tblEmail.FromEmail = zPMEmail;
                                    tblEmail.ToEmail = zstrSplit[4].Trim();
                                    if ((zstrSplit[6] == "true") && (zstrSplit[7] == "true"))
                                    {
                                        tblEmail.CCEmail = strContributeEditor + ";" + zPMEmail; //zPEEmail + ";" +
                                    }
                                    if ((zstrSplit[6] == "false") && (zstrSplit[7] == "true"))
                                    {
                                        tblEmail.CCEmail = strContributeEditor + ";" + zPMEmail;
                                    }
                                    if ((zstrSplit[6] == "true") && (zstrSplit[7] == "false"))
                                    {
                                        tblEmail.CCEmail = zPMEmail; //zPEEmail + ";" +
                                    }
                                    if ((zstrSplit[6] == "false") && (zstrSplit[7] == "false"))
                                    {
                                        tblEmail.CCEmail = zPMEmail;
                                    }

                                    tblEmail.BCCEmail = zTSPMEmail;
                                    if (zStage == "First Page")
                                    {
                                        tblEmail.MailSubject = zCatalog + " (1st pages - " + zstrSplit[1].ToString() + " - author) " + zBookTitle;
                                    }
                                    else if (zStage == "CE Review")
                                    {
                                        tblEmail.MailSubject = zCatalog + " (Copyedited manuscript - " + zstrSplit[1].ToString() + " - author) " + zBookTitle;
                                    }
                                    else if (zStage == "Intro Email")
                                    {
                                        tblEmail.MailSubject = zCatalog + ": " + zBookTitle + " – Authors Intro email";
                                    }
                                    string strUserName = "";

                                    double intWeeks = Math.Round(((Convert.ToDateTime(zstrSplit[5]) - Convert.ToDateTime(DateTime.Today)).TotalDays / 7));
                                    if (intWeeks == 0)
                                    {
                                        intWeeks = 1;
                                    }

                                    if ((zstrSplit[3].Trim().Trim(';').IndexOf(';') > 0) || (zstrSplit[3].Trim().Trim(';').IndexOf(',') > 0) || (zstrSplit[3].Trim().Trim(';').IndexOf(" and ") > 0))
                                    {
                                        tblEmail.MailBody = zAUMailBody.Replace("{book author/authors}", zAuthorName).Replace("{DueDate}", zstrSplit[5]).Replace("{Catalog}", zCatalog).Replace("{BookTitle}", zBookTitle).Replace("{ChapterTitle}", zstrSplit[2].ToString().Replace("|", ",")).Replace("{PM email ID}", zPMEmail).Replace("{project manager signature}", zPMName).Replace("{Week}", intWeeks.ToString()).Replace("{User}", "Author").Replace("{BookTitle}", zBookTitle).Replace("{UserName}", strUserName).Replace("{Password}", strPassword).Replace("{PMName}", zPMName).Replace("{ChapterNo}", zstrSplit[1]).Replace("ChapterNo", zstrSplit[1]).Replace("{AuthorName}", zstrSplit[3].Trim()).Replace("{Salutation}", "Drs. ");
                                    }
                                    else
                                    {
                                        tblEmail.MailBody = zAUMailBody.Replace("{book author/authors}", zAuthorName).Replace("{DueDate}", zstrSplit[5]).Replace("{Catalog}", zCatalog).Replace("{BookTitle}", zBookTitle).Replace("{ChapterTitle}", zstrSplit[2].ToString().Replace("|", ",")).Replace("{PM email ID}", zPMEmail).Replace("{project manager signature}", zPMName).Replace("{Week}", intWeeks.ToString()).Replace("{User}", "Author").Replace("{BookTitle}", zBookTitle).Replace("{UserName}", strUserName).Replace("{Password}", strPassword).Replace("{PMName}", zPMName).Replace("{ChapterNo}", zstrSplit[1]).Replace("ChapterNo", zstrSplit[1]).Replace("{AuthorName}", zstrSplit[3].Trim()).Replace("{Salutation}", "Drs. ");
                                    }

                                    tblEmail.BookID = int.Parse(zBookID);
                                    aDBManager.TBL_ProofEmail.Add(tblEmail);
                                    aDBManager.SaveChanges();
                                }
                            }
                        }
                    }

                    if (zStage != "Intro Email")
                    {
                        TBL_ProofEmail tblEmail = new TBL_ProofEmail();
                        tblEmail.FromEmail = zPMEmail;
                        tblEmail.ToEmail = strContributeEditor.ToString();

                        tblEmail.CCEmail = zPMEmail;//zPEEmail + ";" + zPMEmail;

                        tblEmail.BCCEmail = zTSPMEmail;
                        if (zStage == "First Page")
                        {
                            tblEmail.MailSubject = zCatalog + " (1st pages - editor) " + zBookTitle;
                        }
                        else if (zStage == "CE Review")
                        {
                            tblEmail.MailSubject = zCatalog + " (Copyedited manuscript - editor) " + zBookTitle;
                        }
                        else if (zStage == "Intro Email")
                        {
                            tblEmail.MailSubject = zCatalog + ": " + zBookTitle + " – Intro email";
                        }

                        double intWeeks = Math.Round(((Convert.ToDateTime(zEditorDueDt) - Convert.ToDateTime(DateTime.Today)).TotalDays / 7));

                        if ((zEditorName.Trim(';').IndexOf(';') > 0) || (zEditorName.Trim(';').IndexOf(',') > 0) || (zEditorName.Trim(';').IndexOf(" and ") > 0))
                        {
                            tblEmail.MailBody = zEDMailBody.Replace("{book author/authors}", zAuthorName).Replace("{DueDate}", zEditorDueDt).Replace("{Catalog}", zCatalog).Replace("{BookTitle}", zBookTitle).Replace("{PM email ID}", zPMEmail).Replace("{project manager signature}", zPMName).Replace("{Week}", intWeeks.ToString()).Replace("{User}", "Author").Replace("{BookTitle}", zBookTitle).Replace("{Password}", strPassword).Replace("{PMName}", zPMName).Replace("{EditorName}", zEditorName).Replace("{Salutation}", "Drs. ");
                        }
                        else
                        {
                            tblEmail.MailBody = zEDMailBody.Replace("{book author/authors}", zAuthorName).Replace("{DueDate}", zEditorDueDt).Replace("{Catalog}", zCatalog).Replace("{BookTitle}", zBookTitle).Replace("{PM email ID}", zPMEmail).Replace("{project manager signature}", zPMName).Replace("{Week}", intWeeks.ToString()).Replace("{User}", "Author").Replace("{BookTitle}", zBookTitle).Replace("{Password}", strPassword).Replace("{PMName}", zPMName).Replace("{EditorName}", zEditorName).Replace("{Salutation}", "Drs. ");
                        }

                        tblEmail.BookID = int.Parse(zBookID);
                        aDBManager.TBL_ProofEmail.Add(tblEmail);
                        aDBManager.SaveChanges();
                    }

                    if (zStage == "Intro Email")
                    {
                        if (ZIntroUser == "Author")
                        {
                            TBL_ProofEmail tblEmail = new TBL_ProofEmail();
                            tblEmail.FromEmail = zPMEmail;
                            tblEmail.ToEmail = strContributeAuthor.Trim();

                            tblEmail.CCEmail = zPMEmail;//zPEEmail + ";" + zPMEmail;

                            tblEmail.BCCEmail = zTSPMEmail;

                            tblEmail.MailSubject = zCatalog + ": " + zBookTitle + " – Introduction email";

                            tblEmail.MailBody = zAUMailBody
                                .Replace("{Author}", "")
                                .Replace("{Catalog}", zCatalog)
                                .Replace("{PM email ID}", zPMEmail)
                                .Replace("{project manager signature}", zPMName)
                                .Replace("{BookTitle}", zBookTitle)
                                .Replace("{PMName}", zPMName)
                                .Replace("{CEReviewDueDt}", zCEReviewDueDt)
                                .Replace("{CEReviewReturnDt}", zCEReviewReturnDt)
                                .Replace("{FirstPageDueDt}", zFirstPageDueDt)
                                .Replace("{FirstPageReturnDt}", zFirstPageReturnDt)

                                .Replace("{PRReviewDueDt}", BKPPDateList[0].PPAUDueDate.ToString())
                                .Replace("{PRReviewReturnDt}", BKPPDateList[0].FRAUDueDate.ToString())
                                .Replace("{VoPageDueDt}", BKPPDateList[0].VOUDueDate.ToString())
                                .Replace("{VoPageReturnDt}", BKPPDateList[0].FVOUDueDate.ToString());

                            tblEmail.BookID = int.Parse(zBookID);
                            aDBManager.TBL_ProofEmail.Add(tblEmail);
                            aDBManager.SaveChanges();

                            string[] zstrEmail = strContributeAuthor.Split(';');
                            foreach (var Emailitem in zstrEmail)
                            {
                                if (Emailitem.Trim() != "")
                                {
                                    TBL_ProofEmail tblWelcomEmail = new TBL_ProofEmail();
                                    tblWelcomEmail.FromEmail = zPMEmail;
                                    tblWelcomEmail.ToEmail = Emailitem.Trim();

                                    tblWelcomEmail.BCCEmail = zPMEmail + ";" + zTSPMEmail;

                                    tblWelcomEmail.MailSubject = "Welcome to Sesame - " + zCatalog;

                                    string strUserName = "";
                                    var aUser = aDBManager.UserMasters.Where(items => items.EmailID == Emailitem.Trim()).ToList();
                                    strPassword = Common.DecryptString(aUser[0].Password);
                                    strUserName = aUser[0].LoginID;

                                    tblWelcomEmail.MailBody = zWelcomeMailBody.Replace("{book author/authors}", zAuthorName).Replace("{Due date}", zAuthorDueDt).Replace("{PM email ID}", zPMEmail).Replace("{project manager signature}", zPMName).Replace("{User}", "Author").Replace("{BookTitle}", zBookTitle).Replace("{UserName}", strUserName).Replace("{Password}", strPassword).Replace("{PMName}", zPMName);

                                    tblWelcomEmail.BookID = int.Parse(zBookID);
                                    aDBManager.TBL_ProofEmail.Add(tblWelcomEmail);
                                    aDBManager.SaveChanges();
                                }

                            }
                        }
                        else
                        {
                            TBL_ProofEmail tblEmail = new TBL_ProofEmail();
                            tblEmail.FromEmail = zPMEmail;
                            tblEmail.ToEmail = strContributeEditor.ToString().Trim();

                            tblEmail.CCEmail = zPMEmail;//zPEEmail + ";" + zPMEmail;

                            tblEmail.BCCEmail = zTSPMEmail;

                            tblEmail.MailSubject = zCatalog + ": " + zBookTitle + " – Introduction email";

                            if ((zEditorName.Trim(';').IndexOf(';') > 0) || (zEditorName.Trim(';').IndexOf(',') > 0) || (zEditorName.Trim(';').IndexOf(" and ") > 0))
                            {
                                tblEmail.MailBody = zEDMailBody.Replace("{Author}", "")
                                    .Replace("{Catalog}", zCatalog)
                                    .Replace("{Due date}", zAuthorDueDt)
                                    .Replace("{PM email ID}", zPMEmail)
                                    .Replace("{project manager signature}", zPMName)
                                    .Replace("{User}", "Author")
                                    .Replace("{BookTitle}", zBookTitle)
                                    .Replace("{PMName}", zPMName)
                                    .Replace("{CEReviewDueDt}", zCEReviewDueDt)
                                    .Replace("{CEReviewReturnDt}", zCEReviewReturnDt)
                                    .Replace("{FirstPageDueDt}", zFirstPageDueDt)
                                    .Replace("{FirstPageReturnDt}", zFirstPageReturnDt)
                                    .Replace("{EditorName}", zEditorName)
                                    .Replace("{Salutation}", "Drs. ")

                                   .Replace("{PRReviewDueDt}", BKPPDateList[0].PPAUDueDate.ToString())
                                   .Replace("{PRReviewReturnDt}", BKPPDateList[0].FRAUDueDate.ToString())
                                   .Replace("{VoPageDueDt}", BKPPDateList[0].VOUDueDate.ToString())
                                   .Replace("{VoPageReturnDt}", BKPPDateList[0].FVOUDueDate.ToString());
                            }
                            else
                            {
                                tblEmail.MailBody = zEDMailBody.Replace("{Author}", "")
                                    .Replace("{Catalog}", zCatalog)
                                    .Replace("{Due date}", zAuthorDueDt)
                                    .Replace("{PM email ID}", zPMEmail)
                                    .Replace("{project manager signature}", zPMName)
                                    .Replace("{User}", "Author")
                                    .Replace("{BookTitle}", zBookTitle)
                                    .Replace("{PMName}", zPMName)
                                    .Replace("{CEReviewDueDt}", zCEReviewDueDt)
                                    .Replace("{CEReviewReturnDt}", zCEReviewReturnDt)
                                    .Replace("{FirstPageDueDt}", zFirstPageDueDt)
                                    .Replace("{FirstPageReturnDt}", zFirstPageReturnDt)
                                    .Replace("{EditorName}", zEditorName)
                                    .Replace("{Salutation}", "Drs. ")

                                    .Replace("{PRReviewDueDt}", BKPPDateList[0].PPAUDueDate.ToString())
                                    .Replace("{PRReviewReturnDt}", BKPPDateList[0].FRAUDueDate.ToString())
                                    .Replace("{VoPageDueDt}", BKPPDateList[0].VOUDueDate.ToString())
                                    .Replace("{VoPageReturnDt}", BKPPDateList[0].FVOUDueDate.ToString());
                                ;
                            }


                            tblEmail.BookID = int.Parse(zBookID);
                            aDBManager.TBL_ProofEmail.Add(tblEmail);
                            aDBManager.SaveChanges();

                            string[] zstrEmail = strContributeEditor.Split(';');
                            foreach (var Emailitem in zEditor)
                            {
                                if (Emailitem.Trim() != "")
                                {
                                    TBL_ProofEmail tblWelcomEmail = new TBL_ProofEmail();
                                    tblWelcomEmail.FromEmail = zPMEmail;
                                    tblWelcomEmail.ToEmail = Emailitem.Trim();

                                    tblWelcomEmail.BCCEmail = zPMEmail + ";" + zTSPMEmail;

                                    tblWelcomEmail.MailSubject = "Welcome to Sesame - " + zCatalog;

                                    string strUserName = "";
                                    var aUser = aDBManager.UserMasters.Where(items => items.EmailID == Emailitem.Trim()).ToList();
                                    strPassword = Common.DecryptString(aUser[0].Password);
                                    strUserName = aUser[0].LoginID;

                                    tblWelcomEmail.MailBody = zWelcomeMailBody.Replace("{book author/authors}", zAuthorName).Replace("{Due date}", zAuthorDueDt).Replace("{PM email ID}", zPMEmail).Replace("{project manager signature}", zPMName).Replace("{User}", "Author").Replace("{BookTitle}", zBookTitle).Replace("{UserName}", strUserName).Replace("{Password}", strPassword).Replace("{PMName}", zPMName);

                                    tblWelcomEmail.BookID = int.Parse(zBookID);
                                    aDBManager.TBL_ProofEmail.Add(tblWelcomEmail);
                                    aDBManager.SaveChanges();
                                }

                            }
                        }
                    }
                }

                //var aitemList = aDBManager.TBL_ProofDistribution.Where(item => item.BookID.ToString() == zBookID && item.Status == null && item.FileUploadDate == null).ToList();
                var aitemList = aDBManager.TBL_ProofDistribution.Where(item => item.BookID.ToString() == zBookID && item.Stage == zStage && item.UploadType == zUploadType).ToList();

                if (zStage == "Intro Email")
                {
                    aitemList.ForEach(item => item.FileUploadDate = DateTime.Now);
                    aDBManager.SaveChanges();
                    aitemList.ForEach(item => item.UploadFileName = "IntroEmail");
                    aDBManager.SaveChanges();
                    aitemList.ForEach(item => item.Status = "Uploaded");
                    aDBManager.SaveChanges();
                }
                else
                {
                    if (!isBookWise)
                    {
                        aitemList.ForEach(item => item.Status = "Started");
                        aDBManager.SaveChanges();
                    }
                }

                var result = new { msg = "Proof details updated Successfully!", Id = proofId };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                var result = new { msg = "Error: " + ex.Message };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult AddToCESkiptable(TBL_ProofDistribution_History aitemInfoP)
        {
            try
            {

                string aID = "";

                if (aitemInfoP.ID != 0)
                {
                    var aitemList = aDBManager.TBL_ProofDistribution_History.Single(item => item.MainID == aitemInfoP.MainID);
                    aitemList.MainID = aitemInfoP.MainID;
                    aitemList.Stage = aitemInfoP.Stage;
                    aitemList.SkipCE = aitemInfoP.SkipCE;
                    aitemList.CreatedBy = int.Parse(Session["LoginID"].ToString());
                    aitemList.CreatedTime = DateTime.Now;
                    aDBManager.SaveChanges();
                    aID = aitemList.ID.ToString();

                }
                else
                {
                    aitemInfoP.CreatedBy = int.Parse(Session["LoginID"].ToString());
                    aitemInfoP.CreatedTime = DateTime.Now;
                    aitemInfoP.EntryDate = DateTime.Now;
                    aDBManager.TBL_ProofDistribution_History.Add(aitemInfoP);
                    aDBManager.SaveChanges();
                    aID = aitemInfoP.ID.ToString();
                }



                return Json(aID);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }
        }

        #region Proof Tracking
        [HttpPost]
        public ActionResult PopulateProofTracking(int zBookID, string Stage, string UType)
        {
            //var aitemList = aDBManager.TBL_ProofDistribution.Where(i => i.BookID.ToString() == zBookID).ToList();
            var aitemList = aDBManager.SP_GetProofTrackingData(zBookID, Stage, UType).ToList();

            var aBookDetails = aDBManager.SP_GetBookDetails(zBookID).ToList();

            return Json(new { aitemList, aBookDetails }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult UpdateProoftracking(string[] AccessList)
        {
            try
            {
                int nUserID = int.Parse(Session["LoginID"].ToString());
                string zID = "";

                foreach (var item in AccessList)
                {
                    string[] zstrSplit = item.Split(',');
                    zID = zstrSplit[0].ToString();

                    string Caveat1 = zstrSplit[1].ToString();
                    string Caveat2 = zstrSplit[2].ToString();
                    string Caveat3 = zstrSplit[3].ToString();

                    var aitemList = aDBManager.TBL_ProofDistribution.SingleOrDefault(i => i.ID.ToString() == zID);

                    aitemList.DueDate = (zstrSplit[4] != "" ? Convert.ToDateTime(zstrSplit[4]) : (DateTime?)null);

                    aitemList.CorrectionReceiveDt = (zstrSplit[5] != "" ? Convert.ToDateTime(zstrSplit[5]) : aitemList.CorrectionReceiveDt);
                    aitemList.AcceptDate = (zstrSplit[5] != "" ? Convert.ToDateTime(zstrSplit[5]) : aitemList.AcceptDate);

                    if (zstrSplit[5] != "")
                    {
                        var aUserList = aDBManager.UserMasters.SingleOrDefault(i => i.UserID == nUserID);
                        string zCorrFileL = string.Format("Manual Closing - {0} ({1})", aUserList.LoginName, nUserID);
                        aitemList.CorrectionFileName = (aitemList.CorrectionFileName == null ? zCorrFileL : aitemList.CorrectionFileName);
                        aitemList.Booked = ((aitemList.Booked == null || aitemList.Booked == 0) ? 1 : aitemList.Booked);
                    }

                    aitemList.IsReminder1 = (Caveat1 == "true" ? (byte)1 : (byte)0);
                    aitemList.IsReminder2 = (Caveat2 == "true" ? (byte)1 : (byte)0);
                    aitemList.IsReminder3 = (Caveat3 == "true" ? (byte)1 : (byte)0);

                    aDBManager.SaveChanges();

                }


                return Json(" Proof Tracking Details Updated Successfully!");
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }


        }

        [HttpPost]
        public ActionResult ApproveS3(int BookID, string zTypeP)
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());

            var aitemList = aDBManager.TBL_MainMaster.SingleOrDefault(i => i.ID == BookID);
            if (aitemList != null)
            {
                var aPubList = aDBManager.Publishers.SingleOrDefault(item => item.Publ_ID == aitemList.PublisherID);
                var aPMList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == aitemList.PMName);
                var aTSPMList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == aitemList.TSPM);

                if (zTypeP == "First Page to PE")
                {
                    if (aitemList.ISBN == null || aitemList.ISBN == "")
                        return Json("Error ISBN Not Found !...");
                    else if (aitemList.EbookISBN == null || aitemList.EbookISBN == "")
                        return Json("Error Ebook ISBN Not Found !...");

                }
                else
                {
                    if (aitemList.ISBN == null || aitemList.ISBN == "")
                        return Json("Error ISBN Not Found !...");
                }

                aDBManager.TBL_Signaldetails.Add(new TBL_Signaldetails()
                {
                    Description = string.Format("{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}|{8}",
                                                aitemList.Number,
                                                aPubList.Publ_Acronym,
                                                aitemList.ISBN,
                                                aitemList.EbookISBN,
                                                aPMList.LoginName,
                                                aPMList.EmailID,
                                                aTSPMList.LoginName,
                                                aTSPMList.EmailID,
                                                zTypeP),
                    Response = "BookNo|Publisher|ISBN|EBookISBN|PMName|PMEmail|TSPMName|TSPMEmail|" + zTypeP,
                    Type = "S3Upload",
                    IsSynch = 0,
                    BookNo = aitemList.Number,
                    UpdatedBy = nUserID,
                    UpdatedTime = DateTime.Now,
                });
                aDBManager.SaveChanges();
                return Json("Approve Details Updated Successfuly..");
            }
            else
            {
                return Json("Error: Invalid Book Info !");
            }
        }
        #endregion

        #region Author/Editor View
        [HttpPost]
        public ActionResult GetBookChapterList(int BookID, string zStage)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());

            var zBookChapterList = aDBManager.SP_GetBookChapterList_AU_ED_FileView(BookID, zStage, nLoginID);

            return Json(new { zBookChapterList }, JsonRequestBehavior.AllowGet);
        }
        #endregion

        #region Upload Files
        [HttpPost]
        public ActionResult UploadFolder()
        {
            try
            {
                string zBook = Request.Form.GetValues("Book")[0];
                int nLoginID = int.Parse(Session["LoginID"].ToString());
                string zFolderName = string.Format("{0}_{1}", zBook, nLoginID);

                // Checking no of files injected in Request object  
                if (Request.Files.Count > 0)
                {
                    try
                    {
                        //  Get all files from Request object  
                        HttpFileCollectionBase files = Request.Files;
                        for (int i = 0; i < files.Count; i++)
                        {
                            HttpPostedFileBase file = files[i];
                            string fname;

                            // Checking for Internet Explorer  
                            if (Request.Browser.Browser.ToUpper() == "IE" || Request.Browser.Browser.ToUpper() == "INTERNETEXPLORER")
                            {
                                string[] testfiles = file.FileName.Split(new char[] { '\\' });
                                fname = testfiles[testfiles.Length - 1];
                            }
                            else
                            {
                                fname = file.FileName;
                            }

                            // Get the complete folder path and store the file inside it.  
                            string zPath = Server.MapPath(string.Format("~/Source/OutSource/temp/{0}", zFolderName));
                            if (!Directory.Exists(zPath))
                            {
                                Directory.CreateDirectory(zPath);
                            }
                            fname = Path.Combine(zPath, fname);
                            file.SaveAs(fname);
                        }
                    }
                    catch (Exception ex)
                    {
                        return Json("Error occurred. Error details: " + ex.Message);
                    }
                }
                return Json("File Added!");
            }
            catch (Exception ex)
            {
                return Json("Error : " + ex.Message);
            }
        }

        [HttpPost]
        public ActionResult DeleteTempFolder(string zBook)
        {
            try
            {
                int nLoginID = int.Parse(Session["LoginID"].ToString());

                string zFolderName = string.Format("{0}_{1}", zBook, nLoginID);
                string zZipFolderL = Server.MapPath(string.Format("~/Source/OutSource/temp/{0}/", zFolderName));
                Common.DeleteDirectory(zZipFolderL);
                return Json("Delete folder Successfully");
            }
            catch (Exception)
            {
                return Json("");
            }
        }

        [HttpPost]
        public ActionResult DeleteTempFile(string zBook, string zFileName)
        {
            try
            {
                int nLoginID = int.Parse(Session["LoginID"].ToString());

                string zFolderName = string.Format("{0}_{1}", zBook, nLoginID);
                string zZipFolderL = Server.MapPath(string.Format("~/Source/OutSource/temp/{0}/{1}", zFolderName, zFileName));
                System.IO.File.Delete(zZipFolderL);
                return Json("File Delete Successfully");
            }
            catch (Exception)
            {
                return Json("");
            }

        }

        public JsonResult CheckBookWise(int BookId, string Stage)
        {
            bool status = false;

            var proofDistribution = aDBManager.TBL_ProofDistribution.Where(item => item.BookID == BookId && item.ChapterID == "ALL").FirstOrDefault();

            if (proofDistribution != null)
            {
                if (proofDistribution.Stage == Stage)
                    status = true;
            }
            return Json(status, JsonRequestBehavior.AllowGet);
        }
        #endregion
    }
}
