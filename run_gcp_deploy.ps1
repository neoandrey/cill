function Get-ParameterValue {
   # Specifies a path to one or more locations. Wildcards are permitted.
   param([Parameter(Mandatory = $true,
         Position = 0,
         ValueFromPipeline = $true,
         ValueFromPipelineByPropertyName = $true,
         HelpMessage = "Name of parameter")]
      [ValidateNotNullOrEmpty()]
      [SupportsWildcards()]
      [string]
      $paramName
      , [Parameter(Mandatory = $false,
         Position = 1,
         ValueFromPipeline = $true,
         ValueFromPipelineByPropertyName = $true,
         HelpMessage = "Default value to use if no value is provided")]
      [ValidateNotNullOrEmpty()]
      [string]
      $defaultValue = $null
   
   )
 

   while ( ($null -eq $paramValue -or $paramValue -eq "")  ) {    

      $paramValue = Read-Host  "Please provide a value for the $paramName"
   
      if ($null -eq $paramValue) {

         $paramValue = $defaultValue
      }
   }

   write-host "$paramName has been set to: $paramValue"
   return  $paramValue 
   
}

$test = Get-ParameterValue "Test"

.\gcp_deploy.ps1 -init $true

.\gcp_deploy.ps1 -auth $true


.\gcp_deploy.ps1 -listProjects $true


$projectID = $null
$projectName = $null

$projectName = Get-ParameterValue "Project Name"
$projectID = Get-ParameterValue "Project ID"

.\gcp_deploy.ps1 -setProjectID $True -projectID  $projectID

.\gcp_deploy.ps1 -listBillingAc  $True

$billingAccountID = Get-ParameterValue  "Billing Account ID"

.\gcp_deploy.ps1 -projectName $projectName -projectID $projectID -linkBillingAc $True -billingAccount $billingAccountID

.\gcp_deploy.ps1 -listServiceAccounts $True

 
$serviceAccount = Get-ParameterValue  "Service Account Email Address or Type 'NEW' to create a new service account"
$serviceAccountName = $null
$serviceAccountDescription = $null 
$serviceAccountDisplayName = $Null 


if ($serviceAccount.toLower() -eq "new") {
   $serviceAccountName = Get-ParameterValue  "Service Account Name"
   $serviceAccountDescription = Get-ParameterValue  "Service Account Description"
   $serviceAccountDisplayName = Get-ParameterValue  "Service Account Display Name"


   .\gcp_deploy.ps1 -createServiceAccount $True -serviceAccountName $serviceAccountName  -serviceAccountDescription $serviceAccountDescription  -serviceAccountDisplayName  $serviceAccountDisplayName  -projectID $projectID
 
   $serviceAccount = "serviceAccount:$($serviceAccountName)@$($projectID).iam.gserviceaccount.com" 

}
elseif ([string]::IsNullOrEmpty($serviceAccount) -and -not $serviceAccount.StartsWith("serviceAccount:") ) {
   $serviceAccount = "serviceAccount: $($serviceAccount)"
}


$region = Get-ParameterValue "GCP Region" "northamerica-northeast1"
$instances = Get-parameterValue "Number of instances" 1

$deployParameters = @{ 
   "maxInstances" = $instances;
   "port" = 5000;
   "envVars" = "FLASK_APP=$($projectName).py,FLASK_ENV=production,MONGODB_DB=$($projectName)db,REDIS_QUEUE_NAME=$($projectName)_QUEUE";
   "region" = "$($region)"; "serviceAccount" = $serviceAccount; "containerRepo" = "docker.io/neoandrey/$($projectName)" 
};

$deployParameters = $deployParameters | Convertto-JSON

.\gcp_deploy.ps1 -projectName $projectName -projectID $projectID -deploy  $True -deployParams $deployParameters