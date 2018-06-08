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
var PropertyOwnerModel = require('../../models/property_owners');
var PropertyuploadModel = require('../../models/properties_uploaded');
var PropertyArchiveModel = require('../../models/properties_archive');

router.all('/list/:page/:count*?', function(req, res){
    var page = parseInt(req.params["page"]);
    var count = parseInt( req.params["count"] || '300' );

    //List all users for page number and limit
    //to limit to normal usr use {role:System_Code.user.role.user } for condition
    getPropertiesByPage(page,count).then((data)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:data}); 
    })
    .catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err}); 
        console.log(err);
    });
});

router.all('/total_count', function(req, res){
    getTotalCount().then((data)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:data}); 
    })
    .catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err}); 
        console.log(err);
    });
});



router.post('/total_sms', function(req, res){
    var start = req.body.start;
    var end = req.body.end;
    getTotalSmsCount(start,end).then((data)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:data}); 
    })
    .catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err}); 
        console.log(err);
    });
});

router.post('/total_batch', function(req, res){
    var start = req.body.start;
    var end = req.body.end;


    getTotalBatchCount(start,end).then((data)=>{
        res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:data}); 
    })
    .catch((err)=>{
        res.status(System_Code.http.bad_req).json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error, error:err}); 
        console.log(err);
    });
});

async function getTotalCount(){
    var result = PropertyOwnerModel.aggregate(
        [
            {$project:{properties:1, firstname:1, lastname:1, phone:1, id:1,called:1,
                last_sms_received_date:1,    owner_city:1,
                owner_state:1,  email:1, contact:1, leadtype:1,status:1,rated:1,newmessage:1,
                called:1  
            }},
            {$unwind:'$properties'},
            {$count:'total'}
        ]
    ).exec();
    return result;
}

async function getTotalSmsCount(start, end){
    if(end == 0) end = Date.now();
    console.log(start, end);
    var result = await PropertyOwnerModel.aggregate(
        [
            {$unwind:'$properties'},
            {$unwind:'$properties.sent_history'},
            {$match:{'properties.sent_history.sent_date':{$gte:start, $lte:end}} },
            {$count:'total'}
        ]
    ).exec();
    return result;
}

async function getTotalBatchCount(start,end){
    if(end == 0) end = Date.now();
    console.log(start, end);
    var result = await PropertyArchiveModel.aggregate(
        [
            {$unwind:'$sent_history'},
            {$match:{'sent_history.sent_date':{$gte:start, $lte:end}} },
            {$count:'total'}
        ]
    ).exec();
    return result;
}

async function getPropertiesByPage(page, entry){
    var result = PropertyOwnerModel.aggregate(
        [
            {$project:{properties:1, firstname:1, lastname:1, phone:1, id:1,called:1,
                last_sms_received_date:1,    owner_city:1,
                owner_state:1,  email:1, contact:1, leadtype:1,status:1,rated:1,newmessage:1,
                called:1  ,_id:0
            }},
            {$unwind:'$properties'},
            {$skip:page*entry},
            {$limit:entry}
        ]
    ).exec();
    return result;
}

module.exports = router;