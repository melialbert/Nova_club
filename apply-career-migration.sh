#!/bin/bash

echo "Application de la migration pour le suivi de carrière..."

docker exec novaclub-postgres psql -U postgres -d club_management -f /app/migrations/004_add_competitions_and_career.sql

if [ $? -eq 0 ]; then
    echo "✓ Migration appliquée avec succès!"
else
    echo "✗ Erreur lors de l'application de la migration"
    exit 1
fi
