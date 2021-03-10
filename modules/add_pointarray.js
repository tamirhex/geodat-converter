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

function getLinePoints(drawing, counter){
    const x0 = drawing.code_10_startXeastLng;
    const x1 = drawing.code_11_endXeastLng;
    const y0 = drawing.code_20_startYnorthLat;
    const y1 = drawing.code_21_endYnorthLat; 

    const pointi = {
        'point': {
            "xLng": x0,
            "yLat": y0,
            "zElv":  0
        }
    }

    const pointm = {
        'point': {
            "xLng": (x1 - x0) / 2 + x0,
            "yLat": (y1 - y0) / 2 + y0,
            "zElv":  0
        }
    }

    const pointf = {
        'point': {
            "xLng": x1,
            "yLat": y1,
            "zElv":  0
        }
    }

    //We find the angle compared to the middle point to know the orientation of the line
    //Therefore we look at middle as (0,0),and get the angle with the cordinates of the final point
    const y = pointf.point.yLat - pointm.point.yLat;
    const x = pointf.point.xLng; - pointf.point.XLng;

    const angle = Math.atan2(y, x); // IN RADIANS

    const pointsObject = {
        'pointi' : pointi,
        'pointm' : pointm,
        'pointf' : pointf,
        'angle' : angle,
        'counter' : counter
    }
    //sectionsArray[i].pointi.point.xLng
    return pointsObject;
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
function addArcPointsAbs(drawing, polyline, dmax){
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
    angleArray.push(d1);
    //console.log(angleArray);  

    // Now I have a list of angles to create points from them to resemble an arc
    //let counter = 0; //debugging
    let angle1 = d0;
    for (const angle of angleArray) {
        let dx = r * Math.cos(angle);
        let dy = r * Math.sin(angle);
        
        let point = {
            'point': {
                "xLng": x0 + dx,
                "yLat": y0 + dy,
                "zElv":  0,
                //"fromArc": counter
            }
        }
        //counter++; //debugging
        pointArray.push(point);
    }
    

    polyline.push(...pointArray);
    


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
        //let angle = d0 + ((i * 5) / 100) * (d1 - d0);
        let angle = d0 + 0.05;
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
    

}

//**DxfJsonInitial and Pj stands for Polyline json */
exports.add_pointarray = async (DxfJsonI, dmax, sections) => {
    let layerObjArray = DxfJsonI.layerFromDxfSource;
    for (let i in layerObjArray){ 
      let drawingsArray = DxfJsonI.layerFromDxfSource[i].layerDrawings;
      if(!(sections.includes(layerObjArray[i].layerName))){
          console.log("not in sections");
          let polyline = [];
          let lastPoint = {'point' : {"xLng": 0,"yLat": 0,"zElv":  0}};// initialize, used to not put repeated points
          for (let i = 0; i < drawingsArray.length; i++) {
              if (drawingsArray[i].code_00_drawingType == 'LINE') {
                  lastPoint = addLinePoints(drawingsArray[i], polyline, lastPoint);
              } else if (drawingsArray[i].code_00_drawingType == 'ARC') {
                  addArcPointsAbs(drawingsArray[i], polyline, dmax);
              }
          }
          DxfJsonI.layerFromDxfSource[i].polyline = polyline;
      }
      else{ //IN LAYER OF SECTIONS
          console.log("in sections area");
          let sectionCounter = 0;
          let sectionLineArray = [];
          for (let i = 0; i < drawingsArray.length; i++) {
              if (drawingsArray[i].code_00_drawingType == 'LINE'){
                  sectionLine = getLinePoints(drawingsArray[i], sectionCounter);
                  sectionCounter++;
                  sectionLineArray.push(sectionLine);
              }
          }
          DxfJsonI.layerFromDxfSource[i].sectionsArray = sectionLineArray;
      }


        




      
      delete DxfJsonI.layerFromDxfSource[i].layerDrawings;
  }

    /*
    // for debugging purposes
    let data = util.inspect(polyline, false, null);
    fs.writeFile('./job description/DxfJsonIToPj_LOGFILE', data);
    */

    return DxfJsonI;

}
