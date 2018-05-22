var express = require('express');
var router = express.Router();
var md5 = require('md5');
var twilio = require('twilio');

var global_area = require('../config/global');  

var Util = require('../utils/utils');
//System Codes for request, respond, some types
var System_Code = require('../config/system_code');
var Config  = require('../config/config');

var twilio_helper = require('../utils/twilio_helper');




//Sub route module
var user_route = require('./user/user');
var authuser_route = require('./authuser/user');
var adminuser_route = require('./adminuser/admin');
var service_route = require('./service/main');
var authservice_route = require('./authuserservice/user');

router.use('/authuser', authuser_route);
router.use('/admin', adminuser_route);
router.use('/user', user_route);
router.use('/service', service_route);
router.use('/authservice', authservice_route);
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


router.all("/product/feature", function(req,res){
    //Check if there are pending requests.

    //res.json({status:'error', error:'The checkout has to be post method', code:MessageCode.error});
});

router.all("/test", function(req,res){
    res.json({
        status:'test'
    })    

});


module.exports = router;