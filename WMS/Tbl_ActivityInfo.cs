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
    
    public partial class Tbl_ActivityInfo
    {
        public int ID { get; set; }
        public string Book_ID { get; set; }
        public Nullable<System.DateTime> Act_Date { get; set; }
        public string Activity { get; set; }
        public string Createdby { get; set; }
        public Nullable<System.DateTime> CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public Nullable<System.DateTime> UpdatedTime { get; set; }
        public Nullable<byte> IsDeleted { get; set; }
    }
}
