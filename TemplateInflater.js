var fs = require('fs');

class TemplateInflater{

    static InflateString(templateString, objArray){
        //console.log(Object.keys(objArray));
        if(objArray && typeof objArray === "object"){
            Object.keys(objArray).forEach(function(key,index) {
            
                templateString = templateString.replace(new RegExp("\\$\\{"+ key +"\\}", "g"), objArray[key]);
            });   
        }
        return templateString;
        
    }

    static InflateFile(path, objArray){
        
        return TemplateInflater.InflateString(fs.readFileSync(path).toString(), objArray)
        
    }
}

module.exports = {
    TemplateInflater : TemplateInflater
};