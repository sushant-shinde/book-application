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
    
    public partial class TBL_FreelanceBooks
    {
        public int ID { get; set; }
        public int MainID { get; set; }
        public int TaskID { get; set; }
        public Nullable<int> WordCount { get; set; }
        public Nullable<int> FileCapacity { get; set; }
        public string SuggestedFreelancer { get; set; }
        public Nullable<System.DateTime> SuggestedMailDt { get; set; }
        public Nullable<decimal> SuggestedCost { get; set; }
        public Nullable<int> SuggestedVolume { get; set; }
        public string SuggestedUnitType { get; set; }
        public Nullable<byte> Bookwise { get; set; }
        public Nullable<byte> Chapterwise { get; set; }
        public Nullable<System.DateTime> DueDate { get; set; }
        public Nullable<byte> SuggestionSkip { get; set; }
    }
}
