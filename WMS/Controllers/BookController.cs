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

    public class BookController : Controller
    {
        // GET: Book
        WMSEntities aDBManager1 = new WMSEntities();
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
            BookModels aBkData = new BookModels();
            //aBkData.PublisherList = Common.GetPublisherList(false);
            //aBkData.CatalogList = Common.GetCatalogList(nUserID, false);
            //aBkData.NumberList = Common.GetNumberList(nUserID, false);
            //aBkData.ISBNList = Common.GetISBNList(nUserID, false);
            return View(aBkData);
        }
        public ActionResult Manipulation()
        {
            BookModels aBkData = new BookModels();
            aBkData.PublisherList = GetPublisherList(true);
            aBkData.CatalogList = GetCatalogList(true);
            aBkData.PEList = GetPEList(true);
            aBkData.PMList = GetPMList(true);
            aBkData.WorkflowList = GetWorkFlowList(true);
            aBkData.Subject = GetSubjectList(true);
            aBkData.EditionList = GetEditionList(true);
            aBkData.OutsourceList = GetOutsourceList(true);
            aBkData.ProcessList = GetProcessList(true);
            aBkData.CategoryList = GetCategoryList(true);
            aBkData.PlatformList = GetPlatformList(true);
            int bookIDP = int.Parse(Request.QueryString["id"].ToString());
            List<TBL_MainMaster> aReportDataL;

            aReportDataL = aDBManager1.TBL_MainMaster.Where(item => (item.ID == bookIDP)).ToList();
            aBkData.BookList = aReportDataL;
            if (bookIDP != 0)
            {
                aBkData.PublisherID = int.Parse(aReportDataL[0].PublisherID.ToString());
            }


            return View(aBkData);
        }

        public ActionResult NewBook()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            BookModels aBkData = new BookModels();
            aBkData.PublisherList = GetPublisherList(false);
            aBkData.CatalogList = GetCatalogList(false);

            var aReportDataL = from B in aDBManager1.SP_GetNewBookList(nUserID)
                               select new NewList
                               {
                                   Book_Number = B.Number,
                                   Book_ID = B.ID,
                                   Book_Title = B.Title,
                                   Book_Img = B.ImgPath,
                                   Book_ISBN = B.ISBN,
                                   Book_PEName = B.PEName,
                                   Book_Catalog = B.Catalog,
                                   Book_ReceivedDt = B.ReceivedDt,
                                   Book_Day = B.BookingDay,
                                   Book_Publisher = B.Publisher
                               };


            aBkData.NewBookList = aReportDataL.ToList();

            return View(aBkData);
        }

        public List<SelectListItem> GetPublisherList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager1.Publishers.Where(item => (item.Publ_Status == null) || (item.Publ_Status == false)).Select(item => new { item.Publ_Acronym, item.Publ_ID }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.Publ_ID.ToString(),
                    Text = item.Publ_Acronym.ToUpper()

                });
            }
            return items;
        }
        public List<SelectListItem> GetPEList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager1.UserMasters.Where(item => (item.UserType == "PE") && (item.ActiveStatus == "Active")).Select(item => new { item.LoginName, item.UserID }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.UserID.ToString(),
                    Text = item.LoginName

                });
            }
            return items;
        }

        public List<SelectListItem> GetPMList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager1.UserMasters.Where(item => ((item.UserType == "PM") || (item.UserType == "Manager")) && (item.ActiveStatus == "Active") && (item.LoginName != "Admin")).Select(item => new { item.LoginName, item.UserID }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.UserID.ToString(),
                    Text = item.LoginName

                });
            }
            return items;
        }
        public List<SelectListItem> GetWorkFlowList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager1.TBL_WorkFlowList.Where(item => (item.IsDeleted == 0)).Select(item => new { item.ID, item.WorkFlowName }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.ID.ToString(),
                    Text = item.WorkFlowName.ToString()

                });
            }
            return items;
        }

        public List<SelectListItem> GetSubjectList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager1.TBL_Subject.Select(item => new { item.ID, item.Subject }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.Subject.ToString(),
                    Text = item.Subject.ToString()

                });
            }
            return items;
        }

        public List<SelectListItem> GetEditionList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager1.TBL_Edition.Select(item => new { item.ID, item.Edition }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.Edition.ToString(),
                    Text = item.Edition.ToString()

                });
            }
            return items;
        }
        public List<SelectListItem> GetOutsourceList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager1.TBL_Freelancer_Task.Select(item => new { item.SNo, item.TaskName }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.SNo.ToString(),
                    Text = item.TaskName.ToString()

                });
            }
            return items;
        }
        public List<SelectListItem> GetProcessList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager1.TBL_ProcessType.Select(item => new { item.SNo, item.ProcessName }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.ProcessName.ToString(),
                    Text = item.ProcessName.ToString()

                });
            }
            return items;
        }


        public List<SelectListItem> GetCategoryList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager1.TBL_Category.Select(item => new { item.SNo, item.Category }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.Category.ToString(),
                    Text = item.Category.ToString()

                });
            }
            return items;
        }

        public List<SelectListItem> GetPlatformList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager1.TBL_Platform.Select(item => new { item.SNo, item.Platform }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.Platform.ToString(),
                    Text = item.Platform.ToString()

                });
            }
            return items;
        }

        public List<SelectListItem> GetCatalogList(bool awithAllC = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager1.TBL_MainMaster.Where(item => (item.PMName.ToString() != null) && (item.PMName.ToString() != "")).Select(item => new { item.Catalog }).ToList();
            if (awithAllC)
                items.Add(new SelectListItem { Text = "All", Value = "All" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.Catalog == null ? string.Empty : item.Catalog,
                    Text = item.Catalog == null ? string.Empty : item.Catalog

                });
            }

            return items;
        }

        public List<SelectListItem> GetISBNList(bool awithAllC = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager1.TBL_MainMaster.Where(item => (item.PMName.ToString() != null) && (item.PMName.ToString() != "")).Select(item => new { item.ISBN }).ToList();
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
            var aitemList = aDBManager1.TBL_MainMaster.Where(item => (item.PMName.ToString() != null) && (item.PMName.ToString() != "")).Select(item => new { item.Number }).ToList();
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

        public ActionResult GetOutsourceListByPublisher(string PublisherID)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();

            var aitemList = from B in aDBManager1.TBL_Freelancer_Task
                            join PE in aDBManager1.TBL_FreelanceBooking on B.SNo.ToString() equals PE.TaskID.ToString() into gj
                            from subset in gj.DefaultIfEmpty().Where(item => item.PublisherID.ToString() == PublisherID)
                            select new OutSourceList
                            {
                                SNo = B.SNo,
                                TaskName = B.TaskName
                            };
            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.SNo.ToString(),
                    Text = item.TaskName.ToString()

                });
            }
            return Json(items);
        }

        [HttpPost]
        public ActionResult UploadCover()
        {
            foreach (string upload in Request.Files)
            {
                if (Request.Files[upload].FileName != "")
                {
                    string path = AppDomain.CurrentDomain.BaseDirectory + "/Images/Covers/";
                    string filename = Path.GetFileName(Request.Files[upload].FileName);
                    Request.Files[upload].SaveAs(Path.Combine(path, filename));
                }
            }
            return Json("true");
        }

        [HttpPost]
        public ActionResult GetBookDetails(int zBookID)
        {
            try
            {
                var aItemList = aDBManager1.SP_GetBookDetails(zBookID).ToList();
                var aPlanningListL = aDBManager1.SP_GetBookPlanningDetails(zBookID).ToList();
                var aChapterList = aDBManager1.TBL_SubMaster.Where(item => item.MainID.ToString() == zBookID.ToString()).ToList();

                DataTable adtList = new DataTable();
                adtList = Common.ToDataTable(aPlanningListL);
                var aPlanningList = Common.ReScheduleDetails(adtList).ToList().OrderBy(item => item.ScheduleDate);

                var aSurveyList = aDBManager1.TBL_Survey.Where(item => item.BookID == zBookID).ToList();

                return Json(new { aItemList, aPlanningList, aSurveyList, aChapterList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }

        [HttpPost]
        public ActionResult GetBookData(int zBookID)
        {
            List<TBL_MainMaster> aReportDataL;
            aReportDataL = aDBManager1.TBL_MainMaster.Where(item => (item.ID == zBookID)).ToList();

            var aSurveyList = aDBManager1.TBL_Survey.Where(item => item.BookID == zBookID).ToList();



            string json = "";
            try
            {
                json = JsonConvert.SerializeObject(aReportDataL, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });

            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }


            return Json(new { json, aSurveyList }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetHolidaysData()
        {

            var aReportDataL = aDBManager1.Holidays.Where(item => item.Leave_Date.Year >= DateTime.Today.Year).Select(item => new { item.Leave_Date }).ToList();
            string json = "";
            try
            {
                json = JsonConvert.SerializeObject(aReportDataL, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });

            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

            return Json(json, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetData(string Type, string CatalogList, string NumList, string ISBNList, string PublList, string aType)
        {

            try
            {
                int nUserID = int.Parse(Session["LoginID"].ToString());

                var aItemList = aDBManager1.SP_GetBookData(nUserID, Type, "Master").OrderBy(item => item.Number).ToList();

                // Filter Added Billed and Withdrwan List
                if (aType == "withdrawn" && Type == "WIP")
                {
                    aItemList = aDBManager1.SP_GetBookData(nUserID, "ADVANCE", "Master").ToList();
                    aItemList = aItemList.Where(item => item.IsDeleted == 1).ToList();
                }
                else if (aType == "billed" && Type == "WIP")
                {
                    aItemList = aDBManager1.SP_GetBookData(nUserID, "ADVANCE", "Master").ToList();
                    aItemList = aItemList.Where(item => item.Billed == 1).ToList();
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

                    aItemList = aItemList.Where(item => (iPublList.Contains(item.Publisher.ToString()))).ToList();
                }




                return Json(new { aItemList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }


        [HttpGet]
        public ActionResult CheckExistingData(string ValueData, string zType, string ZID)
        {
            bool ifExist = false;
            try
            {

                var items = aDBManager1.TBL_MainMaster.ToList();
                if (zType == "Catalog")
                {
                    items = aDBManager1.TBL_MainMaster.Where(x => x.ID.ToString() != ZID && x.Catalog == ValueData).ToList();
                }
                else if ((zType == "ISBN") || (zType == "EbookISBN") || (zType == "WebISBN") || (zType == "EPubISBN") || (zType == "MobiISBN") || (zType == "PBISBN"))
                {
                    items = aDBManager1.TBL_MainMaster.Where(x => x.ID.ToString() != ZID && (x.ISBN == ValueData || x.EbookISBN == ValueData || x.EpubISBN == ValueData || x.MobiISBN == ValueData || x.WebISBN == ValueData || x.PBISBN == ValueData)).ToList();
                }

                ifExist = items.Count == 0 ? true : false;

                return Json(!ifExist, JsonRequestBehavior.AllowGet);

            }

            catch (Exception ex)
            {
                return Json(false, JsonRequestBehavior.AllowGet);

            }

        }

        [HttpPost]
        public ActionResult GetCatalogCheck(string zCatalog, string zID)
        {
            try
            {
                var aReportDataL = aDBManager1.TBL_MainMaster.Where(item => (item.ID.ToString() != zID) && (item.Catalog.ToString() == zCatalog)).ToList();

                if (aReportDataL.Count > 0)
                {
                    return Json("Yes");
                }
                else
                {
                    return Json("No");
                }

            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }
        }

        [HttpPost]
        public ActionResult GetWithdrawnData(string zBookID)
        {
            try
            {
                var aWithdrawnList = aDBManager1.TBL_History.Where(item => (item.ColumnID.ToString() == zBookID) && ((item.ColumnName.ToString() == "WithdrawReason") || (item.ColumnName.ToString() == "RevertReason"))).OrderBy(item => item.ModifiedDt).ToList();

                return Json(new { aWithdrawnList }, JsonRequestBehavior.AllowGet);

            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }
        }


        [HttpPost]
        [ValidateInput(false)]
        public ActionResult BookInfoUpdate(TBL_MainMaster aobjP)
        {

            int nUserID = int.Parse(Session["LoginID"].ToString());
            var aUserItem = aDBManager1.UserMasters.SingleOrDefault(item => item.UserID == nUserID);
            string OutSource = "";

            try
            {
                if (aobjP.ID != 0)
                {

                    var aSubList = aDBManager1.TBL_Subject.Where(i => i.Subject.ToString() == aobjP.Subject.ToString()).ToList();
                    if (aSubList.Count == 0)
                    {
                        TBL_Subject asubj = new TBL_Subject();
                        asubj.Subject = aobjP.Subject.ToString();
                        aDBManager1.TBL_Subject.Add(asubj);
                        aDBManager1.SaveChanges();
                    }

                    var aEDList = aDBManager1.TBL_Edition.Where(i => i.Edition.ToString() == aobjP.Edition.ToString()).ToList();
                    if (aEDList.Count == 0)
                    {
                        TBL_Edition aEDj = new TBL_Edition();
                        aEDj.Edition = aobjP.Edition.ToString();
                        aDBManager1.TBL_Edition.Add(aEDj);
                        aDBManager1.SaveChanges();
                    }

                    var aPrList = aDBManager1.TBL_ProcessType.Where(i => i.ProcessName.ToString() == aobjP.Workflow.ToString()).ToList();
                    if (aPrList.Count == 0)
                    {
                        TBL_ProcessType aPRj = new TBL_ProcessType();
                        aPRj.ProcessName = aobjP.Workflow.ToString();
                        aPRj.CreatedBy = nUserID;
                        aPRj.CreatedTime = DateTime.Now;
                        aDBManager1.TBL_ProcessType.Add(aPRj);
                        aDBManager1.SaveChanges();
                    }

                    var aCatList = aDBManager1.TBL_Category.Where(i => i.Category.ToString() == aobjP.Category.ToString()).ToList();
                    if (aCatList.Count == 0)
                    {
                        TBL_Category aPRj = new TBL_Category();
                        aPRj.Category = aobjP.Category.ToString();
                        aPRj.CreatedBy = nUserID;
                        aPRj.CreatedTime = DateTime.Now;
                        aDBManager1.TBL_Category.Add(aPRj);
                        aDBManager1.SaveChanges();
                    }

                    var aPlatformList = aDBManager1.TBL_Platform.Where(i => i.Platform.ToString() == aobjP.Platform.ToString()).ToList();
                    if (aPlatformList.Count == 0)
                    {
                        TBL_Platform aPRj = new TBL_Platform();
                        aPRj.Platform = aobjP.Platform.ToString();
                        aPRj.CreatedBy = nUserID;
                        aPRj.CreatedTime = DateTime.Now;
                        aDBManager1.TBL_Platform.Add(aPRj);
                        aDBManager1.SaveChanges();
                    }

                    if (aobjP.Outsource != null)
                    {
                        string[] aout = aobjP.Outsource.ToString().Split(',');
                        foreach (var outitems in aout)
                        {
                            var aOutList = aDBManager1.TBL_Freelancer_Task.Where(i => i.SNo.ToString() == outitems.ToString()).ToList();

                            if (aOutList.Count == 0)
                            {
                                //try
                                //{
                                //    TBL_Freelancer_Task aouJ = new TBL_Freelancer_Task();
                                //    aouJ.TaskName = outitems;
                                //    aouJ.CreatedBy = nUserID;
                                //    aouJ.CreatedTime = DateTime.Now;
                                //    aDBManager1.TBL_Freelancer_Task.Add(aouJ);
                                //    aDBManager1.SaveChanges();
                                //}
                                //catch (Exception ex)
                                //{

                                //}


                                var aOutSuccessList = aDBManager1.TBL_Freelancer_Task.Where(i => i.TaskName.ToString() == outitems.ToString()).ToList();

                                if (aOutSuccessList.Count > 0)
                                {
                                    OutSource = OutSource + aOutSuccessList[0].SNo + ',';
                                }

                            }
                            else
                            {
                                OutSource = OutSource + outitems + ',';
                            }
                        }

                    }
                    aobjP.Outsource = OutSource.Trim(',');
                    var aitemList = aDBManager1.TBL_MainMaster.Single(item => item.ID == aobjP.ID);
                    var PMName = aitemList.PMName.ToString();
                    aitemList.Title = (aobjP.Title == null ? aitemList.Title : aobjP.Title);
                    aitemList.Catalog = (aobjP.Catalog == null ? aitemList.Catalog : aobjP.Catalog);
                    aitemList.ISBN = (aobjP.ISBN == null ? aitemList.ISBN : aobjP.ISBN);
                    aitemList.Platform = (aobjP.Platform == null ? aitemList.Platform : aobjP.Platform);
                    aitemList.AuthorName = (aobjP.AuthorName == null ? aitemList.AuthorName : aobjP.AuthorName);
                    aitemList.AuthorEmail = (aobjP.AuthorEmail == null ? aitemList.AuthorEmail : aobjP.AuthorEmail);
                    aitemList.EditorName = (aobjP.EditorName == null ? aitemList.EditorName : aobjP.EditorName);
                    aitemList.EditorEmail = (aobjP.EditorEmail == null ? aitemList.EditorEmail : aobjP.EditorEmail);
                    aitemList.PEName = (aobjP.PEName == null ? aitemList.PEName : aobjP.PEName);
                    aitemList.PMName = (aobjP.PMName == null ? aitemList.PMName : aobjP.PMName);
                    aitemList.SeriesTitle = (aobjP.SeriesTitle == null ? aitemList.SeriesTitle : aobjP.SeriesTitle);
                    aitemList.SubTitle = (aobjP.SubTitle == null ? aitemList.SubTitle : aobjP.SubTitle);
                    aitemList.UploadType = (aobjP.UploadType == null ? aitemList.UploadType : aobjP.UploadType);
                    aitemList.Category = (aobjP.Category == null ? aitemList.Category : aobjP.Category);
                    aitemList.Subject = (aobjP.Subject == null ? aitemList.Subject : aobjP.Subject);
                    aitemList.Edition = (aobjP.Edition == null ? aitemList.Edition : aobjP.Edition);
                    aitemList.Workflow = (aobjP.Workflow == null ? aitemList.Workflow : aobjP.Workflow);
                    aitemList.TSPM = (aobjP.TSPM == null ? aitemList.TSPM : aobjP.TSPM);
                    aitemList.ImgPath = (aobjP.ImgPath == null ? aitemList.ImgPath : aobjP.ImgPath);
                    aitemList.ReceivedDt = (aobjP.ReceivedDt == null ? aitemList.ReceivedDt : aobjP.ReceivedDt);
                    aitemList.DueDt = (aobjP.DueDt == null ? aitemList.DueDt : aobjP.DueDt);
                    aitemList.EbookISBN = (aobjP.EbookISBN == null ? aitemList.EbookISBN : aobjP.EbookISBN);
                    aitemList.WebISBN = (aobjP.WebISBN == null ? aitemList.WebISBN : aobjP.WebISBN);
                    aitemList.EpubISBN = (aobjP.EpubISBN == null ? aitemList.EpubISBN : aobjP.EpubISBN);
                    aitemList.MobiISBN = (aobjP.MobiISBN == null ? aitemList.MobiISBN : aobjP.MobiISBN);
                    aitemList.PBISBN = (aobjP.PBISBN == null ? aitemList.PBISBN : aobjP.PBISBN);
                    aitemList.SeriesEditorName = (aobjP.SeriesEditorName == null ? aitemList.SeriesEditorName : aobjP.SeriesEditorName);
                    aitemList.Outsource = (aobjP.Outsource == null ? aitemList.Outsource : aobjP.Outsource);
                    aitemList.PublisherID = (aobjP.PublisherID == null ? aitemList.PublisherID : aobjP.PublisherID);
                    aitemList.Notes = (aobjP.Notes == null ? aitemList.Notes : aobjP.Notes);
                    aitemList.SkipPA = aobjP.SkipPA;

                    aitemList.CreatedTime = DateTime.Now;
                    aitemList.UpdatedTime = DateTime.Now;
                    aitemList.UpdatedBy = nUserID.ToString();
                    aDBManager1.SaveChanges();
                    //var aitemListL = aDBManager.SP_UserLogin(aitemList.LoginID, aitemList.Password).ToList();
                    //Session["UserData"] = JsonConvert.SerializeObject(aitemListL, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });

                    if (OutSource.Trim() != "")
                    {
                        string[] aout = aobjP.Outsource.ToString().Split(',');
                        foreach (var outitems in aout)
                        {
                            var aFBookList = aDBManager1.TBL_FreelanceBooks.Where(i => i.MainID.ToString() == aobjP.ID.ToString() && i.TaskID.ToString() == outitems.ToString()).ToList();

                            var aFBooking = aDBManager1.TBL_FreelanceBooking.Where(i => i.TaskID.ToString() == outitems && i.PublisherID == aobjP.PublisherID).ToList();

                            if (aFBookList.Count == 0)
                            {
                                TBL_FreelanceBooks aouJ = new TBL_FreelanceBooks();
                                aouJ.MainID = aobjP.ID;
                                aouJ.TaskID = int.Parse(outitems);

                                if (aFBooking.Count > 0)
                                {
                                    if (aFBooking[0].SkipSelection == 1)
                                    {
                                        aouJ.SuggestedMailDt = DateTime.Now;
                                        aouJ.SuggestionSkip = 1;
                                        aouJ.DueDate = DateTime.Now;
                                    }
                                }


                                aDBManager1.TBL_FreelanceBooks.Add(aouJ);
                                aDBManager1.SaveChanges();
                            }

                        }
                    }

                    if (PMName != "" && PMName != "0" && PMName != null)
                    {

                        List<UserMaster> aUserDataL;

                        aUserDataL = aDBManager1.UserMasters.Where(item => item.UserID == aobjP.PMName).ToList();

                        PMName = aUserDataL[0].LoginName.ToString();

                        var PEName = "";
                        var PEEmail = "";

                        var TSPMName = "";
                        var TSPMEmail = "";

                        if (aobjP.PEName != null)
                        {
                            aUserDataL = aDBManager1.UserMasters.Where(item => item.UserID == aobjP.PEName).ToList();
                            PEName = aUserDataL[0].LoginName;
                            PEEmail = aUserDataL[0].EmailID;
                        }

                        if (aobjP.TSPM != null)
                        {
                            aUserDataL = aDBManager1.UserMasters.Where(item => item.UserID == aobjP.TSPM).ToList();
                            TSPMName = aUserDataL[0].LoginName;
                            TSPMEmail = aUserDataL[0].EmailID;
                        }

                        var Publ = "";

                        if (aobjP.PublisherID != null)
                        {
                            List<Publisher> aPublisher = aDBManager1.Publishers.Where(item => item.Publ_ID == aobjP.PublisherID).ToList();
                            Publ = aPublisher[0].Publ_Acronym;
                        }

                        List<TBL_MainMaster> aReportDataL;

                        aReportDataL = aDBManager1.TBL_MainMaster.Where(item => item.ID == aobjP.ID).ToList();

                        var aBookNumber = aReportDataL[0].Number;

                        string zTitleL = aobjP.Title.Replace("'", "''");
                        string zNotesL = (aobjP.Notes == null ? null : aobjP.Notes.Replace("'", "''"));
                        string zSeriesTitleL = (aobjP.SeriesTitle == null ? null : aobjP.SeriesTitle.Replace("'", "''"));

                        TBL_Signaldetails tblSignal = new TBL_Signaldetails();
                        string strReceived = aobjP.ReceivedDt.HasValue ? aobjP.ReceivedDt.Value.ToString("yyyy-MM-dd") : null;
                        string strDue = aobjP.DueDt.HasValue ? aobjP.DueDt.Value.ToString("yyyy-MM-dd") : null;
                        tblSignal.Description = "UPDATE Books SET Book_Title ='" + zTitleL + "' , Book_Received= '" + strReceived + "', Book_TargetedPubDate='" + strDue + "', Book_CompletionDate='" + strDue + "', Book_Publisher='" + Publ + "', Book_PublID=(SELECT Publ_ID FROM Publishers WHERE Book='Yes' and Publ_Acronym='" + Publ + "'), Book_Catalog='" + aobjP.Catalog + "', Book_ISBN='" + aobjP.ISBN + "', Book_Platform='" + aobjP.Platform + "', Book_AuthorName='" + aobjP.AuthorName + "', Book_AuthorEditorName='" + aobjP.AuthorName + "', Book_AuthorEdtorEmail='" + aobjP.AuthorEmail + "', Book_EditorName='" + aobjP.EditorName + "', Book_EditorEmail='" + aobjP.EditorEmail + "', Book_ProjectManager='" + PMName + "', Book_ProdEditor_Name='" + PEName + "', Book_ProdEditor_Email='" + PEEmail + "', Book_Notes='" + zNotesL + "', Book_SeriesTitle='" + zSeriesTitleL + "', Book_ProcessType='" + aobjP.UploadType + "', Book_Type='" + aobjP.Category + "', Book_TSPM='" + TSPMName + "', Book_EbkISBN='" + aobjP.EbookISBN + "', Book_WebPDFISBN='" + aobjP.WebISBN + "', Book_EPubISBN='" + aobjP.EpubISBN + "', Book_MobiISBN='" + aobjP.MobiISBN + "' WHERE  Book_Number ='" + aBookNumber + "'";
                        tblSignal.IsSynch = 0;
                        tblSignal.UpdatedTime = DateTime.Now;
                        tblSignal.Type = "Query";
                        aDBManager1.TBL_Signaldetails.Add(tblSignal);
                        aDBManager1.SaveChanges();


                        string Mailbody = "";
                        Mailbody += "<table border='1' cellpadding='0' cellspacing='0' style='font-family: calibri;background-color:InactiveBorder' width='700px'>";
                        Mailbody += "<tr><td colspan=2 align='center'>Book Information</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Book No</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aBookNumber + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Publisher</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + Publ + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Title</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Title + "</td></tr>";
                        if (aobjP.SubTitle != "" && aobjP.SubTitle != null)
                        {
                            Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Sub Title</td>";
                            Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.SubTitle + "</td></tr>";
                        }
                        if (aobjP.SeriesTitle != "" && aobjP.SeriesTitle != null)
                        {
                            Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Series Title</td>";
                            Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.SeriesTitle + "</td></tr>";
                        }
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Edition</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Edition + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'> Workflow Type</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Workflow + "</td></tr>";
                        //Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Author</td>";
                        //Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.AuthorName + "</td></tr>";
                        if (aobjP.AuthorName != "" && aobjP.AuthorName != null)
                        {
                            Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Author</td>";
                            Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.AuthorName + "</td></tr>";
                        }
                        if (aobjP.EditorName != "" && aobjP.EditorName != null)
                        {
                            Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Editor</td>";
                            Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.EditorName + "</td></tr>";
                        }
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Catalog No</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Catalog + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>ISBN </td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.ISBN + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Project Manager</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + PMName + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>TSFM</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + TSPMName + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>PE Name</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + PEName + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Platform</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Platform + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Received</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.ReceivedDt + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Due</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.DueDt + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Type</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Category + "</td></tr>";


                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Updated By</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aUserItem.LoginName + "</td></tr>";


                        Mailbody += "</table>";
                        Mailbody += "<br><br>*** This is an automatically generated email, please do not reply ***";

                        if (aUserItem.LoginName.ToLower() != "admin")
                        {
                            var mail = MailModels.Mail(
                                        //To: "books_ti@novatechset.com",
                                        //Cc: "shashi@novatechset.com;tandfbooks@novatechset.com;",
                                        To: TSPMEmail,
                                        Cc: "",
                                        Bcc: "",
                                        Subject: "Modified Book Info - " + aBookNumber,
                                        Body: Mailbody,
                                        //From: From,
                                        DisplayName: "SESAME"
                                        );
                        }

                    }
                    else
                    {
                        List<UserMaster> aUserDataL;

                        aUserDataL = aDBManager1.UserMasters.Where(item => item.UserID == aobjP.PMName).ToList();


                        PMName = aUserDataL[0].LoginName;

                        var PEName = "";
                        var PEEmail = "";

                        var TSPMName = "";

                        if (aobjP.PEName != null)
                        {
                            aUserDataL = aDBManager1.UserMasters.Where(item => item.UserID == aobjP.PEName).ToList();
                            PEName = aUserDataL[0].LoginName;
                            PEEmail = aUserDataL[0].EmailID;
                        }

                        if (aobjP.TSPM != null)
                        {
                            aUserDataL = aDBManager1.UserMasters.Where(item => item.UserID == aobjP.TSPM).ToList();
                            TSPMName = aUserDataL[0].LoginName;
                        }

                        var Publ = "";

                        if (aobjP.PublisherID != null)
                        {
                            List<Publisher> aPublisher = aDBManager1.Publishers.Where(item => item.Publ_ID == aobjP.PublisherID).ToList();
                            Publ = aPublisher[0].Publ_Acronym;
                        }

                        List<TBL_MainMaster> aReportDataL;

                        aReportDataL = aDBManager1.TBL_MainMaster.Where(item => item.ID == aobjP.ID).ToList();

                        var aBookNumber = aReportDataL[0].Number;

                        TBL_Signaldetails tblSignal = new TBL_Signaldetails();
                        string strReceived = aobjP.ReceivedDt.HasValue ? aobjP.ReceivedDt.Value.ToString("yyyy-MM-dd") : null;
                        string strDue = aobjP.DueDt.HasValue ? aobjP.DueDt.Value.ToString("yyyy-MM-dd") : null;

                        string zTitleL = aobjP.Title.Replace("'", "''");
                        string zNotesL = (aobjP.Notes == null ? null : aobjP.Notes.Replace("'", "''"));
                        string zSeriesTitleL = (aobjP.SeriesTitle == null ? null : aobjP.SeriesTitle.Replace("'", "''"));

                        tblSignal.Description = "INSERT INTO Books (Book_Number, Book_Title, Book_Received, Book_TargetedPubDate, Book_CompletionDate, Book_Publisher, Book_PublID, Book_Catalog, Book_ISBN, Book_Platform, Book_AuthorName, Book_AuthorEditorName, Book_AuthorEdtorEmail, Book_EditorName, Book_EditorEmail, Book_ProjectManager, Book_ProdEditor_Name, Book_ProdEditor_Email, Book_Notes, Book_SeriesTitle, Book_ProcessType, Book_Type, Book_TSPM, Book_EbkISBN, Book_WebPDFISBN, Book_EPubISBN, Book_MobiISBN) VALUES ('" + aBookNumber + "','" + zTitleL + "','" + strReceived + "','" + strDue + "','" + strDue + "', '" + Publ + "',(SELECT Publ_ID FROM Publishers WHERE Book='Yes' and Publ_Acronym='" + Publ + "'),'" + aobjP.Catalog + "','" + aobjP.ISBN + "','" + aobjP.Platform + "','" + aobjP.AuthorName + "','" + aobjP.AuthorName + "','" + aobjP.AuthorEmail + "','" + aobjP.EditorName + "','" + aobjP.EditorEmail + "','" + PMName + "','" + PEName + "', '" + PEEmail + "','" + zNotesL + "','" + zSeriesTitleL + "','" + aobjP.UploadType + "','" + aobjP.Category + "','" + TSPMName + "','" + aobjP.EbookISBN + "','" + aobjP.WebISBN + "','" + aobjP.EpubISBN + "','" + aobjP.MobiISBN + "')";
                        tblSignal.IsSynch = 0;
                        tblSignal.UpdatedTime = DateTime.Now;
                        tblSignal.Type = "Query";
                        aDBManager1.TBL_Signaldetails.Add(tblSignal);
                        aDBManager1.SaveChanges();

                        string Mailbody = "";
                        Mailbody += "<table border='1' cellpadding='0' cellspacing='0' style='font-family: calibri;background-color:InactiveBorder' width='700px'>";
                        Mailbody += "<tr><td colspan=2 align='center'>Book Information</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Book No</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aBookNumber + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Publisher</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + Publ + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Title</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Title + "</td></tr>";

                        if (aobjP.SubTitle != "" && aobjP.SubTitle != null)
                        {
                            Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Sub Title</td>";
                            Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.SubTitle + "</td></tr>";
                        }
                        if (aobjP.SeriesTitle != "" && aobjP.SeriesTitle != null)
                        {
                            Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Series Title</td>";
                            Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.SeriesTitle + "</td></tr>";
                        }

                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Edition</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Edition + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'> Workflow Type</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Workflow + "</td></tr>";
                        //Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Author</td>";
                        //Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.AuthorName + "</td></tr>";
                        if (aobjP.AuthorName != "" && aobjP.AuthorName != null)
                        {
                            Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Author</td>";
                            Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.AuthorName + "</td></tr>";
                        }
                        if (aobjP.EditorName != "" && aobjP.EditorName != null)
                        {
                            Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Editor</td>";
                            Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.EditorName + "</td></tr>";
                        }
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Catalog No</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Catalog + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>ISBN </td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.ISBN + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Project Manager</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + PMName + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>TSFM</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + TSPMName + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>PE Name</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + PEName + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Platform</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Platform + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Received</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.ReceivedDt + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Due</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.DueDt + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Type</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Category + "</td></tr>";


                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Booked By</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aUserItem.LoginName + "</td></tr>";


                        Mailbody += "</table>";
                        Mailbody += "<br><br>*** This is an automatically generated email, please do not reply ***";

                        if (aUserItem.LoginName.ToLower() != "admin")
                        {
                            var mail = MailModels.Mail(
                                    To: "books_ti@novatechset.com",
                                    Cc: "girish@novatechset.com;tandfbooks@novatechset.com;shashi@novatechset.com",
                                    Bcc: "",
                                    Subject: "New Book Info - " + aBookNumber,
                                    Body: Mailbody,
                                    //From: From,
                                    DisplayName: "SESAME"
                                    );
                        }
                    }

                }
                else
                {

                    var aSubList = aDBManager1.TBL_Subject.Where(i => i.Subject.ToString() == aobjP.Subject.ToString()).ToList();
                    if (aSubList.Count == 0)
                    {
                        TBL_Subject asubj = new TBL_Subject();
                        asubj.Subject = aobjP.Subject.ToString();
                        aDBManager1.TBL_Subject.Add(asubj);
                        aDBManager1.SaveChanges();
                    }

                    var aEDList = aDBManager1.TBL_Edition.Where(i => i.Edition.ToString() == aobjP.Edition.ToString()).ToList();
                    if (aEDList.Count == 0)
                    {
                        TBL_Edition aEDj = new TBL_Edition();
                        aEDj.Edition = aobjP.Edition.ToString();
                        aDBManager1.TBL_Edition.Add(aEDj);
                        aDBManager1.SaveChanges();
                    }
                    var aPrList = aDBManager1.TBL_ProcessType.Where(i => i.ProcessName.ToString() == aobjP.Workflow.ToString()).ToList();
                    if (aPrList.Count == 0)
                    {
                        TBL_ProcessType aPRj = new TBL_ProcessType();
                        aPRj.ProcessName = aobjP.Workflow.ToString();
                        aPRj.CreatedBy = nUserID;
                        aPRj.CreatedTime = DateTime.Now;
                        aDBManager1.TBL_ProcessType.Add(aPRj);
                        aDBManager1.SaveChanges();
                    }

                    var aCatList = aDBManager1.TBL_Category.Where(i => i.Category.ToString() == aobjP.Category.ToString()).ToList();
                    if (aCatList.Count == 0)
                    {
                        TBL_Category aPRj = new TBL_Category();
                        aPRj.Category = aobjP.Category.ToString();
                        aPRj.CreatedBy = nUserID;
                        aPRj.CreatedTime = DateTime.Now;
                        aDBManager1.TBL_Category.Add(aPRj);
                        aDBManager1.SaveChanges();
                    }

                    var aPlatformList = aDBManager1.TBL_Platform.Where(i => i.Platform.ToString() == aobjP.Platform.ToString()).ToList();
                    if (aPlatformList.Count == 0)
                    {
                        TBL_Platform aPRj = new TBL_Platform();
                        aPRj.Platform = aobjP.Platform.ToString();
                        aPRj.CreatedBy = nUserID;
                        aPRj.CreatedTime = DateTime.Now;
                        aDBManager1.TBL_Platform.Add(aPRj);
                        aDBManager1.SaveChanges();
                    }


                    if (aobjP.Outsource != null)
                    {
                        string[] aout = aobjP.Outsource.ToString().Split(',');
                        foreach (var outitems in aout)
                        {
                            var aOutList = aDBManager1.TBL_Freelancer_Task.Where(i => i.SNo.ToString() == outitems.ToString()).ToList();

                            if (aOutList.Count == 0)
                            {
                                //try
                                //{
                                //    TBL_Freelancer_Task aouJ = new TBL_Freelancer_Task();
                                //    aouJ.TaskName = outitems;
                                //    aouJ.CreatedBy = nUserID;
                                //    aouJ.CreatedTime = DateTime.Now;
                                //    aDBManager1.TBL_Freelancer_Task.Add(aouJ);
                                //    aDBManager1.SaveChanges();
                                //}
                                //catch (Exception ex)
                                //{

                                //}


                                var aOutSuccessList = aDBManager1.TBL_Freelancer_Task.Where(i => i.TaskName.ToString() == outitems.ToString()).ToList();

                                if (aOutSuccessList.Count > 0)
                                {
                                    OutSource = OutSource + aOutSuccessList[0].SNo + ',';
                                }
                            }
                            else
                            {
                                OutSource = OutSource + outitems + ',';
                            }
                        }
                    }
                    aobjP.Outsource = OutSource.Trim(',');
                    aobjP.CreatedTime = DateTime.Now;
                    aobjP.UpdatedTime = DateTime.Now;
                    List<TBL_MainMaster> aReportDataL;

                    aReportDataL = aDBManager1.TBL_MainMaster.Where(item => item.Number != null).OrderByDescending(item => item.Number).ToList();

                    var aBookNumber = int.Parse(aReportDataL[0].Number) + 1;
                    aobjP.Number = aBookNumber.ToString();
                    aobjP.UpdatedBy = nUserID.ToString();
                    aobjP.CreatedBy = nUserID.ToString(); ;
                    aDBManager1.TBL_MainMaster.Add(aobjP);
                    aDBManager1.SaveChanges();

                    if (OutSource.Trim() != "")
                    {
                        string[] aout = aobjP.Outsource.ToString().Split(',');
                        var aExisBook = aDBManager1.TBL_MainMaster.Where(item => item.Number != aBookNumber.ToString()).OrderByDescending(item => item.ID).ToList();
                        if (aExisBook.Count > 0)
                        {
                            foreach (var outitems in aout)
                            {
                                var aFBookList = aDBManager1.TBL_FreelanceBooks.Where(i => i.MainID.ToString() == aobjP.ID.ToString() && i.TaskID.ToString() == outitems.ToString()).ToList();
                                var aFBooking = aDBManager1.TBL_FreelanceBooking.Where(i => i.TaskID.ToString() == outitems && i.PublisherID == aobjP.PublisherID).ToList();
                                if (aFBookList.Count == 0)
                                {
                                    TBL_FreelanceBooks aouJ = new TBL_FreelanceBooks();
                                    aouJ.MainID = aExisBook[0].ID;
                                    aouJ.TaskID = int.Parse(outitems);

                                    if (aFBooking.Count > 0)
                                    {
                                        if (aFBooking[0].SkipSelection == 1)
                                        {
                                            aouJ.SuggestedMailDt = DateTime.Now;
                                            aouJ.SuggestionSkip = 1;
                                            aouJ.DueDate = DateTime.Now;
                                        }
                                    }
                                    aDBManager1.TBL_FreelanceBooks.Add(aouJ);
                                    aDBManager1.SaveChanges();
                                }

                            }
                        }
                    }

                    if (aobjP.PMName != null)
                    {


                        var aUserDataL = aDBManager1.UserMasters.Where(item => item.UserID == aobjP.PMName).ToList();

                        var PMName = "";

                        PMName = aUserDataL[0].LoginName;

                        var PEName = "";
                        var PEEmail = "";

                        var TSPMName = "";

                        if (aobjP.PEName != null)
                        {
                            aUserDataL = aDBManager1.UserMasters.Where(item => item.UserID == aobjP.PEName).ToList();
                            PEName = aUserDataL[0].LoginName;
                            PEEmail = aUserDataL[0].EmailID;
                        }

                        if (aobjP.TSPM != null)
                        {
                            aUserDataL = aDBManager1.UserMasters.Where(item => item.UserID == aobjP.TSPM).ToList();
                            TSPMName = aUserDataL[0].LoginName;
                        }


                        var PublName = "";
                        var aPublDataL = aDBManager1.Publishers.Where(item => item.Publ_ID == aobjP.PublisherID).ToList();
                        PublName = aPublDataL[0].Publ_Acronym;

                        TBL_Signaldetails tblSignal = new TBL_Signaldetails();
                        string strReceived = aobjP.ReceivedDt.HasValue ? aobjP.ReceivedDt.Value.ToString("yyyy-MM-dd") : null;
                        string strDue = aobjP.DueDt.HasValue ? aobjP.DueDt.Value.ToString("yyyy-MM-dd") : null;

                        string zTitleL = aobjP.Title.Replace("'", "''");
                        string zNotesL = (aobjP.Notes == null ? null : aobjP.Notes.Replace("'", "''"));
                        string zSeriesTitleL = (aobjP.SeriesTitle == null ? null : aobjP.SeriesTitle.Replace("'", "''"));

                        tblSignal.Description = "INSERT INTO Books (Book_Number, Book_Title, Book_Received, Book_TargetedPubDate, Book_CompletionDate, Book_Publisher, Book_PublID, Book_Catalog, Book_ISBN, Book_Platform, Book_AuthorName, Book_AuthorEditorName, Book_AuthorEdtorEmail, Book_EditorName, Book_EditorEmail, Book_ProjectManager, Book_ProdEditor_Name, Book_ProdEditor_Email, Book_Notes, Book_SeriesTitle, Book_ProcessType, Book_Type, Book_TSPM, Book_EbkISBN, Book_WebPDFISBN, Book_EPubISBN, Book_MobiISBN) VALUES ('" + aBookNumber + "','" + zTitleL + "','" + strReceived + "','" + strDue + "','" + strDue + "', '" + PublName + "',(SELECT Publ_ID FROM Publishers WHERE Book='Yes' and Publ_Acronym='" + PublName + "'),'" + aobjP.Catalog + "','" + aobjP.ISBN + "','" + aobjP.Platform + "','" + aobjP.AuthorName + "','" + aobjP.AuthorName + "','" + aobjP.AuthorEmail + "','" + aobjP.EditorName + "','" + aobjP.EditorEmail + "','" + PMName + "','" + PEName + "', '" + PEEmail + "','" + zNotesL + "','" + zSeriesTitleL + "','" + aobjP.UploadType + "','" + aobjP.Category + "','" + TSPMName + "','" + aobjP.EbookISBN + "','" + aobjP.WebISBN + "','" + aobjP.EpubISBN + "','" + aobjP.MobiISBN + "')";
                        tblSignal.IsSynch = 0;
                        tblSignal.UpdatedTime = DateTime.Now;
                        tblSignal.Type = "Query";
                        aDBManager1.TBL_Signaldetails.Add(tblSignal);
                        aDBManager1.SaveChanges();


                        string Mailbody = "";
                        Mailbody += "<table border='1' cellpadding='0' cellspacing='0' style='font-family: calibri;background-color:InactiveBorder' width='700px'>";
                        Mailbody += "<tr><td colspan=2 align='center'>Book Information</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Book No</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aBookNumber + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Publisher</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + PublName + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Title</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Title + "</td></tr>";
                        if (aobjP.SubTitle != "" && aobjP.SubTitle != null)
                        {
                            Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Sub Title</td>";
                            Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.SubTitle + "</td></tr>";
                        }
                        if (aobjP.SeriesTitle != "" && aobjP.SeriesTitle != null)
                        {
                            Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Series Title</td>";
                            Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.SeriesTitle + "</td></tr>";
                        }
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Edition</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Edition + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'> Workflow Type</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Workflow + "</td></tr>";
                        if (aobjP.AuthorName != "" && aobjP.AuthorName != null)
                        {
                            Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Author</td>";
                            Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.AuthorName + "</td></tr>";
                        }
                        if (aobjP.EditorName != "" && aobjP.EditorName != null)
                        {
                            Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Editor</td>";
                            Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.EditorName + "</td></tr>";
                        }

                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Catalog No</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Catalog + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>ISBN </td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.ISBN + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Project Manager</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + PMName + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>TSFM</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + TSPMName + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>PE Name</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + PEName + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Platform</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Platform + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Received</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.ReceivedDt + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Due</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.DueDt + "</td></tr>";
                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Type</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aobjP.Category + "</td></tr>";

                        Mailbody += "<tr><td width='115' align='right' style='padding-right: 5px;'>Booked By</td>";
                        Mailbody += "<td align='left' style='padding-left: 10px;'>&nbsp;" + aUserItem.LoginName + "</td></tr>";

                        Mailbody += "</table>";
                        Mailbody += "<br><br>*** This is an automatically generated email, please do not reply ***";

                        if (aUserItem.LoginName.ToLower() != "admin")
                        {
                            var mail = MailModels.Mail(
                                    To: "books_ti@novatechset.com",
                                    Cc: "girish@novatechset.com;tandfbooks@novatechset.com;shashi@novatechset.com;",
                                    Bcc: "",
                                    Subject: "New Book Info - " + aBookNumber,
                                    Body: Mailbody,
                                    //From: From,
                                    DisplayName: "SESAME"
                                    );
                        }

                    }

                }

                return Json("Book Info Updated Successfully...");
            }
            catch (Exception ex)
            {
                return Json("Error " + ex.Message);

            }
        }

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult BookDelete(int zBookID, string zType, string zReason)
        {
            var str = "";
            try
            {
                if (zType == "Delete")
                {
                    var BookList = new TBL_MainMaster { ID = zBookID };
                    aDBManager1.TBL_MainMaster.Attach(BookList);
                    aDBManager1.TBL_MainMaster.Remove(BookList);
                    aDBManager1.SaveChanges();
                    str = "Withdrawn";
                }
                else if (zType == "Withdraw")
                {
                    var aitemList = aDBManager1.TBL_MainMaster.Single(item => item.ID == zBookID);
                    aitemList.IsDeleted = 1;
                    aitemList.WithdrawReason = zReason;
                    aitemList.UpdatedTime = DateTime.Now;
                    aDBManager1.SaveChanges();
                    str = "Withdrawn";
                }
                else if (zType == "Revert")
                {
                    var aitemList = aDBManager1.TBL_MainMaster.Single(item => item.ID == zBookID);
                    aitemList.IsDeleted = 0;
                    aitemList.RevertReason = zReason;
                    aitemList.UpdatedTime = DateTime.Now;
                    aDBManager1.SaveChanges();
                    str = "Reverted";
                }
                return Json("Book " + str + " Successfully...");
            }
            catch (Exception ex)
            {

                return Json("Error " + ex.Message);
            }
        }


        [HttpGet]
        public ActionResult GetChapterMaster(int BookID)
        {
            var aitemList = aDBManager1.TBL_SubMaster.Where(item => item.MainID.ToString() == BookID.ToString()).
                OrderBy(item => item.Number).ToList();

            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        [ValidateInput(false)]
        public JsonResult UpdateGeneralNotes(string aBookUPID, string zGeneralNotes)
        {
            try
            {
                var aitemList = aDBManager1.TBL_MainMaster.Single(i => i.ID.ToString() == aBookUPID);
                aitemList.Notes = zGeneralNotes.Replace("<p><br></p>", "");
                aDBManager1.SaveChanges();
                return Json(string.Format("{0} Notes Updated!", aitemList.Catalog));
            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }
        }

        [HttpPost]
        public JsonResult GetWeeklyReportPDF(int zBookID)
        {

            var aWorkFlow = aDBManager1.SP_WeeklyReport(zBookID).ToList();
            var aBookDetails = aDBManager1.SP_GetBookDetails(zBookID).ToList();
            string zHTMLstr = "";
            if (aWorkFlow.Count > 0)
            {
                zHTMLstr += "<html><head>";
                zHTMLstr += "<style>";
                zHTMLstr += "table, td{";
                zHTMLstr += "border: 1px solid black;";
                zHTMLstr += "font-family:'Calibri',serif;font-size:14px;color:rgb(0,0,0);font-weight:bold;font-style:normal;text-decoration: none";
                zHTMLstr += "height: 30px";
                zHTMLstr += "}";
                zHTMLstr += ".td1{";
                zHTMLstr += "border: 1px solid black;";
                zHTMLstr += "font-family:'Calibri',serif;font-size:14px;color:rgb(0,0,0);font-style:normal;text-decoration: none";
                zHTMLstr += "height: 30px";
                zHTMLstr += "}";
                zHTMLstr += "#table1{ ";
                zHTMLstr += "border-collapse: collapse;";
                zHTMLstr += "border-spacing: 10px; width:100%";
                zHTMLstr += "}";
                zHTMLstr += "</style >";
                zHTMLstr += "</head > ";
                zHTMLstr += "<table id='table1' cellpadding='10' >";
                zHTMLstr += "<tbody>";
                zHTMLstr += "<tr><td style={border:1px solid black;border-collapse: collapse; border-spacing: 10px;} colspan='" + (aWorkFlow.Count) + "' bgcolor='#FDE2D7'>Nova Techset Project Manager: " + aBookDetails[0].PMName + "</td><td style={border-right: none;} bgcolor='#FDE2D7' nowrap>Report Date: " + DateTime.Today.ToString("dd-MMM-yyyy") + "</td></tr>";
                zHTMLstr += "<tr><td style={border:1px solid black;border-collapse: collapse; border-spacing: 10px;} colspan='" + (aWorkFlow.Count + 1) + "' bgcolor='#FDE2D7'>T&F Project Editor: " + aBookDetails[0].PEName + "</td></tr>";
                zHTMLstr += "<tr><td style={border:1px solid black;border-collapse: collapse; border-spacing: 10px;} colspan='" + (aWorkFlow.Count + 1) + "' bgcolor='#FDE2D7'>Project Received from T&F: " + (aBookDetails[0].ReceivedDt.HasValue ? aBookDetails[0].ReceivedDt.Value.ToString("dd-MMM-yyyy") : "") + "</td></tr>";
                zHTMLstr += "<tr><td style={border:1px solid black;border-collapse: collapse; border-spacing: 10px;} colspan='" + (aWorkFlow.Count + 1) + "' bgcolor='#FDE2D7'>Cat id #: " + aBookDetails[0].Catalog + "</td></tr>";
                zHTMLstr += "<tr><td style={border:1px solid black;border-collapse: collapse; border-spacing: 10px;} colspan='" + (aWorkFlow.Count + 1) + "' bgcolor='#B3C6E6'>Title/Author: " + aBookDetails[0].Title + "/ Authored by " + aBookDetails[0].AuthorName + "</td></tr>";
                zHTMLstr += "<tr bgcolor='#FFF2CF'><td></td>";
                foreach (var item in aWorkFlow)
                {
                    zHTMLstr += "<td nowrap}>" + item.Activity + "</td>";
                }
                zHTMLstr += "</tr>";
                zHTMLstr += "<tr bgcolor='#FFF2CF'><td>Projected</td>";
                foreach (var item in aWorkFlow)
                {
                    zHTMLstr += "<td nowrap>" + (item.RevisedScheduleDate.HasValue ? item.RevisedScheduleDate.Value.ToString("dd-MMM-yyyy") : "") + "</td>";
                }
                zHTMLstr += "</tr>";
                zHTMLstr += "<tr bgcolor='#C5DFB8'><td>Actual</td>";
                foreach (var item in aWorkFlow)
                {
                    zHTMLstr += "<td nowrap>" + (item.CompletedDate.HasValue ? item.CompletedDate.Value.ToString("dd-MMM-yyyy") : "") + "</td>";
                }
                zHTMLstr += "</tr>";
                zHTMLstr += "</tbody>";
                zHTMLstr += "</table>";
                var aActivityDetails = aDBManager1.Tbl_ActivityInfo.Where(item => item.Book_ID.ToString() == zBookID.ToString()).OrderBy(item => item.Act_Date).ToList();
                if (aActivityDetails.Count > 0)
                {
                    zHTMLstr += "<ul style={font-family:'Calibri',serif; font-size:11px; color: rgb(0, 0, 0); font-style:normal; text-decoration: none;}>";
                    foreach (var item in aActivityDetails)
                    {
                        zHTMLstr += "<li style={font-family:'Calibri',serif; font-size:11px; color: rgb(0, 0, 0); font-style:normal; text-decoration: none;}>" + (item.Act_Date.HasValue ? item.Act_Date.Value.ToString("dd-MMM-yyyy") + " - " + item.Activity : "") + "</li>";
                    }
                    zHTMLstr += "</ul>";
                }
                zHTMLstr += "</div>";
                zHTMLstr += "</html>";
                var pdfbyte = Common.GetHTMLtoPDF(zHTMLstr);
                var FilePath = Server.MapPath(string.Format("~/Source/WeeklyReport"));

                var tempfilename = zBookID.ToString() + ".pdf";

                var tempfilenameandlocation = Path.Combine(FilePath, Path.GetFileName(tempfilename));
                if (System.IO.File.Exists(tempfilenameandlocation))
                {
                    System.IO.File.Delete(tempfilenameandlocation);
                }
                System.IO.File.WriteAllBytes(tempfilenameandlocation, pdfbyte);
                return Json(tempfilenameandlocation, JsonRequestBehavior.AllowGet);

            }
            else
            {
                return Json("No Data Found!", JsonRequestBehavior.AllowGet);
            }

        }

        #region Progress
        public ActionResult Progress()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            BookModels aBkData = new BookModels();
            aBkData.PublisherList = Common.GetPublisherList(false);
            aBkData.CatalogList = Common.GetCatalogList(nUserID, false);
            aBkData.NumberList = Common.GetNumberList(nUserID, false);
            aBkData.ISBNList = Common.GetISBNList(nUserID, false);
            return View(aBkData);
        }

        [HttpPost]
        public ActionResult GetWIPBookDetail()
        {

            int nLoginID = int.Parse(Session["LoginID"].ToString());

            var zBookList = aDBManager1.SP_GetWISH_BookList(nLoginID, DateTime.Now, DateTime.Now);
            var zActivityList = aDBManager1.SP_GetWISH_Book_ActivityList(nLoginID, DateTime.Now, DateTime.Now);
            return Json(new { zBookList, zActivityList }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult GetProgressReport(string CatalogList, string NumList, string ISBNList, string PublList)
        {

            int nLoginID = int.Parse(Session["LoginID"].ToString());

            var zBookList = aDBManager1.SP_GetProgress_WIP(nLoginID).ToList();


            if (CatalogList != "All")
            {
                var aCatalogList = (CatalogList != null ? CatalogList.Split(',') : null);
                string[] iCatalogList = (aCatalogList != null ? aCatalogList.ToArray() : null);

                zBookList = zBookList.Where(item => (iCatalogList.Contains(item.Catalog))).ToList();
            }

            if (NumList != "All")
            {
                var aNumList = (NumList != null ? NumList.Split(',') : null);
                string[] iNumList = (aNumList != null ? aNumList.ToArray() : null);

                zBookList = zBookList.Where(item => (iNumList.Contains(item.Number))).ToList();
            }
            if (ISBNList != "All")
            {
                var aISBNList = (ISBNList != null ? ISBNList.Split(',') : null);
                string[] iISBNList = (aISBNList != null ? aISBNList.ToArray() : null);

                zBookList = zBookList.Where(item => (iISBNList.Contains(item.ISBN))).ToList();
            }
            if (PublList != "All")
            {
                var aPublList = (PublList != null ? PublList.Split(',') : null);
                string[] iPublList = (aPublList != null ? aPublList.ToArray() : null);

                zBookList = zBookList.Where(item => (iPublList.Contains(item.PublisherID.ToString()))).ToList();
            }

            return Json(new { zBookList }, JsonRequestBehavior.AllowGet);
        }


        #endregion


        #region SurveyMailSend
        [HttpPost]
        public ActionResult SurveyMailSent(int zBookID, string zMailTypeP)
        {


            using (var dbcontext = new WMSEntities())
            {
                using (DbContextTransaction transaction = dbcontext.Database.BeginTransaction())
                {
                    try
                    {

                        var zItemList = aDBManager1.SP_GetSurveyMailDetails(zBookID).SingleOrDefault();

                        if (zMailTypeP != "")
                        {

                            var zBookInfo = aDBManager1.TBL_MainMaster.SingleOrDefault(item => item.ID == zBookID);
                            var aMailItemL = aDBManager1.TBL_MailTemplate.SingleOrDefault(item => item.Template == "SurveyMail");


                            string SurveyUrl = string.Format("{0}{1}/Home/Survey/{2}", Request.Url.AbsoluteUri.Replace(Request.Url.AbsolutePath, ""),
                                Request.ApplicationPath, zBookID);

                            string Mailbody = aMailItemL.MailContent;

                            string aSubjectL = string.Format("Survey Link - {0} ({1})", zBookInfo.Catalog, zBookInfo.Number);
                            if (zMailTypeP.Contains("1") && zBookInfo.AuthorEmail != null && zBookInfo.AuthorName != null)
                            {
                                string MailbodyL = Mailbody;
                                MailbodyL = MailbodyL.Replace("{User}", Common.ToTitleCase(zBookInfo.AuthorName))
                                    .Replace("{SurveyLink}", string.Format("{0}/1/", SurveyUrl));

                                var mail = MailModels.Mail(
                                                                To: zItemList.AuthorEmail,
                                                                Cc: "",
                                                                Bcc: string.Format("{0};", zItemList.TSPMEmail),
                                                                Subject: aSubjectL,
                                                                Body: MailbodyL,
                                                                //From: From,
                                                                DisplayName: "SESAME"
                                                                );

                            }
                            if (zMailTypeP.Contains("2") && zBookInfo.EditorEmail != null && zBookInfo.EditorName != null)
                            {
                                string MailbodyL = Mailbody;
                                MailbodyL = MailbodyL.Replace("{User}", Common.ToTitleCase(zBookInfo.EditorName))
                                    .Replace("{SurveyLink}", string.Format("{0}/2/", SurveyUrl));
                                var mail = MailModels.Mail(
                                                                To: zItemList.PEEmail,
                                                                Cc: "",
                                                                Bcc: string.Format("{0};", zItemList.TSPMEmail),
                                                                Subject: aSubjectL,
                                                                Body: MailbodyL,
                                                                //From: From,
                                                                DisplayName: "SESAME"
                                                                );
                            }

                            if (zMailTypeP.Contains("3") && zItemList.PEEmail != null && zItemList.PEName != null)
                            {
                                string MailbodyL = Mailbody;
                                MailbodyL = MailbodyL.Replace("{User}", Common.ToTitleCase(zItemList.PEName))
                                    .Replace("{SurveyLink}", string.Format("{0}/3/", SurveyUrl));

                                var mail = MailModels.Mail(
                                                                To: zItemList.PEEmail,
                                                                Cc: "",
                                                                Bcc: string.Format("{0};", zItemList.TSPMEmail),
                                                                Subject: aSubjectL,
                                                                Body: MailbodyL,
                                                                //From: From,
                                                                DisplayName: "SESAME"
                                                                );
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
            return Json("Survey Link Sent Successfully !", JsonRequestBehavior.AllowGet);


        }

        [HttpPost]
        public ActionResult GetSurveyResponse(int zBookID, int ID)
        {

            var aitemList = aDBManager1.TBL_Survey.Where(item => (item.BookID == zBookID) && (item.UserType == "Author")).ToList();

            if (ID == 2)
            {
                aitemList = aDBManager1.TBL_Survey.Where(item => (item.BookID == zBookID) && (item.UserType == "Editor")).ToList();
            }

            if (ID == 3)
            {
                aitemList = aDBManager1.TBL_Survey.Where(item => (item.BookID == zBookID) && (item.UserType == "ProductionEditor")).ToList();
            }



            var aitemList1 = aDBManager1.SP_GetSurveyResponseData(zBookID).ToList();



            return Json(new { aitemList, aitemList1 }, JsonRequestBehavior.AllowGet);


        }

        #endregion

        #region Activity Info

        [HttpPost]
        public ActionResult GetActivityInfo(string nBookID)
        {
            var aitemList = aDBManager1.Tbl_ActivityInfo.Where(item => item.Book_ID == nBookID).ToList();


            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult UpdateActivity(string zBookID, string[] ActivityL)
        {

            using (var dbcontext = new WMSEntities())
            {

                using (DbContextTransaction transaction = dbcontext.Database.BeginTransaction())
                {
                    try
                    {
                        IEnumerable<Tbl_ActivityInfo> alist = dbcontext.Tbl_ActivityInfo.Where(i => i.Book_ID == zBookID).ToList();
                        dbcontext.Tbl_ActivityInfo.RemoveRange(alist);
                        dbcontext.SaveChanges();

                        if (ActivityL != null)
                        {
                            foreach (var item in ActivityL)
                            {
                                string[] zstrSplit = item.Split(',');

                                string zDate = zstrSplit[1].ToString();
                                string zActName = zstrSplit[2].ToString();

                                Tbl_ActivityInfo aitemActNew = new Tbl_ActivityInfo();
                                aitemActNew.Book_ID = zBookID;
                                aitemActNew.Act_Date = Convert.ToDateTime(zDate);
                                aitemActNew.Activity = zActName;

                                aitemActNew.CreatedTime = DateTime.Now;
                                aitemActNew.Createdby = Session["LoginID"].ToString();
                                aitemActNew.UpdatedTime = DateTime.Now;
                                aitemActNew.UpdatedBy = Session["LoginID"].ToString();
                                aitemActNew.IsDeleted = 0;
                                aDBManager1.Tbl_ActivityInfo.Add(aitemActNew);
                                aDBManager1.SaveChanges();



                                dbcontext.SaveChanges();
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
            return Json("Activity Updated Successfully!", JsonRequestBehavior.AllowGet);

        }

        //[HttpPost]
        //public ActionResult DeleteActivity(string nID)
        //{
        //    var aUserID = Session["LoginID"].ToString();
        //    var zWrkList = aDBManager1.Tbl_ActivityInfo.SingleOrDefault(item => item.ID.ToString() == nID);

        //    zWrkList.IsDeleted = 1;
        //    zWrkList.UpdatedBy = aUserID;
        //    zWrkList.UpdatedTime = DateTime.Now;

        //    aDBManager1.SaveChanges();

        //    return Json("Details Deleted Successfully!", JsonRequestBehavior.AllowGet);
        //}
        #endregion

        #region Add/Update Chapter
        public ActionResult GetChapterInfo(int Id)
        {
            TBL_SubMaster chapterInformation = new TBL_SubMaster();

            chapterInformation = aDBManager1.TBL_SubMaster.Where(item => item.ID == Id).FirstOrDefault();

            return PartialView("_ChapterAddUpdate", chapterInformation);
        }

        public ActionResult AddChapterView(int BookId, string ChapterNumber)
        {
            TBL_SubMaster ChapterInfo = new TBL_SubMaster();
            ChapterInfo.MainID = BookId;
            ChapterInfo.Number = ChapterNumber;

            return PartialView("_ChapterAddUpdate", ChapterInfo);
        }

        public JsonResult SaveChapterInfo(TBL_SubMaster chapterInfo)
        {
            bool res = false;
            string msg = string.Empty;
            TBL_SubMaster _SubMaster = new TBL_SubMaster();

            try
            {
                if (chapterInfo.ID > 0)
                {
                    _SubMaster = aDBManager1.TBL_SubMaster.Where(item => item.ID == chapterInfo.ID).FirstOrDefault();

                    if (_SubMaster != null)
                    {
                        _SubMaster.Title = chapterInfo.Title.Trim();
                        _SubMaster.MSPages = chapterInfo.MSPages;
                        _SubMaster.ColorFig = chapterInfo.ColorFig;
                        _SubMaster.Tables = chapterInfo.Tables;
                        _SubMaster.AuthorEmail = chapterInfo.AuthorEmail;
                        _SubMaster.AuthorName = chapterInfo.AuthorName;

                        _SubMaster.UpdatedBy = Convert.ToString(Session["LoginID"]);
                        _SubMaster.UpdatedTime = DateTime.Now;

                        aDBManager1.Entry(_SubMaster).State = EntityState.Modified;
                        if (aDBManager1.SaveChanges() > 0)
                        {
                            msg = "Chapter details updated successfully.";
                            res = true;
                        }                        
                    }
                }
                else
                {
                    chapterInfo.Title = chapterInfo.Title.Trim();
                    chapterInfo.ReceivedDt = DateTime.Now;

                    chapterInfo.CreatedTime = DateTime.Now;
                    chapterInfo.CreatedBy = Convert.ToString(Session["LoginID"]);

                    chapterInfo.UpdatedTime = DateTime.Now;
                    chapterInfo.UpdatedBy = Convert.ToString(Session["LoginID"]);

                    aDBManager1.TBL_SubMaster.Add(chapterInfo);
                    if (aDBManager1.SaveChanges() > 0)
                    {
                        msg = "Chapter details created successfully.";
                        res = true;
                    }
                }
            }
            catch (Exception ex)
            {
                msg = ex.Message;
            }

            var result = new { status = res, message = msg };

            return Json(result, JsonRequestBehavior.AllowGet);
        }
        #endregion
    }
}
