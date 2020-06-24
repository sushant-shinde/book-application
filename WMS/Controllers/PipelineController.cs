using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WMS.Models;
using System.Data;
using Newtonsoft.Json;
using System.IO;
using System.Globalization;

namespace WMS.Controllers
{
    public class PipelineController : Controller
    {
        // GET: Pipeline
        WMSEntities aDBManager = new WMSEntities();

        public ActionResult Index()
        {
            PipelineModel aPipeline = new PipelineModel();
            aPipeline.PublisherList = GetPublisherList(false);
            return View(aPipeline);
        }

        [HttpPost]
        public ActionResult GetPipelineData(bool zFirstLoad, string zFromDt, string zToDt)
        {

            try
            {


                var aReportDataL = from B in aDBManager.TBL_Pipeline
                                   join Publ in aDBManager.Publishers on B.PublisherID equals Publ.Publ_ID into gj
                                   from subset in gj.DefaultIfEmpty().Where(item => (B.IsDeleted == 0) || (B.IsDeleted == null))
                                   select new PipelineList
                                   {
                                       ISBN = B.ISBN,
                                       ID = B.ID,
                                       Title = B.Title,
                                       AuthorName = B.AuthorName,
                                       ExpectedDt = B.ExpectedDt,
                                       Publisher = subset == null ? string.Empty : subset.Publ_Acronym

                                   };


                if (zFirstLoad == false)
                {
                    DateTime dtFrom = Convert.ToDateTime(zFromDt);
                    DateTime dtTo = Convert.ToDateTime(zToDt);
                    aReportDataL = aReportDataL.Where(item => (item.ExpectedDt <= dtTo) && (item.ExpectedDt >= dtFrom));
                }
                else
                {
                    aReportDataL = aReportDataL.Where(item => (item.ExpectedDt >= DateTime.Now));
                }

                var aItemList = aReportDataL.ToList();

                return Json(new { aItemList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult GetPipelineDetails(string zPipelineID)
        {
            var aitemList = aDBManager.TBL_Pipeline.Where(item => item.ID.ToString() == zPipelineID.ToString()).ToList();
            string json = "";
            try
            {
                json = JsonConvert.SerializeObject(aitemList, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });

            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

            return Json(json, JsonRequestBehavior.AllowGet);

        }


        [HttpPost]
        public ActionResult PipelineUpdate(TBL_Pipeline aobjP)
        {
            try
            {
                if (aobjP.ID != 0)
                {
                    var aitemList = aDBManager.TBL_Pipeline.Single(item => item.ID == aobjP.ID);
                    aitemList.ISBN = (aobjP.ISBN == null ? aitemList.ISBN : aobjP.ISBN);
                    aitemList.Title = (aobjP.Title == null ? aitemList.Title : aobjP.Title);
                    aitemList.AuthorName = (aobjP.AuthorName == null ? aitemList.AuthorName : aobjP.AuthorName);
                    aitemList.ExpectedDt = (aobjP.ExpectedDt == null ? aitemList.ExpectedDt : aobjP.ExpectedDt);
                    aitemList.PublisherID = (aobjP.PublisherID == null ? aitemList.PublisherID : aobjP.PublisherID);
                    aitemList.UpdatedBy = Session["LoginID"].ToString();
                    aitemList.UpdatedTime = DateTime.Now;
                    aDBManager.SaveChanges();

                    return Json("Pipeline Info Updated Successfully...");
                }
                else
                {
                    aobjP.UpdatedBy = Session["LoginID"].ToString();
                    aobjP.UpdatedTime = DateTime.Now;

                    aDBManager.TBL_Pipeline.Add(aobjP);
                    aDBManager.SaveChanges();

                    return Json("Pipeline Info Updated Successfully...");
                }
            }
            catch (Exception ex)
            {
                return Json("Error " + ex.Message);

            }
        }


        [HttpPost]
        public ActionResult PipelineDelete(TBL_Pipeline aobjP)
        {
            try
            {

                var aitemList = aDBManager.TBL_Pipeline.Single(item => item.ID == aobjP.ID);
                aitemList.IsDeleted = 1;
                aitemList.UpdatedBy = Session["LoginID"].ToString();
                aitemList.UpdatedTime = DateTime.Now;
                aDBManager.SaveChanges();

                return Json("Pipeline Info Deleted Successfully...");


            }
            catch (Exception ex)
            {
                return Json("Error " + ex.Message);

            }
        }

        [HttpGet]
        public ActionResult CheckExistingData(string ValueData, string zType, string ZID)
        {
            bool ifExist = false;
            try
            {

                var items = aDBManager.TBL_Pipeline.ToList();
                if (zType == "ISBN")
                {
                    items = aDBManager.TBL_Pipeline.Where(x => x.ID.ToString() != ZID && x.ISBN == ValueData).ToList();
                }

                ifExist = items.Count == 0 ? true : false;

                return Json(!ifExist, JsonRequestBehavior.AllowGet);

            }

            catch (Exception ex)
            {
                return Json(false, JsonRequestBehavior.AllowGet);

            }

        }

        public List<SelectListItem> GetPublisherList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager.Publishers.Where(item => (item.Publ_Status == null) || (item.Publ_Status == false)).Select(item => new { item.Publ_Acronym, item.Publ_ID }).ToList();
            if (awithAllP)
                items.Add(new SelectListItem { Text = "Select", Value = "" });

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
    }
}