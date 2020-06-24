using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WMS.Models
{
    public class FreelanceModel
    {
        public List<SelectListItem> PublisherList { get; set; }
        public List<SelectListItem> CatalogList { get; set; }
        public List<SelectListItem> NumberList { get; set; }
        public List<SelectListItem> ISBNList { get; set; }
        public List<SelectListItem> TaskList { get; set; }

        public List<SelectListItem> Source { get; set; }
        public List<SelectListItem> Language { get; set; }
        public List<SelectListItem> Country { get; set; }

        public List<SelectListItem> SubjectList { get; set; }

        public List<SelectListItem> FreelancerList { get; set; }
    }
}