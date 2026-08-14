---
id: table--operaciones-ordenes-guardia-modificaciones
tipo: TABLE
nombre: operaciones.ordenes_guardia_modificaciones
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.ordenes_guardia_modificaciones (9 columnas). Creada en 030_ordenes_guardia.sql.
tabla: ordenes_guardia_modificaciones
archivos:
  - database/migrations/030_ordenes_guardia.sql
edges:
  - [defined_in, file--030-ordenes-guardia]
  - [belongs_to, domain--asistencia]
  - [references, table--operaciones-ordenes-guardia]
terminos: [operaciones, ordenes, guardia, modificaciones, orden, campo, descripcion, valor, anterior, nuevo, motivo, registrado]
---

# operaciones.ordenes_guardia_modificaciones

Tabla operaciones.ordenes_guardia_modificaciones (9 columnas). Creada en 030_ordenes_guardia.sql.

- **Esquema:** operaciones · **Columnas:** 9

## Llaves foraneas

- `orden_id` → [[table--operaciones-ordenes-guardia|operaciones.ordenes_guardia]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| orden_id | UNIQUEIDENTIFIER |
| campo | NVARCHAR(100) |
| descripcion | NVARCHAR(MAX) |
| valor_anterior | NVARCHAR(MAX) |
| valor_nuevo | NVARCHAR(MAX) |
| motivo | NVARCHAR(MAX) |
| registrado_en | DATETIMEOFFSET(3) |
| registrado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** OrdenesGuardiaController
- **Servicios:** OrdenesGuardiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/030_ordenes_guardia.sql`

## Relaciones

- `defined_in` → [[file--030-ordenes-guardia|030_ordenes_guardia.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--operaciones-ordenes-guardia|operaciones.ordenes_guardia]]

## Referenciado por

- [[entity--orden-guardia-modificacion|OrdenGuardiaModificacion]] `persisted_in` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
