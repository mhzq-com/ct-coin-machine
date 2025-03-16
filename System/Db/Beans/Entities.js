const LogType = {
    error: "error",
    info: "info",
    powerOn: "powerOn",
    doorOpen: "doorOpen",
    doorClose: "doorClose",
    sales: "sales",
    hopperLowLevel: "hopperLowLevel",
    hopperEmpty: "hopperEmpty",
    fillUp: "fillUp",
    other: "other"
};

class Log {


    constructor(){
        

        this.id = undefined;
        this.userId = undefined;
        this.userName = "";
        this.logType = LogType.info;
        this.description = undefined;
        this.createDate =  new Date();
        this.isSent = 0;
    }

}


class Setting {


    constructor(){
        

        this.id = undefined;
        this.name = "";
        this.value = "";
        this.description = "";
    }

}

const ErrorType = {
    generalError: "generalError"
    , stuck: "stuck"

};

class Error {


    constructor(){
        

        this.id = undefined;
        this.errorType = ErrorType.generalError;
        this.description = "";
    }

}

module.exports = {
    Log: Log,
    LogType : LogType,
    Setting: Setting,
    Error: Error, 
    ErrorType: ErrorType
}

