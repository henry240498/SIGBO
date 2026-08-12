---
id: service--personal-idiomas
tipo: SERVICE
nombre: IdiomasService
nivel: L2
dominio: personal
resumen: Logica de negocio de idiomas (modulo personal).
capa: backend
archivos:
  - backend/src/modules/personal/idiomas.service.ts
edges:
  - [belongs_to, domain--personal]
  - [uses, component--modulo-personal]
  - [uses, entity--idioma-bombero]
  - [reads, table--personal-idiomas-bombero]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
terminos: [idiomas, personal, idioma, bombero, parametro]
---

# IdiomasService

Logica de negocio de idiomas (modulo personal).


## Metodos

`listar()` · `reemplazar()`

## Archivos

- `backend/src/modules/personal/idiomas.service.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--modulo-personal|personal (modulo NestJS)]]
- `uses` → [[entity--idioma-bombero|IdiomaBombero]]
- `reads` → [[table--personal-idiomas-bombero|personal.idiomas_bombero]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[api--personal-idiomas|IdiomasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
