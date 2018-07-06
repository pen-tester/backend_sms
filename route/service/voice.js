var express = require('express');
var router = express.Router();
var md5 = require('md5');
var CRC = require('crc');

var global_area = require('../../config/global');  

var Util = require('../../utils/utils');
//System Codes for request, respond, some types
var System_Code = require('../../config/system_code');
var Config  = require('../../config/config');
var Additional_Config  = require('../../config/config_additional');


var twilio = require('twilio');
const ClientCapability = twilio.jwt.ClientCapability;
const VoiceResponse = twilio.twiml.VoiceResponse;


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
 
 router.post("/token", function(req,res){
     var clientName = req.body.clientName;
    const capability = new ClientCapability({
        accountSid: Additional_Config.twilio_voice_config.accountSid,
        authToken: Additional_Config.twilio_voice_config.authToken
      });
    
      capability.addScope(
        new ClientCapability.OutgoingClientScope({
          applicationSid: Additional_Config.twilio_voice_config.voicecall_appsid})
      );
      capability.addScope(
        new ClientCapability.IncomingClientScope(clientName));


      const token = capability.toJwt();
    
      // Include token in a JSON response
      res.json({status:System_Code.statuscode.success, data:{
        token: token,
      }});
 })
 
 router.post("/call", function(req,res){
    const voiceResponse = new VoiceResponse();
    voiceResponse.dial({
      callerId: Additional_Config.twilio_voice_config.fromNumber,
    }, req.body.number);
  
    res.type('text/xml');
    res.send(voiceResponse.toString());
})


 
router.post("/incoming", function(req,res){
    const voiceResponse = new VoiceResponse();
    const dial = voiceResponse.dial({
        callerId: req.body.From,
      });


    dial.client('andrew');


    res.type('text/xml');
    res.send(voiceResponse.toString());
})


 router.post("/receive", function(req,res){
     var from = req.body.From || '';
     var to = req.body.To || '';
     var accountsid = req.body.AccountSid || '';

     if(from && to && accountsid == ''){
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
                var voice = {
                    calling_type:System_Code.message.type.outgoing,
                    created:Date.now(),
                    userid:user.id,   // "" : incoming sms , userid: outgoing sms ,
                    phone:to
                };
                prop_owner.voice.push(voice);
                prop_owner.save(function(err){
                    console.log("voice stored ", voice);

                    //Get the active number...
                    var active_number = Util.getActiveNumber(user.phone.incoming);
                    const VoiceResponse = twilio.twiml.VoiceResponse;
                    const response = new VoiceResponse();
                    if(active_number !=""){
                        const dial = response.dial();
                        dial.number(active_number);
                        res.status(System_Code.http.req_ok);
                        res.set('Content-Type', 'text/xml');
                        res.send(response.toString());
                        res.end();
                    }else{
                        res.status(System_Code.http.req_ok);
                        res.set('Content-Type', 'text/xml');
                        res.send(response.toString());
                        res.end();                        
                    }


                });
            });
        });
     }
 });
 

 

module.exports = router;