# Dxf-to-Json-API
Google cloud function API that recieves an http request with a dxf url and returns a json file.
do npm build before running.

To deploy to cloud run enter this in the console : 

gcloud functions deploy dxfToJson --entry-point cloudFunction --runtime nodejs14 --trigger-http --allow-unauthenticated  --region europe-west3 --memory 2GB


gcloud functions deploy test-cloudtrigger --runtime nodejs14 --trigger-resource dxf-files --trigger-event google.storage.object.finalize --entry-point cloudFunction --region europe-west3 --memory 1GB 

gcloud auth configure-docker europe-west1-docker.pkg.dev

europe-west1-docker.pkg.dev/first-project-305113/converters-docker-repo/json-converter-api

docker push europe-west1-docker.pkg.dev/first-project-305113/converters-docker-repo/json-converter-api



TODO:

Add to each point made from arc/line a source attribute mentioning they were made from arc/line




