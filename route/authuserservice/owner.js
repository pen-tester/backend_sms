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
var Property_uploadModel = require('../../models/properties_uploaded');
var SmsModel = require('../../models/sms_templates');

/*
This is for the property owner....  property_owner model...
*/

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
 
 
 router.post("/update", function(req,res){
    var owner = req.body.owner;

    var userid = "-1";

    var userinfo = res.locals.userinfo;
    if(userinfo.role != System_Code.user.role.admin ){
        userid = userinfo.id;
    }

    var condition = {};
    if(userid != "-1"){
        condition = {'properties.sent_history.sent_userid':userid};
    }else{
        userid = userinfo.id;
        condition ={};
    }

    updateOwnerinfo(condition, owner).then((result)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:result});
    }).catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});
        return;    
    });

 });


 router.post("/info", function(req,res){
    var id = req.body.id || '';

    var userid = "-1";

    var userinfo = res.locals.userinfo;
    if(userinfo.role != System_Code.user.role.admin ){
        userid = userinfo.id;
    }

    var condition = {};
    if(userid != "-1"){
        condition = {'properties.sent_history.sent_userid':userid};
    }else{
        userid = userinfo.id;
        condition ={};
    }

    getOwnerinfo(condition, id).then((result)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:result});
    }).catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});
        return;    
    });

 });


 router.post("/delete", function(req,res){
    var id = req.body.id  || '';

    var userid = "-1";

    var userinfo = res.locals.userinfo;
    if(userinfo.role != System_Code.user.role.admin ){
        userid = userinfo.id;
    }

    var condition = {};
    if(userid != "-1"){
        condition = {'properties.sent_history.sent_userid':userid};
    }else{
        userid = userinfo.id;
        condition ={};
    }

    deleteOwnerinfo(condition, id).then((result)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:result});
    }).catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});
        return;    
    });

 });

 async function getOwnerinfo(condition, id){
     condition["id"]= id;
     console.log("get owner info",condition);
    var doc = await PropertyOwnerModel.findOne(condition,
        {properties:1, firstname:1, id:1, _id:0, lastname:1, email:1, contact:1, leadtype:1,newmessage:1,
            owner_city:1,
            owner_state:1,
            phone:1,
            status:1,
            rated:1,
            last_sms_received_date:1,
            newmessage:1,
            leadtype:1,
            called:1
        }
    ).exec();

    return doc;    
 }


 async function updateOwnerinfo(condition, owner){
    condition['id']=owner.id;
    console.log("update owner info",condition, owner);
    var doc = await PropertyOwnerModel.findOneAndUpdate(condition,{$set:owner}).exec();

    return doc;
 }

 async function deleteOwnerinfo(condition, id){
    condition['id']=id;
    console.log("update owner info",condition, id);
    var doc = await PropertyOwnerModel.findOneAndRemove(condition).exec();

    return doc;
 } 


 router.post("/property/update", function(req, res){

    var ownerid = req.body.id || '';
    var property = req.body.property;

    var userid = "-1";

    var userinfo = res.locals.userinfo;
    if(userinfo.role != System_Code.user.role.admin ){
        userid = userinfo.id;
    }

    var condition = {};
    if(userid != "-1"){
        condition = {'properties.sent_history.sent_userid':userid};
    }else{
        userid = userinfo.id;
        condition ={};
    }

    condition["id"] = ownerid;

    updateproperty(condition, property).then((result)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:result});
    }).catch((err)=>{
        console.log("updateproperty function", err);
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});
        return;    
    });
 });

 async function updateproperty(condition, property){
    condition["properties.id"] = property.id;
    await PropertyOwnerModel.update(condition, {'properties.$':property}).exec();
    return true;
 }

module.exports = router;