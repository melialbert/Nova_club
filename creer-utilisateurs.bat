@echo off
echo Creation des utilisateurs de test dans PostgreSQL...
echo.

REM Vérifier que le conteneur PostgreSQL est en cours d'exécution
docker ps | findstr novaclub-postgres >nul 2>&1
if errorlevel 1 (
    echo Le conteneur PostgreSQL n'est pas en cours d'execution.
    echo Lancez d'abord: start.bat
    exit /b 1
)

echo Attente que PostgreSQL soit pret...
timeout /t 3 /nobreak >nul

REM Vérifier que le conteneur backend est en cours d'exécution
docker ps | findstr novaclub-backend >nul 2>&1
if errorlevel 1 (
    echo Le conteneur backend n'est pas en cours d'execution.
    echo Lancez d'abord: start.bat
    exit /b 1
)

echo Execution du script de creation...
docker exec -it novaclub-backend python create_test_users.py

echo.
echo Termine!
pause
