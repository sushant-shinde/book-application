using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WMS.Models
{
    public class ArchivalModel
    {
        public List<SelectListItem> PublisherList { get; set; }
        public List<SelectListItem> CatalogList { get; set; }
        public List<SelectListItem> NumberList { get; set; }
        public List<SelectListItem> ISBNList { get; set; }
    }
}