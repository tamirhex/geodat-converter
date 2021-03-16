const Oldfs = require('fs');
const util = require('util');
const fs = Oldfs.promises;

/**
 * If we are in development environment write a log file of the json object given.
 * @param {Object} json 
 * @param {string} fileName 
 */
exports.devFileLog = async (json, fileName) => {
  if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "dev") {
    let data = util.inspect(json,{maxArrayLength: null, depth:null});
    fs.writeFile(`./testlogs/${fileName}`, data);
  }

}

exports.filterByInclude = (object, layerArray, typeArray) => {
  return object.filter(key => layerArray.includes(key?.layer) &&
            typeArray.includes(key?.type));
}

