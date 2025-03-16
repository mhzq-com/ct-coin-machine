const express = require("express");
const session = require("express-session");
const http = require("http");
const next = require("next");
const socketio = require('socket.io');
const multer = require("multer");
const upload = multer({ dest: 'uploads/' })
const cors = require("cors");
const {ApplicationController, AppControlInstance} = require("./ApplicationController.js");

const port = 8080;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

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


        app.all('*', (req, res) => nextHandler(req, res));


        server.listen(port, () => {
            console.log(`> Ready on http://localhost:${port}`);
        });
    });
// }

// )
