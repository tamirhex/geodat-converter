const Oldfs = require('fs');
const util = require('util');
const fs = Oldfs.promises;
const URL = require("url").URL;

exports.stringIsAValidUrl = (s) => {
  try {
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * If we are in development environment write a log file of the json object given.
 * @param {Object} json 
 * @param {string} fileName 
 */
exports.devFileLog = async (json, fileName) => {
  if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "dev") {
    let data = util.inspect(json,{maxArrayLength: null, depth:null});
    fs.writeFile(`./testlogs/${fileName}`, data);
    console.log("Wrote file : " + fileName);
  }

}

exports.filterByInclude = (object, layerArray, typeArray) => {
  return object.filter(key => layerArray.includes(key?.layer) &&
            typeArray.includes(key?.type));
}

exports.pointsEqual = (p1, p2) => {
  if (p1.point.xLng === p2.point.xLng
    && p1.point.yLat === p2.point.yLat
    && p1.point.zElv === p2.point.zElv) {
      return true;
  }
  return false;
}

exports.pointsDistance = (p1, p2) => {
  const x1 = p1.point.xLng;
  const y1 = p1.point.yLat;
  const z1 = p1.point?.zElv ?? 0;

  const x2 = p2.point.xLng;
  const y2 = p2.point.yLat;
  const z2 = p2.point?.zElv ?? 0;

  distance = (Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2)));
  return distance;
}