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

start "" powershell -NoProfile -ExecutionPolicy Bypass -Command "$u='http://127.0.0.1:5173'; for($i=0;$i -lt 90;$i++){try{$r=Invoke-WebRequest -UseBasicParsing $u -TimeoutSec 1; if($r.StatusCode -eq 200){Start-Process $u; exit}}catch{}; Start-Sleep -Seconds 1}"
call npm run dev -- --host 127.0.0.1
pause
