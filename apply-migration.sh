#!/bin/bash

# Script pour appliquer les migrations de base de données
echo "🔄 Application des migrations de base de données..."

# Vérifier si le conteneur PostgreSQL est en cours d'exécution
if ! docker ps | grep -q "novaclub-postgres"; then
    echo "❌ Le conteneur PostgreSQL n'est pas en cours d'exécution"
    echo "   Démarrez-le avec: docker-compose up -d postgres"
    exit 1
fi

# Appliquer la migration
echo "📝 Application de la migration: Simplification de la table clubs"
docker exec -i novaclub-postgres psql -U novaclub -d novaclub_db < backend/migrations/001_simplify_clubs_table.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration appliquée avec succès!"
    echo ""
    echo "📋 Modifications effectuées:"
    echo "   - Colonne 'city' ajoutée"
    echo "   - Colonne 'slogan' ajoutée"
    echo "   - Colonnes supprimées: address, phone, email"
else
    echo "❌ Erreur lors de l'application de la migration"
    exit 1
fi
