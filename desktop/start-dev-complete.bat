@echo off
echo ==========================================
echo   Club Management - Mode Developpement
echo ==========================================
echo.

cd /d "%~dp0"

echo Verification des dependances...
if not exist "node_modules" (
    echo Installation des dependances...
    call npm install
    echo.
)

echo ==========================================
echo   Demarrage du serveur complet
echo ==========================================
echo.
echo Backend : http://localhost:3001
echo Frontend : http://localhost:5174
echo.
echo Appuyez sur Ctrl+C pour arreter
echo.

call npm run dev
