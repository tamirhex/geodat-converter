const Oldfs = require('fs');
const fs = Oldfs.promises;
const {Helper} = require('dxf');
const util = require('util');
const axios = require('axios');
const {currentDate, currentTime} = require('./dateAndTime');
const {devFileLog, filterByInclude} = require('./helperfunctions');

exports.dxfToJson = async (url,layers, logMessage) => {
    try{
        //logMessage will be sent in metadata to give more info to the user about the process.
        //*reads the dxf file preparing for parsing*//
        let dxfContents = "";
        try {
          dxfContents =  await axios.get(url); // reads from file in url returns the response object
          devFileLog(dxfContents, "fresh-dxfcontent-fromURL");
        } catch (error) {
          logMessage += `could not get file from URL, got error with status:${error.response.status}`
          console.error("could not get file from URL, got error with status : " + error.response.status);
          return {json:"", error:logMessage};
          
        }
        const dataString = dxfContents.data;
        devFileLog(dataString, "dxfContents.data");
        const fileName = dxfContents?.headers?.["content-disposition"]

        //* parsing the dxf recieving a parsed object  *//
        const helper = new Helper(dataString);
        const parsedDxf = helper?.parsed?.entities;
        devFileLog(parsedDxf, "parsedDxf");
        
        const requestedTypes = ["LINE", "ARC", "AcDbPolyline", "LWPOLYLINE", "POLYLINE"];
        let result;
        
        // Fills the requestedLayers param 
        switch(true){
          case !layers: default:
            result = parsedDxf.filter(key => requestedTypes.includes(key?.type));
            logMessage += "Showing all layers because of empty or invalid layer property"
            break;
          case Array.isArray(layers) && layers.length > 0:

            result = filterByInclude(parsedDxf, layers, requestedTypes);
            break;
          case (typeof layers) == 'string':
            result = filterByInclude(parsedDxf, layers.split(), requestedTypes);
            break;

        }
        //* filters the dxf for requested layers and types within a layer *//

        //const result = parsedDxf.filter(key => requestedLayers.includes(key?.layer) &&
        //        requestedTypes.includes(key?.type));   
        //const result = filterByInclude(parsedDxf, requestedLayers, requestedTypes);       
        devFileLog(result, "result");

        //* building the initial object of layer before inserting all drawings of layer*//
        filteredObj = {
            "version":
            {
                "title":"DXF Converted to JSON",
                "objectName":"???",
                "versionTimestamp":"2021.03.21"
            },
            "metadata":
            {
                "docCreationDateYYYYMMDD" : currentDate(),
                "docCreationTimeHHMMSSSS" : currentTime(),
                "docSourceFileName" : fileName,
                "docExtractorServiceName" : "????",
                "docExtractorServiceVersion" : "????",
                "docRequesterID" : "????", 
                "docSourceDxfUrl" : url,
                "layersExtracted" : [],
                "infoLog" : logMessage,
                "versionNotes": `Currently it only shows entities of type ${requestedTypes}`
            },
            "layerFromDxfSource": []
            /*
            Will have form of:
            {
                "layerName":requestedLayers,
                "layerDrawings":[{},{}],
            }*/
        }    
        //*fills layerDrawings array with json objects describing the drawings*//
        if (result != []) {
            for (let i in result) {
              drawingObject =
              {
                  "code_00_drawingType":result[i]?.type,
                  "code_10_startXeastLng":result[i]?.start?.x ?? result[i]?.x,
                  "code_20_startYnorthLat":result[i]?.start?.y ?? result[i]?.y,
                  "code_30_startZelevation":result[i]?.start?.z ?? result[i]?.z,
                  "code_11_endXeastLng":result[i]?.end?.x ?? result[i]?.x,
                  "code_21_endYnorthLat":result[i]?.end?.y ?? result[i]?.y,
                  "code_31_endZelevation":result[i]?.end?.z ?? result[i]?.z,
                  "code_40_circleArcRadius":result[i]?.r,
                  "code_50_startArcAngle":result[i]?.startAngle,
                  "code_51_endArcAngle":result[i]?.endAngle,
                  "code_vertices":result[i]?.vertices
              }
              //** if in our layer object list there is already an object for that drawing's layer */
              //** then add the drawing to that object's array, otherwise add the missing object*/
              if (layerObject = filteredObj.layerFromDxfSource.find(e => e.layerName === result[i]?.layer)){
                layerObject.layerDrawings.push(drawingObject);
              } else {
                filteredObj.layerFromDxfSource.push({
                  "layerName": result[i]?.layer,
                  "layerDrawings": [drawingObject]
                })
              }

              // create a list of all layers in the post response.
              if (!(filteredObj.metadata.layersExtracted.includes(result[i]?.layer))) {
                filteredObj.metadata.layersExtracted.push(result[i].layer);
              }
            }
        }
        else{
            filteredObj.layerFromDxfSource.layerDrawings[0] = 
                "Error reading drawings, make sure post request is in JSON format and that the url is correct";
        }
        devFileLog(filteredObj, "filteredObj");
        return {json:filteredObj, error:""};
        //* Writes the object as a nice string and writes to file *//
        //let data = util.inspect(filteredObj, false, null);
        //fs.writeFile("./job description/dxf_example_myConvert.txt",data);
    }
    catch(error){
        console.error(error);
    }   
}