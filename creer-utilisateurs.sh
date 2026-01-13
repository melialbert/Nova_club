#!/bin/bash

echo "🚀 Création des utilisateurs de test dans PostgreSQL..."
echo ""

# Vérifier que le conteneur PostgreSQL est en cours d'exécution
if ! docker ps | grep -q novaclub-postgres; then
    echo "❌ Le conteneur PostgreSQL n'est pas en cours d'exécution."
    echo "   Lancez d'abord: ./start.sh"
    exit 1
fi

# Vérifier que le conteneur backend est en cours d'exécution
if ! docker ps | grep -q novaclub-backend; then
    echo "❌ Le conteneur backend n'est pas en cours d'exécution."
    echo "   Lancez d'abord: ./start.sh"
    exit 1
fi

echo "⏳ Attente que PostgreSQL soit prêt (10 secondes)..."
sleep 10

echo "📦 Exécution du script de création..."
docker exec novaclub-backend python create_test_users.py

echo ""
echo "✅ Terminé!"
