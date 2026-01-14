#!/bin/bash

echo "========================================"
echo "  REINITIALISATION BASE DE DONNEES"
echo "========================================"
echo ""
echo "ATTENTION: Cela va SUPPRIMER toutes les donnees!"
echo ""
read -p "Appuyez sur Entree pour continuer ou Ctrl+C pour annuler..."

echo ""
echo "Recherche de la base de donnees..."

# Chemin local data
LOCAL_DB="data/club_management.db"
if [ -f "$LOCAL_DB" ]; then
    echo "Base trouvee: $LOCAL_DB"
    rm "$LOCAL_DB"
    echo "Base de donnees supprimee!"
else
    echo "Aucune base locale trouvee"
fi

# Chercher dans les dossiers typiques d'Electron
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    ELECTRON_DB="$HOME/Library/Application Support/desktop/club_management.db"
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # Linux
    ELECTRON_DB="$HOME/.config/desktop/club_management.db"
fi

if [ -f "$ELECTRON_DB" ]; then
    echo "Base Electron trouvee: $ELECTRON_DB"
    rm "$ELECTRON_DB"
    echo "Base de donnees Electron supprimee!"
fi

echo ""
echo "========================================"
echo "  REINITIALISATION TERMINEE"
echo "========================================"
echo "Au prochain demarrage, une nouvelle base sera creee."
echo ""
