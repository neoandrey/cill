$database = "cill"
$collections = @('Awareness', 'Biases', 'CandidateInfo', 'Categories', 'Details', 'GroupCodes', 'OptionSets', 'Principles', 'Questions', 'Recommendations', 'Results', 'Roles', 'Summaries', 'Tactics')
$mongoDbContainer = $Null
While ( $null -eq $mongoDbContainer) {
    $mongoDbContainer = Read-Host "Please provide the name of the Mongo Database container created above"
}
    
$collections | % {
    $collection = $_
    $importCommand = "docker exec -it $mongoDbContainer /bin/bash -c 'mongoimport --uri mongodb://mongo:Park123!@localhost:27017/cill --authenticationDatabase=admin --collection $collection --type json --file /tmp/data/$($database)db-$($collection).json'"
    write-host "Running command: $importCommand"
    invoke-expression $importCommand
}



