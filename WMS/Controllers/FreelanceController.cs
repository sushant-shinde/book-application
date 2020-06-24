using Newtonsoft.Json;
using WMS.Models;
using WMS;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Newtonsoft.Json.Linq;
using System.Text;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.IO;
using Ionic.Zip;

namespace WMS.Controllers
{
    public class FreelanceController : Controller
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

        #region Freelancer Master
        // GET: Freelance
        [CustomAuthorizeAttribute]
        public ActionResult Index()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            FreelanceModel aBkData = new FreelanceModel();
            aBkData.PublisherList = Common.GetPublisherList(false);
            aBkData.Source = Common.GetSourceList(false);
            aBkData.Language = Common.GetLanguageList(false);
            aBkData.Country = Common.GetCountryList(false);
            aBkData.TaskList = Common.GetTaskList(false);
            aBkData.SubjectList = Common.GetSubjectList(false);
            return View(aBkData);
        }

        [HttpPost]
        public ActionResult GetMasterList()
        {
            var aItemList = aDBManager.sp_GetFreelancerMaster_List().ToList();
            string json = JsonConvert.SerializeObject(aItemList, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });
            var aSrcItemList = aDBManager.TBL_SourceList.ToList();
            return Json(new { json, aSrcItemList }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult GetStateList_ByCountry(int nCountryID)
        {
            var aItemList = aDBManager.TBL_States.Where(item => item.CountryID == nCountryID).ToList();
            string json = JsonConvert.SerializeObject(aItemList, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });
            return Json(new { json }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetCityList_ByState(int nStateID)
        {
            var aItemList = aDBManager.TBL_Cities.Where(item => item.StateID == nStateID).ToList();
            string json = JsonConvert.SerializeObject(aItemList, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });
            return Json(new { json }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult PopulateFreelancer(int nID)
        {
            var aList = aDBManager.TBL_Freelancer_Master.Where(item => item.ID == nID).ToList();

            string aItemList = JsonConvert.SerializeObject(aList, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });

            var aTaskList = aDBManager.TBL_Freelancer_TaskPrice
            .Join(aDBManager.TBL_Freelancer_Task, AB => AB.TaskID, BC => BC.SNo, (AB, BC) => new { AB, BC })
            .Where(item => item.AB.FreelancerID == nID)
            .Select(item => new
            {
                item.AB.FreelancerID,
                item.BC.TaskName,
                item.AB.Price,
                item.AB.Capacity,
                item.AB.WordPrice,
                item.AB.WordCapacity,
                item.AB.TablePrice,
                item.AB.TableCapacity,
                item.AB.FigurePrice,
                item.AB.FigureCapacity,
            });

            return Json(new { aItemList, aTaskList }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult DeleteFreelancer(int nID)
        {

            var zItemList = aDBManager.TBL_Freelancer_Master.SingleOrDefault(item => item.ID == nID);
            zItemList.IsDeleted = 1;
            zItemList.UpdatedTime = DateTime.Now;
            zItemList.UpdatedBy = int.Parse(Session["LoginID"].ToString());
            aDBManager.SaveChanges();


            return Json("Freelancer details Deleted Successfully!", JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult SaveMaster(Freelancermaster aitemInfo)
        {
            try
            {
                int nLoginIDL = int.Parse(Session["LoginID"].ToString());


                string zSourseList = string.Empty;
                string[] zsrcSplit = aitemInfo.Source.Split(',').ToArray();
                foreach (var item in zsrcSplit)
                {
                    int n;
                    var isNumeric = int.TryParse(item, out n);
                    if (isNumeric)
                    {
                        zSourseList += n.ToString() + ",";
                    }
                    else
                    {
                        TBL_SourceList aitemSrc = new TBL_SourceList();
                        aitemSrc.SourceName = item;
                        aitemSrc.CreatedBy = nLoginIDL;
                        aitemSrc.CreatedTime = DateTime.Now;
                        aDBManager.TBL_SourceList.Add(aitemSrc);
                        aDBManager.SaveChanges();
                        zSourseList += aitemSrc.ID.ToString() + ",";
                    }
                }

                int nID = 0;
                var aResultL = aDBManager.SP_Freelancer_Master_AddUpdate(
                    aitemInfo.ID, aitemInfo.Name, aitemInfo.DOB, aitemInfo.Available, aitemInfo.FromDate, aitemInfo.ToDate, aitemInfo.Gender,
                    aitemInfo.Address, aitemInfo.CountryID, aitemInfo.StateID, aitemInfo.CityID, aitemInfo.Pincode, aitemInfo.EmailID, aitemInfo.EmailID1,
                    aitemInfo.SkypeId, aitemInfo.MobileNo, aitemInfo.Specialization, aitemInfo.PerformanceRecord, aitemInfo.BankName,
                    aitemInfo.AccountNo, aitemInfo.IFSCCode, aitemInfo.BranchName, aitemInfo.NDADocument, aitemInfo.PANCard, aitemInfo.PublisherList,
                    aitemInfo.Language,
                    zSourseList.TrimEnd(','),
                    aitemInfo.Interest, aitemInfo.Restriction, aitemInfo.IsActive, aitemInfo.Image,
                    aitemInfo.Remarks, nLoginIDL);


                nID = aResultL.SingleOrDefault(item => item.Value == item.Value).Value;


                List<object> aTask = JsonConvert.DeserializeObject<List<object>>(aitemInfo.aTaskListL);
                using (var dbcontext = new WMSEntities())
                {

                    using (DbContextTransaction transaction = dbcontext.Database.BeginTransaction())
                    {
                        try
                        {
                            IEnumerable<TBL_Freelancer_TaskPrice> alist = dbcontext.TBL_Freelancer_TaskPrice.Where(i => i.FreelancerID == nID).ToList();
                            dbcontext.TBL_Freelancer_TaskPrice.RemoveRange(alist);
                            dbcontext.SaveChanges();


                            foreach (var item in aTask.AsEnumerable())
                            {
                                JObject o = JObject.Parse(item.ToString());
                                string zTaskName = (string)o["Task Name"];
                                decimal nPrice = (decimal)o["Price"];
                                int nCapacity = (int)o["Capacity"];
                                decimal nWordPrice = (decimal)o["WordPrice"];
                                int nWordCapacity = (int)o["WordCapacity"];
                                decimal nTablePrice = (decimal)o["TablePrice"];
                                int nTableCapacity = (int)o["TableCapacity"];
                                decimal nFigurePrice = (decimal)o["FigurePrice"];
                                int nFigureCapacity = (int)o["FigureCapacity"];
                                var zTaskList = dbcontext.TBL_Freelancer_Task.SingleOrDefault(i => i.TaskName == zTaskName);

                                int nTaskID = 0;
                                if (zTaskList != null)
                                    nTaskID = zTaskList.SNo;
                                else
                                {
                                    TBL_Freelancer_Task aitemNew = new TBL_Freelancer_Task();

                                    aitemNew.TaskName = zTaskName;
                                    aitemNew.CreatedBy = nLoginIDL;
                                    aitemNew.CreatedTime = DateTime.Now;
                                    dbcontext.TBL_Freelancer_Task.Add(aitemNew);
                                    dbcontext.SaveChanges();
                                    nTaskID = aitemNew.SNo;
                                }

                                dbcontext.TBL_Freelancer_TaskPrice.Add(new TBL_Freelancer_TaskPrice()
                                {
                                    FreelancerID = nID,
                                    TaskID = nTaskID,
                                    Price = nPrice,
                                    Capacity = nCapacity,
                                    WordPrice = nWordPrice,
                                    WordCapacity = nWordCapacity,
                                    TablePrice = nTablePrice,
                                    TableCapacity = nTableCapacity,
                                    FigurePrice = nFigurePrice,
                                    FigureCapacity = nFigureCapacity
                                });
                                dbcontext.SaveChanges();
                            }
                            transaction.Commit();

                            string zPassword = Common.RandomString(6);

                            string password = Common.EncryptString(zPassword);
                            //Create LoginID for Freelancer 
                            var aUserList = aDBManager.SP_CreateUSERID_Freelancer(nID, aitemInfo.Name, aitemInfo.EmailID, password, nLoginIDL);

                            //Send Login Credential to Freelancer 
                            int nIsNewuserL = aUserList.SingleOrDefault(item => item.Value == item.Value).Value;
                            if (nIsNewuserL == 1)
                            {
                                string Mailbody = "";
                                string zMailTempPath = string.Format("~/MailTemplate/CredentialTemplate.html");
                                if (System.IO.File.Exists(Server.MapPath(zMailTempPath)))
                                    Mailbody = System.IO.File.ReadAllText(Server.MapPath(string.Format("~/MailTemplate/CredentialTemplate.html")));

                                string AppUrl = Request.Url.AbsoluteUri.Replace(Request.Url.AbsolutePath, "") + Request.ApplicationPath;
                                Mailbody = Mailbody
                                    .Replace("{HINAME}", aitemInfo.Name)
                                    .Replace("{UserName}", aitemInfo.EmailID)
                                    .Replace("{Password}", zPassword)
                                    .Replace("{Link}", AppUrl)
                                    ;

                                //var mail = MailModels.Mail(
                                //            To: aitemInfo.EmailID,
                                //            Cc: "",
                                //            Bcc: "",
                                //            Subject: "Sesame Credential Details",
                                //            Body: Mailbody,
                                //            //From: From,
                                //            DisplayName: "SESAME"
                                //            );
                            }

                        }
                        catch (Exception ex)
                        {
                            return Json(ex.Message, JsonRequestBehavior.AllowGet);
                        }
                    }
                }


                return Json("Freelancer Master Updated Successfully...");
            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }
        #endregion

        #region "Freelancer Selection"
        public ActionResult Selection()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            FreelanceModel aBkData = new FreelanceModel();
            aBkData.PublisherList = Common.GetPublisherList(false);
            aBkData.TaskList = Common.GetTaskList(false);
            aBkData.CatalogList = Common.GetCatalogList(nUserID, false);
            aBkData.NumberList = Common.GetNumberList(nUserID, false);
            aBkData.ISBNList = Common.GetISBNList(nUserID, false);
            return View(aBkData);
        }

        [HttpPost]
        public ActionResult GetSelectionBk(string FirstLoad, string CatalogList, string NumList, string ISBNList, string PublList, string TaskList)
        {
            List<SP_GetFreelanceSelectionData_Result> aItemList = new List<SP_GetFreelanceSelectionData_Result>();

            try
            {
                int nUserID = int.Parse(Session["LoginID"].ToString());

                var testItemList = aDBManager.SP_GetFreelanceSelectionData(nUserID).ToList();

                var projectAnalysisList = aDBManager.TBL_ProjectAnalysis.Select(item => new { item.ID, item.MainID, item.PM_Index }).ToList().ToList();

                foreach (var item in testItemList)
                {
                    if (!(projectAnalysisList.Where(a => a.MainID == item.ID && a.PM_Index == "Author").Any() && item.TaskName == "Indexing"))
                    {
                        aItemList.Add(item);
                    }
                }

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

                    aItemList = aItemList.Where(item => (iPublList.Contains(item.PublisherID.ToString()))).ToList();
                }
                if (TaskList != "All")
                {
                    var aTaskList = (TaskList != null ? TaskList.Split(',') : null);
                    string[] iTaskList = (aTaskList != null ? aTaskList.ToArray() : null);

                    aItemList = aItemList.Where(item => (iTaskList.Contains(item.TaskID.ToString()))).ToList();
                }

                List<SelectListItem> Catalogitems = new List<SelectListItem>();
                List<SelectListItem> ISBNitems = new List<SelectListItem>();
                List<SelectListItem> Numberitems = new List<SelectListItem>();
                if (FirstLoad == "true")
                {
                    var aCatList = aItemList.Select(item => new { item.Catalog }).Distinct().ToList();
                    foreach (var item in aCatList)
                    {

                        Catalogitems.Add(new SelectListItem()
                        {
                            Value = item.Catalog.ToString(),
                            Text = item.Catalog.ToString()

                        });

                    }
                    var aISBNList = aItemList.Select(item => new { item.ISBN }).Distinct().ToList();
                    foreach (var item in aISBNList)
                    {

                        ISBNitems.Add(new SelectListItem()
                        {
                            Value = item.ISBN.ToString(),
                            Text = item.ISBN.ToString()

                        });

                    }
                    var aNumList = aItemList.Select(item => new { item.Number }).Distinct().ToList();
                    foreach (var item in aNumList)
                    {

                        Numberitems.Add(new SelectListItem()
                        {
                            Value = item.Number.ToString(),
                            Text = item.Number.ToString()

                        });

                    }

                }

                return Json(new { aItemList, Catalogitems, ISBNitems, Numberitems }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }

        [HttpPost]
        public ActionResult GetFreelancerList(int zTaskID, int nBookID)
        {
            try
            {
                List<SelectListItem> Freelanceritems = new List<SelectListItem>();
                var aFreelancerList = aDBManager.SP_GetFreelanceSelectionList(zTaskID).
                    Select(item => new { item.ID, item.Name, item.EmailID, item.Capacity, item.Alloted, item.PublisherList }).ToList();


                var aBookList = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == nBookID);


                foreach (var item in aFreelancerList)
                {
                    if (item.PublisherList == "1" || item.PublisherList.Contains(aBookList.PublisherID.ToString()))
                    {
                        Freelanceritems.Add(new SelectListItem()
                        {
                            Value = item.ID.ToString(),
                            Text = item.Name + "|" + item.EmailID

                        });
                    }
                }


                return Json(new { aFreelancerList }, JsonRequestBehavior.AllowGet);


            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }

        [HttpPost]
        public ActionResult GetFreelanceData(int zBookID, int zTaskID, string zCatalog, string zTask)
        {

            int nUserID = int.Parse(Session["LoginID"].ToString());
            var aBooksListL = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == zBookID);

            var zBkList = aDBManager.TBL_FreelanceBooks.SingleOrDefault(item => item.MainID == zBookID && item.TaskID == zTaskID);

            var aitemList = aDBManager.SP_GetFreelancerofSelection(zBookID, zTaskID).Select(item => new { item.ID, item.Name, item.EmailID, item.Capacity, item.Alloted }).ToList();

            var aFMCount = aDBManager.TBL_SubMaster.Where(item => item.MainID == zBookID && item.Number == "C000").Count();// Remove FM(C000) Count
            var aChapterData = aDBManager.TBL_SubMaster.Where(item => item.MainID == zBookID).GroupBy(item => item.MainID).
                Select(item => new
                {
                    MSPages = item.Sum(g => g.MSPages),
                    TSPages = item.Sum(g => g.ProofPages),
                    ChapterCnt = item.Count() - aFMCount,
                }).ToList();


            var aPMData = aDBManager.UserMasters.Where(item => item.UserID == nUserID).ToList();

            string zPath = string.Format("~/Source/FreelanceSelection/{0}/{1}/", zCatalog, zTask);
            string[] FileList = { };

            if (Directory.Exists(Server.MapPath(zPath)))
            {
                FileList = Directory.GetFiles(Server.MapPath(zPath), "*.*", SearchOption.AllDirectories);
            }

            var aMailBody = aDBManager.TBL_MailTemplate.Where(item => item.Template == "FreelanceSelection").ToList();
            string zTaskMailCode = string.Empty;

            if (zTask.ToLower() == "proofreading")
                zTaskMailCode = string.Format("FreelanceSelection{0}", "PR");
            //else if (zTask.ToLower() == "indexing")
            //    zTaskMailCode = string.Format("FreelanceSelection{0}", "IDX");

            var amailItem = aDBManager.TBL_MailTemplate.SingleOrDefault(item => item.Template == zTaskMailCode);
            if (amailItem != null)
                aMailBody = aDBManager.TBL_MailTemplate.Where(item => item.Template == zTaskMailCode).ToList();

            return Json(new { aitemList, zBkList, FileList, aMailBody, aChapterData, aPMData, aBooksListL }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult Fileupload()
        {

            string aCatalog = Request["Catalog"];
            string aTask = Request["Task"];

            if (Request.Files.Count > 0)
            {
                string fname = "";
                try
                {


                    HttpFileCollectionBase files = Request.Files;
                    for (int i = 0; i < files.Count; i++)
                    {

                        HttpPostedFileBase file = files[i];


                        if (Request.Browser.Browser.ToUpper() == "IE" || Request.Browser.Browser.ToUpper() == "INTERNETEXPLORER")
                        {
                            string[] testfiles = file.FileName.Split(new char[] { '\\' });
                            fname = testfiles[testfiles.Length - 1];
                        }
                        else
                        {
                            fname = file.FileName;
                        }

                        string zPlacePathL = Server.MapPath(string.Format("~/Source/FreelanceSelection/{0}/{1}", aCatalog, aTask));
                        Common.CheckDirectory(zPlacePathL);
                        fname = Path.Combine(zPlacePathL, fname);
                        file.SaveAs(fname);

                    }

                    return Json("Success", JsonRequestBehavior.AllowGet);
                }
                catch (Exception ex)
                {
                    return Json("Error occurred. Error details: " + ex.Message, JsonRequestBehavior.AllowGet);
                }
            }

            else
            {
                return Json("No files selected.", JsonRequestBehavior.AllowGet);
            }


        }

        [HttpGet]
        public ActionResult DeleteFile(string zCatalog, string zFileNameP, string zTask)
        {

            string zFilePath = Server.MapPath(string.Format("~/Source/FreelanceSelection/{0}/{1}/{2}", zCatalog, zTask, zFileNameP));

            if (System.IO.File.Exists(zFilePath))
            {
                System.IO.File.Delete(zFilePath);
            }
            return Json("File Deleted", JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult UpdateFreelancerSelection(string zCost, int zVolume, string zUnitType, int zBookID, int zTaskID, string zDueDate, string[] FreelancerL)
        {

            string FreelancerID = "";
            foreach (var item in FreelancerL)
            {
                string[] zstrSplit = item.Split(',');
                FreelancerID = zstrSplit[1] + ',' + FreelancerID;
            }
            FreelancerID = FreelancerID.TrimEnd(',');

            var zBkList = aDBManager.TBL_FreelanceBooks.SingleOrDefault(item => item.MainID == zBookID && item.TaskID == zTaskID);

            zBkList.SuggestedFreelancer = FreelancerID;
            zBkList.SuggestedCost = Convert.ToDecimal(zCost);
            zBkList.SuggestedVolume = zVolume;
            zBkList.SuggestedUnitType = zUnitType;
            zBkList.DueDate = Convert.ToDateTime(zDueDate);
            aDBManager.SaveChanges();

            return Json("Freelancer details updated Successfully!", JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult UpdateFreelancerandMail(string zCost, int zVolume, string zUnitType, int zBookID, int zTaskID, string zDueDate, string[] FreelancerL, string zMailBody, string zSubject, string zCatalog, string zTask)
        {

            int nLoginID = int.Parse(Session["LoginID"].ToString());
            string FreelancerID = "";
            foreach (var item in FreelancerL)
            {
                string[] zstrSplit = item.Split(',');
                FreelancerID = zstrSplit[1] + ',' + FreelancerID;
            }
            FreelancerID = FreelancerID.TrimEnd(',');

            var zBkList = aDBManager.TBL_FreelanceBooks.SingleOrDefault(item => item.MainID == zBookID && item.TaskID == zTaskID);

            zBkList.SuggestedFreelancer = FreelancerID;
            zBkList.SuggestedCost = Convert.ToDecimal(zCost);
            zBkList.SuggestedVolume = zVolume;
            zBkList.SuggestedUnitType = zUnitType;
            zBkList.DueDate = Convert.ToDateTime(zDueDate);
            aDBManager.SaveChanges();


            string path = Server.MapPath(string.Format("~/Source/FreelanceSelection/{0}/{1}", zCatalog, zTask));
            string[] Filenames = null;
            if (Directory.Exists(path))
            {
                Filenames = Directory.GetFiles(path);

                if (Filenames.Length > 0)
                {
                    using (ZipFile zip = new ZipFile())
                    {
                        zip.AddFiles(Filenames, zCatalog + zTask);
                        zip.Save(Path.Combine(string.Format(path + "/{0}.zip", zCatalog + zTask)));

                    }
                }

            }
            var aBookData = aDBManager.SP_GetBookDetails(zBookID).ToList();

            if (aBookData.Count > 0)
            {
                var aLoginUserList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == nLoginID);

                var FromEmail = aLoginUserList.EmailID; //aBookData[0].PMEmail;
                var CCEmail = aBookData[0].TSPMEmailID;
                var BCCEmail = ""; //aBookData[0].TSPMEmailID;
                var aFreelancerList = aDBManager.SP_GetFreelancerofSelection(zBookID, zTaskID).ToList();
                string zGeneralMailBody = zMailBody;
                for (int i = 0; i < aFreelancerList.Count; i++)
                {
                    zMailBody = zGeneralMailBody.Replace("Freelancer Name", aFreelancerList[i].Name);

                    if (Filenames != null)
                    {
                        var mail = MailModels.Mail(
                                To: aFreelancerList[i].EmailID,
                                Cc: CCEmail,
                                Bcc: BCCEmail,
                                Subject: string.Format("{0} ({1})", zSubject, aBookData[0].Number),
                                Body: zMailBody,
                                attachFile: string.Format(path + "/{0}.zip", zCatalog + zTask),
                                From: FromEmail,
                                DisplayName: "SESAME"
                                );
                    }
                    else
                    {
                        var mail = MailModels.Mail(
                                                        To: aFreelancerList[i].EmailID,
                                                        Cc: CCEmail,
                                                        Bcc: BCCEmail,
                                                        Subject: zSubject,
                                                        Body: zMailBody,
                                                        From: FromEmail,
                                                        DisplayName: "SESAME"
                                                        );
                    }

                }

                zBkList.SuggestedMailDt = DateTime.Now;
                aDBManager.SaveChanges();
            }

            return Json("Freelancer details updated Successfully!", JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult SkipSelectionData(int zBookID, int zTaskID, string zCatalog)
        {

            try
            {
                var zBkList = aDBManager.TBL_FreelanceBooks.SingleOrDefault(item => item.MainID == zBookID && item.TaskID == zTaskID);
                zBkList.SuggestedMailDt = DateTime.Now;
                zBkList.SuggestionSkip = 1;
                zBkList.DueDate = DateTime.Now;
                aDBManager.SaveChanges();
                return Json("Book " + zCatalog + " Skipped Successfully...");
            }
            catch (Exception ex)
            {

                return Json("Error " + ex.Message);
            }
        }

        #endregion

        #region Freelacner Allocation

        public ActionResult Allocation()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            FreelanceModel aBkData = new FreelanceModel();
            aBkData.PublisherList = Common.GetPublisherList(false);
            aBkData.TaskList = Common.GetTaskList(false);
            aBkData.CatalogList = Common.GetCatalogList(nUserID, false);
            aBkData.NumberList = Common.GetNumberList(nUserID, false);
            aBkData.ISBNList = Common.GetISBNList(nUserID, false);
            return View(aBkData);
        }


        [HttpPost]
        public ActionResult GetAllocationBk(string FirstLoad, string CatalogList, string NumList,
                                            string ISBNList, string PublList, string TaskList, string zViewType)
        {

            try
            {
                int nUserID = int.Parse(Session["LoginID"].ToString());

                var aItemList = aDBManager.SP_GetFreelanceAllocationData(nUserID, zViewType).ToList();

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

                    aItemList = aItemList.Where(item => (iPublList.Contains(item.PublisherID.ToString()))).ToList();
                }
                if (TaskList != "All")
                {
                    var aTaskList = (TaskList != null ? TaskList.Split(',') : null);
                    string[] iTaskList = (aTaskList != null ? aTaskList.ToArray() : null);

                    aItemList = aItemList.Where(item => (iTaskList.Contains(item.TaskID.ToString()))).ToList();
                }

                List<SelectListItem> Catalogitems = new List<SelectListItem>();
                List<SelectListItem> ISBNitems = new List<SelectListItem>();
                List<SelectListItem> Numberitems = new List<SelectListItem>();
                if (FirstLoad == "true")
                {
                    var aCatList = aItemList.Select(item => new { item.Catalog }).Distinct().ToList();
                    foreach (var item in aCatList)
                    {

                        Catalogitems.Add(new SelectListItem()
                        {
                            Value = item.Catalog.ToString(),
                            Text = item.Catalog.ToString()

                        });

                    }
                    var aISBNList = aItemList.Select(item => new { item.ISBN }).Distinct().ToList();
                    foreach (var item in aISBNList)
                    {

                        ISBNitems.Add(new SelectListItem()
                        {
                            Value = item.ISBN.ToString(),
                            Text = item.ISBN.ToString()

                        });

                    }
                    var aNumList = aItemList.Select(item => new { item.Number }).Distinct().ToList();
                    foreach (var item in aNumList)
                    {

                        Numberitems.Add(new SelectListItem()
                        {
                            Value = item.Number.ToString(),
                            Text = item.Number.ToString()

                        });

                    }

                }

                return Json(new { aItemList, Catalogitems, ISBNitems, Numberitems }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }

        [HttpGet]
        public ActionResult GetAllocationChapters(int BookID, int TaskID, string FreelancerID, string aViewTab)
        {
            string[] FreelanceParts = FreelancerID.Split(',');
            List<SelectListItem> Freelanceritems = new List<SelectListItem>();

            if (FreelancerID == "")
            {
                var aFreelancerList = aDBManager.SP_GetAllFreelancerbyTaskID(BookID, TaskID).ToList();

                foreach (var item in aFreelancerList)
                {
                    Freelanceritems.Add(new SelectListItem()
                    {
                        Value = item.ID.ToString(),
                        Text = item.Name + "|" + item.EmailID

                    });
                }
            }
            else
            {
                var aFreelancerList = aDBManager.TBL_Freelancer_Master.Where(item => FreelanceParts.Contains(item.ID.ToString())).Select(item => new { item.Name, item.ID, item.EmailID }).ToList();
                foreach (var item in aFreelancerList)
                {
                    Freelanceritems.Add(new SelectListItem()
                    {
                        Value = item.ID.ToString(),
                        Text = item.Name + "|" + item.EmailID

                    });
                }
            }

            var aitemList = aDBManager.SP_GetFreelanceAllocationChapter(BookID, TaskID, aViewTab).ToList();

            // Check Book  wise or Chapter wise Entry Entered
            var aChapterEntryList = aDBManager.TBL_FreelanceSubMaster.Where(item => item.MainID == BookID && item.TaskID == TaskID && item.Number != "All");
            var aBookWiseEntry = aDBManager.TBL_FreelanceSubMaster.Where(item => item.MainID == BookID && item.TaskID == TaskID && item.Number == "All");

            return Json(new { aitemList, Freelanceritems, aChapterEntryList, aBookWiseEntry }, JsonRequestBehavior.AllowGet);

        }

        [HttpGet]
        public ActionResult GetAllocationBookDetails(int BookID, string aViewTab)
        {

            var aitemList = aDBManager.TBL_SubMaster.Where(item => item.MainID == BookID).GroupBy(e => e.MainID).ToList().Select(item => new { ChapterID = "All", Title = item.First().Title, MSPages = item.Sum(g => g.MSPages), PPages = item.Sum(g => g.ProofPages) }).ToList();

            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult UploadFolder()
        {
            try
            {
                string zCatalog = Request.Form.GetValues("Catalog")[0];
                string zTaskName = Request.Form.GetValues("TaskName")[0];
                string zChapter = Request.Form.GetValues("Chapter")[0];

                int nLoginID = int.Parse(Session["LoginID"].ToString());


                string zFolderName = string.Format("{0}_{1}_{2}_{3}", zCatalog, zChapter, zTaskName, nLoginID);
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
        public ActionResult DeleteTempFolder(string zCatalog, string zTaskName, string zChapter)
        {
            try
            {
                int nLoginID = int.Parse(Session["LoginID"].ToString());

                string zFolderName = string.Format("{0}_{1}_{2}_{3}", zCatalog, zChapter, zTaskName, nLoginID);
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

        public ActionResult DeleteTempFile(string zCatalog, string zTaskName, string zChapter, string zFileName)
        {
            try
            {
                int nLoginID = int.Parse(Session["LoginID"].ToString());

                string zFolderName = string.Format("{0}_{1}_{2}_{3}", zCatalog, zChapter, zTaskName, nLoginID);
                string zZipFolderL = Server.MapPath(string.Format("~/Source/OutSource/temp/{0}/{1}", zFolderName, zFileName));
                System.IO.File.Delete(zZipFolderL);
                return Json("File Delete Successfully");
            }
            catch (Exception)
            {
                return Json("");
            }

        }

        [HttpPost]
        public ActionResult FileUploadWithZip(int nBookID, int nTaskID, int nFLID, int nMSPages, int nTSPages,
            int nTotalPages, int nTotalWords, int nTotalTables, int nTotalFigures,
            string zDueDate, string zCatalog, string zTaskName, string zChapter)
        {
            DateTime dtDueDt = Convert.ToDateTime(zDueDate);

            int nLoginID = int.Parse(Session["LoginID"].ToString());

            string zZipFileName = string.Format("{0}_{1}_Allocate_{2}", zChapter, zTaskName, DateTime.Now.ToString("HHmmss"));

            string ztempPath = string.Format("{0}_{1}_{2}_{3}", zCatalog, zChapter, zTaskName, nLoginID);

            string zZipPath = Server.MapPath(string.Format("~/Source/OutSource/{0}", zCatalog));

            string zZipFolderL = Server.MapPath(string.Format("~/Source/OutSource/temp/{0}/", ztempPath));

            string aFileName = string.Format("{0}.zip", zZipFileName);

            var aItemList = aDBManager.SP_GetBookDetailsbyCatalog(zCatalog).ToList();

            DateTime aCorrectionDt = DateTime.Now;

            var aResultL = aDBManager.SP_FreelanceSubMaster_AddUpdate(nBookID, nTaskID, zChapter, nFLID, nMSPages, nTSPages,
                                                                    nTotalPages, nTotalWords, nTotalTables, nTotalFigures,
                                                                      dtDueDt, aFileName, nLoginID);

            int aResult = aResultL.SingleOrDefault(item => item.Value == item.Value).Value;
            if (aResult == 1)
            {
                Common.CreateZIP(zZipFolderL, aFileName, zZipPath);

                //After Allocation Chapter Notification Mail send to Freelancer 
                var aUserList = aDBManager.UserMasters.SingleOrDefault(item => item.FreelancerID == nFLID);

                var aLoginUserList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == nLoginID);

                string Mailbody = "";
                TBL_MailTemplate aMailTemp;
                if (zTaskName == "Copyediting")
                {
                    if (aItemList[0].Publisher.ToString().ToUpper() == "GEO")
                    {
                        aMailTemp = aDBManager.TBL_MailTemplate.SingleOrDefault(item => item.Template == "FreelanceAllocationGEO");
                    }
                    else
                    {
                        aMailTemp = aDBManager.TBL_MailTemplate.SingleOrDefault(item => item.Template == "FreelanceAllocation");
                    }

                }
                else
                {
                    aMailTemp = aDBManager.TBL_MailTemplate.SingleOrDefault(item => item.Template == "FreelanceOtherthanCE");
                }

                Mailbody = aMailTemp.MailContent;
                string AppUrl = Request.Url.AbsoluteUri.Replace(Request.Url.AbsolutePath, "") + Request.ApplicationPath;
                Mailbody = Mailbody
                    .Replace("{FreelancerName}", aUserList.LoginName)
                    .Replace("{UserName}", aUserList.LoginID)
                    .Replace("{Password}", Common.DecryptString(aUserList.Password))
                    .Replace("{DueDate}", zDueDate)
                    .Replace("{Link}", AppUrl)
                    .Replace("{PMName}", aLoginUserList.LoginName)
                    //.Replace("{PMName}", aItemList[0].TSPMEmailID)
                    .Replace("{PMEmail}", aLoginUserList.EmailID)
                    .Replace("{BookNo}", aItemList[0].Number)
                    .Replace("{Catalog}", aItemList[0].Catalog)
                    .Replace("{BookTitle}", aItemList[0].Title)
                    .Replace("{Task}", zTaskName)
                    ;

                //var mail = MailModels.Mail(
                //            From: aLoginUserList.EmailID,
                //            To: aUserList.EmailID,
                //            Cc: aLoginUserList.EmailID,
                //            Bcc: "",
                //            Subject: string.Format("{0} Available for {1}", zCatalog, zTaskName),
                //            Body: Mailbody,
                //            //From: From,
                //            DisplayName: aLoginUserList.LoginName
                //            );

                var mail = MailModels.Mail(
                            From: aLoginUserList.EmailID,//aItemList[0].TSPMEmailID,
                            To: aUserList.EmailID,
                            Cc: aLoginUserList.EmailID,
                            Bcc: "",
                            Subject: string.Format("{0} ({1}) Available for {2}", zCatalog, aItemList[0].Number, zTaskName),
                            Body: Mailbody,
                            //From: From,
                            DisplayName: aLoginUserList.LoginName
                            );


                return Json(zChapter, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(aResult, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult FreelancerAllocateDataEntry(int nBookID, int nTaskID, string zCatalog, int nFLID, string zTaskName, string zChapterList)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());


            string aFileName = string.Empty;
            string zDueDateL = string.Empty;

            var aItemList = aDBManager.SP_GetBookDetailsbyCatalog(zCatalog).ToList();
            List<object> aTask = JsonConvert.DeserializeObject<List<object>>(zChapterList);

            string zZipPath = Server.MapPath(string.Format("~/Source/OutSource/{0}", zCatalog));
            if (!Directory.Exists(zZipPath))
            {
                Directory.CreateDirectory(zZipPath);

            }

            int aResult = 0;
            foreach (var item in aTask.AsEnumerable())
            {
                JObject o = JObject.Parse(item.ToString());

                string zChapter = (string)o["Chapter"];
                int nMSPages = (int)o["MSPages"];
                int nTSPages = (int)o["TSPages"];
                int nTotalPages = (int)o["TotalPages"];
                int nTotalWords = (int)o["TotalWords"];
                int nTotalTables = (int)o["TotalTables"];
                int nTotalFigures = (int)o["TotalFigures"];
                DateTime dtDueDt = Convert.ToDateTime(o["DueDate"].ToString());

                zDueDateL = o["DueDate"].ToString();

                var aResultL = aDBManager.SP_FreelanceSubMaster_AddUpdate(nBookID, nTaskID, zChapter, nFLID, nMSPages, nTSPages,
                                                                        nTotalPages, nTotalWords, nTotalTables, nTotalFigures,
                                                                          dtDueDt, aFileName, nLoginID);

                aResult = aResultL.SingleOrDefault(i => i.Value == i.Value).Value;

            }

            if (aResult == 1)
            {

                //After Allocation Chapter Notification Mail send to Freelancer 
                var aUserList = aDBManager.UserMasters.SingleOrDefault(item => item.FreelancerID == nFLID);

                var aLoginUserList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == nLoginID);

                string Mailbody = "";
                TBL_MailTemplate aMailTemp;
                if (zTaskName == "Copyediting")
                {
                    if (aItemList[0].Publisher.ToString().ToUpper() == "GEO")
                    {
                        aMailTemp = aDBManager.TBL_MailTemplate.SingleOrDefault(item => item.Template == "FreelanceAllocationGEO");
                    }
                    else
                    {
                        aMailTemp = aDBManager.TBL_MailTemplate.SingleOrDefault(item => item.Template == "FreelanceAllocation");
                    }

                }
                else
                {
                    aMailTemp = aDBManager.TBL_MailTemplate.SingleOrDefault(item => item.Template == "FreelanceOtherthanCE");
                }

                Mailbody = aMailTemp.MailContent;
                string AppUrl = Request.Url.AbsoluteUri.Replace(Request.Url.AbsolutePath, "") + Request.ApplicationPath;
                Mailbody = Mailbody
                    .Replace("{FreelancerName}", aUserList.LoginName)
                    .Replace("{UserName}", aUserList.LoginID)
                    .Replace("{Password}", Common.DecryptString(aUserList.Password))
                    .Replace("{DueDate}", zDueDateL)
                    .Replace("{Link}", AppUrl)
                    .Replace("{PMName}", aLoginUserList.LoginName)
                    //.Replace("{PMName}", aItemList[0].TSPMEmailID)
                    .Replace("{PMEmail}", aLoginUserList.EmailID)
                    .Replace("{BookNo}", aItemList[0].Number)
                    .Replace("{Catalog}", aItemList[0].Catalog)
                    .Replace("{BookTitle}", aItemList[0].Title)
                    .Replace("{Task}", zTaskName)
                    ;

                var mail = MailModels.Mail(
                            From: aLoginUserList.EmailID,//aItemList[0].TSPMEmailID,
                            To: aUserList.EmailID,
                            Cc: aLoginUserList.EmailID,
                            Bcc: "",
                            Subject: string.Format("{0} ({1}) Available for {2}", zCatalog, aItemList[0].Number, zTaskName),
                            Body: Mailbody,
                            //From: From,
                            DisplayName: aLoginUserList.LoginName
                            );


                return Json("Uploaded Successfully..", JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(aResult, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult UpdateAllocationData(int nBookID, int nTaskID, string aActiveTab, string[] zChapterList, string zWithDrawRemarks)
        {
            string zResult = "";
            using (var dbcontext = new WMSEntities())
            {

                using (DbContextTransaction transaction = dbcontext.Database.BeginTransaction())
                {
                    try
                    {
                        foreach (var item in zChapterList)
                        {
                            string[] zstrSplit = item.Split(',');
                            string zChapterNo = zstrSplit[2].ToString();

                            if (aActiveTab == "Due Date Change")
                            {

                                string zDueDate = zstrSplit[10].ToString();
                                DateTime dtDueDate = Convert.ToDateTime(zDueDate);

                                var aitemList = dbcontext.TBL_FreelanceSubMaster.SingleOrDefault(i => i.MainID == nBookID
                                                                                                && i.TaskID == nTaskID
                                                                                                && i.Number == zChapterNo
                                                                                                && i.Withdrawn == 0);
                                aitemList.DueDate = dtDueDate;
                                dbcontext.SaveChanges();
                                zResult = "Due Date Changes updated Successfully";
                            }
                            else if (aActiveTab == "Withdrawn")
                            {
                                bool aIsWithdraw = Convert.ToBoolean(zstrSplit[11].ToString());//Check WithDrawn 
                                if (aIsWithdraw)
                                {
                                    var aitemList = dbcontext.TBL_FreelanceSubMaster.SingleOrDefault(i => i.MainID == nBookID
                                                                                                 && i.TaskID == nTaskID
                                                                                                 && i.Number == zChapterNo
                                                                                                 && i.Withdrawn == 0);
                                    aitemList.Withdrawn = 1;
                                    aitemList.WithdrawnRemarks = zWithDrawRemarks;
                                    dbcontext.SaveChanges();

                                }
                                zResult = "Withdraw Chapters updated Successfully";
                            }
                            else if (aActiveTab == "Manual Return")
                            {
                                string aCompleteDateL = zstrSplit[11].ToString();
                                if (aCompleteDateL != "")
                                {
                                    DateTime dtDueDate = Convert.ToDateTime(aCompleteDateL);
                                    var aitemList = dbcontext.TBL_FreelanceSubMaster.SingleOrDefault(i => i.MainID == nBookID
                                                                                                 && i.TaskID == nTaskID
                                                                                                 && i.Number == zChapterNo
                                                                                                 && i.Withdrawn == 0);
                                    aitemList.FinalDate = DateTime.Now;
                                    aitemList.FinalStatus = "Yes";
                                    aitemList.IsTransfer = 1;
                                    aitemList.FinalFileName = "Manual Return";
                                    dbcontext.SaveChanges();

                                }
                                zResult = "Manual Return Chapters updated Successfully";
                            }
                        }
                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        return Json(ex.Message, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            return Json(zResult, JsonRequestBehavior.AllowGet);

        }

        #endregion

        #region Freelance Tracking
        [CustomAuthorizeAttribute]
        public ActionResult FreelanceTracking()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            FreelanceModel aBkData = new FreelanceModel();
            aBkData.PublisherList = Common.GetPublisherList(false);
            aBkData.TaskList = Common.GetTaskList(false);
            aBkData.CatalogList = Common.GetCatalogList(nUserID, false);
            aBkData.NumberList = Common.GetNumberList(nUserID, false);
            aBkData.ISBNList = Common.GetISBNList(nUserID, false);
            return View(aBkData);
        }

        [HttpPost]
        public ActionResult GetFreelanceTrackingBk(string Search, string CatalogList, string NumList, string ISBNList, string PublList, string TaskList)
        {

            try
            {
                int nUserID = int.Parse(Session["LoginID"].ToString());

                var aItemList = aDBManager.SP_GetFreelanceBookTracking(nUserID).ToList();

                if (Search != "All")
                {
                    aItemList = aItemList.Where(item => item.Status == Search).ToList();
                }

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

                    aItemList = aItemList.Where(item => (iPublList.Contains(item.PublisherID.ToString()))).ToList();
                }
                if (TaskList != "All")
                {
                    var aTaskList = (TaskList != null ? TaskList.Split(',') : null);
                    string[] iTaskList = (aTaskList != null ? aTaskList.ToArray() : null);

                    aItemList = aItemList.Where(item => (iTaskList.Contains(item.TaskID.ToString()))).ToList();
                }


                return Json(new { aItemList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }


        #endregion

        #region Freelancer Inbox

        [CustomAuthorizeAttribute]
        public ActionResult Inbox()
        {

            return View();
        }

        [HttpPost]
        public ActionResult GetDashboard()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            var aDashboardL = aDBManager.SP_GetFreelancer_DashboardCount(nUserID).ToList();
            var aUploadSummaryL = aDBManager.SP_GetFreelancer_UploadedSummary(nUserID).ToList();

            var auserList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == nUserID);
            var aFreeItemL = aDBManager.TBL_Freelancer_Master.SingleOrDefault(item => item.ID == auserList.FreelancerID);

            return Json(new { aDashboardL, aUploadSummaryL, aFreeItemL }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult UpdateOOF(string zAvailable, string zFromDate, string zToDate, string zRemarks)
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());

            var auserList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == nUserID);
            var aFreeItemL = aDBManager.TBL_Freelancer_Master.SingleOrDefault(item => item.ID == auserList.FreelancerID);

            Nullable<DateTime> dtFrom = null;
            Nullable<DateTime> dtTo = null;
            if (zFromDate != "")
            {
                dtFrom = Convert.ToDateTime(zFromDate);
                dtTo = Convert.ToDateTime(zToDate);
            }

            aFreeItemL.Available = zAvailable;
            aFreeItemL.FromDate = dtFrom;
            aFreeItemL.ToDate = dtTo;
            aFreeItemL.AvailableRemarks = zRemarks;
            aDBManager.SaveChanges();

            return Json("Updated", JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult GetInboxList(string zType, string FromDate, string ToDate)
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());

            DateTime dtFrom = Convert.ToDateTime(FromDate);
            DateTime dtTo = Convert.ToDateTime(ToDate);

            var aItemList = aDBManager.sp_GetFreelancer_InboxList(nUserID).ToList();

            if (zType == "DueDate")
            {
                aItemList = aItemList.Where(item => item.DueDate >= dtFrom && item.DueDate <= dtTo).ToList();
            }
            else if (zType == "UploadDate")
            {
                aItemList = aItemList.Where(item => item.AllocationDate >= dtFrom && item.AllocationDate <= dtTo).ToList();
            }
            return Json(new { aItemList }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult GetReportDataList(string zType, string FromDate, string ToDate)
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());

            DateTime dtFrom = Convert.ToDateTime(FromDate);
            DateTime dtTo = Convert.ToDateTime(ToDate);

            var aItemList = aDBManager.sp_GetFreelancer_Report(nUserID).ToList();

            if (zType == "ReceivedDate")
            {
                aItemList = aItemList.Where(item => item.AllocationDate >= dtFrom && item.AllocationDate <= dtTo).ToList();
            }
            else if (zType == "DueDate")
            {
                aItemList = aItemList.Where(item => item.DueDate >= dtFrom && item.DueDate <= dtTo).ToList();
            }
            else if (zType == "DownloadDate")
            {
                aItemList = aItemList.Where(item => item.DownloadDate >= dtFrom && item.DownloadDate <= dtTo).ToList();
            }
            else if (zType == "UploadDate")
            {
                aItemList = aItemList.Where(item => item.FinalDate >= dtFrom && item.FinalDate <= dtTo).ToList();
            }

            return Json(new { aItemList }, JsonRequestBehavior.AllowGet);


        }

        [HttpPost]
        public ActionResult GetInvoiceDataList(string zType, string FromDate, string ToDate)
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());

            DateTime dtFrom = Convert.ToDateTime(FromDate);
            DateTime dtTo = Convert.ToDateTime(ToDate);

            var aItemList = aDBManager.sp_GetFreelancer_Invoice(nUserID).ToList();

            if (zType == "ReceivedDate")
            {
                aItemList = aItemList.Where(item => item.AllocationDate >= dtFrom && item.AllocationDate <= dtTo).ToList();
            }
            else if (zType == "DueDate")
            {
                aItemList = aItemList.Where(item => item.DueDate >= dtFrom && item.DueDate <= dtTo).ToList();
            }
            else if (zType == "DownloadDate")
            {
                aItemList = aItemList.Where(item => item.DownloadDate >= dtFrom && item.DownloadDate <= dtTo).ToList();
            }
            else if (zType == "UploadDate")
            {
                aItemList = aItemList.Where(item => item.FinalDate >= dtFrom && item.FinalDate <= dtTo).ToList();
            }

            return Json(new { aItemList }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult UpdateInvoiceData(int ID, int TotalPages, int TotalWords, int TotalTables, int TotalFigures)
        {

            int nUserID = int.Parse(Session["LoginID"].ToString());
            var zItemList = aDBManager.TBL_FreelanceSubMaster.SingleOrDefault(item => item.ID == ID);
            zItemList.TotalPages = TotalPages;
            zItemList.TotalWords = TotalWords;
            zItemList.TotalTables = TotalTables;
            zItemList.TotalFigures = TotalFigures;
            zItemList.IsInvoiced = 1;
            zItemList.UpdatedBy = nUserID;
            zItemList.UpdatedTime = DateTime.Now;
            aDBManager.SaveChanges();

            var TaskID = zItemList.TaskID;
            var Chapter = zItemList.Number;
            var FreelancerID = zItemList.FreelancerID;

            var zItemTask = aDBManager.TBL_Freelancer_Task.SingleOrDefault(item => item.SNo == TaskID);
            var TaskName = zItemTask.TaskName;

            var zItemFreelancer = aDBManager.TBL_Freelancer_Master.SingleOrDefault(item => item.ID == FreelancerID);
            var FreelancerName = zItemFreelancer.Name;
            var FreelancerEmail = zItemFreelancer.EmailID;

            var MainID = zItemList.MainID;
            var zItemBook = aDBManager.SP_GetBookDetails(MainID).ToList();
            var Catalog = zItemBook[0].Catalog;
            var TSPMEmail = zItemBook[0].TSPMEmailID;
            string AppUrl = Request.Url.AbsoluteUri.Replace(Request.Url.AbsolutePath, "") + Request.ApplicationPath;
            string Mailbody = "";
            Mailbody += "<table style='padding-left:10px;'>";
            Mailbody += "<tr><td>";
            Mailbody += "Hi,<br><br>";
            Mailbody += "<b>" + FreelancerName + "</b> generated invoice for " + TaskName + " for " + Catalog + " (" + Chapter + " Chapter).<br><br>";
            Mailbody += "You can download report from <a href='" + AppUrl + "' target=_blank'>Sesame</a><br><br>";
            Mailbody += "***This is an automatically generated email, please do not reply ***";
            Mailbody += "</td></tr>";
            Mailbody += "</table>";

            var mail = MailModels.Mail(
                                   To: TSPMEmail,
                                   Cc: FreelancerEmail,
                                   Bcc: "",
                                   Subject: string.Format("Sesame - Outsource Invoice - {0}({1}) - {2} : {3}", Catalog, zItemBook[0].Number, TaskName, Chapter),
                                   Body: Mailbody,
                                   //From: From,
                                   DisplayName: "SESAME"
                                   );


            return Json("Updated Invoice Details !");

        }

        [HttpPost]
        public ActionResult FreelancerInvExcel(int ID, int TotalPages, int TotalWords, int TotalTables, int TotalFigures)
        {
            try
            {

                decimal? PageTCost = 0;
                decimal? WordTCost = 0;
                decimal? TableTCost = 0;
                decimal? FigureTCost = 0;

                Common.CheckDirectory(Server.MapPath("~/Source/FreelanceInvoice/"));

                var zItemList = aDBManager.TBL_FreelanceSubMaster.SingleOrDefault(item => item.ID == ID);
                var FreelancerID = zItemList.FreelancerID;
                var TaskID = zItemList.TaskID;
                var MainID = zItemList.MainID;
                var Chapter = zItemList.Number;

                var zItemFreelancer = aDBManager.TBL_Freelancer_Master.SingleOrDefault(item => item.ID == FreelancerID);
                var FreelancerName = zItemFreelancer.Name;
                var FreelancerEmail = zItemFreelancer.EmailID;

                var zItemTask = aDBManager.TBL_Freelancer_Task.SingleOrDefault(item => item.SNo == TaskID);
                var TaskName = zItemTask.TaskName;

                var zItemBook = aDBManager.SP_GetBookDetails(MainID).ToList();
                var Catalog = zItemBook[0].Catalog;
                var TSPMEmail = zItemBook[0].TSPMEmailID;
                var BookNo = zItemBook[0].Number;

                var zItemPrice = aDBManager.TBL_Freelancer_TaskPrice.SingleOrDefault(item => item.FreelancerID == FreelancerID && item.TaskID == TaskID);
                var PagePrice = zItemPrice.Price == null ? 0 : zItemPrice.Price;
                var PageCapacity = zItemPrice.Capacity == null ? 0 : zItemPrice.Capacity;
                var WordPrice = zItemPrice.WordPrice == null ? 0 : zItemPrice.WordPrice;
                var WordCapacity = zItemPrice.WordCapacity == null ? 0 : zItemPrice.WordCapacity;
                var TablePrice = zItemPrice.TablePrice == null ? 0 : zItemPrice.TablePrice;
                var TableCapacity = zItemPrice.TableCapacity == null ? 0 : zItemPrice.TableCapacity;
                var FigurePrice = zItemPrice.FigurePrice == null ? 0 : zItemPrice.FigurePrice;
                var FigureCapacity = zItemPrice.FigureCapacity == null ? 0 : zItemPrice.FigureCapacity;


                string excelpath = "";
                excelpath = Server.MapPath("~/Source/FreelanceInvoice/" + Catalog.Trim() + "_" + Chapter + "_" + TaskName + ".xlsx");
                if (System.IO.File.Exists(excelpath))
                {
                    System.IO.File.Delete(excelpath);
                }
                FileInfo finame = new FileInfo(excelpath);
                ExcelPackage epExport = new ExcelPackage(finame);
                ExcelWorksheet ewsDetails = epExport.Workbook.Worksheets.Add("texst");
                //ewsDetails.Column(1).Width = 28;
                //ewsDetails.Column(2).Width = 46;
                //ewsDetails.Column(3).Width = 38;
                //ewsDetails.Column(4).Width = 20;
                using (ExcelRange range = ewsDetails.Cells["A1:I1"])
                {
                    range.Style.Font.Bold = true;
                    range.Merge = true;
                    range.Style.Font.Name = "Calibri";
                    range.Style.Font.Size = 18;
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Top.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Left.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Right.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Bottom.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(185, 223, 233));
                }

                ewsDetails.Cells["A1"].Value = "Invoice ";

                ewsDetails.Cells["A2"].Value = "Cat ID";
                ewsDetails.Cells["B2"].Value = "Book ID";
                ewsDetails.Cells["C2"].Value = "Chapter";
                //ewsDetails.Cells["D2"].Value = "Name/Email";
                using (ExcelRange range = ewsDetails.Cells["D2:I2"])
                {
                    range.Merge = true;
                    range.Value = "Vendor Name/Email";
                }
                using (ExcelRange range = ewsDetails.Cells["A2:I2"])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Font.Name = "Calibri";
                    range.Style.Font.Size = 12;
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(233, 194, 193));
                }
                ewsDetails.Cells["A3"].Value = Catalog;
                ewsDetails.Cells["B3"].Value = BookNo;
                ewsDetails.Cells["C3"].Value = Chapter;
                using (ExcelRange range = ewsDetails.Cells["D3:I3"])
                {
                    range.Merge = true;
                    range.Value = FreelancerName + "/" + FreelancerEmail;
                }



                using (ExcelRange range = ewsDetails.Cells["A5:B5"])
                {
                    range.Merge = true;
                    range.Style.Font.Bold = true;
                    range.Style.Font.Name = "Calibri";
                    range.Style.Font.Size = 12;
                    range.Value = "Pages";
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Top.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Left.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Right.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Bottom.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(196, 215, 155));
                }
                ewsDetails.Cells["A6"].Value = "Count";
                ewsDetails.Cells["A7"].Value = TotalPages;
                ewsDetails.Cells["B6"].Value = "Cost (" + PagePrice.ToString() + " per " + PageCapacity.ToString() + ")";
                if (PageCapacity != 0)
                {
                    ewsDetails.Cells["B7"].Value = (TotalPages * PagePrice) / PageCapacity;
                    PageTCost = ((TotalPages * PagePrice) / PageCapacity);
                }
                else
                {
                    ewsDetails.Cells["B7"].Value = "0";
                    PageTCost = 0;
                }



                using (ExcelRange range = ewsDetails.Cells["C5:D5"])
                {
                    range.Merge = true;
                    range.Style.Font.Bold = true;
                    range.Style.Font.Name = "Calibri";
                    range.Style.Font.Size = 12;
                    range.Value = "Word Count";
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Top.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Left.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Right.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Bottom.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(196, 215, 155));
                }
                ewsDetails.Cells["C6"].Value = "Count";
                ewsDetails.Cells["C7"].Value = TotalWords;
                ewsDetails.Cells["D6"].Value = "Cost (" + WordPrice.ToString() + " per " + WordCapacity.ToString() + ")";

                if (WordCapacity != 0)
                {
                    ewsDetails.Cells["D7"].Value = (TotalWords * WordPrice) / WordCapacity;
                    WordTCost = (TotalWords * WordPrice) / WordCapacity;
                }
                else
                {
                    ewsDetails.Cells["D7"].Value = "0";
                    WordTCost = 0;
                }


                using (ExcelRange range = ewsDetails.Cells["E5:F5"])
                {
                    range.Merge = true;
                    range.Style.Font.Bold = true;
                    range.Style.Font.Name = "Calibri";
                    range.Style.Font.Size = 12;
                    range.Value = "Tables";
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Top.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Left.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Right.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Bottom.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(196, 215, 155));
                }
                ewsDetails.Cells["E6"].Value = "Count";
                ewsDetails.Cells["E7"].Value = TotalTables;
                ewsDetails.Cells["F6"].Value = "Cost (" + TablePrice.ToString() + " per " + TableCapacity.ToString() + ")";

                if (TableCapacity != 0)
                {
                    ewsDetails.Cells["F7"].Value = (TotalTables * TablePrice) / TableCapacity;
                    TableTCost = (TotalTables * TablePrice) / TableCapacity;
                }
                else
                {
                    ewsDetails.Cells["F7"].Value = "0";
                    TableTCost = 0;
                }

                using (ExcelRange range = ewsDetails.Cells["G5:H5"])
                {
                    range.Merge = true;
                    range.Style.Font.Bold = true;
                    range.Style.Font.Name = "Calibri";
                    range.Style.Font.Size = 12;
                    range.Value = "Figures";
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Top.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Left.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Right.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Bottom.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(196, 215, 155));
                }
                ewsDetails.Cells["G6"].Value = "Count";
                ewsDetails.Cells["G7"].Value = TotalFigures;
                ewsDetails.Cells["H6"].Value = "Cost (" + FigurePrice.ToString() + " per " + FigureCapacity.ToString() + ")";

                if (FigureCapacity != 0)
                {
                    ewsDetails.Cells["H7"].Value = (TotalFigures * FigurePrice) / FigureCapacity;
                    FigureTCost = (TotalFigures * FigurePrice) / FigureCapacity;
                }
                else
                {
                    ewsDetails.Cells["H7"].Value = "0";
                    FigureTCost = 0;
                }

                ewsDetails.Cells["I5"].Value = "Total";
                ewsDetails.Cells["I7"].Value = PageTCost + WordTCost + TableTCost + FigureTCost;

                using (ExcelRange range = ewsDetails.Cells["A5:I6"])
                {
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(221, 235, 247));
                }


                using (ExcelRange range = ewsDetails.Cells["A5:I7"])
                {

                    range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Top.Color.SetColor(System.Drawing.Color.Green);
                    range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Left.Color.SetColor(System.Drawing.Color.Green);
                    range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Right.Color.SetColor(System.Drawing.Color.Green);
                    range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Bottom.Color.SetColor(System.Drawing.Color.Green);
                }
                using (ExcelRange range = ewsDetails.Cells["A2:I3"])
                {
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Top.Color.SetColor(System.Drawing.Color.Green);
                    range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Left.Color.SetColor(System.Drawing.Color.Green);
                    range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Right.Color.SetColor(System.Drawing.Color.Green);
                    range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Bottom.Color.SetColor(System.Drawing.Color.Green);
                }

                using (ExcelRange range = ewsDetails.Cells["A1:I7"])
                {
                    range.AutoFitColumns();
                }

                epExport.Save();
                byte[] fileBytes = System.IO.File.ReadAllBytes(excelpath);
                string fileName = Catalog.Trim() + "_" + Chapter + "_" + TaskName + ".xlsx";
                return Json(fileName, JsonRequestBehavior.AllowGet);

            }
            catch (Exception ex)
            {

                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult DownloadFile(string zID)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());

            var aIDList = (zID != null ? zID.Split(',') : null);
            string[] iProofList = (aIDList != null ? aIDList.ToArray() : null);

            var zItemList = aDBManager.TBL_FreelanceSubMaster.Where(item => (aIDList.Contains(item.ID.ToString()))).ToList();
            int nBookID = int.Parse(zItemList[0].MainID.ToString());
            var zBookList = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == nBookID);

            string zZipFileName = string.Format("{0}_{1}_{2}", zBookList.Number, zBookList.Catalog, DateTime.Now.ToString("HHmmss"));

            string zZipFolderL = Server.MapPath(string.Format("~/Source/OutSource/{0}/Download/{1}", zBookList.Catalog, zZipFileName));

            Common.CheckDirectory(zZipFolderL);
            string aFileName = string.Format("{0}.zip", zZipFileName);

            foreach (var item in zItemList)
            {
                string zFilePath = Server.MapPath(string.Format("~/Source/OutSource/{0}/{1}", zBookList.Catalog, item.FileName));
                string aFileNameL = item.FileName;


                FileInfo fi = new FileInfo(zFilePath);
                fi.CopyTo(zZipFolderL + @"\" + aFileNameL, true);

                var aItemList = aDBManager.TBL_FreelanceSubMaster.SingleOrDefault(item1 => item1.ID == item.ID);
                aItemList.DownloadDate = (aItemList.DownloadDate == null ? DateTime.Now : aItemList.DownloadDate);
                aDBManager.SaveChanges();
            }

            CreateZIP(zZipFolderL, zZipFileName, zZipFileName);

            string zZilFileName = string.Format("{0}.zip", zZipFolderL);
            byte[] fileBytes = System.IO.File.ReadAllBytes(zZilFileName);

            return File(fileBytes, System.Net.Mime.MediaTypeNames.Application.Octet, aFileName);


        }
        [HttpPost]

        public ActionResult FreeLancerDeleteTempFile(string zID, string zFileName)
        {
            try
            {
                int nLoginID = int.Parse(Session["LoginID"].ToString());

                var aIDList = (zID != null ? zID.Split(',') : null);
                string[] iProofList = (aIDList != null ? aIDList.ToArray() : null);

                var zItemList = aDBManager.TBL_FreelanceSubMaster.Where(item => (aIDList.Contains(item.ID.ToString()))).ToList();
                int nBookID = int.Parse(zItemList[0].MainID.ToString());
                var zBookList = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == nBookID);

                string zFolderName = string.Format("{0}_Login_{1}", zBookList.Number, nLoginID);
                string zZipFolderL = Server.MapPath(string.Format("~/Source/OutSource/{0}/Upload/temp/{1}/{2}", zBookList.Catalog, zFolderName, zFileName));
                System.IO.File.Delete(zZipFolderL);
                return Json("File Delete Successfully");
            }
            catch (Exception)
            {
                return Json("");
            }

        }

        [HttpPost]
        public ActionResult FreeLancerDeleteTempFolder(string zID)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());
            try
            {
                var aIDList = (zID != null ? zID.Split(',') : null);
                string[] iProofList = (aIDList != null ? aIDList.ToArray() : null);

                var zItemList = aDBManager.TBL_FreelanceSubMaster.Where(item => (aIDList.Contains(item.ID.ToString()))).ToList();
                int nBookID = int.Parse(zItemList[0].MainID.ToString());
                var zBookList = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == nBookID);

                string zFolderName = string.Format("{0}_Login_{1}", zBookList.Number, nLoginID);
                string zZipFolderL = Server.MapPath(string.Format("~/Source/OutSource/{0}/Upload/temp/{1}", zBookList.Catalog, zFolderName));
                Common.DeleteDirectory(zZipFolderL);
                return Json("File delete Successfully");
            }
            catch (Exception)
            {

                return Json("File delete Successfully");
            }

        }

        [HttpPost]
        public ActionResult FreeLancerUploadFolder()
        {
            try
            {
                string zID = Request.Form.GetValues("ID")[0];
                int nLoginID = int.Parse(Session["LoginID"].ToString());

                var aIDList = (zID != null ? zID.Split(',') : null);
                string[] iIDList = (aIDList != null ? aIDList.ToArray() : null);

                var zItemList = aDBManager.TBL_FreelanceSubMaster.Where(item => (iIDList.Contains(item.ID.ToString()))).ToList();
                int nBookID = int.Parse(zItemList[0].MainID.ToString());
                var zBookList = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == nBookID);

                string zFolderName = string.Format("{0}_Login_{1}", zBookList.Number, nLoginID);
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
                            string zPath = Server.MapPath(string.Format("~/Source/OutSource/{0}/Upload/temp/{1}", zBookList.Catalog, zFolderName));
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
        public ActionResult FreelancerFileUploadWithZip(string zID)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());

            var aUserList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == nLoginID);


            var aIDList = (zID != null ? zID.Split(',') : null);
            string[] iIDList = (aIDList != null ? aIDList.ToArray() : null);

            var zItemList = aDBManager.TBL_FreelanceSubMaster.Where(item => (iIDList.Contains(item.ID.ToString()))).ToList();
            int nBookID = int.Parse(zItemList[0].MainID.ToString());
            var zBookList = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == nBookID);


            string zZipFileName = string.Format("{0}_Upload_{1}", zBookList.Catalog, DateTime.Now.ToString("HHmmss"));

            string zFolderName = string.Format("{0}_Login_{1}", zBookList.Number, nLoginID);

            string ztempFolderL = Server.MapPath(string.Format("~/Source/OutSource/{0}/Upload/temp/{1}", zBookList.Catalog, zFolderName));

            string zZipFolderL = Server.MapPath(string.Format("~/Source/OutSource/{0}/Upload", zBookList.Catalog));

            string aFileName = string.Format("{0}.zip", zZipFileName);

            Common.CreateZIP(ztempFolderL, aFileName, zZipFolderL);

            DateTime aUploadDt = DateTime.Now;
            zItemList.ForEach(item =>
            {
                item.FinalDate = aUploadDt;
                item.FinalFileName = aFileName;
                item.FinalStatus = "Yes";

            });
            aDBManager.SaveChanges();

            string zChapterList = "";
            foreach (var item in zItemList)
            {
                var aTaskList = aDBManager.TBL_Freelancer_Task.SingleOrDefault(i => i.SNo == item.TaskID);
                zChapterList += string.Format("Chapter No. : {0} , Task Name : {1} </br>", item.Number, aTaskList.TaskName);
            }
            if (zChapterList != "")
            {
                int nMailSentIDL = int.Parse(zItemList[0].MailSentUserID.ToString());
                var zMailSentList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == nMailSentIDL);

                string Mailbody = zChapterList;
                var mail = MailModels.Mail(
                            To: zMailSentList.EmailID,//zBookList.PMEmail,
                            Cc: aUserList.EmailID,
                            Bcc: "",
                            Subject: string.Format("{0} ({1}) Uploaded", zBookList.Catalog, zBookList.Number),
                            Body: Mailbody,
                            //From: From,
                            DisplayName: "SESAME"
                            );
            }
            return Json(nBookID, JsonRequestBehavior.AllowGet);


        }
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

        #region "Freelancer Settings"

        [CustomAuthorizeAttribute]
        public ActionResult FreelanceSettings()
        {
            FreelanceModel aBkData = new FreelanceModel();
            aBkData.TaskList = Common.GetTaskList(false);
            return View(aBkData);
        }

        [HttpGet]
        public ActionResult GetLoadDataList(int nTaskID)
        {
            var aPublisherList = aDBManager.SP_FreelancerBooking_List(nTaskID);

            var aStageList = aDBManager.TBL_BookStages.ToList();

            var aProcessList = aDBManager.TBL_Process.Where(item => item.ProcessGroup == "Book").ToList();

            return Json(new { aPublisherList, aStageList, aProcessList }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult UpdateSettings(int nTaskID, string[] zPublisherList)
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            using (var dbcontext = new WMSEntities())
            {

                using (DbContextTransaction transaction = dbcontext.Database.BeginTransaction())
                {
                    try
                    {
                        foreach (var item in zPublisherList)
                        {
                            string[] zstrSplit = item.Split(',');

                            int nPublisherID = int.Parse(zstrSplit[1].ToString());
                            string zDownloadpath = zstrSplit[7];
                            byte aSkipSelection = Convert.ToByte(zstrSplit[8] == "false" ? 0 : 1);
                            byte aNextBooking = Convert.ToByte(zstrSplit[3] == "" || zstrSplit[3] == "0" || zstrSplit[3] == "No" ? 0 : 1);

                            var zFBkList = dbcontext.TBL_FreelanceBooking.SingleOrDefault(itemL => itemL.TaskID == nTaskID && itemL.PublisherID == nPublisherID);
                            if (zFBkList == null)
                            {
                                if (zDownloadpath != null && zDownloadpath != "")
                                {
                                    dbcontext.TBL_FreelanceBooking.Add(new TBL_FreelanceBooking()
                                    {
                                        TaskID = nTaskID,
                                        PublisherID = nPublisherID,
                                        NextBooking = aNextBooking,
                                        NextBookingStage = zstrSplit[4],
                                        NextBookingStatus = zstrSplit[5],
                                        NewNo = zstrSplit[6],
                                        DownloadPath = zstrSplit[7],
                                        SkipSelection = aSkipSelection,
                                        UpdatedBy = nUserID.ToString(),
                                        UpdatedTime = DateTime.Now,
                                    });
                                    dbcontext.SaveChanges();
                                }
                            }
                            else
                            {
                                if (zDownloadpath != null && zDownloadpath != "")
                                {
                                    zFBkList.NextBooking = aNextBooking;
                                    zFBkList.NextBookingStage = zstrSplit[4];
                                    zFBkList.NextBookingStatus = zstrSplit[5];
                                    zFBkList.NewNo = zstrSplit[6];
                                    zFBkList.DownloadPath = zstrSplit[7];
                                    zFBkList.SkipSelection = aSkipSelection;
                                    zFBkList.UpdatedBy = nUserID.ToString();
                                    zFBkList.UpdatedTime = DateTime.Now;
                                    dbcontext.SaveChanges();
                                }
                                else
                                {
                                    IEnumerable<TBL_FreelanceBooking> alist = dbcontext.TBL_FreelanceBooking
                                                                                       .Where(itemL => itemL.TaskID == nTaskID
                                                                                       && itemL.PublisherID == nPublisherID).ToList();
                                    dbcontext.TBL_FreelanceBooking.RemoveRange(alist);
                                    dbcontext.SaveChanges();
                                }
                            }
                        }
                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        return Json(ex.Message, JsonRequestBehavior.AllowGet);
                    }
                }
            }

            return Json("Settings Updated Successfully");

        }


        [HttpPost]
        public ActionResult AddFileupload()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            string zFileNameList = string.Empty;
            int aPublisher = int.Parse(Request["Publisher"]);
            int aTask = int.Parse(Request["Task"]);

            if (Request.Files.Count > 0)
            {
                string fname = "";
                try
                {
                    HttpFileCollectionBase files = Request.Files;
                    for (int i = 0; i < files.Count; i++)
                    {

                        HttpPostedFileBase file = files[i];
                        if (Request.Browser.Browser.ToUpper() == "IE" || Request.Browser.Browser.ToUpper() == "INTERNETEXPLORER")
                        {
                            string[] testfiles = file.FileName.Split(new char[] { '\\' });
                            fname = testfiles[testfiles.Length - 1];
                        }
                        else
                        {
                            fname = file.FileName;
                        }
                        zFileNameList = string.Format("{0},{1}", fname, zFileNameList);
                        string zPlacePathL = Server.MapPath(string.Format("~/Source/FreelanceGuideLine/{0}/{1}", aPublisher, aTask));
                        Common.CheckDirectory(zPlacePathL);
                        fname = Path.Combine(zPlacePathL, fname);
                        file.SaveAs(fname);

                    }
                    // Update GuideLine File list in Table
                    if (zFileNameList != string.Empty)
                    {
                        var zFBkList = aDBManager.TBL_FreelanceBooking.SingleOrDefault(itemL => itemL.TaskID == aTask && itemL.PublisherID == aPublisher);
                        if (zFBkList == null)
                        {
                            aDBManager.TBL_FreelanceBooking.Add(new TBL_FreelanceBooking()
                            {
                                TaskID = aTask,
                                PublisherID = aPublisher,
                                NextBooking = 0,
                                SkipSelection = 0,
                                GuideLine = zFileNameList,
                                UpdatedBy = nUserID.ToString(),
                                UpdatedTime = DateTime.Now,
                            });
                            aDBManager.SaveChanges();
                        }
                        else
                        {
                            zFBkList.GuideLine = zFileNameList;
                            zFBkList.UpdatedBy = nUserID.ToString();
                            zFBkList.UpdatedTime = DateTime.Now;
                            aDBManager.SaveChanges();
                        }
                    }

                    return Json("Success", JsonRequestBehavior.AllowGet);
                }
                catch (Exception ex)
                {
                    return Json("Error occurred. Error details: " + ex.Message, JsonRequestBehavior.AllowGet);
                }
            }

            else
            {
                return Json("No files selected.", JsonRequestBehavior.AllowGet);
            }


        }

        [HttpGet]
        public ActionResult DeleteAddFile(int nPublisher, int nTask, string zFileNameP)
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            string zFilePath = Server.MapPath(string.Format("~/Source/FreelanceGuideLine/{0}/{1}/{2}", nPublisher, nTask, zFileNameP));

            if (System.IO.File.Exists(zFilePath))
            {
                System.IO.File.Delete(zFilePath);

                // Remove Deleted file name from GuideList in Table
                var zFBkList = aDBManager.TBL_FreelanceBooking.SingleOrDefault(itemL => itemL.TaskID == nTask && itemL.PublisherID == nPublisher);
                if (zFBkList != null)
                {
                    string aUpdateList = zFBkList.GuideLine.Replace(zFileNameP, "");
                    zFBkList.GuideLine = aUpdateList;
                    zFBkList.UpdatedBy = nUserID.ToString();
                    zFBkList.UpdatedTime = DateTime.Now;
                    aDBManager.SaveChanges();
                }
            }
            return Json("File Deleted", JsonRequestBehavior.AllowGet);
        }


        #endregion

    }
}

public class Freelancermaster : TBL_Freelancer_Master
{
    public string aTaskListL { get; set; }
}