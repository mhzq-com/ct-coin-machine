const {Parser} = require("json2csv")

export default async function handler(req, res){
    var control = req.control;
    try{

        await control.CheckAccessCore(req, res);
    } catch(error){

        res.json({message: error.message});
        return;
    }

    try {
        var data = await control.GetStat(req.body, res);

        var p = new Parser({delimiter: ";"});
        
        var csv = p.parse(data);

        // Válaszként CSV-t küldünk le
        res.setHeader("Content-Disposition", "attachment; filename=export.csv");
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.send(csv);


    } catch (error) {
        res.status(500);
        res.json({message: error.message});
    }

}