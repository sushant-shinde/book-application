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
    
    public partial class TBL_Countries
    {
        public int ID { get; set; }
        public string CountryName { get; set; }
    
        public virtual TBL_Countries TBL_Countries1 { get; set; }
        public virtual TBL_Countries TBL_Countries2 { get; set; }
    }
}
