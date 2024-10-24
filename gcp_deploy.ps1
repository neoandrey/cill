param(
    [Parameter(Mandatory = $False, Position = 0, ValueFromPipelineByPropertyName = $true)][string]$projectName
    , [Parameter(Mandatory = $False, Position = 1, ValueFromPipelineByPropertyName = $true)][string]$projectID
    , [Parameter(Mandatory = $False, Position = 2, ValueFromPipelineByPropertyName = $true)][boolean]$createProject = $False
    , [Parameter(Mandatory = $False, Position = 3, ValueFromPipelineByPropertyName = $true)][boolean]$init = $False
    , [Parameter(Mandatory = $False, Position = 4, ValueFromPipelineByPropertyName = $true)][boolean]$auth = $False
    , [Parameter(Mandatory = $False, Position = 5, ValueFromPipelineByPropertyName = $true)][boolean]$setProjectID = $False
    , [Parameter(Mandatory = $False, Position = 6, ValueFromPipelineByPropertyName = $true)][boolean]$listAccounts = $False
    , [Parameter(Mandatory = $False, Position = 6, ValueFromPipelineByPropertyName = $true)][boolean]$listServiceAccounts = $False
    , [Parameter(Mandatory = $False, Position = 7, ValueFromPipelineByPropertyName = $true)][boolean]$listProjects = $False
    , [Parameter(Mandatory = $False, Position = 8, ValueFromPipelineByPropertyName = $true)][boolean]$listBillingAc = $False
    , [Parameter(Mandatory = $False, Position = 9, ValueFromPipelineByPropertyName = $true)][boolean]$linkBillingAc = $False
    , [Parameter(Mandatory = $False, Position = 10, ValueFromPipelineByPropertyName = $true)][string]$billingAccount
    , [Parameter(Mandatory = $False, Position = 11, ValueFromPipelineByPropertyName = $true)][boolean]$deploy = $False
    , [Parameter(Mandatory = $False, Position = 12, ValueFromPipelineByPropertyName = $true)][string]$deployParams
    , [Parameter(Mandatory = $False, Position = 13, ValueFromPipelineByPropertyName = $true)][boolean]$createServiceAccount = $False
    , [Parameter(Mandatory = $False, Position = 14, ValueFromPipelineByPropertyName = $true)][string]$serviceAccountName
    , [Parameter(Mandatory = $False, Position = 15, ValueFromPipelineByPropertyName = $true)][string]$serviceAccountDescription
    , [Parameter(Mandatory = $False, Position = 16, ValueFromPipelineByPropertyName = $true)][string]$serviceAccountDisplayName
)

$cmdPrefix = ""
#$projectName = "cill"
#$projectID   = "$($projectName)-422314"
$gcloudContainerName = "gcloud-cli"

function Run-Command {
    param(
        [Parameter(Mandatory = $true)][string] $command
        , [Parameter(Mandatory = $false)][boolean] $interactive = $false
    )

    if ($interactive -eq $true) {

        $cmdPrefix = "docker exec -it $gcloudContainerName "
        start-process -filepath "powershell.exe" -argumentList @($cmdPrefix, $command) -WindowStyle Maximized -wait

    }
    else {
        $cmdPrefix = "docker exec $gcloudContainerName "
        "$cmdPrefix $command" | cmd 

    }
 
 
}

#$command= "docker pull google/cloud-sdk:alpine"
#$command | cmd 

if ($init -eq $True) { 

    $command = "docker rm -f $gcloudContainerName"
    $command | cmd 
    $command = "docker run --restart=always -d -v .:/opt/$projectName --name $gcloudContainerName  google/cloud-sdk:alpine tail -f /dev/null"
    $command | cmd 
    
}

if ($auth -eq $True) {
    $command = "gcloud auth login"
    Run-Command $command $true
}

if ($createProject -eq $True) { 
    $command = "gcloud projects create $projectName --set-as-default"
    Run-Command $command
}


if ($setProjectID -eq $True) { 
    $command = "gcloud config set project $projectID"
    Run-Command $command
}

if ($listAccounts -eq $True) { 
    $command = "gcloud auth list"
    Run-Command $command
}

if ($listProjects -eq $True) {
    #$command= "gcloud config list project"
    $command = "gcloud projects list"
    Run-Command $command

}
if ($listBillingAc -eq $True) {
    $command = "gcloud services enable cloudbuild.googleapis.com"
    Run-Command $command
    $command = "gcloud --quiet beta billing accounts list"
    Run-Command $command
}

if ($linkBillingAc -eq $True) {
    $command = "gcloud services enable cloudbuild.googleapis.com"
    Run-Command $command
    $command = "gcloud beta billing projects link $projectID --billing-account=$($billingAccount)"
    Run-Command $command 
}

if ($deploy -eq $true) { 
    $command = "gcloud services enable run.googleapis.com"
    Run-Command $command
    $command = "gcloud services enable cloudbuild.googleapis.com"
    Run-Command $command
    $parameters = $deployParams | convertFrom-JSON
    $command = "gcloud run deploy $projectName  --image $($parameters.containerRepo)  --max-instances=$($parameters.maxInstances) --port $($parameters.port) --set-env-vars=`"$($parameters.envVars)`" --region=$($parameters.region) --allow-unauthenticated   --service-account $($parameters.serviceAccount)"
    Run-Command $command
}

if ($listServiceAccounts -eq $true) {
   
    $command = "gcloud iam service-accounts list"
    Run-Command $command

}


if ($createServiceAccount -eq $true) {

    $command = "gcloud iam service-accounts create `"$($serviceAccountName)`"  --description=`"$($serviceAccountDescription)`"  --display-name=`"$($serviceAccountDisplayName)`""
    Run-Command $command
    $command = "gcloud projects add-iam-policy-binding $($projectID)  --member=`"serviceAccount:$($serviceAccountName)@$($projectID).iam.gserviceaccount.com`"  --role=`"roles/editor`""
    Run-Command $command
}