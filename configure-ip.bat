@echo off
echo ======================================
echo   Configuration IP pour NovaClub
echo ======================================
echo.

echo Detection de votre IP locale...
echo.

REM Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set IP=%%a
set IP=%IP: =%

echo IP detectee: %IP%
echo.

set /p confirm="Est-ce la bonne IP ? (o/n) [o]: "
if "%confirm%"=="" set confirm=o
if /i not "%confirm%"=="o" (
    set /p IP="Entrez la bonne IP: "
)

echo.
echo Configuration de docker-compose.yml...

REM Backup
copy docker-compose.yml docker-compose.yml.backup >nul

REM Update docker-compose.yml
powershell -Command "(gc docker-compose.yml) -replace 'ALLOWED_ORIGINS:.*', 'ALLOWED_ORIGINS: http://%IP%:3000,http://localhost:3000,http://127.0.0.1:3000' | Out-File -encoding ASCII docker-compose.yml"
powershell -Command "(gc docker-compose.yml) -replace 'VITE_API_URL:.*', 'VITE_API_URL: http://%IP%:8000' | Out-File -encoding ASCII docker-compose.yml"

echo Configuration appliquee !
echo.
echo Configuration:
echo   - Backend CORS: http://%IP%:3000
echo   - PWA API URL: http://%IP%:8000
echo.

set /p restart="Redemarrer les services maintenant ? (o/n) [o]: "
if "%restart%"=="" set restart=o

if /i "%restart%"=="o" (
    echo.
    echo Arret des services...
    docker-compose down

    echo.
    echo Rebuild du backend...
    docker-compose build backend

    echo.
    echo Demarrage des services...
    docker-compose up -d

    echo.
    echo Services redemarres !
    echo.
    echo Attente du demarrage ^(30 secondes^)...
    timeout /t 30 /nobreak >nul

    echo.
    echo Configuration terminee !
    echo.
    echo Accedez a l'application via:
    echo   - PWA Web: http://%IP%:3000
    echo   - API Docs: http://%IP%:8000/docs
    echo   - Adminer: http://%IP%:8080
    echo.
    echo Conseil: Partagez ces URLs avec d'autres appareils sur votre reseau local !
) else (
    echo.
    echo Configuration enregistree mais services non redemarres
    echo.
    echo Pour appliquer les changements, executez :
    echo   docker-compose down
    echo   docker-compose build backend
    echo   docker-compose up -d
)

echo.
pause
