$deployParameters=@{
    "maxInstances"=1;
    "port"=5000;
    "envVars"="FLASK_APP=cill.py,FLASK_ENV=production,MONGODB_DB=cilldb,MONGODB_URL=mongodb+srv://neo:M0ng0DB123@neocrystalclstr01.fv9vk.mongodb.net/cill?retryWrites=true^&w=majority,SESSION_TYPE=redis,REDIS_URL=redis://default:Red1scill123!@redis-11987.c280.us-central1-2.gce.cloud.redislabs.com:11987,REDIS_QUEUE_NAME=cilldb";
    "region"="northamerica-northeast1";"serviceAccount"="cill-69@cill-422314.iam.gserviceaccount.com";"containerRepo"="docker.io/neoandrey/cill" 
    };
    $deployParameters=$deployParameters|Convertto-JSON
    
     .\gcp_deploy.ps1 -projectName "cill" -projectID cill-422314 -deploy $true -deployParams $deployParameters