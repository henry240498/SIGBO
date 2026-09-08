@echo off
title SIGBO-CBVC
powershell.exe -NoProfile -File "%~dp0start-sigbo.ps1"
if errorlevel 1 (
    echo.
    echo PowerShell termino con un error antes de completar el inicio.
    pause
)
