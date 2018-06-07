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
var LeadtypeModel = require('../../models/leadtype');
var ContactModel = require('../../models/contact');
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
 
 router.all("/contact/list/:page/:count*?", function(req,res){
    var page = parseInt(req.params.page || '0');
    var count = parseInt(req.params.count || '10');

    getContactList(page,count).then((resp)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:resp});    
    }).catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});    
    });
 });

 async function getContactList(page, count){
     var result =await ContactModel.find({}).sort({date_added: -1}).skip(page*count).limit(count).exec();
     return result;
 }


 
 router.all("/contact/count", function(req,res){
    getContactCount().then((resp)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:resp});    
    }).catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});    
    });
 });

 async function getContactCount(){
     var result =await ContactModel.count({}).exec();
     return result;
 }

 router.post("/sendsms", function(req,res){

    var sms=req.body.sms;

    var userinfo = res.locals.userinfo;
    var userid = userinfo.id;
    var chat = {
        replied_chat:System_Code.message.type.incoming,
        content:sms.content,
        created:Date.now(),
        userid:userid,   // "" : incoming sms , userid: outgoing sms ,
        phone:"" 
    }

    //console.log(docs);
    updateContactinfochat(sms.phone, chat).then((result)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:result});
    })
    .catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});    
    });

 }); 

 async function updateContactinfochat(phone, chat){
    sendSms(chat.content, phone);
    var owner = await ContactModel.findOne({phone:phone}).exec();
    if(owner == null){
        //throw new Error("no owner");
        return;
    } 
    
    //sendSms(chat.content, owner.phone);

    owner.chat.unshift(chat);
    owner.save(function(err){
        // console.log(err, user, tmp_prp);
    });
    return true;
 }


 router.post("/sendbulk", function(req,res){
    var ids = req.body.ids || [];
    var content = req.body.content;

    var userinfo = res.locals.userinfo;

    var userid = userinfo.id;
    var chat = {
        replied_chat:System_Code.message.type.incoming,
        content:content,
        created:Date.now(),
        userid:userid,   // "" : incoming sms , userid: outgoing sms ,
        phone:"" 
    }    
    //console.log(docs);
    SendBulk(ids, chat).then((result)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:result});
    })
    .catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});    
    });

 }); 


 async function SendBulk(ids,chat){
    var docs = await ContactModel.find({
        id:{$in:ids}
    }).exec();

    var len = docs.length;
    console.log(docs);
    for(var i=0 ;i<len; i++){
        var user = docs[i];
        updateContactinfochat(user.phone, chat);
    }
    return true;
 }

 async function sendSms(smscontent, to){
    const twilio_helper = require('../../utils/twilio_helper');

    try{
       // console.log(user);
        var active_phone = Config.twilio_config.tryNumber;
        console.log("sending...", active_phone, to, smscontent);
        if(active_phone == "") return ;
        twilio_helper.send_sms(active_phone, to, smscontent);
    }
    catch(ex){
        console.log("send sms error:", ex);
    }
 }

 router.post("/delete", function(req,res){
    var id = req.body.id  || '';

    deleteContact( id).then((result)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:result});
    }).catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});
        return;    
    });

 });

 async function deleteContact(id){
    var doc = await ContactModel.findOneAndRemove({id:id}).exec();
    return doc;
 } 


module.exports = router;