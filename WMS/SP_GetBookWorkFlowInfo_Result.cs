//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace WMS
{
    using System;
    
    public partial class SP_GetBookWorkFlowInfo_Result
    {
        public int WorkFlowID { get; set; }
        public string WorkFlowName { get; set; }
        public Nullable<int> MinDays { get; set; }
        public Nullable<int> MaxDays { get; set; }
        public string Description { get; set; }
        public Nullable<int> BookID { get; set; }
        public string Catalog { get; set; }
        public string ISBN { get; set; }
        public Nullable<System.DateTime> ReceivedDt { get; set; }
        public string Platform { get; set; }
        public Nullable<System.DateTime> DueDt { get; set; }
        public Nullable<int> ActDueDays { get; set; }
        public string AuthorName { get; set; }
        public string AuthorEmail { get; set; }
        public string ImgPath { get; set; }
    }
}