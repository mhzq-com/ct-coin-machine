
const Config = require("./config.json");
const Dao = require("./db.js");
const EventEmitter = require("events").EventEmitter;

const Sql = require("@mhzq/mhzqframework").System.Db.Sql;
const WebRequest = require("@mhzq/mhzqframework").Web.Http.HttpRequest.HttpRequest;
const Command = require("@mhzq/mhzqframework").System.Shell.Command;
const MySql = Sql.MySql;
const AData = Sql.AData;
const Beans = require("./System/Db/Beans/Entities.js");
const Setting = Beans.Setting;
const Log = Beans.Log;
const LogType = Beans.LogType;
const Hopper = require("./Hopper.js");

const Pos = require("./Pos.js");

const crypto = require('crypto');

const pjson = require('./package.json');
const jwt = require('jsonwebtoken');


//GPIO16 36-os láb Power On Led (Világítson ha elindult a rendszer)
//GPIO20 40-es láb Érme fiók led (Világítson 5mp-ig ha kiadott egy érmét)


function setTimeoutContext() {
  return function (fn, tm) {
    if (this.timeout != undefined) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(fn, tm);
    return this.timeout;
  }
};


function debounce(func, wait, immediate) {
  var timeout;
  return function () {

    var context = this, args = arguments;
    var later = function () {
      clearTimeout(timeout);
      timeout = null;

      if (!immediate) func.apply(context, args);
    };

    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
};


class Api {

  constructor(appControl) {
    this.user = undefined;
    this.app = appControl;
  }

  LoginWithPin(response, data) {

  }

  Login(response, data) {


    this.app.service.post({ path: "/api/Control/Authentication/Authenticate/Login", timeout: 40000 }, { user: data.user, password: data.password, companyId: Config.service.companyId }).then(data => {

      response.json(data);
      this.user = data;

    }).catch(error => {
      if (error.response) {

        response.status(error.response.statusCode);
        response.json(JSON.parse(error.response.text));
      } else if (error.code == "ECONNREFUSED") {
        response.status(503);
        response.json(error);
      }

    });

  }

  LoginWithPin(response, data) {
    var pwd = crypto.createHash('sha256').update(data.password).digest('hex');

    this.daoCtx.Get(Setting, { name: "pin" }).then((data) => {
      if (pwd == data.value) {
        var user = { id: 1 };
        response.json(user);
        this.user = user;
      } else {
        response.status(401);
        response.json({ error_description: "Hibás pin" });
      }
    }).catch((reason) => {
      response.status(500);
      response.json({ error_description: reason.message });
    });

  }

  Logout(response, data) {

    delete this.user;

    response.json(true);

  }

  //ide logut szerint

  UserLoggedIn() {
    return this.user != undefined;
  }
  

  EmptyHopper(response, data) {
    try {

      if (!this.UserLoggedIn()) {
        throw new Error("Nincs bejelentkezve");
      }

      this.app.EmptyHopper().then((coinCount) => {
        response.json(coinCount);
      });

    } catch (error) {
      response.status(500);
      response.json({ error_description: error.message });
    }

  }

  FillUpHopper(response, data) {
    try {

      if (!this.UserLoggedIn()) {
        throw new Error("Nincs bejelentkezve");
      }
      data.coinCount = parseInt(data.coinCount);

      if (isNaN(data.coinCount)) {
        throw new Error(`${data.coinCount} nem egy szám`);
      }

      this.app.FillUpHopper(data.coinCount);

      response.json(this.app.coinCount);

    } catch (error) {
      response.status(500);
      response.json({ error_description: error.message });
    }
  }

  async UpdateApp(response, data) {
    try {

      // if(!this.UserLoggedIn()){
      //     throw new Error("Nincs bejelentkezve");
      // }

      var res = await this.app.UpdateApp();

      response.json(res);

    } catch (error) {
      response.status(500);
      response.json({ error_description: error.message });
    }
  }

  async Restart(response, data) {
    try {

      if (!this.UserLoggedIn()) {
        throw new Error("Nincs bejelentkezve");
      }

      var res = await this.app.Restart();

      response.json(true);

    } catch (error) {
      response.status(500);
      response.json({ error_description: error.message });
    }
  }

  async Shutdown(response, data) {
    try {

      if (!this.UserLoggedIn()) {
        throw new Error("Nincs bejelentkezve");
      }

      var res = await this.app.Shutdown();

      response.json(true);

    } catch (error) {
      response.status(500);
      response.json({ error_description: error.message });
    }
  }

 

  async DeleteError(response, data) {

    try {

      let err = await this.daoCtx.Get(Error, { id: data.id });
      await this.daoCtx.Delete(err);
      response.json(true);

    } catch (error) {
      response.status(500);
      response.json({ error_description: error.message });
    }

  }




}

class ApplicationController extends EventEmitter {

  constructor(dao) {
    super();
    this.dao = dao;

    this.coinCount = 0;
    /** Send logs continuously */
    this.isSendContinuous = false;


    //this.authorizationString = "Bearer " + Config.service.token.substr(0, 36) + "_" + Config.serialNumber;

    this.service = new WebRequest(Config.service.url, Config.service.port);

    this.api = new Api(this);

    this.coinTimeoutContext = setTimeoutContext();

  }


  async Login(data, response) {

    var res = await fetch(this.settings.url + "/Control/Authentication/Authenticate/Login/", {
      method: "POST",
      headers:{"Content-Type": "application/json"}
      , body: JSON.stringify({ user: data.user, password: data.password, companyId: this.settings.companyId })
    });

    if (res.ok) {
      let user = await res.json();
      delete user.password;

      //use the payload to store information about the user such as username, user role, etc.
      let payload = { user: user.name };

      //create the access token with the shorter lifespan
      let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        //expiresIn: process.env.ACCESS_TOKEN_LIFE
      })

      // //create the refresh token with the longer lifespan
      // let refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      //     algorithm: "HS256",
      //     expiresIn: process.env.REFRESH_TOKEN_LIFE
      // })

      // //store the refresh token in the user array
      // users[username].refreshToken = refreshToken

      //send the access token to the client inside a cookie
      response.cookie("jwt", accessToken, {
        // secure: true
        // , httpOnly: true
        // ,path: "/"
        expires: new Date(2030, 0)
      })

      return user;


    } else {
      res = await res.json();
      throw new Error(res.error_description);
    }



    ({ path: "/api/Control/Authentication/Authenticate/Login", timeout: 40000 }, { user: data.user, password: data.password, companyId: Config.service.companyId }).then(data => {

      response.json(data);
      this.user = data;

    }).catch(error => {
      if (error.response) {

        response.status(error.response.statusCode);
        response.json(JSON.parse(error.response.text));
      } else if (error.code == "ECONNREFUSED") {
        response.status(503);
        response.json(error);
      }

    });

  }

  async CheckAccessCore(req, res) {
    try {

        var user;


        var userJwt = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);

        user = { name: userJwt.user };

        user.isLoggedIn = true;

        return Object.assign({}, user);

    } catch (error) {

        res.statusCode = 401
        throw error;
    }
}

