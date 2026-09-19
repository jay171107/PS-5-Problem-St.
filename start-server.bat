@echo off
echo Starting EventFlow AI Backend Server on port 5000...
cd /d "%~dp0server"
node src/server.js
pause
