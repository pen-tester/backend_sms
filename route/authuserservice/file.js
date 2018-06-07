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
var ContactModel = require('../../models/contact');


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
 
 
 router.post("/upload", function(req,res){
    if (!req.files)
    return res.status(400).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.param_error, error:'No files were uploaded.'});    
    
    var user = res.locals.userinfo;
    var additional_data = JSON.parse(req.body.data || '{}');
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    var csvfile = req.files.csv;
    
    // Use the mv() method to place the file somewhere on your server
    var filepath = path.join(__basedir, '/upload/'+Util.formatDate(new Date(), "yyyy_MM_dd_HH_mm_ss")+".csv");
    csvfile.mv(filepath, function(err) {
        if (err)
        return res.status(500).json(
            {status:System_Code.statuscode.fail, code:System_Code.responsecode.param_error, error:err}
        );    
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:{body:req.body,msg:'file uploaded'}});
    });

    

    //add datas to the properties of the owner...
    var csv_fields =[]; 
    var rows = [];
    var row_index =0;

    const csv=require('csvtojson');
    csv({noheader:true})
    .fromString(req.files.csv.data)
    .on('csv',(csvRow)=>{ // this func will be called 3 times
        if(row_index == 0){
            csv_fields = csvRow;

        } else{
            rows.push(csvRow);
        }
        row_index++;
        //console.log(csvRow) // => [1,2,3] , [4,5,6]  , [7,8,9]
    })
    .on('done',()=>{
        
        var len_rows = rows.length;
        console.log(user);
        for(var row_num =0 ;row_num < len_rows ;row_num++){
            //parsing finished
            var prp_upload = new Property_uploadModel();
            var timestampe = Date.now();
            var id = "pu" + Math.floor((1 + Math.random())* 1000).toString(10).substring(1) + timestampe;
            prp_upload.id = id;
            var row = rows[row_num];
            //console.log(row);
            var prp = {};
            var phones = [];
            var len = csv_fields.length;
            for(var i=0; i <len; i++){
                var field = csv_fields[i];
                if(field.indexOf("phone")==-1){
                    prp[field] = row[i];
                }else{
                    phones.push(row[i]);
                }
            }
            prp['phone'] = phones;
            prp_upload.property = prp;
            try{
                prp_upload.upload_userid = user.id;
                
                if(additional_data != null && additional_data != '' && additional_data.user !=""){
                    prp_upload.upload_userid = additional_data.user;
                    console.log(additional_data.user);
                }
                
            }catch(ex){
                console.log(ex);
                prp_upload.upload_userid = "erroruser";
            }
            //console.log(prp_upload);
            prp_upload.save(function(err){
                if(err) console.log(err);
            });
        }
        console.log("parse end csv...");
    });   
  
 });
 

 router.post("/contact/upload", function(req,res){
    if (!req.files)
    return res.status(400).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.param_error, error:'No files were uploaded.'});    
    
    var user = res.locals.userinfo;
    var additional_data = JSON.parse(req.body.data || '{}');
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    var csvfile = req.files.csv;
    
    // Use the mv() method to place the file somewhere on your server
    var filepath = path.join(__basedir, '/upload/contact'+Util.formatDate(new Date(), "yyyy_MM_dd_HH_mm_ss")+".csv");
    csvfile.mv(filepath, function(err) {
        if (err)
        return res.status(500).json(
            {status:System_Code.statuscode.fail, code:System_Code.responsecode.param_error, error:err}
        );    
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:{body:req.body,msg:'file uploaded'}});
    });

    

    //add datas to the properties of the owner...
    var csv_fields =[]; 
    var rows = [];
    var row_index =0;

    const csv=require('csvtojson');
    csv({noheader:true})
    .fromString(req.files.csv.data)
    .on('csv',(csvRow)=>{ // this func will be called 3 times
        if(row_index == 0){
            csv_fields = csvRow;

        } else{
            rows.push(csvRow);
        }
        row_index++;
        //console.log(csvRow) // => [1,2,3] , [4,5,6]  , [7,8,9]
    })
    .on('done',()=>{
        
        var len_rows = rows.length;
        var added = Date.now();
        console.log(user);
        for(var row_num =0 ;row_num < len_rows ;row_num++){
            //parsing finished
            var contact = new ContactModel();
            var timestampe = Date.now();
            var id = "cn" + Math.floor((1 + Math.random())* 1000).toString(10).substring(1) + timestampe;
            contact.id = id;
            var row = rows[row_num];
            //console.log(row);
            var len = csv_fields.length;
            for(var i=0; i <len; i++){
                var field = csv_fields[i];
                contact[field] = row[i];
            }

            contact["date_added"] = added;
            
            try{
                contact.upload_userid = user.id;
                
                if(additional_data != null && additional_data != '' && additional_data.user !=""){
                    contact.upload_userid = additional_data.user;
                    console.log(additional_data.user);
                }
                
            }catch(ex){
                console.log(ex);
                contact.upload_userid = "erroruser";
            }
            //console.log(prp_upload);
            contact.save(function(err){
                if(err) console.log(err);
            });
        }
        console.log("parse end csv...");
    });   
  
 });
 

module.exports = router;