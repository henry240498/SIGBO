@echo off
title SIGBO - Tunel para los celulares
echo ============================================================
echo  Tunel temporal: permite usar la app fuera de la red del cuartel.
echo  1) Deje abierta esta ventana mientras se use.
echo  2) Copie la direccion https://xxxx.trycloudflare.com que aparece abajo.
echo  3) En cada celular: Ajustes ^> Servidor ^> pegarla y agregar /api/v1
echo     Ejemplo: https://xxxx.trycloudflare.com/api/v1
echo  La direccion cambia cada vez que se abre el tunel.
echo  Si se corta internet, la app sigue guardando todo y lo envia al volver.
echo ============================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0.movile\scripts\tunel.ps1"
pause
