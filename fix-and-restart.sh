#!/bin/bash

echo "======================================"
echo "  NovaClub - Correction et Rebuild"
echo "======================================"
echo ""

echo "1️⃣  Arrêt des services..."
docker-compose down

echo ""
echo "2️⃣  Suppression du volume des dépendances Python..."
docker volume rm novaclub_backend_venv 2>/dev/null || echo "Volume déjà supprimé"

echo ""
echo "3️⃣  Rebuild du backend (peut prendre 2-3 minutes)..."
docker-compose build backend

echo ""
echo "4️⃣  Démarrage de tous les services..."
docker-compose up -d

echo ""
echo "5️⃣  Attente du démarrage (30 secondes)..."
sleep 30

echo ""
echo "======================================"
echo "  ✅ Correction terminée"
echo "======================================"
echo ""
echo "🌐 Testez maintenant :"
echo "   http://localhost:3000"
echo ""
echo "📋 Vérifiez les logs :"
echo "   docker-compose logs -f backend"
echo ""
