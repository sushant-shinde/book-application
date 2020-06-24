using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel.Channels;
using System.Web;
using System.Web.Http;
using WMS.AuthJWT;

using WMS.Models;

namespace WMS.Controllers
{
    public class WMSAPIController : ApiController
    {
        WMSEntities aDBManager = new WMSEntities();

        [HttpGet]
        [Route("api/Getpwd/{id}")]
        public IHttpActionResult GwtPWD(int id)
        {
            var itemList = aDBManager.UserMasters.SingleOrDefault(item => item.UserID== id);
            string zpassword = Common.DecryptString(itemList.Password);
            return Ok(zpassword);
        }

        [Route("api/tocken/{userName}/{password}")]
        public HttpResponseMessage GetTocken(string username, string password)
        {
            if (CheckUser(username, password))
            {
                return Request.CreateResponse(HttpStatusCode.OK, JwtAuthManager.GenerateJWTToken(username));
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.Unauthorized, "Invalid Request");
            }
        }

        public bool CheckUser(string username, string password)
        {
            password = Common.EncryptString(password);
            var aitemList = aDBManager.TBL_WEBAPI_UsersList.SingleOrDefault(item => item.UserName == username && item.Password == password);

            if (aitemList != null)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        [HttpGet]
        [Route("api/gettest")]
        public IHttpActionResult Gettest()
        {

            return Ok("Test");
        }

        [JwtAuthentication]
        [Route("api/GetSesameSignalData")]
        public IHttpActionResult GetSesameSignalData()
        {
            List<TBL_Signaldetails> Data = aDBManager.TBL_Signaldetails.Where(item => item.IsSynch == 0).OrderBy(item => item.SNo).ToList();

            TBL_WEBAPI_Log aitem = new TBL_WEBAPI_Log();
            aitem.WebAPI = "GetSesameSignalData";
            aitem.ClientID = GetIp();
            aitem.Status = "OK";
            aitem.EntryDate = DateTime.Now;
            aDBManager.TBL_WEBAPI_Log.Add(aitem);
            aDBManager.SaveChanges();

            return Ok<List<TBL_Signaldetails>>(Data);
        }

        [JwtAuthentication]
        [Route("api/GetFreelancerFileUploadList")]
        public IHttpActionResult GetFreelancerFileUploadList()
        {
            var Data = aDBManager.SP_GetFreelancerSubMaster_UploadFileList().ToList();

            TBL_WEBAPI_Log aitem = new TBL_WEBAPI_Log();
            aitem.WebAPI = "GetFreelancerFileUploadList";
            aitem.ClientID = GetIp();
            aitem.Status = "OK";
            aitem.EntryDate = DateTime.Now;
            aDBManager.TBL_WEBAPI_Log.Add(aitem);
            aDBManager.SaveChanges();

            return Ok(Data);
        }


        [JwtAuthentication]
        [Route("api/GetProjectPlanList")]
        public IHttpActionResult GetProjectPlanList()
        {
            var Data = aDBManager.SP_GetProjectPlan_List_FOR_API().ToList();

            TBL_WEBAPI_Log aitem = new TBL_WEBAPI_Log();
            aitem.WebAPI = "GetProjectPlanList";
            aitem.ClientID = GetIp();
            aitem.Status = "OK";
            aitem.EntryDate = DateTime.Now;
            aDBManager.TBL_WEBAPI_Log.Add(aitem);
            aDBManager.SaveChanges();

            return Ok(Data);
        }

        [HttpGet]
        [JwtAuthentication]

        [Route("api/UpdateSesameSignalData/{SignalID}")]
        public IHttpActionResult UpdateSesameSignalData(int SignalID)
        {
            string zParam = string.Empty;
            string zClientID = string.Empty;

            try
            {
                zParam = string.Format("SignalID={0}", SignalID);
                zClientID = GetIp();

                var aitem = aDBManager.TBL_Signaldetails.Single(item => item.SNo == SignalID);
                aitem.IsSynch = 1;
                aitem.UpdatedTime = DateTime.Now;
                aDBManager.SaveChanges();

                return Ok(string.Format("Success : IsSynch Column Updated for SignalID - {0}", SignalID));

            }
            catch (Exception ex)
            {
                TBL_WEBAPI_Log aitem = new TBL_WEBAPI_Log();
                aitem.WebAPI = "UpdateSesameSignalData";
                aitem.Parameter = zParam;
                aitem.ClientID = zClientID;
                aitem.Status = "OK";
                aitem.EntryDate = DateTime.Now;
                aDBManager.TBL_WEBAPI_Log.Add(aitem);
                aDBManager.SaveChanges();

                return BadRequest(string.Format("Error : {0}", ex.Message));
            }
        }


        [HttpPost]
        [JwtAuthentication]

        [Route("api/UpdateClientDataToSesame")]
        public IHttpActionResult UpdateClientDataToSesame(ClinetSignalData request)
        {
            string SignalDetails = request.QueryString;
            string zParam = string.Empty;
            string zClientID = string.Empty;
            try
            {
                //IEnumerable<string> QueryString = request.Headers.GetValues("QueryString");
                //SignalDetails = QueryString.FirstOrDefault();
                SignalDetails = SignalDetails.Replace("(Star)", "*");
                SignalDetails = SignalDetails.Replace("|Quotes|", "’");
                SignalDetails = SignalDetails.Replace("|Colon|", ":");
                SignalDetails = SignalDetails.Replace("|Dash|", "-");
                var aresultL = aDBManager.SP_UpdateData_FromAPI(SignalDetails, GetClientIp());

                zParam = string.Format("SignalDetails={0}", SignalDetails);
                zClientID = GetIp();

                TBL_WEBAPI_Log aitem = new TBL_WEBAPI_Log();
                aitem.WebAPI = "UpdateClientDataToSesame";
                aitem.Parameter = zParam;
                aitem.Status = "OK";
                aitem.ClientID = zClientID;
                aitem.EntryDate = DateTime.Now;
                aDBManager.TBL_WEBAPI_Log.Add(aitem);
                aDBManager.SaveChanges();

                return Ok(string.Format("Success : Data Updated to Sesame", ""));

            }
            catch (Exception ex)
            {

                TBL_WEBAPI_Log aitem = new TBL_WEBAPI_Log();
                aitem.WebAPI = "UpdateClientDataToSesame";
                aitem.Parameter = zParam;
                aitem.Status = ex.Message;
                aitem.ClientID = zClientID;
                aitem.EntryDate = DateTime.Now;
                aDBManager.TBL_WEBAPI_Log.Add(aitem);
                aDBManager.SaveChanges();



                return BadRequest(string.Format("Error : {0}", ex.Message));
            }
        }


        [HttpPost]
        [JwtAuthentication]

        [Route("api/UpdateFreelancerFileName")]
        public IHttpActionResult UpdateFreelancerFile(FreelancerFU request)
        {
            string zParam = string.Empty;
            string zClientID = string.Empty;
            try
            {
                int nFS_ID = request.FS_ID;
                string zFileName = request.FileName;

                var aitemFS = aDBManager.TBL_FreelanceSubMaster.SingleOrDefault(item => item.ID == nFS_ID);
                aitemFS.FileName = zFileName;
                aDBManager.SaveChanges();

                zParam = string.Format("File={0} FS_ID={1}", zFileName, nFS_ID);
                zClientID = GetIp();

                TBL_WEBAPI_Log aitem = new TBL_WEBAPI_Log();
                aitem.WebAPI = "UpdateClientDataToSesame";
                aitem.Parameter = zParam;
                aitem.Status = "OK";
                aitem.ClientID = zClientID;
                aitem.EntryDate = DateTime.Now;
                aDBManager.TBL_WEBAPI_Log.Add(aitem);
                aDBManager.SaveChanges();

                return Ok(string.Format("Success : Data Updated to Sesame", ""));

            }
            catch (Exception ex)
            {

                TBL_WEBAPI_Log aitem = new TBL_WEBAPI_Log();
                aitem.WebAPI = "UpdateClientDataToSesame";
                aitem.Parameter = zParam;
                aitem.Status = ex.Message;
                aitem.ClientID = zClientID;
                aitem.EntryDate = DateTime.Now;
                aDBManager.TBL_WEBAPI_Log.Add(aitem);
                aDBManager.SaveChanges();



                return BadRequest(string.Format("Error : {0}", ex.Message));
            }
        }

        public string GetIp()
        {
            return GetClientIp();
        }

        private string GetClientIp(HttpRequestMessage request = null)
        {
            request = request ?? Request;

            if (request.Properties.ContainsKey("MS_HttpContext"))
            {
                return ((HttpContextWrapper)request.Properties["MS_HttpContext"]).Request.UserHostAddress;
            }
            else if (request.Properties.ContainsKey(RemoteEndpointMessageProperty.Name))
            {
                RemoteEndpointMessageProperty prop = (RemoteEndpointMessageProperty)request.Properties[RemoteEndpointMessageProperty.Name];
                return prop.Address;
            }
            else if (HttpContext.Current != null)
            {
                return HttpContext.Current.Request.UserHostAddress;
            }
            else
            {
                return null;
            }
        }
    }

    public class ClinetSignalData
    {
        public string QueryString { get; set; }
    }

    public class FreelancerFU
    {
        public int FS_ID { get; set; }
        public string FileName { get; set; }
    }
}

