@echo off
echo ======================================
echo   NovaClub - Correction et Rebuild
echo ======================================
echo.

echo 1 Arret des services...
docker-compose down

echo.
echo 2 Suppression du volume des dependances Python...
docker volume rm novaclub_backend_venv 2>nul

echo.
echo 3 Rebuild du backend (peut prendre 2-3 minutes)...
docker-compose build backend

echo.
echo 4 Demarrage de tous les services...
docker-compose up -d

echo.
echo 5 Attente du demarrage (30 secondes)...
timeout /t 30 /nobreak >nul

echo.
echo ======================================
echo   Correction terminee
echo ======================================
echo.
echo Testez maintenant :
echo    http://localhost:3000
echo.
echo Verifiez les logs :
echo    docker-compose logs -f backend
echo.
pause
