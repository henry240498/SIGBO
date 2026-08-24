---
id: table--documentos-numeraciones
tipo: TABLE
nombre: documentos.numeraciones
nivel: L2
dominio: documentos
resumen: Tabla documentos.numeraciones (18 columnas). Creada en 052_documentos_estructura.sql, modificada por 069_documentos_numeracion_avanzada.sql.
tabla: numeraciones
archivos:
  - database/migrations/052_documentos_estructura.sql
  - database/migrations/069_documentos_numeracion_avanzada.sql
edges:
  - [defined_in, file--052-documentos-estructura]
  - [belongs_to, domain--documentos]
  - [references, table--organizacion-parametros]
terminos: [documentos, numeraciones, tipo, documento, anio, institucion, ultimo, numero, mes, actual, desde, hasta, fecha, vigencia, creado, actualizado]
---

# documentos.numeraciones

Tabla documentos.numeraciones (18 columnas). Creada en 052_documentos_estructura.sql, modificada por 069_documentos_numeracion_avanzada.sql.

- **Esquema:** documentos · **Columnas:** 18
- **UNIQUE:** `tipo_documento_id, anio, institucion_id`

## Llaves foraneas

- `tipo_documento_id` → [[table--organizacion-parametros|organizacion.parametros]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo_documento_id | UNIQUEIDENTIFIER |
| anio | INT |
| institucion_id | UNIQUEIDENTIFIER |
| ultimo_numero | INT |
| mes_actual | INT |
| anio_desde | INT |
| mes_desde | INT |
| numero_desde | INT |
| anio_hasta | INT |
| mes_hasta | INT |
| numero_hasta | INT |
| fecha_vigencia_desde | DATE |
| fecha_vigencia_hasta | DATE |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_en | DATETIMEOFFSET(3) |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/organizacion/documentos`
- **Endpoints:** DocumentosController
- **Servicios:** DocumentosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/052_documentos_estructura.sql`
- `database/migrations/069_documentos_numeracion_avanzada.sql`

## Relaciones

- `defined_in` → [[file--052-documentos-estructura|052_documentos_estructura.sql]]
- `belongs_to` → [[domain--documentos|Documentos]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[entity--numeracion-documento|NumeracionDocumento]] `persisted_in` →
- [[service--documentos-documentos|DocumentosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
