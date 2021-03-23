const {body, validationResult} = require('express-validator');
const { stringIsAValidUrl } = require("../modules/helperfunctions");

exports.postSchema = {
    url: {
        notEmpty: true,
        errorMessage:"url is empty",
        custom: {
          options: async value => {
            if (!stringIsAValidUrl(value)){
              return Promise.reject(`url is invalid`);
            } 
          }
        }
    },
    informat: {
      custom: {
        options: async value => {
          const allowedFormats = ["shp", 'kml', 'kmz', "geojson", 'gml', 'gpx', 
          'mapinfo', 'dgn', 'dxf', 'gpkg', 'sqlite', 'csv', 'ods', 'xlsx', 'dwg']
          if (!allowedFormats.includes(value)){
            console.log("informat is invalid");
            return Promise.reject(`informat is invalid, isn't one of the following formats: ${allowedFormats}`);
          } 
        }
      },
    },

    outformat: {
      custom: {
        options: async value => {
          const allowedFormats = ["shp", 'kml', 'kmz', "geojson", 'gml', 'gpx', 
          'mapinfo', 'dgn', 'dxf', 'gpkg', 'sqlite', 'csv', 'ods', 'xlsx', 'hexsoft_json']
          if (!allowedFormats.includes(value)){
            return Promise.reject(`outformat is invalid, isn't one of the following formats: ${allowedFormats}`);
          } 
        }
      },
    },




    
}