using Ionic.Zip;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using WMS.Models;

namespace WMS.Controllers
{
    public class ProjectAnalysisController : Controller
    {
        // GET: ProjectAnalysis
        static WMSEntities aDBManager = new WMSEntities();
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

        [AllowAnonymous]
        public ActionResult Index()
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
             
            BookModels aBkData = new BookModels();
            aBkData.PublisherList = Common.GetPublisherList(false);
            aBkData.CatalogList = Common.GetCatalogList(nUserID, false);
            aBkData.NumberList = Common.GetNumberList(nUserID, false);
            aBkData.ISBNList = Common.GetISBNList(nUserID, false);
            return View(aBkData);
        }



        public string GetPAHTML(int id)
        {
            string zResult = "";
            var aItemList = aDBManager.TBL_ProjectAnalysis.SingleOrDefault(item => item.MainID == id);
            var aBookInfoList = aDBManager.TBL_MainMaster.SingleOrDefault(item => item.ID == id);
            var zPEName = "";
            if (aBookInfoList.PEName != null)
            {
                Nullable<int> zPEID = aBookInfoList.PEName;
                zPEName = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == zPEID).LoginName;
            }
            var zPMName = "";
            if (aBookInfoList.PMName != null)
            {
                Nullable<int> zPMID = aBookInfoList.PMName;
                zPMName = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == zPMID).LoginName;
            }
            var aPublisherList = aDBManager.Publishers.SingleOrDefault(item => item.Publ_ID == aBookInfoList.PublisherID);

            zResult = "<div>";

            if (aItemList == null)
            {
                zResult += "<h1><center>No Data Found...</center></h1>";
            }
            string zHtmlStr = zResult;
            zHtmlStr += string.Format("<table width='100%' cellspacing='2' cellpadding='2' style='white-space:nowrap;line-height: 1.8;'>");

            //Project Analysis
            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td colspan='8'><h2 style='background-color: #7cbffd;margin-bottom: 0px;padding-left: 10px;'><span>{0}</span></h2></<td>", "Project Analysis");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td><strong>Catalog : </strong>{0}</<td>", aBookInfoList.Catalog);
            zHtmlStr += string.Format("<td><strong>Book No. : </strong>{0}</<td>", aBookInfoList.Number);
            zHtmlStr += string.Format("<td><strong>ISBN : </strong>{0}</<td>", aBookInfoList.ISBN);
            zHtmlStr += string.Format("<td><strong>Received Date : </strong>{0}</<td>", aBookInfoList.ReceivedDt.Value.ToString("dd MMM yyyy"));
            zHtmlStr += string.Format("<td><strong>Due Date : </strong>{0}</<td>", aBookInfoList.DueDt.Value.ToString("dd MMM yyyy"));
            zHtmlStr += string.Format("<td><strong>Platform : </strong>{0}</<td>", aBookInfoList.Platform);
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td><strong>Publisher : </strong>{0}</<td>", aPublisherList.Publ_Acronym);
            zHtmlStr += string.Format("<td><strong>PM Name : </strong>{0}</<td>", zPMName);
            zHtmlStr += string.Format("<td><strong>PE Name : </strong>{0}</<td>", zPEName);
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td colspan='8'><strong>Title : </strong>{0}</<td>", aBookInfoList.Title);
            zHtmlStr += string.Format("</tr>");

            //Project Manger
            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td colspan='8'><h2 style='background-color: #d6e8f3;margin-bottom: 0px;margin-top: 10px;padding-left: 10px;'><span>{0}</span></h2></<td>", "Project Manager");
            zHtmlStr += string.Format("</tr>");


            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1}><strong>MSS : </strong>{0}</td>", aItemList.PM_MSS, "");
            zHtmlStr += string.Format("<td {1}><strong>Estimate : </strong>{0}</td>", aItemList.PM_Estimate, "");
            zHtmlStr += string.Format("<td {1}><strong>CE Complexity : </strong>{0}</td>", aItemList.PM_CEComplexity, "");
            zHtmlStr += string.Format("<td {1}><strong>Book Complexity : </strong>{0}</td>", aItemList.PM_BKComplexity, "");

            zHtmlStr += string.Format("<td {1}><strong>Dual Edition : </strong>{0}</td>", aItemList.PM_DualEdition, "");
            zHtmlStr += string.Format("<td {1}><strong>Previous Edition : </strong>{0}</td>", aItemList.PM_PreEdition, "");
            zHtmlStr += string.Format("<td {1}><strong>ISBNS : </strong>{0}</td>", aItemList.PM_ISBN, "");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1}><strong>English : </strong>{0}</td>", aItemList.PM_English, "");
            zHtmlStr += string.Format("<td {1}><strong>Index : </strong>{0}</td>", aItemList.PM_Index, "");
            zHtmlStr += string.Format("<td {1}><strong>Castoff : </strong>{0}</td>", aItemList.PM_Castoff, "");
            zHtmlStr += string.Format("<td {1}><strong>Category : </strong>{0}</td>", aItemList.PM_Category, "");
            zHtmlStr += string.Format("<td {1}><strong>Book Type : </strong>{0}</td>", aItemList.PM_BookType, "");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1} colspan='8'><strong>Remarks : </strong>{0}</td>", aItemList.PM_Remarks, "style='white-space:normal'");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1} colspan='8'><strong>Queries : </strong>{0}</td>", aItemList.PM_Queries, "style='white-space:normal'");
            zHtmlStr += string.Format("</tr>");


            //XML
            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td colspan='8'><h2 style='background-color: #d6e8f3;margin-bottom: 0px;margin-top: 10px;padding-left: 10px;'><span>{0}</span></h2></<td>", "XML");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1}><strong>Input Type : </strong>{0}</td>", aItemList.XML_Input_Type, "");

            zHtmlStr += string.Format("<td {1}><strong>ORCID : </strong>{0}</td>", aItemList.XML_Orcid, "");
            zHtmlStr += string.Format("<td {1}><strong>Abstract : </strong>{0}</td>", aItemList.XML_Abstract, "");
            zHtmlStr += string.Format("<td {1}><strong>Reference Format : </strong>{0}</td>", aItemList.XML_Ref_Format, "");

            zHtmlStr += string.Format("<td {1}><strong>Reference Type : </strong>{0}</td>", aItemList.XML_Ref_Type, "");
            zHtmlStr += string.Format("<td {1}><strong>Final Deliverable : </strong>{0}</td>", aItemList.XML_FinalDeliverable, "");
            zHtmlStr += string.Format("<td {1}><strong>Table Count</strong> : </strong>{0}</td>", aItemList.XML_Tab_Count, "");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1}><strong>Equations Count : </strong>{0}</td>", aItemList.XML_EQ_Count, "");
            zHtmlStr += string.Format("<td {1}><strong>Special Keying : </strong>{0}</td>", aItemList.XML_Spl_Keying, "");
            zHtmlStr += string.Format("<td {1}><strong>Metasheet : </strong>{0}</td>", aItemList.XML_MetaSheet, "");
            zHtmlStr += string.Format("<td {1}><strong>PAP Deliverable : </strong>{0}</td>", aItemList.XML_PAPDeliverable, "");
            zHtmlStr += string.Format("<td {1}><strong>Section Format : </strong>{0}</td>", aItemList.XML_Sec_Format, "");
            zHtmlStr += string.Format("<td {1}><strong>Book Abstract : </strong>{0}</td>", aItemList.XML_BookAbstract, "");
            zHtmlStr += string.Format("<td {1}><strong>DOI : </strong>{0}</td>", aItemList.XML_DOI, "");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1} colspan='8'><strong>Remarks : </strong>{0}</td>", aItemList.XML_Remarks, "style='white-space:normal'");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1} colspan='8'><strong>Queries : </strong>{0}</td>", aItemList.XML_Query, "style='white-space:normal'");
            zHtmlStr += string.Format("</tr>");


            //Pagination 
            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td colspan='8'><h2 style='background-color: #d6e8f3;margin-bottom: 0px;margin-top: 10px;padding-left: 10px;'><span>{0}</span></h2></<td>", "Pagination");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1}><strong>Design : </strong>{0}</td>", aItemList.PG_Design, "");
            zHtmlStr += string.Format("<td {1}><strong>Trim : </strong>{0}</td>", aItemList.PG_Trim, "");
            zHtmlStr += string.Format("<td {1}><strong>Font Available : </strong>{0}</td>", aItemList.PG_Font_Availability, "");
            zHtmlStr += string.Format("<td {1}><strong>Figure Slides : </strong>{0}</td>", aItemList.PG_Figure_Slides, "");

            zHtmlStr += string.Format("<td {1}><strong>EBook : </strong>{0}</td>", aItemList.PG_Ebook, "");
            zHtmlStr += string.Format("<td {1}><strong>Color : </strong>{0}</td>", aItemList.PG_Color, "");
            zHtmlStr += string.Format("<td {1}><strong>Imprint : </strong>{0}</td>", aItemList.PG_ImPrint, "");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1}><strong>Template : </strong>{0}</td>", aItemList.PG_Template, "");
            zHtmlStr += string.Format("<td {1}><strong>Column : </strong>{0}</td>", aItemList.PG_Column, "");
            zHtmlStr += string.Format("<td {1}><strong>Print : </strong>{0}</td>", aItemList.PG_Print, "");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1} colspan='8'><strong>Remarks : </strong>{0}</td>", aItemList.PG_Remarks, "style='white-space:normal'");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1} colspan='8'><strong>Queries : </strong>{0}</td>", aItemList.PG_Query, "style='white-space:normal'");
            zHtmlStr += string.Format("</tr>");


            //Quality Check
            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td colspan='8'><h2 style='background-color: #d6e8f3;margin-bottom: 0px;margin-top: 10px;padding-left: 10px;'><span>{0}</span></h2></<td>", "Quality Check");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1}><strong>Greek Characters : </strong>{0}</td>", aItemList.QC_Greek_Chars, "");
            zHtmlStr += string.Format("<td {1}><strong>Variables : </strong>{0}</td>", aItemList.QC_Variables, "");
            zHtmlStr += string.Format("<td {1}><strong>Foot Notes : </strong>{0}</td>", aItemList.QC_Footnotes, "");
            zHtmlStr += string.Format("<td {1}><strong>End Notes : </strong>{0}</td>", aItemList.QC_EndNotes, "");

            zHtmlStr += string.Format("<td {1}><strong>Section Breaks : </strong>{0}</td>", aItemList.QC_Sec_Breaks, "");
            zHtmlStr += string.Format("<td {1}><strong>Front Matter : </strong>{0}</td>", aItemList.QC_FM, "");
            zHtmlStr += string.Format("<td {1}><strong>Series Page : </strong>{0}</td>", aItemList.QC_Series_Page, "");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1}><strong>Index : </strong>{0}</td>", aItemList.QC_Index, "");
            zHtmlStr += string.Format("<td {1}><strong>Back Matters : </strong>{0}</td>", aItemList.QC_BM, "");
            zHtmlStr += string.Format("<td {1}><strong>Special Elements : </strong>{0}</td>", aItemList.QC_Spl_Elements, "");
            zHtmlStr += string.Format("<td {1}><strong>Tables Count : </strong>{0}</td>", aItemList.QC_Tables_Count, "");
            zHtmlStr += string.Format("<td {1}><strong>Color Insert : </strong>{0}</td>", aItemList.QC_ColorInsert, "");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1} colspan='8'><strong>Remarks : </strong>{0}</td>", aItemList.QC_Remarks, "style='white-space:normal'");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1} colspan='8'><strong>Queries : </strong>{0}</td>", aItemList.QC_Query, "style='white-space:normal'");
            zHtmlStr += string.Format("</tr>");



            //ArtWork
            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td colspan='8'><h2 style='background-color: #d6e8f3;margin-bottom: 0px;margin-top: 10px;padding-left: 10px;'><span>{0}</span></h2></<td>", "ArtWork");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1}><strong>Color Type : </strong>{0}</td>", aItemList.Art_Color_Type, "");
            zHtmlStr += string.Format("<td {1}><strong>Total Figures : </strong>{0}</td>", aItemList.Art_Figures_Count, "");
            zHtmlStr += string.Format("<td {1}><strong>ArtWork : </strong>{0}</td>", aItemList.Art_ArtWork, "");
            zHtmlStr += string.Format("<td {1}><strong>Redraws : </strong>{0}</td>", aItemList.Art_Redraws, "");
            zHtmlStr += string.Format("<td {1}><strong>Scatter Colors : </strong>{0}</td>", aItemList.Art_ScatterColors, "");
            zHtmlStr += string.Format("<td {1}><strong>Page Width : </strong>{0}</td>", aItemList.Art_Page_Width, "");
            zHtmlStr += string.Format("<td {1}><strong>Page_Height : </strong>{0}</td>", aItemList.Art_Page_Height, "");

            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1} colspan='8'><strong>Remarks : </strong>{0}</td>", aItemList.Art_Remarks, "style='white-space:normal'");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td {1} colspan='8'><strong>Queries : </strong>{0}</td>", aItemList.Art_Query, "style='white-space:normal'");
            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("</table>");


            zHtmlStr += string.Format("<hr><table width='100%' cellspacing='0' cellpadding='5'>");

            var aApprovedByL = "";
            if (aItemList != null && aItemList.ApprovedBy != null)
                aApprovedByL = aDBManager.UserMasters.SingleOrDefault(item => (item.UserID == aItemList.ApprovedBy)).LoginName;

            zHtmlStr += string.Format("<tr>");
            zHtmlStr += string.Format("<td><strong>Approved By : </strong>{0}</<td>", aApprovedByL);

            zHtmlStr += string.Format("<td><strong>Approved Date : </strong>{0}</<td>",
                    (aItemList.Approved_date != null ? aItemList.Approved_date.Value.ToString("dd MMM yyyy HH:mm:ss") : ""));

            zHtmlStr += string.Format("</tr>");

            zHtmlStr += string.Format("</table>");

            zHtmlStr += string.Format("</div>");

            zResult = zHtmlStr;

            return zResult;
        }
        //[Route("GetPAFile/{BookID}")]
        public ActionResult GetPAFile(int id)
        {
            string zHtmlStr = GetPAHTML(id);

            return Content(zHtmlStr);
        }

        #region ProjectAnalysis

        [HttpGet]
        public ActionResult BookData(string zTabType, string CatalogList, string NumList, string ISBNList, string PublList)
        {
            int nUserID = int.Parse(Session["LoginID"].ToString());
           


            //zTabType = (zTabType == "WIP" ? "WIP" : "ADVANCE");
            var aItemList = aDBManager.SP_GetBookList_For_PA(nUserID, zTabType).ToList();
            if (zTabType.ToUpper() == "NEW")
            {
                aItemList = aItemList.Where(item => (item.Approved_date == null) && (item.PM_Isapproved == null || item.XML_Isapproved == null || item.PG_Isapproved == null || item.QC_Isapproved == null || item.Artwork_Isapproved == null)).ToList();
            }
            else if (zTabType.ToUpper() == "WIP")
            {
                aItemList = aItemList.Where(item => item.Approved_date != null).ToList();
            }
            else
            {
                aItemList = aItemList.Where(item => (item.Approved_date == null) && (item.PM_Isapproved != null) && (item.XML_Isapproved != null) && (item.PG_Isapproved != null) && (item.QC_Isapproved != null) && (item.Artwork_Isapproved != null)).ToList();
            }
            if (CatalogList != "")
            {
                var aCatalogList = (CatalogList != null ? CatalogList.Split(',') : null);
                string[] iCatalogList = (aCatalogList != null ? aCatalogList.ToArray() : null);

                aItemList = aItemList.Where(item => (iCatalogList.Contains(item.Catalog))).ToList();
            }

            if (NumList != "")
            {
                var aNumList = (NumList != null ? NumList.Split(',') : null);
                string[] iNumList = (aNumList != null ? aNumList.ToArray() : null);

                aItemList = aItemList.Where(item => (iNumList.Contains(item.Number))).ToList();
            }
            if (ISBNList != "")
            {
                var aISBNList = (ISBNList != null ? ISBNList.Split(',') : null);
                string[] iISBNList = (aISBNList != null ? aISBNList.ToArray() : null);

                aItemList = aItemList.Where(item => (iISBNList.Contains(item.ISBN))).ToList();
            }
            if (PublList != "")
            {
                var aPublList = (PublList != null ? PublList.Split(',') : null);
                string[] iPublList = (aPublList != null ? aPublList.ToArray() : null);

                aItemList = aItemList.Where(item => (iPublList.Contains(item.Publisher.ToString()))).ToList();
            }

            return Json(new { aItemList }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult PopulateBookInfo(int zBookID)
        {

            var aItemList = aDBManager.SP_GetBookDataforPA(zBookID);


            var aitemlCmt = aDBManager.TBL_ProjectAnalysis_CMTS.Where(item => item.BookID == zBookID).ToList();

            return Json(new { aItemList, aitemlCmt }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult PopulateSections(string ZBookID, string aTime)
        {
            var aitemList = aDBManager.TBL_ProjectAnalysis.SingleOrDefault(item => (item.MainID.ToString() == ZBookID));
            var aitemList_Bookmaster = aDBManager.TBL_MainMaster.SingleOrDefault(item => (item.ID.ToString() == ZBookID));
          
            var aApprovedByL = "";
            if (aitemList != null && aitemList.ApprovedBy != null)
                aApprovedByL = aDBManager.UserMasters.SingleOrDefault(item => (item.UserID == aitemList.ApprovedBy)).LoginName;

            string[] aFileListPM = { };
            string[] aFileListQC = { };
            string[] aFileListXML = { };
            string[] aFileListPG = { };
            string[] aFileListArtwork = { };

            string aPASummaryL = string.Empty;

            if (aitemList != null)
            {
                int aBookID = aitemList.MainID;


                var abookL = aDBManager.TBL_MainMaster.Single(item => item.ID == aBookID);


                string zPath = string.Format("~/Source/ProjectAnalysis/{0}", abookL.Catalog);

                if (Directory.Exists(Server.MapPath(zPath + "/PM")))
                    aFileListPM = Directory.GetFiles(Server.MapPath(zPath + "/PM/" + aTime), "*.*", SearchOption.AllDirectories);


                if (Directory.Exists(Server.MapPath(zPath + "/QC")))
                    aFileListQC = Directory.GetFiles(Server.MapPath(zPath + "/QC/" + aTime), "*.*", SearchOption.AllDirectories);


                if (Directory.Exists(Server.MapPath(zPath + "/XML")))
                    aFileListXML = Directory.GetFiles(Server.MapPath(zPath + "/XML/" + aTime), "*.*", SearchOption.AllDirectories);


                if (Directory.Exists(Server.MapPath(zPath + "/PG")))
                    aFileListPG = Directory.GetFiles(Server.MapPath(zPath + "/PG/" + aTime), "*.*", SearchOption.AllDirectories);

                if (Directory.Exists(Server.MapPath(zPath + "/Artwork")))
                    aFileListArtwork = Directory.GetFiles(Server.MapPath(zPath + "/Artwork/" + aTime), "*.*", SearchOption.AllDirectories);

                aPASummaryL = GetPAHTML(aBookID);
            }

            var amangerCmtCount = aDBManager.TBL_ProjectAnalysis_CMTS.Where(item => item.BookID.ToString() == ZBookID && item.IsResolved == 0 && item.ColumnName != "General").ToList();



            return Json(new { aitemList, aitemList_Bookmaster, aFileListPM, aFileListQC, aFileListXML, aFileListPG, aFileListArtwork, aApprovedByL, amangerCmtCount, aPASummaryL }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult UpdateSections(TBL_ProjectAnalysis aitemInfoP, string aCatalog, string zType, string[] FileListPM, string[] FileListQC, string[] FileListXML, string[] FileListPG, string[] FileListArt, string zTime)
        {
            try
            {
                var abookList = aDBManager.TBL_ProjectAnalysis.Where(item => item.MainID == aitemInfoP.MainID).ToList();

                if (abookList.Count == 0)
                {
                    aDBManager.TBL_ProjectAnalysis.Add(aitemInfoP);
                    aDBManager.SaveChanges();
                }
                string aBookID = "";
                if (abookList.Count > 0)
                {
                    var aitemList = aDBManager.TBL_ProjectAnalysis.Single(item => item.MainID == aitemInfoP.MainID);
                    if ((FileListPM == null) || (FileListQC == null) || (FileListXML == null) || (FileListPG == null) || (FileListArt == null))
                    {

                        string path = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}", aCatalog, zType, zTime));
                        if (Directory.Exists(path))
                        {
                            string[] Filenames = Directory.GetFiles(path);

                            if (Filenames.Length > 0)
                            {
                                using (ZipFile zip = new ZipFile())
                                {
                                    zip.AddFiles(Filenames, aCatalog + zType + zTime);
                                    zip.Save(Path.Combine(string.Format(path + "/{0}.zip", aCatalog + zType + zTime)));

                                }
                            }

                            var files = Directory.GetFiles(path).Where(name => !name.EndsWith(".zip"));
                            foreach (string filePath in files)
                            {
                                System.IO.File.Delete(filePath);
                            }

                        }

                        aitemList.PM_Attachment = (FileListPM == null ? aitemList.PM_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                        aitemList.PG_Attachment = (FileListPG == null ? aitemList.PG_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                        aitemList.XML_Attachment = (FileListXML == null ? aitemList.XML_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                        aitemList.QC_Attachment = (FileListQC == null ? aitemList.QC_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                        aitemList.Art_Attachment = (FileListArt == null ? aitemList.Art_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));

                    }


                    //PM
                    aitemList.PM_MSS = aitemInfoP.PM_MSS;
                    aitemList.PM_Estimate = aitemInfoP.PM_Estimate;
                    aitemList.PM_Castoff = aitemInfoP.PM_Castoff;
                    aitemList.PM_CEComplexity = aitemInfoP.PM_CEComplexity;
                    aitemList.PM_BKComplexity = aitemInfoP.PM_BKComplexity;
                    aitemList.PM_BookType = aitemInfoP.PM_BookType;
                    aitemList.PM_DualEdition = aitemInfoP.PM_DualEdition;
                    aitemList.PM_PreEdition = aitemInfoP.PM_PreEdition;
                    aitemList.PM_ISBN = aitemInfoP.PM_ISBN;
                    aitemList.PM_English = aitemInfoP.PM_English;
                    aitemList.PM_Index = aitemInfoP.PM_Index;
                    aitemList.PM_Category = aitemInfoP.PM_Category;
                    aitemList.PM_Remarks = aitemInfoP.PM_Remarks;
                    aitemList.PM_Queries = aitemInfoP.PM_Queries;
                    aitemList.PM_OSPM = aitemInfoP.PM_OSPM;
                    //aitemList.PM_Completed = aitemInfoP.PM_Completed;




                    //XML
                    aitemList.XML_Abstract = aitemInfoP.XML_Abstract;
                    aitemList.XML_Input_Type = aitemInfoP.XML_Input_Type;
                    aitemList.XML_BookAbstract = aitemInfoP.XML_BookAbstract;
                    aitemList.XML_DOI = aitemInfoP.XML_DOI;
                    aitemList.XML_Ref_Type = aitemInfoP.XML_Ref_Type;
                    aitemList.XML_Ref_Format = aitemInfoP.XML_Ref_Format;
                    aitemList.XML_Sec_Format = aitemInfoP.XML_Sec_Format;
                    aitemList.XML_Spl_Keying = aitemInfoP.XML_Spl_Keying;
                    aitemList.XML_Orcid = aitemInfoP.XML_Orcid;
                    aitemList.XML_MetaSheet = aitemInfoP.XML_MetaSheet;
                    aitemList.XML_FinalDeliverable = aitemInfoP.XML_FinalDeliverable;
                    aitemList.XML_PAPDeliverable = aitemInfoP.XML_PAPDeliverable;
                    aitemList.XML_EQ_Count = aitemInfoP.XML_EQ_Count;
                    aitemList.XML_Tab_Count = aitemInfoP.XML_Tab_Count;
                    aitemList.XML_Remarks = aitemInfoP.XML_Remarks;
                    aitemList.XML_Query = aitemInfoP.XML_Query;
                   //aitemList.XML_Completed = aitemInfoP.XML_Completed;

                    //Pagination

                    aitemList.PG_Design = aitemInfoP.PG_Design;
                    aitemList.PG_Trim = aitemInfoP.PG_Trim;
                    aitemList.PG_Column = aitemInfoP.PG_Column;
                    aitemList.PG_Font_Availability = aitemInfoP.PG_Font_Availability;
                    aitemList.PG_Figure_Slides = aitemInfoP.PG_Figure_Slides;
                    aitemList.PG_Print = aitemInfoP.PG_Print;
                    aitemList.PG_Ebook = aitemInfoP.PG_Ebook;
                    aitemList.PG_Color = aitemInfoP.PG_Color;
                    aitemList.PG_ImPrint = aitemInfoP.PG_ImPrint;
                    aitemList.PG_Template = aitemInfoP.PG_Template;
                    aitemList.PG_Remarks = aitemInfoP.PG_Remarks;
                    aitemList.PG_Query = aitemInfoP.PG_Query;
                    //aitemList.PG_Completed = aitemInfoP.PG_Completed;

                    //QC
                    aitemList.QC_Greek_Chars = aitemInfoP.QC_Greek_Chars;
                    aitemList.QC_Variables = aitemInfoP.QC_Variables;
                    aitemList.QC_Spl_Elements = aitemInfoP.QC_Spl_Elements;
                    aitemList.QC_Footnotes = aitemInfoP.QC_Footnotes;
                    aitemList.QC_EndNotes = aitemInfoP.QC_EndNotes;
                    aitemList.QC_ColorInsert = aitemInfoP.QC_ColorInsert;
                    aitemList.QC_Sec_Breaks = aitemInfoP.QC_Sec_Breaks;
                    aitemList.QC_FM = aitemInfoP.QC_FM;
                    aitemList.QC_BM = aitemInfoP.QC_BM;
                    aitemList.QC_Series_Page = aitemInfoP.QC_Series_Page;
                    aitemList.QC_Index = aitemInfoP.QC_Index;
                    aitemList.QC_Tables_Count = aitemInfoP.QC_Tables_Count;
                    aitemList.QC_Remarks = aitemInfoP.QC_Remarks;
                    aitemList.QC_Query = aitemInfoP.QC_Query;
                   // aitemList.QC_Completed = aitemInfoP.QC_Completed;

                    //Artwork
                    aitemList.Art_Color_Type = aitemInfoP.Art_Color_Type;
                    aitemList.Art_Page_Width = aitemInfoP.Art_Page_Width;
                    aitemList.Art_Page_Height = aitemInfoP.Art_Page_Height;
                    aitemList.Art_Figures_Count = aitemInfoP.Art_Figures_Count;
                    aitemList.Art_Redraws = aitemInfoP.Art_Redraws;
                    aitemList.Art_Remarks = aitemInfoP.Art_Remarks;
                    aitemList.Art_Query = aitemInfoP.Art_Query;
                    aitemList.Art_ArtWork = aitemInfoP.Art_ArtWork;
                    aitemList.Art_ScatterColors = aitemInfoP.Art_ScatterColors;
                    // aitemList.Art_Completed = aitemInfoP.Art_Completed;

                    aitemList.Approved_date = (aitemInfoP.Approved_date != null ? aitemInfoP.Approved_date : aitemList.Approved_date);
                    aitemList.PM_Isapproved = (aitemInfoP.PM_Isapproved != null ? aitemInfoP.PM_Isapproved : aitemList.PM_Isapproved);
                    aitemList.XML_Isapproved = (aitemInfoP.XML_Isapproved != null ? aitemInfoP.XML_Isapproved : aitemList.XML_Isapproved);
                    aitemList.PG_Isapproved = (aitemInfoP.PG_Isapproved != null ? aitemInfoP.PG_Isapproved : aitemList.PG_Isapproved);
                    aitemList.QC_Isapproved = (aitemInfoP.QC_Isapproved != null ? aitemInfoP.QC_Isapproved : aitemList.QC_Isapproved);
                    aitemList.Artwork_Isapproved = (aitemInfoP.Artwork_Isapproved != null ? aitemInfoP.Artwork_Isapproved : aitemList.Artwork_Isapproved);

                    if (aitemInfoP.Approved_date != null)
                    {
                        aitemList.ApprovedBy = int.Parse(Session["LoginID"].ToString());
                    }
                    aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                    aitemInfoP.UpdatedTime = DateTime.Now;

                    aDBManager.SaveChanges();

                    if (aitemInfoP.Approved_date != null)
                    {
                        var aBookist = aDBManager.TBL_MainMaster.Single(item => item.ID == aitemInfoP.MainID);
                        aDBManager.TBL_Signaldetails.Add(new TBL_Signaldetails()
                        {
                            Description = GetPAHTML(aitemInfoP.MainID),
                            IsSynch = 0,
                            Type = "HTML",
                            BookNo = aBookist.Number,
                            UpdatedTime = DateTime.Now

                        });
                        aDBManager.SaveChanges();
                    }

                    aBookID = aitemInfoP.MainID.ToString();
                }
                else
                {

                    if ((FileListPM != null && FileListPM.Length > 0) || (FileListQC != null && FileListQC.Length > 0) || (FileListXML != null && FileListXML.Length > 0) || (FileListPG != null && FileListPG.Length > 0) || (FileListArt != null && FileListArt.Length > 0))
                    {
                        string path = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}", aCatalog, zType, zTime));
                        string[] Filenames = Directory.GetFiles(path);
                        if (Directory.Exists(path))
                        {
                            if (Filenames.Length > 0)
                            {
                                using (ZipFile zip = new ZipFile())
                                {
                                    zip.AddFiles(Filenames, aCatalog + zType + zTime);
                                    zip.Save(Path.Combine(string.Format(path + "/{0}.zip", aCatalog + zType + zTime)));

                                }
                            }

                            var files = Directory.GetFiles(path).Where(name => !name.EndsWith(".zip"));
                            foreach (string filePath in files)
                            {
                                System.IO.File.Delete(filePath);
                            }
                        }
                        aitemInfoP.PM_Attachment = (FileListPM == null ? aitemInfoP.PM_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                        aitemInfoP.PG_Attachment = (FileListPG == null ? aitemInfoP.PG_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                        aitemInfoP.XML_Attachment = (FileListXML == null ? aitemInfoP.XML_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                        aitemInfoP.QC_Attachment = (FileListQC == null ? aitemInfoP.QC_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                        aitemInfoP.Art_Attachment = (FileListArt == null ? aitemInfoP.Art_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));

                        aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                        aitemInfoP.UpdatedTime = DateTime.Now;
                        aitemInfoP.IsDeleted = 0;

                        aDBManager.TBL_ProjectAnalysis.Add(aitemInfoP);
                        aDBManager.SaveChanges();

                    }


                }
                return Json(aBookID);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }


        }



        [HttpPost]
        public ActionResult UpdateSections_PM(TBL_ProjectAnalysis aitemInfoP, string aCatalog, string zType, string[] FileListPM,string zTime)
        {
            try
            {
                var abookList = aDBManager.TBL_ProjectAnalysis.Where(item => item.MainID == aitemInfoP.MainID).ToList();

                if (abookList.Count == 0)
                {
                    aDBManager.TBL_ProjectAnalysis.Add(aitemInfoP);
                    aDBManager.SaveChanges();
                }
                string aBookID = "";
                if (abookList.Count > 0)
                {
                    var aitemList = aDBManager.TBL_ProjectAnalysis.Single(item => item.MainID == aitemInfoP.MainID);
                    if (FileListPM == null)
                    {

                        string path = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}", aCatalog, zType, zTime));
                        if (Directory.Exists(path))
                        {
                            string[] Filenames = Directory.GetFiles(path);

                            if (Filenames.Length > 0)
                            {
                                using (ZipFile zip = new ZipFile())
                                {
                                    zip.AddFiles(Filenames, aCatalog + zType + zTime);
                                    zip.Save(Path.Combine(string.Format(path + "/{0}.zip", aCatalog + zType + zTime)));

                                }
                            }

                            var files = Directory.GetFiles(path).Where(name => !name.EndsWith(".zip"));
                            foreach (string filePath in files)
                            {
                                System.IO.File.Delete(filePath);
                            }

                        }

                        aitemList.PM_Attachment = (FileListPM == null ? aitemList.PM_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                      

                    }


                    //PM
                    aitemList.PM_MSS = aitemInfoP.PM_MSS;
                    aitemList.PM_Estimate = aitemInfoP.PM_Estimate;
                    aitemList.PM_Castoff = aitemInfoP.PM_Castoff;
                    aitemList.PM_CEComplexity = aitemInfoP.PM_CEComplexity;
                    aitemList.PM_BKComplexity = aitemInfoP.PM_BKComplexity;
                    aitemList.PM_BookType = aitemInfoP.PM_BookType;
                    aitemList.PM_DualEdition = aitemInfoP.PM_DualEdition;
                    aitemList.PM_PreEdition = aitemInfoP.PM_PreEdition;
                    aitemList.PM_ISBN = aitemInfoP.PM_ISBN;
                    aitemList.PM_English = aitemInfoP.PM_English;
                    aitemList.PM_Index = aitemInfoP.PM_Index;
                    aitemList.PM_Category = aitemInfoP.PM_Category;
                    aitemList.PM_Remarks = aitemInfoP.PM_Remarks;
                    aitemList.PM_Queries = aitemInfoP.PM_Queries;
                    aitemList.PM_OSPM = aitemInfoP.PM_OSPM;
                    //aitemList.PM_Completed = aitemInfoP.PM_Completed;




                    aitemList.Approved_date = (aitemInfoP.Approved_date != null ? aitemInfoP.Approved_date : aitemList.Approved_date);
                    aitemList.PM_Isapproved = (aitemInfoP.PM_Isapproved != null ? aitemInfoP.PM_Isapproved : aitemList.PM_Isapproved);
                   
                    if (aitemInfoP.Approved_date != null)
                    {
                        aitemList.ApprovedBy = int.Parse(Session["LoginID"].ToString());
                    }
                    aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                    aitemInfoP.UpdatedTime = DateTime.Now;

                    aDBManager.SaveChanges();

                    if (aitemInfoP.Approved_date != null)
                    {
                        var aBookist = aDBManager.TBL_MainMaster.Single(item => item.ID == aitemInfoP.MainID);
                        aDBManager.TBL_Signaldetails.Add(new TBL_Signaldetails()
                        {
                            Description = GetPAHTML(aitemInfoP.MainID),
                            IsSynch = 0,
                            Type = "HTML",
                            BookNo = aBookist.Number,
                            UpdatedTime = DateTime.Now

                        });
                        aDBManager.SaveChanges();
                    }

                    aBookID = aitemInfoP.MainID.ToString();
                }
                else
                {

                    if (FileListPM != null && FileListPM.Length > 0) 
                    {
                        string path = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}", aCatalog, zType, zTime));
                        string[] Filenames = Directory.GetFiles(path);
                        if (Directory.Exists(path))
                        {
                            if (Filenames.Length > 0)
                            {
                                using (ZipFile zip = new ZipFile())
                                {
                                    zip.AddFiles(Filenames, aCatalog + zType + zTime);
                                    zip.Save(Path.Combine(string.Format(path + "/{0}.zip", aCatalog + zType + zTime)));

                                }
                            }

                            var files = Directory.GetFiles(path).Where(name => !name.EndsWith(".zip"));
                            foreach (string filePath in files)
                            {
                                System.IO.File.Delete(filePath);
                            }
                        }
                        aitemInfoP.PM_Attachment = (FileListPM == null ? aitemInfoP.PM_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                       
                        aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                        aitemInfoP.UpdatedTime = DateTime.Now;
                        aitemInfoP.IsDeleted = 0;

                        aDBManager.TBL_ProjectAnalysis.Add(aitemInfoP);
                        aDBManager.SaveChanges();

                    }


                }
                return Json(aBookID);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }


        }

        [HttpPost]
        public ActionResult UpdateSections_QC(TBL_ProjectAnalysis aitemInfoP, string aCatalog, string zType, string[] FileListQC, string zTime)
        {
            try
            {
                var abookList = aDBManager.TBL_ProjectAnalysis.Where(item => item.MainID == aitemInfoP.MainID).ToList();

                if (abookList.Count == 0)
                {
                    aDBManager.TBL_ProjectAnalysis.Add(aitemInfoP);
                    aDBManager.SaveChanges();
                }
                string aBookID = "";
                if (abookList.Count > 0)
                {
                    var aitemList = aDBManager.TBL_ProjectAnalysis.Single(item => item.MainID == aitemInfoP.MainID);
                    if (FileListQC == null)
                    {

                        string path = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}", aCatalog, zType, zTime));
                        if (Directory.Exists(path))
                        {
                            string[] Filenames = Directory.GetFiles(path);

                            if (Filenames.Length > 0)
                            {
                                using (ZipFile zip = new ZipFile())
                                {
                                    zip.AddFiles(Filenames, aCatalog + zType + zTime);
                                    zip.Save(Path.Combine(string.Format(path + "/{0}.zip", aCatalog + zType + zTime)));

                                }
                            }

                            var files = Directory.GetFiles(path).Where(name => !name.EndsWith(".zip"));
                            foreach (string filePath in files)
                            {
                                System.IO.File.Delete(filePath);
                            }

                        }

                       
                        aitemList.QC_Attachment = (FileListQC == null ? aitemList.QC_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                       

                    }
                    //QC
                    aitemList.QC_Greek_Chars = aitemInfoP.QC_Greek_Chars;
                    aitemList.QC_Variables = aitemInfoP.QC_Variables;
                    aitemList.QC_Spl_Elements = aitemInfoP.QC_Spl_Elements;
                    aitemList.QC_Footnotes = aitemInfoP.QC_Footnotes;
                    aitemList.QC_EndNotes = aitemInfoP.QC_EndNotes;
                    aitemList.QC_ColorInsert = aitemInfoP.QC_ColorInsert;
                    aitemList.QC_Sec_Breaks = aitemInfoP.QC_Sec_Breaks;
                    aitemList.QC_FM = aitemInfoP.QC_FM;
                    aitemList.QC_BM = aitemInfoP.QC_BM;
                    aitemList.QC_Series_Page = aitemInfoP.QC_Series_Page;
                    aitemList.QC_Index = aitemInfoP.QC_Index;
                    aitemList.QC_Tables_Count = aitemInfoP.QC_Tables_Count;
                    aitemList.QC_Remarks = aitemInfoP.QC_Remarks;
                    aitemList.QC_Query = aitemInfoP.QC_Query;
                    

                    aitemList.Approved_date = (aitemInfoP.Approved_date != null ? aitemInfoP.Approved_date : aitemList.Approved_date);
                   
                    aitemList.QC_Isapproved = (aitemInfoP.QC_Isapproved != null ? aitemInfoP.QC_Isapproved : aitemList.QC_Isapproved);
               

                    if (aitemInfoP.Approved_date != null)
                    {
                        aitemList.ApprovedBy = int.Parse(Session["LoginID"].ToString());
                    }
                    aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                    aitemInfoP.UpdatedTime = DateTime.Now;

                    aDBManager.SaveChanges();

                    if (aitemInfoP.Approved_date != null)
                    {
                        var aBookist = aDBManager.TBL_MainMaster.Single(item => item.ID == aitemInfoP.MainID);
                        aDBManager.TBL_Signaldetails.Add(new TBL_Signaldetails()
                        {
                            Description = GetPAHTML(aitemInfoP.MainID),
                            IsSynch = 0,
                            Type = "HTML",
                            BookNo = aBookist.Number,
                            UpdatedTime = DateTime.Now

                        });
                        aDBManager.SaveChanges();
                    }

                    aBookID = aitemInfoP.MainID.ToString();
                }
                else
                {

                    if (FileListQC != null && FileListQC.Length > 0)
                    {
                        string path = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}", aCatalog, zType, zTime));
                        string[] Filenames = Directory.GetFiles(path);
                        if (Directory.Exists(path))
                        {
                            if (Filenames.Length > 0)
                            {
                                using (ZipFile zip = new ZipFile())
                                {
                                    zip.AddFiles(Filenames, aCatalog + zType + zTime);
                                    zip.Save(Path.Combine(string.Format(path + "/{0}.zip", aCatalog + zType + zTime)));

                                }
                            }

                            var files = Directory.GetFiles(path).Where(name => !name.EndsWith(".zip"));
                            foreach (string filePath in files)
                            {
                                System.IO.File.Delete(filePath);
                            }
                        }
                       
                        aitemInfoP.QC_Attachment = (FileListQC == null ? aitemInfoP.QC_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                        
                        aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                        aitemInfoP.UpdatedTime = DateTime.Now;
                        aitemInfoP.IsDeleted = 0;

                        aDBManager.TBL_ProjectAnalysis.Add(aitemInfoP);
                        aDBManager.SaveChanges();

                    }


                }
                return Json(aBookID);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }


        }


        [HttpPost]
        public ActionResult UpdateSections_PG(TBL_ProjectAnalysis aitemInfoP, string aCatalog, string zType, string[] FileListPG, string zTime)
        {
            try
            {
                var abookList = aDBManager.TBL_ProjectAnalysis.Where(item => item.MainID == aitemInfoP.MainID).ToList();

                if (abookList.Count == 0)
                {
                    aDBManager.TBL_ProjectAnalysis.Add(aitemInfoP);
                    aDBManager.SaveChanges();
                }
                string aBookID = "";
                if (abookList.Count > 0)
                {
                    var aitemList = aDBManager.TBL_ProjectAnalysis.Single(item => item.MainID == aitemInfoP.MainID);
                    if  (FileListPG == null)
                    {

                        string path = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}", aCatalog, zType, zTime));
                        if (Directory.Exists(path))
                        {
                            string[] Filenames = Directory.GetFiles(path);

                            if (Filenames.Length > 0)
                            {
                                using (ZipFile zip = new ZipFile())
                                {
                                    zip.AddFiles(Filenames, aCatalog + zType + zTime);
                                    zip.Save(Path.Combine(string.Format(path + "/{0}.zip", aCatalog + zType + zTime)));

                                }
                            }

                            var files = Directory.GetFiles(path).Where(name => !name.EndsWith(".zip"));
                            foreach (string filePath in files)
                            {
                                System.IO.File.Delete(filePath);
                            }

                        }

                       
                        aitemList.PG_Attachment = (FileListPG == null ? aitemList.PG_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                       
                    }


                   
                    //Pagination

                    aitemList.PG_Design = aitemInfoP.PG_Design;
                    aitemList.PG_Trim = aitemInfoP.PG_Trim;
                    aitemList.PG_Column = aitemInfoP.PG_Column;
                    aitemList.PG_Font_Availability = aitemInfoP.PG_Font_Availability;
                    aitemList.PG_Figure_Slides = aitemInfoP.PG_Figure_Slides;
                    aitemList.PG_Print = aitemInfoP.PG_Print;
                    aitemList.PG_Ebook = aitemInfoP.PG_Ebook;
                    aitemList.PG_Color = aitemInfoP.PG_Color;
                    aitemList.PG_ImPrint = aitemInfoP.PG_ImPrint;
                    aitemList.PG_Template = aitemInfoP.PG_Template;
                    aitemList.PG_Remarks = aitemInfoP.PG_Remarks;
                    aitemList.PG_Query = aitemInfoP.PG_Query;
                    


                    aitemList.Approved_date = (aitemInfoP.Approved_date != null ? aitemInfoP.Approved_date : aitemList.Approved_date);
                   
                    aitemList.PG_Isapproved = (aitemInfoP.PG_Isapproved != null ? aitemInfoP.PG_Isapproved : aitemList.PG_Isapproved);
                   

                    if (aitemInfoP.Approved_date != null)
                    {
                        aitemList.ApprovedBy = int.Parse(Session["LoginID"].ToString());
                    }
                    aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                    aitemInfoP.UpdatedTime = DateTime.Now;

                    aDBManager.SaveChanges();

                    if (aitemInfoP.Approved_date != null)
                    {
                        var aBookist = aDBManager.TBL_MainMaster.Single(item => item.ID == aitemInfoP.MainID);
                        aDBManager.TBL_Signaldetails.Add(new TBL_Signaldetails()
                        {
                            Description = GetPAHTML(aitemInfoP.MainID),
                            IsSynch = 0,
                            Type = "HTML",
                            BookNo = aBookist.Number,
                            UpdatedTime = DateTime.Now

                        });
                        aDBManager.SaveChanges();
                    }

                    aBookID = aitemInfoP.MainID.ToString();
                }
                else
                {

                    if  (FileListPG != null && FileListPG.Length > 0)
                    {
                        string path = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}", aCatalog, zType, zTime));
                        string[] Filenames = Directory.GetFiles(path);
                        if (Directory.Exists(path))
                        {
                            if (Filenames.Length > 0)
                            {
                                using (ZipFile zip = new ZipFile())
                                {
                                    zip.AddFiles(Filenames, aCatalog + zType + zTime);
                                    zip.Save(Path.Combine(string.Format(path + "/{0}.zip", aCatalog + zType + zTime)));

                                }
                            }

                            var files = Directory.GetFiles(path).Where(name => !name.EndsWith(".zip"));
                            foreach (string filePath in files)
                            {
                                System.IO.File.Delete(filePath);
                            }
                        }
                        
                        aitemInfoP.PG_Attachment = (FileListPG == null ? aitemInfoP.PG_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                       
                        aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                        aitemInfoP.UpdatedTime = DateTime.Now;
                        aitemInfoP.IsDeleted = 0;

                        aDBManager.TBL_ProjectAnalysis.Add(aitemInfoP);
                        aDBManager.SaveChanges();

                    }


                }
                return Json(aBookID);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }


        }

        [HttpPost]
        public ActionResult UpdateSections_XML(TBL_ProjectAnalysis aitemInfoP, string aCatalog, string zType,  string[] FileListXML, string zTime)
        {
            try
            {
                var abookList = aDBManager.TBL_ProjectAnalysis.Where(item => item.MainID == aitemInfoP.MainID).ToList();

                if (abookList.Count == 0)
                {
                    aDBManager.TBL_ProjectAnalysis.Add(aitemInfoP);
                    aDBManager.SaveChanges();
                }
                string aBookID = "";
                if (abookList.Count > 0)
                {
                    var aitemList = aDBManager.TBL_ProjectAnalysis.Single(item => item.MainID == aitemInfoP.MainID);
                    if ( FileListXML == null)
                    {

                        string path = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}", aCatalog, zType, zTime));
                        if (Directory.Exists(path))
                        {
                            string[] Filenames = Directory.GetFiles(path);

                            if (Filenames.Length > 0)
                            {
                                using (ZipFile zip = new ZipFile())
                                {
                                    zip.AddFiles(Filenames, aCatalog + zType + zTime);
                                    zip.Save(Path.Combine(string.Format(path + "/{0}.zip", aCatalog + zType + zTime)));

                                }
                            }

                            var files = Directory.GetFiles(path).Where(name => !name.EndsWith(".zip"));
                            foreach (string filePath in files)
                            {
                                System.IO.File.Delete(filePath);
                            }

                        }

                        
                        aitemList.XML_Attachment = (FileListXML == null ? aitemList.XML_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                        
                    }


                 

                    //XML
                    aitemList.XML_Abstract = aitemInfoP.XML_Abstract;
                    aitemList.XML_Input_Type = aitemInfoP.XML_Input_Type;
                    aitemList.XML_Ref_Type = aitemInfoP.XML_Ref_Type;
                    aitemList.XML_BookAbstract= aitemInfoP.XML_BookAbstract;
                    aitemList.XML_DOI = aitemInfoP.XML_DOI;
                    aitemList.XML_Ref_Format = aitemInfoP.XML_Ref_Format;
                    aitemList.XML_Sec_Format = aitemInfoP.XML_Sec_Format;
                    aitemList.XML_Spl_Keying = aitemInfoP.XML_Spl_Keying;
                    aitemList.XML_Orcid = aitemInfoP.XML_Orcid;
                    aitemList.XML_MetaSheet = aitemInfoP.XML_MetaSheet;
                    aitemList.XML_FinalDeliverable = aitemInfoP.XML_FinalDeliverable;
                    aitemList.XML_PAPDeliverable = aitemInfoP.XML_PAPDeliverable;
                    aitemList.XML_EQ_Count = aitemInfoP.XML_EQ_Count;
                    aitemList.XML_Tab_Count = aitemInfoP.XML_Tab_Count;
                    aitemList.XML_Remarks = aitemInfoP.XML_Remarks;
                    aitemList.XML_Query = aitemInfoP.XML_Query;
                    

                    aitemList.Approved_date = (aitemInfoP.Approved_date != null ? aitemInfoP.Approved_date : aitemList.Approved_date);
                  
                    aitemList.XML_Isapproved = (aitemInfoP.XML_Isapproved != null ? aitemInfoP.XML_Isapproved : aitemList.XML_Isapproved);
                  
                    if (aitemInfoP.Approved_date != null)
                    {
                        aitemList.ApprovedBy = int.Parse(Session["LoginID"].ToString());
                    }
                    aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                    aitemInfoP.UpdatedTime = DateTime.Now;

                    aDBManager.SaveChanges();

                    if (aitemInfoP.Approved_date != null)
                    {
                        var aBookist = aDBManager.TBL_MainMaster.Single(item => item.ID == aitemInfoP.MainID);
                        aDBManager.TBL_Signaldetails.Add(new TBL_Signaldetails()
                        {
                            Description = GetPAHTML(aitemInfoP.MainID),
                            IsSynch = 0,
                            Type = "HTML",
                            BookNo = aBookist.Number,
                            UpdatedTime = DateTime.Now

                        });
                        aDBManager.SaveChanges();
                    }

                    aBookID = aitemInfoP.MainID.ToString();
                }
                else
                {

                    if  (FileListXML != null && FileListXML.Length > 0)
                    {
                        string path = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}", aCatalog, zType, zTime));
                        string[] Filenames = Directory.GetFiles(path);
                        if (Directory.Exists(path))
                        {
                            if (Filenames.Length > 0)
                            {
                                using (ZipFile zip = new ZipFile())
                                {
                                    zip.AddFiles(Filenames, aCatalog + zType + zTime);
                                    zip.Save(Path.Combine(string.Format(path + "/{0}.zip", aCatalog + zType + zTime)));

                                }
                            }

                            var files = Directory.GetFiles(path).Where(name => !name.EndsWith(".zip"));
                            foreach (string filePath in files)
                            {
                                System.IO.File.Delete(filePath);
                            }
                        }
                     
                        aitemInfoP.XML_Attachment = (FileListXML == null ? aitemInfoP.XML_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                       
                        aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                        aitemInfoP.UpdatedTime = DateTime.Now;
                        aitemInfoP.IsDeleted = 0;

                        aDBManager.TBL_ProjectAnalysis.Add(aitemInfoP);
                        aDBManager.SaveChanges();

                    }


                }
                return Json(aBookID);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }


        }

        [HttpPost]
        public ActionResult UpdateSections_Artwork(TBL_ProjectAnalysis aitemInfoP, string aCatalog, string zType,  string[] FileListArt, string zTime)
        {
            try
            {
                var abookList = aDBManager.TBL_ProjectAnalysis.Where(item => item.MainID == aitemInfoP.MainID).ToList();

                if (abookList.Count == 0)
                {
                    aDBManager.TBL_ProjectAnalysis.Add(aitemInfoP);
                    aDBManager.SaveChanges();
                }
                string aBookID = "";
                if (abookList.Count > 0)
                {
                    var aitemList = aDBManager.TBL_ProjectAnalysis.Single(item => item.MainID == aitemInfoP.MainID);
                    if (FileListArt == null)
                    {
                        string path = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}", aCatalog, zType, zTime));
                        if (Directory.Exists(path))
                        {
                            string[] Filenames = Directory.GetFiles(path);

                            if (Filenames.Length > 0)
                            {
                                using (ZipFile zip = new ZipFile())
                                {
                                    zip.AddFiles(Filenames, aCatalog + zType + zTime);
                                    zip.Save(Path.Combine(string.Format(path + "/{0}.zip", aCatalog + zType + zTime)));
                                }
                            }

                            var files = Directory.GetFiles(path).Where(name => !name.EndsWith(".zip"));
                            foreach (string filePath in files)
                            {
                                System.IO.File.Delete(filePath);
                            }
                        }
                        
                        aitemList.Art_Attachment = (FileListArt == null ? aitemList.Art_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));
                    }

                    //Artwork
                    aitemList.Art_Color_Type = aitemInfoP.Art_Color_Type;
                    aitemList.Art_Page_Width = aitemInfoP.Art_Page_Width;
                    aitemList.Art_Page_Height = aitemInfoP.Art_Page_Height;
                    aitemList.Art_Figures_Count = aitemInfoP.Art_Figures_Count;
                    aitemList.Art_Redraws = aitemInfoP.Art_Redraws;
                    aitemList.Art_Remarks = aitemInfoP.Art_Remarks;
                    aitemList.Art_Query = aitemInfoP.Art_Query;
                    aitemList.Art_ArtWork = aitemInfoP.Art_ArtWork;
                    aitemList.Art_ScatterColors = aitemInfoP.Art_ScatterColors;
                    aitemList.Is_NoArtwork = aitemInfoP.Is_NoArtwork;

                    aitemList.Approved_date = (aitemInfoP.Approved_date != null ? aitemInfoP.Approved_date : aitemList.Approved_date);
                   
                    aitemList.Artwork_Isapproved = (aitemInfoP.Artwork_Isapproved != null ? aitemInfoP.Artwork_Isapproved : aitemList.Artwork_Isapproved);

                    if (aitemInfoP.Approved_date != null)
                    {
                        aitemList.ApprovedBy = int.Parse(Session["LoginID"].ToString());
                    }
                    aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                    aitemInfoP.UpdatedTime = DateTime.Now;

                    aDBManager.SaveChanges();

                    if (aitemInfoP.Approved_date != null)
                    {
                        var aBookist = aDBManager.TBL_MainMaster.Single(item => item.ID == aitemInfoP.MainID);
                        aDBManager.TBL_Signaldetails.Add(new TBL_Signaldetails()
                        {
                            Description = GetPAHTML(aitemInfoP.MainID),
                            IsSynch = 0,
                            Type = "HTML",
                            BookNo = aBookist.Number,
                            UpdatedTime = DateTime.Now
                        });
                        aDBManager.SaveChanges();
                    }

                    aBookID = aitemInfoP.MainID.ToString();
                }
                else
                {
                    if (FileListArt != null && FileListArt.Length > 0)
                    {
                        string path = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}", aCatalog, zType, zTime));
                        string[] Filenames = Directory.GetFiles(path);
                        if (Directory.Exists(path))
                        {
                            if (Filenames.Length > 0)
                            {
                                using (ZipFile zip = new ZipFile())
                                {
                                    zip.AddFiles(Filenames, aCatalog + zType + zTime);
                                    zip.Save(Path.Combine(string.Format(path + "/{0}.zip", aCatalog + zType + zTime)));
                                }
                            }

                            var files = Directory.GetFiles(path).Where(name => !name.EndsWith(".zip"));
                            foreach (string filePath in files)
                            {
                                System.IO.File.Delete(filePath);
                            }
                        }
                       
                        aitemInfoP.Art_Attachment = (FileListArt == null ? aitemInfoP.Art_Attachment : string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, aCatalog + zType + zTime + ".zip"));

                        aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                        aitemInfoP.UpdatedTime = DateTime.Now;
                        aitemInfoP.IsDeleted = 0;

                        aDBManager.TBL_ProjectAnalysis.Add(aitemInfoP);
                        aDBManager.SaveChanges();
                    }
                }
                return Json(aBookID);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }
        }

        [HttpPost]
        public ActionResult AddColumnComment(TBL_ProjectAnalysis_CMTS aitemInfoP)
        {
            try
            {
                var aitemList = aDBManager.TBL_ProjectAnalysis_CMTS.SingleOrDefault(item => item.BookID == aitemInfoP.BookID
                && item.TabName == aitemInfoP.TabName && item.ColumnName == aitemInfoP.ColumnName);


                if (aitemList != null)
                {

                    aitemList.BookID = aitemInfoP.BookID;
                    aitemList.TabName = aitemInfoP.TabName;
                    aitemList.ColumnName = aitemInfoP.ColumnName;
                    aitemList.Comment = aitemInfoP.Comment;
                    aitemList.IsResolved = aitemInfoP.IsResolved;
                    aDBManager.SaveChanges();
                }
                else
                {
                    aitemInfoP.CreatedBy = Session["LoginID"].ToString();
                    aitemInfoP.CreatedTime = DateTime.Now;
                    aitemInfoP.UpdatedTime = DateTime.Now;
                    aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                    aDBManager.TBL_ProjectAnalysis_CMTS.Add(aitemInfoP);
                    aDBManager.SaveChanges();

                    var aitem = aDBManager.TBL_ProjectAnalysis.SingleOrDefault(item => item.MainID == aitemInfoP.BookID);
                    if (aitem != null)
                    {
                        if (aitemInfoP.TabName == "Project Manager")
                        {
                            aitem.PM_Isapproved = null;
                        }
                        else if (aitemInfoP.TabName == "XML")
                        {
                            aitem.XML_Isapproved = null;
                        }
                        else if (aitemInfoP.TabName == "Pagination")
                        {
                            aitem.PG_Isapproved = null;
                        }
                        else if (aitemInfoP.TabName == "Quality Check")
                        {
                            aitem.QC_Isapproved = null;
                        }
                        else if (aitemInfoP.TabName == "Artwork")
                        {
                            aitem.Artwork_Isapproved = null;
                        }
                        aitem.UpdatedTime = DateTime.Now;
                        aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                        aDBManager.SaveChanges();
                    }
                }

                return Json("Updated");
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }

        }


        #region Attachment

        [HttpPost]
        public ActionResult FileuploadM()
        {


            string aBookID = Request["BookID"];
            //var abookL = aDBManager.TBL_MainMaster.Single(item => item.ID.ToString() == aBookID);
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
                        string zPlacePathL = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}", aBookID, Request["UploadTab"], aTime));

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
        public ActionResult DeleteFile(string aCatalog, string FileNameP, string zType, string zTime)
        {

            string zFilePath = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}/{3}", aCatalog, zType, zTime, FileNameP));

            if (System.IO.File.Exists(zFilePath))
            {
                System.IO.File.Delete(zFilePath);
            }
            return Json("File Deleted", JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult DeleteallFilesFromFolder(int aBookID)
        {

            string zFilePath = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}", aBookID));

            if (Directory.Exists(zFilePath))
            {
                DeleteDirectory(zFilePath);
            }


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


        #endregion



        //[HttpPost]

        //public ActionResult FileuploadM()
        //{

        //    int aBookID = int.Parse(Request["BookID"]);
        //    var abookL = aDBManager.TBL_MainMaster.Single(item => item.ID == aBookID);
        //    // Checking no of files injected in Request object  
        //    if (Request.Files.Count > 0)
        //    {
        //        string fname = "";
        //        try
        //        {


        //            HttpFileCollectionBase files = Request.Files;
        //            for (int i = 0; i < files.Count; i++)
        //            {

        //                HttpPostedFileBase file = files[i];


        //                if (Request.Browser.Browser.ToUpper() == "IE" || Request.Browser.Browser.ToUpper() == "INTERNETEXPLORER")
        //                {
        //                    string[] testfiles = file.FileName.Split(new char[] { '\\' });
        //                    fname = testfiles[testfiles.Length - 1];
        //                }
        //                else
        //                {
        //                    fname = file.FileName;
        //                }

        //                string zPlacePathL = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}", abookL.Catalog, Request["UploadTab"]));
        //                Common.CheckDirectory(zPlacePathL);
        //                fname = Path.Combine(zPlacePathL, fname);
        //                file.SaveAs(fname);

        //            }

        //            return Json("Success", JsonRequestBehavior.AllowGet);
        //        }
        //        catch (Exception ex)
        //        {
        //            return Json("Error occurred. Error details: " + ex.Message, JsonRequestBehavior.AllowGet);
        //        }
        //    }

        //    else
        //    {
        //        return Json("No files selected.", JsonRequestBehavior.AllowGet);
        //    }


        //}
        //[HttpGet]
        //public ActionResult DeleteFile(string aCatalog, string FileNameP, string zType)
        //{

        //    string zFilePath = Server.MapPath(string.Format("~/Source/ProjectAnalysis/{0}/{1}/{2}", aCatalog, zType, FileNameP));

        //    if (System.IO.File.Exists(zFilePath))
        //    {
        //        System.IO.File.Delete(zFilePath);
        //    }
        //    return Json("File Deleted", JsonRequestBehavior.AllowGet);
        //}

        #endregion

    }
}


