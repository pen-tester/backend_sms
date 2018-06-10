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

router.all('/list/:page/:count*?', function(req, res){
    var page = parseInt(req.params["page"]);
    var count = parseInt( req.params["count"] || '300' );

    //List all users for page number and limit
    //to limit to normal usr use {role:System_Code.user.role.user } for condition
    UserModel.find({}, {role:0, password:0}).skip(page*count).limit(count).exec(function(err, documents){
        if(err){
            Util.logger("user list find error adminuser/user/list");
            Util.logger(err);
            res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error});
            return;
        }

         res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:documents});

    });
});

router.post('/update', function(req,res){
    var user = req.body.user;
    if(user!=null){
        try{
            if(typeof user.password != 'undefined' && user.password!=""){
                user.password = md5(user.password);
            }else{
               try{
                 delete user.password;
               }catch(ex){

               }
            }
            

            UserModel.findOneAndUpdate({id:user.id},{$set:user}, function(err, doc){
                if(err){
                    res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error});
                    return;
                }
                res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:doc});
            })
        }catch(ex){
            res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error});
            console.log(ex);
        }
        
    }
    else{
        res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.param_error});
    }
    return;    
});

router.post('/delete', function(req,res){
    var user = req.body.user;
    if(user!=null){
        try{
            UserModel.remove({id:user.id}, function(err){
                if(err){
                    res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error});
                    return;
                }
                res.json({status:System_Code.statuscode.success, code:System_Code.responsecode.ok});
            })
        }catch(ex){
            res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.user_model_error});
            console.log(ex);
        }
        
    }
    else{
        res.json({status:System_Code.statuscode.fail, code:System_Code.responsecode.param_error});
    }
    return;    
});

module.exports = router;