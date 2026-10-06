@echo off
title SIGBO - Conectar celulares
cd /d "%~dp0"
echo Preparando la conexion de los celulares...
node scripts\conectar-celulares.mjs
if errorlevel 1 (
  echo.
  echo Revise lo que dice arriba y la pagina que se abrio en el navegador.
)
pause
