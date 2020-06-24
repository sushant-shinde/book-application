using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;


namespace WMS.Models
{
    public class ProofDistributionModel
    {
        public List<SelectListItem> PublisherList { get; set; }
        public List<SelectListItem> CatalogList { get; set; }
        public List<SelectListItem> EditorList { get; set; }
        public List<SelectListItem> NumberList { get; set; }
        public List<SelectListItem> ISBNList { get; set; }
        public List<PBookList> ProofBookList { get; set; }
    }

    public class PBookList
    {
        public int Book_ID { get; set; }
        public string Book_Number { get; set; }
        public string Book_Title { get; set; }
        public string Book_Img { get; set; }
        public string Book_ISBN { get; set; }
        public string Book_PEName { get; set; }
        public string Book_PMName { get; set; }
        public string Book_Catalog { get; set; }
        public string Book_UploadType { get; set; }
        public string Book_Category { get; set; }
        public string Book_Status { get; set; }
        public DateTime? Book_ReceivedDt { get; set; }
        public DateTime? Book_DueDt { get; set; }
    }
}