
export default async function handler(req, res){
    try {
        
        var success = await req.control.Logout(req, res);
        res.status(200).json(success);
    } catch (error) {
        res.status(500);
        res.json({message: error.message});
    }
    
}