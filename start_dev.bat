@echo off
echo ====================================================
echo      Skill Jobs - Starting Development Servers
echo ====================================================
echo.

echo [1/2] Launching Django Backend Server on http://localhost:5000 ...
start "Skill Jobs - Backend (Django :5000)" cmd /k "cd server_django && python manage.py runserver 5000"

echo [2/2] Launching React Vite Frontend on http://localhost:5173 ...
start "Skill Jobs - Frontend (React Vite :5173)" cmd /k "cd client && npm run dev"

echo.
echo ====================================================
echo   Both servers launched successfully!
echo   - Backend API:  http://localhost:5000
echo   - Frontend Web: http://localhost:5173
echo ====================================================
echo.
pause
