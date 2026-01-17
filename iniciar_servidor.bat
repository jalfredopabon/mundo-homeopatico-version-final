@echo off
echo ========================================
echo   Servidor Local - Lista de Precios
echo ========================================
echo.
echo Iniciando servidor en http://localhost:8000
echo.
echo Abre tu navegador y ve a:
echo   http://localhost:8000/Lista%%20precios%%20version%%201%%20antigravity.html
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

python -m http.server 8000

pause
