//files and util for logging purposes
const Oldfs = require('fs');
const fs = Oldfs.promises;
const util = require('util');


// Helper function for cleaner access to x,y properties of line.
function cords(lineObject){
    let obj = {
        'x0': lineObject.code_10_startXeastLng,
        'x1': lineObject.code_11_endXeastLng,
        'y0': lineObject.code_20_startYnorthLat,
        'y1': lineObject.code_21_endYnorthLat
    }
    return obj;
}


/**
 * 
 * @param {number} num1 
 * @param {number} num2 
 * @param {number} okRatio 
 * @return {boolean} 
 */
function approxeq(num1, num2, okRatio){
   
    if (okRatio == null)
        okRatio = 0.999999999999999999999999999999;

    activeRatio = num2 / num1;
    //console.log(`activeRatio = ${num2} / ${num1} = ${activeRatio}`);
    if(activeRatio >= okRatio && activeRatio <= 2 - okRatio)
        return true;
    else
        return false;
}


//**Lj stands for Line Json and Pj stands for Polyline json */
exports.LjToPj = async (Lj) => 
{
    endX = Lj.layerFromDxfSource.layerDrawings[0]
    .code_11_endXeastLng;

    endY = Lj.layerFromDxfSource.layerDrawings[0]
    .code_21_endYnorthLat;

    lineArray = Lj.layerFromDxfSource.layerDrawings;
    polyline = [];

    for (i in lineArray){
        point = {
            "xLng": undefined,
            "yLat": undefined,
            "zElv" :  0
        }
        if(i == 0){
            polyline[i] = lineArray[i];
        }
        else{
            
            if(approxeq(cords(lineArray[i-1]).x1,cords(lineArray[i]).x0) &&
                approxeq(cords(lineArray[i-1]).y1,cords(lineArray[i]).y0)) {
                    console.log(i);
                    //end of previous line is about the same as start of proceeding line:
                    
                        console.log(`
                        ${cords(lineArray[i-1]).x1} approx ${cords(lineArray[i]).x0} is
                        ${approxeq(cords(lineArray[i-1]).x1,cords(lineArray[i]).x0)}`
                        );
                    polyline[i] = lineArray[i];  
                }


        }

    }



    //console.log(`${endX},${endY}`);
    let data = util.inspect(polyline, false, null);
    //fs.writeFile('LjToPj_LOGFILE', data);

    //console.log(sortedLines);
}