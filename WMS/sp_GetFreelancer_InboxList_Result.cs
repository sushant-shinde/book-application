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
    
    public partial class sp_GetFreelancer_InboxList_Result
    {
        public int ID { get; set; }
        public Nullable<int> FreelancerID { get; set; }
        public string LoginID { get; set; }
        public string LoginName { get; set; }
        public string BookNo { get; set; }
        public string ChapterNo { get; set; }
        public Nullable<int> MSPages { get; set; }
        public Nullable<int> TypesetPages { get; set; }
        public Nullable<System.DateTime> FileUploadDate { get; set; }
        public string FileUploadStatus { get; set; }
        public Nullable<System.DateTime> DownloadDate { get; set; }
        public string DownloadStatus { get; set; }
        public Nullable<System.DateTime> AllocationDate { get; set; }
        public string AllocationType { get; set; }
        public Nullable<System.DateTime> DueDate { get; set; }
        public string FileName { get; set; }
        public Nullable<System.DateTime> FinalDate { get; set; }
        public string FinalStatus { get; set; }
        public string FinalFileName { get; set; }
        public string Publisher { get; set; }
        public string CurrentStatus { get; set; }
        public Nullable<int> PublisherID { get; set; }
        public Nullable<int> TaskID { get; set; }
        public string GuideLine { get; set; }
    }
}
