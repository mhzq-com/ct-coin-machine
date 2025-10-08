var Mysql = require("./System/Db/MySql").MySql;

var config = {
    "dbHost": process.env.DB_HOST || "127.0.0.1"
    , "dbUser": process.env.DB_USER || "root"
    , "dbPassword": process.env.DB_PASS || ""
    , "dbName": process.env.DB_NAME || "coin"
    
}
console.log(process.env.DB_PASS, config);
const dao = new Mysql(config.dbHost, config.dbUser, config.dbPassword, config.dbName);

module.exports = dao;
