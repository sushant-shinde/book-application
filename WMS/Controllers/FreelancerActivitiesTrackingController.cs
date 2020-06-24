using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.Ajax.Utilities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;
using System.Web.UI.WebControls;
using WMS.Models;

namespace WMS.Controllers
{
    public class FreelancerActivitiesTrackingController : Controller
    {
        WMSEntities aDBManager = new WMSEntities();

        // GET: FreelancerActivitiesTracking
        public ActionResult Index()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());           

            FreelanceModel aBkData = new FreelanceModel();
            aBkData.PublisherList = Common.GetPublisherList(false);
            aBkData.TaskList = Common.GetTaskList(false);
            aBkData.CatalogList = Common.GetCatalogList(nUserID, false);
            aBkData.NumberList = Common.GetNumberList(nUserID, false);
            aBkData.ISBNList = Common.GetISBNList(nUserID, false);            
            aBkData.FreelancerList = Common.GetFreelancerList();

            return View(aBkData);
        }

        [HttpPost]
        public ActionResult GetFreelancerActivities(string Search, string CatalogList, string NumList, string ISBNList, string PublList, string TaskList, string FreelancerList, string Dates)
        {
            try
            {
                List<SP_GetFreelancerActivities_Result> FreelancerResultList = new List<SP_GetFreelancerActivities_Result>();
                Dictionary<string, string> dictionary = new Dictionary<string, string>();

                int UserId = Convert.ToInt32(Session["UserID"]);

                var aItemList = aDBManager.SP_GetFreelancerActivities(UserId).ToList();
                aItemList = aItemList.OrderByDescending(c => c.Freelancer).ToList();

                aItemList = FilterOnRecords(aItemList, Search, CatalogList, NumList, ISBNList, PublList, TaskList, FreelancerList, Dates);

                var groupedItemList = aItemList.GroupBy(c => c.FreelancerName).ToList();

                foreach (var item in groupedItemList)
                {
                    var list = item.DistinctBy(x => x.Number).ToList();
                    string Freelancer = item.Select(itm => itm.FreelancerName).Distinct().SingleOrDefault();

                    dictionary.Add(Freelancer, string.Join(",", list.Select(x => x.Number).ToList()));
                }

                var aList = dictionary.ToList();
                return Json(new { aItemList, aList }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }
        }

        [HttpGet]
        public ActionResult ExportToExcel(string Search, string CatalogList, string NumList, string ISBNList, string PublList, string TaskList, string FreelancerList, string Dates)
        {
            try
            {
                var gridview = new GridView();
                ExportModel exportModel = new ExportModel();
                List<ExportModel> ExportModelList = new List<ExportModel>();
                int count = 1;
                int UserId = Convert.ToInt32(Session["UserID"]);

                var aItemList = aDBManager.SP_GetFreelancerActivities(UserId).ToList();
                aItemList = aItemList.OrderByDescending(c => c.Freelancer).ToList();

                aItemList = FilterOnRecords(aItemList, Search, CatalogList, NumList, ISBNList, PublList, TaskList, FreelancerList, Dates);

                foreach (var item in aItemList)
                {
                    exportModel.Sr_No = count;
                    exportModel.FreelancerName = item.FreelancerName;
                    exportModel.FreelancerEmail = item.EmailID;
                    exportModel.MobileNo = item.MobileNo;
                    exportModel.Publisher = item.Publisher;
                    exportModel.BookId = item.Number;
                    exportModel.Catalog = item.Catalog;
                    exportModel.ISBN = item.ISBN;
                    exportModel.ChapterNo = item.Chapter;
                    exportModel.PEName = item.PEName;
                    exportModel.PMName = item.PMName;
                    exportModel.Task = item.TaskName;
                    exportModel.Status = item.Status;
                    exportModel.AllocationDate = item.AllocationDate.Value.ToString("dd/MM/yyyy");
                    exportModel.DueDate = item.DueDate.Value.ToString("dd/MM/yyyy");

                    if (item.CompletedDate != null)
                        exportModel.CompletedDate = item.CompletedDate.Value.ToString("dd/MM/yyyy");
                    else
                        exportModel.CompletedDate = "";

                    ExportModelList.Add(exportModel);
                    exportModel = new ExportModel();
                    count++;
                }
                gridview.DataSource = ExportModelList;
                gridview.DataBind();

                Response.ClearContent();
                Response.Buffer = true;
                Response.AddHeader("content-disposition", "attachment; filename=Freelancer Activity Report-" + DateTime.Now.ToString("dd_MM_yyyy_hh_mmtt") + ".xls");
                Response.ContentType = "application/ms-excel";

                Response.Charset = "";
                StringWriter objStringWriter = new StringWriter();
                HtmlTextWriter objHtmlTextWriter = new HtmlTextWriter(objStringWriter);

                gridview.RenderControl(objHtmlTextWriter);
                Response.Output.Write(objStringWriter.ToString());
            }
            catch (Exception ex)
            {

            }
            Response.Flush();
            Response.End();

            int nUserID = int.Parse(Session["LoginID"].ToString());
            FreelanceModel aBkData = new FreelanceModel();
            aBkData.PublisherList = Common.GetPublisherList(false);
            aBkData.TaskList = Common.GetTaskList(false);
            aBkData.CatalogList = Common.GetCatalogList(nUserID, false);
            aBkData.NumberList = Common.GetNumberList(nUserID, false);
            aBkData.ISBNList = Common.GetISBNList(nUserID, false);
            aBkData.FreelancerList = Common.GetFreelancerList();

            return View("Index", aBkData);
        }

        [HttpGet]
        public ActionResult ExportToPdf(string Search, string CatalogList, string NumList, string ISBNList, string PublList, string TaskList, string FreelancerList, string Dates)
        {
            MemoryStream workStream = new MemoryStream();
            string fileName = "Freelancer Activity Report-" + DateTime.Now.ToString("dd/MM/yyyy hh:mmtt") + ".pdf";
            int count = 1;

            try
            {
                ExportModel exportModel = new ExportModel();
                List<ExportModel> ExportModelList = new List<ExportModel>();

                int UserId = Convert.ToInt32(Session["UserID"]);

                var aItemList = aDBManager.SP_GetFreelancerActivities(UserId).ToList();

                aItemList = FilterOnRecords(aItemList, Search, CatalogList, NumList, ISBNList, PublList, TaskList, FreelancerList, Dates);
                aItemList = aItemList.OrderByDescending(c => c.Freelancer).ToList();

                foreach (var item in aItemList)
                {
                    exportModel.Sr_No = count;
                    exportModel.FreelancerName = item.FreelancerName;
                    exportModel.FreelancerEmail = item.EmailID;
                    exportModel.MobileNo = item.MobileNo;
                    exportModel.Publisher = item.Publisher;
                    exportModel.BookId = item.Number;
                    exportModel.Catalog = item.Catalog;
                    exportModel.ISBN = item.ISBN;
                    exportModel.ChapterNo = item.Chapter;
                    exportModel.PEName = item.PEName;
                    exportModel.PMName = item.PMName;
                    exportModel.Task = item.TaskName;
                    exportModel.Status = item.Status;
                    exportModel.AllocationDate = item.AllocationDate.Value.ToString("dd/MM/yyyy");
                    exportModel.DueDate = item.DueDate.Value.ToString("dd/MM/yyyy");

                    if (item.CompletedDate != null)
                        exportModel.CompletedDate = item.CompletedDate.Value.ToString("dd/MM/yyyy");
                    else
                        exportModel.CompletedDate = "";

                    ExportModelList.Add(exportModel);
                    exportModel = new ExportModel();
                    count++;
                }

                Document doc = new Document(PageSize.A3, 0f, 0f, 15f, 0f);
                PdfWriter.GetInstance(doc, workStream).CloseStream = false;
                doc.Open();
                PdfPTable table = new PdfPTable(12);

                float[] widths = new float[] { 20f, 60f, 80f, 60f, 40f, 50f, 50f, 60f, 80f, 60f, 60f, 60f };
                table.SetWidths(widths);

                table.AddCell(new PdfPCell(new Phrase("Freelancer Activity Report",
                    new Font(Font.FontFamily.HELVETICA, 14f, Font.BOLD)))
                {
                    Border = 0,
                    Colspan = 12,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    PaddingTop = 10,
                    PaddingBottom = 10
                });

                PdfPCell cell1 = new PdfPCell(new Phrase("Sr. No", new Font(Font.FontFamily.HELVETICA, 10f, Font.BOLD)));
                cell1.BackgroundColor = BaseColor.GRAY;
                cell1.VerticalAlignment = 5;
                table.AddCell(cell1);

                PdfPCell cell2 = new PdfPCell(new Phrase("Freelancer Name", new Font(Font.FontFamily.HELVETICA, 10f, Font.BOLD)));
                cell2.BackgroundColor = BaseColor.GRAY;
                cell2.VerticalAlignment = 5;
                table.AddCell(cell2);

                PdfPCell cell3 = new PdfPCell(new Phrase("Freelancer Email", new Font(Font.FontFamily.HELVETICA, 10f, Font.BOLD)));
                cell3.BackgroundColor = BaseColor.GRAY;
                cell3.VerticalAlignment = 5;
                table.AddCell(cell3);

                PdfPCell cell4 = new PdfPCell(new Phrase("Publisher", new Font(Font.FontFamily.HELVETICA, 10f, Font.BOLD)));
                cell4.BackgroundColor = BaseColor.GRAY;
                cell4.VerticalAlignment = 5;
                table.AddCell(cell4);

                PdfPCell cell5 = new PdfPCell(new Phrase("Book ID", new Font(Font.FontFamily.HELVETICA, 10f, Font.BOLD)));
                cell5.BackgroundColor = BaseColor.GRAY;
                cell5.VerticalAlignment = 5;
                table.AddCell(cell5);

                PdfPCell cell6 = new PdfPCell(new Phrase("Catalog", new Font(Font.FontFamily.HELVETICA, 10f, Font.BOLD)));
                cell6.BackgroundColor = BaseColor.GRAY;
                cell6.VerticalAlignment = 5;
                table.AddCell(cell6);

                PdfPCell cell7 = new PdfPCell(new Phrase("Chapter No", new Font(Font.FontFamily.HELVETICA, 10f, Font.BOLD)));
                cell7.BackgroundColor = BaseColor.GRAY;
                cell7.VerticalAlignment = 5;
                table.AddCell(cell7);

                PdfPCell cell8 = new PdfPCell(new Phrase("Task", new Font(Font.FontFamily.HELVETICA, 10f, Font.BOLD)));
                cell8.BackgroundColor = BaseColor.GRAY;
                cell8.VerticalAlignment = 5;
                table.AddCell(cell8);

                PdfPCell cell9 = new PdfPCell(new Phrase("Status", new Font(Font.FontFamily.HELVETICA, 10f, Font.BOLD)));
                cell9.BackgroundColor = BaseColor.GRAY;
                cell9.VerticalAlignment = 5;
                table.AddCell(cell9);

                PdfPCell cell10 = new PdfPCell(new Phrase("Allocation Date", new Font(Font.FontFamily.HELVETICA, 10f, Font.BOLD)));
                cell10.BackgroundColor = BaseColor.GRAY;
                cell10.VerticalAlignment = 5;
                table.AddCell(cell10);

                PdfPCell cell11 = new PdfPCell(new Phrase("Due Date", new Font(Font.FontFamily.HELVETICA, 10f, Font.BOLD)));
                cell11.BackgroundColor = BaseColor.GRAY;
                cell11.VerticalAlignment = 5;
                table.AddCell(cell11);

                PdfPCell cell12 = new PdfPCell(new Phrase("Completed Date", new Font(Font.FontFamily.HELVETICA, 10f, Font.BOLD)));
                cell12.BackgroundColor = BaseColor.GRAY;
                cell12.VerticalAlignment = 5;
                table.AddCell(cell12);

                foreach (var item in ExportModelList)
                {
                    table.AddCell(new PdfPCell(new Phrase(item.Sr_No.ToString(), new Font(Font.FontFamily.HELVETICA, 10f))));

                    table.AddCell(new PdfPCell(new Phrase(item.FreelancerName, new Font(Font.FontFamily.HELVETICA, 10f))));

                    table.AddCell(new PdfPCell(new Phrase(item.FreelancerEmail, new Font(Font.FontFamily.HELVETICA, 10f))));

                    table.AddCell(new PdfPCell(new Phrase(item.Publisher, new Font(Font.FontFamily.HELVETICA, 10f))));

                    table.AddCell(new PdfPCell(new Phrase(item.BookId, new Font(Font.FontFamily.HELVETICA, 10f))));

                    table.AddCell(new PdfPCell(new Phrase(item.Catalog, new Font(Font.FontFamily.HELVETICA, 10f))));

                    table.AddCell(new PdfPCell(new Phrase(item.ChapterNo, new Font(Font.FontFamily.HELVETICA, 10f))));

                    table.AddCell(new PdfPCell(new Phrase(item.Task, new Font(Font.FontFamily.HELVETICA, 10f))));

                    table.AddCell(new PdfPCell(new Phrase(item.Status, new Font(Font.FontFamily.HELVETICA, 10f))));

                    table.AddCell(new PdfPCell(new Phrase(item.AllocationDate, new Font(Font.FontFamily.HELVETICA, 10f))));

                    table.AddCell(new PdfPCell(new Phrase(item.DueDate, new Font(Font.FontFamily.HELVETICA, 10f))));

                    table.AddCell(new PdfPCell(new Phrase(item.CompletedDate, new Font(Font.FontFamily.HELVETICA, 10f))));
                }

                doc.Add(table);
                doc.Close();

                byte[] byteInfo = workStream.ToArray();
                workStream.Write(byteInfo, 0, byteInfo.Length);
                workStream.Position = 0;
            }
            catch (Exception ex)
            {
                throw;
            }
            return File(workStream, "application/pdf", fileName);
        }

        private List<SP_GetFreelancerActivities_Result> FilterOnRecords(List<SP_GetFreelancerActivities_Result> aItemList, string Search, string CatalogList, string NumList, string ISBNList, string PublList, string TaskList, string FreelancerList, string Dates)
        {
            try
            {
                List<SP_GetFreelancerActivities_Result> FreelancerResultList = new List<SP_GetFreelancerActivities_Result>();

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
                    var aNumberList = (NumList != null ? NumList.Split(',') : null);
                    string[] iNumberList = (aNumberList != null ? aNumberList.ToArray() : null);

                    aItemList = aItemList.Where(item => (iNumberList.Contains(item.Number))).ToList();
                }

                if (ISBNList != "All")
                {
                    var aISBNList = (ISBNList != null ? ISBNList.Split(',') : null);
                    string[] iISBNList = (aISBNList != null ? aISBNList.ToArray() : null);

                    aItemList = aItemList.Where(item => (iISBNList.Contains(item.ISBN))).ToList();
                }

                if (PublList != "All")
                {
                    var aPubList = (PublList != null ? PublList.Split(',') : null);
                    string[] iPubList = (aPubList != null ? aPubList.ToArray() : null);

                    aItemList = aItemList.Where(item => (iPubList.Contains(Convert.ToString(item.PublisherID)))).ToList();
                }

                if (TaskList != "All")
                {
                    var aTaskList = (TaskList != null ? TaskList.Split(',') : null);
                    string[] iTaskList = (aTaskList != null ? aTaskList.ToArray() : null);

                    aItemList = aItemList.Where(item => (iTaskList.Contains(Convert.ToString(item.TaskID)))).ToList();
                }

                if (FreelancerList != "All")
                {
                    var aFreelancerList = (FreelancerList != null ? FreelancerList.Split(',') : null);
                    string[] iFreelancerList = (aFreelancerList != null ? aFreelancerList.ToArray() : null);

                    aItemList = aItemList.Where(item => (iFreelancerList.Contains(item.FreelancerName))).ToList();
                }

                if (!string.IsNullOrEmpty(Dates))
                {
                    var filterDates = Dates.Split('-');

                    DateTime startDate = Convert.ToDateTime(filterDates[0]);
                    DateTime endDate = Convert.ToDateTime(filterDates[1]);

                    foreach (var item in aItemList)
                    {
                        if (item.CompletedDate != null)
                        {
                            //if (startDate <= item.AllocationDate && endDate >= item.CompletedDate)
                            if (startDate <= item.AllocationDate && item.AllocationDate <= endDate)
                            {
                                FreelancerResultList.Add(item);
                            }
                            else if (startDate <= item.CompletedDate && item.CompletedDate <= endDate)
                            {
                                FreelancerResultList.Add(item);
                            }
                        }
                        else
                        {
                            //if (startDate <= item.AllocationDate && endDate >= item.DueDate)
                            if (startDate <= item.AllocationDate && item.AllocationDate <= endDate)
                            {
                                FreelancerResultList.Add(item);
                            }
                            else if (startDate <= item.DueDate && item.DueDate <= endDate)
                            {
                                FreelancerResultList.Add(item);
                            }
                        }
                    }
                    aItemList = new List<SP_GetFreelancerActivities_Result>();
                    aItemList = FreelancerResultList;
                }
            }
            catch (Exception ex)
            {

            }
            return aItemList;
        }
    }
}