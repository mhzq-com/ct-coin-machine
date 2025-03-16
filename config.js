"use strict";

var os = require("os");
var fs = require("fs");

var Config = {
    pathSeparator : "\\",
    os : os.platform(),
    service: {
        token: "f1b30315391805fc222d8dc5ba0f1f54faf47744",
        url: "citymedia.synology.me",
        port: 8080,
        companyId: 1
    },
    //doorGpio: 12,
    // coinAlertLevel: 20,
    serialNumber: 1,
    // powerOnLed: 16,
    // coinTrayLed: 21,

    path : function(path){
        return path.replace(new RegExp("[/]", "g"), Config.pathSeparator);
    },

    save(callback){
      fs.writeFile(__dirname + "/config.ini", JSON.stringify(this), (err) => {
            if(typeof callback === "function"){
                callback.apply(this, [err]);
            }
        
      });
    },
    
    load(file){
        try{
            var data = fs.readFileSync(__dirname + "/config.ini");
            var $this = this;
            data = data.toString("utf8");
            data = JSON.parse(data);
            
            Object.keys(data).forEach((element) => {
                $this[element] = data[element];
            });
        }catch(err){
            console.log("Couldn't load config file", err.message);
            
        }
        return;
    },

};

(function(){
    
    switch(os.platform()){
        case 'aix':
        break;
        case 'darwin':
        break;
        case 'freebsd':
        break;
        case 'linux':
            Config.pathSeparator = "/";
        break;
        case 'openbsd':
        break;
        case 'sunos':
            Config.pathSeparator = "/";
        break;
        case 'win32':
            Config.pathSeparator = "\\";
        break;
        default:
            Config.pathSeparator = "\\";
        break;
    }

    Config.load();

})();

module.exports = {
    Config:Config
}