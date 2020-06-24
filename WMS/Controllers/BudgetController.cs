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
    public class BudgetController : Controller
    {
        WMSEntities aDBManager = new WMSEntities();
        // GET: Budget

        [CustomAuthorizeAttribute]
        public ActionResult Index()
        {
            BudgetModel aBudget = new BudgetModel();
            aBudget.PublisherList = Common.GetPublisherList(false);
            return View(aBudget);
        }
        public ActionResult Budget()
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
        public ActionResult GetBillReport(string Type, string CatalogList, string NumList, string ISBNList, string PublList)
        {
            try
            {
                int nUserID = int.Parse(Session["LoginID"].ToString());

                var aItemList = aDBManager.SP_GetBookDataByBilling(nUserID, Type).ToList();

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

                return Json(new { aItemList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }

        [HttpPost]
        public ActionResult GetBookDetails(int zBookID)
        {
            try
            {
                var aItemList = aDBManager.SP_GetBookDetails(zBookID).ToList();
                var aInvoiceList = aDBManager.TBL_Invoice.Where(items => items.BookID == zBookID).ToList();

                return Json(new { aItemList, aInvoiceList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }
        [HttpPost]
        public ActionResult GetPublisherServiceList(string zPublID)
        {
            try
            {
                var aServiceList = aDBManager.TBL_PriceGrid.Where(aitem => aitem.PublisherID.ToString() == zPublID).Select(item => item.Services).Distinct().ToList();

                return Json(new { aServiceList }, JsonRequestBehavior.AllowGet);


            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }

        [HttpPost]
        public ActionResult GetPublPriceGrid(string zPublID)
        {
            var aitemList = aDBManager.TBL_PriceGrid.Where(item => item.PublisherID.ToString() == zPublID).ToList();
            var aServiceList = aDBManager.TBL_PriceGrid.Select(item => item.Services).Distinct().ToList();
            return Json(new { aitemList, aServiceList }, JsonRequestBehavior.AllowGet);

        }

        [HttpGet]
        public ActionResult GetUnitType()
        {
            var aUnitTypeList = aDBManager.TBL_UnitType.Select(item => new { item.UnitType, item.ID }).Distinct().ToList();
            return Json(new { aUnitTypeList }, JsonRequestBehavior.AllowGet);

        }

        [HttpGet]
        public ActionResult GetComplexity()
        {
            var aComplexityList = aDBManager.TBL_Complexity.Select(item => new { item.Complexity, item.ID }).Distinct().ToList();
            return Json(new { aComplexityList }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult GetServiceComplexityList(string zPublID, string zService)
        {
            try
            {
                var aServiceCList = aDBManager.TBL_PriceGrid.Where(aitem => aitem.PublisherID.ToString() == zPublID && aitem.Services.ToString() == zService).Select(item => item.Complexity).Distinct().ToList();

                return Json(new { aServiceCList }, JsonRequestBehavior.AllowGet);


            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }

        [HttpPost]
        public ActionResult GetTypeComplexityList(string zPublID, string zService, string zComplexity)
        {
            try
            {
                var aTypeCList = aDBManager.TBL_PriceGrid.Where(aitem => aitem.PublisherID.ToString() == zPublID && aitem.Services.ToString() == zService && aitem.Complexity == zComplexity)
                    .Select(item => new {
                        item.OnShoreUnitPrize, item.OnShoreFactor,
                        item.OffShoreUnitPrize,
                        item.OffShoreFactor,
                        item.OffShoreUnitType,
                        item.OnShoreUnitType }).ToList();

                return Json(new { aTypeCList }, JsonRequestBehavior.AllowGet);


            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

        }

        [HttpPost]
        public ActionResult UpdatePriceGrid(string zPublID, string[] PriceGridL)
        {

            string nUserID = Session["LoginID"].ToString();
            using (var dbcontext = new WMSEntities())
            {

                using (DbContextTransaction transaction = dbcontext.Database.BeginTransaction())
                {
                    try
                    {
                        IEnumerable<TBL_PriceGrid> alist = dbcontext.TBL_PriceGrid.Where(i => i.PublisherID.ToString() == zPublID).ToList();
                        dbcontext.TBL_PriceGrid.RemoveRange(alist);
                        dbcontext.SaveChanges();

                        if (PriceGridL != null)
                        {
                            foreach (var item in PriceGridL)
                            {
                                string[] zstrSplit = item.Split(',');

                                dbcontext.TBL_PriceGrid.Add(new TBL_PriceGrid()
                                {
                                    PublisherID = Convert.ToInt32(zPublID),
                                    Services = zstrSplit[1],
                                    Complexity = zstrSplit[2],
                                    OnShoreUnitPrize = Convert.ToDecimal(zstrSplit[3]),
                                    OnShoreFactor = Convert.ToInt32(zstrSplit[4]),
                                    OnShoreUnitType = zstrSplit[5],
                                    OffShoreUnitPrize = Convert.ToDecimal(zstrSplit[6]),
                                    OffShoreFactor = Convert.ToInt32(zstrSplit[7]),
                                    OffShoreUnitType = zstrSplit[8],
                                    UpdatedTime = DateTime.Now,
                                    UpdatedBy = nUserID
                                });
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
            return Json("Service details updated Successfully!", JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult UpdateInvoiceGrid(string zBookID, string[] InvoiceGridL, string zType, int WordCnt, int TypesetPage, int Relable, int Conversion, int SRedraw, int MRedraw, int CRedraw)
        {

            string nUserID = Session["LoginID"].ToString();
            using (var dbcontext = new WMSEntities())
            {

                using (DbContextTransaction transaction = dbcontext.Database.BeginTransaction())
                {
                    try
                    {
                        IEnumerable<TBL_Invoice> alist = dbcontext.TBL_Invoice.Where(i => i.BookID.ToString() == zBookID).ToList();
                        dbcontext.TBL_Invoice.RemoveRange(alist);
                        dbcontext.SaveChanges();


                        foreach (var item in InvoiceGridL)
                        {
                            string[] zstrSplit = item.Split(',');


                            if (zType == "Primary")
                            {
                                dbcontext.TBL_Invoice.Add(new TBL_Invoice()
                                {
                                    BookID = Convert.ToInt32(zBookID),
                                    Service = zstrSplit[1],
                                    Complexity = zstrSplit[2],
                                    Type = zstrSplit[3],
                                    UnitPrice = Convert.ToDecimal(zstrSplit[4]),
                                    Factor = Convert.ToDecimal(zstrSplit[5]),
                                    PublisherCost = Convert.ToDecimal(zstrSplit[6]),
                                    InitialUnitVolume = Convert.ToInt32(zstrSplit[7]),
                                    InitialUnitCost = Convert.ToDecimal(zstrSplit[8]),
                                    AccountingCode = zstrSplit[9],
                                    UpdatedTime = DateTime.Now,
                                    UpdatedBy = nUserID
                                });
                            }
                            else
                            {
                                dbcontext.TBL_Invoice.Add(new TBL_Invoice()
                                {
                                    BookID = Convert.ToInt32(zBookID),
                                    Service = zstrSplit[1],
                                    Complexity = zstrSplit[2],
                                    Type = zstrSplit[3],
                                    UnitPrice = Convert.ToDecimal(zstrSplit[4]),
                                    Factor = Convert.ToDecimal(zstrSplit[5]),
                                    PublisherCost = Convert.ToDecimal(zstrSplit[6]),
                                    InitialUnitVolume = Convert.ToInt32(zstrSplit[7]),
                                    InitialUnitCost = Convert.ToDecimal(zstrSplit[8]),
                                    InvoiceUnitVolume = Convert.ToInt32(zstrSplit[9]),
                                    InvoiceUnitCost = Convert.ToDecimal(zstrSplit[10]),
                                    AccountingCode = zstrSplit[11],
                                    UpdatedTime = DateTime.Now,
                                    UpdatedBy = nUserID
                                });

                            }


                            dbcontext.SaveChanges();
                        }
                        transaction.Commit();

                        var aitemList = aDBManager.TBL_MainMaster.Single(i => i.ID.ToString() == zBookID);
                        aitemList.WordCount = WordCnt;
                        aitemList.ProofPages = TypesetPage;
                        aitemList.Relabel = Relable;
                        aitemList.Conversion = Conversion;
                        aitemList.SimpleRedraw = SRedraw;
                        aitemList.MediumRedraw = MRedraw;
                        aitemList.ComplexRedraw = CRedraw;
                        aDBManager.SaveChanges();
                        return Json("Invoice details updated successfully!", JsonRequestBehavior.AllowGet);
                    }
                    catch (Exception ex)
                    {
                        return Json(ex.Message, JsonRequestBehavior.AllowGet);
                    }
                }
            }
        }


        [HttpPost]
        public ActionResult ApproveInvoiceGrid(string zBookID, string[] InvoiceGridL, string zType, int WordCnt, int TypesetPage, int Relable, int Conversion, int SRedraw, int MRedraw, int CRedraw)
        {

            string nUserID = Session["LoginID"].ToString();
            using (var dbcontext = new WMSEntities())
            {

                using (DbContextTransaction transaction = dbcontext.Database.BeginTransaction())
                {
                    try
                    {
                        IEnumerable<TBL_Invoice> alist = dbcontext.TBL_Invoice.Where(i => i.BookID.ToString() == zBookID).ToList();
                        dbcontext.TBL_Invoice.RemoveRange(alist);
                        dbcontext.SaveChanges();


                        foreach (var item in InvoiceGridL)
                        {
                            string[] zstrSplit = item.Split(',');


                            if (zType == "Primary")
                            {
                                dbcontext.TBL_Invoice.Add(new TBL_Invoice()
                                {
                                    BookID = Convert.ToInt32(zBookID),
                                    Service = zstrSplit[1],
                                    Complexity = zstrSplit[2],
                                    Type = zstrSplit[3],
                                    UnitPrice = Convert.ToDecimal(zstrSplit[4]),
                                    Factor = Convert.ToDecimal(zstrSplit[5]),
                                    PublisherCost = Convert.ToDecimal(zstrSplit[6]),
                                    InitialUnitVolume = Convert.ToInt32(zstrSplit[7]),
                                    InitialUnitCost = Convert.ToDecimal(zstrSplit[8]),
                                    AccountingCode = zstrSplit[9],
                                    PrimaryInvoice = 1,
                                    UpdatedTime = DateTime.Now,
                                    UpdatedBy = nUserID
                                });
                                var aitemList = aDBManager.TBL_MainMaster.Single(i => i.ID.ToString() == zBookID);
                                aitemList.PrimaryInvoice = 1;
                                aitemList.WordCount = WordCnt;
                                aitemList.ProofPages = TypesetPage;
                                aitemList.Relabel = Relable;
                                aitemList.Conversion = Conversion;
                                aitemList.SimpleRedraw = SRedraw;
                                aitemList.MediumRedraw = MRedraw;
                                aitemList.ComplexRedraw = CRedraw;
                                aDBManager.SaveChanges();

                            }
                            else
                            {
                                dbcontext.TBL_Invoice.Add(new TBL_Invoice()
                                {
                                    BookID = Convert.ToInt32(zBookID),
                                    Service = zstrSplit[1],
                                    Complexity = zstrSplit[2],
                                    Type = zstrSplit[3],
                                    UnitPrice = Convert.ToDecimal(zstrSplit[4]),
                                    Factor = Convert.ToDecimal(zstrSplit[5]),
                                    PublisherCost = Convert.ToDecimal(zstrSplit[6]),
                                    InitialUnitVolume = Convert.ToInt32(zstrSplit[7]),
                                    InitialUnitCost = Convert.ToDecimal(zstrSplit[8]),
                                    InvoiceUnitVolume = Convert.ToInt32(zstrSplit[9]),
                                    InvoiceUnitCost = Convert.ToDecimal(zstrSplit[10]),
                                    AccountingCode = zstrSplit[11],
                                    FinalInvoice = 1,
                                    UpdatedTime = DateTime.Now,
                                    UpdatedBy = nUserID

                                });
                                var aitemList = aDBManager.TBL_MainMaster.Single(i => i.ID.ToString() == zBookID);
                                aitemList.FinalInvoice = 1;
                                aitemList.Billed = 1;
                                aitemList.WordCount = WordCnt;
                                aitemList.ProofPages = TypesetPage;
                                aitemList.Relabel = Relable;
                                aitemList.Conversion = Conversion;
                                aitemList.SimpleRedraw = SRedraw;
                                aitemList.MediumRedraw = MRedraw;
                                aitemList.ComplexRedraw = CRedraw;
                                aDBManager.SaveChanges();
                            }


                            dbcontext.SaveChanges();
                        }
                        transaction.Commit();
                        if (zType == "Final")
                        {
                            int nBookID = int.Parse(zBookID);
                            var aBookItem = dbcontext.TBL_MainMaster.SingleOrDefault(item => item.ID == nBookID);
                            aBookItem.Billed = 1;
                            aBookItem.UpdatedBy = nUserID;
                            aBookItem.UpdatedTime = DateTime.Now;
                            dbcontext.SaveChanges();

                            dbcontext.TBL_Signaldetails.Add(new TBL_Signaldetails()
                            {
                                Description = string.Format("update Books set Book_InvoiceStage='Final Web Delivery' where Book_Number='{0}'", aBookItem.Number),
                                Status = "Billed",
                                IsSynch = 0,
                                Type = "Query",
                                UpdatedBy = int.Parse(nUserID),
                                UpdatedTime = DateTime.Now,

                            });
                            dbcontext.SaveChanges();
                        }
                        return Json("Invoice details updated successfully!", JsonRequestBehavior.AllowGet);
                    }
                    catch (Exception ex)
                    {
                        return Json(ex.Message, JsonRequestBehavior.AllowGet);
                    }
                }
            }
        }

        [HttpPost]
        public ActionResult ExcelFiles(string Type, string Catalog, string Title, string UploadType, string AuthorName, string EditorName, string PEName, string[] InvoiceGridL, string WordCount, string ProofPages, string Relabel, string Conversion, string SimpleRedraw, string MediumRedraw, string ComplexRedraw)
        {
            try
            {

                string excelpath = "";
                excelpath = Server.MapPath("~/InvoiceExcel/" + Catalog.Trim() + "_" + Type + ".xlsx");
                if (System.IO.File.Exists(excelpath))
                {
                    System.IO.File.Delete(excelpath);
                }
                FileInfo finame = new FileInfo(excelpath);
                ExcelPackage epExport = new ExcelPackage(finame);
                ExcelWorksheet ewsDetails = epExport.Workbook.Worksheets.Add("invoice");
                ewsDetails.Column(1).Width = 28;
                ewsDetails.Column(2).Width = 46;
                ewsDetails.Column(3).Width = 38;
                ewsDetails.Column(4).Width = 20;
                using (ExcelRange range = ewsDetails.Cells["A1:D1"])
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
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(146, 205, 220));
                }
                if (Type == "Primary")
                {
                    ewsDetails.Cells["A1"].Value = "Preliminary Invoice ";
                }
                else
                {
                    ewsDetails.Cells["A1"].Value = "Final Invoice ";
                }
                ewsDetails.Cells["A2"].Value = "Cat ID";
                ewsDetails.Cells["B2"].Value = "Title";
                ewsDetails.Cells["C2"].Value = "Editor/Author";
                ewsDetails.Cells["D2"].Value = "Project Editor";
                using (ExcelRange range = ewsDetails.Cells["A2:D2"])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Font.Name = "Calibri";
                    range.Style.Font.Size = 14;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(218, 150, 148));
                }
                ewsDetails.Cells["A3"].Value = Catalog;
                ewsDetails.Cells["B3"].Value = Title;
                if (UploadType == "Mono")
                {
                    ewsDetails.Cells["C3"].Value = AuthorName;
                }
                else
                {
                    ewsDetails.Cells["C3"].Value = EditorName;
                }

                ewsDetails.Cells["D3"].Value = PEName;
                ewsDetails.Cells["A5"].Value = "Total word count";
                ewsDetails.Cells["A6"].Value = "Total typeset pages";
                ewsDetails.Cells["A7"].Value = "Total line art -- relabel";
                ewsDetails.Cells["A8"].Value = "Total line art -- redraw (simple)";
                ewsDetails.Cells["A9"].Value = "Total line art -- redraw (medium)";
                ewsDetails.Cells["A10"].Value = "Total line art -- redraw (complex)";
                ewsDetails.Cells["A11"].Value = "Total art Conversion";

                ewsDetails.Cells["B5"].Value = WordCount;
                ewsDetails.Cells["B6"].Value = ProofPages;
                ewsDetails.Cells["B7"].Value = Relabel;
                ewsDetails.Cells["B8"].Value = SimpleRedraw;
                ewsDetails.Cells["B9"].Value = MediumRedraw;
                ewsDetails.Cells["B10"].Value = ComplexRedraw;
                ewsDetails.Cells["B11"].Value = Conversion;

                using (ExcelRange range = ewsDetails.Cells["B5:B11"])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Font.Name = "Calibri";
                    range.Style.Font.Size = 14;
                    range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Top.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Left.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Right.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Bottom.Color.SetColor(System.Drawing.Color.Black);
                }

                using (ExcelRange range = ewsDetails.Cells["A12:D12"])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Font.Name = "Calibri";
                    range.Style.Font.Size = 14;
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
                using (ExcelRange range = ewsDetails.Cells["A5:D11"])
                {

                    range.Style.Font.Name = "Calibri";
                    range.Style.Font.Size = 12;
                }
                //using (ExcelRange range = ewsDetails.Cells["A12:B12"])
                //{
                //    range.Merge = true;
                //}
                ewsDetails.Cells["A12"].Value = "Standard Rates";
                ewsDetails.Cells["B12"].Value = "Accounting Code";
                ewsDetails.Cells["C12"].Value = "Rate ($)";
                ewsDetails.Cells["D12"].Value = "Price details ($)";
                int iLp = 13;
                if (Type == "Primary")
                {
                    decimal aTotalAmt = 0;
                    foreach (var item in InvoiceGridL)
                    {
                        string[] zstrSplit = item.Split(',');
                        string zRate = Convert.ToDecimal(zstrSplit[4]).ToString();
                        string zAmount = Convert.ToDecimal(zstrSplit[8]).ToString();

                        string zServicesL = zstrSplit[1];
                        var aPriceGriditemL = aDBManager.TBL_PriceGrid.OrderByDescending(i => i.ID)
                                   .FirstOrDefault(i => i.Services == zServicesL);

                        string zUnitType = zstrSplit[5];
                        if (aPriceGriditemL.OffShoreUnitType == "Printed Page")
                        {
                            zUnitType = aPriceGriditemL.OffShoreUnitType;
                        }

                        ewsDetails.Cells["A" + (iLp).ToString()].Value = zstrSplit[1] + " (per " + zUnitType + ") - " + zstrSplit[2];
                        ewsDetails.Cells["B" + (iLp).ToString()].Value = zstrSplit[9];
                        ewsDetails.Cells["C" + (iLp).ToString()].Value = Convert.ToDecimal(zRate);
                        ewsDetails.Cells["D" + (iLp).ToString()].Value = Convert.ToDecimal(zAmount);

                        ewsDetails.Cells["C" + (iLp).ToString()].Style.Numberformat.Format = "##0.00";
                        ewsDetails.Cells["D" + (iLp).ToString()].Style.Numberformat.Format = "##0.00";
                        //using (ExcelRange range = ewsDetails.Cells["A" + (iLp).ToString() + ":B" + (iLp).ToString()])
                        //{
                        //    range.Merge = true;
                        //}
                        iLp = iLp + 1;
                        aTotalAmt += Convert.ToDecimal(zAmount);
                    }

                    // Total Sum Amount
                    ewsDetails.Cells["C" + (iLp).ToString()].Value = "Total";
                    ewsDetails.Cells["C" + (iLp).ToString()].Style.Font.Bold = true;

                    ewsDetails.Cells["D" + (iLp).ToString()].Style.Font.Bold = true;
                    ewsDetails.Cells["D" + (iLp).ToString()].Style.Numberformat.Format = "##0.00";
                    ewsDetails.Cells["D" + (iLp).ToString()].Value = aTotalAmt;
                }
                else
                {
                    decimal aTotalAmt = 0;
                    foreach (var item in InvoiceGridL)
                    {
                        string[] zstrSplit = item.Split(',');
                        string zRate = Convert.ToDecimal(zstrSplit[4]).ToString();
                        string zAmount = Convert.ToDecimal(zstrSplit[8]).ToString();

                        string zServicesL = zstrSplit[1];
                        var aPriceGriditemL = aDBManager.TBL_PriceGrid.OrderByDescending(i => i.ID)
                                   .FirstOrDefault(i => i.Services == zServicesL);

                        string zUnitType = zstrSplit[5];
                        if (aPriceGriditemL.OffShoreUnitType == "Printed Page")
                        {
                            zUnitType = aPriceGriditemL.OffShoreUnitType;
                        }

                        ewsDetails.Cells["A" + (iLp).ToString()].Value = zstrSplit[1] + " (per " + zUnitType + ") - " + zstrSplit[2];
                        ewsDetails.Cells["B" + (iLp).ToString()].Value = zstrSplit[11];
                        ewsDetails.Cells["C" + (iLp).ToString()].Value = Convert.ToDecimal(zRate);
                        ewsDetails.Cells["D" + (iLp).ToString()].Value = Convert.ToDecimal(zAmount);

                        ewsDetails.Cells["C" + (iLp).ToString()].Style.Numberformat.Format = "##0.00";
                        ewsDetails.Cells["D" + (iLp).ToString()].Style.Numberformat.Format = "##0.00";
                        //using (ExcelRange range = ewsDetails.Cells["A" + (iLp).ToString() + ":B" + (iLp).ToString()])
                        //{
                        //    range.Merge = true;
                        //}
                        iLp = iLp + 1;
                        aTotalAmt += Convert.ToDecimal(zAmount);
                    }

                    // Total Sum Amount
                    ewsDetails.Cells["C" + (iLp).ToString()].Value = "Total";
                    ewsDetails.Cells["C" + (iLp).ToString()].Style.Font.Bold = true;

                    ewsDetails.Cells["D" + (iLp).ToString()].Style.Font.Bold = true;
                    ewsDetails.Cells["D" + (iLp).ToString()].Style.Numberformat.Format = "##0.00";
                    ewsDetails.Cells["D" + (iLp).ToString()].Value = aTotalAmt;
                }
                using (ExcelRange range = ewsDetails.Cells["A13:D" + iLp])
                {

                    range.Style.Font.Name = "Calibri";
                    range.Style.Font.Size = 12;
                }
                using (ExcelRange range = ewsDetails.Cells["A2:D" + iLp])
                {

                    range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Top.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Left.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Right.Color.SetColor(System.Drawing.Color.Black);
                    range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    range.Style.Border.Bottom.Color.SetColor(System.Drawing.Color.Black);
                }
                epExport.Save();
                byte[] fileBytes = System.IO.File.ReadAllBytes(excelpath);
                string fileName = Catalog.Trim() + "_" + Type + ".xlsx";
                return Json(fileName, JsonRequestBehavior.AllowGet);
                //return File(fileBytes, System.Net.Mime.MediaTypeNames.Application.Octet, fileName);
                //using (var memoryStream = new MemoryStream())
                //{
                //    Response.ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                //    Response.AddHeader("content-disposition", "attachment;  filename=Contact.xlsx");
                //    epExport.SaveAs(memoryStream);
                //    memoryStream.WriteTo(Response.OutputStream);
                //    Response.Flush();
                //    Response.End();
                //}
                //return Json("Service details updated Successfully!", JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }
    }
}