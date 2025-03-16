export default async function handler(req, res){
    var control = req.control;
    try{

        await control.CheckAccessCore(req, res);
    } catch(error){

        res.json({message: error.message});
        return;
    }

    try {
        res.json(await control.GetSystemInfo());
    } catch (error) {
        res.status(500);
        res.json({message: error.message});
    }

}