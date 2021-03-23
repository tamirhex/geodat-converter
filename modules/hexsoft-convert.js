const { dxfToJson } = require("./dxfToJson");
const { add_pointarray } = require("./add_pointarray");
const { devFileLog } = require('./helperfunctions');
const { stringIsAValidUrl } = require("../modules/helperfunctions");
const express = require('express');
const app = express();
const Oldfs = require('fs');
const { default: axios } = require("axios");
const fs = Oldfs.promises;

exports.hexsoft_convert = async (req,res) => {
  try{
    let infoLog = ""
    const {layers, informat, incords, outcords} = req.body;
    let {sections, url} = req.body;
    let dmax = req.body?.dmax ?? 0.4;
    const apikey = process.env.APIKEY;
    //cloudfunction used to communicate with mygeodata API
    const cloudfunction_url = process.env.APICLOUDFUNCTION ?? 
    "https://europe-west1-first-project-305113.cloudfunctions.net/mygeodata_api";
    const outform = "url";
    if (req.body?.output_method == 'binary' && process.env.NODE_ENV == 'development'){
      outform = req.body.output_method;
    }

    //** lets sections property in request to be either a string or an array of strings */
    if(!sections){
      sections = [];
    } else if (typeof sections == 'string') {
      sections = [sections];
    } else if (!Array.isArray(sections)) {
      sections = [];
    }

    // One of those values being true means we need to use mygeodata API.
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
      // if there are outcords it means user wishes to convert cordinates so we take incords too
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
      //checks if we got a url from the api
      if (axiosResponse?.status == 200 && stringIsAValidUrl(axiosResponse?.data)) {
        url = axiosResponse.data;
      }
      else return res.status(axiosResponse.status)
        .send("SOME ERROR OCCURED WITH MYGEODATA API(html form usually means invalid input url), ITS RESPONSE IS: " + axiosResponse.data);
    } else { infoLog += ", Did not use mygeodata API, " }

    let {json, error} = await dxfToJson(url,layers, infoLog);
    if (error) return res.status(400).send(error);
    errorObject = await add_pointarray(json, dmax, sections);
    if (errorObject?.error) return res.status(400).send(errorObject.error);
  

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
    res.send("Error occured in hexsoft-convert.js, red.body.url is " + req.body.url +
    ", req.body.layers is " + req.body.layers + "\n error is " + error);
  }

}    
