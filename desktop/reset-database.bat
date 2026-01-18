@echo off
echo ========================================
echo   REINITIALISATION BASE DE DONNEES
echo ========================================
echo.
echo ATTENTION: Cela va SUPPRIMER toutes les donnees!
echo.
pause

echo.
echo Recherche de la base de donnees...

REM Obtenir le dossier du script
set "SCRIPT_DIR=%~dp0"

REM Chemin local data (relatif au dossier desktop)
set "LOCAL_DB=%SCRIPT_DIR%data\club_management.db"
if exist "%LOCAL_DB%" (
    echo Base trouvee: %LOCAL_DB%
    del "%LOCAL_DB%"
    echo Base de donnees locale supprimee!
) else (
    echo Aucune base locale trouvee a: %LOCAL_DB%
)

REM Supprimer aussi les fichiers WAL si présents
set "LOCAL_DB_WAL=%SCRIPT_DIR%data\club_management.db-wal"
set "LOCAL_DB_SHM=%SCRIPT_DIR%data\club_management.db-shm"
if exist "%LOCAL_DB_WAL%" (
    del "%LOCAL_DB_WAL%"
    echo Fichier WAL supprime!
)
if exist "%LOCAL_DB_SHM%" (
    del "%LOCAL_DB_SHM%"
    echo Fichier SHM supprime!
)

REM Chemin typique pour Electron
set "APPDATA_PATH=%APPDATA%\desktop"
set "DB_FILE=%APPDATA_PATH%\club_management.db"

if exist "%DB_FILE%" (
    echo Base Electron trouvee: %DB_FILE%
    del "%DB_FILE%"
    echo Base de donnees Electron supprimee!
) else (
    echo Base Electron non trouvee dans: %DB_FILE%
)

echo.
echo ========================================
echo   REINITIALISATION TERMINEE
echo ========================================
echo Au prochain demarrage, une nouvelle base sera creee.
echo.
pause
