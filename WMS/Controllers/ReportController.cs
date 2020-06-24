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
    public class ReportController : Controller
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
        // GET: Report
        public ActionResult Index()
        {
            return View();
        }


        #region OOF History
       
        public ActionResult OofHistory()
        {
            return View();
        }

        [HttpPost]
        public ActionResult GetOOFHistory(string zFromDate,string zTodate)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());
            DateTime aFromdate =Convert.ToDateTime(zFromDate);
            DateTime aTodate = Convert.ToDateTime(zTodate);
            var aItemList = aDBManager.SP_GetOOFHistory(nLoginID, aFromdate, aTodate);
            return Json(new { aItemList }, JsonRequestBehavior.AllowGet);
        }

        #endregion


        #region Proof Tracking Report

        public ActionResult PTReport()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
         
            ProofDistributionModel aBookdetails = new ProofDistributionModel();
            aBookdetails.NumberList = Common.GetNumberList(nUserID, false);
            return View(aBookdetails);

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

        [HttpPost]
        public ActionResult PopulateProofTracking_Report(int zBookID, string Stage, string UType)
        {
            var aBookData = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.Number == zBookID.ToString());
            int BookID = aBookData.ID;

        
            var aitemList = aDBManager.SP_GetProofTrackingData(BookID, Stage, UType).ToList();

            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region Freelancer Allocate History

        public ActionResult FSAllocate()
        {
            return View();
        }

        [HttpPost]
        public ActionResult GetFreelancerAllocate(string zFromDate, string zTodate,string zFilterType)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());
            DateTime aFromdate = Convert.ToDateTime(zFromDate);
            DateTime aTodate = Convert.ToDateTime(zTodate);
            var aItemList = aDBManager.SP_Freelancer_Allocate_Hisotry(nLoginID, aFromdate, aTodate, zFilterType);
            return Json(new { aItemList }, JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region Freelancer Allocate History

        public ActionResult AEAllocate()
        {
            return View();
        }

        [HttpPost]
        public ActionResult GetAEAllocate(string zFromDate, string zTodate,string zFilterType)
        {
            int nLoginID = int.Parse(Session["LoginID"].ToString());
            DateTime aFromdate = Convert.ToDateTime(zFromDate);
            DateTime aTodate = Convert.ToDateTime(zTodate);
            var aItemList = aDBManager.SP_AE_Allocate_History(nLoginID, aFromdate, aTodate, zFilterType);
            return Json(new { aItemList }, JsonRequestBehavior.AllowGet);
        }

        #endregion
    }
}