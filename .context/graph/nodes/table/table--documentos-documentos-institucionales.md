---
id: table--documentos-documentos-institucionales
tipo: TABLE
nombre: documentos.documentos_institucionales
nivel: L2
dominio: documentos
resumen: Tabla documentos.documentos_institucionales (35 columnas). Creada en 052_documentos_estructura.sql, modificada por 054_documentos_expedientes_plantillas.sql, 059_documentos_disponible_ia.sql.
tabla: documentos_institucionales
archivos:
  - database/migrations/052_documentos_estructura.sql
  - database/migrations/054_documentos_expedientes_plantillas.sql
  - database/migrations/059_documentos_disponible_ia.sql
edges:
  - [defined_in, file--052-documentos-estructura]
  - [belongs_to, domain--documentos]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-parametros]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [documentos, institucionales, numero, documental, tipo, documento, categoria, titulo, descripcion, origen, fecha, emision, inicio, vigencia, vencimiento, estado, version, nivel, confidencialidad, fisico, archivo, estante, caja, carpeta, url, nombre, original, extension, tamano, bytes, expediente, orden, plantilla, generado, modulo, motivo, anulacion, anulado, institucion, creado]
---

# documentos.documentos_institucionales

Tabla documentos.documentos_institucionales (35 columnas). Creada en 052_documentos_estructura.sql, modificada por 054_documentos_expedientes_plantillas.sql, 059_documentos_disponible_ia.sql.

- **Esquema:** documentos · **Columnas:** 35

## Llaves foraneas

- `tipo_documento_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `categoria_documento_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `estado_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `nivel_confidencialidad_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `archivo_fisico_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `motivo_anulacion_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `anulado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `actualizado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| numero_documental | NVARCHAR(50) |
| tipo_documento_id | UNIQUEIDENTIFIER |
| categoria_documento_id | UNIQUEIDENTIFIER |
| titulo | NVARCHAR(300) |
| descripcion | NVARCHAR(MAX) |
| origen | NVARCHAR(10) |
| fecha_emision | DATE |
| fecha_inicio_vigencia | DATE |
| fecha_vencimiento | DATE |
| estado_id | UNIQUEIDENTIFIER |
| version | INT |
| nivel_confidencialidad_id | UNIQUEIDENTIFIER |
| es_fisico | BIT |
| archivo_fisico_id | UNIQUEIDENTIFIER |
| estante | NVARCHAR(20) |
| caja | NVARCHAR(20) |
| carpeta | NVARCHAR(20) |
| archivo_url | NVARCHAR(MAX) |
| archivo_nombre_original | NVARCHAR(300) |
| archivo_extension | NVARCHAR(10) |
| archivo_tamano_bytes | BIGINT |
| expediente_id | UNIQUEIDENTIFIER |
| orden_en_expediente | INT |
| plantilla_id | UNIQUEIDENTIFIER |
| generado_por_modulo | NVARCHAR(50) |
| motivo_anulacion_id | UNIQUEIDENTIFIER |
| anulado_por | UNIQUEIDENTIFIER |
| fecha_anulacion | DATETIMEOFFSET(3) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |
| disponible_para_ia | BIT |

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/organizacion/documentos`
- **Endpoints:** ConsultasDocumentosController, DashboardDocumentosController, DocumentosController, ExpedientesController, PlantillasController
- **Servicios:** ConsultasDocumentosService, DashboardDocumentosService, DocumentosService, ExpedientesService, PlantillasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/052_documentos_estructura.sql`
- `database/migrations/054_documentos_expedientes_plantillas.sql`
- `database/migrations/059_documentos_disponible_ia.sql`

## Relaciones

- `defined_in` → [[file--052-documentos-estructura|052_documentos_estructura.sql]]
- `belongs_to` → [[domain--documentos|Documentos]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--documentos-relaciones|documentos.relaciones]] `references` →
- [[table--documentos-versiones-archivo|documentos.versiones_archivo]] `references` →
- [[table--documentos-firmas-documento|documentos.firmas_documento]] `references` →
- [[entity--documento|Documento]] `persisted_in` →
- [[service--documentos-consultas-documentos|ConsultasDocumentosService]] `reads` →
- [[service--documentos-dashboard-documentos|DashboardDocumentosService]] `reads` →
- [[service--documentos-documentos|DocumentosService]] `reads` →
- [[service--documentos-expedientes|ExpedientesService]] `reads` →
- [[service--documentos-plantillas|PlantillasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
