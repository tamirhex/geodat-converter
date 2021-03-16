
const Oldfs = require('fs');
const fs = Oldfs.promises;
const {Helper} = require('dxf');
const util = require('util');
const axios = require('axios');


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
      const fileNameAlmost = dxfContents?.headers?.["content-disposition"]

      //* parsing the dxf recieving a parsed object  *//
      const helper = new Helper(dataString);
      const parsedObject = helper?.parsed?.entities;
      return {
        'parsedObject': parsedObject,
        'fileNameAlmost': fileNameAlmost
      }
    } catch (error) {

    }

    