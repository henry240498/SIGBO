@echo off
title SIGBO-CBVC - Detener
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$r=$PSScriptRoot; foreach($p in 3001,3002){ Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | ForEach-Object { taskkill /PID $_.OwningProcess /T /F | Out-Null; Write-Host \"Puerto $p detenido\" } }"
echo SIGBO detenido (SQL Server y Ollama se dejan activos).
pause
