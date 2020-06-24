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
    
    public partial class TBL_Invoice
    {
        public int ID { get; set; }
        public Nullable<int> BookID { get; set; }
        public string Service { get; set; }
        public string Complexity { get; set; }
        public string Type { get; set; }
        public Nullable<decimal> PublisherCost { get; set; }
        public Nullable<decimal> InitialUnitVolume { get; set; }
        public Nullable<decimal> InitialUnitCost { get; set; }
        public Nullable<decimal> InvoiceUnitVolume { get; set; }
        public Nullable<decimal> InvoiceUnitCost { get; set; }
        public string AccountingCode { get; set; }
        public string UpdatedBy { get; set; }
        public Nullable<System.DateTime> UpdatedTime { get; set; }
        public Nullable<decimal> Count { get; set; }
        public Nullable<decimal> UnitPrice { get; set; }
        public Nullable<decimal> Factor { get; set; }
        public Nullable<byte> PrimaryInvoice { get; set; }
        public Nullable<byte> FinalInvoice { get; set; }
    }
}