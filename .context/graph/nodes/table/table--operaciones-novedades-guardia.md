---
id: table--operaciones-novedades-guardia
tipo: TABLE
nombre: operaciones.novedades_guardia
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.novedades_guardia (6 columnas). Creada en 025_guardias.sql.
tabla: novedades_guardia
archivos:
  - database/migrations/025_guardias.sql
edges:
  - [defined_in, file--025-guardias]
  - [belongs_to, domain--asistencia]
  - [references, table--operaciones-guardias]
  - [references, table--personal-bomberos]
terminos: [operaciones, novedades, guardia, fecha, hora, bombero, texto, creado]
---

# operaciones.novedades_guardia

Tabla operaciones.novedades_guardia (6 columnas). Creada en 025_guardias.sql.

- **Esquema:** operaciones · **Columnas:** 6

## Llaves foraneas

- `guardia_id` → [[table--operaciones-guardias|operaciones.guardias]]
- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| guardia_id | UNIQUEIDENTIFIER |
| fecha_hora | DATETIMEOFFSET(3) |
| bombero_id | UNIQUEIDENTIFIER |
| texto | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** BitacoraController, NovedadesController
- **Servicios:** BitacoraService, NovedadesService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/025_guardias.sql`

## Relaciones

- `defined_in` → [[file--025-guardias|025_guardias.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--operaciones-guardias|operaciones.guardias]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[entity--novedad-guardia|NovedadGuardia]] `persisted_in` →
- [[service--guardias-bitacora|BitacoraService]] `reads` →
- [[service--guardias-novedades|NovedadesService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
