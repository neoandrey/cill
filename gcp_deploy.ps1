param(
    [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][string]$projectName
    , [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][string]$projectID
    , [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][boolean]$createProject = $False
    , [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][boolean]$init = $False
    , [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][boolean]$auth = $False
    , [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][boolean]$setProjectID = $False
    , [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][boolean]$listAccounts = $False
    , [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][boolean]$listServiceAccounts = $False
    , [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][boolean]$listProjects = $False
    , [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][boolean]$listBillingAc = $False
    , [Parameter(Mandatory = $False,  ValueFromPipelineByPropertyName = $true)][boolean]$linkBillingAc = $False
    , [Parameter(Mandatory = $False,  ValueFromPipelineByPropertyName = $true)][string]$billingAccount
    , [Parameter(Mandatory = $False,  ValueFromPipelineByPropertyName = $true)][boolean]$deploy = $False
    , [Parameter(Mandatory = $False,  ValueFromPipelineByPropertyName = $true)][string]$deployParams
    , [Parameter(Mandatory = $False,  ValueFromPipelineByPropertyName = $true)][boolean]$createServiceAccount = $False
    , [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][string]$serviceAccountName
    , [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][string]$serviceAccountDescription
    , [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][string]$serviceAccountDisplayName
    , [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][string]$solution
    , [Parameter(Mandatory = $False, ValueFromPipelineByPropertyName = $true)][string]$solutionParams

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
if(![string]::IsNullOrWhiteSpace($solution)){

    $solution = $solution.Replace(" ","").ToLower();
    $parameters = $solutionParams |ConvertFrom-Json;
    switch($solution){

        "artifactrepository" {
                $checkedParams = $True;
                $requiredParams = @('repoName', 'repoFormat','repoLocation', 'repoDescription','repoProject');

                foreach($param in $requiredParams){

                    if([string]::IsNullOrWhiteSpace($param)){
                        $checkedParams = $false;
                        break;

                    }
                }
                if($checkedParams){
                    $repoName = $parameters.repoName
                    $repoFormat = $parameters.repoFormat
                    $repoLocation = $parameters.repoLocation
                    $repoDescription = $parameters.repoDescription
                    $repoProject = $parameters.repoProject
            
                    $command = "gcloud artifacts repositories create `"$($repoName)`" --repository-format=$($repoFormat) --location=$($repoLocation) --description=`"$($repoDescription)`"  --project=`"$($repoProject)`""
                    Run-Command $command

                }else{

                    write-host -ForegroundColor Yellow "Please provide the following parameters: "
                    write-host  $requiredParams 
                }
            


            }

            "workloadidentitypool" {

                    $checkedParams = $True;
                    $requiredParams = @('poolID', 'poolDisplayName','poolLocation', 'poolDescription');
                    $parameters.poolLocation = if([string]::IsNullOrEmpty($parameters.poolLocation)){"global"}else{$parameters.poolLocation}
                    foreach($param in $requiredParams){

                        if([string]::IsNullOrWhiteSpace($param)){
                            $checkedParams = $false;
                            break;

                        }
                    }
                    if($checkedParams){

                        $poolID = $parameters.poolID
                        $poolDisplayName = $parameters.poolDisplayName
                        $poolLocation = $parameters.poolLocation
                        $poolDescription = $parameters.poolDescription

                        $command = "gcloud iam workload-identity-pools create `"$($poolID)`" --location=`"$($poolLocation)`" --description=`"$($poolDescription)`"  --display-name=`"$($poolDisplayName)`""
                        Run-Command $command

                    }else{

                        write-host -ForegroundColor Yellow "Please provide the following parameters: "
                        write-host  $requiredParams 
                    }
                

            }

            "workloadidentitypoolprovider" {

                    $checkedParams = $True;
                    $requiredParams = @('providerID','poolID', 'poolLocation','issuerURI', 'attributeMapping', 'attributeCondition');
                    $parameters.poolLocation = if([string]::IsNullOrEmpty($parameters.poolLocation)){"global"}else{$parameters.poolLocation}
                    $parameters.issuerURI = if([string]::IsNullOrEmpty($parameters.issuerURI)){"https://token.actions.githubusercontent.com/"}else{$parameters.issuerURI}
                    foreach($param in $requiredParams){

                        if([string]::IsNullOrWhiteSpace($param)){
                            $checkedParams = $false;
                            break;

                        }
                    }
                    if($checkedParams){

                        $providerID = $parameters.providerID
                        $poolID = $parameters.poolID
                        $poolLocation =  $parameters.poolLocation
                        $issuerURI = $parameters.issuerURI
                        $allowedAudiences = $parameters.allowedAudiences
                        $attributeMapping = $parameters.attributeMapping
                        $attributeCondition = $parameters.attributeCondition
                        
                        $command = ""
                        if(![string]::IsNullOrEmpty($allowedAudiences)){

                            $command = "gcloud iam workload-identity-pools providers create-oidc $providerID --location=`"$($poolLocation)`" --workload-identity-pool=`"$($poolID)`" --issuer-uri=`"$($issuerURI)`" --allowed-audiences=`"$($allowedAudiences)`" --attribute-mapping=`"$($attributeMapping)`" --attribute-condition=`"$($attributeCondition)`""
                    
                        }else{
                            $command = "gcloud iam workload-identity-pools providers create-oidc $providerID --location=`"$($poolLocation)`" --workload-identity-pool=`"$($poolID)`" --issuer-uri=`"$($issuerURI)`"  --attribute-mapping=`"$($attributeMapping)`" --attribute-condition=`"$($attributeCondition)`""
                        }
                        
                        
                        Run-Command $command

                    }else{

                        write-host -ForegroundColor Yellow "Please provide the following parameters: "
                        write-host  $requiredParams 
                    }
                

            }

            "workloadidentitypoolproviderupdate" {

                $checkedParams = $True;
                $requiredParams = @('providerID','poolID', 'poolLocation', 'attributeCondition');
                $parameters.poolLocation = if([string]::IsNullOrEmpty($parameters.poolLocation)){"global"}else{$parameters.poolLocation}
                
                foreach($param in $requiredParams){

                    if([string]::IsNullOrWhiteSpace($param)){
                        $checkedParams = $false;
                        break;

                    }
                }
                if($checkedParams){

                    $providerID = $parameters.providerID
                    $poolID = $parameters.poolID
                    $poolLocation =  $parameters.poolLocation
                    $attributeCondition = $parameters.attributeCondition
                    $command = " gcloud iam workload-identity-pools providers update-oidc $providerID --location=`"$($poolLocation)`" --workload-identity-pool=`"$($poolID)`" --attribute-condition=`"$($attributeCondition)`""
                    Run-Command $command

                }else{

                    write-host -ForegroundColor Yellow "Please provide the following parameters: "
                    write-host  $requiredParams 
                }
            

        }

        "bucket" {

            $checkedParams = $True;
            $requiredParams = @('projectID','bucketName', 'storageClass', 'bucketLocation');
            $parameters.storageClass = if([string]::IsNullOrEmpty($parameters.storageClass)){"STANDARD"}else{$parameters.storageClass}
            
            foreach($param in $requiredParams){

                if([string]::IsNullOrWhiteSpace($param)){
                    $checkedParams = $false;
                    break;

                }
            }
            if($checkedParams){

                $projectID = $parameters.projectID
                $bucketName = $parameters.bucketName
                $storageClass =  $parameters.storageClass
                $bucketLocation = $parameters.bucketLocation
                $command = "gcloud storage buckets create gs://$($bucketName) --project=$($projectID) --default-storage-class=$($storageClass) --location=$($bucketLocation) --uniform-bucket-level-access"
                Run-Command $command

            }else{

                write-host -ForegroundColor Yellow "Please provide the following parameters: "
                write-host  $requiredParams 
                $command = "gcloud storage ls"
                Run-Command $command
            }
        

    }

    "iampolicybinding" {

            $checkedParams = $True;
            $requiredParams = @('member', 'role');

            foreach($param in $requiredParams){

                if([string]::IsNullOrWhiteSpace($param)){
                    $checkedParams = $false;
                    break;

                }
            }
            if($checkedParams){

                $projectID = $parameters.projectID
                $serviceAccount = $parameters.serviceAccount
                $member = $parameters.member
                $role =  $parameters.role
                $condition = $parameters.condition
                $command = ""
                if(![string]::IsNullOrEmpty($condition)){
                    $command = "gcloud projects add-iam-policy-binding $($projectID) --member=$($member) --role=$($role) --condition=$($condition)" 
                }else{
                    if(![string]::IsNullOrEmpty($projectID)){
                    $command = "gcloud projects add-iam-policy-binding $($projectID)  --member=$($member) --role=$($role)" 
                    }elseif(![string]::IsNullOrEmpty($serviceAccount)){
                        $command = "gcloud iam service-accounts add-iam-policy-binding $($serviceAccount)  --member=$($member) --role=$($role)" 
                    }

            }
                Run-Command $command

            }else{

                write-host -ForegroundColor Yellow "Please provide the following parameters: "
                write-host  $requiredParams 

            }
        

    }
    }



}