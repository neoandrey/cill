@echo off
SET currentDir="%~dp0"
SET host=127.0.0.1
SET port=5000
SET threads=4
SET reportsPage=http://%host%:%port%/buildstats
cd  %currentDir%
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
echo ====================================================
echo Reports Page Link: %reportsPage%
echo ====================================================
python3 -m waitress --host=%host% --port=%port% --threads=%threads% sqlreports:app

pause