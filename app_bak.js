var express = require("express");
const bodyParser = require("body-parser");

const ApplicationController = require("./ApplicationController.js").ApplicationController;
const pages = require("./page.js");

const Utils = require("@mhzq/mhzqframework").System.Objects.Utils;

express = express();

//save currently running config file
Config.save();

var appControl = new ApplicationController();

function init() {

    appControl.Init().then(async () => {

        const ioClient = require("socket.io-client");
        var socket = ioClient("http://citymedia.synology.me:40005", { query: { room: Config.serialNumber } });

        socket.on("update", async (data, cb) => {

            try {
                await appControl.UpdateApp();
                if (cb != null) cb({ status: "OK", data: data });
            } catch (error) {
                if (cb != null) cb(null, { message: error.message });
            }

        });

        socket.on("tossACoinToYourWitcher", (data, cb) => {
            //console.log(data);

            appControl.TossACoinToYourWitcher().then(() => {
                if (cb != null) cb({ status: "OK" });
            }).catch((reason) => {
                if (cb != null) cb(null, { message: reason.message });
            });

        });

        socket.on("emptyHopper", (data, cb) => {
            appControl.EmptyHopper().then(() => {
                if (cb != null) cb({ status: "OK" });
            }).catch((reason) => {
                if (cb != null) cb(null, { message: reason.message });
            });
        });

       

        socket.on("fillUpHopper", (data, cb) => {
            appControl.FillUpHopper(data.coinCount);
            if (cb != null) cb({ status: "OK" });

        });

        socket.on("restart", (data, cb) => {
            appControl.Restart().then((data) => {
                if (cb != null) cb({ status: "OK", data: data });
            }).catch((reason) => {
                if (cb != null) cb(null, { message: reason.message });
            });

        });

        socket.on("updateApp", (data, cb) => {
            appControl.UpdateApp().then((data) => {
                if (cb != null) cb({ status: "OK", data: data });
            }).catch((reason) => {
                if (cb != null) cb(null, { message: reason.message });
            });

        });

        socket.on("getInfo", (data, cb) => {
            appControl.InfoChange();

        });

        socket.on("getErrors", async (data, cb) => {
            var errors = await appControl.GetErrors();
            if (cb != null) cb({ status: "OK", data: errors });

        });

        socket.on("deleteErrors", async (data, cb) => {
            try{

                await appControl.DeleteErrors();
                if (cb != null) cb({ status: "OK" });
            } catch(reason){
                if (cb != null) cb(null, { message: reason.message });
            }
        });



        appControl.on("infoChange", (data) => {
            socket.emit("infoChange", data);
        });

        appControl.on("coinCount", (data) => {

            socket.emit("coinCount", data);
        });

        appControl.on("rawError", (data) => {

            socket.emit("rawError", data);
        });

        // setInterval(() => {
        //     var err = new Beans.Error();
        //     err.errorType = Beans.ErrorType.stuck;
        //     err.description = "A kidobásérzékelő időintervallumon (50 - 140 ms) kívül! Lehetséges elakadás!";
        //     socket.emit("rawError", err)
        // }, 30000);


    }).catch((reason) => {
        console.log((new Date).toLocaleString(), reason);
        setTimeout(init, 5000);
    });

}
init();


express.use(bodyParser.urlencoded({ extended: true }));
express.use(bodyParser.json());

var fs = require('fs');


express.get(/.*/, function (req, res) {

    var path = req.path;
    var dir = __dirname;

    dir = dir.split("/");

    dir.pop();

    dir = dir.join("/");


    path = Config.path(path);

    path = path.split("/");

    path = path.join("/");


    if (path.length == 0) {
        path = "/index.html";
    }



    //any file like css, js, jpeg
    fs.access(dir + path, fs.F_OK, function (err) {
        if (err) {

            var className = path.substring(2).replace(".html", "");

            className = path[1].toUpperCase() + className;

            if (Object.keys(pages).indexOf(className) > -1) {

                var pageClass = pages[className];

                try {
                    var page = new pageClass(req, res, appControl);
                    page.GetContent().then((content) => {
                        res.send(content);
                    }).catch((err) => {
                        res.status(500).end();
                    });
                } catch (err) {
                    console.log("Error", err.message);
                }



            } else {
                res.status(404).end();
            }




        } else {
            res.sendFile(dir + path);
        }
    });


}
);

express.post(/.*/, function (req, res) {


    var path = req.path.replace("/api/", "");



    path = path.replace("//", "");
    if (Utils.IsFunction(appControl.api[path])) {

        appControl.api[path].apply(appControl.api, [res, req.body])
    } else {
        res.status(404).end();
    }
}
);

var server = express.listen(8080, '0.0.0.0', () => {
    console.log(`CityMediaCoinMachine app listening on port 8080!`)


});

var connections = [];


var io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
}) //require socket.io module and pass the http object (server)

io.sockets.on('connection', function (socket) {// WebSocket Connection

    console.log("Connected " + socket.handshake.address);

    connections.push(socket);

    socket.on('disconnect', function () {


        var i = connections.indexOf(socket);
        if (i > -1) {
            connections.splice(i, 1);

            console.log("Disconnected " + this.handshake.address);
        }

    });


    appControl.on("coinCount", (data) => {

        socket.emit("coinCount", data);
    });

    appControl.on("error", (data) => {

        socket.emit("error", data);
    });

});





process.on("SIGINT", () => {
    try {

        appControl.powerOnLed.writeSync(0);
        appControl.powerOnLed.unexport();
        appControl.coinTrayLed.unexport();
        appControl.door.unexport();
    } catch (error) {

    }
})