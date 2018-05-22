var express = require('express');
var router = express.Router();
var md5 = require('md5');
var CRC = require('crc');

var global_area = require('../../config/global');  

//For twilio service
var twilio = require('twilio');

var Util = require('../../utils/utils');
//System Codes for request, respond, some types
var System_Code = require('../../config/system_code');
var Config  = require('../../config/config');


//User DB...
var UserModel = require('../../models/users');

router.post('/available', function(req, res){
    // Find and then purchase a phone number
    var prefix = req.body.prefix || '';

    if(prefix == '') prefix = "813";

    const twilio_client = twilio(Config.twilio_config.accountSid, Config.twilio_config.authToken);
    twilio_client
    .availablePhoneNumbers('US')
    .local.list({
    areaCode: prefix,
    })
    .then(data => {
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:data});
    })
});

router.post('/purchase', function(req, res){
    // Find and then purchase a phone number
    var phone = req.body.phone || '';

    const twilio_client = twilio(Config.twilio_config.accountSid, Config.twilio_config.authToken);
    twilio_client.incomingPhoneNumbers.create({
        phoneNumber: phone
      })
    .then(purchasedNumber => {
        twilio_client.incomingPhoneNumbers(purchasedNumber.sid)
        .update({
            accountSid: Config.twilio_config.accountSid,
            smsUrl: Config.twilio_config.callback_baseurl+"v10/service/sms/receive",
            voiceUrl: Config.twilio_config.callback_baseurl+"v10/service/voice/receive"
          })
         .then(incoming_phone_number => {
            console.log(incoming_phone_number.friendlyName);
         });
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:purchasedNumber});
    },
    err=>{
        res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.purchase_error, error:err});
    })
});

router.post('/delete', function(req, res){
    // Find and then purchase a phone number
    var phone = req.body.phone || {sid:'',status:'' ,number:''};

    const twilio_client = twilio(Config.twilio_config.accountSid, Config.twilio_config.authToken);
    twilio_client.incomingPhoneNumbers(phone.sid).delete()
    .then(purchasedNumber => {
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:purchasedNumber});
    },
    err=>{
        res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.purchase_error, error:err});
    })
});

module.exports = router;