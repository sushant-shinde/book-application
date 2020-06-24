using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using WMS.Models;

namespace WMS.Controllers
{

    public class UserController : Controller
    {
        // GET: User
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
        public ActionResult Index()
        {
            UserViewModel aUserInfo = new UserViewModel();
            aUserInfo.aUserMaster = GetUserMaster();
            aUserInfo.aUserModel = GetUserModel();
            aUserInfo.aRoleMaster = GetRoleMaster();
            return View(aUserInfo);
        }

        public ActionResult UserProfile()
        {
            return View();
        }

        [CustomAuthorizeAttribute]
        public ActionResult Role()
        {
            UserViewModel aRollInfo = new UserViewModel();
            aRollInfo.aRoleMaster = GetRoleMaster();
            aRollInfo.aUserModel = GetUserModel();

            return View(aRollInfo);

        }

        public Tbl_RoleMaster GetRoleMaster()
        {
            Tbl_RoleMaster bModel = new Tbl_RoleMaster();
            return bModel;
        }

        [HttpPost]
        public ActionResult GetUserMasterList()
        {
            var aitemList = aDBManager.UserMasters
                                       .Join(aDBManager.Tbl_RoleMaster, AB => AB.RoleID, BC => BC.RoleID, (AB, BC) => new { AB, BC })
                                       .Where(item => (item.AB.IsDeleted == 0) && item.AB.LoginID != "Admin"
                                       && item.AB.UserType != "AuthorEditor" && item.AB.UserType != "Author" && item.AB.UserType != "Editor"
                                       && item.AB.UserType != "Freelancer")
                                  .Select(item => new { item.AB.UserID, item.AB.LoginID, item.AB.LoginName, item.AB.EmailID, item.AB.UserType, item.AB.ActiveStatus, item.BC.RoleName, item.AB.Image }).ToList();

            string json = JsonConvert.SerializeObject(aitemList, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });

            return Json(new { json }, JsonRequestBehavior.AllowGet);
        }
        public UserMaster GetUserMaster()
        {
            UserMaster bModel = new UserMaster();
            return bModel;
        }

        public UserModel GetUserModel()
        {
            UserModel bModel = new UserModel()
            {
                ddlUserList = GetUserList(),
                ddlRoleID = GetRoleList(),
                ddlMainMenuID = GetMenuIDList(),
                ddlUserTypeList = GetUserTypeList()


            };
            return bModel;
        }

        public List<SelectListItem> GetMenuIDList()
        {
            List<SelectListItem> items = new List<SelectListItem>();

            items = aDBManager.Tbl_MenuList.Where(item => item.IsDeleted == 0).
                        Select(x => new SelectListItem() { Text = x.MenuName.ToString(), Value = x.MenuID.ToString() }).Distinct().
                        ToList();


            //items.Insert(0, new SelectListItem { Text = "Select", Value = "0" });
            return items;
        }

        public List<SelectListItem> GetUserTypeList()
        {
            List<SelectListItem> items = new List<SelectListItem>();

            items = aDBManager.UserTypes.Where(item => item.IsView == 0).
                        Select(x => new SelectListItem() { Text = x.UserType1.ToString(), Value = x.UserType1.ToString() }).Distinct().
                        ToList();


            //items.Insert(0, new SelectListItem { Text = "Select", Value = "0" });
            return items;
        }


        public List<SelectListItem> GetUserList()
        {
            List<SelectListItem> items = new List<SelectListItem>();


            items = aDBManager.UserMasters.OrderBy(x => x.LoginName).
                Where(x => x.IsDeleted == 0).
                Select(x => new SelectListItem() { Text = x.LoginName, Value = x.UserID.ToString() }).
                ToList();

            //items.Insert(0, new SelectListItem { Text = "Select", Value = "0" });
            return items;
        }

