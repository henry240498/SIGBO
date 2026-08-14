---
id: table--operaciones-importaciones-marcador-filas
tipo: TABLE
nombre: operaciones.importaciones_marcador_filas
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.importaciones_marcador_filas (12 columnas). Creada en 020_asistencia.sql.
tabla: importaciones_marcador_filas
archivos:
  - database/migrations/020_asistencia.sql
edges:
  - [defined_in, file--020-asistencia]
  - [belongs_to, domain--asistencia]
  - [references, table--operaciones-importaciones-marcador]
  - [references, table--personal-bomberos]
terminos: [operaciones, importaciones, marcador, filas, importacion, hoja, excel, fila, dato, original, codigo, detectado, bombero, resuelto, tipo, marcacion, timestamp, estado, motivo, generada]
---

# operaciones.importaciones_marcador_filas

Tabla operaciones.importaciones_marcador_filas (12 columnas). Creada en 020_asistencia.sql.

- **Esquema:** operaciones · **Columnas:** 12

## Llaves foraneas

- `importacion_id` → [[table--operaciones-importaciones-marcador|operaciones.importaciones_marcador]]
- `bombero_id_resuelto` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| importacion_id | UNIQUEIDENTIFIER |
| hoja_excel | NVARCHAR(100) |
| fila_excel | INT |
| dato_original | NVARCHAR(MAX) |
| codigo_detectado | NVARCHAR(50) |
| bombero_id_resuelto | UNIQUEIDENTIFIER |
| tipo_marcacion_detectado | NVARCHAR(20) |
| timestamp_detectado | DATETIMEOFFSET(3) |
| estado_fila | NVARCHAR(20) |
| motivo | NVARCHAR(MAX) |
| marcacion_id_generada | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`
- **Endpoints:** ImportacionesController
- **Servicios:** ImportacionesService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/020_asistencia.sql`

## Relaciones

- `defined_in` → [[file--020-asistencia|020_asistencia.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--operaciones-importaciones-marcador|operaciones.importaciones_marcador]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[entity--importacion-marcador-fila|ImportacionMarcadorFila]] `persisted_in` →
- [[service--operaciones-importaciones|ImportacionesService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