async GetInfo(){

}

  /**
   * Restarts the raspberry
   */
  Restart(timeout = 5) {
    return new Promise((resolve, reject) => {
      var cmd = new Command("sudo shutdown", ["-r", "-t", "5"]);
      cmd.exec(function (err, stdout, stderr) {
        if (err) {
          reject(err);
          return;
        }

        resolve(stdout);
      });
    });


  }


  /**
   * Shuts down the raspberry
   */
  Shutdown(timeout = 5) {
    return new Promise((resolve, reject) => {
      var cmd = new Command("sudo shutdown", ["-t", "5"]);
      cmd.exec(function (err, stdout, stderr) {
        if (err) {
          reject(err);
          return;
        }

        resolve(stdout);
      });
    });


  }

  /**
   * Uptates the application
   */
  UpdateApp() {

    return new Promise((resolve, reject) => {
      var cmd = new Command("npm", ["install", "--prefix", "/home/pi", "@mhzq/citymedia-coin-machine"]);
      cmd.exec(function (err, stdout, stderr) {
        if (err) {
          reject(err);
          return;
        }

        resolve(stdout);
      });
    });

  }

  CreateLog(description, errorLevel = Beans.LogType.error){
      var log = new Log();
      log.description = description;
      log.logType = errorLevel;
      log.createDate = new Date();
      this.daoCtx.Add(log);
  }

  /** Initialize ApplicationController (events, sensors ... etc.) */
  Init() {
    return new Promise(async (resolve, reject) => {

      try {

        this.daoCtx = await this.dao.CreateContext();

        var log = new Beans.Log();
        log.logType = LogType.info;
        log.description = "Sikeres adatbázis kapcsolódás";


        this.daoCtx.Add(log).catch((reason) => {
          console.error("Sikertelen log bejegyzés: ", reason);
        });

        this.settings = await this.GetSettings();
        
        this.authorizationString = "Bearer " + this.settings.token.substr(0, 36) + "_" + this.settings.serialNumber;

        //Sending log informations
        setInterval(() => {
          this.SendDataContinuousStart();

        }, 300000);

        //Get the current coinCount from the coin db
        try {


          this.hopper = new Hopper[this.settings.hopper]();
        } catch (error) {
          var s = new Setting();
          s.name = "hopper";
          s.value = "Hopper";
          await this.daoCtx.Add(s);
          
          this.hopper = new Hopper.Hopper();
        }

        this.hopper.on("rolledChange", (isRolled) => {
          this.pos.SetEnabled(isRolled);
        });

        //Get the current coinCount from the coin db
        try {

          this.coinCount = parseInt(this.settings.coinCount);
        } catch (error) {
          var s = new Setting();
          s.name = "coinCount";
          s.value = 0;
          await this.daoCtx.Add(s);
          
          this.coinCount = 0;
        }

        if (this.settings.pos == undefined) {
          var s = new Setting();
          s.name = "pos";
          s.value = "Monera";
          await this.daoCtx.Add(s);
          
          this.settings.pos = "Monera";
        }

        this.pos = new Pos[this.settings.pos]();



        if (this.coinCount == 0) {
          this.pos.SetEnabled(false);
        }



        //this.door = new Gpio(Config.doorGpio, "in", "both");
        // this.powerOnLed = new Gpio(Config.powerOnLed, "out");

        //this.coinTrayLed = new Gpio(Config.coinTrayLed, "out");

        // //Indításkor az ajtó nyitva volt-e
        // var doorOpen = this.door.readSync() == 1;
        // var log = new Log();
        // log.logType = doorOpen == 1 ? LogType.doorOpen : LogType.doorClose;
        // log.description = doorOpen == 1 ? "Indítás: ajtó nyitva" : "Indítás: ajtó zárva";
        // log.Add();



        // this.door.watch(debounce((err, level) => {

        //   // console.log(level);

        //   if (level == 1) {
        //   } else {

        //     // hopper.DropAllCoinOut().then((coinCount) => {

        //     //   console.log("coinCount", coinCount);
        //     // });
        //     //appControl.TossACoinToYourWitcher();

        //   }


        // }, 100));



        /** Hopper events */
        this.hopper.on("emptyAlert", () => {
          this.CreateLog("Kiürült a hopper! Nem tud érmét kiadni!", LogType.hopperEmpty);
        });;


        this.hopper.on("lowLevelAlert", () => {
          this.CreateLog( "Kevés van a hopper érzékelő szerint!", LogType.hopperLowLevel);
        });

        this.hopper.on("rawOutputError", async (data) => {

          try {
            var err = new Beans.Error();
            err.errorType = Beans.ErrorType.stuck;
            err.description = data.message;
            await this.daoCtx.Add(err);

            this.CreateLog(data.message, LogType.error);

            this.emit("rawError", err);

          } catch (error) {
            //console.log(error);
            // már van ilyen bejegyzés vélhetően akkor nem írunk be újat
          }

        });


        this.pos.on("error", (err) => {
          
          this.CreateLog(err.message);
        });

        this.pos.on("paid", debounce(() => {

          this.TossACoinToYourWitcher().then(() => {
            this.pos.Passed();

            if (this.coinCount > 0 && this.settings.hopper == "Hopper") {
              this.pos.SetEnabled(true);
            }

            this.CreateLog("Érme eladás", LogType.sales);
          }).catch((reason) => {
            this.pos.NotPassed();
            // var log = new Log();
            // log.logType = LogType.error;
            // log.description = "Érme eladás sikertelen: " + reason.message;
            // log.Add();
          });
        }, 100));

        
        

        this.SendDataContinuousStart();


        try {

          await this.pos.Init();
          resolve(true);
        } catch (err) {
        }

      } catch (reason) {
        if (reason.code == 'ECONNREFUSED' || reason.code == "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
          //
        }

        console.error("Sikertelen adatbázis kapcsolódás: ", reason);
        reject(reason);
      }

    });

  }

  TossACoinToYourWitcher() {
    return new Promise(async (resolve, reject) => {

      if (await this.HasErrors()) {
        reject(new Error("Hibák vannak a gépben!"));
        return;
      }

      if (this.coinCount > 0) {

        //how many coins did the hopper dropped?
        var coinDropTimeout = undefined;
        var coinCount = 0;
        var instance = this;

        var coinTimeoutContext = this.coinTimeoutContext;
        // var coinTrayLed = this.coinTrayLed;

        function coinDrop() {

          //turn off coin tray led
          // try {
          //   coinTrayLed.writeSync(0);
          // } catch (error) {

          // }

          coinCount++;

          console.log("Érme kidobva ", coinCount);

          if (coinDropTimeout != undefined) {
            clearTimeout(coinDropTimeout);
            coinDropTimeout = undefined;
          }

          coinDropTimeout = setTimeout(() => {
            instance.hopper.removeListener("coinDrop", coinDrop);

            if (coinCount > 1) {
              
              this.CreateLog(`Egy fizetésre ${coinCount} érme került ki a szenzor szerint`);
            }

            // //turn coin tray led on for 5 seconds
            // try {
            //   coinTrayLed.writeSync(1);

            //   coinTimeoutContext(() => {

            //     try {
            //       coinTrayLed.writeSync(0);

            //     } catch (error) {

            //     }

            //   }, 5000);

            // } catch (error) {

            // }



          }, 100);
        }

        if (this.settings.hopper == "HopperMH245CA") {
          this.hopper.once("coinDrop", coinDrop);
        } else {
          this.hopper.on("coinDrop", coinDrop);
        }


        this.hopper.TossACoinToYourWitcher().then(() => {
          this.coinCount -= coinCount;
          this._SetCoinCount(instance.coinCount);
          resolve(true);
        }).catch((reason) => {
          //Üres a hopper
          // this._SetCoinCount(0);
          reject(reason);
        });
      } else {
        this._SetCoinCount(0);
        //@TODO notify email and log 
        var e = new Error("Kiürült a hopper számláló szerint! Nem tud érmét kiadni!");
        this.CreateLog(e.message, LogType.hopperEmpty);
        reject(e);

      }
    });
  }

  async FillUpHopper(coinCount) {
    //Get the current coinCount from the coin db
    var beforeFill = this.coinCount;
    var salesAfterLastFill = 0;
    var salesCount = await this.GetSalesCount();

    try {
      var sales = await this.daoCtx.GetRows("SELECT COUNT(id) AS salesAfterLastFill FROM log WHERE createDate > IFNULL((SELECT createDate FROM log WHERE logType = 'fillUp' ORDER BY id DESC LIMIT 1), '2020-01-01') AND logType = 'sales';");
      salesAfterLastFill = sales[0].salesAfterLastFill;
    } catch (error) {

    }

    this.coinCount += coinCount;

    this.CreateLog(`Feltöltés ${coinCount} darab érmével. Számláló: ${salesCount} Feltöltés előtt: ${beforeFill}. Feltöltés után: ${this.coinCount}. Utolsó feltőltés előtt eladott darabszám: ${salesAfterLastFill}`
      , LogType.fillUp);

    this._SetCoinCount(this.coinCount);
  }

  EmptyHopper() {
    return new Promise((resolve, reject) => {

      this.hopper.once("coinCount", (coinCount) => {
        this._SetCoinCount(0);
        this.emit("coinCount", coinCount);
      })

      this.hopper.DropAllCoinOut().then((start) => {
        resolve(true);

      }).catch((reason) => {
        console.log(reason);
        reject(reason);
      });

    });
  }

  _SetCoinCount(coinCount) {

    if (isNaN(coinCount)) {
      return;
    }

    this.coinCount = coinCount;
    this.daoCtx.Get(Setting, { name: "coinCount" }).then((s) => {
      s.value = this.coinCount;
      this.daoCtx.Update(s);
    }).catch(() => {
      var s = new Setting();
      s.name = "coinCount";
      s.value = this.coinCount;
      this.daoCtx.Add(s);
    });

    this.settings.coinCount = coinCount;

    if (this.coinCount < Config.coinAlertLevel) {
      //@TODO coinCount below x need to send mail
    }

    if (this.coinCount < 1) {
      //@TODO hopper is empty need to send mail

      this.pos.SetEnabled(false);

    }

    this.InfoChange();

  }

  async GetSystemInfo(){
    var s = {package: pjson};
    s.settings = Object.assign(this.settings);
    var salesCount = await this.GetSalesCount();
    var salesCountAfterLastFillUp = await this.GetSalesAfterLastFillUp();
    s.salesInfo = { coinCount: this.coinCount, salesCount: salesCount, salesCountAfterLastFillUp: salesCountAfterLastFillUp};
    return s;
  }

  async InfoChange() {
   
    var s = this.GetSystemInfo();

    this.emit("infoChange", s);

  }


  SendDataContinuousStart() {
    if (this.isSendContinuous) {
      return;
    }
    this.isSendContinuous = true;
    this.SendDataContinuous();
  }

  SendDataContinuousStop() {
    this.isSendContinuous = false;
  }

  SendDataContinuous(rowCount) {

    var _this = this;
    if (rowCount == null) {
      rowCount = 50
    }

    this.daoCtx.GetList(Log, { isSent: 0 }, null, { rowCount: rowCount }).then((dataRows) => {
      var dataCount = dataRows.length;

      if (dataCount > 0 && _this.isSendContinuous) {
        _this.SendData().then((count) => {
          if (count == 0) {
            //befejeződött
            _this.isSendContinuous = false;
            return;
          }
          setTimeout(() => {

            _this.SendDataContinuous();
          }, 5000);
        }).catch((reason) => {
          //hibára futott a beküldés
          _this.isSendContinuous = false;
        });

      }

      if (dataCount == 0) {
        _this.isSendContinuous = false;
      }



    });


  }


  SendData(rowCount = null) {
    if (rowCount == null) {
      rowCount = 50;
    }

    return new Promise((resolve, reject) => {
      this.daoCtx.GetList(Log, { isSent: 0 }, null, { rowCount: rowCount }).then((dataRows) => {

        if (dataRows.length == 0) {
          resolve(dataRows.length);
        }


        this.service.post({ path: "/api/Control/CityMedia/Telemetry/Telemetry/AddTelemetryData", headers: { Authorization: this.authorizationString }, timeout: 40000 }, { data: dataRows }).then(data => {
          console.log((new Date()).toLocaleString(), "adatbeküldés sikeres");
          dataRows.forEach(element => {
            element.isSent = 1;
            this.daoCtx.Update(element);
          });

          resolve(dataRows.length);

        }).catch(error => {
          var message = error.message;
          if (error.response) {
            message = JSON.parse(error.response.text).error_description;

          }
          console.log((new Date()).toLocaleString(), "adatbeküldés sikertelen", message);
          // this.SendDataResult(dataRows.length, error);
          reject(error, dataRows.length);
        });

      }).catch(error => {
        //@todo
        reject(error);
      });
    });

  }

  UserLoggedIn() {
    return this.api.UserLoggedIn();
  }

  /**
   * Lekéri az összes eddigi értékesítést
   * @returns float
   */
  GetSalesCount() {
    return new Promise(async (resolve, reject) => {
      try {
        var qty = await this.daoCtx.GetRows("SELECT COUNT(id) AS qty FROM log WHERE logType = 'sales';");
        resolve(qty[0].qty);
      } catch (error) {
        reject(error)
      }
    });
  }

  /**
   * Lekéri az összes eddigi értékesítést az utolsó feltöltés óta
   * @returns float
   */
  GetSalesAfterLastFillUp() {
    return new Promise(async (resolve, reject) => {
      try {
        var qty = await this.daoCtx.GetRows("SELECT COUNT(id) AS qty FROM log WHERE createDate > IFNULL((SELECT createDate FROM log WHERE logType = 'fillUp' ORDER BY id DESC LIMIT 1), '2020-01-01') AND logType = 'sales';");
        resolve(qty[0].qty);
      } catch (error) {
        reject(error)
      }
    });

  }

  /**
   * Lekéri az adatbázisból a beállítások táblát
   * @returns Setting[]
   */
  async GetSettings() {
    let settings = (await this.daoCtx.GetList(Setting, {}))

    var ret = {};
    for (var o of settings) {
      ret[o.name] = o.value;
    }
    return ret;
  }

  /**
   * Lekéri az adatbázisból a hibabejegyzéseket
   * @returns Error[]
   */
  async GetErrors() {
    let errors = (await this.daoCtx.GetList(Beans.Error, {}));

    return errors;
  }

  /**
   * Vannak-e hibák amik a működést akadályozzák
   * @returns boolean
   */
  async HasErrors() {
    let errors = (await this.GetErrors())

    return errors.length > 0;
  }

  /**
   * Kitörli az összes hibát a gépből
   */
  async DeleteErrors() {
    var errors = await this.daoCtx.GetList( Error, {});

    var hasRollError = errors.find((o) => {
      return o.errorType = "notRolled";
    });

    if (hasRollError) {
      this.hopper.SetRolled(true);
    }

    for (var err of errors) {
      await this.daoCtx.Delete(err);
    }

    // if (this.settings.hopper == "HopperMH245CA") {
    //   this.hopper.SetRolled(true);
    // }

  }

  async SaveSettings(data) {

    for (var i in data) {
      let setting = await this.daoCtx.Get(Setting, { name: i });
      setting.value = data[i];
      if(this.settings[i]){
        this.settings[i] = data[i];
      }
      await this.daoCtx.Update(setting);
    }

    return this.settings;

  }


}

let controller = global.controller;

if (!controller) {
  controller = new ApplicationController(Dao);
  controller.Init();
}


module.exports = {
  ApplicationController: ApplicationController,
  AppControlInstance: controller
}