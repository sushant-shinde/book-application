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
    
    public partial class Tbl_MenuList
    {
        public int MenuID { get; set; }
        public string MenuName { get; set; }
        public Nullable<int> ParentMenu { get; set; }
        public string Action { get; set; }
        public string Description { get; set; }
        public string UpdatedBy { get; set; }
        public Nullable<System.DateTime> UpdatedTime { get; set; }
        public Nullable<int> Position { get; set; }
        public byte IsDeleted { get; set; }
    }
}
