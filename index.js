const Oldfs = require('fs');
const fs = Oldfs.promises;
const {Helper} = require('dxf');
const util = require('util');

async function changeMe(){
    try{
        dataString = await fs.readFile("./job description/dxf_example.dxf","utf8");
        //console.log(dataString.substring(0,100));
        const helper = new Helper(dataString);
        theObject = helper.parsed.entities;
        
        console.log(util.inspect(helper.parsed, false, null).substring(0,2000));// *logs whole object as is (cut)* //
        console.log("-----------");
        console.log(util.inspect(theObject, false, null).substring(0,2000));// *logs only entities of object(cut)*
        console.log("*********************");
        console.log(theObject[2].layer);//*logs a specific entity's layer name
        //console.dir(helper.parsed);
        fs.writeFile("./job description/dxf_example_myConvert.txt",JSON.stringify(helper.parsed));
        //fs.writeFile("./job description/dxf_example_myConvert.txt",theObject);
    }
    catch(error){
        console.error(error);
    }
}
changeMe();
console.log("hello");