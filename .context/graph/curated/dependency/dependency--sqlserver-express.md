---
id: dependency--sqlserver-express
tipo: DEPENDENCY
nombre: SQL Server 2019 Express (instancia SQLEXPRESS local)
nivel: L1
resumen: Motor de base de datos. Instancia local SQLEXPRESS, login SQL sigbo_app, archivos MDF/LDF en la raiz del repositorio.
archivos: [database/install_local.ps1, database/enable-tcp-sqlexpress.ps1, backend/src/core/database/data-source-options.ts]
terminos: [sqlserver, express, sqlexpress, mdf, ldf, base, datos, motor, 1433, dbeaver]
---

## Entorno local

| Que | Valor |
|---|---|
| Instancia | `SQLEXPRESS` |
| Base | `sigbo_cbvc` (`DB_NAME`) |
| Login | `sigbo_app` (autenticacion SQL) |
| Puerto | 1433 (`DB_PORT`) |
| Archivos | `sigbo_cbvc.mdf` / `sigbo_cbvc_log.ldf` en la raiz del repositorio |

Credenciales en `backend/.env`. Conexion con DBeaver documentada en
`database/dbeaver/conexion-sigbo-local.md`.

## Limites de la edicion Express

- **10 GB** por base de datos.
- ~**1410 MB** de RAM para el motor.
- **1 socket / 4 cores**.
- Sin SQL Server Agent: no hay trabajos programados en el motor. Cualquier tarea
  periodica tiene que vivir afuera.

## Dos fallas de arranque que ya costaron tiempo

1. **TCP/IP viene deshabilitado** — [[error--tcp-sqlexpress-deshabilitado]].
2. **Las migraciones necesitan `QUOTED_IDENTIFIER ON`** —
   [[error--quoted-identifier-en-migraciones]].

## Nota sobre los archivos MDF/LDF en el repositorio

`sigbo_cbvc.mdf` (~75 MB) y su log estan en la raiz del proyecto. Son archivos
<<<<<<< Updated upstream
binarios de base de datos con **datos reales de 164 personas**. `.gitignore` los
excluye (`*.mdf`, `*.ldf`), y conviene que siga asi: no deberian viajar a un remoto.
=======
binarios de base de datos con **datos reales de 164 personas**. Antes de compartir el
repositorio o cambiarlos de lugar, verificar `.gitignore`: no deberian viajar a un
remoto.
>>>>>>> Stashed changes

Ver [[decision--sqlserver-en-vez-de-postgres]] para el porque de este motor.
