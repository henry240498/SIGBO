---
id: component--modulo-centro-mando
tipo: COMPONENT
nombre: centro-mando (modulo NestJS)
nivel: L1
dominio: seguridad
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de centro-mando.
capa: backend
archivos:
  - backend/src/modules/centro-mando/centro-mando.module.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [centro, mando, modulo]
---

# centro-mando (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de centro-mando.


## Archivos

- `backend/src/modules/centro-mando/centro-mando.module.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[service--centro-mando-centro-mando|CentroMandoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
