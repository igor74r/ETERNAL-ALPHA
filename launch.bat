@echo off
setlocal
cd /d "%~dp0"
cd dist
start "" cmd /c "timeout /t 2 >nul & start http://127.0.0.1:8000"
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 8000
) else (
  python -m http.server 8000
)