        public List<SelectListItem> GetRoleList()
        {
            List<SelectListItem> items = new List<SelectListItem>();

            items = aDBManager.Tbl_RoleMaster.Where(x => x.IsDeleted == 0 && x.RoleName != "Admin" && x.RoleName != "AuthorEditor" && x.RoleName != "Freelancer").OrderBy(x => x.RoleName).
                        Select(x => new SelectListItem() { Text = x.RoleName, Value = x.RoleID.ToString() }).
                        ToList();


            //items.Insert(0, new SelectListItem { Text = "Select", Value = "0" });
            return items;
        }

        [HttpGet]
        public ActionResult CheckExistingData(string ValueData, string zType, string zTableName = "User")
        {
            bool ifEmailExist = false;
            try
            {
                if (zTableName == "Role")
                {
                    var items = aDBManager.Tbl_RoleMaster.Where(x => x.IsDeleted == 0 && x.RoleName == ValueData).ToList();
                    ifEmailExist = items.Count == 0 ? true : false;
                }
                else if (zTableName == "Freelancer")
                {
                    var items = aDBManager.TBL_Freelancer_Master.Where(x => x.EmailID == ValueData).ToList();
                    ifEmailExist = items.Count == 0 ? true : false;
                }
                else
                {
                    var items = aDBManager.UserMasters.Where(x => x.IsDeleted == 0 && x.EmailID == ValueData).ToList();
                    if (zType == "LoginID")
                        items = aDBManager.UserMasters.Where(x => x.IsDeleted == 0 && x.LoginID == ValueData).ToList();

                    ifEmailExist = items.Count == 0 ? true : false;
                }
                return Json(!ifEmailExist, JsonRequestBehavior.AllowGet);

            }

            catch (Exception ex)
            {
                return Json(false, JsonRequestBehavior.AllowGet);

            }

        }


        [HttpPost]
        [ValidateInput(false)]
        public ActionResult UserInfoPopulate(string zuserID)
        {
            var aitemList = aDBManager.UserMasters.Where(item => item.UserID.ToString() == zuserID.ToString()).ToList();
            string json = "";
            try
            {
                json = JsonConvert.SerializeObject(aitemList, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });

            }
            catch (Exception ex)
            {

                return Json(ex.Message);
            }

