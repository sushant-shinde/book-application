using Newtonsoft.Json;
using WMS.Models;
using WMS;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Newtonsoft.Json.Linq;
using System.Text;

namespace WMS.Controllers
{

    public class SettingsController : Controller
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
        // GET: Settings

        [CustomAuthorizeAttribute]
        public ActionResult Workflow()
        {
            BookModels aBkData = new BookModels();
            aBkData.PublisherList = Common.GetPublisherList(false);
            return View(aBkData);
        }

        [CustomAuthorizeAttribute]
        public ActionResult Projectplan()
        {
            settings aitemData = new settings();
            aitemData.WorkFlowList = GetWorkFlow();
            aitemData.CatalogList = GetBookList();
            return View(aitemData);
        }


        #region Workflow Module Code


        [HttpPost]
        public ActionResult GetWorkFlowList()
        {
            var aItemList = aDBManager.SP_GetWorkFlow_List();
            var aActivityList = aDBManager.TBL_WorkFlowActivities.Where(item => item.Activity != "").
                Select(item => new { item.ID, item.Activity, item.Percentage }).ToList();
            return Json(new { aItemList, aActivityList }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult GetWorkFlowMaster(string nWorkFlowNameP)
        {
            var zWrkList = aDBManager.TBL_WorkFlowList.Single(item => item.WorkFlowName == nWorkFlowNameP);
            int nWorkFlowIDP = zWrkList.ID;
            var aitemList = aDBManager.TBL_WorkFlowMaster
                            .Join(aDBManager.TBL_WorkFlowActivities, AB => AB.ActivityID, BC => BC.ID, (AB, BC) => new { AB, BC })
                            .Where(item => (item.AB.WorkFlowID == nWorkFlowIDP) && (item.AB.IsDeleted == 0)
                            )
                       .Select(item => new { item.AB.WorkFlowID, item.AB.ActivityID, item.AB.ParallelID, item.BC.Activity, item.AB.Percentage, item.AB.Milestone }).ToList();

            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult DeleteWorkFlow(string nWorkFlowNameP)
        {

            var zWrkList = aDBManager.TBL_WorkFlowList.SingleOrDefault(item => item.WorkFlowName == nWorkFlowNameP);
            int nWorkFlowID = zWrkList.ID;

            var aPPBookCount = aDBManager.TBL_ProjectPlanning.Where(item => item.IsDeleted == 0 && item.WorkFlowID == nWorkFlowID).Count();
            if (aPPBookCount > 0)
            {
                return Json("Error : Workflow Already Assgin in Project Plan !", JsonRequestBehavior.AllowGet);
            }
            else
            {
                zWrkList.IsDeleted = 1;
                zWrkList.UpdatedTime = DateTime.Now;
                zWrkList.UpdatedBy = Session["LoginID"].ToString();
                aDBManager.SaveChanges();

                var zWrkMaster = aDBManager.TBL_WorkFlowMaster.Where(item => item.WorkFlowID == nWorkFlowID).ToList();
                zWrkMaster.ForEach(item =>
                {
                    item.IsDeleted = 1;
                    item.UpdatedTime = DateTime.Now;

                });
                aDBManager.SaveChanges();

                return Json("Workflow details Deleted Successfully!", JsonRequestBehavior.AllowGet);
            }


        }
        [HttpPost]
        public ActionResult UpdateWorkFlow(string zWorkFlowName, int zMinDay, int zMaxDay, string zPublisherList, string zDescription, string[] WorkFlowMasterL)
        {

            int nWorkFlowID = 0;

            var zWrkList = aDBManager.TBL_WorkFlowList.SingleOrDefault(item => item.WorkFlowName == zWorkFlowName);
            if (zWrkList != null)
            {
                nWorkFlowID = zWrkList.ID;
                zWrkList.MinDays = zMinDay;
                zWrkList.MaxDays = zMaxDay;
                zWrkList.PublisherList = zPublisherList;
                zWrkList.Description = zDescription;
                zWrkList.UpdatedTime = DateTime.Now;
                zWrkList.UpdatedBy = Session["LoginID"].ToString();
                aDBManager.SaveChanges();
            }
            else
            {
                TBL_WorkFlowList aitemNew = new TBL_WorkFlowList();

                aitemNew.WorkFlowName = zWorkFlowName;
                aitemNew.MinDays = zMinDay;
                aitemNew.MaxDays = zMaxDay;
                aitemNew.PublisherList = zPublisherList;
                aitemNew.Description = zDescription;
                aitemNew.CreatedTime = DateTime.Now;
                aitemNew.CreatedBy = Session["LoginID"].ToString();
                aitemNew.UpdatedTime = DateTime.Now;
                aitemNew.UpdatedBy = Session["LoginID"].ToString();
                aDBManager.TBL_WorkFlowList.Add(aitemNew);
                aDBManager.SaveChanges();
                nWorkFlowID = aitemNew.ID;
            }

            using (var dbcontext = new WMSEntities())
            {

                using (DbContextTransaction transaction = dbcontext.Database.BeginTransaction())
                {
                    try
                    {
                        IEnumerable<TBL_WorkFlowMaster> alist = dbcontext.TBL_WorkFlowMaster.Where(i => i.WorkFlowID == nWorkFlowID).ToList();
                        dbcontext.TBL_WorkFlowMaster.RemoveRange(alist);
                        dbcontext.SaveChanges();


                        foreach (var item in WorkFlowMasterL)
                        {
                            string[] zstrSplit = item.Split(',');

                            string zActName = zstrSplit[1].ToString();
                            int nActivityID = 0;

                            var zActList = aDBManager.TBL_WorkFlowActivities.SingleOrDefault(itemL => itemL.Activity == zActName);
                            if (zActList == null)
                            {
                                TBL_WorkFlowActivities aitemActNew = new TBL_WorkFlowActivities();
                                aitemActNew.Activity = zActName;
                                aitemActNew.Percentage = Convert.ToDecimal(zstrSplit[3]);
                                aitemActNew.CreatedTime = DateTime.Now;
                                aitemActNew.CreatedBy = Session["LoginID"].ToString();
                                aitemActNew.UpdatedTime = DateTime.Now;
                                aitemActNew.UpdatedBy = Session["LoginID"].ToString();
                                aitemActNew.IsDeleted = 0;
                                aDBManager.TBL_WorkFlowActivities.Add(aitemActNew);
                                aDBManager.SaveChanges();
                                nActivityID = aitemActNew.ID;
                            }
                            else
                                nActivityID = zActList.ID;

                            Nullable<byte> aParallelID = null;
                            if (Convert.ToBoolean(zstrSplit[2]))
                                aParallelID = Convert.ToByte(Convert.ToBoolean(zstrSplit[2]));

                            dbcontext.TBL_WorkFlowMaster.Add(new TBL_WorkFlowMaster()
                            {
                                WorkFlowID = nWorkFlowID,
                                ActivityID = nActivityID,
                                Sequence = Convert.ToInt32(zstrSplit[0]),
                                ParallelID = aParallelID,
                                Percentage = Convert.ToDecimal(zstrSplit[3]),
                                Milestone = Convert.ToByte(Convert.ToBoolean(zstrSplit[4])),
                                UpdatedTime = DateTime.Now,
                                IsDeleted = 0
                            });
                            dbcontext.SaveChanges();
                        }
                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        return Json(ex.Message, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            return Json("Workflow details updated Successfully!", JsonRequestBehavior.AllowGet);

        }
        #endregion

        #region Project Plan Module Code

        [HttpPost]
        public ActionResult GetWorkFlowList_ByBookID(int nBookIDP)
        {

            var aItemList = aDBManager.sp_GetWorkflowList_ByBookID(nBookIDP);
            return Json(new { aItemList }, JsonRequestBehavior.AllowGet);

        }


        [HttpPost]
        public ActionResult GetProjectPlanList()
        {
            int aLoginID = int.Parse(Session["LoginID"].ToString());
            var aItemList1 = aDBManager.SP_ProjectPlanList("", aLoginID);
            var aItemList = aItemList1.OrderByDescending(item => item.DueDate).ToList();
            return Json(new { aItemList }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult GetActivityList(int zWorkFlowID, int zBookID, int zBufferDay)
        {
            var aItemList = aDBManager.SP_GetActivityList_ProjectPlan(zWorkFlowID, zBookID, zBufferDay);

            var aBk_Wrk_Info = aDBManager.SP_GetBookWorkFlowInfo(zBookID, zWorkFlowID);

            return Json(new { aItemList, aBk_Wrk_Info }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult PopulateProjectPlan(int nPlanID, int zBookID, int zWorkFlowID)
        {
            var aItemList = aDBManager.SP_GetProjectPlan_UpdatedList(nPlanID);
            var aBk_Wrk_Info = aDBManager.SP_GetBookWorkFlowInfo(zBookID, zWorkFlowID);
            return Json(new { aItemList, aBk_Wrk_Info }, JsonRequestBehavior.AllowGet);

        }


        public List<SelectListItem> GetBookList()
        {
            List<SelectListItem> items = new List<SelectListItem>();
            items = aDBManager.SP_GetBookList(0, Session["LoginID"].ToString()).OrderBy(x => x.Catalog).
                Select(x => new SelectListItem() { Text = string.Format("{0} ({1})", x.Number, x.Catalog), Value = x.ID.ToString() }).ToList();
            return items;
        }

        public List<SelectListItem> GetWorkFlow()
        {
            List<SelectListItem> items = new List<SelectListItem>();
            items = aDBManager.TBL_WorkFlowList.Where(x => x.IsDeleted == 0).OrderBy(x => x.WorkFlowName).
                Select(x => new SelectListItem() { Text = x.WorkFlowName, Value = x.ID.ToString() }).
                ToList();
            return items;
        }


        [HttpPost]
        public ActionResult UpdateProjectPlan(int zBookID, int zWorkFlowID, int zBufferDay, string[] zActivityList)
        {
            int zPlanID = 0;

            var zitemListP = aDBManager.TBL_ProjectPlanning.Where(item => item.WorkFlowID != zWorkFlowID && item.BookID == zBookID && item.IsDeleted == 0).ToList();
            if (zitemListP.Count > 0)
            {
                return Json("Project Plan Already Assigned this Book", JsonRequestBehavior.AllowGet);
            }

            var zitemList = aDBManager.TBL_ProjectPlanning.SingleOrDefault(item => item.WorkFlowID == zWorkFlowID && item.BookID == zBookID && item.IsDeleted == 0);
            if (zitemList != null)
            {
                zPlanID = zitemList.PlanID;
                zitemList.BufferDays = zBufferDay;
                aDBManager.SaveChanges();
            }
            else
            {
                TBL_ProjectPlanning aitemInfoP = new TBL_ProjectPlanning();
                aitemInfoP.BookID = zBookID;
                aitemInfoP.WorkFlowID = zWorkFlowID;
                aitemInfoP.EntryDate = DateTime.Now;
                aitemInfoP.BufferDays = zBufferDay;
                aitemInfoP.CreatedTime = DateTime.Now;
                aitemInfoP.CreatedBy = Session["LoginID"].ToString();
                aitemInfoP.UpdatedTime = DateTime.Now;
                aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                aitemInfoP.IsDeleted = 0;
                aDBManager.TBL_ProjectPlanning.Add(aitemInfoP);

                var aBookP = aDBManager.TBL_MainMaster.Single(item => item.ID == zBookID);
                aBookP.Status = "Project Planning";
                aDBManager.SaveChanges();
                zPlanID = aitemInfoP.PlanID;
            }


            using (var dbcontext = new WMSEntities())
            {

                using (DbContextTransaction transaction = dbcontext.Database.BeginTransaction())
                {

                    try
                    {
                        IEnumerable<TBL_ProjectPlanning_Flow> alist = dbcontext.TBL_ProjectPlanning_Flow.Where(i => i.PlanID == zPlanID).ToList();
                        dbcontext.TBL_ProjectPlanning_Flow.RemoveRange(alist);
                        dbcontext.SaveChanges();

                        foreach (var item in zActivityList)
                        {
                            string[] zstrSplit = item.Split(',');

                            string zActName = zstrSplit[1].ToString();
                            int nActivityID = 0;
                            var zActList = aDBManager.TBL_WorkFlowActivities.Single(itemL => itemL.Activity == zActName);
                            nActivityID = zActList.ID;

                            Nullable<DateTime> aRevisedScheduleDate = Convert.ToDateTime(zstrSplit[4]);
                            if (zstrSplit.Length > 6)
                            {
                                if (zstrSplit[6] != "")
                                    aRevisedScheduleDate = Convert.ToDateTime(zstrSplit[6]);
                            }

                            Nullable<DateTime> aCompletedDate = null;
                            if (zstrSplit.Length > 7)
                            {
                                if (zstrSplit[7] != "")
                                    aCompletedDate = Convert.ToDateTime(zstrSplit[7]);
                            }

                            dbcontext.TBL_ProjectPlanning_Flow.Add(new TBL_ProjectPlanning_Flow()
                            {
                                PlanID = zPlanID,
                                ActivityID = nActivityID,
                                Percentage = Convert.ToDecimal(zstrSplit[2]),
                                Days = Convert.ToDecimal(zstrSplit[3]),
                                ScheduleDate = Convert.ToDateTime(zstrSplit[4]),
                                RevisedScheduleDate = aRevisedScheduleDate,
                                CompletedDate = aCompletedDate,
                                UpdatedBy = Session["LoginID"].ToString(),
                                UpdatedTime = DateTime.Now

                            }); ;
                            dbcontext.SaveChanges();
                        }
                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return Json(ex.Message, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            var aBookList = GetBookList();
            var zMsg = "Project Plan details updated Successfully!";
            return Json(new { zMsg, aBookList }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult GetScheduleDate(int nPlanID, int nSequnceID, string zCompletedDt, int zDaysP, string zReceivedDt, string zDaysList)
        {
            var aitemList = "";
            DataTable adtL = new DataTable();
            adtL.Columns.Add("SNo", typeof(String));
            adtL.Columns.Add("Activity", typeof(String));
            adtL.Columns.Add("Percentage", typeof(String));
            adtL.Columns.Add("Days", typeof(String));
            adtL.Columns.Add("ScheduleDate", typeof(DateTime));
            adtL.Columns.Add("RevisedScheduleDate", typeof(DateTime));
            adtL.Columns.Add("CompletedDate", typeof(DateTime));
            DateTime aReceivedDt = Convert.ToDateTime(zReceivedDt);
            DateTime aCompletedDt = Convert.ToDateTime(zCompletedDt);

            if (zDaysList != "")
            {
                int aIndex = 0;
                var zitemList = aDBManager.SP_GetProjectPlan_beforeupdate(aReceivedDt, zDaysList).FirstOrDefault();
                foreach (var item in zitemList.Split(','))
                {
                    if (item != "")
                    {
                        DataRow adr = adtL.NewRow();
                        adr["SNo"] = aIndex + 1;
                        adr["ScheduleDate"] = Convert.ToDateTime(item);
                        adtL.Rows.Add(adr);
                        aIndex++;
                    }
                }


            }
            else if (zDaysP == 0)// For Completed Changes Revised Schedule List
            {
                var zitemList = aDBManager.SP_GetProjectPlan_UpdatedList_New(nPlanID, nSequnceID, aCompletedDt);

                foreach (var item in zitemList)
                {
                    DataRow adr = adtL.NewRow();
                    adr["SNo"] = item.Sequence;
                    adr["Activity"] = item.Activity;
                    adr["Percentage"] = item.Percentage;
                    adr["Days"] = item.Days;
                    adr["ScheduleDate"] = Convert.ToDateTime(item.ScheduleDate);
                    adr["RevisedScheduleDate"] = Convert.ToDateTime(item.RevisedScheduleDate);
                    adr["CompletedDate"] = Convert.ToDateTime(item.CompletedDate);
                    adtL.Rows.Add(adr);

                }
            }
            else if (zDaysP != 0)// For Days Changes Revised Schedule List
            {
                var zitemList = aDBManager.SP_GetProjectPlan_UpdatedList_Newdays(nPlanID, nSequnceID, zDaysP, aCompletedDt);
                foreach (var item in zitemList)
                {
                    DataRow adr = adtL.NewRow();
                    adr["SNo"] = item.Sequence;
                    adr["Activity"] = item.Activity;
                    adr["Percentage"] = item.Percentage;
                    adr["Days"] = item.Days;
                    adr["ScheduleDate"] = Convert.ToDateTime(item.ScheduleDate);
                    adr["RevisedScheduleDate"] = Convert.ToDateTime(item.RevisedScheduleDate);
                    adr["CompletedDate"] = Convert.ToDateTime(item.CompletedDate);
                    adtL.Rows.Add(adr);

                }

            }
            aitemList = JsonConvert.SerializeObject(adtL, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });
            return Json(aitemList, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult DeleteProjectPlan(int nPlanID)
        {
            var zPlanList = aDBManager.TBL_ProjectPlanning.Single(item => item.PlanID == nPlanID);
            zPlanList.IsDeleted = 1;
            zPlanList.UpdatedTime = DateTime.Now;
            zPlanList.UpdatedBy = Session["LoginID"].ToString();
            aDBManager.SaveChanges();

            var zPlanFlow = aDBManager.TBL_ProjectPlanning_Flow.Where(item => item.PlanID == nPlanID).ToList();
            aDBManager.TBL_ProjectPlanning_Flow.RemoveRange(zPlanFlow);
            aDBManager.SaveChanges();

            var aBookList = GetBookList();
            var zMsg = "Project Plan details Deleted Successfully!";
            return Json(new { zMsg, aBookList }, JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region Task Calendar
        //[CustomAuthorizeAttribute]
        public ActionResult TaskCalendar()
        {
            UserViewModel aUserInfo = new UserViewModel();
            aUserInfo.aUserModel = GetUserModel();

            return View(aUserInfo);
        }

        public UserModel GetUserModel()
        {
            UserModel bModel = new UserModel()
            {
                ddlUserList = GetUserList(),
            };
            return bModel;
        }
        public List<SelectListItem> GetUserList()
        {
            List<SelectListItem> items = new List<SelectListItem>();

            items = aDBManager.UserMasters.OrderBy(x => x.LoginName).
                Where(x => x.IsDeleted == 0 && ((x.UserType == "PM") || (x.UserType == "PE"))).
                Select(x => new SelectListItem() { Text = x.LoginName, Value = x.UserID.ToString() }).
                ToList();

            return items;
        }

        [HttpGet]
        public JsonResult GetTaskList()
        {
            List<GlobalTaskList> aTaskList = new List<GlobalTaskList>();

            int aLoginID = int.Parse(Session["LoginID"].ToString());

            var aUserType = Session["UserType"].ToString();

            if (aUserType != "Manager")
            {
                var aitemList = aDBManager.Tbl_TaskCalendar.Where(item => (item.CreatedBy == aLoginID) && (item.IsDeleted == 0) || (item.UsersList.Contains(aLoginID.ToString()))).Select(item => new
                {
                    id = item.SNo,
                    title = item.Title,
                    start = item.StartDate,
                    end = item.EndDate,
                    url = item.Url,
                    description = item.Description,

                });


                foreach (var item in aitemList)
                {
                    aTaskList.Add(new GlobalTaskList
                    {
                        id = item.id,
                        title = item.title,
                        start = item.start,
                        end = item.end,
                        url = item.url,
                        color = "#0b7eca",
                        description = item.description

                    });
                }
            }

            else
            {
                var aitemList = aDBManager.Tbl_TaskCalendar.Where(item => (item.CreatedBy == aLoginID) && (item.IsDeleted == 0)).Select(item => new
                {
                    id = item.SNo,
                    title = item.Title,
                    start = item.StartDate,
                    end = item.EndDate,
                    url = item.Url,
                    description = item.Description,

                });


                foreach (var item in aitemList)
                {
                    aTaskList.Add(new GlobalTaskList
                    {
                        id = item.id,
                        title = item.title,
                        start = item.start,
                        end = item.end,
                        url = item.url,
                        color = "#0b7eca",
                        description = item.description

                    });
                }
            }
            //aitemList = aDBManager.Tbl_TaskCalendar.Where(item => item.UsersList.Contains(aLoginID.ToString())).Select(item => new
            //{
            //    id = 0,
            //    title = item.Title,
            //    start = item.StartDate,
            //    end = item.EndDate,
            //    url = item.Url,
            //    description = item.Description,

            //});


            //foreach (var item in aitemList)
            //{
            //    aTaskList.Add(new GlobalTaskList
            //    {
            //        id = item.id,
            //        title = item.title,
            //        start = item.start,
            //        end = item.end,
            //        url = item.url,
            //        color = "#0b7eca1",
            //        description = item.description

            //    });
            //}

            var aitemList_Pipeline = aDBManager.TBL_Pipeline
              .Join(aDBManager.Publishers, AB => AB.PublisherID, BC => BC.Publ_ID, (AB, BC) => new { AB, BC })
              .Where(item => (item.AB.IsDeleted == 0) || (item.AB.IsDeleted == null)
              ).Select(item => new
              {

                  id = item.AB.ID,
                  title = item.BC.Publ_Acronym + " - " + item.AB.ISBN,
                  start = item.AB.ExpectedDt,
                  end = item.AB.ExpectedDt,

              });
            foreach (var item in aitemList_Pipeline)
            {
                aTaskList.Add(new GlobalTaskList
                {
                    id = 0,
                    title = item.title,
                    start = item.start,
                    end = item.end,
                    color = "#acb81d",
                    description = item.title
                });
            }


            var aitemList_Activity = aDBManager.SP_GetTaskDueDateList_ForNotification(aLoginID).ToList();


            foreach (var item in aitemList_Activity)
            {
                aTaskList.Add(new GlobalTaskList
                {
                    id = 0,
                    title = string.Format("{0}({1}) - {2}", item.Catalog, item.Number, item.Activity),
                    start = item.ScheduleDate,
                    end = item.ScheduleDate,
                    color = "#F78888",
                    description = string.Format("{0}({1}) - {2}", item.Catalog, item.Number, item.Activity),
                });
            }


            var rows = aTaskList.Select(item => new { item.id, item.title, item.start, item.end, item.url, item.color, item.description }).ToArray();
            return Json(rows, JsonRequestBehavior.AllowGet);
        }


        [HttpGet]
        public ActionResult GetTaskDetails(int zTaskID)
        {
            var aitemList = aDBManager.Tbl_TaskCalendar.Single(item => item.SNo == zTaskID);

            return Json(new { aitemList }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult UpdateTaskDetails(Tbl_TaskCalendar aitemP)
        {
            if (aitemP.SNo == 0)
            {
                DateTime aTempDate = Convert.ToDateTime(aitemP.StartDate).Date;
                DateTime aEndDate = Convert.ToDateTime(aitemP.EndDate).Date;
                while (aTempDate.Date <= aEndDate.Date)
                {
                    if (aTempDate.DayOfWeek.ToString() != "Sunday" && aTempDate.DayOfWeek.ToString() != "Saturday")
                    {
                        aitemP.StartDate = aTempDate.Add(Convert.ToDateTime(aitemP.StartDate).TimeOfDay);
                        aitemP.EndDate = aTempDate.Add(Convert.ToDateTime(aitemP.EndDate).TimeOfDay);
                        if (aitemP.Status == "Completed")
                            aitemP.Completed = DateTime.Now;
                        aitemP.CreatedBy = int.Parse(Session["LoginID"].ToString());
                        aitemP.CreatedTIme = DateTime.Now;
                        aitemP.UpdatedBy = Session["LoginID"].ToString();
                        aitemP.UpdatedTime = DateTime.Now;
                        aitemP.IsDeleted = 0;

                        aDBManager.Tbl_TaskCalendar.Add(aitemP);
                        aDBManager.SaveChanges();
                    }
                    aTempDate = aTempDate.AddDays(1);
                }

            }
            else
            {
                var aitemList = aDBManager.Tbl_TaskCalendar.Single(item => item.SNo == aitemP.SNo);
                aitemList.Title = aitemP.Title;
                aitemList.StartDate = aitemP.StartDate;
                aitemList.EndDate = aitemP.EndDate;
                aitemList.Description = aitemP.Description;
                aitemList.Status = aitemP.Status;
                aitemList.UsersList = aitemP.UsersList;
                if (aitemP.Status == "Completed")
                    aitemP.Completed = DateTime.Now;
                aitemP.UpdatedBy = Session["LoginID"].ToString();
                aitemP.UpdatedTime = DateTime.Now;
                aDBManager.SaveChanges();
            }

            int aLoginID = int.Parse(Session["LoginID"].ToString());
            var aItemListCount = aDBManager.SP_GetTaskNotifications(aLoginID).Count();
            Session["TaskCount"] = aItemListCount;

            return Json(aItemListCount, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public ActionResult GetNotification()
        {
            List<GlobalTaskList> aItemList = new List<GlobalTaskList>();
            int aLoginID = int.Parse(Session["LoginID"].ToString());
            var aItemList1 = aDBManager.SP_GetTaskNotifications(aLoginID);

            ////helpdesk count
            if (aLoginID != 1 && Session["UserType"].ToString() != "PM")
            {
                var aitemCount = aDBManager.SP_GetHelpdeskDetailsbyID(aLoginID, "Pending").Count();
                Session["HelpdeskCount"] = aitemCount;

            }
            else
            {

                var aitemCount = aDBManager.SP_GetHelpDeskdata_All("Pending").Count();
                Session["HelpdeskCount"] = aitemCount;
            }

            int aHelpdeskCount = int.Parse(Session["HelpdeskCount"].ToString());

            int aItemListCount = aItemList.Count();


            foreach (var item in aItemList1)
            {
                aItemList.Add(new GlobalTaskList
                {
                    id = item.SNo,
                    title = item.Title,
                    start = item.StartDate,
                    end = item.EndDate,
                    url = item.Url,
                    description = item.Description,
                    color = "#0b7eca",
                    Duration = item.Duration

                });
            }


            var aitemList_Activity = aDBManager.SP_GetTaskDueDateList_ForNotification(aLoginID).ToList();
            aitemList_Activity = aitemList_Activity.Where(item => (item.ScheduleDate >= DateTime.Now.Date && (item.ScheduleDate <= DateTime.Now.Date))).ToList();

            aItemListCount += aitemList_Activity.Count();

            foreach (var item in aitemList_Activity)
            {
                aItemList.Add(new GlobalTaskList
                {
                    id = 0,
                    title = string.Format("<b>Today Due</b><br>{0}({1}) - {2}", item.Catalog, item.Number, item.Activity),
                    start = item.ScheduleDate,
                    end = item.ScheduleDate,
                    color = "#F78888",
                    description = item.Catalog + " - " + item.Activity
                });
            }


            // Pipeline ,Query and Freelancer Nofification List
            var aNotifyList = aDBManager.SP_GetNofification_ToDo_List(aLoginID).ToList();

            aItemListCount += aNotifyList.Count();

            foreach (var item in aNotifyList)
            {
                aItemList.Add(new GlobalTaskList
                {
                    id = 0,
                    title = string.Format("{0}", item.Title),
                    start = item.DueDate,
                    end = item.DueDate,
                    color = "#acb81d",
                    description = item.Title
                });
            }


            Session["TaskCount"] = aItemListCount;
            return Json(new { aItemList, aItemListCount, aHelpdeskCount }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult UpdateCompletedTask(Tbl_TaskCalendar aitemP)
        {
            var aitemList = aDBManager.Tbl_TaskCalendar.Single(item => item.SNo == aitemP.SNo);

            aitemList.Status = "Completed";
            aitemList.Completed = DateTime.Now;
            aitemList.UpdatedBy = Session["LoginID"].ToString();
            aitemList.UpdatedTime = DateTime.Now;
            aDBManager.SaveChanges();

            //Task Notification
            int aLoginID = int.Parse(Session["LoginID"].ToString());
            var aItemListCount = aDBManager.SP_GetTaskNotifications(aLoginID).Count();
            Session["TaskCount"] = aItemListCount;

            return Json(aItemListCount, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult DeleteTaskDetails(int zTaskID)
        {

            var zTaskList = aDBManager.Tbl_TaskCalendar.SingleOrDefault(item => item.SNo == zTaskID);


            zTaskList.IsDeleted = 1;
            zTaskList.UpdatedTime = DateTime.Now;
            zTaskList.UpdatedBy = Session["LoginID"].ToString();

            aDBManager.SaveChanges();

            return Json("Task details Deleted Successfully!", JsonRequestBehavior.AllowGet);
        }
        #endregion

    }

}