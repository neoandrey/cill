
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