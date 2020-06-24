using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WMS.Models
{
    public class PipelineModel
    {
        public List<SelectListItem> PublisherList { get; set; }
        public TBL_Pipeline aPipeline;
        public List<PipelineList> PipelineList { get; set; }
    }

    public class PipelineList
    {
        public int ID { get; set; }
        public string ISBN { get; set; }
        public string Title { get; set; }
        public string AuthorName { get; set; }
        public DateTime? ExpectedDt { get; set; }
        public string Publisher { get; set; }
       
    }
}