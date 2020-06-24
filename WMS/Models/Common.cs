using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Text;
using System.IO;
using System.Web.Mvc;
using Ionic.Zip;
using NReco.PdfGenerator;

namespace WMS.Models
{
    public class Common
    {
        private static Random random = new Random();
        public static string RandomString(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }
        public static string ToTitleCase(string str)
        {
            return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(str.ToLower());
        }



        public static DataTable ToDataTable<T>(List<T> items)
        {
            DataTable dataTable = new DataTable(typeof(T).Name);

            //Get all the properties
            PropertyInfo[] Props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in Props)
            {
                //Defining type of data column gives proper data table 
                var type = (prop.PropertyType.IsGenericType && prop.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>) ? Nullable.GetUnderlyingType(prop.PropertyType) : prop.PropertyType);
                //Setting column names as Property names
                dataTable.Columns.Add(prop.Name, type);
            }
            foreach (T item in items)
            {
                var values = new object[Props.Length];
                for (int i = 0; i < Props.Length; i++)
                {
                    //inserting property values to datatable rows
                    values[i] = Props[i].GetValue(item, null);

                }
                dataTable.Rows.Add(values);
            }
            //put a breakpoint here and check datatable
            return dataTable;
        }


        public static DateTime GetRevisedDate(DateTime adtP, int nTATP)
        {
            WMSEntities aDBManager = new WMSEntities();
            DateTime ddate = adtP;
            var aLeaveInfoP = aDBManager.Holidays.Where(item => item.Leave_Date.Year == DateTime.Now.Year).ToList();

            ArrayList alist = new ArrayList();
            foreach (var item in aLeaveInfoP)
            {

                alist.Add(Convert.ToDateTime(item.Leave_Date).ToString("yyyy-MM-dd"));

            }
            for (int i = 1; i <= nTATP; i++)
            {
                do
                {
                    ddate = ddate.AddDays(1);
                }
                while (ddate.DayOfWeek == DayOfWeek.Saturday || ddate.DayOfWeek == DayOfWeek.Sunday || alist.Contains(ddate.Date.ToString("yyyy-MM-dd")));
            }
            if (nTATP == 0)
            {
                while (ddate.DayOfWeek == DayOfWeek.Saturday || ddate.DayOfWeek == DayOfWeek.Sunday || alist.Contains(ddate.Date.ToString("yyyy-MM-dd")))
                {
                    ddate = ddate.AddDays(1);
                }
            }
            return ddate;

        }

        public static string EncryptString(string zstrP)
        {
            string zstr = string.Empty;
            char sChar;


            for (int i = 0; i < zstrP.Length; i++)
            {
                sChar = Convert.ToChar(Mid(zstrP, i, 1));
                int ninP = sChar;
                byte val = (byte)(ninP + zstrP.Length);
                zstr += Encoding.Default.GetString(new byte[] { val });
            }

            return zstr;

        }

        public static string DecryptString(string zstrP)
        {
            string zstr = string.Empty;
            char sChar;


            for (int i = 0; i < zstrP.Length; i++)
            {
                sChar = Convert.ToChar(Mid(zstrP, i, 1));
                int ninP = sChar;
                byte val = (byte)(ninP - zstrP.Length);
                zstr += Encoding.Default.GetString(new byte[] { val });
            }

            return zstr;


        }

        public static string Mid(string s, int start, int length)
        {
            if (start > s.Length || start < 0)
            {
                return s;
            }

            if (start + length > s.Length)
            {
                length = s.Length - start;
            }

            string ret = s.Substring(start, length);
            return ret;
        }

        public static string CheckDirectory(string path)
        {
            try
            {
                if (!Directory.Exists(path))
                {
                    var isDir = Directory.CreateDirectory(path).Exists;

                }
                return path;
            }
            catch (Exception)
            {
                return path;
            }
        }
        public static void DeleteDirectory(string target_dir)
        {
            try
            {
                string[] files = Directory.GetFiles(target_dir);
                string[] dirs = Directory.GetDirectories(target_dir);

                foreach (string file in files)
                {
                    System.IO.File.SetAttributes(file, FileAttributes.Normal);
                    System.IO.File.Delete(file);
                }

                foreach (string dir in dirs)
                {
                    DeleteDirectory(dir);
                }

                Directory.Delete(target_dir, false);
            }
            catch (Exception)
            {

            }
        }

        public static void CreateZIP(string zpathL, string zZipNameP, string zZipPathP)
        {

            string path = zpathL;//Location for inside Test Folder  
            string[] Filenames = Directory.GetFiles(path);

            if (!Directory.Exists(zZipPathP))
                Directory.CreateDirectory(zZipPathP);

            using (ZipFile zip = new ZipFile())
            {
                zip.AddFiles(Filenames, zZipNameP.Replace(".zip",""));
                zip.Save(Path.Combine(zZipPathP + "/" + zZipNameP));
                Common.DeleteDirectory(zpathL);
            }


        }

        static WMSEntities aDBManager = new WMSEntities();
        public static List<SelectListItem> GetISBNList(int zLoginID, bool awithAllC = true, bool isBilled = false)
        {
            var aUserInfo = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == zLoginID);

            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();

            var aitemList = aDBManager.SP_GetFilterOption_List(zLoginID).Select(item => new { item.ISBN }).ToList();

            if (awithAllC)
                items.Add(new SelectListItem { Text = "All", Value = "All" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.ISBN == null ? string.Empty : item.ISBN.ToUpper(),
                    Text = item.ISBN == null ? string.Empty : item.ISBN.ToUpper()

                });
            }

            return items;
        }

        public static List<SelectListItem> GetNumberList(int zLoginID, bool awithAllC = true, bool isBilled = false)
        {
            var aUserInfo = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == zLoginID);

            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();

            var aitemList = aDBManager.SP_GetFilterOption_List(zLoginID).Select(item => new { item.Number }).ToList();

            if (awithAllC)
                items.Add(new SelectListItem { Text = "All", Value = "All" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.Number == null ? string.Empty : item.Number.ToUpper(),
                    Text = item.Number == null ? string.Empty : item.Number.ToUpper()

                });
            }

            return items;
        }

        public static List<SelectListItem> GetPublisherList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager.Publishers.Where(item => (item.Active == 1) && (item.Publ_Status == null) || (item.Publ_Status == false)
                                                        ).Select(item => new { item.Publ_Acronym, item.Publ_ID }).OrderBy(item => item.Publ_Acronym).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.Publ_ID.ToString(),
                    Text = item.Publ_Acronym.ToUpper()

                });
            }
            return items;
        }

        public static List<SelectListItem> GetCatalogList(int zLoginID, bool awithAllC = true, bool isBilled = false)
        {

            var aUserInfo = aDBManager.UserMasters.SingleOrDefault(item => item.UserID == zLoginID);

            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();

            var aitemList = aDBManager.SP_GetFilterOption_List(zLoginID).Select(item => new { item.Catalog }).ToList();
            if (awithAllC)
                items.Add(new SelectListItem { Text = "All", Value = "All" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.Catalog == null ? string.Empty : item.Catalog,
                    Text = item.Catalog == null ? string.Empty : item.Catalog

                });
            }

            return items;
        }

        public static List<SelectListItem> GetTaskList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager.TBL_Freelancer_Task.Select(item => new { item.SNo, item.TaskName }).ToList();
            if (awithAllP)
                items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.SNo.ToString(),
                    Text = item.TaskName.ToUpper()

                });
            }
            return items;
        }

        public static List<SelectListItem> GetSubjectList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager.TBL_Subject.Select(item => new { item.ID, item.Subject }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.ID.ToString(),
                    Text = item.Subject.ToUpper()

                });
            }
            return items;
        }

        public static List<SelectListItem> GetSourceList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager.TBL_SourceList.Select(item => new { item.ID, item.SourceName }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.ID.ToString(),
                    Text = item.SourceName.ToUpper()

                });
            }
            return items;
        }

        public static List<SelectListItem> GetLanguageList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager.TBL_Languages.Select(item => new { item.ID, item.Language }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.ID.ToString(),
                    Text = item.Language.ToUpper()

                });
            }
            return items;
        }

        public static List<SelectListItem> GetCountryList(bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager.TBL_Countries.Select(item => new { item.ID, item.CountryName }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.ID.ToString(),
                    Text = item.CountryName.ToUpper()

                });
            }
            return items;
        }

        public static List<SelectListItem> GetStateList(int CountryID, bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager.TBL_States.Where(item => item.CountryID == CountryID).Select(item => new { item.ID, item.StateName }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.ID.ToString(),
                    Text = item.StateName.ToUpper()

                });
            }
            return items;
        }

        public static List<SelectListItem> GetCityList(int StateID, bool awithAllP = true)
        {
            List<SelectListItem> items = new List<SelectListItem>();
            DataTable aDtL = new DataTable();
            var aitemList = aDBManager.TBL_Cities.Where(item => item.StateID == StateID).Select(item => new { item.ID, item.CityName }).ToList();
            //if (awithAllP)
            //    items.Add(new SelectListItem { Text = "Select", Value = "" });

            foreach (var item in aitemList)
            {
                items.Add(new SelectListItem()
                {
                    Value = item.ID.ToString(),
                    Text = item.CityName.ToUpper()

                });
            }
            return items;
        }

        public static List<Book_ActivityList> ReScheduleDetails(DataTable adtList)
        {
            List<Book_ActivityList> aTransUpdateL = new List<Book_ActivityList>();
            Nullable<DateTime> aRevisedLastDateL = DateTime.Now;
            for (int i = 0; i < adtList.Rows.Count; i++)
            {
                Nullable<DateTime> aCompeltedDateL;

                if (adtList.Rows[i]["CompletedDate"].ToString() == "")
                    aCompeltedDateL = null;
                else
                    aCompeltedDateL = (DateTime)adtList.Rows[i]["CompletedDate"];


                aTransUpdateL.Add(new Book_ActivityList
                {
                    Activity = adtList.Rows[i]["Activity"].ToString(),
                    Percentage = Convert.ToDecimal(adtList.Rows[i]["Percentage"].ToString()),
                    Days = Convert.ToDecimal(adtList.Rows[i]["Days"].ToString()),
                    ScheduleDate = (DateTime)adtList.Rows[i]["ScheduleDate"],
                    RevisedDate = (DateTime)adtList.Rows[i]["RevisedScheduleDate"],
                    CompletedDate = aCompeltedDateL
                });
            }

            return aTransUpdateL;
        }

        public static byte[] GetHTMLtoPDF(string zHTMLStrP)
        {
            var htmlContent = zHTMLStrP;
            var htmlToPdf = new HtmlToPdfConverter();
            var pdfBytes = htmlToPdf.GeneratePdf(htmlContent);
            return pdfBytes;
        }

        public static List<SelectListItem> GetFreelancerList()
        {
            List<SelectListItem> FreelancerList = new List<SelectListItem>();
            var aItemList = aDBManager.TBL_Freelancer_Master.ToList();

            foreach (var item in aItemList)
            {
                FreelancerList.Add(new SelectListItem()
                {
                    Value = item.Name == null ? string.Empty : item.Name,
                    Text = item.Name == null ? string.Empty : item.Name
                });
            }

            return FreelancerList;
        }
    }
}
public class Book_ActivityList
{
    public string Activity { get; set; }
    public decimal Percentage { get; set; }

    public decimal Days { get; set; }

    public Nullable<DateTime> ScheduleDate { get; set; }
    public Nullable<DateTime> RevisedDate { get; set; }
    public Nullable<DateTime> CompletedDate { get; set; }
}


public class GlobalTaskList
{
    public int id { get; set; }
    public string title { get; set; }

    public Nullable<DateTime> start { get; set; }
    public Nullable<DateTime> end { get; set; }
    public string description { get; set; }
    public string url { get; set; }
    public string color { get; set; }
    public string Duration { get; set; }
}

public class LowercaseJsonSerializer
{
    private static readonly JsonSerializerSettings Settings = new JsonSerializerSettings
    {
        ContractResolver = new LowercaseContractResolver()
    };

    public static string SerializeObject(object o)
    {
        return JsonConvert.SerializeObject(o, Formatting.Indented, Settings);
    }

    public class LowercaseContractResolver : DefaultContractResolver
    {
        protected override string ResolvePropertyName(string propertyName)
        {
            return propertyName.ToLower();
        }
    }
}
