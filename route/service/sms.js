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
var PropertyOwnerModel = require('../../models/property_owners');

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
 
  router.all("/test", function(req,res){
    console.log("start");
    /*var promise = new Promise(function(resolve,reject){
        UserModel.find({}).exec().then((docs)=>{
             resolve(docs);
         }).catch((err)=>{
             reject(err);
         });
        
    })
    
    promise.then((docs)=>{
        console.log("get data");
        res.json(docs);
    });*/

    var users = gettest(res);

    // res.json(users);

    console.log("end");
 });
  

 async function gettest(res){
     users =await UserModel.find({}).exec();
     console.log("got data");
      res.json(users);
     return users;
 }
 
 router.post("/receive", function(req,res){
     var from = req.body.From || '';
     var to = req.body.To || '';
     var body = req.body.Body || '';
     var accountsid = req.body.AccountSid || '';

     if(from && to && body && accountsid == ''){
        res.json(
            {
                status:System_Code.statuscode.fail, 
                code:System_Code.responsecode.param_error
            }
        );
        return; 
     }
     else{
        //stroing the sms to the db... the from number is the one of the property owner...
        PropertyOwnerModel.findOne({phone:from}, function(err, prop_owner){
            if(err || prop_owner == null){
                res.json(
                    {
                        status:System_Code.statuscode.fail, 
                        code:System_Code.responsecode.propertyowner_model_error
                    }
                );
                               
                return;
            }

            //Get the user info for this received phone number...  to is the twilio number that receives the sms.
            //This number is same as outgoing number...

            UserModel.findOne({'phone.outgoing.phone': to}, function(err, user){
                if(err || user == null){
                    res.json(
                        {
                            status:System_Code.statuscode.fail, 
                            code:System_Code.responsecode.propertyowner_model_error,
                            error:'Error when getting the user info related to this property owner...'
                        }
                    );                                   
                    return;                    
                }
                console.log("out user", user);
                var chat = {
                    replied_chat:System_Code.message.type.outgoing,
                    content:body,
                    created:Date.now(),
                    userid:user.id,   // "" : incoming sms , userid: outgoing sms ,
                    phone:to
                };
                prop_owner.chat.unshift(chat);
                prop_owner.last_sms_received_date = Date.now();

                prop_owner.newmessage = 1;

                //Emit new message arrived...
                global_area.notification_io.to('channel'+prop_owner.id).emit("newmessage", {
                    chat:chat,
                    firstname:prop_owner.firstname,
                    lastname:prop_owner.lastname
                });

                global_area.notification_io.emit("newchat",{});

                prop_owner.save(function(err){
                    console.log("chat stored ", chat);
                    res.json(
                        {
                            status:System_Code.statuscode.success, 
                            code:System_Code.responsecode.ok,
                            data:chat
                        }
                    );                         
                });
                

                //Sending the sms to the incoming phone....
                sendsmsto_incoming(from, to, body, user);
            });
        });
     }
 });
 
 function sendsmsto_incoming(from, to , body, user){
     try{
        var active_incoming = getactivephone(user.phone.incoming);
        var active_outcoming = getactivephone(user.phone.outgoing);
        const twilio_helper = require('../../utils/twilio_helper');
        if(active_incoming !="") twilio_helper.send_sms(active_outcoming, active_incoming,
           "from:"+ from +" to: "+ to + " body: " + body
        );
     }catch(ex){
        console.log(ex);
     }

    //Sending the sms to the master....
    //twilio_helper.send_sms(active_outcoming, active_incoming,      "from:"+ from +" to: "+ to + " body: " + body)    
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

module.exports = router;