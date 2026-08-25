---
id: configuration--conexion-datos
tipo: CONFIGURATION
nombre: Conexion a SQL Server (TypeORM)
nivel: L2
dominio: seguridad
resumen: "Opciones del DataSource: pool, timeouts, naming strategy y synchronize:false."
archivos:
  - backend/src/core/database/data-source-options.ts
terminos: [conexion, datasource, typeorm, sqlserver, pool, timeout, mssql]
---

# Conexion a SQL Server (TypeORM)

Opciones del DataSource: pool, timeouts, naming strategy y synchronize:false.


## Variables de entorno

`DB_DISCOVERED_PORT` · `DB_INSTANCE` · `DB_HOST` · `DB_PORT` · `DB_USER` · `DB_PASSWORD` · `DB_NAME` · `NODE_ENV`

## Archivos

- `backend/src/core/database/data-source-options.ts`

## Referenciado por

- [[decision--body-parser-8mb|Body parser de 8 MB y CORS permisivo para recursos, por el croquis embebido]] `configured_by` →
- [[decision--pool-idle-timeout|Pool de conexiones con idleTimeoutMillis bajo para reciclar conexiones colgadas]] `configured_by` →
- [[decision--sqlserver-en-vez-de-postgres|SQL Server 2019 Express en vez de PostgreSQL + TimescaleDB]] `constrains` →
- [[error--413-croquis-grande|413 Payload Too Large al guardar una comunicacion con croquis]] `originates_from` →
- [[error--pool-conexion-colgada|Timeouts de exactamente 15 segundos en todos los endpoints]] `originates_from` →
- [[error--tcp-sqlexpress-deshabilitado|SQL Server Express llega con TCP/IP deshabilitado y el backend no conecta]] `originates_from` →
- [[rule--entidad-y-tabla-en-paralelo|Cambiar una entidad exige la migracion correspondiente en el mismo cambio]] `affects` →
- [[rule--snake-case-en-bd-camel-en-typescript|snake_case en la base, camelCase en TypeScript, traducido por SnakeNamingStrategy]] `configured_by` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
