@echo off
echo Application de la migration pour le suivi de carriere...

docker exec novaclub-postgres psql -U postgres -d club_management -f /app/migrations/004_add_competitions_and_career.sql

if %ERRORLEVEL% EQU 0 (
    echo Migration appliquee avec succes!
) else (
    echo Erreur lors de l'application de la migration
    exit /b 1
)
