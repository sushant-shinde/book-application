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
    using System.Collections.Generic;
    
    public partial class TBL_FreelanceBooking
    {
        public int TaskID { get; set; }
        public int PublisherID { get; set; }
        public byte NextBooking { get; set; }
        public string NextBookingStage { get; set; }
        public string NextBookingStatus { get; set; }
        public string NewNo { get; set; }
        public string DownloadPath { get; set; }
        public byte SkipSelection { get; set; }
        public string GuideLine { get; set; }
        public string UpdatedBy { get; set; }
        public System.DateTime UpdatedTime { get; set; }
    }
}
