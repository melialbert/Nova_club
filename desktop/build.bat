@echo off
echo ==========================================
echo   Compilation de l'application en .exe
echo ==========================================
echo.
echo Installation des dependances...
call npm install
echo.
echo Build du frontend...
call npm run build
echo.
echo Compilation en .exe...
call npm run build:win
echo.
echo ==========================================
echo Compilation terminee !
echo Le fichier .exe se trouve dans dist-electron/
echo ==========================================
pause
