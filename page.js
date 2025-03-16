"use strict";

const TemplateInflater = require("./TemplateInflater").TemplateInflater;
const Config = require("./config.js").Config;

class Page{
    constructor(req, res, app){
        this.request = req;
        this.response = res;
        this.app = app;
    }

    GetContent(){
        return new Promise((resolve, reject) =>{
            resolve("");
        });
    }
}

class Index extends Page{

    constructor(req, res, app){
        super(req, res, app);

        
        if(!app.UserLoggedIn()){
            res.writeHead(302 , {
                'Location' : '/login.html'
            });
            res.end();
            throw new Error("Nincs bejelentkezve");
        }
        
    }

    GetContent(){
        var instance = this;
        return new Promise(async (resolve, reject) => {
            try {
                var salesCount = 0;
                var salesAfterLastFillUp = 0;
                try{
                    salesCount = await this.app.GetSalesCount();
                } catch(error){

                }

                try{
                    salesAfterLastFillUp = await this.app.GetSalesAfterLastFillUp();
                } catch(error){

                }

                resolve(TemplateInflater.InflateFile(Config.path(__dirname + "/views/index.html"), {serialNumber: Config.serialNumber, coinCount: this.app.coinCount, salesCount: salesCount, salesAfterLastFillUp: salesAfterLastFillUp, version: this.app.GetVersion()}));
            
            } catch (error) {
                reject(error);
            }
        });
    }


}


class Settings extends Page{

    constructor(req, res, app){
        super(req, res, app);

        if(!app.UserLoggedIn()){
            res.writeHead(302 , {
                'Location' : '/login.html'
            });
            res.end();
            throw new Error("Nincs bejelentkezve");
        }
        
    }


    GetContent(){
        var instance = this;
        return new Promise(async (resolve, reject) => {
            try {
                
                var settings = await this.app.GetSettings();
                var errors = await this.app.GetErrors();
                var errorContent = "";
                for(var e of errors){
                    errorContent += `<li class="list-group-item"><div class="row"><div class="col"><i class="fa-2x fa-solid fa-triangle-exclamation text-warning"></i> <span>${e.errorType}</span> <span>${e.description}</span></div><div class="col-auto"><button type="button" class="deleteError w-auto btn btn-danger" data-id="${e.id}"><i class="fa-solid fa-trash"></i></button></div></div></li>`;
                }
                settings.errorContent = errorContent;

                settings.hopperOptions = ` <option value="Hopper" ${settings.hopper=="Hopper"?`"selected"`:``}>Kerek érme</option>
                            <option value="HopperMH245CA"  ${settings.hopper=="HopperMH245CA"?`"selected"`:``}>Préselt érme</option>`;
                
                
                settings.posOptions = ` <option value="Monera" ${settings.pos =="Monera"?`"selected"`:``}>Monera</option>
                            <option value="Nayax"  ${settings.pos=="Nayax"?`"selected"`:``}>Nayax</option>`;



                resolve(TemplateInflater.InflateFile(Config.path(__dirname + "/views/settings.html"), settings));
            
            } catch (error) {
                reject(error);
            }
        });
    }
}

class Login extends Page{

    constructor(req, res, app){
        super(req, res, app);

        
    }

    GetContent(){
        var instance = this;
        return new Promise((resolve, reject) => {
            try {
                
                resolve(TemplateInflater.InflateFile(Config.path(__dirname + "/views/login.html"), {serialNumber:Config.serialNumber}));
            
            } catch (error) {
                reject(error);
            }
        });
    }
}


module.exports = {
    Index: Index,
    Settings: Settings,
    Login:Login,
};
