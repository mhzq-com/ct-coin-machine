
export default async function handler(req, res){
    try{

        await req.control.CheckAccessCore(req, res);
    } catch(error){

        res.json({message: error.message});
        return;
    }
    
    try {
        
        var settings = await req.control.SaveSettings(req.body);
        res.status(200).json(settings);
    } catch (error) {
        res.status(500);
        res.json({message: error.message});
    }
    
}