            return Json(json, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult UserInfoUpdate(UserMaster aobjP)
        {
            try
            {
                if (aobjP.UserID != 0)
                {
                    var aitemList = aDBManager.UserMasters.Single(item => item.UserID == aobjP.UserID);
                    aitemList.LoginID = (aobjP.LoginID == null ? aitemList.LoginID : aobjP.LoginID);
                    aitemList.Password = (aobjP.Password == null ? aitemList.Password : Common.EncryptString(aobjP.Password));
                    aitemList.LoginName = (aobjP.LoginName == null ? aitemList.LoginName : aobjP.LoginName);
                    aitemList.Gender = (aobjP.Gender == null ? aitemList.Gender : aobjP.Gender);
                    aitemList.DOB = (aobjP.DOB == null ? aitemList.DOB : aobjP.DOB);
                    aitemList.ActiveStatus = (aobjP.ActiveStatus == null ? aitemList.ActiveStatus : aobjP.ActiveStatus);
                    aitemList.RoleID = (aobjP.RoleID == null ? aitemList.RoleID : aobjP.RoleID);
                    aitemList.PhoneNo = (aobjP.PhoneNo == null ? aitemList.PhoneNo : aobjP.PhoneNo);
                    aitemList.EmailID = (aobjP.EmailID == null ? aitemList.EmailID : aobjP.EmailID);
                    aitemList.Address = (aobjP.Address == null ? aitemList.Address : aobjP.Address);
                    aitemList.BloodGroup = (aobjP.BloodGroup == null ? aitemList.BloodGroup : aobjP.BloodGroup);
                    aitemList.WorkPhone = (aobjP.WorkPhone == null ? aitemList.WorkPhone : aobjP.WorkPhone);
                    aitemList.WorkExtNo = (aobjP.WorkExtNo == null ? aitemList.WorkExtNo : aobjP.WorkExtNo);
                    aitemList.Image = (aobjP.Image == null ? aitemList.Image : aobjP.Image);
                    aitemList.UserType = (aobjP.UserType == null ? aitemList.UserType : aobjP.UserType);
                    aitemList.UpdatedBy = Session["LoginID"].ToString();
                    aitemList.UpdatedTime = DateTime.Now;
                    aDBManager.SaveChanges();

                    if (aobjP.LoginID == null)
                    {
                        var aitemListL = aDBManager.SP_UserLogin(aitemList.LoginID, aitemList.Password).ToList();
                        Session["UserData"] = JsonConvert.SerializeObject(aitemListL, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });
                    }

                    return Json("User info Updated Successfully...");
                }
                else
                {
                    var aitemList = aDBManager.UserMasters.Where(item => item.LoginID == aobjP.LoginID).ToList();
                    if (aitemList.Count > 0)
                    {
                        return Json("Login ID Already Found...");
                    }
                    else 
                    {
                        string zPassword = Common.RandomString(6);
                        aobjP.Password = Common.EncryptString(zPassword);
                        aobjP.CreatedBy = Session["LoginID"].ToString();
                        aobjP.CreatedTime = DateTime.Now;
                        aobjP.UpdatedBy = Session["LoginID"].ToString();
                        aobjP.UpdatedTime = DateTime.Now;
                        aobjP.UserType = aobjP.UserType;
                        aobjP.DefaultPage = "Home";
                        aDBManager.UserMasters.Add(aobjP);
                        aDBManager.SaveChanges();

                        if (aobjP.ActiveStatus == "Active")
                        {
                            string Mailbody = "";
                            string zMailTempPath = string.Format("~/MailTemplate/CredentialTemplate.html");
                            if (System.IO.File.Exists(Server.MapPath(zMailTempPath)))
                                Mailbody = System.IO.File.ReadAllText(Server.MapPath(string.Format("~/MailTemplate/CredentialTemplate.html")));

                            string AppUrl = Request.Url.AbsoluteUri.Replace(Request.Url.AbsolutePath, "") + Request.ApplicationPath;
                            Mailbody = Mailbody
                                .Replace("{HINAME}", aobjP.LoginName)
                                .Replace("{UserName}", aobjP.LoginID)
                                .Replace("{Password}", zPassword)
                                .Replace("{Link}", AppUrl)
                                ;

                            var mail = MailModels.Mail(
                                        To: aobjP.EmailID,
                                        Cc: "",
                                        Bcc: "",
                                        Subject: "Sesame Credential Details",
                                        Body: Mailbody,
                                        //From: From,
                                        DisplayName: "SESAME"
                                        );

                        }
                    }

                    return Json("User info Updated Successfully...");
                }
            }
            catch (Exception ex)
            {
                return Json("Error " + ex.Message);

            }
        }


        #region RoleModule

