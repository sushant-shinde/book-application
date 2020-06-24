using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Ionic.Zip;
using Newtonsoft.Json;
using WMS.Models;

namespace WMS.Controllers
{
    public class TrackingController : Controller
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

        #region Author and Editor Tracking

        // GET: Tracking
        [Route("tracking/index/{type}")]
        public ActionResult Index(string type)
        {
            Session["LoginType"] = type;
            return View();
        }

        [HttpPost]
        public ActionResult GetBookList()
        {
            SP_GetBook_Current_Status_Result status = new SP_GetBook_Current_Status_Result();
            List<SP_GetBook_Current_Status_Result> statusList = new List<SP_GetBook_Current_Status_Result>();

            int nLoginID = int.Parse(Session["LoginID"].ToString());

            var zBookList = aDBManager.SP_GetBookList_AU_ED_Tracking(nLoginID);
            var zBookStatusList = aDBManager.SP_GetBookList_AU_ED_Tracking_Status(nLoginID);

            var tempList = aDBManager.SP_GetBookList_AU_ED_Tracking(nLoginID).ToList();
            foreach (var item in tempList)
            {
                status = aDBManager.SP_GetBook_Current_Status(item.BookID).FirstOrDefault();

                if (status != null)
                {
                    if (!(statusList.Where(a => a.BookID == item.BookID).Any()))
                    {
                        statusList.Add(status);
                    }
                    //   statusList.Add(status);
                }
            }
            return Json(new { zBookList, zBookStatusList, statusList }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetBookChapterList(int BookID, string zStage)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());

            var zBookList = aDBManager.TBL_ProofDistribution.Where(item => item.BookID == BookID && item.LoginID == nLoginID).ToList();
            DateTime aAcceptDt = DateTime.Now;
            zBookList.ForEach(item =>
            {
                item.AcceptDate = (item.AcceptDate == null ? aAcceptDt : item.AcceptDate);

            });
            aDBManager.SaveChanges();

            var zBookChapterList = aDBManager.SP_GetBookChapterList_AU_ED_Tracking(BookID, zStage, nLoginID);

            return Json(new { zBookChapterList }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult BookAccept(int BookID)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());

            var zBookList = aDBManager.TBL_ProofDistribution.Where(item => item.BookID == BookID && item.LoginID == nLoginID).ToList();
            DateTime aAcceptDt = DateTime.Now;

            zBookList.ForEach(item =>
            {
                item.AcceptDate = aAcceptDt;

            });
            aDBManager.SaveChanges();


            return Json("Updated", JsonRequestBehavior.AllowGet);
        }



