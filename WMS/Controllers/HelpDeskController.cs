using Ionic.Zip;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WMS.Models;

namespace WMS.Controllers
{
    public class HelpDeskController : Controller
    {
        WMSEntities aDBManager = new WMSEntities();
        // GET: HelpDesk
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult GetHelpdeskDetails(string aStatus)
        {
            int aUserID = int.Parse(Session["LoginID"].ToString());



            var aitemList = aDBManager.SP_GetHelpdeskDetailsbyID(aUserID, aStatus).ToList();

            //var aitemCount= aDBManager.SP_GetHelpdeskDetailsbyID(aUserID, "Pending").Count();
            //Session["HelpdeskCount"] = aitemCount;


            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult GetHelpdeskDetailsByTicketID(int TicketID)
        {
            int aUserID = int.Parse(Session["LoginID"].ToString());
            var aitemList = aDBManager.SP_GetTicketDetailsByTicketID(TicketID, aUserID).ToList();

            //var aitemList_Reason = aDBManager.Tbl_HelpdeskComment.Where(item => item.ID == TicketID).
            //   Select(item => new { item.ID, item.CommentID, item.SubmittedDate, item.Comment }).
            //   OrderByDescending(item => item.SubmittedDate)
            //   .ToList();

            var aitemList_Reason = aDBManager.SP_GetCommentsHelpDesk(TicketID).ToList();

            return Json(new { aitemList, aitemList_Reason }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult AddTicket(Tbl_HelpDesk aitemInfoP, string[] FileListL, string zTime)
        {
            try
            {

                string aID = "";
                string aticketno = aitemInfoP.Ticket_No.ToString();
                if (aitemInfoP.ID == 0)
                {
                    if (FileListL != null && FileListL.Length > 0)
                    {
                        string path = Server.MapPath(string.Format("~/Source/HelpDesk/{0}/{1}", aticketno, zTime));
                        string[] Filenames = Directory.GetFiles(path);

                        if (Filenames.Length > 0)
                        {
                            using (ZipFile zip = new ZipFile())
                            {
                                zip.AddFiles(Filenames, aticketno + zTime);
                                zip.Save(Path.Combine(string.Format(path + "/{0}.zip", aticketno + zTime)));

                            }
                        }

                        var files = Directory.GetFiles(path).Where(name => !name.EndsWith(".zip"));
                        foreach (string filePath in files)
                        {
                            System.IO.File.Delete(filePath);
                        }
                    }
                    aitemInfoP.submitttedBy = int.Parse(Session["LoginID"].ToString());
                    aitemInfoP.Created_Date = DateTime.Now;
                    aitemInfoP.UpdatedTime = DateTime.Now;
                    aitemInfoP.Status = "Pending";
                    aitemInfoP.IsDeleted = 0;
                    aitemInfoP.Attachment = (FileListL == null ? null : string.Format("~/Source/HelpDesk/{0}/{1}/{2}", aticketno, zTime, aticketno + zTime + ".zip"));
                    aDBManager.Tbl_HelpDesk.Add(aitemInfoP);
                    aDBManager.SaveChanges();
                    aID = aitemInfoP.ID.ToString();

                    int aUserID = int.Parse(Session["LoginID"].ToString());

                    var aitem = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == aUserID);

                    var zItemList = aDBManager.SP_GetTicketDetailsByTicketID(aitemInfoP.Ticket_No, aUserID).SingleOrDefault();


                    var mail = MailModels.Mail(
                                                           To: aitem.EmailID,
                                                           Cc: "sesame@novatechset.com",
                                                           Bcc: "",
                                                           Subject: "Ticket ID - " + zItemList.Ticket_No + " : " + zItemList.subject,
                                                           Body: "<p>Dear " + aitem.LoginName + ",</p></br><p>We would like to acknowledge that we have received your request and a ticket has been created.</p>A support representative will be reviewing your request and will send you a personal response shortly.<p>Thank you for your patience.</p>"

                                                           );



                }


                return Json(aID);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }
        }

        [HttpPost]

        public ActionResult GetAutoID()
        {
            int? counter = 0;
            try
            {
                var itemList = (from c in aDBManager.Tbl_HelpDesk select c.ID).Max();

                if (itemList == 0)
                {
                    counter = 1;
                }
                else
                {
                    counter = itemList + 1;
                }
            }
            catch (Exception)
            {

                counter = 1;
            }
            return Json(new { counter }, JsonRequestBehavior.AllowGet);

        }

        #region Attachment

        [HttpPost]
        public ActionResult FileuploadM()
        {


            string aTicketNo = Request["ID"];
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

                        string zPlacePathL = Server.MapPath(string.Format("~/Source/HelpDesk/{0}/{1}", aTicketNo, aTime));
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
        [HttpPost]
        public ActionResult DeleteFile(int aTickitID, string FileNameP, string zTime)
        {

            string zFilePath = Server.MapPath(string.Format("~/Source/HelpDesk/{0}/{1}/{2}", aTickitID, zTime, FileNameP));

            if (System.IO.File.Exists(zFilePath))
            {
                System.IO.File.Delete(zFilePath);
            }
            return Json("File Deleted", JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult DeleteallFilesFromFolder(int aTickitID)
        {

            string zFilePath = Server.MapPath(string.Format("~/Source/HelpDesk/{0}", aTickitID));

            if (Directory.Exists(zFilePath))
            {
                DeleteDirectory(zFilePath);
            }

            //if (System.IO.File.Exists(zFilePath))
            //{
            //    System.IO.File.Delete(zFilePath);
            //}
            return Json("", JsonRequestBehavior.AllowGet);
        }

        private void DeleteDirectory(string path)
        {
            foreach (string filename in Directory.GetFiles(path))
            {
                System.IO.File.Delete(filename);
            }
            foreach (string subfolders in Directory.GetDirectories(path))
            {
                Directory.Delete(subfolders, true);
            }
        }

        [HttpPost]
        public ActionResult GetFiles(int aTicketNo, string aTime)
        {

            string[] aFileListHD = { };

            string zPath = string.Format("~/Source/HelpDesk/{0}/{1}", aTicketNo, aTime);

            if (Directory.Exists(Server.MapPath(zPath)))
                aFileListHD = Directory.GetFiles(Server.MapPath(zPath), "*.*", SearchOption.AllDirectories);

            return Json(new { aFileListHD }, JsonRequestBehavior.AllowGet);

        }
        #endregion

        #region DisplayAllTicketsToResolve
        public ActionResult Display()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            if (nUserID != 1 && Session["UserType"].ToString() != "PM")
                return RedirectToAction("index");
            else
                return View();
        }

        [HttpPost]
        public ActionResult GetallHDdetails(string aStatus)
        {
            string zUserType = Session["UserType"].ToString();
            var aitemList = aDBManager.SP_GetHelpDeskdata_All(aStatus).ToList();
            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult DeleteTicket(int nID)
        {

            var zWrkList = aDBManager.Tbl_HelpDesk.SingleOrDefault(item => item.ID == nID);

            zWrkList.IsDeleted = 1;
            zWrkList.UpdatedTime = DateTime.Now;
            var aticketID = zWrkList.ID;
            aDBManager.SaveChanges();

            return Json(aticketID, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult UpdateTicketStatus(int aID)
        {

            int aUserID = int.Parse(Session["LoginID"].ToString());

            var zaitemList = aDBManager.Tbl_HelpDesk.SingleOrDefault(item => item.ID == aID);
            if (zaitemList != null)
            {

                zaitemList.Status = "Resolved";
                zaitemList.ResolvedBy = aUserID.ToString();
                zaitemList.UpdatedTime = DateTime.Now;

                aDBManager.SaveChanges();
            }



            return Json("Ticket Status updated Successfully!", JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult UpdateStatusbyUser(int aID, string aStatus)
        {

            var zaitemList = aDBManager.Tbl_HelpDesk.SingleOrDefault(item => item.ID == aID);
            if (zaitemList != null)
            {

                zaitemList.Status = aStatus;
                zaitemList.UpdatedTime = DateTime.Now;

                aDBManager.SaveChanges();
            }



            return Json("Ticket " + aStatus + " Successfully!", JsonRequestBehavior.AllowGet);

        }


        #endregion

        #region ReopenTicketReason
        [HttpPost]
        public ActionResult AddReopenReason(Tbl_HelpdeskComment aitemInfoP)
        {
            try
            {
                string aID = "";
                aitemInfoP.SubmittedBy = int.Parse(Session["LoginID"].ToString());
                aitemInfoP.SubmittedDate = DateTime.Now;
                aitemInfoP.UpdatedTime = DateTime.Now;
                aitemInfoP.IsDeleted = 0;

                aDBManager.Tbl_HelpdeskComment.Add(aitemInfoP);
                aDBManager.SaveChanges();
                aID = aitemInfoP.ID.ToString();
                return Json(aID);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }

        }

        [HttpPost]
        public ActionResult GetReasonsbyTicketID(int TicketID)
        {
            //var aitemList = aDBManager.Tbl_HelpdeskComment.Where(item => item.ID == TicketID).
            //    Select(item => new { item.ID, item.CommentID, item.SubmittedDate,item.Comment }).
            //    OrderByDescending(item => item.SubmittedDate)
            //    .ToList();

            var aitemList = aDBManager.SP_GetCommentsHelpDesk(TicketID).ToList();




            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);
        }

        #endregion

        [HttpPost]
        public ActionResult SendMailToUser(int zTicketID, string zComment)
        {


            using (var dbcontext = new WMSEntities())
            {

                try
                {
                    int aUserID = int.Parse(Session["LoginID"].ToString());

                    var aitem = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == aUserID);

                    var zItemList = aDBManager.SP_GetTicketDetailsByTicketID(zTicketID, aUserID).SingleOrDefault();
                    //var aMailItemL = aDBManager.TBL_MailTemplate.SingleOrDefault(item => item.Template == "HelpDesk");

                    //string Mailbody = aMailItemL.MailContent;

                    var mail = MailModels.Mail(
                                                           To: zItemList.SubmitEmailID,
                                                           Cc: zItemList.ResloveEmailID,
                                                           Bcc: "",
                                                           Subject: "Ticket ID - " + zItemList.Ticket_No + " : " + zItemList.subject,
                                                           Body: "<p>Hi, Your ticket is Resolved and Response as " + zComment + ". Ticket Resolved By " + aitem.LoginName + ".</p></br><p>Thanks,</p><p>SESAME</p>"

                                                           );



                }

                catch (Exception ex)
                {
                    return Json("Error : " + ex.Message, JsonRequestBehavior.AllowGet);
                }

            }
            return Json("Mail Send Successfully !", JsonRequestBehavior.AllowGet);


        }


        #region Information dissemination management
        public ActionResult Instruction()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            BookModels aFeedbackData = new BookModels();

            aFeedbackData.NumberList = Common.GetNumberList(nUserID, false);

            //aFeedbackData.ChapterList = GetChapterList();
            return View(aFeedbackData);
        }




        [HttpGet]
        public ActionResult GetChapterList(string zBookID)
        {
            if (zBookID == "All")
            {

                List<SelectListItem> Numberitems = new List<SelectListItem>();
                var aNumberList = aDBManager.TBL_SubMaster.Select(item => new { item.Number }).Distinct().ToList();


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
            else
            {
                var aitem = aDBManager.TBL_MainMaster.Where(item => item.Number == zBookID).SingleOrDefault();

                int aID = aitem.ID;

                List<SelectListItem> Numberitems = new List<SelectListItem>();
                var aNumberList = aDBManager.TBL_SubMaster.Where(item => item.MainID.ToString() == aID.ToString()).Select(item => new { item.Number }).ToList();


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
        }

        [HttpPost]
        public ActionResult AddInstruction(Tbl_Instruction aitemInfoP)
        {
            try
            {

                string aID = "";

                if (aitemInfoP.Inst_ID != 0)
                {
                    var aitemList = aDBManager.Tbl_Instruction.Single(item => item.Inst_ID == aitemInfoP.Inst_ID);
                    aitemList.BookID = aitemInfoP.BookID;
                    aitemList.ChapterNo = aitemInfoP.ChapterNo;

                    aitemList.Instruction_Type = aitemInfoP.Instruction_Type;
                    aitemList.Instruction = aitemInfoP.Instruction;
                    aitemList.UpdatedBy = int.Parse(Session["LoginID"].ToString());
                    aitemList.UpdatedTime = DateTime.Now;
                    aDBManager.SaveChanges();
                    aID = aitemList.Inst_ID.ToString();

                }
                else
                {
                    aitemInfoP.CreatedBy = int.Parse(Session["LoginID"].ToString());
                    aitemInfoP.CreatedTime = DateTime.Now;
                    aitemInfoP.UpdatedBy = int.Parse(Session["LoginID"].ToString());
                    aitemInfoP.UpdatedTime = DateTime.Now;
                    aitemInfoP.IsTriggered = 0;
                    aitemInfoP.IsDeleted = 0;

                    aDBManager.Tbl_Instruction.Add(aitemInfoP);
                    aDBManager.SaveChanges();
                    aID = aitemInfoP.Inst_ID.ToString();
                }



                return Json(aID);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }
        }

        [HttpPost]
        public ActionResult PopulateInstructionData()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            var aitemList = aDBManager.SP_GetInstructionData(nUserID).ToList();

            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult PopulateInstructionByID(int aInstID)
        {
            var aitemList = aDBManager.Tbl_Instruction.Where(item => (item.IsDeleted == 0) && (item.Inst_ID == aInstID)).SingleOrDefault();

            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult DeleteInstruction(int nID)
        {
            int aUserID = int.Parse(Session["LoginID"].ToString());
            var zWrkList = aDBManager.Tbl_Instruction.SingleOrDefault(item => item.Inst_ID == nID);

            zWrkList.IsDeleted = 1;
            zWrkList.UpdatedBy = aUserID;
            zWrkList.UpdatedTime = DateTime.Now;

            aDBManager.SaveChanges();

            return Json("Instruction details Deleted Successfully!", JsonRequestBehavior.AllowGet);
        }


        [HttpGet]
        [ValidateInput(false)]
        public ActionResult CheckExistingData(string zBookID, string zchapterno, string zIntructionTo, string zIntruction)
        {
            bool ifchapterExist = false;

            var aitemList = aDBManager.Tbl_Instruction.Where(x => (x.BookID.ToString() == zBookID) && (x.Instruction.Contains(zIntruction)) && (x.IsDeleted == 0)).
                        Select(x => new { x.ChapterNo, x.Instruction_Type, x.Instruction }).ToList();


            ifchapterExist = aitemList.Count == 0 ? true : false;


            return Json(aitemList, JsonRequestBehavior.AllowGet);

        }


        #endregion

    }
}
