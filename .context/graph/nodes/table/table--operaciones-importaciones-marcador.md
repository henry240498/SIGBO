---
id: table--operaciones-importaciones-marcador
tipo: TABLE
nombre: operaciones.importaciones_marcador
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.importaciones_marcador (15 columnas). Creada en 020_asistencia.sql.
tabla: importaciones_marcador
archivos:
  - database/migrations/020_asistencia.sql
edges:
  - [defined_in, file--020-asistencia]
  - [belongs_to, domain--asistencia]
terminos: [operaciones, importaciones, marcador, archivo, nombre, hash, url, usuario, fecha, importacion, hojas, encontradas, registros, encontrados, reconocidos, identificados, duplicados, inconsistencias, importados, estado, institucion]
---

# operaciones.importaciones_marcador

Tabla operaciones.importaciones_marcador (15 columnas). Creada en 020_asistencia.sql.

- **Esquema:** operaciones · **Columnas:** 15
- **UNIQUE:** `archivo_hash`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| archivo_nombre | NVARCHAR(255) |
| archivo_hash | CHAR(64) |
| archivo_url | NVARCHAR(MAX) |
| usuario_id | UNIQUEIDENTIFIER |
| fecha_importacion | DATETIMEOFFSET(3) |
| hojas_encontradas | INT |
| registros_encontrados | INT |
| registros_reconocidos | INT |
| registros_no_identificados | INT |
| registros_duplicados | INT |
| registros_con_inconsistencias | INT |
| registros_importados | INT |
| estado | NVARCHAR(20) |
| institucion_id | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/academia/[id]`, `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`
- **Endpoints:** ImportacionesController
- **Servicios:** ImportacionesService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/020_asistencia.sql`

## Relaciones

- `defined_in` → [[file--020-asistencia|020_asistencia.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]

## Referenciado por

- [[table--operaciones-importaciones-marcador-filas|operaciones.importaciones_marcador_filas]] `references` →
- [[entity--importacion-marcador|ImportacionMarcador]] `persisted_in` →
- [[service--operaciones-importaciones|ImportacionesService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
