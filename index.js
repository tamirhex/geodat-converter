const {dxfToJson}= require("./dxfToJson");



function currentDate(){
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    return yyyy + '.' + mm + '.' + dd;
}

exports.cloudFunction = async (req, res) => {
    try{
        json = await dxfToJson(req.body.url,req.body.layerName);
        res.send(json);
    }
    catch(error){
        res.send("Error occured, red.body.url is " + req.body.url +
         "req.body.layerName is " + req.body.layerName + "\n error is " + error);
    }
  };
  

let fileName = "dxf_example.dxf";
url = `./job description/${fileName}`;


//dxfToJson(url,"PMISUNDER");

