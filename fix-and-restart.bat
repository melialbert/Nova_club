@echo off
echo ======================================
echo   NovaClub - Correction Complete
echo ======================================
echo.

echo 1 Arret du backend...
docker-compose stop backend
echo Backend arrete

echo.
echo 2 Application de la migration pour corriger l'enum UserRole...
docker exec -i novaclub-postgres psql -U novaclub -d novaclub_db < backend/migrations/002_fix_userrole_enum.sql
if %errorlevel% neq 0 (
    echo Erreur lors de l'application de la migration
    pause
    exit /b 1
)
echo Enum corrige (valeurs: ADMIN, SECRETARY, COACH)

echo.
echo 3 Rebuild du backend...
docker-compose build backend

echo.
echo 4 Redemarrage du backend...
docker-compose up -d backend

echo.
echo 5 Attente que le backend soit pret (10 secondes)...
timeout /t 10 /nobreak >nul

echo.
echo 6 Creation des utilisateurs de test...
docker exec novaclub-backend python create_test_users.py

if %errorlevel% equ 0 (
    echo.
    echo ======================================
    echo   SYSTEME PRET!
    echo ======================================
    echo.
    echo Connectez-vous sur: http://localhost:3000/login
    echo.
) else (
    echo.
    echo Erreur lors de la creation des utilisateurs
    echo Verifiez les logs: docker-compose logs -f backend
    pause
    exit /b 1
)
pause
