@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install the current LTS version from https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
  echo Installing game dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:5173"
call npm run dev -- --host 127.0.0.1
pause
