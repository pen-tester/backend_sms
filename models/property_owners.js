
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var property_owners_schema = mongoose.Schema({
    id:String,
    phone:String,  
    firstname:String,
    lastname:String,
    owner_city:String,
    owner_state:String,
    email:String,
    contact:String,
    leadtype:String,
    status:String,
    rated:Number,
    newmessage:Number,
    called:Number,
    properties:[
        Schema.Types.Mixed
        /*
        {
            refid: uploaded_propertyId equals property id....
            date_added,date_sent,
            address, city, state, firstname, lastname, owner_address,owner_city, owner_state 
            phone0        	 phone1        	 phone2        	 phone3        	 phone4        	 phone5        	 phone6        	 phone7        	 phone8        	 phone9        	 leadtype      	
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
    last_sms_received_date:Date
},{collection:'property_owners'});

var property_owners = mongoose.model('property_owner', property_owners_schema);

module.exports  = property_owners;