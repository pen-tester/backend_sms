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


router.post("/login", function(req,res){
    //Check if there are pending requests.
    var id = req.body.id || '';
    var pwd = req.body.pwd || '';
    
    if(id == '' || pwd == ''){
         res.json({
             status:System_Code.statuscode.fail,
             code:System_Code.responsecode.param_error
          });
          return;
    }else{
        //Check the user authentification...
        pwd = md5(pwd);
        UserModel.findOne({email:id, password:pwd , status: System_Code.user.status.active }, function(err, document){
            if(err){
                res.json({
                    status:System_Code.statuscode.fail,
                    code:System_Code.responsecode.param_error,
                    additional:err
                 });               
            }
            if(document == null){
                res.json({
                    status:System_Code.statuscode.fail,
                    code:System_Code.responsecode.no_user
                 });     
                 return;           
            }
            console.log(document);
            var jwt = Util.generateJWTtoken(document);
            var data ={
                session:jwt
            }
            res.json(
                {
                    status:System_Code.statuscode.success,
                    code: System_Code.responsecode.ok,
                    data:data
                }
            );
        })
    }
    //res.json({status:'error', error:'The checkout has to be post method', code:MessageCode.error});
});

router.post("/register", function(req,res){
    //Check if there are pending requests.
    var name = req.body.name || '';
    var email = req.body.email || '';
    var pwd = req.body.pwd || '';    
    
    if(name == '' || pwd == '' || email == ''){
         res.json({
             status:System_Code.statuscode.fail,
             code:System_Code.responsecode.param_error
          });
          return;
    }else{
        //Check the user authentification...
        pwd = md5(pwd);
        var parts  = name.split(/\s+/);
        var firstname="", lastname ="";
        if(parts.length>1){
            firstname = parts[0]; lastname =parts[1];
        }else{
            firstname = parts[0]; 
        }

        //var timestampe = Math.round(Date.now()/1000);
        var timestampe = Date.now();
        var userid = "u" + Math.floor((1 + Math.random())* 1000).toString(10).substring(1) + timestampe;

        var user = new UserModel(
            {
                firstname:firstname,
                lastname:lastname,
                email:email,
                created:Date.now(),
                password:pwd,
                id:userid
            }
        )

        user.save(function(err){
            console.log("save user error", err);
        });


        res.json(
            {
                status:System_Code.statuscode.success,
                code: System_Code.responsecode.ok,
                data:{
                    id:userid,
                    firstname:firstname,
                    lastname:lastname,
                    user:user
                }
            }
        );
    }
    //res.json({status:'error', error:'The checkout has to be post method', code:MessageCode.error});
});

module.exports = router;