// const control = require("../../../control.js");
const Entities = require("../../../System/Db/Beans/Entities.js");


export default async function handler(req, res){
    var obj = req.query.di[0];
    var control = req.control;
    try{

        await control.CheckAccessCore(req, res);
    } catch(error){

        res.json({message: error.message});
        return;
    }
    try {
        res.json(await req.db.GetList(Entities[obj], req.body.params, req.body.orderby, req.body.limit));
    } catch (error) {
        res.status(500);
        res.json({message: error.message});
    }

}