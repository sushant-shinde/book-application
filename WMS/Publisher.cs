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
    
    public partial class Publisher
    {
        public int Publ_ID { get; set; }
        public string Publ_Acronym { get; set; }
        public string Publ_Title { get; set; }
        public Nullable<bool> Publ_Status { get; set; }
        public Nullable<bool> Publ_Journal { get; set; }
        public Nullable<bool> Publ_Book { get; set; }
        public Nullable<byte> Active { get; set; }
        public string ActiveYear { get; set; }
    }
}
