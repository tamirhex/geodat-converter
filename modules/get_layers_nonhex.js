const Oldfs = require('fs');
const fs = Oldfs.promises;
const util = require('util');
const { devFileLog } = require('./helperfunctions');
const axios = require('axios');


//Puts all unique layer names and put in an array.
function extract_layer_array(geojson) {
  let layerObjects = geojson.features;
  let extractedLayerNames = [];
  for (i in layerObjects) {
    let currentLayer = layerObjects[i].properties.Layer;
    if(!extractedLayerNames.includes(currentLayer)) {
      extractedLayerNames.push(currentLayer);
    }
  }
  return extractedLayerNames;
}

exports.get_layers_nonhex = async (req, res) => {
  try{
    const {url} = req.body;
    const apikey = process.env.APIKEY;
    const cloudfunction_url = process.env.APICLOUDFUNCTION ?? 
        "https://europe-west1-first-project-305113.cloudfunctions.net/mygeodata_api";
    requestObj = {
      srcurl: url,
      outform: "binary",
      key: apikey,
      format: "geojson",
    }
    const options = {
      method: 'post',
      url: cloudfunction_url,
      data: requestObj,
    };
    const axiosResponse = await axios(options);
    let geojson = axiosResponse.data;
    devFileLog(geojson, "geojson_nonhex");
    let layers = extract_layer_array(geojson_raw);
    
    if (layers) {
      return {
        error: "",
        layers: layers
      }
    } else { 
      return {
        error: "No layers were found",
        layers: ""
      }
    }

  } catch (error) {
    console.error("Error occured in get_layers_nonhex.js: " + error);
    return {
      error: "Error occured in get_layers_nonhex.js: " + error,
      layers: ""
    }
  }
}

