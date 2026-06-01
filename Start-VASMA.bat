@echo off
cd /d "%~dp0"
echo Starting VASMA System...
echo.
echo Open this URL in your browser:
echo http://127.0.0.1:4173/
echo.
python -m http.server 4173 --bind 127.0.0.1
pause
