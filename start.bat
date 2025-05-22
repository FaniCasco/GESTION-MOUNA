@echo off
title GESTION MOUNA - Sistema Profesional
color 0a

echo Iniciando backend (Node.js + Express + PostgreSQL) y frontend (React)...
echo.


set BASE_PATH=%~dp0
set BACKEND_PATH=%BASE_PATH%server
set FRONTEND_PATH=%BASE_PATH%gestion


cd /d "%BACKEND_PATH%"
echo Iniciando backend...

start "" /B npm run dev


timeout /t 3 >nul


cd /d "%FRONTEND_PATH%"
echo Iniciando frontend...
call npm start

echo.
echo URLs de acceso:

echo Backend API:  http://localhost:3000

echo.
pause