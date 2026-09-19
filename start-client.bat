@echo off
echo Starting EventFlow AI Frontend Client on port 5173...
cd /d "%~dp0client"
npm.cmd run dev
pause
