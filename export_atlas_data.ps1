$database="cill"
$collections = @('Awareness','Biases','CandidateInfo','Categories','Details','GroupCodes','OptionSets','Principles', 'Questions','Recommendations', 'Results','Roles','Summaries','Tactics')
$collections |%{
$collection =  $_
$exportCommand= "mongoexport --uri mongodb+srv://neo:M0ng0DB123@neocrystalclstr01.fv9vk.mongodb.net/$database --authenticationDatabase admin --collection $collection --type json --out $PSScriptRoot\data\$($database)db-$($collection).json"
write-host "Running command: $exportCommand"
invoke-expression $exportCommand
}