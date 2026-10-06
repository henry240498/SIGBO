@echo off
title SIGBO-CBVC - Inicio
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar-sigbo.ps1" %*
if errorlevel 1 pause
