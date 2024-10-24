$appName = "cill-redis" 
$containerName = "$($appName)-cntr"
$port = 7800
$mongoDbPort = 29019
$redisPort = 6379
$ipAddress = (get-netIpaddress | ? { $_.IPAddress -match "172.22" }).IPAddress

$redisURL = "redis://default:C1llRed1s123!@$($ipAddress):$($redisPort)"
$mongoDbUrl = "mongodb://mongo:Cill123!@$($ipAddress):$($mongoDbPort)/cilldb?authSource=admin&connectTimeoutMS=10000&minPoolSize=4&serverSelectionTimeoutMS=300000&retryReads=true&retryWrites=true"
"docker rm -f $containerName && docker run -e PORT=$port -e REDIS_URL=`"$redisURL`" -e MONGODB_URL=`"$mongoDbUrl`"  -p $($port):$($port)  --name $containerName -d $appName " | cmd