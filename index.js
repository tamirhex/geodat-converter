const { getLayers } = require("./modules/getLayers");
const { get_layers_nonhex } = require("./modules/get_layers_nonhex");
const { hexsoft_convert } = require("./modules/hexsoft-convert");
const { useMyGeoAPI } = require("./modules/mygeodata_api");
const { postSchema } = require('./middleware/formValidation');
const {checkSchema, validationResult} = require('express-validator');
const express = require('express');
const app = express();

app.use(express.json());


app.post('/', checkSchema(postSchema), async function (req, res) {
  // Validates incoming input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({
          errors: errors.array()
      });
    }
  const outcords = req.body.outcords;
  const incords = req.body.incords;
  let outformat = req.body.outformat;
  if (outcords && !incords) {
      return res.status(400).send("When assigning 'outcords' you should also assign" +
        "'incords' otherwise output cordinates can be incorrect");
  }
  
  // Decides if to use mygeodata api or not.
  if (outformat !== "hexsoft-json"){
    useMyGeoAPI(req,res);
  } else {
    hexsoft_convert(req,res);
  }
})

app.post('/getlayers', async function (req, res) {
  const {url, legacy}= req.body;
  let layers, error;
  //legacy means it gets layers of soon to be deprecated hexsoft-json
  if (legacy == true) {
    ({ layers, error } = await getLayers(url));
  } else {
    ({ layers, error } = await get_layers_nonhex(req, res));
  }
  if (error) return res.status(400).send(error);
  res.send(layers);
})

app.get('/', (req, res) => {
  res.send('Hello, geo-converter-api is running!');
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`environment is ${process.env.NODE_ENV}`);
  console.log(`Server listening on port ${PORT}...`);
});
  



