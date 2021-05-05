exports.getLayers = () => {
  const {url, outformat, incords, outcords, layers_mygeodata} = req.body;
  const apikey = process.env.APIKEY;
  const cloudfunction_url = process.env.APICLOUDFUNCTION ?? 
      "https://europe-west1-first-project-305113.cloudfunctions.net/mygeodata_api";

}

