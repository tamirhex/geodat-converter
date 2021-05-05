const Oldfs = require('fs');
const { Helper } = require('dxf');
const axios = require('axios');

exports.getLayers = async (url) => {
  try {
    let logMessage = "";
    let dxfContents = "";
    try {
      dxfContents = await axios.get(url); // reads from file in url returns the response object
    } catch (error) {
      logMessage += `could not get file from URL, got error with status:${error.response.status}`
      console.error("could not get file from URL, got error with status : " + error.response.status);
      return {
        json: "",
        error: logMessage
      };
    }
    const dataString = dxfContents.data;

    // parsing the dxf into more workable json
    const helper = new Helper(dataString);
    const parsedObject = helper.parsed.entities;

    // Adding only unique values of layers to array and returning it.
    const layerSet = new Set();
    if (parsedObject != []) {
      for (let i in parsedObject) {
        layerSet.add(parsedObject[i].layer)
      }
    }
    const layerArray = Array.from(layerSet);
    const jsonObj = {
      "layers": layerArray
    }
    return {
      layers: jsonObj,
      error: ""
    }
  } catch (error) {
    console.error("error is " + error);
    return {
      error: logMessage,
      layers: logMessage
    }
  }
}