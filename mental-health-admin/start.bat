@echo off
echo Starting Mental Health Admin Dashboard...
echo ==========================================

REM Start backend server in a new window
echo Starting backend server...
cd /d "%~dp0backend"
start "Mental Health Admin - Backend" cmd /k "npm run dev"

REM Wait a moment for backend to start
timeout /t 2 /nobreak

REM Start frontend dev server in a new window
echo Starting frontend development server...
cd /d "%~dp0frontend"
start "Mental Health Admin - Frontend" cmd /k "npm run dev"

echo.
echo ==========================================
echo Services started successfully!
echo ==========================================
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3000
echo.
