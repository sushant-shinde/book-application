using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace WMS
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        WMSEntities aDBManager = new WMSEntities();
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        protected void Application_Error()
        {

            HttpContextBase context = new HttpContextWrapper(HttpContext.Current);
            RouteData rd = RouteTable.Routes.GetRouteData(context);

            string controllerName = rd.GetRequiredString("controller");
            string actionName = rd.GetRequiredString("action");

            //log the error!
            Exception exception = Server.GetLastError();
            Response.Clear();

            tbl_errorLog aitem = new tbl_errorLog();
            aitem.Page = string.Format("ControllerName={0} ActionName={1}", controllerName, actionName);
            aitem.ErrorLog = exception.Message;
            aitem.Updatetime = DateTime.Now;
            aDBManager.tbl_errorLog.Add(aitem);
            aDBManager.SaveChanges();

            if (Session["UserData"] == null)
                Response.Redirect("~/Home/Login");


        }
    }
}
