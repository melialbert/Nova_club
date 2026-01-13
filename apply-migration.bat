@echo off
REM Script pour appliquer les migrations de base de données (Windows)

echo Application des migrations de base de donnees...

REM Verifier si le conteneur PostgreSQL est en cours d'execution
docker ps | findstr "novaclub-postgres" >nul
if errorlevel 1 (
    echo Le conteneur PostgreSQL n'est pas en cours d'execution
    echo Demarrez-le avec: docker-compose up -d postgres
    exit /b 1
)

REM Appliquer la migration
echo Application de la migration: Simplification de la table clubs
docker exec -i novaclub-postgres psql -U novaclub -d novaclub_db < backend\migrations\001_simplify_clubs_table.sql

if errorlevel 0 (
    echo Migration appliquee avec succes!
    echo.
    echo Modifications effectuees:
    echo    - Colonne 'city' ajoutee
    echo    - Colonne 'slogan' ajoutee
    echo    - Colonnes supprimees: address, phone, email
) else (
    echo Erreur lors de l'application de la migration
    exit /b 1
)

pause
