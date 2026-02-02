@echo off
echo ===================================================
echo   CUADRANTE DEV LAUNCHER
echo ===================================================
echo 1. Starting Backend (FastAPI)...
start "Cuadrante Backend" cmd /k "python core/main.py"

echo 2. Starting Frontend (Vite)...
start "Cuadrante Frontend" cmd /k "npm run dev"

echo ===================================================
echo   Environment Running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://127.0.0.1:8000
echo ===================================================
pause
