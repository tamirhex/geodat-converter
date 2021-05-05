//const { devFileLog } = require('./helperfunctions');

/**
 * THIS IS CURRENTLY NOT IN USE BECAUSE NOT REQUIRED, BUT IT WORKS ON ANY GEOJSON WITH THIS JSON PATH.
 * This method recieves a geojson file and outputs a geojson file only with requests layers
 * Important!: This assumes all drawings are under features array and have layer in their property
 * so the json path for that layer is features[i].properties.Layer
 * and only data related to that layer is inside this features[i] object. 
 * 
 * UPDATE: is now in use because couldnt get mygeodata api layers option to work
 * @param {*} geojson A geojson file
 * @param {Array} layers Array of layer strings
*/
const Oldfs = require('fs');
const fs = Oldfs.promises;
const util = require('util');



exports.extractLayersFromGJ = async (geojson, layers) => {
  //console.log(layers);
  //const geojson_raw = await fs.readFile("./testLogs/geojson.json");
  console.log(geojson);
  //let geojson = JSON.parse(geojson_raw)
  //this.devFileLog(geojson, "geo_before");
  let layerObjects = geojson.features;
  let extractedLayerObjects = [];
  for (i in layerObjects) {
    if (layers.includes(layerObjects[i].properties.Layer)){
      extractedLayerObjects.push(layerObjects[i]);
    }
  }

  geojson.features = extractedLayerObjects;

  return geojson;
}





/* DEBUGGING METHODS: 

async function test() {
  geojson_raw = await fs.readFile("./testLogs/geojson.json");
  geojson = JSON.parse(geojson_raw)

  console.log(geojson);
}
exports.devFileLog = async (json, fileName) => {
  if (true) {
    let data = util.inspect(json,{maxArrayLength: null, depth:null});
    fs.writeFile(`./testlogs/${fileName}`, data);
    console.log("Wrote file : " + fileName);
  }
}



*/