#!/bin/bash

echo "🔄 Correction de l'enum UserRole..."
echo ""

# Appliquer la migration SQL
docker exec -i novaclub-postgres psql -U novaclub -d novaclub_db < backend/migrations/002_fix_userrole_enum.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Enum UserRole corrigé avec succès!"
    echo "   Les rôles disponibles sont: admin, secretary, coach"
    echo ""
    echo "Vous pouvez maintenant exécuter: ./creer-utilisateurs.sh"
else
    echo "❌ Erreur lors de la correction de l'enum"
    exit 1
fi
