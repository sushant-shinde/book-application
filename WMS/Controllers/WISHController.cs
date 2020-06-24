using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using WMS.Models;

namespace WMS.Controllers
{
    public class WISHController : Controller
    {
        WMSEntities aDBManager = new WMSEntities();
        protected override JsonResult Json(object data, string contentType, Encoding contentEncoding, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data = data,
                ContentType = contentType,
                ContentEncoding = contentEncoding,
                JsonRequestBehavior = behavior,
                MaxJsonLength = Int32.MaxValue
            };
        }

        [CustomAuthorizeAttribute]
        // GET: WISH
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult GetBookList(string zFromDate, string zToDate, string zTabType)
        {
            DateTime dtFrom = Convert.ToDateTime(zFromDate);
            DateTime dtTo = Convert.ToDateTime(zToDate);


            DateTime baseDate = DateTime.Today;
            DateTime dtFromL = dtFrom;
            DateTime dtToL = dtTo;

            if (zTabType == "Today")
            {
                dtFromL = DateTime.Today;
                dtToL = dtFrom;
            }
            else if (zTabType == "Tomorrow")
            {
                dtFromL = baseDate;
                dtToL = dtFromL.AddDays(1);
            }
            else if (zTabType == "This Week")
            {
                dtFromL = baseDate.AddDays(-(int)baseDate.DayOfWeek);
                dtToL = dtFrom.AddDays(7).AddSeconds(-1);
            }
            else if (zTabType == "This Month")
            {
                dtFromL = baseDate.AddDays(1 - baseDate.Day);
                dtToL = dtFromL.AddMonths(1).AddSeconds(-1);
            }

            int nLoginID = int.Parse(Session["LoginID"].ToString());

            var zBookList1 = aDBManager.SP_GetWISH_BookList(nLoginID, dtFromL, dtToL);
            var zBookList = JsonConvert.SerializeObject(zBookList1, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });
            var zActivityList = aDBManager.SP_GetWISH_Book_ActivityList(nLoginID, dtFromL, dtToL);
            return Json(new { zBookList, zActivityList }, JsonRequestBehavior.AllowGet);
        }
    }
}