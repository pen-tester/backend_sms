var express = require('express');
var router = express.Router();
var md5 = require('md5');
var twilio = require('twilio');

var global_area = require('../../config/global');  

var Util = require('../../utils/utils');
//System Codes for request, respond, some types
var System_Code = require('../../config/system_code');
var Config  = require('../../config/config');

var twilio_helper = require('../../utils/twilio_helper');




//Sub route module
var sms_route = require('./sms');
var voice_route = require('./voice');


router.use('/sms', sms_route);
router.use('/voice', voice_route);

module.exports = router;