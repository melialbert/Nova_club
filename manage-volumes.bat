@echo off
setlocal

echo ======================================
echo   NovaClub - Gestion des Volumes
echo ======================================
echo.

if "%1"=="" goto usage
if "%1"=="status" goto status
if "%1"=="backup" goto backup
if "%1"=="clean-cache" goto clean_cache
if "%1"=="clean-deps" goto clean_deps
if "%1"=="reset" goto reset
goto usage

:status
echo Volumes NovaClub actuels :
echo.
docker volume ls | findstr novaclub
echo.
echo Espace utilise :
docker system df -v | findstr novaclub
echo.
goto end

:backup
echo Sauvegarde de PostgreSQL...
set BACKUP_FILE=backup_novaclub_%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql.gz
docker exec novaclub-postgres pg_dump -U novaclub novaclub_db | gzip > %BACKUP_FILE%
echo Sauvegarde creee : %BACKUP_FILE%
goto end

:clean_cache
echo Nettoyage des caches...
docker volume rm novaclub_backend_cache 2>nul
docker volume rm novaclub_backend_pycache 2>nul
docker volume rm novaclub_pwa_cache 2>nul
echo Caches nettoyes
goto end

:clean_deps
echo Nettoyage des dependances...
docker-compose down
docker volume rm novaclub_backend_venv 2>nul
docker volume rm novaclub_pwa_node_modules 2>nul
docker volume rm novaclub_backend_cache 2>nul
docker volume rm novaclub_backend_pycache 2>nul
docker volume rm novaclub_pwa_cache 2>nul
echo Dependances nettoyees
echo Prochain demarrage : docker-compose up -d
goto end

:reset
echo.
echo ATTENTION : Ceci va supprimer TOUTES les donnees !
set /p confirmation=Etes-vous sur ? Tapez 'OUI' pour confirmer :
if "%confirmation%"=="OUI" (
    echo Suppression de tout...
    docker-compose down -v
    echo Reset complet effectue
) else (
    echo Annule
)
goto end

:usage
echo Usage: %0 {status^|backup^|clean-cache^|clean-deps^|reset}
echo.
echo Commandes :
echo   status      - Afficher l'etat des volumes
echo   backup      - Sauvegarder PostgreSQL
echo   clean-cache - Nettoyer les caches (garde tout le reste)
echo   clean-deps  - Nettoyer dependances (garde les donnees)
echo   reset       - Reset complet (SUPPRIME TOUT)
echo.

:end
pause
