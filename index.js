const { dxfToJson } = require("./modules/dxfToJson");
const { add_pointarray } = require("./modules/add_pointarray");
const { getLayers } = require("./modules/getLayers")
const express = require('express');
const app = express();
const Oldfs = require('fs');
const util = require('util');
const fs = Oldfs.promises;

app.use(express.json());

/*
app.post('/', async function (req, res) {
  res.send(req.body.url);

})*/


app.post('/', async function (req, res) {
  try {
    //question marks notation for a bit of case insensivity, takes the non-null value
    let layers = req.body.layers ?? req.body.Layers ?? req.body.layer ?? req.body.Layer ?? req.body.layerName;
    let url = req.body.url ?? req.body.URL ?? req.body.Url;
    let dmax = req.body?.dmax;
    let sections = req.body?.sections ?? req.body?.section;
    let getLayerList = req.body?.getlayers ?? req.body?.getLayers;
    //** lets sections property in request to be either a string or an array of strings */
    if(!sections){
      sections = [];
    } else if (typeof sections == 'string') {
      sections = [sections];
    } else if (!Array.isArray(sections)) {
      sections = [];
    }
    if (!dmax) dmax = 0.4;

    // SIDE LOGIC IF ONLY WANT LAYER NAMES AND NOT WHOLE CONVERSION
    if (getLayerList === true || getLayerList === 'true') { 
      var {json, error} = await getLayers(url);
      if (error) return res.status(400).send(error);
    } else { // MAIN LOGIC
      var {json, error} = await dxfToJson(url,layers, res);
      if (error) return res.status(400).send(error);
      errorObject = await add_pointarray(json, dmax, sections);
      if (errorObject?.error) return res.status(400).send(errorObject.error);
    }

    res.send(json);

    /*
    //development logging, using the one below instead.
    if (process.env.NODE_ENV == 'development') {
      if (sections) {
        
        let data1 = JSON.stringify(json);
        console.log("Datasections file created");
        fs.writeFile('./testlogs/datasections.json', data1);
      } else {
        let data2 = JSON.stringify(json);
        console.log("Datapolyline file created");
        fs.writeFile('./testlogs/datapolyline.json', data2);
      }
    }
    */
  //** If on dev env then create file for debugging using python script */
  
  if(process.env.NODE_ENV == "development" || process.env.NODE_ENV == "dev" ){
    let data2 = "";
    try {
      data2 = JSON.stringify(json);
      console.log("datapolyline.json successfully created");
    } catch (e) {
      console.log("could not json.stringify data from json response");
      data2 = "could not json.stringify data from json response";
    }
    
    fs.writeFile('./testlogs/datapolyline.json', data2);
  }

}
catch (error) {
    res.send("Error occured, red.body.url is " + req.body.url +
    ", req.body.layers is " + req.body.layers + "\n error is " + error);
}
})

app.get('/', (req, res) => {
  res.send('Hello, geo-converter-api is running!');
});


// debugging function
async function testFunction() {
    url = "https://firebasestorage.googleapis.com/v0/b/webqpm-client-dev.appspot.com/o/files%2Fdxf_example.dxf?alt=media&token=01de6805-5deb-44ca-9e64-66b9789066a3"
    json1 = await dxfToJson(url,"PMISUNDER"); // for regular polyline
    json = await dxfToJson(url,"PIPELINE-61$0$SECTIONS_NAME3"); //for sections
    let dmax = 0.4;
    let sections = true;
    add_pointarray(json, dmax, sections);
    //anotherfunction(json);

    let data = util.inspect(json,{maxArrayLength: null, depth:null});
    fs.writeFile('./testLogs/testJson', data);

    //FOR PYTHON PLOT
    if (sections) {
        let data1 = JSON.stringify(json);
        fs.writeFile('./testlogs/datasections.json', data1);
    }
    else {
        let data2 = JSON.stringify(json);
        fs.writeFile('./testlogs/datapolyline.json', data2);
    }
    
}

function anotherfunction(json){
    const polyline = json.layerFromDxfSource.polyline;
    
    let x = [];
    let y = [];
    let points = [];
    for (value of polyline) {
        x.push(value.point.xLng);
        y.push(value.point.yLat);
    }

    //pythonPlot(x, y);

}
// for debugging purposes
//testFunction();
//anotherfunction();

// Listen to the App Engine-specified port, or 80 otherwise
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`environment is ${process.env.NODE_ENV}`);
  console.log(`Server listening on port ${PORT}...`);
});
  



