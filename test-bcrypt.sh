#!/bin/bash

echo "======================================"
echo "  Test de bcrypt dans le backend"
echo "======================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📦 Vérification de l'installation de bcrypt...${NC}"
echo ""

# Check if bcrypt is installed
BCRYPT_VERSION=$(docker exec novaclub-backend pip list 2>/dev/null | grep bcrypt | awk '{print $2}')

if [ -z "$BCRYPT_VERSION" ]; then
    echo -e "${RED}❌ bcrypt n'est pas installé !${NC}"
    echo ""
    echo "Installation de bcrypt..."
    docker exec novaclub-backend pip install bcrypt==4.0.1
    echo ""
    echo -e "${GREEN}✅ bcrypt installé${NC}"
else
    echo -e "${GREEN}✅ bcrypt est installé (version: $BCRYPT_VERSION)${NC}"
fi

echo ""
echo -e "${YELLOW}🧪 Test du hashing et de la vérification...${NC}"
echo ""

# Test password hashing
TEST_RESULT=$(docker exec novaclub-backend python -c "
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

# Test password
password = 'test123'
hashed = pwd_context.hash(password)
print(f'Hash: {hashed[:20]}... (length: {len(hashed)})')

# Verify password
is_valid = pwd_context.verify(password, hashed)
print(f'Verification: {is_valid}')

# Test wrong password
is_invalid = pwd_context.verify('wrong', hashed)
print(f'Wrong password: {is_invalid}')
" 2>&1)

if echo "$TEST_RESULT" | grep -q "Verification: True"; then
    echo -e "${GREEN}✅ Le hashing et la vérification fonctionnent !${NC}"
    echo ""
    echo "$TEST_RESULT"
    echo ""
    echo -e "${GREEN}🎉 bcrypt est correctement configuré !${NC}"
    echo ""
    echo "Vous pouvez maintenant :"
    echo "  1. Créer un nouveau compte"
    echo "  2. Vous connecter avec ce compte"
    echo ""
else
    echo -e "${RED}❌ Erreur lors du test${NC}"
    echo ""
    echo "$TEST_RESULT"
    echo ""
    echo "Solutions :"
    echo "  1. Redémarrer le backend : docker-compose restart backend"
    echo "  2. Rebuild complet : ./fix-and-restart.sh"
fi

echo ""
echo -e "${YELLOW}📋 Logs récents du backend :${NC}"
echo ""
docker-compose logs backend --tail=10
