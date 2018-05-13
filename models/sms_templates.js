import { Schema } from "mongoose";

var mongoose = require("mongoose");

var sms_schema = mongoose.Schema({
    option:Number,
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