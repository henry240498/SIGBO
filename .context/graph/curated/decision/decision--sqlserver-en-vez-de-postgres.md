---
id: decision--sqlserver-en-vez-de-postgres
tipo: DECISION
nombre: SQL Server 2019 Express en vez de PostgreSQL + TimescaleDB
nivel: L1
resumen: A pedido explicito del usuario se uso SQL Server Express. Cambia el dialecto (T-SQL) y los tipos de columna, no el modelo logico de datos.
estado: VIGENTE
fuente: docs/README.md
archivos: [backend/src/core/database/data-source-options.ts, docs/README.md]
terminos: [sqlserver, mssql, postgres, timescaledb, tsql, dialecto, express, tipos]
edges:
  - [depends_on, dependency--sqlserver-express]
  - [constrains, configuration--conexion-datos]
---

## Decision

SQL Server 2019 Express, instancia `SQLEXPRESS`, login SQL `sigbo_app`.

## Traduccion de tipos respecto del diseno original

| PostgreSQL | SQL Server (lo que se usa) |
|---|---|
| `UUID` | `UNIQUEIDENTIFIER` + `DEFAULT NEWSEQUENTIALID()` |
| `TIMESTAMPTZ` | `DATETIMEOFFSET(3)` |
| `JSONB` | `NVARCHAR(MAX)` + `CHECK (ISJSON(col) = 1)` |
| `PL/pgSQL` | T-SQL |

El **modelo logico no cambio**: los mismos esquemas, las mismas relaciones.

## Costo aceptado

- `NVARCHAR(MAX)` no es consultable ni indexable como `JSONB`: los campos JSON
  (ver [[decision--comunicacion-como-json]]) se leen enteros y se parsean en la
  aplicacion.
- Express limita a 10 GB por base de datos y ~1410 MB de RAM del motor.
<<<<<<< Updated upstream
- Sin SQL Server Agent: no hay trabajos programados en el motor.
=======
>>>>>>> Stashed changes
- Sin TimescaleDB: las series de asistencia son tablas normales con indices.

## Riesgo operativo conocido

La instancia local trae TCP/IP deshabilitado de fabrica — ver
[[error--tcp-sqlexpress-deshabilitado]]. Y las migraciones necesitan
`QUOTED_IDENTIFIER ON` — ver [[error--quoted-identifier-en-migraciones]].
