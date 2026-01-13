#!/bin/bash

echo "======================================"
echo "  NovaClub - Test des Services"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test service
test_service() {
    local name=$1
    local url=$2
    local expected=$3

    echo -n "Testing $name... "

    if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" | grep -q "$expected"; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Function to test Docker service
test_docker_service() {
    local name=$1
    local container=$2

    echo -n "Testing Docker $name... "

    if docker-compose ps | grep -q "$container.*Up"; then
        echo -e "${GREEN}✓ Running${NC}"
        return 0
    else
        echo -e "${RED}✗ Not running${NC}"
        return 1
    fi
}

echo "1️⃣  Docker Services Status"
echo "------------------------------"
test_docker_service "Backend" "novaclub-backend"
test_docker_service "PWA" "novaclub-pwa"
test_docker_service "PostgreSQL" "postgres"
test_docker_service "Redis" "redis"
test_docker_service "Adminer" "adminer"
echo ""

echo "2️⃣  HTTP Services Health"
echo "------------------------------"
test_service "PWA Frontend" "http://localhost:3000" "200"
test_service "Backend API" "http://localhost:8000/docs" "200"
test_service "Adminer" "http://localhost:8080" "200"
echo ""

echo "3️⃣  Backend API Endpoints"
echo "------------------------------"
test_service "API Health Check" "http://localhost:8000/api/v1/health" "200"
test_service "API Documentation" "http://localhost:8000/docs" "200"
echo ""

echo "4️⃣  Database Connection"
echo "------------------------------"
echo -n "Testing PostgreSQL connection... "
if docker-compose exec -T postgres psql -U novaclub -d novaclub_db -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${RED}✗ Failed${NC}"
fi
echo ""

echo "5️⃣  Redis Connection"
echo "------------------------------"
echo -n "Testing Redis connection... "
if docker-compose exec -T redis redis-cli PING | grep -q "PONG"; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${RED}✗ Failed${NC}"
fi
echo ""

echo "======================================"
echo "  Test Summary"
echo "======================================"
echo ""
echo "🌐 Access URLs:"
echo "   - PWA: http://localhost:3000"
echo "   - API Docs: http://localhost:8000/docs"
echo "   - Adminer: http://localhost:8080"
echo ""

# Check for errors in backend logs
echo "6️⃣  Recent Backend Logs (last 20 lines)"
echo "------------------------------"
docker-compose logs backend --tail=20 | grep -i error || echo -e "${GREEN}No errors found${NC}"
echo ""

echo -e "${YELLOW}📋 Next steps:${NC}"
echo "   1. Open http://localhost:3000"
echo "   2. Click 'Créer un compte'"
echo "   3. Fill in your club information"
echo "   4. Start adding members!"
echo ""
echo "📖 Full test guide: GUIDE_TEST.md"
echo ""
