---
id: error--docker-parado-tras-reinicio
tipo: ERROR
nombre: Tras reiniciar la PC, iniciar-sigbo fallaba porque Docker Desktop no estaba activo
nivel: L1
resumen: El script lanzaba una excepción con la salida de error de docker info y solo buscaba Docker en Program Files; ahora espera a Docker y lo busca también en LOCALAPPDATA.
severidad: MEDIA
archivos: [iniciar-sigbo.ps1, iniciar-sigbo.bat]
terminos: [docker, reinicio, iniciar, sqlserver, powershell, erroractionpreference, 14330]
edges:
---

## Causa

PowerShell 5.1 con `$ErrorActionPreference = 'Stop'` convierte el stderr de `docker info` en
una excepción cuando Docker aún no responde. Además, Docker Desktop instalado por usuario
vive en `%LOCALAPPDATA%\Programs\DockerDesktop`, que el script no miraba.

## Solución

La función `Docker-Listo` arranca Docker Desktop si hace falta y espera hasta que `docker
info` responda (puede tardar un par de minutos). Verificado en arranque en frío.

Aviso: al terminar, el script espera una tecla. Para automatizarlo, lanzarlo en segundo
plano o no esperar su cierre.
