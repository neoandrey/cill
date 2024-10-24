set currentFolder=%~dp0
cd  %currentFolder%
call python3 -m venv venv
call .\venv\Scripts\activate.bat
flask run
