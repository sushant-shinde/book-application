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
    
    public partial class SP_GetNewBookList_Result
    {
        public int ID { get; set; }
        public string Number { get; set; }
        public string Catalog { get; set; }
        public string ISBN { get; set; }
        public string Title { get; set; }
        public string UploadType { get; set; }
        public string Category { get; set; }
        public string PMName { get; set; }
        public string PEName { get; set; }
        public string ReceivedDt { get; set; }
        public Nullable<System.DateTime> DueDt { get; set; }
        public string Status { get; set; }
        public Nullable<int> PublisherID { get; set; }
        public string ImgPath { get; set; }
        public byte IsDeleted { get; set; }
        public int Billed { get; set; }
        public string Publisher { get; set; }
        public string BookingDay { get; set; }
    }
}
