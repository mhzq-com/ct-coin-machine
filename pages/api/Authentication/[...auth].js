// const control = require("../../../control.js");

export default async function handler(req, res){
    var control = req.control;
    try {
        var user = await control.Login(req.body, res);
        
        res.status(200).json({user});
    } catch (error) {
        res.json({message: error.message});
    }
}