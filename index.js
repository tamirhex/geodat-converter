const { dxfToJson } = require("./modules/dxfToJson");
const { add_pointarray } = require("./modules/add_pointarray");
const { getLayers } = require("./modules/getLayers");
const { hexsoft_convert } = require("./modules/hexsoft-convert");
const { useMyGeoAPI } = require("./modules/mygeodata_api");
const express = require('express');
const app = express();
const Oldfs = require('fs');
const util = require('util');
const fs = Oldfs.promises;
const {checkSchema, validationResult} = require('express-validator');
const { postSchema } = require('./middleware/formValidation');

app.use(express.json());

/*
app.post('/', async function (req, res) {
  res.send(req.body.url);

})*/


app.post('/', checkSchema(postSchema), async function (req, res) {
  // Validate incoming input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({
          errors: errors.array()
      });
    }
    const outcords = req.body?.outcords;
    const incords = req.body?.incords;
    let outformat = req.body?.outformat;
    if (outcords && !incords) {
        return res.status(400).send("When assigning 'outcords' you should also assign" +
         "'incords' otherwise output cordinates can be incorrect");
    }
    
    if (outformat !== "hexsoft_json"){
      //straight up use mygeodata api
      useMyGeoAPI(req,res);
    } else {
      hexsoft_convert(req,res);
    }
  

})

app.post('/getlayers', async function (req, res) {
  const url = req.body?.url;
  const {json, error} = await getLayers(url);
  if (error) return res.status(400).send(error);
  res.send(json);
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
  



