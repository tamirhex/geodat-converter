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

function getMaxAngle(dmax, r) {
    let dhalf = dmax / 2;
    let ehalf = Math.asin(dhalf / r);

    return (ehalf * 2);

}

function distance(point1,lastPoint){
    const x = lastPoint.point.xLng- point1.point.xLng.x;
    const y = lastPoint.point.yLag - point1.point.yLat;
    return Math.sqrt((x*x) + (y*y));
    console.log("distance")
}

const sortByDistance = (pointArray, point) => {
    console.log("Sortying");
    const sorter = (a, b) => distance(a, point) - distance(b, point);
    pointArray.sort(sorter);
 };

function addArcPointsAbs(drawing, polyline, dmax, lastPoint){
    const x0 = drawing.code_10_startXeastLng;
    const y0 = drawing.code_20_startYnorthLat;
    const r = drawing.code_40_circleArcRadius;
    const d0 = drawing.code_50_startArcAngle;
    const d1 = drawing.code_51_endArcAngle;
    const angle_interval = getMaxAngle(dmax, r);
    const angleLimit = d1;
    let pointArray = [];
    let angleArray = [];
    angleArray.push(d0);
    let currentAngle = d0 + angle_interval;
    while (currentAngle <= angleLimit){
        angleArray.push(currentAngle);
        currentAngle += angle_interval;
    }
    //angleArray.push(d0 + 0.3 * (d1 - d0));
    //angleArray.push(d0 + 0.5 * (d1 - d0));
    //angleArray.push(d0 + 0.7 * (d1 - d0)); //debugging
    
    angleArray.push(d1);
    //console.log(angleArray);  
    let flag = false; //debugging 
    // Now I have a list of angles to create points from them to resemble an arc
    let counter = 0; //debugging
    for (const angle of angleArray) {
        let angleInRadians = angle * (Math.PI / 180);
        let dx = r * Math.cos(angle);
        let dy = r * Math.sin(angle);

        
        
        let point = {
            'point': {
                "xLng": x0 + dx,
                "yLat": y0 + dy,
                "zElv":  0,
                "fromArc": counter
            }
        }
        /*
        if(x0 + dx > 214447.9 && x0 + dx < 214471.2 && y0 + dy > 630934 && y0 + dy < 630937 ) {
            //console.log(`d0 is ${d0} d1 is ${d1} angleArray is ${angleArray}`);
            //console.log(`x,y is (${x0+dx},${y0+dy}) with counter = ${counter} r = ${r} and dinterval as ${angle_interval}`);
            //console.log(`dx = ${dx} dy = ${dy} cos(angle) = ${Math.cos(angle)} sin(angle) = {${Math.sin(angle)}}`);
            flag = true; // debugging
        }*/
        
       
        counter++; //debugging
        
        pointArray.push(point);
    }
    /*
    if(!(lastPoint.point.xLng == 0 && lastPoint.point.yLat == 0))
        //sortByDistance(pointArray, lastPoint);
    if ( flag ) {
        let data = util.inspect(pointArray,{maxArrayLength: null, depth:null});
        fs.writeFile("pointArray", data);
    }*/
    polyline.push(...pointArray);
    return pointArray[pointArray.length - 1];
    //if(flag == true) console.log(`--------------------------------`);


}

function addArcPoints(drawing, polyline, dmax) {
    // For ARC type, there is only center x,y ; so startX is same as endX, so is for y.
    const x0 = drawing.code_10_startXeastLng;
    const y0 = drawing.code_20_startYnorthLat;
    const r = drawing.code_40_circleArcRadius;
    const d0 = drawing.code_50_startArcAngle;
    const d1 = drawing.code_51_endArcAngle;

    pointArray = [];
    for (let i = 1; i <= 19; i++) {
        let angle = d0 + ((i * 5) / 100) * (d1 - d0);
        let angleInRadians = angle * (Math.PI / 180);
        
        let dx = r * Math.cos(angleInRadians);
        let dy = r * Math.sin(angleInRadians);

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
    

}

//**DxfJsonInitial and Pj stands for Polyline json */
exports.add_pointarray = async (DxfJsonI, dmax) => {
    let drawingsArray = DxfJsonI.layerFromDxfSource.layerDrawings;
    let polyline = [];
    let lastPoint = {'point' : {"xLng": 0,"yLat": 0,"zElv":  0}};// initialize, used to not put repeated points
    for (let i = 0; i < drawingsArray.length; i++) {
        if (drawingsArray[i].code_00_drawingType == 'LINE') {
            lastPoint = addLinePoints(drawingsArray[i], polyline, lastPoint);
        } else if (drawingsArray[i].code_00_drawingType == 'ARC') {
            lastPoint = addArcPointsAbs(drawingsArray[i], polyline, dmax,lastPoint);
        }
    }

    sortByDistance(polyline,polyline[0]);

      




    DxfJsonI.layerFromDxfSource.polyline = polyline;
    delete DxfJsonI.layerFromDxfSource.layerDrawings;

    /*
    // for debugging purposes
    let data = util.inspect(polyline, false, null);
    fs.writeFile('./job description/DxfJsonIToPj_LOGFILE', data);
    */

    return DxfJsonI;

}
