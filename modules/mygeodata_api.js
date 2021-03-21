const { dxfToJson } = require("./dxfToJson");
const { add_pointarray } = require("./add_pointarray");
const { getLayers } = require("./getLayers")
const { devFileLog } = require('./helperfunctions');
const axios = require('axios');
const express = require('express');
const app = express();
const Oldfs = require('fs');
const util = require('util');
const fs = Oldfs.promises;


exports.useMyGeoAPI = async (req,res) => {
  try{
    const url = req.body.url ?? req.body.URL ?? req.body.Url;
    const outformat = req.body?.outformat;
    const apikey = req.body?.apikey;
    const incords = req.body?.incords;
    const outcords = req.body?.outcords;
    const layers_mygeodata = req.body?.layers_mygeodata;
    let cloudfunction_url = req.body?.cloudfunction_url ?? 
        "https://us-central1-first-project-305113.cloudfunctions.net/hello_http";
    let outform = "url";
    if (req.body?.output_method == 'binary'){
     outform = req.body?.output_method;
    }
    //prepares requets object to post
    requestObj = {
      srcurl: url,
      outform: outform,
      key: apikey,
      format: outformat,
      incrs: incords,
      outcrs: outcords
    }
    if (layers_mygeodata) {
      requestObj.layers = layers_mygeodata;
    }

    const options = {
      method: 'post',
      url: cloudfunction_url,
      data: requestObj,
    };
    
    // send the request
    const axiosResponse = await axios(options);
    devFileLog(axiosResponse, "axiosResponse");
    res.status(axiosResponse.status).send(axiosResponse.data);

    


    
  }
  catch (error) {
    res.send("Error occured: " + error);
  }

}    
