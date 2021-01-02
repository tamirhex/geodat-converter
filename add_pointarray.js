//files and util for logging purposes
const Oldfs = require('fs');
const fs = Oldfs.promises;
const util = require('util');


/**
 * 
 * @param {number} num1 
 * @param {number} num2 
 * @param {number} okRatio 
 * @return {boolean} 
 * function might be used in the future to determine if the line coordinates are close enough
 * to not repeat them
 */
function approxeq(num1, num2, okRatio) {
    if (okRatio == null)
        okRatio = 1;

    activeRatio = num2 / num1;
    // calculation is taking the "absolulte value" but in division,
    // so num1&num2 are interchangeable
    if (activeRatio >= okRatio && activeRatio <= 2 - okRatio) {
        return true;
    } else {
        return false;
    }
}


//**Lj stands for Line Json and Pj stands for Polyline json */
exports.add_pointarray = async (Lj) => 
{
    lineArray = Lj.layerFromDxfSource.layerDrawings;
    polyline = [];

    for (i = 0; i < lineArray.length; i++){

        x0 =lineArray[i].code_10_startXeastLng;
        x1 =lineArray[i].code_11_endXeastLng;
        y0 =lineArray[i].code_20_startYnorthLat;
        y1 =lineArray[i].code_21_endYnorthLat;

        point0 = {
            'point': {
                "xLng": x0,
                "yLat": y0,
                "zElv":  0
            }
        }
        point1 = {
            'point': {
                "xLng": x1,
                "yLat": y1,
                "zElv":  0
            }
        }


        if (i == 0) {// initialize first point in polyline 
            polyline.push(point0,point1)
        }
        else {
            lastPoint = polyline[polyline.length-1].point;
            if (approxeq(x0, lastPoint.xLng) && approxeq(y0, lastPoint.yLat)){
                //start of current line is approximetly the same last point in polyline,
                //then push only your end point of current line.
                polyline.push(point1);
            } else {
                polyline.push(point0,point1);
            }   
        }
    }



    Lj.layerFromDxfSource.polyline = polyline;
    delete Lj.layerFromDxfSource.layerDrawings;

    
    let data = util.inspect(polyline, false, null);
    fs.writeFile('LjToPj_LOGFILE', data);

    return Lj;

    //console.log(sortedLines);
}