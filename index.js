const Oldfs = require('fs');
const fs = Oldfs.promises;
const {Helper} = require('dxf');
const util = require('util');
const { type } = require('os');

function currentDate(){
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    return yyyy + '.' + mm + '.' + dd;
}
async function changeMe(){
    try{
        let fileName = "dxf_example.dxf";
        dataString = await fs.readFile(`./job description/${fileName}`,"utf8");
        //console.log(dataString.substring(0,100));
        const helper = new Helper(dataString);
        theObject = helper.parsed.entities;
        
        console.log(util.inspect(helper.parsed, false, null).substring(0,2000));// *logs whole object as is (cut)* //
        console.log("-----------");
        console.log(util.inspect(theObject, false, null).substring(0,2000));// *logs only entities of object(cut)*
        console.log("*********************");
        console.log(theObject[2].layer);//*logs a specific entity's layer name
        const requestedLayer = "PMISUNDER";
        const result = theObject.filter(key => key.layer == requestedLayer);
        filteredObj = {
            "version":
            {
                "title": "DXF Converted to JSON",
                "objectName": fileName,
                "versionTimestamp": "2020.28.12"
            },
            "metadata":"bebe",
            "layersInDxfSource":"",
            "layerFromDxfSource":
            {
                "layername":"",
                "code_00_drawingType"    : result[0]?.type,
				"code_10_startXeastLng"  : "string",
				"code_20_startYnorthLat" : "string",
				"code_30_startZelevation": "string",
				"code_11_endXeastLng"    : "string",
				"code_21_endYnorthLat"   : "string",
				"code_31_endZelevation"  : "string",
				"code_40_circleArcRadius": "string",
				"code_50_startArcAngle"  : "string",
				"code_51_endArcAngle"    : "string"
            }
        } 
        console.dir(filteredObj);   
        //console.log(result);
        fs.writeFile("./job description/dxf_example_myConvert.txt",JSON.stringify(helper.parsed));
    }
    catch(error){
        console.error(error);
    }
}
changeMe();
console.log("hello");