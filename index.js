#!/usr/bin/env node

//For http main process
var express = require('express');
var session = require('express-session');
var bodyParser = require("body-parser");
var path = require('path');
const fileUpload = require('express-fileupload');


//Routing....
var main_route = require('./route/main');
var api_route=require('./route/api');


//Socket io ....
var socketio = require('socket.io');
var notification_process = require('./server/notification');

//Global part
var global_area = require('./config/global');

//Database...
var mongoose = require("mongoose");
//Config for the app
var config=require("./config/config");


const options = {
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
  };


mongoose.connect(config.mongodb_uri, options);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
    console.log("mongodb is connected to db",config.mongodb_uri);
})
global.__basedir = __dirname;


var app=express();
//Set static files for js file..
app.use(express.static(path.join(__dirname, 'public')));
console.log(__dirname);
//Set view engine
app.set('view engine', 'ejs');


app.use(bodyParser.json());  //support json encoded bodies
app.use(bodyParser.urlencoded({extended:true}));  //support encoded bodies
app.use(session({secret:config.session_secretkey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

app.use(fileUpload());

//Routing...
app.use('/v10', api_route);  // For the api...
app.use('/',main_route);

//App start...

var server = app.listen(config.port_number, function(){
        var host = server.address().address;
        var port = server.address().port;
        console.log("server started ", host, ":", port);
});

//For the socketio server
var socket_con = socketio(server);

//For the connected socket process
notification_process(socket_con);