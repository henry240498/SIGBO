# Inicio rápido de SIGBO

1. Ejecuta **`iniciar-sigbo.bat`** (doble clic). Levanta SQL Server (Docker), Ollama, el backend y el frontend, verifica que respondan y abre el navegador.
   - Primera vez o tras cambiar código: `iniciar-sigbo.bat -Rebuild` (recompila).
   - Sin abrir el navegador: `-NoBrowser`.
2. La aplicación queda en http://localhost:3002 y la API en http://localhost:3001/api/v1.
3. Para apagar el backend y el frontend: **`detener-sigbo.bat`**.

Si quieres un acceso directo en el escritorio, crea un acceso directo a `iniciar-sigbo.bat`.

## Conectar los celulares

Abrir `conectar-celulares.bat` (con SIGBO iniciado): muestra los QR para instalar y conectar la app. Guia completa en `docs/CONECTAR-CELULARES.md`.

## Verificar que todo funciona

```powershell
cd backend;  npm test                         # pruebas unitarias (sin SQL Server)
cd backend;  npm run build; npm run verificar:escrituras   # escrituras reales, en una transacción que se revierte
cd frontend; npx tsc --noEmit; npm run audit:contraste; npm run audit:a11y
cd .movile;  flutter analyze; flutter test
node scripts\verificar-conexion-movil.mjs   # lo mismo que hace un celular, por la direccion de la red
node --test scripts\conectar-celulares.test.mjs
```

## Respaldos

El respaldo diario (02:00) está programado en el Programador de tareas (`SIGBO-Respaldo-Diario`) y deja los `.bak` con su SHA-256 en `respaldos/` (ignorada por git). Los domingos también restaura de prueba. Ver `respaldos\registro.log`. Para quitarlo: `workflows\scripts\programar-respaldo.ps1 -Quitar`.
Guarda una copia de `respaldos/` y de `~\.sigbo\clave-actualizaciones.pem` **fuera de esta PC**.
