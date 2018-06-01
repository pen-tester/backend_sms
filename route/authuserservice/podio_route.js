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
 
 
 router.post("/add", function(req,res){

    var Podio = require('podio-js').api;

    var podio = new Podio({
    authType: Config.podio_config.authType,
    clientId:  Config.podio_config.clientId,
    clientSecret:  Config.podio_config.clientSecret
    });

    //Get the pramas from client.

    var ownerid = req.body.id;
    var property = req.body.property;

    var allkeys=[
        {name:"bedrooms", key:"zillow_bedrooms", type:"int"},
        {name:"bathrooms", key:"zillow_bathrooms", type:"optional_int1"},
        {name:"zestimate-2", key:"zillow_amount", type:"currency"},
        {name:"ac-notes", key:"zillow_coolingSystem", type:"string"},
        {name:"roof", key:"zillow_roof", type:"string"},
        {name:"type-of-property-3", key:"zillow_useCode", type:"string"},
        {name:"garage-2", key:"zillow_parkingType", type:"string"},
        {name:"pool-notes", key:"zillow_pool", type:"string"},
        {name:"last-sold-date", key:"zillow_lastSoldDate", type:"string"},
        {name:"repairs", key:"zillow_repairs", type:"string"},
        {name:"size-of-the-house-sf", key:"zillow_finishedSqFt", type:"int"},
        {name:"year-built", key:"zillow_yearBuilt", type:"int"},
        {name:"lot-size", key:"zillow_lotSizeSqFt", type:"int"},
        {name:"asking-price", key:"zillow_askprice", type:"currency"},
        {name:"last-sold-amount", key:"zillow_lastSoldPrice", type:"currency"},
        {name:"tax-assesment-value", key:"zillow_taxAssessment", type:"currency"},
        {name:"zestimate-2", key:"zillow_amount", type:"currency"},
        {name:"rent", key:"zillow_rent", type:"currency"},
        {name:"our-offer", key:"zillow_offer", type:"currency"},
        {name:"mortgage-amount-2", key:"zillow_owes", type:"currency"},
        {name:"vacant2", key:"zillow_occupancy", type:"optional_int2"},
        {name:"notes-2", key:"zillow_othernote", type:"string"},
    ];

    var requestData={};

    var len = allkeys.length;
    for(var i= 0;i<len; i++){
        var ckey = allkeys[i];
        if(ckey.type == 'string'){
            requestData[ckey.name] = property[ckey.key] || ' ';
        }else if(ckey.type == 'int'){
            requestData[ckey.name] = parseInt( property[ckey.key] || '0');
            if(requestData[ckey.name]==0 )  delete requestData[ckey.name];
        }else if(ckey.type == 'currency'){
            try{
                var tmp =parseInt( property[ckey.key] || '0');
                if(isNaN(tmp)) tmp =0;
                requestData[ckey.name] = {currency:"USD", value:tmp};  
            }
            catch(ex){

            }
        }else if(ckey.type == 'optional_int1'){
            requestData[ckey.name] = parseInt( property[ckey.key] || '0') * 2;
            requestData[ckey.name] = (requestData[ckey.name]>0)?(requestData["bathrooms"]-1):0;
            if(requestData[ckey.name]==0 )  delete requestData[ckey.name];
        }else if(ckey.type == 'optional_int2'){
            requestData[ckey.name] = parseInt( property[ckey.key] || '0') +1 ;
        }
    }

    //console.log(requestData);

    podio.authenticateWithApp(Config.podio_config.podioapp.id, Config.podio_config.podioapp.token, (err) => {
        if (err){
            res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});    
            return;
        } 
      
        podio.isAuthenticated().then(() => {
          // Ready to make API calls in here...
          console.log("podio authentificated..");
        
            var podio_data = {
                fields:requestData
            }
        
            console.log(podio_data);

            Util.callpodiourl('/item/app/'+Config.podio_config.podioapp.id+'/',
            'POST', podio_data, podio.authObject.accessToken)
            .then((data)=>{
                res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:data}); 
                console.log(err)
            })
            .catch(err=>{
                res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err}); 
                console.log(err)
            });

        


        }).catch(err => {
            res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err}); 
            console.log(err)
        });
     
      });

 });


 router.post("/seller/add", function(req,res){

    var Podio = require('podio-js').api;

    var podio = new Podio({
    authType: Config.podio_config.authType,
    clientId:  Config.podio_config.clientId,
    clientSecret:  Config.podio_config.clientSecret
    });

    //Get the pramas from client.

    var requestData = req.body.data;

    var allkeys=[
        {name:"seller-name", key:"zillow_bedrooms", type:"int"},
        {name:"email", key:"zillow_bathrooms", type:"optional_int1"},
        {name:"seller-phone-cell", key:"zillow_amount", type:"currency"},
        {name:"property", key:"zillow_coolingSystem", type:"string"},
    ];

    if(!requestData.email){
        requestData.email = ' ';
    }

    //console.log(requestData);

    podio.authenticateWithApp(Config.podio_config.realtorapp.id, Config.podio_config.realtorapp.token, (err) => {
        if (err){
            res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});    
            return;
        } 
      
        podio.isAuthenticated().then(() => {
          // Ready to make API calls in here...
          console.log("podio authentificated..");
        
            var podio_data = {
                fields:requestData
            }
        
            console.log(podio_data);

            Util.callpodiourl('/item/app/'+Config.podio_config.realtorapp.id+'/',
            'POST', podio_data, podio.authObject.accessToken)
            .then((data)=>{
                res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:data}); 
                console.log(err)
            })
            .catch(err=>{
                res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err}); 
                console.log(err)
            });

        


        }).catch(err => {
            res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err}); 
            console.log(err)
        });
     
      });

 }); 
 

 router.post("/seller/update", function(req,res){

    var Podio = require('podio-js').api;

    var podio = new Podio({
    authType: Config.podio_config.authType,
    clientId:  Config.podio_config.clientId,
    clientSecret:  Config.podio_config.clientSecret
    });

    //Get the pramas from client.

    var requestData = req.body.data;


    var itemid =requestData.id;
    delete requestData.id;
    //console.log(requestData);

    podio.authenticateWithApp(Config.podio_config.realtorapp.id, Config.podio_config.realtorapp.token, (err) => {
        if (err){
            res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});    
            return;
        } 
      
        podio.isAuthenticated().then(() => {
          // Ready to make API calls in here...
          console.log("podio authentificated..");
        
            var podio_data = {
                fields:requestData
            }
        
            console.log(podio_data);

            Util.callpodiourl('/item/'+itemid+'/',
            'PUT', podio_data, podio.authObject.accessToken)
            .then((data)=>{
                res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:data}); 
                console.log(err)
            })
            .catch(err=>{
                res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err}); 
                console.log(err)
            });

        


        }).catch(err => {
            res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err}); 
            console.log(err)
        });
     
      });

 }); 

 router.post("/cashbuyer/add", function(req,res){

    var Podio = require('podio-js').api;

    var podio = new Podio({
    authType: Config.podio_config.authType,
    clientId:  Config.podio_config.clientId,
    clientSecret:  Config.podio_config.clientSecret
    });

    //Get the pramas from client.

    var requestData = req.body.data;

    var allkeys=[
        {name:"seller-name", key:"zillow_bedrooms", type:"int"},
        {name:"email", key:"zillow_bathrooms", type:"optional_int1"},
        {name:"seller-phone-cell", key:"zillow_amount", type:"currency"},
        {name:"property", key:"zillow_coolingSystem", type:"string"},
    ];

    if(!requestData.email){
        requestData.email = ' ';
    }

    //console.log(requestData);

    podio.authenticateWithApp(Config.podio_config.cashbuyerapp.id, Config.podio_config.cashbuyerapp.token, (err) => {
        if (err){
            res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err});    
            return;
        } 
      
        podio.isAuthenticated().then(() => {
          // Ready to make API calls in here...
          console.log("podio authentificated..");
        
            var podio_data = {
                fields:requestData
            }
        
            console.log(podio_data);

            Util.callpodiourl('/item/app/'+Config.podio_config.cashbuyerapp.id+'/',
            'POST', podio_data, podio.authObject.accessToken)
            .then((data)=>{
                res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:data}); 
                console.log(err)
            })
            .catch(err=>{
                res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err}); 
                console.log(err)
            });

        


        }).catch(err => {
            res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err}); 
            console.log(err)
        });
     
      });

 }); 


module.exports = router;