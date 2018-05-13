//Essential part
var express = require('express');
var router = express.Router();
var md5 = require('md5');
var twilio = require('twilio');


//Global
var global_area = require('../config/global');  

//Utils and helper
var Util = require('../utils/utils');
var twilio_helper = require('../utils/twilio_helper');

//System Codes for request, respond, some types
var System_Code = require('../config/system_code');
var Config  = require('../config/config');




//Category Db
var mongoose = require('mongoose');


//Middleware for this router
router.use(function timeLog (req,res, next){
   // console.log('Time: ', Date.now(), 'Requests: ', req);
    next();
});

//Middleware for this router
 router.use(function authorization (req,res, next){
    var session = req.session;
    if(session.authorization == true){
        res.locals.userdata = session.user_info;
    }else{
        res.locals.userdata = null;
    }     
     //res.locals.userdata = result.data;
     next();
 });


router.all("/", function(req,res){
    //Check if there are pending requests.
    //Getting the latest productions...
    res.render('layouts/main',
    {
       user:res.locals.userdata,
       pagename:"index", 
       products:products}
   );
    
 });


module.exports = router;