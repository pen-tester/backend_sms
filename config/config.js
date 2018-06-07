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
        authToken:"xxxx",
        fromNumber:"+16195972521",
        callback_baseurl:"http://api.probateproject.com/",
        tryNumber:"+14582072380"
    },
    jwt_key_gen_code:'sec_key_jwt_generation',
    expire_session_days:3,
    zillow_config:{
        host:"www.zillow.com",
		zwsid: "X1-ZWz1g5umo647ij_7ew1d",
		geturl_host : "/webservice/GetDeepSearchResults.htm?zws-id={zwsid}&address={addr}&citystatezip={zip}",
		detail_host:"/webservice/GetUpdatedPropertyDetails.htm?zws-id={zwsid}&zpid={zpid}"        
    },
    podio_config:{
        authType: 'app',
        clientId: 'smscampaign',
        clientSecret: 'jgkgtY71aRqyiMdscmIQ6T3GRHBO3XDGc0Pylh25db4R5lgDO3RcKs4HGhrOkMMc' ,
        podioapp:{id:'20077644', token:'b228c7e339b443ec89ac05b38d64c1a9'},
        realtorapp:{id:'20077611', token:'6dd42209c9c444e399e6ee2afd70d681'},
        cashbuyerapp:{id:'20077659', token:'7c8de44e30e7458d9311d771ec8c0813'}
    }
}

module.exports = config;