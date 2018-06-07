
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var contact_schema = mongoose.Schema({
    id:String,
    phone:String,  
    firstname:String,
    lastname:String,
    address:String,
    city:String,
    state:String,
    country:String,
    url:String,
    date_added:Number,
    upload_userid:String,
    chat:[
        Schema.Types.Mixed
        /*
        {
            replied_chat:Number  message:type
            content:String,
            created:{type:Date ,default:Date.now},
            userid:String   // "" : incoming sms , userid: outgoing sms ,
            phone:String 
        }
        */
    ],
    voice:[
        Schema.Types.Mixed
        /*
        {
            calling_type:Number  message:type
            created:{type:Date ,default:Date.now},
            userid:String   // "" : incoming sms , userid: outgoing sms ,
            phone:String 
        }
        */       
    ],
    last_sms_received_date:Number
},{collection:'contacts'});

var contact = mongoose.model('contact', contact_schema);

module.exports  = contact;