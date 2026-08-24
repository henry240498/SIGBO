---
id: dependency--nodejs
tipo: DEPENDENCY
nombre: Node.js 20+ y PowerShell como entorno de ejecucion
nivel: L2
resumen: Node.js 20 o posterior y PowerShell en Windows. Los scripts de arranque, instalacion y migracion son compatibles con PowerShell 5.1, no bash.
archivos:
  - start-sigbo.ps1
  - database/run-migrations.ps1
  - database/install_local.ps1
terminos: [node, nodejs, 20, powershell, windows, script, arranque, npm, ps1, power, shell, entorno, ejecucion, posterior, scripts, instalacion, migracion, son, compatibles, bash]
---

# Node.js 20+ y PowerShell como entorno de ejecucion

Node.js 20 o posterior y PowerShell en Windows. Los scripts de arranque, instalacion y migracion son compatibles con PowerShell 5.1, no bash.

## Entorno

- **Node.js 20 o posterior**, npm. CI usa Node 20.
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

El iniciador recompila y reinicia las instancias anteriores de SIGBO en los puertos
3000 y 3001. Si el puerto pertenece a otro proceso, aborta sin terminarlo.

## Este grafo tambien corre en Node

`build-graph.mjs`, `context.mjs` y `validar.mjs` son ESM sin dependencias, pensados
para Node 18+. No necesitan Python ni instalar nada. Es deliberado: el indice no debe
tener requisitos propios mas alla de lo que el proyecto ya usa.


## Archivos

- `start-sigbo.ps1`
- `database/run-migrations.ps1`
- `database/install_local.ps1`

## Referenciado por

- [[error--context-borrado-del-disco|.context/ desaparecio del disco por estar en .gitignore]] `originates_from` →

---
<sub>Nodo **curado** (editable a mano).</sub>
