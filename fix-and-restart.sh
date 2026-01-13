#!/bin/bash

echo "======================================"
echo "  NovaClub - Correction Complète"
echo "======================================"
echo ""

echo "1️⃣  Arrêt des services..."
docker-compose stop backend
echo "✅ Backend arrêté"

echo ""
echo "2️⃣  Application de la migration pour corriger l'enum UserRole..."
docker exec -i novaclub-postgres psql -U novaclub -d novaclub_db < backend/migrations/002_fix_userrole_enum.sql

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'application de la migration"
    exit 1
fi
echo "✅ Enum corrigé (valeurs: ADMIN, SECRETARY, COACH)"

echo ""
echo "3️⃣  Rebuild du backend..."
docker-compose build backend

echo ""
echo "4️⃣  Redémarrage du backend..."
docker-compose up -d backend

echo ""
echo "5️⃣  Attente que le backend soit prêt (10 secondes)..."
sleep 10

echo ""
echo "6️⃣  Création des utilisateurs de test..."
docker exec novaclub-backend python create_test_users.py

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "  ✅ SYSTÈME PRÊT!"
    echo "======================================"
    echo ""
    echo "🌐 Connectez-vous sur: http://localhost:3000/login"
    echo ""
else
    echo ""
    echo "❌ Erreur lors de la création des utilisateurs"
    echo "Vérifiez les logs: docker-compose logs -f backend"
    exit 1
fi
