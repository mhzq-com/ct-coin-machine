export default async function handler(req, res){
    var control = req.control;
    try{

        await control.CheckAccessCore(req, res);
    } catch(error){

        res.json({message: error.message});
        return;
    }

    try {
        var r = await req.control.EmptyHopper();
        res.json(r);
    } catch (error) {
        res.status(500);
        res.json({message: error.message});
    }

}