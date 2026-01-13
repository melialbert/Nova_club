@echo off
echo ======================================
echo   Test de bcrypt dans le backend
echo ======================================
echo.

echo Verification de l'installation de bcrypt...
echo.

docker exec novaclub-backend pip list | findstr bcrypt

if errorlevel 1 (
    echo bcrypt n'est pas installe !
    echo.
    echo Installation de bcrypt...
    docker exec novaclub-backend pip install bcrypt==4.0.1
    echo.
    echo bcrypt installe
) else (
    echo bcrypt est installe
)

echo.
echo Test du hashing et de la verification...
echo.

docker exec novaclub-backend python -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto'); password = 'test123'; hashed = pwd_context.hash(password); print(f'Hash: {hashed[:20]}... (length: {len(hashed)})'); print(f'Verification: {pwd_context.verify(password, hashed)}'); print(f'Wrong password: {pwd_context.verify(\"wrong\", hashed)}')"

echo.
echo Logs recents du backend :
echo.
docker-compose logs backend --tail=10

echo.
pause
