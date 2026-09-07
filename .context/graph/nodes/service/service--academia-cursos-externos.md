---
id: service--academia-cursos-externos
tipo: SERVICE
nombre: CursosExternosService
nivel: L2
dominio: academia
resumen: "Lee la coleccion PUBLICA de cursos de OBA/Thinkific y la deja en cache local (secciones 19-24 del pedido). Nunca inicia sesion, nunca consulta datos de un usuario particular -- solo la pagina publica de catalogo. Si el sitio cambia de estructura o no responde, no rompe: deja el cache anterior intacto y reporta el error."
capa: backend
archivos:
  - backend/src/modules/academia/cursos-externos.service.ts
edges:
  - [belongs_to, domain--academia]
  - [uses, component--modulo-academia]
  - [uses, entity--curso-externo-cache]
  - [reads, table--academia-cursos-externos-cache]
terminos: [cursos, externos, academia, curso, externo, cache]
---

# CursosExternosService

Lee la coleccion PUBLICA de cursos de OBA/Thinkific y la deja en cache local (secciones 19-24 del pedido). Nunca inicia sesion, nunca consulta datos de un usuario particular -- solo la pagina publica de catalogo. Si el sitio cambia de estructura o no responde, no rompe: deja el cache anterior intacto y reporta el error.


## Metodos

`listar()` · `refrescar()`

## Archivos

- `backend/src/modules/academia/cursos-externos.service.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `uses` → [[component--modulo-academia|academia (modulo NestJS)]]
- `uses` → [[entity--curso-externo-cache|CursoExternoCache]]
- `reads` → [[table--academia-cursos-externos-cache|academia.cursos_externos_cache]]

## Referenciado por

- [[api--academia-cursos-externos|CursosExternosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
