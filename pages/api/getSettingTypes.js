const Hopper = require("../../Hopper.js");
const Pos = require("../../Pos.js");

export default async function handler(req, res){
    var control = req.control;
    try{

        await control.CheckAccessCore(req, res);
    } catch(error){

        res.json({message: error.message});
        return;
    }

    try {
        var hopperTypes = Object.keys(Hopper).filter(key => {
            return typeof Hopper[key] === 'function' && /^class\s/.test(Hopper[key].toString());
        });
        var posTypes = Object.keys(Pos).filter(key => {
            return typeof Pos[key] === 'function' && /^class\s/.test(Pos[key].toString());
        });
        res.json({hopperTypes: hopperTypes, posTypes: posTypes});
    } catch (error) {
        res.status(500);
        res.json({message: error.message});
    }

}