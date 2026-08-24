---
id: table--documentos-plantillas
tipo: TABLE
nombre: documentos.plantillas
nivel: L2
dominio: documentos
resumen: Tabla documentos.plantillas (10 columnas). Creada en 054_documentos_expedientes_plantillas.sql.
tabla: plantillas
archivos:
  - database/migrations/054_documentos_expedientes_plantillas.sql
edges:
  - [defined_in, file--054-documentos-expedientes-plantillas]
  - [belongs_to, domain--documentos]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-cargos]
terminos: [documentos, plantillas, nombre, tipo, documento, contenido, cargo, firmante, activa, creado, actualizado]
---

# documentos.plantillas

Tabla documentos.plantillas (10 columnas). Creada en 054_documentos_expedientes_plantillas.sql.

- **Esquema:** documentos · **Columnas:** 10

## Llaves foraneas

- `tipo_documento_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `cargo_firmante_id` → [[table--organizacion-cargos|organizacion.cargos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(200) |
| tipo_documento_id | UNIQUEIDENTIFIER |
| contenido | NVARCHAR(MAX) |
| cargo_firmante_id | UNIQUEIDENTIFIER |
| activa | BIT |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/organizacion/documentos`
- **Endpoints:** PlantillasController
- **Servicios:** PlantillasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/054_documentos_expedientes_plantillas.sql`

## Relaciones

- `defined_in` → [[file--054-documentos-expedientes-plantillas|054_documentos_expedientes_plantillas.sql]]
- `belongs_to` → [[domain--documentos|Documentos]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-cargos|organizacion.cargos]]

## Referenciado por

- [[entity--plantilla-documento|PlantillaDocumento]] `persisted_in` →
- [[service--documentos-plantillas|PlantillasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
