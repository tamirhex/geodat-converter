const {dxfToJson}= require("./dxfToJson");
const {currentDate, currentTime} = require('./dateAndTime');



exports.cloudFunction = async (req, res) => {
    try{
        //question marks notation for a bit of case insensivity, takes the non-null value
        let layerName = req.body.layerName ?? req.body.layername ?? req.body.Layername ?? req.body.LayerName;
        let url = req.body.url ?? req.body.URL ?? req.body.Url;
        json = await dxfToJson(url,layerName);
        res.send(json);
    }
    catch(error){
        res.send("Error occured, red.body.url is " + req.body.url +
         "req.body.layerName is " + req.body.layerName + "\n error is " + error);
    }
  };
  

let fileName = "dxf_example.dxf";
url = `./job description/${fileName}`;
console.log(currentDate());
console.log(currentTime());


//dxfToJson(url,"PMISUNDER");

