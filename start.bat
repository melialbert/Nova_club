@echo off
echo ======================================
echo   NovaClub - Demarrage Rapide
echo ======================================
echo.

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo X Docker n'est pas installe.
    echo Installez Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo √ Docker est installe
echo.

echo Demarrage des services Docker...
docker-compose up -d

echo.
echo Attente du demarrage des services (30 secondes)...
timeout /t 30 /nobreak >nul

echo.
echo √ NovaClub est pret!
echo.
echo ======================================
echo   Acces aux applications
echo ======================================
echo.
echo Application Web (PWA):
echo    http://localhost:3000
echo.
echo API Backend:
echo    http://localhost:8000
echo.
echo Documentation API:
echo    http://localhost:8000/docs
echo.
echo ======================================
echo.
echo Commandes utiles:
echo    docker-compose ps          # Voir les services
echo    docker-compose logs -f     # Voir les logs
echo    docker-compose stop        # Arreter
echo    docker-compose down        # Tout supprimer
echo.
echo Documentation complete: README.md
echo.
pause