        public ActionResult DownloadProofFile(string zProofID, string zType)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());

            var aProofList = (zProofID != null ? zProofID.Split(',') : null);
            string[] iProofList = (aProofList != null ? aProofList.ToArray() : null);

            var zItemList = aDBManager.TBL_ProofDistribution.Where(item => (aProofList.Contains(item.ID.ToString()))).ToList();
            int nBookID = int.Parse(zItemList[0].BookID.ToString());
            var zBookList = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == nBookID);

            if (zItemList.Count > 1)
            {
                string zZipFileName = string.Format("{0}_{1}", zBookList.Number, DateTime.Now.ToString("HHmmss"));

                string zZipFolderL = Server.MapPath(string.Format("~/Source/Distribution/{0}/{1}/{2}", zBookList.Number, zItemList[0].Stage, zZipFileName));

                if (zType == "Author")
                    zZipFolderL = Server.MapPath(string.Format("~/Source/Distribution/{0}/{1}/Author/{2}", zBookList.Number, zItemList[0].Stage, zZipFileName));

                Common.CheckDirectory(zZipFolderL);
                string aFileName = string.Format("{0}.zip", zZipFileName);

                foreach (var item in zItemList)
                {
                    string zFilePath = Server.MapPath(string.Format("~/Source/Distribution/{0}/{1}/{2}", zBookList.Number, item.Stage, item.UploadFileName));
                    string aFileNameL = item.UploadFileName;
                    if (zType == "Author")
                    {
                        var aAuthorList = aDBManager.TBL_ProofDistribution.Where(item1 => item1.BookID == nBookID && item1.ChapterID == item.ChapterID && item1.UserType == "Author").ToList();
                        aFileNameL = aAuthorList[0].CorrectionFileName;
                        zFilePath = Server.MapPath(string.Format("~/Source/Distribution/{0}/{1}/Author/{2}", zBookList.Number, item.Stage, aFileNameL));
                    }


                    FileInfo fi = new FileInfo(zFilePath);
                    fi.CopyTo(zZipFolderL + @"\" + aFileNameL, true);


                    var aItemList = aDBManager.TBL_ProofDistribution.SingleOrDefault(item1 => item1.ID == item.ID);
                    aItemList.DownloadDate = (aItemList.DownloadDate == null ? DateTime.Now : aItemList.DownloadDate);
                    aDBManager.SaveChanges();
                }

                CreateZIP(zZipFolderL, zZipFileName, zZipFileName);

                string zZilFileName = string.Format("{0}.zip", zZipFolderL);
                byte[] fileBytes = System.IO.File.ReadAllBytes(zZilFileName);

                return File(fileBytes, System.Net.Mime.MediaTypeNames.Application.Octet, aFileName);

            }
            else
            {
                string aFileName = zItemList[0].UploadFileName;


                int nProofID = zItemList[0].ID;

                var aItemList = aDBManager.TBL_ProofDistribution.SingleOrDefault(item1 => item1.ID == nProofID);
                aItemList.DownloadDate = (aItemList.DownloadDate == null ? DateTime.Now : aItemList.DownloadDate);
                aDBManager.SaveChanges();

                string zFilePath = Server.MapPath(string.Format("~/Source/Distribution/{0}/{1}/{2}", zBookList.Number, aItemList.Stage, aFileName));

                if (zType == "Author")
                {
                    string zChapter = zItemList[0].ChapterID;
                    var aAuthorList = aDBManager.TBL_ProofDistribution.Where(item1 => item1.BookID == nBookID
                                                                            && item1.ChapterID == zChapter
                                                                            && item1.UserType == "Author"
                                                                            && !item1.CorrectionFileName.Contains("Manual Closing")).ToList();
                    aFileName = aAuthorList[0].CorrectionFileName;
                    zFilePath = Server.MapPath(string.Format("~/Source/Distribution/{0}/{1}/Author/{2}", zBookList.Number, aItemList.Stage, aFileName));
                }

                byte[] fileBytes = System.IO.File.ReadAllBytes(zFilePath);

                return File(fileBytes, System.Net.Mime.MediaTypeNames.Application.Octet, aFileName);

            }


        }


        [HttpPost]
        public ActionResult UploadFolder()
        {
            try
            {
                string zProofID = Request.Form.GetValues("ProofID")[0];
                int nLoginID = int.Parse(Session["LoginID"].ToString());

                var aProofList = (zProofID != null ? zProofID.Split(',') : null);
                string[] iProofList = (aProofList != null ? aProofList.ToArray() : null);

                var zItemList = aDBManager.TBL_ProofDistribution.Where(item => (aProofList.Contains(item.ID.ToString()))).ToList();
                int nBookID = int.Parse(zItemList[0].BookID.ToString());
                var zBookList = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == nBookID);

                string zUpoadType = zItemList[0].UserType;

                string zFolderName = string.Format("{0}/{1}/{2}_Login_{3}", zItemList[0].Stage, zUpoadType, zBookList.Number, nLoginID);
                // Checking no of files injected in Request object  
                if (Request.Files.Count > 0)
                {
                    try
                    {
                        //  Get all files from Request object  
                        HttpFileCollectionBase files = Request.Files;
                        for (int i = 0; i < files.Count; i++)
                        {
                            //string path = AppDomain.CurrentDomain.BaseDirectory + "Uploads/";  
                            //string filename = Path.GetFileName(Request.Files[i].FileName);  

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
                            string zPath = Server.MapPath(string.Format("~/Source/Distribution/{0}/{1}", zBookList.Number, zFolderName));
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


        public string UploadCorrectionDetails(List<TBL_ProofDistribution> zItemList, int nBookID, string zFileNameL, DateTime aDateP, byte nNoCorrectionsP,
                                            string zStageP)
        {
            string aResult = "Success";

            foreach (var itemList in zItemList)
            {
                if (itemList.UserType == "Author")
                {
                    var aProofIitemListL = aDBManager.TBL_ProofDistribution.Where(item => item.BookID == itemList.BookID
                                                                                    && item.ChapterID == itemList.ChapterID
                                                                                    && item.UserType == "Author"
                                                                                    && item.Stage == zStageP).ToList();

                    aProofIitemListL.ForEach(item =>
                    {
                        item.CorrectionReceiveDt = aDateP;
                        item.CorrectionFileName = zFileNameL;
                        item.NoCorrection = nNoCorrectionsP;
                        item.Booked = nNoCorrectionsP;

                    }); aDBManager.SaveChanges();
                }
                else if (itemList.UserType == "Editor")
                {
                    var aProofIitemListL = aDBManager.TBL_ProofDistribution.Where(item => item.BookID == itemList.BookID
                                                                                    && item.ChapterID == itemList.ChapterID
                                                                                    && item.UserType == "Author"
                                                                                    && item.CorrectionReceiveDt == null
                                                                                    && item.SeriesFlow == 1
                                                                                    && item.Stage == zStageP).ToList();
                    if (aProofIitemListL.Count > 0)
                    {
                        return string.Format("Error : Author not yet close the corrections for this Chapter: {0}", itemList.ChapterID);
                    }
                    else
                    {
                        aProofIitemListL = aDBManager.TBL_ProofDistribution.Where(item => item.BookID == itemList.BookID
                                                                                  && item.UserType == "Editor"
                                                                                  && item.ChapterID == itemList.ChapterID
                                                                                  && item.AllEDCorrection == 1
                                                                                  && item.Stage == zStageP).ToList();
                        // Check All Editor Should Corrections enter
                        if (aProofIitemListL.Count > 0)
                        {
                            aProofIitemListL = aDBManager.TBL_ProofDistribution.Where(item => item.BookID == itemList.BookID
                                                                                  && item.ChapterID == itemList.ChapterID
                                                                                  && (item.UserType == "Editor" || item.UserType == "AuthorEditor")
                                                                                  && item.CorrectionReceiveDt == null
                                                                                  && item.AllEDCorrection == 1
                                                                                  && (item.ID == itemList.ID || item.UserType == "AuthorEditor")
                                                                                  && item.Stage == zStageP).ToList();
                        }
                        else
                        {
                            aProofIitemListL = aDBManager.TBL_ProofDistribution.Where(item => item.BookID == itemList.BookID
                                                                                  && item.ChapterID == itemList.ChapterID
                                                                                  && (item.UserType == "Editor" || item.UserType == "AuthorEditor")
                                                                                  && item.AllEDCorrection == 0
                                                                                  && item.Stage == zStageP).ToList();
                        }

                        aProofIitemListL.ForEach(item =>
                        {
                            item.CorrectionReceiveDt = aDateP;
                            item.CorrectionFileName = zFileNameL;
                            item.NoCorrection = nNoCorrectionsP;
                            item.Booked = nNoCorrectionsP;

                        });
                        aDBManager.SaveChanges();

                    }
                }
            }
            return aResult;
        }
        [HttpPost]
        public ActionResult FileUploadWithZip(string zProofID, string zStageP)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());

            var aProofList = (zProofID != null ? zProofID.Split(',') : null);
            string[] iProofList = (aProofList != null ? aProofList.ToArray() : null);

            var zItemList = aDBManager.TBL_ProofDistribution.Where(item => (aProofList.Contains(item.ID.ToString()))).ToList();
            int nBookID = int.Parse(zItemList[0].BookID.ToString());
            var zBookList = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == nBookID);


            string zUpoadType = zItemList[0].UserType; ;
            string zZipFileName = string.Format("{0}_Upload_{1}", zBookList.Number, DateTime.Now.ToString("HHmmss"));

            string zFolderName = string.Format("{0}_Login_{2}", zBookList.Number, zUpoadType, nLoginID);

            string zZipFolderL = Server.MapPath(string.Format("~/Source/Distribution/{0}/{1}/{2}/{3}", zBookList.Number, zItemList[0].Stage, zUpoadType, zFolderName));
            string aFileName = string.Format("{0}.zip", zZipFileName);

            DateTime aCorrectionDt = DateTime.Now;

            string aResult = UploadCorrectionDetails(zItemList, nBookID, aFileName, aCorrectionDt, 0, zStageP);
            if (aResult == "Success")
            {
                CreateZIP(zZipFolderL, zZipFileName, zFolderName);

                string zChapterDetails = string.Empty;
                foreach (var item in zItemList)
                {
                    zChapterDetails = string.Format("{0},{1}", item.ChapterID, zChapterDetails);
                }

                string Mailbody = "";
                var aMailTemp = aDBManager.TBL_MailTemplate.SingleOrDefault(item => item.Template == "AuhtorProofResponse");
                Mailbody = aMailTemp.MailContent;
                string AppUrl = Request.Url.AbsoluteUri.Replace(Request.Url.AbsolutePath, "") + Request.ApplicationPath;
                Mailbody = Mailbody
                    .Replace("{BookTitle}", zBookList.Title)
                    .Replace("{UserType}", zUpoadType)
                    .Replace("{UploadType}", "Uploaded")
                    .Replace("{Catalog}", string.Format("{0} <br> Chapters List : {1} <br> File Name : {2}",
                                          zBookList.Catalog, zChapterDetails.TrimEnd(','), aFileName))
                    .Replace("{Link}", AppUrl);

                var aPMList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == zBookList.PMName);
                var aTSPMList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == zBookList.TSPM);

                var mail = MailModels.Mail(
                            To: aPMList.EmailID,
                            Cc: aTSPMList.EmailID,
                            Bcc: "",
                            Subject: string.Format("{0} Proof Uploaded - {1} ({2})", zUpoadType, zBookList.Catalog, zBookList.Number),
                            Body: Mailbody,
                            //From: From,
                            DisplayName: "SESAME"
                            );



                return Json(nBookID, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(aResult, JsonRequestBehavior.AllowGet);
            }

        }


        [HttpPost]
        public ActionResult UpdateNoCorrection(string zProofID, string zStageP)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());

            var aProofList = (zProofID != null ? zProofID.Split(',') : null);
            string[] iProofList = (aProofList != null ? aProofList.ToArray() : null);

            var zItemList = aDBManager.TBL_ProofDistribution.Where(item => (aProofList.Contains(item.ID.ToString()))).ToList();
            int nBookID = int.Parse(zItemList[0].BookID.ToString());
            var zBookList = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == nBookID);

            DateTime aNoCorrectionDt = DateTime.Now;

            string zUpoadType = zItemList[0].UserType;

            string zNoCorFileName = string.Format("NoCorrection_{0}.txt", DateTime.Now.ToString("HHmmss"));
            string zFileNameL = Server.MapPath(string.Format("~/Source/Distribution/{0}/{1}/{2}/{3}",
                zBookList.Number, zItemList[0].Stage, zUpoadType, zNoCorFileName));

            string aResult = UploadCorrectionDetails(zItemList, nBookID, zNoCorFileName, aNoCorrectionDt, 1, zStageP);
            if (aResult == "Success")
            {
                string zChapterDetails = string.Empty;
                foreach (var item in zItemList)
                {
                    zChapterDetails = string.Format("{0},{1}", item.ChapterID, zChapterDetails);
                }
                System.IO.FileInfo file = new System.IO.FileInfo(zFileNameL);
                file.Directory.Create();
                System.IO.File.WriteAllText(file.FullName, zChapterDetails);

                string Mailbody = "";
                var aMailTemp = aDBManager.TBL_MailTemplate.SingleOrDefault(item => item.Template == "AuhtorProofResponse");
                Mailbody = aMailTemp.MailContent;
                string AppUrl = Request.Url.AbsoluteUri.Replace(Request.Url.AbsolutePath, "") + Request.ApplicationPath;
                Mailbody = Mailbody
                    .Replace("{BookTitle}", zBookList.Title)
                    .Replace("{UserType}", zUpoadType)
                    .Replace("{UploadType}", "No Correction")
                    .Replace("{Catalog}", zBookList.Catalog + "<br> Chapters List : " + zChapterDetails.TrimEnd(','))
                    .Replace("{Link}", AppUrl);

                var aPMList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == zBookList.PMName);
                var aTSPMList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == zBookList.TSPM);

                var mail = MailModels.Mail(
                            To: aPMList.EmailID,
                            Cc: aTSPMList.EmailID,
                            Bcc: "",
                            Subject: string.Format("{0} Proof : No Correction Uploaded - {1} ({2})", zUpoadType, zBookList.Catalog, zBookList.Number),
                            Body: Mailbody,
                            //From: From,
                            DisplayName: "SESAME"
                            );


                return Json(nBookID, JsonRequestBehavior.AllowGet);
            }
            else
                return Json(aResult, JsonRequestBehavior.AllowGet);

        }


        [HttpPost]
        public ActionResult DeleteTempFolder(string zProofID)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());

            var aProofList = (zProofID != null ? zProofID.Split(',') : null);
            string[] iProofList = (aProofList != null ? aProofList.ToArray() : null);

            var zItemList = aDBManager.TBL_ProofDistribution.Where(item => (aProofList.Contains(item.ID.ToString()))).ToList();
            int nBookID = int.Parse(zItemList[0].BookID.ToString());
            var zBookList = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == nBookID);

            string zUpoadType = zItemList[0].UserType;
            string zFolderName = string.Format("{0}_Login_{2}", zBookList.Number, zUpoadType, nLoginID);
            string zZipFolderL = Server.MapPath(string.Format("~/Source/Distribution/{0}/{1}/{2}/{3}", zBookList.Number, zItemList[0].Stage, zUpoadType, zFolderName));
            Common.DeleteDirectory(zZipFolderL);
            return Json("File Updated Successfully");

        }

        public ActionResult DeleteTempFile(string zProofID, string zFileName)
        {
            try
            {
                int nLoginID = int.Parse(Session["LoginID"].ToString());

                var aProofList = (zProofID != null ? zProofID.Split(',') : null);
                string[] iProofList = (aProofList != null ? aProofList.ToArray() : null);

                var zItemList = aDBManager.TBL_ProofDistribution.Where(item => (aProofList.Contains(item.ID.ToString()))).ToList();
                int nBookID = int.Parse(zItemList[0].BookID.ToString());
                var zBookList = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == nBookID);

                string zUpoadType = zItemList[0].UserType;
                string zFolderName = string.Format("{0}_Login_{2}", zBookList.Number, zUpoadType, nLoginID);
                string zZipFolderL = Server.MapPath(string.Format("~/Source/Distribution/{0}/{1}/{2}/{3}/{4}",
                                                    zBookList.Number, zItemList[0].Stage, zUpoadType, zFolderName, zFileName));
                System.IO.File.Delete(zZipFolderL);
                return Json("File Delete Successfully");
            }
            catch (Exception)
            {
                return Json("");
            }

        }


        #region Create Zip files
        public void CreateZIP(string zpathL, string zZipNameP, string zReplacepath = "")
        {

            string path = zpathL;//Location for inside Test Folder  
            string[] Filenames = Directory.GetFiles(path);

            using (ZipFile zip = new ZipFile())
            {
                zip.AddFiles(Filenames, zZipNameP);
                if (zReplacepath != "")
                    zip.Save(Path.Combine(string.Format(zpathL.Replace(zReplacepath, "") + "/{0}.zip", zZipNameP)));
                else
                    zip.Save(Path.Combine(string.Format(zpathL + "/{0}.zip", zZipNameP)));
                Common.DeleteDirectory(zpathL);
            }


        }
        #endregion

        #endregion

        #region ManagerTracking
        [CustomAuthorize]
        public ActionResult List()
        {
            return View();
        }
        [HttpPost]
        public ActionResult GetManagerTracking()
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());

            var aItemList = aDBManager.SP_GetBookList_ManagerTracking(nLoginID);
            var aActivityList = aDBManager.SP_GetActivity_MilestoneList(nLoginID);
            return Json(new { aItemList, aActivityList }, JsonRequestBehavior.AllowGet);
        }
        #endregion


        #region  Out Of Facility

        public ActionResult oof()
        {
            return View();
        }

        [HttpPost]
        public ActionResult GetPMList()
        {

            var aItemList = aDBManager.SP_GetPM_PE_List("PM");

            return Json(new { aItemList }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetPMBookList(int zPMID)
        {
            var aItemList = aDBManager.TBL_MainMaster.Where(item => item.PMName == zPMID && item.IsDeleted == 0 && item.Billed == 0);
            string json = "";

            json = JsonConvert.SerializeObject(aItemList, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });

            return Json(json, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult UpdateTransfer(string zBookIDList, string zMode, int zPM, string zFromDate, string zToDate, string zRemarks, string zMailTypeP)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());

            Nullable<DateTime> aFromDate = null;
            Nullable<DateTime> aToDate = null;


            if (zFromDate != "")
            {
                aFromDate = Convert.ToDateTime(zFromDate);
                aToDate = Convert.ToDateTime(zToDate);
            }
            using (var dbcontext = new WMSEntities())
            {
                using (DbContextTransaction transaction = dbcontext.Database.BeginTransaction())
                {
                    try
                    {

                        var aBookList = (zBookIDList != null ? zBookIDList.Split(',') : null);
                        var zItemList = dbcontext.TBL_MainMaster.Where(item => (aBookList.Contains(item.ID.ToString()))).ToList();


                        foreach (var itemList in zItemList)
                        {
                            Nullable<int> CurrentPM = itemList.PMName;
                            itemList.TransferMode = zMode;
                            itemList.TransferPMName = CurrentPM;
                            itemList.PMName = zPM;
                            itemList.TransferFromDate = aFromDate;
                            itemList.TransferToDate = aToDate;
                            itemList.TransferRemarks = zRemarks;
                            itemList.IsTransfer = 1;
                            dbcontext.SaveChanges();

                            aDBManager.Tbl_OOFHistory.Add(new Tbl_OOFHistory()
                            {
                                MainID = itemList.ID,
                                CurrentPM = CurrentPM,
                                TransferMode = zMode,
                                TransferToPM = zPM,
                                TransferFromDate = aFromDate,
                                TransferToDate = aToDate,
                                Remark = zRemarks,
                                UpdatedBy = nLoginID,
                                UpdatedTime = DateTime.Now
                            });

                            aDBManager.SaveChanges();

                            if (zMailTypeP != "")
                            {
                                var aMailItemL = aDBManager.TBL_MailTemplate.SingleOrDefault(item => item.Template == "OOF");
                                if (aMailItemL != null)
                                {
                                    string Mailbody = "";

                                    Mailbody = aMailItemL.MailContent;

                                    var zOldPM = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == CurrentPM);
                                    int nNewPM = zPM;
                                    var zNewOldPM = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == nNewPM);

                                    Nullable<int> nTSPM = itemList.TSPM;
                                    var zTSPMInfo = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == nTSPM);

                                    string zTransMode = string.Format("{0} {1} to {2}", zMode, zFromDate, zToDate);
                                    if (zMode == "Whole")
                                        zTransMode = "";


                                    Mailbody = Mailbody
                                        .Replace("{PM}", Common.ToTitleCase(zOldPM.LoginName))
                                        .Replace("{NewPM}", Common.ToTitleCase(zNewOldPM.LoginName))
                                        .Replace("{BookTitle}", Common.ToTitleCase(itemList.Title))
                                        .Replace("{Mode}", zTransMode)
                                        ;
                                    if (zMailTypeP.Contains("1") && itemList.AuthorEmail != null && itemList.AuthorName != null)
                                    {
                                        itemList.NotifyAuthorEmail = itemList.AuthorEmail;
                                        dbcontext.SaveChanges();
                                        string MailbodyL = Mailbody;
                                        if (itemList.AuthorEmail != null)
                                            MailbodyL = MailbodyL.Replace("{User}", Common.ToTitleCase(itemList.AuthorName));
                                        var mail = MailModels.Mail(
                                                    To: itemList.AuthorEmail,
                                                    Cc: zNewOldPM.EmailID,
                                                    Bcc: string.Format("{0};", zTSPMInfo.EmailID),
                                                    Subject: "Notification for Project Manager changes",
                                                    Body: MailbodyL,
                                                    //From: From,
                                                    DisplayName: "SESAME"
                                                    );
                                    }
                                    if (zMailTypeP.Contains("2") && itemList.EditorEmail != null && itemList.EditorName != null)
                                    {
                                        itemList.NotifyEditorEmail = itemList.EditorEmail;
                                        dbcontext.SaveChanges();
                                        string MailbodyL = Mailbody;
                                        if (itemList.EditorEmail != null)
                                            MailbodyL = MailbodyL.Replace("{User}", Common.ToTitleCase(itemList.EditorName));
                                        var mail = MailModels.Mail(
                                                    To: itemList.EditorEmail,
                                                    Cc: zNewOldPM.EmailID,
                                                    Bcc: string.Format("{0};", zTSPMInfo.EmailID),
                                                    Subject: "Notification for Project Manager changes",
                                                    Body: MailbodyL,
                                                    //From: From,
                                                    DisplayName: "SESAME"
                                                    );
                                    }

                                }
                            }

                        }
                        transaction.Commit();
                    }

                    catch (Exception ex)
                    {
                        return Json("Error : " + ex.Message, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            return Json("Book Transfer Successfully !", JsonRequestBehavior.AllowGet);

        }

        #endregion
    }
}