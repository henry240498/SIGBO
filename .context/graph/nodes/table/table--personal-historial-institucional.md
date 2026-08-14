---
id: table--personal-historial-institucional
tipo: TABLE
nombre: personal.historial_institucional
nivel: L2
dominio: personal
resumen: Tabla personal.historial_institucional (11 columnas). Creada en 016_personal_expansion.sql.
tabla: historial_institucional
archivos:
  - database/migrations/016_personal_expansion.sql
edges:
  - [defined_in, file--016-personal-expansion]
  - [belongs_to, domain--personal]
  - [references, table--personal-bomberos]
terminos: [personal, historial, institucional, bombero, tipo, movimiento, fecha, usuario, responsable, motivo, observacion, documento, url, referencia, tabla, creado]
---

# personal.historial_institucional

Tabla personal.historial_institucional (11 columnas). Creada en 016_personal_expansion.sql.

- **Esquema:** personal · **Columnas:** 11

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| tipo_movimiento | NVARCHAR(30) |
| fecha | DATE |
| usuario_responsable_id | UNIQUEIDENTIFIER |
| motivo | NVARCHAR(MAX) |
| observacion | NVARCHAR(MAX) |
| documento_url | NVARCHAR(MAX) |
| referencia_tabla | NVARCHAR(100) |
| referencia_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** BomberosController, CondicionController, FojaServicioController, HistorialInstitucionalController
- **Servicios:** BomberosService, CondicionService, FojaServicioService, HistorialInstitucionalService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/016_personal_expansion.sql`

## Relaciones

- `defined_in` → [[file--016-personal-expansion|016_personal_expansion.sql]]
- `belongs_to` → [[domain--personal|Personal]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[entity--historial-institucional|HistorialInstitucional]] `persisted_in` →
- [[service--personal-bomberos|BomberosService]] `reads` →
- [[service--personal-condicion|CondicionService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →
- [[service--personal-historial-institucional|HistorialInstitucionalService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
