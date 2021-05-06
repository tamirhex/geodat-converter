const { devFileLog } = require('./helperfunctions');
const { extractLayersFromGJ } = require('./cutlayers_geoj');
const axios = require('axios');
const express = require('express');


exports.useMyGeoAPI = async (req,res) => {
  try{
    const {url, outformat, incords, outcords, layers_mygeodata} = req.body;
    let layers = req.body.layers
    const apikey = process.env.APIKEY;
    //const apikey = "sfdf";
    const cloudfunction_url = process.env.APICLOUDFUNCTION ?? 
        "https://europe-west1-first-project-305113.cloudfunctions.net/mygeodata_api";
    let urlorfile = req.body.urlorfile ?? "url" ;
    if (urlorfile == "file") urlorfile = "binary" // The API only knows binary or url, but file is easier to understand for user
    
    // prepares requets object to post, with keys that match mygeodata api.
    requestObj = {
      srcurl: url,
      outform: urlorfile,
      key: apikey,
      format: outformat,
      outcrs: outcords,
      incrs: incords,
    }
    //console.dir(requestObj);
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
    let axiosResponse = await axios(options);
    //devFileLog(axiosResponse, "axiosResponse");
    /**
     * if the outformat was geojson, we can extract only the layers the user requested
     * need to move validation to the middleware
     */
    if (outformat == 'geojson' && layers && urlorfile == 'binary') {
      if (typeof layers === 'string') {
        layers = [layers];
      }
      if (Array.isArray(layers)) {
        const cut_geojson = await extractLayersFromGJ(axiosResponse.data, layers)
        res.status(200).send(cut_geojson);
        return (cut_geojson);
      }
      else {
        //need to handle the case of layers value being invalid and responding it to user but while also responding with the data of all layers to not waste a conversion
        //res.status(400).send('layers value is invalid must be a string or an array')
        console.error("invalid 'layers' field in request body. error from mygeodata_api.js");
      }
    }
    res.status(axiosResponse.status).send(axiosResponse.data);
    return(axiosResponse.data)

  }
  catch (error) {
    res.send("Error occured in mygeodata_api.js: " + error);
  }

}    
