---
id: workflow--conectar-celular-al-servidor
tipo: WORKFLOW
nombre: Conectar un celular con el servidor del cuartel
nivel: L1
resumen: Levantar el sistema, generar el QR con conectar-celulares.bat y escanearlo en la app; fuera del cuartel se usa el túnel.
dominio: servicios
fuente: scripts/conectar-celulares.mjs
archivos: [iniciar-sigbo.bat, conectar-celulares.bat, scripts/conectar-celulares.mjs, docs/CONECTAR-CELULARES.md, tunel-sigbo.bat]
terminos: [conectar, qr, celular, servidor, wifi, tunel, cloudflared, salud, ip]
edges:
---

1. `iniciar-sigbo.bat` (Docker + SQL Server en 14330, backend 3001, web 3002, Ollama).
2. `conectar-celulares.bat`: elige la IP de la red local, comprueba `/api/v1/salud` y abre la
   página con el QR (`logs/conectar-celulares.html`).
3. App → **Conectar** → **Escanear QR** (o escribir `http://IP:3001/api/v1`) → **Probar
   conexión** → **Guardar** → iniciar sesión.
4. Si el celular no llega: misma red WiFi, firewall de Windows abierto al puerto 3001, y que
   el WiFi no aísle clientes. Desde la PC: `node scripts/verificar-conexion-movil.mjs`.
5. Fuera del cuartel: `tunel-sigbo.bat` (cloudflared) y usar la URL del túnel.

Verificado el 2026-10-06: el celular alcanzó el puerto 3001 de la PC y la prueba respondió.
