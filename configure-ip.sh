#!/bin/bash

echo "======================================"
echo "  Configuration IP pour NovaClub"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect local IP
echo -e "${BLUE}🔍 Détection de votre IP locale...${NC}"
echo ""

# Try different methods to get IP
IP=""

# Method 1: hostname -I (Linux)
if command -v hostname &> /dev/null; then
    IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi

# Method 2: ip route (Linux)
if [ -z "$IP" ] && command -v ip &> /dev/null; then
    IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+')
fi

# Method 3: ifconfig (Mac/Linux)
if [ -z "$IP" ] && command -v ifconfig &> /dev/null; then
    IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -n 1)
fi

# Method 4: Ask user
if [ -z "$IP" ]; then
    echo -e "${YELLOW}❌ Impossible de détecter automatiquement votre IP${NC}"
    echo ""
    echo "Pour trouver votre IP manuellement :"
    echo "  - Linux: ip addr show"
    echo "  - Mac: ifconfig | grep 'inet '"
    echo "  - Windows: ipconfig"
    echo ""
    read -p "Entrez votre IP locale (ex: 192.168.1.8): " IP
fi

# Validate IP format
if [[ ! $IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${YELLOW}❌ Format IP invalide: $IP${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ IP détectée: $IP${NC}"
echo ""

# Confirm with user
read -p "Est-ce la bonne IP ? (o/n) [o]: " confirm
confirm=${confirm:-o}

if [[ ! $confirm =~ ^[oO]$ ]]; then
    read -p "Entrez la bonne IP: " IP
    if [[ ! $IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo -e "${YELLOW}❌ Format IP invalide${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}📝 Configuration de docker-compose.yml...${NC}"

# Backup docker-compose.yml
cp docker-compose.yml docker-compose.yml.backup

# Update docker-compose.yml
sed -i.tmp "s|ALLOWED_ORIGINS:.*|ALLOWED_ORIGINS: http://${IP}:3000,http://localhost:3000,http://127.0.0.1:3000|g" docker-compose.yml
sed -i.tmp "s|VITE_API_URL:.*|VITE_API_URL: http://${IP}:8000|g" docker-compose.yml
rm -f docker-compose.yml.tmp

echo -e "${GREEN}✅ Fichier docker-compose.yml configuré${NC}"
echo ""

# Show changes
echo -e "${BLUE}📋 Configuration appliquée:${NC}"
echo "  - Backend CORS: http://${IP}:3000"
echo "  - PWA API URL: http://${IP}:8000"
echo ""

# Ask to restart services
read -p "Redémarrer les services maintenant ? (o/n) [o]: " restart
restart=${restart:-o}

if [[ $restart =~ ^[oO]$ ]]; then
    echo ""
    echo -e "${BLUE}🔄 Arrêt des services...${NC}"
    docker-compose down

    echo ""
    echo -e "${BLUE}🏗️  Rebuild du backend...${NC}"
    docker-compose build backend

    echo ""
    echo -e "${BLUE}🚀 Démarrage des services...${NC}"
    docker-compose up -d

    echo ""
    echo -e "${GREEN}✅ Services redémarrés !${NC}"
    echo ""
    echo -e "${BLUE}⏱️  Attente du démarrage (30 secondes)...${NC}"
    sleep 30

    echo ""
    echo -e "${GREEN}🎉 Configuration terminée !${NC}"
    echo ""
    echo -e "${BLUE}📱 Accédez à l'application via:${NC}"
    echo "  - PWA Web: http://${IP}:3000"
    echo "  - API Docs: http://${IP}:8000/docs"
    echo "  - Adminer: http://${IP}:8080"
    echo ""
    echo -e "${BLUE}💡 Conseil:${NC} Partagez ces URLs avec d'autres appareils sur votre réseau local !"
else
    echo ""
    echo -e "${YELLOW}⚠️  Configuration enregistrée mais services non redémarrés${NC}"
    echo ""
    echo "Pour appliquer les changements, exécutez :"
    echo "  docker-compose down"
    echo "  docker-compose build backend"
    echo "  docker-compose up -d"
fi

echo ""
echo -e "${GREEN}✅ Fait !${NC}"
echo ""
