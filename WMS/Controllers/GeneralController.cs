using Ionic.Zip;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WMS.Models;

namespace WMS.Controllers
{
    public class GeneralController : Controller
    {
        WMSEntities aDBManager = new WMSEntities();

        // GET: General
        public ActionResult Index()
        {
            return View();
        }


        #region Mail Template Settings
        [CustomAuthorizeAttribute]
        public ActionResult MailTemplate()
        {
            return View();
        }

        [HttpPost]
        public ActionResult GetMailTemplateDetails()
        {
            var aitemList = aDBManager.TBL_MailTemplate.Where(item=> item.IsDeleted==0).ToList();

            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult PopulateMailDetailsByID(int aID)
        {
            var aitemList = aDBManager.TBL_MailTemplate.Where(item => (item.IsDeleted == 0) && (item.SNo == aID)).SingleOrDefault();

            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult UpdateMailTemplate(TBL_MailTemplate aitemInfoP)
        {
            try
            {
                int nUserID = int.Parse(Session["LoginID"].ToString());
                var aUserList = aDBManager.UserMasters.Single(item => item.UserID == nUserID);
                string aID = "";

                if (aitemInfoP.SNo != 0)
                {
                    var aitemList = aDBManager.TBL_MailTemplate.Single(item => item.SNo == aitemInfoP.SNo);
                    aitemList.Template = aitemInfoP.Template;
                    aitemList.MailContent = aitemInfoP.MailContent;
                    aitemList.UpdatedBy = aUserList.LoginID;
                    aitemList.UpdatedTime = DateTime.Now;
                    aDBManager.SaveChanges();
                    aID = aitemList.SNo.ToString();

                }
                else
                {
                    aitemInfoP.MailContent = "<html><head><meta http-equiv='Content-Type' content='text/html;charset=utf-8'/></head><body>"+ aitemInfoP.MailContent+"</body></html>";
                    aitemInfoP.CreatedBy = aUserList.LoginID;
                    aitemInfoP.CreatedTime = DateTime.Now.ToString();
                    aitemInfoP.UpdatedBy = aUserList.LoginID;
                    aitemInfoP.UpdatedTime = DateTime.Now;
                    aitemInfoP.IsDeleted = 0;

                    aDBManager.TBL_MailTemplate.Add(aitemInfoP);
                    aDBManager.SaveChanges();
                    aID = aitemInfoP.SNo.ToString();
                }



                return Json(aID);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }
        }

        [HttpGet]
        [ValidateInput(false)]
        public ActionResult CheckExistingData(string zTemplate)
        {
            bool ifTempExist = false;

            var aitemList = aDBManager.TBL_MailTemplate.Where(x => (x.Template.Contains(zTemplate)) && (x.IsDeleted == 0)).ToList();


            ifTempExist = aitemList.Count == 0 ? true : false;


            return Json(aitemList, JsonRequestBehavior.AllowGet);

        }
        #endregion


        #region Publisher Details
        [CustomAuthorizeAttribute]
        public ActionResult Publisher(int? Year)
        {
            if (Year == null)
            {
                Year = DateTime.Now.Year;
            }
            ViewBag.linktoYearId = GetYears(Year);
            return View();
        }


   private SelectList GetYears(int? iSelectedYear)
        {
            int CurrentYear = DateTime.Now.Year;
            List<SelectListItem> ddlYears = new List<SelectListItem>();

            for (int i = CurrentYear-3; i <= CurrentYear; i++)
            {
                ddlYears.Add(new SelectListItem
                {
                    Text = i.ToString(),
                    Value = i.ToString()
                });
            }

        
            return new SelectList(ddlYears, "Value", "Text", iSelectedYear);

        }


        [HttpPost]
        public ActionResult GetPublisherDetails()
        {
            var aitemList = aDBManager.Publishers.ToList();

            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);

        }


        [HttpPost]
        public ActionResult PopulatePublisherDetailsByID(int aID)
        {
            var aitemList = aDBManager.Publishers.Where(item => (item.Publ_ID == aID)).SingleOrDefault();

            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult UpdatePublDetails(Publisher aiteminfoP)
        {
            try
            {
                var aID = "";
              
                if (aiteminfoP.Publ_ID != 0)
                {
                    var aitemList = aDBManager.Publishers.SingleOrDefault(item => item.Publ_ID == aiteminfoP.Publ_ID);
                    aitemList.Active = aiteminfoP.Active;
                    aitemList.ActiveYear = aiteminfoP.ActiveYear;
                   
                    aDBManager.SaveChanges();
                    aID = aitemList.Publ_ID.ToString();

                }
               
                return Json(aID);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }
        }

        #endregion

        #region Query Template
        public ActionResult QueryTemplate()
        {
            BookModels aBkData = new BookModels();
            aBkData.PublisherList = GetPublisherList(true);
            return View(aBkData);
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
        [HttpPost]
        public ActionResult GetQueryTemplate()
        {
            var aitemList = aDBManager.SP_GetQueryTemplateData().ToList();

            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult UpdateQueryDetails(TBL_QueryTemplate aiteminfoP)
        {
            try
            {
                int nUserID = int.Parse(Session["LoginID"].ToString());
                var aID = "";

                if (aiteminfoP.SNo != 0)
                {
                    var aitemList = aDBManager.TBL_QueryTemplate.SingleOrDefault(item => item.SNo == aiteminfoP.SNo);
                    aitemList.TemplateName = aiteminfoP.TemplateName;
                    aitemList.Subject = aiteminfoP.Subject;
                    aitemList.PublisherID = aiteminfoP.PublisherID;
                    aitemList.MailBoady = aiteminfoP.MailBoady;
                    aitemList.UpdatedBy = nUserID;
                    aitemList.UpdatedTime = DateTime.Now;
                    aDBManager.SaveChanges();
                    aID = aitemList.SNo.ToString();

                }
                else
                {
                    aiteminfoP.TemplateName = aiteminfoP.TemplateName;
                    aiteminfoP.Subject = aiteminfoP.Subject;
                    aiteminfoP.PublisherID = aiteminfoP.PublisherID;
                    aiteminfoP.MailBoady = aiteminfoP.MailBoady ;
                    aiteminfoP.CreatedBy = nUserID;
                    aiteminfoP.CreatedTime = DateTime.Now;
                    aiteminfoP.UpdatedBy = nUserID;
                    aiteminfoP.UpdatedTime = DateTime.Now;
                    aDBManager.TBL_QueryTemplate.Add(aiteminfoP);
                    aDBManager.SaveChanges();
                    aID = aiteminfoP.SNo.ToString();
                }

                return Json(aID);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }
        }

        [HttpGet]
        [ValidateInput(false)]
        public ActionResult CheckExistingDataQuery(string zTemplate)
        {
            bool ifTempExist = false;

            var aitemList = aDBManager.TBL_QueryTemplate.Where(x => (x.TemplateName.Contains(zTemplate))).ToList();


            ifTempExist = aitemList.Count == 0 ? true : false;


            return Json(aitemList, JsonRequestBehavior.AllowGet);

        }


        [HttpPost]
        public ActionResult PopulateQueryTempByID(int aID)
        {
            var aitemList = aDBManager.SP_GetQueryTemplateData().Where(item => (item.SNo == aID)).SingleOrDefault();

            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);
        }
        #endregion
    }
}