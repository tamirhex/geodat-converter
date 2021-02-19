# Dxf-to-Json-API
Google cloud function API that recieves an http request with a dxf url and returns a json file.
do npm build before running.

To deploy to cloud run enter this in the console : 

gcloud functions deploy dxfToJson --entry-point cloudFunction --runtime nodejs14 --trigger-http --allow-unauthenticated  --region europe-west3 --memory 2GB




