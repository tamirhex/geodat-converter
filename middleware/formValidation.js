const {body, validationResult} = require('express-validator');
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
        errorMessage: "Must be a non-empty url"
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
          else console.log ("informat is valid");
        }
    },



    },
    
}