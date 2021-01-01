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
 * function might be used in the future to determine if the line coordinates are close enough
 * to not repeat them
 */
function approxeq(num1, num2, okRatio){
   
    if (okRatio == null)
        okRatio = 1;

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


    for (i = 0; i < lineArray.length; i++){

        x0 =lineArray[i].code_10_startXeastLng;
        x1 =lineArray[i].code_11_endXeastLng;
        y0 =lineArray[i].code_20_startYnorthLat;
        y1 =lineArray[i].code_21_endYnorthLat;

        point0 = {
            "xLng": x0,
            "yLat": y0,
            "zElv":  0
        }

        point1 = {
            "xLng": x1,
            "yLat": y1,
            "zElv":  0
        }

        if (i == 0) {// initialize first point in polyline 
            polyline.push(point0,point1)
        }
        else {
            lastPoint = polyline[polyline.length-1];
            if (approxeq(x0, lastPoint.xLng) && approxeq(y0, lastPoint.yLat)){
                console.log(`DUPLICATE FOUND ${x0} & ${lastPoint.xLng} \n || ${y0} && ${lastPoint.yLat}`);
                //start of current line is approximetly the same last point in polyline,
                //then push only your end point of current line.
                polyline.push(point1);
            } else {
                polyline.push(point0,point1);
            }
            
        }

    }



    //console.log(`${endX},${endY}`);
    let data = util.inspect(polyline, false, null);
    fs.writeFile('LjToPj_LOGFILE', data);

    //console.log(sortedLines);
}