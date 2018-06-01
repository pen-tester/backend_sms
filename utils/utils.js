//System Codes for request, respond, some types
var System_Code = require('../config/system_code');
var Config  = require('../config/config');
var fs =require('fs');
var path = require('path');
//Npm Modules
var Crypto = require('crypto');

var Utils = {
    formatDate: function(date, format, utc) {
        var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
        function ii(i, len) {
            var s = i + "";
            len = len || 2;
            while (s.length < len) s = "0" + s;
            return s;
        }
    
        var y = utc ? date.getUTCFullYear() : date.getFullYear();
        format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
        format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
        format = format.replace(/(^|[^\\])y/g, "$1" + y);
    
        var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
        format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
        format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
        format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
        format = format.replace(/(^|[^\\])M/g, "$1" + M);
    
        var d = utc ? date.getUTCDate() : date.getDate();
        format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
        format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
        format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
        format = format.replace(/(^|[^\\])d/g, "$1" + d);
    
        var H = utc ? date.getUTCHours() : date.getHours();
        format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
        format = format.replace(/(^|[^\\])H/g, "$1" + H);
    
        var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
        format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
        format = format.replace(/(^|[^\\])h/g, "$1" + h);
    
        var m = utc ? date.getUTCMinutes() : date.getMinutes();
        format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
        format = format.replace(/(^|[^\\])m/g, "$1" + m);
    
        var s = utc ? date.getUTCSeconds() : date.getSeconds();
        format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
        format = format.replace(/(^|[^\\])s/g, "$1" + s);
    
        var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
        format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
        f = Math.round(f / 10);
        format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
        f = Math.round(f / 10);
        format = format.replace(/(^|[^\\])f/g, "$1" + f);
    
        var T = H < 12 ? "AM" : "PM";
        format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
        format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));
    
        var t = T.toLowerCase();
        format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
        format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));
    
        var tz = -date.getTimezoneOffset();
        var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
        if (!utc) {
            tz = Math.abs(tz);
            var tzHrs = Math.floor(tz / 60);
            var tzMin = tz % 60;
            K += ii(tzHrs) + ":" + ii(tzMin);
        }
        format = format.replace(/(^|[^\\])K/g, "$1" + K);
    
        var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
        format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
        format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);
    
        format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
        format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);
    
        format = format.replace(/\\(.)/g, "$1");
    
        return format;
    },
    getcurrenttime:function(timezone){  //utc-8 pst time zone
        if(timezone === undefined) {
            timezone = 'America/Los_Angeles';
        }
        process.env.TZ =timezone; // 'Pacific/Honolulu';
        return new Date();
    },
    check_authentification(auth_token){  //jwt token is auth_token
        var tokens = auth_token.split(/\s+/);
        if(tokens.length!=2 || tokens[0]!="auth"){
            return {status:System_Code.statuscode.fail, code:System_Code.responsecode.jwt_authen_error};        
        }
    
        var token = unescape(tokens[1]);
    
        var parts = token.split(/:/);
        if(parts.length!=2){
            return {status:System_Code.statuscode.fail, code:System_Code.responsecode.jwt_authen_error}; 
        }
        
        var data_origin_base64 =parts[0];
        var data_origin = new Buffer( parts[0], 'base64').toString();
        var sig = parts[1];
        var data = null;
        try{
            data = JSON.parse(data_origin);
        }catch(ex){
            Utils.logger(ex);
        }
        
    
        var cal_sig = Crypto.createHmac('sha256', Config.jwt_key_gen_code).update(data_origin).digest('hex');
    
        if(sig!=cal_sig){
            return {status:System_Code.statuscode.fail, code:System_Code.responsecode.jwt_authen_error};                    
        }        

        return {status:System_Code.statuscode.success, code:System_Code.responsecode.ok, data:data}; 

    },
    
    generateJWTtoken:function(user){
        var now = new Date();
        now.setDate(now.getDate()+Config.expire_session_days);
        var data =
         { 
            id:user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            role:user.role,
            logged_date:Date.now(),
            expire_date:now.getTime()
          }
        var data_origin = JSON.stringify(data);
        var cal_sig = Crypto.createHmac('sha256', Config.jwt_key_gen_code).update(data_origin).digest('hex');

        var jwt_token = new Buffer(data_origin).toString("base64") + ":" + cal_sig;
        return jwt_token;
    },

    logger:function(error){
        console.log("time:", Utils.formatDate(new Date(), "yyyy-MM-dd HH:mm:ss"), " data:", error);
        var logfile = path.join(__basedir, 'log.txt');
        console.log("log", logfile);
        fs.appendFile(logfile,"time:"+Utils.formatDate(new Date(), "yyyy-MM-dd HH:mm:ss") + " data:" + error + "\r\n" ,
            function(err){
                console.log(err);
            }
        )
    },

    getActiveNumber:function(phones){
        try{
            var len = phones.length;
            for(var i=0; i<len ;i++){
                var phone = phones[i];
                if(phone.status == System_Code.user.phone.active){
                    return phone.phone;
                }
            }
        }
        catch(ex){

        }
        return "";
    }
    ,
    callpodiourl:function(url,method, data, auth_token){
        var http = require('https');
        const options = {
            hostname: "api.podio.com",
            port: 443,
            path: url,
            method: method,
            headers: {
             // 'Content-Type': 'application/x-www-form-urlencoded',
              //'Content-Length': Buffer.byteLength(postData)
              'Authorization':'OAuth2 ' + auth_token
            }
          };
    

          return new Promise((resolve,reject)=>{
            const request = http.request(options, (result) => {
                console.log(`STATUS: ${result.statusCode}`);
                console.log(`HEADERS: ${JSON.stringify(result.headers)}`);
                result.setEncoding('utf8');
                var data ="";
                result.on('data', (chunk) => {
                 // console.log(`BODY: ${chunk}`);
                  data+=chunk;
        
                });
        
                result.on('end', () => {
                 // console.log('No more data in response.', data);
                    console.log(data);
                    resolve(data);
                });
              });
              
              request.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
                reject(e);
              });
              request.write(JSON.stringify(data));
              request.end();
          });


          
          // write data to request body
         // request.write(postData);

    }
}

module.exports = Utils;