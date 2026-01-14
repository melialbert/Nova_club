#!/bin/bash

echo "=========================================="
echo "  Club Management - Mode Developpement"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

echo "Verification des dependances..."
if [ ! -d "node_modules" ]; then
    echo "Installation des dependances..."
    npm install
    echo ""
fi

echo "=========================================="
echo "  Demarrage du serveur complet"
echo "=========================================="
echo ""
echo "Backend : http://localhost:3001"
echo "Frontend : http://localhost:5174"
echo ""
echo "Appuyez sur Ctrl+C pour arreter"
echo ""

npm run dev
