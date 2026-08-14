---
id: dependency--nodejs
tipo: DEPENDENCY
nombre: Node.js 24 y PowerShell como entorno de ejecucion
nivel: L2
<<<<<<< Updated upstream
resumen: Node 24 LTS en Windows 10. Los scripts de arranque, instalacion y migracion son PowerShell 5.1, no bash.
=======
resumen: Node 24 LTS en Windows 10. Los scripts de arranque, instalacion y migracion son PowerShell, no bash.
>>>>>>> Stashed changes
archivos:
  - start-sigbo.ps1
  - database/run-migrations.ps1
  - database/install_local.ps1
terminos: [node, nodejs, 24, powershell, windows, script, arranque, npm, ps1, power, shell, entorno, ejecucion, lts, scripts, instalacion, migracion, son, bash]
---

# Node.js 24 y PowerShell como entorno de ejecucion

<<<<<<< Updated upstream
Node 24 LTS en Windows 10. Los scripts de arranque, instalacion y migracion son PowerShell 5.1, no bash.
=======
Node 24 LTS en Windows 10. Los scripts de arranque, instalacion y migracion son PowerShell, no bash.
>>>>>>> Stashed changes

## Entorno

- **Node.js 24 LTS**, npm.
- **Windows 10 Pro**, PowerShell 5.1.
- Los scripts operativos son `.ps1`: `start-sigbo.ps1` (con su `start-sigbo.cmd`),
  `database/run-migrations.ps1`, `database/install_local.ps1`,
  `database/enable-tcp-sqlexpress.ps1`.

## PowerShell 5.1, no PowerShell 7

Diferencias que importan al escribir scripts para este repositorio:

- **No existen `&&` ni `||`** como operadores de cadena: se usa `;` con `if ($?)`.
- Sin operador ternario, sin `??`, sin `?.`.
- `ConvertFrom-Json` devuelve `PSCustomObject`, no hashtable (`-AsHashtable` no existe).
- `Set-Content`/`Add-Content` usan la codepage ANSI del sistema salvo que se pase
  `-Encoding utf8` explicitamente — relevante al generar archivos que Node va a leer.

## Arranque

```powershell
cd backend;  npm run start:dev   # http://localhost:3001/api/v1
cd frontend; npm run dev         # http://localhost:3000
```

`start-sigbo.ps1` hace las dos cosas y abre el navegador. Los logs quedan en `logs/`.

**Cuidado:** ese script no reinicia servicios ya escuchando — ver
[[error--start-script-no-reinicia-servicios]]. Es la causa mas frecuente de "mi cambio
no surte efecto".

## Este grafo tambien corre en Node

<<<<<<< Updated upstream
`build-graph.mjs`, `context.mjs` y `validar.mjs` son ESM sin dependencias, pensados
para Node 18+. No necesitan Python ni instalar nada. Es deliberado: el indice no debe
tener requisitos propios mas alla de lo que el proyecto ya usa.
=======
`build-graph.mjs` y `context.mjs` son ESM sin dependencias, pensados para Node 18+.
No necesitan Python ni instalar nada.
>>>>>>> Stashed changes


## Archivos

- `start-sigbo.ps1`
- `database/run-migrations.ps1`
- `database/install_local.ps1`

## Referenciado por

<<<<<<< Updated upstream
- [[error--context-borrado-del-disco|.context/ desaparecio del disco por estar en .gitignore]] `originates_from` →
=======
>>>>>>> Stashed changes
- [[error--start-script-no-reinicia-servicios|start-sigbo.ps1 deja corriendo el proceso viejo si el puerto ya escucha]] `originates_from` →

---
<sub>Nodo **curado** (editable a mano).</sub>
