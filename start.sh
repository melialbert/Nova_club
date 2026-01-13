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

# Détecter la commande Docker Compose (nouvelle ou ancienne version)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
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
$DOCKER_COMPOSE up -d

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
echo "🗄️  Adminer (Base de données):"
echo "   http://$IP:8080"
echo "   http://localhost:8080"
echo "   Serveur: postgres | User: novaclub | Pass: novaclub123 | DB: novaclub_db"
echo ""
echo "======================================"
echo ""
echo "💡 Commandes utiles:"
echo "   $DOCKER_COMPOSE ps          # Voir les services"
echo "   $DOCKER_COMPOSE logs -f     # Voir les logs"
echo "   $DOCKER_COMPOSE stop        # Arrêter"
echo "   $DOCKER_COMPOSE down        # Tout supprimer"
echo ""
echo "📖 Documentation complète: README.md"
echo ""
