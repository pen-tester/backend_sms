var express = require('express');
var router = express.Router();
var md5 = require('md5');
var CRC = require('crc');
var path= require('path');

var global_area = require('../../config/global');  

var Util = require('../../utils/utils');
//System Codes for request, respond, some types
var System_Code = require('../../config/system_code');
var Config  = require('../../config/config');


//User DB...
var UserModel = require('../../models/users');
var PropertyOwnerModel = require('../../models/property_owners');
var Property_uploadModel = require('../../models/properties_uploaded')
var PropertyArchiveModel = require('../../models/properties_archive');

//Middleware for this router
router.use(function timeLog (req,res, next){
    // console.log('Time: ', Date.now(), 'Requests: ', req);
     next();
 });
 
 //Middleware for this router
 router.use(function origin_set (req,res, next){
     // console.log('Time: ', Date.now(), 'Requests: ', req);
     res.set("Access-Control-Allow-Credentials", true);
     res.set("Access-Control-Allow-Origin", "*");
     res.set("Access-Control-Allow-Methods", "POST, GET");
     res.set("Access-Control-Allow-Headers","Content-Type, Authorization, X-Requested-With, Origin");   
      next();
  });
 
 
  router.use(function authorization (req,res, next){
      // console.log('Time: ', Date.now(), 'Requests: ', req);
      next();
  });
 
 
 router.post("/list/:page/:count*?", function(req,res){
    var page = parseInt(req.params.page);
    var count = parseInt(req.params.count || '20');
    var userid = req.body.id || '';

    var userinfo = res.locals.userinfo;
    if(userinfo.role != System_Code.user.role.admin ){
        userid = userinfo.id;
    }

    var condition = {};
    if(userid != "-1"){
        condition = {upload_userid:userid};
    }else{
        condition ={};
    }

    PropertyArchiveModel.find(condition).skip(page*count).limit(count).exec(function(err, docs){
        if(err){
            res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});
            return;
        }
         res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:docs});
    });
 });
 
 router.post("/count", function(req,res){
    var userid = req.body.id || '';
    var userinfo = res.locals.userinfo;
    if(userinfo.role != System_Code.user.role.admin ){
        userid = userinfo.id;
    }

    var condition = {};
    if(userid != "-1"){
        condition = {upload_userid:userid};
    }else{
        condition ={};
    }

    PropertyArchiveModel.count(condition,function(err, count){
        if(err){
            res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});
            return;
        }
         res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:count});
    });

 }); 

 

module.exports = router;