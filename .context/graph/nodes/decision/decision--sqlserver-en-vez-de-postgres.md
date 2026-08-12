---
id: decision--sqlserver-en-vez-de-postgres
tipo: DECISION
nombre: SQL Server 2019 Express en vez de PostgreSQL + TimescaleDB
nivel: L1
estado: VIGENTE
resumen: A pedido explicito del usuario se uso SQL Server Express. Cambia el dialecto (T-SQL) y los tipos de columna, no el modelo logico de datos.
archivos:
  - backend/src/core/database/data-source-options.ts
  - docs/README.md
edges:
  - [depends_on, dependency--sqlserver-express]
  - [constrains, configuration--conexion-datos]
terminos: [sqlserver, mssql, postgres, timescaledb, tsql, dialecto, express, tipos, sql, server, 2019, vez, postgre, timescale, pedido, explicito, usuario, uso, cambia, columna, modelo, logico, datos]
---

# SQL Server 2019 Express en vez de PostgreSQL + TimescaleDB

A pedido explicito del usuario se uso SQL Server Express. Cambia el dialecto (T-SQL) y los tipos de columna, no el modelo logico de datos.

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
- Sin SQL Server Agent: no hay trabajos programados en el motor.
- Sin TimescaleDB: las series de asistencia son tablas normales con indices.

## Riesgo operativo conocido

La instancia local trae TCP/IP deshabilitado de fabrica — ver
[[error--tcp-sqlexpress-deshabilitado]]. Y las migraciones necesitan
`QUOTED_IDENTIFIER ON` — ver [[error--quoted-identifier-en-migraciones]].


## Archivos

- `backend/src/core/database/data-source-options.ts`
- `docs/README.md`

## Relaciones

- `depends_on` → [[dependency--sqlserver-express|SQL Server 2019 Express (instancia SQLEXPRESS local)]]
- `constrains` → [[configuration--conexion-datos|Conexion a SQL Server (TypeORM)]]

---
<sub>Nodo **curado** (editable a mano).</sub>
