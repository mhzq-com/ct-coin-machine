// const control = require("../../../control.js");

export default async function handler(req, res){
    var control = req.control;
    try {
        var user = await control.LoginWithPin(req, res);
        
        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}