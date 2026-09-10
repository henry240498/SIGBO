@echo off
REM Tunel temporal para probar la app fuera de la red local.
REM La URL https resultante se pega en la app en Ajustes ^> Servidor + /api/v1
powershell -ExecutionPolicy Bypass -File "%~dp0tunel.ps1"
