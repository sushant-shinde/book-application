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
    
    public partial class TBL_SubMaster
    {
        public int ID { get; set; }
        public string Number { get; set; }
        public string Title { get; set; }
        public int MainID { get; set; }
        public Nullable<System.DateTime> ReceivedDt { get; set; }
        public Nullable<System.DateTime> DueDt { get; set; }
        public Nullable<int> MSPages { get; set; }
        public Nullable<int> ColorFig { get; set; }
        public Nullable<int> BWFig { get; set; }
        public Nullable<int> ProofPages { get; set; }
        public Nullable<int> Tables { get; set; }
        public string AuthorName { get; set; }
        public string AuthorEmail { get; set; }
        public string Notes { get; set; }
        public Nullable<bool> Status { get; set; }
        public byte IsSynch { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public System.DateTime UpdatedTime { get; set; }
        public byte IsDeleted { get; set; }
        public Nullable<int> WordCnt { get; set; }
    }
}
