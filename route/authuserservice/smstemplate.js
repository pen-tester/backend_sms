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
var SmsModel = require('../../models/sms_templates');

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
     
     /*
      // checking the permssion
       try{
        if(res.locals.user.role == System_Code.user.role.admin ||
           res.locals.user.permissions.smsedit == System_Code.user.permission.active)
           next();
           return;
       }catch(ex){

       }
       res.status(400).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.role_error}); 
      */
      next();
  });
 
 
 router.post("/add", function(req,res){
    var sms = req.body.sms;
    if(sms!=null){
        try{
            var smsmodel = new SmsModel(sms);
            var timestampe = Date.now();
            var id = "s" + Math.floor((1 + Math.random())* 1000).toString(10).substring(1) + timestampe;
            smsmodel.id = id;          
            smsmodel.save(function(err){
                if(err){
                    res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error});                    
                    return;
                }
                 res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:smsmodel});
            });
        }catch(ex){
            res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error});
            console.log(ex);
        }
        
    }
    else{
        res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.param_error});
    }
    return; 
 });
 
 router.post("/update", function(req,res){
    var sms = req.body.sms;
    if(sms!=null){
        try{
            SmsModel.findOneAndUpdate({id:sms.id},{$set:sms}, function(err, doc){
                if(err){
                    res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error});
                    return;
                }
                res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:sms});
            })
        }catch(ex){
            res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error});
            console.log(ex);
        }
        
    }
    else{
        res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.param_error});
    }
    return; 
 });
 
 router.all("/list/:page/:count*?", function(req,res){
    var page = parseInt(req.params["page"]);
    var count = parseInt( req.params["count"] || '300' );

    SmsModel.find({},{id:1, tag:1, content:1}).skip(page*count).limit(count).exec(function(err, sms_list){
        if(err){
            Util.logger("user list find error smstemplate/user/list");
            Util.logger(err);
            res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error});
            return;
        }

         res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:sms_list});
        
    });
 });


 

module.exports = router;