
$projectName="cill"
$projectID="cill-437521"
$instances =  1                                        
$region="northamerica-northeast1"  
$serviceAccount ="cillservice@cill-437521.iam.gserviceaccount.com"

$prodParams= Get-Content -path "$PSScriptRoot\default_settings\prod_build_params.json"
$envVars =( $prodParams -replace('"\s*:\s*', '=')).Replace('"',"").Replace("{","").Replace("}","") 
$envVars =$envVars.Split(',')|?{!$_.Contains("PORT")}|?{![string]::IsNullOrWhiteSpace($_.toString())}|%{$_.toString().trim()} 
$envVars  = $envVars -join ","
$envVars  =$envVars.Replace(" ","")
$deployParameters = @{ 
   "maxInstances" = $instances;
   "port" = 5000;
   "envVars" = $envVars #"FLASK_APP=$($projectName).py,FLASK_ENV=production,MONGODB_DB=$($projectName),REDIS_QUEUE_NAME=$($projectName),REDIS_URL=$($projectName)";
   "region" = "$($region)"; "serviceAccount" = $serviceAccount; "containerRepo" = "docker.io/neoandrey/$($projectName)" 
};

$deployParameters = $deployParameters | Convertto-JSON
  .\docker_build_prod.ps1; docker tag cill neoandrey/cill; docker push neoandrey/cill; .\gcp_deploy.ps1 -projectName "cill" -projectID $projectID -deploy $true -setProjectID $true -deployParams $deployParameters;


#   $parameters  =@{}
#   $parameters.projectID="cill-437521"
#   $parameters.bucketName="cill-uploads-bkt"
#   $parameters.storageClass="STANDARD"
#   $parameters.bucketLocation="northamerica-northeast1" 
#   $parameters = $parameters| Convertto-JSON

#   .\gcp_deploy.ps1 -solution "bucket" -solutionParams $parameters

$parameters  =@{}
#   $parameters.projectID="cill-437521"
#   $parameters.bucketName="cill-uploads-bkt"
#   $parameters.storageClass="STANDARD"
#   $parameters.bucketLocation="northamerica-northeast1" 
#   $parameters = $parameters| Convertto-JSON

#   .\gcp_deploy.ps1 -solution "bucket" -solutionParams $parameters

# $parameters  =@{}
# $parameters.poolID="cill-wip"
# $parameters.poolDisplayName="CILL WIP"
# $parameters.poolLocation="global"
# $parameters.poolDescription="CILL Federation Identity"
# $parameters = $parameters| Convertto-JSON

# .\gcp_deploy.ps1 -solution "workloadidentitypool" -solutionParams $parameters


# $parameters  =@{}

# $parameters.providerID="github"
# $parameters.poolID="cill-wip"
# $parameters.poolDisplayName="CILL WIP"
# $parameters.poolLocation="global"
# $parameters.issuerURI=$null
# # $parameters.allowedAudiences
# $parameters.attributeMapping="google.subject=assertion.subject,attribute.actor=assertion.actor,attribute.aud=assertion.aud,attribute.repository=assertion.repository"
# $parameters.attributeCondition="assertion.repository=='neoandrey/cill'"

# $parameters = $parameters| Convertto-JSON

# .\gcp_deploy.ps1 -solution "workloadidentitypoolprovider" -solutionParams $parameters


# $parameters  =@{}

# $parameters.projectID ="cill-437521"
# $parameters.member="serviceAccount:cillservice@cill-437521.iam.gserviceaccount.com"
# $parameters.role = "roles/iam.workloadIdentityUser"
# $parameters.condition = $null

# $parameters = $parameters| Convertto-JSON

# .\gcp_deploy.ps1 -solution "iampolicybinding" -solutionParams $parameters


$parameters  =@{}

$parameters.serviceAccount ="cillservice@cill-437521.iam.gserviceaccount.com"
$parameters.member="principal://iam.googleapis.com/projects/355157875042/locations/global/workloadIdentityPools/cill-wip/subject/SUBJECT"
$parameters.role = "roles/iam.workloadIdentityUser"
$parameters.condition = $null

$parameters = $parameters| Convertto-JSON

.\gcp_deploy.ps1 -solution "iampolicybinding" -solutionParams $parameters


gcloud iam service-accounts add-iam-policy-binding SERVICE_ACCOUNT_EMAIL \
    --role=roles/iam.workloadIdentityUser \
    --member="principal://iam.googleapis.com/projects/PROJECT_NUMBER/"