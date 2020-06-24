using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WMS.Models
{
    public class settings
    {
        public List<SelectListItem> WorkFlowList { get; set; }
        public List<SelectListItem> CatalogList { get; set; }
    }
}