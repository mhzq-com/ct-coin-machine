require("dotenv").config();
const express = require("express");
const session = require("express-session");
const http = require("http");
const next = require("next");
const socketio = require('socket.io');
const socketioClient = require("socket.io-client");
const multer = require("multer");
const upload = multer({ dest: 'uploads/' })
const cors = require("cors");
const {ApplicationController, AppControlInstance} = require("./ApplicationController.js");

const port = 8080;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

function initializeSocketClient(settings){
    
    
    // var socket = socketioClient(settings.socketUrl, { query: { room: settings.serialNumber } });
    var socket = socketioClient(settings.socketUrl);

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

    socket.on("connect", () => {
        socket.emit("joinRoom", {room: settings.serialNumber, isMachine: true});
    });



    appControl.on("infoChange", (data) => {
        socket.emit("infoChange", data);
    });

    appControl.on("coinCount", (data) => {

        socket.emit("coinCount", data);
    });

    appControl.on("updateProgress", (data) => {

        socket.emit("updateProgress", data);
    });

    appControl.on("rawError", (data) => {

        socket.emit("rawError", data);
    });
}

var appControl = AppControlInstance;

// appControl.Init().then(() => {

    nextApp.prepare().then(async () => {
        const app = express();
        app.use(cors({
            origin: [/(http|https)\:\/\/.*/],
        }));
        app.use(async function (req, res, next) {
            req.db = appControl.daoCtx;
            req.control = appControl;

            next()
        });
        app.use(session({
            secret: "thisismysecrctekeyfhasdfarjiob7fwir767",
            saveUninitialized: true,
            resave: false
        }));
        app.use(express.json());
        app.use(upload.array('file', 10));
        const server = http.createServer(app);
        const io = new socketio.Server();
        io.attach(server);

        io.on('connection', (socket) => {
            console.log("Connected " + socket.handshake.address);

            socket.on('disconnect', function () {

                console.log("Disconnected " + this.handshake.address);

            });




        });

        setInterval(() => {
            io.sockets.emit("timeChange", new Date());
        }, 1000);

        appControl.on("coinCount", (data) => {

            io.sockets.emit("coinCount", data);
        });

        appControl.on("error", (data) => {

            io.sockets.emit("error", data);
        });

        appControl.on("updateProgress", (data) => {

            io.sockets.emit("updateProgress", data);
        });


        app.all('*', (req, res) => nextHandler(req, res));


        server.listen(port, () => {
            console.log(`> Ready on http://localhost:${port}`);
        });

        initializeSocketClient(appControl.settings)
    });
// }

// )
