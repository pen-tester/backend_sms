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


//For http rest api calling
var http  = require('http');

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
 
 
 router.post("/geturl", function(req,res){
  var addr =req.body.addr || '';
  var zip = req.body.zip  || '';

  var url = Config.zillow_config.geturl_host.replace(/\{zwsid\}/g,encodeURIComponent(Config.zillow_config.zwsid))
    .replace(/\{addr\}/g, encodeURIComponent( addr)).replace(/\{zip\}/g, encodeURIComponent(zip));

    console.log("url", url);

    const options = {
        hostname: Config.zillow_config.host,
        port: 80,
        path: url,
        method: 'GET'//,
      //  headers: {
      //    'Content-Type': 'application/x-www-form-urlencoded',
      //    'Content-Length': Buffer.byteLength(postData)
      //  }
      };

      const request = http.request(options, (result) => {
        console.log(`STATUS: ${result.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(result.headers)}`);
        result.setEncoding('utf8');
        var data ="";
        result.on('data', (chunk) => {
         // console.log(`BODY: ${chunk}`);
          data+=chunk;

        });

        result.on('end', () => {
         // console.log('No more data in response.', data);
          const convert = require('xml-js');
          var options = {compact: true, ignoreComment: true};
          try{
            var json_res = convert.xml2js(data, options);
            res.json({
                status:System_Code.statuscode.success,
                code:System_Code.responsecode.ok,
                data:json_res
            });
          }catch(ex){
            console.log(ex);
            res.json({
              status:System_Code.statuscode.fail,
              code:System_Code.responsecode.param_error,
              error:ex
            });           
          }          
        });
      });
      
      request.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
      });
      
      // write data to request body
     // request.write(postData);
      request.end();

 });
 
 router.post("/getdetailinfo", function(req,res){
  var zpid =req.body.zpid || '';


  var url = Config.zillow_config.detail_host.replace(/\{zwsid\}/g,encodeURIComponent(Config.zillow_config.zwsid))
    .replace(/\{zpid\}/g, encodeURIComponent( zpid));

    console.log("url", url);

    const options = {
        hostname: Config.zillow_config.host,
        port: 80,
        path: url,
        method: 'GET'//,
      //  headers: {
      //    'Content-Type': 'application/x-www-form-urlencoded',
      //    'Content-Length': Buffer.byteLength(postData)
      //  }
      };

      const request = http.request(options, (result) => {
   //     console.log(`STATUS: ${result.statusCode}`);
     //   console.log(`HEADERS: ${JSON.stringify(result.headers)}`);
        result.setEncoding('utf8');
        var data ="";
        result.on('data', (chunk) => {
         // console.log(`BODY: ${chunk}`);
          data+=chunk;

        });

        result.on('end', () => {
          console.log('No more data in response.', data);
          const convert = require('xml-js');
          var options = {compact: true, ignoreComment: true};
          try{
            var json_res = convert.xml2js(data, options);
            res.json({
                status:System_Code.statuscode.success,
                code:System_Code.responsecode.ok,
                data:json_res
            });
          }catch(ex){
            console.log(ex);
            res.json({
              status:System_Code.statuscode.fail,
              code:System_Code.responsecode.param_error,
              error:ex
            });           
          }          
        });
      });
      
      request.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
      });
      
      // write data to request body
     // request.write(postData);
      request.end();

 });
 

module.exports = router;