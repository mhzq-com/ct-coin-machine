

export default async function handler(req, res){
    var {auth} = req.query;

    var user = await req.control.Login(req, res);
    
    res.status(200).json({user});
}