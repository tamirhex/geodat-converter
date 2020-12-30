const {dxfToJson}= require("./dxfToJson");
const Oldfs = require('fs');
const util = require('util');
const fs = Oldfs.promises;




exports.cloudFunction = async (req, res) => {
    switch (req.method){
        case 'POST':
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
            break;
        case 'GET':
            testValue = req.params.test;
            testValue2 = req.query.test
            res.send("Value is " + testValue + "\n" + "Value2 is " + testValue2);
            break;
        default:
            break;
    }
  };

async function something(){
    url = "https://firebasestorage.googleapis.com/v0/b/webqpm-client-dev.appspot.com/o/files%2Fdxf_example.dxf?alt=media&token=01de6805-5deb-44ca-9e64-66b9789066a3"
    json = await dxfToJson(url,"PMISUNDER");
    let data = util.inspect(json, false, null);
    fs.writeFile('testJson', data);
    
    
}

//something();
  
  



