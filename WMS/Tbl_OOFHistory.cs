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
    
    public partial class Tbl_OOFHistory
    {
        public int ID { get; set; }
        public Nullable<int> MainID { get; set; }
        public string TransferMode { get; set; }
        public Nullable<int> CurrentPM { get; set; }
        public Nullable<int> TransferToPM { get; set; }
        public Nullable<System.DateTime> TransferFromDate { get; set; }
        public Nullable<System.DateTime> TransferToDate { get; set; }
        public string Remark { get; set; }
        public Nullable<int> UpdatedBy { get; set; }
        public Nullable<System.DateTime> UpdatedTime { get; set; }
    }
}
