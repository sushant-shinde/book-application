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
    
    public partial class SP_GetCurrentBookStatusWithUser_Result
    {
        public int PlanID { get; set; }
        public int ActivityID { get; set; }
        public string Activity { get; set; }
        public int BookID { get; set; }
        public Nullable<System.DateTime> CompletedDate { get; set; }
        public System.DateTime ScheduleDate { get; set; }
        public string LoginName { get; set; }
        public string EmailID { get; set; }
        public string Title { get; set; }
        public string Number { get; set; }
    }
}