@echo off
setlocal
title PulseMind Demo Launcher
set "ROOT=%~dp0"

echo.
echo ============================================
echo   PulseMind - Smart Workload Planner Demo
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to run this demo.
  echo Please install Node.js LTS, then run START_HERE.bat again.
  echo.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please reinstall Node.js LTS.
  echo.
  pause
  exit /b 1
)

echo Starting PulseMind backend on http://localhost:3001 ...
start "PulseMind Backend" cmd /k "cd /d ""%ROOT%pulsemind-backend"" && npm.cmd install && npm.cmd start"

echo Starting PulseMind frontend on http://localhost:3000 ...
start "PulseMind Frontend" cmd /k "cd /d ""%ROOT%pulsemind"" && npm.cmd install && npm.cmd start"

echo.
echo The app will open in your browser shortly.
echo Keep the two terminal windows open during the demo.
echo.
timeout /t 10 /nobreak >nul
start http://localhost:3000

exit /b 0
