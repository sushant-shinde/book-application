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
    
    public partial class SP_GetProofTrackingData_Result
    {
        public int ID { get; set; }
        public string Number { get; set; }
        public string Catalog { get; set; }
        public string ChapterID { get; set; }
        public string UploadType { get; set; }
        public string UserType { get; set; }
        public string Stage { get; set; }
        public string EmailID { get; set; }
        public Nullable<System.DateTime> DueDate { get; set; }
        public Nullable<System.DateTime> InsertDate { get; set; }
        public Nullable<System.DateTime> FileUploadDate { get; set; }
        public string UploadFileName { get; set; }
        public Nullable<System.DateTime> MailSentDate { get; set; }
        public Nullable<int> LoginID { get; set; }
        public Nullable<byte> IsReminder { get; set; }
        public Nullable<byte> IsReminder1 { get; set; }
        public Nullable<System.DateTime> Reminder1Date { get; set; }
        public Nullable<byte> Reminder1Sent { get; set; }
        public Nullable<byte> Reminder1Off { get; set; }
        public Nullable<byte> IsReminder2 { get; set; }
        public Nullable<System.DateTime> Reminder2Date { get; set; }
        public Nullable<byte> Reminder2Sent { get; set; }
        public Nullable<byte> Reminder2Off { get; set; }
        public Nullable<byte> IsReminder3 { get; set; }
        public Nullable<System.DateTime> Reminder3Date { get; set; }
        public Nullable<byte> Reminder3Sent { get; set; }
        public Nullable<byte> Reminder3Off { get; set; }
        public Nullable<System.DateTime> DownloadDate { get; set; }
        public Nullable<byte> NoCorrection { get; set; }
        public Nullable<System.DateTime> CorrectionReceiveDt { get; set; }
        public string Status { get; set; }
        public Nullable<System.DateTime> AcceptDate { get; set; }
        public Nullable<byte> Booked { get; set; }
    }
}