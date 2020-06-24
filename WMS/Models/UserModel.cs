using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WMS.Models
{
    public class UserModel
    {
        public List<SelectListItem> ddlUserList { get; set; }
        public List<SelectListItem> ddlTeamLead { get; set; }

        public List<SelectListItem> ddlLocation { get; set; }
        public List<SelectListItem> ddlManager { get; set; }

        public List<SelectListItem> ddlDesignation { get; set; }


        public List<SelectListItem> ddlDepartment { get; set; }

        public List<SelectListItem> ddlPublisherList { get; set; }

        public List<SelectListItem> ddlJournalList { get; set; }


        public List<SelectListItem> ddlHRID { get; set; }

        public List<SelectListItem> ddlRoleID { get; set; }

        public List<SelectListItem> ddlMainMenuID { get; set; }

        public List<SelectListItem> ddlSubMenuID { get; set; }

        public List<SelectListItem> ddlMenuAction { get; set; }

        public List<SelectListItem> ddlModuleList { get; set; }

        public List<SelectListItem> ddlUserTypeList { get; set; }
    }
}