@echo off
echo ============================================
echo   Construction de l'installateur Windows
echo   Gestion Club Judo
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Verification des dependances...
call npm install
if errorlevel 1 (
    echo.
    echo ERREUR: Echec de l'installation des dependances
    pause
    exit /b 1
)

echo.
echo [2/4] Nettoyage des builds precedents...
if exist dist rmdir /s /q dist
if exist dist-electron rmdir /s /q dist-electron

echo.
echo [3/4] Construction de l'interface (Vite)...
call npm run build
if errorlevel 1 (
    echo.
    echo ERREUR: Echec de la construction de l'interface
    pause
    exit /b 1
)

echo.
echo [4/4] Creation de l'installateur Windows...
call npx electron-builder --win --x64
if errorlevel 1 (
    echo.
    echo ERREUR: Echec de la creation de l'installateur
    pause
    exit /b 1
)

echo.
echo ============================================
echo   SUCCES !
echo ============================================
echo.
echo L'installateur a ete cree dans le dossier:
echo %~dp0dist-electron
echo.
echo Fichier: Gestion Club Judo Setup X.X.X.exe
echo.
pause
