import { Schema } from "mongoose";

var mongoose = require("mongoose");

var property_owners_schema = mongoose.Schema({
    phone:String,  

    properties:[
        Schema.Types.Mixed
        /*
        {
            upload_user:id or name
            realotor:...
            podio:
            zillow_used:
            propertyid:p+crc16+time()

            sent_history:[
                {
                    option:Number,
                    sent_date:Date,
                    sent_userid:String
                }
            ]
        }
        */
    ],
    status:Number,
    chat:[
        Schema.Types.Mixed
        /*
        {
            replied_chat:Number  message:type
            content:String,
            created:{type:Date ,default:Date.now},
            userid:String   // "" : incoming sms , userid: outgoing sms  
        }
        */
    ]
},{collection:'property_owners'});

var property_owners = mongoose.model('property_owner', property_owners_schema);

module.exports  = property_owners;