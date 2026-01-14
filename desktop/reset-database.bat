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

REM Chemin typique pour Electron
set "APPDATA_PATH=%APPDATA%\desktop"
set "DB_FILE=%APPDATA_PATH%\club_management.db"

if exist "%DB_FILE%" (
    echo Base trouvee: %DB_FILE%
    del "%DB_FILE%"
    echo Base de donnees supprimee!
) else (
    echo Base non trouvee dans: %DB_FILE%
)

REM Chemin local data
set "LOCAL_DB=data\club_management.db"
if exist "%LOCAL_DB%" (
    echo Base trouvee: %LOCAL_DB%
    del "%LOCAL_DB%"
    echo Base de donnees locale supprimee!
) else (
    echo Aucune base locale trouvee
)

echo.
echo ========================================
echo   REINITIALISATION TERMINEE
echo ========================================
echo Au prochain demarrage, une nouvelle base sera creee.
echo.
pause
