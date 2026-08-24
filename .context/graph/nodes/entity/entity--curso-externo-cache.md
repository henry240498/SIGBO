---
id: entity--curso-externo-cache
tipo: ENTITY
nombre: CursoExternoCache
nivel: L1
dominio: academia
resumen: Cache de solo lectura de cursos publicos listados en OBA/Thinkific (seccion 19-24 del pedido). SIGBO nunca inicia sesion en el sitio externo ni guarda datos de inscripcion/progreso/certificado individual -- solo lo que ya es publico en la pagina de coleccion de cursos.
tabla: academia.cursos_externos_cache
archivos:
  - backend/src/shared/entities/curso-externo-cache.entity.ts
edges:
  - [belongs_to, domain--academia]
  - [persisted_in, table--academia-cursos-externos-cache]
terminos: [curso, externo, cache, cursos, externos, academia]
---

# CursoExternoCache

Cache de solo lectura de cursos publicos listados en OBA/Thinkific (seccion 19-24 del pedido). SIGBO nunca inicia sesion en el sitio externo ni guarda datos de inscripcion/progreso/certificado individual -- solo lo que ya es publico en la pagina de coleccion de cursos.

- **Tabla:** [[table--academia-cursos-externos-cache|academia.cursos_externos_cache]]
- **Columnas mapeadas:** 7

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/finanzas/beneficios`, `/dashboard/personal/[id]`
- **Endpoints:** CursosExternosController
- **Servicios:** CursosExternosService, IaToolsService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/curso-externo-cache.entity.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `persisted_in` → [[table--academia-cursos-externos-cache|academia.cursos_externos_cache]]

## Referenciado por

- [[service--academia-cursos-externos|CursosExternosService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
