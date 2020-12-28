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
        const requestedLayers = ["PMISUNDER"];
        const requestedTypes = ["LINE"];
        //* filters the dxf for requested layers and types within a layer *//
        const result = theObject.filter(key => requestedLayers[0] && //*requestedLayers[0] because currently only possible to request a single layer from API.
                    requestedTypes.includes(key.type));
        //let i = 0 //temporary-deleteme.
        let data = "";
        filteredObj = {
            "version":
            {
                "title":"DXF Converted to JSON",
                "objectName":fileName,
                "versionTimestamp":"2020.28.12"
            },
            "metadata":"Will be added later",
            "layersInDxfSource":"will be added later",
            "layerFromDxfSource":
            {
                "layerName":requestedLayers[0],
                "layerDrawings":[],
                /*
                "code_00_drawingType":result[i]?.type,
				"code_10_startXeastLng":result[i]?.start?.x,
				"code_20_startYnorthLat":result[i]?.start?.y,
				"code_30_startZelevation":result[i]?.start?.z,
				"code_11_endXeastLng":result[i]?.end?.x,
				"code_21_endYnorthLat":result[i]?.end?.y,
				"code_31_endZelevation":result[i]?.end?.z,
				"code_40_circleArcRadius":result[i]?.r,
				"code_50_startArcAngle":result[i]?.startAngle,
                "code_51_endArcAngle":result[i]?.endAngle
                */
            }
        } 
        //let data = JSON.stringify(filteredObj);
        //data += util.inspect(filteredObj, false, null);
        //console.log(data);   

        for(i in result){
            filteredObj.layerFromDxfSource.layerDrawings[i] = 
            {
                "code_00_drawingType":result[i]?.type,
                "code_10_startXeastLng":result[i]?.start?.x,
                "code_20_startYnorthLat":result[i]?.start?.y,
                "code_30_startZelevation":result[i]?.start?.z,
                "code_11_endXeastLng":result[i]?.end?.x,
                "code_21_endYnorthLat":result[i]?.end?.y,
                "code_31_endZelevation":result[i]?.end?.z,
                "code_40_circleArcRadius":result[i]?.r,
                "code_50_startArcAngle":result[i]?.startAngle,
                "code_51_endArcAngle":result[i]?.endAngle
            }

            data = util.inspect(filteredObj, false, null);
        }
        //fs.writeFile("./job description/dxf_example_myConvert.txt",JSON.stringify(helper.parsed));
        fs.writeFile("./job description/dxf_example_myConvert.txt",data);
    }
    catch(error){
        console.error(error);
    }
}
changeMe();
console.log("hello");