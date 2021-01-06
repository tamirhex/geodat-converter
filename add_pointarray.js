/**
 * add_pointarray takes an intial veresion of Dxf json, with just drawing types
 * and their attributes, and turns those drawings and attributes (specifically coordinates attributes)
 * and extracts points out of them, with some rules as to how the points are taken
 * depending on drawing type, e.g 'ARC' or 'LINE'.
 * 
 */
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
 * to not repeat them, right now the ratio is 1 so this method is equivalent to regular '==' operator.
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
    let x0 = drawing.code_10_startXeastLng;
    let y0 = drawing.code_20_startYnorthLat;
    let r = drawing.code_40_circleArcRadius;
    let d0 = drawing.code_50_startArcAngle;
    let d1 = drawing.code_51_endArcAngle;
    let pointArray = [];
    for (let i = 1; i <= 19; i++) {
        let angle = d0 + ((i * 5) / 100) * (d1 - d0);
        let dx = r * Math.cos(angle);
        let dy = r * Math.sin(angle);

        let point = {
            'point': {
                "xLng": x0 + dx,
                "yLat": y0 + dy,
                "zElv":  0,
               // "fromArc": i for debugging
            }
        }
        pointArray.push(point);
    }
    polyline.push(...pointArray);
/*
    let middleAngle = (d0 + d1)/2;
    let dx = r * Math.cos(middleAngle);
    let dy = r * Math.sin(middleAngle);


    let centerPoint = {'point': {
        "xLng": x0 + dx,
        "yLat": y0 + dy,
        "zElv":  0
        }
    }
    polyline.push(centerPoint)*/
}

//**DxfJsonInitial and Pj stands for Polyline json */
exports.add_pointarray = async (DxfJsonI) => {
    let drawingsArray = DxfJsonI.layerFromDxfSource.layerDrawings;
    let polyline = [];
    let lastPoint = {'point' : {"xLng": 0,"yLat": 0,"zElv":  0}};// initialize, used to not put repeated points
    for (let i = 0; i < drawingsArray.length; i++) {
        if (drawingsArray[i].code_00_drawingType == 'LINE') {
            lastPoint = addLinePoints(drawingsArray[i], polyline, lastPoint);
        } else if (drawingsArray[i].code_00_drawingType == 'ARC') {
            addArcPoints(drawingsArray[i], polyline);
        }
    }

      




    DxfJsonI.layerFromDxfSource.polyline = polyline;
    delete DxfJsonI.layerFromDxfSource.layerDrawings;

    /*
    // for debugging purposes
    let data = util.inspect(polyline, false, null);
    fs.writeFile('./job description/DxfJsonIToPj_LOGFILE', data);
    */

    return DxfJsonI;

}
