const Oldfs = require('fs');
const fs = Oldfs.promises;
const {Helper} = require('dxf');
const util = require('util');
const axios = require('axios');
const {currentDate, currentTime} = require('./dateAndTime');
const {devFileLog, filterByInclude} = require('./helperfunctions');

//url to download dxf:
//https://firebasestorage.googleapis.com/v0/b/webqpm-client-dev.appspot.com/o/files%2Fdxf_example.dxf?alt=media&token=01de6805-5deb-44ca-9e64-66b9789066a3

exports.getLayers = async (url) => {
  try{
      //logMessage will be sent in metadata to give more info to the user about the process.
      let logMessage = "";
      //*reads the dxf file preparing for parsing*//
      //dataString = await fs.readFile(url,"utf8"); (reads from local file)
      let dxfContents = "";
      try {
        dxfContents =  await axios.get(url); // reads from file in url returns the response object
      } catch (error) {
        logMessage += `could not get file from URL, got error with status:${error.response.status}`
        console.error("could not get file from URL, got error with status : " + error.response.status);
        return {json:"", error:logMessage};
        
      }
      const dataString = dxfContents?.data;

      //* parsing the dxf recieving a parsed object  *//
      const helper = new Helper(dataString);
      const parsedObject = helper?.parsed?.entities;
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