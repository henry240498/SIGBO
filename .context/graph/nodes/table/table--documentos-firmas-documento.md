---
id: table--documentos-firmas-documento
tipo: TABLE
nombre: documentos.firmas_documento
nivel: L2
dominio: documentos
resumen: Tabla documentos.firmas_documento (12 columnas). Creada en 055_documentos_firmas.sql.
tabla: firmas_documento
archivos:
  - database/migrations/055_documentos_firmas.sql
edges:
  - [defined_in, file--055-documentos-firmas]
  - [belongs_to, domain--documentos]
  - [references, table--documentos-documentos-institucionales]
  - [references, table--organizacion-cargos]
  - [references, table--personal-bomberos]
  - [references, table--seguridad-usuarios]
terminos: [documentos, firmas, documento, orden, cargo, firmante, bombero, etiqueta, rol, firmado, firma, url, fecha, observacion, creado]
---

# documentos.firmas_documento

Tabla documentos.firmas_documento (12 columnas). Creada en 055_documentos_firmas.sql.

- **Esquema:** documentos · **Columnas:** 12

## Restricciones CHECK (reglas que la BD impone)

- `(cargo_firmante_id IS NOT NULL AND bombero_firmante_id IS NULL) OR (cargo_firmante_id IS NULL AND bombero_firmante_id IS NOT NULL`

## Llaves foraneas

- `documento_id` → [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]]
- `cargo_firmante_id` → [[table--organizacion-cargos|organizacion.cargos]]
- `bombero_firmante_id` → [[table--personal-bomberos|personal.bomberos]]
- `firmado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| documento_id | UNIQUEIDENTIFIER |
| orden | INT |
| cargo_firmante_id | UNIQUEIDENTIFIER |
| bombero_firmante_id | UNIQUEIDENTIFIER |
| etiqueta_rol | NVARCHAR(150) |
| firmado | BIT |
| firma_url | NVARCHAR(MAX) |
| fecha_firma | DATETIMEOFFSET(3) |
| firmado_por | UNIQUEIDENTIFIER |
| observacion | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/organizacion/documentos`
- **Endpoints:** FirmasDocumentoController, PlantillasController
- **Servicios:** FirmasDocumentoService, PlantillasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/055_documentos_firmas.sql`

## Relaciones

- `defined_in` → [[file--055-documentos-firmas|055_documentos_firmas.sql]]
- `belongs_to` → [[domain--documentos|Documentos]]
- `references` → [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]]
- `references` → [[table--organizacion-cargos|organizacion.cargos]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--firma-documento|FirmaDocumento]] `persisted_in` →
- [[service--documentos-firmas-documento|FirmasDocumentoService]] `reads` →
- [[service--documentos-plantillas|PlantillasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
