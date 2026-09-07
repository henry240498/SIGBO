---
id: table--documentos-versiones-archivo
tipo: TABLE
nombre: documentos.versiones_archivo
nivel: L2
dominio: documentos
resumen: Tabla documentos.versiones_archivo (10 columnas). Creada en 053_documentos_relaciones_versiones.sql.
tabla: versiones_archivo
archivos:
  - database/migrations/053_documentos_relaciones_versiones.sql
edges:
  - [defined_in, file--053-documentos-relaciones-versiones]
  - [belongs_to, domain--documentos]
  - [references, table--documentos-documentos-institucionales]
  - [references, table--seguridad-usuarios]
terminos: [documentos, versiones, archivo, documento, numero, version, url, nombre, original, extension, tamano, bytes, motivo, creado]
---

# documentos.versiones_archivo

Tabla documentos.versiones_archivo (10 columnas). Creada en 053_documentos_relaciones_versiones.sql.

- **Esquema:** documentos · **Columnas:** 10
- **UNIQUE:** `documento_id, numero_version`

## Llaves foraneas

- `documento_id` → [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| documento_id | UNIQUEIDENTIFIER |
| numero_version | INT |
| archivo_url | NVARCHAR(MAX) |
| archivo_nombre_original | NVARCHAR(300) |
| archivo_extension | NVARCHAR(10) |
| archivo_tamano_bytes | BIGINT |
| motivo | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/organizacion/documentos`
- **Endpoints:** DocumentosController
- **Servicios:** DocumentosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/053_documentos_relaciones_versiones.sql`

## Relaciones

- `defined_in` → [[file--053-documentos-relaciones-versiones|053_documentos_relaciones_versiones.sql]]
- `belongs_to` → [[domain--documentos|Documentos]]
- `references` → [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--version-archivo-documento|VersionArchivoDocumento]] `persisted_in` →
- [[service--documentos-documentos|DocumentosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
