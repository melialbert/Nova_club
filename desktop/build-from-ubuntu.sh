#!/bin/bash

echo "============================================"
echo "  Build Windows depuis Ubuntu"
echo "  Gestion Club Judo"
echo "============================================"
echo ""

cd "$(dirname "$0")"

# Vérifier que Wine est installé
if ! command -v wine &> /dev/null; then
    echo "ERREUR: Wine n'est pas installé !"
    echo "Exécutez d'abord: ./setup-ubuntu-build.sh"
    exit 1
fi

echo "[1/4] Installation/Mise à jour des dépendances..."
npm install
if [ $? -ne 0 ]; then
    echo ""
    echo "ERREUR: Échec de l'installation des dépendances"
    exit 1
fi

echo ""
echo "[2/4] Nettoyage des builds précédents..."
rm -rf dist
rm -rf dist-electron

echo ""
echo "[3/4] Construction de l'interface (Vite)..."
npm run build
if [ $? -ne 0 ]; then
    echo ""
    echo "ERREUR: Échec de la construction de l'interface"
    exit 1
fi

echo ""
echo "[4/4] Création de l'installateur Windows (.exe)..."
echo "Cela peut prendre 5-10 minutes..."
echo ""

# Utiliser Wine pour la cross-compilation
export WINEPREFIX=~/.wine-electron
npx electron-builder --win --x64

if [ $? -ne 0 ]; then
    echo ""
    echo "ERREUR: Échec de la création de l'installateur"
    exit 1
fi

echo ""
echo "============================================"
echo "  SUCCÈS !"
echo "============================================"
echo ""
echo "L'installateur Windows a été créé ici :"
echo "$(pwd)/dist-electron/"
echo ""
echo "Fichier: Gestion Club Judo Setup X.X.X.exe"
echo ""
echo "Vous pouvez maintenant :"
echo "1. Copier ce fichier sur une clé USB"
echo "2. L'installer sur n'importe quel PC Windows"
echo "3. L'application fonctionnera sans Node.js"
echo ""
ls -lh dist-electron/*.exe 2>/dev/null || echo "Vérifiez le dossier dist-electron/"
echo ""
