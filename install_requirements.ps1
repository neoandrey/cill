"python -m pip install --upgrade pip" | cmd
"python -m pip install -r requirements.txt" | cmd

$jsonPyPath = "$PSScriptRoot\venv\Lib\site-packages\flask_mongoengine\json.py"
$jsonPyScript = get-content -path $jsonPyPath
$jsonPyScript = $jsonPyScript.Replace("from flask.json import JSONEncoder", "from json import JSONEncoder")
set-content -Path $jsonPyPath -Value $jsonPyScript 