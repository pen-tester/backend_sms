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
        accountSid:"AC497bf0118ec84a2a374d423a064de5f1",
        authToken:"020e0418549cc492ab3bfb9e9c78493c",
        fromNumber:"+16195972521"
    },
    jwt_key_gen_code:'sec_key_jwt_generation',
    expire_session_days:3
}

module.exports = config;