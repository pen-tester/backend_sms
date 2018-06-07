var express = require('express');
var router = express.Router();
var md5 = require('md5');
var CRC = require('crc');

var global_area = require('../../config/global');  

var Util = require('../../utils/utils');
//System Codes for request, respond, some types
var System_Code = require('../../config/system_code');
var Config  = require('../../config/config');


//User DB...
var UserModel = require('../../models/users');

//Sub route
var file_route = require('./file');
var smstemplate_route=require('./smstemplate');
var chat_route=require('./chat');
var uploadproperty_route=require('./uploadproperty');
var owner_route = require('./owner');
var zillow_route = require('./zillow_route');
var podio_route = require('./podio_route');
var try_route = require('./try');
//Middleware for this router
router.use(function timeLog (req,res, next){
   // console.log('Time: ', Date.now(), 'Requests: ', req);
    next();
});

//Middleware for this router
router.use(function origin_set (req,res, next){
    // console.log('Time: ', Date.now(), 'Requests: ', req);
    if (req.method === 'OPTIONS') {
        console.log('!OPTIONS');
        var headers = {};
        // IE8 does not allow domains to be specified, just the *
        // headers["Access-Control-Allow-Origin"] = req.headers.origin;
        headers["Access-Control-Allow-Origin"] = "*";
        headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
        headers["Access-Control-Allow-Credentials"] = false;
        headers["Access-Control-Max-Age"] = '86400'; // 24 hours
        headers["Access-Control-Allow-Headers"] = "X-Requested-With,Authorization, X-HTTP-Method-Override, Content-Type, Accept";
        res.writeHead(200, headers);
        res.end();
    } else {
        //...other requests
        res.set("Access-Control-Allow-Credentials", true);
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "POST, GET,OPTIONS");
        res.set("Access-Control-Allow-Headers","Content-Type, Authorization, X-Requested-With, Origin, OPTIONS");   
        res.set("Access-Control-Request-Headers","Content-Type, Authorization, X-Requested-With, Origin,OPTIONS");

        next();
    }
 });
 
 router.use(function authorization (req,res, next){
     // console.log('Time: ', Date.now(), 'Requests: ', req);

   var auth_token = req.headers["authorization"] || '';
        
    var result = Util.check_authentification(auth_token);
     if(result.status == System_Code.statuscode.success){
         var data = null;
         try{
             data = result.data;
             //check the user role.
             res.locals.userinfo = data;
             next();
         }catch(ex){
             Util.logger(ex);
             res.status(System_Code.http.unauthorized);
             res.json({status:System_Code.statuscode.fail, error:"Logged in, Something is wrong, role is not matched..."});

         }
 
     }
     else{
         res.status(System_Code.http.unauthorized);
         res.json({status:System_Code.statuscode.fail, error:"User not logged in"});
     }
 });

 router.use('/file', file_route);
 router.use('/smstemplate', smstemplate_route);
 router.use('/chat', chat_route);
 router.use('/uploadproperty', uploadproperty_route);
 router.use('/owner', owner_route);
 router.use('/zillow', zillow_route);
 router.use('/podio', podio_route);
 router.use('/try', try_route);

 router.all("/test", function(req,res){
    res.json({status:'error', error:'The checkout has to be post method'});
});

module.exports = router;