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
    
    public partial class SP_GetActivityList_ProjectPlan_Result
    {
        public Nullable<int> WorkFlowID { get; set; }
        public Nullable<int> ActivityID { get; set; }
        public Nullable<int> Sequence { get; set; }
        public string Activity { get; set; }
        public Nullable<decimal> Percentage { get; set; }
        public Nullable<byte> ParallelID { get; set; }
        public Nullable<decimal> Days { get; set; }
        public Nullable<int> TotalDueDays { get; set; }
        public Nullable<System.DateTime> ScheduleDate { get; set; }
    }
}
