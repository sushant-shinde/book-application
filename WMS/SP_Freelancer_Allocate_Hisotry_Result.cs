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
    
    public partial class SP_Freelancer_Allocate_Hisotry_Result
    {
        public int ID { get; set; }
        public string ChapterNo { get; set; }
        public string BookNo { get; set; }
        public string Catalog { get; set; }
        public string TaskName { get; set; }
        public string FreelancerName { get; set; }
        public Nullable<int> MSPages { get; set; }
        public Nullable<int> TypesetPages { get; set; }
        public string AllocationType { get; set; }
        public Nullable<System.DateTime> AllocationDate { get; set; }
        public Nullable<System.DateTime> DueDate { get; set; }
        public string FileName { get; set; }
        public Nullable<System.DateTime> FileUploadDate { get; set; }
        public string FinalFileName { get; set; }
        public Nullable<System.DateTime> FinalDate { get; set; }
        public Nullable<int> TotalPages { get; set; }
        public Nullable<int> TotalWords { get; set; }
        public Nullable<int> TotalTables { get; set; }
        public Nullable<int> TotalFigures { get; set; }
        public Nullable<byte> IsInvoiced { get; set; }
        public Nullable<byte> IsTransfer { get; set; }
    }
}