using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WMS.Models
{
    public class LoginModel
    {
        [Required(ErrorMessage = "Enter User Name")]
        public string LoginID { get; set; }

        [Required(ErrorMessage = "Enter Password")]
        public string Password { get; set; }

        public bool RememberMe { get; set; }
    }
}