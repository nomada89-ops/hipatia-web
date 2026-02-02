@echo off
echo Installing missing Backend dependencies...
pip install cryptography argon2-cffi reportlab
echo.
echo Dependencies installed. You can now close this window and restart start_dev.bat
pause
