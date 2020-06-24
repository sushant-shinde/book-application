using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Web;

namespace WMS.Models
{
    public class MailModels
    {
        static WMSEntities aDBManager = new WMSEntities();

        public static string send(MailMessage MailData)
        {
            try
            {
                MailData.IsBodyHtml = true;
                MailData.Priority = MailPriority.Normal;
                SmtpClient mail = new SmtpClient();
                var smtp = SmtpData();
                mail.Host = smtp.HostID.ToString();
                mail.Port = int.Parse(smtp.PortNo.ToString());
                mail.Credentials = new System.Net.NetworkCredential(smtp.UserName.ToString(), smtp.Password.ToString());
                mail.EnableSsl = true;

                try
                {
                    mail.Send(MailData);
                }
                catch
                {
                    try
                    {
                        mail.Send(MailData);
                    }
                    catch (Exception e)
                    {
                        return e.Message.ToString();
                    }
                }

                return "1";
            }
            catch (Exception ex)
            {
                return "Exception[MailModels|send] : " + ex.Message;
            }
        }

        public static string Mail(string To, string Cc, string Bcc, string Subject,
                                  string Body, string attachFile = "",
                                  string From = "sesame@novatechset.com",
                                  string DisplayName = "SESAME")
        {
            try
            {
                string s = "0";
                MailMessage m = new MailMessage();
                m.From = new MailAddress(From, DisplayName);
                SetMailIds(m.To, To);
                SetMailIds(m.CC, Cc);
                SetMailIds(m.Bcc, "rharihararajan@novatechset.com;sharmila@novatechset.com;ramakrishnan@novatechset.com" + Bcc);
                m.Subject = Subject;
                m.Body = Body;
                if (File.Exists(attachFile))
                {
                    m.Attachments.Add(new Attachment(attachFile));
                }
                s = send(m);
                return s;
            }
            catch (Exception e) { return e.Message; }
        }

        public static MailAddressCollection SetMailIds(MailAddressCollection m, string MailIds)
        {
            try
            {
                var mail = "";
                if (MailIds != null)
                {
                    string[] MailIdsArray = MailIds.Split(new[] { ";", ",", "|" }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (string MailId in MailIdsArray)
                    {
                        mail = "";
                        if (IsValidEmail(MailId))
                        {
                            mail = MailId.Trim();
                            m.Add(new MailAddress(mail));//adding multiple TO Email Id
                        }
                    }
                }
                return m;
            }
            catch (Exception)
            {
                return m;
            }
        }

        public static bool IsValidEmail(string email)
        {
            try
            {
                if (email.Trim() != "" && email != null)
                {
                    var addr = new System.Net.Mail.MailAddress(email);
                    return addr.Address == email;
                }
                else
                {
                    return false;
                }
            }
            catch
            {
                return false;
            }
        }

        private static Tbl_ftpDetails SmtpData()
        {
            return aDBManager.Tbl_ftpDetails.FirstOrDefault();
        }
    }
}