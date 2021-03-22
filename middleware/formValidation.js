const {body, validationResult} = require('express-validator');
const { stringIsAValidUrl } = require("../modules/helperfunctions");

exports.postSchema = {
  /*
    url: {
        custom: {
            options: async value => {
              if (value != "banana"){
                console.log("isn't banana");
                return Promise.reject('the url isnt banana')
              } 
              else console.log ("is ybanana");
            }
        }
    },*/
    url: {
        notEmpty: true,
        errorMessage:"url is empty",
        custom: {
          options: async value => {
            if (stringIsAValidUrl(value)){
              return Promise.reject(`url is invalid`);
            } 
          }
        }
    },
    informat: {
      custom: {
        options: async value => {
          let allowedFormats = ["shp", 'kml', 'kmz', "geojson", 'gml', 'gpx', 
          'mapinfo', 'dgn', 'dxf', 'gpkg', 'sqlite', 'csv', 'ods', 'xlsx']
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
          let allowedFormats = ["shp", 'kml', 'kmz', "geojson", 'gml', 'gpx', 
          'mapinfo', 'dgn', 'dxf', 'gpkg', 'sqlite', 'csv', 'ods', 'xlsx', 'hexsoft_json']
          if (!allowedFormats.includes(value)){
            return Promise.reject(`outformat is invalid, isn't one of the following formats: ${allowedFormats}`);
          } 
        }
      },
    },

    apikey: {
      custom: {
        options: async value => {
          if (body('informat') != 'dxf'|| body('outcords')){
            if(!value)
            return Promise.reject(`What you're trying to do needs an API key`);
          } 
        }
      },
    },


    
}