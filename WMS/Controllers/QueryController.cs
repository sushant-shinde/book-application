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
    public class QueryController : Controller
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

        // GET: Query
        [CustomAuthorizeAttribute]
        public ActionResult Index()
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
        public ActionResult GetQueryTemplate(string zTemplate, string zCatalog)
        {

            var aitemList = aDBManager.TBL_QueryTemplate.SingleOrDefault(item => item.TemplateName == zTemplate);

            var aitemList_Data = aDBManager.SP_GetMailContentForQuery(zCatalog).SingleOrDefault();

            return Json(new { aitemList, aitemList_Data }, JsonRequestBehavior.AllowGet);


        }


        [HttpPost]
        public ActionResult GetQueryListBk(string FirstLoad, string Type, string CatalogList, string NumList, string ISBNList)
        {

            try
            {
                int nUserID = int.Parse(Session["LoginID"].ToString());
                Dictionary<string, int> dictionary = new Dictionary<string, int>();

                var aItemList = aDBManager.SP_GetQueryData(nUserID).ToList();

                if (Type == "Pending")
                {
                    aItemList = aItemList.Where(item => item.Resolved == 0).ToList();
                }
                else if (Type == "Resolved")
                {
                    aItemList = aItemList.Where(item => item.Resolved == 1).ToList();
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

                var queryDataList = aItemList.GroupBy(c => c.Number).ToList();

                foreach (var item in queryDataList)
                {
                    int catalogCount = 0;

                    var queryList = item.ToList();
                    string catalog = item.Select(itm => itm.Catalog).Distinct().SingleOrDefault();
                    catalogCount = queryList.Count();

                    dictionary.Add(catalog, catalogCount);
                }
                var aList = dictionary.ToList();

                return Json(new { aItemList, Catalogitems, ISBNitems, Numberitems, aList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }
        }

        [HttpPost]
        public ActionResult GetCatalogbyUser(string Catalog = "")
        {

            try
            {
                List<SelectListItem> Catalogitems = new List<SelectListItem>();
                List<SelectListItem> Chapteritems = new List<SelectListItem>();
                List<SelectListItem> TempList = new List<SelectListItem>();

                int nUserID = int.Parse(Session["LoginID"].ToString());

                var aUserList = aDBManager.UserMasters.Where(item => item.UserID == nUserID).ToList();

                if (aUserList.Count > 0)
                {
                    var aItemList = aDBManager.SP_GetQueryCatalogChapterList(nUserID, aUserList[0].UserType, aUserList[0].EmailID).ToList();

                    var aCatList = aItemList.Select(item => new { item.Catalog }).Distinct().ToList();
                    foreach (var item in aCatList)
                    {

                        Catalogitems.Add(new SelectListItem()
                        {
                            Value = item.Catalog.ToString(),
                            Text = item.Catalog.ToString()

                        });

                    }

                    if (Catalog != "")
                    {
                        var aChapterList = aItemList.Where(item => item.Catalog == Catalog).Select(item => new { item.Number }).Distinct().ToList();
                        foreach (var item in aChapterList)
                        {

                            Chapteritems.Add(new SelectListItem()
                            {
                                Value = item.Number.ToString(),
                                Text = item.Number.ToString()

                            });

                        }
                        var aitemList = aDBManager.SP_GetTemplateList(Catalog).ToList();


                        foreach (var item in aitemList)
                        {
                            TempList.Add(new SelectListItem()
                            {
                                Value = item.TemplateName.ToString(),
                                Text = item.TemplateName.ToString()

                            });
                        }
                    }


                }
                return Json(new { Catalogitems, Chapteritems, TempList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }

        [HttpPost]
        public ActionResult GetBookDataByCatalog(string Catalog, int zID)
        {
            try
            {
                int nLoginID = int.Parse(Session["LoginID"].ToString());

                var aItemList = aDBManager.SP_GetBookDetailsbyCatalog(Catalog).ToList();

                var aQueryItemList = aDBManager.SP_GetQueryConversationData(zID).ToList();

                var aQueryToEmailList = aDBManager.SP_GetEmailList_QueryTo(Catalog, nLoginID).ToList();


                return Json(new { aItemList, aQueryItemList, aQueryToEmailList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }

        [HttpPost]
        public ActionResult AddFileupload()
        {

            string aCatalog = Request["Catalog"];
            string aTime = Request["Time"];

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

                        string zPlacePathL = Server.MapPath(string.Format("~/Source/Query/{0}/{1}", aCatalog, aTime));
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
        public ActionResult DeleteAddFile(string zCatalog, string zFileNameP, string zTime)
        {

            string zFilePath = Server.MapPath(string.Format("~/Source/Query/{0}/{1}/{2}", zCatalog, zTime, zFileNameP));

            if (System.IO.File.Exists(zFilePath))
            {
                System.IO.File.Delete(zFilePath);
            }
            return Json("File Deleted", JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult CheckExistingData(string zCatalog, string zSubject)
        {
            bool ifExist = false;
            try
            {

                var items = aDBManager.TBL_MainMaster
              .Join(aDBManager.TBL_QueryMaster, AB => AB.ID, BC => BC.MainID, (AB, BC) => new { AB, BC })
              .Where(item => (item.BC.QuerySubject == zSubject) && (item.AB.Catalog == zCatalog)
              ).ToList();

                ifExist = items.Count == 0 ? true : false;

                return Json(!ifExist, JsonRequestBehavior.AllowGet);

            }

            catch (Exception ex)
            {
                return Json(false, JsonRequestBehavior.AllowGet);

            }

        }

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult AddQuery(string zCatalog, string zChapter, string zSubject,
                                    string zQuery, string zTime, string[] FileListL, string zQueryTo,
                                    string zQueryPriority, string zReminderDt)
        {

            Nullable<DateTime> adtReminderDt = null;
            if (zReminderDt != "")
                adtReminderDt = Convert.ToDateTime(zReminderDt);

            int BookID = 0;
            var aBookList = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.Catalog == zCatalog);
            BookID = aBookList.ID;

            string UserType = "";
            int nUserID = int.Parse(Session["LoginID"].ToString());
            var aUsrList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == nUserID);
            UserType = aUsrList.UserType;


            if (FileListL != null && FileListL.Length > 0)
            {
                string path = Server.MapPath(string.Format("~/Source/Query/{0}/{1}", zCatalog, zTime));
                string[] Filenames = Directory.GetFiles(path);

                if (Filenames.Length > 0)
                {
                    using (ZipFile zip = new ZipFile())
                    {
                        zip.AddFiles(Filenames, zCatalog + zTime);
                        zip.Save(Path.Combine(string.Format(path + "/{0}.zip", zCatalog + zTime)));
                    }
                }
                var files = Directory.GetFiles(path).Where(name => !name.EndsWith(".zip"));
                foreach (string filePath in files)
                {
                    System.IO.File.Delete(filePath);
                }
            }

            TBL_QueryMaster aQueryj = new TBL_QueryMaster();
            aQueryj.MainID = BookID;
            aQueryj.UserID = nUserID;
            aQueryj.UserType = UserType;
            aQueryj.Number = zChapter;
            aQueryj.QuerySubject = zSubject;
            aQueryj.Query = zQuery;
            aQueryj.QueryDate = DateTime.Now;
            aQueryj.QueryTo = zQueryTo;
            aQueryj.Priority = zQueryPriority.Trim();
            aQueryj.ReminderDate = adtReminderDt;
            aQueryj.CreatedBy = nUserID;
            aQueryj.CreatedTime = DateTime.Now;
            aDBManager.TBL_QueryMaster.Add(aQueryj);
            aDBManager.SaveChanges();

            int QueryID = 0;
            QueryID = aDBManager.TBL_QueryMaster.SingleOrDefault(item => item.MainID == BookID && item.QuerySubject == zSubject).ID;
            TBL_QuerySubMaster aSubQueryj = new TBL_QuerySubMaster();
            aSubQueryj.QueryID = QueryID;
            aSubQueryj.QueryResponse = zQuery;
            aSubQueryj.UserID = nUserID;
            aSubQueryj.UpdatedDate = DateTime.Now;
            aSubQueryj.Attachment = (FileListL == null ? null : string.Format("~/Source/Query/{0}/{1}/{2}", zCatalog, zTime, zCatalog + zTime + ".zip"));
            aDBManager.TBL_QuerySubMaster.Add(aSubQueryj);
            aDBManager.SaveChanges();


            var aUserIDList = (zQueryTo != null ? zQueryTo.Split(',') : null);
            string[] iUserIDList = (aUserIDList != null ? aUserIDList.ToArray() : null);

            var aUserList = aDBManager.UserMasters.Where(item => (iUserIDList.Contains(item.UserID.ToString()))).ToList();
            string zMailTo = "";
            foreach (var item in aUserList)
            {
                zMailTo += item.EmailID + ';';
            }
            var aPMList = aDBManager.UserMasters.SingleOrDefault(item => (item.UserID == aBookList.PMName));

            string zMailBody = "";
            var aMailTemp = aDBManager.TBL_MailTemplate.SingleOrDefault(item => item.Template == "QueryCreate");
            zMailBody = aMailTemp.MailContent;

            string AppUrl = Request.Url.AbsoluteUri.Replace(Request.Url.AbsolutePath, "") + Request.ApplicationPath;

            zMailBody = zMailBody
                    .Replace("{BookTitle}", aBookList.Title)
                    .Replace("{Query}", string.Format("Query raised -  {0} <br> {1}", aUsrList.LoginName, zQuery))
                    .Replace("{Catalog}", aBookList.Catalog)
                    .Replace("{Link}", AppUrl)
                    ;
            var mail = MailModels.Mail(
                        To: zMailTo,
                        Cc: aPMList.EmailID,
                        Bcc: "",
                        Subject: zSubject,
                        Body: zMailBody,
                        //From: From,
                        DisplayName: "SESAME"
                        );

            return Json("Query Sent Successfully!", JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult AddResponse(int zQueryID, string zResponse)
        {



            string UserType = "";
            int nUserID = int.Parse(Session["LoginID"].ToString());
            UserType = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == nUserID).UserType;


            //if (FileListL.Length > 0)
            //{
            //    string path = Server.MapPath(string.Format("~/Source/Query/{0}/{1}", zCatalog, zTime));
            //    string[] Filenames = Directory.GetFiles(path);

            //    if (Filenames.Length > 0)
            //    {
            //        using (ZipFile zip = new ZipFile())
            //        {
            //            zip.AddFiles(Filenames, zCatalog + zTime);
            //            zip.Save(Path.Combine(string.Format(path + "/{0}.zip", zCatalog + zTime)));

            //        }
            //    }
            //}


            TBL_QuerySubMaster aSubQueryj = new TBL_QuerySubMaster();
            aSubQueryj.QueryID = zQueryID;
            aSubQueryj.QueryResponse = zResponse;
            aSubQueryj.UserID = nUserID;
            aSubQueryj.UpdatedDate = DateTime.Now;
            //aSubQueryj.Attachment = string.Format("~/Source/Query/{0}/{1}/{2}", zCatalog, zTime, zCatalog + zTime + ".zip");
            aDBManager.TBL_QuerySubMaster.Add(aSubQueryj);
            aDBManager.SaveChanges();

            return Json("Query Sent Successfully!", JsonRequestBehavior.AllowGet);

        }


        [HttpPost]
        [ValidateInput(false)]
        public ActionResult QueryResponse()
        {
            try
            {
                string zCatalog = Request.Form.GetValues("Catalog")[0];
                int zQueryID = int.Parse(Request.Form.GetValues("QueryID")[0]);
                string zTime = Request.Form.GetValues("Time")[0];
                string zQueryResponse = Request.Form.GetValues("QueryResponse")[0].Replace("**", "<").Replace("||", ">");
                bool aIsFinalResponse = Convert.ToBoolean(Request.Form.GetValues("Final")[0]);

                bool aIsReopenResponse = Convert.ToBoolean(Request.Form.GetValues("Reopen")[0]);

                int nLoginID = int.Parse(Session["LoginID"].ToString());


                string zZipTempFolder = Server.MapPath(string.Format("~/Source/Query/{0}/{1}/temp", zCatalog, zTime));

                string zZipFolder = Server.MapPath(string.Format("~/Source/Query/{0}/{1}", zCatalog, zTime));

                string zFileName = string.Format("{0}{1}.zip", zCatalog, zTime);
                string zAttachment = "";
                // Checking no of files injected in Request object  
                if (Request.Files.Count > 0)
                {
                    zAttachment = string.Format("~/Source/Query/{0}/{1}/{2}", zCatalog, zTime, zFileName);
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
                            string zPath = Server.MapPath(string.Format("~/Source/Query/{0}/{1}/temp", zCatalog, zTime));
                            if (!Directory.Exists(zPath))
                            {
                                Directory.CreateDirectory(zPath);

                            }
                            fname = Path.Combine(zPath, fname);
                            file.SaveAs(fname);

                        }
                        Common.CreateZIP(zZipTempFolder, zFileName, zZipFolder);
                    }

                    catch (Exception ex)
                    {
                        return Json("Error occurred. Error details: " + ex.Message);
                    }
                }


                aDBManager.TBL_QuerySubMaster.Add(new TBL_QuerySubMaster()
                {
                    QueryID = zQueryID,
                    UserID = nLoginID,
                    QueryResponse = zQueryResponse,
                    UpdatedDate = DateTime.Now,
                    Attachment = (zAttachment != "" ? zAttachment : null)
                });
                aDBManager.SaveChanges();


                var aitem = aDBManager.TBL_QueryMaster.SingleOrDefault(item => item.ID == zQueryID);
                if (aIsFinalResponse)
                {
                    aitem.Resolved = 1;
                    aitem.ResolvedDate = DateTime.Now;
                    aitem.Solution = zQueryResponse;
                    aitem.ResolvedBy = nLoginID;
                    aDBManager.SaveChanges();
                }
                if (aIsReopenResponse)
                {
                    aitem.Resolved = 0;
                    aitem.ResolvedDate = DateTime.Now;
                    aDBManager.SaveChanges();
                }

                var aLoginUserList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == nLoginID);

                var aUserIDList = aitem.QueryTo.Split(',');
                string[] iUserIDList = (aUserIDList != null ? aUserIDList.ToArray() : null);

                var aUserList = aDBManager.UserMasters.Where(item => (iUserIDList.Contains(item.UserID.ToString()))).ToList();
                string zMailTo = "";
                foreach (var item in aUserList)
                {
                    zMailTo += item.EmailID + ';';
                }
                var aBookInfoL = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == aitem.MainID);
                var aPMList = aDBManager.UserMasters.SingleOrDefault(item => (item.UserID == aBookInfoL.PMName));


                string zMailBody = "";
                var aMailTemp = aDBManager.TBL_MailTemplate.SingleOrDefault(item => item.Template == "QueryCreate");
                zMailBody = aMailTemp.MailContent;

                string AppUrl = Request.Url.AbsoluteUri.Replace(Request.Url.AbsolutePath, "") + Request.ApplicationPath;

                zMailBody = zMailBody
                        .Replace("{BookTitle}", aBookInfoL.Title)
                        .Replace("{Catalog}", aBookInfoL.Catalog)
                        .Replace("{Link}", AppUrl);

                if (aIsFinalResponse)
                {
                    zMailBody = zMailBody.Replace("{Query}", string.Format("Query Resolved -  {0} <br> {1}", aLoginUserList.LoginName, zQueryResponse));
                    var mail = MailModels.Mail(
                                       To: zMailTo,
                                       Cc: aPMList.EmailID,
                                       Bcc: "",
                                       Subject: aitem.QuerySubject,
                                       Body: zMailBody,
                                       //From: From,
                                       DisplayName: "SESAME"
                                       );
                }
                else
                {
                    zMailBody = zMailBody.Replace("{Query}", string.Format("Query Response -  {0} <br> {1}", aLoginUserList.LoginName, zQueryResponse));
                    var mail = MailModels.Mail(
                                To: zMailTo,
                                Cc: aPMList.EmailID,
                                Bcc: "",
                                Subject: aitem.QuerySubject,
                                Body: zMailBody,
                                //From: From,
                                DisplayName: "SESAME"
                                );

                }
                return Json("Query Response");

            }
            catch (Exception ex)
            {

                return Json("Error : " + ex.Message);
            }

        }

        public JsonResult GetQueryDetails(int QueryID)
        {
            var aQueryItemList = aDBManager.SP_GetQueryConversationData(QueryID).ToList();

            var queryDetails = aDBManager.TBL_QueryMaster.SingleOrDefault(q => q.ID == QueryID);

            return Json(new { queryDetails, aQueryItemList }, JsonRequestBehavior.AllowGet);
        }
    }
}