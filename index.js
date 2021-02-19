const {dxfToJson}= require("./dxfToJson");
const {add_pointarray}= require("./add_pointarray");
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
    let layerName = req.body.layerName ?? req.body.layername ?? req.body.Layername ?? req.body.LayerName;
    let url = req.body.url ?? req.body.URL ?? req.body.Url;
    let dmax = req.body?.dmax;
    let sections = req.body?.sections;
    if (!dmax) dmax = 0.4;
    if (!sections) sections = false;
    json = await dxfToJson(url,layerName);
    add_pointarray(json, dmax, sections);
    res.send(json);
}
catch (error) {
    res.send("Error occured, red.body.url is " + req.body.url +
    "req.body.layerName is " + req.body.layerName + "\n error is " + error);
}
})

app.get('/', (req, res) => {
  res.send('Hello from App Engine!');
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
        let data2 = JSON.stringify(json1);
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

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
  



