const Oldfs = require('fs');
const fs = Oldfs.promises;
const {Helper} = require('dxf');
const util = require('util');
const axios = require('axios');
const {currentDate, currentTime} = require('./dateAndTime');
//url to download dxf:
//https://firebasestorage.googleapis.com/v0/b/webqpm-client-dev.appspot.com/o/files%2Fdxf_example.dxf?alt=media&token=01de6805-5deb-44ca-9e64-66b9789066a3

exports.dxfToJson = async (url,layerName) => {
    try{
        //*reads the dxf file preparing for parsing*//
        //dataString = await fs.readFile(url,"utf8");
        dxfContents =  await axios.get(url);
        dataString = dxfContents?.data;
        fileNameAlmost = dxfContents?.headers["content-disposition"]

        //* parsing the dxf recieving a parsed object  *//
        const helper = new Helper(dataString);
        theObject = helper.parsed.entities;

        //* filters the dxf for requested layers and types within a layer *//
        const requestedLayers = [layerName];
        const requestedTypes = ["LINE", "ARC", "AcDbPolyline", "LWPOLYLINE"];
        //* filters the dxf for requested layers and types within a layer *//

        const result = theObject.filter(key => key?.layer == requestedLayers[0] && //requestedLayers[0] because currently only possible to request a single layer from API.
                    requestedTypes.includes(key?.type));

        //* building the initial object of layer before inserting all drawings of layer*//
        filteredObj = {
            "version":
            {
                "title":"DXF Converted to JSON",
                "objectName":"???",
                "versionTimestamp":"2020.29.12"
            },
            "metadata":
            {
                "docCreationDateYYYYMMDD"  		 : currentDate(),
                "docCreationTimeHHMMSSSS"  		 : currentTime(),
                "docSourceFileName"       		 : fileNameAlmost,
                "docExtractorServiceName"  		 : "????",
                "docExtractorServiceVersion"	 : "????",
                "docRequesterID"		  		 : "????", 
                "docSourceDxfUrl"				 : url
            },
            "layersInDxfSource":requestedLayers[0],
            "layerFromDxfSource":
            {
                "layerName":requestedLayers[0],
                "layerDrawings":[],
            }
        }    
        //*fills layerDrawings array with json objects describing the drawings*//
        if (result != []) {
            for (i in result) {
                filteredObj.layerFromDxfSource.layerDrawings[i] =
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
                    "code_51_endArcAngle":result[i]?.endAngle
                }
            }
        }
        else{
            filteredObj.layerFromDxfSource.layerDrawings[0] = 
                "Error reading drawings, make sure post request is in JSON format and that the url is correct";
        }
        return filteredObj;
        //* Writes the object as a nice string and writes to file *//
        //let data = util.inspect(filteredObj, false, null);
        //fs.writeFile("./job description/dxf_example_myConvert.txt",data);
    }
    catch(error){
        console.error(error);
    }   
}