const { dxfToJson } = require("./dxfToJson");
const { add_pointarray } = require("./add_pointarray");
const { getLayers } = require("./getLayers")
const { devFileLog } = require('./helperfunctions');
const { stringIsAValidUrl } = require("../modules/helperfunctions");
const express = require('express');
const app = express();
const Oldfs = require('fs');
const util = require('util');
const { default: axios } = require("axios");
const fs = Oldfs.promises;

exports.hexsoft_convert = async (req,res) => {
  try{
    let infoLog = ""

    let layers = req.body.layers ?? req.body.Layers ?? req.body.layer ?? req.body.Layer ?? req.body.layerName;
    let url = req.body.url ?? req.body.URL ?? req.body.Url;
    let dmax = req.body?.dmax;
    let sections = req.body?.sections ?? req.body?.section;
    let getLayerList = req.body?.getlayers ?? req.body?.getLayers;
    const informat = req.body?.informat;

    //**geodata api related options(will be used only if informat isn't dxf):*/
    const apikey = req.body?.apikey;
    const incords = req.body?.incords;
    const outcords = req.body?.outcords;
    let cloudfunction_url = req.body?.cloudfunction_url ?? 
    "https://us-central1-first-project-305113.cloudfunctions.net/hello_http";
    let outform = "url";
    if (req.body?.output_method == 'binary'){
      outform = req.body?.output_method;
    }

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
    if (getLayerList === true || getLayerList === 'true' && informat == 'dxf') { 
      var {json, error} = await getLayers(url);
      if (error) return res.status(400).send(error);
    } else { // MAIN LOGIC
      if (informat != 'dxf' || outcords) {
        if (!apikey) return res.status(400).send("What you're trying to do requires an api key");
        infoLog += ", Will use mygeodata API because 'informat' != dxf || outcords exists. "
        //prepares requets object to post
        requestObj = {
          srcurl: url,
          outform: outform,
          key: apikey,
          format: 'dxf'
        }
        //if there are outcords it means user wishes to convert cordinates
        if (outcords) {
          requestObj.outcrs = outcords;
          requestObj.incrs = incords;
        }
        const options = {
          method: 'post',
          url: cloudfunction_url,
          data: requestObj,
        };
        
        // send the request;
        const axiosResponse = await axios(options);
        devFileLog(axiosResponse, "axiosResponse");
        //checks if we actually got a good url from axios
        if (axiosResponse?.status == 200 && stringIsAValidUrl(axiosResponse?.data)) {
          url = axiosResponse?.data;
        }
        else return res.status(axiosResponse.status)
          .send("SOME ERROR OCCURED WITH MYGEODATA API(html form usually means invalid input url), ITS RESPONSE IS: " + axiosResponse.data);
      } else { infoLog += ", Did not use mygeodata API, " }

      var {json, error} = await dxfToJson(url,layers, infoLog);
      if (error) return res.status(400).send(error);
      errorObject = await add_pointarray(json, dmax, sections);
      if (errorObject?.error) return res.status(400).send(errorObject.error);
    }

    res.send(json);
  
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

}    
