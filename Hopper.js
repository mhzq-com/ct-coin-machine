const Beans = require("./System/Db/Beans/Entities.js")

const EventEmitter = require("events").EventEmitter;

const ENABLE_GPIO = process.env.ENABLE_GPIO || 0;
if (ENABLE_GPIO) {
    const Gpio = require('onoff').Gpio;
}



const throttle = (func, limit) => {
    let inThrottle
    return function () {
        const args = arguments
        const context = this
        if (!inThrottle) {
            func.apply(context, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
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

const HopperMode = {
    DirectSwitching: "DirectSwitching",
    LogicControl: "LogicControl",
    CoinCounting: "CoinCounting"
};

class HopperAgent extends EventEmitter{
    /**
     * @param ApplicationController controller
     */
    constructor(controller){
        super();
        this.controller = controller;
    }
}

/**
 * TSP079
 */
class Hopper extends HopperAgent {

    constructor(controller, options) {
        super(controller);

        // setInterval(() => {
        //     var message = "A kidobásérzékelő több mint 1 másodperce jelez";
        //     console.log(new Date().toLocaleString(), message);
        //     this.emit("rawOutputError", {message: message});
        // }, 10000);

        var opts = {
            gpio: {
                in1: 23,
                in2: 8,
                in3: 7,
                motor: 20,
                // lowLevelSense: 25,
                securityOutput: 24,
                rawOutput: 18,
                powerOnLed: 16,
                coinTrayLed: 21
            }
        };

        opts = Object.assign(opts, options);

        this.gpios = {};

        if (ENABLE_GPIO) {

            this.gpios.in1 = new Gpio(opts.gpio.in1, "out");
            this.gpios.in2 = new Gpio(opts.gpio.in2, "out");
            this.gpios.in3 = new Gpio(opts.gpio.in3, "out");

            this.gpios.motor = new Gpio(opts.gpio.motor, "out");
            // this.gpios.lowLevelSense = new Gpio(opts.gpio.lowLevelSense, "in", "both");
            this.gpios.rawOutput = new Gpio(opts.gpio.rawOutput, "in", "both");
            this.gpios.securityOutput = new Gpio(opts.gpio.securityOutput, "out");

            this.gpios.powerOnLed = new Gpio(opts.gpio.powerOnLed, "out");
            this.gpios.coinTrayLed = new Gpio(opts.gpio.coinTrayLed, "out");


            /** Actually dropping out a coin */
            this.coinCounting = false;
            this.in3Timeout = undefined;
            this.motorTimeout = undefined;

            // this.gpios.in1.writeSync(0);
            // this.gpios.in1.writeSync(1);
            // this.gpios.in2.writeSync(0);
            // this.gpios.in3.writeSync(0);

            this.SetMode(HopperMode.CoinCounting);

            this.gpios.powerOnLed.writeSync(1);


            // this.gpios.in1.writeSync(1);
            // this.gpios.in2.writeSync(0);
            // this.gpios.in3.writeSync(0);

            /** Check level in the machine */
            // var lowLevel = this.gpios.lowLevelSense.readSync();
            // if (lowLevel == 1) {
            //     setTimeout(() => {

            //         this.emit("lowLevelAlert", {});
            //     }, 100);
            // }

            //@TODO feltöltésig ne vegyük figyelembe
            // this.gpios.lowLevelSense.watch(debounce((err, value) => {
            //     if (err) {
            //         console.log(err);
            //     }
            //     if (value == 1) {
            //         //Kiesett egy érme
            //         console.log("Kevés az érme");

            //         this.emit("lowLevelAlert", {});

            //     }
            // }, 100));

            // var bugWatcher = undefined;

            var startHrTime = undefined;

            this.gpios.rawOutput.watch(
                //debounce(
                (err, value) => {
                    if (err) {
                        console.log(err);
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
                            let lowerLimitMs = 10;
                            let upperLimitMs = 120;
                            console.log(new Date().toLocaleString(), `Érmekidobás ${endTimeMs} ms`);
                            if (endTimeMs > lowerLimitMs && endTimeMs < upperLimitMs) {

                                this.emit("coinDrop", {});
                            } else {
                                var message = `A kidobásérzékelő időintervallumon (${lowerLimitMs} - ${upperLimitMs} ms) kívül! Lehetséges elakadás!`;
                                console.log(new Date().toLocaleString(), message);
                                this.emit("rawOutputError", { message: message });
                            }
                            startHrTime = undefined;
                        } else {
                            var message = `A kidobásérzékelő nincs lefutó él (startHrTime)! Lehetséges elakadás!`;
                            console.log(new Date().toLocaleString(), message);
                            //this.emit("rawOutputError", { message: message });
                        }

                    } else {
                        startHrTime = process.hrtime();
                        // if(bugWatcher){
                        //     clearTimeout(bugWatcher);
                        //     bugWatcher = undefined;
                        // }
                    }
                }
                //, 10)
            );
        }


    }

    /**
     * Drops a coin (to your witcher)
     */
    TossACoinToYourWitcher() {




        return new Promise((resolve, reject) => {

            this.SetMode(HopperMode.CoinCounting).then(() => {

                function coinDrop() {
                    this.gpios.in3.writeSync(0);
                    this.gpios.motor.writeSync(0);

                    this.gpios.coinTrayLed.writeSync(1);

                    setTimeout(() => {

                        this.gpios.coinTrayLed.writeSync(0);
                    }, 5000);

                    if (this.motorTimeout !== undefined) {
                        clearTimeout(this.motorTimeout);
                        delete this.motorTimeout;
                    }

                    //this.removeListener("coinDrop", coinDrop);

                    resolve(true);
                }
                //this.removeAllListeners("coinDrop");
                //this.on("coinDrop", coinDrop);
                this.once("coinDrop", coinDrop);

                this.coinCounting = true;
                this.gpios.in3.writeSync(1);
                this.gpios.motor.writeSync(1);

                if (this.in3Timeout !== undefined) {
                    clearTimeout(this.in3Timeout);
                    delete this.in3Timeout;
                }

                if (this.motorTimeout !== undefined) {
                    clearTimeout(this.motorTimeout);
                    delete this.motorTimeout;
                }

                this.in3Timeout = setTimeout(() => {

                    this.gpios.in3.writeSync(0);

                }, 10);



                /** Runs max 30 seconds */
                this.motorTimeout = setTimeout(() => {
                    this.coinCounting = false;
                    this.gpios.motor.writeSync(0);

                    /** There is no coin in the machine and we didn't noticed! So set to quantity zero + alert */
                    this.emit("emptyAlert", {});

                    reject(new Error("Nincs több érme a hopper motor szerint"));

                }, 60000);
            });
        });

    }

    /**
     * Kidobja az összes érmét
     */
    DropAllCoinOut() {


        return new Promise(async (resolve, reject) => {
            try{
                if(!ENABLE_GPIO){
                    throw new Error("GPIO nincs engedélyezve a környezeti változók között");
                }
                
                await this.SetMode(HopperMode.Reset);
                await this.SetMode(HopperMode.DirectSwitching);

                //starts to count;

                
                this.gpios.motor.writeSync(1);

                var coinCount = 0;

                if (this.motorTimeout !== undefined) {
                    clearTimeout(this.motorTimeout);
                    delete this.motorTimeout;
                }

                function coinDrop() {

                    coinCount++;
                    console.log((new Date()).toLocaleString, `coinCount ${coinCount}`);

                    if (this.motorTimeout !== undefined) {
                        clearTimeout(this.motorTimeout);
                        delete this.motorTimeout;
                    }
                    /** Runs max 30 seconds */
                    this.motorTimeout = setTimeout(() => {


                        console.log((new Date()).toLocaleString(), `motor leállt`);
                        this.coinCounting = false;
                        this.gpios.motor.writeSync(0);

                        this.removeListener("coinDrop", coinDrop);

                        this.emit("coinCount", coinCount);



                    }, 60000);
                };

                this.on("coinDrop", coinDrop);

                /** Runs max 30 seconds */
                this.motorTimeout = setTimeout(() => {


                    console.log((new Date()).toLocaleString(), `motor leállt`);
                    this.coinCounting = false;
                    this.gpios.motor.writeSync(0);

                    this.emit("coinCount", coinCount);

                }, 60000);

                resolve(true);

            }catch(error){
                reject(error);
            }

        });



    }


    /**
     * 
     * @param {string} mode 
     */
    SetMode(mode) {
        return new Promise((resolve, reject) => {
            switch (mode) {
                case HopperMode.DirectSwitching:
                    this.gpios.in1.writeSync(0);
                    this.gpios.in2.writeSync(0);
                    this.gpios.in3.writeSync(1);
                    break;
                case HopperMode.LogicControl:
                    this.gpios.in1.writeSync(1);
                    this.gpios.in2.writeSync(1);
                    this.gpios.in3.writeSync(1);
                    break;
                case HopperMode.CoinCounting:
                    this.gpios.in1.writeSync(0);
                    this.gpios.in2.writeSync(1);
                    this.gpios.in3.writeSync(0);
                    break;
                case HopperMode.Reset:
                    this.gpios.in1.writeSync(1);
                    this.gpios.in2.writeSync(0);
                    this.gpios.in3.writeSync(0);
                default:
                    this.gpios.in1.writeSync(1);
                    this.gpios.in2.writeSync(0);
                    this.gpios.in3.writeSync(0);
                    break;
            }

            setTimeout(() => {
                resolve(true);
            }, 100);
        });

    }

}



/**
 * Préselős érmekiadó gép 
 */
class HopperMH245CA extends HopperAgent {

    constructor(controller, options) {
        super(controller);

        // setInterval(() => {
        //     var message = "A kidobásérzékelő több mint 1 másodperce jelez";
        //     console.log(new Date().toLocaleString(), message);
        //     this.emit("rawOutputError", {message: message});
        // }, 10000);

        var opts = {
            gpio: {
                // in1: 23,
                // in2: 8,
                // in3: 7,
                // motor: 20,
                // lowLevelSense: 25,
                // securityOutput: 24,
                // rawOutput: 18

                power: 20
                , creditRelay: 24
                , hopperEmpty: 25
                , triggerIn: 23
                , rollLed: 21
                , powerOnLed: 16
                , coinDropped: 18
                , coinRoll: 12
            }
        };

        this.isRolled = true;

        opts = Object.assign(opts, options);

        this.gpios = {};

        if (ENABLE_GPIO) {


            this.gpios.power = new Gpio(opts.gpio.power, "out");
            this.gpios.creditRelay = new Gpio(opts.gpio.creditRelay, "in");
            this.gpios.hopperEmpty = new Gpio(opts.gpio.hopperEmpty, "in");
            this.gpios.triggerIn = new Gpio(opts.gpio.triggerIn, "out");

            this.gpios.rollLed = new Gpio(opts.gpio.rollLed, "out");
            this.gpios.powerOnLed = new Gpio(opts.gpio.powerOnLed, "out");
            this.gpios.coinDropped = new Gpio(opts.gpio.coinDropped, "in", "both");
            this.gpios.coinRoll = new Gpio(opts.gpio.coinRoll, "in", "both");


            this.gpios.power.writeSync(1);


            /** Check level in the machine */
            var lowLevel = this.gpios.hopperEmpty.readSync();
            if (lowLevel == 1) {
                setTimeout(() => {

                    this.emit("lowLevelAlert", {});
                }, 100);
            }

            //@TODO feltöltésig ne vegyük figyelembe
            this.gpios.hopperEmpty.watch(debounce((err, value) => {
                if (err) {
                    console.log(err);
                }
                if (value == 1) {
                    //Kiesett egy érme
                    console.log("Kevés az érme");

                    this.emit("lowLevelAlert", {});

                }
            }, 100));



            (async () => {
                var errors = await this.controller.daoCtx.GetList(Beans.Error, { errorType: "notRolled" });
                if (errors.length > 0) {

                    this.SetRolled(false);
                } else {
                    this.SetRolled(true);

                }
            }
            )();

            // var bugWatcher = undefined;

            this.gpios.coinDropped.watch(
                //debounce(
                (err, value) => {
                    if (err) {
                        console.log(err);
                    }
                    if (value == 1) {
                        this.emit("coinDrop", {});

                        // //Kiesett egy érme
                        // //Azért vizsgálunk 1-est, hogy a felfutó élre dobja ki az érmét -----|_|--
                        // // this.emit("coinDrop", {});

                        // //egy másodpercnél nem lehet tovább kinn a jel ezen a gpio-n (egyébként egy bogár van az érzékelő előtt)
                        // // bugWatcher = setTimeout(() => {
                        // //     if(this.gpios.rawOutput.readSync() == 1){
                        // //         var message = "A kidobásérzékelő több mint 1 másodperce jelez! Lehetséges elakadás!";
                        // //         console.log(new Date().toLocaleString(), message);
                        // //         this.emit("rawOutputError", {message: message});
                        // //     }
                        // // }, 1000);

                        // if(startHrTime){

                        //     var endTime = process.hrtime(startHrTime);
                        //     var endTimeMs = endTime[0] * 1000 + endTime[1] / 1000000
                        //     let lowerLimitMs = 10;
                        //     let upperLimitMs = 120;
                        // 	console.log(new Date().toLocaleString(), `Érmekidobás ${endTimeMs} ms`);
                        //     if (endTimeMs > lowerLimitMs && endTimeMs < upperLimitMs) {

                        //         this.emit("coinDrop", {});
                        //     } else {
                        //         var message = `A kidobásérzékelő időintervallumon (${lowerLimitMs} - ${upperLimitMs} ms) kívül! Lehetséges elakadás!`;
                        //         console.log(new Date().toLocaleString(), message);
                        //         this.emit("rawOutputError", { message: message });
                        //     }
                        //     startHrTime = undefined;
                        // } else {
                        //     var message = `A kidobásérzékelő nincs lefutó él (startHrTime)! Lehetséges elakadás!`;
                        //     console.log(new Date().toLocaleString(), message);
                        //     //this.emit("rawOutputError", { message: message });
                        // }

                    } else {
                        // startHrTime = process.hrtime();
                        // // if(bugWatcher){
                        // //     clearTimeout(bugWatcher);
                        // //     bugWatcher = undefined;
                        // // }
                    }
                }
                //, 10)
            );

            var rolled = this.gpios.coinRoll.readSync();
            console.log("rolled", rolled == 1);
            if (rolled == 1) {
                this.SetRolled(true);
            }

            this.gpios.coinRoll.watch(
                //debounce(
                (err, value) => {
                    if (err) {
                        console.log(err);
                    }
                    // console.log(value);
                    if (value == 1) {
                        this.SetRolled(true);


                    } else {

                    }
                }
            );

        }
    }

    async SetRolled(isRolled) {

        this.gpios.rollLed.writeSync(isRolled ? 0 : 1);
        this.gpios.powerOnLed.writeSync(isRolled ? 1 : 0);
        this.isRolled = isRolled;

        this.emit("rolledChange", this.isRolled);

        var errors = await this.controller.daoCtx.GetList(Beans.Error, { errorType: "notRolled" });
        if (!isRolled && errors.length == 0) {

            try {
                //sometimes gives error
                var err = new Beans.Error();
                err.errorType = "notRolled";
                err.description = "Nincs átforgatva az érmekiadó";
                await this.controller.daoCtx.Add(err);

            } catch (error) {

            }

        } else if (isRolled) {
            for (var o of errors) {
                //trycatch bugfix valamiért néha hibát dob hogy sikertelen módosítás (a query result.affectedRows == 0)
                try {
                    await o.Delete();

                } catch (error) {

                }
            }
        }
    }

    /**
     * Drops a coin (to your witcher)
     */
    TossACoinToYourWitcher() {




        return new Promise((resolve, reject) => {

            if (!this.isRolled) {
                reject(new Error("Nincs átforgatva az érmekiadó"));
                return;
            }


            function coinDrop() {
                this.gpios.triggerIn.writeSync(0);

                this.SetRolled(false);

                if (this.motorTimeout !== undefined) {
                    clearTimeout(this.motorTimeout);
                    delete this.motorTimeout;
                }

                //gép kapcsolo quickfix
                // setTimeout(() => {
                //     this.SetRolled(true);
                // }, 60000);

                //this.removeListener("coinDrop", coinDrop);

                resolve(true);
            }

            //this.removeAllListeners("coinDrop");

            //this.on("coinDrop", coinDrop);
            this.once("coinDrop", coinDrop);

            this.coinCounting = true;

            this.gpios.triggerIn.writeSync(1);

            // setTimeout(() => {
            // this.gpios.triggerIn.writeSync(0);
            // }, 20);


            if (this.motorTimeout !== undefined) {
                clearTimeout(this.motorTimeout);
                delete this.motorTimeout;
            }

            /** Runs max 30 seconds */
            this.motorTimeout = setTimeout(() => {
                this.coinCounting = false;
                this.gpios.triggerIn.writeSync(0);

                /** There is no coin in the machine and we didn't noticed! So set to quantity zero + alert */
                this.emit("emptyAlert", {});

                reject(new Error("Nincs több érme a hopper motor szerint"));

            }, 60000);
        });

    }

    /**
     * Kidobja az összes érmét
     */
    DropAllCoinOut() {


        return new Promise((resolve, reject) => {
            reject(new Error("Not implemented!"));


        });



    }


    /**
     * 
     * @param {string} mode 
     */
    SetMode(mode) {
        return new Promise((resolve, reject) => {
            switch (mode) {
                case HopperMode.DirectSwitching:
                    this.gpios.in1.writeSync(0);
                    this.gpios.in2.writeSync(0);
                    this.gpios.in3.writeSync(1);
                    break;
                case HopperMode.LogicControl:
                    this.gpios.in1.writeSync(1);
                    this.gpios.in2.writeSync(1);
                    this.gpios.in3.writeSync(1);
                    break;
                case HopperMode.CoinCounting:
                    this.gpios.in1.writeSync(0);
                    this.gpios.in2.writeSync(1);
                    this.gpios.in3.writeSync(0);
                    break;
                case HopperMode.Reset:
                    this.gpios.in1.writeSync(1);
                    this.gpios.in2.writeSync(0);
                    this.gpios.in3.writeSync(0);
                default:
                    this.gpios.in1.writeSync(1);
                    this.gpios.in2.writeSync(0);
                    this.gpios.in3.writeSync(0);
                    break;
            }

            setTimeout(() => {
                resolve(true);
            }, 100);
        });

    }

}

class MiniHopper extends HopperAgent {

    constructor(controller, options) {
        super(controller);

        var opts = {
            gpio: {
                power: 20 //
                , triggerIn: 23 //
                , rollLed: 21 //
                , powerOnLed: 16
                , coinDropped: 18 //
                , coinRoll: 12 //
            }
        };

        this.isRolled = true;

        opts = Object.assign(opts, options);

        this.gpios = {};

        this.gpios.power = new Gpio(opts.gpio.power, "out");
        this.gpios.triggerIn = new Gpio(opts.gpio.triggerIn, "out");

        this.gpios.rollLed = new Gpio(opts.gpio.rollLed, "out");
        this.gpios.powerOnLed = new Gpio(opts.gpio.powerOnLed, "out");
        this.gpios.coinDropped = new Gpio(opts.gpio.coinDropped, "in", "both");
        this.gpios.coinRoll = new Gpio(opts.gpio.coinRoll, "in", "both");

        this.gpios.power.writeSync(1);

        (async () => {
            var errors = await this.controller.daoCtx.GetList(Beans.Error, { errorType: "notRolled" });
            if (errors.length > 0) {

                this.SetRolled(false);
            } else {
                this.SetRolled(true);

            }
        }
        )();

        // var bugWatcher = undefined;

        this.gpios.coinDropped.watch(
            //debounce(
            (err, value) => {
                if (err) {
                    console.log(err);
                }
                if (value == 1) {
                    this.emit("coinDrop", {});

                } else {
                }
            }
            //, 10)
        );

        var rolled = this.gpios.coinRoll.readSync();
        console.log("rolled", rolled == 1);
        if (rolled == 1) {
            this.SetRolled(true);
        }

        this.gpios.coinRoll.watch(
            //debounce(
            (err, value) => {
                if (err) {
                    console.log(err);
                }
                // console.log(value);
                if (value == 1) {
                    this.SetRolled(true);


                } else {

                }
            }
        );


    }


    async SetRolled(isRolled) {

        this.gpios.rollLed.writeSync(isRolled ? 0 : 1);
        this.gpios.powerOnLed.writeSync(isRolled ? 1 : 0);
        this.isRolled = isRolled;

        this.emit("rolledChange", this.isRolled);

        var errors = await this.controller.daoCtx.GetList(Beans.Error, { errorType: "notRolled" });
        if (!isRolled && errors.length == 0) {

            try {
                //sometimes gives error
                var err = new Beans.Error();
                err.errorType = "notRolled";
                err.description = "Nincs átforgatva az érmekiadó";
                await this.controller.daoCtx.Add(err);

            } catch (error) {

            }

        } else if (isRolled) {
            for (var o of errors) {
                //trycatch bugfix valamiért néha hibát dob hogy sikertelen módosítás (a query result.affectedRows == 0)
                try {
                    await o.Delete();

                } catch (error) {

                }
            }
        }
    }

    /**
     * Drops a coin (to your witcher)
     */
    TossACoinToYourWitcher() {




        return new Promise((resolve, reject) => {

            if (!this.isRolled) {
                reject(new Error("Nincs átforgatva az érmekiadó"));
                return;
            }


            function coinDrop() {
                this.gpios.triggerIn.writeSync(0);

                this.SetRolled(false);

                if (this.motorTimeout !== undefined) {
                    clearTimeout(this.motorTimeout);
                    delete this.motorTimeout;
                }

                //gép kapcsolo quickfix
                // setTimeout(() => {
                //     this.SetRolled(true);
                // }, 60000);

                //this.removeListener("coinDrop", coinDrop);

                resolve(true);
            }

            //this.removeAllListeners("coinDrop");

            //this.on("coinDrop", coinDrop);
            this.once("coinDrop", coinDrop);

            this.coinCounting = true;

            this.gpios.triggerIn.writeSync(1);

            // setTimeout(() => {
            // this.gpios.triggerIn.writeSync(0);
            // }, 20);


            if (this.motorTimeout !== undefined) {
                clearTimeout(this.motorTimeout);
                delete this.motorTimeout;
            }

            /** Runs max 30 seconds */
            this.motorTimeout = setTimeout(() => {
                this.coinCounting = false;
                this.gpios.triggerIn.writeSync(0);

                /** There is no coin in the machine and we didn't noticed! So set to quantity zero + alert */
                this.emit("emptyAlert", {});

                reject(new Error("Nincs több érme a hopper motor szerint"));

            }, 60000);
        });

    }

    /**
     * Kidobja az összes érmét
     */
    DropAllCoinOut() {


        return new Promise((resolve, reject) => {
            reject(new Error("Not implemented!"));


        });



    }


    /**
     * 
     * @param {string} mode 
     */
    SetMode(mode) {
        return new Promise((resolve, reject) => {
            switch (mode) {
                case HopperMode.DirectSwitching:
                    this.gpios.in1.writeSync(0);
                    this.gpios.in2.writeSync(0);
                    this.gpios.in3.writeSync(1);
                    break;
                case HopperMode.LogicControl:
                    this.gpios.in1.writeSync(1);
                    this.gpios.in2.writeSync(1);
                    this.gpios.in3.writeSync(1);
                    break;
                case HopperMode.CoinCounting:
                    this.gpios.in1.writeSync(0);
                    this.gpios.in2.writeSync(1);
                    this.gpios.in3.writeSync(0);
                    break;
                case HopperMode.Reset:
                    this.gpios.in1.writeSync(1);
                    this.gpios.in2.writeSync(0);
                    this.gpios.in3.writeSync(0);
                default:
                    this.gpios.in1.writeSync(1);
                    this.gpios.in2.writeSync(0);
                    this.gpios.in3.writeSync(0);
                    break;
            }

            setTimeout(() => {
                resolve(true);
            }, 100);
        });

    }

}


module.exports = {
    Hopper: Hopper,
    HopperMH245CA: HopperMH245CA,
    MiniHopper: MiniHopper
};