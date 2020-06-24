using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using WMS.Models;
using System.IO;
using System.Text;

namespace WMS.Controllers
{
    public class HomeController : Controller
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

        public ActionResult Login()
        {
            DateTime ate = DateTimeOffset.Now.UtcDateTime;
            ViewBag.Title = "Login Page";
            Session["UserData"] = null;
            FormsAuthentication.SignOut();
            Session.Abandon();
            return View();
        }

        public ActionResult General()
        {
            return View();
        }

        [AllowAnonymous]
        public ActionResult ForgotPassword()
        {
            return View();
        }
        public ActionResult Unauthorized()
        {
            return Content("<strong>Unauthorized</strong>");
        }

        public ActionResult GetRights(int nRoleID)
        {
            var aItemList = aDBManager.tbl_RoleMenuAction
              .Join(aDBManager.Tbl_MenuList, AB => AB.MenuID, BC => BC.MenuID, (AB, BC) => new { AB, BC })
              .Where(item => (item.AB.RoleID == nRoleID)
              ).Select(item => new { item.AB.MenuID, item.BC.MenuName, item.BC.ParentMenu, item.AB.Actions }).ToList();

            return Json(new { aItemList }, JsonRequestBehavior.AllowGet);

        }



        [HttpPost]
        [AllowAnonymous]
        public ActionResult ForgotPassword(LoginModel aloginObj)
        {
            try
            {
                if (aloginObj.LoginID == "admin")
                {
                    ViewBag.LoginErr = "Invalid User Name !, Contact SESAME Administrator";
                    return View("ForgotPassword");
                }

                var aitemList = aDBManager.UserMasters.SingleOrDefault(item => item.LoginID == aloginObj.LoginID);
                if (aitemList != null)
                {
                    string zPasswordL = Common.RandomString(6);
                    aitemList.Password = Common.EncryptString(zPasswordL);
                    aitemList.UpdatedTime = DateTime.Now;
                    aDBManager.SaveChanges();


                    string Mailbody = "";
                    string zMailTempPath = string.Format("~/MailTemplate/ResetPassword.html");
                    if (System.IO.File.Exists(Server.MapPath(zMailTempPath)))
                        Mailbody = System.IO.File.ReadAllText(Server.MapPath(string.Format("~/MailTemplate/ResetPassword.html")));

                    string AppUrl = Request.Url.AbsoluteUri.Replace(Request.Url.AbsolutePath, "") + Request.ApplicationPath;
                    Mailbody = Mailbody
                        .Replace("{HINAME}", aitemList.LoginName)
                        .Replace("{UserName}", aitemList.LoginID)
                        .Replace("{Password}", zPasswordL)
                        .Replace("{Link}", AppUrl)
                        ;

                    var mail = MailModels.Mail(
                                To: aitemList.EmailID,
                                Cc: "",
                                Bcc: "",
                                Subject: "SESAME Reset Password Details",
                                Body: Mailbody,
                                //From: From,
                                DisplayName: "SESAME"
                                );


                    ViewBag.InfoMSG = "New Pasword sent to your Email Address...";

                    return View("ForgotPassword");

                }
                else
                {
                    ViewBag.LoginErr = "Invalid UserName";
                }

            }
            catch (Exception ex)
            {
                ViewBag.LoginErr = "Invalid UserName";
            }
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult Login(LoginModel aloginObj)
        {
            try
            {
                if (ModelState.IsValid)
                {


                    var aitemList = aDBManager.SP_UserLogin(aloginObj.LoginID, Common.EncryptString(aloginObj.Password)).ToList();
                    if (aitemList.Count > 0)
                    {
                        Session["LoginID"] = aitemList[0].UserID;
                        Session["UserType"] = aitemList[0].UserType;
                        Session["UserData"] = JsonConvert.SerializeObject(aitemList, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });
                        FormsAuthentication.SetAuthCookie(aitemList[0].LoginName, aloginObj.RememberMe);
                        string zviewPage = "index";


                        TBL_LoginHistory aitemLogin = new TBL_LoginHistory();
                        aitemLogin.LoginID = int.Parse(aitemList[0].UserID.ToString());
                        aitemLogin.LoginTime = DateTime.Now;
                        aitemLogin.IPAddress = GetLocalIPAddress();
                        aDBManager.TBL_LoginHistory.Add(aitemLogin);
                        aDBManager.SaveChanges();

                        //Task Notification
                        int aLoginID = int.Parse(Session["LoginID"].ToString());
                        var aItemListCount = aDBManager.SP_GetTaskNotifications(aLoginID).Count();
                        Session["TaskCount"] = aItemListCount;

                        var aItemList = aDBManager.SP_GetTaskNotifications(aLoginID).ToList();



                        if (aitemList[0].UserType == "Author" || aitemList[0].UserType == "Editor" || aitemList[0].UserType == "AuthorEditor")
                            return RedirectToAction(zviewPage + "/" + aitemList[0].UserType.ToLower(), "tracking");
                        else if (aitemList[0].UserType == "Freelancer")
                            return RedirectToAction("inbox", "freelance");
                        else if (aitemList[0].UserType == "General")
                            return RedirectToAction("general", "home");
                        else
                            return RedirectToAction(zviewPage);
                    }
                    else
                    {
                        ViewBag.LoginErr = "Invalid UserName or Password";
                    }
                }
            }
            catch (Exception ex)
            {
                ViewBag.LoginErr = ex.Message;
            }
            return View();
        }

