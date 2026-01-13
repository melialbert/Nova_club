@echo off
echo 🔄 Correction de l'enum UserRole...
echo.

docker exec -i novaclub-postgres psql -U novaclub -d novaclub_db < backend/migrations/002_fix_userrole_enum.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ Enum UserRole corrigé avec succès!
    echo    Les rôles disponibles sont: admin, secretary, coach
    echo.
    echo Vous pouvez maintenant exécuter: creer-utilisateurs.bat
) else (
    echo ❌ Erreur lors de la correction de l'enum
    exit /b 1
)
