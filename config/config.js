var config = {
    port_number:9600,
    mongodb_uri:"mongodb://localhost/adamcompany",
    session_secretkey:'session_security',
    shoppingdb_config:{
        host: "localhost",
        user: "vaultuser",
        password: "123!@#vault&8(",
        database:"vaultdb"
      },
    twilio_config:{
        accountSid:"xxxx",
        authToken:"xxx",
        fromNumber:"+16195972521",
        callback_baseurl:"http://api.probateproject.com/"
    },
    jwt_key_gen_code:'sec_key_jwt_generation',
    expire_session_days:3
}

module.exports = config;