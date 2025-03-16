

const Serial = require('serialport').SerialPort;
const Transform = require("stream").Transform;
const EventEmitter = require("events").EventEmitter;


const ENABLE_GPIO = process.env.ENABLE_GPIO || 0;
if (ENABLE_GPIO) {
    const Gpio = require('onoff').Gpio;
}

const MoneraCommands = {
    PASSED: "PASSED",
    NOTPASSED: "NOTPASSED"
}


class MoneraParser extends Transform {
    constructor() {
        super();

        this.incomingData = Buffer.alloc(0);
    }

    _transform(chunk, encoding, cb) {
        // chunk is the incoming buffer here
        //console.log("chunk", chunk);

        //   this.incomingData = Buffer.concat([this.incomingData, chunk]);
        //   console.log(this.incomingData);

        if (this.incomingData.toString("utf-8") == "PAID") {
            this.push(this.incomingData); // this replaces emitter.emit("data", incomingData);
        }

        cb();
    }

    _flush(cb) {
        this.push(this.incomingData);
        this.incomingData = Buffer.alloc(0);
        cb();
    }
}

/**
 * Monera POS payment receiver
 * Notifies via serial com port about the payment received
 * The message is "PAID"
 */
class Monera extends EventEmitter {
    /**
     * 
     * @param {soros György port pl.: '/dev/ttyAMA0'} devicePort 
     * @param {@default 9600} baudRate 
     * @param {@default 8} dataBits 
     * @param {@default 1} stopBits 
     */
    constructor(devicePort = "/dev/ttyAMA0", baudRate = 9600, dataBits = 8, stopBits = 1) {
        super();


        this.serial = new Serial({
            path: devicePort,
            autoOpen: false,
            baudRate: baudRate,
            dataBits: dataBits,
            stopBits: stopBits
        });

        this.parser = new MoneraParser();
        this.serial.pipe(this.parser);

        // this.parser.on('data', function(data) {
        //     console.log("rec", data);
        // });


        this.eventEmitter = null;
    }

    Init() {
        return new Promise((resolve, reject) => {
            var instance = this;

            this.serial.open(function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                instance.serial.on("data", function (data) {
                    if (data.toString("utf-8") == "PAID") {
                        instance.emit("paid", {});
                    }
                });
                resolve(true);

            });

        });

    }

    SetEnabled(isEnabled) {
        //dunno
        return;
    }

    Passed() {
        return this._SendCommand(MoneraCommands.PASSED);
    }

    NotPassed() {
        return this._SendCommand(MoneraCommands.NOTPASSED);
    }

    _SendCommand(cmd) {
        return new Promise((resolve, reject) => {

            this.serial.write(cmd, (err, bytesWritten) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(true);
            });

        });
    }


}


/**
 * Nayax POS payment receiver
 * Notifies via gpio about the payment received
 * Init: GPIO08 set to high
 * The message is 200ms H impulse on GPIO25
 */
class Nayax extends EventEmitter {
    /**
     * 
     * @param {soros György port pl.: '/dev/ttyAMA0'} devicePort 
     * @param {@default 9600} baudRate 
     * @param {@default 8} dataBits 
     * @param {@default 1} stopBits 
     */
    constructor(enableGpio = 8, watchGpio = 25) {
        super();
        this.isEnabled = true;

        if (ENABLE_GPIO) {
            this.enableGpio = new Gpio(8, "out");
            this.watchGpio = new Gpio(25, "in", "both");
        }

    }

    Init() {
        var startHrTime = undefined;
        return new Promise((resolve, reject) => {

            this.SetEnabled(true);
            if (ENABLE_GPIO) {
                this.watchGpio.watch((err, value) => {
                    if (err) {
                        return;
                    }

                    if (!this.isEnabled) {
                        return;
                    }


                    if (value == 1) {
                        //Kiesett egy érme
                        //Azért vizsgálunk 1-est, hogy a felfutó élre dobja ki az érmét -----|_|--
                        // this.emit("coinDrop", {});

                        //egy másodpercnél nem lehet tovább kinn a jel ezen a gpio-n (egyébként egy bogár van az érzékelő előtt)
                        // bugWatcher = setTimeout(() => {
                        //     if(this.gpios.rawOutput.readSync() == 1){
                        //         var message = "A kidobásérzékelő több mint 1 másodperce jelez! Lehetséges elakadás!";
                        //         console.log(new Date().toLocaleString(), message);
                        //         this.emit("rawOutputError", {message: message});
                        //     }
                        // }, 1000);

                        if (startHrTime) {

                            var endTime = process.hrtime(startHrTime);
                            var endTimeMs = endTime[0] * 1000 + endTime[1] / 1000000
                            let lowerLimitMs = 80;
                            let upperLimitMs = 120;

                            console.log(new Date().toLocaleString(), `Nayax fizetés ${endTimeMs} ms`);
                            if (endTimeMs > lowerLimitMs && endTimeMs < upperLimitMs) {
                                this.SetEnabled(false);
                                this.emit("paid", {});
                            } else {
                                var message = `Nayax fizetés ${endTimeMs} ms időintervallumon (${lowerLimitMs} - ${upperLimitMs} ms) kívül!`;
                                this.emit("error", { message: message });
                            }
                            startHrTime = undefined;
                        }

                    } else {
                        startHrTime = process.hrtime();
                        // if(bugWatcher){
                        //     clearTimeout(bugWatcher);
                        //     bugWatcher = undefined;
                        // }
                    }


                });
            }

            resolve(true);

        });

    }

    SetEnabled(isEnabled) {
        this.isEnabled = isEnabled;
        if (ENABLE_GPIO) {
            this.enableGpio.writeSync(isEnabled ? 1 : 0);
        }
    }

    Passed() {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }

    NotPassed() {
        return new Promise((resolve, reject) => {
            resolve(true);

        });
    }
    ;


}



module.exports = {
    Monera: Monera
    , Nayax: Nayax
}