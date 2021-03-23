const { devFileLog } = require('./helperfunctions');
const axios = require('axios');
const express = require('express');
const Oldfs = require('fs');
const util = require('util');
const fs = Oldfs.promises;


exports.useMyGeoAPI = async (req,res) => {
  try{
    const {url, outformat, incords, outcords, layers_mygeodata} = req.body;
    const apikey = process.env.APIKEY;
    const cloudfunction_url = process.env.APICLOUDFUNCTION ?? 
        "https://us-central1-first-project-305113.cloudfunctions.net/hello_http";
    const outform = "url";

    
    // prepares requets object to post, with keys that match mygeodata api.
    requestObj = {
      srcurl: url,
      outform: outform,
      key: apikey,
      format: outformat,
      outcrs: outcords,
      incrs: incords,
    }
    /*
    //if there are outcords it means user wishes to convert cordinates
    if (outcords) {
      requestObj.outcrs = outcords;
      requestObj.incrs = incords;
    }
    if (layers_mygeodata) {
      requestObj.layers = layers_mygeodata;
    }*/

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
