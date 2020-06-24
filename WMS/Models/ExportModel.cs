using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Web;

namespace WMS.Models
{
    public class ExportModel
    {
        public int Sr_No { get; set; }
        public string FreelancerName { get; set; }
        public string FreelancerEmail { get; set; }
        public string MobileNo { get; set; }
        public string Publisher { get; set; }
        public string  BookId { get; set; }
        public string Catalog { get; set; }
        public string ISBN { get; set; }
        public string ChapterNo { get; set; }
        public string PEName { get; set; }
        public string PMName{ get; set; }
        public string Task{ get; set; }
        public string Status { get; set; }
        public string AllocationDate { get; set; }
        public string  DueDate { get; set; }
        public string  CompletedDate { get; set; }        
    }
}