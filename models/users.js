var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var System_Code = require('../config/system_code');

var users_schema = mongoose.Schema({
    firstname:String,
    lastname:String,
    email:String,
    birth:Date,
    created:{ type: Date, default: Date.now },
    role:{type:Number , default:System_Code.user.role.user},
    phone:{
        outgoing:[Schema.Types.Mixed],  /* {phone:String, status:Number} */
        incoming:[Schema.Types.Mixed]
    },
    status:{type:Number , default:System_Code.user.status.inactive},
    password:String , //md5 hash
    id:String,   //u+crc16+time()
    permissions:{
        upload:{type:Number , default:System_Code.user.permission.inactive},
        sendsms:{type:Number , default:System_Code.user.permission.inactive},
        smsedit:{type:Number , default:System_Code.user.permission.inactive}
    }
},{collection:'users'});

var user = mongoose.model('user', users_schema);

module.exports  = user;