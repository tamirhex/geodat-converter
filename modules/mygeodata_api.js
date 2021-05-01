const { devFileLog } = require('./helperfunctions');
const axios = require('axios');
const express = require('express');


exports.useMyGeoAPI = async (req,res) => {
  try{
    const {url, outformat, incords, outcords, layers_mygeodata} = req.body;
    const apikey = process.env.APIKEY;
    const cloudfunction_url = process.env.APICLOUDFUNCTION ?? 
        "https://europe-west1-first-project-305113.cloudfunctions.net/mygeodata_api";
    const urlorfile = req.body.urlorfile ?? "url" ;
    if (urlorfile == "file") urlorfile == "binary" // The API only knows binary or url, but file is easier to understand for user

    
    // prepares requets object to post, with keys that match mygeodata api.
    requestObj = {
      srcurssl: url,
      outform: urlorfile,
      key: apikey,
      format: outformat,
      outcrs: outcords,
      incrs: incords,
    } 
    //if there are outcords it means user wishes to convert cordinates
    if (outcords) {
      requestObj.outcrs = outcords;
      requestObj.incrs = incords;
    }
    if (layers_mygeodata) {
      requestObj.layers = layers_mygeodata;
    }

    const options = {
      method: 'post',
      url: cloudfunction_url,
      data: requestObj,
    };
    const axiosResponse = await axios(options);
    devFileLog(axiosResponse, "axiosResponse");
    res.status(axiosResponse.status).send(axiosResponse.data);

  }
  catch (error) {
    res.send("Error occured in mygeodata_api.js: " + error);
  }

}    
