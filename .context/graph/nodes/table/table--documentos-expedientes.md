---
id: table--documentos-expedientes
tipo: TABLE
nombre: documentos.expedientes
nivel: L2
dominio: documentos
resumen: Tabla documentos.expedientes (8 columnas). Creada en 054_documentos_expedientes_plantillas.sql.
tabla: expedientes
archivos:
  - database/migrations/054_documentos_expedientes_plantillas.sql
edges:
  - [defined_in, file--054-documentos-expedientes-plantillas]
  - [belongs_to, domain--documentos]
  - [references, table--seguridad-usuarios]
terminos: [documentos, expedientes, numero, titulo, descripcion, estado, institucion, creado]
---

# documentos.expedientes

Tabla documentos.expedientes (8 columnas). Creada en 054_documentos_expedientes_plantillas.sql.

- **Esquema:** documentos · **Columnas:** 8
- **UNIQUE:** `numero`

## Llaves foraneas

- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| numero | NVARCHAR(50) |
| titulo | NVARCHAR(300) |
| descripcion | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/organizacion/documentos`
- **Endpoints:** ExpedientesController
- **Servicios:** ExpedientesService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/054_documentos_expedientes_plantillas.sql`

## Relaciones

- `defined_in` → [[file--054-documentos-expedientes-plantillas|054_documentos_expedientes_plantillas.sql]]
- `belongs_to` → [[domain--documentos|Documentos]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--expediente|Expediente]] `persisted_in` →
- [[service--documentos-expedientes|ExpedientesService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
