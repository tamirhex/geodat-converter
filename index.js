const {DxfToJson}= require("./DxfToJson");
const Oldfs = require('fs');
const fs = Oldfs.promises;
const {Helper} = require('dxf');
const util = require('util');
const request = require('request');


function currentDate(){
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    return yyyy + '.' + mm + '.' + dd;
}



let fileName = "dxf_example.dxf";
url = `./job description/${fileName}`;
async function banana(){
dataString = await request.get("https://firebasestorage.googleapis.com/v0/b/webqpm-client-dev.appspot.com/o/files%2Fdxf_example.dxf?alt=media&token=01de6805-5deb-44ca-9e64-66b9789066a3");
console.log(dataString);
fs.writeFile("./job description/deleteMe.txt",dataString);
}

DxfToJson(url,"PMISUNDER");

