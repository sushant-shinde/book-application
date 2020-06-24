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

namespace WMS.Controllers
{
    public class ArchivalController : Controller
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

        // GET: Archival
        [CustomAuthorizeAttribute]
        public ActionResult Index()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
            ArchivalModel aBkData = new ArchivalModel();
            aBkData.PublisherList = Common.GetPublisherList(false);
            aBkData.CatalogList = Common.GetCatalogList(nUserID, false, true);
            aBkData.NumberList = Common.GetNumberList(nUserID, false, true);
            aBkData.ISBNList = Common.GetISBNList(nUserID, false, true);
            return View(aBkData);
        }

        [HttpPost]
        public ActionResult GetArchiveRestoreData(string Type, string CatalogList, string NumList, string ISBNList, string PublList)
        {
            try
            {
                int nUserID = int.Parse(Session["LoginID"].ToString());

                var aItemList = aDBManager.SP_GetBookDataByArchival(nUserID, Type).ToList();

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
        public ActionResult GetArchiveRestoreRpt(string CatalogList, string NumList, string ISBNList, string PublList, string Type, string FromDt, string ToDt, string Search)
        {
            try
            {
                int nUserID = int.Parse(Session["LoginID"].ToString());

                var aItemList = aDBManager.SP_GetArchivalRestoreRpt(nUserID).ToList();


                if (Search == "Type")
                {
                    DateTime dtFrom = Convert.ToDateTime(FromDt);
                    DateTime dtTo = Convert.ToDateTime(ToDt);
                    if (Type == "Archival Pending")
                    {
                        aItemList = aItemList.Where(item => (item.ARType == "Archive") && (item.RequestDt != null) && (item.SucceedDt == null) && item.RequestDt.GetValueOrDefault().Date <= dtTo.Date && item.RequestDt.GetValueOrDefault().Date >= dtFrom.Date).ToList();
                    }
                    else if (Type == "Archival Completed")
                    {
                        aItemList = aItemList.Where(item => (item.ARType == "Archive") && (item.RequestDt != null) && (item.SucceedDt != null) && item.SucceedDt.GetValueOrDefault().Date <= dtTo.Date && item.SucceedDt.GetValueOrDefault().Date >= dtFrom.Date).ToList();
                    }
                    else if (Type == "Restore Pending")
                    {
                        aItemList = aItemList.Where(item => (item.ARType == "Restore") && (item.RequestDt != null) && (item.SucceedDt == null) && item.RequestDt.GetValueOrDefault().Date <= dtTo.Date && item.RequestDt.GetValueOrDefault().Date >= dtFrom.Date).ToList();
                    }
                    else if (Type == "Restore Completed")
                    {

                        aItemList = aItemList.Where(item => (item.ARType == "Restore") && (item.RequestDt != null) && (item.SucceedDt != null) && item.SucceedDt.GetValueOrDefault().Date <= dtTo.Date && item.SucceedDt.GetValueOrDefault().Date >= dtFrom.Date).ToList();
                    }
                    else
                    {
                        aItemList = aItemList.Where(item => item.SucceedDt.GetValueOrDefault().Date <= dtTo.Date && item.SucceedDt.GetValueOrDefault().Date >= dtFrom.Date).ToList();
                    }
                }
                else
                {
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

                }


                return Json(new { aItemList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }

        [HttpPost]
        public ActionResult UpdateArchiveRestoreInfo(string Type, string[] ArchiveGridL)
        {

            //string nUserID = Session["LoginID"].ToString();
            int nUserID = int.Parse(Session["LoginID"].ToString());
            using (var dbcontext = new WMSEntities())
            {

                using (DbContextTransaction transaction = dbcontext.Database.BeginTransaction())
                {
                    try
                    {
                        foreach (var item in ArchiveGridL)
                        {
                            string[] zstrSplit = item.Split(',');
                            string BookNo = zstrSplit[3].ToString();
                            var aitemList = aDBManager.TBL_MainMaster.Where(i => i.Number.ToString() == BookNo).ToList();


                            if (zstrSplit[1] == "true")
                            {
                                if (Type == "Archive")
                                {
                                    dbcontext.TBL_ArchiveRestore.Add(new TBL_ArchiveRestore()
                                    {
                                        Type = Type,
                                        ArchivalRequestDt = DateTime.Now,
                                        ArchivalStatus = "Pending",
                                        ArchiveRequestedBy= nUserID,
                                        MainID = aitemList[0].ID
                                    });
                                    dbcontext.SaveChanges();
                                    aitemList[0].Archived = 1;
                                    aDBManager.SaveChanges();
                                    TBL_Signaldetails tblSignal = new TBL_Signaldetails();
                                    tblSignal.Description = "INSERT INTO ArchivalBookInfo (PubID, PubName, Book_ID, BookNo, Stdate, ArchivalStatus, ArchivalRequestDate) VALUES ((SELECT Publ_ID FROM Publishers WHERE Book='Yes' and Publ_Acronym='" + zstrSplit[2].ToString() + "'),'" + zstrSplit[2].ToString() + "' , (SELECT Book_ID FROM Books WHERE  Book_Number='" + zstrSplit[3].ToString() + "' ), '" + zstrSplit[3].ToString() + "', GETDATE(),'Yes', GETDATE())";
                                    tblSignal.IsSynch = 0;
                                    tblSignal.Type = "Query";
                                    tblSignal.UpdatedTime = DateTime.Now;
                                    aDBManager.TBL_Signaldetails.Add(tblSignal);
                                    aDBManager.SaveChanges();
                                }
                                else
                                {
                                    dbcontext.TBL_ArchiveRestore.Add(new TBL_ArchiveRestore()
                                    {
                                        Type = "Restore",
                                        RestoreType = Type,
                                        RestoreRequestDate = DateTime.Now,
                                        RestoreRequestStatus = "Pending",
                                        RestoreRequestedBy = nUserID,
                                        MainID = aitemList[0].ID
                                    });
                                    dbcontext.SaveChanges();
                                    aitemList[0].Archived = 0;
                                    aDBManager.SaveChanges();

                                    if (Type == "Reprint")
                                    {
                                        TBL_Signaldetails tblSignal = new TBL_Signaldetails();
                                        tblSignal.Description = "UPDATE ArchivalBookInfo SET RestoreRequestStatus='Yes',RestoreRequestDate=getdate(), ReArchivalDate=GETDATE()+1, RestoreType='Reprint' WHERE BookNo='" + zstrSplit[3] + "' AND arcid=(SELECT MAX(arcid) FROM ArchivalBookInfo WHERE BookNo='" + zstrSplit[3] + "' ORDER BY arcid DESC)";
                                        tblSignal.IsSynch = 0;
                                        tblSignal.Type = "Query";
                                        tblSignal.UpdatedTime = DateTime.Now;
                                        aDBManager.TBL_Signaldetails.Add(tblSignal);
                                        aDBManager.SaveChanges();
                                    }
                                    else
                                    {
                                        TBL_Signaldetails tblSignal = new TBL_Signaldetails();
                                        tblSignal.Description = "UPDATE ArchivalBookInfo SET RestoreRequestStatus='Yes',RestoreRequestDate=getdate(), ReArchivalDate=GETDATE()+1, RestoreType='Rework' WHERE BookNo='" + zstrSplit[3] + "' AND arcid=(SELECT MAX(arcid) FROM ArchivalBookInfo WHERE BookNo='" + zstrSplit[3] + "' ORDER BY arcid DESC)";
                                        tblSignal.IsSynch = 0;
                                        tblSignal.Type = "Query";
                                        tblSignal.UpdatedTime = DateTime.Now;
                                        aDBManager.TBL_Signaldetails.Add(tblSignal);
                                        aDBManager.SaveChanges();
                                    }


                                }
                            }

                        }
                        transaction.Commit();
                        return Json("Archive/Restore details updated successfully!", JsonRequestBehavior.AllowGet);
                    }
                    catch (Exception ex)
                    {
                        return Json(ex.Message, JsonRequestBehavior.AllowGet);
                    }
                }
            }
        }

    }
}