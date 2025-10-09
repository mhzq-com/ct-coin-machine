
const Dao = require("./db.js");
const fs = require("fs");
const path = require("path");
const { exec, spawn } = require("child_process");
const EventEmitter = require("events").EventEmitter;

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

function timestamp() {
  return new Date().toISOString();
}

// Segédfv: sorokra bontva timestamp-et írunk a logba (és konzolra).
function writeWithTimestamp(stream, text) {
  if (!text) return;
  // biztos, hogy string
  const s = text.toString();
  // ha több sor érkezik egyszerre, mindet prefixeljük
  const lines = s.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length === 0) continue;
    stream.write(`${timestamp()} ${lines[i]}\n`);
  }
}

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


  Login(response, data) {


    fetch(`${this.settings.url}/Control/Authentication/Authenticate/Login`
      , {
        method: "POST"
        , headers: { "Content-Type": "application/json" }
        , body: JSON.stringify({ user: data.user, password: data.password, companyId: this.settings.companyId })
      }
    ).then(data => {

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

    this.api = new Api(this);

    this.coinTimeoutContext = setTimeoutContext();

  }


  async Login(data, response) {

    try {
      var res = await fetch(this.settings.url + "/Control/Authentication/Authenticate/Login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
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


        //send the access token to the client inside a cookie
        const now = new Date();
        const plus30 = new Date(now.getTime() + 3600 * 1000 * 1);

        //send the access token to the client inside a cookie
        response.cookie("jwt", accessToken, {
          // secure: true
          // , httpOnly: true
          // ,path: "/"
          expires: plus30
        });

        this.CreateLog(`${user.name} bejelentkezett`, Beans.LogType.info);

        return user;


      } else {
        res = await res.json();
        throw new Error(res.error_description);
      }

    } catch (error) {
      throw error;
    }



  }


  async LoginWithPin(req, response) {
    var pwd = crypto.createHash('sha256').update(req.body.password).digest('hex');

    var data = await this.daoCtx.Get(Setting, { name: "pin" });
    if (pwd == data.value) {
      var user = { id: 1, name: "administratorPin" };
      let payload = { user: user.name };

      //create the access token with the shorter lifespan
      let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        //expiresIn: process.env.ACCESS_TOKEN_LIFE
      })

      const now = new Date();
      const plus30 = new Date(now.getTime() + 3600 * 1000 * 1);

      //send the access token to the client inside a cookie
      response.cookie("jwt", accessToken, {
        // secure: true
        // , httpOnly: true
        // ,path: "/"
        expires: plus30
      });

      this.CreateLog(`${user.name} bejelentkezett pin kóddal`, Beans.LogType.info);

      return user;


    } else {
      response.status(401);
      response.json({ error_description: "Hibás pin" });
    }


  }

  async Logout(request, response) {
    response.cookie("jwt", "");
    this.CreateLog(`Kijelentkezett`, Beans.LogType.info);
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

  async GetStat(data, res) {


    var logs = await this.daoCtx.GetRows(`SELECT * FROM log
WHERE 1
AND DATE(createDate) >= ?
AND DATE(createDate) <= ?
AND logType = 'sales'`, [data.dateFrom, data.dateTo]);

    logs = logs.map((o) => {
      o.createDate = o.createDate.toLocaleString();
      return o;
    });

    var sum = await this.daoCtx.GetRows(`SELECT COUNT(*) AS quantity, SUM(COALESCE(grossPrice, 1200)) AS grossAmount FROM log
WHERE 1
AND DATE(createDate) >= ?
AND DATE(createDate) <= ?
AND logType = 'sales'`, [data.dateFrom, data.dateTo]);

    data = [...logs, ...sum];

    return data;
  }

  /**
   * Restarts the raspberry
   */
  Restart(timeout = 5) {
    return new Promise((resolve, reject) => {

      resolve(`Újraindítás ütemezve ${timeout} mp múlva`);
      setTimeout(() => {
        const cmd = spawn("sudo", ["/sbin/reboot"]);

        cmd.stdout.on("data", data => console.log("stdout:", data.toString()));
        cmd.stderr.on("data", data => console.log("stderr:", data.toString()));
        cmd.on("error", err => console.error("Reboot error:", err));

      }, timeout * 1000);

      // var cmd = new Command("sudo shutdown", ["-r", "-t", "5"]);
      // cmd.exec(function (err, stdout, stderr) {
      //   if (err) {
      //     reject(err);
      //     return;
      //   }

      //   resolve(stdout);
      // });
      // exec(`sudo shutdown -r +5`, (error, stdout, stderr) => {
      //   if (error) {
      //     console.error(`Hiba: ${error.message}`);
      //     reject(new Error(error.message));
      //     return;
      //   }
      //   if (stderr) {
      //     console.error(`Stderr: ${stderr}`);
      //     reject(new Error(stderr));
      //     return;
      //   }
      //   console.log(`Újraindítás sikeres: ${stdout}`);
      //   resolve(true);
      // });
    });


  }


  /**
   * Shuts down the raspberry
   */
  Shutdown(timeout = 5) {
    return new Promise((resolve, reject) => {
      // var cmd = new Command("sudo shutdown", ["-t", "5"]);
      // cmd.exec(function (err, stdout, stderr) {
      //   if (err) {
      //     reject(err);
      //     return;
      //   }

      //   resolve(stdout);
      // });
      exec(`sudo shutdown -t 5`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Hiba: ${error.message}`);
          reject(new Error(error.message));
          return;
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          reject(new Error(stderr));
          return;
        }
        console.log(`Leállítás sikeres: ${stdout}`);
        resolve(true);
      });
    });


  }



  /**
   * Uptates the application
   */
  UpdateApp() {

    var updateScriptPath = path.join(process.cwd(), `/System/update.${process.platform === "win32" ? "bat" : "sh"}`);

    return new Promise((resolve, reject) => {

      // Nyissuk meg a log fájlt append módban
      const logStream = fs.createWriteStream(path.join(process.cwd(), "update.log"), { flags: "a" });
      logStream.on("error", (err) => {
        console.error("Log fájl írási hiba:", err);
      });

      writeWithTimestamp(logStream, `--- UPDATE START ---`);
      writeWithTimestamp(logStream, `Running script: ${updateScriptPath}`);

      const child = spawn("bash", [updateScriptPath], {
        shell: true, // kell a .sh vagy .bat futtatásához
        env: {
          ...process.env,
          GIT_TOKEN: process.env.GIT_TOKEN, // továbbadjuk az env változót
        },
      });



      child.stdout.on("data", (data) => {
        const text = data.toString();
        this.emit('updateProgress', { type: "stdout", data: text });
        writeWithTimestamp(logStream, text);

      });

      child.stderr.on("data", (data) => {
        const text = data.toString();
        this.emit('updateProgress', { type: "stderr", data: text });
        writeWithTimestamp(logStream, `STDERR: ${text}`);
      });

      child.on("error", (err) => {
        this.emit('updateProgress', { type: "error", data: err.message });
        writeWithTimestamp(logStream, `ERROR: ${err.message}`);
        logStream.end(`${timestamp()} child error\n`);
        reject(err);
      });

      child.on("close", (code, signal) => {
        writeWithTimestamp(logStream, `--- UPDATE END --- Exit code: ${code} ${signal ? `Signal: ${signal}` : ""}`);
        logStream.end(); // lezárjuk a logot
        if (code === 0) {
          this.emit('updateProgress', { type: "stdout", data: "✅ Frissítés sikeres!" });
          console.log("✅ Frissítés sikeres!");
          resolve("✅ Frissítés sikeres!");
        } else {
          this.emit('updateProgress', { type: "stderr", data: `Frissítés hibával leállt (exit code: ${code})\n${output}` });
          reject(new Error(`Frissítés hibával leállt (exit code: ${code})\n${output}`));
        }
      });
    });

    // return new Promise((resolve, reject) => {
    //   // var cmd = new Command("npm", ["install", "--prefix", "/home/pi", "@mhzq/citymedia-coin-machine"]);
    //   // cmd.exec(function (err, stdout, stderr) {
    //   //   if (err) {
    //   //     reject(err);
    //   //     return;
    //   //   }

    //   //   resolve(stdout);
    //   // });

    //   // var updateScriptPath = path.join(__dirname, "update-script.sh");
    //   exec(`${updateScriptPath}`, (error, stdout, stderr) => {
    //     if (error) {
    //       console.error(`Hiba: ${error.message}`);
    //       reject(new Error(error.message));
    //       return;
    //     }
    //     if (stderr) {
    //       console.error(`Stderr: ${stderr}`);
    //       reject(new Error(stderr));
    //       return;
    //     }
    //     console.log(`Frissítés sikeres: ${stdout}`);
    //     resolve(true);
    //   });
    // });


  }

  CreateLog(description, errorLevel = Beans.LogType.error) {
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
          console.log(error);
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



        /** Hopper events */
        this.hopper.on("emptyAlert", () => {
          this.CreateLog("Kiürült a hopper! Nem tud érmét kiadni!", LogType.hopperEmpty);
        });;


        this.hopper.on("lowLevelAlert", () => {
          this.CreateLog("Kevés van a hopper érzékelő szerint!", LogType.hopperLowLevel);
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

            var sl = new Beans.Log();
            sl.grossPrice = parseFloat(this.settings.coinPrice);
            sl.description = "Érme eladás"
            sl.logType = LogType.sales;
            this.daoCtx.Add(sl);
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

        this.emit("initEnd");

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

    this.coinCount += parseFloat(coinCount);

    this.CreateLog(`Feltöltés ${coinCount} darab érmével. Számláló: ${salesCount} Feltöltés előtt: ${beforeFill}. Feltöltés után: ${this.coinCount}. Utolsó feltőltés előtt eladott darabszám: ${salesAfterLastFill}`
      , LogType.fillUp);

    this._SetCoinCount(this.coinCount);

    return this.coinCount;
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

    if (this.settings.coinAlertLevel > 0 && this.coinCount < this.settings.coinAlertLevel) {
      //@TODO coinCount below x need to send mail
    }

    if (this.coinCount < 1) {
      //@TODO hopper is empty need to send mail

      this.pos.SetEnabled(false);

    }

    this.InfoChange();

  }

  async GetSystemInfo() {
    var s = { package: pjson };
    s.settings = Object.assign(this.settings);
    var salesCount = await this.GetSalesCount();
    var salesCountAfterLastFillUp = await this.GetSalesAfterLastFillUp();
    s.salesInfo = { coinCount: this.coinCount, salesCount: salesCount, salesCountAfterLastFillUp: salesCountAfterLastFillUp };
    return s;
  }

  async InfoChange() {

    var s = await this.GetSystemInfo();

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


        fetch(`${this.settings.url}/Control/CityMedia/Telemetry/Telemetry/AddTelemetryData`, {
          method: "POST"
          , headers: {
            Authorization: this.authorizationString
            , "Content-Type": "application/json"
          }
          , body: JSON.stringify({ data: dataRows })
        }
        ).then(data => {
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
    var errors = await this.daoCtx.GetList(Error, {});

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
      if(i == "pin"){
        data[i] = crypto.createHash('sha256').update(data[i]).digest('hex');
        //0eb1598c2177c525be55821a360741593a0a7d2137e1ad5c38d2e32c3a54df4b
      }
      setting.value = data[i];
      if (this.settings[i]) {
        this.settings[i] = data[i];
      }
      await this.daoCtx.Update(setting);
    }

    this.authorizationString = "Bearer " + this.settings.token.substr(0, 36) + "_" + this.settings.serialNumber;

    return this.settings;

  }


  async GetCompanyList() {
    var res = await fetch(`${this.settings.url}/DI/Model/Entity/Administration/CompanyManagement/Com_Company/GetObjectList/`
      , {
        method: "POST"
        , headers: {
          Authorization: this.authorizationString
          , "Content-Type": "application/json"
        }
      }
    );
    if (res.ok) {
      return await res.json();
    }
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