        [HttpPost]
        public ActionResult RoleAccessPopulate(string zRoleID)
        {
            var aitemList = aDBManager.Tbl_MenuList
                .Join(aDBManager.tbl_RoleMenuAction, RA => RA.MenuID, M => M.MenuID, (RA, M) => new { RA, M })
                .Join(aDBManager.Tbl_RoleMaster, TC => TC.M.RoleID, P => P.RoleID, (TC, P) => new { TC, P })
                .Where(item => (item.TC.M.RoleID.ToString() == zRoleID) && item.P.IsDeleted == 0).Select(item => new
                {
                    item.P.RoleID,
                    item.P.RoleName,
                    item.P.Description,
                    item.P.UpdatedBy,
                    item.TC.RA.MenuName,
                    item.TC.M.MenuType,
                    item.TC.M.Actions
                })
                .ToList();

            var itemsList = aDBManager.Tbl_MenuList.Where(item => item.IsDeleted == 0).
                        Select(i => new { i.MenuName, i.Description, i.Position }).
                        OrderBy(i => i.Position).ToList();

            return Json(new { aitemList, itemsList }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult RoleInfoUpdate(Tbl_RoleMaster aitemInfoP, string adeleted)
        {
            try
            {

                string aRoleID = "";
                if (aitemInfoP.RoleID != 0)
                {

                    var aitemList = aDBManager.Tbl_RoleMaster.Single(item => item.RoleID == aitemInfoP.RoleID);
                    aitemList.RoleName = aitemInfoP.RoleName;
                    aitemList.Description = aitemInfoP.Description;
                    aitemList.UpdatedBy = Session["LoginID"].ToString();
                    aitemList.UpdatedTime = DateTime.Now;


                    aDBManager.SaveChanges();
                    aRoleID = aitemInfoP.RoleID.ToString();
                }
                else
                {
                    aitemInfoP.CreatedTime = DateTime.Now;
                    aitemInfoP.CreatedBy = Session["LoginID"].ToString();
                    aitemInfoP.UpdatedTime = DateTime.Now;
                    aitemInfoP.UpdatedBy = Session["LoginID"].ToString();
                    aDBManager.Tbl_RoleMaster.Add(aitemInfoP);
                    aDBManager.SaveChanges();
                    aRoleID = aitemInfoP.RoleID.ToString();
                }

                return Json(aRoleID);
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }


        }

        public ActionResult RoleAccessUpdate(int zRoleID, string[] AccessList)
        {
            try
            {

                using (var dbcontext = new WMSEntities())
                {

                    using (DbContextTransaction transaction = dbcontext.Database.BeginTransaction())
                    {
                        IEnumerable<tbl_RoleMenuAction> alist = dbcontext.tbl_RoleMenuAction.Where(i => i.RoleID == zRoleID).ToList();

                        dbcontext.tbl_RoleMenuAction.RemoveRange(alist);
                        dbcontext.SaveChanges();

                        foreach (var item in AccessList)
                        {

                            string[] zstrSplit = item.Split(',');
                            var zMenuName = zstrSplit[0].ToString();
                            var zItemMenu = dbcontext.Tbl_MenuList.Single(i => i.MenuName == zMenuName);
                            string zActionsList = "";

                            string aMenuTypeL = (zItemMenu.ParentMenu == 0 ? "MainMenu" : "SubMenu");

                            var zMenuID = zItemMenu.MenuID;

                            //var aitemList = dbcontext.tbl_RoleMenuAction.Where(item1 => item1.RoleID == zRoleID && item1.MenuID == zMenuID).ToList();

                            //if (aitemList.Count == 0)
                            //{

                            if (zstrSplit[1] == "true")
                            {
                                zActionsList = string.Format("{0}", "Add");
                            }

                            if (zstrSplit[2] == "true")
                            {
                                zActionsList = string.Format("{0},{1}", zActionsList, "Update");
                            }

                            if (zstrSplit[3] == "true")
                            {
                                zActionsList = string.Format("{0},{1}", zActionsList, "Delete");
                            }

                            if (zstrSplit[4] == "true")
                            {
                                zActionsList = string.Format("{0},{1}", zActionsList, "View");
                            }



                            dbcontext.tbl_RoleMenuAction.Add(new tbl_RoleMenuAction()
                            {
                                RoleID = zRoleID,
                                MenuID = zMenuID,
                                MenuType = aMenuTypeL,
                                Actions = zActionsList

                            });
                            dbcontext.SaveChanges();
                            //}
                        }

                        transaction.Commit();

                    }
                }


                return Json("Role Access updated Successfully!");
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }


        }

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult RoleDelete(int zRoleID)
        {
            var aUserCountList = aDBManager.Tbl_RoleMaster.Where(item => item.RoleID == zRoleID);
            if (aUserCountList.Count() > 0)
            {
                return Json("Error: Unable to Delete Role! Role assinged some users", JsonRequestBehavior.AllowGet);
            }
            else
            {
                var aitemList = aDBManager.Tbl_RoleMaster.Single(item => item.RoleID == zRoleID);
                aitemList.IsDeleted = 1;
                aitemList.UpdatedTime = DateTime.Now;

                var aitemList1 = aDBManager.tbl_RoleMenuAction.Where(i => i.RoleID == zRoleID).ToList();

                aDBManager.tbl_RoleMenuAction.RemoveRange(aitemList1);
                aDBManager.SaveChanges();

                return Json("Role Deleted", JsonRequestBehavior.AllowGet);
            }
        }

        #endregion
    }
}