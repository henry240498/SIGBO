---
id: table--operaciones-ordenes-guardia
tipo: TABLE
nombre: operaciones.ordenes_guardia
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.ordenes_guardia (23 columnas). Creada en 030_ordenes_guardia.sql.
tabla: ordenes_guardia
archivos:
  - database/migrations/030_ordenes_guardia.sql
edges:
  - [defined_in, file--030-ordenes-guardia]
  - [belongs_to, domain--asistencia]
terminos: [operaciones, ordenes, guardia, anio, mes, numero, periodo, desde, hasta, fecha, emision, estado, contenido, json, generado, revisada, aprobada, publicada, anulada, motivo, archivo, pdf, url, docx, observaciones]
---

# operaciones.ordenes_guardia

Tabla operaciones.ordenes_guardia (23 columnas). Creada en 030_ordenes_guardia.sql.

- **Esquema:** operaciones · **Columnas:** 23
- **UNIQUE:** `anio, numero`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| anio | INT |
| mes | INT |
| numero | INT |
| periodo_desde | DATE |
| periodo_hasta | DATE |
| fecha_emision | DATE |
| estado | NVARCHAR(20) |
| contenido_json | NVARCHAR(MAX) |
| generado_en | DATETIMEOFFSET(3) |
| generado_por | UNIQUEIDENTIFIER |
| revisada_en | DATETIMEOFFSET(3) |
| revisada_por | UNIQUEIDENTIFIER |
| aprobada_en | DATETIMEOFFSET(3) |
| aprobada_por | UNIQUEIDENTIFIER |
| publicada_en | DATETIMEOFFSET(3) |
| publicada_por | UNIQUEIDENTIFIER |
| anulada_en | DATETIMEOFFSET(3) |
| anulada_por | UNIQUEIDENTIFIER |
| anulada_motivo | NVARCHAR(MAX) |
| archivo_pdf_url | NVARCHAR(MAX) |
| archivo_docx_url | NVARCHAR(MAX) |
| observaciones | NVARCHAR(MAX) |

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

## Referenciado por

- [[table--operaciones-ordenes-guardia-modificaciones|operaciones.ordenes_guardia_modificaciones]] `references` →
- [[entity--orden-guardia|OrdenGuardia]] `persisted_in` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
