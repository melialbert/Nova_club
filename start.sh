#!/bin/bash

echo "======================================"
echo "  NovaClub - Démarrage Rapide"
echo "======================================"
echo ""

if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé."
    echo "Installez Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé."
    exit 1
fi

echo "✅ Docker est installé"
echo ""

IP=$(hostname -I | awk '{print $1}')
if [ -z "$IP" ]; then
    IP="localhost"
fi

echo "📍 Adresse IP détectée: $IP"
echo ""

echo "🚀 Démarrage des services Docker..."
docker-compose up -d

echo ""
echo "⏳ Attente du démarrage des services (30 secondes)..."
sleep 30

echo ""
echo "✅ NovaClub est prêt!"
echo ""
echo "======================================"
echo "  Accès aux applications"
echo "======================================"
echo ""
echo "🌐 Application Web (PWA):"
echo "   http://$IP:3000"
echo "   http://localhost:3000"
echo ""
echo "🔧 API Backend:"
echo "   http://$IP:8000"
echo "   http://localhost:8000"
echo ""
echo "📚 Documentation API:"
echo "   http://$IP:8000/docs"
echo "   http://localhost:8000/docs"
echo ""
echo "======================================"
echo ""
echo "💡 Commandes utiles:"
echo "   docker-compose ps          # Voir les services"
echo "   docker-compose logs -f     # Voir les logs"
echo "   docker-compose stop        # Arrêter"
echo "   docker-compose down        # Tout supprimer"
echo ""
echo "📖 Documentation complète: README.md"
echo ""
