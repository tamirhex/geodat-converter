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


function addLinePoints(drawing, polyline, lastPoint){
    x0 = drawing.code_10_startXeastLng;
    x1 = drawing.code_11_endXeastLng;
    y0 = drawing.code_20_startYnorthLat;
    y1 = drawing.code_21_endYnorthLat;
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


    if (lastPoint.point.xLng == 0) {// initialize first point in polyline 
        polyline.push(point0,point1)
    }
    else {
        if (approxeq(x0, lastPoint.point.xLng) && approxeq(y0, lastPoint.point.yLat)){
            //start of current line is approximetly the same last point in polyline,
            //then push only your end point of current line.
            polyline.push(point1);
        } else {
            polyline.push(point0,point1);
        }   
    }
    return point1;
}

function addArcPoints(drawing, polyline) {
    // For ARC type, there is only center x,y ; so startX is same as endX, so is for y.
    xc = drawing.code_10_startXeastLng;
    yc = drawing.code_20_startYnorthLat;

    let centerPoint = {'point': {
        "xLng": xc,
        "yLat": yc,
        "zElv":  0
        }
    }
    console.log(`pushing point ${centerPoint.point.xLng},${centerPoint.point.yLat}`);
    polyline.push(centerPoint)
}

//**Lj stands for Line Json and Pj stands for Polyline json */
exports.add_pointarray = async (Lj) => {
    let drawingsArray = Lj.layerFromDxfSource.layerDrawings;
    //console.dir(drawingsArray);
    let polyline = [];
    let lastPoint = {'point' : {"xLng": 0,"yLat": 0,"zElv":  0}};
    for (let i = 0; i < drawingsArray.length; i++) {
        if (drawingsArray[i].code_00_drawingType == 'LINE') {
            lastPoint = addLinePoints(drawingsArray[i], polyline, lastPoint);
        } else if (drawingsArray[i].code_00_drawingType == 'ARC') {
            addArcPoints(drawingsArray[i], polyline);
        }
    }

      




    Lj.layerFromDxfSource.polyline = polyline;
    delete Lj.layerFromDxfSource.layerDrawings;

    
    let data = util.inspect(polyline, false, null);
    fs.writeFile('LjToPj_LOGFILE', data);

    return Lj;

    //console.log(sortedLines);
}
