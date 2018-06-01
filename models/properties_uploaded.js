
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var property_upload_schema = mongoose.Schema({
    id:String,
    property:Schema.Types.Mixed,       
        /*
        {
            date_added,date_sent,
            address, city, state, firstname, lastname, owner_address,owner_city, owner_state 
            phone:[],
            leadtype      	

        }
        */
    upload_userid:String, //id or name   
    sent_history:[
           {
               smstag:String,
               templateid:String,
               sent_date:Number,
               sent_userid:String,
               success_phone:[]
           }
       ] ,      
    status:Number,
    uploaded:{type: Date, default: Date.now }
},{collection:'property_uploads'});

var property_upload = mongoose.model('property_upload', property_upload_schema);

module.exports  = property_upload;