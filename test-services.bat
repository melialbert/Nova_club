@echo off
echo ======================================
echo   NovaClub - Test des Services
echo ======================================
echo.

echo 1 Docker Services Status
echo ------------------------------
docker-compose ps | findstr /C:"novaclub-backend" && echo Backend: OK || echo Backend: FAILED
docker-compose ps | findstr /C:"novaclub-pwa" && echo PWA: OK || echo PWA: FAILED
docker-compose ps | findstr /C:"postgres" && echo PostgreSQL: OK || echo PostgreSQL: FAILED
docker-compose ps | findstr /C:"redis" && echo Redis: OK || echo Redis: FAILED
docker-compose ps | findstr /C:"adminer" && echo Adminer: OK || echo Adminer: FAILED
echo.

echo 2 HTTP Services Health
echo ------------------------------
curl -s -o nul -w "PWA Frontend: %%{http_code}\n" http://localhost:3000
curl -s -o nul -w "Backend API: %%{http_code}\n" http://localhost:8000/docs
curl -s -o nul -w "Adminer: %%{http_code}\n" http://localhost:8080
echo.

echo 3 Backend API Endpoints
echo ------------------------------
curl -s -o nul -w "Health Check: %%{http_code}\n" http://localhost:8000/api/v1/health
echo.

echo ======================================
echo   Test Summary
echo ======================================
echo.
echo Access URLs:
echo    - PWA: http://localhost:3000
echo    - API Docs: http://localhost:8000/docs
echo    - Adminer: http://localhost:8080
echo.
echo Next steps:
echo    1. Open http://localhost:3000
echo    2. Click 'Creer un compte'
echo    3. Fill in your club information
echo    4. Start adding members!
echo.
echo Full test guide: GUIDE_TEST.md
echo.
pause
