using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;


namespace WMS.Models
{
    public class BookModels
    {
        public List<SelectListItem> PublisherList { get; set; }
        public List<SelectListItem> CatalogList { get; set; }
        public List<SelectListItem> NumberList { get; set; }
        public List<SelectListItem> ISBNList { get; set; }
        public List<SelectListItem> PEList { get; set; }
        public List<SelectListItem> PMList { get; set; }
        public List<SelectListItem> WorkflowList { get; set; }
        public List<SelectListItem> Subject { get; set; }
        public List<SelectListItem> EditionList { get; set; }
        public List<SelectListItem> OutsourceList { get; set; }
        public List<SelectListItem> ProcessList { get; set; }
        public List<SelectListItem> PlatformList { get; set; }
        public List<SelectListItem> CategoryList { get; set; }

        public List<SelectListItem> ChapterList { get; set; }

        //public List<SelectListItem> BookList { get; set; }
        public List<TBL_MainMaster> BookList { get; set; }
        public TBL_MainMaster aBook { get; set; }
        public int PublisherID { get; set; }
        public List<NewList> NewBookList { get; set; }
        public List<OutSourceList> NewOutSourceList { get; set; }
    }

    public class NewList
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
        public string Book_Day { get; set; }
        public string Book_Publisher { get; set; }
        public string Book_ReceivedDt { get; set; }
        public DateTime? Book_DueDt { get; set; }
    }

    public class OutSourceList
    {
        public int SNo { get; set; }
        public string TaskName { get; set; }
    }
}