using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WMS.AuthJWT;

namespace WMS.Controllers
{
    //[Authorize]
    public class ValuesController : ApiController
    {

        [JwtAuthentication]
        [HttpGet]
        public IHttpActionResult Get()
        {
            return Ok("test");
        }

    }
}
