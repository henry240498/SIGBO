---
id: table--academia-cursos-externos-cache
tipo: TABLE
nombre: academia.cursos_externos_cache
nivel: L2
dominio: academia
resumen: Tabla academia.cursos_externos_cache (8 columnas). Creada en 040_academia_cursos_externos_cache.sql.
tabla: cursos_externos_cache
archivos:
  - database/migrations/040_academia_cursos_externos_cache.sql
edges:
  - [defined_in, file--040-academia-cursos-externos-cache]
  - [belongs_to, domain--academia]
terminos: [academia, cursos, externos, cache, titulo, url, imagen, categoria, duracion, texto, fuente, actualizado]
---

# academia.cursos_externos_cache

Tabla academia.cursos_externos_cache (8 columnas). Creada en 040_academia_cursos_externos_cache.sql.

- **Esquema:** academia · **Columnas:** 8
- **UNIQUE:** `url`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| titulo | NVARCHAR(300) |
| url | NVARCHAR(500) |
| imagen_url | NVARCHAR(500) |
| categoria | NVARCHAR(150) |
| duracion_texto | NVARCHAR(100) |
| fuente | NVARCHAR(100) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/finanzas/beneficios`, `/dashboard/personal/[id]`
- **Endpoints:** CursosExternosController
- **Servicios:** CursosExternosService, IaToolsService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/040_academia_cursos_externos_cache.sql`

## Relaciones

- `defined_in` → [[file--040-academia-cursos-externos-cache|040_academia_cursos_externos_cache.sql]]
- `belongs_to` → [[domain--academia|Academia]]

## Referenciado por

- [[entity--curso-externo-cache|CursoExternoCache]] `persisted_in` →
- [[service--academia-cursos-externos|CursosExternosService]] `reads` →
- [[service--ia-ia-tools|IaToolsService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
