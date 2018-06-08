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
    var page = parseInt(req.params.page || '0');
    var count = parseInt(req.params.count || '10');
    var userid = req.body.userid || '';
    var keyword = req.body.keyword || '';
    var leadtype = req.body.leadtype || '';
    var star = req.body.star;
    var grades = req.body.grades;
    if(!grades) grades =[];

    var userinfo = res.locals.userinfo;
    if(userinfo.role != System_Code.user.role.admin ){
        userid = userinfo.id;
    }

    var condition = {};
    var chat_condition = {};
    if(userid != "-1"){
        condition = {
            'properties.sent_history.sent_userid':userid
        };
        chat_condition =
            {'$$item.userid':userid};

    }else{
        userid = userinfo.id;
        condition ={

        };
        chat_condition ={


            
        };
    }


    if(leadtype!='-1'){
        condition.leadtype = leadtype;
    }
    if(star !=-1 && star != null){
        condition.rated= star;
    }




    console.log(page, count, condition, chat_condition, grades);
    PropertyOwnerModel.aggregate(
        [{$match:condition},   { $sort : { last_sms_received_date : -1} },
            {$skip: page*count},
            {$limit:count}
        , {$project:{included:{$in:['$status', grades]},chat:{$filter:{input:'$chat', as:'item', cond:{$and:[{$eq:['$$item.replied_chat',0]}, {$or:[{$eq:['$$item.userid',userid]}, {$eq:[userinfo.role, System_Code.user.role.admin]}]} ]}}}, phone:1, firstname:1, lastname:1, id:1, leadtype:1, status:1,last_sms_received_date:1, rated:1, newmessage:1, _id:0}}, 
        {$project:{chat:{$slice:['$chat',3]}, sent_userid:{$concat:[userid]}, phone:1, firstname:1, lastname:1,id:1, leadtype:1, status:1,last_sms_received_date:1, rated:1, newmessage:1, nonempty:{$gte:[{$size:'$chat'},1]},included:1}},{$match:{nonempty:true, included:true}},
        {$lookup:     {
            from: 'users',
            localField: 'sent_userid',
            foreignField: 'id',
            as: 'user'
          }},
            {$project: {
                "userinfo": { $arrayElemAt: [ "$user", 0 ] } ,chat:1, phone:1, firstname:1, lastname:1,id:1, leadtype:1, status:1,last_sms_received_date:1
                , rated:1, newmessage:1
                }
            } //for sent user info
            ,{$project: {
                'userinfo.id':1,'userinfo.firstname':1,'userinfo.lastname':1,chat:1 , phone:1, firstname:1, lastname:1,id:1, leadtype:1, status:1,last_sms_received_date:1
                , rated:1, newmessage:1
                }
            },
            {$match:{$or:[{'firstname':{$regex:'.*'+keyword+'.*', $options:'i'}},{'lastname':{$regex:'.*'+keyword+'.*', $options:'i'}},{'phone':{$regex:'.*'+keyword+'.*'}},{'chat.content':{$regex:'.*'+keyword+'.*', $options:'i'}}]}}
        ]       
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

 router.post("/count", function(req,res){

    var userid = req.body.userid || '';
    var keyword = req.body.keyword || '';
    var leadtype = req.body.leadtype || '';
    var star = req.body.star;
    var grades = req.body.grades;
    if(!grades) grades =[];

    var userinfo = res.locals.userinfo;
    if(userinfo.role != System_Code.user.role.admin ){
        userid = userinfo.id;
    }

    var condition = {};
    var chat_condition = {};
    if(userid != "-1"){
        condition = {
            'properties.sent_history.sent_userid':userid
        };
        chat_condition =
            {'$$item.userid':userid};

    }else{
        userid = userinfo.id;
        condition ={

        };
        chat_condition ={


            
        };
    }


    if(leadtype!='-1'){
        condition.leadtype = leadtype;
    }
    if(star !=-1 && star != null){
        condition.rated= star;
    }



    PropertyOwnerModel.aggregate(
        [{$match:condition}  ,
        {$project:{included:{$in:['$status', grades]},chat:{$filter:{input:'$chat', as:'item', cond:{$and:[{$eq:['$$item.replied_chat',0]}, {$or:[{$eq:['$$item.userid',userid]}, {$eq:[userinfo.role, System_Code.user.role.admin]}]} ]}}}, phone:1, firstname:1, lastname:1, id:1, leadtype:1, status:1,last_sms_received_date:1, rated:1, newmessage:1, _id:0}}, 
        {$project:{chat:{$slice:['$chat',3]}, sent_userid:{$concat:[userid]}, phone:1, firstname:1, lastname:1,id:1, leadtype:1, status:1,last_sms_received_date:1, rated:1, newmessage:1, nonempty:{$gte:[{$size:'$chat'},1]},included:1}},{$match:{nonempty:true, included:true}},
        {$count:'total'}
        ]       
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

 router.post("/sendsms", function(req,res){
    var content = req.body.content || '';
    var ownerid = req.body.id || '';

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
    updateOwnerinfochat(ownerid, chat).then((result)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:result});
    })
    .catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});    
    });

 }); 

 router.all("/leadtype/list", function(req,res){

    var userinfo = res.locals.userinfo;
    var userid = userinfo.id;

    //console.log(docs);
    getLeadTypes().then((result)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:result});
    })
    .catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});    
    });

 }); 

 async function getLeadTypes(){
    var docs = LeadtypeModel.find({},{value:1, text:1}).exec();
    return docs;
 }

 async function updateOwnerinfochat(ownerid, chat){
    var owner = await PropertyOwnerModel.findOne({id:ownerid}).exec();
    if(owner == null){
        throw new Error("no owner");
        return;
    } 
    
    sendSms(chat.content, chat.userid, owner.phone);

    owner.chat.unshift(chat);
    owner.save(function(err){
        // console.log(err, user, tmp_prp);
    });
    return true;
 }


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
            tmp_prp.date_added_user = Date.now();
            
            var timestampe = Date.now();
            var prop_id = "p" + Math.floor((1 + Math.random())* 1000).toString(10).substring(1) + timestampe;

            tmp_prp.id = prop_id;
            //tmp_prp.sent_history

           // console.log(prp_up, tmp_prp);

            //Sending sms.... to this phone...
            var smscontent = sms.content.replace("{name}", tmp_prp.firstname + " "+tmp_prp.lastname);
            smscontent = smscontent.replace("{addr}", tmp_prp.address);
            smscontent = smscontent.replace("{city}", tmp_prp.city);
            smscontent = smscontent.replace("{state}", tmp_prp.state);
            smscontent = smscontent.replace(new RegExp("<br>", 'g'), "\r\n");
           
            try{
                LeadtypeModel.findOneAndUpdate({value:tmp_prp.leadtype},{value:tmp_prp.leadtype, text:tmp_prp.leadtype},{upsert:true}).exec();
            }catch(ex){
                console.log("add lead type error ", ex);
            }


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
        try{
            delete prp_up._id;
            delete prp_up.__v;
        }
        catch(ex){
            console.log("upload property _id remove", ex);
        }
        PropertyArchiveModel.findOneAndUpdate({
            id:prp_up.id
        },{$set:prp_up} ,{upsert:true}, function(err,docs){
            console.log("archive", err);
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
    var user = await PropertyOwnerModel.findOne({phone:new_phone}).exec();
    
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
                newowner.rated = 0;
            }
            catch(ex){

            }

            newowner.chat.unshift(chat);

            await newowner.save();
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
               // console.log("existed property index", p_index, user.properties[p_index].sent_history);
                user.properties[p_index].sent_history.push(sent_history);
               // console.log("after added existed property index", p_index, user.properties[p_index].sent_history);
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

            user.chat.unshift(chat);
            //console.log("before saving",user.properties[p_index].sent_history);
            //await user.save();
            await PropertyOwnerModel.update({phone:user.phone}, user).exec();
        }


 }

 router.all("/owner/:ownerid/:page/:count*?", function(req,res){
    var page = parseInt(req.params.page || '0');
    var count = parseInt(req.params.count || '20');
    var ownerid = req.params.ownerid;


    var userid = "-1";

    var userinfo = res.locals.userinfo;
    if(userinfo.role != System_Code.user.role.admin ){
        userid = userinfo.id;
    }

    var condition = {};
    if(userid != "-1"){
        condition = {'chat.userid':userid};
    }else{
        userid = userinfo.id;
        condition ={};
    }

    getOwnerChat(ownerid, page, count, condition ).then((docs)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:docs});
    })
    .catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});    
    });

 });


 async function getOwnerChat(ownerid, page, count, condition ){
   // console.log("start", ownerid, page, count, condition);
   PropertyOwnerModel.findOneAndUpdate({id:ownerid}, {$set:{newmessage:0}},function(err, doc){});

   var docs = await PropertyOwnerModel.aggregate(
        [{$match:{id:ownerid}},
         {$project:{_id:0 ,chat:1, firstname:1, lastname:1, contact:1, leadtype:1, status:1, owner_city:1, owner_state:1, email:1}},
         {$unwind:'$chat'},
         {$match:condition},
         { $skip: page*count },
        { $limit: count }
        ]       
    ).exec();
   // console.log(docs);
    return docs;
 }


module.exports = router;