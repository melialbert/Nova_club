@echo off
echo ==========================================
echo   Club Management - Application Desktop
echo ==========================================
echo.
echo Installation des dependances...
call npm install
echo.
echo Demarrage de l'application...
call npm run electron:dev
pause
