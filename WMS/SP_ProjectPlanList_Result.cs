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
    
    public partial class SP_ProjectPlanList_Result
    {
        public int PlanID { get; set; }
        public int BookID { get; set; }
        public int WorkFlowID { get; set; }
        public string WorkFlowName { get; set; }
        public System.DateTime EntryDate { get; set; }
        public int BufferDays { get; set; }
        public string Catalog { get; set; }
        public string Title { get; set; }
        public string BookNo { get; set; }
        public string ISBN { get; set; }
        public Nullable<int> PE { get; set; }
        public Nullable<int> PM { get; set; }
        public string CurrentActivity { get; set; }
        public Nullable<System.DateTime> DueDate { get; set; }
        public Nullable<System.DateTime> FinalDueDate { get; set; }
    }
}
