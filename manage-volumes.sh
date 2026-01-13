#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "======================================"
echo "  NovaClub - Gestion des Volumes"
echo "======================================"
echo ""

function show_volumes() {
    echo "📦 Volumes NovaClub actuels :"
    echo ""
    docker volume ls | grep novaclub || echo "Aucun volume trouvé"
    echo ""
    echo "💾 Espace utilisé :"
    docker system df -v | grep -A 20 "Local Volumes" | grep novaclub || echo "Aucun volume"
    echo ""
}

function backup_postgres() {
    echo "📥 Sauvegarde de PostgreSQL..."
    BACKUP_FILE="backup_novaclub_$(date +%Y%m%d_%H%M%S).sql.gz"
    docker exec novaclub-postgres pg_dump -U novaclub novaclub_db | gzip > "$BACKUP_FILE"

    if [ -f "$BACKUP_FILE" ]; then
        echo -e "${GREEN}✅ Sauvegarde créée : $BACKUP_FILE${NC}"
    else
        echo -e "${RED}❌ Erreur lors de la sauvegarde${NC}"
    fi
}

function clean_cache() {
    echo "🧹 Nettoyage des caches (conserve les données)..."
    docker volume rm novaclub_backend_cache 2>/dev/null
    docker volume rm novaclub_backend_pycache 2>/dev/null
    docker volume rm novaclub_pwa_cache 2>/dev/null
    echo -e "${GREEN}✅ Caches nettoyés${NC}"
}

function clean_dependencies() {
    echo "🧹 Nettoyage des dépendances (conserve les données)..."
    docker volume rm novaclub_backend_venv 2>/dev/null
    docker volume rm novaclub_pwa_node_modules 2>/dev/null
    docker volume rm novaclub_backend_cache 2>/dev/null
    docker volume rm novaclub_backend_pycache 2>/dev/null
    docker volume rm novaclub_pwa_cache 2>/dev/null
    echo -e "${GREEN}✅ Dépendances nettoyées${NC}"
    echo -e "${YELLOW}⚠️  Prochain démarrage : docker-compose up -d${NC}"
}

function reset_all() {
    echo -e "${RED}⚠️  ATTENTION : Ceci va supprimer TOUTES les données !${NC}"
    echo -n "Êtes-vous sûr ? Tapez 'OUI' pour confirmer : "
    read confirmation

    if [ "$confirmation" = "OUI" ]; then
        echo "🗑️  Suppression de tout..."
        docker-compose down -v
        echo -e "${GREEN}✅ Reset complet effectué${NC}"
    else
        echo "❌ Annulé"
    fi
}

case "$1" in
    status)
        show_volumes
        ;;
    backup)
        backup_postgres
        ;;
    clean-cache)
        clean_cache
        ;;
    clean-deps)
        docker-compose down
        clean_dependencies
        ;;
    reset)
        reset_all
        ;;
    *)
        echo "Usage: $0 {status|backup|clean-cache|clean-deps|reset}"
        echo ""
        echo "Commandes :"
        echo "  status      - Afficher l'état des volumes"
        echo "  backup      - Sauvegarder PostgreSQL"
        echo "  clean-cache - Nettoyer les caches (garde tout le reste)"
        echo "  clean-deps  - Nettoyer dépendances (garde les données)"
        echo "  reset       - Reset complet (SUPPRIME TOUT)"
        echo ""
        exit 1
        ;;
esac
