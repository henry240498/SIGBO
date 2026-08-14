---
id: table--contenido-publicaciones
tipo: TABLE
nombre: contenido.publicaciones
nivel: L2
dominio: publicaciones
<<<<<<< Updated upstream
resumen: Tabla contenido.publicaciones (12 columnas). Creada en 026_publicaciones_persistencia.sql, modificada por 026_publicaciones_persistencia.sql.
tabla: publicaciones
archivos:
  - database/migrations/026_publicaciones_persistencia.sql
edges:
  - [defined_in, file--026-publicaciones-persistencia]
=======
resumen: Tabla contenido.publicaciones (12 columnas). Creada en 023_publicaciones_persistencia.sql.
tabla: publicaciones
archivos:
  - database/migrations/023_publicaciones_persistencia.sql
edges:
  - [defined_in, file--023-publicaciones-persistencia]
>>>>>>> Stashed changes
  - [belongs_to, domain--publicaciones]
terminos: [contenido, publicaciones, seccion, estado, visible, destacada, orden, fecha, publicar, caducar, json, creado, actualizado]
---

# contenido.publicaciones

<<<<<<< Updated upstream
Tabla contenido.publicaciones (12 columnas). Creada en 026_publicaciones_persistencia.sql, modificada por 026_publicaciones_persistencia.sql.
=======
Tabla contenido.publicaciones (12 columnas). Creada en 023_publicaciones_persistencia.sql.
>>>>>>> Stashed changes

- **Esquema:** contenido · **Columnas:** 12

## Restricciones CHECK (reglas que la BD impone)

<<<<<<< Updated upstream
- `ISJSON(contenido_json)=1)'`
=======
- `ISJSON(contenidoJson)=1`
>>>>>>> Stashed changes

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| seccion | NVARCHAR(30) |
| estado | NVARCHAR(20) |
| visible | BIT |
| destacada | BIT |
| orden | INT |
| fecha | DATE |
<<<<<<< Updated upstream
| publicar_en | DATETIMEOFFSET |
| caducar_en | DATETIMEOFFSET |
| contenido_json | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET |
| actualizado_en | DATETIMEOFFSET |

## Archivos

- `database/migrations/026_publicaciones_persistencia.sql`

## Relaciones

- `defined_in` → [[file--026-publicaciones-persistencia|026_publicaciones_persistencia.sql]]
=======
| publicarEn | DATETIMEOFFSET(3) |
| caducarEn | DATETIMEOFFSET(3) |
| contenidoJson | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/023_publicaciones_persistencia.sql`

## Relaciones

- `defined_in` → [[file--023-publicaciones-persistencia|023_publicaciones_persistencia.sql]]
>>>>>>> Stashed changes
- `belongs_to` → [[domain--publicaciones|Publicaciones]]

## Referenciado por

- [[entity--publicacion|Publicacion]] `persisted_in` →
- [[service--publicaciones-publicaciones|PublicacionesService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