        public static string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            throw new Exception("No network adapters with an IPv4 address in the system!");
        }

        public ActionResult Index()
        {
            string zUserType = Session["UserType"].ToString();
            if (zUserType == "Author" || zUserType == "Editor" || zUserType == "AuthorEditor")
                return RedirectToAction("index/" + zUserType, "tracking");
            else if (zUserType == "Freelancer")
                return RedirectToAction("inbox", "freelance");
            else if (zUserType == "General")
                return RedirectToAction("general", "home");
            else
                return View();
        }
        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            Session.Abandon();
            return RedirectToAction("login");
        }

        [HttpPost]
        public ActionResult KeepAlive()
        {
            int aLoginID = int.Parse(Session["LoginID"].ToString());
            var aItemList1 = aDBManager.SP_ProjectPlanList("", aLoginID);
            var aItemList = aItemList1.OrderByDescending(item => item.DueDate).ToList();
            //Update Activity Complition Date
            try
            {
                var aitemUpdateActivity = aItemList.Where(item => item.CurrentActivity != null);
                foreach (var item in aitemUpdateActivity)
                {
                    var aResultL = aDBManager.SP_ProjectPlan_Activity_CompletionDate_Update(item.BookID);

                }
            }
            catch (Exception) { }
            return Json("Keep Alive");

        }


        #region SurveyResponse
        [AllowAnonymous]
        [Route("Home/Survey/{ID}/{type}")]
        public ActionResult Survey(int ID, int type)
        {
            try
            {
                Session["Book_ID"] = ID;
                Session["SurveyType"] = type;
                var Data = aDBManager.TBL_MainMaster.Where(i => i.ID == ID).FirstOrDefault();
                if (type == 1)
                {
                    ViewBag.Username = Data.AuthorName;
                    Session["UserType"] = "Author";
                }
                else if (type == 2)
                {
                    ViewBag.Username = Data.EditorName;
                    Session["UserType"] = "Editor";
                }
                else if (type == 3)
                {
                    var aitemPM = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == Data.PEName);
                    ViewBag.Username = aitemPM.LoginName;
                    Session["UserType"] = "ProductionEditor";
                }

                ViewBag.BookCatalog = Data.Catalog;
                ViewBag.BookTitle = Data.Title;

                ViewBag.CDate = DateTime.Now;

            }
            catch (Exception)
            {

            }

            return View();
        }

        [HttpGet]
        public ActionResult GetSurveyPopulate(string aBookID)
        {

            int nBookID = int.Parse(aBookID);
            var aitemList = aDBManager.TBL_MainMaster.Where(item => (item.ID == nBookID)).ToList();
            var aPlanningListL = aDBManager.SP_GetBookPlanningDetails(nBookID).ToList();

            DataTable adtList = new DataTable();
            adtList = Common.ToDataTable(aPlanningListL);
            var aPlanningList = Common.ReScheduleDetails(adtList).ToList().OrderBy(item => item.ScheduleDate);

            return Json(new { aitemList, aPlanningList }, JsonRequestBehavior.AllowGet);


        }

        [HttpPost]
        public ActionResult SubmitResponse(TBL_Survey aitemInfoP)
        {
            int nBookID = int.Parse(Session["Book_ID"].ToString());
            int nSubmittedBy = int.Parse(Session["SurveyType"].ToString());
            string zUserType = Session["UserType"].ToString();

            aDBManager.TBL_Survey.Add(new TBL_Survey()
            {
                BookID = nBookID,
                TextAccuracy = aitemInfoP.TextAccuracy,
                Quality = aitemInfoP.Quality,
                Pagination = aitemInfoP.Pagination,
                CopyEditing = aitemInfoP.CopyEditing,
                Delivery = aitemInfoP.Delivery,
                ProductAccuracy = aitemInfoP.ProductAccuracy,
                Response = aitemInfoP.Response,
                Communication = aitemInfoP.Communication,
                ResponseTime = aitemInfoP.ResponseTime,
                Clarification = aitemInfoP.Clarification,
                Submitted = 0,
                Comment = aitemInfoP.Comment,
                SubmittedBy = nSubmittedBy,
                UserType = zUserType,
                UpdatedTime = DateTime.Now,

            });

            aDBManager.SaveChanges();
            return Json("Submitted Successfully!");


        }

        [HttpGet]
        public ActionResult CheckExistingData_survey(string ValueData, int Type)
        {
            bool ifIDExist = false;
            try
            {
                var items = aDBManager.TBL_Survey.Where(x => x.Submitted == 0 && x.BookID.ToString() == ValueData && x.SubmittedBy == Type).ToList();

                ifIDExist = items.Count == 0 ? true : false;

                return Json(!ifIDExist, JsonRequestBehavior.AllowGet);

            }

            catch (Exception ex)
            {
                return Json(false, JsonRequestBehavior.AllowGet);

            }

        }

        #endregion

        #region Dashboard Summary

        [HttpPost]
        public ActionResult GetSummary()
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());

            //var aItemList =aDBManager.SP_GetActivitiesWise_BooksSummary(nLoginID);

            var aItemList1 = aDBManager.SP_GetBooks_CompletedPercentage(nLoginID); //Bar Chart
            var aItemList = JsonConvert.SerializeObject(aItemList1, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });

            var aSummaryCountL = aDBManager.sp_GetDashBoard_BooksSummaryCount(nLoginID);

            DateTime baseDate = DateTime.Today;
            DateTime dtFrom = baseDate; //.AddDays(-(int)baseDate.DayOfWeek);
            DateTime dtTo = dtFrom;//.AddDays(7).AddSeconds(-1);

            var zBookList1 = aDBManager.SP_GetWISH_BookList(nLoginID, dtFrom, dtTo);
            var zBookList = JsonConvert.SerializeObject(zBookList1, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });

            return Json(new { aItemList, aSummaryCountL, zBookList }, JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region Feedback & Appreciation 
        public ActionResult Feedback()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            BookModels aFeedbackData = new BookModels();
            aFeedbackData.PublisherList = Common.GetPublisherList(false);
            aFeedbackData.NumberList = Common.GetNumberList(nUserID);
            aFeedbackData.PMList = GetPMList(false);
            //aFeedbackData.ChapterList = GetChapterList();
            return View(aFeedbackData);
        }

        public List<SelectListItem> GetPMList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager.UserMasters.Where(item => (item.UserType == "PM") && (item.ActiveStatus == "Active")).Select(item => new { item.LoginName, item.UserID }).ToList();
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

        [HttpPost]
        public ActionResult GetFeedbackData(bool zFirstLoad, string zFromDt, string zToDt, string zTabType)
        {

            try
            {
                DateTime dtFrom = Convert.ToDateTime(zFromDt);
                DateTime dtTo = Convert.ToDateTime(zToDt);

                DateTime baseDate = DateTime.Today;
                DateTime dtFromL = dtFrom;
                DateTime dtToL = dtTo;


                if (zTabType == "Today")
                {
                    dtFromL = DateTime.Today;
                    dtToL = dtFrom;
                }
                else if (zTabType == "Tomorrow")
                {
                    dtFromL = baseDate;
                    dtToL = dtFromL.AddDays(1);
                }
                else if (zTabType == "This Week")
                {
                    dtFromL = baseDate.AddDays(-(int)baseDate.DayOfWeek);
                    dtToL = dtFrom.AddDays(7).AddSeconds(-1);
                }
                else if (zTabType == "This Month")
                {
                    dtFromL = baseDate.AddDays(1 - baseDate.Day);
                    dtToL = dtFromL.AddMonths(1).AddSeconds(-1);
                }

                int nUserID = int.Parse(Session["LoginID"].ToString());

                var aItemList = aDBManager.SP_GetFeedbackData(nUserID).ToList();

                if (zFirstLoad == false)
                {
                    aItemList = aItemList.Where(item => (item.FeedbackDate.GetValueOrDefault().Date <= dtTo) && (item.FeedbackDate.GetValueOrDefault().Date >= dtFrom)).ToList();
                }
                else
                {
                    aItemList = aItemList.Where(item => (item.FeedbackDate.GetValueOrDefault().Date <= dtToL) && (item.FeedbackDate.GetValueOrDefault().Date >= dtFromL)).ToList();
                }

                return Json(new { aItemList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }




        [HttpPost]
        public ActionResult AddFeedback(Tbl_Feedback aitemInfoP)
        {

            try
            {
                if (aitemInfoP.FeedbackID != 0)
                {
                    var aitemList = aDBManager.Tbl_Feedback.Single(item => item.FeedbackID == aitemInfoP.FeedbackID);
                    aitemList.PulisherID = (aitemInfoP.PulisherID == null ? aitemList.PulisherID : aitemInfoP.PulisherID);
                    aitemList.BookID = (aitemInfoP.BookID == null ? aitemList.BookID : aitemInfoP.BookID);
                    aitemList.ChapterNo = (aitemInfoP.ChapterNo == null ? aitemList.ChapterNo : aitemInfoP.ChapterNo);
                    aitemList.ComplaintType = (aitemInfoP.ComplaintType == null ? aitemList.ComplaintType : aitemInfoP.ComplaintType);
                    aitemList.CriticalLevel = (aitemInfoP.CriticalLevel == null ? aitemList.CriticalLevel : aitemInfoP.CriticalLevel);
                    aitemList.FeedbackTo = (aitemInfoP.FeedbackTo == null ? aitemList.FeedbackTo : aitemInfoP.FeedbackTo);
                    aitemList.Feedback = (aitemInfoP.Feedback == null ? aitemList.Feedback : aitemInfoP.Feedback);
                    aitemList.Rootcause = (aitemInfoP.Rootcause == null ? aitemList.Rootcause : aitemInfoP.Rootcause);
                    aitemList.Correctiveaction = (aitemInfoP.Correctiveaction == null ? aitemList.Correctiveaction : aitemInfoP.Correctiveaction);
                    aitemList.Preventiveaction = (aitemInfoP.Preventiveaction == null ? aitemList.Preventiveaction : aitemInfoP.Preventiveaction);
                    aitemList.ImplementDate = (aitemInfoP.ImplementDate == null ? aitemList.ImplementDate : aitemInfoP.ImplementDate);
                    aitemList.Verifiedby = (aitemInfoP.Verifiedby == null ? aitemList.Verifiedby : aitemInfoP.Verifiedby);
                    aitemList.Appreciation = (aitemInfoP.Appreciation == null ? aitemList.Appreciation : aitemInfoP.Appreciation);
                    aitemList.Type = (aitemInfoP.Type == null ? aitemList.Type : aitemInfoP.Type);
                    aitemList.Attachment = (aitemInfoP.Attachment == null ? aitemList.Attachment : aitemInfoP.Attachment);
                    aitemList.UpdatedBy = int.Parse(Session["LoginID"].ToString());
                    aitemList.UpdatedTime = DateTime.Now;
                    aDBManager.SaveChanges();

                    return Json("Feedback & Appreciation Info Updated Successfully...");
                }
                else
                {
                    aitemInfoP.UpdatedBy = int.Parse(Session["LoginID"].ToString());
                    aitemInfoP.UpdatedTime = DateTime.Now;
                    aitemInfoP.CreatedBy = int.Parse(Session["LoginID"].ToString());
                    aitemInfoP.CreatedTime = DateTime.Now;
                    aitemInfoP.FeedbackDate = DateTime.Now;

                    aDBManager.Tbl_Feedback.Add(aitemInfoP);
                    aDBManager.SaveChanges();

                    return Json("Feedback & Appreciation Info Added Successfully...");
                }
            }
            catch (Exception ex)
            {
                return Json("Error " + ex.Message);

            }


        }
        [HttpPost]
        public ActionResult FeedbackDelete(Tbl_Feedback aobjP)
        {
            try
            {

                var aitemList = aDBManager.Tbl_Feedback.Single(item => item.FeedbackID == aobjP.FeedbackID);
                aitemList.IsDeleted = 1;
                aitemList.UpdatedBy = int.Parse(Session["LoginID"].ToString());
                aitemList.UpdatedTime = DateTime.Now;
                aDBManager.SaveChanges();

                return Json("Feedback Info Deleted Successfully...");


            }
            catch (Exception ex)
            {
                return Json("Error " + ex.Message);

            }
        }

        [HttpPost]
        public ActionResult AddFileupload()
        {

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

                        string zPlacePathL = Server.MapPath(string.Format("~/Source/Feedback/{0}", aTime));
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
        public ActionResult DeleteFile(string atime, string FileNameP)
        {

            string zFilePath = Server.MapPath(string.Format("~/Source/Feedback/{0}/{1}", atime, FileNameP));

            if (System.IO.File.Exists(zFilePath))
            {
                System.IO.File.Delete(zFilePath);
            }
            return Json("File Deleted", JsonRequestBehavior.AllowGet);
        }

        public List<SelectListItem> GetPublisherList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager.Publishers.Where(item => (item.Publ_Status == null) || (item.Publ_Status == false)).Select(item => new { item.Publ_Acronym, item.Publ_ID }).ToList();
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

        [HttpGet]
        public ActionResult GetNumberList(int zPublID)
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            var aUserInfo = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == nUserID);
            List<SelectListItem> Numberitems = new List<SelectListItem>();
            var aNumberList = aDBManager.TBL_MainMaster.Where(item =>
            item.PublisherID.ToString() == zPublID.ToString()
            && (item.PMName.ToString() != null)
                        && (item.PMName.ToString() != "")
                        && item.PEName == (aUserInfo.UserType == "PE" ? nUserID : item.PEName)
                        && (item.PMName == (aUserInfo.UserType == "PM" ? nUserID : item.PMName) || item.TSPM == (aUserInfo.UserType == "PM" ? nUserID : item.TSPM))
            ).Select(item => new { item.ID, item.Number }).ToList();


            foreach (var item in aNumberList)
            {
                Numberitems.Add(new SelectListItem()
                {
                    Value = item.ID.ToString(),
                    Text = item.Number

                });
            }


            return Json(new { Numberitems }, JsonRequestBehavior.AllowGet);

        }

        [HttpGet]
        public ActionResult GetChapterList(int zBookID)
        {

            List<SelectListItem> Numberitems = new List<SelectListItem>();
            var aNumberList = aDBManager.TBL_SubMaster.Where(item => item.MainID.ToString() == zBookID.ToString()).Select(item => new { item.Number }).ToList();


            foreach (var item in aNumberList)
            {
                Numberitems.Add(new SelectListItem()
                {
                    Value = item.Number.ToString(),
                    Text = item.Number

                });
            }


            return Json(new { Numberitems }, JsonRequestBehavior.AllowGet);

        }

        //public List<SelectListItem> GetNumberList(bool awithAllC = true)
        //{
        //    List<SelectListItem> items = new List<SelectListItem>();
        //    DataTable aDtL = new DataTable();
        //    var aitemList = aDBManager.TBL_MainMaster.Select(item => new { item.Number, item.ID }).ToList();
        //    if (awithAllC)
        //        items.Add(new SelectListItem { Text = "All", Value = "All" });

        //    foreach (var item in aitemList)
        //    {
        //        items.Add(new SelectListItem()
        //        {
        //            Value = item.Number == null ? string.Empty : item.ID.ToString().ToUpper(),
        //            Text = item.Number == null ? string.Empty : item.Number.ToUpper()

        //        });
        //    }

        //    return items;
        //}

        //public List<SelectListItem> GetChapterList(bool awithAllC = true)
        //{
        //    List<SelectListItem> items = new List<SelectListItem>();
        //    DataTable aDtL = new DataTable();
        //    var aitemList = aDBManager.Chapters.Select(item => new { item.Chapter_Number }).ToList();
        //    if (awithAllC)
        //        items.Add(new SelectListItem { Text = "All", Value = "All" });

        //    foreach (var item in aitemList)
        //    {
        //        items.Add(new SelectListItem()
        //        {
        //            Value = item.Chapter_Number == null ? string.Empty : item.Chapter_Number.ToUpper(),
        //            Text = item.Chapter_Number == null ? string.Empty : item.Chapter_Number.ToUpper()

        //        });
        //    }

        //    return items;
        //}

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult GetFeedbackDetails(string zFeedbackID)
        {
            var aitemList = aDBManager.Tbl_Feedback.Where(item => item.FeedbackID.ToString() == zFeedbackID.ToString()).ToList();
            string json = "";
            try
            {
                json = JsonConvert.SerializeObject(aitemList, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });

            }


            catch (Exception ex)
            {

                return Json(ex.Message);
            }
            string[] aFileList = { };
            if (aitemList.Count > 0)
            {
                if (aitemList[0].Attachment != null && aitemList[0].Attachment != "")
                {
                    string zPath = string.Format("~/Source/Feedback/{0}", aitemList[0].Attachment);
                    if (Directory.Exists(Server.MapPath(zPath)))
                        aFileList = Directory.GetFiles(Server.MapPath(zPath), "*.*", SearchOption.AllDirectories);
                }

            }


            return Json(new { json, aFileList }, JsonRequestBehavior.AllowGet);

        }

        #endregion
        public void SendMailTooTSPM()
        {
            var books = aDBManager.TBL_MainMaster.ToList();
            string emailID = string.Empty;
            StringBuilder stringBuilder = new StringBuilder();

            foreach (var item in books)
            {
                var bookStatus = aDBManager.SP_GetCurrentBookStatusWithUser(item.ID).ToList();
                foreach (var itm in bookStatus)
                {
                    emailID = itm.EmailID;

                    stringBuilder.Append(itm.Activity + ',');
                }

                if (bookStatus.Count() > 0)
                {
                    var mail = MailModels.Mail(
                                        To: emailID,
                                        Cc: "girish@novatechset.com;tandfbooks@novatechset.com;shashi@novatechset.com",
                                        Bcc: "",
                                        Subject: "Pending activiy for book - " + item.Title,
                                        Body: "'" + stringBuilder.ToString() + "' these activities of " + item.Number + "(" + item.Catalog + ") not enough closed. Please complete these activities.",
                                        DisplayName: "SESAME"
                                        );
                }
            }
        }

    }
}
