set currentFolder=%~dp0
cd  %currentFolder%
powershell -executionPolicy bypass -File .\run_gcp_deploy.ps1
pause