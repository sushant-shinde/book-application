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
    
    public partial class sp_GetWorkFlowMaster_Result
    {
        public int WorkFlowID { get; set; }
        public int ActivityID { get; set; }
        public Nullable<int> ParallelID { get; set; }
        public string Activity { get; set; }
        public Nullable<decimal> Percentage { get; set; }
        public byte Milestone { get; set; }
    }
}