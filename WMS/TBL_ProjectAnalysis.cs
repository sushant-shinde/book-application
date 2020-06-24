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
    
    public partial class TBL_ProjectAnalysis
    {
        public int ID { get; set; }
        public int MainID { get; set; }
        public string Art_Color_Type { get; set; }
        public string Art_Page_Width { get; set; }
        public string Art_Page_Height { get; set; }
        public string Art_ArtWork { get; set; }
        public string Art_Figures_Count { get; set; }
        public string Art_Redraws { get; set; }
        public string Art_Spl_Instruction { get; set; }
        public string Art_Remarks { get; set; }
        public string Art_Query { get; set; }
        public string Art_Completed { get; set; }
        public string QC_Greek_Chars { get; set; }
        public string QC_Variables { get; set; }
        public string QC_Spl_Elements { get; set; }
        public string QC_Footnotes { get; set; }
        public string QC_EndNotes { get; set; }
        public string QC_ColorInsert { get; set; }
        public string QC_Sec_Breaks { get; set; }
        public string QC_FM { get; set; }
        public string QC_BM { get; set; }
        public string QC_Series_Page { get; set; }
        public string QC_Index { get; set; }
        public string QC_Tables_Count { get; set; }
        public string QC_Remarks { get; set; }
        public string QC_Query { get; set; }
        public string QC_Completed { get; set; }
        public string PG_Platform { get; set; }
        public string PG_Design { get; set; }
        public string PG_Trim { get; set; }
        public string PG_Column { get; set; }
        public string PG_Font_Availability { get; set; }
        public string PG_Figure_Slides { get; set; }
        public string PG_Print { get; set; }
        public string PG_Ebook { get; set; }
        public string PG_Color { get; set; }
        public string PG_ImPrint { get; set; }
        public string PG_Template { get; set; }
        public string PG_Remarks { get; set; }
        public string PG_Query { get; set; }
        public string PG_Completed { get; set; }
        public string XML_Abstract { get; set; }
        public string XML_Input_Type { get; set; }
        public string XML_Ref_Type { get; set; }
        public string XML_Ref_Format { get; set; }
        public string XML_Sec_Format { get; set; }
        public string XML_Spl_Keying { get; set; }
        public string XML_Orcid { get; set; }
        public string XML_MetaSheet { get; set; }
        public string XML_FinalDeliverable { get; set; }
        public string XML_PAPDeliverable { get; set; }
        public string XML_EQ_Count { get; set; }
        public string XML_Tab_Count { get; set; }
        public string XML_Remarks { get; set; }
        public string XML_Query { get; set; }
        public string XML_Completed { get; set; }
        public string PM_MSS { get; set; }
        public string PM_Estimate { get; set; }
        public string PM_Castoff { get; set; }
        public string PM_CEComplexity { get; set; }
        public string PM_BKComplexity { get; set; }
        public string PM_BookType { get; set; }
        public string PM_DualEdition { get; set; }
        public string PM_PreEdition { get; set; }
        public string PM_OSPM { get; set; }
        public string PM_ISBN { get; set; }
        public string PM_English { get; set; }
        public string PM_Index { get; set; }
        public string PM_Category { get; set; }
        public string PM_Remarks { get; set; }
        public string PM_Queries { get; set; }
        public string PM_Completed { get; set; }
        public Nullable<System.DateTime> Approved_date { get; set; }
        public Nullable<int> ApprovedBy { get; set; }
        public string UpdatedBy { get; set; }
        public Nullable<System.DateTime> UpdatedTime { get; set; }
        public byte IsDeleted { get; set; }
        public Nullable<System.DateTime> PM_Isapproved { get; set; }
        public Nullable<System.DateTime> XML_Isapproved { get; set; }
        public Nullable<System.DateTime> PG_Isapproved { get; set; }
        public Nullable<System.DateTime> QC_Isapproved { get; set; }
        public Nullable<System.DateTime> Artwork_Isapproved { get; set; }
        public string PM_Attachment { get; set; }
        public string XML_Attachment { get; set; }
        public string PG_Attachment { get; set; }
        public string QC_Attachment { get; set; }
        public string Art_Attachment { get; set; }
        public string XML_BookAbstract { get; set; }
        public string XML_DOI { get; set; }
        public string Art_ScatterColors { get; set; }
        public Nullable<bool> Is_NoArtwork { get; set; }
    }
}