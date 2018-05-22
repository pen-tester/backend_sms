var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var sms_schema = mongoose.Schema({
    id:String,    
    tag:String,
    created:{type:Date, default:Date.now},
    updated:[
        Schema.Types.Mixed   
        /*
          {
              date:Date,
              userid: String
          }
        */
    ],
    content:String
},{collection:'sms_templates'});

var sms = mongoose.model('sms_template', sms_schema);

module.exports  = sms;