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
    var page = parseInt(req.params.page || '0');
    var count = parseInt(req.params.count || '10');
    var userid = req.body.userid || '';

    var userinfo = res.locals.userinfo;
    if(userinfo.role != System_Code.user.role.admin ){
        userid = userinfo.id;
    }

    var condition = {};
    var chat_condition = {};
    if(userid != "-1"){
        condition = {'properties.sent_history.sent_userid':userid};
        chat_condition = {$eq:['$$item.userid', userid]}
    }else{
        userid = userinfo.id;
        condition ={};
        chat_condition ={};
    }

    PropertyOwnerModel.aggregate(
        [{$match:condition}, {$project:{chat:{$filter:{input:'$chat', as:'item', cond:{$and:[{$eq:['$$item.replied_chat',0]}, chat_condition]}}}, phone:1, firstname:1, lastname:1, id:1, leadtype:1, status:1, _id:0}}, {$project:{chat:{$slice:['$chat',-3]}, phone:1, firstname:1, lastname:1,id:1, leadtype:1, status:1, nonempty:{$gte:[{$size:'$chat'},1]}}},{$match:{nonempty:true}}]       
        ,function(err, docs){
            if(err){
                console.log(err);
                res.status(System_Code.http.bad_req)
                .json(
                    {
                        status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error,
                        error:err
                    }
                );
                return;
            }
            res.json({
                status:System_Code.statuscode.success,
                code:System_Code.responsecode.ok,
                data:docs
            });
        }
    )
  
 });


 router.post("/send", function(req,res){
    var count = parseInt(req.body.count || '10');
    var userid = req.body.userid || '';
    var smsid = req.body.smsid || '';

    var userinfo = res.locals.userinfo;
    if(userinfo.role != System_Code.user.role.admin ){
        userid = userinfo.id;
    }

    var condition = {};
    if(userid != "-1"){
        condition = {upload_userid:userid, 'sent_history.templateid':{$ne:smsid}};
    }else{
        userid = userinfo.id;
        condition ={'sent_history.templateid':{$ne:smsid}};
    }

    SmsModel.findOne({id:smsid}, function(err, sms){
        if(err || sms == null){
            res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error});
            return;            
        }

        //count == -1 all....
        if(count == -1){
            Property_uploadModel.find(condition ,function(err, docs){
                if(err){
                    res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});
                    return;
                }

                var sent_history={
                    smstag:sms.tag,
                    templateid:sms.id,
                    sent_date:Date.now(),
                    sent_userid:userid,
                    success_phone:[]
                }

                //console.log("sent_history" , sent_history, sms);
                //console.log(docs);
                sendProperty(docs, sms, sent_history, userid).then((result)=>{
                    res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:docs});
                })
                .catch((err)=>{
                    res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});    
                });
                
                
            }); 
        }
        else{
            Property_uploadModel.find(condition).count(count).exec(function(err, docs){
                if(err){
                    res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});
                    return;
                }

                var sent_history={
                    smstag:sms.tag,
                    templateid:sms.id,
                    sent_date:Date.now(),
                    sent_userid:userid,
                    success_phone:[]
                }

                //console.log("sent_history" , sent_history, sms);
                //console.log(docs);
                sendProperty(docs, sms, sent_history, userid).then((result)=>{
                    res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:docs});
                })
                .catch((err)=>{
                    res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});    
                });
            });    
        }
    })


 
 }); 

 async function sendProperty(docs, sms, sent_history ,userid){
    var len = docs.length;
    console.log(docs);
    for(var i=0 ;i<len; i++){

        var prp_up = docs[i];
        var len_phone = prp_up.property.phone.length;
        //console.log(len_phone);
        //console.log("phone", prp_up.property.phone);
        for(var i_phone=0; i_phone<len_phone ;i_phone++){
            var new_phone = prp_up.property.phone[i_phone];
            if(new_phone == "" || new_phone == null ) continue;
            //console.log("phone",new_phone);
            var tmp_prp = JSON.parse(JSON.stringify(prp_up.property));
            delete tmp_prp.phone;

            tmp_prp.upload_userid = prp_up.upload_userid;
            tmp_prp.refid = prp_up.id;
            //tmp_prp.sent_history

           // console.log(prp_up, tmp_prp);

            //Sending sms.... to this phone...
            var smscontent = sms.content.replace("{name}", tmp_prp.firstname + " "+tmp_prp.lastname);
            smscontent = smscontent.replace("{addr}", tmp_prp.address);
            smscontent = smscontent.replace("{city}", tmp_prp.city);
            smscontent = smscontent.replace("{state}", tmp_prp.state);

            //Get the full user info... with userid...
            sendSms(smscontent, userid, new_phone);

           // console.log("sms content", smscontent);
            var chat = {
                replied_chat:System_Code.message.type.incoming,
                content:smscontent,
                created:Date.now(),
                userid:userid,   // "" : incoming sms , userid: outgoing sms ,
                phone:"" 
            }
            console.log("phone",new_phone);

            await updateOwnerinfo(new_phone, tmp_prp, chat, sent_history);
        }

        prp_up.sent_history.push(sent_history);
        prp_up.save(function(err){
           // console.log(err);
        });
    }
    return true;
 }

 async function sendSms(smscontent ,userid, to){
    const twilio_helper = require('../../utils/twilio_helper');

    try{
        var user = await UserModel.findOne({id:userid}).exec();
       // console.log(user);
        var active_phone = getactivephone(user.phone.outgoing);
        console.log("active_phone", active_phone);
        console.log("sending...", active_phone, to, smscontent);
        if(active_phone == "") return ;
        twilio_helper.send_sms(active_phone, to, smscontent);
    }
    catch(ex){
        console.log("send sms error:", ex);
    }
 }

 function getactivephone(phones){
     try{
        var len = phones.length;
        for(var i=0; i<len ;i++){
          var phone = phones[i];
          if(phone.status == System_Code.user.phone.active){
            return phone.phone;
          }
        }
        return "";
     }catch(ex){
        return "";
     }

 }

 async function updateOwnerinfo(new_phone, tmp_prp, chat, sent_history){
     console.log("owner phone", new_phone);
    PropertyOwnerModel.findOne({phone:new_phone}, function(err, user){
        if(err){

            return;
        }
        console.log( "search", new_phone);         
        if(user == null){

            tmp_prp.sent_history =[];
            tmp_prp.sent_history.push(sent_history);

            var newowner = new PropertyOwnerModel();
            newowner.phone = new_phone;
            var timestampe = Date.now();
            var ownerid = "o" + Math.floor((1 + Math.random())* 1000).toString(10).substring(1) + timestampe;                                
            newowner.id = ownerid;
            newowner.properties.push(tmp_prp);
            try{
                newowner.firstname = tmp_prp.firstname;
                newowner.lastname = tmp_prp.lastname;
                newowner.owner_state = tmp_prp.owner_state;
                newowner.owner_city = tmp_prp.owner_city;
                newowner.leadtype = tmp_prp.leadtype;
                newowner.status = "Low";
            }
            catch(ex){

            }

            newowner.chat.push(chat);

            newowner.save(function(err){
                //console.log(err, user, tmp_prp);
            });
        }else{
            var prp_len = user.properties.length;
            var p_index =0;
            for( p_index= 0; p_index < prp_len ;p_index++){
                var chk_prp = user.properties[p_index];
                if(chk_prp.refid == tmp_prp.refid) break;
            }
            if(p_index == prp_len){
                tmp_prp.sent_history =[];
                tmp_prp.sent_history.push(sent_history);                                    
                user.properties.push(tmp_prp);
            }else{
                user.properties[p_index].sent_history.push(sent_history);
            }

            try{
                user.firstname = tmp_prp.firstname;
                user.lastname = tmp_prp.lastname;
                user.owner_state = tmp_prp.owner_state;
                user.owner_city = tmp_prp.owner_city;
                user.leadtype = tmp_prp.leadtype;
            }
            catch(ex){

            }

            user.chat.push(chat);
            user.save(function(err){
               // console.log(err, user, tmp_prp);
            })

        }
    })

 }

module.exports = router;