const Oldfs = require('fs');
const fs = Oldfs.promises;
const {Helper} = require('dxf');
const util = require('util');
const axios = require('axios');


//url to download dxf:
//https://firebasestorage.googleapis.com/v0/b/webqpm-client-dev.appspot.com/o/files%2Fdxf_example.dxf?alt=media&token=01de6805-5deb-44ca-9e64-66b9789066a3

exports.getLayers = async (url) => {
  try{
      let logMessage = "";
      let dxfContents = "";
      try {
        dxfContents =  await axios.get(url); // reads from file in url returns the response object
      } catch (error) {
        logMessage += `could not get file from URL, got error with status:${error.response.status}`
        console.error("could not get file from URL, got error with status : " + error.response.status);
        return {json:"", error:logMessage}; 
      }
      const dataString = dxfContents?.data;

      // parsing the dxf into more workable json
      const helper = new Helper(dataString);
      const parsedObject = helper.parsed.entities;

      // adding only unique values of layers to array.
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
        json: jsonObj,
        error: ""
      }
    } catch (error){
      console.error("error is " + error);
      return {
        error: logMessage,
        json: logMessage
      }
    }
}