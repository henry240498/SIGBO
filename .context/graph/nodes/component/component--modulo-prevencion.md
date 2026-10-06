---
id: component--modulo-prevencion
tipo: COMPONENT
nombre: prevencion (modulo NestJS)
nivel: L1
dominio: servicios
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de prevencion.
capa: backend
archivos:
  - backend/src/modules/prevencion/prevencion.module.ts
edges:
  - [belongs_to, domain--servicios]
terminos: [prevencion, modulo]
---

# prevencion (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de prevencion.


## Archivos

- `backend/src/modules/prevencion/prevencion.module.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[service--prevencion-prevencion|PrevencionService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
