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
    
    public partial class SP_GetProjectPlan_UpdatedList_Result
    {
        public int PlanID { get; set; }
        public int ActivityID { get; set; }
        public string Activity { get; set; }
        public decimal Percentage { get; set; }
        public decimal Days { get; set; }
        public System.DateTime ScheduleDate { get; set; }
        public System.DateTime RevisedScheduleDate { get; set; }
        public Nullable<System.DateTime> CompletedDate { get; set; }
    }
}
