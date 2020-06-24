using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WMS.Models
{
    public class UserViewModel
    {
        public UserMaster aUserMaster { get; set; }
        public UserModel aUserModel { get; set; }
        public Tbl_RoleMaster aRoleMaster { get; set; }
    }
}