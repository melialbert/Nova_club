#!/bin/bash

echo "============================================"
echo "  Configuration Ubuntu pour build Windows"
echo "  Gestion Club Judo"
echo "============================================"
echo ""

# Vérifier si Wine est installé
if ! command -v wine &> /dev/null; then
    echo "[1/3] Installation de Wine (nécessaire pour créer des .exe)..."
    echo ""
    echo "Wine n'est pas installé. Installation en cours..."

    # Activer l'architecture 32-bit
    sudo dpkg --add-architecture i386

    # Ajouter le repository WineHQ
    sudo mkdir -pm755 /etc/apt/keyrings
    sudo wget -O /etc/apt/keyrings/winehq-archive.key https://dl.winehq.org/wine-builds/winehq.key

    # Détection de la version Ubuntu
    VERSION_ID=$(lsb_release -rs)
    CODENAME=$(lsb_release -cs)

    sudo wget -NP /etc/apt/sources.list.d/ https://dl.winehq.org/wine-builds/ubuntu/dists/${CODENAME}/winehq-${CODENAME}.sources

    # Mise à jour et installation
    sudo apt update
    sudo apt install -y --install-recommends winehq-stable

    echo ""
    echo "Wine installé avec succès !"
else
    echo "[1/3] Wine est déjà installé ✓"
fi

echo ""
echo "[2/3] Installation des dépendances..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "Node.js n'est pas installé. Installation en cours..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "Node.js est déjà installé ✓"
fi

# Installer les dépendances du projet
cd "$(dirname "$0")"
npm install

echo ""
echo "[3/3] Configuration de Wine pour electron-builder..."

# Initialiser Wine si nécessaire
WINEPREFIX=~/.wine-electron wine wineboot

echo ""
echo "============================================"
echo "  Configuration terminée !"
echo "============================================"
echo ""
echo "Vous pouvez maintenant créer le .exe avec :"
echo "  ./build-from-ubuntu.sh"
echo ""
