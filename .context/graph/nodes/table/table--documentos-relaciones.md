---
id: table--documentos-relaciones
tipo: TABLE
nombre: documentos.relaciones
nivel: L2
dominio: documentos
resumen: Tabla documentos.relaciones (8 columnas). Creada en 053_documentos_relaciones_versiones.sql.
tabla: relaciones
archivos:
  - database/migrations/053_documentos_relaciones_versiones.sql
edges:
  - [defined_in, file--053-documentos-relaciones-versiones]
  - [belongs_to, domain--documentos]
  - [references, table--documentos-documentos-institucionales]
  - [references, table--seguridad-usuarios]
terminos: [documentos, relaciones, documento, modulo, entidad, registro, etiqueta, creado]
---

# documentos.relaciones

Tabla documentos.relaciones (8 columnas). Creada en 053_documentos_relaciones_versiones.sql.

- **Esquema:** documentos · **Columnas:** 8
- **UNIQUE:** `documento_id, modulo, entidad, registro_id`

## Llaves foraneas

- `documento_id` → [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| documento_id | UNIQUEIDENTIFIER |
| modulo | NVARCHAR(50) |
| entidad | NVARCHAR(50) |
| registro_id | UNIQUEIDENTIFIER |
| etiqueta | NVARCHAR(200) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/organizacion/documentos`
- **Endpoints:** DocumentosController, PlantillasController
- **Servicios:** DocumentosService, PlantillasService

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

- [[entity--documento-relacion|DocumentoRelacion]] `persisted_in` →
- [[service--documentos-documentos|DocumentosService]] `reads` →
- [[service--documentos-plantillas|PlantillasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
