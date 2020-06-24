using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace WMS.Models
{
    public class CustomAuthorizeAttribute : AuthorizeAttribute
    {
        WMSEntities context = new WMSEntities(); // my entity  
        private readonly string[] allowedroles;

        public CustomAuthorizeAttribute(params string[] roles)
        {
            this.allowedroles = roles;
        }
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            bool authorize = false;
            string zJson = httpContext.Session["UserData"].ToString();
            DataTable dt = (DataTable)JsonConvert.DeserializeObject(zJson, (typeof(DataTable)));
            HttpContextBase context = new HttpContextWrapper(HttpContext.Current);
            RouteData rd = RouteTable.Routes.GetRouteData(context);

            string controllerName = rd.GetRequiredString("controller").ToLower();
            string actionName = rd.GetRequiredString("action").ToLower();

            string zAccessMenusList = dt.Rows[0]["MainMenu"].ToString().ToLower();

            if (zAccessMenusList.Contains(actionName)|| zAccessMenusList.Contains(controllerName))
            {
                authorize = true;
            }

            return authorize;
        }
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            filterContext.Result = new HttpUnauthorizedResult();
        }
    }
}