@echo off
echo ===================================================
echo   Launching EventFlow AI Full-Stack Environment
echo ===================================================

start "EventFlow Backend Server (Port 5000)" cmd /k "cd /d %~dp0server && node src/server.js"
timeout /t 2 /nobreak >nul
start "EventFlow Frontend Client (Port 5173)" cmd /k "cd /d %~dp0client && npm.cmd run dev"

echo.
echo Both servers are launching in separate windows!
echo - Backend:  http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
pause
