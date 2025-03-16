var Mysql = require("./System/Db/MySql").MySql;

var config = {
    "dbHost": "localhost"
    , "dbUser": "root"
    , "dbPassword": ""
    , "dbName": "coin"
    
}

try {
    var cnf = require("./config.json");
    config = Object.assign(config, cnf);
} catch (error) {
    
}

const dao = new Mysql(config.dbHost, config.dbUser, config.dbPassword, config.dbName);

module.exports = dao;
