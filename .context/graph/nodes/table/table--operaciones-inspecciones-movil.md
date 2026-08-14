---
id: table--operaciones-inspecciones-movil
tipo: TABLE
nombre: operaciones.inspecciones_movil
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.inspecciones_movil (8 columnas). Creada en 029_guardias_moviles_bitacora.sql.
tabla: inspecciones_movil
archivos:
  - database/migrations/029_guardias_moviles_bitacora.sql
edges:
  - [defined_in, file--029-guardias-moviles-bitacora]
  - [belongs_to, domain--asistencia]
  - [references, table--operaciones-guardias]
  - [references, table--vehiculos-vehiculos]
  - [references, table--vehiculos-checklist-items]
terminos: [operaciones, inspecciones, movil, guardia, vehiculo, checklist, item, estado, observacion, responsable, creado]
---

# operaciones.inspecciones_movil

Tabla operaciones.inspecciones_movil (8 columnas). Creada en 029_guardias_moviles_bitacora.sql.

- **Esquema:** operaciones · **Columnas:** 8

## Llaves foraneas

- `guardia_id` → [[table--operaciones-guardias|operaciones.guardias]]
- `vehiculo_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `checklist_item_id` → [[table--vehiculos-checklist-items|vehiculos.checklist_items]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| guardia_id | UNIQUEIDENTIFIER |
| vehiculo_id | UNIQUEIDENTIFIER |
| checklist_item_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(10) |
| observacion | NVARCHAR(MAX) |
| responsable_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** BitacoraController, InspeccionesMovilController
- **Servicios:** BitacoraService, InspeccionesMovilService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/029_guardias_moviles_bitacora.sql`

## Relaciones

- `defined_in` → [[file--029-guardias-moviles-bitacora|029_guardias_moviles_bitacora.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--operaciones-guardias|operaciones.guardias]]
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `references` → [[table--vehiculos-checklist-items|vehiculos.checklist_items]]

## Referenciado por

- [[entity--inspeccion-movil|InspeccionMovil]] `persisted_in` →
- [[service--guardias-bitacora|BitacoraService]] `reads` →
- [[service--guardias-inspecciones-movil|InspeccionesMovilService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
