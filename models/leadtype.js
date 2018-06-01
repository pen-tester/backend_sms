
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var leadtype_schema = mongoose.Schema({
    value:String,
    text:String
},{collection:'leadtypes'});

var leadtype = mongoose.model('leadtype', leadtype_schema);

module.exports  = leadtype;